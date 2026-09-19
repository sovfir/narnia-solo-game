/**
 * Карта 6×4 (rules.md §5, game-design §6.6).
 *
 * Столбцы 1–6, ряды А–Г. Соседство — 8 направлений, включая диагонали.
 */

import type { SquareId } from './types.ts';

export const ROWS = ['А', 'Б', 'В', 'Г'] as const;
export const COLS = [1, 2, 3, 4, 5, 6] as const;

export interface SquareCoord {
  col: number;
  row: number;
}

export const ALL_SQUARES: readonly SquareId[] = COLS.flatMap((c) =>
  ROWS.map((r) => `${c}${r}` as SquareId),
);

/** `3Г` → { col: 3, row: 2 }. Возвращает null, если идентификатор не разобран. */
export function parseSquare(id: SquareId): SquareCoord | null {
  const col = Number(id.slice(0, -1));
  const row = ROWS.indexOf(id.slice(-1) as (typeof ROWS)[number]);
  if (!Number.isInteger(col) || col < 1 || col > COLS.length) return null;
  if (row < 0) return null;
  return { col, row };
}

export function squareId(col: number, row: number): SquareId | null {
  if (col < 1 || col > COLS.length || row < 0 || row >= ROWS.length) return null;
  return `${col}${ROWS[row]}`;
}

const DIRECTIONS: readonly [number, number][] = [
  [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],
];

/** Соседи квадрата — только те, что существуют на карте. */
export function neighbours(id: SquareId): SquareId[] {
  const coord = parseSquare(id);
  if (!coord) return [];
  const result: SquareId[] = [];
  for (const [dx, dy] of DIRECTIONS) {
    const next = squareId(coord.col + dx, coord.row + dy);
    if (next) result.push(next);
  }
  return result;
}

export function isNeighbour(from: SquareId, to: SquareId): boolean {
  return neighbours(from).includes(to);
}
