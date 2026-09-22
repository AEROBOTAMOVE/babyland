/* ═══════════════════════════════════════════════════════════════════════════════
   🩺 PREMIUM ЗДРАВЕН ТАБЛО-БЛОК · стаята „Здраве и SOS“ (референция 15 „Спокойствие и грижа“)
   22.09.2026. Веднага под банера (.pl-rhero от premium-rooms.js) в #roRoom:
     · два бутона-хапчета: „Контакти за помощ“ (скача до СЪЩЕСТВУВАЩАТА карта „При спешност“)
       и „Нов здравен запис“ (малък избор → скача до СЪЩЕСТВУВАЩАТА карта и слага курсора в полето ѝ);
     · карта „Здравният дневник на {име}“: Прегледи · Температура · Лекарства · Документи —
       всеки ред чете СЪЩИЯ склад, в който пише старата карта, и скача до нея (разгъва я, ако е сгъната);
     · „Спешна помощ · 112“ (<a href="tel:112">) и „Записките не заменят преглед.“
   НИЩО НЕ ЗАПИСВА. Нито един нов ключ в localStorage. Старата червена карта „При спешност“ остава.
   Разгъването на сгъната карта става с НЕЙНИЯ бутон ▾ (polish.js decorate → превключи), тоест
   паметта за сгъването (bl_folds) я пише старият код, както при ръчно докосване.
   Празен ред = ПОКАНА („Запиши първото измерване“), и докосването му слага курсора в полето на
   старата карта — същият път като „Нов здравен запис“. Материалите: .pl-gel / .pl-felt / .pl-soft (pl-ui.css).
   ПЪТ НАЗАД: махни <link href="css/pl-zdrave.css"> и <script src="js/pl-zdrave.js"> от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_ZDRAVE) return;

  // Чете като load() в sos.js:16 / rooms10.js:13 — повреден запис или сменен тип = стойността по подразбиране.
  const чети = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  const двуц = n => String(n).padStart(2, '0');
  const МЕС = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
  const същ = (а, б) => а.getFullYear() === б.getFullYear() && а.getMonth() === б.getMonth() && а.getDate() === б.getDate();
  // „днес, 14:05“ · „вчера, 22:40“ · „21 сеп“ · „21 сеп 2025“
  function кога(ts, безЧас) {
    const д = new Date(ts); if (isNaN(д.getTime())) return '';
    const сега = new Date(), вчера = new Date(сега.getFullYear(), сега.getMonth(), сега.getDate() - 1);
    const час = безЧас ? '' : ', ' + двуц(д.getHours()) + ':' + двуц(д.getMinutes());
    if (същ(д, сега)) return 'днес' + час;
    if (същ(д, вчера)) return 'вчера' + час;
    return д.getDate() + ' ' + МЕС[д.getMonth()] + (д.getFullYear() !== сега.getFullYear() ? ' ' + д.getFullYear() : '');
  }
  const брой = (n, едно, много) => n + ' ' + (n === 1 ? едно : много);

  // ── 🩺 ПРОФИЛАКТИЧНИТЕ ПРЕГЛЕДИ ──
  // 🪤 Таблицата е ПРЕПИС от checkups.js:56-70 (ПРЕГЛЕДИ — [месец-от, месец-до, …, име]); отметките
  //   в bl_baby_checkups са по НОМЕР на реда (checkups.js:78, 101-103: б[i] = !б[i]). Ако някой добави
  //   ред в checkups.js, трябва да се добави и тук — иначе номерата се разминават.
  const ПРЕГЛЕДИ = [[0, 0, 'Първите дни у дома'], [1, 1, 'На 1 месец'], [2, 2, 'На 2 месеца'], [3, 3, 'На 3 месеца'],
    [4, 4, 'На 4 месеца'], [6, 6, 'На 6 месеца'], [9, 9, 'На 9 месеца'], [12, 12, 'На годинка'],
    [15, 18, 'Към 15–18 месеца'], [24, 24, 'На 2 години'], [36, 36, 'На 3 години']];
  // Възрастта — както checkups.js:45-51 (възрастМесеци): календарният месец `ym` от BL_AGE (rooms2.js:156).
  function бебе() {
    const б = чети('bl_baby', {}) || {};
    const име = String(б.name || '').trim();
    let а = null;
    if (б.birth && window.BL_AGE) { try { а = BL_AGE(б.birth); } catch (e) { а = null; } }
    let м = а && а.ym != null ? а.ym : null;
    if (м == null && б.birth) { const т = new Date(б.birth).getTime(); if (!isNaN(т)) м = Math.floor((Date.now() - т) / 2629800000); }
    let възраст = '';
    if (м != null && м >= 0) {
      if (м < 1) { const дни = а ? а.totalDays : Math.max(0, Math.floor((Date.now() - new Date(б.birth).getTime()) / 864e5)); възраст = брой(дни, 'ден', 'дни'); }
      else if (м < 24) възраст = брой(м, 'месец', 'месеца');
      else { const г = Math.floor(м / 12); възраст = брой(г, 'година', 'години'); }
    }
    return { име, м: м != null && м >= 0 ? м : null, възраст };
  }
  const малко = т => т.charAt(0).toLowerCase() + т.slice(1);
  function прегледи(м) {
    // без рождена дата картата в „Моето бебе“ пак рисува целия списък за отмятане (checkups.js:83-87)
    if (м == null) return { т: 'Кои прегледи кога — виж списъка', празно: true };
    const бях = чети('bl_baby_checkups', {}) || {};
    const отм = i => !!бях[i];
    let първа;
    const сега = ПРЕГЛЕДИ.findIndex(([от, до]) => м >= от && м <= до);
    if (сега >= 0 && !отм(сега)) първа = 'Сега: ' + малко(ПРЕГЛЕДИ[сега][2]);
    else {
      const сл = ПРЕГЛЕДИ.findIndex(([от], i) => от > м && !отм(i));
      първа = сл >= 0 ? 'Следващ: ' + малко(ПРЕГЛЕДИ[сл][2]) : 'Няма предстоящ в списъка';
    }
    // последният: отбелязана ваксина (bl_vax_log — масив 'YYYY-MM-DD', rooms6.js:307-330) или последният ✔ ред
    const вакс = (чети('bl_vax_log', []) || []).filter(x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
    let втора = '';
    if (вакс.length) втора = 'ваксина ' + кога(new Date(вакс[вакс.length - 1] + 'T12:00:00').getTime(), true);
    else {
      let и = -1; ПРЕГЛЕДИ.forEach((x, i) => { if (отм(i)) и = i; });
      втора = и >= 0 ? '✔ ' + малко(ПРЕГЛЕДИ[и][2]) : 'още няма отметнат';
    }
    return { т: първа + ' · ' + втора, празно: false };
  }

  // ── 🌡️ ТЕМПЕРАТУРА: bl_temps = [{ v, ts }], пише се с push в края (rooms3.js:1373-1377, rooms2.js:2165-2170),
  //   последният е последният в масива (както helper.js:690 и 805 `.slice(-1)[0]`).
  function температура() {
    const м = чети('bl_temps', []) || [];
    for (let i = м.length - 1; i >= 0; i--) {
      const x = м[i];
      if (x && typeof x.v === 'number' && isFinite(x.v) && isFinite(x.ts)) return { т: 'Последно: ' + x.v + ' °C · ' + кога(x.ts), празно: false };
    }
    return { т: 'Запиши първото измерване', празно: true };
  }
  // ── 💊 ЛЕКАРСТВА: bl_meds = [{ n, ts }] (rooms3.js:1418-1422 и 1433) — пази до 60, последният е в края.
  function лекарства() {
    const м = (чети('bl_meds', []) || []).filter(x => x && x.n != null && isFinite(x.ts));
    if (!м.length) return { т: 'Запиши какво е дадено и кога', празно: true };
    return { т: брой(м.length, 'запис', 'записа') + ' · последно ' + кога(м[м.length - 1].ts), празно: false };
  }
  // ── 📄 ДОКУМЕНТИ: здравните бележки bl_notes_health = [{ t, d }] (rooms2.js:2833 + notesCard 2506, push 2577)
  //   и снимките на обрив bl_rash = [{ img, note, ts }] (rooms3.js:1888 → expr.js:146). И двете се
  //   печатат/показват на лекаря — затова са „документите“ на здравето.
  function документи() {
    const б = (чети('bl_notes_health', []) || []).filter(x => x && x.t != null);
    const с = (чети('bl_rash', []) || []).filter(x => x && x.img);
    if (!б.length && !с.length) return { т: 'Добави бележка от прегледа', празно: true, карта: 'Здравни бележки' };
    const части = [];
    if (б.length) части.push(брой(б.length, 'бележка', 'бележки'));
    if (с.length) части.push(брой(с.length, 'снимка', 'снимки'));
    const посл = Math.max(б.length ? +б[б.length - 1].d || 0 : 0, с.length ? +с[с.length - 1].ts || 0 : 0);
    if (посл) части.push('последно ' + кога(посл, true));
    return { т: части.join(' · '), празно: false, карта: б.length || !с.length ? 'Здравни бележки' : 'Фото на обрив' };
  }

  // ── иконки (плюшените спрайтове 4×4) ──
  const ико = (лист, р, к) => 'background-image:url(img/art/' + лист + '.webp);background-position:' + (к * 100 / 3) + '% ' + (р * 100 / 3) + '%';
  const СТРЕЛКА = '<svg class="pl-zd-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5 15.5 12 9 18.5"/></svg>';
  const ТЕЛЕФОН = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.8h2.6l1.4 4-2 1.4a11.6 11.6 0 0 0 6.2 6.2l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 6a2 2 0 0 1 2-2.2z"/></svg>';
  const ЛИСТ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 3.5H7.2A1.7 1.7 0 0 0 5.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h5.3M13.5 3.5l5 5M13.5 3.5v5h5M18.5 8.5v4"/><path d="M8.5 12.5h5M8.5 15.5h3M17.5 15v6M14.5 18h6"/></svg>';
  const КРЪСТ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.6 4h4.8v5.6H20v4.8h-5.6V20H9.6v-5.6H4V9.6h5.6z"/></svg>';
  const ИНФО = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/></svg>';

  // Редовете на дневника: [ключ, заглавие, иконка, тон, запис при празно (ключ от ЗАПИСИ)]
  //   иконките като на референцията: календар · термометър · капсула · папка (ico-c [0,0] —
  //   същата папка е „Наръчник и документи“ в premium-rooms.js ИКОНИ, един език за „документи“)
  const РЕДОВЕ = [
    ['pregledi', 'Прегледи', ['ico-a', 0, 1], 'pink'],
    ['temp', 'Температура', ['ico-a', 3, 1], 'sky', 'temp'],
    ['med', 'Лекарства — лични записки', ['ico-e', 0, 3], 'mint', 'med'],
    ['docs', 'Документи', ['ico-c', 0, 0], 'lilac', 'note'],
  ];
  // „Нов здравен запис“ → [ключ, надпис, иконка, тон, картата, полето в нея]
  const ЗАПИСИ = [
    ['temp', 'Температура', ['ico-a', 3, 1], 'sky', 'Температурен дневник', 'input'],   // полето е type=number (rooms3.js:1364) — 'input' хваща и двете
    ['med', 'Лекарство', ['ico-e', 0, 3], 'mint', 'Дневник на даденото', '.jr-addrow input'],
    ['note', 'Преглед · бележка', ['ico-a', 3, 2], 'lilac', 'Здравни бележки', 'textarea'],
  ];
  const КАРТА_ЗА = { temp: 'Температурен дневник', med: 'Дневник на даденото' };

  // ── намиране и показване на СЪЩЕСТВУВАЩА карта ──
  function карта(корен, дума) {
    if (!корен) return null;
    return [...корен.querySelectorAll('section.jr-card')].find(к => {
      const т = к.querySelector('.jr-title');
      return т && (т.textContent || '').includes(дума);
    }) || null;
  }
  function скролер(е) {
    for (let п = е.parentElement; п && п !== document.body; п = п.parentElement) {
      const о = getComputedStyle(п).overflowY;
      if ((о === 'auto' || о === 'scroll') && п.scrollHeight > п.clientHeight + 4) return п;
    }
    return null;
  }
  // 🪤 22.09 (мерено): .ro-room .jr-card е с content-visibility:auto и приблизителна височина 220 px
  //   (mega.css:336). Картите по пътя получават истинската си височина едва щом влязат в екрана, та
  //   scrollIntoView({smooth}) спираше на стотици пиксели от целта (температурата: 1677 px под екрана,
  //   лекарствата: 1714 px над него). Затова: скок + донагласяне, докато картата спре да мърда.
  //   🪤 и второ (мерено при „Прегледи“ → „Моето бебе“): по същата причина scrollHeight в началото е
  //   МАЛЪК — скролът опира в дъното (2870), картите там се раждат, дъното пада надолу, а целта е още
  //   1862 px под екрана. Затова: мигновен скок и донагласяне, докато картата застане (±24 px) ДВЕ
  //   проверки подред — както вече доказаното в preg20.js:870-888.
  //   🪤 НО не бързо и не в току-що отворена стая (мерено 22.09): таймер 120 мс с допуск 3 px се
  //   бореше с „котвата“ на браузъра, докато картите се раждаха — стаята „Моето бебе“ се люля 8+ с
  //   между 1653 и 6385 px. Един скок в УЛЕГНАЛА стая стои (−16 px, 2 с без мърдане) — затова
  //   междустайният скок чака стаята да улегне (къмПрегледите), а тук проверката е през 200 мс.
  //   Пипне ли мама екрана сама — спираме, не се борим с пръста ѝ.
  //   🪤 и трето (мерено): два бързи скока един след друг = два цикъла, които се дърпат (лекарствата
  //   останаха на −1958 px, защото предишният цикъл още целеше бележките). Нов скок гаси стария.
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
      if (мой !== скок) return махни();                      // по-нов скок пое
      if (!к.isConnected || пипна) { махни(); return; }
      const д = к.getBoundingClientRect().top - с.getBoundingClientRect().top - 8;
      if (Math.abs(д) <= 16) добри++;
      else if (!цели()) добри++;                             // опряна в дъното на стаята — по-нагоре не може
      else добри = 0;
      if (добри < 2 && ++опит < 15) { setTimeout(провери, 200); return; }
      махни();
      if (после) после();
    })();
  }
  function покажи(к) {
    if (к.classList.contains('folded')) {
      // разгъва я СОБСТВЕНИЯТ ѝ бутон ▾ (polish.js: клик по заглавието → превключи() + bl_folds)
      const б = к.querySelector('.jr-title .fold-btn');
      if (б) б.click(); else к.classList.remove('folded');
    }
    // накрая същото премигване като съдържанието на стаята (polish.js mountToc → .toc-flash, mega.css:611)
    докарай(к, () => { к.classList.remove('toc-flash'); void к.offsetWidth; к.classList.add('toc-flash'); });
  }
  function скочи(блок, дума) {
    const к = карта(блок.parentElement, дума);
    if (к) { покажи(к); return true; }
    return false;
  }
  // Прегледите се отмятат в „Моето бебе“ (checkups.js:414-421 закача картата там) — отваряме стаята
  // по стария път и чакаме картата да се нарисува.
  //   Скачаме едва когато стаята е УЛЕГНАЛА: скелетът (.ro-skel, helper.js skeleton — маха се на 640 мс)
  //   го няма и са минали поне 900 мс (броячите тръгват на 660 мс). Виж 🪤 при докарай().
  function къмПрегледите() {
    if (!window.MamaHelper || !MamaHelper.open) return;
    MamaHelper.open('Моето бебе');
    const от = Date.now();
    let опит = 0;
    const търси = () => {
      const стая = document.getElementById('roRoom');
      const к = карта(стая, 'Профилактичните прегледи');
      const улегнала = Date.now() - от >= 900 && стая && !стая.querySelector('.ro-skel');
      if (к && улегнала && к.offsetParent !== null) { покажи(к); return; }
      if (++опит < 40) setTimeout(търси, 150);
    };
    setTimeout(търси, 300);
  }

  // ── рисуване ──
  let номер = 0;   // уникално id на избора, ако стаята е нарисувана два пъти
  function направи() {
    const ид = 'plZdPick' + (++номер);
    const с = document.createElement('section');
    с.className = 'pl-zd';
    с.setAttribute('data-pl', 'zdrave');
    с.setAttribute('aria-label', 'Здравният дневник — накратко');
    с.innerHTML =
      '<div class="pl-zd-pills">' +
        '<button type="button" class="pl-zd-pill pl-gel t-blue" data-zd="sos"><i aria-hidden="true">' + ТЕЛЕФОН + '</i><b>Контакти за помощ</b>' + СТРЕЛКА +
          '<span class="pl-zd-sr"> — към картата „При спешност“ с номерата</span></button>' +
        '<button type="button" class="pl-zd-pill pl-gel t-pink" data-zd="new" aria-expanded="false" aria-controls="' + ид + '"><i aria-hidden="true">' + ЛИСТ + '</i><b>Нов здравен запис</b>' + СТРЕЛКА + '</button>' +
      '</div>' +
      '<div class="pl-zd-pick pl-felt" id="' + ид + '" hidden>' +
        '<p class="pl-zd-pick-h">Какво записваш?</p>' +
        '<div class="pl-zd-opts">' + ЗАПИСИ.map(([к, надпис, и, тон]) =>
          '<button type="button" class="pl-zd-opt pl-soft" data-zd-new="' + к + '"><span class="pl-zd-ic t-' + тон + '" aria-hidden="true" style="' + ико(и[0], и[1], и[2]) + '"></span><span>' + надпис + '</span></button>').join('') +
        '</div>' +
      '</div>' +
      '<div class="pl-zd-card pl-felt">' +
        '<div class="pl-zd-head">' +
          '<span class="pl-zd-teddy" aria-hidden="true" style="' + ико('ico-d', 0, 3) + '"></span>' +
          '<div class="pl-zd-ht"><h3 class="pl-zd-title">Здравният дневник</h3><p>Всичко важно на едно място.</p></div>' +
          '<button type="button" class="pl-zd-baby pl-soft" data-zd="baby" hidden><i aria-hidden="true" style="' + ико('ico-d', 1, 0) + '"></i><span class="pl-zd-nm"></span><span class="pl-zd-age"></span></button>' +
        '</div>' +
        '<div class="pl-zd-list">' + РЕДОВЕ.map(([к, име, и, тон]) =>
          '<button type="button" class="pl-zd-row" data-zd-row="' + к + '">' +
            '<span class="pl-zd-ic t-' + тон + '" aria-hidden="true" style="' + ико(и[0], и[1], и[2]) + '"></span>' +
            '<span class="pl-zd-tx"><b>' + име + '</b> <small></small></span>' + СТРЕЛКА +
            (к === 'pregledi' ? '<span class="pl-zd-sr"> — отваря „Профилактичните прегледи“ в „Моето бебе“</span>' : '') +
          '</button>').join('') +
        '</div>' +
        // цифрите на Nunito: „старинните“ цифри на Georgia правят 112 на „ııƨ“
        '<a class="pl-zd-112" href="tel:112"><i aria-hidden="true">' + КРЪСТ + '</i><span>Спешна помощ · <span class="pl-zd-num">112</span></span>' + СТРЕЛКА + '</a>' +
        '<p class="pl-zd-note"><span aria-hidden="true">' + ИНФО + '</span>Записките не заменят преглед.</p>' +
      '</div>';

    // „пиши сега“: отваря СЪЩЕСТВУВАЩАТА карта и слага курсора в НЕЙНОТО поле
    function пишиВ(н) {
      const з = ЗАПИСИ.find(x => x[0] === н); if (!з) return false;
      const к = карта(с.parentElement, з[4]); if (!к) return false;
      // 🪤 фокусът ВЕДНАГА, още в докосването: телефонът вдига клавиатурата само за фокус,
      //   даден в самия жест (не след таймер). Без собствен скрол — скролът го прави докарай(),
      //   мигновено (плавният губи от скрола на браузъра при focus(), записано в expr.js:125-131).
      if (к.classList.contains('folded')) { const сг = к.querySelector('.jr-title .fold-btn'); if (сг) сг.click(); else к.classList.remove('folded'); }
      const поле = к.querySelector(з[5]);
      if (поле) { try { поле.focus({ preventScroll: true }); } catch (x) { поле.focus(); } }
      покажи(к);
      return true;
    }

    с.addEventListener('click', е => {
      const б = е.target.closest('button'); if (!б || !с.contains(б)) return;
      const избор = с.querySelector('.pl-zd-pick'), нов = с.querySelector('[data-zd="new"]');
      const затвори = () => { if (!избор.hidden) избор.hidden = true; нов.setAttribute('aria-expanded', 'false'); };
      const зд = б.getAttribute('data-zd');
      if (зд === 'sos') { затвори(); скочи(с, 'При спешност'); return; }
      if (зд === 'new') { const отв = избор.hidden; избор.hidden = !отв; нов.setAttribute('aria-expanded', отв ? 'true' : 'false'); return; }
      if (зд === 'baby') { if (window.MamaHelper) MamaHelper.open('Моето бебе'); return; }
      const н = б.getAttribute('data-zd-new');
      if (н) { затвори(); пишиВ(н); return; }
      const р = б.getAttribute('data-zd-row');
      if (р === 'pregledi') { къмПрегледите(); return; }
      // празен ред = покана → право в полето на старата карта
      const ред = РЕДОВЕ.find(x => x[0] === р);
      const м = б.querySelector('small');
      if (ред && ред[4] && м && м.classList.contains('is-empty') && пишиВ(ред[4])) return;
      if (р === 'docs') { скочи(с, б.getAttribute('data-card') || 'Здравни бележки'); return; }
      if (р && КАРТА_ЗА[р]) скочи(с, КАРТА_ЗА[р]);
    });
    return с;
  }

  // 🪤 пише САМО при разлика: всяка промяна е мутация, а наблюдателят вика обнови() пак.
  const текст = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  const атр = (е, и, т) => { if (!е) return; if (т == null) { if (е.hasAttribute(и)) е.removeAttribute(и); } else if (е.getAttribute(и) !== т) е.setAttribute(и, т); };
  const клас = (е, к, да) => { if (е && е.classList.contains(к) !== !!да) е.classList.toggle(к, !!да); };
  function обнови(с) {
    const б = бебе();
    текст(с.querySelector('.pl-zd-title'), 'Здравният дневник на ' + (б.име || 'бебето'));
    const ч = с.querySelector('.pl-zd-baby');
    if (б.възраст) {
      if (ч.hidden) ч.hidden = false;
      текст(ч.querySelector('.pl-zd-nm'), б.име);
      текст(ч.querySelector('.pl-zd-age'), б.възраст);
      атр(ч, 'aria-label', (б.име ? б.име + ', ' : '') + б.възраст + ' — отвори „Моето бебе“');
    } else if (!ч.hidden) ч.hidden = true;
    const д = { pregledi: прегледи(б.м), temp: температура(), med: лекарства(), docs: документи() };
    Object.keys(д).forEach(к => {
      const ред = с.querySelector('[data-zd-row="' + к + '"]'); if (!ред) return;
      const м = ред.querySelector('small');
      текст(м, д[к].т);
      клас(м, 'is-empty', д[к].празно);
      if (д[к].карта) атр(ред, 'data-card', д[к].карта);
    });
  }

  // Здравната стая = персонажът ro-green (premium-rooms.js БАНЕРИ, helper.js open → .ro-panel.className)
  function вЗдраве() {
    const п = document.querySelector('#roomOverlay .ro-panel');
    return !!(п && п.classList.contains('ro-green'));
  }
  let пъти = 0;
  function сложи() {
    пъти++;
    const здраве = вЗдраве();
    // стаята понякога се рисува два пъти — работим с всички
    document.querySelectorAll('#roRoom').forEach(стая => {
      let б = стая.querySelector(':scope > .pl-zd');
      if (!здраве) { if (б) б.remove(); return; }
      // само ако е наистина здравната стая: старата карта „При спешност“ е вътре
      if (!б) {
        if (!карта(стая, 'При спешност')) return;
        б = направи();
        const банер = стая.querySelector(':scope > .pl-rhero');
        if (банер) банер.after(б); else стая.insertBefore(б, стая.firstChild);
      }
      // 🪤 НЕ го местим, ако е вече вътре — два скрипта, които и двата искат „точно под банера“,
      //   биха се бутали безкрайно (всяко преместване е мутация). Банерът сам се слага най-отгоре.
      обнови(б);
    });
  }

  // 🪤 #roRoom се сменя при отваряне на стая → гледаме статичния #roomOverlay (поддърво);
  //   setTimeout, не requestAnimationFrame (rAF спира, когато страницата не се рисува).
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; try { сложи(); } catch (e) {} }, 40); }
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    сложи();
    // 🪤 снимките на обрив (bl_rash) са МЕДИЕН ключ: store.js:86 (MEDIA_KEYS) ги държи в IndexedDB и
    //   getItem ги връща от кеша (store.js:269-273) едва след init (store.js:281). Докато init върви, редът би казал „няма“ —
    //   затова, щом складът се зареди, пресмятаме наново.
    try { if (window.BL_STORE && BL_STORE.init && typeof BL_STORE.init.then === 'function') BL_STORE.init.then(отложено, () => {}); } catch (e) {}
  }
  // „днес, 14:05“ става „вчера“ в полунощ; записът от друг таб — при връщане
  setInterval(() => { if (!document.hidden && document.querySelector('#roRoom > .pl-zd')) отложено(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) отложено(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_ZDRAVE = { сложи, пъти: () => пъти };
})();
