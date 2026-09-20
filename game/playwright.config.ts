import { defineConfig, devices } from '@playwright/test';

/**
 * E2E на собранном приложении: проверяем то, что не видно юнит-тестам —
 * загрузку контента, сохранения между перезагрузками и работу интерфейса на телефоне.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 40_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
