/** Экран настроек S14 и служебные действия. */

import type { JSX } from 'preact';

import { useAppSnapshot, useStore } from '../../app/hooks.ts';
import { Button } from '../components.tsx';
import type { Settings } from '../../app/store.ts';

const THEMES: { value: Settings['theme']; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'parchment', label: 'Пергамент' },
  { value: 'night', label: 'Ночь' },
];

export function SettingsScreen(): JSX.Element {
  const store = useStore();
  const { settings, state, gallery } = useAppSnapshot();

  return (
    <main class="screen screen--settings">
      <h2 class="screen__title">Настройки</h2>

      <div class="card">
        <h3 class="card__title">Оформление</h3>
        <div class="tabs">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              class={`tab ${settings.theme === theme.value ? 'tab--on' : ''}`}
              onClick={() => store.setSetting('theme', theme.value)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Кубики</h3>
        <div class="tabs">
          <button
            type="button"
            class={`tab ${settings.diceSpeed === 'normal' ? 'tab--on' : ''}`}
            onClick={() => store.setSetting('diceSpeed', 'normal')}
          >
            Обычная анимация
          </button>
          <button
            type="button"
            class={`tab ${settings.diceSpeed === 'fast' ? 'tab--on' : ''}`}
            onClick={() => store.setSetting('diceSpeed', 'fast')}
          >
            Быстро
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Прогресс</h3>
        <p class="hint">
          Сохранений: {store.listSaves().filter((slot) => slot.node > 0).length} ·
          открыто концовок: {gallery.length} из 15
        </p>
        <Button kind="danger" onClick={() => store.resetProgress()}>
          Стереть весь прогресс
        </Button>
      </div>

      <Button kind={state ? 'primary' : 'ghost'} onClick={() => store.go(state ? 'game' : 'menu')}>
        Назад
      </Button>
    </main>
  );
}
