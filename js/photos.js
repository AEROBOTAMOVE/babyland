// ═══════════════════════════════════════════════════════════
// СНИМКИТЕ НА ЕДНО МЯСТО (план 19, част 12.12) — в Инструменти
//
// 12.12.1  Всички снимки, филтър по вид
// 12.12.2  Колко място заемат + чистене
// 12.12.5  ⚠️ ПРАВИЛОТО: снимките на бебето НЕ се качват никъде. Никога.
//
// Снимките са пръснати в 8 ключа (месечни, на деня, коремчето, рисунки,
// обриви, храна-физиономии). Тук се събират, за да ги виждаш наведнъж —
// и за да можеш да чистиш, ако телефонът се напълни.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js — 126 ключа × 17 форми отрова):
  //    формата се проверяваше само ОТВЪН. ВЪТРЕ в масива можеше да седи
  //    `null` (внесено копие от друг телефон, прекъснат запис, стара версия)
  //    и първото `x.ts` събаряше картата. 59 карти умираха точно така —
  //    същият дефект като истинския `bl_custom_lists = [null]`.
  //    `безДупки` маха дупките ПРЕДИ някой да ги пипне.
  //    ЗАЩО Е БЕЗОПАСНО: никъде в проекта `null` не се пази в масив като
  //    „празно място" (проверено с grep за push(null) / fill(null) / [i]=null)
  //    — списъците са ЗАПИСИ, не решетки, тоест изместен индекс не значи нищо.
  //    ПЪТ НАЗАД: сменяш `безДупки(v)` обратно с `v` — един знак.
  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): проверката за форма пазеше САМО
  //    масив-срещу-обект. Ключ с ЧИСЛО по подразбиране (bl_metime_start = 0)
  //    приемаше {} спокойно — после „сега минус {}" даваше NaN и на екрана
  //    на мама светеше часовник „NaN:NaN". простФормат пази и трите прости
  //    вида. Числов низ („15") се ПРЕВРЪЩА, не се хвърля — стари версии са
  //    пазили числа като низове и изхвърлянето би загубило истински данни.
  //    Връща undefined, когато няма мнение — не null, защото null е законна
  //    стойност по подразбиране на много места тук.
  //    ПЪТ НАЗАД: махаш от load реда, който вика простФормат.
  const простФормат = (v, d) => {
    const т = typeof d;
    if (т === 'number') {
      if (typeof v === 'number' && isFinite(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) return Number(v);
      return d;
    }
    if (т === 'string') return typeof v === 'string' ? v : d;
    if (т === 'boolean') return typeof v === 'boolean' ? v : d;
    return undefined;
  };
  const безДупки = (v, дълб) => {
    if (!v || typeof v !== 'object') return v;
    const д = дълб || 0;
    if (д > 6) return v;                       // вложен боклук: спираме, не обикаляме вечно
    if (Array.isArray(v)) {
      for (let i = v.length - 1; i >= 0; i--) {
        if (v[i] === null || v[i] === undefined) v.splice(i, 1);
        else безДупки(v[i], д + 1);
      }
      return v;
    }
    for (const кл in v) if (Object.prototype.hasOwnProperty.call(v, кл)) безДупки(v[кл], д + 1);
    return v;
  };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; const прим = простФормат(v, d); if (прим !== undefined) return прим; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return безДупки(v); } catch (e) { return d; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';

  // ── откъде идват снимките (вид, ключ, форма) ──
  const ИЗТОЧНИЦИ = [
    { вид: 'месечни', e: '📅', k: 'bl_photos', форма: 'obj' },        // {месец: dataURL}
    { вид: 'на деня', e: '📸', k: 'bl_dayphoto', форма: 'obj' },      // {дата: dataURL}
    { вид: 'коремчето', e: '🤰', k: 'bl_bump', форма: 'obj' },        // {седмица: dataURL}
    { вид: 'рисунки', e: '🎨', k: 'bl_art', форма: 'arr-img' },       // [{img, ts}]
    // 🔴 05.08 (СКЕПТИКЪТ към №181): картата, която пълнеше bl_art, е махната от
    //    rooms3.js — новите драскулки отиват САМО в bl_art_months, а той не беше
    //    тук. Тоест „Всичките ти снимки“ повече никога нямаше да види НОВА рисунка.
    //    Старите са прелети в bl_art_months, затова дедуп по ts срещу bl_art —
    //    иначе всяка стара излиза по два пъти и в брояча, и в лентата.
    { вид: 'рисунки', e: '🎨', k: 'bl_art_months', форма: 'arr-img', дедуп: 'bl_art' },
    { вид: 'физиономии', e: '😋', k: 'bl_food_faces', форма: 'arr-img' }
  ];

  function събери() {
    const всички = [];
    ИЗТОЧНИЦИ.forEach(и => {
      const raw = load(и.k, и.форма === 'obj' ? {} : []);
      if (и.форма === 'obj') {
        Object.entries(raw || {}).forEach(([ключ, dataURL]) => {
          if (typeof dataURL === 'string' && dataURL.startsWith('data:')) {
            всички.push({ вид: и.вид, e: и.e, img: dataURL, key: и.k, sub: ключ });
          }
        });
      } else {
        (raw || []).forEach(x => {
          if (x && typeof x.img === 'string' && x.img.startsWith('data:')) {
            // прелетите записи носят СЪЩИЯ ts в двата ключа — броим ги веднъж
            if (и.дедуп && x.ts && всички.some(y => y.key === и.дедуп && y.sub === x.ts)) return;
            всички.push({ вид: и.вид, e: и.e, img: x.img, key: и.k, sub: x.ts || '' });
          }
        });
      }
    });
    return всички;
  }

  function размерВПамет() {
    let bytes = 0;
    ИЗТОЧНИЦИ.forEach(и => { bytes += (localStorage.getItem(и.k) || '').length; });
    // медията вече може да е в IndexedDB — питаме store-а за истинския размер
    if (window.BL_STORE && BL_STORE.usage) {
      const u = BL_STORE.usage();
      return u.mediaKB || Math.round(bytes / 1024);
    }
    return Math.round(bytes / 1024);
  }

  function photoHubCard() {
    const c = card('Всичките ти снимки 📸 ' + sub('на едно място'));
    const снимки = събери();
    const kb = размерВПамет();

    // 12.12.2: колко място
    const размер = kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
    c.appendChild(el('p', 'jr-privacy',
      снимки.length
        ? `<strong>${снимки.length}</strong> ${window.BL_BROI ? BL_BROI.дума(снимки.length, 'снимка', 'снимки') : (снимки.length === 1 ? 'снимка' : 'снимки')} · ${снимки.length === 1 ? 'заема' : 'заемат'} <strong>${размер}</strong> от паметта на телефона.`
        : 'Още няма снимки. Като добавиш от галериите в стаите, ще се събират тук.'));

    // 12.12.5: ЖЕЛЯЗНОТО правило — честно, отгоре
    c.appendChild(el('p', 'jr-privacy',
      '🔒 Тези снимки са <strong>само на този телефон</strong>. Приложението не ги качва никъде и не ги изпраща на никого — затова и никой освен теб не ги вижда. За да не ги загубиш при смяна на телефон: направи си резервно копие (💾 картата е по-горе в това кътче).'));

    if (!снимки.length) return c;

    // 12.12.1: филтър по вид
    const видове = ['всички'].concat([...new Set(снимки.map(x => x.вид))]);
    const филтър = el('div', 'jr-quick');
    let активен = 'всички';
    const grid = el('div', 'ph-grid');
    const ПОКАЗВАМ = 60;
    const бележка = el('p', 'jr-privacy', '');
    let свали = null;                         // ражда се по-долу; надписът му се води по филтъра
    const избрани = () => снимки.filter(x => активен === 'всички' || x.вид === активен);
    const рисувай = () => {
      grid.innerHTML = '';
      const дай = избрани();
      дай.slice(-ПОКАЗВАМ).forEach(x => {
        const cell = el('div', 'ph-cell');
        cell.innerHTML = `<img src="${esc(x.img)}" alt="${esc(x.вид)}" loading="lazy" decoding="async" width="120" height="120"><span class="ph-tag">${x.e}</span>`;
        grid.appendChild(cell);
      });
      // 🟡 11.08 (обиколка, ИЗМЕРЕНО: 90 снимки → 60 клетки): картата обявяваше
      //    „90 снимки", а лентата показваше последните 60 и мълчеше за
      //    останалите 30. Мама брои и решава, че е загубила снимки.
      бележка.textContent = дай.length > ПОКАЗВАМ
        ? 'Показвам последните ' + ПОКАЗВАМ + ' от ' + дай.length + '. Останалите са си на място — свалянето отдолу ги взима всичките.'
        : '';
      бележка.hidden = дай.length <= ПОКАЗВАМ;
      // 🟠 11.08 (обиколка, ИЗМЕРЕНО): бутонът пишеше „Свали ВСИЧКИТЕ снимки
      //    (16)", а със сложен филтър сваляше само 2. Мама натиска „всичките",
      //    получава две и мисли, че другите ги няма. Надписът да казва истината.
      if (свали) свали.textContent = активен === 'всички'
        ? '⬇️ Свали всичките снимки (' + дай.length + ')'
        : '⬇️ Свали „' + активен + '“ (' + дай.length + ')';
    };
    видове.forEach(в => {
      // броим какво ИМА, не какво липсва — по-къс път до търсената лента
      const колко = в === 'всички' ? снимки.length : снимки.filter(x => x.вид === в).length;
      const b = el('button', 'jr-chip' + (в === 'всички' ? ' on' : ''), в + ' · ' + колко);
      b.type = 'button';
      b.style.minHeight = '44px';
      b.setAttribute('aria-label', в + ', ' + колко + ' снимки');
      b.addEventListener('click', () => {
        активен = в;
        филтър.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on'); рисувай();
      });
      филтър.appendChild(b);
    });
    c.appendChild(филтър); c.appendChild(grid); c.appendChild(бележка);

    // 12.12.3: свали всичките наведнъж — не за архив (той е в копието),
    // а за да ги пренесеш в галерията на телефона.
    свали = el('button', 'jr-btn ph-export', '⬇️ Свали всичките снимки (' + снимки.length + ')');
    свали.type = 'button';
    свали.style.minHeight = '44px';
    свали.addEventListener('click', async () => {
      if (свали.disabled) return;
      свали.disabled = true;
      const дай = избрани();
      let свалени = 0;
      for (let i = 0; i < дай.length; i++) {
        свали.textContent = 'Свалям… ' + (i + 1) + '/' + дай.length;
        try {
          const a = document.createElement('a');
          a.href = дай[i].img;
          a.download = 'baby-land-' + (дай[i].вид || 'снимка') + '-' + (i + 1) + '.jpg';
          a.click();
          свалени++;
          await new Promise(r => setTimeout(r, 350));       // браузърът не обича залп
        } catch (e) {}
      }
      свали.disabled = false;
      свали.textContent = 'Готово — ' + свалени + ' 💜';
      бележка.hidden = false;
      бележка.textContent = свалени
        ? 'Изпратени са ' + свалени + ' към телефона. Ако той е попитал „да свалиш ли няколко файла“ — трябва да си му отговорила „да“, иначе спира след първата.'
        : 'Нищо не тръгна — този браузър спира свалянето. Снимките си остават тук, при теб.';
      setTimeout(рисувай, 2600);                            // надписът се връща според филтъра
    });
    c.appendChild(свали);
    рисувай();                                              // чак сега — надписът на бутона зависи от филтъра
    c.appendChild(el('p', 'jr-privacy',
      'Изтриване на конкретна снимка става от самата галерия, откъдето си я сложила. Тук ги гледаш всичките заедно.'));
    return c;
  }

  window.BL_PHOTOS = { събери, размерВПамет };

  // ── свързване: в Инструменти ──
  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
  if (база) window.ROOM_FEATURES['Инструменти'] = root => { база(root); root.appendChild(photoHubCard()); };
})();
