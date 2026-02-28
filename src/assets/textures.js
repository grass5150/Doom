// Procedural texture generation - all textures created at startup, zero file deps
const Textures = (() => {
  const S = C.TEX_SIZE;
  const SQ = S * S * 4;

  function make() { return new Uint8ClampedArray(SQ); }

  function setPixel(tex, x, y, r, g, b, a = 255) {
    const i = (y * S + x) * 4;
    tex[i] = r; tex[i+1] = g; tex[i+2] = b; tex[i+3] = a;
  }

  function noise(x, y, seed = 0) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
    return n - Math.floor(n);
  }

  // --- BRICK (wall type 1) ---
  function makeBrick() {
    const t = make();
    const brickW = 16, brickH = 8;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const row = Math.floor(y / brickH);
        const offset = (row % 2) * (brickW / 2);
        const bx = (x + offset) % brickW;
        const by = y % brickH;
        const isMortar = bx === 0 || by === 0;
        const n = noise(x, y) * 20 - 10;
        if (isMortar) {
          setPixel(t, x, y, 40+n, 30+n, 25+n);
        } else {
          setPixel(t, x, y, 160+n, 55+n, 40+n);
        }
      }
    }
    return t;
  }

  // --- METAL (wall type 2) ---
  function makeMetal() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 1) * 15;
        const band = Math.sin(y * 0.4) * 10;
        const v = 90 + band + n;
        // Rivets
        const rx = x % 16, ry = y % 16;
        const rivet = (rx === 2 && ry === 2) || (rx === 13 && ry === 13);
        if (rivet) {
          setPixel(t, x, y, 180, 180, 190);
        } else {
          setPixel(t, x, y, v, v+2, v+8);
        }
      }
    }
    return t;
  }

  // --- TECH (wall type 3) ---
  function makeTech() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        setPixel(t, x, y, 10, 15, 10);
      }
    }
    // Circuit lines
    const lines = [4, 12, 20, 32, 44, 56];
    for (const y of lines) {
      for (let x = 0; x < S; x++) {
        setPixel(t, x, y, 0, 180, 60);
        if (y+1 < S) setPixel(t, x, y+1, 0, 60, 20);
      }
    }
    for (const x of lines) {
      for (let y = 0; y < S; y++) {
        if (noise(x, y, 2) > 0.7) setPixel(t, x, y, 0, 150, 50);
      }
    }
    // Dots
    for (let i = 0; i < 20; i++) {
      const dx = Math.floor(noise(i, 0, 3) * S);
      const dy = Math.floor(noise(0, i, 4) * S);
      setPixel(t, dx, dy, 0, 255, 80);
    }
    return t;
  }

  // --- STONE (wall type 4) ---
  function makeStone() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 5) * 30;
        const crack = noise(x*2, y*3, 6) < 0.05;
        if (crack) {
          setPixel(t, x, y, 30, 30, 28);
        } else {
          setPixel(t, x, y, 75+n, 72+n, 65+n);
        }
      }
    }
    return t;
  }

  // --- HELL (wall type 5) ---
  function makeHell() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 7) * 40;
        const flame = Math.max(0, Math.sin(x * 0.3) * 30 + Math.cos(y * 0.2) * 20);
        setPixel(t, x, y, 100+n+flame, 10+flame*0.3, 5);
      }
    }
    return t;
  }

  // --- BLOOD (wall type 6) ---
  function makeBlood() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 8) * 25;
        const drip = noise(x, y*0.1, 9) > 0.8;
        if (drip) {
          setPixel(t, x, y, 140+n, 5, 5);
        } else {
          setPixel(t, x, y, 60+n, 8+n*0.2, 8+n*0.2);
        }
      }
    }
    return t;
  }

  // --- CONCRETE floor ---
  function makeConcrete() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 10) * 25;
        const seam = (x % 32 === 0 || y % 32 === 0) ? -15 : 0;
        setPixel(t, x, y, 80+n+seam, 80+n+seam, 78+n+seam);
      }
    }
    return t;
  }

  // --- DARK ceiling ---
  function makeDark() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 11) * 15;
        setPixel(t, x, y, 25+n, 25+n, 28+n);
      }
    }
    return t;
  }

  // --- HELL floor ---
  function makeHellFloor() {
    const t = make();
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const n = noise(x, y, 12) * 30;
        setPixel(t, x, y, 70+n, 15+n*0.3, 5);
      }
    }
    return t;
  }

  const walls = [
    null,                // 0 = no wall
    makeBrick(),         // 1
    makeMetal(),         // 2
    makeTech(),          // 3
    makeStone(),         // 4
    makeHell(),          // 5
    makeBlood(),         // 6
    makeStone(),         // 7 (fallback)
    makeMetal(),         // 8 (fallback)
    makeBrick(),         // 9 (fallback)
  ];

  return {
    walls,
    concrete: makeConcrete(),
    dark: makeDark(),
    hellFloor: makeHellFloor(),
    // Per-level floor/ceiling textures, set by LevelLoader
    floorTex: null,
    ceilTex: null,

    getWall(type) {
      return walls[type] || walls[1];
    }
  };
})();
