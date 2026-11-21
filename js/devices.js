/* Vero — hero "real products" (three r149).
   A laptop and a phone built procedurally (extruded rounded slabs, physical materials, studio environment made with
   PMREM from emissive softboxes, contact shadows). Their screens are live, high-resolution canvas UIs — a restaurant
   website, its CRM and its booking app — and the visitor's cursor becomes the cursor *inside* the screens: hover,
   click "Book a table", move a CRM card to the next stage, check in on the app. The camera follows the headline word
   (websites → CRMs → apps). Falls back to the 2D globe without WebGL. */
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
  cv.setAttribute('aria-label', 'A laptop and a phone showing a website, a CRM and an app — you can use the screens');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return fallback(); }
  const old = document.getElementById('globe'); if (old) old.style.display = 'none';
  wrap.insertBefore(cv, wrap.firstChild);
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const MAXANI = renderer.capabilities.getMaxAnisotropy();

  // mobile: the 3D stage sits right under the headline (first thing you see); desktop: behind the hero copy
  const homeParent = wrap.parentNode, homeNext = wrap.nextSibling, mq = matchMedia('(max-width:1000px)');
  function placeStage() {
    const h1 = hero && hero.querySelector('.wrap h1');
    if (mq.matches && h1) { if (wrap.previousElementSibling !== h1) h1.after(wrap); wrap.classList.add('in-copy'); }
    else if (wrap.parentNode !== homeParent) { homeParent.insertBefore(wrap, homeNext); wrap.classList.remove('in-copy'); }
  }
  placeStage(); (mq.addEventListener ? mq.addEventListener('change', () => { placeStage(); setTimeout(() => dispatchEvent(new Event('resize')), 30); }) : mq.addListener(placeStage));
  const rots = hero ? [...hero.querySelectorAll('[data-rot]')] : [];
  rots.forEach(r => r.setAttribute('data-rot-ext', ''));

  // ================================================================== scene + studio environment
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
  {
    const env = new T.Scene();
    const room = new T.Mesh(new T.BoxGeometry(30, 16, 30), new T.MeshBasicMaterial({ color: 0x06080e, side: T.BackSide })); env.add(room);
    const panel = (w, h, col, k, pos, look) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k), side: T.DoubleSide })); m.position.set(...pos); m.lookAt(...look); env.add(m); };
    panel(14, 6, '#ffffff', 3.2, [0, 7.5, 2], [0, 0, 0]);      // top softbox
    panel(3, 10, '#ffffff', 2.2, [-11, 3, 3], [0, 1, 0]);      // left strip
    panel(3, 10, '#3d6bff', 2.6, [11, 3, -2], [0, 1, 0]);      // warm right strip (brand)
    panel(10, 3, '#cfd8ff', 0.8, [0, 2, -12], [0, 1, 0]);      // cool back fill
    const pm = new T.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.04).texture;
    pm.dispose();
  }
  const key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(-3, 6, 4); scene.add(key);
  const rim = new T.DirectionalLight(0x5b8cff, 1.4); rim.position.set(5, 2, -4); scene.add(rim);
  scene.add(new T.AmbientLight(0xffffff, 0.15));

  // ================================================================== geometry helpers
  function rrShape(w, h, r) { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function slab(w, h, d, r, b) { const g = new T.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(0.002, r - b)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 20 }); g.translate(0, 0, -(d - 2 * b) / 2); g.computeVertexNormals(); return g; }
  const metal = new T.MeshPhysicalMaterial({ color: 0x2b2c30, metalness: 1, roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 1.1 });
  const metalLight = new T.MeshPhysicalMaterial({ color: 0x6b6d73, metalness: 1, roughness: 0.25, envMapIntensity: 1.2 });
  const glassBlack = new T.MeshPhysicalMaterial({ color: 0x030303, metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3 });
  const sheen = new T.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.07, envMapIntensity: 1.4, depthWrite: false });
  function shadowTex(sx, sy) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new T.CanvasTexture(c); return t; }
  const shTex = shadowTex();

  // ================================================================== live screens (canvas UIs)
  function makeScreen(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = MAXANI; tex.minFilter = T.LinearMipmapLinearFilter; return { c, x: c.getContext('2d'), tex, w, h, hot: [], cur: null, down: false }; }
  const SL = makeScreen(1600, 1000), SP = makeScreen(560, 1160);
  const D = "'Bricolage Grotesque',system-ui,sans-serif", I = "'Inter',system-ui,sans-serif";
  const rp = (x, X, Y, W, H, R) => { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); };
  const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
  const now = () => performance.now() / 1000;

  const st = {
    site: { booked: 0, bookedAt: -9 },
    crm: { cols: [['Sofia M.', 'Tom R.'], ['Ana P.', 'Lars K.'], ['Mia B.'], ['Emma W.']], det: { 'Sofia M.': '4 · Fri 20:00', 'Tom R.': '2 · Sat 13:00', 'Ana P.': '6 · Fri 21:00', 'Lars K.': '2 · Tonight', 'Mia B.': '8 · Birthday', 'Emma W.': '★★★★★', 'Jo S.': '3 · Sun 12:30' }, moving: null, toastAt: -9, kpiT: 0 },
    app: { checked: 0, checkedAt: -9, pushAt: -9 },
    lap: 0, lapFrom: 0, wipe: 1
  };
  function hotHit(S, id, X, Y, W, H) { S.hot.push({ id, X, Y, W, H }); return S.cur && S.cur.x >= X && S.cur.x <= X + W && S.cur.y >= Y && S.cur.y <= Y + H; }

  // ---- website (restaurant)
  function drawSite(x, S, t) {
    const W = 1600, H = 1000;
    x.fillStyle = '#f4efe6'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#1b1712'; x.font = `800 34px ${D}`; x.fillText('Casa Lume', 70, 82);
    x.font = `500 21px ${I}`; x.fillStyle = '#5e564c'; ['Menu', 'Story', 'Events'].forEach((s, i) => x.fillText(s, 980 + i * 120, 80));
    const hn = hotHit(S, 'navbook', 1350, 48, 180, 50); rp(x, 1350, 48, 180, 50, 25); x.fillStyle = hn ? '#c2410c' : '#1b1712'; x.fill(); x.fillStyle = '#fff'; x.font = `600 20px ${I}`; x.fillText('Book', 1412, 80);
    x.fillStyle = '#1b1712'; x.font = `800 92px ${D}`; x.fillText('A table worth', 70, 270); x.fillText('crossing town for.', 70, 370);
    x.font = `400 27px ${I}`; x.fillStyle = '#6b6258'; x.fillText('Seasonal Portuguese cooking in Lisbon.', 70, 440); x.fillText('Open tonight from 19:00.', 70, 478);
    const hb = hotHit(S, 'book', 70, 530, 320, 84); rp(x, 70, 530, 320, 84, 42); x.fillStyle = hb ? '#c2410c' : '#1b1712'; x.fill(); x.fillStyle = '#fff'; x.font = `600 27px ${I}`; x.fillText('Book a table  →', 110, 582);
    rp(x, 410, 530, 250, 84, 42); x.strokeStyle = '#1b1712'; x.lineWidth = 2.5; x.stroke(); x.fillStyle = '#1b1712'; x.fillText('See the menu', 450, 582);
    rp(x, 70, 660, 420, 56, 28); x.fillStyle = '#e9e1d4'; x.fill(); x.fillStyle = '#1b1712'; x.font = `600 21px ${I}`; x.fillText('★ 4.9  ·  1,240 Google reviews', 96, 696);
    const pulse = .5 + .5 * Math.sin(t * 3); x.fillStyle = `rgba(22,163,74,${.4 + pulse * .6})`; x.beginPath(); x.arc(92, 770, 8, 0, 7); x.fill(); x.fillStyle = '#5e564c'; x.font = `500 21px ${I}`; x.fillText('Live: 12 tables left tonight', 112, 777);
    // photo
    x.save(); rp(x, 860, 140, 670, 760, 36); x.clip();
    const g = x.createLinearGradient(860, 140, 1530, 900); g.addColorStop(0, '#2a1a12'); g.addColorStop(1, '#7c2d12'); x.fillStyle = g; x.fillRect(860, 140, 670, 760);
    const lg = x.createRadialGradient(1300, 260, 10, 1300, 260, 520); lg.addColorStop(0, 'rgba(255,190,120,.55)'); lg.addColorStop(1, 'rgba(255,190,120,0)'); x.fillStyle = lg; x.fillRect(860, 140, 670, 760);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(1205, 560, 250, 70, 0, 0, 7); x.fill();
    x.fillStyle = '#f3ede3'; x.beginPath(); x.ellipse(1195, 500, 255, 205, 0, 0, 7); x.fill();
    x.fillStyle = '#e4dccf'; x.beginPath(); x.ellipse(1195, 500, 190, 150, 0, 0, 7); x.fill();
    const blob = (cx, cy, rx, ry, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, rx, ry, .3, 0, 7); x.fill(); };
    blob(1170, 490, 95, 60, '#b45309'); blob(1220, 470, 60, 38, '#ea580c'); blob(1130, 530, 40, 26, '#4d7c0f'); blob(1250, 530, 34, 22, '#65a30d'); blob(1185, 445, 26, 16, '#fde68a');
    for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(1090 + (i * 53) % 220, 430 + (i * 37) % 140, 3, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `600 19px ${I}`; x.fillText('Octopus · smoked paprika · charred greens', 900, 870);
    x.restore();
    // booking widget
    const bk = S === SL ? st.site.booked : 0, bt = ease((now() - st.site.bookedAt) / .5);
    x.save(); x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 40; x.shadowOffsetY = 16; rp(x, 720, 640, 440, 270, 28); x.fillStyle = '#fff'; x.fill(); x.restore();
    x.fillStyle = '#1b1712'; x.font = `800 30px ${D}`; x.fillText(bk ? 'You’re booked' : 'Reserve', 752, 694);
    if (!bk) {
      [['Fri 21', 752], ['20:00', 886], ['4 guests', 1000]].forEach(([s, px]) => { rp(x, px, 716, s.length > 6 ? 130 : 118, 50, 25); x.fillStyle = '#f1ebe1'; x.fill(); x.fillStyle = '#1b1712'; x.font = `600 20px ${I}`; x.fillText(s, px + 20, 748); });
      const hc = hotHit(S, 'confirm', 752, 790, 376, 76); rp(x, 752, 790, 376, 76, 38); x.fillStyle = hc ? '#9a3412' : '#c2410c'; x.fill(); x.fillStyle = '#fff'; x.font = `600 25px ${I}`; x.fillText('Confirm booking', 850, 838);
    } else {
      x.globalAlpha = bt; x.fillStyle = '#16a34a'; x.beginPath(); x.arc(790, 770, 34, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(774, 770); x.lineTo(786, 783); x.lineTo(808, 758); x.stroke();
      x.fillStyle = '#1b1712'; x.font = `600 23px ${I}`; x.fillText('Fri 21 · 20:00 · 4 guests', 840, 762); x.fillStyle = '#6b6258'; x.font = `400 19px ${I}`; x.fillText('Confirmation sent on WhatsApp ✓', 840, 792);
      x.fillStyle = '#6b6258'; x.fillText('Added to the CRM automatically', 752, 870); x.globalAlpha = 1;
    }
  }

  // ---- CRM
  const COLX = [130, 400, 670, 940], COLN = ['Request', 'Confirmed', 'Seated', 'Review asked'];
  function drawCRM(x, S, t) {
    const W = 1600, H = 1000, C = st.crm;
    x.fillStyle = '#0a0e17'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#05070d'; x.fillRect(0, 0, 92, H);
    [0, 1, 2, 3, 4].forEach(i => { rp(x, 26, 40 + i * 70, 40, 40, 11); x.fillStyle = i === 0 ? '#4d7cff' : '#182032'; x.fill(); });
    x.fillStyle = '#eef2fa'; x.font = `700 32px ${D}`; x.fillText('Casa Lume', 130, 78); x.fillStyle = '#707a8d'; x.font = `500 20px ${I}`; x.fillText('CRM · Tonight', 300, 76);
    rp(x, 1380, 46, 150, 44, 22); x.fillStyle = 'rgba(40,200,64,.14)'; x.fill(); x.fillStyle = '#7be08c'; x.font = `600 19px ${I}`; x.fillText('● AI on', 1418, 75);
    const kp = ease(C.kpiT);
    [['Bookings this week', Math.round(186 * kp), '+24%'], ['No-shows', Math.round(3 * kp), '−61%'], ['Google rating', (4.8 * kp).toFixed(1), '+0.4'], ['Revenue', '€' + (38.4 * kp).toFixed(1) + 'k', '+18%']].forEach((k, i) => {
      const px = 130 + i * 285; rp(x, px, 120, 265, 140, 18); x.fillStyle = '#0f1420'; x.fill(); x.strokeStyle = '#182032'; x.lineWidth = 2; x.stroke();
      x.fillStyle = '#838c9e'; x.font = `500 19px ${I}`; x.fillText(k[0], px + 22, 160); x.fillStyle = '#eef2fa'; x.font = `800 48px ${D}`; x.fillText(String(k[1]), px + 22, 226); x.fillStyle = '#7be08c'; x.font = `600 18px ${I}`; x.fillText(k[2], px + 22, 250);
    });
    COLN.forEach((n, ci) => { x.fillStyle = '#bfc7d4'; x.font = `600 19px ${I}`; x.fillText(n, COLX[ci], 318); x.fillStyle = '#565f72'; x.fillText(String(C.cols[ci].length), COLX[ci] + 220, 318); });
    const mv = C.moving, mp = mv ? ease((now() - mv.t0) / .55) : 1;
    C.cols.forEach((col, ci) => col.forEach((name, j) => {
      if (mv && mv.name === name && mp < 1) return;
      const px = COLX[ci], py = 338 + j * 112, h = hotHit(S, 'card:' + ci + ':' + j, px, py, 250, 98);
      rp(x, px, py, 250, 98, 14); x.fillStyle = h ? '#172030' : '#111725'; x.fill(); x.strokeStyle = ci === 3 ? 'rgba(40,200,64,.5)' : (h ? '#4d7cff' : '#1b2436'); x.lineWidth = 2; x.stroke();
      x.fillStyle = '#eef2fa'; x.font = `600 22px ${I}`; x.fillText(name, px + 20, py + 42); x.fillStyle = '#838c9e'; x.font = `400 18px ${I}`; x.fillText(C.det[name] || '', px + 20, py + 72);
      if (h) { x.fillStyle = '#4d7cff'; x.font = `600 16px ${I}`; x.fillText(ci < 3 ? 'Move →' : '✓', px + 180, py + 42); }
    }));
    if (mv && mp < 1) { const px = mv.fx + (mv.tx - mv.fx) * mp, py = mv.fy + (mv.ty - mv.fy) * mp - Math.sin(mp * Math.PI) * 40; x.save(); x.shadowColor = 'rgba(77,124,255,.5)'; x.shadowBlur = 30; rp(x, px, py, 250, 98, 14); x.fillStyle = '#4d7cff'; x.fill(); x.restore(); x.fillStyle = '#fff'; x.font = `600 22px ${I}`; x.fillText(mv.name, px + 20, py + 42); x.font = `400 18px ${I}`; x.fillText(C.det[mv.name] || '', px + 20, py + 72); }
    // AI panel + chart
    rp(x, 1220, 300, 330, 380, 18); x.fillStyle = '#0f1420'; x.fill(); x.strokeStyle = '#182032'; x.stroke();
    x.fillStyle = '#838c9e'; x.font = `600 16px ${I}`; x.fillText('AI ASSISTANT', 1244, 336);
    const bub = (y, txt, me) => { x.font = `400 18px ${I}`; const w = Math.min(290, x.measureText(txt).width + 32); const bx = me ? 1530 - w : 1244; rp(x, bx, y, w, 48, 16); x.fillStyle = me ? '#4d7cff' : '#182032'; x.fill(); x.fillStyle = '#fff'; x.fillText(txt, bx + 16, y + 31); };
    bub(356, 'Table for 4 on Friday?', false); bub(414, 'Booked — 20:00, terrace ✓', true); bub(472, 'It’s her birthday 🎂', false); bub(530, 'Noted. Dessert on us!', true);
    x.fillStyle = '#838c9e'; x.font = `600 16px ${I}`; x.fillText('COVERS · 7 DAYS', 1244, 616);
    x.strokeStyle = '#4d7cff'; x.lineWidth = 4; x.beginPath(); const pts = [40, 52, 46, 61, 70, 66, 84]; pts.forEach((v, i) => { const px = 1250 + i * 45, py = 668 - v * .45 * kp; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
    // automation strip
    rp(x, 130, 720, 1420, 80, 18); x.fillStyle = '#0e1320'; x.fill(); x.strokeStyle = '#182032'; x.stroke();
    ['⚡ Booking → WhatsApp confirmation', '⚡ Visit → review request', '⚡ Birthday → dessert offer'].forEach((s, i) => { x.fillStyle = '#cfd6e2'; x.font = `500 19px ${I}`; x.fillText(s, 160 + i * 470, 768); });
    // toast
    const ta = now() - C.toastAt;
    if (ta < 3.4) { const k = ta < .4 ? ease(ta / .4) : ta > 3 ? 1 - ease((ta - 3) / .4) : 1; x.globalAlpha = k; rp(x, 1110, 880 + (1 - k) * 30, 440, 76, 18); x.fillStyle = '#eef2fa'; x.fill(); x.fillStyle = '#4d7cff'; x.beginPath(); x.arc(1146, 918 + (1 - k) * 30, 8, 0, 7); x.fill(); x.fillStyle = '#0b0f19'; x.font = `600 20px ${I}`; x.fillText(C.toastTxt || 'New booking · Jo S. · Sun 12:30', 1170, 925 + (1 - k) * 30); x.globalAlpha = 1; }
  }

  // ---- app
  function drawApp(x, S, t) {
    const W = 560, H = 1160, A = st.app;
    x.clearRect(0, 0, W, H); x.save(); rp(x, 0, 0, W, H, 78); x.clip();
    x.fillStyle = '#080b13'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#eef2fa'; x.font = `600 24px ${I}`; x.fillText('9:41', 60, 62); x.fillRect(452, 46, 46, 20);
    rp(x, 200, 30, 160, 46, 23); x.fillStyle = '#000'; x.fill();
    x.fillStyle = '#838c9e'; x.font = `500 24px ${I}`; x.fillText('Good evening,', 40, 160); x.fillStyle = '#eef2fa'; x.font = `800 52px ${D}`; x.fillText('Sofia', 40, 218);
    const g = x.createLinearGradient(30, 250, 530, 560); g.addColorStop(0, '#3d6bff'); g.addColorStop(1, '#16b8d6'); rp(x, 30, 250, 500, 290, 36); x.fillStyle = g; x.fill();
    x.fillStyle = 'rgba(255,255,255,.8)'; x.font = `600 22px ${I}`; x.fillText('TONIGHT · 20:00', 62, 302); x.fillStyle = '#fff'; x.font = `800 46px ${D}`; x.fillText('Casa Lume', 62, 360); x.font = `500 24px ${I}`; x.fillText('Table for 4 · Terrace', 62, 400);
    const ck = A.checked, hk = hotHit(S, 'checkin', 62, 438, 436, 72); rp(x, 62, 438, 436, 72, 36); x.fillStyle = ck ? 'rgba(255,255,255,.22)' : (hk ? '#dbe6ff' : '#fff'); x.fill();
    x.fillStyle = ck ? '#fff' : '#2b55e0'; x.font = `700 25px ${I}`; x.fillText(ck ? '✓  Checked in — enjoy!' : 'Check in', ck ? 140 : 228, 483);
    x.fillStyle = '#eef2fa'; x.font = `700 28px ${D}`; x.fillText('Your rewards', 40, 610); x.fillStyle = '#838c9e'; x.font = `500 21px ${I}`; x.fillText((ck ? 8 : 7) + '/10 visits', 400, 610);
    for (let i = 0; i < 10; i++) { const on = i < (ck ? 8 : 7); x.beginPath(); x.arc(64 + i * 48, 660, 18, 0, 7); x.fillStyle = on ? '#4d7cff' : '#182032'; x.fill(); }
    [['Tasting menu', '7 courses · €65'], ['Wine pairing', 'Douro · Alentejo'], ['Birthday dessert 🎂', 'On the house']].forEach((r, i) => { const py = 720 + i * 104; rp(x, 30, py, 500, 88, 22); x.fillStyle = '#0f1420'; x.fill(); rp(x, 50, py + 18, 52, 52, 14); x.fillStyle = '#182032'; x.fill(); x.fillStyle = '#eef2fa'; x.font = `600 24px ${I}`; x.fillText(r[0], 124, py + 42); x.fillStyle = '#838c9e'; x.font = `400 20px ${I}`; x.fillText(r[1], 124, py + 70); });
    rp(x, 30, 1050, 500, 84, 42); x.fillStyle = '#0f1420'; x.fill(); [0, 1, 2, 3].forEach(i => { x.beginPath(); x.arc(100 + i * 120, 1092, 13, 0, 7); x.fillStyle = i === 0 ? '#4d7cff' : '#2f3a50'; x.fill(); });
    const pa = now() - A.pushAt;
    if (pa < 3.6) { const k = pa < .45 ? ease(pa / .45) : pa > 3.15 ? 1 - ease((pa - 3.15) / .45) : 1; const py = -110 + k * 200; rp(x, 20, py, 520, 100, 28); x.fillStyle = 'rgba(226,233,248,.97)'; x.fill(); rp(x, 40, py + 22, 56, 56, 14); x.fillStyle = '#4d7cff'; x.fill(); x.fillStyle = '#0b0f19'; x.font = `700 21px ${I}`; x.fillText('Casa Lume', 112, py + 44); x.font = `400 20px ${I}`; x.fillText('Your table is ready 🍷', 112, py + 72); }
    x.restore();
  }

  function drawCursor(x, S, big) {
    if (!S.cur) return;
    const { x: cx, y: cy } = S.cur;
    if (S === SP) { x.fillStyle = S.down ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(cx, cy, 30, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2; x.stroke(); return; }
    const s = big; x.save(); x.translate(cx, cy); x.scale(s, s);
    x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 26); x.lineTo(6.5, 20); x.lineTo(11, 30); x.lineTo(15, 28.5); x.lineTo(10.6, 18.8); x.lineTo(19, 18.6); x.closePath();
    x.fillStyle = '#111'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.restore();
  }

  function renderLaptop(t) {
    const S = SL, x = S.x; S.hot = [];
    const w = st.wipe < 1 ? ease(st.wipe) : 1;
    const draw = m => (m === 0 ? drawSite : drawCRM)(x, S, t);
    if (w < 1) { draw(st.lapFrom); x.save(); x.beginPath(); x.rect(0, 0, 1600 * w, 1000); x.clip(); draw(st.lap); x.restore(); x.fillStyle = 'rgba(77,124,255,.9)'; x.fillRect(1600 * w - 3, 0, 6, 1000); S.hot = S.hot.filter(() => false); }
    else draw(st.lap);
    drawCursor(x, S, 2.2);
    S.tex.needsUpdate = true;
  }
  function renderPhone(t) { const S = SP; S.hot = []; drawApp(S.x, S, t); drawCursor(S.x, S); S.tex.needsUpdate = true; }

  // ================================================================== devices
  const rig = new T.Group(); scene.add(rig);
  // laptop
  const laptop = new T.Group(); rig.add(laptop);
  const base = new T.Mesh(slab(3.2, 2.2, 0.1, 0.14, 0.035), metal); base.rotation.x = -Math.PI / 2; base.position.y = 0.05; laptop.add(base);
  {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 704; const x = c.getContext('2d');
    x.fillStyle = '#191f2c'; x.fillRect(0, 0, 1024, 704);
    for (let r = 0; r < 6; r++) for (let k = 0; k < 14; k++) { const kw = 58, gap = 8, ox = 46 + k * (kw + gap) + (r % 2) * 6; if (ox + kw > 980) continue; rp(x, ox, 60 + r * 52, kw, 44, 7); x.fillStyle = '#070a10'; x.fill(); }
    rp(x, 336, 410, 352, 230, 18); x.fillStyle = '#1f2534'; x.fill(); x.strokeStyle = '#283044'; x.lineWidth = 2; x.stroke();
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; tx.anisotropy = MAXANI;
    const deck = new T.Mesh(new T.PlaneGeometry(3.05, 2.08), new T.MeshPhysicalMaterial({ map: tx, metalness: .7, roughness: .45, envMapIntensity: .8 }));
    deck.rotation.x = -Math.PI / 2; deck.position.set(0, 0.1005, 0.02); laptop.add(deck);
  }
  const hinge = new T.Group(); hinge.position.set(0, 0.1, -1.08); laptop.add(hinge);
  const lid = new T.Mesh(slab(3.2, 2.08, 0.05, 0.14, 0.02), metal); lid.position.set(0, 1.04, 0); hinge.add(lid);
  const bezel = new T.Mesh(new T.ShapeGeometry(rrShape(3.12, 2.0, 0.11)), glassBlack); bezel.position.set(0, 1.04, 0.0262); hinge.add(bezel);
  const scrMatL = new T.MeshBasicMaterial({ map: SL.tex, toneMapped: false, color: 0x000000 });
  const screenL = new T.Mesh(new T.PlaneGeometry(2.96, 1.85), scrMatL); screenL.position.set(0, 1.07, 0.0268); hinge.add(screenL);
  const sheenL = new T.Mesh(new T.PlaneGeometry(2.96, 1.85), sheen); sheenL.position.set(0, 1.07, 0.0275); hinge.add(sheenL);
  const shL = new T.Mesh(new T.PlaneGeometry(5.2, 3.6), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .7 })); shL.rotation.x = -Math.PI / 2; shL.position.y = 0.002; laptop.add(shL);
  laptop.position.set(-0.45, 0, -0.2); laptop.rotation.y = 0.18;
  // phone
  const phone = new T.Group(); rig.add(phone);
  const pBody = new T.Mesh(slab(0.76, 1.56, 0.085, 0.13, 0.03), metalLight); phone.add(pBody);
  const pFront = new T.Mesh(new T.ShapeGeometry(rrShape(0.73, 1.53, 0.115)), glassBlack); pFront.position.z = 0.0428; phone.add(pFront);
  const scrMatP = new T.MeshBasicMaterial({ map: SP.tex, toneMapped: false, transparent: true, color: 0x000000 });
  const screenP = new T.Mesh(new T.PlaneGeometry(0.69, 1.43), scrMatP); screenP.position.z = 0.0434; phone.add(screenP);
  const sheenP = new T.Mesh(new T.ShapeGeometry(rrShape(0.69, 1.43, 0.1)), sheen); sheenP.position.z = 0.0438; phone.add(sheenP);
  const bump = new T.Mesh(slab(0.3, 0.3, 0.03, 0.08, 0.01), metalLight); bump.position.set(-0.17, 0.5, -0.055); phone.add(bump);
  const shP = new T.Mesh(new T.PlaneGeometry(1.4, 0.9), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .6 })); shP.rotation.x = -Math.PI / 2; shP.position.y = 0.002; rig.add(shP);

  // ================================================================== states + choreography
  const POSE = [
    { cam: [-0.5, 2.7, 8.9], tgt: [0.45, 0.85, 0.1], ph: [1.62, 0.8, 1.0, -0.55, -0.12, 0.0] },
    { cam: [1.2, 2.25, 7.2], tgt: [0.05, 1.0, -0.2], ph: [2.05, 0.8, 0.9, -0.6, -0.12, 0.0] },
    { cam: [2.5, 1.95, 6.2], tgt: [1.05, 1.0, 0.6], ph: [1.5, 1.1, 1.3, -0.32, -0.04, 0.05] }
  ];
  let cur = 0, cycleT = 0, userHold = 0, over = false;
  const HOLD = 7;
  const NAMES = [{ en: 'Websites', pt: 'Sites', da: 'Hjemmesider' }, { en: 'CRMs', pt: 'CRMs', da: 'CRM-systemer' }, { en: 'Apps', pt: 'Apps', da: 'Apps' }];
  const ui = document.createElement('div'); ui.className = 'mf-ui';
  ui.innerHTML = NAMES.map((n, i) => `<button type="button" data-i="${i}"><em>0${i + 1}</em><span data-en>${n.en}</span><span data-pt>${n.pt}</span><span data-da>${n.da}</span><i><b></b></i></button>`).join('');
  wrap.appendChild(ui);
  const btns = [...ui.querySelectorAll('button')];
  const touch = matchMedia('(hover:none)').matches;
  const hint = wrap.querySelector('.globe-hint');
  if (hint) hint.innerHTML = touch ? '<span data-en>Tap the screens — they work</span><span data-pt>Toque nos ecrãs — funcionam</span><span data-da>Tryk på skærmene — de virker</span>' : '<span data-en>Use the screens — they work</span><span data-pt>Use os ecrãs — funcionam</span><span data-da>Brug skærmene — de virker</span>';
  function setWord(i) { rots.forEach(r => [...r.children].forEach((s, j) => { if (j === i) { s.classList.remove('out'); s.classList.add('on'); } else if (s.classList.contains('on')) { s.classList.remove('on'); s.classList.add('out'); setTimeout(() => s.classList.remove('out'), 700); } })); }
  function goTo(i, user) {
    if (user) userHold = 14;
    if (i === cur) return;
    cur = i; cycleT = 0; setWord(i); btns.forEach((b, j) => b.classList.toggle('on', j === i));
    const lap = i === 0 ? 0 : 1;
    if (lap !== st.lap) { st.lapFrom = st.lap; st.lap = lap; st.wipe = 0; if (lap === 1) st.crm.kpiT = 0; }
    if (i === 2) st.app.pushAt = now() + 0.9;
  }
  btns.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.i, true)));

  // ================================================================== input: cursor inside the screens
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let hitScreen = null, mxs = 0, mys = 0;
  function pick(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([screenL, screenP, base, lid, pBody], false);
    if (!hits.length) return null;
    const h = hits[0]; if (h.object !== screenL && h.object !== screenP) return { blocked: true };
    const S = h.object === screenL ? SL : SP;
    return { S, x: h.uv.x * S.w, y: (1 - h.uv.y) * S.h };
  }
  function hotAt(S) { return S.cur ? S.hot.find(z => S.cur.x >= z.X && S.cur.x <= z.X + z.W && S.cur.y >= z.Y && S.cur.y <= z.Y + z.H) : null; }
  addEventListener('pointermove', e => {
    mxs = e.clientX / innerWidth - .5; mys = e.clientY / innerHeight - .5;
    const r = cv.getBoundingClientRect();
    const inside = e.target === cv && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const p = inside ? pick(e) : null;
    SL.cur = SP.cur = null;
    if (p && p.S) { p.S.cur = { x: p.x, y: p.y }; hitScreen = p.S; } else hitScreen = null;
    over = !!hitScreen;
    cv.classList.toggle('scr-hover', over);
  }, { passive: true });
  cv.addEventListener('pointerleave', () => { SL.cur = SP.cur = null; hitScreen = null; over = false; cv.classList.remove('scr-hover'); });
  cv.addEventListener('pointerdown', e => {
    const p = pick(e); if (!p || !p.S) return;
    p.S.cur = { x: p.x, y: p.y }; p.S.down = true; setTimeout(() => { p.S.down = false; }, 160);
    userHold = 14;
    const z = hotAt(p.S); if (!z) return;
    if (z.id === 'book' || z.id === 'navbook') { st.site.booked = 0; st.site.bookedAt = -9; }
    if (z.id === 'confirm') { st.site.booked = 1; st.site.bookedAt = now(); st.crm.cols[0].unshift('Jo S.'); if (st.crm.cols[0].length > 3) st.crm.cols[0].pop(); st.crm.toastAt = now() + .6; st.crm.toastTxt = 'New booking from the website · Jo S.'; }
    if (z.id.startsWith('card:')) {
      const [, ci, j] = z.id.split(':').map(Number);
      if (ci < 3) { const name = st.crm.cols[ci].splice(j, 1)[0]; st.crm.cols[ci + 1].push(name); if (st.crm.cols[ci + 1].length > 4) st.crm.cols[ci + 1].shift(); st.crm.moving = { name, t0: now(), fx: COLX[ci], fy: 338 + j * 112, tx: COLX[ci + 1], ty: 338 + (st.crm.cols[ci + 1].length - 1) * 112 }; if (ci + 1 === 3) { st.crm.toastAt = now() + .3; st.crm.toastTxt = 'Review request sent to ' + name + ' ✓'; } }
    }
    if (z.id === 'checkin') { st.app.checked = st.app.checked ? 0 : 1; st.app.checkedAt = now(); }
  });

  let scrollK = 0;
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); }, { passive: true });

  // ================================================================== sizing
  let W = 1, H = 1, wide = true;
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height)); wide = W > 1000;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = wide ? 30 : 34;
    if (wide) camera.setViewOffset(W, H, -W * 0.285, H * 0.03, W, H); else camera.setViewOffset(W, H, W * 0.02, H * 0.13, W, H);
    camera.updateProjectionMatrix();
    ui.classList.toggle('narrow', !wide);
  }
  size(); addEventListener('resize', size);
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ================================================================== loop
  const clock = new T.Clock();
  let t = 0, running = false, intro = reduce ? 1 : 0, lastL = 0, lastP = 0;
  const cpos = new T.Vector3(...POSE[0].cam), ctgt = new T.Vector3(...POSE[0].tgt), v3 = new T.Vector3(), v4 = new T.Vector3();
  cpos.add(new T.Vector3(1.5, 1.2, 3));
  const pp = POSE[0].ph.slice();
  function loop() { if (running) return; running = true; requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); }); }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt;
    if (intro < 1) intro = Math.min(1, intro + dt * 0.5);
    const ei = ease(intro);
    // timeline
    if (userHold > 0) userHold -= dt; else if (!reduce && intro >= 1) { cycleT += dt; if (cycleT > HOLD && !over) goTo((cur + 1) % 3); }
    btns.forEach((b, j) => { const k = j === cur ? (userHold > 0 ? 1 : Math.min(1, cycleT / HOLD)) : 0; b.querySelector('b').style.transform = `scaleX(${k})`; });
    if (st.wipe < 1) st.wipe = Math.min(1, st.wipe + dt / 0.9);
    st.crm.kpiT = Math.min(1, st.crm.kpiT + dt / 1.2);
    if (!reduce && t % 9 < dt && cur === 1) { st.crm.toastAt = now(); st.crm.toastTxt = 'New booking · Jo S. · Sun 12:30'; }
    if (!reduce && t % 10 < dt && cur === 2) st.app.pushAt = now();
    // lid opens, screens power on
    hinge.rotation.x = Math.PI / 2 * (1 - ease(intro * 1.4)) - 0.27 * ease(intro * 1.4);
    const pwr = ease((intro - 0.55) / 0.45);
    scrMatL.color.setScalar(pwr); scrMatP.color.setScalar(ease((intro - 0.7) / 0.3));
    // camera + phone choreography
    const P = POSE[cur], k = intro < 1 ? 0.04 : 0.045;
    v3.set(...P.cam); v3.x += mxs * 0.9; v3.y -= mys * 0.45; if (!wide) v3.sub(v4.set(...P.tgt)).multiplyScalar(0.98).add(v4.set(...P.tgt)).add(v4.set(0.12, 0.05, 0)); else v3.sub(v4.set(...P.tgt)).multiplyScalar(1.17).add(v4);
    cpos.lerp(v3, k); ctgt.lerp(v4.set(...P.tgt), k);
    camera.position.copy(cpos); camera.position.y += scrollK * 1.2; camera.lookAt(ctgt);
    for (let i = 0; i < 6; i++) pp[i] += (P.ph[i] - pp[i]) * 0.05;
    const fl = reduce ? 0 : Math.sin(t * 1.1) * 0.03 * (cur === 2 ? 1 : 0.3);
    phone.position.set(pp[0] + (1 - ei) * 1.5, pp[1] + fl, pp[2]); phone.rotation.set(pp[4], pp[3], pp[5]);
    shP.position.set(phone.position.x + 0.05, 0.002, phone.position.z + 0.12); shP.material.opacity = 0.6 * Math.max(0.2, 1 - (phone.position.y - 0.8) * 1.5);
    // screens: redraw at ~30fps when something moves, 4fps otherwise
    const tn = now(), animL = st.wipe < 1 || SL.cur || st.crm.kpiT < 1 || (st.crm.moving && tn - st.crm.moving.t0 < .6) || tn - st.crm.toastAt < 3.5 || tn - st.site.bookedAt < .6;
    if (tn - lastL > (animL ? 1 / 30 : .25)) { renderLaptop(t); lastL = tn; }
    const animP = SP.cur || tn - st.app.pushAt < 3.7 || tn - st.app.checkedAt < .4;
    if (tn - lastP > (animP ? 1 / 30 : .3)) { renderPhone(t); lastP = tn; }
    renderer.render(scene, camera);
  }
  const start = () => { renderLaptop(0); renderPhone(0); btns[0].classList.add('on'); setWord(0); loop(); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(start);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
