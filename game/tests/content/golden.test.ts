/**
 * Золотые пути (§7.5).
 *
 * Сами пути лежат в tests/fixtures/golden-paths.json и генерируются
 * командой `npm run golden:gen`. Тест проигрывает каждый путь движком
 * и проверяет, что партия заканчивается именно тем финалом.
 *
 * Известный пробел: финал 243 («Карга не даёт выбрать другой ключ») требует
 * собрать все четыре ключа (отметки 6, 19, 22, 23) и пройти цепочку
 * 256 → 468 → 509 → 412 → бросок 2-5 на Красноречие. Маршрут прослежен,
 * но автоматический поиск его пока не находит — см. HANDOFF.md.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parseContent } from '../../src/content/load.ts';
import type { Content } from '../../src/engine/types.ts';
import { loadDiskContent, loadRawNodes, loadRawSquares } from '../support/content.ts';
import { replay, type GoldenStep } from '../support/solver.ts';

interface GoldenFixture {
  contentChecksum: string;
  endings: number;
  paths: { ending: number; kind: string; foundByRun: number; steps: GoldenStep[] }[];
}

const ROOT = join(import.meta.dirname, '..', '..');
const fixture = JSON.parse(
  readFileSync(join(ROOT, 'tests', 'fixtures', 'golden-paths.json'), 'utf8'),
) as GoldenFixture;

const content: Content = loadDiskContent();
const allEndings = [...content.nodes.values()].filter((node) => node.ending).map((node) => node.id);

describe('золотые пути', () => {
  it('фикстура собрана для этого контента', () => {
    const fresh = parseContent({ nodes: loadRawNodes(), squares: loadRawSquares() });
    expect(fixture.endings).toBe(15);
    expect(fixture.paths.length).toBeGreaterThanOrEqual(14);
    // если контент пересобрали, фикстуру надо обновить: npm run golden:gen
    expect(fresh.nodes.size).toBe(content.nodes.size);
  });

  it('каждый путь воспроизводится и приводит к своему финалу', () => {
    for (const path of fixture.paths) {
      const final = replay(content, path.steps);
      expect(final.finished, `финал ${path.ending}: партия не завершилась`).toBe(true);
      expect(final.node, `финал ${path.ending}: пришли в другой узел`).toBe(path.ending);
      expect(final.ending, `финал ${path.ending}: другой тип исхода`).toBe(path.kind);
    }
  });

  it('покрыты победа, падение и гибели', () => {
    const kinds = fixture.paths.map((path) => path.kind);
    expect(kinds).toContain('victory');
    expect(kinds).toContain('fall');
    expect(kinds.filter((kind) => kind === 'death').length).toBeGreaterThanOrEqual(11);
  });

  it('остался один непокрытый финал — 243, он задокументирован', () => {
    const covered = new Set(fixture.paths.map((path) => path.ending));
    const missing = allEndings.filter((id) => !covered.has(id));
    expect(missing).toEqual([243]);
  });

  it('пути воспроизводятся одним и тем же движком дважды (детерминизм)', () => {
    const path = fixture.paths[0]!;
    const first = replay(content, path.steps);
    const second = replay(content, path.steps);
    expect(second.node).toBe(first.node);
    expect(second.marks).toEqual(first.marks);
    expect(second.journal.length).toBe(first.journal.length);
  });
});
