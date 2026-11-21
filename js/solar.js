/* Vero — hero solar system v3 (WebGL, three r149).
   The 8 planets, each one a service (content in js/solar-data.js): Mercury SEO · Venus Branding · Earth Websites ·
   Mars Ads · Jupiter Apps · Saturn CRMs · Uranus AI receptionist · Neptune Email & SMS. Sun = your business.
   HDR → custom bloom → filmic grade. Asteroid + Kuiper belts, Saturn/Uranus rings with shadows, Earth's moon,
   light streams to the core services, decluttered labels, and a dossier panel with tabs and a planet tour.
   Falls back to the 2D globe without WebGL. */
(function () {
  if (!window.VERO_GL) return;
  const wrap = document.querySelector('.globe-wrap');
  const DATA = window.VERO_SOLAR, UIX = window.VERO_SOLAR_UI;
  if (!wrap || !DATA) return;
  if (!window.THREE) { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const old = document.getElementById('globe');
  const hero = document.getElementById('hero');

  const T = THREE;
  const cv = document.createElement('canvas');
  cv.id = 'globe-gl';
  cv.setAttribute('aria-label', 'Interactive solar system: each planet is one of our services');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  if (old) old.style.display = 'none';
  wrap.insertBefore(cv, wrap.firstChild);
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);
  const GL2 = renderer.capabilities.isWebGL2;

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const lang = () => document.documentElement.lang || 'en';
  const tx = o => (o && (o[lang()] || o.en)) || '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const scene = new T.Scene();
  scene.background = new T.Color(0.032, 0.03, 0.03);
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 600);
  const sys = new T.Group(); scene.add(sys);
  let focus = null;

  // ================================================================== GLSL
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
  float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.02;a*=.5;}return f;}`;

  const U = { uTime: { value: 0 }, uIntro: { value: reduce ? 1 : 0 }, uSun: { value: new T.Vector3() } };

  // ================================================================== sun
  const SUN_R = 1.0;
  const sunMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPulse: { value: 0 } },
    vertexShader: `varying vec3 vObj;varying vec3 vN;varying vec3 vV;void main(){vObj=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uPulse;varying vec3 vObj;varying vec3 vN;varying vec3 vV;
      void main(){vec3 p=normalize(vObj);float t=uTime*.035;
        vec3 q=vec3(fbm(p*1.7+t),fbm(p*1.7+vec3(5.2,1.3,2.8)-t),0.);
        float big=fbm(p*2.4+q*1.2+t*.6);float gran=pow(1.-abs(snoise(p*22.+vec3(t*3.))),3.);
        float h=clamp(.55+big*.55+gran*.22,0.,1.);float mu=max(dot(vN,vV),0.);float limb=pow(mu,.55);
        vec3 c=mix(vec3(1.,.36,.09),vec3(1.,.72,.42),h);c=mix(c,vec3(1.,.88,.7),pow(h,5.));
        c*=(.3+.9*limb);c*=1.9+uPulse*2.;gl_FragColor=vec4(c,1.);}`
  });
  const sun = new T.Mesh(new T.SphereGeometry(SUN_R, 96, 96), sunMat); sys.add(sun);
  const corona = new T.Mesh(new T.PlaneGeometry(12, 12), new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPulse: sunMat.uniforms.uPulse }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uPulse;varying vec2 vUv;
      void main(){vec2 p=vUv*2.-1.;float d=length(p)*6.;if(d<.98)discard;float a=atan(p.y,p.x);
        float s=snoise(vec3(cos(a)*1.4,sin(a)*1.4,uTime*.05))*.5+.5;float fall=exp(-(d-1.)*(2.6-s*1.1));float halo=exp(-(d-1.)*.55)*.12;
        gl_FragColor=vec4(vec3(1.,.52,.22)*(fall*.9+halo)*(1.+uPulse),1.);}`
  }));
  sys.add(corona);

  // ================================================================== planet shading
  const planetVS = `varying vec3 vObj;varying vec3 vN;varying vec3 vW;void main(){vObj=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const planetFS = NOISE + `uniform float uTime;uniform float uType;uniform float uSeed;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAtm;uniform vec3 uSun;
    uniform float uRing;uniform vec3 uRingN;uniform vec3 uCtr;uniform float uRin;uniform float uRout;uniform float uBands;uniform float uStorm;
    varying vec3 vObj;varying vec3 vN;varying vec3 vW;
    void main(){vec3 p=normalize(vObj);vec3 N=normalize(vN);vec3 L=normalize(uSun-vW);vec3 V=normalize(cameraPosition-vW);
      float nl=dot(N,L);float day=smoothstep(-.06,.28,nl);vec3 col;float lights=0.;float spec=0.;
      if(uType<.5){ // earth
        float n=fbm(p*1.9+uSeed);float land=smoothstep(.04,.12,n);
        vec3 ocean=mix(uA*.45,uA,smoothstep(-.5,.05,n));vec3 ground=mix(uB,uC,smoothstep(.12,.5,n+fbm(p*6.)*.15));
        col=mix(ocean,ground,land);col=mix(col,vec3(.92,.95,.97),smoothstep(.78,.9,abs(p.y)+n*.1));
        float cl=smoothstep(.05,.55,fbm(p*3.1+vec3(uTime*.01,0.,uSeed)))*.85;col=mix(col,vec3(.96),cl);
        spec=pow(max(dot(reflect(-L,N),V),0.),60.)*(1.-land)*(1.-cl)*.8;
        lights=land*(1.-cl)*smoothstep(.62,.95,snoise(p*46.+uSeed)*.5+.5);
      }else if(uType<1.5){ // gas giant
        float w=fbm(p*vec3(1.2,3.6,1.2)+uSeed+vec3(uTime*.006,0.,0.));
        float lat=p.y+w*.12;float b=sin(lat*uBands)*.5+.5;float b2=sin(lat*uBands*2.7+w*4.)*.5+.5;float b3=sin(lat*uBands*.45+1.)*.5+.5;
        col=mix(uA,uB,b);col=mix(col,uC,b2*.28);col*=.82+b3*.3;
        vec3 sp=normalize(vec3(.55,-.33,.78));float st=smoothstep(.2,.0,distance(p,sp)+snoise(p*8.+uTime*.03)*.035)*uStorm;col=mix(col,vec3(.75,.32,.18),st*.85);
      }else if(uType<2.5){ // ice giant
        float w=fbm(p*vec3(1.,3.,1.)+uSeed);float b=sin((p.y+w*.05)*uBands)*.5+.5;
        col=mix(uA,uB,b*.35+smoothstep(-.8,.8,p.y)*.2);
        vec3 sp=normalize(vec3(-.4,-.25,.88));col=mix(col,uC,smoothstep(.16,.0,distance(p,sp))*uStorm);
        spec=pow(max(dot(reflect(-L,N),V),0.),30.)*.12;
      }else if(uType<3.5){ // rocky / cratered
        float n=fbm(p*2.4+uSeed);float cr=0.;
        for(int k=0;k<3;k++){float f=float(k);float c=snoise(p*(5.+f*5.)+uSeed+f*7.);cr+=smoothstep(.55,.62,c)*(1.-smoothstep(.62,.8,c))*.6;}
        col=mix(uA,uB,smoothstep(-.4,.5,n));col=mix(col,uC,cr);
        col=mix(col,vec3(.92,.9,.88),smoothstep(.86,.95,abs(p.y))*uStorm);
      }else{ // venus clouds
        float w=fbm(p*vec3(2.,1.,2.)+vec3(uTime*.01,0.,0.)+fbm(p*3.+uSeed));
        col=mix(uA,uB,smoothstep(-.4,.5,w));col=mix(col,uC,smoothstep(.3,.7,fbm(p*5.+uSeed))*.3);
      }
      float sh=1.;
      if(uRing>.5){float dn=dot(L,uRingN);if(abs(dn)>.001){float tt=dot(uCtr-vW,uRingN)/dn;if(tt>0.){vec3 hp=vW+L*tt;float rr=(length(hp-uCtr)-uRin)/(uRout-uRin);
        if(rr>0.&&rr<1.){float band=snoise(vec3(rr*38.,0.,1.))*.5+.5;sh=1.-(.35+band*.45)*smoothstep(0.,.06,rr)*smoothstep(1.,.85,rr)*uRing*.9;}}}}
      float amb=.05+pow(max(dot(N,V),0.),2.)*.06;
      vec3 lit=col*(day*sh)*1.25+col*amb+spec*day+vec3(1.,.6,.28)*lights*(1.-day)*1.2;
      lit+=uAtm*pow(1.-max(dot(N,V),0.),4.)*smoothstep(-.25,.6,nl)*1.1;
      gl_FragColor=vec4(lit,1.);}`;
  const atmVS = `varying vec3 vN;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const atmFS = `uniform vec3 uAtm;uniform vec3 uSun;uniform float uHi;varying vec3 vN;varying vec3 vW;
    void main(){vec3 V=normalize(cameraPosition-vW);vec3 L=normalize(uSun-vW);float i=pow(1.-abs(dot(vN,V)),6.)*1.6;float d=smoothstep(-.3,.7,dot(vN,L));gl_FragColor=vec4(uAtm*i*d*(1.+uHi*.6),1.);}`;
  const ringFS = NOISE + `uniform float uIn;uniform float uOut;uniform vec3 uSun;uniform vec3 uCtr;uniform float uPR;uniform float uA;uniform vec3 uCol;varying vec3 vL;varying vec3 vW;
    void main(){float r=(length(vL.xy)-uIn)/(uOut-uIn);
      float b=snoise(vec3(r*30.,0.,1.))*.5+.5;float b2=snoise(vec3(r*140.,3.,2.))*.5+.5;float b3=snoise(vec3(r*9.,7.,2.))*.5+.5;
      float a=smoothstep(0.,.05,r)*smoothstep(1.,.9,r)*(.18+b*.42+b2*.22)*(.6+b3*.6);a*=1.-smoothstep(.55,.58,r)*smoothstep(.66,.63,r)*.9;
      vec3 L=normalize(uSun-vW);vec3 toC=uCtr-vW;float tt=dot(toC,L);float sh=1.;if(tt>0.){float d=length(toC-L*tt);sh=smoothstep(uPR*.92,uPR*1.04,d);}
      vec3 c=mix(uCol,uCol*.7,b)*1.3;c*=.2+.8*sh;gl_FragColor=vec4(c,a*uA);}`;

  // appearance per service key
  const LOOK = {
    seo:   { r: 0.17, orbit: 2.25, period: 16, phase: 0.4, tilt: 0.02, type: 3, seed: 2.0, A: '#7d7a76', B: '#b3aea6', C: '#4b4845', atm: '#000000', bands: 0, storm: 0 },
    brand: { r: 0.3, orbit: 3.05, period: 24, phase: 2.2, tilt: 0.05, type: 4, seed: 4.4, A: '#c9a46a', B: '#f0dcb4', C: '#9a7444', atm: '#ffd9a0', bands: 0, storm: 0 },
    web:   { r: 0.36, orbit: 3.95, period: 32, phase: 4.6, tilt: 0.41, type: 0, seed: 3.1, A: '#1d4f8f', B: '#5b7d4a', C: '#cdb98a', atm: '#4f9dff', bands: 0, storm: 0, moon: true, stream: 1 },
    ads:   { r: 0.23, orbit: 4.8, period: 44, phase: 0.9, tilt: 0.44, type: 3, seed: 9.3, A: '#9a4a2a', B: '#c9774a', C: '#5a2a18', atm: '#ff9a70', bands: 0, storm: 1 },
    app:   { r: 0.82, orbit: 7.3, period: 84, phase: 2.9, tilt: 0.05, type: 1, seed: 7.7, A: '#b98a62', B: '#ecdcc6', C: '#7a4a2c', atm: '#ffcf9e', bands: 16, storm: 1, stream: 3 },
    crm:   { r: 0.7, orbit: 9.0, period: 116, phase: 5.2, tilt: 0.47, type: 1, seed: 11.2, A: '#cfae78', B: '#efe0bf', C: '#9a7848', atm: '#ffe2b0', bands: 22, storm: 0, ring: [1.3, 2.3, .95, '#dcc39a'], stream: 2 },
    ai:    { r: 0.42, orbit: 10.55, period: 150, phase: 0.2, tilt: 1.7, type: 2, seed: 13.4, A: '#8fd3dc', B: '#bfeef2', C: '#6ab3c0', atm: '#a8f0ff', bands: 10, storm: 0, ring: [1.6, 2.0, .35, '#a9c9cf'] },
    mail:  { r: 0.4, orbit: 11.85, period: 190, phase: 3.7, tilt: 0.49, type: 2, seed: 15.9, A: '#2d4fbf', B: '#5a7fe6', C: '#152a70', atm: '#6f95ff', bands: 12, storm: 1 }
  };
  const C3 = h => new T.Color(h);
  const PL = DATA.map(d => Object.assign({}, d, LOOK[d.key]));
  PL.forEach(P => {
    const ring = P.ring;
    P.uni = { uTime: U.uTime, uSun: U.uSun, uType: { value: P.type }, uSeed: { value: P.seed }, uA: { value: C3(P.A) }, uB: { value: C3(P.B) }, uC: { value: C3(P.C) }, uAtm: { value: C3(P.atm) },
      uRing: { value: ring ? ring[2] : 0 }, uRingN: { value: new T.Vector3(0, 1, 0) }, uCtr: { value: new T.Vector3() }, uRin: { value: ring ? P.r * ring[0] : 0 }, uRout: { value: ring ? P.r * ring[1] : 0 },
      uBands: { value: P.bands }, uStorm: { value: P.storm }, uHi: { value: 0 } };
    P.body = new T.Group(); sys.add(P.body);
    P.tiltG = new T.Group(); P.tiltG.rotation.z = P.tilt; P.body.add(P.tiltG);
    P.mesh = new T.Mesh(new T.SphereGeometry(P.r, P.r > .5 ? 96 : 64, P.r > .5 ? 96 : 64), new T.ShaderMaterial({ uniforms: P.uni, vertexShader: planetVS, fragmentShader: planetFS }));
    P.tiltG.add(P.mesh);
    if (P.atm !== '#000000') P.tiltG.add(new T.Mesh(new T.SphereGeometry(P.r * 1.035, 48, 48), new T.ShaderMaterial({ uniforms: { uAtm: P.uni.uAtm, uSun: U.uSun, uHi: P.uni.uHi }, vertexShader: atmVS, fragmentShader: atmFS, transparent: true, depthWrite: false, blending: T.AdditiveBlending })));
    if (ring) {
      P.ringMesh = new T.Mesh(new T.RingGeometry(P.r * ring[0], P.r * ring[1], 220, 1), new T.ShaderMaterial({
        uniforms: { uIn: { value: P.r * ring[0] }, uOut: { value: P.r * ring[1] }, uSun: U.uSun, uCtr: P.uni.uCtr, uPR: { value: P.r }, uA: { value: ring[2] }, uCol: { value: C3(ring[3]) } },
        transparent: true, depthWrite: false, side: T.DoubleSide,
        vertexShader: `varying vec3 vL;varying vec3 vW;void main(){vL=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`, fragmentShader: ringFS
      }));
      P.ringMesh.rotation.x = -Math.PI / 2; P.tiltG.add(P.ringMesh);
    }
    if (P.moon) {
      P.moonPivot = new T.Group(); P.body.add(P.moonPivot);
      const mu = Object.assign({}, P.uni, { uType: { value: 3 }, uSeed: { value: 30 }, uA: { value: C3('#6d6a66') }, uB: { value: C3('#b9b4ab') }, uC: { value: C3('#3b3936') }, uAtm: { value: C3('#000') }, uRing: { value: 0 }, uStorm: { value: 0 } });
      const mm = new T.Mesh(new T.SphereGeometry(0.085, 40, 40), new T.ShaderMaterial({ uniforms: mu, vertexShader: planetVS, fragmentShader: planetFS }));
      mm.position.set(P.r * 2.4, 0.05, 0); P.moonPivot.add(mm); P.moonPivot.rotation.z = 0.12;
    }
    P.ang = P.phase;
  });

  // ================================================================== orbits + scale ring
  const lineMat = base => new T.ShaderMaterial({
    uniforms: { uPA: { value: -99 }, uK: { value: 0 }, uHi: { value: 0 }, uBase: { value: base } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uPA;uniform float uK;uniform float uHi;uniform float uBase;varying float vA;
      void main(){float d=mod(uPA-vA,6.28318)/6.28318;float shown=step(vA/6.28318,uK);float trail=pow(1.-d,14.)*.7;
        float a=(uBase+uHi*.14+trail)*shown;gl_FragColor=vec4(mix(vec3(.9,.88,.84),vec3(1.,.62,.36),clamp(trail*1.6,0.,1.))*a,1.);}`
  });
  function circle(r, n) { const pos = new Float32Array((n + 1) * 3), aa = new Float32Array(n + 1); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 2] = -Math.sin(a) * r; aa[i] = a; } const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aA', new T.BufferAttribute(aa, 1)); return g; }
  PL.forEach(P => { P.orbitMat = lineMat(P.kind === 'core' ? 0.09 : 0.05); sys.add(new T.Line(circle(P.orbit, 600), P.orbitMat)); });
  const SCALE_R = 13.2;
  const scaleMat = lineMat(0.05), tickMat = lineMat(0.11);
  sys.add(new T.Line(circle(SCALE_R, 720), scaleMat));
  {
    const pos = [], aa = [];
    for (let i = 0; i < 360; i += 2) { const a = i / 180 * Math.PI, len = i % 30 === 0 ? 0.5 : i % 10 === 0 ? 0.26 : 0.12, c = Math.cos(a), s = -Math.sin(a); pos.push(c * SCALE_R, 0, s * SCALE_R, c * (SCALE_R + len), 0, s * (SCALE_R + len)); aa.push(a, a); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('aA', new T.BufferAttribute(new Float32Array(aa), 1));
    sys.add(new T.LineSegments(g, tickMat));
  }

  // ================================================================== dust disc + belts
  const disc = new T.Mesh(new T.PlaneGeometry(34, 34), new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uIntro: U.uIntro }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uIntro;varying vec2 vP;
      void main(){float r=length(vP);float a=atan(vP.y,vP.x);
        float bands=snoise(vec3(r*2.2,0.,3.))*.5+.5;float fine=snoise(vec3(r*11.,a*.3,uTime*.01))*.5+.5;
        float swirl=fbm(vec3(cos(a+r*.3-uTime*.02)*r*.4,sin(a+r*.3-uTime*.02)*r*.4,1.))*.5+.5;
        float env=smoothstep(1.4,2.6,r)*smoothstep(14.5,9.,r);float belt=exp(-pow((r-6.)*1.6,2.))*1.4+exp(-pow((r-13.9)*.9,2.))*.8;
        float i=(env*.3+belt)*(bands*.6+.4)*(fine*.5+.5)*swirl/(.6+r*.1);
        vec3 c=mix(vec3(1.,.55,.28),vec3(.75,.7,.68),smoothstep(2.,9.,r));gl_FragColor=vec4(c*i*.1*uIntro,1.);}`
  }));
  disc.rotation.x = -Math.PI / 2; sys.add(disc);
  const pointVS = `attribute float aR;attribute float aA;attribute float aS;attribute float aY;attribute float aSz;attribute float aC;
    uniform float uTime;uniform float uPix;uniform float uIntro;varying float vC;varying float vF;
    void main(){float a=aA+uTime*aS;float r=aR*(1.+(1.-uIntro)*.6);vec3 p=vec3(cos(a)*r,aY,-sin(a)*r);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float s=aSz*uPix/-mv.z;gl_PointSize=max(1.,s);vC=aC;vF=uIntro*clamp(s,0.,1.);}`;
  const beltFS = `varying float vC;varying float vF;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 col=mix(vec3(.78,.74,.7),vec3(1.,.6,.35),vC);gl_FragColor=vec4(col*smoothstep(.5,0.,d)*.55*vF,1.);}`;
  function belt(count, rIn, rOut, thick, speed, sz, warm) {
    const g = new T.BufferGeometry(), A = { aR: [], aA: [], aS: [], aY: [], aSz: [], aC: [] };
    for (let i = 0; i < count; i++) {
      const u = Math.random(), r = rIn + (rOut - rIn) * (0.5 + 0.5 * Math.sign(u - .5) * Math.pow(Math.abs(u - .5) * 2, 1.6));
      A.aR.push(r); A.aA.push(Math.random() * Math.PI * 2); A.aS.push(speed / Math.pow(r, 1.5));
      A.aY.push((Math.random() - .5) * thick); A.aSz.push(sz * (0.4 + Math.pow(Math.random(), 4) * 1.8)); A.aC.push(Math.random() < warm ? 1 : 0);
    }
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
    Object.keys(A).forEach(k => g.setAttribute(k, new T.BufferAttribute(new Float32Array(A[k]), 1)));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 50);
    const m = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uPix: { value: 600 }, uIntro: U.uIntro }, vertexShader: pointVS, fragmentShader: beltFS, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    sys.add(new T.Points(g, m)); return m;
  }
  const beltMats = [belt(small ? 3500 : 9000, 5.55, 6.45, .14, 2.4, .022, .1), belt(small ? 3000 : 8000, 13.3, 14.7, .3, 2.2, .026, .04)];

  // ================================================================== light streams sun → core planets
  const CORE = PL.filter(P => P.stream);
  const SPP = small ? 22 : 40;
  const streamGeo = new T.BufferGeometry();
  const sPos = new Float32Array(CORE.length * SPP * 3), sA = new Float32Array(CORE.length * SPP);
  streamGeo.setAttribute('position', new T.BufferAttribute(sPos, 3)); streamGeo.setAttribute('aF', new T.BufferAttribute(sA, 1));
  streamGeo.boundingSphere = new T.Sphere(new T.Vector3(), 50);
  const streamMat = new T.ShaderMaterial({ uniforms: { uPix: { value: 600 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float aF;uniform float uPix;varying float vF;void main(){vF=aF;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(1.,.035*uPix/-mv.z);}`,
    fragmentShader: `varying float vF;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(1.,.7,.45)*smoothstep(.5,0.,d)*vF*1.6,1.);}` });
  sys.add(new T.Points(streamGeo, streamMat));
  const seeds = Array.from({ length: CORE.length * SPP }, () => [Math.random(), (Math.random() - .5) * 2, 0.25 + Math.random() * 0.35]);

  // ================================================================== stars
  {
    const N = small ? 2200 : 5200, pos = new Float32Array(N * 3), sz = new Float32Array(N), ph = new Float32Array(N), col = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let u = Math.random() * 2 - 1; if (Math.random() < .45) u *= .18;
      const th = Math.random() * Math.PI * 2, r = 160 + Math.random() * 60, s = Math.sqrt(1 - u * u), x = r * s * Math.cos(th);
      pos[i * 3] = x; pos[i * 3 + 1] = r * u * .9 + x * .35; pos[i * 3 + 2] = r * s * Math.sin(th);
      sz[i] = .6 + Math.pow(Math.random(), 7) * 3; ph[i] = Math.random() * 6.28; col[i] = Math.random();
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aS', new T.BufferAttribute(sz, 1)); g.setAttribute('aP', new T.BufferAttribute(ph, 1)); g.setAttribute('aC', new T.BufferAttribute(col, 1));
    scene.add(new T.Points(g, new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uDPR: { value: DPR } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: `attribute float aS;attribute float aP;attribute float aC;uniform float uTime;uniform float uDPR;varying float vT;varying float vC;void main(){vC=aC;vT=.6+.4*sin(uTime*(.6+aP*.25)+aP);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aS*uDPR;}`,
      fragmentShader: `varying float vT;varying float vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(vec3(.75,.82,1.),vec3(1.,.85,.7),vC);gl_FragColor=vec4(c*smoothstep(.5,0.,d)*vT*.55,1.);}` })));
  }

  const pulseMat = new T.ShaderMaterial({ uniforms: { uR: { value: 0 }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uR;uniform float uA;varying vec2 vP;void main(){float d=length(vP);float a=exp(-pow((d-uR)*6.,2.))*uA;gl_FragColor=vec4(vec3(1.,.62,.36)*a*.8,1.);}` });
  const pulse = new T.Mesh(new T.PlaneGeometry(30, 30), pulseMat); pulse.rotation.x = -Math.PI / 2; sys.add(pulse);
  let pulseT = -10;

  // ================================================================== post: bloom + grade
  const rtOpt = { type: GL2 ? T.HalfFloatType : T.UnsignedByteType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
  const rtScene = new T.WebGLRenderTarget(2, 2, Object.assign({}, rtOpt, { depthBuffer: true, samples: GL2 ? 4 : 0 }));
  const rtA = new T.WebGLRenderTarget(2, 2, rtOpt), rtB = new T.WebGLRenderTarget(2, 2, rtOpt), rtC = new T.WebGLRenderTarget(2, 2, rtOpt), rtD = new T.WebGLRenderTarget(2, 2, rtOpt);
  const fsCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsScene = new T.Scene();
  const fsQuad = new T.Mesh(new T.PlaneGeometry(2, 2)); fsQuad.frustumCulled = false; fsScene.add(fsQuad);
  const fsVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
  const brightMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uThr: { value: GL2 ? 0.9 : 0.6 } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uThr;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(uThr,uThr+.8,l),1.);}` });
  const blurMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.227;
      c+=texture2D(tDiffuse,vUv+uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv-uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv+uDir*3.231).rgb*.07;c+=texture2D(tDiffuse,vUv-uDir*3.231).rgb*.07;gl_FragColor=vec4(c,1.);}` });
  const compMat = new T.ShaderMaterial({ uniforms: { tScene: { value: null }, tB1: { value: null }, tB2: { value: null }, uTime: U.uTime, uRes: { value: new T.Vector2(1, 1) }, uFade: { value: 0 } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tScene;uniform sampler2D tB1;uniform sampler2D tB2;uniform float uTime;uniform vec2 uRes;uniform float uFade;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec2 d=(vUv-.5);float r2=dot(d,d);vec2 off=d*r2*.006;
        vec3 c=vec3(texture2D(tScene,vUv+off).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv-off).b);
        c+=texture2D(tB1,vUv).rgb*.55+texture2D(tB2,vUv).rgb*.9;c=vec3(1.)-exp(-c*1.35);c=pow(c,vec3(.96,1.,1.04));
        c*=1.-smoothstep(.18,.75,r2*1.4)*.55;c+=(h(vUv*uRes+fract(uTime))-.5)*.018;gl_FragColor=vec4(c*uFade,1.);}` });
  function pass(mat, target) { fsQuad.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }

  // ================================================================== labels
  const mk = (cls, html) => { const d = document.createElement('div'); d.className = 'sol-label ' + cls; d.innerHTML = html; wrap.appendChild(d); return d; };
  PL.forEach(P => { P.el = mk(P.kind === 'core' ? 'pl core' : 'pl add', `<i></i><div><em>${P.kind === 'core' ? P.idx : '+'}</em><b></b><small></small></div>`); P.el._dy = 0; });
  const sunEl = mk('pl sun', '<i></i><div><em>00</em><b></b></div>'); sunEl._dy = 0;
  function writeText() {
    PL.forEach(P => { P.el.querySelector('b').textContent = tx(P.n); P.el.querySelector('small').textContent = tx(P.planet); });
    sunEl.querySelector('b').textContent = tx(UIX.sun);
    requestAnimationFrame(() => [...PL.map(P => P.el), sunEl].forEach(el => { el._w = el.querySelector('div').offsetWidth || 90; el._h = el.querySelector('div').offsetHeight || 20; }));
    if (focus) renderPanel(focus, panelTab);
  }

  // ================================================================== dossier panel
  const panel = document.createElement('aside'); panel.className = 'sol-dossier'; panel.setAttribute('aria-live', 'polite');
  (document.body).appendChild(panel);
  let panelTab = 0;
  const T3 = o => `<span data-en>${esc(o.en)}</span><span data-pt>${esc(o.pt)}</span><span data-da>${esc(o.da)}</span>`;
  const VIS = {
    web: () => `<div class="dv dv-web"><div class="dv-bar"><i></i><i></i><i></i><span>yourbusiness.com</span></div><div class="dv-pg"><div class="h1"></div><div class="h2"></div><div class="bt"><i></i><i></i></div><div class="cd"><i></i><i></i><i></i></div></div>
      <div class="dv-lh">${[[99, 'Performance'], [100, 'SEO'], [98, 'Accessibility'], [100, 'Best practices']].map(s => `<div><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5"/><circle cx="18" cy="18" r="15.5" class="f" style="--p:${s[0]}"/></svg><b>${s[0]}</b><small>${s[1]}</small></div>`).join('')}</div></div>`,
    crm: () => `<div class="dv dv-crm"><div class="cols">${['Lead', 'Visit', 'Proposal', 'Won'].map((c, i) => `<div><small>${c}</small>${i < 3 ? '<i></i>' : ''}${i < 2 ? '<i></i>' : ''}${i === 3 ? '<i class="g"></i>' : ''}</div>`).join('')}<i class="mv"></i></div>
      <div class="auto"><span>⚡ WhatsApp sent · 0:02</span><span>⚡ Visit booked · Sat 11:00</span><span>⚡ Proposal opened</span></div></div>`,
    app: () => `<div class="dv dv-app"><div class="ph"><div class="nt"><b>Booked ✓</b><small>Tomorrow 10:30 · Studio</small></div><div class="ah"><i></i><b>Hi, Sofia</b></div><div class="it"><i></i><span></span></div><div class="it"><i></i><span></span></div><div class="it"><i></i><span></span></div><div class="tb"><i></i><i></i><i></i><i></i></div></div>
      <div class="pl"><span>iOS</span><span>Android</span><span>Web</span><span>Push</span><span>Offline</span><span>Payments</span></div></div>`,
    seo: () => `<div class="dv dv-seo"><div class="q">🔍 dentist lisbon</div>${['competitor-a.pt', 'competitor-b.com', 'directory.pt'].map((r, i) => `<div class="r" style="--i:${i}">${r}</div>`).join('')}<div class="r me">yourbusiness.pt ★ 4.9</div></div>`,
    ads: () => `<div class="dv dv-ads"><svg viewBox="0 0 200 70" preserveAspectRatio="none"><path class="a" d="M0,62 L25,58 L50,52 L75,54 L100,40 L125,34 L150,26 L175,18 L200,8 L200,70 L0,70Z"/><path class="l" d="M0,62 L25,58 L50,52 L75,54 L100,40 L125,34 L150,26 L175,18 L200,8"/></svg><div class="k"><span>ROAS <b>3.9×</b></span><span>CPL <b>−42%</b></span><span>Leads <b>+128</b></span></div></div>`,
    brand: () => `<div class="dv dv-brand"><div class="mk">V</div><div class="sw">${['#070a12', '#4d7cff', '#eef2fa', '#c9a46a', '#2f6bff'].map(c => `<i style="background:${c}"></i>`).join('')}</div><div class="ty"><b>Aa</b><span>Display · Body · Mono</span></div></div>`,
    ai: () => `<div class="dv dv-ai"><div class="m u">Do you have a table for 4 tonight?</div><div class="m a">Yes — 20:30 on the terrace. Shall I book it?</div><div class="m u">Perfect 🙌</div><div class="m a">Booked ✓ Confirmation sent.</div></div>`,
    mail: () => `<div class="dv dv-mail">${[['⏱', 'Visit done'], ['✉', 'Thank-you email'], ['⭐', 'Review request'], ['🎁', 'Birthday offer']].map((s, i) => `<div style="--i:${i}"><i>${s[0]}</i><span>${s[1]}</span></div>`).join('')}</div>`
  };
  function renderPanel(P, tab) {
    panelTab = tab || 0;
    const i = PL.indexOf(P), core = P.kind === 'core';
    const tabs = core ? UIX.tabs : UIX.tabs.slice(0, 2);
    if (panelTab >= tabs.length) panelTab = 0;
    let body = '';
    if (panelTab === 0) body = `<p class="sd-lead">${T3(P.lead)}</p>${VIS[P.vis]()}<div class="sd-stats">${P.stats.map(s => `<div><small>${T3(s[0])}</small><b>${T3(s[1])}</b></div>`).join('')}</div>`;
    else if (panelTab === 1) body = `<ul class="sd-incl">${P.incl.map(x => `<li>${T3(x)}</li>`).join('')}</ul>`;
    else body = `<ol class="sd-steps">${P.steps.map((s, k) => `<li><i>${k + 1}</i><div><b>${T3(s[0])}</b><p>${T3(s[1])}</p></div><em>${T3(s[2])}</em></li>`).join('')}</ol>`;
    const nx = PL[(i + 1) % PL.length], pv = PL[(i - 1 + PL.length) % PL.length];
    panel.innerHTML = `
      <div class="sd-top"><span class="sd-k ${core ? 'c' : ''}">${core ? P.idx + ' · ' + T3(UIX.core) : T3(UIX.addon)}</span><span class="sd-pl">${T3(P.planet)}</span><button type="button" class="sd-x" aria-label="Close">×</button></div>
      <h3>${T3(P.n)}</h3><p class="sd-s">${T3(P.s)}</p>
      <div class="sd-tabs">${tabs.map((t, k) => `<button type="button" data-t="${k}" class="${k === panelTab ? 'on' : ''}">${T3(t)}</button>`).join('')}</div>
      <div class="sd-body">${body}</div>
      <div class="sd-foot"><a class="btn p" href="contact.html">${T3(UIX.start)} →</a><a class="sd-more" href="${P.href}">${T3(UIX.more)}</a>
        <div class="sd-nav"><button type="button" data-go="${PL.indexOf(pv)}" aria-label="Previous">←</button><button type="button" data-go="${PL.indexOf(nx)}" class="nx">${T3(nx.n)} →</button></div></div>`;
    panel.querySelector('.sd-x').onclick = unfocus;
    panel.querySelectorAll('.sd-tabs button').forEach(b => b.onclick = () => renderPanel(P, +b.dataset.t));
    panel.querySelectorAll('[data-go]').forEach(b => b.onclick = () => focusOn(PL[+b.dataset.go]));
    panel.querySelector('.sd-more').onclick = () => { if (P.href.startsWith('#')) unfocus(); };
    panel.classList.add('on');
  }

  // ================================================================== camera rig + sizing
  let W = 1, H = 1, wide = true, baseDist = 30, PIX = 600, voX = -0.24;
  const EL0 = 0.46;
  const rig = { az: 0.6, el: EL0, dist: 30, tx: new T.Vector3() };
  const goal = { az: 0.6, el: EL0, dist: 30, tx: new T.Vector3() };
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height)); wide = W > 1000;
    renderer.setSize(W, H, false);
    const w = Math.round(W * DPR), h = Math.round(H * DPR);
    rtScene.setSize(w, h); rtA.setSize(w >> 1, h >> 1); rtB.setSize(w >> 1, h >> 1); rtC.setSize(w >> 2, h >> 2); rtD.setSize(w >> 2, h >> 2);
    compMat.uniforms.uRes.value.set(w, h);
    camera.aspect = W / H;
    const SYS = 12.6;
    const rpx = wide ? Math.min(W * 0.31, H * 0.95) : Math.min(W * 0.6, H * 0.85);
    baseDist = SYS / Math.tan(camera.fov * Math.PI / 360) * (H / 2) / rpx;
    if (!focus) goal.dist = baseDist;
    PIX = (H * DPR) / (2 * Math.tan(camera.fov * Math.PI / 360));
    beltMats.forEach(m => m.uniforms.uPix.value = PIX); streamMat.uniforms.uPix.value = PIX;
  }
  size(); rig.dist = reduce ? baseDist : baseDist * 1.9; rig.el = reduce ? EL0 : 1.15; rig.az = reduce ? 0.6 : -0.7;
  addEventListener('resize', size);

  // ================================================================== interaction
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let dragging = false, last = null, downAt = null, vAz = 0, vEl = 0, idle = 99, hover = null;
  const wp = new T.Vector3(), tmp = new T.Vector3();
  function pickAt(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    let best = null, bd = 1e9;
    PL.forEach(P => { P.body.getWorldPosition(wp); const rr = Math.max(P.r * (P.ring ? 2 : 1.7), rig.dist * 0.012); const hit = ray.ray.intersectSphere(new T.Sphere(wp.clone(), rr), new T.Vector3()); if (hit) { const d = hit.distanceTo(camera.position); if (d < bd) { bd = d; best = P; } } });
    if (!best) { sun.getWorldPosition(wp); if (ray.ray.intersectSphere(new T.Sphere(wp.clone(), SUN_R * 1.3), new T.Vector3())) return 'sun'; }
    return best;
  }
  cv.addEventListener('pointerdown', e => { dragging = true; last = [e.clientX, e.clientY]; downAt = [e.clientX, e.clientY]; vAz = vEl = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    hover = pickAt(e); cv.style.cursor = dragging ? 'grabbing' : (hover ? 'pointer' : 'grab');
    if (!dragging) return;
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    vAz = -dx * 0.0045; vEl = dy * 0.0035; goal.az += vAz; goal.el = Math.max(0.12, Math.min(1.3, goal.el + vEl)); idle = 0;
  });
  cv.addEventListener('pointerleave', () => { hover = null; });
  addEventListener('pointerup', e => {
    if (dragging && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) {
      const h = pickAt(e);
      if (h === 'sun') pulseT = U.uTime.value; else if (h) focusOn(h); else if (focus) unfocus();
    }
    dragging = false;
  });
  // labels are clickable too
  PL.forEach(P => P.el.addEventListener('click', () => focusOn(P)));
  addEventListener('keydown', e => {
    if (!focus) return;
    if (e.key === 'Escape') unfocus();
    if (e.key === 'ArrowRight') focusOn(PL[(PL.indexOf(focus) + 1) % PL.length]);
    if (e.key === 'ArrowLeft') focusOn(PL[(PL.indexOf(focus) - 1 + PL.length) % PL.length]);
  });
  function focusOn(P) {
    focus = P; idle = 0; goal.dist = Math.max(P.r * (P.ring ? 13 : 12), 2.4); goal.el = 0.38;
    renderPanel(P, 0); wrap.classList.add('sol-focus'); document.documentElement.classList.add('sol-open'); if (hero) hero.classList.add('sol-explore');
  }
  function unfocus() { focus = null; goal.dist = baseDist; goal.el = EL0; panel.classList.remove('on'); wrap.classList.remove('sol-focus'); document.documentElement.classList.remove('sol-open'); if (hero) hero.classList.remove('sol-explore'); }

  let mx = 0, my = 0, scrollK = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); if (focus && scrollK > .35) unfocus(); }, { passive: true });

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ================================================================== frame
  const clock = new T.Clock();
  let t = 0, running = false;
  function loop() { if (running) return; running = true; requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); }); }
  const bez = (a, b, c, k, o) => { const u = 1 - k; o.set(u * u * a.x + 2 * u * k * b.x + k * k * c.x, u * u * a.y + 2 * u * k * b.y + k * k * c.y, u * u * a.z + 2 * u * k * b.z + k * k * c.z); return o; };
  const ctl = new T.Vector3(), src = new T.Vector3(), dst = new T.Vector3(), o3 = new T.Vector3(), yAx = new T.Vector3(0, 1, 0);
  const proj = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, tmp.z]; };

  function layoutLabels(lab) {
    sun.getWorldPosition(wp); const sp = proj(wp);
    const items = [];
    PL.forEach(P => { P.body.getWorldPosition(wp); const [x, y, z] = proj(wp); items.push({ el: P.el, x, y, z, show: lab && !focus, core: P.kind === 'core', r: P.r, P }); });
    items.push({ el: sunEl, x: sp[0], y: sp[1], z: sp[2], show: lab && !focus, core: true, r: SUN_R, sun: true });
    items.sort((a, b) => (b.core - a.core) || (a.y - b.y));
    const placed = [];
    items.forEach(it => {
      const el = it.el, w = el._w || 90, h = (el._h || 20) + 6;
      const flip = !it.sun && it.x < sp[0] - 10;
      const vis = it.show && it.z < 1 && it.x > -20 && it.x < W + 20 && it.y > 20 && it.y < H - 10;
      let dy = 0, ok = false;
      for (let k = 0; k < 7 && vis; k++) {
        const top = it.y - 30 - dy - h, x0 = flip ? it.x - 12 - w : it.x + 6, x1 = flip ? it.x - 6 : it.x + 12 + w;
        if (!placed.some(p => x0 < p[2] && x1 > p[0] && top < p[3] && top + h > p[1])) { placed.push([x0, top, x1, top + h]); ok = true; break; }
        dy += 20;
      }
      el._dy += (dy - el._dy) * 0.25;
      el.style.transform = `translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,0)`;
      el.style.setProperty('--dy', el._dy.toFixed(1) + 'px');
      el.classList.toggle('on', vis && (ok || it.core));
      el.classList.toggle('flip', flip);
      if (it.P) el.classList.toggle('hi', hover === it.P);
    });
  }

  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt; idle += dt;
    U.uTime.value = t;
    if (!reduce && U.uIntro.value < 1) U.uIntro.value = Math.min(1, U.uIntro.value + dt * 0.33);
    const intro = U.uIntro.value, ease = 1 - Math.pow(1 - intro, 3);
    compMat.uniforms.uFade.value = Math.min(1, intro * 2.5);
    const spd = reduce ? 0 : (focus ? 0.15 : 1);
    sys.position.y = scrollK * 2.4;
    sys.updateMatrixWorld();
    sun.getWorldPosition(U.uSun.value);

    PL.forEach((P, i) => {
      P.ang += dt * spd * (Math.PI * 2 / P.period) * (1 + (1 - ease) * 2.5);
      const r = P.orbit * (0.55 + 0.45 * ease);
      P.body.position.set(Math.cos(P.ang) * r, 0, -Math.sin(P.ang) * r);
      P.mesh.rotation.y += dt * (0.1 + (i % 3) * 0.04) * (reduce ? 0 : 1);
      if (P.moonPivot) P.moonPivot.rotation.y += dt * 0.8 * spd;
      P.body.scale.setScalar(Math.max(0.001, ease));
      const hi = (hover === P || focus === P) ? 1 : 0; P.uni.uHi.value += (hi - P.uni.uHi.value) * 0.1;
      P.orbitMat.uniforms.uPA.value = P.ang; P.orbitMat.uniforms.uK.value = Math.min(1, intro * 1.3 - i * 0.05); P.orbitMat.uniforms.uHi.value = P.uni.uHi.value;
      if (P.ringMesh) { P.body.updateMatrixWorld(true); P.body.getWorldPosition(P.uni.uCtr.value); P.uni.uRingN.value.set(0, 0, 1).transformDirection(P.ringMesh.matrixWorld); }
    });
    scaleMat.uniforms.uK.value = tickMat.uniforms.uK.value = Math.min(1, Math.max(0, intro * 1.4 - .25));

    CORE.forEach((P, pi) => {
      dst.copy(P.body.position);
      const ang = Math.atan2(-dst.z, dst.x);
      src.set(Math.cos(ang - 0.25) * SUN_R * 1.05, 0, -Math.sin(ang - 0.25) * SUN_R * 1.05);
      ctl.copy(dst).multiplyScalar(0.5).applyAxisAngle(yAx, 0.3); ctl.y = 0.5 + pi * 0.3;
      for (let j = 0; j < SPP; j++) {
        const s = seeds[pi * SPP + j], k = (s[0] + t * 0.07 * s[2] * (reduce ? 0 : 1)) % 1;
        bez(src, ctl, dst, k, o3); o3.y += s[1] * 0.05 * Math.sin(k * Math.PI);
        const id = pi * SPP + j; sPos[id * 3] = o3.x; sPos[id * 3 + 1] = o3.y; sPos[id * 3 + 2] = o3.z;
        sA[id] = Math.sin(k * Math.PI) * (0.3 + P.uni.uHi.value * 0.9) * ease;
      }
    });
    streamGeo.attributes.position.needsUpdate = true; streamGeo.attributes.aF.needsUpdate = true;

    const pe = t - pulseT;
    if (!reduce && intro >= 1 && !focus && idle > 6 && (t % 12) < dt) pulseT = t;
    pulseMat.uniforms.uR.value = 1 + pe * 6.5; pulseMat.uniforms.uA.value = pe < 2.2 ? (1 - pe / 2.2) : 0;
    sunMat.uniforms.uPulse.value = pe < 0.9 ? (1 - pe / 0.9) * 0.5 : 0;
    PL.forEach(P => { const hitT = (P.orbit - 1) / 6.5; if (pe > hitT && pe < hitT + .6) P.uni.uHi.value = Math.max(P.uni.uHi.value, 1 - (pe - hitT) / .6); });

    // camera
    if (!dragging) {
      vAz *= 0.94; vEl *= 0.94; goal.az += vAz; goal.el = Math.max(0.12, Math.min(1.3, goal.el + vEl));
      if (idle > 4 && !reduce && !focus) { goal.az += dt * 0.016; goal.el += (EL0 - goal.el) * 0.008; }
    }
    if (focus) {
      focus.body.getWorldPosition(wp); goal.tx.copy(wp);
      let a = Math.atan2(-Math.cos(focus.ang), Math.sin(focus.ang)) + 1.25;
      while (a - goal.az > Math.PI) a -= Math.PI * 2; while (a - goal.az < -Math.PI) a += Math.PI * 2;
      goal.az += (a - goal.az) * 0.09;
    } else goal.tx.set(0, sys.position.y, 0);
    const kk = intro < 1 ? 0.03 : (focus ? 0.08 : 0.055);
    rig.az += (goal.az - rig.az) * kk;
    rig.el += ((goal.el + (focus ? 0 : my * 0.06)) - rig.el) * kk;
    rig.dist += (goal.dist * (1 + scrollK * 0.2) - rig.dist) * (intro < 1 ? 0.028 : 0.07);
    rig.tx.lerp(goal.tx, focus ? 0.12 : 0.08);
    const az = rig.az + (focus ? 0 : mx * 0.08);
    camera.position.set(rig.tx.x + Math.sin(az) * Math.cos(rig.el) * rig.dist, rig.tx.y + Math.sin(rig.el) * rig.dist, rig.tx.z + Math.cos(az) * Math.cos(rig.el) * rig.dist);
    camera.lookAt(rig.tx);
    const voT = wide ? (focus ? 0.07 : -0.24) : 0;
    voX += (voT - voX) * 0.08;
    if (wide || Math.abs(voX) > 0.001) camera.setViewOffset(W, H, voX * W, -H * 0.02, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    corona.quaternion.copy(camera.quaternion);

    renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(scene, camera);
    brightMat.uniforms.tDiffuse.value = rtScene.texture; pass(brightMat, rtA);
    blurMat.uniforms.tDiffuse.value = rtA.texture; blurMat.uniforms.uDir.value.set(1 / rtA.width, 0); pass(blurMat, rtB);
    blurMat.uniforms.tDiffuse.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, 1 / rtA.height); pass(blurMat, rtA);
    blurMat.uniforms.tDiffuse.value = rtA.texture; blurMat.uniforms.uDir.value.set(2 / rtA.width, 0); pass(blurMat, rtC);
    blurMat.uniforms.tDiffuse.value = rtC.texture; blurMat.uniforms.uDir.value.set(0, 2 / rtC.height); pass(blurMat, rtD);
    blurMat.uniforms.tDiffuse.value = rtD.texture; blurMat.uniforms.uDir.value.set(2.5 / rtC.width, 0); pass(blurMat, rtC);
    blurMat.uniforms.tDiffuse.value = rtC.texture; blurMat.uniforms.uDir.value.set(0, 2.5 / rtC.height); pass(blurMat, rtD);
    compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tB1.value = rtA.texture; compMat.uniforms.tB2.value = rtD.texture;
    pass(compMat, null);

    layoutLabels(intro > 0.8);
  }
  new MutationObserver(writeText).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  writeText();
  loop();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
