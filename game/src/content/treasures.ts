/**
 * Значимые предметы, которые в книге записываются отметками.
 *
 * Игра ставит отметку — по правилам это «память» о находке (rules.md §4).
 * Здесь этим отметкам даны имена, чтобы лист персонажа показывал находки,
 * а не только номера: ключи важны для финала, самоцветы — для обмена у Карги.
 */

export type TreasureKind = 'key' | 'gem' | 'boon';

export interface Treasure {
  mark: number;
  name: string;
  kind: TreasureKind;
  note?: string;
}

export const TREASURES: readonly Treasure[] = [
  { mark: 6, name: 'Ключ с Глазом Осьминога', kind: 'key', note: 'нужный ключ к книге' },
  { mark: 19, name: 'Ключ Змеи', kind: 'key' },
  { mark: 22, name: 'Ключ Луны', kind: 'key' },
  { mark: 23, name: 'Ключ Розы', kind: 'key' },
  { mark: 38, name: 'Гранат', kind: 'gem' },
  { mark: 39, name: 'Изумруд', kind: 'gem' },
  { mark: 40, name: 'Алмаз', kind: 'gem' },
  { mark: 41, name: 'Аметист', kind: 'gem' },
  { mark: 9, name: 'Исполненное желание', kind: 'boon', note: 'дар Белого Оленя' },
  { mark: 21, name: 'Настоящее имя Карги', kind: 'boon' },
  { mark: 35, name: 'Попробовал вишни', kind: 'boon' },
  { mark: 36, name: 'Побывал в Тиларуне', kind: 'boon' },
];

const BY_MARK = new Map(TREASURES.map((treasure) => [treasure.mark, treasure]));

/** Предметы, которые герой несёт прямо сейчас (по отметкам). */
export function treasuresFor(marks: readonly number[]): Treasure[] {
  const found = new Map<number, Treasure>();
  for (const mark of marks) {
    const treasure = BY_MARK.get(mark);
    if (treasure) found.set(treasure.mark, treasure);
  }
  return [...found.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.mark - b.mark);
}

export const KIND_LABELS: Record<TreasureKind, string> = {
  key: 'Ключи',
  gem: 'Самоцветы',
  boon: 'Память о поступках',
};
