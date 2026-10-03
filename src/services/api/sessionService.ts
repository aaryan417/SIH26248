import { ScenarioEngine } from '../../engine/scenarioEngine';
import { MOCK_INITIAL_PARTICIPANTS, MOCK_SCENARIOS } from '../../mocks/fixtures';
import {
  AARReport,
  ExerciseSession,
  Participant,
} from '../../types';
import { storage } from '../../utils/storage';
import { ScoringEngine } from '../../engine/scoringEngine';

export interface CreateSessionInput {
  scenarioId: string;
  instructorId: string;
  participants?: Participant[];
}

export interface SessionService {
  createSession(input: CreateSessionInput): Promise<ExerciseSession>;
  getSession(sessionId: string): Promise<ExerciseSession | null>;
  startSession(sessionId: string): Promise<void>;
  pauseSession(sessionId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  getAARReport(sessionId: string): Promise<AARReport>;
  getEngine(sessionId: string): ScenarioEngine | null;
}

class MockSessionAdapter implements SessionService {
  private activeEngines: Map<string, ScenarioEngine> = new Map();

  public async createSession(input: CreateSessionInput): Promise<ExerciseSession> {
    const scenario = MOCK_SCENARIOS.find((s) => s.id === input.scenarioId) || MOCK_SCENARIOS[0];
    const participants = input.participants || MOCK_INITIAL_PARTICIPANTS;

    const engine = new ScenarioEngine(scenario, input.instructorId, participants);
    const session = engine.getSession();

    this.activeEngines.set(session.id, engine);
    storage.set('active_session_id', session.id);
    storage.set(`session_${session.id}`, session);

    return session;
  }

  public async getSession(sessionId: string): Promise<ExerciseSession | null> {
    const engine = this.activeEngines.get(sessionId);
    if (engine) return engine.getSession();
    return storage.get<ExerciseSession | null>(`session_${sessionId}`, null);
  }

  public async startSession(sessionId: string): Promise<void> {
    const engine = this.activeEngines.get(sessionId);
    if (engine) {
      engine.start();
    }
  }

  public async pauseSession(sessionId: string): Promise<void> {
    const engine = this.activeEngines.get(sessionId);
    if (engine) {
      engine.pause();
    }
  }

  public async endSession(sessionId: string): Promise<void> {
    const engine = this.activeEngines.get(sessionId);
    if (engine) {
      engine.endExercise();
    }
  }

  public async getAARReport(sessionId: string): Promise<AARReport> {
    const engine = this.activeEngines.get(sessionId);
    if (engine) {
      return ScoringEngine.generateAARReport(
        engine.getSession(),
        engine.getEventLogs(),
        engine.getActiveMessages(),
        engine.getUserDecisions(),
        engine.getActiveDecisions()
      );
    }

    const savedSession = await this.getSession(sessionId);
    return ScoringEngine.generateAARReport(
      savedSession || {
        id: sessionId,
        scenarioId: 'scen-silent-horizon',
        scenarioName: 'Operation Silent Horizon',
        codeName: 'SILENT_HORIZON_2026',
        state: 'COMPLETED',
        elapsedTimeMs: 180000,
        currentScenarioTimeMs: 180000,
        instructorId: 'user-inst-1',
        participants: MOCK_INITIAL_PARTICIPANTS,
        commStatus: {
          state: 'DEGRADED',
          signalStrength: 45,
          networkHealth: 50,
          artificialDelaySec: 15,
          messageLossRate: 0.25,
          confidenceScore: 70,
          activeOutage: false,
          lastUpdatedMs: Date.now(),
        },
      },
      [],
      [],
      [],
      []
    );
  }

  public getEngine(sessionId: string): ScenarioEngine | null {
    return this.activeEngines.get(sessionId) || null;
  }
}

export const sessionService: SessionService = new MockSessionAdapter();
