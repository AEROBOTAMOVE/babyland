// ═══════════════════════════════════════════════════════════
// ROOMS 4 — още по едно съкровище за всяка стая (одит-вълна)
// 💧 вода • 🍼 изпито днес • 🎲 какво за обяд • 🧰 аптечка-старт
// 📊 месецът в числа • 🏅 витрина на гордостта • 🔦 нощна лампа
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js — 126 ключа × 17 форми отрова):
  //    формата се проверяваше само ОТВЪН. ВЪТРЕ в масива можеше да седи
  //    `null` (внесено копие от друг телефон, прекъснат запис, стара версия)
  //    и първото `x.ts` събаряше картата. 59 карти умираха точно така —
  //    същият дефект като истинския `bl_custom_lists = [null]`.
  //    `безДупки` маха дупките ПРЕДИ някой да ги пипне.
  //    ЗАЩО Е БЕЗОПАСНО: никъде в проекта `null` не се пази в масив като
  //    „празно място" (проверено с grep за push(null) / fill(null) / [i]=null)
  //    — списъците са ЗАПИСИ, не решетки, тоест изместен индекс не значи нищо.
  //    ПЪТ НАЗАД: сменяш `безДупки(v)` обратно с `v` — един знак.
  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): проверката за форма пазеше САМО
  //    масив-срещу-обект. Ключ с ЧИСЛО по подразбиране (bl_metime_start = 0)
  //    приемаше {} спокойно — после „сега минус {}" даваше NaN и на екрана
  //    на мама светеше часовник „NaN:NaN". простФормат пази и трите прости
  //    вида. Числов низ („15") се ПРЕВРЪЩА, не се хвърля — стари версии са
  //    пазили числа като низове и изхвърлянето би загубило истински данни.
  //    Връща undefined, когато няма мнение — не null, защото null е законна
  //    стойност по подразбиране на много места тук.
  //    ПЪТ НАЗАД: махаш от load реда, който вика простФормат.
  const простФормат = (v, d) => {
    const т = typeof d;
    if (т === 'number') {
      if (typeof v === 'number' && isFinite(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) return Number(v);
      return d;
    }
    if (т === 'string') return typeof v === 'string' ? v : d;
    if (т === 'boolean') return typeof v === 'boolean' ? v : d;
    return undefined;
  };
  const безДупки = (v, дълб) => {
    if (!v || typeof v !== 'object') return v;
    const д = дълб || 0;
    if (д > 6) return v;                       // вложен боклук: спираме, не обикаляме вечно
    if (Array.isArray(v)) {
      for (let i = v.length - 1; i >= 0; i--) {
        if (v[i] === null || v[i] === undefined) v.splice(i, 1);
        else безДупки(v[i], д + 1);
      }
      return v;
    }
    for (const кл in v) if (Object.prototype.hasOwnProperty.call(v, кл)) безДупки(v[кл], д + 1);
    return v;
  };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; const прим = простФормат(v, d); if (прим !== undefined) return прим; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return безДупки(v); } catch (e) { return d; } };
  // 🔴 25.08: виж бележката в rooms.js — записът падаше тихо, а чашката/милилитрите
  //   се рисуваха все едно е минал. ПЪТ НАЗАД: махаш извикването на BL_ZAPIS_PADNA.
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {}, pop() {}, chime() {} };
  const MOODS = ['😩', '😔', '😐', '🙂', '🥰'];

  // ── 🤰 💧 Чаши вода днес (броим изпитото, не недостига) ──
  function waterCard() {
    // 🤍 29.07 (обиколка): expect.js е писан ТОЧНО за да спре тези карти
    //    след загуба, но пазачът стоеше само на symptomCard. Жена, натиснала
    //    „Спри тихо броенето“, продължаваше да бъде посрещана с „чакаме него“.
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    // 🔴 05.08 (одит г08, №224): подзаглавието беше „пиеш за двама“ — точно
    //    митът, който самото приложение развенчава на две други места
    //    (wisdom.js: „Яде се ЗА двама, не КОЛКОТО двама“; kb.js: „не «за
    //    двама»“). А редът отдолу пишеше „5 / 8 чаши днес“: число, което не
    //    идва отникъде в кода, и сметка за онова, което мама НЕ е изпила.
    //    Чашките остават за цъкане; присъдата отпада.
    const c = card('Вода днес 💧 <span class="jr-sub">жаждата идва със закъснение — изпреварвай я</span>');
    // ⚖️ г09-скептик: първата поправка смени САМО текстовете. Отдолу остана
    //    `GOAL = 8` — редът се рисуваше винаги с осем чашки, значи при три
    //    изпити мама виждаше ПЕТ ПРАЗНИ 🥛. Това е буквално броене на онова,
    //    което не е направила, а числото 8 пак нямаше произход. Редът вече
    //    РАСТЕ: нейните чашки + една празна за следващата. Без таван, без
    //    финална линия.
    let data = load('bl_water', { d: today(), n: 0 });
    if (data.d !== today()) data = { d: today(), n: 0 };
    const row = el('div', 'wt-row');
    const note = el('p', 'cs-note', '');
    function draw() {
      row.innerHTML = '';
      for (let i = 0; i <= data.n; i++) {
        const пълна = i < data.n;
        const b = el('button', 'wt-cup' + (пълна ? ' full' : ''), пълна ? '💧' : '🥛');
        b.type = 'button';
        // ♿ 11.08 (клавиатура-четец): чашките бяха само картинка — четецът редеше
        //    „бутон, бутон, бутон" и не се разбираше коя по ред е. Състоянието
        //    върви през aria-pressed, за да не се брои какво НЕ е изпито.
        b.setAttribute('aria-label', 'Чаша ' + (i + 1));
        b.setAttribute('aria-pressed', пълна ? 'true' : 'false');
        // 📏 11.08 (измерено с getBoundingClientRect): чашката е 42×46 —
        //    ширината е под прага за пръст (44). Расте ЦЕЛТА, рисунката си
        //    остава същата. ПЪТ НАЗАД: изтрий реда.
        b.style.minWidth = '44px';
        b.addEventListener('click', () => {
          // 🔴 11.08 капанът на снимката: `data` е прочетено при РИСУВАНЕ. Ако
          //    същата карта живее и другаде (скрития панел), старото ѝ число се
          //    записваше отгоре. Пресен прочит ПРЕДИ записа.
          data = load('bl_water', { d: today(), n: 0 });
          if (data.d !== today()) { data = { d: today(), n: 0 }; }   // виж бележката при мл
          data.n = i < data.n ? i : i + 1; // цъкаш последната пълна → маха я
          // 🔴 25.08: чашката се пълнеше и редът „Досега днес: N чаши“ се
          //    вдигаше и при паднал запис — числото изчезваше при следващото
          //    влизане. Рисуваме СЛЕД записа. ПЪТ НАЗАД: махаш `if (!…) return;`
          if (!save('bl_water', data)) return;
          draw();
          // празникът е за ЗАПОЧНАТОТО, не за някакъв изпълнен норматив
          if (data.n === 1) { fx().confetti(row); fx().cheer('Първата за днес 💧'); }
          else fx().buzz(6);
        });
        row.appendChild(b);
      }
      note.innerHTML = data.n
        ? `Досега днес: <strong>${data.n}</strong> ${data.n === 1 ? 'чаша' : 'чаши'} 💧`
        : 'Цъкни чашка, щом изпиеш една. Без сметка накрая. 💧';
    }
    draw();
    c.appendChild(row); c.appendChild(note);
    return c;
  }

  // ── 🍼 Изпито днес (мл при шише/смесено хранене) ──
  function mlCard() {
    const c = card('Изпито днес 🍼 <span class="jr-sub">за шишето и смесеното — броим милилитрите</span>');
    let data = load('bl_ml', { d: today(), n: 0 });
    if (data.d !== today()) data = { d: today(), n: 0 };
    const big = el('div', 'ml-big', '');
    const row = el('div', 'jr-quick');
    // 🔁 11.08 (правило 3 — изход ПРЕДИ действието): „↺ Нулирай“ триеше целия
    //    ден без път назад. Тук живее и обратната връзка, и връщането.
    const бележка = el('p', 'jr-privacy ml-note', '');
    [30, 60, 90, 120].forEach(v => {
      const b = el('button', 'jr-chip', '+' + v + ' мл'); b.type = 'button';
      b.addEventListener('click', () => {
        data = load('bl_ml', { d: today(), n: 0 });   // 🔴 пресен прочит ПРЕДИ записа
        if (data.d !== today()) data = { d: today(), n: 0 };   // полунощ мина, докато картата стоеше отворена
        data.n += v;
        if (!save('bl_ml', data)) return;   // 🔴 25.08: иначе едрото число расте без памет
        draw(); fx().buzz(8);
        бележка.innerHTML = '';   // старото „върни“ вече не важи за това число
      });
      row.appendChild(b);
    });
    // 🟡 11.08 (обиколка като майка): голото „↺“ значеше НУЛИРАЙ ЦЕЛИЯ ДЕН, а
    //    две карти по-горе същият знак („↺ Върни последното“, помпенето) значи
    //    „махни последното“. Разликата живееше само в title — а на телефон
    //    title не се вижда. Изписваме я.
    const undo = el('button', 'jr-chip', '↺ Нулирай'); undo.type = 'button'; undo.title = 'нулирай днешните милилитри';
    undo.addEventListener('click', () => {
      data = load('bl_ml', { d: today(), n: 0 });   // 🔴 пресен прочит ПРЕДИ записа
      if (data.d !== today()) data = { d: today(), n: 0 };
      // 🔇 11.08 (измерено): при нула бутонът пак вдигаше диалог, а после нищо
      //    не се променяше — питане без последствие. Казваме го направо.
      if (!data.n) { бележка.innerHTML = 'Днешното вече е нула — няма какво да нулирам. 💧'; fx().buzz(4); return; }
      const беше = data.n;
      (window.BL_UI ? BL_UI.confirm('Нулиране на днешните милилитри?', { emoji: '💧', okText: 'Нулирай', cancelText: 'Отказ' }) : Promise.resolve(confirm('Нулиране на днешните милилитри?'))).then(да => {
        if (!да) { бележка.innerHTML = 'Оставих ги както бяха. 💧'; return; }
        data = load('bl_ml', { d: today(), n: 0 });   // 🔴 пресен прочит ПРЕДИ записа
        if (data.d !== today()) data = { d: today(), n: 0 };
        data.n = 0;
        if (!save('bl_ml', data)) return;   // 🔴 25.08: иначе едрото число пада на 0 без памет
        draw();
        бележка.innerHTML = '';
        const върни = el('button', 'jr-chip', '↩️ Върни ' + беше + ' мл'); върни.type = 'button';
        върни.style.minHeight = '44px';
        върни.addEventListener('click', () => {
          data = load('bl_ml', { d: today(), n: 0 });   // 🔴 пресен прочит ПРЕДИ записа
          if (data.d !== today()) data = { d: today(), n: 0 };
          data.n = беше;
          if (!save('bl_ml', data)) return;   // 🔴 25.08: иначе казва „Върнах ги“, без да ги е върнало
          draw();
          бележка.innerHTML = 'Върнах ги. 💧'; fx().buzz(8);
        });
        бележка.appendChild(върни);
      });
    });
    row.appendChild(undo);
    function draw() { big.innerHTML = `<strong>${data.n}</strong> мл днес`; }
    draw();
    c.appendChild(big); c.appendChild(row); c.appendChild(бележка);
    // проход 3 T25: изравнено с решението в базата (kb mb-kolko-mliako / zh-milk-qty),
    // които НАРОЧНО вече не дават число — рамката е на кутията и при педиатъра.
    c.appendChild(el('p', 'jr-privacy', 'Ориентир: при изцяло шише дневното количество се смята по килограмите — точната рамка е на кутията и при педиатъра (виж „Колко мляко…“ при Мира).'));
    return c;
  }

  // ── 🎲 Какво за обяд? (идея от опитаното + рецептите) ──
  function lunchCard() {
    const c = card('Какво за обяд? 🎲 <span class="jr-sub">завърти, когато главата е празна, а бебето гладно</span>');
    const btn = el('button', 'jr-btn', '🎲 Дай идея!'); btn.type = 'button';
    const out = el('div', 'lc-out');
    // 🎲 11.08 (измерено, 6 натискания подред): двойката се вадеше на случаен
    //    принцип от 8 — две поредни еднакви идеи се случват често, а тогава
    //    бутонът ИЗГЛЕЖДА счупен („натиснах, нищо не стана“). Помним само
    //    последната и не я повтаряме веднага. ПЪТ НАЗАД: махни `последна`
    //    и филтъра под него.
    let последна = '';
    const COMBOS = [
      ['тиквичка', 'картоф'], ['морков', 'ориз'], ['тиква', 'овес'], ['броколи', 'картоф'],
      ['ябълка', 'овес'], ['банан', 'авокадо'], ['пилешко', 'морков', 'ориз'], ['круша', 'овес']
    ];
    btn.addEventListener('click', () => {
      // 🚨 22.07 (армия): картата предлагаше „пилешко + морков + ориз“ и на
      //   4-месечно бебе — твърда храна преди захранването изобщо да е почнало.
      //   И вадеше „любими“, без да гледа дали после е имало РЕАКЦИЯ.
      const дневник = load('bl_tried', {});
      const реакция = k => /⚠️|🤢/.test(дневник[k] || '');      // отбелязана реакция или отказ
      const възраст = (function () {
        try { const b = JSON.parse(localStorage.getItem('bl_baby') || '{}');
          const a = b.birth && window.BL_AGE ? BL_AGE(b.birth) : null;
          // 🔴 05.08 (одит г08, №39): тук се четеше КАЛЕНДАРНАТА възраст, а
          //    календарът на храните две карти по-горе мери по КОРИГИРАНАТА
          //    (rooms2.js, заради недоносените). Бебе на 32-ра седмица, 7
          //    календарни / 5 коригирани месеца: календарът честно казваше
          //    „още нищо“, а тази карта в същия екран предлагаше пилешко.
          return a ? (a.devMonths != null ? a.devMonths : a.months) : null; } catch (e) { return null; }
      })();
      if (възраст != null && възраст < 6) {
        out.innerHTML = '<div class="lc-idea pop">🍼 На тази възраст обядът още е мляко.<br>' +
          // 05.08 (одит г06, №242): пращаше „по-горе“, а „Готови ли сме?“ е в
          // кътче „🍓 Храните“, което order4.js слага ПОД „🥄 Днес на масата“,
          // където живее тази карта. Мама скролваше нагоре към празно място.
          '<span class="lc-sub">Захранването започва около 6-ия месец и когато бебето покаже трите знака. Виж „Готови ли сме?“ по-долу. 💛</span></div>';
        fx().buzz(8);
        return;
      }
      const tried = Object.keys(дневник).filter(k => String(дневник[k] || '').includes('😋') && !реакция(k));
      let idea;
      if (tried.length >= 2 && Math.random() < 0.5) {
        const a = tried[Math.floor(Math.random() * tried.length)];
        let b = tried[Math.floor(Math.random() * tried.length)];
        if (b === a) b = null;
        последна = a + '+' + (b || '');
        idea = '💜 От любимите ви: <strong>' + esc(a) + (b ? ' + ' + esc(b) : '') + '</strong>';
      } else {
        // класиката също минава през дневника: каквото е дало реакция, отпада
        const чисти = COMBOS.filter(cmb => !cmb.some(реакция));
        const източник = чисти.length ? чисти : COMBOS;
        const без = източник.filter(x => x.join('+') !== последна);
        const пул = без.length ? без : източник;      // ако е останала само една — дава пак нея
        const cmb = пул[Math.floor(Math.random() * пул.length)];
        последна = cmb.join('+');
        idea = '🎲 Класика: <strong>' + cmb.map(esc).join(' + ') + '</strong>';
        // 22.07 (армия): комбинацията дава 2-3 храни наведнъж, а собственото
        //   правило на приложението е новото да се дава ПООТДЕЛНО няколко дни —
        //   иначе, ако има реакция, не се разбира от какво. Ако някоя от
        //   продуктите е още непозната, казваме го.
        const непознати = cmb.filter(х => !дневник[х]);
        if (непознати.length) {
          idea += '<br><span class="lc-sub">💛 ' + непознати.map(esc).join(' и ') +
            (непознати.length === 1
              ? ' е нова за вас — дай я сама 2-3 дни, преди да я смесваш.'
              : ' са нови за вас — дай ги поотделно, по 2-3 дни всяка, преди да ги смесваш.') +
            ' Така ще знаеш от какво е, ако има реакция.</span>';
        }
      }
      out.innerHTML = `<div class="lc-idea pop">${idea}<br><span class="lc-sub">Рецептите-карти по-долу знаят как. 👩‍🍳</span></div>`;
      fx().buzz(8);
    });
    c.appendChild(btn); c.appendChild(out);
    return c;
  }

  // ── 🧰 Аптечка бърз старт (готов списък с 1 докосване) ──
  const PHARMACY_START = ['Термометър', 'Физиологичен серум', 'Назален аспиратор', 'Пробиотик (по лекарско)', 'Крем за подсичане', 'Стерилни марли', 'Спринцовка-дозатор', 'Пинсета за кърлежи'];
  function pharmacyStartCard(root) {
    const c = card('Аптечка бърз старт 🧰 <span class="jr-sub">основните 8 — добави ги с едно докосване</span>');
    const row = el('div', 'jr-quick');
    const чипове = [];
    PHARMACY_START.forEach(n => {
      const has = () => load('bl_pharmacy', []).some(x => x.n === n);
      const b = el('button', 'jr-chip' + (has() ? ' on' : ''), (has() ? '✓ ' : '+ ') + n); b.type = 'button';
      чипове.push({ n, b, has });
      b.addEventListener('click', () => {
        const cur = load('bl_pharmacy', []);
        // 22.07: второто докосване мълчеше — мама не знаеше дали го е добавила
        if (cur.some(x => x.n === n)) { fx().cheer('„' + n + '“ вече е в аптечката ✔'); return; }
        cur.push({ n, exp: '' });
        // 🔴 25.08 (ИЗМЕРЕНО с пълна памет): чипът ставаше „✓ Термометър“ и при
        //    паднал запис. Синхронизирай() поправя надписа чак при СЛЕДВАЩОТО
        //    докосване в стаята — излезе ли мама веднага, тя остава с „✓“ за
        //    нещо, което не е в аптечката, и не го купува.
        if (!save('bl_pharmacy', cur)) return;
        b.textContent = '✓ ' + n; b.classList.add('on'); fx().buzz(8);
        // …и наистина да се ПОЯВИ горе, както пише отдолу
        if (typeof window.BL_PHARMACY_REDRAW === 'function') { try { window.BL_PHARMACY_REDRAW(); } catch (e) { } }
      });
      row.appendChild(b);
    });
    // 🔴 11.08 (известният клас 7/8, ИЗМЕРЕНО наживо): чиповете четяха bl_pharmacy
    //    ВЕДНЪЖ при рисуването. Изтриеш ли „Термометър“ от „Аптечката вкъщи“
    //    (същата стая, две карти по-горе), чипът тук продължаваше да стои зелен
    //    с „✓ Термометър“. Мама чете „имам термометър“ и не го купува — а го няма.
    //    Кликът винаги е бил верен (чете прясно), лъжеше НАДПИСЪТ.
    //    ЛЕК: след всяко докосване някъде в стаята сверяваме надписите с паметта.
    //    ПЪТ НАЗАД: махни синхронизирай() и слушателя — надписите пак ще застиват.
    const синхронизирай = () => {
      чипове.forEach(({ n, b, has }) => {
        const е = has();
        const трябва = (е ? '✓ ' : '+ ') + n;
        if (b.textContent !== трябва) b.textContent = трябва;
        b.classList.toggle('on', е);
      });
    };
    if (root && root.addEventListener) {
      // стаята се строи наново при всяко влизане → нов root, слушателите не се трупат
      root.addEventListener('click', () => setTimeout(синхронизирай, 60));
    }
    c.appendChild(row);
    // сверено наживо: след секциониране „Аптечката вкъщи" е НАД тази карта
    // (одит-флот П23, проход 2 №18)
    c.appendChild(el('p', 'jr-privacy', 'Появяват се в „Аптечката вкъщи“ по-горе — там сложи и сроковете.'));
    return c;
  }

  // ── 📊 Месецът ми в числа (Луна брои вместо теб) ──
  function monthStatsCard() {
    const c = card('Месецът ти в числа 📊 <span class="jr-sub">Луна брои — ти само живееш</span>');
    const now = new Date();
    const pref = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const cks = Object.entries(load('bl_checkins', {})).filter(([d]) => d.startsWith(pref));
    if (!cks.length) { c.appendChild(el('p', 'jr-privacy', 'Първата минутка за теб този месец ще запали числата тук. ✨')); return c; }
    const avgE = Math.round(cks.reduce((s, [, r]) => s + (r.e || 0), 0) / cks.length);
    const moodCnt = {};
    const wordCnt = {};
    // 🟡 11.08 (ИЗМЕРЕНО с чекин без личице): броеше и записите БЕЗ настроение —
    //    ключът ставаше "undefined", а плочката изписваше буквално „undefined“
    //    на мястото на лицето. Броим само истинските лица.
    cks.forEach(([, r]) => {
      if (r && typeof r.m === 'number' && MOODS[r.m]) moodCnt[r.m] = (moodCnt[r.m] || 0) + 1;
      const w = String((r && r.w) || '').trim().toLowerCase(); if (w) wordCnt[w] = (wordCnt[w] || 0) + 1;
    });
    const topMood = Object.entries(moodCnt).sort((a, b) => b[1] - a[1])[0];
    const topWord = Object.entries(wordCnt).sort((a, b) => b[1] - a[1])[0];
    // #24: локален месец от двете страни — toISOString дава UTC и събитие около
    // полунощ в края на месеца падаше в съседния месец спрямо локалния pref.
    const локаленМесец = ts => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
    const river = window.BL_RIVER ? BL_RIVER.collect().filter(x => локаленМесец(x.ts) === pref).length : 0;
    const grid = el('div', 'ms-grid');
    (topMood ? [[MOODS[topMood[0]], 'най-честото лице']] : [])
      .concat([[`<span data-cnt="${cks.length}">${cks.length}</span>`, 'минутки за теб'], [`<span data-cnt="${avgE}">${avgE}</span>%`, 'средна енергия']])
      .concat(topWord ? [['„' + esc(topWord[0]) + '“', 'думата на месеца']] : [])
      .concat(river ? [[`<span data-cnt="${river}">${river}</span>`, 'мига в Реката']] : [])
      .forEach(([v, lbl]) => grid.appendChild(el('div', 'ms-stat', `<strong>${v}</strong><span>${lbl}</span>`)));
    c.appendChild(grid);
    setTimeout(() => { if (window.BL_FX) BL_FX.countUp(grid); }, 350); // числата отброяват след скелетона
    return c;
  }

  // ── 🏅 Витрина на гордостта (последните разцъфнали неща) ──
  function prideCard() {
    const c = card('Витрина на гордостта 🏅 <span class="jr-sub">последните големи мигове, под стъкло</span>');
    const items = [];
    // 🟡 11.08 (ИЗМЕРЕНО с чужд/стар ключ в bl_ms_d): непознат вид умение даваше
    //    lbl === undefined и на златния пиедестал застаналo буквално
    //    „undefined (~8 м.)“. Същото при дата, която не се чете (NaN) — редът
    //    се подреждаше най-отгоре и показваше „Invalid Date“.
    //    Каквото не мога да назова честно, не го слагам под стъкло.
    const дата = v => { const t = typeof v === 'number' ? v : new Date(v).getTime(); return isFinite(t) && t > 0 ? t : null; };
    Object.entries(load('bl_ms_d', {})).forEach(([id, ts]) => {
      const lbl = { motor: '🤸 ново движение', fine: '✋ фина магия', speech: '🗣️ говор-стъпка', social: '💛 социално чудо' }[id.split('_')[1]];
      const t = дата(ts);
      if (!lbl || t == null) return;
      items.push({ ts: t, txt: lbl + ' (~' + id.split('_')[0] + ' м.)' });
    });
    Object.entries(load('bl_firsts', {})).forEach(([f, d]) => { const t = дата(d); if (t != null) items.push({ ts: t, txt: '🌟 ' + f }); });
    Object.entries(load('bl_teeth_d', {})).forEach(([, ts]) => { const t = дата(ts); if (t != null) items.push({ ts: t, txt: '🦷 ново зъбче' }); });
    items.sort((a, b) => b.ts - a.ts);
    if (!items.length) { c.appendChild(el('p', 'jr-privacy', 'Първото „за първи път“ ще застане тук на пиедестал. 🏅')); return c; }
    const list = el('div', 'pd-list');
    items.slice(0, 4).forEach((it, i) => {
      list.appendChild(el('div', 'pd-row' + (i === 0 ? ' pd-top' : ''),
        `<span class="pd-medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'}</span><span class="pd-txt">${esc(it.txt)}</span><span class="pd-d">${new Date(it.ts).toLocaleDateString('bg-BG')}</span>`));
    });
    c.appendChild(list);
    return c;
  }

  // ── 🔦 Нощна лампа (мек червен екран за нощните хранения) ──
  function openLamp() {
    let lamp = document.getElementById('blLamp');
    if (!lamp) {
      lamp = el('div', 'bl-lamp'); lamp.id = 'blLamp';
      lamp.innerHTML = '<span class="bl-lamp-hint">докосни, за да изгасиш</span>';
      // ♿ 11.08: лампата беше гол <div> — само мишка/пръст я гасеше. Дай ѝ име
      //    и клавиш, за да има изход и с клавиатура/четец.
      lamp.setAttribute('role', 'button');
      lamp.setAttribute('tabindex', '0');
      lamp.setAttribute('aria-label', 'Нощна лампа — докосни, за да изгасиш');
      // 🔴 11.08 (ИЗМЕРЕНО): нощният режим слага `filter:` върху <body>, а
      //    филтърът прави body съдържащ блок за `position: fixed`. Лампата
      //    (fixed, inset:0) спираше да мери екрана и почваше да мери ЦЯЛАТА
      //    страница — измерено 11557px вместо 568. Надписът „докосни, за да
      //    изгасиш“ е центриран → отиваше хиляди пиксели извън видимото и
      //    жената насред нощта не виждаше как се гаси.
      //    В <html> филтър няма. ПЪТ НАЗАД: върни document.body.appendChild.
      (document.documentElement || document.body).appendChild(lamp);
      const изгаси = () => {
        lamp.hidden = true; document.body.style.overflow = '';
        // 22.07 (армия): без това екранът оставаше буден и СЛЕД изгасяне на
        // лампата — цяла нощ, на батерия. Всяко ново палене искаше още един lock.
        if (lamp._lock) { try { lamp._lock.release(); } catch (e) {} lamp._lock = null; }
      };
      lamp.addEventListener('click', изгаси);
      lamp.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); изгаси(); } });
    }
    lamp.hidden = false;
    // 🟡 11.08 (измерено на телефон): изгасването чистеше body.overflow, но
    //    паленето никога не го слагаше. Палецът върху „тъмното“ скролваше
    //    СТРАНИЦАТА отдолу и след гасенето мама беше на съвсем друго място.
    document.body.style.overflow = 'hidden';
    try { lamp.focus({ preventScroll: true }); } catch (e) {}
    // екранът не заспива — но пазим sentinel-а, за да можем да го пуснем
    try {
      if (navigator.wakeLock && !lamp._lock) {
        navigator.wakeLock.request('screen').then(s => { lamp._lock = s; }).catch(() => {});
      }
    } catch (e) {}
    if (window.BL_FX) BL_FX.buzz(8);
  }
  window.BL_LAMP = openLamp; // и за прекия път от иконата на телефона

  function nightLampCard() {
    const c = card('Нощна лампа 🔦 <span class="jr-sub">мека светлина от телефона — без да будиш никого</span>');
    const btn = el('button', 'jr-btn', '🔦 Включи нощната лампа'); btn.type = 'button';
    btn.addEventListener('click', openLamp);
    c.appendChild(btn);
    // 🔴 05.08 (одит г08, №313): пишеше „безвредна за съня“ — абсолютна
    //    гаранция без нито един източник, а мама я чете като разрешение да
    //    остави лампата да свети дълго. Приложението формулира същото
    //    сравнително на друго място (wisdom.js). Тук — също сравнително.
    c.appendChild(el('p', 'jr-privacy', 'Топла тъмночервена светлина — вижда се достатъчно за пелена и буди по-малко от бялата или синята светлина на екрана. Дръж я кратко. Екранът остава буден, докато е включена.'));
    return c;
  }

  // ── регистрация ──
  // 🔴🔴 04.08 (обиколка): картите, които се пазят от паузата след загуба,
  //    връщат null — а тук се подаваха право на appendChild. Проверено наживо
  //    с BL_EXPECT.pause(): цялата стая „Бременност“ ГЪРМЕШЕ с
  //    „appendChild: parameter 1 is not of type Node“ и не се рисуваше.
  //    Тоест жена, която току-що е загубила, отваря стаята и вижда празно.
  //    Дефектът е мой — от пласта с пазачите. Затова добавям пазач и тук:
  //    null просто не се добавя.
  const сложи = (r, карта) => { if (карта) r.appendChild(карта); };
  const PACKS4 = {
    'Бременност': r => сложи(r, waterCard()),
    'Моето бебе': r => сложи(r, mlCard()),
    'Захранване': r => сложи(r, lunchCard()),
    'Здраве и SOS': r => сложи(r, pharmacyStartCard(r)),
    'Дневник на мама': r => сложи(r, monthStatsCard()),
    'Развитие и игри': r => сложи(r, prideCard()),
    'Инструменти': r => сложи(r, nightLampCard())
  };
  Object.keys(PACKS4).forEach(room => {
    const base = window.ROOM_FEATURES && window.ROOM_FEATURES[room];
    if (base) window.ROOM_FEATURES[room] = root => { base(root); PACKS4[room](root); };
  });
})();
