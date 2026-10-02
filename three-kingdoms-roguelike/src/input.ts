export type Direction = 'up' | 'down' | 'left' | 'right' | null;

export class InputManager {
  public lastInput: Direction = null;

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.lastInput = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.lastInput = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.lastInput = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.lastInput = 'right';
        break;
    }
  }

  public popInput(): Direction {
      const input = this.lastInput;
      this.lastInput = null;
      return input;
  }
}
