import { describe, expect, it } from 'vitest';

import { availableChoices, checksPass, hasMarks } from '../../src/engine/conditions.ts';

const choices = [
  { checks: [], label: 'всегда' },
  { checks: [13], label: 'по отметке 13' },
  { checks: [13, 24], label: 'по отметкам 13 и 24' },
];

describe('условия', () => {
  it('пустое условие проходит всегда', () => {
    expect(checksPass([], [])).toBe(true);
    expect(checksPass([1, 2], [])).toBe(true);
  });

  it('режим all требует все отметки', () => {
    expect(hasMarks([13], [13, 24])).toBe(false);
    expect(checksPass([13, 24, 30], [13, 24])).toBe(true);
  });

  it('режим any требует хотя бы одну', () => {
    expect(checksPass([24], [13, 24], 'any')).toBe(true);
    expect(checksPass([30], [13, 24], 'any')).toBe(false);
  });

  it('недоступные варианты не показываются', () => {
    expect(availableChoices(choices, []).map((c) => c.label)).toEqual(['всегда']);
    expect(availableChoices(choices, [13]).map((c) => c.label))
      .toEqual(['всегда', 'по отметке 13']);
    expect(availableChoices(choices, [13, 24]).map((c) => c.label))
      .toEqual(['всегда', 'по отметке 13', 'по отметкам 13 и 24']);
  });
});
