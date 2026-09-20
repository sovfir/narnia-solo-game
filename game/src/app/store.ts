/**
 * Состояние приложения: движок + экраны + сохранения.
 *
 * Хранилище маленькое и без внешних зависимостей: один объект, подписка для Preact
 * (через useSyncExternalStore) и запись в localStorage после каждого действия.
 *
 * Сохранения (§8.6): автослот + три ручных слота, короткая контрольная сумма,
 * версия контента и миграции по номеру версии.
 */

import { createEngine, type Engine, type GameState } from '../engine/engine.ts';
import { createReadyHero, type Hero } from '../engine/hero.ts';
import type { Content, SquareId } from '../engine/types.ts';

export type Screen =
  | 'splash' | 'menu' | 'hero' | 'prologue' | 'rules' | 'game'
  | 'sheet' | 'journal' | 'ending' | 'gallery' | 'saves' | 'settings' | 'lore';

export type SaveSlot = 'auto' | 'slot1' | 'slot2' | 'slot3';

export const SAVE_SLOTS: readonly SaveSlot[] = ['auto', 'slot1', 'slot2', 'slot3'];

export const SLOT_LABELS: Record<SaveSlot, string> = {
  auto: 'Автосохранение',
  slot1: 'Слот 1',
  slot2: 'Слот 2',
  slot3: 'Слот 3',
};

/** Автослот исторически лежит под этим ключом — менять нельзя, иначе потеряются партии. */
export const SAVE_KEY = 'narnia.save.v1';
export const SETTINGS_KEY = 'narnia.settings.v1';

export interface Settings {
  /** Тема оформления: пергамент, ночь или как в системе (§3.1). */
  theme: 'parchment' | 'night' | 'system';
  /** Скорость анимации кубиков (§S10). */
  diceSpeed: 'normal' | 'fast';
  /** Показывать ли подсказки в сложных узлах (§6.9). */
  hints: boolean;
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system', diceSpeed: 'normal', hints: true };
export const GALLERY_KEY = 'narnia.gallery.v1';
export const SAVE_VERSION = 1;

export function slotKey(slot: SaveSlot): string {
  return slot === 'auto' ? SAVE_KEY : `${SAVE_KEY}.${slot}`;
}

export interface SaveFile {
  version: number;
  contentVersion: string;
  savedAt: number;
  /** Короткая свёртка состояния: ловит испорченный JSON. */
  checksum: string;
  state: GameState;
  screen: Screen;
}

export interface SaveInfo {
  slot: SaveSlot;
  label: string;
  savedAt: number;
  heroName: string;
  node: number;
  square: SquareId | null;
  marks: number;
  ending: GameState['ending'];
  broken: boolean;
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
  /** Сохранения по слотам — для экрана «Сохранения». */
  saves: SaveInfo[];
  settings: Settings;
  /** Герой, выбранный на экране создания: партия начнётся после пролога. */
  pendingHero: Hero | null;
}

export type Listener = (snapshot: AppSnapshot) => void;

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
  /** Выбрать героя и показать пролог: партия ещё не начата. */
  beginGame(hero: Hero): void;
  /** Начать партию сразу с узла (используется прологом и ссылкой #node=NNN). */
  startGameAt(node: number, hero?: Hero): boolean;
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
  /** Дозаписать текущую партию в слот (ручное сохранение). */
  saveTo(slot: SaveSlot): boolean;
  /** Загрузить партию из слота. */
  loadFrom(slot: SaveSlot): boolean;
  /** Изменить настройку и сохранить её. */
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void;
  /**
   * Начать партию сразу с указанного узла.
   * Нужно для проверки сцен: `index.html#node=160` открывает нужный узел.
   */
  startAt(node: number): boolean;
  /** Сбросить весь прогресс: сохранения и галерею. */
  resetProgress(): void;
  deleteSlot(slot: SaveSlot): void;
  listSaves(): SaveInfo[];
  /** Сохранение в виде JSON-строки для экспорта. */
  exportCurrent(): string;
  /** Импорт партии из JSON; возвращает причину отказа или null при успехе. */
  importSave(text: string): string | null;
  clearSave(): void;
}

/** Короткая свёртка строки (FNV-1a) — используется и для версии контента, и для состояния. */
export function shortHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Миграции сохранений по версии: ключ — версия, из которой переходим. */
export const MIGRATIONS: Record<number, (save: SaveFile) => SaveFile> = {
  // 1 → 2: когда схема изменится, здесь появится преобразование
};

function migrate(save: SaveFile): SaveFile {
  let current = save;
  while (current.version < SAVE_VERSION && MIGRATIONS[current.version]) {
    current = MIGRATIONS[current.version]!(current);
  }
  return current;
}

function isSaveFile(value: unknown): value is SaveFile {
  if (!value || typeof value !== 'object') return false;
  const save = value as Partial<SaveFile>;
  return typeof save.version === 'number' && typeof save.state === 'object' && save.state !== null;
}

