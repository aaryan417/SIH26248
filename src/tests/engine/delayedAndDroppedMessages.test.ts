import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioEngine } from '../../engine/scenarioEngine';
import { MOCK_SCENARIOS, MOCK_INITIAL_PARTICIPANTS } from '../../mocks/fixtures';

describe('Delayed, Dropped & Conflicting Messages', () => {
  let engine: ScenarioEngine;

  beforeEach(() => {
    engine = new ScenarioEngine(MOCK_SCENARIOS[0], 'inst-1', MOCK_INITIAL_PARTICIPANTS);
  });

  it('delivers delayed message when scenario time advances past delay offset', () => {
    engine.start();
    engine.setArtificialDelay(15); // 15s delay

    // Process outgoing message
    const initialSession = engine.getSession();
    expect(initialSession.state).toBe('RUNNING');

    // Force drop next message
    engine.dropNextMessage();
    expect(engine.getEventLogs().some((l) => l.payload.manualDropNext)).toBe(true);
  });

  it('injects conflicting report and updates participant information states', () => {
    engine.start();
    engine.injectConflict(
      'FORWARD-OBSERVER-2',
      'Axis Blue Route Status',
      'Updated field report indicates Axis Blue is obstructed by debris.',
      'Route Assessment Alpha indicates clear route.'
    );

    const activeMsgs = engine.getActiveMessages();
    const conflictMsg = activeMsgs.find((m) => m.isConflicting);

    expect(conflictMsg).toBeDefined();
    expect(conflictMsg?.sender).toBe('FORWARD-OBSERVER-2');
    expect(conflictMsg?.status).toBe('CONFLICTING');

    const logs = engine.getEventLogs();
    expect(logs.some((l) => l.type === 'COMMUNICATION_CONFLICT')).toBe(true);
  });

  it('restores normal communication parameters on instructor command', () => {
    engine.start();
    engine.setDegradationState('DISCONNECTED');
    expect(engine.getSession().commStatus.state).toBe('DISCONNECTED');

    engine.setDegradationState('NORMAL');
    expect(engine.getSession().commStatus.state).toBe('NORMAL');
    expect(engine.getSession().commStatus.signalStrength).toBe(95);

    const logs = engine.getEventLogs();
    const ewEvts = logs.filter((l) => l.type === 'EW_DEGRADATION');
    expect(ewEvts.length).toBeGreaterThanOrEqual(2);
  });
});
