import { describe, it, expect, beforeEach } from 'vitest';
import { ScenarioEngine } from '../../engine/scenarioEngine';
import { MOCK_SCENARIOS, MOCK_INITIAL_PARTICIPANTS } from '../../mocks/fixtures';

describe('Decision Prompt, Rationale & Information Snapshot', () => {
  let engine: ScenarioEngine;

  beforeEach(() => {
    engine = new ScenarioEngine(MOCK_SCENARIOS[0], 'inst-1', MOCK_INITIAL_PARTICIPANTS);
  });

  it('presents decision prompt and records user response with rationale & confidence', () => {
    engine.start();

    const decision = engine.submitTraineeDecision(
      'dec-101',
      'part-1',
      'HOLD_POSITION',
      'Hold column advance while requesting Alpha-2 aerial verification.',
      'HIGH'
    );

    expect(decision.promptId).toBe('dec-101');
    expect(decision.participantId).toBe('part-1');
    expect(decision.selectedOptionId).toBe('HOLD_POSITION');
    expect(decision.rationale.text).toBe(
      'Hold column advance while requesting Alpha-2 aerial verification.'
    );
    expect(decision.rationale.confidenceLevel).toBe('HIGH');
  });

  it('captures exact information available at decision timestamp', () => {
    engine.start();
    engine.setDegradationState('DEGRADED');

    const decision = engine.submitTraineeDecision(
      'dec-101',
      'part-1',
      'ALTERNATE_ROUTE',
      'Reroute via secondary track to avoid delay.',
      'MEDIUM'
    );

    const snapshot = decision.informationAvailableAtDecision;
    expect(snapshot).toBeDefined();
    expect(snapshot.commStatusState).toBe('DEGRADED');
    expect(snapshot.signalStrength).toBe(55);
  });
});
