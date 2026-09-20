import{M as d,O as Qe,B as Ee,F as Ce,S as I,U as j,V as _,W,H,N as ke,T as We,C as F,a as A,A as Fe,b as J,c as ye,d as He,R as je,e as Ze,f as Ke,g as qe,L as Xe,h as Ye,i as $e,j as Be,k as Je,l as et,m as tt,n as se,o as st,p as oe,q as ot,r as at,P as rt,s as it,t as nt,u as lt,D as Te,v as V,w as Se,x as ee,y as U,G as z,z as ct,E as ht,I as ze,Q as Ne,J as Ie,K as Le,X as ut,Y as M,Z as S,_ as X,$ as _e,a0 as Pe,a1 as ft}from"./BufferGeometryUtils-BgmLo8JV.js";const te={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class L{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const dt=new Qe(-1,1,1,-1,0,1);class pt extends Ee{constructor(){super(),this.setAttribute("position",new Ce([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ce([0,2,0,0,2,0],2))}}const mt=new pt;class ae{constructor(e){this._mesh=new d(mt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,dt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Oe extends L{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof I?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=j.clone(e.uniforms),this.material=new I({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ae(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class De extends L{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const a=e.getContext(),o=e.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),o.buffers.stencil.setFunc(a.ALWAYS,r,4294967295),o.buffers.stencil.setClear(n),o.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(a.EQUAL,1,4294967295),o.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),o.buffers.stencil.setLocked(!0)}}class gt extends L{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class vt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new _);this._width=s.width,this._height=s.height,t=new W(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:H}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Oe(te),this.copyPass.material.blending=ke,this.timer=new We}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let a=0,o=this.passes.length;a<o;a++){const r=this.passes[a];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}De!==void 0&&(r instanceof De?s=!0:r instanceof gt&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new _);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(s,a),this.renderTarget2.setSize(s,a);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(s,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class xt extends L{constructor(e,t,s=null,a=null,o=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=a,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new F}render(e,t,s){const a=e.autoClear;e.autoClear=!1;let o,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(o=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(o),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=a}}const bt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new F(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class G extends L{constructor(e,t=1,s,a){super(),this.strength=t,this.radius=s,this.threshold=a,this.resolution=e!==void 0?new _(e.x,e.y):new _(256,256),this.clearColor=new F(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let o=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new W(o,r,{type:H,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const h=new W(o,r,{type:H,depthBuffer:!1});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const p=new W(o,r,{type:H,depthBuffer:!1});p.texture.name="UnrealBloomPass.v"+c,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),o=Math.round(o/2),r=Math.round(r/2)}const n=bt;this.highPassUniforms=j.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new I({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];o=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new _(1/o,1/r),o=Math.round(o/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=j.clone(te.uniforms),this.blendMaterial=new I({uniforms:this.copyUniforms,vertexShader:te.vertexShader,fragmentShader:te.fragmentShader,premultipliedAlpha:!0,blending:Fe,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new F,this._oldClearAlpha=1,this._basic=new J,this._fsQuad=new ae(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(s,a);for(let o=0;o<this.nMips;o++)this.renderTargetsHorizontal[o].setSize(s,a),this.renderTargetsVertical[o].setSize(s,a),this.separableBlurMaterials[o].uniforms.invSize.value=new _(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2)}render(e,t,s,a,o){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),o&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=G.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=G.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,o&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);const a=[],o=[];for(let r=1;r<e;r+=2){const n=t[r],l=r+1<e?t[r+1]:0,u=n+l;a.push((r*n+(r+1)*l)/u),o.push(u)}return new I({defines:{KERNEL_PAIRS:a.length},uniforms:{colorTexture:{value:null},invSize:{value:new _(.5,.5)},direction:{value:new _(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:a},gaussianWeights:{value:o}},vertexShader:`

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

				}`})}}G.BlurDirectionX=new _(1,0);G.BlurDirectionY=new _(0,1);const Y={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};class wt extends L{constructor(e,t,s){super(),this.scene=e,this.camera=t;const a=s.focus!==void 0?s.focus:1,o=s.aperture!==void 0?s.aperture:.025,r=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new W(1,1,{minFilter:ye,magFilter:ye,type:H}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new He,this._materialDepth.depthPacking=je,this._materialDepth.blending=ke;const n=j.clone(Y.uniforms);n.tDepth.value=this._renderTargetDepth.texture,n.focus.value=a,n.aspect.value=t.aspect,n.aperture.value=o,n.maxblur.value=r,n.nearClip.value=t.near,n.farClip.value=t.far,this.materialBokeh=new I({defines:Object.assign({},Y.defines),uniforms:n,vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader}),this.uniforms=n,this._fsQuad=new ae(this.materialBokeh),this._oldClearColor=new F}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(a),e.autoClear=o}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const $={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Mt extends L{constructor(){super(),this.isOutputPass=!0,this.uniforms=j.clone($.uniforms),this.material=new Ze({name:$.name,uniforms:this.uniforms,vertexShader:$.vertexShader,fragmentShader:$.fragmentShader}),this._fsQuad=new ae(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ke.getTransfer(this._outputColorSpace)===qe&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Xe?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Ye?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===$e?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Be?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Je?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===et?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===tt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const v=new Map;function R(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function E(i,e=[1,1]){const t=new st(i.canvas);return t.wrapS=oe,t.wrapT=oe,t.repeat.set(e[0],e[1]),t.colorSpace=ot,t.anisotropy=4,t}function re(i,e){const{width:t,height:s}=i.canvas;for(let a=0;a<e.count;a+=1){const o=e.colors[Math.floor(Math.random()*e.colors.length)],r=e.minSize+Math.random()*(e.maxSize-e.minSize);i.globalAlpha=e.alpha*(.5+Math.random()*.5),i.fillStyle=o,i.beginPath();const n=Math.random()*t,l=Math.random()*s;e.horizontal?i.ellipse(n,l,r,r*(.25+Math.random()*.35),0,0,Math.PI*2):i.ellipse(n,l,r*(.3+Math.random()*.3),r,0,0,Math.PI*2),i.fill()}i.globalAlpha=1}function Ae(){const i=v.get("bark");if(i)return i;const e=R(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let a=0;a<90;a+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const o=Math.random()*256;e.moveTo(o,0);for(let r=0;r<=512;r+=32)e.lineTo(o+Math.sin(r*.02+a)*5,r);e.stroke()}e.globalAlpha=1,re(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=E(e,[2,1]);return v.set("bark",s),s}function Ue(){const i=v.get("foliage");if(i)return i;const e=R(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),re(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=E(e,[2,2]);return v.set("foliage",t),t}function Ct(){const i=v.get("grass");if(i)return i;const e=R(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),re(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const a=Math.random()*512,o=Math.random()*512;e.beginPath(),e.moveTo(a,o),e.lineTo(a+(Math.random()-.5)*8,o-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=E(e,[10,10]);return v.set("grass",t),t}function yt(){const i=v.get("cloth");if(i)return i;const e=R(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const a=Math.random()*256;e.moveTo(a,0),e.bezierCurveTo(a+20,80,a-20,170,a+10,256),e.stroke()}e.globalAlpha=1,re(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=E(e,[2,2]);return v.set("cloth",t),t}function Tt(){const i=v.get("leaf");if(i)return i;const e=R(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=E(e);return s.wrapS=se,s.wrapT=se,v.set("leaf",s),s}function St(){for(const i of v.values())i.dispose();v.clear()}function _t(){const i=v.get("grain");if(i)return i;const e=R(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let a=0;a<t.data.length;a+=4){const o=128+(Math.random()-.5)*70;t.data[a]=o,t.data[a+1]=o,t.data[a+2]=o}e.putImageData(t,0,0);const s=E(e,[8,8]);return v.set("grain",s),s}function Pt(){const i=v.get("shaft");if(i)return i;const e=R(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let a=0;a<160;a+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const o=Math.random()*512,r=6+Math.random()*26;e.fillRect(0,o,r,10+Math.random()*40),e.fillRect(128-r,o,r,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=E(e);return s.wrapS=se,s.wrapT=se,v.set("shaft",s),s}function Dt(){const i=v.get("mist");if(i)return i;const e=R(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let a=0;a<220;a+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const o=Math.random()*512,r=Math.random()*128;e.beginPath(),e.ellipse(o,r,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=E(e,[2,1]);return v.set("mist",s),s}function At(){const i=v.get("stroke-angle");if(i)return i;const e=R(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const a=Math.random()*256,o=Math.random()*256,r=12+Math.random()*46,n=Math.random()*255,l=e.createRadialGradient(a,o,0,a,o,r);l.addColorStop(0,`rgba(${n}, ${n}, ${n}, 0.55)`),l.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=l,e.fillRect(a-r,o-r,r*2,r*2)}const t=E(e,[1,1]);return t.wrapS=oe,t.wrapT=oe,v.set("stroke-angle",t),t}function Re(){const i=v.get("fur");if(i)return i;const e=R(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const a=Math.random()*256,o=Math.random()*256,r=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(a,o),e.lineTo(a+(Math.random()-.5)*5,o+r),e.stroke()}e.globalAlpha=1;const t=E(e,[3,3]);return v.set("fur",t),t}const Ut={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new _(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
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
  `};class Rt{constructor(e,t,s,a){this.renderer=e,this.scene=t,this.camera=s,this.composer=new vt(e),this.renderPass=new xt(t,s),this.composer.addPass(this.renderPass),a.quality!=="low"?(this.bloom=new G(new _(1,1),.42,.7,.82),this.composer.addPass(this.bloom)):this.bloom=null,a.quality==="high"?(this.bokeh=new wt(t,s,{focus:8.5,aperture:.0022,maxblur:.012}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new Oe(Ut),this.painterly.uniforms.tAngle.value=At(),this.painterly.uniforms.uLength.value=a.quality==="high"?16:10,this.painterly.uniforms.uStrength.value=a.quality==="high"?.82:.7,this.composer.addPass(this.painterly),this.composer.addPass(new Mt)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const w={sky:12575970,fog:8369848,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:15134930,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Ge=42,le=1.45,ce=1;function Et(i,e){const t=Math.hypot(e+7.4,le-ce),s=Math.tan(Ge/2*(Math.PI/180))*t;return{width:s*i,height:s}}function D(i){const e=i.map(s=>{const a=s.geometry.clone();return a.applyMatrix4(new ze().compose(new A(...s.position??[0,0,0]),new Ne().setFromEuler(new Ie(...s.rotation??[0,0,0])),new A(...s.scale??[1,1,1]))),a.index?a.toNonIndexed():a}),t=ut(e,!1)??new Ee;for(const s of e)s.dispose();for(const s of i)s.geometry.dispose();return t}function Q(i){return new U({color:i.color,map:i.map,roughness:i.roughness??.92,metalness:0})}function ne(i,e,t){const s=[];for(let r=0;r<=14;r+=1){const n=r/14,l=1+Math.pow(1-n,3)*1.35,u=1-n*.42,c=1+Math.sin(n*Math.PI*3)*.035;s.push(new _(e*u*l*c,n*i))}const o=new Le(s,32);return o.computeVertexNormals(),new d(o,t)}function kt(i,e,t){const s=[];let a=t;const o=()=>(a=a*16807%2147483647,a/2147483647);for(let r=0;r<6;r+=1){const n=o()*Math.PI*2,l=o()*i*.55,u=i*(.42+o()*.3);s.push({geometry:new S(u,12,9),position:[Math.cos(n)*l,(o()-.35)*i*.45,Math.sin(n)*l],scale:[1.05,.85+o()*.25,1.05]})}return new d(D(s),e)}function Ft(){const i=new z,e=new U({color:w.lionBody,roughness:.9,metalness:0}),t=new U({color:w.lionBodyDark,roughness:.92,metalness:0}),s=new U({color:w.lionMane,roughness:.98,metalness:0,bumpMap:Re(),bumpScale:.06}),a=new U({color:w.lionManeLight,roughness:.98,metalness:0,bumpMap:Re(),bumpScale:.05});new U({color:w.muzzle,roughness:.85,metalness:0});const o=new U({color:w.face,roughness:.45,metalness:0});i.add(new d(D([{geometry:new M(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new M(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new S(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new S(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new S(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),e));const r=[],n=[];for(const m of[-.24,.24]){r.push({geometry:new X(.095,.115,.98,12),position:[m,.52,.22]}),n.push({geometry:new S(.14,12,10),position:[m,.09,.3],scale:[1.05,.62,1.5]});for(const x of[-.06,0,.06])n.push({geometry:new S(.045,8,6),position:[m+x,.05,.46]})}for(const m of[-.44,.44])r.push({geometry:new X(.115,.135,.52,12),position:[m,.3,-.18],rotation:[1,0,0]}),n.push({geometry:new S(.15,12,10),position:[m,.09,.06],scale:[1.1,.62,1.6]});i.add(new d(D(r),e)),i.add(new d(D(n),t));const l=new d(new S(.44,26,20),e);l.position.set(0,1,.16),l.scale.set(1,1.15,.95),i.add(l);const u=new z;u.position.set(0,1.78,.14),u.add(new d(D([{geometry:new S(.29,26,20),scale:[1,.96,1.06]},{geometry:new X(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new S(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new _e(.34,.05,.14),position:[0,.12,.24]}]),e)),u.add(new d(new Pe(.075,.1,3),o).translateY(0).translateZ(0));const c=u.children[u.children.length-1];c.position.set(0,-.08,.47),c.rotation.set(Math.PI/2,0,Math.PI),u.add(new d(new _e(.13,.012,.08),o).translateY(0).translateZ(0)),u.children[u.children.length-1].position.set(0,-.22,.4),u.add(new d(D([{geometry:new S(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new S(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),o));const p=[{geometry:new M(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new M(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new M(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new M(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new M(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new M(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new M(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new M(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new M(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new M(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],C=[{geometry:new M(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new M(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new M(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];u.add(new d(D(p),s)),u.add(new d(D(C),a));const b=[];for(const m of[-.23,.23]){const x=new d(new Pe(.095,.17,5),a);x.position.set(m,.3,.06),x.rotation.z=m<0?.4:-.4,u.add(x),b.push(x)}i.add(u);const y=[];let T=i;for(let m=0;m<2;m+=1){const x=new z;x.position.set(0,m===0?.5:.02,m===0?-.94:-.3);const B=new d(new X(.07-m*.012,.08-m*.012,.32,10),e);if(B.rotation.x=Math.PI/2+.5,B.position.z=-.16,x.add(B),m===1){const k=new d(new M(.11,0),s);k.scale.set(.9,1.5,.9),k.position.set(0,-.18,-.3),x.add(k)}T.add(x),T=x,y.push(x)}return i.scale.setScalar(1.16),{group:i,head:u,tail:y,ears:b,chest:l}}function Bt(){const i=new z,e=Q({color:w.cloth,map:yt(),roughness:.95}),t=new U({color:w.clothDark,roughness:.9,metalness:0}),s=[],a=16;for(let c=0;c<=a;c+=1){const h=c/a,p=.16+Math.pow(h,1.5)*.3+Math.sin(h*Math.PI)*.05;s.push(new _(p,1.02-h*1))}const o=new Le(s,32);o.computeVertexNormals();const r=new d(o,e);i.add(r);const n=new d(new S(.18,16,12),e);n.scale.set(1,1.12,1.08),n.position.set(0,1.06,.01),i.add(n);const l=new d(new S(.2,14,11),e);l.scale.set(1.5,.6,.9),l.position.set(0,.92,0),i.add(l);const u=new d(new S(.1,12,10),t);return u.scale.set(1,1.15,.6),u.position.set(0,1.05,.13),i.add(u),i.scale.setScalar(.68),{group:i,cloak:r,basePositions:Float32Array.from(o.attributes.position.array)}}function zt(i){const e=new V(.17,.24),t=new U({map:Tt(),transparent:!0,alphaTest:.4,side:ee,roughness:1,metalness:0}),s=new ft(e,t,i);s.frustumCulled=!1;const a=new Float32Array(i*6);for(let o=0;o<i;o+=1)a[o*6+0]=-6+Math.random()*12,a[o*6+1]=.4+Math.random()*4.8,a[o*6+2]=-5+Math.random()*10,a[o*6+3]=.5+Math.random()*1.2,a[o*6+4]=Math.random()*Math.PI*2,a[o*6+5]=(Math.random()-.5)*3;return{mesh:s,state:a}}function Nt(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const i=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!i&&e>=4?"high":e>=4?"medium":"low"}class Lt{constructor(e){this.canvas=e,this.renderer=new at({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=rt,this.renderer.toneMapping=Be,this.renderer.toneMappingExposure=1.12,this.scene.background=new F(w.sky),this.scene.fog=new it(w.fog,6,22),this.camera=new nt(Ge,2/3,.1,90),this.camera.position.set(0,le,7.4),this.camera.lookAt(0,ce,0);const t=_t();this.scene.add(new lt(15267058,7180150,1));const s=new Te(16761976,2.1);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const a=new Te(10406884,.75);a.position.set(-5,3,5),this.scene.add(a);const o=new V(70,40,1,8),r=o.attributes.position,n=new Float32Array(r.count*3),l=new F(w.sky),u=new F(w.fog);for(let f=0;f<r.count;f+=1){const P=(r.getY(f)+20)/40,g=u.clone().lerp(l,P);n[f*3]=g.r,n[f*3+1]=g.g,n[f*3+2]=g.b}o.setAttribute("color",new Se(n,3));const c=new J({vertexColors:!0,fog:!1,side:ee}),h=new d(o,c);h.position.set(0,8,-22),this.scene.add(h),this.disposables.push(o,c);const p=new V(46,46,18,18),C=p.attributes.position,b=new Float32Array(C.count*3),y=new F;for(let f=0;f<C.count;f+=1){const P=C.getX(f),g=C.getY(f);C.setZ(f,Math.sin(P*.28)*.09+Math.cos(g*.24)*.07);const N=(Math.sin(P*.5)+Math.cos(g*.42))*.5,O=N>.35?1.16:N<-.35?.82:1;y.setHex(w.grass).multiplyScalar(O),b[f*3]=y.r,b[f*3+1]=y.g,b[f*3+2]=y.b}p.setAttribute("color",new Se(b,3)),p.computeVertexNormals();const T=new U({map:Ct(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),m=new d(p,T);m.rotation.x=-Math.PI/2,m.receiveShadow=!0,this.scene.add(m),this.disposables.push(p,T);const x=Q({color:w.bark,map:Ae()}),B=Q({color:w.barkFar,map:Ae(),roughness:1}),k=Q({color:w.foliage,map:Ue(),roughness:1}),ie=Q({color:w.foliageFar,map:Ue(),roughness:1});this.disposables.push(x,B,k,ie);const Z=new z;Z.name="leftFrame";const he=ne(13,.6,x);he.castShadow=!0,Z.add(he),Z.add(this.placeCanopy(11.6,1.05,k,7)),this.scene.add(Z);const K=new z;K.name="rightFrame";const ue=ne(13.6,.66,B);ue.castShadow=!0,K.add(ue),K.add(this.placeCanopy(12.2,1.1,k,11)),this.scene.add(K);const Ve=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],fe=[],de=[];Ve.forEach(([f,P,g],N)=>{const O=ne(g,g*.05,B).geometry.clone();O.translate(f,0,P),fe.push({geometry:O});const we=this.placeCanopy(g*.92,g*.16,ie,N*13+5),Me=we.geometry.clone();Me.translate(f,g*.92,P),de.push({geometry:Me}),we.geometry.dispose()}),this.scene.add(new d(D(fe),B)),this.scene.add(new d(D(de),ie));const q=new z;q.name="canopyTop",q.add(this.placeCanopy(0,.55,k,3)),this.scene.add(q),this.foliage.push(q);for(const[f,P]of[["canopyleft",-1],["canopyright",1]]){const g=new z;g.name=f,g.add(this.placeCanopy(0,.7,k,P<0?17:23)),this.scene.add(g),this.foliage.push(g)}const pe=new J({map:Pt(),transparent:!0,blending:Fe,depthWrite:!1,side:ee,opacity:.85}),me=[];for(const[f,P,g,N,O]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])me.push({geometry:new V(g,N),position:[f,N/2-.4,P],rotation:[0,0,O]});const ge=new d(D(me),pe);ge.renderOrder=2,this.scene.add(ge),this.disposables.push(pe);const ve=new J({map:Dt(),transparent:!0,depthWrite:!1,side:ee,opacity:.55}),xe=[];for(const[f,P,g]of[[-6,.7,1.6],[-12,1.1,2.2]])xe.push({geometry:new V(26*g,3.4*g),position:[0,P,f]});const be=new d(D(xe),ve);be.renderOrder=1,this.scene.add(be),this.disposables.push(ve),this.lion=Ft(),this.lion.group.position.set(-.85,0,.4),this.lion.group.rotation.y=-.18,this.lion.group.traverse(f=>{f instanceof d&&(f.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=Bt(),this.traveler.group.position.set(1.15,0,2.25),this.traveler.group.rotation.y=-.85,this.traveler.group.traverse(f=>{f instanceof d&&(f.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=zt(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new Rt(this.renderer,this.scene,this.camera,{quality:Nt()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.animate()}renderer;postfx;scene=new ct;camera;clock=new ht;lion;traveler;leaves;foliage=[];matrix=new ze;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,a){const o=kt(t,s,a);return o.position.y=e,o}alignToNdc(e,t,s,a){e.position.z=a;const o=new A;for(let r=0;r<8;r+=1){e.getWorldPosition(o),o.project(this.camera);const{width:n,height:l}=Et(this.camera.aspect,a);e.position.x+=(t-o.x)*n*.85,e.position.y+=(s-o.y)*l*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const a=this.scene.getObjectByName("canopyTop");a&&this.alignToNdc(a,0,1.06,-1.2-.6);for(const[o,r]of[["canopyleft",-1],["canopyright",1]]){const n=this.scene.getObjectByName(o);n&&this.alignToNdc(n,r*.9,.92,-1.2)}}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const a=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,le+Math.max(0,s-1)*.4,a),this.camera.lookAt(0,ce,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout()}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4;const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=1.34+Math.sin(t*2.1)*.014,this.lion.ears.forEach((c,h)=>{const p=Math.max(0,Math.sin(t*.9+h*2.1)-.93)*12;c.rotation.z=(h===0?.34:-.34)+p*(h===0?1:-1)}),this.lion.tail.forEach((c,h)=>{c.rotation.y=Math.sin(t*1.1-h*.5)*(.12+h*.05)*(.8+this.wind*.6),c.rotation.x=-.1+Math.sin(t*.8-h*.4)*.08});const a=this.traveler.cloak,o=a.geometry.attributes.position,r=this.traveler.basePositions;for(let c=0;c<o.count;c+=1){const h=r[c*3]??0,p=r[c*3+1]??0,C=r[c*3+2]??0,b=Math.max(0,.55-p)/.55,y=Math.atan2(C,h),T=this.wind*(.14+.06*Math.sin(t*2.6+y*3));o.setXYZ(c,h+Math.sin(y)*b*T+Math.sin(t*3+y*2)*b*.014,p-Math.abs(T)*b*.07,C+Math.cos(y)*b*T+Math.cos(t*2.4+y*2)*b*.014)}o.needsUpdate=!0,a.geometry.computeVertexNormals(),this.foliage.forEach((c,h)=>{c.rotation.z=Math.sin(t*.9+h)*.028*(.6+this.wind)});const{mesh:n,state:l}=this.leaves,u=l.length/6;for(let c=0;c<u;c+=1){const h=c*6;let p=l[h]??0,C=l[h+1]??0,b=l[h+2]??0;const y=l[h+3]??1,T=l[h+4]??0,m=l[h+5]??1;p+=(y*(.6+this.wind)+.35)*e*1.7,C+=Math.sin(t*1.6+T)*e*.5,b+=Math.cos(t*1.1+T)*e*.3,p>8&&(p=-8,C=.4+Math.random()*4.8,b=-5+Math.random()*10),l[h]=p,l[h+1]=C,l[h+2]=b;const x=.85+Math.sin(t*2+T)*.15;this.matrix.compose(new A(p,C,b),new Ne().setFromEuler(new Ie(t*m,T+t*.8,Math.sin(t*1.5+T)*.7)),new A(x,x,x)),n.setMatrixAt(c,this.matrix)}n.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof d))return;e+=1;const a=s.geometry,o=a.getAttribute("position"),r=a.getIndex();r?t+=r.count/3:o&&(t+=o.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new A;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof d){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),St(),this.renderer.dispose()}}export{w as TITLE_PALETTE,Lt as TitleScene};
//# sourceMappingURL=titleScene-DDEhIqNt.js.map
