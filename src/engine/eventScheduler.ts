export type TickCallback = (elapsedTimeMs: number) => void;

export class EventScheduler {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private elapsedTimeMs = 0;
  private isRunning = false;
  private speedMultiplier = 1;
  private tickCallbacks: Set<TickCallback> = new Set();
  private tickIntervalMs = 500; // tick every 500ms real time

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timerId = setInterval(() => {
      this.elapsedTimeMs += this.tickIntervalMs * this.speedMultiplier;
      this.notifyTicks();
    }, this.tickIntervalMs);
  }

  public pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public resume(): void {
    this.start();
  }

  public reset(): void {
    this.pause();
    this.elapsedTimeMs = 0;
    this.notifyTicks();
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = Math.max(0.5, Math.min(10, multiplier));
  }

  public getElapsedTimeMs(): number {
    return this.elapsedTimeMs;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public subscribe(callback: TickCallback): () => void {
    this.tickCallbacks.add(callback);
    return () => {
      this.tickCallbacks.delete(callback);
    };
  }

  private notifyTicks(): void {
    this.tickCallbacks.forEach((cb) => cb(this.elapsedTimeMs));
  }
}
