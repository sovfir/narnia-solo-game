/**
 * Заглавный экран: low-poly сцена по референсу `pics/title_screen_reference.jpg`.
 *
 * Композиция: два тёплых ствола обрамляют кадр, сверху нависают тёмные кроны,
 * в глубине — холодные сине-бирюзовые стволы в тумане. В центре стоит Аслан,
 * перед ним маленький путник в красном плаще с капюшоном.
 *
 * Положения рамы и крон считаются от фрустума камеры: на портретном экране
 * они должны оставаться внутри кадра, иначе композиция рассыпается.
 *
 * Анимация: Аслан дышит, поворачивает голову, шевелит ушами и хвостом;
 * ветер гонит листья, качает кроны и полощет плащ путника.
 *
 * Модуль грузится лениво: three не попадает в стартовый бандл.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export interface TitleStats {
  calls: number;
  triangles: number;
  fps: number;
}

const PALETTE = {
  grass: 0x5c7f46,
  grassLight: 0xb6c96a,
  grassShadow: 0x3a5a3a,
  bark: 0xd07a34,
  barkLight: 0xe89a4c,
  barkDark: 0x7a3f1c,
  barkFar: 0x86b6c2,
  canopy: 0x5a8f47,
  canopyDark: 0x3b6335,
  lionBody: 0xf0b356,
  lionBodyDark: 0xc98a35,
  lionMane: 0xd9852a,
  lionManeLight: 0xf6c877,
  muzzle: 0xf8ecd4,
  cloak: 0xe02a1c,
  cloakDark: 0xa8150f,
  face: 0x2a1a12,
  fog: 0x9fd2cb,
  sky: 0xc2e2df,
} as const;

const FOV = 42;
const CAMERA_HEIGHT = 1.45;
const LOOK_AT_HEIGHT = 1.0;

/**
 * Полуразмеры видимой области на заданной глубине (мировые единицы).
 * Нужны, чтобы ставить раму и кроны точно по краям кадра на любом экране.
 */
function halfExtents(aspect: number, depth: number): { width: number; height: number } {
  const distance = Math.hypot(depth + 7.4, CAMERA_HEIGHT - LOOK_AT_HEIGHT);
  const height = Math.tan((FOV / 2) * (Math.PI / 180)) * distance;
  return { width: height * aspect, height };
}

