// ═══════════════════════════════════════════════════════════
// 🎬 ИЗВЪН ЕКРАНА — каквото не се вижда, не се движи
//
// Собственикът: „началната страница, роудмапа — зацепва леко анимацията,
// нацепва на места."
//
// ИЗМЕРЕНО 12.08, преди да пипна каквото и да е:
//   396 @keyframes в 14 css файла
//   от тях СКЪПИ (пипат подредбата): 0
//   333 БЕЗКРАЙНИ едновременно
//
// 🪤 И ЕДНА МОЯ ГРЕШКА, която за малко да ме прати да „поправям" здраво:
// първият ми скенер каза, че 24 анимации се движат по width/height/top/left.
// Невярно. Изразът беше /@keyframes\s+(\w+)\s*\{([\s\S]*?)\n\}/, а в този
// проект повечето keyframes са на ЕДИН РЕД — затова „\n}" се намираше чак
// няколко реда по-долу и в „тялото" влизаха СЪСЕДНИТЕ правила, които
// естествено съдържат left/top/width. Новият брояч (dev/cena_animacii.js)
// брои скоби и казва: нула скъпи.
//
// Тоест причината НЕ е видът, а БРОЯТ. Всяка е евтина сама; композиторът
// на телефона обработва 333 слоя на кадър, а мама скролва точно тогава.
//
// КАКВО ПРАВИ ТОЗИ ФАЙЛ:
//   Диригентът sceneIO (js/app.js:61) вече гаси сцените ИЗВЪН ЕКРАН — но
//   само за .room-card и #phoneStage. Тук същото се прилага за ВСИЧКО
//   останало, без да се знае нищо за конкретните елементи: намираме кой
//   има безкрайна анимация и го спираме, докато е извън кадър.
//
// ЗАЩО НЕ Е СЪЩОТО КАТО js/plavno.js:
//   plavno.js спира ВСИЧКО по ВРЕМЕ — докато пръстът се движи, 180 мс.
//   Тук спираме по МЯСТО — завинаги, докато елементът е извън екрана.
//   Двете се допълват: едното пази жеста, другото пази батерията.
//
// ⚠ КАПАНЪТ, В КОЙТО ПАДНА ПЪРВАТА ВЕРСИЯ НА plavno.js (и е записан там):
//   наблюдение по видимост е СЛЯПО за `position: fixed` — небето (.sky) е
//   inset:0 и ВИНАГИ е в кадър. Затова тук такива елементи се пропускат
//   изрично: за тях наблюдателят е безполезен и само хаби работа.
//
// ПЪТ НАЗАД: махни реда за този файл от index.html. Нищо не зависи от него;
//   класът само спира анимация и я пуска обратно оттам, откъдето е спряла.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  if (!window.IntersectionObserver) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var КЛАС = 'bl-vun';
  var s = document.createElement('style');
  s.textContent = '.' + КЛАС + ', .' + КЛАС + ' *, .' + КЛАС + '::before, .' + КЛАС + '::after' +
                  ' { animation-play-state: paused !important; }';
  document.head.appendChild(s);

  var наблюдавани = 0, спрени = 0, пропуснатиФиксирани = 0;

  var набл = new IntersectionObserver(function (записи) {
    записи.forEach(function (з) {
      if (з.isIntersecting) {
        if (з.target.classList.contains(КЛАС)) { з.target.classList.remove(КЛАС); спрени--; }
      } else {
        if (!з.target.classList.contains(КЛАС)) { з.target.classList.add(КЛАС); спрени++; }
      }
    });
  }, {
    // 300px запас: анимацията тръгва, преди мама да е стигнала дотам,
    // за да не вижда как нещо „се събужда" под пръста ѝ
    rootMargin: '300px 0px 300px 0px',
    threshold: 0
  });

  // Кой има безкрайна анимация. Гледаме computed style — така хващаме и
  // това, което е сложено от JS, не само от CSS файловете.
  function запиши(корен) {
    var кандидати = (корен || document.body).querySelectorAll('*');
    for (var i = 0; i < кандидати.length; i++) {
      var e = кандидати[i];
      if (e.__blVun) continue;
      var cs = getComputedStyle(e);
      if (cs.animationName === 'none') continue;
      if (cs.animationIterationCount.indexOf('infinite') < 0) continue;
      // 🪤 fixed/sticky са винаги в кадър — наблюдателят е сляп за тях
      if (cs.position === 'fixed' || cs.position === 'sticky') { пропуснатиФиксирани++; e.__blVun = 1; continue; }
      // елемент вътре в друг наблюдаван предшественик — родителят стига
      if (e.closest('.' + КЛАС)) continue;
      e.__blVun = 1;
      набл.observe(e);
      наблюдавани++;
    }
  }

  function тръгни() {
    запиши(document.body);
    // Началната страница дорисува неща след първия кадър (хълма, картите).
    // Два късни огледа хващат тях, без да въртим наблюдател вечно.
    setTimeout(function () { запиши(document.body); }, 1200);
    setTimeout(function () { запиши(document.body); }, 3500);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', тръгни);
  else тръгни();

  window.BL_ИЗВЪН = {
    наблюдавани: function () { return наблюдавани; },
    спрени_сега: function () { return спрени; },
    прегледай_пак: function (корен) { запиши(корен); return наблюдавани; },
    изключи: function () {
      набл.disconnect();
      var в = document.querySelectorAll('.' + КЛАС);
      for (var i = 0; i < в.length; i++) в[i].classList.remove(КЛАС);
      спрени = 0;
      return 'наблюдението е спряно, всичко пак се движи';
    },
    // числото, което има значение: колко ВСЪЩНОСТ вървят сега
    мери: function () {
      var вървят = 0, всички = 0;
      var e = document.querySelectorAll('*');
      for (var i = 0; i < e.length; i++) {
        var cs = getComputedStyle(e[i]);
        if (cs.animationName === 'none') continue;
        всички++;
        if (cs.animationPlayState === 'running') вървят++;
      }
      return { с_анимация: всички, вървят: вървят, спрени_от_мен: спрени,
               наблюдавани: наблюдавани, фиксирани_пропуснати: пропуснатиФиксирани };
    }
  };
})();
