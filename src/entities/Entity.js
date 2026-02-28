// Base entity: position, health, faction, state
class Entity {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = 0;          // vertical offset (for death animation)
    this.hp = 0;
    this.maxHp = 0;
    this.dead = false;
    this.state = C.STATE_IDLE;
    this.radius = 0.35;
    this.spriteType = type;
    this.animFrame = 0;
    this.animTime = 0;
    this.animSpeed = 0.2; // seconds per frame
  }

  takeDamage(amount) {
    if (this.dead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    } else {
      this.onPain();
    }
  }

  die() {
    this.dead = true;
    this.state = C.STATE_DEAD;
    this.onDeath();
  }

  onPain() {}
  onDeath() {}
  update(dt) {}

  getSpriteFrame() {
    return Sprites.get(this.spriteType, this.animFrame);
  }

  // Animate cycling through frames [start..end]
  animate(dt, start, end, loop = true) {
    this.animTime += dt;
    if (this.animTime >= this.animSpeed) {
      this.animTime = 0;
      this.animFrame++;
      if (this.animFrame > end) {
        this.animFrame = loop ? start : end;
      }
    }
  }
}

// Pickup items (health pack, ammo, exit)
class Pickup extends Entity {
  constructor(type, x, y, amount = 0) {
    super(type, x, y);
    this.amount = amount;
    this.radius = 0.3;
    this.dead = false;
    this.collected = false;
  }

  update(dt) {
    // Bob up and down slightly
    this.z = Math.sin(Date.now() * 0.002) * 0.1;
  }

  getSpriteFrame() {
    if (this.type === 'healthPack') return Sprites.get('healthPack');
    if (this.type === 'ammoPack') return Sprites.get('ammoPack');
    if (this.type === 'exit') return Sprites.get('exit');
    return Sprites.get('healthPack');
  }
}
