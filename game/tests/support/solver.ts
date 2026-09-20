/**
 * Поиск «золотых путей» (§7.5) обходом с памятью о посещённом.
 *
 * Полный BFS по состояниям не подходит: маршруты к финалам длинные (десятки ходов),
 * а пространство состояний включает квадрат и набор отметок. Поэтому пути ищутся
 * проходами с приоритетом новых узлов: игрок выбирает действие, ведущее туда,
 * где он ещё не был. Каждый найденный путь затем воспроизводится движком.
 */

import { createEngine, type Action, type GameState } from '../../src/engine/engine.ts';
import { neighbours } from '../../src/engine/map.ts';
import type { Content, SkillId, SquareId } from '../../src/engine/types.ts';

export const SOLVER_HERO = {
  name: 'разведчик',
  kind: 'ready' as const,
  skills: { grip: 1, agility: 1, energy: 1, oratory: 1, insight: 1, inner: 1 } as Record<SkillId, number>,
};

/**
 * Шаг золотого пути в сериализуемом виде: бросок хранится суммой кубиков,
 * поэтому путь можно записать в фикстуру и воспроизвести позже.
 */
export type GoldenStep =
  | { type: 'choose'; index: number }
  | { type: 'roll'; total: number }
  | { type: 'forward'; to: string }
  | { type: 'enterSquare'; id: string };

export interface GoldenPath {
  ending: number;
  kind: string;
  steps: GoldenStep[];
  /** Номер прохода, которым путь найден. */
  run: number;
}

/** Превращает шаг фикстуры в действие движка (для броска синтезирует rng). */
export function materialize(step: GoldenStep): Action {
  switch (step.type) {
    case 'choose': return { type: 'choose', index: step.index };
    case 'roll': return { type: 'roll', rng: rngForTotal(step.total) };
    case 'forward': return { type: 'forward', to: step.to };
    case 'enterSquare': return { type: 'enterSquare', id: step.id };
  }
}

/** rng, дающий ровно заданную сумму двух кубиков. */
export function rngForTotal(sum: number): () => number {
  const first = Math.max(1, Math.min(6, sum - 1));
  const second = Math.max(1, Math.min(6, sum - first));
  const values = [first, second];
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)] ?? 1;
    index += 1;
    return (value - 0.5) / 6;
  };
}

/** Детерминированный ГПСЧ (mulberry32). */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Step {
  action?: GoldenStep;
  next: GameState;
}

function nextStates(
  engine: ReturnType<typeof createEngine>,
  state: GameState,
  rng: () => number,
): Step[] {
  const options: Step[] = [];
  const node = engine.node(state);

  for (const { index } of engine.choices(state)) {
    const step: GoldenStep = { type: 'choose', index };
    options.push({ action: step, next: engine.reduce(state, materialize(step)).state });
  }

  if (node.check) {
    const skillValue = node.check.skill ? state.hero.skills[node.check.skill] : 0;
    const sum = 2 + Math.floor(rng() * 11);
    const result = Math.min(12, Math.max(2, sum + skillValue));
    const branch = node.check.branches.find((b) => result >= b.from && result <= b.to);
    if (branch) {
      const step: GoldenStep = { type: 'roll', total: sum };
      options.push({ action: step, next: engine.reduce(state, materialize(step)).state });
    }
  }

  if (node.forward || node.squares.length > 0) {
    const from: SquareId | null = state.square;
    const targets = from ? neighbours(from) : [...engine.content.squares.keys()];
    const shuffled = [...targets].sort(() => rng() - 0.5);
    for (const square of shuffled) {
      const forwardStep: GoldenStep = { type: 'forward', to: square };
      const enterStep: GoldenStep = { type: 'enterSquare', id: square };
      const afterForward = engine.reduce(state, materialize(forwardStep)).state;
      const entered = engine.reduce(afterForward, materialize(enterStep)).state;
      options.push({ action: forwardStep, next: afterForward });
      options.push({ action: enterStep, next: entered });
    }
  }

  return options;
}

export interface SimulationOptions {
  runs?: number;
  maxSteps?: number;
  /** Доля шагов, на которых выбирается новый узел, а не случайный. */
  exploreBias?: number;
}

/** Собирает пути ко всем встреченным финалам. */
export function findGoldenPaths(
  content: Content,
  options: SimulationOptions = {},
): Map<number, GoldenPath> {
  const runs = options.runs ?? 4000;
  const maxSteps = options.maxSteps ?? 600;
  const exploreBias = options.exploreBias ?? 0.85;
  const engine = createEngine(content, { now: () => 0 });
  const found = new Map<number, GoldenPath>();

  for (let run = 1; run <= runs; run += 1) {
    const rng = makeRng(run * 7919);
    let state = engine.start(SOLVER_HERO).state;
    const steps: GoldenStep[] = [];
    const visited = new Set<number>([state.node]);

    for (let step = 0; step < maxSteps && !state.finished; step += 1) {
      const options = nextStates(engine, state, rng);
      if (options.length === 0) break;
      const fresh = options.filter((option) => !visited.has(option.next.node));
      const pool = fresh.length > 0 && rng() < exploreBias ? fresh : options;
      const pick = pool[Math.floor(rng() * pool.length)]!;
      if (!pick.action) break;
      state = pick.next;
      steps.push(pick.action);
      visited.add(state.node);
    }

    if (state.finished && state.ending && !found.has(state.node)) {
      found.set(state.node, {
        ending: state.node,
        kind: state.ending,
        steps: [...steps],
        run,
      });
    }
    if (found.size >= 15) break;
  }

  return found;
}

