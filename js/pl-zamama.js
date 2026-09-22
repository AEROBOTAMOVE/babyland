/* ═══════════════════════════════════════════════════════════════════════════════
   💗 PREMIUM „5 МИНУТИ ЗА МЕН“ · стаята „Жената в мен“ (референция 17 „И ти си важна“), 22.09.2026
   Под заглавието на сцената (.pl-rhero от premium-rooms.js) в #roRoom:
     · голям кремав медальон със златен ръб „5 минути за мен“ + розов гел ▶ „Започни сега“ →
       пуска СЪЩЕСТВУВАЩОТО дишане 4-7-8 (BL_BREATH.open, extras.js:342-396 — 4 кръга, ~76 с);
     · „От какво имаш нужда?“ — 4 плюшени плочки → СЪЩЕСТВУВАЩИ карти в същата стая:
         Почивка     → „Колко искам от теб днес 🌙“ (women5.js:418 — тонът, с който стаята ѝ говори)
         Разговор    → полето на Ния в същата стая (askfield.js — „Пиши ми за ТЕБ“), курсорът вътре
         Движение    → „Микро-приключение 🎈“ (women3.js:306 — 15 минути навън/на крак)
         Вдъхновение → „Картата на деня 🃏“ (women.js:582 — една на ден)
       Няма ли картата (стара версия) — скачаме до кътчето ѝ по СЪЩИЯ бутон-плочка (polish.js:100).
     · „Моят малък план · Днес, <дата>“ — две отметки върху СЪЩЕСТВУВАЩИ ключове (нов ключ няма):
         Чаша вода    → bl_water {d, n} по правилата на „Вода днес“ (rooms4.js:84-113): неотметнато =
                        докосната празна чаша (n = 1); отметнато = докосната ПОСЛЕДНАТА пълна (n − 1).
                        Преди записа — BL_DAYHIST.приберете() (sleephist.js:149-157, 208): вчерашните
                        чаши отиват в bl_water_hist, преди да ги нулираме за днес.
         Малко въздух → bl_wins[днес] съдържа '🌳 Излязох навън' (rooms.js:450-451, превключване 484-497)
                        — същата победа от „Днес успях да…“ в „Дневник на мама“, същият низ.
       „Днес, <дата> ›“ отваря целия списък „Днес успях да…“ в „Дневник на мама“.
     · розов гел „Избери своя момент ›“ → „5-те минути 💋“ (women2.js:628 — „Или избери сама:“).
   Разгъването на сгъната карта става с НЕЙНИЯ бутон ▾ (polish.js decorate), т.е. паметта bl_folds я
   пише старият код. Нулата без запис е ПОКАНА, не „0“. Материалите: .pl-gel / .pl-felt / .pl-soft.
   ПЪТ НАЗАД: махни <link href="css/pl-zamama.css"> и <script src="js/pl-zamama.js"> от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_ZAMAMA) return;

  // Чете като load() в rooms4.js:53 / sos.js:16 — повреден запис или сменен тип = стойността по подразбиране.
  const чети = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  // Записва като save() в rooms4.js:56 — при пълна памет общото известие и false (нищо не се рисува като записано).
  const запиши = (к, v) => { try { localStorage.setItem(к, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const двуц = n => String(n).padStart(2, '0');
  // същият ключ за ден като rooms4.js:57-58 и rooms.js:98-99 (местна дата, не UTC)
  const днес = () => { const д = new Date(); return д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate()); };
  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const датаДнес = () => { const д = new Date(); return 'Днес, ' + д.getDate() + ' ' + МЕСЕЦИ[д.getMonth()]; };
  const чаши = n => n + ' ' + (n === 1 ? 'чаша' : 'чаши');
  const fx = () => window.BL_FX || { cheer() {}, buzz() {} };

  // ── 💧 ВОДАТА: bl_water = { d: 'YYYY-MM-DD', n } (rooms4.js:84). Днешното е само ако d === днес
  //   (както rooms6.js:396 и profile.js:380) — вчерашният запис е 0 за днес, не „вчерашните 5“.
  function вода() {
    const w = чети('bl_water', null);
    return w && w.d === днес() ? Math.max(0, Math.floor(+w.n || 0)) : 0;
  }
  function пийВода() {
    try { if (window.BL_DAYHIST && BL_DAYHIST.приберете) BL_DAYHIST.приберете(); } catch (e) {}
    let д = чети('bl_water', { d: днес(), n: 0 });                  // пресен прочит ПРЕДИ записа (rooms4.js:103-106)
    if (!д || д.d !== днес()) д = { d: днес(), n: 0 };
    const n = Math.max(0, Math.floor(+д.n || 0));
    д.n = n > 0 ? n - 1 : 1;                                          // rooms4.js:108: `i < n ? i : i + 1`
    if (!запиши('bl_water', д)) return null;
    return д.n;
  }
  // ── 🌳 ВЪЗДУХЪТ: bl_wins = { 'YYYY-MM-DD': [етикети] } (rooms.js:456, 486-492)
  const НАВЪН = '🌳 Излязох навън';                                     // rooms.js:451 — низът е ключът на победата
  function навън() {
    const w = чети('bl_wins', {});
    const д = w && w[днес()];
    return Array.isArray(д) && д.indexOf(НАВЪН) >= 0;
  }
  function превключиНавън() {
    const t = днес();
    const w = чети('bl_wins', {}) || {};                               // пресен прочит ПРЕДИ записа (rooms.js:486)
    const днесни = new Set(Array.isArray(w[t]) ? w[t] : []);
    const беше = днесни.has(НАВЪН);
    if (беше) днесни.delete(НАВЪН); else днесни.add(НАВЪН);
    w[t] = [...днесни];
    if (!запиши('bl_wins', w)) return null;
    return !беше;
  }

  // ── иконки (плюшените спрайтове 4×4): [лист, ред, колона] ──
  const ико = (лист, р, к) => 'background-image:url(img/art/' + лист + '.webp);background-position:' + (к * 100 / 3) + '% ' + (р * 100 / 3) + '%';
  const НУЖДИ = [
    // [ключ, надпис, иконка, тон, картата (част от заглавието), кътчето при липса, за четеца]
    ['pochivka', 'Почивка', ['ico-a', 1, 1], 'lav', 'Колко искам от теб днес', 'Ритуалите', 'към „Колко искам от теб днес“ — ти казваш колко'],
    ['razgovor', 'Разговор', ['ico-b', 2, 3], 'pink', null, 'Моите хора', 'пиши на Ния — за теб, не за бебето'],
    ['dvizhenie', 'Движение', ['ico-e', 0, 0], 'rose', 'Микро-приключение', 'Приключенията', 'към „Микро-приключение“ — 15 минути само за теб'],
    ['vdahnovenie', 'Вдъхновение', ['ico-e', 0, 1], 'butter', 'Картата на деня', 'Звездите и числата', 'към „Картата на деня“ — една на ден'],
  ];
  const ПЛАН = [
    ['voda', 'Чаша вода', ['ico-e', 3, 3], 'sky'],
    ['vazduh', 'Малко въздух', ['ico-e', 3, 2], 'mint'],
  ];
  const ПЛЕЙ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.2c0-1 1.1-1.6 1.9-1.1l9.1 6.3c.8.5.8 1.7 0 2.2l-9.1 6.3c-.8.5-1.9-.1-1.9-1.1z"/></svg>';
  const СЪРЦЕ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.4-4.5-9.1-8.8C1.6 8.2 3.6 4.6 7.1 4.6c2.1 0 3.6 1.2 4.9 3 1.3-1.8 2.8-3 4.9-3 3.5 0 5.5 3.6 4.2 6.9-1.7 4.3-9.1 8.8-9.1 8.8z"/></svg>';
  const СТРЕЛКА = '<svg class="pl-zm-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5 15.5 12 9 18.5"/></svg>';
  const ОТМЕТКА = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 7.8"/></svg>';
  // златни завъртулки + гел сърчице над медальона (като на реф. 17)
  //   🪤 id-тата на градиентите са с номер: стаята може да е нарисувана два пъти (повтарящи се id)
  const ОРНАМЕНТ = н => '<svg viewBox="0 0 120 40" aria-hidden="true">' +
    '<defs><linearGradient id="plZmGold' + н + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9f"/><stop offset=".5" stop-color="#c79b4f"/><stop offset="1" stop-color="#a47b36"/></linearGradient>' +
    '<radialGradient id="plZmHeart' + н + '" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffc3d8"/><stop offset=".55" stop-color="#ec7aa6"/><stop offset="1" stop-color="#c8457a"/></radialGradient></defs>' +
    '<path d="M47 24c-6 0-9-4-15-4-5 0-8 3-8 6 0 2 2 4 4 4 3 0 4-3 2-4M73 24c6 0 9-4 15-4 5 0 8 3 8 6 0 2-2 4-4 4-3 0-4-3-2-4" fill="none" stroke="url(#plZmGold' + н + ')" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M60 33s-11-6.6-13.4-12.4C44.8 16 47.6 11 52.4 11c3.1 0 5.4 1.8 7.6 4.4 2.2-2.6 4.5-4.4 7.6-4.4 4.8 0 7.6 5 5.8 9.6C71 26.4 60 33 60 33z" fill="url(#plZmHeart' + н + ')" stroke="#fff" stroke-width="1.6"/>' +
    '<ellipse cx="53.5" cy="16.5" rx="3.2" ry="2" fill="#fff" opacity=".75" transform="rotate(-30 53.5 16.5)"/></svg>';
  // клонка с листа и розови цветчета (лявата; дясната е огледална в CSS)
  const КЛОНКА = '<svg viewBox="0 0 40 120" aria-hidden="true">' +
    '<path d="M31 116C17 96 12 70 16 44 18 30 23 16 30 4" fill="none" stroke="#7d9c78" stroke-width="2" stroke-linecap="round"/>' +
    '<g fill="#8fb088" stroke="#6d8f69" stroke-width=".8">' +
      '<path d="M17 96c-8-1-13-7-13-13 7 0 12 5 13 13z"/><path d="M20 98c7-3 13-2 16 3-6 3-12 2-16-3z"/>' +
      '<path d="M14 72c-8-2-12-9-11-15 7 1 11 7 11 15z"/><path d="M16 74c6-4 13-4 16 0-5 4-12 5-16 0z"/>' +
      '<path d="M15 50c-7-3-10-10-8-16 6 2 9 9 8 16z"/><path d="M17 51c6-5 12-6 16-2-5 5-11 6-16 2z"/>' +
      '<path d="M22 28c-6-4-8-11-5-16 6 3 7 10 5 16z"/><path d="M24 29c5-5 11-7 15-4-4 5-10 7-15 4z"/>' +
    '</g>' +
    '<g><circle cx="9" cy="62" r="4.6" fill="#f7c3d3"/><circle cx="9" cy="62" r="1.7" fill="#e58aa9"/>' +
      '<circle cx="30" cy="84" r="4.2" fill="#f7c3d3"/><circle cx="30" cy="84" r="1.5" fill="#e58aa9"/>' +
      '<circle cx="12" cy="36" r="3.6" fill="#f9d2de"/><circle cx="12" cy="36" r="1.3" fill="#e58aa9"/>' +
      '<circle cx="31" cy="10" r="3.2" fill="#f9d2de"/><circle cx="31" cy="10" r="1.2" fill="#e58aa9"/></g></svg>';

  // ── намиране и показване на СЪЩЕСТВУВАЩА карта (преписано от js/pl-zdrave.js — доказаният начин) ──
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
  // 🪤 картите в стаята са content-visibility:auto (mega.css:336) — истинската им височина идва чак
  //   щом влязат в екрана, та един скок спира далече от целта. Затова скок + донагласяне, докато
  //   картата застане (±16 px) две проверки подред; пипне ли мама екрана — спираме (pl-zdrave.js:167-200).
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
      else if (!цели()) добри++;                                       // опряна в дъното — по-нагоре не може
      else добри = 0;
      if (добри < 2 && ++опит < 15) { setTimeout(провери, 200); return; }
      махни();
      if (после) после();
    })();
  }
  const мигни = к => { к.classList.remove('toc-flash'); void к.offsetWidth; к.classList.add('toc-flash'); };   // polish.js:131 / mega.css:611
  function разгъни(к) {
    if (!к.classList.contains('folded')) return;
    const б = к.querySelector('.jr-title .fold-btn');                  // НЕЙНИЯТ бутон ▾ — пише и bl_folds
    if (б) б.click(); else к.classList.remove('folded');
  }
  function покажи(к) { разгъни(к); докарай(к, () => мигни(к)); }
  // кътчето: истинската плочка в .sec-nav (polish.js:100-104 — скролва до заглавието на кътчето)
  function кътче(стая, име) {
    const ч = [...стая.querySelectorAll('.sec-nav .sec-chip')].find(б => ((б.getAttribute('aria-label') || '') + ' ' + б.textContent).includes(име));
    if (ч) { ч.click(); return true; }
    return false;
  }
  function къмКарта(блок, дума, резерва) {
    const стая = блок.parentElement;
    const к = дума && карта(стая, дума);
    if (к) { покажи(к); return true; }
    return резерва ? кътче(стая, резерва) : false;
  }
  // „Разговор“: полето на Ния в СЪЩАТА стая. Фокусът — още в докосването (телефонът вдига
  //   клавиатурата само за фокус в самия жест), скролът — след него (pl-zdrave.js:268-275).
  function къмНия(блок) {
    const стая = блок.parentElement;
    const к = стая && стая.querySelector(':scope > .ask-card');
    const поле = к && к.querySelector('.ask-inp');
    if (к && поле) {
      try { поле.focus({ preventScroll: true }); } catch (e) { поле.focus(); }
      докарай(к, () => мигни(к));
      return true;
    }
    const таб = document.querySelector('#roTabs .st-seg[data-tab="chat"]');   // целият разговор с Ния
    if (таб) { таб.click(); return true; }
    return false;
  }
  // „Днес, <дата> ›“: целият списък „Днес успях да…“ в „Дневник на мама“ (rooms.js:444-446).
  //   Скачаме, щом стаята е УЛЕГНАЛА (без скелет .ro-skel и поне 900 мс) — същото като pl-zdrave.js:220-231.
  function къмПобедите() {
    if (!window.MamaHelper || !MamaHelper.open) return;
    MamaHelper.open('Дневник на мама');
    const от = Date.now();
    let опит = 0;
    const търси = () => {
      const стая = document.getElementById('roRoom');
      const к = карта(стая, 'Днес успях да');
      const улегнала = Date.now() - от >= 900 && стая && !стая.querySelector('.ro-skel');
      if (к && улегнала && к.offsetParent !== null) { покажи(к); return; }
      if (++опит < 40) setTimeout(търси, 150);
    };
    setTimeout(търси, 300);
  }

  // ── рисуване ──
  let номер = 0;
  function направи() {
    const н = ++номер;
    const с = document.createElement('section');
    с.className = 'pl-zm';
    с.setAttribute('data-pl', 'zamama');
    с.setAttribute('aria-label', '5 минути за мен');
    с.innerHTML =
      '<div class="pl-zm-medal">' +
        '<div class="pl-zm-disc pl-felt">' +
          '<span class="pl-zm-orn">' + ОРНАМЕНТ(н) + '</span>' +
          '<span class="pl-zm-br pl-zm-br-l">' + КЛОНКА + '</span><span class="pl-zm-br pl-zm-br-r">' + КЛОНКА + '</span>' +
          '<span class="pl-zm-lotus pl-art" aria-hidden="true" style="' + ико('ico-e', 0, 2) + '"></span>' +
          '<h3 class="pl-zm-t"><span class="pl-zm-5">5</span> минути<br>за мен</h3>' +
          '<button type="button" class="pl-zm-play" data-zm="breath">' +
            '<span class="pl-zm-gel pl-gel" aria-hidden="true">' + ПЛЕЙ + '</span>' +
            '<span class="pl-zm-pl">Започни сега</span>' +
            '<span class="pl-zm-sub">дишане 4-7-8 · 4 кръга</span>' +
          '</button>' +
          '<span class="pl-zm-line" aria-hidden="true"></span>' +
        '</div>' +
      '</div>' +
      '<div class="pl-zm-card pl-felt">' +
        '<h3 class="pl-zm-h"><span class="pl-zm-rule" aria-hidden="true"></span><span>От какво имаш нужда?</span><span class="pl-zm-rule" aria-hidden="true"></span></h3>' +
        '<div class="pl-zm-needs">' + НУЖДИ.map(([к, надпис, и, тон, , , четец]) =>
          '<button type="button" class="pl-zm-need" data-zm-need="' + к + '">' +
            '<span class="pl-zm-nic t-' + тон + '" aria-hidden="true"><i class="pl-art" style="' + ико(и[0], и[1], и[2]) + '"></i></span>' +
            '<span class="pl-zm-nl pl-soft">' + надпис + '</span>' +
            '<span class="pl-zm-sr"> — ' + четец + '</span>' +
          '</button>').join('') +
        '</div>' +
        '<div class="pl-zm-plan">' +
          '<button type="button" class="pl-zm-ph" data-zm="plan">' +
            '<span class="pl-zm-clip pl-art" aria-hidden="true" style="' + ико('ico-b', 3, 1) + '"></span>' +
            '<span class="pl-zm-pt"><b>Моят малък план</b><small class="pl-zm-date"></small></span>' + СТРЕЛКА +
            '<span class="pl-zm-sr"> — целият списък „Днес успях да…“ в „Дневник на мама“</span>' +
          '</button>' +
          '<div class="pl-zm-rows">' + ПЛАН.map(([к, име, и, тон]) =>
            '<button type="button" class="pl-zm-row" role="checkbox" aria-checked="false" data-zm-plan="' + к + '">' +
              '<span class="pl-zm-box" aria-hidden="true">' + ОТМЕТКА + '</span>' +
              '<span class="pl-zm-ric pl-art t-' + тон + '" aria-hidden="true" style="' + ико(и[0], и[1], и[2]) + '"></span>' +
              '<span class="pl-zm-rt"><b>' + име + '</b><small></small></span>' +
              '<span class="pl-zm-heart" aria-hidden="true">' + СЪРЦЕ + '</span>' +
            '</button>').join('') +
          '</div>' +
        '</div>' +
        '<button type="button" class="pl-zm-go pl-gel" data-zm="moment"><i aria-hidden="true">' + СЪРЦЕ + '</i><span>Избери своя момент</span>' + СТРЕЛКА +
          '<span class="pl-zm-sr"> — към „5-те минути“: реални ритуали, избираш сама</span></button>' +
      '</div>';

    с.addEventListener('click', е => {
      const б = е.target.closest('button'); if (!б || !с.contains(б)) return;
      const зм = б.getAttribute('data-zm');
      if (зм === 'breath') {
        if (window.BL_BREATH && typeof BL_BREATH.open === 'function') BL_BREATH.open();
        else къмКарта(с, '5-те минути', 'Ритуалите');
        return;
      }
      if (зм === 'moment') { къмКарта(с, '5-те минути', 'Ритуалите'); return; }
      if (зм === 'plan') { къмПобедите(); return; }
      const н = б.getAttribute('data-zm-need');
      if (н) {
        const ред = НУЖДИ.find(x => x[0] === н);
        if (н === 'razgovor') { if (!къмНия(с)) кътче(с.parentElement, ред[5]); return; }
        if (ред) къмКарта(с, ред[4], ред[5]);
        return;
      }
      const п = б.getAttribute('data-zm-plan');
      if (п === 'voda') {
        const беше = вода();
        const n = пийВода();
        if (n == null) return;                                           // паднал запис — отметката не мърда
        обнови(с);
        if (беше === 0 && n === 1) fx().cheer('Първата за днес 💧');   // празникът е за започнатото (rooms4.js:115-116)
        else fx().buzz(6);
        return;
      }
      if (п === 'vazduh') {
        const да = превключиНавън();
        if (да == null) return;
        обнови(с);
        if (да) fx().cheer('Малко въздух — записано и в „Днес успях да…“ 🌳'); else fx().buzz(6);
      }
    });
    return с;
  }

  // 🪤 пише САМО при разлика: всяка промяна е мутация, а наблюдателят вика обнови() пак.
  const текст = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  const атр = (е, и, т) => { if (!е) return; if (т == null) { if (е.hasAttribute(и)) е.removeAttribute(и); } else if (е.getAttribute(и) !== т) е.setAttribute(и, т); };
  const клас = (е, к, да) => { if (е && е.classList.contains(к) !== !!да) е.classList.toggle(к, !!да); };
  function обнови(с) {
    текст(с.querySelector('.pl-zm-date'), датаДнес());
    const n = вода();
    const в = с.querySelector('[data-zm-plan="voda"]');
    if (в) {
      атр(в, 'aria-checked', n > 0 ? 'true' : 'false');
      const м = в.querySelector('small');
      текст(м, n > 0 ? 'днес: ' + чаши(n) : 'отметни, щом изпиеш една');
      клас(м, 'is-empty', n === 0);
      атр(в, 'aria-label', 'Чаша вода — ' + (n > 0 ? 'днес ' + чаши(n) + '; докосването маха последната (като във „Вода днес“)' : 'още няма за днес; докосни, щом изпиеш една'));
    }
    const д = навън();
    const а = с.querySelector('[data-zm-plan="vazduh"]');
    if (а) {
      атр(а, 'aria-checked', д ? 'true' : 'false');
      const м = а.querySelector('small');
      текст(м, д ? 'излязох навън ✔' : 'дори до площадката');
      клас(м, 'is-empty', !д);
      атр(а, 'aria-label', 'Малко въздух — ' + (д ? 'отметнато: „Излязох навън“ в „Днес успях да…“' : 'отметни, щом излезеш — записва се и в „Днес успях да…“'));
    }
  }

  // „Жената в мен“ = персонажът ro-rose (helper.js:179 → .ro-panel.className; premium-rooms.js:21)
  function вСтаята() {
    const п = document.querySelector('#roomOverlay .ro-panel');
    return !!(п && п.classList.contains('ro-rose'));
  }
  let пъти = 0;
  function сложи() {
    пъти++;
    const тук = вСтаята();
    // стаята понякога се рисува два пъти — работим с всички
    document.querySelectorAll('#roRoom').forEach(стая => {
      let б = стая.querySelector(':scope > .pl-zm');
      if (!тук) { if (б) б.remove(); return; }
      if (!б) {
        // само в истинската стая: картата „5-те минути“ (women2.js:629) е вътре
        if (!карта(стая, '5-те минути')) return;
        б = направи();
        const банер = стая.querySelector(':scope > .pl-rhero');
        if (банер) банер.after(б); else стая.insertBefore(б, стая.firstChild);
      }
      // 🪤 НЕ го местим, ако вече е вътре — банерът сам се слага най-отгоре (premium-rooms.js:38-47);
      //   два скрипта, които и двата искат „точно под банера“, биха се бутали безкрайно.
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
  }
  // датата и „днес“ се сменят в полунощ; запис от друг таб/карта — при връщане и при „storage“
  setInterval(() => { if (!document.hidden && document.querySelector('#roRoom > .pl-zm')) отложено(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) отложено(); });
  window.addEventListener('storage', е => { if (!е.key || е.key === 'bl_water' || е.key === 'bl_wins') отложено(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_ZAMAMA = { сложи, пъти: () => пъти };
})();
