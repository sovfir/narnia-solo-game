/** Оформление карты: палитра покрывает рельефы, украшения детерминированы и внутри плитки. */

import { describe, expect, it } from 'vitest';

import terrainJson from '../../src/content/terrain.json' with { type: 'json' };
import { TERRAIN_PALETTE, decorationsFor, type TerrainEntry } from '../../src/three/lowpoly.ts';

const entries = (terrainJson as { squares: TerrainEntry[] }).squares;

describe('low-poly оформление', () => {
  it('для каждого рельефа есть палитра', () => {
    for (const entry of entries) {
      const palette = TERRAIN_PALETTE[entry.terrain];
      expect(palette, `рельеф ${entry.terrain}`).toBeTruthy();
      expect(palette.ground).toBeGreaterThan(0);
      expect(palette.ground).not.toBe(palette.water);
    }
  });

  it('украшения одинаковы при повторном вызове (детерминизм)', () => {
    for (const entry of entries) {
      expect(decorationsFor(entry)).toEqual(decorationsFor(entry));
    }
  });

  it('украшения не вылезают за границы плитки', () => {
    for (const entry of entries) {
      const decorations = decorationsFor(entry);
      expect(decorations.length, `квадрат ${entry.id}`).toBeGreaterThanOrEqual(3);
      expect(decorations.length).toBeLessThanOrEqual(7);
      for (const decoration of decorations) {
        expect(Math.abs(decoration.x), `${entry.id}: ${decoration.kind}`).toBeLessThanOrEqual(0.35);
        expect(Math.abs(decoration.z), `${entry.id}: ${decoration.kind}`).toBeLessThanOrEqual(0.35);
        expect(decoration.scale).toBeGreaterThan(0.5);
        expect(decoration.scale).toBeLessThan(1.6);
      }
    }
  });

  it('подсказки из текста попадают в сцену (фонарь, башня, дом)', () => {
    const lamp = entries.find((entry) => entry.id === '1А')!;      // «фонарный столб»
    expect(decorationsFor(lamp).some((d) => d.kind === 'lamp')).toBe(true);
    const castle = entries.find((entry) => entry.id === '6В')!;    // «башни Кэр-Паравела»
    expect(decorationsFor(castle).some((d) => d.kind === 'tower')).toBe(true);
  });
});
