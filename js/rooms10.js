// ═══════════════════════════════════════════════════════════
// ROOMS 10 — ЪПГРЕЙДИТЕ ПО СТАИ, ПЕТИ ПАКЕТ (план 19, част 4)
//
// 😰 4.1.5  Страховете ми по седмици     👣 4.1.8  Ритниците по часове
// 🛒 4.1.10 Купих ли го — по приоритет   ⚖️ 4.2.8  Кога ще удвои теглото
// 🧷 4.2.10 Пелени: общо досега          ❓ 4.4.4  Прегледите: какво да питам
// 📅 4.5.2  Най-тежкият ти ден           📺 4.6.3  Екранното време
// 📖 4.6.7  Първите приказки             📄 4.7.5  Документите по възраст
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const getBaby = () => load('bl_baby', { name: '', sex: '', birth: '' });
  const age = () => { const b = getBaby(); return b.birth && window.BL_AGE ? BL_AGE(b.birth) : null; };
  const pregWeek = () => {
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (!lmp) return null;
    const w = Math.floor((Date.now() - new Date(lmp)) / 604800000);
    return (w >= 1 && w <= 45) ? w : null;
  };

  // ═══════════ 😰 4.1.5 СТРАХОВЕТЕ МИ ПО СЕДМИЦИ ═══════════
  // Записва ги. И ѝ ги връща по-късно — за да види, че е издържала.

  function fearsCard() {
    const w = pregWeek();
    if (!w) return null;
    const c = card('От какво ме е страх 😰 ' + sub('пиши го — после ще ти го върна'));
    const мои = load('bl_fears', []);
    // старите страхове се връщат
    const стар = мои.find(f => w - f.w >= 6);
    if (стар) {
      const b = el('div', 'fr-old');
      b.innerHTML = `<p class="fr-h">📬 На <strong>${стар.w}-та седмица</strong> те беше страх от това:</p>
        <p class="fr-q">„${esc(стар.t)}“</p>
        <p class="jr-privacy">Минаха ${w - стар.w} седмици. Как ти се вижда сега?</p>`;
      c.appendChild(b);
    }
    const t = el('textarea', 'jr-paper'); t.rows = 2;
    t.placeholder = 'Какво те плаши тази седмица…';
    const btn = el('button', 'jr-btn', '✍️ Запиши го'); btn.type = 'button';
    const out = el('p', 'jr-privacy', мои.length ? `Записани: ${мои.length}` : '');
    btn.addEventListener('click', () => {
      if (!t.value.trim()) return;
      мои.push({ w, t: t.value.trim().slice(0, 300), d: today() });
      save('bl_fears', мои); t.value = '';
      out.textContent = `Записано. Ще ти го покажа след няколко седмици. (Общо: ${мои.length})`;
      fx().buzz(8);
    });
    c.appendChild(t); c.appendChild(btn); c.appendChild(out);
    return c;
  }

  // ═══════════ 👣 4.1.8 РИТНИЦИТЕ ПО ЧАСОВЕ ═══════════

  function kicksClockCard() {
    const w = pregWeek();
    if (!w || w < 24) return null;
    const записи = load('bl_kicks_log', []);
    const c = card('Кога рита най-много 👣 ' + sub('неговият ритъм, не книжният'));
    const часове = new Array(24).fill(0);
    записи.forEach(x => { const h = new Date(x).getHours(); if (!isNaN(h)) часове[h]++; });
    const макс = Math.max(1, ...часове);
    const g = el('div', 'kc-grid');
    for (let h = 0; h < 24; h++) {
      const в = часове[h] / макс;
      const b = el('div', 'kc-bar');
      b.style.setProperty('--h', Math.max(4, Math.round(в * 100)) + '%');
      b.title = h + ':00 — ' + часове[h];
      if (часове[h] === макс && макс > 1) b.classList.add('kc-top');
      const w2 = el('div', 'kc-col');
      w2.appendChild(b);
      if (h % 6 === 0) w2.appendChild(el('span', 'kc-l', h + 'ч'));
      g.appendChild(w2);
    }
    c.appendChild(g);
    const b = el('button', 'jr-btn', '👣 Усетих ритник сега'); b.type = 'button';
    b.addEventListener('click', () => {
      записи.push(Date.now()); save('bl_kicks_log', записи.slice(-400));
      fx().buzz(10);
      c.replaceWith(kicksClockCard());
    });
    c.appendChild(b);
    const пик = часове.indexOf(макс);
    c.appendChild(el('p', 'jr-privacy', записи.length < 8
      ? `Отбелязани: ${записи.length}. Като станат десетина, ще видиш кога е най-активно.`
      : `Най-често мърда около <strong>${пик}:00</strong>. Това е неговият часовник — запомни го, ще ти е нужен и след раждането.`));
    return c;
  }

  // ═══════════ 🛒 4.1.10 КУПИХ ЛИ ГО ═══════════

  const КУПУВАНЕ = [
    ['🔴 Трябва ПРЕДИ раждането', [
      'Столче за кола (без него не ви пускат от болницата)',
      'Място за спане — кошара или креватче',
      'Пелени за новородено (една пачка, не десет)',
      '5-6 бодита и 5-6 гащеризончета',
      'Мокри кърпички без аромат',
      'Одеялце или спален чувал'
    ]],
    ['🟡 Може и след това', [
      'Количка (мерят се стълбите и багажникът първо)',
      'Вана за къпане',
      'Носилка или кенгуру',
      'Кърмачески сутиени (размерът се разбира после)',
      'Помпа за кърма',
      'Монитор за бебето'
    ]],
    ['⚪ Ще видиш дали ти трябва', [
      'Шезлонг / люлка (за БУДЕН престой — не е място за спане)',
      'Стерилизатор (тенджера с вода върши работа)',
      'Затоплящ уред за шишета',
      'Специална възглавница за кърмене',
      'Гнездо за спане (за буден престой до теб — бебето не спи в него)',
      'Бебефон с видео'
    ]]
  ];
  // 🔴 05.08 (одит г11, №167): чантата се опитваше да се отметне от купеното,
  //    но сравняваше складовия КЛЮЧ („🔴 Трябва ПРЕДИ раждането|2"), не името на
  //    нещото — условие, което не можеше да е истина при никакви данни. Даваме
  //    истинските имена навън, за да сравнява preg20.js по СЪДЪРЖАНИЕ.
  window.BL_BUY_ITEMS = КУПУВАНЕ;

  function buyCard() {
    if (!pregWeek()) return null;
    const c = card('Купих ли го 🛒 ' + sub('подредено по това кога наистина трябва'));
    c.appendChild(el('p', 'jr-privacy',
      'Списъците в магазините са дълги, защото магазините продават. Този е подреден по <strong>кога ти трябва</strong>.'));
    const мои = load('bl_buy', {});
    // В1.6: 19 бутона на стена бяха непроходими. Групите се сгъват —
    // отворена е само първата НЕзавършена; другите са един ред с брояч.
    let първаОтворена = false;
    КУПУВАНЕ.forEach(([загл, неща]) => {
      const готови = неща.filter((н, i) => мои[загл + '|' + i]).length;
      const завършена = готови === неща.length;
      const отвори = !първаОтворена && !завършена;
      if (отвори) първаОтворена = true;

      const глава = el('button', 'mk-h mk-fold' + (отвори ? ' open' : '')); глава.type = 'button';
      глава.innerHTML = `<span>${esc(загл)}</span><span class="mk-cnt">${завършена ? '✔ готово' : готови + ' / ' + неща.length}</span><span class="mk-arrow">${отвори ? '▾' : '▸'}</span>`;
      c.appendChild(глава);
      const тяло = el('div', 'mk-body');
      тяло.hidden = !отвори;
      неща.forEach((н, i) => {
        const к = загл + '|' + i;
        const r = el('button', 'qd-row' + (мои[к] ? ' done' : '')); r.type = 'button';
        r.innerHTML = `<span class="jr-check">${мои[к] ? '✔' : ''}</span><span>${esc(н)}</span>`;
        r.addEventListener('click', () => {
          мои[к] = !мои[к]; save('bl_buy', мои);
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = мои[к] ? '✔' : '';
          const г = неща.filter((x, j) => мои[загл + '|' + j]).length;
          глава.querySelector('.mk-cnt').textContent = г === неща.length ? '✔ готово' : г + ' / ' + неща.length;
          fx().buzz(5);
        });
        тяло.appendChild(r);
      });
      c.appendChild(тяло);
      глава.addEventListener('click', () => {
        тяло.hidden = !тяло.hidden;
        глава.classList.toggle('open', !тяло.hidden);
        глава.querySelector('.mk-arrow').textContent = тяло.hidden ? '▸' : '▾';
      });
    });
    // 🚨 22.07 (армия, RED): списъкът предлагаше „Гнездо за спане“ и
    //   „Шезлонг/люлка“ като най-обикновени покупки, а собствената библиотека
    //   на приложението ги нарежда сред нещата с реален риск за съня. Мама
    //   отмяташе реда и купуваше точно това, което Вита ѝ забранява две стаи
    //   по-нататък. Редовете остават (индексни ключове!), но истината е тук.
    c.appendChild(el('p', 'jr-privacy',
      '🛏️ За спане важи едно, независимо какво пише на кутията: <strong>по гръб, на твърд равен матрак, в празно легло</strong>. ' +
      'Гнезда, шезлонги, люлки, позиционери, обиколници и възглавнички са за буден престой до теб — бебето не спи в тях.'));
    return c;
  }

  // ═══════════ ⚖️ 4.2.8 КОГА ЩЕ УДВОИ ТЕГЛОТО ═══════════

  function doubleCard() {
    const a = age();
    // проход 4: теглата се пазят в bl_growth с поле .w (rooms2 калкулатор), НЕ в
    // несъществуващия bl_weights/.kg → картата никога не се раждаше. Съживена от
    // вече дадените ѝ мерки, без нищо ново да се въвежда.
    const записи = load('bl_growth', []);
    if (!a || записи.length < 2) return null;
    const c = card('Кога ще удвои теглото ⚖️ ' + sub('от ТВОИТЕ мерки, не от таблица'));
    const с = записи.slice().sort((x, y) => new Date(x.d) - new Date(y.d));
    const първо = с[0], последно = с[с.length - 1];
    const дни = Math.max(1, Math.round((new Date(последно.d) - new Date(първо.d)) / 86400000));
    const темп = (+последно.w - +първо.w) / дни;             // кг на ден
    const цел = +първо.w * 2;
    if (темп <= 0) {
      c.appendChild(el('p', 'jr-privacy', 'Още нямам достатъчно мерки, за да смятам темпа. Отбележи теглото няколко пъти.'));
      return c;
    }
    if (+последно.w >= цел) {
      c.appendChild(el('p', 'db-big', `🎉 Вече го удвои!`));
      c.appendChild(el('p', 'jr-privacy', `От <strong>${първо.w} кг</strong> до <strong>${последно.w} кг</strong>. Обикновено става около 4-6 месеца — но „обикновено“ не е закон.`));
      return c;
    }
    const остават = Math.round((цел - +последно.w) / темп);
    const кога = new Date(Date.now() + остават * 86400000);
    c.appendChild(el('p', 'db-big', `~${кога.toLocaleDateString('bg-BG')}`));
    c.appendChild(el('p', 'jr-privacy',
      `При сегашния му темп ще удвои първото измерено тегло (<strong>${първо.w} кг</strong> → ${цел.toFixed(1)} кг) някъде след <strong>${остават} дни</strong>.<br>
       <small>Това е игра с числата, не прогноза. Бебетата не растат по линия — растат на пристъпи.</small>`));
    return c;
  }

  // ═══════════ 🧷 4.2.10 ПЕЛЕНИ: ОБЩО ДОСЕГА ═══════════

  function diapersTotalCard() {
    const a = age();
    const d = load('bl_diapers', {});
    // проход 3 T15: bl_diapers пази ОБЕКТИ { wet, dirty } — старото +x беше NaN→0,
    // затова картата НИКОГА не се показваше. Смятаме wet+dirty и броим само дни
    // с реален запис (иначе празни дни смъкват средното — капанът от rooms17).
    // 🟡 11.08 (обиколка във времето): ден-ключ с БЪДЕЩА дата (сбъркан телефонен
    //    часовник, който после се сверява, или прелетян часови пояс) влизаше
    //    наравно с миналите. Измерено наживо: bl_diapers['2026-08-13'] при днешна
    //    дата 11.08 → „Отбелязани за 2 дни · средно 9.0 на ден“, тоест средното
    //    се дели на ден, който още не е дошъл — а картата се казва „досега“.
    //    НЕ трие нищо: ключът си стои в localStorage и се появява САМ, щом този
    //    ден настъпи. Низовете 'ГГГГ-ММ-ДД' се сравняват коректно като текст.
    //    ПЪТ НАЗАД: махни `&& k <= днес`.
    const днес = today();
    const дниЗапис = Object.keys(d).filter(k => { const x = d[k] || {}; return (+x.wet || 0) + (+x.dirty || 0) > 0 && k <= днес; });
    const общо = дниЗапис.reduce((s, k) => { const x = d[k] || {}; return s + (+x.wet || 0) + (+x.dirty || 0); }, 0);
    if (!общо) return null;
    const c = card('Пелени: общо досега 🧷 ' + sub('числото, което никой не ти казва'));
    const дни = дниЗапис.length;
    const средно = (общо / Math.max(1, дни)).toFixed(1);
    c.appendChild(el('p', 'db-big', общо));
    const минути = общо * 3;
    const часове = Math.round(минути / 60);
    // 🟡 11.08 (обиколка във времето): в първите дни числото беше малко и редът
    //    излизаше „това са 1 часа от живота ти“, а при съвсем малко — „0 часа“.
    //    Числото и думата до него не бива да си противоречат.
    const времеТекст = часове < 1 ? `<strong>${минути} минути</strong>`
      : `<strong>${часове} ${часове === 1 ? 'час' : 'часа'}</strong>`;
    c.appendChild(el('p', 'jr-privacy',
      `Отбелязани за <strong>${дни}</strong> ${дни === 1 ? 'ден' : 'дни'} · средно <strong>${средно}</strong> на ден.<br>
       По около 3 минути всяка — това са ${времеТекст} от живота ти. Никой няма да ти благодари за тях. Аз ти благодаря.`));
    const b = el('button', 'jr-chip', '📤 Сподели числото'); b.type = 'button';
    b.addEventListener('click', () => {
      const т = `${общо} пелени. ${часове < 1 ? минути + ' минути' : часове + (часове === 1 ? ' час' : ' часа')}. И нито едно „благодаря“. 😄 (Бейби Ленд)`;
      if (navigator.share) navigator.share({ text: т }).catch(() => {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(т); b.textContent = 'Копирано 💜'; setTimeout(() => b.textContent = '📤 Сподели числото', 2000); }
    });
    c.appendChild(b);
    return c;
  }

  // ═══════════ ❓ 4.4.4 ПРЕГЛЕДИТЕ: КАКВО ДА ПИТАМ ═══════════

  const ПИТАЙ = [
    [0, 2, ['Наддава ли достатъчно?', 'Жълтеницата минава ли както трябва?', 'Пъпчето наред ли е?', 'Кога е следващата ваксина?', 'Витамин D — колко и докога?']],
    [2, 5, ['Как е по кривата на растежа?', 'Реакцията от ваксината нормална ли беше?', 'Кога започваме захранване?', 'Колко трябва да спи на тази възраст?', 'Тортиколис/предпочита ли една страна?']],
    [5, 9, ['Захранването върви ли както трябва?', 'Трябва ли добавка желязо?', 'Зъбите — има ли за какво да се тревожа?', 'Сяда ли навреме?', 'Кръвна картина трябва ли?']],
    [9, 14, ['Проходването в срок ли е?', 'Кога спираме шишето?', 'Говори ли достатъчно?', 'Кога е следващата ваксина?', 'Слух и зрение — проверявали ли сме ги?']],
    [14, 99, ['Расте ли по своята крива?', 'Речта в норма ли е?', 'Храненето — да се тревожа ли за избирателността?', 'Кога е следващият профилактичен?', 'Зъболекар — кога за първи път?']]
  ];

  function askPedCard() {
    const a = age();
    if (!a) return null;
    const набор = ПИТАЙ.find(([x, y]) => a.months >= x && a.months < y) || ПИТАЙ[ПИТАЙ.length - 1];
    const c = card('Какво да питам педиатъра ❓ ' + sub('за неговата възраст'));
    // 💭 11.08 (обиколка като майка): петте реда се отмятаха в bl_qped и оттам
    //    не мърдаха. В същата стая обаче стои „Какво искам да го попитам 💭“
    //    (checkups.js), която изрично обещава „Списъкът е един и същ навсякъде“,
    //    и „Бележка за прегледа“, която печата ТОЗИ списък. Мама отмяташе „Кога
    //    е следващата ваксина?“ с мисълта, че си го е записала — в кабинета го
    //    нямаше. Сега ✔ значи „записах си го“ и въпросът влиза в общия ключ
    //    (bl_doc_questions). Отметката се ЧЕТЕ от него, за да не се разминат
    //    двете карти, ако тя изтрие въпроса другаде.
    //    Път назад: bl_qped не се трие — старите отметки се пренасят веднъж
    //    (флаг bl_qped_merged) и записът остава непокътнат.
    const ОБЩ = 'bl_doc_questions';
    try {
      if (localStorage.getItem('bl_qped_merged') === null) {
        const стари = load('bl_qped', {});
        const общ = load(ОБЩ, []);
        ПИТАЙ.forEach(([от, , въпроси]) => въпроси.forEach((q, i) => {
          if (стари[от + '|' + i] && !общ.includes(q)) общ.push(q);
        }));
        save(ОБЩ, общ.slice(-30));
        localStorage.setItem('bl_qped_merged', '1');
      }
    } catch (e) {}
    набор[2].forEach(q => {
      const има = load(ОБЩ, []).includes(q);
      const r = el('button', 'qd-row' + (има ? ' done' : '')); r.type = 'button';
      r.setAttribute('aria-pressed', има ? 'true' : 'false');
      r.innerHTML = `<span class="jr-check">${има ? '✔' : ''}</span><span>${esc(q)}</span>`;
      r.addEventListener('click', () => {
        const общ = load(ОБЩ, []);
        const j = общ.indexOf(q);
        if (j >= 0) общ.splice(j, 1); else общ.push(q);
        save(ОБЩ, общ.slice(-30));
        const сега = j < 0;
        r.classList.toggle('done', сега);
        r.setAttribute('aria-pressed', сега ? 'true' : 'false');
        r.querySelector('.jr-check').textContent = сега ? '✔' : '';
        fx().buzz(6);
      });
      c.appendChild(r);
    });
    c.appendChild(el('p', 'jr-privacy', 'Отметнатото влиза в „Какво искам да го попитам 💭“ в тази стая — същия списък, който излиза и в „Бележка за прегледа“.'));
    c.appendChild(el('p', 'jr-privacy', 'Няма глупав въпрос. Има само въпрос, който си премълчала и после си търсила в интернет в 2 сутринта.'));
    return c;
  }

  // ═══════════ 📅 4.5.2 НАЙ-ТЕЖКИЯТ ТИ ДЕН ═══════════

  const ДНИ = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];

  function hardDayCard() {
    // проход 4: чекините се пазят в bl_checkins (мн.ч.) с поле .m — не в
    // несъществуващия bl_checkin/.mood → картата никога не се раждаше.
    const чек = load('bl_checkins', {});
    const ключове = Object.keys(чек);
    if (ключове.length < 10) return null;
    const c = card('Най-тежкият ти ден 📅 ' + sub('от твоите чекини'));
    const сума = new Array(7).fill(0), брой = new Array(7).fill(0);
    ключове.forEach(д => {
      const v = typeof чек[д] === 'number' ? чек[д] : (чек[д] && чек[д].m);
      if (typeof v !== 'number') return;
      const w = new Date(д).getDay();
      if (isNaN(w)) return;
      сума[w] += v; брой[w]++;
    });
    const ср = сума.map((s, i) => брой[i] ? s / брой[i] : null);
    // 🔴 г13/86: без праг ден с ЕДИН чекин можеше да стане „най-тежкият“, а
    //   съседната bestHourCard (rooms14.js:154) иска поне 2 — двете карти в една
    //   стая печатаха противоположни присъди кой ден е тежък. Един език.
    const валидни = ср.map((x, i) => [x, i]).filter(([x, i]) => x !== null && брой[i] >= 2);
    if (валидни.length < 3) {
      c.appendChild(el('p', 'jr-privacy', 'Още малко чекини и ще ти покажа кой ден те мачка най-много.'));
      return c;
    }
    const най_тежък = валидни.reduce((a, b) => a[0] < b[0] ? a : b);
    const най_лек = валидни.reduce((a, b) => a[0] > b[0] ? a : b);
    const g = el('div', 'hd-grid');
    for (let i = 1; i <= 7; i++) {
      const d = i % 7;
      const v = ср[d];
      const b = el('div', 'hd-col');
      b.innerHTML = `<div class="hd-bar" style="--h:${v === null ? 6 : Math.round(v / 5 * 100)}%"></div>
        <span class="hd-l">${ДНИ[d].slice(0, 2)}</span>`;
      if (d === най_тежък[1]) b.classList.add('hd-worst');
      g.appendChild(b);
    }
    c.appendChild(g);
    c.appendChild(el('p', 'jr-privacy',
      `Най-тежко ти е в <strong>${ДНИ[най_тежък[1]]}</strong>, най-леко в <strong>${ДНИ[най_лек[1]]}</strong>.<br>
       <small>Знаейки го, можеш да не планираш нищо тежко точно тогава. Това е малка власт, но е власт.</small>`));
    return c;
  }

  // ═══════════ 📺 4.6.3 ЕКРАННОТО ВРЕМЕ ═══════════

  function screenCard() {
    const a = age();
    const c = card('Екранното време 📺 ' + sub('брояч без вина'));
    const st = load('bl_screen', {});
    const днес = +(st[today()] || 0);
    const out = el('p', 'db-big', днес + ' мин.');
    const row = el('div', 'jr-quick');
    [10, 20, 30].forEach(м => {
      const b = el('button', 'jr-chip', '+' + м); b.type = 'button';
      // ♿ 11.08 (клавиатура-четец): „+10" се чете като голо число — без мерната
      //    единица не личи, че са минути.
      b.setAttribute('aria-label', 'Още ' + м + ' минути');
      b.addEventListener('click', () => {
        st[today()] = (+(st[today()] || 0)) + м; save('bl_screen', st);
        out.textContent = st[today()] + ' мин.'; коментар(); fx().buzz(6);
      });
      row.appendChild(b);
    });
    const нула = el('button', 'jr-chip', '↺ нула'); нула.type = 'button';
    нула.addEventListener('click', () => { st[today()] = 0; save('bl_screen', st); out.textContent = '0 мин.'; коментар(); });
    row.appendChild(нула);
    const бел = el('p', 'jr-privacy', '');
    function коментар() {
      const v = +(st[today()] || 0);
      // 🔴 г13/65: при непопълнена рождена дата BL_AGE връща null и картата падаше
      //   в клона ЗА НАД 2 ГОДИНИ — на мама на четиримесечно пишеше „В рамките на
      //   обичайното“, тихо, без да каже, че гади. Празното поле вече води към
      //   по-внимателния клон и си признава, че не знае възрастта.
      бел.innerHTML = (!a || a.devMonths < 24)
        ? ((v === 0 ? 'Нула днес. Не че се брои състезание — просто го знаеш.'
           : v <= 20 ? 'Случва се. Един епизод в тежък ден не е повреда.'
           : 'Днес е било тежко, а? Няма страшно. Утре е нов ден. <br><small>Препоръката преди 2 години е практически без екрани — но препоръките не гледат бебе сами.</small>')
          + (a ? '' : '<br><small>Задай рождена дата в „Моето бебе“ и ще меря по възрастта.</small>'))
        : (v <= 60 ? 'В рамките на обичайното.' : 'Днес е било доста. Утре пробвай с една игра вместо това.');
    }
    коментар();
    c.appendChild(out); c.appendChild(row); c.appendChild(бел);
    c.appendChild(el('p', 'jr-privacy',
      'Този брояч <strong>не те съди</strong>. Той е тук, защото това, което се мери, се вижда — а това, което се вижда, се променя само.'));
    return c;
  }

  // ═══════════ 📖 4.6.7 ПЪРВИТЕ ПРИКАЗКИ ═══════════

  const КНИГИ = [
    [0, 4, '🖤', 'Черно-бели картинки', 'Още не вижда цветовете добре. Контрастът е това, което го грабва. Книжка от плат или картон с едри черно-бели фигури.'],
    [4, 8, '🪞', 'Книжки с огледалце и текстури', 'Пипа повече, отколкото гледа. Книжките се дъвчат — това е част от четенето на тази възраст.'],
    [8, 14, '🐄', 'Едно нещо на страница + звук', '„Кравата казва муу.“ Едра картинка, дума, звук. Ще иска СЪЩАТА книжка сто пъти. Това е ученето.'],
    [14, 20, '🚪', 'Книжки с капачета', 'Вдига капачето, намира изненада. Учи, че нещата съществуват, дори когато не се виждат.'],
    [20, 36, '📚', 'Кратки истории с ритъм', 'Римите и повторенията са магия. Ще ги казва наизуст преди да чете.']
  ];

  function booksCard() {
    const a = age();
    const м = a ? a.devMonths : 8;
    const c = card('Първите книжки 📖 ' + sub('какво се чете на каква възраст'));
    // 🔴 г13/253: при празна памет `м` падаше на 8 месеца мълчаливо — на бременна
    //   или мама на новородено точно нейните редове излизаха избледнени като
    //   „минали“. Без дата не подчертаваме и не зачеркваме нищо; казваме си го.
    if (!a) c.appendChild(el('p', 'jr-privacy', 'Задай рождена дата в „Моето бебе“ и ще подчертая етапа, който е вашият.'));
    КНИГИ.forEach(([x, y, e, име, оп]) => {
      const сега = a && м >= x && м < y;
      const r = el('div', 'bk-row' + (сега ? ' bk-now' : '') + (a && м >= y ? ' bk-past' : ''));
      // 🟡 11.08 (обиколка): подзаглавието обещава „какво се чете на каква
      //   възраст“, а възрастта я нямаше НИКЪДЕ в текста — стоеше само като
      //   цвят на реда, и то само ако има рождена дата. Пишем я.
      r.innerHTML = `<span class="bk-e">${e}</span><span class="bk-t"><strong>${esc(име)}</strong> <small>· ${x}-${y} м.</small><br><small>${esc(оп)}</small></span>`;
      c.appendChild(r);
    });
    c.appendChild(el('p', 'jr-privacy',
      'Четенето на бебе не е за историята — то е за <strong>гласа ти</strong> и за това, че седите заедно. Затова „грешна“ книжка няма.'));
    return c;
  }

  // ═══════════ 📄 4.7.5 ДОКУМЕНТИТЕ ПО ВЪЗРАСТ ═══════════

  function docsCard() {
    const c = card('Документите 📄 ' + sub('кое кога се вади'));
    const Д = [
      ['Първите дни', ['Съобщение за раждане (дава го болницата)', 'Акт за раждане — от общината', 'ЕГН — идва с акта']],
      ['До месец', ['Избор на личен лекар (педиатър)', 'Здравна книжка на детето', 'Здравно осигуряване']],
      ['Първите месеци', ['Детски надбавки — ако отговаряте на условията', /* 🟠 11.08: „Лична карта/паспорт“ — детето получава лична карта чак на 14 г. */ 'Паспорт на детето — ако ще пътувате (лична карта чак от 14 г.)', 'Записване в детска градина (в някои градове се чака година+)']]
    ];
    const мои = load('bl_docs', {});
    Д.forEach(([загл, неща]) => {
      c.appendChild(el('p', 'mk-h', загл));
      неща.forEach((н, i) => {
        const к = загл + '|' + i;
        const r = el('button', 'qd-row' + (мои[к] ? ' done' : '')); r.type = 'button';
        r.innerHTML = `<span class="jr-check">${мои[к] ? '✔' : ''}</span><span>${esc(н)}</span>`;
        r.addEventListener('click', () => {
          мои[к] = !мои[к]; save('bl_docs', мои);
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = мои[к] ? '✔' : '';
        });
        c.appendChild(r);
      });
    });
    c.appendChild(el('p', 'jr-privacy',
      'Сроковете и условията се менят — за точните питай в общината или НОИ. Аз знам реда, те знаят днешните правила.'));
    return c;
  }

  // ═══════════ свързване ═══════════

  const ПАКЕТИ = {
    'Бременност': root => { [fearsCard, kicksClockCard, buyCard].forEach(f => { const c = f(); if (c) root.appendChild(c); }); },
    'Моето бебе': root => { [doubleCard, diapersTotalCard].forEach(f => { const c = f(); if (c) root.appendChild(c); }); },
    'Здраве и SOS': root => { const c = askPedCard(); if (c) root.appendChild(c); },
    'Дневник на мама': root => { const c = hardDayCard(); if (c) root.appendChild(c); },
    'Развитие и игри': root => { root.appendChild(screenCard()); root.appendChild(booksCard()); },
    'Инструменти': root => { root.appendChild(docsCard()); }
  };

  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
