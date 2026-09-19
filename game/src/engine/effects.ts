/**
 * Применение эффектов к состоянию героя.
 *
 * Эффекты бывают двух видов по месту применения:
 *  - при входе в узел (`node.effects`) — «Поставь отметку 6»;
 *  - при выборе конкретной кнопки (`choice.effects`) — «Если ты возьмёшь ключ Розы, поставь отметку 23».
 *
 * Временные модификаторы навыков («Вычитай 1 из Энергии следующие два раза»)
 * хранятся с числом оставшихся применений и тратятся на каждой проверке.
 */

import type { Effect, SkillId } from './types.ts';
import { SKILL_NAMES } from './types.ts';
import type { Hero } from './hero.ts';

export interface TempMod {
  skill: SkillId;
  delta: number;
  /** Сколько проверок ещё действует; null — до особого события («пока не поешь»). */
  chargesLeft: number | null;
  reason: string;
}

export interface JournalEntry {
  at: number;
  kind: 'start' | 'choice' | 'check' | 'effect' | 'map' | 'ending' | 'rollback' | 'note';
  text: string;
  node?: number;
  square?: string;
}

const NUMERALS: Record<string, number> = {
  один: 1, раз: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5,
};

/**
 * Достаёт число применений из текста правила.
 * «следующие два раза» → 2, «в следующий раз» → 1, «до тех пор, пока…» → null (бессрочно).
 */
export function parseCharges(source: string): number | null {
  const text = source.toLowerCase();
  if (text.includes('до тех пор') || text.includes('пока не')) return null;
  if (text.includes('следующий раз')) return 1;
  const match = text.match(/следующи[а-яё]*\s+([а-яё]+)/u);
  if (match) {
    const word = match[1] ?? '';
    const found = Object.entries(NUMERALS).find(([key]) => word.startsWith(key));
    if (found) return found[1];
  }
  return 1;
}

export interface EffectResult {
  hero: Hero;
  marks: number[];
  tempMods: TempMod[];
  items: Record<string, number>;
  notes: JournalEntry[];
}

/** Применяет набор эффектов к срезу состояния. Возвращает новый срез, не мутируя вход. */
export function applyEffects(
  input: {
    hero: Hero;
    marks: readonly number[];
    tempMods: readonly TempMod[];
    items: Readonly<Record<string, number>>;
    node?: number;
    now: number;
  },
  effects: readonly Effect[],
): EffectResult {
  const hero: Hero = { ...input.hero, skills: { ...input.hero.skills } };
  const marks = [...input.marks];
  const tempMods = input.tempMods.map((m) => ({ ...m }));
  const items = { ...input.items };
  const notes: JournalEntry[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case 'set-mark': {
        if (!marks.includes(effect.id)) {
          marks.push(effect.id);
          marks.sort((a, b) => a - b);
          notes.push({
            at: input.now, kind: 'effect', node: input.node,
            text: `Отметка ${effect.id} поставлена`,
          });
        }
        break;
      }
      case 'clear-mark': {
        const at = marks.indexOf(effect.id);
        if (at >= 0) {
          marks.splice(at, 1);
          notes.push({
            at: input.now, kind: 'effect', node: input.node,
            text: `Отметка ${effect.id} стёрта`,
          });
        }
        break;
      }
      case 'skill': {
        hero.skills[effect.skill] += effect.delta;
        notes.push({
          at: input.now, kind: 'effect', node: input.node,
          text: `${SKILL_NAMES[effect.skill]} ${effect.delta > 0 ? '+' : ''}${effect.delta}`,
        });
        break;
      }
      case 'deprive': {
        const charges = parseCharges(effect.source);
        tempMods.push({
          skill: effect.skill,
          delta: effect.delta,
          chargesLeft: charges,
          reason: effect.source,
        });
        notes.push({
          at: input.now, kind: 'effect', node: input.node,
          text: `${SKILL_NAMES[effect.skill]} ${effect.delta}` +
            (charges === null ? ' (бессрочно)' : ` (${charges} раз)`),
        });
        break;
      }
    }
  }

  return { hero, marks, tempMods, items, notes };
}

/** Суммарный модификатор от временных эффектов на конкретный навык. */
export function tempBonus(tempMods: readonly TempMod[], skill: SkillId): number {
  return tempMods.filter((m) => m.skill === skill).reduce((sum, m) => sum + m.delta, 0);
}

/**
 * Тратит по одному заряду у временных модификаторов навыка.
 * Бессрочные (chargesLeft === null) остаются на месте.
 */
export function spendTempMods(tempMods: readonly TempMod[], skill: SkillId): TempMod[] {
  return tempMods
    .map((m) => (m.skill === skill && m.chargesLeft !== null
      ? { ...m, chargesLeft: m.chargesLeft - 1 }
      : { ...m }))
    .filter((m) => m.chargesLeft === null || m.chargesLeft > 0);
}
