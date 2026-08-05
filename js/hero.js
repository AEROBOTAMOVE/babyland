// ═══════════════════════════════════════════════════════════
// HERO — ВЪЗДУШНАТА СТРАНА „БЕЙБИ ЛЕНД“ 🎈🏝️
// Името на приложението, взето буквално: жива летяща страна.
// 9-те стаи са балон-къщички в небето, балонът-водач тегли плакат,
// хълмовете дишат на паралакс — и всяка къщичка се ДОКОСВА и влизаш.
//
// ХЪЛМЪТ СЕ ПЛЪЗГА (идея на собственика): деветте къщички не се
// струпват в един екран — страната продължава надясно и мама я
// прелиства с пръст. Задните хълмове изостават от предните → паралаксът
// най-накрая е истински, а не декорация.
//
// Къщичките са подредени по ПЪТЯ НА МАЙЧИНСТВОТО: чакането, бебето,
// лъжичките, здравето, игрите, инструментите, дневникът — и накрая
// двете, които са само нейни: жената и лабораторията.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // стая, емоджи, шепот, x (% от ДЪЛГАТА страна), y, дълбочина, мащаб
  const HOUSES = [
    ['Бременност', '🤰', 'календарът на чакането', 5, 30, 3, 0.92],
    ['Моето бебе', '🍼', 'растеж, сън, хранене', 16, 11, 2, 1.05],
    ['Захранване', '🥄', 'първите лъжички', 27, 36, 3, 0.88],
    ['Здраве и SOS', '🩺', 'кога е за лекар', 38, 9, 2, 1.0],
    ['Развитие и игри', '🧸', 'игрите и уменията', 49, 33, 2, 0.95],
    ['Инструменти', '🎀', 'кутията с чудесии', 60, 8, 3, 0.85],
    ['Дневник на мама', '💜', 'стаята само за ТЕБ', 71, 30, 1, 1.18],
    ['Жената в мен', '💃', 'помниш ли я? тя е тук', 83, 10, 1, 1.12],
    ['Лабораторията', '🔬', 'да проверим при нас', 93, 34, 2, 0.95]
  ];
  // страната е по-широка от прозореца — оттам идва плъзгането
  const SPAN = 1.85;

  const чети = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const пиши = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const екр = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // 8.1.2: балонът-водач чете ДАННИТЕ — ваксина наблизо, опит в ход,
  // спомен отпреди година. Чак ако няма нищо — топлият поздрав.
  function плакат() {
    try {
      const бебе = чети('bl_baby', {});
      // ваксина в идните 7 дни (rooms2 пази отметките, датите идват от възрастта)
      const опити = (чети('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
      if (опити.length) {
        const о = опити[0];
        const в = Object.keys(о.log || {}).length;
        return 'Опитът ви: вечер ' + в + ' от ' + (о.d || 7) + ' 🔬';
      }
      if (бебе.birth && window.BL_RIVER) {
        const мем = BL_RIVER.memoryFor(365) || BL_RIVER.memoryFor(180);
        if (мем && мем.big) return 'Днес преди време: ' + екр(String(мем.txt).slice(0, 34)) + '… 🔮';
      }
      const ч = чети('bl_checkins', {});
      const дн = new Date(), кл = дн.getFullYear() + '-' + String(дн.getMonth() + 1).padStart(2, '0') + '-' + String(дн.getDate()).padStart(2, '0');
      if (!ч[кл] && дн.getHours() >= 9) return 'Една минутка за теб днес? 💜';
    } catch (e) {}
    return 'Добре дошла у дома, мамо 💜';
  }

  // 8.1.3: какво ЧАКА във всяка стая — значка на къщичката
  function чакаЛи(room) {
    try {
      const дн = new Date(), кл = дн.getFullYear() + '-' + String(дн.getMonth() + 1).padStart(2, '0') + '-' + String(дн.getDate()).padStart(2, '0');
      if (room === 'Лабораторията') {
        const о = (чети('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
        return о.length && !(о[0].log || {})[кл] ? '🔬' : '';
      }
      if (room === 'Дневник на мама') return !чети('bl_checkins', {})[кл] ? '💜' : '';
      if (room === 'Жената в мен') return чети('bl_cards', { last: '' }).last !== кл ? '🃏' : '';
      if (room === 'Здраве и SOS') {
        const апт = чети('bl_pharmacy', []);
        return апт.some(x => x && x.exp && new Date(x.exp) < дн) ? '⚠️' : '';
      }
    } catch (e) {}
    return '';
  }

  function build() {
    const inner = document.querySelector('.hero-inner');
    if (!inner || document.querySelector('.land')) return;

    // рамката стои на място; страната вътре е по-дълга и се плъзга
    const frame = el('div', 'land-frame reveal');
    const land = el('div', 'land');
    land.style.width = (SPAN * 100) + '%';
    frame.setAttribute('aria-label', 'Въздушната страна Бейби Ленд — плъзни встрани и докосни къщичка, за да влезеш в стая');

    // ── слоеве: орб-светлина → най-далечен мъглив пласт → далечни хълмове →
    //    близки хълмове → пътечката (П1: въздушна перспектива с 4 скорости) ──
    land.innerHTML = `
      <div class="ld-orb"></div>
      <svg class="land-hills ld-farthest" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0 200 L0 148 Q 120 94 260 126 Q 420 162 560 114 Q 720 62 850 116 Q 930 146 1000 126 L1000 200 Z" fill="var(--ld-fst, #efe9f8)"/>
      </svg>
      <div class="ld-haze"></div>
      <svg class="land-hills ld-far" viewBox="0 0 1000 160" preserveAspectRatio="none">
        <path d="M0 160 L0 110 Q 140 52 300 96 Q 460 136 620 84 Q 800 34 1000 92 L1000 160 Z" fill="var(--ld-far, #e7ddf3)"/>
      </svg>
      <svg class="land-hills ld-near" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <path d="M0 120 L0 76 Q 180 20 380 62 Q 560 96 740 52 Q 880 24 1000 60 L1000 120 Z" fill="var(--ld-near, #d8e9dc)"/>
        <ellipse cx="180" cy="70" rx="26" ry="9" fill="rgba(255,255,255,0.35)"/>
        <ellipse cx="640" cy="58" rx="34" ry="10" fill="rgba(255,255,255,0.3)"/>
      </svg>
      <svg class="land-path" viewBox="0 0 1000 300" preserveAspectRatio="none">
        <path d="M 60 120 Q 200 210 320 150 Q 430 95 540 170 Q 650 240 760 130 Q 850 60 950 160"
          fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="3.5" stroke-dasharray="1 14" stroke-linecap="round" class="ld-dash"/>
      </svg>`;

    // ── балонът-водач с плаката ──
    // 8.1.2: плакатът носи ИСТИНСКО послание от данните на мама, не лозунг
    const pilot = el('div', 'ld-pilot');
    pilot.innerHTML = `
      <div class="ld-banner">${плакат()}</div>
      <svg viewBox="0 0 60 96" class="ld-pilot-b"><use href="#balloonShape"/></svg>
      <span class="ld-trail">✦</span><span class="ld-trail t2">✧</span><span class="ld-trail t3">✦</span>`;
    land.appendChild(pilot);

    // ── 7-те балон-къщички ──
    HOUSES.forEach(([room, e, desc, x, y, depth, scale], i) => {
      const h = el('button', 'ld-house ld-d' + depth);
      h.type = 'button';
      if (чакаЛи(room)) h.classList.add('ld-attn');   // проход 4: къщичката с чакащо свети с ореол — „днес те чакат тук"
      h.style.left = x + '%';
      h.style.top = y + '%';
      h.style.setProperty('--sc', scale);
      h.style.animationDelay = (i * 0.6) + 's';
      h.setAttribute('aria-label', room + ' — ' + desc);
      h.innerHTML = `
        <span class="ld-tip">${e} <strong>${room}</strong><br>${desc}<em>докосни и влез →</em></span>
        <svg viewBox="0 0 60 74" class="ld-hb">
          <ellipse cx="30" cy="24" rx="21" ry="23" fill="var(--h${i}, #f7a8cb)"/>
          <path d="M30 1 C 42 1 51 11 51 24 C 51 37 42 46 30 47 C 18 46 9 37 9 24 C 9 11 18 1 30 1 Z" fill="rgba(255,255,255,0.22)"/>
          <path d="M22 46 L20 58 M30 47 L30 58 M38 46 L40 58" stroke="rgba(90,60,90,0.45)" stroke-width="1.4"/>
          <rect x="18" y="56" width="24" height="15" rx="5" fill="#f6e7cf" stroke="#dcbf96" stroke-width="1.5"/>
          <rect x="26" y="61" width="8" height="10" rx="2.5" fill="#b98d5f"/>
        </svg>
        <span class="ld-he">${e}</span>
        <span class="ld-hn">${room.replace(' и игри', '').replace(' и SOS', '').replace(' на мама', '')}</span>
        ${чакаЛи(room) ? `<span class="ld-badge">${чакаЛи(room)}</span>` : ''}`;
      h.addEventListener('click', () => {
        h.classList.add('ld-lift');
        if (window.BL_FX) { BL_FX.confetti(h, 14); BL_FX.buzz(10); }
        // П5 H5: ирисът — небето се отваря от къщичката в НЕЙНИЯ цвят и те приема
        if (!reduce) {
          const ир = el('div', 'ld-iris');
          const р = h.getBoundingClientRect();
          ир.style.left = (р.left + р.width / 2) + 'px';
          ир.style.top = (р.top + р.height / 2) + 'px';
          ир.style.background = (getComputedStyle(land).getPropertyValue('--h' + i) || '#f7a8cb').trim();
          document.body.appendChild(ир);
          setTimeout(() => { ир.classList.add('ld-iris-out'); setTimeout(() => ир.remove(), 650); }, 640);
        }
        setTimeout(() => {
          h.classList.remove('ld-lift');
          // тя ВЕЧЕ докосна тази къщичка — не летим втори път до нея
          window._ldDirect = true;
          if (window.MamaHelper) MamaHelper.open(room);
          window._ldDirect = false;
        }, reduce ? 0 : 460);
      });
      land.appendChild(h);
    });

    // ── облачета между слоевете ──
    for (let i = 0; i < 4; i++) {
      const c = el('span', 'ld-cloud', '☁️');
      c.style.top = (6 + i * 17) + '%';
      c.style.animationDuration = (38 + i * 14) + 's';
      c.style.animationDelay = (-i * 13) + 's';
      c.style.fontSize = (22 + (i % 3) * 9) + 'px';
      land.appendChild(c);
    }

    // ── паралакс: светът диша с пръста/мишката ──
    if (!reduce) {
      land.addEventListener('pointermove', (ev) => {
        if (drag.on) return;                      // докато влачи, не трепка
        const r = land.getBoundingClientRect();
        const nx = (ev.clientX - r.left) / r.width - 0.5;
        const ny = (ev.clientY - r.top) / r.height - 0.5;
        land.style.setProperty('--lx', nx.toFixed(3));
        land.style.setProperty('--ly', ny.toFixed(3));
      });
      land.addEventListener('pointerleave', () => {
        land.style.setProperty('--lx', 0); land.style.setProperty('--ly', 0);
      });

      // ── П5-резерв H2: телефонът в ръката = прозорец към страната (гиро-паралакс).
      //    Където се иска разрешение (iOS) — просто мълчим, без диалози.
      if ('DeviceOrientationEvent' in window &&
          typeof DeviceOrientationEvent.requestPermission !== 'function') {
        const цел = { x: 0, y: 0 }, тек = { x: 0, y: 0 };
        let живо = false, база = null;
        window.addEventListener('deviceorientation', ev => {
          if (ev.gamma == null || drag.on) return;
          if (база == null) база = ev.beta || 0;      // както го държи СЕГА = нулата
          цел.x = Math.max(-1, Math.min(1, ev.gamma / 26));
          цел.y = Math.max(-1, Math.min(1, ((ev.beta || 0) - база) / 30));
          if (!живо) { живо = true; requestAnimationFrame(гладко); }
        }, { passive: true });
        function гладко() {
          тек.x += (цел.x - тек.x) * 0.09;
          тек.y += (цел.y - тек.y) * 0.09;
          land.style.setProperty('--lx', тек.x.toFixed(3));
          land.style.setProperty('--ly', тек.y.toFixed(3));
          if (Math.abs(цел.x - тек.x) + Math.abs(цел.y - тек.y) > 0.003) requestAnimationFrame(гладко);
          else живо = false;                          // заспива — не гори батерия
        }
      }
    }

    frame.appendChild(land);

    // ═══════════ ПЛЪЗГАНЕТО ═══════════
    // Пръстът дърпа страната. Пуснеш ли — продължава по инерция и спира меко.
    // Задните хълмове изостават → истинска дълбочина.
    const maxX = () => Math.max(0, land.scrollWidth - frame.clientWidth);
    const drag = { on: false, x0: 0, s0: 0, moved: 0, v: 0, last: 0, t: 0 };
    let pos = 0, raf = null;

    // ── П5-резерв H3: балони на връв — инерцията на света люлее къщичките ──
    let люлНаклон = 0, люлПреди = 0, люлRaf = null;
    function люлейСъбуди() {
      if (reduce || люлRaf) return;
      люлПреди = pos;
      люлRaf = requestAnimationFrame(люлейСтъпка);
    }
    function люлейСтъпка() {
      const скорост = pos - люлПреди; люлПреди = pos;
      const цел = Math.max(-13, Math.min(13, скорост * 0.85));
      люлНаклон += (цел - люлНаклон) * 0.14;
      land.style.setProperty('--lean', люлНаклон.toFixed(2) + 'deg');
      if (Math.abs(люлНаклон) > 0.06 || drag.on) люлRaf = requestAnimationFrame(люлейСтъпка);
      else { люлRaf = null; land.style.setProperty('--lean', '0deg'); }
    }

    function apply() {
      land.style.transform = 'translateX(' + (-pos) + 'px)';
      // всеки слой се движи с различна скорост — това е паралаксът
      const far = land.querySelector('.ld-far'), near = land.querySelector('.ld-near');
      if (far) far.style.transform = 'translateX(' + (pos * 0.55) + 'px)';
      if (near) near.style.transform = 'translateX(' + (pos * 0.25) + 'px)';
      // П1: мъгливият пласт и орбът почти не се движат — най-далечни са
      const мъгл = land.querySelector('.ld-farthest'), орб = land.querySelector('.ld-orb');
      if (мъгл) мъгл.style.transform = 'translateX(' + (pos * 0.72) + 'px)';
      if (орб) орб.style.transform = 'translateX(' + (pos * 0.85) + 'px)';
      const m = maxX();
      dots.forEach((d, i) => d.classList.toggle('on', m ? Math.round(pos / m * (dots.length - 1)) === i : i === 0));
      if (pos > 8) frame.classList.add('slid');
      люлейСъбуди();
    }
    function clamp(v) { return Math.max(0, Math.min(maxX(), v)); }
    function glide() {
      drag.v *= 0.94;
      pos = clamp(pos + drag.v);
      apply();
      if (Math.abs(drag.v) > 0.4 && pos > 0 && pos < maxX()) raf = requestAnimationFrame(glide);
      else raf = null;
    }
    frame.addEventListener('pointerdown', ev => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      drag.on = true; drag.x0 = ev.clientX; drag.s0 = pos; drag.moved = 0; drag.v = 0;
      drag.last = ev.clientX; drag.t = performance.now();
    });
    frame.addEventListener('pointermove', ev => {
      if (!drag.on) return;
      const dx = ev.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      pos = clamp(drag.s0 - dx);
      const now = performance.now(), dt = now - drag.t;
      if (dt > 8) { drag.v = (drag.last - ev.clientX) / dt * 14; drag.last = ev.clientX; drag.t = now; }
      apply();
      if (drag.moved > 6) frame.classList.add('grabbing');
    });
    const release = () => {
      if (!drag.on) return;
      drag.on = false; frame.classList.remove('grabbing');
      if (Math.abs(drag.v) > 0.6 && !reduce) raf = requestAnimationFrame(glide);
    };
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);
    frame.addEventListener('pointerleave', release);
    // влаченето не бива да отваря стая
    frame.addEventListener('click', ev => { if (drag.moved > 8) { ev.stopPropagation(); ev.preventDefault(); } }, true);
    // на телефона пръстът нагоре-надолу си скролва страницата
    frame.style.touchAction = 'pan-y';
    // мишка/тъчпад
    frame.addEventListener('wheel', ev => {
      const d = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : 0;
      if (!d) return;
      ev.preventDefault(); pos = clamp(pos + d); apply();
    }, { passive: false });
    // клавиатура — къщичките си остават истински бутони
    frame.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowRight') { pos = clamp(pos + 90); apply(); }
      if (ev.key === 'ArrowLeft') { pos = clamp(pos - 90); apply(); }
    });
    // табването с клавиатура довежда къщичката в кадър
    land.addEventListener('focusin', ev => {
      const b = ev.target.closest('.ld-house'); if (!b) return;
      const r = b.getBoundingClientRect(), f = frame.getBoundingClientRect();
      if (r.left < f.left + 20) { pos = clamp(pos - (f.left + 20 - r.left)); apply(); }
      if (r.right > f.right - 20) { pos = clamp(pos + (r.right - (f.right - 20))); apply(); }
    });

    // ── точките отдолу + подсказката ──
    const nav = el('div', 'ld-dots');
    const dots = [];
    for (let i = 0; i < 3; i++) { const d = el('i', i === 0 ? 'on' : ''); nav.appendChild(d); dots.push(d); }
    frame.appendChild(nav);
    frame.appendChild(el('span', 'ld-swipe', '👉 плъзни'));

    // ── П5 H4: водачът е ЖИВ — свои пътечки, наклон по посоката, гостуване
    //    при къщичките, които чакат мама. CSS-полетът замлъква (безшевно на 900мс). ──
    if (!reduce) {
      const банер = pilot.querySelector('.ld-banner');
      const п = { x: 30, y: 20, цх: 220, цу: 30, vx: 0, vy: 0, пауза: 0, гост: null, банерТмр: 0 };
      function новаЦел() {
        const видими = [...land.querySelectorAll('.ld-house.ld-attn')]
          .filter(к => к.offsetLeft > pos + 40 && к.offsetLeft < pos + frame.clientWidth - 90);
        if (видими.length && Math.random() < 0.4) {
          п.гост = видими[Math.floor(Math.random() * видими.length)];
          п.цх = п.гост.offsetLeft - 46;
          п.цу = Math.max(4, п.гост.offsetTop - 30);
        } else {
          п.гост = null;
          п.цх = pos + frame.clientWidth * (0.1 + Math.random() * 0.62);
          п.цу = frame.clientHeight * (0.04 + Math.random() * 0.36);
        }
      }
      function лети(сега) {
        if (!pilot.isConnected) return;
        // съдийски фикс: мама е под херото → дремем, не горим кадри
        if (window.BL_HERO && !BL_HERO.видим()) { setTimeout(() => requestAnimationFrame(лети), 600); return; }
        if (сега < п.пауза) { setTimeout(() => requestAnimationFrame(лети), п.пауза - сега); return; }
        const dx = п.цх - п.x, dy = п.цу - п.y;
        п.vx = (п.vx + dx * 0.0007) * 0.964;
        п.vy = (п.vy + dy * 0.001) * 0.952;
        п.x = Math.max(6, Math.min(land.scrollWidth - 150, п.x + п.vx));
        п.y = Math.max(2, Math.min(frame.clientHeight * 0.55, п.y + п.vy));
        const завой = Math.max(-9, Math.min(9, п.vx * 7));
        pilot.style.transform = 'translate(' + п.x.toFixed(1) + 'px,' + п.y.toFixed(1) + 'px) rotate(' + завой.toFixed(1) + 'deg)';
        if (Math.abs(dx) + Math.abs(dy) < 30 && Math.abs(п.vx) + Math.abs(п.vy) < 0.5) {
          if (п.гост) {
            clearTimeout(п.банерТмр);            // старият таймер да не затрие пресния текст
            банер.classList.add('ld-note');
            банер.innerHTML = 'Тук те чакат ✨';
            п.банерТмр = setTimeout(() => { банер.classList.remove('ld-note'); банер.innerHTML = плакат(); }, 3400);
            п.пауза = сега + 3300;
          } else п.пауза = сега + 800 + Math.random() * 1800;
          новаЦел();
        }
        requestAnimationFrame(лети);
      }
      setTimeout(() => {
        // безшевно предаване: CSS-полетът тече дотук, JS поема от близка точка
        pilot.style.transform = 'translate(30px,20px)';
        pilot.classList.add('ld-pilot-live');
        новаЦел(); requestAnimationFrame(лети);
      }, 900);
    }

    // сцената застава след tagline
    const tagline = inner.querySelector('.tagline');
    if (tagline) tagline.after(frame); else inner.appendChild(frame);
    requestAnimationFrame(() => { frame.classList.add('shown'); apply(); });
    window.addEventListener('resize', () => { pos = clamp(pos); apply(); });

    // 8.1.4: нощем къщичките светят отвътре — прозорчето става топло
    // П5-резерв П6: нощен живот — светулки между къщичките + тиха падаща звезда
    let нощенЖивот = null;
    const нощ = () => {
      const тъмно = document.documentElement.getAttribute('data-theme') === 'dark';
      land.classList.toggle('ld-night', тъмно);
      if (тъмно && !нощенЖивот && !reduce) {
        // светулките — 5, бавни, между къщичките
        for (let i = 0; i < 5; i++) {
          const св = el('span', 'ld-fire', '✨');
          св.style.left = (8 + i * 19) + '%';
          св.style.top = (30 + (i % 3) * 16) + '%';
          св.style.animationDuration = (5.5 + i * 1.3) + 's';
          св.style.animationDelay = (-i * 2.1) + 's';
          land.appendChild(св);
        }
        // на всеки ~26с — една тиха падаща звезда
        нощенЖивот = setInterval(() => {
          if (document.hidden || !land.isConnected) return;
          const зв = el('span', 'ld-shoot', '✦');
          зв.style.left = (10 + Math.random() * 55) + '%';
          зв.style.top = (4 + Math.random() * 16) + '%';
          land.appendChild(зв);
          setTimeout(() => зв.remove(), 1800);
        }, 26000);
      }
      if (!тъмно && нощенЖивот) {
        clearInterval(нощенЖивот); нощенЖивот = null;
        land.querySelectorAll('.ld-fire, .ld-shoot').forEach(x => x.remove());
      }
    };
    нощ();
    new MutationObserver(нощ).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // 8.1.7: сезонът вали — тихо, малко, и се изключва с едно докосване
    (function сезон() {
      if (reduce || чети('bl_hero_weather_off', false)) return;
      const м = new Date().getMonth() + 1;
      const вид = (м === 12 || м <= 2) ? '❄' : (м >= 10 || м <= 4) && Math.random() < 0.5 ? '💧' : '';
      if (!вид) return;
      for (let i = 0; i < 9; i++) {
        const к = el('span', 'ld-drop' + (вид === '❄' ? ' ld-snow' : ''), вид);
        к.style.left = (4 + Math.random() * 92) + '%';
        к.style.animationDuration = (вид === '❄' ? 7 + Math.random() * 6 : 2.2 + Math.random() * 1.6) + 's';
        к.style.animationDelay = (-Math.random() * 8) + 's';
        land.appendChild(к);
      }
      const изкл = el('button', 'ld-wx', вид); изкл.type = 'button';
      изкл.title = 'Спри времето';
      изкл.setAttribute('aria-label', 'Спри снега/дъжда');
      изкл.addEventListener('click', () => {
        пиши('bl_hero_weather_off', true);
        land.querySelectorAll('.ld-drop').forEach(x => x.remove());
        изкл.remove();
      });
      frame.appendChild(изкл);
    })();

    // 8.1.5: първото идване — балонът развежда сам, веднъж и никога вече
    if (!чети('bl_hero_toured', false) && !reduce && maxX() > 40) {
      пиши('bl_hero_toured', true);
      setTimeout(() => {
        if (drag.on) return;                    // мама вече е хванала света
        const цел = maxX();
        const старт = performance.now(), т = 2600;
        (function стъпка(сега) {
          if (drag.on) return;                  // пипне ли — спираме на мига
          const х = Math.min(1, (сега - старт) / т);
          const мек = х < 0.5 ? 2 * х * х : 1 - Math.pow(-2 * х + 2, 2) / 2;
          pos = clamp(цел * Math.sin(мек * Math.PI));   // дотам и обратно
          apply();
          if (х < 1) requestAnimationFrame(стъпка);
        })(старт);
      }, 1800);
    }

    // 8.1.1: „летя до стаята“ — светът се плъзга до къщичката и я вдига,
    // когато стаята се отваря отдругаде (мрежата, кръга, търсачката)
    function летиДо(room, готово) {
      const б = [...land.querySelectorAll('.ld-house')].find(x => (x.getAttribute('aria-label') || '').startsWith(room));
      if (!б || reduce) { if (готово) готово(); return; }
      const правБ = б.getBoundingClientRect(), правФ = frame.getBoundingClientRect();
      const цел = clamp(pos + (правБ.left + правБ.width / 2) - (правФ.left + правФ.width / 2));
      const старт = pos, стартЧас = performance.now(), т = 700;
      (function стъпка(сега) {
        const х = Math.min(1, (сега - стартЧас) / т);
        const мек = 1 - Math.pow(1 - х, 3);
        pos = старт + (цел - старт) * мек;
        apply();
        if (х < 1) requestAnimationFrame(стъпка);
        else {
          б.classList.add('ld-lift');
          setTimeout(() => { б.classList.remove('ld-lift'); if (готово) готово(); }, 420);
        }
      })(стартЧас);
    }
    window.BL_HERO = { летиДо, видим: () => {
      const r = frame.getBoundingClientRect();
      return r.bottom > 60 && r.top < window.innerHeight - 60;
    } };

    // ── CTA: под страната, стегнато ──
    const cta = document.querySelector('.hero-cta');
    if (cta && !cta.classList.contains('hero-cta-max')) {
      cta.classList.add('hero-cta-max');
      cta.innerHTML = `
        <a href="#стаите" class="cta-main"><span class="btn-shine"></span>🏰 Разгледай всичко долу</a>
        <div class="cta-row">
          <a href="#инсталирай" class="cta-mini">📲 На моя телефон</a>
          <button type="button" class="cta-sos" aria-label="Спешни номера">🆘 СОС</button>
        </div>
        <p class="cta-truth">Отваря се от линк · живее на твоя телефон · работи и в самолетен режим</p>`;
      cta.querySelector('.cta-sos').addEventListener('click', () => { if (window.BL_SOS_CENTER) BL_SOS_CENTER.open(); });
    }
  }

  // 8.1.6: логото — докоснеш ли го, балончето в него намига
  document.addEventListener('DOMContentLoaded', () => {
    const лого = document.querySelector('.logo, .brand, header .logo-balloon') || document.querySelector('header svg');
    if (лого) лого.addEventListener('click', () => {
      лого.classList.remove('logo-wink'); void лого.offsetWidth; лого.classList.add('logo-wink');
      if (window.BL_FX) BL_FX.buzz(6);
    });
  });

  // 8.1.1: стаята, отворена отдругаде, първо се долита — ако светът се вижда
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (!window.MamaHelper || !window.BL_HERO) return;
    const оригинал = MamaHelper.open;
    MamaHelper.open = function (room) {
      const овърлей = document.getElementById('roomOverlay');
      if (!window._ldDirect && BL_HERO.видим() && овърлей && овърлей.hidden && MamaHelper.persona(room)) {
        BL_HERO.летиДо(room, () => оригинал.call(MamaHelper, room));
        return;
      }
      оригинал.call(MamaHelper, room);
    };
  }, 400));

  document.addEventListener('DOMContentLoaded', () => setTimeout(build, 50));
})();
