// ═══════════════════════════════════════════════════════════
// 🗣️ ГЛАСЪТ — женски, не мъжки
//
// Собственикът, 25.08.2026: „чувах някъв глас си пуснал, надявам се да не
// остане този ужасен мъжки неприятен дрезгав глас, искам женски да е."
//
// ИЗМЕРЕНО: приложението говори на ПЕТ места — четенето на статия на глас
// (articles.js), приспивните (extras.js, extras2.js, games2.js) и звучетата
// (games2.js). НИТО ЕДНО от тях не избира глас: строи се
// `new SpeechSynthesisUtterance(...)`, слага се `u.lang = 'bg-BG'` и толкова.
// Тогава браузърът дава ГЛАСА ПО ПОДРАЗБИРАНЕ за български — а на Windows
// това е „Microsoft Ivan", мъжки. Оттам идва дрезгавият глас.
//
// ЗАЩО ТОЗИ ФАЙЛ НЕ ПИПА ПЕТТЕ МЕСТА:
// Ако сменя гласа на пет места, шестото — написано утре — пак ще е мъжко.
// Затова тук се слага капан върху САМОТО говорене: всяко изричане, което не
// си е избрало глас, получава женския. Едно място, важи и занапред.
//
// 🪤 КАПАНИТЕ, ВСИЧКИ ОБМИСЛЕНИ ПРЕДИ ДА СЕ НАПИШЕ:
//   · `getVoices()` почти винаги връща ПРАЗЕН списък при първото извикване —
//     гласовете идват по-късно и браузърът се обажда с `voiceschanged`.
//     Затова списъкът се препрочита и при събитието, и при всяко говорене.
//   · Уеб стандартът НЯМА поле за пол. Единственото, по което може да се
//     съди, е ИМЕТО. Затова тук има поименен списък, а не догадка.
//   · Чужд глас за български текст е по-лошо от мъжки български — думите
//     стават неразбираеми. Затова българският език е с най-голяма тежест;
//     женски глас на друг език НЕ се избира.
//   · Ако единственият български глас е мъжки (Windows често е точно така),
//     не се сменя езикът — вдига се височината, за да звучи по-меко. Това е
//     смекчаване, не решение, и е казано открито.
//   · Ако извикващият САМ си е избрал глас, не му се пипа нищо.
//
// ПРОВЕРКА: node dev/test_glas.js
// ПЪТ НАЗАД: махни реда за този файл от index.html. Говоренето се връща към
//   гласа по подразбиране — точно днешното поведение.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') return;

  // 🪤 Зареди ли се файлът два пъти (кеш, дублиран script, презареждане на
  //   част от страницата), без този пазач капанът щеше да се сложи ВЪРХУ
  //   собствения си капан — работи, но всяко говорене минава през два слоя,
  //   а третото зареждане — през три. Слага се веднъж.
  if (speechSynthesis.__blГласПазен) return;
  speechSynthesis.__blГласПазен = 1;

  // Имена на ЖЕНСКИ гласове, които се срещат за български и в съседните езици.
  // iOS дава „Daria" за български; Android/Google дават „български" женски;
  // Windows има само мъжкия „Ivan" (затова долу има и смекчаване).
  var ЖЕНСКИ = /(daria|дария|ralitsa|ралица|silvia|силвия|elena|елена|maria|мария|female|woman|жен)/i;
  var МЪЖКИ = /(ivan|иван|male\b|man\b|георги|georgi|dimitar|димитър|мъж)/i;

  var избран = null, търсено = false;
  var КЛЮЧ = 'bl_glas';                 // името на гласа, който мама си е избрала
  var запазено = null;
  try { запазено = localStorage.getItem(КЛЮЧ) || null; } catch (e) {}

  function оцени(г) {
    var т = 0;
    var език = String(г.lang || '').toLowerCase();
    if (език.indexOf('bg') === 0) т += 100;          // български е задължителен за български текст
    else return -1;                                   // чужд глас чете българското неразбираемо
    if (ЖЕНСКИ.test(г.name)) т += 50;
    if (МЪЖКИ.test(г.name)) т -= 50;
    if (г.localService) т += 5;                       // местният не иска мрежа
    return т;
  }

  function избери() {
    var гласове = [];
    try { гласове = speechSynthesis.getVoices() || []; } catch (e) { return null; }
    if (!гласове.length) return null;
    // изборът на мама тежи повече от всяка моя оценка
    if (запазено) {
      for (var j = 0; j < гласове.length; j++)
        if (гласове[j].name === запазено) { избран = гласове[j]; търсено = true; return избран; }
    }
    var най = null, найТ = -1;
    for (var i = 0; i < гласове.length; i++) {
      var т = оцени(гласове[i]);
      if (т > найТ) { найТ = т; най = гласове[i]; }
    }
    if (найТ < 0) return null;                        // няма нито един български
    избран = най; търсено = true;
    return най;
  }

  try { speechSynthesis.addEventListener('voiceschanged', избери); } catch (e) {}
  избери();                                           // ако вече са налични

  var истинскиSpeak = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = function (u) {
    try {
      if (u && !u.voice) {
        var г = избран || избери();
        if (г) {
          u.voice = г;
          if (!u.lang) u.lang = г.lang;
          // смекчаване: остана ли само мъжки български, го правим по-мек.
          // Не сменяме езика — чужд глас би направил думите неразбираеми.
          if (МЪЖКИ.test(г.name) && !ЖЕНСКИ.test(г.name)) {
            u.pitch = Math.min(2, (typeof u.pitch === 'number' ? u.pitch : 1) + 0.35);
          }
        }
      }
    } catch (e) {}
    return истинскиSpeak(u);
  };

  // ═══════════════════════════════════════════════════════════
  // 🎚️ И ИЗБОР ЗА МАМА — защото автоматиката НЕ ВИНАГИ МОЖЕ
  //
  // ИЗМЕРЕНО на живо 25.08 в Windows: на машината има ЧЕТИРИ гласа и само
  // ЕДИН български — „Microsoft Ivan", мъжки. Другите три са английски
  // (David, Mark, Zira). Женската Zira би изчела кирилицата по английски —
  // тоест неразбираемо. Значи на Windows автоматиката НЯМА какво да избере.
  // На телефон е друго: българският глас на Android и iOS обикновено е
  // женски. Затова тук стои и РЪЧЕН избор, който се помни — и честна дума,
  // когато женски български просто липсва на устройството.
  //
  // 🪤 Картата се закача за „Инструменти" през ROOM_FEATURES, както го правят
  //   другите 214 места. Този файл се зарежда СЛЕД rooms.js (ред 1409 срещу
  //   1398 в index.html), тоест веригата вече съществува.
  // ПЪТ НАЗАД: махни този блок — говоренето и автоматичният избор остават.
  // ═══════════════════════════════════════════════════════════
  function картаГлас() {
    var c = document.createElement('section'); c.className = 'jr-card';
    var h = document.createElement('h4'); h.className = 'jr-title';
    h.innerHTML = 'Гласът, който ти чете 🗣️ <span class="jr-sub">приспивните и статиите на глас</span>';
    c.appendChild(h);

    var гласове = [];
    try { гласове = (speechSynthesis.getVoices() || []).slice(); } catch (e) {}
    var бг = гласове.filter(function (г) { return String(г.lang || '').toLowerCase().indexOf('bg') === 0; });

    var р = document.createElement('p'); р.className = 'jr-privacy';
    if (!гласове.length) {
      р.textContent = 'Този телефон още не е дал списък с гласове. Отвори картата пак след малко.';
      c.appendChild(р); return c;
    }
    if (!бг.length) {
      р.innerHTML = '⚠️ На това устройство <strong>няма инсталиран български глас</strong>. ' +
        'Четенето на глас ще звучи странно. В настройките на телефона (Език и въвеждане → Гласово четене) ' +
        'може да се добави български.';
    } else if (!бг.some(function (г) { return ЖЕНСКИ.test(г.name); })) {
      р.innerHTML = 'На това устройство единственият български глас е <strong>мъжки</strong> (' +
        бг.map(function (г) { return г.name; }).join(', ') + '). Направих го по-мек, но женски български глас тук просто липсва. ' +
        'На повечето телефони българският глас Е женски.';
    } else {
      р.innerHTML = 'Избран е <strong>женски</strong> български глас. Може да го смениш оттук.';
    }
    c.appendChild(р);

    var сел = document.createElement('select'); сел.className = 'jr-word';
    сел.setAttribute('aria-label', 'Кой глас да чете');
    var подредени = бг.concat(гласове.filter(function (г) { return бг.indexOf(г) < 0; }));
    подредени.forEach(function (г) {
      var o = document.createElement('option');
      o.value = г.name;
      o.textContent = г.name + (ЖЕНСКИ.test(г.name) ? ' · женски' : (МЪЖКИ.test(г.name) ? ' · мъжки' : '')) +
                      ' (' + г.lang + ')';
      if (избран && г.name === избран.name) o.selected = true;
      сел.appendChild(o);
    });
    сел.style.minHeight = '44px';
    сел.addEventListener('change', function () {
      запазено = сел.value;
      try { localStorage.setItem(КЛЮЧ, запазено); }
      catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return; }   // не лъжем за успех
      избери();
      бележка.textContent = 'Готово — оттук нататък ще чета с този глас. 💜';
    });
    c.appendChild(сел);

    var чуй = document.createElement('button'); чуй.type = 'button';
    чуй.className = 'jr-chip'; чуй.textContent = '🔊 Чуй как звучи';
    чуй.style.minHeight = '44px';
    чуй.addEventListener('click', function () {
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance('Спи, детенце, спи. Мама е до теб.');
        u.lang = 'bg-BG'; u.rate = 0.9;
        speechSynthesis.speak(u);          // капанът горе ще сложи избрания глас
      } catch (e) {}
    });
    c.appendChild(чуй);

    var бележка = document.createElement('p'); бележка.className = 'jr-sub';
    c.appendChild(бележка);
    return c;
  }

  try {
    var база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
    if (база) window.ROOM_FEATURES['Инструменти'] = function (root) { база(root); root.appendChild(картаГлас()); };
  } catch (e) {}

  window.BL_GLAS = {
    карта: картаГлас,
    запази: function (име) { запазено = име; try { localStorage.setItem(КЛЮЧ, име); } catch (e) {} return избери(); },
    избран: function () { return избран ? { име: избран.name, език: избран.lang } : null; },
    женски: function () { return !!(избран && ЖЕНСКИ.test(избран.name)); },
    българскиГласове: function () {
      try { return (speechSynthesis.getVoices() || []).filter(function (г) {
        return String(г.lang || '').toLowerCase().indexOf('bg') === 0; })
        .map(function (г) { return г.name + ' (' + г.lang + ')'; }); } catch (e) { return []; }
    },
    пребери: избери,
    оцени: оцени,
    ЖЕНСКИ: ЖЕНСКИ, МЪЖКИ: МЪЖКИ
  };
})();
