/**
 * Игровой движок: чистое ядро без DOM и three.js (game-design §8.2, §8.5).
 *
 * Движок принимает состояние и действие, возвращает новое состояние,
 * список применённых эффектов и следующий переход.
 */

import { availableChoices, checksPass } from './conditions.ts';
import { resolveCheck, type Rng } from './dice.ts';
import {
  applyEffects, spendTempMods, tempBonus,
  type JournalEntry, type TempMod,
} from './effects.ts';
import { skillValue, type Hero } from './hero.ts';
import { neighbours } from './map.ts';
import type {
  Choice, Content, Effect, EndingKind, GameNode, MapSquare, SkillId, SquareId,
} from './types.ts';

export interface Snapshot {
  node: number;
  square: SquareId | null;
  marks: number[];
  items: Record<string, number>;
  tempMods: TempMod[];
  skills: Record<SkillId, number>;
  journalLength: number;
  visitedNodes: number[];
  ending: EndingKind | null;
}

export interface GameState {
  runId: string;
  hero: Hero;
  /** Текущий квадрат карты, если герой его знает. */
  square: SquareId | null;
  node: number;
  marks: number[];
  items: Record<string, number>;
  tempMods: TempMod[];
  journal: JournalEntry[];
  visitedNodes: number[];
  startedAt: number;
  /** Для отката на один шаг (§6.11). */
  history: Snapshot[];
  ending: EndingKind | null;
  finished: boolean;
  /** Последний бросок — для экрана S10. */
  lastRoll: { dice: [number, number]; total: number; result: number; skill: SkillId | null; skillValue: number } | null;
}

export type Action =
  | { type: 'start'; hero: Hero }
  | { type: 'choose'; index: number }
  | { type: 'roll'; rng: Rng }
  | { type: 'forward'; to?: SquareId }
  | { type: 'enterSquare'; id: SquareId }
  | { type: 'rollback' }
  | { type: 'note'; text: string };

export interface ReduceResult {
  state: GameState;
  /** Эффекты, применённые этим действием (для анимации в UI). */
  effects: Effect[];
  next?: number;
}

export interface EngineOptions {
  /** Точка входа по умолчанию: Пролог — Аслан отправляет героя (317). */
  startNode?: number;
  now?: () => number;
  runId?: () => string;
}

export interface Engine {
  readonly content: Content;
  start(hero: Hero): ReduceResult;
  reduce(state: GameState, action: Action): ReduceResult;
  node(state: GameState): GameNode;
  square(id: SquareId): MapSquare;
  /** Доступные сейчас варианты выбора узла. */
  choices(state: GameState): { choice: Choice; index: number }[];
  /** Куда можно пойти с карты (режим «Вперёд», §S11). */
  moveTargets(state: GameState): SquareId[];
}

export const DEFAULT_START_NODE = 317;

function clone(state: GameState): GameState {
  return {
    ...state,
    marks: [...state.marks],
    tempMods: state.tempMods.map((m) => ({ ...m })),
    items: { ...state.items },
    journal: [...state.journal],
    visitedNodes: [...state.visitedNodes],
    history: [...state.history],
    hero: { ...state.hero, skills: { ...state.hero.skills } },
    lastRoll: state.lastRoll ? { ...state.lastRoll, dice: [...state.lastRoll.dice] as [number, number] } : null,
  };
}

function snapshot(state: GameState): Snapshot {
  return {
    node: state.node,
    square: state.square,
    marks: [...state.marks],
    items: { ...state.items },
    tempMods: state.tempMods.map((m) => ({ ...m })),
    skills: { ...state.hero.skills },
    journalLength: state.journal.length,
    visitedNodes: [...state.visitedNodes],
    ending: state.ending,
  };
}

