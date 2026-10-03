import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioEngine } from '../../engine/scenarioEngine';
import { MOCK_SCENARIOS, MOCK_INITIAL_PARTICIPANTS } from '../../mocks/fixtures';

describe('ScenarioEngine', () => {
  let engine: ScenarioEngine;

  beforeEach(() => {
    engine = new ScenarioEngine(MOCK_SCENARIOS[0], 'inst-1', MOCK_INITIAL_PARTICIPANTS);
  });

  it('starts scenario and updates session state to RUNNING', () => {
    engine.start();
    expect(engine.getSession().state).toBe('RUNNING');
    expect(engine.getEventLogs().length).toBeGreaterThan(0);
  });

  it('pauses and resumes scenario timeline', () => {
    engine.start();
    engine.pause();
    expect(engine.getSession().state).toBe('PAUSED');

    engine.resume();
    expect(engine.getSession().state).toBe('RUNNING');
  });

  it('resets scenario session state', () => {
    engine.start();
    engine.reset();
    expect(engine.getSession().state).toBe('SETUP');
    expect(engine.getSession().currentScenarioTimeMs).toBe(0);
  });

  it('submits trainee decision and logs submission event', () => {
    engine.start();
    const decision = engine.submitTraineeDecision(
      'dec-101',
      'part-1',
      'HOLD_POSITION',
      'Tactical pause to verify aerial reconnaissance sensors',
      'HIGH'
    );

    expect(decision.selectedOptionId).toBe('HOLD_POSITION');
    expect(decision.rationale.text).toContain('Tactical pause');

    const logs = engine.getEventLogs();
    const decisionEvt = logs.find((l) => l.type === 'DECISION_SUBMITTED');
    expect(decisionEvt).toBeDefined();
  });
});
