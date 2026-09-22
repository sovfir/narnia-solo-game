import{M as G,A as ne,a as d,P as F,T as tt,G as O,V as S,S as L,R as V,b as Y,L as st,C as me,c as M,I as Qe,D as ot,d as ge,e as k,O as at,B as je,F as Fe,U as X,W as Z,H as q,N as Ye,f as rt,g as Ee,h as it,i as nt,j as lt,k as ct,l as ht,m as ut,n as ft,o as dt,p as Ze,q as pt,r as mt,s as gt,t as ie,u as vt,v as xt,w as bt,x as wt,y as Mt,z as ke,E as yt,J as Be,K as ae,Q as E,X as Ct,Y as Tt,Z as qe,_ as Xe,$ as $e,a0 as _,a1 as P,a2 as te,a3 as ze,a4 as Ne}from"./three.module-C1lOtZGn.js";import{m as St}from"./BufferGeometryUtils-DU3JlbhV.js";const _t={vertexShader:`
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
    uniform float uTime;
    uniform float uRipple;
    uniform float uFoam;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * uRepeat;
      // две волны разной частоты идут навстречу — поверхность колышется, а не едет
      float swell = sin(uv.x * 6.0 + uTime * 0.9) * 0.5 + sin(uv.y * 4.0 - uTime * 0.7) * 0.5;
      vec2 shifted = uv + uOffset + vec2(swell, swell * 0.6) * uRipple;
      vec3 color = texture2D(uTile, shifted).rgb;
      // вторая выборка со сдвигом подчёркивает блики на гребнях
      vec3 crest = texture2D(uTile, shifted + vec2(0.03, -0.02)).rgb;
      color = mix(color, max(color, crest), 0.35);
      // пена у берега: чем ниже в кадре, тем сильнее, и она пульсирует
      float shore = smoothstep(0.45, 0.02, vUv.y);
      color += shore * uFoam * (0.6 + 0.4 * sin(uTime * 1.7 + vUv.x * 14.0)) * vec3(0.92, 0.96, 1.0);
      float alpha = texture2D(uMask, vUv).a * uOpacity;
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color, alpha);
    }`},Oe=.02,Le=12,fe={forest:26,ground:15,lion:10,trunk_right:7.5,trunk_left:7,traveler:5.5,water:16,clouds:30},Pt=Object.entries(fe).map(([i,e])=>({name:i,depth:e}));class ve{constructor(e,t){this.camera=e,this.root.name="titlePlates",this.sunTexture=ve.sunTexture();const s=new G({map:this.sunTexture,transparent:!0,depthWrite:!1,fog:!1,blending:ne,opacity:.07});this.sun=new d(new F(1,1),s),this.sun.name="plate_sun",this.sun.renderOrder=0,this.root.add(this.sun);const o=new tt;this.build(o,t),this.base=performance.now()}root=new O;plates=[];textures=[];sun;sunTexture;pointer=new S;drift=0;base=0;lastTime=0;async build(e,t){let s=Pt;try{const o=await fetch(`${t.base}manifest.json`);if(o.ok){const a=await o.json();Array.isArray(a)&&a.length&&(s=a.map(r=>typeof r=="string"?{name:r,depth:fe[r]??12}:{...r,depth:r.depth??fe[r.name]??12}))}}catch{}s=[...s].sort((o,a)=>a.depth-o.depth);for(const o of s){if(o.mask&&o.tile){const f=new L({..._t,transparent:!0,depthWrite:!1,uniforms:{uTile:{value:e.load(`${t.base}${o.tile}.webp`,u=>{u.wrapS=u.wrapT=V,u.colorSpace=Y})},uMask:{value:e.load(`${t.base}${o.mask}.webp`)},uOffset:{value:new S(0,0)},uRepeat:{value:new S(...o.repeat??[1,1])},uOpacity:{value:o.opacity??1},uTime:{value:0},uRipple:{value:o.ripple??.01},uFoam:{value:o.foam??0}}}),c=new d(new F(1,1),f);c.name=`plate_${o.name}`,c.renderOrder=s.indexOf(o),this.root.add(c),this.plates.push({mesh:c,material:f,depth:o.depth,scroll:o.scroll,offset:f.uniforms.uOffset.value,swell:o.name.startsWith("water")?.05:void 0,shader:f}),this.textures.push(f.uniforms.uTile.value,f.uniforms.uMask.value);continue}const a=new G({transparent:!0,depthWrite:!1,fog:!1,toneMapped:!1}),r=new d(new F(1,1),a);r.name=`plate_${o.name}`,r.renderOrder=s.indexOf(o),this.root.add(r);const l={mesh:r,material:a,depth:o.depth,scroll:o.scroll,swell:o.name.startsWith("water")?.05:void 0};this.plates.push(l);const n=e.load(`${t.base}${o.name}.webp`,()=>{(o.name==="forest"||s.length===1)&&t.onReady?.()},void 0,()=>{this.root.remove(r);const f=this.plates.findIndex(c=>c.mesh===r);f>=0&&this.plates.splice(f,1),a.dispose()});n.colorSpace=Y,n.minFilter=st,n.generateMipmaps=!1,o.repeat&&(n.wrapS=n.wrapT=V,n.repeat.set(o.repeat[0],o.repeat[1])),o.scroll&&(n.wrapS=n.wrapT=V),a.map=n,o.opacity!==void 0&&(a.opacity=o.opacity),l.map=n,this.textures.push(n)}this.layout()}static sunTexture(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(128,128,8,128,128,128);s.addColorStop(0,"rgba(255, 232, 178, 0.95)"),s.addColorStop(.45,"rgba(255, 206, 132, 0.35)"),s.addColorStop(1,"rgba(255, 190, 110, 0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const o=new me(e);return o.colorSpace=Y,o}get object3d(){return this.root}setPointer(e,t){this.pointer.set(e,t)}layout(){const e=l=>Math.tan(this.camera.fov/2*(Math.PI/180))*l,t=new M,s=new M,o=new M;this.camera.getWorldDirection(t),s.crossVectors(t,this.camera.up).normalize(),o.crossVectors(s,t).normalize();for(const l of this.plates){const{mesh:n,depth:f}=l,c=e(f),u=c*this.camera.aspect,g=1+Oe*(Le/f)*2+.02,v=n.geometry;(v.parameters.width!==2*u*g||v.parameters.height!==2*c*g)&&(n.geometry.dispose(),n.geometry=new F(2*u*g,2*c*g)),n.position.copy(this.camera.position).addScaledVector(t,f),n.quaternion.copy(this.camera.quaternion),l.baseY=n.position.y}const a=9,r=e(a);this.sun.geometry.dispose(),this.sun.geometry=new F(r*this.camera.aspect*3.2,r*2.6),this.sun.position.copy(this.camera.position),this.sun.quaternion.copy(this.camera.quaternion),this.sun.translateZ(-a)}update(e){const t=this.lastTime?Math.min(.05,e-this.lastTime):0;this.lastTime=e;for(const h of this.plates){if(h.shader&&(h.shader.uniforms.uTime.value=e),h.offset&&h.scroll){h.offset.x=(h.offset.x+h.scroll[0]*t)%1,h.offset.y=(h.offset.y+h.scroll[1]*t)%1;continue}const g=h.map;!g||!h.scroll||(g.offset.x=(g.offset.x+h.scroll[0]*t)%1,g.offset.y=(g.offset.y+h.scroll[1]*t)%1,h.swell&&h.baseY!==void 0&&(h.mesh.position.y=h.baseY+Math.sin(e*.6+h.depth)*h.swell))}const s=Math.sin(e*.11)*.55+Math.sin(e*.37)*.2,o=Math.cos(e*.09)*.5+Math.sin(e*.23)*.18,a=this.pointer.x*.7,r=this.pointer.y*.5;this.drift=Math.sin(e*.13)*.5+.5;const l=new M,n=new M,f=new M;this.camera.getWorldDirection(l),n.crossVectors(l,this.camera.up).normalize(),f.crossVectors(n,l).normalize();const c=h=>Math.tan(this.camera.fov/2*(Math.PI/180))*h;for(const{mesh:h,material:g,depth:v}of this.plates){const y=Oe*(Le/v),w=(s+a)*y,N=(o+r)*y*.7,m=c(v);h.position.copy(this.camera.position).addScaledVector(l,v).addScaledVector(n,w*m*this.camera.aspect).addScaledVector(f,N*m);const C=Math.sin(e*.13)*.5+.5,A=(v>20?.1:.06)*(C-.5)*2,R=g;R.color&&R.color.setRGB(1+A,1+A*.35,1-A*.8)}const u=this.sun.material;u.opacity=.06+Math.sin(e*.17)*.03,this.sun.position.x+=Math.sin(e*.05)*.02}get hasSea(){return this.plates.some(e=>e.mesh.name==="plate_water")}dispose(){for(const{mesh:e}of this.plates)e.geometry.dispose();for(const{material:e}of this.plates)e.dispose();for(const e of this.textures)e.dispose();this.sun.geometry.dispose(),this.sun.material.dispose(),this.sunTexture.dispose(),this.root.removeFromParent()}}class xe{constructor(e,t){this.camera=e;const s=Math.tan(e.fov/2*(Math.PI/180))*t.depth;this.halfWidth=s*e.aspect,this.shoreY=1-t.shoreFraction*2,this.shoreY*=s,this.baseZ=e.position.z-t.depth,this.texture=xe.dropTexture();const o=new F(1,1),a=new G({map:this.texture,transparent:!0,depthWrite:!1,blending:ne,opacity:.9,fog:!1,toneMapped:!1});this.mesh=new Qe(o,a,t.count),this.mesh.instanceMatrix.setUsage(ot),this.mesh.frustumCulled=!1,this.mesh.renderOrder=6,this.mesh.name="spray";for(let r=0;r<t.count;r+=1)this.drops.push(this.spawn(!0)),this.mesh.setColorAt(r,this.colour.setScalar(0))}mesh;drops=[];halfWidth;shoreY;baseZ;matrix=new ge;colour=new k;texture;static dropTexture(){const e=document.createElement("canvas");e.width=e.height=64;const t=e.getContext("2d"),s=t.createRadialGradient(32,32,1,32,32,32);s.addColorStop(0,"rgba(255, 255, 255, 1)"),s.addColorStop(.35,"rgba(235, 245, 255, 0.75)"),s.addColorStop(1,"rgba(200, 225, 255, 0)"),t.fillStyle=s,t.fillRect(0,0,64,64);const o=new me(e);return o.colorSpace=Y,o}spawn(e=!1){const t=.9+Math.random()*1.1;return{x:(Math.random()*2-1)*this.halfWidth,y:this.shoreY+(e?Math.random()*1.2:0),z:this.baseZ+(Math.random()*2-1)*.4,vx:(Math.random()*2-1)*.25,vy:.9+Math.random()*1.5,life:e?Math.random()*t:t,maxLife:t,size:.05+Math.random()*.11}}update(e,t){const s=this.drops.length;for(let o=0;o<s;o+=1){const a=this.drops[o];a.life-=e,a.life<=0&&Object.assign(a,this.spawn()),a.vy-=4.2*e,a.vx+=t*.35*e,a.x+=a.vx*e,a.y+=a.vy*e,a.z+=.15*e;const r=Math.max(0,Math.min(1,a.life/(a.maxLife*.6))),l=a.size*(.6+r*.6);this.matrix.compose(new M(a.x,a.y,a.z),this.camera.quaternion,new M(l,l,l)),this.mesh.setMatrixAt(o,this.matrix),this.mesh.setColorAt(o,this.colour.setScalar(r*.9))}this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.texture.dispose(),this.mesh.removeFromParent()}}const re={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class W{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Dt=new at(-1,1,1,-1,0,1);class At extends je{constructor(){super(),this.setAttribute("position",new Fe([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Fe([0,2,0,0,2,0],2))}}const Rt=new At;class le{constructor(e){this._mesh=new d(Rt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Dt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Ke extends W{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof L?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=X.clone(e.uniforms),this.material=new L({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new le(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Ie extends W{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,l;this.inverse?(r=0,l=1):(r=1,l=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(l),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}}class Ut extends W{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Ft{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new S);this._width=s.width,this._height=s.height,t=new Z(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:q}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ke(re),this.copyPass.material.blending=Ye,this.timer=new rt}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let o=0,a=this.passes.length;o<a;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const l=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}Ie!==void 0&&(r instanceof Ie?s=!0:r instanceof Ut&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new S);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Et extends W{constructor(e,t,s=null,o=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new k}render(e,t,s){const o=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}}const kt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new k(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Q extends W{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new S(e.x,e.y):new S(256,256),this.clearColor=new k(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Z(a,r,{type:q,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const u=new Z(a,r,{type:q,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+c,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const h=new Z(a,r,{type:q,depthBuffer:!1});h.texture.name="UnrealBloomPass.v"+c,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),a=Math.round(a/2),r=Math.round(r/2)}const l=kt;this.highPassUniforms=X.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new L({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];const n=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(n[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new S(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const f=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=f,this.bloomTintColors=[new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=X.clone(re.uniforms),this.blendMaterial=new L({uniforms:this.copyUniforms,vertexShader:re.vertexShader,fragmentShader:re.fragmentShader,premultipliedAlpha:!0,blending:ne,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new k,this._oldClearAlpha=1,this._basic=new G,this._fsQuad=new le(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new S(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let l=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=l.texture,this.separableBlurMaterials[n].uniforms.direction.value=Q.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=Q.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),l=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);const o=[],a=[];for(let r=1;r<e;r+=2){const l=t[r],n=r+1<e?t[r+1]:0,f=l+n;o.push((r*l+(r+1)*n)/f),a.push(f)}return new L({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new S(.5,.5)},direction:{value:new S(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}}Q.BlurDirectionX=new S(1,0);Q.BlurDirectionY=new S(0,1);const se={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};class Bt extends W{constructor(e,t,s){super(),this.scene=e,this.camera=t;const o=s.focus!==void 0?s.focus:1,a=s.aperture!==void 0?s.aperture:.025,r=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new Z(1,1,{minFilter:Ee,magFilter:Ee,type:q}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new it,this._materialDepth.depthPacking=nt,this._materialDepth.blending=Ye;const l=X.clone(se.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=o,l.aspect.value=t.aspect,l.aperture.value=a,l.maxblur.value=r,l.nearClip.value=t.near,l.farClip.value=t.far,this.materialBokeh=new L({defines:Object.assign({},se.defines),uniforms:l,vertexShader:se.vertexShader,fragmentShader:se.fragmentShader}),this.uniforms=l,this._fsQuad=new le(this.materialBokeh),this._oldClearColor=new k}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const o=e.getClearAlpha(),a=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(o),e.autoClear=a}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const oe={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class zt extends W{constructor(){super(),this.isOutputPass=!0,this.uniforms=X.clone(oe.uniforms),this.material=new lt({name:oe.name,uniforms:this.uniforms,vertexShader:oe.vertexShader,fragmentShader:oe.fragmentShader}),this._fsQuad=new le(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ct.getTransfer(this._outputColorSpace)===ht&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ut?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===dt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ze?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===pt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===mt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===gt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const b=new Map;function B(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function z(i,e=[1,1]){const t=new me(i.canvas);return t.wrapS=V,t.wrapT=V,t.repeat.set(e[0],e[1]),t.colorSpace=Y,t.anisotropy=4,t}function ce(i,e){const{width:t,height:s}=i.canvas;for(let o=0;o<e.count;o+=1){const a=e.colors[Math.floor(Math.random()*e.colors.length)],r=e.minSize+Math.random()*(e.maxSize-e.minSize);i.globalAlpha=e.alpha*(.5+Math.random()*.5),i.fillStyle=a,i.beginPath();const l=Math.random()*t,n=Math.random()*s;e.horizontal?i.ellipse(l,n,r,r*(.25+Math.random()*.35),0,0,Math.PI*2):i.ellipse(l,n,r*(.3+Math.random()*.3),r,0,0,Math.PI*2),i.fill()}i.globalAlpha=1}function Ge(){const i=b.get("bark");if(i)return i;const e=B(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let o=0;o<90;o+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const a=Math.random()*256;e.moveTo(a,0);for(let r=0;r<=512;r+=32)e.lineTo(a+Math.sin(r*.02+o)*5,r);e.stroke()}e.globalAlpha=1,ce(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=z(e,[2,1]);return b.set("bark",s),s}function Ve(){const i=b.get("foliage");if(i)return i;const e=B(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),ce(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=z(e,[2,2]);return b.set("foliage",t),t}function Nt(){const i=b.get("grass");if(i)return i;const e=B(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),ce(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const o=Math.random()*512,a=Math.random()*512;e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*8,a-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=z(e,[10,10]);return b.set("grass",t),t}function Ot(){const i=b.get("cloth");if(i)return i;const e=B(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const o=Math.random()*256;e.moveTo(o,0),e.bezierCurveTo(o+20,80,o-20,170,o+10,256),e.stroke()}e.globalAlpha=1,ce(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=z(e,[2,2]);return b.set("cloth",t),t}function Lt(){const i=b.get("leaf");if(i)return i;const e=B(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=z(e);return s.wrapS=ie,s.wrapT=ie,b.set("leaf",s),s}function It(){for(const i of b.values())i.dispose();b.clear()}function Gt(){const i=b.get("grain");if(i)return i;const e=B(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let o=0;o<t.data.length;o+=4){const a=128+(Math.random()-.5)*70;t.data[o]=a,t.data[o+1]=a,t.data[o+2]=a}e.putImageData(t,0,0);const s=z(e,[8,8]);return b.set("grain",s),s}function Vt(){const i=b.get("shaft");if(i)return i;const e=B(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let o=0;o<160;o+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const a=Math.random()*512,r=6+Math.random()*26;e.fillRect(0,a,r,10+Math.random()*40),e.fillRect(128-r,a,r,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=z(e);return s.wrapS=ie,s.wrapT=ie,b.set("shaft",s),s}function Wt(){const i=b.get("mist");if(i)return i;const e=B(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let o=0;o<220;o+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const a=Math.random()*512,r=Math.random()*128;e.beginPath(),e.ellipse(a,r,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=z(e,[2,1]);return b.set("mist",s),s}function Ht(){const i=b.get("stroke-angle");if(i)return i;const e=B(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const o=Math.random()*256,a=Math.random()*256,r=12+Math.random()*46,l=Math.random()*255,n=e.createRadialGradient(o,a,0,o,a,r);n.addColorStop(0,`rgba(${l}, ${l}, ${l}, 0.55)`),n.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=n,e.fillRect(o-r,a-r,r*2,r*2)}const t=z(e,[1,1]);return t.wrapS=V,t.wrapT=V,b.set("stroke-angle",t),t}function We(){const i=b.get("fur");if(i)return i;const e=B(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const o=Math.random()*256,a=Math.random()*256,r=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(o,a),e.lineTo(o+(Math.random()-.5)*5,a+r),e.stroke()}e.globalAlpha=1;const t=z(e,[3,3]);return b.set("fur",t),t}const Qt={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new S(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
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
  `};class jt{constructor(e,t,s,o){this.renderer=e,this.scene=t,this.camera=s,this.composer=new Ft(e),this.renderPass=new Et(t,s),this.composer.addPass(this.renderPass),o.quality!=="low"?(this.bloom=new Q(new S(1,1),.22,.7,.9),this.composer.addPass(this.bloom)):this.bloom=null,o.quality==="high"?(this.bokeh=new Bt(t,s,{focus:14,aperture:.0013,maxblur:.008}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new Ke(Qt),this.painterly.uniforms.tAngle.value=Ht(),this.painterly.uniforms.uLength.value=o.quality==="high"?13:9,this.painterly.uniforms.uStrength.value=o.quality==="high"?.6:.52,this.composer.addPass(this.painterly),this.composer.addPass(new zt)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setPainterly(e){this.painterly.uniforms.uStrength.value=e}setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const T={sky:12575970,fog:3364442,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:6581056,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Je=42,de=1.45,pe=1;function Yt(i,e){const t=Math.hypot(e+7.4,de-pe),s=Math.tan(Je/2*(Math.PI/180))*t;return{width:s*i,height:s}}function U(i){const e=i.map(s=>{const o=s.geometry.clone();return o.applyMatrix4(new ge().compose(new M(...s.position??[0,0,0]),new qe().setFromEuler(new Xe(...s.rotation??[0,0,0])),new M(...s.scale??[1,1,1]))),o.index?o.toNonIndexed():o}),t=St(e,!1)??new je;for(const s of e)s.dispose();for(const s of i)s.geometry.dispose();return t}function j(i){return new E({color:i.color,map:i.map,roughness:i.roughness??.92,metalness:0})}function ue(i,e,t){const s=[];for(let r=0;r<=14;r+=1){const l=r/14,n=1+Math.pow(1-l,3)*1.35,f=1-l*.42,c=1+Math.sin(l*Math.PI*3)*.035;s.push(new S(e*f*n*c,l*i))}const a=new $e(s,32);return a.computeVertexNormals(),new d(a,t)}function Zt(i,e,t){const s=[];let o=t;const a=()=>(o=o*16807%2147483647,o/2147483647);for(let r=0;r<6;r+=1){const l=a()*Math.PI*2,n=a()*i*.55,f=i*(.42+a()*.3);s.push({geometry:new P(f,12,9),position:[Math.cos(l)*n,(a()-.35)*i*.45,Math.sin(l)*n],scale:[1.05,.85+a()*.25,1.05]})}return new d(U(s),e)}function qt(){const e=new O,t=new E({color:T.lionBody,roughness:.9,metalness:0}),s=new E({color:T.lionBodyDark,roughness:.92,metalness:0}),o=new E({color:T.lionMane,roughness:.98,metalness:0,bumpMap:We(),bumpScale:.06}),a=new E({color:T.lionManeLight,roughness:.98,metalness:0,bumpMap:We(),bumpScale:.05});new E({color:T.muzzle,roughness:.85,metalness:0});const r=new E({color:T.face,roughness:.45,metalness:0});e.add(new d(U([{geometry:new _(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new _(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new P(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new P(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new P(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),t));const l=[],n=[];for(const m of[-.24,.24]){l.push({geometry:new te(.095,.115,.98,12),position:[m,.52,.22]}),n.push({geometry:new P(.14,12,10),position:[m,.09,.3],scale:[1.05,.62,1.5]});for(const C of[-.06,0,.06])n.push({geometry:new P(.045,8,6),position:[m+C,.05,.46]})}for(const m of[-.44,.44])l.push({geometry:new te(.115,.135,.52,12),position:[m,.3,-.18],rotation:[1,0,0]}),n.push({geometry:new P(.15,12,10),position:[m,.09,.06],scale:[1.1,.62,1.6]});e.add(new d(U(l),t)),e.add(new d(U(n),s));const f=new d(new P(.44,26,20),t);f.position.set(0,1,.16),f.scale.set(1,1.15,.95),e.add(f);const c=new O;c.position.set(0,1.78,.14),c.add(new d(U([{geometry:new P(.29,26,20),scale:[1,.96,1.06]},{geometry:new te(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new P(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new ze(.34,.05,.14),position:[0,.12,.24]}]),t)),c.add(new d(new Ne(.075,.1,3),r).translateY(0).translateZ(0));const u=c.children[c.children.length-1];u.position.set(0,-.08,.47),u.rotation.set(Math.PI/2,0,Math.PI),c.add(new d(new ze(.13,.012,.08),r).translateY(0).translateZ(0)),c.children[c.children.length-1].position.set(0,-.22,.4),c.add(new d(U([{geometry:new P(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new P(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),r));const g=[{geometry:new _(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new _(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new _(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new _(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new _(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new _(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new _(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new _(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],v=[{geometry:new _(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new _(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new _(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];c.add(new d(U(g),o)),c.add(new d(U(v),a));const y=[];for(const m of[-.23,.23]){const C=new d(new Ne(.095,.17,5),a);C.position.set(m,.3,.06),C.rotation.z=m<0?.4:-.4,c.add(C),y.push(C)}e.add(c);const w=[];let N=e;for(let m=0;m<2;m+=1){const C=new O;C.position.set(0,m===0?.5:.02,m===0?-.94:-.3);const A=new d(new te(.07-m*.012,.08-m*.012,.32,10),t);if(A.rotation.x=Math.PI/2+.5,A.position.z=-.16,C.add(A),m===1){const R=new d(new _(.11,0),o);R.scale.set(.9,1.5,.9),R.position.set(0,-.18,-.3),C.add(R)}N.add(C),N=C,w.push(C)}return e.scale.setScalar(1.16),{group:e,head:c,headBaseY:1.34,tail:w,ears:y,chest:f}}function Xt(){const i=new O,e=j({color:T.cloth,map:Ot(),roughness:.95}),t=new E({color:T.clothDark,roughness:.9,metalness:0}),s=[],o=16;for(let c=0;c<=o;c+=1){const u=c/o,h=.16+Math.pow(u,1.5)*.3+Math.sin(u*Math.PI)*.05;s.push(new S(h,1.02-u*1))}const a=new $e(s,32);a.computeVertexNormals();const r=new d(a,e);i.add(r);const l=new d(new P(.18,16,12),e);l.scale.set(1,1.12,1.08),l.position.set(0,1.06,.01),i.add(l);const n=new d(new P(.2,14,11),e);n.scale.set(1.5,.6,.9),n.position.set(0,.92,0),i.add(n);const f=new d(new P(.1,12,10),t);return f.scale.set(1,1.15,.6),f.position.set(0,1.05,.13),i.add(f),i.scale.setScalar(.68),{group:i,cloak:r,basePositions:Float32Array.from(a.attributes.position.array)}}function $t(i){const e=new F(.17,.24),t=new E({map:Lt(),transparent:!0,alphaTest:.4,side:ae,roughness:1,metalness:0}),s=new Qe(e,t,i);s.frustumCulled=!1;const o=new Float32Array(i*6);for(let a=0;a<i;a+=1)o[a*6+0]=-6+Math.random()*12,o[a*6+1]=.4+Math.random()*4.8,o[a*6+2]=-5+Math.random()*10,o[a*6+3]=.5+Math.random()*1.2,o[a*6+4]=Math.random()*Math.PI*2,o[a*6+5]=(Math.random()-.5)*3;return{mesh:s,state:o}}function He(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const i=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!i&&e>=4?"high":e>=4?"medium":"low"}class es{constructor(e){this.canvas=e,this.renderer=new vt({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=xt,this.renderer.toneMapping=Ze,this.renderer.toneMappingExposure=.72,this.scene.background=new k(T.sky),this.scene.fog=new bt(T.fog,16,30),this.camera=new wt(Je,2/3,.1,90),this.camera.position.set(0,de,7.4),this.camera.lookAt(0,pe,0);const t=Gt();this.scene.add(new Mt(14479344,3498094,1.05));const s=new ke(16761976,1.15);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const o=new ke(8832742,1.5);o.position.set(-5,3,5),this.scene.add(o);const a=new yt(16767392,13,12,Math.PI/9,.8,1.6);a.position.set(-1.4,4.2,4.6),a.target.position.set(-.3,1,1.6),this.scene.add(a),this.scene.add(a.target);const r=new F(70,40,1,8),l=r.attributes.position,n=new Float32Array(l.count*3),f=new k(T.sky),c=new k(T.fog);for(let p=0;p<l.count;p+=1){const D=(l.getY(p)+20)/40,x=c.clone().lerp(f,D);n[p*3]=x.r,n[p*3+1]=x.g,n[p*3+2]=x.b}r.setAttribute("color",new Be(n,3));const u=new G({vertexColors:!0,fog:!1,side:ae}),h=new d(r,u);h.position.set(0,8,-22),this.addForest(h),this.disposables.push(r,u);const g=new F(46,46,18,18),v=g.attributes.position,y=new Float32Array(v.count*3),w=new k;for(let p=0;p<v.count;p+=1){const D=v.getX(p),x=v.getY(p);v.setZ(p,Math.sin(D*.28)*.09+Math.cos(x*.24)*.07);const I=(Math.sin(D*.5)+Math.cos(x*.42))*.5,H=I>.35?1.16:I<-.35?.82:1,ee=Math.min(1,Math.max(0,x/23));w.setHex(T.grass).multiplyScalar(H*(1-ee*.3)),y[p*3]=w.r,y[p*3+1]=w.g,y[p*3+2]=w.b}g.setAttribute("color",new Be(y,3)),g.computeVertexNormals();const N=new E({map:Nt(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),m=new d(g,N);m.rotation.x=-Math.PI/2,m.receiveShadow=!0,this.ground=m,this.scene.add(m),this.disposables.push(g,N);const C=j({color:T.bark,map:Ge()}),A=j({color:T.barkFar,map:Ge(),roughness:1}),R=j({color:T.foliage,map:Ve(),roughness:1}),he=j({color:T.foliageFar,map:Ve(),roughness:1});this.disposables.push(C,A,R,he);const $=new O;$.name="leftFrame";const be=ue(13,.6,C);be.castShadow=!0,$.add(be),$.add(this.placeCanopy(11.6,1.05,R,7)),this.addForest($);const K=new O;K.name="rightFrame";const we=ue(13.6,.66,A);we.castShadow=!0,K.add(we),K.add(this.placeCanopy(12.2,1.1,R,11)),this.addForest(K);const et=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],Me=[],ye=[];et.forEach(([p,D,x],I)=>{const H=ue(x,x*.05,A).geometry.clone();H.translate(p,0,D),Me.push({geometry:H});const ee=this.placeCanopy(x*.92,x*.16,he,I*13+5),Ue=ee.geometry.clone();Ue.translate(p,x*.92,D),ye.push({geometry:Ue}),ee.geometry.dispose()});const Ce=new d(U(Me),A);Ce.name="farTrunks";const Te=new d(U(ye),he);Te.name="farCanopies",this.addForest(Ce),this.addForest(Te);const J=new O;J.name="canopyTop",J.add(this.placeCanopy(0,.55,R,3)),this.addForest(J),this.foliage.push(J);for(const[p,D]of[["canopyleft",-1],["canopyright",1]]){const x=new O;x.name=p,x.add(this.placeCanopy(0,.7,R,D<0?17:23)),this.addForest(x),this.foliage.push(x)}const Se=new G({map:Vt(),transparent:!0,blending:ne,depthWrite:!1,side:ae,opacity:.85}),_e=[];for(const[p,D,x,I,H]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])_e.push({geometry:new F(x,I),position:[p,I/2-.4,D],rotation:[0,0,H]});const Pe=new d(U(_e),Se);Pe.renderOrder=2,this.addForest(Pe),this.disposables.push(Se);const De=new G({map:Wt(),transparent:!0,depthWrite:!1,side:ae,opacity:.55}),Ae=[];for(const[p,D,x]of[[-6,.7,1.6],[-12,1.1,2.2]])Ae.push({geometry:new F(26*x,3.4*x),position:[0,D,p]});const Re=new d(U(Ae),De);Re.renderOrder=1,this.addForest(Re),this.disposables.push(De),this.lion=qt(),this.lion.group.position.set(-.3,0,1.6),this.lion.group.rotation.y=-.12,this.lion.group.scale.setScalar(.85),this.lion.group.traverse(p=>{p instanceof d&&(p.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=Xt(),this.traveler.group.position.set(.35,0,2.6),this.traveler.group.rotation.y=Math.PI-.25,this.traveler.group.scale.setScalar(.6),this.traveler.group.traverse(p=>{p instanceof d&&(p.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=$t(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new jt(this.renderer,this.scene,this.camera,{quality:He()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.loadPlates(),this.animate()}renderer;postfx;scene=new Ct;camera;clock=new Tt;lion;forest=[];loaded={plates:!1};plates=null;spray=null;ground=null;traveler;leaves;foliage=[];matrix=new ge;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get assets(){return{...this.loaded}}get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,o){const a=Zt(t,s,o);return a.position.y=e,a}alignToNdc(e,t,s,o){e.position.z=o;const a=new M;for(let r=0;r<8;r+=1){e.getWorldPosition(a),a.project(this.camera);const{width:l,height:n}=Yt(this.camera.aspect,o);e.position.x+=(t-a.x)*l*.85,e.position.y+=(s-a.y)*n*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const o=this.scene.getObjectByName("canopyTop");o&&this.alignToNdc(o,0,1.06,-1.2-.6);for(const[a,r]of[["canopyleft",-1],["canopyright",1]]){const l=this.scene.getObjectByName(a);l&&this.alignToNdc(l,r*.9,.92,-1.2)}}addForest(e){this.scene.add(e),this.forest.push(e)}loadPlates(){const e=new ve(this.camera,{base:"./title/layers/",quality:He(),onReady:()=>{this.loaded.plates=!0,this.hideProcedural(),e.hasSea&&(this.spray=new xe(this.camera,{count:90,depth:15,shoreFraction:.78}),this.scene.add(this.spray.mesh)),this.postfx?.setPainterly(.18)}});this.plates=e,this.scene.add(e.object3d)}hideProcedural(){for(const e of this.forest)e.visible=!1;this.ground&&(this.ground.visible=!1),this.lion.group.visible=!1,this.traveler.group.visible=!1}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const o=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,de+Math.max(0,s-1)*.4,o),this.camera.lookAt(0,pe,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout(),this.plates?.layout()}setPointer(e,t){this.plates?.setPointer(e,t)}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4,this.plates?.update(t),this.spray?.update(e,this.wind);const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=this.lion.headBaseY+Math.sin(t*2.1)*.014,this.lion.ears.forEach((c,u)=>{const h=Math.max(0,Math.sin(t*.9+u*2.1)-.93)*12;c.rotation.z=(u===0?.34:-.34)+h*(u===0?1:-1)}),this.lion.tail.forEach((c,u)=>{c.rotation.y=Math.sin(t*1.1-u*.5)*(.12+u*.05)*(.8+this.wind*.6),c.rotation.x=-.1+Math.sin(t*.8-u*.4)*.08});const o=this.traveler.cloak,a=o.geometry.attributes.position,r=this.traveler.basePositions;for(let c=0;c<a.count;c+=1){const u=r[c*3]??0,h=r[c*3+1]??0,g=r[c*3+2]??0,v=Math.max(0,.55-h)/.55,y=Math.atan2(g,u),w=this.wind*(.14+.06*Math.sin(t*2.6+y*3));a.setXYZ(c,u+Math.sin(y)*v*w+Math.sin(t*3+y*2)*v*.014,h-Math.abs(w)*v*.07,g+Math.cos(y)*v*w+Math.cos(t*2.4+y*2)*v*.014)}a.needsUpdate=!0,o.geometry.computeVertexNormals(),this.foliage.forEach((c,u)=>{c.rotation.z=Math.sin(t*.9+u)*.028*(.6+this.wind)});const{mesh:l,state:n}=this.leaves,f=n.length/6;for(let c=0;c<f;c+=1){const u=c*6;let h=n[u]??0,g=n[u+1]??0,v=n[u+2]??0;const y=n[u+3]??1,w=n[u+4]??0,N=n[u+5]??1;h+=(y*(.6+this.wind)+.35)*e*1.7,g+=Math.sin(t*1.6+w)*e*.5,v+=Math.cos(t*1.1+w)*e*.3,h>8&&(h=-8,g=.4+Math.random()*4.8,v=-5+Math.random()*10),n[u]=h,n[u+1]=g,n[u+2]=v;const m=.85+Math.sin(t*2+w)*.15;this.matrix.compose(new M(h,g,v),new qe().setFromEuler(new Xe(t*N,w+t*.8,Math.sin(t*1.5+w)*.7)),new M(m,m,m)),l.setMatrixAt(c,this.matrix)}l.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof d))return;e+=1;const o=s.geometry,a=o.getAttribute("position"),r=o.getIndex();r?t+=r.count/3:a&&(t+=a.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new M;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){this.spray?.dispose(),this.spray=null,cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof d){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),It(),this.renderer.dispose()}}export{T as TITLE_PALETTE,es as TitleScene};
//# sourceMappingURL=titleScene-bpVDnsZm.js.map
