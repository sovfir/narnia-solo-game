import { render } from 'preact';

import { StoreContext } from './app/hooks.ts';
import { createStore } from './app/store.ts';
import { App } from './ui/App.tsx';
import { loadBrowserContent } from './content/browser.ts';
import './ui/styles.css';

// Регистрация service worker'а: офлайн-режим и установка на домашний экран (§9).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

const root = document.getElementById('app');
if (!root) throw new Error('не найден #app');

root.innerHTML = '<div class="screen screen--splash"><h1 class="splash__title">' +
  'Колдунья и Книга заклинаний</h1><p class="splash__hint">Загрузка…</p></div>';

async function boot(): Promise<void> {
  const content = await loadBrowserContent();
  const store = createStore({ content });

  render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>,
    root!,
  );

  // Если партия сохранена — предлагаем меню, а не сплэш новой игры.
  if (store.getSnapshot().hasSave) store.go('menu');

  Object.assign(window, { __NARNIA__: { store } });
}

boot().catch((error: unknown) => {
  root!.innerHTML = `<div class="screen"><h1 class="screen__title">Не удалось запустить игру</h1>` +
    `<p class="hint">${String(error)}</p></div>`;
});
