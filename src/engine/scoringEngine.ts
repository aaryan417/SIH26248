import {
  AARReport,
  CommunicationMessage,
  Decision,
  DecisionPrompt,
  ExerciseSession,
  SessionEvent,
} from '../types';

export interface TimelineSample {
  time: string;
  scenarioTimeMs: number;
  signal: number;
  latency: number;
}

export class ScoringEngine {
  public static generateAARReport(
    session: ExerciseSession,
    eventLogs: SessionEvent[],
    messages: CommunicationMessage[],
    decisions: Decision[],
    prompts: DecisionPrompt[]
  ): AARReport {
    // 1. Message Counts
    const totalMessages = messages.length;
    const deliveredCount = messages.filter(
      (m) => m.status === 'DELIVERED' || m.status === 'CONFLICTING'
    ).length;
    const delayedCount = messages.filter(
      (m) => m.status === 'DELAYED' || (m.delayMs && m.delayMs > 0)
    ).length;
    const droppedCount = messages.filter((m) => m.status === 'DROPPED').length;

    // 2. Communication Reliability %
    const commReliabilityPercent =
      totalMessages > 0 ? Math.round((deliveredCount / totalMessages) * 100) : 100;

    // 3. Information Availability %
    const infoAvailabilityPercent =
      totalMessages > 0
        ? Math.min(100, Math.round(((deliveredCount + delayedCount * 0.5) / totalMessages) * 100))
        : 100;

    // 4. Decision Response Times
    const totalResponseTime = decisions.reduce((acc, d) => acc + d.responseTimeSec, 0);
    const avgResponseTimeSec =
      decisions.length > 0 ? Math.round(totalResponseTime / decisions.length) : 0;

    // 5. Coordination & Acknowledgements
    const coordinationAttempts = eventLogs.filter(
      (e) =>
        e.type === 'TEAM_UPDATE' ||
        e.type === 'DECISION_SUBMITTED' ||
        e.type === 'COMMUNICATION_CONFLICT'
    ).length;

    const acknowledgementRatePercent =
      prompts.length > 0 ? Math.min(100, Math.round((decisions.length / prompts.length) * 100)) : 100;

    // 6. Decision Evaluations (Deterministic Quality Scoring)
    const promptMap = new Map(prompts.map((p) => [p.id, p]));

    const decisionsEvaluated = decisions.map((decision) => {
      const prompt = promptMap.get(decision.promptId) || {
        id: decision.promptId,
        timeMs: decision.presentedAtMs,
        title: 'Tactical Choice',
        context: 'Scenario tactical prompt',
        domain: 'LAND' as const,
        options: [],
        timeLimitSec: 45,
        requiredRationale: true,
      };

      const participant =
        session.participants.find((p) => p.id === decision.participantId) || session.participants[0];

      const infoState = decision.informationAvailableAtDecision;
      const rationaleText = decision.rationale.text.trim();
      const rationaleLength = rationaleText.length;

      // Speed Score (0-100): 100 at 0s, 0 at 60s
      const speedScore = Math.max(0, 100 - decision.responseTimeSec * 1.6);
      // Rationale Depth Score (0-100): 100 at 40 chars
      const rationaleScore = Math.min(100, rationaleLength * 2.5);
      // Information Awareness Bonus
      const infoBonus = infoState.missingCriticalMessages.length === 0 ? 100 : 40;

      const score = Math.round(speedScore * 0.3 + rationaleScore * 0.5 + infoBonus * 0.2);

      const infoAwareness: 'FULL' | 'PARTIAL' | 'SEVERE_DEPRIVATION' =
        infoState.missingCriticalMessages.length > 0
          ? 'SEVERE_DEPRIVATION'
          : infoState.conflictsPresent
          ? 'PARTIAL'
          : 'FULL';

      const rationaleDepth: 'STRONG' | 'ADEQUATE' | 'POOR' =
        rationaleLength >= 40 ? 'STRONG' : rationaleLength >= 15 ? 'ADEQUATE' : 'POOR';

      let keyInsight = 'Executed tactical choice based on available telemetry.';
      if (infoState.conflictsPresent) {
        keyInsight = 'Identified conflicting reports and requested out-of-band verification.';
      } else if (infoState.signalStrength < 45) {
        keyInsight = 'Decided under low RF spectrum signal strength (under 45%).';
      } else if (infoState.missingCriticalMessages.length > 0) {
        keyInsight = 'Made choice under missing critical intelligence conditions.';
      }

      return {
        decision,
        prompt,
        participant,
        qualityAssessment: {
          score,
          informationAwareness: infoAwareness,
          rationaleDepth: rationaleDepth,
          keyInsight,
        },
      };
    });

    // 7. Team Asymmetry Calculation (derived from received message counts)
    const participantMsgCounts = session.participants.map(
      (p) => p.informationState?.receivedMessageIds?.length || 0
    );
    const maxMsgs = Math.max(...participantMsgCounts, 1);
    const minMsgs = Math.min(...participantMsgCounts, 0);
    const asymmetryGapPercent = Math.round(((maxMsgs - minMsgs) / maxMsgs) * 100);

    // 8. Domain Sync Score (0-100 derived formula)
    const domainSyncScore = Math.max(
      0,
      Math.min(100, Math.round(100 - asymmetryGapPercent * 0.6 - droppedCount * 8))
    );

    return {
      sessionId: session.id,
      scenarioName: session.scenarioName,
      codeName: session.codeName,
      durationMs: session.currentScenarioTimeMs,
      startedAt: session.startedAt || new Date().toISOString(),
      endedAt: session.endedAt || new Date().toISOString(),
      participants: session.participants,
      metrics: {
        avgResponseTimeSec,
        messagesGenerated: totalMessages,
        messagesDelivered: deliveredCount,
        messagesDelayed: delayedCount,
        messagesDropped: droppedCount,
        commReliabilityPercent,
        infoAvailabilityPercent,
        coordinationAttempts,
        acknowledgementRatePercent,
      },
      timelineEvents: eventLogs,
      decisionsEvaluated,
      teamAnalytics: {
        asymmetryGapPercent,
        unacknowledgedCriticalAlerts: droppedCount,
        domainSyncScore,
      },
    };
  }

  // Generate dynamic chart data samples from actual SessionEvent[] timestamps
  public static buildChartData(eventLogs: SessionEvent[]): TimelineSample[] {
    const timelineSamples: TimelineSample[] = [];

    let currentSignal = 95;
    let currentLatency = 0;

    const formatT = (ms: number) => {
      const sec = Math.floor(ms / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `T+0${m}:${s < 10 ? '0' : ''}${s}`;
    };

    timelineSamples.push({
      time: 'T+00:00',
      scenarioTimeMs: 0,
      signal: 95,
      latency: 0,
    });

    eventLogs.forEach((evt) => {
      if (evt.type === 'EW_DEGRADATION') {
        if (evt.payload.signalStrength !== undefined) {
          currentSignal = evt.payload.signalStrength;
        }
        if (evt.payload.latencySec !== undefined) {
          currentLatency = evt.payload.latencySec;
        }
        timelineSamples.push({
          time: formatT(evt.scenarioTimeMs),
          scenarioTimeMs: evt.scenarioTimeMs,
          signal: currentSignal,
          latency: currentLatency,
        });
      }
    });

    if (timelineSamples.length === 1) {
      timelineSamples.push({
        time: 'T+02:00',
        scenarioTimeMs: 120000,
        signal: currentSignal,
        latency: currentLatency,
      });
    }

    return timelineSamples;
  }
}
