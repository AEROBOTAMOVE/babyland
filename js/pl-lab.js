/* ═══════════════════════════════════════════════════════════════════════════════
   🔬 PREMIUM „ЛАБОРАТОРИЯТА“ · горният блок на стаята (Ема, .ro-panel.ro-cork) · 22.09.2026
   Последната стая без премиум блок. Езикът е на референциите 14 (дървен рафт с пастелни
   арки и табелки в месингова рамка), 1 (филцова карта с гел бутон) и 15 (ред „…не заменят преглед“).
   Под банера (.pl-rhero, premium-rooms.js) идват:
     1) „Моят опит сега“ — филцова карта (.pl-felt). Има ли незакрит опит — името му, вечерите
        като мъниста (отметнатите розови, днешната голяма) и гел бутон (.pl-gel), който РАЗГЪВА и
        докарва СЪЩЕСТВУВАЩАТА карта „Днешното докосване 👆“ (lab.js:310), където мама отмята вечерта.
        След последната вечер бутонът води до „Присъдата ⚖️“ (lab.js:500). Няма ли опит — покана
        „Започни опит за 7 вечери“ → картата „Тръгни на опит 🧪“ (lab.js:571).
     2) рафт с 3 арки: „Опит за 7 вечери“ → „Тръгни на опит“ / „Втори опит“ / „Опитът в ход“;
        „Бабин мит“ → „Митът на седмицата 👵“ (lab.js:703); „Какво се смени“ → „Какво се смени 🔬“
        (rooms11.js:291). Липсва ли картата — натискаме кътчето (.sec-nav .sec-chip, polish.js:100;
        кътчетата на стаята са от order9.js:11–16).
     3) три плочки-броячи — истински числа, честната нула е „още няма“ (не „0“).
   ОТКЪДЕ ЧЕТЕ (само чете — в localStorage НЕ пише нищо, нови ключове НЯМА):
     · bl_lab — със СЪЩИЯ пазач за форма като lab.js:18 и СЪЩОТО чистене като getSt() lab.js:182–194
       (криви записи вън, log→{}, d извън 1…60 → 7). Незакрит опит = list[].closed лъжа (lab.js:196–198).
       Вечерите = броят ключове в log (както лентата на „Опитът в ход“, lab.js:402–409); отметнато днес =
       log[днешна местна дата] (lab.js:20–21, :318); рамената a/b — lab.js:323.
     · „Завършени опити“ = bl_lab.done (lab.js:521–524; така ги брои и profile.js:930).
     · „Проверени митове“ = done с e:'👵' и tone ≠ 'thin' — точно като таблото „Къде баба позна“
       (rooms12.js:358; бабиният опит се пуска с e:'👵', lab.js:780).
     · „Следи“ = bl_lab_timeline, редовете с текст (rooms11.js:308; „следи“ ги наричат extras.js:496 и profile.js:250).
     · името на бебето — bl_baby.name (както babyName(), lab.js:28).
   ДЕЙСТВИЯТА викат само съществуващото: ▾ на картата (polish.js:226–253, той пази bl_folds),
   чипа на кътчето, бутона „📖 Виж как се прави честен опит“ на героя (roomhero.js:243–249).
   Героят „Твоят опит сега“ (roomhero.js:213) повтаряше същото заглавие → css/pl-lab.css го крие,
   докато този блок е до него, а неговият бутон за статията е тук („Как се прави честен опит“).
   ПЪТ НАЗАД: махни <script src="js/pl-lab.js"> и <link href="css/pl-lab.css"> от index.html —
   стаята се връща точно каквато беше (героят се показва пак, защото правилото, което го крие,
   е вързано за присъствието на .pl-lb до него). Двата файла са нови — няма предишна версия.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_LAB) return;

  const СТАЯ = 'Лабораторията';
  const броячи = { пресмятания: 0, записи: 0, скокове: 0, грешки: 0 };

  // ── четене по СЪЩИТЕ правила като lab.js:18 (масив срещу обект не се приема, повредено → по подразбиране) ──
  const зареди = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  // ── getSt() от lab.js:182–194, само за четене: копираме, нищо не записваме обратно ──
  const редовен = x => x && typeof x === 'object' && !Array.isArray(x);
  function лаб() {
    const с = зареди('bl_lab', { list: [], done: [] });
    const list = (Array.isArray(с.list) ? с.list : []).filter(редовен).map(x => {
      const y = Object.assign({}, x);
      if (!редовен(y.log)) y.log = {};
      const д = Math.round(Number(y.d));
      y.d = (д >= 1 && д <= 60) ? д : 7;
      return y;
    });
    const done = (Array.isArray(с.done) ? с.done : []).filter(редовен);
    return { list, done };
  }
  // местната дата като today() в lab.js:20–21 (не toISOString — той е в UTC и сменя деня в 3 сутринта)
  const днес = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));
  // цифрите в серифен текст — на Nunito (Georgia има старинни цифри: „0“ се чете „о“)
  const цифри = s => esc(s).replace(/\d+/g, '<span class="pl-lb-n">$&</span>');
  // плюшена иконка от спрайт 4×4 [лист, ред, колона]; 🪤 url() в style се разрешава спрямо СТРАНИЦАТА → img/art/…
  const ико = (к) => 'background-image:url(img/art/' + к[0] + '.webp);background-position:' + (к[2] * 100 / 3) + '% ' + (к[1] * 100 / 3) + '%';

  // иконките: ico-c [2,3] колба · [3,1] лупа · [0,3] кристална топка · [0,0] книжка; ico-a [1,1] луна · [0,1] календарче;
  // ico-h [0,0] плюшената баба с очила и шал (22.09, Soul 2 — беше ico-g [1,2] жената с кокчето) · [0,2] балонче „?“; ico-b [3,1] папка с отметки
  const АРКИ = [
    { к: 'opit',  надпис: 'Опит за 7 вечери', ик: ['ico-c', 2, 3], ик2: ['ico-a', 1, 1], цел: 'Тръгни на опит' },
    { к: 'mit',   надпис: 'Бабин мит',        ик: ['ico-c', 0, 3], ик2: ['ico-h', 0, 0], цел: 'Митът на седмицата' },
    { к: 'smena', надпис: 'Какво се смени',   ик: ['ico-c', 3, 1], ик2: ['ico-a', 0, 1], цел: 'Какво се смени' },
  ];
  // къде води всяко действие: картите по началото на заглавието (първият текстов възел, както cardKey в
  // polish.js:29–35) по ред на предпочитание, и кътчето (order9.js:11–16), ако картата я няма.
  const ЦЕЛИ = {
    opit:  { карти: [/^Тръгни на опит/, /^Втори опит/, /^Опитът в ход/], кът: 'Опитите' },
    nov:   { карти: [/^Тръгни на опит/, /^Втори опит/, /^Опитът в ход/], кът: 'Опитите' },
    mit:   { карти: [/^Митът на седмицата/], кът: 'Бабините митове' },
    smena: { карти: [/^Какво се смени/], кът: 'Следите' },
    zav:   { карти: [/^Какво знам за/], кът: 'Тетрадката' },
    mitove:{ карти: [/^Табло: къде баба позна/, /^Митът на седмицата/], кът: 'Бабините митове' },
    sledi: { карти: [/^Какво се смени/], кът: 'Следите' },
  };

  // ── в Лабораторията ли сме: класът на персонажа е ro-cork (premium-rooms.js:22) И стаята има
  //    своите карти (data-blkey „Лабораторията|…“ от polish.js:64) — иначе е друг таб/стая ──
  function вЛаб(корен) {
    const п = document.querySelector('#roomOverlay .ro-panel');
    if (!п || !п.classList.contains('ro-cork')) return false;
    return !!корен.querySelector(':scope > section.jr-card[data-blkey^="' + СТАЯ + '|"]');
  }

  // ═══════════ МОДЕЛЪТ — само числа и думи, от които се рисува ═══════════
  function модел(корен) {
    const с = лаб();
    const всички = с.list.filter(x => !x.closed);                  // activeExps(), lab.js:198
    const д = днес();
    const опити = всички.slice(0, 2).map(e => {                     // таванът е 2 (lab.js:220)
      const n = Object.keys(e.log).length;
      const запис = e.log[д];
      const отметнат = !!запис;
      const готов = n >= e.d;                                        // присъдата идва при n ≥ d (lab.js:504)
      return {
        id: String(e.id || ''), q: String(e.q || 'Моят опит'), d: e.d, n, отметнат, готов,
        вечер: Math.min(e.d, отметнат ? n : n + 1),
        рамо: отметнат ? String(запис && запис.arm === 'a' ? e.a || '' : e.b || '') : '',
      };
    });
    const б = зареди('bl_baby', {}) || {};
    return {
      опити,
      много: всички.length > 1,                                     // lab.js:936 — тогава картите носят id-то на опита
      завършени: с.done.length,
      митове: с.done.filter(x => x.e === '👵' && x.tone !== 'thin').length,
      следи: зареди('bl_lab_timeline', []).filter(x => x && x.t).length,
      име: String(б.name || '').trim().slice(0, 40),
      честен: !!корен.querySelector('.rh-lab-honest'),
    };
  }

  // ═══════════ РИСУВАНЕТО ═══════════
  const СТРЕЛКА = '<em class="pl-lb-chev" aria-hidden="true">›</em>';

  function мъниста(о) {
    // днешната вечер: отметната ли е — последното мънисто; ако не — следващото празно; след края — няма
    const сега = о.отметнат ? о.n - 1 : (о.готов ? -1 : о.n);
    let х = '';
    for (let i = 0; i < о.d; i++) х += '<i class="' + (i < о.n ? 'on' : '') + (i === сега ? ' now' : '') + '"></i>';
    const етикет = 'Отметнати ' + о.n + ' от ' + о.d + ' вечери' + (сега >= 0 && !о.отметнат ? '; тази вечер е ' + (о.n + 1) + '-ата' : '');
    return '<div class="pl-lb-beads' + (о.d > 10 ? ' is-long' : '') + '" role="img" aria-label="' + esc(етикет) + '">' + х + '</div>';
  }

  function картаСега(м) {
    const фиг = '<i class="pl-lb-fig" aria-hidden="true"></i>';
    const как = м.честен ? '<button type="button" class="pl-lb-how pl-soft" data-lb="kak"><i class="pl-lb-i" aria-hidden="true" style="' + ико(['ico-c', 0, 0]) + '"></i><span>Как се прави честен опит</span></button>' : '';
    if (!м.опити.length) {
      return '<div class="pl-lb-now pl-felt is-empty">' + фиг +
        '<div class="pl-lb-head"><p class="pl-lb-eyebrow">Моят опит сега</p>' +
        '<h3 class="pl-lb-q">Започни опит за ' + цифри('7') + ' вечери</h3></div>' +
        '<p class="pl-lb-lead">Един въпрос и по едно докосване вечер — накрая виждаш какво е вярно при ' + (м.име ? '<b>' + esc(м.име) + '</b>' : 'вашето бебе') + '.</p>' +
        '<button type="button" class="pl-lb-go pl-gel" data-lb="nov"><span>Започни опит</span>' + СТРЕЛКА + '</button>' +
        как +
      '</div>';
    }
    const о = м.опити[0];
    const състояние = о.готов && !о.отметнат ? 'Вечерите свършиха — присъдата те чака'
      : о.отметнат ? 'Днес е отметнато: „' + о.рамо + '“'
      : 'Тази вечер — едно докосване';
    const бутон = о.готов && !о.отметнат
      ? '<button type="button" class="pl-lb-go pl-gel" data-lb="prisada" data-id="' + esc(о.id) + '"><span>Виж присъдата</span>' + СТРЕЛКА + '</button>'
      : '<button type="button" class="pl-lb-go pl-gel" data-lb="dnes" data-id="' + esc(о.id) + '"><span>' + (о.отметнат ? 'Виж днешната отметка' : 'Отбележи вечерта') + '</span>' + СТРЕЛКА + '</button>';
    const втори = м.опити[1];
    const вторият = втори
      ? '<button type="button" class="pl-lb-two pl-soft" data-lb="' + (втори.готов && !втори.отметнат ? 'prisada' : 'dnes') + '" data-id="' + esc(втори.id) + '">' +
          '<span class="pl-lb-two-t"><small>Втори опит · вечер <span class="pl-lb-n">' + втори.вечер + '</span> от <span class="pl-lb-n">' + втори.d + '</span>' + (втори.отметнат ? ' · днес ✓' : '') + '</small><b>' + цифри(втори.q) + '</b></span>' + СТРЕЛКА +
        '</button>'
      : '';
    return '<div class="pl-lb-now pl-felt">' + фиг +
      '<div class="pl-lb-head"><p class="pl-lb-eyebrow">Моят опит сега</p>' +
      '<h3 class="pl-lb-q">' + цифри(о.q) + '</h3></div>' +
      мъниста(о) +
      '<p class="pl-lb-day"><b>Вечер <span class="pl-lb-n">' + о.вечер + '</span> от <span class="pl-lb-n">' + о.d + '</span></b><span>' + цифри(състояние) + '</span></p>' +
      бутон + вторият + как +
    '</div>';
  }

  function рафт() {
    return '<div class="pl-lb-shelf">' + АРКИ.map(а =>
      '<button type="button" class="pl-lb-arch a-' + а.к + '" data-lb="' + а.к + '" aria-label="' + esc(а.надпис + ' — към „' + а.цел + '“') + '">' +
        '<span class="pl-lb-a" aria-hidden="true"><span class="pl-lb-in">' +
          '<i class="pl-lb-ico2" style="' + ико(а.ик2) + '"></i>' +
          '<i class="pl-lb-ico" style="' + ико(а.ик) + '"></i>' +
        '</span></span>' +
        // един <span> вътре: табелката е flex и иначе „Опит за“, „7“ и „вечери“ стават три отделни парчета
        '<b class="pl-lb-l" aria-hidden="true"><span>' + цифри(а.надпис) + '</span></b>' +
      '</button>').join('') + '</div>';
  }

  function плочки(м) {
    const П = [
      { к: 'zav',    ч: м.завършени, надпис: 'Завършени опити',  ик: ['ico-b', 3, 1], цел: 'Какво знам за ' + (м.име || 'бебето') },
      { к: 'mitove', ч: м.митове,    надпис: 'Проверени митове', ик: ['ico-c', 0, 3], цел: 'Къде баба позна' },
      { к: 'sledi',  ч: м.следи,     надпис: 'Следи',            ик: ['ico-c', 3, 1], цел: 'Какво се смени' },
    ];
    return '<div class="pl-lb-tiles">' + П.map(п =>
      '<button type="button" class="pl-lb-tile pl-soft" data-lb="' + п.к + '" aria-label="' + esc(п.надпис + ': ' + (п.ч ? п.ч : 'още няма') + ' — към „' + п.цел + '“') + '">' +
        '<i class="pl-lb-i" aria-hidden="true" style="' + ико(п.ик) + '"></i>' +
        (п.ч ? '<b class="pl-lb-num" aria-hidden="true">' + п.ч + '</b>' : '<b class="pl-lb-num is-zero" aria-hidden="true">още няма</b>') +
        '<span aria-hidden="true">' + esc(п.надпис) + '</span>' +
      '</button>').join('') + '</div>';
  }

  function рисувай(м) {
    return картаСега(м) + рафт() + плочки(м) +
      '<p class="pl-lb-note"><i aria-hidden="true">i</i><span>Опитите не заменят преглед.</span></p>';
  }

  // ═══════════ СКОКОВЕТЕ — до СЪЩЕСТВУВАЩИТЕ карти ═══════════
  // заглавието на картата: частта от ключа след „Стая|“ (cardKey, polish.js:29–35) — без медала отпред,
  // който medallions() лепи в <h4>; без ключ — текстовите възли на заглавието
  function заглавие(к) {
    const ключ = к.dataset.blkey || '';
    if (ключ) return ключ.split('|')[1] || '';
    const т = к.querySelector('.jr-title');
    return т ? [...т.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
  }
  function карти(корен) { return Array.from(корен.querySelectorAll(':scope > section.jr-card')); }
  function картаПо(корен, регекси, id, много) {
    const всички = карти(корен);
    for (const ре of регекси) {
      const съвп = всички.filter(к => ре.test(заглавие(к)));
      if (!съвп.length) continue;
      // при два опита всяка карта носи id-то си в data-blkey-extra (lab.js:307–308)
      if (id && много) { const т = съвп.find(к => к.dataset.blkeyExtra === id); if (т) return т; }
      return съвп[0];
    }
    return null;
  }

  // търсене в стаята ли има — чистим го, иначе целта може да е скрита от филтъра на polish.js:80–90
  function безТърсене(корен) {
    корен.querySelectorAll('.sec-find').forEach(п => { if (п.value) { п.value = ''; п.dispatchEvent(new Event('input', { bubbles: true })); } });
  }

  // покажи ИСТИНСКАТА карта: разгъни я с НЕЙНИЯ ▾ (polish.js превключи() пише bl_folds), докарай, мигни,
  // фокусът — на първото ѝ действие (рамото на опита) или на ▾
  function покажи(карта) {
    if (карта.classList.contains('folded')) {
      const стрелка = карта.querySelector('.jr-title .fold-btn') || карта.querySelector('.jr-title');
      if (стрелка) стрелка.click();
    }
    докарай(карта, () => { карта.classList.remove('toc-flash'); void карта.offsetWidth; карта.classList.add('toc-flash'); });
    const фокус = карта.querySelector('.lb-arm:not([disabled])') || карта.querySelector('.jr-title .fold-btn');
    if (фокус) { try { фокус.focus({ preventScroll: true }); } catch (e) {} }
  }

  // кътчето: натискаме СЪЩИЯ чип (polish.js:100; aria-label = името без емоджито, premium-rooms.js:93)
  function кътче(корен, име) {
    const чип = [...корен.querySelectorAll('.sec-nav .sec-chip')].find(б => (б.getAttribute('aria-label') || '') === име || (б.textContent || '').indexOf(име) !== -1);
    if (чип) { чип.click(); return true; }
    const г = [...корен.querySelectorAll('.sec-head')].find(х => (х.textContent || '').indexOf(име) !== -1);
    if (г) { докарай(г); return true; }
    return false;
  }

  // 🪤 мерено в pl-instrumenti.js:242–248: scrollIntoView({smooth}) спира далеч от целта, защото
  //   .ro-room .jr-card има content-visibility:auto (mega.css:336) — картите по пътя растат, щом влязат
  //   в екрана. Същият доказан ред: мигновен скок, после донагласяне през 200 мс, докато картата
  //   застане (±16 px) две проверки подред, до 15 опита. Пипне ли мама екрана — спираме.
  function скролер(е) {
    for (let п = е.parentElement; п && п !== document.body; п = п.parentElement) {
      const о = getComputedStyle(п).overflowY;
      if ((о === 'auto' || о === 'scroll') && п.scrollHeight > п.clientHeight + 4) return п;
    }
    return null;
  }
  let скок = 0;
  function докарай(к, после) {
    const с = скролер(к);
    const мой = ++скок;
    if (!с) { try { к.scrollIntoView({ block: 'start' }); } catch (e) {} if (после) после(); return; }
    let опит = 0, добри = 0, пипна = false;
    const пусни = () => { пипна = true; };
    с.addEventListener('touchstart', пусни, { passive: true });
    с.addEventListener('wheel', пусни, { passive: true });
    const махни = () => { с.removeEventListener('touchstart', пусни); с.removeEventListener('wheel', пусни); };
    const цели = () => { const бе = с.scrollTop; с.scrollTop = бе + Math.round(к.getBoundingClientRect().top - с.getBoundingClientRect().top - 8); return с.scrollTop !== бе; };
    цели();
    (function провери() {
      if (мой !== скок) return махни();
      if (!к.isConnected || пипна) { махни(); return; }
      const д = к.getBoundingClientRect().top - с.getBoundingClientRect().top - 8;
      if (Math.abs(д) <= 16) добри++;
      else if (!цели()) добри++;                  // опряна в дъното на стаята — по-нагоре не може
      else добри = 0;
      if (добри < 2 && ++опит < 15) { setTimeout(провери, 200); return; }
      махни();
      if (после) после();
    })();
  }

  function отиди(корен, вид, id) {
    броячи.скокове++;
    безТърсене(корен);
    const много = карти(корен).some(к => к.dataset.blkeyExtra);
    let к = null, кът = 'Опитите';
    if (вид === 'dnes') к = картаПо(корен, [/^Днешното докосване/], id, много);
    else if (вид === 'prisada') к = картаПо(корен, [/^Присъдата/], id, много) || картаПо(корен, [/^Днешното докосване/], id, много);
    else if (ЦЕЛИ[вид]) { к = картаПо(корен, ЦЕЛИ[вид].карти); кът = ЦЕЛИ[вид].кът; }
    if (к) { покажи(к); return 'карта'; }
    return кътче(корен, кът) ? 'кътче' : 'нищо';
  }

  function наКлик(е) {
    const б = е.target.closest('button[data-lb]');
    if (!б) return;
    const корен = б.closest('#roRoom');
    if (!корен) return;
    const вид = б.getAttribute('data-lb');
    if (вид === 'kak') {
      // бутонът на героя (roomhero.js:243–249) — той отваря статията lib-a467c35f от библиотеката
      const х = корен.querySelector('.rh-lab-honest');
      if (х) х.click();
      return;
    }
    отиди(корен, вид, б.getAttribute('data-id') || '');
  }

  // ═══════════ ПОСТАВЯНЕТО ═══════════
  // 🪤 всяка наша промяна е мутация → наблюдателят ни вика пак. Пишем САМО при разлика (data-pl = подписът).
  // 🪤 lab.js:919 rerender() прави тяло.innerHTML = '' и връща скрола; блокът идва 40 мс по-късно НАД
  //   картите. Без scroll anchoring (Safari) картата под пръста на мама би подскочила надолу —
  //   затова при нов блок в превъртяна стая мерим котвата преди/след и връщаме разликата.
  function сложи(корен) {
    let б = корен.querySelector(':scope > .pl-lb');
    if (!вЛаб(корен)) { if (б) { б.remove(); броячи.записи++; } return; }
    const м = модел(корен);
    const подпис = JSON.stringify(м);
    if (!б) {
      б = document.createElement('section');
      б.className = 'pl-lb';
      б.setAttribute('aria-label', 'Моят опит и кътчетата на Лабораторията');
      б.addEventListener('click', наКлик);
    }
    if (б.getAttribute('data-pl') !== подпис) { б.innerHTML = рисувай(м); б.setAttribute('data-pl', подпис); броячи.записи++; }
    const банер = корен.querySelector(':scope > .pl-rhero');
    const наМясто = б.parentNode === корен && (банер ? б.previousElementSibling === банер : корен.firstElementChild === б);
    if (!наМясто) {
      const котва = корен.scrollTop > 0 ? (банер ? банер.nextElementSibling : корен.firstElementChild) : null;
      const преди = котва && котва !== б ? котва.getBoundingClientRect().top : null;
      корен.insertBefore(б, банер ? банер.nextSibling : корен.firstChild);
      броячи.записи++;
      if (преди != null && котва.isConnected) {
        const разл = котва.getBoundingClientRect().top - преди;
        if (Math.abs(разл) > 1) корен.scrollTop += разл;
      }
    }
  }

  function всички() {
    броячи.пресмятания++;
    document.querySelectorAll('#roRoom').forEach(к => { try { сложи(к); } catch (e) { броячи.грешки++; console.error('[Бейби Ленд] pl-lab', e); } });
  }
  // 🪤 setTimeout, не requestAnimationFrame — rAF спира, когато страницата не се рисува
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; всички(); }, 40); }

  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне на стая → гледаме статичния #roomOverlay
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    // отметката е в localStorage и в друг таб — storage не е мутация на DOM, затова и него слушаме
    window.addEventListener('storage', е => { if (!е.key || /^bl_lab|^bl_baby/.test(е.key)) отложено(); });
    всички();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_LAB = { сложи: всички, броячи, модел: () => { const к = document.getElementById('roRoom'); return к ? модел(к) : null; }, отиди: (вид, id) => { const к = document.getElementById('roRoom'); return к ? отиди(к, вид, id || '') : 'нищо'; } };
})();
