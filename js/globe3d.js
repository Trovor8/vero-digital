/* Vero — WebGL particle globe.
   ~40k particles assemble from a spiral galaxy into the planet, hover ripples, click shockwaves,
   AI scan band, signal arcs between UK · Portugal · Denmark, orbiting satellites, live local times.
   Falls back to js/globe.js (2D canvas) when WebGL is unavailable. */
(function () {
  if (!window.VERO_GL) return;
  if (!window.THREE || !window.d3 || !window.topojson || !window.WORLD) { if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const wrap = document.querySelector('.globe-wrap');
  const old = document.getElementById('globe');
  if (!wrap) return;
  if (old) old.style.display = 'none';

  const T = THREE;
  const cv = document.createElement('canvas');
  cv.id = 'globe-gl';
  cv.setAttribute('aria-label', 'Interactive globe highlighting the United Kingdom, Portugal and Denmark');
  wrap.insertBefore(cv, wrap.firstChild);

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { cv.remove(); if (old) old.style.display = ''; if (window.VERO_GLOBE2D) window.VERO_GLOBE2D(); return; }
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 700;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 200);
  camera.position.set(0, 0, 4);

  const tilt = new T.Group();   // latitude tilt
  const spin = new T.Group();   // earth rotation
  scene.add(tilt); tilt.add(spin);
  const D2R = Math.PI / 180;

  // ---------- helpers
  const v3 = (lat, lon, r = 1) => {
    const phi = (90 - lat) * D2R, th = (lon + 180) * D2R;
    return new T.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };
  const HOME_LON = 0, HOME_LAT = 36;
  const homeRY = (-90 - HOME_LON) * D2R;
  tilt.rotation.x = HOME_LAT * D2R;
  spin.rotation.y = homeRY;

  // ---------- land mask from the world topojson (equirectangular)
  const MW = 2048, MH = 1024;
  const mc = document.createElement('canvas'); mc.width = MW; mc.height = MH;
  const mx = mc.getContext('2d', { willReadFrequently: true });
  const eq = d3.geoEquirectangular().scale(MW / (2 * Math.PI)).translate([MW / 2, MH / 2]);
  const gp = d3.geoPath(eq, mx);
  mx.fillStyle = '#000'; mx.fillRect(0, 0, MW, MH);
  mx.fillStyle = '#fff'; mx.beginPath(); gp(topojson.feature(WORLD, WORLD.objects.land)); mx.fill();
  const HL = { '826': 1, '620': 1, '208': 1 };
  mx.fillStyle = '#f00'; mx.beginPath();
  topojson.feature(WORLD, WORLD.objects.countries).features.filter(f => HL[f.id]).forEach(f => gp(f)); mx.fill();
  const md = mx.getImageData(0, 0, MW, MH).data;
  const sample = (lat, lon) => {
    const x = Math.min(MW - 1, Math.max(0, Math.floor((lon + 180) / 360 * MW)));
    const y = Math.min(MH - 1, Math.max(0, Math.floor((90 - lat) / 180 * MH)));
    const i = (y * MW + x) * 4; const r = md[i], g = md[i + 1];
    return r > 128 ? (g < 110 ? 2 : 1) : 0;
  };

  // ---------- particles (fibonacci sphere)
  const N = small ? 60000 : 120000;
  const GA = Math.PI * (3 - Math.sqrt(5));
  const pos = [], start = [], delay = [], type = [], rnd = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = GA * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    const lat = Math.asin(y) / D2R;
    let lon = Math.atan2(z, -x) / D2R - 180; if (lon < -180) lon += 360;
    let t = sample(lat, lon);
    if (t === 0 && (i % 9) !== 0) continue;           // keep a faint sprinkle of ocean dots
    pos.push(x, y, z); type.push(t); rnd.push(Math.random());
    // start: a flat spiral galaxy around the globe
    const R = 2.2 + Math.pow(Math.random(), 0.7) * 4.5, a = Math.random() * Math.PI * 2 + R * 1.25;
    start.push(Math.cos(a) * R, (Math.random() - 0.5) * 0.35 * (R / 3), Math.sin(a) * R);
    // assembly wave sweeps west → east, highlighted countries land last
    delay.push(((lon + 180) / 360) * 0.9 + Math.random() * 0.35 + (t === 2 ? 0.25 : 0));
  }
  const pg = new T.BufferGeometry();
  pg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  pg.setAttribute('aStart', new T.Float32BufferAttribute(start, 3));
  pg.setAttribute('aDelay', new T.Float32BufferAttribute(delay, 1));
  pg.setAttribute('aType', new T.Float32BufferAttribute(type, 1));
  pg.setAttribute('aRand', new T.Float32BufferAttribute(rnd, 1));

  const U = {
    uTime: { value: 0 }, uIntro: { value: reduce ? 3 : 0 }, uPix: { value: 500 }, uSize: { value: small ? 0.011 : 0.0085 },
    uHover: { value: new T.Vector3(0, 0, 1) }, uHoverT: { value: 0 },
    uShockP: { value: new T.Vector3(0, 0, 1) }, uShockT: { value: -100 },
    uScan: { value: 0 }, uFade: { value: 1 }
  };
  const pm = new T.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending,
    vertexShader: `
      uniform float uTime,uIntro,uPix,uSize,uHoverT,uShockT,uScan;
      uniform vec3 uHover,uShockP;
      attribute vec3 aStart; attribute float aDelay,aType,aRand;
      varying float vA; varying vec3 vC;
      void main(){
        float p = clamp((uIntro - aDelay) / 1.1, 0., 1.);
        p = 1. - pow(1. - p, 4.);
        vec3 dir = normalize(position);
        float land = step(.5, aType), hl = step(1.5, aType);
        float dH = acos(clamp(dot(dir, uHover), -1., 1.));
        float wave = (.5 + .5 * cos(dH * 46. - uTime * 6.)) * exp(-dH * 6.5) * uHoverT;
        float age = uTime - uShockT;
        float dS = acos(clamp(dot(dir, uShockP), -1., 1.));
        float shock = exp(-pow((dS - age * 1.35) * 8., 2.)) * exp(-age * .55) * step(0., age);
        float scan = exp(-pow((dir.y - uScan) * 16., 2.));
        float lift = (wave * .045 + shock * .09) * mix(.35, 1., land) + scan * .01 * land;
        vec3 swirl = aStart;
        float ang = (1. - p) * 2.4;
        swirl.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * swirl.xz;
        vec3 P = mix(swirl, position * (1. + lift), p);
        vec4 mv = modelViewMatrix * vec4(P, 1.);
        gl_Position = projectionMatrix * mv;
        float tw = .7 + .3 * sin(uTime * (1.5 + aRand * 2.) + aRand * 60.);
        float base = mix(mix(.75, 1.5, land), 2.7, hl);
        gl_PointSize = uSize * base * (1. + scan * .8 + wave * 1.1 + shock * 1.3 + (1. - p) * 1.4) * uPix / -mv.z;
        vec3 n = normalize(normalMatrix * dir);
        float rim = smoothstep(.0, .5, n.z);
        vA = mix(mix(.13, .78, land), 1., hl) * tw * mix(.25, 1., rim) * mix(.55, 1., p)
           + (scan * .45 * land + wave * .6 + shock * .55) * p;
        vec3 paper = vec3(.95, .93, .88), orange = vec3(1., .353, .122);
        vC = mix(paper, orange, clamp(hl + scan * .7 * land + wave + shock * 1.6 + (1. - p) * .6, 0., 1.));
      }`,
    fragmentShader: `
      uniform float uFade;
      varying float vA; varying vec3 vC;
      void main(){
        vec2 c = gl_PointCoord - .5; float r = length(c);
        if (r > .5) discard;
        float a = smoothstep(.5, .0, r); a *= a;
        gl_FragColor = vec4(vC, a * vA * uFade);
      }`
  });
  const points = new T.Points(pg, pm);
  spin.add(points);

  // ---------- occluder + inner rim
  const occ = new T.Mesh(new T.SphereGeometry(0.992, 96, 96), new T.ShaderMaterial({
    uniforms: { uIntro: U.uIntro },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float uIntro; varying vec3 vN;
      void main(){ float k = clamp((uIntro - .9) / 1.2, 0., 1.);
        float rim = pow(1. - max(vN.z, 0.), 3.);
        vec3 col = mix(vec3(.047,.047,.051), vec3(.30,.11,.04), rim * .8);
        gl_FragColor = vec4(col, k); }`,
    transparent: true
  }));
  occ.renderOrder = -1;
  spin.add(occ);

  // ---------- atmosphere
  const atm = new T.Mesh(new T.SphereGeometry(1.22, 96, 96), new T.ShaderMaterial({
    uniforms: { uIntro: U.uIntro, uTime: U.uTime },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float uIntro,uTime; varying vec3 vN;
      void main(){ float k = clamp((uIntro - 1.2) / 1.3, 0., 1.);
        float i = pow(max(.62 - dot(vN, vec3(0,0,1.)), 0.), 4.);
        vec3 col = mix(vec3(1.,.36,.12), vec3(1.,.72,.5), .35 + .1 * sin(uTime * .6));
        gl_FragColor = vec4(col, i * .62 * k); }`,
    side: T.BackSide, blending: T.AdditiveBlending, transparent: true, depthWrite: false
  }));
  tilt.add(atm);

  // ---------- cities, beacons, signal arcs
  const CITIES = [
    { k: 'uk', lat: 51.5, lon: -0.13, tz: 'Europe/London', en: 'United Kingdom', pt: 'Reino Unido', da: 'Storbritannien', city: 'London' },
    { k: 'pt', lat: 38.72, lon: -9.14, tz: 'Europe/Lisbon', en: 'Portugal', pt: 'Portugal', da: 'Portugal', city: 'Lisboa' },
    { k: 'dk', lat: 55.68, lon: 12.57, tz: 'Europe/Copenhagen', en: 'Denmark', pt: 'Dinamarca', da: 'Danmark', city: 'København' }
  ];
  CITIES.forEach(c => { c.v = v3(c.lat, c.lon); });

  const fx = new T.Group(); spin.add(fx);
  const beamMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uK: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform float uTime,uK; varying vec2 vUv;
      void main(){ float a = pow(1. - vUv.y, 1.6) * (.75 + .25 * sin(uTime * 4.)); gl_FragColor = vec4(1.,.42,.16, a * uK); }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide
  });
  const rings = [];
  CITIES.forEach((c, ci) => {
    const n = c.v.clone().normalize();
    const beam = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.26, 8, 1, true).translate(0, 0.13, 0), beamMat);
    beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), n); beam.position.copy(n);
    fx.add(beam);
    for (let j = 0; j < 2; j++) {
      const m = new T.Mesh(new T.RingGeometry(0.018, 0.024, 64), new T.MeshBasicMaterial({ color: 0x4d7cff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
      m.position.copy(n.clone().multiplyScalar(1.004)); m.lookAt(n.clone().multiplyScalar(2));
      fx.add(m); rings.push({ m, ph: j * 0.5 + ci * 0.17 });
    }
  });

  const arcMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPix: U.uPix, uReveal: { value: reduce ? 1 : 0 } },
    vertexShader: `uniform float uTime,uPix,uReveal; attribute float aT,aOff; varying float vA;
      void main(){
        float head = fract(uTime * .22 + aOff);
        float db = fract(head - aT);
        float glow = pow(1. - db, 14.);
        vec4 mv = modelViewMatrix * vec4(position,1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (.006 + glow * .02) * uPix / -mv.z;
        vA = (.16 + glow * 1.3) * step(aT, uReveal);
      }`,
    fragmentShader: `varying float vA; void main(){ float r = length(gl_PointCoord - .5); if (r > .5) discard; float a = smoothstep(.5,0.,r); gl_FragColor = vec4(1.,.47,.22, a*a*vA); }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending
  });
  const arcP = [], arcT = [], arcO = [];
  [[0, 1], [1, 2], [2, 0], [1, 0], [2, 1]].forEach(([a, b], k) => {
    const A = CITIES[a].v, B = CITIES[b].v, M = 260;
    const ang = A.angleTo(B);
    for (let i = 0; i <= M; i++) {
      const t = i / M;
      const p = new T.Vector3().copy(A).multiplyScalar(Math.sin((1 - t) * ang) / Math.sin(ang)).add(B.clone().multiplyScalar(Math.sin(t * ang) / Math.sin(ang)));
      p.normalize().multiplyScalar(1 + Math.sin(Math.PI * t) * (0.12 + ang * 0.35));
      arcP.push(p.x, p.y, p.z); arcT.push(t); arcO.push(k * 0.37);
    }
  });
  const ag = new T.BufferGeometry();
  ag.setAttribute('position', new T.Float32BufferAttribute(arcP, 3));
  ag.setAttribute('aT', new T.Float32BufferAttribute(arcT, 1));
  ag.setAttribute('aOff', new T.Float32BufferAttribute(arcO, 1));
  fx.add(new T.Points(ag, arcMat));

  // ---------- orbiting satellites with trails
  const orbitMat = new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPix: U.uPix, uK: { value: 0 } },
    vertexShader: `uniform float uTime,uPix; attribute float aA,aSp,aOf; varying float vA;
      void main(){ float head = fract(uTime * aSp + aOf); float db = fract(head - aA);
        float tail = pow(1. - db, 26.); float dash = .07 + .05 * step(.5, fract(aA * 90.));
        vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = (.004 + tail * .016) * uPix / -mv.z; vA = dash + tail * 1.2; }`,
    fragmentShader: `uniform float uK; varying float vA; void main(){ float r = length(gl_PointCoord - .5); if (r > .5) discard; float a = smoothstep(.5,0.,r); gl_FragColor = vec4(.98,.9,.82, a*a*vA*uK); }`,
    transparent: true, depthWrite: false, depthTest: true, blending: T.AdditiveBlending
  });
  const orbits = new T.Group(); scene.add(orbits);
  [[1.34, 0.32, 0.4, 0.045], [1.5, -0.55, 1.9, -0.032], [1.68, 1.15, -0.7, 0.024]].forEach(([R, tx, tz, sp], k) => {
    const M = 700, P = [], A = [], S = [], O = [];
    for (let i = 0; i < M; i++) { const a = i / M; P.push(Math.cos(a * Math.PI * 2) * R, 0, Math.sin(a * Math.PI * 2) * R); A.push(sp > 0 ? a : 1 - a); S.push(Math.abs(sp)); O.push(k * 0.31); }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3));
    g.setAttribute('aA', new T.Float32BufferAttribute(A, 1));
    g.setAttribute('aSp', new T.Float32BufferAttribute(S, 1));
    g.setAttribute('aOf', new T.Float32BufferAttribute(O, 1));
    const o = new T.Points(g, orbitMat); o.rotation.set(tx, 0, tz); orbits.add(o);
  });

  // ---------- stars
  const SP = [], SR = [];
  for (let i = 0; i < (small ? 700 : 1600); i++) {
    const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = 25 + Math.random() * 40, s = Math.sqrt(1 - u * u);
    SP.push(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r - 10); SR.push(Math.random());
  }
  const sg = new T.BufferGeometry();
  sg.setAttribute('position', new T.Float32BufferAttribute(SP, 3));
  sg.setAttribute('aRand', new T.Float32BufferAttribute(SR, 1));
  const stars = new T.Points(sg, new T.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPix: U.uPix, uIntro: U.uIntro },
    vertexShader: `uniform float uTime,uPix; attribute float aRand; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = (.06 + aRand * .1) * uPix / -mv.z; vA = (.25 + .75 * aRand) * (.5 + .5 * sin(uTime * (.5 + aRand) + aRand * 30.)); }`,
    fragmentShader: `uniform float uIntro; varying float vA; void main(){ float r = length(gl_PointCoord - .5); if (r > .5) discard; gl_FragColor = vec4(.95,.92,.86, smoothstep(.5,0.,r) * vA * .55 * clamp(uIntro, 0., 1.)); }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending
  }));
  scene.add(stars);

  // ---------- HTML labels with live local time
  const lang = () => document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en';
  const labels = CITIES.map(c => {
    const el = document.createElement('div');
    el.className = 'g-label';
    el.innerHTML = '<i></i><b></b><span></span>';
    wrap.appendChild(el); c.el = el; return el;
  });
  const fmt = {};
  CITIES.forEach(c => { try { fmt[c.k] = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.tz }); } catch (e) { fmt[c.k] = null; } });
  function updateLabelText() {
    const L = (document.body.className.match(/\blang-(en|pt|da)\b/) || [])[1] || (/(pt|da)/.exec(lang()) || ['en'])[0];
    CITIES.forEach(c => {
      c.el.querySelector('b').textContent = c[L] || c.en;
      c.el.querySelector('span').textContent = (fmt[c.k] ? fmt[c.k].format(new Date()) + ' · ' : '') + c.city;
    });
  }
  updateLabelText(); setInterval(updateLabelText, 15000);
  new MutationObserver(updateLabelText).observe(document.documentElement, { attributes: true });
  new MutationObserver(updateLabelText).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ---------- sizing
  let W = 1, H = 1, wide = false;
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, b.width); H = Math.max(1, b.height); wide = W > 1000;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const rpx = wide ? Math.min(H * 0.37, W * 0.235) : Math.min(W, H) * 0.36;
    camera.position.z = H / (2 * rpx * Math.tan(camera.fov * D2R / 2));
    if (wide) camera.setViewOffset(W, H, -W * 0.215, -H * 0.03, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    U.uPix.value = (H * DPR) / (2 * Math.tan(camera.fov * D2R / 2));
  }
  size(); addEventListener('resize', size);

  // ---------- interaction
  const ray = new T.Raycaster(), ndc = new T.Vector2(), sphere = new T.Sphere(new T.Vector3(), 1), hit = new T.Vector3();
  let dragging = false, last = null, downAt = null, velX = 0, velY = 0, idle = 99, hovering = false, lastShock = -100;
  let tiltX = HOME_LAT * D2R, spinY = homeRY;
  function pick(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectSphere(sphere, hit)) return null;
    return spin.worldToLocal(hit.clone()).normalize();
  }
  cv.addEventListener('pointerdown', e => { dragging = true; last = [e.clientX, e.clientY]; downAt = [e.clientX, e.clientY]; velX = velY = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    const p = pick(e); hovering = !!p; if (p) U.uHover.value.copy(p);
    cv.style.cursor = dragging ? 'grabbing' : (p ? 'crosshair' : 'grab');
    if (!dragging) return;
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    velX = dx * 0.005; velY = dy * 0.005; spinY += velX; tiltX = Math.max(-0.2, Math.min(1.25, tiltX + velY)); idle = 0;
  });
  cv.addEventListener('pointerleave', () => { hovering = false; });
  addEventListener('pointerup', e => {
    if (dragging && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) {
      const p = pick(e); if (p) { U.uShockP.value.copy(p); U.uShockT.value = U.uTime.value; lastShock = U.uTime.value; }
    }
    dragging = false;
  });

  // scroll: globe drifts and grows as the hero scrolls away
  let scrollK = 0;
  const hero = document.getElementById('hero');
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); }, { passive: true });

  // render only while visible
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ---------- loop
  const clock = new T.Clock();
  let t = 0, introDone = reduce, cityPing = 0, running = false;
  const tmp = new T.Vector3(), camDir = new T.Vector3();
  function loop() {
    if (running) return; running = true;
    requestAnimationFrame(function f() {
      if (!visible || document.hidden) { running = false; return; }
      frame(); requestAnimationFrame(f);
    });
  }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt; idle += dt;
    U.uTime.value = t;
    if (!reduce && U.uIntro.value < 3) U.uIntro.value = Math.min(3, U.uIntro.value + dt * 0.95);
    const intro = U.uIntro.value;
    if (!introDone && intro >= 2.2) { introDone = true; U.uShockP.value.copy(CITIES[1].v); U.uShockT.value = t; lastShock = t; }

    // rotation: inertia → idle drift around home
    if (!dragging) {
      velX *= 0.94; velY *= 0.94; spinY += velX; tiltX = Math.max(-0.2, Math.min(1.25, tiltX + velY));
      if (idle > 3 && !reduce) {
        const target = homeRY + Math.sin(t * 0.11) * 0.55;
        spinY += (target - spinY) * 0.012; tiltX += (HOME_LAT * D2R - tiltX) * 0.02;
      }
    }
    const intoSpin = reduce ? 0 : (1 - Math.min(1, intro / 2.2)) * 1.6;   // extra spin during the assembly
    spin.rotation.y = spinY - intoSpin;
    tilt.rotation.x = tiltX + scrollK * 0.25;
    const s = 1 + scrollK * 0.35; tilt.scale.setScalar(s); orbits.scale.setScalar(s);
    tilt.position.y = scrollK * 0.35; orbits.position.y = tilt.position.y;
    orbits.rotation.y = t * 0.05;
    U.uFade.value = 1 - scrollK * 0.6;

    U.uHoverT.value += ((hovering && !dragging ? 1 : 0) - U.uHoverT.value) * 0.08;
    U.uScan.value = Math.sin(t * 0.45) * 1.05;

    // automatic signals from the three markets when nobody is playing
    if (introDone && !reduce && t - lastShock > 5.5) { cityPing = (cityPing + 1) % 3; U.uShockP.value.copy(CITIES[cityPing].v); U.uShockT.value = t; lastShock = t; }

    const k = Math.max(0, Math.min(1, (intro - 1.6) / 0.8));
    beamMat.uniforms.uK.value = k; orbitMat.uniforms.uK.value = Math.max(0, Math.min(1, (intro - 1.0) / 1.2));
    arcMat.uniforms.uReveal.value = reduce ? 1 : Math.max(0, Math.min(1, (intro - 2.0) / 0.9));
    rings.forEach(r => { const f = (t * 0.55 + r.ph) % 1; r.m.scale.setScalar(1 + f * 3.2); r.m.material.opacity = (1 - f) * 0.9 * k; });

    renderer.render(scene, camera);

    // labels
    camera.getWorldDirection(camDir);
    CITIES.forEach((c, i) => {
      tmp.copy(c.v).multiplyScalar(1.02); spin.localToWorld(tmp);
      const n = tmp.clone().normalize();
      const facing = n.dot(camera.position.clone().sub(tmp).normalize());
      tmp.project(camera);
      const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
      const show = facing > 0.25 && k > 0.5;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      c.el.classList.toggle('on', show);
      c.el.classList.toggle('left', i !== 2);
    });
  }
  loop();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
