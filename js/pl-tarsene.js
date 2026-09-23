/* ═══════════════════════════════════════════════════════════════════════════════
   🔎 PREMIUM ТЪРСЕНЕ · „Какво търсим днес?“ (22.09.2026 — реф. 9 на собственика)
   Екранът е на js/search.js: #searchTrigger (index.html:274) → BL_SEARCH.open() (search.js:355);
   search.js рисува #searchResults наново при ВСЕКИ клавиш (draw, search.js:281 — innerHTML = '').
   Тук НЕ се пипа нито една стара логика — само облекло:
     · заглавието „Какво търсим днес?“ в „подвързия“ над листа (h2.pl-ts-title.pl-felt);
     · листът = .pl-felt (pl-ui.css); лентата, полето, 🎤 и ✕ остават СЪЩИТЕ елементи;
     · филтрите — от РЕАЛНИТЕ групи, които search() смесва (search.js:120–129): отговорът на
       балончето, статии, храни, инструменти (SHORTCUTS), речник. Когато видът е само един (напр.
       „сън“ = 18 статии), хапчетата стават СТАИТЕ на резултатите — пак реално поле (r.sub/r.room).
       Филтърът само СКРИВА редове (data-pl-ts-off); редовете, реда и кликовете са на search.js;
     · всеки ред получава арката на стаята си (img/art/room-*.webp) с емоджито като стикер;
       подредът „📄 Статия · Моето бебе“ става „Моето бебе · статия“ (само подредба на същите думи);
     · „Наскоро търсени“: при празно поле search.js вече ги показва (search.js:190) — само им се
       сменя облеклото; при написано се добавят най-долу от СЪЩИЯ ключ bl_search_hist
       (search.js:176, 329 — масив от низове, тежките се пресяват с BL_MOTHERFLAG както в :178);
       докосване = стойност в полето + събитие 'input' → слушателят на search.js:364 рисува;
     · 112 горе вдясно — <a href="tel:112">, видимо през цялото време, докато търсенето е отворено.
   🪤 Всяко писане в DOM е мутация → пише се САМО при разлика и обработеното се маркира (data-pl-ts);
     вторият проход не пише нищо, значи кръгът спира сам (мерено: 0 мутации за 3 с покой).
   🪤 Облеклото става В СЪЩИЯ микро-такт (обратното извикване на MutationObserver), не с таймер —
     иначе всеки клавиш би показвал за миг стария вид на редовете.
   ПЪТ НАЗАД: махни <link href="css/pl-tarsene.css"> и <script src="js/pl-tarsene.js"> от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_TARSENE) return;

  // стаите — същите имена като MamaHelper.open / search.js; рисунките — premium-home.js:13
  const СТАИ = {
    'Бременност': ['preg', 'Бременност'],
    'Моето бебе': ['baby', 'Моето бебе'],
    'Захранване': ['feed', 'Захранване'],
    'Здраве и SOS': ['health', 'Здраве'],
    'Дневник на мама': ['diary', 'Дневник'],
    'Развитие и игри': ['play', 'Игри'],
    'Инструменти': ['tools', 'Инструменти'],
    'Жената в мен': ['mom', 'За мама'],
    'Лабораторията': ['lab', 'Лаборатория']
  };
  const ВИДОВЕ = { help: 'Отговор', art: 'Статии', tool: 'Инструменти', food: 'Храни', dict: 'Речник' };
  const ЕДНО = { art: 'статия', tool: 'инструмент', food: 'храна', dict: 'речник' };
  const ЕМ = /^(\s*)(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*)/u;

  const чети = (к, по) => { try { const v = JSON.parse(localStorage.getItem(к)); return v == null ? по : v; } catch (e) { return по; } };   // = lsGet, search.js:7
  const клас = (е, к) => { if (е && !е.classList.contains(к)) е.classList.add(к); };
  const атр = (е, и, с) => { if (с == null) { if (е.hasAttribute(и)) е.removeAttribute(и); } else if (е.getAttribute(и) !== с) е.setAttribute(и, с); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, м => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[м]));

  // ── видът и стаята на реда — от подреда, който search.js:344 пише ──
  //   статия: „📄 Статия · <стая>“ · храна: „Храна · от N м.“ (стая Захранване, search.js:124)
  //   речник: „Речник на мама 📖“ (стая Инструменти, search.js:128) · инструмент: „<стая>“ (search.js:126)
  function разчети(под) {
    let м = под.match(/Статия\s*·\s*(.+)$/);
    if (м) return { в: 'art', стая: м[1].trim(), още: '' };
    м = под.match(/^Храна\s*·\s*(.+)$/);
    if (м) return { в: 'food', стая: 'Захранване', още: м[1].trim() };
    if (/^Речник на мама/.test(под)) return { в: 'dict', стая: 'Инструменти', още: '' };
    return { в: 'tool', стая: под.trim(), още: '' };
  }

  // ── един ред: арка + стикер, подред „стая · вид“, маркер ──
  function ред(б) {
    if (б.hasAttribute('data-pl-ts')) return;
    const под = б.querySelector('.sr-sub'), ем = б.querySelector('.sr-e');
    if (!под) return;
    const р = разчети(под.textContent);
    const с = СТАИ[р.стая];
    атр(б, 'data-pl-ts-k', р.в);
    атр(б, 'data-pl-ts-r', с ? с[0] : 'x');
    const арка = document.createElement('span');
    арка.className = 'pl-ts-arch';
    арка.setAttribute('aria-hidden', 'true');
    // 🪤 url() от JS е спрямо СТРАНИЦАТА → img/…, не ../img/…
    if (с) арка.style.backgroundImage = 'url("img/art/room-' + с[0] + '.webp")';
    if (ем) арка.appendChild(ем);          // същият възел — емоджито остава в бутона, само на ново място
    б.insertBefore(арка, б.firstChild);
    const вид = ЕДНО[р.в] + (р.още ? ' ' + р.още : '');
    под.innerHTML = '<span class="pl-ts-rm">' + esc(с ? р.стая : (р.стая || 'Бейби Ленд')) + '</span><span class="pl-ts-kd"> · ' + esc(вид) + '</span>';
    б.setAttribute('data-pl-ts', '1');
  }

  // ── емоджито в началото на хапче → кремав кръг (.pl-em, pl-ui.css раздел 7); textContent остава същият ──
  function стикер(б) {
    if (б.querySelector(':scope > .pl-em')) return;
    const п = б.firstChild;
    if (!п || п.nodeType !== 3) return;
    const м = п.nodeValue.match(ЕМ);
    if (!м) return;
    const с = document.createElement('span');
    с.className = 'pl-em'; с.setAttribute('aria-hidden', 'true'); с.textContent = м[2];
    if (м[1]) б.insertBefore(document.createTextNode(м[1]), п);
    п.nodeValue = п.nodeValue.slice(м[0].length);
    б.insertBefore(с, п);
  }

  // ── поздравът и отговорите (search.js:185, 291) ──
  function балонче(кут) {
    кут.querySelectorAll('.sf-idea').forEach(б => { клас(б, 'pl-soft'); if (!б.classList.contains('sf-forget')) стикер(б); });
    кут.querySelectorAll('.sf-more').forEach(б => клас(б, 'pl-gel'));
    // „Скоро търси:“ (search.js:190) → заглавие „Наскоро търсени“ с часовник (реф. 9)
    кут.querySelectorAll('.sf-lead').forEach(п => {
      const сл = п.nextElementSibling;
      if (сл && сл.querySelector('.sf-recent')) {
        клас(п, 'pl-ts-h');
        if (п.textContent !== 'Наскоро търсени') п.textContent = 'Наскоро търсени';
      }
    });
  }

  // ── „Наскоро търсени“ при написано поле ──
  function скорошни(кут, вход) {
    const има = кут.querySelector(':scope > .pl-ts-recent');
    const сегаQ = (вход.value || '').slice(0, 60);
    const празно = !кут.querySelector('.search-res, .sf-answer') || кут.querySelector('.sf-greet');
    let списък = [];
    if (!празно && !кут.querySelector('.sf-sos')) {
      let и = чети('bl_search_hist', []);
      if (!Array.isArray(и)) и = [];
      и = и.filter(т => typeof т === 'string' && т.trim() && т !== сегаQ);
      if (window.BL_MOTHERFLAG) { try { и = и.filter(т => !BL_MOTHERFLAG(т)); } catch (e) {} }   // search.js:178
      списък = и.slice(-4).reverse();
    }
    const подпис = JSON.stringify(списък);
    if (!списък.length) { if (има) има.remove(); return; }
    if (има && има.getAttribute('data-pl-ts-sig') === подпис && !има.nextElementSibling) return;
    if (има) има.remove();
    const д = document.createElement('div');
    д.className = 'pl-ts-recent';
    д.setAttribute('data-pl-ts-sig', подпис);
    д.innerHTML = '<p class="pl-ts-h">Наскоро търсени</p><div class="pl-ts-rc">' +
      списък.map(т => '<button type="button" class="pl-soft pl-ts-rq" data-q="' + esc(т) + '" aria-label="Търси пак: ' + esc(т) + '"><span>' + esc(т) + '</span></button>').join('') + '</div>';
    кут.appendChild(д);
  }

  // ── филтрите ──
  let избран = 'all';
  function фасети(кут) {
    const редове = [...кут.querySelectorAll('.search-res[data-pl-ts]')];
    const отг = кут.querySelector('.sf-answer:not(.sf-sos)');
    if (кут.querySelector('.sf-sos') || (!редове.length)) return [];
    const видове = {}, стаи = {};
    редове.forEach(б => {
      const в = б.getAttribute('data-pl-ts-k'), с = б.getAttribute('data-pl-ts-r');
      видове[в] = (видове[в] || 0) + 1;
      if (с !== 'x') стаи[с] = (стаи[с] || 0) + 1;
    });
    if (отг) видове.help = 1;
    const ф = [{ к: 'all', т: 'Всичко', н: редове.length + (отг ? 1 : 0) }];
    const кв = Object.keys(ВИДОВЕ).filter(в => видове[в]);
    if (кв.length >= 2) кв.forEach(в => ф.push({ к: 'k:' + в, т: ВИДОВЕ[в], н: видове[в] }));
    else {
      // един вид → стаите (по реда на СТАИ, не по броя — да не скачат при всеки клавиш)
      const кс = Object.keys(СТАИ).map(и => СТАИ[и][0]).filter(с => стаи[с]);
      if (кс.length >= 2) кс.forEach(с => { const и = Object.keys(СТАИ).find(х => СТАИ[х][0] === с); ф.push({ к: 'r:' + с, т: СТАИ[и][1], н: стаи[с], рис: с }); });
    }
    return ф.length > 1 ? ф : [];
  }
  function филтри(лента, кут) {
    const ф = фасети(кут);
    const подпис = ф.map(х => х.к + '=' + х.н).join('|');
    if (!ф.find(х => х.к === избран)) избран = 'all';
    if (лента.getAttribute('data-pl-ts-sig') !== подпис) {
      лента.setAttribute('data-pl-ts-sig', подпис);
      лента.innerHTML = ф.map(х =>
        '<button type="button" class="pl-soft pl-ts-f" data-f="' + х.к + '" aria-pressed="false">' +
        (х.рис ? '<span class="pl-ts-fr" aria-hidden="true" style="background-image:url(&quot;img/art/room-' + х.рис + '.webp&quot;)"></span>'
               : '<span class="pl-ts-fi" aria-hidden="true"></span>') +
        '<span>' + esc(х.т) + '</span></button>').join('');
    }
    атр(лента, 'hidden', ф.length ? null : '');
    лента.querySelectorAll('.pl-ts-f').forEach(б => атр(б, 'aria-pressed', б.getAttribute('data-f') === избран ? 'true' : 'false'));
    // скриване по избора — само атрибут, само при разлика
    const [тип, ст] = избран === 'all' ? ['all', ''] : избран.split(':');
    кут.querySelectorAll('.search-res[data-pl-ts]').forEach(б => {
      const вътре = тип === 'all' || (тип === 'k' ? б.getAttribute('data-pl-ts-k') === ст : б.getAttribute('data-pl-ts-r') === ст);
      атр(б, 'data-pl-ts-off', вътре ? null : '');
    });
    кут.querySelectorAll('.sf-answer:not(.sf-sos)').forEach(а => атр(а, 'data-pl-ts-off', (тип === 'all' || избран === 'k:help') ? null : ''));
    const водещ = кут.querySelector('.sf-found');
    if (водещ) атр(водещ, 'data-pl-ts-off', избран === 'k:help' ? '' : null);
  }

  // ── подсказката в полето ──
  // 🔴 22.09 (независим проверител): search.js:363 пише „напр. „не спи нощем“ или „уморена съм“…“.
  //   Мерено с canvas.measureText със СЪЩИЯ шрифт на ::placeholder (700 15px Nunito): текстът е
  //   309.7px, а мястото в полето е 188px (телефон 390) и 158px (360) → режеше се ПОСРЕД ДУМА:
  //   мама вижда „напр. „не спи нощем“ ил“. Примерите не изчезват — празният екран ги дава като
  //   хапчета („не спи нощем“, „има температура“…, search.js:163–169).
  //   Тук се сменя САМО стойността на атрибута (текстът в search.js остава непипнат) и САМО при
  //   разлика — инак всяко писане е нова мутация. search.js слага своята на DOMContentLoaded,
  //   затова тази се слага и при всяко обличане (отварянето на търсенето е мутация → облечи()).
  //   Мерени кандидати (същия canvas, място 158px при 360): „напр. „не спи нощем“ или „уморена
  //   съм“…“ 309.7 ✘ · „напр. „не спи нощем“…“ 167.8 ✘ · „Пиши ми като на приятелка“ 204.8 ✘ ·
  //   „напр. „не спи нощем““ 157.4 (остават 0.6px — не) · „напр. не спи нощем…“ 155.3 (2.7px) ·
  //   „напр. не спи нощем“ 144.1 ✔ (остават 13.9px при 360 и 43.9px при 390) ← избраното.
  const ПОДСКАЗКА = 'напр. не спи нощем';
  function подсказка() { if (вход && вход.placeholder !== ПОДСКАЗКА) вход.placeholder = ПОДСКАЗКА; }

  // ═══ ОБЛИЧАНЕТО ═══
  let ов = null, панел = null, кут = null, лента = null, вход = null;
  function облечи() {
    if (!ов || !ов.isConnected || ов.hidden) return;
    подсказка();
    кут.querySelectorAll('.search-res:not([data-pl-ts])').forEach(ред);
    балонче(кут);
    скорошни(кут, вход);
    филтри(лента, кут);
  }

  function скелет() {
    ов = document.getElementById('searchOverlay');
    панел = ов && ов.querySelector('.search-panel');
    кут = document.getElementById('searchResults');
    вход = document.getElementById('searchInput');
    if (!ов || !панел || !кут || !вход) return false;
    клас(панел, 'pl-felt');
    if (!панел.querySelector(':scope > .pl-ts-title')) {
      const з = document.createElement('h2');
      з.className = 'pl-ts-title pl-felt';
      з.id = 'plTsTitle';
      з.innerHTML = 'Какво търсим днес?<span class="pl-ts-heart" aria-hidden="true"></span>';
      панел.insertBefore(з, панел.firstChild);
    }
    атр(панел, 'role', 'dialog');
    атр(панел, 'aria-labelledby', 'plTsTitle');
    лента = панел.querySelector(':scope > .pl-ts-filters');
    if (!лента) {
      лента = document.createElement('div');
      лента.className = 'pl-ts-filters';
      лента.setAttribute('role', 'group');
      лента.setAttribute('aria-label', 'Покажи само');
      лента.hidden = true;
      панел.insertBefore(лента, кут);
      лента.addEventListener('click', е => {
        const б = е.target.closest('.pl-ts-f'); if (!б) return;
        избран = б.getAttribute('data-f');
        филтри(лента, кут);
        кут.scrollTop = 0;
      });
    }
    if (!ов.querySelector(':scope > .pl-ts-112')) {
      const а = document.createElement('a');
      а.className = 'pl-ts-112';
      а.href = 'tel:112';
      а.setAttribute('aria-label', 'Спешна помощ — обади се на 112');
      а.textContent = '112';
      ов.appendChild(а);
    }
    // „Наскоро търсени“ при написано: докосване = същото като писане (слушателят е search.js:364)
    кут.addEventListener('click', е => {
      const б = е.target.closest('.pl-ts-rq'); if (!б) return;
      вход.value = б.getAttribute('data-q') || '';
      вход.dispatchEvent(new Event('input', { bubbles: true }));
      кут.scrollTop = 0;
    });
    атр(ов, 'data-pl-ts', '1');
    return true;
  }

  // ── входът (#searchTrigger): search.js:360 му пише innerHTML на DOMContentLoaded — затова тук се
  //   облича и тогава, и на 'load' (само ако още не е). 💬 отива в <span class="pl-ts-x"> — textContent
  //   остава байт в байт същият; лупата е в CSS. ──
  function облечиВхода() {
    const т = document.getElementById('searchTrigger');
    if (!т) return;
    const п = т.firstChild;
    if (п && п.nodeType === 3) {
      const м = п.nodeValue.match(ЕМ);
      if (м) {
        const с = document.createElement('span');
        с.className = 'pl-ts-x'; с.setAttribute('aria-hidden', 'true'); с.textContent = м[2];
        if (м[1]) т.insertBefore(document.createTextNode(м[1]), п);
        п.nodeValue = п.nodeValue.slice(м[0].length);
        т.insertBefore(с, п);
      }
    }
    атр(т, 'data-pl-ts', '1');
  }

  function върви() {
    облечиВхода();
    // 🪤 search.js пише и входа, и подсказката на DOMContentLoaded — а отложеният скрипт тук върви
    //   ПРЕДИ него. Затова двете се слагат пак след него (неговият слушател е закачен по-рано,
    //   значи и бяга по-рано); подсказката се слага и при всяко обличане.
    const после = () => { облечиВхода(); подсказка(); };
    document.addEventListener('DOMContentLoaded', после);
    window.addEventListener('load', после);
    if (!скелет()) return;
    облечи();
    new MutationObserver(() => облечи())
      .observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    // сцената се затопля на празен ход — иначе на бавен телефон първото отваряне мига с плосък цвят
    const затопли = () => { try { const и = new Image(); и.decoding = 'async'; и.src = 'img/scene/tarsene.webp'; } catch (e) {} };
    if ('requestIdleCallback' in window) requestIdleCallback(затопли, { timeout: 5000 }); else setTimeout(затопли, 3000);
  }
  // 🪤 search.js закача 🎤 с bar.insertBefore(mic, #searchClose) на DOMContentLoaded (search.js:384) —
  //   тук НЕ се мести нито лентата, нито ✕, затова редът на двата скрипта няма значение.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_TARSENE = { облечи, get избран() { return избран; } };
})();
