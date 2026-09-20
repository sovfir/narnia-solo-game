import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [preact()],
  // Относительные пути: игра должна работать и с GitHub Pages, и из локальной папки.
  base: './',
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    // Бюджет §9: стартовый JS ≤ 150 КБ gzip. three.js подключается отдельным чанком позже.
    chunkSizeWarningLimit: 160,
    sourcemap: true,
  },
  server: { host: '127.0.0.1', port: 5173 },
});
