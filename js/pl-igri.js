/* ═══════════════════════════════════════════════════════════════════════════════
   🧸 PREMIUM „РАЗВИТИЕ И ИГРИ“ · по референциите на собственика (22.09.2026)
   Реф. 1 „Светът е за откриване“: под банера — хапче „Нашият етап“, дървен рафт
   Игри / Умения / Спомени, голяма карта „игра за днес“ и две чекмеджета
   („Първите пъти“, „Кутия за спомени“).
   Реф. 12 „Къде е зайчето?“: листът на играта — 3 стъпки, таймер „Примерно време“,
   „Запази идеята“.
   НИЩО не записва само: рафтът и чекмеджетата НАТИСКАТ съществуващите кътчета
   (.sec-nav .sec-chip от polish.js), играта се чете от банката на приложението
   (BL_DATA.activities, data.js:158), любимите са СЪЩИТЕ като в „Какво да правим
   днес?“ (bl_play_favs, dev.js:106–121), „Направихме я“ — същото bl_play_done (dev.js:124).
   Нови ключове в localStorage: НЯМА.
   МАТЕРИАЛИТЕ (22.09, втори кръг): бутоните са от общия речник на pl-ui.css —
   главното действие .pl-gel, второстепенното .pl-soft, панелите на листа .pl-felt.
   Листът е цяла страница върху сцената на стаята (img/scene/igri.webp), като реф. 12.
   Цифрите са в <span class="pl-ig-n"> (Nunito): старинните цифри на Georgia четат 0 като „о“.
   ПЪТ НАЗАД: махни <script src="js/pl-igri.js"> и <link href="css/pl-igri.css">
   от index.html — стаята се връща точно както беше (блокът и листът се правят само тук).
   Предишната версия на двата файла: scratchpad/ag2_igri_backup_pl-igri.{js,css}.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_IGRI) return;

  // ── четене и запис по СЪЩИТЕ правила като dev.js:10–11 (пазачът за форма е същият:
  //    масив срещу обект не се приема, повредено → стойността по подразбиране) ──
  const зареди = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  const запиши = (к, v) => {
    try { localStorage.setItem(к, JSON.stringify(v)); }
    catch (e) { if (window.BL_ZAPIS_PADNA) window.BL_ZAPIS_PADNA(); return false; }
    return true;
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));
  const двуц = n => String(n).padStart(2, '0');
  // цифрите в серифен текст — на Nunito (Georgia има старинни цифри: „10“ се чете „1о“)
  const цифри = s => esc(s).replace(/\d+/g, '<span class="pl-ig-n">$&</span>');
  // линейните знаци като SVG — ▶/♥ като символи стават цветни емоджи на част от телефоните
  const SVG_ИГРАЙ = '<svg class="pl-ig-svg i-play" viewBox="0 0 16 18" aria-hidden="true" focusable="false"><path d="M2.2 1.6v14.8a1.1 1.1 0 0 0 1.7.9l11.5-7.4a1.1 1.1 0 0 0 0-1.8L3.9.7a1.1 1.1 0 0 0-1.7.9z"/></svg>';
  const SVG_ПАУЗА = '<svg class="pl-ig-svg i-pause" viewBox="0 0 16 18" aria-hidden="true" focusable="false"><rect x="2" y="1.5" width="4.4" height="15" rx="1.4"/><rect x="9.6" y="1.5" width="4.4" height="15" rx="1.4"/></svg>';
  const SVG_СЪРЦЕ = '<svg class="pl-ig-heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.3s-7.3-4.5-9.1-8.8C1.6 8.2 3.6 4.6 7.1 4.6c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.5 3.6 4.2 6.9-1.8 4.3-9.1 8.8-9.1 8.8z"/></svg>';
  // плюшена иконка от спрайт 4×4: [лист, ред, колона]
  const ико = (л, р, к) => 'background-image:url(img/art/' + л + '.webp);background-position:' + (к * 100 / 3) + '% ' + (р * 100 / 3) + '%';

  // ── стаята: класът на персонажа е ro-sun (helper.js:137, същото правило като premium-rooms.js:19) ──
  function вИгрите() {
    const ов = document.getElementById('roomOverlay');
    const п = ов && ов.querySelector('.ro-panel');
    return !!(ов && !ов.hidden && п && п.classList.contains('ro-sun'));
  }

  // ═══════════ 📍 НАШИЯТ ЕТАП — възрастта по правилата на приложението ═══════════
  // BL_AGE = ageFromBirth (rooms2.js:156, изнесено на rooms2.js:2498): месеците се броят
  // с клампването на месечнината, а за недоносено има коригирана възраст (devMonths).
  // По devMonths се подбират игрите (dev.js:94) — затова и ние подбираме по него, и го казваме.
  function етап() {
    const б = зареди('bl_baby', { name: '', birth: '' });
    const а = б && б.birth && window.BL_AGE ? window.BL_AGE(б.birth) : null;
    if (а) {
      let т;
      if (а.ym < 1) т = а.totalDays + (а.totalDays === 1 ? ' ден' : ' дни');
      else if (а.ym < 24) т = а.ym + (а.ym === 1 ? ' месец' : ' месеца');
      else { const г = Math.floor(а.ym / 12), м = а.ym % 12; т = г + (г === 1 ? ' година' : ' години') + (м ? ' и ' + м + (м === 1 ? ' месец' : ' месеца') : ''); }
      const к = а.corr;
      const корр = к ? (к.ym < 1 ? к.totalDays + (к.totalDays === 1 ? ' ден' : ' дни') : к.ym + (к.ym === 1 ? ' месец' : ' месеца')) + ' коригирани' : '';
      return { вид: 'бебе', т, корр, мес: а.devMonths, ym: а.ym };
    }
    // бременна (bl_preg, както го чете premium-home.js) или още без дата
    if (зареди('bl_preg', null)) return { вид: 'бременност', т: 'Очакваме бебето', корр: 'към стаята „Бременност“', мес: null, ym: 0 };
    return { вид: 'празно', т: 'Добави датата', корр: 'рождената — в „Моето бебе“', мес: null, ym: 0 };
  }

  // ═══════════ 🎲 ИГРАТА ЗА ДНЕС — от банката „Какво да правим днес?“ ═══════════
  // Басейнът е като в dev.js:95 (a0 ≤ месеци ≤ a1, по devMonths), а изборът „за деня“ —
  // като в rooms7.js:70 + :125 (dayIndex % басейна), значи играта стои цял ден, не скача.
  // 🪤 Без рождена дата dev.js мълчаливо слага 8 месеца; rooms7.js (г13/253) го смята за
  //   гадаене за чуждо бебе. Тук взимаме от целия списък и хапчето казва, че датата липсва.
  const денИндекс = () => { const n = new Date(); return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000) + n.getFullYear(); };
  function играЗаДнес(мес) {
    const всички = (window.BL_DATA && Array.isArray(window.BL_DATA.activities) ? window.BL_DATA.activities : [])
      .filter(x => x && typeof x.t === 'string' && typeof x.x === 'string');
    if (!всички.length) return null;
    const пул = мес != null ? всички.filter(x => мес >= x.a0 && мес <= x.a1) : всички.slice();
    const п = пул.length ? пул : всички;
    return п[денИндекс() % п.length];
  }
  // Банката няма поле за продължителност. Ако описанието казва минути („20 мин мир“) — тях;
  // иначе 5, колкото е „Играта за 5 минути“ (rooms7.js:112). На екрана пише „около“ и „Примерно време“.
  function минути(игра) {
    const м = (игра.x.match(/(\d+)\s*мин/) || [])[1];
    const н = м ? +м : 0;
    return н >= 1 && н <= 30 ? н : 5;
  }
  const НУЖНО = { 'нищо': 'Нищо не ви трябва — само вие двамата', 'плат': 'Трябва ви платче или кърпа', 'кухня': 'Трябва ви нещо от кухнята', 'хартия': 'Трябва ви лист хартия' };

  // Стъпките: банката пази едно описание, не стъпки. Делим го ЧЕСТНО на изречения —
  // нищо не се дописва. „Никога.“ / „Пак.“ (под 12 знака) се лепят към предното изречение,
  // а над три — опашката отива в третата стъпка. Кавичките „…“ и скобите (…) не се режат:
  // „къде е мама?… ЕТО я!“ е едно изречение, не три.
  // 🪤 22.09 (мерено на „Къс-къс“): „Дай му (под надзор!) лист…“ се режеше след „)“ —
  //   правилото „кавичка след ! = край“ важеше и за скобата. Скобата вече само брои дълбочина.
  function стъпки(текст) {
    const s = String(текст || '').trim();
    const ОТВ = '„«(', ЗАТ = '“»)', КАВ = '“»', КРАЙ = '.!?…';
    const части = [];
    let дълб = 0, нач = 0;
    for (let i = 0; i < s.length; i++) {
      const ч = s[i];
      if (ОТВ.includes(ч)) { дълб++; continue; }
      if (ЗАТ.includes(ч)) { дълб = Math.max(0, дълб - 1); }
      if (дълб) continue;
      const следва = i + 1 === s.length || s[i + 1] === ' ';
      const край = (КРАЙ.includes(ч) && следва) || (КАВ.includes(ч) && КРАЙ.includes(s[i - 1]) && следва);
      if (край) { части.push(s.slice(нач, i + 1).trim()); нач = i + 1; }
    }
    if (s.slice(нач).trim()) части.push(s.slice(нач).trim());
    const сл = [];
    части.forEach(ч => { if (сл.length && ч.length < 12) сл[сл.length - 1] += ' ' + ч; else сл.push(ч); });
    while (сл.length > 3) { const п = сл.pop(); сл[сл.length - 1] += ' ' + п; }
    return сл.length ? сл : [s];
  }

  // ── най-дългата дума на заглавието да влиза в реда (иначе се реже по средата: „Прехвърлян|е“) ──
  // 🪤 мерено 22.09: при 26px Georgia „Прехвърляне“ = 189px, а редът е 173px; на Android е Noto Serif
  //   (по-широк) — затова мерим с ИСТИНСКИЯ шрифт (canvas.measureText), не броим букви. Тирето
  //   е място за пречупване, та „Пране-помощник“ се мери на части. Връща false, ако още няма размер.
  let платно = null;
  function побери(ел) {
    if (!ел || !ел.isConnected) return false;
    if (ел.style.fontSize) ел.style.fontSize = '';
    const cs = getComputedStyle(ел), р = ел.parentElement, рcs = getComputedStyle(р);
    const ширина = /%$/.test(cs.maxWidth)
      ? parseFloat(cs.maxWidth) / 100 * (р.clientWidth - parseFloat(рcs.paddingLeft) - parseFloat(рcs.paddingRight))
      : ел.clientWidth;
    if (!(ширина > 0)) return false;
    const к = платно || (платно = document.createElement('canvas').getContext('2d'));
    const думи = (ел.textContent || '').split(/[\s\-‐–]+/).filter(Boolean);
    if (!думи.length) return true;
    const най = px => { к.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + px + 'px ' + cs.fontFamily; return Math.max(...думи.map(д => к.measureText(д).width)); };
    const от = parseFloat(cs.fontSize), мин = Math.round(от * 0.72);
    let px = от;
    while (px > мин && най(px) > ширина - 2) px--;
    if (px !== от) ел.style.fontSize = px + 'px';
    return true;
  }

  // ═══════════ 🧸 БЛОКЪТ ПОД БАНЕРА ═══════════
  const РАФТ = [
    { кът: 'Играем заедно', надпис: 'Игри', ик: ['ico-d', 0, 3] },      // мече
    { кът: 'Расте и учи', надпис: 'Умения', ик: ['ico-b', 2, 0] },      // кубчета
    { кът: 'Творби и спомени', надпис: 'Спомени', ик: ['ico-b', 0, 1] }, // сърце
  ];

  // кое отделение на рафта е „отворено“ (розово) — само в паметта; по подразбиране „Игри“, като в реф. 1
  let избранРафт = 0;

  function рисувайБлок(е, ет, игра) {
    const ав = ет.вид === 'бебе' ? (ет.ym >= 6 ? ['ico-d', 1, 0] : ['ico-d', 0, 1]) : ['ico-d', 0, 1];
    const етапЕтикет = ет.вид === 'бебе' ? 'Нашият етап: ' + ет.т + (ет.корр ? ', ' + ет.корр : '') + ' — към „Расте и учи“'
      : ет.вид === 'бременност' ? 'Нашият етап: очакваме бебето — към стаята „Бременност“'
      : 'Нашият етап: добави рождената дата в „Моето бебе“';
    const н = игра ? минути(игра) : 5;
    е.innerHTML =
      '<button type="button" class="pl-ig-stage pl-soft" data-ig="etap" aria-label="' + esc(етапЕтикет) + '">' +
        '<span class="pl-ig-av pl-ig-i" aria-hidden="true" style="' + ико(ав[0], ав[1], ав[2]) + '"></span>' +
        '<span class="pl-ig-stage-t"><small>Нашият етап</small><b>' + цифри(ет.т) + '</b>' + (ет.корр ? '<em>' + esc(ет.корр) + '</em>' : '') + '</span>' +
        '<span class="pl-ig-chev" aria-hidden="true">›</span>' +
      '</button>' +
      '<div class="pl-ig-cab">' +
        '<div class="pl-ig-tabs">' +
          РАФТ.map((р, i) => '<button type="button" class="pl-ig-tab pl-soft' + (i === избранРафт ? ' on' : '') + '" data-kat="' + esc(р.кът) + '" data-raft="' + i + '" aria-label="' + esc(р.надпис + ' — към „' + р.кът + '“') + '">' +
            '<i class="pl-ig-i" aria-hidden="true" style="' + ико(р.ик[0], р.ик[1], р.ик[2]) + '"></i><span>' + esc(р.надпис) + '</span></button>').join('') +
        '</div>' +
        (игра ?
        '<div class="pl-ig-game">' +
          // реф. 1: зайчето под звездното одеялце, кубчетата и дъгата — rb-play.webp е точно тази сцена
          '<img class="pl-ig-art" src="img/art/rb-play.webp" alt="" loading="lazy" decoding="async" width="768" height="432">' +
          // aria-label върху обикновен <span> не се чете (ARIA 1.2: generic няма име) → скрит текст
          '<span class="pl-ig-age"><span aria-hidden="true">' + игра.a0 + '–' + игра.a1 + ' м.</span><span class="pl-ig-sr">За възраст от ' + игра.a0 + ' до ' + игра.a1 + ' месеца.</span></span>' +
          '<div class="pl-ig-game-t">' +
            '<small class="pl-ig-eyebrow">Игра за днес</small>' +
            '<h3 class="pl-ig-title">' + цифри(игра.t) + '</h3>' +
            '<p class="pl-ig-meta">Заедно · около ' + н + ' минути</p>' +
            '<button type="button" class="pl-ig-play pl-gel" data-ig="play" aria-haspopup="dialog">' + SVG_ИГРАЙ + '<span>Да поиграем</span><em aria-hidden="true">›</em></button>' +
          '</div>' +
        '</div>' : '') +
        '<div class="pl-ig-drawers">' +
          '<button type="button" class="pl-ig-drawer d-first" data-kat="Първите пъти"><i class="pl-ig-i" aria-hidden="true" style="' + ико('ico-d', 1, 2) + '"></i><span>Първите пъти</span><em aria-hidden="true">›</em></button>' +
          '<button type="button" class="pl-ig-drawer d-box" data-karta="Мигове за спомен" data-kat="Творби и спомени" aria-label="Кутия за спомени — към „Мигове за спомен“"><i class="pl-ig-i" aria-hidden="true" style="' + ико('ico-b', 1, 1) + '"></i><span>Кутия за спомени</span><em aria-hidden="true">›</em></button>' +
        '</div>' +
      '</div>';
  }

  // ── скок до кътче: натискаме СЪЩИЯ бутон от polish.js:100 (той скролва до .sec-head) ──
  function скочи(стая, кът) {
    const гл = () => [...стая.querySelectorAll('.sec-head')].find(х => (х.textContent || '').indexOf(кът) !== -1);
    const чип = [...стая.querySelectorAll('.sec-nav .sec-chip')].find(б =>
      (б.getAttribute('aria-label') || '') === кът || (б.textContent || '').indexOf(кът) !== -1);
    if (чип) { чип.click(); докарай(стая, гл); return true; }
    const г = гл();
    if (г) { г.scrollIntoView({ behavior: плавно(), block: 'start' }); докарай(стая, гл); return true; }
    return false;
  }
  // ── скок до карта: сгъната ли е — натискаме нейния ▾ (polish.js:226, той пази bl_folds) ──
  function къмКарта(стая, име, резервно) {
    const намери = () => [...стая.querySelectorAll('section.jr-card')].find(с => { const з = с.querySelector('h4.jr-title'); return з && з.textContent.indexOf(име) !== -1; });
    const к = намери();
    if (!к) return скочи(стая, резервно);
    if (к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); }
    к.scrollIntoView({ behavior: плавно(), block: 'start' });
    докарай(стая, намери);
    return true;
  }
  // 🪤 22.09 (мерено, ag_igri_skok.js): и СВОЯТ чип на стаята спираше на 1182 px ПРЕД
  //   „Играем заедно“ — картите по пътя се дорисуват, докато плавният скрол върви, и целта
  //   бяга надолу. Когато скролът утихне и целта не е горе (±24 px) — още един скок без
  //   плавност, до 3 пъти за 4 с. Само scrollTop — DOM не се пипа. Пръст/колелце го спират.
  function докарай(стая, цел) {
    let пред = -1, тихо = 0, опити = 0, спри = false;
    const т0 = Date.now();
    const пусни = () => { спри = true; };
    стая.addEventListener('touchstart', пусни, { once: true, passive: true });
    стая.addEventListener('wheel', пусни, { once: true, passive: true });
    const край = () => { стая.removeEventListener('touchstart', пусни); стая.removeEventListener('wheel', пусни); };
    const стъпка = () => {
      const е = цел();
      if (спри || !е || !стая.isConnected || Date.now() - т0 > 4000) { край(); return; }
      const ст = стая.scrollTop;
      тихо = Math.abs(ст - пред) < 2 ? тихо + 1 : 0;
      пред = ст;
      if (тихо >= 2) {
        const разл = е.getBoundingClientRect().top - стая.getBoundingClientRect().top;
        if (Math.abs(разл) <= 24 || опити >= 3) { край(); return; }
        опити++; тихо = 0;
        е.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
      setTimeout(стъпка, 150);
    };
    setTimeout(стъпка, 200);
  }
  const плавно = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; } catch (e) { return 'smooth'; } };

  function отвориСтая(име) { try { if (window.MamaHelper && window.MamaHelper.open) window.MamaHelper.open(име); } catch (e) {} }

  function наКлик(e) {
    const б = e.target.closest('button');
    if (!б) return;
    const стая = б.closest('#roRoom');
    if (!стая) return;
    const д = б.getAttribute('data-ig');
    if (д === 'etap') {
      const ет = етап();
      if (ет.вид === 'бебе') скочи(стая, 'Расте и учи');
      else отвориСтая(ет.вид === 'бременност' ? 'Бременност' : 'Моето бебе');
      return;
    }
    if (д === 'play') { const и = играЗаДнес(етап().мес); if (и) отвориЛист(и, б); return; }
    const карта = б.getAttribute('data-karta');
    if (карта) { къмКарта(стая, карта, б.getAttribute('data-kat')); return; }
    const рафт = б.getAttribute('data-raft');
    if (рафт != null) {
      избранРафт = +рафт;
      // само класове — в същия блок; наблюдателят ще види мутация, но ключът е същият → нищо не се прерисува
      б.parentElement.querySelectorAll('.pl-ig-tab').forEach(т => { const да = т === б; if (т.classList.contains('on') !== да) т.classList.toggle('on', да); });
    }
    const кът = б.getAttribute('data-kat');
    if (кът) скочи(стая, кът);
  }

  // 🪤 Всяка промяна тук е мутация под #roomOverlay → наблюдателят ни вика пак.
  //   Затова: блокът се рисува наново САМО при разлика в ключа (възраст + игра), а съществуващ
  //   блок не се мести никога (ако друг скрипт вмъкне нещо до банера — не се гоним с него).
  function сложи() {
    const игри = вИгрите();
    document.querySelectorAll('#roRoom').forEach(стая => {
      const стар = стая.querySelector(':scope > .pl-ig');
      if (!игри) { if (стар) стар.remove(); return; }
      if (!стая.querySelector('.sec-nav')) return;          // още не е нарисувана (или е друг раздел)
      const ет = етап();
      const игра = играЗаДнес(ет.мес);
      const ключ = ет.вид + '|' + ет.т + '|' + ет.корр + '|' + (игра ? игра.t : '-');
      let е = стар;
      if (!е) {
        е = document.createElement('section');
        е.className = 'pl-ig';
        е.setAttribute('aria-label', 'Игри, умения и спомени');
        е.addEventListener('click', наКлик);
        const банер = стая.querySelector(':scope > .pl-rhero');
        стая.insertBefore(е, банер ? банер.nextSibling : стая.firstChild);
      }
      if (е.getAttribute('data-pl') !== ключ) { рисувайБлок(е, ет, игра); е.setAttribute('data-pl', ключ); }
      // заглавието се мери чак когато блокът има размер (в „Статии“ стаята е скрита → чакаме);
      // маркерът data-pl-fit пази да не мерим пак (всяко писане е мутация → пак сме тук)
      if (е.getAttribute('data-pl-fit') !== ключ && е.offsetWidth) {
        if (побери(е.querySelector('.pl-ig-title')) || !е.querySelector('.pl-ig-title')) е.setAttribute('data-pl-fit', ключ);
      }
    });
    if (лист && !лист.hidden && !игри) затвориЛист(false);
  }

  // ═══════════ 📒 ЛИСТЪТ НА ИГРАТА (реф. 12) ═══════════
  // Живее в <body>, НЕ в #roomOverlay: таймерът пише всяка секунда и иначе би будил
  // наблюдателите на стаята (нашия и premium-rooms.js) по веднъж в секунда.
  let лист = null, отКого = null, текуща = null;
  const т = { общо: 300000, остава: 300000, край: 0, ид: null, с: 'готов' };

  function направиЛист() {
    const в = document.createElement('div');
    в.className = 'pl-ig-veil';
    в.hidden = true;
    // Реф. 12: цялата страница е сцената на стаята (бебето на килима), заглавието е вляво
    // върху нея, а тефтерът, таймерът и „Запази идеята“ са предмети отгоре (.pl-felt / .pl-gel / .pl-soft).
    в.innerHTML =
      '<div class="pl-ig-sheet" role="dialog" aria-modal="true" aria-labelledby="plIgT" tabindex="-1">' +
        '<div class="pl-ig-bar">' +
          '<button type="button" class="pl-ig-x" data-ig="x" aria-label="Затвори играта">✕</button>' +
          '<a class="pl-ig-112" href="tel:112" aria-label="Спешен телефон 112">SOS 112</a>' +
        '</div>' +
        '<div class="pl-ig-hero">' +
          '<div class="pl-ig-hero-t">' +
            '<h2 id="plIgT"></h2>' +
            '<span class="pl-ig-tag"></span>' +
            '<p>Малките моменти създават големи усмивки <i aria-hidden="true">♡</i></p>' +
          '</div>' +
        '</div>' +
        '<section class="pl-ig-book pl-felt" aria-labelledby="plIgB">' +
          '<h3 id="plIgB">Малък момент за двама <i aria-hidden="true">♡</i></h3>' +
          '<p class="pl-ig-need"></p>' +
          '<ol class="pl-ig-steps" role="list"></ol>' +
        '</section>' +
        '<div class="pl-ig-timer pl-felt">' +
          '<i class="pl-ig-clock pl-ig-i" aria-hidden="true" style="' + ико('ico-b', 3, 0) + '"></i>' +
          '<div class="pl-ig-time"><b role="timer" aria-label="Оставащо време">05:00</b><small>Примерно време</small></div>' +
          '<button type="button" class="pl-ig-go pl-gel" data-ig="go">' + SVG_ИГРАЙ + SVG_ПАУЗА + '<span>Започни играта</span></button>' +
        '</div>' +
        '<div class="pl-ig-row2">' +
          '<button type="button" class="pl-ig-reset pl-soft" data-ig="reset" hidden>↺ Отначало</button>' +
          '<button type="button" class="pl-ig-done pl-soft" data-ig="done" hidden>✔ Направихме я</button>' +
        '</div>' +
        '<button type="button" class="pl-ig-fav pl-soft" data-ig="fav" aria-pressed="false">' + SVG_СЪРЦЕ + '<span>Запази идеята</span></button>' +
        '<p class="pl-ig-note">Времето е примерно — водете се по бебето. Любимите се пазят в „Какво да правим днес?“.</p>' +
        '<p class="pl-ig-sr" aria-live="polite"></p>' +
      '</div>';
    в.addEventListener('click', e => {
      if (e.target === в) { затвориЛист(true); return; }
      const б = e.target.closest('button[data-ig]');
      if (!б) return;
      const д = б.getAttribute('data-ig');
      if (д === 'x') затвориЛист(true);
      else if (д === 'go') { if (т.с === 'върви') пауза(); else if (т.с === 'край') { отначало(); пусни(); } else пусни(); }
      else if (д === 'reset') отначало();
      else if (д === 'fav') любима();
      else if (д === 'done') направихме();
    });
    document.body.appendChild(в);
    return в;
  }

  function отвориЛист(игра, бутон) {
    if (!лист) лист = направиЛист();
    текуща = игра;
    отКого = бутон || document.activeElement;
    const с = лист.querySelector('.pl-ig-sheet');
    с.querySelector('#plIgT').innerHTML = цифри(игра.t);
    с.querySelector('.pl-ig-tag').textContent = 'Игра заедно · ' + игра.a0 + '–' + игра.a1 + ' м.';
    с.querySelector('.pl-ig-need').textContent = НУЖНО[игра.need] || '';
    с.querySelector('.pl-ig-need').hidden = !НУЖНО[игра.need];
    с.querySelector('.pl-ig-steps').innerHTML = стъпки(игра.x).map((x, i) =>
      '<li class="st-' + (i + 1) + '"><b aria-hidden="true">' + (i + 1) + '</b><span>' + esc(x) + '</span></li>').join('');
    т.общо = минути(игра) * 60000;
    отначало(true);
    рисувайЛюбима();
    с.scrollTop = 0;
    // 🪤 22.09 (мерено на снимка: воалът се виждаше, листът — НЕ): touch.css:708 спира
    //   animation-play-state на всичко в <body> извън #roomOverlay, докато стаята е отворена.
    //   CSS анимацията на листа замръзваше на първия кадър (opacity 0). Сега е ПРЕХОД от клас
    //   is-from; преходите не се спират от онова правило, а ако не тръгне — листът пак е видим.
    с.classList.add('is-from');
    лист.hidden = false;
    void с.offsetWidth;
    побери(с.querySelector('#plIgT'));   // 34px: „Прехвърляне“ е 247px, а колоната ~214px
    с.classList.remove('is-from');
    document.addEventListener('keydown', клавиш, true);
    document.addEventListener('visibilitychange', тик);
    const x = с.querySelector('.pl-ig-x');
    try { x.focus({ preventScroll: true }); } catch (e) { x.focus(); }
  }

  function затвориЛист(върниФокус) {
    if (!лист || лист.hidden) return;
    сприИнтервал();
    т.с = 'готов';
    лист.hidden = true;
    document.removeEventListener('keydown', клавиш, true);
    document.removeEventListener('visibilitychange', тик);
    if (върниФокус) {
      // блокът може да е прерисуван, докато листът е отворен → търсим новия бутон
      let ц = отКого && отКого.isConnected ? отКого : document.querySelector('#roRoom .pl-ig-play');
      try { if (ц) ц.focus({ preventScroll: true }); } catch (e) {}
    }
    отКого = null;
  }

  // ♿ Esc и Tab. Слушаме в ЗАХВАТ на document, за да сме преди helper.js:5574 (там Esc
  //   затваря цялата стая). Маркерът __blСлойПоет е протоколът на приложението за
  //   „този Esc е изяден от горния слой“ (articles.js:597 → helper.js:5579).
  function клавиш(e) {
    if (!лист || лист.hidden) return;
    if (e.key === 'Escape') {
      e.__blСлойПоет = true;
      e.preventDefault(); e.stopPropagation();
      затвориЛист(true);
      return;
    }
    if (e.key !== 'Tab') return;
    const с = лист.querySelector('.pl-ig-sheet');
    const в = [...с.querySelectorAll('button, a[href]')].filter(x => !x.hidden && x.offsetParent !== null && !x.disabled);
    if (!в.length) return;
    const пър = в[0], пос = в[в.length - 1], акт = document.activeElement;
    if (!с.contains(акт)) { e.preventDefault(); пър.focus(); return; }
    if (e.shiftKey && (акт === пър || акт === с)) { e.preventDefault(); пос.focus(); }
    else if (!e.shiftKey && акт === пос) { e.preventDefault(); пър.focus(); }
  }

  // ── таймерът: краят е АБСОЛЮТНО време (като rooms7.js:131 — „проход 4“), за да не
  //    замръзва при заключен екран. Без звук и без вибрация. ──
  function сприИнтервал() { if (т.ид) { clearInterval(т.ид); т.ид = null; } }
  function пусни() {
    if (т.остава <= 0) т.остава = т.общо;
    т.край = Date.now() + т.остава;
    т.с = 'върви';
    сприИнтервал();
    т.ид = setInterval(тик, 500);
    обяви('Играта тръгна. ' + Math.ceil(т.остава / 60000) + ' минути, примерно.');
    тик();
  }
  function пауза() {
    т.остава = Math.max(0, т.край - Date.now());
    т.с = 'пауза';
    сприИнтервал();
    обяви('Пауза.');
    рисувайТаймер();
  }
  function отначало(тихо) {
    сприИнтервал();
    т.остава = т.общо;
    т.с = 'готов';
    if (!тихо) обяви('Отначало.');
    рисувайТаймер();
  }
  function тик() {
    if (т.с !== 'върви') return;
    т.остава = Math.max(0, т.край - Date.now());
    if (т.остава <= 0) { сприИнтервал(); т.с = 'край'; обяви('Времето мина. Браво на вас.'); }
    рисувайТаймер();
  }
  // 🪤 Таймерът пише 2 пъти в секунда. `textContent = …` сменя текстовия възел (childList) и буди
  //   всеки наблюдател на <body> (pl-ui.js обхожда целия документ при childList). Затова, когато
  //   елементът има един текстов възел, сменяме само nodeValue (characterData) — никого не буди.
  const сложиТекст = (е, х) => {
    if (!е || е.textContent === х) return;
    const в = е.childNodes;
    if (в.length === 1 && в[0].nodeType === 3) в[0].nodeValue = х; else е.textContent = х;
  };
  function рисувайТаймер() {
    if (!лист) return;
    const с = лист.querySelector('.pl-ig-sheet');
    const сек = Math.ceil(т.остава / 1000);
    сложиТекст(с.querySelector('.pl-ig-time b'), двуц(Math.floor(сек / 60)) + ':' + двуц(сек % 60));
    сложиТекст(с.querySelector('.pl-ig-time small'),
      т.с === 'върви' ? 'остава · примерно' : т.с === 'пауза' ? 'на пауза' : т.с === 'край' ? 'Времето мина ♡' : 'Примерно време');
    сложиТекст(с.querySelector('.pl-ig-go span'), т.с === 'върви' ? 'Пауза' : т.с === 'пауза' ? 'Продължи' : т.с === 'край' ? 'Още веднъж' : 'Започни играта');
    const го = с.querySelector('.pl-ig-go');
    if (го.classList.contains('is-run') !== (т.с === 'върви')) го.classList.toggle('is-run', т.с === 'върви');
    const рс = с.querySelector('.pl-ig-reset'), дн = с.querySelector('.pl-ig-done');
    const скрийР = !(т.с === 'пауза'), скрийД = !(т.с === 'край' || т.с === 'пауза');
    if (рс.hidden !== скрийР) рс.hidden = скрийР;
    if (дн.hidden !== скрийД) дн.hidden = скрийД;
    if (!скрийД && текуща) {
      const пъти = (зареди('bl_play_done', {}) || {})[текуща.t] || 0;
      сложиТекст(дн, '✔ Направихме я' + (пъти ? ' (' + пъти + ')' : ''));
    }
  }
  function обяви(х) { if (лист) сложиТекст(лист.querySelector('.pl-ig-sr'), х); }

  // ── ♡ любимите: СЪЩИЯТ масив със заглавия като dev.js:118–121 (там ги показва „Твоите любими“) ──
  function любима() {
    if (!текуща) return;
    const f = зареди('bl_play_favs', []);
    const i = f.indexOf(текуща.t);
    if (i > -1) f.splice(i, 1); else f.push(текуща.t);
    if (запиши('bl_play_favs', f)) обяви(i > -1 ? 'Махнах я от любимите.' : 'Запазих я в любимите.');
    рисувайЛюбима();
  }
  function рисувайЛюбима() {
    if (!лист || !текуща) return;
    const б = лист.querySelector('.pl-ig-fav');
    const да = зареди('bl_play_favs', []).indexOf(текуща.t) > -1;
    if (б.getAttribute('aria-pressed') !== String(да)) б.setAttribute('aria-pressed', String(да));   // сърцето се пълни от CSS
    сложиТекст(б.querySelector('span'), да ? 'Запазена в любимите' : 'Запази идеята');
  }
  // ── ✔ „Направихме я“: броячът е същият като в dev.js:124–125 ──
  function направихме() {
    if (!текуща) return;
    const d = зареди('bl_play_done', {});
    d[текуща.t] = (d[текуща.t] || 0) + 1;
    if (запиши('bl_play_done', d)) обяви('Записах: направихте я ' + d[текуща.t] + (d[текуща.t] === 1 ? ' път.' : ' пъти.'));
    рисувайТаймер();
  }

  // ═══════════ наблюдателят ═══════════
  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне → гледаме статичния #roomOverlay с поддърво.
  // 🪤 setTimeout, не requestAnimationFrame — rAF спира, когато страницата не се рисува.
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; try { сложи(); } catch (e) {} }, 40); }
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    сложи();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_IGRI = { сложи, стъпки, играЗаДнес, етап, отвориЛист, затвориЛист, побери };
})();
