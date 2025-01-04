export default class Animation {
  private startTime: number = 0;
  constructor(
    private setValue: (progress: number) => void,
    private durationMs: number,
    private easing: (progress: number) => number
  ) {}
  playInternal = () => {
    if (this.startTime === 0) {
      this.startTime = new Date().getTime();
    }
    const elapsed = new Date().getTime() - this.startTime;
    this.setValue(this.easing(Math.min(1, elapsed / this.durationMs)));
    if (elapsed < this.durationMs) {
      requestAnimationFrame(this.play);
    }
  };
  play = () =>
    new Promise<void>((resolve) => {
      this.playInternal();
      setTimeout(() => requestAnimationFrame(() => resolve()), this.durationMs + 10);
    });
}
