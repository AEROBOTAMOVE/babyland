// ═══════════════════════════════════════════════════════════
// 📱 ПЛАВНО — спира анимациите, които не се виждат
//
// Защо (05.08): собственикът каза „скролът е труден, цялата страница
// пулсира". Измерено на живо при 360px: началният екран носи ~1860
// елемента и 72 РАЗЛИЧНИ безкрайни анимации — облаци, звездички,
// блобове, ореоли, полюшващи се къщички. Повечето са далеч под
// прегъвката, но браузърът ги смята на всеки кадър така или иначе.
// На слаб Android това е точно усещането „лепне и пулсира".
//
// Лекът не е да махнем красотата, а да я СПРЕМ, докато не се вижда.
// IntersectionObserver + animation-play-state: paused.
//
// ПЪТ НАЗАД: махни реда за този файл от index.html — нищо друго не
// зависи от него. Класът, който слага, не мени вида, само паузата.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // Който е поискал по-малко движение, вече е обслужен от CSS —
  // тук няма какво да правим, а и не бива да пипаме нищо.
  var малкоДвижение = window.matchMedia &&
                      matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (малкоДвижение || !('IntersectionObserver' in window)) return;

  var СТИЛ = 'bl-pauza';
  var s = document.createElement('style');
  s.textContent =
    '.' + СТИЛ + ', .' + СТИЛ + ' * { animation-play-state: paused !important; }';
  document.head.appendChild(s);

  // Наблюдаваме едрите атмосферни слоеве и всяка карта — не всеки
  // елемент поотделно. Пауза върху родителя спира и децата му.
  var ЦЕЛИ = [
    '.sky', '.sky-layer', '.hero-inner', '.land-frame',
    '.jr-card', '.room-card', '.horo-ring', '.d24-wheel',
    '.meet', '.room-grid', '.rmx-aurora', '.tour-box'
  ].join(',');

  var набл = new IntersectionObserver(function (записи) {
    for (var i = 0; i < записи.length; i++) {
      var з = записи[i];
      з.target.classList.toggle(СТИЛ, !з.isIntersecting);
    }
  }, {
    // 200px запас: анимацията тръгва преди елементът да се появи,
    // за да не се вижда как „щраква" при скрол
    rootMargin: '200px 0px 200px 0px',
    threshold: 0
  });

  var гледани = 0;

  function поеми(корен) {
    var възли = (корен || document).querySelectorAll(ЦЕЛИ);
    for (var i = 0; i < възли.length; i++) {
      if (възли[i].__blПлавно) continue;
      възли[i].__blПлавно = true;
      набл.observe(възли[i]);
      гледани++;
    }
  }

  function старт() {
    поеми(document);
    // Стаите се раждат след като мама влезе в тях — новите карти
    // трябва да влязат под наблюдение сами.
    if ('MutationObserver' in window) {
      new MutationObserver(function (m) {
        for (var i = 0; i < m.length; i++) {
          for (var j = 0; j < m[i].addedNodes.length; j++) {
            var n = m[i].addedNodes[j];
            if (n.nodeType === 1) {
              if (n.matches && n.matches(ЦЕЛИ) && !n.__blПлавно) {
                n.__blПлавно = true; набл.observe(n); гледани++;
              }
              поеми(n);
            }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', старт);
  } else {
    старт();
  }

  // Отчита се и КОЛКО гледа — пазач, който не казва броя, е декорация.
  window.BL_ПЛАВНО = {
    брой: function () { return гледани; },
    спрени: function () { return document.querySelectorAll('.' + СТИЛ).length; },
    изключи: function () {
      набл.disconnect();
      var сп = document.querySelectorAll('.' + СТИЛ);
      for (var i = 0; i < сп.length; i++) сп[i].classList.remove(СТИЛ);
      return 'наблюдението е спряно, всичко пак се движи';
    }
  };
})();
