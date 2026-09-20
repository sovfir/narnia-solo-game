/** Экраны игры: S8 сцена с действиями, карта, S12 лист персонажа, S13 дневник. */

import { useEffect, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { useAppSnapshot, useStore } from '../../app/hooks.ts';
import { Button, MarksGrid, SceneText, SkillsList, StatusBar } from '../components.tsx';
import { DiceOverlay } from '../components/DiceOverlay.tsx';
import { neighbours } from '../../engine/map.ts';
import { KIND_LABELS, treasuresFor } from '../../content/treasures.ts';
import { readingLabel, splitIntoPages } from '../reading.ts';
import type { SquareId } from '../../engine/types.ts';

function MapPicker(props: { onPick: (id: SquareId) => void; onClose: () => void; current: SquareId | null }): JSX.Element {
  const store = useStore();
  const squares = [...store.content.squares.keys()];
  const reachable = props.current ? neighbours(props.current) : squares;
  const rows = ['А', 'Б', 'В', 'Г'];
  const cols = [1, 2, 3, 4, 5, 6];
  return (
    <div class="overlay">
      <div class="overlay__panel">
        <h3 class="overlay__title">Куда идём{props.current ? ` из ${props.current}` : ''}?</h3>
        <div class="map">
          {rows.map((row) => (
            <div class="map__row" key={row}>
              {cols.map((col) => {
                const id = `${col}${row}`;
                const known = squares.includes(id);
                const here = props.current === id;
                const can = reachable.includes(id) && !here;
                return (
                  <button
                    type="button"
                    key={id}
                    class={`map__cell ${here ? 'map__cell--here' : ''} ${can ? 'map__cell--can' : ''}`}
                    disabled={!known || !can}
                    onClick={() => props.onPick(id)}
                    title={store.content.squares.get(id)?.narrative.slice(0, 80)}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p class="hint">Идти можно в любой из восьми соседних квадратов.</p>
        <Button onClick={props.onClose}>Закрыть</Button>
      </div>
    </div>
  );
}

export function GameScreen(): JSX.Element {
  const store = useStore();
  const { state, mapOpen, settings } = useAppSnapshot();
  const [showRollback, setShowRollback] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (!state) {
    return (
      <main class="screen">
        <p>Партия не начата.</p>
        <Button onClick={() => store.go('menu')}>В меню</Button>
      </main>
    );
  }

  const node = store.engine.node(state);
  const pages = useMemo(() => splitIntoPages(node.narrative), [node.narrative]);
  const lastPage = page >= pages.length - 1;

  // новая сцена читается с первой страницы
  useEffect(() => {
    setPage(0);
    setShowAll(false);
  }, [node.id]);

  const choices = store.engine.choices(state);
  const canRoll = node.check !== null;
  const canForward = node.forward || node.squares.length > 0;
  const canRollback = state.history.length > 0;

  return (
    <main class="screen screen--game">
      <StatusBar
        state={state}
        onSheet={() => store.go('sheet')}
        onJournal={() => store.go('journal')}
      />

      <section class="scene">
        {state.square && <p class="scene__place">Квадрат {state.square}</p>}
        <p class="scene__node">Событие {node.id}</p>
        {readingLabel(node.narrative) && <p class="scene__time">{readingLabel(node.narrative)}</p>}
        <SceneText text={showAll ? node.narrative : (pages[page] ?? node.narrative)} />
        {pages.length > 1 && !showAll && (
          <div class="pager">
            <span class="pager__count">Страница {page + 1} из {pages.length}</span>
            {!lastPage && (
              <Button kind="ghost" onClick={() => setPage((value) => value + 1)}>Дальше ▸</Button>
            )}
            <Button kind="ghost" onClick={() => setShowAll(true)}>Показать всё</Button>
          </div>
        )}
      </section>

      <section class="actions" hidden={!showAll && !lastPage}>
        {canRoll && (
          <Button kind="primary" onClick={() => { store.roll(); setDiceOpen(true); }}>
            {node.check?.skill ? 'Бросить кубики' : 'Выбрать число'}
          </Button>
        )}
        {choices.map(({ choice, index }) => (
          <Button key={`${node.id}-${index}`} kind={canRoll ? 'ghost' : 'primary'}
            onClick={() => store.choose(index)}>
            {choice.label ?? `Вариант ${index + 1}`}
          </Button>
        ))}
        {canForward && <Button kind={choices.length || canRoll ? 'ghost' : 'primary'} onClick={() => store.openMap()}>Вперёд</Button>}
        {canRollback && (
          <Button kind="ghost" onClick={() => setShowRollback(true)}>Откат</Button>
        )}
      </section>

      {showRollback && (
        <div class="overlay">
          <div class="overlay__panel">
            <h3 class="overlay__title">Вернуться на один шаг?</h3>
            <p class="hint">Откат доступен только до узла {state.history.at(-1)?.node}.</p>
            <Button kind="danger" onClick={() => { store.rollback(); setShowRollback(false); }}>Да, назад</Button>
            <Button onClick={() => setShowRollback(false)}>Отмена</Button>
          </div>
        </div>
      )}

      {diceOpen && state.lastRoll && (
        <DiceOverlay
          roll={state.lastRoll}
          speed={settings.diceSpeed}
          onClose={() => setDiceOpen(false)}
        />
      )}

      {mapOpen && (
        <MapPicker
          current={state.square}
          onPick={(id) => store.moveTo(id)}
          onClose={() => store.closeMap()}
        />
      )}
    </main>
  );
}

export function SheetScreen(): JSX.Element {
  const store = useStore();
  const { state } = useAppSnapshot();
  if (!state) return <main class="screen"><Button onClick={() => store.go('menu')}>В меню</Button></main>;
  return (
    <main class="screen screen--sheet">
      <h2 class="screen__title">Лист персонажа</h2>
      <div class="card">
        <p class="sheet__hero">
          {state.hero.name} · {state.hero.kind === 'ready' ? 'готовый герой' : 'свой герой'}
        </p>
        <SkillsList state={state} />
      </div>
      {treasuresFor(state.marks).length > 0 && (
        <div class="card">
          <h3 class="card__title">Ключи и сокровища</h3>
          <ul class="treasures">
            {treasuresFor(state.marks).map((treasure) => (
              <li key={treasure.mark} class={`treasure treasure--${treasure.kind}`}>
                <span class="treasure__name">{treasure.name}</span>
                <span class="hint">
                  {KIND_LABELS[treasure.kind]} · отметка {treasure.mark}
                  {treasure.note ? ` · ${treasure.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class="card">
        <h3 class="card__title">Отметки путешествия</h3>
        <MarksGrid marks={state.marks} />
      </div>
      <div class="card">
        <h3 class="card__title">Временные модификаторы</h3>
        {state.tempMods.length === 0
          ? <p class="hint">Пока нет.</p>
          : (
            <ul class="journal">
              {state.tempMods.map((mod, index) => (
                <li key={index}>
                  {mod.skill}: {mod.delta > 0 ? '+' : ''}{mod.delta}
                  {mod.chargesLeft === null ? ' (бессрочно)' : ` (осталось ${mod.chargesLeft})`}
                  <span class="hint"> — {mod.reason}</span>
                </li>
              ))}
            </ul>
          )}
      </div>
      <Button kind="primary" onClick={() => store.go('game')}>Вернуться в игру</Button>
    </main>
  );
}

export function JournalScreen(): JSX.Element {
  const store = useStore();
  const { state } = useAppSnapshot();
  if (!state) return <main class="screen"><Button onClick={() => store.go('menu')}>В меню</Button></main>;
  const entries = [...state.journal].reverse();
  return (
    <main class="screen screen--journal">
      <h2 class="screen__title">Дневник решений</h2>
      <p class="hint">Узлов пройдено: {state.visitedNodes.length} · ходов в журнале: {entries.length}</p>
      <ul class="journal">
        {entries.map((entry, index) => (
          <li key={index} class={`journal__item journal__item--${entry.kind}`}>
            <span class="journal__node">{entry.node ? `№${entry.node}` : '—'}</span>
            <span class="journal__text">{entry.text}</span>
          </li>
        ))}
      </ul>
      <Button kind="primary" onClick={() => store.go('game')}>Вернуться в игру</Button>
    </main>
  );
}
