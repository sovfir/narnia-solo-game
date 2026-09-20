import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __NARNIA_MAP__?: {
      stats: () => { calls: number; triangles: number; fps: number };
      heroInfo: () => { visible: boolean; x: number; y: number; z: number };
      screenPositionOf: (id: string) => { x: number; y: number } | null;
      resetCamera: () => void;
    };
    __NARNIA_TITLE__?: {
      stats: () => { calls: number; triangles: number; fps: number };
      objectCount: () => number;
      screenPositionOf: (name: string) => { x: number; y: number } | null;
    };
  }
}

/**
 * Длинные сцены подаются постранично, поэтому перед выбором нужно
 * либо пролистать до конца, либо нажать «Показать всё».
 */
/** Пролог книги: листаем до развилки и выбираем «я здесь впервые». */
async function passPrologue(page: Page): Promise<void> {
  await expect(page.getByText('Предисловие').first()).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Пропустить пролог' }).click();
  await page.getByRole('button', { name: 'Я здесь впервые' }).click();
}

async function revealActions(page: Page): Promise<void> {
  const showAll = page.getByRole('button', { name: 'Показать всё' });
  if (await showAll.count() > 0) await showAll.click();
  for (let step = 0; step < 6; step += 1) {
    const next = page.getByRole('button', { name: 'Дальше ▸' });
    if (await next.count() === 0) break;
    await next.click();
  }
}

/** Полный путь игрока: сплэш → меню → герой → сцена → сохранение → продолжение. */

test('игра запускается, играет и продолжает партию после перезагрузки', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('./');
  await expect(page.getByText('Коснитесь экрана')).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: 'test-results/01-splash.png' });

  await page.locator('.screen--title').click();
  await expect(page.getByRole('button', { name: 'Новая игра' })).toBeVisible();

  await page.getByRole('button', { name: 'Новая игра' }).click();
  await expect(page.getByText('Выбор героя')).toBeVisible();
  await page.screenshot({ path: 'test-results/02-hero.png' });

  await page.getByRole('button', { name: 'Начать с Робин' }).click();
  await expect(page.getByText('София')).toBeVisible();          // предисловие героя
  await page.screenshot({ path: 'test-results/02b-preface.png' });
  await passPrologue(page);
  await expect(page.getByText('Событие 317')).toBeVisible();
  await expect(page.getByText('Дитя Адама и Евы')).toBeVisible();
  await page.screenshot({ path: 'test-results/03-scene.png' });

  // первый ход: выбираем первый вариант
  const actions = page.locator('.actions button');
  await expect(actions.first()).toBeVisible();
  await actions.first().click();
  const sceneAfter = await page.locator('.scene__node').textContent();
  expect(sceneAfter).not.toContain('Событие 317');
  await page.screenshot({ path: 'test-results/04-next-scene.png' });

  // лист персонажа: отметки и навыки
  await page.getByRole('button', { name: /Герой/ }).click();
  await expect(page.getByText('Лист персонажа')).toBeVisible();
  await expect(page.getByText('Отметки путешествия')).toBeVisible();
  await page.screenshot({ path: 'test-results/05-sheet.png' });
  await page.getByRole('button', { name: 'Вернуться в игру' }).click();

  const nodeBefore = await page.locator('.scene__node').textContent();

  // перезагрузка: партия должна восстановиться из автосохранения
  await page.reload();
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(page.locator('.scene__node')).toHaveText(nodeBefore ?? '');

  // сохранения: ручной слот и экспорт
  await page.getByRole('button', { name: 'Герой' }).click();
  await page.getByRole('button', { name: 'Вернуться в игру' }).click();
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Сохранения' })).toBeVisible();
  await page.getByRole('button', { name: 'Сохранения' }).click();
  await expect(page.getByText('Автосохранение')).toBeVisible();
  await expect(page.getByText('Слот 1')).toBeVisible();
  await page.screenshot({ path: 'test-results/06-saves.png' });

  expect(errors, `ошибки в консоли: ${errors.join(' | ')}`).toEqual([]);
});

