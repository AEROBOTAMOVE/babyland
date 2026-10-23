/* ═══════════════════════════════════════════════════════════════════════════════
   📚 СТАТИИТЕ · рафт върху сцената и четец „тефтер на облак“ (референция 11, 22.09.2026)
   Рафтът (#roArticles — articles.js renderList) лежи ВЪРХУ сцената на стаята (.ro-panel,
   img/scene/<стая>.webp): горе прозорец към сцената с филцова табелка „Рафтът с книжки“
   (бебето с книжката от img/art/fig-a.webp, броят статии и прочетените), под нея —
   търсачка-капсула, рафтовете като кремав филц (.pl-soft, избраният е .on → розов филц),
   картите като филц с шев (.pl-felt) с малка арка на рафта/стаята и емоджи-стикер.
   Празното „Няма съвпадение“ е филцова карта с лупа и гел бутон „Изчисти търсенето“.
   Четецът (#artOverlay — articles.js openArticle): кремавата хартия и ленената корица са в
   css/pl-statii.css; тук JS слага само КЛАСОВЕ и една декоративна сцена над заглавието —
   розов вълнен облак, медальон с рисунката на рафта, бебето на луната (реф. 11: тефтер на
   облак, луна, звезди). Материалите — от pl-ui.css: .pl-felt (съдържание, „Виж също“),
   .pl-soft (бутоните в главата, стрелките, съдържанието), .pl-gel („Питай помощничката“).
   🚨 подзаглавията, 🚨 редовете и 112 остават ЧЕРВЕНИ и ярки (не се обличат в розово).
   Нищо не записва. Нито един клик/запис не е подменен — всичко остава на articles.js/reader.js.
   Чете: BL_ARTICLES_DATA (articles.js:9 + lib.js:68–71 долива библиотеката),
         BL_ARTICLES.forRoom (articles.js:603) — колко статии има стаята (същото, което рисува рафта),
         bl_art_read — пише го reader.js:41–46 (r[id] = Date.now(), при >92% скрол reader.js:92–94),
           чете се през BL_READER.прочетени (reader.js:216) — СЪЩОТО правило; резервно — същият JSON,
         window._blCurArt — articles.js:316 (коя статия е отворена),
         „N мин четене“ — същото смятане като articles.js:384–385 (думи / 180).
   ПЪТ НАЗАД: махни <link href="css/pl-statii.css"> и <script src="js/pl-statii.js">
   от index.html — рафтът и четецът се връщат точно каквито бяха (нищо не е записано).
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_STATII) return;

  // пастелният фон под плюшената иконка (белият фон на листа се слива с него — multiply)
  const ТОН = { p: '#fde6ef', s: '#dfeafb', m: '#dff2e7', l: '#ece4f8', b: '#fff0d4', c: '#fde5d8' };

  // 🧸 Рафт (името БЕЗ водещото емоджи, както е в lib/index.json „c“) → [лист, ред, колона, тон].
  //   Листове 4×4: img/art/ico-a…g.webp; „x“ = img/art/fig-a.webp (4×2 фигури).
  //   САМО очевидните — останалите („Кърмене“, „Поведение“, „Семейство“…) показват арката на
  //   стаята, не насилена иконка. Клетките f/g/x — проверени на увеличение (ag2_statii_kletki.png).
  const РАФТ = {
    // Моето бебе
    'Новородено': ['d', 3, 3, 'b'], 'Шише и изцеждане': ['a', 1, 0, 'p'], 'Сън': ['a', 1, 1, 's'],
    'Грижи': ['e', 3, 1, 'p'], 'Растеж': ['a', 1, 2, 'b'], 'Близнаци': ['c', 2, 1, 'p'], 'Празници': ['d', 1, 3, 'c'],
    'Бабини деветини': ['c', 3, 0, 'l'], 'Трикове': ['e', 0, 1, 'b'], 'Месец по месец': ['a', 0, 1, 'p'],
    // Здраве и SOS
    'Спешно и травми': ['a', 3, 0, 'c'], 'Температура и инфекции': ['a', 3, 1, 's'], 'Безопасност': ['a', 3, 3, 'm'],
    'Зъбки и уста': ['d', 0, 2, 's'], 'Алергии': ['a', 2, 2, 'b'], 'Сезони и навън': ['b', 0, 2, 's'],
    'Ваксини': ['g', 1, 1, 'm'],                                   // сърце с кръст
    // Захранване
    'Когато нещо не е наред': ['a', 3, 2, 'm'], 'Първите лъжички': ['a', 2, 0, 'c'], 'На масата': ['e', 1, 0, 'p'],
    'Безопасност и алергени': ['a', 2, 2, 'b'], 'Пиене': ['e', 3, 3, 's'], 'Какво влиза в чинията': ['a', 2, 1, 'm'],
    // Развитие и игри
    'Говор': ['d', 1, 1, 'p'], 'Игра и учене': ['b', 2, 0, 's'], 'Движение': ['d', 1, 0, 'b'],
    'Музика и книжки': ['x', 1, 1, 'l'],                           // бебето с книжката
    'Игри с това, което имаш': ['b', 1, 3, 'm'],
    // Дневник на мама
    'Емоции': ['b', 0, 1, 'l'], 'Възстановяване': ['a', 3, 2, 'm'],
    // Бременност
    'Тревожни сигнали': ['a', 3, 0, 'c'], 'Хранене и лекарства': ['a', 2, 1, 'm'], 'Триместри и прегледи': ['a', 0, 1, 'p'],
    'Раждането': ['g', 0, 0, 'p'],                                 // бебе в кошче
    'Родилното и първите дни': ['g', 0, 1, 'b'],                   // чантата с мечето
    // Инструменти
    'Продукти и безопасност': ['d', 2, 1, 's'], 'Документи, ясли и кухни': ['c', 0, 0, 'p'], 'Още': ['c', 3, 2, 'l'],
    'Права и закрила': ['a', 3, 3, 'm'], 'Помощи и НОИ': ['a', 1, 3, 'b'], 'Пътуване': ['e', 1, 1, 'p'],
    // Жената в мен
    'Аз, освен майка': ['c', 1, 1, 'b'], 'Тялото ми': ['e', 0, 0, 'p'], 'Главата ми': ['c', 2, 0, 's'], 'Двамата': ['c', 2, 1, 'p'],
    // Лабораторията
    'Лабораторията': ['c', 2, 3, 'l'],
    // 22.09 — 13-те рафта, които показваха арката на стаята: нов тематичен лист img/art/statii-t.webp („t“, 4×4)
    'Семейство': ['t', 3, 3, 'c'],            // две мечета
    'Поведение': ['t', 0, 3, 'p'],            // мече, което плаче
    'Кожа и обриви': ['t', 2, 0, 's'],        // ваничка с патенце
    'Кърмене': ['t', 0, 2, 'p'],              // възглавничка-сърце
    'Хората около мен': ['t', 3, 1, 'b'],     // жълто сърце
    'Работа и пари': ['a', 1, 3, 'b'],        // сандъче
    'Тревоги': ['t', 1, 2, 'l'],              // чаша и свещ
    'Коремчето': ['t', 0, 1, 'm'],            // шише и купичка
    'Недоносено бебе и НИКУ': ['t', 3, 2, 's'], // креватче
    'Роднини и граници': ['h', 0, 0, 'l'],    // бабата с очилата
    'Ясла и раздяла': ['t', 2, 1, 'm'],       // количка под дърво
    'Гърне': ['t', 1, 3, 'c'],                // купчинка пелени
    'Екрани': ['b', 1, 1, 's'],               // фотоапарат
  };
  // стаята на статията → арката й (img/art/room-*.webp; url-ът е в CSS файла — виж там 🪤)
  const СТАЯ = { 'Бременност': 'preg', 'Моето бебе': 'baby', 'Захранване': 'feed', 'Здраве и SOS': 'health',
    'Дневник на мама': 'diary', 'Развитие и игри': 'play', 'Инструменти': 'tools', 'Жената в мен': 'mom', 'Лабораторията': 'lab' };
  // персонажът на .ro-panel (същата таблица като premium-rooms.js БАНЕРИ)
  const ПЕРСОНАЖ = { 'ro-peach': 'preg', 'ro-sky': 'baby', 'ro-carrot': 'feed', 'ro-green': 'health', 'ro-lav': 'diary',
    'ro-sun': 'play', 'ro-mint': 'tools', 'ro-rose': 'mom', 'ro-cork': 'lab' };

  const безЗнак = т => String(т || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
  const данни = () => window.BL_ARTICLES_DATA || [];
  // стикерът: същото правило като js/pl-ui.js (емоджито в <span class="pl-em">, textContent остава същият)
  const ЕМ = /^(\s*)(\p{Extended_Pictographic}(?:\u{FE0F}|\u{200D}\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u{FE0F}\u{20E3})*)/u;

  function персонаж() {
    const п = document.querySelector('#roomOverlay .ro-panel');
    if (!п) return null;
    for (const к in ПЕРСОНАЖ) if (п.classList.contains(к)) return ПЕРСОНАЖ[к];
    return null;
  }

  // Заглавие → статия.
  // 🪤 .art-card НЯМА data-id — articles.js:542–545 закача клика в closure. Свързваме по
  //   заглавие, точно както reader.js:200–206. Картата се строи наново, щом lib.js долее
  //   Голямата библиотека в масива (дължината се сменя).
  let поЗаглавие = null, бройКарта = -1;
  function статия(заглавие) {
    const д = данни();
    if (!поЗаглавие || бройКарта !== д.length) {
      поЗаглавие = new Map();
      д.forEach(а => { if (а && а.title && !поЗаглавие.has(а.title)) поЗаглавие.set(а.title, а); });
      бройКарта = д.length;
    }
    return поЗаглавие.get(заглавие) || null;
  }

  // прочетените — ЧЕТЕНЕ по правилото на reader.js (там се и пишат), не собствена памет
  function прочетени() {
    try { if (window.BL_READER && typeof BL_READER.прочетени === 'function') return BL_READER.прочетени() || {}; } catch (e) {}
    try { const v = JSON.parse(localStorage.getItem('bl_art_read')); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; }
  }

  // „N мин четене“ — същото смятане като articles.js:384–385. Тялото на библиотечна статия
  //   идва чак при първото отваряне (lib.js load) — дотогава минутите НЕ се измислят.
  function минути(а) {
    const т = а && а.body;
    if (typeof т !== 'string' || !т || т.charAt(0) === '⏳') return 0;
    return Math.max(1, Math.round(т.split(/\s+/).length / 180));
  }

  // рисунката: плюшена иконка на рафта ИЛИ арката на стаята. Само класове + позиция.
  // 🪤 позицията и тонът са в style (числа/цвят) — url-ът е в CSS файла като url(../img/art/…),
  //   защото относителен url в CSS ПРОМЕНЛИВА се разрешава спрямо css/ (→ css/img/… 404).
  function рисунка(ел, а) {
    const р = а && а.cat ? РАФТ[безЗнак(а.cat)] : null;
    if (р) {
      ел.classList.add('pl-sa-i', 'pl-sa-' + р[0]);
      const y = р[0] === 'x' ? р[1] * 100 : р[1] * 100 / 3;      // фигурите са 4×2, иконките 4×4
      ел.style.setProperty('--pl-sa-pos', (р[2] * 100 / 3).toFixed(3) + '% ' + y.toFixed(3) + '%');
      ел.style.setProperty('--pl-sa-tone', ТОН[р[3]]);
    } else {
      ел.classList.add('pl-sa-r', 'pl-sa-r-' + ((а && СТАЯ[а.room]) || персонаж() || 'baby'));
    }
  }

  // емоджито в началото на бутона → стикер (като pl-ui.js обвий; .art-cat не е в неговия списък)
  function стикер(б) {
    if (б.querySelector(':scope > .pl-em')) return;
    const п = б.firstChild;
    if (!п || п.nodeType !== 3) return;
    const м = п.nodeValue.match(ЕМ);
    if (!м) return;
    const преди = б.textContent;
    const с = document.createElement('span');
    с.className = 'pl-em'; с.setAttribute('aria-hidden', 'true'); с.textContent = м[2];
    if (м[1]) б.insertBefore(document.createTextNode(м[1]), п);
    п.nodeValue = п.nodeValue.slice(м[0].length);
    б.insertBefore(с, п);
    if (б.textContent !== преди) б.textContent = преди;          // текстът трябва да е байт в байт същият
  }

  // ── РАФТЪТ ──
  // коя стая е отворена: персонажът на панела → името; резерва — стаята на първата карта
  function стаята(кон) {
    const к = персонаж();
    if (к) for (const r in СТАЯ) if (СТАЯ[r] === к) return r;
    const т = кон.querySelector('.art-ctitle');
    const а = т ? статия(т.textContent) : null;
    return а ? а.room : '';
  }
  const мн = (n, едно, много) => n + ' ' + (n === 1 ? едно : много);

  // 🎬 прозорецът към сцената: филцова табелка долу вляво (като .pl-rhero-t на таба „Стаята“)
  function прозорец(кон) {
    let х = кон.querySelector(':scope > .pl-sa-hero');
    if (!х) {
      х = document.createElement('div');
      х.className = 'pl-sa-hero';
      х.innerHTML = '<div class="pl-sa-plq pl-felt"><div class="pl-sa-ht" role="heading" aria-level="2">Рафтът с книжки</div>' +
        '<p class="pl-sa-hs"></p><i class="pl-sa-fig" aria-hidden="true"></i></div>';
      кон.insertBefore(х, кон.firstChild);
    } else if (кон.firstChild !== х) {
      кон.insertBefore(х, кон.firstChild);
    }
    // брой — същият списък, който рисува рафта (forRoom); прочетените — по reader.js.
    // Нула прочетени е ПОКАНА, не „0“.
    // Без търсачка рафтът е само „Рафтът още не се е отворил…“ (articles.js:462) — тогава брой няма.
    let всички = [];
    try { if (кон.querySelector('.art-search') && window.BL_ARTICLES && BL_ARTICLES.forRoom) всички = BL_ARTICLES.forRoom(стаята(кон)) || []; } catch (e) {}
    const r = прочетени();
    let чет = 0;
    всички.forEach(а => { if (а && r[а.id]) чет++; });
    const текст = !всички.length ? ''
      : чет ? мн(всички.length, 'статия', 'статии') + ' · ' + мн(чет, 'прочетена', 'прочетени') + ' ✓'
      : мн(всички.length, 'статия', 'статии') + ' — избери една за начало';
    const ред = х.querySelector('.pl-sa-hs');
    // 🪤 само при РАЗЛИКА — всяко писане е мутация, а наблюдателят ни вика пак
    if (ред && ред.textContent !== текст) ред.textContent = текст;
  }

  // всички=false: само новите карти (след всяко пре-рисуване на articles.js draw());
  // всички=true: и старите — след затваряне на статия (прочетено / минутите вече се знаят).
  // 🔍 29.09: полето за търсене носеше СИСТЕМНО емоджи в подсказката (js/articles.js:464
  //   „🔍 Търси в статиите…“). Подсказката не е текст, който старият код сравнява — махаме
  //   знака оттам, а лупата идва като плюшена рисунка (css/pl-statii.css).
  function плюшенаЛупа() {
    const п = document.querySelector("#roArticles .art-search");
    if (!п || п.dataset.plLupa) return;
    const т = п.getAttribute("placeholder") || "";
    const без = т.replace(/^\s*\uD83D\uDD0D\s*/, "");
    if (без !== т) п.setAttribute("placeholder", без);
    п.dataset.plLupa = "1";
    // 🪤 МЕРЕНО (lupa_proba.png): спрайтът като ФОН на полето показва и съседните клетки —
    //   50px високо поле срещу 22px клетка. Затова рисунката отива на обвивка с точен размер.
    if (!п.parentElement || !п.parentElement.classList.contains("pl-sa-lupa")) {
      const о = document.createElement("span");
      о.className = "pl-sa-lupa";
      п.parentNode.insertBefore(о, п);
      о.appendChild(п);
    }
  }
  function списък(всички) {
    const кон = document.getElementById('roArticles');
    if (!кон || !кон.firstChild) return;                        // още не е строен (helper.js строи при първо показване)
    прозорец(кон);
    плюшенаЛупа();
    const нови = кон.querySelectorAll('.art-card:not([data-pl])');
    if (нови.length || всички) {
      const r = прочетени();
      нови.forEach(к => {
        к.setAttribute('data-pl', '1');
        к.classList.add('pl-felt');
        const т = к.querySelector('.art-ctitle');
        рисунка(к, т ? статия(т.textContent) : null);
        const м = document.createElement('span');
        м.className = 'pl-sa-meta';
        к.appendChild(м);
      });
      (всички ? кон.querySelectorAll('.art-card[data-pl]') : нови).forEach(к => мета(к, r));
    }
    // рафтовете — кремав филц; избраният (.on — articles.js:486–487) става розов филц в pl-ui.css
    кон.querySelectorAll('.art-cat:not([data-pl])').forEach(б => {
      б.setAttribute('data-pl', '1');
      б.classList.add('pl-soft');
      стикер(б);
    });
    съобщения(кон);
  }

  function мета(к, r) {
    const т = к.querySelector('.art-ctitle'), м = к.querySelector('.pl-sa-meta');
    if (!т || !м) return;
    const а = статия(т.textContent);
    const части = [];
    const раф = а && а.cat ? безЗнак(а.cat) : '';
    if (раф && раф !== а.room) части.push(раф);   // „Лабораторията“ в Лабораторията не казва нищо
    const мин = минути(а);
    if (мин) части.push(мин + ' мин четене');
    const текст = части.join(' · ');
    if (м.textContent !== текст) м.textContent = текст;
    const чете = !!(а && r[а.id]);
    if (к.classList.contains('pl-read') !== чете) к.classList.toggle('pl-read', чете);
  }

  // „Рафтът още не се е отворил…“ (articles.js:462), „Няма съвпадение…“ (articles.js:539),
  // „Точно това не намерих…“ (articles.js:540) — само клас за вид; текстът е на приложението.
  function съобщения(кон) {
    кон.querySelectorAll('.jr-privacy:not([data-pl])').forEach(п => {
      п.setAttribute('data-pl', '1');
      const т = (п.textContent || '').trim();
      const вид = п.parentElement === кон ? 'pl-sa-empty' : /^Точно това/.test(т) ? 'pl-sa-near' : 'pl-sa-none';
      п.classList.add(вид);
      if (вид !== 'pl-sa-near') п.classList.add('pl-felt');
      const търс = кон.querySelector('.art-search');
      if (вид === 'pl-sa-none' && търс && търс.value.trim()) {
        // изчиства СЪЩОТО поле и пуска същото „input“ → articles.js:557 пре-рисува сам
        const б = document.createElement('button');
        б.type = 'button'; б.className = 'pl-sa-clear pl-gel'; б.textContent = 'Изчисти търсенето';
        б.addEventListener('click', () => {
          търс.value = '';
          търс.dispatchEvent(new Event('input', { bubbles: true }));
          try { търс.focus({ preventScroll: true }); } catch (e) {}
        });
        п.appendChild(б);
      }
    });
  }

  // ── ЧЕТЕЦЪТ ──
  // articles.js сменя #artBody.innerHTML при всяко отваряне (и втори път, когато тялото на
  // библиотечна статия долети) → новото .art-title е без data-pl → сцената се слага веднъж.
  // Материалите (облечи) се проверяват при ВСЯКА промяна: reader.js добавя стрелките и
  // бутоните в главата СЛЕД articles.js (reader.js:51–77, 111–131).
  const ЕМОДЖИ_ОТПРЕД = /^\p{Extended_Pictographic}/u;
  function облечи(тяло) {
    тяло.querySelectorAll(':scope > .art-toc:not(.pl-felt), :scope > .art-rel:not(.pl-felt)').forEach(е => е.classList.add('pl-felt'));
    // 🚨 бутонът в съдържанието (.art-toc-sos) НЕ става филц — остава червен
    тяло.querySelectorAll('.art-toc-b:not(.art-toc-sos):not(.pl-soft), .art-relb:not(.pl-soft), .art-navb:not(.pl-soft)').forEach(е => е.classList.add('pl-soft'));
    тяло.querySelectorAll('.art-ask:not(.pl-gel)').forEach(е => е.classList.add('pl-gel'));
    document.querySelectorAll('#artOverlay .art-head .ro-nav:not(.pl-soft), #artOverlay .art-head .art-fs:not(.pl-soft)').forEach(е => е.classList.add('pl-soft'));
  }
  function четец() {
    const тяло = document.getElementById('artBody');
    if (!тяло) return;
    облечи(тяло);
    const загл = тяло.querySelector(':scope > .art-title');
    if (!загл || загл.hasAttribute('data-pl')) return;
    загл.setAttribute('data-pl', '1');
    let а = данни().find(x => x && x.id === window._blCurArt) || null;
    if (а && а.title !== загл.textContent) а = статия(загл.textContent);   // за всеки случай — по заглавие

    // сцената (реф. 11): облак + медальон с рисунката на рафта + бебето на луната; емоджито — значка
    const ем = тяло.querySelector(':scope > .art-emoji');
    if (ем) {
      const сц = document.createElement('span');
      сц.className = 'pl-sa-stage';
      сц.setAttribute('aria-hidden', 'true');                  // декоративно; заглавието е под него
      const мед = document.createElement('span');
      мед.className = 'pl-sa-medal';
      рисунка(мед, а);
      тяло.insertBefore(сц, ем);
      сц.appendChild(мед);
      мед.appendChild(ем);
    }
    // рафтът като хапче в реда с етикетите (там е и „⏱️ N мин четене“ на articles.js)
    const ред = тяло.querySelector(':scope > .art-tagrow');
    const раф = а && а.cat ? безЗнак(а.cat) : '';
    if (ред && раф && раф !== а.room) {
      const х = document.createElement('span');
      х.className = 'art-tag pl-sa-cat';
      х.textContent = а.cat;
      ред.insertBefore(х, ред.firstChild);
    }
    // 🚨 подзаглавията („🚨 Кога да потърсиш лекар“) — червени, не розови като другите
    тяло.querySelectorAll(':scope > h5').forEach(h => { if ((h.textContent || '').indexOf('🚨') >= 0) h.classList.add('pl-sa-sos'); });
    // ⚠️/⛔ редовете — предупреждения: кехлибарена кутия (ПО-видими, не по-меки);
    // ✅ редовете — важните съвети: мека розова кутия. 🚨 редът вече е .art-warn (articles.js:306).
    тяло.querySelectorAll(':scope > p:not([class])').forEach(p => {
      const т = (p.textContent || '').trim();
      if (/^(⚠|⛔|🚫|🔴)/u.test(т)) p.classList.add('pl-sa-caution');
      else if (/^✅/u.test(т)) p.classList.add('pl-sa-key');
    });
    // точка, която започва с емоджи (✅ ⛔ ⚠️ 🚨 …) — емоджито Е точката, розовата се маха
    тяло.querySelectorAll(':scope > ul > li').forEach(li => {
      const т = (li.textContent || '').trim();
      if (ЕМОДЖИ_ОТПРЕД.test(т)) li.classList.add('pl-sa-emo');
      if (т.indexOf('🚨') === 0) li.classList.add('pl-sa-sos');
    });
  }

  // 🪤 таймер, не requestAnimationFrame (спира, когато страницата не се рисува)
  let чакаС = false, всичкиС = false;
  function отложиСписък(всички) {
    if (всички) всичкиС = true;
    if (чакаС) return;
    чакаС = true;
    setTimeout(() => { чакаС = false; const в = всичкиС; всичкиС = false; try { списък(в); } catch (e) {} }, 40);
  }
  let чакаЧ = false;
  function отложиЧетец() {
    if (чакаЧ) return;
    чакаЧ = true;
    setTimeout(() => { чакаЧ = false; try { четец(); } catch (e) {} }, 40);
  }

  function върви() {
    // #roomOverlay е статичен (#roRoom се сменя, #roArticles — не, но гледаме от статичния корен).
    // Само childList: нашите класове са атрибути и НЕ ни викат обратно; нашите вмъквания
    // ни викат веднъж и не намират нищо ново (data-pl, текст без разлика) → край.
    const ов = document.getElementById('roomOverlay');
    if (ов) new MutationObserver(записи => {
      for (const з of записи) {
        const ц = з.target;
        if (ц && ц.nodeType === 1 && (ц.id === 'roArticles' || ц.closest('#roArticles'))) { отложиСписък(false); return; }
      }
    }).observe(ов, { childList: true, subtree: true });
    // четецът: тялото се сменя изцяло (childList на #artBody), а затварянето е атрибутът hidden
    const тяло = document.getElementById('artBody');
    if (тяло) new MutationObserver(отложиЧетец).observe(тяло, { childList: true });
    const арт = document.getElementById('artOverlay');
    if (арт) new MutationObserver(() => { if (арт.hidden) отложиСписък(true); else отложиЧетец(); })
      .observe(арт, { attributes: true, attributeFilter: ['hidden'] });
    списък(true);
    четец();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  // 21.10: + РАФТ/ТОН/статия за блока 21.10 по-долу (плюшът на „Виж също“). Беше: { списък, четец }
  window.BL_PL_STATII = { списък, четец, РАФТ, ТОН, статия };
})();

