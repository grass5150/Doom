// Demon: HP 200, slow normally, charge rush at close range
class Demon extends EnemyBase {
  constructor(x, y) {
    super('demon', x, y,
      /*hp*/200, /*speed*/1.4, /*damage*/45, /*range*/1.0, /*cooldown*/1.8
    );
    this.scoreValue = 500;
    this.charging = false;
    this.chargeSpeed = 5.5;
    this.chargeTimer = 0;
    this.chargeRange = 6;
  }

  _stateChase(dt, player, map, flowField, distToPlayer) {
    const dx = player.x - this.x, dy = player.y - this.y;
    this.angle = Math.atan2(dy, dx);

    if (distToPlayer <= this.chargeRange && this.hasLOS && !this.charging) {
      // Initiate charge!
      this.charging = true;
      this.chargeTimer = 0.8;
      AudioSystem.playSound('demonCharge', this.x, this.y);
    }

    if (this.charging) {
      this.chargeTimer -= dt;
      const speed = this.chargeSpeed;
      const len = Math.hypot(dx, dy);
      this._moveWithCollision(dx/len * speed * dt, dy/len * speed * dt, map);
      this.animate(dt, 1, 3, true);

      if (this.chargeTimer <= 0 || distToPlayer < this.attackRange) {
        this.charging = false;
        if (distToPlayer < this.attackRange) {
          this.state = C.STATE_ATTACK;
        }
      }
    } else {
      // Normal slow advance
      let moveX = 0, moveY = 0;
      const gx = Math.floor(this.x), gy = Math.floor(this.y);
      if (flowField && flowField[gy] && flowField[gy][gx]) {
        const dir = flowField[gy][gx];
        moveX = dir.dx; moveY = dir.dy;
      } else {
        const len = Math.hypot(dx, dy);
        if (len > 0) { moveX = dx/len; moveY = dy/len; }
      }
      this._moveWithCollision(moveX * this.speed * dt, moveY * this.speed * dt, map);
      this.animate(dt, 1, 3, true);
    }

    if (distToPlayer <= this.attackRange && this.hasLOS) {
      this.state = C.STATE_ATTACK;
    }
    if (!this.hasLOS && this.stateTimer > 6) {
      this.state = C.STATE_IDLE;
      this.stateTimer = 0;
    }
  }

  _doAttack(player) {
    if (!this.hasLOS) return;
    EventBus.emit('enemy_attack', { enemy: this, damage: this.attackDamage, type: 'melee' });
    AudioSystem.playSound('demonAttack', this.x, this.y);
    this.charging = false;
  }
}
