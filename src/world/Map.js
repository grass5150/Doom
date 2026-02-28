// Grid-based world map
class GameMap {
  constructor(grid) {
    this.grid = grid;
    this.height = grid.length;
    this.width = grid[0] ? grid[0].length : 0;
  }

  getCell(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return 1;
    return this.grid[iy][ix];
  }

  isWall(x, y) {
    return this.getCell(x, y) > 0;
  }

  isSolid(x, y) {
    const v = this.getCell(x, y);
    return v > 0;
  }

  // Check if a circle at (cx,cy) with radius r overlaps any wall
  // Returns {hit, nx, ny} where nx,ny is the resolved position
  resolveCircle(cx, cy, r) {
    let nx = cx, ny = cy;
    const checks = [
      [nx + r, ny], [nx - r, ny],
      [nx, ny + r], [nx, ny - r],
    ];
    for (const [tx, ty] of checks) {
      if (this.isSolid(tx, ty)) {
        const ix = Math.floor(tx), iy = Math.floor(ty);
        // Push out of the wall cell
        const overlapX = (tx > nx) ? (ix - r - nx) : (ix + 1 + r - nx);
        const overlapY = (ty > ny) ? (iy - r - ny) : (iy + 1 + r - ny);
        if (Math.abs(overlapX) < Math.abs(overlapY)) {
          nx += overlapX;
        } else {
          ny += overlapY;
        }
      }
    }
    return { x: nx, y: ny };
  }

  // BFS flow field from (tx,ty) - returns grid of directions toward target
  buildFlowField(tx, ty) {
    const W = this.width, H = this.height;
    const field = new Array(H).fill(null).map(() => new Array(W).fill(null));
    const queue = [];
    const gx = Math.floor(tx), gy = Math.floor(ty);
    if (gx < 0 || gx >= W || gy < 0 || gy >= H) return field;
    field[gy][gx] = { dx: 0, dy: 0 };
    queue.push([gx, gy]);
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      for (const [ddx, ddy] of dirs) {
        const nx = cx + ddx, ny = cy + ddy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        if (field[ny][nx] !== null) continue;
        if (this.isSolid(nx + 0.5, ny + 0.5)) continue;
        field[ny][nx] = { dx: -ddx, dy: -ddy }; // direction toward target
        queue.push([nx, ny]);
      }
    }
    return field;
  }
}
