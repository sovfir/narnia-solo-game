import { describe, expect, it } from 'vitest';

import { clampResult, pickBranch, resolveCheck, roll2d6, rollDie } from '../../src/engine/dice.ts';
import type { DiceCheck } from '../../src/engine/types.ts';
import { seededRng } from '../support/rng.ts';

const check: DiceCheck = {
  skill: 'energy',
  branches: [
    { from: 2, to: 6, target: 105 },
    { from: 7, to: 12, target: 112 },
  ],
  source: 'тест',
};

describe('кубики', () => {
  it('выдаёт только грани 1..6', () => {
    const rng = seededRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 6000; i += 1) seen.add(rollDie(rng));
    expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('сумма 2d6 укладывается в 2..12 и распределена как надо', () => {
    const rng = seededRng(42);
    const histogram = new Array<number>(13).fill(0);
    const runs = 120_000;
    for (let i = 0; i < runs; i += 1) {
      const [a, b] = roll2d6(rng);
      histogram[a + b] = (histogram[a + b] ?? 0) + 1;
    }
    expect(histogram[0]).toBe(0);
    expect(histogram[1]).toBe(0);
    expect(histogram[2]! + histogram[12]!).toBeGreaterThan(0);

    const expectProbability: Record<number, number> = {
      2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36, 7: 6 / 36,
      8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36,
    };
    for (let total = 2; total <= 12; total += 1) {
      const share = histogram[total]! / runs;
      expect(Math.abs(share - expectProbability[total]!), `сумма ${total}`).toBeLessThan(0.004);
    }
  });

  it('зажимает результат в 2..12', () => {
    expect(clampResult(1)).toBe(2);
    expect(clampResult(15)).toBe(12);
    expect(clampResult(7)).toBe(7);
  });

  it('находит ветку по результату', () => {
    expect(pickBranch(check.branches, 2)?.target).toBe(105);
    expect(pickBranch(check.branches, 6)?.target).toBe(105);
    expect(pickBranch(check.branches, 7)?.target).toBe(112);
    expect(pickBranch(check.branches, 12)?.target).toBe(112);
    expect(pickBranch([{ from: 2, to: 5, target: 1 }], 9)).toBeNull();
  });

  it('разыгрывает проверку с модификатором навыка', () => {
    const outcome = resolveCheck(check, 1, seededRng(7));
    expect(outcome.dice[0]).toBeGreaterThanOrEqual(1);
    expect(outcome.dice[0]).toBeLessThanOrEqual(6);
    expect(outcome.result).toBe(clampResult(outcome.total + 1));
    expect([105, 112]).toContain(outcome.target);
  });

  it('падает, если контент не покрывает результат', () => {
    expect(() => resolveCheck({ ...check, branches: [{ from: 2, to: 5, target: 1 }] }, 5, () => 0.99))
      .toThrow(/нет ветки/);
  });
});
