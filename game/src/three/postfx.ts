/**
 * Пост-обработка заглавной сцены: живописный фильтр, свечение и глубина резкости.
 *
 * Именно этот слой даёт «нарисованность», которой не хватало чистой геометрии:
 *  - Kuwahara-фильтр уплощает цвет внутри мазков и сохраняет края (эффект кисти);
 *  - мягкий bloom подчёркивает свет в кронах;
 *  - глубина резкости размывает дальние стволы, как на референсе;
 *  - финальный OutputPass приводит тонмаппинг и цветовое пространство.
 *
 * Есть три уровня качества: на телефоне фильтр работает с меньшим радиусом и без DOF.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { strokeAngleTexture } from './textures.ts';

export type Quality = 'high' | 'medium' | 'low';

/**
 * Живописный фильтр: направленные мазки.
 *
 * Круглые пятна Kuwahara читались как «мыло», поэтому штрих тянется вдоль
 * направления из мягкого шума: на стволах получаются вертикальные мазки,
 * на траве — короткие косые. Поверх — лёгкая постеризация, чтобы мазки «легли» плотно.
 */
const PainterlyShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tAngle: { value: null as THREE.Texture | null },
    uTexel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
    uLength: { value: 14 },
    uStrength: { value: 0.8 },
    uSaturation: { value: 1.12 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform sampler2D tAngle;
    uniform vec2 uTexel;
    uniform float uLength;
    uniform float uStrength;
    uniform float uSaturation;
    varying vec2 vUv;

    void main() {
      vec3 base = texture2D(tDiffuse, vUv).rgb;
      float angle = texture2D(tAngle, vUv).r * 6.2831853;
      vec2 dir = vec2(cos(angle), sin(angle));

      vec3 sum = vec3(0.0);
      float weight = 0.0;
      for (int i = -8; i <= 8; i++) {
        for (int j = -1; j <= 1; j++) {
          vec2 offset = dir * (float(i) / 8.0) * uLength + vec2(-dir.y, dir.x) * float(j) * 1.2;
          float w = 1.0 - abs(float(i)) / 9.0;
          sum += texture2D(tDiffuse, vUv + offset * uTexel).rgb * w;
          weight += w;
        }
      }
      vec3 stroke = sum / weight;
      vec3 painted = mix(base, stroke, uStrength);

      // плотная укладка мазка + чуть больше насыщенности, как у живописи
      painted = mix(painted, floor(painted * 14.0 + 0.5) / 14.0, 0.18);
      float luma = dot(painted, vec3(0.299, 0.587, 0.114));
      painted = mix(vec3(luma), painted, uSaturation);
      gl_FragColor = vec4(painted, 1.0);
    }
  `,
};

export interface PostFxOptions {
  quality: Quality;
}

export class PostFx {
  private readonly composer: EffectComposer;
  private readonly painterly: ShaderPass;
  private readonly bloom: UnrealBloomPass | null;
  private readonly bokeh: BokehPass | null;
  private readonly renderPass: RenderPass;
  private width = 1;
  private height = 1;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    options: PostFxOptions,
  ) {
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    if (options.quality !== 'low') {
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.7, 0.82);
      this.composer.addPass(this.bloom);
    } else {
      this.bloom = null;
    }

    if (options.quality === 'high') {
      this.bokeh = new BokehPass(scene, camera, { focus: 8.5, aperture: 0.0022, maxblur: 0.012 });
      this.composer.addPass(this.bokeh);
    } else {
      this.bokeh = null;
    }

    this.painterly = new ShaderPass(PainterlyShader);
    this.painterly.uniforms.tAngle!.value = strokeAngleTexture();
    this.painterly.uniforms.uLength!.value = options.quality === 'high' ? 16 : 10;
    this.painterly.uniforms.uStrength!.value = options.quality === 'high' ? 0.82 : 0.7;
    this.composer.addPass(this.painterly);

    this.composer.addPass(new OutputPass());
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.width = width;
    this.height = height;
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.painterly.uniforms.uTexel!.value.set(1 / (width * pixelRatio), 1 / (height * pixelRatio));
    this.bloom?.setSize(width, height);
  }

  render(): void {
    this.composer.render();
  }

  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  dispose(): void {
    this.composer.dispose();
    this.bloom?.dispose();
    this.bokeh?.dispose();
    this.painterly.dispose();
    this.renderPass.dispose();
  }
}
