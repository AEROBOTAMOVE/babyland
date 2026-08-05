// ═══════════════════════════════════════════════════════════
// 🤖 ОДИТ-РОБОТЪТ v2 (план 21) — ЦЯЛАТА АПЛИКАЦИЯ, ОТ ДО
//
// Защо съществува: четири пъти казах „стаята е готова“, защото цъках
// бутони и те се натискаха. Петият път ИЗМЕРИХ пиксели — и намерих
// лепкава лента, чипове извън екрана, 48 цели под пръст, мъртъв бутон.
// Машината лъжеше, защото я питах грешното.
//
// v2 гледа НЕ САМО стаите:
//   🏠 началната · 📱 долната лента · 👤 профилът · 🔍 търсачката
//   🌊 реката · 📔 годишникът · 🆘 СОС · 🧭 картата · 📚 статиите · 💬 чатът
//   🌙 тъмна тема · 📱 360px · ⚡ скорост · 🔁 дублирани id · 🖼️ alt
//
// ⚠️ НЕ СЕ ЗАРЕЖДА в index.html — майките никога не го виждат.
//     await (await fetch('dev/audit.js')).text().then(eval);
//     await BL_AUDIT.run()      // стаите (20 сек)
//     await BL_AUDIT.всичко()   // ЦЯЛАТА апликация (~60 сек)
//
// БЕЗОПАСНОСТ: снима localStorage и го връща. Не пипа бутони с
// „изтрий/принтирай/сподели/tel:“.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS',
    'Развитие и игри', 'Инструменти', 'Дневник на мама', 'Жената в мен', 'Лабораторията'];

  const ОПАСНИ = /🗑|Изтрий|изтрий|✕|Затвори|Принтирай|Листът|PDF|Сподели|📤|tel:|Изход|Играй|🎤|Запиши \(до|Добави снимка|Камера|Огледало|обиколка|Спри|Изчисти|Забрави|Откажи|Пусни|▶|⏸|⏹|›|‹|Инсталирай|Нулирай|Изтегли|Внеси|Заключи|скрий тези/i;
  const МИН_ЦЕЛ = 40;

  const спи = ms => new Promise(r => setTimeout(r, ms));

  // 🚫 СКРИТ ТАБ = НЕВАЛИДЕН ОДИТ (29.07). Два независими проблема наведнъж:
  //    1. браузърът дроселира всеки setTimeout до ~1 сек във фонов таб, така
  //       че одитът пълзи и изглежда „заседнал“ (аз лично го чаках минути,
  //       мислейки, че съм счупил нещо);
  //    2. по-важното — страницата не композира кадри, значи getBoundingClientRect
  //       и getComputedStyle връщат стари или нулеви стойности. Геометрията е
  //       половината от този одит. Числа, мерени така, са ЛЪЖА — а точно този
  //       клас лъжа вече шест пъти ме караше да „поправям“ несъществуващи бъгове.
  //    По-добре откажи, отколкото да излъжеш с таблица от нули.
  function скритЛи() {
    if (!document.hidden) return false;
    const с = '🚫 ОДИТЪТ НЕ ТРЪГВА: разделът е скрит.\n\n' +
      'Във фонов таб браузърът спира кадрите и размерите излизат нулеви или стари —\n' +
      'тоест одитът щеше да ти даде таблица, на която не може да се вярва.\n' +
      'Покажи прозореца/раздела и пусни пак.';
    console.warn(с);
    return с;
  }
  const снимка = () => { const о = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); о[k] = localStorage.getItem(k); } return JSON.stringify(о); };
  const върни = с => { const о = JSON.parse(с); localStorage.clear(); Object.keys(о).forEach(k => localStorage.setItem(k, о[k])); };
  const чисти = () => document.querySelectorAll('#printHolder, .br-overlay:not([hidden]), .bub-overlay:not([hidden]), .md-veil, .np-veil, .rm-veil, .pw-veil, .bo-bar, #rvNote')
    .forEach(x => { try { x.remove(); } catch (e) { x.hidden = true; } });

  function иметоНа(к) {
    const т = к && к.querySelector && к.querySelector('.jr-title');
    if (!т) return '(без заглавие)';
    return [...т.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() || '(без заглавие)';
  }

  // ⚠️ v2.3, ТРЕТИЯТ лъжец: мереше РАЗМЕР ПО ВРЕМЕ НА АНИМАЦИЯТА.
  //   Стаята влиза с roIn (панелът е на scale .96), а картите с rmxDepthInL
  //   (3D наклон по Z). getBoundingClientRect връща размера СЛЕД трансформа,
  //   затова бутон с честни min-height:44px се мереше 39.2, а карта в наклон
  //   „излизаше“ от екрана. Оттам 169 „малки цели“ и 20 „прелели“ — до един
  //   измислени. Мерим в ПОКОЙ: за миг замразяваме анимациите и трансформите.
  function замрази() {
    let st = document.getElementById('blAuditStill');
    if (!st) {
      st = document.createElement('style'); st.id = 'blAuditStill';
      st.textContent = '.bl-still *, .bl-still *::before, .bl-still *::after { animation: none !important; transition: none !important; }' +
        '.bl-still .ro-panel, .bl-still .ro-room, .bl-still .jr-card, .bl-still .sec-chip, .bl-still .mh-bubble { transform: none !important; }';
      document.head.appendChild(st);
    }
    document.documentElement.classList.add('bl-still');
    void document.body.offsetWidth;   // принуди преизчисление, преди да мерим
  }
  function размрази() { document.documentElement.classList.remove('bl-still'); }

  // ═══════════ 📐 ГЕОМЕТРИЯ на ПРОИЗВОЛЕН корен ═══════════
  function геометрия(корен, опции) {
    опции = опции || {};
    if (!корен) return null;
    замрази();
    const Ш = window.innerWidth, В = window.innerHeight;
    // v2.4, петият лъжец: бутон в СГЪНАТА карта (.folded) се мери смачкан
    // (клип-нат на 4px) и влизаше в „малки цели“. Мама първо разгъва картата —
    // тогава той е нормален. Сгънатото не се мери.
    const видим = e => (e.offsetParent !== null || getComputedStyle(e).position === 'fixed') && !e.closest('.jr-card.folded');
    const бутони = [...корен.querySelectorAll('button, a[href], [role="button"]')]
      .filter(b => видим(b) && !b.classList.contains('pin-btn'));

    // ⚠️ v2.3, четвъртият лъжец: „прелелите“ включваха декоративните петна
    //   (.rmx-blob), които стърчат НАРОЧНО — но живеят в .rmx-aurora с
    //   overflow:hidden, тоест са отрязани и мама никога не ги вижда извън
    //   картата. Каквото е в кутия с overflow hidden/clip, не може да прелее.
    const отрязан = e => {
      let p = e.parentElement;
      while (p && p !== document.documentElement) {
        const o = getComputedStyle(p);
        if (/hidden|clip/.test(o.overflow + o.overflowX)) {
          const pr = p.getBoundingClientRect();
          if (pr.right <= Ш + 3 && pr.left >= -3) return true;
        }
        p = p.parentElement;
      }
      return false;
    };
    const прелели = [...корен.querySelectorAll('*')].filter(e => {
      if (!видим(e)) return false;
      const r = e.getBoundingClientRect();
      if (!(r.width > 0 && (r.right > Ш + 3 || r.left < -3))) return false;
      return !отрязан(e);
    }).map(e => ({ ел: (e.tagName + '.' + String(e.className).split(' ')[0]).slice(0, 28), т: (e.textContent || '').trim().slice(0, 24) }));

    const малки = бутони.filter(b => { const r = b.getBoundingClientRect(); return r.height > 0 && r.height < МИН_ЦЕЛ; })
      .map(b => ({ клас: String(b.className).split(' ')[0], т: (b.textContent || '').trim().slice(0, 16), h: Math.round(b.getBoundingClientRect().height) }));

    const безИме = бутони.filter(b => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.title)
      .map(b => String(b.className).slice(0, 26));

    const снимки = [...корен.querySelectorAll('img')].filter(i => видим(i) && !i.hasAttribute('alt')).length;

    const азб = [];
    const ходач = document.createTreeWalker(корен, NodeFilter.SHOW_TEXT);
    let n; while ((n = ходач.nextNode())) {
      const т = n.textContent;
      if (!т || т.length < 3) continue;
      if (/[A-Za-z][А-Яа-я]|[А-Яа-я][A-Za-z]/.test(т) && !/BLW|SIDS|RSV|IgE|PDF|QR|ml|kg|bg-BG|SOS|AES|PIN|Baby|Land/.test(т)) азб.push(т.trim().slice(0, 34));
    }
    размрази();
    return { бутони: бутони.length, прелели, малки, безИме, снимкиБезAlt: снимки, азбуки: [...new Set(азб)].slice(0, 4) };
  }

  // ═══════════ 💀 МЪРТВИ БУТОНИ ═══════════
  // ⚠️ v2.1: първата версия гледаше САМО картата на бутона и обяви 237
  //    бутона за мъртви. Лъжеше: чат-чиповете пишат в ЧАТА, не в картата;
  //    бутоните-навигация мърдат друг край на екрана. Затова сега мерим
  //    целия екран + localStorage + класа на самия бутон.
  //    Мъртъв = НИЩО НИКЪДЕ не помръдва.
  const БЛОКИРАНИ_ОТ_БРАУЗЪРА = /🎤|микрофон|камера/i;   // работят на телефон, не тук
  async function мъртви(корен, лимит) {
    if (!корен) return [];
    const намерени = [];
    // v2.2: четенето на document.body.innerHTML при всеки от 1400 бутона
    //   задръсти браузъра (гигантски низ × 1400). MutationObserver вижда
    //   ВСЯКА промяна — по-точно И стотици пъти по-евтино.
    let мърда = false;
    const око = new MutationObserver(() => { мърда = true; });
    око.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    // ⚠️ v2.3: вторият голям лъжец. Бутоните-скачачи (кътчетата „🥄 Днес на
    //   масата“, съдържанието, картата на стаята) само СКРОЛВАТ — с behavior
    //   'smooth'. Смуут-скролът иска композиране на кадри; в скрит панел (и в
    //   тестова среда) той просто не тече, scrollTop остава 0 и роботът обяви
    //   59 живи бутона за мъртви. Затова слушаме самото ПОВИКВАНЕ на
    //   scrollIntoView/scrollTo — то е доказателство, че бутонът е свършил
    //   работа, независимо дали кадрите се рисуват.
    const истSIV = Element.prototype.scrollIntoView, истST = Element.prototype.scrollTo;
    let скролна = false;
    Element.prototype.scrollIntoView = function () { скролна = true; try { return истSIV.apply(this, arguments); } catch (e) {} };
    Element.prototype.scrollTo = function () { скролна = true; try { return истST.apply(this, arguments); } catch (e) {} };
    // ⚠️ v2.4: бутони, които браузърът-тест блокира, а телефонът изпълнява:
    //   файлов диалог (Коремчето, Фото-лентата), print, share, confirm/prompt.
    //   Кликът им стига до input.click()/window.open — това Е свършена работа.
    let външно = false;
    const истIClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () { if (this.type === 'file') { външно = true; return; } return истIClick.apply(this, arguments); };
    const истACLick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { if (this.download || /^(tel:|blob:|mailto:)/.test(this.href)) { външно = true; return; } return истACLick.apply(this, arguments); };
    const истPrint = window.print; window.print = function () { външно = true; };
    const истOpen = window.open; window.open = function () { външно = true; return null; };
    const истPrompt = window.prompt; window.prompt = function () { външно = true; return null; };
    const истConfirm = window.confirm; window.confirm = function () { външно = true; return false; };
    const истShare = navigator.share; try { navigator.share = function () { външно = true; return Promise.reject(new Error('audit')); }; } catch (e) {}

    const бутони = [...корен.querySelectorAll('button')].filter(b =>
      b.offsetParent !== null && !b.closest('.jr-card.folded') && !b.classList.contains('pin-btn') && !b.closest('.jr-title') &&
      !ОПАСНИ.test(b.textContent) && !ОПАСНИ.test(b.className) &&
      !БЛОКИРАНИ_ОТ_БРАУЗЪРА.test(b.textContent) && !b.disabled).slice(0, лимит || 60);
    for (const б of бутони) {
      const преди = снимка();
      мърда = false; скролна = false; външно = false;
      const скрПреди = [...document.querySelectorAll('.ro-room, .lib-body, body')].map(e => e.scrollTop);
      try { б.click(); } catch (e) {}
      // MutationObserver вижда промяната в СЪЩИЯ кадър — 40ms стигат.
      // При 100ms × 1400 бутона одитът ставаше 3 минути и давеше браузъра.
      await спи(40);
      const писа = снимка() !== преди;
      const мръднаСкрол = скролна || [...document.querySelectorAll('.ro-room, .lib-body, body')].some((e, i) => Math.abs(e.scrollTop - (скрПреди[i] || 0)) > 8);
      if (!писа && !мърда && !мръднаСкрол && !външно) {
        намерени.push({ къде: иметоНа(б.closest('.jr-card')).slice(0, 24), бутон: (б.textContent || б.className).trim().slice(0, 22) });
      }
      чисти();
    }
    око.disconnect();
    Element.prototype.scrollIntoView = истSIV; Element.prototype.scrollTo = истST;
    HTMLInputElement.prototype.click = истIClick; HTMLAnchorElement.prototype.click = истACLick;
    window.print = истPrint; window.open = истOpen; window.prompt = истPrompt; window.confirm = истConfirm;
    try { navigator.share = истShare; } catch (e) {}
    return намерени;
  }

  // ═══════════ 💾 ПАМЕТТА ═══════════
  async function паметта(стая) {
    const корен = document.getElementById('roRoom');
    if (!корен) return [];
    const губят = [];
    const полета = [...корен.querySelectorAll('textarea, input[type="text"]')].filter(p => p.offsetParent !== null).slice(0, 6);
    if (!полета.length) return [];
    const белег = 'ОДИТ' + Date.now().toString().slice(-5);
    const писани = [];
    полета.forEach((п, i) => {
      const карта = п.closest('.jr-card');
      писани.push({ име: иметоНа(карта), белег: белег + i });
      п.value = белег + i;
      п.dispatchEvent(new Event('input', { bubbles: true }));
      п.dispatchEvent(new Event('change', { bubbles: true }));
      const зап = карта && [...карта.querySelectorAll('button')].find(b => /Запиши|Запази|Добави|^\+$/.test(b.textContent.trim()) && !ОПАСНИ.test(b.textContent));
      if (зап) { try { зап.click(); } catch (e) {} }
    });
    await спи(300);
    document.getElementById('roClose')?.click();
    await спи(200);
    window._ldDirect = true;
    MamaHelper.open(стая);
    await спи(1000);
    window._ldDirect = false;
    document.querySelectorAll('#roRoom .jr-card.folded').forEach(c => c.classList.remove('folded'));
    await спи(200);
    const цялото = document.getElementById('roRoom').textContent + ' ' +
      [...document.querySelectorAll('#roRoom textarea, #roRoom input')].map(x => x.value).join(' ');
    писани.forEach(п => { if (!цялото.includes(п.белег)) губят.push(п.име.slice(0, 28)); });
    return [...new Set(губят)];
  }

  // ═══════════ 📚 БИБЛИОТЕКАТА ═══════════
  async function библиотека() {
    if (!window.BL_LIB) return { грешка: 'BL_LIB липсва' };
    const idx = await (await fetch('lib/index.json?о=' + Math.random())).json();
    const пакети = {}; let безТяло = 0, безПакет = 0;
    for (const it of idx.items) {
      const f = it.f;
      if (!f || typeof f !== 'string' || !f.endsWith('.json')) { безПакет++; continue; }
      if (!пакети[f]) { try { пакети[f] = await (await fetch('lib/' + f + '?о=' + Math.random())).json(); } catch (e) { пакети[f] = {}; } }
      if (!пакети[f][it.id]) безТяло++;
    }
    const тон = idx.items.filter(it => /омощничк|агент[аъ]?\b/i.test(String(it.s) + String(it.t))).length;
    const поСтаи = {}; idx.items.forEach(it => { поСтаи[it.r] = (поСтаи[it.r] || 0) + 1; });
    const празниТела = Object.values(пакети).flatMap(p => Object.values(p)).filter(b => String(b).length < 200).length;
    return { статии: idx.items.length, безТяло, безПакет, тонПроблеми: тон, късиТела: празниТела, тънки: Object.entries(поСтаи).filter(([, n]) => n < 20).map(([с, n]) => с + ':' + n) };
  }

  // ═══════════ 🏥 ЗДРАВЕТО НА ЦЯЛАТА СТРАНИЦА ═══════════
  function здраве() {
    // дублирани id — тихият убиец: getElementById взима първия и всичко се чупи
    const ids = {}; const дубли = [];
    document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
    Object.entries(ids).forEach(([i, n]) => { if (n > 1) дубли.push(i + '×' + n); });
    // хоризонтален скрол на цялата страница
    const хоризонтален = document.documentElement.scrollWidth > window.innerWidth + 2;
    // счупени вътрешни връзки
    const счупени = [...document.querySelectorAll('a[href^="#"]')]
      .filter(a => { const h = decodeURIComponent(a.getAttribute('href')).slice(1); return h && !document.getElementById(h) && !document.querySelector('[name="' + h + '"]'); })
      .map(a => a.getAttribute('href'));
    // скорост
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const рес = performance.getEntriesByType('resource');
    return {
      дублиранId: дубли, хоризонталенСкрол: хоризонтален, счупениВръзки: [...new Set(счупени)],
      FCP: Math.round((paint.find(p => p.name === 'first-contentful-paint') || {}).startTime || 0),
      зареждане: Math.round(nav.loadEventEnd || 0),
      файлове: рес.length,
      тегло: Math.round(рес.reduce((s, x) => s + (x.transferSize || 0), 0) / 1024) + ' KB'
    };
  }

  // ═══════════ отваряне на произволен ЕКРАН ═══════════
  async function екран(име) {
    чисти();
    document.getElementById('roClose')?.click();
    await спи(200);
    window.scrollTo(0, 0);
    const о = {
      'НАЧАЛНАТА': async () => { await спи(300); return document.querySelector('.hero-inner'); },
      'Долната лента': async () => { await спи(200); return document.querySelector('.bottom-nav'); },
      'Профилът': async () => { if (window.BL_PROFILE) BL_PROFILE.open(); await спи(700); return document.querySelector('.prof-veil, .prof-layer, .prof-panel') || document.querySelector('[class*="prof"]')?.closest('div'); },
      'Търсачката': async () => { if (window.BL_SEARCH) BL_SEARCH.open(); await спи(500); return document.querySelector('.search-veil, #searchOverlay, [class*="search"]'); },
      'Реката': async () => { if (window.BL_RIVER) BL_RIVER.open(); await спи(600); return document.getElementById('riverOverlay'); },
      'СОС центърът': async () => { if (window.BL_SOS_CENTER) BL_SOS_CENTER.open(); await спи(500); return document.querySelector('.sos-veil, #sosCenter, [class*="sos"]'); },
      'Картата на стаята': async () => { window._ldDirect = true; MamaHelper.open('Моето бебе'); await спи(1000); window._ldDirect = false; if (window.BL_ROOMMAP) BL_ROOMMAP.отвориКарта('Моето бебе'); await спи(500); return document.getElementById('roomMap'); }
    };
    return о[име] ? await о[име]() : null;
  }

  // ═══════════ СТАИТЕ ═══════════
  async function run(само) {
    const скрит = скритЛи(); if (скрит) return { отказ: скрит };
    const пазено = снимка(), старт = Date.now();
    const грешки = []; const стар = window.onerror;
    window.onerror = m => грешки.push(String(m).slice(0, 60));
    const доклад = {};
    const списък = само ? [само] : СТАИ;
    window._ldDirect = true;
    for (const с of списък) {
      MamaHelper.open(с);
      await спи(1100);
      document.querySelectorAll('#roRoom .jr-card.folded').forEach(c => c.classList.remove('folded'));
      await спи(250);
      const корен = document.getElementById('roRoom');
      const г = геометрия(корен);
      const карти = корен.querySelectorAll('.jr-card').length;
      const безРоля = [...корен.querySelectorAll('.jr-card')].filter(c => !c.getAttribute('role') && c.querySelector('.jr-title')).length;
      const м = await мъртви(корен);
      const п = await паметта(с);
      доклад[с] = {
        карти, бутони: г.бутони,
        '📐прелели': г.прелели.length, '📐малки': г.малки.length,
        '💀мъртви': м.length, '💾губят': п.length,
        '♿безИме': г.безИме.length, '♿безРоля': безРоля, '🔤азбуки': г.азбуки.length,
        _д: { прелели: г.прелели.slice(0, 3), малки: г.малки.slice(0, 4), мъртви: м.slice(0, 4), губят: п, азбуки: г.азбуки }
      };
      document.getElementById('roClose')?.click();
      await спи(150);
    }
    window._ldDirect = false;
    const биб = await библиотека();
    window.onerror = стар; върни(пазено);
    const готова = с => { const d = доклад[с]; return !d['📐прелели'] && !d['📐малки'] && !d['💀мъртви'] && !d['💾губят'] && !d['♿безИме'] && !d['🔤азбуки']; };
    const сбор = k => Object.values(доклад).reduce((s, x) => s + (x[k] || 0), 0);
    const оценка = {};
    списък.forEach(с => {
      const d = доклад[с];
      const т = d['📐прелели'] + d['📐малки'] + d['💀мъртви'] * 3 + d['💾губят'] * 5 + d['♿безИме'] + d['🔤азбуки'] * 2;
      оценка[с] = готова(с) ? '✅ ГОТОВА' : т + ' точки';
    });
    return {
      '⏱️': Math.round((Date.now() - старт) / 1000) + ' сек', '🏁 ОЦЕНКА': оценка,
      '📊 СБОР': { карти: сбор('карти'), бутони: сбор('бутони'), прелели: сбор('📐прелели'), малкиЦели: сбор('📐малки'), мъртви: сбор('💀мъртви'), губят: сбор('💾губят'), безИме: сбор('♿безИме'), азбуки: сбор('🔤азбуки') },
      '📚 БИБЛИОТЕКА': биб, '🚨 КОНЗОЛА': грешки.length ? грешки : 'чисто', 'по стаи': доклад
    };
  }

  // ═══════════ 🌍 ЦЯЛАТА АПЛИКАЦИЯ ═══════════
  async function всичко() {
    const скрит = скритЛи(); if (скрит) return { отказ: скрит };
    const пазено = снимка(), старт = Date.now();
    const грешки = []; const стар = window.onerror;
    window.onerror = m => грешки.push(String(m).slice(0, 60));

    // 1) стаите
    const стаи = await run();

    // 2) другите екрани
    const извън = {};
    for (const име of ['НАЧАЛНАТА', 'Долната лента', 'Профилът', 'Търсачката', 'Реката', 'СОС центърът', 'Картата на стаята']) {
      let корен = null;
      try { корен = await екран(име); } catch (e) {}
      if (!корен) { извън[име] = '⚠️ не се отвори'; continue; }
      const г = геометрия(корен);
      const м = await мъртви(корен, 14);
      извън[име] = {
        бутони: г.бутони, '📐прелели': г.прелели.length, '📐малки': г.малки.length,
        '💀мъртви': м.length, '♿безИме': г.безИме.length, '🖼️безAlt': г.снимкиБезAlt, '🔤азбуки': г.азбуки.length,
        _д: { прелели: г.прелели.slice(0, 3), малки: г.малки.slice(0, 3), мъртви: м.slice(0, 3) }
      };
      чисти();
      document.getElementById('roClose')?.click();
      await спи(150);
    }

    // 3) табовете статии + чат (не само „Стаята“)
    window._ldDirect = true;
    MamaHelper.open('Моето бебе');
    await спи(1100);
    MamaHelper.showTab('articles');
    await спи(700);
    const ст = геометрия(document.getElementById('roArticles'));
    MamaHelper.showTab('chat');
    await спи(700);
    const чт = геометрия(document.querySelector('.ro-chatwrap') || document.getElementById('roChat').parentElement);
    document.getElementById('roClose')?.click();
    window._ldDirect = false;
    await спи(150);

    // 4) тъмна тема — същите стаи, друг цвят
    const темаБеше = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    window._ldDirect = true;
    MamaHelper.open('Дневник на мама');
    await спи(1100);
    document.querySelectorAll('#roRoom .jr-card.folded').forEach(c => c.classList.remove('folded'));
    await спи(200);
    const тъмно = геометрия(document.getElementById('roRoom'));
    // невидим текст в тъмно (същият цвят като фона)
    const невидим = [...document.querySelectorAll('#roRoom p, #roRoom span, #roRoom strong')].filter(e => {
      if (e.offsetParent === null || !(e.textContent || '').trim()) return false;
      const s = getComputedStyle(e);
      const c = s.color.match(/\d+/g), b = getComputedStyle(e.closest('.jr-card') || e).backgroundColor.match(/\d+/g);
      if (!c || !b) return false;
      const я = x => (0.299 * x[0] + 0.587 * x[1] + 0.114 * x[2]);
      return Math.abs(я(c) - я(b)) < 40;
    }).length;
    document.getElementById('roClose')?.click();
    window._ldDirect = false;
    if (темаБеше) document.documentElement.setAttribute('data-theme', темаБеше); else document.documentElement.removeAttribute('data-theme');

    // 5) здравето на страницата
    const з = здраве();
    window.onerror = стар; върни(пазено);

    return {
      '⏱️ ОБЩО': Math.round((Date.now() - старт) / 1000) + ' сек',
      '🏠 ИЗВЪН СТАИТЕ': извън,
      '📚 таб Статии': { бутони: ст.бутони, прелели: ст.прелели.length, малки: ст.малки.length },
      '💬 таб Чат': { бутони: чт.бутони, прелели: чт.прелели.length, малки: чт.малки.length },
      '🌙 ТЪМНА ТЕМА': { прелели: тъмно.прелели.length, малки: тъмно.малки.length, невидимТекст: невидим },
      '🏥 ЗДРАВЕ': з,
      '🚨 КОНЗОЛА': грешки.length ? грешки : 'чисто',
      '🚪 СТАИТЕ': стаи['🏁 ОЦЕНКА'],
      '📊 СБОР СТАИ': стаи['📊 СБОР'],
      '📚 БИБЛИОТЕКА': стаи['📚 БИБЛИОТЕКА']
    };
  }

  window.BL_AUDIT = { run, всичко, СТАИ, геометрия, мъртви, паметта, библиотека, здраве, екран, МИН_ЦЕЛ };
  console.log('🤖 Одит-робот v2. · await BL_AUDIT.run() — стаите · await BL_AUDIT.всичко() — ЦЯЛАТА апликация');
})();
