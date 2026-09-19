/**
 * Герой (rules.md §2).
 *
 * Готовый герой: все шесть навыков +1.
 * Свой герой: сумма уровней ровно 6, не больше +3 в один навык,
 * навык без вложенных уровней записывается как −2.
 */

import { SKILLS, type SkillId } from './types.ts';

export interface Hero {
  name: string;
  kind: 'ready' | 'custom';
  /** Текущие уровни навыков (могут меняться предметами, ранами, поступками). */
  skills: Record<SkillId, number>;
}

export const READY_HERO_NAME = 'Робин Трэверсток';
export const MAX_SKILL = 3;
export const UNTRAINED_SKILL = -2;
export const TOTAL_LEVELS = 6;

export type Distribution = Partial<Record<SkillId, number>>;

export type HeroValidation = { ok: true } | { ok: false; errors: string[] };

/** Проверка распределения уровней для своего героя. */
export function validateDistribution(distribution: Distribution): HeroValidation {
  const errors: string[] = [];
  const values = SKILLS.map((s) => distribution[s] ?? 0);

  for (const [skill, value] of Object.entries(distribution) as [SkillId, number][]) {
    if (!Number.isInteger(value) || value < 0) {
      errors.push(`${skill}: уровней должно быть целое неотрицательное число, получено ${value}`);
    } else if (value > MAX_SKILL) {
      errors.push(`${skill}: не больше +${MAX_SKILL} уровней, получено ${value}`);
    }
  }

  const total = values.reduce((a, b) => a + b, 0);
  if (total !== TOTAL_LEVELS) {
    errors.push(`сумма уровней должна быть ${TOTAL_LEVELS}, получено ${total}`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

/** Готовый герой «по умолчанию» — вариант из правила «Быстрые решения» (Приложение B). */
export function createReadyHero(name: string = READY_HERO_NAME): Hero {
  const skills = Object.fromEntries(SKILLS.map((s) => [s, 1])) as Record<SkillId, number>;
  return { name, kind: 'ready', skills };
}

/**
 * Свой герой.
 * @throws если распределение не проходит валидацию.
 */
export function createCustomHero(name: string, distribution: Distribution): Hero {
  const check = validateDistribution(distribution);
  if (!check.ok) {
    throw new Error(`распределение навыков неверно: ${check.errors.join('; ')}`);
  }
  const skills = Object.fromEntries(
    SKILLS.map((s) => [s, (distribution[s] ?? 0) > 0 ? distribution[s]! : UNTRAINED_SKILL]),
  ) as Record<SkillId, number>;
  return { name, kind: 'custom', skills };
}

export function skillValue(hero: Hero, skill: SkillId | null): number {
  if (!skill) return 0;         // проверка без навыка (узел 445) — бросок без модификатора
  return hero.skills[skill];
}
