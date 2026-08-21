// ═══════════════════════════════════════════════════════════
// 👀 НАБЛЮДАТЕЛЯТ НА „ПОЯВЯВАНЕТО" — тук, а не в js/app.js
//
// ЗАЩО ЖИВЕЕ В ЧУЖД ФАЙЛ (11.08, измерено, не предположено):
//   .reveal е opacity:0 (css/style.css:324). Единственият, който му слагаше
//   .shown, беше IntersectionObserver-ът в js/app.js — а app.js е скрипт
//   №91 от 93, и деветдесет и трите са БЛОКИРАЩИ (0 с defer/async, броено
//   в жив браузър). Тоест всичко на екрана чакаше 3.2 MB JavaScript.
//
//   Измерено на localhost, БЕЗ мрежова забава (Resource Timing):
//     js/store.js  (скрипт №2)  готов на 102 ms
//     js/app.js    (скрипт №91) готов на 451 ms
//   → 4.4 пъти по-рано. На 3G разликата не е 350 ms, а секунди: store.js е
//     9 KB и идва пръв, докато app.js чака да се изтеглят всичките 3.2 MB.
//
//   Не е само първият екран: наблюдателят работи и при СКРОЛ. Затова
//   местенето на самия наблюдател лекува и това, което мама доскролва през
//   тези секунди — нещо, което CSS-заобикалката за героя не може.
//
// ТОВА Е КВАРТИРАНТ. Мястото му е в собствен файл, но нов <script> ред
// иска index.html, който е заключен. Щом главният сложи defer на скриптовете
// (истинският лек), този блок може да се върне в app.js.
//
// ПЪТ НАЗАД: изтрий целия блок и върни в js/app.js старите редове:
//   const revealEls = document.querySelectorAll('.reveal');
//   const io = new IntersectionObserver(...); revealEls.forEach(el => io.observe(el));
// Нищо друго не зависи от него освен онези 2 реда в app.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // Без IntersectionObserver (много стар телефон) нищо да не остане скрито.
  if (!('IntersectionObserver' in window)) {
    const всички = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('shown'));
    всички();
    window.BL_REVEAL = { sweep: всички, observe: всички };
    return;
  }

  const видяни = new WeakSet();   // за да не наблюдаваме един елемент два пъти

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // стъпаловидно: всяко следващо братче тръгва 90 ms по-късно
      const братя = el.parentElement
        ? [...el.parentElement.children].filter(c => c.classList.contains('reveal'))
        : [];
      const idx = братя.indexOf(el);
      el.style.transitionDelay = `${Math.max(0, idx) * 90}ms`;
      el.classList.add('shown');
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  function observe(el) {
    if (!el || видяни.has(el)) return;
    видяни.add(el);
    io.observe(el);
  }

  // досбира всички .reveal, които още не са под наблюдение
  function sweep(root) {
    (root || document).querySelectorAll('.reveal').forEach(observe);
  }

  sweep();                                  // статичните от index.html — веднага
  window.BL_REVEAL = { sweep, observe };    // app.js досбира появилите се после
})();

