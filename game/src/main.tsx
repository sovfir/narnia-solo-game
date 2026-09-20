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

// Заглушка на время загрузки контента: отдельный класс, чтобы её нельзя было
// спутать с настоящим сплэшем (тап по ней ничего не делает — она не интерактивна).
root.innerHTML = '<div class="screen screen--boot"><h1 class="splash__title">' +
  'Колдунья и Книга заклинаний</h1><p class="splash__hint">Загрузка…</p></div>';

async function boot(): Promise<void> {
  const content = await loadBrowserContent();
  const store = createStore({ content });

  root!.replaceChildren();          // убираем заглушку «Загрузка…», иначе она останется в DOM

  render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>,
    root!,
  );

  // Ссылка вида index.html#node=160 открывает нужный узел — так удобно проверять сцены.
  const requested = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('node');
  if (requested && store.startAt(Number(requested))) {
    // партия начата на нужном узле
  } else if (store.getSnapshot().hasSave) {
    store.go('menu');                 // есть сохранение — предлагаем продолжить
  }

  // Признак готовности приложения: по нему ждут e2e-тесты и внешние проверки.
  document.documentElement.dataset.appReady = 'true';
  Object.assign(window, { __NARNIA__: { store } });
}

boot().catch((error: unknown) => {
  root!.innerHTML = `<div class="screen"><h1 class="screen__title">Не удалось запустить игру</h1>` +
    `<p class="hint">${String(error)}</p></div>`;
});
