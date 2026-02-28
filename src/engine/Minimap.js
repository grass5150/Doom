// Overhead minimap overlay (toggled with Tab)
const Minimap = {
  render(ctx, map, camera, entities) {
    const { MINIMAP_SIZE, MINIMAP_CELL } = C;
    const padding = 8;
    const mx0 = padding, my0 = padding;

    // Determine visible area in map coords
    const viewCells = Math.floor(MINIMAP_SIZE / MINIMAP_CELL);
    const halfView = viewCells >> 1;
    const camGX = Math.floor(camera.x);
    const camGY = Math.floor(camera.y);
    const startX = camGX - halfView;
    const startY = camGY - halfView;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(mx0, my0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw cells
    for (let dy = 0; dy < viewCells; dy++) {
      for (let dx = 0; dx < viewCells; dx++) {
        const gx = startX + dx, gy = startY + dy;
        const cell = map.getCell(gx + 0.5, gy + 0.5);
        const px = mx0 + dx * MINIMAP_CELL;
        const py = my0 + dy * MINIMAP_CELL;
        if (cell > 0) {
          // Wall color by type
          const colors = ['#888','#884422','#7788aa','#223344','#666','#882211','#990000'];
          ctx.fillStyle = colors[Math.min(cell, colors.length-1)] || '#888';
          ctx.fillRect(px, py, MINIMAP_CELL, MINIMAP_CELL);
        } else {
          ctx.fillStyle = '#111';
          ctx.fillRect(px, py, MINIMAP_CELL, MINIMAP_CELL);
        }
      }
    }

    // Entities
    for (const e of entities) {
      if (e.dead && e.state !== C.STATE_DEAD) continue;
      const dx = e.x - startX, dy = e.y - startY;
      const px = mx0 + dx * MINIMAP_CELL;
      const py = my0 + dy * MINIMAP_CELL;
      if (px < mx0 || px >= mx0 + MINIMAP_SIZE || py < my0 || py >= my0 + MINIMAP_SIZE) continue;
      const colors = { zombie: '#00cc00', soldier: '#cccc00', demon: '#cc4400', boss: '#cc00cc', healthPack: '#00ffaa', ammoPack: '#ffaa00', exit: '#00ffff' };
      ctx.fillStyle = colors[e.type] || '#aaaaaa';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }

    // Player (centered)
    const playerPX = mx0 + halfView * MINIMAP_CELL;
    const playerPY = my0 + halfView * MINIMAP_CELL;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerPX - 3, playerPY - 3, 6, 6);

    // Direction indicator
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playerPX, playerPY);
    ctx.lineTo(
      playerPX + Math.cos(camera.angle) * 12,
      playerPY + Math.sin(camera.angle) * 12
    );
    ctx.stroke();

    // Border
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx0, my0, MINIMAP_SIZE, MINIMAP_SIZE);
  }
};
