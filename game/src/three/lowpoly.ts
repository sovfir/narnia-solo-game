/**
 * Low-poly оформление карты: палитра по рельефу и детерминированные украшения.
 *
 * Всё строится из примитивов three.js — никаких бинарных ассетов.
 * Набор украшений для квадрата зависит только от его id и типа рельефа,
 * поэтому карта выглядит одинаково при каждом открытии.
 */

import type { SquareId } from '../engine/types.ts';

export type Terrain =
  | 'forest' | 'hills' | 'mountains' | 'river' | 'lake' | 'sea'
  | 'castle' | 'village' | 'marsh' | 'ruins' | 'snowfield' | 'clearing';

export interface TerrainEntry {
  id: SquareId;
  terrain: Terrain;
  features: string[];
  palette: string;
}

export interface TerrainPalette {
  /** Основа плитки. */
  ground: number;
  /** Более тёмный вариант для склонов и камней. */
  groundDark: number;
  /** Цвет растительности или постройки. */
  accent: number;
  /** Цвет воды, если она есть на квадрате. */
  water: number;
  /** Небо/дымка вокруг плитки. */
  fog: number;
}

/** Палитра low-poly: тёплые приглушённые тона, читаемые при дневном и «ночном» свете. */
export const TERRAIN_PALETTE: Record<Terrain, TerrainPalette> = {
  forest:    { ground: 0x4f7a3a, groundDark: 0x33512a, accent: 0x2f6b3a, water: 0x2f6f96, fog: 0xdfe6d6 },
  hills:     { ground: 0xb08a3f, groundDark: 0x8a6a2c, accent: 0x9a7a30, water: 0x2f6f96, fog: 0xefe4c8 },
  mountains: { ground: 0x8d8f96, groundDark: 0x5f626b, accent: 0xe8eef3, water: 0x2f6f96, fog: 0xe6eaf0 },
  river:     { ground: 0x6f8a4f, groundDark: 0x4e6a35, accent: 0x2f6f96, water: 0x1f6fa8, fog: 0xdfe9ea },
  lake:      { ground: 0x6f8a53, groundDark: 0x4f6a3c, accent: 0x1f6fa8, water: 0x1a5f96, fog: 0xdee9f0 },
  sea:       { ground: 0x7d8f96, groundDark: 0x566a72, accent: 0x1a5580, water: 0x144a70, fog: 0xdbe6ee },
  castle:    { ground: 0xb9c2cb, groundDark: 0x7d858e, accent: 0xf3f8fb, water: 0x2f6f96, fog: 0xeef3f8 },
  village:   { ground: 0x9aa35c, groundDark: 0x6f7740, accent: 0xc9723c, water: 0x2f6f96, fog: 0xf0e8c8 },
  marsh:     { ground: 0x63735a, groundDark: 0x44513e, accent: 0x8a9a72, water: 0x35544f, fog: 0xdde3d8 },
  ruins:     { ground: 0x9a927f, groundDark: 0x6b6455, accent: 0xc2b9a4, water: 0x2f6f96, fog: 0xe6e0d0 },
  snowfield: { ground: 0xe8f0f6, groundDark: 0xc3d0dc, accent: 0xffffff, water: 0x5f8fb0, fog: 0xf0f5f9 },
  clearing:  { ground: 0x9fb45e, groundDark: 0x7a8f3f, accent: 0xb8503f, water: 0x2f6f96, fog: 0xeaeed2 },
};

export type DecorationKind =
  | 'conifer' | 'broadleaf' | 'bush' | 'rock' | 'peak'
  | 'water' | 'reeds' | 'tower' | 'house' | 'obelisk' | 'lamp' | 'column';

export interface Decoration {
  kind: DecorationKind;
  /** Позиция внутри плитки: от -0.35 до 0.35. */
  x: number;
  z: number;
  scale: number;
  rotation: number;
}

/** Простой детерминированный ГПСЧ (mulberry32), заводится от id квадрата. */
function seedFromId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

function rngFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TERRAIN_DECORATIONS: Record<Terrain, readonly DecorationKind[]> = {
  forest: ['conifer', 'broadleaf', 'bush', 'rock'],
  hills: ['broadleaf', 'bush', 'rock', 'column'],
  mountains: ['peak', 'peak', 'rock'],
  river: ['water', 'reeds', 'broadleaf', 'rock'],
  lake: ['water', 'reeds', 'broadleaf'],
  sea: ['water', 'rock', 'reeds'],
  castle: ['tower', 'tower', 'house', 'rock'],
  village: ['house', 'house', 'bush', 'broadleaf'],
  marsh: ['water', 'reeds', 'reeds', 'bush'],
  ruins: ['obelisk', 'column', 'rock', 'bush'],
  snowfield: ['peak', 'rock', 'conifer'],
  clearing: ['broadleaf', 'bush', 'house'],
};

/**
 * Украшения квадрата: 3–7 предметов, детерминированно по id и рельефу.
 * Дополнительно учитывается подсказка из текста (features), чтобы на квадрате
 * с фонарным столбом появлялся именно столб.
 */
export function decorationsFor(entry: TerrainEntry): Decoration[] {
  const rng = rngFrom(seedFromId(entry.id));
  const kinds = TERRAIN_DECORATIONS[entry.terrain];
  const count = 3 + Math.floor(rng() * 4);
  const result: Decoration[] = [];

  const hints = entry.features.join(' ').toLowerCase();
  const hinted: DecorationKind[] = [];
  if (hints.includes('фонарн')) hinted.push('lamp');
  if (hints.includes('башн')) hinted.push('tower');
  if (hints.includes('дом') || hints.includes('улья') || hints.includes('домик')) hinted.push('house');
  if (hints.includes('стол') || hints.includes('обелиск')) hinted.push('obelisk');
  if (hints.includes('озер') || hints.includes('река') || hints.includes('ручей')) hinted.push('water');
  if (hints.includes('камыш') || hints.includes('тростник')) hinted.push('reeds');

  // центральное украшение — из подсказки текста, если она есть
  if (hinted.length > 0) {
    result.push({ kind: hinted[0]!, x: 0, z: 0, scale: 1.15, rotation: rng() * Math.PI * 2 });
  }

  for (let i = result.length; i < count; i += 1) {
    const kind = kinds[Math.floor(rng() * kinds.length)]!;
    const angle = rng() * Math.PI * 2;
    const radius = 0.12 + rng() * 0.16;   // держим внутри плитки
    result.push({
      kind,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      scale: 0.6 + rng() * 0.45,
      rotation: rng() * Math.PI * 2,
    });
  }
  return result;
}
