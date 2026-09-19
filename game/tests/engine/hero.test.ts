import { describe, expect, it } from 'vitest';

import {
  READY_HERO_NAME, createCustomHero, createReadyHero, skillValue, validateDistribution,
} from '../../src/engine/hero.ts';
import { SKILLS } from '../../src/engine/types.ts';

describe('герой', () => {
  it('готовый герой: все навыки +1', () => {
    const hero = createReadyHero();
    expect(hero.name).toBe(READY_HERO_NAME);
    for (const skill of SKILLS) expect(hero.skills[skill]).toBe(1);
  });

  it('свой герой: сумма уровней 6, навык без уровня — −2', () => {
    const hero = createCustomHero('Тест', { grip: 3, agility: 3 });
    expect(hero.skills.grip).toBe(3);
    expect(hero.skills.agility).toBe(3);
    expect(hero.skills.energy).toBe(-2);
  });

  it('отвергает неверное распределение', () => {
    expect(validateDistribution({ grip: 4, agility: 2 })).toMatchObject({ ok: false });
    expect(validateDistribution({ grip: 3, agility: 2 })).toMatchObject({ ok: false });
    expect(validateDistribution({ grip: 3, agility: 3 })).toEqual({ ok: true });
    expect(() => createCustomHero('Тест', { grip: 5, agility: 1 })).toThrow(/неверно/);
  });

  it('проверка без навыка не добавляет модификатор', () => {
    expect(skillValue(createReadyHero(), null)).toBe(0);
    expect(skillValue(createReadyHero(), 'grip')).toBe(1);
  });
});
