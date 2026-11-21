/* Vero — WebGL solar system for the hero.
   The sun is "your business"; the three planets are the core services (Websites · CRMs · Apps);
   the outer moons are the add-ons (AI, ads, SEO, branding…). Plasma sun with corona, lit procedural
   planets with atmospheres, a ringed gas giant, an asteroid belt, orbit trails, a nebula and stars.
   Drag to orbit, hover a planet to highlight it, click to fly in. Falls back to the 2D globe. */
(function () {
  if (!window.VERO_GL) return;
  const wrap = document.querySelector('.globe-wrap');
  if (!wrap) return;
  if (!window.THREE) { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const old = document.getElementById('globe');
  if (old) old.style.display = 'none';

  const T = THREE;
  const cv = document.createElement('canvas');
  cv.id = 'globe-gl';
  cv.setAttribute('aria-label', 'Interactive solar system: your business at the centre, with websites, CRMs and apps in orbit');
  wrap.insertBefore(cv, wrap.firstChild);

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { cv.remove(); if (old) old.style.display = ''; if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const lang = () => document.documentElement.lang || 'en';
  const tx = o => o[lang()] || o.en;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, 0.1, 400);
  const sys = new T.Group(); scene.add(sys);
  let focus = null;

  // ------------------------------------------------------------------ GLSL noise
  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
  float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}`;

  const U = { uTime: { value: 0 }, uIntro: { value: reduce ? 1 : 0 } };

  // ------------------------------------------------------------------ sun
  const SUN_R = 1.35;
  const sunMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPulse: { value: 0 } },
    vertexShader: `varying vec3 vObj;varying vec3 vN;varying vec3 vV;
      void main(){vObj=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uPulse;varying vec3 vObj;varying vec3 vN;varying vec3 vV;
      void main(){vec3 p=normalize(vObj);float t=uTime*.06;
        vec3 q=vec3(fbm(p*2.+t),fbm(p*2.+vec3(5.2,1.3,2.8)-t),fbm(p*2.+vec3(1.7,9.2,3.1)+t*.5));
        float n=fbm(p*3.2+q*1.6+t*.7);float cells=snoise(p*14.+t*2.)*.5+.5;
        float h=clamp(n*.9+.5+cells*.18,0.,1.);
        vec3 c=mix(vec3(.45,.05,0.),vec3(1.,.27,.05),smoothstep(.15,.55,h));
        c=mix(c,vec3(1.,.66,.25),smoothstep(.55,.8,h));c=mix(c,vec3(1.,.95,.8),smoothstep(.82,1.,h));
        float mu=max(dot(vN,vV),0.);c*=.55+.6*pow(mu,.45);
        c+=vec3(1.,.45,.15)*pow(1.-mu,2.2)*.9;c*=1.+uPulse*.8;
        gl_FragColor=vec4(c*1.15,1.);}`
  });
  const sun = new T.Mesh(new T.SphereGeometry(SUN_R, 96, 96), sunMat);
  sys.add(sun);

  // corona: camera-facing plane with animated rays
  const coronaMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPulse: sunMat.uniforms.uPulse },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;uniform float uPulse;varying vec2 vUv;
      void main(){vec2 p=vUv*2.-1.;float d=length(p);float a=atan(p.y,p.x);
        float core=.24;float g=smoothstep(1.,core,d);
        float rays=snoise(vec3(cos(a)*2.2,sin(a)*2.2,uTime*.12))*.5+.5;rays=pow(rays,3.)*smoothstep(1.,core,d)*1.4;
        float glow=pow(g,2.8)*.75+pow(g,7.)*1.1+rays*.5;
        float ring=exp(-pow((d-(.26+mod(uTime*.18,1.)*.7))*14.,2.))*uPulse*.0;
        vec3 c=mix(vec3(1.,.32,.08),vec3(1.,.7,.35),pow(g,4.));
        gl_FragColor=vec4(c*glow*(1.+uPulse),glow);}`
  });
  const corona = new T.Mesh(new T.PlaneGeometry(SUN_R * 7.5, SUN_R * 7.5), coronaMat);
  sys.add(corona);

  // ------------------------------------------------------------------ planets
  const planetVS = `varying vec3 vObj;varying vec3 vN;varying vec3 vW;
    void main(){vObj=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const planetFS = NOISE + `uniform float uTime;uniform float uType;uniform float uSeed;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAtm;uniform float uHi;
    varying vec3 vObj;varying vec3 vN;varying vec3 vW;
    void main(){vec3 p=normalize(vObj);vec3 N=normalize(vN);vec3 L=normalize(-vW);vec3 V=normalize(cameraPosition-vW);
      float dif=dot(N,L);float day=smoothstep(-.12,.35,dif);vec3 col;float night=0.;
      if(uType<.5){ // ocean world with continents, clouds and city lights
        float n=fbm(p*2.1+uSeed);float land=smoothstep(.02,.1,n);
        vec3 ocean=mix(uA*.55,uA,smoothstep(-.4,.0,n));vec3 ground=mix(uB,uC,smoothstep(.1,.45,n));
        col=mix(ocean,ground,land);
        float cl=smoothstep(.1,.6,fbm(p*3.4+vec3(uTime*.012,0.,uSeed)));col=mix(col,vec3(1.),cl*.75);
        float spec=pow(max(dot(reflect(-L,N),V),0.),40.)*(1.-land)*(1.-cl);col+=spec*.6;
        night=land*(1.-cl)*smoothstep(.55,.95,snoise(p*38.+uSeed)*.5+.5);
      } else if(uType<1.5){ // gas giant bands + storm
        float w=fbm(p*vec3(1.5,4.,1.5)+uSeed+vec3(uTime*.01,0.,0.));
        float b=sin(p.y*13.+w*3.2)*.5+.5;float b2=sin(p.y*31.+w*5.)*.5+.5;
        col=mix(uA,uB,b);col=mix(col,uC,b2*.35);
        vec3 sp=normalize(vec3(.6,-.28,.75));float st=smoothstep(.22,.0,distance(p,sp)+snoise(p*9.+uTime*.05)*.04);
        col=mix(col,uC*1.25,st);
      } else { // ice world
        float n=fbm(p*2.6+uSeed);float cr=1.-smoothstep(0.,.05,abs(snoise(p*7.+uSeed)));
        col=mix(uA,uB,smoothstep(-.3,.4,n));col=mix(col,uC,cr*.6);col=mix(col,vec3(.95,.97,1.),smoothstep(.75,.95,abs(p.y)));
        float spec=pow(max(dot(reflect(-L,N),V),0.),18.)*.35;col+=spec;
      }
      float fill=pow(max(dot(N,V),0.),1.5)*.26;vec3 lit=col*(.07+fill+day*1.05)+vec3(1.,.62,.3)*night*(1.-day)*1.4;
      float fr=pow(1.-max(dot(N,V),0.),2.6);lit+=uAtm*fr*(.25+day*1.2);
      lit+=uAtm*uHi*.18*fr*2.;
      gl_FragColor=vec4(lit,1.);}`;
  const atmVS = `varying vec3 vN;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const atmFS = `uniform vec3 uAtm;uniform float uHi;varying vec3 vN;varying vec3 vW;
    void main(){vec3 V=normalize(cameraPosition-vW);vec3 L=normalize(-vW);float i=pow(max(.68-dot(vN,V),0.),2.4)*3.;float d=smoothstep(-.4,.6,dot(vN,L));gl_FragColor=vec4(uAtm*i*(.25+d)*(1.+uHi),i*(.25+d));}`;

  const C3 = h => new T.Color(h);
  const PLANETS = [
    { key: 'web', r: 0.52, orbit: 3.5, period: 30, phase: 0.6, tilt: 0.25, type: 0, seed: 3.1, A: '#1f5fbf', B: '#3f8f5a', C: '#d9c38f', atm: '#5ab2ff', href: 'services.html#web',
      n: { en: 'Websites', pt: 'Sites', da: 'Hjemmesider' }, s: { en: 'Your best salesperson, online 24/7', pt: 'O seu melhor vendedor, online 24/7', da: 'Din bedste sælger, online 24/7' },
      d: { en: 'Fast, beautiful sites and online stores that turn visitors into bookings and sales.', pt: 'Sites e lojas online rápidos e bonitos que transformam visitas em reservas e vendas.', da: 'Hurtige, smukke hjemmesider og webshops, der gør besøgende til bookinger og salg.' } },
    { key: 'crm', r: 0.86, orbit: 5.5, period: 46, phase: 2.7, tilt: 0.42, type: 1, seed: 7.7, A: '#ff6a2a', B: '#ffd2a1', C: '#a8340f', atm: '#ff8a4c', ring: true, href: '#crm',
      n: { en: 'CRMs', pt: 'CRMs', da: 'CRM-systemer' }, s: { en: 'Every lead, client and job in one place', pt: 'Cada lead, cliente e trabalho num só sítio', da: 'Alle leads, kunder og opgaver ét sted' },
      d: { en: 'Custom CRMs built around your process — pipelines, bookings, automations and AI, for any niche.', pt: 'CRMs à medida do seu processo — pipelines, marcações, automações e AI, para qualquer nicho.', da: 'Skræddersyede CRM-systemer bygget om din proces — pipelines, booking, automatisering og AI, til enhver branche.' } },
    { key: 'app', r: 0.62, orbit: 7.4, period: 64, phase: 4.4, tilt: 0.12, type: 2, seed: 12.4, A: '#6c5ce7', B: '#b8c6ff', C: '#2e2a6b', atm: '#a99bff', moon: true, href: 'contact.html',
      n: { en: 'Apps', pt: 'Apps', da: 'Apps' }, s: { en: 'Your business in your clients’ pocket', pt: 'O seu negócio no bolso dos clientes', da: 'Din virksomhed i kundernes lomme' },
      d: { en: 'Web and mobile apps, client portals and internal tools your team and customers actually use.', pt: 'Apps web e mobile, portais de cliente e ferramentas internas que a equipa e os clientes usam.', da: 'Web- og mobilapps, kundeportaler og interne værktøjer, som dit team og dine kunder faktisk bruger.' } }
  ];
  PLANETS.forEach((P, i) => {
    P.uni = { uTime: U.uTime, uType: { value: P.type }, uSeed: { value: P.seed }, uA: { value: C3(P.A) }, uB: { value: C3(P.B) }, uC: { value: C3(P.C) }, uAtm: { value: C3(P.atm) }, uHi: { value: 0 } };
    P.pivot = new T.Group(); sys.add(P.pivot);
    P.body = new T.Group(); P.pivot.add(P.body);
    P.mesh = new T.Mesh(new T.SphereGeometry(P.r, 64, 64), new T.ShaderMaterial({ uniforms: P.uni, vertexShader: planetVS, fragmentShader: planetFS }));
    P.mesh.rotation.z = P.tilt; P.body.add(P.mesh);
    const atm = new T.Mesh(new T.SphereGeometry(P.r * 1.16, 48, 48), new T.ShaderMaterial({ uniforms: { uAtm: P.uni.uAtm, uHi: P.uni.uHi }, vertexShader: atmVS, fragmentShader: atmFS, side: T.BackSide, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    P.body.add(atm);
    if (P.ring) {
      const rg = new T.RingGeometry(P.r * 1.35, P.r * 2.35, 160, 1);
      const ringMat = new T.ShaderMaterial({
        uniforms: { uIn: { value: P.r * 1.35 }, uOut: { value: P.r * 2.35 }, uHi: P.uni.uHi },
        transparent: true, depthWrite: false, side: T.DoubleSide,
        vertexShader: `varying vec3 vL;varying vec3 vW;void main(){vL=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
        fragmentShader: NOISE + `uniform float uIn;uniform float uOut;uniform float uHi;varying vec3 vL;varying vec3 vW;
          void main(){float r=(length(vL.xy)-uIn)/(uOut-uIn);float b=snoise(vec3(r*38.,0.,1.))*.5+.5;float b2=snoise(vec3(r*110.,3.,2.))*.5+.5;
            float a=smoothstep(0.,.06,r)*smoothstep(1.,.85,r)*(.25+b*.55+b2*.25);a*=1.-smoothstep(.42,.47,r)*smoothstep(.53,.48,r)*.85;
            vec3 c=mix(vec3(1.,.72,.45),vec3(.85,.4,.2),b);float lit=.55+.45*smoothstep(-1.,1.,dot(normalize(-vW),vec3(0.,1.,0.))+.5);
            gl_FragColor=vec4(c*lit*(1.+uHi*.4),a*.7);}`
      });
      const ring = new T.Mesh(rg, ringMat);
      ring.rotation.x = -Math.PI / 2 + 0.5; ring.rotation.y = 0.18;
      P.body.add(ring);
    }
    if (P.moon) {
      P.moonPivot = new T.Group(); P.body.add(P.moonPivot);
      const mm = new T.Mesh(new T.SphereGeometry(0.14, 32, 32), new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uType: { value: 2 }, uSeed: { value: 30 }, uA: { value: C3('#77746f') }, uB: { value: C3('#c9c4ba') }, uC: { value: C3('#3b3936') }, uAtm: { value: C3('#222') }, uHi: { value: 0 } }, vertexShader: planetVS, fragmentShader: planetFS }));
      mm.position.set(P.r * 2.1, 0.12, 0); P.moonPivot.add(mm);
    }
    P.ang = P.phase;
  });

  // ------------------------------------------------------------------ orbits with comet trails
  const orbitMat = r => new T.ShaderMaterial({
    uniforms: { uPA: { value: 0 }, uK: { value: 0 }, uHi: { value: 0 }, uCol: { value: new T.Color('#ff7a3d') } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uPA;uniform float uK;uniform float uHi;uniform vec3 uCol;varying float vA;
      void main(){float d=mod(uPA-vA,6.28318)/6.28318;float shown=step(vA/6.28318,uK);
        float trail=pow(1.-d,9.)*1.1;float a=(.13+uHi*.25+trail)*shown;gl_FragColor=vec4(mix(vec3(.85,.82,.78),uCol,clamp(trail*1.4,0.,1.)),a);}`
  });
  PLANETS.forEach(P => {
    const n = 360, pos = new Float32Array((n + 1) * 3), aa = new Float32Array(n + 1);
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pos[i * 3] = Math.cos(a) * P.orbit; pos[i * 3 + 2] = -Math.sin(a) * P.orbit; aa[i] = a; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aA', new T.BufferAttribute(aa, 1));
    P.orbitMat = orbitMat(P.orbit); P.orbitLine = new T.Line(g, P.orbitMat); sys.add(P.orbitLine);
  });

  // ------------------------------------------------------------------ asteroid belt + add-on moons
  const pointVS = `attribute float aR;attribute float aA;attribute float aS;attribute float aY;attribute float aSz;attribute float aC;
    uniform float uTime;uniform float uPix;uniform float uIntro;varying float vC;varying float vF;
    void main(){float a=aA+uTime*aS;float r=aR*(1.+(1.-uIntro)*1.8);vec3 p=vec3(cos(a)*r,aY*(.4+uIntro*.6),-sin(a)*r);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSz*uPix/-mv.z;vC=aC;vF=uIntro;}`;
  const beltFS = `varying float vC;varying float vF;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,.1,d);
    vec3 col=mix(vec3(.62,.58,.52),vec3(1.,.48,.2),vC);gl_FragColor=vec4(col,a*.85*vF);}`;
  function belt(count, rIn, rOut, thick, speed, sz, warm) {
    const g = new T.BufferGeometry(), A = { aR: [], aA: [], aS: [], aY: [], aSz: [], aC: [] };
    for (let i = 0; i < count; i++) {
      const r = rIn + Math.pow(Math.random(), 1.4) * (rOut - rIn) * (Math.random() < .5 ? 1 : .7);
      A.aR.push(r); A.aA.push(Math.random() * Math.PI * 2); A.aS.push(speed / Math.pow(r, 1.5) * (0.9 + Math.random() * 0.2));
      A.aY.push((Math.random() - .5) * thick * (Math.random() < .9 ? 1 : 3)); A.aSz.push(sz * (0.35 + Math.pow(Math.random(), 3) * 1.6)); A.aC.push(Math.random() < warm ? 1 : Math.random() * .3);
    }
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
    Object.keys(A).forEach(k => g.setAttribute(k, new T.BufferAttribute(new Float32Array(A[k]), 1)));
    g.boundingSphere = new T.Sphere(new T.Vector3(), rOut * 3);
    const m = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uPix: { value: 600 }, uIntro: U.uIntro }, vertexShader: pointVS, fragmentShader: beltFS, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const pts = new T.Points(g, m); sys.add(pts); return m;
  }
  const small = Math.min(innerWidth, innerHeight) < 700;
  const beltMats = [belt(small ? 2600 : 6500, 8.6, 9.8, .22, 2.2, .05, .12), belt(small ? 700 : 1600, 1.9, 2.5, .08, 1.6, .03, .7)];

  const ADDONS = [
    { en: 'AI receptionist', pt: 'Rececionista AI', da: 'AI-receptionist' }, { en: 'Meta & Google Ads', pt: 'Meta e Google Ads', da: 'Meta & Google Ads' },
    { en: 'SEO', pt: 'SEO', da: 'SEO' }, { en: 'Branding', pt: 'Branding', da: 'Branding' },
    { en: 'Email & SMS', pt: 'Email e SMS', da: 'E-mail & SMS' }, { en: 'Reviews', pt: 'Avaliações', da: 'Anmeldelser' }
  ];
  const ADD_R = 10.9;
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.2, 'rgba(255,170,110,.8)'); g.addColorStop(.5, 'rgba(255,90,31,.25)'); g.addColorStop(1, 'rgba(255,90,31,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  ADDONS.forEach((a, i) => {
    a.ang = i / ADDONS.length * Math.PI * 2 + .3;
    a.obj = new T.Sprite(new T.SpriteMaterial({ map: glowTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    a.obj.scale.setScalar(.75); sys.add(a.obj);
  });
  {
    const n = 360, pos = new Float32Array((n + 1) * 3);
    for (let i = 0; i <= n; i++) { const t = i / n * Math.PI * 2; pos[i * 3] = Math.cos(t) * ADD_R; pos[i * 3 + 2] = -Math.sin(t) * ADD_R; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    var addLine = new T.LineLoop(g, new T.LineDashedMaterial({ color: 0x8a857c, dashSize: .12, gapSize: .22, transparent: true, opacity: .32 }));
    addLine.computeLineDistances(); sys.add(addLine);
  }

  // ------------------------------------------------------------------ stars + nebula
  {
    const N = small ? 1800 : 4200, pos = new Float32Array(N * 3), sz = new Float32Array(N), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 90 + Math.random() * 80, s = Math.sqrt(1 - u * u);
      pos[i * 3] = r * s * Math.cos(th); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(th);
      sz[i] = .5 + Math.pow(Math.random(), 6) * 3.2; ph[i] = Math.random() * 6.28;
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aS', new T.BufferAttribute(sz, 1)); g.setAttribute('aP', new T.BufferAttribute(ph, 1));
    var starMat = new T.ShaderMaterial({ uniforms: { uTime: U.uTime, uDPR: { value: DPR } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: `attribute float aS;attribute float aP;uniform float uTime;uniform float uDPR;varying float vT;void main(){vT=.55+.45*sin(uTime*(1.+aP*.3)+aP);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aS*uDPR*(.8+vT*.4);}`,
      fragmentShader: `varying float vT;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(1.,.93,.86),smoothstep(.5,0.,d)*vT*.9);}` });
    scene.add(new T.Points(g, starMat));
  }
  const nebMat = new T.ShaderMaterial({ uniforms: { uTime: U.uTime }, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: NOISE + `uniform float uTime;varying vec2 vUv;void main(){vec2 p=vUv*2.-1.;float m=smoothstep(1.,.1,length(p));
      float n=fbm(vec3(p*1.6,uTime*.01))*.5+.5;float n2=fbm(vec3(p*3.+4.,uTime*.015))*.5+.5;
      vec3 c=mix(vec3(.55,.12,.02),vec3(.35,.1,.45),n2)*pow(n,2.2)*m;gl_FragColor=vec4(c*.55,1.);}` });
  const neb = new T.Mesh(new T.PlaneGeometry(150, 110), nebMat);
  scene.add(neb);

  // ------------------------------------------------------------------ signal pulse (click the sun)
  const pulseMat = new T.ShaderMaterial({ uniforms: { uR: { value: 0 }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    vertexShader: `varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uR;uniform float uA;varying vec3 vL;void main(){float d=length(vL.xy);float a=exp(-pow((d-uR)*3.2,2.))*uA;gl_FragColor=vec4(vec3(1.,.55,.25)*a,a);}` });
  const pulse = new T.Mesh(new T.PlaneGeometry(26, 26), pulseMat);
  pulse.rotation.x = -Math.PI / 2; sys.add(pulse);
  let pulseT = -10;

  // ------------------------------------------------------------------ HTML labels + info card
  const mkLabel = (cls, html) => { const d = document.createElement('div'); d.className = 'sol-label ' + cls; d.innerHTML = html; wrap.appendChild(d); return d; };
  PLANETS.forEach((P, i) => { P.el = mkLabel('pl', `<i></i><b></b><span></span>`); P.el.dataset.n = '0' + (i + 1); });
  ADDONS.forEach(a => { a.el = mkLabel('ad', '<b></b>'); });
  const sunEl = mkLabel('sun', '<b></b>');
  const card = document.createElement('div'); card.className = 'sol-card'; card.setAttribute('aria-live', 'polite'); wrap.appendChild(card);
  const UI = {
    sun: { en: 'Your business', pt: 'O seu negócio', da: 'Din virksomhed' },
    more: { en: 'Explore', pt: 'Explorar', da: 'Udforsk' }, back: { en: 'Back to the system', pt: 'Voltar ao sistema', da: 'Tilbage til systemet' },
    core: { en: 'Core service', pt: 'Serviço principal', da: 'Kerneydelse' }
  };
  function writeText() {
    PLANETS.forEach((P, i) => { P.el.querySelector('b').textContent = tx(P.n); P.el.querySelector('span').textContent = tx(P.s); });
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

  // ------------------------------------------------------------------ camera rig
  let W = 1, H = 1, wide = true, baseDist = 30;
  const rig = { az: -0.55, el: 0.42, dist: 30, tx: new T.Vector3() };
  const goal = { az: -0.55, el: 0.42, dist: 30, tx: new T.Vector3() };
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, b.width); H = Math.max(1, b.height); wide = W > 1000;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const SYS = 11.6; // world radius to fit
    const rpx = wide ? Math.min(W * 0.31, H * 0.72) : Math.min(W * 0.62, H * 0.7);
    baseDist = SYS / Math.tan(camera.fov * Math.PI / 360) * (H / 2) / rpx;
    if (!focus) goal.dist = baseDist;
    if (wide) camera.setViewOffset(W, H, -W * 0.25, H * 0.02, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    const pix = (H * DPR) / (2 * Math.tan(camera.fov * Math.PI / 360));
    beltMats.forEach(m => m.uniforms.uPix.value = pix);
  }
  size(); rig.dist = reduce ? baseDist : baseDist * 2.6; rig.el = reduce ? goal.el : 1.25;
  addEventListener('resize', size);

  // ------------------------------------------------------------------ interaction
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let dragging = false, last = null, downAt = null, vAz = 0, vEl = 0, idle = 99, hover = null;
  function pickAt(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    let best = null, bd = 1e9; const wp = new T.Vector3();
    PLANETS.forEach(P => { P.mesh.getWorldPosition(wp); const s = new T.Sphere(wp, P.r * 1.6); const h = ray.ray.intersectSphere(s, new T.Vector3()); if (h) { const d = h.distanceTo(camera.position); if (d < bd) { bd = d; best = P; } } });
    if (!best && ray.ray.intersectSphere(new T.Sphere(new T.Vector3(), SUN_R * 1.2), new T.Vector3())) return 'sun';
    return best;
  }
  cv.addEventListener('pointerdown', e => { dragging = true; last = [e.clientX, e.clientY]; downAt = [e.clientX, e.clientY]; vAz = vEl = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    const h = pickAt(e); hover = h;
    cv.style.cursor = dragging ? 'grabbing' : (h ? 'pointer' : 'grab');
    if (!dragging) return;
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    vAz = -dx * 0.005; vEl = dy * 0.004; goal.az += vAz; goal.el = Math.max(0.08, Math.min(1.35, goal.el + vEl)); idle = 0;
  });
  cv.addEventListener('pointerleave', () => { hover = null; });
  addEventListener('pointerup', e => {
    if (dragging && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) {
      const h = pickAt(e);
      if (h === 'sun') { pulseT = U.uTime.value; }
      else if (h) focusOn(h);
      else if (focus) unfocus();
    }
    dragging = false;
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && focus) unfocus(); });
  function focusOn(P) { focus = P; idle = 0; goal.dist = Math.max(P.r * (P.ring ? 11 : 10), baseDist * 0.24); goal.el = 0.55; openCard(P); wrap.classList.add('sol-focus'); }
  function unfocus() { focus = null; goal.dist = baseDist; goal.el = 0.42; goal.tx.set(0, 0, 0); card.classList.remove('on'); wrap.classList.remove('sol-focus'); }

  // parallax + scroll
  let mx = 0, my = 0, scrollK = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const hero = document.getElementById('hero');
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); }, { passive: true });

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ------------------------------------------------------------------ loop
  const clock = new T.Clock();
  let t = 0, running = false;
  const wp = new T.Vector3(), tmp = new T.Vector3();
  function loop() {
    if (running) return; running = true;
    requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); });
  }
  function place(el, v, show, extra) {
    tmp.copy(v).project(camera);
    const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    el.classList.toggle('on', show && tmp.z < 1);
    if (extra) extra(x, y);
  }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt; idle += dt;
    U.uTime.value = t;
    if (!reduce && U.uIntro.value < 1) U.uIntro.value = Math.min(1, U.uIntro.value + dt * 0.42);
    const intro = U.uIntro.value, ease = 1 - Math.pow(1 - intro, 3);
    const speed = reduce ? 0 : (focus ? 0.25 : 1);

    // planets
    PLANETS.forEach((P, i) => {
      P.ang += dt * speed * (Math.PI * 2 / P.period) * (1 + (1 - ease) * 3);
      const r = P.orbit * (0.2 + 0.8 * ease);
      P.body.position.set(Math.cos(P.ang) * r, 0, -Math.sin(P.ang) * r);
      P.mesh.rotation.y += dt * (0.25 + i * 0.05) * (reduce ? 0 : 1);
      if (P.moonPivot) P.moonPivot.rotation.y += dt * 0.9 * speed;
      const hi = (hover === P || focus === P) ? 1 : 0;
      P.uni.uHi.value += (hi - P.uni.uHi.value) * 0.1;
      const s = 1 + P.uni.uHi.value * 0.08; P.body.scale.setScalar(s * Math.max(0.001, ease));
      P.orbitMat.uniforms.uPA.value = P.ang; P.orbitMat.uniforms.uK.value = Math.min(1, intro * 1.4 - i * 0.12);
      P.orbitMat.uniforms.uHi.value = P.uni.uHi.value;
    });
    ADDONS.forEach((a, i) => {
      a.ang += dt * speed * 0.035;
      a.obj.position.set(Math.cos(a.ang) * ADD_R, Math.sin(t * 0.6 + i) * 0.12, -Math.sin(a.ang) * ADD_R);
      a.obj.scale.setScalar((.6 + Math.sin(t * 2 + i) * .08) * ease);
    });
    addLine.material.opacity = .3 * ease;
    sun.rotation.y += dt * 0.04;

    // sun pulse → ripples to the planets
    const pe = t - pulseT;
    const auto = !reduce && intro >= 1 && !focus && idle > 6 && (t % 9) < dt;
    if (auto) pulseT = t;
    pulseMat.uniforms.uR.value = pe * 6.5; pulseMat.uniforms.uA.value = pe < 2.2 ? (1 - pe / 2.2) * 0.9 : 0;
    sunMat.uniforms.uPulse.value = pe < 0.8 ? (1 - pe / 0.8) * 0.6 : 0;
    PLANETS.forEach(P => { const hitT = P.orbit / 6.5; if (pe > hitT && pe < hitT + .5) P.uni.uHi.value = Math.max(P.uni.uHi.value, 1 - (pe - hitT) / .5); });

    // camera
    if (!dragging) {
      vAz *= 0.94; vEl *= 0.94; goal.az += vAz; goal.el = Math.max(0.08, Math.min(1.35, goal.el + vEl));
      if (idle > 4 && !reduce && !focus) { goal.az += dt * 0.03; goal.el += (0.42 - goal.el) * 0.01; }
    }
    if (focus) { focus.body.getWorldPosition(wp); goal.tx.copy(wp); let a = Math.atan2(-Math.cos(focus.ang), Math.sin(focus.ang)) + 1.35; while (a - goal.az > Math.PI) a -= Math.PI * 2; while (a - goal.az < -Math.PI) a += Math.PI * 2; goal.az += (a - goal.az) * 0.05; }
    const k = 0.06;
    rig.az += (goal.az - rig.az) * k; rig.el += ((goal.el + my * 0.08 * (focus ? 0 : 1)) - rig.el) * (intro < 1 ? 0.035 : k);
    rig.dist += (goal.dist * (1 + scrollK * 0.25) - rig.dist) * (intro < 1 ? 0.03 : 0.07);
    rig.tx.lerp(goal.tx, focus ? 0.12 : 0.06);
    const az = rig.az + mx * 0.12 * (focus ? 0 : 1);
    camera.position.set(rig.tx.x + Math.sin(az) * Math.cos(rig.el) * rig.dist, rig.tx.y + Math.sin(rig.el) * rig.dist, rig.tx.z + Math.cos(az) * Math.cos(rig.el) * rig.dist);
    camera.lookAt(rig.tx);
    sys.position.y = scrollK * 2.5;
    corona.quaternion.copy(camera.quaternion);
    neb.position.copy(camera.position).add(tmp.set(0, 0, -95).applyQuaternion(camera.quaternion));
    neb.quaternion.copy(camera.quaternion);

    renderer.render(scene, camera);

    // labels
    const lab = intro > 0.85;
    PLANETS.forEach(P => { P.body.getWorldPosition(wp); wp.y += P.r * (P.ring ? 1.25 : 1.15); place(P.el, wp, lab && (!focus || focus === P)); P.el.classList.toggle('hi', hover === P || focus === P); });
    ADDONS.forEach(a => { a.obj.getWorldPosition(wp); place(a.el, wp, lab && !focus && wide); });
    wp.set(0, SUN_R * 1.15, 0); sys.localToWorld(wp); place(sunEl, wp, lab && !focus);
  }
  writeText();
  loop();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
