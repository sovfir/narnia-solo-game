/**
 * Кубики и проверки навыков (rules.md §3).
 *
 * результат = 2d6 + уровень навыка, затем зажимается в [2, 12];
 * полученное число сравнивается с диапазонами веток проверки.
 */

import type { DiceBranch, DiceCheck, SkillId } from './types.ts';

/** Источник случайности: возвращает число в [0, 1). Подменяется в тестах. */
export type Rng = () => number;

export function rollDie(rng: Rng): number {
  return Math.min(6, Math.max(1, Math.floor(rng() * 6) + 1));
}

export function roll2d6(rng: Rng): [number, number] {
  return [rollDie(rng), rollDie(rng)];
}

/** Зажим в допустимый диапазон проверки. */
export function clampResult(value: number): number {
  return Math.min(12, Math.max(2, value));
}

export interface CheckOutcome {
  dice: [number, number];
  /** Сумма кубиков без модификатора. */
  total: number;
  /** Сумма с уровнем навыка после зажима — то, что сравнивается с диапазонами. */
  result: number;
  skill: SkillId | null;
  /** Уровень навыка на момент проверки. */
  skillValue: number;
  branch: DiceBranch;
  target: number;
}

/** Находит ветку проверки для результата. Диапазоны книги покрывают 2..12 без дыр. */
export function pickBranch(branches: readonly DiceBranch[], result: number): DiceBranch | null {
  return branches.find((b) => result >= b.from && result <= b.to) ?? null;
}

/**
 * Разыгрывает проверку навыка.
 * @throws если ветка под результат не найдена (контент повреждён).
 */
export function resolveCheck(
  check: DiceCheck,
  skillValue: number,
  rng: Rng,
): CheckOutcome {
  const dice = roll2d6(rng);
  const total = dice[0] + dice[1];
  const result = clampResult(total + skillValue);
  const branch = pickBranch(check.branches, result);
  if (!branch) {
    throw new Error(`проверка: нет ветки для результата ${result} (диапазоны ${JSON.stringify(check.branches)})`);
  }
  return { dice, total, result, skill: check.skill, skillValue, branch, target: branch.target };
}
