/* Vero — hero "living product" (WebGL2 GPGPU particles, three r149).
   ~65k particles simulated on the GPU (position + velocity ping-pong textures). They assemble into the three
   things we build — a website, a CRM dashboard, a mobile app — each drawn as layered UI floating in depth.
   The headline word drives the shape: when it says "CRMs", the website dissolves through curl-like turbulence
   and rebuilds as a CRM. Cursor stirs the particles like sand in water; click sends a shockwave.
   HDR additive render → bloom → filmic grade. Falls back to the 2D globe without WebGL2. */
(function () {
  if (!window.VERO_GL) return;
  const wrap = document.querySelector('.globe-wrap');
  const hero = document.getElementById('hero');
  if (!wrap) return;
  const fallback = () => { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); };
  if (!window.THREE) return fallback();
  const T = THREE;
  const cv = document.createElement('canvas');
  cv.id = 'globe-gl';
  cv.setAttribute('aria-label', 'Interactive particles that build a website, a CRM and an app');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch (e) { return fallback(); }
  if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return fallback(); }
  const old = document.getElementById('globe'); if (old) old.style.display = 'none';
  wrap.insertBefore(cv, wrap.firstChild);
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const SIZE = small ? 160 : 256, N = SIZE * SIZE;
  const lang = () => document.documentElement.lang || 'en';

  // take over the headline's rotating word so it stays in sync with the particles
  const rots = hero ? [...hero.querySelectorAll('[data-rot]')] : [];
  rots.forEach(r => r.setAttribute('data-rot-ext', ''));

  // ================================================================== shapes (drawn as layered 2D UI, sampled into 3D)
  const CW = 520, CH = 380, SC = 0.02;
  const C = { w: '#eef2fa', g: '#707a8d', d: '#343b4a', o: '#4d7cff', gr: '#2fd158', y: '#ffb84d' };
  function rr(x, y, w, h, r) { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
  const D = "'Bricolage Grotesque',system-ui,sans-serif", B = "'Inter',system-ui,sans-serif";
  function layer(z, fn) { return { z, fn }; }
  const SHAPES = [
    // 01 — website
    [
      layer(0, x => { x.strokeStyle = C.g; x.lineWidth = 2.5; x.stroke(rr(10, 10, 500, 360, 18)); x.fillStyle = C.d; x.globalAlpha = .18; x.fill(rr(10, 10, 500, 360, 18)); x.globalAlpha = 1; x.fillStyle = C.g; [34, 50, 66].forEach(c => { x.beginPath(); x.arc(c, 32, 5, 0, 7); x.fill(); }); x.globalAlpha = .6; x.fill(rr(170, 23, 180, 18, 9)); x.globalAlpha = 1; x.fillRect(10, 54, 500, 2); }),
      layer(.5, x => { x.fillStyle = C.w; x.font = `800 15px ${D}`; x.fillText('yourbusiness', 34, 88); x.fillStyle = C.g; [300, 350, 400].forEach(p => x.fillRect(p, 80, 34, 4)); }),
      layer(1.1, x => { x.fillStyle = C.w; x.font = `800 38px ${D}`; x.fillText('Book your', 34, 150); x.fillText('table today.', 34, 192); x.fillStyle = C.g; x.fillRect(34, 210, 210, 6); x.fillRect(34, 224, 160, 6); }),
      layer(1.7, x => { x.fillStyle = C.o; x.fill(rr(34, 246, 118, 34, 17)); x.strokeStyle = C.w; x.lineWidth = 2; x.stroke(rr(162, 246, 96, 34, 17)); x.fill(rr(440, 72, 50, 22, 11)); }),
      layer(.8, x => { x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(290, 110, 200, 170, 14)); x.fillStyle = C.y; x.beginPath(); x.arc(450, 150, 14, 0, 7); x.fill(); x.fillStyle = C.g; x.globalAlpha = .7; x.beginPath(); x.moveTo(300, 270); x.lineTo(360, 190); x.lineTo(410, 240); x.lineTo(440, 210); x.lineTo(482, 270); x.closePath(); x.fill(); x.globalAlpha = 1; }),
      layer(.3, x => { x.strokeStyle = C.g; x.lineWidth = 2; [34, 194, 354].forEach(p => { x.stroke(rr(p, 300, 132, 50, 10)); x.fillStyle = C.w; x.fillRect(p + 12, 314, 60, 5); x.fillStyle = C.g; x.fillRect(p + 12, 328, 90, 4); }); })
    ],
    // 02 — CRM dashboard
    [
      layer(0, x => { x.strokeStyle = C.g; x.lineWidth = 2.5; x.stroke(rr(10, 10, 500, 360, 18)); x.fillStyle = C.d; x.globalAlpha = .18; x.fill(rr(10, 10, 500, 360, 18)); x.globalAlpha = 1; x.fillStyle = C.g; x.fillRect(64, 10, 2, 360); [44, 84, 124, 164].forEach((y, i) => { x.fillStyle = i ? C.g : C.o; x.fill(rr(26, y, 24, 24, 7)); }); }),
      layer(.9, x => { [['Leads', '143'], ['Booked', '46'], ['Revenue', '€38k'], ['Rating', '4.9']].forEach((k, i) => { const px = 84 + i * 105; x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(px, 28, 94, 66, 10)); x.fillStyle = C.g; x.font = `500 11px ${B}`; x.fillText(k[0], px + 10, 48); x.fillStyle = i === 2 ? C.o : C.w; x.font = `800 24px ${D}`; x.fillText(k[1], px + 10, 80); }); }),
      layer(.35, x => { ['New', 'Visit', 'Quote', 'Won'].forEach((c, i) => { const px = 84 + i * 80; x.fillStyle = C.g; x.font = `600 11px ${B}`; x.fillText(c, px, 124); for (let j = 0; j < (i === 3 ? 1 : 3 - (i === 2)); j++) { x.strokeStyle = i === 3 ? C.gr : C.g; x.lineWidth = 2; x.stroke(rr(px, 134 + j * 46, 70, 38, 7)); x.fillStyle = C.w; x.fillRect(px + 8, 146 + j * 46, 40, 4); x.fillStyle = C.g; x.fillRect(px + 8, 157 + j * 46, 28, 3); } }); }),
      layer(1.8, x => { x.fillStyle = C.o; x.fill(rr(164, 180, 70, 38, 7)); x.fillStyle = C.w; x.fillRect(172, 192, 40, 4); x.fillRect(172, 203, 28, 3); }),
      layer(1.2, x => { x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(410, 110, 92, 140, 12)); x.strokeStyle = C.o; x.lineWidth = 3; x.beginPath(); [[420, 230], [436, 212], [452, 220], [468, 180], [484, 190], [494, 140]].forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }),
      layer(.6, x => { x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(84, 290, 418, 62, 12)); x.fillStyle = C.gr; x.beginPath(); x.arc(104, 321, 6, 0, 7); x.fill(); x.fillStyle = C.w; x.font = `500 13px ${B}`; x.fillText('AI booked Sofia M. · Fri 20:00 · WhatsApp ✓', 120, 326); })
    ],
    // 03 — mobile app
    [
      layer(0, x => { x.strokeStyle = C.g; x.lineWidth = 3; x.stroke(rr(180, 6, 160, 368, 30)); x.fillStyle = C.d; x.globalAlpha = .2; x.fill(rr(180, 6, 160, 368, 30)); x.globalAlpha = 1; x.fillStyle = C.g; x.fill(rr(232, 16, 56, 14, 7)); }),
      layer(.6, x => { x.fillStyle = C.o; x.beginPath(); x.arc(206, 62, 11, 0, 7); x.fill(); x.fillStyle = C.w; x.font = `800 16px ${D}`; x.fillText('Hi, Sofia', 224, 68); x.fillStyle = C.o; x.globalAlpha = .75; x.fill(rr(196, 88, 128, 70, 14)); x.globalAlpha = 1; x.fillStyle = C.w; x.font = `700 12px ${B}`; x.fillText('Tomorrow · 10:30', 208, 112); x.font = `800 18px ${D}`; x.fillText('Studio class', 208, 138); }),
      layer(.3, x => { for (let j = 0; j < 4; j++) { x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(196, 172 + j * 40, 128, 32, 8)); x.fillStyle = C.g; x.fill(rr(204, 180 + j * 40, 16, 16, 5)); x.fillStyle = C.w; x.fillRect(228, 184 + j * 40, 60, 4); } x.fillStyle = C.g; x.fill(rr(196, 340, 128, 24, 12)); x.fillStyle = C.o; x.beginPath(); x.arc(220, 352, 5, 0, 7); x.fill(); }),
      layer(2.0, x => { x.strokeStyle = C.w; x.lineWidth = 2.5; x.stroke(rr(330, 60, 170, 54, 14)); x.globalAlpha = .22; x.fillStyle = C.w; x.fill(rr(330, 60, 170, 54, 14)); x.globalAlpha = 1; x.fillStyle = C.o; x.fill(rr(342, 72, 30, 30, 8)); x.fillStyle = C.w; x.fillRect(382, 76, 90, 6); x.fillStyle = C.g; x.fillRect(382, 90, 70, 5); }),
      layer(1.4, x => { x.strokeStyle = C.g; x.lineWidth = 2; x.stroke(rr(20, 220, 140, 120, 14)); x.fillStyle = C.w; x.font = `800 30px ${D}`; x.fillText('+28%', 36, 268); x.fillStyle = C.g; x.font = `500 11px ${B}`; x.fillText('repeat bookings', 36, 288); x.fillStyle = C.o; [0, 1, 2, 3, 4].forEach(i => x.fillRect(36 + i * 22, 324 - i * 6, 14, 6 + i * 6)); })
    ]
  ];

  function sampleShape(layers) {
    const cand = [], cvs = document.createElement('canvas'); cvs.width = CW; cvs.height = CH;
    const x = cvs.getContext('2d', { willReadFrequently: true });
    layers.forEach(L => {
      x.clearRect(0, 0, CW, CH); x.save(); L.fn(x); x.restore();
      const d = x.getImageData(0, 0, CW, CH).data;
      for (let py = 0; py < CH; py += 1) for (let px = 0; px < CW; px += 1) {
        const i = (py * CW + px) * 4, a = d[i + 3] / 255;
        if (a > 0.05) cand.push(px, py, L.z, d[i], d[i + 1], d[i + 2], a);
      }
    });
    const M = cand.length / 7, pos = new Float32Array(N * 4), col = new Uint8Array(N * 4);
    let k = 0, guard = 0;
    while (k < N && guard < N * 40) {
      guard++;
      const j = (Math.random() * M | 0) * 7;
      if (Math.random() > cand[j + 6] * (cand[j + 6] < .5 ? .7 : 1)) continue;
      pos[k * 4] = (cand[j] + Math.random() - CW / 2) * SC;
      pos[k * 4 + 1] = -(cand[j + 1] + Math.random() - CH / 2) * SC;
      pos[k * 4 + 2] = cand[j + 2] + (Math.random() - .5) * 0.06;
      const lum = (cand[j + 3] + cand[j + 4] + cand[j + 5]) / 765;
      pos[k * 4 + 3] = 0.65 + lum * 0.7 + Math.random() * 0.3;
      col[k * 4] = cand[j + 3]; col[k * 4 + 1] = cand[j + 4]; col[k * 4 + 2] = cand[j + 5]; col[k * 4 + 3] = 255;
      k++;
    }
    const tp = new T.DataTexture(pos, SIZE, SIZE, T.RGBAFormat, T.FloatType); tp.needsUpdate = true;
    const tc = new T.DataTexture(col, SIZE, SIZE, T.RGBAFormat, T.UnsignedByteType); tc.needsUpdate = true;
    return { tp, tc };
  }

  // ================================================================== GPGPU
  const rtO = { type: T.HalfFloatType, format: T.RGBAFormat, minFilter: T.NearestFilter, magFilter: T.NearestFilter, depthBuffer: false };
  const posRT = [new T.WebGLRenderTarget(SIZE, SIZE, rtO), new T.WebGLRenderTarget(SIZE, SIZE, rtO)];
  const velRT = [new T.WebGLRenderTarget(SIZE, SIZE, rtO), new T.WebGLRenderTarget(SIZE, SIZE, rtO)];
  let pi = 0, vi = 0;
  const fsCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsScene = new T.Scene();
  const fsQuad = new T.Mesh(new T.PlaneGeometry(2, 2)); fsQuad.frustumCulled = false; fsScene.add(fsQuad);
  const fsVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
  function pass(mat, target) { fsQuad.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }

  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float prog(vec2 uv,float mixv){float h=hash(uv);float st=fract(h*7.13)*.42;return smoothstep(st,st+.5,mixv);}`;

  const S = {
    tPos: { value: null }, tVel: { value: null }, tA: { value: null }, tB: { value: null },
    uMix: { value: 1 }, uTime: { value: 0 }, uDt: { value: 0.016 }, uMouse: { value: new T.Vector3(99, 99, 0) }, uMVel: { value: new T.Vector3() },
    uMOn: { value: 0 }, uShock: { value: new T.Vector4(0, 0, 0, 99) }, uStiff: { value: 9 }, uIntro: { value: reduce ? 1 : 0 }
  };
  const velMat = new T.ShaderMaterial({ uniforms: S, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: NOISE + `uniform sampler2D tPos,tVel,tA,tB;uniform float uMix,uTime,uDt,uMOn,uStiff,uIntro;uniform vec3 uMouse,uMVel;uniform vec4 uShock;varying vec2 vUv;
      void main(){vec3 p=texture2D(tPos,vUv).xyz;vec3 v=texture2D(tVel,vUv).xyz;
        float k=prog(vUv,uMix);vec3 tgt=mix(texture2D(tA,vUv).xyz,texture2D(tB,vUv).xyz,k);
        float fly=sin(k*3.14159);float h=hash(vUv+.37);
        vec3 f=(tgt-p)*uStiff*(1.-fly*.82)*mix(.25,1.,uIntro);
        vec3 q=p*.32+vec3(0.,0.,uTime*.12);
        vec3 n=vec3(snoise(q),snoise(q+vec3(31.4,7.1,2.3)),snoise(q+vec3(-11.7,23.9,5.5)));
        f+=n*(.35+fly*9.+(1.-uIntro)*6.);
        f+=vec3(-p.y,p.x,0.)*fly*.9*(h-.3);
        vec3 d=p-uMouse;float r2=dot(d.xy,d.xy);float m=exp(-r2/1.1)*uMOn;
        f+=(normalize(d+vec3(0.,0.,.45))*26.+uMVel*5.+vec3(-d.y,d.x,0.)*7.)*m;
        float sd=length(p-uShock.xyz);float wave=exp(-pow(sd-uShock.w*10.,2.)*.9)*exp(-uShock.w*1.3);
        f+=normalize(p-uShock.xyz+vec3(0.,0.,.01))*wave*70.;
        v=v*pow(.88,uDt*60.)+f*uDt;gl_FragColor=vec4(v,1.);}` });
  const posMat = new T.ShaderMaterial({ uniforms: S, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tPos,tVel;uniform float uDt;varying vec2 vUv;void main(){vec3 p=texture2D(tPos,vUv).xyz+texture2D(tVel,vUv).xyz*uDt;gl_FragColor=vec4(p,1.);}` });
  const copyMat = new T.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tSrc;varying vec2 vUv;void main(){gl_FragColor=texture2D(tSrc,vUv);}` });

  // initial state: a wide drifting galaxy that collapses into the first product
  {
    const init = new Float32Array(N * 4), zero = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 6 + Math.pow(Math.random(), .6) * 14; init[i * 4] = Math.cos(a) * r; init[i * 4 + 1] = Math.sin(a) * r * .55 + (Math.random() - .5) * 2; init[i * 4 + 2] = (Math.random() - .5) * 8; init[i * 4 + 3] = 1; }
    const ti = new T.DataTexture(init, SIZE, SIZE, T.RGBAFormat, T.FloatType); ti.needsUpdate = true;
    const tz = new T.DataTexture(zero, SIZE, SIZE, T.RGBAFormat, T.FloatType); tz.needsUpdate = true;
    copyMat.uniforms.tSrc.value = ti; pass(copyMat, posRT[0]); pass(copyMat, posRT[1]);
    copyMat.uniforms.tSrc.value = tz; pass(copyMat, velRT[0]); pass(copyMat, velRT[1]);
    renderer.setRenderTarget(null);
  }

  // ================================================================== render scene
  const scene = new T.Scene(); scene.background = new T.Color(0.032, 0.03, 0.03);
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
  const obj = new T.Group(); scene.add(obj);
  const ref = new Float32Array(N * 2); for (let i = 0; i < N; i++) { ref[i * 2] = (i % SIZE + .5) / SIZE; ref[i * 2 + 1] = (Math.floor(i / SIZE) + .5) / SIZE; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3)); pg.setAttribute('aRef', new T.BufferAttribute(ref, 2));
  pg.boundingSphere = new T.Sphere(new T.Vector3(), 100);
  const R = { tPos: { value: null }, tVel: { value: null }, tA: { value: null }, tB: { value: null }, tCA: { value: null }, tCB: { value: null }, uMix: S.uMix, uPix: { value: 600 }, uIntro: S.uIntro, uTime: S.uTime };
  const pMat = new T.ShaderMaterial({ uniforms: R, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `uniform sampler2D tPos,tVel,tA,tB,tCA,tCB;uniform float uMix,uPix,uIntro,uTime;attribute vec2 aRef;varying vec3 vC;varying float vA;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float prog(vec2 uv,float mixv){float h=hash(uv);float st=fract(h*7.13)*.42;return smoothstep(st,st+.5,mixv);}
      void main(){vec3 p=texture2D(tPos,aRef).xyz;float sp=length(texture2D(tVel,aRef).xyz);
        float k=prog(aRef,uMix);float sz=mix(texture2D(tA,aRef).w,texture2D(tB,aRef).w,k);
        vec3 c=mix(texture2D(tCA,aRef).rgb,texture2D(tCB,aRef).rgb,k);
        float heat=clamp(sp*.09,0.,1.);c=mix(c,vec3(1.,.5,.2),heat*.75);
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=max(1.,sz*.028*uPix/-mv.z*(1.+heat*.6));
        vC=c;vA=.55+heat*.6;}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=smoothstep(.5,.05,d);gl_FragColor=vec4(vC*a*vA,1.);}` });
  const points = new T.Points(pg, pMat); obj.add(points);

  // faint floor grid for depth
  const grid = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uIntro: S.uIntro },
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uIntro;varying vec2 vP;void main(){vec2 g=abs(fract(vP*.5)-.5)/fwidth(vP*.5);float l=1.-min(min(g.x,g.y),1.);float f=smoothstep(14.,2.,length(vP));gl_FragColor=vec4(vec3(1.,.6,.35)*l*f*.07*uIntro,1.);}` }));
  grid.rotation.x = -Math.PI / 2; grid.position.y = -4.6; scene.add(grid);

  // ================================================================== post (bloom + grade)
  const rp = { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
  const rtScene = new T.WebGLRenderTarget(2, 2, Object.assign({}, rp, { depthBuffer: true })), rtA = new T.WebGLRenderTarget(2, 2, rp), rtB = new T.WebGLRenderTarget(2, 2, rp), rtC = new T.WebGLRenderTarget(2, 2, rp), rtD = new T.WebGLRenderTarget(2, 2, rp);
  const brightMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(.55,1.4,l),1.);}` });
  const blurMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.227;c+=texture2D(tDiffuse,vUv+uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv-uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv+uDir*3.231).rgb*.07;c+=texture2D(tDiffuse,vUv-uDir*3.231).rgb*.07;gl_FragColor=vec4(c,1.);}` });
  const compMat = new T.ShaderMaterial({ uniforms: { tScene: { value: null }, tB1: { value: null }, tB2: { value: null }, uTime: S.uTime, uRes: { value: new T.Vector2(1, 1) } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tScene,tB1,tB2;uniform float uTime;uniform vec2 uRes;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec2 d=vUv-.5;float r2=dot(d,d);vec2 off=d*r2*.008;vec3 c=vec3(texture2D(tScene,vUv+off).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv-off).b);
        c+=texture2D(tB1,vUv).rgb*.6+texture2D(tB2,vUv).rgb*.8;c=vec3(1.)-exp(-c*1.25);c*=1.-smoothstep(.2,.8,r2*1.4)*.5;c+=(h(vUv*uRes+fract(uTime))-.5)*.016;gl_FragColor=vec4(c,1.);}` });

  // ================================================================== UI (product selector + hint)
  const NAMES = [{ en: 'Websites', pt: 'Sites', da: 'Hjemmesider' }, { en: 'CRMs', pt: 'CRMs', da: 'CRM-systemer' }, { en: 'Apps', pt: 'Apps', da: 'Apps' }];
  const ui = document.createElement('div'); ui.className = 'mf-ui';
  ui.innerHTML = NAMES.map((n, i) => `<button type="button" data-i="${i}"><em>0${i + 1}</em><span data-en>${n.en}</span><span data-pt>${n.pt}</span><span data-da>${n.da}</span><i><b></b></i></button>`).join('');
  wrap.appendChild(ui);
  const btns = [...ui.querySelectorAll('button')];
  const hint = wrap.querySelector('.globe-hint');
  const touch = matchMedia('(hover:none)').matches;
  if (hint && touch) hint.innerHTML = '<span data-en>Tap to scatter · swipe through it</span><span data-pt>Toque para dispersar · deslize por dentro</span><span data-da>Tryk for at sprede · stryg igennem</span>';
  else if (hint) hint.innerHTML = '<span data-en>Move through it · click to scatter</span><span data-pt>Passe o cursor por dentro · clique para dispersar</span><span data-da>Bevæg dig igennem · klik for at sprede</span>';

  // ================================================================== state + timeline
  let shapes = null, cur = 0, from = 0, mixT = 1, cycleT = 0, userHold = 0;
  const HOLD = 6.2;
  function setWord(i) {
    rots.forEach(r => { const w = [...r.children]; w.forEach((s, j) => { if (j === i) { s.classList.remove('out'); s.classList.add('on'); } else if (s.classList.contains('on')) { s.classList.remove('on'); s.classList.add('out'); setTimeout(() => s.classList.remove('out'), 700); } }); });
  }
  function goTo(i, user) {
    if (!shapes || i === cur) { if (user) userHold = 14; return; }
    from = cur; cur = i; mixT = 0; cycleT = 0;
    S.tA.value = R.tA.value = shapes[from].tp; S.tB.value = R.tB.value = shapes[cur].tp;
    R.tCA.value = shapes[from].tc; R.tCB.value = shapes[cur].tc;
    setWord(i);
    btns.forEach((b, j) => b.classList.toggle('on', j === i));
    if (user) userHold = 14;
  }
  btns.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.i, true)));

  // ================================================================== sizing
  let W = 1, H = 1, wide = true, PIX = 600;
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height)); wide = W > 1000;
    renderer.setSize(W, H, false);
    const w = Math.round(W * DPR), h = Math.round(H * DPR);
    rtScene.setSize(w, h); rtA.setSize(w >> 1, h >> 1); rtB.setSize(w >> 1, h >> 1); rtC.setSize(w >> 2, h >> 2); rtD.setSize(w >> 2, h >> 2);
    compMat.uniforms.uRes.value.set(w, h);
    camera.aspect = W / H;
    const objW = 11.5; // world width to fit
    const px = wide ? Math.min(W * 0.44, H * 0.95 * 1.37) : Math.min(W * 0.86, (H - 120) * 1.37);
    const dist = objW / 2 / Math.tan(camera.fov * Math.PI / 360) * (H / px) * (1 / 1);
    camera.position.set(0, 0.4, dist * (H / H));
    camera.userData.dist = dist;
    if (wide) camera.setViewOffset(W, H, -W * 0.215, H * 0.01, W, H); else camera.setViewOffset(W, H, 0, H * 0.1, W, H);
    camera.updateProjectionMatrix();
    PIX = (H * DPR) / (2 * Math.tan(camera.fov * Math.PI / 360)); R.uPix.value = PIX;
    ui.classList.toggle('narrow', !wide);
  }
  size(); addEventListener('resize', size);

  // ================================================================== input
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(), hit = new T.Vector3(), prevM = new T.Vector3(), nrm = new T.Vector3();
  let over = false, mxs = 0, mys = 0, lastMoveT = 0;
  function toLocal(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    obj.updateMatrixWorld(); nrm.set(0, 0, 1).transformDirection(obj.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(nrm, obj.getWorldPosition(new T.Vector3()).add(nrm.clone().multiplyScalar(0.8)));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return obj.worldToLocal(hit.clone());
  }
  addEventListener('pointermove', e => {
    mxs = e.clientX / innerWidth - .5; mys = e.clientY / innerHeight - .5;
    const r = cv.getBoundingClientRect();
    over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom && !e.target.closest('a,button,.mf-ui');
    if (!over) return;
    const p = toLocal(e); if (!p) return;
    const now = performance.now(), dt = Math.max(8, now - lastMoveT) / 1000; lastMoveT = now;
    S.uMVel.value.copy(p).sub(prevM).divideScalar(dt).clampLength(0, 30); prevM.copy(p);
    S.uMouse.value.copy(p);
  }, { passive: true });
  cv.addEventListener('pointerleave', () => { over = false; });
  cv.addEventListener('pointerdown', e => { const p = toLocal(e); if (p) { S.uShock.value.set(p.x, p.y, p.z, 0); userHold = Math.max(userHold, 6); } });
  let scrollK = 0;
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); }, { passive: true });

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ================================================================== loop
  const clock = new T.Clock();
  let t = 0, running = false;
  function loop() { if (running) return; running = true; requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); }); }
  function frame() {
    const dt = Math.min(0.033, clock.getDelta()); t += dt;
    if (!shapes) return;
    S.uTime.value = t; S.uDt.value = dt;
    if (!reduce && S.uIntro.value < 1) S.uIntro.value = Math.min(1, S.uIntro.value + dt * 0.45);
    // timeline
    mixT = Math.min(1, mixT + dt / 2.4); S.uMix.value = reduce ? 1 : mixT;
    if (userHold > 0) userHold -= dt; else if (!reduce && S.uIntro.value >= 1) { cycleT += dt; if (cycleT > HOLD && !over) goTo((cur + 1) % 3); }
    btns.forEach((b, j) => b.querySelector('b').style.transform = `scaleX(${j === cur ? (userHold > 0 ? 1 : Math.min(1, cycleT / HOLD)) : 0})`);
    // input easing
    S.uMOn.value += ((over ? 1 : 0) - S.uMOn.value) * 0.12;
    S.uMVel.value.multiplyScalar(0.9);
    if (S.uShock.value.w < 50) S.uShock.value.w += dt;
    // object pose: gentle float + parallax tilt to reveal the layers
    const ty = (reduce ? 0 : Math.sin(t * .35) * .1) - mxs * 0.55, tx = (reduce ? 0 : Math.sin(t * .27) * .05) + mys * 0.3 - 0.06;
    obj.rotation.y += (ty - 0.28 * (wide ? 1 : .4) - obj.rotation.y) * 0.05;
    obj.rotation.x += (tx - obj.rotation.x) * 0.05;
    obj.position.y = Math.sin(t * .6) * .08 + scrollK * 2;
    // simulate
    S.tPos.value = posRT[pi].texture; S.tVel.value = velRT[vi].texture; pass(velMat, velRT[1 - vi]); vi = 1 - vi;
    S.tVel.value = velRT[vi].texture; pass(posMat, posRT[1 - pi]); pi = 1 - pi;
    R.tPos.value = posRT[pi].texture; R.tVel.value = velRT[vi].texture;
    // render
    renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(scene, camera);
    brightMat.uniforms.tDiffuse.value = rtScene.texture; pass(brightMat, rtA);
    blurMat.uniforms.tDiffuse.value = rtA.texture; blurMat.uniforms.uDir.value.set(1 / rtA.width, 0); pass(blurMat, rtB);
    blurMat.uniforms.tDiffuse.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, 1 / rtA.height); pass(blurMat, rtA);
    blurMat.uniforms.tDiffuse.value = rtA.texture; blurMat.uniforms.uDir.value.set(2 / rtA.width, 0); pass(blurMat, rtC);
    blurMat.uniforms.tDiffuse.value = rtC.texture; blurMat.uniforms.uDir.value.set(0, 2 / rtC.height); pass(blurMat, rtD);
    compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tB1.value = rtA.texture; compMat.uniforms.tB2.value = rtD.texture;
    pass(compMat, null);
  }

  // build shapes once fonts are ready (canvas text uses the site fonts)
  const build = () => {
    shapes = SHAPES.map(sampleShape);
    S.tA.value = R.tA.value = shapes[0].tp; S.tB.value = R.tB.value = shapes[0].tp; R.tCA.value = R.tCB.value = shapes[0].tc;
    cur = 0; mixT = 1; btns[0].classList.add('on'); setWord(0);
    loop();
  };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(build);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
