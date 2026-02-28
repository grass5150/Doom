// Boss: HP 600+, phase-based, multiple attack patterns
class Boss extends EnemyBase {
  constructor(x, y) {
    super('boss', x, y,
      /*hp*/600, /*speed*/1.0, /*damage*/60, /*range*/14, /*cooldown*/0.8
    );
    this.scoreValue = 5000;
    this.phase = 1;
    this.maxPhases = 3;
    this.burstCount = 0;
    this.burstTimer = 0;
    this.summonTimer = 0;
    this.sweepAngle = 0;
    this.sweepDir = 1;

    // Boss is large
    this.radius = 0.6;
    this.animSpeed = 0.15;
  }

  onPain() {
    // Boss only enters pain briefly at phase thresholds
    if (this.hp <= 0) return;
    const ratio = this.hp / this.maxHp;
    const newPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
    if (newPhase > this.phase) {
      this.phase = newPhase;
      this._onPhaseTransition();
    }
    // Minimal pain stagger for boss
    this.painTimer = 0.05;
  }

  _onPhaseTransition() {
    EventBus.emit('boss_phase', { phase: this.phase });
    AudioSystem.playSound('bossRoar', this.x, this.y);
  }

  _updateAnimation(dt) {
    const frameBase = (this.phase - 1) * 2;
    this.animate(dt, frameBase, frameBase + 1, true);
    if (this.state === C.STATE_ATTACK) this.animFrame = frameBase + 1;
    if (this.state === C.STATE_DEAD) this.animate(dt, 6, 6, false);
  }

  _stateChase(dt, player, map, flowField, distToPlayer) {
    const dx = player.x - this.x, dy = player.y - this.y;
    this.angle = Math.atan2(dy, dx);

    // Boss moves toward player at reduced speed
    const spd = this.speed * (this.phase === 3 ? 1.5 : 1.0);
    const len = Math.hypot(dx, dy);
    if (len > 0.1) {
      this._moveWithCollision(dx/len * spd * dt, dy/len * spd * dt, map);
    }

    if (distToPlayer <= this.attackRange && this.hasLOS) {
      this.state = C.STATE_ATTACK;
      this.stateTimer = 0;
    }
  }

  _stateAttack(dt, player, distToPlayer) {
    this.angle = Math.atan2(player.y - this.y, player.x - this.x);

    if (this.attackTimer <= 0) {
      this._doAttack(player);
      this.attackTimer = this.attackCooldown / this.phase; // faster each phase
    }

    // Phase 2+: summon adds
    if (this.phase >= 2) {
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.summonTimer = 8 - this.phase * 2;
        EventBus.emit('boss_summon', { x: this.x, y: this.y, phase: this.phase });
      }
    }

    // Phase 3: sweep attack
    if (this.phase === 3) {
      this.sweepAngle += this.sweepDir * dt * 2;
      if (Math.abs(this.sweepAngle) > 1.2) this.sweepDir *= -1;
    }

    if (!this.hasLOS || distToPlayer > this.attackRange * 1.5) {
      this.state = C.STATE_CHASE;
    }
  }

  _doAttack(player) {
    if (!this.hasLOS) return;

    const patterns = {
      1: () => {
        // Single heavy shot
        EventBus.emit('enemy_attack', {
          enemy: this, damage: this.attackDamage, type: 'ranged',
          x: this.x, y: this.y, tx: player.x, ty: player.y, speed: 10
        });
      },
      2: () => {
        // Triple spread shot
        for (let i = -1; i <= 1; i++) {
          const spread = i * 0.3;
          const angle = this.angle + spread;
          EventBus.emit('enemy_attack', {
            enemy: this, damage: this.attackDamage * 0.7, type: 'ranged',
            x: this.x, y: this.y,
            tx: this.x + Math.cos(angle) * 10,
            ty: this.y + Math.sin(angle) * 10,
            speed: 8
          });
        }
      },
      3: () => {
        // Sweep: 5-shot fan + homing
        const sweepOff = this.sweepAngle;
        for (let i = -2; i <= 2; i++) {
          const angle = this.angle + sweepOff + i * 0.25;
          EventBus.emit('enemy_attack', {
            enemy: this, damage: 40, type: 'ranged',
            x: this.x, y: this.y,
            tx: this.x + Math.cos(angle) * 10,
            ty: this.y + Math.sin(angle) * 10,
            speed: 7
          });
        }
      }
    };

    const pattern = patterns[this.phase];
    if (pattern) pattern();
    AudioSystem.playSound('bossShoot', this.x, this.y);
  }
}
