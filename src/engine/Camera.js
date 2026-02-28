// Player camera: position + direction + view plane
class Camera {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this._updateVectors();
  }

  _updateVectors() {
    this.dirX = Math.cos(this.angle);
    this.dirY = Math.sin(this.angle);
    // Camera plane perpendicular to dir; length = PLANE_LEN gives ~60 deg FOV
    this.planeX = -this.dirY * C.PLANE_LEN;
    this.planeY = this.dirX * C.PLANE_LEN;
  }

  rotate(delta) {
    this.angle += delta;
    this._updateVectors();
  }

  setAngle(angle) {
    this.angle = angle;
    this._updateVectors();
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
}
