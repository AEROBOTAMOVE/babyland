/* ═══════════════════════════════════════════════════════════════════════════════
   🧰 „МАЛКИ ПОМОЩНИЦИ“ · стаята „Инструменти“ по референция 14 на собственика (22.09.2026)
   Под банера на стаята (premium-rooms.js) идват три неща:
     1) голямо бяло хапче „🔍 Намери инструмент“ върху корниза на шкафа — НЕ е второ търсене:
        всяка буква се препраща в СЪЩЕСТВУВАЩОТО поле .sec-find (polish.js:78–91) със събитие
        input, а то само си филтрира картите. Старото поле се крие визуално (css/pl-instrumenti.css);
     2) дървен шкаф с 6 пастелни арки (Таймер · Календар · Списъци · Мерки · Имена · Чанта) —
        всяка скача до РЕАЛНАТА карта и я разгъва със СЪЩИЯ бутон ▾ (polish.js decorate →
        превключи() пише bl_folds). Няма ли такава карта — арката не се показва (без мъртви
        бутони); празното място заема следващият истински помощник (Лампа, Подаръци…).
        ТАЙМЕР в тази стая няма (мерено 22.09: 33 карти, нито една с таймер) — истинските
        таймери живеят другаде: „Кърмене-таймер“ (Моето бебе, rooms3.js:844 + :1886) и
        „Брояч на контракции“ (Бременност, rooms2.js:1113). Арката отваря стаята по стария път
        (MamaHelper.open, както pl-zdrave.js:215–231) и чака картата, после скача до нея;
     3) „Последно използвани“ — от bl_carduse (polish.js:257–265: {„Стая|заглавие“: брой},
        броят расте веднъж на отваряне при докосване В картата). Час там НЯМА — затова не
        пишем „вчера, 18:24“ като в картинката, а честното „ползвана N пъти“.
   Нищо не записва в localStorage. Не пипа чужди файлове.
   ПЪТ НАЗАД: махни <script src="js/pl-instrumenti.js"> и <link href="css/pl-instrumenti.css">
   от index.html — стаята се връща точно каквато беше (старото поле .sec-find пак се вижда,
   защото правилото, което го крие, е вързано за присъствието на .pl-in до него).
   Предишната версия (без дървото и без таймера): scratchpad/ag2_instrumenti_predi.js.bak
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_INSTRUMENTI) return;

  const СТАЯ = 'Инструменти';
  const броячи = { пресмятания: 0, записи: 0, скокове: 0, далечни: 0 };

  // спрайт 4×4 (img/art/ico-*.webp, 512px, бял фон): [лист, ред, колона]
  // 🪤 url() е в style на елемента → разрешава се спрямо СТРАНИЦАТА (img/art/…), не спрямо css/.
  const сп = (к) => 'background-image:url(img/art/' + к[0] + '.webp);background-position:' +
    (к[2] * 100 / 3) + '% ' + (к[1] * 100 / 3) + '%';

  // ── кой е профилът: по СЪЩОТО правило като началото (premium-home.js:37–41) ──
  //   bl_baby.birth → бебе; иначе bl_preg (не null) → бременна; иначе → празно.
  function чети(к, д) { try { const в = JSON.parse(localStorage.getItem(к)); return в == null ? д : в; } catch (e) { return д; } }
  function режим() {
    const б = чети('bl_baby', {}) || {};
    if (б.birth) return 'бебе';
    if (чети('bl_preg', null)) return 'бременна';
    return 'празно';
  }
  // Таймерът — в чужда стая, и то в ТАЗИ, където картата наистина ще се нарисува:
  //   · „Брояч на контракции“ се рисува само при жива дата на бременността и без пауза
  //     (rooms2.js:1198 `!наПауза() && датата20()` = BL_EXPECT.lmp(), expect.js:30–34) и без родено бебе;
  //   · „Кърмене-таймер“ се рисува винаги в „Моето бебе“ (rooms3.js:1886).
  //   Стаята трябва да я има (window.ROOM_FEATURES, helper.js:5406). Втората цел е само предпазна мрежа.
  const КОНТРАКЦИИ = { стая: 'Бременност', ре: /^брояч на контракции/i, име: 'броячът на контракции' };
  const КЪРМЕНЕ = { стая: 'Моето бебе', ре: /^кърмене-таймер/i, име: 'кърмене-таймерът' };
  function живаБременност() {
    try { return window.BL_EXPECT && BL_EXPECT.lmp ? !!BL_EXPECT.lmp() : !!String(чети('bl_lmp', '') || '').replace(/"/g, ''); } catch (e) { return false; }
  }
  function таймери() {
    const ф = window.ROOM_FEATURES || {};
    const списък = режим() !== 'бебе' && живаБременност() ? [КОНТРАКЦИИ, КЪРМЕНЕ] : [КЪРМЕНЕ];
    return списък.filter(ц => typeof ф[ц.стая] === 'function');
  }

  // Арките по реда на референцията. Първите 6, които водят до ИСТИНСКА карта, влизат в шкафа.
  //   ик — главната плюшена фигура, ик2 — съседката ѝ (в референцията всяко отделение има 2–3 предмета:
  //   пясъчен часовник до будилника, звезда до календара, мече до табелките…).
  //   Имената: ico-e[1,1] — две табелки с име на халка, буквално като в картинката.
  //   Мерките водят към „Размер на дрешки“ → до метъра стои бодито ico-b[3,3].
  const АРКИ = [
    { к: 'Таймер',   далеч: true,                                                  ик: ['ico-b', 3, 0], ик2: ['ico-e', 3, 0] },
    { к: 'Календар', ре: /какво предстои|календар/i,                              ик: ['ico-a', 0, 1], ик2: ['ico-b', 2, 1] },
    { к: 'Списъци',  ре: /моите списъци|чеклист/i,                                ик: ['ico-b', 3, 1], ик2: ['ico-b', 0, 3] },
    { к: 'Мерки',    ре: /размер на дрешки|размерите|мерки|конвертор/i,           ик: ['ico-b', 3, 2], ик2: ['ico-b', 3, 3] },
    { к: 'Имена',    ре: /имена/i,                                                ик: ['ico-e', 1, 1], ик2: ['ico-d', 0, 3] },
    { к: 'Чанта',    ре: /чанта за болницата|чанта за родилното|чанта за разходка|чанта/i, ик: ['ico-a', 0, 2], ик2: ['ico-a', 1, 0] },
    // резервни — само ако някоя от горните липсва
    { к: 'Лампа',    ре: /нощна лампа/i,                                          ик: ['ico-c', 0, 1], ик2: ['ico-a', 1, 1] },
    { к: 'Подаръци', ре: /списък за подаръци/i,                                   ик: ['ico-c', 3, 3], ик2: ['ico-c', 1, 3] },
    { к: 'Документи', ре: /^документите/i,                                        ик: ['ico-c', 0, 0], ик2: ['ico-b', 0, 3] },
  ];
  // иконките за редовете в „Последно използвани“ (по началото на заглавието на картата)
  const ИКОНИ_РЕД = [
    [/какво предстои/i, ['ico-a', 0, 1]], [/чанта/i, ['ico-a', 0, 2]], [/моите списъци/i, ['ico-b', 3, 1]],
    [/размер|конвертор/i, ['ico-b', 3, 2]], [/имена/i, ['ico-e', 1, 1]], [/нощна лампа/i, ['ico-c', 0, 1]],
    [/подаръци/i, ['ico-c', 3, 3]], [/гардероб/i, ['ico-b', 3, 3]], [/бележник/i, ['ico-a', 2, 3]],
    [/документ|речник|майчинство/i, ['ico-c', 0, 0]], [/картичка за бабата|qr/i, ['ico-a', 0, 3]],
    [/първи месец/i, ['ico-d', 3, 3]], [/обезопасяване/i, ['ico-a', 3, 3]], [/кола|пътуван/i, ['ico-d', 2, 1]],
    [/бюджет|касичка|разходите/i, ['ico-a', 1, 3]], [/втора употреба/i, ['ico-e', 1, 2]],
    [/настройки|пази|резервно/i, ['ico-c', 0, 2]], [/снимки/i, ['ico-b', 1, 1]], [/таймер|брояч/i, ['ico-b', 3, 0]],
  ];

  function esc(т) { return String(т).replace(/[&<>"]/g, з => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[з])); }
  // същите правила като load() в polish.js:9 — обект или нищо
  function броеве() {
    const в = чети('bl_carduse', {});
    return в && typeof в === 'object' && !Array.isArray(в) ? в : {};
  }
  // името на картата: aria-label от polish.js decorate (текстовите възли на заглавието), без емоджитата
  function име(карта) {
    const т = карта.getAttribute('aria-label') || ((карта.dataset.blkey || '').split('|')[1] || '');
    return т.replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim();
  }
  function картите(корен) { return Array.from(корен.querySelectorAll(':scope > section.jr-card[data-blkey]')); }
  function еИнструменти(корен) { return !!корен.querySelector(':scope > section.jr-card[data-blkey^="' + СТАЯ + '|"]'); }

  // ── модел: кои арки, кои редове ──
  function модел(корен) {
    const карти = картите(корен);
    const арки = [];
    const тм = таймери();
    for (const а of АРКИ) {
      if (арки.length >= 6) break;
      if (а.далеч) {
        if (тм.length) арки.push({ к: а.к, ик: а.ик, ик2: а.ик2, ключ: 'далеч:' + тм.map(ц => ц.стая).join('>'), цел: тм[0].име + ' в стая „' + тм[0].стая + '“' });
        continue;
      }
      const к = карти.find(к2 => а.ре.test(име(к2)));
      if (к && !арки.some(х => х.ключ === к.dataset.blkey)) арки.push({ к: а.к, ик: а.ик, ик2: а.ик2, ключ: к.dataset.blkey, цел: име(к) });
    }
    const у = броеве();
    const редове = карти
      .map((к, и) => ({ к, и, n: +у[к.dataset.blkey] || 0 }))
      .filter(х => х.n > 0 && х.к.dataset.blkey.indexOf(СТАЯ + '|') === 0)
      .sort((а, б) => б.n - а.n || а.и - б.и)
      .slice(0, 2)
      .map(({ к, n }) => {
        const н = име(к);
        // чеклист → „8 от 12“ от самите редове на картата (rooms2.js:2299 .jr-win[aria-pressed])
        const отм = к.querySelectorAll('.jr-win[aria-pressed]');
        const готови = Array.from(отм).filter(е => е.getAttribute('aria-pressed') === 'true').length;
        const ик = (ИКОНИ_РЕД.find(([ре]) => ре.test(н)) || [])[1] || null;
        const медал = (к.querySelector('.jr-medal') || {}).textContent || '🧰';
        return { ключ: к.dataset.blkey, н, n, чип: отм.length >= 2 ? готови + ' от ' + отм.length : '', ик, медал };
      });
    return { арки, редове };
  }

  // ── рисуване ──
  const ЛУПА = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';
  const ЧАС = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';

  function нов(корен) {
    const б = document.createElement('section');
    б.className = 'pl-in';
    б.setAttribute('data-pl', 'instrumenti');
    б.setAttribute('aria-label', 'Малки помощници');
    б.innerHTML =
      '<label class="pl-in-find">' + ЛУПА +
        '<input type="search" enterkeyhint="search" autocomplete="off" placeholder="Намери инструмент" aria-label="Намери инструмент в стаята">' +
      '</label>' +
      '<p class="pl-in-none" role="status" aria-live="polite"></p>' +
      '<div class="pl-in-shelf"></div>' +
      '<div class="pl-in-last pl-felt"><h3 class="pl-in-lh"><span class="pl-in-clock">' + ЧАС + '</span><span class="pl-in-lt">Последно използвани</span></h3><div class="pl-in-rows"></div></div>';
    const поле = б.querySelector('input');
    // препращане към СЪЩЕСТВУВАЩОТО търсене (polish.js:80 слуша input на .sec-find)
    поле.addEventListener('input', () => търси(корен, б, поле.value));
    поле.addEventListener('keydown', е => {
      if (е.key !== 'Enter') return;
      е.preventDefault();
      поле.blur();
      const първа = картите(корен).find(к => к.style.display !== 'none' && !к.classList.contains('ask-card'));
      if (първа) докарай(първа);
    });
    б.addEventListener('click', е => {
      const бт = е.target.closest('[data-cel]');
      if (!бт || !б.contains(бт)) return;
      const цел = бт.getAttribute('data-cel');
      if (цел.indexOf('далеч:') === 0) { далеч(таймери()); return; }
      скочи(корен, б, цел, бт.getAttribute('data-k'));
    });
    return б;
  }

  function търси(корен, б, стойност) {
    const полета = корен.querySelectorAll('.sec-find');
    полета.forEach(п => {
      if (п.value === стойност) return;
      п.value = стойност;
      п.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const има = стойност.trim() !== '';
    б.classList.toggle('pl-in-q', има);
    // „нищо“ — честно, вместо празен екран (polish.js скрива картите с style.display)
    // 🪤 22.09 (мерено): при „нищо“ polish.js скрива и картата с полето за въпрос (и тя е .jr-card) —
    //   затова пращаме към раздела „Дара“ горе, не към „полето по-долу“, което вече го няма.
    const видими = картите(корен).filter(к => к.style.display !== 'none').length;
    const н = б.querySelector('.pl-in-none');
    const т = има && !видими ? 'Нищо не намерих за „' + стойност.trim() + '“ — опитай с друга дума или попитай Дара в раздела горе.' : '';
    if (н.textContent !== т) н.textContent = т;
  }

  // покажи ИСТИНСКАТА карта: разгъни я с НЕЙНИЯ ▾, докарай я, мигни, фокус в нея
  function покажи(карта) {
    // сгъната ли е — СЪЩИЯТ бутон ▾ (polish.js decorate: превключи() → bl_folds, aria-expanded)
    if (карта.classList.contains('folded')) {
      const стрелка = карта.querySelector('.jr-title .fold-btn') || карта.querySelector('.jr-title');
      if (стрелка) стрелка.click();
    }
    // скок + същото мигане като съдържанието на стаята (polish.js mountToc → .toc-flash, mega.css:611)
    докарай(карта, () => { карта.classList.remove('toc-flash'); void карта.offsetWidth; карта.classList.add('toc-flash'); });
    // фокусът отива в картата — клавиатурата и четецът продължават оттам, не от върха
    const фокус = карта.querySelector('.jr-title .fold-btn');
    if (фокус) { try { фокус.focus({ preventScroll: true }); } catch (e) {} }
  }

  function скочи(корен, б, ключ, вид) {
    броячи.скокове++;
    // търсене ли има — чистим го, иначе картата може да е скрита от филтъра на polish.js
    const поле = б.querySelector('.pl-in-find input');
    if (поле && поле.value) { поле.value = ''; търси(корен, б, ''); }
    let карта = картите(корен).find(к => к.dataset.blkey === ключ);
    if (!карта && вид) { const а = АРКИ.find(х => х.к === вид); if (а && а.ре) карта = картите(корен).find(к => а.ре.test(име(к))); }
    if (!карта) return;
    покажи(карта);
  }

  // ⏱️ Таймерът е в друга стая: отваряме я по СТАРИЯ път (MamaHelper.open) и чакаме картата.
  //   Скачаме едва когато стаята е УЛЕГНАЛА — скелетът (.ro-skel, helper.js:5409) го няма и са минали
  //   поне 900 мс (броячите тръгват на 660 мс, helper.js:5412) — същото правило като pl-zdrave.js:215–231.
  //   Картата не идва за 3 с (не би трябвало — таймери() избира по същото правило като rooms2.js) → следващият.
  let далечен = 0;
  function далеч(цели) {
    if (!цели.length || !window.MamaHelper || !MamaHelper.open) return;
    броячи.далечни++;
    const мой = ++далечен;
    const цел = цели[0];
    try { MamaHelper.open(цел.стая); } catch (e) { return; }
    const от = Date.now();
    let опит = 0, табът = false;
    (function търси() {
      if (мой !== далечен) return;
      const ов = document.getElementById('roomOverlay');
      if (!ов || ов.hidden) return;                                   // мама затвори стаята
      const стая = document.getElementById('roRoom');
      const к = стая && Array.from(стая.querySelectorAll('section.jr-card[data-blkey]'))
        .find(х => х.dataset.blkey.indexOf(цел.стая + '|') === 0 && цел.ре.test(име(х)));
      const улегнала = Date.now() - от >= 900 && стая && !стая.querySelector('.ro-skel');
      if (к && улегнала && к.offsetParent === null && !табът && MamaHelper.showTab) { табът = true; try { MamaHelper.showTab('room'); } catch (e) {} }
      if (к && улегнала && к.offsetParent !== null) { покажи(к); return; }
      if (++опит < 20) { setTimeout(търси, 150); return; }
      if (цели.length > 1) далеч(цели.slice(1));
    })();
  }

  // 🪤 22.09 (МЕРЕНО тук): scrollIntoView({smooth}) спираше на 2366 px под екрана („Мерки“),
  //   на −266 px над него („Имена“) и на 1432 px („Чанта“). Причината е .ro-room .jr-card
  //   { content-visibility:auto; contain-intrinsic-size:auto 220px } (mega.css:336): картите по пътя
  //   получават истинската си височина едва щом влязат в екрана и целта бяга. Същото вече е мерено
  //   и решено в preg20.js:870–888 и js/pl-zdrave.js (докарай) — тук е същият доказан ред:
  //   мигновен скок, после през 200 мс донагласяне, докато картата застане (±16 px) ДВЕ проверки
  //   подред, до 15 опита. Пипне ли мама екрана — спираме (не се борим с пръста ѝ). Нов скок гаси стария.
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

  function рафт(м) {
    return '<div class="pl-in-grid">' + м.арки.map(а =>
      '<button type="button" class="pl-in-arch" data-k="' + esc(а.к) + '" data-cel="' + esc(а.ключ) + '" aria-label="' + esc(а.к + ' — ' + а.цел) + '">' +
        '<span class="pl-in-a" aria-hidden="true"><span class="pl-in-in">' +
          '<i class="pl-in-ico2" style="' + сп(а.ик2) + '"></i>' +
          '<i class="pl-in-ico" style="' + сп(а.ик) + '"></i>' +
        '</span></span>' +
        '<b class="pl-in-l" aria-hidden="true">' + esc(а.к) + '<em>›</em></b>' +
      '</button>').join('') + '</div>';
  }
  function редове(м) {
    if (!м.редове.length) return '<p class="pl-in-empty"><span class="pl-in-ri has-art" aria-hidden="true" style="' + сп(['ico-b', 2, 1]) + '"></span><span>Още нищо тук. Отвори който и да е помощник — и той ще изплува на това място, под ръка.</span></p>';
    return м.редове.map(р =>
      '<button type="button" class="pl-in-row" data-cel="' + esc(р.ключ) + '" aria-label="' + esc(р.н + ' — ползвана ' + р.n + (р.n === 1 ? ' път' : ' пъти') + (р.чип ? ', отметнати ' + р.чип : '')) + '">' +
        (р.ик ? '<span class="pl-in-ri has-art" aria-hidden="true" style="' + сп(р.ик) + '"></span>'
              : '<span class="pl-in-ri" aria-hidden="true">' + esc(р.медал) + '</span>') +
        '<span class="pl-in-rt" aria-hidden="true"><b>' + esc(р.н) + '</b><small>ползвана ' + р.n + (р.n === 1 ? ' път' : ' пъти') + '</small></span>' +
        (р.чип ? '<span class="pl-in-chip" aria-hidden="true">' + esc(р.чип) + '</span>' : '') +
        '<em aria-hidden="true">›</em>' +
      '</button>').join('');
  }

  // 🪤 всяка наша промяна е мутация → наблюдателят ни вика пак. Пишем САМО при разлика (подпис).
  function сложи(корен) {
    let б = корен.querySelector(':scope > .pl-in');
    if (!еИнструменти(корен) || !корен.querySelector('.sec-find')) { if (б) { б.remove(); броячи.записи++; } return; }
    if (!б) { б = нов(корен); броячи.записи++; }
    // място: веднага под банера на стаята (premium-rooms.js слага .pl-rhero най-отгоре)
    const банер = корен.querySelector(':scope > .pl-rhero');
    if (б.parentNode !== корен || (банер ? б.previousElementSibling !== банер : корен.firstElementChild !== б)) {
      корен.insertBefore(б, банер ? банер.nextSibling : корен.firstChild); броячи.записи++;
    }
    const м = модел(корен);
    const пр = м.арки.map(а => а.к + '=' + а.ключ).join('|');
    const рф = б.querySelector('.pl-in-shelf');
    if (рф.getAttribute('data-sig') !== пр) {
      рф.setAttribute('data-sig', пр); рф.innerHTML = рафт(м); броячи.записи++;
      const брой = String(м.арки.length);
      if (рф.getAttribute('data-n') !== брой) рф.setAttribute('data-n', брой);
      if (рф.hidden !== !м.арки.length) рф.hidden = !м.арки.length;
    }
    // „Последно използвани“ се подрежда ВЕДНЪЖ — при отваряне на стаята.
    // 🪤 блокът стои НАД картите: ако редовете се пренареждаха докато мама отмята в чантата,
    //   височината му скача и картата под пръста ѝ подскача надолу (Safari няма scroll anchoring).
    //   Живо се сменя само числото „8 от 12“ — то не мени височината.
    const пс = б.querySelector('.pl-in-rows');
    if (!пс.hasAttribute('data-sig')) {
      пс.setAttribute('data-sig', м.редове.map(р => р.ключ + ':' + р.n).join('|') || '—');
      пс.innerHTML = редове(м); броячи.записи++;
    } else {
      пс.querySelectorAll('.pl-in-row').forEach(ред => {
        const р = м.редове.find(х => х.ключ === ред.getAttribute('data-cel'));
        const ч = ред.querySelector('.pl-in-chip');
        if (р && ч && р.чип && ч.textContent !== р.чип) { ч.textContent = р.чип; броячи.записи++; }
      });
    }
  }

  function всички() {
    броячи.пресмятания++;
    document.querySelectorAll('#roRoom').forEach(сложи);
  }
  // 🪤 setTimeout, не requestAnimationFrame — rAF спира, когато страницата не се рисува
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; всички(); }, 40); }

  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне на стая → гледаме статичния #roomOverlay
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    всички();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_INSTRUMENTI = { сложи: всички, броячи, далеч: () => далеч(таймери()) };
})();
