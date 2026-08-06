// ═══════════════════════════════════════════════════════════
// 📱 ПЛАВНО — тишина, докато мама скролва
//
// Собственикът каза: „скролът е труден, цялата страница пулсира".
// Измерено на живо при 360px на ЖИВИЯ адрес:
//   · ~1860 елемента на началния екран
//   · 72 РАЗЛИЧНИ безкрайни анимации, 145 работещи едновременно
//
// ПЪРВИЯТ МИ ОПИТ БЕШЕ ГРЕШЕН и го пиша тук, за да не се повтори:
// пазех анимациите с IntersectionObserver, за да спират „извън екрана".
// Хвана 16 елемента и спря НУЛА — защото цялата атмосфера (.sky) е
// `position: fixed`, тоест винаги е в кадър. Наблюдението по видимост
// е сляпо точно за слоя, който тежи най-много.
//
// Истинският лек е по ВРЕМЕ, не по място: докато пръстът се движи,
// браузърът има само една работа — да рисува страницата. Всичко
// останало чака 180 мс след последното движение.
//
// ПЪТ НАЗАД: махни реда за този файл от index.html. Нищо не зависи
// от него; класът само пауза, не мени вид.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var КЛАС = 'bl-tiho';
  var s = document.createElement('style');
  s.textContent =
    'html.' + КЛАС + ' *, html.' + КЛАС + ' *::before, html.' + КЛАС + ' *::after {' +
    '  animation-play-state: paused !important;' +
    '}';
  document.head.appendChild(s);

  var h = document.documentElement;
  var t = 0, тихо = false, спирания = 0;

  function утихни() {
    if (!тихо) { h.classList.add(КЛАС); тихо = true; спирания++; }
    clearTimeout(t);
    t = setTimeout(оживи, 180);
  }
  function оживи() {
    if (тихо) { h.classList.remove(КЛАС); тихо = false; }
  }

  // passive: жестът не се бави заради нас
  var опции = { passive: true };
  addEventListener('scroll', утихни, опции);
  addEventListener('touchmove', утихни, опции);
  addEventListener('wheel', утихни, опции);

  // Скрит таб → нищо не се движи. Пести батерия, докато мама
  // е излязла да види бебето.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearTimeout(t); h.classList.add(КЛАС); тихо = true; }
    else оживи();
  });

  // Отчита се и КОЛКО пъти е спирал — брояч без брой е декорация.
  window.BL_ПЛАВНО = {
    тихо: function () { return тихо; },
    спирания: function () { return спирания; },
    провери: function () {
      var върви = 0, всички = 0;
      var els = document.body.querySelectorAll('*');
      for (var i = 0; i < els.length; i++) {
        var c = getComputedStyle(els[i]);
        if (c.animationName === 'none') continue;
        всички++;
        if (c.animationPlayState === 'running') върви++;
      }
      return { прегледани: els.length, с_анимация: всички,
               вървят_сега: върви, тихо: тихо, спирания: спирания };
    },
    изключи: function () {
      removeEventListener('scroll', утихни, опции);
      removeEventListener('touchmove', утихни, опции);
      removeEventListener('wheel', утихни, опции);
      оживи();
      return 'паузата при скрол е изключена';
    }
  };
})();