function flatMaterial(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

interface Piece {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/** Собирает несколько примитивов в одну геометрию — меньше draw calls. */
function mergePieces(pieces: Piece[]): THREE.BufferGeometry {
  const prepared = pieces.map((piece) => {
    const geometry = piece.geometry.clone();
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...(piece.position ?? [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(piece.rotation ?? [0, 0, 0]))),
      new THREE.Vector3(...(piece.scale ?? [1, 1, 1])),
    );
    geometry.applyMatrix4(matrix);
    return geometry.toNonIndexed();
  });
  const merged = mergeGeometries(prepared, false) ?? new THREE.BufferGeometry();
  for (const geometry of prepared) geometry.dispose();
  for (const piece of pieces) piece.geometry.dispose();
  return merged;
}

/** Лев: вытянутый корпус, объёмная грива из «капель», вытянутая морда, хвост из сегментов. */
function buildLion(): {
  group: THREE.Group;
  head: THREE.Group;
  tail: THREE.Group[];
  ears: THREE.Object3D[];
  chest: THREE.Object3D;
} {
  const group = new THREE.Group();
  const bodyMaterial = flatMaterial(PALETTE.lionBody);
  const bodyDarkMaterial = flatMaterial(PALETTE.lionBodyDark);
  const maneMaterial = flatMaterial(PALETTE.lionMane);
  const maneLightMaterial = flatMaterial(PALETTE.lionManeLight);
  const muzzleMaterial = flatMaterial(PALETTE.muzzle);

  // корпус, круп, лапы и лапы-ступни — одна геометрия
  const bodyPieces: Piece[] = [
    { geometry: new THREE.IcosahedronGeometry(0.5, 1), position: [0, 0.95, -0.15], scale: [1.8, 0.85, 0.82] },
    { geometry: new THREE.IcosahedronGeometry(0.44, 1), position: [0, 0.92, 0.5] },
    { geometry: new THREE.IcosahedronGeometry(0.4, 1), position: [0, 0.9, -0.9], scale: [1, 0.95, 1] },
  ];
  const legPieces: Piece[] = [];
  for (const [x, z] of [[-0.26, 0.55], [0.26, 0.55], [-0.28, -0.9], [0.28, -0.9]] as const) {
    legPieces.push({ geometry: new THREE.CylinderGeometry(0.07, 0.09, 1.0, 6), position: [x, 0.5, z] });
  }
  group.add(new THREE.Mesh(mergePieces(bodyPieces), bodyMaterial));

  const pawPieces: Piece[] = [];
  for (const [x, z] of [[-0.26, 0.61], [0.26, 0.61], [-0.28, -0.84], [0.28, -0.84]] as const) {
    pawPieces.push({ geometry: new THREE.BoxGeometry(0.24, 0.12, 0.32), position: [x, 0.06, z] });
  }
  group.add(new THREE.Mesh(mergePieces([...legPieces, ...pawPieces]), bodyDarkMaterial));

  // грудь — отдельный объект, её «дышит» анимация
  const chest = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 1), bodyMaterial);
  chest.position.set(0, 0.92, 0.52);
  group.add(chest);

  // голова: череп + вытянутая морда + нос + глаза — одним мешем на материал
  const head = new THREE.Group();
  head.position.set(0, 1.34, 0.82);

  const skullGeometry = mergePieces([
    { geometry: new THREE.IcosahedronGeometry(0.3, 1), scale: [1, 0.95, 1.05] },
    { geometry: new THREE.CylinderGeometry(0.14, 0.2, 0.42, 6), position: [0, -0.06, 0.32], rotation: [Math.PI / 2, 0, 0] },
    { geometry: new THREE.IcosahedronGeometry(0.06, 0), position: [0, 0.0, 0.53] },
  ]);
  const skullMesh = new THREE.Mesh(skullGeometry, bodyMaterial);
  skullMesh.scale.set(0.88, 0.95, 1.1);              // голова уже, морда вытянута
  head.add(skullMesh);

  const faceGeometry = mergePieces([
    { geometry: new THREE.IcosahedronGeometry(0.045, 0), position: [-0.13, 0.1, 0.26] },
    { geometry: new THREE.IcosahedronGeometry(0.045, 0), position: [0.13, 0.1, 0.26] },
    { geometry: new THREE.IcosahedronGeometry(0.05, 0), position: [0, 0.02, 0.56] },
  ]);
  head.add(new THREE.Mesh(faceGeometry, flatMaterial(PALETTE.face)));

  // светлая нижняя часть морды — «усы» льва
  const muzzleGeometry = new THREE.CylinderGeometry(0.15, 0.19, 0.3, 6);
  const muzzleMesh = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
  muzzleMesh.rotation.x = Math.PI / 2;
  muzzleMesh.position.set(0, -0.12, 0.3);
  head.add(muzzleMesh);

  // грива: два слоя «капель» вокруг головы — без шипов и конусов
  const manePieces: Piece[] = [];
  const maneLightPieces: Piece[] = [];
  // грива-«шуба»: плоские слои позади и под головой, а не шар вокруг морды
  const rings = [
    { count: 12, radius: 0.42, size: 0.2, z: -0.24, y: -0.02 },
    { count: 14, radius: 0.54, size: 0.18, z: -0.38, y: -0.1 },
  ];
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.3;
      const piece: Piece = {
        geometry: new THREE.IcosahedronGeometry(ring.size, 0),
        position: [Math.sin(angle) * ring.radius, ring.y + Math.cos(angle) * ring.radius * 0.85, ring.z + Math.cos(angle) * 0.1],
        scale: [1.05, 1.05, 0.55],
      };
      (i % 3 === 0 ? maneLightPieces : manePieces).push(piece);
    }
  });
  // пряди, спускающиеся на грудь
  for (let i = 0; i < 3; i += 1) {
    manePieces.push({
      geometry: new THREE.IcosahedronGeometry(0.19, 0),
      position: [(i - 1) * 0.2, -0.42, 0.22 - Math.abs(i - 1) * 0.05],
      scale: [1, 1.3, 1],
    });
  }
  head.add(new THREE.Mesh(mergePieces(manePieces), maneMaterial));
  head.add(new THREE.Mesh(mergePieces(maneLightPieces), maneLightMaterial));

  // уши — небольшие, округлые
  const ears: THREE.Object3D[] = [];
  for (const x of [-0.2, 0.2]) {
    const ear = new THREE.Mesh(new THREE.IcosahedronGeometry(0.095, 0), maneMaterial);
    ear.scale.set(1, 1.15, 0.6);
    ear.position.set(x, 0.28, 0.0);
    ear.rotation.z = x < 0 ? 0.32 : -0.32;
    head.add(ear);
    ears.push(ear);
  }

  group.add(head);

  // хвост из сегментов
  const tail: THREE.Group[] = [];
  let parent: THREE.Object3D = group;
  for (let i = 0; i < 4; i += 1) {
    const segment = new THREE.Group();
    segment.position.set(0, i === 0 ? 1.08 : 0.05, i === 0 ? -1.2 : -0.28);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07 - i * 0.01, 0.08 - i * 0.01, 0.3, 5),
      bodyMaterial,
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.position.z = -0.15;
    segment.add(mesh);
    if (i === 3) {
      const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), maneMaterial);
      tuft.scale.set(1, 1.4, 1);
      tuft.position.z = -0.34;
      segment.add(tuft);
    }
    parent.add(segment);
    parent = segment;
    tail.push(segment);
  }

  group.scale.setScalar(1.3);
  return { group, head, tail, ears, chest };
}

