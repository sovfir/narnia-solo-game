/** Экраны до игры: S1 сплэш, S2 меню, S4 создание героя, S5 пролог, S7 галерея концовок. */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { useMemo } from 'preact/hooks';

import { useStore, useAppSnapshot } from '../../app/hooks.ts';
import { PREFACE, PROLOGUE, PROLOGUE_CHOICES } from '../../content/prologue.ts';
import { splitIntoPages } from '../reading.ts';
import { Button, SceneText, SkillsList } from '../components.tsx';
import {
  MAX_SKILL, TOTAL_LEVELS, UNTRAINED_SKILL,
  createCustomHero, createReadyHero, validateDistribution,
  type Distribution, type Hero,
} from '../../engine/hero.ts';
import { SKILL_NAMES, SKILLS, type SkillId } from '../../engine/types.ts';

export function SplashScreen(): JSX.Element {
  const store = useStore();
  return (
    <main class="screen screen--splash" onClick={() => store.go('menu')}>
      <h1 class="splash__title">Колдунья и Книга заклинаний</h1>
      <p class="splash__subtitle">Игра-книга по Нарнии</p>
      <p class="splash__hint">Коснись экрана</p>
    </main>
  );
}

export function MenuScreen(): JSX.Element {
  const store = useStore();
  const { hasSave } = useAppSnapshot();
  return (
    <main class="screen screen--menu">
      <h1 class="menu__title">Колдунья и Книга заклинаний</h1>
      <div class="menu__actions">
        {hasSave && <Button kind="primary" onClick={() => store.continueSaved()}>Продолжить</Button>}
        <Button kind={hasSave ? 'ghost' : 'primary'} onClick={() => store.go('hero')}>Новая игра</Button>
        <Button onClick={() => store.go('rules')}>Как играть</Button>
        <Button onClick={() => store.go('saves')}>Сохранения</Button>
        <Button onClick={() => store.go('settings')}>Настройки</Button>
        <Button onClick={() => store.go('gallery')}>Галерея концовок</Button>
      </div>
      <p class="menu__note">
        Правила простые: выбирай вариант, бросай два кубика и добавляй навык,
        отмечай встречи — они вернутся позже.
      </p>
    </main>
  );
}

function SkillStepper(props: {
  skill: SkillId;
  levels: number;
  onChange: (next: number) => void;
  max: number;
}): JSX.Element {
  const levels = props.levels;
  return (
    <li class="stepper">
      <span class="stepper__name">{SKILL_NAMES[props.skill]}</span>
      <span class={`stepper__value ${levels === 0 ? 'stepper__value--bad' : ''}`}>
        {levels > 0 ? `+${levels}` : UNTRAINED_SKILL}
      </span>
      <button type="button" class="stepper__btn" onClick={() => props.onChange(levels - 1)}
        disabled={levels <= 0}>−</button>
      <button type="button" class="stepper__btn" onClick={() => props.onChange(levels + 1)}
        disabled={levels >= props.max}>+</button>
    </li>
  );
}

export function HeroScreen(): JSX.Element {
  const store = useStore();
  const [mode, setMode] = useState<'ready' | 'custom'>('ready');
  const [distribution, setDistribution] = useState<Distribution>({});
  const [name, setName] = useState('');

  const spent = SKILLS.reduce((sum, skill) => sum + (distribution[skill] ?? 0), 0);
  const left = TOTAL_LEVELS - spent;
  const valid = validateDistribution(distribution).ok;

  function start(hero: Hero): void {
    store.beginGame(hero);    // сначала пролог книги, партия начнётся после него
  }

  return (
    <main class="screen screen--hero">
      <h2 class="screen__title">Выбор героя</h2>
      <div class="tabs">
        <button type="button" class={`tab ${mode === 'ready' ? 'tab--on' : ''}`}
          onClick={() => setMode('ready')}>Готовый герой</button>
        <button type="button" class={`tab ${mode === 'custom' ? 'tab--on' : ''}`}
          onClick={() => setMode('custom')}>Свой герой</button>
      </div>

      {mode === 'ready' ? (
        <div class="card">
          <p><b>Робин Трэверсток</b> — все шесть навыков +1. Готовый герой из книги.</p>
          <ul class="skills">
            {SKILLS.map((skill) => (
              <li class="skill" key={skill}>
                <span class="skill__name">{SKILL_NAMES[skill]}</span>
                <span class="skill__value">+1</span>
              </li>
            ))}
          </ul>
          <Button kind="primary" onClick={() => start(createReadyHero())}>Начать с Робин</Button>
        </div>
      ) : (
        <div class="card">
          <label class="field">
            <span>Имя героя</span>
            <input value={name} onInput={(event) => setName((event.target as HTMLInputElement).value)}
              placeholder="Как тебя зовут?" />
          </label>
          <p class="hint">
            Распредели {TOTAL_LEVELS} уровней: не больше +{MAX_SKILL} в навык.
            Навык без уровня — {UNTRAINED_SKILL}. Осталось: <b>{left}</b>
          </p>
          <ul class="skills">
            {SKILLS.map((skill) => (
              <SkillStepper
                key={skill}
                skill={skill}
                levels={distribution[skill] ?? 0}
                max={MAX_SKILL}
                onChange={(next) => setDistribution({ ...distribution, [skill]: Math.max(0, Math.min(MAX_SKILL, next)) })}
              />
            ))}
          </ul>
          <Button
            kind="primary"
            disabled={!valid}
            onClick={() => start(createCustomHero(name.trim() || 'Безымянный герой', distribution))}
          >
            Начать своим героем
          </Button>
          {!valid && <p class="hint hint--warn">Сумма уровней должна быть ровно {TOTAL_LEVELS}.</p>}
        </div>
      )}
      <Button onClick={() => store.go('menu')}>Назад</Button>
    </main>
  );
}

