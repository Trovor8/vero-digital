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
    const key = name.includes('/') ? name : 'work/' + name;
    if (!IMGS[key]) {
      let src = null;
      if (IMG_OK) src = 'img/' + key + '.jpg';
      else if (window.VERO_IMG_DATA) src = window.VERO_IMG_DATA[key];
      else { loadEmbedded(); return null; }
      if (!src) return null;
      const im = new Image(); im.decoding = 'async'; im.onload = () => { dirtyL = dirtyP = true; }; im.src = src; IMGS[key] = im;
    }
    const im = IMGS[key]; return im.complete && im.naturalWidth ? im : null;
  }
  let embedLoading = false;
  function loadEmbedded() { if (embedLoading) return; embedLoading = true; const sc = document.createElement('script'); sc.src = 'js/work-data.js'; sc.onload = () => { dirtyL = dirtyP = true; }; document.head.appendChild(sc); }
  function cover(x, im, X, Y, W, H) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; x.drawImage(im, X + (W - w) / 2, Y, w, h); }

  // ================================================================== state
  const st = { prod: 0, type: 1, before: false, wipe: 1, from: null, site: { booked: 0, bookedAt: -9 }, crm: {}, app: {}, toastAt: -9, pushAt: -9, kpiT: 0 };
  const crmState = k => st.crm[k] || (st.crm[k] = (() => { const N = (window.VERO_CRM_N || []).find(n => n.k === k); const c = N ? N.cards.map(x => x.slice()) : []; return { N, cols: [[c[0], c[1]], [c[2], c[3]], [c[4], c[5]], [c[6]]].map(a => a.filter(Boolean)), moving: null }; })());
  const appState = k => st.app[k] || (st.app[k] = { ok: 0, at: -9 });

  // ================================================================== laptop + phone: an interactive concept site per business (fictional brands)
  const SERIF = "'Fraunces',Georgia,serif";
  const WEB = {
    rest: { brand: 'Casa Lume', url: 'casalume.pt', serif: 1, bg: '#f4efe6', fg: '#1b1712', sub: '#6b6258', acc: '#c2410c', on: '#fff', card: '#ffffff', line: '#e6dccd', soft: '#efe7da',
      nav: [['Menu', 'Menu', 'Menu'], ['Story', 'História', 'Historie'], ['Events', 'Eventos', 'Events']], cta: ['Book', 'Reservar', 'Book'],
      eye: ['SEASONAL KITCHEN · LISBON', 'COZINHA DE ESTAÇÃO · LISBOA', 'SÆSONKØKKEN · LISSABON'],
      h: [['A table worth', 'crossing town for.'], ['Uma mesa que vale', 'atravessar a cidade.'], ['Et bord, der er', 'turen værd.']],
      sub: ['Portuguese cooking, wood fire and natural wine. Open tonight from 19:00.', 'Cozinha portuguesa, fogo de lenha e vinho natural. Aberto hoje a partir das 19:00.', 'Portugisisk køkken, brændeovn og naturvin. Åbent i aften fra 19:00.'] },
    estate: { brand: 'COSTA PRIME', url: 'costaprime.pt', serif: 0, track: 1, bg: '#0b1424', fg: '#f3efe4', sub: '#93a0b8', acc: '#d4af5a', on: '#0b1424', card: '#111d33', line: '#22324f', soft: '#16243f',
      nav: [['Buy', 'Comprar', 'Køb'], ['Sell', 'Vender', 'Sælg'], ['Regions', 'Regiões', 'Regioner']], cta: ['Valuation', 'Avaliação', 'Vurdering'],
      eye: ['LUXURY HOMES · CASCAIS & ALGARVE', 'CASAS DE LUXO · CASCAIS E ALGARVE', 'LUKSUSBOLIGER · CASCAIS & ALGARVE'],
      h: [['Find the house', 'the sea chose', 'for you.'], ['Encontre a casa', 'que o mar escolheu', 'para si.'], ['Find huset,', 'havet har valgt', 'til dig.']],
      sub: ['214 homes, matched to you by our AI. Viewings in your language.', '214 casas, escolhidas para si pela nossa AI. Visitas na sua língua.', '214 boliger, matchet til dig af vores AI. Fremvisning på dit sprog.'] },
    wed: { brand: 'Maré', url: 'mareweddings.com', serif: 1, italic: 1, bg: '#fbf3f1', fg: '#3a2530', sub: '#8f7480', acc: '#b85c7a', on: '#fff', card: '#ffffff', line: '#f0dcdc', soft: '#f7e6e4',
      nav: [['Venues', 'Espaços', 'Steder'], ['Stories', 'Histórias', 'Historier'], ['Journal', 'Journal', 'Journal']], cta: ['Enquire', 'Pedir proposta', 'Forespørg'],
      eye: ['WEDDINGS BY THE ATLANTIC', 'CASAMENTOS JUNTO AO ATLÂNTICO', 'BRYLLUPPER VED ATLANTERHAVET'],
      h: [['Your day,', 'beautifully', 'composed.'], ['O vosso dia,', 'desenhado ao', 'pormenor.'], ['Jeres dag,', 'smukt', 'komponeret.']],
      sub: ['Planning, design and production — one team from the first call to the last dance.', 'Planeamento, design e produção — uma equipa do primeiro contacto à última dança.', 'Planlægning, design og produktion — ét team fra første opkald til sidste dans.'] },
    arch: { brand: 'atelier norte', url: 'ateliernorte.pt', serif: 0, lower: 1, bg: '#f3f2ee', fg: '#121212', sub: '#6d6a63', acc: '#121212', on: '#fff', card: '#ffffff', line: '#e2dfd7', soft: '#e9e7e1',
      nav: [['Projects', 'Projetos', 'Projekter'], ['Studio', 'Estúdio', 'Studie'], ['Process', 'Processo', 'Proces']], cta: ['Start a project', 'Iniciar projeto', 'Start et projekt'],
      eye: ['ARCHITECTURE & INTERIORS · ALGARVE', 'ARQUITETURA E INTERIORES · ALGARVE', 'ARKITEKTUR & INTERIØR · ALGARVE'],
      h: [['Houses drawn', 'around the way', 'you live.'], ['Casas desenhadas', 'à volta da forma', 'como vive.'], ['Huse tegnet', 'omkring måden,', 'du lever på.']],
      sub: ['Villas, renovations and interiors — from the first sketch to the keys.', 'Moradias, remodelações e interiores — do primeiro esboço às chaves.', 'Villaer, renoveringer og interiør — fra første skitse til nøglerne.'] },
    build: { brand: 'SÓLIDO', url: 'solido.pt', serif: 0, track: 1, bg: '#111214', fg: '#f2f2f2', sub: '#8c8f96', acc: '#ffb020', on: '#111214', card: '#1a1c20', line: '#2a2d33', soft: '#222429',
      nav: [['Services', 'Serviços', 'Ydelser'], ['Projects', 'Obras', 'Projekter'], ['About', 'Empresa', 'Om os']], cta: ['Free quote', 'Orçamento grátis', 'Gratis tilbud'],
      eye: ['CONSTRUCTION & REMODELLING · SINCE 2008', 'CONSTRUÇÃO E REMODELAÇÃO · DESDE 2008', 'BYGGERI & RENOVERING · SIDEN 2008'],
      h: [['Built right.', 'On time.', 'On budget.'], ['Bem feito.', 'No prazo.', 'No orçamento.'], ['Bygget rigtigt.', 'Til tiden.', 'Til prisen.']],
      sub: ['One team for the whole job, a fixed price and a 2-year guarantee.', 'Uma equipa para a obra toda, preço fechado e 2 anos de garantia.', 'Ét hold til hele opgaven, fast pris og 2 års garanti.'] },
    fit: { brand: 'FORMA', url: 'formaclub.pt', serif: 0, track: 1, bg: '#0a0a0a', fg: '#ffffff', sub: '#8a8a8a', acc: '#c6f432', on: '#0a0a0a', card: '#151515', line: '#262626', soft: '#1d1d1d',
      nav: [['Courts', 'Campos', 'Baner'], ['Coaching', 'Treino', 'Træning'], ['Members', 'Sócios', 'Medlemmer']], cta: ['Join', 'Aderir', 'Bliv medlem'],
      eye: ['PADEL · STRENGTH · COACHING', 'PADEL · FORÇA · COACHING', 'PADEL · STYRKE · COACHING'],
      h: [['Train hard.', 'Play better.', 'Belong here.'], ['Treina forte.', 'Joga melhor.', 'Pertence aqui.'], ['Træn hårdt.', 'Spil bedre.', 'Hør til her.']],
      sub: ['6 courts, a strength studio and coaches who track every session.', '6 campos, estúdio de força e treinadores que acompanham cada sessão.', '6 baner, styrkestudie og trænere, der følger hver session.'] },
    rent: { brand: 'Ondas', url: 'ondas.bike', serif: 1, italic: 1, bg: '#eef8f5', fg: '#0f2a2a', sub: '#5f7d7b', acc: '#0d9488', on: '#fff', card: '#ffffff', line: '#d3ebe5', soft: '#e1f2ed',
      nav: [['Bikes', 'Bicicletas', 'Cykler'], ['Routes', 'Rotas', 'Ruter'], ['Café', 'Café', 'Café']], cta: ['Rent', 'Alugar', 'Lej'],
      eye: ['CAFÉ & E-BIKES · ALGARVE COAST', 'CAFÉ E E-BIKES · COSTA ALGARVIA', 'CAFÉ & ELCYKLER · ALGARVEKYSTEN'],
      h: [['Coffee first.', 'Then the', 'coast.'], ['Primeiro o café.', 'Depois, a', 'costa.'], ['Kaffe først.', 'Så', 'kysten.']],
      sub: ['E-bikes, helmets and a route on your phone — ready in 5 minutes.', 'E-bikes, capacetes e a rota no telemóvel — pronto em 5 minutos.', 'Elcykler, hjelme og ruten på din telefon — klar på 5 minutter.'] }
  };
  const WSt = {};
  const wst = k => WSt[k] || (WSt[k] = { a: 1, b: 1, n: k === 'wed' ? 120 : k === 'build' ? 12 : k === 'rent' ? 4 : 4, v: 0, done: 0, at: -9, fav: 0, touched: 0, stage: 2, route: 0 });
  const PROPS_W = [['estate/e1', 'Cascais', '€585,000', ['3 bed · 2 bath · 142 m² · garden', 'T3 · 2 WC · 142 m² · jardim', '3 vær. · 2 bad · 142 m² · have'], 96], ['estate/e2', 'Carvoeiro', '€1,200,000', ['4 bed · pool · sea view · 290 m²', 'T4 · piscina · vista mar · 290 m²', '4 vær. · pool · havudsigt · 290 m²'], 91], ['estate/e3', 'Lagoa', '€2,400,000', ['6 bed · 480 m² · 1.2 ha', 'T6 · 480 m² · 1,2 ha', '6 vær. · 480 m² · 1,2 ha'], 87]];
  // shared UI atoms -------------------------------------------------
  const ff = (C, w, s) => `${C.serif ? (C.italic ? 'italic ' : '') + '500' : w} ${s}px ${C.serif ? SERIF : D}`;
  function chips(x, S, C, id, X, Y, items, sel, h, fs) {
    h = h || 54; fs = fs || 21; let cx = X;
    items.forEach((it, i) => {
      const t = L(it); x.font = `600 ${fs}px ${I}`; const w = x.measureText(t).width + fs * 1.9, on = i === sel, hv = hotHit(S, `w:${id}:${i}`, cx, Y, w, h);
      rp(x, cx, Y, w, h, h / 2); x.fillStyle = on ? C.acc : hv ? C.soft : C.card; x.fill(); if (!on) { x.lineWidth = 2; x.strokeStyle = C.line; x.stroke(); }
      x.fillStyle = on ? C.on : C.fg; x.fillText(t, cx + fs * .95, Y + h / 2 + fs * .36); cx += w + 10;
    });
    return cx;
  }
  function stepper(x, S, C, id, X, Y, val, h) {
    h = h || 54;
    [[-1, X], [1, X + h + 96]].forEach(([d, bx]) => { const hv = hotHit(S, `w:${id}:${d > 0 ? 'p' : 'm'}`, bx, Y, h, h); x.beginPath(); x.arc(bx + h / 2, Y + h / 2, h / 2, 0, 7); x.fillStyle = hv ? C.soft : C.card; x.fill(); x.lineWidth = 2; x.strokeStyle = C.line; x.stroke(); x.strokeStyle = C.fg; x.lineWidth = 3; x.beginPath(); x.moveTo(bx + h / 2 - 9, Y + h / 2); x.lineTo(bx + h / 2 + 9, Y + h / 2); if (d > 0) { x.moveTo(bx + h / 2, Y + h / 2 - 9); x.lineTo(bx + h / 2, Y + h / 2 + 9); } x.stroke(); });
    x.fillStyle = C.fg; x.font = `700 28px ${I}`; x.textAlign = 'center'; x.fillText(val, X + h + 48, Y + h / 2 + 10); x.textAlign = 'left';
    return X + h * 2 + 96;
  }
  function wbtn(x, S, C, id, X, Y, W, H, label, done) {
    const hv = hotHit(S, `w:${id}`, X, Y, W, H); rp(x, X, Y, W, H, H / 2);
    x.fillStyle = done ? C.soft : C.acc; x.fill(); if (hv && !done) { x.fillStyle = 'rgba(255,255,255,.12)'; x.fill(); }
    x.fillStyle = done ? C.fg : C.on; x.font = `700 ${Math.round(H * .34)}px ${I}`; x.textAlign = 'center'; x.fillText(label, X + W / 2, Y + H / 2 + H * .12); x.textAlign = 'left';
  }
  function tryMe(x, S, C, X, Y, W, H) { // pulsing ring + bubble until the visitor taps something
    S.anim = true; const p = (now() % 1.6) / 1.6;
    x.save(); x.globalAlpha = (1 - p) * .9; x.lineWidth = 4; x.strokeStyle = C.acc; rp(x, X - p * 18, Y - p * 18, W + p * 36, H + p * 36, H / 2 + p * 18); x.stroke(); x.restore();
    const tx = L(['Try it — tap here', 'Experimente — toque aqui', 'Prøv — tryk her']); x.font = `700 20px ${I}`; const tw = x.measureText(tx).width + 36, bx = X + W - tw, by = Y - 64 - Math.sin(now() * 4) * 4;
    rp(x, bx, by, tw, 46, 23); x.fillStyle = C.fg; x.fill(); x.beginPath(); x.moveTo(bx + tw - 52, by + 46); x.lineTo(bx + tw - 38, by + 60); x.lineTo(bx + tw - 24, by + 46); x.fill(); x.fillStyle = C.bg; x.fillText(tx, bx + 18, by + 30);
  }
  function card(x, C, X, Y, W, H) { x.save(); x.shadowColor = 'rgba(0,0,0,.16)'; x.shadowBlur = 50; x.shadowOffsetY = 18; rp(x, X, Y, W, H, 30); x.fillStyle = C.card; x.fill(); x.restore(); if (C.card !== '#ffffff') { rp(x, X, Y, W, H, 30); x.lineWidth = 2; x.strokeStyle = C.line; x.stroke(); } }
  function wTitle(x, C, X, Y, t, right) { x.fillStyle = C.fg; x.font = ff(C, 700, 32); x.fillText(t, X, Y); if (right) { x.font = `500 19px ${I}`; x.fillStyle = C.sub; x.textAlign = 'right'; x.fillText(right, X + 10000, Y); x.textAlign = 'left'; } }
  function doneBlock(x, S, C, X, Y, W, l1, l2, id) {
    x.beginPath(); x.arc(X + 34, Y + 34, 34, 0, 7); x.fillStyle = '#16a34a'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(X + 18, Y + 35); x.lineTo(X + 30, Y + 47); x.lineTo(X + 52, Y + 22); x.stroke();
    x.fillStyle = C.fg; x.font = `700 26px ${I}`; x.fillText(l1, X + 90, Y + 28); x.fillStyle = C.sub; x.font = `400 21px ${I}`; x.fillText(l2, X + 90, Y + 62);
    const hv = hotHit(S, `w:${id}`, X, Y + 104, 240, 50); x.fillStyle = hv ? C.acc : C.sub; x.font = `600 20px ${I}`; x.fillText('↺  ' + L(['Start again', 'Recomeçar', 'Start forfra']), X, Y + 136);
  }
  // hero visuals ----------------------------------------------------
  function photo(x, name, X, Y, W, H, R) { x.save(); rp(x, X, Y, W, H, R); x.clip(); const im = img(name); if (im) cover(x, im, X, Y, W, H); else { x.fillStyle = '#20232a'; x.fillRect(X, Y, W, H); } x.restore(); }
  const MENU = [
    [['Starters', 'Entradas', 'Forretter'], [[['Grilled sardines, tomato water', 'Sardinha grelhada, água de tomate', 'Grillede sardiner, tomatvand'], 12], [['Clams Bulhão Pato', 'Amêijoas à Bulhão Pato', 'Muslinger Bulhão Pato'], 16], [['Bread, olive oil, cured butter', 'Pão, azeite, manteiga curada', 'Brød, olivenolie, smør'], 6], [['Tuna crudo, citrus, chilli', 'Atum cru, citrinos, malagueta', 'Rå tun, citrus, chili'], 15]]],
    [['Mains', 'Principais', 'Hovedretter'], [[['Octopus, smoked paprika, greens', 'Polvo, colorau fumado, verdes', 'Blæksprutte, røget paprika'], 26], [['Black pork, clams, coriander', 'Porco preto, amêijoas, coentros', 'Sort gris, muslinger, koriander'], 24], [['Catch of the day, wood fire', 'Peixe do dia, forno a lenha', 'Dagens fisk, brændeovn'], 29], [['Rice of wild mushrooms', 'Arroz de cogumelos', 'Ris med svampe'], 21]]],
    [['Desserts', 'Sobremesas', 'Desserter'], [[['Burnt custard tart, cinnamon', 'Pastel de nata, canela', 'Pastel de nata, kanel'], 7], [['Olive oil cake, figs', 'Bolo de azeite, figos', 'Olivenoliekage, figner'], 9], [['Chocolate, sea salt, port', 'Chocolate, flor de sal, Porto', 'Chokolade, havsalt, portvin'], 10], [['Cheese from the Serra', 'Queijo da Serra', 'Ost fra Serra'], 12]]]
  ];
  function visRest(x, S, C, X, Y, W, H, t, M, m) {
    x.save(); rp(x, X, Y, W, H, Math.min(W / 2, 420)); x.clip();
    const g = x.createLinearGradient(X, Y, X + W, Y + H); g.addColorStop(0, '#3a1d10'); g.addColorStop(1, '#a43a0e'); x.fillStyle = g; x.fillRect(X, Y, W, H);
    const lg = x.createRadialGradient(X + W * .75, Y + H * .1, 10, X + W * .75, Y + H * .1, W); lg.addColorStop(0, 'rgba(255,190,120,.5)'); lg.addColorStop(1, 'rgba(255,190,120,0)'); x.fillStyle = lg; x.fillRect(X, Y, W, H);
    x.restore();
    const sel = M.menu || 0, it = MENU[sel][1].slice(0, m ? 3 : 4), cw = W * (m ? .86 : .78), ch = m ? 300 : H * .56, cx = X + (W - cw) / 2, cy = Y + H - ch - (m ? 22 : H * .1);
    x.save(); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 40; x.shadowOffsetY = 20; rp(x, cx, cy, cw, ch, 8); x.fillStyle = '#f7f1e6'; x.fill(); x.restore();
    rp(x, cx + 14, cy + 14, cw - 28, ch - 28, 4); x.strokeStyle = '#d9c9ae'; x.lineWidth = 1.5; x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#9a3412'; x.font = `600 ${m ? 15 : 18}px ${I}`; x.fillText(L(['TONIGHT · FRIDAY', 'ESTA NOITE · SEXTA', 'I AFTEN · FREDAG']), cx + cw / 2, cy + (m ? 46 : 70));
    x.fillStyle = '#1b1712'; x.font = `italic 500 ${m ? 34 : 50}px ${SERIF}`; x.fillText(L(MENU[sel][0]), cx + cw / 2, cy + (m ? 90 : 134)); x.textAlign = 'left';
    const rh = (ch - (m ? 120 : 190)) / it.length;
    it.forEach((r, i) => { const yy = cy + (m ? 126 : 196) + i * rh + rh * .45, nm = L(r[0]); x.fillStyle = '#2a211a'; x.font = `500 ${m ? 19 : 25}px ${SERIF}`; x.fillText(nm, cx + 40, yy); const nw = x.measureText(nm).width; x.font = `600 ${m ? 17 : 21}px ${I}`; const pr = '€' + r[1]; const pw = x.measureText(pr).width; x.fillStyle = '#9a3412'; x.fillText(pr, cx + cw - 40 - pw, yy);
      x.fillStyle = '#c9b897'; for (let d = cx + 52 + nw; d < cx + cw - 52 - pw; d += 9) { x.beginPath(); x.arc(d, yy - 5, 1.4, 0, 7); x.fill(); } });
    let tx = X + W / 2; x.font = `600 ${m ? 17 : 20}px ${I}`; const tws = MENU.map(q => x.measureText(L(q[0])).width + (m ? 32 : 38)); tx -= (tws.reduce((a2, b2) => a2 + b2, 0) + 8 * 2) / 2;
    const ty2 = m ? Y + 26 : Y + H * .16, hh = m ? 46 : 54;
    MENU.forEach((q, i) => { const on = i === sel, hv = hotHit(S, `w:menu:${i}`, tx, ty2, tws[i], hh); rp(x, tx, ty2, tws[i], hh, hh / 2); x.fillStyle = on ? '#f7f1e6' : hv ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)'; x.fill(); x.fillStyle = on ? '#9a3412' : '#fff'; x.fillText(L(q[0]), tx + (m ? 16 : 19), ty2 + hh / 2 + 7); tx += tws[i] + 8; });
    if (!m) { x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `italic 500 34px ${SERIF}`; x.textAlign = 'center'; x.fillText(L(['Wood fire. Natural wine. Lisbon.', 'Fogo de lenha. Vinho natural. Lisboa.', 'Brændeovn. Naturvin. Lissabon.']), X + W / 2, Y + H * .1); x.textAlign = 'left'; }
  }
  function visWed(x, C, X, Y, W, H, t, m) {
    x.save(); rp(x, X, Y, W, H, 34); x.clip();
    const g = x.createLinearGradient(X, Y, X + W, Y + H); g.addColorStop(0, '#f3d3cc'); g.addColorStop(1, '#e7b9b4'); x.fillStyle = g; x.fillRect(X, Y, W, H);
    const lg = x.createRadialGradient(X + W * .2, Y + H * .15, 10, X + W * .2, Y + H * .15, W * .9); lg.addColorStop(0, 'rgba(255,250,240,.7)'); lg.addColorStop(1, 'rgba(255,250,240,0)'); x.fillStyle = lg; x.fillRect(X, Y, W, H);
    // botanical sprigs
    const sprig = (sx, sy, len, ang, sw) => { x.save(); x.translate(sx, sy); x.rotate(ang + Math.sin(t * .8 + sx) * .03); x.strokeStyle = 'rgba(96,120,92,.55)'; x.fillStyle = 'rgba(120,146,112,.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len); x.stroke(); for (let i = 1; i < 9; i++) { const yy = -len * i / 9, s2 = sw * (1 - i / 12); [-1, 1].forEach(d => { x.save(); x.translate(0, yy); x.rotate(d * .9); x.beginPath(); x.ellipse(0, -s2, s2 * .35, s2, 0, 0, 7); x.fill(); x.restore(); }); } x.restore(); };
    const k = Math.min(W, H) / 900; sprig(X + W * .08, Y + H * 1.02, 520 * k, .35, 34 * k); sprig(X + W * .95, Y + H * .05, 480 * k, Math.PI + .5, 30 * k); sprig(X + W * .9, Y + H * 1.05, 420 * k, -.3, 28 * k);
    // back card (RSVP) + invitation
    const cw = Math.min(W * .62, 520 * (m ? .82 : 1.05)), ch = cw * 1.35, cx = X + W / 2, cy = Y + H / 2 + (m ? 10 : 0), sc = m ? .62 : 1;
    const crd = (rot, dx, dy, w, h, fn) => { x.save(); x.translate(cx + dx, cy + dy); x.rotate(rot); x.shadowColor = 'rgba(90,40,50,.25)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#fffaf4'; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent'; x.strokeStyle = '#c9a66b'; x.lineWidth = 1.5; x.strokeRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32); fn(w, h); x.restore(); };
    crd(.09, cw * .32, -ch * .08, cw * .8, ch * .62, (w, h) => { x.textAlign = 'center'; x.fillStyle = '#b85c7a'; x.font = `600 ${15 * sc + 2}px ${I}`; x.fillText('RSVP', 0, -h * .18); x.fillStyle = '#3a2530'; x.font = `italic 500 ${30 * sc + 4}px ${SERIF}`; x.fillText(L(['Kindly reply', 'Responda, por favor', 'Svar venligst']), 0, -h * .02); x.font = `500 ${15 * sc + 3}px ${I}`; x.fillStyle = '#8f7480'; x.fillText(L(['by 1 May 2027', 'até 1 de maio de 2027', 'senest 1. maj 2027']), 0, h * .12); x.textAlign = 'left'; });
    crd(-.05, -cw * .12, ch * .04, cw, ch, (w, h) => { x.textAlign = 'center'; x.fillStyle = '#b85c7a'; x.font = `600 ${16 * sc + 3}px ${I}`; x.fillText(L(['SAVE THE DATE', 'RESERVE A DATA', 'SÆT KRYDS I KALENDEREN']), 0, -h * .28); x.fillStyle = '#3a2530'; x.font = `italic 500 ${74 * sc + 6}px ${SERIF}`; x.fillText('Ana', 0, -h * .1); x.font = `italic 500 ${44 * sc + 4}px ${SERIF}`; x.fillStyle = '#c9a66b'; x.fillText('&', 0, h * .0); x.fillStyle = '#3a2530'; x.font = `italic 500 ${74 * sc + 6}px ${SERIF}`; x.fillText('Rui', 0, h * .12);
      x.strokeStyle = '#c9a66b'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-w * .18, h * .2); x.lineTo(w * .18, h * .2); x.stroke(); x.fillStyle = '#3a2530'; x.font = `600 ${22 * sc + 4}px ${I}`; x.fillText('14 · 06 · 2027', 0, h * .29); x.fillStyle = '#8f7480'; x.font = `500 ${16 * sc + 3}px ${I}`; x.fillText('Quinta da Maré · Algarve', 0, h * .36); x.textAlign = 'left'; });
    x.restore();
  }
  function visRent(x, S, C, X, Y, W, H, t, M, m) {
    x.save(); rp(x, X, Y, W, H, 34); x.clip(); x.fillStyle = '#d7ece6'; x.fillRect(X, Y, W, H);
    x.fillStyle = '#8fd0e3'; x.beginPath(); x.moveTo(X, Y + H * .78); x.bezierCurveTo(X + W * .3, Y + H * .66, X + W * .6, Y + H * .92, X + W, Y + H * .72); x.lineTo(X + W, Y + H); x.lineTo(X, Y + H); x.fill();
    x.fillStyle = '#c6e5dc'; [[.2, .25, .12], [.72, .2, .16], [.5, .45, .1]].forEach(p => { x.beginPath(); x.ellipse(X + W * p[0], Y + H * p[1], W * p[2], H * p[2] * .8, 0, 0, 7); x.fill(); });
    x.strokeStyle = '#fff'; x.lineWidth = 8; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(X, Y + H * (.12 + i * .15)); x.lineTo(X + W, Y + H * (.05 + i * .17)); x.stroke(); }
    const R = [[[.12, .8], [.3, .55], [.55, .7], [.86, .62]], [[.12, .8], [.25, .35], [.5, .2], [.82, .3]], [[.4, .62], [.5, .5], [.62, .48], [.66, .6]]][M.route];
    x.strokeStyle = C.acc; x.lineWidth = 9; x.lineCap = 'round'; x.setLineDash([24, 14]); x.lineDashOffset = -t * 40; x.beginPath(); R.forEach((p, i) => i ? x.lineTo(X + W * p[0], Y + H * p[1]) : x.moveTo(X + W * p[0], Y + H * p[1])); x.stroke(); x.setLineDash([]); x.lineCap = 'butt';
    [[R[0], '#fb7185'], [R[R.length - 1], C.acc]].forEach(([p, c]) => { x.beginPath(); x.arc(X + W * p[0], Y + H * p[1], 20, 0, 7); x.fillStyle = c; x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke(); });
    x.restore(); S.anim = true;
    const rs = [['Coast · 18 km', 'Costa · 18 km', 'Kyst · 18 km'], ['Hills · 32 km', 'Serra · 32 km', 'Bakker · 32 km'], ['Old town · 9 km', 'Centro · 9 km', 'Gamleby · 9 km']];
    chips(x, S, C, 'route', X + 24, Y + 24, rs, M.route, m ? 48 : 54, m ? 18 : 20);
  }
  function visTabs(x, S, C, X, Y, W, H, M, opts, id, m) { // photo with overlay chips (dark glass)
    const o = opts[M[id] || 0]; photo(x, o[1], X, Y, W, H, 34);
    const g = x.createLinearGradient(0, Y + H * .55, 0, Y + H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); x.save(); rp(x, X, Y, W, H, 34); x.clip(); x.fillStyle = g; x.fillRect(X, Y, W, H); x.restore();
    let cx = X + 24; const h = m ? 46 : 52, fs = m ? 17 : 20;
    opts.forEach((op, i) => { const t = L(op[0]); x.font = `600 ${fs}px ${I}`; const w = x.measureText(t).width + fs * 1.8, on = (M[id] || 0) === i, hv = hotHit(S, `w:${id}:${i}`, cx, Y + 24, w, h); rp(x, cx, Y + 24, w, h, h / 2); x.fillStyle = on ? '#fff' : hv ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.42)'; x.fill(); x.fillStyle = on ? '#111' : '#fff'; x.fillText(t, cx + fs * .9, Y + 24 + h / 2 + fs * .36); cx += w + 8; });
    if (o[2]) { x.fillStyle = '#fff'; x.font = `600 ${m ? 19 : 22}px ${I}`; x.fillText(L(o[2]), X + 28, Y + H - 30); }
  }
  // widgets (each fits a ~612–840 × 420 card) -------------------------
  function wRest(x, S, C, X, Y, W, M) {
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['You’re booked!', 'Mesa reservada!', 'I er booket!']), [['Today', 'Hoje', 'I dag'], ['Fri 21', 'Sex 21', 'Fre 21'], ['Sat 22', 'Sáb 22', 'Lør 22']].map(L)[M.a] + ' · ' + ['19:30', '20:00', '21:30'][M.b] + ' · ' + M.n + ' ' + L(['guests', 'pessoas', 'gæster']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Reserve a table', 'Reservar mesa', 'Book et bord']));
    chips(x, S, C, 'a', X, Y + 70, [['Today', 'Hoje', 'I dag'], ['Fri 21', 'Sex 21', 'Fre 21'], ['Sat 22', 'Sáb 22', 'Lør 22']], M.a);
    chips(x, S, C, 'b', X, Y + 140, [['19:30'], ['20:00'], ['21:30']], M.b);
    const e = stepper(x, S, C, 'n', X, Y + 210, M.n); x.fillStyle = C.sub; x.font = `500 20px ${I}`; x.fillText(L(['guests', 'pessoas', 'gæster']), e + 16, Y + 245);
    x.fillStyle = '#16a34a'; x.beginPath(); x.arc(X + W - 200, Y + 237, 7, 0, 7); x.fill(); x.fillStyle = C.sub; x.fillText(L([(3 + M.b * 2) + ' tables left', 'restam ' + (3 + M.b * 2) + ' mesas', (3 + M.b * 2) + ' borde tilbage']), X + W - 184, Y + 244);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Confirm booking', 'Confirmar reserva', 'Bekræft booking']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  function wEstate(x, S, C, X, Y, W, M) {
    const p = PROPS_W[M.v];
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Viewing booked · Sat 10:00', 'Visita marcada · sáb 10:00', 'Fremvisning booket · lør 10:00']), p[1] + ' · ' + L(['details sent on WhatsApp', 'detalhes enviados no WhatsApp', 'detaljer sendt på WhatsApp']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Homes matched to you', 'Casas escolhidas para si', 'Boliger matchet til dig']));
    chips(x, S, C, 'v', X, Y + 70, PROPS_W.map(q => [q[1]]), M.v);
    x.fillStyle = C.acc; x.font = `600 19px ${I}`; x.fillText(p[4] + '% MATCH', X, Y + 176); x.fillStyle = C.fg; x.font = `700 44px ${D}`; x.fillText(p[2], X, Y + 226); x.fillStyle = C.sub; x.font = `400 21px ${I}`; x.fillText(L(p[3]), X, Y + 262);
    const fh = hotHit(S, 'w:fav', X + W - 70, Y + 170, 64, 64); x.beginPath(); x.arc(X + W - 38, Y + 202, 32, 0, 7); x.fillStyle = fh ? C.soft : C.card; x.fill(); x.lineWidth = 2; x.strokeStyle = C.line; x.stroke(); x.fillStyle = M.fav & (1 << M.v) ? C.acc : C.fg; x.font = `700 30px ${I}`; x.textAlign = 'center'; x.fillText(M.fav & (1 << M.v) ? '♥' : '♡', X + W - 38, Y + 213); x.textAlign = 'left';
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Book a viewing', 'Marcar visita', 'Book fremvisning']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  function wWed(x, S, C, X, Y, W, M) {
    const base = [9800, 14500, 26000][M.a], ph = [95, 120, 165][M.a], tot = base + ph * M.n;
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Proposal on its way', 'Proposta a caminho', 'Forslaget er på vej']), L(['A planner replies within 24 h', 'Uma planner responde em 24 h', 'En planner svarer inden for 24 t']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Plan your day', 'Planeie o vosso dia', 'Planlæg jeres dag']));
    chips(x, S, C, 'a', X, Y + 70, [['Intimate', 'Íntimo', 'Intim'], ['Classic', 'Clássico', 'Klassisk'], ['Grand', 'Grandioso', 'Storslået']], M.a);
    const e = stepper(x, S, C, 'n', X, Y + 150, M.n); x.fillStyle = C.sub; x.font = `500 20px ${I}`; x.fillText(L(['guests', 'convidados', 'gæster']), e + 16, Y + 185);
    x.fillStyle = C.sub; x.font = `500 19px ${I}`; x.fillText(L(['Estimate', 'Estimativa', 'Estimat']), X, Y + 248); x.fillStyle = C.fg; x.font = ff(C, 700, 46); x.fillText('€' + tot.toLocaleString('en-US'), X + 120, Y + 254);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Request a proposal', 'Pedir proposta', 'Bed om et forslag']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  const ARCH = [[['Exterior', 'Exterior', 'Facade'], [['Day', 'Dia', 'Dag'], ['Dusk', 'Entardecer', 'Skumring']], ['house/f', 'house/y']], [['Kitchen', 'Cozinha', 'Køkken'], [['Oak', 'Carvalho', 'Eg'], ['Navy', 'Azul', 'Marine'], ['Sage', 'Salva', 'Salvie']], ['house/k1', 'house/k2', 'house/k3']], [['Bathroom', 'Casa de banho', 'Bad'], [['Marble', 'Mármore', 'Marmor'], ['Walnut', 'Nogueira', 'Valnød']], ['house/b1', 'house/b2']]];
  function wArch(x, S, C, X, Y, W, M) {
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Thank you — talk soon', 'Obrigado — falamos já', 'Tak — vi tales ved']), L(['An architect calls you within a day', 'Um arquiteto liga-lhe num dia', 'En arkitekt ringer inden for en dag']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Villa Serra · 2025', 'Villa Serra · 2025', 'Villa Serra · 2025']));
    chips(x, S, C, 'a', X, Y + 70, ARCH.map(r => r[0]), M.a);
    x.fillStyle = C.sub; x.font = `500 19px ${I}`; x.fillText(L(['Try a finish', 'Experimente um acabamento', 'Prøv en finish']), X, Y + 172);
    const fin = ARCH[M.a][1]; if (M.b >= fin.length) M.b = 0;
    chips(x, S, C, 'b', X, Y + 190, fin, M.b, 50, 19);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Start your project', 'Iniciar o seu projeto', 'Start dit projekt']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  function wBuild(x, S, C, X, Y, W, M) {
    const per = [1350, 1100, 950][M.a], lo = Math.round(per * M.n * .9 / 100) * 100, hi = Math.round(per * M.n * 1.15 / 100) * 100, wk = Math.max(2, Math.round(M.n / [3, 3, 12][M.a]));
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Site visit booked · Tue 09:00', 'Visita marcada · ter 09:00', 'Besigtigelse booket · tir 09:00']), L(['Fixed quote within 48 h', 'Orçamento fechado em 48 h', 'Fast tilbud inden for 48 t']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Instant estimate', 'Estimativa imediata', 'Hurtigt estimat']));
    chips(x, S, C, 'a', X, Y + 70, [['Kitchen', 'Cozinha', 'Køkken'], ['Bathroom', 'Casa de banho', 'Bad'], ['Full home', 'Casa inteira', 'Hele huset']], M.a);
    const e = stepper(x, S, C, 'n', X, Y + 150, M.n + ' m²');
    x.fillStyle = C.sub; x.font = `500 19px ${I}`; x.fillText(L(['From', 'Desde', 'Fra']), X, Y + 248); x.fillStyle = C.acc; x.font = `800 44px ${D}`; x.fillText('€' + (lo / 1000).toFixed(1) + 'k – €' + (hi / 1000).toFixed(1) + 'k', X + 70, Y + 254);
    x.fillStyle = C.sub; x.font = `500 19px ${I}`; x.fillText('≈ ' + wk + ' ' + L(['weeks', 'semanas', 'uger']), Math.min(e + 20, X + W - 130), Y + 185);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Book a free site visit', 'Marcar visita gratuita', 'Book gratis besigtigelse']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  function wFit(x, S, C, X, Y, W, M) {
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Court booked · ', 'Campo reservado · ', 'Bane booket · ']) + ['08:00', '18:30', '20:00'][M.b], L(['Invites sent to 3 players', 'Convites enviados a 3 jogadores', 'Invitationer sendt til 3 spillere']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Book a court', 'Reservar campo', 'Book en bane']));
    chips(x, S, C, 'a', X, Y + 70, [['Court 1', 'Campo 1', 'Bane 1'], ['Court 2', 'Campo 2', 'Bane 2'], ['Court 3', 'Campo 3', 'Bane 3']], M.a);
    chips(x, S, C, 'b', X, Y + 140, [['08:00'], ['18:30'], ['20:00']], M.b);
    x.fillStyle = C.sub; x.font = `500 20px ${I}`; x.fillText(['2', '1', '3'][M.b] + ' ' + L(['slots left · 90 min · 4 players', 'vagas · 90 min · 4 jogadores', 'ledige · 90 min · 4 spillere']), X, Y + 250);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Book · €32', 'Reservar · 32 €', 'Book · 32 €']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  function wRent(x, S, C, X, Y, W, M) {
    const ph = [8, 15, 12][M.a], tot = ph * M.n * (M.b + 1);
    if (M.done) return doneBlock(x, S, C, X, Y + 120, W, L(['Bikes ready at 10:30', 'Bicicletas prontas às 10:30', 'Cykler klar kl. 10:30']), L(['Unlock code + route sent to your phone', 'Código + rota enviados para o telemóvel', 'Kode + rute sendt til din telefon']), 'reset');
    wTitle(x, C, X, Y + 40, L(['Rent a bike', 'Alugar bicicleta', 'Lej en cykel']));
    chips(x, S, C, 'a', X, Y + 70, [['City', 'Cidade', 'By'], ['E-bike', 'E-bike', 'Elcykel'], ['Gravel', 'Gravel', 'Gravel']], M.a);
    const e = stepper(x, S, C, 'n', X, Y + 150, M.n + ' h');
    chips(x, S, C, 'b', e + 20, Y + 150, [['1 ' + L(['bike', 'bicicleta', 'cykel'])], ['2'], ['3']], M.b, 54, 19);
    x.fillStyle = C.sub; x.font = `500 19px ${I}`; x.fillText(L([`€${ph}/h per bike · helmet & lock included`, `${ph} €/h por bicicleta · capacete e cadeado incluídos`, `${ph} €/t pr. cykel · hjelm & lås inkluderet`]), X, Y + 248);
    wbtn(x, S, C, 'go', X, Y + 300, W, 76, L(['Book bikes · €', 'Reservar · ', 'Book · ']) + tot + L(['', ' €', ' €']) + '  →');
    if (!M.touched) tryMe(x, S, C, X, Y + 300, W, 76);
  }
  const WIDGET = { rest: wRest, estate: wEstate, wed: wWed, arch: wArch, build: wBuild, fit: wFit, rent: wRent };
  function heroVisual(x, S, C, k, X, Y, W, H, t, M, m) {
    if (k === 'rest') visRest(x, S, C, X, Y, W, H, t, M, m);
    else if (k === 'wed') { visWed(x, C, X, Y, W, H, t, m); S.anim = true; }
    else if (k === 'rent') visRent(x, S, C, X, Y, W, H, t, M, m);
    else if (k === 'estate') { const p = PROPS_W[M.v]; photo(x, p[0], X, Y, W, H, 34); x.font = `600 21px ${I}`; const lw = x.measureText(p[1] + ' · ' + p[2]).width + 46; rp(x, X + 24, Y + H - 84, lw, 60, 30); x.fillStyle = 'rgba(11,20,36,.8)'; x.fill(); x.fillStyle = '#fff'; x.fillText(p[1] + ' · ' + p[2], X + 46, Y + H - 46); }
    else if (k === 'arch') { const r = ARCH[M.a]; photo(x, r[2][Math.min(M.b, r[2].length - 1)], X, Y, W, H, 4); }
    else if (k === 'build') visTabs(x, S, C, X, Y, W, H, M, [[['Plans', 'Projeto', 'Plan'], 'house/s1', ['Week 1 · 3D plans approved', 'Semana 1 · projeto 3D aprovado', 'Uge 1 · 3D-plan godkendt']], [['Structure', 'Estrutura', 'Råhus'], 'house/s2', ['Week 9 · structure done', 'Semana 9 · estrutura feita', 'Uge 9 · råhus færdigt']], [['Handover', 'Entrega', 'Aflevering'], 'house/s3', ['Week 26 · keys handed over', 'Semana 26 · chaves entregues', 'Uge 26 · nøgler afleveret']]], 'stage', m);
    else if (k === 'fit') { photo(x, ['padel/k1', 'padel/k2', 'padel/k3'][M.a], X, Y, W, H, 34); }
  }
  function drawConcept(x, S, t, m) {
    const ty = TYPES[st.type], k = ty.k, C = WEB[k], M = wst(k), W = S.w, oy = m ? 0 : 64, H = S.h - oy;
    x.fillStyle = C.bg; x.fillRect(0, oy, W, H);
    const brandF = C.serif ? `${C.italic ? 'italic ' : ''}500 ${m ? 36 : 44}px ${SERIF}` : `800 ${m ? 30 : 36}px ${D}`;
    const brand = (bx, by) => { x.fillStyle = C.fg; x.font = brandF; if (C.track) { let cx = bx; for (const ch of C.brand) { x.fillText(ch, cx, by); cx += x.measureText(ch).width + (m ? 4 : 6); } } else x.fillText(C.brand, bx, by); };
    if (!m) {
      brand(110, oy + 92);
      x.font = `500 22px ${I}`; x.fillStyle = C.sub; C.nav.forEach((n, i) => x.fillText(L(n), W - 860 + i * 160, oy + 88));
      x.font = `600 21px ${I}`; const cw = x.measureText(L(C.cta)).width + 56; rp(x, W - 110 - cw, oy + 52, cw, 60, 30); x.fillStyle = C.fg; x.fill(); x.fillStyle = C.bg; x.fillText(L(C.cta), W - 110 - cw + 28, oy + 89);
      const VX = 1080, VY = oy + 150, VW = W - VX - 90, VH = H - 200;
      heroVisual(x, S, C, k, VX, VY, VW, VH, t, M, 0);
      x.fillStyle = C.acc; x.font = `700 20px ${I}`; x.fillText(L(C.eye), 110, oy + 236);
      const hl = L(C.h), hs = hl.length > 2 ? 92 : 100; x.fillStyle = C.fg; x.font = C.serif ? `${C.italic ? 'italic ' : ''}500 ${hs + 6}px ${SERIF}` : `800 ${hs}px ${D}`; hl.forEach((l, i) => x.fillText(C.lower ? l.toLowerCase() : l, 104, oy + 330 + i * (hs + 6)));
      x.fillStyle = C.sub; x.font = `400 25px ${I}`; const sy = oy + 330 + hl.length * (hs + 6) + 6; wrapText(x, L(C.sub), 110, sy, 820, 36, 2);
      card(x, C, 90, oy + 768, 900, 440); WIDGET[k](x, S, C, 130, oy + 790, 820, M);
    } else {
      brand(40, 158);
      x.strokeStyle = C.fg; x.lineWidth = 3.5; for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(W - 92, 140 + i * 14); x.lineTo(W - 46, 140 + i * 14); x.stroke(); }
      heroVisual(x, S, C, k, 24, 196, W - 48, 430, t, M, 1);
      x.fillStyle = C.acc; x.font = `700 17px ${I}`; x.fillText(L(C.eye), 40, 680);
      const hl = L(C.h); x.fillStyle = C.fg; x.font = C.serif ? `${C.italic ? 'italic ' : ''}500 58px ${SERIF}` : `800 54px ${D}`; hl.forEach((l, i) => x.fillText(C.lower ? l.toLowerCase() : l, 36, 748 + i * 60));
      card(x, C, 16, 950, W - 32, 462); WIDGET[k](x, S, C, 40, 968, W - 80, M);
    }
  }
  function wrapText(x, s, X, Y, maxW, lh, maxL) { const ws2 = s.split(' '); let line = '', n = 0; for (const w of ws2) { const tt = line ? line + ' ' + w : w; if (x.measureText(tt).width > maxW && line) { x.fillText(line, X, Y + n * lh); n++; line = w; if (n >= maxL) return; } else line = tt; } x.fillText(line, X, Y + n * lh); }
  function webHot(id) {
    const k = TYPES[st.type].k, M = wst(k), [a, b] = id.split(':'); M.touched = 1;
    if (a === 'go') { M.done = 1; M.at = now(); }
    else if (a === 'reset') M.done = 0;
    else if (a === 'fav') M.fav ^= (1 << M.v);
    else if (a === 'n') { const step = k === 'wed' ? 10 : k === 'build' ? 2 : 1, lo = k === 'wed' ? 20 : k === 'build' ? 4 : 1, hi = k === 'wed' ? 300 : k === 'build' ? 200 : k === 'rent' ? 8 : 12; M.n = Math.max(lo, Math.min(hi, M.n + (b === 'p' ? step : -step))); }
    else if (a === 'v') M.v = +b;
    else if (a === 'a') { M.a = +b; if (k === 'arch') M.b = 0; }
    else if (a === 'b') M.b = +b;
    else if (a === 'stage') M.stage = +b;
    else if (a === 'route') M.route = +b;
    else if (a === 'menu') M.menu = +b;
  }

  function drawWeb(x, S, t) {
    const W = S.w, C = WEB[TYPES[st.type].k];
    drawConcept(x, S, t, 0);
    x.fillStyle = '#16171b'; x.fillRect(0, 0, W, 64);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c2, i) => { x.fillStyle = c2; x.beginPath(); x.arc(40 + i * 30, 32, 9, 0, 7); x.fill(); });
    rp(x, W / 2 - 300, 14, 600, 36, 10); x.fillStyle = '#26272c'; x.fill();
    x.fillStyle = '#c9cdd6'; x.font = `500 21px ${I}`; x.textAlign = 'center'; x.fillText('🔒  ' + C.url, W / 2, 39); x.textAlign = 'left';
    const tg = L(['Concept by Vero', 'Conceito Vero', 'Koncept af Vero']); x.font = `600 18px ${I}`; const tw = x.measureText(tg).width + 30; rp(x, W - 40 - tw, 16, tw, 32, 16); x.fillStyle = 'rgba(77,124,255,.22)'; x.fill(); x.fillStyle = '#9db6ff'; x.fillText(tg, W - 25 - tw, 38);
  }
  // ================================================================== laptop: a different, interactive CRM per business
  const CTx = q => (window.VERO_CRM_TR ? window.VERO_CRM_TR(q) : q);
  const CRM_ACC = { rest: '#ff7a45', estate: '#d4af5a', wed: '#e58fb0', trades: '#ffb020', gym: '#a3e635', shop: '#2dd4bf' };
  const MS = {}; // per-niche module state
  const ms = k => MS[k] || (MS[k] = {
    tables: [1, 2, 0, 1, 3, 0, 2, 1, 2, 0, 2, 1], sel: 0, booked: {}, done: [1, 1, 0, 0, 0], rsvp: 96, remind: 0,
    quote: 0, job: 1, cls: [92, 70, 100, 64, 88, 54, 48, 100, 60, 96, 72, 100, 100, 84, 100, 100, 66, 0], nudged: {}, orders: 4, reord: {}, simT: -9
  });
  const tag = (x, X, Y, txt, fg, bg) => { x.font = `600 21px ${I}`; const w = x.measureText(txt).width + 30; rp(x, X, Y, w, 40, 20); x.fillStyle = bg; x.fill(); x.fillStyle = fg; x.fillText(txt, X + 15, Y + 27); return w; };
  const pnl = (x, X, Y, W, H, title, right, acc) => { rp(x, X, Y, W, H, 22); x.fillStyle = '#0f1420'; x.fill(); x.strokeStyle = '#1b2436'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#eef2fa'; x.font = `600 26px ${I}`; x.fillText(title, X + 28, Y + 48); if (right) { x.font = `600 20px ${I}`; const w = x.measureText(right).width + 28; rp(x, X + W - w - 24, Y + 22, w, 38, 19); x.fillStyle = acc + '26'; x.fill(); x.fillStyle = acc; x.fillText(right, X + W - w - 10, Y + 47); } };
  const btn = (x, S, id, X, Y, W, H, label, acc, done) => { const h = hotHit(S, id, X, Y, W, H); rp(x, X, Y, W, H, H / 2); x.fillStyle = done ? 'rgba(40,200,64,.16)' : (h ? acc : acc + 'dd'); x.fill(); x.fillStyle = done ? '#7be08c' : '#0b0f19'; x.font = `700 22px ${I}`; x.textAlign = 'center'; x.fillText(label, X + W / 2, Y + H / 2 + 8); x.textAlign = 'left'; };
  function drawCRM(x, S, t) {
    const W = S.w, H = S.h, ty = TYPES[st.type], k = ty.crm, N = ((window.VERO_CRM_N || []).find(n => n.k === k)), A = CRM_ACC[k] || '#4d7cff', M = ms(k);
    x.fillStyle = '#0b0f19'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#070a12'; x.fillRect(0, 0, 104, H);
    [0, 1, 2, 3, 4].forEach(i => { rp(x, 30, 44 + i * 82, 44, 44, 12); x.fillStyle = i === 0 ? A : '#182032'; x.fill(); });
    if (!N) return;
    x.fillStyle = '#eef2fa'; x.font = `700 42px ${D}`; x.fillText(L(N.biz), 150, 92); const bw = x.measureText(L(N.biz)).width;
    x.fillStyle = '#707a8d'; x.font = `500 24px ${I}`; x.fillText('·  CRM', 150 + bw + 18, 90);
    rp(x, W - 220, 52, 170, 52, 26); x.fillStyle = 'rgba(40,200,64,.14)'; x.fill(); x.fillStyle = '#7be08c'; x.font = `600 22px ${I}`; x.fillText(L(['● AI on', '● AI ativa', '● AI aktiv']), W - 182, 86);
    const kp = ease(st.kpiT);
    N.kpi.forEach((q, i) => {
      const px = 150 + i * 465, v = q[1], val = v % 1 ? (v * kp).toFixed(1) : Math.round(v * kp).toLocaleString('en-US');
      rp(x, px, 132, 445, 150, 20); x.fillStyle = '#111725'; x.fill(); x.strokeStyle = '#1b2436'; x.lineWidth = 2; x.stroke();
      x.fillStyle = A; x.fillRect(px + 22, 270, 120 * kp, 4);
      x.fillStyle = '#868fa1'; x.font = `500 24px ${I}`; x.fillText(L(q[0]), px + 26, 176);
      x.fillStyle = '#eef2fa'; x.font = `800 66px ${D}`; x.fillText(val, px + 26, 254);
      const vw = x.measureText(val).width; x.fillStyle = '#7be08c'; x.font = `600 24px ${I}`; x.fillText(q[2], px + 36 + vw, 252);
    });
    const Y0 = 312, YH = H - Y0 - 36;
    ({ rest: crmRest, estate: crmEstate, wed: crmWed, trades: crmTrades, gym: crmGym, shop: crmShop }[k] || crmRest)(x, S, t, M, A, Y0, YH);
    const ta = now() - st.toastAt;
    if (ta < 3.4) { const kk = ta < .4 ? ease(ta / .4) : ta > 3 ? 1 - ease((ta - 3) / .4) : 1; x.globalAlpha = kk; const tx = st.toastTxt ? L(st.toastTxt) : L(['New lead · ', 'Novo contacto · ', 'Nyt lead · ']) + CTx(N.cards[0][0]); x.font = `600 26px ${I}`; const tw = x.measureText(tx).width + 90; rp(x, W - 50 - tw, H - 130 + (1 - kk) * 30, tw, 88, 20); x.fillStyle = '#eef2fa'; x.fill(); x.fillStyle = A; x.beginPath(); x.arc(W - 50 - tw + 40, H - 86 + (1 - kk) * 30, 10, 0, 7); x.fill(); x.fillStyle = '#0b0f19'; x.fillText(tx, W - 50 - tw + 64, H - 77 + (1 - kk) * 30); x.globalAlpha = 1; }
  }
  // restaurant — live floor plan (tap a table to change its state)
  const TB = [[0.06, .14, 'r'], [0.2, .14, 'r'], [0.34, .14, 'r'], [0.06, .52, 's'], [0.2, .52, 's'], [0.34, .52, 's'], [0.53, .1, 'l'], [0.53, .4, 'l'], [0.53, .7, 'l'], [0.8, .1, 'r'], [0.8, .4, 'r'], [0.8, .7, 'r']];
  const TST = [['Free', 'Livre', 'Ledig', '#2f3a50'], ['Booked', 'Reservada', 'Booket', '#22d3ee'], ['Seated', 'Sentados', 'Ankommet', '#4d7cff'], ['Bill', 'Conta', 'Regning', '#ffb800']];
  function crmRest(x, S, t, M, A, Y0, YH) {
    const fx = 150, fw = 1120;
    pnl(x, fx, Y0, fw, YH, L(['Tonight · main room', 'Esta noite · sala principal', 'I aften · hovedsal']), L(['Tap a table', 'Toque numa mesa', 'Tryk på et bord']), A);
    const gx = fx + 30, gy = Y0 + 84, gw = fw - 60, gh = YH - 170;
    rp(x, gx, gy, gw, gh, 16); x.strokeStyle = '#1b2436'; x.setLineDash([10, 10]); x.stroke(); x.setLineDash([]);
    TB.forEach((tb, i) => {
      const s = M.tables[i], c = TST[s][3], X = gx + tb[0] * gw, Y = gy + tb[1] * gh, w = tb[2] === 'l' ? 230 : tb[2] === 's' ? 120 : 120, h = tb[2] === 'l' ? 120 : tb[2] === 's' ? 160 : 120;
      const hv = hotHit(S, 'tb:' + i, X, Y, w, h);
      if (tb[2] === 'r') { x.beginPath(); x.arc(X + 60, Y + 60, 60, 0, 7); } else rp(x, X, Y, w, h, 20);
      x.fillStyle = c + (hv ? '55' : '33'); x.fill(); x.lineWidth = 3; x.strokeStyle = c; x.stroke();
      x.fillStyle = '#eef2fa'; x.font = `700 34px ${D}`; x.textAlign = 'center'; x.fillText(String(i + 1), X + w / 2, Y + h / 2 + 2); x.font = `500 18px ${I}`; x.fillStyle = '#c5ccd9'; x.fillText(L(TST[s]), X + w / 2, Y + h / 2 + 30); x.textAlign = 'left';
    });
    let lx = gx; TST.forEach(s => { x.fillStyle = s[3]; rp(x, lx, gy + gh + 30, 18, 18, 5); x.fill(); x.fillStyle = '#868fa1'; x.font = `500 20px ${I}`; x.fillText(L(s), lx + 28, gy + gh + 46); lx += 170; });
    const rx = fx + fw + 28, rw = 2048 - 50 - rx;
    pnl(x, rx, Y0, rw, YH, L(['Arrivals', 'Chegadas', 'Ankomster']), L(['auto-confirmed', 'confirmadas', 'auto-bekræftet']), A);
    [['20:00', 'Sofia M.', '4', ['Birthday', 'Aniversário', 'Fødselsdag']], ['20:00', 'Mia B.', '8', ['Set menu', 'Menu fechado', 'Fast menu']], ['20:30', 'Ana P.', '6', ['Nut allergy', 'Alergia a frutos secos', 'Nøddeallergi']], ['21:00', 'Tom R.', '2', ['VIP · 12th visit', 'VIP · 12.ª visita', 'VIP · 12. besøg']], ['21:15', 'Lars K.', '2', ['Waitlist', 'Lista de espera', 'Venteliste']]].forEach((r, i) => {
      const y = Y0 + 96 + i * 104; x.strokeStyle = '#1b2436'; x.beginPath(); x.moveTo(rx + 28, y - 18); x.lineTo(rx + rw - 28, y - 18); x.stroke();
      x.fillStyle = A; x.font = `700 24px ${I}`; x.fillText(r[0], rx + 28, y + 28); x.fillStyle = '#eef2fa'; x.font = `600 26px ${I}`; x.fillText(r[1], rx + 120, y + 18); x.fillStyle = '#868fa1'; x.font = `400 21px ${I}`; x.fillText(r[2] + ' ' + L(['guests', 'pessoas', 'gæster']), rx + 120, y + 48);
      x.font = `600 19px ${I}`; const w = x.measureText(L(r[3])).width + 26; rp(x, rx + rw - 28 - w, y + 2, w, 36, 18); x.fillStyle = A + '22'; x.fill(); x.fillStyle = A; x.fillText(L(r[3]), rx + rw - 15 - w, y + 26);
    });
  }
  // real estate — matched homes with real photos, book a viewing
  const PROPS = [['estate/e1', 'Cascais', '€585k', ['3 bed · 2 bath · 142 m²', '3 quartos · 2 WC · 142 m²', '3 vær. · 2 bad · 142 m²'], 96, 'Sat 10:00'], ['estate/e2', 'Carvoeiro', '€1.2M', ['4 bed · 4 bath · 290 m²', '4 quartos · 4 WC · 290 m²', '4 vær. · 4 bad · 290 m²'], 91, 'Sat 11:30'], ['estate/e3', 'Lagoa', '€2.4M', ['6 bed · 6 bath · 480 m²', '6 quartos · 6 WC · 480 m²', '6 vær. · 6 bad · 480 m²'], 87, 'Sat 14:00']];
  function crmEstate(x, S, t, M, A, Y0, YH) {
    const lw = 1180; pnl(x, 150, Y0, lw, YH, L(['Best matches · Hansen family', 'Melhores imóveis · família Hansen', 'Bedste match · familien Hansen']), L(['3 of 214', '3 de 214', '3 af 214']), A);
    PROPS.forEach((p, i) => {
      const X = 178 + i * 376, Y = Y0 + 84, w = 352, h = YH - 120, sel = M.sel === i, hv = hotHit(S, 'pr:' + i, X, Y, w, h);
      rp(x, X, Y, w, h, 18); x.fillStyle = '#131a29'; x.fill(); x.lineWidth = sel ? 4 : 2; x.strokeStyle = sel ? A : (hv ? '#3a4660' : '#1b2436'); x.stroke();
      const im = img(p[0]); x.save(); rp(x, X + 2, Y + 2, w - 4, 300, 16); x.clip(); if (im) cover(x, im, X, Y, w, 304); else { x.fillStyle = '#1b2436'; x.fillRect(X, Y, w, 304); } x.restore();
      x.beginPath(); x.arc(X + w - 54, Y + 54, 34, 0, 7); x.fillStyle = 'rgba(7,10,18,.85)'; x.fill(); x.beginPath(); x.arc(X + w - 54, Y + 54, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p[4] / 100); x.strokeStyle = A; x.lineWidth = 5; x.stroke(); x.fillStyle = '#fff'; x.font = `700 20px ${I}`; x.textAlign = 'center'; x.fillText(p[4] + '%', X + w - 54, Y + 61); x.textAlign = 'left';
      x.fillStyle = '#868fa1'; x.font = `600 19px ${I}`; x.fillText(p[1].toUpperCase(), X + 24, Y + 346); x.fillStyle = '#eef2fa'; x.font = `800 44px ${D}`; x.fillText(p[2], X + 24, Y + 398); x.fillStyle = '#aeb6c6'; x.font = `400 21px ${I}`; x.fillText(L(p[3]), X + 24, Y + 436);
      if (M.booked[i]) tag(x, X + 24, Y + 464, L(['Viewing ✓', 'Visita ✓', 'Fremvisning ✓']), '#7be08c', 'rgba(40,200,64,.16)');
    });
    const p = PROPS[M.sel], rx = 150 + lw + 28, rw = 2048 - 50 - rx;
    pnl(x, rx, Y0, rw, YH, L(['Buyer profile', 'Perfil do comprador', 'Køberprofil']), L(['Hot', 'Quente', 'Varm']), A);
    [[['Budget', 'Orçamento', 'Budget'], '€450k – 2.5M'], [['Areas', 'Zonas', 'Områder'], 'Cascais · Algarve'], [['Mortgage', 'Crédito', 'Lån'], L(['Pre-approved ✓', 'Pré-aprovado ✓', 'Forhåndsgodkendt ✓'])], [['Language', 'Língua', 'Sprog'], 'Dansk']].forEach((r, i) => { const y = Y0 + 110 + i * 62; x.fillStyle = '#868fa1'; x.font = `500 22px ${I}`; x.fillText(L(r[0]), rx + 28, y); x.fillStyle = '#eef2fa'; x.font = `600 22px ${I}`; x.textAlign = 'right'; x.fillText(r[1], rx + rw - 28, y); x.textAlign = 'left'; });
    x.fillStyle = '#eef2fa'; x.font = `600 24px ${I}`; x.fillText(L(['Saturday route', 'Roteiro de sábado', 'Lørdagsrute']), rx + 28, Y0 + 400);
    const bk = Object.keys(M.booked).map(Number).sort();
    if (!bk.length) { x.fillStyle = '#707a8d'; x.font = `400 21px ${I}`; x.fillText(L(['Book a viewing to build the route', 'Marque uma visita para criar o roteiro', 'Book en fremvisning for at lave ruten']), rx + 28, Y0 + 446); }
    bk.forEach((i, j) => { const y = Y0 + 446 + j * 50; x.fillStyle = A; x.font = `700 22px ${I}`; x.fillText(PROPS[i][5].split(' ')[1], rx + 28, y); x.fillStyle = '#cfd6e2'; x.font = `500 22px ${I}`; x.fillText(PROPS[i][1] + ' · ' + PROPS[i][2], rx + 120, y); });
    btn(x, S, 'book', rx + 28, Y0 + YH - 100, rw - 56, 66, M.booked[M.sel] ? L(['Viewing booked · ', 'Visita marcada · ', 'Fremvisning booket · ']) + p[5] : L(['Book a viewing · ', 'Marcar visita · ', 'Book fremvisning · ']) + p[1] + ' →', A, M.booked[M.sel]);
  }
  // weddings — run of show (tick steps), RSVPs (send reminder), budget
  function crmWed(x, S, t, M, A, Y0, YH) {
    const lw = 1080; pnl(x, 150, Y0, lw, YH, 'Ana & Rui · 14 Jun 2027', L(['Contract signed', 'Contrato assinado', 'Kontrakt underskrevet']), A);
    const steps = [['16:00', ['Ceremony · garden', 'Cerimónia · jardim', 'Vielse · have']], ['17:00', ['Cocktail hour', 'Cocktail', 'Cocktailtime']], ['19:00', ['Dinner · Classic menu', 'Jantar · menu Clássico', 'Middag · Classic-menu']], ['21:30', ['First dance', 'Primeira dança', 'Første dans']], ['00:00', ['Late-night snack', 'Ceia', 'Natmad']]];
    steps.forEach((s, i) => { const y = Y0 + 110 + i * ((YH - 150) / 5), d = M.done[i], hv = hotHit(S, 'st:' + i, 178, y - 36, lw - 56, 76);
      if (hv) { rp(x, 178, y - 36, lw - 56, 76, 14); x.fillStyle = '#131a29'; x.fill(); }
      x.fillStyle = A; x.font = `700 24px ${I}`; x.fillText(s[0], 200, y + 8); x.beginPath(); x.arc(320, y, 16, 0, 7); x.fillStyle = d ? A : '#0f1420'; x.fill(); x.lineWidth = 3; x.strokeStyle = A; x.stroke(); if (d) { x.strokeStyle = '#0b0f19'; x.lineWidth = 4; x.beginPath(); x.moveTo(312, y); x.lineTo(318, y + 6); x.lineTo(329, y - 7); x.stroke(); }
      if (i < 4) { x.strokeStyle = '#26304a'; x.lineWidth = 2; x.beginPath(); x.moveTo(320, y + 18); x.lineTo(320, y + (YH - 150) / 5 - 18); x.stroke(); }
      x.fillStyle = d ? '#707a8d' : '#eef2fa'; x.font = `600 27px ${I}`; x.fillText(L(s[1]), 360, y + 10); x.fillStyle = '#707a8d'; x.font = `500 19px ${I}`; x.textAlign = 'right'; x.fillText(d ? L(['Done', 'Feito', 'Færdig']) : L(['Tap to confirm', 'Toque para confirmar', 'Tryk for at bekræfte']), 178 + lw - 80, y + 8); x.textAlign = 'left'; });
    const rx = 150 + lw + 28, rw = 2048 - 50 - rx, hh = 380;
    pnl(x, rx, Y0, rw, hh, 'RSVP', L(['auto-reminders', 'lembretes automáticos', 'auto-påmindelser']), A);
    const cx = rx + 120, cy = Y0 + 210, pr = M.rsvp / 120; x.lineWidth = 18; x.strokeStyle = '#1b2436'; x.beginPath(); x.arc(cx, cy, 74, 0, 7); x.stroke(); x.strokeStyle = A; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy, 74, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr); x.stroke(); x.lineCap = 'butt';
    x.fillStyle = '#eef2fa'; x.font = `800 46px ${D}`; x.textAlign = 'center'; x.fillText(M.rsvp, cx, cy + 16); x.textAlign = 'left'; x.fillStyle = '#868fa1'; x.font = `500 22px ${I}`; x.fillText('/ 120 ' + L(['confirmed', 'confirmados', 'bekræftet']), rx + 230, cy - 10); x.fillText(L(['8 veggie · 3 gluten-free', '8 vegetarianos · 3 sem glúten', '8 veg. · 3 glutenfri']), rx + 230, cy + 24);
    btn(x, S, 'remind', rx + 28, Y0 + hh - 84, rw - 56, 58, M.rsvp >= 120 ? L(['Everyone replied ✓', 'Todos responderam ✓', 'Alle har svaret ✓']) : L(['Send reminder to 24 guests', 'Enviar lembrete a 24 convidados', 'Send påmindelse til 24 gæster']), A, M.rsvp >= 120);
    const by = Y0 + hh + 24, bh = YH - hh - 24;
    pnl(x, rx, by, rw, bh, L(['Budget & payments', 'Orçamento e pagamentos', 'Budget & betalinger']), '€31,200', A);
    const segs = [[.52, A], [.18, '#f3c6a5'], [.1, '#9b7bff'], [.08, '#22d3ee'], [.12, '#2f3a50']]; let sx = rx + 28; const sw = rw - 56; segs.forEach(s => { x.fillStyle = s[1]; x.fillRect(sx, by + 84, sw * s[0] - 4, 14); sx += sw * s[0]; });
    [[['Deposit', 'Sinal', 'Depositum'], '€6,000', ['Paid', 'Pago', 'Betalt'], '#7be08c'], [['2nd instalment', '2.ª prestação', '2. rate'], '€12,000', ['14 Mar', '14 mar', '14. mar'], '#ffcf5a'], [['Final', 'Final', 'Slut'], '€13,200', ['31 May', '31 mai', '31. maj'], '#868fa1']].forEach((r, i) => { const y = by + 150 + i * 56; x.fillStyle = '#aeb6c6'; x.font = `500 22px ${I}`; x.fillText(L(r[0]), rx + 28, y); x.fillStyle = '#eef2fa'; x.font = `600 22px ${I}`; x.fillText(r[1], rx + rw - 260, y); x.fillStyle = r[3]; x.textAlign = 'right'; x.fillText(L(r[2]), rx + rw - 28, y); x.textAlign = 'left'; });
  }
  // trades / architecture / construction — crew dispatch + quote you can send
  const JOBS = [[0, 0, 5, ['Full remodel', 'Remodelação total', 'Totalrenovering'], 'Rua do Sol 14', 1], [1, 0, 3, ['Bathroom', 'Casa de banho', 'Badeværelse'], 'M. Ferreira', 0], [1, 3, 2, ['Roof repair', 'Reparação telhado', 'Tagreparation'], 'Oakfield Rd', 0], [2, 0, 1, ['Site visits', 'Visitas', 'Besigtigelser'], 'AI booked', 2], [2, 1, 2, ['Flooring', 'Pavimento', 'Gulv'], '64 m²', 0], [2, 3, 2, ['Painting', 'Pintura', 'Maling'], 'Villa Azul', 0]];
  const QSTAT = [['Draft', 'Rascunho', 'Kladde'], ['Sent', 'Enviado', 'Sendt'], ['Opened 2×', 'Aberto 2×', 'Åbnet 2×'], ['Signed ✓', 'Assinado ✓', 'Underskrevet ✓']];
  function crmTrades(x, S, t, M, A, Y0, YH) {
    const lw = 1150; pnl(x, 150, Y0, lw, YH, L(['Crews · this week', 'Equipas · esta semana', 'Hold · denne uge']), L(['96% utilised', '96% ocupação', '96% udnyttet']), A);
    const gx = 330, gw = lw - 210, cw = gw / 5, rh = (YH - 200) / 3;
    [['Mon', 'Seg', 'Man'], ['Tue', 'Ter', 'Tir'], ['Wed', 'Qua', 'Ons'], ['Thu', 'Qui', 'Tor'], ['Fri', 'Sex', 'Fre']].forEach((d, i) => { x.fillStyle = '#868fa1'; x.font = `600 22px ${I}`; x.textAlign = 'center'; x.fillText(L(d), gx + cw * i + cw / 2, Y0 + 110); x.textAlign = 'left'; });
    ['A', 'B', 'C'].forEach((c, r) => { const y = Y0 + 140 + r * rh; rp(x, 180, y + rh / 2 - 26, 52, 52, 14); x.fillStyle = '#182032'; x.fill(); x.fillStyle = A; x.font = `800 26px ${D}`; x.fillText(c, 196, y + rh / 2 + 9); x.fillStyle = '#aeb6c6'; x.font = `500 21px ${I}`; x.fillText(L(['Crew', 'Equipa', 'Hold']), 246, y + rh / 2 + 7); });
    JOBS.forEach((j, i) => { const X = gx + j[1] * cw + 6, Y = Y0 + 140 + j[0] * rh + 8, w = j[2] * cw - 12, h = rh - 16, sel = M.job === i, hv = hotHit(S, 'job:' + i, X, Y, w, h); const c = j[5] === 1 ? A : j[5] === 2 ? '#9b7bff' : '#22d3ee';
      rp(x, X, Y, w, h, 16); x.fillStyle = c + (sel ? '44' : hv ? '33' : '22'); x.fill(); x.lineWidth = sel ? 4 : 2; x.strokeStyle = c; x.stroke(); x.fillStyle = '#eef2fa'; x.font = `600 25px ${I}`; x.fillText(L(j[3]), X + 20, Y + 44); x.fillStyle = '#aeb6c6'; x.font = `400 20px ${I}`; x.fillText(j[4], X + 20, Y + 76); });
    const rx = 150 + lw + 28, rw = 2048 - 50 - rx, J = JOBS[M.job];
    pnl(x, rx, Y0, rw, YH, L(['Quote', 'Orçamento', 'Tilbud']) + ' #Q-' + (1180 + M.job), L(QSTAT[M.quote]), M.quote === 3 ? '#28c840' : A);
    x.fillStyle = '#aeb6c6'; x.font = `500 21px ${I}`; x.fillText(L(J[3]) + ' · ' + J[4], rx + 28, Y0 + 96);
    const lines = [[['Demolition & removal', 'Demolição e remoção', 'Nedrivning'], 850], [['Materials', 'Materiais', 'Materialer'], 2140 + M.job * 310], [['Specialist work', 'Trabalho especializado', 'Specialarbejde'], 1620], [['Labour · 5 days', 'Mão de obra · 5 dias', 'Arbejdsløn · 5 dage'], 2250]];
    let tot = 0; lines.forEach((l, i) => { const y = Y0 + 160 + i * 58; tot += l[1]; x.fillStyle = '#cfd6e2'; x.font = `500 23px ${I}`; x.fillText(L(l[0]), rx + 28, y); x.fillStyle = '#eef2fa'; x.textAlign = 'right'; x.fillText('€' + l[1].toLocaleString('en-US'), rx + rw - 28, y); x.textAlign = 'left'; });
    const ty2 = Y0 + 160 + lines.length * 58 + 20; x.strokeStyle = '#1b2436'; x.beginPath(); x.moveTo(rx + 28, ty2 - 30); x.lineTo(rx + rw - 28, ty2 - 30); x.stroke();
    x.fillStyle = '#868fa1'; x.font = `500 22px ${I}`; x.fillText(L(['VAT 23%', 'IVA 23%', 'Moms 23 %']), rx + 28, ty2); x.textAlign = 'right'; x.fillText('€' + Math.round(tot * .23).toLocaleString('en-US'), rx + rw - 28, ty2); x.textAlign = 'left';
    x.fillStyle = '#eef2fa'; x.font = `600 26px ${I}`; x.fillText('Total', rx + 28, ty2 + 64); x.fillStyle = A; x.font = `800 46px ${D}`; x.textAlign = 'right'; x.fillText('€' + Math.round(tot * 1.23).toLocaleString('en-US'), rx + rw - 28, ty2 + 68); x.textAlign = 'left';
    btn(x, S, 'quote', rx + 28, Y0 + YH - 100, rw - 56, 66, [L(['Send quote for e-signature →', 'Enviar orçamento para assinar →', 'Send tilbud til e-signatur →']), L(['Sent · waiting…', 'Enviado · à espera…', 'Sendt · venter…']), L(['Opened · send reminder →', 'Aberto · enviar lembrete →', 'Åbnet · send påmindelse →']), L(['Signed — job scheduled ✓', 'Assinado — obra agendada ✓', 'Underskrevet — job planlagt ✓'])][M.quote], A, M.quote === 3);
  }
  // gym — class timetable (tap to book), retention radar (send a nudge)
  function crmGym(x, S, t, M, A, Y0, YH) {
    const lw = 1180; pnl(x, 150, Y0, lw, YH, L(['Classes this week', 'Aulas esta semana', 'Hold denne uge']), L(['Tap a class to book', 'Toque para marcar', 'Tryk for at booke']), A);
    const days = [['Mon', 'Seg', 'Man'], ['Tue', 'Ter', 'Tir'], ['Wed', 'Qua', 'Ons'], ['Thu', 'Qui', 'Tor'], ['Fri', 'Sex', 'Fre'], ['Sat', 'Sáb', 'Lør']], times = ['07:00', '12:30', '18:30'], names = ['HIIT', 'Spin', 'HIIT', 'Spin', 'HIIT', 'Yoga', 'Core', 'Pilates', 'Core', 'Pilates', 'Box', 'HIIT', 'Pilates', 'Box', 'Pilates', 'HIIT', 'Yoga', '—'];
    const gx = 270, cw = (lw - 150) / 6, rh = (YH - 150) / 3;
    days.forEach((d, i) => { x.fillStyle = '#868fa1'; x.font = `600 22px ${I}`; x.textAlign = 'center'; x.fillText(L(d), gx + cw * i + cw / 2, Y0 + 108); x.textAlign = 'left'; });
    times.forEach((tm, r) => { x.fillStyle = '#707a8d'; x.font = `500 21px ${I}`; x.fillText(tm, 176, Y0 + 130 + r * rh + rh / 2 + 6); });
    names.forEach((n, i) => { const c = i % 6, r = Math.floor(i / 6), X = gx + c * cw + 6, Y = Y0 + 130 + r * rh + 6, w = cw - 12, h = rh - 12, f = M.cls[i];
      if (!f) { rp(x, X, Y, w, h, 14); x.setLineDash([8, 8]); x.strokeStyle = '#1b2436'; x.stroke(); x.setLineDash([]); return; }
      const full = f >= 100, hv = !full && hotHit(S, 'cl:' + i, X, Y, w, h);
      rp(x, X, Y, w, h, 14); x.fillStyle = full ? A + '22' : hv ? '#172030' : '#131a29'; x.fill(); x.lineWidth = 2; x.strokeStyle = full ? A : '#1b2436'; x.stroke();
      x.fillStyle = '#eef2fa'; x.font = `700 24px ${I}`; x.fillText(n, X + 16, Y + 38); x.fillStyle = '#1b2436'; rp(x, X + 16, Y + h - 46, w - 32, 8, 4); x.fill(); x.fillStyle = A; rp(x, X + 16, Y + h - 46, (w - 32) * f / 100, 8, 4); x.fill();
      x.fillStyle = full ? A : '#868fa1'; x.font = `500 18px ${I}`; x.fillText(full ? L(['Full', 'Cheia', 'Fyldt']) : Math.round(f / 5) + '/20', X + 16, Y + h - 14); });
    const rx = 150 + lw + 28, rw = 2048 - 50 - rx;
    pnl(x, rx, Y0, rw, YH, L(['Retention radar', 'Radar de retenção', 'Fastholdelse']), L(['AI churn score', 'risco AI', 'AI-risiko']), A);
    [['Nuno R.', 21, 91], ['Clara T.', 12, 78], ['Ida M.', 9, 64], ['Rui F.', 8, 52]].forEach((m, i) => { const y = Y0 + 100 + i * ((YH - 130) / 4), sent = M.nudged[i];
      x.fillStyle = '#eef2fa'; x.font = `600 25px ${I}`; x.fillText(m[0], rx + 28, y + 24); x.fillStyle = '#868fa1'; x.font = `400 20px ${I}`; x.fillText(m[1] + ' ' + L(['days away', 'dias sem vir', 'dage væk']), rx + 28, y + 54);
      x.fillStyle = '#1b2436'; rp(x, rx + 28, y + 72, rw - 300, 8, 4); x.fill(); x.fillStyle = m[2] > 80 ? '#ff8a7a' : '#ffcf5a'; rp(x, rx + 28, y + 72, (rw - 300) * m[2] / 100, 8, 4); x.fill();
      btn(x, S, 'nd:' + i, rx + rw - 230, y + 20, 200, 52, sent ? L(['Sent ✓', 'Enviado ✓', 'Sendt ✓']) : L(['Send nudge', 'Enviar lembrete', 'Send påmindelse']), A, sent); });
  }
  // café & bike rental / shop — revenue, live orders (simulate one), stock (reorder)
  function crmShop(x, S, t, M, A, Y0, YH) {
    const lw = 1180; pnl(x, 150, Y0, lw, YH, L(['Revenue · 30 days', 'Faturação · 30 dias', 'Omsætning · 30 dage']), '€48,920 · +27%', A);
    const cx = 178, cy = Y0 + 90, cw = lw - 56, ch = 300, pts = [32, 35, 31, 40, 44, 41, 48, 52, 47, 55, 60, 58, 54, 63, 70, 66, 72, 78, 74, 81, 88, 84, 90, 97, 92, 101, 108, 104, 112, 121], kp = ease(st.kpiT);
    const g = x.createLinearGradient(0, cy, 0, cy + ch); g.addColorStop(0, A + '55'); g.addColorStop(1, A + '00');
    x.beginPath(); x.moveTo(cx, cy + ch); pts.forEach((v, i) => x.lineTo(cx + i / (pts.length - 1) * cw * kp, cy + ch - v / 125 * ch)); x.lineTo(cx + cw * kp, cy + ch); x.closePath(); x.fillStyle = g; x.fill();
    x.beginPath(); pts.forEach((v, i) => { const X = cx + i / (pts.length - 1) * cw * kp, Y = cy + ch - v / 125 * ch; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.strokeStyle = A; x.lineWidth = 4; x.stroke();
    const names = ['Freja N.', 'Oliver S.', 'Marta G.', 'Emil J.', 'Sofie L.', 'Jack T.', 'Inês R.', 'Mads K.'], oy = cy + ch + 40;
    for (let i = 0; i < 4; i++) { const n = M.orders - i, y = oy + i * 62, fresh = i === 0 && now() - M.simT < 1.2; if (fresh) { rp(x, cx - 8, y - 34, cw + 16, 56, 12); x.fillStyle = A + '22'; x.fill(); }
      x.fillStyle = '#eef2fa'; x.font = `600 23px ${I}`; x.fillText('#' + (4820 + n), cx, y); x.fillStyle = '#cfd6e2'; x.font = `500 23px ${I}`; x.fillText(names[n % names.length], cx + 140, y); x.fillStyle = '#868fa1'; x.fillText(['DK', 'UK', 'PT'][n % 3], cx + 440, y); x.fillStyle = '#eef2fa'; x.fillText('€' + (39 + (n * 37) % 120), cx + 560, y); tag(x, cx + cw - 150, y - 28, L(i === 0 ? ['Paid', 'Pago', 'Betalt'] : ['Shipped', 'Enviado', 'Afsendt']), i === 0 ? '#7be08c' : '#aeb6c6', i === 0 ? 'rgba(40,200,64,.14)' : 'rgba(255,255,255,.06)'); }
    btn(x, S, 'sim', cx, Y0 + YH - 90, 380, 60, L(['Simulate an order →', 'Simular encomenda →', 'Simulér en ordre →']), A, false);
    const rx = 150 + lw + 28, rw = 2048 - 50 - rx;
    pnl(x, rx, Y0, rw, YH, L(['Stock alerts', 'Alertas de stock', 'Lageralarmer']), L(['auto', 'auto', 'auto']), A);
    [[['E-bikes ready', 'E-bikes prontas', 'Elcykler klar'], 3, 30], [['Pastéis de nata', 'Pastéis de nata', 'Pastéis de nata'], 14, 45], [['Helmets M', 'Capacetes M', 'Hjelme M'], 6, 20], [['Coffee beans', 'Café em grão', 'Kaffebønner'], 48, 90]].forEach((s, i) => { const y = Y0 + 100 + i * ((YH - 130) / 4), done = M.reord[i];
      x.fillStyle = '#eef2fa'; x.font = `600 24px ${I}`; x.fillText(L(s[0]), rx + 28, y + 24); x.fillStyle = '#1b2436'; rp(x, rx + 28, y + 50, rw - 300, 8, 4); x.fill(); x.fillStyle = s[2] < 35 ? '#ff8a7a' : A; rp(x, rx + 28, y + 50, (rw - 300) * (done ? 1 : s[2] / 100), 8, 4); x.fill();
      x.fillStyle = '#868fa1'; x.font = `500 20px ${I}`; x.fillText((done ? s[1] + 40 : s[1]) + ' ' + L(['left', 'restantes', 'tilbage']), rx + 28, y + 88);
      btn(x, S, 'ro:' + i, rx + rw - 230, y + 14, 200, 52, done ? L(['Ordered ✓', 'Encomendado ✓', 'Bestilt ✓']) : L(['Reorder', 'Encomendar', 'Genbestil']), A, done); });
  }
  function handleHot(id) {
    if (id.startsWith('w:')) return webHot(id.slice(2));
    const k = TYPES[st.type].crm, M = ms(k), [a, b] = id.split(':'), i = +b;
    if (a === 'tb') { M.tables[i] = (M.tables[i] + 1) % 4; if (M.tables[i] === 2) { st.toastAt = now(); st.toastTxt = ['Table ' + (i + 1) + ' seated · menu sent to kitchen', 'Mesa ' + (i + 1) + ' sentada · pedido enviado à cozinha', 'Bord ' + (i + 1) + ' ankommet · bestilling sendt til køkkenet']; } }
    else if (a === 'pr') M.sel = i;
    else if (a === 'book') { if (!M.booked[M.sel]) { M.booked[M.sel] = 1; st.toastAt = now(); st.toastTxt = ['Viewing booked · route sent on WhatsApp ✓', 'Visita marcada · roteiro enviado no WhatsApp ✓', 'Fremvisning booket · rute sendt på WhatsApp ✓']; } }
    else if (a === 'st') M.done[i] = M.done[i] ? 0 : 1;
    else if (a === 'remind') { if (M.rsvp < 120) { M.rsvp = Math.min(120, M.rsvp + 8); st.toastAt = now(); st.toastTxt = ['Reminder sent · 8 new RSVPs', 'Lembrete enviado · 8 novas respostas', 'Påmindelse sendt · 8 nye svar']; } }
    else if (a === 'job') { M.job = i; M.quote = 0; }
    else if (a === 'quote') { if (M.quote < 3) { M.quote++; if (M.quote === 3) { st.toastAt = now(); st.toastTxt = ['Quote signed · deposit invoice sent ✓', 'Orçamento assinado · fatura de sinal enviada ✓', 'Tilbud underskrevet · depositumfaktura sendt ✓']; } } }
    else if (a === 'cl') { M.cls[i] = Math.min(100, M.cls[i] + 5); }
    else if (a === 'nd') { M.nudged[i] = 1; st.toastAt = now(); st.toastTxt = ['Nudge sent on WhatsApp ✓', 'Lembrete enviado no WhatsApp ✓', 'Påmindelse sendt på WhatsApp ✓']; }
    else if (a === 'sim') { M.orders++; M.simT = now(); st.toastAt = now(); st.toastTxt = ['New order · €' + (39 + (M.orders * 37) % 120) + ' · Meta ad', 'Nova encomenda · ' + (39 + (M.orders * 37) % 120) + ' € · anúncio Meta', 'Ny ordre · ' + (39 + (M.orders * 37) % 120) + ' € · Meta-annonce']; }
    else if (a === 'ro') M.reord[i] = 1;
    else if (a === 'cta') { const AS = appState(k); AS.ok = AS.ok ? 0 : 1; AS.at = now(); }
    else if (a === 'fav') { const AS = appState(k); AS.fav = !AS.fav; }
  }

  // ================================================================== phone: a different app (layout + colours) per business
  const THEME = {
    rest: { bg: '#f6efe6', fg: '#1d1712', sub: '#7a6d60', card: '#ffffff', line: '#eadfce', acc: '#c2410c', acc2: '#f59e0b', dark: 0 },
    estate: { bg: '#0b1424', fg: '#f3efe4', sub: '#93a0b8', card: '#13203a', line: '#1f2d4a', acc: '#d4af5a', acc2: '#f0d999', dark: 1 },
    wed: { bg: '#fbf1f1', fg: '#3a2530', sub: '#9a7d88', card: '#ffffff', line: '#f1dede', acc: '#c9708f', acc2: '#f3c6a5', dark: 0 },
    trades: { bg: '#111214', fg: '#f2f2f2', sub: '#8c8f96', card: '#1b1d21', line: '#2a2d33', acc: '#ffb020', acc2: '#ff7a1a', dark: 1 },
    gym: { bg: '#050505', fg: '#ffffff', sub: '#8a8a8a', card: '#141414', line: '#222', acc: '#a3e635', acc2: '#22d3ee', dark: 1 },
    shop: { bg: '#f1faf8', fg: '#0f2a2a', sub: '#5f7d7b', card: '#ffffff', line: '#d7ece8', acc: '#0d9488', acc2: '#fb7185', dark: 0 }
  };
  function drawApp(x, S, t) {
    const W = S.w, H = S.h, k = TYPES[st.type].crm, A = APPS[k], AS = appState(k), C = THEME[k] || THEME.rest;
    x.fillStyle = C.bg; x.fillRect(0, 0, W, H);
    x.fillStyle = C.fg; x.font = `600 27px ${I}`; x.fillText('9:41', 66, 66); rp(x, 520, 48, 56, 24, 7); x.fill();
    ({ rest: appRest, estate: appEstate, wed: appWed, trades: appTrades, gym: appGym, shop: appShop }[k] || appRest)(x, S, t, A, AS, C);
    // tab bar
    rp(x, 36, 1250, 588, 100, 50); x.fillStyle = C.card; x.fill(); if (!C.dark) { x.strokeStyle = C.line; x.lineWidth = 2; x.stroke(); }
    [0, 1, 2, 3].forEach(i => { x.beginPath(); x.arc(118 + i * 141, 1300, i === 0 ? 17 : 13, 0, 7); x.fillStyle = i === 0 ? C.acc : C.dark ? '#3a3d44' : C.line; x.fill(); });
    const pa = now() - st.pushAt;
    if (pa < 3.6) { const kk = pa < .45 ? ease(pa / .45) : pa > 3.15 ? 1 - ease((pa - 3.15) / .45) : 1; const py = -120 + kk * 230; rp(x, 22, py, 616, 112, 32); x.fillStyle = C.dark ? 'rgba(40,42,48,.97)' : 'rgba(255,255,255,.98)'; x.fill(); rp(x, 44, py + 24, 64, 64, 16); x.fillStyle = C.acc; x.fill(); x.fillStyle = C.fg; x.font = `700 24px ${I}`; x.fillText(A.brand, 126, py + 50); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(A.list[0][0]) + ' · ' + L(A.list[0][1]), 126, py + 82); }
  }
  const appCTA = (x, S, AS, A, C, X, Y, W, H) => { const hk = hotHit(S, 'cta', X, Y, W, H); rp(x, X, Y, W, H, H / 2); x.fillStyle = AS.ok ? C.acc + '33' : hk ? C.acc2 : C.acc; x.fill(); x.fillStyle = AS.ok ? C.acc : (C.dark ? '#0b0b0b' : '#fff'); x.font = `700 28px ${I}`; x.textAlign = 'center'; x.fillText(AS.ok ? '✓  ' + L(A.ok).replace(/ ✓$/, '') : L(A.cta), X + W / 2, Y + H / 2 + 10); x.textAlign = 'left'; };
  const rowList = (x, A, C, Y, n) => A.list.slice(0, n).forEach((r, i) => { const py = Y + i * 112; rp(x, 36, py, 588, 96, 26); x.fillStyle = C.card; x.fill(); if (!C.dark) { x.strokeStyle = C.line; x.lineWidth = 2; x.stroke(); } rp(x, 58, py + 20, 56, 56, 16); x.fillStyle = C.acc + '26'; x.fill(); x.fillStyle = C.acc; x.beginPath(); x.arc(86, py + 48, 9, 0, 7); x.fill(); x.fillStyle = C.fg; x.font = `600 27px ${I}`; x.fillText(L(r[0]), 136, py + 44); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(r[1]), 136, py + 76); });
  function appRest(x, S, t, A, AS, C) {
    x.fillStyle = C.fg; x.font = `800 36px ${D}`; x.fillText('Casa Lume', 46, 170); x.fillStyle = C.sub; x.font = `500 24px ${I}`; x.fillText(L(A.hi) + ' ' + A.who, 46, 206);
    rp(x, 36, 236, 588, 430, 40); x.save(); x.clip(); const g = x.createLinearGradient(36, 236, 624, 666); g.addColorStop(0, '#3b1f12'); g.addColorStop(1, '#9a3412'); x.fillStyle = g; x.fillRect(36, 236, 588, 430);
    x.fillStyle = 'rgba(255,200,140,.25)'; x.beginPath(); x.arc(500, 300, 220, 0, 7); x.fill(); x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(540, 470, 120, 40, 0, 0, 7); x.fill(); x.fillStyle = '#f3ede3'; x.beginPath(); x.ellipse(530, 430, 120, 96, 0, 0, 7); x.fill(); x.fillStyle = '#b45309'; x.beginPath(); x.ellipse(522, 430, 56, 36, .3, 0, 7); x.fill(); x.fillStyle = '#65a30d'; x.beginPath(); x.ellipse(562, 446, 24, 16, 0, 0, 7); x.fill(); x.restore();
    x.fillStyle = 'rgba(255,255,255,.85)'; x.font = `600 23px ${I}`; x.fillText(L(A.k), 72, 300); x.fillStyle = '#fff'; x.font = `800 46px ${D}`; x.fillText(L(A.s).split(' · ')[0], 72, 356); x.font = `500 25px ${I}`; x.fillText(L(A.s).split(' · ')[1] || '', 72, 394);
    appCTA(x, S, AS, A, C, 72, 572, 516, 72);
    x.fillStyle = C.fg; x.font = `700 30px ${D}`; x.fillText(L(A.sec), 46, 730); const pr = A.prog[0] + (AS.ok ? 1 : 0);
    for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(70 + i * 57, 790, 22, 0, 7); x.fillStyle = i < pr ? C.acc : C.line; x.fill(); if (i < pr) { x.fillStyle = '#fff'; x.font = `700 18px ${I}`; x.textAlign = 'center'; x.fillText('✓', 70 + i * 57, 797); x.textAlign = 'left'; } }
    [['#b45309', ['Octopus', 'Polvo', 'Blæksprutte']], ['#65a30d', ['Garden', 'Horta', 'Have']], ['#be123c', ['Dessert', 'Sobremesa', 'Dessert']]].forEach((d, i) => { const X = 36 + i * 200; rp(x, X, 850, 188, 360, 28); x.fillStyle = C.card; x.fill(); x.strokeStyle = C.line; x.lineWidth = 2; x.stroke(); x.beginPath(); x.arc(X + 94, 960, 70, 0, 7); x.fillStyle = '#f3ede3'; x.fill(); x.beginPath(); x.arc(X + 94, 960, 40, 0, 7); x.fillStyle = d[0]; x.fill(); x.fillStyle = C.fg; x.font = `600 25px ${I}`; x.fillText(L(d[1]), X + 22, 1080); x.fillStyle = C.sub; x.font = `500 22px ${I}`; x.fillText('€' + (14 + i * 4), X + 22, 1116); });
  }
  function appEstate(x, S, t, A, AS, C) {
    rp(x, 36, 120, 588, 76, 38); x.fillStyle = C.card; x.fill(); x.fillStyle = C.sub; x.font = `500 25px ${I}`; x.fillText('⌕  Cascais · Algarve · 3+', 70, 167);
    x.fillStyle = C.fg; x.font = `700 40px ${D}`; x.fillText(L(A.hi) + ' ' + A.who, 46, 262);
    rp(x, 36, 296, 588, 560, 36); x.save(); x.clip(); const im = img('estate/e2'); if (im) cover(x, im, 36, 296, 588, 400); else { x.fillStyle = '#1f2d4a'; x.fillRect(36, 296, 588, 400); } x.fillStyle = C.card; x.fillRect(36, 696, 588, 160); x.restore();
    const fh = hotHit(S, 'fav', 540, 316, 64, 64); x.beginPath(); x.arc(572, 348, 32, 0, 7); x.fillStyle = 'rgba(11,20,36,.75)'; x.fill(); x.fillStyle = AS.fav || fh ? C.acc : '#fff'; x.font = `700 32px ${I}`; x.textAlign = 'center'; x.fillText(AS.fav ? '♥' : '♡', 572, 360); x.textAlign = 'left';
    rp(x, 60, 316, 150, 48, 24); x.fillStyle = C.acc; x.fill(); x.fillStyle = '#0b1424'; x.font = `700 22px ${I}`; x.fillText('91% match', 78, 348);
    x.fillStyle = C.sub; x.font = `600 21px ${I}`; x.fillText('CARVOEIRO · ALGARVE', 66, 738); x.fillStyle = C.fg; x.font = `800 48px ${D}`; x.fillText('€1.2M', 66, 796); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(['4 bed · pool · sea view', 'T4 · piscina · vista mar', '4 vær. · pool · havudsigt']), 66, 832);
    appCTA(x, S, AS, A, C, 36, 884, 588, 76);
    x.fillStyle = C.fg; x.font = `700 30px ${D}`; x.fillText(L(A.sec), 46, 1020);
    ['estate/e1', 'estate/e3', 'estate/e2'].forEach((p, i) => { const X = 36 + i * 200, im2 = img(p); x.save(); rp(x, X, 1046, 188, 170, 22); x.clip(); if (im2) cover(x, im2, X, 1046, 188, 170); else { x.fillStyle = C.card; x.fillRect(X, 1046, 188, 170); } x.restore(); });
  }
  function appWed(x, S, t, A, AS, C) {
    x.fillStyle = C.sub; x.font = `500 26px ${I}`; x.textAlign = 'center'; x.fillText(L(A.k), 330, 170); x.fillStyle = C.fg; x.font = `italic 600 64px 'Fraunces',Georgia,serif`; x.fillText(A.who, 330, 252);
    x.fillStyle = C.acc; x.font = `800 120px ${D}`; x.fillText('203', 330, 400); x.fillStyle = C.sub; x.font = `600 24px ${I}`; x.fillText(L(['DAYS TO GO', 'DIAS PARA O GRANDE DIA', 'DAGE TILBAGE']), 330, 444); x.textAlign = 'left';
    const pr = (A.prog[0] + (AS.ok ? 1 : 0)) / A.prog[1]; rp(x, 36, 480, 588, 170, 32); x.fillStyle = C.card; x.fill(); x.strokeStyle = C.line; x.lineWidth = 2; x.stroke();
    x.lineWidth = 14; x.strokeStyle = C.line; x.beginPath(); x.arc(126, 565, 52, 0, 7); x.stroke(); x.strokeStyle = C.acc; x.lineCap = 'round'; x.beginPath(); x.arc(126, 565, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr); x.stroke(); x.lineCap = 'butt';
    x.fillStyle = C.fg; x.font = `700 26px ${I}`; x.textAlign = 'center'; x.fillText(Math.round(pr * 100) + '%', 126, 574); x.textAlign = 'left'; x.font = `700 30px ${D}`; x.fillText(L(A.sec), 210, 556); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(A.s), 210, 594);
    appCTA(x, S, AS, A, C, 36, 680, 588, 76);
    A.list.forEach((r, i) => { const y = 800 + i * 112, done = i === 0 && AS.ok; rp(x, 36, y, 588, 96, 26); x.fillStyle = C.card; x.fill(); x.strokeStyle = C.line; x.lineWidth = 2; x.stroke(); x.beginPath(); x.arc(84, y + 48, 18, 0, 7); x.lineWidth = 3; x.strokeStyle = C.acc; x.stroke(); if (done) { x.fillStyle = C.acc; x.fill(); } x.fillStyle = C.fg; x.font = `600 27px ${I}`; x.fillText(L(r[0]), 124, y + 44); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(r[1]), 124, y + 76); });
  }
  function appTrades(x, S, t, A, AS, C) {
    x.fillStyle = C.sub; x.font = `600 23px ${I}`; x.fillText(A.brand.toUpperCase() + ' · ' + L(['PROJECT', 'OBRA', 'PROJEKT']), 46, 160); x.fillStyle = C.fg; x.font = `800 50px ${D}`; x.fillText(L(A.t), 46, 222); x.fillStyle = C.sub; x.font = `400 24px ${I}`; x.fillText(L(A.k) + ' · ' + L(A.s), 46, 262);
    const pr = (A.prog[0] + (AS.ok ? 1 : 0)) / A.prog[1]; rp(x, 46, 300, 568, 16, 8); x.fillStyle = C.line; x.fill(); rp(x, 46, 300, 568 * pr, 16, 8); x.fillStyle = C.acc; x.fill(); x.fillStyle = C.fg; x.font = `600 22px ${I}`; x.fillText(Math.round(pr * 100) + '% ' + L(['complete', 'concluído', 'færdig']), 46, 352);
    x.fillStyle = C.fg; x.font = `700 30px ${D}`; x.fillText(L(['Today on site', 'Hoje em obra', 'I dag på stedet']), 46, 430);
    [['#4b5563', '#9ca3af'], ['#78350f', '#d97706'], ['#1e3a8a', '#60a5fa']].forEach((g2, i) => { const X = 36 + i * 200; const gg = x.createLinearGradient(X, 460, X + 188, 640); gg.addColorStop(0, g2[0]); gg.addColorStop(1, g2[1]); rp(x, X, 456, 188, 188, 22); x.fillStyle = gg; x.fill(); x.fillStyle = 'rgba(0,0,0,.45)'; rp(x, X + 12, 600, 110, 32, 16); x.fill(); x.fillStyle = '#fff'; x.font = `600 18px ${I}`; x.fillText('09:4' + i, X + 30, 622); });
    rp(x, 36, 680, 588, 220, 30); x.fillStyle = C.card; x.fill(); x.fillStyle = C.sub; x.font = `600 22px ${I}`; x.fillText(L(['QUOTE #Q-1187', 'ORÇAMENTO #Q-1187', 'TILBUD #Q-1187']), 66, 728); x.fillStyle = C.fg; x.font = `800 54px ${D}`; x.fillText('€9,643', 66, 790);
    appCTA(x, S, AS, A, C, 66, 812, 528, 68);
    rowList(x, A, C, 930, 2);
  }
  function appGym(x, S, t, A, AS, C) {
    x.fillStyle = C.fg; x.font = `800 48px ${D}`; x.fillText(L(A.hi) + ' ' + A.who, 46, 190);
    const cx = 200, cy = 380, rings = [[110, C.acc, .82], [82, C.acc2, .64], [54, '#ff4d8d', .9]];
    rings.forEach(r => { x.lineWidth = 22; x.strokeStyle = r[1] + '33'; x.beginPath(); x.arc(cx, cy, r[0], 0, 7); x.stroke(); x.strokeStyle = r[1]; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy, r[0], -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r[2] * ease(st.kpiT || 1)); x.stroke(); x.lineCap = 'butt'; });
    [[['Move', 'Mexer', 'Bevæg'], '540', C.acc], [['Train', 'Treinar', 'Træn'], '48 min', C.acc2], [['Streak', 'Série', 'Stime'], '12 🔥', '#ff4d8d']].forEach((s, i) => { x.fillStyle = s[2]; x.font = `600 22px ${I}`; x.fillText(L(s[0]).toUpperCase(), 360, 320 + i * 70); x.fillStyle = C.fg; x.font = `800 34px ${D}`; x.fillText(s[1], 360, 352 + i * 70); });
    const bars = [40, 70, 55, 90, 30, 80, 60]; bars.forEach((b, i) => { rp(x, 56 + i * 82, 700 - b * 1.6, 50, b * 1.6, 12); x.fillStyle = i === 3 ? C.acc : '#2a2a2a'; x.fill(); });
    rp(x, 36, 740, 588, 260, 32); x.fillStyle = C.card; x.fill(); x.fillStyle = C.acc; x.font = `600 22px ${I}`; x.fillText(L(A.k), 66, 790); x.fillStyle = C.fg; x.font = `800 44px ${D}`; x.fillText(L(A.t), 66, 846); x.fillStyle = C.sub; x.font = `400 23px ${I}`; x.fillText(L(A.s), 66, 884);
    appCTA(x, S, AS, A, C, 66, 908, 528, 68);
    rowList(x, A, C, 1030, 2);
  }
  function appShop(x, S, t, A, AS, C) {
    x.fillStyle = C.fg; x.font = `800 44px ${D}`; x.fillText('Velochique', 46, 180); x.fillStyle = C.sub; x.font = `500 24px ${I}`; x.fillText(L(A.hi) + ' ' + A.who, 46, 216);
    rp(x, 36, 246, 588, 440, 36); x.save(); x.clip(); x.fillStyle = '#cfe9e4'; x.fillRect(36, 246, 588, 440); x.fillStyle = '#9fd5ea'; x.beginPath(); x.moveTo(36, 520); x.bezierCurveTo(200, 470, 380, 640, 624, 560); x.lineTo(624, 686); x.lineTo(36, 686); x.fill();
    x.strokeStyle = '#ffffff'; x.lineWidth = 10; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(36, 300 + i * 70); x.lineTo(624, 260 + i * 80); x.stroke(); }
    x.strokeStyle = C.acc; x.lineWidth = 9; x.setLineDash([22, 14]); x.lineDashOffset = -t * 40; x.beginPath(); x.moveTo(110, 600); x.bezierCurveTo(220, 420, 380, 520, 540, 320); x.stroke(); x.setLineDash([]);
    [[110, 600, C.acc2], [540, 320, C.acc]].forEach(p => { x.beginPath(); x.arc(p[0], p[1], 22, 0, 7); x.fillStyle = p[2]; x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke(); }); x.restore();
    [[['Distance', 'Distância', 'Distance'], '28 km'], [['Time', 'Tempo', 'Tid'], '4 h'], [['Bikes', 'Bicicletas', 'Cykler'], '2']].forEach((s, i) => { const X = 36 + i * 200; rp(x, X, 712, 188, 120, 24); x.fillStyle = C.card; x.fill(); x.strokeStyle = C.line; x.lineWidth = 2; x.stroke(); x.fillStyle = C.sub; x.font = `500 21px ${I}`; x.fillText(L(s[0]), X + 22, 754); x.fillStyle = C.fg; x.font = `800 36px ${D}`; x.fillText(s[1], X + 22, 802); });
    appCTA(x, S, AS, A, C, 36, 860, 588, 86);
    rowList(x, A, C, 976, 2);
  }
  function drawPhoneWeb(x, S, t) { drawConcept(x, S, t, 1); x.fillStyle = WEB[TYPES[st.type].k].fg; x.font = `600 27px ${I}`; x.fillText('9:41', 66, 66); }
  function cursor(x, S, big) {
    if (!S.cur || !focus) return;
    const { x: cx, y: cy } = S.cur;
    if (S === SP) { x.fillStyle = S.down ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(cx, cy, 34, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.5; x.stroke(); return; }
    x.save(); x.translate(cx, cy); x.scale(big, big); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 26); x.lineTo(6.5, 20); x.lineTo(11, 30); x.lineTo(15, 28.5); x.lineTo(10.6, 18.8); x.lineTo(19, 18.6); x.closePath(); x.fillStyle = '#111'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.restore();
  }
  function paintLaptop(t) {
    const S = SL, x = S.x; S.hot = []; S.anim = false;
    const mode = st.prod === 0 ? 'web' : 'crm';
    const draw = m => (m === 'web' ? drawWeb : drawCRM)(x, S, t);
    if (st.wipe < 1 && st.from) { const w = ease(st.wipe); draw(st.from); x.save(); x.beginPath(); x.rect(0, 0, S.w * w, S.h); x.clip(); draw(mode); x.restore(); x.fillStyle = 'rgba(77,124,255,.9)'; x.fillRect(S.w * w - 3, 0, 6, S.h); S.hot = []; }
    else draw(mode);
    cursor(x, S, 2.6); S.tex.needsUpdate = true;
  }
  function paintPhone(t) {
    const S = SP, x = S.x; S.hot = []; S.anim = false;
    x.clearRect(0, 0, S.w, S.h); x.save(); rp(x, 0, 0, S.w, S.h, 92); x.clip();
    if (st.prod === 0) drawPhoneWeb(x, S, t); else drawApp(x, S, t);
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
    if (p === 'web') { title = WEB[ty.k].brand; sub = ['Concept site for a ' + ty.n[0].toLowerCase() + ' — designed by Vero', 'Site conceito para ' + ty.n[1].toLowerCase() + ' — desenhado pela Vero', 'Konceptside til ' + ty.n[2].toLowerCase() + ' — designet af Vero']; }
    else if (p === 'crm') { title = [ty.n[0] + ' CRM', 'CRM · ' + ty.n[1], ty.n[2] + '-CRM']; sub = ['Pipeline, bookings and an AI assistant — built around how they work', 'Pipeline, marcações e assistente AI — à medida de como trabalham', 'Pipeline, booking og AI-assistent — bygget efter, hvordan de arbejder']; }
    else { const A = APPS[ty.crm]; title = A.brand + ' app'; sub = ['Bookings, loyalty and live updates — synced with the CRM', 'Reservas, fidelização e atualizações — sincronizadas com o CRM', 'Booking, loyalitet og live-opdateringer — synkroniseret med CRM']; }
    return `<span class="dc-k"><i></i>${t3(kick)}</span><b>${Array.isArray(title) ? t3(title) : title}</b><small>${t3(sub)}</small><span class="dc-try"><i></i>${t3(touch ? ['Interactive — tap the screen and try it', 'Interativo — toque no ecrã e experimente', 'Interaktiv — tryk på skærmen og prøv'] : ['Interactive — click the screen and try it', 'Interativo — clique no ecrã e experimente', 'Interaktiv — klik på skærmen og prøv'])}</span><button type="button" class="dc-go">${t3(['Configure', 'Personalizar', 'Tilpas'])} <span aria-hidden="true">→</span></button>`;
  }
  function setCaption(force) { const h = captionHTML(); if (!force && cap.dataset.h === h) return; cap.dataset.h = h; cap.classList.remove('on'); setTimeout(() => { cap.innerHTML = h; cap.querySelector('.dc-go').onclick = () => focusOn(PROD[st.prod].dev); cap.classList.add('on'); }, force ? 0 : 220); }
  function renderCfg() {
    const ty = TYPES[st.type], p = PROD[st.prod];
    cfg.innerHTML = `
      <div class="cf-h"><span>${t3(['Live configurator', 'Configurador ao vivo', 'Live-konfigurator'])}</span><b>${t3(['Make it yours', 'Torne-o seu', 'Gør det til dit'])}</b><button type="button" class="cf-x" aria-label="Close"><i></i></button></div>
      <div class="cf-try"><i></i><span><b>${t3(['This is a working demo.', 'Isto é uma demo real.', 'Dette er en rigtig demo.'])}</b> ${t3([PROD[st.prod].dev === 'phone' ? 'Tap the buttons on the phone — they work.' : 'Click the buttons on the screen — they work.', PROD[st.prod].dev === 'phone' ? 'Toque nos botões do telemóvel — funcionam.' : 'Clique nos botões do ecrã — funcionam.', PROD[st.prod].dev === 'phone' ? 'Tryk på knapperne på telefonen — de virker.' : 'Klik på knapperne på skærmen — de virker.'])}</span></div>
      <div class="cf-seg">${PROD.map((q, i) => `<button type="button" data-p="${i}" class="${i === st.prod ? 'on' : ''}">${t3(q.w)}</button>`).join('')}</div>
      <small class="cf-l">${t3(['Type of business', 'Tipo de negócio', 'Type virksomhed'])}</small>
      <div class="cf-types">${TYPES.map((q, i) => `<button type="button" data-t="${i}" class="${i === st.type ? 'on' : ''}">${svgI(ICON[q.k])}<span>${t3(q.n)}</span></button>`).join('')}</div>
      <div class="cf-info"><b>${p.k === 'web' ? WEB[ty.k].brand + ' · ' + t3(['concept site', 'site conceito', 'konceptside']) : p.k === 'crm' ? t3([ty.n[0] + ' CRM', 'CRM · ' + ty.n[1], ty.n[2] + '-CRM']) : APPS[ty.crm].brand + ' app'}</b>
        <ul>${FACTS[p.k].map(f => `<li>${t3(f)}</li>`).join('')}</ul></div>
      <p class="cf-note"><b>${t3(['100% custom.', '100% à medida.', '100 % skræddersyet.'])}</b> ${t3(['Every screen is designed from a blank page for your business — colours, content, flows. Nothing comes from a template.', 'Cada ecrã é desenhado de raiz para o seu negócio — cores, conteúdos, fluxos. Nada vem de um template.', 'Hver skærm designes fra bunden til din virksomhed — farver, indhold, flows. Intet kommer fra en skabelon.'])}</p>
      <div class="cf-f"><a class="btn p" href="contact.html">${t3(['Design mine', 'Desenhar o meu', 'Design min'])} →</a></div>`;
    cfg.querySelector('.cf-x').onclick = unfocus;
    cfg.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { setProd(+b.dataset.p, true); focusOn(PROD[st.prod].dev, true); });
    cfg.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { setType(+b.dataset.t); renderCfg(); });
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
  function setType(i) { st.type = i; st.before = false; st.kpiT = 0; st.wipe = 0; st.from = st.prod === 0 ? 'web' : 'crm'; dirtyL = dirtyP = true; setCaption(); ['estate/e1', 'estate/e2', 'estate/e3', 'house/f', 'house/y', 'house/k1', 'house/k2', 'house/k3', 'house/b1', 'house/b2', 'house/s1', 'house/s2', 'house/s3', 'padel/k1', 'padel/k2', 'padel/k3'].forEach(img); }
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
      if (z) handleHot(z.id);
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
    const animL = dirtyL || st.wipe < 1 || st.kpiT < 1 || (C && C.moving && tn - C.moving.t0 < .6) || tn - st.toastAt < 3.5 || SL.anim;
    if (animL && tn - lastL > 1 / 30) { paintLaptop(t); lastL = tn; dirtyL = false; }
    const animP = dirtyP || tn - st.pushAt < 3.7 || SP.anim;
    if (animP && tn - lastP > 1 / 30) { paintPhone(t); lastP = tn; dirtyP = false; }
    renderer.render(scene, camera);
  }
  const start = () => { setType(st.type); setWord(0); btns[0].classList.add('on'); setCaption(true); paintLaptop(0); paintPhone(0); loop(); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => setTimeout(start, 50));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); loop(); } });
})();
