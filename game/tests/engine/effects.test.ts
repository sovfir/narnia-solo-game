import { describe, expect, it } from 'vitest';

import { applyEffects, parseCharges, spendTempMods, tempBonus } from '../../src/engine/effects.ts';
import { createReadyHero } from '../../src/engine/hero.ts';

const base = () => ({
  hero: createReadyHero(),
  marks: [] as number[],
  tempMods: [],
  items: {},
  node: 100,
  now: 0,
});

describe('эффекты', () => {
  it('ставит и стирает отметки, не дублируя', () => {
    const once = applyEffects(base(), [{ type: 'set-mark', id: 6 }]);
    expect(once.marks).toEqual([6]);
    const twice = applyEffects({ ...base(), marks: once.marks }, [{ type: 'set-mark', id: 6 }]);
    expect(twice.marks).toEqual([6]);
    const cleared = applyEffects({ ...base(), marks: once.marks }, [{ type: 'clear-mark', id: 6 }]);
    expect(cleared.marks).toEqual([]);
  });

  it('меняет навык насовсем', () => {
    const result = applyEffects(base(), [{ type: 'skill', skill: 'inner', delta: 2 }]);
    expect(result.hero.skills.inner).toBe(3);
    expect(result.notes[0]?.text).toContain('Внутренняя сила +2');
  });

  it('разбирает число применений из текста правила', () => {
    expect(parseCharges('Вычитай 1 из своей Энергии следующие два раза, когда будешь её использовать.'))
      .toBe(2);
    expect(parseCharges('Вычти 1 из своей Энергии, когда она тебе понадобится в следующий раз.')).toBe(1);
    expect(parseCharges('Вычти 1 из своей Энергии следующие три раза, как придётся ею воспользоваться.'))
      .toBe(3);
    expect(parseCharges('До тех пор, пока ты не поешь, вычитай 1 из своей Энергии.')).toBeNull();
  });

  it('тратит заряды временных модификаторов', () => {
    const applied = applyEffects(base(), [{
      type: 'deprive', skill: 'energy', delta: -1,
      source: 'Вычитай 1 из своей Энергии следующие два раза.',
    }]);
    expect(tempBonus(applied.tempMods, 'energy')).toBe(-1);

    const afterFirst = spendTempMods(applied.tempMods, 'energy');
    expect(afterFirst[0]?.chargesLeft).toBe(1);
    const afterSecond = spendTempMods(afterFirst, 'energy');
    expect(afterSecond).toHaveLength(0);
  });

  it('бессрочный модификатор не тратится', () => {
    const applied = applyEffects(base(), [{
      type: 'deprive', skill: 'energy', delta: -1,
      source: 'До тех пор, пока ты не поешь, вычитай 1 из своей Энергии.',
    }]);
    const spent = spendTempMods(applied.tempMods, 'energy');
    expect(spent).toHaveLength(1);
    expect(spent[0]?.chargesLeft).toBeNull();
  });
});
