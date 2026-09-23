/* ═══════════════════════════════════════════════════════════════════════════════
   🕰️ ЖИВИЯТ ЧАСОВНИК · секция „Едно денонощие с теб“ · 23.09.2026
   Собственикът: „тоя часовник мега генерация, як жив часовник пак да отмерва“.
   Слагаме истински плюшен циферблат (img/art/chasovnik.webp — генериран по неговата
   референция) с ТРИ стрелки, които се движат по НАСТОЯЩОТО време: часът и минутата
   плавно, секундата — тик по тик, всяка секунда.
   Старият денонощен кръг (js/home.js, .d24-svg) НЕ се пипа: той показва деня като
   дъга, този показва часа. Двата стоят един до друг.
   ПЕСТИ ТОК: спира, когато секцията не се вижда (IntersectionObserver) и когато
   разделът е скрит (visibilitychange) — иначе би въртял 24/7 в джоба на мама.
   ПЪТ НАЗАД: махни <link>/<script> на pl-chas от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_CHAS) return;

  var часовник = null, таймер = 0, вижда = true, наЕкрана = true;

  function НС(име, атр) {
    var е = document.createElementNS('http://www.w3.org/2000/svg', име);
    for (var к in атр) е.setAttribute(к, атр[к]);
    return е;
  }

  function направи() {
    var сек = document.querySelector('.d24-wrap');
    if (!сек || сек.querySelector('.pl-chas')) return sек_готов(сек);
    var обв = document.createElement('div');
    обв.className = 'pl-chas';
    обв.setAttribute('aria-hidden', 'true');           // времето е изписано и с думи отдолу
    obv_html(обв);
    сек.insertBefore(обв, сек.firstChild);
    return sек_готов(сек);
  }
  function sек_готов(сек) { return !!сек; }

  function obv_html(обв) {
    обв.innerHTML =
      '<div class="pl-chas-face">' +
        '<svg class="pl-chas-h" viewBox="0 0 100 100">' +
          '<g class="pl-chas-hh"><rect x="48.4" y="26" width="3.2" height="26" rx="1.6"/></g>' +
          '<g class="pl-chas-mm"><rect x="48.8" y="15" width="2.4" height="37" rx="1.2"/></g>' +
          '<g class="pl-chas-ss"><rect x="49.5" y="12" width="1" height="40" rx=".5"/>' +
            '<circle cx="50" cy="50" r="2.6"/></g>' +
        '</svg>' +
      '</div>' +
      '<div class="pl-chas-t"><b id="plChasT">--:--</b><small id="plChasD">сега при теб</small></div>';
  }

  function завърти() {
    if (!часовник) return;
    var н = new Date();
    var с = н.getSeconds(), м = н.getMinutes(), ч = н.getHours() % 12;
    var гс = с * 6;                                    // 360/60
    var гм = м * 6 + с * .1;
    var гч = ч * 30 + м * .5;
    var ss = часовник.querySelector('.pl-chas-ss');
    var mm = часовник.querySelector('.pl-chas-mm');
    var hh = часовник.querySelector('.pl-chas-hh');
    if (ss) ss.style.transform = 'rotate(' + гс + 'deg)';
    if (mm) mm.style.transform = 'rotate(' + гм + 'deg)';
    if (hh) hh.style.transform = 'rotate(' + гч + 'deg)';
    var т = document.getElementById('plChasT');
    if (т) {
      var ново = ('0' + н.getHours()).slice(-2) + ':' + ('0' + м).slice(-2);
      if (т.textContent !== ново) т.textContent = ново;               // пишем само при разлика
    }
    var д = document.getElementById('plChasD');
    if (д) {
      var ч24 = н.getHours();
      var дума = ч24 < 5 ? 'дълбока нощ · тук сме' : ч24 < 9 ? 'ранна утрин' : ч24 < 12 ? 'предобед'
        : ч24 < 15 ? 'следобед' : ч24 < 19 ? 'привечер' : ч24 < 22 ? 'вечер' : 'нощта е дълга — не си сама';
      if (д.textContent !== дума) д.textContent = дума;
    }
  }

  function пусни() {
    if (таймер || !вижда || !наЕкрана) return;
    завърти();
    таймер = setInterval(завърти, 1000);
  }
  function спри() { if (таймер) { clearInterval(таймер); таймер = 0; } }

  function старт() {
    var сек = document.querySelector('.d24-wrap');
    if (!сек) return false;
    направи();
    часовник = сек.querySelector('.pl-chas');
    if (!часовник) return false;
    document.addEventListener('visibilitychange', function () {
      вижда = !document.hidden;
      if (вижда) пусни(); else спри();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (з) {
        наЕкрана = z_има(з);
        if (наЕкрана) пусни(); else спри();
      }, { threshold: .05 }).observe(часовник);
    }
    пусни();
    return true;
  }
  function z_има(з) { for (var i = 0; i < з.length; i++) if (з[i].isIntersecting) return true; return false; }

  var опити = 0;
  (function чакай() { if (!старт() && ++опити < 80) setTimeout(чакай, 250); })();
  window.BL_PL_CHAS = { завърти: завърти, пусни: пусни, спри: спри };
})();
