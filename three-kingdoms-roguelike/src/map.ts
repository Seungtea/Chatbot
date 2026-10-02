export function generateMap(width: number, height: number): number[][] {
  const map: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // 1 for wall, 0 for floor
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push(1); // Border walls
      } else {
        // Randomly place some internal walls for simple generation
        // ~10% chance of being a wall
        row.push(Math.random() < 0.1 ? 1 : 0);
      }
    }
    map.push(row);
  }

  return map;
}
