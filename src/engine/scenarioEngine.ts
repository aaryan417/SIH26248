import {
  CommunicationMessage,
  Decision,
  DecisionPrompt,
  DegradationState,
  ExerciseSession,
  Participant,
  Scenario,
  ScenarioEvent,
  SessionEvent,
} from '../types';
import { DegradationEngine } from './degradationEngine';
import { EventScheduler } from './eventScheduler';

export type EventLogCallback = (event: SessionEvent) => void;
export type StateChangeCallback = (session: ExerciseSession) => void;

export class ScenarioEngine {
  private scenario: Scenario;
  private session: ExerciseSession;
  private scheduler: EventScheduler;
  private degradationEngine: DegradationEngine;

  private pendingEventsQueue: ScenarioEvent[] = [];
  private eventLogs: SessionEvent[] = [];
  private activeMessages: CommunicationMessage[] = [];
  private activeDecisions: Map<string, DecisionPrompt> = new Map();
  private userDecisions: Decision[] = [];
  private forceDropNextMessage = false;

  private logCallbacks: Set<EventLogCallback> = new Set();
  private stateCallbacks: Set<StateChangeCallback> = new Set();

  constructor(scenario: Scenario, instructorId: string, initialParticipants: Participant[]) {
    this.scenario = scenario;
    this.degradationEngine = new DegradationEngine();
    this.scheduler = new EventScheduler();

    this.pendingEventsQueue = [...scenario.events].sort((a, b) => a.timeMs - b.timeMs);

    this.session = {
      id: `session-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      codeName: scenario.codeName,
      state: 'SETUP',
      elapsedTimeMs: 0,
      currentScenarioTimeMs: 0,
      instructorId,
      participants: initialParticipants,
      commStatus: this.degradationEngine.getStatus(),
    };

    // Register scheduler tick listener
    this.scheduler.subscribe((elapsedTimeMs) => {
      this.onTick(elapsedTimeMs);
    });
  }

  public start(): void {
    if (this.session.state === 'RUNNING') return;
    this.session.state = 'RUNNING';
    if (!this.session.startedAt) {
      this.session.startedAt = new Date().toISOString();
    }
    this.logEvent('SCENARIO_STARTED', { scenarioName: this.scenario.name });
    this.scheduler.start();
    this.notifyState();
  }

  public pause(): void {
    if (this.session.state !== 'RUNNING') return;
    this.session.state = 'PAUSED';
    this.scheduler.pause();
    this.logEvent('SCENARIO_PAUSED', { timeMs: this.session.currentScenarioTimeMs });
    this.notifyState();
  }

  public resume(): void {
    if (this.session.state !== 'PAUSED') return;
    this.session.state = 'RUNNING';
    this.scheduler.resume();
    this.logEvent('SCENARIO_RESUMED', { timeMs: this.session.currentScenarioTimeMs });
    this.notifyState();
  }

  public reset(): void {
    this.scheduler.reset();
    this.pendingEventsQueue = [...this.scenario.events].sort((a, b) => a.timeMs - b.timeMs);
    this.eventLogs = [];
    this.activeMessages = [];
    this.activeDecisions.clear();
    this.userDecisions = [];
    this.forceDropNextMessage = false;

    this.session.state = 'SETUP';
    this.session.elapsedTimeMs = 0;
    this.session.currentScenarioTimeMs = 0;
    this.session.commStatus = this.degradationEngine.updateState('NORMAL');

    this.logEvent('SCENARIO_RESET', {});
    this.notifyState();
  }

  public endExercise(): void {
    this.scheduler.pause();
    this.session.state = 'COMPLETED';
    this.session.endedAt = new Date().toISOString();
    this.logEvent('SCENARIO_END', { summary: 'Exercise manually or automatically completed.' });
    this.notifyState();
  }

  // --- Instructor Controls ---

  public setDegradationState(newState: DegradationState): void {
    const updatedStatus = this.degradationEngine.updateState(newState);
    this.session.commStatus = updatedStatus;
    this.logEvent('EW_DEGRADATION', {
      state: newState,
      signalStrength: updatedStatus.signalStrength,
      latencySec: updatedStatus.artificialDelaySec,
      lossProbability: updatedStatus.messageLossRate,
    });

    // Update participants connection status
    this.session.participants = this.session.participants.map((p) => ({
      ...p,
      signalStrength: updatedStatus.signalStrength,
      connectionStatus:
        newState === 'DISCONNECTED'
          ? 'DISCONNECTED'
          : newState === 'DEGRADED' || newState === 'SEVERELY_DEGRADED'
          ? 'DEGRADED'
          : 'CONNECTED',
    }));

    this.notifyState();
  }

  public setArtificialDelay(seconds: number): void {
    this.degradationEngine.setArtificialDelay(seconds);
    this.session.commStatus = this.degradationEngine.getStatus();
    this.logEvent('COMMUNICATION_DELAY', { delaySec: seconds });
    this.notifyState();
  }

  public setMessageLossRate(rate: number): void {
    this.degradationEngine.setMessageLossRate(rate);
    this.session.commStatus = this.degradationEngine.getStatus();
    this.logEvent('COMMUNICATION_DROPOUT', { lossRate: rate });
    this.notifyState();
  }

  public dropNextMessage(): void {
    this.forceDropNextMessage = true;
    this.logEvent('COMMUNICATION_DROPOUT', { manualDropNext: true });
  }

  public injectConflict(sender: string, subject: string, content: string, originalReport: string): void {
    const timeMs = this.session.currentScenarioTimeMs;
    const msg: CommunicationMessage = {
      id: `msg-conflict-${Date.now()}`,
      sender,
      recipient: 'ALL',
      generatedAtMs: timeMs,
      deliveredAtMs: timeMs + 1000,
      status: 'CONFLICTING',
      confidence: 50,
      channel: 'HF_RADIO',
      domain: 'LAND',
      subject,
      content,
      isConflicting: true,
      originalReport,
    };

    this.activeMessages.push(msg);
    this.updateParticipantsForMessage(msg);
    this.logEvent('COMMUNICATION_CONFLICT', {
      messageId: msg.id,
      subject,
      content,
      isConflicting: true,
    });
    this.notifyState();
  }

  public submitTraineeDecision(
    promptId: string,
    participantId: string,
    selectedOptionId: string,
    rationaleText: string,
    confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Decision {
    const prompt = this.activeDecisions.get(promptId);
    const timeMs = this.session.currentScenarioTimeMs;

    const presentedAtMs = prompt?.timeMs || timeMs - 15000;
    const responseTimeSec = Math.round((timeMs - presentedAtMs) / 1000);

    const receivedMessageIds = this.activeMessages
      .filter((m) => m.status === 'DELIVERED' || m.status === 'CONFLICTING')
      .map((m) => m.id);

    const decision: Decision = {
      id: `dec-sub-${Date.now()}`,
      promptId,
      sessionId: this.session.id,
      participantId,
      selectedOptionId,
      rationale: {
        text: rationaleText,
        confidenceLevel,
        assumedFactors: ['Received spectrum telemetry', 'Ground reconnaissance input'],
      },
      presentedAtMs,
      submittedAtMs: timeMs,
      responseTimeSec,
      informationAvailableAtDecision: {
        messagesReceived: receivedMessageIds,
        commStatusState: this.session.commStatus.state,
        signalStrength: this.session.commStatus.signalStrength,
        conflictsPresent: this.activeMessages.some((m) => m.isConflicting),
        missingCriticalMessages: this.activeMessages.filter((m) => m.status === 'DROPPED').map((m) => m.id),
      },
    };

    this.userDecisions.push(decision);
    this.activeDecisions.delete(promptId);

    // Update participant decision status
    this.session.participants = this.session.participants.map((p) =>
      p.id === participantId
        ? {
            ...p,
            pendingDecisionId: undefined,
            lastAction: `Submitted decision ${selectedOptionId} in ${responseTimeSec}s`,
          }
        : p
    );

    this.logEvent('DECISION_SUBMITTED', {
      promptId,
      participantId,
      selectedOptionId,
      responseTimeSec,
      rationale: rationaleText,
    });

    this.notifyState();
    return decision;
  }

  // --- Engine Internal Ticks ---

  private onTick(elapsedTimeMs: number): void {
    this.session.currentScenarioTimeMs = elapsedTimeMs;
    this.session.elapsedTimeMs = elapsedTimeMs;

    // Process pending scheduled events
    while (
      this.pendingEventsQueue.length > 0 &&
      this.pendingEventsQueue[0].timeMs <= elapsedTimeMs
    ) {
      const eventToDispatch = this.pendingEventsQueue.shift()!;
      this.dispatchEvent(eventToDispatch);
    }

    // Process active delayed messages
    this.activeMessages.forEach((msg) => {
      if (msg.status === 'DELAYED' && msg.deliveredAtMs && msg.deliveredAtMs <= elapsedTimeMs) {
        msg.status = 'DELIVERED';
        this.logEvent('COMMUNICATION_MESSAGE', {
          messageId: msg.id,
          deliveredAtMs: elapsedTimeMs,
          status: 'DELIVERED',
          subject: msg.subject,
        });
        this.updateParticipantsForMessage(msg);
      }
    });

    this.notifyState();
  }

  private dispatchEvent(event: ScenarioEvent): void {
    switch (event.type) {
      case 'COMMUNICATION_MESSAGE': {
        const rawMsg = event.payload;
        const processed = this.degradationEngine.processOutgoingMessage(
          {
            id: rawMsg.messageId || `msg-${Date.now()}`,
            sender: rawMsg.sender || 'COMMAND',
            recipient: rawMsg.recipient || 'ALL',
            generatedAtMs: event.timeMs,
            confidence: rawMsg.confidence || 90,
            channel: rawMsg.channel || 'HF_RADIO',
            domain: rawMsg.domain || 'LAND',
            subject: rawMsg.subject || 'Telemetry Update',
            content: rawMsg.content || '',
          },
          event.timeMs,
          this.forceDropNextMessage
        );

        this.forceDropNextMessage = false;
        this.activeMessages.push(processed);

        if (processed.status === 'DELIVERED') {
          this.updateParticipantsForMessage(processed);
        } else if (processed.status === 'DROPPED') {
          this.updateParticipantsForDroppedMessage(processed);
        }

        this.logEvent(event.type, {
          ...event.payload,
          messageId: processed.id,
          status: processed.status,
          deliveredAtMs: processed.deliveredAtMs,
        });
        break;
      }

      case 'EW_DEGRADATION':
      case 'COMMUNICATION_DELAY':
      case 'COMMUNICATION_DROPOUT': {
        if (event.payload.state) {
          this.setDegradationState(event.payload.state);
        }
        this.logEvent(event.type, event.payload);
        break;
      }

      case 'DECISION_REQUIRED': {
        const prompt: DecisionPrompt = event.payload.prompt;
        this.activeDecisions.set(prompt.id, prompt);
        this.session.participants = this.session.participants.map((p) => ({
          ...p,
          pendingDecisionId: prompt.id,
          lastAction: `Decision required: ${prompt.title}`,
        }));

        this.logEvent('DECISION_REQUIRED', {
          promptId: prompt.id,
          title: prompt.title,
          optionsCount: prompt.options.length,
          timeLimitSec: prompt.timeLimitSec,
        });
        break;
      }

      case 'SCENARIO_END': {
        this.endExercise();
        break;
      }

      default: {
        this.logEvent(event.type, event.payload);
        break;
      }
    }
  }

  private updateParticipantsForMessage(msg: CommunicationMessage): void {
    this.session.participants = this.session.participants.map((p) => {
      const isTarget = msg.recipient === 'ALL' || msg.recipient === p.callsign || msg.recipient === p.id;
      if (!isTarget) return p;

      const received = new Set(p.informationState.receivedMessageIds);
      received.add(msg.id);
      return {
        ...p,
        messagesReceivedCount: p.messagesReceivedCount + 1,
        informationState: {
          ...p.informationState,
          receivedMessageIds: Array.from(received),
        },
      };
    });
  }

  private updateParticipantsForDroppedMessage(msg: CommunicationMessage): void {
    this.session.participants = this.session.participants.map((p) => {
      const isTarget = msg.recipient === 'ALL' || msg.recipient === p.callsign || msg.recipient === p.id;
      if (!isTarget) return p;

      const dropped = new Set(p.informationState.droppedMessageIds);
      dropped.add(msg.id);
      return {
        ...p,
        messagesMissedCount: p.messagesMissedCount + 1,
        informationState: {
          ...p.informationState,
          droppedMessageIds: Array.from(dropped),
        },
      };
    });
  }

  private logEvent(type: string, payload: Record<string, any>): void {
    const sessionEvt: SessionEvent = {
      id: `evt-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId: this.session.id,
      type,
      timestamp: new Date().toISOString(),
      scenarioTimeMs: this.session.currentScenarioTimeMs,
      payload,
    };
    this.eventLogs.push(sessionEvt);
    this.logCallbacks.forEach((cb) => cb(sessionEvt));
  }

  // --- Getters & Subscriptions ---

  public getSession(): ExerciseSession {
    return { ...this.session };
  }

  public getEventLogs(): SessionEvent[] {
    return [...this.eventLogs];
  }

  public getActiveMessages(): CommunicationMessage[] {
    return [...this.activeMessages];
  }

  public getActiveDecisions(): DecisionPrompt[] {
    return Array.from(this.activeDecisions.values());
  }

  public getUserDecisions(): Decision[] {
    return [...this.userDecisions];
  }

  public subscribeState(callback: StateChangeCallback): () => void {
    this.stateCallbacks.add(callback);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  public subscribeLogs(callback: EventLogCallback): () => void {
    this.logCallbacks.add(callback);
    return () => {
      this.logCallbacks.delete(callback);
    };
  }

  private notifyState(): void {
    const currentSession = this.getSession();
    this.stateCallbacks.forEach((cb) => cb(currentSession));
  }
}
