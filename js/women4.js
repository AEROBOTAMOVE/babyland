// ═══════════════════════════════════════════════════════════
// СТАЯ 8, част 4 — ВТОРИЯТ ПЛАСТ (армия 29.07)
//
// Четири лещи претърсиха стаята и намериха 32 дупки. Това са картите,
// които ги затварят — всяка минала през адверсарен съдник, който пита:
// дублира ли нещо съществуващо, звучи ли като брошура, и — най-важното —
// приема ли за даденост партньор, пари или свободно време.
//
// 💸 Моите пари · 💼 Обратното броене до работа · 📷 Влез в кадъра
// 🌙 Колко искам от теб днес · 🎧 Какво беше мое · 🩺 Моят преглед
// 🌙 Нощната смяна · 🌆 Вечерта, която е моя · 🤍 Когато вкъщи не е безопасно
// 💃 Как да те наричам · 💬 Репликата в джоба · 🩺 Моят ред при лекаря
// 🤰 Ти, докато чакаш · 👵 Майка ми · 🕊️ Границата с добро лице · 🧵 Нишката
// 🚀 Искам повече · 🫂 Днес те чета · 🔥 Яростта, която има адрес
// 🗣️ Невидимият товар — на глас · 📷 Едно кадърче на месец
// 🤍 Тук няма да те питам за бебето · 🕊️ Как роди
//
// ЖЕЛЯЗНО: Ния не диагностицира. Медицинското е при Вита. Никакви дози.
// Нищо, което брои какво НЕ е направила.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // ⚠️ връща true/false — картите със снимки трябва да знаят, че паметта се е напълнила
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const месец = () => today().slice(0, 7);
  const дни = d => { if (!d) return NaN; const a = new Date(localDate(new Date())), b = new Date(d); return isNaN(b) ? NaN : Math.round((b - a) / 86400000); };
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const случайно = a => a[Math.floor(Math.random() * a.length)];
  const пауза = () => !!(window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused());

  // ── общ градивен блок: списък с добавяне + готови подсказки ─────────
  // Същият модел като „Чантата“ — мама никога не гледа празен екран.
  function списък(опции) {
    const кутия = el('div', 'jr-wins');
    const данни = опции.данни;
    const рисувай = () => {
      кутия.innerHTML = '';
      if (!данни.length && опции.празно) кутия.appendChild(el('p', 'jr-privacy', опции.празно));
      данни.slice().reverse().forEach((x, ri) => {
        const i = данни.length - 1 - ri;
        const ред = el('div', 'jr-winrow');
        const текст = typeof x === 'string' ? x : x.t;
        const б = el('button', 'jr-win' + (x.done ? ' done' : ''),
          (опции.отмятане ? '<span class="jr-check">' + (x.done ? '✔' : '') + '</span> ' : '') +
          esc(текст) + (x.d ? '<small class="wm-when"> · ' + x.d + '</small>' : ''));
        б.type = 'button';
        б.addEventListener('click', () => {
          if (!опции.отмятане) return;
          x.done = !x.done; if (x.done) { x.d = today(); fx().buzz(8); } else delete x.d;
          опции.запази(); рисувай();
        });
        const трий = el('button', 'jr-x', '✕'); трий.type = 'button';
        // ♿ 11.08 (клавиатура-четец): списъкът дава десетина еднакви „✕" — четецът
        //    не казваше кое ще махне, а тапът е необратим.
        трий.setAttribute('aria-label', 'Махни „' + (typeof x === 'string' ? x : x.t) + '“');
        трий.addEventListener('click', () => { данни.splice(i, 1); опции.запази(); рисувай(); });
        ред.appendChild(б); ред.appendChild(трий); кутия.appendChild(ред);
      });
      if (опции.подсказки) {
        const взети = new Set(данни.map(x => typeof x === 'string' ? x : x.t));
        const свободни = опции.подсказки.filter(т => !взети.has(т));
        if (свободни.length) {
          const п = el('div', 'nl-ideas');
          свободни.slice(0, 4).forEach(т => {
            const b = el('button', 'nl-idea', esc(т)); b.type = 'button';
            b.addEventListener('click', () => { данни.push(опции.отмятане ? { t: т } : { t: т, d: today() }); опции.запази(); рисувай(); fx().buzz(8); });
            п.appendChild(b);
          });
          кутия.appendChild(п);
        }
      }
    };
    const ред = el('div', 'jr-addrow');
    const вход = el('input', 'jr-word'); вход.placeholder = опции.подкана || 'добави…'; вход.maxLength = 90;
    const плюс = el('button', 'jr-chip', '+'); плюс.type = 'button';
    // ♿ 11.08 (клавиатура-четец): този списък-градител се ползва десетина пъти в
    //    една стая — толкова еднакви бутона „плюс", без да личи в КОЙ списък
    //    добавят. Името взима подканата на самото поле, която вече казва кое е.
    плюс.setAttribute('aria-label', 'Добави — ' + (опции.подкана || 'нов ред'));
    const сложи = () => {
      const v = вход.value.trim(); if (!v) return;
      данни.push(опции.отмятане ? { t: v.slice(0, 90) } : { t: v.slice(0, 90), d: today() });
      опции.запази(); вход.value = ''; рисувай(); fx().buzz(10);
    };
    плюс.addEventListener('click', сложи);
    вход.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); сложи(); } });
    ред.appendChild(вход); ред.appendChild(плюс);
    рисувай();
    return { кутия, ред, рисувай };
  }

  // ═══════════ 💸 МОИТЕ ПАРИ ═══════════
  const ПАРИ_ПРИМЕРИ = [
    'кафе навън — седнала, не в движение',
    'фризьор — цял, не подстригване в кухнята',
    'дреха, която ми става СЕГА',
    'такси, за да не мъкна количката по стълбите',
    'книга, която не е за бебета',
    'нещо, което просто ми хареса'
  ];
  const ПАРИ_РЕПЛИКИ = [
    ['към него', 'Искам да се разберем за сума, която е моя всеки месец — да не се налага да питам за всяко нещо.'],
    ['към него', 'Не искам да ти се отчитам за кафе. Нека има малко, което е просто мое.'],
    ['към работодател', 'Бих искала да говорим за условията при връщането ми — работно време и заплащане.'],
    ['към себе си', 'Това не е разход. Това е единственото нещо тази седмица, което е за мен.']
  ];
  function париCard() {
    const c = card('Моите пари 💸 ' + sub('не бюджетът на къщата · твоите'));
    c.appendChild(el('p', 'jr-privacy',
      // 11.08: беше „Спряха ти заплатата“ — приемаше за дадено, че е имало заплата.
      //    Студентка, самонаета, жена без свои доходи преди раждането четеше
      //    изречение за чужд живот в картата, направена точно за нея.
      'Каквото и да си изкарвала преди, сега е по-малко твое. Само че никой не го казва така — казват „сега си вкъщи“ и толкова. И в един момент се хващаш, че се извиняваш, докато искаш пари за червило. Тук няма да броим пелени и няма да правим семеен бюджет — за това си има други места. Тук са твоите пари.'));

    const st = load('bl_wm_money', { sum: '', spent: [] });
    const запази = () => save('bl_wm_money', st);

    // (1) колко искам да е мое — свободен текст, за да може „колкото за фризьор“
    const редСума = el('div', 'jr-addrow');
    const сума = el('input', 'jr-word');
    сума.placeholder = 'Колко искам да е мое всеки месец…';
    сума.maxLength = 60; сума.value = st.sum || '';
    сума.addEventListener('change', () => { st.sum = сума.value.trim().slice(0, 60); запази(); });
    сума.addEventListener('blur', () => { st.sum = сума.value.trim().slice(0, 60); запази(); });
    редСума.appendChild(сума);
    c.appendChild(редСума);
    // Ния НЕ коментира сумата. Никога, каквато и да е.
    c.appendChild(el('p', 'jr-privacy', 'Няма да коментирам числото. То е твое и не се отчита на никого.'));

    // (2) похарчих за себе си
    c.appendChild(el('p', 'jr-privacy', '<strong>Похарчих за себе си:</strong>'));
    const сп = списък({
      данни: st.spent, запази, подсказки: ПАРИ_ПРИМЕРИ,
      подкана: 'за какво…',
      празно: 'Още е празно. Първото нещо тук обикновено е най-трудното.'
    });
    c.appendChild(сп.ред); c.appendChild(сп.кутия);

    // (3) изречението — под неутрален ред, и НЕ само към партньор (фикс на съдника)
    const детайли = el('details', 'cm-row');
    детайли.innerHTML = '<summary>💬 Ако има с кого да го говориш</summary>';
    ПАРИ_РЕПЛИКИ.forEach(([към, т]) => {
      const p = el('p', 'wm-rep');
      p.innerHTML = '<small>' + esc(към) + '</small><br>„' + esc(т) + '“';
      детайли.appendChild(p);
    });
    c.appendChild(детайли);
    c.appendChild(el('p', 'lb-kind',
      '💜 Ако вкъщи парите се дават с условия или с проверка на всяка бележка — това вече не е бюджет. Кажи ми „страх ме е от него“ и ще ти дам къде да звъннеш.'));
    return c;
  }

  // ═══════════ 💼 ОБРАТНОТО БРОЕНЕ ДО РАБОТА ═══════════
  const РАБОТА_ПРИМЕРИ = [
    'да питам за работното време и почивките',
    'да пробвам дрехите, с които ще ходя',
    'репетиция — половин ден без мен',
    'кой прибира бебето, ако е болно',
    'да видя пътя дотам с количка/кола',
    'да си запиша какво правех, преди да изляза'
  ];
  function работаCard() {
    const c = card('Обратното броене до работа 💼 ' + sub('една дата · и всичко, което иска да е готово преди нея'));
    c.appendChild(el('p', 'jr-privacy',
      // 🔴 05.08 (скептикът към г06/289): №289 махна „до понеделника“ от лентата,
      //    но ГО ОСТАВИ два абзаца по-горе — картата още посрещаше с „Един
      //    понеделник“ мама, която се връща в сряда. Същият дефект, същата карта.
      'Първият работен ден вече има дата, а ти го смяташ наум по десет пъти на ден. Дай ми датата — оттук нататък броенето е мое. И запомни едно от мен: първата седмица лъже. Тя е най-лошата от всички и в нея не се прави равносметка — нито за теб, нито за него.'));
    const st = load('bl_wm_return', { date: '', items: [], first: '' });
    const запази = () => save('bl_wm_return', st);

    const редД = el('div', 'jr-addrow');
    const дата = el('input', 'jr-word'); дата.type = 'date'; дата.value = st.date || '';
    // ♿ 11.08 (клавиатура-четец): при type=date подсказка не се показва.
    дата.setAttribute('aria-label', 'Първият работен ден');
    редД.appendChild(дата);
    const лента = el('div', 'wm-count');
    const рисувайЛента = () => {
      const н = дни(st.date);
      if (!st.date || isNaN(н)) { лента.innerHTML = ''; лента.hidden = true; return; }
      лента.hidden = false;
      // 05.08 (одит г06, №289): „до понеделника“ беше зашито в низа, а полето е
      // обикновено <input type="date"> — избереш сряда, а лентата пак брои „до
      // понеделника“. Точно тази карта трябва да ѝ вдъхва точност.
      if (н > 0) лента.innerHTML = '<strong>' + н + '</strong> ' + (н === 1 ? 'ден' : 'дни') + ' до първия ден';
      else if (н === 0) лента.innerHTML = '<strong>ДНЕС.</strong> Дишай.';
      else { лента.innerHTML = ''; лента.hidden = true; }   // след деня не виси мъртва
    };
    дата.addEventListener('change', () => { st.date = дата.value; запази(); рисувайЛента(); нанадолу(); });
    c.appendChild(редД); c.appendChild(лента);

    c.appendChild(el('p', 'jr-privacy', '<strong>Преди датата искам да е готово:</strong>'));
    const сп = списък({ данни: st.items, запази, подсказки: РАБОТА_ПРИМЕРИ, отмятане: true,
      подкана: 'още нещо…', празно: 'Отметни каквото свършиш. Никой не брои неотметнатото.' });
    c.appendChild(сп.ред); c.appendChild(сп.кутия);

    // полето за първия ден се появява ЧАК след датата — иначе е укор
    const първи = el('div', 'wm-firstday');
    const нанадолу = () => {
      const н = дни(st.date);
      първи.innerHTML = '';
      if (!st.date || isNaN(н) || н > 0) { първи.hidden = true; return; }
      първи.hidden = false;
      първи.appendChild(el('p', 'jr-privacy', '<strong>Как мина първият ден?</strong> Само за теб — след година ще е интересно да го прочетеш.'));
      const т = el('textarea', 'jr-note'); т.rows = 3; т.value = st.first || '';
      т.placeholder = 'Каквото искаш да запомниш…';
      т.addEventListener('change', () => { st.first = т.value.slice(0, 900); запази(); });
      първи.appendChild(т);
    };
    c.appendChild(първи);
    рисувайЛента(); нанадолу();
    return c;
  }

  // ═══════════ 📷 ВЛЕЗ В КАДЪРА ═══════════
  const КАДЪР_ИДЕИ = ['днес, както съм', 'ти спиш върху мен', 'в 3 през нощта — да, точно тази', 'ние двете в огледалото на асансьора'];
  function кадърCard() {
    const c = card('Влез в кадъра 📷 ' + sub('снимки, на които СИ ти · не идеални, а твои'));
    c.appendChild(el('p', 'jr-privacy',
      'В телефона ти има хиляда снимки на него и нито една на теб с него. Знам защо: ти държиш телефона, косата ти е мазна и си казала „ще се снимам, като отслабна“. Само че той след двайсет години няма да търси снимка, на която си слаба. Ще търси снимка, на която те има.'));
    const st = load('bl_wm_inframe', {});
    const слот = el('button', 'wm-slot'); слот.type = 'button';
    // ♿ 11.08 (клавиатура-четец): голямото квадратче е бутон, който отваря
    //    галерията — а при първо рисуване стои празно и няма как да се разбере.
    слот.setAttribute('aria-label', 'Сложи снимка на теб за този месец');
    const лента = el('div', 'wm-strip');
    const вход = el('input'); вход.type = 'file'; вход.accept = 'image/*'; вход.hidden = true;

    const рисувай = () => {
      const м = месец();
      слот.innerHTML = st[м]
        ? '<img src="' + st[м] + '" alt="аз, този месец"><span>този месец ✓ · смени?</span>'
        : '<span class="wm-plus">+</span><span>Сложи снимка</span>';
      лента.innerHTML = '';
      const месеци = Object.keys(st).filter(k => k !== м).sort().reverse();
      месеци.forEach(k => {
        const б = el('button', 'wm-thumb', '<img src="' + st[k] + '" alt="аз през ' + k + '"><small>' + k + '</small>');
        б.type = 'button';
        б.addEventListener('click', () => {
          const питай = window.BL_UI ? BL_UI.confirm('Да махна ли снимката от ' + k + '?', { title: 'Снимка', emoji: '📷', okText: 'Махни', cancelText: 'Остави', danger: true })
            : Promise.resolve(true);
          Promise.resolve(питай).then(да => { if (да) { delete st[k]; save('bl_wm_inframe', st); рисувай(); } });
        });
        лента.appendChild(б);
      });
    };
    слот.addEventListener('click', () => вход.click());
    вход.addEventListener('change', () => {
      const f = вход.files && вход.files[0];
      if (!f || !window.BL_EXPR) return;
      BL_EXPR.shrinkImage(f, 340, url => {
        const назад = Object.assign({}, st);
        st[месец()] = url;
        if (!save('bl_wm_inframe', st)) {
          // честно, както в rooms3: паметта е свършила, не се преструваме
          Object.keys(st).forEach(k => delete st[k]);
          Object.assign(st, назад);
          c.appendChild(el('p', 'lb-kind', '💜 Паметта на телефона се напълни. Изтрий някоя стара снимка оттук и опитай пак.'));
          return;
        }
        рисувай(); fx().confetti && fx().confetti();
      });
      вход.value = '';
    });
    c.appendChild(слот); c.appendChild(вход); c.appendChild(лента);
    c.appendChild(el('p', 'jr-privacy', 'Идеи, ако не знаеш каква: ' + КАДЪР_ИДЕИ.map(esc).join(' · ')));
    c.appendChild(el('p', 'lb-kind', '💜 Остава само на твоя телефон. Никъде не се качва.'));
    return c;
  }

  // ═══════════ 🎧 КАКВО БЕШЕ МОЕ ═══════════
  const МОЕ_ПРИМЕРИ = ['песен, която пусках силно', 'филм, който съм гледала десет пъти',
    'ястие, което правя само за себе си', 'място, където ходех сама',
    'книга, която препрочитам', 'нещо, което правех с ръцете си'];
  function моеCard() {
    const c = card('Какво беше мое 🎧 ' + sub('пишеш го веднъж · после то ти го връща'));
    c.appendChild(el('p', 'jr-privacy',
      'Помниш любимата му песничка и коя играчка не дава. За себе си — нищо. Не си забравила, изместила си. Напиши тук каквото ти е било твое, докато си спомняш — в ден, в който не помниш, ще ти го подам обратно.'));
    const st = load('bl_wm_taste', []);
    // 05.08 (одит г06, №109): бутонът се СЪЗДАВАШЕ само ако вече има записи —
    // а блокът стои извън рисувай() и се минава веднъж, при строежа на картата.
    // Мама пишеше първото си „моя песен“, то се появяваше в списъка, а обещаното
    // в текста („после то ти го връща“) го нямаше до следващото отваряне на
    // стаята. Сега бутонът съществува винаги, а само видимостта му се сменя.
    const б = el('button', 'jr-chip', '🎧 Напомни ми едно'); б.type = 'button';
    const изход = el('p', 'wm-remind', '');
    б.hidden = !st.length; изход.hidden = true;
    const запази = () => {
      save('bl_wm_taste', st);
      б.hidden = !st.length;
      if (!st.length) { изход.innerHTML = ''; изход.hidden = true; }
    };
    б.addEventListener('click', () => {
      if (!st.length) return;
      const x = случайно(st);
      изход.innerHTML = '„' + esc(typeof x === 'string' ? x : x.t) + '“<br><small>Днес? Дори наполовина?</small>';
      изход.hidden = false;
      fx().buzz(8);
    });
    const сп = списък({ данни: st, запази, подсказки: МОЕ_ПРИМЕРИ, подкана: 'нещо мое…',
      празно: 'Празно е. Едно нещо стига за начало.' });
    c.appendChild(сп.ред); c.appendChild(сп.кутия);
    c.appendChild(б); c.appendChild(изход);
    return c;
  }

  // ═══════════ 💬 РЕПЛИКАТА В ДЖОБА ═══════════
  // Самата библиотека казва „полезни са конкретни реплики към партньор/баби/
  // работодател“ — а такъв инструмент нямаше никъде.
  const РЕПЛИКИ = {
    'На свекърва / баба': [
      'Благодаря, че помагаш. За това обаче сме решили така и ще го караме така.',
      'Знам, че на ваше време е било различно. Сега ни казват друго и аз ще се придържам към него.',
      'Не искам съвет точно сега. Искам само да ме изслушаш.',
      'Ако искаш да помогнеш — вземи го за час, аз ще поспя.'
    ],
    'На партньора': [
      'Не искам да „помагаш“. Искам да го носим двамата.',
      'Когато кажа, че съм уморена, не ми трябва решение. Трябва ми да ме чуеш.',
      'Тази вечер искам два часа, в които не съм на разположение на никого.',
      'Не помня кога за последно сме говорили за нещо, което не е бебето.'
    ],
    'На работодател': [
      'Бих искала да уточним работното време при връщането ми.',
      'Няма да мога да оставам след работно време засега.',
      'Ако детето се разболее, ще имам нужда от гъвкавост в тези дни.'
    ],
    'На всеки, който коментира': [
      'Благодаря, ще го имам предвид.',
      'Това е нашето решение.',
      'Не обсъждам теглото си.',
      'Питала ли съм те?'
    ]
  };
  function репликаCard() {
    const c = card('Репликата в джоба 💬 ' + sub('изречението, което ти е нужно, преди да ти потрябва'));
    c.appendChild(el('p', 'jr-privacy',
      'Половината от нещата, които те задушават, стоят неизказани, защото в мига не се сещаш КАК. Ето ги готови. Вземи ги, промени ги, направи си свои. Изречение, репетирано веднъж на спокойствие, излиза десет пъти по-лесно.'));
    const st = load('bl_wm_replies', []);
    Object.keys(РЕПЛИКИ).forEach(група => {
      const d = el('details', 'cm-row');
      d.innerHTML = '<summary>' + esc(група) + '</summary>';
      РЕПЛИКИ[група].forEach(т => {
        const ред = el('div', 'wm-repline');
        ред.innerHTML = '<span>„' + esc(т) + '“</span>';
        const зап = el('button', 'jr-x', '🔖'); зап.type = 'button';
        зап.title = 'Запази при моите';
        // ♿ 11.08 (клавиатура-четец): петнайсет еднакви „🔖" — четецът казваше
        //    петнайсет пъти „книгоразделител" и не личеше КОЯ реплика се запазва.
        зап.setAttribute('aria-label', 'Запази при моите: „' + т + '“');
        зап.addEventListener('click', () => {
          if (st.some(x => x.t === т)) return;
          st.push({ t: т, d: today() }); save('bl_wm_replies', st); рисувайМои(); fx().buzz(8);
        });
        ред.appendChild(зап); d.appendChild(ред);
      });
      c.appendChild(d);
    });
    c.appendChild(el('p', 'jr-privacy', '<strong>Моите изречения:</strong>'));
    const мои = el('div', 'jr-wins');
    const рисувайМои = () => {
      мои.innerHTML = '';
      if (!st.length) { мои.appendChild(el('p', 'jr-privacy', 'Още нищо. Запази някое с 🔖 или напиши свое.')); return; }
      st.slice().reverse().forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const ред = el('div', 'jr-winrow');
        ред.innerHTML = '<span class="jr-win">„' + esc(x.t) + '“</span>';
        const трий = el('button', 'jr-x', '✕'); трий.type = 'button';
        трий.setAttribute('aria-label', 'Махни „' + x.t + '“');
        трий.addEventListener('click', () => { st.splice(i, 1); save('bl_wm_replies', st); рисувайМои(); });
        ред.appendChild(трий); мои.appendChild(ред);
      });
    };
    const ред = el('div', 'jr-addrow');
    const вход = el('input', 'jr-word'); вход.placeholder = 'моето изречение…'; вход.maxLength = 140;
    const плюс = el('button', 'jr-chip', '+'); плюс.type = 'button';
    плюс.setAttribute('aria-label', 'Запази моето изречение');
    const сложи = () => { const v = вход.value.trim(); if (!v) return; st.push({ t: v.slice(0, 140), d: today() }); save('bl_wm_replies', st); вход.value = ''; рисувайМои(); fx().buzz(10); };
    плюс.addEventListener('click', сложи);
    вход.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); сложи(); } });
    ред.appendChild(вход); ред.appendChild(плюс);
    c.appendChild(ред); c.appendChild(мои); рисувайМои();
    return c;
  }

  window.BL_WOMEN4_ЧАСТ1 = { париCard, работаCard, кадърCard, моеCard, репликаCard, списък, load, save, el, esc, card, sub, today, месец, дни, fx, случайно, пауза };
})();
