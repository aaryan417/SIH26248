import { describe, it, expect } from 'vitest';
import { ScoringEngine } from '../../engine/scoringEngine';
import { MOCK_INITIAL_PARTICIPANTS } from '../../mocks/fixtures';
import { CommunicationMessage, ExerciseSession } from '../../types';

describe('ScoringEngine', () => {
  const mockSession: ExerciseSession = {
    id: 'test-session',
    scenarioId: 'scen-silent-horizon',
    scenarioName: 'Operation Silent Horizon',
    codeName: 'SILENT_HORIZON_2026',
    state: 'COMPLETED',
    elapsedTimeMs: 120000,
    currentScenarioTimeMs: 120000,
    instructorId: 'inst-1',
    participants: MOCK_INITIAL_PARTICIPANTS,
    commStatus: {
      state: 'DEGRADED',
      signalStrength: 50,
      networkHealth: 60,
      artificialDelaySec: 10,
      messageLossRate: 0.2,
      confidenceScore: 75,
      activeOutage: false,
      lastUpdatedMs: Date.now(),
    },
  };

  const mockMessages: CommunicationMessage[] = [
    {
      id: 'msg-1',
      sender: 'HQ',
      recipient: 'ALL',
      generatedAtMs: 1000,
      deliveredAtMs: 2000,
      status: 'DELIVERED',
      confidence: 90,
      channel: 'HF_RADIO',
      domain: 'LAND',
      subject: 'Briefing',
      content: 'Clear path',
    },
    {
      id: 'msg-2',
      sender: 'AIR',
      recipient: 'ALL',
      generatedAtMs: 5000,
      status: 'DROPPED',
      confidence: 40,
      channel: 'SATCOM',
      domain: 'AIR',
      subject: 'Recon',
      content: 'Anomaly detected',
    },
  ];

  it('generates deterministic AAR report metrics from event inputs', () => {
    const report = ScoringEngine.generateAARReport(
      mockSession,
      [],
      mockMessages,
      [],
      []
    );

    expect(report.metrics.messagesGenerated).toBe(2);
    expect(report.metrics.messagesDelivered).toBe(1);
    expect(report.metrics.messagesDropped).toBe(1);
    expect(report.metrics.commReliabilityPercent).toBe(50);
  });
});
