// Billboard sprite renderer - depth-sorted, zBuffer-occluded
const SpriteRenderer = {
  _sorted: [],

  render(camera, entities, bullets, imgData) {
    const { SCREEN_W, SCREEN_H, HALF_H } = C;
    const data = imgData.data;
    const zBuf = Raycaster.zBuffer;

    // Collect visible/relevant sprites
    const sprites = [];

    // Enemy bullets (player bullets are too fast to see)
    for (const b of bullets) {
      if (b.fromPlayer) continue;
      const dx = b.x - camera.x, dy = b.y - camera.y;
      sprites.push({ x: b.x, y: b.y, dx, dy, dist: dx*dx+dy*dy, isBullet: true });
    }

    // Entities
    for (const e of entities) {
      if (e.dead && e.state !== C.STATE_DEAD) continue;
      const dx = e.x - camera.x;
      const dy = e.y - camera.y;
      sprites.push({ x: e.x, y: e.y, dx, dy, dist: dx*dx+dy*dy, entity: e });
    }

    // Sort far to near (painter's algorithm)
    sprites.sort((a, b) => b.dist - a.dist);

    // Inverse camera matrix determinant
    const invDet = 1 / (camera.planeX * camera.dirY - camera.dirX * camera.planeY);

    for (const sp of sprites) {
      const dx = sp.dx, dy = sp.dy;

      // Transform sprite into camera space
      const transformX = invDet * (camera.dirY * dx - camera.dirX * dy);
      const transformY = invDet * (-camera.planeY * dx + camera.planeX * dy);

      if (transformY <= 0.05) continue; // behind camera

      // Screen x center of sprite
      const sprScreenX = Math.floor((SCREEN_W / 2) * (1 + transformX / transformY));

      // Sprite size on screen
      const sprH = Math.abs(Math.floor(SCREEN_H / transformY));
      const sprW = sprH; // square sprites

      const drawStartY = Math.max(0, Math.floor(-sprH / 2 + HALF_H));
      const drawEndY   = Math.min(SCREEN_H - 1, Math.floor(sprH / 2 + HALF_H));
      const drawStartX = Math.max(0, Math.floor(sprScreenX - sprW / 2));
      const drawEndX   = Math.min(SCREEN_W - 1, Math.floor(sprScreenX + sprW / 2));

      // Bullet: render as a small bright orb directly into ImageData
      if (sp.isBullet) {
        const bSize = Math.max(1, Math.floor(4 / transformY));
        for (let sy = Math.max(0, HALF_H - bSize); sy < Math.min(SCREEN_H, HALF_H + bSize); sy++) {
          for (let sx = Math.max(0, sprScreenX - bSize); sx < Math.min(SCREEN_W, sprScreenX + bSize); sx++) {
            if (transformY >= zBuf[sx]) continue;
            const pi = (sy * SCREEN_W + sx) * 4;
            data[pi] = 255; data[pi+1] = 100; data[pi+2] = 0; data[pi+3] = 255;
          }
        }
        continue;
      }

      // Get sprite image data
      const e = sp.entity;
      let imgDat;
      if (e.getSpriteFrame) {
        imgDat = e.getSpriteFrame();
      } else {
        imgDat = Sprites.get(e.spriteType || 'healthPack');
      }
      const spData = imgDat.data;
      const spSize = imgDat.width;

      // Fog
      const dist = Math.sqrt(sp.dist);
      const fog = Math.max(0, 1 - dist / C.MAX_DIST);

      // Draw columns
      for (let sx = drawStartX; sx <= drawEndX; sx++) {
        // Occlusion check
        if (transformY >= zBuf[sx]) continue;

        const texX = Math.floor((sx - (-sprW / 2 + sprScreenX)) * spSize / sprW);
        if (texX < 0 || texX >= spSize) continue;

        for (let sy = drawStartY; sy <= drawEndY; sy++) {
          const texY = Math.floor((sy - drawStartY) * spSize / sprH);
          if (texY < 0 || texY >= spSize) continue;

          const ti = (texY * spSize + texX) * 4;
          if (spData[ti+3] < 10) continue; // transparent

          const pi = (sy * SCREEN_W + sx) * 4;
          data[pi]   = spData[ti]   * fog;
          data[pi+1] = spData[ti+1] * fog;
          data[pi+2] = spData[ti+2] * fog;
          data[pi+3] = 255;
        }
      }
    }
  }
};
