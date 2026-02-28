// AABB vs grid walls and circle vs circle entity collision
const CollisionSystem = {
  // Resolve entity-entity circle collisions (push-apart)
  resolveEntities(entities, player) {
    const all = [...entities, player];
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      if (a.dead) continue;
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j];
        if (b.dead) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = (a.radius || 0.3) + (b.radius || 0.3);
        if (dist < minDist && dist > 0.001) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist, ny = dy / dist;
          if (a !== player) { a.x -= nx * overlap; a.y -= ny * overlap; }
          if (b !== player) { b.x += nx * overlap; b.y += ny * overlap; }
        }
      }
    }
  },

  // Check player vs pickup collision
  checkPickups(player, entities) {
    for (const e of entities) {
      if (e.collected || e.dead) continue;
      if (e.type !== 'healthPack' && e.type !== 'ammoPack' && e.type !== 'exit') continue;
      const dx = player.x - e.x, dy = player.y - e.y;
      if (dx*dx + dy*dy < 0.6 * 0.6) {
        this._collectPickup(player, e);
      }
    }
  },

  _collectPickup(player, pickup) {
    if (pickup.type === 'healthPack') {
      if (player.hp >= player.maxHp) return; // Don't collect if full
      player.heal(pickup.amount);
      EventBus.emit('pickup', { type: 'health', amount: pickup.amount });
      AudioSystem.playSound('pickup');
    } else if (pickup.type === 'ammoPack') {
      player.addAmmo(pickup.amount);
      EventBus.emit('pickup', { type: 'ammo', amount: pickup.amount });
      AudioSystem.playSound('pickup');
    } else if (pickup.type === 'exit') {
      EventBus.emit('level_exit', {});
    }
    pickup.collected = true;
    pickup.dead = true;
  }
};
