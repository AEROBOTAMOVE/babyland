/* ═══════════════════════════════════════════════════════════════════════════════
   🔥 ЗАТОПЛЯНЕТО НА КАРТИТЕ · 15.11.2026 (чат „екрани“, по анализ 2 на главния чат)
   Картите в стаята са `content-visibility: auto; contain-intrinsic-size: auto 220px` (css/mega.css:336):
   извън екрана не се рисуват и стоят „на ужким“ по 220 px. Затова при разгъване или скок изведнъж се
   подреждат много спящи карти — бавните кадри „без скрипт“ (butoni_proba: 160–330 ms при натиск).
   ТУК: в безделие (requestIdleCallback; без него — setTimeout) се взима ЕДНА непрегъната карта ПОД видимото,
   рисува се истински два кадъра (клас bl-topla → content-visibility: visible, css/pl-start.css) и пак заспива —
   но вече помни истинската си височина (contain-intrinsic-size: auto). Само ПОД видимото: над нея нищо не се
   мести, мама не вижда нищо. Спира при допир, колелце и превъртане; продължава, щом стане тихо.
   Всяка карта — веднъж (data-bl-topla). Нова стая (нови карти) → почва отначало. Анимация няма.
   ПЪТ НАЗАД: махни <script src="js/pl-topla.js"> от index.html — картите се държат точно както преди.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var КЛАС = 'bl-topla';
  var ПРАГ = 8;              // мс свободно време в кадъра на безделието, под него — чакаме следващото
  var ТИШИНА = 700;          // мс след последния допир/превъртане, преди да продължим
  var СЛЕД_СТАЯТА = 1500;    // мс след построяването на стаята (входът на картите да си мине)

  var ric = window.requestIdleCallback
    ? function (f) { return window.requestIdleCallback(f); }
    : function (f) { return setTimeout(function () { f({ didTimeout: false, timeRemaining: function () { return 12; } }); }, 250); };
  var cic = window.cancelIdleCallback ? function (h) { window.cancelIdleCallback(h); } : function (h) { clearTimeout(h); };

  var чака = 0, спряно = false, тТихо = 0, тСтая = 0;

  function стая() {
    var о = document.getElementById('roomOverlay'), р = document.getElementById('roRoom');
    if (!о || о.hidden || !р || р.hidden || document.hidden) return null;
    return р;
  }

  // първата непрегъната, незатоплена карта, чийто горен ръб е под долния ръб на видимото
  function следваща(р) {
    var долу = р.getBoundingClientRect().bottom;
    var деца = р.children;
    for (var i = 0; i < деца.length; i++) {
      var к = деца[i];
      if (!к.classList || !к.classList.contains('jr-card') || к.classList.contains('folded') || к.dataset.blTopla) continue;
      if (к.getBoundingClientRect().top <= долу) continue;
      return к;
    }
    return null;
  }

  function работи(срок) {
    чака = 0;
    if (спряно) return;
    var р = стая(); if (!р) return;
    if (срок && !срок.didTimeout && срок.timeRemaining() <= ПРАГ) { планирай(); return; }
    var к = следваща(р);
    if (!к) return;                                   // всичко под видимото е затоплено
    к.dataset.blTopla = '1';
    к.classList.add(КЛАС);
    requestAnimationFrame(function () { requestAnimationFrame(function () { к.classList.remove(КЛАС); планирай(); }); });
  }

  function планирай() { if (чака || спряно) return; чака = ric(работи); }

  function спри() {
    if (чака) { cic(чака); чака = 0; }
    спряно = true;
    clearTimeout(тТихо);
    тТихо = setTimeout(function () { спряно = false; планирай(); }, ТИШИНА);
  }

  function новаСтая() {
    clearTimeout(тСтая);
    тСтая = setTimeout(планирай, СЛЕД_СТАЯТА);
  }

  function тръгни() {
    var р = document.getElementById('roRoom'), о = document.getElementById('roomOverlay');
    if (!р || typeof MutationObserver === 'undefined') return;
    // стаята се изпразва и пълни наново при всяко отваряне; табът и затварянето превключват hidden
    try { new MutationObserver(новаСтая).observe(р, { childList: true, attributes: true, attributeFilter: ['hidden'] }); } catch (e) {}
    if (о) try { new MutationObserver(новаСтая).observe(о, { attributes: true, attributeFilter: ['hidden'] }); } catch (e) {}
    var опции = { capture: true, passive: true };
    ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'].forEach(function (с) { document.addEventListener(с, спри, опции); });
    новаСтая();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', тръгни); else тръгни();
})();
