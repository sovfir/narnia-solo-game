/** Порционная подача текста: страницы по границам предложений и время чтения. */

import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { readingLabel, readingMinutes, splitIntoPages } from '../../src/ui/reading.ts';

describe('страницы сцены', () => {
  it('короткий текст остаётся одной страницей', () => {
    expect(splitIntoPages('Короткая сцена.')).toEqual(['Короткая сцена.']);
    expect(splitIntoPages('   ')).toEqual([]);
  });

  it('длинный текст режется по предложениям и не теряет слов', () => {
    const sentence = 'Ты идёшь по лесу и слушаешь ветер. ';
    const text = sentence.repeat(40).trim();
    const pages = splitIntoPages(text, 300);
    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) expect(page.length).toBeLessThanOrEqual(400);
    expect(pages.join(' ').replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
  });

  it('одно длинное предложение не рвётся', () => {
    const long = 'Слово '.repeat(200).trim() + '.';
    const pages = splitIntoPages(long, 100);
    expect(pages).toEqual([long]);
  });

  it('оценивает время чтения', () => {
    expect(readingMinutes('')).toBe(0);
    expect(readingMinutes('Мало текста.')).toBe(1);
    expect(readingMinutes('а'.repeat(3300))).toBe(3);
    expect(readingLabel('Мало текста.')).toBe('');
    expect(readingLabel('а'.repeat(3300))).toBe('≈ 3 мин чтения');
  });

  it('реальные сцены книги режутся на разумные страницы', () => {
    const nodes = JSON.parse(
      readFileSync(join(import.meta.dirname, '..', '..', 'content', 'nodes.json'), 'utf8'),
    ) as { id: number; narrative: string }[];
    const long = nodes.filter((node) => node.narrative.length > 1200);
    expect(long.length).toBeGreaterThan(20);
    for (const node of long.slice(0, 25)) {
      const pages = splitIntoPages(node.narrative);
      expect(pages.length, `узел ${node.id}`).toBeGreaterThan(1);
      expect(pages.join(' ').replace(/\s+/g, ' ')).toBe(node.narrative.trim().replace(/\s+/g, ' '));
    }
  });
});
