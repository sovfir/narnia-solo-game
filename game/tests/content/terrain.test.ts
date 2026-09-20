/** Разметка квадратов для 3D-сцены: все 24 квадрата, допустимый рельеф, непустые детали. */

import { describe, expect, it } from 'vitest';

import terrainJson from '../../src/content/terrain.json' with { type: 'json' };
import squaresJson from '../../content/squares.json' with { type: 'json' };

const TERRAIN_VALUES = ['forest','hills','mountains','river','lake','sea','castle','village','marsh','ruins','snowfield','clearing'] as const;

interface TerrainEntry { id: string; terrain: string; features: string[]; palette: string }
const squares = (terrainJson as { squares: TerrainEntry[] }).squares;

describe('разметка рельефа', () => {
  it('покрывает все 24 квадрата карты', () => {
    const ids = squares.map((s) => s.id).sort();
    const expected = (squaresJson as { id: string }[]).map((s) => s.id).sort();
    expect(ids).toEqual(expected);
    expect(ids).toHaveLength(24);
  });

  it('рельеф только из известных значений', () => {
    for (const square of squares) {
      expect(TERRAIN_VALUES, `квадрат ${square.id}`).toContain(square.terrain as typeof TERRAIN_VALUES[number]);
    }
  });

  it('у каждого квадрата есть 2–5 деталей и палитра', () => {
    for (const square of squares) {
      expect(square.features.length, `квадрат ${square.id}`).toBeGreaterThanOrEqual(2);
      expect(square.features.length, `квадрат ${square.id}`).toBeLessThanOrEqual(5);
      expect(square.palette.length, `квадрат ${square.id}`).toBeGreaterThan(3);
    }
  });

  it('рельеф встречается в разумных пропорциях', () => {
    const counts = new Map<string, number>();
    for (const square of squares) counts.set(square.terrain, (counts.get(square.terrain) ?? 0) + 1);
    expect(counts.get('forest')! + counts.get('hills')!).toBeGreaterThanOrEqual(8);
  });
});
