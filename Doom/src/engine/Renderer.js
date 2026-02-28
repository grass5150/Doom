// Orchestrates all draw calls each frame
class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this._imageData = null;
    this.showMinimap = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    // Maintain internal 640x400 resolution, scale to fit window
    this.canvas.width = C.SCREEN_W;
    this.canvas.height = C.SCREEN_H;
    const scaleX = window.innerWidth / C.SCREEN_W;
    const scaleY = window.innerHeight / C.SCREEN_H;
    const scale = Math.min(scaleX, scaleY);
    this.canvas.style.width = `${C.SCREEN_W * scale}px`;
    this.canvas.style.height = `${C.SCREEN_H * scale}px`;
    this._imageData = this.ctx.createImageData(C.SCREEN_W, C.SCREEN_H);
  }

  render(gameState, player, camera, map, entities, bullets, particles, score) {
    const ctx = this.ctx;
    const imgData = this._imageData;

    if (gameState === C.PLAYING || gameState === C.PAUSED) {
      // 1. Floor + ceiling → ImageData
      FloorCeiling.render(camera, imgData);

      // 2. Walls (DDA) → same ImageData, fill zBuffer
      Raycaster.cast(camera, map, imgData);

      // 3. Sprites (entities) → same ImageData, respect zBuffer
      SpriteRenderer.render(camera, entities, bullets, imgData);

      // 4. Single putImageData for entire 3D scene
      ctx.putImageData(imgData, 0, 0);

      // 5. Particles (small rects on top of 3D)
      this._renderParticles(ctx, camera, particles);

      // 6. Weapon sprite
      HUD.renderWeapon(ctx, player);

      // 7. HUD overlay
      HUD.render(ctx, player, score);

      // 8. Minimap overlay
      if (this.showMinimap) {
        Minimap.render(ctx, map, camera, entities);
      }
    }
  }

  _renderParticles(ctx, camera, particles) {
    for (const p of particles) {
      if (p.life <= 0) continue;
      // Project particle to screen
      const dx = p.x - camera.x, dy = p.y - camera.y;
      const invDet = 1 / (camera.planeX * camera.dirY - camera.dirX * camera.planeY);
      const tx = invDet * (camera.dirY * dx - camera.dirX * dy);
      const tz = invDet * (-camera.planeY * dx + camera.planeX * dy);
      if (tz <= 0.1) continue;
      const sx = Math.floor((C.SCREEN_W / 2) * (1 + tx / tz));
      const sy = Math.floor(C.HALF_H + p.z / tz * C.SCREEN_H * 0.5);
      const size = Math.max(1, Math.floor(3 / tz));
      const alpha = Math.min(1, p.life);
      ctx.fillStyle = p.color || `rgba(255,100,0,${alpha})`;
      ctx.fillRect(sx - size/2, sy - size/2, size, size);
    }
  }

  renderMenu() {}
  renderTransition(ctx, title, subtitle) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, C.SCREEN_W, C.SCREEN_H);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(title, C.SCREEN_W/2, C.SCREEN_H/2 - 20);
    ctx.fillStyle = '#aaa';
    ctx.font = '16px Courier New';
    ctx.fillText(subtitle, C.SCREEN_W/2, C.SCREEN_H/2 + 20);
    ctx.textAlign = 'left';
  }
}
