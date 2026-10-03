import { useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';

export function useScenarioEngine() {
  const store = useSessionStore();

  useEffect(() => {
    // Keep session store state synchronized
  }, [store.currentSession?.id]);

  return {
    session: store.currentSession,
    scenario: store.activeScenario,
    engine: store.engine,
    commStatus: store.commStatus,
    eventLogs: store.eventLogs,
    activeMessages: store.activeMessages,
    pendingDecisions: store.pendingDecisions,
    submittedDecisions: store.submittedDecisions,
    isLoading: store.isLoading,
    error: store.error,
    start: store.startExercise,
    pause: store.pauseExercise,
    resume: store.resumeExercise,
    reset: store.resetExercise,
    end: store.endExercise,
    setDegradationState: store.setDegradationState,
    setArtificialDelay: store.setArtificialDelay,
    setMessageLossRate: store.setMessageLossRate,
    dropNextMessage: store.dropNextMessage,
    injectConflict: store.injectConflict,
    submitDecision: store.submitDecision,
  };
}
