/* Vero — hero "real products" v2 (three r149).
   MacBook Pro 16″ + iPhone 18 Pro Max built procedurally (extruded slabs, physical materials, studio PMREM lighting).
   Screens: real client websites (desktop + mobile screenshots), niche CRMs and niche apps drawn live on canvas.
   Overview: auto-tour synced with the headline + "Now showing" caption; drag anywhere to spin the devices 360°.
   Click a device: the camera flies to its screen and a configurator opens (product · type of business · before/after).
   Falls back to the 2D globe without WebGL. Real screenshots need http(s); on file:// a drawn site is used instead. */
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
  cv.setAttribute('aria-label', 'MacBook Pro and iPhone showing our websites, CRMs and apps — drag to rotate, click to explore');
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
  const IMG_OK = location.protocol !== 'file:';
  const lang = () => document.documentElement.lang || 'en';
  const L = a => Array.isArray(a) ? (a[{ en: 0, pt: 1, da: 2 }[lang()] || 0] || a[0]) : a;
  const t3 = a => `<span data-en>${a[0]}</span><span data-pt>${a[1]}</span><span data-da>${a[2]}</span>`;

  // mobile: stage sits right under the headline
  const homeParent = wrap.parentNode, homeNext = wrap.nextSibling, mq = matchMedia('(max-width:1000px)');
  function placeStage() {
    const h1 = hero && hero.querySelector('.wrap h1');
    if (mq.matches && h1) { if (wrap.previousElementSibling !== h1) h1.after(wrap); wrap.classList.add('in-copy'); }
    else if (wrap.parentNode !== homeParent) { homeParent.insertBefore(wrap, homeNext); wrap.classList.remove('in-copy'); }
  }
  placeStage(); (mq.addEventListener ? mq.addEventListener('change', () => { placeStage(); setTimeout(() => dispatchEvent(new Event('resize')), 30); }) : mq.addListener(placeStage));
  const rots = hero ? [...hero.querySelectorAll('[data-rot]')] : [];
  rots.forEach(r => r.setAttribute('data-rot-ext', ''));
  const leads = hero ? [...hero.querySelectorAll('.lead-x .lx')] : [];

  // ================================================================== content
  const TYPES = [
    { k: 'rest', n: ['Restaurant', 'Restaurante', 'Restaurant'], site: 'obarradas', url: 'O Barradas', proj: 'O Barradas', where: ['Silves, Algarve', 'Silves, Algarve', 'Silves, Algarve'], crm: 'rest' },
    { k: 'estate', n: ['Real estate', 'Imobiliário', 'Ejendomme'], site: 'mercator', url: 'mercator.pt', proj: 'Mercator', where: ['Portugal', 'Portugal', 'Portugal'], old: 1, crm: 'estate' },
    { k: 'wed', n: ['Weddings & events', 'Casamentos e eventos', 'Bryllupper & events'], site: 'luxe-events', url: 'luxeeventsportugal.com', proj: 'Luxe Events Portugal', where: ['Algarve & Lisbon', 'Algarve e Lisboa', 'Algarve & Lissabon'], old: 1, crm: 'wed' },
    { k: 'arch', n: ['Architecture', 'Arquitetura', 'Arkitektur'], site: 'bespoke', url: 'bespokealgarve.com', proj: 'Bespoke Architects', where: ['Algarve', 'Algarve', 'Algarve'], old: 1, crm: 'trades' },
    { k: 'build', n: ['Construction', 'Construção', 'Byggeri'], site: 'manoloy', url: 'manoloy.pt', proj: 'Manoloy', where: ['Algarve', 'Algarve', 'Algarve'], crm: 'trades' },
    { k: 'fit', n: ['Fitness coaching', 'Coaching de fitness', 'Fitnesscoaching'], site: 'jd-coach', url: 'jdstrengthcoach.nl', proj: 'JD Strength Coach', where: ['Netherlands', 'Países Baixos', 'Holland'], crm: 'gym' },
    { k: 'rent', n: ['Café & bike rental', 'Café e aluguer de bicicletas', 'Café & cykeludlejning'], site: 'velochique', url: 'Velochique', proj: 'Velochique', where: null, crm: 'shop' }
  ];
  const APPS = {
    rest: { brand: 'Casa Lume', hi: ['Good evening,', 'Boa noite,', 'God aften,'], who: 'Sofia', k: ['TONIGHT · 20:00', 'HOJE · 20:00', 'I AFTEN · 20:00'], t: 'Casa Lume', s: ['Table for 4 · Terrace', 'Mesa para 4 · Esplanada', 'Bord til 4 · Terrasse'], cta: ['Check in', 'Fazer check-in', 'Tjek ind'], ok: ['Checked in — enjoy!', 'Check-in feito — bom apetite!', 'Tjekket ind — velbekomme!'], sec: ['Your rewards', 'As suas recompensas', 'Dine fordele'], prog: [7, 10, ['visits', 'visitas', 'besøg']], list: [[['Tasting menu', 'Menu de degustação', 'Smagsmenu'], ['7 courses · €65', '7 pratos · 65 €', '7 retter · 485 kr']], [['Wine pairing', 'Harmonização de vinhos', 'Vinmenu'], ['Douro · Alentejo', 'Douro · Alentejo', 'Douro · Alentejo']], [['Birthday dessert', 'Sobremesa de aniversário', 'Fødselsdagsdessert'], ['On the house', 'Oferta da casa', 'Huset giver']]] },
    estate: { brand: 'Mercator', hi: ['Welcome back,', 'Bem-vindo de volta,', 'Velkommen tilbage,'], who: 'Erik', k: ['SATURDAY · 10:00', 'SÁBADO · 10:00', 'LØRDAG · 10:00'], t: ['Viewing', 'Visita', 'Fremvisning'], s: ['Villa · Cascais · sea view', 'Moradia · Cascais · vista mar', 'Villa · Cascais · havudsigt'], cta: ['Get directions', 'Ver direções', 'Få rutevejledning'], ok: ['Route sent ✓', 'Roteiro enviado ✓', 'Rute sendt ✓'], sec: ['Saved homes', 'Imóveis guardados', 'Gemte boliger'], prog: [5, 8, ['shortlisted', 'selecionados', 'udvalgt']], list: [[['Villa · Carvoeiro', 'Moradia · Carvoeiro', 'Villa · Carvoeiro'], ['€1.2M · 4 bed · pool', '1,2 M€ · T4 · piscina', '1,2 mio. € · 4 vær. · pool']], [['Apartment · Parede', 'Apartamento · Parede', 'Lejlighed · Parede'], ['€498k · new build', '498 mil € · novo', '498.000 € · nybyg']], [['Price drop alert', 'Alerta de descida de preço', 'Prisfald'], ['Cascais T2 · −4%', 'Cascais T2 · −4%', 'Cascais 2 vær. · −4%']]] },
    wed: { brand: 'Luxe Events', hi: ['Hello,', 'Olá,', 'Hej,'], who: 'Ana & Rui', k: ['14 JUN 2027 · 16:00', '14 JUN 2027 · 16:00', '14. JUN 2027 · 16:00'], t: ['Your wedding', 'O vosso casamento', 'Jeres bryllup'], s: ['Quinta · 120 guests', 'Quinta · 120 convidados', 'Quinta · 120 gæster'], cta: ['Confirm menu', 'Confirmar menu', 'Bekræft menu'], ok: ['Menu confirmed ✓', 'Menu confirmado ✓', 'Menu bekræftet ✓'], sec: ['Planning progress', 'Progresso do planeamento', 'Planlægning'], prog: [8, 10, ['tasks', 'tarefas', 'opgaver']], list: [[['Menu tasting', 'Prova do menu', 'Menusmagning'], ['12 Mar · 18:00', '12 mar · 18:00', '12. mar · 18:00']], [['Final payment', 'Pagamento final', 'Slutbetaling'], ['Due 31 May', 'Até 31 mai', 'Senest 31. maj']], [['Seating plan', 'Plano de mesas', 'Bordplan'], ['96/120 placed', '96/120 sentados', '96/120 placeret']]] },
    trades: { brand: 'Manoloy', hi: ['Good morning,', 'Bom dia,', 'Godmorgen,'], who: 'Marta', k: ['TODAY · 09:00', 'HOJE · 09:00', 'I DAG · 09:00'], t: ['Bathroom remodel', 'Remodelação WC', 'Nyt badeværelse'], s: ['Crew B on site', 'Equipa B em obra', 'Hold B på stedet'], cta: ['Approve quote', 'Aprovar orçamento', 'Godkend tilbud'], ok: ['Quote approved ✓', 'Orçamento aprovado ✓', 'Tilbud godkendt ✓'], sec: ['Project progress', 'Progresso da obra', 'Projektets fremdrift'], prog: [6, 10, ['stages', 'fases', 'faser']], list: [[['Demolition', 'Demolição', 'Nedrivning'], ['Done ✓', 'Feito ✓', 'Færdig ✓']], [['Plumbing', 'Canalização', 'VVS'], ['In progress', 'Em curso', 'I gang']], [['Tiling', 'Azulejos', 'Fliser'], ['Starts Thursday', 'Começa quinta', 'Starter torsdag']]] },
    gym: { brand: 'JD Strength', hi: ['Ready,', 'Pronto,', 'Klar,'], who: 'Tom?', k: ['TOMORROW · 07:00', 'AMANHÃ · 07:00', 'I MORGEN · 07:00'], t: ['Strength block', 'Bloco de força', 'Styrkeblok'], s: ['Coach Jo · Studio 2', 'Coach Jo · Estúdio 2', 'Coach Jo · Studie 2'], cta: ['Check in', 'Fazer check-in', 'Tjek ind'], ok: ['Checked in ✓', 'Check-in feito ✓', 'Tjekket ind ✓'], sec: ['Weekly goal', 'Objetivo semanal', 'Ugens mål'], prog: [3, 4, ['sessions', 'treinos', 'træninger']], list: [[['Squat PR', 'Recorde de agachamento', 'Squat-rekord'], ['120 kg ↑', '120 kg ↑', '120 kg ↑']], [['Zone 2 cardio', 'Cardio zona 2', 'Zone 2-cardio'], ['3 × 40 min', '3 × 40 min', '3 × 40 min']], [['Recovery', 'Recuperação', 'Restitution'], ['Mobility · 15 min', 'Mobilidade · 15 min', 'Mobilitet · 15 min']]] },
    shop: { brand: 'Velochique', hi: ['Hi,', 'Olá,', 'Hej,'], who: 'Lena', k: ['TODAY · 10:30', 'HOJE · 10:30', 'I DAG · 10:30'], t: ['E-bike rental', 'Aluguer de e-bike', 'Elcykel-leje'], s: ['2 bikes · 4 hours', '2 bicicletas · 4 horas', '2 cykler · 4 timer'], cta: ['Unlock bike', 'Desbloquear bicicleta', 'Lås cyklen op'], ok: ['Bike unlocked ✓', 'Bicicleta desbloqueada ✓', 'Cykel låst op ✓'], sec: ['Ride stamps', 'Selos de passeio', 'Turstempler'], prog: [4, 6, ['rides', 'passeios', 'ture']], list: [[['Coastal route', 'Rota costeira', 'Kystrute'], ['28 km · easy', '28 km · fácil', '28 km · let']], [['Café stop', 'Paragem no café', 'Cafépause'], ['Free pastel de nata', 'Pastel de nata grátis', 'Gratis pastel de nata']], [['Return by', 'Devolver até', 'Aflever senest'], ['14:30', '14:30', '14:30']]] }
  };
  const PROD = [
    { k: 'web', w: ['Website', 'Site', 'Hjemmeside'], dev: 'laptop' },
    { k: 'crm', w: ['CRM', 'CRM', 'CRM'], dev: 'laptop' },
    { k: 'app', w: ['App', 'App', 'App'], dev: 'phone' }
  ];
  const FACTS = {
    web: [['Designed from a blank page — no templates', 'Desenhado de raiz — sem templates', 'Designet fra bunden — ingen skabeloner'], ['Multilingual, fast and SEO-ready', 'Multilíngue, rápido e pronto para SEO', 'Flersproget, hurtig og SEO-klar'], ['Bookings, forms and payments wired to the CRM', 'Reservas, formulários e pagamentos ligados ao CRM', 'Booking, formularer og betaling koblet til CRM']],
    crm: [['Your stages, fields and automations', 'As suas etapas, campos e automações', 'Dine trin, felter og automatiseringer'], ['WhatsApp, email & SMS in one inbox', 'WhatsApp, email e SMS numa só caixa', 'WhatsApp, e-mail & SMS i én indbakke'], ['An AI assistant that books and follows up', 'Um assistente AI que marca e faz follow-up', 'En AI-assistent, der booker og følger op']],
    app: [['iOS, Android & web from one codebase', 'iOS, Android e web com um só código', 'iOS, Android & web fra én kodebase'], ['Bookings, loyalty & push notifications', 'Reservas, fidelização e notificações', 'Booking, loyalitet & push-notifikationer'], ['Live sync with your CRM', 'Sincronização em tempo real com o CRM', 'Live-synk med dit CRM']]
  };

  // ================================================================== scene + studio light
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
  {
    const env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(30, 16, 30), new T.MeshBasicMaterial({ color: 0x07090f, side: T.BackSide })));
    const panel = (w, h, col, k, pos, look) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k), side: T.DoubleSide })); m.position.set(...pos); m.lookAt(...look); env.add(m); };
    panel(14, 6, '#ffffff', 3.0, [0, 7.5, 2], [0, 0, 0]);
    panel(3, 10, '#ffffff', 2.0, [-11, 3, 3], [0, 1, 0]);
    panel(3, 10, '#3d6bff', 2.6, [11, 3, -2], [0, 1, 0]);
    panel(10, 3, '#9fd8ff', 0.8, [0, 2, -12], [0, 1, 0]);
    const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.04).texture; pm.dispose();
  }
  const key = new T.DirectionalLight(0xffffff, 1.15); key.position.set(-3, 6, 4); scene.add(key);
  const rim = new T.DirectionalLight(0x5b8cff, 1.3); rim.position.set(5, 2, -4); scene.add(rim);
  scene.add(new T.AmbientLight(0xffffff, 0.14));

  // ================================================================== helpers
  function rrShape(w, h, r) { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function slab(w, h, d, r, b) { const g = new T.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(0.002, r - b)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 24 }); g.translate(0, 0, -(d - 2 * b) / 2); g.computeVertexNormals(); return g; }
  const spaceBlack = new T.MeshPhysicalMaterial({ color: 0x26282c, metalness: 1, roughness: 0.38, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.05 });
  const deepBlue = new T.MeshPhysicalMaterial({ color: 0x2a3754, metalness: 0.95, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.35, envMapIntensity: 1.25 });
  const glassBlack = new T.MeshPhysicalMaterial({ color: 0x020203, metalness: 0, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 });
  const sheen = new T.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.06, envMapIntensity: 1.4, depthWrite: false });
  const lensGlass = new T.MeshPhysicalMaterial({ color: 0x05070c, metalness: 0.2, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.8 });
  const shTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.33)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c); })();
  const makeScreen = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = MAXANI; tex.minFilter = T.LinearMipmapLinearFilter; return { c, x: c.getContext('2d'), tex, w, h, hot: [], cur: null, down: false }; };
  const SL = makeScreen(2048, 1324), SP = makeScreen(660, 1434);
  const D = "'Bricolage Grotesque',system-ui,sans-serif", I = "'Inter',system-ui,sans-serif";
  const rp = (x, X, Y, W, H, R) => { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); };
  const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
  const now = () => performance.now() / 1000;
  function hotHit(S, id, X, Y, W, H) { S.hot.push({ id, X, Y, W, H }); return S.cur && S.cur.x >= X && S.cur.x <= X + W && S.cur.y >= Y && S.cur.y <= Y + H; }

  // images (real client sites)
  const IMGS = {};
  function img(name) {
    if (!IMG_OK) return null;
    if (!IMGS[name]) { const im = new Image(); im.decoding = 'async'; im.onload = () => { dirtyL = dirtyP = true; }; im.src = 'img/work/' + name + '.jpg'; IMGS[name] = im; }
    const im = IMGS[name]; return im.complete && im.naturalWidth ? im : null;
  }
  function cover(x, im, X, Y, W, H) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; x.drawImage(im, X + (W - w) / 2, Y, w, h); }

  // ================================================================== state
  const st = { prod: 0, type: 1, before: false, wipe: 1, from: null, site: { booked: 0, bookedAt: -9 }, crm: {}, app: {}, toastAt: -9, pushAt: -9, kpiT: 0 };
  const crmState = k => st.crm[k] || (st.crm[k] = (() => { const N = (window.VERO_CRM_N || []).find(n => n.k === k); const c = N ? N.cards.map(x => x.slice()) : []; return { N, cols: [[c[0], c[1]], [c[2], c[3]], [c[4], c[5]], [c[6]]].map(a => a.filter(Boolean)), moving: null }; })());
  const appState = k => st.app[k] || (st.app[k] = { ok: 0, at: -9 });

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


  // ---- laptop: real website in a browser frame
  function drawWeb(x, S, t) {
    const W = S.w, H = S.h, ty = TYPES[st.type];
    x.fillStyle = '#16171b'; x.fillRect(0, 0, W, 64);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(40 + i * 30, 32, 9, 0, 7); x.fill(); });
    rp(x, W / 2 - 300, 14, 600, 36, 10); x.fillStyle = '#26272c'; x.fill();
    x.fillStyle = '#c9cdd6'; x.font = `500 21px ${I}`; x.textAlign = 'center'; x.fillText((st.before && ty.old ? '⟲  ' : '🔒  ') + ty.url, W / 2, 39); x.textAlign = 'left';
    const im = img((st.before && ty.old ? 'old-' : '') + ty.site);
    if (im) cover(x, im, 0, 64, W, H - 64);
    else if (!IMG_OK) { x.save(); x.translate(0, 64); x.scale(W / 1600, (H - 64) / 1000); drawSite(x, S, t); x.restore(); }
    else { x.fillStyle = '#0d0f14'; x.fillRect(0, 64, W, H - 64); }
    if (st.before && ty.old) { rp(x, 28, 92, 210, 50, 25); x.fillStyle = 'rgba(0,0,0,.72)'; x.fill(); x.fillStyle = '#fff'; x.font = `600 22px ${I}`; x.fillText(L(['Before Vero', 'Antes da Vero', 'Før Vero']), 50, 125); }
  }
  // ---- laptop: niche CRM (data from the CRM demo)
  const COLX = [150, 520, 890, 1260];
  const CTx = q => (window.VERO_CRM_TR ? window.VERO_CRM_TR(q) : q);
  function drawCRM(x, S, t) {
    const W = S.w, H = S.h, C = crmState(TYPES[st.type].crm), N = C.N; if (!N) { x.fillStyle = '#0b0f19'; x.fillRect(0, 0, W, H); return; }
    const E = a => L(a), CT = window.VERO_CRM_TR || (q => q);
    x.fillStyle = '#0b0f19'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#070a12'; x.fillRect(0, 0, 104, H);
    [0, 1, 2, 3, 4].forEach(i => { rp(x, 30, 44 + i * 82, 44, 44, 12); x.fillStyle = i === 0 ? '#4d7cff' : '#182032'; x.fill(); });
    x.fillStyle = '#eef2fa'; x.font = `700 42px ${D}`; x.fillText(E(N.biz), 150, 92); const bww = x.measureText(E(N.biz)).width;
    x.fillStyle = '#707a8d'; x.font = `500 24px ${I}`; x.fillText('·  CRM', 150 + bww + 18, 90);
    rp(x, W - 220, 52, 170, 52, 26); x.fillStyle = 'rgba(40,200,64,.14)'; x.fill(); x.fillStyle = '#7be08c'; x.font = `600 22px ${I}`; x.fillText(L(['● AI on', '● AI ativa', '● AI aktiv']), W - 182, 86);
    const kp = ease(st.kpiT);
    N.kpi.forEach((k, i) => {
      const px = 150 + i * 370, v = k[1], val = v % 1 ? (v * kp).toFixed(1) : Math.round(v * kp).toLocaleString('en-US');
      rp(x, px, 140, 350, 170, 20); x.fillStyle = '#111725'; x.fill(); x.strokeStyle = '#1b2436'; x.lineWidth = 2; x.stroke();
      x.fillStyle = '#868fa1'; x.font = `500 24px ${I}`; x.fillText(E(k[0]), px + 26, 186);
      x.fillStyle = '#eef2fa'; x.font = `800 70px ${D}`; x.fillText(val, px + 26, 270);
      const vw = x.measureText(val).width; x.fillStyle = /^[−-]/.test(k[2]) && !/no-show|risk/i.test(E(k[0])) ? '#ff8a7a' : '#7be08c'; x.font = `600 24px ${I}`; x.fillText(k[2], px + 36 + vw, 268);
    });
    N.st.forEach((s, ci) => { x.fillStyle = '#bfc7d4'; x.font = `600 24px ${I}`; x.fillText(E(s), COLX[ci], 372); x.fillStyle = '#565f72'; x.fillText(String(C.cols[ci].length), COLX[ci] + 320, 372); });
    const mv = C.moving, mp = mv ? ease((now() - mv.t0) / .55) : 1;
    C.cols.forEach((col, ci) => col.forEach((card, j) => {
      if (mv && mv.card === card && mp < 1) return;
      const px = COLX[ci], py = 396 + j * 132, h = hotHit(S, 'card:' + ci + ':' + j, px, py, 340, 116);
      rp(x, px, py, 340, 116, 16); x.fillStyle = h ? '#172030' : '#111725'; x.fill(); x.strokeStyle = ci === 3 ? 'rgba(40,200,64,.55)' : (h ? '#4d7cff' : '#1b2436'); x.lineWidth = 2.5; x.stroke();
      x.fillStyle = '#eef2fa'; x.font = `600 30px ${I}`; x.fillText(CT(card[0]), px + 24, py + 50); x.fillStyle = '#868fa1'; x.font = `400 24px ${I}`; x.fillText(CT(card[1]), px + 24, py + 88);
      if (h && ci < 3) { x.fillStyle = '#4d7cff'; x.font = `600 21px ${I}`; x.fillText(L(['Move →', 'Mover →', 'Flyt →']), px + 248, py + 48); }
    }));
    if (mv && mp < 1) { const px = mv.fx + (mv.tx - mv.fx) * mp, py = mv.fy + (mv.ty - mv.fy) * mp - Math.sin(mp * Math.PI) * 50; x.save(); x.shadowColor = 'rgba(77,124,255,.55)'; x.shadowBlur = 36; rp(x, px, py, 340, 116, 16); x.fillStyle = '#4d7cff'; x.fill(); x.restore(); x.fillStyle = '#fff'; x.font = `600 30px ${I}`; x.fillText(CT(mv.card[0]), px + 24, py + 50); x.font = `400 24px ${I}`; x.fillText(CT(mv.card[1]), px + 24, py + 88); }
    // AI panel
    rp(x, 1630, 340, 368, 560, 20); x.fillStyle = '#111725'; x.fill(); x.strokeStyle = '#1b2436'; x.stroke();
    x.fillStyle = '#868fa1'; x.font = `600 20px ${I}`; x.fillText(L(['AI ASSISTANT', 'ASSISTENTE AI', 'AI-ASSISTENT']), 1658, 384);
    const wrapTxt = (txt, maxW) => { x.font = `400 23px ${I}`; const ws = txt.split(' '), out = []; let line = ''; ws.forEach(w => { const tl = line ? line + ' ' + w : w; if (x.measureText(tl).width > maxW) { out.push(line); line = w; } else line = tl; }); if (line) out.push(line); return out; };
    let by = 410; [[E(N.chat[0]), false], [E(N.chat[1]), true]].forEach(([txt, me]) => { const ls = wrapTxt(txt, 270), h = ls.length * 32 + 26, bx = me ? 1658 + 30 : 1658; rp(x, bx, by, 300, h, 18); x.fillStyle = me ? '#4d7cff' : '#182032'; x.fill(); x.fillStyle = '#fff'; ls.forEach((l, i) => x.fillText(l, bx + 16, by + 38 + i * 32)); by += h + 16; });
    x.fillStyle = '#868fa1'; x.font = `600 20px ${I}`; x.fillText(L(['AUTOMATIONS', 'AUTOMAÇÕES', 'AUTOMATISERINGER']), 1658, Math.max(by + 30, 720));
    N.auto.forEach((a, i) => { const y = Math.max(by + 30, 720) + 40 + i * 50; x.fillStyle = '#4d7cff'; x.fillText('⚡', 1658, y); x.fillStyle = '#cfd6e2'; x.font = `500 20px ${I}`; const s2 = E(a); x.fillText(s2.length > 28 ? s2.slice(0, 27) + '…' : s2, 1690, y); x.font = `600 20px ${I}`; });
    // toast
    const ta = now() - st.toastAt;
    if (ta < 3.4) { const k = ta < .4 ? ease(ta / .4) : ta > 3 ? 1 - ease((ta - 3) / .4) : 1; x.globalAlpha = k; const tx = st.toastTxt ? L(st.toastTxt) : (L(['New lead · ', 'Novo contacto · ', 'Nyt lead · ']) + CT((N.cards[0] || ['', ''])[0])); x.font = `600 26px ${I}`; const tw = x.measureText(tx).width + 90; rp(x, 1580 - tw, 1180 + (1 - k) * 30, tw, 92, 20); x.fillStyle = '#eef2fa'; x.fill(); x.fillStyle = '#4d7cff'; x.beginPath(); x.arc(1580 - tw + 40, 1226 + (1 - k) * 30, 10, 0, 7); x.fill(); x.fillStyle = '#0b0f19'; x.fillText(tx, 1580 - tw + 64, 1235 + (1 - k) * 30); x.globalAlpha = 1; }
  }
  // ---- phone: niche app
  function drawApp(x, S, t) {
    const W = S.w, H = S.h, k = TYPES[st.type].crm, A = APPS[k], AS = appState(k);
    x.fillStyle = '#080b13'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#eef2fa'; x.font = `600 27px ${I}`; x.fillText('9:41', 66, 66); rp(x, 520, 48, 56, 24, 7); x.fill();
    x.fillStyle = '#868fa1'; x.font = `500 28px ${I}`; x.fillText(L(A.hi), 46, 190); x.fillStyle = '#eef2fa'; x.font = `800 60px ${D}`; x.fillText(A.who, 46, 256);
    const g = x.createLinearGradient(36, 290, 624, 640); g.addColorStop(0, '#3d6bff'); g.addColorStop(1, '#16b8d6'); rp(x, 36, 290, 588, 340, 40); x.fillStyle = g; x.fill();
    x.fillStyle = 'rgba(255,255,255,.82)'; x.font = `600 25px ${I}`; x.fillText(L(A.k), 74, 350); x.fillStyle = '#fff'; x.font = `800 52px ${D}`; x.fillText(L(A.t), 74, 418); x.font = `500 28px ${I}`; x.fillText(L(A.s), 74, 462);
    const hk = hotHit(S, 'cta', 74, 504, 512, 84); rp(x, 74, 504, 512, 84, 42); x.fillStyle = AS.ok ? 'rgba(255,255,255,.22)' : (hk ? '#dbe6ff' : '#fff'); x.fill();
    x.fillStyle = AS.ok ? '#fff' : '#2b55e0'; x.font = `700 28px ${I}`; x.textAlign = 'center'; x.fillText(AS.ok ? '✓  ' + L(A.ok).replace(/ ✓$/, '') : L(A.cta), 330, 556); x.textAlign = 'left';
    const pr = A.prog[0] + (AS.ok ? 1 : 0);
    x.fillStyle = '#eef2fa'; x.font = `700 32px ${D}`; x.fillText(L(A.sec), 46, 716); x.fillStyle = '#868fa1'; x.font = `500 24px ${I}`; x.textAlign = 'right'; x.fillText(Math.min(pr, A.prog[1]) + '/' + A.prog[1] + ' ' + L(A.prog[2]), 614, 716); x.textAlign = 'left';
    const n = A.prog[1], gap = (568 - 20) / n; for (let i = 0; i < n; i++) { x.beginPath(); x.arc(56 + 10 + i * gap + gap / 2 - 10, 772, Math.min(20, gap / 2 - 4), 0, 7); x.fillStyle = i < pr ? '#4d7cff' : '#182032'; x.fill(); }
    A.list.forEach((r, i) => { const py = 836 + i * 120; rp(x, 36, py, 588, 102, 26); x.fillStyle = '#0f1420'; x.fill(); rp(x, 60, py + 22, 58, 58, 16); x.fillStyle = '#182032'; x.fill(); x.fillStyle = '#eef2fa'; x.font = `600 28px ${I}`; x.fillText(L(r[0]), 142, py + 48); x.fillStyle = '#868fa1'; x.font = `400 24px ${I}`; x.fillText(L(r[1]), 142, py + 80); });
    rp(x, 36, 1236, 588, 96, 48); x.fillStyle = '#0f1420'; x.fill(); [0, 1, 2, 3].forEach(i => { x.beginPath(); x.arc(110 + i * 146, 1284, 15, 0, 7); x.fillStyle = i === 0 ? '#4d7cff' : '#2f3a50'; x.fill(); });
    const pa = now() - st.pushAt;
    if (pa < 3.6) { const kk = pa < .45 ? ease(pa / .45) : pa > 3.15 ? 1 - ease((pa - 3.15) / .45) : 1; const py = -120 + kk * 230; rp(x, 22, py, 616, 112, 32); x.fillStyle = 'rgba(238,242,250,.97)'; x.fill(); rp(x, 44, py + 24, 64, 64, 16); x.fillStyle = '#4d7cff'; x.fill(); x.fillStyle = '#0b0f19'; x.font = `700 24px ${I}`; x.fillText(A.brand, 126, py + 50); x.font = `400 23px ${I}`; x.fillText(L(A.list[0][0]) + ' · ' + L(A.list[0][1]), 126, py + 82); }
  }
  function drawPhoneWeb(x, S) { const ty = TYPES[st.type], im = img((st.before && ty.old ? 'old-' : '') + ty.site + '-m'); if (im) { x.fillStyle = '#000'; x.fillRect(0, 0, S.w, S.h); cover(x, im, 0, 0, S.w, S.h); } else drawApp(x, S, 0); }
  function cursor(x, S, big) {
    if (!S.cur || !focus) return;
    const { x: cx, y: cy } = S.cur;
    if (S === SP) { x.fillStyle = S.down ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(cx, cy, 34, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.5; x.stroke(); return; }
    x.save(); x.translate(cx, cy); x.scale(big, big); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 26); x.lineTo(6.5, 20); x.lineTo(11, 30); x.lineTo(15, 28.5); x.lineTo(10.6, 18.8); x.lineTo(19, 18.6); x.closePath(); x.fillStyle = '#111'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.restore();
  }
  function paintLaptop(t) {
    const S = SL, x = S.x; S.hot = [];
    const mode = st.prod === 0 ? 'web' : 'crm';
    const draw = m => (m === 'web' ? drawWeb : drawCRM)(x, S, t);
    if (st.wipe < 1 && st.from) { const w = ease(st.wipe); draw(st.from); x.save(); x.beginPath(); x.rect(0, 0, S.w * w, S.h); x.clip(); draw(mode); x.restore(); x.fillStyle = 'rgba(77,124,255,.9)'; x.fillRect(S.w * w - 3, 0, 6, S.h); S.hot = []; }
    else draw(mode);
    cursor(x, S, 2.6); S.tex.needsUpdate = true;
  }
  function paintPhone(t) {
    const S = SP, x = S.x; S.hot = [];
    x.clearRect(0, 0, S.w, S.h); x.save(); rp(x, 0, 0, S.w, S.h, 92); x.clip();
    if (st.prod === 0) drawPhoneWeb(x, S); else drawApp(x, S, t);
    rp(x, S.w / 2 - 96, 26, 192, 56, 28); x.fillStyle = '#000'; x.fill(); // dynamic island
    cursor(x, S); x.restore(); S.tex.needsUpdate = true;
  }

  // ================================================================== MacBook Pro 16″
  const rig = new T.Group(); scene.add(rig);
  const turn = new T.Group(); rig.add(turn);            // user rotation (360°)
  const laptop = new T.Group(); turn.add(laptop);
  const LW = 3.56, LD = 2.48, LT = 0.155;
  const base = new T.Mesh(slab(LW, LD, LT, 0.13, 0.03), spaceBlack); base.rotation.x = -Math.PI / 2; base.position.y = LT / 2; laptop.add(base);
  {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1428; const x = c.getContext('2d');
    x.fillStyle = '#2a2c30'; x.fillRect(0, 0, 2048, 1428);
    // speaker grilles
    x.fillStyle = '#16171a'; for (let gx of [70, 1890]) for (let r = 0; r < 46; r++) for (let q = 0; q < 6; q++) { x.beginPath(); x.arc(gx + q * 15, 120 + r * 15, 3.2, 0, 7); x.fill(); }
    // keyboard well + keys
    rp(x, 230, 90, 1588, 650, 16); x.fillStyle = '#1b1c1f'; x.fill();
    const rows = [[14, 70, 38], [14, 98, 96], [14, 98, 96], [13, 98, 96], [12, 98, 96], [10, 98, 96]];
    let ky = 108; rows.forEach((rw, ri) => { const n = rw[0], kh = ri === 0 ? 48 : 92, gap = 12; const kw = (1548 - gap * (n - 1)) / n; for (let k = 0; k < n; k++) { let w = kw; const kx = 250 + k * (kw + gap); if (ri === 5 && k === 4) w = kw * 3 + gap * 2; if (ri === 5 && (k === 5 || k === 6)) continue; rp(x, kx, ky, w, kh, 10); x.fillStyle = '#0a0a0c'; x.fill(); } ky += kh + gap; });
    rp(x, 1734, 108, 64, 48, 10); x.fillStyle = '#121316'; x.fill(); x.strokeStyle = '#3a3b40'; x.lineWidth = 2; x.stroke(); // Touch ID
    rp(x, 640, 800, 768, 520, 26); x.fillStyle = '#2e3034'; x.fill(); x.strokeStyle = '#3a3c41'; x.lineWidth = 2; x.stroke(); // trackpad
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; tx.anisotropy = MAXANI;
    const deck = new T.Mesh(new T.PlaneGeometry(LW - 0.06, LD - 0.06), new T.MeshPhysicalMaterial({ map: tx, metalness: .75, roughness: .42, envMapIntensity: .85 }));
    deck.rotation.x = -Math.PI / 2; deck.position.set(0, LT + 0.0006, 0); laptop.add(deck);
  }
  const hinge = new T.Group(); hinge.position.set(0, LT, -LD / 2 + 0.03); laptop.add(hinge);
  const hingeBar = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, LW - 0.5, 24), new T.MeshPhysicalMaterial({ color: 0x0b0b0d, metalness: .6, roughness: .5 })); hingeBar.rotation.z = Math.PI / 2; hinge.add(hingeBar);
  const LH = 2.44;
  const lid = new T.Mesh(slab(LW, LH, 0.06, 0.13, 0.022), spaceBlack); lid.position.set(0, LH / 2, 0); hinge.add(lid);
  const bezel = new T.Mesh(new T.ShapeGeometry(rrShape(LW - 0.05, LH - 0.05, 0.11)), glassBlack); bezel.position.set(0, LH / 2, 0.0302); hinge.add(bezel);
  const SW = 3.42, SH = 3.42 / (2048 / 1324);
  const scrMatL = new T.MeshBasicMaterial({ map: SL.tex, toneMapped: false, color: 0x000000 });
  const screenL = new T.Mesh(new T.PlaneGeometry(SW, SH), scrMatL); screenL.position.set(0, LH / 2 + 0.04, 0.0308); hinge.add(screenL);
  { const s = new T.Shape(), w = 0.36, h = 0.075, r = 0.03; s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, -h + r); s.quadraticCurveTo(w / 2, -h, w / 2 - r, -h); s.lineTo(-w / 2 + r, -h); s.quadraticCurveTo(-w / 2, -h, -w / 2, -h + r); s.closePath();
    const notch = new T.Mesh(new T.ShapeGeometry(s), new T.MeshBasicMaterial({ color: 0x000000 })); notch.position.set(0, LH / 2 + 0.04 + SH / 2 + 0.002, 0.0312); hinge.add(notch); }
  const sheenL = new T.Mesh(new T.PlaneGeometry(SW, SH), sheen); sheenL.position.set(0, LH / 2 + 0.04, 0.0316); hinge.add(sheenL);
  const shL = new T.Mesh(new T.PlaneGeometry(5.6, 3.8), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .7 })); shL.rotation.x = -Math.PI / 2; shL.position.y = 0.002; laptop.add(shL);
  laptop.position.set(-0.5, 0, -0.25); laptop.rotation.y = 0.16;

  // ================================================================== iPhone 18 Pro Max
  const phone = new T.Group(); turn.add(phone);
  const PW = 0.776, PH = 1.63, PT = 0.0875;
  const pBody = new T.Mesh(slab(PW, PH, PT, 0.125, 0.03), deepBlue); phone.add(pBody);
  const pFront = new T.Mesh(new T.ShapeGeometry(rrShape(PW - 0.02, PH - 0.02, 0.112)), glassBlack); pFront.position.z = PT / 2 + 0.0004; phone.add(pFront);
  const scrMatP = new T.MeshBasicMaterial({ map: SP.tex, toneMapped: false, transparent: true, color: 0x000000 });
  const SPW = PW - 0.05, SPH = SPW * (1434 / 660);
  const screenP = new T.Mesh(new T.PlaneGeometry(SPW, SPH), scrMatP); screenP.position.z = PT / 2 + 0.0009; phone.add(screenP);
  const sheenP = new T.Mesh(new T.ShapeGeometry(rrShape(SPW, SPH, 0.1)), sheen); sheenP.position.z = PT / 2 + 0.0013; phone.add(sheenP);
  // camera plateau (full-width bar) + lenses
  const plateau = new T.Mesh(slab(PW - 0.06, 0.29, 0.024, 0.075, 0.009), deepBlue); plateau.position.set(0, PH / 2 - 0.2, -PT / 2 - 0.011); phone.add(plateau);
  [[-0.2, 0.06], [-0.2, -0.07], [-0.07, -0.005]].forEach(([lx, ly]) => {
    const ring = new T.Mesh(new T.CylinderGeometry(0.058, 0.058, 0.02, 40), new T.MeshPhysicalMaterial({ color: 0x3a4664, metalness: 1, roughness: .25 })); ring.rotation.x = Math.PI / 2; ring.position.set(lx, PH / 2 - 0.2 + ly, -PT / 2 - 0.028); phone.add(ring);
    const lens = new T.Mesh(new T.CylinderGeometry(0.044, 0.044, 0.022, 40), lensGlass); lens.rotation.x = Math.PI / 2; lens.position.set(lx, PH / 2 - 0.2 + ly, -PT / 2 - 0.03); phone.add(lens);
  });
  { const fl = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.012, 24), new T.MeshPhysicalMaterial({ color: 0xf4efe0, roughness: .3 })); fl.rotation.x = Math.PI / 2; fl.position.set(0.2, PH / 2 - 0.15, -PT / 2 - 0.026); phone.add(fl); }
  // side buttons
  [[-1, 0.42, 0.07], [-1, 0.26, 0.13], [-1, 0.09, 0.13], [1, 0.28, 0.2], [1, -0.12, 0.1]].forEach(([side, y, h]) => { const b = new T.Mesh(slab(0.012, h, 0.03, 0.005, 0.003), deepBlue); b.rotation.y = Math.PI / 2; b.position.set(side * (PW / 2 + 0.004), y, 0); phone.add(b); });
  const shP = new T.Mesh(new T.PlaneGeometry(1.5, 0.95), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .6 })); shP.rotation.x = -Math.PI / 2; shP.position.y = 0.002; turn.add(shP);

  const LAPTOP_MESHES = [base, lid, bezel, screenL], PHONE_MESHES = [pBody, pFront, screenP, plateau];

  // ================================================================== poses
  const POSE = [
    { cam: [-0.6, 3.0, 10.6], tgt: [0.35, 0.75, 0.1], ph: [1.45, 0.86, 1.1, -0.55, -0.12, 0] },
    { cam: [1.6, 2.9, 10.4], tgt: [0.2, 0.6, -0.2], ph: [1.7, 0.86, 1.0, -0.6, -0.12, 0] },
    { cam: [3.0, 2.5, 9.0], tgt: [1.0, 0.7, 0.5], ph: [1.5, 1.18, 1.35, -0.3, -0.04, 0.05] }
  ];

  // ================================================================== UI: selector, caption, configurator
  const NAMES = [['Websites', 'Sites', 'Hjemmesider'], ['CRMs', 'CRMs', 'CRM-systemer'], ['Apps', 'Apps', 'Apps']];
  const ui = document.createElement('div'); ui.className = 'mf-ui';
  ui.innerHTML = NAMES.map((n, i) => `<button type="button" data-i="${i}"><em>0${i + 1}</em>${t3(n)}<i><b></b></i></button>`).join('');
  wrap.appendChild(ui);
  const btns = [...ui.querySelectorAll('button')];
  const cap = document.createElement('div'); cap.className = 'dv-cap'; cap.setAttribute('aria-live', 'polite'); wrap.appendChild(cap);
  const hint = wrap.querySelector('.globe-hint');
  const touch = matchMedia('(hover:none)').matches || navigator.maxTouchPoints > 0 && mq.matches;
  if (hint) hint.innerHTML = touch ? t3(['Tap a device to explore · swipe to rotate', 'Toque num dispositivo para explorar · deslize para rodar', 'Tryk på en enhed for at udforske · stryg for at dreje']) : t3(['Click a device to explore · drag to rotate 360°', 'Clique num dispositivo para explorar · arraste para rodar 360°', 'Klik på en enhed for at udforske · træk for at dreje 360°']);
  const cfg = document.createElement('aside'); cfg.className = 'dv-cfg'; cfg.setAttribute('aria-label', 'Configure the demo'); document.body.appendChild(cfg);
  const ICON = { rest: 'M7 3v8a2 2 0 0 0 2 2v8M11 3v6M7 9h4M17 3c-1.5 1-2 3-2 6s1 4 2 4v8', estate: 'M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5', wed: 'M8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM16 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', arch: 'M4 20h16M6 20V8l6-4 6 4v12M10 20v-6h4v6', build: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z', fit: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12', rent: 'M5 17a3 3 0 1 0 0-.01M19 17a3 3 0 1 0 0-.01M5 17l4-8h6l4 8M9 9l-1-3H6' };
  const svgI = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  function captionHTML() {
    const ty = TYPES[st.type], p = PROD[st.prod].k;
    const kick = [['Now showing · Website', 'Em exibição · Site', 'Vises nu · Hjemmeside'], ['Now showing · CRM', 'Em exibição · CRM', 'Vises nu · CRM'], ['Now showing · App', 'Em exibição · App', 'Vises nu · App']][st.prod];
    let title, sub;
    if (p === 'web') { title = ty.proj; sub = [ty.n[0] + (ty.where ? ' · ' + ty.where[0] : '') + ' — live client project', ty.n[1] + (ty.where ? ' · ' + ty.where[1] : '') + ' — projeto real de cliente', ty.n[2] + (ty.where ? ' · ' + ty.where[2] : '') + ' — rigtigt kundeprojekt']; }
    else if (p === 'crm') { title = [ty.n[0] + ' CRM', 'CRM · ' + ty.n[1], ty.n[2] + '-CRM']; sub = ['Pipeline, bookings and an AI assistant — built around how they work', 'Pipeline, marcações e assistente AI — à medida de como trabalham', 'Pipeline, booking og AI-assistent — bygget efter, hvordan de arbejder']; }
    else { const A = APPS[ty.crm]; title = A.brand + ' app'; sub = ['Bookings, loyalty and live updates — synced with the CRM', 'Reservas, fidelização e atualizações — sincronizadas com o CRM', 'Booking, loyalitet og live-opdateringer — synkroniseret med CRM']; }
    return `<span class="dc-k"><i></i>${t3(kick)}</span><b>${Array.isArray(title) ? t3(title) : title}</b><small>${t3(sub)}</small><button type="button" class="dc-go">${t3(['Configure', 'Personalizar', 'Tilpas'])} <span aria-hidden="true">→</span></button>`;
  }
  function setCaption(force) { const h = captionHTML(); if (!force && cap.dataset.h === h) return; cap.dataset.h = h; cap.classList.remove('on'); setTimeout(() => { cap.innerHTML = h; cap.querySelector('.dc-go').onclick = () => focusOn(PROD[st.prod].dev); cap.classList.add('on'); }, force ? 0 : 220); }
  function renderCfg() {
    const ty = TYPES[st.type], p = PROD[st.prod];
    cfg.innerHTML = `
      <div class="cf-h"><span>${t3(['Live configurator', 'Configurador ao vivo', 'Live-konfigurator'])}</span><b>${p.dev === 'phone' ? 'iPhone 18 Pro Max' : 'MacBook Pro 16″'}</b><button type="button" class="cf-x" aria-label="Close"><i></i></button></div>
      <div class="cf-seg">${PROD.map((q, i) => `<button type="button" data-p="${i}" class="${i === st.prod ? 'on' : ''}">${t3(q.w)}</button>`).join('')}</div>
      <small class="cf-l">${t3(['Type of business', 'Tipo de negócio', 'Type virksomhed'])}</small>
      <div class="cf-types">${TYPES.map((q, i) => `<button type="button" data-t="${i}" class="${i === st.type ? 'on' : ''}">${svgI(ICON[q.k])}<span>${t3(q.n)}</span></button>`).join('')}</div>
      ${p.k === 'web' && ty.old ? `<div class="cf-ba"><small class="cf-l">${t3(['This client’s site', 'O site deste cliente', 'Kundens side'])}</small><div class="cf-seg two"><button type="button" data-b="1" class="${st.before ? 'on' : ''}">${t3(['Before', 'Antes', 'Før'])}</button><button type="button" data-b="0" class="${!st.before ? 'on' : ''}">${t3(['After Vero', 'Depois da Vero', 'Efter Vero'])}</button></div></div>` : ''}
      <div class="cf-info"><b>${p.k === 'web' ? ty.proj : p.k === 'crm' ? t3([ty.n[0] + ' CRM', 'CRM · ' + ty.n[1], ty.n[2] + '-CRM']) : APPS[ty.crm].brand + ' app'}</b>
        <ul>${FACTS[p.k].map(f => `<li>${t3(f)}</li>`).join('')}</ul></div>
      <p class="cf-note"><b>${t3(['100% custom.', '100% à medida.', '100 % skræddersyet.'])}</b> ${t3(['Every screen is designed from a blank page for your business — colours, content, flows. Nothing comes from a template.', 'Cada ecrã é desenhado de raiz para o seu negócio — cores, conteúdos, fluxos. Nada vem de um template.', 'Hver skærm designes fra bunden til din virksomhed — farver, indhold, flows. Intet kommer fra en skabelon.'])}</p>
      <div class="cf-f"><a class="btn p" href="contact.html">${t3(['Design mine', 'Desenhar o meu', 'Design min'])} →</a>${focus === 'phone' ? '' : `<span class="cf-tip">${t3(['Tip: use the screen — it works', 'Dica: use o ecrã — funciona', 'Tip: brug skærmen — den virker'])}</span>`}</div>`;
    cfg.querySelector('.cf-x').onclick = unfocus;
    cfg.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { setProd(+b.dataset.p, true); focusOn(PROD[st.prod].dev, true); });
    cfg.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { setType(+b.dataset.t); renderCfg(); });
    cfg.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { st.before = b.dataset.b === '1'; dirtyL = dirtyP = true; renderCfg(); });
  }
  new MutationObserver(() => { setCaption(true); if (focus) renderCfg(); dirtyL = dirtyP = true; }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function setWord(i) {
    rots.forEach(r => [...r.children].forEach((s, j) => { if (j === i) { s.classList.remove('out'); s.classList.add('on'); } else if (s.classList.contains('on')) { s.classList.remove('on'); s.classList.add('out'); setTimeout(() => s.classList.remove('out'), 700); } }));
    leads.forEach((l, j) => l.classList.toggle('on', j === i));
  }
  let cycleT = 0, userHold = 0;
  function setProd(i, user) {
    if (user) userHold = 16;
    const prevMode = st.prod === 0 ? 'web' : 'crm', nextMode = i === 0 ? 'web' : 'crm';
    if (i === st.prod) return;
    if (prevMode !== nextMode) { st.from = prevMode; st.wipe = 0; }
    if (nextMode === 'crm') st.kpiT = 0;
    st.prod = i; cycleT = 0; setWord(i); btns.forEach((b, j) => b.classList.toggle('on', j === i));
    if (i === 2) st.pushAt = now() + 1; if (i === 1) { st.toastAt = now() + 1.2; st.toastTxt = null; }
    dirtyL = dirtyP = true; setCaption();
  }
  function setType(i) { st.type = i; st.before = false; st.kpiT = 0; st.wipe = 0; st.from = st.prod === 0 ? 'web' : 'crm'; dirtyL = dirtyP = true; setCaption(); TYPES.forEach(q => { img(q.site); img(q.site + '-m'); }); }
  btns.forEach(b => b.addEventListener('click', () => setProd(+b.dataset.i, true)));

  // ================================================================== focus (zoom + configurator)
  let focus = null;
  function focusOn(dev, keep) {
    focus = dev; userHold = 30; wrap.classList.add('dv-focus'); document.documentElement.classList.add('dv-open');
    if (!keep) { if (dev === 'phone' && st.prod !== 2) setProd(2, true); if (dev === 'laptop' && st.prod === 2) setProd(0, true); }
    renderCfg(); cfg.classList.add('on');
    if (mq.matches) { const r = wrap.getBoundingClientRect(); scrollTo({ top: scrollY + r.top - 70, behavior: 'smooth' }); }
  }
  function unfocus() { focus = null; wrap.classList.remove('dv-focus'); document.documentElement.classList.remove('dv-open'); cfg.classList.remove('on'); SL.cur = SP.cur = null; dirtyL = dirtyP = true; }
  addEventListener('keydown', e => { if (e.key === 'Escape' && focus) unfocus(); });

  // ================================================================== input: drag to spin, click to focus, cursor inside screens
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let down = null, dragging = false, yaw = 0, pitch = 0, vYaw = 0, vPitch = 0, idle = 99, mxs = 0, mys = 0;
  function cast(e) {
    const b = cv.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects([...LAPTOP_MESHES, ...PHONE_MESHES], false)[0];
    if (!h) return null;
    const dev = LAPTOP_MESHES.includes(h.object) ? 'laptop' : 'phone';
    const S = h.object === screenL ? SL : h.object === screenP ? SP : null;
    return { dev, S, x: S ? h.uv.x * S.w : 0, y: S ? (1 - h.uv.y) * S.h : 0 };
  }
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; dragging = false; vYaw = vPitch = 0; });
  addEventListener('pointermove', e => {
    mxs = e.clientX / innerWidth - .5; mys = e.clientY / innerHeight - .5;
    if (down) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragging && Math.hypot(dx, dy) > 7) { dragging = true; cv.classList.add('spin'); try { cv.setPointerCapture(e.pointerId); } catch (_) {} }
      if (dragging) { vYaw = (e.clientX - (down.lx ?? down.x)) * 0.009; vPitch = (e.clientY - (down.ly ?? down.y)) * 0.004; yaw += vYaw; pitch = Math.max(-0.35, Math.min(0.45, pitch + vPitch)); down.lx = e.clientX; down.ly = e.clientY; idle = 0; userHold = Math.max(userHold, 8); }
      return;
    }
    if (e.target !== cv) { if (SL.cur || SP.cur) { SL.cur = SP.cur = null; dirtyL = dirtyP = true; } cv.classList.remove('hov', 'scr'); return; }
    const h = cast(e);
    SL.cur = SP.cur = null;
    if (h && h.S && focus) { h.S.cur = { x: h.x, y: h.y }; dirtyL = dirtyP = true; }
    cv.classList.toggle('hov', !!h && !focus); cv.classList.toggle('scr', !!(h && h.S && focus));
  }, { passive: true });
  addEventListener('pointerup', e => {
    if (!down) return;
    const wasDrag = dragging; down = null; dragging = false; cv.classList.remove('spin');
    if (wasDrag || e.target !== cv) return;
    const h = cast(e);
    if (!h) { if (focus) unfocus(); return; }
    if (!focus || focus !== h.dev) { focusOn(h.dev); return; }
    if (h.S) {
      h.S.cur = { x: h.x, y: h.y }; h.S.down = true; setTimeout(() => { h.S.down = false; dirtyL = dirtyP = true; }, 160);
      const z = h.S.hot.find(q => h.x >= q.X && h.x <= q.X + q.W && h.y >= q.Y && h.y <= q.Y + q.H);
      if (z && z.id.startsWith('card:')) {
        const C = crmState(TYPES[st.type].crm), [, ci, j] = z.id.split(':').map(Number);
        if (ci < 3) { const card = C.cols[ci].splice(j, 1)[0]; C.cols[ci + 1].push(card); if (C.cols[ci + 1].length > 4) C.cols[ci + 1].shift(); C.moving = { card, t0: now(), fx: COLX[ci], fy: 396 + j * 132, tx: COLX[ci + 1], ty: 396 + (C.cols[ci + 1].length - 1) * 132 }; if (ci + 1 === 3) { st.toastAt = now() + .35; st.toastTxt = ['Done · review request sent to ' + CTx(card[0]) + ' ✓', 'Concluído · pedido de avaliação enviado a ' + CTx(card[0]) + ' ✓', 'Færdig · anmodning om anmeldelse sendt til ' + CTx(card[0]) + ' ✓']; } }
      }
      if (z && z.id === 'cta') { const AS = appState(TYPES[st.type].crm); AS.ok = AS.ok ? 0 : 1; AS.at = now(); }
      dirtyL = dirtyP = true;
    }
  });
  cv.addEventListener('pointerleave', () => { if (!down) { SL.cur = SP.cur = null; dirtyL = dirtyP = true; } });

  let scrollK = 0;
  addEventListener('scroll', () => { const h = hero ? hero.offsetHeight : innerHeight; scrollK = Math.max(0, Math.min(1, scrollY / h)); if (focus && scrollK > 0.55 && !mq.matches) unfocus(); }, { passive: true });

  // ================================================================== sizing
  let W = 1, H = 1, wide = true, voX = -0.285, voY = 0.03;
  function size() {
    const b = wrap.getBoundingClientRect();
    W = Math.max(1, Math.round(b.width)); H = Math.max(1, Math.round(b.height)); wide = W > 1000;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.fov = wide ? 30 : 34; camera.updateProjectionMatrix();
    ui.classList.toggle('narrow', !wide); cap.classList.toggle('narrow', !wide);
  }
  size(); addEventListener('resize', size);
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);

  // ================================================================== loop
  const clock = new T.Clock();
  let t = 0, running = false, intro = reduce ? 1 : 0, lastL = 0, lastP = 0, dirtyL = true, dirtyP = true;
  const cpos = new T.Vector3(1, 4, 13), ctgt = new T.Vector3(...POSE[0].tgt), v3 = new T.Vector3(), v4 = new T.Vector3(), nrm = new T.Vector3();
  const pp = POSE[0].ph.slice();
  function loop() { if (running) return; running = true; requestAnimationFrame(function f() { if (!visible || document.hidden) { running = false; return; } frame(); requestAnimationFrame(f); }); }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta()); t += dt; idle += dt;
    if (intro < 1) intro = Math.min(1, intro + dt * 0.5);
    const ei = ease(intro);
    // auto tour: product each 7 s, business type after a full round
    if (userHold > 0) userHold -= dt; else if (!reduce && intro >= 1 && !focus) { cycleT += dt; if (cycleT > 7) { if (st.prod === 2) { setType((st.type + 1) % TYPES.length); setProd(0); } else setProd(st.prod + 1); } }
    btns.forEach((b, j) => { b.querySelector('b').style.transform = `scaleX(${j === st.prod ? (userHold > 0 || focus ? 1 : Math.min(1, cycleT / 7)) : 0})`; });
    if (st.wipe < 1) { st.wipe = Math.min(1, st.wipe + dt / 0.85); dirtyL = dirtyP = true; }
    if (st.kpiT < 1) { st.kpiT = Math.min(1, st.kpiT + dt / 1.2); dirtyL = true; }
    if (!reduce && st.prod === 1 && t % 9 < dt) { st.toastAt = now(); st.toastTxt = null; }
    if (!reduce && st.prod === 2 && t % 10 < dt) st.pushAt = now();
    // lid + power-on
    hinge.rotation.x = Math.PI / 2 * (1 - ease(intro * 1.4)) - 0.27 * ease(intro * 1.4);
    scrMatL.color.setScalar(ease((intro - 0.55) / 0.45)); scrMatP.color.setScalar(ease((intro - 0.7) / 0.3));
    // user spin with inertia; drifts home when idle
    if (!dragging) { vYaw *= 0.93; vPitch *= 0.9; yaw += vYaw; pitch = Math.max(-0.35, Math.min(0.45, pitch + vPitch)); }
    if (focus || (idle > 5 && !dragging)) { const home = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2; yaw += (home - yaw) * (focus ? 0.08 : 0.02); pitch += (0 - pitch) * (focus ? 0.08 : 0.02); }
    turn.rotation.y = yaw; turn.rotation.x = pitch * 0.6;
    // phone choreography
    const P = POSE[st.prod];
    for (let i = 0; i < 6; i++) pp[i] += (P.ph[i] - pp[i]) * 0.05;
    const fl = reduce ? 0 : Math.sin(t * 1.1) * 0.03 * (st.prod === 2 ? 1 : 0.3);
    phone.position.set(pp[0] + (1 - ei) * 1.5, pp[1] + (focus ? 0 : fl), pp[2]); phone.rotation.set(pp[4], pp[3], focus === 'phone' ? 0 : pp[5]);
    shP.position.set(phone.position.x + 0.05, 0.002, phone.position.z + 0.12); shP.material.opacity = 0.6 * Math.max(0.2, 1 - (phone.position.y - 0.85) * 1.5);
    turn.updateMatrixWorld(true);
    // camera
    if (focus) {
      const scr = focus === 'phone' ? screenP : screenL, h = focus === 'phone' ? SPH : SH;
      scr.getWorldPosition(v4); scr.getWorldDirection(nrm);
      const tv = Math.tan(camera.fov * Math.PI / 360), w = focus === 'phone' ? SPW : SW;
      const dist = Math.max((h * (focus === 'phone' ? (wide ? 1.6 : 1.45) : (wide ? 1.3 : 1.25)) / 2) / tv, (w / 2) / (tv * camera.aspect * (wide ? 0.56 : 0.86)));
      v3.copy(v4).addScaledVector(nrm, dist); v3.x += mxs * 0.15; v3.y -= mys * 0.1;
      cpos.lerp(v3, 0.08); ctgt.lerp(v4, 0.1);
    } else {
      v3.set(...P.cam); v3.x += mxs * 0.9; v3.y -= mys * 0.45;
      if (!wide) v3.sub(v4.set(...P.tgt)).multiplyScalar(st.prod ? 1.14 : 1.02).add(v4.set(...P.tgt)).add(v4.set(st.prod ? -0.15 : 0.12, 0.05, 0));
      cpos.lerp(v3, intro < 1 ? 0.04 : 0.05); ctgt.lerp(v4.set(...P.tgt), intro < 1 ? 0.04 : 0.05);
    }
    camera.position.copy(cpos); if (!focus) camera.position.y += scrollK * 1.2; camera.lookAt(ctgt);
    const vxT = wide ? (focus ? 0.15 : -0.285) : (focus ? 0 : 0.02), vyT = wide ? 0.03 : (focus ? 0.2 : 0.2);
    voX += (vxT - voX) * 0.08; voY += (vyT - voY) * 0.08;
    camera.setViewOffset(W, H, voX * W, voY * H, W, H); camera.updateProjectionMatrix();
    // screens
    const tn = now(), C = st.prod === 1 ? crmState(TYPES[st.type].crm) : null;
    const animL = dirtyL || st.wipe < 1 || st.kpiT < 1 || (C && C.moving && tn - C.moving.t0 < .6) || tn - st.toastAt < 3.5;
    if (animL && tn - lastL > 1 / 30) { paintLaptop(t); lastL = tn; dirtyL = false; }
    const animP = dirtyP || tn - st.pushAt < 3.7;
    if (animP && tn - lastP > 1 / 30) { paintPhone(t); lastP = tn; dirtyP = false; }
    renderer.render(scene, camera);
  }
  const start = () => { setType(st.type); setWord(0); btns[0].classList.add('on'); setCaption(true); paintLaptop(0); paintPhone(0); loop(); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => setTimeout(start, 50));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
