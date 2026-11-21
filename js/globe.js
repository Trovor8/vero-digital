/* Vero Digital — interactive dotted globe highlighting UK, Portugal and Denmark */
window.VERO_GLOBE2D = function () {
  const cv = document.getElementById('globe');
  if (!cv || !window.d3 || !window.topojson || !window.WORLD) return;
  const ctx = cv.getContext('2d');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const HL = { '826': 'uk', '620': 'pt', '208': 'dk' };
  const CITIES = [
    { k: 'uk', dx: -150, dy: -34, ll: [-0.13, 51.5], en: 'United Kingdom', pt: 'Reino Unido', da: 'Storbritannien' },
    { k: 'pt', dx: -120, dy: 10, ll: [-9.14, 38.72], en: 'Portugal', pt: 'Portugal', da: 'Portugal' },
    { k: 'dk', dx: 16, dy: -40, ll: [12.57, 55.68], en: 'Denmark', pt: 'Dinamarca', da: 'Danmark' }
  ];
  const ARCS = [[0, 1], [1, 2], [2, 0]];

  const land = topojson.feature(WORLD, WORLD.objects.land);
  const countries = topojson.feature(WORLD, WORLD.objects.countries).features;
  const hlFeatures = countries.filter(f => HL[f.id]);

  // land dots (precomputed in js/dots.js: lon, lat, highlighted)
  const dots = [];
  if (window.DOTS) { for (let i = 0; i < DOTS.length; i += 3) dots.push({ p: [DOTS[i], DOTS[i + 1]], hl: DOTS[i + 2] === 1 }); }
  else {
    for (let lat = -84; lat <= 84; lat += 2) { const ls = 2 / Math.max(.2, Math.cos(lat * Math.PI / 180));
      for (let lon = -180; lon < 180; lon += ls) { const p = [lon, lat]; if (d3.geoContains(land, p)) dots.push({ p, hl: hlFeatures.some(f => d3.geoContains(f, p)) }); } }
  }
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
  const path = d3.geoPath(proj, ctx);
  const grat = d3.geoGraticule10();
  let W = 0, H = 0, R = 0, cx = 0, cy = 0;
  const HOME = [2, -43, 0];
  let rot = HOME.slice(), dragging = false, last = null, t0 = performance.now(), idle = 0;

  function size() {
    const b = cv.getBoundingClientRect();
    W = b.width; H = b.height;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const wide = W > 1000; R = wide ? Math.min(H * 0.56, W * 0.36) : Math.min(W, H) * 0.4; cx = wide ? W * 0.7 : W / 2; cy = wide ? H / 2 + R * 0.12 : H / 2;
    proj.scale(R).translate([cx, cy]);
  }
  size(); addEventListener('resize', size);

  cv.addEventListener('pointerdown', e => { dragging = true; last = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    rot[0] += dx * 0.25; rot[1] = Math.max(-75, Math.min(15, rot[1] - dy * 0.25)); idle = 0;
  });
  addEventListener('pointerup', () => dragging = false);

  const lift = (ll, h) => { // project with altitude h (fraction of radius)
    const p = proj(ll); if (!p) return null;
    return [cx + (p[0] - cx) * (1 + h), cy + (p[1] - cy) * (1 + h)];
  };
  const visible = ll => d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - 0.02;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let running = true;
  new IntersectionObserver(e => running = e[0].isIntersecting).observe(cv);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) return;
    const t = (now - t0) / 1000;
    if (!dragging) { idle += 1; // drift gently around Europe, ease back after a drag
      const tx = HOME[0] + (reduce ? 0 : Math.sin(t * 0.12) * 22), ty = HOME[1] + (reduce ? 0 : Math.sin(t * 0.09) * 6);
      const k = idle > 90 ? 0.02 : 0; rot[0] += (tx - rot[0]) * k; rot[1] += (ty - rot[1]) * k; }
    proj.rotate(rot);
    ctx.clearRect(0, 0, W, H);

    // atmosphere
    let g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
    g.addColorStop(0, 'rgba(77,124,255,.20)'); g.addColorStop(1, 'rgba(77,124,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, 7); ctx.fill();
    // sphere
    g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, '#1d1c1f'); g.addColorStop(1, '#06080e');
    ctx.fillStyle = g; ctx.beginPath(); path({ type: 'Sphere' }); ctx.fill();
    ctx.strokeStyle = 'rgba(255,122,69,.35)'; ctx.lineWidth = 1; ctx.stroke();
    // graticule
    ctx.beginPath(); path(grat); ctx.strokeStyle = 'rgba(226,233,248,.05)'; ctx.lineWidth = .7; ctx.stroke();

    // dots
    const centre = [-rot[0], -rot[1]];
    for (const d of dots) {
      const dist = d3.geoDistance(d.p, centre);
      if (dist > Math.PI / 2) continue;
      const q = proj(d.p); const a = Math.cos(dist);
      if (d.hl) { ctx.fillStyle = `rgba(255,90,31,${.55 + a * .45})`; ctx.fillRect(q[0] - 1.1, q[1] - 1.1, 2.2, 2.2); }
      else { ctx.fillStyle = `rgba(243,240,232,${.10 + a * .42})`; const s = .8 + a * 1.1; ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); }
    }
    // highlighted countries
    for (const f of hlFeatures) {
      ctx.beginPath(); path(f);
      ctx.fillStyle = 'rgba(77,124,255,.45)'; ctx.fill();
      ctx.strokeStyle = '#22D3EE'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // arcs + travelling pulses
    ARCS.forEach(([i, j], n) => {
      const A = CITIES[i].ll, B = CITIES[j].ll, interp = d3.geoInterpolate(A, B);
      ctx.beginPath(); let started = false;
      for (let s = 0; s <= 40; s++) {
        const u = s / 40, ll = interp(u);
        if (!visible(ll)) { started = false; continue; }
        const p = lift(ll, Math.sin(Math.PI * u) * 0.16);
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = 'rgba(255,122,69,.55)'; ctx.lineWidth = 1.4; ctx.stroke();
      const u = ((t * 0.32) + n / 3) % 1, ll = interp(u);
      if (visible(ll)) {
        const p = lift(ll, Math.sin(Math.PI * u) * 0.16);
        const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 10);
        gg.addColorStop(0, 'rgba(255,170,120,1)'); gg.addColorStop(1, 'rgba(77,124,255,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, 7); ctx.fill();
      }
    });
    // city markers + labels
    const lang = document.documentElement.lang || 'en';
    CITIES.forEach((c, n) => {
      if (!visible(c.ll)) return;
      const p = proj(c.ll), ph = ((t * .8) + n * .33) % 1;
      ctx.strokeStyle = `rgba(255,90,31,${1 - ph})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p[0], p[1], 4 + ph * 18, 0, 7); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 7); ctx.fill();
      const label = c[lang] || c.en;
      ctx.font = '600 12px Inter, system-ui, sans-serif';
      const w = ctx.measureText(label).width + 18, lx = c.dx < 0 ? p[0] + c.dx + (110 - w) : p[0] + c.dx, ly = p[1] + c.dy;
      ctx.strokeStyle = 'rgba(255,122,69,.5)'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(c.dx < 0 ? lx + w : lx, ly + 12); ctx.stroke();
      ctx.fillStyle = 'rgba(7,10,18,.82)'; ctx.strokeStyle = 'rgba(255,122,69,.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(lx, ly, w, 24, 12); else ctx.rect(lx, ly, w, 24); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#EEF2FA'; ctx.fillText(label, lx + 9, ly + 16);
    });
  }
  requestAnimationFrame(frame);
  cv.parentElement && cv.parentElement.classList.add('ready');
};
if (!window.VERO_GL) window.VERO_GLOBE2D();