/** Проигрывает путь заново и возвращает финальное состояние. */
export function replay(content: Content, steps: readonly GoldenStep[]): GameState {
  const engine = createEngine(content, { now: () => 0 });
  let state = engine.start(SOLVER_HERO).state;
  for (const step of steps) state = engine.reduce(state, materialize(step)).state;
  return state;
}

export { findGoldenPaths as solveGoldenPaths };

/* ------------------------------------------------------------------ *
 * Целенаправленный поиск до конкретного узла (A* по графу контента).
 * Нужен для финалов, до которых случайный проход не добирается.
 * ------------------------------------------------------------------ */

interface HeapItem {
  index: number;
  priority: number;
}

class MinHeap {
  private items: HeapItem[] = [];

  push(item: HeapItem): void {
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if ((this.items[parent]?.priority ?? 0) <= (this.items[i]?.priority ?? 0)) break;
      [this.items[parent], this.items[i]] = [this.items[i]!, this.items[parent]!];
      i = parent;
    }
  }

  pop(): HeapItem | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0]!;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < this.items.length && (this.items[left]?.priority ?? 0) < (this.items[smallest]?.priority ?? 0)) smallest = left;
        if (right < this.items.length && (this.items[right]?.priority ?? 0) < (this.items[smallest]?.priority ?? 0)) smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i]!, this.items[smallest]!];
        i = smallest;
      }
    }
    return top;
  }

  get size(): number {
    return this.items.length;
  }
}

/** Статические расстояния до цели по всем рёбрам (условия игнорируются — это эвристика). */
export function distanceMap(content: Content, target: number): Map<number, number> {
  const reverse = new Map<number, number[]>();
  const addEdge = (from: number, to: number): void => {
    const list = reverse.get(to);
    if (list) list.push(from);
    else reverse.set(to, [from]);
  };
  for (const node of content.nodes.values()) {
    for (const choice of node.choices) addEdge(node.id, choice.target);
    for (const branch of node.check?.branches ?? []) addEdge(node.id, branch.target);
  }
  // Гиперребро: из любого узла с «Вперёд» можно попасть в цель любой ветки квадрата.
  const forwardNodes = [...content.nodes.values()]
    .filter((node) => node.forward || node.squares.length > 0)
    .map((node) => node.id);
  for (const square of content.squares.values()) {
    for (const branch of square.branches) {
      for (const from of forwardNodes) addEdge(from, branch.target);
    }
  }
  const distances = new Map<number, number>([[target, 0]]);
  let frontier = [target];
  let depth = 0;
  while (frontier.length > 0) {
    depth += 1;
    const next: number[] = [];
    for (const node of frontier) {
      for (const parent of reverse.get(node) ?? []) {
        if (distances.has(parent)) continue;
        distances.set(parent, depth);
        next.push(parent);
      }
    }
    frontier = next;
  }
  return distances;
}

