/**
 * Заглавный экран: живописная сцена по референсу `pics/title_screen_reference.jpg`.
 *
 * Стиль: сглаженные органические формы (без жёсткого low-poly), процедурные текстуры
 * (кора, листва, трава, ткань, листья), мягкие тени и тёплый контровой свет на
 * холодном туманном фоне — то, что даёт «нарисованность» референса.
 *
 * Композиция (стволы-рама, кроны, ближняя ветка) выравнивается по фактической
 * проекции камеры, поэтому держится на любом экране телефона.
 *
 * Анимация: Аслан дышит, поворачивает голову, шевелит ушами и хвостом;
 * ветер гонит листья, качает листву и полощет плащ путника.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import {
  barkTexture, clothTexture, disposeTextures, foliageTexture, grassTexture,
  grainTexture, leafTexture, mistTexture, shaftTexture,
} from './textures.ts';

export interface TitleStats {
  calls: number;
  triangles: number;
  fps: number;
}

const PALETTE = {
  sky: 0xbfe4e2,
  fog: 0x9fd2cc,
  bark: 0xffffff,
  barkFar: 0x9fc4cc,
  foliage: 0xeef4e2,
  foliageFar: 0xdcecea,
  grass: 0xdfe6cf,
  lionBody: 0xf2bb63,
  lionBodyDark: 0xd79a3f,
  lionMane: 0xd07f28,
  lionManeLight: 0xf6cc7f,
  muzzle: 0xfaf0dc,
  face: 0x2c1a12,
  cloth: 0xffffff,
  clothDark: 0x8f1610,
} as const;

const FOV = 42;
const CAMERA_HEIGHT = 1.45;
const LOOK_AT_HEIGHT = 1.0;

interface Piece {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/** Полуразмеры видимой области на глубине — для точной постановки рамы в кадр. */
function halfExtents(aspect: number, depth: number): { width: number; height: number } {
  const distance = Math.hypot(depth + 7.4, CAMERA_HEIGHT - LOOK_AT_HEIGHT);
  const height = Math.tan((FOV / 2) * (Math.PI / 180)) * distance;
  return { width: height * aspect, height };
}

/** Склеивает примитивы в одну геометрию: меньше вызовов отрисовки. */
function mergePieces(pieces: Piece[]): THREE.BufferGeometry {
  const prepared = pieces.map((piece) => {
    const geometry = piece.geometry.clone();
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...(piece.position ?? [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(piece.rotation ?? [0, 0, 0]))),
      new THREE.Vector3(...(piece.scale ?? [1, 1, 1])),
    ));
    return geometry.index ? geometry.toNonIndexed() : geometry;
  });
  const merged = mergeGeometries(prepared, false) ?? new THREE.BufferGeometry();
  for (const geometry of prepared) geometry.dispose();
  for (const piece of pieces) piece.geometry.dispose();
  return merged;
}

function organicMaterial(options: {
  color: number;
  map: THREE.Texture;
  roughness?: number;
}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    map: options.map,
    roughness: options.roughness ?? 0.92,
    metalness: 0,
  });
}

/** Ствол: тело вращения с расширением у корней и лёгким изгибом. */
function buildTrunk(height: number, radius: number, material: THREE.Material): THREE.Mesh {
  const profile: THREE.Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const flare = 1 + Math.pow(1 - t, 3) * 1.35;              // корневая «юбка»
    const taper = 1 - t * 0.42;                                // ствол сужается кверху
    const wobble = 1 + Math.sin(t * Math.PI * 3) * 0.035;      // живая неровность
    profile.push(new THREE.Vector2(radius * taper * flare * wobble, t * height));
  }
  const geometry = new THREE.LatheGeometry(profile, 20);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

/** Крона: облако из мягких сфер — силуэт живой, а не шар. */
function buildCanopy(radius: number, material: THREE.Material, seed: number): THREE.Mesh {
  const pieces: Piece[] = [];
  let value = seed;
  const random = (): number => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
  for (let i = 0; i < 6; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = random() * radius * 0.55;
    const size = radius * (0.42 + random() * 0.3);
    pieces.push({
      geometry: new THREE.SphereGeometry(size, 9, 6),
      position: [Math.cos(angle) * distance, (random() - 0.35) * radius * 0.45, Math.sin(angle) * distance],
      scale: [1.05, 0.85 + random() * 0.25, 1.05],
    });
  }
  return new THREE.Mesh(mergePieces(pieces), material);
}

