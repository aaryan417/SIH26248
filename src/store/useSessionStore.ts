import { create } from 'zustand';
import { ScenarioEngine } from '../engine/scenarioEngine';
import { MOCK_INITIAL_PARTICIPANTS } from '../mocks/fixtures';
import { sessionService } from '../services/api/sessionService';
import {
  CommunicationMessage,
  CommunicationStatus,
  Decision,
  DecisionPrompt,
  DegradationState,
  ExerciseSession,
  Scenario,
  SessionEvent,
} from '../types';

interface SessionState {
  currentSession: ExerciseSession | null;
  activeScenario: Scenario | null;
  engine: ScenarioEngine | null;
  commStatus: CommunicationStatus | null;
  eventLogs: SessionEvent[];
  activeMessages: CommunicationMessage[];
  pendingDecisions: DecisionPrompt[];
  submittedDecisions: Decision[];
  isLoading: boolean;
  error: string | null;

  initializeSession: (scenario: Scenario, instructorId: string) => Promise<ExerciseSession>;
  startExercise: () => void;
  pauseExercise: () => void;
  resumeExercise: () => void;
  resetExercise: () => void;
  endExercise: () => void;

  setDegradationState: (state: DegradationState) => void;
  setArtificialDelay: (seconds: number) => void;
  setMessageLossRate: (rate: number) => void;
  dropNextMessage: () => void;
  injectConflict: (sender: string, subject: string, content: string, originalReport: string) => void;
  submitDecision: (
    promptId: string,
    participantId: string,
    selectedOptionId: string,
    rationale: string,
    confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => void;

  initializeDemoMode: () => Promise<ExerciseSession>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  activeScenario: null,
  engine: null,
  commStatus: null,
  eventLogs: [],
  activeMessages: [],
  pendingDecisions: [],
  submittedDecisions: [],
  isLoading: false,
  error: null,

  initializeSession: async (scenario: Scenario, instructorId: string) => {
    set({ isLoading: true, error: null, activeScenario: scenario });
    try {
      const session = await sessionService.createSession({
        scenarioId: scenario.id,
        instructorId,
        participants: MOCK_INITIAL_PARTICIPANTS,
      });

      const engine = sessionService.getEngine(session.id);
      if (!engine) {
        throw new Error('Failed to instantiate scenario engine.');
      }

      // Sync state changes from engine to store
      engine.subscribeState((updatedSession) => {
        set({
          currentSession: updatedSession,
          commStatus: updatedSession.commStatus,
          pendingDecisions: engine.getActiveDecisions(),
          activeMessages: engine.getActiveMessages(),
          submittedDecisions: engine.getUserDecisions(),
        });
      });

      engine.subscribeLogs((newLog) => {
        set((state) => ({ eventLogs: [newLog, ...state.eventLogs] }));
      });

      set({
        currentSession: session,
        engine,
        commStatus: session.commStatus,
        eventLogs: engine.getEventLogs(),
        activeMessages: engine.getActiveMessages(),
        pendingDecisions: engine.getActiveDecisions(),
        submittedDecisions: engine.getUserDecisions(),
        isLoading: false,
      });

      return session;
    } catch (e: any) {
      set({ error: e.message || 'Error starting exercise session', isLoading: false });
      throw e;
    }
  },

  startExercise: () => {
    const { engine } = get();
    if (engine) engine.start();
  },

  pauseExercise: () => {
    const { engine } = get();
    if (engine) engine.pause();
  },

  resumeExercise: () => {
    const { engine } = get();
    if (engine) engine.resume();
  },

  resetExercise: () => {
    const { engine } = get();
    if (engine) {
      engine.reset();
      set({ eventLogs: [], activeMessages: [], pendingDecisions: [], submittedDecisions: [] });
    }
  },

  endExercise: () => {
    const { engine } = get();
    if (engine) engine.endExercise();
  },

  setDegradationState: (state: DegradationState) => {
    const { engine } = get();
    if (engine) engine.setDegradationState(state);
  },

  setArtificialDelay: (seconds: number) => {
    const { engine } = get();
    if (engine) engine.setArtificialDelay(seconds);
  },

  setMessageLossRate: (rate: number) => {
    const { engine } = get();
    if (engine) engine.setMessageLossRate(rate);
  },

  dropNextMessage: () => {
    const { engine } = get();
    if (engine) engine.dropNextMessage();
  },

  injectConflict: (sender: string, subject: string, content: string, originalReport: string) => {
    const { engine } = get();
    if (engine) engine.injectConflict(sender, subject, content, originalReport);
  },

  submitDecision: (
    promptId: string,
    participantId: string,
    selectedOptionId: string,
    rationale: string,
    confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => {
    const { engine } = get();
    if (engine) {
      engine.submitTraineeDecision(promptId, participantId, selectedOptionId, rationale, confidence);
    }
  },

  initializeDemoMode: async () => {
    const demoScenario = (await import('../mocks/fixtures')).MOCK_SCENARIOS[0];
    return get().initializeSession(demoScenario, 'user-inst-1');
  },
}));
