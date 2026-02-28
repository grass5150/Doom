// Fixed 60Hz physics timestep with rAF rendering loop
class GameLoop {
  constructor(game) {
    this.game = game;
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.FIXED_DT = 1 / 60;
    this.MAX_FRAME_TIME = 0.1; // Clamp to avoid spiral of death
    this._raf = null;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this._raf = requestAnimationFrame(t => this._tick(t));
  }

  stop() {
    this.running = false;
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  _tick(now) {
    if (!this.running) return;
    this._raf = requestAnimationFrame(t => this._tick(t));

    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp large frame times (e.g. tab switching)
    if (frameTime > this.MAX_FRAME_TIME) frameTime = this.MAX_FRAME_TIME;

    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.FIXED_DT) {
      this.game.update(this.FIXED_DT);
      this.accumulator -= this.FIXED_DT;
    }

    // Render with interpolation alpha
    const alpha = this.accumulator / this.FIXED_DT;
    this.game.render(alpha);
  }
}
