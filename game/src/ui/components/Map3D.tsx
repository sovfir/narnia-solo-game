/**
 * 3D-карта в интерфейсе: ленивая загрузка сцены, автофолбэк на 2D (§8.4).
 *
 * three.js подтягивается только когда карта реально открыта и есть WebGL,
 * поэтому стартовый бандл не растёт.
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';

import { Button } from '../components.tsx';
import { neighbours } from '../../engine/map.ts';
import type { SquareId } from '../../engine/types.ts';
import type { TerrainEntry } from '../../three/lowpoly.ts';
import type { MapScene, MapState } from '../../three/mapScene.ts';

type SceneHandle = Pick<MapScene, 'setState' | 'dispose' | 'resize'>;

export interface MapStats {
  calls: number;
  triangles: number;
  fps: number;
}

interface Map3DHandle {
  stats: () => MapStats;
  heroInfo: () => { visible: boolean; x: number; y: number; z: number };
  screenPositionOf: (id: SquareId) => { x: number; y: number } | null;
  resetCamera: () => void;
}

declare global {
  interface Window {
    __NARNIA_MAP__?: Map3DHandle;
  }
}

/** Дешёвая проверка WebGL без загрузки three. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function Map3D(props: {
  entries: TerrainEntry[];
  current: SquareId | null;
  reachable: SquareId[];
  visited: SquareId[];
  onPick: (id: SquareId) => void;
  onFail: () => void;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let scene: SceneHandle | null = null;

    (async () => {
      if (!hasWebGL()) {
        props.onFail();
        return;
      }
      const module = await import('../../three/mapScene.ts');
      if (disposed || !canvasRef.current) return;

      const instance = new module.MapScene(canvasRef.current, props.entries);
      instance.onPointerPick(props.onPick);
      const initial: MapState = { current: props.current, reachable: props.reachable, visited: props.visited };
      instance.setState(initial);
      instance.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      scene = instance;
      sceneRef.current = instance;
      setReady(true);

      window.__NARNIA_MAP__ = {
        stats: () => instance.stats,
        heroInfo: () => instance.heroInfo(),
        screenPositionOf: (id) => instance.screenPositionOf(id),
        resetCamera: () => instance.resetCamera(),
      };
    })().catch(() => props.onFail());

    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (canvas && sceneRef.current) sceneRef.current.resize(canvas.clientWidth, canvas.clientHeight);
    });
    if (canvasRef.current?.parentElement) observer.observe(canvasRef.current.parentElement);

    return () => {
      disposed = true;
      observer.disconnect();
      scene?.dispose();
      sceneRef.current = null;
      delete window.__NARNIA_MAP__;
    };
    // сцена создаётся один раз: состояние обновляется отдельным эффектом
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next: MapState = { current: props.current, reachable: props.reachable, visited: props.visited };
    sceneRef.current?.setState(next);
  }, [props.current, props.reachable.join(','), props.visited.join(',')]);

  return (
    <>
    <div class="map3d">
      <canvas ref={canvasRef} class="map3d__canvas" />
      {!ready && <p class="map3d__loading">Собираем карту…</p>}
    </div>
      <p class="map3d__hint">Перетаскивай, чтобы повернуть · щипок — зум · тап по квадрату — переход</p>
    </>
  );
}

/**
 * Обёртка: пробует 3D, при отсутствии WebGL или ошибке показывает прежнюю 2D-карту.
 * Состояние карты (текущий квадрат и доступные соседи) приходит из движка.
 */
export function MapOverlay(props: {
  current: SquareId | null;
  onPick: (id: SquareId) => void;
  onClose: () => void;
  visited: SquareId[];
  entries: TerrainEntry[];
  render2D: (props: { onPick: (id: SquareId) => void; onClose: () => void; current: SquareId | null }) => JSX.Element;
}): JSX.Element {
  const [mode, setMode] = useState<'3d' | '2d'>(() => (hasWebGL() ? '3d' : '2d'));
  const reachable = props.current ? neighbours(props.current) : props.entries.map((entry) => entry.id);

  return (
    <div class="overlay">
      <div class="overlay__panel overlay__panel--map">
        <h3 class="overlay__title">
          {mode === '3d' ? 'Карта' : 'Карта (упрощённый вид)'}
          {props.current ? ` · сейчас ${props.current}` : ''}
        </h3>

        {mode === '3d' ? (
          <Map3D
            entries={props.entries}
            current={props.current}
            reachable={reachable.filter((id) => id !== props.current)}
            visited={props.visited}
            onPick={props.onPick}
            onFail={() => setMode('2d')}
          />
        ) : (
          props.render2D({ onPick: props.onPick, onClose: props.onClose, current: props.current })
        )}

        <div class="overlay__actions">
          {mode === '3d' && (
            <Button kind="ghost" onClick={() => window.__NARNIA_MAP__?.resetCamera()}>Сбросить вид</Button>
          )}
          <Button onClick={props.onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}
