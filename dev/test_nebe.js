// ═══════════════════════════════════════════════════════════
// 🌌 НЕБЕТО И БАЛОНЧЕТО — доказва двете поправки от 12.08 в браузъра
//
// Мери две неща, които статичният преглед НЕ може да види:
//   1. спира ли небето, когато отгоре има отворена стая (20-те „вечни")
//   2. пипа ли скрол-балончето подредбата (width/left) — или вече само transform
//
// 🪤 КАПАНИТЕ, ЗАПИСАНИ В ТОЗИ ПРОЕКТ И ЗАОБИКОЛЕНИ ТУК:
// · СКРИТ ТАБ НЕ ПУСКА requestAnimationFrame — мълчи по 9.9 сек, а setTimeout
//   гърми за 0. Затова тук НИЩО не чака кадър: чака се със setTimeout.
// · SERVICE WORKER връща старо копие; cache:'reload' НЕ помага. Този тест
//   работи върху ЖИВИЯ DOM, не тегли файлове — затова е имунизиран.
// · getComputedStyle('animationPlayState') ЛЪЖЕ: остава 'running' завинаги за
//   свършили ЕДНОКРАТНИ анимации. Затова тук се брои през getAnimations(),
//   което дава истинското състояние. (Мерено 12.08: старият начин надуваше 2.4×.)
//
// ПУСКАНЕ: отвори приложението и в конзолата:  BL_TEST_NEBE()
// ПЪТ НАЗАД: файлът само чете и връща класове, както ги е заварил.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var КЛ = 'bl-vun';
  function изчакай(мс) { return new Promise(function (г) { setTimeout(г, мс); }); }

  function върви() {
    var n = 0;
    if (!document.getAnimations) return -1;
    document.getAnimations().forEach(function (a) { if (a.playState === 'running') n++; });
    return n;
  }

  function небеВърви() {
    var s = document.querySelector('.sky');
    if (!s || !document.getAnimations) return -1;
    var n = 0;
    document.getAnimations().forEach(function (a) {
      var t = a.effect && a.effect.target;
      if (t && s.contains(t) && a.playState === 'running') n++;
    });
    return n;
  }

  window.BL_TEST_NEBE = function () {
    var из = [], зле = 0, проверки = 0;
    // всяка мярка казва И КОЛКО Е ПРЕГЛЕДАЛА — „0 находки" без брой прегледани
    // значи „0 прегледани", а не „чисто". Този проект го е плащал многократно.
    function ред(ок, т) { проверки++; if (!ок) зле++; из.push((ок ? '✅ ' : '🔴 ') + т); }

    из.push('🌌 НЕБЕТО И БАЛОНЧЕТО');
    из.push('');

    // ── 1 · има ли изобщо какво да се мери
    var sky = document.querySelector('.sky');
    ред(!!sky, 'намерено .sky: ' + (sky ? 'да' : 'НЕ — тестът е безпредметен'));
    ред(!!document.getAnimations, 'getAnimations() е налично: ' + !!document.getAnimations);
    if (!sky || !document.getAnimations) return из.join('\n');

    // 🪤 ПЪРВАТА ВЕРСИЯ НА ТОЗИ ТЕСТ ЛЪЖЕШЕ И ЩЕШЕ ДА МЕ ПРАТИ ДА „ПОПРАВЯМ"
    // ЗДРАВА ПОПРАВКА. Тя мереше „колко върви СЕГА" и чакаше числото да падне,
    // когато отворя стая. Но в СКРИТ таб `document.hidden` е true, спирачката
    // вече е сложена и изходната точка е 0 → 0 → присъда „не спря".
    // Тоест тестът обяви за счупено точно правилното поведение.
    // Сега се мери РАЗЛИКАТА, а не състоянието: махам класа, броя; връщам го,
    // броя пак. Това е вярно и при скрит, и при видим таб.
    из.push('   таб: ' + (document.hidden ? 'СКРИТ (спирачката е активна по устройство)' : 'видим'));
    var бешеКласът = sky.classList.contains(КЛ);

    sky.classList.remove(КЛ);
    return изчакай(150).then(function () {
      var без = небеВърви();
      sky.classList.add(КЛ);
      return изчакай(150).then(function () {
        var със = небеВърви();
        ред(без > 0, 'небето изобщо има какво да се гаси: ' + без + ' анимации');
        ред(със === 0, 'спирачката ги гаси ВСИЧКИТЕ: ' + без + ' → ' + със);
        sky.classList.remove(КЛ);
        return изчакай(150);
      }).then(function () {
        ред(небеВърви() === без, 'и ги ВРЪЩА, откъдето са спрели: → ' + небеВърви());

        // ── 2 · сега самият код: слага ли спирачката, когато стая покрива
        var о = document.getElementById('roomOverlay');
        ред(!!о, 'намерен #roomOverlay: ' + (о ? 'да' : 'НЕ'));
        if (!о) { sky.classList.toggle(КЛ, бешеКласът); return; }
        var бешеСкрит = о.hidden;
        о.hidden = false;
        // MutationObserver е асинхронен — чака се със setTimeout, НЕ с rAF,
        // защото в скрит таб rAF не се пуска изобщо (мълчи по 9.9 сек).
        return изчакай(200).then(function () {
          ред(sky.classList.contains(КЛ), 'кодът САМ сложи спирачката при отворена стая');
          о.hidden = бешеСкрит;
          return изчакай(200);
        }).then(function () {
          ред(sky.classList.contains(КЛ) === document.hidden,
            'и я маха при затваряне (остава само ако табът е скрит): клас=' +
            sky.classList.contains(КЛ) + ' скрит=' + document.hidden);

          // ── 3 · балончето: пипа ли подредбата
          из.push('');
          из.push('🎈 СКРОЛ-БАЛОНЧЕТО');
          var t = document.querySelector('.scrollfly-trail');
          var b = document.querySelector('.scrollfly-b');
          ред(!!t && !!b, 'намерени .scrollfly-trail и .scrollfly-b');
          if (t && b) {
            var ct = getComputedStyle(t), cb = getComputedStyle(b);
            ред(ct.transitionProperty.indexOf('width') < 0,
              'няма преход по width (беше .15s на всеки кадър): ' + ct.transitionProperty);
            ред(cb.transitionProperty.indexOf('left') < 0,
              'няма преход по left: ' + cb.transitionProperty);
            ред(!t.style.width, 'js вече не пише inline width: „' + (t.style.width || '') + '"');
            ред(!b.style.left, 'js вече не пише inline left: „' + (b.style.left || '') + '"');
            ред(!!t.style.transform || ct.transform !== 'none',
              'пътят се движи с transform: ' + (t.style.transform || ct.transform));
          }

          из.push('');
          из.push('   ПРЕГЛЕДАНИ: ' + проверки + ' проверки · ' + без + ' анимации в небето · ' +
                  върви() + ' анимации вървят в цялата страница');
          из.push(зле ? '🔴 ' + зле + ' ПАДНАЛИ от ' + проверки : '✅ ЧИСТО — ' + проверки + ' проверки');
        });
      }).then(function () { return из.join('\n'); });
    });
  };
})();
