/**
 * Автопроходы (game-design §7.5): партия, сыгранная случайным игроком,
 * обязана завершаться финалом. Тест ловит тупики, петли и битые переходы.
 */

import { describe, expect, it } from 'vitest';

import { createEngine } from '../../src/engine/engine.ts';
import { createReadyHero } from '../../src/engine/hero.ts';
import type { EndingKind } from '../../src/engine/types.ts';
import type { Engine, GameState } from '../../src/engine/engine.ts';
import { loadDiskContent } from '../support/content.ts';
import { seededRng } from '../support/rng.ts';

const content = loadDiskContent();

function playOnce(engine: Engine, rng: () => number, maxSteps = 3000): GameState {
  let state: GameState = engine.start(createReadyHero()).state;
  for (let step = 0; step < maxSteps; step += 1) {
    if (state.finished) return state;
    const node = engine.node(state);
    const choices = engine.choices(state);

    if (choices.length > 0 && (rng() < 0.75 || node.check === null)) {
      const pick = choices[Math.floor(rng() * choices.length)]!;
      state = engine.reduce(state, { type: 'choose', index: pick.index }).state;
      continue;
    }
    if (node.check) {
      state = engine.reduce(state, { type: 'roll', rng }).state;
      continue;
    }
    if (node.forward || node.squares.length > 0) {
      const targets = engine.moveTargets(state);
      const to = targets[Math.floor(rng() * targets.length)]!;
      const afterForward = engine.reduce(state, { type: 'forward', to }).state;
      state = engine.reduce(afterForward, { type: 'enterSquare', id: to }).state;
      continue;
    }
    throw new Error(`тупик в узле ${state.node}: нет ни выбора, ни броска, ни карты`);
  }
  throw new Error(`партия не завершилась за ${maxSteps} шагов (узел ${state.node})`);
}

describe('автопроходы', () => {
  it('любая случайная партия заканчивается финалом', () => {
    const endings = new Map<EndingKind | number, number>();
    const runs = 200;
    for (let seed = 1; seed <= runs; seed += 1) {
      const engine = createEngine(content, { now: () => 0, runId: () => `run-${seed}` });
      const final = playOnce(engine, seededRng(seed));
      expect(final.finished).toBe(true);
      expect(final.ending).not.toBeNull();
      const key = final.ending === 'death' ? final.node : final.ending!;
      endings.set(key, (endings.get(key) ?? 0) + 1);
    }
    const deaths = [...endings.keys()].filter((k) => typeof k === 'number');
    expect(deaths.length, 'случайные партии должны иногда приводить к гибели')
      .toBeGreaterThan(0);
    expect(endings.size, `исходов за ${runs} партий: ${[...endings.entries()].join(', ')}`)
      .toBeGreaterThanOrEqual(6);
  });

  it('журнал партии согласован по узлам', () => {
    const engine = createEngine(content, { now: () => 0 });
    const final = playOnce(engine, seededRng(99));
    const visited = new Set(final.visitedNodes);
    expect(visited.has(317)).toBe(true);
    const journalNodes = final.journal
      .map((entry) => entry.node)
      .filter((node): node is number => typeof node === 'number');
    for (const node of journalNodes) expect(visited.has(node)).toBe(true);
  });

  it('отметки в финале не превышают 45 и уникальны', () => {
    const engine = createEngine(content, { now: () => 0 });
    const final = playOnce(engine, seededRng(7)) as GameState;
    expect(new Set(final.marks).size).toBe(final.marks.length);
    for (const mark of final.marks) {
      expect(mark).toBeGreaterThanOrEqual(1);
      expect(mark).toBeLessThanOrEqual(45);
    }
  });
});
