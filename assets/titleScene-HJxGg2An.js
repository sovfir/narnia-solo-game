const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./GLTFLoader-CVtRMeH-.js","./BufferGeometryUtils-BQ8C9h1G.js"])))=>i.map(i=>d[i]);
import{M as u,G as R,B as Le,V as D,O as Xe,a as Ie,F as Pe,S as I,U as Z,b as _,W as j,H as Y,N as Oe,T as $e,C as B,A as Ge,c as W,d as De,e as Je,R as et,f as tt,g as st,h as ot,L as at,i as rt,j as it,k as Ve,l as nt,m as lt,n as ct,o as re,p as ht,q as ie,r as Qe,s as ut,P as ft,t as dt,u as pt,v as mt,D as Ae,w as gt,x as V,y as Ue,z as se,E as U,I as vt,J as xt,K as We,Q as bt,X as He,Y as je,Z as Ye,_ as wt,$ as y,a0 as S,a1 as J,a2 as Re,a3 as ke,a4 as Mt}from"./BufferGeometryUtils-BQ8C9h1G.js";import{_ as yt}from"./index-5qIJVw9S.js";const Ct="Aslan_Head",Tt="Aslan_Body",St="Aslan_Tail";function he(i,e,t,s){const a=new Le().setFromObject(e),o=s(a);i.updateMatrixWorld(!0);const r=new R;return r.name=t,r.position.copy(i.worldToLocal(o.clone())),i.add(r),r.updateMatrixWorld(!0),r.attach(e),r}const ue=i=>i.getCenter(new D);function _t(i,e=1.6){const t=new R;t.name="Aslan",t.add(i);const a=new Le().setFromObject(i).getSize(new D);if(a.y>0){const c=e/a.y;i.scale.multiplyScalar(c),t.updateMatrixWorld(!0)}const o=i.getObjectByName(Ct),r=i.getObjectByName(Tt),n=i.getObjectByName(St),l=[];for(let c=0;;c+=1){const h=i.getObjectByName(`Aslan_Ear_${c}`);if(!h)break;l.push(h)}const p=o?he(i,o,"HeadPivot",ue):t;return t.updateMatrixWorld(!0),{group:t,chest:r?he(i,r,"ChestPivot",ue):t,head:p,headBaseY:p.position.y,ears:l,tail:n?[he(i,n,"TailPivot",ue)]:[]}}async function Pt(i,e=1.6){const{GLTFLoader:t}=await yt(async()=>{const{GLTFLoader:o}=await import("./GLTFLoader-CVtRMeH-.js");return{GLTFLoader:o}},__vite__mapDeps([0,1]),import.meta.url),s=await new t().loadAsync(i),a=_t(s.scene,e);return s.scene.traverse(o=>{o instanceof u&&(o.castShadow=!0,o.receiveShadow=!0)}),a}const oe={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class O{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Dt=new Xe(-1,1,1,-1,0,1);class At extends Ie{constructor(){super(),this.setAttribute("position",new Pe([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Pe([0,2,0,0,2,0],2))}}const Ut=new At;class ne{constructor(e){this._mesh=new u(Ut,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Dt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Ze extends O{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof I?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Z.clone(e.uniforms),this.material=new I({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ne(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Fe extends O{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const a=e.getContext(),o=e.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),o.buffers.stencil.setFunc(a.ALWAYS,r,4294967295),o.buffers.stencil.setClear(n),o.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(a.EQUAL,1,4294967295),o.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),o.buffers.stencil.setLocked(!0)}}class Rt extends O{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class kt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new _);this._width=s.width,this._height=s.height,t=new j(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Y}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ze(oe),this.copyPass.material.blending=Oe,this.timer=new $e}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let a=0,o=this.passes.length;a<o;a++){const r=this.passes[a];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Fe!==void 0&&(r instanceof Fe?s=!0:r instanceof Rt&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new _);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(s,a),this.renderTarget2.setSize(s,a);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(s,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ft extends O{constructor(e,t,s=null,a=null,o=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=a,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new B}render(e,t,s){const a=e.autoClear;e.autoClear=!1;let o,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(o=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(o),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=a}}const Et={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new B(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Q extends O{constructor(e,t=1,s,a){super(),this.strength=t,this.radius=s,this.threshold=a,this.resolution=e!==void 0?new _(e.x,e.y):new _(256,256),this.clearColor=new B(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new j(o,r,{type:Y,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const h=new j(o,r,{type:Y,depthBuffer:!1});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const v=new j(o,r,{type:Y,depthBuffer:!1});v.texture.name="UnrealBloomPass.v"+c,v.texture.generateMipmaps=!1,this.renderTargetsVertical.push(v),o=Math.round(o/2),r=Math.round(r/2)}const n=Et;this.highPassUniforms=Z.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new I({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];o=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new _(1/o,1/r),o=Math.round(o/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Z.clone(oe.uniforms),this.blendMaterial=new I({uniforms:this.copyUniforms,vertexShader:oe.vertexShader,fragmentShader:oe.fragmentShader,premultipliedAlpha:!0,blending:Ge,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new B,this._oldClearAlpha=1,this._basic=new W,this._fsQuad=new ne(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(s,a);for(let o=0;o<this.nMips;o++)this.renderTargetsHorizontal[o].setSize(s,a),this.renderTargetsVertical[o].setSize(s,a),this.separableBlurMaterials[o].uniforms.invSize.value=new _(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2)}render(e,t,s,a,o){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),o&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=Q.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Q.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,o&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);const a=[],o=[];for(let r=1;r<e;r+=2){const n=t[r],l=r+1<e?t[r+1]:0,p=n+l;a.push((r*n+(r+1)*l)/p),o.push(p)}return new I({defines:{KERNEL_PAIRS:a.length},uniforms:{colorTexture:{value:null},invSize:{value:new _(.5,.5)},direction:{value:new _(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:a},gaussianWeights:{value:o}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new I({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}Q.BlurDirectionX=new _(1,0);Q.BlurDirectionY=new _(0,1);const ee={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
			gl_FragColor.a = 1.0;

		}`};class Bt extends O{constructor(e,t,s){super(),this.scene=e,this.camera=t;const a=s.focus!==void 0?s.focus:1,o=s.aperture!==void 0?s.aperture:.025,r=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new j(1,1,{minFilter:De,magFilter:De,type:Y}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new Je,this._materialDepth.depthPacking=et,this._materialDepth.blending=Oe;const n=Z.clone(ee.uniforms);n.tDepth.value=this._renderTargetDepth.texture,n.focus.value=a,n.aspect.value=t.aspect,n.aperture.value=o,n.maxblur.value=r,n.nearClip.value=t.near,n.farClip.value=t.far,this.materialBokeh=new I({defines:Object.assign({},ee.defines),uniforms:n,vertexShader:ee.vertexShader,fragmentShader:ee.fragmentShader}),this.uniforms=n,this._fsQuad=new ne(this.materialBokeh),this._oldClearColor=new B}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(a),e.autoClear=o}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const te={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Nt extends O{constructor(){super(),this.isOutputPass=!0,this.uniforms=Z.clone(te.uniforms),this.material=new tt({name:te.name,uniforms:this.uniforms,vertexShader:te.vertexShader,fragmentShader:te.fragmentShader}),this._fsQuad=new ne(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},st.getTransfer(this._outputColorSpace)===ot&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===at?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===rt?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===it?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ve?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===nt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===lt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ct&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const g=new Map;function k(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function F(i,e=[1,1]){const t=new ht(i.canvas);return t.wrapS=ie,t.wrapT=ie,t.repeat.set(e[0],e[1]),t.colorSpace=Qe,t.anisotropy=4,t}function le(i,e){const{width:t,height:s}=i.canvas;for(let a=0;a<e.count;a+=1){const o=e.colors[Math.floor(Math.random()*e.colors.length)],r=e.minSize+Math.random()*(e.maxSize-e.minSize);i.globalAlpha=e.alpha*(.5+Math.random()*.5),i.fillStyle=o,i.beginPath();const n=Math.random()*t,l=Math.random()*s;e.horizontal?i.ellipse(n,l,r,r*(.25+Math.random()*.35),0,0,Math.PI*2):i.ellipse(n,l,r*(.3+Math.random()*.3),r,0,0,Math.PI*2),i.fill()}i.globalAlpha=1}function Ee(){const i=g.get("bark");if(i)return i;const e=k(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let a=0;a<90;a+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const o=Math.random()*256;e.moveTo(o,0);for(let r=0;r<=512;r+=32)e.lineTo(o+Math.sin(r*.02+a)*5,r);e.stroke()}e.globalAlpha=1,le(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=F(e,[2,1]);return g.set("bark",s),s}function Be(){const i=g.get("foliage");if(i)return i;const e=k(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),le(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=F(e,[2,2]);return g.set("foliage",t),t}function zt(){const i=g.get("grass");if(i)return i;const e=k(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),le(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const a=Math.random()*512,o=Math.random()*512;e.beginPath(),e.moveTo(a,o),e.lineTo(a+(Math.random()-.5)*8,o-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=F(e,[10,10]);return g.set("grass",t),t}function Lt(){const i=g.get("cloth");if(i)return i;const e=k(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const a=Math.random()*256;e.moveTo(a,0),e.bezierCurveTo(a+20,80,a-20,170,a+10,256),e.stroke()}e.globalAlpha=1,le(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=F(e,[2,2]);return g.set("cloth",t),t}function It(){const i=g.get("leaf");if(i)return i;const e=k(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=F(e);return s.wrapS=re,s.wrapT=re,g.set("leaf",s),s}function Ot(){for(const i of g.values())i.dispose();g.clear()}function Gt(){const i=g.get("grain");if(i)return i;const e=k(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let a=0;a<t.data.length;a+=4){const o=128+(Math.random()-.5)*70;t.data[a]=o,t.data[a+1]=o,t.data[a+2]=o}e.putImageData(t,0,0);const s=F(e,[8,8]);return g.set("grain",s),s}function Vt(){const i=g.get("shaft");if(i)return i;const e=k(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let a=0;a<160;a+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const o=Math.random()*512,r=6+Math.random()*26;e.fillRect(0,o,r,10+Math.random()*40),e.fillRect(128-r,o,r,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=F(e);return s.wrapS=re,s.wrapT=re,g.set("shaft",s),s}function Qt(){const i=g.get("mist");if(i)return i;const e=k(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let a=0;a<220;a+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const o=Math.random()*512,r=Math.random()*128;e.beginPath(),e.ellipse(o,r,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=F(e,[2,1]);return g.set("mist",s),s}function Wt(){const i=g.get("stroke-angle");if(i)return i;const e=k(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const a=Math.random()*256,o=Math.random()*256,r=12+Math.random()*46,n=Math.random()*255,l=e.createRadialGradient(a,o,0,a,o,r);l.addColorStop(0,`rgba(${n}, ${n}, ${n}, 0.55)`),l.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=l,e.fillRect(a-r,o-r,r*2,r*2)}const t=F(e,[1,1]);return t.wrapS=ie,t.wrapT=ie,g.set("stroke-angle",t),t}function Ne(){const i=g.get("fur");if(i)return i;const e=k(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const a=Math.random()*256,o=Math.random()*256,r=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(a,o),e.lineTo(a+(Math.random()-.5)*5,o+r),e.stroke()}e.globalAlpha=1;const t=F(e,[3,3]);return g.set("fur",t),t}const Ht={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new _(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
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
  `};class jt{constructor(e,t,s,a){this.renderer=e,this.scene=t,this.camera=s,this.composer=new kt(e),this.renderPass=new Ft(t,s),this.composer.addPass(this.renderPass),a.quality!=="low"?(this.bloom=new Q(new _(1,1),.32,.7,.88),this.composer.addPass(this.bloom)):this.bloom=null,a.quality==="high"?(this.bokeh=new Bt(t,s,{focus:14,aperture:.0013,maxblur:.008}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new Ze(Ht),this.painterly.uniforms.tAngle.value=Wt(),this.painterly.uniforms.uLength.value=a.quality==="high"?13:9,this.painterly.uniforms.uStrength.value=a.quality==="high"?.6:.52,this.composer.addPass(this.painterly),this.composer.addPass(new Nt)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const w={sky:12575970,fog:3364442,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:6581056,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Ke=42,de=1.45,ae=1;function ze(i,e){const t=Math.hypot(e+7.4,de-ae),s=Math.tan(Ke/2*(Math.PI/180))*t;return{width:s*i,height:s}}function A(i){const e=i.map(s=>{const a=s.geometry.clone();return a.applyMatrix4(new We().compose(new D(...s.position??[0,0,0]),new He().setFromEuler(new je(...s.rotation??[0,0,0])),new D(...s.scale??[1,1,1]))),a.index?a.toNonIndexed():a}),t=wt(e,!1)??new Ie;for(const s of e)s.dispose();for(const s of i)s.geometry.dispose();return t}function H(i){return new U({color:i.color,map:i.map,roughness:i.roughness??.92,metalness:0})}function fe(i,e,t){const s=[];for(let r=0;r<=14;r+=1){const n=r/14,l=1+Math.pow(1-n,3)*1.35,p=1-n*.42,c=1+Math.sin(n*Math.PI*3)*.035;s.push(new _(e*p*l*c,n*i))}const o=new Ye(s,32);return o.computeVertexNormals(),new u(o,t)}function Yt(i,e,t){const s=[];let a=t;const o=()=>(a=a*16807%2147483647,a/2147483647);for(let r=0;r<6;r+=1){const n=o()*Math.PI*2,l=o()*i*.55,p=i*(.42+o()*.3);s.push({geometry:new S(p,12,9),position:[Math.cos(n)*l,(o()-.35)*i*.45,Math.sin(n)*l],scale:[1.05,.85+o()*.25,1.05]})}return new u(A(s),e)}function Zt(){const e=new R,t=new U({color:w.lionBody,roughness:.9,metalness:0}),s=new U({color:w.lionBodyDark,roughness:.92,metalness:0}),a=new U({color:w.lionMane,roughness:.98,metalness:0,bumpMap:Ne(),bumpScale:.06}),o=new U({color:w.lionManeLight,roughness:.98,metalness:0,bumpMap:Ne(),bumpScale:.05});new U({color:w.muzzle,roughness:.85,metalness:0});const r=new U({color:w.face,roughness:.45,metalness:0});e.add(new u(A([{geometry:new y(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new y(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new S(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new S(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new S(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),t));const n=[],l=[];for(const d of[-.24,.24]){n.push({geometry:new J(.095,.115,.98,12),position:[d,.52,.22]}),l.push({geometry:new S(.14,12,10),position:[d,.09,.3],scale:[1.05,.62,1.5]});for(const M of[-.06,0,.06])l.push({geometry:new S(.045,8,6),position:[d+M,.05,.46]})}for(const d of[-.44,.44])n.push({geometry:new J(.115,.135,.52,12),position:[d,.3,-.18],rotation:[1,0,0]}),l.push({geometry:new S(.15,12,10),position:[d,.09,.06],scale:[1.1,.62,1.6]});e.add(new u(A(n),t)),e.add(new u(A(l),s));const p=new u(new S(.44,26,20),t);p.position.set(0,1,.16),p.scale.set(1,1.15,.95),e.add(p);const c=new R;c.position.set(0,1.78,.14),c.add(new u(A([{geometry:new S(.29,26,20),scale:[1,.96,1.06]},{geometry:new J(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new S(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new Re(.34,.05,.14),position:[0,.12,.24]}]),t)),c.add(new u(new ke(.075,.1,3),r).translateY(0).translateZ(0));const h=c.children[c.children.length-1];h.position.set(0,-.08,.47),h.rotation.set(Math.PI/2,0,Math.PI),c.add(new u(new Re(.13,.012,.08),r).translateY(0).translateZ(0)),c.children[c.children.length-1].position.set(0,-.22,.4),c.add(new u(A([{geometry:new S(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new S(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),r));const C=[{geometry:new y(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new y(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new y(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new y(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new y(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new y(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new y(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new y(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new y(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new y(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],x=[{geometry:new y(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new y(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new y(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];c.add(new u(A(C),a)),c.add(new u(A(x),o));const T=[];for(const d of[-.23,.23]){const M=new u(new ke(.095,.17,5),o);M.position.set(d,.3,.06),M.rotation.z=d<0?.4:-.4,c.add(M),T.push(M)}e.add(c);const b=[];let z=e;for(let d=0;d<2;d+=1){const M=new R;M.position.set(0,d===0?.5:.02,d===0?-.94:-.3);const N=new u(new J(.07-d*.012,.08-d*.012,.32,10),t);if(N.rotation.x=Math.PI/2+.5,N.position.z=-.16,M.add(N),d===1){const E=new u(new y(.11,0),a);E.scale.set(.9,1.5,.9),E.position.set(0,-.18,-.3),M.add(E)}z.add(M),z=M,b.push(M)}return e.scale.setScalar(1.16),{group:e,head:c,headBaseY:1.34,tail:b,ears:T,chest:p}}function Kt(){const i=new R,e=H({color:w.cloth,map:Lt(),roughness:.95}),t=new U({color:w.clothDark,roughness:.9,metalness:0}),s=[],a=16;for(let c=0;c<=a;c+=1){const h=c/a,v=.16+Math.pow(h,1.5)*.3+Math.sin(h*Math.PI)*.05;s.push(new _(v,1.02-h*1))}const o=new Ye(s,32);o.computeVertexNormals();const r=new u(o,e);i.add(r);const n=new u(new S(.18,16,12),e);n.scale.set(1,1.12,1.08),n.position.set(0,1.06,.01),i.add(n);const l=new u(new S(.2,14,11),e);l.scale.set(1.5,.6,.9),l.position.set(0,.92,0),i.add(l);const p=new u(new S(.1,12,10),t);return p.scale.set(1,1.15,.6),p.position.set(0,1.05,.13),i.add(p),i.scale.setScalar(.68),{group:i,cloak:r,basePositions:Float32Array.from(o.attributes.position.array)}}function qt(i){const e=new V(.17,.24),t=new U({map:It(),transparent:!0,alphaTest:.4,side:se,roughness:1,metalness:0}),s=new Mt(e,t,i);s.frustumCulled=!1;const a=new Float32Array(i*6);for(let o=0;o<i;o+=1)a[o*6+0]=-6+Math.random()*12,a[o*6+1]=.4+Math.random()*4.8,a[o*6+2]=-5+Math.random()*10,a[o*6+3]=.5+Math.random()*1.2,a[o*6+4]=Math.random()*Math.PI*2,a[o*6+5]=(Math.random()-.5)*3;return{mesh:s,state:a}}function Xt(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const i=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!i&&e>=4?"high":e>=4?"medium":"low"}class es{constructor(e){this.canvas=e,this.renderer=new ut({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=ft,this.renderer.toneMapping=Ve,this.renderer.toneMappingExposure=1.12,this.scene.background=new B(w.sky),this.scene.fog=new dt(w.fog,16,30),this.camera=new pt(Ke,2/3,.1,90),this.camera.position.set(0,de,7.4),this.camera.lookAt(0,ae,0);const t=Gt();this.scene.add(new mt(14479344,3498094,1.05));const s=new Ae(16761976,1.15);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const a=new Ae(8832742,1.5);a.position.set(-5,3,5),this.scene.add(a);const o=new gt(16767392,13,12,Math.PI/9,.8,1.6);o.position.set(-1.4,4.2,4.6),o.target.position.set(-.3,1,1.6),this.scene.add(o),this.scene.add(o.target);const r=new V(70,40,1,8),n=r.attributes.position,l=new Float32Array(n.count*3),p=new B(w.sky),c=new B(w.fog);for(let f=0;f<n.count;f+=1){const P=(n.getY(f)+20)/40,m=c.clone().lerp(p,P);l[f*3]=m.r,l[f*3+1]=m.g,l[f*3+2]=m.b}r.setAttribute("color",new Ue(l,3));const h=new W({vertexColors:!0,fog:!1,side:se}),v=new u(r,h);v.position.set(0,8,-22),this.addForest(v),this.disposables.push(r,h);const C=new V(46,46,18,18),x=C.attributes.position,T=new Float32Array(x.count*3),b=new B;for(let f=0;f<x.count;f+=1){const P=x.getX(f),m=x.getY(f);x.setZ(f,Math.sin(P*.28)*.09+Math.cos(m*.24)*.07);const L=(Math.sin(P*.5)+Math.cos(m*.42))*.5,G=L>.35?1.16:L<-.35?.82:1,$=Math.min(1,Math.max(0,m/23));b.setHex(w.grass).multiplyScalar(G*(1-$*.3)),T[f*3]=b.r,T[f*3+1]=b.g,T[f*3+2]=b.b}C.setAttribute("color",new Ue(T,3)),C.computeVertexNormals();const z=new U({map:zt(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),d=new u(C,z);d.rotation.x=-Math.PI/2,d.receiveShadow=!0,this.scene.add(d),this.disposables.push(C,z);const M=H({color:w.bark,map:Ee()}),N=H({color:w.barkFar,map:Ee(),roughness:1}),E=H({color:w.foliage,map:Be(),roughness:1}),ce=H({color:w.foliageFar,map:Be(),roughness:1});this.disposables.push(M,N,E,ce);const K=new R;K.name="leftFrame";const pe=fe(13,.6,M);pe.castShadow=!0,K.add(pe),K.add(this.placeCanopy(11.6,1.05,E,7)),this.addForest(K);const q=new R;q.name="rightFrame";const me=fe(13.6,.66,N);me.castShadow=!0,q.add(me),q.add(this.placeCanopy(12.2,1.1,E,11)),this.addForest(q);const qe=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],ge=[],ve=[];qe.forEach(([f,P,m],L)=>{const G=fe(m,m*.05,N).geometry.clone();G.translate(f,0,P),ge.push({geometry:G});const $=this.placeCanopy(m*.92,m*.16,ce,L*13+5),_e=$.geometry.clone();_e.translate(f,m*.92,P),ve.push({geometry:_e}),$.geometry.dispose()});const xe=new u(A(ge),N);xe.name="farTrunks";const be=new u(A(ve),ce);be.name="farCanopies",this.addForest(xe),this.addForest(be);const X=new R;X.name="canopyTop",X.add(this.placeCanopy(0,.55,E,3)),this.addForest(X),this.foliage.push(X);for(const[f,P]of[["canopyleft",-1],["canopyright",1]]){const m=new R;m.name=f,m.add(this.placeCanopy(0,.7,E,P<0?17:23)),this.addForest(m),this.foliage.push(m)}const we=new W({map:Vt(),transparent:!0,blending:Ge,depthWrite:!1,side:se,opacity:.85}),Me=[];for(const[f,P,m,L,G]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])Me.push({geometry:new V(m,L),position:[f,L/2-.4,P],rotation:[0,0,G]});const ye=new u(A(Me),we);ye.renderOrder=2,this.addForest(ye),this.disposables.push(we);const Ce=new W({map:Qt(),transparent:!0,depthWrite:!1,side:se,opacity:.55}),Te=[];for(const[f,P,m]of[[-6,.7,1.6],[-12,1.1,2.2]])Te.push({geometry:new V(26*m,3.4*m),position:[0,P,f]});const Se=new u(A(Te),Ce);Se.renderOrder=1,this.addForest(Se),this.disposables.push(Ce),this.lion=Zt(),this.lion.group.position.set(-.3,0,1.6),this.lion.group.rotation.y=-.12,this.lion.group.scale.setScalar(.85),this.lion.group.traverse(f=>{f instanceof u&&(f.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=Kt(),this.traveler.group.position.set(.35,0,2.6),this.traveler.group.rotation.y=Math.PI-.25,this.traveler.group.scale.setScalar(.6),this.traveler.group.traverse(f=>{f instanceof u&&(f.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=qt(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new jt(this.renderer,this.scene,this.camera,{quality:Xt()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.loadPaintedAssets(),this.animate()}renderer;postfx;scene=new vt;camera;clock=new xt;lion;forest=[];backdropPlane=null;loaded={painted:!1,lion:!1};traveler;leaves;foliage=[];matrix=new We;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get assets(){return{...this.loaded}}get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,a){const o=Yt(t,s,a);return o.position.y=e,o}alignToNdc(e,t,s,a){e.position.z=a;const o=new D;for(let r=0;r<8;r+=1){e.getWorldPosition(o),o.project(this.camera);const{width:n,height:l}=ze(this.camera.aspect,a);e.position.x+=(t-o.x)*n*.85,e.position.y+=(s-o.y)*l*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const a=this.scene.getObjectByName("canopyTop");a&&this.alignToNdc(a,0,1.06,-1.2-.6);for(const[o,r]of[["canopyleft",-1],["canopyright",1]]){const n=this.scene.getObjectByName(o);n&&this.alignToNdc(n,r*.9,.92,-1.2)}}addForest(e){this.scene.add(e),this.forest.push(e)}loadPaintedAssets(){const e="./";new bt().load(`${e}title/backdrop.webp`,t=>{t.colorSpace=Qe;const s=new W({map:t,fog:!1,toneMapped:!1});s.color.setScalar(1.45);const a=new V(1,1),o=new u(a,s);o.name="paintedBackdrop",o.renderOrder=-1,o.userData.depth=13.5,this.scene.add(o),this.backdropPlane=o,this.disposables.push(a,s,t),this.loaded.painted=!0,this.placeBackdrop();for(const r of this.forest)r.visible=!1},void 0,()=>{}),Pt(`${e}models/lion.glb`,1.75).then(t=>{t.group.position.copy(this.lion.group.position),t.group.rotation.copy(this.lion.group.rotation),t.group.scale.copy(this.lion.group.scale),this.scene.remove(this.lion.group),this.lion=t,this.loaded.lion=!0,this.scene.add(t.group)}).catch(()=>{})}placeBackdrop(){const e=this.backdropPlane;if(!e)return;const t=Number(e.userData.depth??13.5),s=ze(this.camera.aspect,t);e.scale.set(s.width*2.1,s.height*2.1,1),e.position.set(0,ae,-t),e.lookAt(this.camera.position)}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const a=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,de+Math.max(0,s-1)*.4,a),this.camera.lookAt(0,ae,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout(),this.placeBackdrop()}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4;const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=this.lion.headBaseY+Math.sin(t*2.1)*.014,this.lion.ears.forEach((c,h)=>{const v=Math.max(0,Math.sin(t*.9+h*2.1)-.93)*12;c.rotation.z=(h===0?.34:-.34)+v*(h===0?1:-1)}),this.lion.tail.forEach((c,h)=>{c.rotation.y=Math.sin(t*1.1-h*.5)*(.12+h*.05)*(.8+this.wind*.6),c.rotation.x=-.1+Math.sin(t*.8-h*.4)*.08});const a=this.traveler.cloak,o=a.geometry.attributes.position,r=this.traveler.basePositions;for(let c=0;c<o.count;c+=1){const h=r[c*3]??0,v=r[c*3+1]??0,C=r[c*3+2]??0,x=Math.max(0,.55-v)/.55,T=Math.atan2(C,h),b=this.wind*(.14+.06*Math.sin(t*2.6+T*3));o.setXYZ(c,h+Math.sin(T)*x*b+Math.sin(t*3+T*2)*x*.014,v-Math.abs(b)*x*.07,C+Math.cos(T)*x*b+Math.cos(t*2.4+T*2)*x*.014)}o.needsUpdate=!0,a.geometry.computeVertexNormals(),this.foliage.forEach((c,h)=>{c.rotation.z=Math.sin(t*.9+h)*.028*(.6+this.wind)});const{mesh:n,state:l}=this.leaves,p=l.length/6;for(let c=0;c<p;c+=1){const h=c*6;let v=l[h]??0,C=l[h+1]??0,x=l[h+2]??0;const T=l[h+3]??1,b=l[h+4]??0,z=l[h+5]??1;v+=(T*(.6+this.wind)+.35)*e*1.7,C+=Math.sin(t*1.6+b)*e*.5,x+=Math.cos(t*1.1+b)*e*.3,v>8&&(v=-8,C=.4+Math.random()*4.8,x=-5+Math.random()*10),l[h]=v,l[h+1]=C,l[h+2]=x;const d=.85+Math.sin(t*2+b)*.15;this.matrix.compose(new D(v,C,x),new He().setFromEuler(new je(t*z,b+t*.8,Math.sin(t*1.5+b)*.7)),new D(d,d,d)),n.setMatrixAt(c,this.matrix)}n.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof u))return;e+=1;const a=s.geometry,o=a.getAttribute("position"),r=a.getIndex();r?t+=r.count/3:o&&(t+=o.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new D;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof u){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),Ot(),this.renderer.dispose()}}export{w as TITLE_PALETTE,es as TitleScene};
//# sourceMappingURL=titleScene-HJxGg2An.js.map
