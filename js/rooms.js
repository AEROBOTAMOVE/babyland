// ═══════════════════════════════════════════════════════════
// СТАИТЕ — истинските функции (Етап 1а)
// Дневник на мама MVP + SOS страница. Всичко живее в телефона
// на мама (localStorage) — никакви сървъри, никакво следене.
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // 🔒 22.07 (армия, RED): този файл нямаше НИТО ЕДИН escape, а рисува с
  //   innerHTML победите, които мама сама си е написала („Добави своя
  //   победа…“ → bl_wins_custom). Собствен текст + „Възстанови от файл“
  //   (чуждо копие в localStorage) = изпълним HTML при отваряне на Дневника.
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ── съхранение ──
  const load = (k, d) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      if (v === null || v === undefined) return d;
      // Ако паметта не пасва на ФОРМАТА на подразбиращото се (запис от стара
      // версия или от внесено чуждо копие), връщаме подразбиращото се. Иначе
      // после `.slice()` върху низ или `.forEach` върху обект събаря стаята.
      if (Array.isArray(d) !== Array.isArray(v)) return d;
      if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d;
      return v;
    }
    catch (e) { return d; }
  };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const monday = () => {
    const d = new Date(); const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return localDate(d);
  };
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  const MOODS = ['😩', '😔', '😐', '🙂', '🥰'];
  const MOOD_WORDS = ['Тежък ден — и това е ок. 🤗', 'По-мек ден ти желая. 💙', '„Горе-долу“ се брои. ☁️', 'Мъничко слънце! 🌤️', 'ГРЕЕШ! ✨'];

  // ── П5 CK2: живият отговор — чете вчера, серията и енергията ѝ.
  // Не етикет към емоджито, а изречение от някой, който я помни от вчера.
  function живДума(m, checkins) {
    try {
      const в = new Date(); в.setDate(в.getDate() - 1);
      const вчера = checkins[localDate(в)];
      // 🔴🔴 04.08 (петте майки): това броеше поредни дни С ЧЕКИН, независимо
      //    от настроението — а после долу се ползваше, все едно са дни ТЕЖЪК.
      //    Резултат в двете посоки: жена с две седмици спокойни чекини, която
      //    веднъж отбележи 😩, получаваше „от 15 дни ти е тежко — покажи се на
      //    лекар“; а жена с две черни седмици, пропуснала вчера, не го чуваше
      //    никога (серия = 0). Приложението твърдеше за миналото ѝ нещо, което
      //    не беше вярно, и на нея ѝ звучеше като „то знае по-добре от мен“.
      //    Сега се броят само дните с ЗАПИСАНО тежко настроение (m <= 1).
      //    Пропуснат ден не нулира — празното не е доказателство за добър ден —
      //    но и не се брои за тежък; просто се прескача.
      let серия = 0;
      const c = new Date(); c.setDate(c.getDate() - 1);
      let празни = 0;
      for (let i = 0; i < 40; i++) {
        const зап = checkins[localDate(c)];
        if (зап && typeof зап.m === 'number') {
          if (зап.m <= 1) { серия++; празни = 0; }
          else break;                                 // истински по-добър ден спира броя
        } else if (++празни > 3) break;               // дълга дупка — не гадаем
        c.setDate(c.getDate() - 1);
      }
      if (вчера && typeof вчера.m === 'number') {
        if (m >= 3 && вчера.m <= 1) return 'След вчерашния тежък ден — днес грееш. Толкова се радвам. 🌈';
        if (m <= 1 && вчера.m >= 3) return 'Вчера слънце, днес облак — и това е майчинството. Тук съм. 🤍';
        if (m > вчера.m) return 'По-светло от вчера — виждам те. 🌤️';
      }
      // 📉 22.07 (мега одит): при дълга серия тежки дни приложението
      // ПООЩРЯВАШЕ броя („Това е сила 💜“), а на 3 места в базата обещава
      // „ако е с теб повече от две седмици — на лекар“. Обещание, което кодът
      // никога не изпълняваше. Две седмици е границата, на която спираме да
      // ръкопляскаме и казваме честното.
      if (m <= 1 && серия + 1 >= 14) {
        return 'Виждам, че от ' + (серия + 1) + ' дни ти е тежко. Това вече не е „лош период“ — ' +
               'толкова дълга тежест се показва на лекар. Не защото си слаба, а защото има помощ. 🤍';
      }
      if (m <= 1 && серия >= 2) return (серия + 1) + ' поредни дни идваш при себе си — дори когато е тежко. Това е сила. 💜';
      if (m >= 3 && серия >= 5) return MOOD_WORDS[m] + ' Ден ' + (серия + 1) + ' поред за теб.';
    } catch (e) {}
    return MOOD_WORDS[m];
  }

  // ═══════════════ 📖 ДНЕВНИКЪТ НА МАМА ═══════════════

  function renderJournal(root) {

    /* ── 1. Днешният чекин ── */
    // 🔴 11.08 капанът на снимката: прочетено при РИСУВАНЕ, записвано при клик.
    //    Ако стаята е нарисувана два пъти, втората карта записва старата си
    //    снимка отгоре. Затова се чете ПРЯСНО точно преди записа.
    let checkins = load('bl_checkins', {});
    const t = today();
    const c1 = el('section', 'jr-card ck-card');
    c1.appendChild(el('h4', 'jr-title', 'Как си днес? 💜 <span class="jr-sub">30 секунди, само за теб</span>'));

    /* ── П5 CK1: дъгата на настроенията — емоцията се ИЗБИРА с плъзгане ── */
    const ARC_Y = [26, 10, 0, 10, 26];   // краищата на дъгата са по-ниско — полукръг
    const ИМЕНА = ['много тежко', 'тъжно', 'горе-долу', 'добре', 'чудесно'];
    const arc = el('div', 'ck-arc');
    arc.setAttribute('aria-label', 'Как си днес — докосни или плъзни до личицето');
    const orb = el('span', 'ck-orb');
    orb.setAttribute('aria-hidden', 'true');
    arc.appendChild(orb);
    const btns = MOODS.map((m, i) => {
      const b = el('button', 'ck-st', '<span class="ck-e">' + m + '</span>');
      b.type = 'button';
      b.style.left = (10 + i * 20) + '%';                    // статично място — НЕ се анимира
      b.style.setProperty('--cky', ARC_Y[i] + 'px');
      b.querySelector('.ck-e').style.setProperty('--ckd', (i * 0.6) + 's');
      b.setAttribute('aria-label', ИМЕНА[i]);
      b.addEventListener('click', () => избери(i));
      arc.appendChild(b);
      return b;
    });
    c1.appendChild(arc);
    const reply = el('p', 'jr-reply', checkins[t] ? живДума(checkins[t].m, checkins) : '&nbsp;');
    c1.appendChild(reply);

    let текущ = checkins[t] ? checkins[t].m : -1;
    function светниОрб(i, следвай) {
      const b = btns[i]; if (!b || !arc.offsetWidth) return;   // скрита стая → мълчи
      orb.classList.toggle('ck-orb-snap', !следвай);
      orb.style.transform = 'translate(' + (b.offsetLeft + b.offsetWidth / 2) + 'px,' + ARC_Y[i] + 'px)';
      orb.style.opacity = 1;
    }
    function избери(i) {
      текущ = i;
      btns.forEach((x, j) => x.classList.toggle('picked', j === i));
      светниОрб(i, false);
      c1._mood = i;                                            // записът чете същото поле
      reply.classList.remove('bl-rp-in'); void reply.offsetWidth;
      reply.textContent = живДума(i, checkins);                // CK2: отговор от някой, който помни
      reply.classList.add('bl-rp-in');
      if (window.BL_FX) BL_FX.buzz(6);
    }
    // пръстът тегли по дъгата — орбът тече отдолу; пускаш → избра
    const къмИндекс = px => {
      const r = arc.getBoundingClientRect();
      return Math.round(Math.min(1, Math.max(0, (px - r.left - r.width * 0.1) / (r.width * 0.8))) * (MOODS.length - 1));
    };
    let влачи = false;
    arc.addEventListener('pointerdown', e => { влачи = true; светниОрб(къмИндекс(e.clientX), true); });
    arc.addEventListener('pointermove', e => { if (влачи) светниОрб(къмИндекс(e.clientX), true); });
    arc.addEventListener('pointerup', e => { if (влачи) { влачи = false; избери(къмИндекс(e.clientX)); } });
    arc.addEventListener('pointercancel', () => { влачи = false; });
    if (текущ >= 0) setTimeout(() => { btns[текущ].classList.add('picked'); светниОрб(текущ, true); }, 60);

    const enRow = el('div', 'jr-energy');
    enRow.appendChild(el('span', 'jr-elabel', '🔋 Енергия'));
    const range = el('input', 'jr-range');
    range.type = 'range'; range.min = 0; range.max = 100;
    range.value = checkins[t] ? checkins[t].e : 50;
    // ♿ 11.08 (клавиатура-четец): плъзгачът се четеше като голо число от 0 до 100
    //    — надписът „🔋 Енергия" стои до него, но не сочи към него.
    range.setAttribute('aria-label', 'Енергия днес, в проценти');
    range.setAttribute('aria-valuetext', range.value + '%');
    const eVal = el('span', 'jr-eval', range.value + '%');
    range.addEventListener('input', () => { eVal.textContent = range.value + '%'; range.setAttribute('aria-valuetext', range.value + '%'); });
    enRow.appendChild(range); enRow.appendChild(eVal);
    c1.appendChild(enRow);

    const word = el('input', 'jr-word');
    word.type = 'text'; word.maxLength = 40;
    word.placeholder = 'Една дума за деня… (по желание)';
    if (checkins[t] && checkins[t].w) word.value = checkins[t].w;
    c1.appendChild(word);

    const saveBtn = el('button', 'jr-btn', checkins[t] ? 'Обнови ✔' : 'Запиши 💜');
    saveBtn.type = 'button';
    saveBtn.addEventListener('click', () => {
      const m = c1._mood !== undefined ? c1._mood : (checkins[t] ? checkins[t].m : undefined);
      if (m === undefined) { reply.textContent = 'Първо си избери личице 😊'; return; }
      checkins = load('bl_checkins', {});   // пресен прочит ПРЕДИ записа
      checkins[t] = { m, e: +range.value, w: word.value.trim() };
      save('bl_checkins', checkins);
      // П5 CK4: празнуваме слънцето, ПРЕГРЪЩАМЕ тъгата (без конфети върху тежък ден)
      const тихо = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!тихо && window.BL_FX) {
        if (m >= 3) { BL_FX.confetti(c1, 12); BL_FX.buzz(8); }
        else if (m <= 1) {
          BL_FX.buzz(12);
          const х = el('span', 'ck-hug');
          c1.appendChild(х);
          х.addEventListener('animationend', () => х.remove());
        }
      }
      saveBtn.textContent = 'Записано! 💜';
      // г12 №186: тежкият ден първо отваря ВРАТА, чак после игра.
      // 🔍 скептик 05.08: беше `if (m <= 1) … = false` — врата, която се отваря,
      //    но никога не се затваря. Мама записва 😩, после се коригира на 🥰 и
      //    поканата „разкажи ми“ виси над хубавия ѝ ден. Присвояваме и в двете
      //    посоки, точно както при отварянето на стаята (редът долу).
      къмЛуна.hidden = !(m <= 1);
      // 12.5.1: тежко личице или изтощена батерия → балончето ПОКАНВА
      // (не изскача). Веднъж на ден, и само ако игрите не са изключени.
      if ((m <= 1 || +range.value <= 25) && window.BL_GAMES2) {
        setTimeout(() => BL_GAMES2.покани('Тежичко е днес. Искаш ли 30 секунди на нищо?'), 1400);
      }
      drawWeek();
      setTimeout(() => { saveBtn.textContent = 'Обнови ✔'; }, 1600);
    });
    c1.appendChild(saveBtn);

    // г12 №186: досега тежкото личице водеше САМО до покана за игра. Сега под
    // картата стои тиха, незадължителна врата към Луна — без предварително
    // написан текст и без никой да брои дали мама я е натиснала.
    const къмЛуна = el('button', 'jr-chip', '🌙 Искаш ли да ми разкажеш?');
    къмЛуна.type = 'button';
    къмЛуна.hidden = !(checkins[t] && checkins[t].m <= 1);
    къмЛуна.addEventListener('click', () => {
      if (window.MamaHelper && MamaHelper.showTab) MamaHelper.showTab('chat');
    });
    c1.appendChild(къмЛуна);

    // П5 CK5: седмицата ПОМНИ — клетките се оцветяват в тона на деня,
    // а докосването връща собствените ѝ думи (най-евтиният „уау").
    const week = el('div', 'jr-week');
    c1.appendChild(el('p', 'jr-weekcap', 'Твоята седмица: <span class="jr-sub">докосни ден — той помни</span>'));
    c1.appendChild(week);
    const ехо = el('p', 'ck-echo', '');       // денят се връща: думата ѝ, енергията ѝ
    c1.appendChild(ехо);
    function drawWeek() {
      week.innerHTML = '';
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = localDate(d);
        const rec = checkins[key];
        const cell = el('button', 'jr-day' + (key === t ? ' today' : '') + (rec ? ' ck-d' + rec.m : ''), rec ? MOODS[rec.m] : '·');
        cell.type = 'button';
        // ♿ 11.08 (клавиатура-четец): подсказката беше суровата дата „2026-08-11",
        //    а навсякъде другаде в стаята датите са по нашенски. Седемте кутийки
        //    се четяха като „точка, точка, точка".
        const пони = key.slice(8, 10) + '.' + key.slice(5, 7);
        cell.title = пони;
        cell.setAttribute('aria-label', пони + (rec ? ' — има записано' : ''));
        cell.addEventListener('click', () => {
          if (rec) {
            // w е текст на мама → само textContent, никога innerHTML
            ехо.textContent = (rec.w ? '„' + rec.w + '“ · ' : '') + '🔋 ' + (rec.e != null ? rec.e : '–') + '% · ' + key.slice(8, 10) + '.' + key.slice(5, 7);
          } else {
            // 22.07 (жива обиколка): лентата обещава „докосни ден — той помни“,
            // а празните дни бяха мъртви бутони — мама чука и нищо. Сега денят
            // отговаря честно. И БЕЗ упрек: неотбелязан ден не е провал.
            const ден = key.slice(8, 10) + '.' + key.slice(5, 7);
            ехо.textContent = key === t
              ? 'Днес още не си се отбелязала. Когато имаш 30 секунди — горе е. 💜'
              : ден + ' е останал неотбелязан. Няма страшно — не всеки ден се записва.';
          }
          ехо.classList.remove('bl-rp-in'); void ехо.offsetWidth;
          ехо.classList.add('bl-rp-in');
          if (window.BL_FX) BL_FX.buzz(4);
        });
        week.appendChild(cell);
      }
    }
    drawWeek();
    root.appendChild(c1);

    /* ── 2. Време за мен ── */
    const c2 = el('section', 'jr-card');
    c2.appendChild(el('h4', 'jr-title', 'Време за мен ⏰ <span class="jr-sub">открадни си минутки — заслужаваш ги</span>'));

    const clock = el('div', 'jr-clock', '00:00');
    c2.appendChild(clock);
    const timerBtn = el('button', 'jr-btn jr-timerbtn', '▶ Започни моето време');
    timerBtn.type = 'button';
    c2.appendChild(timerBtn);

    const quick = el('div', 'jr-quick');
    [5, 15, 30].forEach(min => {
      const q = el('button', 'jr-chip', `+${min} мин`);
      q.type = 'button';
      q.addEventListener('click', () => { addMinutes(min); pot.classList.add('pop'); setTimeout(() => pot.classList.remove('pop'), 500); });
      quick.appendChild(q);
    });
    c2.appendChild(quick);

    const pot = el('p', 'jr-pot', '');
    c2.appendChild(pot);

    function weekData() {
      let w = load('bl_metime', { week: monday(), minutes: 0 });
      if (w.week !== monday()) w = { week: monday(), minutes: 0 };
      return w;
    }
    function addMinutes(n) {
      const w = weekData();
      w.minutes += n;
      save('bl_metime', w);
      drawPot();
    }
    // г12 №81: похвалата беше стъпаловидна — нива, до които много майки не
    // стигат, и всеки понеделник броячът пада на нула. Касичката вече само
    // ОПИСВА, без присъда: при 0 мълчи, при >0 казва числото без оценка.
    function praise(min) {
      if (!min) return '';
      return `Тази седмица: ${min} мин, които бяха твои.`;
    }
    function drawPot() { pot.textContent = praise(weekData().minutes); }
    drawPot();

    let tick = null;
    function fmt(s) {
      const m = Math.floor(s / 60), ss = s % 60;
      return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    }
    function refreshClock() {
      const start = load('bl_metime_start', 0);
      if (!start) return;
      clock.textContent = fmt(Math.floor((Date.now() - start) / 1000));
    }
    function setTimerUI(running) {
      timerBtn.textContent = running ? '⏸ Спри и запиши' : '▶ Започни моето време';
      timerBtn.classList.toggle('running', running);
      if (running) {
        refreshClock();
        tick = setInterval(() => {
          if (document.getElementById('roomOverlay').hidden) { clearInterval(tick); return; }
          refreshClock();
        }, 1000);
      } else if (tick) clearInterval(tick);
    }
    timerBtn.addEventListener('click', () => {
      const start = load('bl_metime_start', 0);
      if (!start) {
        save('bl_metime_start', Date.now());
        setTimerUI(true);
      } else {
        // г12 №82: без таван един забравен часовник вписваше дни като „мое време“
        const mins = Math.min(180, Math.max(1, Math.round((Date.now() - start) / 60000)));
        save('bl_metime_start', 0);
        addMinutes(mins);
        clock.textContent = '00:00';
        setTimerUI(false);
        pot.classList.add('pop'); setTimeout(() => pot.classList.remove('pop'), 500);
      }
    });
    // г12 №82: часовник, останал да върви над 4 часа, е забравен телефон,
    // не почивка. Изхвърля се тихо — без нито дума на упрек към мама.
    const започнатоОт = load('bl_metime_start', 0);
    if (започнатоОт && Date.now() - започнатоОт > 4 * 3600000) save('bl_metime_start', 0);
    setTimerUI(!!load('bl_metime_start', 0));
    root.appendChild(c2);

    /* ── 3. Малки победи ── */
    const c3 = el('section', 'jr-card');
    c3.appendChild(el('h4', 'jr-title', 'Днес успях да… <span class="jr-sub">малките победи са истинските</span>'));
    const DEFAULT_WINS = [
      '☕ Изпих си кафето топло', '🚿 Взех си душ на спокойствие', '🌳 Излязох навън',
      '🙋‍♀️ Поисках помощ', '🙅‍♀️ Казах „не“ без вина', '😂 Посмях се истински'
    ];
    // 🔴 11.08 капанът на снимката (виж чекина горе) — и двата ключа се четат
    //    ПРЯСНО преди записа, за да не се трие чужд запис от същия ден.
    let winsByDay = load('bl_wins', {});
    const doneToday = new Set(winsByDay[t] || []);
    let customWins = load('bl_wins_custom', []);
    const list = el('div', 'jr-wins');

    // г12 №353: своята победа мама можеше само да ДОБАВИ — печатната грешка
    // оставаше в личния ѝ списък завинаги. 🗑 само на своите редове, по
    // образеца на extras2.js:58-60 (затова и CSS вече съществува).
    function winRow(label, custom) {
      const row = el('button', 'jr-win' + (doneToday.has(label) ? ' done' : ''));
      row.type = 'button';
      row.innerHTML = `<span class="jr-check">${doneToday.has(label) ? '✔' : ''}</span> ${esc(label)}`
        + (custom ? '<span class="nt-del" role="button" aria-label="Махни тази победа" title="Махни тази победа">🗑</span>' : '');
      row.addEventListener('click', e => {
        if (custom && e.target && e.target.classList.contains('nt-del')) {
          const махни = () => {
            customWins = load('bl_wins_custom', []);   // пресен прочит ПРЕДИ записа
            const i = customWins.indexOf(label);
            if (i > -1) { customWins.splice(i, 1); save('bl_wins_custom', customWins); }
            if (doneToday.delete(label)) { winsByDay = load('bl_wins', {}); winsByDay[t] = [...doneToday]; save('bl_wins', winsByDay); }
            row.remove();
          };
          if (window.BL_UI) {
            BL_UI.confirm('Да махна ли „' + label + '“ от твоя списък?', { okText: 'Махни', cancelText: 'Остави', danger: true })
              .then(ок => { if (ок) махни(); });
          } else махни();
          return;
        }
        if (doneToday.has(label)) doneToday.delete(label); else doneToday.add(label);
        winsByDay = load('bl_wins', {});   // пресен прочит ПРЕДИ записа
        winsByDay[t] = [...doneToday];
        save('bl_wins', winsByDay);
        row.classList.toggle('done');
        row.querySelector('.jr-check').textContent = doneToday.has(label) ? '✔' : '';
        if (doneToday.has(label)) { row.classList.add('pop'); setTimeout(() => row.classList.remove('pop'), 500); }
      });
      return row;
    }
    DEFAULT_WINS.forEach(w => list.appendChild(winRow(w, false)));
    customWins.forEach(w => list.appendChild(winRow(w, true)));
    c3.appendChild(list);

    const addRow = el('div', 'jr-addrow');
    const addInp = el('input', 'jr-word');
    addInp.type = 'text'; addInp.maxLength = 60; addInp.placeholder = 'Добави своя победа…';
    const addBtn = el('button', 'jr-chip', '+ Добави');
    addBtn.type = 'button';
    addBtn.addEventListener('click', () => {
      const v = addInp.value.trim();
      if (!v) return;
      customWins = load('bl_wins_custom', []);   // пресен прочит ПРЕДИ записа
      customWins.push(v);
      save('bl_wins_custom', customWins);
      list.appendChild(winRow(v, true));
      addInp.value = '';
    });
    addRow.appendChild(addInp); addRow.appendChild(addBtn);
    c3.appendChild(addRow);
    root.appendChild(c3);

    /* ── 4. Скъсай листа 💥 ── */
    const c4 = el('section', 'jr-card jr-tearcard');
    c4.appendChild(el('h4', 'jr-title', 'Скъсай листа 💥 <span class="jr-sub">изсипи го тук — никой никога няма да го прочете</span>'));
    const stage = el('div', 'jr-tearstage');
    const ta = el('textarea', 'jr-paper');
    ta.placeholder = 'Ядът, страхът, умората… напиши ги. После ги скъсваме заедно.';
    ta.rows = 5;
    stage.appendChild(ta);
    c4.appendChild(stage);
    const tearBtn = el('button', 'jr-btn jr-tearbtn', 'СКЪСАЙ ГО! 💥');
    tearBtn.type = 'button';
    const after = el('p', 'jr-after', '');
    tearBtn.addEventListener('click', () => {
      const txt = ta.value.trim();
      if (!txt) { after.textContent = 'Първо го изсипи на листа. 😉'; return; }
      // строшаваме листа на ленти, които падат — текстът НЕ се записва никъде
      const rect = ta.getBoundingClientRect();
      const strips = 5;
      for (let i = 0; i < strips; i++) {
        const s = el('div', 'jr-strip');
        s.style.left = (i * (100 / strips)) + '%';
        s.style.width = (100 / strips) + '%';
        s.style.setProperty('--dx', ((i - 2) * 24) + 'px');
        s.style.setProperty('--dr', ((i % 2 ? 1 : -1) * (14 + i * 6)) + 'deg');
        s.style.animationDelay = (i * 0.05) + 's';
        const inner = el('div', 'jr-stripin', '');
        inner.textContent = txt;
        inner.style.width = rect.width + 'px';
        inner.style.marginLeft = (-i * (rect.width / strips)) + 'px';
        s.appendChild(inner);
        stage.appendChild(s);
        setTimeout(() => s.remove(), 1400);
      }
      ta.value = '';
      ta.classList.add('torn');
      setTimeout(() => ta.classList.remove('torn'), 1200);
      after.textContent = 'Скъсано. Отиде си завинаги. Издишай… 💜';
      setTimeout(() => { after.textContent = ''; }, 6000);
      // 12.5.1: точно СЛЕД скъсването — ръцете още треперят. Балончето
      // предлага 30 секунди на нищо. Ако не иска, махва го с един ✕.
      if (window.BL_GAMES2) setTimeout(() => BL_GAMES2.покани('Изсипа го. Искаш ли и 30 секунди на нищо?'), 2600);
    });
    c4.appendChild(tearBtn);
    c4.appendChild(after);
    root.appendChild(c4);

    /* ── 5. Три хубави неща (благодарствен дневник) ── */
    const c5 = el('section', 'jr-card');
    c5.appendChild(el('h4', 'jr-title', 'Три хубави неща 🙏 <span class="jr-sub">най-простата практика срещу сивите дни</span>'));
    // 🔴 11.08 капанът на снимката (виж чекина горе)
    let grat = load('bl_gratitude', {});
    const gToday = grat[t] || ['', '', ''];
    const gInputs = [];
    for (let i = 0; i < 3; i++) {
      const gi = el('input', 'jr-word');
      gi.type = 'text'; gi.maxLength = 80; gi.placeholder = ['1. Днес се зарадвах на…', '2. Благодарна съм за…', '3. Малка хубост беше…'][i];
      gi.value = gToday[i] || '';
      gi.addEventListener('input', () => {
        grat = load('bl_gratitude', {});   // пресен прочит ПРЕДИ записа
        grat[t] = gInputs.map(x => x.value.trim());
        const пълни = grat[t].every(v => v);
        if (grat[t].every(v => !v)) delete grat[t];
        save('bl_gratitude', grat);
        // проход 4: ритуал с естествен край (3 реда) заслужава момент на затваряне,
        // както „Малката разходка" празнува 3/3. Веднъж на ден + мъничка серия.
        if (пълни && c5.dataset.done !== t) {
          c5.dataset.done = t;
          const дни = Object.keys(grat).filter(d => (grat[d] || []).every(v => v)).sort();
          let серия = 0; const днес0 = new Date(t);
          for (let k = 0; k < дни.length; k++) { const ок = new Date(new Date(t) - k * 86400000).toISOString().slice(0, 10); if (дни.includes(ок)) серия++; else break; }
          if (window.BL_FX) { BL_FX.confetti(c5); BL_FX.cheer(серия > 1 ? 'Трите за днес — готови! 🎉 ' + серия + ' вечери подред' : 'Трите за днес — готови! 🎉'); }
        }
      });
      gInputs.push(gi); c5.appendChild(gi);
    }
    root.appendChild(c5);

    /* ── 6. Банка с идеи за разпускане ── */
    const RELAX = {
      5:  ['Дишане 4-7-8: вдишай 4, задръж 7, издишай 8 — три пъти.', 'Пусни любима песен и я изслушай със затворени очи.', 'Чаша чай на терасата, без телефон.', 'Разтегни врата и раменете бавно.', 'Напиши едно нещо, за което си благодарна.'],
      15: ['Маска за лице + топла вода.', 'Обади се на приятелка само за да си побъбрите.', 'Кратка разходка около блока, само ти.', 'Прочети няколко страници от книга.', 'Направи си любимото кафе и го изпий топло, седнала.'],
      30: ['Дълга топла вана.', 'Гледай епизод от нещо леко и любимо.', 'Следобеден сън без чувство за вина.', 'Йога или лека тренировка от видео.', 'Излез сама — кафене, магазин, каквото ти зарежда.']
    };
    const c6 = el('section', 'jr-card');
    c6.appendChild(el('h4', 'jr-title', 'Банка с идеи за разпускане 🌸 <span class="jr-sub">когато мозъкът е твърде уморен да измисли</span>'));
    const relaxRow = el('div', 'jr-quick');
    const relaxOut = el('div', 'jr-relaxout', '');
    [5, 15, 30].forEach(mins => {
      const b = el('button', 'jr-chip', `Имам ${mins} мин`); b.type = 'button';
      b.addEventListener('click', () => {
        const pool = RELAX[mins];
        relaxOut.innerHTML = `<div class="jr-relaxcard">💛 ${pool[Math.floor(Math.random() * pool.length)]}</div>`;
        relaxOut.firstChild.classList.add('pop');
      });
      relaxRow.appendChild(b);
    });
    c6.appendChild(relaxRow); c6.appendChild(relaxOut);
    root.appendChild(c6);

    /* ── 7. Капсули на времето ── */
    const c7 = el('section', 'jr-card');
    c7.appendChild(el('h4', 'jr-title', 'Капсули на времето 💌 <span class="jr-sub">писма, запечатани с днешната дата</span>'));
    // 🔴 11.08 капанът на снимката (виж чекина горе)
    let capsules = load('bl_capsules', []);
    const capType = el('div', 'jr-quick');
    let toWhom = 'baby';
    [['baby', '👶 До бебето'], ['self', '💜 До себе си след 1 г.']].forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip' + (v === 'baby' ? ' on' : ''), lbl); b.type = 'button';
      b.addEventListener('click', () => { capType.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); toWhom = v; });
      capType.appendChild(b);
    });
    c7.appendChild(capType);
    const capText = el('textarea', 'jr-paper'); capText.rows = 4; capText.placeholder = 'Скъпо мое… (напиши каквото сърцето ти диктува)';
    c7.appendChild(capText);
    const sealBtn = el('button', 'jr-btn', 'Запечатай капсулата 💌'); sealBtn.type = 'button';
    const capList = el('div', 'jr-caplist');
    sealBtn.addEventListener('click', () => {
      const txt = capText.value.trim();
      if (!txt) return;
      const unlock = toWhom === 'self' ? localDate(new Date(Date.now() + 365 * 86400000)) : t;
      capsules = load('bl_capsules', []);   // пресен прочит ПРЕДИ записа
      capsules.push({ to: toWhom, text: txt, sealed: t, unlock });
      save('bl_capsules', capsules);
      capText.value = '';
      if (window.BL_FX) { BL_FX.confetti(sealBtn); BL_FX.cheer('Капсулата е запечатана 💌'); }
      drawCaps();
    });
    c7.appendChild(sealBtn); c7.appendChild(capList);
    function drawCaps() {
      capsules = load('bl_capsules', []);   // пресен прочит при всяко рисуване
      if (!capsules.length) { capList.innerHTML = '<p class="jr-privacy">Още няма капсули. Напиши първата — сълзи гарантирани след време. 🥹</p>'; return; }
      capList.innerHTML = capsules.slice().reverse().map((c, ri) => {
        const idx = capsules.length - 1 - ri;
        const locked = c.unlock > t;
        const who = c.to === 'baby' ? '👶 До бебето' : '💜 До себе си';
        if (locked) return `<div class="jr-caprow locked"><span>🔒 ${who}</span><span class="jr-capdate">отваря се на ${new Date(c.unlock).toLocaleDateString('bg-BG')}</span></div>`;
        return `<button class="jr-caprow" data-cap="${idx}"><span>💌 ${who}</span><span class="jr-capdate">${new Date(c.sealed).toLocaleDateString('bg-BG')} · виж</span></button>`;
      }).join('');
      capList.querySelectorAll('[data-cap]').forEach(b => b.addEventListener('click', () => {
        const c = capsules[+b.dataset.cap];
        // капсула-писмото е емоционален момент — топъл оверлей, не студен alert
        const заглавие = (c.to === 'baby' ? '👶 До бебето' : '💜 До себе си') + ' · ' + new Date(c.sealed).toLocaleDateString('bg-BG');
        if (window.BL_UI) BL_UI.note(c.text, { title: заглавие, okText: 'Затвори 💜' });
        else alert(заглавие + '\n\n' + c.text);
      }));
    }
    drawCaps();
    root.appendChild(c7);

    /* ── 8. Месечно огледало ── */
    const c8 = el('section', 'jr-card');
    c8.appendChild(el('h4', 'jr-title', 'Месечното огледало 📊 <span class="jr-sub">твоят месец с един поглед</span>'));
    const mirror = el('div', 'jr-mirror');
    (function () {
      const now = new Date(), ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const cks = load('bl_checkins', {});
      const days = Object.keys(cks).filter(k => k.startsWith(ym));
      const moods = days.map(k => cks[k].m);
      const avg = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length) : null;
      const wave = days.slice(-14).map(k => ['😩', '😔', '😐', '🙂', '🥰'][cks[k].m]).join(' ');
      const me = load('bl_metime', { minutes: 0 });
      const winsAll = load('bl_wins', {});
      const winCount = Object.keys(winsAll).filter(k => k.startsWith(ym)).reduce((a, k) => a + winsAll[k].length, 0);
      mirror.innerHTML =
        `<div class="jr-mrow"><span>Минутки за теб този месец</span><strong>${days.length}</strong></div>` +
        (avg !== null ? `<div class="jr-mrow"><span>Средно настроение</span><strong>${['😩', '😔', '😐', '🙂', '🥰'][Math.round(avg)]}</strong></div>` : '') +
        (wave ? `<div class="jr-wave">${wave}</div>` : '') +
        `<div class="jr-mrow"><span>„Мое време“ (седмица)</span><strong>${me.minutes} мин</strong></div>` +
        `<div class="jr-mrow"><span>Малки победи</span><strong>${winCount}</strong></div>` +
        (days.length ? `<p class="jr-mnote">Виждаш ли? Лошите дни минават, добрите остават. 💜</p>` : `<p class="jr-privacy">Отделяй си минутка всеки ден — тук ще се рисува твоят месец.</p>`);
    })();
    c8.appendChild(mirror);
    root.appendChild(c8);

    // г12 №282: този ред беше гол <p> — не .jr-card. polish.js събира само
    // `:scope > .jr-card`, после изчиства root, значи най-силното обещание
    // на стаята не стигаше до мама НИКОГА. Сега е карта и оцелява.
    const c9 = el('section', 'jr-card');
    // 🔍 скептик 05.08: подзаглавието беше ДУМА ПО ДУМА същото като изречението
    //    отдолу („никой друг не го вижда — дори ние“) — обещанието се казваше
    //    два пъти в една карта. Казва се веднъж, с пълния глас.
    c9.appendChild(el('h4', 'jr-title', 'Само твое 🔒 <span class="jr-sub">затова тук пишеш свободно</span>'));
    c9.appendChild(el('p', 'jr-privacy', '🔒 Всичко тук живее само на твоя телефон. Никой друг не го вижда — дори ние.'));
    root.appendChild(c9);
  }

  // 🗑️ renderSos (45 реда) МАХНАТ — беше присвоен тук, но rooms2.js веднага
  // го презаписваше с renderHealth (Object.assign, rooms2:1243). Мъртъв код
  // от самото начало (одит-флот П23, проход 1 тема 9). Здраве се рисува от
  // renderHealth + пакетите; „Здраве и SOS" се добавя от rooms2, не оттук.
  window.ROOM_FEATURES = {
    'Дневник на мама': renderJournal
  };
})();
