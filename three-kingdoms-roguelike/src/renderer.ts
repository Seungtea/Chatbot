export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 16; // 16x16 tiles
  private internalWidth: number = 320;
  private internalHeight: number = 240;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }
    const context = this.canvas.getContext('2d');
    if (!context) {
        throw new Error("Could not get 2D context");
    }
    this.ctx = context;

    // Set internal resolution
    this.canvas.width = this.internalWidth;
    this.canvas.height = this.internalHeight;

    // Scale up for display using CSS
    this.scaleCanvas();
    window.addEventListener('resize', () => this.scaleCanvas());
  }

  private scaleCanvas() {
    const scaleX = window.innerWidth / this.internalWidth;
    const scaleY = window.innerHeight / this.internalHeight;
    const scale = Math.floor(Math.min(scaleX, scaleY)) || 1; // Integer scaling for pixel art

    this.canvas.style.width = `${this.internalWidth * scale}px`;
    this.canvas.style.height = `${this.internalHeight * scale}px`;
  }

  public clear() {
    this.ctx.fillStyle = '#000'; // Black background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawMap(map: number[][]) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        if (tile === 1) {
          this.ctx.fillStyle = '#555'; // Wall color
        } else {
          this.ctx.fillStyle = '#222'; // Floor color
        }
        this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

        // Optional: draw grid lines for debugging/retro feel
        this.ctx.strokeStyle = '#111';
        this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }
  }

  public drawCharacter(x: number, y: number) {
      this.ctx.fillStyle = '#f00'; // Red dot for character
      // Draw slightly smaller than tile
      this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
  }
}