export function RulesScreen(): JSX.Element {
  const store = useStore();
  const { state, hasSave } = useAppSnapshot();
  return (
    <main class="screen screen--prologue">
      <h2 class="screen__title">Как играть</h2>
      <div class="card scene">
        <ul class="rules">
          <li><b>Кубики.</b> Два кубика (2–12) плюс уровень навыка; всё выше 12 считается за 12, ниже 2 — за 2.</li>
          <li><b>Отметки.</b> «Поставь отметку N» — память игры. Она вернётся в проверках «проверь ключ N».</li>
          <li><b>Вперёд.</b> Кнопка «Вперёд» открывает карту: идти можно в любой из восьми соседних квадратов.</li>
          <li><b>Откат.</b> Можно вернуться на один шаг назад — но не после броска.</li>
        </ul>
      </div>
      {state && (
        <div class="card">
          <p>Текущая партия:</p>
          <SkillsList state={state} />
        </div>
      )}
      <div class="menu__actions">
        {state && <Button kind="primary" onClick={() => store.go('game')}>Вернуться в игру</Button>}
        {!state && hasSave && <Button kind="primary" onClick={() => store.continueSaved()}>Продолжить партию</Button>}
        <Button onClick={() => store.go('menu')}>Назад</Button>
      </div>
    </main>
  );
}

/**
 * Пролог книги: «Предисловие» (предыстория героя) и «ПРОЛОГ» (прибытие в Нарнию),
 * затем развилка — был ты здесь раньше или нет (узлы 494 и 317).
 */
export function PrologueScreen(): JSX.Element {
  const store = useStore();
  const { pendingHero } = useAppSnapshot();
  const [page, setPage] = useState(0);

  const sections = useMemo(() => {
    const list: { title: string; text: string }[] = [];
    // «Предисловие» читается за готового героя (так сказано в книге)
    if (!pendingHero || pendingHero.kind === 'ready') {
      for (const text of splitIntoPages(PREFACE, 800)) list.push({ title: 'Предисловие', text });
    }
    for (const text of splitIntoPages(PROLOGUE, 800)) list.push({ title: 'Пролог', text });
    return list;
  }, [pendingHero]);

  const current = sections[page];
  const lastPage = page >= sections.length - 1;

  return (
    <main class="screen screen--prologue">
      <h2 class="screen__title">{current?.title ?? 'Пролог'}</h2>
      <div class="card scene">
        <SceneText text={current?.text ?? ''} />
      </div>
      <p class="hint">
        Страница {page + 1} из {sections.length}
        {pendingHero ? ` · герой: ${pendingHero.name}` : ''}
      </p>

      {lastPage ? (
        <div class="menu__actions">
          <p class="hint">С этого места книга спрашивает:</p>
          {PROLOGUE_CHOICES.map((choice) => (
            <Button
              key={choice.node}
              kind="primary"
              onClick={() => store.startGameAt(choice.node)}
              title={choice.hint}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      ) : (
        <div class="pager">
          <span class="pager__count">Читай дальше — впереди Нарния</span>
          <Button kind="primary" onClick={() => setPage((value) => value + 1)}>Дальше ▸</Button>
          <Button kind="ghost" onClick={() => setPage(sections.length - 1)}>Пропустить пролог</Button>
        </div>
      )}
    </main>
  );
}

const ENDING_LABELS: Record<string, string> = {
  victory: 'Победа',
  fall: 'Падение',
  death: 'Гибель',
};

export function GalleryScreen(): JSX.Element {
  const store = useStore();
  const { gallery } = useAppSnapshot();
  const endings = [...store.content.nodes.values()].filter((node) => node.ending);
  return (
    <main class="screen screen--gallery">
      <h2 class="screen__title">Галерея концовок</h2>
      <p class="hint">Найдено {gallery.length} из {endings.length}</p>
      <ul class="gallery">
        {endings
          .sort((a, b) => a.id - b.id)
          .map((node) => {
            const found = gallery.includes(node.id);
            return (
              <li key={node.id} class={`gallery__item ${found ? 'gallery__item--found' : ''}`}>
                <span class="gallery__id">{found ? `№${node.id}` : '???'}</span>
                <span class="gallery__kind">{found ? ENDING_LABELS[node.ending ?? 'death'] : 'не найдено'}</span>
              </li>
            );
          })}
      </ul>
      <Button onClick={() => store.go('menu')}>Назад</Button>
    </main>
  );
}