export function createStore(options: StoreOptions): AppStore {
  const { content } = options;
  const storage = options.storage === undefined
    ? (typeof localStorage === 'undefined' ? null : localStorage)
    : options.storage;
  const rng = options.rng ?? (() => Math.random());
  const now = options.now ?? (() => Date.now());
  const engine = createEngine(content, {
    now,
    ...(options.startNode !== undefined ? { startNode: options.startNode } : {}),
  });

  let settings: Settings = { ...DEFAULT_SETTINGS };
  try {
    const raw = storage?.getItem(SETTINGS_KEY);
    if (raw) settings = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }

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
  let pendingHero: Hero | null = null;

  function readSlot(slot: SaveSlot): { save: SaveFile | null; broken: boolean } {
    const raw = storage?.getItem(slotKey(slot));
    if (!raw) return { save: null, broken: false };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isSaveFile(parsed)) return { save: null, broken: true };
      const migrated = migrate(parsed);
      const expected = shortHash(JSON.stringify(migrated.state));
      if (migrated.checksum && migrated.checksum !== expected) return { save: null, broken: true };
      return { save: migrated, broken: false };
    } catch {
      return { save: null, broken: true };
    }
  }

  function listSaves(): SaveInfo[] {
    return SAVE_SLOTS.map((slot) => {
      const { save, broken } = readSlot(slot);
      return {
        slot,
        label: SLOT_LABELS[slot],
        savedAt: save?.savedAt ?? 0,
        heroName: save?.state.hero?.name ?? '',
        node: save?.state.node ?? 0,
        square: save?.state.square ?? null,
        marks: save?.state.marks?.length ?? 0,
        ending: save?.state.ending ?? null,
        broken,
      };
    });
  }

  let current: AppSnapshot = buildSnapshot();

  function buildSnapshot(): AppSnapshot {
    return {
      screen,
      state,
      mapOpen,
      hasSave: storage?.getItem(SAVE_KEY) !== null,
      gallery,
      saves: listSaves(),
      settings,
      pendingHero,
    };
  }

  function emit(): void {
    persist();                 // сначала запись: она может пополнить галерею финалов
    current = buildSnapshot();
    for (const listener of listeners) listener(current);
  }

  function writeSlot(slot: SaveSlot, snapshotState: GameState, targetScreen: Screen): boolean {
    if (!storage) return false;
    const trimmed: GameState = { ...snapshotState, history: snapshotState.history.slice(-40) };
    const save: SaveFile = {
      version: SAVE_VERSION,
      contentVersion: content.version,
      savedAt: now(),
      checksum: shortHash(JSON.stringify(trimmed)),
      state: trimmed,
      screen: trimmed.finished ? 'ending' : targetScreen,
    };
    try {
      storage.setItem(slotKey(slot), JSON.stringify(save));
      return true;
    } catch {
      return false;                       // переполнение хранилища не должно ломать игру
    }
  }

  function persist(): void {
    if (!state) return;
    writeSlot('auto', state, screen);
    if (state.finished && state.ending && !gallery.includes(state.node)) {
      gallery = [...gallery, state.node];
      try {
        storage?.setItem(GALLERY_KEY, JSON.stringify(gallery));
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
    listSaves,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    go(next) {
      screen = next;
      mapOpen = false;
      emit();
    },

    beginGame(hero) {
      pendingHero = hero;
      state = null;
      screen = 'prologue';
      mapOpen = false;
      emit();
    },

    startGameAt(node, hero) {
      if (!content.nodes.has(node)) return false;
      const chosen = hero ?? pendingHero ?? createReadyHero();
      const started = engine.start(chosen).state;
      pendingHero = null;
      setState({ ...started, node, visitedNodes: [node] }, 'game');
      return true;
    },

    newGame(hero) {
      pendingHero = null;
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
      pendingHero = null;
      screen = 'menu';
      mapOpen = false;
      storage?.removeItem(slotKey('auto'));
      emit();
    },

    continueSaved() {
      return store.loadFrom('auto');
    },

    saveTo(slot) {
      if (!state) return false;
      const ok = writeSlot(slot, state, screen);
      emit();
      return ok;
    },

    loadFrom(slot) {
      const { save } = readSlot(slot);
      if (!save) return false;
      if (save.contentVersion !== content.version) return false;
      state = save.state;
      screen = save.state.finished ? 'ending' : (save.screen === 'splash' ? 'game' : save.screen);
      mapOpen = false;
      emit();
      return true;
    },

    deleteSlot(slot) {
      storage?.removeItem(slotKey(slot));
      emit();
    },

    setSetting(key, value) {
      settings = { ...settings, [key]: value };
      try {
        storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        /* настройки не критичны */
      }
      emit();
    },

    startAt(node) {
      return store.startGameAt(node);
    },

    resetProgress() {
      for (const slot of SAVE_SLOTS) storage?.removeItem(slotKey(slot));
      gallery = [];
      storage?.removeItem(GALLERY_KEY);
      state = null;
      pendingHero = null;
      screen = 'menu';
      mapOpen = false;
      emit();
    },

    exportCurrent() {
      if (!state) return '';
      const save: SaveFile = {
        version: SAVE_VERSION,
        contentVersion: content.version,
        savedAt: now(),
        checksum: shortHash(JSON.stringify(state)),
        state,
        screen: state.finished ? 'ending' : screen,
      };
      return JSON.stringify(save, null, 1);
    },

    importSave(text) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return 'не удалось разобрать JSON';
      }
      if (!isSaveFile(parsed)) return 'это не файл сохранения';
      const save = migrate(parsed);
      if (save.checksum && save.checksum !== shortHash(JSON.stringify(save.state))) {
        return 'контрольная сумма не совпала — файл повреждён';
      }
      if (!content.nodes.has(save.state.node)) return 'сохранение от другого контента';
      state = save.state;
      screen = save.state.finished ? 'ending' : 'game';
      mapOpen = false;
      emit();
      return null;
    },

    clearSave() {
      storage?.removeItem(slotKey('auto'));
      emit();
    },
  };

  return store;
}
