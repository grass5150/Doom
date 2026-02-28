// Level 3: Hell Vault - final boss arena, deliberately simple + open
// Large hellish arena with pillar obstacles - guarantees navigability
const Level3 = {
  id: 3,
  name: 'HELL VAULT',
  subtitle: 'Face the darkness...',
  floorTexture: 'HELL_FLOOR',
  ceilingTexture: 'DARK',
  bossRequired: true,

  playerStart: { x: 2.5, y: 2.5, angle: 0 },

  // 24x24. Outer hell walls, interior pillars, one large open arena
  // 5=hell, 6=blood, 3=tech. All interior cells are floor (0) except named pillars
  map: [
    [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,5],
    [5,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,6,6,0,0,0,0,0,0,6,6,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,6,6,0,0,0,0,0,0,6,6,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,6,6,0,0,0,0,0,0,6,6,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,6,6,0,0,0,0,0,0,6,6,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
    [5,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,5],
    [5,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,5],
    [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  ],

  entities: [
    // Perimeter guards
    { type: 'zombie',      x: 10.5, y: 2.5  },
    { type: 'zombie',      x: 14.5, y: 2.5  },
    { type: 'zombie',      x: 2.5,  y: 10.5 },
    { type: 'zombie',      x: 21.5, y: 10.5 },
    { type: 'zombie',      x: 2.5,  y: 14.5 },
    { type: 'zombie',      x: 21.5, y: 14.5 },
    // Soldiers flanking
    { type: 'soldier',     x: 6.5,  y: 6.5  },
    { type: 'soldier',     x: 17.5, y: 6.5  },
    { type: 'soldier',     x: 6.5,  y: 17.5 },
    { type: 'soldier',     x: 17.5, y: 17.5 },
    // Demons near blood pillars
    { type: 'demon',       x: 10.5, y: 9.5  },
    { type: 'demon',       x: 14.5, y: 9.5  },
    { type: 'demon',       x: 10.5, y: 15.5 },
    { type: 'demon',       x: 14.5, y: 15.5 },
    // THE BOSS - center arena
    { type: 'boss',        x: 12.5, y: 12.5 },
    // Ammo and health scattered around arena
    { type: 'health_pack', x: 2.5,  y: 2.5,  amount: 50 },
    { type: 'health_pack', x: 21.5, y: 2.5,  amount: 50 },
    { type: 'health_pack', x: 2.5,  y: 21.5, amount: 50 },
    { type: 'health_pack', x: 21.5, y: 21.5, amount: 50 },
    { type: 'health_pack', x: 12.5, y: 2.5,  amount: 40 },
    { type: 'health_pack', x: 2.5,  y: 12.5, amount: 40 },
    { type: 'ammo_pack',   x: 21.5, y: 12.5, amount: 80 },
    { type: 'ammo_pack',   x: 12.5, y: 21.5, amount: 80 },
    { type: 'ammo_pack',   x: 6.5,  y: 12.5, amount: 60 },
    { type: 'ammo_pack',   x: 18.5, y: 12.5, amount: 60 },
    // Exit - bottom right corner, always accessible
    { type: 'exit',        x: 21.5, y: 21.5 },
  ],
};
