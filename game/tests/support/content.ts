/** Загрузка контента с диска — для тестов и CI (в браузере контент импортирует Vite). */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertContentIntegrity, parseContent } from '../../src/content/load.ts';
import type { Content, GameNode, MapSquare } from '../../src/engine/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const CONTENT_DIR = join(here, '..', '..', 'content');

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8')) as T;
}

export function loadRawNodes(): GameNode[] {
  return readJson<GameNode[]>('nodes.json');
}

export function loadRawSquares(): MapSquare[] {
  return readJson<MapSquare[]>('squares.json');
}

let cached: Content | null = null;

/** Контент из content/nodes.json + content/squares.json, с проверкой ссылок. */
export function loadDiskContent(): Content {
  if (cached) return cached;
  const content = parseContent({ nodes: loadRawNodes(), squares: loadRawSquares() });
  assertContentIntegrity(content);
  cached = content;
  return content;
}
