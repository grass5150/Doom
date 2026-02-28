// Heads-Up Display: health bar, ammo, score, face portrait, crosshair
const HUD = {
  _faceCanvas: null,
  _faceCtx: null,

  init() {
    this._faceCanvas = document.createElement('canvas');
    this._faceCanvas.width = 48;
    this._faceCanvas.height = 48;
    this._faceCtx = this._faceCanvas.getContext('2d');
  },

  _drawFace(ctx, hp, maxHp, painTimer) {
    const fc = this._faceCanvas;
    const fx = this._faceCtx;
    fx.clearRect(0, 0, 48, 48);
    const ratio = hp / maxHp;
    // Face background
    fx.fillStyle = '#c8a060';
    fx.fillRect(8, 6, 32, 36);
    // Eyes
    const eyeColor = ratio > 0.6 ? '#222' : ratio > 0.3 ? '#aa3300' : '#ff0000';
    // Pain squint
    const eyeH = painTimer > 0 ? 2 : 6;
    fx.fillStyle = eyeColor;
    fx.fillRect(12, 16, 8, eyeH);
    fx.fillRect(28, 16, 8, eyeH);
    // Mouth
    fx.fillStyle = '#222';
    if (ratio > 0.6) {
      // Slight smile
      fx.fillRect(16, 30, 16, 3);
    } else if (ratio > 0.3) {
      // Grimmace
      fx.fillRect(15, 29, 18, 4);
      fx.fillRect(16, 27, 3, 4);
      fx.fillRect(28, 27, 3, 4);
    } else {
      // Agony
      fx.fillRect(14, 28, 20, 5);
      for (let i = 0; i < 4; i++) fx.fillRect(15+i*4, 28, 2, 5);
    }
    // Blood at low hp
    if (ratio < 0.4 || painTimer > 0) {
      fx.fillStyle = `rgba(200,0,0,${Math.min(1,(1-ratio)*0.8 + (painTimer>0?0.4:0))})`;
      fx.fillRect(10, 5, 4, 12);
      fx.fillRect(34, 8, 3, 8);
    }
    ctx.drawImage(fc, 0, 0);
  },

  render(ctx, player, score) {
    const W = C.SCREEN_W, H = C.SCREEN_H;
    const barH = 40;
    const y0 = H - barH;

    // HUD bar background
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, y0, W, barH);
    ctx.strokeStyle = '#550000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y0, W, barH);

    // Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(60, y0+8, 160, 14);
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    const hpColor = hpRatio > 0.6 ? '#00cc00' : hpRatio > 0.3 ? '#ccaa00' : '#cc2200';
    ctx.fillStyle = hpColor;
    ctx.fillRect(60, y0+8, Math.floor(160 * hpRatio), 14);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(60, y0+8, 160, 14);

    // Health label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Courier New';
    ctx.fillText('HP', 62, y0+20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Courier New';
    ctx.fillText(`${Math.ceil(player.hp)}`, 82, y0+20);

    // Ammo
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Courier New';
    ctx.fillText('AMMO', W-120, y0+14);
    ctx.fillStyle = player.ammo > 20 ? '#ffcc00' : '#ff4400';
    ctx.font = 'bold 18px Courier New';
    ctx.fillText(`${player.ammo}`, W-120, y0+32);

    // Score
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Courier New';
    ctx.fillText('SCORE', W/2-30, y0+14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${score}`, W/2, y0+32);
    ctx.textAlign = 'left';

    // Face portrait
    ctx.fillStyle = '#222';
    ctx.fillRect(4, y0+2, 52, 36);
    ctx.save();
    ctx.translate(4, y0+2);
    this._drawFace(ctx, player.hp, player.maxHp, player.painTimer);
    ctx.restore();

    // Weapon bob indicator (ammo bar visual)
    const ammoBarW = Math.floor((player.ammo / C.MAX_AMMO) * 60);
    ctx.fillStyle = '#664400';
    ctx.fillRect(235, y0+8, 60, 6);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(235, y0+8, ammoBarW, 6);

    // Crosshair
    const cx = W >> 1, cy = (H - barH) >> 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    const cs = 8;
    ctx.beginPath();
    ctx.moveTo(cx - cs, cy); ctx.lineTo(cx + cs, cy);
    ctx.moveTo(cx, cy - cs); ctx.lineTo(cx, cy + cs);
    ctx.stroke();
    // Dot
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(cx-1, cy-1, 2, 2);

    // Damage flash
    if (player.painTimer > 0) {
      ctx.fillStyle = `rgba(220,0,0,${player.painTimer * 0.4})`;
      ctx.fillRect(0, 0, W, H - barH);
    }

    // Weapon sway/bob (text indicator for now — weapon sprite below)
    // Firing flash
    if (player.fireFlash > 0) {
      ctx.fillStyle = `rgba(255,180,0,${player.fireFlash * 0.3})`;
      ctx.fillRect(0, 0, W, H - barH);
    }
  },

  // Draw weapon sprite at bottom center
  renderWeapon(ctx, player) {
    const W = C.SCREEN_W, H = C.SCREEN_H;
    const barH = 40;
    const viewH = H - barH;

    // Weapon bob
    const bobX = Math.sin(player.bobTime * 2) * 4 * player.movingSpeed;
    const bobY = Math.abs(Math.cos(player.bobTime)) * 6 * player.movingSpeed;
    const recoilY = player.recoil * 20;

    const gunW = 120, gunH = 100;
    const gunX = (W - gunW) / 2 + bobX;
    const gunY = viewH - gunH + bobY + recoilY;

    // Simple pixel-art gun drawing
    ctx.save();
    ctx.translate(gunX, gunY);

    // Gun body
    ctx.fillStyle = '#555';
    ctx.fillRect(30, 40, 60, 20);
    // Barrel
    ctx.fillStyle = '#444';
    ctx.fillRect(70, 35, 40, 10);
    // Handle
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(40, 55, 20, 35);
    // Detail
    ctx.fillStyle = '#666';
    ctx.fillRect(32, 42, 10, 6);
    ctx.fillRect(55, 42, 8, 6);
    // Muzzle flash
    if (player.fireFlash > 0) {
      const alpha = player.fireFlash;
      ctx.fillStyle = `rgba(255,220,50,${alpha})`;
      ctx.fillRect(108, 28, 12, 26);
      ctx.fillStyle = `rgba(255,140,0,${alpha * 0.7})`;
      ctx.fillRect(104, 24, 20, 34);
    }
    ctx.restore();
  }
};
