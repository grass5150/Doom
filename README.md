# DOOM ECHO

A browser-based first-person shooter inspired by Doom, built entirely with vanilla JavaScript and HTML5 Canvas. No dependencies, no build step — just open `index.html`.

## Play

Download or clone the repo, then open `index.html` in any modern browser. No server required.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A | Strafe left |
| D | Strafe right |
| ← / → | Turn |
| Mouse | Look (click canvas to lock) |
| Left Click / Space | Fire (full-auto) |
| Tab | Toggle minimap |
| Esc | Pause |

## Features

- **DDA raycasting engine** — textured walls, floor, and ceiling rendered in a single `putImageData()` call per frame
- **Procedural assets** — all textures and sprites generated at startup, zero external files
- **4 enemy types**
  - Zombie — fast melee chaser
  - Soldier — ranged attack, strafes while shooting
  - Demon — slow until charge range, then rushes at 3× speed
  - Boss — 3 phase-based attack patterns, spawns reinforcements
- **3 levels** — UAC Facility → Deeper Complex → Hell Vault (boss arena)
- **Full-auto machine gun** — 10 rounds/sec, spread, visual recoil, weapon bob
- **BFS flow-field pathfinding** — enemies navigate around walls toward the player
- **Positional Web Audio** — all sounds procedurally generated, volume and stereo pan based on distance and angle
- **Minimap** — toggleable overhead view (Tab)
- **Fixed 60 Hz physics timestep** with interpolated rendering

## Project Structure

```
index.html
style.css
src/
├── assets/
│   ├── Constants.js       # All magic numbers
│   ├── textures.js        # Procedural wall/floor/ceiling textures
│   └── sprites.js         # Procedural enemy/item sprite frames
├── engine/
│   ├── Camera.js          # Position, direction, view plane
│   ├── Raycaster.js       # DDA algorithm, zBuffer
│   ├── FloorCeiling.js    # Inverse-projection floor/ceiling
│   ├── SpriteRenderer.js  # Depth-sorted billboard sprites
│   ├── HUD.js             # Health, ammo, score, face portrait, crosshair
│   ├── Minimap.js         # Overhead minimap overlay
│   └── Renderer.js        # Orchestrates all draw calls
├── world/
│   ├── Map.js             # Grid map, collision, BFS flow field
│   ├── LevelLoader.js     # Converts level data into live game state
│   └── levels/
│       ├── level1.js      # UAC Facility
│       ├── level2.js      # Deeper Complex
│       ├── level3.js      # Hell Vault
│       └── levelIndex.js
├── entities/
│   ├── Entity.js          # Base class + Pickup
│   ├── Player.js          # Movement, shooting, health
│   └── enemies/
│       ├── EnemyBase.js   # FSM (IDLE/ALERT/CHASE/ATTACK/PAIN/DEAD)
│       ├── Zombie.js
│       ├── Soldier.js
│       ├── Demon.js
│       └── Boss.js
└── systems/
    ├── GameLoop.js        # rAF loop, fixed timestep
    ├── InputManager.js    # WASD, pointer lock, fire
    ├── CollisionSystem.js # AABB vs grid, circle vs circle
    ├── AISystem.js        # Enemy FSM ticks, flow field rebuild
    ├── CombatSystem.js    # Bullet physics, hit detection, particles
    ├── AudioSystem.js     # Web Audio API, procedural sounds
    └── EventBus.js        # Pub/sub messaging
```

## Technical Notes

- Scripts loaded with plain `<script>` tags and global namespacing so the game works from `file://` without a local server
- Internal resolution is 1280×800, CSS-scaled to fill the window
- Enemy LOS checks are staggered by distance to keep AI cheap at 60 fps
- Bullets are sub-stepped each frame to prevent tunneling through thin walls
