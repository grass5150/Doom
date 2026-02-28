// Base enemy class with FSM: IDLE → ALERT → CHASE → ATTACK → PAIN → DEAD
class EnemyBase extends Entity {
  constructor(type, x, y, hp, speed, attackDamage, attackRange, attackCooldown) {
    super(type, x, y);
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.attackDamage = attackDamage;
    this.attackRange = attackRange;
    this.attackCooldown = attackCooldown;

    this.state = C.STATE_IDLE;
    this.stateTimer = 0;
    this.attackTimer = 0;
    this.painTimer = 0;
    this.alertTimer = 0;
    this.angle = 0;

    this.losCheckTimer = 0;
    this.losCheckInterval = 0.1;
    this.hasLOS = false;
    this.lastKnownPlayerX = 0;
    this.lastKnownPlayerY = 0;

    this.flowField = null;
    this.scoreValue = 100;
  }

  onPain() {
    if (this.state === C.STATE_DEAD) return;
    this.state = C.STATE_PAIN;
    this.painTimer = 0.2;
  }

  onDeath() {
    EventBus.emit('enemy_died', { enemy: this });
  }

  // Line-of-sight check (ray march from enemy to player)
  checkLOS(playerX, playerY, map) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 18) { this.hasLOS = false; return false; }

    const steps = Math.ceil(dist * 4);
    const sx = dx / steps, sy = dy / steps;
    let cx = this.x, cy = this.y;
    for (let i = 0; i < steps; i++) {
      cx += sx; cy += sy;
      if (map.isWall(cx, cy)) { this.hasLOS = false; return false; }
    }
    this.hasLOS = true;
    this.lastKnownPlayerX = playerX;
    this.lastKnownPlayerY = playerY;
    return true;
  }

  update(dt, player, map, flowField) {
    if (this.dead) {
      this._updateDead(dt);
      return;
    }

    this.stateTimer += dt;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.painTimer = Math.max(0, this.painTimer - dt);

    // Throttled LOS check
    this.losCheckTimer -= dt;
    if (this.losCheckTimer <= 0) {
      this.losCheckTimer = this.losCheckInterval;
      this.checkLOS(player.x, player.y, map);
    }

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

    switch (this.state) {
      case C.STATE_IDLE:    this._stateIdle(dt, distToPlayer); break;
      case C.STATE_ALERT:   this._stateAlert(dt, player, distToPlayer); break;
      case C.STATE_CHASE:   this._stateChase(dt, player, map, flowField, distToPlayer); break;
      case C.STATE_ATTACK:  this._stateAttack(dt, player, distToPlayer); break;
      case C.STATE_PAIN:    this._statePain(dt); break;
    }

    // Update sprite animation
    this._updateAnimation(dt);
  }

  _updateDead(dt) {
    // Sink into floor slowly
    if (this.z > -0.3) {
      this.z -= dt * 0.15;
    }
    this.animate(dt, 5, 5, false);
  }

  _stateIdle(dt, distToPlayer) {
    this.animate(dt, 0, 0, false);
    if (this.hasLOS) {
      this.state = C.STATE_ALERT;
      this.stateTimer = 0;
      this.alertTimer = 0.4;
      AudioSystem.playAlert(this.x, this.y);
    }
  }

  _stateAlert(dt, player, distToPlayer) {
    this.alertTimer -= dt;
    if (this.alertTimer <= 0) {
      this.state = C.STATE_CHASE;
    }
  }

  _stateChase(dt, player, map, flowField, distToPlayer) {
    if (distToPlayer <= this.attackRange && this.hasLOS) {
      this.state = C.STATE_ATTACK;
      this.stateTimer = 0;
      return;
    }

    // Move toward player using flow field or direct line
    let moveX = 0, moveY = 0;
    const gx = Math.floor(this.x), gy = Math.floor(this.y);
    if (flowField && flowField[gy] && flowField[gy][gx]) {
      const dir = flowField[gy][gx];
      moveX = dir.dx;
      moveY = dir.dy;
    } else {
      // Direct line to last known pos
      const dx = this.lastKnownPlayerX - this.x;
      const dy = this.lastKnownPlayerY - this.y;
      const len = Math.hypot(dx, dy);
      if (len > 0.01) { moveX = dx/len; moveY = dy/len; }
    }

    this._moveWithCollision(moveX * this.speed * dt, moveY * this.speed * dt, map);
    this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.animate(dt, 1, 3, true);

    // If lost sight for a while, go back to idle
    if (!this.hasLOS && this.stateTimer > 5) {
      this.state = C.STATE_IDLE;
      this.stateTimer = 0;
    }
  }

  _stateAttack(dt, player, distToPlayer) {
    this.animate(dt, 4, 4, false);
    if (this.attackTimer <= 0) {
      this._doAttack(player);
      this.attackTimer = this.attackCooldown;
    }
    if (distToPlayer > this.attackRange * 1.3 || !this.hasLOS) {
      this.state = C.STATE_CHASE;
    }
  }

  _statePain(dt) {
    this.animate(dt, 0, 0, false);
    if (this.painTimer <= 0) {
      this.state = this.hasLOS ? C.STATE_CHASE : C.STATE_IDLE;
    }
  }

  _doAttack(player) {
    // Override in subclasses
  }

  _moveWithCollision(dx, dy, map) {
    // Try X movement
    const nx = this.x + dx;
    if (!map.isWall(nx, this.y)) {
      this.x = nx;
    }
    // Try Y movement
    const ny = this.y + dy;
    if (!map.isWall(this.x, ny)) {
      this.y = ny;
    }
  }

  _updateAnimation(dt) {
    // Subclasses can override, default handled in state methods
  }
}
