/** Экран финала S15. */

import type { JSX } from 'preact';

import { useAppSnapshot, useStore } from '../../app/hooks.ts';
import { Button, SceneText } from '../components.tsx';

const TONE: Record<string, { title: string; note: string }> = {
  victory: {
    title: 'Победа',
    note: 'Книга заклинаний в твоих руках, и Нарния свободна. Аслан доволен.',
  },
  fall: {
    title: 'Падение',
    note: 'Тьма взяла верх. Но даже из падения можно вынести урок — попробуй снова.',
  },
  death: {
    title: 'Гибель',
    note: 'Путь оборвался. В книге-игре это тоже часть истории: вернись и выбери иначе.',
  },
};

export function EndingScreen(): JSX.Element {
  const store = useStore();
  const { state } = useAppSnapshot();
  if (!state) {
    return (
      <main class="screen">
        <Button onClick={() => store.go('menu')}>В меню</Button>
      </main>
    );
  }
  const kind = state.ending ?? 'death';
  const tone = TONE[kind] ?? TONE.death!;
  const node = store.engine.node(state);

  return (
    <main class={`screen screen--ending screen--ending-${kind}`}>
      <h2 class="screen__title">{tone.title}</h2>
      <p class="ending__note">{tone.note}</p>
      <div class="card scene">
        <SceneText text={node.narrative} />
      </div>
      <div class="card">
        <h3 class="card__title">Итоги партии</h3>
        <ul class="stats">
          <li>Узлов пройдено: <b>{state.visitedNodes.length}</b> из {store.content.order.length}</li>
          <li>Отметок собрано: <b>{state.marks.length}</b></li>
          <li>Ходов в журнале: <b>{state.journal.length}</b></li>
        </ul>
      </div>
      <div class="menu__actions">
        <Button kind="primary" onClick={() => store.restart()}>Новая партия</Button>
        <Button onClick={() => store.go('gallery')}>Галерея концовок</Button>
      </div>
    </main>
  );
}
