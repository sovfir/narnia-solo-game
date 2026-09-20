/** Экран броска S10: пошаговое раскрытие — кубики, сумма с навыком, результат. */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { Button } from '../components.tsx';
import { SKILL_NAMES } from '../../engine/types.ts';
import type { GameState } from '../../engine/engine.ts';

type Roll = NonNullable<GameState['lastRoll']>;

export function DiceOverlay(props: {
  roll: Roll;
  speed: 'normal' | 'fast';
  onClose: () => void;
}): JSX.Element {
  const { roll, speed } = props;
  const [phase, setPhase] = useState<'tumble' | 'sum' | 'result'>('tumble');
  const [faces, setFaces] = useState<[number, number]>([1, 1]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const tumbleMs = speed === 'fast' ? 220 : 1000;
    const sumMs = speed === 'fast' ? 120 : 650;
    const startedAt = Date.now();

    const spin = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= tumbleMs) {
        window.clearInterval(spin);
        setFaces(roll.dice);
        setPhase('sum');
        timers.current.push(window.setTimeout(() => setPhase('result'), sumMs));
      } else {
        setFaces([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
      }
    }, 70);

    return () => {
      window.clearInterval(spin);
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    };
  }, [roll, speed]);

  const dice = phase === 'tumble' ? faces : roll.dice;
  const skillNote = roll.skill ? SKILL_NAMES[roll.skill] : 'без навыка';

  return (
    <div class="overlay">
      <div class="overlay__panel dice-panel">
        <h3 class="overlay__title">Бросок кубиков</h3>
        <div class={`dice dice--${phase}`} aria-live="polite">
          <div class="dice__die">{dice[0]}</div>
          <div class="dice__die">{dice[1]}</div>
        </div>

        {phase !== 'tumble' && (
          <p class="dice-panel__line">
            {roll.dice[0]} + {roll.dice[1]} = <b>{roll.total}</b>
            {roll.skill ? `, ${skillNote} ${roll.skillValue >= 0 ? '+' : ''}${roll.skillValue}` : `, ${skillNote}`}
          </p>
        )}
        {phase === 'result' && (
          <p class="dice-panel__line dice-panel__result">
            Итог <b>{roll.result}</b> — переход выполнен
          </p>
        )}

        <Button kind={phase === 'result' ? 'primary' : 'ghost'} onClick={props.onClose}>
          {phase === 'result' ? 'Дальше' : 'Пропустить'}
        </Button>
      </div>
    </div>
  );
}
