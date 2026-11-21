/* Vero — niche-specific CRM modules for the "One CRM, any business" demo.
   Each niche gets its own main screen (floor plan, clinic diary, event planner, buyer matching,
   class timetable, sales & stock, crew dispatch) plus a small live tick. Example data only. */
(function () {
  const T = a => `<span data-en>${a[0]}</span><span data-pt>${a[1]}</span><span data-da>${a[2]}</span>`;
  const S = (en, pt, da) => T([en, pt, da]);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // ---------------------------------------------------------------- restaurant: floor plan
  const TABLES = [
    // n, x%, y%, shape, state, info
    [1, 6, 10, 'r', 'seated', '2 · 19:10'], [2, 22, 10, 'r', 'booked', '21:00'], [3, 38, 10, 'r', 'free', ''],
    [4, 6, 52, 's', 'seated', '2 · 19:30'], [5, 22, 52, 's', 'bill', '€86'], [6, 38, 52, 's', 'free', ''],
    [7, 58, 8, 'l', 'booked', '4 · 20:00'], [8, 58, 40, 'l', 'seated', '5 · 19:00'],
    [9, 58, 72, 'l', 'booked', '6 · 20:30'], [10, 84, 8, 'r', 'free', ''], [11, 84, 40, 'r', 'booked', '8 · 20:00'], [12, 84, 72, 'r', 'seated', '3 · 19:45']
  ];
  const ST = { free: ['Free', 'Livre', 'Ledig'], booked: ['Booked', 'Reservada', 'Booket'], seated: ['Seated', 'Sentados', 'Ankommet'], bill: ['Bill', 'Conta', 'Regning'] };
  const rest = {
    lbl: ['Floor plan', 'Sala', 'Bordplan'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Tonight · main room', 'Esta noite · sala principal', 'I aften · hovedsal')}</b><span class="cm-chip g">${S('62 covers', '62 pessoas', '62 kuverter')}</span></div>
          <div class="cm-floor">${TABLES.map(t => `<div class="cm-tb ${t[3]} ${t[4]}" data-n="${t[0]}" style="left:${t[1]}%;top:${t[2]}%"><b>${t[0]}</b><small>${t[5]}</small></div>`).join('')}
            <span class="cm-zone" style="left:0;bottom:0">${S('Terrace →', 'Esplanada →', 'Terrasse →')}</span></div>
          <div class="cm-legend">${Object.keys(ST).map(k => `<span><i class="${k}"></i>${T(ST[k])}</span>`).join('')}</div></div>
        <div class="cm-p"><div class="cm-ph"><b>${S('Arrivals', 'Chegadas', 'Ankomster')}</b><span class="cm-mute">${S('auto-confirmed', 'confirmadas', 'auto-bekræftet')}</span></div>
          <div class="cm-list">${[
            ['20:00', 'Sofia M.', 4, 7, ['Birthday 🎂', 'Aniversário 🎂', 'Fødselsdag 🎂'], 'acc'],
            ['20:00', 'Mia B.', 8, 11, ['Set menu', 'Menu fechado', 'Fast menu'], ''],
            ['20:30', 'Ana P.', 6, 9, ['Nut allergy', 'Alergia a frutos secos', 'Nøddeallergi'], 'warn'],
            ['21:00', 'Tom R.', 2, 2, ['VIP · 12th visit', 'VIP · 12.ª visita', 'VIP · 12. besøg'], 'g'],
            ['21:15', 'Lars K.', 2, '—', ['Waitlist → T3', 'Lista de espera → M3', 'Venteliste → B3'], '']
          ].map(r => `<div class="cm-row"><time>${r[0]}</time><div><b>${r[1]}</b><small>${r[2]} ${S('guests', 'pessoas', 'gæster')} · ${S('table', 'mesa', 'bord')} ${r[3]}</small></div><span class="cm-chip ${r[5]}">${T(r[4])}</span></div>`).join('')}</div>
          <div class="cm-bars" title="Covers per hour">${[18, 34, 62, 88, 100, 74, 40].map((v, i) => `<i style="--h:${v}%"><em>${18 + i}h</em></i>`).join('')}</div></div>
      </div>`,
    live: v => {
      const order = ['free', 'booked', 'seated', 'bill'];
      const tb = pick([...v.querySelectorAll('.cm-tb')]);
      const cur = order.find(s => tb.classList.contains(s));
      const nx = order[(order.indexOf(cur) + 1) % 4];
      tb.classList.remove(cur); tb.classList.add(nx, 'flip');
      tb.querySelector('small').textContent = nx === 'free' ? '' : nx === 'bill' ? '€' + (40 + Math.floor(Math.random() * 120)) : nx === 'seated' ? (2 + Math.floor(Math.random() * 4)) + ' · now' : '21:' + pick(['00', '15', '30']);
      setTimeout(() => tb.classList.remove('flip'), 700);
    }
  };

  // ---------------------------------------------------------------- clinic: diary + patient file
  const H0 = 9, HN = 5; // 9:00 → 14:00
  const appt = (s, e, tr, who, b, cls = '') => ({ s, e, tr, who, b, cls });
  const DIARY = [
    [['Dr. Lopes', 'Dra. Lopes', 'Dr. Lopes'], [appt(9, 10, ['Facial', 'Limpeza de pele', 'Ansigtsbehandling'], 'Inês C.', '✓ €', 'sel'), appt(10.5, 11, ['Consult', 'Consulta', 'Konsultation'], 'Mark D.', '✓'), appt(11, 12.5, ['Botox', 'Botox', 'Botox'], 'Rita L.', '€'), appt(13, 14, ['Peel', 'Peeling', 'Peeling'], 'Sara V.', '✓')]],
    [['Dr. Berg', 'Dr. Berg', 'Dr. Berg'], [appt(9.5, 10.5, ['Dental check', 'Check-up dentário', 'Tandeftersyn'], 'Paul G.', '✓'), appt(10.5, 11.5, ['Whitening', 'Branqueamento', 'Tandblegning'], 'Freja N.', '✓ €'), appt(12, 13, ['Implant review', 'Revisão implante', 'Implantatkontrol'], 'Kim H.', '')]],
    [['Ana · nurse', 'Ana · enfermeira', 'Ana · sygeplejerske'], [appt(9, 9.5, ['Bloods', 'Análises', 'Blodprøve'], 'Tom A.', '✓'), appt(10, 11, ['Laser', 'Laser', 'Laser'], 'Bea M.', '€'), appt(11.5, 12, ['Aftercare', 'Pós-tratamento', 'Efterpleje'], 'Sara V.', '✓'), appt(12.5, 13.5, ['Open · AI filling', 'Livre · AI a preencher', 'Ledig · AI udfylder'], '', '', 'open')]]
  ];
  const clinic = {
    lbl: ['Diary', 'Agenda', 'Kalender'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Thursday · 3 practitioners', 'Quinta · 3 profissionais', 'Torsdag · 3 behandlere')}</b><span class="cm-chip g">${S('94% booked', '94% ocupada', '94% booket')}</span></div>
          <div class="cm-cal"><div class="cm-hrs">${Array.from({ length: HN + 1 }, (_, i) => `<span style="top:${i / HN * 100}%">${H0 + i}:00</span>`).join('')}</div>
            ${DIARY.map(c => `<div class="cm-calc"><div class="cm-calh">${T(c[0])}</div><div class="cm-calb">${c[1].map(a => `<div class="cm-ap ${a.cls}" style="top:${(a.s - H0) / HN * 100}%;height:calc(${(a.e - a.s) / HN * 100}% - 3px)"><b>${T(a.tr)}</b>${a.who ? `<small>${a.who}${a.b ? ` <em>${a.b}</em>` : ''}</small>` : ''}</div>`).join('')}</div></div>`).join('')}
            <div class="cm-now" style="top:calc(22px + (100% - 22px) * ${(11.67 - H0) / HN})"><i></i></div></div>
          <div class="cm-legend"><span><em class="k">✓</em>${S('Form done', 'Formulário feito', 'Formular udfyldt')}</span><span><em class="k">€</em>${S('Deposit paid', 'Sinal pago', 'Depositum betalt')}</span></div></div>
        <div class="cm-p cm-file"><div class="cm-ph"><b>${S('Patient file', 'Ficha do paciente', 'Patientjournal')}</b><span class="cm-mute">#P-2381</span></div>
          <div class="cm-who"><span class="cm-ava">IC</span><div><b>Inês Costa</b><small>34 · ${S('patient since 2023', 'paciente desde 2023', 'patient siden 2023')}</small></div></div>
          <div class="cm-tags"><span class="cm-chip g">${S('Consent ✓', 'Consentimento ✓', 'Samtykke ✓')}</span><span class="cm-chip g">${S('Deposit €50 ✓', 'Sinal 50 € ✓', 'Depositum 375 kr ✓')}</span><span class="cm-chip warn">${S('Allergy: lidocaine', 'Alergia: lidocaína', 'Allergi: lidokain')}</span></div>
          <div class="cm-hist">${[[['Mar', 'mar', 'mar'], ['Facial', 'Limpeza de pele', 'Ansigtsbehandling'], '€90'], [['Jun', 'jun', 'jun'], ['Chemical peel', 'Peeling químico', 'Kemisk peeling'], '€140'], [['Sep', 'set', 'sep'], ['Botox · 2 areas', 'Botox · 2 zonas', 'Botox · 2 områder'], '€320']].map(h => `<div><time>${T(h[0])}</time><span>${T(h[1])}</span><b>${h[2]}</b></div>`).join('')}</div>
          <div class="cm-kv"><span>${S('Lifetime value', 'Valor do cliente', 'Kundeværdi')}</span><b>€1,840</b></div>
          <div class="cm-kv"><span>${S('Next recall', 'Próxima consulta', 'Næste indkaldelse')}</span><b>12 Dec · ${S('auto', 'auto', 'auto')}</b></div></div>
      </div>`,
    live: v => { const o = v.querySelector('.cm-ap.open'); if (o) { o.classList.add('filled'); o.innerHTML = `<b>${S('Booked by AI', 'Marcado pela AI', 'Booket af AI')}</b><small>Joana R. <em>✓ €</em></small>`; } }
  };

  // ---------------------------------------------------------------- weddings: event planner
  const wed = {
    lbl: ['Event planner', 'Planeamento', 'Eventplan'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>Ana &amp; Rui · 14 ${S('Jun', 'jun', 'jun')} 2027</b><span class="cm-chip g">${S('Contract signed', 'Contrato assinado', 'Kontrakt underskrevet')}</span></div>
          <div class="cm-run">${[
            ['16:00', ['Ceremony · garden', 'Cerimónia · jardim', 'Vielse · have'], ['Chairs 120 ✓', 'Cadeiras 120 ✓', 'Stole 120 ✓'], 'done'],
            ['17:00', ['Cocktail hour', 'Cocktail', 'Cocktailtime'], ['Quartet booked', 'Quarteto marcado', 'Kvartet booket'], 'done'],
            ['19:00', ['Dinner · Classic menu', 'Jantar · menu Clássico', 'Middag · Classic-menu'], ['Tasting 12 Mar', 'Prova 12 mar', 'Smagning 12. mar'], 'now'],
            ['21:30', ['First dance', 'Primeira dança', 'Første dans'], ['DJ: song pending', 'DJ: música por definir', 'DJ: sang mangler'], 'todo'],
            ['00:00', ['Late snack', 'Ceia', 'Natmad'], ['Prego station', 'Estação de pregos', 'Sandwichstation'], 'todo']
          ].map(r => `<div class="cm-step ${r[3]}"><time>${r[0]}</time><i></i><div><b>${T(r[1])}</b><small>${T(r[2])}</small></div></div>`).join('')}</div></div>
        <div class="cm-rtcol">
          <div class="cm-p"><div class="cm-ph"><b>RSVP</b><span class="cm-mute">${S('auto-reminders on', 'lembretes automáticos', 'auto-påmindelser')}</span></div>
            <div class="cm-rsvp"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" class="bg"/><circle cx="18" cy="18" r="15.5" class="fg" style="--p:80"/></svg><div><b class="cm-rs">96</b><small>/ 120 ${S('confirmed', 'confirmados', 'bekræftet')}</small><small>${S('8 veggie · 3 gluten-free · 6 kids', '8 veg. · 3 sem glúten · 6 crianças', '8 veg. · 3 glutenfri · 6 børn')}</small></div></div></div>
          <div class="cm-p"><div class="cm-ph"><b>${S('Budget & payments', 'Orçamento e pagamentos', 'Budget & betalinger')}</b><b>€31,200</b></div>
            <div class="cm-stack"><i style="--w:52%"></i><i style="--w:18%"></i><i style="--w:10%"></i><i style="--w:8%"></i><i style="--w:12%"></i></div>
            <div class="cm-stackl"><span>${S('Catering', 'Catering', 'Catering')}</span><span>${S('Venue', 'Espaço', 'Lokale')}</span><span>${S('Flowers', 'Flores', 'Blomster')}</span><span>${S('Music', 'Música', 'Musik')}</span></div>
            ${[[['Deposit', 'Sinal', 'Depositum'], '€6,000', ['Paid ✓', 'Pago ✓', 'Betalt ✓'], 'g'], [['2nd instalment', '2.ª prestação', '2. rate'], '€12,000', ['Due 14 Mar', 'Vence 14 mar', 'Forfalder 14. mar'], 'warn'], [['Final', 'Final', 'Slutbetaling'], '€13,200', ['31 May', '31 mai', '31. maj'], '']].map(p => `<div class="cm-kv"><span>${T(p[0])}</span><b>${p[1]}</b><span class="cm-chip ${p[3]}">${T(p[2])}</span></div>`).join('')}</div>
        </div>
      </div>`,
    live: v => { const b = v.querySelector('.cm-rs'), c = v.querySelector('.cm-rsvp .fg'); if (!b) return; const n = Math.min(120, +b.textContent + 1 + Math.floor(Math.random() * 2)); b.textContent = n; c.style.setProperty('--p', Math.round(n / 120 * 100)); }
  };

  // ---------------------------------------------------------------- real estate: buyer matching
  const estate = {
    lbl: ['Buyer match', 'Match de compradores', 'Købermatch'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Best matches · Hansen family', 'Melhores imóveis · família Hansen', 'Bedste match · familien Hansen')}</b><span class="cm-chip g">${S('3 of 214 listings', '3 de 214 imóveis', '3 af 214 boliger')}</span></div>
          <div class="cm-props">${[
            ['Cascais', '€585k', 'T3 · 2 · 142m²', 96, [['Sea view', 'Vista mar', 'Havudsigt'], ['Garage', 'Garagem', 'Garage']], 'a'],
            ['Estoril', '€612k', 'V3 · 3 · 190m²', 89, [['Pool', 'Piscina', 'Pool'], ['Garden', 'Jardim', 'Have']], 'b'],
            ['Parede', '€498k', 'T3 · 2 · 128m²', 84, [['School 400m', 'Escola a 400m', 'Skole 400 m'], ['New build', 'Novo', 'Nybyg']], 'c']
          ].map(p => `<div class="cm-prop"><div class="cm-img ${p[5]}"><span class="cm-match" style="--p:${p[3]}"><b>${p[3]}%</b></span></div><div class="cm-pi"><small>${p[0]}</small><b>${p[1]}</b><span>${p[2]}</span><div>${p[4].map(t => `<em>${T(t)}</em>`).join('')}</div></div></div>`).join('')}</div></div>
        <div class="cm-p"><div class="cm-ph"><b>${S('Buyer profile', 'Perfil do comprador', 'Køberprofil')}</b><span class="cm-chip g">${S('Hot', 'Quente', 'Varm')}</span></div>
          <div class="cm-kv"><span>${S('Budget', 'Orçamento', 'Budget')}</span><b>€450–600k</b></div>
          <div class="cm-kv"><span>${S('Areas', 'Zonas', 'Områder')}</span><b>Cascais · Estoril</b></div>
          <div class="cm-kv"><span>${S('Mortgage', 'Crédito', 'Lån')}</span><b>${S('Pre-approved ✓', 'Pré-aprovado ✓', 'Forhåndsgodkendt ✓')}</b></div>
          <div class="cm-kv"><span>${S('Language', 'Língua', 'Sprog')}</span><b>Dansk</b></div>
          <div class="cm-ph" style="margin-top:10px"><b>${S('Saturday viewing route', 'Roteiro de visitas · sábado', 'Fremvisningsrute · lørdag')}</b></div>
          <div class="cm-route">${[['10:00', 'Cascais T3'], ['11:15', 'Estoril V3'], ['12:30', 'Parede T3']].map(r => `<div><time>${r[0]}</time><i></i><span>${r[1]}</span></div>`).join('')}</div>
          <span class="cm-chip g cm-sent">${S('Route + keys info sent on WhatsApp ✓', 'Roteiro enviado no WhatsApp ✓', 'Rute sendt på WhatsApp ✓')}</span></div>
      </div>`,
    live: v => { const m = pick([...v.querySelectorAll('.cm-prop')]); m.classList.remove('ping'); void m.offsetWidth; m.classList.add('ping'); }
  };

  // ---------------------------------------------------------------- gym: timetable + retention
  const DAYS = [['Mon', 'Seg', 'Man'], ['Tue', 'Ter', 'Tir'], ['Wed', 'Qua', 'Ons'], ['Thu', 'Qui', 'Tor'], ['Fri', 'Sex', 'Fre'], ['Sat', 'Sáb', 'Lør']];
  const CL = [
    ['07:00', [['HIIT', 92], ['Spin', 70], ['HIIT', 100], ['Spin', 64], ['HIIT', 88], ['Yoga', 54]]],
    ['12:30', [['Core', 48], ['Pilates', 100], ['Core', 60], ['Pilates', 96], ['Box', 72], ['HIIT', 100]]],
    ['18:30', [['Pilates', 100], ['Box', 84], ['Pilates', 100], ['HIIT', 100], ['Yoga', 66], ['—', 0]]]
  ];
  const gym = {
    lbl: ['Timetable', 'Horário', 'Holdplan'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Classes this week', 'Aulas esta semana', 'Hold denne uge')}</b><span class="cm-chip g">${S('87% full', '87% cheio', '87% fyldt')}</span></div>
          <div class="cm-tt"><span></span>${DAYS.map(d => `<span class="cm-tth">${T(d)}</span>`).join('')}
            ${CL.map(r => `<span class="cm-tth t">${r[0]}</span>${r[1].map(c => c[1] ? `<div class="cm-cls ${c[1] >= 100 ? 'full' : ''}"><b>${c[0]}</b><i style="--f:${c[1]}%"></i><small>${c[1] >= 100 ? S('Full · waitlist 4', 'Cheia · espera 4', 'Fyldt · venteliste 4') : Math.round(c[1] / 5) + '/20'}</small></div>` : '<div class="cm-cls off"></div>').join('')}`).join('')}</div>
          <div class="cm-heat">${Array.from({ length: 84 }, (_, i) => { const h = i % 12, d = Math.floor(i / 12); const v = (h < 2 || (h > 6 && h < 10) ? .7 : .25) + ((i * 37) % 11) / 30 - (d === 6 ? .3 : 0); return `<i style="opacity:${Math.max(.08, Math.min(1, v)).toFixed(2)}"></i>`; }).join('')}<small>${S('Check-ins by hour', 'Entradas por hora', 'Check-ins pr. time')}</small></div></div>
        <div class="cm-p"><div class="cm-ph"><b>${S('Retention radar', 'Radar de retenção', 'Fastholdelse')}</b><span class="cm-mute">${S('AI churn score', 'risco AI', 'AI-frafaldsrisiko')}</span></div>
          ${[['Nuno R.', 21, 91, ['Call booked', 'Chamada marcada', 'Opkald booket'], 'warn'], ['Clara T.', 12, 78, ['Nudge sent ✓', 'Lembrete enviado ✓', 'Påmindelse sendt ✓'], 'g'], ['Ida M.', 9, 64, ['Offer: PT session', 'Oferta: sessão PT', 'Tilbud: PT-time'], ''], ['Rui F.', 8, 52, ['Watching', 'Em observação', 'Overvåges'], '']].map(m => `<div class="cm-risk"><div><b>${m[0]}</b><small>${m[1]} ${S('days away', 'dias sem vir', 'dage væk')}</small></div><div class="cm-meter"><i style="--w:${m[2]}%"></i><em>${m[2]}%</em></div><span class="cm-chip ${m[4]}">${T(m[3])}</span></div>`).join('')}
          <div class="cm-kv" style="margin-top:8px"><span>${S('Saved this month', 'Recuperados este mês', 'Reddet denne måned')}</span><b>23 · €1,380 MRR</b></div></div>
      </div>`,
    live: v => { const c = pick([...v.querySelectorAll('.cm-cls:not(.full):not(.off)')]); if (!c) return; const i = c.querySelector('i'), s = c.querySelector('small'); const f = Math.min(100, parseInt(i.style.getPropertyValue('--f')) + 5); i.style.setProperty('--f', f + '%'); s.textContent = f >= 100 ? 'Full' : Math.round(f / 5) + '/20'; if (f >= 100) c.classList.add('full'); c.classList.remove('ping'); void c.offsetWidth; c.classList.add('ping'); }
  };

  // ---------------------------------------------------------------- shop: sales, orders, stock
  const REV = [32, 35, 31, 40, 44, 41, 48, 52, 47, 55, 60, 58, 54, 63, 70, 66, 72, 78, 74, 81, 88, 84, 90, 97, 92, 101, 108, 104, 112, 121];
  const path = (() => { const w = 300, h = 80, mx = 125; const p = REV.map((v, i) => [i / (REV.length - 1) * w, h - v / mx * h]); return { l: 'M' + p.map(q => q.map(n => n.toFixed(1)).join(',')).join('L'), a: 'M0,' + h + 'L' + p.map(q => q.map(n => n.toFixed(1)).join(',')).join('L') + 'L' + w + ',' + h + 'Z' }; })();
  const ORD = [['#4824', 'Freja N.', 'DK', '€89', ['Paid', 'Pago', 'Betalt'], 'g'], ['#4823', 'Oliver S.', 'UK', '£64', ['Shipped', 'Enviado', 'Afsendt'], ''], ['#4822', 'Marta G.', 'PT', '€142', ['Delivered', 'Entregue', 'Leveret'], ''], ['#4821', 'Emil J.', 'DK', '€58', ['Paid', 'Pago', 'Betalt'], 'g']];
  const ordRow = o => `<div class="cm-ord"><b>${o[0]}</b><span>${o[1]}</span><em>${o[2]}</em><b>${o[3]}</b><span class="cm-chip ${o[5]}">${T(o[4])}</span></div>`;
  let ordN = 4825;
  const shop = {
    lbl: ['Sales & stock', 'Vendas e stock', 'Salg & lager'],
    html: () => `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Revenue · 30 days', 'Faturação · 30 dias', 'Omsætning · 30 dage')}</b><b class="cm-big">€48,920 <em>+27%</em></b></div>
          <svg class="cm-chart" viewBox="0 0 300 80" preserveAspectRatio="none"><defs><linearGradient id="cmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d7cff" stop-opacity=".45"/><stop offset="1" stop-color="#4d7cff" stop-opacity="0"/></linearGradient></defs><path d="${path.a}" fill="url(#cmg)"/><path class="ln" d="${path.l}" fill="none" stroke="#4d7cff" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>
          <div class="cm-chan">${[['Meta', 41], ['TikTok', 22], ['Email', 19], ['Organic', 18]].map(c => `<span><i style="--w:${c[1] * 2}%"></i>${c[0]} <b>${c[1]}%</b></span>`).join('')}</div>
          <div class="cm-ords">${ORD.map(ordRow).join('')}</div></div>
        <div class="cm-rtcol">
          <div class="cm-p"><div class="cm-ph"><b>${S('Stock alerts', 'Alertas de stock', 'Lageralarmer')}</b></div>
            ${[[['Gold necklace', 'Colar dourado', 'Guldhalskæde'], 6, 12, ['Auto-reorder ✓', 'Encomenda automática ✓', 'Auto-genbestil ✓'], 'g'], [['Pearl earrings', 'Brincos de pérola', 'Perleøreringe'], 14, 30, ['7 days left', '7 dias', '7 dage tilbage'], 'warn'], [['Silver ring', 'Anel de prata', 'Sølvring'], 48, 90, ['OK', 'OK', 'OK'], '']].map(s => `<div class="cm-stock"><div><b>${T(s[0])}</b><div class="cm-meter"><i style="--w:${s[2]}%"></i></div></div><em>${s[1]}</em><span class="cm-chip ${s[4]}">${T(s[3])}</span></div>`).join('')}</div>
          <div class="cm-p"><div class="cm-ph"><b>${S('Email flows', 'Fluxos de email', 'E-mailflows')}</b></div>
            ${[[['Abandoned cart', 'Carrinho abandonado', 'Forladt kurv'], '1,240', '96', '€8.6k'], [['Win-back · 60d', 'Regresso · 60d', 'Win-back · 60d'], '880', '41', '€3.1k'], [['Post-purchase', 'Pós-compra', 'Efter køb'], '2,310', '212', '€9.4k']].map(f => `<div class="cm-flow"><b>${T(f[0])}</b><span>${f[1]} → <em>${f[2]}</em></span><b>${f[3]}</b></div>`).join('')}</div>
        </div>
      </div>`,
    live: v => { const box = v.querySelector('.cm-ords'); if (!box) return; const o = ['#' + (ordN++), pick(['Sofie L.', 'Jack T.', 'Inês R.', 'Mads K.', 'Chloe B.']), pick(['DK', 'UK', 'PT']), '€' + (39 + Math.floor(Math.random() * 120)), ['Paid', 'Pago', 'Betalt'], 'g']; box.insertAdjacentHTML('afterbegin', ordRow(o)); box.firstElementChild.classList.add('new'); while (box.children.length > 4) box.lastElementChild.remove(); }
  };

  // ---------------------------------------------------------------- trades: dispatch + quote builder
  const JOBS = [
    [0, 1, 5, ['Full remodel', 'Remodelação total', 'Totalrenovering'], 'Rua do Sol 14', 'a'],
    [1, 1, 3, ['Bathroom', 'Casa de banho', 'Badeværelse'], 'M. Ferreira', 'b'],
    [1, 4, 2, ['Roof repair', 'Reparação telhado', 'Tagreparation'], 'Oakfield Rd', 'c'],
    [2, 1, 1, ['Site visit ×3', 'Visitas ×3', 'Besigtigelse ×3'], 'AI booked', 'v'],
    [2, 2, 2, ['Flooring', 'Pavimento', 'Gulv'], '64 m²', 'b'],
    [2, 4, 2, ['Painting', 'Pintura', 'Maling'], 'Villa Azul', 'c']
  ];
  const QL = [[['Demolition & removal', 'Demolição e remoção', 'Nedrivning & bortskaffelse'], 850], [['Tiling · 18 m²', 'Azulejo · 18 m²', 'Fliser · 18 m²'], 1620], [['Walk-in shower + fittings', 'Base de duche + acessórios', 'Bruseniche + armaturer'], 2140], [['Plumbing', 'Canalização', 'VVS'], 980], [['Labour · 5 days', 'Mão de obra · 5 dias', 'Arbejdsløn · 5 dage'], 2250]];
  const qt = QL.reduce((a, b) => a + b[1], 0);
  const eur = n => '€' + n.toLocaleString('en-US');
  const QS = [['Sent', 'Enviado', 'Sendt'], ['Opened 2×', 'Aberto 2×', 'Åbnet 2×'], ['Signed ✓', 'Assinado ✓', 'Underskrevet ✓']];
  let qi = 0;
  const trades = {
    lbl: ['Dispatch', 'Equipas', 'Planlægning'],
    html: () => { qi = 0; return `
      <div class="cm-grid">
        <div class="cm-p"><div class="cm-ph"><b>${S('Crews · this week', 'Equipas · esta semana', 'Hold · denne uge')}</b><span class="cm-chip g">${S('96% utilised', '96% ocupação', '96% udnyttet')}</span></div>
          <div class="cm-disp"><span></span>${DAYS.slice(0, 5).map(d => `<span class="cm-tth">${T(d)}</span>`).join('')}
            ${['A', 'B', 'C'].map((c, r) => `<span class="cm-crew" style="grid-row:${r + 2}"><i>${c}</i>${S('Crew', 'Equipa', 'Hold')} ${c}</span>`).join('')}
            ${JOBS.map(j => `<div class="cm-job ${j[5]}" style="grid-row:${j[0] + 2};grid-column:${j[1] + 1} / span ${j[2]}"><b>${T(j[3])}</b><small>${j[4]}</small></div>`).join('')}</div>
          <div class="cm-legend"><span><i class="seated"></i>${S('In progress', 'Em curso', 'I gang')}</span><span><i class="booked"></i>${S('Scheduled', 'Agendado', 'Planlagt')}</span><span><i class="v"></i>${S('Site visits', 'Visitas', 'Besigtigelser')}</span></div></div>
        <div class="cm-p"><div class="cm-ph"><b>${S('Quote', 'Orçamento', 'Tilbud')} #Q-1187</b><span class="cm-chip cm-qs">${T(QS[0])}</span></div>
          <small class="cm-mute">${S('Bathroom remodel · M. Ferreira', 'Remodelação WC · M. Ferreira', 'Badeværelse · M. Ferreira')}</small>
          <div class="cm-q">${QL.map(l => `<div><span>${T(l[0])}</span><b>${eur(l[1])}</b></div>`).join('')}</div>
          <div class="cm-kv"><span>${S('VAT 23%', 'IVA 23%', 'Moms 23 %')}</span><b>${eur(Math.round(qt * .23))}</b></div>
          <div class="cm-kv cm-tot"><span>Total</span><b>${eur(Math.round(qt * 1.23))}</b></div>
          <div class="cm-qa"><span>${S('E-sign link', 'Assinatura digital', 'E-signatur')}</span><span>${S('Deposit 30%', 'Sinal 30%', 'Depositum 30 %')}</span><span>${S('Follow-up day 3', 'Follow-up dia 3', 'Opfølgning dag 3')}</span></div></div>
      </div>`; },
    live: v => { const c = v.querySelector('.cm-qs'); if (!c || qi >= 2) return; qi++; c.innerHTML = T(QS[qi]); c.classList.toggle('g', qi === 2); c.classList.remove('ping'); void c.offsetWidth; c.classList.add('ping'); }
  };

  window.VERO_CRM_MODS = { rest, clinic, wed, estate, gym, shop, trades };
})();
