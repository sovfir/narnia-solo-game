import { describe, expect, it } from 'vitest';

import { createEngine } from '../../src/engine/engine.ts';
import { createReadyHero } from '../../src/engine/hero.ts';
import { parseContent } from '../../src/content/load.ts';
import type { Content, GameNode, MapSquare } from '../../src/engine/types.ts';
import { loadDiskContent } from '../support/content.ts';
import { seededRng } from '../support/rng.ts';

const content = loadDiskContent();
const engine = createEngine(content, { now: () => 0, runId: () => 'test-run' });

function nodeWithCheck(): GameNode {
  const node = content.order
    .map((id) => content.nodes.get(id)!)
    .find((n) => n.check && n.check.branches.length >= 2)!;
  return node;
}

describe('движок на реальном контенте', () => {
  it('стартует в точке входа и ведёт журнал', () => {
    const { state } = engine.start(createReadyHero());
    expect(state.node).toBe(317);
    expect(state.visitedNodes).toEqual([317]);
    expect(state.journal[0]?.kind).toBe('start');
    expect(state.finished).toBe(false);
  });

  it('переходит по выбранной кнопке и применяет её эффекты', () => {
    const started = engine.start(createReadyHero()).state;
    const available = engine.choices(started);
    expect(available.length).toBeGreaterThan(0);
    const first = available[0]!;

    const { state, next } = engine.reduce(started, { type: 'choose', index: first.index });
    expect(next).toBe(first.choice.target);
    expect(state.node).toBe(first.choice.target);
    for (const effect of first.choice.effects ?? []) {
      if (effect.type === 'set-mark') expect(state.marks).toContain(effect.id);
    }
  });

  it('отказывается брать недоступный вариант', () => {
    const started = engine.start(createReadyHero()).state;
    const locked = content.order
      .map((id) => content.nodes.get(id)!)
      .find((n) => n.choices.some((c) => c.checks.length > 0))!;
    const state = { ...started, node: locked.id };
    const index = locked.choices.findIndex((c) => c.checks.length > 0);
    expect(() => engine.reduce(state, { type: 'choose', index })).toThrow(/недоступен/);
  });

  it('бросок кубика ведёт в ветку по результату', () => {
    const checkNode = nodeWithCheck();
    const started = engine.start(createReadyHero()).state;
    const state = { ...started, node: checkNode.id };
    const outcome = engine.reduce(state, { type: 'roll', rng: seededRng(123) });
    const branch = checkNode.check!.branches
      .find((b) => b.target === outcome.next);
    expect(branch).toBeTruthy();
    const roll = outcome.state.lastRoll!;
    expect(roll.dice[0]).toBeGreaterThanOrEqual(1);
    expect(roll.dice[0]).toBeLessThanOrEqual(6);
    expect(roll.result).toBeGreaterThanOrEqual(branch!.from);
    expect(roll.result).toBeLessThanOrEqual(branch!.to);
  });

  it('выбор ветки квадрата зависит от отметок', () => {
    const started = engine.start(createReadyHero()).state;
    const noMarks = engine.reduce({ ...started, square: '5В' }, { type: 'enterSquare', id: '5В' });
    expect(noMarks.next).toBe(415);                       // «ещё не был»

    const beenThere = engine.reduce({ ...started, marks: [34] }, { type: 'enterSquare', id: '5В' });
    expect(beenThere.next).toBe(367);                     // «уже был здесь»

    const tastedCherries = engine.reduce({ ...started, marks: [35] }, { type: 'enterSquare', id: '5В' });
    expect(tastedCherries.next).toBe(250);                // редакторская ветка перед «Иначе»
  });

  it('«Вперёд» открывает карту, и откат возвращает на шаг назад', () => {
    const started = engine.start(createReadyHero()).state;
    const forwardNode = content.order
      .map((id) => content.nodes.get(id)!)
      .find((n) => n.forward)!;
    const state = { ...started, node: forwardNode.id, square: '3Б' };
    const moved = engine.reduce(state, { type: 'forward', to: '4В' });
    expect(moved.state.square).toBe('4В');
    expect(moved.state.history).toHaveLength(1);

    const back = engine.reduce(moved.state, { type: 'rollback' });
    expect(back.state.square).toBe('3Б');
    expect(back.state.node).toBe(forwardNode.id);
    expect(back.state.history).toHaveLength(0);
  });

  it('откат на пустой истории запрещён', () => {
    const started = engine.start(createReadyHero()).state;
    expect(() => engine.reduce(started, { type: 'rollback' })).toThrow(/история пуста/);
  });
});

