// ═══════════════════════════════════════════════════════════
// ГЛОБАЛНА ТЪРСАЧКА — статии + храни + инструменти на едно място
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // кратки пътища към инструментите
  // 25.11 (одит G-05, видяно: „касичка“ и „помпене“ → 0 резултата; клик → стаята отгоре, картата 3406 px по-долу):
  //   нови пътища за записващите инструменти · card: заглавието на картата → кликът отвежда ДО НЕЯ (разгъва и подсвети)
  //   · preg: само при бременност (иначе „контракции“ лъжеше майка на 8-месечно бебе).
  //   ПЪТ НАЗАД: махни ДОП_ПЪТИЩА и функцията отидиДоКарта (кликът пак само отваря стаята).
  const ДОП_ПЪТИЩА = [
    { kw: 'касичка спестявания спестяване цел събираме пари прасенце', label: 'Касичка-цел', room: 'Инструменти', e: '🐷', card: /Касичка-цел/ },
    { kw: 'разходи харча похарчих сметки колко харчим', label: 'Разходите по месеци', room: 'Инструменти', e: '📊', card: /Разходите по месеци/ },
    { kw: 'помпене помпа изцеждане изцедих изцедено', label: 'Дневник за помпене', room: 'Моето бебе', e: '🍼', card: /Дневник за помпене/ },
    { kw: 'кърмене таймер гърда ляво дясно колко суче кърмих', label: 'Кърмене-таймер', room: 'Моето бебе', e: '🤱', card: /Кърмене-таймер/ },
    { kw: 'лекарство лекарства доза дози нурофен ибупрофен парацетамол сироп свещичка кога дадох преди колко време', label: '⏳ Преди колко време? (лекарства, хранене)', room: null, e: '⏳', home: true },
    { kw: 'лекарство лекарства дадено антибиотик сироп дневник', label: 'Дневник на даденото', room: 'Здраве и SOS', e: '💊', card: /Дневник на даденото/ },
    { kw: 'температура температурен дневник мерене графика градуси', label: 'Температурен дневник', room: 'Здраве и SOS', e: '🌡️', card: /Температурен дневник/ },
    { kw: 'болен болест епизод линия лекар', label: 'Болничният епизод', room: 'Здраве и SOS', e: '🤒', card: /Болничният епизод/ },
    { kw: 'преглед педиатър бележка лекар въпроси', label: 'Бележка за прегледа', room: 'Здраве и SOS', e: '🩺', card: /Бележка за прегледа/ },
    { kw: 'аптечка аптечката лекарства вкъщи срок годност', label: 'Аптечката', room: 'Здраве и SOS', e: '🧰', card: /Аптечка/ },
    { kw: 'нощна лампа светлина тъмно нощем фенерче', label: 'Нощна лампа', room: 'Инструменти', e: '🔦', card: /Нощна лампа/ },
    { kw: 'гардероб гардеробче дрешки бодита имаме', label: 'Гардеробчето', room: 'Инструменти', e: '👕', card: /Гардероб/ },
    { kw: 'подаръци подарък пожелания', label: 'Списък за подаръци', room: 'Инструменти', e: '🎁', card: /Списък за подаръци/ },
    { kw: 'списък списъци пазар бележка задачи', label: 'Моите списъци', room: 'Инструменти', e: '✍️', card: /Моите списъци/ },
    { kw: 'изпито мл милилитри шише изпи', label: 'Изпито днес', room: 'Моето бебе', e: '🍼', card: /Изпито днес/ }
  ];
  const КАРТА_ЗА = {   // заглавията на старите пътища (сверени с card(...) в js/)
    'Калкулатор на растежа': /Калкулатор на растежа/, 'Хранене — кога/колко': /Кога яде за последно/, 'Сънят на бебето': /Сънят днес/,
    'Първите зъбки': /Първите зъбки/, 'Пелени днес': /Пелени днес/, 'Калкулатор на термина': /Кога е терминът/, 'Брояч на ритания': /Брояч на ритания/,
    'Брояч на контракции': /Брояч на контракции/, 'Календар на храните': /Календар на храните/, 'Температурен ориентир': /Температурен ориентир/,
    'Размер на дрешки': /Размер на дрешки/, 'Бебешки бюджет': /Бебешки бюджет/, 'Генератор на имена': /Генератор на имена/, 'Резервно копие': /Резервно копие/
  };
  const САМО_БРЕМЕННА = new Set(['Калкулатор на термина', 'Брояч на ритания', 'Брояч на контракции', 'Чанта за болницата']);
  const SHORTCUTS = [
    { kw: 'растеж тегло персентил крива сзо колко', label: 'Калкулатор на растежа', room: 'Моето бебе', e: '📏' },
    { kw: 'хранене мляко шише кърма колко яде', label: 'Хранене — кога/колко', room: 'Моето бебе', e: '🍼' },
    { kw: 'сън спи заспива нощем', label: 'Сънят на бебето', room: 'Моето бебе', e: '😴' },
    { kw: 'зъб зъбки пробива', label: 'Първите зъбки', room: 'Моето бебе', e: '🦷' },
    { kw: 'пелени мокри каки', label: 'Пелени днес', room: 'Моето бебе', e: '💧' },
    { kw: 'термин седмица бременност кога раждам плод', label: 'Калкулатор на термина', room: 'Бременност', e: '🤰' },
    { kw: 'ритания движения рита', label: 'Брояч на ритания', room: 'Бременност', e: '👣' },
    { kw: 'контракции болка труд', label: 'Брояч на контракции', room: 'Бременност', e: '⏱️' },
    { kw: 'чанта болница родилен багаж', label: 'Чанта за болницата', room: 'Бременност', e: '🧳' },
    { kw: 'захранване храни пюре първа лъжичка', label: 'Календар на храните', room: 'Захранване', e: '🥄' },
    { kw: 'алерген алергия яйце фъстък', label: 'Алергени', room: 'Захранване', e: '⚠️' },
    { kw: 'температура треска градуси', label: 'Температурен ориентир', room: 'Здраве и SOS', e: '🌡️' },
    { kw: 'ваксина имунизация календар', label: 'Имунизационен календар', room: 'Здраве и SOS', e: '💉' },
    { kw: 'sos спешно 112 телефон', label: 'SOS телефони', room: 'Здраве и SOS', e: '🆘' },
    { kw: 'дневник настроение чекин как съм', label: 'Как си днес (минутка за теб)', room: 'Дневник на мама', e: '📖' },
    { kw: 'време за мен таймер почивка', label: 'Време за мен', room: 'Дневник на мама', e: '⏰' },
    { kw: 'скъсай листа яд стрес катарзис', label: 'Скъсай листа', room: 'Дневник на мама', e: '💥' },
    { kw: 'развитие етапи месеци умее', label: 'Етапи на развитие', room: 'Развитие и игри', e: '📈' },
    { kw: 'игра игри какво да правим занимания', label: 'Какво да правим днес', room: 'Развитие и игри', e: '✨' },
    { kw: 'първи път усмивка стъпка дума', label: 'Първите пъти', room: 'Развитие и игри', e: '🌟' },
    { kw: 'размер дрешки дрехи номер', label: 'Размер на дрешки', room: 'Инструменти', e: '📐' },
    { kw: 'бюджет пари разходи струва', label: 'Бебешки бюджет', room: 'Инструменти', e: '💰' },
    { kw: 'име имена генератор', label: 'Генератор на имена', room: 'Инструменти', e: '👶' },
    { kw: 'чеклист списък какво трябва', label: 'Чеклисти', room: 'Инструменти', e: '✅' },
    { kw: 'майчинство обезщетение ноио документи', label: 'Майчинството (БГ)', room: 'Инструменти', e: '🇧🇬' },
    { kw: 'копие резервно бекъп смяна телефон', label: 'Резервно копие', room: 'Инструменти', e: '💾' },
    // 5.5: „Жената в мен“ и „Лабораторията“ ги нямаше тук изобщо — 0 резултата на всяко търсене
    { kw: 'зодия хороскоп звезди днес', label: 'Хороскопът ти днес', room: 'Жената в мен', e: '🔮' },
    { kw: 'карта таро деня гадаене', label: 'Картата на деня', room: 'Жената в мен', e: '🃏' },
    { kw: 'ритуал минутки за мен грижа себе', label: 'Ритуалът на деня', room: 'Жената в мен', e: '🕯️' },
    { kw: 'коя си ти рождена дата число', label: 'Коя си ти', room: 'Жената в мен', e: '💃' },
    { kw: 'тайно дневниче изповед секс', label: 'Тайните', room: 'Жената в мен', e: '🗝️' },
    { kw: 'cv умения майка резюме', label: 'CV на майката', room: 'Жената в мен', e: '📄' },
    { kw: 'комплимент добри думи дъно тежко', label: 'Когато си на дъното', room: 'Жената в мен', e: '💌' },
    { kw: 'опит проверка навик сън бял шум повито', label: 'Тръгни на опит', room: 'Лабораторията', e: '🔬' },
    { kw: 'мит баба бабини деветини проверка', label: 'Митът на седмицата', room: 'Лабораторията', e: '👵' },
    { kw: 'защо буди се среднощ три часа улики', label: 'Защо се буди в 3?', room: 'Лабораторията', e: '🕵️' },
    { kw: 'какво се смени промяна проблем детектив', label: 'Какво се смени', room: 'Лабораторията', e: '🔍' }
  ].concat(ДОП_ПЪТИЩА);
  SHORTCUTS.forEach(sc => { if (!sc.card && КАРТА_ЗА[sc.label]) sc.card = КАРТА_ЗА[sc.label]; if (САМО_БРЕМЕННА.has(sc.label)) sc.preg = true; });
  // бременна ли е сега: има дата на последна менструация (или изобщо няма родено бебе)
  const бременна = () => { try { if (window.BL_EXPECT && BL_EXPECT.lmp && BL_EXPECT.lmp()) return true; } catch (e) {} if (lsGet('bl_lmp', '')) return true; const б = lsGet('bl_baby', {}); return !(б && б.birth); };

  // ➡️ 25.11 (G-05): отвежда до самата карта — както „Печатаемата кутия“ (printbox.js): отвори стаята, намери
  //    картата по заглавието, разгъни я, моментален скрол (плавният се прекъсва от влизащите карти), втори опит
  //    след влизането, подсвети (.pb-flash). Няма ли я — казва го, не мълчи.
  function отидиДоКарта(r) {
    if (r.home) {
      try { if (window.MamaHelper) MamaHelper.close(); } catch (e) {}
      setTimeout(() => { const к = document.querySelector('#todaySection .ch-card'); if (к) { к.scrollIntoView({ behavior: 'auto', block: 'start' }); к.classList.add('pb-flash'); setTimeout(() => к.classList.remove('pb-flash'), 1700); } }, 120);
      return;
    }
    if (!window.MamaHelper) return;
    MamaHelper.open(r.room);
    if (!r.card) return;
    let опити = 0, намерена = null;
    const намери = () => [...document.querySelectorAll('#roRoom .jr-card:not(.toc-card)')].find(c => { const t = c.querySelector('.jr-title'); return t && r.card.test(t.textContent); });
    const скочи = () => {
      const к = намери(); if (!к) return false; намерена = к;
      if (к.classList.contains('folded')) { const б = к.querySelector('.jr-title .fold-btn'); if (б) б.click(); }
      к.scrollIntoView({ behavior: 'auto', block: 'start' }); return true;
    };
    const опит = () => {
      if (скочи()) { setTimeout(() => { скочи(); if (намерена) { намерена.classList.add('pb-flash'); setTimeout(() => намерена.classList.remove('pb-flash'), 1700); } }, 450); return; }
      if (++опити < 12) return setTimeout(опит, 200);
      if (window.BL_FX && BL_FX.cheer) BL_FX.cheer('Картата е в тази стая — превърти надолу 👇');
    };
    setTimeout(опит, 60);
  }

  const norm = s => (s || '').toLowerCase().replace(/[^\wа-яё\s]/gi, ' ');

  function search(q) {
    const nq = norm(q).trim();
    if (nq.length < 2) return [];
    const words = nq.split(/\s+/);
    // 8.3.3: правописна прошка — „темпертура“ намира „температура“.
    // Истинска проверка за ЕДНА разлика (изпусната/сгрешена/излишна буква).
    const близо1 = (а, б) => {
      const dl = а.length - б.length;
      if (dl < -1 || dl > 1) return false;
      let i = 0, j = 0, гр = 0;
      while (i < а.length && j < б.length) {
        if (а[i] === б[j]) { i++; j++; continue; }
        if (++гр > 1) return false;
        if (dl === 0) { i++; j++; }        // сгрешена буква
        else if (dl > 0) i++;               // излишна в а
        else j++;                           // изпусната в а
      }
      return гр + (а.length - i) + (б.length - j) <= 1;
    };
    // 🔴 01.09, НАМЕРЕНО В БРАУЗЪРА: „кога ДА махна биберона" връщаше
    //    Ягода, Женската консултация и целия календар месец по месец.
    //    Причината: думите се търсеха като ПОДНИЗ където и да е —
    //    h.includes("да") пали „ягоДА", h.includes("кога") пали „КОГА какви
    //    изследвания". Всяка статия с „да" в резюмето взимаше точка и при
    //    18 слота списъкът се пълнеше изцяло с шум.
    //    Главният двигател (js/helper.js) отдавна е решил това: късият гол
    //    ключ лови по НАЧАЛО НА ДУМА. Търсачката е писана отделно и не
    //    беше получила урока.
    //    ⚠️ Кирилицата НЯМА граница на дума в JavaScript — затова границата
    //    е изписана явно, а не с обратна наклонена черта и b (то намира НУЛА).
    const СЛУЖЕБНИ = new Set(['да', 'и', 'а', 'но', 'или', 'се', 'си', 'е', 'са', 'ще', 'че',
      'за', 'на', 'в', 'с', 'от', 'по', 'до', 'при', 'като', 'ли', 'то', 'ми', 'му', 'им',
      'ги', 'го', 'я', 'ме', 'те', 'ти', 'аз', 'ни', 'ви', 'не', 'бе',
      // 🔴 втори пас: махането на служебните не стигна. Остана „кога", което
      //    е СКЕЛЕ на въпроса, не тема — то само палеше „Женската консултация:
      //    КОГА какви изследвания" и целия календар месец по месец. Всяка
      //    статия, чието резюме съдържа въпросителна дума, взимаше точка.
      'кога', 'какво', 'как', 'къде', 'защо', 'колко', 'кой', 'коя', 'кое', 'кои',
      'каква', 'какъв', 'какви', 'дали', 'може', 'мога', 'трябва', 'има', 'имам']);
    const започваДума = (h, w) => {
      let j = h.indexOf(w);
      while (j >= 0) {
        const преди = j === 0 ? ' ' : h[j - 1];
        if (!/[а-яa-z0-9]/.test(преди)) return true;
        j = h.indexOf(w, j + 1);
      }
      return false;
    };
    const hit = (hay) => {
      const h = norm(hay);
      let sc = words.reduce((s, w) => {
        if (w.length < 2 || СЛУЖЕБНИ.has(w)) return s;
        // късата дума трябва да ЗАПОЧВА дума в сеното; дългата може и насред
        const попада = w.length > 4 ? h.includes(w) : започваДума(h, w);
        return s + (попада ? (w.length > 3 ? 2 : 1) : 0);
      }, 0);
      if (!sc) {
        // чак ако нищо не съвпада точно — думите на сеното една по една
        const хДуми = h.split(/\s+/);
        words.forEach(w => {
          if (w.length > 4 && хДуми.some(х => х.length > 4 && близо1(w, х))) sc += 1;
        });
        if (sc) sc = -sc;   // 25.11 (G-05): отрицателно = „само прилича“ (виж долу)
      }
      return sc;
    };
    const out = [];
    const _hit = hit;
    // 25.11 (одит G-05: „колики“ връщаше колички): правописната прошка помага само когато НИЩО не съвпада
    //    точно. Има ли поне един точен резултат, „прилика с една буква“ не се показва. ПЪТ НАЗАД: махни филтъра долу.
    const точни = { има: false };
    const hitЗапомни = hay => { const s = _hit(hay); if (s > 0) точни.има = true; return s; };
    // статии
    const сложи = (s, о) => { if (s) out.push(Object.assign(о, { s: Math.abs(s) + (о.доп || 0), прилича: s < 0 })); };
    (window.BL_ARTICLES_DATA || []).forEach(a => сложи(hitЗапомни(a.title + ' ' + a.summary + ' ' + a.tags.join(' ') + ' ' + a.room), { type: 'article', id: a.id, label: a.title, sub: a.room, e: a.emoji }));
    // храни
    (window.BL_DATA ? BL_DATA.foods : []).forEach(f => сложи(hitЗапомни(f.n + ' ' + f.cat + ' ' + f.how), { доп: 0.5, type: 'room', room: 'Захранване', label: f.n, sub: 'Храна · от ' + f.from + ' м.', e: f.e }));
    // инструменти (25.11, G-05: +1,5 — търсеният бутон е над статиите за него; бременните — само при бременност)
    const б = бременна();
    SHORTCUTS.forEach(sc => { if (sc.preg && !б) return; сложи(hitЗапомни(sc.kw + ' ' + sc.label), { доп: 1.5, type: 'room', room: sc.room, label: sc.label, sub: (sc.room || 'Начало') + ' · инструмент', e: sc.e, card: sc.card, home: sc.home }); });
    // речникът на мама
    (window.BL_DATA && BL_DATA.glossary ? BL_DATA.glossary : []).forEach(g => сложи(hitЗапомни(g.t + ' ' + g.d), { type: 'room', room: 'Инструменти', label: g.t, sub: 'Речник на мама 📖', e: '📖' }));
    return out.filter(r => !(точни.има && r.прилича)).sort((a, b) => b.s - a.s).slice(0, 18);
  }

  // ═══════════ 💬 ПРИЯТЕЛСКОТО ПОЛЕ — балончето те посреща и отговаря ═══════════

  const HELLO = [
    'Кажи ми какво те мъчи 💜',
    'Пиши ми както на приятелка…',
    'Тук съм. За какво мислиш?',
    'Какво искаш да намерим заедно?',
    'Питай ме за всичко — не хапя. 😊'
  ];
  const IDEAS = [
    ['🌡️', 'има температура'], ['😴', 'не спи нощем'], ['🥄', 'кога захранване'],
    ['💜', 'уморена съм'], ['🩹', 'обрив по кожата'], ['🧿', 'кажи ми един мит'],
    ['😄', 'разсмей ме'], ['🎈', 'коя си ти']
  ];
  // към коя стая води темата
  const ROUTE = [
    [/захранв|пюре|храна|алерген|лъжичк|яде|мляко храна|меню/i, 'Захранване'],
    [/температур|болн|обрив|кашл|хрема|лекар|ваксин|градус|°|повръщ|диари|зъб/i, 'Здраве и SOS'],
    [/бремен|термин|ритан|гаден|раждан|коремч|седмиц/i, 'Бременност'],
    [/умор|издържам|тъжн|сама|вина|тревог|плача|време за мен|дневник/i, 'Дневник на мама'],
    [/говор|прохожд|игр|умени|развит/i, 'Развитие и игри'],
    [/размер|списък|бюджет|количк|столче|документ|ясла|ноио|майчинств/i, 'Инструменти']
  ];
  const routeRoom = q => (ROUTE.find(([re]) => re.test(q)) || [null, 'Моето бебе'])[1];

  function greet() {
    const box = $('searchResults');
    const h = new Date().getHours();
    const hi = h < 5 ? 'Будна в малките часове… 🌙' : h < 11 ? 'Добро утро! 🌸' : h < 18 ? 'Здравей! 🌸' : 'Добър вечер! 🌙';
    // 8.3.6: празното поле предлага 3 неща ПО ЧАСА — нощем не се предлага
    // захранване, а сън; сутрин — денят напред
    const поЧаса = h < 5
      ? [['😴', 'не спи нощем'], ['🌡️', 'има температура'], ['💜', 'не издържам']]
      : h < 11
        ? [['🌷', 'как да започна деня'], ['🥄', 'какво да яде днес'], ['🧸', 'на какво да си играем']]
        : h < 18
          ? [['🥄', 'кога захранване'], ['🩹', 'обрив по кожата'], ['😄', 'разсмей ме']]
          : [['😴', 'вечерен ритуал'], ['🛁', 'къпане преди сън'], ['💜', 'уморена съм']];
    // 8.3.5: последните ѝ търсения — пак на едно докосване
    // ⚖️ г09-скептик: поправката спря НОВИТЕ тежки думи да влизат, но вече
    //    записаното си остана в bl_search_hist — и продължаваше да стои като
    //    видим чип, и да пътува в резервното копие (rooms2.js изсипва всички
    //    bl_* ключове). Чистим го при първото рисуване, а не чакаме мама да
    //    се сети за „✕ забрави ги“.
    let история = lsGet('bl_search_hist', []);
    if (!Array.isArray(история)) история = [];   // внесено чуждо/старо копие
    if (window.BL_MOTHERFLAG) {
      try {
        const чиста = история.filter(t => !BL_MOTHERFLAG(t));
        if (чиста.length !== история.length) { lsSet('bl_search_hist', чиста); история = чиста; }
      } catch (e) {
        // 15.11 (одит): без знание пресяването не може да мине → без „Скоро търси“, не непресято;
        //   щом знанието дойде и полето е още празно — поздравът се рисува наново, вече пресят.
        if (!window.KB) {
          история = [];
          const т = setInterval(() => {
            if (!window.KB && !window.BL_KB_PADNA) return; clearInterval(т);
            const inp = $('searchInput'), ов = $('searchOverlay');
            if (window.KB && inp && ов && !ов.hidden && !norm(inp.value).trim()) greet();
          }, 200);
        }
      }
    }
    const скорошни = история.slice(-4).reverse();
    box.innerHTML = `
      <div class="sf-greet">
        <span class="sf-ava"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span>
        <div class="sf-bub"><strong>${hi}</strong><br>${HELLO[Math.floor(Math.random() * HELLO.length)]}</div>
      </div>
      ${скорошни.length ? `<p class="sf-lead">Скоро търси:</p>
      <div class="sf-ideas">${скорошни.map(t => `<button class="sf-idea sf-recent" type="button" data-q="${esc(t)}">🕐 ${esc(t)}</button>`).join('')}<button class="sf-idea sf-forget" type="button">✕ забрави ги</button></div>` : ''}
      <p class="sf-lead">Например:</p>
      <div class="sf-ideas">${поЧаса.concat(IDEAS.slice(5)).map(([e, t]) => `<button class="sf-idea" type="button" data-q="${t}">${e} ${t}</button>`).join('')}</div>`;
    box.querySelectorAll('.sf-idea:not(.sf-forget)').forEach(b => b.addEventListener('click', () => {
      $('searchInput').value = b.dataset.q;
      draw(b.dataset.q);
    }));
    // 🤍 изход от собствените ѝ думи: редът „Скоро търси“ се маха с едно докосване
    const забрави = box.querySelector('.sf-forget');
    if (забрави) забрави.addEventListener('click', () => { lsSet('bl_search_hist', []); greet(); });
  }

  // отговорът на балончето — топъл, преди резултатите
  function answerBubble(q) {
    const nq = norm(q).trim();
    // 🤍 МАЙКАТА е преди всичко останало — същата проверка като в стаите
    // (helper.js), ПРЕДИ smalltalk, за да не я изпревари „мразя…"-интентът.
    if (window.BL_MOTHERFLAG && window.KB) {
      const lvl = BL_MOTHERFLAG(q);
      if (lvl) {
        document.dispatchEvent(new CustomEvent('bl:alarm'));
        const A = lvl === 'loss' ? KB.lossAnswer : lvl === 'mother' ? KB.motherFlagAnswer : KB.heavyFlagAnswer;
        const sos = lvl === 'mother' ? '<br><br><a class="ro-sos sf-112" href="tel:112">📞 Обади се на 112</a>' : '';
        return { cls: lvl === 'mother' ? 'sf-sos' : 'sf-chat', html: `<strong>${A.core}</strong><br>${A.tip}${sos}`, sos: true };
      }
    }
    // 🤰 спешното при бременната — преди бебешките флагове
    if (window.BL_PREGFLAG && window.KB && BL_PREGFLAG(q)) {
      document.dispatchEvent(new CustomEvent('bl:alarm'));
      return { cls: 'sf-sos', html: `<strong>${KB.pregFlagAnswer.core}</strong><br>${KB.pregFlagAnswer.tip}
        <a class="ro-sos sf-112" href="tel:112">📞 Обади се на 112</a>`, sos: true };
    }
    // 🚨 спешното винаги първо — същата проверка като в стаите
    if (window.BL_REDFLAG && BL_REDFLAG(q)) {
      return { cls: 'sf-sos', html: `<strong>Спри при мен — това е за ЛЕКАР, веднага. 🚨</strong><br>Не губи минута с приложения.
        <a class="ro-sos sf-112" href="tel:112">📞 Обади се на 112</a>`, sos: true };
    }
    // 💬 приятелски разговор (поздрав, виц, „коя си“…)
    if (window.BL_SMALLTALK) {
      const st = BL_SMALLTALK.respond(q, 'Бали', null);
      if (st) return { cls: 'sf-chat', html: st.text };
    }
    // 🧠 истински отговор от базата — с покана към стаята
    if (window.KB) {
      const room = routeRoom(nq);
      let best = null, bestScore = 0;
      KB.entries.forEach(e => {
        let sc = 0;
        e.keys.forEach(k => { const nk = norm(k).trim(); if (nk.length > 3 && nq.includes(nk)) sc += 2; });
        if (e.room === room) sc *= 1.4;
        if (sc > bestScore) { bestScore = sc; best = e; }
      });
      if (best && bestScore >= 2) {
        const p = { 'Бременност': 'Мила 🌸', 'Моето бебе': 'Мира 📏', 'Захранване': 'Малина 🍓', 'Здраве и SOS': 'Вита 💚', 'Дневник на мама': 'Луна 🌙', 'Развитие и игри': 'Искра ✨', 'Инструменти': 'Дара 🎀', 'Жената в мен': 'Ния 💃', 'Лабораторията': 'Ема 🔬' }[best.room];
        return {
          cls: 'sf-ans', html: `<strong>${best.title}</strong><br>${best.core.slice(0, 190)}…
            <button class="sf-more" type="button" data-room="${best.room}" data-q="${q.replace(/"/g, '')}">💬 Продължи с ${p} →</button>`
        };
      }
    }
    return null;
  }

  let _drawSig = '';   // проход 4: подпис на набора — стъпаловидно само при СМЯНА (не при всеки клавиш)
  // ── 📓 ТЕФТЕРЪТ С ПРОПУСКИТЕ ──
  // Единственият канал, по който истинска майка казва какво ѝ липсва.
  // Затова не бива да се пълни с шума на собственото си писане.
  let _миссЧас = null;
  const започваС = (дълъг, къс) => дълъг.length > къс.length && дълъг.indexOf(къс) === 0;
  function изчистиНачалата(q) {
    const m = lsGet('bl_agent_miss', []);
    const чист = m.filter(x => !започваС(q, String(x.q || '')));
    if (чист.length !== m.length) lsSet('bl_agent_miss', чист);
  }
  function отложиПропуск(q) {
    clearTimeout(_миссЧас);
    _миссЧас = setTimeout(function () {
      const т = norm(q).trim();
      if (т.length < 6) return;                // две-три букви не са въпрос
      if (т.split(/\s+/).length < 2) return;   // и една дума не е
      изчистиНачалата(q);
      const m = lsGet('bl_agent_miss', []);
      const кратък = q.slice(0, 120);
      if (m.some(x => x.q === кратък)) return;
      if (m.some(x => започваС(String(x.q || ''), кратък))) return;
      m.push({ q: кратък, room: 'търсачката', ts: Date.now() });
      lsSet('bl_agent_miss', m.slice(-80));
    }, 1200);
  }

  // ⚡ 14.11 · kb.js е async (1,55 МБ вече не спира старта). Пише ли мама, преди знанието да е дошло —
  //   кратко „секунда“ и търсенето се повтаря само, щом дойде. Иначе спешната проверка гърмеше
  //   (BL_REDFLAG чете KB.redFlags) и полето оставаше празно. ПЪТ НАЗАД: махни този блок и реда в draw().
  // 🚨 17.11 · СПЕШНОТО НЕ ЧАКА ЗНАНИЕТО и тук: преди kb.js (на бавна мрежа ~10 s) „бебето не диша“ виждаше само
  //   „Секунда — зареждам…“ (мерено, dev/proba/kb_zadarzhano_proba.js). helper.js изнася същата тясна проверка като в
  //   стаите (window.BL_SPESHNO_BEZ_KB → 'дете' | 'майка' | null) — тук над „секундата“ излиза същата бележка със 112.
  //   Хване ли се веднъж, стои до знанието (мама дописва — бележката не мига и не изчезва); щом знанието дойде,
  //   draw() показва пълния спешен отговор. ПЪТ НАЗАД: махни _спешноБезКБ/СПЕШНО_БЕЗ_КБ и двата реда с тях долу,
  //   и върни `function чакайЗнанието(box) {` и `чакайЗнанието(box)` в draw().
  let _спешноБезКБ = null;
  const СПЕШНО_БЕЗ_КБ = {
    'дете': '🚨 Ако бебето не диша, посинява, има гърч, не се събужда или кърви силно — звънни на 112 СЕГА. Пълният отговор идва след секунди.',
    'майка': '🤍 Ако си в опасност или мислиш да си навредиш — звънни на 112 сега. Тук съм, зареждам отговора си.',
    'бременна': '🤰 Ако кървиш силно, изтекоха ти водите, бебето не мърда или имаш силна болка — звънни на 112 или тръгни към болницата сега. Пълният отговор идва след секунди.'
  };
  let _чакаЗнание = 0;
  function чакайЗнанието(box, q) {
    if (!_спешноБезКБ && window.BL_SPESHNO_BEZ_KB) { try { const в = BL_SPESHNO_BEZ_KB(q); _спешноБезКБ = СПЕШНО_БЕЗ_КБ[в] ? в : null; } catch (e) {} }
    box.innerHTML = (_спешноБезКБ ? '<div class="sf-answer sf-sos"><span class="sf-ava sf-ava-s"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span><div class="sf-bub"><strong>' + СПЕШНО_БЕЗ_КБ[_спешноБезКБ] + '</strong><br><a class="ro-sos sf-112" href="tel:112">📞 Обади се на 112</a></div></div>' : '') +
      '<div class="sf-answer sf-chat"><span class="sf-ava sf-ava-s"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span><div class="sf-bub">Секунда — зареждам отговорите… 🤍</div></div>';
    _drawSig = '';
    if (_чакаЗнание) return;
    _чакаЗнание = setInterval(() => {
      // 15.11 (одит): не дойде ли знанието (onerror в index.html) — казваме го, не чакаме вечно
      if (!window.KB && window.BL_KB_PADNA) {
        clearInterval(_чакаЗнание); _чакаЗнание = 0;
        const б = $('searchResults'); if (б) б.innerHTML = '<div class="sf-answer sf-chat"><span class="sf-ava sf-ava-s"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span><div class="sf-bub">Отговорите не се заредиха — провери интернета и опитай пак. 🤍</div></div>';
        return;
      }
      if (!window.KB) return;
      clearInterval(_чакаЗнание); _чакаЗнание = 0;
      const inp = $('searchInput'), ов = $('searchOverlay');
      if (inp && ов && !ов.hidden) draw(inp.value);
    }, 150);
  }

  function draw(q) {
    const box = $('searchResults');
    if (!norm(q).trim() || norm(q).trim().length < 2) { greet(); return; }
    if (!window.KB) { чакайЗнанието(box, q); return; }
    const res = search(q);
    // успешният въпрос изтрива своите недописани парчета от тефтера
    if (res.length) { clearTimeout(_миссЧас); изчистиНачалата(q); }
    const ans = answerBubble(q);
    const sig = (ans ? ans.cls + ':' + ans.html.length : '-') + '#' + res.map(r => r.id || r.label).join('|');
    const fresh = (sig !== _drawSig); _drawSig = sig;
    box.innerHTML = '';
    if (ans) {
      const a = document.createElement('div');
      a.className = 'sf-answer ' + ans.cls;
      a.innerHTML = `<span class="sf-ava sf-ava-s"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span><div class="sf-bub">${ans.html}</div>`;
      box.appendChild(a);
      const more = a.querySelector('.sf-more');
      if (more) more.addEventListener('click', () => {
        close();
        if (window.MamaHelper) { MamaHelper.open(more.dataset.room); setTimeout(() => MamaHelper.ask(more.dataset.q), 1200); }
      });
      if (ans.sos) return; // при спешност — само това
    }
    if (!res.length) {
      if (!ans) {
        // 8.3.4: пропускът се записва — злато за библиотеката (както в чата)
        // 🔴 01.09: тук се записваше пропуск на ВСЯКА БУКВА, защото draw()
        //    виси на 'input'. Тефтерът се пълнеше с недописани парчета на
        //    въпроси, на които Е отговорено. Сега записът чака и чисти.
        отложиПропуск(q);
        const room = routeRoom(norm(q));
        const d = document.createElement('div');
        d.className = 'sf-answer sf-chat';
        d.innerHTML = `<span class="sf-ava sf-ava-s"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span>
          <div class="sf-bub">Това още не го намирам с тези думи… но не се отказвай! 💜
            <button class="sf-more" type="button" data-room="${room}" data-q="${q.replace(/"/g, '')}">💬 Попитай помощничката в „${room}“ →</button></div>`;
        box.appendChild(d);
        d.querySelector('.sf-more').addEventListener('click', () => {
          close();
          if (window.MamaHelper) { MamaHelper.open(room); setTimeout(() => MamaHelper.ask(q), 1200); }
        });
      }
      return;
    }
    // 8.3.5: намереното се помни — следващия път е на едно докосване
    // 🤍 05.08: но НЕ и тежкото. „бие ме“, „проверява ми телефона“ се пазеше
    //    дословно и после стоеше на празния екран пред всеки, който отвори
    //    търсачката. Проверката вече съществува 90 реда по-горе.
    if (norm(q).trim().length > 2 && !(window.BL_MOTHERFLAG && BL_MOTHERFLAG(q))) {
      const х = lsGet('bl_search_hist', []).filter(x => x !== q.slice(0, 60));
      х.push(q.slice(0, 60));
      lsSet('bl_search_hist', х.slice(-8));
    }
    // проход 4: резултатите капят стъпаловидно (само при нов набор — иначе мига при писане)
    const list = document.createElement('div');
    if (fresh) list.className = 'bl-stagger';
    const lead = document.createElement('p');
    lead.className = 'sf-found';
    lead.textContent = ans ? 'И ето какво още намерих за теб:' : 'Ето какво намерих за теб:';
    list.appendChild(lead);
    res.forEach(r => {
      const b = document.createElement('button');
      b.className = 'search-res';
      b.type = 'button';
      b.innerHTML = `<span class="sr-e">${r.e}</span><span class="sr-txt"><span class="sr-label">${r.label}</span><span class="sr-sub">${r.type === 'article' ? '📄 Статия · ' : ''}${r.sub}</span></span><span class="sr-arr">→</span>`;
      b.addEventListener('click', () => {
        close();
        if (r.type === 'article' && window.BL_ARTICLES) BL_ARTICLES.open(r.id);
        else if (r.card || r.home) отидиДоКарта(r);   // 25.11 (G-05): до самата карта
        else if (window.MamaHelper) MamaHelper.open(r.room);
      });
      list.appendChild(b);
    });
    box.appendChild(list);
  }

  // 📱 16.11: телефонното „Назад“ затваря търсачката, не стаята под нея / не излиза от приложението
  //   (store.js, BL_НАЗАД). ПЪТ НАЗАД: махни двата израза с BL_НАЗАД.
  function open() { $('searchOverlay').hidden = false; document.body.style.overflow = 'hidden'; $('searchInput').value = ''; draw(''); setTimeout(() => $('searchInput').focus(), 50); if (window.BL_НАЗАД) BL_НАЗАД.отвори('търсачка', close); }
  function close() { $('searchOverlay').hidden = true; document.body.style.overflow = ''; _drawSig = ''; if (window.BL_НАЗАД) BL_НАЗАД.затворен('търсачка'); }

  document.addEventListener('DOMContentLoaded', () => {
    const trig = $('searchTrigger');
    if (trig) { trig.innerHTML = '💬 Кажи ми какво търсиш — пиши като на приятелка…'; trig.addEventListener('click', open); }
    const inp = $('searchInput');
    if (inp) {
      inp.placeholder = 'напр. „не спи нощем“ или „уморена съм“…';
      inp.addEventListener('input', () => draw(inp.value));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); draw(inp.value); } });
    }
    // 🎤 диктовка в полето
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const bar = document.querySelector('.search-bar');
    if (SR && bar && !document.getElementById('sfMic')) {
      const mic = document.createElement('button');
      mic.id = 'sfMic'; mic.className = 'sf-mic'; mic.type = 'button'; mic.textContent = '🎤';
      mic.setAttribute('aria-label', 'Кажи го на глас');
      let rec = null;
      mic.addEventListener('click', () => {
        if (rec) { rec.stop(); return; }
        rec = new SR(); rec.lang = 'bg-BG';
        mic.classList.add('rec');
        rec.onresult = e => { const t = e.results[0][0].transcript; $('searchInput').value = t; draw(t); };
        rec.onend = () => { mic.classList.remove('rec'); rec = null; };
        rec.onerror = () => { mic.classList.remove('rec'); rec = null; };
        try { rec.start(); } catch (e) { mic.classList.remove('rec'); rec = null; }
      });
      bar.insertBefore(mic, document.getElementById('searchClose'));
    }
    const cl = $('searchClose'); if (cl) cl.addEventListener('click', close);
    const ov = $('searchOverlay'); if (ov) ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov && !ov.hidden) close(); });
  });
  window.BL_SEARCH = { open, close };
})();
