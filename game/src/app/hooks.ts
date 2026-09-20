/** Связка хранилища с Preact: подписка и контекст. */

import { createContext } from 'preact';
import { useCallback, useContext } from 'preact/hooks';
import { useSyncExternalStore } from 'preact/compat';

import type { AppSnapshot, AppStore } from './store.ts';

export const StoreContext = createContext<AppStore | null>(null);

export function useStore(): AppStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreContext не задан');
  return store;
}

/**
 * Снимок состояния с подпиской.
 *
 * useSyncExternalStore берёт значение прямо из хранилища, поэтому изменение
 * не может потеряться между отрисовкой и подпиской.
 */
export function useAppSnapshot(): AppSnapshot {
  const store = useStore();
  const subscribe = useCallback((listener: () => void) => store.subscribe(listener), [store]);
  const getSnapshot = useCallback(() => store.getSnapshot(), [store]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
