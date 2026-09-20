/** Соответствие отметок предметам и вывод находок в лист персонажа. */

import { describe, expect, it } from 'vitest';

import { TREASURES, treasuresFor } from '../../src/content/treasures.ts';

describe('предметы', () => {
  it('сопоставляет ключи и самоцветы отметкам книги', () => {
    expect(treasuresFor([6])[0]?.name).toBe('Ключ с Глазом Осьминога');
    expect(treasuresFor([19, 22, 23]).map((t) => t.name))
      .toEqual(['Ключ Змеи', 'Ключ Розы', 'Ключ Луны'].sort());
    expect(treasuresFor([40])[0]?.name).toBe('Алмаз');
  });

  it('игнорирует отметки без предмета и не дублирует', () => {
    expect(treasuresFor([2, 3, 4])).toEqual([]);
    expect(treasuresFor([38, 38]).length).toBe(1);
  });

  it('у каждой записи есть имя и вид', () => {
    for (const treasure of TREASURES) {
      expect(treasure.name.length).toBeGreaterThan(2);
      expect(['key', 'gem', 'boon']).toContain(treasure.kind);
      expect(treasure.mark).toBeGreaterThanOrEqual(1);
      expect(treasure.mark).toBeLessThanOrEqual(45);
    }
  });
});
