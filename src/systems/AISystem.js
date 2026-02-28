// Enemy FSM tick + flow field BFS pathfinding
const AISystem = {
  flowField: null,
  lastPlayerCell: { x: -1, y: -1 },
  flowFieldAge: 0,

  update(dt, entities, player, map) {
    if (player.dead) return;

    // Rebuild flow field when player changes cell
    const pcx = Math.floor(player.x), pcy = Math.floor(player.y);
    this.flowFieldAge += dt;
    if (pcx !== this.lastPlayerCell.x || pcy !== this.lastPlayerCell.y || this.flowFieldAge > 3) {
      this.flowField = map.buildFlowField(player.x, player.y);
      this.lastPlayerCell.x = pcx;
      this.lastPlayerCell.y = pcy;
      this.flowFieldAge = 0;
    }

    // Stagger enemy updates based on distance for performance
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];
      if (!(e instanceof EnemyBase)) continue;

      const dist = Math.hypot(e.x - player.x, e.y - player.y);
      // Distant enemies check LOS less frequently
      e.losCheckInterval = dist < 6 ? 0.05 : dist < 12 ? 0.1 : 0.2;

      e.update(dt, player, map, this.flowField);
    }
  },

  reset() {
    this.flowField = null;
    this.lastPlayerCell = { x: -1, y: -1 };
    this.flowFieldAge = 0;
  }
};
