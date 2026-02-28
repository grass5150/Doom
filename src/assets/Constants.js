// All game constants - no magic numbers anywhere else
const C = {
  SCREEN_W: 640,
  SCREEN_H: 400,
  TEX_SIZE: 64,     // Texture dimensions (power of 2)
  TEX_MASK: 63,     // TEX_SIZE - 1 for fast mod
  FOV: Math.PI / 3, // 60 degree field of view
  HALF_H: 200,      // SCREEN_H / 2
  MOVE_SPEED: 3.2,
  ROT_SPEED: 0.0025, // radians per pixel of mouse movement
  PLAYER_RADIUS: 0.3,
  BULLET_SPEED: 18.0,
  FIRE_RATE: 0.1,   // seconds between shots (10/sec)
  MAX_AMMO: 200,
  START_AMMO: 100,
  MINIMAP_SIZE: 160,
  MINIMAP_CELL: 7,
  MAX_DIST: 20,     // Max rendering distance
  PLANE_LEN: 0.66,  // Camera plane length (determines FOV)

  // Wall types
  WALL_BRICK: 1,
  WALL_METAL: 2,
  WALL_TECH: 3,
  WALL_STONE: 4,
  WALL_HELL: 5,
  WALL_BLOOD: 6,
  WALL_DOOR: 10,

  // Entity states
  STATE_IDLE: 'IDLE',
  STATE_ALERT: 'ALERT',
  STATE_CHASE: 'CHASE',
  STATE_ATTACK: 'ATTACK',
  STATE_PAIN: 'PAIN',
  STATE_DEAD: 'DEAD',

  // Game states
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  TRANSITION: 'TRANSITION',
  GAME_OVER: 'GAME_OVER',
  WIN: 'WIN',
};
