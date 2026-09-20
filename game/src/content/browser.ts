/**
 * Контент для браузера.
 *
 * JSON пайплайна подключается динамическим импортом: так он попадает
 * в отдельный чанк и не раздувает стартовый бандл (§9: стартовый JS ≤ 150 КБ gzip).
 * Загрузка один раз, дальше модуль кеширует результат.
 */

import { assertContentIntegrity, parseContent } from './load.ts';
import type { Content, GameNode, MapSquare } from '../engine/types.ts';

export const CONTENT_URLS = {
  nodes: new URL('../../content/nodes.json', import.meta.url),
  squares: new URL('../../content/squares.json', import.meta.url),
} as const;

let cached: Content | null = null;

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`не удалось загрузить ${url.pathname}: ${response.status}`);
  return (await response.json()) as T;
}

/** Сбрасывает кеш — нужно тестам, в игре вызывается один раз за сессию. */
export function resetContentCache(): void {
  cached = null;
}

/** Загружает контент (один раз на приложение) и проверяет ссылки. */
export async function loadBrowserContent(): Promise<Content> {
  if (cached) return cached;
  const [nodes, squares] = await Promise.all([
    fetchJson<GameNode[]>(CONTENT_URLS.nodes),
    fetchJson<MapSquare[]>(CONTENT_URLS.squares),
  ]);
  const content = parseContent({ nodes, squares });
  assertContentIntegrity(content);
  cached = content;
  return content;
}
