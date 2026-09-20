/** Хранилище приложения: старт, автосохранение, продолжение, галерея, откат. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { GALLERY_KEY, SAVE_KEY, createStore, type StorageLike } from '../../src/app/store.ts';
import { createReadyHero } from '../../src/engine/hero.ts';
import { loadDiskContent } from '../support/content.ts';
import { replay, rngForTotal, type GoldenStep } from '../support/solver.ts';

const content = loadDiskContent();
const ROOT = join(import.meta.dirname, '..', '..');

function fakeStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data: Record<string, string> = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: (key) => { delete data[key]; },
  };
}

describe('хранилище', () => {
  it('стартует со сплэша и начинает партию с узла 317', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    expect(store.getSnapshot().screen).toBe('splash');
    expect(store.getSnapshot().state).toBeNull();

    store.quickStart();
    const state = store.getSnapshot().state!;
    expect(state.node).toBe(317);
    expect(state.hero.name).toBe('Робин Трэверсток');
    expect(store.getSnapshot().screen).toBe('game');
  });

  it('пишет автосохранение после каждого хода', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 5 });
    store.quickStart();
    const choices = store.engine.choices(store.getSnapshot().state!);
    store.choose(choices[0]!.index);

    const raw = storage.getItem(SAVE_KEY);
    expect(raw).toBeTruthy();
    const save = JSON.parse(raw!) as { version: number; contentVersion: string; state: { node: number } };
    expect(save.version).toBe(1);
    expect(save.contentVersion).toBe(content.version);
    expect(save.state.node).toBe(choices[0]!.choice.target);
  });

  it('продолжает сохранённую партию и отказывается от чужой версии контента', () => {
    const storage = fakeStorage();
    const first = createStore({ content, storage, now: () => 5 });
    first.quickStart();
    first.choose(first.engine.choices(first.getSnapshot().state!)[0]!.index);
    const savedNode = first.getSnapshot().state!.node;

    const second = createStore({ content, storage, now: () => 6 });
    expect(second.continueSaved()).toBe(true);
    expect(second.getSnapshot().state?.node).toBe(savedNode);

    const stale = fakeStorage({
      [SAVE_KEY]: JSON.stringify({ version: 1, contentVersion: 'другая', savedAt: 0, state: {}, screen: 'game' }),
    });
    const third = createStore({ content, storage: stale, now: () => 7 });
    expect(third.continueSaved()).toBe(false);
  });

  it('откат возвращает на шаг назад, пока история не пуста', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    store.quickStart();
    const start = store.getSnapshot().state!.node;
    const choice = store.engine.choices(store.getSnapshot().state!)[0]!;
    store.choose(choice.index);
    expect(store.getSnapshot().state!.node).toBe(choice.choice.target);

    store.rollback();
    expect(store.getSnapshot().state!.node).toBe(start);
    store.rollback();                       // история пуста — ничего не происходит
    expect(store.getSnapshot().state!.node).toBe(start);
  });

  it('проходит короткий золотой путь и записывает финал в галерею', () => {
    const fixture = JSON.parse(
      readFileSync(join(ROOT, 'tests', 'fixtures', 'golden-paths.json'), 'utf8'),
    ) as { paths: { ending: number; kind: string; steps: GoldenStep[] }[] };
    const short = [...fixture.paths].sort((a, b) => a.steps.length - b.steps.length)[0]!;
    const expected = replay(content, short.steps);

    const storage = fakeStorage();
    // rng подменяется перед каждым броском: так путь из фикстуры воспроизводится точно
    let rng: () => number = () => 0.5;
    const store = createStore({ content, storage, rng: () => rng(), now: () => 1 });
    store.newGame(createReadyHero());

    for (const step of short.steps) {
      switch (step.type) {
        case 'choose': store.choose(step.index); break;
        case 'roll': rng = rngForTotal(step.total); store.roll(); break;
        case 'forward': store.openMap(); break;
        case 'enterSquare': store.moveTo(step.id); break;
      }
    }

    const snapshot = store.getSnapshot();
    expect(snapshot.state!.finished).toBe(true);
    expect(snapshot.state!.ending).toBe(expected.ending);
    expect(snapshot.screen).toBe('ending');
    expect(snapshot.gallery).toContain(short.ending);
    expect(JSON.parse(storage.getItem(GALLERY_KEY)!)).toContain(short.ending);
  });

  it('новая партия стирает сохранение, но помнит галерею', () => {
    const storage = fakeStorage({ [GALLERY_KEY]: JSON.stringify([542]) });
    const store = createStore({ content, storage, now: () => 1 });
    store.quickStart();
    store.restart();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
    expect(store.getSnapshot().state).toBeNull();
    expect(store.getSnapshot().gallery).toEqual([542]);
    expect(store.getSnapshot().screen).toBe('menu');
  });
});
