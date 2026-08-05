// ═══════════════════════════════════════════════════════════
// ⚙️ anim.js — тънкият двигател на движението
//
// Не рисува нищо ново — само СЪЖИВЯВА вече готовите неща:
//  1) картите под сгъвката влизат МЕКО чак когато мама доскролва до тях
//     (scroll-reveal ВЪТРЕ в #roRoom — оверлеят скролва вътрешно);
//  2) всяка пипаема повърхност пуска лек отклик при допир (само transform/opacity);
//  3) числата с data-cnt в новопоказана карта отброяват точно когато се видят
//     (преизползва BL_FX.countUp — не дублира логика).
//
// ЖЕЛЯЗНО: при prefers-reduced-motion всичко е мигновено — нищо не се крие,
// никакви наблюдатели, никакъв отклик. Уморена майка в 3ч не бива да получи
// вертиго. Само transform/opacity → нула layout-thrash. Без луупове по таймер.
// Защитен код навсякъде (try/catch, guard за липсващи API).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── guard №1: движението изключено по избор на системата → лягаме напълно ──
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var EASE = 'cubic-bezier(.22,1,.36,1)';   // същият мек вход като cardIn/jrIn
  var CARD = '.jr-card';                     // основната карта на стаята
  // всяка пипаема повърхност (широк, но безопасен списък)
  var TAP  = '.jr-btn,.jr-chip,.ro-chip,.ro-tab,.ro-sos,.sec-chip,.fb-btn,button,[role="button"]';

  // обработените карти се разпознават по клас (.is-in/.is-pending) — при смяна
  // на стая идват НОВИ елементи без тези класове, значи се обработват наново.

  // ═══════════ ОТКЛИК ПРИ ДОПИР (лек, независим слой) ═══════════
  // Кръгчето живее във fixed слой НАД всичко — така не пипа кутията/overflow-а
  // на бутона и не предизвиква никакъв layout-thrash. Само transform+opacity.
  function injectCSS() {
    if (document.getElementById('bl-anim-css')) return;
    try {
      var s = document.createElement('style');
      s.id = 'bl-anim-css';
      s.textContent =
        '.bl-anim-layer{position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden}' +
        '.bl-ripple{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;' +
          'background:rgba(150,130,180,.28);opacity:.5;transform:scale(0);' +
          'animation:blRip .5s ' + EASE + ' forwards}' +
        '@keyframes blRip{to{transform:scale(8);opacity:0}}';
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  var layer = null;
  function ripLayer() {
    if (layer && layer.isConnected) return layer;
    layer = document.createElement('div');
    layer.className = 'bl-anim-layer';
    (document.body || document.documentElement).appendChild(layer);
    return layer;
  }

  function ripple(x, y) {
    try {
      var L = ripLayer();
      var r = document.createElement('span');
      r.className = 'bl-ripple';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      L.appendChild(r);
      // еднократно почистване (НЕ луп) — кръгчето живее половин секунда
      setTimeout(function () { if (r && r.remove) r.remove(); }, 520);
    } catch (e) {}
  }

  // Делегиран listener: passive, не вика preventDefault → click-ът минава свободно
  function onDown(e) {
    try {
      var t = (e.target && e.target.closest) ? e.target.closest(TAP) : null;
      if (!t) return;
      if (t.disabled || t.getAttribute('aria-disabled') === 'true') return;
      var x = (e.clientX != null) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      var y = (e.clientY != null) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (x == null || y == null) return;
      ripple(x, y);
    } catch (err) {}
  }

  // ═══════════ SCROLL-REVEAL ВЪТРЕ В СТАЯТА ═══════════
  var io = null;
  function ensureIO() {
    if (io) return io;
    if (typeof IntersectionObserver === 'undefined') return null;
    try {
      // root:null = ВИДИМИЯТ екран. #roRoom не е скрол-контейнерът (той е висок
      // колкото цялото съдържание — 10000px+); скролът е на друг предшественик.
      // При root:null наблюдателят гръмва щом картата влезе в екрана, независимо
      // кой контейнер скролва — единственият надежден вариант тук.
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
      }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    } catch (e) { io = null; }
    return io;
  }

  // крие карта под сгъвката: спираме вградения jrIn (иначе печели над inline)
  // и я подготвяме за мек преход по opacity/transform
  function hide(card) {
    card.style.animation = 'none';
    card.style.opacity = '0';
    // П5 А2: редуване и при събуждане от скрол — хореографията „от ръка"
    // не свършва под сгъвката. reveal() интерполира наклона до нула.
    hide._редува = !hide._редува;
    card.style.transform = hide._редува
      ? 'translateY(18px) translateX(-10px) rotate(-0.8deg)'
      : 'translateY(18px) translateX(10px) rotate(0.8deg)';
    card.style.transition = 'opacity .34s ' + EASE + ',transform .34s ' + EASE;
    card.classList.add('is-pending');
  }

  // показва карта, когато доскролим до нея
  function reveal(card) {
    if (io) { try { io.unobserve(card); } catch (e) {} }
    card.classList.remove('is-pending');
    card.classList.add('is-in');
    // след прехода махаме inline следите (оставяме animation:none, за да не се
    // престартира jrIn и да не мигне картата)
    var te = function (ev) {
      if (ev.propertyName === 'transform') {
        card.style.transition = '';
        card.style.transform = '';
        card.style.opacity = '';
        card.removeEventListener('transitionend', te);
      }
    };
    card.addEventListener('transitionend', te);
    // задействаме прехода
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
    // числата оживяват точно когато картата се появи (преизползваме fx.js)
    try {
      if (window.BL_FX && BL_FX.countUp && card.querySelector('[data-cnt]')) BL_FX.countUp(card);
    } catch (e) {}
  }

  // подрежда: скрива под сгъвката, оставя видимите на естествения им вход
  function arm() {
    if (reduce) return;
    var root = document.getElementById('roRoom');
    if (!root) return;
    var rr;
    try { rr = root.getBoundingClientRect(); } catch (e) { return; }
    // скрит таб (display:none → нулева височина) → мерките нямат смисъл, чакаме
    if (root.hidden || rr.height < 1) return;
    var ob = ensureIO();
    // „сгъвката" е ВИДИМИЯТ екран, не дъното на #roRoom (той е висок 10000px+).
    var bottom = window.innerHeight || rr.bottom;
    var cards = root.querySelectorAll(CARD);
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      // вече обработена (при предишен arm за същата стая) → пропускаме
      if (c.classList.contains('is-in') || c.classList.contains('is-pending')) continue;
      var top;
      try { top = c.getBoundingClientRect().top; } catch (e) { c.classList.add('is-in'); continue; }
      if (ob && top > bottom + 40) {
        // под сгъвката → крий и чакай скрола
        hide(c);
        try { ob.observe(c); } catch (e) { reveal(c); }
      } else {
        // във фокус → нищо не крием, оставяме вградения вход да си изиграе
        c.classList.add('is-in');
      }
    }
    spy(root);   // „ти си тук" по секционната лента
  }

  // ═══════════ SCROLLSPY: „ти си тук" по секциите ═══════════
  // sec-head и sec-chip се строят в един и същ ред (polish.js) → i-тата глава
  // отговаря на i-тия чип. Осветяваме чипа на секцията, която е под върха.
  var spyIO = null;
  function spy(root) {
    if (typeof IntersectionObserver === 'undefined') return;
    var heads = root.querySelectorAll('.sec-head');
    var chips = root.querySelectorAll('.sec-nav .sec-chip');
    if (!heads.length || heads.length !== chips.length) return;
    if (spyIO) { try { spyIO.disconnect(); } catch (e) {} spyIO = null; }
    var idx = new WeakMap();
    for (var i = 0; i < heads.length; i++) idx.set(heads[i], i);
    try {
      spyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var k = idx.get(en.target);
          if (k == null) return;
          for (var j = 0; j < chips.length; j++) chips[j].classList.toggle('on', j === k);
        });
      }, { root: null, rootMargin: '0px 0px -70% 0px', threshold: 0 });
      for (var h = 0; h < heads.length; h++) spyIO.observe(heads[h]);
    } catch (e) { spyIO = null; return; }
    // старт: първата секция е активна
    for (var c = 0; c < chips.length; c++) chips[c].classList.toggle('on', c === 0);
  }

  // ═══════════ НАБЛЮДЕНИЕ ЗА ПРЕ-РИСУВАНЕ ═══════════
  // #roRoom се изпразва и попълва при всяко отваряне на стая, а видимостта му
  // се превключва при смяна на таб. И двете идват като мутации → едно armSafe.
  // Събитийно е, не по таймер.
  // arm() тича СЛЕД като мутациите утихнат и layout-ът се уталожи — иначе при
  // отваряне на стая картите са още накуп на top≈0 и никоя не е „под сгъвката".
  var armTimer = null;
  function armSoon() {
    if (armTimer) return;
    armTimer = setTimeout(function () { armTimer = null; arm(); }, 180);
  }
  function watch() {
    var root = document.getElementById('roRoom');
    if (!root) return;
    armSoon();
    if (typeof MutationObserver === 'undefined') return;
    try {
      var mo = new MutationObserver(function () { armSoon(); });
      mo.observe(root, { childList: true, attributes: true, attributeFilter: ['hidden'] });
    } catch (e) {}
  }

  // ═══════════ СТАРТ ═══════════
  function init() {
    if (reduce) return;   // мигновено: без слой, без наблюдатели, без отклик
    injectCSS();
    try { document.addEventListener('pointerdown', onDown, { passive: true }); } catch (e) {}
    watch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
