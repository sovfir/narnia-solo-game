/** Слоты сохранений: ручная запись, загрузка, удаление, экспорт и импорт. */

import { describe, expect, it } from 'vitest';

import { SAVE_KEY, SLOT_LABELS, createStore, shortHash, slotKey, type StorageLike } from '../../src/app/store.ts';
import { createReadyHero } from '../../src/engine/hero.ts';
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

describe('сохранения', () => {
  it('держит автослот и три ручных слота', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 100 });
    expect(store.listSaves().map((s) => s.slot)).toEqual(['auto', 'slot1', 'slot2', 'slot3']);
    expect(store.listSaves().every((s) => s.node === 0)).toBe(true);
    expect(SLOT_LABELS.slot3).toBe('Слот 3');
  });

  it('пишет партию в выбранный слот и перезаписывает его', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 500 });
    store.quickStart();
    const choice = store.engine.choices(store.getSnapshot().state!)[0]!;
    store.choose(choice.index);

    expect(store.saveTo('slot2')).toBe(true);
    const info = store.listSaves().find((s) => s.slot === 'slot2')!;
    expect(info.node).toBe(choice.choice.target);
    expect(info.heroName).toBe('Робин Трэверсток');
    expect(storage.data[slotKey('slot2')]).toBeTruthy();
    expect(storage.data[SAVE_KEY]).toBeTruthy();          // автослот пишется сам
  });

  it('загружает другой слот и не путает версии контента', () => {
    const storage = fakeStorage();
    const first = createStore({ content, storage, now: () => 1 });
    first.quickStart();
    first.saveTo('slot1');
    const savedNode = first.getSnapshot().state!.node;

    first.choose(first.engine.choices(first.getSnapshot().state!)[0]!.index);
    expect(first.getSnapshot().state!.node).not.toBe(savedNode);

    expect(first.loadFrom('slot1')).toBe(true);
    expect(first.getSnapshot().state!.node).toBe(savedNode);

    const raw = JSON.parse(storage.data[slotKey('slot1')]!) as { contentVersion: string };
    raw.contentVersion = 'чужой-контент';
    storage.data[slotKey('slot1')] = JSON.stringify(raw);
    expect(first.loadFrom('slot1')).toBe(false);
  });

  it('удаляет слот и помечает испорченный файл', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 1 });
    store.quickStart();
    store.saveTo('slot3');
    store.deleteSlot('slot3');
    expect(store.listSaves().find((s) => s.slot === 'slot3')!.node).toBe(0);

    storage.data[slotKey('slot1')] = '{ это не json';
    expect(store.listSaves().find((s) => s.slot === 'slot1')!.broken).toBe(true);
    expect(store.loadFrom('slot1')).toBe(false);
  });

  it('экспортирует партию и принимает её обратно', () => {
    const storage = fakeStorage();
    const source = createStore({ content, storage, now: () => 1 });
    source.quickStart();
    const choice = source.engine.choices(source.getSnapshot().state!)[0]!;
    source.choose(choice.index);
    const exported = source.exportCurrent();
    expect(exported).toContain('"checksum"');

    const target = createStore({ content, storage: fakeStorage(), now: () => 2 });
    expect(target.importSave(exported)).toBeNull();
    expect(target.getSnapshot().state!.node).toBe(choice.choice.target);
  });

  it('отклоняет импорт с поломанной контрольной суммой и мусором', () => {
    const store = createStore({ content, storage: fakeStorage(), now: () => 1 });
    expect(store.importSave('не json')).toBe('не удалось разобрать JSON');
    expect(store.importSave('{"version":1}')).toBe('это не файл сохранения');

    store.quickStart();
    const save = JSON.parse(store.exportCurrent()) as { checksum: string; state: { node: number } };
    save.state.node = 12345;
    expect(store.importSave(JSON.stringify(save))).toMatch(/контрольная сумма|другого контента/);
  });

  it('считает короткую свёртку одинаково для одинаковых данных', () => {
    expect(shortHash('Нарния')).toBe(shortHash('Нарния'));
    expect(shortHash('Нарния')).toHaveLength(8);
    expect(shortHash('Нарния')).not.toBe(shortHash('нарния'));
  });

  it('новая партия не трогает ручные слоты', () => {
    const storage = fakeStorage();
    const store = createStore({ content, storage, now: () => 1 });
    store.newGame(createReadyHero());
    store.saveTo('slot1');
    store.restart();
    expect(store.listSaves().find((s) => s.slot === 'slot1')!.node).toBeGreaterThan(0);
    expect(store.listSaves().find((s) => s.slot === 'auto')!.node).toBe(0);
  });
});
