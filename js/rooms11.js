// ═══════════════════════════════════════════════════════════
// ROOMS 11 — ЪПГРЕЙДИ ЗА СТАИ 8 и 9 (план 19, част 4.8 + 4.9)
//
// 🪞 4.8.2  Огледалото — „днес се харесах“
// 🎭 4.8.7  Тест „коя си ти днес“
// 🃏 4.8.11 Значението на всяка карта
// 📅 4.8.10 Седмичен хороскоп освен дневния
// 🔬 4.9.3  Хронологията — какво се смени преди проблема
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const dayIndex = () => { const n = new Date(); return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000) + n.getFullYear(); };

  // ───────────────────────────────────────────────────────────
  // 📱 11.08 (обиколка по телефон) — същите четири помощника като в women2/
  //    women3/rooms10. Едно приложение, един начин.
  // ───────────────────────────────────────────────────────────
  function фокус(t) {
    try { t.focus(); } catch (e) { return; }
    const виж = () => {
      const vv = window.visualViewport;
      const дъно = vv ? vv.height : window.innerHeight;
      const r = t.getBoundingClientRect();
      if (r.top < 8 || r.bottom > дъно - 8) {
        try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { t.scrollIntoView(); }
      }
    };
    виж(); setTimeout(виж, 320);
  }
  const каз = (котва, txt, полеЗаФокус) => {
    if (!котва || !котва.parentNode) return;
    let p = котва.nextElementSibling;
    if (!p || !p.classList || !p.classList.contains('r11-say')) {
      p = el('p', 'jr-privacy r11-say', '');
      p.style.whiteSpace = 'pre-wrap';
      p.style.overflowWrap = 'anywhere'; p.style.wordBreak = 'break-word'; p.style.minWidth = '0';
      p.setAttribute('aria-live', 'polite');
      котва.parentNode.insertBefore(p, котва.nextSibling);
    }
    p.textContent = txt; p.hidden = false;
    clearTimeout(p._t); p._t = setTimeout(() => { p.hidden = true; }, 3600);
    if (полеЗаФокус) фокус(полеЗаФокус);
  };
  // 👆 ИЗМЕРЕНО с getBoundingClientRect на 375px екран: „🗑“ = 40×44,
  //    полето на хронологията = 141×43, „summary“ на картите = 303×41.
  //    Прагът за пръст е 44×44.
  const пръст = b => { b.style.minWidth = '44px'; b.style.minHeight = '44px'; return b; };
  const реже = n => { n.style.overflowWrap = 'anywhere'; n.style.wordBreak = 'break-word'; n.style.minWidth = '0'; return n; };
  const бгДата = s => { const d = new Date(String(s) + 'T12:00'); return isNaN(d) ? String(s) : d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' }); };

  // ═══════════ 🪞 4.8.2 ОГЛЕДАЛОТО ═══════════
  function mirrorCard() {
    const c = card('Огледалото 🪞 ' + sub('дните, в които се хареса'));
    c.appendChild(el('p', 'jr-privacy',
      'Не за да броиш. За да имаш доказателство — че е имало такива дни, дори когато не се сещаш за тях.'));
    // 🔴 ИЗМЕРЕНО 11.08 (обиколка по картите) — ТРИ дефекта в един бутон:
    //    1) при ПРАЗНА памет редът „Досега: N“ и решетката се закачаха само в
    //       `if (st.length)` при рисуването. Първият тап на живота ѝ рисуваше в
    //       решетка, която НЕ Е В ДОКУМЕНТА: измерено — gridInDOM=false след тапа,
    //       true чак след повторно влизане. Тоест точно доказателството, за което
    //       е картата, липсва на жената, която го вижда за пръв път.
    //    2) вторият тап в същия ден беше `return` — нула на екрана. Мълчалив бутон.
    //    3) броячът не мърдаше след тап (само решетката).
    const b = el('button', 'jr-btn', ''); b.type = 'button';
    const бр = el('p', 'jr-privacy', '');
    const grid = el('div', 'mr-grid');
    const махни = пръст(el('button', 'jr-chip', '↩ не беше днес')); махни.type = 'button'; махни.hidden = true;
    const рисувай = () => {
      const st = load('bl_wm_mirror', []).filter(x => x && x.d);
      const днес = st.some(x => x.d === today());
      b.textContent = днес ? '💛 Днес се хареса ✔' : '🪞 Днес се харесах';
      b.setAttribute('aria-pressed', днес ? 'true' : 'false');
      махни.hidden = !днес;
      grid.innerHTML = '';
      st.slice(-30).forEach(x => {
        const cell = el('span', 'mr-day', '💛');
        cell.title = бгДата(x.d);
        cell.setAttribute('role', 'img');
        cell.setAttribute('aria-label', 'Хареса се на ' + бгДата(x.d));
        grid.appendChild(cell);
      });
      // 🔤 „1 такива дни“ — числото и думата до него не бива да си противоречат
      бр.innerHTML = st.length
        ? (st.length === 1
          ? 'Досега: <strong>1</strong> такъв ден. Ето го:'
          : 'Досега: <strong>' + st.length + '</strong> такива дни. Ето ги:')
        : 'Още няма отбелязан такъв ден. Това не значи, че не е имало — значи само, че не сме го записали.';
      grid.hidden = !st.length;
    };
    b.addEventListener('click', () => {
      // ПРЯСНО, и върху СУРОВИЯ списък — филтърът е само за показване. Иначе
      // записът щеше тихо да изхвърли всеки стар/повреден ред, който минава
      // оттук, а ние не трием нищо на мама.
      const st = load('bl_wm_mirror', []);
      if (st.some(x => x && x.d === today())) {
        каз(b, 'Днешният ден вече е отбелязан 💛 Един път стига — не е състезание.');
        return;
      }
      // 🔴 25.08 (dev/pylna_pamet.js, пълна памет): бутонът ставаше „💛 Днес се
      //    хареса ✔", в мрежата се появяваше ново сърчице и отдолу пишеше
      //    „Записах днешния ден" — а утре нищо от това го нямаше.
      st.push({ d: today() });
      if (!save('bl_wm_mirror', st)) { каз(b, 'Не можах да го запазя — паметта на телефона е пълна. Денят ти не е отбелязан; освободи малко място и натисни пак.'); fx().buzz(6); return; }
      рисувай(); fx().buzz(10);
      каз(b, 'Записах днешния ден 💛');
    });
    махни.addEventListener('click', () => {
      const st = load('bl_wm_mirror', []);
      const j = st.findIndex(x => x && x.d === today());
      if (j < 0) { рисувай(); каз(b, 'Днешният ден и без това не е отбелязан.'); return; }
      st.splice(j, 1);
      if (!save('bl_wm_mirror', st)) { каз(b, 'Не можах да го махна — паметта на телефона е пълна. Денят си остава отбелязан.'); fx().buzz(6); return; }
      рисувай();
      каз(b, 'Махнах днешния ден. Стои си отворен, ако размислиш.');
    });
    c.appendChild(b); c.appendChild(махни); c.appendChild(бр); c.appendChild(grid);
    рисувай();
    return c;
  }

  // ═══════════ 🎭 4.8.7 ТЕСТ „КОЯ СИ ТИ ДНЕС“ ═══════════
  const ТЕСТ = [
    { q: 'Тази сутрин първата ти мисъл беше:', a: [
      ['Още 5 минути', 'уморена', '😴'], ['Какво трябва да свърша', 'капитан', '🧭'],
      ['Дано е добър ден', 'оптимист', '🌤️'], ['Не помня', 'на автопилот', '🤖']] },
    { q: 'Ако имаш свободен час, ще:', a: [
      ['Спя', 'уморена', '😴'], ['Разтребя', 'капитан', '🧭'],
      ['Изляза', 'търсач', '🦋'], ['Гледам телефона', 'на автопилот', '🤖']] },
    { q: 'Как реагираш на промяна в плана:', a: [
      ['Нищо, свикнах', 'уморена', '😴'], ['Пренареждам всичко', 'капитан', '🧭'],
      ['Може и по-добре да стане', 'оптимист', '🌤️'], ['Правя нещо ново', 'търсач', '🦋']] }
  ];
  const ТИПОВЕ = {
    'уморена': ['🛌 Умореният воин', 'Днес не носиш света — днес светът може малко да те носи. Позволи си.'],
    'капитан': ['🧭 Капитанът', 'Ти държиш кораба. Само помни — и капитанът слиза на брега понякога.'],
    'оптимист': ['🌤️ Слънчевата', 'Виждаш пролуките светлина, които други пропускат. Това е дарба, не наивност.'],
    'търсач': ['🦋 Търсачката', 'В теб още има човек, който иска ново. Днес му дай нещо малко.'],
    'на автопилот': ['🤖 На автопилот', 'Днес просто караш. И това е окей — не всеки ден е за преживяване. Утре пак.']
  };
  function whoTodayCard() {
    const c = card('Коя си ти днес 🎭 ' + sub('три въпроса, едно огледало'));
    // 💭 ИЗМЕРЕНО 11.08: отговорите живееха само в паметта на екрана. Мама
    //    отговаря на трите, вижда резултата, отваря друга карта — и при връщане
    //    в стаята намира празен тест. Нищо не се пазеше. Сега днешните отговори
    //    се помнят за ДНЕС (утре тестът е нов) и се връщат както са били.
    //    ПЪТ НАЗАД: изтрий bl_wm_who — тестът пак става еднодневен и без памет.
    const КЛЮЧ = 'bl_wm_who';
    const пазено = load(КЛЮЧ, {});
    const отг = (пазено && пазено.d === today() && пазено.a && typeof пазено.a === 'object') ? Object.assign({}, пазено.a) : {};
    const бутони = [];
    ТЕСТ.forEach((в, i) => {
      const блок = el('div', 'wt-block');
      блок.innerHTML = '<p class="wt-q">' + esc(в.q) + '</p>';
      const g = el('div', 'wt-opts');
      в.a.forEach(([текст, тип, e]) => {
        const b = реже(el('button', 'wt-o', e + ' ' + текст)); b.type = 'button';
        if (отг[i] === тип) b.classList.add('on');
        b.setAttribute('aria-pressed', отг[i] === тип ? 'true' : 'false');
        бутони.push(b);
        b.addEventListener('click', () => {
          g.querySelectorAll('.wt-o').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
          b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
          отг[i] = тип;
          save(КЛЮЧ, { d: today(), a: отг });
          преброй();
        });
        g.appendChild(b);
      });
      блок.appendChild(g); c.appendChild(блок);
    });
    const out = el('div', 'wt-out');
    const хинт = el('p', 'jr-privacy', ''); хинт.setAttribute('aria-live', 'polite');
    const пак = пръст(el('button', 'jr-chip', '↺ Отговори пак')); пак.type = 'button'; пак.hidden = true;
    c.appendChild(out); c.appendChild(хинт); c.appendChild(пак);
    пак.addEventListener('click', () => {
      // 🔴 25.08 (dev/lazhliv_uspeh.js): нулирането чистеше екрана ПРЕДИ да знае
      //    дали е записано. При пълна памет старите отговори оставаха в паметта,
      //    екранът беше празен — и при следващото отваряне се връщаха от нищото.
      //    Сега: първо записът, после екранът. `save` вече казва истината (ред 14).
      if (!save(КЛЮЧ, { d: today(), a: {} })) return;
      Object.keys(отг).forEach(k => delete отг[k]);
      бутони.forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
      out.innerHTML = ''; преброй();
    });
    function преброй() {
      const дадени = Object.keys(отг).length;
      // 🔇 при 1 и 2 отговора картата мълчеше — сега казва колко остават,
      //    за да се вижда, че нещо ще се случи.
      if (дадени < ТЕСТ.length) {
        const о = ТЕСТ.length - дадени;
        хинт.textContent = дадени === 0 ? '' : (о === 1 ? 'Остава още един отговор.' : 'Остават още ' + о + ' отговора.');
        пак.hidden = дадени === 0;
        out.innerHTML = '';
        return;
      }
      хинт.textContent = ''; пак.hidden = false;
      const броене = {};
      Object.values(отг).forEach(t => броене[t] = (броене[t] || 0) + 1);
      const победител = Object.keys(броене).sort((a, b) => броене[b] - броене[a])[0];
      const тип = ТИПОВЕ[победител];
      if (!тип) { out.innerHTML = ''; return; }
      out.innerHTML = `<div class="wt-result"><p class="wt-name">${esc(тип[0])}</p><p class="wt-desc">${esc(тип[1])}</p></div>`;
      if (жив) fx().buzz(10);        // само при неин тап, не при възстановяване
    }
    let жив = false;
    преброй();
    жив = true;
    return c;
  }

  // ═══════════ 🃏 4.8.11 ЗНАЧЕНИЕТО НА КАРТИТЕ ═══════════
  function cardMeaningsCard() {
    // 🟠 11.08 (обиколка): подзаглавието обещаваше „какво «казва» ВСЯКА“ карта, а
    //    отдолу стоят осем общи мотива. Тестето в „Картата на деня 🃏“ (women.js)
    //    е от 60 карти с други имена — 🕯️ Свещта, 🧵 Конецът, 👑 Короната… Мама
    //    тегли „Свещта“, идва тук за значението и не го намира. Коментарът горе
    //    („взимаме картите от women.js, ако са изложени“) описваше код, който го
    //    няма — women.js не изнася тестето никъде. Обещанието се свива до това,
    //    което картата наистина дава: мотивите, не всяка карта поотделно.
    const c = card('Езикът на картите 🃏 ' + sub('мотивите, които се повтарят'));
    c.appendChild(el('p', 'jr-privacy',
      'Картите не предсказват нищо — те са огледало. Тестето е голямо, но зад него стоят няколко повтарящи се мотива. Хванеш ли мотива, четеш и карта, която виждаш за пръв път:'));
    const ОБЩО = [
      ['🌅 Начало / изгрев', 'Нещо ново чука на вратата. Не бързай да го отваряш — но и не се прави, че го няма.'],
      ['🌊 Вълна / вода', 'Чувство те залива. Няма да те удави — вълните минават. Издишай.'],
      ['🔑 Ключ / врата', 'Отговорът, който търсиш, вече е в теб. Просто още не си го признала на глас.'],
      ['🔥 Огън / светкавица', 'Нещо те пали — гняв или страст. И двете носят енергия. Използвай я, не я гълтай.'],
      ['🌙 Луна / нощ', 'Времето за теб често е нощем. Не се бори с това — направи го твое.'],
      ['🪞 Огледало / маска', 'Пред кого се преструваш? Днес поне на едно място бъди истинската.'],
      ['🕊️ Прошка / мир', 'Има какво да пуснеш. Може да е гняв към някого. Може да си самата ти.'],
      ['💎 Диамант / планина', 'Натиск има. Той те оформя, не те чупи — но не всеки натиск е нужен. Виж кой да пуснеш.']
    ];
    ОБЩО.forEach(([т, о]) => {
      const d = el('details', 'cm-row');
      d.innerHTML = `<summary>${esc(т)}</summary><p>${esc(о)}</p>`;
      // 👆 ИЗМЕРЕНО: summary = 303×41 на 375px екран. Прагът за пръст е 44.
      //    Растем с padding, а НЕ с display:flex — flex изяжда триъгълничето
      //    ▸, което е единственият знак, че редът се отваря.
      const s = d.querySelector('summary');
      s.style.minHeight = '44px';
      s.style.paddingTop = '12px'; s.style.paddingBottom = '12px';
      реже(s); реже(d.querySelector('p'));
      c.appendChild(d);
    });
    c.appendChild(el('p', 'wm-sign', 'Играем си. А понякога улучваме. — Ния 🃏'));
    return c;
  }

  // ═══════════ 📅 4.8.10 СЕДМИЧЕН ХОРОСКОП ═══════════
  function weekHoroCard() {
    // 🐛 живееше тук отдавна: четеше bl_mama_bday/bl_wm_bday — ключове, които
    // НИКОЙ във файла не пише; после мина на bl_me (него пълни meCard). Сега
    // рождената дата изобщо не е нужна тук — виж бележката отдолу.
    // 🃏 04.08 (одит g10): обръщението беше по зодия („За теб, Дева:"), а текстът
    //    зависеше САМО от седмицата — един и същ за всички. Показана на приятелка,
    //    картата се хващаше в лъжа и повличаше и дневния хороскоп. Обръщението
    //    отпада; текстовете остават седем и картата вече го казва честно.
    const c = card('Тази седмица — за всички нас 📅 ' + sub('седмичното намигане на звездите'));
    const СЕДМИЧНИ = [
      'Тази седмица искаш всичко наведнъж. Избери три неща. Останалите чакат.',
      'Тази седмица някой ще разчита на теб повече от обикновено. Кажи „не“ поне веднъж.',
      'Тази седмица нещо старо ще ти липсва. Не е слабост — просто си човек с история.',
      'Тази седмица малка промяна ще ти оправи настроението. Дреха, пренаредена стая, нова песен.',
      'Тази седмица ще ти се доплаче от умора. Поплачи. После продължи. И двете са ок.',
      'Тази седмица потърси стар приятел. Ти пиши първа — те мислят, че си заета.',
      'Тази седмица си по-силна, отколкото си мислиш. Ще го докажеш на себе си.'
    ];
    const седмица = Math.floor(dayIndex() / 7);
    // 🟡 тук стоеше `c.innerHTML += …` — това преправя ЦЯЛАТА карта от текст и
    //    подменя вече създаденото заглавие с нов възел. Днес минава, защото
    //    украсата (📍, сгъването) се закача по-късно; утре някой ще я закачи
    //    по-рано и ще изчезне без следа. Добавяме възел, не пренаписваме.
    c.appendChild(реже(el('p', 'wh-text', esc(СЕДМИЧНИ[седмица % СЕДМИЧНИ.length]))));
    c.appendChild(el('p', 'wm-sign', 'Играем си. А понякога улучваме. — Ния 🃏'));
    return c;
  }

  // ═══════════ 🔬 4.9.3 ХРОНОЛОГИЯТА ═══════════
  // „Какво се смени точно преди проблема“ — детективският въпрос.
  function timelineCard() {
    const c = card('Какво се смени 🔬 ' + sub('преди нещо да тръгне накриво'));
    c.appendChild(el('p', 'jr-privacy',
      'Когато бебето изведнъж спи зле, яде зле или е неспокойно — най-полезният въпрос е: <strong>какво се промени в последните дни?</strong> Отбележи, за да видиш връзка.'));
    const inp = реже(el('input', 'jr-word'));
    inp.placeholder = 'напр. „смених прахчето“, „поникна зъб“, „пътувахме“…';
    inp.maxLength = 80;
    inp.setAttribute('aria-label', 'Какво се смени');
    // 👆 ИЗМЕРЕНО: полето беше 141×43 — под прага и тясно за палец
    inp.style.minHeight = '44px'; inp.style.flex = '1 1 auto'; inp.style.minWidth = '0';
    const add = пръст(el('button', 'jr-chip', '+ Отбележи промяна')); add.type = 'button';
    const list = el('div', 'jr-wins');
    let последноМахнато = null;                 // ↩ пътят назад
    const върни = пръст(el('button', 'jr-chip', '↩ Върни изтритото')); върни.type = 'button'; върни.hidden = true;
    const рисувай = () => {
      // 🔴 известният клас: `st` се четеше при рисуването и после се записваше
      //    отгоре. Списъкът се показва и в „Историята ви“ (river.js) и се брои в
      //    профила — карта, стояла отворена от снощи, връщаше вчерашното копие.
      const st = load('bl_lab_timeline', []).filter(x => x && x.t);
      list.innerHTML = '';
      if (!st.length) {
        list.appendChild(el('p', 'jr-privacy', 'Още нищо записано. Това не значи, че нищо не се е сменило — значи само, че още не сме го отбелязали.'));
        return;
      }
      st.slice().reverse().slice(0, 20).forEach(x => {
        const row = el('div', 'tl-row');
        row.innerHTML = `<span class="tl-date">${esc(бгДата(x.d))}</span><span class="tl-txt">${esc(x.t)}</span><button class="nt-del" type="button" aria-label="Махни „${esc(x.t)}“ от ${esc(бгДата(x.d))}">🗑</button>`;
        реже(row.querySelector('.tl-txt'));
        const del = row.querySelector('.nt-del');
        // 👆 ИЗМЕРЕНО: 40×44 — тесен, а стои ДО текста, който мама чете.
        //    Един кос тап и записаното изчезва без път назад.
        пръст(del); del.style.flex = '0 0 auto';
        del.addEventListener('click', () => {
          // върху СУРОВИЯ списък — филтърът горе е само за показване
          const сега = load('bl_lab_timeline', []);
          const j = сега.findIndex(y => y && y.t === x.t && y.d === x.d);
          if (j < 0) { рисувай(); return; }
          последноМахнато = { запис: сега[j], къде: j };
          сега.splice(j, 1); save('bl_lab_timeline', сега);
          рисувай(); върни.hidden = false;
          каз(върни, 'Махнах „' + x.t + '“. Мога да го върна.');
          fx().buzz(6);
        });
        list.appendChild(row);
      });
      if (st.length > 20) list.appendChild(el('p', 'jr-privacy', 'Показвам последните 20 от ' + st.length + '.'));
    };
    върни.addEventListener('click', () => {
      if (!последноМахнато) { каз(върни, 'Няма какво да върна.'); return; }
      const st = load('bl_lab_timeline', []);
      st.splice(Math.min(последноМахнато.къде, st.length), 0, последноМахнато.запис);
      save('bl_lab_timeline', st);
      последноМахнато = null; върни.hidden = true; рисувай();
      fx().buzz(8);
    });
    const put = () => {
      const v = inp.value.trim();
      // празното поле мига и взима курсора (polish.js) — казваме и защо
      if (!v) { каз(add, '🔬 Напиши какво се смени — дата слагам аз.', inp); return; }
      const st = load('bl_lab_timeline', []);   // ПРЯСНО
      st.push({ d: today(), t: v.slice(0, 80) });
      // 🔴🔴 25.08 (dev/pylna_pamet.js, живо натискане при пълна памет):
      //    записът хвърляше отговора си, полето се чистеше и отдолу пишеше
      //    „Отбелязах го за днес ✔". Написаното от мама изчезваше ДВА пъти —
      //    от паметта и от екрана. ЖЕЛЯЗНО: полето се чисти САМО след
      //    потвърден запис. `save` вече вика BL_ZAPIS_PADNA (rooms11.js:14).
      if (!save('bl_lab_timeline', st)) { каз(add, 'Не можах да го запазя — написаното ти стои в полето. Освободи малко място и натисни пак.', inp); return; }
      inp.value = ''; рисувай(); fx().buzz(8);
      каз(add, 'Отбелязах го за днес ✔');
    };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    inp.addEventListener('focus', () => фокус(inp));   // 📱 клавиатурата да не го скрие
    const row = el('div', 'jr-addrow'); row.appendChild(inp); row.appendChild(add);
    c.appendChild(row); c.appendChild(върни); c.appendChild(list); рисувай();
    c.appendChild(el('p', 'jr-privacy', 'Ако проблемът дойде 2-3 дни след промяна — ето ти заподозрян. Не доказателство, но добра следа.'));
    return c;
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Жената в мен': root => {
      root.appendChild(mirrorCard());
      root.appendChild(whoTodayCard());
      root.appendChild(cardMeaningsCard());
      root.appendChild(weekHoroCard());
    },
    'Лабораторията': root => { root.appendChild(timelineCard()); }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