// ═══════════════════════════════════════════════════════════
// STORE — желязната основа (план 15, Д1) 🧱
// Снимките и звуците се местят ТИХО от localStorage (5 MB таван)
// в IndexedDB (стотици MB). Никой друг модул не се променя:
// прехващаме Storage.setItem/getItem само за медийните ключове.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // bl_lull_rec = маминият глас на приспивните (12.5.4) — аудио в base64,
  // мегабайти. В localStorage щеше да пукне квотата на трета песен.
  // + гласовите/рисунки-складове от rooms15 (диарий 180с, писмо в корема, песнички,
  //   рисунки по месеци) — те също са base64 мегабайти → в IndexedDB, не в localStorage,
  //   и така влизат в архива/износа/истинското триене като останалата медия.
  const MEDIA_KEYS = ['bl_photos', 'bl_dayphoto', 'bl_bump', 'bl_voice', 'bl_baby_sounds', 'bl_art', 'bl_rash', 'bl_food_faces', 'bl_lull_rec', 'bl_voice_diary', 'bl_voice_womb', 'bl_voice_songs', 'bl_art_months', 'bl_wm_inframe'];
  const cache = {};          // ключ → JSON низ (в паметта, винаги синхронно четим)
  let db = null, ready = false;

  // ── 🔴 19.08: МЪЛЧАЛИВАТА ЗАГУБА НА СНИМКИТЕ И ГЛАСОВИТЕ ──
  // За localStorage ИМАШЕ вик при препълване (квотаВик отдолу). За IndexedDB
  // нямаше НИЩО: `if (!db) return;` и `catch (e) {}` — мама записва албума си,
  // вижда „✔ Влезе! Зареждам всичко…“, телефонът се презарежда и снимките ги
  // няма. Никой не ѝ е казал нищо. Това е най-тежкото, което може да се случи
  // при смяна на телефон: единственият ѝ екземпляр.
  //
  // ИЗМЕРЕНО ПРЕДИ поправката (пясъчник, 8 сценария):
  //   база недостъпна (частен режим) → 0 предупреждения, 0 неща на диска
  //   транзакцията abort (пълна база) → 0 предупреждения, 0 неща на диска
  //   put гърми синхронно            → 0 предупреждения, 0 неща на диска
  // И В ДРУГАТА ПОСОКА (за да не крещим напразно):
  //   база работи · нищо не се пише · само текст · пише се ДОКАТО init върви
  //     → 0 предупреждения ПРЕДИ и 0 СЛЕД. Записът, направен преди базата да е
  //       отворена, е НОРМАЛЕН (init го до-персистира) — затова вик има само
  //       след като init е приключил и база НЯМА (`базаПропадна`), не при всяко
  //       `!db`. Наивното „викай щом няма db“ би гърмяло при всяко пускане.
  //
  // ЗАЩО ФЛАГ В ПАМЕТТА НА ТЕЛЕФОНА: викът се появява, а 400 ms по-късно
  // „Възстанови от файл“ презарежда страницата и го отнася. Затова оставяме
  // бележка, която се показва ВЕДНЪЖ след презареждането и се трие веднага.
  // Ключът НАРОЧНО не почва с „bl_“ — иначе щеше да се брои като „запис на
  // майката“ в червения диалог и да пътува в резервното копие на новия телефон.
  // ПЪТ НАЗАД: махни `базаПропадна`, `изтрити`, `медияВик`, `бележка*` и върни
  //   idbSet/idbDel/init към старите им тела (git HEAD 7bd4bd75).
  const БЕЛЕЖКА = 'blx_media_fail';
  let базаПропадна = false;      // init приключи и база НЯМА
  let медияКазана = false;
  const изтрити = new Set();     // триене, поискано ДОКАТО db е null → чака init

  function openDb() {
    return new Promise((res) => {
      try {
        const rq = indexedDB.open('babyland', 1);
        rq.onupgradeneeded = () => { rq.result.createObjectStore('media'); };
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  // писанията се следят, за да може flush() да изчака commit-а ПРЕДИ reload —
  // „Вход" презареждаше на сляпо след 900мс и при голямо копие (гласови,
  // албум) медията тихо изчезваше (одит-флот П23, проход 2 №7)
  const pending = [];
  let провал = 0;              // колко медийни записа НЕ са кацнали в базата
  function idbSet(k, v) {
    if (!db) {
      // ДОКАТО init върви това е нормално — той до-персистира отдолу.
      // След init без база значи, че записът няма къде да отиде. Казваме.
      if (базаПропадна) { провал++; медияВик('nema'); }
      return;
    }
    try {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').put(v, k);
      pending.push(new Promise(res => {
        tx.oncomplete = () => res();
        // 🔴 abort/error = пълна база или отнето право. Дотук мълчеше.
        tx.onerror = tx.onabort = () => { провал++; медияВик('pyalna'); res(); };
      }));
      if (pending.length > 80) pending.splice(0, pending.length - 80);   // не расте безкрай
    } catch (e) { провал++; медияВик('pyalna'); }
  }
  function idbDel(k) {
    // 🔴 19.08 БЛИЗНАКЪТ НА ЗАГУБАТА — ВЪЗКРЪСВАНЕТО. Ако мама изтрие снимка,
    //    докато базата още се отваря (първите стотици ms), триенето падаше в
    //    празното, а init после четеше снимката от диска обратно в кеша.
    //    ИЗМЕРЕНО ПРЕДИ: изтрита снимка → диск: [bl_photos], кеш: [bl_photos].
    //    Тоест изтритото се връщаше на екрана при следващото пускане.
    if (!db) { изтрити.add(k); return; }
    try { db.transaction('media', 'readwrite').objectStore('media').delete(k); } catch (e) { изтрити.add(k); }
  }
  function idbGetAll() {
    return new Promise((res) => {
      if (!db) return res({});
      try {
        const out = {};
        const st = db.transaction('media', 'readonly').objectStore('media');
        const rq = st.openCursor();
        rq.onsuccess = () => {
          const c = rq.result;
          if (c) { out[c.key] = c.value; c.continue(); } else res(out);
        };
        rq.onerror = () => res(out);
      } catch (e) { res({}); }
    });
  }

  // ── прехващачът: медийните ключове живеят в кеша + IndexedDB ──
  const _set = Storage.prototype.setItem;
  const _get = Storage.prototype.getItem;
  const _rem = Storage.prototype.removeItem;
  // 16.2.2: при пълна памет всеки save() мълчеше (catch(e){}) — мама
  // пише, нищо не се пази и никой не ѝ казва. Сега казваме, ВЕДНЪЖ.
  let квотаКазана = false;
  function квотаВик() {
    if (квотаКазана) return;
    квотаКазана = true;
    try {
      const л = document.createElement('div');
      л.className = 'bo-bar on';
      л.style.zIndex = 9700;
      // 🔴 05.08 (одит г14, №304): пращаше към карта „Архив на спомените“,
      //    каквато в приложението няма. Реалната се казва „Какво пази
      //    приложението 💾“ — там пише кое колко място заема.
      л.innerHTML = '<span class="bo-t">⚠️ Паметта на телефона е пълна — НОВОТО не се записва. Виж „Какво пази приложението 💾“ в Инструменти — там пише кое колко заема, за да разчистиш.</span>' +
        '<button class="bo-no" type="button" aria-label="Затвори">✕</button>';
      л.querySelector('.bo-no').addEventListener('click', () => л.remove());
      document.body.appendChild(л);
    } catch (e) {}
  }

  // ── 🔴 викът за снимките и гласовите (19.08) ──
  // Един и същ строител като квотаВик, но за големия склад. Казва се ВЕДНЪЖ
  // на пускане („Кажи всичко, но веднъж“ — не сме папагал), с ЧЕСТЕН текст:
  // текстът ѝ е запазен, снимките — не. Без лекция защо, само какво и какво да
  // направи.
  function лента(текст, зет) {
    const сложи = () => {
      try {
        if (!document.body) return;
        const л = document.createElement('div');
        л.className = 'bo-bar on';
        л.style.zIndex = зет;
        л.innerHTML = '<span class="bo-t">' + текст + '</span>' +
          '<button class="bo-no" type="button" aria-label="Затвори">✕</button>';
        л.querySelector('.bo-no').addEventListener('click', () => л.remove());
        document.body.appendChild(л);
      } catch (e) {}
    };
    // store.js е скрипт №2 — при много ранен провал <body> още го няма
    if (document.body) сложи();
    else try { document.addEventListener('DOMContentLoaded', сложи, { once: true }); } catch (e) {}
  }
  const ТЕКСТ = {
    nema: '⚠️ <strong>Снимките и гласовите НЕ се записаха.</strong> Този телефон (или „частният/инкогнито“ прозорец) не дава на приложението големия склад. Записките и числата ти са запазени — снимките и звуците ще ги няма, щом затвориш. Отвори приложението в обикновен прозорец и ги сложи пак.',
    pyalna: '⚠️ <strong>Снимките и гласовите НЕ се записаха — няма място.</strong> Записките и числата ти са запазени. Виж „Какво пази приложението 💾“ в Инструменти, разчисти и ги сложи пак.'
  };
  // 🔒 Стойността на бележката идва от паметта на телефона, тоест е ВХОД, а
  //    текстът ѝ влиза в innerHTML. Без този филтър `ТЕКСТ[б]` би върнал
  //    каквото и да е от прототипа (напр. 'constructor'). Пускаме САМО двете
  //    познати думи — както js/profile.js:99 пуска само чист data:image.
  const текстЗа = вид => (вид === 'nema' ? ТЕКСТ.nema : ТЕКСТ.pyalna);
  function медияВик(вид) {
    // бележката преживява презареждането (виж БЕЛЕЖКА горе) — пише се дори
    // когато лентата вече е показана веднъж, за да не се загуби причината
    try { _set.call(localStorage, БЕЛЕЖКА, вид === 'nema' ? 'nema' : 'pyalna'); } catch (e) {}
    if (медияКазана) return;
    медияКазана = true;
    лента(текстЗа(вид), 9701);
  }
  Storage.prototype.setItem = function (k, v) {
    if (this === window.localStorage && MEDIA_KEYS.includes(k)) {
      cache[k] = String(v);
      idbSet(k, cache[k]);
      return;
    }
    try {
      return _set.apply(this, arguments);
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) квотаВик();
      throw e;                                   // модулният catch си остава — но мама ВЕЧЕ знае
    }
  };
  Storage.prototype.getItem = function (k) {
    if (this === window.localStorage && MEDIA_KEYS.includes(k)) {
      return (k in cache) ? cache[k] : _get.apply(this, arguments); // до миграцията — старото място
    }
    return _get.apply(this, arguments);
  };
  Storage.prototype.removeItem = function (k) {
    if (this === window.localStorage && MEDIA_KEYS.includes(k)) { delete cache[k]; idbDel(k); }
    return _rem.apply(this, arguments);
  };

  // ── стартът: зареди IndexedDB в кеша + пренеси старото от localStorage ──
  const init = openDb().then(async (d) => {
    db = d;
    базаПропадна = !d;                 // ЧАК СЕГА „!db“ значи загуба, не „още не е готова“
    const stored = await idbGetAll();
    // 🔴 19.08: изтритото ДОКАТО базата се отваряше — първо го махни от диска,
    //    иначе редът отдолу го чете обратно в кеша и снимката възкръсва.
    изтрити.forEach(k => { delete stored[k]; idbDel(k); });
    изтрити.clear();
    // проход 3 T8: НЕ тъпчи по-новото. Ако мама запише снимка/глас, докато
    // курсорът на idbGetAll върви (секунди при стотици MB), кешът вече е по-нов
    // от диска — Object.assign щеше да върне старата стойност и записът се губи.
    Object.keys(stored).forEach(k => { if (!(k in cache)) cache[k] = stored[k]; });
    // до-персистирай каквото е писано, докато db беше null (idbSet тогава е no-op)
    Object.keys(cache).forEach(k => { if (stored[k] !== cache[k]) idbSet(k, cache[k]); });
    // тиха миграция: каквото още е в localStorage → в IndexedDB и вън от LS
    MEDIA_KEYS.forEach(k => {
      const old = _get.call(localStorage, k);
      if (old !== null) {
        if (!(k in cache)) { cache[k] = old; idbSet(k, old); }
        try { _rem.call(localStorage, k); } catch (e) {}
      }
    });
    ready = true;
    // ── бележката от МИНАЛОТО пускане ──
    // „Възстанови от файл“ показва „✔ Влезе!“ и презарежда след 400 ms —
    // лентата, показана в онзи момент, си отива с презареждането. Затова я
    // повтаряме ВЕДНЪЖ тук и веднага трием бележката: тя вече е чута.
    // Ако базата пак не работи, idbSet горе ще я напише отново.
    try {
      const б = _get.call(localStorage, БЕЛЕЖКА);
      if (б) {
        _rem.call(localStorage, БЕЛЕЖКА);
        if (!медияКазана) { медияКазана = true; лента(текстЗа(б), 9701); }
      }
    } catch (e) {}
  });

  // ── за резервното копие и памет-мениджъра ──
  function mediaDump() { return Object.assign({}, cache); }
  function mediaRestore(dump) {
    Object.keys(dump || {}).forEach(k => { if (MEDIA_KEYS.includes(k)) { cache[k] = dump[k]; idbSet(k, dump[k]); } });
  }
  function usage() {
    let media = 0, texts = 0;
    Object.values(cache).forEach(v => { media += (v || '').length; });
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); texts += (_get.call(localStorage, k) || '').length; } } catch (e) {}
    return { mediaKB: Math.round(media / 1024), textsKB: Math.round(texts / 1024) };
  }

  // ── 🗑️ Истинското изтриване (4.7.9) ──
  // Текстовете си отиват с localStorage.clear(), но снимките и звуците живеят
  // в IndexedDB — тях localStorage не ги вижда. Без това „Изтрий всичко“ щеше
  // да остави най-личното (снимките) на телефона и да ѝ каже, че е изтрито.
  function wipe() {
    Object.keys(cache).forEach(k => delete cache[k]);
    MEDIA_KEYS.forEach(k => { try { idbDel(k); } catch (e) {} });
    // 🔴 „Изтрий всичко“ в rooms7 мете САМО ключове с „bl_“. Бележката нарочно
    //    не е такава — ако остане, празното приложение би изкрещяло за загубени
    //    снимки при първото си пускане. Затова я махаме тук изрично.
    try { _rem.call(localStorage, БЕЛЕЖКА); } catch (e) {}
    провал = 0; медияКазана = false; изтрити.clear();
    // и самата база, за да не остане нищо по ръбовете
    try {
      if (db) { db.close(); db = null; }
      indexedDB.deleteDatabase('babyland');   // името е същото като при open()
    } catch (e) {}
  }

  // mediaOK() — за КОЙТО ПИШЕ „✔ Влезе!“ (js/profile.js, js/rooms2.js).
  // Връща false, ако поне един медиен запис НЕ е кацнал в базата. Тогава
  // надписът „Влезе“ е лъжа за снимките и гласовите: те са само в паметта и
  // изчезват при презареждането, което самият надпис прави 400 ms по-късно.
  // Ползване: await BL_STORE.flush(); if (!BL_STORE.mediaOK()) …друг надпис…
  window.BL_STORE = {
    init, mediaDump, mediaRestore, usage, wipe, MEDIA_KEYS,
    isReady: () => ready,
    mediaOK: () => провал === 0,
    flush: () => Promise.allSettled(pending.slice())
  };
})();
