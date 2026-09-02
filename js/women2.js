// ═══════════════════════════════════════════════════════════
// СТАЯ 8, част 2 — СТИЛЪТ · РИТУАЛИТЕ · ТАЙНИТЕ
// Чантата, която е само нейна. Гардеробът СЕГА (не „като отслабна").
// Заключеното дневниче. Нещата, които не казва на глас.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // ══════════════════════════════════════════════════════════════
  // 🔴🔴 25.08 · ПРАЗНАТА УЛОВКА — „🔒 Заключено" ВЪРХУ НИЩО
  //
  // Беше:  const save = (k, v) => { try { localStorage.setItem(…) } catch (e) {} };
  //
  // Тоест при пълна памет записът падаше ТИХО, а редът след него изписваше
  // „🔒 Заключено. Стои само на този телефон." И — най-лошото — чистеше полето.
  // Написаното изчезваше ДВА ПЪТИ: от паметта и от екрана. В тази стая това е
  // дневничето, изповедалнята, писмото до себе си след година и трите минути
  // свободно писане — най-дългите и най-личните текстове в приложението.
  //
  // ИЗМЕРЕНО с dev/interaktivno_jenata.js (сценарий С6, пълна памет): 76 места
  // в петте файла на стаята обявяваха успех, който не е станал; 24 от тях и
  // чистеха полето.
  //
  // ЖЕЛЯЗНОТО ПРАВИЛО ОТТУК НАТАТЪК:
  //     ПОЛЕ СЕ ЧИСТИ САМО СЛЕД ПОТВЪРДЕН ЗАПИС.
  // `save` връща да/не; всяко място, което чисти поле или казва „записано",
  // го пита. При „не" редът ОСТАВА в полето и мама чува какво е станало.
  // Същият модел като js/quickadd.js, js/pump.js и js/women4.js.
  //
  // ПЪТ НАЗАД: върни едноредовия `save` отгоре и махни проверките `if (!save…`.
  // ══════════════════════════════════════════════════════════════
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } };
  // едно изречение за всички места — казва къде Е текстът ѝ и какво да направи
  const НЕ_СЕ_ПОБРА = 'Не можах да го запазя — паметта на телефона е пълна. Написаното ти Е ТУК, в полето: освободи малко място (видеа, стари снимки) и натисни пак. Не го трий.';
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  // 🕛 22.07 (армия): `new Date('2026-07-28')` се чете като UTC-полунощ,
  //   а `today()` дава МЕСТНА дата. В София (UTC+2/+3) между полунощ и
  //   3 сутринта разликата става отрицателна и мама четеше „преди -1 дни“
  //   веднага след като е отметнала — точно в часовете, в които е будна.
  //   Сравняваме местна полунощ с местна полунощ.
  //
  // 🔴 29.07: точно тук поправката от 22.07 беше добавила ВТОРО
  //   `const localDate` — идентично на онова 12 реда по-горе. Дублиран
  //   `const` в един обхват е СИНТАКТИЧНА грешка: целият файл спираше да
  //   се изпълнява. Тоест поправката не само че не е работила — тя е
  //   изключила ЦЯЛАТА втора част на стая 8 (чантата само нейна,
  //   гардеробът СЕГА, заключеното дневниче, тайните). Мълчаливо, без
  //   грешка в конзолата, защото се чупи при парсване. Ползваме горното.
  const days = d => {
    if (typeof d !== 'string' || !d) return NaN;          // старо/внесено копие без дата
    const a = new Date(localDate(new Date())), b = new Date(d);
    return isNaN(b) ? NaN : Math.max(0, Math.round((a - b) / 86400000));
  };

  // 🔴 11.08 (обиколка по телефон): МЪЛЧАЛИВ БУТОН на седем места. Тап по „+“
  //   с празно поле, тап по вече добавен чип, тап по „📤“ с празен списък —
  //   нищо не мърдаше. Мама не разбира дали е счупено, или е тя. Всеки такъв
  //   изход вече казва защо и слага курсора в полето, което чака.
  const каз = (котва, txt, поле) => {
    if (!котва || !котва.parentNode) return;
    let p = котва.nextElementSibling;
    if (!p || !p.classList || !p.classList.contains('wm-say')) {
      p = el('p', 'jr-privacy wm-say', '');
      p.style.whiteSpace = 'pre-wrap';
      p.style.overflowWrap = 'anywhere'; p.style.wordBreak = 'break-word'; p.style.minWidth = '0';
      котва.parentNode.insertBefore(p, котва.nextSibling);
    }
    p.textContent = txt; p.hidden = false;
    clearTimeout(p._t); p._t = setTimeout(() => { p.hidden = true; }, 3200);
    if (поле) фокус(поле);
  };
  // 📱 В11: клавиатурата изяжда долната половина от екрана. Полето, в което
  //   пращаме мама да пише, трябва да е ВИДИМО след като тя изскочи — иначе
  //   тя пише на сляпо. Ползваме visualViewport (истинската височина СЛЕД
  //   клавиатурата), а не innerHeight, който на Android не се смалява.
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
    виж();
    setTimeout(виж, 320);   // втори път — след като клавиатурата вече е излязла
  }

  // 📱 11.08: `.jr-note` НЯМА нито едно правило в целия css/. Textarea пада на
  //   браузърното cols=20 и се мери 159×45 px в карта, широка 333 (измерено с
  //   getBoundingClientRect на 375px екран). Дневничето, писмото, мечтите и
  //   свободният ден — всичко, което мама пише с думи — се пишеше в кутийка,
  //   по-тясна от половин екран. Ширината се дава ТУК, защото css/ не е мой файл.
  //   ⚠️ вика се СЛЕД като е зададено `rows` — иначе чете подразбирането 2
  //   и високото поле остава ниско (хванато при мерене: 311×68 вместо ×96).
  const поле = t => {
    t.style.width = '100%'; t.style.boxSizing = 'border-box';
    t.style.minHeight = (t.rows > 3 ? 118 : t.rows > 2 ? 96 : 68) + 'px';
    t.style.resize = 'vertical';
    return t;
  };
  // 👆 11.08: измерено — „+“ беше 36×42. Прагът за пръст е 44×44.
  const пръст = b => { b.style.minWidth = '44px'; b.style.minHeight = '44px'; return b; };

  // ══════════════════════════════════════════════════════════════
  // 🔴 25.08 · ДЪЛГИЯТ ТЕКСТ СЕ ГУБЕШЕ, КОГАТО ТЕЛЕФОНЪТ ЗАТВОРИ ПРИЛОЖЕНИЕТО
  //
  // Полетата тук се пазеха САМО на `change` — тоест едва когато мама излезе от
  // полето. Ако телефонът затвори приложението, докато тя пише (обаждане,
  // бебето се събуди, заключен екран), `change` и `blur` НИКОГА не гърмят и
  // написаното си отива без следа.
  //
  // women3.js (qmeCard, tripCard) и women5.js (родиCard) вече слушат `input` с
  // изчакване точно заради това. Тези тук — не. ИЗМЕРЕНО с
  // dev/interaktivno_jenata.js (сценарий С2, само `input`, без `change`):
  // „Гардеробът СЕГА", „Мечтите ми" и „Ако имах един свободен ден" оставяха
  // паметта празна. Един помощник за трите, за да не се разминат пак.
  //
  // ⚠️ Тихо при `input` (мама пише), с дума при `change`/`blur` (мама спря) —
  //    иначе „Записано ✔" мига на всеки 600 ms и става папагал.
  // ПЪТ НАЗАД: върни голото `x.addEventListener('change', f)` на трите места.
  // ══════════════════════════════════════════════════════════════
  const пази = (възел, запиши) => {
    let ч = null;
    възел.addEventListener('input', () => { clearTimeout(ч); ч = setTimeout(() => запиши(false), 600); });
    възел.addEventListener('change', () => { clearTimeout(ч); запиши(true); });
    възел.addEventListener('blur', () => { clearTimeout(ч); запиши(true); });
    return възел;
  };

  // 🔴 11.08 (обиколка по телефон, В10): една дълга дума без интервал —
  //   поставен линк, име на парфюм, каквото и да е — разпъваше картата.
  //   ИЗМЕРЕНО: карта scrollWidth 726 при clientWidth 347, тоест мама трябва
  //   да влачи стаята настрани. Родителят реже, не прозорецът.
  const реже = n => {
    n.style.overflowWrap = 'anywhere';
    n.style.wordBreak = 'break-word';
    n.style.minWidth = '0';
    return n;
  };

  // 🔴 11.08: „✔ Копирано“ се изписваше ВЕДНАГА — преди clipboard да е отговорил.
  //   Откаже ли (без разрешение, извън фокус), мама чете „копирано“, лепва в
  //   чата и там няма нищо. А браузър без share И без clipboard не правеше
  //   абсолютно нищо. Сега надписът чака отговора, а последният изход показва
  //   самия текст, за да има ОТКЪДЕ да го копира на ръка.
  function сподели(btn, txt, изходен) {
    const назад = () => { btn.textContent = изходен; };
    if (navigator.share) {
      navigator.share({ text: txt })
        .then(() => { btn.textContent = '✔ Изпратено'; setTimeout(назад, 1800); })
        .catch(() => каз(btn, 'Нищо не е изпратено — всичко си стои тук. 💜'));
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt)
        .then(() => { btn.textContent = '✔ Копирано'; setTimeout(назад, 1800); каз(btn, 'Копирано ✔ Лепни го, където искаш.'); })
        .catch(() => каз(btn, 'Не успях да го копирам. Ето го — задръж пръст върху текста:\n\n' + txt));
      return;
    }
    каз(btn, 'Този телефон не ми дава да копирам. Ето го текста — задръж пръст върху него:\n\n' + txt);
  }

  // ── общ списък с отмятане: за чантата, обувките, приключенията ──
  function listCard(title, key, presets, placeholder, opts) {
    opts = opts || {};
    const c = card(title);
    const list = el('div', 'jr-wins');
    let чипове = null;                       // лентата с готовите предложения
    // 🔴 11.08 (известният клас дефекти, №6): масивът се четеше ВЕДНЪЖ при
    //   строежа и всеки следващ запис лепеше СТАРОТО копие отгоре. Тук се чете
    //   прясно при всяко рисуване, а самите слушатели пипат прясно заредения
    //   масив и намират реда по СЪДЪРЖАНИЕ, не по номер — номерът се разминава,
    //   ако междувременно е добавен ред другаде.
    const чети = () => load(key, []).filter(x => x && typeof x.t === 'string');
    let последно = '';
    function draw() {
      const items = чети();
      последно = JSON.stringify(items);
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', opts.empty || 'Още е празно. Добави първото. ✨'));
      items.forEach(it => {
        const row = реже(el('button', 'jr-win' + (it.done ? ' done' : '')));
        row.type = 'button';
        row.innerHTML = '<span class="jr-check">' + (it.done ? '✔' : '') + '</span> ' + esc(it.t) +
          (it.d ? '<small class="wm-when"> · ' + esc(it.d) + '</small>' : '');
        row.addEventListener('click', () => {
          const cur = чети();                                   // ПРЯСНО
          const x = cur.find(y => y.t === it.t);
          if (!x) { draw(); return; }
          x.done = !x.done; if (x.done) x.d = today(); else delete x.d;
          save(key, cur); draw(); fx().buzz(8);
          if (x.done && cur.length && cur.every(y => y.done)) fx().confetti && fx().confetti();
        });
        const del = el('button', 'jr-x', '✕'); del.type = 'button'; del.title = 'махни'; пръст(del);
        // ♿ еднакви „✕“ в цял списък — четецът не казваше КОЕ ще махне
        del.setAttribute('aria-label', 'Махни „' + it.t + '“');
        del.addEventListener('click', e => {
          e.stopPropagation();
          const cur = чети(); const i = cur.findIndex(y => y.t === it.t);
          if (i > -1) cur.splice(i, 1);
          save(key, cur); draw(); fx().buzz(6);
          // ↩️ Д17: махнатото се връща с един тап — тапът по ✕ е необратим и лесен
          каз(row2, 'Махнах „' + it.t + '“.', null);
          връщане(it);
        });
        const wrap = реже(el('div', 'jr-winrow')); wrap.appendChild(row); wrap.appendChild(del);
        list.appendChild(wrap);
      });
      if (чипове) чипове.querySelectorAll('.jr-chip').forEach(b => {
        // предложение, което вече е в списъка, се вижда като добавено —
        // иначе мама го тапва пак и се чуди защо нищо не става
        const има = items.some(x => x.t === b.dataset.p);
        b.classList.toggle('on', има);
      });
    }
    const row2 = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = placeholder; inp.maxLength = 70;
    const add = el('button', 'jr-chip', '+'); add.type = 'button'; пръст(add);
    // ♿ 11.08 (клавиатура-четец): този списък-градител се ползва в няколко карти —
    //    еднакви бутона „плюс", без да личи в КОЙ списък добавят. Името взима
    //    подканата на самото поле, която вече казва кое е.
    add.setAttribute('aria-label', 'Добави — ' + placeholder);
    const отмяна = el('button', 'jr-chip jr-chip-soft', '↩ Върни махнатото');
    отмяна.type = 'button'; отмяна.hidden = true; пръст(отмяна);
    let махнато = null;
    const връщане = it => { махнато = it; отмяна.hidden = false; };
    отмяна.addEventListener('click', () => {
      if (!махнато) { отмяна.hidden = true; return; }
      const cur = чети();
      if (!cur.some(x => x.t === махнато.t)) cur.push(махнато);
      save(key, cur); махнато = null; отмяна.hidden = true; draw(); fx().buzz(8);
      каз(row2, 'Върнато ✔');
    });
    const put = () => {
      const v = inp.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно поле и поле само с интервали не правеха НИЩО
      if (!v) { каз(row2, 'Полето е празно. Напиши нещо и пак натисни ➕.', inp); return; }
      const cur = чети();
      if (cur.some(x => x.t === v)) { каз(row2, '„' + v + '“ вече е в списъка ✔', inp); inp.select(); return; }
      cur.push({ t: v });
      if (!save(key, cur)) { каз(row2, НЕ_СЕ_ПОБРА, inp); fx().buzz(6); return; }   // полето остава пълно
      inp.value = ''; draw();
      fx().buzz(6); каз(row2, 'Добавено ✔');
    };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    row2.appendChild(inp); row2.appendChild(add);
    c.appendChild(list); c.appendChild(row2); c.appendChild(отмяна);
    if (presets && presets.length) {
      чипове = el('div', 'jr-chips');
      presets.forEach(p => {
        const b = el('button', 'jr-chip jr-chip-soft', p); b.type = 'button'; b.dataset.p = p;
        b.addEventListener('click', () => {
          const cur = чети();
          // 🔴 МЪЛЧАЛИВ БУТОН: дубликат → тапът не правеше нищо видимо
          if (cur.some(x => x.t === p)) { каз(чипове, '„' + p + '“ вече е в списъка ✔'); return; }
          cur.push({ t: p });
          if (!save(key, cur)) { каз(чипове, НЕ_СЕ_ПОБРА); fx().buzz(6); return; }
          draw(); fx().buzz(6);
          каз(чипове, 'Добавих „' + p + '“ ✔');
        });
        чипове.appendChild(b);
      });
      c.appendChild(чипове);
    }
    draw();
    // 🔁 дефект №8: списъкът не научаваше, ако същият ключ се напълни другаде.
    //   Щом картата се върне в кадър, се сверява с паметта. Без нова зависимост.
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(es => {
        if (!es.some(e => e.isIntersecting)) return;
        if (JSON.stringify(чети()) !== последно) draw();
      });
      try { io.observe(list); } catch (e) {}
    }
    return c;
  }

  // ═══════════ 👠 СТИЛЪТ ═══════════

  function bagCard() {
    return listCard('Чантата, която е само моя 👜' + sub('в тази чанта няма нито една мокра кърпичка'),
      'bl_wm_bag',
      ['червило', 'парфюмче', 'слушалки', 'книга', 'шоколад', 'очила', 'ключове', 'нещо само мое'],
      'какво носиш ТИ…',
      { empty: 'Празна е. Като повечето дни, в които излизаш само с бебешката. 👜' });
  }

  function wardrobeCard() {
    const c = card('Гардеробът СЕГА 👗' + sub('тялото ти се промени. Дрехите се сменят, не тялото.'));
    const w = load('bl_wm_wardrobe', { sizes: {}, note: '' });
    if (!w.sizes || typeof w.sizes !== 'object') w.sizes = {};   // внесено/старо копие без полето
    const grid = el('div', 'wm-sizes');
    [['👕', 'горе'], ['👖', 'долу'], ['👠', 'обувки'], ['💍', 'пръстен'], ['🩱', 'сутиен']].forEach(([e, k]) => {
      const b = el('label', 'wm-size');
      const i = el('input', 'jr-word'); i.value = w.sizes[k] || ''; i.maxLength = 8; i.placeholder = '—';
      // ♿ 11.08 (клавиатура-четец): подсказката беше тире, а етикетът се пише в
      //    innerHTML на <label> СЛЕД това — четецът чуваше пет пъти „тире".
      i.setAttribute('aria-label', 'Размер ' + k);
      // 🔴 11.08: записваше се тихо — картата не мърдаше с нито един пиксел и
      //   мама нямаше как да разбере, че размерът е приет (измерено: innerHTML
      //   не се променя). Тих знак, който сам си отива.
      пази(i, сДума => {
        const cur = load('bl_wm_wardrobe', { sizes: {}, note: '' });   // ПРЯСНО
        if (!cur.sizes || typeof cur.sizes !== 'object') cur.sizes = {};
        cur.sizes[k] = i.value.trim();
        if (!save('bl_wm_wardrobe', cur)) { if (сДума) каз(grid, НЕ_СЕ_ПОБРА); return; }
        w.sizes = cur.sizes;
        if (сДума) каз(grid, (i.value.trim() ? 'Записах „' + k + '“ ✔' : 'Изчистих „' + k + '“.'));
      });
      b.innerHTML = '<span>' + e + '</span><small>' + k + '</small>';
      b.appendChild(i); grid.appendChild(b);
    });
    c.appendChild(grid);
    const n = поле(el('textarea', 'jr-note')); n.placeholder = 'Какво ми стои добре точно сега…'; n.value = w.note || ''; n.rows = 2;
    пази(n, сДума => {
      const cur = load('bl_wm_wardrobe', { sizes: {}, note: '' });
      if (!cur.sizes || typeof cur.sizes !== 'object') cur.sizes = {};
      cur.note = n.value;
      if (!save('bl_wm_wardrobe', cur)) { if (сДума) каз(n, НЕ_СЕ_ПОБРА); return; }
      w.note = n.value;
      if (сДума) каз(n, n.value.trim() ? 'Записано ✔' : 'Празно е — нищо не пазя.');
    });
    c.appendChild(n);
    c.appendChild(el('p', 'wm-kind', '💜 Размерът е число на етикета, не оценка за теб.'));
    return c;
  }

  // сезонният тип — 5 въпроса, реална методика, никакво гадаене
  const COLORS = {
    'пролет': ['🌷', 'Топли и светли', ['#f7a8cb', '#f9c48a', '#a8d8a0', '#f5d97e', '#8fd0ba'],
               'Отиват ти живи, топли цветове — праскова, корал, ябълково зелено, топло злато.'],
    'лято':   ['🌊', 'Хладни и меки', ['#b9a7e0', '#9fc8ef', '#f0c9dd', '#a7d8c8', '#cfe0f5'],
               'Отиват ти меки, хладни тонове — лавандула, пудра, синьо-сиво, мента.'],
    'есен':   ['🍂', 'Топли и дълбоки', ['#c96b58', '#d6ab74', '#8a9a5b', '#a8712a', '#e0b978'],
               'Отиват ти земни, топли цветове — тухла, горчица, маслина, злато.'],
    'зима':   ['❄️', 'Хладни и ярки', ['#d1487f', '#3b3a5c', '#2f8f7a', '#ffffff', '#6b3a5e'],
               'Отиват ти чисти, контрастни цветове — фуксия, тъмносиньо, изумруд, чисто бяло.']
  };
  const CQ = [
    ['Вените на китката ти изглеждат…', [['синкаво-лилави', 'cool'], ['зеленикави', 'warm']]],
    ['Кое бижу ти отива повече?', [['сребро', 'cool'], ['злато', 'warm']]],
    ['На слънце кожата ти…', [['почервенява', 'cool'], ['потъмнява', 'warm']]],
    ['Естественият ти цвят на косата е по-скоро…', [['пепелив/тъмен', 'cool'], ['златист/меден', 'warm']]],
    ['Кое те „вдига“ повече?', [['ярко и контрастно', 'bright'], ['меко и приглушено', 'soft']]]
  ];
  function colorsCard() {
    const c = card('Цветовете ми 🎨' + sub('5 въпроса → палитрата, която те прави да светиш'));
    // 🔴 11.08 капанът на снимката: прочетено при РИСУВАНЕ, записвано при клик.
    //    Същият лек като в „Гардеробът СЕГА“ по-горе — пресен прочит преди запис.
    let st = load('bl_wm_colors', { a: {}, type: '' });
    const пресен = () => { st = load('bl_wm_colors', { a: {}, type: '' }); if (!st.a || typeof st.a !== 'object') st.a = {}; };
    пресен();            // внесено/старо копие без полето
    const box = el('div', 'wm-cq');
    function result() {
      const vals = Object.values(st.a);
      if (vals.length < 5) return '';
      const warm = vals.filter(v => v === 'warm').length;
      const bright = st.a[4] === 'bright';
      if (warm >= 3) return bright ? 'пролет' : 'есен';
      return bright ? 'зима' : 'лято';
    }
    function draw() {
      пресен();   // пресен прочит при всяко рисуване
      box.innerHTML = '';
      CQ.forEach((q, qi) => {
        const w = el('div', 'wm-q');
        w.appendChild(el('p', 'wm-qt', esc(q[0])));
        const ch = el('div', 'jr-chips');
        q[1].forEach(([label, val]) => {
          const b = el('button', 'jr-chip' + (st.a[qi] === val ? ' on' : ''), label); b.type = 'button'; пръст(b);
          b.addEventListener('click', () => {
            const беше = st.type;
            // 🔴 МЪЛЧАЛИВ БУТОН (хванат при последната обиколка): тап по вече
            //   избрания отговор не сменяше нищо — нито пиксел, нито буква в
            //   паметта. Мама тапва пак, защото не е сигурна, че се е записало.
            // (каз пише през textContent — тук esc() би показал &quot; на екрана)
            if (st.a[qi] === val) { каз(box, 'Това е отговорът ти ✔ ' + q[0]); fx().buzz(4); return; }
            пресен();   // пресен прочит ПРЕДИ записа
            st.a[qi] = val; st.type = result(); save('bl_wm_colors', st); draw(); fx().buzz(6);
            // конфети САМО когато палитрата тъкмо се е получила или се е сменила —
            // досега гърмяха при всеки тап след петия отговор
            if (st.type && st.type !== беше) fx().confetti && fx().confetti();
          });
          ch.appendChild(b);
        });
        w.appendChild(ch); box.appendChild(w);
      });
      const t = st.type || result();
      if (t && COLORS[t]) {
        const [e, ttl, pal, txt] = COLORS[t];
        const r = el('div', 'wm-pal');
        r.innerHTML = '<strong>' + e + ' Ти си ' + t.toUpperCase() + '</strong><small>' + ttl + '</small>' +
          '<div class="wm-swatch">' + pal.map(x => '<i style="background:' + x + '"></i>').join('') + '</div><p>' + txt + '</p>';
        box.appendChild(r);
      }
    }
    c.appendChild(box); draw();
    return c;
  }

  function shoesCard() {
    return listCard('Обувките 👠' + sub('и честният въпрос: кои са удобни с количка'),
      'bl_wm_shoes', ['удобни с количка', 'за когато съм ЖЕНА', 'чакат по-добри дни'],
      'кои обувки…', { empty: 'Разкажи ми за обувките си. Всяка има история. 👠' });
  }

  const OCC = ['на кафе', 'на работа', 'на гости', 'на разходка', 'на среща', 'вкъщи, но човешки'];
  // 🔴 11.08 (обиколка като майка): подзаглавието обещава „повод + настроение →
  //    идея“, а go() ползваше САМО настроението — поводът се изписваше като
  //    заглавие и толкоз. Проверено на живо: „на работа“ и „на среща“ връщаха
  //    един и същ ред („Извади онова, което пазиш «за някога»“). Поводът вече
  //    носи своя половина от идеята.
  const OCC_TIP = {
    'на кафе': 'Горе да е хубаво — там гледат, докато седиш.',
    'на работа': 'Едно нещо да е изгладено. То носи целия тоалет.',
    'на гости': 'Обуй нещо, което се сваля лесно на вратата.',
    'на разходка': 'Джобове. Всичко останало е второстепенно.',
    'на среща': 'Каквото не трябва да оправяш пред огледалото на всеки час.',
    'вкъщи, но човешки': 'Не пижама. Толкова е границата.'
  };
  const MOOD = ['искам да ме забележат', 'искам да ме няма', 'удобно, моля', 'чувствам се добре'];
  const LOOK = {
    'искам да ме забележат': ['Цвят. Един силен цвят и толкова.', 'Червилото. Останалото е детайл.', 'Нещо, което шумоли, като вървиш.'],
    'искам да ме няма': ['Голямо и меко, но с хубав шал. Компромисът е шалът.', 'Черно, но чисто черно. Изглежда нарочно.', 'Качулка и добър парфюм. Никой няма да разбере.'],
    'удобно, моля': ['Широко долу, стегнато горе. Изглежда премислено.', 'Един слой по-малко, отколкото ти се струва.', 'Маратонки, но с рокля. Работи.'],
    'чувствам се добре': ['Каквото и да облечеш, ще стои. Възползвай се.', 'Извади онова, което пазиш „за някога“. Днес е някога.', 'Огледалото днес е на твоя страна.']
  };
  function whatToWearCard() {
    const c = card('Какво да облека 🪄' + sub('повод + настроение → идея'));
    // 🟡 11.08 (обиколка по телефон): изборът не се пазеше НИКЪДЕ. Измерено:
    //   след презареждане „на работа“ се връщаше на „на кафе“ и мама почваше
    //   отначало всеки път. Пазим само двата ѝ избора — нищо повече.
    const пам = load('bl_wm_wear', {});
    const st = {
      occ: OCC.indexOf(пам.occ) > -1 ? пам.occ : OCC[0],
      mood: MOOD.indexOf(пам.mood) > -1 ? пам.mood : MOOD[0]
    };
    const out = el('p', 'wm-look', '');
    const mk = (arr, key) => {
      const ch = el('div', 'jr-chips');
      arr.forEach(x => {
        const b = el('button', 'jr-chip' + (st[key] === x ? ' on' : ''), x); b.type = 'button';
        b.addEventListener('click', () => {
          st[key] = x; save('bl_wm_wear', { occ: st.occ, mood: st.mood });
          [...ch.children].forEach(y => y.classList.toggle('on', y.textContent === x));
          go(); fx().buzz(6);
        });
        ch.appendChild(b);
      });
      return ch;
    };
    let пред = '';
    function go() {
      const arr = LOOK[st.mood] || [];
      // ↻ идеята се сменяше на случаен принцип и понякога излизаше СЪЩАТА —
      //   тапът изглеждаше като мълчалив. Избираме различна от последната.
      let идея = arr[Math.floor(Math.random() * arr.length)] || '';
      if (arr.length > 1 && идея === пред) идея = arr[(arr.indexOf(идея) + 1) % arr.length];
      пред = идея;
      out.innerHTML = '<strong>' + esc(st.occ) + '</strong><br>' + esc(идея) +
        (OCC_TIP[st.occ] ? '<br><small>' + esc(OCC_TIP[st.occ]) + '</small>' : '');
    }
    c.appendChild(el('p', 'wm-qt', 'Къде отиваш?')); c.appendChild(mk(OCC, 'occ'));
    c.appendChild(el('p', 'wm-qt', 'Как се чувстваш?')); c.appendChild(mk(MOOD, 'mood'));
    c.appendChild(out);
    // по-кратък път до най-честото действие: още една идея, без да пипаш чипове
    const още = el('button', 'jr-chip jr-chip-soft', '↻ Дай друга идея'); още.type = 'button'; пръст(още);
    още.addEventListener('click', () => { go(); fx().buzz(6); });
    c.appendChild(още); go();
    return c;
  }

  function wishCard() {
    const c = card('Списъкът с желания ✨' + sub('какво искаш ТИ · когато някой те попита „какво да ти взема“'));
    const list = el('div', 'jr-wins');
    // ПРЯСНО при всяко рисуване — не копие отпреди (известният клас дефекти, №6)
    const чети = () => load('bl_wm_wish', []).filter(x => typeof x === 'string');
    let махнато = null;
    function draw() {
      const items = чети();
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', 'Никой не може да отгатне. Затова се пише. ✨'));
      items.forEach(it => {
        const row = реже(el('div', 'jr-winrow'));
        const b = реже(el('button', 'jr-win', '<span class="jr-check">✨</span> ' + esc(it))); b.type = 'button';
        const del = el('button', 'jr-x', '✕'); del.type = 'button'; пръст(del);
        // ♿ 11.08 (клавиатура-четец): цял списък от еднакви „✕" — четецът не
        //    казваше кое ще махне, а тапът е необратим.
        del.setAttribute('aria-label', 'Махни „' + it + '“ от списъка');
        del.addEventListener('click', () => {
          const cur = чети(); const i = cur.indexOf(it);
          if (i > -1) cur.splice(i, 1);
          save('bl_wm_wish', cur); махнато = it; отмяна.hidden = false; draw(); fx().buzz(6);
          каз(row2, 'Махнах „' + it + '“.');
        });
        row.appendChild(b); row.appendChild(del); list.appendChild(row);
      });
    }
    const row2 = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'нещо, което искам…'; inp.maxLength = 70;
    const add = el('button', 'jr-chip', '+'); add.type = 'button'; пръст(add);
    add.setAttribute('aria-label', 'Добави го в списъка с желания');
    const отмяна = el('button', 'jr-chip jr-chip-soft', '↩ Върни махнатото');
    отмяна.type = 'button'; отмяна.hidden = true; пръст(отмяна);
    отмяна.addEventListener('click', () => {
      if (!махнато) { отмяна.hidden = true; return; }
      const cur = чети(); if (cur.indexOf(махнато) < 0) cur.push(махнато);
      save('bl_wm_wish', cur); махнато = null; отмяна.hidden = true; draw(); fx().buzz(8);
      каз(row2, 'Върнато ✔');
    });
    const put = () => {
      const v = inp.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно / само интервали → нищо видимо
      if (!v) { каз(row2, 'Празно е. Напиши какво искаш и пак натисни ➕.', inp); return; }
      const cur = чети();
      if (cur.indexOf(v) > -1) { каз(row2, '„' + v + '“ вече е в списъка ✔', inp); inp.select(); return; }
      cur.push(v);
      if (!save('bl_wm_wish', cur)) { каз(row2, НЕ_СЕ_ПОБРА, inp); fx().buzz(6); return; }
      inp.value = ''; draw(); fx().buzz(6);
      каз(row2, 'Добавено ✔');
    };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    row2.appendChild(inp); row2.appendChild(add);
    const share = el('button', 'jr-chip wm-share', '📤 Изпрати списъка'); share.type = 'button'; пръст(share);
    share.addEventListener('click', () => {
      const items = чети();
      // 🔴 МЪЛЧАЛИВ БУТОН: празен списък → тапът не правеше нищо
      if (!items.length) { каз(share, 'Списъкът е празен — първо напиши какво искаш ТИ.', inp); return; }
      сподели(share, 'Ето какво бих се зарадвала да получа 💜\n\n' + items.map(x => '· ' + x).join('\n'), '📤 Изпрати списъка');
    });
    c.appendChild(list); c.appendChild(row2); c.appendChild(отмяна); c.appendChild(share); draw();
    return c;
  }

  // ═══════════ 💋 РИТУАЛИТЕ ═══════════

  const LAST = [['коса', '💇‍♀️'], ['нокти', '💅'], ['вежди', '✨'], ['баня на спокойствие', '🛁'], ['сама навън', '🚶‍♀️'], ['с приятелка', '☕'],
    ['цял филм', '🎬'],
    ['гореща храна', '🍲'],
    ['книга за удоволствие', '📖'],
    ['разговор без прекъсване', '💬'],
    ['да не бързаш', '🐌'],
    ['да ти е скучно', '😌']
  ];
  function lastTimeCard() {
    const c = card('Кога последно… ⏳' + sub('без вина. Просто за да го видиш черно на бяло.'));
    const box = el('div', 'wm-last');
    // 🔴 11.08 (известният клас дефекти, №6): `st` се четеше ВЕДНЪЖ при строежа
    //   и всеки тап лепеше СТАРОТО копие отгоре. Измерено на живо: с два записа
    //   в паметта, тап по трети ред остави в паметта САМО него — другите два
    //   изчезнаха. Чете се прясно и при рисуване, и вътре в слушателя.
    const чети = () => { const o = load('bl_wm_last', {}); return (o && typeof o === 'object') ? o : {}; };
    let последно = '', върни = null;
    function draw() {
      const st = чети();
      последно = JSON.stringify(st);
      box.innerHTML = '';
      LAST.forEach(([k, e]) => {
        const d = st[k] ? days(st[k]) : null;
        const row = el('button', 'wm-lrow'); row.type = 'button';
        // 🟡 11.08 (обиколка като майка): при първо отваряне и дванайсетте реда
        //    пишеха „никога не си казвала“ — стена от „никога“, която жената
        //    чете като брой на онова, което не е направила, макар картата да не
        //    го твърди. Празното поле не е доказателство: тя просто още не ми е
        //    казала. Отговорът струва една дума.
        const when = d === null ? 'още не сме говорили за това' : d === 0 ? 'ДНЕС 🎉' : d === 1 ? 'вчера' : 'преди ' + d + ' дни';
        row.innerHTML = '<span class="wm-le">' + e + '</span><span class="wm-lt">' + k + '<small>' + when + '</small></span><span class="wm-lb">днес ✔</span>';
        if (d !== null && d > 30) row.classList.add('far');
        row.addEventListener('click', () => {
          const cur = чети();                                   // ПРЯСНО
          върни = { k: k, беше: cur[k] === undefined ? null : cur[k] };
          cur[k] = today();
          // 🔴 25.08 (dev/pylna_pamet.js, живо натискане при пълна памет): и
          //    дванайсетте реда обявяваха „Записах „коса" за днес ✔" + конфети,
          //    без нищо да е влязло в паметта — а „кога за последно" е точно
          //    картата, която ѝ показва, че се е сещала за себе си.
          if (!save('bl_wm_last', cur)) {
            върни = null;
            каз(box, 'Не можах да го запазя — паметта на телефона е пълна. Отметката НЕ е приета: освободи малко място (видеа, стари снимки) и я сложи пак.');
            fx().buzz(6);
            return;
          }
          draw();
          отмяна.hidden = false;
          fx().buzz(10); fx().confetti && fx().confetti();
          каз(box, 'Записах „' + k + '“ за днес ✔');
        });
        box.appendChild(row);
      });
    }
    // ↩️ Д17: дванайсет реда един под друг, а тапът заковаваше „ДНЕС 🎉“ върху
    //   истинска дата БЕЗВЪЗВРАТНО. Един уморен пръст не бива да струва толкова.
    const отмяна = el('button', 'jr-chip jr-chip-soft', '↩ Не беше днес');
    отмяна.type = 'button'; отмяна.hidden = true; пръст(отмяна);
    отмяна.addEventListener('click', () => {
      if (!върни) { отмяна.hidden = true; return; }
      const cur = чети();
      if (върни.беше === null) delete cur[върни.k]; else cur[върни.k] = върни.беше;
      // и назад: „Върнах го както си беше" се казва само ако наистина е върнато
      if (!save('bl_wm_last', cur)) { каз(box, 'Не можах да го върна — паметта на телефона е пълна. Опитай пак, след като освободиш място.'); fx().buzz(6); return; }
      const k = върни.k; върни = null; отмяна.hidden = true;
      draw(); fx().buzz(6);
      каз(box, 'Върнах „' + k + '“ както си беше.');
    });
    c.appendChild(box); draw(); c.appendChild(отмяна);
    c.appendChild(el('p', 'wm-kind', '💜 Това не е укор и не е списък. Ако нещо от горните ти липсва, започни с онова, което иска най-малко време.'));
    // 🔁 дефект №8: сверява се с паметта, щом картата се върне в кадър
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting) && JSON.stringify(чети()) !== последно) draw();
      });
      try { io.observe(box); } catch (e) {}
    }
    return c;
  }

  function fiveMinCard() {
    const c = card('5-те минути 💋' + sub('реални ритуали за жена с бебе на ръце'));
    const R = [
      ['🧴', 'Крем на лицето, докато той е в кошарката. 40 секунди.'],
      ['💧', 'Чаша вода преди кафето. Кожата ти ще ти благодари.'],
      ['💄', 'Само червило. Нищо друго. Сменя всичко.'],
      ['🪥', 'Мий зъби по-дълго от 40 секунди. Това ти е спа-то днес.'],
      ['🧖‍♀️', 'Маска, докато вечеряте. Да, пред всички. Нека свикват.'],
      ['🌬️', 'Три дълбоки вдишвания на прозореца. Брои се.'],
      ['🧦', 'Смени чорапите. Звучи глупаво. Пробвай.'],
      ['🎧', 'Една песен. Цялата. Със слушалки.']
    ];
    // 3.4.5: жива — днешното е ИЗБРАНО, не просто списък за четене
    const пик = new Date().getDate() % R.length;
    const [пикЕ, пикТ] = R[пик];
    let st = load('bl_wm_5min', { d: '', done: false, counted: false });
    // 🔴 г13/193: (1) редът „Откраднати минутки“ се рисуваше веднъж при строежа и
    //   никога не мърдаше след отмятане — изглеждаше, все едно не се е записало;
    //   (2) броячът се вдигаше при ВСЯКО включване, значи двойното тапване го
    //   надуваше. Денят се брои веднъж, а редът живее вътре в слушателя.
    if (st.d !== today()) { st.d = today(); st.done = false; st.counted = false; }
    else if (st.done && typeof st.counted !== 'boolean') st.counted = true;   // старо копие без полето
    const днес = el('div', 'wm-ritrow wm-rittoday');
    днес.innerHTML = '<span>' + пикЕ + '</span><p>' + esc(пикТ) + '</p>';
    const б = el('button', 'jr-chip' + (st.done ? ' wm-tone-on' : ''), st.done ? '✔ Направих го' : 'Направих го'); б.type = 'button'; пръст(б);
    const брояч = el('p', 'jr-privacy', '');
    const покажиБрояч = () => {
      const n = load('bl_wm_5min_total', 0);
      брояч.hidden = !n;
      брояч.innerHTML = 'Откраднати минутки досега: <strong>' + n + '</strong> 💋';
    };
    б.addEventListener('click', () => {
      // 🔴 11.08 капанът на снимката: `st` беше прочетено при рисуване. Пресен
      //    прочит преди записа + същото пренастройване за деня, както горе.
      const беше = st.done;
      st = load('bl_wm_5min', { d: '', done: false, counted: false });
      if (st.d !== today()) { st.d = today(); st.done = false; st.counted = false; }
      st.done = !беше;
      const брои = st.done && !st.counted;
      if (брои) st.counted = true;
      // 🔴 25.08 (dev/lazhliv_uspeh.js): отговорът на записа се хвърляше. При
      //    пълна памет бутонът ставаше „✔ Направих го", конфетите падаха — а в
      //    телефона нищо не влизаше и на другия ден отметката я нямаше.
      //    И РЕДЪТ е част от дефекта: броячът „Откраднати минутки" се вдигаше
      //    ПРЕДИ главния запис, тоест при паднал запис той пораства сам.
      //    Първо главното състояние; броячът — само след него.
      if (!save('bl_wm_5min', st)) {
        каз(б, 'Не можах да го запазя — паметта на телефона е пълна. Отметката НЕ е приета: освободи малко място (видеа, стари снимки) и я сложи пак.');
        fx().buzz(6);
        return;
      }
      if (брои) save('bl_wm_5min_total', load('bl_wm_5min_total', 0) + 1);
      б.textContent = st.done ? '✔ Направих го' : 'Направих го';
      б.classList.toggle('wm-tone-on', st.done);
      покажиБрояч();
      if (st.done) { fx().buzz(8); fx().confetti && fx().confetti(б); }
    });
    днес.appendChild(б);
    c.appendChild(днес);
    покажиБрояч();
    c.appendChild(брояч);
    const box = el('div', 'wm-rit');
    R.forEach(([e, t]) => box.appendChild(el('div', 'wm-ritrow', '<span>' + e + '</span><p>' + t + '</p>')));
    c.appendChild(el('p', 'jr-privacy', 'Или избери сама:'));
    c.appendChild(box);
    return c;
  }

  function perfumeCard() {
    return listCard('Парфюмът ми 🌸' + sub('миризмата, по която те помнят'),
      'bl_wm_perfume', [], 'аромат + спомен…',
      { empty: 'Всеки аромат носи някого. Запиши своите. 🌸' });
  }

  // ═══════════ 🕵️‍♀️ ТАЙНИТЕ ═══════════

  function lockedNote(title, key, ph, hint) {
    const c = card(title);
    const list = el('div', 'wm-secrets');
    // 🔴 11.08 (обиколка по телефон · известният клас дефекти №6+№7+№8):
    //   масивът се четеше ВЕДНЪЖ при строежа. А в СЪЩИЯ ключ bl_wm_diary пише
    //   и друга карта в тази стая — „✍️ 3 минути свободно писане“ (women3.js).
    //   ИЗМЕРЕНО НА ЖИВО: мама записва ред през дневничето, после ред през
    //   3-те минути (паметта има 2 реда), после тапва ✕ на единствения ред,
    //   който вижда тук — и в паметта остава [] . Редът от 3-те минути беше
    //   ИЗТРИТ, без никой да я пита. Затова: чете се прясно и при рисуване, и
    //   вътре в самия слушател, а изтриването намира записа по СЪДЪРЖАНИЕ, не
    //   по номер — номерът се разминава при всеки чужд запис.
    const чети = () => load(key, []).filter(x => x && typeof x.t === 'string');
    let последно = '', махнато = null;
    function draw() {
      const items = чети();
      последно = JSON.stringify(items);
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', hint));
      items.slice().reverse().forEach(it => {
        const row = реже(el('div', 'wm-secret'));
        row.innerHTML = '<p>' + esc(it.t) + '</p><small>' + esc(it.d || '') + '</small>';
        const del = el('button', 'jr-x', '✕'); del.type = 'button'; пръст(del);
        del.setAttribute('aria-label', 'Махни записа от ' + (it.d || ''));
        del.addEventListener('click', () => {
          const cur = чети();                                            // ПРЯСНО
          const i = cur.findIndex(x => x.t === it.t && x.d === it.d);
          if (i > -1) cur.splice(i, 1);
          save(key, cur); махнато = it; отмяна.hidden = false; draw(); fx().buzz(8);
          каз(b, 'Махнах записа. Ако не си искала — върни го.');
        });
        row.appendChild(del); list.appendChild(row);
      });
    }
    const ta = el('textarea', 'jr-note'); ta.placeholder = ph; ta.rows = 3; поле(ta);
    const b = el('button', 'jr-chip', '🔒 Заключи го тук'); b.type = 'button'; пръст(b);
    const отмяна = el('button', 'jr-chip jr-chip-soft', '↩ Върни последното махнато');
    отмяна.type = 'button'; отмяна.hidden = true; пръст(отмяна);
    отмяна.addEventListener('click', () => {
      if (!махнато) { отмяна.hidden = true; return; }
      const cur = чети();
      if (!cur.some(x => x.t === махнато.t && x.d === махнато.d)) cur.push(махнато);
      save(key, cur); махнато = null; отмяна.hidden = true; draw(); fx().buzz(8);
      каз(b, 'Върнато ✔ Тук си е.');
    });
    b.addEventListener('click', () => {
      const v = ta.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно поле → тапът не правеше НИЩО видимо
      if (!v) { каз(b, 'Полето е празно. Напиши каквото ти тежи и пак натисни 🔒.', ta); return; }
      const cur = чети();                                                // ПРЯСНО
      cur.push({ t: v, d: today() });
      // 🔴🔴 25.08: тук стоеше голо `save(key, cur); ta.value = '';` — точката,
      //    в която дългият личен текст на мама изчезваше два пъти при пълна
      //    памет. Полето се чисти САМО след потвърден запис.
      if (!save(key, cur)) { каз(b, НЕ_СЕ_ПОБРА, ta); fx().buzz(6); return; }
      ta.value = ''; draw(); fx().buzz(10);
      каз(b, '🔒 Заключено. Стои само на този телефон.');
    });
    c.appendChild(list); c.appendChild(ta); c.appendChild(b); c.appendChild(отмяна); draw();
    // 🔁 дефект №8: картата не научаваше, че „3 минути свободно писане“ е
    //   писала в същия ключ. Върне ли се в кадър, се сверява с паметта.
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting) && JSON.stringify(чети()) !== последно) draw();
      });
      try { io.observe(list); } catch (e) {}
    }
    return c;
  }

  function diaryCard() {
    return lockedNote('Заключеното дневниче 🔒' + sub('тук пиша каквото не казвам на никого'),
      'bl_wm_diary', 'Днес…', 'Празно е. Никой няма да го види освен теб. 🔒');
  }
  function confessCard() {
    return lockedNote('Изповедалнята 🤫' + sub('без съвети · без съждение · само място'),
      'bl_wm_confess', 'Нещото, което не смея да кажа на глас…',
      'Има неща, които не се казват на никого. Тук могат. 🤫');
  }
  function sinsCard() {
    return listCard('Малките ми грехове 😈' + sub('изядох шоколада и казах, че го няма'),
      'bl_wm_sins', ['изядох последното', 'излъгах, че спи', 'скрих играчка', 'преструвах се, че не чувам'],
      'признай си…', { empty: 'Съвършена ли си? Не вярвам. 😈' });
  }
  function letterCard() {
    const c = card('Писмо до мен след година 💌' + sub('пише се днес · отваря се след 365 дни'));
    const box = el('div', 'wm-letters');
    // ПРЯСНО при всяко рисуване (известният клас дефекти, №6)
    const чети = () => load('bl_wm_letters', []).filter(x => x && typeof x.t === 'string');
    function draw() {
      const L = чети();
      box.innerHTML = '';
      L.forEach(x => {
        const left = 365 - days(x.d);
        const row = реже(el('div', 'wm-letter' + (left <= 0 ? ' open' : '')));
        row.innerHTML = left > 0
          // 🟡 12.08 (единиците): в навечерието на годината писмото казваше
          //    „отваря се след 1 дни“ — точно денят, в който мама го чака.
          ? '<span>💌</span><div><strong>Запечатано</strong><small>отваря се след ' + (window.BL_BROI ? BL_BROI(left, 'ден', 'дни') : left + ' ' + (left === 1 ? 'ден' : 'дни')) + ' · писано на ' + esc(x.d) + '</small></div>'
          : '<span>📖</span><div><strong>Отвори се!</strong><p>' + esc(x.t) + '</p><small>писано на ' + esc(x.d) + '</small></div>';
        if (left <= 0) {
          const del = el('button', 'jr-x', '✕'); del.type = 'button'; пръст(del);
          del.setAttribute('aria-label', 'Изтрий писмото, писано на ' + x.d);
          // проход 4: писмо, чакано 365 дни, не бива да изчезне от един уморен тап в 3ч.
          del.addEventListener('click', () => {
            (window.BL_UI ? BL_UI.confirm('Да изтрия ли това писмо до себе си? Не се връща.', { emoji: '💌', okText: 'Изтрий', cancelText: 'Остави', danger: true })
              : Promise.resolve(confirm('Да изтрия ли писмото?'))).then(да => {
              if (!да) { каз(b, 'Остана си при теб. 💌'); return; }
              // ПРЯСНО + търсене по съдържание: индексът от рисуването се
              // разминава, ако междувременно е запечатано ново писмо
              const cur = чети();
              const i = cur.findIndex(y => y.t === x.t && y.d === x.d);
              if (i > -1) cur.splice(i, 1);
              save('bl_wm_letters', cur); draw(); if (window.BL_FX) BL_FX.buzz(10);
              каз(b, 'Изтрито.');
            });
          });
          row.appendChild(del);
        }
        box.appendChild(row);
      });
      if (!L.length) box.appendChild(el('p', 'jr-privacy', 'Какво искаш да си кажеш след година? 💌'));
    }
    const ta = el('textarea', 'jr-note'); ta.placeholder = 'Скъпа аз след година…'; ta.rows = 3; поле(ta);
    const b = el('button', 'jr-chip', '💌 Запечатай'); b.type = 'button'; пръст(b);
    b.addEventListener('click', () => {
      const v = ta.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно поле → тапът не правеше нищо видимо
      if (!v) { каз(b, 'Още не си написала нищо. Кажи си нещо и пак натисни 💌.', ta); return; }
      const cur = чети();                                       // ПРЯСНО
      cur.push({ t: v, d: today() });
      // 🔴 25.08: писмо, което мама чака 365 дни, не бива да се обяви за
      //    „запечатано", ако не е стигнало до паметта. Полето остава пълно.
      if (!save('bl_wm_letters', cur)) { каз(b, НЕ_СЕ_ПОБРА, ta); fx().buzz(6); return; }
      ta.value = ''; draw(); fx().confetti && fx().confetti();
      каз(b, '💌 Запечатано. Ще те чака точно година.');
    });
    c.appendChild(box); c.appendChild(ta); c.appendChild(b); draw();
    return c;
  }

  function dreamsCard() {
    const c = card('Мечтите ми — тогава и сега 🌠' + sub('понякога съвпадат · понякога не · и това е ок'));
    const d = load('bl_wm_dreams', { then: '', now: '' });
    const grid = el('div', 'wm-dreams');
    [['then', 'Преди да стана мама', '🌸'], ['now', 'Сега', '💜']].forEach(([k, t, e]) => {
      const w = el('div', 'wm-dream');
      w.appendChild(el('p', 'wm-qt', e + ' ' + t));
      const ta = el('textarea', 'jr-note'); ta.rows = 3; поле(ta); ta.value = d[k] || ''; ta.placeholder = 'Мечтаех…';
      // 🔴 11.08: записваше се тихо — нищо в картата не мърдаше (измерено).
      пази(ta, сДума => {
        const cur = load('bl_wm_dreams', { then: '', now: '' });   // ПРЯСНО
        cur[k] = ta.value;
        if (!save('bl_wm_dreams', cur)) { if (сДума) каз(ta, НЕ_СЕ_ПОБРА); return; }
        d[k] = ta.value;
        if (сДума) каз(ta, ta.value.trim() ? 'Записано ✔' : 'Празно е — нищо не пазя.');
      });
      w.appendChild(ta); grid.appendChild(w);
    });
    c.appendChild(grid);
    return c;
  }

  function freeDayCard() {
    const c = card('Ако имах един свободен ден ☀️' + sub('попълни го · после го покажи на когото искаш'));
    const v = load('bl_wm_freeday', '');
    const ta = el('textarea', 'jr-note'); ta.rows = 4; поле(ta); ta.value = typeof v === 'string' ? v : ''; ta.placeholder = 'Ставам в… после…';
    пази(ta, сДума => {
      if (!save('bl_wm_freeday', ta.value)) { if (сДума) каз(ta, НЕ_СЕ_ПОБРА); return; }
      if (сДума) каз(ta, ta.value.trim() ? 'Записано ✔ Стои си тук.' : 'Празно е — нищо не пазя.');
    });
    c.appendChild(ta);
    const share = el('button', 'jr-chip wm-share', '📤 Изпрати го'); share.type = 'button'; пръст(share);
    share.addEventListener('click', () => {
      const t = ta.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно поле → тапът не правеше нищо
      if (!t) { каз(share, 'Първо го напиши — после ще има какво да покажеш.', ta); return; }
      сподели(share, 'Ето как изглежда един свободен ден за мен 💜\n\n' + t, '📤 Изпрати го');
    });
    c.appendChild(share);
    return c;
  }

  window.BL_WOMEN2 = {
    bagCard, wardrobeCard, colorsCard, shoesCard, whatToWearCard, wishCard,
    lastTimeCard, fiveMinCard, perfumeCard,
    diaryCard, confessCard, sinsCard, letterCard, dreamsCard, freeDayCard
  };

  // добавяме към стая 8
  // 🔴 г13/192: една счупена карта събаряше всички след нея — стаята се
  //   отваряше наполовина, без нито едно съобщение. Всяка карта поотделно,
  //   по модела на women5.js.
  const КАРТИ = [
    bagCard, wardrobeCard, colorsCard, shoesCard, whatToWearCard, wishCard,
    lastTimeCard, fiveMinCard, perfumeCard,
    diaryCard, confessCard, sinsCard, letterCard, dreamsCard, freeDayCard
  ];
  const base = window.ROOM_FEATURES && window.ROOM_FEATURES['Жената в мен'];
  if (base) window.ROOM_FEATURES['Жената в мен'] = root => {
    base(root);
    КАРТИ.forEach(f => { try { const c = f(); if (c) root.appendChild(c); } catch (e) {} });
  };
})();
