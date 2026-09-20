/** Настройки, вход в конкретный узел и сброс прогресса. */

import { describe, expect, it } from 'vitest';

import { GALLERY_KEY, SETTINGS_KEY, createStore, type StorageLike } from '../../src/app/store.ts';
import { loadDiskContent } from '../support/content.ts';

const content = loadDiskContent();

function fakeStorage(): StorageLike & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: (key) => { delete data[key]; },
  };
}

describe('настройки', () => {
  it('по умолчанию тема системная, анимация обычная', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    expect(store.getSnapshot().settings).toEqual({ theme: 'system', diceSpeed: 'normal', hints: true });
  });

  it('сохраняет выбор и переживает перезапуск', () => {
    const storage = fakeStorage();
    const first = createStore({ content, storage, now: () => 1 });
    first.setSetting('theme', 'night');
    first.setSetting('diceSpeed', 'fast');
    expect(JSON.parse(storage.data[SETTINGS_KEY]!).theme).toBe('night');

    const second = createStore({ content, storage, now: () => 2 });
    expect(second.getSnapshot().settings.theme).toBe('night');
    expect(second.getSnapshot().settings.diceSpeed).toBe('fast');
  });

  it('терпит испорченный файл настроек', () => {
    const storage = fakeStorage();
    storage.data[SETTINGS_KEY] = '{ сломано';
    const store = createStore({ content, storage, now: () => 1 });
    expect(store.getSnapshot().settings.theme).toBe('system');
  });
});

describe('вход в конкретный узел', () => {
  it('начинает партию на указанном узле', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    expect(store.startAt(160)).toBe(true);
    const state = store.getSnapshot().state!;
    expect(state.node).toBe(160);
    expect(state.visitedNodes).toEqual([160]);
    expect(store.getSnapshot().screen).toBe('game');
    expect(store.engine.node(state).check).not.toBeNull();
  });

  it('отказывается от несуществующего узла', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    expect(store.startAt(9999)).toBe(false);
    expect(store.getSnapshot().state).toBeNull();
  });
});

describe('сброс прогресса', () => {
  it('стирает сохранения и галерею, но не настройки', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 1 });
    store.quickStart();
    store.saveTo('slot1');
    store.setSetting('theme', 'night');
    storage.data[GALLERY_KEY] = JSON.stringify([235]);

    store.resetProgress();
    expect(store.getSnapshot().state).toBeNull();
    expect(store.getSnapshot().gallery).toEqual([]);
    expect(store.listSaves().every((slot) => slot.node === 0)).toBe(true);
    expect(store.getSnapshot().settings.theme).toBe('night');
  });
});