/** Лев: мягкие объёмы вместо граней. */
function buildLion(): {
  group: THREE.Group;
  head: THREE.Group;
  tail: THREE.Group[];
  ears: THREE.Object3D[];
  chest: THREE.Object3D;
} {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.lionBody, roughness: 0.85, metalness: 0 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.lionBodyDark, roughness: 0.9, metalness: 0 });
  const maneMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.lionMane, roughness: 0.95, metalness: 0 });
  const maneLightMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.lionManeLight, roughness: 0.95, metalness: 0 });
  const muzzleMaterial = new THREE.MeshStandardMaterial({ color: 0xcf9a63, roughness: 0.85, metalness: 0 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.face, roughness: 0.6, metalness: 0 });

  // корпус: три пересекающихся объёма дают плавный силуэт
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 12), bodyMaterial);
  chest.position.set(0, 0.94, 0.42);
  group.add(chest);

  // лапы: плавно сужающиеся
  const legs: Piece[] = [];
  const paws: Piece[] = [];
  for (const [x, z] of [[-0.25, 0.5], [0.25, 0.5], [-0.27, -0.88], [0.27, -0.88]] as const) {
    legs.push({ geometry: new THREE.CylinderGeometry(0.075, 0.1, 1.0, 12), position: [x, 0.5, z] });
    paws.push({ geometry: new THREE.SphereGeometry(0.12, 12, 9), position: [x, 0.08, z + 0.08], scale: [1, 0.7, 1.35] });
  }
  const bodyAndLegs = mergePieces([
    { geometry: new THREE.SphereGeometry(0.5, 18, 14), position: [0, 0.95, -0.15], scale: [1.85, 0.86, 0.82] },
    { geometry: new THREE.SphereGeometry(0.42, 16, 12), position: [0, 0.9, 0.45] },
    { geometry: new THREE.SphereGeometry(0.42, 16, 12), position: [0, 0.92, -0.9], scale: [1, 0.96, 1] },
    ...legs,
  ]);
  group.add(new THREE.Mesh(bodyAndLegs, bodyMaterial));
  group.add(new THREE.Mesh(mergePieces(paws), darkMaterial));

  // голова
  const head = new THREE.Group();
  head.position.set(0, 1.34, 0.82);

  head.add(new THREE.Mesh(mergePieces([
    { geometry: new THREE.SphereGeometry(0.29, 18, 14), scale: [0.92, 0.96, 1.06] },
    { geometry: new THREE.SphereGeometry(0.2, 14, 11), position: [0, -0.07, 0.28], scale: [0.85, 0.8, 1.5] },
  ]), bodyMaterial));

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 11), muzzleMaterial);
  muzzle.scale.set(0.95, 0.75, 1.5);
  muzzle.position.set(0, -0.1, 0.34);
  head.add(muzzle);

  const face = new THREE.Mesh(mergePieces([
    { geometry: new THREE.SphereGeometry(0.042, 10, 8), position: [-0.12, 0.09, 0.27] },
    { geometry: new THREE.SphereGeometry(0.042, 10, 8), position: [0.12, 0.09, 0.27] },
    { geometry: new THREE.SphereGeometry(0.055, 10, 8), position: [0, 0.0, 0.52], scale: [1, 0.8, 0.9] },
  ]), faceMaterial);
  head.add(face);

  // грива: три слоя мягких прядей, светлые вперемешку
  const mane: Piece[] = [];
  const maneLight: Piece[] = [];
  const rings = [
    { count: 14, radius: 0.38, size: 0.13, z: 0.0, y: 0.05 },
    { count: 16, radius: 0.47, size: 0.12, z: -0.14, y: -0.04 },
    { count: 16, radius: 0.54, size: 0.11, z: -0.3, y: -0.18 },
  ];
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.28;
      const piece: Piece = {
        geometry: new THREE.SphereGeometry(ring.size, 10, 8),
        position: [
          Math.sin(angle) * ring.radius,
          ring.y + Math.cos(angle) * ring.radius * 0.82,
          ring.z + Math.cos(angle) * 0.08,
        ],
        scale: [1.05, 1.08, 0.7],
      };
      (i % 3 === 0 ? maneLight : mane).push(piece);
    }
  });
  for (let i = 0; i < 4; i += 1) {
    mane.push({
      geometry: new THREE.SphereGeometry(0.17, 10, 8),
      position: [(i - 1.5) * 0.16, -0.46, 0.2 - Math.abs(i - 1.5) * 0.05],
      scale: [1, 1.35, 0.9],
    });
  }
  head.add(new THREE.Mesh(mergePieces(mane), maneMaterial));
  head.add(new THREE.Mesh(mergePieces(maneLight), maneLightMaterial));

  // уши
  const ears: THREE.Object3D[] = [];
  for (const x of [-0.19, 0.19]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 9), maneMaterial);
    ear.scale.set(1, 1.15, 0.55);
    ear.position.set(x, 0.27, 0.02);
    ear.rotation.z = x < 0 ? 0.34 : -0.34;
    head.add(ear);
    ears.push(ear);
  }

  group.add(head);

  // хвост
  const tail: THREE.Group[] = [];
  let parent: THREE.Object3D = group;
  for (let i = 0; i < 3; i += 1) {
    const segment = new THREE.Group();
    segment.position.set(0, i === 0 ? 1.06 : 0.02, i === 0 ? -1.2 : -0.28);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.062 - i * 0.009, 0.072 - i * 0.009, 0.3, 10),
      bodyMaterial,
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.position.z = -0.15;
    segment.add(mesh);
    if (i === 2) {
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), maneMaterial);
      tuft.scale.set(0.85, 0.85, 1.5);
      tuft.position.z = -0.36;
      segment.add(tuft);
    }
    parent.add(segment);
    parent = segment;
    tail.push(segment);
  }

  group.scale.setScalar(1.3);
  return { group, head, tail, ears, chest };
}