describe('движок на синтетическом контенте', () => {
  const nodes: GameNode[] = [
    {
      id: 1, kind: 'event', narrative: 'старт',
      choices: [
        { target: 2, condition: null, checks: [], label: 'финал', source: 'в 2' },
        { target: 3, condition: null, checks: [9], label: 'по отметке', source: 'в 3' },
      ],
      check: null, effects: [], forward: false, squares: [], conditions: [], ending: null,
    },
    {
      id: 2, kind: 'event', narrative: 'победа', choices: [], check: null, effects: [],
      forward: false, squares: [], conditions: [], ending: 'victory',
    },
    {
      id: 3, kind: 'event', narrative: 'проверка',
      choices: [], check: { skill: 'energy', branches: [{ from: 2, to: 6, target: 4 }, { from: 7, to: 12, target: 2 }], source: 'бросок' },
      effects: [], forward: false, squares: [], conditions: [], ending: null,
    },
    {
      id: 4, kind: 'event', narrative: 'истощение',
      choices: [],
      check: { skill: 'energy', branches: [{ from: 2, to: 6, target: 5 }, { from: 7, to: 12, target: 2 }], source: 'бросок' },
      effects: [{ type: 'deprive', skill: 'energy', delta: -1, source: 'Вычитай 1 из Энергии следующие два раза.' }],
      forward: false, squares: [], conditions: [], ending: null,
    },
    {
      id: 5, kind: 'event', narrative: 'после истощения',
      choices: [{ target: 2, condition: null, checks: [], label: 'дальше', source: 'в 2' }],
      check: null, effects: [], forward: false, squares: [], conditions: [], ending: null,
    },
  ];
  const squares: MapSquare[] = [
    { id: '1А', kind: 'location', narrative: 'поле', branches: [], forward: true, squares: [] },
  ];
  const synthetic: Content = parseContent({ nodes, squares }, 'synthetic');
  const testEngine = createEngine(synthetic, { now: () => 0, startNode: 1, runId: () => 'unit' });

  it('финал помечает партию завершённой', () => {
    const started = testEngine.start(createReadyHero());
    const { state } = testEngine.reduce(started.state, { type: 'choose', index: 0 });
    expect(state.node).toBe(2);
    expect(state.ending).toBe('victory');
    expect(state.finished).toBe(true);
  });

  it('бросок тратит заряд временного модификатора и учитывает его', () => {
    const started = testEngine.start(createReadyHero());
    const lockedIndex = 1;                       // вариант «по отметке 9»
    expect(() => testEngine.reduce(started.state, { type: 'choose', index: lockedIndex }))
      .toThrow(/недоступен/);

    const unlocked = { ...started.state, marks: [9] };
    const toCheck = testEngine.reduce(unlocked, { type: 'choose', index: lockedIndex });
    expect(toCheck.next).toBe(3);

    // бросок 1+1=2, Энергия +1 → результат 3 → ветка 2..6 → узел 4
    const toDeprive = testEngine.reduce(toCheck.state, { type: 'roll', rng: () => 0 });
    expect(toDeprive.next).toBe(4);
    expect(toDeprive.state.tempMods[0]?.chargesLeft).toBe(2);

    // следующий бросок: 2 + (1 − 1) = 2 → ветка 2..6 → узел 5, заряд израсходован
    const afterSpend = testEngine.reduce(toDeprive.state, { type: 'roll', rng: () => 0 });
    expect(afterSpend.state.lastRoll?.result).toBe(2);
    expect(afterSpend.next).toBe(5);
    expect(afterSpend.state.tempMods[0]?.chargesLeft).toBe(1);
  });
});
