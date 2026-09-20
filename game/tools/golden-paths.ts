/**
 * Генератор «золотых путей» (game-design §7.5).
 *
 * Запуск: npm run golden:gen [проходов]
 * Пишет tests/fixtures/golden-paths.json — по одному воспроизводимому пути
 * к каждому из 15 финалов. Тесты затем просто проигрывают фикстуру (быстро).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { contentChecksum, parseContent } from '../src/content/load.ts';
import { findGoldenPaths, replay } from '../tests/support/solver.ts';
import type { Content, GameNode, MapSquare } from '../src/engine/types.ts';

const ROOT = join(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'content');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'golden-paths.json');

function loadContent(): Content {
  const nodes = JSON.parse(readFileSync(join(CONTENT, 'nodes.json'), 'utf8')) as GameNode[];
  const squares = JSON.parse(readFileSync(join(CONTENT, 'squares.json'), 'utf8')) as MapSquare[];
  return parseContent({ nodes, squares });
}

function main(): number {
  const content = loadContent();
  const expected = [...content.nodes.values()].filter((n) => n.ending).map((n) => n.id).sort((a, b) => a - b);
  const budget = Number(process.argv[2] ?? 40000);
  const attempts = [0.85, 0.6, 1, 0.4];
  const collected = new Map<number, ReturnType<typeof findGoldenPaths> extends Map<number, infer V> ? V : never>();

  for (const bias of attempts) {
    if (collected.size === expected.length) break;
    const found = findGoldenPaths(content, {
      runs: budget,
      maxSteps: 900,
      exploreBias: bias,
    });
    for (const [id, path] of found) if (!collected.has(id)) collected.set(id, path);
    const missing = expected.filter((id) => !collected.has(id));
    console.log(`bias=${bias}: найдено ${collected.size}/${expected.length}` +
      (missing.length ? `, не хватает: ${missing.join(', ')}` : ''));
  }

  const paths = [...collected.values()].sort((a, b) => a.ending - b.ending);
  const broken = paths.filter((path) => {
    const final = replay(content, path.steps);
    return !final.finished || final.node !== path.ending;
  });
  if (broken.length) {
    console.error('пути не воспроизводятся:', broken.map((p) => p.ending).join(', '));
    return 1;
  }

  writeFileSync(FIXTURE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    contentChecksum: contentChecksum([...content.nodes.values()], [...content.squares.values()]),
    endings: expected.length,
    paths: paths.map((path) => ({
      ending: path.ending,
      kind: path.kind,
      foundByRun: path.run,
      steps: path.steps,
    })),
  }, null, 1) + '\n', 'utf8');

  console.log(`записано путей: ${paths.length} из ${expected.length} → ${FIXTURE}`);
  return paths.length === expected.length ? 0 : 2;
}

raise: {
  process.exitCode = main();
}