/** Путник: плащ телом вращения с живым подолом, капюшон единым объёмом. */
function buildTraveler(): { group: THREE.Group; cloak: THREE.Mesh; basePositions: Float32Array } {
  const group = new THREE.Group();
  const material = organicMaterial({ color: PALETTE.cloth, map: clothTexture(), roughness: 0.95 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.clothDark, roughness: 0.9, metalness: 0 });

  // профиль плаща: от плеч к подолу с естественным расширением
  const profile: THREE.Vector2[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const radius = 0.16 + Math.pow(t, 1.5) * 0.3 + Math.sin(t * Math.PI) * 0.05;
    profile.push(new THREE.Vector2(radius, 1.02 - t * 1.0));
  }
  const cloakGeometry = new THREE.LatheGeometry(profile, 22);
  cloakGeometry.computeVertexNormals();
  const cloak = new THREE.Mesh(cloakGeometry, material);
  group.add(cloak);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), material);
  hood.scale.set(1, 1.12, 1.08);
  hood.position.set(0, 1.06, 0.01);
  group.add(hood);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 11), material);
  shoulders.scale.set(1.5, 0.6, 0.9);
  shoulders.position.set(0, 0.92, 0);
  group.add(shoulders);

  const opening = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), darkMaterial);
  opening.scale.set(1, 1.15, 0.6);
  opening.position.set(0, 1.05, 0.13);
  group.add(opening);

  group.scale.setScalar(0.68);
  return { group, cloak, basePositions: Float32Array.from(cloakGeometry.attributes.position!.array) };
}

