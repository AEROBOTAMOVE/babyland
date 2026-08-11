// ═══════════════════════════════════════════════════════════
// HOME — МЕГА НАЧАЛОТО ✨ (иновацията на началната страница)
// 🌅 живо небе по часа • 🔢 жива статистика • 🎈 витрина на
// помощничките • 🪁 балон-талисман • 📚 значки на стаите
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ═══════════ 🌅 ЖИВОТО НЕБЕ — hero-то диша с деня И слуша копчето ═══════════
  // Правилото: 🌙 тъмна тема → нощно небе. ☀️ светла тема → небето по часа
  // (а в малките часове — мек здрач, за да е светло, както мама е поискала).
  function skyMode() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (dark) return 'night';
    const h = new Date().getHours();
    if (h >= 5 && h < 9) return 'dawn';
    if (h >= 9 && h < 17) return 'day';
    return 'dusk'; // вечер и нощ при светла тема — лавандулов здрач
  }

  function mountSky() {
    const hero = document.querySelector('header.hero');
    if (!hero) return;
    const old = hero.querySelector('.sky-layer');
    if (old) old.remove();
    const mode = skyMode();
    hero.classList.remove('sky-dawn', 'sky-day', 'sky-dusk', 'sky-night');
    hero.classList.add('sky-' + mode);
    const sky = el('div', 'sky-layer sky-' + mode);
    let inner = '';
    if (mode === 'night') {
      for (let i = 0; i < 26; i++) {
        inner += `<span class="sk-star" style="left:${(i * 137 + 31) % 100}%;top:${(i * 53 + 7) % 72}%;animation-delay:${(i % 9) * 0.45}s;transform:scale(${0.5 + (i % 4) * 0.25})">✦</span>`;
      }
      inner += `<span class="sk-moon">🌙</span>`;
      for (let i = 0; i < 4; i++) inner += `<span class="sk-fly" style="left:${15 + i * 22}%;animation-delay:${i * 1.7}s">✨</span>`;
    } else {
      inner += `<span class="sk-sun ${mode}">☀️</span>`;
      for (let i = 0; i < 4; i++) {
        inner += `<span class="sk-cloud" style="top:${8 + i * 16}%;animation-duration:${34 + i * 12}s;animation-delay:-${i * 11}s;transform:scale(${0.7 + (i % 3) * 0.3})">☁️</span>`;
      }
      if (mode === 'dawn') for (let i = 0; i < 3; i++) inner += `<span class="sk-bird" style="top:${14 + i * 9}%;animation-delay:${i * 2.4}s">🕊️</span>`;
      if (mode === 'dusk') for (let i = 0; i < 3; i++) inner += `<span class="sk-fly" style="left:${20 + i * 26}%;animation-delay:${i * 1.3}s">✨</span>`;
    }
    sky.innerHTML = inner;
    hero.insertBefore(sky, hero.firstChild);
  }

  // ═══════════ 🕐 ЕДНО ДЕНОНОЩИЕ С ТЕБ — часовникът на майчиния ден ═══════════
  // Не „предимства“, а истината: ето те теб в 3 през нощта — и ето ни нас.
  const DAY = [
    { h: 3,  e: '🌙', t: 'Три през нощта', s: 'Хранене на тъмно. Пускаш <strong>Нощната лампа</strong> — топла червена светлина, която не буди никого. Таймерът брои сам.', room: 'Инструменти' },
    { h: 7,  e: '☀️', t: 'Сутрин', s: 'Преди кафето: <strong>„Как си днес?“</strong> — 30 секунди само за теб. Не за бебето. За ТЕБ.', room: 'Дневник на мама' },
    { h: 10, e: '🎲', t: 'Предобед', s: '„Какво да правим?“ — <strong>играта за днес</strong>, избрана по възрастта и по това колко време имаш.', room: 'Развитие и игри' },
    // 🟡 11.08 (обиколка „начален екран и чат“): текстовете тук са СТАТИЧНИ и
    //    говорят в мъжки род („Той се засмя“, „неговото име“, „любимите му“),
    //    докато онбордингът пита за пола и останалото приложение го спазва
    //    (rooms2.js: „дошла“/„дошъл“). Майка, която е написала „👧 Момиче“,
    //    четеше за чуждо бебе на собствения си начален екран. Родът се маха —
    //    изречението не губи нищо.
    { h: 13, e: '🥄', t: 'Обяд', s: 'Главата е празна, бебето — гладно. <strong>„Какво за обяд?“</strong> вади идея от любимите храни.', room: 'Захранване' },
    { h: 16, e: '🌡️', t: 'Тревога', s: '38.5°. Дишаш. <strong>Вита</strong> ти казва спокойно кое е нормално и кога е за лекар — без гадаене в 40 форума.', room: 'Здраве и SOS' },
    { h: 19, e: '📸', t: 'Вечер', s: 'Засмя се както никога. <strong>Снимката на деня</strong> влиза в Реката — историята ви се пише сама.', room: 'Дневник на мама' },
    { h: 21, e: '📖', t: 'Лека нощ', s: '<strong>Приказка с името на бебето ти</strong> — измисля се сега и никога не е една и съща.', room: 'Развитие и игри' },
    // 8.4.4: вечерта, когато бебето заспа — часът на ЖЕНАТА, не на мама
    { h: 22, e: '💃', t: 'Твоят час', s: 'Бебето спи. <strong>Картата на деня</strong>, хороскопчето, петте минути само за теб — жената в теб е още будна.', room: 'Жената в мен' },
    { h: 23, e: '🌌', t: 'Тишина', s: 'Всички спят. Гледаш <strong>съзвездието си</strong> — всяка твоя минутка е звезда. Месецът ти е небе.', room: 'Дневник на мама' }
  ];

  function mountDayCircle() {
    const rooms = document.getElementById('стаите');
    if (!rooms || document.querySelector('.day24')) return;
    const sec = el('section', 'day24 reveal');
    const R = 96, CX = 110, CY = 110;
    const pol = (h, r) => { const a = (h / 24 * 360 - 90) * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
    // 🌌 П5 Н1: небето на сцената — по часа ѝ: зори / ден / здрач / нощ
    const сцНебе = h => (h >= 5 && h < 9) ? 'dawn' : (h >= 9 && h < 17) ? 'day' : (h >= 17 && h < 21) ? 'dusk' : 'night';
    let орбГрад = 0, орбПърви = true;

    let dots = '';
    DAY.forEach((d, i) => {
      const [x, y] = pol(d.h, R);
      dots += `<g class="d24-dot" data-i="${i}" style="--dl:${i * 0.12}s">
        <circle cx="${x}" cy="${y}" r="16" class="d24-hit"/>
        <circle cx="${x}" cy="${y}" r="13" class="d24-bg"/>
        <text x="${x}" y="${y + 5}" text-anchor="middle" class="d24-e">${d.e}</text></g>`;
    });
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;
    let стрелкаГрад = nowH / 24 * 360;   // П5 Н4: кумулативен — само напред, и през полунощ

    sec.innerHTML = `
      <h2 class="section-title">Едно денонощие с теб <span class="wobble">🕐</span></h2>
      <p class="section-sub">Не сме списък с функции. Ето къде сме в твоя ден — от 3 през нощта до тишината.</p>
      <div class="d24-wrap">
        <svg viewBox="0 0 220 220" class="d24-svg" role="img" aria-label="Денонощен кръг">
          <defs><linearGradient id="d24g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f7a8cb"/><stop offset="1" stop-color="#b9a7e0"/></linearGradient></defs>
          <g class="d24-skyw">
            <circle cx="${CX}" cy="${CY}" r="${R - 22}" class="d24-skyc sky-dawn"/>
            <circle cx="${CX}" cy="${CY}" r="${R - 22}" class="d24-skyc sky-day"/>
            <circle cx="${CX}" cy="${CY}" r="${R - 22}" class="d24-skyc sky-dusk"/>
            <circle cx="${CX}" cy="${CY}" r="${R - 22}" class="d24-skyc sky-night"/>
            <g class="d24-stars">${[0, 1, 2, 3, 4, 5].map(k => `<circle cx="${(CX + Math.cos(k * 2.4 + 1) * (28 + k * 7)).toFixed(1)}" cy="${(CY + Math.sin(k * 2.6) * (24 + k * 5)).toFixed(1)}" r="1.3" class="d24-star" style="--sd:${k * 0.4}s"/>`).join('')}</g>
            <g class="d24-orbit">
              <text x="${CX}" y="${CY - 56}" text-anchor="middle" class="d24-orb d24-orb-sun">☀️</text>
              <text x="${CX}" y="${CY + 66}" text-anchor="middle" class="d24-orb d24-orb-moon">🌙</text>
            </g>
          </g>
          <circle cx="${CX}" cy="${CY}" r="${R}" class="d24-ring"/>
          <circle cx="${CX}" cy="${CY}" r="${R}" class="d24-arc"/>
          ${Array.from({ length: 24 }, (_, ч) => { const [tx1, ty1] = pol(ч, R - 7), [tx2, ty2] = pol(ч, R - 3); return `<line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" class="d24-tick" style="--td:${ч * 0.04}s"/>`; }).join('')}
          <g class="d24-nowg" style="--nrot:${стрелкаГрад.toFixed(2)}deg">
            <line x1="${CX}" y1="${CY - (R - 34)}" x2="${CX}" y2="${CY - (R - 15)}" class="d24-hand"/>
            <circle cx="${CX}" cy="${CY - (R - 34)}" r="3" class="d24-handdot"/>
          </g>
          <text x="${CX}" y="${CY - 48}" text-anchor="middle" class="d24-lbl">🌙 нощта</text>
          <text x="${CX + 60}" y="${CY + 4}" text-anchor="middle" class="d24-lbl">🌅 зори</text>
          <text x="${CX}" y="${CY + 76}" text-anchor="middle" class="d24-lbl">☀️ обед</text>
          <text x="${CX - 60}" y="${CY + 4}" text-anchor="middle" class="d24-lbl">🌇 вечер</text>
          <text x="${CX}" y="${CY - 4}" text-anchor="middle" class="d24-mid">24/7</text>
          <text x="${CX}" y="${CY + 20}" text-anchor="middle" class="d24-mid2">тук сме</text>
          ${dots}
        </svg>
        <div class="d24-card">
          <span class="d24-now">СЕГА при теб е <strong>${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}</strong></span>
          <div class="d24-body"></div>
        </div>
      </div>`;
    rooms.parentNode.insertBefore(sec, rooms);
    const свод = sec.querySelector('.d24-svg');
    const орбита = sec.querySelector('.d24-orbit');

    // проход 4: часовникът „СЕГА" беше замразен от монтирането за цялата сесия.
    // Обновяваме текста И стрелката веднъж в минута (self-correcting от реалното
    // време) + веднага при връщане от заключен екран; чистим при изчезване.
    const nowLbl = sec.querySelector('.d24-now strong');
    const nowg = sec.querySelector('.d24-nowg');
    function tickClock() {
      if (!sec.isConnected) { clearInterval(clockTimer); document.removeEventListener('visibilitychange', onVis); return; }
      const now = new Date();
      if (nowLbl) nowLbl.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const h = now.getHours() + now.getMinutes() / 60;
      const цел = h / 24 * 360;
      const тек = ((стрелкаГрад % 360) + 360) % 360;
      стрелкаГрад += ((цел - тек) + 360) % 360;          // винаги напред
      if (nowg) nowg.style.setProperty('--nrot', стрелкаГрад.toFixed(2) + 'deg');
    }
    const clockTimer = setInterval(tickClock, 60000);
    const onVis = () => { if (!document.hidden) tickClock(); };
    document.addEventListener('visibilitychange', onVis);

    const body = sec.querySelector('.d24-body');
    const dotsEls = [...sec.querySelectorAll('.d24-dot')];
    let cur = -1, timer = null;
    function рисувай(i) {
      const d = DAY[i];
      body.innerHTML = `<span class="d24-e2">${d.e}</span>
        <strong class="d24-t">${d.t} · ${String(d.h).padStart(2, '0')}:00</strong>
        <p class="d24-s">${d.s}</p>
        <button class="d24-go" type="button">Влез в „${d.room}“ →</button>`;
      body.classList.remove('d24-out', 'd24-in'); void body.offsetWidth; body.classList.add('d24-in');
      body.querySelector('.d24-go').addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open(d.room); });
    }
    function show(i, byUser) {
      cur = i;
      const d = DAY[i];
      dotsEls.forEach((g, j) => g.classList.toggle('on', j === i));
      // 🌌 П5 Н1: колелото се върти — светилата отиват на часа на сцената, небето
      // се преоблича. Ъгълът е кумулативен — денят тече САМО напред (23ч→3ч = +60°).
      if (орбита) {
        const цел = d.h / 24 * 360;
        if (орбПърви) { орбГрад = цел; орбПърви = false; }
        else { const тек = ((орбГрад % 360) + 360) % 360; орбГрад += ((цел - тек) + 360) % 360; }
        орбита.style.setProperty('--rot', орбГрад + 'deg');
      }
      if (свод) {
        свод.classList.remove('dsky-dawn', 'dsky-day', 'dsky-dusk', 'dsky-night');
        свод.classList.add('dsky-' + сцНебе(d.h));
      }
      // 🎬 П5 Н3: кино-смяна — старата сцена излиза, новата влиза на тактове
      clearTimeout(body._смяна);
      if (reduce || !body.innerHTML.trim()) рисувай(i);   // първи път / без анимации — направо
      else {
        body.classList.add('d24-out');
        body._смяна = setTimeout(() => рисувай(i), 190);
      }
      if (byUser) { clearInterval(timer); if (window.BL_FX) BL_FX.buzz(6); }
    }
    dotsEls.forEach((g, i) => g.addEventListener('click', () => show(i, true)));
    // започваме от ЧАСА НА МАМА — тя се вижда веднага
    const h = new Date().getHours();
    let start = 0, best = 99;
    DAY.forEach((d, i) => { const diff = Math.min(Math.abs(d.h - h), 24 - Math.abs(d.h - h)); if (diff < best) { best = diff; start = i; } });
    show(start);
    if (!reduce) timer = setInterval(() => show((cur + 1) % DAY.length), 5200);

    const io = new IntersectionObserver(en => { en.forEach(e => { if (e.isIntersecting) { sec.classList.add('shown'); io.disconnect(); } }); }, { threshold: 0.15 });
    io.observe(sec);
  }

  // ═══════════ 🎈 ВИТРИНАТА — запознай се с помощничките ═══════════
  const MEET = [
    ['Мила', '🌸', 'Бременност', 'От първото ритане до чантата за болницата.'],
    ['Мира', '📏', 'Моето бебе', 'Мери-мери: растеж, сън и хранене.'],
    ['Малина', '🍓', 'Захранване', 'Готвачката: първи лъжички и смели хапки.'],
    ['Вита', '💚', 'Здраве и SOS', 'Свалям паниката. Казвам кога е за лекар.'],
    ['Луна', '🌙', 'Дневник на мама', 'Тук съм за ТЕБ, не за бебето.'],
    ['Искра', '✨', 'Развитие и игри', 'Знам кога какво се учи — и как с игра.'],
    ['Дара', '🎀', 'Инструменти', 'Размери, списъци и практични чудесии.'],
    ['Ния', '💃', 'Жената в мен', 'Тук не говорим за бебето. Тук говорим за ТЕБ. Кога за последно те попитаха как си?'],
    ['Ема', '🔬', 'Лабораторията', 'Всички казват „всяко бебе е различно“ и си тръгват. Хайде да проверим при твоето.'],
  ];
  // ═══════════ 🎡 ХОРОТО — помощничките се въртят като живо хоро (П5 H1) ═══════════
  const ЦВЯТ = {
    'Мила': '#f7a8cb', 'Мира': '#9fc8ef', 'Малина': '#f6b56b', 'Вита': '#8fd0ba',
    'Луна': '#c3b1ea', 'Искра': '#f5d47e', 'Дара': '#9fd8c6', 'Ния': '#d1487f', 'Ема': '#e8b06b'
  };
  function mountMeet() {
    const anchor = document.getElementById('дневник');
    if (!anchor || document.querySelector('.meet')) return;
    const sec = el('section', 'meet');
    sec.id = 'помощничките';
    sec.innerHTML = `<h2 class="section-title reveal">Запознай се с помощничките <span class="wobble">🎈</span></h2>
      <p class="section-sub reveal">Кръг от приятелки — по една във всяка стая. Хорото се върти полека; докосни някоя.</p>
      <div class="horo reveal">
        <div class="horo-ring"></div>
        <div class="horo-center">
          <span class="horo-ce">🎈</span>
          <p class="horo-say" aria-live="polite">Тук сме — за теб и за бебето.</p>
        </div>
      </div>`;
    const horo = sec.querySelector('.horo');
    const ring = sec.querySelector('.horo-ring');
    const say = sec.querySelector('.horo-say');
    const ce = sec.querySelector('.horo-ce');
    let път;
    MEET.forEach(([name, badge, room, line], i) => {
      const b = el('button', 'horo-b');
      b.type = 'button';
      b.style.setProperty('--i', i);
      b.style.setProperty('--c', ЦВЯТ[name] || '#f7a8cb');
      b.setAttribute('aria-label', name + ' — стая „' + room + '“');
      b.innerHTML = `<span class="horo-anti">
          <span class="horo-ball"><span class="horo-aura"></span>
            <svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg>
            <span class="horo-badge">${badge}</span></span>
          <span class="horo-name">${name}</span></span>`;
      b.addEventListener('click', () => {
        horo.classList.add('спряно');                     // хорото спира и я слуша
        ring.querySelectorAll('.horo-b').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        ce.textContent = badge;
        say.textContent = '„' + line + '“ — ' + name;
        say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
        if (window.BL_FX) BL_FX.buzz(8);
        clearTimeout(път);
        път = setTimeout(() => {
          долитаПриТеб(b, name, badge, room, line);
          // когато мама се върне от стаята, хорото вече пак се върти
          setTimeout(() => { horo.classList.remove('спряно'); b.classList.remove('on'); ce.textContent = '🎈'; }, 1800);
        }, 500);
      });
      ring.appendChild(b);
    });
    anchor.parentNode.insertBefore(sec, anchor);
    // и те влизат в потока на скрола
    sec.querySelectorAll('.reveal').forEach(elm => {
      const io = new IntersectionObserver(en => { en.forEach(x => { if (x.isIntersecting) { elm.classList.add('shown'); io.disconnect(); } }); }, { threshold: 0.2 });
      io.observe(elm);
    });
  }

  // ═══════════ 💬 МУРКАНЕТО — кръгът те поздравява и си шушука (П5 H3) ═══════════
  const МУРКИ = {
    'Мила': 'Ритна ли днес? 🌸', 'Мира': 'Мери-мери! 📏', 'Малина': 'Мммм, лъжичка? 🍓',
    'Вита': 'Дишай, тук съм. 💚', 'Луна': 'А ТИ как си? 🌙', 'Искра': 'Игра? Игра! ✨',
    'Дара': 'Списъче? 🎀', 'Ния': 'Здравей, жено! 💃', 'Ема': 'Да проверим? 🔬'
  };
  function монтирайМуркане() {
    const sec = document.querySelector('.meet');
    if (!sec || reduce) return;                            // тишина при reduced-motion
    const бутони = [...sec.querySelectorAll('.meet-b, .horo-b')];
    if (!бутони.length) return;
    let видимо = false;
    const io = new IntersectionObserver(en => {
      видимо = en.some(x => x.isIntersecting);
      if (видимо && !sec.classList.contains('поздрав')) {  // първата среща: помахване
        бутони.forEach((b, i) => b.style.setProperty('--пд', (i * 0.14) + 's'));
        sec.classList.add('поздрав');
      }
    }, { threshold: 0.3 });
    io.observe(sec);
    // шушукане: на ~7 сек някоя се обажда — една по една, никога хор
    let ред = Math.floor(Math.random() * бутони.length);
    setInterval(() => {
      const стая = document.getElementById('roomOverlay');
      if (!видимо || document.hidden || (стая && !стая.hidden)) return;
      if (sec.querySelector('.мур')) return;
      ред = (ред + 1 + Math.floor(Math.random() * 3)) % бутони.length;
      const b = бутони[ред];
      const име = (b.querySelector('.meet-name, .horo-name') || {}).textContent || '';
      const мех = el('span', 'мур', МУРКИ[име] || 'Тук съм! 🎈');
      (b.querySelector('.meet-balloon, .horo-ball') || b).appendChild(мех);
      b.classList.add('мърка');
      setTimeout(() => { мех.remove(); b.classList.remove('мърка'); }, 2600);
    }, 7000);
  }

  // ═══════════ 🕊️ ДОЛИТАНЕТО — избраната идва при теб (П5 H4) ═══════════
  // Съдийски фикс: церемонията е САМО първата среща с тази помощничка —
  // после пътят е бърз (иначе всяко влизане бави с 2.6 сек).
  function долитаПриТеб(бутон, име, значка, стая, реплика) {
    const срещнати = load('bl_horo_met', {});
    if (reduce || !window.MamaHelper || document.querySelector('.долита') || срещнати[име]) {
      if (window.MamaHelper) MamaHelper.open(стая);        // бърз път
      return;
    }
    срещнати[име] = 1; save('bl_horo_met', срещнати);
    const извор = (бутон.querySelector('.meet-balloon, .horo-ball') || бутон).getBoundingClientRect();
    const ov = el('div', 'долита');
    ov.innerHTML = `<span class="дол-балон" style="left:${извор.left}px;top:${извор.top}px;width:${извор.width}px">
        <svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg><span class="дол-значка">${значка}</span></span>
      <div class="дол-мехур"><span class="дол-мисли"><i></i><i></i><i></i></span></div>`;
    document.body.appendChild(ov);
    const бал = ov.querySelector('.дол-балон');
    const мехур = ov.querySelector('.дол-мехур');
    const целX = innerWidth / 2 - (извор.left + извор.width / 2);
    const целY = innerHeight * 0.36 - (извор.top + извор.height / 2);
    requestAnimationFrame(() => {                          // полет: само transform
      бал.style.transform = `translate(${целX}px, ${целY}px) scale(2.1)`;
      ov.classList.add('тъмно');
    });
    setTimeout(() => {                                     // „пише…" → репликата
      мехур.innerHTML = `„${esc(реплика)}“<b>— ${esc(име)}</b>`;
    }, 750);
    const влез = () => { clearTimeout(т); ov.remove(); MamaHelper.open(стая); };
    ov.addEventListener('click', влез);                    // тап навсякъде = влизаме веднага
    const т = setTimeout(влез, 2100);
  }

  // ═══════════ 👀 ЖИВИТЕ ЛИЧИЦА — очи, които мигат и те следват (П5 H2) ═══════════
  function съживиЛичицата() {
    const балони = [...document.querySelectorAll('.meet-balloon, .horo-ball')];
    if (!балони.length) return;
    балони.forEach(b => {
      if (b.querySelector('.лице')) return;
      const f = el('span', 'лице', `<span class="око"><span class="зеница"></span></span>
        <span class="око"><span class="зеница"></span></span><span class="усмивка"></span>`);
      f.style.setProperty('--мигд', (Math.random() * 4).toFixed(1) + 's'); // мига в свой миг
      b.appendChild(f);
      const btn = b.closest('button');
      if (btn) btn.addEventListener('click', () => {
        f.classList.remove('щастие'); void f.offsetWidth; f.classList.add('щастие');
        // съдийски фикс: щастието си отива само — иначе очите остават затворени завинаги
        clearTimeout(f._щ); f._щ = setTimeout(() => f.classList.remove('щастие'), 700);
      });
    });
  }

  // очите следват пръста — модулен слушател (не зависи от реда на монтиране),
  // кеширани центрове: най-много 1 мерене на половин секунда, писане само на
  // CSS-променливи → композитен transform, нула layout на кадър
  if (!reduce) {
    let центрове = [], зает = false, мерено = 0;
    document.addEventListener('pointermove', e => {
      if (зает) return; зает = true;
      const x = e.clientX, y = e.clientY;
      requestAnimationFrame(() => {
        зает = false;
        const сега = performance.now();
        if (сега - мерено > 500) {
          центрове = [...document.querySelectorAll('.meet-balloon, .horo-ball')]
            .map(b => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, b]; });
          мерено = сега;
        }
        центрове.forEach(([cx, cy, b]) => {
          const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
          const близо = Math.max(0, 1 - d / 260);            // отдалеч само гледа; отблизо се и навежда
          b.style.setProperty('--ex', (dx / d * 2.6).toFixed(2) + 'px');
          b.style.setProperty('--ey', (dy / d * 2.2).toFixed(2) + 'px');
          b.style.setProperty('--наклон', (dx / d * близо * 7).toFixed(2) + 'deg');
        });
      });
    }, { passive: true });
  }

  // ═══════════ 🪁 БАЛОНЪТ-ТАЛИСМАН — носи се и поздравява ═══════════
  const HELLO = [
    'Радвам се, че си тук! 💜', 'Днес се справяш чудесно.', 'Гушни бебето от мен! 🎈',
    'Не забравяй: и ти си важна.', 'Малките мигове са големите.', 'Пиеш ли вода? 💧'
  ];
  function mountMascot() {
    if (document.getElementById('blMascot') || reduce) return;
    const m = el('button', 'mascot'); m.id = 'blMascot'; m.type = 'button';
    m.setAttribute('aria-label', 'Балончето на Бейби Ленд');
    m.innerHTML = `<svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg>`;
    m.addEventListener('click', () => {
      if (window.BL_FX) { BL_FX.confetti(m, 18); BL_FX.cheer(HELLO[Math.floor(Math.random() * HELLO.length)]); }
      m.classList.remove('boop'); void m.offsetWidth; m.classList.add('boop');
    });
    document.body.appendChild(m);
    // крие се, когато има отворена стая (за да не пречи)
    const watch = setInterval(() => {
      const ov = document.getElementById('roomOverlay');
      m.classList.toggle('hide', !!(ov && !ov.hidden));
    }, 800);
  }

  // (значките с бройки паднаха — стаите се представят с това, което ПРАВЯТ)

  // ═══════════ 🔤 ЖИВОТО ЗАГЛАВИЕ — думите се сменят ═══════════
  const FLIP_WORDS = ['бременността', 'растежа', 'захранването', 'съня', 'здравето', 'твоето спокойствие'];
  function mountFlip() {
    const tagline = document.querySelector('.hero .tagline');
    if (!tagline || document.querySelector('.hero-flip')) return;
    const line = el('p', 'hero-flip', 'Всичко за <span class="flip-word">бременността</span><br>— в джоба ти.');
    tagline.parentNode.insertBefore(line, tagline);
    const w = line.querySelector('.flip-word');

    // 10.2 CLS: „съня“ е 4 букви, „твоето спокойствие“ — 18. Дългата чупеше
    // реда и редът порастваше 55→82px — целият екран подскачаше на всеки
    // 2.6 секунди, завинаги. Измерено: това беше 0.2 от CLS-а.
    // Затова мястото се мери по НАЙ-ДЪЛГАТА дума и се резервира веднъж.
    function резервирайМясто() {
      const истинска = w.textContent;
      let максимум = 0;
      FLIP_WORDS.forEach(дума => {
        w.textContent = дума;
        максимум = Math.max(максимум, line.offsetHeight);
      });
      w.textContent = истинска;
      line.style.minHeight = максимум + 'px';
    }
    line.style.minHeight = '';
    резервирайМясто();
    let преоразмер;
    window.addEventListener('resize', () => {
      clearTimeout(преоразмер);
      преоразмер = setTimeout(() => { line.style.minHeight = ''; резервирайМясто(); }, 220);
    });

    if (reduce) return;
    let i = 0;
    setInterval(() => {
      // 22.07: думата се сменяше на всеки 2.6 сек и когато телефонът е в
      // джоба или стаята е отворена отгоре — работа за нищо, точно от рода,
      // който изяжда батерията на слаб Android. Тик само когато се вижда.
      const стая = document.getElementById('roomOverlay');
      if (document.hidden || (стая && !стая.hidden) || !w.offsetParent) return;
      i = (i + 1) % FLIP_WORDS.length;
      w.classList.add('out');
      setTimeout(() => { w.textContent = FLIP_WORDS[i]; w.classList.remove('out'); w.classList.add('in'); setTimeout(() => w.classList.remove('in'), 450); }, 260);
    }, 2600);
  }

  // ═══════════ 🎈 СКРОЛ-БАЛОНЧЕТО — лети по прогреса на страницата ═══════════
  function mountScrollBalloon() {
    if (document.querySelector('.scrollfly') || reduce) return;
    const bar = el('div', 'scrollfly', '<div class="scrollfly-trail"></div><span class="scrollfly-b">🎈</span>');
    document.body.appendChild(bar);
    const trail = bar.querySelector('.scrollfly-trail');
    const b = bar.querySelector('.scrollfly-b');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? Math.min(1, scrollY / max) : 0;
        trail.style.width = (p * 100) + '%';
        b.style.left = 'calc(' + (p * 100) + '% - 10px)';
        ticking = false;
      });
    }, { passive: true });
  }

  // ═══════════ 🕸️ МРЕЖАТА — какво може Помощникът на мама ═══════════
  // Жива съзвездие-мрежа: центърът е Помощникът, 7 възела са стаите,
  // а от тях изникват ВСИЧКИ функции, които сме изградили.
  const NET = [
    { room: 'Бременност', e: '🤰', c: '#f7a8cb', f: ['Калкулатор на термина', 'Седмица по седмица', 'Брояч на ритания', 'Брояч на контракции (5-1-1)', 'Прогрес на бременността', 'Дневник на наддаването', 'Симптоми по седмици', 'Коремчето по седмици 📸', 'Писмо до бебето 💌', 'Изборът на име (гласуване)', 'Музика за коремчето', 'План за раждане 🖨️', 'Чанта за родилния дом', 'Въпроси за лекаря', 'Следващият преглед', 'Вода днес'] },
    { room: 'Моето бебе', e: '🍼', c: '#9fc8ef', f: ['Калкулатор на растежа (СЗО)', 'Ръст и обиколка на главата', 'Кърмене-таймер + нощен режим', 'Кога яде за последно', 'Изпито днес (мл)', 'Пелени днес', 'Сънят днес', 'Денят на един кръг 🕛', 'Седмицата в картинка', 'Звуци за сън', 'Първите зъбки', 'Лексиконът на бебето 🌟', 'Фото-лента по месеци', 'Рекордите 🏆', 'Звукови мигове 🎙️', 'Бележник за бебето'] },
    { room: 'Захранване', e: '🥄', c: '#f6b56b', f: ['Календар на храните по възраст', 'Готови ли сме? (знаците за готовност)', 'Дъгата на седмицата 🌈', 'Меню за седмицата', 'Списък за пазар 🛒', 'Какво за обяд? 🎲', 'Рецепти-карти', 'Добави своя храна', 'Алергените 🥜', 'Алергия-паспорт 🖨️', 'Напъване или задавяне 🫁', 'Формата, не храната ✂️', 'Дневник на опитаното', 'Първата реакция 📸'] },
    { room: 'Здраве и SOS', e: '🩺', c: '#8fd0ba', f: ['🚨 СОС-център с 112', 'Моят бърз номер (звъни)', 'Червени флагове → лекар', 'Температурен ориентир', 'Температурен дневник', 'Дневник на даденото', 'Болничен епизод 🤒', 'Бележка за прегледа 🖨️', 'Имунизационен календар 💉', 'Аптечка + срокове', 'Фото на обрив', 'SOS дъх 4-7-8', 'Здравни бележки'] },
    { room: 'Дневник на мама', e: '💜', c: '#c3b1ea', f: ['Как си днес (минутка за теб)', 'Съзвездието ти 🌌', 'Годината ти в думи ☁️', 'Реката на времето 🌊', 'Годишникът 📔', 'Месецът ти в числа', 'Време за мен ⏰', 'Подкана на деня', 'Снимка на деня 📸', 'Гласови бележки 🎙️', 'Писма между нас 💌', 'Писмо за месеца', 'Капсули на времето', 'Скъсай листа 💥', 'Три хубави неща', 'Медальончета 🏅', 'Ключалка 🔒'] },
    { room: 'Развитие и игри', e: '🧸', c: '#f5d47e', f: ['Какво умее сега (11 месеца)', 'Дървото на уменията 🌳', 'Какво да правим днес? (35 игри)', 'Игра по време и настроение', 'Любими игри + брояч', 'Приказка с името 📖', 'Приспивни песнички 🎵', 'Книжките ни 📚', 'Мит или истина? 🧿', 'Първите пъти 🌟', 'Витрина на гордостта 🏅', 'Първите драскулки 🎨'] },
    { room: 'Инструменти', e: '🎀', c: '#9fd8c6', f: ['Какво предстои 📅', 'Размер на дрешки', 'Конвертори (мл/oz)', 'Бебешки бюджет', 'Касичка-цел 🐷', 'Гардеробчето', 'Моите списъци', 'Списък за подаръци 🎁', 'Картичка за бабата 🖨️', 'Майчинството (БГ) 🇧🇬', 'Речник на мама 📖', 'Нощна лампа 🔦', 'Генератор на имена', 'Резервно копие 💾', 'Настройки ⚙️'] },
    { room: 'Жената в мен', e: '💃', c: '#d1487f', f: ['Хороскоп на деня 🔮', 'Картата на деня (60 карти)', 'Твоето число и личната ти година', 'Луната днес + желание при новолуние', 'Ти и бебето по зодия', 'Ангелски числа 11:11', 'Чантата, която е само твоя', 'Гардеробът СЕГА', 'Цветовете ми (сезонен тип)', 'Обувките', 'Какво да облека', 'Списък с желания 📤', 'Кога последно…', '5-те минути', 'Парфюмът ми', 'Заключено дневниче 🔒', 'Изповедалнята', 'Малките ми грехове 😈', 'Писмо до мен след година 💌', 'Мечтите — тогава и сега', 'Ако имах един свободен ден', 'Списъкът, който още не съм направила 🔥', 'Микро-приключение', 'Първо за мен', '3 минути свободно писане', 'Въпросът за ТЕБ', 'CV на майката 📄🖨️', 'Комплиментите', 'Коя бях · коя съм · коя ставам', 'Тайната страница 🗝️', 'Огледалото 🪞', 'Коя си ти днес 🎭', 'Езикът на картите', 'Седмичен хороскоп', 'Ритуалът на деня 🕯️', 'Картата на местата 🗺️', 'Когато си на дъното 💌'] },
    { room: 'Лабораторията', e: '🔬', c: '#f5d47e', f: ['Готови опити за съня, храната и настроението ТИ', 'Свой опит', 'Едно докосване на ден', 'Присъда от твоите вечери', 'Митът на седмицата от бабите 👵', 'Табло: къде баба позна', 'Какво се смени — детективът', 'Работеше… и спря 🔄', 'Защо се буди в 3? — дъската с уликите', 'Числата вместо усещането 📊', 'Сподели откритие 📤', 'Тетрадката с откритията 📓', 'Досието на бебето 📄🖨️', 'Пазач за забравен опит', 'Стоп за медицински опити 🚫'] },
  ];
  const NET_EXTRA = [
    // 18.3.2: „приятелки 24/7“ звучи като живи хора на телефона. По-честно:
    // помощнички са, по една за всяка стая — топли, но не се преструваме,
    // че от другата страна има човек.
    '💬 Девет помощнички — по една за всяка стая',
    '🔍 Кажи ми каквото те мъчи — ще го намерим заедно',
    '🖨️ Печатаеми моменти и книги',
    '📴 Работи без интернет',
    '🔒 Всичко остава на твоя телефон',
    '🎈 Едно докосване от началния екран'
  ];

  function mountPowers() {
    const rooms = document.getElementById('стаите');
    if (!rooms || document.querySelector('.netsec')) return;
    const total = NET.reduce((s, n) => s + n.f.length, 0);
    const sec = el('section', 'netsec');
    sec.innerHTML = `
      <h2 class="section-title reveal">Какво може <span class="net-name">Помощникът на мама</span></h2>
      <p class="section-sub reveal">Цялата мрежа, която изградихме — <strong>${total}</strong> неща, свързани в едно. Докосни възел.</p>
      <div class="net-stage reveal">
        <svg class="net-svg" viewBox="0 0 640 460" role="img" aria-label="Мрежата на Помощника на мама">
          <defs>
            <radialGradient id="netCore"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f7a8cb"/></radialGradient>
            <filter id="netGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g class="net-links"></g><g class="net-leaves"></g><g class="net-nodes"></g>
        </svg>
        <div class="net-panel">
          <div class="net-head"><span class="net-pe">🎈</span><div><strong class="net-pt">Помощникът на мама</strong><span class="net-ps">докосни възел от мрежата</span></div></div>
          <div class="net-list"></div>
        </div>
      </div>`;
    rooms.parentNode.insertBefore(sec, rooms.nextSibling);

    const svg = sec.querySelector('.net-svg');
    const gLinks = svg.querySelector('.net-links'), gNodes = svg.querySelector('.net-nodes'), gLeaves = svg.querySelector('.net-leaves');
    const CX = 320, CY = 230, R = 158;
    const pos = i => { const a = (i / NET.length * 360 - 90) * Math.PI / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a) * 0.78]; };

    // връзки център ↔ стаи
    NET.forEach((n, i) => {
      const [x, y] = pos(i);
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      l.setAttribute('d', `M${CX} ${CY} Q ${(CX + x) / 2 + (y - CY) * 0.12} ${(CY + y) / 2 - (x - CX) * 0.12} ${x} ${y}`);
      l.setAttribute('class', 'net-link'); l.dataset.i = i;
      l.style.setProperty('--c', n.c); l.style.setProperty('--d', (i * 0.12) + 's');
      gLinks.appendChild(l);
      // пътуващи искрици по връзката
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3'); dot.setAttribute('class', 'net-spark'); dot.setAttribute('fill', n.c);
      dot.innerHTML = `<animateMotion dur="${3 + i * 0.4}s" repeatCount="indefinite" begin="${i * 0.5}s"
        path="M${CX} ${CY} Q ${(CX + x) / 2 + (y - CY) * 0.12} ${(CY + y) / 2 - (x - CX) * 0.12} ${x} ${y}"/>`;
      gLinks.appendChild(dot);
    });
    // ядрото
    const core = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    core.setAttribute('class', 'net-core');
    core.innerHTML = `<circle cx="${CX}" cy="${CY}" r="46" fill="url(#netCore)" filter="url(#netGlow)"/>
      <circle cx="${CX}" cy="${CY}" r="46" class="net-ring1"/><circle cx="${CX}" cy="${CY}" r="58" class="net-ring2"/>
      <text x="${CX}" y="${CY - 4}" text-anchor="middle" class="net-ce">🎈</text>
      <text x="${CX}" y="${CY + 20}" text-anchor="middle" class="net-ct">${total}</text>`;
    gNodes.appendChild(core);
    // възлите-стаи
    NET.forEach((n, i) => {
      const [x, y] = pos(i);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'net-node'); g.dataset.i = i;
      g.style.setProperty('--c', n.c); g.style.setProperty('--d', (i * 0.1) + 's');
      g.innerHTML = `<circle cx="${x}" cy="${y}" r="30" class="net-hit"/>
        <circle cx="${x}" cy="${y}" r="24" class="net-bg"/>
        <text x="${x}" y="${y + 7}" text-anchor="middle" class="net-e">${n.e}</text>
        <text x="${x}" y="${y + 42}" text-anchor="middle" class="net-nm">${n.room.replace(' и игри', '').replace(' и SOS', '').replace(' на мама', '')}</text>
        <text x="${x}" y="${y - 33}" text-anchor="middle" class="net-cnt">${n.f.length}</text>`;
      gNodes.appendChild(g);
    });

    const list = sec.querySelector('.net-list');
    const pe = sec.querySelector('.net-pe'), pt = sec.querySelector('.net-pt'), ps = sec.querySelector('.net-ps');
    let cur = -1, timer = null;

    function showAll() {
      cur = -1;
      svg.querySelectorAll('.net-node').forEach(n => n.classList.remove('on', 'dim'));
      svg.querySelectorAll('.net-link').forEach(l => l.classList.remove('on', 'dim'));
      gLeaves.innerHTML = '';
      pe.textContent = '🎈'; pt.textContent = 'Помощникът на мама';
      ps.textContent = 'всичко, свързано в едно — докосни възел';
      list.innerHTML = NET_EXTRA.map(t => `<span class="net-chip net-chip-x">${t}</span>`).join('');
    }
    function show(i) {
      cur = i;
      const n = NET[i];
      const [x, y] = pos(i);
      svg.querySelectorAll('.net-node').forEach((g, j) => { g.classList.toggle('on', j === i); g.classList.toggle('dim', j !== i); });
      svg.querySelectorAll('.net-link').forEach((l, j) => { l.classList.toggle('on', j === i); l.classList.toggle('dim', j !== i); });
      // листата: функциите изникват около възела
      gLeaves.innerHTML = '';
      n.f.slice(0, 8).forEach((f, k) => {
        const ang = (k / Math.min(8, n.f.length) * 360 - 90) * Math.PI / 180;
        const lx = x + Math.cos(ang) * 62, ly = y + Math.sin(ang) * 48;
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x); ln.setAttribute('y1', y); ln.setAttribute('x2', lx); ln.setAttribute('y2', ly);
        ln.setAttribute('class', 'net-leaf-l'); ln.style.setProperty('--c', n.c); ln.style.setProperty('--d', (k * 0.05) + 's');
        gLeaves.appendChild(ln);
        const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c2.setAttribute('cx', lx); c2.setAttribute('cy', ly); c2.setAttribute('r', 4.5);
        c2.setAttribute('class', 'net-leaf'); c2.setAttribute('fill', n.c); c2.style.setProperty('--d', (k * 0.05) + 's');
        gLeaves.appendChild(c2);
      });
      pe.textContent = n.e; pt.textContent = n.room;
      ps.textContent = n.f.length + ' неща в тази стая';
      // 8.4.2: „твоите“ функции светят — тези от кътчетата, които мама
      // реално е разглеждала (bl_seen_cards пише iface.js)
      const видени = (function () { try { return JSON.parse(localStorage.getItem('bl_seen_cards') || '{}')[n.room] || {}; } catch (e) { return {}; } })();
      const еНейна = f => {
        const чисто = f.replace(/[📸💌🖨️🎲🌈🛒🤒💉🌌☁️🌊📔⏰🎙️💥🏅🔒🌳📖🎵📚🧿🌟🎨📅🐷🎁🇧🇬🔦💾⚙️🔮📤📄😈🗝️🪞🎭🕯️🗺️📊📓🚫🏆🕐]/g, '').trim().slice(0, 12).toLowerCase();
        return Object.keys(видени).some(k => k.toLowerCase().includes(чисто.slice(0, 8)));
      };
      list.innerHTML = n.f.map((f, k) => `<button class="net-chip${еНейна(f) ? ' net-mine' : ''}" style="--d:${k * 0.03}s" type="button" data-f="${f.replace(/"/g, '')}">${f}</button>`).join('') +
        `<button class="net-go" type="button">Влез в „${n.room}“ →</button>`;
      // 8.4.1: функцията се отваря ДИРЕКТНО — стаята + скок до самата карта
      list.querySelectorAll('.net-chip').forEach(b => b.addEventListener('click', () => {
        if (!window.MamaHelper) return;
        MamaHelper.open(n.room);
        const търсено = (b.dataset.f || '').replace(/[^\wа-яё\s]/gi, '').trim().slice(0, 14).toLowerCase();
        if (!търсено) return;
        setTimeout(() => {
          const карта = [...document.querySelectorAll('#roRoom .jr-card')].find(c => {
            const t = c.querySelector('.jr-title');
            return t && t.textContent.replace(/[^\wа-яё\s]/gi, '').toLowerCase().includes(търсено.slice(0, 10));
          });
          if (карта) {
            карта.classList.remove('folded');
            карта.scrollIntoView({ behavior: 'smooth', block: 'start' });
            карта.classList.remove('toc-flash'); void карта.offsetWidth; карта.classList.add('toc-flash');
          }
        }, 1400);
      }));
      list.querySelector('.net-go').addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open(n.room); });
    }
    svg.querySelectorAll('.net-node').forEach(g => g.addEventListener('click', () => {
      clearInterval(timer);
      const i = +g.dataset.i;
      if (cur === i) showAll(); else { show(i); if (window.BL_FX) BL_FX.buzz(8); }
    }));
    core.addEventListener('click', () => { clearInterval(timer); showAll(); if (window.BL_FX) BL_FX.buzz(8); });
    showAll();

    const io = new IntersectionObserver(en => {
      en.forEach(x => {
        if (!x.isIntersecting) return;
        io.disconnect();
        sec.querySelectorAll('.reveal').forEach(e2 => e2.classList.add('shown'));
        if (reduce) return;
        // мрежата се представя сама: обхожда стаите една по една
        let i = 0;
        setTimeout(() => {
          show(0);
          timer = setInterval(() => { i = (i + 1) % NET.length; show(i); }, 3400);
        }, 1200);
      });
    }, { threshold: 0.25 });
    io.observe(sec);
  }

  // ═══════════ 💬 „ПОПИТАЙ СЕГА“ — живото демо на помощничките ═══════════
  const ASK_ROUTES = [
    [/захранв|пюре|храна|алерген|лъжичк|яде/i, 'Захранване'],
    [/температур|болн|обрив|кашл|хрема|лекар|ваксин|градус|°|3[78]\.|39\.|повръщ|диари/i, 'Здраве и SOS'],
    [/бремен|термин|ритан|гаден|раждан/i, 'Бременност'],
    [/умор|издържам|тъжн|сама|вина/i, 'Дневник на мама'],
    [/говор|прохожд|игр|умени/i, 'Развитие и игри'],
    [/размер|списък|бюджет|количк|столче/i, 'Инструменти']
  ];
  function routeRoom(q) { for (const [re, room] of ASK_ROUTES) if (re.test(q)) return room; return 'Моето бебе'; }
  function mountAsk() {
    // 22.07 (армия): котвата `.powers` не съществува никъде в проекта —
    //   секцията, която я е раждала, днес прави `.netsec` (ред ~506).
    //   Значи цялата секция „Пробвай сега“ НИКОГА не се е показвала, макар
    //   кодът и стиловете ѝ (home.css:361-383) да са живи и готови.
    const powers = document.querySelector('.netsec') || document.getElementById('стаите');
    if (!powers || document.querySelector('.askme')) return;
    const sec = el('section', 'askme reveal');
    sec.innerHTML = `<div class="askme-box">
        <span class="askme-ava"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span>
        <div class="askme-body">
          <p class="askme-t">Пробвай сега — попитай, като че ли питаш приятелка:</p>
          <div class="askme-chips">
            <button type="button" class="askme-chip">Кога да започнем захранване?</button>
            <button type="button" class="askme-chip">Има 38.5° — какво да правя?</button>
            <button type="button" class="askme-chip">Не спи нощем, будя се на всеки час</button>
          </div>
          <form class="askme-form"><input type="text" maxlength="90" placeholder="…или напиши своя въпрос" aria-label="Твоят въпрос"><button type="submit">Питай ➤</button></form>
        </div></div>`;
    const go = q => {
      if (!q.trim() || !window.MamaHelper) return;
      const room = routeRoom(q);
      MamaHelper.open(room);
      setTimeout(() => MamaHelper.ask(q.trim()), 1300);
    };
    sec.querySelectorAll('.askme-chip').forEach(b => b.addEventListener('click', () => go(b.textContent)));
    sec.querySelector('.askme-form').addEventListener('submit', e => { e.preventDefault(); go(sec.querySelector('input').value); });
    powers.parentNode.insertBefore(sec, powers.nextSibling);
    const io = new IntersectionObserver(en => { en.forEach(x => { if (x.isIntersecting) { sec.classList.add('shown'); io.disconnect(); } }); }, { threshold: 0.2 });
    io.observe(sec);
  }

  // ═══════════ ❓ ЧЗВ — честните отговори ═══════════
  const FAQ = [
    ['Трябва ли ми интернет?', 'Само първия път, за да се зареди. После работи и в самолетен режим — 3 през нощта, на село, в планината. 📴'],
    ['Къде отиват записките и снимките ми?', 'Никъде. Всичко живее само на твоя телефон — ние не го виждаме и не го изпращаме. Има и резервно копие с един бутон. 🔒'],
    ['Замества ли лекар?', 'Не — и никога няма да се преструва. Помага ти да разбереш КОГА е за лекар, а „Бележката за прегледа“ те праща там подготвена. 🩺'],
    ['Как го слагам на телефона?', 'Две докосвания: отваряш линка → „Добави на началния екран“. Без магазини, без регистрации, без пароли. 📲'],
    ['За кого е?', 'От „чакаме бебе!“ до първите години. И за тати има място (писмата между вас 💌), и за баба (готова картичка с всичко важно 😄).']
  ];
  function mountFaq() {
    const install = document.getElementById('инсталирай');
    if (!install || document.querySelector('.faq')) return;
    const sec = el('section', 'faq');
    sec.innerHTML = `<h2 class="section-title reveal">Питат ни често <span class="wobble">❓</span></h2><div class="faq-list reveal"></div>`;
    const list = sec.querySelector('.faq-list');
    FAQ.forEach(([q, a]) => {
      const item = el('div', 'faq-item');
      item.innerHTML = `<button type="button" class="faq-q">${q}<span class="faq-arr">▾</span></button><div class="faq-a"><p>${a}</p></div>`;
      item.querySelector('.faq-q').addEventListener('click', () => {
        const was = item.classList.contains('open');
        list.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open'));
        if (!was) item.classList.add('open');
      });
      list.appendChild(item);
    });
    install.parentNode.insertBefore(sec, install);
    sec.querySelectorAll('.reveal').forEach(elm => {
      const io = new IntersectionObserver(en => { en.forEach(x => { if (x.isIntersecting) { elm.classList.add('shown'); io.disconnect(); } }); }, { threshold: 0.15 });
      io.observe(elm);
    });
  }

  // ═══════════ 🎪 ПОСРЕЩАЩИЯТ ТУР — веднъж, при първото идване ═══════════
  // 8.5.4: шест стъпки — колкото да покажат душата на приложението,
  // не толкова, че мама да ги прескочи от досада. Всяка е прескачаема
  // и се вижда само първия път.
  const TOUR = [
    ['🎈', 'Добре дошла у дома', 'Аз съм Помощникът на мама — джобната ти приятелка от бременността до третата годинка. Само няколко думи, преди да влезеш.'],
    ['🏰', 'Девет вълшебни стаи', 'Бременност, растеж, захранване, здраве, дневник, игри, инструменти, жената в теб и Лабораторията — всичко на едно място, подредено с обич.'],
    ['💬', 'Питай като приятелка', 'Във всяка стая живее помощничка. Тя отговаря човешки, помни твоето бебе и е будна и в 3 през нощта, когато никой друг не е.'],
    ['📔', 'Всичко се помни само', 'Реката на спомените, годишникът, снимките, първите пъти — трупат се сами от това, което правиш. Един ден имаш цяла книга, без да си я писала.'],
    ['💜', 'И стая само за ТЕБ', 'Не си само мама. Дневникът и „Жената в мен“ са за жената зад майката — да не се изгуби напълно в грижата.'],
    ['🔒', 'Всичко остава при теб', 'Записките, снимките и записите живеят САМО на твоя телефон. Нищо не тръгва навън. Работи и без интернет.']
  ];
  function mountTour() {
    try { if (localStorage.getItem('bl_tour_done')) return; } catch (e) { return; }
    const ov = el('div', 'tour-ov');
    let step = 0;
    function draw() {
      const [e, t, d] = TOUR[step];
      ov.innerHTML = `<div class="tour-card">
        <span class="tour-balloon"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></span>
        <span class="tour-e">${e}</span><h3>${t}</h3><p>${d}</p>
        <div class="tour-dots">${TOUR.map((_, i) => `<span class="${i === step ? 'on' : ''}"></span>`).join('')}</div>
        <button class="tour-next" type="button">${step < TOUR.length - 1 ? 'Напред →' : 'Започваме! 🎈'}</button>
        <button class="tour-skip" type="button">пропусни</button></div>`;
      ov.querySelector('.tour-next').addEventListener('click', () => {
        if (step < TOUR.length - 1) { step++; draw(); if (window.BL_FX) BL_FX.buzz(8); }
        else close(true);
      });
      ov.querySelector('.tour-skip').addEventListener('click', () => close(false));
    }
    function close(party) {
      try { localStorage.setItem('bl_tour_done', '1'); } catch (e) {}
      ov.remove(); document.body.style.overflow = '';
      if (party && window.BL_FX) { BL_FX.confetti(); BL_FX.cheer('Добре дошла у дома! 💜'); }
      // след обиколката → меката покана за онбординг (ако още няма бебе), за да
      // не се блъскат двата пълноекранни оверлея на първо пускане
      try {
        var нямаБебе = !(JSON.parse(localStorage.getItem('bl_baby') || '{}').birth);
        var неОнбордван = !localStorage.getItem('bl_onboarded');
        if (нямаБебе && неОнбордван && window.BL_ONBOARD) setTimeout(function () { BL_ONBOARD.open(); }, 700);
      } catch (e) {}
    }
    draw();
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
  }

  // ═══════════ 📱 theme-color по небето — лентата на браузъра живее ═══════════
  function mountThemeColor() {
    const col = { night: '#1a1630', dawn: '#ffe9d6', day: '#dff0fb', dusk: '#e8ddf6' }[skyMode()];
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = col;
  }

  // 🌙/☀️ копчето командва небето: щом темата се смени, страната се преоблича
  function watchTheme() {
    const mo = new MutationObserver(() => { mountSky(); mountThemeColor(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // 🆘 спешните номера — на една ръка от първия екран
  function mountSosCta() {
    const cta = document.querySelector('.hero-cta');
    if (!cta || cta.querySelector('.btn-sos')) return;
    const b = el('button', 'btn btn-sos', '🆘 Спешните номера');
    b.type = 'button';
    b.addEventListener('click', () => { if (window.BL_SOS_CENTER) BL_SOS_CENTER.open(); });
    cta.appendChild(b);
  }

  // проход 4: първото приветствие поема КОЯ Е ТЯ (връщаща се мама на Мия не бива
  // да чете същия общ слоган като първопроходец). Без числа-хвалби — само топло.
  // 👋 22.07 (клиентска обиколка): викаше се САМО при зареждане — тоест ПРЕДИ
  // новата майка да попълни името в онбординга. Тя въвеждаше „Мия“ и пак
  // виждаше общия слоган до следващото отваряне. Сега е достъпна отвън и
  // онбордингът я извиква, щом запише бебето.
  function персоПриветствие() {
    const tag = document.querySelector('.hero .tagline') || document.querySelector('.tagline');
    if (!tag || tag.dataset.perso) return;
    if (!tag.dataset.orig) tag.dataset.orig = tag.innerHTML;   // общият слоган — за връщане
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    let baby = {}; try { baby = JSON.parse(localStorage.getItem('bl_baby') || '{}'); } catch (e) {}
    if (baby && baby.name) { tag.innerHTML = 'Здравей, мамо на ' + esc(baby.name) + ' 💜'; tag.dataset.perso = '1'; return; }
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : '';   // само през вратаря → само́ се гаси при загуба
    if (lmp) { tag.innerHTML = 'Здравей, мамо 💜 Чакаме те, малкия.'; tag.dataset.perso = '1'; return; }
    tag.innerHTML = tag.dataset.orig;   // изтрито име → обратно към общия слоган
  }
  // Онбордингът и настройките викат това: маха пазача, за да се пресметне НАНОВО
  // (иначе смяна на името оставаше стария поздрав до следващото отваряне).
  function опресниПоздрав() {
    const tag = document.querySelector('.hero .tagline') || document.querySelector('.tagline');
    if (tag) delete tag.dataset.perso;
    персоПриветствие();
  }

  document.addEventListener('DOMContentLoaded', () => {
    персоПриветствие();
    window.BL_GREET = опресниПоздрав;   // онбордингът/настройките я викат след запис
    mountSky();
    mountThemeColor();
    watchTheme();
    mountSosCta();
    mountFlip();
    mountScrollBalloon();
    mountDayCircle();
    mountPowers();
    mountAsk();
    mountMeet();
    съживиЛичицата();
    монтирайМуркане();
    mountFaq();
    mountMascot();
    mountTour();
  });
})();
