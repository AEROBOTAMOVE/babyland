// ═══════════════════════════════════════════════════════════
// СТАИТЕ — инструменти (Етап 1а/1б): Моето бебе, Бременност,
// Захранване, Развитие и игри, Инструменти. Всичко локално.
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const D = window.BL_DATA;
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // 🔴 25.08 (ИЗМЕРЕНО с dev/interaktivno_stai2.js, 90 случая в 5 стаи):
  //    `catch (e) {}` гълташе QuotaExceededError и връщаше undefined. При пълна
  //    памет мама виждаше „✔ Запазено“, полето ѝ се изчистваше — и написаното
  //    изчезваше ДВА ПЪТИ: веднъж от екрана, веднъж от паметта. Никой не можеше
  //    да провери записа, защото нямаше какво да се провери.
  //    rooms17.js и rooms18.js вече връщат истина/лъжа; тук — също.
  //    ПЪТ НАЗАД: махаш `return true` / `return false` — старите повиквания не
  //    четат отговора и продължават да работят точно както преди.
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
  // 🤫 25.08: ТРИ записа в този файл са чисто счетоводство — не носят нищо,
  //    писано от мама, и падането им НЕ ѝ отнема нищо видимо:
  //      bl_backup_last  — датата на последното копие (файлът вече е свален;
  //                        не се ли запише, напомнянето просто пита пак = безопасно)
  //      bl_cheer_day    — „конфетите вече паднаха днес“ (най-много втори път)
  //      bl_baby_stage   — аватарът да подскочи веднъж на нов етап
  //    Ако и те вдигат модала, мама получава „това НЕ се записа“ веднага след
  //    вярното „Изпратено към Изтегляния 💜“ — и почва да не вярва и на
  //    истинското предупреждение. Тук мълчим НАРОЧНО.
  //    ⚠️ Не местѝ друг запис тук: правилото е „нищо на мама не е заложено“.
  const saveТихо = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  // тихият честен ред „не можах да го запазя“ — един текст за целия файл
  const ПЪЛНА = '🤍 Паметта на телефона е пълна — не можах да го запазя. Изтрий нещо (снимки, видеа) и пробвай пак; написаното е още в полето.';
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  // 🕛 19.08 (ИЗМЕРЕНО): възрастта се смяташе по ЧАСОВЕ, а се показва в ДНИ.
  //    „2026-01-31“ се разчита като полунощ по Гринуич = 02:00 у нас — тоест
  //    всяко бебе се раждаше „в 2 през нощта“. В 00:30 разликата е с два часа
  //    по-къса от цял ден и екранът сваляше по един ден („27 дни“ в 00:30,
  //    „28 дни“ в 9:00 — СЪЩИЯ ден). Същите два часа връщат и „датата е в
  //    бъдещето“ на майка, въвела ДНЕШНА рождена дата малко след полунощ,
  //    а при смяна на лятното/зимното време местят и месечнината.
  //    Затова датите тук се свеждат до ЛОКАЛНА ПОЛУНОЩ и се сравняват като
  //    календарни дни. ПЪТ НАЗАД: където се вика денНула(x) — просто new Date(x).
  const денНула = v => {
    if (v instanceof Date) return isNaN(v) ? v : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    const m = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);   // локална полунощ, без засечката с UTC
    const x = new Date(v);
    return isNaN(x) ? x : new Date(x.getFullYear(), x.getMonth(), x.getDate());
  };
  const дниМежду = (a, b) => Math.round((b - a) / 86400000);   // цели дни, не часове
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
  const card = (titleHtml) => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', titleHtml)); return c; };
  // ⚠️ 22.07 (армия): този файл викаше fx() на два реда (десетото ритниче и
  //   пърхането), но НИКОГА не го е дефинирал — 'use strict' → ReferenceError,
  //   който прекъсваше обработчика точно на празничния момент. Всеки друг
  //   модул си има този хелпър локално; тук просто липсваше.
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // ── Споделен профил на бебето ──
  function getBaby() {
      // 🔴 04.08: подразбирането беше 'girl' → момчетата се мереха по
      //    ЖЕНСКИТЕ криви на СЗО, а бутонът 👧 светеше като избран, така
      //    че мама нямаше как да разбере, че приложението е решило вместо
      //    нея. Сега празно = още не е казано и картата пита.
      return load('bl_baby', { name: '', sex: '', birth: '' });
    }
  // ═══ 🤰→👶 РАЖДАНЕТО ГАСИ БРЕМЕННОСТТА (19.08, ИЗМЕРЕНО) ═══
  //
  // Измерено живо: майка с ЕДНОДНЕВНО бебе отваряше „Бременност“ и виждаше
  // 24 бременни карти и „Седмица 39“ — брояч на ритания, брояч на контракции,
  // чанта за родилния дом. Двете състояния живееха едно до друго, защото
  // bl_baby.birth и bl_lmp не се знаеха. Онбордингът и preg20 („роди се“)
  // отдавна гасят броенето; влезе ли рождената дата през „Моето бебе“ — не.
  //
  // Правилото НЕ е „има бебе → няма бременност“. Майка с двегодишно дете
  // може да чака второ и това броене е нейно. Правилото е по РЕДА:
  //     бременност, започнала ПРЕДИ раждането, е приключила С НЕГО.
  // По-късно начало = нова бременност и си остава непокътната.
  //
  // ⚠️ Паузата след загуба е ДРУГО състояние. Жена, загубила бебе, НЯМА
  //    рождена дата — предикатът долу връща false и нищо не я докосва.
  //    Затова се пита bl_baby.birth, а не „спряло ли е броенето“.
  //
  // ПЪТ НАЗАД: датата не се изхвърля — преписва се в bl_lmp_rodeno преди
  // да бъде махната, за да може да се върне на ръка.
  function бременносттаЕПриключена() {
    const l = (window.BL_EXPECT && BL_EXPECT.lmp) ? BL_EXPECT.lmp()
                                                  : String(load('bl_lmp', '') || '');
    if (!l) return false;
    const н = денНула(l);
    // 🍼 19.08: питаше САМО bl_baby. Но второто дете се записва в bl_baby2
    //   („Двойна прегръдка“, js/baby2.js) — тоест майка с голямо дете в
    //   bl_baby, бременна отново, вписваше новороденото във ВТОРИЯ ключ и
    //   броенето не гаснеше НИКОГА: държеше бебе на ръце и четеше „39-та
    //   седмица“. Взима се НАЙ-КЪСНАТА от двете дати; по-старото дете просто
    //   е под н и не пречи на сметката за втора бременност.
    const дати = ['bl_baby', 'bl_baby2']
      .map(k => денНула(((load(k, {}) || {}).birth) || ''))
      .filter(d => !isNaN(d));
    const b = дати.length ? new Date(Math.max.apply(null, дати)) : NaN;
    if (isNaN(н) || isNaN(b)) return false;
    if (b > денНула(new Date())) return false;   // дата в бъдещето не е раждане
    return b >= н;                               // родила СЛЕД началото на това броене
  }

  function гасиБременносттаПриРаждане() {
    if (!бременносттаЕПриключена()) return false;
    try {
      const стара = localStorage.getItem('bl_lmp');
      if (стара) localStorage.setItem('bl_lmp_rodeno', стара);   // пътят назад
      localStorage.removeItem('bl_lmp');
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('bl:expect')); } catch (e) {}
    return true;
  }

  // веднъж при зареждане — за майките, при които двете състояния вече
  // съжителстват (rooms2.js върви преди стаите и началния екран)
  гасиБременносттаПриРаждане();

  // ═══ М1 (одит 11): КОРИГИРАНАТА ВЪЗРАСТ ═══
  //
  // Бебе, родено на 32-ра седмица, е дошло 8 седмици по-рано. На 4 месеца
  // календарно то е на 2 месеца коригирано — и се учи като двумесечно.
  // Досега мерехме по рождената дата и всеки ден казвахме на майката на
  // недоносено дете, че то „изостава“. Тя вече е най-уплашената от всички.
  //
  // Правилото: коригира се до 2 години, после спира (така е и при лекарите).
  // Коригираме РАЗВИТИЕТО и РАСТЕЖА — но не и рождения ден: той си е негов.
  function pretermWeeks() {
    const w = +load('bl_preterm', 0);
    return (w >= 24 && w <= 36) ? w : 0;      // под 24 и над 36 не коригираме
  }

  // 🕰️ 01.09 (ВЪЛНА 1.1 — УРЕДИТЕ): „днес“ се четеше ОТВЪТРЕ (new Date()) и
  //    затова НИТО ЕДИН уред не можеше да изпита високосната година, краищата
  //    на месеците, прехода през нова година или часовата зона — а от тази
  //    сметка зависят 39 места плюс коригираната възраст на недоносените.
  //    Вторият довод е НЕЗАДЪЛЖИТЕЛЕН. Не се ли подаде, е точно new Date() —
  //    тоест живото приложение смята СЪЩОТО, което смяташе и вчера.
  //    Изпитът е dev/test_vazrast.js (и той сам се саботира, за да докаже,
  //    че вижда: подаде ли се „днес“, а сметката гледа истинския часовник,
  //    изпитът пада).
  //    ПЪТ НАЗАД: махаш втория довод и връщаш `денНула(new Date())`.
  function ageFromBirth(birth, днес) {
    if (!birth) return null;
    const b = денНула(birth);
    const now = денНула(днес === undefined || днес === null || днес === '' ? new Date() : днес);
    if (isNaN(b) || isNaN(now) || b > now) return null;
    const totalDays = дниМежду(b, now);
    const months = totalDays / 30.4375;
    let ym = now.getFullYear() * 12 + now.getMonth() - (b.getFullYear() * 12 + b.getMonth());
    // 🔴 19.08 (ИЗМЕРЕНО, 153 сблъсъка): броят месеци се сваляше по ГОЛИЯ ден
    //    от календара (`now.getDate() < b.getDate()`), а месечнината в банера
    //    се празнува по КЛАМПНАТАТА дата (BL_DATE.addMonths). За бебе, родено
    //    на 31-ви, двете се разминаваха във всеки къс месец: на 28.02 екранът
    //    пишеше „Мира е на 28 дни“ и точно под него „🎉 Днес Мира празнува
    //    1-месечнина“. Един екран, две възрасти — и майката вярва на едното.
    //    Сега месеците се броят със СЪЩОТО клампване, което празнува банерът.
    //    ПЪТ НАЗАД: `if (now.getDate() < b.getDate()) ym--;`
    const наДен = д => window.BL_DATE
      ? BL_DATE.addMonths(b, д)
      : (function () {
          const край = new Date(b.getFullYear(), b.getMonth() + д + 1, 0).getDate();
          return new Date(b.getFullYear(), b.getMonth() + д, Math.min(b.getDate(), край));
        })();
    if (наДен(ym) > now) ym--;
    if (ym < 0) ym = 0;
    // 🚨 22.07 (армия, RED): котвата преливаше. `new Date(2026, 1, 31)` НЕ се
    //   клампва — става 3 март. За бебе, родено на 31-во число, разликата
    //   ставаше ОТРИЦАТЕЛНА и мама четеше „1 месец и -2 дни“ — на началния
    //   екран, в бележката за прегледа и в картичката за бабата. Проектът си
    //   има готовото клампване (BL_DATE.addMonths), само че тук не се ползваше.
    const котва = наДен(ym);
    const days = Math.max(0, дниМежду(котва, now));
    const a = { months, totalDays, ym, days,
      // „мес“ + „а“ правеше „4 меса“. Правилното е месец / месеца.
      // (19.08: и „1 дни“ на първия ден — числото и думата до него трябва да си
      //  пасват, точно както по-долу при „и 1 ден“.)
      text: ym < 1 ? `${totalDays} ${totalDays === 1 ? 'ден' : 'дни'}` : `${ym} ${ym === 1 ? 'месец' : 'месеца'}${days ? ' и ' + days + (days === 1 ? ' ден' : ' дни') : ''}` };

    const pw = pretermWeeks();
    a.preterm = pw || 0;
    if (pw && totalDays < 730) {                       // коригира се до 2 години
      const назад = (40 - pw) * 7;                     // колко дни по-рано е дошло
      const cd = Math.max(0, totalDays - назад);
      const cm = cd / 30.4375;
      a.corr = { totalDays: cd, months: cm, ym: Math.floor(cm),
        text: cm < 1 ? `${cd} ${cd === 1 ? 'ден' : 'дни'}` : `${Math.floor(cm)} ${Math.floor(cm) === 1 ? 'месец' : 'месеца'}` };
      a.devMonths = cm;                                // по това се мери РАЗВИТИЕТО
      a.note = `на ${a.text} · <strong>${a.corr.text} коригирани</strong> — мерим по тях`;
    } else {
      a.corr = null;
      a.devMonths = months;
      a.note = '';
    }
    return a;
  }

  // ═══════════════ 🍼 МОЕТО БЕБЕ (Мира) ═══════════════

  function renderBaby(root) {
    const baby = getBaby();

    // 🔴 11.08 (обиколка по картите, ИЗМЕРЕНО): „Денят на един кръг“ по-долу
    //    казва с думи „отбележи хранене или сън ГОРЕ и денят ще се появи тук“ —
    //    и не се появяваше. Кръгът се прерисуваше само на минутния тик: мама
    //    натиска 🍼 Ляво, поглежда две карти по-долу и чете, че още няма нищо за
    //    днес. Обещание, което картата сама си чупи. Сега трите бутона, които
    //    пишат в деня (хранене, отмяна на хранене, сън), го бутват веднага.
    //    Викането е през тази обвивка нарочно: рисувайЧасовник е по-надолу и си
    //    има свои елементи — при най-ранните извиквания (по време на строежа)
    //    тях още ги няма, затова try/catch и никога не се вика от рисуване.
    const тикЧасовник = () => { try { рисувайЧасовник(); } catch (e) {} };

    // 1. Профил
    const c1 = card('Профилът на бебето <span class="jr-sub">попълни веднъж — всичко се настройва само</span>');
    const nameI = el('input', 'jr-word'); nameI.placeholder = 'Име (по желание)…'; nameI.value = baby.name;
    // ✂️ 11.08: полето беше без таван, а preg20 пише същия ключ с .slice(0,24).
    //    Дълго „име“ (залепен текст от друго място) минаваше през поздрава на
    //    „Днес“, картичките и заглавията на стаите.
    nameI.maxLength = 24;
    nameI.setAttribute('aria-label', 'Име на бебето — по желание');
    c1.appendChild(nameI);
    const sexRow = el('div', 'bb-sex');
    [['girl', '👧 Момиче'], ['boy', '👦 Момче']].forEach(([v, lbl]) => {
      const b = el('button', 'bb-sexbtn' + (baby.sex && baby.sex === v ? ' on' : ''), lbl);
      b.type = 'button';
      b.style.minHeight = '44px';   // 📱 измерено 40px — под минимума за пръст
      b.setAttribute('aria-pressed', baby.sex === v ? 'true' : 'false');
      b.addEventListener('click', () => {
        sexRow.querySelectorAll('.bb-sexbtn').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        baby.sex = v; persist();
        if (window.BL_FX) BL_FX.buzz(8);   // 🔴 изборът се записваше без нито един знак, че е приет
      });
      sexRow.appendChild(b);
    });
    // ♿ 11.08 (клавиатура-четец): трите <label> тук не сочат към нищо — нямат
    //    for=, нито обгръщат полето. Мама, която обхожда полетата с четеца (а не
    //    чете подред), чуваше „поле за дата" без име, а двете редици бутони бяха
    //    просто разсипани бутони. Имената се лепят право върху тях.
    sexRow.setAttribute('role', 'group'); sexRow.setAttribute('aria-label', 'Пол на бебето');
    c1.appendChild(el('label', 'bb-lbl', 'Пол:')); c1.appendChild(sexRow);
    c1.appendChild(el('label', 'bb-lbl', 'Рождена дата:'));
    const dateI = el('input', 'jr-word'); dateI.type = 'date'; dateI.max = today(); dateI.value = baby.birth;
    dateI.setAttribute('aria-label', 'Рождена дата');
    c1.appendChild(dateI);
    const ageOut = el('p', 'bb-age', '');
    c1.appendChild(ageOut);

    // ── М1: роди ли се преди термина? ──
    // Пита се тихо и по избор. Ако мама не пипне нищо — нищо не се променя.
    // Но ако бебето е дошло по-рано, всичко за развитието се мери оттук.
    c1.appendChild(el('label', 'bb-lbl', 'Роди ли се преди термина? <span class="jr-sub">по избор — за да не го мерим с чужд аршин</span>'));
    const pwRow = el('div', 'bb-sex');
    pwRow.setAttribute('role', 'group'); pwRow.setAttribute('aria-label', 'Роди ли се преди термина');
    const PW = [[0, 'На термин'], [36, '36 с.'], [34, '34 с.'], [32, '32 с.'], [30, '30 с.'], [28, '28 с. или по-рано']];
    // 📱 11.08 (измерено на 375px телефон): шестте бутона стояха в един ред без
    //    пренасяне — 37px ширина всеки, при 44 минимум за пръст, а надписите се
    //    пречупваха на три реда (94px високи кутийки). Пренасяме на два реда по
    //    три: ~93px широки, четими, и пръстът им уцелва средата.
    pwRow.style.flexWrap = 'wrap';
    // 🔴 11.08: „На термин“ светеше избран, без мама да е казвала нищо — същият
    //    капан, който е изкоренен точно над това (полът вече не е 'girl' по
    //    подразбиране). Стойност няма → нищо не свети и въпросът си стои
    //    отворен. Празно поле не е отговор.
    const пвЗаписано = (() => { try { return localStorage.getItem('bl_preterm') != null; } catch (e) { return false; } })();
    PW.forEach(([v, lbl]) => {
      const b = el('button', 'bb-sexbtn' + (пвЗаписано && +load('bl_preterm', 0) === v ? ' on' : ''), lbl);
      b.type = 'button';
      b.style.flex = '1 1 28%'; b.style.minHeight = '44px';
      b.addEventListener('click', () => {
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет, намерено от dev/lazhliv_uspeh.js):
        //    бутонът светваше ПРЕДИ записа. Падне ли записът, на екрана свети
        //    „34 седмици“, а `refreshAge()` чете bl_preterm от ПАМЕТТА и пише
        //    старата коригирана възраст отдолу — две числа за едно и също нещо
        //    в една карта. И не е дребно: по коригираната възраст се четат
        //    кривите на СЗО и уменията. Светваме СЛЕД записа.
        if (!save('bl_preterm', v === 28 ? 28 : v)) return;
        pwRow.querySelectorAll('.bb-sexbtn').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        refreshAge();
        if (window.BL_FX) BL_FX.buzz(8);
      });
      b.setAttribute('aria-pressed', (пвЗаписано && +load('bl_preterm', 0) === v) ? 'true' : 'false');
      pwRow.appendChild(b);
    });
    c1.appendChild(pwRow);
    const corrOut = el('p', 'bb-corr', '');
    c1.appendChild(corrOut);

    // 🟠 11.08: bl_baby се пише и от онбординга, и от preg20 („роди се“). Тук
    //    се записваше обектът, прочетен при СТРОЕЖА на картата — една буква в
    //    името връщаше стария пол/дата отгоре. Четем прясно и пипаме само своите
    //    три полета (както sos.js вече прави при СОС-номерата).
    function persist() {
      const cur = load('bl_baby', {}) || {};
      cur.name = nameI.value.trim().slice(0, 24);
      cur.birth = dateI.value;
      cur.sex = baby.sex || cur.sex || '';
      save('bl_baby', cur);
      baby.name = cur.name; baby.birth = cur.birth; baby.sex = cur.sex;
      // 🤰→👶 рождената дата приключва броенето до термина (виж бележката при
      //    бременносттаЕПриключена). Онбордингът и „роди се“ го правеха;
      //    това поле — не, и двете състояния оставаха живи едно до друго.
      гасиБременносттаПриРаждане();
      refreshAge();
    }
    function refreshAge() {
      const a = ageFromBirth(baby.birth);
      // 🔴 11.08 (обиколка по картите, ИЗМЕРЕНО): дата в бъдещето (сбъркана
      //    година при въвеждане на ръка — max= не спира писането) се записваше
      //    мълчаливо, а картата отговаряше „Въведи рождена дата“ — тоест точно
      //    като на празно поле. Оттам нататък приложението вярва, че бебето
      //    съществува (bl_baby.birth е пълна), но възрастта е null и половината
      //    карти се държат странно, без мама да разбере защо.
      // 🕛 19.08: и тук по КАЛЕНДАРЕН ДЕН — иначе майка, въвела ДНЕШНА рождена
      //    дата в 00:30, получаваше „тази дата е в бъдещето“ (двата часа от UTC).
      const вбъдеще = !!baby.birth && !isNaN(денНула(baby.birth)) && денНула(baby.birth) > денНула(new Date());
      ageOut.innerHTML = a
        ? `🎂 ${esc(baby.name) || 'Бебето'} е на <strong>${esc(a.text)}</strong>`
        : (вбъдеще
          ? `🗓️ Тази дата е в <strong>бъдещето</strong> (${esc(new Date(baby.birth).toLocaleDateString('bg-BG'))}) — най-често е сбъркана годината. Поправи я и веднага почвам да смятам. Ако още чакаш бебето, датата на термина се пише в „Бременност“. 💜`
          : 'Въведи рождена дата, за да смятам възрастта.');
      // Честно: показваме и двете числа, за да знае мама по кое мерим
      // Родът се съгласува: „Марти е дошЪЛ“, „Ния е дошЛА“, „бебето е дошЛО“.
      const кой = esc(baby.name) || 'бебето';
      const дошло = (!baby.name || !baby.sex) ? 'дошло' : (baby.sex === 'boy' ? 'дошъл' : 'дошла');
      corrOut.innerHTML = (a && a.corr)
        ? `👶 Коригирана възраст: <strong>${esc(a.corr.text)}</strong>. По нея мерим развитието, игрите, съня и растежа — защото ${кой} е ${дошло} по-рано и се учи от термина си. <br><small>Ваксините остават по календарната дата — те не се коригират.</small>`
        : '';
    }
    nameI.addEventListener('input', persist); dateI.addEventListener('change', persist); refreshAge();
    root.appendChild(c1);

    // 2. Калкулатор на растежа (СЗО)
    const c2 = card('Калкулатор на растежа ⭐ <span class="jr-sub">къде е бебето спрямо кривите на СЗО</span>');
    const inRow = el('div', 'bb-grow');
    const wI = el('input', 'jr-word'); wI.type = 'number'; wI.step = '0.1'; wI.placeholder = 'Тегло (кг)…';
    const mI = el('input', 'jr-word'); mI.type = 'number'; mI.step = '1'; mI.min = '0'; mI.max = '24';
    const a0 = ageFromBirth(baby.birth);
    mI.placeholder = 'Възраст (месеци)…'; if (a0) mI.value = Math.round(a0.devMonths); // М1: СЗО кривите искат КОРИГИРАНА възраст
    inRow.appendChild(wI); inRow.appendChild(mI);
    c2.appendChild(inRow);
    const calcBtn = el('button', 'jr-btn', 'Изчисли 📊'); calcBtn.type = 'button';
    c2.appendChild(calcBtn);
    const chartBox = el('div', 'bb-chartbox'); c2.appendChild(chartBox);
    chartBox.innerHTML = '<div class="bb-empty">📊<span>Въведи тегло и възраст, и ще нарисувам къде е бебето върху кривите на СЗО.</span></div>';
    // проход 4 [28]: тапни точка на кривата → изрича стойността си (мама вижда петно,
    // но иска числото — сега всяко мерене си казва „на N мес · W кг").
    const chartTip = el('p', 'bb-charttip', ''); chartTip.hidden = true; c2.appendChild(chartTip);
    chartBox.addEventListener('click', e => {
      const pt = e.target.closest('.bb-pt'); if (!pt) return;
      const m = pt.getAttribute('data-m'), w = pt.getAttribute('data-w'), now = pt.getAttribute('data-now');
      chartTip.textContent = (now ? '📍 Сега' : '•') + ` на ${m} мес · ${w} кг`;
      chartTip.hidden = false;
      chartBox.querySelectorAll('.bb-pt.sel').forEach(p => p.classList.remove('sel'));
      pt.classList.add('sel');
    });
    const resOut = el('p', 'bb-res', ''); c2.appendChild(resOut);
    const histBox = el('div', 'bb-hist bl-stagger'); c2.appendChild(histBox);

    function whoPct(sex, ageM, val) {
      const w = D.who, g = sex === 'boy' ? w.boys : w.girls, M = w.months;
      const a = Math.max(M[0], Math.min(M[M.length - 1], ageM));
      let i = 0; while (i < M.length - 1 && M[i + 1] < a) i++;
      const t = (a - M[i]) / ((M[i + 1] - M[i]) || 1);
      const bands = ['p3', 'p15', 'p50', 'p85', 'p97'], pc = [3, 15, 50, 85, 97];
      const bv = bands.map(b => g[b][i] + t * (g[b][i + 1] - g[b][i]));
      if (val <= bv[0]) return { p: 3, lt: true, bv };
      if (val >= bv[4]) return { p: 97, gt: true, bv };
      let j = 0; while (j < 4 && bv[j + 1] < val) j++;
      const tt = (val - bv[j]) / ((bv[j + 1] - bv[j]) || 1);
      return { p: Math.round(pc[j] + tt * (pc[j + 1] - pc[j])), bv };
    }
    function drawChart(sex, ageM, val) {
      const w = D.who, g = sex === 'boy' ? w.boys : w.girls, M = w.months;
      const W = 300, H = 180, pl = 26, pr = 10, pt = 10, pb = 22;
      const xmax = 24, ymin = 2, ymax = 16;
      const X = m => pl + (m / xmax) * (W - pl - pr);
      const Y = kg => pt + (1 - (kg - ymin) / (ymax - ymin)) * (H - pt - pb);
      const colors = { p3: '#a8cdec', p15: '#cbbcec', p50: '#f291bd', p85: '#cbbcec', p97: '#a8cdec' };
      let svg = `<svg viewBox="0 0 ${W} ${H}" class="bb-chart">`;
      for (let kg = 4; kg <= 16; kg += 4) svg += `<line x1="${pl}" y1="${Y(kg)}" x2="${W - pr}" y2="${Y(kg)}" stroke="#eef0f7"/><text x="${pl - 4}" y="${Y(kg) + 3}" class="bb-ax" text-anchor="end">${kg}</text>`;
      [0, 6, 12, 18, 24].forEach(m => svg += `<text x="${X(m)}" y="${H - 7}" class="bb-ax" text-anchor="middle">${m}м</text>`);
      ['p97', 'p85', 'p50', 'p15', 'p3'].forEach(b => {
        const pts = M.map(m => `${X(m)},${Y(g[b][M.indexOf(m)])}`).join(' ');
        svg += `<polyline points="${pts}" fill="none" stroke="${colors[b]}" stroke-width="${b === 'p50' ? 2.4 : 1.6}" stroke-linecap="round" opacity="${b === 'p50' ? 1 : 0.7}"/>`;
      });
      const px = X(Math.min(24, ageM)), py = Y(Math.max(2, Math.min(16, val)));
      // #35: картата проповядва „важна е ПОСОКАТА" — значи покажи я. Свързваме
      // миналите мерения (bl_growth) + сегашното в пунктирана следа, за да се вижда
      // траекторията, а не самотна точка. Малките точки = минало, голямата = сега.
      const hist = load('bl_growth', []);
      const histPts = hist.map(h => [X(Math.min(24, +h.m || 0)), Y(Math.max(2, Math.min(16, +h.w || 2))), h.m, h.w]);
      const allPts = histPts.concat([[px, py]]);
      if (allPts.length > 1) {
        svg += `<polyline points="${allPts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="#e56ba4" stroke-width="2" stroke-dasharray="3 4" opacity=".8"/>`;
        // проход 4 [28]: невидим по-голям кръг за лесен тап + видимата точица
        histPts.forEach(p => svg += `<circle class="bb-pt" data-m="${p[2]}" data-w="${p[3]}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="11" fill="transparent" style="cursor:pointer"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="#e56ba4" opacity=".5" pointer-events="none"/>`);
      }
      svg += `<circle class="bb-pt" data-m="${(+ageM).toFixed(1)}" data-w="${(+val).toFixed(2)}" data-now="1" cx="${px}" cy="${py}" r="13" fill="transparent" style="cursor:pointer"/><g class="bb-now" pointer-events="none"><circle cx="${px}" cy="${py}" r="8" fill="#fff" stroke="#e56ba4" stroke-width="2.5"/><circle cx="${px}" cy="${py}" r="3" fill="#e56ba4"/></g>`;  // проход 4: точката „бебето е тук" пулсва веднъж + тапваема [28]
      svg += `</svg>`;
      return svg;
    }
    function bandWord(p) {
      if (p <= 3) return 'дребничко, но ако си върви по кривата — расте си отлично';
      if (p >= 97) return 'едричко бебе — юнак';
      if (p < 15) return 'по-крехичко от средното — напълно нормално';
      if (p > 85) return 'по-едричко от средното — чудесно';
      return 'точно в милото средно';
    }
    calcBtn.addEventListener('click', () => {
      const val = parseFloat(wI.value), ageM = parseFloat(mI.value);
      if (isNaN(val) || val <= 0) { resOut.textContent = 'Въведи тегло в кг 😊'; return; }
      if (val > 30) { resOut.textContent = 'Хм, ' + val + ' кг е тегло на голям юнак, не на бебе 😊 Провери числото (напр. 7.2).'; return; }
      if (val < 0.4) { resOut.textContent = 'Това изглежда като грамове — въведи в килограми (напр. 3.2). 😊'; return; }
      if (isNaN(ageM) || ageM < 0 || ageM > 24) { resOut.textContent = 'Възрастта е между 0 и 24 месеца.'; return; }
      // Кривите на СЗО за момчета и момичета са РАЗЛИЧНИ. Без пол не смятаме —
      // по-добре един въпрос, отколкото число, сметнато по чужда крива.
      if (!baby.sex || (baby.sex !== 'boy' && baby.sex !== 'girl')) {
        resOut.innerHTML = 'Кажи ми първо момче ли е, или момиче — кривите на СЗО са различни за двете и числото щеше да е подвеждащо. Изборът е в картата „Профилът на бебето“ — първата в тази стая. 💜';
        chartBox.innerHTML = '';
        return;
      }
      const r = whoPct(baby.sex, ageM, val);
      chartBox.innerHTML = drawChart(baby.sex, ageM, val);
      const nm = baby.name || 'Бебето';
      const pref = r.lt ? 'под 3-ия' : r.gt ? 'над 97-ия' : `<span data-cnt="${r.p}">${r.p}</span>-ия`;
      // проход 4: изричаме ПОСОКАТА (картата я обещава). Сравняваме с предишното мерене.
      const пред = load('bl_growth', []);
      const prev = пред.length ? пред[пред.length - 1] : null;
      let посока = '';
      if (prev && prev.w != null && prev.p != null) {
        const dw = val - (+prev.w), dp = r.p - (+prev.p);
        const тегло = dw > 0.02 ? `качи <span data-cnt="${Math.round(dw * 1000)}">${Math.round(dw * 1000)}</span> г от миналото мерене`
          : Math.abs(dw) <= 0.02 ? 'теглото се задържа' : 'този път е малко по-леко';
        const крива = dp >= 8 ? ' и се покатери нагоре по кривата 📈'
          : dp <= -12 ? ' и е малко под предишната крива — спомени го спокойно на педиатъра 💛'
          : ' и си върви стабилно по своята крива 💚';
        посока = `<span class="bb-dir">${тегло}${крива}.</span>`;
      } else {
        посока = `<span class="bb-dir">Първо мерене — от следващия път ще ти показвам посоката 💚</span>`;
      }
      // проход 4 [24-аналогия]: шеговита битова мярка (огледало на плод-размера) —
      // топло, не медицинско. „тежи колкото 🥬 зелка" се помни, число — не.
      const обект = kg => kg < 3.5 ? ['🍞', 'самун топъл хляб'] : kg < 4.5 ? ['🥬', 'зелка'] : kg < 5.5 ? ['🐰', 'пухкаво зайче'] : kg < 6.5 ? ['🐱', 'коте'] : kg < 8 ? ['🎃', 'голяма тиква'] : kg < 10 ? ['🐕', 'палаво кутре'] : kg < 12 ? ['🍉', 'диня'] : ['🎒', 'пълна раничка'];
      const [ем, им] = обект(val);
      const аналог = `<span class="bb-analogy">🤍 ${esc(nm)} сега тежи горе-долу колкото ${ем} <strong>${им}</strong> — цели <strong>${val}</strong> кг обич.</span>`;
      // 🤍 „ако си върви по кривата — расте си отлично" е невъзможно да е вярно
      //    при ПЪРВО мерене: крива още няма. А точно под 3-ия персентил това
      //    успокоение затваря разговора с педиатъра, преди да е започнал.
      const присъда = (r.lt && !prev)
        ? 'дребничко — само по себе си първото число не значи нищо, защото още няма крива, по която да се чете. Покажи го на педиатъра, за да го впише'
        : bandWord(r.p);
      resOut.innerHTML = `${esc(nm)} е около <strong>${pref} персентил</strong> — ${r.lt ? 'по-дребно от' : r.gt ? 'по-едро от' : 'по-голямо от ' + r.p + ' от 100 бебета на тази възраст'}${r.lt || r.gt ? ' повечето връстници' : ''}. ${присъда}. ${посока}${аналог}<br><span class="bb-note">Всичко между кривите е нормално — важна е ПОСОКАТА, не точката. Официалното мерене прави педиатърът.</span>`;
      resOut.classList.remove('bb-pop'); void resOut.offsetWidth; resOut.classList.add('bb-pop');
      if (window.BL_FX) BL_FX.countUp(resOut); // числото отброява до персентила
      const hist = load('bl_growth', []);
      hist.push({ d: today(), m: Math.round(ageM * 10) / 10, w: val, p: r.p });
      save('bl_growth', hist.slice(-24));
      drawHist();
    });
    function drawHist() {
      const hist = load('bl_growth', []);
      if (!hist.length) { histBox.innerHTML = ''; return; }
      // проход 4 [23]: всеки ред е триещ се — уморена майка често записва грешна мярка
      // (двоен тап), а грешката иначе трови кривата ѝ завинаги. ✕ → BL_UI.confirm.
      // 🔴 25.08 (ИЗМЕРЕНО с dev/interaktivno_stai2.js, профил „повредена памет“):
      //    ред от bl_growth без `p` (стар формат или внесено чуждо копие) се
      //    изписваше буквално „пundefined“ до теглото на бебето. Същото важи за
      //    липсваща дата/месец/тегло. Липсващото поле вече е тире, не машинна
      //    дума — а редът си остава триещ се, за да може да се махне.
      const ч = v => (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) ? '—' : esc(String(v));
      histBox.innerHTML = '<p class="jr-weekcap">История: <span class="jr-sub">(✕ маха сгрешен ред)</span></p>' + hist.slice(-6).reverse().map((h, i) =>
        `<div class="bb-histrow"><span>${ч((h || {}).d)}</span><span>${ч((h || {}).m)} мес</span><span>${ч((h || {}).w)} кг</span><span class="bb-hp" title="персентил">${(h && h.p != null && !isNaN(h.p)) ? 'п' + esc(String(h.p)) : '—'}</span><button type="button" class="bb-del" data-i="${hist.length - 1 - i}" aria-label="Изтрий този ред">✕</button></div>`).join('');
    }
    histBox.addEventListener('click', e => {
      const b = e.target.closest('.bb-del'); if (!b) return;
      const i = +b.dataset.i, hist = load('bl_growth', []);
      const row = hist[i]; if (!row) return;
      const дел = () => { hist.splice(i, 1); save('bl_growth', hist); drawHist(); if (window.BL_FX) BL_FX.buzz(8); };
      const питай = (window.BL_UI && BL_UI.confirm)
        ? BL_UI.confirm(`Да махна ли „${row.m} мес · ${row.w} кг“?`, { okText: 'Махни', danger: true })
        : Promise.resolve(confirm(`Да махна ли „${row.m} мес · ${row.w} кг“?`));
      питай.then(да => { if (да) дел(); });
    });
    drawHist();
    root.appendChild(c2);

    // 3. Хранене — кога беше последното
    const c3 = card('Кога яде за последно? 🍼 <span class="jr-sub">бърз запис с 1 докосване (за мерене с време — кърмене-таймерът)</span>');
    const feedOut = el('p', 'bb-feed', ''); c3.appendChild(feedOut);
    // проход 4: жива прогноза напред от НЕЙНИЯ ритъм — спира гадаенето в 13:00.
    const predOut = el('p', 'bb-feed bb-pred', ''); c3.appendChild(predOut);
    const feedRow = el('div', 'jr-quick');
    // проход 3 T10: грешен тап в 3ч заместваше безвъзвратно реалното „преди 2ч, лявата".
    const sideWord = s => s === 'left' ? 'лявата гърда' : s === 'right' ? 'дясната гърда' : 'шише';
    let undoPrev = null, undoTimer = null, undoБеляг = null;
    // 🔴 12.08 (тест за паметта, ред Д4 — ЖИВ дефект, губеше запис на майката):
    //    ↺ пазеше САМО стойността отпреди натискането и я връщаше СЛЯПО до 10
    //    секунди по-късно. Но ключът bl_feed се пише от ДВЕ карти в тази стая:
    //    оттук и от кърмене-таймера (js/rooms3.js, stop() → save('bl_feed', …)).
    //    Мама бутва „Ляво“ тук, после спира истинското кърмене в съседната
    //    карта, после бутва ↺ (чипът още стои) — и ↺ връщаше СТАРОТО отгоре,
    //    тоест триеше кърменето, което току-що е записала.
    //    Лекът: помним и СУРОВИЯ отпечатък на склада в мига на снимката. При
    //    натискане сравняваме: различава ли се, значи е писала друга карта →
    //    НЕ пипаме нищо и ѝ казваме защо.
    const суровоLS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const undoChip = el('button', 'jr-chip', ''); undoChip.type = 'button'; undoChip.hidden = true;
    const feedКаз = el('p', 'jr-hint'); feedКаз.hidden = true;   // тихият ред „какво стана“ под ↺
    [['left', '🤱 Ляво'], ['right', '🤱 Дясно'], ['bottle', '🍼 Шише']].forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip', lbl); b.type = 'button';
      b.addEventListener('click', () => {
        const prev = load('bl_feed', null);
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): при паднал запис часовникът се
        //    пресмяташе, чипът „↺ Върни предишното“ изскачаше и логът за
        //    прогнозата продължаваше — все едно храненето е записано. А после
        //    „последно хранене преди…“ показваше старото, без нито дума.
        if (!save('bl_feed', { t: Date.now(), s: v })) return;
        const fl = load('bl_feedlog', []); fl.push(Date.now()); save('bl_feedlog', fl.slice(-16));  // ротиращ лог само с времена — за прогнозата
        refreshFeed(); тикЧасовник();
        feedКаз.hidden = true;
        if (prev) {
          undoPrev = prev;
          // отпечатъкът се взема СЛЕД записа — това е складът, какъвто ↺ го оставя
          undoБеляг = { feed: суровоLS('bl_feed'), log: суровоLS('bl_feedlog') };
          const mm = Math.floor((Date.now() - prev.t) / 60000);
          undoChip.textContent = `↺ Върни предишното (${sideWord(prev.s)}, преди ${Math.floor(mm / 60) ? Math.floor(mm / 60) + ' ч ' : ''}${mm % 60} мин)`;
          undoChip.hidden = false;
          clearTimeout(undoTimer); undoTimer = setTimeout(() => { undoChip.hidden = true; }, 10000);
        }
      });
      feedRow.appendChild(b);
    });
    undoChip.addEventListener('click', () => {
      if (undoPrev) {
        if (undoБеляг && суровоLS('bl_feed') !== undoБеляг.feed) {
          // междувременно е писала друга карта (най-често кърмене-таймерът).
          // По-скъпо е да изтрием нейния запис, отколкото да не върнем нашия.
          refreshFeed(); тикЧасовник();
          feedКаз.textContent = 'Междувременно се записа друго хранене — не го пипам. 💜';
          feedКаз.hidden = false;
          undoPrev = null; undoБеляг = null;
          undoChip.hidden = true; clearTimeout(undoTimer);
          return;
        }
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): чипът ↺ се скриваше и undoPrev
        //    се нулираше, дори когато връщането не е минало — пътят назад
        //    изчезваше, без нищо да се е върнало.
        if (!save('bl_feed', undoPrev)) { refreshFeed(); тикЧасовник(); return; }
        // ↺ отмяната връщаше bl_feed, но времето оставаше в bl_feedlog завинаги —
        //    и после се броеше в прогнозата и на 24-часовия кръг. Махаме и следата.
        //    Но само ако логът е СЪЩИЯТ: махне ли се чуждо време, прогнозата ѝ
        //    почва да лъже с хранене, което го е имало.
        if (!undoБеляг || суровоLS('bl_feedlog') === undoБеляг.log) {
          const fl = load('bl_feedlog', []); fl.pop(); save('bl_feedlog', fl);
        }
        undoPrev = null; undoБеляг = null;
        refreshFeed(); тикЧасовник();
      }
      undoChip.hidden = true; clearTimeout(undoTimer);
    });
    c3.appendChild(feedRow); c3.appendChild(undoChip); c3.appendChild(feedКаз);
    function refreshFeed() {
      const f = load('bl_feed', null);
      if (!f) { feedOut.innerHTML = 'Още няма отбелязано хранене. Бутни отдолу при следващото. 👇'; predOut.innerHTML = ''; return; }
      // 🔴 11.08 (обиколка във времето): записът може да е в БЪДЕЩЕТО — в
      //    последната неделя на октомври часовникът се връща от 04:00 на 03:00
      //    и храненето в 3:30 остава с час напред; същото при сверяване на
      //    сбъркан телефонен часовник. Тогава излизаше „преди -2 ч -27 мин“ —
      //    нечетимо число, което мама не може да провери срещу нищо.
      const изтекло = Date.now() - f.t;
      const mins = Math.floor(Math.max(0, изтекло) / 60000);
      const h = Math.floor(mins / 60), m = mins % 60;
      feedOut.innerHTML = изтекло < -60000
        ? `Последното хранене е записано с час <strong>напред</strong> (${new Date(f.t).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}) — часовникът на телефона се е разминал. Отбележи наново при следващото. 💜`
        : (isFinite(m) ? `Последно (${sideWord(f.s)}) преди <strong>${h ? h + ' ч ' : ''}${m} мин</strong>.`
                       : 'Записът за последното хранене не се чете. Следващото ще се брои нормално. 💜');   // 🔴 26.08 (ИЗМЕРЕНО): даваше „преди NaN мин"
      // проход 4: прогноза напред от медианния интервал (три извора, дедуп на близнаци <60с)
      const ts = [...load('bl_nursing', []).map(x => x.ts), ...load('bl_feedlog', []), f.t].filter(Boolean).sort((a, b) => a - b);
      const uniq = ts.filter((x, i) => i === 0 || x - ts[i - 1] > 60000);
      if (uniq.length < 4) { predOut.innerHTML = 'Събирам ритъма ти — след няколко хранения ще подсказвам кога обикновено е следващото. 💜'; predOut.style.opacity = ''; return; }
      const ints = []; for (let i = 1; i < uniq.length; i++) ints.push(uniq[i] - uniq[i - 1]);
      const посл = ints.slice(-7).sort((a, b) => a - b);
      const median = посл[Math.floor(посл.length / 2)];
      const next = f.t + median, remain = Math.round((next - Date.now()) / 60000);
      const nd = new Date(next), час = String(nd.getHours()).padStart(2, '0') + ':' + String(nd.getMinutes()).padStart(2, '0');
      if (remain > 0) {
        predOut.innerHTML = `Обикновено следващото е около <strong>${час}</strong> · след ~${Math.floor(remain / 60) ? Math.floor(remain / 60) + 'ч ' : ''}${remain % 60}м 🍼<br><small>ориентир от твоите записи — бебето води.</small>`;
        predOut.style.opacity = remain < 20 ? String(0.55 + 0.45 * (remain / 20)) : '';
      } else {
        predOut.innerHTML = `Обикновено вече наближава — но всяко бебе е различно, храни когато поиска. 💜`;
        predOut.style.opacity = '';
      }
    }
    refreshFeed();
    // T10: размразяване — „преди X мин" се обновява, докато стаята е отворена
    const feedTick = setInterval(() => { if (!feedOut.isConnected) { clearInterval(feedTick); return; } refreshFeed(); }, 60000);
    const onFeedVis = () => { if (!feedOut.isConnected) { document.removeEventListener('visibilitychange', onFeedVis); return; } if (!document.hidden) refreshFeed(); };
    document.addEventListener('visibilitychange', onFeedVis);
    root.appendChild(c3);

    // 4. Пелени днес
    const c4 = card('Пелени днес 💧 <span class="jr-sub">важен знак, че бебето се храни добре</span>');
    const dip = load('bl_diapers', {}); const t = today(); if (!dip[t]) dip[t] = { wet: 0, dirty: 0 };
    // 🕛 датата се смята при ВСЕКИ клик, не веднъж при рисуването. Стая, отворена
    //    в 23:50, пишеше нощната пелена в 00:20 на ВЧЕРАШНИЯ ден — и на сутринта
    //    „Пелени днес" показваше 0. Заедно с това четем склада наново (друга
    //    карта може да е писала междувременно).
    const дневник = () => { const д = today(); const o = load('bl_diapers', {}); if (!o[д] || typeof o[д] !== 'object') o[д] = { wet: 0, dirty: 0 }; return { д, o }; };
    // 🔴🔴 25.08 (ИЗМЕРЕНО с dev/interaktivno_stai2.js, проба „полунощ“):
    //    ЗАПИСЪТ се поправи на 11.08 (`дневник()` пита датата при всеки клик),
    //    но ЧИСЛОТО НА ЕКРАНА остана от строежа — `dip[t][k]`, снимка отпреди
    //    полунощ. Майка с отворено приложение 23:50 → 00:10 виждаше „4“ от
    //    вчера, бутваше „+“ и числото скачаше на „1“. Измерено: на екрана
    //    4 → 1, а в паметта вчера=4 и днес=1. Едно нещо, две числа — и по-
    //    страшното: изглежда като изтрит напредък.
    //    Същият лек като при храненето и съня в тази стая (те вече го имат):
    //    числата се прерисуват от СКЛАДА — на минутен тик и при връщане в
    //    приложението, тоест полунощ ги заварва верни.
    //    ПЪТ НАЗАД: върни `dip[t][k]` и махни рисувайПелени/dipTick/onDipVis.
    const броячи = {};
    const рисувайПелени = () => {
      const { д, o } = дневник();
      Object.keys(броячи).forEach(k => { броячи[k].textContent = (o[д][k] || 0); });
    };
    const grid = el('div', 'bb-dip');
    [['wet', '💧 Мокри'], ['dirty', '💩 Каки']].forEach(([k, lbl]) => {
      const box = el('div', 'bb-dipbox');
      box.appendChild(el('span', 'bb-diplbl', lbl));
      const minus = el('button', 'bb-dipbtn', '−'); minus.type = 'button';
      const num = el('span', 'bb-dipnum', (dip[t] && dip[t][k]) || 0);
      броячи[k] = num;
      const plus = el('button', 'bb-dipbtn', '+'); plus.type = 'button';
      // ♿ 11.08 (клавиатура-четец): двете кутийки („Мокри" и „Каки") дават
      //    четири еднакви бутона „минус"/„плюс" — четецът не казваше на КОЯ.
      //    Броячът е <span> и промяната му мълчеше; сега е live-област.
      const чисто = lbl.replace(/[^А-Яа-я ]/g, '').trim().toLowerCase();
      minus.setAttribute('aria-label', 'Едно по-малко: ' + чисто);
      plus.setAttribute('aria-label', 'Едно повече: ' + чисто);
      num.setAttribute('aria-live', 'polite');
      num.setAttribute('aria-label', чисто + ' днес');
      // 🔴 числото се рисува СЛЕД записа и само ако той е минал: при пълна памет
      //    броячът показваше „5“, а на другия ден пак беше 4.
      const бутни = (посока, ев) => {
        const { д, o } = дневник();
        const беше = o[д][k] || 0;
        o[д][k] = Math.max(0, беше + посока);
        if (!save('bl_diapers', o)) { дипБел.textContent = ПЪЛНА; дипБел.hidden = false; return false; }
        дипБел.hidden = true;
        рисувайПелени();
        return true;
      };
      minus.addEventListener('click', () => { бутни(-1); });
      plus.addEventListener('click', () => { if (бутни(+1)) { box.classList.add('pp'); setTimeout(() => box.classList.remove('pp'), 300); } });
      box.appendChild(minus); box.appendChild(num); box.appendChild(plus);
      grid.appendChild(box);
    });
    const дипБел = el('p', 'jr-hint', ''); дипБел.hidden = true;
    дипБел.setAttribute('aria-live', 'polite');
    c4.appendChild(grid); c4.appendChild(дипБел);
    рисувайПелени();
    // 🕛 полунощ заварва числата верни, без мама да презарежда
    const dipTick = setInterval(() => { if (!grid.isConnected) { clearInterval(dipTick); return; } рисувайПелени(); }, 60000);
    const onDipVis = () => { if (!grid.isConnected) { document.removeEventListener('visibilitychange', onDipVis); return; } if (!document.hidden) рисувайПелени(); };
    document.addEventListener('visibilitychange', onDipVis);
    // 🟠 11.08 (обиколка като майка): до брояча стоеше гола присъда „6+ = млякото
    //    стига“. В 22 ч. с 4 отбелязани пелени тя се чете като „млякото не стига“
    //    — а числото е само това, което мама е успяла да ЦЪКНЕ. Картата за съня
    //    в същата стая си го признава („броя само това, което си отбелязала“);
    //    тази — не. Празно поле не е доказателство.
    c4.appendChild(el('p', 'jr-privacy', '6+ мокри пелени на ден = млякото стига. 💪 Броя само отбелязаните — пропуснато цъкане не е пропусната пелена.'));
    root.appendChild(c4);

    // 5. Сън днес
    const c5 = card('Сънят днес 😴 <span class="jr-sub">натисни при заспиване и при събуждане</span>');
    const sleepBtn = el('button', 'jr-btn', ''); sleepBtn.type = 'button';
    // проход 4: жив прозорец за следващата дрямка — мистерия №1 на уморената майка.
    const sleepWin = el('p', 'bb-feed bb-sleepwin', '');
    const sleepOut = el('p', 'bb-feed', '');
    function sleepData() {
      const t = today();   // 🕛 стаята може да е отворена от снощи — датата се пита СЕГА
      let s = load('bl_sleep', { d: t, segs: [], open: null });
      if (s.d !== t) {
        // проход 3 T7: рендер СЛЕД полунощ без презареждане — нека sleephist разцепи
        // и прибере отворения нощен сън (DRY), после четем наново. Ако все пак не е
        // днешен (изоставен стар брояч) — нулираме честно.
        if (window.BL_SLEEPHIST && BL_SLEEPHIST.прибери) { BL_SLEEPHIST.прибери(); s = load('bl_sleep', { d: t, segs: [], open: null }); }
        if (s.d !== t) s = { d: t, segs: [], open: null };
      }
      return s;
    }
    // 🔴 04.08: отвореният брояч се прибавяше без таван — забравено докосване
    //    надуваше „Днес“ до колкото минат часовете. Над 14 часа буден брояч не
    //    е сън, а забравяне: не се брои, но и не се трие мълчаливо (виж
    //    забравенСън по-долу — картата го казва и пита).
    const ТАВАН_СЪН = 14 * 3600000;
    function забравенСън(s) { return !!(s.open && Date.now() - s.open > ТАВАН_СЪН); }
    function totalSleep(s) {
      let ms = s.segs.reduce((a, x) => a + (x.e - x.s), 0);
      if (s.open && !забравенСън(s)) ms += Date.now() - s.open;
      const m = Math.floor(ms / 60000); return `${Math.floor(m / 60)} ч ${m % 60} мин`;
    }
    // възрастов прозорец на будност (мека рамка — всяко бебе е различно)
    function прозорец(am) {
      const d = am ? (am.devMonths != null ? am.devMonths : am.months) : 6;
      if (d < 3) return [45, 60]; if (d < 6) return [60, 120]; if (d < 12) return [120, 180]; return [180, 240];
    }
    const fmtЧ = m => (m >= 60 ? Math.floor(m / 60) + 'ч ' : '') + (m % 60) + 'м';
    function refreshSleep() {
      const s = sleepData();
      sleepBtn.textContent = s.open ? '🌅 Събуди се' : '😴 Заспа';
      sleepBtn.classList.toggle('running', !!s.open);
      const am = ageFromBirth(baby.birth);
      // 🤍 нормата се лепеше до нейния сбор винаги. При два натиснати бутона
      //    „2 ч 40 мин · типично ~14–17 ч" изглежда като присъда за бебето,
      //    а е присъда за копчето. Нормата идва чак когато денят е що-годе
      //    отбелязан; дотогава казваме честно какво брои сборът.
      const отрязъци = s.segs.length + (s.open && !забравенСън(s) ? 1 : 0);
      const typ = (am && отрязъци >= 3) ? (am.devMonths < 3 ? '~14–17 ч' : am.devMonths < 6 ? '~13–15 ч' : am.months < 12 ? '~12–14 ч' : '~11–14 ч') : '';
      sleepOut.innerHTML = `Днес: <strong>${totalSleep(s)}</strong>` +
        (typ ? ' · типично за възрастта: ' + typ : '<br><small>броя само това, което си отбелязала.</small>');
      // жив прозорец
      const [lo, hi] = прозорец(am);
      if (s.open) {
        const мин = Math.floor((Date.now() - s.open) / 60000);
        sleepWin.innerHTML = `🌙 ${esc(baby.name || 'Бебето')} спи вече <strong>${fmtЧ(мин)}</strong> · дрямките обикновено са ~${lo}–${hi} мин`;
      } else {
        const котва = s.segs.length ? s.segs[s.segs.length - 1].e : null;
        if (!котва) {
          sleepWin.innerHTML = `Отбележи събуждането долу 👇 и ще ти казвам кога наближава следващата дрямка.`;
        } else {
          const буден = Math.floor((Date.now() - котва) / 60000);
          if (буден > hi * 2) {
            // 🤍 мълчанието не е будно бебе. Над двоен прозорец по-вероятно е
            //    просто да не е натиснато копче — това не е повод за укор.
            sleepWin.innerHTML = `😴 Отдавна не сме отбелязвали сън. Кажи ми, като заспи — броя само това, което ми дадеш. 💜`;
          } else if (буден > hi) {
            sleepWin.innerHTML = `👀 Будно от <strong>${fmtЧ(буден)}</strong> — май мина прозорецът. Хвани първия знак за умора: търкане на очи, прозявка, забавяне.`;
          } else {
            const около = new Date(котва + (lo + hi) / 2 * 60000);
            const hh = String(около.getHours()).padStart(2, '0') + ':' + String(около.getMinutes()).padStart(2, '0');
            sleepWin.innerHTML = `🌙 Будно от <strong>${fmtЧ(буден)}</strong> · сънливостта наближава ~${hh} <small>(ориентир)</small>`;
          }
        }
      }
    }
    sleepBtn.addEventListener('click', () => {
      const s = sleepData();
      if (s.open) {
        // 🔴 04.08: „🌅 Събуди се“ след забравен брояч записваше 15-часов сън
        //    като истински. Сега прекалено дългият отрязък НЕ влиза в
        //    историята — но и не изчезва мълчаливо: казваме ѝ какво стана.
        if (забравенСън(s)) {
          const колко = fmtЧ(Math.floor((Date.now() - s.open) / 60000));   // ПРЕДИ да занулим
          s.open = null; save('bl_sleep', s); refreshSleep(); тикЧасовник();
          sleepOut.innerHTML = '⏱️ Броячът стоя пуснат <strong>' + колко +
            '</strong> — толкова дълъг сън не го записвам, защото по-вероятно е просто да е останал включен. Нищо не си объркала; само не искам да ти показвам числа, които не са истина. 💜';
          return;
        }
        s.segs.push({ s: s.open, e: Date.now() }); s.open = null;
      } else s.open = Date.now();
      save('bl_sleep', s); refreshSleep(); тикЧасовник();
    });
    c5.appendChild(sleepBtn); c5.appendChild(sleepWin); c5.appendChild(sleepOut); refreshSleep();
    // жив ъпдейт всяка минута (self-correcting, чисти се при откачане) + при връщане
    const winTick = setInterval(() => { if (!sleepWin.isConnected) { clearInterval(winTick); return; } refreshSleep(); }, 60000);
    const onSleepVis = () => { if (!sleepWin.isConnected) { document.removeEventListener('visibilitychange', onSleepVis); return; } if (!document.hidden) refreshSleep(); };
    document.addEventListener('visibilitychange', onSleepVis);
    root.appendChild(c5);

    // 5б. проход 4 [36]: 24-часовият кръг — висцералният пулс на ЕДИН ден.
    // Точки = хранения, дъги = сън, стрелка = сега. С един поглед в 3 сутринта:
    // кога беше последното хранене, колко дълга беше дрямката, къде сме сега.
    const cClock = card('Денят на един кръг 🕛 <span class="jr-sub">хранения, сън и „сега“ за днес</span>');
    const clockBox = el('div', 'bb-clockbox');
    cClock.appendChild(clockBox);
    const clockLeg = el('p', 'bb-clocklegend', '🍼 хранене · 🌙 сън · 📍 сега');
    cClock.appendChild(clockLeg);
    function рисувайЧасовник() {
      const cx = 90, cy = 90;
      const день0 = new Date(); день0.setHours(0, 0, 0, 0); const d0 = день0.getTime();
      const днес = ts => ts >= d0 && ts < d0 + 86400000;
      const ъгъл = ts => { const dt = new Date(ts); return ((dt.getHours() * 60 + dt.getMinutes()) / 1440) * 2 * Math.PI; };
      const точка = (a, r) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
      const дъга = (a0, a1, r) => { const [x0, y0] = точка(a0, r), [x1, y1] = точка(a1, r); const big = (a1 - a0) > Math.PI ? 1 : 0; return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${big} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
      let svg = '<svg viewBox="0 0 180 180" class="bb-clock">';
      svg += `<circle cx="${cx}" cy="${cy}" r="72" fill="#fbfaff" stroke="#ece7f6" stroke-width="1.5"/>`;
      // часови отметки на всеки 3 часа
      for (let h = 0; h < 24; h += 3) { const a = (h / 24) * 2 * Math.PI; const [ox, oy] = точка(a, 72), [ix, iy] = точка(a, 66); svg += `<line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${ix.toFixed(1)}" y2="${iy.toFixed(1)}" stroke="#d8d0ea" stroke-width="1.5"/>`; }
      [[0, '00'], [6, '06'], [12, '12'], [18, '18']].forEach(([h, l]) => { const a = (h / 24) * 2 * Math.PI; const [lx, ly] = точка(a, 55); svg += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" class="bb-cnum" text-anchor="middle">${l}</text>`; });
      // сън — дъги (пълни + отворен като тлееща)
      const s = sleepData();
      s.segs.forEach(seg => { if (днес(seg.s)) svg += `<path d="${дъга(ъгъл(seg.s), ъгъл(Math.min(seg.e, d0 + 86399000)), 44)}" fill="none" stroke="#b9a7e6" stroke-width="7" stroke-linecap="round" opacity=".85"/>`; });
      if (s.open && днес(s.open)) svg += `<path d="${дъга(ъгъл(s.open), ъгъл(Date.now()), 44)}" fill="none" stroke="#b9a7e6" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 4" opacity=".9"/>`;
      // хранения — точки
      // 🔴 26.08 (ИЗМЕРЕНО): `[null]` в кърменето гърмеше на x.ts и гасеше
      //    денонощния кръг — картата, която показва деня на бебето.
      const feeds = [...load('bl_nursing', []).filter(x => x).map(x => x.ts), ...load('bl_feedlog', []), (load('bl_feed', null) || {}).t].filter(x => x && днес(x));
      const uniq = [...new Set(feeds.map(x => Math.round(x / 300000)))].map(x => x * 300000);  // групирай на 5 мин
      uniq.forEach(ts => { const [x, y] = точка(ъгъл(ts), 58); svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#e56ba4" stroke="#fff" stroke-width="1.5"/>`; });
      // стрелка „сега"
      const [hx, hy] = точка(ъгъл(Date.now()), 68);
      svg += `<line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#8a63d2" stroke-width="2.5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="#8a63d2"/>`;
      svg += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="3.5" fill="#8a63d2"/>`;
      svg += '</svg>';
      const празно = !uniq.length && !s.segs.length && !s.open;
      clockBox.innerHTML = svg + (празно ? '<p class="bb-clockempty">Още няма записи за днес — отбележи хранене или сън горе и денят ще се появи тук. 🤍</p>' : '');
    }
    рисувайЧасовник();
    const clockTick = setInterval(() => { if (!clockBox.isConnected) { clearInterval(clockTick); return; } рисувайЧасовник(); }, 60000);
    const onClockVis = () => { if (!clockBox.isConnected) { document.removeEventListener('visibilitychange', onClockVis); return; } if (!document.hidden) рисувайЧасовник(); };
    document.addEventListener('visibilitychange', onClockVis);
    root.appendChild(cClock);

    // 6. Зъбки
    const c6 = card('Първите зъбки 🦷 <span class="jr-sub">докосни зъбче, което е пробило</span>');
    const teeth = load('bl_teeth', []);
    const teethSet = new Set(teeth);
    const upper = ['🦷', '🦷', '🦷', '🦷', '🦷', '🦷', '🦷', '🦷', '🦷', '🦷'];
    const arches = [['Горни', 0], ['Долни', 10]];
    arches.forEach(([lbl, off]) => {
      c6.appendChild(el('span', 'bb-diplbl', lbl));
      const rowE = el('div', 'th-arch');
      for (let i = 0; i < 10; i++) {
        const idx = off + i;
        const tth = el('button', 'th-tooth' + (teethSet.has(idx) ? ' in' : ''), '🦷'); tth.type = 'button';
        // ♿ 11.08 (клавиатура-четец): 20 еднакви „🦷" — четецът казваше двайсет
        //    пъти „зъб, бутон" и мама нямаше как да разбере кое кое е, нито кои
        //    вече е отметнала. Името казва редицата и мястото, aria-pressed —
        //    състоянието.
        const имеЗъб = lbl.toLowerCase() + ' зъб № ' + (i + 1);
        tth.setAttribute('aria-label', имеЗъб);
        tth.setAttribute('aria-pressed', teethSet.has(idx) ? 'true' : 'false');
        tth.addEventListener('click', () => {
          // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): зъбчето светваше, конфетите
          //    хвърчаха и броячът се вдигаше, а `save('bl_teeth', …)` най-долу
          //    падаше мълчаливо. „Първото зъбче“ се празнуваше веднъж и после
          //    го нямаше никъде. Записваме ПЪРВО, после празнуваме.
          const бъдещ = new Set(teethSet);
          if (бъдещ.has(idx)) бъдещ.delete(idx); else бъдещ.add(idx);
          if (!save('bl_teeth', [...бъдещ])) return;
          if (teethSet.has(idx)) {
            teethSet.delete(idx);
            // 🦷 отметката назад чистеше само брояча. Датата оставаше и Реката
            //    („Ново зъбче проби!") и Витрината пазеха завинаги събитие,
            //    което не се е случило — без откъде да се махне.
            const thd = load('bl_teeth_d', {});
            if (thd[idx]) { delete thd[idx]; save('bl_teeth_d', thd); }
          } else {
            teethSet.add(idx); tth.classList.add('pp'); setTimeout(() => tth.classList.remove('pp'), 300);
            const thd = load('bl_teeth_d', {});
            if (!thd[idx]) { thd[idx] = Date.now(); save('bl_teeth_d', thd); } // зъбчето в Реката
            if (window.BL_FX) { BL_FX.confetti(tth, 16); BL_FX.buzz(14); }
          }
          tth.classList.toggle('in');
          tth.setAttribute('aria-pressed', teethSet.has(idx) ? 'true' : 'false');
          thCount();   // самият запис вече мина най-горе
        });
        rowE.appendChild(tth);
      }
      c6.appendChild(rowE);
    });
    const thc = el('p', 'bb-feed', '');
    function thCount() { thc.innerHTML = `Пробили: <strong>${teethSet.size} / 20</strong>. Първите обикновено са долните предни, около 6–10 м.`; }
    thCount();
    c6.appendChild(thc);
    root.appendChild(c6);
  }

  // ═══════════════ 🤰 БРЕМЕННОСТ (Мила) ═══════════════

  function renderPregnancy(root) {
    // 🤰→👶 Ако бебето вече се е родило, стаята не брои — казва го и спира.
    //    (Гасенето е при въвеждането на датата; тук е вторият пласт, за да не
    //    зависи всичко от една-единствена точка.)
    гасиБременносттаПриРаждане();
    {
      const б = getBaby();
      const рд = денНула(б.birth || '');
      // само когато НЯМА живо броене: почне ли нова бременност (нова дата,
      // записана след раждането), стаята пак е нейна — картата не я закрива.
      let живоБроене = true, ималоРаждане = false;
      try {
        живоБроене = !!localStorage.getItem('bl_lmp');
        ималоРаждане = !!localStorage.getItem('bl_lmp_rodeno');
      } catch (e) {}
      if (!живоБроене && ималоРаждане && б.birth && !isNaN(рд) && рд <= денНула(new Date())) {
        const c0 = card('Бебето вече е тук 👶');
        c0.appendChild(el('p', 'bb-res',
          `Броенето до термина е приключено на <strong>${esc(рд.toLocaleDateString('bg-BG'))}</strong>. ` +
          `Всичко за ${esc(б.name) || 'бебето'} е в другите стаи. ` +
          `<br><small>Ако рождената дата е сбъркана, поправи я в „Моето бебе“.</small>`));
        root.appendChild(c0);
        return;
      }
    }
    // Б10.1: СЕДМИЦАТА НА СТАЯТА минава през вратаря BL_EXPECT.
    // При „пауза на очакването“ той връща '' — и всичко, което брои,
    // мълчи. Дотук term/ритания/контракции четяха bl_lmp НАПРАВО и
    // течаха покрай паузата — точно пред жената, която спря броенето.
    const датата20 = () => (window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', ''));
    const седмицаСега = () => {
      const l = датата20();
      if (!l) return 0;
      const d = new Date(l);
      if (isNaN(d)) return 0;
      return (window.BL_PREG ? BL_PREG.седмица(d) : Math.floor((Date.now() - d) / 604800000));
    };
    const наПауза = () => !!(window.BL_EXPECT && BL_EXPECT.paused());
    // ✍️ редна форма: пише се последната буква (или последните две) от думата —
    //    втора → 22-ра, седма → 27-ма, шеста → 26-та. Тук се лепеше '-та' на
    //    сляпо и жената в 28-а седмица четеше „28-та“, а базата (kb.js) пише
    //    „28-ма“ на 19 места — едно и също число, два правописа в едно приложение.
    const редна = n => {
      const е = n % 10, д = n % 100;
      if (д >= 11 && д <= 19) return n + '-та';
      return n + (е === 1 ? '-ва' : е === 2 ? '-ра' : (е === 7 || е === 8) ? '-ма' : '-та');
    };

    // 1. Калкулатор на термина + седмица
    // 🔴 04.08 (одит г01): онбордингът пита само за ОЧАКВАНАТА ДАТА и записва
    //    bl_lmp = ОДР − 280 дни. Тук същата дата ѝ се връщаше с етикет „първи
    //    ден на последната менструация“ — тоест приложението представяше своя
    //    сметка като НЕЙНИ думи. Ако тя „поправи“ на истинската си ПМ, цялата
    //    пътека и всички прегледи скачат с две седмици. Датата вече се нарича
    //    с това, което е: датата, по която броим.
    const c1 = card('Кога е терминът? 🗓️ <span class="jr-sub">по първия ден на цикъла — или изчислена от термина</span>');
    const lmpI = el('input', 'jr-word'); lmpI.type = 'date'; lmpI.max = today();
    lmpI.value = load('bl_lmp', '');
    const етикетДата = el('label', 'bb-lbl', 'Дата, по която броим (първи ден на цикъла или изчислена от термина):');
    c1.appendChild(етикетДата);
    c1.appendChild(lmpI);
    // Б2.4: датата е въведена → полето се сгъва в един ред „промени“
    if (lmpI.value && !наПауза()) {
      етикетДата.hidden = true; lmpI.hidden = true;
      const промени = el('button', 'jr-chip pg-edit', '✏️ Промени датата'); промени.type = 'button';
      промени.addEventListener('click', () => { етикетДата.hidden = false; lmpI.hidden = false; промени.remove(); });
      c1.appendChild(промени);
    }
    const out = el('div', 'pg-out'); c1.appendChild(out);
    function calc() {
      // 🤍 calc() се вика и при просто отваряне на стаята. Празното поле се
      //    записваше като низа "" — а той е ИСТИНА за localStorage. Оттам
      //    BL_EXPECT.has() почваше да лъже и на жена без дата изгряваше
      //    „спри тихо броенето до термина". Празно = нищо записано.
      // 🔴 11.08 (обиколка по картите, ИЗМЕРЕНО): датата се записваше ПРЕДИ да
      //    се провери. Сбъркана година (2027) влизаше в bl_lmp, картата казваше
      //    „Провери датата“ — а в СЪЩАТА стая „Пътеката на чакането“ просто
      //    изчезваше, защото смята по вече развалената дата. Тоест едно натискане
      //    по календарчето изтриваше карти, без нищо да свързва двете за мама.
      //    Сега невъзможната дата не тръгва към склада: тя си остава на екрана,
      //    старата стойност е непокътната и картата казва какво не е наред.
      //    Път назад: връщаш реда `if (lmpI.value) save(...)` най-отгоре.
      const празно = !lmpI.value;
      const lmp0 = new Date(lmpI.value);
      const дни0 = празно || isNaN(lmp0) ? null : Math.floor((Date.now() - lmp0) / 86400000);
      const сед0 = дни0 == null ? null : Math.floor(дни0 / 7);
      const годна = сед0 != null && сед0 >= 1 && сед0 <= 45;
      if (празно) { try { localStorage.removeItem('bl_lmp'); } catch (e) {} }
      else if (годна) save('bl_lmp', lmpI.value);
      // Б10.1: на пауза броенето мълчи — картата не смята нищо
      if (наПауза()) { out.innerHTML = ''; return; }
      const lmp = lmp0;
      if (празно || isNaN(lmp)) { out.innerHTML = ''; return; }
      const days = дни0;
      const week = сед0;
      if (!годна) {
        const запазена = load('bl_lmp', '');
        out.innerHTML = '<p class="bb-res">🗓️ По тази дата излиза, ' + (week < 1 ? 'че бременността още не е започнала' : 'че си в ' + week + '-та седмица') +
          ' — най-често е сбъркана годината. <strong>Не я записах</strong>, за да не разместя всичко останало.' +
          (запазена ? ' Датата, по която броя досега, си стои: <strong>' + esc(new Date(запазена).toLocaleDateString('bg-BG')) + '</strong>.' : '') +
          ' 💜</p>';
        return;
      }
      const edd = new Date(lmp.getTime() + 280 * 86400000);
      const left = Math.ceil((edd - Date.now()) / 86400000);
      const tri = week <= 13 ? 'първи' : week <= 27 ? 'втори' : 'трети';
      const fruit = D.pregWeeks[Math.min(42, Math.max(4, week))] || ['—', '·'];
      let noteKey = 4; Object.keys(D.pregNotes).map(Number).forEach(k => { if (k <= week) noteKey = k; });
      const note = D.pregNotes[noteKey];
      out.innerHTML =
        `<div class="pg-hero"><span class="pg-fruit">${fruit[1]}</span><div><div class="pg-week">Седмица <span data-cnt="${week}">${week}</span></div>` +
        `<div class="pg-sub">${tri} триместър · термин ${edd.toLocaleDateString('bg-BG')}</div></div></div>` +
        `<p class="pg-size">Бебето е горе-долу колкото <strong>${fruit[0]}</strong>.</p>` +
        `<div class="pg-note"><p>👶 <strong>Бебето:</strong> ${note.baby}</p><p>🌸 <strong>Ти:</strong> ${note.mama}</p><p>💡 <strong>Съвет:</strong> ${note.tip}</p></div>` +
        `<p class="pg-left">${left > 0 ? 'Остават около <strong><span data-cnt="' + left + '">' + left + '</span> дни</strong> 🎈' : 'Терминът мина — бебето идва всеки момент! 💜'}</p>`;
      if (window.BL_FX) BL_FX.countUp(out); // седмицата и дните отброяват
    }
    lmpI.addEventListener('change', calc); calc();
    // Б10.1: на пауза терминът не се показва изобщо — датата ѝ си стои
    // записана, но нищо не брои и нищо не пита. Връщането е в настройките.
    if (!наПауза()) root.appendChild(c1);

    // 2. Брояч на ритания
    const c2 = card('Брояч на ритания 👣 <span class="jr-sub">твоят ритъм — не чуждо число</span>');
    const kickBig = el('button', 'pg-kick', '👣<span>Ритна!</span>'); kickBig.type = 'button';
    const kickOut = el('p', 'bb-res', '');
    const kickHist = el('div', 'pg-kickhist', '');
    // проход 4 [24]: пръстен от 10 точици, който се пълни при всеки тап — кръг,
    // който расте, се чете с един поглед по-добре от число и дава напредък.
    const kickRing = el('div', 'pg-kickring', Array.from({ length: 10 }, (_, i) => `<span class="kd" data-i="${i}"></span>`).join(''));
    const светниПръстен = () => kickRing.querySelectorAll('.kd').forEach((d, i) => d.classList.toggle('on', i < kickCount));
    // проход 3 T12: декларацията беше изпаднала при рефакторинг → първият клик
    // на „Ритна!" при ≥26-та седмица хвърляше ReferenceError и броячът мълчеше.
    let kickCount = 0, kickStart = 0;
    // В1.4: сесиите се ПАЗЯТ. Досега kickCount живееше само на екрана —
    // мама брои 10 ритания, излиза от стаята и всичко изчезваше.
    function рисувайИстория() {
      const дни = load('bl_kicks', []);
      if (!дни.length) { kickHist.innerHTML = ''; return; }
      // проход 4: личната база — постоянството е смисълът на броенето. Само мека,
      // положителна рамка (по-бавно НЕ алармира с число — там пращаме към Вита).
      let средно = '';
      if (дни.length >= 3) {
        const m = дни.map(x => x.mins).filter(v => v > 0).sort((a, b) => a - b);
        const med = m[Math.floor(m.length / 2)];
        средно = `<p class="jr-privacy">Твоите десетки идват средно за ~<strong>${med}</strong> мин. Ако усетиш ясно по-малко движение от обичайното — питай Вита или лекаря. 💚</p>`;
      }
      kickHist.innerHTML = средно + '<p class="jr-weekcap">Последни десетки:</p>' + дни.slice(-5).reverse().map(x =>
        `<p class="nr-hrow">👣 10 за <strong>${x.mins} мин</strong> · ${new Date(x.ts).toLocaleDateString('bg-BG')} ${new Date(x.ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</p>`).join('');
    }
    const с2сед = седмицаСега();
    kickBig.addEventListener('click', () => {
      // В1.3: преди 26-та бутонът НЕ е мъртъв — превръща цъкането в спомен.
      // Мама е усетила нещо и е посегнала — това Е първото пърхане.
      if (с2сед > 0 && с2сед < 26) {
        // ⚖️ същата карта казваше „от ~26-та" на един ред и „редовно става към
        //    28-та" на друг. Държим ЕДНО число — 26-та, както е и гейтът горе
        //    и сгъването в preg20 — защото по-ранното броене е по-безопасната
        //    посока за жената, а не по-късното.
        const река = load('bl_river_manual', []);
        // 🪤 ЧАСОВИ ПОЯС 25.08 (ИЗМЕРЕНО, TZ=Europe/Sofia): `toISOString()` дава
        //    UTC. Между 00:00 и 02:59 ч. местно време той връща ВЧЕРАШНАТА дата
        //    (проверено: 26.08 00:30 → „2026-08-25“). Тоест нощният тап на мама
        //    се сверяваше с вчерашния ден: беше ли писала вечерта, пърхането след
        //    полунощ се преглъщаше като „вече го има днес“. `today()` в този файл
        //    брои по КАЛЕНДАРА ѝ — същия, по който се къса и серията.
        const днес = today();
        let вИсторията = река.some(x => x && x.пърхане === днес);
        if (!вИсторията) {
          река.push({ ts: Date.now(), e: '🫧', t: 'Първите пърхания — ' + редна(с2сед) + ' седмица', пърхане: днес });
          // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): „Записах го в Историята ви“ се
          //    печаташе ПРЕДИ записа и стоеше, дори когато той е паднал.
          вИсторията = save('bl_river_manual', река);
          if (вИсторията) fx().confetti(kickOut);
        }
        kickOut.innerHTML = 'Рано е за БРОЕНЕ (то тръгва към ~26-та) — но щом посягаш, значи го УСЕЩАШ. Това пърхане е злато ✨'
          + (вИсторията ? ' Записах го в Историята ви.' : '');
        kickBig.classList.add('pp'); setTimeout(() => kickBig.classList.remove('pp'), 500);
        return;
      }
      if (!kickCount) kickStart = Date.now();
      kickCount++;
      if (kickCount >= 10) {
        const mins = Math.round((Date.now() - kickStart) / 60000) || 1;
        // 🤍 тук стоеше „обикновено 10 усещаш за под 2 часа" — чуждо число без
        //    произход, което успокояваше точно жената, чиито десетки днес идват
        //    четири пъти по-бавно от обичайното ѝ. Сравнението със СОБСТВЕНАТА
        //    ѝ база е в рисувайИстория() и то е това, което значи нещо.
        // В1.4: десетката се записва — данните на мама значат нещо
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): празникът и НУЛИРАНЕТО на брояча
        //    идваха ПРЕДИ записа. При пълна памет тя виждаше „🎉 10 движения за
        //    X мин“, броячът падаше на нула, а десетката не влизаше никъде — час
        //    броене изчезваше. Сега първо записваме; падне ли, пръстенът ѝ остава
        //    пълен и може да опита пак, след като освободи място.
        const дни = load('bl_kicks', []);
        дни.push({ ts: Date.now(), mins });
        if (!save('bl_kicks', дни.slice(-40))) { kickCount = 10; return; }
        kickOut.innerHTML = `🎉 10 движения за <strong>${mins} мин</strong>! Браво, бебче.`;
        kickBig.querySelector('span').textContent = 'Отначало';
        светниПръстен();                          // всичките 10 светят за миг
        kickRing.classList.add('full'); setTimeout(() => kickRing.classList.remove('full'), 1200);
        kickCount = 0;
        рисувайИстория();
        fx().confetti(kickOut);                  // Б8.4: 10-то ритниче се празнува
      } else {
        kickOut.textContent = `${kickCount} / 10 движения…`;
        kickBig.querySelector('span').textContent = 'Ритна! (' + kickCount + ')';
        светниПръстен();
        if (window.BL_FX) BL_FX.buzz(6);   // проход 4: нежен тактилен цък (мама брои с очи затворени)
      }
      kickBig.classList.add('pp'); setTimeout(() => kickBig.classList.remove('pp'), 200);
    });
    if (с2сед > 0 && с2сед < 26) {
      kickOut.innerHTML = 'Броенето е за след <strong>~26-та седмица</strong> (ти си в ' + редна(с2сед) + '). Но усетиш ли пърхане — цъкни, ще го запомним като спомен. 🤍';
    }
    c2.appendChild(kickBig);
    if (с2сед === 0 || с2сед >= 26) c2.appendChild(kickRing);   // пръстенът само в режим на броене
    c2.appendChild(kickOut); c2.appendChild(kickHist);
    рисувайИстория();
    // 🤍 при раждане preg20 маха само bl_lmp. Пауза няма → досега родилата
    //    майка отваряше „Бременност" и я посрещаше броячът на ритания с
    //    дневника от последните ѝ дни. Няма жива дата — картите мълчат.
    //    Данните НЕ се трият (принципът на expect.js:10-11), само не се рисуват.
    if (!наПауза() && датата20()) root.appendChild(c2);   // Б10.1

    // 3. Брояч на контракции
    const c3 = card('Брояч на контракции ⏱️ <span class="jr-sub">правилото 5-1-1 те пази</span>');
    const conBtn = el('button', 'jr-btn', '▶ Започна контракция'); conBtn.type = 'button';
    const conOut = el('div', 'pg-contract', '');
    let conRunning = false, conStart = 0;
    // Б8.8: по време на контракция — дишащ кръг „вдишай… издишай“ (4-4).
    // Не е украса: воденото дишане реално помага през вълната.
    const дъх = el('div', 'pg-breath');
    дъх.setAttribute('aria-live', 'polite'); дъх.setAttribute('aria-label', 'дишане и брояч на контракцията');   // проход 4: озвучаване за незрящи
    // проход 3 T29: жива секунда-стрелка — правилото 5-1-1 иска контракции по ~1мин,
    // а без брояч раждащата няма как да прецени в реално време колко трае вълната.
    дъх.innerHTML = '<span class="pg-breath-c"></span><span class="pg-breath-t">вдишай…</span><span class="pg-breath-s"></span>';
    дъх.hidden = true;
    let дъхТик = null, секТик = null;
    // 🕛 започнатата вълна живееше САМО в екранни променливи. Раждащата отваря
    //    чата да пита нещо, стаята се пресъздава от нулата (helper.js) и вълната
    //    изчезва — а двата интервала остават да тикат върху откачен елемент.
    //    Сега стартът се пази в склада (както bl_nursing_open при кърменето),
    //    а всеки тик умира заедно с картата си.
    function сприТикове() { if (дъхТик) { clearInterval(дъхТик); дъхТик = null; } if (секТик) { clearInterval(секТик); секТик = null; } }
    function пусниВълна(t0) {
      conStart = t0; conRunning = true;
      conBtn.textContent = '⏹ Свърши контракция'; conBtn.classList.add('running');
      дъх.hidden = false;
      let вд = true;
      const надпис = дъх.querySelector('.pg-breath-t');
      const сек = дъх.querySelector('.pg-breath-s');
      сек.textContent = Math.round((Date.now() - conStart) / 1000) + ' с';   // смятаме от conStart → самокоригира се след заключен екран
      сприТикове();
      дъхТик = setInterval(() => { if (!дъх.isConnected) { сприТикове(); return; } вд = !вд; надпис.textContent = вд ? 'вдишай…' : 'издишай…'; }, 4000);
      секТик = setInterval(() => { if (!дъх.isConnected) { сприТикове(); return; } сек.textContent = Math.round((Date.now() - conStart) / 1000) + ' с'; }, 1000);
    }
    conBtn.addEventListener('click', () => {
      const log = load('bl_contract', []);
      if (!conRunning) {
        if (window.BL_FX) BL_FX.buzz(12);   // проход 4: раждащата засича вълните през болка — да ЗНАЕ, че е регистрирано
        пусниВълна(Date.now());
        save('bl_contract_open', { t0: conStart });
      }
      else {
        conRunning = false; conBtn.textContent = '▶ Започна контракция'; conBtn.classList.remove('running');
        if (window.BL_FX) BL_FX.buzz(12);   // проход 4: край на вълната — тактилно потвърждение
        дъх.hidden = true; сприТикове();
        try { localStorage.removeItem('bl_contract_open'); } catch (e) {}
        const dur = Math.round((Date.now() - conStart) / 1000);
        const prev = log.length ? log[log.length - 1].start : null;
        const interval = prev ? Math.round((conStart - prev) / 60000) : null;
        log.push({ start: conStart, dur, interval });
        save('bl_contract', log.slice(-12));
        drawCon();
      }
    });
    function drawCon() {
      const log = load('bl_contract', []);
      if (!log.length) { conOut.innerHTML = '<p class="jr-privacy">Натисни при започване и при спиране на всяка контракция.</p>'; return; }
      const last3 = log.slice(-3);
      const avgInt = last3.filter(x => x.interval).reduce((a, x, _, arr) => a + x.interval / arr.length, 0);
      const avgDur = last3.reduce((a, x) => a + x.dur / last3.length, 0);
      let rows = log.slice(-5).reverse().map(x =>
        `<div class="bb-histrow"><span>${new Date(x.start).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span><span>${x.dur}с</span><span>${x.interval ? 'през ' + x.interval + ' мин' : 'първа'}</span></div>`).join('');
      let alert = '';
      // Б1.2: правилото 5-1-1 е за ТЕРМИНА. Преди 37-ма седмица редовните
      // контракции са друга история — там не се чака 5-1-1, а се звъни.
      const сег = седмицаСега();
      if (сег > 0 && сег < 37 && log.length >= 3 && avgInt && avgInt <= 12) {
        alert = '<p class="pg-alarm">🚨 Редовни контракции преди <strong>37-ма седмица</strong> са повод да звъннеш на лекаря си <strong>СЕГА</strong> — не изчаквай 5-1-1.<br><a class="ro-sos" href="tel:112">📞 112 при силна болка/кървене</a></p>';
      } else if (avgInt && avgInt <= 5 && avgDur >= 45) {
        // ⏱️ това се палеше след ТРИ засечени вълни — тоест около 10-15 минути
        //    наблюдение — а текстът твърдеше „по ~1 мин, от известно време",
        //    докато прагът е 45 секунди. Правилото 5-1-1 иска цял ЧАС. Текстът
        //    вече казва точно каквото е измерено, без да я праща напразно.
        //    ⏱️ 05.08 (скептик): „около 5 минути" беше пак чуждо число — прагът е
        //    „5 или по-малко", а при измерени 2 минути текстът звучеше по-спокойно
        //    от истината. Числото идва от НЕЙНИТЕ вълни.
        const инт = Math.max(1, Math.round(avgInt));
        alert = '<p class="pg-alarm">⏱️ Стяганията ти вече се редят на около <strong>' + инт + (инт === 1 ? ' минута' : ' минути') + '</strong>. Засичай още — правилото 5-1-1 гледа цял час — и се обади на екипа си, за да знаят кога да те чакат. При изтекли води, кървене или ако усещаш, че е време: тръгвай, не чакай брояча.</p>';
      }
      conOut.innerHTML = alert + rows;
    }
    // Б1.2: и ПРЕДИ първото броене жената в 22-ра трябва да знае правилото
    const сегК = седмицаСега();
    if (сегК > 0 && сегК < 37) {
      c3.appendChild(el('p', 'jr-privacy pg-preterm',
        '⚠️ Ти си в ' + редна(сегК) + ' седмица. Редовни контракции <strong>преди 37-ма</strong> не се броят по 5-1-1 — звънни на лекаря си веднага.'));
    }
    c3.appendChild(conBtn); c3.appendChild(дъх); c3.appendChild(conOut); drawCon();
    if (!наПауза() && датата20()) root.appendChild(c3);   // Б10.1 + жива дата
    // връщане в стаята посред вълна: намираме я, където я оставихме.
    // Над час е забравено копче, не контракция — маркерът пада, дневникът остава.
    const отворена = load('bl_contract_open', null);
    if (отворена && отворена.t0 && дъх.isConnected && Date.now() - отворена.t0 < 3600000) пусниВълна(отворена.t0);
    else if (отворена) { try { localStorage.removeItem('bl_contract_open'); } catch (e) {} }

    // 4. Чанта за болницата
    // 🤍 29.07 (обиколка): чантата беше ИЗВЪН пазачите — жена след загуба я
    //    виждаше с лентата „🎉 Чантата е готова. Сега само чакаме него.“
    if (!наПауза() && датата20()) root.appendChild(checklistCard('Чанта за родилния дом 🧳', 'bl_bag_hospital', [
      'Документи: лична карта, здравна книжка, изследвания', 'Нощници с копчета отпред + халат + чехли',
      'Тоалетни принадлежности', 'Дълги дамски превръзки (следродилни)', 'Удобни памучни бикини (тъмни)',
      'Сутиени за кърмене + подплънки', 'Дрешки за бебето (бодита, ританки, шапчица)',
      'Пелени за новородено + мокри кърпички', 'Одеялце за изписване', 'Зарядно с ДЪЛЪГ кабел + лека храна'
    ]));
  }

  // ═══════════════ 🥄 ЗАХРАНВАНЕ (Малина) ═══════════════

  function renderFeeding(root) {
    // 1. Готови ли сме
    root.appendChild(checklistCard('Готови ли сме за захранване? ✅', 'bl_ready', [
      'Бебето е около 6-месечно', 'Седи стабилно с малко опора', 'Държи главата си уверено',
      'Гледа лакомо как ядете и посяга', 'Изчезнал е рефлексът да избутва с езиче'
    ]));

    // 2. Календар на храните
    const c2 = card('Календар на храните 🍓 <span class="jr-sub">кое кога и как се дава</span>');
    const a = ageFromBirth(getBaby().birth);
    const filterRow = el('div', 'jr-quick fd-filter');
    const cats = ['Всички', 'Зеленчук', 'Плод', 'Белтъчини', 'Зърнени', 'Млечни', 'Алергени', 'Мои'];
    // 🔴 11.08 капанът на снимката (виж картата-бележник): това е СНИМКА при
    //    рисуване. Опреснява се във всяко рисуване и се чете ПРЯСНО преди запис.
    let tried = load('bl_tried', {});
    // 🟠 11.08 (обиколка „редки състояния“): Math.round важеше и за недоносено.
    //    При 2.63 коригирани месеца филтърът казваше „подходящи за 3 месеца
    //    (коригирани)“, докато картата в „Моето бебе“ на същия ден казва
    //    „Коригирана възраст: 2 месеца“ (там е floor). Едно и също дете, две
    //    числа, две стаи. За недоносено броим НАВЪРШЕНИ (floor) — така съвпада
    //    с другата карта и никога не бута храна по-рано. За доносено остава
    //    Math.round: floor го сваляше на 5 при 5.95 и „време за първи вкусове“
    //    закъсняваше с дни (виж същата бележка в roomhero.js).
    let curCat = 'Всички', ageCap = a ? (a.corr ? Math.floor(a.devMonths) : Math.round(a.devMonths)) : 12;
    const grid = el('div', 'fd-grid');
    cats.forEach(cat => {
      const b = el('button', 'jr-chip' + (cat === 'Всички' ? ' on' : ''), cat); b.type = 'button';
      b.addEventListener('click', () => { filterRow.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); curCat = cat; draw(); });
      filterRow.appendChild(b);
    });
    c2.appendChild(filterRow);
    const ageNote = el('p', 'fd-agenote', ''); c2.appendChild(ageNote);
    c2.appendChild(grid);
    function draw() {
      tried = load('bl_tried', {});   // пресен прочит при всяко рисуване
      // ageCap е devMonths = КОРИГИРАНАТА възраст (недоносени). Беше сметната и
      // забравена, а филтърът ползваше календарната — точно за най-уплашената
      // група показваше храни твърде рано (одит-флот П23, проход 2 №5).
      ageNote.innerHTML = curCat === 'Мои'
        ? 'Твоите храни — показвам ги всичките, дори записаните за по-нататък. С ✕ се махат.'
        // 🟡 12.08 (единиците): за бебе на четири месеца и половина ageCap е 4 и
        //    редът е верен, но за първия месец от захранването излизаше
        //    „подходящи за 1 месеца (коригирани)“ — и „коригирани“ виси в
        //    множествено число до едно.
        : (a ? `Показвам подходящи за <strong>${window.BL_BROI ? BL_BROI(ageCap, 'месец', 'месеца') : ageCap + ' ' + (ageCap === 1 ? 'месец' : 'месеца')}${a.corr ? (ageCap === 1 ? ' (коригиран)' : ' (коригирани)') : ''}</strong> (и по-рано). Задай рождена дата в „Моето бебе“ за прецизност.` : 'Показвам всички. Задай рождена дата в „Моето бебе“ за филтър по възраст.');
      grid.innerHTML = '';
      const allFoods = D.foods.concat(load('bl_custom_foods', []));
      // „Алергени" маркерът е f.alrg (⚠️), не категория — старият f.cat==='Алергени'
      // хващаше 1 храна (одит-флот П23, проход 2 №4)
      // ✕ 05.08 (скептик, nr 210): под чипа „Мои" възрастовият филтър НЕ важи.
      //    Иначе собственият ѝ запис („Мед · от 12 м.", записан от майка с
      //    новородено) изчезва от мрежата и кошчето става недостижимо чак до
      //    годинката — тоест еднопосочната врата остава отворена точно за
      //    случая, който я откри. Календарът по възраст („Всички" и
      //    категориите) си остава непокътнат — там нищо не изгрява по-рано.
      allFoods.filter(f => f && (curCat === 'Всички' || (curCat === 'Алергени' ? !!f.alrg : f.cat === curCat)) && (curCat === 'Мои' || !a || f.from <= ageCap + 0.5))
        .forEach(f => {
          const done = tried[f.n];
          const cardE = el('button', 'fd-card' + (done ? ' tried' : ''));
          cardE.type = 'button';
          // 🔒 22.07 (армия, RED): в този списък влизат и храните, които МАМА
          // сама е добавила („Добави своя храна“ → bl_custom_foods) — тоест
          // нейн свободен текст, който досега влизаше суров в innerHTML.
          // Името и начинът на поднасяне минават през esc().
          cardE.innerHTML = `<span class="fd-emoji">${esc(f.e)}</span><span class="fd-name">${esc(f.n)}${f.alrg ? ' ⚠️' : ''}</span>` +
            `<span class="fd-from">от ${esc(f.from)} м.</span><span class="fd-how">${esc(f.how)}</span>` +
            (done ? `<span class="fd-badge">${esc(done)}</span>` : '<span class="fd-tap">докосни: опитахме!</span>');
          cardE.addEventListener('click', () => cycleTried(f.n, cardE));
          // ✕ 05.08: „Добави своя храна" беше еднопосочна врата — сгрешено име
          //    („Тиквичкаа") оставаше в календара и в дневника за педиатъра
          //    завинаги. Кошчето е само на нейните записи, жестът е като в
          //    obichai.js. Официалните храни не се трият.
          if (f.cat === 'Мои') {
            const wrap = el('div', 'fd-wrap');
            const del = el('button', 'fd-del', '✕'); del.type = 'button';
            del.setAttribute('aria-label', 'Махни „' + f.n + '“ от моите храни');
            del.addEventListener('click', () => {
              const махни = () => {
                // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): при паднал запис храната
                //    си оставаше, но кодът продължаваше и чистеше пробването и
                //    датата ѝ — оставаше „Тиквичкаа“ БЕЗ историята си.
                if (!save('bl_custom_foods', load('bl_custom_foods', []).filter(x => !x || x.n !== f.n))) { draw(); drawTried(); return; }
                tried = load('bl_tried', {});   // пресен прочит ПРЕДИ записа
                if (tried[f.n] != null) { delete tried[f.n]; save('bl_tried', tried); }
                const td = load('bl_tried_d', {});
                if (td[f.n] != null) { delete td[f.n]; save('bl_tried_d', td); }
                draw(); drawTried();
              };
              if (window.BL_UI && BL_UI.confirm) BL_UI.confirm('Да махна ли „' + f.n + '“ от твоите храни?', { okText: 'Махни', danger: true }).then(да => { if (да) махни(); });
              else махни();
            });
            wrap.appendChild(cardE); wrap.appendChild(del);
            grid.appendChild(wrap);
          } else grid.appendChild(cardE);
        });
      if (!grid.children.length) grid.appendChild(el('p', 'jr-privacy', 'За тази възраст още няма храни в списъка.'));
    }
    const REACT = ['😋 хареса', '😐 неутрално', '🤢 отказа', '⚠️ реакция'];
    function cycleTried(name, cardE) {
      tried = load('bl_tried', {});   // пресен прочит ПРЕДИ записа
      const cur = tried[name];
      // проход 4: първият вкус на нова храна е истински милестоун — празнува се като зъбче.
      if (!cur && window.BL_FX) { BL_FX.confetti(cardE, 16); BL_FX.buzz(14); }
      const idx = cur ? (REACT.indexOf(cur) + 1) % (REACT.length + 1) : 0;
      if (idx >= REACT.length) delete tried[name]; else tried[name] = REACT[idx];
      save('bl_tried', tried); draw();
      drawTried();   // дневникът долу се опреснява НА ЖИВО (проход 2 №3)
      const td = load('bl_tried_d', {}); // датата тръгва към Реката
      if (tried[name]) { if (!td[name]) { td[name] = Date.now(); save('bl_tried_d', td); } }
      // 🥄 обиколката до края („докосни: опитахме!") чистеше реакцията, но
      //    датата оставаше и в Реката завинаги стоеше „🥄 Опитахме Ягода" с
      //    празно място отзад — спомен за нещо, което не се е случило.
      else if (td[name]) { delete td[name]; save('bl_tried_d', td); }
      // 🛡️ 11.08: „Алергия-паспорт“ (rooms3.js) чете bl_tried и е в СЪЩАТА стая.
      //    Без известие тя маркираше „⚠️ реакция“ горе, а паспортът долу още
      //    твърдеше „нищо записано“ до следващото влизане в стаята.
      try { document.dispatchEvent(new CustomEvent('bl:tried-changed')); } catch (e) {}
      // (тук стоеше cardE.classList.add('pp') — мъртъв код: draw() по-горе вече
      //  е пресъздал всички картички и cardE е откачен от документа.)
    }
    draw();
    root.appendChild(c2);

    // 3. Опитани + алергени
    const c3 = card('Дневник на опитаното 📓 <span class="jr-sub">готов за консултацията с педиатъра</span>');
    const triedOut = el('div', 'fd-triedlist'); c3.appendChild(triedOut);
    function drawTried() {
      const keys = Object.keys(load('bl_tried', {}));
      const tr = load('bl_tried', {});
      triedOut.innerHTML = keys.length
        ? keys.map(k => `<span class="fd-pill">${esc(k)}: ${esc(tr[k])}</span>`).join('')
        : '<p class="jr-privacy">Отбележи храни горе с докосване — реакциите се събират тук.</p>';
    }
    drawTried();
    // preview refresh: re-draw on room re-entry is enough; keep simple
    root.appendChild(c3);

    // одит-флот П23, проход 2: статичната „8-те големи алергена" беше дубликат
    // на интерактивната „Алергените 🥜" (rooms8.js) в СЪЩАТА стая — същите 8
    // алергена + същото правило „сутрин · после 3 дни" + същото 112. Махната;
    // интерактивната е функционален надмножество (проследява кое си въвела).

    // 5. Добави своя храна (къстъм!)
    const c5 = card('Добави своя храна ➕ <span class="jr-sub">твоят календар, твоите храни</span>');
    const nameI2 = el('input', 'jr-word'); nameI2.type = 'text'; nameI2.maxLength = 30; nameI2.placeholder = 'Име на храната… (напр. „Дюля“)';
    const monI = el('input', 'jr-word'); monI.type = 'number'; monI.min = 4; monI.max = 24; monI.placeholder = 'От кой месец…';
    const howI = el('input', 'jr-word'); howI.type = 'text'; howI.maxLength = 90; howI.placeholder = 'Как се поднася… (по желание)';
    // ⚠️ 05.08: формата нямаше отметка за алерген, а записът тръгваше със
    //    заковано alrg:false. „Фъстъчен тахан" излизаше чист, без ⚠️, и не
    //    влизаше във филтъра „Алергени" — все едно приложението го е проверило.
    const alrgL = el('label', 'fd-alrgchk', '');
    const alrgI = el('input'); alrgI.type = 'checkbox';
    alrgL.appendChild(alrgI);
    alrgL.appendChild(el('span', '', ' ⚠️ Това е алерген (яйце, краве мляко, ядки, фъстък, риба, соя, пшеница, сусам)'));
    const бележка5 = el('p', 'jr-privacy fd-rule', ''); бележка5.hidden = true;
    // 🔒 замразените правила важат и за храна, която мама сама си пише — иначе
    //    „🏠 Мед · от 4 м." застава до тиквичката все едно приложението го
    //    препоръчва, докато същото приложение другаде държи обратното.
    const ЗАМРАЗЕНИ = [
      { д: ['мед'], от: 12, т: 'Мед не се дава преди навършена 1 година — никога, дори капчица. Записах го от 12-ия месец.' },
      { д: ['сол'], от: 12, т: 'Сол не се добавя преди годинката — бъбречетата още не я поемат. Записах го от 12-ия месец.' },
      { д: ['захар'], от: 12, т: 'Захар не се добавя преди годинката. Записах го от 12-ия месец.' },
      { д: ['краве мляко', 'прясно мляко'], от: 12, т: 'Краве мляко за ПИЕНЕ е след годинката (в готвено ястие може по-рано). Записах го от 12-ия месец.' },
      { д: ['вода'], от: 6, т: 'Вода преди 6 месеца не се дава — млякото стига напълно. Записах я от 6-ия месец.' }
    ];
    const addB = el('button', 'jr-btn', 'Добави в календара 🍽️'); addB.type = 'button';
    addB.addEventListener('click', () => {
      const n = nameI2.value.trim();
      // 🔴 11.08 (обиколка по картите): без име бутонът мълчеше — нито дума,
      //    нито мигване. Мама, която е попълнила само месеца, не разбира защо.
      if (!n) {
        бележка5.textContent = '✍️ Кажи ми първо как се казва храната — месецът и начинът са по желание.';
        бележка5.hidden = false; nameI2.focus();
        return;
      }
      const cf = load('bl_custom_foods', []);
      // min/max в HTML не важат за ръчно напечатано число: „-3“ минаваше и
      //    картата излизаше „от -3 м.“
      const мСурово = parseInt(monI.value);
      let m = isNaN(мСурово) ? 6 : мСурово;
      m = Math.min(24, Math.max(4, m));
      // 🟠 11.08 (измерено): „-3“ ставаше тихо на 4, „40“ — на 24. Числото на
      //    мама се сменяше без нито дума и тя научаваше чак като види картата.
      const поправено = !isNaN(мСурово) && мСурово !== m
        ? '💛 Записах „от ' + m + ' м.“ — „' + мСурово + '“ е извън месеците, в които изобщо се захранва (4–24). '
        : '';
      const ниско = n.toLowerCase();
      if (D.foods.concat(cf).some(x => x && String(x.n).trim().toLowerCase() === ниско)) {
        бележка5.textContent = '💛 „' + n + '“ вече е в календара — не я записвам втори път, за да не се раздвои дневникът ти.';
        бележка5.hidden = false;
        return;
      }
      let правило = null;
      ЗАМРАЗЕНИ.forEach(з => { if (!правило && з.д.some(x => ниско.includes(x)) && m < з.от) правило = з; });
      if (правило) { m = правило.от; бележка5.textContent = '💛 ' + правило.т; бележка5.hidden = false; }
      else if (поправено) { бележка5.textContent = поправено; бележка5.hidden = false; }
      else бележка5.hidden = true;
      cf.push({ n, e: '🏠', from: m, cat: 'Мои', alrg: alrgI.checked, how: howI.value.trim() || 'Добавена от теб.' });
      // 🔴 25.08 (ИЗМЕРЕНО): при пълна памет трите полета се изчистваха и
      //    викачът обявяваше „„X“ е в календара! 🍽️“ — а храната я нямаше
      //    никъде. Полетата се чистят СЛЕД записа, не преди.
      if (!save('bl_custom_foods', cf)) {
        бележка5.textContent = ПЪЛНА;
        бележка5.hidden = false;
        return;
      }
      nameI2.value = ''; monI.value = ''; howI.value = ''; alrgI.checked = false;
      // 🍽️ банерът казваше „в календара!“ и когато записът не се вижда никъде —
      //    скрит от активен чип или от възрастовия филтър. Отваряме „Мои“ и,
      //    ако още е рано, го казваме честно.
      curCat = 'Мои';
      filterRow.querySelectorAll('.jr-chip').forEach(x => x.classList.toggle('on', x.textContent === 'Мои'));
      draw();
      const рано = !!a && m > ageCap + 0.5;
      if (window.BL_FX) {
        BL_FX.buzz(12);
        BL_FX.cheer(рано ? '„' + n + '“ е записана за ' + m + ' м. Стои при „Мои“; в календара по възраст влиза, когато дойде времето. 🍽️' : '„' + n + '“ е в календара! 🍽️');
      }
    });
    c5.appendChild(nameI2); c5.appendChild(monI); c5.appendChild(howI); c5.appendChild(alrgL); c5.appendChild(addB); c5.appendChild(бележка5);
    root.appendChild(c5);
  }

  // ═══════════════ 🧸 РАЗВИТИЕ И ИГРИ (Искра) ═══════════════

  function renderDevelopment(root) {
    const a = ageFromBirth(getBaby().birth);

    // 🤰 05.08: без рождена дата стаята рисуваше `ms[4]` — тоест ШЕСТИЯ месец —
    //    и слагаше отдолу праговия флаг за него. Редовете са бутони: жена в
    //    8-ма седмица можеше да отметне „социална усмивка" и в bl_ms_d да
    //    легне дата за несъществуващо бебе. Стаята се събужда с раждането.
    if (!a && window.BL_EXPECT && BL_EXPECT.lmp && BL_EXPECT.lmp()) {
      const c0 = card('Тук ще е неговото развитие 🧸');
      c0.appendChild(el('p', 'jr-privacy', 'Стаята се събужда с раждането. Тогава заедно ще пълним първите усмивки, обръщания и стъпки — и нищо от тях няма да се загуби. Дотогава няма какво да отмяташ. 💜'));
      root.appendChild(c0);
      return;
    }

    // 1. Етапи за възрастта
    const c1 = card('Какво умее сега? 📈 <span class="jr-sub">прозорците са ШИРОКИ — не е състезание</span>');
    const ms = D.milestones;
    // 🤍 05.08 (скептик, №207 докрай): пазачът горе хващаше само БРЕМЕННАТА.
    //    Мама без попълнена рождена дата (нова, или изтрила я) пак получаваше
    //    ШЕСТИЯ месец като „сега“ — с бутони, които пишат в bl_ms_done и
    //    bl_ms_d, и с праговия флаг „👀 …питай лекаря“ към чужд месец. Без
    //    дата няма „сега“: казваме го и не даваме какво да се отмята.
    if (!a) {
      c1.appendChild(el('p', 'jr-privacy', 'Кажи ми рождената дата в „Моето бебе“ и тук ще застанат неговите месеци — с това, което обикновено се случва точно тогава. Без нея бих ти показала чужди, а прозорците са широки и сравнението не помага на никого. 💜'));
      root.appendChild(c1);
    } else {
    const pick = ms.reduce((best, x) => Math.abs(x.m - a.devMonths) < Math.abs(best.m - a.devMonths) ? x : best, ms[0]);
    const done = load('bl_ms_done', {});
    const rows = [['motor', '🤸 Едро моторно'], ['fine', '✋ Фино моторно'], ['speech', '🗣️ Говор'], ['social', '💛 Социално']];
    const msBox = el('div', 'dv-ms');
    msBox.innerHTML = `<p class="dv-mstitle">Около ${pick.m}-ия месец:</p>`;
    rows.forEach(([k, lbl]) => {
      const id = pick.m + '_' + k;
      const r = el('button', 'dv-msrow' + (done[id] ? ' done' : ''));
      r.type = 'button';
      r.innerHTML = `<span class="jr-check">${done[id] ? '✔' : ''}</span><span class="dv-mslbl">${lbl}</span><span class="dv-mstxt">${pick[k]}</span>`;
      r.addEventListener('click', () => {
        // 🔴 г07/59 (огледално на dev.js:209): махнеш ли отметката, датата в
        //    bl_ms_d оставаше. Дървото забравяше умението, а Витрината, Реката
        //    и хапчето на банера продължаваха да го броят. Изключването чисти
        //    и датата.
        //    Четем bl_ms_done ПРЯСНО (както dev.js): картата с диапазоните
        //    (rooms17.js) стои в СЪЩАТА стая и също пише в него — копието от
        //    рисуването щеше да залее нейния запис.
        const d = load('bl_ms_done', {});
        d[id] = !d[id];
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): отметката се рисуваше и без запис —
        //    Дървото, Реката и Витрината после не я знаеха, а екранът я показваше.
        if (!save('bl_ms_done', d)) return;
        // 🔴 25.08: знакът на екрана принадлежи на ЗАПИСА ОТГОРЕ, който е
        //    проверен — затова се рисува ВЕДНАГА след него. Датата долу е
        //    добавка за Реката и Дървото; падне ли САМО тя, отметката пак е
        //    вярна, а модалът от save() казва, че нещо не е влязло.
        r.classList.toggle('done'); r.querySelector('.jr-check').textContent = d[id] ? '✔' : '';
        const md = load('bl_ms_d', {});
        if (d[id]) { if (!md[id]) md[id] = Date.now(); } else { delete md[id]; } // за Реката и Дървото
        save('bl_ms_d', md);
      });
      msBox.appendChild(r);
    });
    let flag = ''; Object.keys(D.milestoneFlags).map(Number).forEach(fk => { if (pick.m >= fk) flag = D.milestoneFlags[fk]; });
    if (flag) msBox.appendChild(el('p', 'dv-flag', '👀 ' + flag));
    c1.appendChild(msBox);
    root.appendChild(c1);
    }

    // 2. Какво да правим днес
    const c2 = card('Какво да правим днес? ✨ <span class="jr-sub">завърти вълшебния бутон</span>');
    const needRow = el('div', 'jr-quick');
    let need = 'всичко';
    [['всичко', '🎲 Каквото и да е'], ['нищо', '🙌 Нищо специално'], ['кухня', '🍳 Кухненски неща'], ['хартия', '📄 Хартия'], ['плат', '🧻 Платчета']].forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip' + (v === 'всичко' ? ' on' : ''), lbl); b.type = 'button';
      b.addEventListener('click', () => { needRow.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); need = v; });
      needRow.appendChild(b);
    });
    c2.appendChild(needRow);
    const spin = el('button', 'jr-btn', '🎡 Дай ни идея!'); spin.type = 'button';
    c2.appendChild(spin);
    const actOut = el('div', 'dv-act', ''); c2.appendChild(actOut);
    spin.addEventListener('click', () => {
      const am = a ? a.devMonths : 8;
      let pool = D.activities.filter(x => am >= x.a0 && am <= x.a1 && (need === 'всичко' || x.need === need));
      if (!pool.length) pool = D.activities.filter(x => need === 'всичко' || x.need === need);
      if (!pool.length) pool = D.activities;
      const act = pool[Math.floor(Math.random() * pool.length)];
      actOut.innerHTML = `<div class="dv-actcard"><h5>${act.t}</h5><p>${act.x}</p></div>`;
      actOut.firstChild.classList.add('pop');
    });
    root.appendChild(c2);

    // 3. Първите пъти
    const firsts = ['😊 Първа усмивка', '🙃 Първо обръщане', '🦷 Първо зъбче', '🪑 Първо сядане', '🚼 Първо пълзене', '🗣️ Първа дума', '👣 Първа стъпка'];
    // 🔴 11.08 СЪЩИЯТ КАПАН като при картата-бележник: това е СНИМКА на обекта
    //    в мига на рисуване. Стаята може да е нарисувана два пъти (главен
    //    изглед + скрит панел) — тогава втората карта записва своята стара
    //    снимка отгоре и трие първото отбелязано „първо нещо". Долу, при
    //    самия запис, четем ПРЯСНО и пипаме само своя ключ.
    const fdata = load('bl_firsts', {});
    const c3 = card('Първите пъти 🌟 <span class="jr-sub">злато за спомените</span>');
    const fBox = el('div', 'dv-firsts');
    // 🔴 11.08 (обиколка по картите, ИЗМЕРЕНО): полето приемаше 2020 г. за
    //    „първа стъпка“ и 2030 г. за „първа усмивка“ — с конфети и вик „Първа
    //    усмивка! 🎉“ за ден, който не се е случил. max= не спира писането на
    //    ръка, а тези дати после излизат в Реката и Витрината като спомени.
    //    Проверяваме двете граници: не преди раждането, не в бъдещето.
    const рожден = (() => { const b = getBaby().birth; const d = b ? new Date(b) : null; return (d && !isNaN(d)) ? d : null; })();
    const бележкаД = el('p', 'jr-hint', ''); бележкаД.hidden = true;
    бележкаД.setAttribute('aria-live', 'polite');
    if (рожден) fBox.setAttribute('data-birth', getBaby().birth);
    firsts.forEach(f => {
      const row = el('div', 'dv-firstrow');
      const lbl = el('span', 'dv-firstlbl', f);
      const di = el('input', 'jr-word'); di.type = 'date'; di.max = today(); di.value = fdata[f] || '';
      if (рожден) di.min = getBaby().birth;
      di.style.minHeight = '44px';   // 📱 измерено 37px
      // ♿ 11.08 (клавиатура-четец): етикетът стои в съседен <span>, който не сочи
      //    към полето — четецът редеше седем пъти „поле за дата" едно след друго.
      di.setAttribute('aria-label', 'Дата: ' + f);
      di.addEventListener('change', () => {
        if (!di.value) { const сега = load('bl_firsts', {}); delete сега[f]; save('bl_firsts', сега); delete fdata[f]; бележкаД.hidden = true; return; }
        const d = new Date(di.value);
        const днес0 = new Date(); днес0.setHours(23, 59, 59, 999);
        if (isNaN(d) || d > днес0) {
          бележкаД.textContent = '🗓️ Тази дата още не е дошла — спомените се пишат, след като са се случили. Провери годината. 💜';
          бележкаД.hidden = false; di.value = fdata[f] || ''; return;
        }
        if (рожден && d < рожден) {
          бележкаД.textContent = '🗓️ Тази дата е преди рождения ден — най-често е сбъркана годината. Ако рождената дата в „Моето бебе“ не е вярна, поправи първо нея. 💜';
          бележкаД.hidden = false; di.value = fdata[f] || ''; return;
        }
        бележкаД.hidden = true;
        const сега = load('bl_firsts', {});   // пресен прочит ПРЕДИ записа
        сега[f] = di.value;
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): конфетите и „Първа усмивка! 🎉“
        //    идваха, а датата не влизаше в паметта. Полето за дата задържа
        //    показаното, така че мама нямаше как да усети, че го няма.
        //    Датата ѝ ОСТАВА в полето (за разлика от двете проверки горе, където
        //    самата дата е сгрешена) — тук няма какво да се поправя, само място.
        if (!save('bl_firsts', сега)) return;
        fdata[f] = di.value;
        row.classList.add('pp'); setTimeout(() => row.classList.remove('pp'), 400);
        if (window.BL_FX) { BL_FX.confetti(row); BL_FX.cheer(f.replace(/^\S+\s/, '') + '! 🎉'); }
      });
      row.appendChild(lbl); row.appendChild(di);
      fBox.appendChild(row);
    });
    c3.appendChild(fBox);
    c3.appendChild(бележкаД);
    root.appendChild(c3);
  }

  // ═══════════════ 🛠️ ИНСТРУМЕНТИ (Дара) ═══════════════

  function renderTools(root) {
    // 1. Размери дрешки
    const c1 = card('Размер на дрешки 📏 <span class="jr-sub">по възраст (или по ръст)</span>');
    const sizes = [[0, '50–56'], [1, '56'], [2, '62'], [4, '68'], [6, '74'], [9, '80'], [12, '86'], [18, '92'], [24, '98']];
    const mI = el('input', 'jr-word'); mI.type = 'number'; mI.min = 0; mI.max = 36; mI.placeholder = 'Възраст в месеци…';
    const a = ageFromBirth(getBaby().birth); if (a) mI.value = Math.round(a.devMonths); // М1: коригирана
    c1.appendChild(mI);
    const sOut = el('p', 'bb-res', '');
    function sizeFor(m) { let s = sizes[0][1]; sizes.forEach(([mm, ss]) => { if (m >= mm) s = ss; }); return s; }
    // 🟠 11.08 (измерено): „-5“ даваше размер 50–56, „999“ — размер 98. Числото
    //    беше извън всякакъв смисъл, а картата пак отговаряше уверено.
    function calcSize() {
      const m = parseInt(mI.value);
      if (isNaN(m)) { sOut.innerHTML = ''; return; }
      if (m < 0 || m > 36) { sOut.innerHTML = 'Тази табелка стига до <strong>36 месеца</strong> — напиши възраст между 0 и 36. 💜'; return; }
      sOut.innerHTML = `Ориентировъчно размер <strong>${sizeFor(m)}</strong>. Бебешките номера са ръст в см — взимай с размер напред за подаръци.`;
    }
    mI.addEventListener('input', calcSize); calcSize();
    c1.appendChild(sOut);
    root.appendChild(c1);

    // 2. Бебешки бюджет
    const c2 = card('Бебешки бюджет 💰 <span class="jr-sub">честно и успокояващо</span>');
    // 💰 05.08: подразбирането беше {pel:80, other:60} и на празна памет
    //    картата посрещаше жената, която тъкмо смята дали ще се справи, с
    //    „~1680 лв за първата година“ — сметка, изречена като нейна, от числа,
    //    които никой не я е питал. Полетата тръгват празни; сборът идва след
    //    първото ѝ число.
    // 🔴 11.08 капанът на снимката: прочетено при рисуване, записвано при
    //    писане в полето. Долу се чете ПРЯСНО преди всеки запис.
    let b = load('bl_budget', {});
    const fields = [['pel', 'Пелени / месец', 'напр. 80'], ['milk', 'Адаптирано мляко / месец', 'при кърмене — 0'], ['other', 'Други (дрешки, хигиена…)', 'напр. 60']];
    fields.forEach(([k, lbl, ph]) => {
      // 💰 клас bg-row, не sos-row: mega.css:418 .sos-row е редът-контакт от
      //    спешната карта (бяла кутия, розово-червена рамка, cursor:pointer) и
      //    бие rooms.css при равна специфичност — езикът на тревогата стоеше
      //    върху картата за пари.
      const row = el('div', 'bg-row');
      row.appendChild(el('span', 'bg-lbl', lbl));
      const i = el('input', 'jr-word'); i.type = 'number'; i.min = 0; i.placeholder = ph;
      i.value = (b[k] == null ? '' : b[k]); i.style.maxWidth = '90px';
      // 💰 11.08 (измерено): „-50“ даваше „~-600 лв за първата година“. Отрицателни
      //    пари няма; минусът е изпуснат пръст, не желание.
      i.addEventListener('input', () => { b = load('bl_budget', {}); if (i.value === '') delete b[k]; else b[k] = Math.max(0, parseInt(i.value) || 0); save('bl_budget', b); total(); });
      row.appendChild(i); row.appendChild(el('span', 'bg-lv', 'лв'));
      c2.appendChild(row);
    });
    const tOut = el('p', 'bg-total', ''); c2.appendChild(tOut);
    function total() {
      const дадени = ['pel', 'milk', 'other'].filter(k => b[k] != null);
      if (!дадени.length) { tOut.innerHTML = '<span class="bb-note">Попълни каквото знаеш — сборът се появява тук. Числата са твоите, не моите.</span>'; return; }
      const s = дадени.reduce((a2, k) => a2 + (+b[k] || 0), 0);
      tOut.innerHTML = `Около <strong>${s} лв / месец</strong> · ~${s * 12} лв за първата година.<br><span class="bb-note">Сметнато само от попълненото. При кърмене млякото пада на 0 — най-голямата икономия.</span>`;
    }
    total();
    root.appendChild(c2);

    // 3. Генератор на имена
    const c3 = card('Генератор на имена 👶 <span class="jr-sub">завърти рулетката!</span>');
    // 👶 05.08: тук стоеше `gSex = 'girl'` и чипът „👧 Момиче" се раждаше
    //    светнат — на майка, която чака момче и вече го е записала в профила.
    //    Профилът е питан; при неизвестен пол не решаваме вместо нея.
    //    (gLen се задаваше и НИКОГА не се ползваше — махнат.)
    const полът = getBaby().sex;
    let gSex = (полът === 'boy' || полът === 'girl') ? полът : '', gStyle = 'всички';
    const r1 = el('div', 'jr-quick');
    [['girl', '👧 Момиче'], ['boy', '👦 Момче']].forEach(([v, l]) => { const bb = el('button', 'jr-chip' + (v === gSex ? ' on' : ''), l); bb.type = 'button'; bb.addEventListener('click', () => { r1.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); bb.classList.add('on'); gSex = v; }); r1.appendChild(bb); });
    c3.appendChild(r1);
    const r2 = el('div', 'jr-quick');
    [['всички', 'Всякакви'], ['класическо', 'Класически'], ['модерно', 'Модерни'], ['традиционно', 'Традиционни']].forEach(([v, l]) => { const bb = el('button', 'jr-chip' + (v === 'всички' ? ' on' : ''), l); bb.type = 'button'; bb.addEventListener('click', () => { r2.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); bb.classList.add('on'); gStyle = v; }); r2.appendChild(bb); });
    c3.appendChild(r2);
    const spin = el('button', 'jr-btn', '🎰 Завърти!'); spin.type = 'button';
    c3.appendChild(spin);
    const nOut = el('div', 'tl-name', ''); c3.appendChild(nOut);
    const favBox = el('div', 'tl-favs', ''); c3.appendChild(favBox);
    // ✕ 11.08 (обиколка по картите): „💜 Запази“ беше ЕДНОПОСЕЧНА врата — щом
    //    името влезе в любимите, махане нямаше отникъде. Същият лек като при
    //    „Добави своя храна“ и „Моите списъци“: кошче на всеки ред.
    function drawFavs() {
      const f = load('bl_fav_names', []);
      favBox.innerHTML = f.length
        ? '<p class="jr-weekcap">Любими: <span class="jr-sub">(✕ маха име)</span></p>' +
          f.map(x => `<span class="fd-pill">💜 ${esc(x)} <button type="button" class="tl-favdel" data-n="${esc(x)}" aria-label="Махни „${esc(x)}“ от любимите">✕</button></span>`).join('')
        : '';
    }
    favBox.addEventListener('click', e => {
      const b = e.target.closest('.tl-favdel'); if (!b) return;
      const име = b.dataset.n;
      const f = load('bl_fav_names', []).filter(x => x !== име);
      if (!save('bl_fav_names', f)) { drawFavs(); return; }   // 🔴 25.08: името си остава
      drawFavs();
      if (window.BL_FX) BL_FX.buzz(8);
    });
    spin.addEventListener('click', () => {
      if (!gSex) { nOut.innerHTML = '<p class="jr-privacy">Избери горе момиче или момче — още не знам кого чакате, а имената са различни. 💜</p>'; return; }
      let pool = D.names[gSex].filter(x => gStyle === 'всички' || x.s === gStyle);
      if (!pool.length) pool = D.names[gSex];
      const pk = pool[Math.floor(Math.random() * pool.length)];
      nOut.innerHTML = `<div class="tl-namecard pop"><span class="tl-nn">${pk.n}</span><span class="tl-nd">${pk.s}${pk.d !== '—' ? ' · имен ден ' + pk.d : ''}</span><button class="tl-fav" type="button">💜 Запази</button></div>`;
      const favB = nOut.querySelector('.tl-fav');
      favB.style.minHeight = '44px';   // 📱 измерено 34px
      // 🔴 11.08: вторият натиск върху „Запази“ мълчеше напълно (името вече е
      //    вътре). Мама натиска пак, защото нищо не се е случило пред очите ѝ.
      favB.addEventListener('click', () => {
        const f = load('bl_fav_names', []);
        if (f.includes(pk.n)) {
          favB.textContent = '💜 Вече е в любимите';
          clearTimeout(favB._t); favB._t = setTimeout(() => { if (favB.isConnected) favB.textContent = '💜 Запази'; }, 1800);
          return;
        }
        f.push(pk.n);
        if (!save('bl_fav_names', f)) return;   // 🔴 25.08: „✔ Запазено“ без запис
        drawFavs();
        favB.textContent = '✔ Запазено';
        if (window.BL_FX) BL_FX.buzz(10);
      });
    });
    drawFavs();
    root.appendChild(c3);

    // 4. Чеклисти
    // 🔁 отметките се пазеха по НОМЕР на списъка (bl_chk_0/1/2). Добавен или
    //    преместен чеклист в data.js разместваше чужди отметки между списъци —
    //    същият капан, който вече ухапа ваксините (миграцията е по-долу в файла).
    //    Ключът вече идва от името; старият индекс се пренася веднъж.
    // 🟡 11.08 (обиколка като майка): кътчето „✅ Чеклисти“ ВИНАГИ започваше с
    //    „Първи месец вкъщи“ — под героя, който обещава „каквото ти трябва СЕГА“.
    //    На седем месеца първото нещо беше „Пелени за новородено“ и „бодита 56/62“,
    //    минати преди половин година. Нищо не се крие (второ дете, чужд списък,
    //    просто любопитство — и трите остават на екрана): подрежда се само редът,
    //    по прозореца на всеки списък. Без рождена дата редът е старият — празно
    //    поле не е доказателство. Ключовете са по ИМЕ, затова размяната не мести
    //    нито една отметка.
    const мес = (function () { const в = ageFromBirth(getBaby().birth); return в ? в.months : null; })();
    const ПРОЗОРЕЦ = {
      'Първи месец вкъщи': [0, 2],
      'Чанта за разходка': [0, 36],
      'Обезопасяване (пълзене+)': [5, 36]
    };
    const далеч = име => {
      const п = ПРОЗОРЕЦ[име];
      if (!п || мес == null) return 0;
      return мес < п[0] ? п[0] - мес : (мес > п[1] ? мес - п[1] : 0);
    };
    Object.keys(D.checklists)
      .map((name, i) => ({ name, i }))
      .sort((x, y) => далеч(x.name) - далеч(y.name) || x.i - y.i)
      .forEach(({ name, i }) => {
      const ключ = 'bl_chk_' + name.replace(/\s+/g, '_');
      try {
        if (localStorage.getItem(ключ) === null && localStorage.getItem('bl_chk_' + i) !== null) {
          localStorage.setItem(ключ, localStorage.getItem('bl_chk_' + i));
        }
      } catch (e) {}
      root.appendChild(checklistCard(name, ключ, D.checklists[name]));
    });

    // 4.5 Резервно копие
    const cb = card('Резервно копие 💾 <span class="jr-sub">за смяна на телефон</span>');
    const expBtn = el('button', 'jr-btn', '⬇️ Свали копие'); expBtn.type = 'button';
    const заклБел = el('p', 'jr-privacy', ''); заклБел.hidden = true;   // остава на екрана след заключено копие
    const медБел = el('p', 'jr-privacy', ''); медБел.hidden = true;   // честната равносметка на копието
    // 🔴 05.08 (одит г08, №200): снимките и гласовите живеят в IndexedDB и се
    //    четат в паметта чак когато BL_STORE.init приключи (секунди при стотици
    //    MB). Копие, натиснато през първите секунди след отваряне, тръгваше с
    //    ПРАЗНА медия — файл от килобайти вместо мегабайти, без нито дума за
    //    това. Мама го разбираше чак на новия телефон. Сега чакаме, казваме, че
    //    чакаме, и накрая казваме честно колко е влязло.
    expBtn.addEventListener('click', async () => {
      expBtn.disabled = true; expBtn.textContent = '📸 Събирам снимките…';
      try { if (window.BL_STORE && BL_STORE.init) await BL_STORE.init; } catch (e) {}
      expBtn.disabled = false;
      // 🔴 05.08 (одит г14, №362): целият път на износа беше без try/catch.
      //    RangeError от JSON.stringify върху две години снимки отхвърляше
      //    обещанието мълчаливо — мама натиска, нищо не се случва, бутонът си
      //    стои същият. Сега казваме, и то с причината, която най-често е вярна.
      try {
      const dump = {};
      // 🔒 М−2: ключалката НЕ пътува. Тя пази ТОЗИ телефон, не файла — а ако
      // тръгне с копието, само дава на всеки, който има файла, още едно нещо
      // за отгатване. На новия телефон мама си слага нова ключалка.
      const НЕ_В_КОПИЕТО = /^(bl_pin|bl_pin_h)$/;
      // 3.1.5: докато ключалката стои заключена, тайните не тръгват никъде —
      // дори в копието. Отключи (влез в Дневника с ПИН-а) и свали пак.
      // 05.08: + rage/maika/money — същият катинар (secrets.js), същият файл.
      // 🗝️ 25.08: списъкът стоеше преписан ДУМА ПО ДУМА и тук, и в
      //    js/profile.js:937. Два преписа на едно правило се разминават рано или
      //    късно, а цената тук е изтекла тайна: който е пипнал единия файл, си
      //    мисли, че е свършил работата. Изворът е ЕДИН — js/tayni.js (зареден
      //    в index.html:1405, точно преди този файл), а обосновката за всеки
      //    ключ е записана там.
      //    Резервният израз остава НАРОЧНО: не се ли зареди файлът, поведението
      //    е точно днешното, а не „нищо не е тайна“.
      //    ПЪТ НАЗАД: махаш лявата страна на `||`.
      const ЗАКЛЮЧЕНИ = (window.BL_ТАЙНИ && window.BL_ТАЙНИ.ключове) ||
        /^(bl_wm_diary|bl_wm_confess|bl_wm_sins|bl_wm_rage|bl_wm_maika|bl_wm_money)$/;
      const тайно = window.BL_PIN && BL_PIN.has && BL_PIN.has() && !BL_PIN.unlocked();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k.startsWith('bl_') || НЕ_В_КОПИЕТО.test(k)) continue;
        if (тайно && ЗАКЛЮЧЕНИ.test(k)) continue;
        dump[k] = localStorage.getItem(k);
      }
      const медия = window.BL_STORE ? BL_STORE.mediaDump() : {};
      Object.assign(dump, медия); // снимките и звуците — също в копието
      const медKB = Math.round(Object.keys(медия).reduce((s, k) => s + String(медия[k] || '').length, 0) / 1024);
      const blob = new Blob([JSON.stringify({ app: 'BabyLand', date: new Date().toISOString(), data: dump }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      // 🔴 05.08 (одит г14, №361): връзката не влизаше в документа — на част от
      //    мобилните браузъри click() върху нея не сваля нищо изобщо.
      const a2 = document.createElement('a'); a2.href = url; a2.download = 'baby-land-копие.json';
      document.body.appendChild(a2); a2.click(); a2.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      // 🔴 05.08 (одит г14, №120): при заключена ключалка дневникът и изповедите
      //    НЕ влизат — това копие е непълно. Непълното не гаси напомнянето за
      //    архив и не отключва медальона „Пазителка“.
      saveТихо(тайно ? 'bl_backup_partial_last' : 'bl_backup_last', today()); // напомнянето на „Днес“ знае кога е било
      // 🔒 05.08: „Свалено (без тайните 🔒)“ се пишеше седем реда по-горе и
      //    ВЕДНАГА се презаписваше от „Свалено! 💜“ — в същия синхронен блок.
      //    Мама виждаше само зеленото, сменяше телефона и там дневникът и
      //    изповедите ги нямаше. Надписът е един, а обяснението остава на
      //    екрана, докато не свали пак.
      expBtn.textContent = тайно ? 'Изпратено (без тайните 🔒)' : 'Изпратено към Изтегляния 💜';
      setTimeout(() => expBtn.textContent = '⬇️ Свали копие', 2600);
      if (тайно) {
        заклБел.textContent = '🔒 Дневникът и изповедите са заключени и НЕ влязоха в този файл. Отключи ги с ПИН-а и свали копието пак, за да тръгнат и те с теб.';
        заклБел.hidden = false;
      } else заклБел.hidden = true;
      медБел.textContent = (медKB > 0
        ? 'Вътре са и снимките, и гласовите — около ' + (медKB > 1024 ? (медKB / 1024).toFixed(1) + ' MB' : медKB + ' KB') + ' от тях. Пази файла на сигурно място. 💜'
        : 'Този файл носи записките ти. Снимки и гласови засега няма записани.') +
        ' Провери го в „Изтегляния“ на телефона — казва се „baby-land-копие.json“.';
      медБел.hidden = false;
      } catch (e) {
        expBtn.disabled = false;
        expBtn.textContent = 'Не се получи 😕';
        setTimeout(() => expBtn.textContent = '⬇️ Свали копие', 3200);
        медБел.textContent = 'Копието не тръгна. Най-честата причина е място на телефона — освободи малко и пробвай пак. Записките ти са си тук, нищо не е загубено. 💜';
        медБел.hidden = false;
      }
    });
    cb.appendChild(expBtn); cb.appendChild(заклБел); cb.appendChild(медБел);
    const impLbl = el('label', 'jr-btn tl-imp', '⬆️ Възстанови от файл');
    const impInp = el('input'); impInp.type = 'file'; impInp.accept = 'application/json'; impInp.style.display = 'none';
    impInp.addEventListener('change', () => {
      const file = impInp.files[0]; if (!file) return;
      const rd = new FileReader();
      // 🔴🔴 04.08 (обиколка, армия Инструменти): този вход беше сляп на три
      //    места, докато СЪЩИЯТ файл през профила (js/profile.js:366-396) се
      //    обработва правилно:
      //     1) ЗАКЛЮЧЕНО копие → `parsed.data` е низ (base64), Object.keys(низ)
      //        дава ['0','1','2'…], нула ключа започват с bl_ → НИЩО не се
      //        записва, а надписът пак казваше „Възстановено!“. Мама сменя
      //        телефона, вижда зелено, отваря стаите — празни. И може вече да
      //        е изтрила стария телефон.
      //     2) Никакво преброяване: чужд или повреден файл също казваше
      //        „Възстановено“.
      //     3) ЗАМЕНЯШЕ всичко без нито един въпрос и без презареждане — старо
      //        копие изтриваше месеци дневник мълчаливо, а вече отворените
      //        карти държаха старите обекти и записваха обратно върху внесеното.
      rd.onload = async () => {
        try {
          let parsed = JSON.parse(rd.result);
          if (window.BL_CRYPTO && BL_CRYPTO.заключенЛи && BL_CRYPTO.заключенЛи(parsed)) {
            const парола = await BL_CRYPTO.питайЗаПарола('стар');
            if (!парола) { impLbl.textContent = '⬆️ Възстанови от файл'; return; }
            impLbl.textContent = '🔓 Отключвам…';
            try { parsed = JSON.parse(await BL_CRYPTO.отключи(parsed, парола)); }
            catch (e) {
              impLbl.textContent = 'Грешна парола 🔐';
              setTimeout(() => impLbl.textContent = '⬆️ Възстанови от файл', 2600); return;
            }
          }
          const dd = parsed.data || parsed;
          // ⛔ 12.08 (тест за паметта, ред „чужд файл: нищо не влиза в паметта“):
          //    БЛИЗНАКЪТ на js/profile.js — същият внос, същата слепота. Записваше
          //    ВСЕКИ ключ с префикс bl_ от файла, тоест от чуждия телефон идваше и
          //    вътрешното състояние на екрана: кои карти са сгънати, кои стаи са
          //    посетени, коя тема е избрана, кога ОНЗИ телефон си е правил копие.
          //    Това не са записи на майката.
          //
          //    ВЛИЗА само нейното: бебето и профилът, сънят, храненията, пелените,
          //    мерките, ваксините, чекировките, дневниците и писмата, списъците и
          //    чеклистите (bl_chk_…), тайната стая (bl_wm_…), И медийните ключове
          //    от js/store.js (bl_photos, bl_voice, bl_art…) — без тях албумът ѝ
          //    не пристига на новия телефон.
          //
          //    Защо списък на ИЗКЛЮЧЕНИЯТА, а не изброяване на позволените: имена
          //    на нейни ключове се съставят в движение (bl_chk_<име на списък>,
          //    наставки _k и _idx), тоест позволен списък НЕ може да е пълен.
          //    Забравен ред в позволените = мълчаливо липсващ дневник на новия
          //    телефон. Забравен ред тук = една сгъната карта.
          //
          //    ⚠️ Схемните флагове (bl_vax_schema, bl_art_merged, bl_qped_merged)
          //    нарочно ПЪТУВАТ — виж „мигрирайВаксини“ по-долу в този файл: тя НЕ е
          //    безопасна за второ пускане и без флага би пренаредила вече
          //    пренаредени отметки.
          //    ⚠️ Списъкът НЕ е същият като ПРОПУСНИ отдолу: ПРОПУСНИ отговаря на
          //    друг въпрос („има ли ТОЗИ телефон записи, за които да питаме“) и
          //    нарочно съдържа схемни флагове, които тук ТРЯБВА да минат.
          const НЕ_ВЛИЗА = /^(bl_folds|bl_folddefaults|bl_fskeep_fix|bl_seen_cards|bl_carduse|bl_pins|bl_lib_open|bl_lib_opens|bl_room_asked|bl_room_visited|bl_wm_visits|bl_theme|bl_sounds|bl_font|bl_tz|bl_pin|bl_pin_h|bl_pin_set|bl_backup_last|bl_backup_partial_last|bl_agent_miss|bl_heavy_day)$/;
          const неин = k => k.indexOf('bl_') === 0 && !НЕ_ВЛИЗА.test(k);
          // 🟠 11.08 (обиколка „данните на майката“): чужд JSON (от друго
          //    приложение) минаваше НАПРАВО към червения диалог „Тук вече има
          //    записи… ще застане отгоре“ и чак ако мама натиснеше „Качи“, чуваше
          //    че файлът не носи данни от Бейби Ленд. Тоест плашехме я с
          //    презаписване заради файл, в който няма нито един неин ред.
          //    Първо гледаме има ли изобщо какво да влезе.
          if (!Object.keys(dd).some(неин)) {
            impLbl.textContent = 'Файлът не носи данни от Бейби Ленд 😕';
            setTimeout(() => impLbl.textContent = '⬆️ Възстанови от файл', 3200); return;
          }
          // 🔴 05.08 (одит г14, №133): bl_vax_schema се записва при самото
          //    зареждане на тази стая, bl_tz — при всяко пускане. На чисто нов
          //    телефон „същ“ беше вече 2 и червеното изскачаше винаги.
          // 🟠 11.08 (измерено): след собственото „Изтрий всичко“ телефонът е
          //    ЧИСТ, а диалогът пак крещеше „вече има записи (12 неща)“ — и
          //    дванайсетте бяха вътрешно счетоводство от самото отваряне
          //    (сгънати карти, посетени стаи, ден 1, дъга…), нито едно неин
          //    запис. Мама, която току-що е сменила телефон, вижда червено
          //    предупреждение точно когато е най-уплашена — и част от майките
          //    натискат „Откажи“ и остават без данните си. Списъкът е измерен
          //    на живо на изтрит телефон, не предположен.
          const ПРОПУСНИ = /^(bl_theme|bl_sounds|bl_onboard|bl_onboarded|bl_font|bl_pin|bl_pin_h|bl_pin_set|bl_pins|bl_seen_cards|bl_carduse|bl_lib_opens|bl_tz|bl_vax_schema|bl_backup_last|bl_backup_partial_last|bl_tour_done|bl_folds|bl_folddefaults|bl_room_asked|bl_room_visited|bl_day1|bl_hero_toured|bl_art_merged|bl_heavy_day|bl_fskeep_fix|bl_rainbow|bl_wm_visits|bl_wm_ritual)$/;
          let същ = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('bl_') && !ПРОПУСНИ.test(k)) {
              const v = localStorage.getItem(k);
              if (v && v !== '{}' && v !== '[]' && v !== '""') същ++;
            }
          }
          if (същ > 0 && window.BL_UI && BL_UI.confirm) {
            // 🔴 05.08 (одит г14, №132): диалогът обещаваше замяна, а долният
            //    ред прави сливане — каквото го няма в копието, си остава тук.
            const ок = await BL_UI.confirm('', {
              title: 'Преди да го качим', emoji: '💾', okText: 'Качи копието', cancelText: 'Откажи', danger: true,
              text: 'Тук вече има записи на този телефон (' + (window.BL_BROI ? BL_BROI(същ, 'нещо', 'неща') : същ + ' ' + (същ === 1 ? 'нещо' : 'неща')) + '). Каквото е в копието, ще застане отгоре. Записите от този телефон, които ги няма в копието, остават.\n\nАко това е грешен телефон — по-добре Откажи.'
            });
            if (!ок) { impLbl.textContent = '⬆️ Възстанови от файл'; return; }
          }
          // 🔴🔴 11.08 (обиколка „данните на майката“, ИЗМЕРЕНО): при пълна памет
          //    localStorage.setItem гърми по средата на този цикъл. Дотогава
          //    половината копие ВЕЧЕ е влязло, а изключението падаше в общия
          //    catch отдолу и мама четеше „Файлът не е разпознат 😕“ — за
          //    напълно изправен файл. Това е най-страшната лъжа в цялата
          //    система: казваме ѝ, че резервното ѝ копие е счупено. Тя може да
          //    го изтрие. Сега разделяме двете причини — счупен файл и пълен
          //    телефон не са едно и също нещо.
          // 🔴🔴 05.09 — ВНОСЪТ ГЛЕДАШЕ ИМЕТО НА КЛЮЧА, НИКОГА СТОЙНОСТТА.
          //   `неин(k)` е добър филтър за ИМЕНАТА и е обмислен. Но стойността
          //   влизаше в паметта такава, каквато е във файла — а после 23 места
          //   в приложението я рисуват без пазач. Доказано с изстрел, не с
          //   прочит: изфабрикуван kopie.json, подаден на ИСТИНСКОТО поле за
          //   качване, изпълни чужд код след презареждането.
          //   Изразът е НАРОЧНО тесен — само отварящ таг с ЛАТИНСКА буква,
          //   „javascript:" и обработчик on…= . Тоест „цената е < 10 лв",
          //   „5<6" и „<3" на майката минават непокътнати; кирилицата също.
          const ТАГ_В_СТОЙНОСТ = /<[a-zA-Z/!?]|javascript\s*:|\son[a-z]+\s*=/i;
          let бр = 0, недостиг = 0, отхвърлени = 0;
          Object.keys(dd).forEach(k => {
            if (!неин(k)) return;                     // чуждото състояние на екрана остава във файла
            if (typeof dd[k] === 'string' && ТАГ_В_СТОЙНОСТ.test(dd[k])) { отхвърлени++; return; }
            try { localStorage.setItem(k, dd[k]); бр++; } catch (e) { недостиг++; }
          });
          if (отхвърлени) {
            // Казваме ѝ. Мълчаливо изхвърляне е втората лъжа след „файлът не е разпознат".
            const б2 = el('p', 'jr-privacy tl-impwarn', '<strong>' + отхвърлени +
              (отхвърлени === 1 ? ' нещо не влезе' : ' неща не влязоха') +
              '.</strong> В този файл има записи, които не приличат на нищо, писано от приложението. ' +
              'Останалото влезе. Ако файлът е твой и това те изненадва, кажи ни.');
            cb.appendChild(б2);
          }
          if (недостиг) {
            impLbl.textContent = 'Няма място на телефона 😕';
            const бел = cb.querySelector('.tl-impwarn') || el('p', 'jr-privacy tl-impwarn', '');
            бел.innerHTML = '<strong>Копието ти е наред — телефонът няма място.</strong> Влязоха ' + бр +
              (бр === 1 ? ' нещо, ' : ' неща, ') + недостиг + (недостиг === 1 ? ' не се побра' : ' не се побраха') +
              '. Освободи място (видеа, снимки, други приложения) и качи <em>същия</em> файл пак — второто качване не поврежда нищо, само дописва каквото липсва.';
            if (!бел.isConnected) cb.appendChild(бел);
            // презареждаме чак когато мама е прочела — иначе отворените карти
            // пишат старите си обекти върху това, което току-що влезе
            const прод = cb.querySelector('.tl-impgo') || el('button', 'jr-btn tl-impgo', 'Разбрах — презареди');
            прод.type = 'button';
            прод.onclick = () => {
              const ч = (window.BL_STORE && BL_STORE.flush) ? BL_STORE.flush() : Promise.resolve();
              ч.then(() => location.reload());
            };
            if (!прод.isConnected) cb.appendChild(прод);
            return;
          }
          if (!бр) {                                   // нищо не влезе — НЕ лъжем
            impLbl.textContent = 'Файлът не носи данни от Бейби Ленд 😕';
            setTimeout(() => impLbl.textContent = '⬆️ Възстанови от файл', 2600); return;
          }
          impLbl.textContent = '✔ Влезе! Зареждам всичко…';
          const изчакай = (window.BL_STORE && BL_STORE.flush) ? BL_STORE.flush() : Promise.resolve();
          изчакай.then(() => setTimeout(() => location.reload(), 400));
          return;
        } catch (e) { impLbl.textContent = 'Файлът не е разпознат 😕'; }
        setTimeout(() => impLbl.textContent = '⬆️ Възстанови от файл', 2600);
      };
      rd.readAsText(file);
    });
    impLbl.appendChild(impInp);
    cb.appendChild(impLbl);
    // 🟡 11.08: тази карта е тази, към която сочат ВСИЧКИ пътища в
    //    приложението („Инструменти → Резервно копие“ — home2, search, polish,
    //    профилът). А предупреждението, че файлът е ЧЕТИМ, стоеше само в
    //    профила. Мама, тръгнала по указателя на самото приложение, сваляше
    //    файл с имена, снимки и дневник и виждаше катинарче до него.
    cb.appendChild(el('p', 'jr-privacy', '⚠️ Файлът е <strong>обикновен, четим</strong> — държи имена, снимки и бележки. Пази го като албум: не го качвай в чат или облак, който не е твой. Ако трябва да пътува — в „Профил“ има <strong>копие с парола</strong>, което е истински заключено.'));
    root.appendChild(cb);

    // 5. Майчинство (BG)
    const c5 = card('Майчинството накратко 🇧🇬 <span class="jr-sub">ориентир — сверявай с НОИ</span>');
    c5.appendChild(el('ul', 'sos-list',
      '<li><strong>45 дни</strong> преди термина започва отпускът по бременност и раждане.</li>' +
      '<li><strong>410 дни</strong> общо обезщетение за бременност, раждане и отглеждане (при осигуряване).</li>' +
      '<li>След 410-те дни — обезщетение за отглеждане до 2-годишна възраст.</li>' +
      // 🟠 11.08 (обиколка „документи и пари“): редът беше „Бащата има право…“ —
      //    изречен като даденост на жена, която може да няма баща в картината.
      //    Правото си остава право; само не се приема за дадено, че той е тук.
      '<li>Ако има втори родител — и той има право на отпуск при раждане; сроковете се питат при неговия работодател.</li>'));
    // 🔴 11.08 (обиколка „документи и пари“): тук пишеше „с библиотеката ИДВА
    //    актуален помощник със стъпките и документите“ — обещание за функция,
    //    която я няма и не се строи. Статията обаче СЪЩЕСТВУВА и е в тази стая.
    //    (Първата поправка сочеше статия по заглавие от базата на Дара — а в
    //    таб „Статии“ такова заглавие НЯМА. Сочим кътчето, което го има
    //    наистина: филтърът „💰 Помощи и НОИ“, проверен на екрана.)
    c5.appendChild(el('p', 'jr-privacy', 'Сроковете и сумите се менят — сверявай в НОИ или със счетоводството си. В таб „Статии“ има кътче <strong>💰 Помощи и НОИ</strong>, а Дара отговаря, ако я питаш „НОИ“ или „410 дни“.'));
    root.appendChild(c5);
  }

  // ═══════════════ 🩺 ЗДРАВЕ И SOS (Вита) ═══════════════

  window.BL_VACCINES = null; // попълва се долу — календарният център ги чете
  // ⚠️ Ориентировъчен ред — точния график води личният лекар по актуалния
  // календар. Синхронизиран 22.07 с библиотечните статии за календара
  // (ранните приеми = комбинираната ШЕСТкомпонентна; бустерът на 16-ия месец
  // = ПЕТкомпонентната). Преди тук пишеше „Петкомпонентна" и за ранните
  // приеми — противоречеше на статиите в същото приложение.
  const VACCINES = [
    { m: 0,  n: 'Хепатит Б (1-ви прием) + БЦЖ', d: 'в родилния дом, първите часове/дни' },
    // 🔴 19.08 (ИЗМЕРЕНО: 18, 21 и 23 дни разлика НА ЕДИН РЕД): тук пишеше
    //    „около 6-та / 10-та / 14-та седмица“ — това е седмичният график на СЗО,
    //    а датата до него се смята от МЕСЕЦИТЕ по българския календар (2 мес =
    //    59 дни = 9-та седмица). Два номера на един ред, които се карат, а
    //    майката вярва на датата. Месеците остават (по тях е и Наредба 15, и
    //    цялата сметка в приложението); закованата седмица си отива, а на реда
    //    се показва седмицата, извадена от СЪЩАТА дата — не може да се разминат.
    //    ПЪТ НАЗАД: връщаш трите описания и махаш „седмТекст" по-долу.
    { m: 2,  n: 'Шесткомпонентна (1) + Пневмококова (1)', d: 'първият прием след родилния дом — точния ден казва лекарят' },
    { m: 3,  n: 'Шесткомпонентна (2)', d: 'месец след предишния прием' },
    { m: 4,  n: 'Шесткомпонентна (3) + Пневмококова (2)', d: 'месец след предишния прием' },
    { m: 7,  n: 'Проверка за белега от БЦЖ', d: 'ако няма белег — лекарят преценява по-нататък' },
    { m: 12, n: 'Пневмококова (3-ти прием)', d: '' },
    { m: 13, n: 'Морбили-Паротит-Рубеола (МПР)', d: '' },
    { m: 16, n: 'Петкомпонентна', d: 'следващият прием по календара' }
  ];
  window.BL_VACCINES = VACCINES;

  // 🔁 Миграция на отметките (22.07): bl_vax пази „сложена ли е“ по ИНДЕКС, а
  // редът на календара се промени. Без това мама щеше да види чужди отметки.
  // Старият ред → новия; двата приема Хепатит Б (стари 1 и 5) вече влизат в
  // комбинираната ваксина, затова отпадат. Върви веднъж, пази стария запис.
  (function мигрирайВаксини() {
    try {
      if (localStorage.getItem('bl_vax_schema') === '2') return;
      const старо = load('bl_vax', null);
      if (старо && typeof старо === 'object') {
        localStorage.setItem('bl_vax_old', JSON.stringify(старо));   // резерв, ако потрябва
        const карта = { 0: 0, 2: 1, 3: 2, 4: 3, 6: 5, 7: 6, 8: 7 };
        const ново = {};
        Object.keys(карта).forEach(с => { if (старо[с]) ново[карта[с]] = true; });
        save('bl_vax', ново);
      }
      localStorage.setItem('bl_vax_schema', '2');
    } catch (e) {}
  })();

  function renderHealth(root) {
    // 1. Имунизационен календар
    const c1 = card('Имунизационен календар 💉 <span class="jr-sub">по официалния български график</span>');
    const baby = getBaby();
    const a = ageFromBirth(baby.birth);
    const done = load('bl_vax', {});
    if (!baby.birth) c1.appendChild(el('p', 'jr-privacy', 'Задай рождена дата в „Моето бебе“ и ще ти сметна датите. Засега — общият график:'));
    const vlist = el('div', 'vx-list');
    VACCINES.forEach((v, i) => {
      let dateStr = '', седмТекст = '';
      if (baby.birth) {
        const b0 = денНула(baby.birth);
        const dd = BL_DATE.addMonths(b0, v.m);
        dateStr = dd.toLocaleDateString('bg-BG');
        // седмицата се вади от СЪЩАТА дата → двете числа на реда не могат да
        // се разминат (виж бележката при VACCINES по-горе)
        // само за ранните приеми: седмици се говорят до 4-ия месец. „53-та
        // седмица" за едногодишно е вярно число, но никой не мери така — точно
        // такъв беше и първият ми опит за поправка.
        if (v.m > 0 && v.m <= 4) {
          const н = Math.floor(дниМежду(b0, dd) / 7) + 1;
          седмТекст = (window.BL_REDNA ? BL_REDNA(н) : н + '-та') + ' седмица';
        }
      }
      const isDone = done[i];
      // 💉 05.08 (скептик, близнакът на чипа в „Днес“, ред 1629): същото
      //    правило важи и ТУК. Редът на приема в родилния дом (m:0) светваше
      //    „наближава!“ на майка с бебе на 11 дни — само защото отметката е
      //    празна, а тя се пълни единствено с нейно докосване. Празно поле не
      //    е доказателство: родилният прием не се подсеща.
      const near = a && !isDone && v.m > 0 && Math.abs(a.months - v.m) < 1;
      const row = el('button', 'vx-row' + (isDone ? ' done' : '') + (near ? ' near' : ''));
      row.type = 'button';
      row.innerHTML = `<span class="jr-check">${isDone ? '✔' : ''}</span>` +
        `<span class="vx-when">${v.m === 0 ? 'Раждане' : v.m + ' мес'}</span>` +
        `<span class="vx-name">${v.n}${v.d ? '<br><small>' + v.d + '</small>' : ''}${dateStr ? '<br><small>≈ ' + dateStr + (седмТекст ? ' · ' + седмТекст : '') + '</small>' : ''}${near ? ' <span class="vx-near">наближава!</span>' : ''}</span>`;
      row.setAttribute('aria-pressed', isDone ? 'true' : 'false');   // ♿ отметка, не просто бутон
      row.addEventListener('click', () => {
        // read-merge-write: обектът беше прочетен при СТРОЕЖА на картата
        const св = load('bl_vax', {});
        св[i] = !св[i];
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): ✔ до ваксината се рисуваше и без
        //    запис. При следващото отваряне отметката я няма — а мама вече е
        //    решила, че този прием е отбелязан. Знакът идва СЛЕД записа.
        if (!save('bl_vax', св)) return;
        done[i] = св[i];
        row.classList.toggle('done', !!св[i]);
        row.setAttribute('aria-pressed', св[i] ? 'true' : 'false');
        row.querySelector('.jr-check').textContent = св[i] ? '✔' : '';
        if (св[i]) row.classList.remove('near');
        if (window.BL_FX) BL_FX.buzz(8);
      });
      vlist.appendChild(row);
    });
    c1.appendChild(vlist);
    c1.appendChild(el('p', 'jr-privacy', '⚠️ Ориентир — точните дати и ваксини определя личният лекар по актуалния календар на МЗ.'));
    root.appendChild(c1);

    // 2. Температурен ориентир
    const c2 = card('Температурен ориентир 🌡️ <span class="jr-sub">кога е спокойно и кога — веднага лекар</span>');
    const ageRow = el('div', 'jr-quick');
    // 🌡️ 22.07 (мега одит): без рождена дата се подразбираше band=2, тоест
    // НАЙ-ХЛАБАВОТО правило („над 6 месеца“). Никога не подразбирай хлабавото
    // при спешна тема — без дата говорим по най-строгото и го КАЗВАМЕ.
    const безДата = !a;
    let band = a ? (a.months < 3 ? 0 : a.months < 6 ? 1 : 2) : 0;
    [['под 3 мес', 0], ['3–6 мес', 1], ['над 6 мес', 2]].forEach(([lbl, v]) => {
      const b = el('button', 'jr-chip' + (v === band ? ' on' : ''), lbl); b.type = 'button';
      b.setAttribute('aria-pressed', v === band ? 'true' : 'false');   // проход 4: избраната възраст се озвучава
      b.addEventListener('click', () => { ageRow.querySelectorAll('.jr-chip').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); band = v; evalTemp(); });
      ageRow.appendChild(b);
    });
    c2.appendChild(ageRow);
    if (безДата) {
      c2.appendChild(el('p', 'jr-hint', 'Още не знам възрастта на бебето, затова говоря по НАЙ-СТРОГОТО правило (под 3 месеца). Избери възрастта горе или попълни рождената дата, за да съм точна.'));
    }
    const tI = el('input', 'jr-word'); tI.type = 'number'; tI.step = '0.1'; tI.placeholder = 'Температура (°C)…';
    c2.appendChild(tI);
    const tOut = el('div', 'tmp-out', '');
    tOut.setAttribute('aria-live', 'polite');   // проход 4: присъдата се озвучава за незрящи майки
    c2.appendChild(tOut);
    // проход 3 T28: 1-тап запис в температурния дневник — иначе мама в 3ч пише
    // числото тук за присъдата И втори път в „Температурен дневник" за графиката.
    const tSave = el('button', 'jr-chip', '📌 Запиши в дневника'); tSave.type = 'button'; tSave.hidden = true;
    c2.appendChild(tSave);
    tSave.addEventListener('click', () => {
      const t = parseFloat(tI.value);
      if (isNaN(t) || t < 34 || t > 43) return;
      const arr = load('bl_temps', []); arr.push({ v: t, ts: Date.now() });
      // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): бутонът се заключваше и пишеше
      //    „✔ Записано — посоката е в дневника“, без числото да е влязло.
      //    Мама в 3 ч. през нощта мери на всеки час точно за да види ПОСОКАТА;
      //    заключеният бутон ѝ отнемаше и втория опит.
      if (!save('bl_temps', arr.slice(-80))) return;  // същия shape/cap като rooms3 tempCard
      tSave.dataset.saved = String(t); tSave.disabled = true; tSave.textContent = '✔ Записано — посоката е в дневника 🌡️';
      // …и дневникът наистина да го покаже СЕГА, а не чак след презареждане
      if (typeof window.BL_TEMPS_REDRAW === 'function') { try { window.BL_TEMPS_REDRAW(); } catch (e) { } }
      if (window.BL_FX) BL_FX.buzz(10);
    });
    let prevTmp = '';
    function evalTemp() {
      const t = parseFloat(tI.value);
      if (isNaN(t)) { tOut.innerHTML = ''; tOut.className = 'tmp-out'; prevTmp = ''; tSave.hidden = true; return; }
      // 🔴 11.08 (обиколка по картите, ИЗМЕРЕНО): „4“ получаваше отговор
      //    „В нормата. 😊“, а „99“ — червена тревога. Изпуснатата тройка
      //    (7.5 вместо 37.5) е най-честата грешка в 3 през нощта и точно тя
      //    се връщаше със зелено успокоение. Картата сама знае кое число е
      //    възможно (чипът за дневника пуска само 34–43); присъдата не го
      //    знаеше. Извън този обхват НЕ съдим — казваме, че числото не е за
      //    вярване, и не пращаме нито в спокойно, нито в паника.
      if (t < 34 || t > 43) {
        tOut.innerHTML = '🤍 <strong>' + (Math.round(t * 10) / 10) + '°</strong> не е температура, която тяло може да има — най-често се губи или се удвоява цифра. Провери числото и ми го кажи пак; дотогава не искам да ти казвам нито „спокойно“, нито „тревога“, защото и двете биха били измислени.' +
          '<br><span class="bb-note">Ако термометърът наистина показва това — смени го или мери пак след малко.</span>';
        tOut.className = 'tmp-out';
        prevTmp = 'range'; tSave.hidden = true;
        return;
      }
      let cls = 'tmp-ok', msg;
      if (band === 0 && t >= 38) { cls = 'tmp-red'; msg = '🚨 Под 3 месеца всяка температура над 38° е за ЛЕКАР ВЕДНАГА. Не изчаквай.'; }
      else if (t >= 40) { cls = 'tmp-red'; msg = '🚨 Много висока температура — свържи се с лекар/спешна помощ.'; }
      else if (band === 1 && t >= 39) { cls = 'tmp-warn'; msg = '⚠️ Над 39° на тази възраст — обади се на лекар, особено ако детето изглежда болно.'; }
      else if (t >= 38) { cls = 'tmp-warn'; msg = 'Има температура. Гледай ДЕТЕТО: пие ли, мокри ли са пелените, успокоява ли се? Много течности, леки дрешки, гушкане. Ако трае 3 дни или се влошава — лекар.'; }
      else if (t >= 37.5) { cls = 'tmp-ok'; msg = 'Леко повишена (субфебрилна). Наблюдавай, дай течности, не увивай много.'; }
      else { cls = 'tmp-ok'; msg = 'В нормата. 😊 Ако нещо друго те тревожи — питай Вита или лекаря.'; }
      tOut.innerHTML = msg + '<br><span class="bb-note">Дозите лекарства определя лекар/фармацевт по теглото — не приложение.</span>';
      tOut.className = 'tmp-out ' + cls;
      // T28: чипът се отключва при валидна стойност; нова стойност = нов запис позволен
      const ok = t >= 34 && t <= 43;
      tSave.hidden = !ok;
      if (ok && tSave.dataset.saved !== String(t)) { tSave.disabled = false; tSave.textContent = '📌 Запиши в дневника'; }
      // присъдата „пристига" с мек pop само когато СЕ ПРОМЕНИ (не на всяка цифра)
      if (cls !== prevTmp) {
        tOut.classList.remove('tv-pop'); void tOut.offsetWidth; tOut.classList.add('tv-pop');
        prevTmp = cls;
      }
    }
    tI.addEventListener('input', evalTemp); evalTemp();
    root.appendChild(c2);

    // 3. SOS
    const c3 = el('section', 'jr-card');
    c3.appendChild(el('h4', 'jr-title', 'При спешност 🆘 <span class="jr-sub">едно докосване — работи и без интернет</span>'));
    const b112 = el('a', 'sos-btn', '📞 Обади се на 112<span class="sos-cap">спешна помощ — денонощно</span>');
    b112.href = 'tel:112';
    c3.appendChild(b112);
    const sos = load('bl_sos', { pedName: '', pedPhone: '', closeName: '', closePhone: '' });
    function contactRow(nk, pk, ph) {
      const row = el('div', 'sos-row');
      // 🔴 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): при крив bl_sos тук влизаше
      //    `undefined` и мама виждаше буквално „undefined" в полето за името
      //    на педиатъра си — на екрана, който отваря, когато бърза.
      //    ПЪТ НАЗАД: махаш `|| ''` от двата реда.
      const ni = el('input', 'jr-word'); ni.placeholder = ph; ni.value = sos[nk] || '';
      const pi = el('input', 'jr-word'); pi.placeholder = 'телефон…'; pi.type = 'tel'; pi.value = sos[pk] || '';
      const call = el('a', 'sos-call', '📞');
      // 📱 11.08 (измерено 39×40 на 375px телефон): това е бутонът, който се
      //    натиска с трепереща ръка. Под 44 пиксела пръстът го изпуска.
      call.style.minWidth = '44px'; call.style.minHeight = '44px';
      call.style.display = 'flex'; call.style.alignItems = 'center'; call.style.justifyContent = 'center';
      // read-merge-write: СОС-центърът (sos.js) пише в СЪЩИЯ bl_sos; ако тук
      // запишем стария обект наведнъж, ще изтрием редактираното там (одит-флот
      // П23, проход 2 №19). Пипаме само нашите 2 полета.
      function sync() { const cur = load('bl_sos', {}); cur[nk] = ni.value.trim(); cur[pk] = pi.value.trim(); save('bl_sos', cur); sos[nk] = cur[nk]; sos[pk] = cur[pk]; if (cur[pk]) { call.href = 'tel:' + cur[pk]; call.classList.add('on'); } else { call.removeAttribute('href'); call.classList.remove('on'); } }
      ni.addEventListener('input', sync); pi.addEventListener('input', sync); sync();
      row.appendChild(ni); row.appendChild(pi); row.appendChild(call);
      return row;
    }
    c3.appendChild(el('p', 'bb-lbl', 'Моите номера (попълни отсега):'));
    c3.appendChild(contactRow('pedName', 'pedPhone', 'Нашият педиатър…'));
    c3.appendChild(contactRow('closeName', 'closePhone', 'Близък човек…'));
    root.appendChild(c3);

    const c4 = card('Докато чакаш помощ 💗');
    c4.appendChild(el('ul', 'sos-list',
      '<li>Дишай бавно — бебето усеща твоето спокойствие.</li>' +
      '<li>Говори тихо на бебето, дръж го близо.</li>' +
      '<li>Приготви: лична карта, здравния картон, лекарствата, които е приемало.</li>' +
      '<li>Отключи вратата, светни лампата отвън, ако е тъмно.</li>'));
    root.appendChild(c4);
  }

  // ── общ помощник: чеклист карта ──
  function checklistCard(title, key, items) {
    const c = card(title);
    // 🔴 11.08 капанът на снимката: това е общ строител — един и същ ключ може
    //    да е на екрана два пъти (стаята, нарисувана и в скрития панел). Всяка
    //    отметка чете ПРЯСНО долу, за да не запише своята стара снимка отгоре.
    let state = load(key, {});
    // 🔁 11.08: отметките в САМИЯ списък се пазеха по НОМЕР на реда (bl_ready =
    //    {"0":true,...}) — същият капан, който вече беше изкоренен при ваксините
    //    (миграцията по-долу в файла) и при ключовете на чеклистите (ред 1253).
    //    Докато редовете не мърдат, вреда няма — затова и data.js:320 казва
    //    „добавени В КРАЯ, за да не мръднат индексите“. Първото вмъкване по
    //    средата обаче мести отметката ѝ върху чуждо твърдение. Ключът вече идва
    //    от ТЕКСТА на реда; преносът върви ВЕДНЪЖ, сега, докато редът още е
    //    същият, по който е отмятала.
    //    Път назад: старият запис се пази непокътнат в „<ключ>_idx“ (както
    //    bl_vax_old при ваксините), а „<ключ>_k“ казва, че преносът е минал.
    const виждани = {};
    const ключове = items.map((it, i) => {
      let к = String(it).replace(/<[^>]*>/g, '').trim().slice(0, 60) || ('ред-' + i);
      if (виждани[к]) к += '#' + i;
      виждани[к] = 1;
      return к;
    });
    try {
      if (localStorage.getItem(key + '_k') === null) {
        let имаше = false;
        const ново = {};
        ключове.forEach((к, i) => { if (state[i]) { ново[к] = true; имаше = true; } });
        if (имаше) localStorage.setItem(key + '_idx', JSON.stringify(state));
        Object.keys(state).forEach(k2 => { if (/^\d+$/.test(k2)) delete state[k2]; });
        Object.assign(state, ново);
        save(key, state);
        localStorage.setItem(key + '_k', '1');
      }
    } catch (e) {}
    const list = el('div', 'jr-wins');
    let doneN = 0;
    const capt = el('p', 'chk-count', '');
    items.forEach((it, i) => {
      const ключ = ключове[i];
      const row = el('button', 'jr-win' + (state[ключ] ? ' done' : ''));
      row.type = 'button';
      row.setAttribute('aria-pressed', state[ключ] ? 'true' : 'false');
      row.innerHTML = `<span class="jr-check">${state[ключ] ? '✔' : ''}</span> ${it}`;
      if (state[ключ]) doneN++;
      row.addEventListener('click', () => {
        state = load(key, {});          // пресен прочит ПРЕДИ записа
        state[ключ] = !state[ключ];
        // 🔴 25.08 (ИЗМЕРЕНО): отметката се рисуваше ПРЕДИ записа и без да го
        //    проверява. При пълна памет мама отмяташе цялата чанта за родилния
        //    дом — десет реда с ✔ — и на другия ден намираше празен списък.
        //    Нищо не се рисува, преди записът да е минал.
        if (!save(key, state)) {
          state[ключ] = !state[ключ];   // връщаме обекта както си беше
          capt.textContent = ПЪЛНА;
          if (window.BL_FX) BL_FX.buzz(4);
          return;
        }
        // 🔢 броим ОТ ЗАПИСАНОТО, не от брояча в паметта на екрана: същият
        //    ключ може да е нарисуван и в скрития панел и двете числа се
        //    разминаваха („3 / 5 готови“ при четири ✔).
        row.classList.toggle('done', !!state[ключ]); row.querySelector('.jr-check').textContent = state[ключ] ? '✔' : '';
        row.setAttribute('aria-pressed', state[ключ] ? 'true' : 'false');
        if (state[ключ]) { row.classList.add('pop'); setTimeout(() => row.classList.remove('pop'), 400); }
        const was = doneN;
        doneN = ключове.filter(к => state[к]).length; updateCap();
        if (window.BL_FX) { BL_FX.buzz(10); if (was < items.length && doneN === items.length) { BL_FX.confetti(row); BL_FX.cheer('Готово! 🎉'); } }
      });
      list.appendChild(row);
    });
    // 🤍 „0 / 5 готови“ посрещаше майка с дете на седем месеца, което вече яде —
    //    изпит по готовност вместо помощ, и брояч на това, което НЕ е направила.
    //    Недокоснатият списък мълчи; броенето тръгва с първата ѝ отметка.
    function updateCap() { capt.textContent = doneN ? `${doneN} / ${items.length} готови${doneN === items.length ? ' — браво! 🎉' : ''}` : ''; }
    updateCap();
    c.appendChild(capt); c.appendChild(list);
    return c;
  }

  // ═══════════════ „ДНЕС“ — умен начален екран ═══════════════

  // 💡 05.08: изборът беше чисто календарен — датата в месеца, без нито един
  //    поглед към бебето. Майка на единайсет дни четеше „слагай бебето сънливо,
  //    но будно, учи се да заспива само“ (значи го греша от първия ден) и на
  //    другия ден „един нов алерген сутрин“. Всеки съвет вече носи прозореца, в
  //    който изобщо има смисъл — a0/a1 в месеци, както при D.activities.
  //    За първите седмици остават нещата, които важат от първия ден.
  const DAY_TIPS = [
    { a0: 0, a1: 36, t: 'Пий вода всеки път, щом кърмиш или храниш бебето — жаждата дебне. 💧' },
    { a0: 0, a1: 36, t: 'Ако днес ти се отворят пет минути за теб — вземи ги без вина. Не е лукс. 🌸' },
    { a0: 1, a1: 12, t: 'Времето по коремче (tummy time) е малка гимнастика за големи мускулчета. 💪' },
    { a0: 0, a1: 36, t: 'Говори на бебето през целия ден — това е най-мощният урок по говорене. 🗣️' },
    { a0: 3, a1: 36, t: 'Ритуалът преди сън прави чудеса: същият ред всяка вечер. 🌙' },
    { a0: 6, a1: 36, t: 'Намръщената муцунка при нова храна е реакция на новото, не отказ. 🥄' },
    { a0: 0, a1: 36, t: 'Гушкането никога не е „разглезване“ — то гради сигурност. 🤗' },
    { a0: 0, a1: 36, t: 'Ако денят е тежък — това не те прави лоша майка. Утре е нов ден. 💜' },
    { a0: 0, a1: 12, t: '6+ мокри пелени на ден значи, че млякото стига. Спокойно. ✅' },
    { a0: 3, a1: 36, t: 'Слагай бебето сънливо, но будно — учи се да заспива само. 😴' },
    { a0: 6, a1: 24, t: 'Един нов алерген сутрин, после изчакай 3 дни. Внимателно и спокойно. 🍳' },
    { a0: 0, a1: 36, t: 'Ако има кого да помолиш — помоли. „Не мога сама“ е сила, не слабост. 🤝' },
    { a0: 0, a1: 4, t: 'Черно-белите картинки са безплатно шоу за новородено. 👀' },
    { a0: 2, a1: 36, t: 'Смей се с бебето — смехът е първата им любима песен. 😂' }
  ];

  // проход 4 [33]: мъничко силуетче, което сменя позата с месеците (свито →
  // главичка → сяда → изправя се → на крака). Чисто визуално, БЕЗ твърдение
  // „твоето бебе вече сяда" (недоносено може да е зад графика) — за недоносени
  // ползва коригираната възраст. Всеки нов етап се появява с тих pop.
  function bebeAva(a) {
    const m = (a && a.devMonths != null) ? a.devMonths : (a ? a.months : 0);
    const st = m < 3 ? 0 : m < 6 ? 1 : m < 9 ? 2 : m < 12 ? 3 : 4;
    const poses = [
      '<circle cx="24" cy="16" r="9"/><ellipse cx="24" cy="39" rx="14" ry="11"/>',                                    // свито новородено
      '<circle cx="15" cy="21" r="8"/><rect x="11" y="31" width="30" height="12" rx="6"/>',                            // държи главичка (по коремче)
      '<circle cx="24" cy="14" r="8"/><path d="M13 45 Q24 23 35 45 Z"/>',                                              // седи
      '<circle cx="24" cy="12" r="7"/><rect x="19" y="18" width="10" height="20" rx="5"/><rect x="19" y="38" width="4" height="13" rx="2"/><rect x="25" y="38" width="4" height="13" rx="2"/>',  // изправя се
      '<circle cx="24" cy="11" r="7"/><rect x="19" y="17" width="10" height="18" rx="5"/><rect x="14" y="34" width="4" height="14" rx="2" transform="rotate(-13 16 41)"/><rect x="30" y="34" width="4" height="14" rx="2" transform="rotate(13 32 41)"/>'  // прохожда
    ];
    let pop = '';
    try { const prev = load('bl_baby_stage', -1); if (st > prev) pop = ' bb-ava-pop'; saveТихо('bl_baby_stage', st); } catch (e) {}
    return `<div class="td-ava bb-ava${pop}"><svg viewBox="0 0 48 56" class="bb-sil" aria-hidden="true">${poses[st]}</svg></div>`;
  }

  function renderToday(container) {
    const baby = getBaby();
    const a = ageFromBirth(baby.birth);
    if (!a) {
      // 🤰 бременен дом (одит-флот П23, проход 2 №2): има ли bl_lmp, „Днес"
      // посреща със седмицата — не с „кажи ми за бебето" (задънен край, който
      // при това кани бременната да добави несъществуващо бебе). През
      // BL_EXPECT.lmp() → на пауза (загуба) връща '' и НЕ показваме седмици.
      const lmp = (window.BL_EXPECT && BL_EXPECT.lmp) ? BL_EXPECT.lmp() : String(load('bl_lmp', '') || '').replace(/^"|"$/g, '');
      // 🔴 19.08 — ТУК НЯМАШЕ ГОРНА ГРАНИЦА, а стая „Бременност" има.
      //   js/preg.js:week() реже така: `(w >= 1 && w <= 45) ? w : null`.
      //   Тоест две сметки за едно и също нещо, и домашният екран е
      //   по-доверчивият: остаряла или сбъркана дата даваше „Седмица 97 🤰"
      //   на първия екран, който майката вижда. (Измерено от dev/parvata_minuta.js
      //   с термин отпреди 400 дни.) Изворът вече е запушен в онбординга, но
      //   дата може да дойде и от преноса на копие, и от стар запис — затова
      //   границата стои и ТУК, при показването.
      //   Над 45 седмици бременност няма: или е родила и не го е вписала, или
      //   датата е стара. И в двата случая мълчанието е по-честно от число.
      //   ПЪТ НАЗАД: махни `&& _w <= 45` от условието долу.
      const _w = (lmp && !isNaN(new Date(lmp)))
        ? Math.max(1, (window.BL_PREG ? BL_PREG.седмица(new Date(lmp)) : Math.floor((Date.now() - new Date(lmp)) / 604800000))) : 0;
      if (lmp && !isNaN(new Date(lmp)) && _w <= 45) {
        const w = _w;
        const дни = Math.max(0, Math.ceil((new Date(lmp).getTime() + 280 * 86400000 - Date.now()) / 86400000));
        const плод = ((window.BL_DATA || {}).pregWeeks || {})[Math.min(42, Math.max(4, w))] || ['—', '🤍'];
        container.innerHTML =
          `<div class="td-inner td-welcome reveal">
            <div class="td-ava"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></div>
            <div class="td-whello">Седмица ${w} 🤰</div>
            <p class="td-wtext">Бебето е колкото ${esc(плод[0])} ${плод[1]}${дни > 0 ? ` · още <strong>${дни}</strong> ${дни === 1 ? 'ден' : 'дни'} до срещата` : ' · всеки момент! 💜'}</p>
            <button class="btn btn-pink td-onb" type="button"><span class="btn-shine"></span>🤰 Отвори „Бременност“</button>
          </div>`;
        container.querySelector('.td-onb').addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open('Бременност'); });
        return true;
      }
      // приветствие за нови майки — без профил още
      container.innerHTML =
        `<div class="td-inner td-welcome reveal">
          <div class="td-ava"><svg viewBox="0 0 60 96"><use href="#balloonShape"/></svg></div>
          <div class="td-whello">Здравей, мамо! 🌸</div>
          <p class="td-wtext">Дай да те опозная — кажи ми мъничко за бебето и ще ти помагам лично: растеж, хранене, ваксини, съвети за деня.</p>
          <button class="btn btn-pink td-onb" type="button"><span class="btn-shine"></span>✨ Запознай ме с бебето</button>
        </div>`;
      container.querySelector('.td-onb').addEventListener('click', () => { if (window.BL_ONBOARD) BL_ONBOARD.open(); });
      return true;
    }

    const h = new Date().getHours();
    const hello = h < 5 ? 'Будна в малките часове' : h < 11 ? 'Добро утро' : h < 18 ? 'Здравей' : 'Добър вечер';
    const nm = baby.name || 'Бебето';
    const пулСъвети = DAY_TIPS.filter(x => !a || (a.devMonths >= x.a0 && a.devMonths <= x.a1));
    const съвети = пулСъвети.length ? пулСъвети : DAY_TIPS;
    const tip = съвети[(new Date().getDate() + new Date().getMonth()) % съвети.length].t;

    let chips = '';
    const f = load('bl_feed', null);
    if (f) { const mm = Math.floor((Date.now() - f.t) / 60000); chips += `<button class="td-chip" data-room="Моето бебе">🍼 Хранене преди ${Math.floor(mm / 60) ? Math.floor(mm / 60) + 'ч ' : ''}${mm % 60}м</button>`; }
    if (baby.birth) {
      const vax = load('bl_vax', {});
      let next = null;
      // 💉 05.08: първият запис (m:0) е приемът, сложен В РОДИЛНИЯ ДОМ. Празна
      //    отметка в приложение, инсталирано вчера, не е доказателство, че го
      //    няма — а чипът светеше в акцентен вид „Ваксина-прозорец е отворен“
      //    на майка с бебе на 11 дни. Родилният прием не влиза в тревогата.
      VACCINES.forEach((v, i) => { if (!vax[i] && next === null && v.m > 0 && v.m >= a.months - 0.5) next = v; });
      if (next) {
        const dd = BL_DATE.addMonths(baby.birth, next.m);
        chips += dd < new Date()
          ? `<button class="td-chip td-accent" data-room="Здраве и SOS">💉 Ваксина-прозорец е отворен — виж календара</button>`
          : `<button class="td-chip" data-room="Здраве и SOS">💉 Ваксина ≈ ${dd.toLocaleDateString('bg-BG')}</button>`;
      }
    }
    const ci = load('bl_checkins', {})[today()];
    if (ci) chips += `<button class="td-chip" data-room="Дневник на мама">${['😩', '😔', '😐', '🙂', '🥰'][ci.m]} Минутката за теб — взета ✔</button>`;
    else chips += `<button class="td-chip td-accent" data-room="Дневник на мама">💜 Как си днес?</button>`;
    if (window.BL_TODAY_EXTRAS) chips += BL_TODAY_EXTRAS(baby, a);

    // месечнина / рожден ден 🎉
    // 16.3.1: ⚠️ бебе, родено на 31-во, НЕ празнуваше в 30-дневните месеци
    // (сравнявахме голи дати). Сега месечнината идва от BL_DATE.addMonths
    // (клампва към края) — и мило си казва защо е „по-рано“.
    let banner = '';
    const bd = new Date(baby.birth), now = new Date();
    let празнуваме = false, клампнато = false, мес = a.ym;
    if (window.BL_DATE) {
      // при клампване празникът пада ПО-РАНО от голата дата (28<31), затова
      // се проверяват И текущият, И следващият месец — с истинската му бройка
      const дн = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
      [a.ym, a.ym + 1].forEach(м => {
        if (м < 1) return;
        const д = BL_DATE.addMonths(baby.birth, м);
        if (дн(д) === дн(now)) { празнуваме = true; клампнато = д.getDate() !== bd.getDate(); мес = м; }
      });
    } else if (bd.getDate() === now.getDate() && a.ym >= 1) { празнуваме = true; мес = a.ym; }
    if (празнуваме) {
      const label = мес % 12 === 0 ? (мес / 12) + (мес / 12 === 1 ? ' годинка' : ' годинки') : мес + '-месечнина';
      banner = `<div class="td-cheer">🎉 Днес ${esc(nm)} празнува <strong>${esc(label)}</strong>! Прегърни го от нас. 💜${клампнато ? '<br><small>Днес е ' + now.getDate() + '-и, защото този месец е по-къс — месечнината не се губи. 😉</small>' : ''}</div>`;
      if (load('bl_cheer_day', '') !== today()) { saveТихо('bl_cheer_day', today()); setTimeout(() => window.BL_FX && BL_FX.confetti(), 700); }
    }

    container.innerHTML =
      `<div class="td-inner reveal">
        <div class="td-top">
          ${bebeAva(a)}
          <div><div class="td-hello">${hello}! 🌸</div><div class="td-age">${esc(nm)} е на <strong>${esc(a.text)}</strong></div></div>
        </div>
        ${banner}
        <div class="td-tip">💡 ${tip}</div>
        <div class="td-chips">${chips}</div>
      </div>`;
    container.querySelectorAll('.td-chip[data-room]').forEach(b => b.addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open(b.dataset.room); }));
    if (window.BL_TODAY_BIND) BL_TODAY_BIND(container, baby, a);
    return true;
  }
  window.BL_HOME = { render: renderToday };
  window.BL_AGE = ageFromBirth;

  // ═══════════════ ✍️ БЕЛИТЕ ПОЛЕТА — свободни бележки навсякъде ═══════════════

  // 14.4.5: esc() гърмеше на undefined (внесено/повредено копие с друга
  // форма на данните) и събаряше цялата стая. Сега приема всичко.
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '<br>');

  function notesCard(title, sub, key, ph) {
    const c = card(title + ' <span class="jr-sub">' + sub + '</span>');
    const ta = el('textarea', 'jr-paper'); ta.rows = 3; ta.placeholder = ph;
    ta.dataset.draft = 'bl_draft_' + key;          // черновата се пази на мига (даже да затвориш)
    ta.value = load('bl_draft_' + key, '');
    const btn = el('button', 'jr-btn', 'Запази бележката 📌'); btn.type = 'button';
    // 🎤 диктовка направо в полето (за ръце, заети с бебе)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = el('button', 'nt-mic', '🎤'); mic.type = 'button'; mic.setAttribute('aria-label', 'Издиктувай');
      let rec = null;
      mic.addEventListener('click', () => {
        if (rec) { rec.stop(); return; }
        rec = new SR(); rec.lang = 'bg-BG';
        mic.classList.add('rec');
        rec.onresult = e => { ta.value = (ta.value ? ta.value + ' ' : '') + e.results[0][0].transcript; ta.dispatchEvent(new Event('input', { bubbles: true })); };
        rec.onend = () => { mic.classList.remove('rec'); rec = null; };
        rec.onerror = () => { mic.classList.remove('rec'); rec = null; };
        try { rec.start(); } catch (e) { mic.classList.remove('rec'); rec = null; }
      });
      c.appendChild(mic);
    }
    const list = el('div', 'nt-list');
    // 🔴 11.08 КАПАНЪТ НА СНИМКАТА: `load(key)` тук снима масива в мига на
    //    РИСУВАНЕ. Ако на екрана живеят две карти върху един и същ ключ (две
    //    карти-бележник, или стаята нарисувана втори път в скрития панел),
    //    всяка държи СВОЯТА стара снимка — и която запише втора, трие чуждото
    //    мълчаливо. Затова: пресен прочит и при рисуване, и точно преди запис.
    //    Триенето търси бележката по СЪДЪРЖАНИЕ, не по номер в реда — номерът
    //    важи за старата снимка, а складът може да е мръднал оттогава.
    let notes = load(key, []);
    function draw() {
      notes = load(key, []);            // пресен прочит при всяко рисуване
      list.innerHTML = notes.length ? '' : '<p class="jr-privacy">Твоето бяло поле — пиши каквото искаш, колкото искаш. 🤍</p>';
      // 🔴 26.08 (ИЗМЕРЕНО): `[null]` тук гърмеше на `n.t` и убиваше БЯЛОТО
      //    ПОЛЕ — картата, в която мама пише свободно. Едно и също място
      //    обслужва СЕДЕМ стаи, тоест един крив запис гасеше седем карти.
      notes.filter(x => x && x.t != null).slice().reverse().forEach((n, ri) => {
        const row = el('div', 'nt-row');
        row.innerHTML = `<div class="nt-txt">${esc(n.t)}</div><div class="nt-meta"><span>${new Date(n.d).toLocaleDateString('bg-BG')}</span><button class="nt-del" type="button" aria-label="Изтрий">🗑</button></div>`;
        row.querySelector('.nt-del').addEventListener('click', () => {
          const сега = load(key, []);   // пресен прочит ПРЕДИ записа
          const i = сега.findIndex(x => x && x.d === n.d && x.t === n.t);
          if (i > -1) сега.splice(i, 1);
          save(key, сега); draw();
        });
        list.appendChild(row);
      });
    }
    // 🔴 11.08 (обиколка по картите): „Запази бележката 📌“ на празно поле не
    //    правеше нищо и не казваше нищо — мама натиска и решава, че приложението
    //    е блокирало. Сега курсорът влиза в полето и то си казва защо.
    const шът = el('p', 'jr-hint', ''); шът.hidden = true;
    шът.setAttribute('aria-live', 'polite');
    btn.addEventListener('click', () => {
      const v = ta.value.trim();
      if (!v) {
        шът.textContent = '✍️ Полето е празно — напиши нещо и пак бутни. Дори един ред е бележка.';
        шът.hidden = false; ta.focus();
        return;
      }
      шът.hidden = true;
      const сега = load(key, []);       // пресен прочит ПРЕДИ записа (виж капана горе)
      сега.push({ t: v, d: Date.now() });
      // 🔴🔴 25.08 (ИЗМЕРЕНО): тази карта стои в ШЕСТ стаи. При пълна памет
      //    записът падаше мълчаливо, полето се изчистваше и бутонът пишеше
      //    „✔ Запазено“. Тоест написаното от мама изчезваше от екрана И от
      //    паметта, с потвърждение отгоре. Полето вече НЕ се чисти, преди
      //    записът да е минал наистина.
      if (!save(key, сега)) {
        шът.textContent = ПЪЛНА;
        шът.hidden = false;
        btn.textContent = 'Не се побра 😕';
        clearTimeout(btn._t); btn._t = setTimeout(() => { if (btn.isConnected) btn.textContent = 'Запази бележката 📌'; }, 3200);
        return;
      }
      ta.value = ''; save('bl_draft_' + key, '');
      draw();
      // тих знак, че е прието
      btn.textContent = '✔ Запазено';
      clearTimeout(btn._t); btn._t = setTimeout(() => { if (btn.isConnected) btn.textContent = 'Запази бележката 📌'; }, 1800);
      if (window.BL_FX) BL_FX.buzz(10);
      if (key === 'bl_freepage' && window.refreshToday) refreshToday(); // разходката брои реда веднага
    });
    draw();
    c.appendChild(ta); c.appendChild(btn); c.appendChild(шът); c.appendChild(list);
    return c;
  }

  window.BL_NOTES_CARD = notesCard;

  // ── прогрес-пръстен (кръгче „7/12“) ──
  function ringSvg(done, total) {
    const R = 15, C = 2 * Math.PI * R, f = total ? done / total : 0;
    return `<svg class="bl-ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="${R}" fill="none" stroke="#eee7f6" stroke-width="5"/>
      <circle cx="20" cy="20" r="${R}" fill="none" stroke="url(#ringGrad)" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - f)).toFixed(1)}" transform="rotate(-90 20 20)"/>
      <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7a8cb"/><stop offset="1" stop-color="#b9a7e0"/>
      </linearGradient></defs>
      <text x="20" y="24" text-anchor="middle" class="bl-ring-t">${done}</text>
    </svg>`;
  }
  window.BL_RING = ringSvg;

  // ── Лексикон на бебето (за спомен) ──
  function babyLexCard() {
    const c = card('Лексиконът на бебето 🌟 <span class="jr-sub">попълни го — след години е съкровище</span>');
    // 🔴 11.08 капанът на снимката: снимка при рисуване, запис при всяка буква.
    //    Отдолу и двете се четат ПРЯСНО преди записа.
    let lex = load('bl_baby_lexicon', {});
    // 12.13.8: и тати има глас — втора колона със свой отговор
    let dad = load('bl_baby_lexicon_dad', {});
    let двама = load('bl_lex_dad_on', false);
    // 🟠 11.08 (обиколка „редки състояния“): три от трийсетте въпроса питат за
    //    ТАТИ („На кого приличаш според тати“, „Любимата ти игра с тати“,
    //    „Първата ти дума за нас — мама и тати“). Приложението вече ПИТА веднъж
    //    има ли кой да помага (rooms9.js) и уважава отговора в Бременност и в
    //    Дневника (rooms3.js:162) — само тук не го четеше. Жената, натиснала
    //    „🤍 Сама съм“, отваряше книгата-спомен на детето си и намираше три
    //    празни реда, които никога няма да се напълнят — а пръстенът броеше
    //    /30 и „Лексиконът е пълен! 🌟“ ставаше недостижим. Обещание, което
    //    приложението само си е счупило. Същият флаг, същото уважение.
    const сама = load('bl_partner', '') === 'не';
    const ВЪПРОСИ = сама ? D.babyLex.filter(q => !/тати/i.test(q)) : D.babyLex;
    const prog = el('p', 'chk-count chk-ringrow', '');
    c.appendChild(prog);
    // превключвател: показвай ли колоната на тати
    if (!сама) {
      const тог = el('button', 'jr-chip lx-dadtog', двама ? '👨 Тати пише — скрий' : '👨 Нека и тати попълни');
      тог.type = 'button';
      тог.addEventListener('click', () => { двама = !двама; save('bl_lex_dad_on', двама); тог.textContent = двама ? '👨 Тати пише — скрий' : '👨 Нека и тати попълни'; c.querySelectorAll('.lx-dad').forEach(x => x.hidden = !двама); });
      c.appendChild(тог);
    } else { двама = false; }
    ВЪПРОСИ.forEach(q => {
      c.appendChild(el('label', 'onb-lbl', q));
      const inp = el('textarea', 'jr-paper lx-inp'); inp.rows = 1; inp.placeholder = '🌸 мама…';
      inp.value = lex[q] || '';
      inp.addEventListener('input', () => {
        const пресен = load('bl_baby_lexicon', {});   // пресен прочит ПРЕДИ записа
        if (inp.value.trim()) пресен[q] = inp.value.trim(); else delete пресен[q];
        // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): пръстенът „12/30“ се вдигаше и
        //    „Лексиконът е пълен! 🌟“ се празнуваше по копието в ПАМЕТТА. При
        //    паднал запис книгата-спомен на детето оставаше празна, а екранът
        //    я броеше за попълнена. `lex` мърда САМО след потвърден запис.
        if (!save('bl_baby_lexicon', пресен)) return;
        lex = пресен; upd();
        const ld = load('bl_lex_d', {});
        if (lex[q] && !ld[q]) { ld[q] = Date.now(); save('bl_lex_d', ld); } // отговорът в Реката
      });
      inp.addEventListener('change', () => {
        if (ВЪПРОСИ.every(x => lex[x]) && window.BL_FX && !load('bl_lex_done', false)) {
          if (!save('bl_lex_done', true)) return;   // 🔴 25.08: празникът чака записа
          BL_FX.confetti(c); BL_FX.cheer('Лексиконът е пълен! 🌟');
        }
      });
      c.appendChild(inp);
      const inpD = el('textarea', 'jr-paper lx-inp lx-dad'); inpD.rows = 1; inpD.placeholder = '👨 тати…';
      inpD.value = dad[q] || ''; inpD.hidden = !двама;
      inpD.addEventListener('input', () => { dad = load('bl_baby_lexicon_dad', {}); if (inpD.value.trim()) dad[q] = inpD.value.trim(); else delete dad[q]; save('bl_baby_lexicon_dad', dad); });
      c.appendChild(inpD);
    });
    function upd() {
      // броим само показаните въпроси — иначе при „сама съм“ таванът остава 30
      const n = ВЪПРОСИ.filter(x => lex[x]).length;
      // 🤍 11.08 (близнакът на поправката при чеклистите, ред ~1727): недокоснат
      //    лексикон посрещаше мама с „0 / 30 попълнени“ — брояч на това, което
      //    НЕ е направила, върху карта, която е чист подарък и няма срок.
      //    Броенето тръгва с първия ѝ отговор.
      prog.innerHTML = n
        ? ringSvg(n, ВЪПРОСИ.length) + `<span>${n} / ${ВЪПРОСИ.length} попълнени</span>`
        : '<span class="jr-sub">Попълвай по едно, когато ти е кеф — няма срок и няма ред.</span>';
    }
    upd();
    return c;
  }

  // ── Речник на мама (термините, човешки) ──
  function glossaryCard() {
    const c = card('Речник на мама 📖 <span class="jr-sub">какво значат всички тези думи</span>');
    const si = el('input', 'jr-word'); si.type = 'text'; si.placeholder = '🔍 Търси термин… (напр. „персентил“)';
    c.appendChild(si);
    const list = el('div', 'gl-list');
    c.appendChild(list);
    function draw(q) {
      const nq = (q || '').toLowerCase();
      list.innerHTML = '';
      D.glossary.filter(g => !nq || (g.t + ' ' + g.d).toLowerCase().includes(nq)).forEach(g => {
        const row = el('button', 'gl-row'); row.type = 'button';
        row.innerHTML = `<span class="gl-term">${g.t}</span><span class="gl-arr">▾</span><span class="gl-def">${g.d}</span>`;
        row.addEventListener('click', () => row.classList.toggle('open'));
        list.appendChild(row);
      });
      if (!list.children.length) list.appendChild(el('p', 'jr-privacy', 'Няма такъв термин още — питай помощничката!'));
    }
    si.addEventListener('input', () => draw(si.value));
    draw('');
    return c;
  }

  // ── Моите списъци (къстъм чеклисти) ──
  function customListsCard(root) {
    const c = card('Моите списъци ✍️ <span class="jr-sub">създай си собствен чеклист за каквото искаш</span>');
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.type = 'text'; inp.maxLength = 40; inp.placeholder = 'Име на нов списък… (напр. „За морето“)';
    const btn = el('button', 'jr-chip', '+ Създай'); btn.type = 'button';
    row.appendChild(inp); row.appendChild(btn);
    c.appendChild(row);
    const holder = el('div', 'cl-holder');
    c.appendChild(holder);
    // 🔴 11.08 капанът на снимката: снимка при рисуване, запис при клик. Тук
    //    записите намират своя списък по ИМЕ в пресния масив, а не по номер —
    //    номерът важи за старата снимка.
    let lists = load('bl_custom_lists', []);
    function drawAll() {
      lists = load('bl_custom_lists', []);   // пресен прочит при всяко рисуване
      holder.innerHTML = '';
      if (!lists.length) { holder.appendChild(el('p', 'jr-privacy', 'Списък за пътуване, за гости, за бабата… — твой избор, твои точки.')); return; }
      // 🔴 26.08 (ИЗМЕРЕНО): крив bl_custom_lists гърмеше на L.name и на
      //    L.items.filter — и убиваше картата със списъците в Инструменти.
      lists.filter(L => L && L.name != null).forEach((L, li) => holder.appendChild(oneList(L, li)));
    }
    function oneList(L, li) {
      const box = el('div', 'cl-box');
      const head = el('div', 'cl-head');
      const точки = Array.isArray(L.items) ? L.items.filter(i => i) : [];   // 26.08: липсващ items убиваше картата
      head.innerHTML = `<strong>${esc(L.name)}</strong><span>${точки.filter(i => i.done).length}/${точки.length}</span>`;
      const del = el('button', 'nt-del', '🗑'); del.type = 'button';
      // ♿ 11.08 (клавиатура-четец): кошчето беше само картинка — при няколко
      //    списъка четецът не казваше КОЙ ще изтрие.
      del.setAttribute('aria-label', 'Изтрий списъка „' + L.name + '“');
      // 🔴🔴 25.08 (ИЗМЕРЕНО при пълна памет): при паднал запис drawAll() пак се
      //    викаше — списъкът се връщаше на екрана (значи изтриването не е минало),
      //    но заедно с това се пресъздаваха ВСИЧКИ полета „Добави точка…“ и
      //    недописаната точка на мама изчезваше. Рисуваме САМО след потвърден запис.
      del.addEventListener('click', () => { (window.BL_UI ? BL_UI.confirm('Да изтрия ли списъка „' + L.name + '“?', { emoji: '🗑', okText: 'Изтрий', cancelText: 'Остави', danger: true }) : Promise.resolve(confirm('Да изтрия ли списъка „' + L.name + '“?'))).then(да => { if (да) { lists = load('bl_custom_lists', []); const i = lists.findIndex(x => x && x.name === L.name); if (i > -1) lists.splice(i, 1); if (!save('bl_custom_lists', lists)) return; drawAll(); } }); });
      head.appendChild(del);
      box.appendChild(head);
      const ul = el('div', 'jr-wins');
      L.items.forEach((it, ii) => {
        const r = el('button', 'jr-win' + (it.done ? ' done' : '')); r.type = 'button';
        r.innerHTML = `<span class="jr-check">${it.done ? '✔' : ''}</span> ${esc(it.t)}`;
        r.addEventListener('click', () => {
          it.done = !it.done;
          lists = load('bl_custom_lists', []);   // пресен прочит ПРЕДИ записа
          const L2 = lists.find(x => x && x.name === L.name);
          const it2 = L2 && (L2.items || []).find(y => y && y.t === it.t);
          if (it2) it2.done = it.done; else if (L2) L2.items = L.items;
          // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): отметката се рисуваше и конфетите
          //    падаха, дори когато записът не е минал — при следващото отваряне
          //    точката пак е неотметната. Знакът идва СЛЕД записа.
          if (!save('bl_custom_lists', lists)) { it.done = !it.done; return; }
          r.classList.toggle('done'); r.querySelector('.jr-check').textContent = it.done ? '✔' : '';
          head.querySelector('span').textContent = L.items.filter(x => x.done).length + '/' + L.items.length;
          if (it.done && L.items.every(x => x.done) && window.BL_FX) { BL_FX.confetti(r); BL_FX.cheer('Списъкът е готов! 🎉'); }
        });
        ul.appendChild(r);
      });
      box.appendChild(ul);
      const ar = el('div', 'jr-addrow');
      const ai = el('input', 'jr-word'); ai.type = 'text'; ai.maxLength = 80; ai.placeholder = 'Добави точка…';
      ai.setAttribute('aria-label', 'Нова точка в „' + L.name + '“');
      const ab = el('button', 'jr-chip', '+'); ab.type = 'button';
      ab.setAttribute('aria-label', 'Добави точката в „' + L.name + '“');
      // 🔴 11.08: „+“ на празно поле мълчеше напълно. Сега курсорът се връща
      //    в полето — най-краткото „чакам да напишеш“, което екранът може да даде.
      // 🔴🔴 25.08 (ИЗМЕРЕНО при пълна памет): точката влизаше в L.items, после
      //    drawAll() пресъздаваше реда от ПАМЕТТА (където я няма) и трие полето —
      //    написаното изчезваше два пъти. Сега пипаме L.items чак след записа.
      ab.addEventListener('click', () => {
        const v = ai.value.trim();
        if (!v) { ai.focus(); ai.placeholder = 'Напиши точката тук…'; return; }
        const нови = L.items.concat([{ t: v, done: false }]);
        lists = load('bl_custom_lists', []);   // пресен прочит ПРЕДИ записа
        const L2 = lists.find(x => x && x.name === L.name);
        if (L2) L2.items = нови; else lists.push({ name: L.name, items: нови });
        if (!save('bl_custom_lists', lists)) return;
        L.items = нови;
        drawAll();
      });
      ai.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ab.click(); } });
      ar.appendChild(ai); ar.appendChild(ab);
      box.appendChild(ar);
      return box;
    }
    // 🔴 11.08: „+ Създай“ на празно поле — нито дума, нито мигване.
    const шъп = el('p', 'jr-hint', ''); шъп.hidden = true;
    шъп.setAttribute('aria-live', 'polite');
    btn.addEventListener('click', () => {
      const v = inp.value.trim();
      if (!v) { шъп.textContent = '✍️ Дай име на списъка — после ще му трупаме точките.'; шъп.hidden = false; inp.focus(); return; }
      шъп.hidden = true;
      lists = load('bl_custom_lists', []);   // пресен прочит ПРЕДИ записа
      lists.push({ name: v, items: [] });
      // 🔴🔴 25.08 (ИЗМЕРЕНО при пълна памет): полето се чистеше винаги — при
      //    паднал запис името на списъка изчезваше и от паметта, и от екрана.
      if (!save('bl_custom_lists', lists)) return;
      inp.value = ''; drawAll();
      if (window.BL_FX) BL_FX.buzz(10);
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); btn.click(); } });
    c.insertBefore(шъп, holder);   // подсказката стои до полето, не в дъното на картата
    drawAll();
    return c;
  }

  // допълнения по стаи (белите полета + лексиконите)
  const EXTRAS = {
    // 🤍 preg20 обикновено поглъща тази карта в „Прегледът“ — но точно при
    //    ПАУЗА (загуба) сливането не става (preg20.js: `if (стари.length &&
    //    !наПауза())`) и полето оцелява само̀ в иначе празната стая, поканило
    //    я да си запише въпроси за следващия преглед по бременност.
    'Бременност': r => {
      if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return;
      r.appendChild(notesCard('Въпроси за лекаря 📝', 'запиши ги, преди да излетят от главата', 'bl_notes_preg', 'Напр.: „Нормално ли е да…?“ — свободен текст, твоето поле.'));
    },
    'Моето бебе': r => { r.appendChild(babyLexCard()); r.appendChild(notesCard('Бележник за бебето 📝', 'каквото искаш да не забравиш', 'bl_notes_baby', 'Свободен текст — навици, смешки, наблюдения…')); },
    'Захранване': r => r.appendChild(notesCard('Хранителни бележки 📝', 'реакции, любими комбинации, рецепти', 'bl_notes_food', 'Напр.: „Тиквичка + картоф = хит! Ябълката само печена.“')),
    'Здраве и SOS': r => r.appendChild(notesCard('Здравни бележки 📝', 'симптоми, какво каза лекарят', 'bl_notes_health', 'Дата, симптом, съвет на лекаря — да го имаш под ръка.')),
    'Развитие и игри': r => r.appendChild(notesCard('Мигове за спомен 📝', 'малките неща, които не искаш да забравиш', 'bl_notes_dev', 'Днес направи нещо ново…')),
    'Дневник на мама': r => r.appendChild(notesCard('Свободна страница ✍️', 'без структура, без правила — само ти', 'bl_freepage', 'Пиши каквото ти е на сърцето…')),
    'Инструменти': r => { r.appendChild(customListsCard()); r.appendChild(glossaryCard()); }
  };

  // ── регистрация ──
  function reg() {
    if (!window.ROOM_FEATURES) window.ROOM_FEATURES = {};
    Object.assign(window.ROOM_FEATURES, {
      'Моето бебе': renderBaby,
      'Бременност': renderPregnancy,
      'Захранване': renderFeeding,
      'Развитие и игри': renderDevelopment,
      'Инструменти': renderTools,
      'Здраве и SOS': renderHealth
    });
    Object.keys(EXTRAS).forEach(room => {
      const base = window.ROOM_FEATURES[room];
      if (base) window.ROOM_FEATURES[room] = root => { base(root); EXTRAS[room](root); };
    });
  }
  reg();
})();
