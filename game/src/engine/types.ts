/**
 * Типы контента и движка.
 *
 * Источник правды по данным — `content/nodes.json` и `content/squares.json`,
 * которые собирает python-пайплайн (`scripts/build_content.py`) из `texts.md`.
 * Схема соответствует §7.3 game-design.md.
 */

/** Шесть навыков героя. `inner` — Внутренняя сила (моральный слой). */
export type SkillId = 'grip' | 'agility' | 'energy' | 'oratory' | 'insight' | 'inner';

export const SKILLS: readonly SkillId[] = ['grip', 'agility', 'energy', 'oratory', 'insight', 'inner'];

export const SKILL_NAMES: Readonly<Record<SkillId, string>> = {
  grip: 'Хватка',
  agility: 'Изворотливость',
  energy: 'Энергия',
  oratory: 'Красноречие',
  insight: 'Проницательность',
  inner: 'Внутренняя сила',
};

/** Квадрат карты: `1А`…`6Г`. */
export type SquareId = string;

export type EndingKind = 'victory' | 'fall' | 'death';

/** Эффект узла или выбора. */
export type Effect =
  | { type: 'set-mark'; id: number }
  | { type: 'clear-mark'; id: number }
  | { type: 'skill'; skill: SkillId; delta: number }
  | { type: 'deprive'; skill: SkillId; delta: number; source: string };

/** Вариант выбора в узле (кнопка). */
export interface Choice {
  target: number;
  condition: string | null;
  /** Отметки, которые должны стоять, чтобы вариант был доступен (пусто — доступен всегда). */
  checks: number[];
  label: string | null;
  source: string;
  /** Эффекты, которые применяются только при выборе этой кнопки. */
  effects?: Effect[];
  /** true — связка добавлена редакторски (см. content/overrides.json), а не взята из книги. */
  editorial?: boolean;
  editorialNote?: string;
}

/** Ветка проверки кубика: диапазон результата → целевой узел. */
export interface DiceBranch {
  from: number;
  to: number;
  target: number;
}

export interface DiceCheck {
  /** null — в книге проверка без навыка (узел 445). */
  skill: SkillId | null;
  branches: DiceBranch[];
  source: string;
  editorialNote?: string;
}

export interface GameNode {
  id: number;
  kind: 'event';
  narrative: string;
  choices: Choice[];
  check: DiceCheck | null;
  effects: Effect[];
  /** «Вперёд» — переход к выбору квадрата на карте. */
  forward: boolean;
  /** Квадраты, которые узел называет текущей позицией героя. */
  squares: SquareId[];
  /** Отметки, которые узел проверяет своими вариантами выбора. */
  conditions: number[];
  ending: EndingKind | null;
  editorialNotes?: string[];
}

export interface SquareBranch {
  target: number;
  condition: string | null;
  checks: number[];
  mode: 'all' | 'any';
  label?: string | null;
  source: string;
  editorial?: boolean;
  editorialNote?: string;
}

export interface MapSquare {
  id: SquareId;
  kind: 'location';
  narrative: string;
  branches: SquareBranch[];
  forward: boolean;
  squares: SquareId[];
}

/** Проиндексированный контент. */
export interface Content {
  nodes: ReadonlyMap<number, GameNode>;
  squares: ReadonlyMap<SquareId, MapSquare>;
  /** Все узлы в порядке номеров. */
  order: readonly number[];
  /** Версия контента — попадает в сохранения, см. §8.6. */
  version: string;
}
