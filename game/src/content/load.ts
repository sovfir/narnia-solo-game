/**
 * Загрузка контента из JSON пайплайна в типизированные структуры.
 *
 * Модуль чистый: принимает уже разобранный JSON, поэтому одинаково работает
 * и в браузере (импорт JSON через Vite), и в тестах/CI (чтение с диска).
 */

import type { Content, GameNode, MapSquare, SquareId } from '../engine/types.ts';

interface RawContent {
  nodes: GameNode[];
  squares: MapSquare[];
}

/** Короткая свёртка контента — попадает в сохранения, чтобы ловить рассинхрон версий. */
export function contentChecksum(nodes: readonly GameNode[], squares: readonly MapSquare[]): string {
  const text = JSON.stringify([nodes, squares]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function parseContent(raw: RawContent, version?: string): Content {
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.squares)) {
    throw new Error('контент: ожидались массивы nodes и squares');
  }
  const nodes = new Map<number, GameNode>();
  for (const node of raw.nodes) {
    if (typeof node.id !== 'number') throw new Error('контент: у узла нет числового id');
    if (nodes.has(node.id)) throw new Error(`контент: узел ${node.id} встречается дважды`);
    nodes.set(node.id, node);
  }
  const squares = new Map<SquareId, MapSquare>();
  for (const square of raw.squares) {
    if (typeof square.id !== 'string') throw new Error('контент: у квадрата нет id');
    squares.set(square.id, square);
  }
  return {
    nodes,
    squares,
    order: [...nodes.keys()].sort((a, b) => a - b),
    version: version ?? contentChecksum(raw.nodes, raw.squares),
  };
}

/** Проверка целостности ссылок — быстрый аналог питоновского валидатора для рантайма. */
export function assertContentIntegrity(content: Content): void {
  const problems: string[] = [];
  for (const node of content.nodes.values()) {
    for (const choice of node.choices) {
      if (!content.nodes.has(choice.target)) {
        problems.push(`узел ${node.id}: переход на несуществующий ${choice.target}`);
      }
    }
    for (const branch of node.check?.branches ?? []) {
      if (!content.nodes.has(branch.target)) {
        problems.push(`узел ${node.id}: ветка ${branch.from}-${branch.to} ведёт на ${branch.target}`);
      }
    }
  }
  for (const square of content.squares.values()) {
    for (const branch of square.branches) {
      if (!content.nodes.has(branch.target)) {
        problems.push(`квадрат ${square.id}: ветка ведёт на ${branch.target}`);
      }
    }
  }
  if (problems.length) {
    throw new Error(`контент повреждён:\n${problems.slice(0, 10).join('\n')}`);
  }
}