/* 21.10 · ЗНАЦИТЕ В СТАТИИТЕ — плюш вместо голо емоджи, иконки в главата, пълното заглавие в стрелките
   (агентът st21; мерено dev/proba/sm21_plan.js + sm21_mer.js, снимки snimki/sm21_pL_* / sm21_pD_*):
     · стикерът на картата (.art-cemoji, articles.js:544) беше системно емоджи (💩 😴 🧿) — js/pl-plyush.js
       не гледа #roArticles. Сега: познатото емоджи → клетката от листовете (същата таблица BL_PL_PLYUSH.К,
       същото облекло като стил() там); непознатото (337 от 1615 статии, sm21_emo.js) → стикерът се скрива,
       остава арката на рафта (плюш). Текстът на картата НЕ се пипа.
     · „Виж също“ (.art-relb), „Питай помощничката“ (.art-ask), 🚨 в 112 (.art-112) — бутони/връзка, които
       pl-plyush не обвива: емоджито отива в span.pl-em (textContent байт в байт същият) → плюш; непознатото
       в „Виж също“ взима рисунката на рафта на ТАЗИ статия (както картата ѝ в списъка).
     · 📎 до „Виж също“ и ℹ️ в бележката долу — линейни знаци (CSS), емоджито остава в текста, прозрачно.
     · 🔊/⏹, 📤/✔, ☆/⭐ в главата (articles.js:337–363, reader.js:75,166) — data-pl-sa-ik по текста →
       CSS рисува линейна иконка; aria-label-ите са си на тях. Състоянието следим с наблюдател.
     · стрелките към съседната статия (reader.js:115–124) режеха заглавието на 22 знака („какв…“) — сега
       „Предишна/Следваща статия“ + пълното заглавие (кликът е closure в reader.js — текстът не му трябва).
   ПЪТ НАЗАД: махни този блок (до „край 21.10“) и върни реда window.BL_PL_STATII = { списък, четец }. */
