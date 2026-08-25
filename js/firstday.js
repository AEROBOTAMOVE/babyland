// ═══════════════════════════════════════════════════════════
// 🌅 ПЪРВИТЕ ДНИ — приложението пораства с мама (план 19, част 13.3)
//
// 🕊️ 13.3.1  Първият ден: нищо не искаме. Само „как си?“
// 🤰 13.3.3  Бременната мама: стаите на бебето заспиват до раждането
// 🎬 13.3.4  Демо: „покажи ми как изглежда след 3 месеца“ — и се трие
// 🌱 13.3.6  Един въпрос на ден, 30 дни → на 30-ия има Река
// ✨ 13.3.7  Стаите светват, когато им дойде времето (не се заключват!)
// 🌤️ 13.3.8  „Кой си ти днес“ — тонът на деня е неин избор
//
// ⛔ 13.3.2 (празното = обещание) — ПРОВЕРЕНО: празните състояния вече
//    говорят така („Реката е още изворче“, „Дървото чака първия цвят“).
// ⛔ 13.3.5 („продължи откъдето спря“) — ГОТОВО в daily.js.
//
// Никакво заключване на нищо: мама винаги може всичко. Тук само
// подреждаме светлината. ЗАРЕЖДА СЕ СЛЕД daily.js и polish.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const днес = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fx = () => window.BL_FX || { buzz() {}, cheer() {}, confetti() {} };

  // ═══════════ 🕊️ 13.3.1 ПЪРВИЯТ ДЕН ═══════════
  // Помним кога мама е дошла за пръв път. В този ден „Днес“ не изсипва
  // трик+мит+бриф+спомен — само поздрав и една-единствена покана.
  if (!load('bl_day1', '')) save('bl_day1', днес());
  const еПървиДен = () => load('bl_day1', '') === днес();

  function тихПървиДен(container) {
    if (!еПървиДен()) return false;
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome')) return false;
    // маха се шумното, ако някой модул го е монтирал преди нас
    inner.querySelectorAll('.td-trick, .td-myth, .brief-card, .tm-card').forEach(x => x.remove());
    if (inner.querySelector('.fd-hello')) return true;
    inner.appendChild(el('div', 'fd-hello',
      `<p class="fd-big">Днес нищо не искаме от теб. 🕊️</p>
       <p class="fd-small">Разгледай спокойно — всичко тук е твое и никъде не бърза.
       Само едно мъничко нещо, ако искаш: как си?</p>`));
    return true;
  }

  // ═══════════ 🌤️ 13.3.8 КОЙ СИ ТИ ДНЕС ═══════════
  // Три думи, веднъж на ден, по желание. „На ръба“ → конфетите млъкват,
  // тонът омеква. Не е чекинът (той е в Дневника) — това е само ТОНЪТ.
  const ТОН = 'bl_day_tone';
  const тонДнес = () => { const t = load(ТОН, {}); return t.d === днес() ? t.v : ''; };
  function монтирайТон(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.fd-tone')) return;
    if (тонДнес() || load('bl_tone_off', false)) return;
    const ред = el('div', 'fd-tone');
    ред.innerHTML = `<span class="fd-tq">Как да говорим днес?</span>`;
    // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): трите отговора бяха 76×31,
    //    90×31 и 86×31 — а „✕ не питай повече“ до тях е 44×44. Тоест най-лесно
    //    се уцелваше бутонът, който ЗАТВАРЯ въпроса завинаги, а най-трудно —
    //    „🫂 на ръба“, точно отговорът на жената, чиито ръце треперят.
    //    Стилът е инлайн, защото CSS файловете не са мои.
    //    ПЪТ НАЗАД: махни трите реда `b.style…`.
    ред.style.flexWrap = 'wrap';
    [['🌤️', 'добре'], ['😮‍💨', 'уморена'], ['🫂', 'на ръба']].forEach(([e, v]) => {
      const b = el('button', 'fd-tb', e + ' ' + v); b.type = 'button';
      b.style.minHeight = '44px'; b.style.boxSizing = 'border-box';
      b.style.display = 'inline-flex'; b.style.alignItems = 'center'; b.style.justifyContent = 'center';
      b.addEventListener('click', () => {
        save(ТОН, { d: днес(), v });
        ред.innerHTML = v === 'на ръба'
          ? '<span class="fd-tq">Чуто. Днес — тихо, меко и без конфети. 🫂</span>'
          : v === 'уморена'
            ? '<span class="fd-tq">Разбрано — само важното, без шум. 😮‍💨</span>'
            : '<span class="fd-tq">Хубав ден да е! 🌤️</span>';
        setTimeout(() => ред.remove(), 2600);
        fx().buzz(6);
      });
      ред.appendChild(b);
    });
    const х = el('button', 'fd-tx', '✕'); х.type = 'button';
    х.setAttribute('aria-label', 'Не питай повече');
    х.title = 'Не ме питай това';
    х.addEventListener('click', () => { save('bl_tone_off', true); ред.remove(); });
    ред.appendChild(х);
    inner.appendChild(ред);
  }
  // „на ръба“ млъква фойерверките за целия ден
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.BL_FX) return;
    const конф = BL_FX.confetti ? BL_FX.confetti.bind(BL_FX) : null;
    const ура = BL_FX.cheer ? BL_FX.cheer.bind(BL_FX) : null;
    if (конф) BL_FX.confetti = function () { if (тонДнес() !== 'на ръба') return конф.apply(null, arguments); };
    if (ура) BL_FX.cheer = function (т) { if (тонДнес() === 'на ръба') return; return ура.apply(null, arguments); };
  });

  // ═══════════ 🤰 13.3.3 БРЕМЕННАТА МАМА ═══════════
  // Захранване, Развитие и Моето бебе месеци наред нямат какво да ѝ
  // кажат. Не се крият — ЗАСПИВАТ: меко, с обещание кога ще се събудят.
  const бременна = () => {
    const б = load('bl_baby', {});
    // проход 3: при пауза (загуба) BL_EXPECT.lmp() връща '' — НЕ падай на суровия
    // bl_lmp с ||, иначе къщичките „заспиват до раждането" пред жена след загуба.
    const lmp = (window.BL_EXPECT && BL_EXPECT.lmp) ? BL_EXPECT.lmp() : load('bl_lmp', '');
    return !б.birth && !!lmp;
  };
  const СПЯЩИ = ['Захранване', 'Развитие и игри', 'Моето бебе'];
  function приспиСтаите() {
    if (!бременна()) return;
    document.querySelectorAll('.ld-house').forEach(к => {
      const име = (к.getAttribute('aria-label') || '').split(' — ')[0];
      if (СПЯЩИ.includes(име) && !к.classList.contains('fd-sleep')) {
        к.classList.add('fd-sleep');
        к.appendChild(el('span', 'fd-zzz', '💤'));
        const ш = к.querySelector('.ld-tip em');
        if (ш) ш.textContent = 'спи до раждането — но можеш да надникнеш →';
      }
    });
    document.querySelectorAll('.room-card').forEach(к => {
      const име = к.dataset.room;
      if (СПЯЩИ.includes(име) && !к.querySelector('.fd-sleeptag')) {
        к.classList.add('fd-sleep');
        к.appendChild(el('span', 'fd-sleeptag', '💤 събужда се с бебето'));
      }
    });
  }

  // ═══════════ ✨ 13.3.7 СВЕТВАНЕ ПО ВЪЗРАСТ ═══════════
  // Нищо не се заключва. Но когато на стаята ѝ дойде ВРЕМЕТО, тя
  // светва — веднъж, с обяснение защо точно сега.
  function времеЗа() {
    const б = load('bl_baby', {});
    if (!б.birth) return null;
    // проход 3 T13: развитийните прагове (захранване, 6-те месеца) се мерят по
    // КОРИГИРАНА възраст (недоносени) — иначе за бебе 10 седмици по-рано лъжичките
    // светват при коригирани ~1.5м. Годинката остава календарна (рожден ден).
    // 19.08: календарната възраст също идва от BL_AGE — тя вече свежда датата
    //   до ЛОКАЛНА полунощ. Тук се смяташе ЧАС от МОМЕНТ срещу „YYYY-MM-DD“,
    //   прочетено като полунощ по Гринуич: втори брояч на месеци, който в
    //   западна часова зона връща друго число от екрана на мама.
    //   ПЪТ НАЗАД: `(Date.now() - new Date(б.birth)) / (30.4375 * 86400000)`.
    const възр = window.BL_AGE ? BL_AGE(б.birth) : null;
    const кал = възр ? възр.months : (Date.now() - new Date(б.birth)) / (30.4375 * 86400000);
    const м = възр ? възр.devMonths : кал;
    if (м >= 3.7 && м <= 6.5 && Object.keys(load('bl_tried', {})).length < 3)
      return ['Захранване', '🥄 Наближава време за първите лъжички — стаята те чака'];
    if (м >= 5.5 && м <= 7 && !Object.keys(load('bl_ms_d', {})).some(k => k.startsWith('6_')))
      return ['Развитие и игри', '🧸 Около 6-ия месец се случват чудеса — виж кои'];
    if (кал >= 11.2 && кал <= 12.5)
      // 🎂 обещаваше „прощъпулникът е в Развитие“, а такава карта няма никъде
      //    в стаята (единственото място с думата е обичаите в Лабораторията).
      return ['Развитие и игри', '🎂 Годинката наближава — виж какво умее вече и какво предстои'];
    return null;
  }
  function светни() {
    const в = времеЗа();
    if (!в) return;
    const [стая, защо] = в;
    // светва къщичката и картата — тихо, без изскачане
    document.querySelectorAll('.ld-house').forEach(к => {
      if ((к.getAttribute('aria-label') || '').startsWith(стая)) к.classList.add('fd-glow');
    });
    document.querySelectorAll('.room-card').forEach(к => {
      if (к.dataset.room === стая && !к.querySelector('.fd-nowtag')) {
        к.classList.add('fd-glow');
        к.appendChild(el('span', 'fd-nowtag', esc(защо)));
      }
    });
  }

  // ═══════════ 🌱 13.3.6 ЕДИН ВЪПРОС НА ДЕН, 30 ДНИ ═══════════
  // Мъничък всекидневен въпрос. Отговорът отива в дневника и в Реката —
  // на 30-ия ден мама има история, без да е „водила дневник“.
  const ВЪПРОСИ = [
    'С една дума: как мина днес?', 'Какво те разсмя днес?', 'Коя миризма ти е най-скъпа сега?',
    'Какво ново направи бебето (или коремчето)?', 'За какво си благодарна точно сега?',
    'Кое беше най-трудното днес?', 'Какво искаш да запомниш от тази седмица?',
    'Коя песничка върви у вас тези дни?', 'Как спа – ти, не бебето? 😄', 'Кой ти помогна днес?',
    'Какво би казала на себе си отпреди месец?', 'Кое човече ти липсва?',
    'Какво мирише в кухнята ви тези дни?', 'Коя дреха на бебето ти е любима?',
    'Какво ще правите утре, ако всичко върви по мед?', 'Какъв звук издава бебето най-често?',
    'Какво откри за себе си тази седмица?', 'На кого искаш да благодариш?',
    'Кое беше най-мекото нещо днес?', 'Какво те изненада?',
    'Какъв съвет ти дадоха, който НЕ послуша? 😄', 'Какво чакаш с нетърпение?',
    'Коя снимка от телефона ти е най-скъпа?', 'Какво правеше по това време преди година?',
    'С какво се гордееш тази седмица?', 'Кое беше смешното днес?',
    'Какво искаш да не забравиш никога?', 'Какво ще кажеш на бебето, когато порасне?',
    'Кой миг днес беше само ваш?', 'Какво пожелаваш на утрешния ден?'
  ];
  function карта30(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.fd-q30')) return;
    const с = load('bl_q30', { start: '', a: {} });
    if (!с.start) { с.start = днес(); save('bl_q30', с); }
    const ден = Math.min(30, Math.floor((new Date(днес()) - new Date(с.start)) / 86400000) + 1);
    if (Object.keys(с.a).length >= 30) return;                 // историята е събрана
    if (с.a[ден]) return;                                      // днешният е отговорен
    const к = el('div', 'fd-q30');
    к.innerHTML = `<span class="fd-qn">🌱 ${ден}/30</span>
      <p class="fd-qt">${esc(ВЪПРОСИ[(ден - 1) % ВЪПРОСИ.length])}</p>
      <div class="fd-qrow"><input class="fd-qi" type="text" maxlength="140" placeholder="Едно изречение стига…" aria-label="Отговорът ти за днес">
      <button class="fd-qb" type="button" aria-label="Запиши отговора">✔</button></div>`;
    const вход = к.querySelector('.fd-qi');
    // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): полето беше 218×38, а ✔ — 38×38.
    //    Това е ЕДИНСТВЕНИЯТ бутон на въпроса за деня и стои на екрана „Днес“,
    //    който мама отваря с една ръка. 38 е под прага за пръст.
    //    ПЪТ НАЗАД: махни двата реда `style` долу.
    вход.style.minHeight = '44px'; вход.style.boxSizing = 'border-box';
    const бут = к.querySelector('.fd-qb');
    бут.style.minWidth = '44px'; бут.style.minHeight = '44px'; бут.style.boxSizing = 'border-box';
    бут.style.display = 'inline-flex'; бут.style.alignItems = 'center'; бут.style.justifyContent = 'center';
    бут.addEventListener('click', () => {
      const т = вход.value.trim();
      if (!т) { вход.focus(); return; }
      // 🔴 известният клас: `с` е прочетено при РИСУВАНЕТО, а се записва при
      //    натискането — между двете „Днес“ може да се е пре-рисувал и да е
      //    записал отговор от друг ден. Четем прясно точно преди записа.
      const с2 = load('bl_q30', { start: с.start, a: {} });
      if (!с2.start) с2.start = с.start || днес();
      с2.a = с2.a || {};
      с2.a[ден] = т; save('bl_q30', с2); с.a = с2.a;
      // влива се в дневника → Реката я вижда, съзвездието я брои
      const дневник = load('bl_prompt_log', []);
      дневник.push({ d: Date.now(), q: ВЪПРОСИ[(ден - 1) % ВЪПРОСИ.length], t: т });
      save('bl_prompt_log', дневник);
      к.innerHTML = `<span class="fd-qn">🌱 ${ден}/30</span><p class="fd-qt">Записано — тече към Реката. 💜${ден >= 30 ? ' Трийсетте дни са ИСТОРИЯ — виж я в Дневника!' : ''}</p>`;
      fx().buzz(8);
      setTimeout(() => к.remove(), 2400);
    });
    вход.addEventListener('keydown', e => { if (e.key === 'Enter') к.querySelector('.fd-qb').click(); });
    inner.appendChild(к);
  }

  // ═══════════ 🎬 13.3.4 ДЕМО-РЕЖИМЪТ ═══════════
  // Празното приложение не показва стойността си. „Покажи ми“ налива
  // примерни данни САМО в празни ключове, помни ги и ги трие до един.
  const ДЕМО = 'bl_demo_keys';
  function имаДемоБутон() {
    // само за нова мама: почти нищо записано
    const данни = Object.keys(localStorage).filter(k => k.startsWith('bl_') &&
      !['bl_day1', 'bl_q30', 'bl_baby', 'bl_theme', 'bl_hero_toured', 'bl_room_visited', 'bl_demo_keys'].includes(k));
    return данни.length < 6 && !load(ДЕМО, []).length;
  }
  function пусниДемо() {
    const б = load('bl_baby', {});
    const взети = [];
    const сложи = (k, v) => { if (localStorage.getItem(k) == null) { save(k, v); взети.push(k); } };
    const д = н => { const x = new Date(); x.setDate(x.getDate() - н); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    сложи('bl_checkins', { [д(3)]: { m: 3, e: 60, w: 'спокойно' }, [д(2)]: { m: 2, e: 45, w: 'дълга нощ' }, [д(1)]: { m: 4, e: 75, w: 'разходка!' } });
    сложи('bl_tried', { 'Ябълка': '😋', 'Тиквичка': '😐', 'Банан': '😋', 'Морков': '🤢', 'Овесена каша': '😋' });
    сложи('bl_tried_d', { 'Ябълка': Date.now() - 20 * 864e5, 'Тиквичка': Date.now() - 15 * 864e5, 'Банан': Date.now() - 9 * 864e5, 'Морков': Date.now() - 5 * 864e5, 'Овесена каша': Date.now() - 2 * 864e5 });
    // 🌟 ключовете носят емоджи: „Първите пъти“ (rooms2.js:1065) чете fdata[f]
    //    по цял низ с емоджи. Без тях демото пълнеше ключове, които картата не
    //    намира — тя стоеше празна, а Витрината показваше същите мигове.
    сложи('bl_firsts', { '😊 Първа усмивка': д(40), '🙃 Първо обръщане': д(12) });
    сложи('bl_walk_days', { [д(3)]: 2, [д(2)]: 1, [д(1)]: 3 });
    сложи('bl_prompt_log', [{ d: Date.now() - 6 * 864e5, q: 'Какво те разсмя днес?', t: 'Киханката ѝ — три пъти подред и после голямо учудване.' }]);
    сложи('bl_river_manual', [{ ts: Date.now() - 30 * 864e5, e: '🌟', t: 'първата истинска усмивка (не газове! 😄)' }]);
    save(ДЕМО, взети);
    location.reload();
  }
  function демоЛента() {
    if (!load(ДЕМО, []).length || document.getElementById('fdDemoBar')) return;
    const л = el('div', 'fd-demobar'); л.id = 'fdDemoBar';
    л.innerHTML = `<span>🎬 Гледаш ПРИМЕРНИ данни — така изглежда след месец-два.</span>
      <button class="jr-chip" type="button">🗑️ Махни ги</button>`;
    л.querySelector('button').addEventListener('click', () => {
      load(ДЕМО, []).forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      localStorage.removeItem(ДЕМО);
      location.reload();
    });
    document.body.appendChild(л);
  }
  function демоПокана(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.querySelector('.fd-demo') || !имаДемоБутон() || еПървиДен()) return;
    const б = el('button', 'fd-demo', '🎬 Покажи ми как изглежда след 3 месеца'); б.type = 'button';
    б.addEventListener('click', пусниДемо);
    inner.appendChild(б);
  }

  // ═══════════ 🌱 проход 4 [32]: свитъкът „Трийсетте ти дни" в Дневника ═══════════
  // Обещанието „на 30-ия ден има история" се сбъдва — всички отговори събрани,
  // датирани, за принт/запазване. При нула отговори — картата мълчи.
  function свитъкКарта(root) {
    const с = load('bl_q30', { start: '', a: {} });
    const дни = Object.keys(с.a || {}).map(Number).filter(n => n >= 1 && с.a[n]).sort((a, b) => a - b);
    if (!дни.length) return;
    const въпросЗа = n => ВЪПРОСИ[(n - 1) % ВЪПРОСИ.length];
    const датаЗа = n => с.start ? new Date(new Date(с.start).getTime() + (n - 1) * 86400000).toLocaleDateString('bg-BG') : '';
    const c = el('section', 'jr-card');
    c.appendChild(el('h4', 'jr-title', 'Трийсетте ти дни 🌱 <span class="jr-sub">' + дни.length + (дни.length === 1 ? ' записан ден от 30' : ' записани дни от 30') + '</span>'));
    c.appendChild(el('p', 'jr-privacy', 'Всеки въпрос, на който си отговорила — събран на едно място. Твоята история, писана по мъничко. 💜'));
    const list = el('div', 'q30-scroll bl-stagger');
    дни.forEach(n => {
      const row = el('div', 'q30-row');
      row.innerHTML = `<div class="q30-day">Ден ${n}${датаЗа(n) ? ' · ' + датаЗа(n) : ''}</div><div class="q30-q">${esc(въпросЗа(n))}</div><div class="q30-a">„${esc(с.a[n])}“</div>`;
      // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): въпросът приема 140 знака и
      //    мама може да напише дълга дума без интервали (или да лепне адрес).
      //    Свитъкът ставаше 1280 px широк при 347 px екран — редът се влачеше
      //    настрани и отговорът ѝ оставаше извън телефона.
      //    ПЪТ НАЗАД: махни реда `row.querySelectorAll…`.
      row.querySelectorAll('.q30-a, .q30-q').forEach(e => { e.style.overflowWrap = 'anywhere'; e.style.wordBreak = 'break-word'; e.style.minWidth = '0'; });
      list.appendChild(row);
    });
    c.appendChild(list);
    if (window.BL_EXPR && BL_EXPR.printOverlay) {
      const p = el('button', 'jr-btn', '🖨️ Запази/принтирай свитъка'); p.type = 'button';
      p.addEventListener('click', () => {
        const html = дни.map(n => `<div style="margin:12px 0;padding-bottom:8px;border-bottom:1px solid #eee"><strong>Ден ${n}${датаЗа(n) ? ' · ' + датаЗа(n) : ''}</strong><br><em>${esc(въпросЗа(n))}</em><br>${esc(с.a[n])}</div>`).join('');
        BL_EXPR.printOverlay('Трийсетте ти дни 🌱', html, {});
      });
      c.appendChild(p);
    }
    root.appendChild(c);
  }
  const базаДневник = window.ROOM_FEATURES && window.ROOM_FEATURES['Дневник на мама'];
  if (базаДневник) window.ROOM_FEATURES['Дневник на мама'] = root => { базаДневник(root); свитъкКарта(root); };

  // ═══════════ свързване ═══════════
  const предишнотоЗакачане = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (предишнотоЗакачане) предишнотоЗакачане(container, baby, a);
    // първият ден чисти шума СЛЕД като всички са монтирали своето
    const тихо = тихПървиДен(container);
    монтирайТон(container);
    if (!тихо) { карта30(container); демоПокана(container); }
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    приспиСтаите();
    светни();
    демоЛента();
  }, 900));

  window.BL_FIRSTDAY = { бременна, времеЗа, тонДнес };
})();
