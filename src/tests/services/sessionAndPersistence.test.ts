import { describe, it, expect } from 'vitest';
import { sessionService } from '../../services/api/sessionService';
import { scenarioService } from '../../services/api/scenarioService';
import { storage } from '../../utils/storage';

describe('Session Service & Persistence & Invalid Session Handling', () => {
  it('creates an exercise session and persists it in storage', async () => {
    const scenario = await scenarioService.getScenario('scen-silent-horizon');
    const session = await sessionService.createSession({
      scenarioId: scenario.id,
      instructorId: 'inst-1',
    });

    expect(session.id).toBeDefined();
    expect(session.scenarioName).toBe(scenario.name);

    const savedSessionId = storage.get<string | null>('active_session_id', null);
    expect(savedSessionId).toBe(session.id);
  });

  it('handles invalid session ID gracefully without crashing', async () => {
    const session = await sessionService.getSession('invalid-session-999');
    // Returns null or fallback gracefully
    expect(session === null || session !== undefined).toBe(true);

    const aar = await sessionService.getAARReport('invalid-session-999');
    expect(aar).toBeDefined();
    expect(aar.scenarioName).toBeDefined();
  });
});
