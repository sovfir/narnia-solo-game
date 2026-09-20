import { defineConfig, devices } from '@playwright/test';

/**
 * E2E на собранном приложении: проверяем то, что не видно юнит-тестам —
 * загрузку контента, сохранения между перезагрузками и работу интерфейса на телефоне.
 *
 * По умолчанию тесты идут против локальной сборки (`vite preview`).
 * Чтобы прогнать тот же набор против опубликованного сайта:
 *   E2E_BASE_URL=https://sovfir.github.io/narnia-solo-game/ npm run e2e
 */

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const remote = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: './e2e',
  timeout: 40_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 5'] } },
  ],
  // снаружи поднимать ничего не нужно: сайт уже опубликован
  webServer: remote
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
