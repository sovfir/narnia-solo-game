/**
 * Состояние приложения: движок + экраны + автосохранение.
 *
 * Хранилище намеренно маленькое и без внешних зависимостей: один объект,
 * подписка для Preact и запись в localStorage после каждого действия.
 */

import { createEngine, type Engine, type GameState } from '../engine/engine.ts';
import { createReadyHero, type Hero } from '../engine/hero.ts';
import type { Content, SquareId } from '../engine/types.ts';

export type Screen =
  | 'splash' | 'menu' | 'hero' | 'prologue' | 'game' | 'sheet' | 'journal' | 'ending' | 'gallery';

export interface SaveFile {
  version: 1;
  contentVersion: string;
  savedAt: number;
  state: GameState;
  screen: Screen;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AppSnapshot {
  screen: Screen;
  /** null, пока партия не начата. */
  state: GameState | null;
  /** Открыт выбор квадрата на карте (режим «Вперёд»). */
  mapOpen: boolean;
  hasSave: boolean;
  /** Достигнутые финалы (номера узлов) за все партии — для галереи S7. */
  gallery: number[];
}

export type Listener = (snapshot: AppSnapshot) => void;

export const SAVE_KEY = 'narnia.save.v1';
export const GALLERY_KEY = 'narnia.gallery.v1';

export interface StoreOptions {
  content: Content;
  storage?: StorageLike | null;
  rng?: () => number;
  now?: () => number;
  startNode?: number;
}

export interface AppStore {
  readonly engine: Engine;
  readonly content: Content;
  getSnapshot(): AppSnapshot;
  subscribe(listener: Listener): () => void;

  go(screen: Screen): void;
  newGame(hero: Hero): void;
  quickStart(): void;
  choose(index: number): void;
  roll(): void;
  openMap(): void;
  closeMap(): void;
  moveTo(square: SquareId): void;
  rollback(): void;
  restart(): void;
  continueSaved(): boolean;
  clearSave(): void;
}

function isSaveFile(value: unknown): value is SaveFile {
  if (!value || typeof value !== 'object') return false;
  const save = value as Partial<SaveFile>;
  return save.version === 1 && typeof save.state === 'object' && typeof save.screen === 'string';
}

export function createStore(options: StoreOptions): AppStore {
  const { content } = options;
  const storage = options.storage === undefined
    ? (typeof localStorage === 'undefined' ? null : localStorage)
    : options.storage;
  const rng = options.rng ?? (() => Math.random());
  const now = options.now ?? (() => Date.now());
  const engine = createEngine(content, { now, ...(options.startNode !== undefined ? { startNode: options.startNode } : {}) });

  let gallery: number[] = [];
  try {
    const raw = storage?.getItem(GALLERY_KEY);
    if (raw) gallery = JSON.parse(raw) as number[];
  } catch {
    gallery = [];
  }

  const listeners = new Set<Listener>();
  let state: GameState | null = null;
  let screen: Screen = 'splash';
  let mapOpen = false;

  // Снимок кешируется: useSyncExternalStore требует стабильную ссылку,
  // пока состояние не изменилось.
  let current: AppSnapshot = {
    screen,
    state,
    mapOpen,
    hasSave: storage?.getItem(SAVE_KEY) !== null,
    gallery,
  };

  function refresh(): void {
    current = {
      screen,
      state,
      mapOpen,
      hasSave: storage?.getItem(SAVE_KEY) !== null,
      gallery,
    };
  }

  function emit(): void {
    persist();               // сначала запись: она может пополнить галерею финалов
    refresh();
    for (const listener of listeners) listener(current);
  }

  function persist(): void {
    if (!storage) return;
    if (!state) return;
    const save: SaveFile = {
      version: 1,
      contentVersion: content.version,
      savedAt: now(),
      state: { ...state, history: state.history.slice(-40) },
      screen: state.finished ? 'ending' : screen,
    };
    try {
      storage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      // переполнение хранилища не должно ломать игру
    }
    if (state.finished && state.ending && !gallery.includes(state.node)) {
      gallery = [...gallery, state.node];
      try {
        storage.setItem(GALLERY_KEY, JSON.stringify(gallery));
      } catch {
        /* см. выше */
      }
    }
  }

  function setState(next: GameState, nextScreen?: Screen): void {
    state = next;
    if (state.finished) screen = 'ending';
    else if (nextScreen) screen = nextScreen;
    mapOpen = false;
    emit();
  }

  const store: AppStore = {
    engine,
    content,
    getSnapshot: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    go(next) {
      screen = next;
      mapOpen = false;
      emit();
    },

    newGame(hero) {
      setState(engine.start(hero).state, 'game');
    },

    quickStart() {
      setState(engine.start(createReadyHero()).state, 'game');
    },

    choose(index) {
      if (!state) return;
      setState(engine.reduce(state, { type: 'choose', index }).state, 'game');
    },

    roll() {
      if (!state) return;
      setState(engine.reduce(state, { type: 'roll', rng }).state, 'game');
    },

    openMap() {
      mapOpen = true;
      emit();
    },

    closeMap() {
      mapOpen = false;
      emit();
    },

    moveTo(square) {
      if (!state) return;
      const afterForward = engine.reduce(state, { type: 'forward', to: square }).state;
      const entered = engine.reduce(afterForward, { type: 'enterSquare', id: square }).state;
      setState(entered, 'game');
    },

    rollback() {
      if (!state || state.history.length === 0) return;
      setState(engine.reduce(state, { type: 'rollback' }).state, 'game');
    },

    restart() {
      state = null;
      screen = 'menu';
      mapOpen = false;
      storage?.removeItem(SAVE_KEY);
      emit();
    },

    continueSaved() {
      if (!storage) return false;
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) return false;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isSaveFile(parsed)) return false;
        if (parsed.contentVersion !== content.version) return false;
        state = parsed.state;
        screen = parsed.state.finished ? 'ending' : parsed.screen === 'splash' ? 'game' : parsed.screen;
        mapOpen = false;
        emit();
        return true;
      } catch {
        return false;
      }
    },

    clearSave() {
      storage?.removeItem(SAVE_KEY);
      emit();
    },
  };

  return store;
}
