export type RealtimeCallback = (payload: any) => void;

export interface RealtimeService {
  connect(sessionId: string): Promise<void>;
  disconnect(): void;
  subscribe(topic: string, callback: RealtimeCallback): () => void;
  publish(topic: string, payload: any): void;
  isConnected(): boolean;
}

export class MockRealtimeService implements RealtimeService {
  private connected = false;
  private currentSessionId: string | null = null;
  private subscriptions: Map<string, Set<RealtimeCallback>> = new Map();

  public async connect(sessionId: string): Promise<void> {
    this.currentSessionId = sessionId;
    this.connected = true;
    console.log(`[MockRealtimeService] Connected to simulated session socket: ${sessionId}`);
  }

  public disconnect(): void {
    this.connected = false;
    this.currentSessionId = null;
    this.subscriptions.clear();
    console.log('[MockRealtimeService] Disconnected');
  }

  public subscribe(topic: string, callback: RealtimeCallback): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(callback);

    return () => {
      const topicSubs = this.subscriptions.get(topic);
      if (topicSubs) {
        topicSubs.delete(callback);
      }
    };
  }

  public publish(topic: string, payload: any): void {
    if (!this.connected) return;
    const callbacks = this.subscriptions.get(topic);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }
}

// Future WebSocket adapter for Django Channels
export class WebSocketRealtimeService implements RealtimeService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<RealtimeCallback>> = new Map();

  constructor(private wsBaseUrl: string) {}

  public async connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.wsBaseUrl}/ws/sessions/${sessionId}/`);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const callbacks = this.subscriptions.get(data.topic);
          if (callbacks) {
            callbacks.forEach((cb) => cb(data.payload));
          }
        } catch (e) {
          console.error('[WebSocket] Message parsing error:', e);
        }
      };
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(topic: string, callback: RealtimeCallback): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(callback);
    return () => {
      this.subscriptions.get(topic)?.delete(callback);
    };
  }

  public publish(topic: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ topic, payload }));
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
const wsBase = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export const realtimeService: RealtimeService = useMock
  ? new MockRealtimeService()
  : new WebSocketRealtimeService(wsBase);
