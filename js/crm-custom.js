/* Vero — "Make it yours": live customiser for the CRM demo.
   Brand name + colour, theme (dark / light / glass), corners, typeface, modules on/off and an exploded
   "blueprint" view that shows the CRM is assembled from blocks built for each client.
   Plays a short showcase once when the demo first comes into view. */
(function () {
  const root = document.getElementById('crm');
  const app = root && root.querySelector('.crm-app');
  if (!app) return;
  const t3 = (en, pt, da) => `<span data-en>${en}</span><span data-pt>${pt}</span><span data-da>${da}</span>`;
  const L = (o) => o[document.documentElement.lang] || o.en;

  const COLORS = [['#ff5a1f', 'Vero'], ['#2f6bff', 'Ocean'], ['#12b886', 'Emerald'], ['#8b5cf6', 'Violet'], ['#f43f5e', 'Rose'], ['#d4a72c', 'Gold']];
  const FONTS = {
    modern: { b: '', d: '' },
    editorial: { b: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif", d: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif" },
    mono: { b: "ui-monospace,'SF Mono',Menlo,Consolas,monospace", d: "ui-monospace,'SF Mono',Menlo,Consolas,monospace" }
  };
  const state = { name: '', color: '#ff5a1f', theme: 'dark', rad: 'soft', font: 'modern', kpis: true, side: true, blue: false };
  const DEF = Object.assign({}, state);

  // ---------- bar button + drawer
  const bar = app.querySelector('.crm-bar');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'crm-czbtn';
  btn.innerHTML = `<i></i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg>${t3('Customize', 'Personalizar', 'Tilpas')}`;
  bar.appendChild(btn);

  const seg = (k, opts) => `<div class="cz-seg" data-k="${k}">${opts.map(o => `<button type="button" data-v="${o[0]}">${t3(o[1], o[2], o[3])}</button>`).join('')}</div>`;
  const tog = (k, en, pt, da) => `<label class="cz-tog"><span>${t3(en, pt, da)}</span><input type="checkbox" data-k="${k}"><i></i></label>`;
  const dr = document.createElement('aside');
  dr.className = 'crm-cz'; dr.setAttribute('aria-label', 'Customise this CRM');
  dr.innerHTML = `
    <div class="cz-h"><b>${t3('Make it yours', 'Torne-o seu', 'Gør det til dit')}</b><span class="cz-live"><i></i>${t3('Live preview', 'Pré-visualização ao vivo', 'Live forhåndsvisning')}</span><button type="button" class="cz-x" aria-label="Close">×</button></div>
    <div class="cz-scroll">
      <div class="cz-f"><small>${t3('Business name', 'Nome do negócio', 'Virksomhedsnavn')}</small><input class="cz-name" type="text" maxlength="28" spellcheck="false" autocomplete="off"></div>
      <div class="cz-f"><small>${t3('Brand colour', 'Cor da marca', 'Brandfarve')}</small><div class="cz-sw">${COLORS.map(c => `<button type="button" data-c="${c[0]}" style="--c:${c[0]}" title="${c[1]}"></button>`).join('')}<label class="cz-pick" title="Custom"><input type="color" value="#ff5a1f"><span>+</span></label></div></div>
      <div class="cz-f"><small>${t3('Theme', 'Tema', 'Tema')}</small>${seg('theme', [['dark', 'Dark', 'Escuro', 'Mørk'], ['light', 'Light', 'Claro', 'Lys'], ['glass', 'Glass', 'Vidro', 'Glas']])}</div>
      <div class="cz-f"><small>${t3('Corners', 'Cantos', 'Hjørner')}</small>${seg('rad', [['sharp', 'Sharp', 'Retos', 'Skarpe'], ['soft', 'Soft', 'Suaves', 'Bløde'], ['round', 'Round', 'Redondos', 'Runde']])}</div>
      <div class="cz-f"><small>${t3('Typeface', 'Tipo de letra', 'Skrifttype')}</small>${seg('font', [['modern', 'Modern', 'Moderna', 'Moderne'], ['editorial', 'Editorial', 'Editorial', 'Redaktionel'], ['mono', 'Mono', 'Mono', 'Mono']])}</div>
      <div class="cz-f"><small>${t3('Modules', 'Módulos', 'Moduler')}</small>${tog('kpis', 'KPI cards', 'Cartões de KPI', 'KPI-kort')}${tog('side', 'Side navigation', 'Menu lateral', 'Sidemenu')}${tog('blue', 'Blueprint view', 'Vista de blueprint', 'Blueprint-visning')}</div>
      <div class="cz-f cz-more"><small>${t3('Built to order, too', 'E também feito à medida', 'Også bygget på bestilling')}</small>
        <p>${t3('Your own fields, pipeline stages, automations, roles & permissions, reports and integrations.', 'Os seus campos, etapas do pipeline, automações, perfis e permissões, relatórios e integrações.', 'Dine egne felter, pipeline-trin, automatiseringer, roller & rettigheder, rapporter og integrationer.')}</p>
        <div class="cz-int">${['WhatsApp', 'Stripe', 'Google Calendar', 'Shopify', 'Meta', 'Outlook', 'Moloni', 'Zapier', 'Your API'].map(x => `<span>${x}</span>`).join('')}</div></div>
    </div>
    <div class="cz-foot"><button type="button" class="cz-reset">${t3('Reset', 'Repor', 'Nulstil')}</button><a class="btn p" href="contact.html">${t3('Design mine', 'Desenhar o meu', 'Design min')} →</a></div>`;
  app.appendChild(dr);

  // ---------- strip under the app explaining customisation
  const strip = document.createElement('div');
  strip.className = 'crm-czstrip wrap';
  strip.innerHTML = `<b>${t3('100% custom', '100% à medida', '100 % skræddersyet')}</b><span>${t3('Your brand', 'A sua marca', 'Dit brand')}</span><span>${t3('Your fields', 'Os seus campos', 'Dine felter')}</span><span>${t3('Your workflow', 'O seu processo', 'Din arbejdsgang')}</span><span>${t3('Your integrations', 'As suas integrações', 'Dine integrationer')}</span><span>${t3('Your devices', 'Os seus dispositivos', 'Dine enheder')}</span><button type="button">${t3('Try it — customise this CRM', 'Experimente — personalize este CRM', 'Prøv det — tilpas dette CRM')} →</button>`;
  const hint = root.querySelector('.crm-hint');
  root.querySelector('.crm-pin').insertBefore(strip, hint || null);

  // showcase caption
  const cap = document.createElement('div'); cap.className = 'crm-czcap'; app.appendChild(cap);

  // ---------- apply
  function apply() {
    app.style.setProperty('--acc', state.color);
    app.style.setProperty('--rad', { sharp: .22, soft: 1, round: 1.75 }[state.rad]);
    const f = FONTS[state.font];
    if (f.b) { app.style.setProperty('--b', f.b); app.style.setProperty('--d', f.d); } else { app.style.removeProperty('--b'); app.style.removeProperty('--d'); }
    app.classList.toggle('th-light', state.theme === 'light');
    app.classList.toggle('th-glass', state.theme === 'glass');
    root.classList.toggle('cz-glass', state.theme === 'glass');
    app.classList.toggle('no-kpis', !state.kpis);
    app.classList.toggle('no-side', !state.side);
    app.classList.toggle('blueprint', state.blue);
    root.style.setProperty('--czc', state.color);
    // reflect controls
    dr.querySelectorAll('.cz-sw button').forEach(b => b.classList.toggle('on', b.dataset.c === state.color));
    dr.querySelectorAll('.cz-seg').forEach(s => s.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === state[s.dataset.k])));
    dr.querySelectorAll('.cz-tog input').forEach(i => { i.checked = !!state[i.dataset.k]; });
    const ni = dr.querySelector('.cz-name'); if (document.activeElement !== ni) ni.value = state.name; ni.placeholder = L({ en: 'e.g. Casa Lisboa', pt: 'ex.: Casa Lisboa', da: 'fx Casa Lisboa' });
    decorate();
  }
  // re-applied whenever the demo re-renders a niche
  const BLK = [['.crm-head', ['Branding', 'Marca', 'Branding']], ['.crm-kpis', ['KPI widgets', 'Widgets de KPI', 'KPI-widgets']], ['.cm-sub', ['Views', 'Vistas', 'Visninger']]];
  function decorate() {
    const nm = app.querySelector('.crm-head b');
    if (nm) {
      if (state.name) { if (!nm.dataset.orig) nm.dataset.orig = nm.innerHTML; nm.textContent = state.name; }
      else if (nm.dataset.orig) { nm.innerHTML = nm.dataset.orig; delete nm.dataset.orig; }
    }
    if (!state.blue) return;
    BLK.forEach(([sel, lab]) => { const el = app.querySelector(sel); if (el && !el.dataset.w) el.dataset.w = L({ en: lab[0], pt: lab[1], da: lab[2] }); });
    app.querySelectorAll('.cm-p,.crm-pipe,.crm-chat,.crm-autos').forEach((el, i) => {
      if (el.dataset.w) return;
      const h = el.querySelector('.cm-ph b, .crm-lbl');
      const ln = document.documentElement.lang || 'en'; const hs = h && (h.querySelector('[data-' + ln + ']') || h);
      el.dataset.w = (L({ en: 'Module', pt: 'Módulo', da: 'Modul' })) + ' · ' + (hs ? hs.textContent.trim().slice(0, 26) : '0' + (i + 1));
    });
  }
  const main = app.querySelector('.crm-main');
  new MutationObserver(() => decorate()).observe(main, { childList: true });

  // ---------- events
  const open = v => { app.classList.toggle('cz-open', v); btn.classList.add('used'); stopShow(); };
  btn.addEventListener('click', () => open(!app.classList.contains('cz-open')));
  dr.querySelector('.cz-x').addEventListener('click', () => open(false));
  strip.querySelector('button').addEventListener('click', () => { open(true); app.scrollIntoView ? null : null; });
  dr.querySelectorAll('.cz-sw button').forEach(b => b.addEventListener('click', () => { state.color = b.dataset.c; apply(); }));
  dr.querySelector('.cz-pick input').addEventListener('input', e => { state.color = e.target.value; apply(); });
  dr.querySelectorAll('.cz-seg button').forEach(b => b.addEventListener('click', () => { state[b.parentElement.dataset.k] = b.dataset.v; apply(); }));
  dr.querySelectorAll('.cz-tog input').forEach(i => i.addEventListener('change', () => { state[i.dataset.k] = i.checked; if (i.dataset.k === 'blue') app.querySelectorAll('[data-w]').forEach(x => delete x.dataset.w); apply(); }));
  dr.querySelector('.cz-name').addEventListener('input', e => { state.name = e.target.value.trim(); apply(); });
  dr.querySelector('.cz-reset').addEventListener('click', () => { Object.assign(state, DEF); apply(); });
  dr.addEventListener('wheel', e => e.stopPropagation(), { passive: true });

  // ---------- one-time showcase
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let showT = [], shown = false, showSave = null;
  function say(en, pt, da) { cap.innerHTML = `<i></i>${t3(en, pt, da)}`; cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on'); }
  function stopShow() { if (!showT.length) return; showT.forEach(clearTimeout); showT = []; cap.classList.remove('on'); if (showSave) { Object.assign(state, showSave); showSave = null; apply(); } }
  function showcase() {
    if (shown || reduce) return; shown = true;
    const save = showSave = Object.assign({}, state);
    const steps = [
      [600, () => { state.color = '#2f6bff'; say('Your brand colours', 'As cores da sua marca', 'Dine brandfarver'); }],
      [1900, () => { state.color = '#12b886'; state.rad = 'round'; say('Your style', 'O seu estilo', 'Din stil'); }],
      [3200, () => { state.theme = 'light'; state.font = 'editorial'; say('Light, dark or glass', 'Claro, escuro ou vidro', 'Lys, mørk eller glas'); }],
      [4600, () => { state.theme = 'dark'; state.blue = true; state.font = 'modern'; state.color = '#8b5cf6'; say('Built from blocks made for you', 'Feito de blocos criados para si', 'Bygget af blokke lavet til dig'); }],
      [7200, () => { showSave = null; Object.assign(state, save); cap.classList.remove('on'); btn.classList.add('nudge'); }]
    ];
    steps.forEach(([d, f]) => showT.push(setTimeout(() => { f(); apply(); if (d === 7200) showT = []; }, d)));
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es[0].intersectionRatio > 0.6) { setTimeout(showcase, 900); io.disconnect(); } }, { threshold: [0, 0.6, 1] });
    io.observe(app);
  }
  ['pointerdown', 'keydown'].forEach(ev => dr.addEventListener(ev, stopShow));
  new MutationObserver(() => { app.querySelectorAll('[data-w]').forEach(x => delete x.dataset.w); decorate(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  apply();
})();
