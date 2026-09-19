/**
 * Паритет с приёмкой контента (питоновский `scripts/validate_content.py`).
 * Если этот файл падает — контент пересобирать нельзя.
 */

import { describe, expect, it } from 'vitest';

import { ALL_SQUARES } from '../../src/engine/map.ts';
import type { GameNode, MapSquare } from '../../src/engine/types.ts';
import { loadDiskContent, loadRawNodes, loadRawSquares } from '../support/content.ts';

const nodes = loadRawNodes();
const squares = loadRawSquares();
const content = loadDiskContent();

const byId = new Map(nodes.map((n) => [n.id, n]));

function effects(node: GameNode) {
  return [...node.effects, ...node.choices.flatMap((c) => c.effects ?? [])];
}

function allTargets(node: GameNode): number[] {
  return [
    ...node.choices.map((c) => c.target),
    ...(node.check?.branches.map((b) => b.target) ?? []),
  ];
}

describe('контент: структура', () => {
  it('455 узлов 100..554 без пропусков', () => {
    expect(nodes).toHaveLength(455);
    expect(nodes.map((n) => n.id).sort((a, b) => a - b))
      .toEqual(Array.from({ length: 455 }, (_, i) => 100 + i));
  });

  it('24 квадрата карты', () => {
    expect(squares).toHaveLength(24);
    expect(squares.map((s) => s.id).sort()).toEqual([...ALL_SQUARES].sort());
  });

  it('все ссылки ведут в существующие узлы', () => {
    for (const node of nodes) {
      for (const target of allTargets(node)) {
        expect(byId.has(target), `узел ${node.id} → ${target}`).toBe(true);
      }
    }
    for (const square of squares) {
      for (const branch of square.branches) {
        expect(byId.has(branch.target), `квадрат ${square.id} → ${branch.target}`).toBe(true);
      }
    }
  });

  it('диапазоны бросков покрывают 2..12 без дыр и перекрытий', () => {
    for (const node of nodes) {
      if (!node.check) continue;
      const hits = new Map<number, number>();
      for (const branch of node.check.branches) {
        for (let value = branch.from; value <= branch.to; value += 1) {
          hits.set(value, (hits.get(value) ?? 0) + 1);
        }
      }
      const missing = [];
      const overlapping = [];
      for (let value = 2; value <= 12; value += 1) {
        const count = hits.get(value) ?? 0;
        if (count === 0) missing.push(value);
        if (count > 1) overlapping.push(value);
      }
      expect(missing, `узел ${node.id}: не покрыто`).toEqual([]);
      expect(overlapping, `узел ${node.id}: перекрытие`).toEqual([]);
    }
  });

  it('у каждого узла есть выход или финал', () => {
    for (const node of nodes) {
      const hasExit = node.choices.length > 0 || node.check !== null || node.forward
        || node.squares.length > 0 || node.ending !== null;
      expect(hasExit, `узел ${node.id} без выхода`).toBe(true);
    }
  });

  it('15 финалов: победа в 235, падение в 526', () => {
    const endings = nodes.filter((n) => n.ending);
    expect(endings).toHaveLength(15);
    expect(byId.get(235)?.ending).toBe('victory');
    expect(byId.get(526)?.ending).toBe('fall');
    expect(endings.filter((n) => n.ending === 'death')).toHaveLength(13);
  });

  it('текст и подписи заполнены', () => {
    const emptyText = nodes.filter((n) => !n.narrative.trim()).map((n) => n.id);
    expect(emptyText).toEqual([]);
    const unlabelled = nodes.flatMap((n) =>
      n.choices.filter((c) => !c.label).map((c) => `${n.id}#${c.target}`));
    expect(unlabelled).toEqual([]);
    const unlabelledBranches = squares.flatMap((s) =>
      s.branches.filter((b) => !b.label).map((b) => `${s.id}→${b.target}`));
    expect(unlabelledBranches).toEqual([]);
  });

  it('отметки укладываются в диапазон 1..45', () => {
    const used = new Set<number>();
    for (const node of nodes) {
      for (const effect of effects(node)) {
        if (effect.type === 'set-mark' || effect.type === 'clear-mark') used.add(effect.id);
      }
      for (const mark of node.conditions) used.add(mark);
      for (const choice of node.choices) for (const mark of choice.checks) used.add(mark);
    }
    for (const square of squares) {
      for (const branch of square.branches) for (const mark of branch.checks) used.add(mark);
    }
    expect([...used].filter((m) => m < 1 || m > 45)).toEqual([]);
  });
});

describe('контент: достижимость', () => {
  const settable = (() => {
    const marks = new Set<number>();
    for (const node of nodes) {
      for (const effect of effects(node)) if (effect.type === 'set-mark') marks.add(effect.id);
    }
    return marks;
  })();

  /** Обход с учётом условий веток квадратов: отметка «возможна» только если где-то ставится. */
  function reachable(): Set<number> {
    const seen = new Set<number>();
    const queue = [317, 494];
    while (queue.length) {
      const current = queue.pop()!;
      if (seen.has(current)) continue;
      const node = byId.get(current);
      if (!node) continue;
      seen.add(current);
      queue.push(...allTargets(node));
      if (node.forward || node.squares.length > 0) {
        for (const square of squares) {
          for (const branch of square.branches as MapSquare['branches']) {
            const ok = branch.checks.every((m) => settable.has(m));
            if (ok) queue.push(branch.target);
          }
        }
      }
    }
    return seen;
  }

  it('достижимы все 455 узлов', () => {
    const seen = reachable();
    const unreachable = nodes.map((n) => n.id).filter((id) => !seen.has(id));
    expect(unreachable).toEqual([]);
  });

  it('пять потерянных отметок поставлены (13, 24, 27, 31, 34)', () => {
    for (const mark of [13, 24, 27, 31, 34]) {
      expect(settable.has(mark), `отметка ${mark} нигде не ставится`).toBe(true);
    }
    expect(settable.has(29), 'отметка 29 должна ставиться в 530').toBe(true);
    expect(effects(byId.get(148)!)).not.toContainEqual({ type: 'set-mark', id: 29 });
  });

  it('все проверяемые отметки где-то ставятся', () => {
    const checked = new Set<number>();
    for (const node of nodes) {
      for (const mark of node.conditions) checked.add(mark);
      for (const choice of node.choices) for (const mark of choice.checks) checked.add(mark);
    }
    for (const square of squares) {
      for (const branch of square.branches) for (const mark of branch.checks) checked.add(mark);
    }
    const never = [...checked].filter((m) => !settable.has(m)).sort((a, b) => a - b);
    expect(never).toEqual([]);
  });

  it('редакторские связки остаются на месте', () => {
    const editorial = nodes.flatMap((n) =>
      n.choices.filter((c) => c.editorial).map((c) => `${n.id}→${c.target}`));
    expect(editorial.sort()).toEqual(['248→546', '300→520', '318→553', '456→214', '505→295']);
    const fiveV = content.squares.get('5В')!;
    expect(fiveV.branches.map((b) => b.target)).toEqual([367, 250, 415]);
  });
});
