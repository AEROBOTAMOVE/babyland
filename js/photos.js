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

    // 27.10: същите снимки, подредени в албуми (блокът е по-долу в този файл)
    const кАлб = el('button', 'jr-btn', '📚 Подреди ги в албуми');
    кАлб.type = 'button';
    кАлб.style.minHeight = '44px';
    кАлб.addEventListener('click', () => { if (window.BL_ALBUMI) BL_ALBUMI.отвори(кАлб); });
    c.appendChild(кАлб);

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

  // ═══════════════════════════════════════════════════════════
  // 📚 АЛБУМИТЕ (27.10) — по месеци, по години, специални, любими
  //
  // Нищо ново не се снима: албумите се ПОДРЕЖДАТ сами от снимките, които мама
  // вече е сложила из стаите. Пишем само един малък ключ — bl_alb_meta
  // {ид: {f: 1, t: 'надпис'}} — за ❤️ и надписите. Медията не се пипа.
  // Хартията: 📖 фотокнига през системния печат (PDF за студио/принтер) и,
  // ако е зареден BL_FIZ (expr.js), карта 10×15, колаж и плакат на годината.
  // ⚠️ Правилото 12.12.5 важи и тук: нищо не напуска телефона без натиск на мама.
  // ПЪТ НАЗАД: махаш този блок и двата реда за свързване най-долу.
  // ═══════════════════════════════════════════════════════════
  const МЕС = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const МЕТА = 'bl_alb_meta';
  const снимкаЛи = u => typeof u === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,/.test(u);
  const поДата = s => { const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(s || '')); if (!m) return null; const д = new Date(+m[1], +m[2] - 1, +(m[3] || 1)); return isNaN(д) ? null : д; };
  const отTs = ts => { if (typeof ts === 'number' && ts > 1e11) { const д = new Date(ts); return isNaN(д) ? null : д; } return поДата(ts); };
  const дума = (n, е, мн) => window.BL_BROI ? BL_BROI.дума(n, е, мн) : (n === 1 ? е : мн);
  const датаТекст = д => д ? д.getDate() + ' ' + МЕС[д.getMonth()] + ' ' + д.getFullYear() : '';
  // снимка само с месец („Ти в кадъра“) показва „октомври 2026“, не измислено 1-во число
  const датаНа = с => !с.д ? '' : с.сМесец ? МЕС[с.д.getMonth()] + ' ' + с.д.getFullYear() : датаТекст(с.д);
  const мета = () => load(МЕТА, {});
  // 🔎 преглед 27.10: ❤️ и надписът вървят СЪС СНИМКАТА, не със слота — нова снимка за „3 месеца“
  //   не наследява чуждия надпис, а две ехографии от един преглед не делят едно сърце.
  //   Отпечатъкът е лек: дължината + всеки 97-и знак от dataURL-а.
  const отпечатък = s => { let h = 5381; for (let i = 0; i < s.length; i += 97) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36) + s.length.toString(36); };
  // клампване като BL_DATE (data.js): 31 януари + 1 месец = 28/29 февруари, не 3 март
  const плюсМесеци = (д, n) => window.BL_DATE ? BL_DATE.addMonths(д, n) : new Date(д.getFullYear(), д.getMonth() + n, Math.min(д.getDate(), new Date(д.getFullYear(), д.getMonth() + n + 1, 0).getDate()));
  const пишиМета = (ид, промяна) => {
    const м = мета(); const x = Object.assign({}, м[ид], промяна);
    // t: '' остава — изтритият надпис е избор на мама и не бива да се връща при следващото отваряне
    if (!x.f) delete x.f; if (x.t == null) delete x.t;
    if (Object.keys(x).length) м[ид] = x; else delete м[ид];
    try { localStorage.setItem(МЕТА, JSON.stringify(м)); return true; } catch (e) { return false; }
  };

  function бебе() {
    const б = load('bl_baby', { name: '', birth: '' }) || {};
    return { име: String(б.name || '').trim(), раждане: поДата(б.birth) };
  }
  function възрастНа(д, раждане) {
    if (!д || !раждане) return '';
    // като BL_AGE (rooms2.js) и банера: роденото на 31.01 на 28.02 е „1 месец“
    let м = (д.getFullYear() - раждане.getFullYear()) * 12 + д.getMonth() - раждане.getMonth();
    if (плюсМесеци(раждане, м) > д) м--;
    if (м < 0) return 'чакането';
    return м === 0 ? 'първият месец' : м + ' ' + дума(м, 'месец', 'месеца');
  }

  // Всяка снимка с дата (ако има) и откъде е. Обривите (bl_rash) НЕ са спомен.
  function всички() {
    const { раждане } = бебе();
    const м = мета();
    const наПауза = !!(window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused());
    const out = [];
    const сложи = (ид, img, вид, e, д, бележка, extra) => {
      if (!снимкаЛи(img)) return;
      ид += '#' + отпечатък(img);
      const мм = м[ид] || {};
      // авто = етикетът, който сме измислили ние („3 месеца“, „20 седм.“) — не е надпис на мама
      const авто = вид === 'месечни' || вид === 'чакането' ? (бележка || '') : '';
      out.push(Object.assign({ ид, img, вид, e, д, надпис: typeof мм.t === 'string' ? мм.t : (бележка || ''), авто, f: !!мм.f }, extra || {}));
    };
    Object.entries(load('bl_photos', {}) || {}).forEach(([мес, img]) => {
      const n = parseInt(мес, 10); if (!(n >= 0)) return;
      сложи('bl_photos:' + n, img, 'месечни', '📅', раждане ? плюсМесеци(раждане, n) : null, n === 0 ? 'раждането 🐣' : n + ' ' + дума(n, 'месец', 'месеца'), { мес: n });
    });
    Object.entries(load('bl_dayphoto', {}) || {}).forEach(([ден, img]) => сложи('bl_dayphoto:' + ден, img, 'на деня', '📸', поДата(ден), ''));
    // ключът е само „ГГГГ-ММ“ — денят е неизвестен: без „1 октомври“, без възраст, без „На този ден“
    Object.entries(load('bl_wm_inframe', {}) || {}).forEach(([мес, img]) => сложи('bl_wm_inframe:' + мес, img, 'ти в кадъра', '💃', поДата(мес), '', { сМесец: true }));
    const видяни = new Set();
    ['bl_art_months', 'bl_art'].forEach(k => (load(k, []) || []).forEach((x, i) => {
      // двойникът се познава по ts — но само ако има ts и снимката е цяла (повреденото копие не крие доброто)
      if (!x || !снимкаЛи(x.img)) return;
      if (x.ts != null) { if (видяни.has(x.ts)) return; видяни.add(x.ts); }
      сложи(k + ':' + (x.ts != null ? x.ts : 'i' + i), x.img, 'рисунки', '🎨', отTs(x.ts), x.note || '');
    }));
    (load('bl_food_faces', []) || []).forEach((x, i) => x && сложи('bl_food_faces:' + (x.ts != null ? x.ts : 'i' + i), x.img, 'първите вкусове', '😋', отTs(x.ts), x.note || ''));
    // 🤍 Като в годишника: при „пауза на очакването“ бременността не излиза. Снимките стоят непипнати.
    if (!наПауза) {
      Object.entries(load('bl_bump', {}) || {}).forEach(([с, img]) => сложи('bl_bump:' + с, img, 'чакането', '🤰', null, с + ' седм.', { седм: +с || 0 }));
      // думите на мама към ехото (x.t) са НЕЙНИ — пазят се отделно, за да стигнат до картата
      (load('bl_echo', []) || []).forEach((x, i) => x && сложи('bl_echo:' + (x.d || i) + ':' + (x.w || ''), x.img, 'чакането', '🩻', поДата(x.d), (x.w ? x.w + ' седм. · ' : '') + (x.t || ''), { седм: +x.w || 0, думи: String(x.t || '').trim() }));
    }
    return out;
  }

  function албуми(сн) {
    const { раждане } = бебе();
    const поВреме = (a, b) => (a.д ? +a.д : 0) - (b.д ? +b.д : 0);
    const месеци = new Map(), години = new Map();
    сн.forEach(с => {
      if (!с.д) return;
      const км = с.д.getFullYear() + '-' + String(с.д.getMonth() + 1).padStart(2, '0');
      if (!месеци.has(км)) месеци.set(км, []); месеци.get(км).push(с);
      const кг = String(с.д.getFullYear());
      if (!години.has(кг)) години.set(кг, []); години.get(кг).push(с);
    });
    const нов = (ид, име, под, снимки, вид) => {
      снимки = снимки.slice().sort(поВреме);
      const корица = снимки.find(x => x.f) || снимки[0];
      return { ид, име, под, снимки, корица, вид };
    };
    const мес = [...месеци.keys()].sort().reverse().map(к => {
      const [г, м] = к.split('-').map(Number);
      // мерено в ПОСЛЕДНИЯ ден на месеца — роденото на 30.03 не е „чакането“ в собствения си месец
      const възр = възрастНа(new Date(г, м, 0), раждане);
      return нов('m:' + к, МЕС[м - 1] + ' ' + г, възр, месеци.get(к), 'месец');
    });
    const год = [...години.keys()].sort().reverse().map(к => нов('y:' + к, 'Годината ' + к, '', години.get(к), 'година'));
    const спец = [];
    const люб = сн.filter(x => x.f);
    if (люб.length) спец.push(нов('s:fav', '❤️ Любимите', 'избраните от теб', люб, 'спец'));
    const мм = сн.filter(x => x.вид === 'месечни').sort((a, b) => a.мес - b.мес);
    if (мм.length) { const а = нов('s:mes', '📅 Месец по месец', 'как порасна', мм, 'серия'); а.снимки = мм; а.корица = мм.find(x => x.f) || мм[мм.length - 1]; спец.push(а); }
    [['чакането', '🤰 Чакането', 'коремчето и ехографиите'], ['на деня', '📸 Снимката на деня', ''], ['първите вкусове', '😋 Първите вкусове', 'гримасите при нова храна'],
      ['рисунки', '🎨 Рисунките', ''], ['ти в кадъра', '💃 Ти в кадъра', 'мама също е в историята']].forEach(([вид, име, под]) => {
      const x = сн.filter(с => с.вид === вид);
      if (!x.length) return;
      const а = нов('s:' + вид, име, под, x, 'спец');
      if (вид === 'чакането') а.снимки = x.slice().sort((a, b) => a.седм - b.седм);
      спец.push(а);
    });
    return { мес, год, спец };
  }

  // „На този ден“: същата дата в минали години; за малкото бебе — и същото число в минали месеци.
  function наТозиДен(сн) {
    const днес = new Date(); днес.setHours(0, 0, 0, 0);
    const out = [];
    сн.forEach(с => {
      if (!с.д || с.сМесец || с.д >= днес || с.д.getDate() !== днес.getDate()) return;
      const мес = (днес.getFullYear() - с.д.getFullYear()) * 12 + днес.getMonth() - с.д.getMonth();
      if (мес <= 0) return;
      const год = мес % 12 === 0 ? мес / 12 : 0;
      out.push({ с, мес, етикет: год ? 'преди ' + год + ' ' + дума(год, 'година', 'години') : 'преди ' + мес + ' ' + дума(мес, 'месец', 'месеца') });
    });
    return out.sort((a, b) => b.мес - a.мес).slice(0, 8);
  }

  // ── 📖 фотокнигата: системният печат → „Запази като PDF“ → студио или принтер ──
  function фотокнига(а) {
    if (!window.BL_EXPR || !BL_EXPR.printOverlay) return false;
    const { име, раждане } = бебе();
    const ред = с => [с.надпис, датаНа(с), а.вид !== 'месец' && с.д && !с.сМесец ? възрастНа(с.д, раждане) : ''].filter(x => x && x !== 'чакането').map(esc).join(' · ');
    // името на албума е вече в главата на листа (printOverlay) — на корицата не се повтаря
    let html = `<div class="alb-bk-cover"><img src="${esc(а.корица.img)}" alt=""><p>${esc(име || 'Нашето бебе')} ·${а.снимки.length} ${дума(а.снимки.length, 'снимка', 'снимки')}</p></div>`;
    for (let i = 0; i < а.снимки.length; i += 2) {
      html += '<div class="alb-bk-pg">' + а.снимки.slice(i, i + 2).map(с => `<figure><img src="${esc(с.img)}" alt=""><figcaption>${ред(с)}</figcaption></figure>`).join('') + '</div>';
    }
    BL_EXPR.printOverlay(а.име, html, { cls: 'alb-book' });
    return true;
  }

  // ── големият прозорец: списък → албум → снимка на цял екран ──
  let ов = null, сн = [], гр = null, режим = 'мес', текущ = null, лбИ = -1, отКъде = null, чакамНазад = false;
  const физ = () => window.BL_FIZ && typeof BL_FIZ.запази === 'function' ? BL_FIZ : null;

  function правиОв() {
    ов = el('div', 'alb-ov');
    ов.id = 'albOv'; ов.hidden = true;
    ов.setAttribute('role', 'dialog'); ов.setAttribute('aria-modal', 'true'); ов.setAttribute('aria-labelledby', 'albH');
    ов.innerHTML = `<div class="alb-top"><button type="button" class="alb-ic alb-back" aria-label="Назад към албумите" hidden>‹</button><h3 id="albH" class="alb-h"></h3><button type="button" class="alb-ic alb-x" aria-label="Затвори албумите">✕</button></div>
      <div class="alb-body"></div>
      <div class="alb-lb" hidden><div class="alb-lb-top"><span class="alb-lb-n"></span><button type="button" class="alb-ic alb-lb-x" aria-label="Затвори снимката">✕</button></div>
        <div class="alb-lb-st"><button type="button" class="alb-ic alb-lb-p" aria-label="Предишна снимка">‹</button><img class="alb-lb-img" alt="" draggable="false"><button type="button" class="alb-ic alb-lb-s" aria-label="Следваща снимка">›</button></div>
        <div class="alb-lb-info"><p class="alb-lb-d"></p><p class="alb-lb-t"></p><div class="alb-lb-ed" hidden><input type="text" maxlength="80" aria-label="Надпис към снимката" placeholder="напр. първата усмивка"><button type="button" class="jr-chip alb-lb-ok">✓</button></div>
        <div class="alb-lb-act"><button type="button" class="jr-chip alb-fav" aria-pressed="false">🤍 Любима</button><button type="button" class="jr-chip alb-ed">✏️ Надпис</button><button type="button" class="jr-chip alb-k10" hidden>🖼️ Карта 10×15</button><button type="button" class="jr-chip alb-kst" hidden>📱 За телефона</button></div>
        <p class="alb-lb-msg" role="status"></p></div></div>`;
    document.body.appendChild(ов);
    const q = s => ов.querySelector(s);
    q('.alb-x').addEventListener('click', () => затвори());
    q('.alb-back').addEventListener('click', () => { текущ = null; рисувай(); });
    q('.alb-lb-x').addEventListener('click', () => лб(-1));
    q('.alb-lb-p').addEventListener('click', () => лбСтъпка(-1));
    q('.alb-lb-s').addEventListener('click', () => лбСтъпка(1));
    q('.alb-fav').addEventListener('click', () => {
      const с = текущ.снимки[лбИ]; с.f = !с.f;
      if (!пишиМета(с.ид, { f: с.f ? 1 : 0 })) { с.f = !с.f; съобщи('🤍 Паметта е пълна — не успях да запазя.'); }
      сн.forEach(x => { if (x.ид === с.ид) x.f = с.f; });
      гр = албуми(сн); лбПокажи();
    });
    const ред = q('.alb-lb-ed'), вх = ред.querySelector('input');
    const пазиНадпис = () => {
      const с = текущ.снимки[лбИ]; const t = вх.value.trim().slice(0, 80);
      // неуспешният запис не крие полето — написаното от мама остава пред нея
      if (!пишиМета(с.ид, { t })) { съобщи('🤍 Паметта е пълна — надписът не се запази.'); return; }
      с.надпис = t; сн.forEach(x => { if (x.ид === с.ид) x.надпис = t; });
      ред.hidden = true; лбПокажи();
    };
    q('.alb-ed').addEventListener('click', () => { ред.hidden = !ред.hidden; if (!ред.hidden) { вх.value = текущ.снимки[лбИ].надпис || ''; вх.focus(); } });
    q('.alb-lb-ok').addEventListener('click', пазиНадпис);
    вх.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пазиНадпис(); } });
    const карта = формат => async () => {
      const Ф = физ(); if (!Ф) return;
      const с = текущ.снимки[лбИ]; const { име, раждане } = бебе();
      // договорът на BL_FIZ (expr.js): заглавие едро, подзаглавие розово, а име + дата ги реди той долу
      const възр = с.д && !с.сМесец ? възрастНа(с.д, раждане) : '';
      const заг = с.вид === 'месечни' ? (с.мес === 0 ? 'Раждането' : с.мес + ' ' + дума(с.мес, 'месец', 'месеца'))
        : с.седм ? с.седм + ' ' + дума(с.седм, 'седмица', 'седмици')
        : възр && възр !== 'чакането' ? възр : (с.д ? датаНа(с) : текущ.име.replace(/^[^\p{L}\d]+/u, ''));
      const свой = с.надпис && с.надпис !== с.авто ? с.надпис : (с.думи || '');
      // „Ти в кадъра“ — само месец и година (BL_FIZ приема готов текст за дата)
      await прави(() => Ф.картичка({ img: с.img, надпис: свой }, { заглавие: заг, подзаглавие: свой, име, дата: с.сМесец ? датаНа(с) : (с.д || false), формат }),
        'baby-land-karta-' + (формат === 'storis' ? 'telefon' : '10x15') + '.jpg', кутияБутон(формат));
    };
    const кутияБутон = формат => ов.querySelector(формат === 'storis' ? '.alb-kst' : '.alb-k10');
    q('.alb-k10').addEventListener('click', карта('10x15'));
    q('.alb-kst').addEventListener('click', карта('storis'));
    // плъзване с пръст между снимките
    // 🪤 МЕРЕНО (albumi_proba): с мишка браузърът почваше да ВЛАЧИ снимката → pointercancel → нищо.
    //    draggable="false" на картинката + user-drag: none в CSS.
    const ст = q('.alb-lb-st'); let x0 = null;
    ст.addEventListener('pointerdown', e => { x0 = e.clientX; });
    ст.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) лбСтъпка(dx < 0 ? 1 : -1); });
    ст.addEventListener('pointercancel', () => { x0 = null; });
  }

  function съобщи(t) { const p = ов.querySelector('.alb-lb:not([hidden]) .alb-lb-msg') || ов.querySelector('.alb-msg'); if (p) p.textContent = t; }
  // 🔎 преглед 27.10: втори натиск, докато първата се прави, пускаше второ платно и втори файл
  let правиЗаето = false;
  async function прави(дай, име, бутон) {
    const Ф = физ(); if (!Ф || правиЗаето) return;
    правиЗаето = true; if (бутон) бутон.disabled = true;
    съобщи('Правя я… ⏳');
    try {
      const blob = await дай();
      const как = blob ? await Ф.запази(blob, име) : false;
      съобщи(как === 'share' ? 'Готово 💜 — избери „Запази снимка“ или къде да отиде.'
        : как === 'download' ? 'Готово 💜 — свалена е.'
        : как === 'abort' ? 'Добре, не я запазих. Натисни пак, когато искаш. 🤍'
        : '🤍 Не стана — пробвай пак.');
    } catch (e) {
      // BL_FIZ казва на български какво не е наред („Снимката не се отваря…“) — то стига до мама
      съобщи('🤍 ' + (e && /[а-я]/i.test(e.message || '') ? e.message : 'Не стана — пробвай пак.'));
    } finally { правиЗаето = false; if (бутон) бутон.disabled = false; }
  }

  function плочка(а) {
    const b = el('button', 'alb-tile');
    b.type = 'button';
    b.innerHTML = `<span class="alb-cov"><img src="${esc(а.корица.img)}" alt="" loading="lazy" decoding="async"></span><strong>${esc(а.име)}</strong><small>${а.снимки.length} ${дума(а.снимки.length, 'снимка', 'снимки')}${а.под ? ' · ' + esc(а.под) : ''}</small>`;
    b.addEventListener('click', () => { текущ = а; рисувай(); });
    return b;
  }

  function рисувай() {
    const тяло = ов.querySelector('.alb-body');
    const заг = ов.querySelector('.alb-h');
    const назад = ов.querySelector('.alb-back');
    тяло.innerHTML = '';
    тяло.scrollTop = 0;
    const { име } = бебе();
    if (!текущ) {
      заг.textContent = '📚 Албумите' + (име ? ' на ' + име : '');
      назад.hidden = true;
      if (!сн.length) {
        тяло.appendChild(el('p', 'alb-empty', 'Още няма снимки. Сложи месечната снимка в „Моето бебе“, снимката на деня или първата гримаса при нова храна — тук се подреждат сами по месеци и години. 📸'));
        return;
      }
      const дни = наТозиДен(сн);
      if (дни.length) {
        const к = el('section', 'alb-day');
        к.appendChild(el('h4', '', '🕰️ На този ден'));
        const лента = el('div', 'alb-day-row');
        дни.forEach(({ с, етикет }) => {
          const b = el('button', 'alb-day-it'); b.type = 'button';
          b.innerHTML = `<img src="${esc(с.img)}" alt="" loading="lazy" decoding="async"><span>${esc(етикет)}</span>`;
          b.addEventListener('click', () => { текущ = { ид: 's:den', име: '🕰️ На този ден', под: '', снимки: дни.map(x => x.с), корица: дни[0].с, вид: 'спец' }; рисувай(); лб(дни.findIndex(x => x.с === с)); });
          лента.appendChild(b);
        });
        к.appendChild(лента); тяло.appendChild(к);
      }
      const сег = el('div', 'alb-seg'); сег.setAttribute('role', 'group'); сег.setAttribute('aria-label', 'Подреди албумите');
      [['мес', 'По месеци', гр.мес.length], ['год', 'По години', гр.год.length], ['спец', 'Специални', гр.спец.length]].forEach(([к, т, n]) => {
        const b = el('button', 'alb-sg' + (режим === к ? ' on' : ''), т + ' · ' + n); b.type = 'button';
        b.setAttribute('aria-pressed', режим === к ? 'true' : 'false');
        b.addEventListener('click', () => { режим = к; рисувай(); });
        сег.appendChild(b);
      });
      тяло.appendChild(сег);
      const решетка = el('div', 'alb-grid');
      const списък = гр[режим];
      списък.forEach(а => решетка.appendChild(плочка(а)));
      if (!списък.length) решетка.appendChild(el('p', 'alb-empty', режим === 'спец' ? 'Натисни 🤍 на снимка, за да влезе в „Любимите“.' : 'Тези снимки нямат дата — виж ги в „Специални“.'));
      тяло.appendChild(решетка);
      const без = сн.filter(x => !x.д).length;
      if (без && режим !== 'спец') тяло.appendChild(el('p', 'alb-note', без + ' ' + дума(без, 'снимка е', 'снимки са') + ' без дата (коремчето, или месечните, докато няма рожден ден в профила) — те са в „Специални“.'));
      return;
    }
    const а = текущ;
    заг.textContent = а.име;
    назад.hidden = false;
    тяло.appendChild(el('p', 'alb-sub', а.снимки.length + ' ' + дума(а.снимки.length, 'снимка', 'снимки') + (а.под ? ' · ' + esc(а.под) : '')));
    const дейст = el('div', 'alb-act');
    const кн = el('button', 'jr-btn', '📖 Фотокнига · PDF'); кн.type = 'button';
    кн.addEventListener('click', () => {
      if (!фотокнига(а)) { съобщи('🤍 Печатът не се отвори — пробвай пак след малко.'); return; }
      // фокусът отива в листа — клавиатурата и четецът стигат до „Принтирай“ и „Затвори“
      const л = листът(), бт = л && л.querySelector('#prPrint');
      try { if (бт) бт.focus({ preventScroll: true }); } catch (e) {}
    });
    дейст.appendChild(кн);
    const Ф = физ();
    if (Ф && а.снимки.length >= 2 && Ф.колаж) {
      const кл = el('button', 'jr-btn', '🧩 Колаж'); кл.type = 'button';
      кл.addEventListener('click', () => {
        const избор = (а.снимки.filter(x => x.f).length >= 4 ? а.снимки.filter(x => x.f) : а.снимки).slice(0, 9);
        прави(() => Ф.колаж(избор.map(с => ({ img: с.img, надпис: с.надпис })), { заглавие: а.име.replace(/^[^\p{L}\d]+/u, ''), подзаглавие: име || '' }), 'baby-land-kolazh.jpg', кл);
      });
      дейст.appendChild(кл);
    }
    if (Ф && Ф.плакат && а.снимки.length >= 2 && (а.вид === 'година' || а.вид === 'серия')) {
      const пл = el('button', 'jr-btn', '🗓️ Плакат на годината'); пл.type = 'button';
      пл.addEventListener('click', () => {
        // по една снимка на месец: любимата, иначе първата — най-много 12
        const пом = new Map();
        а.снимки.forEach(с => {
          const к = а.вид === 'серия' ? с.мес : (с.д ? с.д.getMonth() : -1);
          if (к < 0 || к > 12) return;
          if (!пом.has(к) || (с.f && !пом.get(к).f)) пом.set(к, с);
        });
        let ключове = [...пом.entries()].sort((x, y) => x[0] - y[0]);
        // 13 снимки (раждането + 1…12 месеца): отпада раждането, не първият рожден ден
        if (ключове.length > 12 && ключове[0][0] === 0) ключове = ключове.slice(1);
        const избор = ключове.slice(0, 12).map(([к, с]) => ({ img: с.img, надпис: а.вид === 'серия' ? (к === 0 ? 'Раждането' : к + ' ' + дума(к, 'месец', 'месеца')) : МЕС[к] }));
        // годината е на бебето, не днешната: роденото през юни 2025 → „2025–2026“; без рожден ден — без година
        const { раждане } = бебе();
        let година = false;
        if (а.вид === 'година') година = а.ид.slice(2);
        else if (раждане) { const г1 = раждане.getFullYear(), г2 = new Date(+плюсМесеци(раждане, 12) - 864e5).getFullYear(); година = г1 === г2 ? String(г1) : г1 + '–' + г2; }
        // заглавието не повтаря годината, която плакатът пише розово отдолу
        const заглавие = (а.вид === 'серия' ? 'Първата година' : 'Нашата година') + (име ? ' на ' + име : '');
        прави(() => Ф.плакат(избор, { заглавие, година, име }), 'baby-land-plakat.jpg', пл);
      });
      дейст.appendChild(пл);
    }
    тяло.appendChild(дейст);
    тяло.appendChild(el('p', 'alb-msg', '')).setAttribute('role', 'status');
    тяло.appendChild(el('p', 'alb-note', Ф
      // 🔎 преглед 27.10: снимките тук са смалени (360 px) — на 10×15 излизат по-меки; обещаваме точно това
      ? '📖 PDF-ът става за всяко фото студио или домашен принтер. 🖼️ Картата 10×15 е за телефона и за печат — снимките тук са смалени, затова на хартия са по-меки от оригинала. Всичко се прави тук, в телефона — нищо не се качва.'
      : '📖 PDF-ът става за всяко фото студио или домашен принтер. Прави се тук, в телефона — нищо не се качва.'));
    const решетка = el('div', 'alb-ph');
    а.снимки.forEach((с, i) => {
      const b = el('button', 'alb-pc' + (с.f ? ' fav' : '')); b.type = 'button';
      b.setAttribute('aria-label', 'Снимка ' + (i + 1) + (с.надпис ? ', ' + с.надпис : '') + (с.д ? ', ' + датаТекст(с.д) : ''));
      b.innerHTML = `<img src="${esc(с.img)}" alt="" loading="lazy" decoding="async" width="160" height="160">${с.f ? '<span class="alb-hrt">❤️</span>' : ''}${с.надпис ? '<span class="alb-cap">' + esc(с.надпис) + '</span>' : ''}`;
      b.addEventListener('click', () => лб(i));
      решетка.appendChild(b);
    });
    тяло.appendChild(решетка);
  }

  function лб(i, безФокус) {
    const кутия = ов.querySelector('.alb-lb');
    const стар = лбИ;
    лбИ = i;
    if (i < 0) {
      кутия.hidden = true;
      // албумът се освежава (махнато ❤️ излиза от „Любимите“; празен албум → списъка)
      if (текущ && текущ.ид !== 's:den') текущ = [...гр.мес, ...гр.год, ...гр.спец].find(а => а.ид === текущ.ид) || null;
      // 🔎 преглед 27.10: скролът стои там, където беше, и фокусът се връща на плочката
      const тяло = ов.querySelector('.alb-body'), y = тяло.scrollTop;
      рисувай();
      if (текущ) тяло.scrollTop = y;
      const плочки = текущ ? тяло.querySelectorAll('.alb-pc') : [];
      const пл = плочки.length && стар >= 0 ? плочки[Math.min(стар, плочки.length - 1)] : null;
      try { (пл || ов.querySelector('.alb-x')).focus({ preventScroll: true }); } catch (e) {}
      return;
    }
    кутия.hidden = false;
    кутия.querySelector('.alb-lb-ed').hidden = true;
    кутия.querySelector('.alb-lb-msg').textContent = '';
    const Ф = физ();
    кутия.querySelector('.alb-k10').hidden = !(Ф && Ф.картичка);
    кутия.querySelector('.alb-kst').hidden = !(Ф && Ф.картичка);
    лбПокажи();
    // ‹ › не местят фокуса: иначе вторият Enter (или двойното докосване с четеца) затваряше снимката
    if (!безФокус) кутия.querySelector('.alb-lb-x').focus({ preventScroll: true });
  }
  function лбСтъпка(d) {
    if (!текущ || лбИ < 0) return;
    const n = текущ.снимки.length;
    лб((лбИ + d + n) % n, true);
    // новата снимка влиза откъм посоката на пръста — само transform, без четене на размери
    const img = ов.querySelector('.alb-lb-img');
    if (img.animate && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      img.animate([{ transform: 'translateX(' + (d * 36) + 'px) scale(.97)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
    }
  }
  function лбПокажи() {
    const кутия = ов.querySelector('.alb-lb');
    const с = текущ.снимки[лбИ];
    const { раждане } = бебе();
    кутия.querySelector('.alb-lb-img').src = с.img;
    кутия.querySelector('.alb-lb-img').alt = с.надпис || 'снимка';
    кутия.querySelector('.alb-lb-n').textContent = (лбИ + 1) + ' / ' + текущ.снимки.length;
    const възр = с.д && !с.сМесец ? възрастНа(с.д, раждане) : '';
    кутия.querySelector('.alb-lb-d').textContent = [с.e + ' ' + с.вид, датаНа(с), възр && възр !== 'чакането' ? възр : ''].filter(Boolean).join(' · ');
    кутия.querySelector('.alb-lb-t').textContent = с.надпис || '';
    const ф = кутия.querySelector('.alb-fav');
    ф.textContent = с.f ? '❤️ Любима' : '🤍 Любима';
    ф.setAttribute('aria-pressed', с.f ? 'true' : 'false');
    const мн = текущ.снимки.length > 1;
    кутия.querySelector('.alb-lb-p').hidden = !мн;
    кутия.querySelector('.alb-lb-s').hidden = !мн;
  }

  // 🔎 преглед 27.10: фотокнигата (#printHolder, z 400) лежи НАД албумите — Esc, „назад“ и Tab са нейни
  const листът = () => { const л = document.getElementById('printHolder'); return л && !л.hidden ? л : null; };
  const затвориЛиста = л => {
    л.hidden = true; document.body.classList.remove('printing-open');
    const кн = ов && ов.querySelector('.alb-act .jr-btn');
    try { if (кн) кн.focus({ preventScroll: true }); } catch (e) {}
  };
  function клавиши(e) {
    if (!ов || ов.hidden) return;
    const л = листът();
    if (л) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); затвориЛиста(л); }
      return;
    }
    const лбОтв = !ов.querySelector('.alb-lb').hidden;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (лбОтв) лб(-1); else if (текущ) { текущ = null; рисувай(); } else затвори();
    } else if (лбОтв && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault(); лбСтъпка(e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.key === 'Tab') {
      // капанът на фокуса: Tab обикаля само в прозореца, не в стаята отдолу
      const корен = лбОтв ? ов.querySelector('.alb-lb') : ов;
      const в = [].filter.call(корен.querySelectorAll('button, input'), x => x.offsetParent !== null && !x.disabled && !x.closest('[hidden]'));
      if (!в.length) return;
      e.stopPropagation();
      if (e.shiftKey && document.activeElement === в[0]) { e.preventDefault(); в[в.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === в[в.length - 1]) { e.preventDefault(); в[0].focus(); }
      else if (!корен.contains(document.activeElement)) { e.preventDefault(); в[0].focus(); }
    }
  }

  function отвори(отБутон) {
    if (!ов) правиОв();
    отКъде = отБутон || document.activeElement;
    сн = всички(); гр = албуми(сн); текущ = null; лбИ = -1;
    if (режим === 'мес' && !гр.мес.length && гр.спец.length) режим = 'спец';
    ов.querySelector('.alb-lb').hidden = true;
    рисувай();
    ов.hidden = false;
    document.documentElement.classList.add('alb-otvoreni');
    window.addEventListener('keydown', клавиши, true);
    // „назад“ на телефона затваря албумите, не стаята отдолу (helper.js затваря стаята при всеки popstate)
    try { history.pushState(Object.assign({}, history.state, { blAlb: 1 }), '', location.href); } catch (e) {}
    requestAnimationFrame(() => { try { ов.querySelector('.alb-x').focus({ preventScroll: true }); } catch (e) {} });
  }
  function затвори(отИсторията) {
    if (!ов || ов.hidden) return;
    ов.hidden = true;
    document.documentElement.classList.remove('alb-otvoreni');
    window.removeEventListener('keydown', клавиши, true);
    if (!отИсторията && history.state && history.state.blAlb) { чакамНазад = true; history.back(); }
    try { if (отКъде && отКъде.isConnected) отКъде.focus({ preventScroll: true }); } catch (e) {}
  }
  // Слушателят е преди този на helper.js (photos.js се зарежда по-рано) — затова
  // stopImmediatePropagation спира затварянето на стаята за „назад“, което е наше.
  window.addEventListener('popstate', e => {
    if (чакамНазад) { чакамНазад = false; e.stopImmediatePropagation(); return; }
    if (ов && !ов.hidden) {
      e.stopImmediatePropagation();
      const л = листът();
      if (л) { затвориЛиста(л); try { history.pushState(Object.assign({}, history.state, { blAlb: 1 }), '', location.href); } catch (er) {} return; }
      const лб0 = ов.querySelector('.alb-lb');
      if (!лб0.hidden || текущ) {
        // стъпка назад вътре в албумите — връщаме и нашето състояние
        if (!лб0.hidden) лб(-1); else { текущ = null; рисувай(); }
        try { history.pushState(Object.assign({}, history.state, { blAlb: 1 }), '', location.href); } catch (er) {}
      } else затвори(true);
    }
  });

  function албумиКарта() {
    const c = card('Албумите 📚 ' + sub('по месеци, по години — и на хартия'));
    const поглед = el('div', 'alb-peek');
    const ред = el('p', 'jr-privacy', 'Снимките, които слагаш из стаите, се подреждат тук сами — по месеци и години, с любими, надписи и фотокнига за печат.');
    const b = el('button', 'jr-btn', '📚 Отвори албумите'); b.type = 'button';
    b.style.minHeight = '44px';
    b.addEventListener('click', () => отвори(b));
    c.appendChild(поглед); c.appendChild(ред); c.appendChild(b);
    // броенето чете медията — чак след като стаята е нарисувана, да не тежи на отварянето
    const после = window.requestIdleCallback || (f => setTimeout(f, 600));
    после(() => {
      if (!c.isConnected) return;
      const всичкиС = всички();
      if (!всичкиС.length) return;
      const г = албуми(всичкиС);
      ред.textContent = всичкиС.length + ' ' + дума(всичкиС.length, 'снимка', 'снимки') + ' · ' + г.мес.length + ' ' + дума(г.мес.length, 'месец', 'месеца') + ' · ' + г.год.length + ' ' + дума(г.год.length, 'година', 'години') + '. Отвори, разгледай, направи книга.';
      всичкиС.slice().sort((a, b2) => (b2.д ? +b2.д : 0) - (a.д ? +a.д : 0)).slice(0, 4).forEach(с => {
        поглед.insertAdjacentHTML('beforeend', `<img src="${esc(с.img)}" alt="" loading="lazy" decoding="async" width="72" height="72">`);
      });
    }, { timeout: 2500 });
    return c;
  }

  window.BL_PHOTOS = { събери, размерВПамет };
  window.BL_ALBUMI = { отвори, всички, албуми };

  // ── свързване: в Инструменти (всичките снимки) и в Моето бебе (албумите) ──
  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
  if (база) window.ROOM_FEATURES['Инструменти'] = root => { база(root); root.appendChild(photoHubCard()); };
  const базаБебе = window.ROOM_FEATURES && window.ROOM_FEATURES['Моето бебе'];
  if (базаБебе) window.ROOM_FEATURES['Моето бебе'] = root => { базаБебе(root); root.appendChild(албумиКарта()); };
})();
