// ═══════════════════════════════════════════════════════════
// 📱 ПЛАВНО — тишина, докато мама скролва
//
// Собственикът каза: „скролът е труден, цялата страница пулсира".
//
// ПЪРВИЯТ МИ ОПИТ БЕШЕ ГРЕШЕН и го пиша тук, за да не се повтори:
// пазех анимациите с IntersectionObserver, за да спират „извън екрана".
// Хвана 16 елемента и спря НУЛА — защото цялата атмосфера (.sky) е
// `position: fixed`, тоест винаги е в кадър. Наблюдението по видимост
// е сляпо точно за слоя, който тежи най-много.
//
// Истинският лек е по ВРЕМЕ, не по място: докато пръстът се движи,
// браузърът има само една работа — да рисува страницата.
//
// ═══ ВТОРАТА ГРЕШКА, ИЗМЕРЕНА И ОПРАВЕНА 18.08 ═══
// Правилото беше `html.bl-tiho *, ::before, ::after` — универсален
// селектор. Слагането на класа обезсилваше стила на ВСИЧКИ 1891
// елемента по три пъти, и то по 6–18 пъти за един скрол.
//
// МЕРЕНО СЪС СОБСТВЕН ВИДИМ Chrome (не headless — той не заключва
// кадрите за vsync), 360×760, 4× дросел, ръчен touch-жест, CPU-време
// на кадър от Performance.getMetrics, 6 пробега в 2 прозореца:
//        стил/кадър (най-добър · медиана)   задача/кадър   fps
//   A стар (универсален)      4.482 · 8.304 мс   17.4 · 27.9   32.9
//   D без файла              2.146 · 3.871 мс   17.8 · 26.7   31.0
//   E този (точен селектор)  2.253 · 3.806 мс   19.0 · 23.6   36.9
//   F същият, но с атрибут   4.387 · 6.021 мс   19.6 · 24.6   38.8
// В по-спокоен пробег (2 прозореца × 3): A 6.011 мс, D 3.452, E 2.016.
//
// И ЗАЩО ФАЙЛЪТ ВСЕ ПАК ОСТАВА (щетата от махането, мерено отделно):
//   вървящи анимации ПОСРЕД жеста:  A 7 · D 64 · E 2  (медиани от 6)
//   кадри над 32 мс при жеста:      A 5% · D 13% · E 5%
// Тоест без файла 56–65 анимации продължават да се въртят под пръста.
// „D е по-евтин по стил" е вярно и подвеждащо: той просто НЕ ВЪРШИ
// работата. E върши същата работа за цената на D.
//
// 🪤 ЗАПИСАНО, ЗА ДА НЕ СЕ ПЛАЩА ПАК:
// · Първата версия на точния селектор гледаше и attributes в
//   MutationObserver. js/izvan_ekrana.js мени класове при всеки скрол →
//   всяка тишина пускаше пълен оглед на 1891 елемента по 3
//   getComputedStyle. Скриптовото време скочи 2–4×. Тук се гледа САМО
//   childList и се оглеждат САМО новодошлите поддървета.
// · Белегът е КЛАС, не атрибут: измерено, атрибутният селектор
//   (вариант F) е ~1.6× по-скъп по стил от класовия.
// · Input.synthesizeScrollGesture с gestureSourceType:'touch' НЕ скролва
//   тази страница (мерено: scrollY 0→0, touchmove 0). Който мери — да
//   праща touchStart/touchMove/touchEnd ръчно.
//
// ПЪТ НАЗАД: git checkout 87783c6 -- js/plavno.js
//   (87783c6 = последният комит, който пипна ТОЗИ файл преди мен;
//    сверено: файлът е еднакъв и в 4253a95, и в ace6a8d)
//   (или махни реда за файла от index.html — нищо не зависи от него;
//   класът само пауза, не мени вид.)
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var КЛАС = 'bl-tiho', БЕЛЕГ = 'bl-dvizhi';
  var s = document.createElement('style');
  s.textContent =
    'html.' + КЛАС + ' .' + БЕЛЕГ + ',' +
    'html.' + КЛАС + ' .' + БЕЛЕГ + '::before,' +
    'html.' + КЛАС + ' .' + БЕЛЕГ + '::after {' +
    '  animation-play-state: paused !important;' +
    '}';
  document.head.appendChild(s);

  var h = document.documentElement;
  var t = 0, тихо = false, спирания = 0;
  var белязани = [], прегледани = 0, огледи = 0, върнати = 0;
  var опашка = [];

  function имаАнимация(el) {
    return getComputedStyle(el).animationName !== 'none' ||
           getComputedStyle(el, '::before').animationName !== 'none' ||
           getComputedStyle(el, '::after').animationName !== 'none';
  }

  function бележи(корен) {
    if (!корен || корен.nodeType !== 1) return;
    огледи++;
    var деца = корен.querySelectorAll('*');
    var списък = [корен];
    for (var i = 0; i < деца.length; i++) списък.push(деца[i]);
    for (var j = 0; j < списък.length; j++) {
      var el = списък[j];
      if (el.__blDv) continue;
      el.__blDv = 1; прегледани++;
      if (!имаАнимация(el)) continue;
      el.classList.add(БЕЛЕГ);
      белязани.push(el);
    }
  }

  // 🪤 js/calm.js и js/extras.js правят `елемент.className = '…'`, което
  // изтрива белега. Затова в ТИШИНАТА (не в жеста) белезите се сверяват
  // с действителността. Четенето на класове не изисква преизчисляване.
  function подсили() {
    for (var i = белязани.length - 1; i >= 0; i--) {
      var el = белязани[i];
      if (!el.isConnected) { белязани.splice(i, 1); continue; }
      if (!el.classList.contains(БЕЛЕГ)) { el.classList.add(БЕЛЕГ); върнати++; }
    }
  }

  function изчисти() {
    if (опашка.length) {
      var q = опашка; опашка = [];
      for (var i = 0; i < q.length && i < 200; i++) бележи(q[i]);
    }
    подсили();
  }

  function утихни() {
    if (!тихо) { h.classList.add(КЛАС); тихо = true; спирания++; }
    clearTimeout(t);
    t = setTimeout(оживи, 180);
  }
  function оживи() {
    if (тихо) { h.classList.remove(КЛАС); тихо = false; }
    setTimeout(изчисти, 60);          // огледът е в тишината, не в жеста
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

  function тръгни() {
    бележи(document.body);
    // Началната страница дорисува неща след първия кадър — същите два
    // късни огледа като в js/izvan_ekrana.js.
    setTimeout(function () { бележи(document.body); }, 1200);
    setTimeout(function () { бележи(document.body); }, 3500);
    if (window.MutationObserver) {
      new MutationObserver(function (записи) {
        for (var i = 0; i < записи.length; i++) {
          var д = записи[i].addedNodes;
          for (var j = 0; j < д.length; j++) if (д[j].nodeType === 1) опашка.push(д[j]);
        }
        if (!тихо && опашка.length) setTimeout(изчисти, 200);
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', тръгни);
  else тръгни();

  // Отчита се и КОЛКО пъти е спирал — брояч без брой е декорация.
  window.BL_ПЛАВНО = {
    тихо: function () { return тихо; },
    спирания: function () { return спирания; },
    белязани: function () { return белязани.length; },
    режим: function () {
      return 'точен селектор · белязани ' + белязани.length + ' от ' + прегледани +
             ' огледани · огледи ' + огледи + ' · върнати белега ' + върнати;
    },
    прегледай_пак: function (корен) { бележи(корен || document.body); подсили(); return белязани.length; },
    провери: function () {
      // 🪤 getComputedStyle('animationPlayState') остава 'running' завинаги за
      // свършили ЕДНОКРАТНИ анимации — надуваше 2.4× (записано в dev/test_nebe.js).
      // Затова истинското число идва от getAnimations().
      var върви = 0, всички = 0;
      if (document.getAnimations) {
        document.getAnimations().forEach(function (a) { всички++; if (a.playState === 'running') върви++; });
      }
      return { анимации: всички, вървят_сега: върви, белязани: белязани.length,
               тихо: тихо, спирания: спирания };
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
