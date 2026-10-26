import { SpiritInstance } from '../data/spirits';

// Helper to draw pixelated grids easily on HTML5 Canvas
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  pixelMap: string[],
  colorPalette: Record<string, string>,
  x: number,
  y: number,
  pixelSize: number = 4
) {
  const height = pixelMap.length;
  const width = pixelMap[0].length;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const char = pixelMap[r][c];
      if (char !== '.' && colorPalette[char]) {
        ctx.fillStyle = colorPalette[char];
        ctx.fillRect(x + c * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// 1. Player Sprite Pixels (16x16)
const PLAYER_FRONT = [
  '....BBBBBB......',
  '...BBBBBBBB.....',
  '...YYYYYYYY.....',
  '...YFFFFFFY.....',
  '...F.F..F.F.....',
  '...FFFFFFFF.....',
  '...FFFFFFFF.....',
  '....SFFFFFF.....',
  '...CCCCCCC......',
  '..CCCCCCCC......',
  '..CCCCCCC.......',
  '..C.CCCC.C......',
  '...PPPPPP.......',
  '...PPPPPP.......',
  '...LL..LL.......',
  '...LL..LL.......',
];

const PLAYER_BACK = [
  '....BBBBBB......',
  '...BBBBBBBB.....',
  '...YYYYYYYY.....',
  '...YYYYYYYY.....',
  '...YYYYYYYY.....',
  '...YYYYYYYY.....',
  '....SFFFFFF.....',
  '...CCCCCCC......',
  '..CCCCCCCC......',
  '..CCCCCCCC......',
  '..C.CCCC.C......',
  '...PPPPPP.......',
  '...PPPPPP.......',
  '...LL..LL.......',
  '...LL..LL.......',
];

const PLAYER_LEFT = [
  '.....BBBB.......',
  '....BBBBBB......',
  '....YYYYYY......',
  '....YFFFFF......',
  '....FF.FFF......',
  '....FFFFFF......',
  '....SFFFFF......',
  '....CCCCCC......',
  '....CCCCCC......',
  '....CCCCCC......',
  '....PP.PPP......',
  '....PP.PPP......',
  '....LL.LLL......',
  '....LL.LLL......',
  '.....L...L......',
  '.....L...L......',
];

const PLAYER_RIGHT = [
  '.......BBBB.....',
  '......BBBBBB....',
  '......YYYYYY....',
  '......FFFFFY....',
  '......FFF.FF....',
  '......FFFFFF....',
  '......FFFFFS....',
  '......CCCCCC....',
  '......CCCCCC....',
  '......CCCCCC....',
  '......PPP.PP....',
  '......PPP.PP....',
  '......LLL.LL....',
  '......LLL.LL....',
  '......L...L.....',
  '......L...L.....',
];

const PLAYER_PALETTE: Record<string, string> = {
  B: '#2c3e50', // Cap brim / Hair dark
  Y: '#f39c12', // Student cap / hair highlight
  F: '#ffeaa7', // Face skin
  S: '#fab1a0', // Scarf / Shirt accent
  C: '#0984e3', // School Uniform Jacket
  P: '#2d3436', // Uniform Pants
  L: '#636e72', // Shoes
};

export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  animFrame: number = 0,
  scale: number = 2
) {
  let map = PLAYER_FRONT;
  if (direction === 'up') map = PLAYER_BACK;
  if (direction === 'left') map = PLAYER_LEFT;
  if (direction === 'right') map = PLAYER_RIGHT;

  // Simple step bounce animation
  const bounceY = (animFrame % 2 === 1) ? -1 : 0;
  drawPixelGrid(ctx, map, PLAYER_PALETTE, x, y + bounceY, scale);
}

// 2. Spirit Sprites Renderer
export function drawSpiritSprite(
  ctx: CanvasRenderingContext2D,
  spirit: SpiritInstance,
  x: number,
  y: number,
  size: number = 64,
  isBackSprite: boolean = false
) {
  ctx.save();

  // Floating bob effect
  const time = Date.now() * 0.003;
  const floatY = Math.sin(time) * 4;

  const centerX = x + size / 2;
  const centerY = y + size / 2 + floatY;

  // Draw Elemental Backglow / Aura
  const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, size * 0.55);
  grad.addColorStop(0, spirit.themeColor + 'bb');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  if (isBackSprite) {
    // Back view silhouette / trainer view
    ctx.fillStyle = spirit.themeColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${Math.floor(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spirit.iconSymbol, centerX, centerY);
  } else {
    // Front view spirit illustration with retro pixel aesthetic
    ctx.fillStyle = spirit.themeColor;
    ctx.strokeStyle = '#1e272e';
    ctx.lineWidth = 3;

    // Body base
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 2, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 8, centerY - 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(centerX - 7, centerY - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX + 7, centerY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute Spirit Icon on top
    ctx.font = `${Math.floor(size * 0.42)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spirit.iconSymbol, centerX, centerY - size * 0.22);
  }

  ctx.restore();
}

// 3. Tile Renderer
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileType: number,
  x: number,
  y: number,
  tileSize: number = 32
) {
  switch (tileType) {
    case 0: // Grass / Dirt ground
      ctx.fillStyle = '#78e08f';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#b8e994';
      ctx.fillRect(x + 4, y + 4, 4, 4);
      ctx.fillRect(x + 20, y + 16, 4, 4);
      break;

    case 1: // Path / Dirt road
      ctx.fillStyle = '#f6b93b';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(x + 2, y + 10, 6, 2);
      ctx.fillRect(x + 18, y + 22, 6, 2);
      break;

    case 2: // Tall Grass (Wild spirit encounter!)
      ctx.fillStyle = '#38ada9';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#079992';
      // Grass blades
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i * 8 + 2, y + 4, 4, tileSize - 8);
      }
      break;

    case 3: // Wall / Building obstacle
      ctx.fillStyle = '#4a69bd';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.strokeStyle = '#1e3799';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      break;

    case 4: // Water Pond
      ctx.fillStyle = '#60a3bc';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#82ccdd';
      const waveOffset = (Math.floor(Date.now() / 400) % 2) * 4;
      ctx.fillRect(x + 4 + waveOffset, y + 8, 12, 3);
      ctx.fillRect(x + 16 - waveOffset, y + 20, 10, 3);
      break;

    case 5: // Tree / Forest obstacle
      ctx.fillStyle = '#079992';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#0a3d62';
      ctx.beginPath();
      ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 6: // Korean Shrine Torii Gate / Sacred Shrine Altar
      ctx.fillStyle = '#eb2f06';
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(x + 2, y + 2, tileSize - 4, 6);
      ctx.fillRect(x + 6, y + 8, 4, tileSize - 8);
      ctx.fillRect(x + tileSize - 10, y + 8, 4, tileSize - 8);
      break;

    default:
      ctx.fillStyle = '#78e08f';
      ctx.fillRect(x, y, tileSize, tileSize);
  }
}
