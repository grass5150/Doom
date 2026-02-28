// Textured floor and ceiling casting (inverse projection per row)
const FloorCeiling = {
  render(camera, imgData) {
    const { SCREEN_W, SCREEN_H, HALF_H, TEX_SIZE, TEX_MASK, MAX_DIST } = C;
    const data = imgData.data;
    const floorTex = Textures.floorTex || Textures.concrete;
    const ceilTex  = Textures.ceilTex  || Textures.dark;

    const dirX = camera.dirX, dirY = camera.dirY;
    const plX = camera.planeX, plY = camera.planeY;

    // Left ray direction (at camera x = -1)
    const leftRX = dirX - plX, leftRY = dirY - plY;
    // Right ray direction (at camera x = +1)
    const rightRX = dirX + plX, rightRY = dirY + plY;

    for (let y = 0; y < SCREEN_H; y++) {
      const isFloor = y > HALF_H;

      // p = how far below (floor) or above (ceiling) the horizon line
      const p = isFloor ? (y - HALF_H) : (HALF_H - y);
      if (p === 0) continue;

      // Row distance: how far in world units this row represents
      const rowDist = HALF_H / p;

      // Distance-based fog
      const fog = Math.max(0.05, 1 - rowDist / MAX_DIST);
      const ceilFog = fog * 0.7; // ceilings always slightly darker

      // Step vector per pixel along this row
      const stepX = rowDist * (rightRX - leftRX) / SCREEN_W;
      const stepY = rowDist * (rightRY - leftRY) / SCREEN_W;

      // Starting position (left edge of screen)
      let floorX = camera.x + rowDist * leftRX;
      let floorY = camera.y + rowDist * leftRY;

      for (let x = 0; x < SCREEN_W; x++) {
        // Texture coordinates (fractional parts * TEX_SIZE)
        const tx = Math.floor(floorX * TEX_SIZE) & TEX_MASK;
        const ty = Math.floor(floorY * TEX_SIZE) & TEX_MASK;
        floorX += stepX;
        floorY += stepY;

        const pi = (y * SCREEN_W + x) * 4;

        if (isFloor) {
          const ti = (ty * TEX_SIZE + tx) * 4;
          data[pi]   = floorTex[ti]   * fog;
          data[pi+1] = floorTex[ti+1] * fog;
          data[pi+2] = floorTex[ti+2] * fog;
          data[pi+3] = 255;
        } else {
          const ti = (ty * TEX_SIZE + tx) * 4;
          data[pi]   = ceilTex[ti]   * ceilFog;
          data[pi+1] = ceilTex[ti+1] * ceilFog;
          data[pi+2] = ceilTex[ti+2] * ceilFog;
          data[pi+3] = 255;
        }
      }
    }
  }
};
