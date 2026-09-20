/**
 * Процедурные текстуры для живописной сцены.
 *
 * Рисуются на canvas при запуске: никаких бинарных ассетов, но поверхность
 * получает мазки, прожилки и пятна — то, чего не хватало плоским заливкам.
 * Все текстуры кешируются и освобождаются вместе со сценой.
 */

import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function makeCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('не удалось получить 2D-контекст для текстуры');
  return context;
}

function toTexture(context: CanvasRenderingContext2D, repeat: [number, number] = [1, 1]): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(context.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Мягкие «мазки»: сотни полупрозрачных пятен создают живописную неровность. */
function strokes(
  context: CanvasRenderingContext2D,
  options: {
    count: number;
    colors: string[];
    minSize: number;
    maxSize: number;
    alpha: number;
    horizontal?: boolean;
  },
): void {
  const { width, height } = context.canvas;
  for (let i = 0; i < options.count; i += 1) {
    const color = options.colors[Math.floor(Math.random() * options.colors.length)]!;
    const size = options.minSize + Math.random() * (options.maxSize - options.minSize);
    context.globalAlpha = options.alpha * (0.5 + Math.random() * 0.5);
    context.fillStyle = color;
    context.beginPath();
    const x = Math.random() * width;
    const y = Math.random() * height;
    if (options.horizontal) {
      context.ellipse(x, y, size, size * (0.25 + Math.random() * 0.35), 0, 0, Math.PI * 2);
    } else {
      context.ellipse(x, y, size * (0.3 + Math.random() * 0.3), size, 0, 0, Math.PI * 2);
    }
    context.fill();
  }
  context.globalAlpha = 1;
}

/** Кора: тёплая основа, вертикальные прожилки, тёмные борозды, светлые блики. */
export function barkTexture(): THREE.CanvasTexture {
  const cached = cache.get('bark');
  if (cached) return cached;

  const context = makeCanvas(256, 512);
  const gradient = context.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, '#7d3f18');
  gradient.addColorStop(0.45, '#c4762f');
  gradient.addColorStop(0.75, '#e0973f');
  gradient.addColorStop(1, '#8a4a1e');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 512);

  // прожилки вдоль ствола
  for (let i = 0; i < 90; i += 1) {
    context.globalAlpha = 0.12 + Math.random() * 0.22;
    context.strokeStyle = Math.random() > 0.5 ? '#5a2d10' : '#f0b264';
    context.lineWidth = 1 + Math.random() * 4;
    context.beginPath();
    const x = Math.random() * 256;
    context.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 32) {
      context.lineTo(x + Math.sin(y * 0.02 + i) * 5, y);
    }
    context.stroke();
  }
  context.globalAlpha = 1;
  strokes(context, { count: 120, colors: ['#5a2d10', '#e8a44f', '#93491c'], minSize: 6, maxSize: 26, alpha: 0.16 });

  const texture = toTexture(context, [2, 1]);
  cache.set('bark', texture);
  return texture;
}

/** Листва: тёмно-зелёная масса с холодными и тёплыми вкраплениями. */
export function foliageTexture(): THREE.CanvasTexture {
  const cached = cache.get('foliage');
  if (cached) return cached;

  const context = makeCanvas(256, 256);
  context.fillStyle = '#3f6b3a';
  context.fillRect(0, 0, 256, 256);
  strokes(context, {
    count: 900,
    colors: ['#2c4f2b', '#568c46', '#7fae5a', '#25452a', '#9cc06a', '#1f3a24'],
    minSize: 3,
    maxSize: 14,
    alpha: 0.5,
  });

  const texture = toTexture(context, [2, 2]);
  cache.set('foliage', texture);
  return texture;
}

/** Трава: зелёная с тёплыми пятнами света и тёмными провалами. */
export function grassTexture(): THREE.CanvasTexture {
  const cached = cache.get('grass');
  if (cached) return cached;

  const context = makeCanvas(512, 512);
  context.fillStyle = '#4d7040';
  context.fillRect(0, 0, 512, 512);
  strokes(context, {
    count: 1400,
    colors: ['#6f9048', '#3a5c3a', '#93ae5c', '#2c4a30', '#b0bd6d', '#365436'],
    minSize: 4,
    maxSize: 22,
    alpha: 0.4,
  });
  // редкие травинки
  for (let i = 0; i < 500; i += 1) {
    context.globalAlpha = 0.25 + Math.random() * 0.35;
    context.strokeStyle = Math.random() > 0.5 ? '#8fae54' : '#3a5a30';
    context.lineWidth = 1 + Math.random();
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (Math.random() - 0.5) * 8, y - 6 - Math.random() * 10);
    context.stroke();
  }
  context.globalAlpha = 1;

  const texture = toTexture(context, [10, 10]);
  cache.set('grass', texture);
  return texture;
}

