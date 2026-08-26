// ═══════════════════════════════════════════════════════════
// ROOMS 17 — ПАМЕТТА И ДИАПАЗОНИТЕ (план 19, част 4)
//
// 🩻 4.1.1  Ехо-албумът — снимка от всеки преглед + седмица + „какво видяхме“
// 🌳 4.6.10 Дървото: печатаемо
// 📊 4.6.11 Уменията: „моето дете кога“ — ДИАПАЗОНИ, не дати (без тревога)
// 🗣️ 4.6.4  Двуезичното дете — реални стъпки
// 🕐 4.2.9  Типичният ти ден — сглобен от данните, не от книга
//
// ЖЕЛЯЗНО за 4.6.11: диапазони, НИКОГА „изостава“. Всяко число носи
// „нормалното е широко“. Тревогата се праща при педиатър, не се сее тук.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // 🔴🔴 25.08 (ИЗМЕРЕНО, dev/interaktivno_stai2.js — 46 натискания при пълна памет):
  //    `return false` беше НЯМ: почти никой не го четеше, а мама виждаше „✔ Записах“.
  //    Сега падналият запис минава през ЧЕСТНИЯ канал на rooms.js (модал — вижда се
  //    ВИНАГИ). Нарочно НЕ през BL_FX.cheer: fx.js:93 мълчи при тежък ден и при
  //    намалено движение, тоест точно когато най-трябва.
  //    ПЪТ НАЗАД: махаш `провалът();` от catch — връща се старото мълчание.
  const провалът = () => {
    try { if (window.BL_ZAPIS_PADNA) { window.BL_ZAPIS_PADNA(); return; } } catch (e) {}
    try { alert('Паметта на телефона е пълна — това НЕ се записа. 😕 Написаното си остава в полето.'); } catch (e) {}
  };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { провалът(); return false; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // ═══════════ 🩻 4.1.1 ЕХО-АЛБУМЪТ ═══════════
  // Първата снимка на детето. Досега нямаше къде да живее — стоеше в
  // папка „Снимки“ между касови бележки и скрийншоти.
  function echoCard() {
    // 🤍 22.07 (армия): пазачът на паузата. След загуба тази карта я
    //   канеше да въведе датата отново. Стои В картата, не в пакета —
    //   така важи откъдето и да я извикат. Нищо не се трие: записите ѝ
    //   стоят и картата се връща при „Пусни отново“ от настройките.
    if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return null;
    const c = card('Ехо-албумът 🩻 ' + sub('първите му снимки — с думите на лекаря'));
    // 🔴 11.08 капанът на снимката: прочетено при РИСУВАНЕ, записвано при клик.
    //    Пресен прочит при рисуване и преди запис; редът се търси по седмица+час.
    let st = load('bl_echo', []);
    const седмица = (() => {
      const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
      if (!lmp) return 20;
      const d = Math.floor((Date.now() - new Date(lmp).getTime()) / 86400000);
      return Math.max(4, Math.min(42, Math.floor(d / 7)));
    })();

    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    const wInp = el('input', 'jr-word'); wInp.type = 'number'; wInp.min = 4; wInp.max = 42; wInp.value = седмица; wInp.style.maxWidth = '86px';
    // ♿ 11.08 (клавиатура-четец): числото стоеше без име — четецът казваше само
    //    „поле за число" и не личеше, че се пита за седмицата.
    wInp.setAttribute('aria-label', 'Коя седмица е ехото');
    const note = el('input', 'jr-word'); note.placeholder = 'Какво видяхме? („маха с ръчичка“)'; note.maxLength = 90;
    // 🟠 25.08: тук се пишат ДУМИТЕ НА ЛЕКАРЯ от прегледа — най-скъпият текст в
    //    картата, защото се помни само първите минути. Полето живееше само
    //    докато стаята е отворена, а изборът на снимка минава през системния
    //    диалог (на телефон приложението може да бъде спряно междувременно).
    //    ПЪТ НАЗАД: махни двата реда и `save('bl_draft_echo', '')` при записа.
    note.dataset.draft = 'bl_draft_echo';
    note.value = load('bl_draft_echo', '');
    const btn = el('label', 'jr-btn', '🩻 Добави ехо-снимка');
    btn.appendChild(file);

    const grid = el('div', 'ec-grid');
    const рисувай = () => {
      st = load('bl_echo', []);   // пресен прочит при всяко рисуване
      grid.innerHTML = '';
      if (!st.length) {
        grid.appendChild(el('p', 'jr-privacy',
          'Първата снимка на детето ти е от ехографа. Тя заслужава по-добро място от папката с касови бележки. Добави я — с думите, които лекарят каза.'));
        return;
      }
      st.slice().sort((a, b) => (a.w || 0) - (b.w || 0)).forEach(x => {
        const i = st.indexOf(x);
        const f = el('figure', 'ec-item');
        // 🟡 12.08: бележката на мама минава през esc(), а адресът на снимката
        //    и седмицата влизаха сурови в атрибути. Едно правило за целия ред.
        if (!x || !x.img) return;   // 🔴 26.08 (ИЗМЕРЕНО): `[null]` гърмеше тук и гасеше ехографиите
        f.innerHTML = `<img src="${esc(x.img)}" alt="ехо на ${esc(String(x.w))} седмица" loading="lazy">
          <figcaption><strong>${esc(String(x.w))} с.</strong>${x.t ? '<span>' + esc(x.t) + '</span>' : ''}</figcaption>
          <button class="ec-del" type="button" aria-label="изтрий">✕</button>`;
        f.querySelector('.ec-del').addEventListener('click', () => {
          st = load('bl_echo', []);   // пресен прочит ПРЕДИ записа
          const k = st.findIndex(y => y && y.w === x.w && y.d === x.d && y.t === x.t);
          st.splice(k > -1 ? k : i, 1);
          if (!save('bl_echo', st)) { рисувай(); return; }   // 🔴 25.08: снимката НЕ е изтрита
          рисувай();
        });
        grid.appendChild(f);
      });
    };
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f || !window.BL_EXPR) return;
      BL_EXPR.shrinkImage(f, 420, url => {
        st = load('bl_echo', []);   // пресен прочит ПРЕДИ записа
        st.push({ img: url, w: parseInt(wInp.value) || седмица, t: note.value.trim().slice(0, 90), d: today() });
        if (!save('bl_echo', st)) { st.pop(); fx().cheer('Паметта се напълни. 😕'); return; }
        note.value = ''; save('bl_draft_echo', '');   // черновата си отива със записаната снимка
        fx().buzz(12); fx().confetti(); рисувай();
      });
    });
    const ред = el('div', 'jr-addrow');
    ред.appendChild(wInp); ред.appendChild(note);
    c.appendChild(ред); c.appendChild(btn); c.appendChild(grid); рисувай();
    if (st.length >= 2) {
      c.appendChild(el('p', 'jr-privacy', st.length + ' снимки от чакането. След години те ще са първата глава от историята му.'));
    }
    return c;
  }

  // ═══════════ 📊 4.6.11 УМЕНИЯТА: ДИАПАЗОНИ, НЕ ДАТИ ═══════════
  // Планът беше ясен: „Без тревога: диапазони, не дати.“ Затова НИКЪДЕ
  // няма „изостава“, „би трябвало“, „нормата е“. Има само „обикновено
  // между X и Y“ — и колко широко е нормалното.
  // 🔴 05.08 (одит г11, №350): кофата на Дървото се избираше по ЧИСЛО — най-
  //    близката ≤ въведения месец — затова „Свързва 2 думи" палеше кофа с ЧУЖД
  //    текст („10–25 думи"). Сега всеки ред носи собствения си честен id (`ms`).
  //    Няма ли откровено съвпадение в D.milestones — `ms: null`, не палим нищо.
  const ДИАПАЗОНИ = [
    { id: 'smile', e: '😊', н: 'Социална усмивка', от: 1.5, до: 3, тип: 'social', ms: '2_social' },
    { id: 'head', e: '🙋', н: 'Държи главата стабилно', от: 2, до: 4, тип: 'motor', ms: '4_motor' },
    { id: 'roll', e: '🔄', н: 'Обръща се', от: 4, до: 7, тип: 'motor', ms: null },
    { id: 'sit', e: '🪑', н: 'Сяда сам', от: 6, до: 9, тип: 'motor', ms: '8_motor' },
    { id: 'crawl', e: '🐛', н: 'Пълзи', от: 6, до: 11, тип: 'motor', ms: null },
    { id: 'pincer', e: '🤏', н: 'Хватка с два пръста', от: 8, до: 11, тип: 'fine', ms: '8_fine' },
    { id: 'stand', e: '🧍', н: 'Изправя се на мебели', от: 8, до: 12, тип: 'motor', ms: '10_motor' },
    { id: 'word', e: '🗣️', н: 'Първа дума със смисъл', от: 10, до: 15, тип: 'speech', ms: '10_speech' },
    { id: 'walk', e: '👣', н: 'Проходва', от: 9, до: 18, тип: 'motor', ms: '15_motor' },
    { id: 'spoon', e: '🥄', н: 'Яде с лъжица сам', от: 13, до: 20, тип: 'fine', ms: null },
    // 🔴 05.08 (одит г11, №58): краят беше 26 м. — число, което не се среща
    //    никъде другаде. „Кога да се допитам 🩺" (rooms7.js) и milestoneFlags
    //    (data.js) говорят за 2 години. Стаята вече не си противоречи.
    { id: 'two', e: '💬', н: 'Свързва 2 думи', от: 18, до: 24, тип: 'speech', ms: '24_speech' }
  ];
  function rangesCard() {
    const c = card('Кога „обикновено“ 📊 ' + sub('диапазони, не дати — нормалното е ШИРОКО'));
    const baby = load('bl_baby', {});
    const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
    const мес = a ? (a.devMonths != null ? a.devMonths : a.months) : null;
    // 🔴 11.08 капанът на снимката: прочетено при РИСУВАНЕ, записвано при клик.
    //    Пресен прочит при рисуване и точно преди всеки запис.
    let мои = load('bl_ranges', {});

    c.appendChild(el('p', 'jr-privacy',
      'Всяка лента показва <strong>между кога и кога</strong> обикновено идва умението. Не „кога трябва“. Погледни колко е широка — това е свободата на детето ти.'));

    const box = el('div', 'rg-list');
    const легенда = el('p', 'rg-leg');
    const равносметка = el('p', 'rg-verd');
    c.appendChild(box); c.appendChild(легенда); c.appendChild(равносметка);
    c.appendChild(el('p', 'lb-kind',
      '💚 Ако нещо е извън лентата — това НЕ е диагноза. Децата не четат таблици. Просто го спомени на педиатъра при следващия преглед; той вижда цялото дете, не един ред.'));

    // 🔴 05.08 (одит г11, №347): при всяко отбелязване се подменяше ЦЯЛАТА карта
    //    (`c.replaceWith(rangesCard())`). Новата беше гола section.jr-card — без
    //    data-blkey, без 📍, без сгъване, без име за екранен четец, защото
    //    decorate() от polish.js минава само веднъж, при отваряне на стаята.
    //    Сега пререждаме само списъка, легендата и реда с равносметката.
    function рисувай() {
      мои = load('bl_ranges', {});   // пресен прочит при всяко рисуване
      box.innerHTML = '';
      let имаСега = false;
      ДИАПАЗОНИ.forEach(д => {
      const r = el('div', 'rg-row');
      const МАКС = 26;
      const л = Math.round(д.от / МАКС * 100), ш = Math.round((д.до - д.от) / МАКС * 100);
      const моя = мои[д.id];
      const маркер = моя != null ? `<span class="rg-mine" style="left:${Math.min(98, Math.round(моя / МАКС * 100))}%" title="при вас: ${моя} м."></span>` : '';
      // 🔴 05.08 (одит г11, №60 и №157): точката „сега" се рисуваше на ВСЕКИ ред
      //    без ръчен запис — при по-голямо дете тя падаше ВДЯСНО от почти всяка
      //    лента и празното поле се четеше като „късно, късно, късно". Рисуваме
      //    я само докато прозорецът още не е минал. `моя == null` вместо `!моя`
      //    пази и честния запис „0 м.", който дотогава минаваше за липсващ.
      const покажиСега = (мес != null && моя == null && мес <= д.до);
      if (покажиСега) имаСега = true;
      const сега = покажиСега ? `<span class="rg-now" style="left:${Math.min(98, Math.round(мес / МАКС * 100))}%" title="сега: ${Math.round(мес)} м."></span>` : '';
      r.innerHTML = `<span class="rg-e">${д.e}</span>
        <div class="rg-mid"><p class="rg-n">${esc(д.н)} <small>обикновено ${д.от}-${д.до} м.</small></p>
        <div class="rg-bar"><span class="rg-fill" style="left:${л}%;width:${ш}%"></span>${маркер}${сега}</div></div>
        <button class="rg-mark" type="button" title="отбележи кога стана" aria-label="${моя != null ? 'Махни отметката: ' : 'Отбележи кога стана: '}${esc(д.н)}" aria-pressed="${моя != null}">${моя != null ? '✔' : '+'}</button>`;
      r.querySelector('.rg-mark').addEventListener('click', () => {
        мои = load('bl_ranges', {});   // пресен прочит ПРЕДИ записа
        if (мои[д.id] != null) {
          delete мои[д.id];
          // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): „Дървото прибра цветчето 🌱“ се
          //    казваше и когато махането не е записано — умението, което си
          //    оттеглила, се връщаше при следващото отваряне.
          if (!save('bl_ranges', мои)) { рисувай(); return; }
          // 🔴 г07/59 (огледално на dev.js:209): отбелязването пали цветчето в
          //    bl_ms_done и датата в bl_ms_d, но махането чистеше САМО
          //    bl_ranges. Дървото, Витрината, Реката и хапчето на банера
          //    продължаваха да броят умение, което си оттеглила — завинаги и
          //    без начин да го махнеш оттук. Прибираме и тях.
          let прибрано = false;
          try {
            if (д.ms) {
              const dn = load('bl_ms_done', {});
              const md = load('bl_ms_d', {});
              if (dn[д.ms] || md[д.ms] != null) прибрано = true;
              delete dn[д.ms]; delete md[д.ms];
              save('bl_ms_done', dn); save('bl_ms_d', md);
              // същото известие като при палене — иначе Дървото и витрината
              // остават нарисувани със стария си вид
              document.dispatchEvent(new CustomEvent('bl:ms-changed'));
            }
          } catch (e) {}
          // казваме го веднъж и на глас: цветче не изчезва мълчаливо
          if (прибрано) fx().cheer('Дървото прибра цветчето 🌱');
          рисувай(); return;
        }
        // проход 3 T30: инлайн поле вместо студен native prompt() (ui.js:4 обяснява защо).
        const mid = r.querySelector('.rg-mid');
        const стар = mid.querySelector('.rg-inline');
        if (стар) { стар.remove(); return; }                       // втори тап на „+" затваря
        const ред = el('div', 'rg-inline jr-addrow');
        const п = el('input', 'jr-word'); п.type = 'number'; п.min = 0; п.max = 48; п.step = 0.5; п.inputMode = 'decimal';
        п.style.maxWidth = '86px'; п.value = мес != null ? String(Math.round(мес)) : ''; п.setAttribute('aria-label', 'на колко месеца');
        const ок = el('button', 'jr-chip', '✔'); ок.type = 'button'; ок.setAttribute('aria-label', 'запази');
        // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): написах „999“ и натиснах ✔.
        //    bl_ranges остана празно, полето задържа 999, на екрана не се смени
        //    НИЩО — единственият отговор беше вибрация, а тя е изключена на
        //    много телефони и я няма на таблет. Мама натиска трети, четвърти път
        //    и решава, че картата е счупена. Бутон без видим отговор няма.
        //    ПЪТ НАЗАД: махни `грешка` и върни голото `fx().buzz(8); return;`.
        const грешка = el('p', 'jr-privacy'); грешка.hidden = true;
        грешка.setAttribute('role', 'status'); грешка.setAttribute('aria-live', 'polite');
        грешка.style.margin = '4px 0 0';
        const кажи = т => {
          грешка.textContent = т; грешка.hidden = false;
          грешка.style.color = 'var(--pink-deep, #e56ba4)';
          clearTimeout(кажи._t); кажи._t = setTimeout(() => { грешка.hidden = true; }, 4500);
        };
        const запиши = () => {
          const n = parseFloat(п.value);
          if (isNaN(n)) { кажи('Напиши на колко месеца стана — само число.'); fx().buzz(8); п.focus(); return; }
          if (n < 0 || n > 48) { кажи('Числото е в месеци — между 0 и 48. „' + String(п.value).slice(0, 8) + '“ не мога да го сложа на лентата.'); fx().buzz(8); п.select(); п.focus(); return; }
          прибери(n);
        };
        ок.addEventListener('click', запиши);
        п.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); запиши(); } else if (e.key === 'Escape') ред.remove(); });
        ред.appendChild(п); ред.appendChild(ок);
        mid.appendChild(ред); mid.appendChild(грешка); п.focus(); п.select();
      });
      // прибирането (същата логика като преди — само входът е инлайн вече)
      function прибери(n) {
        мои = load('bl_ranges', {});   // пресен прочит ПРЕДИ записа
        мои[д.id] = Math.round(n * 10) / 10;
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): конфетите и „🚶 Първи стъпки!“
        //    идваха, дори когато месецът не е влязъл в паметта — маркерът на
        //    лентата изчезваше при следващото влизане, а тя вече е празнувала.
        if (!save('bl_ranges', мои)) { рисувай(); return; }
        // 🌳 мостът към Дървото/Витрината (одит-флот П23, проход 2 №8):
        // bl_ranges беше изолирано — отбелязваш умение, а Дървото не цъфти.
        // 🔴 05.08 (одит г11, №350 и №180): кофата се избираше по число, затова
        // палеше ред с ЧУЖД текст, а конфетите хвърчаха дори когато не се палеше
        // нищо. Сега палим САМО собствения id на реда (`д.ms`) и празнуваме само
        // ако наистина е разцъфнало ново цветче.
        let разцъфна = false;
        try {
          if (д.ms) {
            const dn = load('bl_ms_done', {});
            if (!dn[д.ms]) {
              dn[д.ms] = true; save('bl_ms_done', dn);
              const md = load('bl_ms_d', {});
              if (!md[д.ms]) { md[д.ms] = Date.now(); save('bl_ms_d', md); }
              разцъфна = true;
            }
          }
        } catch (e) {}
        if (разцъфна) fx().confetti();
        fx().cheer(д.e + ' ' + д.н + '!');
        // за картите, които четат bl_ms_done (Дървото, витрината) — да знаят
        try { document.dispatchEvent(new CustomEvent('bl:ms-changed')); } catch (e) {}
        рисувай();
      }
      box.appendChild(r);
      });
      легенда.innerHTML = '<span class="rg-fill rg-legbit"></span> обикновено · <span class="rg-mine rg-legbit"></span> при вас' +
        (имаСега ? ' · <span class="rg-now rg-legbit"></span> сега' : '');
      const броени = Object.keys(мои).length;
      равносметка.innerHTML = броени
        ? `Отбелязала си <strong>${броени}</strong> ${броени === 1 ? 'умение' : 'умения'}. Всяко е дошло, когато е било готово.`
        : '';
      равносметка.hidden = !броени;
    }
    рисувай();
    return c;
  }

  // ═══════════ 🗣️ 4.6.4 ДВУЕЗИЧНОТО ДЕТЕ ═══════════
  const ДВУЕЗИЧНО = [
    ['🧠', 'Не бърка езиците — сортира ги', 'Смесването на думи в едно изречение („искам water“) НЕ е объркване. То се казва code-switching и го правят и възрастните двуезични. Мозъкът избира думата, която му идва първа.'],
    ['⏳', 'Може да проговори по-късно — и това е ок', 'Някои двуезични деца казват първите думи малко по-късно. Броят се думите от ДВАТА езика заедно, не поотделно. 5 български + 5 английски = 10 думи, не „изостава“.'],
    // 🟠 11.08 (обиколка „приемането за дадено“): двата модела бяха написани за
    //    двама родители („мама говори единия, ТАТИ другия“, „и двамата родители“).
    //    Моделът иска двама ГОВОРЕЩИ, не двама родители — баба, вуйчо, детегледачка
    //    и градината вършат същата работа. Казваме го така, за да не остане жена,
    //    която е сама, с чувството, че този път не е за нея.
    ['👤', 'Един човек — един език', 'Най-работещият модел: ти говориш единия език, а друг близък възрастен (тати, баба, детегледачка) — другия, последователно. Детето свързва езика с човек, не със ситуация.'],
    ['🏠', 'Или: у дома единия, навън другия', 'Другият работещ модел, ако вкъщи се говори един език, а средата навън е на друг. Върши работа и когато вкъщи си само ти.'],
    // 🟠 11.08 (обиколка): тук пишеше „книжки, видео, роднини, игри“ — а две
    //    карти по-надолу в СЪЩАТА стая пише „до 2 години екранът не учи бебето
    //    на нищо“ и трета брои екранното време. Стаята си противоречеше.
    //    Живата видеовръзка е изключението и си остава; записаното видео — не.
    ['💪', 'Слабият език иска повече', 'Езикът, който детето чува по-малко, има нужда от повече часове — книжки, песни, игри, жив разговор. (Видеовръзка с роднини също върши работа; записаното видео под 2 г. — не.) Иначе тихо избледнява.'],
    ['❤️', 'Езикът на чувствата', 'На езика, на който му пееш и го утешаваш, детето ще мисли емоционално цял живот. Затова говори на своя — дори да си в чужбина.'],
    ['🚫', 'Митът, който вреди', 'Няма доказателство, че двуезичието причинява говорни проблеми. Ако лекар/учител ти каже „спрете единия език“ — потърси второ мнение от логопед, работил с двуезични.']
  ];
  function bilingualCard() {
    const c = card('Двуезичното дете 🗣️ ' + sub('какво работи · какво е мит'));
    const box = el('div', 'bl-list');
    ДВУЕЗИЧНО.forEach(([e, т, о]) => {
      const d = el('details', 'cm-row');
      d.innerHTML = `<summary>${e} ${esc(т)}</summary><p>${esc(о)}</p>`;
      box.appendChild(d);
    });
    c.appendChild(box);
    c.appendChild(el('p', 'lb-kind',
      '💚 Ако към 2 г. детето не свързва думи на НИТО един език (не общо, а на нито един) — това вече е за логопед. Дотогава: говори, чети, пей. На твоя език.'));
    return c;
  }

  // ═══════════ 🕐 4.2.9 ТИПИЧНИЯТ ТИ ДЕН ═══════════
  // Не „както пише в книгата“ — а както е при ВАС, от записаното.
  function typicalDayCard() {
    const c = card('Типичният ви ден 🕐 ' + sub('сглобен от вашите данни, не от книга'));
    const сън = load('bl_sleep_hist', {});
    const пелени = load('bl_diapers', {});
    // 05.08 (одит г06, №160): четеше САМО кърмене-таймера, а бързите чипове в
    // „Кога яде за последно?“ пишат в bl_feed + bl_feedlog. „Типичният ви ден“
    // мълчеше за храненията при мама, която ползва най-бързото нещо в стаята.
    // Сливаме изворите с дедуп на близнаци под 60 сек (както rooms2.js:339);
    // масивът вече е от ГОЛИ времена, затова редът долу мапва направо тях.
    const храна = [...load('bl_nursing', []).map(x => x && (x.ts || x.t)), ...load('bl_feedlog', [])]
      .filter(Boolean).sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > 60000);
    const ck = load('bl_checkins', {});
    const нощи = Object.keys(сън).length;
    const редове = [];

    // 🔴 26.08 (ИЗМЕРЕНО): стойности-текстове в bl_sleep_hist даваха
    //    „спи NaN ч NaN мин средно на нощ" — число, каквото няма.
    const минути = Object.values(сън).filter(v => typeof v === 'number' && isFinite(v) && v >= 0);
    if (минути.length >= 3) {
      const нощи = минути.length;
      const ср = Math.round(минути.reduce((a, b) => a + b, 0) / нощи);
      редове.push(['😴', 'спи', Math.floor(ср / 60) + ' ч ' + (ср % 60) + ' мин', 'средно на нощ, от ' + нощи + ' измерени']);
    }
    // ⚠️ картата „Пелени днес“ създава {wet:0,dirty:0} при ВСЯКО отваряне на
    // стаята — дни, в които мама само е погледнала, стоят като нули. Ако ги
    // броим, средното лъже надолу. Затова: само дни с реален запис.
    // 🟡 11.08 (обиколка във времето): същият капан като rooms10.js — ден-ключ с
    //    БЪДЕЩА дата (сверяващ се телефонен часовник) влизаше в средното на
    //    „типичния ви ден“. Не се трие нищо: денят се брои, щом настъпи.
    //    ПЪТ НАЗАД: махни `&& d <= днесП`.
    const днесП = today();
    const дниП = Object.keys(пелени).filter(d => { const x = пелени[d] || {}; return (+x.wet || 0) + (+x.dirty || 0) > 0 && d <= днесП; });
    if (дниП.length >= 3) {
      const общо = дниП.reduce((s, d) => { const x = пелени[d] || {}; return s + (+x.wet || 0) + (+x.dirty || 0); }, 0);
      редове.push(['💧', 'пелени', Math.round(общо / дниП.length) + ' бр.', 'средно на ден, от ' + дниП.length + ' записани дни']);
    }
    if (храна.length >= 5) {
      // хранения на ден = брой записи / брой различни дни
      const дни = new Set(храна.map(ts => localDate(new Date(ts)))).size;
      // 🟡 12.08 (единиците): пет хранения в ЕДИН ден даваха „5 пъти · средно на
      //    ден, от 1 дни“ — и числото, и думата бяха верни поотделно, но заедно
      //    не се четат. Същият случай и когато средното излезе точно 1.
      const бр = (n, ед, мн) => window.BL_BROI ? BL_BROI(n, ед, мн) : n + ' ' + (n === 1 ? ед : мн);
      if (дни) редове.push(['🤱', 'хранения', бр(Math.round(храна.length / дни), 'път', 'пъти'), 'средно на ден, от ' + бр(дни, 'ден', 'дни')]);
    }
    const дниЧ = Object.keys(ck).filter(d => ck[d] && typeof ck[d].m === 'number');
    if (дниЧ.length >= 3) {
      const ср = дниЧ.reduce((s, d) => s + ck[d].m, 0) / дниЧ.length;
      редове.push(['💜', 'ти', ['😩', '😔', '😐', '🙂', '🥰'][Math.round(ср)], 'средното ти настроение, от ' + дниЧ.length + ' дни']);
    }

    if (!редове.length) {
      c.appendChild(el('p', 'jr-privacy',
        'Тук ще се сглоби ВАШИЯТ ден — не този от книгите. Пълни се сам от брояча на съня, пелените, храненията и минутката за теб. Трябват само няколко дни.'));
      return c;
    }
    const box = el('div', 'td-list');
    редове.forEach(([e, к, v, п]) => {
      const r = el('div', 'tp-row');
      r.innerHTML = `<span class="tp-e">${e}</span><span class="tp-k">${esc(к)}</span>
        <span class="tp-v">${esc(v)}</span><span class="tp-n">${esc(п)}</span>`;
      box.appendChild(r);
    });
    c.appendChild(box);
    c.appendChild(el('p', 'jr-privacy',
      'Това е вашият ритъм. Ако не прилича на нечий друг — това не значи, че е грешен. Значи, че е ваш.'));
    return c;
  }

  // ═══════════ 🌳 4.6.10 ДЪРВОТО: ПЕЧАТАЕМО ═══════════
  function надградиДървото(root) {
    const карта = [...root.querySelectorAll('.jr-card:not(.toc-card)')].find(c => {
      const t = c.querySelector('.jr-title'); return t && /Дървото на уменията/.test(t.textContent);
    });
    if (!карта || карта.querySelector('.st-print')) return;
    const b = el('button', 'jr-chip st-print', '🖨️ Отпечатай дървото'); b.type = 'button';
    b.addEventListener('click', () => {
      if (!window.BL_EXPR || !BL_EXPR.printOverlay) return;
      const svg = карта.querySelector('svg');
      const baby = load('bl_baby', {});
      const done = load('bl_ms_done', {});
      const ids = Object.keys(done).filter(k => done[k]);
      const D = window.BL_DATA || {};
      const списък = ids.map(id => {
        const [м, тип] = id.split('_');
        const ms = (D.milestones || []).find(x => String(x.m) === м);
        return ms && ms[тип] ? { м: +м, т: ms[тип] } : null;
      }).filter(Boolean).sort((a, b2) => a.м - b2.м);
      BL_EXPR.printOverlay('Дървото на ' + (esc(baby.name) || 'нашето бебе'),
        (svg ? `<div class="pr-tree">${svg.outerHTML}</div>` : '') +
        (списък.length
          ? `<ul class="pr-list">${списък.map(x => `<li><strong>~${x.м} м.</strong> — ${esc(x.т)}</li>`).join('')}</ul>`
          : '<p class="pr-note">Дървото още чака първия си цвят.</p>') +
        `<p class="pr-note">Всеки цвят е умение, което се появи само — когато детето беше готово.</p>`);
    });
    карта.appendChild(b);
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Бременност': root => { const к = echoCard(); if (к) root.appendChild(к); },
    'Развитие и игри': root => {
      root.appendChild(rangesCard());
      root.appendChild(bilingualCard());
      надградиДървото(root);
    },
    'Моето бебе': root => { root.appendChild(typicalDayCard()); }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
