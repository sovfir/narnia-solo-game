/** Лорные разделы: текст на месте, режется на страницы. */

import { describe, expect, it } from 'vitest';

import { LORE } from '../../src/content/lore.ts';
import { splitIntoPages } from '../../src/ui/reading.ts';

describe('разделы о Нарнии', () => {
  it('содержит три раздела книги', () => {
    expect(LORE.map((section) => section.title)).toEqual([
      'Вступление на землю Нарнии',
      'Основание Нарнии',
      'Приключение в Нарнии',
    ]);
  });

  it('тексты непустые и режутся на страницы', () => {
    for (const section of LORE) {
      expect(section.text.length).toBeGreaterThan(200);
      const pages = splitIntoPages(section.text, 800);
      expect(pages.length).toBeGreaterThanOrEqual(1);
      expect(pages.join(' ').replace(/\s+/g, ' '))
        .toBe(section.text.trim().replace(/\s+/g, ' '));
    }
  });

  it('в «Основании Нарнии» есть ключевые имена', () => {
    const founding = LORE[1]!.text;
    expect(founding).toContain('Аслан');
    expect(founding).toContain('Фрэнк');
    expect(founding).toContain('Нарния');
  });
});
