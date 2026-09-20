import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    preact(),
    // Офлайн-режим (§9): оболочка и контент кладутся в precache.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Колдунья и Книга заклинаний',
        short_name: 'Книга заклинаний',
        description: 'Игра-книга по Нарнии: выборы, кубики, отметки и карта 6×4',
        lang: 'ru',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1b1410',
        theme_color: '#1b1410',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Контент (nodes.json, squares.json) попадает в precache — игра работает без сети.
        globPatterns: ['**/*.{js,css,html,json,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  // Относительные пути: игра работает и с GitHub Pages, и из локальной папки.
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
    // Бюджет §9: стартовый JS ≤ 150 КБ gzip. Контент — отдельным чанком, three.js — позже.
    chunkSizeWarningLimit: 160,
    sourcemap: true,
  },
  server: { host: '127.0.0.1', port: 5173 },
});
