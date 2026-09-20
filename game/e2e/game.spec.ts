import { expect, test } from '@playwright/test';

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
