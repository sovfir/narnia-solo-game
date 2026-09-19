import { describe, expect, it } from 'vitest';

import { ALL_SQUARES, isNeighbour, neighbours, parseSquare, squareId } from '../../src/engine/map.ts';

describe('карта', () => {
  it('содержит 24 квадрата 6×4', () => {
    expect(ALL_SQUARES).toHaveLength(24);
    expect(new Set(ALL_SQUARES).size).toBe(24);
    expect(ALL_SQUARES[0]).toBe('1А');
    expect(ALL_SQUARES.at(-1)).toBe('6Г');
  });

  it('разбирает и собирает идентификатор', () => {
    expect(parseSquare('3Г')).toEqual({ col: 3, row: 3 });
    expect(parseSquare('6А')).toEqual({ col: 6, row: 0 });
    expect(parseSquare('7А')).toBeNull();
    expect(parseSquare('1Д')).toBeNull();
    expect(squareId(4, 1)).toBe('4Б');
    expect(squareId(7, 0)).toBeNull();
  });

  it('считает соседей с диагоналями', () => {
    expect(neighbours('1А').sort()).toEqual(['1Б', '2А', '2Б']);
    expect(neighbours('3Б')).toHaveLength(8);
    expect(neighbours('6Г').sort()).toEqual(['5В', '5Г', '6В']);
  });

  it('проверяет соседство', () => {
    expect(isNeighbour('1А', '2Б')).toBe(true);
    expect(isNeighbour('1А', '3В')).toBe(false);
    expect(isNeighbour('1А', '1А')).toBe(false);
  });
});
