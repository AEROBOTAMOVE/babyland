// ═══════════════════════════════════════════════════════════
// СТАЯ 8, част 2 — СТИЛЪТ · РИТУАЛИТЕ · ТАЙНИТЕ
// Чантата, която е само нейна. Гардеробът СЕГА (не „като отслабна").
// Заключеното дневниче. Нещата, които не казва на глас.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
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

  // ── общ списък с отмятане: за чантата, обувките, приключенията ──
  function listCard(title, key, presets, placeholder, opts) {
    opts = opts || {};
    const c = card(title);
    const items = load(key, []);
    const list = el('div', 'jr-wins');
    function draw() {
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', opts.empty || 'Още е празно. Добави първото. ✨'));
      items.forEach((it, i) => {
        const row = el('button', 'jr-win' + (it.done ? ' done' : ''));
        row.type = 'button';
        row.innerHTML = '<span class="jr-check">' + (it.done ? '✔' : '') + '</span> ' + esc(it.t) +
          (it.d ? '<small class="wm-when"> · ' + it.d + '</small>' : '');
        row.addEventListener('click', () => {
          it.done = !it.done; if (it.done) it.d = today(); else delete it.d;
          save(key, items); draw(); fx().buzz(8);
          if (it.done && items.every(x => x.done)) fx().confetti && fx().confetti();
        });
        const del = el('button', 'jr-x', '✕'); del.type = 'button'; del.title = 'махни';
        del.addEventListener('click', e => { e.stopPropagation(); items.splice(i, 1); save(key, items); draw(); });
        const wrap = el('div', 'jr-winrow'); wrap.appendChild(row); wrap.appendChild(del);
        list.appendChild(wrap);
      });
    }
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = placeholder; inp.maxLength = 70;
    const add = el('button', 'jr-chip', '+'); add.type = 'button';
    const put = () => { const v = inp.value.trim(); if (!v) return; items.push({ t: v }); save(key, items); inp.value = ''; draw(); };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    row.appendChild(inp); row.appendChild(add);
    c.appendChild(list); c.appendChild(row);
    if (presets && presets.length) {
      const ch = el('div', 'jr-chips');
      presets.forEach(p => {
        const b = el('button', 'jr-chip jr-chip-soft', p); b.type = 'button';
        b.addEventListener('click', () => { if (items.some(x => x.t === p)) return; items.push({ t: p }); save(key, items); draw(); fx().buzz(6); });
        ch.appendChild(b);
      });
      c.appendChild(ch);
    }
    draw();
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
      i.addEventListener('change', () => { w.sizes[k] = i.value.trim(); save('bl_wm_wardrobe', w); });
      b.innerHTML = '<span>' + e + '</span><small>' + k + '</small>';
      b.appendChild(i); grid.appendChild(b);
    });
    c.appendChild(grid);
    const n = el('textarea', 'jr-note'); n.placeholder = 'Какво ми стои добре точно сега…'; n.value = w.note || ''; n.rows = 2;
    n.addEventListener('change', () => { w.note = n.value; save('bl_wm_wardrobe', w); });
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
    ['Кое те „вдига" повече?', [['ярко и контрастно', 'bright'], ['меко и приглушено', 'soft']]]
  ];
  function colorsCard() {
    const c = card('Цветовете ми 🎨' + sub('5 въпроса → палитрата, която те прави да светиш'));
    const st = load('bl_wm_colors', { a: {}, type: '' });
    if (!st.a || typeof st.a !== 'object') st.a = {};            // внесено/старо копие без полето
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
      box.innerHTML = '';
      CQ.forEach((q, qi) => {
        const w = el('div', 'wm-q');
        w.appendChild(el('p', 'wm-qt', esc(q[0])));
        const ch = el('div', 'jr-chips');
        q[1].forEach(([label, val]) => {
          const b = el('button', 'jr-chip' + (st.a[qi] === val ? ' on' : ''), label); b.type = 'button';
          b.addEventListener('click', () => { st.a[qi] = val; st.type = result(); save('bl_wm_colors', st); draw(); fx().buzz(6); if (st.type) fx().confetti && fx().confetti(); });
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
  const MOOD = ['искам да ме забележат', 'искам да ме няма', 'удобно, моля', 'чувствам се добре'];
  const LOOK = {
    'искам да ме забележат': ['Цвят. Един силен цвят и толкова.', 'Червилото. Останалото е детайл.', 'Нещо, което шумоли, като вървиш.'],
    'искам да ме няма': ['Голямо и меко, но с хубав шал. Компромисът е шалът.', 'Черно, но чисто черно. Изглежда нарочно.', 'Качулка и добър парфюм. Никой няма да разбере.'],
    'удобно, моля': ['Широко долу, стегнато горе. Изглежда премислено.', 'Един слой по-малко, отколкото ти се струва.', 'Маратонки, но с рокля. Работи.'],
    'чувствам се добре': ['Каквото и да облечеш, ще стои. Възползвай се.', 'Извади онова, което пазиш „за някога". Днес е някога.', 'Огледалото днес е на твоя страна.']
  };
  function whatToWearCard() {
    const c = card('Какво да облека 🪄' + sub('повод + настроение → идея'));
    const st = { occ: OCC[0], mood: MOOD[0] };
    const out = el('p', 'wm-look', '');
    const mk = (arr, key) => {
      const ch = el('div', 'jr-chips');
      arr.forEach(x => {
        const b = el('button', 'jr-chip' + (st[key] === x ? ' on' : ''), x); b.type = 'button';
        b.addEventListener('click', () => { st[key] = x; [...ch.children].forEach(y => y.classList.toggle('on', y.textContent === x)); go(); });
        ch.appendChild(b);
      });
      return ch;
    };
    function go() {
      const arr = LOOK[st.mood] || [];
      out.innerHTML = '<strong>' + esc(st.occ) + '</strong><br>' + esc(arr[Math.floor(Math.random() * arr.length)] || '');
    }
    c.appendChild(el('p', 'wm-qt', 'Къде отиваш?')); c.appendChild(mk(OCC, 'occ'));
    c.appendChild(el('p', 'wm-qt', 'Как се чувстваш?')); c.appendChild(mk(MOOD, 'mood'));
    c.appendChild(out); go();
    return c;
  }

  function wishCard() {
    const c = card('Списъкът с желания ✨' + sub('какво искаш ТИ · за рожден ден, 8-ми март и „не знам какво да ти взема"'));
    const items = load('bl_wm_wish', []);
    const list = el('div', 'jr-wins');
    function draw() {
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', 'Никой не може да отгатне. Затова се пише. ✨'));
      items.forEach((it, i) => {
        const row = el('div', 'jr-winrow');
        const b = el('button', 'jr-win', '<span class="jr-check">✨</span> ' + esc(it)); b.type = 'button';
        const del = el('button', 'jr-x', '✕'); del.type = 'button';
        del.addEventListener('click', () => { items.splice(i, 1); save('bl_wm_wish', items); draw(); });
        row.appendChild(b); row.appendChild(del); list.appendChild(row);
      });
    }
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'нещо, което искам…'; inp.maxLength = 70;
    const add = el('button', 'jr-chip', '+'); add.type = 'button';
    const put = () => { const v = inp.value.trim(); if (!v) return; items.push(v); save('bl_wm_wish', items); inp.value = ''; draw(); };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    row.appendChild(inp); row.appendChild(add);
    const share = el('button', 'jr-chip wm-share', '📤 Изпрати списъка'); share.type = 'button';
    share.addEventListener('click', () => {
      if (!items.length) return;
      const txt = 'Ето какво бих се зарадвала да получа 💜\n\n' + items.map(x => '· ' + x).join('\n');
      if (navigator.share) navigator.share({ text: txt }).catch(() => {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(txt).catch(() => {}); share.textContent = '✔ Копирано'; setTimeout(() => share.textContent = '📤 Изпрати списъка', 1600); }
    });
    c.appendChild(list); c.appendChild(row); c.appendChild(share); draw();
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
    const st = load('bl_wm_last', {});
    const box = el('div', 'wm-last');
    function draw() {
      box.innerHTML = '';
      LAST.forEach(([k, e]) => {
        const d = st[k] ? days(st[k]) : null;
        const row = el('button', 'wm-lrow'); row.type = 'button';
        const when = d === null ? 'никога не си казвала' : d === 0 ? 'ДНЕС 🎉' : d === 1 ? 'вчера' : 'преди ' + d + ' дни';
        row.innerHTML = '<span class="wm-le">' + e + '</span><span class="wm-lt">' + k + '<small>' + when + '</small></span><span class="wm-lb">днес ✔</span>';
        if (d !== null && d > 30) row.classList.add('far');
        row.addEventListener('click', () => { st[k] = today(); save('bl_wm_last', st); draw(); fx().buzz(10); fx().confetti && fx().confetti(); });
        box.appendChild(row);
      });
    }
    c.appendChild(box); draw();
    c.appendChild(el('p', 'wm-kind', '💜 Това не е укор и не е списък. Ако нещо от горните ти липсва, започни с онова, което иска най-малко време.'));
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
    const st = load('bl_wm_5min', { d: '', done: false, counted: false });
    // 🔴 г13/193: (1) редът „Откраднати минутки“ се рисуваше веднъж при строежа и
    //   никога не мърдаше след отмятане — изглеждаше, все едно не се е записало;
    //   (2) броячът се вдигаше при ВСЯКО включване, значи двойното тапване го
    //   надуваше. Денят се брои веднъж, а редът живее вътре в слушателя.
    if (st.d !== today()) { st.d = today(); st.done = false; st.counted = false; }
    else if (st.done && typeof st.counted !== 'boolean') st.counted = true;   // старо копие без полето
    const днес = el('div', 'wm-ritrow wm-rittoday');
    днес.innerHTML = '<span>' + пикЕ + '</span><p>' + esc(пикТ) + '</p>';
    const б = el('button', 'jr-chip' + (st.done ? ' wm-tone-on' : ''), st.done ? '✔ Направих го' : 'Направих го'); б.type = 'button';
    const брояч = el('p', 'jr-privacy', '');
    const покажиБрояч = () => {
      const n = load('bl_wm_5min_total', 0);
      брояч.hidden = !n;
      брояч.innerHTML = 'Откраднати минутки досега: <strong>' + n + '</strong> 💋';
    };
    б.addEventListener('click', () => {
      st.done = !st.done;
      if (st.done && !st.counted) { st.counted = true; save('bl_wm_5min_total', load('bl_wm_5min_total', 0) + 1); }
      save('bl_wm_5min', st);
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
    const items = load(key, []);
    const list = el('div', 'wm-secrets');
    function draw() {
      list.innerHTML = '';
      if (!items.length) list.appendChild(el('p', 'jr-privacy', hint));
      items.slice().reverse().forEach((it, ri) => {
        const i = items.length - 1 - ri;
        const row = el('div', 'wm-secret');
        row.innerHTML = '<p>' + esc(it.t) + '</p><small>' + it.d + '</small>';
        const del = el('button', 'jr-x', '✕'); del.type = 'button';
        del.addEventListener('click', () => { items.splice(i, 1); save(key, items); draw(); });
        row.appendChild(del); list.appendChild(row);
      });
    }
    const ta = el('textarea', 'jr-note'); ta.placeholder = ph; ta.rows = 3;
    const b = el('button', 'jr-chip', '🔒 Заключи го тук'); b.type = 'button';
    b.addEventListener('click', () => {
      const v = ta.value.trim(); if (!v) return;
      items.push({ t: v, d: today() }); save(key, items); ta.value = ''; draw(); fx().buzz(10);
    });
    c.appendChild(list); c.appendChild(ta); c.appendChild(b); draw();
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
    const L = load('bl_wm_letters', []);
    const box = el('div', 'wm-letters');
    function draw() {
      box.innerHTML = '';
      L.forEach((x, i) => {
        const left = 365 - days(x.d);
        const row = el('div', 'wm-letter' + (left <= 0 ? ' open' : ''));
        row.innerHTML = left > 0
          ? '<span>💌</span><div><strong>Запечатано</strong><small>отваря се след ' + left + ' дни · писано на ' + x.d + '</small></div>'
          : '<span>📖</span><div><strong>Отвори се!</strong><p>' + esc(x.t) + '</p><small>писано на ' + x.d + '</small></div>';
        if (left <= 0) {
          const del = el('button', 'jr-x', '✕'); del.type = 'button';
          // проход 4: писмо, чакано 365 дни, не бива да изчезне от един уморен тап в 3ч.
          del.addEventListener('click', () => {
            (window.BL_UI ? BL_UI.confirm('Да изтрия ли това писмо до себе си? Не се връща.', { emoji: '💌', okText: 'Изтрий', cancelText: 'Остави', danger: true })
              : Promise.resolve(confirm('Да изтрия ли писмото?'))).then(да => {
              if (да) { L.splice(i, 1); save('bl_wm_letters', L); draw(); if (window.BL_FX) BL_FX.buzz(10); }
            });
          });
          row.appendChild(del);
        }
        box.appendChild(row);
      });
      if (!L.length) box.appendChild(el('p', 'jr-privacy', 'Какво искаш да си кажеш след година? 💌'));
    }
    const ta = el('textarea', 'jr-note'); ta.placeholder = 'Скъпа аз след година…'; ta.rows = 3;
    const b = el('button', 'jr-chip', '💌 Запечатай'); b.type = 'button';
    b.addEventListener('click', () => {
      const v = ta.value.trim(); if (!v) return;
      L.push({ t: v, d: today() }); save('bl_wm_letters', L); ta.value = ''; draw(); fx().confetti && fx().confetti();
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
      const ta = el('textarea', 'jr-note'); ta.rows = 3; ta.value = d[k] || ''; ta.placeholder = 'Мечтаех…';
      ta.addEventListener('change', () => { d[k] = ta.value; save('bl_wm_dreams', d); });
      w.appendChild(ta); grid.appendChild(w);
    });
    c.appendChild(grid);
    return c;
  }

  function freeDayCard() {
    const c = card('Ако имах един свободен ден ☀️' + sub('попълни го · после го покажи на когото искаш'));
    const v = load('bl_wm_freeday', '');
    const ta = el('textarea', 'jr-note'); ta.rows = 4; ta.value = v; ta.placeholder = 'Ставам в… после…';
    ta.addEventListener('change', () => save('bl_wm_freeday', ta.value));
    c.appendChild(ta);
    const share = el('button', 'jr-chip wm-share', '📤 Изпрати го'); share.type = 'button';
    share.addEventListener('click', () => {
      const t = ta.value.trim(); if (!t) return;
      const msg = 'Ето как изглежда един свободен ден за мен 💜\n\n' + t;
      if (navigator.share) navigator.share({ text: msg }).catch(() => {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(msg).catch(() => {}); share.textContent = '✔ Копирано'; setTimeout(() => share.textContent = '📤 Изпрати го', 1600); }
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
