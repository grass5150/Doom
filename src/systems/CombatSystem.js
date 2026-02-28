// Bullet movement, hit detection, damage application, particle spawning
const CombatSystem = {
  bullets: [],        // { x, y, dx, dy, speed, damage, fromPlayer, life }
  particles: [],      // { x, y, z, vx, vy, vz, life, maxLife, color }
  pendingPickupRemovals: [],

  init() {
    this.bullets = [];
    this.particles = [];

    EventBus.on('player_fire', data => {
      this.spawnBullet(data.x, data.y, data.dx, data.dy, C.BULLET_SPEED, 35, true);
    });

    EventBus.on('enemy_attack', data => {
      if (data.type === 'ranged') {
        const dx = data.tx - data.x, dy = data.ty - data.y;
        const len = Math.hypot(dx, dy);
        const speed = data.speed || 7;
        this.spawnBullet(data.x, data.y, dx/len, dy/len, speed, data.damage, false);
      }
      // Melee is handled directly via event
    });
  },

  spawnBullet(x, y, dx, dy, speed, damage, fromPlayer) {
    this.bullets.push({ x, y, dx, dy, speed, damage, fromPlayer, life: 2.5 });
  },

  spawnParticle(x, y, color = '#ff6600') {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x, y, z: 0.1,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        vz: 0.5 + Math.random() * 0.5,
        life: 0.4 + Math.random() * 0.3,
        color
      });
    }
  },

  update(dt, entities, player, map) {
    this._updateBullets(dt, entities, player, map);
    this._updateParticles(dt);
  },

  _updateBullets(dt, entities, player, map) {
    const toRemove = [];
    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];
      b.life -= dt;
      if (b.life <= 0) { toRemove.push(i); continue; }

      // Substep to prevent tunneling at high speed
      const steps = Math.ceil(b.speed * dt * 2);
      const stepDt = dt / steps;
      let hit = false;

      for (let s = 0; s < steps && !hit; s++) {
        b.x += b.dx * b.speed * stepDt;
        b.y += b.dy * b.speed * stepDt;

        if (map.isWall(b.x, b.y)) {
          this.spawnParticle(b.x, b.y, '#888888');
          hit = true;
          toRemove.push(i);
          continue;
        }

        if (b.fromPlayer) {
          for (const e of entities) {
            if (!(e instanceof EnemyBase) || e.dead) continue;
            const dx = b.x - e.x, dy = b.y - e.y;
            if (dx*dx + dy*dy < (e.radius + 0.1) * (e.radius + 0.1)) {
              e.takeDamage(b.damage);
              this.spawnParticle(e.x, e.y, '#cc0000');
              AudioSystem.playSound('hitFlesh', e.x, e.y);
              if (e.dead) {
                EventBus.emit('score', { amount: e.scoreValue });
              }
              hit = true;
              toRemove.push(i);
              break;
            }
          }
        } else {
          // Enemy bullet hitting player
          const dx = b.x - player.x, dy = b.y - player.y;
          if (dx*dx + dy*dy < (C.PLAYER_RADIUS + 0.1) * (C.PLAYER_RADIUS + 0.1)) {
            player.takeDamage(b.damage);
            this.spawnParticle(player.x, player.y, '#ff0000');
            hit = true;
            toRemove.push(i);
          }
        }
      }
    }

    // Remove in reverse to preserve indices
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.bullets.splice(toRemove[i], 1);
    }
  },

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vz -= 2 * dt; // gravity
    }
  },

  reset() {
    this.bullets = [];
    this.particles = [];
  }
};
