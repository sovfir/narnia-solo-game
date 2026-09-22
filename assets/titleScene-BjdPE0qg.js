import{M as H,A as de,a as u,P as B,T as Je,G as z,V as P,S as he,L as et,C as Ge,b as T,O as tt,B as Ve,F as De,c as O,U as q,W as j,H as Y,N as He,d as st,e as N,f as Ae,g as ot,R as at,h as rt,i as it,j as nt,k as lt,l as ct,m as ht,n as Qe,o as ut,p as ft,q as dt,r as ae,s as re,t as pt,u as mt,v as gt,w as vt,x as xt,D as Re,y as bt,z as Ue,E as se,I as U,J as wt,K as Mt,Q as We,X as je,Y as Ye,Z as qe,_ as S,$ as _,a0 as J,a1 as Fe,a2 as Ee,a3 as yt}from"./three.module-C8PfI9-H.js";import{m as Ct}from"./BufferGeometryUtils-Bm5NXiWp.js";const Xe={forest:26,ground:15,lion:10,trunk_right:7.5,trunk_left:7,traveler:5.5},Tt=Object.entries(Xe).map(([i,e])=>({name:i,depth:e})),ke=.02,Be=12;class pe{constructor(e,t){this.camera=e,this.root.name="titlePlates",this.sunTexture=pe.sunTexture();const s=new H({map:this.sunTexture,transparent:!0,depthWrite:!1,fog:!1,blending:de,opacity:.18});this.sun=new u(new B(1,1),s),this.sun.name="plate_sun",this.sun.renderOrder=0,this.root.add(this.sun);const o=new Je;this.build(o,t),this.base=performance.now()}root=new z;plates=[];textures=[];sun;sunTexture;pointer=new P;drift=0;base=0;async build(e,t){let s=Tt;try{const o=await fetch(`${t.base}manifest.json`);if(o.ok){const a=await o.json();Array.isArray(a)&&a.length&&(s=a.map(r=>({name:r,depth:Xe[r]??12})))}}catch{}s=[...s].sort((o,a)=>a.depth-o.depth);for(const o of s){const a=new H({transparent:!0,depthWrite:!1,fog:!1,toneMapped:!1}),r=new u(new B(1,1),a);r.name=`plate_${o.name}`,r.renderOrder=s.indexOf(o),this.root.add(r),this.plates.push({mesh:r,material:a,depth:o.depth});const n=e.load(`${t.base}${o.name}.webp`,()=>{(o.name==="forest"||s.length===1)&&t.onReady?.()},void 0,()=>{this.root.remove(r);const l=this.plates.findIndex(d=>d.mesh===r);l>=0&&this.plates.splice(l,1),a.dispose()});n.colorSpace=he,n.minFilter=et,n.generateMipmaps=!1,a.map=n,this.textures.push(n)}this.layout()}static sunTexture(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(128,128,8,128,128,128);s.addColorStop(0,"rgba(255, 232, 178, 0.95)"),s.addColorStop(.45,"rgba(255, 206, 132, 0.35)"),s.addColorStop(1,"rgba(255, 190, 110, 0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const o=new Ge(e);return o.colorSpace=he,o}get object3d(){return this.root}setPointer(e,t){this.pointer.set(e,t)}layout(){const e=n=>Math.tan(this.camera.fov/2*(Math.PI/180))*n,t=new T,s=new T,o=new T;this.camera.getWorldDirection(t),s.crossVectors(t,this.camera.up).normalize(),o.crossVectors(s,t).normalize();for(const{mesh:n,depth:l}of this.plates){const d=e(l),c=d*this.camera.aspect,m=1+ke*(Be/l)*2+.02,g=n.geometry;(g.parameters.width!==2*c*m||g.parameters.height!==2*d*m)&&(n.geometry.dispose(),n.geometry=new B(2*c*m,2*d*m)),n.position.copy(this.camera.position).addScaledVector(t,l),n.quaternion.copy(this.camera.quaternion)}const a=9,r=e(a);this.sun.geometry.dispose(),this.sun.geometry=new B(r*this.camera.aspect*3.2,r*2.6),this.sun.position.copy(this.camera.position),this.sun.quaternion.copy(this.camera.quaternion),this.sun.translateZ(-a)}update(e){const t=Math.sin(e*.11)*.55+Math.sin(e*.37)*.2,s=Math.cos(e*.09)*.5+Math.sin(e*.23)*.18,o=this.pointer.x*.7,a=this.pointer.y*.5;this.drift=Math.sin(e*.13)*.5+.5;const r=new T,n=new T,l=new T;this.camera.getWorldDirection(r),n.crossVectors(r,this.camera.up).normalize(),l.crossVectors(n,r).normalize();const d=h=>Math.tan(this.camera.fov/2*(Math.PI/180))*h;for(const{mesh:h,material:m,depth:g}of this.plates){const b=ke*(Be/g),y=(t+o)*b,M=(s+a)*b*.7,R=d(g);h.position.copy(this.camera.position).addScaledVector(r,g).addScaledVector(n,y*R*this.camera.aspect).addScaledVector(l,M*R);const p=Math.sin(e*.13)*.5+.5,w=(g>20?.1:.06)*(p-.5)*2;m.color.setRGB(1+w,1+w*.35,1-w*.8)}const c=this.sun.material;c.opacity=.14+Math.sin(e*.17)*.06,this.sun.position.x+=Math.sin(e*.05)*.02}dispose(){for(const{mesh:e}of this.plates)e.geometry.dispose();for(const{material:e}of this.plates)e.dispose();for(const e of this.textures)e.dispose();this.sun.geometry.dispose(),this.sun.material.dispose(),this.sunTexture.dispose(),this.root.removeFromParent()}}const oe={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class G{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const St=new tt(-1,1,1,-1,0,1);class _t extends Ve{constructor(){super(),this.setAttribute("position",new De([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new De([0,2,0,0,2,0],2))}}const Pt=new _t;class ie{constructor(e){this._mesh=new u(Pt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,St)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Ze extends G{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof O?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=q.clone(e.uniforms),this.material=new O({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ie(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class ze extends G{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}}class Dt extends G{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class At{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new P);this._width=s.width,this._height=s.height,t=new j(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Y}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ze(oe),this.copyPass.material.blending=He,this.timer=new st}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let o=0,a=this.passes.length;o<a;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}ze!==void 0&&(r instanceof ze?s=!0:r instanceof Dt&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new P);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Rt extends G{constructor(e,t,s=null,o=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new N}render(e,t,s){const o=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}}const Ut={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new N(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Q extends G{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new P(e.x,e.y):new P(256,256),this.clearColor=new N(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new j(a,r,{type:Y,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const h=new j(a,r,{type:Y,depthBuffer:!1});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const m=new j(a,r,{type:Y,depthBuffer:!1});m.texture.name="UnrealBloomPass.v"+c,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),a=Math.round(a/2),r=Math.round(r/2)}const n=Ut;this.highPassUniforms=q.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new O({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new P(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const d=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=d,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=q.clone(oe.uniforms),this.blendMaterial=new O({uniforms:this.copyUniforms,vertexShader:oe.vertexShader,fragmentShader:oe.fragmentShader,premultipliedAlpha:!0,blending:de,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new N,this._oldClearAlpha=1,this._basic=new H,this._fsQuad=new ie(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new P(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=Q.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Q.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);const o=[],a=[];for(let r=1;r<e;r+=2){const n=t[r],l=r+1<e?t[r+1]:0,d=n+l;o.push((r*n+(r+1)*l)/d),a.push(d)}return new O({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new P(.5,.5)},direction:{value:new P(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new O({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}}Q.BlurDirectionX=new P(1,0);Q.BlurDirectionY=new P(0,1);const ee={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};class Ft extends G{constructor(e,t,s){super(),this.scene=e,this.camera=t;const o=s.focus!==void 0?s.focus:1,a=s.aperture!==void 0?s.aperture:.025,r=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new j(1,1,{minFilter:Ae,magFilter:Ae,type:Y}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new ot,this._materialDepth.depthPacking=at,this._materialDepth.blending=He;const n=q.clone(ee.uniforms);n.tDepth.value=this._renderTargetDepth.texture,n.focus.value=o,n.aspect.value=t.aspect,n.aperture.value=a,n.maxblur.value=r,n.nearClip.value=t.near,n.farClip.value=t.far,this.materialBokeh=new O({defines:Object.assign({},ee.defines),uniforms:n,vertexShader:ee.vertexShader,fragmentShader:ee.fragmentShader}),this.uniforms=n,this._fsQuad=new ie(this.materialBokeh),this._oldClearColor=new N}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const o=e.getClearAlpha(),a=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(o),e.autoClear=a}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const te={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Et extends G{constructor(){super(),this.isOutputPass=!0,this.uniforms=q.clone(te.uniforms),this.material=new rt({name:te.name,uniforms:this.uniforms,vertexShader:te.vertexShader,fragmentShader:te.fragmentShader}),this._fsQuad=new ie(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},it.getTransfer(this._outputColorSpace)===nt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===lt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ct?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Qe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ut?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===dt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const x=new Map;function F(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function E(i,e=[1,1]){const t=new Ge(i.canvas);return t.wrapS=re,t.wrapT=re,t.repeat.set(e[0],e[1]),t.colorSpace=he,t.anisotropy=4,t}function ne(i,e){const{width:t,height:s}=i.canvas;for(let o=0;o<e.count;o+=1){const a=e.colors[Math.floor(Math.random()*e.colors.length)],r=e.minSize+Math.random()*(e.maxSize-e.minSize);i.globalAlpha=e.alpha*(.5+Math.random()*.5),i.fillStyle=a,i.beginPath();const n=Math.random()*t,l=Math.random()*s;e.horizontal?i.ellipse(n,l,r,r*(.25+Math.random()*.35),0,0,Math.PI*2):i.ellipse(n,l,r*(.3+Math.random()*.3),r,0,0,Math.PI*2),i.fill()}i.globalAlpha=1}function Ne(){const i=x.get("bark");if(i)return i;const e=F(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let o=0;o<90;o+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const a=Math.random()*256;e.moveTo(a,0);for(let r=0;r<=512;r+=32)e.lineTo(a+Math.sin(r*.02+o)*5,r);e.stroke()}e.globalAlpha=1,ne(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=E(e,[2,1]);return x.set("bark",s),s}function Ie(){const i=x.get("foliage");if(i)return i;const e=F(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),ne(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=E(e,[2,2]);return x.set("foliage",t),t}function kt(){const i=x.get("grass");if(i)return i;const e=F(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),ne(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const o=Math.random()*512,a=Math.random()*512;e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*8,a-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=E(e,[10,10]);return x.set("grass",t),t}function Bt(){const i=x.get("cloth");if(i)return i;const e=F(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const o=Math.random()*256;e.moveTo(o,0),e.bezierCurveTo(o+20,80,o-20,170,o+10,256),e.stroke()}e.globalAlpha=1,ne(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=E(e,[2,2]);return x.set("cloth",t),t}function zt(){const i=x.get("leaf");if(i)return i;const e=F(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=E(e);return s.wrapS=ae,s.wrapT=ae,x.set("leaf",s),s}function Nt(){for(const i of x.values())i.dispose();x.clear()}function It(){const i=x.get("grain");if(i)return i;const e=F(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let o=0;o<t.data.length;o+=4){const a=128+(Math.random()-.5)*70;t.data[o]=a,t.data[o+1]=a,t.data[o+2]=a}e.putImageData(t,0,0);const s=E(e,[8,8]);return x.set("grain",s),s}function Lt(){const i=x.get("shaft");if(i)return i;const e=F(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let o=0;o<160;o+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const a=Math.random()*512,r=6+Math.random()*26;e.fillRect(0,a,r,10+Math.random()*40),e.fillRect(128-r,a,r,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=E(e);return s.wrapS=ae,s.wrapT=ae,x.set("shaft",s),s}function Ot(){const i=x.get("mist");if(i)return i;const e=F(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let o=0;o<220;o+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const a=Math.random()*512,r=Math.random()*128;e.beginPath(),e.ellipse(a,r,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=E(e,[2,1]);return x.set("mist",s),s}function Gt(){const i=x.get("stroke-angle");if(i)return i;const e=F(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const o=Math.random()*256,a=Math.random()*256,r=12+Math.random()*46,n=Math.random()*255,l=e.createRadialGradient(o,a,0,o,a,r);l.addColorStop(0,`rgba(${n}, ${n}, ${n}, 0.55)`),l.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=l,e.fillRect(o-r,a-r,r*2,r*2)}const t=E(e,[1,1]);return t.wrapS=re,t.wrapT=re,x.set("stroke-angle",t),t}function Le(){const i=x.get("fur");if(i)return i;const e=F(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const o=Math.random()*256,a=Math.random()*256,r=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*5,a+r),e.stroke()}e.globalAlpha=1;const t=E(e,[3,3]);return x.set("fur",t),t}const Vt={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new P(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
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
  `};class Ht{constructor(e,t,s,o){this.renderer=e,this.scene=t,this.camera=s,this.composer=new At(e),this.renderPass=new Rt(t,s),this.composer.addPass(this.renderPass),o.quality!=="low"?(this.bloom=new Q(new P(1,1),.32,.7,.88),this.composer.addPass(this.bloom)):this.bloom=null,o.quality==="high"?(this.bokeh=new Ft(t,s,{focus:14,aperture:.0013,maxblur:.008}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new Ze(Vt),this.painterly.uniforms.tAngle.value=Gt(),this.painterly.uniforms.uLength.value=o.quality==="high"?13:9,this.painterly.uniforms.uStrength.value=o.quality==="high"?.6:.52,this.composer.addPass(this.painterly),this.composer.addPass(new Et)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setPainterly(e){this.painterly.uniforms.uStrength.value=e}setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const C={sky:12575970,fog:3364442,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:6581056,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Ke=42,ue=1.45,fe=1;function Qt(i,e){const t=Math.hypot(e+7.4,ue-fe),s=Math.tan(Ke/2*(Math.PI/180))*t;return{width:s*i,height:s}}function A(i){const e=i.map(s=>{const o=s.geometry.clone();return o.applyMatrix4(new We().compose(new T(...s.position??[0,0,0]),new je().setFromEuler(new Ye(...s.rotation??[0,0,0])),new T(...s.scale??[1,1,1]))),o.index?o.toNonIndexed():o}),t=Ct(e,!1)??new Ve;for(const s of e)s.dispose();for(const s of i)s.geometry.dispose();return t}function W(i){return new U({color:i.color,map:i.map,roughness:i.roughness??.92,metalness:0})}function ce(i,e,t){const s=[];for(let r=0;r<=14;r+=1){const n=r/14,l=1+Math.pow(1-n,3)*1.35,d=1-n*.42,c=1+Math.sin(n*Math.PI*3)*.035;s.push(new P(e*d*l*c,n*i))}const a=new qe(s,32);return a.computeVertexNormals(),new u(a,t)}function Wt(i,e,t){const s=[];let o=t;const a=()=>(o=o*16807%2147483647,o/2147483647);for(let r=0;r<6;r+=1){const n=a()*Math.PI*2,l=a()*i*.55,d=i*(.42+a()*.3);s.push({geometry:new _(d,12,9),position:[Math.cos(n)*l,(a()-.35)*i*.45,Math.sin(n)*l],scale:[1.05,.85+a()*.25,1.05]})}return new u(A(s),e)}function jt(){const e=new z,t=new U({color:C.lionBody,roughness:.9,metalness:0}),s=new U({color:C.lionBodyDark,roughness:.92,metalness:0}),o=new U({color:C.lionMane,roughness:.98,metalness:0,bumpMap:Le(),bumpScale:.06}),a=new U({color:C.lionManeLight,roughness:.98,metalness:0,bumpMap:Le(),bumpScale:.05});new U({color:C.muzzle,roughness:.85,metalness:0});const r=new U({color:C.face,roughness:.45,metalness:0});e.add(new u(A([{geometry:new S(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new S(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new _(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new _(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new _(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),t));const n=[],l=[];for(const p of[-.24,.24]){n.push({geometry:new J(.095,.115,.98,12),position:[p,.52,.22]}),l.push({geometry:new _(.14,12,10),position:[p,.09,.3],scale:[1.05,.62,1.5]});for(const w of[-.06,0,.06])l.push({geometry:new _(.045,8,6),position:[p+w,.05,.46]})}for(const p of[-.44,.44])n.push({geometry:new J(.115,.135,.52,12),position:[p,.3,-.18],rotation:[1,0,0]}),l.push({geometry:new _(.15,12,10),position:[p,.09,.06],scale:[1.1,.62,1.6]});e.add(new u(A(n),t)),e.add(new u(A(l),s));const d=new u(new _(.44,26,20),t);d.position.set(0,1,.16),d.scale.set(1,1.15,.95),e.add(d);const c=new z;c.position.set(0,1.78,.14),c.add(new u(A([{geometry:new _(.29,26,20),scale:[1,.96,1.06]},{geometry:new J(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new _(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new Fe(.34,.05,.14),position:[0,.12,.24]}]),t)),c.add(new u(new Ee(.075,.1,3),r).translateY(0).translateZ(0));const h=c.children[c.children.length-1];h.position.set(0,-.08,.47),h.rotation.set(Math.PI/2,0,Math.PI),c.add(new u(new Fe(.13,.012,.08),r).translateY(0).translateZ(0)),c.children[c.children.length-1].position.set(0,-.22,.4),c.add(new u(A([{geometry:new _(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new _(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),r));const g=[{geometry:new S(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new S(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new S(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new S(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new S(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new S(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new S(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new S(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new S(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new S(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],b=[{geometry:new S(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new S(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new S(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];c.add(new u(A(g),o)),c.add(new u(A(b),a));const y=[];for(const p of[-.23,.23]){const w=new u(new Ee(.095,.17,5),a);w.position.set(p,.3,.06),w.rotation.z=p<0?.4:-.4,c.add(w),y.push(w)}e.add(c);const M=[];let R=e;for(let p=0;p<2;p+=1){const w=new z;w.position.set(0,p===0?.5:.02,p===0?-.94:-.3);const I=new u(new J(.07-p*.012,.08-p*.012,.32,10),t);if(I.rotation.x=Math.PI/2+.5,I.position.z=-.16,w.add(I),p===1){const k=new u(new S(.11,0),o);k.scale.set(.9,1.5,.9),k.position.set(0,-.18,-.3),w.add(k)}R.add(w),R=w,M.push(w)}return e.scale.setScalar(1.16),{group:e,head:c,headBaseY:1.34,tail:M,ears:y,chest:d}}function Yt(){const i=new z,e=W({color:C.cloth,map:Bt(),roughness:.95}),t=new U({color:C.clothDark,roughness:.9,metalness:0}),s=[],o=16;for(let c=0;c<=o;c+=1){const h=c/o,m=.16+Math.pow(h,1.5)*.3+Math.sin(h*Math.PI)*.05;s.push(new P(m,1.02-h*1))}const a=new qe(s,32);a.computeVertexNormals();const r=new u(a,e);i.add(r);const n=new u(new _(.18,16,12),e);n.scale.set(1,1.12,1.08),n.position.set(0,1.06,.01),i.add(n);const l=new u(new _(.2,14,11),e);l.scale.set(1.5,.6,.9),l.position.set(0,.92,0),i.add(l);const d=new u(new _(.1,12,10),t);return d.scale.set(1,1.15,.6),d.position.set(0,1.05,.13),i.add(d),i.scale.setScalar(.68),{group:i,cloak:r,basePositions:Float32Array.from(a.attributes.position.array)}}function qt(i){const e=new B(.17,.24),t=new U({map:zt(),transparent:!0,alphaTest:.4,side:se,roughness:1,metalness:0}),s=new yt(e,t,i);s.frustumCulled=!1;const o=new Float32Array(i*6);for(let a=0;a<i;a+=1)o[a*6+0]=-6+Math.random()*12,o[a*6+1]=.4+Math.random()*4.8,o[a*6+2]=-5+Math.random()*10,o[a*6+3]=.5+Math.random()*1.2,o[a*6+4]=Math.random()*Math.PI*2,o[a*6+5]=(Math.random()-.5)*3;return{mesh:s,state:o}}function Oe(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const i=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!i&&e>=4?"high":e>=4?"medium":"low"}class Kt{constructor(e){this.canvas=e,this.renderer=new pt({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=mt,this.renderer.toneMapping=Qe,this.renderer.toneMappingExposure=1.12,this.scene.background=new N(C.sky),this.scene.fog=new gt(C.fog,16,30),this.camera=new vt(Ke,2/3,.1,90),this.camera.position.set(0,ue,7.4),this.camera.lookAt(0,fe,0);const t=It();this.scene.add(new xt(14479344,3498094,1.05));const s=new Re(16761976,1.15);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const o=new Re(8832742,1.5);o.position.set(-5,3,5),this.scene.add(o);const a=new bt(16767392,13,12,Math.PI/9,.8,1.6);a.position.set(-1.4,4.2,4.6),a.target.position.set(-.3,1,1.6),this.scene.add(a),this.scene.add(a.target);const r=new B(70,40,1,8),n=r.attributes.position,l=new Float32Array(n.count*3),d=new N(C.sky),c=new N(C.fog);for(let f=0;f<n.count;f+=1){const D=(n.getY(f)+20)/40,v=c.clone().lerp(d,D);l[f*3]=v.r,l[f*3+1]=v.g,l[f*3+2]=v.b}r.setAttribute("color",new Ue(l,3));const h=new H({vertexColors:!0,fog:!1,side:se}),m=new u(r,h);m.position.set(0,8,-22),this.addForest(m),this.disposables.push(r,h);const g=new B(46,46,18,18),b=g.attributes.position,y=new Float32Array(b.count*3),M=new N;for(let f=0;f<b.count;f+=1){const D=b.getX(f),v=b.getY(f);b.setZ(f,Math.sin(D*.28)*.09+Math.cos(v*.24)*.07);const L=(Math.sin(D*.5)+Math.cos(v*.42))*.5,V=L>.35?1.16:L<-.35?.82:1,$=Math.min(1,Math.max(0,v/23));M.setHex(C.grass).multiplyScalar(V*(1-$*.3)),y[f*3]=M.r,y[f*3+1]=M.g,y[f*3+2]=M.b}g.setAttribute("color",new Ue(y,3)),g.computeVertexNormals();const R=new U({map:kt(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),p=new u(g,R);p.rotation.x=-Math.PI/2,p.receiveShadow=!0,this.ground=p,this.scene.add(p),this.disposables.push(g,R);const w=W({color:C.bark,map:Ne()}),I=W({color:C.barkFar,map:Ne(),roughness:1}),k=W({color:C.foliage,map:Ie(),roughness:1}),le=W({color:C.foliageFar,map:Ie(),roughness:1});this.disposables.push(w,I,k,le);const X=new z;X.name="leftFrame";const me=ce(13,.6,w);me.castShadow=!0,X.add(me),X.add(this.placeCanopy(11.6,1.05,k,7)),this.addForest(X);const Z=new z;Z.name="rightFrame";const ge=ce(13.6,.66,I);ge.castShadow=!0,Z.add(ge),Z.add(this.placeCanopy(12.2,1.1,k,11)),this.addForest(Z);const $e=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],ve=[],xe=[];$e.forEach(([f,D,v],L)=>{const V=ce(v,v*.05,I).geometry.clone();V.translate(f,0,D),ve.push({geometry:V});const $=this.placeCanopy(v*.92,v*.16,le,L*13+5),Pe=$.geometry.clone();Pe.translate(f,v*.92,D),xe.push({geometry:Pe}),$.geometry.dispose()});const be=new u(A(ve),I);be.name="farTrunks";const we=new u(A(xe),le);we.name="farCanopies",this.addForest(be),this.addForest(we);const K=new z;K.name="canopyTop",K.add(this.placeCanopy(0,.55,k,3)),this.addForest(K),this.foliage.push(K);for(const[f,D]of[["canopyleft",-1],["canopyright",1]]){const v=new z;v.name=f,v.add(this.placeCanopy(0,.7,k,D<0?17:23)),this.addForest(v),this.foliage.push(v)}const Me=new H({map:Lt(),transparent:!0,blending:de,depthWrite:!1,side:se,opacity:.85}),ye=[];for(const[f,D,v,L,V]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])ye.push({geometry:new B(v,L),position:[f,L/2-.4,D],rotation:[0,0,V]});const Ce=new u(A(ye),Me);Ce.renderOrder=2,this.addForest(Ce),this.disposables.push(Me);const Te=new H({map:Ot(),transparent:!0,depthWrite:!1,side:se,opacity:.55}),Se=[];for(const[f,D,v]of[[-6,.7,1.6],[-12,1.1,2.2]])Se.push({geometry:new B(26*v,3.4*v),position:[0,D,f]});const _e=new u(A(Se),Te);_e.renderOrder=1,this.addForest(_e),this.disposables.push(Te),this.lion=jt(),this.lion.group.position.set(-.3,0,1.6),this.lion.group.rotation.y=-.12,this.lion.group.scale.setScalar(.85),this.lion.group.traverse(f=>{f instanceof u&&(f.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=Yt(),this.traveler.group.position.set(.35,0,2.6),this.traveler.group.rotation.y=Math.PI-.25,this.traveler.group.scale.setScalar(.6),this.traveler.group.traverse(f=>{f instanceof u&&(f.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=qt(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new Ht(this.renderer,this.scene,this.camera,{quality:Oe()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.loadPlates(),this.animate()}renderer;postfx;scene=new wt;camera;clock=new Mt;lion;forest=[];loaded={plates:!1};plates=null;ground=null;traveler;leaves;foliage=[];matrix=new We;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get assets(){return{...this.loaded}}get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,o){const a=Wt(t,s,o);return a.position.y=e,a}alignToNdc(e,t,s,o){e.position.z=o;const a=new T;for(let r=0;r<8;r+=1){e.getWorldPosition(a),a.project(this.camera);const{width:n,height:l}=Qt(this.camera.aspect,o);e.position.x+=(t-a.x)*n*.85,e.position.y+=(s-a.y)*l*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const o=this.scene.getObjectByName("canopyTop");o&&this.alignToNdc(o,0,1.06,-1.2-.6);for(const[a,r]of[["canopyleft",-1],["canopyright",1]]){const n=this.scene.getObjectByName(a);n&&this.alignToNdc(n,r*.9,.92,-1.2)}}addForest(e){this.scene.add(e),this.forest.push(e)}loadPlates(){const e=new pe(this.camera,{base:"./title/layers/",quality:Oe(),onReady:()=>{this.loaded.plates=!0,this.hideProcedural(),this.postfx?.setPainterly(.18)}});this.plates=e,this.scene.add(e.object3d)}hideProcedural(){for(const e of this.forest)e.visible=!1;this.ground&&(this.ground.visible=!1),this.lion.group.visible=!1,this.traveler.group.visible=!1}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const o=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,ue+Math.max(0,s-1)*.4,o),this.camera.lookAt(0,fe,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout(),this.plates?.layout()}setPointer(e,t){this.plates?.setPointer(e,t)}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4,this.plates?.update(t);const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=this.lion.headBaseY+Math.sin(t*2.1)*.014,this.lion.ears.forEach((c,h)=>{const m=Math.max(0,Math.sin(t*.9+h*2.1)-.93)*12;c.rotation.z=(h===0?.34:-.34)+m*(h===0?1:-1)}),this.lion.tail.forEach((c,h)=>{c.rotation.y=Math.sin(t*1.1-h*.5)*(.12+h*.05)*(.8+this.wind*.6),c.rotation.x=-.1+Math.sin(t*.8-h*.4)*.08});const o=this.traveler.cloak,a=o.geometry.attributes.position,r=this.traveler.basePositions;for(let c=0;c<a.count;c+=1){const h=r[c*3]??0,m=r[c*3+1]??0,g=r[c*3+2]??0,b=Math.max(0,.55-m)/.55,y=Math.atan2(g,h),M=this.wind*(.14+.06*Math.sin(t*2.6+y*3));a.setXYZ(c,h+Math.sin(y)*b*M+Math.sin(t*3+y*2)*b*.014,m-Math.abs(M)*b*.07,g+Math.cos(y)*b*M+Math.cos(t*2.4+y*2)*b*.014)}a.needsUpdate=!0,o.geometry.computeVertexNormals(),this.foliage.forEach((c,h)=>{c.rotation.z=Math.sin(t*.9+h)*.028*(.6+this.wind)});const{mesh:n,state:l}=this.leaves,d=l.length/6;for(let c=0;c<d;c+=1){const h=c*6;let m=l[h]??0,g=l[h+1]??0,b=l[h+2]??0;const y=l[h+3]??1,M=l[h+4]??0,R=l[h+5]??1;m+=(y*(.6+this.wind)+.35)*e*1.7,g+=Math.sin(t*1.6+M)*e*.5,b+=Math.cos(t*1.1+M)*e*.3,m>8&&(m=-8,g=.4+Math.random()*4.8,b=-5+Math.random()*10),l[h]=m,l[h+1]=g,l[h+2]=b;const p=.85+Math.sin(t*2+M)*.15;this.matrix.compose(new T(m,g,b),new je().setFromEuler(new Ye(t*R,M+t*.8,Math.sin(t*1.5+M)*.7)),new T(p,p,p)),n.setMatrixAt(c,this.matrix)}n.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof u))return;e+=1;const o=s.geometry,a=o.getAttribute("position"),r=o.getIndex();r?t+=r.count/3:a&&(t+=a.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new T;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof u){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),Nt(),this.renderer.dispose()}}export{C as TITLE_PALETTE,Kt as TitleScene};
//# sourceMappingURL=titleScene-BjdPE0qg.js.map
