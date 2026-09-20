import { expect, test, type Page } from '@playwright/test';

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

  await page.goto('/');
  await expect(page.getByText('Коснись экрана')).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: 'test-results/01-splash.png' });

  await page.locator('.screen--splash').click();
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
  await page.goto('/');
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
  await page.goto('/#node=160');
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
  await page.goto('/#node=160');
  await page.getByRole('button', { name: 'Герой' }).click();
  await page.getByRole('button', { name: 'Вернуться в игру' }).click();
  await page.goto('/');
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
  await page.goto('/#node=200');
  await expect(page.locator('.scene__node')).toHaveText('Событие 200');
  await expect(page.locator('.pager')).toBeVisible();
  await expect(page.getByText(/Страница 1 из/)).toBeVisible();
  await expect(page.locator('.actions')).toBeHidden();

  await page.getByRole('button', { name: 'Показать всё' }).click();
  await expect(page.locator('.actions')).toBeVisible();
  await expect(page.locator('.pager')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/09-long-scene.png' });
});
