import { describe, it, expect, beforeEach } from 'vitest';
import { DegradationEngine } from '../../engine/degradationEngine';

describe('DegradationEngine', () => {
  let engine: DegradationEngine;

  beforeEach(() => {
    engine = new DegradationEngine();
  });

  it('initializes with NORMAL state metrics', () => {
    const status = engine.getStatus();
    expect(status.state).toBe('NORMAL');
    expect(status.signalStrength).toBe(95);
    expect(status.artificialDelaySec).toBe(0);
  });

  it('updates metrics when switching state to DEGRADED', () => {
    const updated = engine.updateState('DEGRADED');
    expect(updated.state).toBe('DEGRADED');
    expect(updated.signalStrength).toBe(55);
    expect(updated.artificialDelaySec).toBe(15);
  });

  it('calculates delayed delivery when artificial delay is configured', () => {
    engine.setArtificialDelay(20);
    const msg = engine.processOutgoingMessage(
      {
        id: 'msg-test-1',
        sender: 'HQ',
        recipient: 'ALPHA-1',
        generatedAtMs: 1000,
        confidence: 90,
        channel: 'HF_RADIO',
        domain: 'LAND',
        subject: 'Test Subject',
        content: 'Test Body',
      },
      1000,
      false,
      true
    );

    expect(msg.status).toBe('DELAYED');
    expect(msg.deliveredAtMs).toBeGreaterThan(1000);
  });

  it('drops message when forceDropNext is true', () => {
    const msg = engine.processOutgoingMessage(
      {
        id: 'msg-test-2',
        sender: 'HQ',
        recipient: 'ALPHA-1',
        generatedAtMs: 1000,
        confidence: 90,
        channel: 'HF_RADIO',
        domain: 'LAND',
        subject: 'Test Subject',
        content: 'Test Body',
      },
      1000,
      true,
      true
    );

    expect(msg.status).toBe('DROPPED');
  });

  it('restores normal communications', () => {
    engine.updateState('DISCONNECTED');
    expect(engine.getStatus().state).toBe('DISCONNECTED');

    engine.updateState('NORMAL');
    expect(engine.getStatus().state).toBe('NORMAL');
    expect(engine.getStatus().signalStrength).toBe(95);
  });
});