/** Ткань плаща: красная с мягкими складками. */
export function clothTexture(): THREE.CanvasTexture {
  const cached = cache.get('cloth');
  if (cached) return cached;

  const context = makeCanvas(256, 256);
  context.fillStyle = '#c2211a';
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i += 1) {
    context.globalAlpha = 0.10 + Math.random() * 0.16;
    context.strokeStyle = Math.random() > 0.5 ? '#7d120e' : '#ef6a52';
    context.lineWidth = 2 + Math.random() * 10;
    context.beginPath();
    const x = Math.random() * 256;
    context.moveTo(x, 0);
    context.bezierCurveTo(x + 20, 80, x - 20, 170, x + 10, 256);
    context.stroke();
  }
  context.globalAlpha = 1;
  strokes(context, { count: 200, colors: ['#8f1610', '#e6472f'], minSize: 4, maxSize: 16, alpha: 0.14 });

  const texture = toTexture(context, [2, 2]);
  cache.set('cloth', texture);
  return texture;
}

/** Лист: мягкая форма с прожилкой и прозрачным фоном (для спрайтов ветра). */
export function leafTexture(): THREE.CanvasTexture {
  const cached = cache.get('leaf');
  if (cached) return cached;

  const context = makeCanvas(128, 128);
  context.clearRect(0, 0, 128, 128);
  const gradient = context.createLinearGradient(20, 10, 108, 118);
  gradient.addColorStop(0, '#f0c063');
  gradient.addColorStop(0.5, '#d98a2c');
  gradient.addColorStop(1, '#b04a1c');
  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(64, 6);
  context.bezierCurveTo(112, 40, 108, 96, 64, 122);
  context.bezierCurveTo(20, 96, 16, 40, 64, 6);
  context.fill();
  context.strokeStyle = 'rgba(120, 60, 20, 0.55)';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(64, 12);
  context.lineTo(64, 116);
  context.stroke();

  const texture = toTexture(context);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cache.set('leaf', texture);
  return texture;
}

/** Освобождает все сгенерированные текстуры (вызывается при размонтировании сцены). */
export function disposeTextures(): void {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
}

/** Мелкое зерно поверх всего: убирает «пластик» и даёт ощущение мазка. */
export function grainTexture(): THREE.CanvasTexture {
  const cached = cache.get('grain');
  if (cached) return cached;

  const context = makeCanvas(256, 256);
  context.fillStyle = '#808080';
  context.fillRect(0, 0, 256, 256);
  const image = context.getImageData(0, 0, 256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 128 + (Math.random() - 0.5) * 70;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
  }
  context.putImageData(image, 0, 0);

  const texture = toTexture(context, [8, 8]);
  cache.set('grain', texture);
  return texture;
}

/** Луч света: вертикальная полоса с рваными краями (для god rays). */
export function shaftTexture(): THREE.CanvasTexture {
  const cached = cache.get('shaft');
  if (cached) return cached;

  const context = makeCanvas(128, 512);
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, 'rgba(255, 240, 205, 0.55)');
  gradient.addColorStop(0.55, 'rgba(255, 236, 190, 0.22)');
  gradient.addColorStop(1, 'rgba(255, 236, 190, 0.0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 512);
  // рваные края: стираем мазками по бокам
  context.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 160; i += 1) {
    context.globalAlpha = 0.15 + Math.random() * 0.5;
    context.fillStyle = '#000';
    const y = Math.random() * 512;
    const width = 6 + Math.random() * 26;
    context.fillRect(0, y, width, 10 + Math.random() * 40);
    context.fillRect(128 - width, y, width, 10 + Math.random() * 40);
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';

  const texture = toTexture(context);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cache.set('shaft', texture);
  return texture;
}

/** Туман у земли: горизонтальная дымка с мягкими краями. */
export function mistTexture(): THREE.CanvasTexture {
  const cached = cache.get('mist');
  if (cached) return cached;

  const context = makeCanvas(512, 128);
  const gradient = context.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, 'rgba(226, 240, 238, 0)');
  gradient.addColorStop(0.45, 'rgba(226, 240, 238, 0.42)');
  gradient.addColorStop(1, 'rgba(226, 240, 238, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 220; i += 1) {
    context.globalAlpha = 0.05 + Math.random() * 0.12;
    context.fillStyle = '#ffffff';
    const x = Math.random() * 512;
    const y = Math.random() * 128;
    context.beginPath();
    context.ellipse(x, y, 30 + Math.random() * 70, 6 + Math.random() * 14, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const texture = toTexture(context, [2, 1]);
  cache.set('mist', texture);
  return texture;
}
