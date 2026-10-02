import { describe, it, expect } from 'vitest';
import { generateMap } from '../src/map';

describe('Map Generation', () => {
  it('should generate a map with correct dimensions', () => {
    const width = 20;
    const height = 15;
    const map = generateMap(width, height);

    expect(map.length).toBe(height);
    expect(map[0].length).toBe(width);
  });

  it('should have border walls', () => {
    const width = 10;
    const height = 10;
    const map = generateMap(width, height);

    // Check top and bottom rows
    for (let x = 0; x < width; x++) {
      expect(map[0][x]).toBe(1);
      expect(map[height - 1][x]).toBe(1);
    }

    // Check left and right columns
    for (let y = 0; y < height; y++) {
      expect(map[y][0]).toBe(1);
      expect(map[y][width - 1]).toBe(1);
    }
  });
});
