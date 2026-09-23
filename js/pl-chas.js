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


  // ═══ ПЛЮШ ВЪРХУ ДЕНОНОЩНИЯ КРЪГ (23.09) ═══
  //  Кръгът (js/home.js) рисува емоджита като SVG <text>. Плюшеният слой не може да
  //  ги хване (той работи по HTML), затова тук слагаме рисунката като <image> от
  //  същите листове и скриваме само буквата — текстът остава за екранни четци.
  //  Мерене на клетката: лист 4×4 → цялата рисунка се чертае 4×S на 4×S и се изрязва.
  var брояч = 0;
  function рисунка(свод, cx, cy, S, р) {
    var П = window.BL_PL_PLYUSH;
    if (!П || !П.ЛИСТ) return null;
    var лист = П.ЛИСТ[р[0]];
    if (!лист) return null;
    var ред = р[1], кол = р[2];
    var редове = П.ДВЕРЕДНИ[р[0]] ? 2 : 4;
    var ид = 'plChasClip' + (++брояч);
    var defs = свод.querySelector('defs') || свод.insertBefore(НС('defs', {}), свод.firstChild);
    var cp = НС('clipPath', { id: ид });
    cp.appendChild(НС('rect', { x: cx - S / 2, y: cy - S / 2, width: S, height: S, rx: S * .28 }));
    defs.appendChild(cp);
    var g = НС('g', { 'clip-path': 'url(#' + ид + ')', class: 'pl-chas-em' });
    var im = НС('image', { x: cx - S / 2 - кол * S, y: cy - S / 2 - ред * S, width: 4 * S, height: редове * S });
    im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'img/art/' + лист + '.webp');
    im.setAttribute('href', 'img/art/' + лист + '.webp');
    g.appendChild(im);
    return g;
  }

  function емоджиНаКръга() {
    var свод = document.querySelector('.d24-svg');
    var П = window.BL_PL_PLYUSH;
    if (!свод || !П || !П.К || свод.dataset.plChas) return;
    var ЕМО = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier}|\uFE0F\u20E3)*/u;
    var брой = 0;
    // 1 · самотните: точките по кръга и слънцето/луната
    var сами = свод.querySelectorAll('text.d24-e, text.d24-orb');
    for (var i = 0; i < сами.length; i++) {
      var т = сами[i];
      var м = (т.textContent || '').trim().match(ЕМО);
      if (!м || !П.К[м[0]]) continue;
      var F = parseFloat(getComputedStyle(т).fontSize) || 13;
      var x = parseFloat(т.getAttribute('x')) || 0;
      var y = (parseFloat(т.getAttribute('y')) || 0) - F * .34;
      var g = рисунка(свод, x, y, F * 1.22, П.К[м[0]]);
      if (!g) continue;
      т.classList.add('pl-chas-skrit');
      т.parentNode.insertBefore(g, т.nextSibling);
      брой++;
    }
    // 2 · надписите „🌙 нощта“: емоджито става tspan-невидимка, рисунката идва пред него
    var надписи = свод.querySelectorAll('text.d24-lbl');
    for (var k = 0; k < надписи.length; k++) {
      var н = надписи[k];
      var текст = н.textContent || '';
      var м2 = текст.match(ЕМО);
      if (!м2 || !П.К[м2[0]]) continue;
      var F2 = parseFloat(getComputedStyle(н).fontSize) || 11;
      var кутия = н.getBBox();
      var g2 = рисунка(свод, кутия.x + F2 * .55, кутия.y + кутия.height * .45, F2 * 1.25, П.К[м2[0]]);
      if (!g2) continue;
      // скриваме САМО знака: разделяме текста на невидим tspan + останалото
      var преди = текст.slice(0, м2.index), знак = м2[0], след = текст.slice(м2.index + знак.length);
      н.textContent = '';
      if (преди) н.appendChild(document.createTextNode(преди));
      var ts = НС('tspan', { class: 'pl-chas-skrit' });
      ts.textContent = знак;
      н.appendChild(ts);
      if (след) н.appendChild(document.createTextNode(след));
      н.parentNode.insertBefore(g2, н.nextSibling);
      брой++;
    }
    if (брой) свод.dataset.plChas = брой;
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
    setTimeout(емоджиНаКръга, 400);      // кръгът се рисува от home.js след нас
    setTimeout(емоджиНаКръга, 1600);
    return true;
  }
  function z_има(з) { for (var i = 0; i < з.length; i++) if (з[i].isIntersecting) return true; return false; }

  var опити = 0;
  (function чакай() { if (!старт() && ++опити < 80) setTimeout(чакай, 250); })();
  window.BL_PL_CHAS = { завърти: завърти, пусни: пусни, спри: спри, емоджиНаКръга: емоджиНаКръга };
})();
