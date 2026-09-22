import{M as H,A as pe,a as d,P as k,T as Je,G as N,V as T,S as L,R as G,b as oe,L as et,C as Ve,c as S,O as tt,B as We,F as Ae,U as X,W as Y,H as q,N as He,d as st,e as O,f as Re,g as ot,h as at,i as rt,j as it,k as nt,l as lt,m as ct,n as ht,o as Qe,p as ut,q as ft,r as dt,s as ie,t as pt,u as mt,v as gt,w as vt,x as xt,D as Ue,y as bt,z as Fe,E as ae,I as F,J as wt,K as Mt,Q as je,X as Ye,Y as qe,Z as Xe,_,$ as P,a0 as ee,a1 as ke,a2 as Ee,a3 as yt}from"./three.module-CGvGw3gl.js";import{m as Ct}from"./BufferGeometryUtils-BSnYmD47.js";const Tt={vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D uTile;
    uniform sampler2D uMask;
    uniform vec2 uOffset;
    uniform vec2 uRepeat;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      vec3 color = texture2D(uTile, vUv * uRepeat + uOffset).rgb;
      float alpha = texture2D(uMask, vUv).a * uOpacity;
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color, alpha);
    }`},ue={forest:26,ground:15,lion:10,trunk_right:7.5,trunk_left:7,traveler:5.5},St=Object.entries(ue).map(([i,e])=>({name:i,depth:e})),Be=.02,ze=12;class me{constructor(e,t){this.camera=e,this.root.name="titlePlates",this.sunTexture=me.sunTexture();const s=new H({map:this.sunTexture,transparent:!0,depthWrite:!1,fog:!1,blending:pe,opacity:.18});this.sun=new d(new k(1,1),s),this.sun.name="plate_sun",this.sun.renderOrder=0,this.root.add(this.sun);const o=new Je;this.build(o,t),this.base=performance.now()}root=new N;plates=[];textures=[];sun;sunTexture;pointer=new T;drift=0;base=0;lastTime=0;async build(e,t){let s=St;try{const o=await fetch(`${t.base}manifest.json`);if(o.ok){const a=await o.json();Array.isArray(a)&&a.length&&(s=a.map(r=>typeof r=="string"?{name:r,depth:ue[r]??12}:{...r,depth:r.depth??ue[r.name]??12}))}}catch{}s=[...s].sort((o,a)=>a.depth-o.depth);for(const o of s){if(o.mask&&o.tile){const f=new L({...Tt,transparent:!0,depthWrite:!1,uniforms:{uTile:{value:e.load(`${t.base}${o.tile}.webp`,h=>{h.wrapS=h.wrapT=G,h.colorSpace=oe})},uMask:{value:e.load(`${t.base}${o.mask}.webp`)},uOffset:{value:new T(0,0)},uRepeat:{value:new T(...o.repeat??[1,1])},uOpacity:{value:o.opacity??1}}}),c=new d(new k(1,1),f);c.name=`plate_${o.name}`,c.renderOrder=s.indexOf(o),this.root.add(c),this.plates.push({mesh:c,material:f,depth:o.depth,scroll:o.scroll,offset:f.uniforms.uOffset.value,swell:o.name.startsWith("water")?.05:void 0}),this.textures.push(f.uniforms.uTile.value,f.uniforms.uMask.value);continue}const a=new H({transparent:!0,depthWrite:!1,fog:!1,toneMapped:!1}),r=new d(new k(1,1),a);r.name=`plate_${o.name}`,r.renderOrder=s.indexOf(o),this.root.add(r);const l={mesh:r,material:a,depth:o.depth,scroll:o.scroll,swell:o.name.startsWith("water")?.05:void 0};this.plates.push(l);const n=e.load(`${t.base}${o.name}.webp`,()=>{(o.name==="forest"||s.length===1)&&t.onReady?.()},void 0,()=>{this.root.remove(r);const f=this.plates.findIndex(c=>c.mesh===r);f>=0&&this.plates.splice(f,1),a.dispose()});n.colorSpace=oe,n.minFilter=et,n.generateMipmaps=!1,o.repeat&&(n.wrapS=n.wrapT=G,n.repeat.set(o.repeat[0],o.repeat[1])),o.scroll&&(n.wrapS=n.wrapT=G),a.map=n,o.opacity!==void 0&&(a.opacity=o.opacity),l.map=n,this.textures.push(n)}this.layout()}static sunTexture(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(128,128,8,128,128,128);s.addColorStop(0,"rgba(255, 232, 178, 0.95)"),s.addColorStop(.45,"rgba(255, 206, 132, 0.35)"),s.addColorStop(1,"rgba(255, 190, 110, 0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const o=new Ve(e);return o.colorSpace=oe,o}get object3d(){return this.root}setPointer(e,t){this.pointer.set(e,t)}layout(){const e=l=>Math.tan(this.camera.fov/2*(Math.PI/180))*l,t=new S,s=new S,o=new S;this.camera.getWorldDirection(t),s.crossVectors(t,this.camera.up).normalize(),o.crossVectors(s,t).normalize();for(const l of this.plates){const{mesh:n,depth:f}=l,c=e(f),h=c*this.camera.aspect,g=1+Be*(ze/f)*2+.02,v=n.geometry;(v.parameters.width!==2*h*g||v.parameters.height!==2*c*g)&&(n.geometry.dispose(),n.geometry=new k(2*h*g,2*c*g)),n.position.copy(this.camera.position).addScaledVector(t,f),n.quaternion.copy(this.camera.quaternion),l.baseY=n.position.y}const a=9,r=e(a);this.sun.geometry.dispose(),this.sun.geometry=new k(r*this.camera.aspect*3.2,r*2.6),this.sun.position.copy(this.camera.position),this.sun.quaternion.copy(this.camera.quaternion),this.sun.translateZ(-a)}update(e){const t=this.lastTime?Math.min(.05,e-this.lastTime):0;this.lastTime=e;for(const u of this.plates){if(u.offset&&u.scroll){u.offset.x=(u.offset.x+u.scroll[0]*t)%1,u.offset.y=(u.offset.y+u.scroll[1]*t)%1;continue}const g=u.map;!g||!u.scroll||(g.offset.x=(g.offset.x+u.scroll[0]*t)%1,g.offset.y=(g.offset.y+u.scroll[1]*t)%1,u.swell&&u.baseY!==void 0&&(u.mesh.position.y=u.baseY+Math.sin(e*.6+u.depth)*u.swell))}const s=Math.sin(e*.11)*.55+Math.sin(e*.37)*.2,o=Math.cos(e*.09)*.5+Math.sin(e*.23)*.18,a=this.pointer.x*.7,r=this.pointer.y*.5;this.drift=Math.sin(e*.13)*.5+.5;const l=new S,n=new S,f=new S;this.camera.getWorldDirection(l),n.crossVectors(l,this.camera.up).normalize(),f.crossVectors(n,l).normalize();const c=u=>Math.tan(this.camera.fov/2*(Math.PI/180))*u;for(const{mesh:u,material:g,depth:v}of this.plates){const M=Be*(ze/v),w=(s+a)*M,z=(o+r)*M*.7,m=c(v);u.position.copy(this.camera.position).addScaledVector(l,v).addScaledVector(n,w*m*this.camera.aspect).addScaledVector(f,z*m);const y=Math.sin(e*.13)*.5+.5,A=(v>20?.1:.06)*(y-.5)*2,R=g;R.color&&R.color.setRGB(1+A,1+A*.35,1-A*.8)}const h=this.sun.material;h.opacity=.14+Math.sin(e*.17)*.06,this.sun.position.x+=Math.sin(e*.05)*.02}dispose(){for(const{mesh:e}of this.plates)e.geometry.dispose();for(const{material:e}of this.plates)e.dispose();for(const e of this.textures)e.dispose();this.sun.geometry.dispose(),this.sun.material.dispose(),this.sunTexture.dispose(),this.root.removeFromParent()}}const re={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class V{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const _t=new tt(-1,1,1,-1,0,1);class Pt extends We{constructor(){super(),this.setAttribute("position",new Ae([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ae([0,2,0,0,2,0],2))}}const Dt=new Pt;class ne{constructor(e){this._mesh=new d(Dt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,_t)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class $e extends V{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof L?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=X.clone(e.uniforms),this.material=new L({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ne(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ne extends V{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,l;this.inverse?(r=0,l=1):(r=1,l=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(l),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}}class At extends V{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Rt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new T);this._width=s.width,this._height=s.height,t=new Y(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:q}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new $e(re),this.copyPass.material.blending=He,this.timer=new st}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let o=0,a=this.passes.length;o<a;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const l=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}Ne!==void 0&&(r instanceof Ne?s=!0:r instanceof At&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new T);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ut extends V{constructor(e,t,s=null,o=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new O}render(e,t,s){const o=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}}const Ft={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new O(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Q extends V{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new T(e.x,e.y):new T(256,256),this.clearColor=new O(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Y(a,r,{type:q,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const h=new Y(a,r,{type:q,depthBuffer:!1});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const u=new Y(a,r,{type:q,depthBuffer:!1});u.texture.name="UnrealBloomPass.v"+c,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),a=Math.round(a/2),r=Math.round(r/2)}const l=Ft;this.highPassUniforms=X.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new L({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];const n=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(n[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new T(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const f=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=f,this.bloomTintColors=[new S(1,1,1),new S(1,1,1),new S(1,1,1),new S(1,1,1),new S(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=X.clone(re.uniforms),this.blendMaterial=new L({uniforms:this.copyUniforms,vertexShader:re.vertexShader,fragmentShader:re.fragmentShader,premultipliedAlpha:!0,blending:pe,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new O,this._oldClearAlpha=1,this._basic=new H,this._fsQuad=new ne(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new T(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let l=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=l.texture,this.separableBlurMaterials[n].uniforms.direction.value=Q.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=Q.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),l=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);const o=[],a=[];for(let r=1;r<e;r+=2){const l=t[r],n=r+1<e?t[r+1]:0,f=l+n;o.push((r*l+(r+1)*n)/f),a.push(f)}return new L({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new T(.5,.5)},direction:{value:new T(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new L({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}}Q.BlurDirectionX=new T(1,0);Q.BlurDirectionY=new T(0,1);const te={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};class kt extends V{constructor(e,t,s){super(),this.scene=e,this.camera=t;const o=s.focus!==void 0?s.focus:1,a=s.aperture!==void 0?s.aperture:.025,r=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new Y(1,1,{minFilter:Re,magFilter:Re,type:q}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new ot,this._materialDepth.depthPacking=at,this._materialDepth.blending=He;const l=X.clone(te.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=o,l.aspect.value=t.aspect,l.aperture.value=a,l.maxblur.value=r,l.nearClip.value=t.near,l.farClip.value=t.far,this.materialBokeh=new L({defines:Object.assign({},te.defines),uniforms:l,vertexShader:te.vertexShader,fragmentShader:te.fragmentShader}),this.uniforms=l,this._fsQuad=new ne(this.materialBokeh),this._oldClearColor=new O}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const o=e.getClearAlpha(),a=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(o),e.autoClear=a}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const se={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Et extends V{constructor(){super(),this.isOutputPass=!0,this.uniforms=X.clone(se.uniforms),this.material=new rt({name:se.name,uniforms:this.uniforms,vertexShader:se.vertexShader,fragmentShader:se.fragmentShader}),this._fsQuad=new ne(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},it.getTransfer(this._outputColorSpace)===nt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===lt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ct?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Qe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ut?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===dt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const b=new Map;function E(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function B(i,e=[1,1]){const t=new Ve(i.canvas);return t.wrapS=G,t.wrapT=G,t.repeat.set(e[0],e[1]),t.colorSpace=oe,t.anisotropy=4,t}function le(i,e){const{width:t,height:s}=i.canvas;for(let o=0;o<e.count;o+=1){const a=e.colors[Math.floor(Math.random()*e.colors.length)],r=e.minSize+Math.random()*(e.maxSize-e.minSize);i.globalAlpha=e.alpha*(.5+Math.random()*.5),i.fillStyle=a,i.beginPath();const l=Math.random()*t,n=Math.random()*s;e.horizontal?i.ellipse(l,n,r,r*(.25+Math.random()*.35),0,0,Math.PI*2):i.ellipse(l,n,r*(.3+Math.random()*.3),r,0,0,Math.PI*2),i.fill()}i.globalAlpha=1}function Oe(){const i=b.get("bark");if(i)return i;const e=E(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let o=0;o<90;o+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const a=Math.random()*256;e.moveTo(a,0);for(let r=0;r<=512;r+=32)e.lineTo(a+Math.sin(r*.02+o)*5,r);e.stroke()}e.globalAlpha=1,le(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=B(e,[2,1]);return b.set("bark",s),s}function Le(){const i=b.get("foliage");if(i)return i;const e=E(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),le(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=B(e,[2,2]);return b.set("foliage",t),t}function Bt(){const i=b.get("grass");if(i)return i;const e=E(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),le(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const o=Math.random()*512,a=Math.random()*512;e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*8,a-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=B(e,[10,10]);return b.set("grass",t),t}function zt(){const i=b.get("cloth");if(i)return i;const e=E(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const o=Math.random()*256;e.moveTo(o,0),e.bezierCurveTo(o+20,80,o-20,170,o+10,256),e.stroke()}e.globalAlpha=1,le(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=B(e,[2,2]);return b.set("cloth",t),t}function Nt(){const i=b.get("leaf");if(i)return i;const e=E(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=B(e);return s.wrapS=ie,s.wrapT=ie,b.set("leaf",s),s}function Ot(){for(const i of b.values())i.dispose();b.clear()}function Lt(){const i=b.get("grain");if(i)return i;const e=E(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let o=0;o<t.data.length;o+=4){const a=128+(Math.random()-.5)*70;t.data[o]=a,t.data[o+1]=a,t.data[o+2]=a}e.putImageData(t,0,0);const s=B(e,[8,8]);return b.set("grain",s),s}function It(){const i=b.get("shaft");if(i)return i;const e=E(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let o=0;o<160;o+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const a=Math.random()*512,r=6+Math.random()*26;e.fillRect(0,a,r,10+Math.random()*40),e.fillRect(128-r,a,r,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=B(e);return s.wrapS=ie,s.wrapT=ie,b.set("shaft",s),s}function Gt(){const i=b.get("mist");if(i)return i;const e=E(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let o=0;o<220;o+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const a=Math.random()*512,r=Math.random()*128;e.beginPath(),e.ellipse(a,r,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=B(e,[2,1]);return b.set("mist",s),s}function Vt(){const i=b.get("stroke-angle");if(i)return i;const e=E(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const o=Math.random()*256,a=Math.random()*256,r=12+Math.random()*46,l=Math.random()*255,n=e.createRadialGradient(o,a,0,o,a,r);n.addColorStop(0,`rgba(${l}, ${l}, ${l}, 0.55)`),n.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=n,e.fillRect(o-r,a-r,r*2,r*2)}const t=B(e,[1,1]);return t.wrapS=G,t.wrapT=G,b.set("stroke-angle",t),t}function Ie(){const i=b.get("fur");if(i)return i;const e=E(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const o=Math.random()*256,a=Math.random()*256,r=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*5,a+r),e.stroke()}e.globalAlpha=1;const t=B(e,[3,3]);return b.set("fur",t),t}const Wt={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new T(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
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
  `};class Ht{constructor(e,t,s,o){this.renderer=e,this.scene=t,this.camera=s,this.composer=new Rt(e),this.renderPass=new Ut(t,s),this.composer.addPass(this.renderPass),o.quality!=="low"?(this.bloom=new Q(new T(1,1),.32,.7,.88),this.composer.addPass(this.bloom)):this.bloom=null,o.quality==="high"?(this.bokeh=new kt(t,s,{focus:14,aperture:.0013,maxblur:.008}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new $e(Wt),this.painterly.uniforms.tAngle.value=Vt(),this.painterly.uniforms.uLength.value=o.quality==="high"?13:9,this.painterly.uniforms.uStrength.value=o.quality==="high"?.6:.52,this.composer.addPass(this.painterly),this.composer.addPass(new Et)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setPainterly(e){this.painterly.uniforms.uStrength.value=e}setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const C={sky:12575970,fog:3364442,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:6581056,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Ze=42,fe=1.45,de=1;function Qt(i,e){const t=Math.hypot(e+7.4,fe-de),s=Math.tan(Ze/2*(Math.PI/180))*t;return{width:s*i,height:s}}function U(i){const e=i.map(s=>{const o=s.geometry.clone();return o.applyMatrix4(new je().compose(new S(...s.position??[0,0,0]),new Ye().setFromEuler(new qe(...s.rotation??[0,0,0])),new S(...s.scale??[1,1,1]))),o.index?o.toNonIndexed():o}),t=Ct(e,!1)??new We;for(const s of e)s.dispose();for(const s of i)s.geometry.dispose();return t}function j(i){return new F({color:i.color,map:i.map,roughness:i.roughness??.92,metalness:0})}function he(i,e,t){const s=[];for(let r=0;r<=14;r+=1){const l=r/14,n=1+Math.pow(1-l,3)*1.35,f=1-l*.42,c=1+Math.sin(l*Math.PI*3)*.035;s.push(new T(e*f*n*c,l*i))}const a=new Xe(s,32);return a.computeVertexNormals(),new d(a,t)}function jt(i,e,t){const s=[];let o=t;const a=()=>(o=o*16807%2147483647,o/2147483647);for(let r=0;r<6;r+=1){const l=a()*Math.PI*2,n=a()*i*.55,f=i*(.42+a()*.3);s.push({geometry:new P(f,12,9),position:[Math.cos(l)*n,(a()-.35)*i*.45,Math.sin(l)*n],scale:[1.05,.85+a()*.25,1.05]})}return new d(U(s),e)}function Yt(){const e=new N,t=new F({color:C.lionBody,roughness:.9,metalness:0}),s=new F({color:C.lionBodyDark,roughness:.92,metalness:0}),o=new F({color:C.lionMane,roughness:.98,metalness:0,bumpMap:Ie(),bumpScale:.06}),a=new F({color:C.lionManeLight,roughness:.98,metalness:0,bumpMap:Ie(),bumpScale:.05});new F({color:C.muzzle,roughness:.85,metalness:0});const r=new F({color:C.face,roughness:.45,metalness:0});e.add(new d(U([{geometry:new _(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new _(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new P(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new P(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new P(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),t));const l=[],n=[];for(const m of[-.24,.24]){l.push({geometry:new ee(.095,.115,.98,12),position:[m,.52,.22]}),n.push({geometry:new P(.14,12,10),position:[m,.09,.3],scale:[1.05,.62,1.5]});for(const y of[-.06,0,.06])n.push({geometry:new P(.045,8,6),position:[m+y,.05,.46]})}for(const m of[-.44,.44])l.push({geometry:new ee(.115,.135,.52,12),position:[m,.3,-.18],rotation:[1,0,0]}),n.push({geometry:new P(.15,12,10),position:[m,.09,.06],scale:[1.1,.62,1.6]});e.add(new d(U(l),t)),e.add(new d(U(n),s));const f=new d(new P(.44,26,20),t);f.position.set(0,1,.16),f.scale.set(1,1.15,.95),e.add(f);const c=new N;c.position.set(0,1.78,.14),c.add(new d(U([{geometry:new P(.29,26,20),scale:[1,.96,1.06]},{geometry:new ee(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new P(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new ke(.34,.05,.14),position:[0,.12,.24]}]),t)),c.add(new d(new Ee(.075,.1,3),r).translateY(0).translateZ(0));const h=c.children[c.children.length-1];h.position.set(0,-.08,.47),h.rotation.set(Math.PI/2,0,Math.PI),c.add(new d(new ke(.13,.012,.08),r).translateY(0).translateZ(0)),c.children[c.children.length-1].position.set(0,-.22,.4),c.add(new d(U([{geometry:new P(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new P(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),r));const g=[{geometry:new _(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new _(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new _(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new _(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new _(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new _(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new _(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new _(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],v=[{geometry:new _(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new _(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new _(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];c.add(new d(U(g),o)),c.add(new d(U(v),a));const M=[];for(const m of[-.23,.23]){const y=new d(new Ee(.095,.17,5),a);y.position.set(m,.3,.06),y.rotation.z=m<0?.4:-.4,c.add(y),M.push(y)}e.add(c);const w=[];let z=e;for(let m=0;m<2;m+=1){const y=new N;y.position.set(0,m===0?.5:.02,m===0?-.94:-.3);const A=new d(new ee(.07-m*.012,.08-m*.012,.32,10),t);if(A.rotation.x=Math.PI/2+.5,A.position.z=-.16,y.add(A),m===1){const R=new d(new _(.11,0),o);R.scale.set(.9,1.5,.9),R.position.set(0,-.18,-.3),y.add(R)}z.add(y),z=y,w.push(y)}return e.scale.setScalar(1.16),{group:e,head:c,headBaseY:1.34,tail:w,ears:M,chest:f}}function qt(){const i=new N,e=j({color:C.cloth,map:zt(),roughness:.95}),t=new F({color:C.clothDark,roughness:.9,metalness:0}),s=[],o=16;for(let c=0;c<=o;c+=1){const h=c/o,u=.16+Math.pow(h,1.5)*.3+Math.sin(h*Math.PI)*.05;s.push(new T(u,1.02-h*1))}const a=new Xe(s,32);a.computeVertexNormals();const r=new d(a,e);i.add(r);const l=new d(new P(.18,16,12),e);l.scale.set(1,1.12,1.08),l.position.set(0,1.06,.01),i.add(l);const n=new d(new P(.2,14,11),e);n.scale.set(1.5,.6,.9),n.position.set(0,.92,0),i.add(n);const f=new d(new P(.1,12,10),t);return f.scale.set(1,1.15,.6),f.position.set(0,1.05,.13),i.add(f),i.scale.setScalar(.68),{group:i,cloak:r,basePositions:Float32Array.from(a.attributes.position.array)}}function Xt(i){const e=new k(.17,.24),t=new F({map:Nt(),transparent:!0,alphaTest:.4,side:ae,roughness:1,metalness:0}),s=new yt(e,t,i);s.frustumCulled=!1;const o=new Float32Array(i*6);for(let a=0;a<i;a+=1)o[a*6+0]=-6+Math.random()*12,o[a*6+1]=.4+Math.random()*4.8,o[a*6+2]=-5+Math.random()*10,o[a*6+3]=.5+Math.random()*1.2,o[a*6+4]=Math.random()*Math.PI*2,o[a*6+5]=(Math.random()-.5)*3;return{mesh:s,state:o}}function Ge(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const i=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!i&&e>=4?"high":e>=4?"medium":"low"}class Kt{constructor(e){this.canvas=e,this.renderer=new pt({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=mt,this.renderer.toneMapping=Qe,this.renderer.toneMappingExposure=1.12,this.scene.background=new O(C.sky),this.scene.fog=new gt(C.fog,16,30),this.camera=new vt(Ze,2/3,.1,90),this.camera.position.set(0,fe,7.4),this.camera.lookAt(0,de,0);const t=Lt();this.scene.add(new xt(14479344,3498094,1.05));const s=new Ue(16761976,1.15);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const o=new Ue(8832742,1.5);o.position.set(-5,3,5),this.scene.add(o);const a=new bt(16767392,13,12,Math.PI/9,.8,1.6);a.position.set(-1.4,4.2,4.6),a.target.position.set(-.3,1,1.6),this.scene.add(a),this.scene.add(a.target);const r=new k(70,40,1,8),l=r.attributes.position,n=new Float32Array(l.count*3),f=new O(C.sky),c=new O(C.fog);for(let p=0;p<l.count;p+=1){const D=(l.getY(p)+20)/40,x=c.clone().lerp(f,D);n[p*3]=x.r,n[p*3+1]=x.g,n[p*3+2]=x.b}r.setAttribute("color",new Fe(n,3));const h=new H({vertexColors:!0,fog:!1,side:ae}),u=new d(r,h);u.position.set(0,8,-22),this.addForest(u),this.disposables.push(r,h);const g=new k(46,46,18,18),v=g.attributes.position,M=new Float32Array(v.count*3),w=new O;for(let p=0;p<v.count;p+=1){const D=v.getX(p),x=v.getY(p);v.setZ(p,Math.sin(D*.28)*.09+Math.cos(x*.24)*.07);const I=(Math.sin(D*.5)+Math.cos(x*.42))*.5,W=I>.35?1.16:I<-.35?.82:1,J=Math.min(1,Math.max(0,x/23));w.setHex(C.grass).multiplyScalar(W*(1-J*.3)),M[p*3]=w.r,M[p*3+1]=w.g,M[p*3+2]=w.b}g.setAttribute("color",new Fe(M,3)),g.computeVertexNormals();const z=new F({map:Bt(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),m=new d(g,z);m.rotation.x=-Math.PI/2,m.receiveShadow=!0,this.ground=m,this.scene.add(m),this.disposables.push(g,z);const y=j({color:C.bark,map:Oe()}),A=j({color:C.barkFar,map:Oe(),roughness:1}),R=j({color:C.foliage,map:Le(),roughness:1}),ce=j({color:C.foliageFar,map:Le(),roughness:1});this.disposables.push(y,A,R,ce);const $=new N;$.name="leftFrame";const ge=he(13,.6,y);ge.castShadow=!0,$.add(ge),$.add(this.placeCanopy(11.6,1.05,R,7)),this.addForest($);const Z=new N;Z.name="rightFrame";const ve=he(13.6,.66,A);ve.castShadow=!0,Z.add(ve),Z.add(this.placeCanopy(12.2,1.1,R,11)),this.addForest(Z);const Ke=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],xe=[],be=[];Ke.forEach(([p,D,x],I)=>{const W=he(x,x*.05,A).geometry.clone();W.translate(p,0,D),xe.push({geometry:W});const J=this.placeCanopy(x*.92,x*.16,ce,I*13+5),De=J.geometry.clone();De.translate(p,x*.92,D),be.push({geometry:De}),J.geometry.dispose()});const we=new d(U(xe),A);we.name="farTrunks";const Me=new d(U(be),ce);Me.name="farCanopies",this.addForest(we),this.addForest(Me);const K=new N;K.name="canopyTop",K.add(this.placeCanopy(0,.55,R,3)),this.addForest(K),this.foliage.push(K);for(const[p,D]of[["canopyleft",-1],["canopyright",1]]){const x=new N;x.name=p,x.add(this.placeCanopy(0,.7,R,D<0?17:23)),this.addForest(x),this.foliage.push(x)}const ye=new H({map:It(),transparent:!0,blending:pe,depthWrite:!1,side:ae,opacity:.85}),Ce=[];for(const[p,D,x,I,W]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])Ce.push({geometry:new k(x,I),position:[p,I/2-.4,D],rotation:[0,0,W]});const Te=new d(U(Ce),ye);Te.renderOrder=2,this.addForest(Te),this.disposables.push(ye);const Se=new H({map:Gt(),transparent:!0,depthWrite:!1,side:ae,opacity:.55}),_e=[];for(const[p,D,x]of[[-6,.7,1.6],[-12,1.1,2.2]])_e.push({geometry:new k(26*x,3.4*x),position:[0,D,p]});const Pe=new d(U(_e),Se);Pe.renderOrder=1,this.addForest(Pe),this.disposables.push(Se),this.lion=Yt(),this.lion.group.position.set(-.3,0,1.6),this.lion.group.rotation.y=-.12,this.lion.group.scale.setScalar(.85),this.lion.group.traverse(p=>{p instanceof d&&(p.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=qt(),this.traveler.group.position.set(.35,0,2.6),this.traveler.group.rotation.y=Math.PI-.25,this.traveler.group.scale.setScalar(.6),this.traveler.group.traverse(p=>{p instanceof d&&(p.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=Xt(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new Ht(this.renderer,this.scene,this.camera,{quality:Ge()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.loadPlates(),this.animate()}renderer;postfx;scene=new wt;camera;clock=new Mt;lion;forest=[];loaded={plates:!1};plates=null;ground=null;traveler;leaves;foliage=[];matrix=new je;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get assets(){return{...this.loaded}}get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,o){const a=jt(t,s,o);return a.position.y=e,a}alignToNdc(e,t,s,o){e.position.z=o;const a=new S;for(let r=0;r<8;r+=1){e.getWorldPosition(a),a.project(this.camera);const{width:l,height:n}=Qt(this.camera.aspect,o);e.position.x+=(t-a.x)*l*.85,e.position.y+=(s-a.y)*n*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const o=this.scene.getObjectByName("canopyTop");o&&this.alignToNdc(o,0,1.06,-1.2-.6);for(const[a,r]of[["canopyleft",-1],["canopyright",1]]){const l=this.scene.getObjectByName(a);l&&this.alignToNdc(l,r*.9,.92,-1.2)}}addForest(e){this.scene.add(e),this.forest.push(e)}loadPlates(){const e=new me(this.camera,{base:"./title/layers/",quality:Ge(),onReady:()=>{this.loaded.plates=!0,this.hideProcedural(),this.postfx?.setPainterly(.18)}});this.plates=e,this.scene.add(e.object3d)}hideProcedural(){for(const e of this.forest)e.visible=!1;this.ground&&(this.ground.visible=!1),this.lion.group.visible=!1,this.traveler.group.visible=!1}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const o=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,fe+Math.max(0,s-1)*.4,o),this.camera.lookAt(0,de,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout(),this.plates?.layout()}setPointer(e,t){this.plates?.setPointer(e,t)}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4,this.plates?.update(t);const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=this.lion.headBaseY+Math.sin(t*2.1)*.014,this.lion.ears.forEach((c,h)=>{const u=Math.max(0,Math.sin(t*.9+h*2.1)-.93)*12;c.rotation.z=(h===0?.34:-.34)+u*(h===0?1:-1)}),this.lion.tail.forEach((c,h)=>{c.rotation.y=Math.sin(t*1.1-h*.5)*(.12+h*.05)*(.8+this.wind*.6),c.rotation.x=-.1+Math.sin(t*.8-h*.4)*.08});const o=this.traveler.cloak,a=o.geometry.attributes.position,r=this.traveler.basePositions;for(let c=0;c<a.count;c+=1){const h=r[c*3]??0,u=r[c*3+1]??0,g=r[c*3+2]??0,v=Math.max(0,.55-u)/.55,M=Math.atan2(g,h),w=this.wind*(.14+.06*Math.sin(t*2.6+M*3));a.setXYZ(c,h+Math.sin(M)*v*w+Math.sin(t*3+M*2)*v*.014,u-Math.abs(w)*v*.07,g+Math.cos(M)*v*w+Math.cos(t*2.4+M*2)*v*.014)}a.needsUpdate=!0,o.geometry.computeVertexNormals(),this.foliage.forEach((c,h)=>{c.rotation.z=Math.sin(t*.9+h)*.028*(.6+this.wind)});const{mesh:l,state:n}=this.leaves,f=n.length/6;for(let c=0;c<f;c+=1){const h=c*6;let u=n[h]??0,g=n[h+1]??0,v=n[h+2]??0;const M=n[h+3]??1,w=n[h+4]??0,z=n[h+5]??1;u+=(M*(.6+this.wind)+.35)*e*1.7,g+=Math.sin(t*1.6+w)*e*.5,v+=Math.cos(t*1.1+w)*e*.3,u>8&&(u=-8,g=.4+Math.random()*4.8,v=-5+Math.random()*10),n[h]=u,n[h+1]=g,n[h+2]=v;const m=.85+Math.sin(t*2+w)*.15;this.matrix.compose(new S(u,g,v),new Ye().setFromEuler(new qe(t*z,w+t*.8,Math.sin(t*1.5+w)*.7)),new S(m,m,m)),l.setMatrixAt(c,this.matrix)}l.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof d))return;e+=1;const o=s.geometry,a=o.getAttribute("position"),r=o.getIndex();r?t+=r.count/3:a&&(t+=a.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new S;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof d){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),Ot(),this.renderer.dispose()}}export{C as TITLE_PALETTE,Kt as TitleScene};
//# sourceMappingURL=titleScene-DmtE4qUR.js.map
