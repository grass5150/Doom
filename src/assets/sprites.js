// Procedural sprite generation - all drawn on offscreen canvases at startup
const Sprites = (() => {
  const SIZE = 64;

  function makeCanvas() {
    const cv = document.createElement('canvas');
    cv.width = SIZE; cv.height = SIZE;
    return cv;
  }

  function spriteToArray(canvas) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, SIZE, SIZE);
  }

  // Helper to draw a filled rect
  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // --- ZOMBIE (green decaying humanoid) ---
  function makeZombie(frame = 0) {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    const bob = frame % 2 === 0 ? 0 : 1;
    // Body
    rect(ctx, 22, 28+bob, 20, 22, '#3a5c2a');
    // Head
    rect(ctx, 24, 16+bob, 16, 14, '#4a7038');
    // Eyes
    rect(ctx, 27, 19+bob, 3, 3, '#cc0000');
    rect(ctx, 34, 19+bob, 3, 3, '#cc0000');
    // Arms
    rect(ctx, 14, 30+bob, 8, 16, '#3a5c2a');
    rect(ctx, 42, 30+bob, 8, 16, '#3a5c2a');
    // Legs
    const legL = frame === 1 ? 2 : -2;
    rect(ctx, 22, 50, 8, 12, '#2a4a1a');
    rect(ctx, 34, 50, 8, 12, '#2a4a1a');
    // Outstretched arms for attack
    if (frame === 4) {
      rect(ctx, 4, 28, 16, 6, '#3a5c2a');
      rect(ctx, 44, 28, 16, 6, '#3a5c2a');
    }
    // Death (fallen)
    if (frame === 5) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      rect(ctx, 10, 42, 44, 14, '#3a5c2a');
      rect(ctx, 10, 46, 44, 8, '#2a4a1a');
    }
    return spriteToArray(cv);
  }

  // --- SOLDIER (armored humanoid with gun) ---
  function makeSoldier(frame = 0) {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    const bob = frame % 2 === 0 ? 0 : 1;
    // Body (armor)
    rect(ctx, 21, 28+bob, 22, 22, '#6e7040');
    // Head (helmet)
    rect(ctx, 22, 15+bob, 20, 15, '#5a5c30');
    // Visor
    rect(ctx, 24, 18+bob, 16, 5, '#00aaff');
    // Arms
    rect(ctx, 13, 30+bob, 8, 14, '#6e7040');
    rect(ctx, 43, 30+bob, 8, 14, '#6e7040');
    // Gun (right hand)
    rect(ctx, 43, 35+bob, 14, 4, '#333');
    rect(ctx, 51, 33+bob, 6, 4, '#444');
    // Legs
    rect(ctx, 22, 50, 8, 12, '#505230');
    rect(ctx, 34, 50, 8, 12, '#505230');
    // Attack - gun flash
    if (frame === 4) {
      rect(ctx, 55, 33, 6, 6, '#ffaa00');
    }
    // Death
    if (frame === 5) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      rect(ctx, 8, 40, 48, 16, '#6e7040');
      rect(ctx, 18, 42, 28, 10, '#5a5c30');
    }
    return spriteToArray(cv);
  }

  // --- DEMON (large red monster) ---
  function makeDemon(frame = 0) {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    const bob = frame % 2 === 0 ? 0 : 2;
    // Large body
    rect(ctx, 16, 24+bob, 32, 28, '#8b1a1a');
    // Head (merged with body, big)
    rect(ctx, 18, 12+bob, 28, 16, '#7a1515');
    // Eyes (glowing)
    rect(ctx, 22, 15+bob, 6, 6, '#ff4400');
    rect(ctx, 36, 15+bob, 6, 6, '#ff4400');
    // Horns
    rect(ctx, 20, 8+bob, 4, 8, '#5a1010');
    rect(ctx, 40, 8+bob, 4, 8, '#5a1010');
    // Claws
    rect(ctx, 6, 26+bob, 12, 18, '#8b1a1a');
    rect(ctx, 46, 26+bob, 12, 18, '#8b1a1a');
    rect(ctx, 4, 40+bob, 6, 4, '#333');
    rect(ctx, 54, 40+bob, 6, 4, '#333');
    // Legs
    rect(ctx, 18, 52, 10, 10, '#6a1414');
    rect(ctx, 36, 52, 10, 10, '#6a1414');
    // Attack
    if (frame === 4) {
      rect(ctx, 2, 22, 18, 24, '#8b1a1a');
      rect(ctx, 44, 22, 18, 24, '#8b1a1a');
    }
    // Death
    if (frame === 5) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      rect(ctx, 8, 38, 48, 20, '#8b1a1a');
      rect(ctx, 14, 42, 36, 12, '#6a1010');
    }
    return spriteToArray(cv);
  }

  // --- BOSS (massive skull-like entity) ---
  function makeBoss(frame = 0) {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    const pulse = frame % 2 === 0 ? 0 : 1;
    // Huge body
    rect(ctx, 8, 10+pulse, 48, 50, '#1a0a2a');
    // Skull face
    rect(ctx, 12, 8+pulse, 40, 32, '#2a1a3a');
    // Eye sockets
    rect(ctx, 16, 14+pulse, 10, 10, '#000');
    rect(ctx, 38, 14+pulse, 10, 10, '#000');
    // Glowing eyes
    rect(ctx, 18, 16+pulse, 6, 6, '#ff00ff');
    rect(ctx, 40, 16+pulse, 6, 6, '#ff00ff');
    // Teeth
    for (let i = 0; i < 5; i++) {
      rect(ctx, 16 + i*6, 32+pulse, 4, 8, '#cccccc');
    }
    // Arms/tentacles
    rect(ctx, 0, 20+pulse, 10, 30, '#1a0a2a');
    rect(ctx, 54, 20+pulse, 10, 30, '#1a0a2a');
    // Phase 2: flame aura
    if (frame >= 2) {
      ctx.globalAlpha = 0.5;
      rect(ctx, 4, 5, 56, 56, '#440044');
      ctx.globalAlpha = 1;
      // More intense eyes
      rect(ctx, 17, 15+pulse, 8, 8, '#ff44ff');
      rect(ctx, 39, 15+pulse, 8, 8, '#ff44ff');
    }
    // Phase 3: chaos
    if (frame >= 4) {
      ctx.globalAlpha = 0.6;
      rect(ctx, 0, 0, 64, 64, '#220022');
      ctx.globalAlpha = 1;
      rect(ctx, 16, 15+pulse, 10, 10, '#ffffff');
      rect(ctx, 38, 15+pulse, 10, 10, '#ffffff');
    }
    // Death
    if (frame === 6) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (let i = 0; i < 8; i++) {
        rect(ctx, 4+i*8, 40+Math.random()*16, 6, 20-i*2, '#1a0a2a');
      }
    }
    return spriteToArray(cv);
  }

  // --- HEALTH PACK ---
  function makeHealthPack() {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    rect(ctx, 16, 20, 32, 32, '#ffffff');
    rect(ctx, 28, 22, 8, 28, '#ff0000');
    rect(ctx, 18, 30, 28, 12, '#ff0000');
    return spriteToArray(cv);
  }

  // --- AMMO PACK ---
  function makeAmmoPack() {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    rect(ctx, 16, 24, 32, 24, '#998833');
    rect(ctx, 20, 20, 8, 8, '#ccbb44');
    rect(ctx, 32, 20, 8, 8, '#ccbb44');
    for (let i = 0; i < 6; i++) {
      rect(ctx, 18+i*5, 26, 3, 12, '#aaaaaa');
    }
    return spriteToArray(cv);
  }

  // --- EXIT MARKER ---
  function makeExit() {
    const cv = makeCanvas();
    const ctx = cv.getContext('2d');
    rect(ctx, 20, 10, 24, 40, '#004400');
    rect(ctx, 22, 12, 20, 36, '#006600');
    // Arrow
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(32, 16); ctx.lineTo(40, 28); ctx.lineTo(36, 28);
    ctx.lineTo(36, 42); ctx.lineTo(28, 42); ctx.lineTo(28, 28);
    ctx.lineTo(24, 28); ctx.closePath();
    ctx.fill();
    return spriteToArray(cv);
  }

  // Pre-generate all sprite frames
  const cache = {
    zombie: [0,1,2,3,4,5].map(f => makeZombie(f)),
    soldier: [0,1,2,3,4,5].map(f => makeSoldier(f)),
    demon: [0,1,2,3,4,5].map(f => makeDemon(f)),
    boss: [0,1,2,3,4,5,6].map(f => makeBoss(f)),
    healthPack: makeHealthPack(),
    ammoPack: makeAmmoPack(),
    exit: makeExit(),
  };

  return {
    get(type, frame = 0) {
      const s = cache[type];
      if (!s) return cache.healthPack;
      if (s.data) return s; // single image
      return s[Math.min(frame, s.length-1)] || s[0];
    }
  };
})();
