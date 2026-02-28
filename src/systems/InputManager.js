// Input handling: WASD, mouse look (pointer lock), fire
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.forward = false;
    this.backward = false;
    this.strafeL = false;
    this.strafeR = false;
    this.turnL = false;
    this.turnR = false;
    this.firing = false;
    this.mouseDX = 0;
    this.pointerLocked = false;
    this._tab = false;
    this._tabJustPressed = false;
    this._esc = false;
    this._escJustPressed = false;

    this._bindEvents();
  }

  _bindEvents() {
    const keyMap = {
      'KeyW': 'forward', 'ArrowUp': 'forward',
      'KeyS': 'backward', 'ArrowDown': 'backward',
      'KeyA': 'strafeL',
      'KeyD': 'strafeR',
      'ArrowLeft': 'turnL',
      'ArrowRight': 'turnR',
    };

    document.addEventListener('keydown', e => {
      if (keyMap[e.code]) this[keyMap[e.code]] = true;
      if (e.code === 'Space') this.firing = true;
      if (e.code === 'Tab') { e.preventDefault(); this._tabJustPressed = !this._tab; this._tab = true; }
      if (e.code === 'Escape') { this._escJustPressed = !this._esc; this._esc = true; }
    });

    document.addEventListener('keyup', e => {
      if (keyMap[e.code]) this[keyMap[e.code]] = false;
      if (e.code === 'Space') this.firing = false;
      if (e.code === 'Tab') this._tab = false;
      if (e.code === 'Escape') this._esc = false;
    });

    this.canvas.addEventListener('click', () => {
      if (!this.pointerLocked) {
        this.canvas.requestPointerLock();
      }
      this.firing = true;
      setTimeout(() => { this.firing = false; }, 50);
    });

    document.addEventListener('mousedown', e => {
      if (e.button === 0 && this.pointerLocked) this.firing = true;
    });
    document.addEventListener('mouseup', e => {
      if (e.button === 0) this.firing = false;
    });

    document.addEventListener('mousemove', e => {
      if (this.pointerLocked) {
        this.mouseDX += e.movementX;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
  }

  consumeTab() {
    const was = this._tabJustPressed;
    this._tabJustPressed = false;
    return was;
  }

  consumeEsc() {
    const was = this._escJustPressed;
    this._escJustPressed = false;
    return was;
  }
}
