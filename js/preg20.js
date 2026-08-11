// ═══════════════════════════════════════════════════════════
// 🤰 БРЕМЕННОСТ 2.0 — модернизацията (план 20)
//
// 🌅 Б3   „Тази седмица“ — новото сърце на стаята (+Б3.4 сънищата, +Б6.4 г/см)
// 🎡 Б4   Пътеката на чакането — вместо сухия списък
// 🩺 Б2.2 „Прегледът“ — трите карти стават една
// 🧲 Б2.3 „Истински ли са?“ застава до брояча на контракции
// 🌗 Б5   Живата стая — подрежда се по седмицата
// ✨ Б6   Календарче на прегледите · Сигнали, които не чакат ·
//         Спомен на седмицата · чеклист на 28-та
// 🚪 Б10.5 Без дата → една голяма покана
//
// Как работи: обвива ROOM_FEATURES['Бременност'] НАКРАЯ (зарежда се
// последен) и пренарежда/слива/добавя върху построеното. Старите карти
// пазят ключовете и кода си — тук само се решава какво се вижда и къде.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const мсДата = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const fx = () => window.BL_FX || { buzz() {}, cheer() {}, confetti() {} };
  const D = () => window.BL_DATA || {};

  const lmp = () => (window.BL_EXPECT ? BL_EXPECT.lmp() : (load('bl_lmp', '') || '').replace(/^"|"$/g, ''));
  const наПауза = () => !!(window.BL_EXPECT && BL_EXPECT.paused());
  // проход 4: РОДИЛА майка (има рождена дата) не бива да вижда „събуди ме с ПМ" —
  // въвеждане там би върнало бременност-режим върху роденото бебе.
  const роди = () => { try { return !!(JSON.parse(localStorage.getItem('bl_baby') || '{}').birth); } catch (e) { return false; } };
  function седмица() {
    const l = lmp(); if (!l) return 0;
    const d = new Date(l); if (isNaN(d)) return 0;
    return Math.floor((Date.now() - d) / 604800000);
  }
  function дниДоТермин() {
    const l = lmp(); if (!l) return null;
    return Math.ceil((new Date(l).getTime() + 280 * 86400000 - Date.now()) / 86400000);
  }

  // ── Б6.4: приблизителни грамове и сантиметри по седмици ──
  // Ориентири са, не диагноза — затова „~“. От 12-та, преди това е мъничко.
  // 🔴 05.08 (одит г11, №227): дължината е мерена по ДВА различни начина под
  //    един етикет — до 18-та седмица теме-опашка, от 20-та теме-пета. Затова
  //    „скокът" 14,2 → 25,6 см за две седмици. Числата са верни, липсваше по
  //    какво са мерени — и мама го вижда с едно прелистване. Пишем го до тях.
  const РАЗМЕРИ = {
    12: [14, 5.4], 14: [43, 8.7], 16: [100, 11.6], 18: [190, 14.2],
    20: [300, 25.6], 22: [430, 27.8], 24: [600, 30], 26: [760, 35.6],
    28: [1000, 37.6], 30: [1300, 39.9], 32: [1700, 42.4], 34: [2100, 45],
    36: [2600, 47.4], 38: [3100, 49.8], 40: [3400, 51.2], 42: [3500, 51.5]
  };
  function ключЗа(w) {
    const ключове = Object.keys(РАЗМЕРИ).map(Number).filter(k => k <= w).sort((a, b) => b - a);
    return ключове.length ? ключове[0] : null;
  }
  function размерЗа(w) {
    const к = ключЗа(w);
    return к === null ? null : РАЗМЕРИ[к];
  }
  // 🔴 05.08 (скептикът към №227): етикетът се решаваше по ПОКАЗАНАТА седмица
  //    (`пв <= 18`), а числото идва от ПОСЛЕДНАТА кофа ≤ пв. На 19-та седмица
  //    кофата е 18 (14,2 см = теме-опашка), но етикетът казваше „теме-пета" —
  //    тоест точно объркването, което находката се опитва да затвори, оцеляваше
  //    за една седмица. Мерено: 19-та е единствената разминаваща се от 4 до 42.
  //    Етикетът вече се решава по КОФАТА, не по показаната седмица.
  function мяркаЗа(w) {
    const к = ключЗа(w);
    return к !== null && к <= 18 ? 'теме-опашка' : 'теме-пета';
  }

  // ═══════════ 🌅 Б3 — „ТАЗИ СЕДМИЦА“ ═══════════
  function сърцеКарта() {
    const w = седмица();
    if (!w || наПауза()) return null;
    const c = el('section', 'jr-card pg20-hero');
    if (w > 42) {                                     // отвъд данните — честно
      c.innerHTML = `<h4 class="jr-title">Тази седмица 🌅 <span class="jr-sub">${w}-та — след термина</span></h4>
        <p class="pg20-big">Бебето идва всеки момент. Лекарят ти следи отблизо — това е неговата седмица, не на календара. 💜</p>`;
      return c;
    }
    // проход 4: „надничащ" герой — прелистване напред/назад през седмиците.
    // Реалната w държи времевата линия (сънища до срещата); гв е ГЛЕДАНАТА седмица.
    const дни = дниДоТермин();
    let гв = w;
    c.innerHTML = `
      <h4 class="jr-title">Тази седмица 🌅 <span class="jr-sub pg20-hsub"></span></h4>
      <div class="pg20-top">
        <button class="pg20-peek" data-d="-1" type="button" aria-label="предишна седмица">‹</button>
        <span class="pg20-fruit" role="button" tabindex="0" aria-label="напред една седмица"></span>
        <div class="pg20-swap" aria-live="polite"></div>
        <button class="pg20-peek" data-d="1" type="button" aria-label="следваща седмица">›</button>
      </div>
      ${дни !== null && дни > 0 ? `<p class="pg20-sleeps">🌙 още <strong data-cnt="${дни}">${дни}</strong> ${дни === 1 ? 'сън' : 'съня'} до срещата</p>` : `<p class="pg20-sleeps">💜 Той идва всеки момент — само 1 на 20 бебета пристига точно на датата.</p>`}
      <p class="pg20-backwrap" hidden><button class="jr-chip pg20-back" type="button">↩ върни се към моята седмица</button></p>`;
    const swap = c.querySelector('.pg20-swap'), fruit = c.querySelector('.pg20-fruit');
    const hsub = c.querySelector('.pg20-hsub'), backWrap = c.querySelector('.pg20-backwrap');
    function рисувайSwap(anim) {
      const пв = Math.max(4, Math.min(42, гв));
      const плод = (D().pregWeeks || {})[пв] || ['—', '🤍'];
      let ключ = 4; Object.keys(D().pregNotes || {}).map(Number).forEach(k => { if (k <= пв) ключ = k; });
      const бел = (D().pregNotes || {})[ключ] || {};
      const рз = размерЗа(пв);
      const три = пв <= 13 ? 'първи' : пв <= 27 ? 'втори' : 'трети';
      fruit.textContent = плод[1];
      hsub.textContent = гв === w ? (три + ' триместър · седмица по седмица с теб') : `гледаш ${гв}-та (ти си в ${w}-та)`;
      backWrap.hidden = (гв === w);
      swap.innerHTML = `
        <p class="pg20-week">${window.BL_REDNA ? BL_REDNA(пв) : пв + '-та'} седмица</p>
        <p class="pg20-size">колкото <strong>${esc(плод[0])}</strong>${рз ? ` · ~${рз[0] >= 1000 ? (рз[0] / 1000).toFixed(1) + ' кг' : рз[0] + ' г'} · ~${рз[1]} см <small>(${мяркаЗа(пв)})</small>` : ''}</p>
        <div class="pg20-note">
          ${бел.baby ? `<p>👶 ${esc(бел.baby)}</p>` : ''}
          ${бел.mama ? `<p>🌸 ${esc(бел.mama)}</p>` : ''}
        </div>
        ${бел.tip ? `<p class="pg20-do">✨ <strong>${гв === w ? 'Тази седмица' : 'През тази седмица'}:</strong> ${esc(бел.tip)}</p>` : ''}`;
      if (anim && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        swap.style.opacity = '0'; swap.style.transform = 'translateY(4px)';
        requestAnimationFrame(() => { swap.style.opacity = ''; swap.style.transform = ''; });
      }
    }
    function дисейбъл() { c.querySelectorAll('.pg20-peek').forEach(b => { b.disabled = (b.dataset.d === '-1' && гв <= 4) || (b.dataset.d === '1' && гв >= 42); }); }
    function move(d) { гв = Math.max(4, Math.min(42, гв + d)); дисейбъл(); рисувайSwap(true); fx().buzz(6); }
    рисувайSwap(false); дисейбъл();
    c.querySelectorAll('.pg20-peek').forEach(b => b.addEventListener('click', () => move(+b.dataset.d)));
    fruit.addEventListener('click', () => move(1));
    fruit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); move(1); } });
    backWrap.querySelector('.pg20-back').addEventListener('click', () => { гв = w; дисейбъл(); рисувайSwap(true); });
    if (window.BL_FX && BL_FX.countUp) setTimeout(() => BL_FX.countUp(c), 700);
    return c;
  }

  // ═══════════ 🎉 проход 4 — РАЖДАНЕТО СЕ ПРАЗНУВА ═══════════
  // Пътят на 40-те седмици завършваше в задънена улица. Тук получава финал:
  // едно докосване обръща приложението в бебешки режим. НИКОГА при пауза (загуба).
  function раждаКарта() {
    const w = седмица();
    if (!w || w < 37 || наПауза() || !lmp()) return null;   // само доносени 37+; загубата скрива всичко
    const baby = load('bl_baby', { name: '', sex: '', birth: '' });
    const c = el('section', 'jr-card pg20-birth');
    c.innerHTML = `<h4 class="jr-title">🎉 Бебето при теб ли е вече? <span class="jr-sub">кажи ми и стаята става негова</span></h4>
      <p class="cs-note">Без бързане — когато пристигне, кажи ми деня и целият свят тук се обръща за него. 💜</p>`;
    const nameI = el('input', 'jr-word'); nameI.type = 'text'; nameI.maxLength = 24;
    nameI.placeholder = 'Име (по желание)…'; nameI.value = baby.name || '';
    const п = el('input', 'jr-word'); п.type = 'date';
    // 22.07 (армия): toISOString е UTC → нощем max ставаше ВЧЕРА и точно
    //   родила майка не можеше да въведе днешния ден (без нито дума защо).
    п.max = мсДата(new Date());
    const днлмп = new Date(lmp()); if (!isNaN(днлмп)) п.min = днлмп.toISOString().slice(0, 10);
    const б = el('button', 'jr-btn', '🌸 Роди се! Отвори бебешкия свят'); б.type = 'button';
    б.addEventListener('click', () => {
      const d = п.value;
      if (!d || isNaN(new Date(d)) || d > мсДата(new Date())) { п.focus(); return; }
      save('bl_baby', { name: (nameI.value.trim() || baby.name || '').slice(0, 24), sex: baby.sex || '', birth: d });
      localStorage.removeItem('bl_lmp');                    // бременността приключи (както onboard.js)
      fx().confetti(c); fx().buzz(12); fx().cheer('Добре дошъл на света! 💜');
      if (window.refreshToday) window.refreshToday();
      if (window.MamaHelper) { MamaHelper.close(); setTimeout(() => MamaHelper.open('Моето бебе'), 400); }
    });
    c.appendChild(el('label', 'jr-privacy', 'Рожден ден:'));
    c.appendChild(п); c.appendChild(nameI); c.appendChild(б);
    return c;
  }

  // ═══════════ 🚪 Б10.5 — БЕЗ ДАТА: ПОКАНАТА ═══════════
  // 🔴 05.08 (одит г01 — близнакът на rooms2.js:589-592): една и съща дата, един
  //    и същ ключ bl_lmp, а двата екрана я наричаха с две различни имена. В стаята
  //    („Кога е терминът“) тя вече се казва „датата, по която броим (първи ден на
  //    цикъла или изчислена от термина)“, защото при вход през онбординга я е
  //    сметнало приложението, не мама. Тук носи СЪЩОТО име. Разликата е коя врата
  //    е отворена: в поканата мама я въвежда сама, затова питаме първия ден на
  //    цикъла ѝ — нищо не пресмятаме зад гърба ѝ и нищо не ѝ връщаме като „нейни
  //    думи“. Не пиши тук „или изчислена от термина“: това поле се записва както е
  //    въведено, а термин в него би изместил цялата пътека с 40 седмици.
  function поканаКарта(root) {
    const c = el('section', 'jr-card pg20-invite');
    c.innerHTML = `<h4 class="jr-title">Добре дошла 🤍 <span class="jr-sub">стаята се събужда с една дата</span></h4>
      <p class="cs-note">Кажи ми <strong>първия ден на последния ти цикъл</strong> — това е датата, по която броим тук. От нея оживява ТВОЯТА седмица: колко е голямо бебето, какво предстои, кога какво се прави.</p>`;
    const п = el('input', 'jr-word'); п.type = 'date'; п.max = мсДата(new Date());
    п.setAttribute('aria-label', 'Дата, по която броим (първи ден на цикъла)');
    const б = el('button', 'jr-btn', '🌸 Събуди стаята'); б.type = 'button';
    б.addEventListener('click', () => {
      if (!п.value) { п.focus(); return; }
      save('bl_lmp', п.value);
      fx().confetti(c); fx().buzz(12);
      if (window.MamaHelper) { MamaHelper.close(); setTimeout(() => MamaHelper.open('Бременност'), 350); }
    });
    c.appendChild(п); c.appendChild(б);
    c.appendChild(el('p', 'jr-privacy', 'Ако не помниш точния ден — приблизително стига. Лекарят после ще уточни по ехографията.'));
    return c;
  }

  // ═══════════ 🩺 Б2.2 — „ПРЕГЛЕДЪТ“: ЕДНА КАРТА ═══════════
  function прегледКарта(w) {
    const c = el('section', 'jr-card pg20-doc');
    c.innerHTML = `<h4 class="jr-title">Прегледът 🩺 <span class="jr-sub">дата · въпроси · чеклист — всичко за кабинета</span></h4>`;

    // 1) датата (от „Следващият преглед“, същият ключ bl_events)
    const ред = el('div', 'jr-addrow');
    const dt = el('input', 'jr-word'); dt.type = 'date'; dt.min = new Date().toISOString().slice(0, 10);
    const зап = el('button', 'jr-chip', 'Запази датата'); зап.type = 'button';
    ред.appendChild(dt); ред.appendChild(зап);
    const инфо = el('p', 'cs-note', '');
    const рисувайДата = () => {
      const ev = load('bl_events', []).filter(x => x.preg && new Date(x.d) >= new Date().setHours(0, 0, 0, 0));
      // 🔴 г09/198 (БЛИЗНАКЪТ на rooms5.js:131): тук пишеше „ще ти напомня на «Днес»“
      //    и „напомнянето идва само̀“ — а екранът „Днес“ не чете bl_events и
      //    приложението не праща известия. Обещание, което го няма в кода.
      //    Казваме къде датата НАИСТИНА стои, вместо тя да я чака напразно.
      инфо.innerHTML = ev.length
        ? `Следващ преглед: <strong>${new Date(ev[0].d).toLocaleDateString('bg-BG')}</strong> — стои в „Какво предстои 📅“ в Инструменти. Въпросите за кабинета са тук отдолу. 📝`
        : 'Запиши датата — ще я пазя в „Какво предстои 📅“ в Инструменти.';
    };
    зап.addEventListener('click', () => {
      if (!dt.value) return;
      const ev = load('bl_events', []).filter(x => !x.preg);
      ev.push({ id: 'preg' + Date.now(), t: 'Преглед (бременност)', d: dt.value, e: '🩺', preg: true });
      save('bl_events', ev); fx().buzz(10); рисувайДата();
    });
    c.appendChild(ред); c.appendChild(инфо); рисувайДата();

    // 2) чеклистът за СЕДМИЦАТА (същият ключ bl_qdoc — старата карта го пише)
    const НАБОРИ = [
      [1, 13, ['Кога е първата ехография и какво ще видим?', 'Кои изследвания сега и кои после?', 'Какво да спра/започна (витамини, лекарства)?', 'Нормални ли са болките/зацапването, които усещам?']],
      [14, 27, ['Как върви растежът спрямо седмицата?', 'Кога е анатомичната ехография и какво гледа?', 'Резултатите от скрининга — какво значат?', 'Какви движения да очаквам и кога?']],
      [28, 45, ['Как е позицията на бебето?', 'Кога да тръгна към болницата — моят конкретен знак?', 'Какво да правя при контракции преди термина?', 'План за раждане — какво е възможно в тази болница?']]
    ];
    const набор = НАБОРИ.find(([от, до]) => w >= от && w <= до) || НАБОРИ[2];
    if (w > 0) {
      c.appendChild(el('p', 'jr-privacy', 'За твоята ' + (window.BL_REDNA ? BL_REDNA(w) : w + '-та') + ' седмица — отметни зададените:'));
      const мои = load('bl_qdoc', {});
      набор[2].forEach((q, i) => {
        const ключ = w + '|' + i;
        const r = el('button', 'qd-row' + (мои[ключ] ? ' done' : '')); r.type = 'button';
        r.innerHTML = `<span class="jr-check">${мои[ключ] ? '✔' : ''}</span><span>${esc(q)}</span>`;
        r.addEventListener('click', () => {
          мои[ключ] = !мои[ключ]; save('bl_qdoc', мои);
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = мои[ключ] ? '✔' : '';
          fx().buzz(6);
        });
        c.appendChild(r);
      });
    }

    // 3) твоите въпроси (същият ключ bl_qdoc_my)
    const своя = el('textarea', 'jr-paper'); своя.rows = 2;
    своя.placeholder = 'Твой въпрос… (тук, за да не излети от главата в кабинета)';
    своя.value = load('bl_qdoc_my', '');
    своя.addEventListener('input', () => save('bl_qdoc_my', своя.value));
    c.appendChild(своя);

    // 4) печат — листът за кабинета
    // 🔴 05.08 (одит г11, №231): без дата w = 0, резервата по-горе е последният
    //    набор (28-45 с.) и печатът вадеше четири въпроса от трети триместър,
    //    които никога не са били на екрана — отметките ги пази `if (w > 0)`,
    //    печатът не. Листът тръгва само когато има седмица.
    if (w > 0) {
      const печат = el('button', 'jr-chip', '🖨️ Листът за кабинета'); печат.type = 'button';
      печат.addEventListener('click', () => {
        if (!window.BL_EXPR) return;
        const мои = load('bl_qdoc', {});
        const html = `<p class="pr-lead">Въпроси за прегледа · ${window.BL_REDNA ? BL_REDNA(w) : w + '-та'} седмица</p>
          <ul class="pr-list">${набор[2].map((q, i) => `<li>${мои[w + '|' + i] ? '☑' : '☐'} ${esc(q)}</li>`).join('')}</ul>
          ${(load('bl_qdoc_my', '') || '').trim() ? `<p class="pr-lead">Моите въпроси:</p><p>${esc(load('bl_qdoc_my', ''))}</p>` : ''}`;
        BL_EXPR.printOverlay('Прегледът', html, {});
      });
      c.appendChild(печат);
    }
    return c;
  }

  // ═══════════ ✨ Б6.1 — КАЛЕНДАРЧЕТО НА ПРЕГЛЕДИТЕ ═══════════
  const ПРЕГЛЕДИ = [
    [6, 8, '🩺', 'Регистрация + първа ехография', 'потвърждава сърдечната дейност'],
    [11, 13, '🧬', 'Биохимичен скрининг + нухална гънка', 'оценка на риска, не диагноза'],
    [18, 22, '🔬', 'Анатомична (фетална морфология)', 'голямата — гледа всичко, често казва пола'],
    [24, 28, '🍬', 'Кръвна захар (ОГТТ)', 'проверка за гестационен диабет'],
    [28, 32, '📏', 'Ехография на растежа', 'как расте и къде е плацентата'],
    [35, 37, '🧪', 'Стрептокок група Б', 'секрет — важно за самото раждане'],
    [36, 40, '🩺', 'Седмични прегледи', 'вече всяка седмица, с КТГ при нужда']
  ];
  function календарчеКарта(w) {
    const c = el('section', 'jr-card pg20-cal');
    c.innerHTML = `<h4 class="jr-title">Календарчето на прегледите 📅 <span class="jr-sub">кое кога — ориентири, лекарят ти води</span></h4>`;
    const бях = load('bl_checkups', {});
    ПРЕГЛЕДИ.forEach(([от, до, е, име, какво], i) => {
      const мина = w > до, сега = w >= от && w <= до;
      const r = el('button', 'pg20-calrow' + (бях[i] ? ' done' : '') + (сега ? ' now' : '') + (мина && !бях[i] ? ' past' : ''));
      r.type = 'button';
      r.innerHTML = `<span class="pg20-calw">${от}–${до} с.</span><span class="pg20-cale">${е}</span>
        <span class="pg20-calt"><strong>${esc(име)}</strong><small>${esc(какво)}</small></span>
        <span class="jr-check">${бях[i] ? '✔' : ''}</span>`;
      r.addEventListener('click', () => {
        бях[i] = !бях[i]; save('bl_checkups', бях);
        r.classList.toggle('done'); r.querySelector('.jr-check').textContent = бях[i] ? '✔' : '';
        fx().buzz(6);
      });
      c.appendChild(r);
    });
    c.appendChild(el('p', 'jr-privacy', 'Седмиците са „обикновено около“ — точният момент го казва твоят лекар. Отметни ✔ където си била.'));
    return c;
  }

  // ═══════════ ✨ Б6.2 — СИГНАЛИ, КОИТО НЕ ЧАКАТ ═══════════
  function сигналиКарта() {
    const c = el('section', 'jr-card pg20-signals');
    c.innerHTML = `<h4 class="jr-title">Сигнали, които не чакат 🚨 <span class="jr-sub">спокойно, но веднага — звънни на лекаря си</span></h4>
      <ul class="pg20-siglist">
        <li>🩸 Кървене — каквото и да е количество</li>
        <li>💧 Изтичане на течност (води)</li>
        <li>🤕 Силно главоболие + отоци + „звездички“ пред очите</li>
        <li>🤫 Бебето утихна — движенията рязко намаляха (след 28-та)</li>
        <li>🌡️ Температура над 38° / втрисане</li>
        <li>⏱️ Редовни контракции преди 37-ма седмица</li>
      </ul>
      <p class="jr-privacy">По-добре едно излишно обаждане, отколкото един пропуснат сигнал. Лекарите ПРЕДПОЧИТАТ да им звъннеш.</p>
      <a class="ro-sos" href="tel:112">📞 112 — ако не можеш да се свържеш с никого</a>`;
    return c;
  }

  // ═══════════ ✨ Б6.3 — СПОМЕН НА СЕДМИЦАТА ═══════════
  const СПОМЕНИ = [
    [4, 11, 'Кога разбра? Запиши мига — с кого беше, какво каза.'],
    [12, 15, 'Първата ехография: какво усети, когато го видя?'],
    [16, 19, 'Първото пърхане — на какво ти заприлича?'],
    [20, 23, 'Анатомичната: разбрахте ли какво е? Как избрахте да разберете (или да не)?'],
    [24, 27, 'Той вече те чува. Какво му каза първо?'],
    [28, 31, 'Първият ритник, който УСЕТИ друг човек — кой беше и как реагира?'],
    [32, 35, 'Стаята/кътчето му — какво подреди тази седмица?'],
    [36, 39, 'Чантата е до вратата. Какво сложи „само защото“?'],
    [40, 45, 'Последните дни само двамата. Какво искаш да му разкажеш за тях после?']
  ];
  function споменКарта(w) {
    const с = СПОМЕНИ.find(([от, до]) => w >= от && w <= до);
    if (!с) return null;
    const ключ = 'w' + с[0];
    const запазени = load('bl_preg_memories', {});
    const c = el('section', 'jr-card pg20-mem');
    c.innerHTML = `<h4 class="jr-title">Спомен на седмицата 🫧 <span class="jr-sub">едно изречение — после струва злато</span></h4>
      <p class="cs-note">${esc(с[2])}</p>`;
    const п = el('textarea', 'jr-paper'); п.rows = 2; п.maxLength = 300;
    п.value = запазени[ключ] || '';
    const б = el('button', 'jr-chip', запазени[ключ] ? '✔ Записано — промени' : '💜 Запиши го'); б.type = 'button';
    б.addEventListener('click', () => {
      const т = п.value.trim(); if (!т) { п.focus(); return; }
      const нов = !запазени[ключ];
      запазени[ключ] = т; save('bl_preg_memories', запазени);
      // Б10.4: спомените се вливат в Реката
      if (нов) {
        const река = load('bl_river_manual', []);
        река.push({ ts: Date.now(), e: '🤰', t: т.slice(0, 90) });
        save('bl_river_manual', река);
      }
      б.textContent = '✔ Записано — промени'; fx().buzz(10);
    });
    c.appendChild(п); c.appendChild(б);
    return c;
  }

  // ═══════════ ✨ Б6.5 — ЧЕКЛИСТ НА 28-та ═══════════
  function третиТриместърКарта(w) {
    if (w < 28 || w > 45) return null;
    const c = el('section', 'jr-card');
    // 🔴 11.08 (обиколка като майка): картата се показва от 28-та нататък, а
    //    заглавието ѝ казваше „Третият триместър ИДВА“ — в същата стая „Тази
    //    седмица“ и „Кога е терминът?“ вече пишат „трети триместър“ на същата
    //    жена. Приложението си противоречеше на един екран.
    // 🟠 Същият ред: „записани ли СМЕ“ и „кой КАРА“ приемаха за дадени партньор
    //    и кола. Жена, която чака сама и ще вика такси, чете чужд списък.
    c.innerHTML = `<h4 class="jr-title">Третият триместър 📋 <span class="jr-sub">пет неща, които се мислят отсега</span></h4>`;
    const т = load('bl_tri3', {});
    ['Курс за раждане / дишане — записа ли се?', 'Столчето за колата — избрано/монтирано?',
     'Ако има кой да чака вкъщи (дете, куче) — с кого остава в деня Х?', 'Пътят до болницата — с какво тръгваш и колко време е?',
     'Документите за болницата — в чантата ли са?'].forEach((з, i) => {
      const r = el('button', 'qd-row' + (т[i] ? ' done' : '')); r.type = 'button';
      r.innerHTML = `<span class="jr-check">${т[i] ? '✔' : ''}</span><span>${esc(з)}</span>`;
      r.addEventListener('click', () => {
        т[i] = !т[i]; save('bl_tri3', т);
        r.classList.toggle('done'); r.querySelector('.jr-check').textContent = т[i] ? '✔' : '';
        fx().buzz(6);
      });
      c.appendChild(r);
    });
    return c;
  }

  // ═══════════ 🎡 Б4 — ПЪТЕКАТА НА ЧАКАНЕТО ═══════════
  const МИЛЕСТОУНИ = [
    [8, '🩺', 'първи преглед'], [12, '🧬', 'скрининг'], [20, '🔬', 'анатомична'],
    [24, '👂', 'чува те'], [28, '👣', 'ританията'], [32, '📏', 'растежът'],
    [36, '🧳', 'чантата'], [40, '💜', 'срещата']
  ];
  function пътекаКарта(root, w) {
    const c = el('section', 'jr-card pg20-path');
    // 🟠 11.08 (обиколка „редки състояния“): без дата подзаглавието твърдеше
    //    „ти си на старта“ — а жената може да е в 30-та седмица и просто да не
    //    е въвела нищо. Празно поле не е доказателство: казваме че НЕ ЗНАЕМ.
    c.innerHTML = `<h4 class="jr-title">Пътеката на чакането 🎡 <span class="jr-sub">${w > 0 ? '40 седмици — ти си на ' + w + '-та' : '40 седмици — чака датата ти, за да знам къде си'}</span></h4>`;

    // лъкатушещата пътека: 300×150, 3 завоя; седмица → точка по кривата
    const path = 'M 15 125 C 70 95, 60 40, 130 45 C 200 50, 180 115, 245 110 C 280 107, 285 75, 285 60';
    const svg = el('div', 'pg20-svgwrap');
    const прогрес = Math.max(0, Math.min(1, w / 40));
    svg.innerHTML = `<svg viewBox="0 0 300 150" class="pg20-svg" role="img" aria-label="${w > 0 ? 'Пътят на бременността — седмица ' + w + ' от 40' : 'Пътят на бременността — 40 седмици, още нямам записана дата'}">
      <path d="${path}" class="pg20-road" pathLength="100"/>
      <path d="${path}" class="pg20-done" pathLength="100" style="stroke-dasharray:${(прогрес * 100).toFixed(1)} 100;stroke-dashoffset:${(прогрес * 100).toFixed(1)}"/>
      ${МИЛЕСТОУНИ.map(([мс, е, име]) => {
        const мина = w >= мс;
        return `<g class="pg20-ms ${мина ? 'bloom' : 'bud'}" data-ms="${мс}">
          <circle class="pg20-msdot" r="8"/>
          <text class="pg20-mse" text-anchor="middle" dy="3.5">${мина ? е : '🌱'}</text>
          <text class="pg20-msw" text-anchor="middle" dy="16">${мс}с</text>
        </g>`;
      }).join('')}
      <g class="pg20-mama"><circle r="9" class="pg20-mamabg"/><text text-anchor="middle" dy="3.5">🎈</text></g>
    </svg>`;
    c.appendChild(svg);
    c.appendChild(el('p', 'jr-privacy pg20-pathcap',
      w > 0 ? `Милите спирки: цъфналите са минали, пъпките предстоят. Докосни цветче, за да видиш какво е.` : 'Пътеката тръгва с датата ти.'));
    const легенда = el('p', 'cs-note pg20-mslbl'); легенда.hidden = true;
    c.appendChild(легенда);

    // позициониране на елементите ПО кривата — след като SVG е в DOM
    requestAnimationFrame(() => {
      const пътят = svg.querySelector('.pg20-road');
      if (!пътят || !пътят.getTotalLength) return;
      const L = пътят.getTotalLength();
      const наСедмица = с => пътят.getPointAtLength(L * Math.max(0, Math.min(1, с / 40)));
      svg.querySelectorAll('.pg20-ms').forEach(g => {
        const мс = +g.dataset.ms, т = наСедмица(мс);
        g.setAttribute('transform', `translate(${т.x} ${т.y})`);
        g.addEventListener('click', () => {
          const [, е, име] = МИЛЕСТОУНИ.find(([m]) => m === мс);
          легенда.hidden = false;
          легенда.innerHTML = `${е} <strong>${window.BL_REDNA ? BL_REDNA(мс) : мс + '-та'} седмица:</strong> ${esc(име)}${w >= мс ? ' · мина ✔' : ' · предстои'}`;
        });
      });
      const мама = svg.querySelector('.pg20-mama');
      const тм = наСедмица(w || 0.5);
      мама.setAttribute('transform', `translate(${тм.x} ${тм.y})`);
    });

    // Б4.2: скокът до кътчетата ВЕЧЕ го има — лентата с чипове на стаята
    // (polish) виси точно над пътеката. Втори ред чипове тук беше дублаж —
    // маха се, пътеката е за ВРЕМЕТО, чиповете за МЯСТОТО.
    return c;
  }

  // ═══════════ 🌗 Б5 — ЖИВАТА ПОДРЕДБА ═══════════
  // Кои карти да се сгънат/подредят по седмицата. НИЩО не се крие —
  // само редът и сгъването дишат.
  function подредиПоСедмица(root, w) {
    const намери = име => [...root.querySelectorAll('.jr-card')].find(c => {
      const т = c.querySelector('.jr-title');
      const н = т ? [...т.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
      return н.startsWith(име);
    });
    const сгъни = (име, бележка) => {
      const к = намери(име);
      if (!к) return;
      к.classList.add('folded', 'pg20-later');
      if (бележка && !к.querySelector('.pg20-when')) {
        const заглавие = к.querySelector('.jr-title');
        if (заглавие) заглавие.insertAdjacentHTML('beforeend', ` <span class="pg20-when">${бележка}</span>`);
      }
    };
    const вдигни = име => { const к = намери(име); if (к && к.parentNode) к.parentNode.insertBefore(к, к.parentNode.children[2] || null); };

    if (w > 0 && w < 26) сгъни('Брояч на ритания', '· от 26-та');
    if (w > 0 && w < 28) сгъни('План за раждане', '· към 28-та');
    // 🔴 г09/198 (трети близнак): пишеше „· към 30-та ще ти напомня“ — двойна
    //    неистина. Известия няма, а картата се разгъва на 28-та (клонът
    //    `if (w >= 28)` по-долу), не на 30-та. Съседите отгоре го казват честно.
    if (w > 0 && w < 28) сгъни('Чанта за родилния дом', '· към 28-та');
    if (w > 0 && w <= 13) {                     // Б5.2: първи триместър
      вдигни('Този месец боли това');
    }
    if (w >= 28) {                              // Б5.3: трети триместър
      вдигни('Брояч на контракции');
      вдигни('Чанта за родилния дом');
      const ч = намери('Чанта за родилния дом'); if (ч) ч.classList.remove('folded', 'pg20-later');
      const п = намери('План за раждане'); if (п) п.classList.remove('folded', 'pg20-later');
    }
    if (w > 40) {                               // Б5.4: тихата стая
      ['Брояч на ритания', 'Музика за коремчето', 'Изборът на име'].forEach(и => сгъни(и, ''));
      вдигни('Брояч на контракции');
    }
  }

  // ═══════════ сглобяването ═══════════
  function надгради(root) {
    const w = седмица();

    // Б10.5: без дата и без пауза → поканата е ПЪРВА, всичко друго под нея
    if (!lmp() && !наПауза() && !роди()) {
      const чат = root.querySelector('.ask-card');
      root.insertBefore(поканаКарта(root), чат ? чат.nextSibling : root.firstChild);
    }

    const намери = име => [...root.querySelectorAll('.jr-card')].find(c => {
      const т = c.querySelector('.jr-title');
      const н = т ? [...т.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
      return н.startsWith(име);
    });

    // #30: на празен старт „Кога е терминът“ пита СЪЩАТА дата (LMP) като поканата
    // → двойна покана. Махаме я, докато няма дата; връща се щом стаята се събуди.
    if (!lmp() && !наПауза()) { const трм = намери('Кога е терминът'); if (трм) трм.remove(); }

    // Б2.2: трите стари карти изчезват, „Прегледът“ идва на мястото на първата.
    // НЕ на пауза (загуба) — там не показваме карта за бременен преглед.
    const стари = ['Въпроси за прегледа', 'Въпроси за лекаря', 'Следващият преглед'].map(намери).filter(Boolean);
    if (стари.length && !наПауза()) {
      const котва = стари[0];
      котва.parentNode.insertBefore(прегледКарта(w), котва);
      стари.forEach(к => к.remove());
    }

    // Б2.3: „Истински ли са?“ застава точно ПРЕДИ брояча на контракции
    const истински = намери('Истински ли са');
    const контракции = намери('Брояч на контракции');
    if (истински && контракции) контракции.parentNode.insertBefore(истински, контракции);

    // Б3: сърцето — след чата (и след поканата, ако я има)
    if (w > 0 && !наПауза()) {
      const сърце = сърцеКарта();
      let котва = null;
      if (сърце) {
        const чат = root.querySelector('.ask-card');
        root.insertBefore(сърце, чат ? чат.nextSibling : root.firstChild);
        котва = сърце;
      }
      // проход 4: раждането се празнува — картата „роди ли се?" точно под сърцето (37+ г.с.)
      const ражда = раждаКарта();
      if (ражда) {
        if (котва) котва.parentNode.insertBefore(ражда, котва.nextSibling);
        else { const чат = root.querySelector('.ask-card'); root.insertBefore(ражда, чат ? чат.nextSibling : root.firstChild); }
      }
      // Б3.4: старата карта-сънища е погълната от сърцето
      const сънища = намери('Още колко');
      if (сънища) сънища.remove();
    }

    // Б4: пътеката заменя сухия списък
    const toc = root.querySelector('.toc-card');
    if (toc && w >= 0 && !наПауза()) {
      const пътека = пътекаКарта(root, w);
      toc.parentNode.insertBefore(пътека, toc);
      // Б4.4, поправено (одит-флот П23, проход 2 №7): .toc-prog се строеше от
      // iface чак на +750ms — тук (синхронно) винаги беше null и лентата умираше
      // с toc-а. Смятаме „Разгледани N от M" САМИ, както прави roomhero.
      try {
        const карти = root.querySelectorAll('.jr-card[data-blkey]').length;
        if (карти > 0) {
          // проход 3 T20: брой само живи ключове (виж roomhero.js)
          const seen = (load('bl_seen_cards', {})['Бременност']) || {};
          const видени = [...root.querySelectorAll('.jr-card[data-blkey]')].filter(c => seen[c.dataset.blkey]).length;
          const н = Math.min(видени, карти);
          пътека.appendChild(el('p', 'jr-privacy rh-prog',
            н >= карти ? '🧭 Разгледала си всичко тук ✨' : `🧭 Разгледани ${н} от ${карти} кътчета`));
        }
      } catch (e) {}
      toc.remove();
    }

    // Б6: добавките — в естествените им кътчета
    if (w > 0 && !наПауза()) {
      const прегледът = намери('Прегледът');
      if (прегледът) прегледът.parentNode.insertBefore(календарчеКарта(w), прегледът.nextSibling);
      const спомен = споменКарта(w);
      if (спомен) {
        const писмо = намери('Писмо до бебето');
        (писмо ? писмо.parentNode : root).insertBefore(спомен, писмо || null);
      }
      const т3 = третиТриместърКарта(w);
      if (т3) root.appendChild(т3);              // Б6.5
    }
    // 🔴 05.08 (одит г11, №21 и №152): коментарът обещаваше „винаги видима", а
    //    редът стоеше ВЪТРЕ в блока `w > 0` — жената, която още не е въвела
    //    първия ден на последната менструация, изобщо не срещаше списъка със
    //    спешните сигнали. Той не смята нищо по седмица и важи за всяка бременна.
    //    (`w > 0 || !роди()` пази само едно: майка, която ВЕЧЕ е родила и е
    //    изчистила датата, да не гледа сигнали за бременност над люлката.)
    if (!наПауза() && (w > 0 || !роди())) root.appendChild(сигналиКарта());  // Б6.2: винаги последна, винаги видима

    // Б5: живата подредба
    if (w > 0 && !наПауза()) подредиПоСедмица(root, w);

    // Б9.2: музиката и гласовото писмо се хващат за ръка
    const музика = намери('Музика за коремчето');
    const гласово = намери('Гласово писмо');
    if (музика && гласово && !музика.querySelector('.pg20-link')) {
      const към = (от, до, текст) => {
        const b = el('button', 'jr-chip pg20-link', текст); b.type = 'button';
        // 🟡 11.08 (обиколка като майка, ИЗМЕРЕНО): едно scrollIntoView спираше
        //    на 1721px, а картата беше на 3719px — жената натискаше „Песните“ и
        //    оставаше насред стаята. Причината е .jr-card { content-visibility:
        //    auto }: картите между двете ПОРАСТВАТ, докато плъзгането тече, и
        //    целта бяга напред. Затова се целим пак, след като слегне.
        b.addEventListener('click', () => {
          до.classList.remove('folded');
          // ИЗМЕРЕНО: с 'smooth' скокът спираше на 1721px, а картата беше на
          // 3719px — жената натискаше „Песните“ и оставаше насред стаята.
          // Причината е .jr-card { content-visibility: auto }: картите между
          // двете растат ДОКАТО плъзгането тече и целта бяга напред. Повтарянето
          // на smooth-скока само люлееше стаята (мерено: 3172 → 1821 → −444 →
          // 5271). Затова се целим наново без анимация, докато не улучим.
          // И спирането „щом улучих" не стига (ИЗМЕРЕНО): улучва 0, а 150 мс
          // по-късно карта ОТГОРЕ се сгъва и целта отскача на −444. Затова се
          // целим наново през целия къс прозорец, без да питаме дали е станало.
          let опити = 0;
          (function прицели() {
            до.scrollIntoView({ block: 'start' });
            if (++опити < 8) setTimeout(прицели, 120);
          })();
        });
        от.appendChild(b);
      };
      към(музика, гласово, '🎤 Или ЗАПИШИ как му я пееш — той ще я познае после');
      към(гласово, музика, '🎵 Песните, с които го чакате');
    }

    // Б8.7: ехо-албумът става полароиди (само клас — CSS върши магията)
    const ехо = намери('Ехо-албумът');
    if (ехо) ехо.classList.add('pg20-polaroid');

    // Б9.4: купеното се отмята само̀ в чантата (по съвпадащо име, ≥5 букви)
    try {
      const купено = load('bl_buy', {});
      const чанта = load('bl_bag_hospital', {});
      const чантаКарта = намери('Чанта за родилния дом');
      // 🔴 05.08 (одит г11, №167): обхождаха се КЛЮЧОВЕТЕ на склада („🔴 Трябва
      //    ПРЕДИ раждането|2"), а в чантата няма такъв ред — условието не можеше
      //    да е истина при никакви данни и връзката между двете карти беше само
      //    обещание в коментара. Сега тръгваме от истинските ИМЕНА (BL_BUY_ITEMS).
      const покупки = window.BL_BUY_ITEMS || [];
      if (чантаКарта && покупки.length && Object.keys(купено).some(k => купено[k])) {
        const редове = [...чантаКарта.querySelectorAll('.jr-win')];
        let промяна = false;
        покупки.forEach(([загл, неща]) => {
          неща.forEach((име, i) => {
            if (!купено[загл + '|' + i]) return;
            const игла = String(име).toLowerCase().slice(0, 12).trim();
            if (игла.length < 5) return;
            редове.forEach((р, j) => {
              if (чанта[j]) return;
              if (р.textContent.toLowerCase().includes(игла)) {
                чанта[j] = true; промяна = true;
                р.classList.add('done');
                const ч = р.querySelector('.jr-check'); if (ч) ч.textContent = '✔';
              }
            });
          });
        });
        if (промяна) save('bl_bag_hospital', чанта);
      }
    } catch (e) {}

    // Б9.5: чекинът храни болежките — има ли отбелязани симптоми тази
    // седмица, картата „Този месец боли това“ се качва при тях
    try {
      const сим = load('bl_pregsym', {});
      if (w > 0 && Array.isArray(сим[w]) && сим[w].length) {
        const боли = намери('Този месец боли това');
        const чекин = намери('Как е тази седмица');
        if (боли && чекин && чекин.nextSibling !== боли) чекин.parentNode.insertBefore(боли, чекин.nextSibling);
      }
    } catch (e) {}
  }

  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Бременност'];
  if (база) window.ROOM_FEATURES['Бременност'] = root => {
    база(root);
    try { надгради(root); } catch (e) {}
  };

  window.BL_PREG20 = { седмица, РАЗМЕРИ, ПРЕГЛЕДИ };
})();
