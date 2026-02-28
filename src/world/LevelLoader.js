// Converts raw level data into live game state
const LevelLoader = {
  load(levelData) {
    const map = new GameMap(levelData.map);

    // Set floor/ceiling textures
    const texMap = {
      'CONCRETE': Textures.concrete,
      'DARK': Textures.dark,
      'HELL_FLOOR': Textures.hellFloor,
    };
    Textures.floorTex = texMap[levelData.floorTexture] || Textures.concrete;
    Textures.ceilTex  = texMap[levelData.ceilingTexture] || Textures.dark;

    const { x, y, angle } = levelData.playerStart;
    const player = new Player(x, y, angle);
    const camera = new Camera(x, y, angle);

    const entities = [];
    for (const eDef of levelData.entities) {
      const e = this._createEntity(eDef);
      if (e) entities.push(e);
    }

    return { map, player, camera, entities, levelData };
  },

  _createEntity(def) {
    switch (def.type) {
      case 'zombie':      return new Zombie(def.x, def.y);
      case 'soldier':     return new Soldier(def.x, def.y);
      case 'demon':       return new Demon(def.x, def.y);
      case 'boss':        return new Boss(def.x, def.y);
      case 'health_pack': return new Pickup('healthPack', def.x, def.y, def.amount || 25);
      case 'ammo_pack':   return new Pickup('ammoPack', def.x, def.y, def.amount || 30);
      case 'exit':        return new Pickup('exit', def.x, def.y, 0);
      default: return null;
    }
  }
};
