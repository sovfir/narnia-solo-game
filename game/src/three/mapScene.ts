/**
 * 3D-карта: low-poly диорама 6×4 из процедурной геометрии three.js.
 *
 * Модуль грузится лениво (отдельный чанк), поэтому three не попадает в стартовый бандл.
 * Держим бюджет §8.3: 24 плитки одним InstancedMesh, украшения — по одному InstancedMesh
 * на вид, подсветка — две рамки. Итого ~20 draw calls вместо 40.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import type { SquareId } from '../engine/types.ts';
import {
  TERRAIN_PALETTE, decorationsFor,
  type Decoration, type DecorationKind, type TerrainEntry,
} from './lowpoly.ts';

export interface MapState {
  current: SquareId | null;
  reachable: SquareId[];
  visited: SquareId[];
}

export interface MapStats {
  calls: number;
  triangles: number;
  fps: number;
}

export const ROWS = ['А', 'Б', 'В', 'Г'] as const;
export const COLS = [1, 2, 3, 4, 5, 6] as const;

const TILE = 1;
const GAP = 0.16;                      // зазор читается как линия сетки
const STEP = TILE + GAP;
const REACHABLE_TINT = new THREE.Color(0xd9f5b0);   // подсветка доступных квадратов

/** Проверка поддержки WebGL: если нет — показываем 2D-карту (§8.4). */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') ?? canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/** Геометрия одного украшения — маленькие низкополигональные фигурки. */
function geometryFor(kind: DecorationKind): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const add = (geometry: THREE.BufferGeometry, x = 0, y = 0, z = 0): void => {
    geometry.translate(x, y, z);
    parts.push(geometry);
  };

  switch (kind) {
    case 'conifer':
      add(new THREE.ConeGeometry(0.16, 0.44, 6), 0, 0.22, 0);
      add(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 5), 0, 0.05, 0);
      break;
    case 'broadleaf':
      add(new THREE.IcosahedronGeometry(0.16, 0), 0, 0.28, 0);
      add(new THREE.CylinderGeometry(0.035, 0.045, 0.24, 5), 0, 0.12, 0);
      break;
    case 'bush':
      add(new THREE.IcosahedronGeometry(0.1, 0), 0, 0.08, 0);
      break;
    case 'rock':
      add(new THREE.DodecahedronGeometry(0.11, 0), 0, 0.07, 0);
      break;
    case 'peak':
      add(new THREE.ConeGeometry(0.2, 0.5, 5), 0, 0.25, 0);
      break;
    case 'reeds':
      for (let i = 0; i < 3; i += 1) {
        add(new THREE.CylinderGeometry(0.008, 0.012, 0.22, 4), (i - 1) * 0.05, 0.11, (i % 2) * 0.04);
      }
      break;
    case 'tower':
      add(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 6), 0, 0.21, 0);
      add(new THREE.ConeGeometry(0.13, 0.16, 6), 0, 0.5, 0);
      break;
    case 'house':
      add(new THREE.BoxGeometry(0.22, 0.16, 0.2), 0, 0.08, 0);
      add(new THREE.ConeGeometry(0.18, 0.12, 4), 0, 0.22, 0);
      break;
    case 'obelisk':
      add(new THREE.BoxGeometry(0.07, 0.34, 0.07), 0, 0.17, 0);
      break;
    case 'column':
      add(new THREE.CylinderGeometry(0.05, 0.06, 0.26, 6), 0, 0.13, 0);
      add(new THREE.BoxGeometry(0.14, 0.03, 0.14), 0, 0.27, 0);
      break;
    case 'lamp':
      add(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 6), 0, 0.25, 0);
      add(new THREE.IcosahedronGeometry(0.07, 0), 0, 0.54, 0);
      break;
    case 'water':
      add(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 10), 0, 0.02, 0);
      break;
  }

  // часть примитивов three индексированная, часть нет — приводим к одному виду перед слиянием
  const merged = mergeGeometries(parts.map((part) => part.toNonIndexed()), false);
  for (const part of parts) part.dispose();
  return merged ?? new THREE.BufferGeometry();
}

