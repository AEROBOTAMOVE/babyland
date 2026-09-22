/* ═══════════════════════════════════════════════════════════════════════════════
   ✨ PREMIUM „+ ДОБАВИ МОМЕНТ“ · долен лист по референция 8 (22.09.2026)
   Розовият „+“ (polish.js:310–333, mountPlus) отваря старо меню от 5 хапчета:
   💜 Как си днес · 📸 Снимка на деня · ✍️ Ред в дневника → „Дневник на мама“,
   🍼 Хранене → „Моето бебе“, 🔦 Лампа → BL_LAMP (polish.js:316–323).
   Този файл НЕ го сменя — облича го. Старото меню остава ЕДИНСТВЕНИЯТ източник на
   истината: листът е отворен ⇔ .plus-menu е без hidden (наблюдател на атрибута).
   · старите 5 плочки натискат СТАРИТЕ хапчета (.plus-item.click()) — същото действие;
   · новите плочки (сън, пелени, температура…) викат MamaHelper.open(стая), както
     старото „Хранене“, и после скачат до СЪЩЕСТВУВАЩАТА карта, в която мама записва.
     Оттук НИЩО не се записва в паметта — записът е в картите на стаите.
   · ✕, Esc, клик по пердето и дръпване надолу затварят с клик на стария „+“
     (той си пази .open и бръмченето); фокусът се връща там, откъдето е дошъл.
   🪤 22.09 (ИЗМЕРЕНО, ag_dobavi_predi): бутонът има само КЛАС plus-btn, без id → старото
      getElementById('plus-btn') в premium-home не намираше нищо (там вече е поправено на
      '#blPlus .plus-btn', premium-home.js:106–108). Тук бутонът все пак получава id="plus-btn"
      (само ако няма друг с това id) — за да е вярно всичко, което го нарича „#plus-btn“.
      Без профил „+“ изобщо няма (polish.js:312, td-welcome) — тогава „Добави момент“
      отваря листа сам, а плочките викат същото, което викат старите хапчета.
   ЗА ДРУГИТЕ ЕКРАНИ: BL_PL_DOBAVI.открий('сън') отваря листа с плочката „Сън“ на фокус.
   22.09 (ag2) МАТЕРИАЛИТЕ (css/pl-ui.css): листът е .pl-felt (кремав филц с пунктирен шев), плочките
   и ✕ са .pl-soft (кремав филц), арките са в дървен шкаф с табелка и лавица, „+“ виси под лавицата.
   ПЪТ НАЗАД: махни <link href="css/pl-dobavi.css"> и <script src="js/pl-dobavi.js">
   от index.html — старото меню се връща само (CSS-ът го крие само при data-pl-dv).
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_DOBAVI) return;

  const чети = (к, по) => { try { const v = localStorage.getItem(к); return v ? JSON.parse(v) : по; } catch (e) { return по; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));
  const грешки = [];

  // ── пастелите (същите като арките на началото, premium.css .pl-room.c-*) ──
  const ЦВ = {
    розово: ['#fde6ef', '#f8cfdf'], небе: ['#e3edfc', '#c8dbf6'], мента: ['#e3f3e8', '#cde8d6'],
    люляк: ['#ece4f8', '#d9ccf0'], праскова: ['#fdebe4', '#f7d4c8'], масло: ['#fbf1d6', '#f3e2b5'],
  };

  // ── плочките: [лист, ред, колона] от спрайтовете 4×4 · стая · заглавие на картата ──
  //   стар:  регулярен израз за СТАРОТО хапче (polish.js:316) — ако го има, кликът е негов.
  //   карта: част от заглавието h4.jr-title в стаята (файл:ред, откъдето идва):
  //     rooms2.js:504 „Кога яде за последно?“ · :618 „Пелени днес“ · :690 „Сънят днес“
  //     :831 „Първите зъбки“ · :349 „Калкулатор на растежа“ · :1541 „Първите пъти“
  //     :2835 „Свободна страница ✍️“ (същото ✍️ като старото „Ред в дневника“)
  //     rooms3.js:276 „Снимка на деня“ · :1359 „Температурен дневник“ · :1404 „Дневник на даденото“
  //     :409 „Дневник на наддаването“ · :535 „Коремчето по седмици“ · :685 „Писмо до бебето“
  //     rooms4.js:77 „Вода днес“ · rooms.js:183 „Как си днес?“ · preg20.js:300 „Прегледът“
  //   фокус: бутонът, с който картата записва с ЕДНО докосване (само за трите бързи)
  const бутонСТекст = (к, сел, re) => [...к.querySelectorAll(сел)].find(x => re.test(x.textContent || ''));
  const П = {
    храна:     { н: 'Хранене',         ик: ['ico-a', 1, 0], цв: 'розово',   стар: /Хранене/,        стая: 'Моето бебе',      карта: 'Кога яде за последно', фокус: к => бутонСТекст(к, '.jr-quick .jr-chip', /Ляво/) },
    // 22.09 (ag2): синята луна със звездичка и ментовата пелена — ТОЧНО като арките на референция 8
    //   (ico-g [3,1], ico-f [0,0]; пелената е същата като „Нашият ден“, premium-home.js:133)
    сън:       { н: 'Сън',             ик: ['ico-g', 3, 1], цв: 'небе',                               стая: 'Моето бебе',      карта: 'Сънят днес',           фокус: к => бутонСТекст(к, '.jr-btn', /Заспа|Събуди/) },
    пелени:    { н: 'Пелени',          ик: ['ico-f', 0, 0], цв: 'мента',                              стая: 'Моето бебе',      карта: 'Пелени днес',          фокус: к => к.querySelector('.bb-dipbtn[aria-label="Едно повече: мокри"]') },
    темп:      { н: 'Температура',     ик: ['ico-a', 3, 1], цв: 'розово',                             стая: 'Здраве и SOS',    карта: 'Температурен дневник' },
    лекарство: { н: 'Лекарство',       ик: ['ico-e', 0, 3], цв: 'небе',                               стая: 'Здраве и SOS',    карта: 'Дневник на даденото' },
    тегло:     { н: 'Тегло',           ик: ['ico-d', 2, 3], цв: 'мента',                              стая: 'Моето бебе',      карта: 'Калкулатор на растежа' },
    зъбче:     { н: 'Зъбче',           ик: ['ico-d', 0, 2], цв: 'люляк',                              стая: 'Моето бебе',      карта: 'Първите зъбки' },
    първи:     { н: 'Първите пъти',    ик: ['ico-d', 1, 2], цв: 'праскова',                           стая: 'Развитие и игри', карта: 'Първите пъти' },   // обувчиците — като „Първи умения“ в реф. 8 (стъпалцата ico-g[1,3] на 52px се четяха като бисквита, снимка ag2_dobavi_svetlo)
    снимка:    { н: 'Снимка на деня',  ик: ['ico-b', 1, 1], цв: 'масло',    стар: /Снимка на деня/, стая: 'Дневник на мама', карта: 'Снимка на деня' },
    какси:     { н: 'Как си днес',     ик: ['ico-b', 0, 1], цв: 'розово',   стар: /Как си днес/,    стая: 'Дневник на мама', карта: 'Как си днес' },
    ред:       { н: 'Ред в дневника',  ик: ['ico-f', 1, 3], цв: 'небе',     стар: /Ред в дневника/, стая: 'Дневник на мама', карта: 'Свободна страница' },
    лампа:     { н: 'Нощна лампа',     ик: ['ico-c', 0, 1], цв: 'мента',    стар: /Лампа/,          лампа: true },
    // бременност (заглавията са измерени в стаята при 24-та седмица — ag_dobavi_karti_preg)
    вода:      { н: 'Вода',            ик: ['ico-e', 3, 3], цв: 'небе',                               стая: 'Бременност',      карта: 'Вода днес' },
    килца:     { н: 'Тегло',           ик: ['ico-b', 3, 2], цв: 'масло',                              стая: 'Бременност',      карта: 'Дневник на наддаването' },
    корем:     { н: 'Коремче',         ик: ['ico-a', 0, 1], цв: 'розово',                             стая: 'Бременност',      карта: 'Коремчето по седмици' },
    писмо:     { н: 'Писмо до бебето', ик: ['ico-a', 0, 3], цв: 'праскова',                           стая: 'Бременност',      карта: 'Писмо до бебето' },
    преглед:   { н: 'Прегледът',       ик: ['ico-a', 3, 2], цв: 'люляк',                              стая: 'Бременност',      карта: 'Прегледът' },
  };
  // „Хранене“ в празния профил е обикновена плочка → в различен цвят от „Как си днес“ над нея
  const ЦВЯТ_ИНАЧЕ = { храна: 'праскова', лампа: 'мента' };

  // ── кой е профилът: по СЪЩОТО правило като началото (premium-home.js:37–41) ──
  //   bl_baby.birth → бебе; иначе bl_preg (не null) → бременна; иначе → празно.
  function режим() {
    const б = чети('bl_baby', {}) || {};
    if (б.birth) return 'бебе';
    if (чети('bl_preg', null)) return 'бременна';
    return 'празно';
  }
  // 🤍 бременна жена не вижда „Хранене → Моето бебе“ (старото меню го показва на всички):
  //    плочката е за бебе, което още няма. Старото хапче стои в DOM — нищо не е махнато.
  const ГРУПИ = {
    бебе: [
      { гл: 'Бебето днес', арки: ['храна', 'сън', 'пелени'] },
      { гл: 'Грижа и растеж', плочки: ['темп', 'лекарство', 'тегло'] },
      { гл: 'Спомени', плочки: ['зъбче', 'първи', 'снимка'] },
      { гл: 'За теб', плочки: ['какси', 'ред', 'лампа'] },
    ],
    бременна: [
      { гл: 'Днес с коремчето', арки: ['вода', 'килца', 'корем'] },
      { гл: 'Спомени', плочки: ['писмо', 'снимка', 'преглед'] },
      { гл: 'За теб', плочки: ['какси', 'ред', 'лампа'] },
    ],
    празно: [
      { гл: 'За теб', плочки: ['какси', 'снимка', 'ред'] },
      { гл: 'Още', плочки: ['храна', 'лампа'] },
    ],
  };

  const фон = ик => 'background-image:url(img/art/' + ик[0] + '.webp);background-position:' + (ик[2] * 100 / 3).toFixed(3) + '% ' + (ик[1] * 100 / 3).toFixed(3) + '%';
  function рисувайГрупи(р) {
    let i = 0;
    return ГРУПИ[р].map(г => {
      // 22.09 (ag2) по референция 8: арките стоят в ДЪРВЕН ШКАФ с табелка отгоре („Днес“ със звездички),
      //   куполите са лъскави пастелни прозорци с кремава рамка, надписът е хапче в долната им част,
      //   под тях — дървена лавица, а от лавицата виси розово-бялото „+“. Плочките са кремав филц (.pl-soft).
      if (г.арки) {
        return '<section class="pl-dv-g pl-dv-g--shelf" aria-label="' + esc(г.гл) + '"><div class="pl-dv-shelf">' +
          '<h3 class="pl-dv-plaque" aria-hidden="true"><span>' + esc(г.гл) + '</span></h3>' +
          '<div class="pl-dv-arches">' + г.арки.map(к => {
            const п = П[к], ц = ЦВ[п.цв];
            return '<button type="button" class="pl-dv-a" data-k="' + к + '" style="--t1:' + ц[0] + ';--t2:' + ц[1] + ';--i:' + (i++) + '">' +
              '<span class="pl-dv-arch" aria-hidden="true"><span class="pl-dv-i" style="' + фон(п.ик) + '"></span></span>' +
              '<span class="pl-dv-l">' + esc(п.н) + '</span>' +
              '<span class="pl-dv-plus" aria-hidden="true"></span><small class="pl-dv-s"></small></button>';
          }).join('') + '</div></div></section>';
      }
      const вътре = '<div class="pl-dv-grid">' + г.плочки.map(к => {
        const п = П[к];
        const ц = ЦВ[(р === 'празно' && ЦВЯТ_ИНАЧЕ[к]) || п.цв];
        return '<button type="button" class="pl-dv-t pl-soft" data-k="' + к + '" style="--t:' + ц[0] + ';--i:' + (i++) + '">' +
          '<span class="pl-dv-i" aria-hidden="true" style="' + фон(п.ик) + '"></span><span class="pl-dv-l">' + esc(п.н) + '</span></button>';
      }).join('') + '</div>';
      return '<section class="pl-dv-g" aria-label="' + esc(г.гл) + '"><h3 class="pl-dv-gh" aria-hidden="true">' + esc(г.гл) + '</h3>' + вътре + '</section>';
    }).join('');
  }

  // ── листът (един за цялото приложение, в <body> — като .plus-wrap) ──
  let корен = null, лист = null, тяло = null;
  function построй() {
    if (корен) return корен;
    корен = document.createElement('div');
    корен.id = 'plDv';
    корен.className = 'pl-dv';
    корен.hidden = true;
    корен.innerHTML =
      '<div class="pl-dv-veil" data-pl-dv-x></div>' +
      '<section class="pl-dv-sheet pl-felt" role="dialog" aria-modal="true" aria-labelledby="plDvT" aria-describedby="plDvD" tabindex="-1">' +
        '<div class="pl-dv-top">' +
          '<div class="pl-dv-grip" aria-hidden="true"><i></i></div>' +
          '<header class="pl-dv-head"><div>' +
            '<h2 id="plDvT">Какво се случи? <span aria-hidden="true">♡</span></h2>' +
            '<p id="plDvD">Докосни — ще те заведа точно там.</p>' +
          '</div><button type="button" class="pl-dv-x pl-soft" data-pl-dv-x aria-label="Затвори"><i aria-hidden="true"></i></button></header>' +
        '</div>' +
        '<div class="pl-dv-body"></div>' +
        '<footer class="pl-dv-foot">' +
          '<a class="pl-dv-112" href="tel:112"><i aria-hidden="true"></i>Спешно? <b>112</b></a>' +
          '<small>Записките не заменят преглед.</small>' +
        '</footer>' +
      '</section>';
    лист = корен.querySelector('.pl-dv-sheet');
    тяло = корен.querySelector('.pl-dv-body');
    корен.addEventListener('click', e => {
      if (e.target.closest('[data-pl-dv-x]')) { затвори(true); return; }
      const т = e.target.closest('[data-k]');
      if (т) изпълни(т.getAttribute('data-k'));
    });
    // 🐣 плюшената иконка подскача при докосване — същата анимация като навсякъде (pl-ui.css .pl-hop;
    //   pl-ui.js маха класа на animationend). Нейният списък ИКОНА не познава .pl-dv-i, затова тук.
    корен.addEventListener('pointerdown', e => {
      const т = e.target.closest && e.target.closest('[data-k]'); if (!т) return;
      const и = т.querySelector('.pl-dv-i'); if (!и) return;
      и.classList.remove('pl-hop'); void и.offsetWidth; и.classList.add('pl-hop');
    }, { passive: true });
    влачене();
    document.body.appendChild(корен);
    return корен;
  }

  // ── състоянието ──
  let отворен = false, сам = false, скривач = null;
  let отКъде = null, искан = null;          // кой бутон отвори листа · коя плочка да светне
  let плюс = null, меню = null;              // старите: бутонът „+“ и менюто (polish.js:313–315)

  function обнови() {
    const р = режим();
    if (тяло.getAttribute('data-mode') !== р) { тяло.innerHTML = рисувайГрупи(р); тяло.setAttribute('data-mode', р); }
    // под арките — днешното число по СЪЩИТЕ правила като „Нашият ден“ (premium-home.js:63–82, денят()).
    //   Нула без запис не е „0“ и не е присъда: тогава под арката няма нищо (самата арка е поканата).
    let д = null;
    if (р === 'бебе') { try { д = window.BL_PREMIUM_HOME && BL_PREMIUM_HOME.денят ? BL_PREMIUM_HOME.денят() : null; } catch (e) { грешки.push(String(e)); } }
    [['храна', 'храна'], ['сън', 'сън'], ['пелени', 'пелени']].forEach(([к, пол]) => {
      const с = тяло.querySelector('.pl-dv-a[data-k="' + к + '"] .pl-dv-s'); if (!с) return;
      const т = д && д.има && д.има[пол] && typeof д[пол] === 'string' ? д[пол] : '';
      if (с.textContent !== т) с.textContent = т;   // 🪤 само при разлика
    });
  }

  function открий(опц) {
    построй();
    обнови();
    сам = !!(опц && опц.сам);
    if (отворен) return;
    отворен = true;
    clearTimeout(скривач);
    корен.hidden = false;
    void корен.offsetWidth;                   // пресмятане преди класа, за да тръгне плъзгането
    корен.classList.add('is-open');
    document.documentElement.classList.add('pl-dv-lock');
    if (плюс && плюс.getAttribute('aria-expanded') !== 'true') плюс.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', клавиш, true);
    // фокусът влиза в листа: на поисканата плочка (BL_PL_DOBAVI.открий('сън')), иначе на първата
    const цел = (искан && тяло.querySelector('[data-k="' + искан + '"]')) || тяло.querySelector('[data-k]');
    if (искан && цел) { цел.setAttribute('data-pl-dv-hi', '1'); setTimeout(() => { if (цел.isConnected) цел.removeAttribute('data-pl-dv-hi'); }, 2600); }
    искан = null;
    setTimeout(() => { if (отворен && цел) { try { цел.focus({ preventScroll: true }); } catch (e) { цел.focus(); } } }, 60);
  }

  function скрий() {
    if (!отворен) return;
    отворен = false;
    корен.classList.remove('is-open');
    document.documentElement.classList.remove('pl-dv-lock');
    if (плюс && плюс.getAttribute('aria-expanded') !== 'false') плюс.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', клавиш, true);
    лист.style.transform = '';
    скривач = setTimeout(() => { if (!отворен) корен.hidden = true; }, 340);
  }

  function фокусирай(е) {
    const ц = (е && е.isConnected && е.getClientRects().length) ? е : (плюс && плюс.isConnected ? плюс : null);
    if (ц) { try { ц.focus({ preventScroll: true }); } catch (e) { ц.focus(); } }
  }

  // затваряне от мама (✕ / Esc / пердето / дръпване): през стария „+“, ако менюто му е отворено
  function затвори(връщайФокус) {
    if (!отворен) return;
    if (!сам && меню && !меню.hidden && плюс) кликниПлюс();   // polish.js:326–330 → hidden=true → наблюдателят вика скрий()
    else скрий();
    if (връщайФокус) фокусирай(отКъде);
  }

  function изпълни(к) {
    const п = П[к]; if (!п) return;
    // фокусът първо на „+“ (или откъдето е дошла): стаята запомня activeElement при отваряне
    // (helper.js:5377+, roФокусПреди) и при „✕“ на стаята ще върне мама точно там
    фокусирай(отКъде);
    const стар = п.стар && меню ? [...меню.querySelectorAll('.plus-item')].find(б => п.стар.test(б.textContent || '')) : null;
    try {
      if (стар) стар.click();                  // СТАРОТО действие, едно към едно (polish.js:319–323)
      else {
        затвори(false);
        if (п.лампа) { if (window.BL_LAMP) BL_LAMP(); }
        else if (window.MamaHelper && MamaHelper.open) MamaHelper.open(п.стая);
      }
    } catch (e) { грешки.push(String(e)); }
    if (сам || !меню) скрий();
    if (п.карта) иди(п);
  }

  // ── до картата: стаята се рисува с отлагане (скелет, разкриване, рисунки), затова
  //   търсим с обикновен таймер (не rAF — спира, когато страницата не се рисува).
  //   🪤 22.09 (ИЗМЕРЕНО, ag_dobavi_diag): скок до „Сънят днес“ пропадаше — за 4.5 с scrollHeight
  //      скачаше 4050 → 5790 → 4770 → 12819, а картата свършваше на top −1110. Причината е
  //      mega.css:336 „.ro-room .jr-card { content-visibility: auto; contain-intrinsic-size: auto 220px }“:
  //      неизрисуваните карти над целта са по 220px „на ужким“ и растат, щом минем покрай тях;
  //      всяко догонване рисува други карти → гонитба без край. Лекът: картите в стаята се
  //      рисуват истински (data-pl-dv-go на #roRoom → content-visibility: visible, pl-dobavi.css).
  //   🪤 ИЗМЕРЕНО (ag_dobavi_diag2/3): махнеш ли атрибута веднага след скока, картите над целта
  //      пак стават по 220px и целта отлита (−2417; с повторен скок — гонитба 3044/−876/−4453).
  //      Затова атрибутът стои, ДОКАТО СТАЯТА Е ОТВОРЕНА, и се маха при затварянето ѝ или смяна
  //      на стаята (наблюдател само на hidden на #roomOverlay и на текста на #roTitle).
  //      Цена: в тази една стая пестенето на content-visibility е изключено — еднократно
  //      оформяне на картите ѝ; при следващото отваряне всичко е както преди.
  //   Докосне ли мама екрана — спираме догонването веднага, не се борим с пръста ѝ.
  function картата(дума) {
    const всички = [...document.querySelectorAll('#roomOverlay section.jr-card')].filter(к => {
      const т = к.querySelector('.jr-title'); if (!т) return false;
      let с = т.textContent || '';
      const под = т.querySelector('.jr-sub'); if (под) с = с.replace(под.textContent || '', '');
      return с.includes(дума);
    });
    return всички.find(к => к.getClientRects().length) || null;   // стаята понякога е нарисувана два пъти
  }
  function скролер(е) {
    let с = е.parentElement;
    while (с && с !== document.body && !(с.scrollHeight > с.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(с).overflowY))) с = с.parentElement;
    return с && с !== document.body ? с : null;
  }
  let пътуване = 0, пазач = null;
  function пусниСтаята() {
    if (пазач) { пазач.н.disconnect(); if (пазач.стая.hasAttribute('data-pl-dv-go')) пазач.стая.removeAttribute('data-pl-dv-go'); пазач = null; }
  }
  function задръжСтаята(стая, име) {
    пусниСтаята();
    const ов = document.getElementById('roomOverlay'), загл = document.getElementById('roTitle');
    if (!стая.hasAttribute('data-pl-dv-go')) стая.setAttribute('data-pl-dv-go', '1');
    const н = new MutationObserver(() => { if (ов.hidden || (загл && загл.textContent !== име)) пусниСтаята(); });
    н.observe(ов, { attributes: true, attributeFilter: ['hidden'] });
    if (загл) н.observe(загл, { childList: true, characterData: true, subtree: true });
    пазач = { н, стая };
  }
  function иди(п) {
    const ов = document.getElementById('roomOverlay'); if (!ов) return;
    const моето = ++пътуване;                  // нова плочка отменя старото пътуване
    let пъти = 0, догони = 0, добри = 0, к = null, спри = false;
    const стоп = () => { спри = true; };
    const СЪБ = ['touchstart', 'wheel', 'keydown'];
    СЪБ.forEach(с => ов.addEventListener(с, стоп, { passive: true }));
    const край = () => СЪБ.forEach(с => ов.removeEventListener(с, стоп, { passive: true }));
    const стъпка = () => {
      if (спри || моето !== пътуване) { край(); return; }
      if (!к) {
        if (++пъти > 50) { край(); return; }            // ~8 с: ключалка (ПИН) или бавен телефон
        const заглавие = document.getElementById('roTitle');
        if (ов.hidden || (заглавие && заглавие.textContent !== п.стая)) { setTimeout(стъпка, 160); return; }
        const таб = document.querySelector('#roTabs .st-seg.on, .ro-tab.on');
        if (таб && таб.getAttribute('data-tab') && таб.getAttribute('data-tab') !== 'room' && window.MamaHelper && MamaHelper.showTab) MamaHelper.showTab('room');
        к = картата(п.карта);
        if (!к) { setTimeout(стъпка, 160); return; }
        // сгъната → разгъва се с НЕЙНИЯ бутон ▾ (той пази bl_folds и aria-expanded, polish.js:226–247)
        if (к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); }
        const стая = к.closest('#roRoom');
        if (стая) задръжСтаята(стая, п.стая);
        void к.offsetTop;                                // истинските размери ПРЕДИ скока
        к.setAttribute('data-pl-dv-spot', '1');
        setTimeout(() => { if (к.isConnected) к.removeAttribute('data-pl-dv-spot'); }, 2600);
        к.scrollIntoView({ block: 'start', behavior: 'auto' });
        const ф = п.фокус ? п.фокус(к) : null;
        if (ф) { try { ф.focus({ preventScroll: true }); } catch (e) { ф.focus(); } }
        setTimeout(стъпка, 300);
        return;
      }
      // догонване за късно растящите (рисунки, числа): поне 1.5 с, най-много ~3.6 с
      if (!к.isConnected) { край(); return; }
      const ск = скролер(к);
      const горе = ск ? ск.getBoundingClientRect().top : 0;
      const р = к.getBoundingClientRect().top - горе - 12;
      const наДъното = ск ? ск.scrollTop + ск.clientHeight >= ск.scrollHeight - 2 : false;
      if (Math.abs(р) > 40 && !(р > 0 && наДъното)) { добри = 0; к.scrollIntoView({ block: 'start', behavior: 'auto' }); }
      else добри++;
      догони++;
      if ((добри >= 3 && догони >= 5) || догони > 12) { край(); return; }
      setTimeout(стъпка, 300);
    };
    setTimeout(стъпка, 120);
  }

  // ── клавиатура: Esc затваря, Tab обикаля САМО в листа ──
  function клавиш(e) {
    if (!отворен) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); затвори(true); return; }
    if (e.key !== 'Tab') return;
    const всички = [...лист.querySelectorAll('button, a[href]')].filter(х => х.getClientRects().length);
    if (!всички.length) return;
    const първо = всички[0], последно = всички[всички.length - 1];
    if (!лист.contains(document.activeElement)) { e.preventDefault(); първо.focus(); return; }
    if (e.shiftKey && document.activeElement === първо) { e.preventDefault(); последно.focus(); }
    else if (!e.shiftKey && document.activeElement === последно) { e.preventDefault(); първо.focus(); }
  }

  // ── дръпване надолу за дръжката/заглавието (над 90px затваря) ──
  function влачене() {
    const горе = корен.querySelector('.pl-dv-top');
    let y0 = null, dy = 0, ид = null;
    горе.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      y0 = e.clientY; dy = 0; ид = e.pointerId;
      лист.classList.add('is-drag');
      try { горе.setPointerCapture(ид); } catch (er) {}
    });
    горе.addEventListener('pointermove', e => {
      if (y0 === null || e.pointerId !== ид) return;
      dy = Math.max(0, e.clientY - y0);
      лист.style.transform = dy ? 'translateY(' + dy + 'px)' : '';
    });
    const пусни = e => {
      if (y0 === null || e.pointerId !== ид) return;
      y0 = null;
      лист.classList.remove('is-drag');
      if (dy > 90) затвори(true); else лист.style.transform = '';
    };
    горе.addEventListener('pointerup', пусни);
    горе.addEventListener('pointercancel', пусни);
  }

  // ── откъде е дошла мама (там се връща фокусът). premium-home натиска „+“ с .click() ВЪТРЕ
  //   в клика по „Добави момент“ (premium-home.js:108) — вложеният клик не бива да изтрие,
  //   че е дошла от „Добави момент“ (вложен = до края на текущата задача). Нашите собствени
  //   кликове по „+“ (затваряне) не се броят (свой). ──
  let вложен = false, свой = false;
  function кликниПлюс() { свой = true; try { плюс.click(); } finally { свой = false; } }
  document.addEventListener('click', e => {
    if (свой || !e.target.closest) return;
    const и = e.target.closest('.plus-btn, #plHome [data-pl="add"]');
    if (!и) return;
    const еПлюс = и.classList.contains('plus-btn');
    if (еПлюс && вложен) return;
    отКъде = и;
    if (!еПлюс) { вложен = true; setTimeout(() => { вложен = false; }, 0); }
  }, true);
  // без профил няма „+“ — „Добави момент“ отваря листа сам (иначе беше мъртъв бутон)
  document.addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('#plHome [data-pl="add"]')) return;
    if (document.querySelector('.plus-btn')) return;           // има „+“ → минава през него
    if (!отКъде || !отКъде.isConnected) отКъде = e.target.closest('#plHome [data-pl="add"]');
    открий({ сам: true });
  });

  // ── закачане към стария „+“ (появява се, когато „Днес“ се нарисува — polish.js:310) ──
  function закачи() {
    const обв = document.getElementById('blPlus');
    if (!обв || обв._plDv) return;
    const б = обв.querySelector('.plus-btn'), м = обв.querySelector('.plus-menu');
    if (!б || !м) return;
    обв._plDv = true;
    плюс = б; меню = м;
    обв.setAttribute('data-pl-dv', '1');
    if (!document.getElementById('plus-btn')) б.id = 'plus-btn';
    б.setAttribute('aria-label', 'Добави момент');
    б.setAttribute('aria-haspopup', 'dialog');
    б.setAttribute('aria-controls', 'plDv');
    б.setAttribute('aria-expanded', 'false');
    // листът следва менюто — само атрибута hidden на МЕНЮТО (нашите промени не са там → без кръг)
    new MutationObserver(() => {
      if (!м.hidden && !отворен) открий();
      else if (м.hidden && отворен && !сам) скрий();
    }).observe(м, { attributes: true, attributeFilter: ['hidden'] });
    if (!м.hidden) открий();
  }
  function върви() {
    построй();
    закачи();
    // обвивката е пряко дете на <body> → гледаме само децата на body, без поддърво
    new MutationObserver(() => { if (!плюс || !плюс.isConnected) { const о = document.getElementById('blPlus'); if (о && !о._plDv) закачи(); } })
      .observe(document.body, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();

  // открий('сън') — листът се отваря с тази плочка на фокус и мек розов пулс; през стария „+“, ако го има
  function отвориОтвън(ключ) {
    искан = ключ && П[ключ] ? ключ : null;
    if (плюс && плюс.isConnected && меню && меню.hidden) плюс.click();
    else открий({ сам: !плюс || !плюс.isConnected });
  }
  window.BL_PL_DOBAVI = { открий: отвориОтвън, затвори, режим, грешки, П };
})();
