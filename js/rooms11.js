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
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const dayIndex = () => { const n = new Date(); return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000) + n.getFullYear(); };

  // ═══════════ 🪞 4.8.2 ОГЛЕДАЛОТО ═══════════
  function mirrorCard() {
    const c = card('Огледалото 🪞 ' + sub('дните, в които се хареса'));
    c.appendChild(el('p', 'jr-privacy',
      'Не за да броиш. За да имаш доказателство — че е имало такива дни, дори когато не се сещаш за тях.'));
    const st = load('bl_wm_mirror', []);
    const днес = st.some(x => x.d === today());
    const b = el('button', 'jr-btn', днес ? '💛 Днес се хареса ✔' : '🪞 Днес се харесах');
    b.type = 'button';
    const grid = el('div', 'mr-grid');
    const рисувай = () => {
      grid.innerHTML = '';
      st.slice(-30).forEach(x => {
        const cell = el('span', 'mr-day', '💛');
        cell.title = x.d;
        grid.appendChild(cell);
      });
    };
    b.addEventListener('click', () => {
      if (st.some(x => x.d === today())) return;
      st.push({ d: today() }); save('bl_wm_mirror', st);
      b.textContent = '💛 Днес се хареса ✔'; рисувай(); fx().buzz(10);
    });
    c.appendChild(b);
    if (st.length) {
      c.appendChild(el('p', 'jr-privacy', 'Досега: <strong>' + st.length + '</strong> такива дни. Ето ги:'));
      c.appendChild(grid); рисувай();
    }
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
    const отг = {};
    ТЕСТ.forEach((в, i) => {
      const блок = el('div', 'wt-block');
      блок.innerHTML = '<p class="wt-q">' + esc(в.q) + '</p>';
      const g = el('div', 'wt-opts');
      в.a.forEach(([текст, тип, e]) => {
        const b = el('button', 'wt-o', e + ' ' + текст); b.type = 'button';
        b.addEventListener('click', () => {
          g.querySelectorAll('.wt-o').forEach(x => x.classList.remove('on'));
          b.classList.add('on'); отг[i] = тип; преброй();
        });
        g.appendChild(b);
      });
      блок.appendChild(g); c.appendChild(блок);
    });
    const out = el('div', 'wt-out');
    c.appendChild(out);
    function преброй() {
      if (Object.keys(отг).length < ТЕСТ.length) return;
      const броене = {};
      Object.values(отг).forEach(t => броене[t] = (броене[t] || 0) + 1);
      const победител = Object.keys(броене).sort((a, b) => броене[b] - броене[a])[0];
      const [име, текст] = ТИПОВЕ[победител];
      out.innerHTML = `<div class="wt-result"><p class="wt-name">${esc(име)}</p><p class="wt-desc">${esc(текст)}</p></div>`;
      fx().buzz(10);
    }
    return c;
  }

  // ═══════════ 🃏 4.8.11 ЗНАЧЕНИЕТО НА КАРТИТЕ ═══════════
  function cardMeaningsCard() {
    // взимаме картите от women.js, ако са изложени; иначе кратко обяснение
    const c = card('Езикът на картите 🃏 ' + sub('какво „казва“ всяка'));
    c.appendChild(el('p', 'jr-privacy',
      'Картите не предсказват нищо — те са огледало. Всяка е повод да спреш и да се запиташ нещо. Ето как да ги четеш:'));
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
    c.innerHTML += `<p class="wh-text">${esc(СЕДМИЧНИ[седмица % СЕДМИЧНИ.length])}</p>`;
    c.appendChild(el('p', 'wm-sign', 'Играем си. А понякога улучваме. — Ния 🃏'));
    return c;
  }

  // ═══════════ 🔬 4.9.3 ХРОНОЛОГИЯТА ═══════════
  // „Какво се смени точно преди проблема“ — детективският въпрос.
  function timelineCard() {
    const c = card('Какво се смени 🔬 ' + sub('преди нещо да тръгне накриво'));
    c.appendChild(el('p', 'jr-privacy',
      'Когато бебето изведнъж спи зле, яде зле или е неспокойно — най-полезният въпрос е: <strong>какво се промени в последните дни?</strong> Отбележи, за да видиш връзка.'));
    const st = load('bl_lab_timeline', []);
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „смених прахчето“, „поникна зъб“, „пътувахме“…'; inp.maxLength = 80;
    const add = el('button', 'jr-chip', '+ Отбележи промяна'); add.type = 'button';
    const list = el('div', 'jr-wins');
    const рисувай = () => {
      list.innerHTML = '';
      if (!st.length) { list.appendChild(el('p', 'jr-privacy', 'Още нищо. Като се случи нещо ново — запиши го тук с датата.')); return; }
      st.slice().reverse().slice(0, 20).forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const row = el('div', 'tl-row');
        row.innerHTML = `<span class="tl-date">${x.d}</span><span class="tl-txt">${esc(x.t)}</span><button class="nt-del" type="button" data-i="${i}" aria-label="Махни „${esc(x.t)}“ от ${esc(x.d)}">🗑</button>`;
        row.querySelector('.nt-del').addEventListener('click', () => { st.splice(i, 1); save('bl_lab_timeline', st); рисувай(); });
        list.appendChild(row);
      });
    };
    const put = () => { const v = inp.value.trim(); if (!v) return; st.push({ d: today(), t: v.slice(0, 80) }); save('bl_lab_timeline', st); inp.value = ''; рисувай(); fx().buzz(8); };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    const row = el('div', 'jr-addrow'); row.appendChild(inp); row.appendChild(add);
    c.appendChild(row); c.appendChild(list); рисувай();
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
