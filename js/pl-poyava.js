/* ═══════════════════════════════════════════════════════════════════════════════
   🌤️ МЕКА ПОЯВА · js · 23.09.2026
   Наблюдава секциите на началото и картите в тях; когато влязат в екрана, ги пуска.
   ПРАВИЛА, които си спазвам сам:
   · нищо не се крие, докато JS не е тръгнал (класът html.pl-poyava се слага тук);
   · всяка секция се пуска ВЕДНЪЖ и наблюдението ѝ спира (без работа при скрол);
   · нищо не се пипа в стая (#roRoom) — там си има свои влизания;
   · ако IntersectionObserver липсва (много стар телефон) — просто пускаме всичко.
   ПЪТ НАЗАД: махни <script src="js/pl-poyava.js"> от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_POYAVA) return;
  var МОЖЕ = 'IntersectionObserver' in window;
  var ЦЕЛИ = 'main > section, main > .pl-krai';
  var ДЕЦА = ':scope > .rooms-grid > *, :scope > .mood-row > *, :scope > .faq-list > *, :scope > .install-steps > *, :scope > .wk-card, :scope > .bl-card, :scope > article, :scope > .np-b';
  var набл = null, брой = 0;

  function пусни(е) {
    if (е.classList.contains('pl-vid')) return;
    е.classList.add('pl-vid');
    // децата — една след друга, но не повече от 6 закъснения (иначе последната чака цяла секунда)
    var д = е.querySelectorAll(ДЕЦА);
    for (var i = 0; i < д.length; i++) {
      д[i].classList.add('pl-pv-d');
      д[i].style.setProperty('--pv-d', Math.min(i, 6) * 55 + 'ms');
      // следващият кадър, за да се хване преходът
      (function (у) { requestAnimationFrame(function () { requestAnimationFrame(function () { у.classList.add('pl-vid'); }); }); })(д[i]);
    }
  }

  function приготви(е) {
    if (е.dataset.plPv) return;
    е.dataset.plPv = '1';
    е.classList.add('pl-pv');
    брой++;
    if (!МОЖЕ) { пусни(е); return; }
    // вече видимо при зареждане → пускаме веднага (без трепване на първия екран)
    var р = е.getBoundingClientRect();
    if (р.top < (window.innerHeight || 800) * .92) { пусни(е); return; }
    набл.observe(е);
  }

  function огледай() {
    var с = document.querySelectorAll(ЦЕЛИ);
    for (var i = 0; i < с.length; i++) {
      // #todaySection и премиум началото имат свои влизания — не ги пипаме
      if (с[i].id === 'todaySection' || с[i].id === 'plHome') continue;
      приготви(с[i]);
    }
  }

  function старт() {
    if (!document.querySelector('main')) return false;
    document.documentElement.classList.add('pl-poyava');
    if (МОЖЕ) {
      набл = new IntersectionObserver(function (записи) {
        for (var i = 0; i < записи.length; i++) {
          if (записи[i].isIntersecting) { пусни(записи[i].target); набл.unobserve(записи[i].target); }
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: .04 });
    }
    огледай();
    // секциите се добавят и по-късно (JS рисува част от тях) → тих наблюдател на <main>
    var м = new MutationObserver(function () { clearTimeout(старт._т); старт._т = setTimeout(огледай, 120); });
    м.observe(document.querySelector('main'), { childList: true });
    return true;
  }

  var опити = 0;
  (function чакай() { if (!старт() && ++опити < 60) setTimeout(чакай, 250); })();
  window.BL_PL_POYAVA = { огледай: огледай, брой: function () { return брой; } };
})();