export function createEngine(content: Content, options: EngineOptions = {}): Engine {
  const now = options.now ?? (() => Date.now());
  const startNode = options.startNode ?? DEFAULT_START_NODE;
  let runCounter = 0;
  const runId = options.runId ?? (() => `run-${++runCounter}-${now()}`);

  function requireNode(id: number): GameNode {
    const node = content.nodes.get(id);
    if (!node) throw new Error(`узел ${id} отсутствует в контенте`);
    return node;
  }

  /** Вход в узел: применяет эффекты узла, отмечает посещение, фиксирует финал. */
  function enter(state: GameState, id: number): { state: GameState; effects: Effect[] } {
    const node = requireNode(id);
    const applied = applyEffects(
      {
        hero: state.hero,
        marks: state.marks,
        tempMods: state.tempMods,
        items: state.items,
        node: id,
        now: now(),
      },
      node.effects,
    );
    const next = clone(state);
    next.node = id;
    next.hero = applied.hero;
    next.marks = applied.marks;
    next.tempMods = applied.tempMods;
    next.items = applied.items;
    next.journal = [...state.journal, ...applied.notes];
    if (!next.visitedNodes.includes(id)) next.visitedNodes.push(id);
    if (node.squares.length === 1) next.square = node.squares[0]!;
    if (node.ending) {
      next.ending = node.ending;
      next.finished = true;
      next.journal.push({
        at: now(), kind: 'ending', node: id,
        text: node.ending === 'victory' ? 'Победа' : node.ending === 'fall' ? 'Падение' : 'Гибель',
      });
    }
    return { state: next, effects: node.effects };
  }

  function start(hero: Hero): ReduceResult {
    const base: GameState = {
      runId: runId(),
      hero,
      square: null,
      node: startNode,
      marks: [],
      items: {},
      tempMods: [],
      journal: [],
      visitedNodes: [],
      startedAt: now(),
      history: [],
      ending: null,
      finished: false,
      lastRoll: null,
    };
    const entry = enter(base, startNode);
    entry.state.journal = [
      { at: now(), kind: 'start', node: startNode, text: `Начало партии: ${hero.name}` },
      ...entry.state.journal,
    ];
    return { state: entry.state, effects: entry.effects, next: startNode };
  }

  function reduce(state: GameState, action: Action): ReduceResult {
    switch (action.type) {
      case 'start':
        return start(action.hero);

      case 'choose': {
        const node = requireNode(state.node);
        const choice = node.choices[action.index];
        if (!choice) {
          throw new Error(`узел ${state.node}: варианта ${action.index} не существует`);
        }
        if (!checksPass(state.marks, choice.checks, choice.mode ?? 'all')) {
          throw new Error(`узел ${state.node}: вариант ${action.index} недоступен (нет отметок ${choice.checks.join(', ')})`);
        }
        const applied = applyEffects(
          {
            hero: state.hero, marks: state.marks, tempMods: state.tempMods,
            items: state.items, node: state.node, now: now(),
          },
          choice.effects ?? [],
        );
        let next = clone(state);
        next.history.push(snapshot(state));
        next.hero = applied.hero;
        next.marks = applied.marks;
        next.tempMods = applied.tempMods;
        next.items = applied.items;
        next.journal = [
          ...state.journal,
          ...applied.notes,
          {
            at: now(), kind: 'choice', node: state.node,
            text: choice.label ?? `вариант ${action.index}`,
          },
        ];
        const entry = enter(next, choice.target);
        return { state: entry.state, effects: [...(choice.effects ?? []), ...entry.effects], next: choice.target };
      }

      case 'roll': {
        const node = requireNode(state.node);
        if (!node.check) throw new Error(`узел ${state.node}: нет проверки кубика`);
        const base = skillValue(state.hero, node.check.skill);
        const bonus = node.check.skill ? tempBonus(state.tempMods, node.check.skill) : 0;
        const outcome = resolveCheck(node.check, base + bonus, action.rng);

        let next = clone(state);
        next.history.push(snapshot(state));
        if (node.check.skill) next.tempMods = spendTempMods(state.tempMods, node.check.skill);
        next.lastRoll = {
          dice: outcome.dice,
          total: outcome.total,
          result: outcome.result,
          skill: node.check.skill,
          skillValue: base + bonus,
        };
        next.journal = [
          ...state.journal,
          {
            at: now(), kind: 'check', node: state.node,
            text: `Бросок ${outcome.dice[0]}+${outcome.dice[1]}=${outcome.total}` +
              `${bonus ? ` ${bonus > 0 ? '+' : ''}${bonus}` : ''} → ${outcome.result} → ${outcome.target}`,
          },
        ];
        const entry = enter(next, outcome.target);
        return { state: entry.state, effects: entry.effects, next: outcome.target };
      }

      case 'forward': {
        const node = requireNode(state.node);
        if (!node.forward && node.squares.length === 0) {
          throw new Error(`узел ${state.node}: переход «Вперёд» недоступен`);
        }
        const next = clone(state);
        next.history.push(snapshot(state));
        if (action.to) next.square = action.to;
        next.journal = [
          ...state.journal,
          {
            at: now(), kind: 'map', node: state.node, square: action.to ?? next.square ?? undefined,
            text: action.to ? `Переход в квадрат ${action.to}` : 'Открыта карта',
          },
        ];
        return { state: next, effects: [] };
      }

      case 'enterSquare': {
        const square = content.squares.get(action.id);
        if (!square) throw new Error(`квадрат ${action.id} отсутствует в контенте`);
        const branch = square.branches.find((b) => checksPass(state.marks, b.checks, b.mode));
        const next = clone(state);
        next.history.push(snapshot(state));
        next.square = action.id;
        if (!branch) {
          next.journal = [
            ...state.journal,
            { at: now(), kind: 'map', square: action.id, text: `Квадрат ${action.id}: нет доступной ветки` },
          ];
          return { state: next, effects: [] };
        }
        const entry = enter(next, branch.target);
        return { state: entry.state, effects: entry.effects, next: branch.target };
      }

      case 'rollback': {
        const last = state.history.at(-1);
        if (!last) throw new Error('откат невозможен: история пуста');
        const restored = clone(state);
        restored.node = last.node;
        restored.square = last.square;
        restored.marks = [...last.marks];
        restored.items = { ...last.items };
        restored.tempMods = last.tempMods.map((m) => ({ ...m }));
        restored.hero = { ...state.hero, skills: { ...last.skills } };
        restored.visitedNodes = [...last.visitedNodes];
        restored.ending = last.ending;
        restored.finished = last.ending !== null;
        restored.history = state.history.slice(0, -1);
        restored.journal = [
          ...state.journal.slice(0, last.journalLength),
          { at: now(), kind: 'rollback', node: last.node, text: `Откат к узлу ${last.node}` },
        ];
        return { state: restored, effects: [] };
      }

      case 'note': {
        const next = clone(state);
        next.journal = [...state.journal, { at: now(), kind: 'note', node: state.node, text: action.text }];
        return { state: next, effects: [] };
      }
    }
  }

  return {
    content,
    start,
    reduce,
    node: (state) => requireNode(state.node),
    square: (id) => {
      const square = content.squares.get(id);
      if (!square) throw new Error(`квадрат ${id} отсутствует в контенте`);
      return square;
    },
    choices: (state) =>
      availableChoices(requireNode(state.node).choices, state.marks)
        .map((choice) => ({ choice, index: requireNode(state.node).choices.indexOf(choice) })),
    moveTargets: (state) => (state.square ? neighbours(state.square) : [...content.squares.keys()]),
  };
}
