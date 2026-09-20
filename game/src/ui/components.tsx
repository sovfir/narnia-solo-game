/** Мелкие переиспользуемые элементы интерфейса. */

import type { JSX } from 'preact';

import { SKILL_NAMES, SKILLS, type SkillId } from '../engine/types.ts';
import type { TempMod } from '../engine/effects.ts';
import type { GameState } from '../engine/engine.ts';

export function Button(props: {
  children: JSX.Element | string;
  onClick: () => void;
  kind?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  title?: string;
}): JSX.Element {
  const { kind = 'ghost', ...rest } = props;
  return (
    <button
      type="button"
      class={`btn btn--${kind}`}
      onClick={rest.onClick}
      disabled={rest.disabled ?? false}
      title={rest.title}
    >
      {rest.children}
    </button>
  );
}

export function SkillRow(props: { skill: SkillId; value: number; temp: TempMod[] }): JSX.Element {
  const mods = props.temp.filter((m) => m.skill === props.skill);
  const bonus = mods.reduce((sum, m) => sum + m.delta, 0);
  return (
    <li class="skill">
      <span class="skill__name">{SKILL_NAMES[props.skill]}</span>
      <span class={`skill__value ${props.skill === 'inner' ? 'skill__value--inner' : ''}`}>
        {props.value > 0 ? `+${props.value}` : props.value}
      </span>
      {mods.length > 0 && (
        <span class="skill__temp" title={mods.map((m) => m.reason).join(' ')}>
          {bonus > 0 ? `+${bonus}` : bonus}
          {mods.some((m) => m.chargesLeft !== null)
            ? ` (${mods.filter((m) => m.chargesLeft !== null).map((m) => m.chargesLeft).join('/')})`
            : ' ∞'}
        </span>
      )}
    </li>
  );
}

export function StatusBar(props: { state: GameState; onSheet: () => void; onJournal: () => void }): JSX.Element {
  const { state } = props;
  return (
    <header class="statusbar">
      <button type="button" class="statusbar__item" onClick={props.onSheet}>
        <span class="statusbar__label">Герой</span>
        <span class="statusbar__value">{state.hero.name}</span>
      </button>
      {state.square && (
        <div class="statusbar__item">
          <span class="statusbar__label">Квадрат</span>
          <span class="statusbar__value">{state.square}</span>
        </div>
      )}
      <button type="button" class="statusbar__item" onClick={props.onJournal}>
        <span class="statusbar__label">Отметки</span>
        <span class="statusbar__value">{state.marks.length}</span>
      </button>
      <div class="statusbar__item">
        <span class="statusbar__label">Пройдено</span>
        <span class="statusbar__value">{state.visitedNodes.length}</span>
      </div>
    </header>
  );
}

export function SceneText(props: { text: string; paragraphs?: boolean }): JSX.Element {
  if (!props.paragraphs) return <p class="scene__text">{props.text}</p>;
  return (
    <div class="scene__text">
      {props.text.split('\n').map((line, index) => (line.trim() ? <p key={index}>{line}</p> : null))}
    </div>
  );
}

export function MarksGrid(props: { marks: number[]; onPick?: (mark: number) => void }): JSX.Element {
  return (
    <div class="marks">
      {Array.from({ length: 45 }, (_, i) => i + 1).map((mark) => {
        const active = props.marks.includes(mark);
        return (
          <button
            type="button"
            key={mark}
            class={`mark ${active ? 'mark--on' : ''}`}
            onClick={() => props.onPick?.(mark)}
            disabled={!props.onPick}
          >
            {mark}
          </button>
        );
      })}
    </div>
  );
}

export function SkillsList(props: { state: GameState }): JSX.Element {
  return (
    <ul class="skills">
      {SKILLS.map((skill) => (
        <SkillRow
          key={skill}
          skill={skill}
          value={props.state.hero.skills[skill]}
          temp={props.state.tempMods}
        />
      ))}
    </ul>
  );
}
