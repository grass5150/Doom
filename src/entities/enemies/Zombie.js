// Zombie: HP 30, fast, melee only, mindless chase
class Zombie extends EnemyBase {
  constructor(x, y) {
    super('zombie', x, y,
      /*hp*/30, /*speed*/2.8, /*damage*/15, /*range*/0.8, /*cooldown*/1.0
    );
    this.scoreValue = 100;
  }

  _doAttack(player) {
    if (!this.hasLOS) return;
    EventBus.emit('enemy_attack', { enemy: this, damage: this.attackDamage, type: 'melee' });
    AudioSystem.playSound('zombieAttack', this.x, this.y);
  }
}
