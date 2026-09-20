/** Загрузчик контента для браузера: два запроса и проверка целостности. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadBrowserContent, resetContentCache } from '../../src/content/browser.ts';
import { CONTENT_DIR } from '../support/content.ts';

describe('загрузчик контента', () => {
  beforeEach(() => resetContentCache());
  afterEach(() => vi.unstubAllGlobals());

  it('тянет узлы и квадраты и собирает типизированный контент', async () => {
    const requested: string[] = [];
    vi.stubGlobal('fetch', async (url: URL | string) => {
      const name = String(url).includes('nodes') ? 'nodes.json' : 'squares.json';
      requested.push(name);
      return {
        ok: true,
        json: async () => JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8')),
      } as unknown as Response;
    });

    const content = await loadBrowserContent();
    expect(requested.sort()).toEqual(['nodes.json', 'squares.json']);
    expect(content.nodes.size).toBe(455);
    expect(content.squares.size).toBe(24);
    expect(content.version).toMatch(/^[0-9a-f]{8}$/);
  });

  it('падает с понятной ошибкой, если контент недоступен', async () => {
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 404 }) as unknown as Response);
    await expect(loadBrowserContent()).rejects.toThrow(/404|загрузить/);
  });
});
