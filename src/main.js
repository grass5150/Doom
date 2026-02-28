// Main Game class - ties all systems together, manages game state machine
class Game {
  constructor() {
    this.state = C.MENU;
    this.currentLevelIdx = 0;
    this.score = 0;
    this.bossDefeated = false;

    // Canvas + context
    const canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(canvas, canvas.getContext('2d'));
    this.input = new InputManager(canvas);

    // World state (set per level)
    this.map = null;
    this.player = null;
    this.camera = null;
    this.entities = [];
    this.levelData = null;

    // Game loop
    this.loop = new GameLoop(this);

    // HUD init
    HUD.init();

    // Transition state
    this._transTimer = 0;
    this._transTitle = '';
    this._transSub = '';

    // Boss tracking
    this._bossAlive = false;
    this._exitEnabled = false;

    this._bindUI();
    this._bindEvents();

    // Start the game loop regardless of state (needed for menu animation)
    this.loop.start();
  }

  _bindUI() {
    const $  = id => document.getElementById(id);
    const show = id => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      $(id).classList.add('active');
      document.getElementById('overlay').style.pointerEvents = 'all';
    };
    const hideAll = () => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('overlay').style.pointerEvents = 'none';
    };

    $('startBtn').addEventListener('click', () => {
      hideAll();
      this.startGame();
    });
    $('resumeBtn').addEventListener('click', () => {
      hideAll();
      this.state = C.PLAYING;
      const canvas = document.getElementById('gameCanvas');
      canvas.requestPointerLock();
    });
    $('menuBtn').addEventListener('click', () => {
      show('menu');
      this.state = C.MENU;
    });
    $('restartBtn').addEventListener('click', () => {
      hideAll();
      this.startGame();
    });
    $('deathMenuBtn').addEventListener('click', () => {
      show('menu');
      this.state = C.MENU;
    });
    $('winMenuBtn').addEventListener('click', () => {
      show('menu');
      this.state = C.MENU;
    });
  }

  _bindEvents() {
    EventBus.on('player_died', () => {
      this.state = C.GAME_OVER;
      AudioSystem.playSound('playerDeath');
      const el = document.getElementById('deathScore');
      el.textContent = `Score: ${this.score}`;
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('deathScreen').classList.add('active');
      document.getElementById('overlay').style.pointerEvents = 'all';
      document.exitPointerLock();
    });

    EventBus.on('score', data => {
      this.score += data.amount;
    });

    EventBus.on('enemy_died', data => {
      if (data.enemy instanceof Boss) {
        this.bossDefeated = true;
        this._bossAlive = false;
        this._enableExit();
        EventBus.emit('boss_killed', {});
      }
    });

    EventBus.on('level_exit', () => {
      if (this.levelData && this.levelData.bossRequired && !this.bossDefeated) {
        // Flash message - boss not dead
        this._flashMsg = 'DEFEAT THE BOSS FIRST!';
        this._flashTimer = 2;
        return;
      }
      this._advanceLevel();
    });

    EventBus.on('boss_summon', data => {
      // Spawn a zombie near the boss
      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * 2;
      const z = new Zombie(data.x + Math.cos(angle)*dist, data.y + Math.sin(angle)*dist);
      this.entities.push(z);
    });

    EventBus.on('enemy_attack', data => {
      // Handle melee attacks on player directly
      if (data.type === 'melee') {
        const dx = this.player.x - data.enemy.x;
        const dy = this.player.y - data.enemy.y;
        const dist = Math.hypot(dx, dy);
        if (dist < data.enemy.attackRange + 0.3) {
          this.player.takeDamage(data.damage);
        }
      }
      // Ranged attacks are handled by CombatSystem spawning bullets
    });
  }

  _enableExit() {
    // Find exit pickup and re-enable it if it was disabled
    // (exits are always enabled in our design, boss just blocks them via bossRequired)
    this._exitEnabled = true;
  }

  startGame() {
    this.score = 0;
    this.currentLevelIdx = 0;
    this.bossDefeated = false;
    this._loadLevel(0);
  }

  _loadLevel(idx) {
    EventBus.clear();
    this._bindEvents(); // Rebind after clear

    AISystem.reset();
    CombatSystem.reset();
    CombatSystem.init();

    const levelData = LEVELS[idx];
    const state = LevelLoader.load(levelData);
    this.map = state.map;
    this.player = state.player;
    this.camera = state.camera;
    this.entities = state.entities;
    this.levelData = levelData;
    this.bossDefeated = false;
    this._bossAlive = this.entities.some(e => e instanceof Boss);
    this._exitEnabled = !levelData.bossRequired;
    this._flashMsg = null;
    this._flashTimer = 0;

    this.state = C.PLAYING;

    // Request pointer lock
    const canvas = document.getElementById('gameCanvas');
    canvas.requestPointerLock();
  }

  _advanceLevel() {
    this.currentLevelIdx++;
    if (this.currentLevelIdx >= LEVELS.length) {
      // WIN!
      this._showWin();
      return;
    }

    AudioSystem.playSound('levelComplete');
    this._showTransition(
      'LEVEL COMPLETE',
      LEVELS[this.currentLevelIdx].name,
      () => this._loadLevel(this.currentLevelIdx)
    );
  }

  _showTransition(title, sub, onDone) {
    this.state = C.TRANSITION;
    const el = document.getElementById('levelTitle');
    const el2 = document.getElementById('levelSubtitle');
    el.textContent = title;
    el2.textContent = sub;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('levelTransition').classList.add('active');
    document.getElementById('overlay').style.pointerEvents = 'none';
    document.exitPointerLock();
    setTimeout(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('overlay').style.pointerEvents = 'none';
      if (onDone) onDone();
    }, 3000);
  }

  _showWin() {
    this.state = C.WIN;
    document.getElementById('winScore').textContent = `Final Score: ${this.score}`;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('winScreen').classList.add('active');
    document.getElementById('overlay').style.pointerEvents = 'all';
    document.exitPointerLock();
  }

  update(dt) {
    if (this.state !== C.PLAYING) return;

    // Input: pause
    if (this.input.consumeEsc()) {
      this.state = C.PAUSED;
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('pauseScreen').classList.add('active');
      document.getElementById('overlay').style.pointerEvents = 'all';
      document.exitPointerLock();
      return;
    }

    // Minimap toggle
    if (this.input.consumeTab()) {
      this.renderer.showMinimap = !this.renderer.showMinimap;
    }

    // Update player audio state
    AudioSystem.setPlayerState(this.player.x, this.player.y, this.camera.angle);

    // Update player
    this.player.update(dt, this.input, this.map, this.camera);

    // Update all entities (enemies + pickups)
    for (const e of this.entities) {
      if (e instanceof Pickup) {
        e.update(dt);
      }
    }

    // AI system (enemies)
    AISystem.update(dt, this.entities, this.player, this.map);

    // Combat system (bullets + particles)
    CombatSystem.update(dt, this.entities, this.player, this.map);

    // Collision: entity vs entity, player vs pickup
    CollisionSystem.resolveEntities(this.entities, this.player);
    CollisionSystem.checkPickups(this.player, this.entities);

    // Flash message timer
    if (this._flashTimer > 0) this._flashTimer -= dt;

    // Clean up dead entities that have finished death animation (after 3 seconds)
    // (We keep them for the death sprite, just don't remove immediately)
  }

  render(alpha) {
    const ctx = this.renderer.ctx;

    if (this.state === C.PLAYING || this.state === C.PAUSED) {
      this.renderer.render(
        C.PLAYING, // Always render 3D scene
        this.player,
        this.camera,
        this.map,
        this.entities,
        CombatSystem.bullets,
        CombatSystem.particles,
        this.score
      );

      // Flash message (boss not dead etc.)
      if (this._flashTimer > 0 && this._flashMsg) {
        const alpha = Math.min(1, this._flashTimer);
        ctx.fillStyle = `rgba(255,80,0,${alpha * 0.9})`;
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this._flashMsg, C.SCREEN_W/2, C.SCREEN_H/2 - 60);
        ctx.textAlign = 'left';
      }

      // Boss health bar
      this._renderBossHUD(ctx);
    } else if (this.state === C.MENU) {
      // Simple animated menu background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, C.SCREEN_W, C.SCREEN_H);
      ctx.fillStyle = '#1a0000';
      for (let i = 0; i < 20; i++) {
        const h = 10 + Math.sin(Date.now() * 0.001 + i) * 5;
        ctx.fillRect(i * 32, C.SCREEN_H - h - Math.random() * 40, 30, h + 40);
      }
    }
  }

  _renderBossHUD(ctx) {
    // Find boss
    const boss = this.entities.find(e => e instanceof Boss && !e.dead);
    if (!boss) return;

    const W = C.SCREEN_W;
    const barY = 8, barH = 16, barW = 300;
    const barX = (W - barW) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 22);
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY + 14, barW, barH - 4);

    const ratio = boss.hp / boss.maxHp;
    const phaseColors = ['#cc0000', '#cc6600', '#cc00cc'];
    ctx.fillStyle = phaseColors[boss.phase - 1] || '#cc0000';
    ctx.fillRect(barX, barY + 14, Math.floor(barW * ratio), barH - 4);

    ctx.strokeStyle = '#550000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + 14, barW, barH - 4);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ ${boss.type.toUpperCase()} — PHASE ${boss.phase} ⚠`, W/2, barY + 12);
    ctx.textAlign = 'left';
  }
}

// Bootstrap on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window._game = new Game();
});
