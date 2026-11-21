/* Vero — side menu with all services (every page).
   Desktop: slides in from the left (edge tab or the "Services" nav link).
   Mobile: full-screen panel, opened from the floating "Services" button or the burger menu. */
(function () {
  const D = window.VERO_SERVICES;
  if (!D) return;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const t3 = o => `<span data-en>${o.en}</span><span data-pt>${o.pt}</span><span data-da>${o.da}</span>`;
  const UI = {
    title: { en: 'Some of our services', pt: 'Alguns dos nossos serviços', da: 'Nogle af vores ydelser' },
    search: { en: 'Search a service…', pt: 'Procurar um serviço…', da: 'Søg efter en ydelse…' },
    empty: { en: 'Nothing found. Tell us the problem and we’ll pick the service.', pt: 'Nada encontrado. Diga-nos o problema e escolhemos o serviço por si.', da: 'Intet fundet. Fortæl os problemet, så vælger vi ydelsen.' },
    all: { en: 'See all 39 services', pt: 'Ver os 39 serviços', da: 'Se alle 39 ydelser' },
    call: { en: 'Book a call', pt: 'Marcar chamada', da: 'Book et opkald' },
    tab: { en: 'Services', pt: 'Serviços', da: 'Ydelser' },
    close: { en: 'Close', pt: 'Fechar', da: 'Luk' },
    explore: { en: 'All services', pt: 'Todos os serviços', da: 'Alle ydelser' }
  };
  const ICON = {
    ai: '<path d="M12 3v3M8 7h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"/><path d="M9.5 12h.01M14.5 12h.01M9.5 15.5h5"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    ads: '<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    loop: '<path d="M20 11a8 8 0 0 0-14.6-4.5M4 13a8 8 0 0 0 14.6 4.5"/><path d="M5 3v4h4M19 21v-4h-4"/>',
    brand: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>'
  };
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const lang = () => document.documentElement.lang || 'en';
  const onServices = !!$('#svGrid');
  const href = it => onServices ? `#svc-${it.id}` : `services.html?s=${it.id}#svc-${it.id}`;

  // ---------- build
  const groups = Object.keys(D.cats).map((c, gi) => {
    const items = D.items.filter(i => i.c === c);
    return `<section class="sm-g${gi === 0 ? ' open' : ''}" data-c="${c}">
      <button class="sm-gh" aria-expanded="${gi === 0}"><span class="sm-ic">${svg(ICON[c] || ICON.ai)}</span><b>${t3(D.cats[c])}</b><i>${items.length}</i><span class="sm-chev"></span></button>
      <div class="sm-gb"><div>${items.map(i => `<a class="sm-it" href="${href(i)}" data-id="${i.id}" data-q="${(i.t.en + ' ' + i.t.pt + ' ' + i.t.da + ' ' + i.d.en + ' ' + i.d.pt + ' ' + i.d.da).toLowerCase().replace(/"/g, '')}"><b>${t3(i.t)}</b><span>${t3(i.d)}</span></a>`).join('')}</div></div>
    </section>`;
  }).join('');

  const root = document.createElement('div');
  root.id = 'sidemenu';
  root.innerHTML = `
    <div class="sm-veil" data-close></div>
    <aside class="sm-panel" role="dialog" aria-modal="true" aria-labelledby="sm-title" tabindex="-1">
      <header class="sm-head">
        <h2 id="sm-title">${t3(UI.title)}</h2>
        <button class="sm-x" data-close aria-label="${UI.close.en}"><span></span></button>
      </header>
      <label class="sm-search">${svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>')}
        <input type="search" autocomplete="off" spellcheck="false" aria-label="${UI.search.en}">
      </label>
      <div class="sm-chips">${Object.keys(D.cats).map(c => `<button data-jump="${c}">${t3(D.cats[c])}</button>`).join('')}</div>
      <div class="sm-body">${groups}<p class="sm-empty">${t3(UI.empty)}</p></div>
      <footer class="sm-foot">
        <a class="btn g" href="services.html">${t3(UI.all)}</a>
        <a class="btn p" href="contact.html">${t3(UI.call)}</a>
      </footer>
    </aside>
    <button class="sm-tab" aria-label="${UI.all.en}"><span class="sm-tab-i">${svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>')}</span><span class="sm-tab-t">${t3(UI.explore)}</span><kbd>${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'} K</kbd></button>
    <button class="sm-fab" aria-label="${UI.tab.en}">${svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>')}<span>${t3(UI.tab)}</span></button>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.sm-panel'), input = root.querySelector('input'), body = root.querySelector('.sm-body');
  const setPh = () => { const l = lang(); input.placeholder = (UI.search[l] || UI.search.en); };
  setPh(); new MutationObserver(setPh).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // ---------- open / close
  let lastFocus = null, scrollY0 = 0;
  function open(cat) {
    if (root.classList.contains('open')) return;
    lastFocus = document.activeElement;
    if (window.VERO_MNAV) window.VERO_MNAV(false);
    root.classList.add('open'); document.documentElement.classList.add('sm-lock');
    if (cat) expand(cat, true);
    setTimeout(() => (matchMedia('(hover:hover)').matches ? input : panel).focus({ preventScroll: true }), 60);
  }
  function close() {
    root.classList.remove('open'); document.documentElement.classList.remove('sm-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  root.querySelector('.sm-tab').addEventListener('click', () => open());
  root.querySelector('.sm-fab').addEventListener('click', () => open());
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); root.classList.contains('open') ? close() : open(); return; }
    if (!root.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the panel
      const f = [...panel.querySelectorAll('button,a,input')].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // "Services" in the desktop nav and in the burger menu open the panel
  $$('.nav .links a[href="services.html"], #mnav a[href="services.html"]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation(); open();
  }, true));

  // ---------- accordion + chips
  function expand(c, only) {
    root.querySelectorAll('.sm-g').forEach(g => {
      const on = g.dataset.c === c ? true : (only ? false : g.classList.contains('open'));
      g.classList.toggle('open', on); g.querySelector('.sm-gh').setAttribute('aria-expanded', on);
    });
    root.querySelectorAll('.sm-chips button').forEach(b => b.classList.toggle('on', b.dataset.jump === c));
  }
  root.querySelectorAll('.sm-gh').forEach(h => h.addEventListener('click', () => {
    const g = h.parentElement, on = !g.classList.contains('open');
    g.classList.toggle('open', on); h.setAttribute('aria-expanded', on);
  }));
  root.querySelectorAll('.sm-chips button').forEach(b => b.addEventListener('click', () => {
    input.value = ''; search();
    expand(b.dataset.jump, true);
    const g = root.querySelector(`.sm-g[data-c="${b.dataset.jump}"]`);
    body.scrollTo({ top: g.offsetTop - body.offsetTop - 4, behavior: 'smooth' });
  }));

  // ---------- search
  function search() {
    const q = input.value.trim().toLowerCase();
    root.classList.toggle('searching', !!q);
    let total = 0;
    root.querySelectorAll('.sm-g').forEach(g => {
      let n = 0;
      g.querySelectorAll('.sm-it').forEach(a => { const hit = !q || a.dataset.q.includes(q); a.hidden = !hit; if (hit) n++; });
      g.hidden = q && !n; if (q && n) g.classList.add('open'); total += n;
      const ct = g.querySelector('.sm-gh i'); ct.dataset.n = ct.dataset.n || ct.textContent; ct.textContent = q ? n : ct.dataset.n;
    });
    root.querySelector('.sm-empty').hidden = total > 0;
  }
  input.addEventListener('input', search); search();

  // ---------- deep link on the services page: show + highlight the card
  function reveal(id) {
    const card = document.getElementById('svc-' + id);
    if (!card) return;
    const it = D.items.find(i => i.id === id);
    const tab = it && $(`#svTabs [data-f="${it.c}"]`);
    if (tab && card.classList.contains('hide')) tab.click();
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    }, 60);
  }
  root.querySelectorAll('.sm-it').forEach(a => a.addEventListener('click', e => {
    if (!onServices) return;
    e.preventDefault(); close(); history.replaceState(null, '', '#svc-' + a.dataset.id); setTimeout(() => reveal(a.dataset.id), 250);
  }));
  if (onServices) {
    const s = new URLSearchParams(location.search).get('s') || (location.hash.startsWith('#svc-') ? location.hash.slice(5) : '');
    if (s) addEventListener('load', () => setTimeout(() => reveal(s), 300));
  }

  // mobile button appears once you've scrolled past the first screen
  const fabTick = () => root.classList.toggle('fab-on', scrollY > innerHeight * 0.85);
  const crmSec = document.getElementById('crm');
  if (crmSec && 'IntersectionObserver' in window) new IntersectionObserver(es => root.classList.toggle('crm-in', es[0].isIntersecting), { rootMargin: '-10% 0px -10% 0px' }).observe(crmSec);
  addEventListener('scroll', fabTick, { passive: true }); fabTick();
  // hide the edge tab / floating button while the footer CTA is on screen
  const ft = $('.ft-cta') || $('footer');
  if (ft && 'IntersectionObserver' in window) new IntersectionObserver(es => root.classList.toggle('ft-in', es[0].isIntersecting)).observe(ft);
})();
