// Player entity: movement, shooting, health, state
class Player {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.hp = 100;
    this.maxHp = 100;
    this.ammo = C.START_AMMO;
    this.dead = false;

    // Weapon
    this.fireTimer = 0;
    this.recoil = 0;
    this.fireFlash = 0;

    // Visual
    this.bobTime = 0;
    this.movingSpeed = 0;
    this.painTimer = 0;

    // Movement state (set by InputManager)
    this.moveForward = 0;
    this.moveSide = 0;
    this.firing = false;
  }

  update(dt, input, map, camera) {
    if (this.dead) return;

    this.painTimer = Math.max(0, this.painTimer - dt);
    this.fireTimer = Math.max(0, this.fireTimer - dt);
    this.recoil = Math.max(0, this.recoil - dt * 5);
    this.fireFlash = Math.max(0, this.fireFlash - dt * 8);

    // Movement
    const moving = this._handleMovement(dt, input, map, camera);
    this.movingSpeed = moving ? 1 : Math.max(0, this.movingSpeed - dt * 5);
    if (moving) {
      this.bobTime += dt * 6;
      this.movingSpeed = 1;
    }

    // Shooting
    if (input.firing && this.ammo > 0 && this.fireTimer <= 0) {
      this._fire(camera);
    }
  }

  _handleMovement(dt, input, map, camera) {
    let dx = 0, dy = 0;
    const spd = C.MOVE_SPEED * dt;

    if (input.forward)  { dx += camera.dirX * spd; dy += camera.dirY * spd; }
    if (input.backward) { dx -= camera.dirX * spd; dy -= camera.dirY * spd; }
    if (input.strafeL)  { dx -= camera.planeX * spd; dy -= camera.planeY * spd; }
    if (input.strafeR)  { dx += camera.planeX * spd; dy += camera.planeY * spd; }

    const moving = dx !== 0 || dy !== 0;

    // Axis-separated collision (allows wall sliding)
    const r = C.PLAYER_RADIUS;
    if (!map.isWall(this.x + dx, this.y)) this.x += dx;
    if (!map.isWall(this.x, this.y + dy)) this.y += dy;

    // Mouse look
    if (input.mouseDX !== 0) {
      camera.rotate(input.mouseDX * C.ROT_SPEED);
      camera.setPos(this.x, this.y);
      input.mouseDX = 0;
    }

    // Keyboard turn
    if (input.turnL) camera.rotate(-2.0 * dt);
    if (input.turnR) camera.rotate( 2.0 * dt);

    camera.setPos(this.x, this.y);
    return moving;
  }

  _fire(camera) {
    if (this.ammo <= 0) return;
    this.ammo--;
    this.fireTimer = C.FIRE_RATE;
    this.recoil = 1;
    this.fireFlash = 1;

    // Spread: ±0.03 radians random
    const spread = (Math.random() - 0.5) * 0.06;
    const angle = camera.angle + spread;

    EventBus.emit('player_fire', {
      x: camera.x, y: camera.y,
      angle: angle,
      dx: Math.cos(angle),
      dy: Math.sin(angle)
    });

    AudioSystem.playGunshot();
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp -= amount;
    this.painTimer = 0.3;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      EventBus.emit('player_died', {});
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addAmmo(amount) {
    this.ammo = Math.min(C.MAX_AMMO, this.ammo + amount);
  }
}
