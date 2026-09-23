import{B as me,a as ue,T as Ue,M as Q,A as ge,b as v,P as k,G as I,V as T,S as G,R as H,c as re,L as tt,C as Qe,d as C,O as st,F as Ee,U as $,W as X,H as q,N as je,e as ot,f as N,g as Fe,h as rt,i as at,j as it,k as nt,l as lt,m as ct,n as ht,o as ut,p as Ye,q as ft,r as dt,s as pt,t as ne,u as mt,v as gt,w as vt,x as bt,y as xt,D as ke,z as wt,E as ae,I as F,J as yt,K as Mt,Q as Xe,X as qe,Y as $e,Z as Ze,_,$ as D,a0 as te,a1 as Be,a2 as ze,a3 as Tt}from"./three.module-BpywewfO.js";function Ct(n,e=!1){const t=n[0].index!==null,s=new Set(Object.keys(n[0].attributes)),o=new Set(Object.keys(n[0].morphAttributes)),r={},a={},h=n[0].morphTargetsRelative,l=new me;let u=0;for(let i=0;i<n.length;++i){const c=n[i];let d=0;if(t!==(c.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in c.attributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(c.attributes[f]),d++}if(d!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+". Make sure all geometries have the same number of attributes."),null;if(h!==c.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in c.morphAttributes){if(!o.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(c.morphAttributes[f])}if(e){let f;if(t)f=c.index.count;else if(c.attributes.position!==void 0)f=c.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+i+". The geometry must have either an index or a position attribute"),null;l.addGroup(u,f,i),u+=f}}if(t){let i=0;const c=[];for(let d=0;d<n.length;++d){const f=n[d].index;for(let p=0;p<f.count;++p)c.push(f.getX(p)+i);i+=n[d].attributes.position.count}l.setIndex(c)}for(const i in r){const c=Ie(r[i]);if(!c)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+i+" attribute."),null;l.setAttribute(i,c)}for(const i in a){const c=a[i][0].length;if(c!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[i]=[];for(let d=0;d<c;++d){const f=[];for(let m=0;m<a[i].length;++m)f.push(a[i][m][d]);const p=Ie(f);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+i+" morphAttribute."),null;l.morphAttributes[i].push(p)}}}return l}function Ie(n){let e,t,s,o=-1,r=0;for(let u=0;u<n.length;++u){const i=n[u];if(e===void 0&&(e=i.array.constructor),e!==i.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=i.itemSize),t!==i.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(s===void 0&&(s=i.normalized),s!==i.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(o===-1&&(o=i.gpuType),o!==i.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=i.count*t}const a=new e(r),h=new ue(a,t,s);let l=0;for(let u=0;u<n.length;++u){const i=n[u];if(i.isInterleavedBufferAttribute){const c=l/t;for(let d=0,f=i.count;d<f;d++)for(let p=0;p<t;p++){const m=i.getComponent(d,p);h.setComponent(d+c,p,m)}}else a.set(i.array,l);l+=i.count*t}return o!==void 0&&(h.gpuType=o),h}const St={vertexShader:`
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
    }`},Ne=.02,Ge=12,fe={forest:26,ground:15,lion:10,trunk_right:7.5,trunk_left:7,traveler:5.5,water:16,clouds:30},_t=Object.entries(fe).map(([n,e])=>({name:n,depth:e}));class ve{constructor(e,t){if(this.camera=e,this.root.name="titlePlates",this.animated=t.animate!==!1,!this.animated){const r=new Ue;this.build(r,t),this.base=performance.now();return}this.sunTexture=ve.sunTexture();const s=new Q({map:this.sunTexture,transparent:!0,depthWrite:!1,fog:!1,blending:ge,opacity:.07});this.sun=new v(new k(1,1),s),this.sun.name="plate_sun",this.sun.renderOrder=0,this.root.add(this.sun);const o=new Ue;this.build(o,t),this.base=performance.now()}root=new I;plates=[];textures=[];sun=null;sunTexture=null;pointer=new T;drift=0;base=0;lastTime=0;animated=!0;async build(e,t){let s=_t;try{const o=await fetch(`${t.base}manifest.json`);if(o.ok){const r=await o.json();Array.isArray(r)&&r.length&&(s=r.map(a=>typeof a=="string"?{name:a,depth:fe[a]??12}:{...a,depth:a.depth??fe[a.name]??12}))}}catch{}s=[...s].sort((o,r)=>r.depth-o.depth);for(const o of s){if(o.mask&&o.tile){const u=new G({...St,transparent:!0,depthWrite:!1,uniforms:{uTile:{value:e.load(`${t.base}${o.tile}.webp`,c=>{c.wrapS=c.wrapT=H,c.colorSpace=re})},uMask:{value:e.load(`${t.base}${o.mask}.webp`)},uOffset:{value:new T(0,0)},uRepeat:{value:new T(...o.repeat??[1,1])},uOpacity:{value:o.opacity??1},uTime:{value:0},uRipple:{value:o.ripple??.01},uFoam:{value:o.foam??0}}}),i=new v(new k(1,1),u);i.name=`plate_${o.name}`,i.renderOrder=s.indexOf(o),this.root.add(i),this.plates.push({mesh:i,material:u,depth:o.depth,scroll:o.scroll,offset:u.uniforms.uOffset.value,swell:o.name.startsWith("water")?.05:void 0,shader:u}),this.textures.push(u.uniforms.uTile.value,u.uniforms.uMask.value);continue}const r=new Q({transparent:!0,depthWrite:!1,fog:!1,toneMapped:!1}),a=new v(new k(1,1),r);a.name=`plate_${o.name}`,a.renderOrder=s.indexOf(o),this.root.add(a);const h={mesh:a,material:r,depth:o.depth,scroll:o.scroll,swell:o.name.startsWith("water")?.05:void 0,relative:o.relative};this.plates.push(h);const l=e.load(`${t.base}${o.name}.webp`,()=>{this.layout(),(o.name==="forest"||s.length===1)&&t.onReady?.()},void 0,()=>{this.root.remove(a);const u=this.plates.findIndex(i=>i.mesh===a);u>=0&&this.plates.splice(u,1),r.dispose()});l.colorSpace=re,l.minFilter=tt,l.generateMipmaps=!1,o.repeat&&(l.wrapS=l.wrapT=H,l.repeat.set(o.repeat[0],o.repeat[1])),o.scroll&&(l.wrapS=l.wrapT=H),r.map=l,o.opacity!==void 0&&(r.opacity=o.opacity),h.map=l,this.textures.push(l)}this.layout()}static sunTexture(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(128,128,8,128,128,128);s.addColorStop(0,"rgba(255, 232, 178, 0.95)"),s.addColorStop(.45,"rgba(255, 206, 132, 0.35)"),s.addColorStop(1,"rgba(255, 190, 110, 0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const o=new Qe(e);return o.colorSpace=re,o}get object3d(){return this.root}setPointer(e,t){this.pointer.set(e,t)}layout(){const e=h=>Math.tan(this.camera.fov/2*(Math.PI/180))*h,t=new C,s=new C,o=new C;this.camera.getWorldDirection(t),s.crossVectors(t,this.camera.up).normalize(),o.crossVectors(s,t).normalize();for(const h of this.plates){const{mesh:l,depth:u}=h,i=e(u),c=i*this.camera.aspect,d=Ne*(Ge/u),f=(this.animated?1+d*2:1)+.02,m=(h.map??h.shader?.uniforms.uTile?.value)?.image,w=2*c*f,A=2*i*f;let g=w,x=A;if(h.relative&&m?.width&&m?.height){const S=h.relative.size??.65,O=m.width/m.height;g=Math.min(w,A)*S,x=g/O}else if(m?.width&&m?.height){const S=Math.min(w/m.width,A/m.height);g=m.width*S,x=m.height*S}const R=l.geometry;if((Math.abs(R.parameters.width-g)>.001||Math.abs(R.parameters.height-x)>.001)&&(l.geometry.dispose(),l.geometry=new k(g,x)),l.position.copy(this.camera.position).addScaledVector(t,u),h.relative){const S=((h.relative.x??.5)-.5)*w,O=(.5-(h.relative.y??.5))*A;l.position.addScaledVector(s,S).addScaledVector(o,O)}l.quaternion.copy(this.camera.quaternion),h.baseY=l.position.y}if(!this.sun)return;const r=9,a=e(r);this.sun.geometry.dispose(),this.sun.geometry=new k(a*this.camera.aspect*3.2,a*2.6),this.sun.position.copy(this.camera.position),this.sun.quaternion.copy(this.camera.quaternion),this.sun.translateZ(-r)}update(e){if(!this.animated)return;const t=this.lastTime?Math.min(.05,e-this.lastTime):0;this.lastTime=e;for(const c of this.plates){if(c.shader&&(c.shader.uniforms.uTime.value=e),c.offset&&c.scroll){c.offset.x=(c.offset.x+c.scroll[0]*t)%1,c.offset.y=(c.offset.y+c.scroll[1]*t)%1;continue}const d=c.map;!d||!c.scroll||(d.offset.x=(d.offset.x+c.scroll[0]*t)%1,d.offset.y=(d.offset.y+c.scroll[1]*t)%1,c.swell&&c.baseY!==void 0&&(c.mesh.position.y=c.baseY+Math.sin(e*.6+c.depth)*c.swell))}const s=Math.sin(e*.11)*.55+Math.sin(e*.37)*.2,o=Math.cos(e*.09)*.5+Math.sin(e*.23)*.18,r=this.pointer.x*.7,a=this.pointer.y*.5;this.drift=Math.sin(e*.13)*.5+.5;const h=new C,l=new C,u=new C;this.camera.getWorldDirection(h),l.crossVectors(h,this.camera.up).normalize(),u.crossVectors(l,h).normalize();const i=c=>Math.tan(this.camera.fov/2*(Math.PI/180))*c;for(const{mesh:c,material:d,depth:f}of this.plates){const p=Ne*(Ge/f),m=(s+r)*p,w=(o+a)*p*.7,A=i(f);c.position.copy(this.camera.position).addScaledVector(h,f).addScaledVector(l,m*A*this.camera.aspect).addScaledVector(u,w*A);const g=Math.sin(e*.13)*.5+.5,x=(f>20?.1:.06)*(g-.5)*2,R=d;R.color&&R.color.setRGB(1+x,1+x*.35,1-x*.8)}if(this.sun){const c=this.sun.material;c.opacity=.06+Math.sin(e*.17)*.03,this.sun.position.x+=Math.sin(e*.05)*.02}}describe(){return this.plates.map(e=>{const t=e.mesh.geometry;return{name:e.mesh.name.replace("plate_",""),width:Number(t.parameters.width?.toFixed(3)??0),height:Number(t.parameters.height?.toFixed(3)??0),x:Number(e.mesh.position.x.toFixed(2)),y:Number(e.mesh.position.y.toFixed(2)),relative:!!e.relative}})}get hasSea(){return this.plates.some(e=>e.mesh.name==="plate_water")}dispose(){for(const{mesh:e}of this.plates)e.geometry.dispose();for(const{material:e}of this.plates)e.dispose();for(const e of this.textures)e.dispose();this.sun?.geometry.dispose(),this.sun&&this.sun.material.dispose(),this.sunTexture?.dispose(),this.root.removeFromParent()}}const ie={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class V{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Pt=new st(-1,1,1,-1,0,1);class At extends me{constructor(){super(),this.setAttribute("position",new Ee([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ee([0,2,0,0,2,0],2))}}const Dt=new At;class le{constructor(e){this._mesh=new v(Dt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Pt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Ke extends V{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof G?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=$.clone(e.uniforms),this.material=new G({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new le(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Oe extends V{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const o=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,h;this.inverse?(a=0,h=1):(a=1,h=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),r.buffers.stencil.setFunc(o.ALWAYS,a,4294967295),r.buffers.stencil.setClear(h),r.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(o.EQUAL,1,4294967295),r.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),r.buffers.stencil.setLocked(!0)}}class Rt extends V{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Ut{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new T);this._width=s.width,this._height=s.height,t=new X(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:q}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ke(ie),this.copyPass.material.blending=je,this.timer=new ot}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let o=0,r=this.passes.length;o<r;o++){const a=this.passes[o];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),a.needsSwap){if(s){const h=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(h.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(h.EQUAL,1,4294967295)}this.swapBuffers()}Oe!==void 0&&(a instanceof Oe?s=!0:a instanceof Rt&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new T);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Et extends V{constructor(e,t,s=null,o=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new N}render(e,t,s){const o=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=o}}const Ft={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new N(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class j extends V{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new T(e.x,e.y):new T(256,256),this.clearColor=new N(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new X(r,a,{type:q,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let i=0;i<this.nMips;i++){const c=new X(r,a,{type:q,depthBuffer:!1});c.texture.name="UnrealBloomPass.h"+i,c.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(c);const d=new X(r,a,{type:q,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+i,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}const h=Ft;this.highPassUniforms=$.clone(h.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new G({uniforms:this.highPassUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let i=0;i<this.nMips;i++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[i])),this.separableBlurMaterials[i].uniforms.invSize.value=new T(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=$.clone(ie.uniforms),this.blendMaterial=new G({uniforms:this.copyUniforms,vertexShader:ie.vertexShader,fragmentShader:ie.fragmentShader,premultipliedAlpha:!0,blending:ge,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new N,this._oldClearAlpha=1,this._basic=new Q,this._fsQuad=new le(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(s,o),this.renderTargetsVertical[r].setSize(s,o),this.separableBlurMaterials[r].uniforms.invSize.value=new T(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let h=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=h.texture,this.separableBlurMaterials[l].uniforms.direction.value=j.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=j.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),h=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(s*s))/s);const o=[],r=[];for(let a=1;a<e;a+=2){const h=t[a],l=a+1<e?t[a+1]:0,u=h+l;o.push((a*h+(a+1)*l)/u),r.push(u)}return new G({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new T(.5,.5)},direction:{value:new T(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new G({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}}j.BlurDirectionX=new T(1,0);j.BlurDirectionY=new T(0,1);const se={defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`};class kt extends V{constructor(e,t,s){super(),this.scene=e,this.camera=t;const o=s.focus!==void 0?s.focus:1,r=s.aperture!==void 0?s.aperture:.025,a=s.maxblur!==void 0?s.maxblur:1;this._renderTargetDepth=new X(1,1,{minFilter:Fe,magFilter:Fe,type:q}),this._renderTargetDepth.texture.name="BokehPass.depth",this._materialDepth=new rt,this._materialDepth.depthPacking=at,this._materialDepth.blending=je;const h=$.clone(se.uniforms);h.tDepth.value=this._renderTargetDepth.texture,h.focus.value=o,h.aspect.value=t.aspect,h.aperture.value=r,h.maxblur.value=a,h.nearClip.value=t.near,h.farClip.value=t.far,this.materialBokeh=new G({defines:Object.assign({},se.defines),uniforms:h,vertexShader:se.vertexShader,fragmentShader:se.fragmentShader}),this.uniforms=h,this._fsQuad=new le(this.materialBokeh),this._oldClearColor=new N}render(e,t,s){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);const o=e.getClearAlpha(),r=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=s.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(o),e.autoClear=r}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}}const oe={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Bt extends V{constructor(){super(),this.isOutputPass=!0,this.uniforms=$.clone(oe.uniforms),this.material=new it({name:oe.name,uniforms:this.uniforms,vertexShader:oe.vertexShader,fragmentShader:oe.fragmentShader}),this._fsQuad=new le(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},nt.getTransfer(this._outputColorSpace)===lt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ct?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ut?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ye?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===dt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===pt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const M=new Map;function B(n,e){const t=document.createElement("canvas");t.width=n,t.height=e;const s=t.getContext("2d");if(!s)throw new Error("не удалось получить 2D-контекст для текстуры");return s}function z(n,e=[1,1]){const t=new Qe(n.canvas);return t.wrapS=H,t.wrapT=H,t.repeat.set(e[0],e[1]),t.colorSpace=re,t.anisotropy=4,t}function ce(n,e){const{width:t,height:s}=n.canvas;for(let o=0;o<e.count;o+=1){const r=e.colors[Math.floor(Math.random()*e.colors.length)],a=e.minSize+Math.random()*(e.maxSize-e.minSize);n.globalAlpha=e.alpha*(.5+Math.random()*.5),n.fillStyle=r,n.beginPath();const h=Math.random()*t,l=Math.random()*s;e.horizontal?n.ellipse(h,l,a,a*(.25+Math.random()*.35),0,0,Math.PI*2):n.ellipse(h,l,a*(.3+Math.random()*.3),a,0,0,Math.PI*2),n.fill()}n.globalAlpha=1}function Le(){const n=M.get("bark");if(n)return n;const e=B(256,512),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"#7d3f18"),t.addColorStop(.45,"#c4762f"),t.addColorStop(.75,"#e0973f"),t.addColorStop(1,"#8a4a1e"),e.fillStyle=t,e.fillRect(0,0,256,512);for(let o=0;o<90;o+=1){e.globalAlpha=.12+Math.random()*.22,e.strokeStyle=Math.random()>.5?"#5a2d10":"#f0b264",e.lineWidth=1+Math.random()*4,e.beginPath();const r=Math.random()*256;e.moveTo(r,0);for(let a=0;a<=512;a+=32)e.lineTo(r+Math.sin(a*.02+o)*5,a);e.stroke()}e.globalAlpha=1,ce(e,{count:120,colors:["#5a2d10","#e8a44f","#93491c"],minSize:6,maxSize:26,alpha:.16});const s=z(e,[2,1]);return M.set("bark",s),s}function He(){const n=M.get("foliage");if(n)return n;const e=B(256,256);e.fillStyle="#3f6b3a",e.fillRect(0,0,256,256),ce(e,{count:900,colors:["#2c4f2b","#568c46","#7fae5a","#25452a","#9cc06a","#1f3a24"],minSize:3,maxSize:14,alpha:.5});const t=z(e,[2,2]);return M.set("foliage",t),t}function zt(){const n=M.get("grass");if(n)return n;const e=B(512,512);e.fillStyle="#4d7040",e.fillRect(0,0,512,512),ce(e,{count:1400,colors:["#6f9048","#3a5c3a","#93ae5c","#2c4a30","#b0bd6d","#365436"],minSize:4,maxSize:22,alpha:.4});for(let s=0;s<500;s+=1){e.globalAlpha=.25+Math.random()*.35,e.strokeStyle=Math.random()>.5?"#8fae54":"#3a5a30",e.lineWidth=1+Math.random();const o=Math.random()*512,r=Math.random()*512;e.beginPath(),e.moveTo(o,r),e.lineTo(o+(Math.random()-.5)*8,r-6-Math.random()*10),e.stroke()}e.globalAlpha=1;const t=z(e,[10,10]);return M.set("grass",t),t}function It(){const n=M.get("cloth");if(n)return n;const e=B(256,256);e.fillStyle="#c2211a",e.fillRect(0,0,256,256);for(let s=0;s<40;s+=1){e.globalAlpha=.1+Math.random()*.16,e.strokeStyle=Math.random()>.5?"#7d120e":"#ef6a52",e.lineWidth=2+Math.random()*10,e.beginPath();const o=Math.random()*256;e.moveTo(o,0),e.bezierCurveTo(o+20,80,o-20,170,o+10,256),e.stroke()}e.globalAlpha=1,ce(e,{count:200,colors:["#8f1610","#e6472f"],minSize:4,maxSize:16,alpha:.14});const t=z(e,[2,2]);return M.set("cloth",t),t}function Nt(){const n=M.get("leaf");if(n)return n;const e=B(128,128);e.clearRect(0,0,128,128);const t=e.createLinearGradient(20,10,108,118);t.addColorStop(0,"#f0c063"),t.addColorStop(.5,"#d98a2c"),t.addColorStop(1,"#b04a1c"),e.fillStyle=t,e.beginPath(),e.moveTo(64,6),e.bezierCurveTo(112,40,108,96,64,122),e.bezierCurveTo(20,96,16,40,64,6),e.fill(),e.strokeStyle="rgba(120, 60, 20, 0.55)",e.lineWidth=3,e.beginPath(),e.moveTo(64,12),e.lineTo(64,116),e.stroke();const s=z(e);return s.wrapS=ne,s.wrapT=ne,M.set("leaf",s),s}function Gt(){for(const n of M.values())n.dispose();M.clear()}function Ot(){const n=M.get("grain");if(n)return n;const e=B(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);const t=e.getImageData(0,0,256,256);for(let o=0;o<t.data.length;o+=4){const r=128+(Math.random()-.5)*70;t.data[o]=r,t.data[o+1]=r,t.data[o+2]=r}e.putImageData(t,0,0);const s=z(e,[8,8]);return M.set("grain",s),s}function Lt(){const n=M.get("shaft");if(n)return n;const e=B(128,512),t=e.createLinearGradient(0,0,0,512);t.addColorStop(0,"rgba(255, 240, 205, 0.55)"),t.addColorStop(.55,"rgba(255, 236, 190, 0.22)"),t.addColorStop(1,"rgba(255, 236, 190, 0.0)"),e.fillStyle=t,e.fillRect(0,0,128,512),e.globalCompositeOperation="destination-out";for(let o=0;o<160;o+=1){e.globalAlpha=.15+Math.random()*.5,e.fillStyle="#000";const r=Math.random()*512,a=6+Math.random()*26;e.fillRect(0,r,a,10+Math.random()*40),e.fillRect(128-a,r,a,10+Math.random()*40)}e.globalAlpha=1,e.globalCompositeOperation="source-over";const s=z(e);return s.wrapS=ne,s.wrapT=ne,M.set("shaft",s),s}function Ht(){const n=M.get("mist");if(n)return n;const e=B(512,128),t=e.createLinearGradient(0,0,0,128);t.addColorStop(0,"rgba(226, 240, 238, 0)"),t.addColorStop(.45,"rgba(226, 240, 238, 0.42)"),t.addColorStop(1,"rgba(226, 240, 238, 0)"),e.fillStyle=t,e.fillRect(0,0,512,128);for(let o=0;o<220;o+=1){e.globalAlpha=.05+Math.random()*.12,e.fillStyle="#ffffff";const r=Math.random()*512,a=Math.random()*128;e.beginPath(),e.ellipse(r,a,30+Math.random()*70,6+Math.random()*14,0,0,Math.PI*2),e.fill()}e.globalAlpha=1;const s=z(e,[2,1]);return M.set("mist",s),s}function Vt(){const n=M.get("stroke-angle");if(n)return n;const e=B(256,256);e.fillStyle="#808080",e.fillRect(0,0,256,256);for(let s=0;s<220;s+=1){const o=Math.random()*256,r=Math.random()*256,a=12+Math.random()*46,h=Math.random()*255,l=e.createRadialGradient(o,r,0,o,r,a);l.addColorStop(0,`rgba(${h}, ${h}, ${h}, 0.55)`),l.addColorStop(1,"rgba(128, 128, 128, 0)"),e.fillStyle=l,e.fillRect(o-a,r-a,a*2,a*2)}const t=z(e,[1,1]);return t.wrapS=H,t.wrapT=H,M.set("stroke-angle",t),t}function Ve(){const n=M.get("fur");if(n)return n;const e=B(256,256);e.fillStyle="#8c8c8c",e.fillRect(0,0,256,256);for(let s=0;s<1400;s+=1){const o=Math.random()*256,r=Math.random()*256,a=6+Math.random()*22;e.globalAlpha=.1+Math.random()*.25,e.strokeStyle=Math.random()>.5?"#f0f0f0":"#404040",e.lineWidth=1+Math.random()*1.6,e.beginPath(),e.moveTo(o,r),e.lineTo(o+(Math.random()-.5)*5,r+a),e.stroke()}e.globalAlpha=1;const t=z(e,[3,3]);return M.set("fur",t),t}const Wt={uniforms:{tDiffuse:{value:null},tAngle:{value:null},uTexel:{value:new T(1/1024,1/1024)},uLength:{value:14},uStrength:{value:.8},uSaturation:{value:1.12}},vertexShader:`
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
  `};class Qt{constructor(e,t,s,o){this.renderer=e,this.scene=t,this.camera=s,this.composer=new Ut(e),this.renderPass=new Et(t,s),this.composer.addPass(this.renderPass),o.quality!=="low"?(this.bloom=new j(new T(1,1),.22,.7,.9),this.composer.addPass(this.bloom)):this.bloom=null,o.quality==="high"?(this.bokeh=new kt(t,s,{focus:14,aperture:.0013,maxblur:.008}),this.composer.addPass(this.bokeh)):this.bokeh=null,this.painterly=new Ke(Wt),this.painterly.uniforms.tAngle.value=Vt(),this.painterly.uniforms.uLength.value=o.quality==="high"?13:9,this.painterly.uniforms.uStrength.value=o.quality==="high"?.6:.52,this.composer.addPass(this.painterly),this.composer.addPass(new Bt)}composer;painterly;bloom;bokeh;renderPass;width=1;height=1;setPainterly(e){this.painterly.uniforms.uStrength.value=e}setSize(e,t,s){this.width=e,this.height=t,this.composer.setPixelRatio(s),this.composer.setSize(e,t),this.painterly.uniforms.uTexel.value.set(1/(e*s),1/(t*s)),this.bloom?.setSize(e,t)}render(){this.composer.render()}get size(){return{width:this.width,height:this.height}}dispose(){this.composer.dispose(),this.bloom?.dispose(),this.bokeh?.dispose(),this.painterly.dispose(),this.renderPass.dispose()}}const P={sky:12575970,fog:3364442,bark:16771280,barkFar:10470604,foliage:15660258,foliageFar:14478570,grass:6581056,lionBody:15907683,lionBodyDark:14129727,lionMane:13664040,lionManeLight:16174207,muzzle:14264159,face:2890258,cloth:16777215,clothDark:9377296},Je=42,de=1.45,pe=1;function jt(n,e){const t=Math.hypot(e+7.4,de-pe),s=Math.tan(Je/2*(Math.PI/180))*t;return{width:s*n,height:s}}function E(n){const e=n.map(s=>{const o=s.geometry.clone();return o.applyMatrix4(new Xe().compose(new C(...s.position??[0,0,0]),new qe().setFromEuler(new $e(...s.rotation??[0,0,0])),new C(...s.scale??[1,1,1]))),o.index?o.toNonIndexed():o}),t=Ct(e,!1)??new me;for(const s of e)s.dispose();for(const s of n)s.geometry.dispose();return t}function Y(n){return new F({color:n.color,map:n.map,roughness:n.roughness??.92,metalness:0})}function he(n,e,t){const s=[];for(let a=0;a<=14;a+=1){const h=a/14,l=1+Math.pow(1-h,3)*1.35,u=1-h*.42,i=1+Math.sin(h*Math.PI*3)*.035;s.push(new T(e*u*l*i,h*n))}const r=new Ze(s,32);return r.computeVertexNormals(),new v(r,t)}function Yt(n,e,t){const s=[];let o=t;const r=()=>(o=o*16807%2147483647,o/2147483647);for(let a=0;a<6;a+=1){const h=r()*Math.PI*2,l=r()*n*.55,u=n*(.42+r()*.3);s.push({geometry:new D(u,12,9),position:[Math.cos(h)*l,(r()-.35)*n*.45,Math.sin(h)*l],scale:[1.05,.85+r()*.25,1.05]})}return new v(E(s),e)}function Xt(){const e=new I,t=new F({color:P.lionBody,roughness:.9,metalness:0}),s=new F({color:P.lionBodyDark,roughness:.92,metalness:0}),o=new F({color:P.lionMane,roughness:.98,metalness:0,bumpMap:Ve(),bumpScale:.06}),r=new F({color:P.lionManeLight,roughness:.98,metalness:0,bumpMap:Ve(),bumpScale:.05});new F({color:P.muzzle,roughness:.85,metalness:0});const a=new F({color:P.face,roughness:.45,metalness:0});e.add(new v(E([{geometry:new _(.42,0),position:[-.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new _(.42,0),position:[.36,.42,-.34],scale:[1,.95,1.15]},{geometry:new D(.44,26,20),position:[0,1.04,-.12],scale:[1.05,1.35,.95]},{geometry:new D(.44,26,20),position:[0,.9,-.58],scale:[1,.92,1.05]},{geometry:new D(.28,14,11),position:[0,1.46,.04],scale:[1.05,.9,1]}]),t));const h=[],l=[];for(const g of[-.24,.24]){h.push({geometry:new te(.095,.115,.98,12),position:[g,.52,.22]}),l.push({geometry:new D(.14,12,10),position:[g,.09,.3],scale:[1.05,.62,1.5]});for(const x of[-.06,0,.06])l.push({geometry:new D(.045,8,6),position:[g+x,.05,.46]})}for(const g of[-.44,.44])h.push({geometry:new te(.115,.135,.52,12),position:[g,.3,-.18],rotation:[1,0,0]}),l.push({geometry:new D(.15,12,10),position:[g,.09,.06],scale:[1.1,.62,1.6]});e.add(new v(E(h),t)),e.add(new v(E(l),s));const u=new v(new D(.44,26,20),t);u.position.set(0,1,.16),u.scale.set(1,1.15,.95),e.add(u);const i=new I;i.position.set(0,1.78,.14),i.add(new v(E([{geometry:new D(.29,26,20),scale:[1,.96,1.06]},{geometry:new te(.09,.19,.36,16),position:[0,-.13,.3],rotation:[Math.PI/2,0,0],scale:[.86,1,1]},{geometry:new D(.09,10,8),position:[0,-.25,.3],scale:[1.2,.9,1]},{geometry:new Be(.34,.05,.14),position:[0,.12,.24]}]),t)),i.add(new v(new ze(.075,.1,3),a).translateY(0).translateZ(0));const c=i.children[i.children.length-1];c.position.set(0,-.08,.47),c.rotation.set(Math.PI/2,0,Math.PI),i.add(new v(new Be(.13,.012,.08),a).translateY(0).translateZ(0)),i.children[i.children.length-1].position.set(0,-.22,.4),i.add(new v(E([{geometry:new D(.062,10,8),position:[-.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,.34]},{geometry:new D(.062,10,8),position:[.15,.05,.27],scale:[1.9,.3,.5],rotation:[0,0,-.34]}]),a));const f=[{geometry:new _(.66,1),position:[0,-.06,-.18],scale:[1.18,1.22,.6]},{geometry:new _(.3,0),position:[-.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,.5]},{geometry:new _(.3,0),position:[.42,.06,.06],scale:[.95,1.15,.6],rotation:[0,0,-.5]},{geometry:new _(.26,0),position:[-.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,.25]},{geometry:new _(.26,0),position:[.3,-.36,.16],scale:[.95,1.2,.6],rotation:[0,0,-.25]},{geometry:new _(.3,0),position:[-.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.3,0),position:[.3,-.62,.02],scale:[1,1.3,.68]},{geometry:new _(.32,0),position:[0,-.8,.06],scale:[1.05,1.2,.68]},{geometry:new _(.42,0),position:[-.56,-.24,-.1],scale:[.95,1.15,.62]},{geometry:new _(.42,0),position:[.56,-.24,-.1],scale:[.95,1.15,.62]}],p=[{geometry:new _(.34,0),position:[0,.34,-.04],scale:[1.2,.8,.7]},{geometry:new _(.28,0),position:[-.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,.35]},{geometry:new _(.28,0),position:[.5,.16,-.02],scale:[.95,1,.62],rotation:[0,0,-.35]}];i.add(new v(E(f),o)),i.add(new v(E(p),r));const m=[];for(const g of[-.23,.23]){const x=new v(new ze(.095,.17,5),r);x.position.set(g,.3,.06),x.rotation.z=g<0?.4:-.4,i.add(x),m.push(x)}e.add(i);const w=[];let A=e;for(let g=0;g<2;g+=1){const x=new I;x.position.set(0,g===0?.5:.02,g===0?-.94:-.3);const R=new v(new te(.07-g*.012,.08-g*.012,.32,10),t);if(R.rotation.x=Math.PI/2+.5,R.position.z=-.16,x.add(R),g===1){const S=new v(new _(.11,0),o);S.scale.set(.9,1.5,.9),S.position.set(0,-.18,-.3),x.add(S)}A.add(x),A=x,w.push(x)}return e.scale.setScalar(1.16),{group:e,head:i,headBaseY:1.34,tail:w,ears:m,chest:u}}function qt(){const n=new I,e=Y({color:P.cloth,map:It(),roughness:.95}),t=new F({color:P.clothDark,roughness:.9,metalness:0}),s=[],o=16;for(let i=0;i<=o;i+=1){const c=i/o,d=.16+Math.pow(c,1.5)*.3+Math.sin(c*Math.PI)*.05;s.push(new T(d,1.02-c*1))}const r=new Ze(s,32);r.computeVertexNormals();const a=new v(r,e);n.add(a);const h=new v(new D(.18,16,12),e);h.scale.set(1,1.12,1.08),h.position.set(0,1.06,.01),n.add(h);const l=new v(new D(.2,14,11),e);l.scale.set(1.5,.6,.9),l.position.set(0,.92,0),n.add(l);const u=new v(new D(.1,12,10),t);return u.scale.set(1,1.15,.6),u.position.set(0,1.05,.13),n.add(u),n.scale.setScalar(.68),{group:n,cloak:a,basePositions:Float32Array.from(r.attributes.position.array)}}function $t(n){const e=new k(.17,.24),t=new F({map:Nt(),transparent:!0,alphaTest:.4,side:ae,roughness:1,metalness:0}),s=new Tt(e,t,n);s.frustumCulled=!1;const o=new Float32Array(n*6);for(let r=0;r<n;r+=1)o[r*6+0]=-6+Math.random()*12,o[r*6+1]=.4+Math.random()*4.8,o[r*6+2]=-5+Math.random()*10,o[r*6+3]=.5+Math.random()*1.2,o[r*6+4]=Math.random()*Math.PI*2,o[r*6+5]=(Math.random()-.5)*3;return{mesh:s,state:o}}function We(){try{const s=new URLSearchParams(window.location.search).get("fx");if(s==="low"||s==="medium"||s==="high")return s}catch{}const n=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches,e=navigator.hardwareConcurrency??4;return!n&&e>=4?"high":e>=4?"medium":"low"}class Kt{constructor(e){this.canvas=e,this.renderer=new mt({canvas:e,antialias:!0,powerPreference:"low-power"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=gt,this.renderer.toneMapping=Ye,this.renderer.toneMappingExposure=1,this.scene.background=new N(0),this.scene.fog=new vt(P.fog,16,30),this.camera=new bt(Je,2/3,.1,90),this.camera.position.set(0,de,7.4),this.camera.lookAt(0,pe,0);const t=Ot();this.scene.add(new xt(14479344,3498094,1.05));const s=new ke(16761976,1.15);s.position.set(4,7.5,-6),s.castShadow=!0,s.shadow.mapSize.set(512,512),s.shadow.camera.left=-7,s.shadow.camera.right=7,s.shadow.camera.top=8,s.shadow.camera.bottom=-2,s.shadow.bias=-.0012,s.shadow.radius=3,this.scene.add(s);const o=new ke(8832742,1.5);o.position.set(-5,3,5),this.scene.add(o);const r=new wt(16767392,13,12,Math.PI/9,.8,1.6);r.position.set(-1.4,4.2,4.6),r.target.position.set(-.3,1,1.6),this.scene.add(r),this.scene.add(r.target);const a=new k(70,40,1,8),h=a.attributes.position,l=new Float32Array(h.count*3),u=new N(P.sky),i=new N(P.fog);for(let b=0;b<h.count;b+=1){const U=(h.getY(b)+20)/40,y=i.clone().lerp(u,U);l[b*3]=y.r,l[b*3+1]=y.g,l[b*3+2]=y.b}a.setAttribute("color",new ue(l,3));const c=new Q({vertexColors:!0,fog:!1,side:ae}),d=new v(a,c);d.position.set(0,8,-22),this.addForest(d),this.disposables.push(a,c);const f=new k(46,46,18,18),p=f.attributes.position,m=new Float32Array(p.count*3),w=new N;for(let b=0;b<p.count;b+=1){const U=p.getX(b),y=p.getY(b);p.setZ(b,Math.sin(U*.28)*.09+Math.cos(y*.24)*.07);const L=(Math.sin(U*.5)+Math.cos(y*.42))*.5,W=L>.35?1.16:L<-.35?.82:1,ee=Math.min(1,Math.max(0,y/23));w.setHex(P.grass).multiplyScalar(W*(1-ee*.3)),m[b*3]=w.r,m[b*3+1]=w.g,m[b*3+2]=w.b}f.setAttribute("color",new ue(m,3)),f.computeVertexNormals();const A=new F({map:zt(),vertexColors:!0,roughness:1,metalness:0,bumpMap:t,bumpScale:.02}),g=new v(f,A);g.rotation.x=-Math.PI/2,g.receiveShadow=!0,this.ground=g,this.scene.add(g),this.disposables.push(f,A);const x=Y({color:P.bark,map:Le()}),R=Y({color:P.barkFar,map:Le(),roughness:1}),S=Y({color:P.foliage,map:He(),roughness:1}),O=Y({color:P.foliageFar,map:He(),roughness:1});this.disposables.push(x,R,S,O);const Z=new I;Z.name="leftFrame";const be=he(13,.6,x);be.castShadow=!0,Z.add(be),Z.add(this.placeCanopy(11.6,1.05,S,7)),this.addForest(Z);const K=new I;K.name="rightFrame";const xe=he(13.6,.66,R);xe.castShadow=!0,K.add(xe),K.add(this.placeCanopy(12.2,1.1,S,11)),this.addForest(K);const et=[[-1.6,-10,12],[.9,-11,13],[-3,-15,15],[2.8,-16,15]],we=[],ye=[];et.forEach(([b,U,y],L)=>{const W=he(y,y*.05,R).geometry.clone();W.translate(b,0,U),we.push({geometry:W});const ee=this.placeCanopy(y*.92,y*.16,O,L*13+5),Re=ee.geometry.clone();Re.translate(b,y*.92,U),ye.push({geometry:Re}),ee.geometry.dispose()});const Me=new v(E(we),R);Me.name="farTrunks";const Te=new v(E(ye),O);Te.name="farCanopies",this.addForest(Me),this.addForest(Te);const J=new I;J.name="canopyTop",J.add(this.placeCanopy(0,.55,S,3)),this.addForest(J),this.foliage.push(J);for(const[b,U]of[["canopyleft",-1],["canopyright",1]]){const y=new I;y.name=b,y.add(this.placeCanopy(0,.7,S,U<0?17:23)),this.addForest(y),this.foliage.push(y)}const Ce=new Q({map:Lt(),transparent:!0,blending:ge,depthWrite:!1,side:ae,opacity:.85}),Se=[];for(const[b,U,y,L,W]of[[-2.2,-3.2,1.5,9,.14],[-.6,-4.4,1.9,10,.1],[1.4,-3.6,1.4,8.5,-.12]])Se.push({geometry:new k(y,L),position:[b,L/2-.4,U],rotation:[0,0,W]});const _e=new v(E(Se),Ce);_e.renderOrder=2,this.addForest(_e),this.disposables.push(Ce);const Pe=new Q({map:Ht(),transparent:!0,depthWrite:!1,side:ae,opacity:.55}),Ae=[];for(const[b,U,y]of[[-6,.7,1.6],[-12,1.1,2.2]])Ae.push({geometry:new k(26*y,3.4*y),position:[0,U,b]});const De=new v(E(Ae),Pe);De.renderOrder=1,this.addForest(De),this.disposables.push(Pe),this.lion=Xt(),this.lion.group.position.set(-.3,0,1.6),this.lion.group.rotation.y=-.12,this.lion.group.scale.setScalar(.85),this.lion.group.traverse(b=>{b instanceof v&&(b.castShadow=!0)}),this.scene.add(this.lion.group),this.traveler=qt(),this.traveler.group.position.set(.35,0,2.6),this.traveler.group.rotation.y=Math.PI-.25,this.traveler.group.scale.setScalar(.6),this.traveler.group.traverse(b=>{b instanceof v&&(b.castShadow=!0)}),this.scene.add(this.traveler.group),this.leaves=$t(45),this.scene.add(this.leaves.mesh),this.disposables.push(this.leaves.mesh.geometry,this.leaves.mesh.material),this.postfx=new Qt(this.renderer,this.scene,this.camera,{quality:We()}),this.resize(e.clientWidth,e.clientHeight),this.layout(),this.hideProcedural(),this.canvas.style.opacity="0",this.loadPlates(),this.animate()}renderer;postfx;scene=new yt;camera;clock=new Mt;lion;forest=[];loaded={plates:!1};platesInstance=null;spray=null;ground=null;traveler;leaves;foliage=[];matrix=new Xe;disposables=[];frame=0;fpsAccum=0;fpsFrames=0;fps=0;wind=0;get plates(){return this.platesInstance?.describe()??[]}get assets(){return{...this.loaded}}get quality(){return this.postfx?this.postfx.constructor.name:"нет"}placeCanopy(e,t,s,o){const r=Yt(t,s,o);return r.position.y=e,r}alignToNdc(e,t,s,o){e.position.z=o;const r=new C;for(let a=0;a<8;a+=1){e.getWorldPosition(r),r.project(this.camera);const{width:h,height:l}=jt(this.camera.aspect,o);e.position.x+=(t-r.x)*h*.85,e.position.y+=(s-r.y)*l*.85}}layout(){const t=this.scene.getObjectByName("leftFrame"),s=this.scene.getObjectByName("rightFrame");t&&this.alignToNdc(t,-.86,-.5,-1.2),s&&this.alignToNdc(s,.86,-.5,-1.2);const o=this.scene.getObjectByName("canopyTop");o&&this.alignToNdc(o,0,1.06,-1.2-.6);for(const[r,a]of[["canopyleft",-1],["canopyright",1]]){const h=this.scene.getObjectByName(r);h&&this.alignToNdc(h,a*.9,.92,-1.2)}}addForest(e){this.scene.add(e),this.forest.push(e)}loadPlates(){const e=new ve(this.camera,{base:"./title/layers/",quality:We(),animate:!1,onReady:()=>{this.loaded.plates=!0,this.hideProcedural(),this.canvas.style.opacity="1",this.postfx?.setPainterly(.18)}});this.platesInstance=e,this.scene.add(e.object3d)}hideProcedural(){for(const e of this.forest)e.visible=!1;this.ground&&(this.ground.visible=!1),this.lion.group.visible=!1,this.traveler.group.visible=!1}resize(e,t){const s=e/Math.max(1,t);this.camera.aspect=s;const o=7.4+Math.max(0,s-1)*3;this.camera.position.set(0,de+Math.max(0,s-1)*.4,o),this.camera.lookAt(0,pe,0),this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.postfx.setSize(e,t,Math.min(window.devicePixelRatio||1,2)),this.layout(),this.platesInstance?.layout()}setPointer(e,t){this.platesInstance?.setPointer(e,t)}animate=()=>{this.frame=requestAnimationFrame(this.animate);const e=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;const t=this.clock.elapsedTime;this.wind=Math.sin(t*.55)*.6+Math.sin(t*1.7)*.25+.4,this.platesInstance?.update(t),this.spray?.update(e,this.wind);const s=1+Math.sin(t*2.1)*.025;this.lion.chest.scale.setScalar(s),this.lion.head.rotation.y=Math.sin(t*.45)*.12,this.lion.head.rotation.x=Math.sin(t*.7+1)*.05,this.lion.head.position.y=this.lion.headBaseY+Math.sin(t*2.1)*.014,this.lion.ears.forEach((i,c)=>{const d=Math.max(0,Math.sin(t*.9+c*2.1)-.93)*12;i.rotation.z=(c===0?.34:-.34)+d*(c===0?1:-1)}),this.lion.tail.forEach((i,c)=>{i.rotation.y=Math.sin(t*1.1-c*.5)*(.12+c*.05)*(.8+this.wind*.6),i.rotation.x=-.1+Math.sin(t*.8-c*.4)*.08});const o=this.traveler.cloak,r=o.geometry.attributes.position,a=this.traveler.basePositions;for(let i=0;i<r.count;i+=1){const c=a[i*3]??0,d=a[i*3+1]??0,f=a[i*3+2]??0,p=Math.max(0,.55-d)/.55,m=Math.atan2(f,c),w=this.wind*(.14+.06*Math.sin(t*2.6+m*3));r.setXYZ(i,c+Math.sin(m)*p*w+Math.sin(t*3+m*2)*p*.014,d-Math.abs(w)*p*.07,f+Math.cos(m)*p*w+Math.cos(t*2.4+m*2)*p*.014)}r.needsUpdate=!0,o.geometry.computeVertexNormals(),this.foliage.forEach((i,c)=>{i.rotation.z=Math.sin(t*.9+c)*.028*(.6+this.wind)});const{mesh:h,state:l}=this.leaves,u=l.length/6;for(let i=0;i<u;i+=1){const c=i*6;let d=l[c]??0,f=l[c+1]??0,p=l[c+2]??0;const m=l[c+3]??1,w=l[c+4]??0,A=l[c+5]??1;d+=(m*(.6+this.wind)+.35)*e*1.7,f+=Math.sin(t*1.6+w)*e*.5,p+=Math.cos(t*1.1+w)*e*.3,d>8&&(d=-8,f=.4+Math.random()*4.8,p=-5+Math.random()*10),l[c]=d,l[c+1]=f,l[c+2]=p;const g=.85+Math.sin(t*2+w)*.15;this.matrix.compose(new C(d,f,p),new qe().setFromEuler(new $e(t*A,w+t*.8,Math.sin(t*1.5+w)*.7)),new C(g,g,g)),h.setMatrixAt(i,this.matrix)}h.instanceMatrix.needsUpdate=!0,this.postfx.render(),this.fpsAccum+=e,this.fpsFrames+=1,this.fpsAccum>=.5&&(this.fps=Math.round(this.fpsFrames/this.fpsAccum),this.fpsAccum=0,this.fpsFrames=0)};get stats(){let e=0,t=0;return this.scene.traverse(s=>{if(!(s instanceof v))return;e+=1;const o=s.geometry,r=o.getAttribute("position"),a=o.getIndex();a?t+=a.count/3:r&&(t+=r.count/3)}),{calls:e,triangles:Math.round(t),fps:this.fps}}get objectCount(){let e=0;return this.scene.traverse(()=>{e+=1}),e}screenPositionOf(e){const t=this.scene.getObjectByName(e);if(!t)return null;const s=new C;return t.getWorldPosition(s),s.project(this.camera),{x:s.x,y:s.y}}dispose(){this.spray?.dispose(),this.spray=null,cancelAnimationFrame(this.frame),this.postfx.dispose();for(const e of this.disposables)e.dispose();this.scene.traverse(e=>{if(e instanceof v){e.geometry.dispose();for(const t of Array.isArray(e.material)?e.material:[e.material])t.dispose()}}),this.scene.clear(),Gt(),this.renderer.dispose()}}export{P as TITLE_PALETTE,Kt as TitleScene};
//# sourceMappingURL=titleScene-DJGpXcQZ.js.map
