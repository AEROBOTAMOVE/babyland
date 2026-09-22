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
  function списък(всички) {
    const кон = document.getElementById('roArticles');
    if (!кон || !кон.firstChild) return;                        // още не е строен (helper.js строи при първо показване)
    прозорец(кон);
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
  window.BL_PL_STATII = { списък, четец };
})();
