// Soldier: HP 75, ranged projectile, strafes while shooting
class Soldier extends EnemyBase {
  constructor(x, y) {
    super('soldier', x, y,
      /*hp*/75, /*speed*/2.0, /*damage*/20, /*range*/10, /*cooldown*/1.5
    );
    this.scoreValue = 250;
    this.strafeDir = 1;
    this.strafeTimer = 0;
  }

  _stateChase(dt, player, map, flowField, distToPlayer) {
    // Strafe perpendicular to player direction while closing
    this.strafeTimer -= dt;
    if (this.strafeTimer <= 0) {
      this.strafeDir = Math.random() < 0.5 ? 1 : -1;
      this.strafeTimer = 1.5 + Math.random();
    }

    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    const perpX = -dy / dist * this.strafeDir;
    const perpY = dx / dist * this.strafeDir;

    // Maintain mid-range distance, strafe
    if (dist > 5) {
      this._moveWithCollision((dx/dist + perpX*0.5) * this.speed * dt,
                              (dy/dist + perpY*0.5) * this.speed * dt, map);
    } else if (dist < 3) {
      this._moveWithCollision((-dx/dist + perpX) * this.speed * dt,
                              (-dy/dist + perpY) * this.speed * dt, map);
    } else {
      this._moveWithCollision(perpX * this.speed * dt, perpY * this.speed * dt, map);
    }

    this.angle = Math.atan2(dy, dx);
    this.animate(dt, 1, 3, true);

    if (distToPlayer <= this.attackRange && this.hasLOS) {
      this.state = C.STATE_ATTACK;
    }
    if (!this.hasLOS && this.stateTimer > 5) {
      this.state = C.STATE_IDLE;
      this.stateTimer = 0;
    }
  }

  _doAttack(player) {
    if (!this.hasLOS) return;
    // Emit a ranged attack event — CombatSystem will spawn a bullet
    EventBus.emit('enemy_attack', {
      enemy: this,
      damage: this.attackDamage,
      type: 'ranged',
      x: this.x, y: this.y,
      tx: player.x, ty: player.y
    });
    AudioSystem.playSound('soldierShoot', this.x, this.y);
  }
}