export class MapScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly raycaster = new THREE.Raycaster();
  private readonly clock = new THREE.Clock();
  private readonly tiles: THREE.InstancedMesh;
  private readonly highlightCurrent: THREE.Mesh;
  private readonly hero: THREE.Group;
  private readonly positions = new Map<SquareId, THREE.Vector3>();
  private readonly order: SquareId[] = [];
  private readonly disposables: { dispose(): void }[] = [];
  private frame = 0;
  private yaw = Math.PI * 0.18;
  private zoom = 1;
  private dragging = false;
  private lastPointer = { x: 0, y: 0 };
  private fpsAccum = 0;
  private fpsFrames = 0;
  private fps = 0;
  private onPick: ((id: SquareId) => void) | null = null;
  private state: MapState | null = null;
  private lastPulse = 0;
  private pinchDistance = 0;
  private pointerDownAt: { x: number; y: number } | null = null;

  private readonly entryCache = new Map<SquareId, TerrainEntry>();

  constructor(private readonly canvas: HTMLCanvasElement, entries: readonly TerrainEntry[]) {
    for (const entry of entries) this.entryCache.set(entry.id, entry);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene.background = new THREE.Color(0xe9e2d2);
    this.scene.fog = new THREE.Fog(0xe9e2d2, 12, 26);

    const width = COLS.length * STEP;
    const depth = ROWS.length * STEP;
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    const viewSize = Math.max(depth * 1.5, width / Math.max(aspect, 0.5)) ;
    this.camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2, (viewSize * aspect) / 2,
      viewSize / 2, -viewSize / 2, 0.1, 100,
    );

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xfff3dd, 1.5);
    sun.position.set(6, 10, 4);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfd4ff, 0.5);
    fill.position.set(-6, 6, -5);
    this.scene.add(fill);

    // основание под доской
    const baseGeometry = new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x3f352a });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set((width - STEP) / 2, -0.24, (depth - STEP) / 2);
    this.scene.add(base);
    this.disposables.push(baseGeometry, baseMaterial);

    // плитки: одна геометрия, 24 экземпляра, цвет — из палитры рельефа
    const tileGeometry = new THREE.BoxGeometry(TILE, 0.16, TILE);
    const tileMaterial = new THREE.MeshLambertMaterial({ flatShading: true });
    this.tiles = new THREE.InstancedMesh(tileGeometry, tileMaterial, entries.length);
    this.tiles.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    this.disposables.push(tileGeometry, tileMaterial);

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    entries.forEach((entry, index) => {
      const col = COLS.indexOf(Number(entry.id.slice(0, -1)) as (typeof COLS)[number]);
      const row = ROWS.indexOf(entry.id.slice(-1) as (typeof ROWS)[number]);
      const position = new THREE.Vector3(col * STEP, 0, row * STEP);
      const height = entry.terrain === 'mountains' ? 0.3 : entry.terrain === 'hills' ? 0.2 : 0.16;
      matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(1, height / 0.16, 1));
      this.tiles.setMatrixAt(index, matrix);
      const checker = (col + row) % 2 === 0 ? 1 : 0.93;      // лёгкая шахматка помогает считать клетки
      this.tiles.setColorAt(index, color.setHex(TERRAIN_PALETTE[entry.terrain].ground).multiplyScalar(checker));
      this.positions.set(entry.id, position);
      this.order.push(entry.id);
    });
    this.tiles.instanceMatrix.needsUpdate = true;
    if (this.tiles.instanceColor) this.tiles.instanceColor.needsUpdate = true;
    this.scene.add(this.tiles);

    // украшения: считаем один раз, затем по одному InstancedMesh на вид
    const withOwner = entries.flatMap((entry) =>
      decorationsFor(entry).map((decoration) => ({ ownerId: entry.id, decoration })));
    const byKind = new Map<DecorationKind, typeof withOwner>();
    for (const item of withOwner) {
      const list = byKind.get(item.decoration.kind);
      if (list) list.push(item);
      else byKind.set(item.decoration.kind, [item]);
    }

    for (const [kind, items] of byKind) {
      const geometry = geometryFor(kind);
      const material = new THREE.MeshLambertMaterial({ flatShading: true });
      const mesh = new THREE.InstancedMesh(geometry, material, items.length);
      items.forEach(({ ownerId, decoration }, index) => {
        const center = this.positions.get(ownerId)!;
        const palette = TERRAIN_PALETTE[this.entryCache.get(ownerId)!.terrain];
        const isWater = kind === 'water';
        const position = new THREE.Vector3(
          center.x + decoration.x * TILE * 0.9,
          isWater ? 0.085 : 0.08,
          center.z + decoration.z * TILE * 0.9,
        );
        matrix.compose(
          position,
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, decoration.rotation, 0)),
          new THREE.Vector3(decoration.scale, decoration.scale, decoration.scale),
        );
        mesh.setMatrixAt(index, matrix);
        const tint = isWater ? palette.water
          : kind === 'reeds' ? palette.accent
            : kind === 'house' || kind === 'tower' || kind === 'lamp' || kind === 'peak' ? palette.accent
              : kind === 'rock' || kind === 'column' || kind === 'obelisk' ? palette.groundDark
                : palette.accent;
        mesh.setColorAt(index, color.setHex(tint).offsetHSL(0, 0.04, 0.1));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.scene.add(mesh);
      this.disposables.push(geometry, material);
    }

    // подсветка текущего квадрата и доступных соседей
    this.highlightCurrent = this.createFrame(0xffd27f);
    this.scene.add(this.highlightCurrent);

    // фигурка героя: сразу видно, где ты стоишь
    this.hero = new THREE.Group();
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xd23f27, flatShading: true, emissive: 0x3a0f08 });
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xf0d6b8, flatShading: true });
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.38, 8), bodyMaterial);
    body.position.y = 0.19;
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.095, 0), headMaterial);
    head.position.y = 0.46;
    // белый контур: фигурка читается на любом рельефе
    const outline = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.24, 0.035, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    outline.position.y = 0.03;
    // мягкая тень под героем
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0x1b1410, transparent: true, opacity: 0.35 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd27f, transparent: true, opacity: 0.85 }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.01;
    this.hero.add(shadow, disc, outline, body, head);
    this.hero.scale.setScalar(1.3);
    this.hero.visible = false;
    this.scene.add(this.hero);
    this.disposables.push(
      bodyMaterial, headMaterial,
      body.geometry, head.geometry, disc.geometry, outline.geometry, shadow.geometry,
      outline.material as THREE.Material, shadow.material as THREE.Material,
    );

    this.bindPointer();
    this.resetCamera();
    this.animate();
  }

  /** Тонкая рамка-подсветка вокруг плитки. */
  private createFrame(color: number): THREE.Mesh {
    const size = TILE * 0.98;
    const thickness = 0.05;
    const parts: THREE.BufferGeometry[] = [];
    const bar = (w: number, d: number, x: number, z: number): void => {
      const geometry = new THREE.BoxGeometry(w, 0.04, d);
      geometry.translate(x, 0, z);
      parts.push(geometry);
    };
    bar(size, thickness, 0, size / 2);
    bar(size, thickness, 0, -size / 2);
    bar(thickness, size, -size / 2, 0);
    bar(thickness, size, size / 2, 0);
    const geometry = mergeGeometries(parts.map((part) => part.toNonIndexed()), false)
      ?? new THREE.BufferGeometry();
    for (const part of parts) part.dispose();
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    this.disposables.push(geometry, material);
    return mesh;
  }

  setState(state: MapState): void {
    this.state = state;
    const current = state.current ? this.positions.get(state.current) : undefined;
    if (current) {
      this.highlightCurrent.position.set(current.x, 0.12, current.z);
      this.highlightCurrent.visible = true;
      this.hero.position.set(current.x, 0.12, current.z);
      this.hero.visible = true;
    } else {
      this.highlightCurrent.visible = false;
      this.hero.visible = false;
    }
    this.refreshTileColors(0);
  }

  /** Цвет плитки: доступные для перехода подсвечены, посещённые чуть приглушены. */
  private refreshTileColors(pulse: number): void {
    const state = this.state;
    if (!state) return;
    const color = new THREE.Color();
    this.order.forEach((id, index) => {
      const entry = this.entryCache.get(id);
      const base = entry ? TERRAIN_PALETTE[entry.terrain].ground : 0x888888;
      const hex = base;
      if (state.reachable.includes(id)) {
        // мягкая пульсация: подсвечиваем соседей, чтобы было видно, куда идти
        const c = color.clone().setHex(base).lerp(REACHABLE_TINT, 0.45 + pulse * 0.25);
        this.tiles.setColorAt(index, c);
        return;
      }
      if (!state.visited.includes(id)) {
        const c = color.setHex(hex).clone();
        c.offsetHSL(0, -0.05, -0.12);            // непосещённые — глуше, сетка читается
        this.tiles.setColorAt(index, c);
        return;
      }
      this.tiles.setColorAt(index, color.setHex(hex));
    });
    if (this.tiles.instanceColor) this.tiles.instanceColor.needsUpdate = true;
  }

  onPointerPick(handler: (id: SquareId) => void): void {
    this.onPick = handler;
  }

  private bindPointer(): void {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      this.pointerDownAt = { x: event.clientX, y: event.clientY };
      this.lastPointer = { x: event.clientX, y: event.clientY };
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastPointer.x;
      this.yaw += dx * 0.005;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.updateCamera();
    });
    const release = (event: PointerEvent): void => {
      const started = this.pointerDownAt;
      this.dragging = false;
      if (!started || !this.onPick) return;
      const moved = Math.hypot(event.clientX - started.x, event.clientY - started.y);
      if (moved > 6) return;                       // это было перетаскивание, а не тап
      const id = this.pickAt(event.clientX, event.clientY);
      if (id) this.onPick(id);
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', () => { this.dragging = false; });
    // щипок: две точки — меняем зум
    const active = new Map<number, { x: number; y: number }>();
    this.canvas.addEventListener('pointerdown', (event) => { active.set(event.pointerId, { x: event.clientX, y: event.clientY }); });
    this.canvas.addEventListener('pointerup', (event) => { active.delete(event.pointerId); });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!active.has(event.pointerId)) return;
      active.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (active.size !== 2) return;
      const [a, b] = [...active.values()];
      const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (this.pinchDistance) {
        this.zoom = THREE.MathUtils.clamp(this.zoom * (distance / this.pinchDistance), 0.6, 2.2);
        this.updateCamera();
      }
      this.pinchDistance = distance;
    });
    this.canvas.addEventListener('pointerup', () => { this.pinchDistance = 0; });
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.zoom = THREE.MathUtils.clamp(this.zoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.6, 2.2);
      this.updateCamera();
    }, { passive: false });
  }

  /** Экранные координаты квадрата — нужно тестам и подсказкам. */
  screenPositionOf(id: SquareId): { x: number; y: number } | null {
    const position = this.positions.get(id);
    if (!position) return null;
    const projected = position.clone().project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: rect.left + ((projected.x + 1) / 2) * rect.width,
      y: rect.top + ((1 - projected.y) / 2) * rect.height,
    };
  }

  private pickAt(clientX: number, clientY: number): SquareId | null {
    const rect = this.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.tiles, false)[0];
    if (!hit || hit.instanceId === undefined) return null;
    return this.order[hit.instanceId] ?? null;
  }

  resetCamera(): void {
    this.yaw = Math.PI * 0.18;
    this.zoom = 1;
    this.updateCamera();
  }

  private updateCamera(): void {
    const width = COLS.length * STEP;
    const depth = ROWS.length * STEP;
    const center = new THREE.Vector3((width - STEP) / 2, 0, (depth - STEP) / 2);
    const distance = 16;
    const elevation = 1.34;                  // почти вид сверху: сетка читается как доска
    this.camera.position.set(
      center.x + Math.sin(this.yaw) * Math.cos(elevation) * distance,
      center.y + Math.sin(elevation) * distance,
      center.z + Math.cos(this.yaw) * Math.cos(elevation) * distance,
    );
    this.camera.lookAt(center);
    this.camera.zoom = this.zoom;
    this.camera.updateProjectionMatrix();
  }

  resize(width: number, height: number): void {
    const aspect = width / Math.max(1, height);
    const boardWidth = COLS.length * STEP;
    const boardDepth = ROWS.length * STEP;
    // запас и учёт наклона: доска должна целиком попадать в кадр на телефоне
    const viewSize = Math.max(boardDepth * 1.7, (boardWidth / Math.max(aspect, 0.6)) * 1.25);
    this.camera.left = (-viewSize * aspect) / 2;
    this.camera.right = (viewSize * aspect) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private animate = (): void => {
    this.frame = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    if (document.hidden) return;                   // не рендерим в фоне

    const pulse = 0.5 + 0.5 * Math.sin(this.clock.elapsedTime * 2.5);
    (this.highlightCurrent.material as THREE.MeshBasicMaterial).opacity = 0.65 + 0.3 * pulse;
    if (this.clock.elapsedTime - this.lastPulse > 0.1) {
      this.lastPulse = this.clock.elapsedTime;
      this.refreshTileColors(pulse);
    }

    if (this.hero.visible) this.hero.position.y = 0.12 + Math.sin(this.clock.elapsedTime * 2) * 0.025;

    this.renderer.render(this.scene, this.camera);

    this.fpsAccum += delta;
    this.fpsFrames += 1;
    if (this.fpsAccum >= 0.5) {
      this.fps = Math.round(this.fpsFrames / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
  };

  /** Положение и видимость фигурки — для автотестов. */
  heroInfo(): { visible: boolean; x: number; y: number; z: number } {
    return { visible: this.hero.visible, x: this.hero.position.x, y: this.hero.position.y, z: this.hero.position.z };
  }

  get stats(): MapStats {
    return {
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      fps: this.fps,
    };
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    for (const item of this.disposables) item.dispose();
    this.scene.clear();
    this.renderer.dispose();
  }
}
