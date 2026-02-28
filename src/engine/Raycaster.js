// DDA Raycasting engine - one ray per screen column
// Writes directly into a Uint8ClampedArray (ImageData.data) and fills zBuffer
const Raycaster = {
  // zBuffer: one entry per column, stores perpendicular wall distance
  zBuffer: new Float32Array(C.SCREEN_W),

  cast(camera, map, imgData) {
    const { SCREEN_W, SCREEN_H, HALF_H, TEX_SIZE, TEX_MASK } = C;
    const data = imgData.data;
    const zBuf = this.zBuffer;

    for (let x = 0; x < SCREEN_W; x++) {
      // Camera-space x: -1 (left) to +1 (right)
      const camX = 2 * x / SCREEN_W - 1;

      // Ray direction
      const rdx = camera.dirX + camera.planeX * camX;
      const rdy = camera.dirY + camera.planeY * camX;

      // Current map cell
      let mx = Math.floor(camera.x);
      let my = Math.floor(camera.y);

      // Length of ray from one x/y side to next x/y side
      const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx);
      const ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);

      // Step direction + initial side distances
      let stepX, stepY, sdx, sdy;
      if (rdx < 0) { stepX = -1; sdx = (camera.x - mx) * ddx; }
      else          { stepX =  1; sdx = (mx + 1 - camera.x) * ddx; }
      if (rdy < 0) { stepY = -1; sdy = (camera.y - my) * ddy; }
      else          { stepY =  1; sdy = (my + 1 - camera.y) * ddy; }

      // DDA march
      let hit = false, side = 0, wallType = 0;
      for (let safety = 0; safety < 64 && !hit; safety++) {
        if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; }
        else            { sdy += ddy; my += stepY; side = 1; }
        wallType = map.getCell(mx, my);
        if (wallType > 0) hit = true;
      }

      // Perpendicular wall distance (no fisheye)
      const perpDist = side === 0 ? sdx - ddx : sdy - ddy;
      zBuf[x] = perpDist;

      // Wall slice height
      const lineH = Math.floor(SCREEN_H / perpDist);
      const drawStart = Math.max(0, HALF_H - (lineH >> 1));
      const drawEnd   = Math.min(SCREEN_H - 1, HALF_H + (lineH >> 1));

      // Texture x coordinate (wallX = fractional hit position)
      let wallX;
      if (side === 0) wallX = camera.y + perpDist * rdy;
      else            wallX = camera.x + perpDist * rdx;
      wallX -= Math.floor(wallX);

      let texX = Math.floor(wallX * TEX_SIZE);
      if (side === 0 && rdx > 0) texX = TEX_SIZE - texX - 1;
      if (side === 1 && rdy < 0) texX = TEX_SIZE - texX - 1;
      texX = texX & TEX_MASK;

      // Get texture pixel data
      const tex = Textures.getWall(wallType);
      // Side 1 walls darkened ~40% for depth illusion
      const shade = side === 1 ? 0.60 : 1.0;

      // Distance-based fog
      const fog = Math.max(0, 1 - perpDist / C.MAX_DIST);

      // Render wall slice into ImageData
      const step = TEX_SIZE / lineH;
      let texPos = (drawStart - HALF_H + (lineH >> 1)) * step;

      for (let y = drawStart; y <= drawEnd; y++) {
        const texY = Math.floor(texPos) & TEX_MASK;
        texPos += step;
        const ti = (texY * TEX_SIZE + texX) * 4;
        const pi = (y * SCREEN_W + x) * 4;
        const f = shade * fog;
        data[pi]   = tex[ti]   * f;
        data[pi+1] = tex[ti+1] * f;
        data[pi+2] = tex[ti+2] * f;
        data[pi+3] = 255;
      }
    }
  }
};
