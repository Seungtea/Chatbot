import { MAPS, MapData, NPC } from './map';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerState {
  x: number; // grid x coordinate
  y: number; // grid y coordinate
  direction: Direction;
  animFrame: number;
  currentMapId: string;
}

export class PlayerEngine {
  public state: PlayerState;

  constructor(initialMapId: string = 'town', x: number = 6, y: number = 8) {
    this.state = {
      x,
      y,
      direction: 'down',
      animFrame: 0,
      currentMapId: initialMapId,
    };
  }

  public getCurrentMap(): MapData {
    return MAPS[this.state.currentMapId] || MAPS['town'];
  }

  public move(dir: Direction): {
    moved: boolean;
    wildEncounter: boolean;
    mapChanged: boolean;
    talkedNpc: NPC | null;
  } {
    this.state.direction = dir;
    this.state.animFrame++;

    let targetX = this.state.x;
    let targetY = this.state.y;

    if (dir === 'up') targetY--;
    if (dir === 'down') targetY++;
    if (dir === 'left') targetX--;
    if (dir === 'right') targetX++;

    const map = this.getCurrentMap();

    // Check Map Boundaries & Connections
    if (targetY < 0) {
      const conn = map.connections.find((c) => c.direction === 'up');
      if (conn) {
        this.state.currentMapId = conn.targetMapId;
        this.state.x = conn.targetX;
        this.state.y = conn.targetY;
        return { moved: true, wildEncounter: false, mapChanged: true, talkedNpc: null };
      }
      return { moved: false, wildEncounter: false, mapChanged: false, talkedNpc: null };
    }

    if (targetY >= map.height) {
      const conn = map.connections.find((c) => c.direction === 'down');
      if (conn) {
        this.state.currentMapId = conn.targetMapId;
        this.state.x = conn.targetX;
        this.state.y = conn.targetY;
        return { moved: true, wildEncounter: false, mapChanged: true, talkedNpc: null };
      }
      return { moved: false, wildEncounter: false, mapChanged: false, talkedNpc: null };
    }

    if (targetX < 0 || targetX >= map.width) {
      return { moved: false, wildEncounter: false, mapChanged: false, talkedNpc: null };
    }

    // Check NPC Collision
    const npc = map.npcs.find((n) => n.x === targetX && n.y === targetY);
    if (npc) {
      return { moved: false, wildEncounter: false, mapChanged: false, talkedNpc: npc };
    }

    // Check Tile Collisions (3: wall, 4: water, 5: tree blocks movement)
    const tileType = map.tiles[targetY][targetX];
    if (tileType === 3 || tileType === 4 || tileType === 5) {
      return { moved: false, wildEncounter: false, mapChanged: false, talkedNpc: null };
    }

    // Movement Successful!
    this.state.x = targetX;
    this.state.y = targetY;

    // Check Wild Spirit Encounter on Tall Grass (tileType === 2)
    let wildEncounter = false;
    if (tileType === 2) {
      // 22% chance of encounter on tall grass tile step
      if (Math.random() < 0.22) {
        wildEncounter = true;
      }
    }

    return { moved: true, wildEncounter, mapChanged: false, talkedNpc: null };
  }

  public getFacingPosition(): { x: number; y: number } {
    let x = this.state.x;
    let y = this.state.y;
    if (this.state.direction === 'up') y--;
    if (this.state.direction === 'down') y++;
    if (this.state.direction === 'left') x--;
    if (this.state.direction === 'right') x++;
    return { x, y };
  }

  public getFacingNPC(): NPC | null {
    const { x, y } = this.getFacingPosition();
    const map = this.getCurrentMap();
    return map.npcs.find((n) => n.x === x && n.y === y) || null;
  }
}