/**
 * Путник: цельный силуэт «плащ + капюшон»; подол колышется ветром
 * за счёт смещения нижних вершин — без отдельных «крыльев».
 */
function buildTraveler(): { group: THREE.Group; cloak: THREE.Mesh; basePositions: Float32Array } {
  const group = new THREE.Group();
  const cloakMaterial = flatMaterial(PALETTE.cloak);
  const cloakDarkMaterial = flatMaterial(PALETTE.cloakDark);

  // плащ: конус с 12 сегментами, нижнее кольцо гнём ветром
  const cloakGeometry = new THREE.ConeGeometry(0.36, 1.1, 12, 1, true);
  cloakGeometry.translate(0, 0.55, 0);
  const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
  group.add(cloak);

  // капюшон и плечи — та же ткань, один силуэт
  const hoodGeometry = mergePieces([
    { geometry: new THREE.IcosahedronGeometry(0.19, 1), position: [0, 1.08, 0.01], scale: [1, 1.15, 1.1] },
    { geometry: new THREE.CylinderGeometry(0.21, 0.17, 0.22, 10), position: [0, 0.95, 0] },
    { geometry: new THREE.BoxGeometry(0.34, 0.16, 0.24), position: [0, 0.86, 0] },
  ]);
  group.add(new THREE.Mesh(hoodGeometry, cloakMaterial));

  // тень под капюшоном вместо «лица»
  const opening = new THREE.Mesh(new THREE.IcosahedronGeometry(0.105, 0), cloakDarkMaterial);
  opening.scale.set(1, 1.1, 0.6);
  opening.position.set(0, 1.06, 0.12);
  group.add(opening);

  const legs = new THREE.Mesh(
    mergePieces([
      { geometry: new THREE.CylinderGeometry(0.045, 0.05, 0.22, 5), position: [-0.08, 0.11, 0] },
      { geometry: new THREE.CylinderGeometry(0.045, 0.05, 0.22, 5), position: [0.08, 0.11, 0] },
    ]),
    flatMaterial(0x2a2016),
  );
  group.add(legs);

  group.scale.setScalar(0.66);
  return { group, cloak, basePositions: Float32Array.from(cloakGeometry.attributes.position!.array) };
}