test('экран броска и настройки работают', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  // ссылка на конкретный узел: 160 — бросок на Красноречие
  await page.goto('./#node=160');
  await expect(page.getByText('Событие 160')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Бросить кубики' }).click();
  const overlay = page.locator('.dice-panel');
  await expect(overlay).toBeVisible();
  await expect(overlay.getByText('Бросок кубиков')).toBeVisible();
  // анимация завершается, появляется итог и кнопка «Дальше»
  await expect(overlay.getByRole('button', { name: 'Дальше' })).toBeVisible({ timeout: 10_000 });
  await expect(overlay.getByText(/Итог/)).toBeVisible();
  await page.screenshot({ path: 'test-results/07-dice.png' });
  await overlay.getByRole('button', { name: 'Дальше' }).click();
  await expect(overlay).toHaveCount(0);
  await expect(page.locator('.scene__node')).not.toContainText('Событие 160');

  // настройки: быстрые кубики и ночная тема
  await page.goto('./#node=160');
  await page.getByRole('button', { name: 'Герой' }).click();
  await page.getByRole('button', { name: 'Вернуться в игру' }).click();
  await page.goto('./');
  await page.getByRole('button', { name: 'Настройки' }).click();
  await expect(page.getByText('Оформление')).toBeVisible();
  await page.getByRole('button', { name: 'Ночь' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.getByRole('button', { name: 'Быстро' }).click();
  await page.screenshot({ path: 'test-results/08-settings.png' });

  // настройки переживают перезагрузку
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

  expect(errors, `ошибки в консоли: ${errors.join(' | ')}`).toEqual([]);
});


test('длинная сцена читается постранично', async ({ page }) => {
  await page.goto('./#node=200');
  await expect(page.locator('.scene__node')).toHaveText('Событие 200');
  await expect(page.locator('.pager')).toBeVisible();
  await expect(page.getByText(/Страница 1 из/)).toBeVisible();
  await expect(page.locator('.actions')).toBeHidden();

  await page.getByRole('button', { name: 'Показать всё' }).click();
  await expect(page.locator('.actions')).toBeVisible();
  await expect(page.locator('.pager')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/09-long-scene.png' });
});


test('экран «О Нарнии» читается из меню', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByText('Коснитесь экрана')).toBeVisible({ timeout: 20_000 });
  await page.locator('.screen--title').click();        // сплэш → меню
  await page.getByRole('button', { name: 'О Нарнии' }).click();
  await expect(page.getByRole('button', { name: 'Основание Нарнии' })).toBeVisible();
  await page.getByRole('button', { name: 'Основание Нарнии' }).click();
  await expect(page.getByText('Нарния, Нарния, Нарния')).toBeVisible();
  await page.screenshot({ path: 'test-results/10-lore.png' });
  await page.getByRole('button', { name: 'Следующий раздел ▸' }).click();
  await expect(page.getByText('Аслан вызывает тебя')).toBeVisible();
});

test('карта в 3D: герой виден, доска целиком в кадре, тап ведёт в соседний квадрат', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('./#node=292');                       // узел говорит «ты в квадрате 6Б»
  await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true', null, { timeout: 20_000 });
  await revealActions(page);
  await page.getByRole('button', { name: 'Вперёд' }).click();

  await expect(page.locator('.map3d__canvas')).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => Boolean(window.__NARNIA_MAP__), null, { timeout: 20_000 });
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    const map = window.__NARNIA_MAP__!;
    const ids = ['1А','1Б','1В','1Г','2А','2Б','2В','2Г','3А','3Б','3В','3Г','4А','4Б','4В','4Г','5А','5Б','5В','5Г','6А','6Б','6В','6Г'];
    const rect = document.querySelector('.map3d__canvas')!.getBoundingClientRect();
    const outside = ids.filter((id) => {
      const point = map.screenPositionOf(id);
      return !point || point.x < rect.left + 4 || point.x > rect.right - 4
        || point.y < rect.top + 4 || point.y > rect.bottom - 4;
    });
    return { hero: map.heroInfo(), stats: map.stats(), outside, target: map.screenPositionOf('5Б') };
  });

  expect(info.hero.visible, 'фигурка героя должна быть на карте').toBe(true);
  expect(info.outside, 'все 24 квадрата должны попадать в кадр').toEqual([]);
  expect(info.stats.calls, 'бюджет §8.3 — не больше 40 draw calls').toBeLessThanOrEqual(40);
  expect(info.stats.fps, 'карта должна рисоваться плавно').toBeGreaterThanOrEqual(25);

  await page.screenshot({ path: 'test-results/11-map3d.png' });
  await page.mouse.click(info.target!.x, info.target!.y);
  await page.waitForTimeout(500);
  await expect(page.locator('.scene__node')).not.toHaveText('Событие 292');

  expect(errors, `ошибки в консоли: ${errors.join(' | ')}`).toEqual([]);
});

test('заглавный экран: сцена, подписи и переход в меню', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('./');
  await expect(page.getByText('Колдунья и Книга заклинаний')).toBeVisible();
  await expect(page.getByText('Анна Шрафф')).toBeVisible();
  await expect(page.getByText('перевод: Смелый Хвост')).toBeVisible();
  await expect(page.getByText('Коснитесь экрана')).toBeVisible();

  await page.waitForFunction(() => Boolean(window.__NARNIA_TITLE__), null, { timeout: 25_000 });
  await page.waitForTimeout(700);

  const scene = await page.evaluate(() => {
    const title = window.__NARNIA_TITLE__!;
    return {
      stats: title.stats(),
      objects: title.objectCount(),
      frame: {
        left: title.screenPositionOf('leftFrame'),
        right: title.screenPositionOf('rightFrame'),
        top: title.screenPositionOf('canopyTop'),
      },
    };
  });

  // композиция: стволы-рама по краям кадра, крона сверху — всё внутри кадра
  expect(scene.objects, 'сцена не должна быть пустой').toBeGreaterThan(20);
  expect(scene.frame.left!.x, 'левый ствол у левого края').toBeLessThan(-0.7);
  expect(scene.frame.right!.x, 'правый ствол у правого края').toBeGreaterThan(0.7);
  expect(Math.abs(scene.frame.top!.y), 'крона должна быть в кадре').toBeLessThan(1.15);
  expect(scene.stats.calls, 'бюджет заглавного экрана').toBeLessThanOrEqual(60);
  expect(scene.stats.fps, 'сцена должна анимироваться').toBeGreaterThanOrEqual(20);

  await page.screenshot({ path: 'test-results/12-title.png' });
  await page.locator('.screen--title').click();
  await expect(page.getByRole('button', { name: 'Новая игра' })).toBeVisible();
  expect(errors, `ошибки в консоли: ${errors.join(' | ')}`).toEqual([]);
});
