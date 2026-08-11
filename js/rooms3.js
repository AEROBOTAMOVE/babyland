// ═══════════════════════════════════════════════════════════
// ROOMS 3 — НАБЛЪСКВАНЕТО (мега план 12, сесии Н3–Н8)
// Дневник макс • Бременност • Моето бебе • Захранване •
// Здраве • Развитие • Инструменти — всичко локално, всичко свързано.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {}, pop() {}, chime() {}, countUp() {} };
  // проход 4: тихите откази (стойност извън обхват/дубликат) объркват — уморена
  // майка мисли, че приложението е счупено. Топла едноредова причина + buzz.
  function hint(anchor, msg) { let h = anchor.__h; if (!h) { h = el('p', 'jr-hint'); anchor.after(h); anchor.__h = h; } h.textContent = msg; fx().buzz(6); }
  function clearHint(a) { if (a.__h) a.__h.textContent = ''; }
  // 🔇 12.08 (обиколка с телефон, мерено с натискане): ЕДИНАДЕСЕТ бутона в този
  //    файл правеха точно НИЩО при празно поле — `if (!v) return;`. Измерено:
  //    „Остави писмото 💌“, „Запечатай писмото 💌“, „+“ в плейлиста, плана за
  //    раждане, паспорта, аптечката, книжките, „+ Сега“ в лекарствата, „✔“ в
  //    менюто, „Започни касичката 🐷“ и „→“ в съзвездието — нула промяна в DOM,
  //    нула в паметта. Мама натиска втори и трети път и мисли, че е счупено.
  //    nudge = причина с думи + курсор в полето (клавиатурата се вдига = видимо).
  function nudge(anchor, msg, field) {
    hint(anchor, msg);
    if (field) { try { field.focus({ preventScroll: true }); } catch (e) { try { field.focus(); } catch (e2) {} } }
  }
  // тихият знак „прието“ — надписът на бутона за миг казва какво стана и се връща
  function tick(btn, msg, ms) {
    if (btn.__tk) { clearTimeout(btn.__tk); } else { btn.__orig = btn.innerHTML; }
    btn.innerHTML = msg;
    btn.__tk = setTimeout(() => { if (btn.isConnected) btn.innerHTML = btn.__orig; btn.__tk = null; }, ms || 1400);
  }
  // 🔄 12.08 (известният клас, находка 8): карта, чиито данни ги пише ДРУГА карта
  //    на същия екран, остава стара до излизане от стаята. Тук няма събитие, на
  //    което да се закачим (rooms.js не праща нищо при чекин), затова гледаме
  //    самия ключ: след всяко докосване някъде в приложението сравняваме подписа
  //    на паметта и пречертаваме САМО ако наистина се е сменил. Един getItem и
  //    едно сравнение на низ — по-евтино от прекрасния IntersectionObserver и,
  //    за разлика от него, се проверява с натискане.
  //    Слушателят се маха сам, щом картата вече не е в документа.
  function свежо(c, ключ, рисувай) {
    let подпис = localStorage.getItem(ключ) || '';
    let чака = false;
    const провери = () => {
      if (!c.isConnected) { document.removeEventListener('click', провери); document.removeEventListener('scroll', отложено, true); return; }
      const нов = localStorage.getItem(ключ) || '';
      if (нов === подпис) return;
      подпис = нов; рисувай();
    };
    // скролът идва на порой — гледаме най-много веднъж на 300 мс
    const отложено = () => { if (чака) return; чака = true; setTimeout(() => { чака = false; провери(); }, 300); };
    document.addEventListener('click', провери);            // след чуждия слушател
    document.addEventListener('scroll', отложено, true);    // стаята скролира вътре в себе си
    return провери;
  }
  // 👆 12.08: голият едно-знаков чип („+“, „✔“, „←“, „→“) мери 37.5×44 —
  //    touch.css дава min-height, но min-width НЯМА (същото е признато за .jr-x
  //    и в lab.css:189). Мерено с getBoundingClientRect в 375px телефон.
  const wide = b => { b.style.minWidth = '44px'; return b; };
  // 🗑/✕ вътре в ред, писан с innerHTML — touch.css им дава 40, но брифът иска 44
  const цели = root => { root.querySelectorAll('.nt-del, .jr-x').forEach(b => { b.style.minWidth = '44px'; b.style.minHeight = '44px'; }); return root; };
  const getBaby = () => load('bl_baby', { name: '', sex: '', birth: '' });
  const dstr = ts => new Date(ts).toLocaleDateString('bg-BG');
  const MOODS = ['😩', '😔', '😐', '🙂', '🥰'];
  const MOODCOL = ['#8fa3c7', '#9b8fc7', '#c7b58f', '#f0a8d0', '#f291bd'];

  // ═══════════════ 📖 ДНЕВНИКЪТ МАКС (Н3) ═══════════════

  // 🌌 Съзвездието на мама — всеки чекин е звезда
  function constellationCard() {
    const c = card('Съзвездието ти 🌌 <span class="jr-sub">всяка минутка за теб е звезда — месецът става небе</span>');
    let off = 0; // месеци назад
    const nav = el('div', 'cs-nav');
    const prev = wide(el('button', 'jr-chip', '←')); prev.type = 'button';
    const next = wide(el('button', 'jr-chip', '→')); next.type = 'button';
    // ♿ 11.08 (клавиатура-четец): двете стрелки бяха само знак — четецът казваше
    //    „бутон“ и толкова, а месецът стои в отделен <span> до тях.
    prev.setAttribute('aria-label', 'Предишният месец');
    next.setAttribute('aria-label', 'Следващият месец');
    const lbl = el('span', 'cs-lbl', ''); lbl.setAttribute('aria-live', 'polite');
    nav.appendChild(prev); nav.appendChild(lbl); nav.appendChild(next);
    const box = el('div', 'cs-box');
    c.appendChild(nav); c.appendChild(box);
    const seedY = d => { let h = 0; const s = 'zvezda' + d; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return 20 + (h % 120); };
    function draw() {
      const now = BL_DATE.addMonths(new Date(), -off);
      const y = now.getFullYear(), m = now.getMonth();
      lbl.textContent = now.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });
      const days = new Date(y, m + 1, 0).getDate();
      const cks = load('bl_checkins', {});
      const pts = [];
      for (let d = 1; d <= days; d++) {
        const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        if (cks[key]) pts.push({ d, m: cks[key].m, e: cks[key].e || 50, key, w: cks[key].w || '' });
      }
      let svg = `<svg viewBox="0 0 320 170" class="cs-svg" role="img" aria-label="Съзвездие на настроенията">`;
      svg += `<rect x="0" y="0" width="320" height="170" rx="16" class="cs-sky"/>`;
      // фонови звездички
      for (let i = 0; i < 26; i++) svg += `<circle cx="${(i * 137) % 320}" cy="${(i * 61) % 170}" r="0.8" class="cs-dust"/>`;
      const P = pts.map(p => ({ x: 14 + (p.d - 1) / (days - 1) * 292, y: seedY(p.key), ...p }));
      for (let i = 1; i < P.length; i++) svg += `<line x1="${P[i - 1].x}" y1="${P[i - 1].y}" x2="${P[i].x}" y2="${P[i].y}" class="cs-line"/>`;
      P.forEach((p, i) => {
        const r = 2.2 + p.e / 100 * 2.6;
        svg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${MOODCOL[p.m]}" class="cs-star" style="animation-delay:${(i % 7) * 0.4}s"><title>${p.d}: ${MOODS[p.m]}</title></circle>`;
      });
      svg += `</svg>`;
      box.innerHTML = svg +
        (pts.length
          // 🟡 11.08 (обиколка като майка): при първата минутка пишеше
          //    „1 звезди този месец“ — първото изречение, което мама вижда
          //    след като си е отделила време, беше сгрешено.
          ? `<p class="cs-note">${pts.length} ${pts.length === 1 ? 'звезда' : 'звезди'} този месец. ${pts.length >= days - 2 ? 'Цяло небе! ✨' : 'Всяка минутка пали нова. ✨'}</p>`
          : '<p class="jr-privacy">Тук ще растат звездите ти. Първата е на една минутка разстояние. ✨</p>');
      // проход 4: звездите тап-достъпни на телефон (title е само desktop hover) —
      // тап отваря малко балонче с деня, личицето и думата, която е записала.
      // 👆 12.08 (мерено): прозрачните кръгчета .cs-hit излизаха 15.2×15.4 px.
      //    Петнайсет пиксела. Точно картата, чийто коментар обещава „тап-достъпни
      //    на телефон“, имаше най-малката цел в целия файл. И не се лекува с
      //    по-голям радиус: 31 дни на 292 единици = ~9.7 единици между звездите,
      //    тоест 44px кръгове биха се изяли един друг. Затова целта е ЦЯЛОТО небе
      //    (298×158 px) и се пали НАЙ-БЛИЗКАТА звезда — няма мъртва зона и
      //    неточният пръст хваща съседката, вместо нищо.
      const bubble = el('p', 'cs-bubble'); bubble.hidden = true; box.appendChild(bubble);
      const sky = box.querySelector('.cs-svg');
      if (sky) sky.addEventListener('click', ev => {
        const r = sky.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const vx = (ev.clientX - r.left) / r.width * 320, vy = (ev.clientY - r.top) / r.height * 170;
        if (!P.length) { bubble.textContent = 'Небето още е празно — първата звезда се пали в „Как си днес“. ✨'; bubble.hidden = false; return; }
        let best = P[0], bd = Infinity;
        P.forEach(p => { const d = (p.x - vx) * (p.x - vx) + (p.y - vy) * (p.y - vy); if (d < bd) { bd = d; best = p; } });
        bubble.innerHTML = `<strong>${best.d}-и</strong> ${MOODS[best.m]}${best.w ? ' · „' + esc(best.w) + '“' : ''}`;
        bubble.hidden = false; if (window.BL_FX) BL_FX.buzz(5);
      });
    }
    // 🔇 12.08 (мерено с натискане): „→“ на текущия месец не правеше НИЩО —
    //    нито надписът, нито небето се сменяха. А „←“ вървеше назад безкрайно:
    //    стигнах до юли 2025 г. — месеци отпреди приложението, отпреди бебето.
    //    Назад има дъно (първата ѝ записана звезда), напред има таван (днес).
    prev.addEventListener('click', () => {
      const cks = load('bl_checkins', {});
      const пръв = Object.keys(cks).sort()[0];
      let таван = 24;
      if (пръв) {
        const d = new Date(пръв + 'T12:00'), сега = new Date();
        таван = (сега.getFullYear() - d.getFullYear()) * 12 + (сега.getMonth() - d.getMonth());
      }
      if (off >= Math.max(1, таван)) { hint(nav, пръв ? 'Дотук стигат звездите ти — по-назад още не си писала. 💜' : 'Още няма записани месеци назад. Първата звезда е на една минутка. ✨'); return; }
      clearHint(nav); off++; draw();
    });
    next.addEventListener('click', () => {
      if (off === 0) { hint(nav, 'Това е този месец — напред са дните, които тепърва идват. 💜'); return; }
      clearHint(nav); off--; draw();
    });
    draw();
    // 🔴 12.08 (известният клас, находка 6): картата чете bl_checkins ВЕДНЪЖ, при
    //    рисуване — а „💜 Как си днес?“ е ВТОРАТА карта в СЪЩАТА стая, двайсет и
    //    две карти по-горе. Мерено наживо: записах настроение и дума през
    //    истинската карта, после погледнах тук — „11 звезди“ (без новата) и
    //    облакът без новата дума. Мама записва горе, слиза долу и вижда, че я
    //    няма. Няма събитие bl:checkin (rooms.js не го праща), затова се
    //    пречертава, щом bl_checkins се смени (виж свежо() горе).
    свежо(c, 'bl_checkins', draw);
    return c;
  }

  // ☁️ Облакът от думи — думите на деня порастват
  function wordCloudCard() {
    const c = card('Годината ти в думи ☁️ <span class="jr-sub">думите от минутките ти растат тук</span>');
    const хол = el('div', 'wc-hold');
    c.appendChild(хол);
    // 🔴 12.08 (същият клас като съзвездието, мерено наживо): написах „най-новата
    //    дума“ в „Как си днес“ — картата е в СЪЩАТА стая — и облакът тук си
    //    остана със старите пет думи. Пречертава се, щом bl_checkins се смени.
    рисувай();
    свежо(c, 'bl_checkins', рисувай);
    return c;

    function рисувай() {
    хол.innerHTML = '';
    const cks = load('bl_checkins', {});
    const freq = {};
    Object.values(cks).forEach(r => { const w = ((r && r.w) || '').trim().toLowerCase(); if (w) freq[w] = (freq[w] || 0) + 1; });
    const words = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 40);
    if (!words.length) { хол.appendChild(el('p', 'jr-privacy', 'Пиши по една дума на ден в „Как си днес“ — тук ще порасне облакът на годината ти. ☁️')); return; }
    const cloud = el('div', 'wc-cloud');
    const max = words[0][1];
    words.forEach(([w, n], i) => {
      const s = el('span', 'wc-w', esc(w));
      s.style.fontSize = (13 + (n / max) * 15) + 'px';
      // 05.08 (одит г06, №89): тук стоеше MOODCOL — палитрата на ЗВЕЗДИТЕ, правена
      // за тъмното небе (.cs-sky). Върху бялата карта най-редките думи излизаха с
      // контраст ~1.7:1 при праг 4.5. И понеже цветът е inline, никоя тема не
      // можеше да го оправи. Никой ЕДИН твърд цвят не става и за двете теми
      // (сметката е взаимно изключваща се), затова ползваме темовите променливи —
      // те се сменят с режима. Честотата и без това се чете от font-size горе.
      s.style.color = (i % 2) ? 'var(--ink-soft)' : 'var(--ink)';
      // 📱 12.08: `title` е подсказка при посочване с мишка — на телефон НЕ се
      //    показва никога. Броят живееше само за настолен потребител. Голямата
      //    буква вече го казва на око; за четеца и за яснота го казваме и с думи.
      s.title = window.BL_BROI ? BL_BROI(n, 'път', 'пъти') : n + ' ' + (n === 1 ? 'път' : 'пъти');
      s.setAttribute('aria-label', esc(w) + ' — ' + n + (n === 1 ? ' път' : ' пъти'));
      cloud.appendChild(s);
    });
    хол.appendChild(cloud);
    // тихото обобщение вместо няма-къде-да-се-докосне: най-честата дума с число
    if (max > 1) хол.appendChild(el('p', 'cs-note', `Най-често: <strong>${esc(words[0][0])}</strong> — ${max} пъти. 💜`));
    }
  }

  // 📸 Снимка на деня — една, без филтри
  function dayPhotoCard() {
    const c = card('Снимка на деня 📸 <span class="jr-sub">една на ден — става лента на месеца</span>');
    const photos = load('bl_dayphoto', {});
    const t = today();
    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    const slot = el('button', 'dp-today'); slot.type = 'button';
    const strip = el('div', 'dp-strip');
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      BL_EXPR.shrinkImage(f, 340, url => {
        photos[t] = url;
        if (!save('bl_dayphoto', photos)) { delete photos[t]; fx().cheer('Паметта се напълни — изтрий стара снимка. 😕'); }
        else { save('bl_photo_day', t); fx().buzz(12); fx().confetti(slot, 14); if (window.refreshToday) refreshToday(); }
        draw();
      });
      file.value = '';
    });
    function draw() {
      slot.innerHTML = photos[t]
        ? `<img src="${photos[t]}" alt="днес"><span>днес ✓ (смени?)</span>`
        : '<span class="dp-plus">+</span><span>снимката на днешния ден</span>';
      strip.innerHTML = '';
      const keys = Object.keys(photos).sort().reverse().filter(k => k !== t).slice(0, 8);
      keys.forEach(k => {
        const b = el('button', 'dp-cell'); b.type = 'button';
        b.innerHTML = `<img src="${photos[k]}" alt=""><span>${k.slice(8)}.${k.slice(5, 7)}</span>`;
        b.addEventListener('click', () => {
          (window.BL_UI ? BL_UI.confirm('Да изтрия ли снимката от ' + k + '?', { emoji: '📸', okText: 'Изтрий', cancelText: 'Остави', danger: true }) : Promise.resolve(confirm('Да изтрия ли снимката от ' + k + '?'))).then(да => { if (да) { delete photos[k]; save('bl_dayphoto', photos); draw(); } });
        });
        strip.appendChild(b);
      });
    }
    slot.addEventListener('click', () => file.click());
    c.appendChild(slot); c.appendChild(file); c.appendChild(strip);
    // 05.08 (одит г06, №94): текстът обещаваше „дълго докосване", а слушателят
    // горе е обикновен click → мама чукваше стара снимка, за да я види, и ѝ
    // изскачаше „Да изтрия ли…". Текстът казва каквото кодът наистина прави.
    c.appendChild(el('p', 'jr-privacy', '🔒 Смалени, само на телефона ти. Докосни стара снимка — питам, преди да я изтрия.'));
    draw();
    return c;
  }

  // 💌 Писма между нас — мама и тати си пишат
  function lettersCard() {
    // 🟠 11.08 (обиколка като майка, Дневник): картата е изцяло построена
    //    върху „тати“ — чип „🧢 тати“, „тайното място на мама и тати“.
    //    Приложението вече ПИТА веднъж има ли кой да помага (rooms9.js) и
    //    уважава отговора в Бременност; тук не го четеше. Жена, натиснала
    //    „🤍 Сама съм“, отваряше СВОЯ дневник и намираше карта за човек,
    //    когото го няма. Същият флаг, същото уважение.
    if (load('bl_partner', '') === 'не') return null;
    const c = card('Писма между нас 💌 <span class="jr-sub">тайното място на мама и тати</span>');
    const items = load('bl_letters', []);
    let who = 'мама';
    const whoRow = el('div', 'jr-quick');
    [['мама', '🌸 мама'], ['тати', '🧢 тати']].forEach(([v, lb], i) => {
      const b = el('button', 'jr-chip' + (i === 0 ? ' on' : ''), lb); b.type = 'button';
      b.addEventListener('click', () => { whoRow.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); who = v; });
      whoRow.appendChild(b);
    });
    const ta = el('textarea', 'jr-paper'); ta.rows = 2; ta.placeholder = 'Напиши нещо мило… (ще го намери тук)';
    ta.dataset.draft = 'bl_draft_letters';
    ta.value = load('bl_draft_letters', '');
    const send = el('button', 'jr-btn', 'Остави писмото 💌'); send.type = 'button';
    const thread = el('div', 'lt-thread');
    send.addEventListener('click', () => {
      const v = ta.value.trim();
      // 🔇 12.08 (мерено): празно/само интервали → бутонът правеше нула промяна.
      if (!v) { nudge(send, 'Още е празно — напиши едно изречение и го оставям тук. 💌', ta); return; }
      clearHint(send);
      items.push({ who, t: v, ts: Date.now() });
      save('bl_letters', items.slice(-60)); save('bl_draft_letters', '');
      ta.value = ''; fx().buzz(12); draw();
      tick(send, 'Оставено ✔');
    });
    function draw() {
      thread.innerHTML = items.length ? '' : '<p class="jr-privacy">Първото писмо чака. Може да е само „обичам ни“. 💌</p>';
      items.slice(-12).forEach(m => {
        const row = el('div', 'lt-row ' + (m.who === 'мама' ? 'lt-mama' : 'lt-tati'));
        row.innerHTML = `<div class="lt-bub"><span class="lt-who">${m.who === 'мама' ? '🌸 мама' : '🧢 тати'}</span>${esc(m.t)}<span class="lt-d">${dstr(m.ts)}</span></div>`;
        thread.appendChild(row);
      });
    }
    c.appendChild(whoRow); c.appendChild(ta); c.appendChild(send); c.appendChild(thread);
    draw();
    return c;
  }

  // ═══════════════ 🤰 БРЕМЕННОСТ (Н4) ═══════════════

  function pregWeek() {
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (!lmp) return null;
    const days = Math.floor((Date.now() - new Date(lmp)) / 86400000);
    const w = Math.floor(days / 7);
    return (w >= 1 && w <= 45) ? w : null;
  }

  // 📈 Наддаването — мека крива, без кантар-терор
  function pregWeightCard() {
    // 🤍 29.07 (обиколка): expect.js е писан ТОЧНО за да спре тези карти
    //    след загуба, но пазачът стоеше само на symptomCard. Жена, натиснала
    //    „Спри тихо броенето“, продължаваше да бъде посрещана с „чакаме него“.
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Дневник на наддаването 📈 <span class="jr-sub">меко, без терор от кантара</span>');
    const items = load('bl_pregw', []);
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.type = 'number'; inp.step = '0.1'; inp.placeholder = 'кг днес…';
    const add = el('button', 'jr-chip', '+ Запиши'); add.type = 'button';
    row.appendChild(inp); row.appendChild(add);
    const box = el('div', 'pw-box');
    // ↩ 12.08: грешна цифра (86 вместо 68) нямаше как да се махне — никъде в
    //    картата нямаше изтриване. Кривата оставаше изкривена завинаги, а точно
    //    тази карта обещава „меко, без терор от кантара“. Връщането е евтино:
    //    последният запис, докато е още последният.
    const undo = el('button', 'jr-chip', '↩ Върни последното'); undo.type = 'button'; undo.hidden = true;
    undo.addEventListener('click', () => {
      const cur = load('bl_pregw', []);
      if (!cur.length) { hint(row, 'Няма какво да върна — списъкът е празен. 💜'); return; }
      const махнат = cur.pop(); save('bl_pregw', cur);
      items.length = 0; cur.forEach(x => items.push(x));
      clearHint(row); fx().buzz(8); draw();
      hint(row, 'Върнах записа ' + махнат.kg + ' кг. 💜');
    });
    add.addEventListener('click', () => {
      const v = parseFloat(inp.value);
      if (isNaN(v) || v < 30 || v > 200) { nudge(row, inp.value.trim() ? 'Провери числото — това е в кг (напр. 68).' : 'Напиши колко показва кантарът в кг (напр. 68).', inp); return; }
      clearHint(row);
      items.push({ d: today(), kg: v, w: pregWeek() });
      save('bl_pregw', items.slice(-60)); inp.value = ''; fx().buzz(10); draw();
      tick(add, '✔ Записано');
    });
    function draw() {
      undo.hidden = !items.length;
      if (!items.length) { box.innerHTML = '<p class="jr-privacy">Записвай колкото често ИСКАШ — кривата е за теб, не ти за нея. 🤍</p>'; return; }
      const last = items.slice(-14);
      const min = Math.min(...last.map(x => x.kg)) - 1, max = Math.max(...last.map(x => x.kg)) + 1;
      const X = i => 16 + i / Math.max(1, last.length - 1) * 288, Y = v => 96 - (v - min) / (max - min) * 78;
      let svg = `<svg viewBox="0 0 320 110" class="pw-svg">`;
      svg += `<polyline points="${last.map((p, i) => X(i) + ',' + Y(p.kg)).join(' ')}" class="pw-line"/>`;
      last.forEach((p, i) => { svg += `<circle cx="${X(i)}" cy="${Y(p.kg)}" r="3" class="pw-dot"><title>${p.d}: ${p.kg} кг</title></circle>`; });
      svg += `</svg>`;
      const d = items.length > 1 ? (items[items.length - 1].kg - items[0].kg).toFixed(1) : null;
      box.innerHTML = svg + `<p class="cs-note">Последно: <strong>${items[items.length - 1].kg} кг</strong>${d !== null ? ' · общо ' + (d > 0 ? '+' : '') + d + ' кг' : ''}. Тялото ти строи човек — има право на килограми. 💜</p>`;
    }
    c.appendChild(row); c.appendChild(box); c.appendChild(undo); draw();
    return c;
  }

  // 🌸 Симптоми по седмици
  const SYMPTOMS = ['🤢 гадене', '🔥 парене', '🦴 болки в кръста', '💤 безсъние', '🦵 отоци', '🤕 главоболие', '😋 апетит-чудо', '⚡ енергия', '🥱 умора', '🤧 запушен нос'];
  function symptomCard() {
    // на пауза (загуба) НЕ приканваме за нови дати — това е точно повторното
    // нараняване, което паузата съществува да спре (одит-флот П23, находка 3)
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Как е тази седмица? 🌸 <span class="jr-sub">отбележи — Мила ще помни</span>');
    const w = pregWeek();
    // 05.08 (одит г06, №223): пращаше към „календара горе“ — а картата „Кога е
    // терминът?“ е точно при това условие изтрита от preg20.js:459, за да не
    // дублира поканата. Сочехме към празно място. Сега сочим към поканата.
    // 🔴 05.08 (СКЕПТИКЪТ към №223): поправката сочеше към поканата ВИНАГИ, а
    //    поканата се вмъква само когато няма дата (preg20.js:486-490). При
    //    записана, но нескопосана дата (w извън 1–45) pregWeek() пак връща null
    //    — и новият текст пращаше мама към карта, която я няма. Точно този
    //    случай rooms18.js:90 вече го казва вярно: поправя се в „Кога е
    //    терминът? 🗓️“, която при налична дата НЕ се маха (preg20.js:500).
    if (!w) {
      const имаДата = !!(window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', ''));
      // 🔴 11.08 (възрастови порти): третият случай — мама, която ВЕЧЕ Е РОДИЛА.
      //    Тогава preg20.js не вмъква поканата (пазачът ѝ е `!роди()`, ред 496)
      //    И маха „Кога е терминът? 🗓️“ (ред 508, пазач `!lmp()`), тоест и двете
      //    карти, към които сочим по-долу, ги няма на екрана. Майка на
      //    петдневно (и на двегодишно) четеше „кажи ми последната менструация
      //    в поканата най-горе“ и тръгваше да търси карта, която не съществува.
      const родила = (() => { try { return !!(JSON.parse(localStorage.getItem('bl_baby') || '{}').birth); } catch (e) { return false; } })();
      c.appendChild(el('p', 'jr-privacy', имаДата
        ? 'Записаната дата не се връзва — по нея излизаш извън първите 45 седмици. Поправи я в „Кога е терминът? 🗓️“ и седмиците тръгват. 🗓️'
        : родила
          ? 'Това е страница от чакането — оставям я тук за спомен. Дните му отсега нататък ги броим в „Моето бебе“. 🤍'
          : 'Кажи ми първия ден на последната менструация в поканата най-горе — и седмиците тръгват. 🗓️'));
      return c;
    }
    c.appendChild(el('p', 'cs-note', `Седмица <strong>${w}</strong>:`));
    const data = load('bl_pregsym', {});
    const cur = new Set(data[w] || []);
    const grid = el('div', 'jr-quick sy-grid');
    SYMPTOMS.forEach(s => {
      const b = el('button', 'jr-chip' + (cur.has(s) ? ' on' : ''), s); b.type = 'button';
      b.addEventListener('click', () => {
        if (cur.has(s)) cur.delete(s); else { cur.add(s); fx().buzz(8); }
        b.classList.toggle('on');
        data[w] = [...cur]; save('bl_pregsym', data);
      });
      grid.appendChild(b);
    });
    c.appendChild(grid);
    const hist = Object.keys(data).map(Number).sort((a, b) => b - a).filter(x => x !== w && data[x].length).slice(0, 3);
    if (hist.length) {
      const h = el('div', 'sy-hist');
      hist.forEach(hw => h.appendChild(el('p', 'sy-hrow', `<strong>седм. ${hw}:</strong> ${data[hw].join(' · ')}`)));
      c.appendChild(h);
    }
    return c;
  }

  // 🤰 Bump-фото лента по седмици
  function bumpCard() {
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Коремчето по седмици 🤰 <span class="jr-sub">лентата на чакането</span>');
    const photos = load('bl_bump', {});
    const w = pregWeek() || 20;
    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    let target = w;
    const grid = el('div', 'pho-grid');
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      BL_EXPR.shrinkImage(f, 340, url => {
        photos[target] = url;
        if (!save('bl_bump', photos)) { delete photos[target]; fx().cheer('Паметта се напълни. 😕'); }
        else fx().buzz(12);
        draw();
      });
      file.value = '';
    });
    function draw() {
      grid.innerHTML = '';
      for (let wk = 4; wk <= Math.min(42, w + 1); wk += 2) {
        const cell = el('button', 'pho-cell'); cell.type = 'button';
        if (photos[wk]) {
          cell.innerHTML = `<img src="${photos[wk]}" alt=""><span class="pho-m">${wk} с.</span>`;
          cell.addEventListener('click', () => { (window.BL_UI ? BL_UI.confirm('Изтриване на седмица ' + wk + '?', { emoji: '🤰', okText: 'Изтрий', cancelText: 'Остави', danger: true }) : Promise.resolve(confirm('Изтриване на седмица ' + wk + '?'))).then(да => { if (да) { delete photos[wk]; save('bl_bump', photos); draw(); } }); });
        } else {
          cell.classList.add('empty');
          cell.innerHTML = `<span class="pho-plus">+</span><span class="pho-m">${wk} с.</span>`;
          cell.addEventListener('click', () => { target = wk; file.click(); });
        }
        grid.appendChild(cell);
      }
    }
    c.appendChild(file); c.appendChild(grid);
    c.appendChild(el('p', 'jr-privacy', '🔒 През седмица — точно колкото да се види чудото.'));
    draw();
    return c;
  }

  // 📜 План за раждане — чеклист + печат
  const BIRTH_ITEMS = ['Партньорът да е с мен в залата', 'Кожа до кожа веднага след раждането', 'Тати да пререже пъпната връв', 'Без снимки от персонала', 'Кърмене в първия час', 'Тиха музика / собствен плейлист', 'Минимум шум и светлина', 'Обяснявайте ми какво правите'];
  // 🟠 11.08 (обиколка „приемането за дадено“): два от осемте реда назоваваха
  //    човек, когото може да го няма — „Партньорът“ и „Тати“. Жена, натиснала
  //    „🤍 Сама съм“ (или такава, чийто човек е партньорка, майка, сестра),
  //    намираше на ЛИСТА ЗА БОЛНИЦАТА две желания, адресирани до някой друг.
  //    Самото желание е нейно и остава — сменя се само на кого сочи.
  //    ⚠️ Текстът на реда е КЛЮЧ в `bl_birthplan` (`state[it]`), затова ключовете
  //    НЕ се пипат: сменя се единствено това, което мама чете и печата. Така
  //    вече отметнатите редове си остават отметнати.
  //    ПЪТ НАЗАД: махаш `ЕТИКЕТИ` и `етикет()` — редовете пак изписват старото.
  const ЕТИКЕТИ = {
    'Партньорът да е с мен в залата': 'Човекът, когото избера, да е с мен в залата',
    'Тати да пререже пъпната връв': 'Пъпната връв да пререже човекът, който е с мен'
  };
  const етикет = it => ЕТИКЕТИ[it] || it;
  function birthPlanCard() {
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('План за раждане 📜 <span class="jr-sub">желанията ти — на лист за болницата</span>');
    const state = load('bl_birthplan', {});
    const wrap = el('div', 'jr-wins');
    const свои = load('bl_birthplan_custom', []);
    const items = BIRTH_ITEMS.concat(свои);
    items.forEach((it, i) => {
      const мое = i >= BIRTH_ITEMS.length;
      const r = el('div', 'jr-win' + (state[it] ? ' done' : ''));
      const t = el('button', 'jr-winbtn'); t.type = 'button';
      t.style.cssText = 'flex:1;min-width:0;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;font:inherit;color:inherit;padding:0;min-height:44px;cursor:pointer;';
      t.innerHTML = `<span class="jr-check">${state[it] ? '✔' : ''}</span> ${esc(етикет(it))}`;
      t.setAttribute('aria-pressed', state[it] ? 'true' : 'false');
      t.addEventListener('click', () => {
        state[it] = !state[it]; save('bl_birthplan', state);
        r.classList.toggle('done'); t.querySelector('.jr-check').textContent = state[it] ? '✔' : '';
        t.setAttribute('aria-pressed', state[it] ? 'true' : 'false');
        fx().buzz(8);
      });
      r.appendChild(t);
      // 🔴 12.08 (мерено: 0 бутона за изтриване): своята точка се пишеше веднъж и
      //    оставаше ЗАВИНАГИ — и на листа за болницата. Печатна грешка в „Искам
      //    да ходя докато мога“ нямаше как да се поправи. Същият дефект вече беше
      //    намерен и оправен в „Алергия-паспорт“ (одит г06, №211); тук беше
      //    останал. ПЪТ НАЗАД: махаш този блок — точките пак стават вечни.
      if (мое) {
        const x = wide(el('button', 'jr-x', '✕')); x.type = 'button';
        x.style.minHeight = '44px';
        x.setAttribute('aria-label', 'Махни моята точка „' + it + '“ от плана');
        x.addEventListener('click', () => {
          (window.BL_UI ? BL_UI.confirm('Да махна ли „' + it + '“ от плана?', { emoji: '📜', okText: 'Махни', cancelText: 'Остави', danger: true }) : Promise.resolve(confirm('Да махна ли „' + it + '“?'))).then(да => {
            if (!да) return;
            const cur = load('bl_birthplan_custom', []);
            const k = cur.indexOf(it); if (k > -1) cur.splice(k, 1);
            save('bl_birthplan_custom', cur);
            delete state[it]; save('bl_birthplan', state);
            c.replaceWith(birthPlanCard());
          });
        });
        r.appendChild(x);
      }
      wrap.appendChild(r);
    });
    c.appendChild(wrap);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'своя точка…'; inp.maxLength = 60;
    const add = wide(el('button', 'jr-chip', '+')); add.type = 'button';
    // ♿ 11.08 (клавиатура-четец): голият „+" не казваше в кой списък добавя.
    add.setAttribute('aria-label', 'Добави своята точка в плана за раждане');
    const добави = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Напиши какво искаш ти — то влиза на листа за болницата. 📜', inp); return; }
      const cus = load('bl_birthplan_custom', []);
      // и по видимия етикет — иначе мама преписва реда, който ЧЕТЕ, и той влиза втори път
      if (items.some(x => x.toLowerCase() === v.toLowerCase() || етикет(x).toLowerCase() === v.toLowerCase())) { nudge(addRow, 'Тази точка вече е в списъка. 💜', inp); return; }
      cus.push(v); save('bl_birthplan_custom', cus);
      inp.value = ''; fx().buzz(8); c.replaceWith(birthPlanCard());
    };
    add.addEventListener('click', добави);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добави(); } });
    addRow.appendChild(inp); addRow.appendChild(add); c.appendChild(addRow);
    const pr = el('button', 'jr-btn', '🖨️ Лист за болницата'); pr.type = 'button';
    pr.addEventListener('click', () => {
      const chosen = items.filter(it => state[it]);
      const mother = getBaby();
      BL_EXPR.printOverlay('План за раждане',
        `<p class="pr-big">Моите желания за раждането:</p>
         <ul class="pr-list">${(chosen.length ? chosen : items).map(x => `<li>${esc(етикет(x))}</li>`).join('')}</ul>
         <p class="pr-note">Благодаря ви, че се съобразявате, когато е възможно. 💜</p>`);
    });
    c.appendChild(pr);
    return c;
  }

  // 💌 Писмо до бебето — отключва се на рождения ден
  function letterToBabyCard() {
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Писмо до бебето 💌 <span class="jr-sub">пишеш сега — то го „получава“, когато дойде</span>');
    const letter = load('bl_letter_baby', null);
    const baby = getBaby();
    const born = !!baby.birth;
    if (letter && born) {
      c.appendChild(el('div', 'lb-open', `<p class="lb-txt">${esc(letter.t)}</p><p class="lb-d">— писано на ${dstr(letter.ts)}, преди да се родиш 💜</p>`));
      return c;
    }
    if (letter) {
      c.appendChild(el('p', 'pr-done pr-locked', `Писмото е запечатано 💌 (${dstr(letter.ts)}). Отваря се, когато бебето дойде и попълниш рождената дата.`));
      const re = el('button', 'jr-chip', '✍️ Пиши още'); re.type = 'button';
      // 🚨 22.07 (армия, RED): този бутон ТРИЕШЕ запечатаното писмо. Надписът
      //   обещава дописване, а `save('bl_letter_baby', null)` изтриваше текста
      //   безвъзвратно — черновата вече е изчистена при запечатването, никой
      //   друг не пази копие. Мама щеше да загуби писмото до бебето си с едно
      //   докосване. Сега старият текст се ВРЪЩА в полето, за да го продължи.
      re.addEventListener('click', () => {
        const старо = letter.t || '';
        save('bl_draft_letterbaby', старо);      // текстът я чака в полето
        save('bl_letter_baby', null);
        c.replaceWith(letterToBabyCard());
      });
      c.appendChild(re);
      return c;
    }
    const ta = el('textarea', 'jr-paper'); ta.rows = 4; ta.placeholder = 'Мило мое… (какво искаш да знае за времето, когато те чакахме?)';
    ta.dataset.draft = 'bl_draft_letterbaby'; ta.value = load('bl_draft_letterbaby', '');
    const btn = el('button', 'jr-btn', 'Запечатай писмото 💌'); btn.type = 'button';
    btn.addEventListener('click', () => {
      const v = ta.value.trim();
      // 🔇 12.08 (мерено): празно поле → бутонът не правеше нищо и не казваше нищо.
      if (!v) { nudge(btn, 'Още е празно. Може да е само едно изречение — то ще му стигне. 💌', ta); return; }
      clearHint(btn);
      save('bl_letter_baby', { t: v, ts: Date.now() }); save('bl_draft_letterbaby', '');
      fx().confetti(btn); fx().cheer('Запечатано с обич 💌');
      c.replaceWith(letterToBabyCard());
    });
    c.appendChild(ta); c.appendChild(btn);
    return c;
  }

  // 🗳️ Изборът на име
  function namesCard() {
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    // 🟠 11.08 (обиколка като майка): подзаглавието беше „мама и тати гласуват“,
    //    а второто копче — 🧢. Жена, която чака сама (или не с „тати“), отваряше
    //    карта, направена за двойка. Гласовете си остават два — просто вече не
    //    казваме КОЙ е вторият. Ключовете m/t не се пипат: записаното остава.
    const c = card('Изборът на име 🗳️ <span class="jr-sub">два гласа — твоят и на когото решиш</span>');
    const items = load('bl_names_vote', []);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'име-кандидат…'; inp.maxLength = 20;
    const add = el('button', 'jr-chip', '+ Добави'); add.type = 'button';
    addRow.appendChild(inp); addRow.appendChild(add);
    const list = el('div', 'nm-list');
    const добавиИме = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Напиши име първо. 💜', inp); return; }
      if (items.some(x => x.n.toLowerCase() === v.toLowerCase())) { nudge(addRow, 'Това име вече е горе. 💜', inp); return; }
      clearHint(addRow);
      items.push({ n: v, m: 0, t: 0 }); save('bl_names_vote', items); inp.value = ''; fx().buzz(8); draw();
    };
    add.addEventListener('click', добавиИме);
    // 12.08: на телефон клавиатурата дава „Готово/Enter“ — то не правеше нищо тук.
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добавиИме(); } });
    function draw() {
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Добавете кандидатите — и нека сърцата решат. 💜</p>';
      const подредени = items.slice().sort((a, b) => (b.m + b.t) - (a.m + a.t));
      подредени.forEach((it, място) => {
        const row = el('div', 'nm-row');
        // Б8.5: водещото име носи коронка — гласуването значи нещо
        const корона = място === 0 && (it.m + it.t) > 0 ? ' 👑' : '';
        row.innerHTML = `<strong class="nm-name">${esc(it.n)}${корона}</strong>
          <button class="nm-vote" data-w="m" type="button" aria-label="Първи глас за „${esc(it.n)}“">🌸 ${+it.m || 0}</button>
          <button class="nm-vote" data-w="t" type="button" aria-label="Втори глас за „${esc(it.n)}“">💙 ${+it.t || 0}</button>
          <button class="nt-del" type="button" aria-label="Махни името „${esc(it.n)}“">🗑</button>`;
        // 👆 12.08 (мерено 44.6×40.4): touch.css вдига .nm-vote само до 40.
        row.querySelectorAll('.nm-vote').forEach(b => { b.style.minHeight = '44px'; b.style.minWidth = '44px'; });
        row.querySelectorAll('.nm-vote').forEach(b => b.addEventListener('click', () => {
          // броячът НЕ бива да зацикля на 6-то докосване (одит-флот П23, проход
          // 2 №16): 6-ти глас връщаше на 0 и короната скачаше тихо на друго име
          it[b.dataset.w] = Math.min((+it[b.dataset.w] || 0) + 1, 99); save('bl_names_vote', items); fx().buzz(8);
          // Б8.5: сърцето прескача един удар — после списъкът се преподрежда
          b.classList.add('nm-beat');
          setTimeout(() => draw(), 240);
        }));
        row.querySelector('.nt-del').addEventListener('click', () => { items.splice(items.indexOf(it), 1); save('bl_names_vote', items); draw(); });
        list.appendChild(цели(row));
      });
    }
    c.appendChild(addRow); c.appendChild(list); draw();
    return c;
  }

  // 🎶 Плейлист за коремчето
  function playlistCard() {
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Музика за коремчето 🎶 <span class="jr-sub">песните, с които те чакахме</span>');
    const items = load('bl_playlist', []);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'песен / изпълнител…'; inp.maxLength = 60;
    const add = wide(el('button', 'jr-chip', '+')); add.type = 'button';
    add.setAttribute('aria-label', 'Добави песента в списъка');
    addRow.appendChild(inp); addRow.appendChild(add);
    const list = el('div', 'nt-list');
    // 🔇 12.08 (мерено): празно поле → нула промяна в списъка, нула в паметта.
    //    И Enter не работеше — само тапът по „+“.
    const добави = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Коя песен? Стига и само „Ave Maria“. 🎵', inp); return; }
      clearHint(addRow);
      items.push({ t: v, d: Date.now() }); save('bl_playlist', items); inp.value = ''; fx().buzz(8); draw();
    };
    add.addEventListener('click', добави);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добави(); } });
    function draw() {
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Първата песничка? Бебето слуша от ~16-та седмица. 🎵</p>';
      items.slice().reverse().forEach((it, ri) => {
        const idx = items.length - 1 - ri;
        const row = el('div', 'nt-row');
        row.innerHTML = `<div class="nt-txt">🎵 ${esc(it.t)}</div><div class="nt-meta"><span>${dstr(it.d)}</span><button class="nt-del" type="button" aria-label="Махни „${esc(it.t)}“ от списъка">🗑</button></div>`;
        row.querySelector('.nt-del').addEventListener('click', () => { items.splice(idx, 1); save('bl_playlist', items); draw(); });
        list.appendChild(цели(row));
      });
    }
    c.appendChild(addRow); c.appendChild(list); draw();
    return c;
  }

  // ═══════════════ 🍼 МОЕТО БЕБЕ (Н5) ═══════════════

  // 🤱 Кърмене-таймер
  function nursingCard() {
    const c = card('Кърмене-таймер 🤱 <span class="jr-sub">ляво/дясно + колко време — помни вместо теб</span>');
    const disp = el('div', 'nr-disp', '00:00');
    const row = el('div', 'jr-quick');
    const state = load('bl_nursing_open', null); // {side, t0}
    let openS = state;
    let tick = null;
    const btns = {};
    [['Л', '🤱 Ляво'], ['Д', '🤱 Дясно'], ['Ш', '🍼 Шише']].forEach(([v, lb]) => {
      const b = el('button', 'jr-chip', lb); b.type = 'button';
      btns[v] = b;
      b.addEventListener('click', () => {
        if (openS && openS.side === v) { stop(); return; }
        if (openS) stop();
        openS = { side: v, t0: Date.now() };
        save('bl_nursing_open', openS);
        каз.textContent = 'Тръгна ' + lb.replace(/^\S+\s/, '') + ' — докосни пак за стоп.';
        update();
      });
      row.appendChild(b);
    });
    const hist = el('div', 'nr-hist');
    const каз = el('p', 'jr-hint'); // тихият ред „какво стана“ под таймера
    function stop() {
      const dur = Math.round((Date.now() - openS.t0) / 1000);
      const items = load('bl_nursing', []);
      if (dur > 20) {
        items.push({ s: openS.side, dur, ts: openS.t0 });
        save('bl_nursing', items.slice(-60));
        save('bl_feed', { t: openS.t0, s: openS.side === 'Л' ? 'left' : openS.side === 'Д' ? 'right' : 'bottle' });
        fx().buzz(12);
        каз.textContent = '✔ Записах ' + fmt(dur) + '.';
      } else {
        // 🔇 12.08 (мерено): стоп под 20 сек връщаше таймера на 00:00 и МЪЛЧЕШЕ.
        //    Правилото си стои (случайно докосване), но мама заслужава да ѝ се
        //    каже защо записът го няма — иначе решава, че таймерът е счупен.
        каз.textContent = 'Само ' + dur + ' сек — не го записах (пазя те от случайно докосване).';
        fx().buzz(6);
      }
      openS = null; save('bl_nursing_open', null);
      update(); drawHist();
    }
    // над един час „210:17“ не се чете като 3 часа и половина — часовете
    // излизат отпред, както на всеки часовник
    function fmt(sec) {
      const ч = Math.floor(sec / 3600);
      const м = Math.floor(sec / 60) % 60, с = sec % 60;
      return (ч ? ч + ':' + String(м).padStart(2, '0') : String(Math.floor(sec / 60)).padStart(2, '0'))
        + ':' + String(с).padStart(2, '0');
    }
    function update() {
      clearInterval(tick);
      Object.entries(btns).forEach(([v, b]) => b.classList.toggle('on', !!openS && openS.side === v));
      if (openS) {
        disp.classList.add('run');
        // проход 4: самочистещ се интервал — при напускане на стаята с активно
        // кърмене осиротелият таймер спираше да пише завинаги (теч + натрупване).
        tick = setInterval(() => {
          if (!disp.isConnected) { clearInterval(tick); return; }
          disp.textContent = fmt(Math.round((Date.now() - openS.t0) / 1000));
        }, 1000);
        disp.textContent = fmt(Math.round((Date.now() - openS.t0) / 1000));
      } else { disp.classList.remove('run'); disp.textContent = '00:00'; }
    }

    // 12.11.5: заключеният екран.
    // Времето само по себе си е вярно — броим от `t0`, не от тиктакане.
    // Но докато телефонът е заключен, браузърът спира тиктака и при връщане
    // мама вижда замръзнало число за секунда. Затова при връщане рисуваме
    // веднага, без да чакаме следващия тик.
    if (!document._nrVisBound) {
      document._nrVisBound = true;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        const жив = load('bl_nursing_open', null);
        const д = document.querySelector('.nr-disp');
        if (жив && д) д.textContent = fmt(Math.round((Date.now() - жив.t0) / 1000));
      });
    }
    // 🚨 Предпазителят: мама заспива с бебето — това е най-нормалното нещо
    // на света. Без него таймерът щеше да запише „кърмене 7 часа и 40 мин“
    // и да отрови статистиката ѝ завинаги.
    if (openS && (Date.now() - openS.t0) > 2 * 3600 * 1000) {
      const ч = ((Date.now() - openS.t0) / 3600000).toFixed(1);
      const пит = el('div', 'nr-forgot');
      пит.innerHTML = `<p>Таймерът върви от <strong>${ч} часа</strong>. Заспахте ли? 💜</p>`;
      const р = el('div', 'jr-quick');
      const изхвърли = el('button', 'jr-chip', '🗑️ Забрави го'); изхвърли.type = 'button';
      изхвърли.addEventListener('click', () => { openS = null; save('bl_nursing_open', null); пит.remove(); update(); });
      const остави = el('button', 'jr-chip', '✔ Не, върви си'); остави.type = 'button';
      остави.addEventListener('click', () => пит.remove());
      р.appendChild(изхвърли); р.appendChild(остави);
      пит.appendChild(р);
      c.appendChild(пит);
    }
    function drawHist() {
      const items = load('bl_nursing', []).slice(-5).reverse();
      hist.innerHTML = items.length ? '<p class="jr-weekcap">Последни:</p>' : '';
      items.forEach(it => hist.appendChild(el('p', 'nr-hrow',
        `${it.s === 'Л' ? '🤱 ляво' : it.s === 'Д' ? '🤱 дясно' : '🍼 шише'} · <strong>${fmt(it.dur)}</strong> · ${new Date(it.ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} ${dstr(it.ts)}`)));
    }
    c.appendChild(disp); c.appendChild(row); c.appendChild(каз); c.appendChild(hist);
    c.appendChild(el('p', 'jr-privacy', 'Докосни същия бутон за стоп. Под 20 сек не записваме (случайно докосване).'));
    update(); drawHist();
    return c;
  }

  // 📊 Седмицата в една картинка
  function weekPicCard() {
    const c = card('Седмицата в картинка 📊 <span class="jr-sub">пелени · хранения · настроения — с един поглед</span>');
    const box = el('div', 'wp-box');
    const dip = load('bl_diapers', {}), cks = load('bl_checkins', {}), dph = load('bl_dayphoto', {});
    // 05.08 (одит г06, №160): броеше САМО кърмене-таймера. Бързите чипове
    // („🤱 Ляво“ в „Кога яде за последно?“) пишат в bl_feed + bl_feedlog — тях
    // картинката не ги виждаше и показваше точки вместо хранения. Сливаме
    // изворите с дедуп на близнаци под 60 сек, точно както rooms2.js:339.
    const nurTs = [...load('bl_nursing', []).map(x => x && x.ts), ...load('bl_feedlog', [])]
      .filter(Boolean).sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > 60000);
    let html = '<div class="wp-grid"><div class="wp-h"></div>';
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(localDate(d)); }
    days.forEach(k => { html += `<div class="wp-h">${k.slice(8)}.${k.slice(5, 7)}</div>`; });
    html += '<div class="wp-l">💧</div>';
    days.forEach(k => { const n = dip[k] ? (dip[k].wet + dip[k].dirty) : 0; html += `<div class="wp-c">${n || '·'}</div>`; });
    html += '<div class="wp-l">🍼</div>';
    days.forEach(k => { const n = nurTs.filter(ts => localDate(new Date(ts)) === k).length; html += `<div class="wp-c">${n || '·'}</div>`; });
    html += '<div class="wp-l">💜</div>';
    days.forEach(k => { html += `<div class="wp-c">${cks[k] ? MOODS[cks[k].m] : '·'}</div>`; });
    html += '<div class="wp-l">📸</div>';
    days.forEach(k => { html += `<div class="wp-c">${dph[k] ? '●' : '·'}</div>`; });
    html += '</div>';
    box.innerHTML = html;
    c.appendChild(box);
    c.appendChild(el('p', 'jr-privacy', 'Пълни се само̀ от пелените, кърменето, „Как си днес“ и снимката на деня.'));
    return c;
  }

  // 🏆 Рекордите на бебето
  function recordsCard() {
    const c = card('Рекордите 🏆 <span class="jr-sub">малките световни първенства у дома</span>');
    const baby = getBaby();
    const recs = [];
    const nur = load('bl_nursing', []);
    if (nur.length) { const m = nur.reduce((a, x) => x.dur > a.dur ? x : a); const durTxt = m.dur >= 60 ? Math.round(m.dur / 60) + ' мин' : m.dur + ' сек'; recs.push(`🤱 Най-дълго хранене: <strong>${durTxt}</strong> (${dstr(m.ts)})`); }
    const dip = load('bl_diapers', {});
    // 🟡 11.08 (обиколка във времето): рекордът се вадеше и от ден-ключ с БЪДЕЩА
    //    дата. Измерено наживо: bl_diapers['2026-08-13'] при днешна дата 11.08 →
    //    „💧 Пелени-рекорд: 11 за ден (13.08.2026 г.)“ — рекорд, постигнат
    //    вдругиден. Нищо не се трие: щом денят дойде, рекордът си идва сам.
    //    ПЪТ НАЗАД: върни `const dk = Object.keys(dip);`.
    const днесРек = today();
    const dk = Object.keys(dip).filter(k => k <= днесРек);
    // 🟡 11.08 (обиколка във времето): датата тук излизаше сурова („2026-08-13“),
    //    а редът точно над нея пише „13.08.2026 г.“ — един и същи ден, два езика.
    //    Ключът е 'YYYY-MM-DD'; 'T12:00' пази деня при всяка часова зона.
    if (dk.length) { const m = dk.reduce((a, k) => (dip[k].wet + dip[k].dirty) > (dip[a].wet + dip[a].dirty) ? k : a); const n = dip[m].wet + dip[m].dirty; if (n) recs.push(`💧 Пелени-рекорд: <strong>${n} за ден</strong> (${dstr(new Date(m + 'T12:00').getTime())}) 😄`); }
    const teeth = load('bl_teeth', []);
    if (teeth.length) recs.push(`🦷 Зъбки на борда: <strong>${teeth.length} / 20</strong>`);
    const tried = Object.keys(load('bl_tried', {}));
    if (tried.length) recs.push(`🥄 Опитани храни: <strong>${tried.length}</strong> — смелчага!`);
    const lex = Object.keys(load('bl_baby_lexicon', {}));
    if (lex.length) recs.push(`🌟 Лексиконът: <strong>${lex.length}</strong> ${lex.length === 1 ? 'отговор-съкровище' : 'отговора-съкровища'}`);
    const walk = load('bl_walk_days', {});
    const wk = Object.keys(walk);
    if (wk.length) recs.push(`✨ Дни с мигове в Бейби Ленд: <strong>${wk.length}</strong>`);
    const ms = Object.values(load('bl_ms_done', {})).filter(Boolean).length;
    if (ms) recs.push(`🧸 Разцъфнали умения: <strong>${ms}</strong>`);
    if (!recs.length) { c.appendChild(el('p', 'jr-privacy', `Рекордите на ${esc(baby.name) || 'бебето'} се пишат сами от пелените, храненията, зъбките… Първият идва скоро! 🏆`)); return c; }
    const list = el('div', 'rc-list bl-stagger');
    recs.forEach(r => list.appendChild(el('p', 'rc-row', r)));
    c.appendChild(list);
    return c;
  }

  // ═══════════════ 🥄 ЗАХРАНВАНЕ (Н6) ═══════════════

  // 📅 Меню-планер за седмицата
  function menuCard() {
    const c = card('Меню за седмицата 📅 <span class="jr-sub">докосни ден — избери от опитаното</span>');
    const menu = load('bl_menu', {});
    // 05.08 (одит г06, №173): изборът се смяташе ВЕДНЪЖ, при строежа на картата.
    // Календарът на храните е в СЪЩАТА стая — мама отбелязваше шест храни, връщаше
    // се и изборът пак беше празен. Сега се чете при всяко отваряне на деня.
    // 🍯 11.08 (обиколка като майка на 7-месечно): собственият запис на мама носи
    //    и МЕСЕЦ — и замразените правила го коригират („Мед“ → от 12 м., виж
    //    rooms2.js:964). Менюто обаче вземаше всички „Мои“ без да гледа възрастта:
    //    същото приложение, което току-що ѝ каза „мед не се дава преди навършена
    //    1 година — никога, дори капчица“, ѝ предлагаше „Мед“ като избор за обяда
    //    на седеммесечното. Ненавършеното не се предлага тук; стои си при „Мои“ в
    //    календара и влиза в менюто, щом дойде времето. Опитаното вече (tried)
    //    остава винаги — то е нейн факт, не наша препоръка.
    const опции = () => {
      const tried = Object.keys(load('bl_tried', {}));
      const a = window.BL_AGE ? BL_AGE(getBaby().birth) : null;
      const месеци = a ? (a.devMonths != null ? a.devMonths : a.ym) : null;
      const custom = load('bl_custom_foods', [])
        .filter(f => {
          if (!f) return false;
          if (месеци == null || typeof f !== 'object' || f.from == null) return true;
          return tried.indexOf(f.n) >= 0 || f.from <= месеци + 0.5;
        })
        .map(f => (f && f.n) || f).filter(Boolean);
      return [...new Set(tried.concat(custom))];
    };
    const days = ['пон', 'вт', 'ср', 'четв', 'пет', 'съб', 'нед'];
    const mon = (() => { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; })();
    const grid = el('div', 'mn-grid');
    // 👆 12.08 (мерено в 375px телефон): mega.css дава `repeat(auto-fit,
    //    minmax(44px,1fr))` — в 311px кутия това прави 6 колони за 7 дни, тоест
    //    неделя пада сама на втори ред. По-лошото: клетките НЕ се разтягат до
    //    траковете си (бутон в грид не се stretch-ва) и се мерят по текста —
    //    „вт“ излезе 16.8 px ШИРОКА, до съседи от 47.7. Седемнайсет пиксела за
    //    пръст. Мерено с getBoundingClientRect, x=100 в трак 84.7–132.4.
    //    Четири колони × 74 px: всеки ден е еднакъв, уцелваем и има място за
    //    името на храната. ПЪТ НАЗАД: махаш двата реда стил по-долу.
    grid.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(d.getDate() + i);
      const key = localDate(d);
      const cell = el('button', 'mn-cell' + (key === today() ? ' today' : '')); cell.type = 'button';
      cell.style.width = '100%';
      const val = menu[key];
      cell.innerHTML = `<span class="mn-day">${days[i]}</span><span class="mn-val">${val ? esc(val) : '+'}</span>`;
      cell.setAttribute('aria-label', days[i] + ', ' + key.slice(8) + '.' + key.slice(5, 7) + (val ? ': ' + val : ' — още нищо'));
      cell.addEventListener('click', () => pick(key, cell));
      grid.appendChild(cell);
    }
    const picker = el('div', 'mn-picker'); picker.hidden = true;
    // 05.08 (одит г06, №173 + №242): подсказката вече е ЖИВ възел — гасне в
    // мига, в който има какво да се избира. И посоката е вярна: „Календар на
    // храните“ е в кътче „🍓 Храните“, което стои ПОД „🥄 Днес на масата“
    // (order4.js:31-36 + keepOrder) — значи по-долу, не горе.
    const подсказка = el('p', 'jr-privacy', 'Отбележи опитани храни в „Календар на храните“ по-долу — ще се появят тук за избор.');
    function pick(key, cell) {
      picker.hidden = false;
      picker.innerHTML = '';
      const t = el('p', 'jr-weekcap', 'Какво планираме за ' + key.slice(8) + '.' + key.slice(5, 7) + '?');
      picker.appendChild(t);
      const wrapC = el('div', 'jr-quick');
      // #46: без опитани храни НЕ подхвърляме фалшиви „тиквичка/морков" като реални
      // избори (мама можеше да ги избере, без да ги е въвела). Свободното поле долу
      // покрива планиране на нова храна; подсказката под грида я праща към календара.
      const options = опции();
      подсказка.hidden = options.length > 0;
      options.slice(0, 14).forEach(o => {
        const b = el('button', 'jr-chip', esc(o)); b.type = 'button';   // 14.3.11: име на храна = мамин текст
        b.addEventListener('click', () => { menu[key] = o; save('bl_menu', menu); cell.querySelector('.mn-val').textContent = o; picker.hidden = true; fx().buzz(8); });
        wrapC.appendChild(b);
      });
      const clr = el('button', 'jr-chip', '✕ изчисти'); clr.type = 'button';
      clr.addEventListener('click', () => { delete menu[key]; save('bl_menu', menu); cell.querySelector('.mn-val').textContent = '+'; picker.hidden = true; });
      wrapC.appendChild(clr);
      picker.appendChild(wrapC);
      const inpRow = el('div', 'jr-addrow');
      const inp = el('input', 'jr-word'); inp.placeholder = 'или напиши свое…'; inp.maxLength = 30;
      // проход 4: поле с бутон + Enter (беше единственото, което пише само при blur).
      // 🔇 12.08 (мерено): при празно поле „✔“ не правеше нищо и не казваше нищо —
      //    прозорчето стоеше отворено и мама не знаеше дали е записано.
      const запиши = тихо => {
        if (!inp.value.trim()) { if (тихо !== true) nudge(inpRow, 'Напиши какво планираш за този ден. 🥄', inp); return; }
        clearHint(inpRow);
        menu[key] = inp.value.trim(); save('bl_menu', menu);
        cell.querySelector('.mn-val').textContent = menu[key];
        picker.hidden = true; fx().buzz(8);
      };
      const ок = wide(el('button', 'jr-chip', '✔')); ок.type = 'button'; ок.setAttribute('aria-label', 'запази');
      ок.addEventListener('click', () => запиши(false));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); запиши(false); } });
      inp.addEventListener('change', () => запиши(true));
      inpRow.appendChild(inp); inpRow.appendChild(ок);
      picker.appendChild(inpRow);
    }
    c.appendChild(grid); c.appendChild(picker); c.appendChild(подсказка);
    подсказка.hidden = опции().length > 0;
    return c;
  }

  // 🃏 Рецепти + „имам вкъщи“
  const RECIPES = [
    { n: 'Пюре от тиквичка', e: '🥒', from: 6, ing: ['тиквичка', 'зехтин'], how: 'Задуши тиквичката 10 мин, пасирай с капчица зехтин.' },
    { n: 'Морков + картоф', e: '🥕', from: 6, ing: ['морков', 'картоф'], how: 'Свари на пара, пасирай. Класика, която не издъхва.' },
    { n: 'Печена ябълка', e: '🍎', from: 6, ing: ['ябълка'], how: 'Печи 20 мин на 180° — става медено-мека.' },
    { n: 'Овесена кашичка', e: '🥣', from: 7, ing: ['овес', 'мляко'], how: 'Фини люспи + мляко/вода, 5 мин на слаб огън.' },
    { n: 'Тиква на фурна', e: '🎃', from: 6, ing: ['тиква'], how: 'Печена тиква, пасирана — сладка без нищо добавено.' },
    { n: 'Банан + авокадо', e: '🥑', from: 6, ing: ['банан', 'авокадо'], how: 'Намачкай с вилица. Нула готвене, максимум обич.' },
    { n: 'Пилешко с ориз', e: '🍗', from: 8, ing: ['пилешко', 'ориз', 'морков'], how: 'Сварено пиле + ориз + морков, пасирай на едро.' },
    { n: 'Крем-супа броколи', e: '🥦', from: 7, ing: ['броколи', 'картоф'], how: 'Свари, пасирай с малко от бульона. Зелено чудо.' }
  ];
  function recipesCard() {
    const c = card('Рецепти-карти 🃏 <span class="jr-sub">напиши какво имаш вкъщи — ще ти кажа какво става</span>');
    const state = load('bl_recipes_state', {});
    const inp = el('input', 'jr-word'); inp.placeholder = '🧺 имам: морков, ориз…';
    c.appendChild(inp);
    const list = el('div', 'rp-list');
    function draw() {
      const have = inp.value.toLowerCase().split(/[,\s]+/).filter(x => x.length > 2);
      list.innerHTML = '';
      let shown = RECIPES;
      if (have.length) {
        shown = RECIPES.filter(r => have.some(h => r.ing.some(g => g.startsWith(h.slice(0, 4)))));
        // 📚 12.08 (правило „обещава ли текстът функция“): тук пишеше „но
        //    библиотеката иде!“ — обещание за нещо, което ОТДАВНА го има
        //    (js/lib.js, търсачката ѝ е в приложението). Мама чака доставка,
        //    която вече е пристигнала. Казваме къде да гледа сега.
        if (!shown.length) { list.appendChild(el('p', 'jr-privacy', 'С това още нямам рецепта тук. Питай на началния екран, в реда „💬 Кажи ми какво търсиш“ — там търся из цялата библиотека.')); return; }
      }
      shown.forEach(r => {
        const st = state[r.n] || {};
        const row = el('div', 'rp-card');
        row.innerHTML = `<div class="rp-top"><span class="rp-e">${r.e}</span><strong>${r.n}</strong><span class="rp-from">от ${r.from} м.</span></div>
          <p class="rp-ing">${r.ing.join(' · ')}</p><p class="rp-how">${r.how}</p>
          <div class="jr-quick"><button class="jr-chip ${st.done ? 'on' : ''}" data-a="done" type="button">Сготвих ✓</button>
          <button class="jr-chip ${st.fav ? 'on' : ''}" data-a="fav" type="button">Любимо 💜</button></div>`;
        row.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
          st[b.dataset.a] = !st[b.dataset.a]; state[r.n] = st; save('bl_recipes_state', state);
          b.classList.toggle('on'); fx().buzz(8);
        }));
        list.appendChild(цели(row));
      });
    }
    inp.addEventListener('input', draw);
    c.appendChild(list); draw();
    return c;
  }

  // 🌈 Дъгата на седмицата
  // ♿ 11.08 (клавиатура-четец): шестте чипа бяха само емоджи, а единственото им
  //    име беше `title = 'Ядохме ' + k` — тоест „Ядохме red". Четвъртата колонка е
  //    името по нашенски: то влиза и във видимата подсказка, и в името за четеца.
  const RAINBOW = [['red', '🍅', '#e8574f', 'червено'], ['orange', '🥕', '#f2913d', 'оранжево'], ['yellow', '🍌', '#f2c53d', 'жълто'], ['green', '🥦', '#5cab6d', 'зелено'], ['purple', '🫐', '#8a6fc9', 'лилаво'], ['white', '🥛', '#c9c3bd', 'бяло']];
  function rainbowCard() {
    const c = card('Дъгата на седмицата 🌈 <span class="jr-sub">яжте цветовете — дъгата се пълни</span>');
    const data = load('bl_rainbow', {});
    const mon = (() => { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return localDate(d); })();
    // проход 3 T11: персистирай нулирането веднага (не само в паметта до тап),
    // за да не хвали чатът цветовете от миналата седмица в понеделник сутрин.
    if (data.week !== mon) { data.week = mon; data.cols = []; save('bl_rainbow', data); }
    const box = el('div', 'rb-box');
    const row = el('div', 'jr-quick');
    // рисуваме SVG-то ВЕДНЪЖ; тапът обновява само своята дъга → тя се чертае,
    // а не всички да мигат наново (pathLength=1 нормализира дължината за всеки радиус)
    let svg = `<svg viewBox="0 0 200 105" class="rb-svg">`;
    RAINBOW.forEach(([k, e, col], i) => {
      const r = 88 - i * 13;
      const on = data.cols.includes(k);
      svg += `<path data-k="${k}" pathLength="1" d="M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100" fill="none" stroke="${on ? col : '#e8e2f0'}" stroke-width="11" stroke-linecap="round" class="rb-arc${on ? ' rb-on' : ''}"/>`;
    });
    svg += `</svg><p class="cs-note rb-count">${data.cols.length} / ${RAINBOW.length} цвята тази седмица</p>`;
    box.innerHTML = svg;
    const colOf = k => (RAINBOW.find(x => x[0] === k) || [])[2] || '#e8e2f0';
    RAINBOW.forEach(([k, e, , име]) => {
      const b = el('button', 'jr-chip' + (data.cols.includes(k) ? ' on' : ''), e); b.type = 'button';
      b.title = 'Ядохме ' + име;
      b.setAttribute('aria-label', 'Ядохме ' + име);
      b.setAttribute('aria-pressed', data.cols.includes(k) ? 'true' : 'false');
      b.addEventListener('click', () => {
        const path = box.querySelector(`path[data-k="${k}"]`);
        if (data.cols.includes(k)) {
          data.cols = data.cols.filter(x => x !== k);
          if (path) { path.setAttribute('stroke', '#e8e2f0'); path.classList.remove('rb-on'); }
        } else {
          data.cols.push(k); fx().buzz(8);
          if (path) { path.setAttribute('stroke', colOf(k)); path.classList.add('rb-on'); }
          if (data.cols.length === RAINBOW.length) { fx().confetti(box); fx().cheer('ЦЯЛА ДЪГА тази седмица! 🌈'); }
        }
        save('bl_rainbow', data);
        const n = box.querySelector('.rb-count'); if (n) n.textContent = `${data.cols.length} / ${RAINBOW.length} цвята тази седмица`;
        b.classList.toggle('on');
        b.setAttribute('aria-pressed', data.cols.includes(k) ? 'true' : 'false');
      });
      row.appendChild(b);
    });
    c.appendChild(box); c.appendChild(row);
    return c;
  }

  // 🛡️ Алергия-паспорт (печатаем)
  function allergyPassCard() {
    const c = card('Алергия-паспорт 🛡️ <span class="jr-sub">картичка за баба и детегледачката</span>');
    const manual = load('bl_allergy_manual', []);
    // 05.08 (одит г06, №211): `auto` се четеше ВЕДНЪЖ, извън draw() — реакция,
    // отбелязана в календара, не влизаше в паспорта до повторно влизане в стаята.
    const авто = () => { const tried = load('bl_tried', {}); return Object.keys(tried).filter(k => (tried[k] || '').includes('⚠️')); };
    const list = el('div', 'jr-quick');
    function draw() {
      const auto = авто();
      list.innerHTML = '';
      auto.forEach(a => list.appendChild(el('span', 'fd-pill ap-pill', '⚠️ ' + esc(a))));
      // 05.08 (одит г06, №211): ръчно добавеният алерген нямаше как да се махне —
      // нула изтривания в целия проект. Написан в паника, той оставаше завинаги
      // и на картичката за баба и детегледачката. Всяко ръчно хапче вече има ✕.
      manual.forEach((a, i) => {
        const pill = el('span', 'fd-pill ap-pill', '⚠️ ' + esc(a) + ' ');
        const x = wide(el('button', 'jr-x', '✕')); x.type = 'button';
        x.style.minHeight = '44px';
        x.setAttribute('aria-label', 'Махни „' + a + '“ от паспорта');
        x.addEventListener('click', () => { manual.splice(i, 1); save('bl_allergy_manual', manual); draw(); });
        pill.appendChild(x);
        list.appendChild(pill);
      });
      // 🛡️ 11.08 (обиколка като майка на 7-месечно): тук пишеше „Няма отбелязани
      //    реакции — прекрасно!“. Празният екран не е доказателство: на 7 месеца
      //    половината алергени още не са опитвани изобщо. Казваме какво ЗНАЕМ
      //    (нищо не е записано), не какво ПРЕДПОЛАГАМЕ (че няма алергия).
      if (!auto.length && !manual.length) list.appendChild(el('p', 'jr-privacy', 'Тук още няма нищо записано. Празно не значи „няма алергия“ — значи, че още не сте се срещали с всичко. Добави ръчно, ако знаеш нещо.'));
    }
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'добави алерген ръчно…'; inp.maxLength = 30;
    const add = wide(el('button', 'jr-chip', '+')); add.type = 'button';
    add.setAttribute('aria-label', 'Добави алергена в паспорта');
    // 🔇 12.08 (мерено): празно поле → нищо. И втори път същият алерген влизаше
    //    ПАК — на картичката за баба излизаше „⚠️ ядки · ⚠️ ядки“.
    const добавиАл = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Кой алерген? Напиши го както го знаеш ти. 🛡️', inp); return; }
      if (manual.some(x => String(x).toLowerCase() === v.toLowerCase())) { nudge(addRow, 'Този вече е в паспорта. 💜', inp); return; }
      clearHint(addRow);
      manual.push(v); save('bl_allergy_manual', manual); inp.value = ''; fx().buzz(8); draw();
    };
    add.addEventListener('click', добавиАл);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добавиАл(); } });
    addRow.appendChild(inp); addRow.appendChild(add);
    const pr = el('button', 'jr-btn', '🖨️ Направи картичката'); pr.type = 'button';
    pr.addEventListener('click', () => {
      const baby = getBaby();
      const sos = load('bl_sos', {});
      const all = авто().concat(manual);
      // 05.08 (одит г06, №118): тук се четеше `sos.doc` — ключ, който НИКОЙ не
      // записва (sos.js:15 пази pedName/pedPhone/…). Условието беше винаги false
      // и телефонът на педиатъра не се печаташе никога.
      const пед = sos.pedPhone ? ' или на педиатъра' + (sos.pedName ? ' (' + esc(sos.pedName) + ')' : '') + ': ' + esc(sos.pedPhone) : '';
      BL_EXPR.printOverlay('Алергия-паспорт',
        `<p class="pr-big">${esc(baby.name) || 'Бебето'}${baby.birth ? ' · родено ' + new Date(baby.birth).toLocaleDateString('bg-BG') : ''}</p>
         ${all.length ? `<p>Внимавай с:</p><ul class="pr-list">${all.map(a => `<li>⚠️ ${esc(a)}</li>`).join('')}</ul>` : '<p>Мама още няма записана реакция към нищо. Това НЕ значи „няма алергия“ — значи само, че още не всичко е опитвано. Затова: нищо ново без нейно знание.</p>'}
         <p class="pr-note">При реакция (обрив, подуване, затруднено дишане): звънни на мама${пед}. При спешност: 112.</p>`);
    });
    c.appendChild(list); c.appendChild(addRow); c.appendChild(pr);
    draw();
    // 🛡️ 11.08: паспортът четеше bl_tried само при рисуване. Мама отбелязваше
    //    „⚠️ реакция“ на яйцето в „Календар на храните“ и ДВЕ карти по-долу, в
    //    същия миг, паспортът продължаваше да твърди, че няма нищо записано —
    //    двете карти си противоречаха на един екран. Слушателят се маха сам,
    //    щом картата излезе от документа (стаята се пресъздава при всяко влизане).
    const прерисувай = () => {
      if (!c.isConnected) { document.removeEventListener('bl:tried-changed', прерисувай); return; }
      draw();
    };
    document.addEventListener('bl:tried-changed', прерисувай);
    return c;
  }

  // ═══════════════ 🩺 ЗДРАВЕ (Н7) ═══════════════

  // 🌡️ Температурен дневник
  function tempCard() {
    const c = card('Температурен дневник 🌡️ <span class="jr-sub">епизодът като графика — за прегледа</span>');
    // проход 3 T28: let + чети наново при add — иначе запис от „Температурен ориентир"
    // (rooms2) в същата сесия се претрива при добавяне тук (stale-array).
    let items = load('bl_temps', []);
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.type = 'number'; inp.step = '0.1'; inp.placeholder = '37.2…';
    inp.setAttribute('aria-label', 'Температура в градуси');
    const add = el('button', 'jr-chip', '+ Запиши'); add.type = 'button';
    row.appendChild(inp); row.appendChild(add);
    const box = el('div', 'tp-box');
    add.addEventListener('click', () => {
      const v = parseFloat(inp.value);
      if (isNaN(v) || v < 34 || v > 43) { hint(row, 'Въведи в градуси (напр. 37.2).'); return; }
      clearHint(row);
      items = load('bl_temps', []);
      items.push({ v, ts: Date.now() });
      save('bl_temps', items.slice(-80)); inp.value = ''; fx().buzz(10); draw();
    });
    function draw() {
      const last = items.filter(x => Date.now() - x.ts < 7 * 86400000).slice(-20);
      if (!last.length) { box.innerHTML = '<p class="jr-privacy">Записвай при мерене — тук се рисува посоката (спада ли, качва ли).</p>'; return; }
      const min = 36, max = 41;
      const X = i => 16 + i / Math.max(1, last.length - 1) * 288, Y = v => 92 - (Math.min(max, Math.max(min, v)) - min) / (max - min) * 74;
      let svg = `<svg viewBox="0 0 320 106" class="pw-svg">`;
      svg += `<line x1="14" y1="${Y(38)}" x2="306" y2="${Y(38)}" class="tp-38"/><text x="308" y="${Y(38) + 3}" class="tp-lbl">38°</text>`;
      svg += `<polyline points="${last.map((p, i) => X(i) + ',' + Y(p.v)).join(' ')}" class="tp-line"/>`;
      last.forEach((p, i) => { svg += `<circle cx="${X(i)}" cy="${Y(p.v)}" r="3" class="${p.v >= 38 ? 'tp-hot' : 'pw-dot'}"><title>${p.v}° · ${new Date(p.ts).toLocaleString('bg-BG')}</title></circle>`; });
      svg += `</svg>`;
      const lastV = last[last.length - 1];
      box.innerHTML = svg + `<p class="cs-note">Последно: <strong>${lastV.v}°</strong> (${new Date(lastV.ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}). ${lastV.v >= 38 ? 'Виж „Температурен ориентир“ точно над тази карта — и при съмнение, лекар. 💚' : 'Спокойни градуси. 💚'}</p>`;
    }
    c.appendChild(row); c.appendChild(box); draw();
    // 11.08: „Температурен ориентир“ (rooms2) пише в СЪЩИЯ bl_temps и казва
    // „✔ Записано — посоката е в дневника“, а дневникът точно под него оставаше
    // с „Записвай при мерене…“ до презареждане — изглеждаше все едно не се е
    // записало. Оставяме една кука (не слушател → не се трупа при всяко влизане).
    window.BL_TEMPS_REDRAW = () => { items = load('bl_temps', []); draw(); };
    return c;
  }

  // 💊 Дневник на даденото
  function medsCard() {
    const c = card('Дневник на даденото 💊 <span class="jr-sub">какво и кога — по лекарско предписание</span>');
    const items = load('bl_meds', []);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „Нурофен по лекаря“…'; inp.maxLength = 50;
    const add = el('button', 'jr-chip', '+ Сега'); add.type = 'button';
    addRow.appendChild(inp); addRow.appendChild(add);
    const quick = el('div', 'jr-quick');
    const list = el('div', 'nt-list');
    // 🔇 12.08 (мерено): празно поле → нула ред в списъка, нула в паметта.
    const добавиЛек = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Напиши какво е дадено (както го е казал лекарят). 💚', inp); return; }
      clearHint(addRow);
      items.push({ n: v, ts: Date.now() }); save('bl_meds', items.slice(-60)); inp.value = ''; draw(); fx().buzz(10);
      tick(add, '✔ Записано');
    };
    add.addEventListener('click', добавиЛек);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добавиЛек(); } });
    function draw() {
      quick.innerHTML = '';
      [...new Set(items.slice(-10).map(x => x.n))].slice(0, 3).forEach(n => {
        const b = el('button', 'jr-chip', '↻ ' + esc(n)); b.type = 'button';
        b.addEventListener('click', () => { items.push({ n, ts: Date.now() }); save('bl_meds', items.slice(-60)); draw(); fx().buzz(10); });
        quick.appendChild(b);
      });
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Тук НЕ даваме дози — записваме какво е дадено по лекарско, за да не се обърка при уморена глава. 💚</p>';
      items.slice(-8).reverse().forEach((it, ri) => {
        const idx = items.length - 1 - items.slice(-8).reverse().indexOf(it) - 0; // stable enough for delete-by-object
        const row = el('div', 'nt-row');
        row.innerHTML = `<div class="nt-txt">💊 ${esc(it.n)}</div><div class="nt-meta"><span>${new Date(it.ts).toLocaleString('bg-BG')}</span><button class="nt-del" type="button" aria-label="Махни записа „${esc(it.n)}“">🗑</button></div>`;
        row.querySelector('.nt-del').addEventListener('click', () => { const i = items.indexOf(it); if (i > -1) items.splice(i, 1); save('bl_meds', items); draw(); });
        list.appendChild(цели(row));
      });
    }
    c.appendChild(addRow); c.appendChild(quick); c.appendChild(list); draw();
    return c;
  }

  // 🩺 Бележка за прегледа — авто-събрана, печатаема
  function visitNoteCard() {
    const c = card('Бележка за прегледа 🩺 <span class="jr-sub">всичко събрано — влизаш подготвена</span>');
    const ta = el('textarea', 'jr-paper'); ta.rows = 2; ta.placeholder = 'Въпросите ми към лекаря…';
    ta.dataset.draft = 'bl_visit_q'; ta.value = load('bl_visit_q', '');
    const btn = el('button', 'jr-btn', '🖨️ Събери бележката'); btn.type = 'button';
    btn.addEventListener('click', () => {
      const baby = getBaby();
      const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
      const temps = load('bl_temps', []).filter(x => Date.now() - x.ts < 3 * 86400000);
      const meds = load('bl_meds', []).filter(x => Date.now() - x.ts < 7 * 86400000);
      const notes = load('bl_notes_health', []).slice(-4);
      const growth = load('bl_growth', []).slice(-1)[0];
      // 11.08: картата обещаваше „и въпросите ти“, а печаташе САМО полето отдолу —
      // въпросите от „Какво искам да го попитам“ (един и същ ключ навсякъде) оставаха
      // вкъщи. Сега влизат и те.
      const qs = load('bl_doc_questions', []).filter(q => String(q || '').trim());
      // 💉 11.08: „📌 Днес имахме ваксина“ (rooms6.js) пишеше в bl_vax_log и
      //    ключът се четеше САМО в собствената си карта. След два дни бебето
      //    гори, мама сяда да събере бележката — и приложението не помни, че е
      //    имало ваксина. Тук влиза само датата, гола: какво значи температура
      //    след ваксина казва лекарят, не приложението.
      const vax = load('bl_vax_log', [])
        .map(d => new Date(d).getTime())
        .filter(t => !isNaN(t) && Date.now() - t < 14 * 86400000)
        .sort((x, y) => y - x);
      const tried = load('bl_tried', {});
      const alrg = Object.keys(tried).filter(k => (tried[k] || '').includes('⚠️'));
      BL_EXPR.printOverlay('Бележка за прегледа',
        `<p class="pr-big">${esc(baby.name) || 'Бебето'}${a ? ' · ' + a.text : ''}${growth ? ' · ' + growth.w + ' кг (' + growth.d + ')' : ''}</p>
         ${temps.length ? `<h3>🌡️ Температури (72 ч)</h3><ul class="pr-list">${temps.map(t => `<li>${t.v}° — ${new Date(t.ts).toLocaleString('bg-BG')}</li>`).join('')}</ul>` : ''}
         ${meds.length ? `<h3>💊 Дадено (7 дни)</h3><ul class="pr-list">${meds.map(m => `<li>${esc(m.n)} — ${new Date(m.ts).toLocaleString('bg-BG')}</li>`).join('')}</ul>` : ''}
         ${vax.length ? `<h3>💉 Ваксина (14 дни)</h3><ul class="pr-list">${vax.map(t => `<li>${new Date(t).toLocaleDateString('bg-BG')}</li>`).join('')}</ul>` : ''}
         ${alrg.length ? `<h3>⚠️ Реакции към храни</h3><ul class="pr-list">${alrg.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
         ${notes.length ? `<h3>📝 Бележки</h3><ul class="pr-list">${notes.map(n => `<li>${new Date(n.d).toLocaleDateString('bg-BG')}: ${esc(n.t).slice(0, 160)}</li>`).join('')}</ul>` : ''}
         ${(qs.length || ta.value.trim()) ? `<h3>❓ Въпросите на мама</h3>${qs.length ? `<ul class="pr-list">${qs.map(q => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}${ta.value.trim() ? `<p>${esc(ta.value)}</p>` : ''}` : ''}
         <p class="pr-note">Събрано от Бейби Ленд — данните са водени от родителя.</p>`);
    });
    c.appendChild(ta); c.appendChild(btn);
    c.appendChild(el('p', 'jr-privacy', 'Събира: температури (72 ч), лекарства (7 дни), отбелязана ваксина (14 дни), реакции, здравни бележки и въпросите ти.'));
    return c;
  }

  // 🧸 Аптечка вкъщи
  function pharmacyCard() {
    const c = card('Аптечката вкъщи 🧸 <span class="jr-sub">какво имате и кога изтича</span>');
    const items = load('bl_pharmacy', []);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „физиологичен серум“'; inp.maxLength = 40;
    const dt = el('input', 'jr-word ph-date'); dt.type = 'date';
    // ♿ 11.08 (клавиатура-четец): при type=date подсказката не се показва — полето
    //    стоеше без име, а „+" не казваше какво добавя.
    dt.setAttribute('aria-label', 'Дата на изтичане');
    const add = wide(el('button', 'jr-chip', '+')); add.type = 'button';
    add.setAttribute('aria-label', 'Добави го в аптечката');
    addRow.appendChild(inp); addRow.appendChild(dt); addRow.appendChild(add);
    const list = el('div', 'nt-list');
    // 🔴 11.08 (обиколка като майка): „Аптечка бърз старт“ пише направо в
    // bl_pharmacy. Тази карта държеше СТАРО копие отпреди това и при първото
    // „+“ го записваше отгоре — добавеното с бърз старт ИЗЧЕЗВАШЕ безшумно.
    // Същият капан беше оправен по-горе в tempCard; тук беше останал.
    const sync = () => { const cur = load('bl_pharmacy', []); items.length = 0; cur.forEach(x => items.push(x)); };
    // 🔇 12.08 (мерено): празно поле → нищо. Мама попълваше САМО датата (полето
    //    е до него) и натискаше „+“ — нула реакция, нула обяснение защо.
    const добавиАпт = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, dt.value ? 'Само датата не стига — напиши и какво е това. 🧸' : 'Какво имате? Напр. „физиологичен серум“.', inp); return; }
      clearHint(addRow);
      sync();
      items.push({ n: v, exp: dt.value || '' }); save('bl_pharmacy', items); inp.value = ''; dt.value = ''; fx().buzz(8); draw();
      tick(add, '✔');
    };
    add.addEventListener('click', добавиАпт);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добавиАпт(); } });
    function draw() {
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Серум, термометър, аспиратор… запиши какво имате — и никога не гадаеш в полунощ.</p>';
      items.forEach((it, idx) => {
        let expCls = '', expTxt = '';
        if (it.exp) {
          const dl = Math.ceil((new Date(it.exp) - Date.now()) / 86400000);
          expTxt = 'до ' + new Date(it.exp).toLocaleDateString('bg-BG');
          if (dl < 0) { expCls = ' ph-exp'; expTxt = '⚠️ ИЗТЕКЛО'; }
          else if (dl < 30) { expCls = ' ph-soon'; expTxt = '⏳ изтича до месец'; }
        }
        const row = el('div', 'nt-row' + expCls);
        row.innerHTML = `<div class="nt-txt">${esc(it.n)}</div><div class="nt-meta"><span>${expTxt}</span><button class="nt-del" type="button" aria-label="Махни „${esc(it.n)}“ от аптечката">🗑</button></div>`;
        row.querySelector('.nt-del').addEventListener('click', () => { items.splice(idx, 1); save('bl_pharmacy', items); draw(); });
        list.appendChild(цели(row));
      });
    }
    c.appendChild(addRow); c.appendChild(list); draw();
    // 11.08: „Аптечка бърз старт“ (rooms4) пише в СЪЩИЯ bl_pharmacy и обещава
    // „Появяват се в „Аптечката вкъщи“ по-горе“ — а тук нищо не се появяваше до
    // презареждане. Кука, не слушател → не се трупа при всяко влизане в стаята.
    window.BL_PHARMACY_REDRAW = () => { sync(); draw(); };
    return c;
  }

  // ═══════════════ 🧸 РАЗВИТИЕ (Н8) ═══════════════

  // 🌳 Дървото на уменията — разцъфва
  function skillTreeCard() {
    const c = card('Дървото на уменията 🌳 <span class="jr-sub">всяко умение е цвят — гледай как цъфти</span>');
    const box = el('div', 'st-box');
    c.appendChild(box);
    // 🔴 12.08 (известният клас, мерено наживо): „📈 Какво умее сега?“ стои
    //    ТОЧНО НАД тази карта в същата стая. Отбелязах пет умения — дървото
    //    продължи да пише „Дървото чака първия цвят“. Цветовете се появиха чак
    //    при повторно влизане в стаята. rooms17.js вече праща `bl:ms-changed`
    //    (ред 175 и 224) — никой не го слушаше тук. Слушателят се маха сам,
    //    щом картата излезе от документа.
    рисувайДърво();
    const прерисувай = () => {
      if (!c.isConnected) { document.removeEventListener('bl:ms-changed', прерисувай); return; }
      рисувайДърво();
    };
    document.addEventListener('bl:ms-changed', прерисувай);
    return c;

    function рисувайДърво() {
    const done = load('bl_ms_done', {});
    const ids = Object.keys(done).filter(k => done[k]);
    const branches = { motor: { ang: -58, col: '#f291bd' }, fine: { ang: -20, col: '#f2c53d' }, speech: { ang: 20, col: '#8fc0e8' }, social: { ang: 58, col: '#9fd8c6' } };
    let svg = `<svg viewBox="0 0 320 210" class="st-svg">`;
    svg += `<path d="M160 205 C 158 160, 162 140, 160 118" class="st-trunk"/>`;
    Object.entries(branches).forEach(([k, b]) => {
      const rad = b.ang * Math.PI / 180;
      const x2 = 160 + Math.sin(rad) * 92, y2 = 118 - Math.cos(rad) * 72;
      svg += `<path d="M160 122 Q ${160 + Math.sin(rad) * 40} ${118 - Math.cos(rad) * 42}, ${x2} ${y2}" class="st-branch"/>`;
      const mine = ids.filter(id => id.endsWith('_' + k));
      mine.forEach((id, i) => {
        const t = (i + 1) / (mine.length + 1);
        const bx = 160 + Math.sin(rad) * 92 * t + ((i % 2) ? 9 : -9);
        const by = 118 - Math.cos(rad) * 72 * t - 4;
        svg += `<circle cx="${bx}" cy="${by}" r="6" fill="${b.col}" class="st-bloom" style="animation-delay:${i * 0.15}s"/><circle cx="${bx}" cy="${by}" r="2" fill="#fff" opacity="0.85"/>`;
      });
    });
    svg += `<ellipse cx="160" cy="206" rx="55" ry="6" class="st-ground"/></svg>`;
    box.innerHTML = svg +
      `<p class="cs-note">${ids.length ? `<strong>${ids.length}</strong> ${ids.length === 1 ? 'цвят е разцъфнал' : 'цвята са разцъфнали'} 🌸 — отбелязвай уменията в „Какво умее сега?“` : 'Дървото чака първия цвят — отбележи умение в „Какво умее сега?“ 🌱'}</p>` +
      `<p class="st-legend">${Object.entries({ motor: '🤸', fine: '✋', speech: '🗣️', social: '💛' }).map(([k, e]) => `<span style="color:${branches[k].col}">●</span> ${e}`).join('  ')}</p>`;
    }
  }

  // 📚 Лог на книжките
  function booksCard() {
    const c = card('Книжките ни 📚 <span class="jr-sub">кои четете — и коя е ЛЮБИМАТА</span>');
    const items = load('bl_books', []);
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'заглавие…'; inp.maxLength = 60;
    const add = wide(el('button', 'jr-chip', '+')); add.type = 'button';
    add.setAttribute('aria-label', 'Добави книжката в списъка');
    addRow.appendChild(inp); addRow.appendChild(add);
    const list = el('div', 'nt-list');
    // 🔇 12.08 (мерено): празно поле → нула. И Enter не работеше.
    const добавиКн = () => {
      const v = inp.value.trim();
      if (!v) { nudge(addRow, 'Как се казва книжката? 📖', inp); return; }
      clearHint(addRow);
      items.push({ t: v, fav: false, ts: Date.now() }); save('bl_books', items); inp.value = ''; fx().buzz(8); draw();
    };
    add.addEventListener('click', добавиКн);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добавиКн(); } });
    function draw() {
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Първата книжка се помни цял живот. Коя е вашата? 📖</p>';
      items.slice().sort((a, b) => b.fav - a.fav).forEach(it => {
        const row = el('div', 'nt-row');
        row.innerHTML = `<div class="nt-txt">📖 ${esc(it.t)} ${it.fav ? '💜' : ''}</div>
          <div class="nt-meta"><button class="jr-chip bk-fav" type="button" aria-label="${it.fav ? 'Махни „' + esc(it.t) + '“ от любимите' : 'Направи „' + esc(it.t) + '“ любима'}">${it.fav ? 'Любима 💜' : 'направи любима'}</button><button class="nt-del" type="button" aria-label="Махни „${esc(it.t)}“ от книжките">🗑</button></div>`;
        row.querySelector('.bk-fav').addEventListener('click', () => { it.fav = !it.fav; save('bl_books', items); draw(); });
        row.querySelector('.nt-del').addEventListener('click', () => { items.splice(items.indexOf(it), 1); save('bl_books', items); draw(); });
        list.appendChild(цели(row));
      });
    }
    c.appendChild(addRow); c.appendChild(list); draw();
    return c;
  }

  // ═══════════════ 🛠️ ИНСТРУМЕНТИ (Н8) ═══════════════

  // 🔄 Конвертори
  function convCard() {
    const c = card('Конвертори 🔄 <span class="jr-sub">мл ↔ унции · размери · вода за банята</span>');
    const r1 = el('div', 'cv-row');
    const ml = el('input', 'jr-word'); ml.type = 'number'; ml.placeholder = 'мл';
    ml.setAttribute('aria-label', 'Милилитри');
    const oz = el('input', 'jr-word'); oz.type = 'number'; oz.placeholder = 'oz';
    // ♿ 11.08 (клавиатура-четец): подсказката „oz" е чуждица — четецът я срича
    //    буква по буква и не се разбира, че са унции.
    oz.setAttribute('aria-label', 'Унции');
    ml.addEventListener('input', () => { oz.value = ml.value ? (ml.value / 29.5735).toFixed(1) : ''; });
    oz.addEventListener('input', () => { ml.value = oz.value ? Math.round(oz.value * 29.5735) : ''; });
    r1.appendChild(ml); r1.appendChild(el('span', 'cv-eq', '↔')); r1.appendChild(oz);
    c.appendChild(el('p', 'jr-weekcap', '🍼 Мляко:')); c.appendChild(r1);
    c.appendChild(el('p', 'jr-weekcap', '👕 Размери (по височина, см):'));
    c.appendChild(el('p', 'cv-tbl', '56=0–1 м · 62=1–3 м · 68=3–6 м · 74=6–9 м · 80=9–12 м · 86=12–18 м · 92=18–24 м'));
    c.appendChild(el('p', 'jr-weekcap', '🛁 Вода:'));
    // 05.08 (одит г06, №312): „хладко" противоречеше на собствената база (kb.js:1889
    // „Топло, не горещо — капка на китката ти не бива да се усеща"). И конверторът
    // беше единственото място с температури в стаята, а точно горещата вода за
    // праха липсваше — мама правеше млякото с хладка вода. Формулировките са
    // едно към едно с kb.js:1794 и 1889, за да няма два текста за едно правило.
    c.appendChild(el('p', 'cv-tbl', 'Баня: <strong>36–37°</strong> (лакътят не усеща нищо) · Стая за сън: <strong>18–21°</strong> · Шише: капка на китката не бива да се усеща (телесна температура)'));
    c.appendChild(el('p', 'cv-tbl', 'Адаптирано мляко: с прясно преварена вода, изстинала <strong>не повече от 30 мин</strong> (около 70°) — прахът не е стерилен и водата трябва да е достатъчно гореща.'));
    return c;
  }

  // 🐷 Касичка-цел
  function goalCard() {
    const c = card('Касичка-цел 🐷 <span class="jr-sub">събираме за нещо голямо</span>');
    const g = load('bl_goal', null);
    if (!g) {
      const inp = el('input', 'jr-word'); inp.placeholder = 'за какво събираме? (напр. столче за кола)'; inp.maxLength = 40;
      const amt = el('input', 'jr-word'); amt.type = 'number'; amt.placeholder = 'колко лв са нужни?';
      const btn = el('button', 'jr-btn', 'Започни касичката 🐷'); btn.type = 'button';
      // 🔇 12.08 (мерено с натискане): празно → нула промяна в DOM и в паметта.
      //    Същото при „-50“. Два безмълвни отказа в един бутон.
      btn.addEventListener('click', () => {
        const n = inp.value.trim(), t = parseFloat(amt.value);
        if (!n) { nudge(btn, 'За какво събирате? Напиши го с твои думи. 🐷', inp); return; }
        if (isNaN(t)) { nudge(btn, 'Напиши и колко лева са нужни (само число). 🐷', amt); return; }
        if (t <= 0) { nudge(btn, 'Сумата трябва да е над нула. 🐷', amt); return; }
        clearHint(btn);
        save('bl_goal', { n, target: t, saved: 0 });
        c.replaceWith(goalCard());
      });
      c.appendChild(inp); c.appendChild(amt); c.appendChild(btn);
      return c;
    }
    // 🎞️ 12.08 (правило „анимация само по transform/opacity“): лентата се
    //    пълнеше с `width:%`, а mega.css:183 ѝ дава `transition: width .6s` —
    //    прерисуване на всеки кадър. Ширината става 100% веднъж, а движението
    //    е по scaleX. ПЪТ НАЗАД: `style="width:${pct}%"` както преди.
    const pct = Math.min(100, Math.round(g.saved / g.target * 100));
    const тихо = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
    const bar = el('div', 'gl-bar', `<div class="gl-fill" style="width:100%;transform-origin:left center;transform:scaleX(${pct / 100});transition:${тихо ? 'none' : 'transform .5s cubic-bezier(.22,1,.36,1)'}"></div><span class="gl-txt">${g.saved} / ${g.target} лв · ${pct}%</span>`);
    c.appendChild(el('p', 'cs-note', `Събираме за: <strong>${esc(g.n)}</strong> 🐷`));
    c.appendChild(bar);
    const мал = el('p', 'jr-hint');
    // ↩ 12.08: „+50 лв“ вместо „+5 лв“ беше необратимо — сумата не се маха
    //    отникъде, освен като нулираш цялата касичка. Връщаме последното.
    const назад = el('button', 'jr-chip', '↩ Върни последното'); назад.type = 'button'; назад.hidden = true;
    const обнови = () => {
      const p = Math.min(100, Math.round(g.saved / g.target * 100));
      const f = bar.querySelector('.gl-fill'); if (f) f.style.transform = 'scaleX(' + (p / 100) + ')';
      const t = bar.querySelector('.gl-txt'); if (t) t.textContent = `${g.saved} / ${g.target} лв · ${p}%`;
      мал.textContent = g.saved >= g.target
        ? (g.saved > g.target ? 'Събрахте ги — и още ' + (+(g.saved - g.target).toFixed(2)) + ' лв отгоре. 🎉' : 'Събрахте ги! 🎉')
        : 'Остават ' + (+(g.target - g.saved).toFixed(2)) + ' лв.';
    };
    const quick = el('div', 'jr-quick');
    [5, 10, 20, 50].forEach(v => {
      const b = el('button', 'jr-chip', '+' + v + ' лв'); b.type = 'button';
      b.addEventListener('click', () => {
        const преди = g.saved;
        g.saved = +(g.saved + v).toFixed(2); save('bl_goal', g);
        назад.hidden = false; назад.__преди = преди;
        // картата вече не се пресъздава при всяко докосване — лентата се движи
        обнови();
        if (преди < g.target && g.saved >= g.target) { fx().confetti(bar); fx().cheer('СЪБРАХТЕ ГИ! 🎉 ' + g.n + ' идва!'); }
        else fx().buzz(10);
      });
      quick.appendChild(b);
    });
    назад.addEventListener('click', () => {
      if (назад.__преди === undefined) return;
      g.saved = назад.__преди; save('bl_goal', g);
      назад.hidden = true; назад.__преди = undefined;
      обнови(); fx().buzz(8);
    });
    const reset = el('button', 'jr-chip', '↺ нова цел'); reset.type = 'button';
    reset.addEventListener('click', () => { (window.BL_UI ? BL_UI.confirm('Нова касичка? Старата се нулира.', { emoji: '🐷', okText: 'Нова', cancelText: 'Отказ' }) : Promise.resolve(confirm('Нова касичка? Старата се нулира.'))).then(да => { if (да) { save('bl_goal', null); c.replaceWith(goalCard()); } }); });
    quick.appendChild(назад);
    quick.appendChild(reset);
    c.appendChild(quick);
    c.appendChild(мал);
    обнови();
    return c;
  }

  // 👕 Гардероб-инвентар
  function wardrobeCard() {
    const c = card('Гардеробчето 👕 <span class="jr-sub">какво имате по размери — да не купиш пак 62!</span>');
    const w = load('bl_wardrobe', {});
    const grid = el('div', 'wd-grid');
    // 👆 12.08 (мерено): mega.css дава на ± твърди 24×24, touch.css ги вдига до
    //    40 — но в четириколонния грид клетката е 73 px, а съдържанието ѝ иска
    //    91: гридът тръгваше на хоризонтален скрол (scrollWidth 330 > 311) и
    //    последната колонка се криеше. Мерено с две колони и цели 44×44:
    //    клетка 152 px, scrollWidth 311 = clientWidth 311 — нула скрол, нула
    //    смачкване. На по-широк екран auto-fit сам връща три и четири колони.
    //    ПЪТ НАЗАД: махаш този ред и трите style реда при бутоните по-долу.
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
    // 🔴 11.08 (обиколка „документи и пари“): долният ред се пишеше ВЕДНЪЖ, при
    //    строежа. Мама брои дрешките в магазина, натиска „+“ до 74 три пъти —
    //    квадратчето показва 3, а редът отдолу продължава да казва „имате 0 бр.“
    //    Точно това, което картата обещава да предотврати („да не купиш пак“).
    //    Числото се появяваше чак след презареждане. Сега редът се пресмята пак.
    const обобщение = el('p', 'jr-privacy', '');
    const a = window.BL_AGE ? BL_AGE(getBaby().birth) : null;
    const сегашен = a ? (a.months < 1 ? '56' : a.months < 3 ? '62' : a.months < 6 ? '68' : a.months < 9 ? '74' : a.months < 12 ? '80' : a.months < 18 ? '86' : '92') : null;
    const освежи = () => {
      if (!сегашен) return;
      const бр = w[сегашен] || 0;
      обобщение.innerHTML = `Сега сте ~размер <strong>${сегашен}</strong> — ${бр ? 'имате ' + бр + ' бр. от него.' : 'нямам записани бройки от него (може и да имате — просто не са броени тук).'}`;
    };
    ['50', '56', '62', '68', '74', '80', '86', '92'].forEach(sz => {
      const cell = el('div', 'wd-cell');
      const n = w[sz] || 0;
      cell.innerHTML = `<span class="wd-sz">${sz}</span><div class="wd-ctl"><button type="button">−</button><strong>${n}</strong><button type="button">+</button></div>`;
      const [minus, plus] = cell.querySelectorAll('button');
      const num = cell.querySelector('strong');
      // ♿ 11.08 (клавиатура-четец): осем размера × „−/+" = шестнайсет еднакви
      //    бутона. Четецът казваше „минус, нула, плюс" осем пъти — мама нямаше
      //    как да разбере на кой размер стои. Размерът влиза в името.
      minus.setAttribute('aria-label', 'Едно по-малко от размер ' + sz);
      plus.setAttribute('aria-label', 'Едно повече от размер ' + sz);
      minus.style.cssText += ';min-width:44px;min-height:44px;width:44px;height:44px;';
      plus.style.cssText += ';min-width:44px;min-height:44px;width:44px;height:44px;';
      num.setAttribute('aria-live', 'polite');
      num.setAttribute('aria-label', 'бройки от размер ' + sz);
      minus.addEventListener('click', () => {
        // 🔇 12.08 (мерено): „−“ на нула не правеше НИЩО — нито числото, нито
        //    редът отдолу, нито паметта. Мама натиска пак и пак. Сега казваме.
        if (!(w[sz] || 0)) { num.textContent = '0'; обобщение.textContent = 'Размер ' + sz + ' е вече на нула — по-надолу няма. 💜'; fx().buzz(5); setTimeout(освежи, 1600); return; }
        w[sz] = w[sz] - 1; save('bl_wardrobe', w); num.textContent = w[sz]; fx().buzz(5); освежи();
      });
      plus.addEventListener('click', () => { w[sz] = (w[sz] || 0) + 1; save('bl_wardrobe', w); num.textContent = w[sz]; fx().buzz(6); освежи(); });
      grid.appendChild(cell);
    });
    c.appendChild(grid);
    // 12.08: редът се закачаше САМО когато има рождена дата — а сега през него
    //    говори и „−“ на нула. Стои винаги; при непопълнена дата е просто празен.
    освежи(); c.appendChild(обобщение);
    return c;
  }

  // 👵 Картичка за бабата — авто-попълнена
  function grannyCard() {
    const c = card('Картичка за бабата 👵 <span class="jr-sub">всичко важно, когато бебето остава при някого</span>');
    const ta = el('textarea', 'jr-paper'); ta.rows = 2; ta.placeholder = 'Особености: „заспива само със зайчето“, „обича да гледа през прозореца“…';
    ta.dataset.draft = 'bl_granny_notes'; ta.value = load('bl_granny_notes', '');
    const btn = el('button', 'jr-btn', '🖨️ Направи картичката'); btn.type = 'button';
    btn.addEventListener('click', () => {
      const baby = getBaby();
      const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
      const sos = load('bl_sos', {});
      const feed = load('bl_feed', null);
      const tried = load('bl_tried', {});
      const alrg = Object.keys(tried).filter(k => (tried[k] || '').includes('⚠️')).concat(load('bl_allergy_manual', []));
      // 🟡 12.08: тук се вземаше ПЪРВАТА добавена песен и на листа за бабата
      //    излизаше „🎵 Любимата песничка: …“. Плейлистът няма „любима“ — това
      //    е просто най-старият запис. Приложението твърдеше нещо, което не
      //    знае, и бабата го чете като факт. Казваме какво наистина имаме.
      const song = (load('bl_playlist', [])[0] || {}).t;
      BL_EXPR.printOverlay('Нашето бебе — наръчник за близките',
        `<p class="pr-big">${esc(baby.name) || 'Бебето'}${a ? ' · ' + a.text : ''}</p>
         <ul class="pr-list">
           ${feed ? `<li>🍼 Последно хранене: ${new Date(feed.t).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</li>` : ''}
           ${/* 🔴 04.08 (обиколка, армия Инструменти): празният списък се превеждаше
                 като ПОЛОЖИТЕЛНО твърдение за безопасност. Алергиите се пълнят само
                 от стая „Захранване“ — дете с диагностицирана алергия, която мама не
                 е въвела, получаваше „💚 Няма известни алергии“ на листа за бабата.
                 Бабата чете зелената отметка като проверен факт и черпи. Празно
                 значи „нямам записано“, не „няма“. */''}
           ${alrg.length ? `<li>⚠️ ВНИМАВАЙ С: <strong>${alrg.map(esc).join(', ')}</strong></li>` : '<li>❔ За алергии <strong>питай мама</strong> — в приложението няма записани.</li>'}
           ${song ? `<li>🎵 Песничка от нашия списък: ${esc(song)}</li>` : ''}
           ${ta.value.trim() ? `<li>📝 ${esc(ta.value)}</li>` : ''}
           ${/* 🔴 05.08 (одит г06, №118): редът четеше `sos.doc` — ключ, който
                 никой не записва. Мама беше попълнила педиатъра в СОС-центъра,
                 а на листа за бабата пишеше само „Мама: ____". Точно човекът,
                 на когото се звъни, липсваше. Истинските ключове са pedPhone /
                 fastPhone (sos.js:15). Своя номер приложението не знае — затова
                 той честно остава за ръка, не се измисля. */''}
           <li>📞 Мама: __________ <small>(попълни на ръка)</small></li>
           ${sos.pedPhone ? `<li>🩺 Педиатър${sos.pedName ? ' ' + esc(sos.pedName) : ''}: <strong>${esc(sos.pedPhone)}</strong></li>` : ''}
           ${sos.fastPhone ? `<li>⭐ Бърз номер${sos.fastName ? ' — ' + esc(sos.fastName) : ''}: <strong>${esc(sos.fastPhone)}</strong></li>` : ''}
           <li>🚨 При спешност: 112</li>
         </ul>
         <p class="pr-note">Благодарим ти, че пазиш нашето съкровище! 💜</p>`);
    });
    c.appendChild(ta); c.appendChild(btn);
    return c;
  }

  // ═══════════════ регистрация по стаите ═══════════════

  const PACKS = {
    'Дневник на мама': r => { r.appendChild(constellationCard()); r.appendChild(dayPhotoCard()); r.appendChild(wordCloudCard()); if (window.BL_EXPR) r.appendChild(BL_EXPR.voiceCard('Гласови бележки 🎙️ <span class="jr-sub">кажи го — за 3 през нощта, когато писането е много</span>', 'bl_voice', { maxSec: 30 })); const пс = lettersCard(); if (пс) r.appendChild(пс); },
    'Бременност': r => { [symptomCard(), pregWeightCard(), bumpCard(), letterToBabyCard(), namesCard(), playlistCard(), birthPlanCard()].forEach(c => c && r.appendChild(c)); },
    'Моето бебе': r => { r.appendChild(nursingCard()); r.appendChild(weekPicCard()); r.appendChild(recordsCard()); if (window.BL_EXPR) r.appendChild(BL_EXPR.voiceCard('Звукови мигове 🎙️ <span class="jr-sub">гукане, смях, първа дума — съкровища</span>', 'bl_baby_sounds', { labels: ['гукане', 'смях', 'дума', 'друго'], maxSec: 20 })); },
    'Захранване': r => { r.appendChild(rainbowCard()); r.appendChild(menuCard()); r.appendChild(recipesCard()); r.appendChild(allergyPassCard()); if (window.BL_EXPR) r.appendChild(BL_EXPR.photoListCard('Първата реакция 😋 <span class="jr-sub">гримасите при нова храна — злато</span>', 'bl_food_faces', { notePrompt: 'Коя храна беше?', empty: 'Първата гримаса при броколи си заслужава кадър. 😄' })); },
    'Здраве и SOS': r => { r.appendChild(tempCard()); r.appendChild(medsCard()); r.appendChild(visitNoteCard()); if (window.BL_EXPR) r.appendChild(BL_EXPR.photoListCard('Фото на обрив 📷 <span class="jr-sub">снимай — показваш на лекаря как е изглеждало</span>', 'bl_rash', { notePrompt: 'Къде е обривът?', empty: 'Дано никога не потрябва. Но ако — снимай веднага.' })); r.appendChild(pharmacyCard()); },
    // 05.08 (одит г06, №181): тук имаше втора галерия за рисунки — „Първите
    // драскулки 🎨“ на ключ bl_art, с ДУМА ПО ДУМА същото подзаглавие като
    // „Рисунките по месеци 🎨“ (rooms15.js:185) и с друга памет. Двете падаха
    // едно до друго в кътче „🎨 Творби и спомени“: мама слагаше драскулка в
    // едната, а другата продължаваше да пише „първата драскулка идва скоро“.
    // Остава по-новата (rooms15) — тя пита и за месеца. Старите снимки се
    // преливат веднъж по-долу; bl_art НЕ се трие (това е пътят назад).
    'Развитие и игри': r => { r.appendChild(skillTreeCard()); r.appendChild(booksCard()); },
    'Инструменти': r => { r.appendChild(convCard()); r.appendChild(wardrobeCard()); r.appendChild(goalCard()); r.appendChild(grannyCard()); }
  };
  Object.keys(PACKS).forEach(room => {
    const base = window.ROOM_FEATURES && window.ROOM_FEATURES[room];
    if (base) window.ROOM_FEATURES[room] = root => { base(root); PACKS[room](root); };
    else { window.ROOM_FEATURES = window.ROOM_FEATURES || {}; window.ROOM_FEATURES[room] = root => PACKS[room](root); }
  });

  // 05.08 (одит г06, №181): еднократно преливане на старата галерия „Първите
  // драскулки" (bl_art) в останалата „Рисунките по месеци" (bl_art_months).
  // Двете носят една и съща форма {img, note, ts} (expr.js:70), затова сливането
  // е просто долепяне. Оригиналът остава непокътнат — ако нещо се обърка, махаш
  // само флага bl_art_merged и вдигаш пак старата карта.
  (function прелейДраскулките() {
    try {
      if (localStorage.getItem('bl_art_merged')) return;
      const стари = load('bl_art', []);
      if (стари.length) {
        const нови = load('bl_art_months', []);
        const имали = new Set(нови.map(x => x && x.ts));
        const добавка = стари.filter(x => x && !имали.has(x.ts));
        if (добавка.length && !save('bl_art_months', нови.concat(добавка))) return;  // няма памет → пробваме пак утре
      }
      localStorage.setItem('bl_art_merged', '1');
    } catch (e) {}
  })();

  window.BL_ROOMS3 = { constellationCard };
})();
