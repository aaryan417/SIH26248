import {
  CommunicationMessage,
  CommunicationStatus,
  DegradationState,
  MessageStatus,
} from '../types';
import { getRandomBoolean, getRandomInt } from '../utils/randomUtils';

export class DegradationEngine {
  private status: CommunicationStatus;

  constructor(initialStatus?: Partial<CommunicationStatus>) {
    this.status = {
      state: 'NORMAL',
      signalStrength: 95,
      networkHealth: 95,
      artificialDelaySec: 0,
      messageLossRate: 0,
      confidenceScore: 95,
      activeOutage: false,
      lastUpdatedMs: Date.now(),
      ...initialStatus,
    };
  }

  public getStatus(): CommunicationStatus {
    return { ...this.status };
  }

  public updateState(newState: DegradationState, overrides?: Partial<CommunicationStatus>): CommunicationStatus {
    this.status.state = newState;

    switch (newState) {
      case 'NORMAL':
        this.status.signalStrength = 95;
        this.status.networkHealth = 95;
        this.status.artificialDelaySec = 0;
        this.status.messageLossRate = 0;
        this.status.confidenceScore = 95;
        this.status.activeOutage = false;
        break;
      case 'DEGRADED':
        this.status.signalStrength = 55;
        this.status.networkHealth = 60;
        this.status.artificialDelaySec = 15;
        this.status.messageLossRate = 0.25;
        this.status.confidenceScore = 70;
        this.status.activeOutage = false;
        break;
      case 'SEVERELY_DEGRADED':
        this.status.signalStrength = 25;
        this.status.networkHealth = 30;
        this.status.artificialDelaySec = 35;
        this.status.messageLossRate = 0.55;
        this.status.confidenceScore = 40;
        this.status.activeOutage = false;
        break;
      case 'DISCONNECTED':
        this.status.signalStrength = 0;
        this.status.networkHealth = 5;
        this.status.artificialDelaySec = 999;
        this.status.messageLossRate = 1.0;
        this.status.confidenceScore = 10;
        this.status.activeOutage = true;
        break;
      case 'RECOVERING':
        this.status.signalStrength = 80;
        this.status.networkHealth = 80;
        this.status.artificialDelaySec = 5;
        this.status.messageLossRate = 0.08;
        this.status.confidenceScore = 85;
        this.status.activeOutage = false;
        break;
    }

    if (overrides) {
      this.status = { ...this.status, ...overrides };
    }

    this.status.lastUpdatedMs = Date.now();
    return this.getStatus();
  }

  public setSignalStrength(percent: number): void {
    this.status.signalStrength = Math.max(0, Math.min(100, percent));
    this.recalculateStateFromMetrics();
  }

  public setArtificialDelay(seconds: number): void {
    this.status.artificialDelaySec = Math.max(0, seconds);
  }

  public setMessageLossRate(rate: number): void {
    this.status.messageLossRate = Math.max(0, Math.min(1, rate));
  }

  public processOutgoingMessage(
    message: Omit<CommunicationMessage, 'deliveredAtMs' | 'status' | 'delayMs'>,
    currentTimeMs: number,
    forceDropNext = false,
    useSeed = false
  ): CommunicationMessage {
    const isDropped =
      forceDropNext ||
      this.status.activeOutage ||
      getRandomBoolean(this.status.messageLossRate, useSeed);

    if (isDropped) {
      return {
        ...message,
        status: 'DROPPED',
        confidence: Math.round(this.status.confidenceScore * 0.5),
      };
    }

    const calculatedDelaySec =
      this.status.artificialDelaySec + (this.status.state === 'NORMAL' ? 0 : getRandomInt(2, 10, useSeed));

    const deliveredAtMs = currentTimeMs + calculatedDelaySec * 1000;
    const status: MessageStatus = calculatedDelaySec > 0 ? 'DELAYED' : 'DELIVERED';

    return {
      ...message,
      deliveredAtMs,
      delayMs: calculatedDelaySec * 1000,
      status,
      confidence: Math.round(this.status.confidenceScore),
    };
  }

  private recalculateStateFromMetrics(): void {
    if (this.status.signalStrength <= 5) {
      this.status.state = 'DISCONNECTED';
      this.status.activeOutage = true;
    } else if (this.status.signalStrength < 40) {
      this.status.state = 'SEVERELY_DEGRADED';
      this.status.activeOutage = false;
    } else if (this.status.signalStrength < 75) {
      this.status.state = 'DEGRADED';
      this.status.activeOutage = false;
    } else {
      this.status.state = 'NORMAL';
      this.status.activeOutage = false;
    }
    this.status.lastUpdatedMs = Date.now();
  }
}
