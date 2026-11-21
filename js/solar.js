/* Vero — hero orrery (WebGL, three r149).
   Sun = your business; planets = the three core services (Websites · CRMs · Apps); faint outer satellites = add-ons.
   HDR scene → custom bloom (2 mips) → filmic grade, vignette, grain. Ringed gas giant with mutual ring/planet shadows,
   dust disc, light streams from the sun to each planet, hairline orbits and a measured scale ring.
   Drag to orbit · hover to highlight · click a planet to fly in · click the sun to pulse. Falls back to the 2D globe. */
(function () {
  if (!window.VERO_GL) return;
  const wrap = document.querySelector('.globe-wrap');
  if (!wrap) return;
  if (!window.THREE) { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const old = document.getElementById('globe');

  const T = THREE;
  const cv = document.createElement('canvas');
  cv.id = 'globe-gl';
  cv.setAttribute('aria-label', 'Interactive orrery: your business at the centre, with websites, CRMs and apps in orbit');

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
  const tx = o => o[lang()] || o.en;

  const scene = new T.Scene();
  scene.background = new T.Color(0.032, 0.03, 0.03);
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 500);
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
        float big=fbm(p*2.4+q*1.2+t*.6);
        float gran=1.-abs(snoise(p*22.+vec3(t*3.)));gran=pow(gran,3.);
        float h=clamp(.55+big*.55+gran*.22,0.,1.);
        float mu=max(dot(vN,vV),0.);float limb=pow(mu,.55);
        vec3 c=mix(vec3(1.,.36,.09),vec3(1.,.72,.42),h);c=mix(c,vec3(1.,.88,.7),pow(h,5.));
        c*=(.3+.9*limb);c*=1.9+uPulse*2.;
        gl_FragColor=vec4(c,1.);}`
  });
  const sun = new T.Mesh(new T.SphereGeometry(SUN_R, 96, 96), sunMat);
  sys.add(sun);
  const coronaMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPulse: sunMat.uniforms.uPulse },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uPulse;varying vec2 vUv;
      void main(){vec2 p=vUv*2.-1.;float d=length(p)*6.;if(d<.98)discard;float a=atan(p.y,p.x);
        float s=snoise(vec3(cos(a)*1.4,sin(a)*1.4,uTime*.05))*.5+.5;
        float fall=exp(-(d-1.)*(2.6-s*1.1));float halo=exp(-(d-1.)*.55)*.12;
        vec3 c=vec3(1.,.52,.22)*(fall*.9+halo)*(1.+uPulse);gl_FragColor=vec4(c,1.);}`
  });
  const corona = new T.Mesh(new T.PlaneGeometry(12, 12), coronaMat);
  sys.add(corona);

  // ================================================================== planets
  const planetVS = `varying vec3 vObj;varying vec3 vN;varying vec3 vW;void main(){vObj=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const planetFS = NOISE + `uniform float uTime;uniform float uType;uniform float uSeed;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAtm;uniform vec3 uSun;
    uniform float uRing;uniform vec3 uRingN;uniform vec3 uCtr;uniform float uRin;uniform float uRout;
    varying vec3 vObj;varying vec3 vN;varying vec3 vW;
    void main(){vec3 p=normalize(vObj);vec3 N=normalize(vN);vec3 L=normalize(uSun-vW);vec3 V=normalize(cameraPosition-vW);
      float nl=dot(N,L);float day=smoothstep(-.06,.28,nl);vec3 col;float lights=0.;float spec=0.;
      if(uType<.5){
        float n=fbm(p*1.9+uSeed);float land=smoothstep(.04,.12,n);
        vec3 ocean=mix(uA*.45,uA,smoothstep(-.5,.05,n));vec3 ground=mix(uB,uC,smoothstep(.12,.5,n+fbm(p*6.)*.15));
        col=mix(ocean,ground,land);col=mix(col,vec3(.92,.95,.97),smoothstep(.78,.9,abs(p.y)+n*.1));
        float cl=smoothstep(.05,.55,fbm(p*3.1+vec3(uTime*.01,0.,uSeed)))*.85;col=mix(col,vec3(.96),cl);
        spec=pow(max(dot(reflect(-L,N),V),0.),60.)*(1.-land)*(1.-cl)*.8;
        lights=land*(1.-cl)*smoothstep(.62,.95,snoise(p*46.+uSeed)*.5+.5);
      }else if(uType<1.5){
        float w=fbm(p*vec3(1.2,3.6,1.2)+uSeed+vec3(uTime*.006,0.,0.));
        float lat=p.y+w*.12;float b=sin(lat*16.)*.5+.5;float b2=sin(lat*43.+w*4.)*.5+.5;float b3=sin(lat*7.+1.)*.5+.5;
        col=mix(uA,uB,b);col=mix(col,uC,b2*.28);col*=.82+b3*.3;
        vec3 sp=normalize(vec3(.55,-.3,.78));float st=smoothstep(.2,.0,distance(p,sp)+snoise(p*8.+uTime*.03)*.035);col=mix(col,uC*.9,st*.85);
      }else{
        float n=fbm(p*2.3+uSeed);float cr=1.-smoothstep(0.,.035,abs(snoise(p*6.+uSeed)));
        col=mix(uA,uB,smoothstep(-.35,.45,n));col=mix(col,uC,cr*.5);col=mix(col,vec3(.93,.95,1.),smoothstep(.7,.92,abs(p.y)));
        spec=pow(max(dot(reflect(-L,N),V),0.),22.)*.18;
      }
      float sh=1.;
      if(uRing>.5){float dn=dot(L,uRingN);if(abs(dn)>.001){float tt=dot(uCtr-vW,uRingN)/dn;if(tt>0.){vec3 hp=vW+L*tt;float rr=(length(hp-uCtr)-uRin)/(uRout-uRin);
        if(rr>0.&&rr<1.){float band=snoise(vec3(rr*38.,0.,1.))*.5+.5;sh=1.-(.35+band*.45)*smoothstep(0.,.06,rr)*smoothstep(1.,.85,rr);}}}}
      float amb=.05+pow(max(dot(N,V),0.),2.)*.06;vec3 lit=col*(day*sh)*1.25+col*amb;
      lit+=spec*day;
      lit+=vec3(1.,.6,.28)*lights*(1.-day)*1.2;
      float fr=pow(1.-max(dot(N,V),0.),4.);float sc=smoothstep(-.25,.6,nl);
      lit+=uAtm*fr*sc*1.1;
      gl_FragColor=vec4(lit,1.);}`;
  const atmFS = `uniform vec3 uAtm;uniform vec3 uSun;uniform float uHi;varying vec3 vN;varying vec3 vW;
    void main(){vec3 V=normalize(cameraPosition-vW);vec3 L=normalize(uSun-vW);float rim=1.-abs(dot(vN,V));float i=pow(rim,6.)*1.6;float d=smoothstep(-.3,.7,dot(vN,L));
      gl_FragColor=vec4(uAtm*i*d*(1.+uHi*.6),1.);}`;
  const atmVS = `varying vec3 vN;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;

  const C3 = h => new T.Color(h);
  const PLANETS = [
    { key: 'web', r: 0.5, orbit: 3.4, period: 34, phase: 1.15, tilt: 0.38, type: 0, seed: 3.1, A: '#1d4f8f', B: '#5b7d4a', C: '#cdb98a', atm: '#4f9dff', href: 'services.html#web',
      n: { en: 'Websites', pt: 'Sites', da: 'Hjemmesider' }, s: { en: 'Your best salesperson, online 24/7', pt: 'O seu melhor vendedor, online 24/7', da: 'Din bedste sælger, online 24/7' },
      d: { en: 'Fast, beautiful sites and online stores that turn visitors into bookings and sales.', pt: 'Sites e lojas online rápidos e bonitos que transformam visitas em reservas e vendas.', da: 'Hurtige, smukke hjemmesider og webshops, der gør besøgende til bookinger og salg.' } },
    { key: 'crm', r: 0.9, orbit: 5.6, period: 52, phase: 3.5, tilt: 0.16, type: 1, seed: 7.7, A: '#c8783f', B: '#ecd2ad', C: '#7a3a1c', atm: '#ffb27a', ring: true, href: '#crm',
      n: { en: 'CRMs', pt: 'CRMs', da: 'CRM-systemer' }, s: { en: 'Every lead, client and job in one place', pt: 'Cada lead, cliente e trabalho num só sítio', da: 'Alle leads, kunder og opgaver ét sted' },
      d: { en: 'Custom CRMs built around your process — pipelines, bookings, automations and AI, for any niche.', pt: 'CRMs à medida do seu processo — pipelines, marcações, automações e AI, para qualquer nicho.', da: 'Skræddersyede CRM-systemer bygget om din proces — pipelines, booking, automatisering og AI, til enhver branche.' } },
    { key: 'app', r: 0.6, orbit: 7.7, period: 76, phase: 5.55, tilt: 0.1, type: 2, seed: 12.4, A: '#8d8fb8', B: '#d6dcf0', C: '#4b4a78', atm: '#b4b8ff', moon: true, href: 'contact.html',
      n: { en: 'Apps', pt: 'Apps', da: 'Apps' }, s: { en: 'Your business in your clients’ pocket', pt: 'O seu negócio no bolso dos clientes', da: 'Din virksomhed i kundernes lomme' },
      d: { en: 'Web and mobile apps, client portals and internal tools your team and customers actually use.', pt: 'Apps web e mobile, portais de cliente e ferramentas internas que a equipa e os clientes usam.', da: 'Web- og mobilapps, kundeportaler og interne værktøjer, som dit team og dine kunder faktisk bruger.' } }
  ];
  const RING_IN = 1.32, RING_OUT = 2.25;
  PLANETS.forEach(P => {
    P.uni = { uTime: U.uTime, uSun: U.uSun, uType: { value: P.type }, uSeed: { value: P.seed }, uA: { value: C3(P.A) }, uB: { value: C3(P.B) }, uC: { value: C3(P.C) }, uAtm: { value: C3(P.atm) },
      uRing: { value: P.ring ? 1 : 0 }, uRingN: { value: new T.Vector3(0, 1, 0) }, uCtr: { value: new T.Vector3() }, uRin: { value: P.r * RING_IN }, uRout: { value: P.r * RING_OUT }, uHi: { value: 0 } };
    P.body = new T.Group(); sys.add(P.body);
    P.tiltG = new T.Group(); P.tiltG.rotation.z = P.tilt; P.body.add(P.tiltG);
    P.mesh = new T.Mesh(new T.SphereGeometry(P.r, 96, 96), new T.ShaderMaterial({ uniforms: P.uni, vertexShader: planetVS, fragmentShader: planetFS }));
    P.tiltG.add(P.mesh);
    P.tiltG.add(new T.Mesh(new T.SphereGeometry(P.r * 1.035, 64, 64), new T.ShaderMaterial({ uniforms: { uAtm: P.uni.uAtm, uSun: U.uSun, uHi: P.uni.uHi }, vertexShader: atmVS, fragmentShader: atmFS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.FrontSide })));
    if (P.ring) {
      P.ringMat = new T.ShaderMaterial({
        uniforms: { uIn: { value: P.r * RING_IN }, uOut: { value: P.r * RING_OUT }, uSun: U.uSun, uCtr: P.uni.uCtr, uPR: { value: P.r } },
        transparent: true, depthWrite: false, side: T.DoubleSide,
        vertexShader: `varying vec3 vL;varying vec3 vW;void main(){vL=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
        fragmentShader: NOISE + `uniform float uIn;uniform float uOut;uniform vec3 uSun;uniform vec3 uCtr;uniform float uPR;varying vec3 vL;varying vec3 vW;
          void main(){float r=(length(vL.xy)-uIn)/(uOut-uIn);
            float b=snoise(vec3(r*30.,0.,1.))*.5+.5;float b2=snoise(vec3(r*140.,3.,2.))*.5+.5;float b3=snoise(vec3(r*9.,7.,2.))*.5+.5;
            float a=smoothstep(0.,.05,r)*smoothstep(1.,.9,r)*(.18+b*.42+b2*.22)*(.6+b3*.6);
            a*=1.-smoothstep(.55,.58,r)*smoothstep(.66,.63,r)*.9;
            vec3 L=normalize(uSun-vW);vec3 toC=uCtr-vW;float tt=dot(toC,L);float sh=1.;
            if(tt>0.){float d=length(toC-L*tt);sh=smoothstep(uPR*.92,uPR*1.04,d);}
            vec3 c=mix(vec3(.86,.7,.52),vec3(.62,.44,.3),b)*1.3;c*=.2+.8*sh;
            gl_FragColor=vec4(c,a*.9);}`
      });
      P.ringMesh = new T.Mesh(new T.RingGeometry(P.r * RING_IN, P.r * RING_OUT, 220, 1), P.ringMat);
      P.ringMesh.rotation.x = -Math.PI / 2 + 0.42; P.ringMesh.rotation.y = 0.12;
      P.body.add(P.ringMesh);
    }
    if (P.moon) {
      P.moonPivot = new T.Group(); P.body.add(P.moonPivot);
      const mu = { uTime: U.uTime, uSun: U.uSun, uType: { value: 2 }, uSeed: { value: 30 }, uA: { value: C3('#6d6a66') }, uB: { value: C3('#b9b4ab') }, uC: { value: C3('#3b3936') }, uAtm: { value: C3('#000') }, uRing: { value: 0 }, uRingN: { value: new T.Vector3() }, uCtr: { value: new T.Vector3() }, uRin: { value: 0 }, uRout: { value: 0 } };
      const mm = new T.Mesh(new T.SphereGeometry(0.11, 48, 48), new T.ShaderMaterial({ uniforms: mu, vertexShader: planetVS, fragmentShader: planetFS }));
      mm.position.set(P.r * 2.3, 0.1, 0); P.moonPivot.add(mm); P.moonPivot.rotation.z = 0.25;
    }
    P.ang = P.phase;
  });

  // ================================================================== hairline orbits + trails
  const lineMat = (base) => new T.ShaderMaterial({
    uniforms: { uPA: { value: 0 }, uK: { value: 0 }, uHi: { value: 0 }, uBase: { value: base } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uPA;uniform float uK;uniform float uHi;uniform float uBase;varying float vA;
      void main(){float d=mod(uPA-vA,6.28318)/6.28318;float shown=step(vA/6.28318,uK);float trail=pow(1.-d,14.)*.75;
        float a=(uBase+uHi*.12+trail)*shown;gl_FragColor=vec4(mix(vec3(.9,.88,.84),vec3(1.,.62,.36),clamp(trail*1.6,0.,1.))*a,1.);}`
  });
  function circle(r, n) { const pos = new Float32Array((n + 1) * 3), aa = new Float32Array(n + 1); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 2] = -Math.sin(a) * r; aa[i] = a; } const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aA', new T.BufferAttribute(aa, 1)); return g; }
  PLANETS.forEach(P => { P.orbitMat = lineMat(0.075); sys.add(new T.Line(circle(P.orbit, 512), P.orbitMat)); });

  const SCALE_R = 10.4;
  const scaleMat = lineMat(0.06); scaleMat.uniforms.uPA.value = -99;
  sys.add(new T.Line(circle(SCALE_R, 720), scaleMat));
  const tickMat = lineMat(0.13); tickMat.uniforms.uPA.value = -99;
  {
    const pos = [], aa = [];
    for (let i = 0; i < 360; i += 2) {
      const a = i / 180 * Math.PI, len = i % 30 === 0 ? 0.42 : i % 10 === 0 ? 0.22 : 0.1;
      const c = Math.cos(a), s = -Math.sin(a);
      pos.push(c * SCALE_R, 0, s * SCALE_R, c * (SCALE_R + len), 0, s * (SCALE_R + len)); aa.push(a, a);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('aA', new T.BufferAttribute(new Float32Array(aa), 1));
    sys.add(new T.LineSegments(g, tickMat));
  }

  // ================================================================== dust disc + belt particles
  const discMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uIntro: U.uIntro },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uIntro;varying vec2 vP;
      void main(){float r=length(vP);float a=atan(vP.y,vP.x);
        float bands=snoise(vec3(r*2.2,0.,3.))*.5+.5;float fine=snoise(vec3(r*11.,a*.3,uTime*.01))*.5+.5;
        float swirl=fbm(vec3(cos(a+r*.35-uTime*.02)*r*.5,sin(a+r*.35-uTime*.02)*r*.5,1.))*.5+.5;
        float env=smoothstep(1.4,2.6,r)*smoothstep(11.,7.,r);float belt=exp(-pow((r-9.)*1.1,2.))*1.6;
        float i=(env*.35+belt)*(bands*.6+.4)*(fine*.5+.5)*swirl/(.6+r*.12);
        vec3 c=mix(vec3(1.,.55,.28),vec3(.75,.7,.68),smoothstep(2.,9.,r));
        gl_FragColor=vec4(c*i*.11*uIntro,1.);}`
  });
  const disc = new T.Mesh(new T.PlaneGeometry(26, 26), discMat);
  disc.rotation.x = -Math.PI / 2; sys.add(disc);

  const pointVS = `attribute float aR;attribute float aA;attribute float aS;attribute float aY;attribute float aSz;attribute float aC;
    uniform float uTime;uniform float uPix;uniform float uIntro;varying float vC;varying float vF;
    void main(){float a=aA+uTime*aS;float r=aR*(1.+(1.-uIntro)*.6);vec3 p=vec3(cos(a)*r,aY,-sin(a)*r);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float s=aSz*uPix/-mv.z;gl_PointSize=max(1.,s);vC=aC;vF=uIntro*clamp(s,0.,1.);}`;
  const beltFS = `varying float vC;varying float vF;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,0.,d);
    vec3 col=mix(vec3(.78,.74,.7),vec3(1.,.6,.35),vC);gl_FragColor=vec4(col*a*.55*vF,1.);}`;
  function belt(count, rIn, rOut, thick, speed, sz, warm) {
    const g = new T.BufferGeometry(), A = { aR: [], aA: [], aS: [], aY: [], aSz: [], aC: [] };
    for (let i = 0; i < count; i++) {
      const u = Math.random(), r = rIn + (rOut - rIn) * (0.5 + 0.5 * Math.sign(u - .5) * Math.pow(Math.abs(u - .5) * 2, 1.6));
      A.aR.push(r); A.aA.push(Math.random() * Math.PI * 2); A.aS.push(speed / Math.pow(r, 1.5));
      A.aY.push((Math.random() - .5) * thick); A.aSz.push(sz * (0.4 + Math.pow(Math.random(), 4) * 1.8)); A.aC.push(Math.random() < warm ? 1 : 0);
    }
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
    Object.keys(A).forEach(k => g.setAttribute(k, new T.BufferAttribute(new Float32Array(A[k]), 1)));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 40);
    const m = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uPix: { value: 600 }, uIntro: U.uIntro }, vertexShader: pointVS, fragmentShader: beltFS, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    sys.add(new T.Points(g, m)); return m;
  }
  const beltMats = [belt(small ? 5000 : 14000, 8.3, 9.7, .16, 2.2, .022, .06), belt(small ? 900 : 2200, 1.8, 2.4, .05, 1.4, .016, .5)];

  // ================================================================== light streams sun → planets
  const SPP = small ? 26 : 46;
  const streamGeo = new T.BufferGeometry();
  const sPos = new Float32Array(PLANETS.length * SPP * 3), sA = new Float32Array(PLANETS.length * SPP);
  streamGeo.setAttribute('position', new T.BufferAttribute(sPos, 3)); streamGeo.setAttribute('aF', new T.BufferAttribute(sA, 1));
  streamGeo.boundingSphere = new T.Sphere(new T.Vector3(), 40);
  const streamMat = new T.ShaderMaterial({ uniforms: { uPix: { value: 600 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float aF;uniform float uPix;varying float vF;void main(){vF=aF;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(1.,.035*uPix/-mv.z);}`,
    fragmentShader: `varying float vF;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(1.,.7,.45)*smoothstep(.5,0.,d)*vF*1.6,1.);}` });
  sys.add(new T.Points(streamGeo, streamMat));
  const seeds = Array.from({ length: PLANETS.length * SPP }, () => [Math.random(), (Math.random() - .5) * 2, 0.25 + Math.random() * 0.35]);

  // ================================================================== add-on satellites
  const ADDONS = [
    { en: 'AI receptionist', pt: 'Rececionista AI', da: 'AI-receptionist' }, { en: 'Ads', pt: 'Anúncios', da: 'Annoncer' }, { en: 'SEO', pt: 'SEO', da: 'SEO' },
    { en: 'Branding', pt: 'Branding', da: 'Branding' }, { en: 'Email & SMS', pt: 'Email e SMS', da: 'E-mail & SMS' }, { en: 'Reviews', pt: 'Avaliações', da: 'Anmeldelser' }
  ];
  const ADD_R = 9.0;
  const satGeo = new T.BufferGeometry(); satGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(ADDONS.length * 3), 3)); satGeo.boundingSphere = new T.Sphere(new T.Vector3(), 40);
  const satMat = new T.ShaderMaterial({ uniforms: { uPix: { value: 600 }, uIntro: U.uIntro }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `uniform float uPix;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(2.,.09*uPix/-mv.z);}`,
    fragmentShader: `uniform float uIntro;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float c=smoothstep(.5,.0,d);gl_FragColor=vec4(vec3(1.,.85,.75)*(pow(c,3.)*2.2+c*.3)*uIntro,1.);}` });
  sys.add(new T.Points(satGeo, satMat));
  ADDONS.forEach((a, i) => { a.ang = i / ADDONS.length * Math.PI * 2 + 0.5; a.y = (i % 2 ? 1 : -1) * 0.18; a.pos = new T.Vector3(); });

  // ================================================================== stars (with a faint band)
  {
    const N = small ? 2200 : 5200, pos = new Float32Array(N * 3), sz = new Float32Array(N), ph = new Float32Array(N), col = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let u = Math.random() * 2 - 1; if (Math.random() < .45) u *= .18;
      const th = Math.random() * Math.PI * 2, r = 140 + Math.random() * 60, s = Math.sqrt(1 - u * u);
      const x = r * s * Math.cos(th), y = r * u, z = r * s * Math.sin(th);
      pos[i * 3] = x; pos[i * 3 + 1] = y * .9 + x * .35; pos[i * 3 + 2] = z;
      sz[i] = .6 + Math.pow(Math.random(), 7) * 3; ph[i] = Math.random() * 6.28; col[i] = Math.random();
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aS', new T.BufferAttribute(sz, 1)); g.setAttribute('aP', new T.BufferAttribute(ph, 1)); g.setAttribute('aC', new T.BufferAttribute(col, 1));
    const m = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uDPR: { value: DPR } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: `attribute float aS;attribute float aP;attribute float aC;uniform float uTime;uniform float uDPR;varying float vT;varying float vC;void main(){vC=aC;vT=.6+.4*sin(uTime*(.6+aP*.25)+aP);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aS*uDPR;}`,
      fragmentShader: `varying float vT;varying float vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(vec3(.75,.82,1.),vec3(1.,.85,.7),vC);gl_FragColor=vec4(c*smoothstep(.5,0.,d)*vT*.55,1.);}` });
    scene.add(new T.Points(g, m));
  }

  // pulse (click the sun)
  const pulseMat = new T.ShaderMaterial({ uniforms: { uR: { value: 0 }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uR;uniform float uA;varying vec2 vP;void main(){float d=length(vP);float a=exp(-pow((d-uR)*6.,2.))*uA;gl_FragColor=vec4(vec3(1.,.62,.36)*a*.8,1.);}` });
  const pulse = new T.Mesh(new T.PlaneGeometry(24, 24), pulseMat); pulse.rotation.x = -Math.PI / 2; sys.add(pulse);
  let pulseT = -10;

  // ================================================================== post: bloom + grade
  const rtOpt = { type: GL2 ? T.HalfFloatType : T.UnsignedByteType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
  const rtScene = new T.WebGLRenderTarget(2, 2, Object.assign({}, rtOpt, { depthBuffer: true, samples: GL2 ? 4 : 0 }));
  const rtA = new T.WebGLRenderTarget(2, 2, rtOpt), rtB = new T.WebGLRenderTarget(2, 2, rtOpt), rtC = new T.WebGLRenderTarget(2, 2, rtOpt), rtD = new T.WebGLRenderTarget(2, 2, rtOpt);
  const fsCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsScene = new T.Scene();
  const fsQuad = new T.Mesh(new T.PlaneGeometry(2, 2)); fsQuad.frustumCulled = false; fsScene.add(fsQuad);
  const fsVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
  const brightMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uThr: { value: GL2 ? 0.9 : 0.6 } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uThr;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(uThr,uThr+.8,l);gl_FragColor=vec4(c*k,1.);}` });
  const blurMat = new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.227;
      c+=texture2D(tDiffuse,vUv+uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv-uDir*1.385).rgb*.316;c+=texture2D(tDiffuse,vUv+uDir*3.231).rgb*.07;c+=texture2D(tDiffuse,vUv-uDir*3.231).rgb*.07;gl_FragColor=vec4(c,1.);}` });
  const compMat = new T.ShaderMaterial({ uniforms: { tScene: { value: null }, tB1: { value: null }, tB2: { value: null }, uTime: U.uTime, uRes: { value: new T.Vector2(1, 1) }, uFade: { value: 0 } }, vertexShader: fsVS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tScene;uniform sampler2D tB1;uniform sampler2D tB2;uniform float uTime;uniform vec2 uRes;uniform float uFade;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec2 d=(vUv-.5);float r2=dot(d,d);vec2 off=d*r2*.006;
        vec3 c=vec3(texture2D(tScene,vUv+off).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv-off).b);
        c+=texture2D(tB1,vUv).rgb*.55+texture2D(tB2,vUv).rgb*.9;
        c=vec3(1.)-exp(-c*1.35);
        c=pow(c,vec3(.96,1.,1.04));
        c*=1.-smoothstep(.18,.75,r2*1.4)*.55;
        c+=(h(vUv*uRes+fract(uTime))-.5)*.018;
        c*=uFade;
        gl_FragColor=vec4(c,1.);}` });
  function pass(mat, target) { fsQuad.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }

  // ================================================================== HTML labels + card
  const mk = (cls, html) => { const d = document.createElement('div'); d.className = 'sol-label ' + cls; d.innerHTML = html; wrap.appendChild(d); return d; };
  PLANETS.forEach((P, i) => { P.el = mk('pl', `<i></i><div><em>0${i + 1}</em><b></b><small></small></div>`); });
  ADDONS.forEach(a => { a.el = mk('ad', '<b></b>'); });
  const sunEl = mk('sun', '<i></i><div><em>00</em><b></b></div>');
  const card = document.createElement('div'); card.className = 'sol-card'; card.setAttribute('aria-live', 'polite'); wrap.appendChild(card);
  const UI = { sun: { en: 'Your business', pt: 'O seu negócio', da: 'Din virksomhed' }, more: { en: 'Explore', pt: 'Explorar', da: 'Udforsk' }, back: { en: 'Back to the system', pt: 'Voltar ao sistema', da: 'Tilbage til systemet' }, core: { en: 'Core service', pt: 'Serviço principal', da: 'Kerneydelse' } };
  function writeText() {
    PLANETS.forEach(P => { P.el.querySelector('b').textContent = tx(P.n); P.el.querySelector('small').textContent = tx(P.s); });
    ADDONS.forEach(a => { a.el.querySelector('b').textContent = tx(a); });
    sunEl.querySelector('b').textContent = tx(UI.sun);
    if (focus) openCard(focus);
  }
  function openCard(P) {
    const i = PLANETS.indexOf(P);
    card.innerHTML = `<small>0${i + 1} · ${tx(UI.core)}</small><h4>${tx(P.n)}</h4><p>${tx(P.d)}</p><div><a class="btn p" href="${P.href}">${tx(UI.more)} →</a><button type="button" class="sol-back">${tx(UI.back)}</button></div>`;
    card.classList.add('on');
    card.querySelector('.sol-back').addEventListener('click', unfocus);
    card.querySelector('a').addEventListener('click', () => { if (P.href.startsWith('#')) unfocus(); });
  }
  new MutationObserver(writeText).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // ================================================================== camera rig + sizing
  let W = 1, H = 1, wide = true, baseDist = 30, PIX = 600;
  const EL0 = 0.3;
  const rig = { az: 0.35, el: EL0, dist: 30, tx: new T.Vector3() };
  const goal = { az: 0.35, el: EL0, dist: 30, tx: new T.Vector3() };
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height)); wide = W > 1000;
    renderer.setSize(W, H, false);
    const w = Math.round(W * DPR), h = Math.round(H * DPR);
    rtScene.setSize(w, h); rtA.setSize(w >> 1, h >> 1); rtB.setSize(w >> 1, h >> 1); rtC.setSize(w >> 2, h >> 2); rtD.setSize(w >> 2, h >> 2);
    compMat.uniforms.uRes.value.set(w, h);
    camera.aspect = W / H;
    const SYS = 10.6;
    const rpx = wide ? Math.min(W * 0.34, H * 0.95) : Math.min(W * 0.62, H * 0.8);
    baseDist = SYS / Math.tan(camera.fov * Math.PI / 360) * (H / 2) / rpx;
    if (!focus) goal.dist = baseDist;
    if (wide) camera.setViewOffset(W, H, -W * 0.24, -H * 0.02, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    PIX = (H * DPR) / (2 * Math.tan(camera.fov * Math.PI / 360));
    beltMats.forEach(m => m.uniforms.uPix.value = PIX); streamMat.uniforms.uPix.value = PIX; satMat.uniforms.uPix.value = PIX;
  }
  size(); rig.dist = reduce ? baseDist : baseDist * 1.9; rig.el = reduce ? EL0 : 1.1; rig.az = reduce ? 0.35 : -0.9;
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
    PLANETS.forEach(P => { P.body.getWorldPosition(wp); const hit = ray.ray.intersectSphere(new T.Sphere(wp.clone(), P.r * (P.ring ? 2 : 1.8)), new T.Vector3()); if (hit) { const d = hit.distanceTo(camera.position); if (d < bd) { bd = d; best = P; } } });
    if (!best) { sun.getWorldPosition(wp); if (ray.ray.intersectSphere(new T.Sphere(wp.clone(), SUN_R * 1.3), new T.Vector3())) return 'sun'; }
    return best;
  }
  cv.addEventListener('pointerdown', e => { dragging = true; last = [e.clientX, e.clientY]; downAt = [e.clientX, e.clientY]; vAz = vEl = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    hover = pickAt(e);
    cv.style.cursor = dragging ? 'grabbing' : (hover ? 'pointer' : 'grab');
    if (!dragging) return;
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    vAz = -dx * 0.0045; vEl = dy * 0.0035; goal.az += vAz; goal.el = Math.max(0.06, Math.min(1.3, goal.el + vEl)); idle = 0;
  });
  cv.addEventListener('pointerleave', () => { hover = null; });
  addEventListener('pointerup', e => {
    if (dragging && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) {
      const h = pickAt(e);
      if (h === 'sun') pulseT = U.uTime.value; else if (h) focusOn(h); else if (focus) unfocus();
    }
    dragging = false;
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && focus) unfocus(); });
  function focusOn(P) { focus = P; idle = 0; goal.dist = Math.max(P.r * (P.ring ? 12 : 11), baseDist * 0.22); goal.el = 0.42; openCard(P); wrap.classList.add('sol-focus'); }
  function unfocus() { focus = null; goal.dist = baseDist; goal.el = EL0; card.classList.remove('on'); wrap.classList.remove('sol-focus'); }

  let mx = 0, my = 0, scrollK = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const hero = document.getElementById('hero');
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); }, { passive: true });

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ================================================================== frame
  const clock = new T.Clock();
  let t = 0, running = false;
  function loop() { if (running) return; running = true; requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); }); }
  function place(el, v, show) {
    tmp.copy(v).project(camera);
    const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    el.classList.toggle('on', show && tmp.z < 1 && x > -40 && x < W + 40);
    el.classList.toggle('flip', x > W - 230);
  }
  const bez = (a, b, c, k, o) => { const u = 1 - k; o.set(u * u * a.x + 2 * u * k * b.x + k * k * c.x, u * u * a.y + 2 * u * k * b.y + k * k * c.y, u * u * a.z + 2 * u * k * b.z + k * k * c.z); return o; };
  const ctl = new T.Vector3(), src = new T.Vector3(), dst = new T.Vector3(), o3 = new T.Vector3(), yAx = new T.Vector3(0, 1, 0);

  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt; idle += dt;
    U.uTime.value = t;
    if (!reduce && U.uIntro.value < 1) U.uIntro.value = Math.min(1, U.uIntro.value + dt * 0.33);
    const intro = U.uIntro.value, ease = 1 - Math.pow(1 - intro, 3);
    compMat.uniforms.uFade.value = Math.min(1, intro * 2.5);
    const spd = reduce ? 0 : (focus ? 0.2 : 1);
    sys.position.y = scrollK * 2.2;
    sys.updateMatrixWorld();
    sun.getWorldPosition(U.uSun.value);

    PLANETS.forEach((P, i) => {
      P.ang += dt * spd * (Math.PI * 2 / P.period) * (1 + (1 - ease) * 2.5);
      const r = P.orbit * (0.55 + 0.45 * ease);
      P.body.position.set(Math.cos(P.ang) * r, 0, -Math.sin(P.ang) * r);
      P.mesh.rotation.y += dt * (0.12 + i * 0.03) * (reduce ? 0 : 1);
      if (P.moonPivot) P.moonPivot.rotation.y += dt * 0.7 * spd;
      P.body.scale.setScalar(Math.max(0.001, ease));
      const hi = (hover === P || focus === P) ? 1 : 0; P.uni.uHi.value += (hi - P.uni.uHi.value) * 0.1;
      P.orbitMat.uniforms.uPA.value = P.ang; P.orbitMat.uniforms.uK.value = Math.min(1, intro * 1.3 - i * 0.1); P.orbitMat.uniforms.uHi.value = P.uni.uHi.value;
      if (P.ringMesh) { P.body.updateMatrixWorld(true); P.body.getWorldPosition(P.uni.uCtr.value); P.uni.uRingN.value.set(0, 0, 1).transformDirection(P.ringMesh.matrixWorld); }
    });
    scaleMat.uniforms.uK.value = Math.min(1, Math.max(0, intro * 1.4 - .25)); tickMat.uniforms.uK.value = scaleMat.uniforms.uK.value;

    const sp = satGeo.attributes.position.array;
    ADDONS.forEach((a, i) => { a.ang += dt * spd * 0.02; a.pos.set(Math.cos(a.ang) * ADD_R, a.y, -Math.sin(a.ang) * ADD_R); sp[i * 3] = a.pos.x; sp[i * 3 + 1] = a.pos.y; sp[i * 3 + 2] = a.pos.z; });
    satGeo.attributes.position.needsUpdate = true;

    PLANETS.forEach((P, pi) => {
      dst.copy(P.body.position);
      const ang = Math.atan2(-dst.z, dst.x);
      src.set(Math.cos(ang - 0.25) * SUN_R * 1.05, 0, -Math.sin(ang - 0.25) * SUN_R * 1.05);
      ctl.copy(dst).multiplyScalar(0.5).applyAxisAngle(yAx, 0.32); ctl.y = 0.6 + pi * 0.25;
      for (let j = 0; j < SPP; j++) {
        const s = seeds[pi * SPP + j], k = (s[0] + t * 0.08 * s[2] * (reduce ? 0 : 1)) % 1;
        bez(src, ctl, dst, k, o3); o3.y += s[1] * 0.05 * Math.sin(k * Math.PI);
        const id = pi * SPP + j; sPos[id * 3] = o3.x; sPos[id * 3 + 1] = o3.y; sPos[id * 3 + 2] = o3.z;
        sA[id] = Math.sin(k * Math.PI) * (0.35 + P.uni.uHi.value * 0.9) * ease;
      }
    });
    streamGeo.attributes.position.needsUpdate = true; streamGeo.attributes.aF.needsUpdate = true;

    const pe = t - pulseT;
    if (!reduce && intro >= 1 && !focus && idle > 6 && (t % 11) < dt) pulseT = t;
    pulseMat.uniforms.uR.value = 1 + pe * 5.5; pulseMat.uniforms.uA.value = pe < 2 ? (1 - pe / 2) : 0;
    sunMat.uniforms.uPulse.value = pe < 0.9 ? (1 - pe / 0.9) * 0.5 : 0;
    PLANETS.forEach(P => { const hitT = (P.orbit - 1) / 5.5; if (pe > hitT && pe < hitT + .6) P.uni.uHi.value = Math.max(P.uni.uHi.value, 1 - (pe - hitT) / .6); });

    if (!dragging) {
      vAz *= 0.94; vEl *= 0.94; goal.az += vAz; goal.el = Math.max(0.06, Math.min(1.3, goal.el + vEl));
      if (idle > 4 && !reduce && !focus) { goal.az += dt * 0.018; goal.el += (EL0 - goal.el) * 0.008; }
    }
    if (focus) {
      focus.body.getWorldPosition(wp); goal.tx.copy(wp);
      let a = Math.atan2(-Math.cos(focus.ang), Math.sin(focus.ang)) + 1.3;
      while (a - goal.az > Math.PI) a -= Math.PI * 2; while (a - goal.az < -Math.PI) a += Math.PI * 2;
      goal.az += (a - goal.az) * 0.09;
    } else goal.tx.set(0, sys.position.y, 0);
    const kk = intro < 1 ? 0.03 : (focus ? 0.08 : 0.055);
    rig.az += (goal.az - rig.az) * kk;
    rig.el += ((goal.el + (focus ? 0 : my * 0.06)) - rig.el) * kk;
    rig.dist += (goal.dist * (1 + scrollK * 0.2) - rig.dist) * (intro < 1 ? 0.028 : 0.06);
    rig.tx.lerp(goal.tx, focus ? 0.1 : 0.08);
    const az = rig.az + (focus ? 0 : mx * 0.08);
    camera.position.set(rig.tx.x + Math.sin(az) * Math.cos(rig.el) * rig.dist, rig.tx.y + Math.sin(rig.el) * rig.dist, rig.tx.z + Math.cos(az) * Math.cos(rig.el) * rig.dist);
    camera.lookAt(rig.tx);
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

    const lab = intro > 0.8;
    PLANETS.forEach(P => { P.body.getWorldPosition(wp); place(P.el, wp, lab && !focus); P.el.classList.toggle('hi', hover === P || focus === P); });
    ADDONS.forEach(a => { wp.copy(a.pos); sys.localToWorld(wp); place(a.el, wp, lab && !focus && wide); });
    sun.getWorldPosition(wp); place(sunEl, wp, lab && !focus);
  }
  writeText();
  loop();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