/** Листья: спрайты с нарисованной текстурой. */
function buildLeaves(count: number): { mesh: THREE.InstancedMesh; state: Float32Array } {
  const geometry = new THREE.PlaneGeometry(0.17, 0.24);
  const material = new THREE.MeshStandardMaterial({
    map: leafTexture(),
    transparent: true,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;

  const state = new Float32Array(count * 6);
  for (let i = 0; i < count; i += 1) {
    state[i * 6 + 0] = -6 + Math.random() * 12;
    state[i * 6 + 1] = 0.4 + Math.random() * 4.8;
    state[i * 6 + 2] = -5 + Math.random() * 10;
    state[i * 6 + 3] = 0.5 + Math.random() * 1.2;
    state[i * 6 + 4] = Math.random() * Math.PI * 2;
    state[i * 6 + 5] = (Math.random() - 0.5) * 3;
  }
  return { mesh, state };
}

export class TitleScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly clock = new THREE.Clock();
  private readonly lion: ReturnType<typeof buildLion>;
  private readonly traveler: ReturnType<typeof buildTraveler>;
  private readonly leaves: ReturnType<typeof buildLeaves>;
  private readonly foliage: THREE.Object3D[] = [];
  private readonly matrix = new THREE.Matrix4();
  private readonly disposables: { dispose(): void }[] = [];
  private frame = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;
  private fps = 0;
  private wind = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.scene.background = new THREE.Color(PALETTE.sky);
    this.scene.fog = new THREE.Fog(PALETTE.fog, 7, 26);

    this.camera = new THREE.PerspectiveCamera(FOV, 2 / 3, 0.1, 90);
    this.camera.position.set(0, CAMERA_HEIGHT, 7.4);
    this.camera.lookAt(0, LOOK_AT_HEIGHT, 0);
    const grain = grainTexture();

    // Свет: рассеянный холодный сверху, тёплый контровой (даёт подсветку гривы и коры),
    // мягкая холодная подсветка спереди.
    this.scene.add(new THREE.HemisphereLight(0xf4f9f6, 0x7a9a7e, 1.25));
    const rim = new THREE.DirectionalLight(0xffd9a0, 1.45);
    rim.position.set(4, 7.5, -6);
    rim.castShadow = true;
    rim.shadow.mapSize.set(512, 512);
    rim.shadow.camera.left = -7;
    rim.shadow.camera.right = 7;
    rim.shadow.camera.top = 8;
    rim.shadow.camera.bottom = -2;
    rim.shadow.bias = -0.0012;
    rim.shadow.radius = 3;
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9ecbe4, 0.75);
    fill.position.set(-5, 3, 5);
    this.scene.add(fill);

    // задник: светлый холодный просвет
    const backdropGeometry = new THREE.PlaneGeometry(70, 40, 1, 8);
    const backdropPositions = backdropGeometry.attributes.position as THREE.BufferAttribute;
    const backdropColors = new Float32Array(backdropPositions.count * 3);
    const topColor = new THREE.Color(PALETTE.sky);
    const bottomColor = new THREE.Color(PALETTE.fog);
    for (let i = 0; i < backdropPositions.count; i += 1) {
      const t = (backdropPositions.getY(i) + 20) / 40;
      const mixed = bottomColor.clone().lerp(topColor, t);
      backdropColors[i * 3] = mixed.r;
      backdropColors[i * 3 + 1] = mixed.g;
      backdropColors[i * 3 + 2] = mixed.b;
    }
    backdropGeometry.setAttribute('color', new THREE.BufferAttribute(backdropColors, 3));
    const backdropMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 8, -22);
    this.scene.add(backdrop);
    this.disposables.push(backdropGeometry, backdropMaterial);

    // земля с текстурой травы и мягкими пятнами света
    const groundGeometry = new THREE.PlaneGeometry(46, 46, 18, 18);
    const gPositions = groundGeometry.attributes.position as THREE.BufferAttribute;
    const gColors = new Float32Array(gPositions.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < gPositions.count; i += 1) {
      const x = gPositions.getX(i);
      const y = gPositions.getY(i);
      gPositions.setZ(i, Math.sin(x * 0.28) * 0.09 + Math.cos(y * 0.24) * 0.07);
      const patch = (Math.sin(x * 0.5) + Math.cos(y * 0.42)) * 0.5;
      const shade = patch > 0.35 ? 1.16 : patch < -0.35 ? 0.82 : 1;
      color.setHex(PALETTE.grass).multiplyScalar(shade);
      gColors[i * 3] = color.r;
      gColors[i * 3 + 1] = color.g;
      gColors[i * 3 + 2] = color.b;
    }
    groundGeometry.setAttribute('color', new THREE.BufferAttribute(gColors, 3));
    groundGeometry.computeVertexNormals();
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture(), vertexColors: true, roughness: 1, metalness: 0,
      // второй слой — мелкое зерно: вместе с текстурой даёт «мазки», а не гладкую заливку
      bumpMap: grain, bumpScale: 0.02,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.disposables.push(groundGeometry, groundMaterial);

    // деревья: рама (тёплые, крупные) и холодная даль
    const barkMaterial = organicMaterial({ color: PALETTE.bark, map: barkTexture() });
    const farBarkMaterial = organicMaterial({ color: PALETTE.barkFar, map: barkTexture(), roughness: 1 });
    const foliageMaterial = organicMaterial({ color: PALETTE.foliage, map: foliageTexture(), roughness: 1 });
    const farFoliageMaterial = organicMaterial({ color: PALETTE.foliageFar, map: foliageTexture(), roughness: 1 });
    this.disposables.push(barkMaterial, farBarkMaterial, foliageMaterial, farFoliageMaterial);

    const leftTree = new THREE.Group();
    leftTree.name = 'leftFrame';
    const leftTrunk = buildTrunk(13, 0.6, barkMaterial);
    leftTrunk.castShadow = true;
    leftTree.add(leftTrunk);
    leftTree.add(this.placeCanopy(11.6, 1.05, foliageMaterial, 7));
    this.scene.add(leftTree);

    const rightTree = new THREE.Group();
    rightTree.name = 'rightFrame';
    const rightTrunk = buildTrunk(13.6, 0.66, farBarkMaterial);
    rightTrunk.castShadow = true;
    rightTree.add(rightTrunk);
    rightTree.add(this.placeCanopy(12.2, 1.1, foliageMaterial, 11));
    this.scene.add(rightTree);

    const far = [
      [-1.6, -10, 12], [0.9, -11, 13], [-3.0, -15, 15], [2.8, -16, 15],
    ] as const;
    const farTrunks: Piece[] = [];
    const farCanopies: Piece[] = [];
    far.forEach(([x, z, height], index) => {
      const trunk = buildTrunk(height, height * 0.05, farBarkMaterial).geometry.clone();
      trunk.translate(x, 0, z);
      farTrunks.push({ geometry: trunk });
      const canopy = this.placeCanopy(height * 0.92, height * 0.16, farFoliageMaterial, index * 13 + 5);
      const canopyGeometry = canopy.geometry.clone();
      canopyGeometry.translate(x, height * 0.92, z);
      farCanopies.push({ geometry: canopyGeometry });
      canopy.geometry.dispose();
    });
    this.scene.add(new THREE.Mesh(mergePieces(farTrunks), farBarkMaterial));
    this.scene.add(new THREE.Mesh(mergePieces(farCanopies), farFoliageMaterial));

    // верхняя кайма листвы и ближняя ветка
    const topCanopy = new THREE.Group();
    topCanopy.name = 'canopyTop';
    topCanopy.add(this.placeCanopy(0, 0.55, foliageMaterial, 3));
    this.scene.add(topCanopy);
    this.foliage.push(topCanopy);

    for (const [name, sign] of [['canopyleft', -1], ['canopyright', 1]] as const) {
      const canopy = new THREE.Group();
      canopy.name = name;
      canopy.add(this.placeCanopy(0, 0.7, foliageMaterial, sign < 0 ? 17 : 23));
      this.scene.add(canopy);
      this.foliage.push(canopy);
    }

    // Лучи света сквозь кроны (аддитивные плоскости) и туман у земли
    const shaftMaterial = new THREE.MeshBasicMaterial({
      map: shaftTexture(), transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide, opacity: 0.85,
    });
    const shaftPieces: Piece[] = [];
    for (const [x, z, width, height, tilt] of [
      [-2.2, -3.2, 1.5, 9, 0.14], [-0.6, -4.4, 1.9, 10, 0.1], [1.4, -3.6, 1.4, 8.5, -0.12],
    ] as const) {
      shaftPieces.push({
        geometry: new THREE.PlaneGeometry(width, height),
        position: [x, height / 2 - 0.4, z],
        rotation: [0, 0, tilt],
      });
    }
    const shafts = new THREE.Mesh(mergePieces(shaftPieces), shaftMaterial);
    shafts.renderOrder = 2;
    this.scene.add(shafts);
    this.disposables.push(shaftMaterial);

    const mistMaterial = new THREE.MeshBasicMaterial({
      map: mistTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.55,
    });
    const mistPieces: Piece[] = [];
    for (const [z, y, scale] of [[-6, 0.7, 1.6], [-12, 1.1, 2.2]] as const) {
      mistPieces.push({ geometry: new THREE.PlaneGeometry(26 * scale, 3.4 * scale), position: [0, y, z] });
    }
    const mist = new THREE.Mesh(mergePieces(mistPieces), mistMaterial);
    mist.renderOrder = 1;
    this.scene.add(mist);
    this.disposables.push(mistMaterial);

    // Аслан и путник
    this.lion = buildLion();
    this.lion.group.position.set(-1.35, 0, 0.1);
    this.lion.group.rotation.y = -0.62;   // три четверти, как в референсе
    this.lion.group.traverse((child) => { if (child instanceof THREE.Mesh) child.castShadow = true; });
    this.scene.add(this.lion.group);

    this.traveler = buildTraveler();
    this.traveler.group.position.set(1.05, 0, 2.1);
    this.traveler.group.rotation.y = -0.85;
    this.traveler.group.traverse((child) => { if (child instanceof THREE.Mesh) child.castShadow = true; });
    this.scene.add(this.traveler.group);

    // листья
    this.leaves = buildLeaves(45);
    this.scene.add(this.leaves.mesh);
    this.disposables.push(this.leaves.mesh.geometry, this.leaves.mesh.material as THREE.Material);

    this.resize(canvas.clientWidth, canvas.clientHeight);
    this.layout();
    this.animate();
  }

  private placeCanopy(height: number, radius: number, material: THREE.Material, seed: number): THREE.Mesh {
    const canopy = buildCanopy(radius, material, seed);
    canopy.position.y = height;
    return canopy;
  }

  /** Ставит объект по кадру: несколько итераций по фактической проекции. */
  private alignToNdc(object: THREE.Object3D, targetX: number, targetY: number, z: number): void {
    object.position.z = z;
    const point = new THREE.Vector3();
    for (let step = 0; step < 8; step += 1) {
      object.getWorldPosition(point);
      point.project(this.camera);
      const { width, height } = halfExtents(this.camera.aspect, z);
      object.position.x += (targetX - point.x) * width * 0.85;
      object.position.y += (targetY - point.y) * height * 0.85;
    }
  }

  private layout(): void {
    const frameDepth = -1.2;
    const left = this.scene.getObjectByName('leftFrame');
    const right = this.scene.getObjectByName('rightFrame');
    if (left) this.alignToNdc(left, -0.86, -0.5, frameDepth);
    if (right) this.alignToNdc(right, 0.86, -0.5, frameDepth);

    const top = this.scene.getObjectByName('canopyTop');
    if (top) this.alignToNdc(top, 0, 1.06, frameDepth - 0.6);
    for (const [name, sign] of [['canopyleft', -1], ['canopyright', 1]] as const) {
      const canopy = this.scene.getObjectByName(name);
      if (canopy) this.alignToNdc(canopy, sign * 0.9, 0.92, frameDepth);
    }
  }

  resize(width: number, height: number): void {
    const aspect = width / Math.max(1, height);
    this.camera.aspect = aspect;
    const distance = 7.4 + Math.max(0, aspect - 0.66) * 5.5;
    this.camera.position.set(0, CAMERA_HEIGHT + Math.max(0, aspect - 0.66) * 0.5, distance);
    this.camera.lookAt(0, LOOK_AT_HEIGHT, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.layout();
  }

  private animate = (): void => {
    this.frame = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);
    if (document.hidden) return;

    const time = this.clock.elapsedTime;
    this.wind = Math.sin(time * 0.55) * 0.6 + Math.sin(time * 1.7) * 0.25 + 0.4;

    const breath = 1 + Math.sin(time * 2.1) * 0.025;
    this.lion.chest.scale.setScalar(breath);
    this.lion.head.rotation.y = Math.sin(time * 0.45) * 0.12;
    this.lion.head.rotation.x = Math.sin(time * 0.7 + 1) * 0.05;
    this.lion.head.position.y = 1.34 + Math.sin(time * 2.1) * 0.014;
    this.lion.ears.forEach((ear, index) => {
      const twitch = Math.max(0, Math.sin(time * 0.9 + index * 2.1) - 0.93) * 12;
      ear.rotation.z = (index === 0 ? 0.34 : -0.34) + twitch * (index === 0 ? 1 : -1);
    });
    this.lion.tail.forEach((segment, index) => {
      segment.rotation.y = Math.sin(time * 1.1 - index * 0.5) * (0.12 + index * 0.05) * (0.8 + this.wind * 0.6);
      segment.rotation.x = -0.1 + Math.sin(time * 0.8 - index * 0.4) * 0.08;
    });

    // подол плаща
    const cloak = this.traveler.cloak;
    const attribute = cloak.geometry.attributes.position as THREE.BufferAttribute;
    const base = this.traveler.basePositions;
    for (let i = 0; i < attribute.count; i += 1) {
      const bx = base[i * 3] ?? 0;
      const by = base[i * 3 + 1] ?? 0;
      const bz = base[i * 3 + 2] ?? 0;
      const hemWeight = Math.max(0, 0.55 - by) / 0.55;
      const angle = Math.atan2(bz, bx);
      const gust = this.wind * (0.14 + 0.06 * Math.sin(time * 2.6 + angle * 3));
      attribute.setXYZ(
        i,
        bx + Math.sin(angle) * hemWeight * gust + Math.sin(time * 3 + angle * 2) * hemWeight * 0.014,
        by - Math.abs(gust) * hemWeight * 0.07,
        bz + Math.cos(angle) * hemWeight * gust + Math.cos(time * 2.4 + angle * 2) * hemWeight * 0.014,
      );
    }
    attribute.needsUpdate = true;
    cloak.geometry.computeVertexNormals();

    this.foliage.forEach((canopy, index) => {
      canopy.rotation.z = Math.sin(time * 0.9 + index) * 0.028 * (0.6 + this.wind);
    });

    const { mesh, state } = this.leaves;
    const count = state.length / 6;
    for (let i = 0; i < count; i += 1) {
      const offset = i * 6;
      let x = state[offset] ?? 0;
      let y = state[offset + 1] ?? 0;
      let z = state[offset + 2] ?? 0;
      const speed = state[offset + 3] ?? 1;
      const phase = state[offset + 4] ?? 0;
      const spin = state[offset + 5] ?? 1;

      x += (speed * (0.6 + this.wind) + 0.35) * delta * 1.7;
      y += Math.sin(time * 1.6 + phase) * delta * 0.5;
      z += Math.cos(time * 1.1 + phase) * delta * 0.3;
      if (x > 8) {
        x = -8;
        y = 0.4 + Math.random() * 4.8;
        z = -5 + Math.random() * 10;
      }
      state[offset] = x;
      state[offset + 1] = y;
      state[offset + 2] = z;

      const scale = 0.85 + Math.sin(time * 2 + phase) * 0.15;
      this.matrix.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(time * spin, phase + time * 0.8, Math.sin(time * 1.5 + phase) * 0.7)),
        new THREE.Vector3(scale, scale, scale),
      );
      mesh.setMatrixAt(i, this.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);

    this.fpsAccum += delta;
    this.fpsFrames += 1;
    if (this.fpsAccum >= 0.5) {
      this.fps = Math.round(this.fpsFrames / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
    }
  };

  get stats(): TitleStats {
    return { calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, fps: this.fps };
  }

  get objectCount(): number {
    let total = 0;
    this.scene.traverse(() => { total += 1; });
    return total;
  }

  screenPositionOf(name: string): { x: number; y: number } | null {
    const object = this.scene.getObjectByName(name);
    if (!object) return null;
    const world = new THREE.Vector3();
    object.getWorldPosition(world);
    world.project(this.camera);
    return { x: world.x, y: world.y };
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    for (const item of this.disposables) item.dispose();
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
          material.dispose();
        }
      }
    });
    this.scene.clear();
    disposeTextures();
    this.renderer.dispose();
  }
}

export { PALETTE as TITLE_PALETTE };