(function () {
  'use strict';
  if (window.BL_PL_STATII21) return;
  const ТОН = { p: '#fde6ef', s: '#dfeafb', m: '#dff2e7', l: '#ece4f8', b: '#fff0d4', c: '#fde5d8' };
  // листовете на РАФТ (pl-statii.js горе) → файла
  const ЛИСТ_РАФТ = { a: 'ico-a', b: 'ico-b', c: 'ico-c', d: 'ico-d', e: 'ico-e', f: 'ico-f', g: 'ico-g', h: 'ico-h', t: 'statii-t', x: 'fig-a' };
  const ЕМ = /\p{Extended_Pictographic}(?:\u{FE0F}|\u{200D}\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u{FE0F}\u{20E3})*/u;
  const ПРЕДНО = /^(\s*)(\p{Extended_Pictographic}(?:\u{FE0F}|\u{200D}\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u{FE0F}\u{20E3})*)/u;
  const П = () => window.BL_PL_PLYUSH || null;
  const безЗнак = т => String(т || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();

  function рис(з) {
    const п = П(); if (!п || !п.К || !з) return null;
    if (п.К[з]) return п.К[з];
    const без = з.split('️').join('');
    return п.К[без] || п.К[без + '️'] || null;
  }
  // облеклото е същото като стил() в js/pl-plyush.js: клетка, пастел, прозрачен знак
  function плюш(е, лист, ред, кол, тон, двуредов) {
    const y = двуредов ? ред * 100 : ред * 100 / 3;
    е.style.setProperty('background-image', 'url(img/art/' + лист + '.webp)', 'important');
    е.style.setProperty('background-position', (кол * 100 / 3).toFixed(3) + '% ' + y.toFixed(3) + '%', 'important');
    е.style.setProperty('background-size', двуредов ? '400% 200%' : '400% 400%', 'important');
    е.style.setProperty('color', 'transparent', 'important');
    е.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
    е.style.setProperty('--pl-plt', ТОН[тон] || ТОН.p);
    е.classList.add('pl-pl', двуредов ? 'pl-pl-x' : 'pl-pl-i');
    е.dataset.plPl = '1';                                  // pl-plyush.js вече не го пипа
  }
  function плюшЕмоджи(е, з) {
    const р = рис(з), п = П();
    if (!р || !п || !п.ЛИСТ[р[0]]) return false;
    плюш(е, п.ЛИСТ[р[0]], р[1], р[2], р[3], !!(п.ДВЕРЕДНИ && п.ДВЕРЕДНИ[р[0]]));
    return true;
  }
  function плюшРафт(е, а) {
    const Р = window.BL_PL_STATII && BL_PL_STATII.РАФТ;
    const р = Р && а && а.cat ? Р[безЗнак(а.cat)] : null;
    if (!р || !ЛИСТ_РАФТ[р[0]]) return false;
    плюш(е, ЛИСТ_РАФТ[р[0]], р[1], р[2], р[3], р[0] === 'x');
    return true;
  }
  // първото емоджи в СОБСТВЕН текстов възел → span (textContent остава байт в байт; при разлика — връщане)
  function обвий(б, клас, самоОтпред) {
    const наличен = б.querySelector(':scope > .' + клас.split(' ')[0]);
    if (наличен) return наличен;
    const преди = б.textContent;
    for (let в = б.firstChild; в; в = в.nextSibling) {
      if (в.nodeType !== 3 || !в.nodeValue) continue;
      const м = самоОтпред ? в.nodeValue.match(ПРЕДНО) : в.nodeValue.match(ЕМ);
      if (!м) { if (самоОтпред && в.nodeValue.trim()) return null; continue; }
      const зн = самоОтпред ? м[2] : м[0];
      const от = самоОтпред ? м[1].length : м.index;
      const сл = в.splitText(от);
      сл.nodeValue = сл.nodeValue.slice(зн.length);
      const с = document.createElement('span');
      с.className = клас; с.setAttribute('aria-hidden', 'true'); с.textContent = зн;
      б.insertBefore(с, сл);
      if (б.textContent !== преди) { б.replaceChild(document.createTextNode(зн), с); б.normalize(); return null; }
      return с;
    }
    return null;
  }

  // ── РАФТЪТ: стикерите на картите ──
  function карти() {
    document.querySelectorAll('#roArticles .art-card > .art-cemoji:not([data-pl-sa21])').forEach(е => {
      е.setAttribute('data-pl-sa21', '1');
      const м = (е.textContent || '').trim().match(ЕМ);
      if (!(м && плюшЕмоджи(е, м[0]))) { е.classList.add('pl-sa-bez'); return; }
      // същата рисунка като арката (напр. 🧿 и рафтът „Бабини деветини“ — една клетка) → стикерът е повтор
      const к = е.parentElement;
      const лист = (к.className.match(/\bpl-sa-([a-hxt])\b/) || [])[1];
      const числа = т => (String(т).match(/-?[\d.]+/g) || []).map(Number);   // „0.000% 100.000%“ и „0% 100%“ са едно и също
      const а1 = числа(к.style.getPropertyValue('--pl-sa-pos')), а2 = числа(е.style.getPropertyValue('background-position'));
      if (лист && а1.length === 2 && а2.length === 2 && Math.abs(а1[0] - а2[0]) < .5 && Math.abs(а1[1] - а2[1]) < .5 &&
          е.style.getPropertyValue('background-image').indexOf('/' + ЛИСТ_РАФТ[лист] + '.webp') >= 0) е.classList.add('pl-sa-bez');
    });
  }

  // ── ЧЕТЕЦЪТ ──
  const ИК = { '🔊': 'spk', '⏹': 'stop', '⏹️': 'stop', '📤': 'share', '✔': 'ok', '✔️': 'ok', '☆': 'star', '⭐': 'star-on' };
  function глава() {
    ['artSpeak', 'artShare', 'artStar'].forEach(id => {
      const б = document.getElementById(id); if (!б) return;
      const ик = ИК[(б.textContent || '').trim()] || '';
      if (ик && б.getAttribute('data-pl-sa-ik') !== ик) б.setAttribute('data-pl-sa-ik', ик);
      else if (!ик && б.hasAttribute('data-pl-sa-ik')) б.removeAttribute('data-pl-sa-ik');   // непознат знак → видим текст
    });
  }
  function съседна(т) {
    // reader.js: '‹ ' + emoji + ' ' + кратко(title)  /  emoji + ' ' + кратко(title) + ' ›'; кратко = 22 знака + „…“
    const назад = /^‹\s/.test(т), напред = /\s›$/.test(т);
    if (!назад && !напред) return null;
    let с = т.replace(/^‹\s+/, '').replace(/\s+›$/, '');
    const м = с.match(ПРЕДНО);
    const ем = м ? м[2] : '';
    с = с.slice(м ? м[0].length : 0).trim();
    const кр = с.replace(/…$/, '');
    const текуща = (window.BL_ARTICLES_DATA || []).find(x => x && x.id === window._blCurArt);
    const кандидати = (window.BL_ARTICLES_DATA || []).filter(x => x && typeof x.title === 'string' && x.title.slice(0, кр.length) === кр && (!ем || x.emoji === ем));
    const а = кандидати.find(x => текуща && x.room === текуща.room) || кандидати[0] || null;
    return { назад, ем, загл: а ? а.title : с, а };
  }
  function тяло() {
    const т = document.getElementById('artBody'); if (!т) return;
    // „Виж също“: емоджито на всяка статия → плюш; непознатото → рисунката на рафта ѝ
    т.querySelectorAll('.art-relb:not([data-pl-sa21])').forEach(б => {
      б.setAttribute('data-pl-sa21', '1');
      const с = обвий(б, 'pl-em pl-sa-ik', true); if (!с) return;
      const а = (window.BL_ARTICLES_DATA || []).find(x => x && x.id === б.getAttribute('data-rel'));
      if (!плюшЕмоджи(с, с.textContent) && !плюшРафт(с, а)) с.classList.add('pl-sa-bez');
    });
    т.querySelectorAll('.art-relt:not([data-pl-sa21])').forEach(з => { з.setAttribute('data-pl-sa21', '1'); обвий(з, 'pl-sa-clip', false); });
    т.querySelectorAll('.art-ask:not([data-pl-sa21])').forEach(б => {
      б.setAttribute('data-pl-sa21', '1');
      const с = обвий(б, 'pl-em pl-sa-ik', true); if (с && !плюшЕмоджи(с, с.textContent)) с.classList.add('pl-sa-bez');
    });
    т.querySelectorAll('.art-112:not([data-pl-sa21])').forEach(б => {
      б.setAttribute('data-pl-sa21', '1');
      const с = обвий(б, 'pl-em pl-sa-ik', true); if (с && !плюшЕмоджи(с, с.textContent)) с.classList.add('pl-sa-bez');
    });
    // подзаглавията (h5 — pl-plyush обвива само p/li/h2–h4) и бутоните на съдържанието (.art-toc-b):
    //   познатото емоджи → плюш; непознатото остава както е (връщане на текста)
    т.querySelectorAll(':scope > h5:not([data-pl-sa21]), .art-toc-b:not([data-pl-sa21])').forEach(е => {
      е.setAttribute('data-pl-sa21', '1');
      const с = обвий(е, 'pl-em pl-sa-ik', е.tagName !== 'H5');
      if (с && !плюшЕмоджи(с, с.textContent)) { const р = с.parentNode; р.replaceChild(document.createTextNode(с.textContent), с); р.normalize(); }
    });
    // „📑 В тази статия“ — линеен знак „списък“ (📑 няма плюш в картата)
    т.querySelectorAll('.art-toc-h:not([data-pl-sa21])').forEach(е => { е.setAttribute('data-pl-sa21', '1'); обвий(е, 'pl-sa-toc', true); });
    // стрелките: икона + „Предишна/Следваща статия“ + пълното заглавие
    т.querySelectorAll('.art-navb:not([data-pl-sa21])').forEach(б => {
      б.setAttribute('data-pl-sa21', '1');
      const и = съседна((б.textContent || '').trim()); if (!и) return;
      б.textContent = '';
      б.classList.add('pl-sa-nvb');
      const ик = document.createElement('span'); ик.className = 'pl-em pl-sa-ik'; ик.setAttribute('aria-hidden', 'true'); ик.textContent = и.ем || '';
      if (!(и.ем && плюшЕмоджи(ик, и.ем)) && !плюшРафт(ик, и.а)) ик.classList.add('pl-sa-bez');
      const тх = document.createElement('span'); тх.className = 'pl-sa-nv';
      const м = document.createElement('small'); м.textContent = и.назад ? 'Предишна статия' : 'Следваща статия';
      const з = document.createElement('b'); з.textContent = и.загл;
      тх.appendChild(м); тх.appendChild(з);
      б.appendChild(ик); б.appendChild(тх);
    });
  }
  // 🪤 #artDisc е един и същ <p>; articles.js:402 сменя textContent при всяка статия (и така маха span-а) —
  //   затова без постоянен флаг: обвива се, щом няма .pl-sa-info (обвий() сам проверява)
  function бележка() {
    const д = document.querySelector('#artOverlay .art-disc');
    if (д && д.firstChild) обвий(д, 'pl-sa-info', true);
  }

  let чака = false;
  function сверка() {
    if (чака) return; чака = true;
    setTimeout(() => { чака = false; try { карти(); глава(); тяло(); бележка(); } catch (e) {} }, 50);
  }
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (ов) new MutationObserver(записи => { for (const з of записи) { const ц = з.target; if (ц && ц.nodeType === 1 && (ц.id === 'roArticles' || ц.closest('#roArticles'))) { сверка(); return; } } })
      .observe(ов, { childList: true, subtree: true });
    const арт = document.getElementById('artOverlay');
    if (арт) new MutationObserver(сверка).observe(арт, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    сверка();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_STATII21 = { сверка, съседна };
})();
/* край 21.10 */

/* ═══════════════════════════════════════════════════════════════════════════════
   22.10 · ЗНАНИЕТО НА ЕДИН ДОПИР — „Тази седмица“ (Бременност), „Този месец“ (Развитие и игри),
   „След раждането“ (Жената в мен)
   Новите карти на базата (js/kb.js → KB.entries: zn7a/zn7b-sedmica-*, zn8a-mesec-*, zn8b-*,
   zn7a-sled-razhdane-*) се виждаха само в чата. Тук е ЕДНАТА им рисунка; стаите (pl-bremennost.js,
   pl-igri.js, pl-zamama.js) казват само КОЯ карта и с какъв етикет:
     · заглавието — частта след „:“ е голямото заглавие (числото е в медальона, етикетът — над него);
     · началото на core — цели изречения до ~240 знака (1–3): думите са на картата, тук няма нито едно;
     · „Прочети цялото“ → статията ѝ (полето lib), по пътя на рафта: BL_LIB.init() → BL_ARTICLES.open
       (както lab.js:476). Няма ли статия или библиотеката не дойде — останалото от картата се разгръща
       на място, без прозорец; второ докосване го прибира.
   Няма ли картата в KB (вливат се на части) → null: стаята не рисува нищо — без грешка, без празна кутия.
   Нищо не записва. Материалите са общите (.pl-felt, .pl-soft), видът — css/pl-ui.css § 16.
   ПЪТ НАЗАД: махни този блок (до „край 22.10“) — стаите питат за window.BL_PL_ZN и без него мълчат.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_ZN) return;
  const esc = т => String(т == null ? '' : т).replace(/[&<>"']/g, з => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[з]));

  // ── коя карта: id-тата са на картите на главната сесия (dev/nahodki/karti_zn7a, 7b, 8a, 8b) ──
  const ИД = {
    // 1–4 е една карта, после по двойки 5-6 … 41-42 (до 19-20 са zn7a, от 21-22 — zn7b)
    седмица(w) {
      if (!(w >= 1 && w <= 42)) return null;
      if (w <= 4) return 'zn7a-sedmica-1-4';
      const от = w % 2 ? w : w - 1;
      return (от <= 19 ? 'zn7a' : 'zn7b') + '-sedmica-' + от + '-' + (от + 1);
    },
    // цели месеци (ym от BL_AGE): 0–11 по месец, 12 годинка, после етапите до 6 години
    месец(м) {
      if (!(м >= 0) || м >= 72) return null;
      if (м < 12) return 'zn8a-mesec-' + Math.floor(м);
      if (м < 13) return 'zn8b-godinka';
      if (м < 16) return 'zn8b-13-15-meseca';
      if (м < 19) return 'zn8b-16-18-meseca';
      if (м < 24) return 'zn8b-19-24-meseca';
      const г = Math.floor(м / 12);
      return 'zn8b-' + г + '-' + (г + 1) + '-godini';
    },
    // дни от раждането: 1-ва седмица, 2-ра, 3–4, 5–6
    следРаждане(д) {
      if (!(д >= 0) || д >= 42) return null;
      return 'zn7a-sled-razhdane-' + (д < 7 ? '1' : д < 14 ? '2' : д < 28 ? '3-4' : '5-6');
    }
  };

  // помним само НАМЕРЕНИТЕ: „няма я“ се пита наново (~1900 записа — под милисекунда), за да се появи
  //   картата, ако базата се долее, докато страницата е отворена
  const пам = new Map();
  function запис(ид) {
    if (!ид) return null;
    if (пам.has(ид)) return пам.get(ид);
    const К = window.KB || window.BL_KB;
    if (!К || !Array.isArray(К.entries)) return null;
    const е = К.entries.find(х => х && х.id === ид);
    if (!е || !е.title || !е.core) return null;
    пам.set(ид, е);
    return е;
  }

  // ── изреченията: край е . ! ? … и главна буква (или „ « () след интервала; съкращенията не режат ──
  //   Цифра след точката НЕ започва изречение („ок. 3 см“) — по-добре две слепени, отколкото разрязано.
  const СЪКР = /(?:^|[\s(„])(?:напр|т\.е|т\.нар|т\.н|вкл|ок|д-р|проф|бл|чл|ал)\.$/i;
  function изречения(т) {
    const s = String(т || '').replace(/\s+/g, ' ').trim();
    const out = []; let от = 0, м;
    const re = /[.!?…]+[“”»")]*\s+(?=[„"«(А-ЯA-Z])/g;
    while ((м = re.exec(s))) {
      if (СЪКР.test(s.slice(от, м.index + 1))) continue;
      out.push(s.slice(от, м.index + м[0].trimEnd().length).trim());
      от = м.index + м[0].length;
    }
    if (от < s.length) out.push(s.slice(от).trim());
    return out.filter(Boolean);
  }
  // мерено върху 44-те карти (dev/nahodki/karti_zn7a/7b/8a/8b): първите 2 изречения са 170–441 знака.
  //   На живо (375 px) 263 знака = 7 реда — тежко. С прага 240: 1/2/3 изречения в 14/25/5 карти,
  //   медиана 192 знака ≈ 5 реда; дългото изречение-списък („на 9 месеца…“, 332) стои само.
  //   23.10: начало под 120 знака („Между две и три години…“ — 74) е тъничко → взима още едно, ако общо остава ≤ ТАВАН.
  //   ТАВАН 250, не 300: на живо 283 знака („след термина“) = 8 реда; 232 = 6 реда (375 px).
  const ПРАГ = 240, КЪСО = 120, ТАВАН = 250;
  function колко(и) {
    let n = 1, дълж = (и[0] || '').length;
    while (n < 3 && n < и.length && дълж + 1 + и[n].length <= ПРАГ) { дълж += 1 + и[n].length; n++; }
    if (дълж < КЪСО && n < и.length && дълж + 1 + и[n].length <= ТАВАН) n++;
    return n;
  }
  // 23.10 · на живо: „на 9 месеца…“ е ЕДНО изречение-списък от 332 знака = 8 реда на 375 px — стена.
  //   Над ТАВАН-а показваме до последната запетая преди 220 знака + „…“; при разгръщане на място — цялото.
  function начало(и) {
    const n = колко(и), цяло = и.slice(0, n).join(' ');
    let кратко = цяло;
    if (цяло.length > ТАВАН) { const з = цяло.lastIndexOf(', ', 220); if (з > КЪСО) кратко = цяло.slice(0, з) + '…'; }
    return { n, цяло, кратко };
  }
  // главната буква е първата БУКВА — „„ма-ма-ма“ и стеснение“ → „„Ма-ма-ма“ и стеснение“ (23.10, две заглавия)
  const главна = т => т ? т.replace(/^([„"«(\s]*)(\p{L})/u, (_, п, б) => п + б.toUpperCase()) : т;
  const СТРЕЛКА = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let брой = 0;

  // ── о = { ид, етикет, число, мярка, четец?, бележка?, клас? } → <article> или null ──
  function карта(о) {
    const з = запис(о && о.ид);
    if (!з) return null;
    const изр = изречения(з.core);
    if (!изр.length) return null;
    const нач = начало(изр), n = нач.n;
    const ч = String(з.title).split(/:\s+/);
    const загл = ч.length > 1 ? главна(ч.slice(1).join(': ')) : String(з.title);
    const hid = 'plZn' + (++брой);
    const к = document.createElement('article');
    к.className = 'pl-zn pl-felt' + (о.клас ? ' ' + о.клас : '');
    к.setAttribute('data-zn', з.id);
    к.setAttribute('aria-labelledby', hid);
    к.innerHTML =
      '<div class="pl-zn-top">' +
        '<span class="pl-zn-medal" aria-hidden="true"><b>' + esc(о.число) + '</b><small>' + esc(о.мярка) + '</small></span>' +
        '<div class="pl-zn-hd">' +
          '<small class="pl-zn-eye">' + esc(о.етикет) + (о.четец ? '<span class="pl-zn-sr"> · ' + esc(о.четец) + '</span>' : '') + '</small>' +
          '<h3 class="pl-zn-t" id="' + hid + '">' + esc(загл) + '</h3>' +
          (о.бележка ? '<em class="pl-zn-note">' + esc(о.бележка) + '</em>' : '') +
        '</div>' +
      '</div>' +
      '<p class="pl-zn-txt">' + esc(нач.кратко) + '</p>' +
      '<div class="pl-zn-more" hidden></div>' +
      '<button type="button" class="pl-zn-go pl-soft"><span>Прочети цялото</span>' + СТРЕЛКА + '<span class="pl-zn-sr">: ' + esc(загл) + '</span></button>';
    const б = к.querySelector('.pl-zn-go');
    // делегираните слушания на блоковете (pl-br, pl-ig, pl-zm) не познават бутона — минава през тях без действие
    б.addEventListener('click', () => {
      if (window.BL_FX && BL_FX.buzz) BL_FX.buzz(6);
      if (б.getAttribute('aria-expanded') === 'true') { сгъни(к, б, нач.кратко); return; }
      const lib = Array.isArray(з.lib) ? з.lib[0] : з.lib;
      const има = () => !!lib && (window.BL_ARTICLES_DATA || []).some(х => х && х.id === lib);
      const пусни = () => {
        if (има() && window.BL_ARTICLES && BL_ARTICLES.open) BL_ARTICLES.open(lib);
        else разгъни(к, б, з, изр.slice(n), нач.цяло);
      };
      if (lib && window.BL_LIB && BL_LIB.init) BL_LIB.init().then(пусни, пусни).catch(е => console.error('[pl-zn] статията не се отвори', е));
      else пусни();
    });
    return к;
  }

  // ── без статия: останалото от картата — на място, по две изречения на абзац, съветът отделно ──
  function разгъни(к, б, з, ост, цяло) {
    const м = к.querySelector('.pl-zn-more');
    if (!м) return;
    if (!м.childElementCount) {
      let h = '';
      for (let i = 0; i < ост.length; i += 2) h += '<p>' + esc(ост.slice(i, i + 2).join(' ')) + '</p>';
      if (з.tip) h += '<p class="pl-zn-tip">' + esc(з.tip) + '</p>';
      if (!h && !цяло) return;
      м.innerHTML = h;
    }
    const т = к.querySelector('.pl-zn-txt');
    if (т && цяло && т.textContent !== цяло) т.textContent = цяло;       // отрязаното начало — цялото
    м.hidden = false;
    б.setAttribute('aria-expanded', 'true');
    б.firstChild.textContent = 'Прибери';
  }
  function сгъни(к, б, кратко) {
    const м = к.querySelector('.pl-zn-more');
    if (м) м.hidden = true;
    const т = к.querySelector('.pl-zn-txt');
    if (т && кратко && т.textContent !== кратко) т.textContent = кратко;
    б.setAttribute('aria-expanded', 'false');
    б.firstChild.textContent = 'Прочети цялото';
  }

  // колко/начало/главна са навън за пробата (тя вика ТОЗИ код, не свое копие)
  window.BL_PL_ZN = { ид: ИД, има: ид => !!запис(ид), запис, карта, изречения, колко, начало, главна };
})();
/* край 22.10 */