/** Дерево: тёплый ствол с корневой «юбкой»; дальние — тонкие и холодные. */
function buildTree(options: {
  height: number;
  radius: number;
  bark: number;
  canopy: number | null;
  lean?: number;
}): THREE.Group {
  const group = new THREE.Group();
  const trunkGeometry = mergePieces([
    { geometry: new THREE.CylinderGeometry(options.radius * 0.7, options.radius, options.height, 8), position: [0, options.height / 2, 0] },
    { geometry: new THREE.ConeGeometry(options.radius * 1.5, options.radius * 0.9, 8), position: [0, options.radius * 0.35, 0] },
  ]);
  group.add(new THREE.Mesh(trunkGeometry, flatMaterial(options.bark)));

  if (options.canopy !== null) {
    const canopy = new THREE.Mesh(
      new THREE.IcosahedronGeometry(options.height * 0.3, 1),
      flatMaterial(options.canopy),
    );
    canopy.scale.set(1, 0.55, 1);
    canopy.position.y = options.height * 0.95;
    group.add(canopy);
  }
  if (options.lean) group.rotation.z = options.lean;
  return group;
}

/** Листья: маленькие треугольники, которые несёт ветер. */
function buildLeaves(count: number): { mesh: THREE.InstancedMesh; state: Float32Array } {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.055, 0, 0, 0.055, 0, 0, 0, 0.085, 0.02,
  ], 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, flatShading: true });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;

  const color = new THREE.Color();
  const tints = [0xe0b04a, 0xc8802f, 0x9db055, 0xc0421f];
  for (let i = 0; i < count; i += 1) mesh.setColorAt(i, color.setHex(tints[i % tints.length]!));
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const state = new Float32Array(count * 6);
  for (let i = 0; i < count; i += 1) {
    state[i * 6 + 0] = -6 + Math.random() * 12;
    state[i * 6 + 1] = 0.3 + Math.random() * 4.6;
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
  private readonly canopies: THREE.Object3D[] = [];
  private readonly nearCanopy: THREE.Object3D | null = null;
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

    this.scene.background = new THREE.Color(PALETTE.sky);
    this.scene.fog = new THREE.Fog(PALETTE.fog, 6, 24);

    this.camera = new THREE.PerspectiveCamera(FOV, 2 / 3, 0.1, 90);
    this.camera.position.set(0, CAMERA_HEIGHT, 7.4);
    this.camera.lookAt(0, LOOK_AT_HEIGHT, 0);

    // свет: тёплый контровой сзади-сверху (подсвечивает гриву и кору) + холодная подсветка
    this.scene.add(new THREE.HemisphereLight(0xfdf6e4, 0x466054, 0.95));
    const rim = new THREE.DirectionalLight(0xffe2ae, 2.2);
    rim.position.set(3.5, 7, -6);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0x8fc0d8, 0.6);
    fill.position.set(-4, 2.5, 5);
    this.scene.add(fill);

    // земля с пятнами света
    const groundGeometry = new THREE.PlaneGeometry(46, 46, 22, 22);
    const position = groundGeometry.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      position.setZ(i, Math.sin(x * 0.3) * 0.06 + Math.cos(y * 0.27) * 0.05);
      const patch = (Math.sin(x * 0.55) + Math.cos(y * 0.45)) * 0.5;
      const shade = patch > 0.4 ? PALETTE.grassLight : patch < -0.4 ? PALETTE.grassShadow : PALETTE.grass;
      color.setHex(shade).offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    groundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundGeometry.computeVertexNormals();
    const groundMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    this.disposables.push(groundGeometry, groundMaterial);

    // задник: светлый холодный просвет (не зависит от света и туманa) — глубина кадра
    const backdropGeometry = new THREE.PlaneGeometry(70, 40, 1, 8);
    const backdropPositions = backdropGeometry.attributes.position as THREE.BufferAttribute;
    const backdropColors = new Float32Array(backdropPositions.count * 3);
    const top = new THREE.Color(PALETTE.sky);
    const bottom = new THREE.Color(PALETTE.fog);
    for (let i = 0; i < backdropPositions.count; i += 1) {
      const t = (backdropPositions.getY(i) + 20) / 40;      // 0 внизу, 1 сверху
      const mixed = bottom.clone().lerp(top, t);
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

    // рама: два тёплых ствола по краям кадра (позиции считаются в resize)
    const leftTree = buildTree({ height: 13, radius: 0.85, bark: PALETTE.bark, canopy: null, lean: 0.045 });
    const rightTree = buildTree({ height: 13.5, radius: 0.95, bark: PALETTE.barkLight, canopy: null, lean: -0.04 });
    leftTree.name = 'leftFrame';
    rightTree.name = 'rightFrame';
    this.scene.add(leftTree, rightTree);

    // кроны: одна по центру сверху (закрывает «потолок» кадра) и две у рамы
    const canopyMaterial = flatMaterial(PALETTE.canopy);
    const canopyTop = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), canopyMaterial);
    canopyTop.scale.set(2.2, 0.5, 1);
    canopyTop.name = 'canopyTop';
    this.scene.add(canopyTop);
    this.canopies.push(canopyTop);

    for (const [name, x, height] of [['left', -1, 12.2], ['right', 1, 12.6]] as const) {
      const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), flatMaterial(PALETTE.canopyDark));
      canopy.scale.set(1.2, 0.5, 1);
      canopy.position.set(x, height, -1.2);
      canopy.name = `canopy${name}`;
      this.scene.add(canopy);
      this.canopies.push(canopy);
    }

    // ближняя ветка над головой — читается как нависающий лес
    const branch = new THREE.Group();
    const branchTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 3.2, 6), flatMaterial(PALETTE.barkDark));
    branchTrunk.rotation.z = Math.PI / 2.35;
    branch.add(branchTrunk);
    const branchLeaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), flatMaterial(PALETTE.canopy));
    branchLeaves.scale.set(1.1, 0.5, 1);
    branchLeaves.position.set(1.1, 0.4, 0);
    branch.add(branchLeaves);
    branch.name = 'nearBranch';
    this.scene.add(branch);
    this.canopies.push(branchLeaves);
    this.nearCanopy = branch;

    // холодная даль в тумане
    const far = [
      [-1.9, -9, 11], [-0.8, -12, 13], [0.7, -10, 12], [1.8, -13, 14], [-3.2, -15, 15], [3.0, -16, 15],
    ] as const;
    far.forEach(([x, z, height], index) => {
      const tree = buildTree({
        height, radius: height * 0.055, bark: PALETTE.barkFar,
        canopy: index % 2 === 0 ? PALETTE.canopy : null,
      });
      tree.position.set(x, 0, z);
      this.scene.add(tree);
      if (tree.children[1]) this.canopies.push(tree.children[1]!);
    });

    // Аслан и путник
    this.lion = buildLion();
    this.lion.group.position.set(-0.1, 0, 0.1);
    this.scene.add(this.lion.group);

    this.traveler = buildTraveler();
    this.traveler.group.position.set(0.1, 0, 2.15);
    this.traveler.group.rotation.y = 0.18;
    this.scene.add(this.traveler.group);

    // листья
    this.leaves = buildLeaves(70);
    this.scene.add(this.leaves.mesh);
    this.disposables.push(this.leaves.mesh.geometry, this.leaves.mesh.material as THREE.Material);

    this.resize(canvas.clientWidth, canvas.clientHeight);
    this.layout();
    this.animate();
  }

  /**
   * Выравнивает объект по кадру: несколько итераций по фактической проекции.
   * Так композиция не зависит от того, насколько вытянут экран телефона.
   */
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

  /** Рама, кроны и ближняя ветка — строго по краям кадра. */
  private layout(): void {
    const frameDepth = -1.2;
    const left = this.scene.getObjectByName('leftFrame');
    const right = this.scene.getObjectByName('rightFrame');
    // стволы стоят чуть за краем: часть ствола срезана кадром, как в референсе
    if (left) this.alignToNdc(left, -0.86, -0.55, frameDepth);
    if (right) this.alignToNdc(right, 0.86, -0.55, frameDepth);

    const top = this.scene.getObjectByName('canopyTop');
    if (top) {
      this.alignToNdc(top, 0, 1.06, frameDepth - 0.6);
      top.scale.set(2.2, 0.5, 1);                    // тонкая кайма, а не тяжёлый свод
    }
    for (const [name, sign] of [['canopyleft', -1], ['canopyright', 1]] as const) {
      const canopy = this.scene.getObjectByName(name);
      if (canopy) this.alignToNdc(canopy, sign * 0.95, 1.0, frameDepth);
    }
    const near = this.scene.getObjectByName('nearBranch');
    if (near) this.alignToNdc(near, -0.72, 1.04, 1.4);
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

    // Аслан: дыхание, голова, уши, хвост
    const breath = 1 + Math.sin(time * 2.1) * 0.025;
    this.lion.chest.scale.setScalar(breath);
    this.lion.head.rotation.y = Math.sin(time * 0.45) * 0.12;
    this.lion.head.rotation.x = Math.sin(time * 0.7 + 1) * 0.05;
    this.lion.head.position.y = 1.32 + Math.sin(time * 2.1) * 0.014;
    this.lion.ears.forEach((ear, index) => {
      const twitch = Math.max(0, Math.sin(time * 0.9 + index * 2.1) - 0.93) * 12;
      ear.rotation.z = (index === 0 ? 0.32 : -0.32) + twitch * (index === 0 ? 1 : -1);
    });
    this.lion.tail.forEach((segment, index) => {
      segment.rotation.y = Math.sin(time * 1.1 - index * 0.5) * (0.12 + index * 0.05) * (0.8 + this.wind * 0.6);
      segment.rotation.x = -0.12 + Math.sin(time * 0.8 - index * 0.4) * 0.08;
    });

    // плащ путника: гнём нижнее кольцо конуса — силуэт остаётся цельным
    const cloak = this.traveler.cloak;
    const attribute = cloak.geometry.attributes.position as THREE.BufferAttribute;
    const base = this.traveler.basePositions;
    for (let i = 0; i < attribute.count; i += 1) {
      const bx = base[i * 3] ?? 0;
      const by = base[i * 3 + 1] ?? 0;
      const bz = base[i * 3 + 2] ?? 0;
      const hemWeight = Math.max(0, 0.52 - by) / 0.52;      // 0 у плеч, 1 у подола
      const angle = Math.atan2(bz, bx);
      const gust = this.wind * (0.16 + 0.07 * Math.sin(time * 2.6 + angle * 3));
      attribute.setXYZ(
        i,
        bx + Math.sin(angle) * hemWeight * gust + Math.sin(time * 3 + angle * 2) * hemWeight * 0.015,
        by - Math.abs(gust) * hemWeight * 0.08,
        bz + Math.cos(angle) * hemWeight * gust + Math.cos(time * 2.4 + angle * 2) * hemWeight * 0.015,
      );
    }
    attribute.needsUpdate = true;

    // кроны качаются
    this.canopies.forEach((canopy, index) => {
      canopy.rotation.z = Math.sin(time * 0.9 + index) * 0.03 * (0.6 + this.wind);
    });
    if (this.nearCanopy) {
      this.nearCanopy.rotation.z = Math.sin(time * 0.8) * 0.02 + this.wind * 0.01;
    }

    // листья
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

      x += (speed * (0.6 + this.wind) + 0.4) * delta * 1.7;
      y += Math.sin(time * 1.6 + phase) * delta * 0.5;
      z += Math.cos(time * 1.1 + phase) * delta * 0.3;
      if (x > 8) {
        x = -8;
        y = 0.3 + Math.random() * 4.6;
        z = -5 + Math.random() * 10;
      }
      state[offset] = x;
      state[offset + 1] = y;
      state[offset + 2] = z;

      const scale = 0.85 + Math.sin(time * 2 + phase) * 0.15;
      this.matrix.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(time * spin, phase + time * 0.8, Math.sin(time * 1.5 + phase) * 0.6)),
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

  /** Экранная позиция объекта — проверяется тестами (композиция внутри кадра). */
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
    this.scene.clear();
    this.renderer.dispose();
  }
}

export { PALETTE as TITLE_PALETTE };
