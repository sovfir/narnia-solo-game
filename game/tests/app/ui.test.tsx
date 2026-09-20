// @vitest-environment happy-dom
/**
 * Проверка интерфейса: сплэш → меню → герой → игровой экран.
 * Тест идёт по настоящим кликам, как игрок.
 */

import { render } from 'preact';
import { beforeEach, describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { StoreContext } from '../../src/app/hooks.ts';
import { createStore, type AppStore, type StorageLike } from '../../src/app/store.ts';
import { App } from '../../src/ui/App.tsx';
import { createReadyHero } from '../../src/engine/hero.ts';
import { loadDiskContent } from '../support/content.ts';
import { rngForTotal, type GoldenStep } from '../support/solver.ts';

const content = loadDiskContent();

function fakeStorage(): StorageLike {
  const data: Record<string, string> = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: (key) => { delete data[key]; },
  };
}

const tick = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, 0); });

async function mount(store: AppStore): Promise<HTMLElement> {
  const root = document.createElement('div');
  document.body.appendChild(root);
  render(
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>,
    root,
  );
  await tick();                     // подписка на хранилище встаёт после отрисовки
  return root;
}

function buttonByText(root: HTMLElement, text: string): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')]
    .find((element) => (element.textContent ?? '').includes(text));
  if (!button) throw new Error(`кнопка «${text}» не найдена среди: ${[...root.querySelectorAll('button')].map((b) => b.textContent).join(' | ')}`);
  return button as HTMLButtonElement;
}

describe('интерфейс', () => {
  let root: HTMLElement;
  let store: AppStore;

  beforeEach(async () => {
    document.body.innerHTML = '';
    store = createStore({ content, storage: fakeStorage(), rng: () => 0.5, now: () => 1 });
    root = await mount(store);
  });

  it('показывает сплэш и уходит в меню по касанию', async () => {
    expect(root.textContent).toContain('Колдунья и Книга заклинаний');
    expect(root.textContent).toContain('Коснись экрана');

    root.querySelector('.screen--splash')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await tick();
    expect(root.textContent).toContain('Новая игра');
  });

  it('ведёт от меню через выбор героя и пролог в игровой экран', async () => {
    store.go('menu');
    await tick();
    await tick();
    buttonByText(root, 'Новая игра').click();
    await tick();
    expect(root.textContent).toContain('Выбор героя');

    buttonByText(root, 'Начать с Робин').click();
    await tick();
    await tick();

    // сначала книга: предисловие и пролог, партия ещё не начата
    expect(store.getSnapshot().state).toBeNull();
    expect(root.textContent).toContain('Предисловие');
    expect(root.textContent).toContain('София');

    // пролистываем до конца и выбираем развилку пролога
    buttonByText(root, 'Пропустить пролог').click();
    await tick();
    buttonByText(root, 'Я здесь впервые').click();
    await tick();
    await tick();

    expect(store.getSnapshot().state?.node).toBe(317);
    expect(root.textContent).toContain('Событие 317');
    expect(root.textContent).toContain('Дитя Адама и Евы');
  });

  it('для готового героя показывает предисловие, для своего — нет', async () => {
    const { createReadyHero, createCustomHero } = await import('../../src/engine/hero.ts');

    store.beginGame(createReadyHero());
    await tick();
    await tick();
    expect(root.textContent).toContain('Предисловие');

    store.beginGame(createCustomHero('Свой', { grip: 3, agility: 3 }));
    await tick();
    await tick();
    expect(root.textContent).toContain('Пролог');
    expect(root.textContent).toContain('Ужасные школьные дни');   // сразу пролог
    expect(root.textContent).not.toContain('София');              // предисловие пропущено
  });

  it('выбор кнопки меняет сцену, а статус-бар открывает лист персонажа', async () => {
    store.quickStart();
    await tick();
    await tick();
    const before = store.getSnapshot().state!.node;

    const actions = root.querySelectorAll('.actions button');
    expect(actions.length).toBeGreaterThan(0);
    (actions[0] as HTMLButtonElement).click();
    await tick();
    expect(store.getSnapshot().state!.node).not.toBe(before);

    buttonByText(root, 'Герой').click();
    await tick();
    expect(root.textContent).toContain('Лист персонажа');
    expect(root.textContent).toContain('Отметки путешествия');
  });

  it('показывает дневник решений', async () => {
    store.quickStart();
    await tick();
    await tick();
    const actions = root.querySelectorAll('.actions button');
    (actions[0] as HTMLButtonElement).click();
    await tick();

    buttonByText(root, 'Отметки').click();
    await tick();
    expect(root.textContent).toContain('Дневник решений');
    expect(root.textContent).toContain('Узлов пройдено');
  });

  it('доводит партию до финала и показывает галерею концовок', async () => {
    const fixture = JSON.parse(
      readFileSync(join(import.meta.dirname, '..', 'fixtures', 'golden-paths.json'), 'utf8'),
    ) as { paths: { ending: number; steps: GoldenStep[] }[] };
    const short = [...fixture.paths].sort((a, b) => a.steps.length - b.steps.length)[0]!;

    let rng: () => number = () => 0.5;
    const fastStore = createStore({ content, storage: fakeStorage(), rng: () => rng(), now: () => 1 });
    fastStore.newGame(createReadyHero());
    for (const step of short.steps) {
      switch (step.type) {
        case 'choose': fastStore.choose(step.index); break;
        case 'roll': rng = rngForTotal(step.total); fastStore.roll(); break;
        case 'forward': fastStore.openMap(); break;
        case 'enterSquare': fastStore.moveTo(step.id); break;
      }
    }

    const finalRoot = await mount(fastStore);
    expect(finalRoot.textContent).toContain('Итоги партии');
    expect(finalRoot.textContent).toContain('Узлов пройдено');

    buttonByText(finalRoot, 'Галерея концовок').click();
    await tick();
    expect(finalRoot.textContent).toContain('Галерея концовок');
    expect(finalRoot.textContent).toContain(`№${short.ending}`);
  });
});
