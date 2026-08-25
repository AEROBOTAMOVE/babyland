// ═══════════════════════════════════════════════════════════
// EXTRAS 2 — вълна 2 от идеите: списък за подаръци, 24-часов
// кръг на съня, фото-лента, пукни балончето, караоке приспивни,
// тяло-чекин, голям шрифт, мостче към магазина.
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const сложи = (r, к) => { if (к) r.appendChild(к); };  // 04.08: карта, пазена от паузата след загуба, връща null
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti: () => {}, cheer: () => {}, buzz: () => {} };
  const getBaby = () => load('bl_baby', { name: '', sex: '', birth: '' });
  // 🔔 11.08: „мълчалив бутон няма". Един тих ред за отговор, който сам си отива.
  //    textContent — не innerHTML: каквото мама е написала, влиза като ТЕКСТ.
  const знак = (възел, текст, ms) => {
    if (!възел) return;
    възел.textContent = текст; възел.hidden = false;
    clearTimeout(възел._t);
    възел._t = setTimeout(() => { възел.hidden = true; възел.textContent = ''; }, ms || 3000);
  };
  const плавно = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; } catch (e) { return 'auto'; } };

  // ═══════════ 🎁 СПИСЪК ЗА ПОДАРЪЦИ (registry) ═══════════

  function registryCard() {
    const c = card('Списък за подаръци 🎁 <span class="jr-sub">сподели го с баба, кака и кръстницата — да знаят какво да купят</span>');
    // 🔴 11.08 КАПАНЪТ НА СНИМКАТА: прочетено при РИСУВАНЕ, записвано при клик.
    //    Ако картата е на екрана два пъти (стаята и в скрития панел), втората
    //    записва старото си копие отгоре и трие чуждото мълчаливо. Пресен
    //    прочит при всяко рисуване и точно преди всеки запис; редовете се
    //    намират по ТЕКСТ, защото номерът важи само за старата снимка.
    let items = load('bl_registry', []);
    const inp = el('input', 'jr-word'); inp.maxLength = 60; inp.placeholder = 'Какво ви трябва… (напр. „Ританки р.62“)';
    const addB = el('button', 'jr-chip', '+ Добави'); addB.type = 'button';
    const row = el('div', 'jr-addrow'); row.appendChild(inp); row.appendChild(addB);
    const presets = el('div', 'jr-quick rg-presets');
    const чипове = [];
    // 22.07 (жива обиколка): вече добавен пресет мълчеше при второ докосване —
    // мама натиска „Пелени NB“, нищо не мърда и не знае дали го е добавила.
    // Сега чипът сам казва „вече е в списъка“: отметка + приглушен.
    function освежиЧипове() {
      чипове.forEach(({ б, име }) => {
        const вътре = items.some(i => i.t === име);
        б.classList.toggle('rg-added', вътре);
        б.textContent = (вътре ? '✔ ' : '') + име;
        б.title = вътре ? 'Вече е в списъка' : 'Добави в списъка';
      });
    }
    // 🟠 11.08 (обиколка „документи и пари“): предложенията бяха заковани за
    //    новородено — на 7-месечно бебе (размер 74) картата подсказваше
    //    „Бодита р.62“ и „Пелени NB“. Списъкът се праща на баба и тя купува
    //    точно каквото пише; това са похарчени пари за дрешки, които не стават.
    //    Размерът се смята от възрастта, както в „Гардеробчето“.
    const въз = window.BL_AGE ? BL_AGE(getBaby().birth) : null;
    const м = въз ? въз.months : null;
    const рзм = m => m == null ? '62' : m < 1 ? '56' : m < 3 ? '62' : m < 6 ? '68' : m < 9 ? '74' : m < 12 ? '80' : m < 18 ? '86' : '92';
    ['Столче за кола', 'Бодита р.' + рзм(м), (м == null || м < 1) ? 'Пелени NB' : 'Пелени', 'Гризалка', 'Мека книжка', 'Одеялце'].forEach(p => {
      const b = el('button', 'jr-chip', p); b.type = 'button';
      b.addEventListener('click', () => {
        if (items.some(i => i.t === p)) { fx().cheer('„' + p + '“ вече е в списъка ✔'); return; }
        items = load('bl_registry', []);   // пресен прочит ПРЕДИ записа
        items.push({ t: p, done: false }); save('bl_registry', items); draw(); fx().buzz(8);
      });
      чипове.push({ б: b, име: p });
      presets.appendChild(b);
    });
    const list = el('div', 'jr-wins');
    const бележка = el('p', 'jr-reply'); бележка.hidden = true;
    const отмяна = el('button', 'jr-chip', '↺ Върни последното'); отмяна.type = 'button'; отмяна.hidden = true;
    const ръчно = el('textarea', 'jr-paper'); ръчно.readOnly = true; ръчно.rows = 6; ръчно.hidden = true;
    ръчно.setAttribute('aria-label', 'Списъкът за подаръци — за ръчно копиране');
    let върнато = null;
    отмяна.addEventListener('click', () => {
      if (!върнато) { отмяна.hidden = true; return; }
      items = load('bl_registry', []);   // пресен прочит ПРЕДИ записа
      items.splice(Math.min(върнато.i, items.length), 0, върнато.it);
      save('bl_registry', items);
      знак(бележка, '✔ Върнах „' + върнато.it.t + '“');
      върнато = null; отмяна.hidden = true; clearTimeout(отмяна._t);
      draw(); fx().buzz(8);
    });
    function draw() {
      items = load('bl_registry', []);   // пресен прочит при всяко рисуване
      освежиЧипове();
      list.innerHTML = '';
      if (!items.length) { list.appendChild(el('p', 'jr-privacy', 'Добави каквото ви е нужно — после „Сподели“ и подаръците спират да се повтарят. 😄')); return; }
      items.forEach((it, i) => {
        const r = el('button', 'jr-win' + (it.done ? ' done' : '')); r.type = 'button';
        // 👆 11.08 (измерено): 🗑 беше 40px широк — под прага за пръст, а стои
        //    плътно до самия ред, чието докосване значи „купено". Уцелиш ли
        //    съседа, редът се ТРИЕ. Явни 44 + път назад отдолу.
        r.innerHTML = `<span class="jr-check">${it.done ? '✔' : ''}</span> <span class="rg-t">${esc(it.t)}</span><span class="nt-del" role="button" aria-label="Махни от списъка" style="min-width:44px">🗑</span>`;
        r.addEventListener('click', (e) => {
          if (e.target.classList.contains('nt-del')) {
            върнато = { it: items[i], i };
            items = load('bl_registry', []);   // пресен прочит ПРЕДИ записа
            const k = items.findIndex(x => x && x.t === it.t);   // по ТЕКСТ, не по номер
            if (k > -1) { върнато.i = k; items.splice(k, 1); }
            save('bl_registry', items); draw();
            знак(бележка, '🗑 Махнах „' + върнато.it.t + '“', 10000);
            отмяна.hidden = false;
            clearTimeout(отмяна._t);
            отмяна._t = setTimeout(() => { отмяна.hidden = true; върнато = null; }, 10000);
            return;
          }
          it.done = !it.done;
          items = load('bl_registry', []);   // пресен прочит ПРЕДИ записа
          const мой = items.find(x => x && x.t === it.t); if (мой) мой.done = it.done;
          // 🔴 25.08 (dev/lazhliv_uspeh.js): отговорът се хвърляше — отметката
          //    светваше и „✔ купено" излизаше и когато записът е паднал. При
          //    следващото отваряне отметката я нямаше. `save` тук е тих (ред 11),
          //    затова истината идва от общия модал BL_ZAPIS_PADNA (js/rooms.js:41).
          if (!save('bl_registry', items)) {
            it.done = !it.done;                     // връщаме и паметта на екрана назад
            if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA();
            return;
          }
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = it.done ? '✔' : '';
          знак(бележка, it.done ? '✔ „' + it.t + '“ — купено' : '↩ „' + it.t + '“ пак чака', 2200);
        });
        list.appendChild(r);
      });
    }
    // 🔴 11.08 (измерено с натискане): с празно поле (или само интервали) „+ Добави"
    //    не правеше АБСОЛЮТНО нищо — нито дума, нито мигване. Мама натиска три
    //    пъти и решава, че картата е счупена. Сега полето само се обажда.
    addB.addEventListener('click', () => {
      const v = inp.value.trim().slice(0, 60);
      if (!v) { знак(бележка, '✍️ Първо напиши какво ви трябва — после „+ Добави“.'); inp.focus(); return; }
      const има = items.find(i => String(i.t).toLowerCase() === v.toLowerCase());
      if (има) { знак(бележка, '„' + v + '“ вече е в списъка ✔'); inp.select(); return; }
      items = load('bl_registry', []);   // пресен прочит ПРЕДИ записа
      // 🔴🔴 25.08 (dev/pylna_pamet.js, живо натискане при пълна памет): полето
      //    се чистеше и отдолу пишеше „✔ Добавих", а в паметта нямаше нищо.
      //    ЖЕЛЯЗНО: полето се чисти САМО след потвърден запис. `save` тук е тих
      //    (ред 11) → истината идва от знака и от общия модал BL_ZAPIS_PADNA.
      items.push({ t: v, done: false });
      if (!save('bl_registry', items)) {
        items.pop();
        знак(бележка, '😕 Не можах да го добавя — паметта на телефона е пълна. Написаното ти стои в полето.', 6000);
        if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA();
        return;
      }
      inp.value = ''; draw();
      знак(бележка, '✔ Добавих „' + v + '“'); fx().buzz(8);
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addB.click(); } });
    const shareB = el('button', 'jr-btn', 'Сподели списъка 📤'); shareB.type = 'button';
    shareB.addEventListener('click', async () => {
      const nm = getBaby().name || 'бебето';
      const open = items.filter(i => !i.done);
      if (!open.length) { fx().cheer('Списъкът е празен или всичко е купено! 🎉'); return; }
      const text = `🎁 Списък за подаръци за ${nm}:\n` + open.map(i => '• ' + i.t).join('\n') + '\n\n(с обич, през Baby Land 🎈)';
      if (navigator.share) { try { await navigator.share({ text }); знак(бележка, '✔ Пратих го нататък'); return; } catch (e) { if (e.name === 'AbortError') { знак(бележка, 'Добре — списъкът си стои тук. 💜', 2200); return; } } }
      try { await navigator.clipboard.writeText(text); fx().cheer('Копирано! Прати го на когото искаш 📤'); знак(бележка, '✔ Копирах списъка'); return; } catch (e) {}
      // 🔴 11.08 (измерено): при телефон без „Сподели" И със забранен клипборд
      //    (често в приложение-режим) бутонът мълчеше НАПЪЛНО — 0 съобщения,
      //    0 промени. Не оставяме мама с нищо: списъкът излиза, готов за
      //    задържане с пръст и „Копирай".
      ръчно.value = text; ръчно.hidden = false;
      знак(бележка, 'Телефонът не ми позволи да копирам сама. Задръж пръст върху текста отдолу и избери „Копирай“. 💜', 9000);
      try { ръчно.focus(); ръчно.setSelectionRange(0, text.length); } catch (e) {}
      try { ръчно.scrollIntoView({ block: 'center', behavior: плавно() }); } catch (e) {}
    });
    c.appendChild(row); c.appendChild(presets); c.appendChild(бележка); c.appendChild(отмяна); c.appendChild(list); c.appendChild(shareB); c.appendChild(ръчно);
    draw();
    return c;
  }

  // ═══════════ 🕐 24-ЧАСОВ КРЪГ НА СЪНЯ ═══════════

  function polar(cx, cy, r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function arcPath(cx, cy, r, a0, a1, w) {
    if (a1 - a0 >= 360) a1 = a0 + 359.9;
    const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }
  function sleepClockCard() {
    const c = card('Денят като часовник 🕐 <span class="jr-sub">кога спа бебето днес — с един поглед</span>');
    const box = el('div', 'sc24-box');
    c.appendChild(box);
    function draw() {
      // `load` дава подразбирането само при ЛИПСВАЩ ключ. Запис от стара
      // версия или от внесено копие без `segs` събаряше цялата карта.
      const s = load('bl_sleep', {});
      if (!Array.isArray(s.segs)) s.segs = [];
      const segs = (s.d === today()) ? s.segs.slice() : [];
      if (s.d === today() && s.open) segs.push({ s: s.open, e: Date.now() });
      const cx = 110, cy = 110, R = 86;
      let svg = `<svg viewBox="0 0 220 220" class="sc24">`;
      svg += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#efeaf7" stroke-width="16"/>`;
      for (let h = 0; h < 24; h += 3) {
        const [tx, ty] = polar(cx, cy, R + 22, h / 24 * 360);
        svg += `<text x="${tx}" y="${ty + 3}" text-anchor="middle" class="sc24-lbl">${h}</text>`;
      }
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
      const toDeg = ts => ((ts - dayStart.getTime()) / 86400000) * 360;
      segs.forEach(g => {
        svg += `<path pathLength="1" class="sc24-seg" d="${arcPath(cx, cy, R, Math.max(0, toDeg(g.s)), Math.min(360, toDeg(g.e)))}" fill="none" stroke="#b9a7e0" stroke-width="16" stroke-linecap="round"/>`;
      });
      const [nx, ny] = polar(cx, cy, R, toDeg(Date.now()));
      svg += `<circle class="sc24-now" cx="${nx}" cy="${ny}" r="7" fill="#e56ba4" stroke="#fff" stroke-width="2.5"/>`;
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="sc24-mid">😴</text>`;
      const totalMin = Math.floor(segs.reduce((a, g) => a + (g.e - g.s), 0) / 60000);
      svg += `<text x="${cx}" y="${cy + 22}" text-anchor="middle" class="sc24-tot">${Math.floor(totalMin / 60)}ч ${totalMin % 60}м</text>`;
      svg += `</svg>`;
      box.innerHTML = svg + (segs.length ? '' : '<p class="jr-privacy">Ползвай „Сънят днес“ горе (заспа/събуди се) и кръгът се пълни сам. 💜</p>');
    }
    draw();
    return c;
  }

  // ═══════════ 📸 ФОТО-ЛЕНТА НА РАСТЕЖА ═══════════

  function photoCard() {
    const c = card('Фото-лента 📸 <span class="jr-sub">по една снимка на месец — виж как расте</span>');
    const baby = getBaby();
    const a = window.BL_AGE ? BL_AGE(baby.birth) : null;
    const maxM = a ? Math.min(24, Math.max(1, a.ym + 1)) : 12;
    // 🔴 11.08 капанът на снимката (виж registryCard горе)
    let photos = load('bl_photos', {});
    const grid = el('div', 'pho-grid');
    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    const бележка = el('p', 'jr-reply'); бележка.hidden = true;
    let target = 0;
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      знак(бележка, '📸 Приемам снимката…', 8000);
      const img = new Image();
      // 🔴 11.08 (измерено с истински файл image/heic): без `onerror` картата
      //    МЪЛЧЕШЕ напълно — 0 промени, 0 съобщения. Точно това се случва на
      //    всяка мама с iPhone, чиито снимки са .HEIC.
      img.onerror = () => {
        try { URL.revokeObjectURL(img.src); } catch (e) {}
        знак(бележка, 'Тази снимка не се отваря тук (често е .HEIC от iPhone). Пробвай друга или я запиши като JPG. 😕', 7000);
        fx().cheer('Тази снимка не се отваря тук — пробвай друга. 😕');
      };
      img.onload = () => {
        const cnv = document.createElement('canvas');
        const k = Math.min(1, 360 / Math.max(img.width, img.height));
        cnv.width = Math.round(img.width * k); cnv.height = Math.round(img.height * k);
        cnv.getContext('2d').drawImage(img, 0, 0, cnv.width, cnv.height);
        photos = load('bl_photos', {});   // пресен прочит ПРЕДИ записа
        photos[target] = cnv.toDataURL('image/jpeg', 0.78);
        if (!save('bl_photos', photos)) {
          fx().cheer('Паметта се напълни — изтрий стара снимка. 😕');
          знак(бележка, '😕 Паметта се напълни — изтрий стара снимка.', 6000);
          delete photos[target];
        } else {
          знак(бележка, '✔ Прибрах я при ' + (target === 0 ? 'раждането' : target + ' м.'));
          // 🔁 11.08 (клас Б8): ключът `bl_photo_day` се чете от „днешната
          //    разходка" (js/daily.js, js/profile.js). rooms3.js пре-рисува
          //    след запис, тази карта — не: мама слага снимка, а началният
          //    екран още твърди, че снимка няма, до следващото зареждане.
          // 🔵 25.08 (dev/lazhliv_uspeh.js го извади): „✔ Прибрах я" е за СНИМКАТА,
          //    а тя е вече ПРОВЕРЕНА три реда по-горе (`if (!save('bl_photos', …))`).
          //    `bl_photo_day` е само отметка за дневната разходка — стои СЛЕД
          //    надписа, защото надписът не зависи от нея; а падне ли, няма смисъл
          //    да пращаме началния екран да се пре-рисува за нищо.
          if (save('bl_photo_day', today()) && window.refreshToday) { try { refreshToday(); } catch (e) {} }
        }
        URL.revokeObjectURL(img.src);
        draw();
        fx().buzz(12);
      };
      img.src = URL.createObjectURL(f);
      file.value = '';
    });
    c.appendChild(file);
    function draw() {
      photos = load('bl_photos', {});   // пресен прочит при всяко рисуване
      grid.innerHTML = '';
      for (let m = 0; m <= maxM; m++) {
        const cell = el('button', 'pho-cell'); cell.type = 'button';
        if (photos[m]) {
          cell.innerHTML = `<img src="${photos[m]}" alt="${m} м."><span class="pho-m">${m === 0 ? '🐣' : m + 'м'}</span>`;
          cell.addEventListener('click', () => view(m));
        } else {
          cell.classList.add('empty');
          cell.innerHTML = `<span class="pho-plus">+</span><span class="pho-m">${m === 0 ? 'раждане' : m + ' м.'}</span>`;
          cell.addEventListener('click', () => { target = m; file.click(); });
        }
        grid.appendChild(cell);
      }
    }
    function view(m) {
      let ov = document.getElementById('phoView');
      if (!ov) {
        ov = el('div', 'br-overlay'); ov.id = 'phoView';
        document.body.appendChild(ov);
      }
      ov.innerHTML = `<div class="pho-viewbox"><img src="${esc(photos[m])}"><p>${esc(baby.name) || 'Бебето'} · ${m === 0 ? 'при раждането' : (window.BL_BROI ? BL_BROI(m, 'месец', 'месеца') : m + ' ' + (m === 1 ? 'месец' : 'месеца'))}</p>
        <div class="jr-quick"><button class="jr-chip" id="phoDel" type="button">🗑 Изтрий</button><button class="jr-chip" id="phoClose" type="button">Затвори</button></div></div>`;
      ov.hidden = false;
      ov.querySelector('#phoClose').onclick = () => { ov.hidden = true; };
      // 🗑 11.08: „Изтрий" стоеше плътно до „Затвори" и триеше ЕДНА месечна
      //    снимка на бебето мигновено и завинаги. Второ докосване, за да е
      //    решение, не спъване. (Дублира се в js/expr.js — същият занаят.)
      const изтрий = ov.querySelector('#phoDel');
      let сигурна = false;
      изтрий.onclick = () => {
        if (!сигурна) {
          сигурна = true; изтрий.textContent = '🗑 Наистина? Натисни пак';
          setTimeout(() => { if (сигурна) { сигурна = false; изтрий.textContent = '🗑 Изтрий'; } }, 4000);
          return;
        }
        photos = load('bl_photos', {});   // пресен прочит ПРЕДИ записа
        delete photos[m]; save('bl_photos', photos); ov.hidden = true; draw();
        знак(бележка, '🗑 Махнах снимката от ' + (m === 0 ? 'раждането' : m + ' м.'), 4000);
      };
      ov.onclick = e => { if (e.target === ov) ov.hidden = true; };
    }
    c.appendChild(бележка);
    c.appendChild(grid);
    c.appendChild(el('p', 'jr-privacy', '🔒 Снимките се смаляват и живеят само на телефона ти.'));
    draw();
    return c;
  }

  // ═══════════ 🎈 ПУКНИ БАЛОНЧЕТО (анти-стрес) ═══════════

  function bubbleGame() {
    let ov = document.getElementById('bubGame');
    if (!ov) { ov = el('div', 'bub-overlay'); ov.id = 'bubGame'; document.body.appendChild(ov); }
    ov.innerHTML = `<div class="bub-hud"><span id="bubScore">0</span> пукнати · <span id="bubTime">30</span>с <button class="jr-chip" id="bubQuit" type="button">Изход</button></div>`;
    ov.hidden = false;
    let score = 0, timeLeft = 30, alive = true;
    const scoreEl = ov.querySelector('#bubScore'), timeEl = ov.querySelector('#bubTime');
    ov.querySelector('#bubQuit').onclick = end;
    const colors = ['#f6b6d2', '#a8cdec', '#b9e3d2', '#f5d9a0', '#cbbcec'];
    const spawner = setInterval(() => {
      if (!alive) return;
      const b = el('button', 'bub'); b.type = 'button';
      // ♿ 11.08 (клавиатура-четец): балончетата са безименни бутони, които сами
      //    се раждат и умират — четецът ги брои като „бутон, бутон, бутон" и
      //    затрупва изхода. Играта е чисто визуална: не влизат в обхождането.
      b.setAttribute('aria-hidden', 'true'); b.tabIndex = -1;
      const size = 44 + Math.random() * 40;
      b.style.cssText = `left:${5 + Math.random() * 85}%; width:${size}px; height:${size}px; background:${colors[Math.floor(Math.random() * colors.length)]}; animation-duration:${4.5 + Math.random() * 3}s;`;
      b.addEventListener('pointerdown', () => {
        if (b.classList.contains('pop')) return;
        b.classList.add('pop'); score++; scoreEl.textContent = score;
        fx().buzz(8);
        setTimeout(() => b.remove(), 220);
      });
      b.addEventListener('animationend', () => b.remove());
      ov.appendChild(b);
    }, 520);
    const ticker = setInterval(() => {
      timeLeft--; timeEl.textContent = timeLeft;
      if (timeLeft <= 0) end();
    }, 1000);
    function end() {
      if (!alive) return;
      alive = false; clearInterval(spawner); clearInterval(ticker);
      ov.querySelectorAll('.bub').forEach(b => b.remove());
      const done = el('div', 'bub-done', `<p>🎈 ${score} пукнати балончета!</p><p class="bub-sub">По-леко ли е? 😊</p><button class="jr-btn" type="button">Готово 💜</button>`);
      ov.appendChild(done);
      done.querySelector('button').onclick = () => { ov.hidden = true; done.remove(); };
    }
  }
  function bubbleCard() {
    const c = card('Пукни балончето 🎈 <span class="jr-sub">30 секунди глупаво и прекрасно анти-стрес</span>');
    const b = el('button', 'jr-btn', 'Играй! 🎈'); b.type = 'button';
    b.addEventListener('click', bubbleGame);
    c.appendChild(b);
    return c;
  }

  // ═══════════ 🎵 КАРАОКЕ ПРИСПИВНИ ═══════════

  const SONGS = {
    'Зайченцето бяло 🐰': 'Зайченцето бяло\nцял ден си играло\nв горската полянка\nсъс своята другарка.\n\nЩом се мръкна вече,\nв къщичка далече\nвсички се прибраха\nи сладко заспаха. 🌙',
    'Пляс-пляс ръчички 👏': 'Пляс, пляс, пляс ръчички,\nпляс, пляс, пляс!\nМама пее песничка\nтихичко на глас.\n\nТроп, троп, троп краченца,\nтроп, троп, троп!\nРасне ми юначе —\nхоп, хоп, хоп! 💛',
    'Люлка люлчица 🌙': 'Люлка, люлчица,\nспинкай, детчица.\nМама е до теб,\nсънчо иде с лек посев.\n\nЗвездичките греят,\nприказки живеят.\nСпинкай, мило, спинкай ти —\nмама тук ще бди. 💜'
  };
  function lullabyCard() {
    const c = card('Приспивни песнички 🎵 <span class="jr-sub">думите, когато умората ги е скрила</span>');
    const row = el('div', 'jr-quick');
    const out = el('div', 'lul-out');
    Object.keys(SONGS).forEach((name, i) => {
      const b = el('button', 'jr-chip' + (i === 0 ? '' : ''), name); b.type = 'button';
      b.addEventListener('click', () => {
        // смяна на песничка спира предишния глас — иначе двете се застъпват
        try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
        row.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on');
        out.innerHTML = `<div class="lul-text pop">${SONGS[name].split('\n').map(l => l ? `<p>${l}</p>` : '<br>').join('')}</div>
          <button class="jr-chip" type="button">🔊 Изпей я вместо мен</button>`;
        const говори = out.querySelector('button');
        const покой = '🔊 Изпей я вместо мен';
        // 🔴 11.08 (измерено): натиснато веднъж — speechSynthesis.speaking стана
        //    true, а бутонът НЕ СЕ ПРОМЕНИ с нищо. Мама в 3 през нощта не знае
        //    дали е тръгнало и НЯМА как да го спре — второто докосване само
        //    започваше отначало. А на телефон без български глас не се случва
        //    нищо и никой не ѝ го казва.
        говори.addEventListener('click', () => {
          const S = window.speechSynthesis;
          if (!S || typeof window.SpeechSynthesisUtterance !== 'function') {
            говори.textContent = '🤍 Този телефон не чете на глас — но думите са тук';
            setTimeout(() => { говори.textContent = покой; }, 3500);
            return;
          }
          if (S.speaking || S.pending) { S.cancel(); говори.textContent = покой; return; }
          let тръгна = false;
          try {
            const u = new SpeechSynthesisUtterance(SONGS[name].replace(/\n/g, ', '));
            u.lang = 'bg-BG'; u.rate = 0.78; u.pitch = 1.15;
            u.onstart = () => { тръгна = true; говори.textContent = '⏹ Спри четенето'; };
            u.onend = u.onerror = () => { говори.textContent = покой; };
            S.speak(u);
            говори.textContent = '⏹ Спри четенето';
            setTimeout(() => {
              if (!тръгна) { говори.textContent = '🤍 Гласът не тръгна — но думите са тук'; setTimeout(() => { говори.textContent = покой; }, 3500); }
            }, 1400);
          } catch (e) {
            говори.textContent = '🤍 Гласът не тръгна — но думите са тук';
            setTimeout(() => { говори.textContent = покой; }, 3500);
          }
        });
      });
      row.appendChild(b);
    });
    c.appendChild(row); c.appendChild(out);
    return c;
  }

  // ═══════════ 🌷 КАК Е ТЯЛОТО ДНЕС ═══════════

  function bodyCard() {
    const c = card('Как е тялото днес? 🌷 <span class="jr-sub">възстановяването е маратон — бъди мека към себе си</span>');
    // 🔴 11.08 капанът на снимката (виж registryCard горе)
    let data = load('bl_body', {});
    const t = today();
    const row = el('div', 'jr-quick');
    const отговор = v => v === 'тежко' ? 'Чуто. Днес — минимум задачи, максимум милост. 🤗' : v === 'средно' ? 'Стъпка по стъпка. Тялото ти направи чудо. 🌱' : 'Прекрасно! Отбележи си какво помага. 🌸';
    [['🥀', 'тежко'], ['🌱', 'средно'], ['🌸', 'добре']].forEach(([e, v]) => {
      const b = el('button', 'jr-chip' + ((data[t] && data[t].v === v) ? ' on' : ''), e + ' ' + v); b.type = 'button';
      b.addEventListener('click', () => {
        row.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on');
        data = load('bl_body', {});   // пресен прочит ПРЕДИ записа
        data[t] = { v, n: (data[t] && data[t].n) || '' }; save('bl_body', data);
        msg.textContent = отговор(v);
        знак(записано, '✔ Запазено');
      });
      row.appendChild(b);
    });
    const msg = el('p', 'jr-reply', '');
    // 11.08: ако днес вече е отбелязано, чипът светеше, а редът мълчеше — сега
    // топлата дума се връща и при повторно отваряне, не само при ново докосване.
    if (data[t] && data[t].v) msg.textContent = отговор(data[t].v);
    const note = el('input', 'jr-word'); note.placeholder = 'Бележка (болежка, какво помогна…)'; note.maxLength = 90;
    const записано = el('p', 'jr-privacy'); записано.hidden = true;
    if (data[t]) note.value = data[t].n || '';
    // 11.08: бележката се пазеше НЕВИДИМО при всяка буква — нищо не казваше на
    // мама, че е прието. Тих знак, който не мига при всеки натиснат клавиш.
    note.addEventListener('input', () => {
      data = load('bl_body', {});   // пресен прочит ПРЕДИ записа
      data[t] = data[t] || { v: '' }; data[t].n = note.value; save('bl_body', data);
      clearTimeout(note._z);
      note._z = setTimeout(() => знак(записано, '✔ Запазено', 2200), 500);
    });
    // 🌷 05.08: bl_body се ПИШЕШЕ и никога не се четеше назад. Картата
    //   поглеждаше само `data[t]` — днешния ден — а всичко записано преди
    //   това лежеше в паметта невидимо. Мама пише „кръстът, помогна топла
    //   вана“, на другия ден полето е празно и записът ѝ сякаш го няма.
    //   (В резервното копие си влизаше — rooms2.js изнася всеки bl_ ключ —
    //   но копие, което не се вижда в приложението, не е обещание.)
    //   Показваме назад по начина на съседната карта в този файл („Списък
    //   за подаръци“): контейнер, който се пре-рисува. Броим само какво
    //   ИМА — празните дни не се споменават и не се смятат.
    const ЛИЦЕ = { 'тежко': '🥀', 'средно': '🌱', 'добре': '🌸' };
    const минали = el('div', 'jr-wins');
    function рисувайМинали() {
      минали.innerHTML = '';
      const дни = Object.keys(data)
        .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d < t && data[d] && typeof data[d] === 'object' &&
          (ЛИЦЕ[data[d].v] || String(data[d].n || '').trim()))
        .sort().reverse().slice(0, 5);
      if (!дни.length) return;                 // тихо: няма минало — няма и дума за него
      минали.appendChild(el('p', 'jr-privacy', 'Каквото си записала преди:'));
      дни.forEach(d => {
        const r = data[d];
        let кога = d;
        try { const дт = new Date(d + 'T12:00:00'); if (!isNaN(дт)) кога = дт.toLocaleDateString('bg-BG'); } catch (e) {}
        const бележка = String(r.n || '').trim();
        минали.appendChild(el('div', 'nl-row',
          '<span class="nl-x">' + (ЛИЦЕ[r.v] || '🌙') + '</span><span class="nl-t">' +
          esc(кога) + (ЛИЦЕ[r.v] ? ' · ' + esc(r.v) : '') +
          (бележка ? ' — ' + esc(бележка) : '') + '</span>'));
      });
    }
    рисувайМинали();
    c.appendChild(row); c.appendChild(msg); c.appendChild(note); c.appendChild(записано); c.appendChild(минали);
    return c;
  }

  // ═══════════ 🔎 ГОЛЯМ ШРИФТ ═══════════

  function bigFontCard() {
    const c = card('По-едър текст 🔎 <span class="jr-sub">за уморени очи в 3 през нощта</span>');
    const b = el('button', 'jr-btn', load('bl_bigfont', false) ? 'Върни нормалния размер' : 'Уголеми текста'); b.type = 'button';
    b.addEventListener('click', () => {
      const on = !load('bl_bigfont', false);
      save('bl_bigfont', on);
      document.documentElement.classList.toggle('big-font', on);
      b.textContent = on ? 'Върни нормалния размер' : 'Уголеми текста';
    });
    c.appendChild(b);
    return c;
  }

  // ═══════════ 🛍️ МОСТЧЕ КЪМ МАГАЗИНА ═══════════

  function shopConfigCard() {
    const c = card('Магазинчето 🛍️ <span class="jr-sub">за собственика: сложи линк и мостчетата светват</span>');
    const inp = el('input', 'jr-word'); inp.type = 'url'; inp.placeholder = 'https://адресът-на-магазина…';
    inp.value = load('bl_shop_url', '');
    const отг = el('p', 'jr-reply'); отг.hidden = true;
    // 11.08: записваше мълчаливо и приемаше адрес, който после мостчето тихо
    // изхвърля (safeUrl пуска само http/https) — оставаше усещане, че е сложен.
    inp.addEventListener('change', () => {
      const v = inp.value.trim();
      if (!v) { save('bl_shop_url', ''); знак(отг, 'Изчистих адреса — мостчетата се скриха.'); return; }
      if (!safeUrl(v)) { знак(отг, '⚠️ Приемам само пълен адрес, който започва с https://', 5000); return; }
      save('bl_shop_url', v); знак(отг, '✔ Записах адреса');
    });
    c.appendChild(inp); c.appendChild(отг);
    c.appendChild(el('p', 'jr-privacy', 'Когато има линк, в стаите се появяват деликатни бутончета „виж в магазина“.'));
    return c;
  }
  // 🔒 М−1: адресът се пази в localStorage — значи може да дойде и от внесено
  // чуждо копие. `javascript:` в href се ИЗПЪЛНЯВА при натискане и чете всичко
  // на мама. Затова пускаме само истински уеб адреси.
  function safeUrl(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    // 🔴 11.08 (намерено при пробата на собствената ми поправка): вторият
    //    довод на `new URL` е ОСНОВАТА — тоест „не-е-адрес“ се превръщаше в
    //    http://…/не-е-адрес, протоколът излизаше http: и проверката казваше
    //    „добре“. Адрес на магазин винаги е ПЪЛЕН; искаме го явно.
    if (!/^https?:\/\//i.test(s)) return '';
    try {
      const u = new URL(s);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch (e) { return ''; }
  }

  function shopBridge(text) {
    const url = safeUrl(load('bl_shop_url', ''));
    if (!url) return null;
    const c = el('section', 'jr-card shop-bridge');
    c.innerHTML = `<p class="shop-txt">${esc(text)}</p>`;
    const a = el('a', 'jr-btn shop-btn', '🛍️ Виж в магазина');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    c.appendChild(a);
    return c;
  }

  // ═══════════ Регистрация ═══════════

  const EXTRAS3 = {
    'Инструменти': r => {
      r.appendChild(registryCard());
      if (window.BL_NOTES_CARD) r.appendChild(BL_NOTES_CARD('Домашен бележник 📝', 'размери, идеи, сметки — каквото не бива да се забрави', 'bl_notes_tools', 'Свободен текст — твоето бяло поле…'));
      // 🔴 г13/199: „По-едър текст“ имаше ДВА превключвателя в едно и също кътче —
      //   ключето в решетката „Настройки ⚙️“ (polish.js) и тази карта. Картата
      //   рисуваше надписа си само при СВОЙ клик, значи след уголемяване от
      //   решетката тя още канеше „Уголеми текста“ и я връщаше обратно. Остава
      //   един превключвател — този в решетката. bigFontCard() стои, ако потрябва.
      void bigFontCard;
      // 🛍️ г07/134: тази карта говори „за собственика“ и иска адрес на магазин —
      //   не е езикът на мама и не е нейна работа. Показва се само когато адрес
      //   ВЕЧЕ има, за да може да се СМЕНИ или ИЗЧИСТИ.
      // 🔴 05.08 (скептик 134): това условие обаче беше зазидало и вратата навън:
      //   редът отдолу е ЕДИНСТВЕНИЯТ, който пише bl_shop_url в целия код, а се
      //   рисува само когато ключът вече е пълен. Тоест ПЪРВОТО включване стана
      //   невъзможно от приложението. Картата остава скрита (мястото ѝ не е при
      //   мама), но първоначалното слагане вече има поддържан вход в shop.js:
      //   `BL_SHOP.задай('https://…')` — със същата проверка на адреса.
      if (load('bl_shop_url', '')) r.appendChild(shopConfigCard());
    },
    // 🕛 05.08: „Денят като часовник“ рисуваше СЪЩОТО денонощие от същите данни
    //    като „Денят на един кръг 🕛“ (rooms2.js) — два циферблата в една стая,
    //    единият без храненията. Остава по-богатият; sleepClockCard вече не се
    //    закача тук (функцията стои, ако потрябва другаде).
    'Моето бебе': r => { r.appendChild(photoCard()); },
    'Дневник на мама': r => { r.appendChild(bubbleCard()); r.appendChild(bodyCard()); },
    'Развитие и игри': r => сложи(r, lullabyCard()),
    // 'Захранване': старото мостче е МАХНАТО (12.1). То не знаеше нито едно
    // от правилата: показваше се независимо от тревога, нямаше етикет „нашият
    // магазин“, не се изключваше и дублираше новото. Мостчетата вече ги прави
    // js/shop.js — на едно място, с всички забрани.
  };
  Object.keys(EXTRAS3).forEach(room => {
    const base = window.ROOM_FEATURES && window.ROOM_FEATURES[room];
    if (base) window.ROOM_FEATURES[room] = root => { base(root); EXTRAS3[room](root); };
  });

  // голям шрифт при зареждане
  if (load('bl_bigfont', false)) document.documentElement.classList.add('big-font');
})();
