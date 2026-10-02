import { Renderer } from './renderer';
import { Game } from './game';

let game: Game;

function init() {
  const renderer = new Renderer('game-canvas');
  game = new Game(renderer);

  requestAnimationFrame(loop);
}

// Fixed time step loop could be added here,
// but for a turn based grid game, rendering every frame is fine
function loop() {
  game.update();
  game.render();
  requestAnimationFrame(loop);
}

// Start the game when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
