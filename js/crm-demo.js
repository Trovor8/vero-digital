/* Vero — "One CRM, any business": interactive CRM demo that morphs across 7 niches.
   Desktop: pinned scroll (each niche = one step) + clickable tabs. Mobile: tabs + auto-advance.
   All numbers are example data and labelled as such. */
(function () {
  const root = document.getElementById('crm');
  if (!root) return;
  const t3 = (en, pt, da) => `<span data-en>${en}</span><span data-pt>${pt}</span><span data-da>${da}</span>`;
  const T = a => t3(a[0], a[1], a[2]);

  const N = [
    { k: 'rest', ic: 'M7 3v8a2 2 0 0 0 2 2v8M11 3v6M7 9h4M17 3c-1.5 1-2 3-2 6s1 4 2 4v8',
      name: ['Restaurants & cafés', 'Restaurantes e cafés', 'Restauranter & caféer'],
      biz: ['Your restaurant', 'O seu restaurante', 'Din restaurant'],
      h: [['Fuller tables,', 'Mesas cheias,', 'Fyldte borde,'], ['zero admin.', 'zero papelada.', 'nul administration.']],
      d: ['Bookings, reviews and regulars in one place — with an AI that answers WhatsApp while you cook.', 'Reservas, avaliações e clientes habituais num só sítio — com uma AI que responde no WhatsApp enquanto cozinha.', 'Bookinger, anmeldelser og stamgæster ét sted — med en AI, der svarer på WhatsApp, mens du laver mad.'],
      built: [['Online booking', 'Reservas online', 'Onlinebooking'], ['Review booster', 'Mais avaliações', 'Flere anmeldelser'], ['Loyalty club', 'Clube de clientes', 'Loyalitetsklub'], ['Digital menu', 'Menu digital', 'Digitalt menukort']],
      kpi: [[['Bookings this week', 'Reservas esta semana', 'Bookinger i denne uge'], 186, '+24%'], [['No-shows', 'Faltas', 'Udeblivelser'], 3, '−61%'], [['Google rating', 'Avaliação Google', 'Google-bedømmelse'], 4.8, '+0.4'], [['Repeat guests', 'Clientes que voltam', 'Gengangere'], 42, '%']],
      st: [['Request', 'Pedido', 'Forespørgsel'], ['Confirmed', 'Confirmada', 'Bekræftet'], ['Seated', 'Sentados', 'Ankommet'], ['Review asked', 'Avaliação pedida', 'Anmeldelse bedt om']],
      cards: [['Sofia M.', '4 · Fri 20:00'], ['Tom R.', '2 · Sat 13:00'], ['Ana P.', '6 · Fri 21:00'], ['Lars K.', '2 · Tonight'], ['Mia B.', '8 · Birthday'], ['João S.', '3 · Table 12'], ['Emma W.', '★★★★★']],
      chat: [['Hi! Table for 4 this Friday at 8pm?', 'Olá! Mesa para 4 esta sexta às 20h?', 'Hej! Bord til 4 på fredag kl. 20?'], ['Booked for Friday 20:00, terrace ✓ Confirmation sent — see you then!', 'Reservado para sexta às 20:00, esplanada ✓ Confirmação enviada — até lá!', 'Booket fredag kl. 20:00 på terrassen ✓ Bekræftelse sendt — vi ses!']],
      auto: [['Missed call → WhatsApp reply', 'Chamada perdida → resposta no WhatsApp', 'Mistet opkald → WhatsApp-svar'], ['Visit → review request', 'Visita → pedido de avaliação', 'Besøg → anmodning om anmeldelse'], ['Birthday → offer', 'Aniversário → oferta', 'Fødselsdag → tilbud']] },

    { k: 'clinic', ic: 'M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11zM9.5 11h5M12 8.5v5',
      name: ['Clinics & aesthetics', 'Clínicas e estética', 'Klinikker & æstetik'],
      biz: ['Your clinic', 'A sua clínica', 'Din klinik'],
      h: [['A full diary,', 'Agenda cheia,', 'En fuld kalender,'], ['fewer no-shows.', 'menos faltas.', 'færre udeblivelser.']],
      d: ['Online booking, forms before the visit, automatic reminders and campaigns that bring past patients back.', 'Marcações online, formulários antes da consulta, lembretes automáticos e campanhas que trazem pacientes antigos de volta.', 'Onlinebooking, formularer før besøget, automatiske påmindelser og kampagner, der får tidligere patienter tilbage.'],
      built: [['Booking + deposits', 'Marcações + sinal', 'Booking + depositum'], ['Pre-consult forms', 'Formulários pré-consulta', 'Forkonsultationsformularer'], ['AI receptionist', 'Rececionista AI', 'AI-receptionist'], ['Reactivation', 'Reativação', 'Reaktivering']],
      kpi: [[['Appointments', 'Consultas', 'Aftaler'], 312, '+18%'], [['No-show rate', 'Taxa de faltas', 'Udeblivelser'], 4, '%'], [['Patients reactivated', 'Pacientes reativados', 'Reaktiverede patienter'], 57, '+57'], [['Forms completed', 'Formulários feitos', 'Udfyldte formularer'], 96, '%']],
      st: [['New patient', 'Novo paciente', 'Ny patient'], ['Form done', 'Formulário feito', 'Formular udfyldt'], ['Appointment', 'Consulta', 'Aftale'], ['Aftercare', 'Pós-tratamento', 'Efterbehandling']],
      cards: [['Inês C.', 'Facial · Tue'], ['Mark D.', 'Dental check'], ['Freja N.', 'Consent ✓'], ['Rita L.', 'Thu 10:30'], ['Paul G.', 'Thu 15:00'], ['Sara V.', 'Day 3 check-in'], ['Kim H.', 'Day 14']],
      chat: [['Do you have a slot for a facial next Tuesday?', 'Têm vaga para uma limpeza de pele na próxima terça?', 'Har I en tid til ansigtsbehandling næste tirsdag?'], ['Yes — 11:00 or 16:30 with Dr. Lopes. Shall I book 11:00 and send the form?', 'Sim — 11:00 ou 16:30 com a Dra. Lopes. Marco às 11:00 e envio o formulário?', 'Ja — kl. 11:00 eller 16:30 hos Dr. Lopes. Skal jeg booke 11:00 og sende formularen?']],
      auto: [['24h before → reminder', '24h antes → lembrete', '24 t før → påmindelse'], ['6 months → recall', '6 meses → nova consulta', '6 måneder → indkaldelse'], ['After treatment → aftercare', 'Após tratamento → cuidados', 'Efter behandling → efterpleje']] },

    { k: 'wed', ic: 'M8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM16 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
      name: ['Weddings & venues', 'Casamentos e espaços', 'Bryllupper & selskabslokaler'],
      biz: ['Your venue', 'O seu espaço', 'Dit selskabslokale'],
      h: [['Every enquiry', 'Cada pedido', 'Hver forespørgsel'], ['followed up.', 'acompanhado.', 'fulgt op.']],
      d: ['Leads worth thousands never go cold: instant quotes, visit booking, premium proposals and a portal for the couple.', 'Contactos que valem milhares nunca arrefecem: orçamentos imediatos, marcação de visitas, propostas premium e um portal para os noivos.', 'Leads til tusindvis af kroner bliver aldrig kolde: øjeblikkelige tilbud, booking af fremvisning, premium-tilbud og en portal til parret.'],
      built: [['Quote calculator', 'Calculadora de orçamento', 'Prisberegner'], ['Lead CRM', 'CRM de contactos', 'Lead-CRM'], ['Proposals', 'Propostas', 'Tilbud'], ['Client portal', 'Portal do cliente', 'Kundeportal']],
      kpi: [[['Open enquiries', 'Pedidos em aberto', 'Åbne forespørgsler'], 38, '+12'], [['Visits booked', 'Visitas marcadas', 'Bookede fremvisninger'], 14, '+40%'], [['Proposals sent', 'Propostas enviadas', 'Sendte tilbud'], 21, '+9'], [['Pipeline value', 'Valor em pipeline', 'Pipelineværdi'], 284, 'k€']],
      st: [['Enquiry', 'Pedido', 'Forespørgsel'], ['Visit booked', 'Visita marcada', 'Fremvisning'], ['Proposal', 'Proposta', 'Tilbud'], ['Deposit paid', 'Sinal pago', 'Depositum betalt']],
      cards: [['Ana & Rui', 'Jun 2027 · 120'], ['Liv & Oscar', 'Sep · 80'], ['Marta & Ben', 'Sat 11:00'], ['Chloe & Sam', '€24,800'], ['Inês & Tiago', '€31,200'], ['Ida & Emil', 'Signed ✓'], ['Rosa & Leo', 'Paid ✓']],
      chat: [['How much for 120 guests in June, with dinner?', 'Quanto custa para 120 convidados em junho, com jantar?', 'Hvad koster det for 120 gæster i juni med middag?'], ['Around €21–24k with the Classic menu. Want to visit this Saturday? I have 11:00 free.', 'Cerca de 21–24 mil € com o menu Clássico. Quer visitar este sábado? Tenho as 11:00 livres.', 'Omkring 160–180.000 kr. med Classic-menuen. Vil I se stedet på lørdag? Kl. 11:00 er ledig.']],
      auto: [['Quote request → instant estimate', 'Pedido → estimativa imediata', 'Forespørgsel → straks-overslag'], ['After visit → proposal in 24h', 'Após visita → proposta em 24h', 'Efter fremvisning → tilbud inden 24 t'], ['No reply 3 days → follow-up', 'Sem resposta 3 dias → follow-up', 'Intet svar i 3 dage → opfølgning']] },

    { k: 'estate', ic: 'M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5',
      name: ['Real estate', 'Imobiliário', 'Ejendomshandel'],
      biz: ['Your agency', 'A sua agência', 'Dit mæglerfirma'],
      h: [['No lead', 'Nenhum contacto', 'Intet lead'], ['left behind.', 'fica para trás.', 'bliver glemt.']],
      d: ['Every portal, ad and WhatsApp lead lands in one pipeline, gets an instant reply and a viewing booked.', 'Cada contacto de portais, anúncios e WhatsApp entra num só pipeline, recebe resposta imediata e uma visita marcada.', 'Hvert lead fra portaler, annoncer og WhatsApp lander i én pipeline, får et øjeblikkeligt svar og en fremvisning booket.'],
      built: [['Lead capture', 'Captação de contactos', 'Leadindsamling'], ['WhatsApp AI', 'AI no WhatsApp', 'WhatsApp-AI'], ['Viewing booking', 'Marcação de visitas', 'Booking af fremvisninger'], ['Multilingual site', 'Site multilingue', 'Flersproget site']],
      kpi: [[['New leads', 'Novos contactos', 'Nye leads'], 143, '+31%'], [['Reply time', 'Tempo de resposta', 'Svartid'], 1, 'min'], [['Viewings', 'Visitas', 'Fremvisninger'], 46, '+22%'], [['Offers', 'Propostas', 'Bud'], 9, '+4']],
      st: [['Lead', 'Contacto', 'Lead'], ['Qualified', 'Qualificado', 'Kvalificeret'], ['Viewing', 'Visita', 'Fremvisning'], ['Offer', 'Proposta', 'Bud']],
      cards: [['Hansen fam.', 'T3 · Lisbon'], ['M. Silva', 'Villa · Algarve'], ['J. Clarke', '€450–600k'], ['N. Berg', 'Golden visa'], ['P. Costa', 'Sat 10:00'], ['L. Moreau', 'Mon 17:30'], ['A. Holm', '€585k']],
      chat: [['Is the 3-bed in Cascais still available?', 'O T3 em Cascais ainda está disponível?', 'Er 3-værelses lejligheden i Cascais stadig til salg?'], ['Yes! It has sea views and parking. Viewings Saturday 10:00 or 12:00 — which suits you?', 'Sim! Tem vista mar e garagem. Visitas sábado às 10:00 ou 12:00 — qual prefere?', 'Ja! Den har havudsigt og parkering. Fremvisning lørdag kl. 10 eller 12 — hvad passer dig?']],
      auto: [['Portal lead → reply in 1 min', 'Contacto do portal → resposta em 1 min', 'Portal-lead → svar på 1 min'], ['Viewing → reminder + directions', 'Visita → lembrete + direções', 'Fremvisning → påmindelse + vej'], ['New listing → matching buyers', 'Novo imóvel → compradores certos', 'Ny bolig → matchende købere']] },

    { k: 'gym', ic: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12',
      name: ['Gyms & studios', 'Ginásios e estúdios', 'Fitnesscentre & studier'],
      biz: ['Your studio', 'O seu estúdio', 'Dit studie'],
      h: [['Trials become', 'Experiências viram', 'Prøvetimer bliver'], ['members.', 'sócios.', 'medlemmer.']],
      d: ['Ads that book trial classes, follow-up that converts them, and alerts when a member is about to drop off.', 'Anúncios que marcam aulas experimentais, follow-up que as converte e alertas quando um sócio está prestes a desistir.', 'Annoncer der booker prøvetimer, opfølgning der konverterer dem, og alarmer når et medlem er ved at falde fra.'],
      built: [['Trial landing + ads', 'Landing + anúncios', 'Prøvetime-side + annoncer'], ['Memberships', 'Mensalidades', 'Medlemskaber'], ['Referral programme', 'Programa de referências', 'Henvisningsprogram'], ['Win-back', 'Recuperação', 'Win-back']],
      kpi: [[['Trials booked', 'Experiências marcadas', 'Bookede prøvetimer'], 64, '+35%'], [['Trial → member', 'Experiência → sócio', 'Prøvetime → medlem'], 48, '%'], [['Active members', 'Sócios ativos', 'Aktive medlemmer'], 412, '+29'], [['At risk', 'Em risco', 'I risiko'], 11, '−8']],
      st: [['Trial booked', 'Experiência marcada', 'Prøvetime booket'], ['Trial done', 'Experiência feita', 'Prøvetime gennemført'], ['Member', 'Sócio', 'Medlem'], ['At risk', 'Em risco', 'I risiko']],
      cards: [['Diogo F.', 'HIIT · Mon'], ['Sofie L.', 'Pilates · Wed'], ['Max P.', 'Loved it ✓'], ['Beatriz A.', 'Monthly'], ['Jonas E.', 'Annual'], ['Clara T.', '12 days away'], ['Nuno R.', '3 weeks away']],
      chat: [['Can I try a class before signing up?', 'Posso experimentar uma aula antes de me inscrever?', 'Kan jeg prøve en time, før jeg melder mig ind?'], ['Of course — your first class is free. Pilates tomorrow 18:30 or HIIT Thursday 7:00?', 'Claro — a primeira aula é grátis. Pilates amanhã às 18:30 ou HIIT quinta às 7:00?', 'Selvfølgelig — første time er gratis. Pilates i morgen kl. 18:30 eller HIIT torsdag kl. 7?']],
      auto: [['Trial done → offer in 2h', 'Experiência feita → oferta em 2h', 'Prøvetime → tilbud inden 2 t'], ['No visit 10 days → nudge', '10 dias sem vir → lembrete', '10 dage væk → påmindelse'], ['Referral → free month', 'Referência → mês grátis', 'Henvisning → gratis måned']] },

    { k: 'shop', ic: 'M4 5h2l2 11h10l2-8H7M10 20h.01M17 20h.01',
      name: ['Online shops', 'Lojas online', 'Webshops'],
      biz: ['Your store', 'A sua loja', 'Din webshop'],
      h: [['More orders,', 'Mais encomendas,', 'Flere ordrer,'], ['more repeat buyers.', 'mais clientes fiéis.', 'flere gengangere.']],
      d: ['A fast Shopify store, ads that are tracked properly, and email flows that recover carts and bring buyers back.', 'Uma loja Shopify rápida, anúncios bem medidos e fluxos de email que recuperam carrinhos e trazem clientes de volta.', 'En hurtig Shopify-butik, annoncer der måles ordentligt, og e-mailflows der redder kurve og får kunderne tilbage.'],
      built: [['Shopify store', 'Loja Shopify', 'Shopify-butik'], ['Meta & TikTok Ads', 'Meta e TikTok Ads', 'Meta- & TikTok-annoncer'], ['Email & SMS flows', 'Fluxos email e SMS', 'E-mail- & SMS-flows'], ['Tracking', 'Tracking', 'Tracking']],
      kpi: [[['Orders', 'Encomendas', 'Ordrer'], 1284, '+27%'], [['Carts recovered', 'Carrinhos recuperados', 'Reddede kurve'], 96, '+96'], [['ROAS', 'ROAS', 'ROAS'], 3.9, 'x'], [['Repeat rate', 'Taxa de recompra', 'Genkøbsrate'], 31, '%']],
      st: [['Visitor', 'Visitante', 'Besøgende'], ['Cart', 'Carrinho', 'Kurv'], ['Order', 'Encomenda', 'Ordre'], ['Repeat', 'Recompra', 'Genkøb']],
      cards: [['#4821', 'Instagram ad'], ['#4822', 'TikTok'], ['#4819', '€89 · 2 items'], ['#4815', '€142 · paid'], ['#4810', 'Shipped'], ['#4790', '2nd order'], ['#4702', 'VIP']],
      chat: [['Does the gold necklace ship to Denmark?', 'O colar dourado envia para a Dinamarca?', 'Sender I guldhalskæden til Danmark?'], ['Yes — free shipping, 2–4 days to Denmark. Here’s 10% off your first order: WELCOME10', 'Sim — envio grátis, 2–4 dias para a Dinamarca. Aqui tem 10% na primeira compra: WELCOME10', 'Ja — gratis fragt, 2–4 dage til Danmark. Her er 10 % på din første ordre: WELCOME10']],
      auto: [['Abandoned cart → 3 emails', 'Carrinho abandonado → 3 emails', 'Forladt kurv → 3 e-mails'], ['Order → review request', 'Encomenda → pedido de avaliação', 'Ordre → anmeldelse'], ['60 days → win-back offer', '60 dias → oferta de regresso', '60 dage → win-back-tilbud']] },

    { k: 'trades', ic: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
      name: ['Services & trades', 'Serviços e obras', 'Service & håndværk'],
      biz: ['Your company', 'A sua empresa', 'Din virksomhed'],
      h: [['From missed call', 'Da chamada perdida', 'Fra mistet opkald'], ['to signed job.', 'à obra fechada.', 'til underskrevet job.']],
      d: ['Missed calls become WhatsApp leads, quotes go out the same day and nobody is forgotten in the follow-up.', 'Chamadas perdidas viram contactos no WhatsApp, os orçamentos saem no mesmo dia e ninguém fica esquecido no follow-up.', 'Mistede opkald bliver til WhatsApp-leads, tilbud sendes samme dag, og ingen bliver glemt i opfølgningen.'],
      built: [['Missed-call recovery', 'Recuperação de chamadas', 'Opfølgning på opkald'], ['Quote funnel', 'Funil de orçamentos', 'Tilbudsfunnel'], ['CRM + follow-up', 'CRM + follow-up', 'CRM + opfølgning'], ['Google Business', 'Google Business', 'Google Business']],
      kpi: [[['Leads this month', 'Contactos este mês', 'Leads denne måned'], 97, '+44%'], [['Calls recovered', 'Chamadas recuperadas', 'Reddede opkald'], 38, '+38'], [['Quotes sent', 'Orçamentos enviados', 'Sendte tilbud'], 52, '+19'], [['Win rate', 'Taxa de fecho', 'Vinderrate'], 41, '%']],
      st: [['New lead', 'Novo contacto', 'Nyt lead'], ['Site visit', 'Visita à obra', 'Besigtigelse'], ['Quote sent', 'Orçamento enviado', 'Tilbud sendt'], ['Won', 'Ganho', 'Vundet']],
      cards: [['Kitchen reno', 'Missed call'], ['Bathroom', 'Web form'], ['Roof repair', 'Wed 9:00'], ['Full remodel', '€38,500'], ['Flooring', '€6,200'], ['Painting', 'Starts Mon'], ['Windows', 'Signed ✓']],
      chat: [['Sorry we missed your call! What can we help with?', 'Desculpe não termos atendido! Em que podemos ajudar?', 'Undskyld, vi missede dit opkald! Hvad kan vi hjælpe med?'], ['Got it — a bathroom remodel. I can send someone Wednesday at 9:00 to measure. Does that work?', 'Percebido — remodelação de casa de banho. Posso enviar alguém quarta às 9:00 para medir. Pode ser?', 'Forstået — renovering af badeværelse. Jeg kan sende en ud onsdag kl. 9 og måle op. Passer det?']],
      auto: [['Missed call → WhatsApp in 30s', 'Chamada perdida → WhatsApp em 30s', 'Mistet opkald → WhatsApp på 30 s'], ['Quote sent → follow-up day 3', 'Orçamento → follow-up dia 3', 'Tilbud → opfølgning dag 3'], ['Job done → review request', 'Obra feita → pedido de avaliação', 'Job færdigt → anmeldelse']] }
  ];

  const UI = {
    tag: ['Digital products · Custom CRMs', 'Produtos digitais · CRMs à medida', 'Digitale produkter · Skræddersyede CRM'],
    badge: ['Interactive demo · example data', 'Demo interativa · dados de exemplo', 'Interaktiv demo · eksempeldata'],
    built: ['What we build for them', 'O que construímos', 'Det bygger vi'],
    cta: ['Build mine', 'Quero o meu', 'Byg min'],
    ai: ['AI assistant', 'Assistente AI', 'AI-assistent'],
    on: ['AI on', 'AI ativa', 'AI aktiv'],
    autos: ['Automations running', 'Automações ativas', 'Aktive automatiseringer'],
    pipe: ['Pipeline', 'Pipeline', 'Pipeline'],
    lead: ['New lead', 'Novo contacto', 'Nyt lead'],
    nav: [['Dashboard', 'Painel', 'Overblik'], ['Pipeline', 'Pipeline', 'Pipeline'], ['Inbox', 'Mensagens', 'Indbakke'], ['Automations', 'Automações', 'Automatisering'], ['Reports', 'Relatórios', 'Rapporter']],
    hint: ['Scroll to switch business', 'Faça scroll para mudar de negócio', 'Scroll for at skifte branche']
  };

  const svg = (d, w = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const NAVI = ['M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z', 'M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z', 'M4 6h16v12H4zM4 7l8 6 8-6', 'M13 3L4 14h7l-1 7 9-11h-7z', 'M4 20V10M10 20V4M16 20v-7M22 20H2'];

  // ---------- skeleton
  root.innerHTML = `
  <div class="crm-pin">
    <div class="crm-top wrap"><span class="tag">${T(UI.tag)}</span><span class="hbadge">${T(UI.badge)}</span></div>
    <div class="crm-tabs wrap" role="tablist">${N.map((n, i) => `<button role="tab" data-i="${i}">${svg(n.ic)}<span>${T(n.name)}</span></button>`).join('')}</div>
    <div class="crm-grid wrap">
      <div class="crm-cap" aria-live="polite"></div>
      <div class="crm-app">
        <div class="crm-bar"><i></i><i></i><i></i><span class="crm-url">app.verosolutions.com/<b></b></span></div>
        <div class="crm-body">
          <nav class="crm-side">${NAVI.map((d, i) => `<span class="${i === 0 ? 'on' : ''}" title="${UI.nav[i][0]}">${svg(d)}</span>`).join('')}</nav>
          <div class="crm-main"></div>
        </div>
        <div class="crm-toast"></div>
      </div>
    </div>
    <div class="crm-rail">${N.map(() => '<i></i>').join('')}</div>
    <div class="crm-hint">${T(UI.hint)} ↓</div>
  </div>`;

  const cap = root.querySelector('.crm-cap'), main = root.querySelector('.crm-main'), url = root.querySelector('.crm-url b');
  const tabs = [...root.querySelectorAll('.crm-tabs button')], rail = [...root.querySelectorAll('.crm-rail i')];
  const toast = root.querySelector('.crm-toast');
  const fmtNum = (v, final) => (final % 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US'));

  function render(n) {
    const i = N.indexOf(n);
    cap.innerHTML = `
      <span class="crm-n">${String(i + 1).padStart(2, '0')} / ${String(N.length).padStart(2, '0')} · ${T(n.name)}</span>
      <h3>${T(n.h[0])}<br><em>${T(n.h[1])}</em></h3>
      <p>${T(n.d)}</p>
      <div class="crm-built"><small>${T(UI.built)}</small><div>${n.built.map(b => `<span>${T(b)}</span>`).join('')}</div></div>
      <a class="btn p" href="contact.html">${T(UI.cta)} →</a>`;
    url.textContent = n.k;
    const cols = [[0, 1], [2, 3], [4, 5], [6]];
    main.innerHTML = `
      <div class="crm-head"><span class="crm-av">${svg(n.ic)}</span><b>${T(n.biz)}</b><span class="crm-on"><i></i>${T(UI.on)}</span></div>
      <div class="crm-kpis">${n.kpi.map(k => `<div class="crm-kpi"><small>${T(k[0])}</small><b data-v="${k[1]}">0</b><em class="${String(k[2]).startsWith('−') && !/no-show|faltas|udebl|risk|risco/i.test(k[0][0]) ? 'dn' : ''}">${k[2]}</em></div>`).join('')}</div>
      <div class="crm-split">
        <div class="crm-pipe"><small class="crm-lbl">${T(UI.pipe)}</small><div class="crm-cols">${n.st.map((s, c) => `
          <div class="crm-col"><div class="crm-colh">${T(s)}<i>${cols[c].length}</i></div>${cols[c].map(j => `<div class="crm-card"><b>${n.cards[j][0]}</b><span>${n.cards[j][1]}</span></div>`).join('')}</div>`).join('')}</div></div>
        <div class="crm-rt">
          <div class="crm-chat"><small class="crm-lbl"><i class="crm-dot"></i>${T(UI.ai)}</small>
            <div class="crm-msg in">${T(n.chat[0])}</div>
            <div class="crm-typing"><i></i><i></i><i></i></div>
            <div class="crm-msg out">${T(n.chat[1])}</div>
          </div>
          <div class="crm-autos"><small class="crm-lbl">${T(UI.autos)}</small>${n.auto.map(a => `<div class="crm-auto">${svg('M13 3L4 14h7l-1 7 9-11h-7z')}<span>${T(a)}</span><i></i></div>`).join('')}</div>
        </div>
      </div>`;
    // count-up
    main.querySelectorAll('.crm-kpi b').forEach(b => {
      const f = parseFloat(b.dataset.v), t0 = performance.now(), dur = 1100;
      (function step(t) { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); b.textContent = fmtNum(f * e, f); if (p < 1) requestAnimationFrame(step); })(t0);
    });
    tabs.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i); });
    rail.forEach((r, j) => r.classList.toggle('on', j === i));
    // keep the active tab visible on small screens
    const at = tabs[i]; if (at && at.parentElement.scrollWidth > at.parentElement.clientWidth) at.parentElement.scrollTo({ left: at.offsetLeft - 20, behavior: 'smooth' });
  }

  let cur = -1, swapT = null;
  function show(i, instant) {
    if (i === cur) return;
    cur = i;
    clearTimeout(swapT);
    if (instant) { render(N[i]); root.classList.remove('swap'); return; }
    root.classList.add('swap');
    swapT = setTimeout(() => { render(N[i]); requestAnimationFrame(() => root.classList.remove('swap')); }, 260);
  }

  // ---------- desktop: pinned scroll / mobile: auto-advance
  const desk = () => matchMedia('(min-width: 1001px)').matches;
  let auto = null, userPicked = false;
  function onScroll() {
    if (!desk()) return;
    const r = root.getBoundingClientRect(), h = root.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(0.9999, -r.top / h));
    show(Math.floor(p * N.length));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  tabs.forEach((b, i) => b.addEventListener('click', () => {
    userPicked = true;
    if (desk()) {
      const h = root.offsetHeight - innerHeight, top = root.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + h * ((i + 0.5) / N.length), behavior: 'smooth' });
    } else show(i);
  }));
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    clearInterval(auto);
    if (vis && !desk() && !reduce) auto = setInterval(() => { if (!userPicked) show((cur + 1) % N.length); }, 6500);
  }, { threshold: 0.35 }).observe(root);

  // ---------- live touches: incoming lead toast + card pulse
  setInterval(() => {
    if (cur < 0 || document.hidden) return;
    const n = N[cur], c = n.cards[Math.floor(Math.random() * 2)];
    toast.innerHTML = `<i></i><b>${T(UI.lead)}</b><span>${c[0]} · ${c[1]}</span>`;
    toast.classList.remove('on'); void toast.offsetWidth; toast.classList.add('on');
    const cards = main.querySelectorAll('.crm-col:first-child .crm-card');
    cards.forEach(x => x.classList.remove('pulse')); if (cards[0]) { void cards[0].offsetWidth; cards[0].classList.add('pulse'); }
  }, 4200);

  show(0, true); onScroll();
})();