/** Ищет путь до узла-финала, подбирая броски и учитывая отметки. */
export function findPathTo(content: Content, target: number, budget = 200_000): GoldenStep[] | null {
  const engine = createEngine(content, { now: () => 0 });
  const heuristic = distanceMap(content, target);
  const start = engine.start(SOLVER_HERO).state;

  const nodes: { state: GameState; parent: number; step: GoldenStep | null; depth: number }[] = [
    { state: start, parent: -1, step: null, depth: 0 },
  ];
  const seen = new Set<string>();
  const heap = new MinHeap();
  heap.push({ index: 0, priority: heuristic.get(start.node) ?? 999 });
  const keyOf = (state: GameState): string => `${state.node}#${state.marks.slice().sort((a, b) => a - b).join(',')}#${state.square ?? '-'}`;
  seen.add(keyOf(start));

  let expansions = 0;
  while (heap.size > 0 && expansions < budget) {
    const item = heap.pop();
    if (!item) break;
    const current = nodes[item.index]!;
    expansions += 1;
    if (current.state.node === target) {
      const steps: GoldenStep[] = [];
      let cursor = item.index;
      while (cursor !== -1) {
        const entry = nodes[cursor]!;
        if (entry.step) steps.push(entry.step);
        cursor = entry.parent;
      }
      return steps.reverse();
    }
    if (current.depth > 140) continue;

    const push = (step: GoldenStep, next: GameState): void => {
      const key = keyOf(next);
      if (seen.has(key)) return;
      seen.add(key);
      const index = nodes.length;
      nodes.push({ state: next, parent: item.index, step, depth: current.depth + 1 });
      const estimate = heuristic.get(next.node) ?? 999;
      heap.push({ index, priority: current.depth + 1 + estimate });
    };

    const node = engine.node(current.state);
    for (const { index } of engine.choices(current.state)) {
      const step: GoldenStep = { type: 'choose', index };
      push(step, engine.reduce(current.state, materialize(step)).state);
    }
    if (node.check) {
      const skillValue = node.check.skill ? current.state.hero.skills[node.check.skill] : 0;
      for (const branch of node.check.branches) {
        for (let sum = 2; sum <= 12; sum += 1) {
          const result = Math.min(12, Math.max(2, sum + skillValue));
          if (result < branch.from || result > branch.to) continue;
          const step: GoldenStep = { type: 'roll', total: sum };
          push(step, engine.reduce(current.state, materialize(step)).state);
          break;
        }
      }
    }
    if (node.forward || node.squares.length > 0) {
      const from = current.state.square;
      const targets = from ? neighbours(from) : [...content.squares.keys()];
      for (const square of targets) {
        const forwardStep: GoldenStep = { type: 'forward', to: square };
        const enterStep: GoldenStep = { type: 'enterSquare', id: square };
        const afterForward = engine.reduce(current.state, materialize(forwardStep)).state;
        push(forwardStep, afterForward);
        const entered = engine.reduce(afterForward, materialize(enterStep)).state;
        push(enterStep, entered);
      }
    }
  }
  return null;
}

/**
 * Целевой обход: идёт к нужному финалу, выбирая броски и переходы,
 * которые сокращают расстояние до цели. Возвращает путь или null.
 */
export function walkToEnding(
  content: Content,
  target: number,
  options: { maxSteps?: number; runs?: number; needMarks?: number[] } = {},
): GoldenStep[] | null {
  const engine = createEngine(content, { now: () => 0 });
  const distance = distanceMap(content, target);
  const maxSteps = options.maxSteps ?? 300;
  const runs = options.runs ?? 200;
  const needMarks = options.needMarks ?? [];

  for (let run = 1; run <= runs; run += 1) {
    const rng = makeRng(run * 104729 + target);
    let state = engine.start(SOLVER_HERO).state;
    const steps: GoldenStep[] = [];
    const visited = new Set<number>([state.node]);

    for (let step = 0; step < maxSteps; step += 1) {
      if (state.finished) break;
      if (state.node === target && needMarks.every((mark) => state.marks.includes(mark))) return steps;
      const node = engine.node(state);

      const options_: { step: GoldenStep; next: GameState; score: number }[] = [];
      const score = (next: GameState): number => {
        const missing = needMarks.filter((mark) => !next.marks.includes(mark)).length;
        return (distance.get(next.node) ?? 999)
          + missing * 8                     // сначала собрать нужные отметки
          + (visited.has(next.node) ? 0.5 : 0)
          + rng() * 0.4;
      };

      for (const { index } of engine.choices(state)) {
        const step_: GoldenStep = { type: 'choose', index };
        const next = engine.reduce(state, materialize(step_)).state;
        options_.push({ step: step_, next, score: score(next) });
      }

      if (node.check) {
        const skillValue = node.check.skill ? state.hero.skills[node.check.skill] : 0;
        for (const branch of node.check.branches) {
          for (let sum = 2; sum <= 12; sum += 1) {
            const result = Math.min(12, Math.max(2, sum + skillValue));
            if (result < branch.from || result > branch.to) continue;
            const step_: GoldenStep = { type: 'roll', total: sum };
            const next = engine.reduce(state, materialize(step_)).state;
            options_.push({ step: step_, next, score: score(next) });
            break;
          }
        }
      }

      if (node.forward || node.squares.length > 0) {
        const from = state.square;
        const targets = from ? neighbours(from) : [...content.squares.keys()];
        for (const square of targets) {
          const forwardStep: GoldenStep = { type: 'forward', to: square };
          const enterStep: GoldenStep = { type: 'enterSquare', id: square };
          const afterForward = engine.reduce(state, materialize(forwardStep)).state;
          const entered = engine.reduce(afterForward, materialize(enterStep)).state;
          options_.push({ step: enterStep, next: entered, score: score(entered) });
          void afterForward;
        }
      }

      if (options_.length === 0) break;
      options_.sort((a, b) => a.score - b.score);
      // небольшой шанс уйти от жадного шага, чтобы не застрять в локальном минимуме
      const pickIndex = rng() < 0.15 && options_.length > 1 ? 1 : 0;
      const pick = options_[pickIndex]!;
      state = pick.next;
      steps.push(pick.step);
      visited.add(state.node);
    }
  }
  return null;
}
