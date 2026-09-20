/**
 * Заглавный экран: 3D-сцена с ленивой загрузкой и текстовой шапкой.
 *
 * Если WebGL недоступен или сцена не поднялась — остаётся прежний статичный сплэш,
 * поэтому экран никогда не бывает пустым (§8.4).
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { useStore } from '../../app/hooks.ts';

export interface TitleHandle {
  stats: () => { calls: number; triangles: number; fps: number };
  objectCount: () => number;
  screenPositionOf: (name: string) => { x: number; y: number } | null;
}

declare global {
  interface Window {
    __NARNIA_TITLE__?: TitleHandle;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const AUTHOR = 'Анна Шрафф';
const TRANSLATOR = 'перевод: Смелый Хвост';
const SERIES = 'Narnia Solo Games™';

export function Splash3D(): JSX.Element {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let scene: { dispose: () => void; resize: (w: number, h: number) => void } | null = null;

    (async () => {
      if (!hasWebGL()) {
        setFailed(true);
        return;
      }
      const module = await import('../../three/titleScene.ts');
      if (disposed || !canvasRef.current) return;
      const instance = new module.TitleScene(canvasRef.current);
      scene = instance;
      setReady(true);
      window.__NARNIA_TITLE__ = {
        stats: () => instance.stats,
        objectCount: () => instance.objectCount,
        screenPositionOf: (name) => instance.screenPositionOf(name),
      };

      const observer = new ResizeObserver(() => {
        if (canvasRef.current) instance.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      });
      if (canvasRef.current.parentElement) observer.observe(canvasRef.current.parentElement);
      (instance as unknown as { __observer?: ResizeObserver }).__observer = observer;
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      const withObserver = scene as unknown as { __observer?: ResizeObserver } | null;
      withObserver?.__observer?.disconnect();
      scene?.dispose();
      delete window.__NARNIA_TITLE__;
    };
  }, []);

  return (
    <main
      class={`screen screen--title ${ready ? 'screen--title-ready' : ''}`}
      onClick={() => store.go('menu')}
      onTouchStart={() => store.go('menu')}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') store.go('menu'); }}
    >
      <div class="title__stage">
        <canvas ref={canvasRef} class="title__canvas" aria-hidden="true" />
        {!ready && !failed && <div class="title__loading">Собираем Нарнию…</div>}
      </div>

      <div class="title__overlay">
        <header class="title__head">
          <h1 class="title__name">Колдунья и Книга заклинаний</h1>
          <p class="title__author">{AUTHOR}</p>
          <p class="title__meta">{TRANSLATOR} · {SERIES}</p>
        </header>
        <p class="title__hint">Коснитесь экрана</p>
      </div>
    </main>
  );
}
