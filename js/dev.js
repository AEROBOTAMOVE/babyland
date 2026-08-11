// ═══════════════════════════════════════════════════════════
// DEV — РЕДЪТ И ПРЕМИУМЪТ В „РАЗВИТИЕ И ИГРИ“ 🧸✨
// 5 смислени кътчета + избор навсякъде: играта се избира по
// време и настроение, любимите се пазят, уменията се гледат
// по месец назад и напред, приказката има дължина и се запазва.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const ROOM = 'Развитие и игри';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const getBaby = () => load('bl_baby', { name: '', birth: '' });

  // ── петте кътчета ──
  const SECTIONS = [
    ['dg', '📈 Расте и учи'],
    ['dp', '🎲 Играем заедно'],
    ['df', '🌟 Първите пъти'],
    ['dt', '🎨 Творби и спомени'],
    ['dm', '🧿 Кътче за мама']
  ];
  // „Играем заедно" (dp, default) беше кофа — сигнали/диапазони/рисунки падаха
  // там. Пращаме ги по места (одит-флот П23): развитие/сигнали → dg; рисунки →
  // dt; екранно време → dm (родителски инструмент, не игра).
  const RULES = [
    [/какво умее|дърво|кога да се допитам|кога обикновено|диапазон|двуезич|сигнал/i, 'dg'],
    [/какво да правим|играта|приказка|приспивн|книжки/i, 'dp'],
    [/първите пъти|витрина|гордост/i, 'df'],
    [/драскулк|рисунк|мигове|сподели|споменче/i, 'dt'],
    // г07/62: „екранн" хващаше и картата с игрите ЗА БЕБЕТО („не са екранно
    // време, а инструмент") и я пращаше в „Кътче за мама". Само заглавието на
    // родителската карта („Екранното време 📺") трябва да пада тук.
    [/мит или истина|екранното време/i, 'dm']
  ];
  window.BL_ROOM_SECTIONS = window.BL_ROOM_SECTIONS || {};
  window.BL_ROOM_SECTIONS[ROOM] = {
    sections: SECTIONS,
    match: t => (RULES.find(([re]) => re.test(t)) || [null, 'dp'])[1],
    keepOrder: true, toc: true
  };

  // ═══════════ 🎲 „КАКВО ДА ПРАВИМ ДНЕС“ 2.0 — с истински избор ═══════════
  const TIME_FILTER = [
    ['all', '⏱️ Все едно'],
    ['quick', '⚡ 5 минутки'],
    ['calm', '😌 Тихичко'],
    ['move', '🤸 Да размърдаме']
  ];
  const NEED_FILTER = [
    ['всичко', '🎁 С каквото имаме'],
    ['нищо', '🙌 Без нищо'],
    ['кухня', '🍳 Кухнята'],
    ['хартия', '📄 Хартия'],
    ['плат', '🧻 Платчета']
  ];
  // тихите и подвижните игри — по думите в описанието
  const CALM_RE = /гушк|тих|шепот|книж|приказк|поглед|слуша|сгуш|огледал|песнич|сортир|прехвърл|нижи|рисув|драскул/i;
  const MOVE_RE = /танц|тунел|пълз|скач|топка|мечеш|тича|барабан|стълб|катер|коляно|велосипед|колело|подскок/i;
  const QUICK_RE = /минут|бърз|секунд/i;

  function playCard2() {
    const c = card('Какво да правим днес? 🎲 <span class="jr-sub">кажи ми колко време имаш и с какво — аз ще избера</span>');
    const D = window.BL_DATA || { activities: [] };
    const baby = getBaby();
    const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
    let need = 'всичко', mode = 'all', last = null;

    function chipRow(list, cur, onPick) {
      const row = el('div', 'jr-quick');
      list.forEach(([v, lbl]) => {
        const b = el('button', 'jr-chip' + (v === cur ? ' on' : ''), lbl); b.type = 'button';
        b.addEventListener('click', () => {
          row.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
          b.classList.add('on'); onPick(v); fx().buzz(6);
        });
        row.appendChild(b);
      });
      return row;
    }
    c.appendChild(el('p', 'dv-flabel', '⏱️ Колко време и настроение:'));
    c.appendChild(chipRow(TIME_FILTER, 'all', v => { mode = v; }));
    c.appendChild(el('p', 'dv-flabel', '🎁 Какво имаме подръка:'));
    c.appendChild(chipRow(NEED_FILTER, 'всичко', v => { need = v; }));

    const spin = el('button', 'jr-btn', '🎡 Дай ни идея!'); spin.type = 'button';
    const out = el('div', 'dv-act');
    c.appendChild(spin); c.appendChild(out);

    function pool() {
      const am = a ? a.devMonths : 8;
      let p = D.activities.filter(x => am >= x.a0 && am <= x.a1);
      if (need !== 'всичко') p = p.filter(x => x.need === need);
      if (mode === 'calm') p = p.filter(x => CALM_RE.test(x.t + ' ' + x.x));
      else if (mode === 'move') p = p.filter(x => MOVE_RE.test(x.t + ' ' + x.x));
      else if (mode === 'quick') p = p.filter(x => QUICK_RE.test(x.x) || x.need === 'нищо');
      if (!p.length) p = D.activities.filter(x => am >= x.a0 && am <= x.a1);
      if (!p.length) p = D.activities;
      return p;
    }
    function draw(act) {
      last = act;
      const favs = load('bl_play_favs', []);
      const done = load('bl_play_done', {});
      const isFav = favs.includes(act.t);
      const times = done[act.t] || 0;
      out.innerHTML = `<div class="dv-actcard pop">
        <h5>${esc(act.t)}</h5><p>${esc(act.x)}</p>
        <div class="jr-quick dv-actrow">
          <button class="jr-chip ${isFav ? 'on' : ''}" data-a="fav" type="button">${isFav ? '💜 Любима' : '🤍 Любима'}</button>
          <button class="jr-chip" data-a="done" type="button">✔ Направихме я${times ? ' (' + times + ')' : ''}</button>
          <button class="jr-chip" data-a="next" type="button">🎲 Друга</button>
        </div></div>`;
      out.querySelector('[data-a="fav"]').addEventListener('click', (e) => {
        const f = load('bl_play_favs', []);
        const i = f.indexOf(act.t);
        if (i > -1) f.splice(i, 1); else { f.push(act.t); fx().buzz(10); }
        save('bl_play_favs', f); drawFavs(); draw(act);   // г07/251: и списъкът „Твоите любими" се обновява
      });
      out.querySelector('[data-a="done"]').addEventListener('click', (e) => {
        const d = load('bl_play_done', {});
        d[act.t] = (d[act.t] || 0) + 1; save('bl_play_done', d);
        fx().confetti(e.target, 12); fx().cheer('Браво на вас! 🎉'); draw(act);
      });
      out.querySelector('[data-a="next"]').addEventListener('click', () => spin.click());
    }
    spin.addEventListener('click', () => {
      const p = pool().filter(x => !last || x.t !== last.t);
      const act = (p.length ? p : pool())[Math.floor(Math.random() * (p.length ? p.length : pool().length))];
      draw(act); fx().buzz(8);
    });

    // любимите — на едно докосване
    const favBox = el('div', 'dv-favs');
    function drawFavs() {
      const f = load('bl_play_favs', []);
      favBox.innerHTML = f.length ? '<p class="dv-flabel">💜 Твоите любими:</p>' : '';
      const row = el('div', 'jr-quick');
      f.forEach(t => {
        const act = (D.activities || []).find(x => x.t === t);
        if (!act) return;
        const b = el('button', 'jr-chip', '💜 ' + t); b.type = 'button';
        b.addEventListener('click', () => draw(act));
        row.appendChild(b);
      });
      if (f.length) favBox.appendChild(row);
    }
    drawFavs();
    c.appendChild(favBox);
    // г07/261: басейнът се филтрира по КОРИГИРАНАТА възраст (devMonths), а подписът
    // казваше календарната — за недоносено двете се разминават и мама чете, че
    // играта е „за 6 месеца“, докато е за 4. Казваме същото число, по което избираме.
    const пм = a ? (a.corr ? a.corr.ym : a.ym) : 0;
    c.appendChild(el('p', 'jr-privacy', a ? `Подбрано за ${esc(baby.name) || 'бебето'} на ${пм} ${пм === 1 ? 'месец' : 'месеца'}${a.corr ? ' коригирани' : ''}.` : 'Задай рождена дата в „Моето бебе“ и ще подбирам по възрастта.'));
    return c;
  }

  // ═══════════ 📈 „КАКВО УМЕЕ СЕГА“ 2.0 — избор на месец (назад и напред) ═══════════
  function skillsPicker(root) {
    const cards = [...root.querySelectorAll(':scope > .jr-card')];
    // 🔴 05.08 (скептик, близнакът на rooms2 №207): търсенето беше по ТЕКСТ,
    //    а „Дървото на уменията“ (rooms3.js) СПОМЕНАВА „Какво умее сега?“ в
    //    подканата си. Щом истинската карта я няма (бременна без бебе), тази
    //    беше следващата и пикерът кацаше В НЕЯ. Търсим по заглавието.
    const sc = cards.find(c => { const h = c.querySelector('h4'); return h && /Какво умее сега/.test(h.textContent); });
    if (!sc || sc.querySelector('.dv-mpick')) return;
    const D = window.BL_DATA;
    if (!D || !D.milestones) return;
    const baby = getBaby();
    const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
    // 🤰 без рождена дата няма „сега“: пикерът падаше на 6-ия месец и редовете
    //    му са БУТОНИ — бременната можеше да отметне умение и в bl_ms_d да
    //    легне дата за несъществуващо бебе. Стаята се събужда с раждането.
    if (!a) return;
    // коригирана възраст (devMonths) от ДВЕТЕ страни — иначе за недоносено сравнява
    // кандидат-по-коригирана срещу текущ-по-календарна и избира грешния милестоун
    // 🔴 11.08 (обиколка като майка на 14 месеца): изборът беше „НАЙ-БЛИЗКИЯТ“
    //    месец. На 14 месеца най-близкият е 15 — и картата обявяваше „📍 Сега —
    //    около 15-ия месец: Ходи самостоятелно“, а 12-ия месец го наричаше
    //    „💭 Спомен“. Мама на непрохождащо дете чете, че НЕЩО, което още не се
    //    е случило, вече е „сега“ — при това докато съседната карта в същата
    //    стая казва честното „Проходва обикновено 9-18 м.“. Вече взимаме
    //    последния ПРЕМИНАТ месец, не следващия: показваме какво вече е било,
    //    не какво „трябва“ да е. Напред се гледа само нарочно, с чип.
    const минали = a ? D.milestones.filter(x => x.m <= a.devMonths) : [];
    const cur = a ? (минали.length ? минали[минали.length - 1] : D.milestones[0]) : D.milestones[4];

    const pick = el('div', 'dv-mpick');
    pick.appendChild(el('p', 'dv-flabel', '👀 Виж по месеци — назад за спомен, напред за очакване:'));
    const row = el('div', 'jr-quick dv-mrow');
    D.milestones.forEach(ms => {
      const b = el('button', 'jr-chip' + (ms.m === cur.m ? ' on' : ''), ms.m + ' м.'); b.type = 'button';
      b.addEventListener('click', () => {
        row.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        renderMs(ms);
        fx().buzz(6);
      });
      row.appendChild(b);
    });
    pick.appendChild(row);
    const box = el('div', 'dv-ms2');
    pick.appendChild(box);

    function renderMs(ms) {
      const done = load('bl_ms_done', {});
      const rows = [['motor', '🤸 Едро моторно'], ['fine', '✋ Фино моторно'], ['speech', '🗣️ Говор'], ['social', '💛 Социално']];
      // „сега“ е точно преминатият месец (cur). Всичко над него е „очаква ви“ —
      // никога „сега“, за да не се чете като мярка, на която детето не отговаря.
      const isNow = a && ms.m === cur.m;
      const isPast = a && ms.m < cur.m;
      box.innerHTML = `<p class="dv-mstitle">${isNow ? '📍 Сега — около' : isPast ? '💭 Спомен — около' : '🔮 Очаква ви — около'} ${ms.m}-ия месец:</p>`;
      rows.forEach(([k, lbl]) => {
        const id = ms.m + '_' + k;
        const r = el('button', 'dv-msrow' + (done[id] ? ' done' : ''));
        r.type = 'button';
        r.innerHTML = `<span class="jr-check">${done[id] ? '✔' : ''}</span><span class="dv-mslbl">${lbl}</span><span class="dv-mstxt">${ms[k]}</span>`;
        r.addEventListener('click', () => {
          const d = load('bl_ms_done', {});
          d[id] = !d[id]; save('bl_ms_done', d);
          const md = load('bl_ms_d', {});
          // 🔴 г07/59: махнеш ли отметката, датата в bl_ms_d оставаше — Дървото
          //    забравяше умението, а Витрината и хапчето на банера продължаваха
          //    да го броят. Изключването чисти и датата.
          if (d[id]) { if (!md[id]) md[id] = Date.now(); } else { delete md[id]; }
          save('bl_ms_d', md);
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = d[id] ? '✔' : '';
          if (d[id]) { fx().confetti(r, 14); fx().cheer('Ново умение! Дървото цъфна 🌳'); }
        });
        box.appendChild(r);
      });
      // 🔴 04.08 (обиколка): флагът се показваше САМО когато разгледаният месец
      //    е „сега“ (±1.5 м.). Между два чипа обаче никой месец не е „сега“ —
      //    дете на 21 месеца гледа чип 18 („💭 Спомен“, флагът скрит) и чип 24
      //    („🔮 Очаква ви“, флагът скрит). Между 19.5 и 22.5 месеца
      //    предупреждението за говора просто не съществуваше.
      //    Сега важи ВЪЗРАСТТА НА ДЕТЕТО, не кой чип е натиснат.
      const ключове = Object.keys(D.milestoneFlags || {}).map(Number).sort((x, y) => x - y);
      const най = (праг) => {
        let f = '';
        ключове.forEach(fk => { if (праг >= fk) f = D.milestoneFlags[fk]; });
        return f;
      };
      const флагСега = a ? най(a.devMonths) : '';
      const флагНаМесеца = най(ms.m);

      // това, което важи ЗА ТВОЕТО ДЕТЕ сега — независимо кой месец разглеждаш
      if (флагСега) {
        box.appendChild(el('p', 'dv-flag', '👀 ' + флагСега));
        // г07/370: най-важното изречение свършваше в мълчание. Тук е бутонът,
        //   който го занася в „Какво искам да го попитам 💭“ (Моето бебе →
        //   Прегледи) — за да не се разчита на паметта в 23:40.
        // 🔴 05.08 (СКЕПТИКЪТ към №370): бутонът се раждаше винаги в състояние
        //    „още не е записано“, а renderMs() се пуска наново при ВСЕКИ месечен
        //    чип. Мама записва въпроса, натиска съседния месец — и същият флаг
        //    пак ѝ предлага „📝 Запиши го“. Пазачът `!q.includes` не дава дубли,
        //    но екранът твърди обратното на паметта. Питаме списъка, не себе си.
        const вечеЗаписан = load('bl_doc_questions', []).includes(флагСега);
        const питай = el('button', 'jr-chip', вечеЗаписан ? '✔ Записано за лекаря' : '📝 Запиши го като въпрос за лекаря');
        питай.type = 'button';
        питай.disabled = вечеЗаписан;
        питай.addEventListener('click', () => {
          const q = load('bl_doc_questions', []);
          if (!q.includes(флагСега)) { q.push(флагСега); save('bl_doc_questions', q.slice(-30)); }
          питай.textContent = '✔ Записано за лекаря';
          питай.disabled = true;
          fx().buzz(10); fx().cheer('Чака те при въпросите за педиатъра, в „Моето бебе“ 💜');
        });
        box.appendChild(питай);
      }
      // а ако гледа напред и там пазим друго — казваме го като очакване, не като мярка
      if (флагНаМесеца && флагНаМесеца !== флагСега && (!a || ms.m > a.devMonths)) {
        // г07/254: „ще гледаме ДРУГО“ обещава нещо казано преди. При празна памет
        //   флагСега е '' и преди него не е казано нищо — тогава го казваме просто.
        box.appendChild(el('p', 'dv-flag dv-flag-soon', флагСега
          ? '🔮 Към ' + ms.m + '-ия месец ще гледаме друго: ' + флагНаМесеца
          : '🔮 Към ' + ms.m + '-ия месец се гледа: ' + флагНаМесеца));
      }
      box.appendChild(el('p', 'jr-privacy', 'Прозорците са ШИРОКИ — това са ориентири, не изпит. Всяко бебе върви по своя пътека. 💜'));
    }
    // старото тяло си отива, новото поема
    const oldBox = sc.querySelector('.dv-ms');
    if (oldBox) oldBox.remove();
    sc.appendChild(pick);
    renderMs(cur);
  }

  // ═══════════ 📖 приказката: дължина + запазване ═══════════
  function storyPlus(root) {
    const sc = [...root.querySelectorAll(':scope > .jr-card')].find(c => /Приказка за лека нощ/.test(c.textContent));
    if (!sc || sc.querySelector('.st-keep')) return;
    const keep = el('button', 'jr-chip st-keep', '💾 Запази приказката в спомените'); keep.type = 'button';
    keep.addEventListener('click', () => {
      const txt = sc.querySelector('.st-story');
      if (!txt) { fx().cheer('Първо направи приказка 📖'); return; }
      const notes = load('bl_notes_dev', []);
      // г07/262: textContent събираше и бутона „🔊 Прочети на глас“ и слепваше
      //   съседните абзаци без дъх, а slice режеше насред думата. Взимаме само
      //   абзаците, разделяме ги и режем на цяла дума.
      const абзаци = [...txt.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean);
      const s = абзаци.length ? абзаци.join(' ') : txt.textContent.trim();
      const кратко = s.length > 400 ? s.slice(0, 400).replace(/\s\S*$/, '') + '…' : s;
      notes.push({ t: '📖 ' + кратко, d: Date.now() });
      save('bl_notes_dev', notes);
      fx().confetti(keep, 14); fx().cheer('Приказката е в „Мигове за спомен“ 💜');
    });
    sc.appendChild(keep);
  }

  // ═══════════ 🎵 приспивните: любима песничка ═══════════
  function lullabyPlus(root) {
    const lc = [...root.querySelectorAll(':scope > .jr-card')].find(c => /Приспивни песнички/.test(c.textContent));
    if (!lc || lc.querySelector('.lul-fav')) return;
    const box = el('div', 'lul-fav');
    function draw() {
      const fav = load('bl_lullaby_fav', '');
      box.innerHTML = fav
        ? `<p class="dv-flabel">💜 Вашата песен: <strong>${esc(fav)}</strong> <button class="jr-chip lul-x" type="button">смени</button></p>`
        : '<p class="dv-flabel">Докосни песничка горе, после ѝ сложи сърце — да я помним като „вашата“. 💜</p>';
      const x = box.querySelector('.lul-x');
      if (x) x.addEventListener('click', () => { save('bl_lullaby_fav', ''); draw(); });
      if (!fav) {
        const row = el('div', 'jr-quick');
        // г07/252: „.jr-chip“ хващаше и бутона „🔊 Изпей я вместо мен“ (той стои
        //   в .lul-out, не в реда с песните) и той се предлагаше като име на песен.
        //   Имената на песничките живеят само в реда .jr-quick.
        lc.querySelectorAll('.jr-quick > .jr-chip').forEach(ch => {
          if (ch.closest('.lul-fav')) return;
          const nm = ch.textContent.trim();
          const b = el('button', 'jr-chip', '💜 ' + nm); b.type = 'button';
          b.addEventListener('click', () => { save('bl_lullaby_fav', nm); fx().buzz(10); draw(); });
          row.appendChild(b);
        });
        if (row.children.length) box.appendChild(row);
      }
    }
    draw();
    lc.appendChild(box);
  }

  // ═══════════ 🧿 играта: избор на тема ═══════════
  function quizTheme(root) {
    const qc = [...root.querySelectorAll(':scope > .jr-card')].find(c => /Мит или истина/.test(c.textContent));
    if (!qc || qc.querySelector('.qz-theme') || !window.BL_WISDOM) return;
    const THEMES = [['all', '🎲 Всичко'], ['Бременност', '🤰 Бременност'], ['Моето бебе', '🍼 Бебето'], ['Захранване', '🥄 Храна'], ['Здраве и SOS', '🩺 Здраве'], ['Развитие и игри', '🧸 Развитие']];
    const row = el('div', 'jr-quick qz-theme');
    // 🟠 11.08 (обиколка): етикетът обещаваше „по коя тема“, а темата хваща само
    //    МИТОВЕТЕ — истините (24 бр.) нямат тема и влизат в тестето винаги, инак
    //    всеки отговор щеше да е „Мит“ и играта се разпада. Измерено: при
    //    „🧸 Развитие“ тестето е 45 карти, от които 24 (повече от половината) са
    //    от други теми. Обещаваме това, което правим.
    row.appendChild(el('p', 'dv-flabel', '🎯 Митовете по коя тема (истините идват отвсякъде):'));
    const chips = el('div', 'jr-quick');
    // проход 3 T19: маркирай чипа на ТЕКУЩАТА тема (не винаги първия) — иначе при
    // повторно отваряне чиповете показват „Всичко", а тестето е още филтрирано.
    const тек = window.BL_QUIZ_THEME || 'all';
    THEMES.forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip' + (v === тек ? ' on' : ''), lbl); b.type = 'button';
      b.addEventListener('click', () => {
        chips.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        window.BL_QUIZ_THEME = v === 'all' ? null : v;
        // #28: опресняваме САМО куиза с новата тема — стаята не се пре-рисува
        // (пази скрол/сгъвания). Fallback към старото ако методът липсва.
        if (typeof qc._reTheme === 'function') qc._reTheme();
        else if (window.MamaHelper) { MamaHelper.close(); MamaHelper.open(ROOM); }
        fx().buzz(6);
      });
      chips.appendChild(b);
    });
    row.appendChild(chips);
    qc.insertBefore(row, qc.children[1] || null);
  }

  // ── свързване: подредба + ъпгрейдите ──
  const base = window.ROOM_FEATURES && window.ROOM_FEATURES[ROOM];
  if (base) {
    window.ROOM_FEATURES[ROOM] = root => {
      base(root);
      // старата „Какво да правим днес?“ отстъпва на новата с избор
      const old = [...root.querySelectorAll(':scope > .jr-card')].find(c => /Какво да правим днес/.test(c.textContent));
      if (old) old.replaceWith(playCard2());
      skillsPicker(root);
      storyPlus(root);
      lullabyPlus(root);
      quizTheme(root);
    };
  }
})();
