/** Экран «О Нарнии»: лорные разделы книги (Часть I), читаются по желанию. */

import { useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { useStore } from '../../app/hooks.ts';
import { Button, SceneText } from '../components.tsx';
import { LORE } from '../../content/lore.ts';
import { readingLabel, splitIntoPages } from '../reading.ts';

export function LoreScreen(): JSX.Element {
  const store = useStore();
  const [section, setSection] = useState(0);
  const [page, setPage] = useState(0);

  const current = LORE[section] ?? LORE[0]!;
  const pages = useMemo(() => splitIntoPages(current.text, 800), [current.text]);
  const lastPage = page >= pages.length - 1;

  function openSection(index: number): void {
    setSection(index);
    setPage(0);
  }

  return (
    <main class="screen screen--lore">
      <h2 class="screen__title">О Нарнии</h2>

      <div class="tabs">
        {LORE.map((item, index) => (
          <button
            key={item.title}
            type="button"
            class={`tab ${index === section ? 'tab--on' : ''}`}
            onClick={() => openSection(index)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div class="card scene">
        <h3 class="card__title">{current.title}</h3>
        {readingLabel(current.text) && <p class="scene__time">{readingLabel(current.text)}</p>}
        <SceneText text={pages[page] ?? current.text} />
      </div>

      <p class="hint">
        Раздел {section + 1} из {LORE.length} · страница {page + 1} из {pages.length}
      </p>

      <div class="pager">
        {page > 0 && <Button kind="ghost" onClick={() => setPage((value) => value - 1)}>◂ Назад</Button>}
        {!lastPage && <Button kind="primary" onClick={() => setPage((value) => value + 1)}>Дальше ▸</Button>}
        {section < LORE.length - 1 && (
          <Button kind="ghost" onClick={() => openSection(section + 1)}>Следующий раздел ▸</Button>
        )}
      </div>

      <Button onClick={() => store.go('menu')}>В меню</Button>
    </main>
  );
}
