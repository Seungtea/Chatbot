import { Renderer } from './renderer';
import { generateMap } from './map';
import { InputManager } from './input';

export class Game {
  private renderer: Renderer;
  private input: InputManager;
  private map: number[][];

  // Character state
  private charX: number = 1;
  private charY: number = 1;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.input = new InputManager();
    // 320/16 = 20, 240/16 = 15 tiles
    this.map = generateMap(20, 15);

    // Simple logic to ensure character starts on a floor tile
    if (this.map[this.charY][this.charX] === 1) {
        this.map[this.charY][this.charX] = 0;
    }
  }

  public update() {
    const input = this.input.popInput();

    if (input) {
      let nextX = this.charX;
      let nextY = this.charY;

      if (input === 'up') nextY--;
      if (input === 'down') nextY++;
      if (input === 'left') nextX--;
      if (input === 'right') nextX++;

      // Collision check
      if (
        nextX >= 0 && nextX < this.map[0].length &&
        nextY >= 0 && nextY < this.map.length &&
        this.map[nextY][nextX] !== 1 // not a wall
      ) {
        this.charX = nextX;
        this.charY = nextY;
      }
    }
  }

  public render() {
    this.renderer.clear();
    this.renderer.drawMap(this.map);
    this.renderer.drawCharacter(this.charX, this.charY);
  }
}
