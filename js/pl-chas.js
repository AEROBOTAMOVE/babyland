/* ═══════════════════════════════════════════════════════════════════════════════
   🕰️ ЕДИН ЖИВ ЧАСОВНИК · секция „Едно денонощие с теб“ · 06.10.2026
   Собственикът: „в началото има пак 2 часовника“. Така беше: над денонощния кръг
   стоеше втори, филцов часовник със стрелки — и розовата му стрелка излизаше ИЗВЪН
   циферблата. Два часовника за едно и също време е шум, не лукс.

   Сега часовникът е ЕДИН — самият денонощен кръг (js/home.js, .d24-svg), и е жив:
     · в центъра, на мястото на „24/7 · тук сме“, стои СЕГАШНОТО време и частта от
       деня („09:20 · предобед“), двоеточието тиктака;
     · розова точка обикаля вътрешния кръг веднъж в минута — секундите;
     · стрелката на деня (от home.js) си върви както преди.
   Редът „СЕГА при теб е 09:20“ под кръга отпада — времето вече е в центъра.
   Слънцето и луната, които обикаляха и застъпваха надписите „нощта“ и „обед“,
   се прибират — надписите си носят своите иконки.

   Старият код НЕ се пипа: само четем елементите му и им сменяме текста/вида.
   ПЕСТИ ТОК: спира, когато секцията не се вижда и когато разделът е скрит.
   ПЪТ НАЗАД: js/pl-chas.js.PREDI_EDIN и css/pl-chas.css.PREDI_EDIN (филцовият часовник).
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_CHAS) return;

  var CX = 110, CY = 110, R_ВЪТРЕ = 74;          // геометрията на кръга от js/home.js (R = 96, R - 22)
  var свод = null, таймер = 0, вижда = true, наЕкрана = true, градусиСек = -1;

  function НС(име, атр) {
    var е = document.createElementNS('http://www.w3.org/2000/svg', име);
    for (var к in атр) е.setAttribute(к, атр[к]);
    return е;
  }

  function частОтДеня(ч) {
    return ч < 5 ? 'дълбока нощ' : ч < 9 ? 'ранна утрин' : ч < 12 ? 'предобед'
      : ч < 15 ? 'обед' : ч < 19 ? 'следобед' : ч < 22 ? 'вечер' : 'нощ';
  }

  // превръща центъра на кръга в часовник; прави го веднъж
  function направи() {
    свод = document.querySelector('.d24-svg');
    if (!свод) return false;
    if (свод.dataset.plEdin) return true;
    var горе = свод.querySelector('text.d24-mid'), долу = свод.querySelector('text.d24-mid2');
    if (!горе || !долу) return false;
    горе.classList.add('pl-chas-vreme');
    долу.classList.add('pl-chas-chast');
    горе.textContent = '';
    горе.appendChild(НС('tspan', { class: 'pl-chas-ch' }));
    var кол = НС('tspan', { class: 'pl-chas-kol' }); кол.textContent = ':';
    горе.appendChild(кол);
    горе.appendChild(НС('tspan', { class: 'pl-chas-mn' }));
    // секундите: точка на вътрешния кръг, обикаля веднъж в минута
    var г = НС('g', { class: 'pl-chas-sek' });
    г.appendChild(НС('circle', { cx: CX, cy: CY - R_ВЪТРЕ, r: 3.2, class: 'pl-chas-sek-t' }));
    свод.appendChild(г);
    свод.setAttribute('aria-label', 'Денонощен кръг — часовник');
    свод.dataset.plEdin = '1';
    return true;
  }

  function завърти() {
    if (!свод || !свод.isConnected) { if (!направи()) return; }
    var н = new Date();
    var ч = н.getHours(), м = н.getMinutes(), с = н.getSeconds();
    var чч = свод.querySelector('.pl-chas-ch'), мм = свод.querySelector('.pl-chas-mn');
    var чс = ('0' + ч).slice(-2), мс = ('0' + м).slice(-2);
    if (чч && чч.textContent !== чс) чч.textContent = чс;              // пишем само при разлика
    if (мм && мм.textContent !== мс) мм.textContent = мс;
    var долу = свод.querySelector('.pl-chas-chast'), дума = частОтДеня(ч);
    if (долу && долу.textContent !== дума) долу.textContent = дума;
    // секундите вървят само НАПРЕД — при 59→0 не се връщат назад през кръга
    var цел = с * 6;
    if (градусиСек < 0) градусиСек = цел;
    else { var тек = ((градусиСек % 360) + 360) % 360; градусиСек += ((цел - тек) + 360) % 360; }
    var сек = свод.querySelector('.pl-chas-sek');
    if (сек) сек.style.transform = 'rotate(' + градусиСек + 'deg)';
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

  function пусни() {
    if (таймер || !вижда || !наЕкрана) return;
    завърти();
    таймер = setInterval(завърти, 1000);
  }
  function спри() { if (таймер) { clearInterval(таймер); таймер = 0; } }

  function старт() {
    if (!направи()) return false;
    var сек = document.querySelector('.d24-wrap');
    document.addEventListener('visibilitychange', function () {
      вижда = !document.hidden;
      if (вижда) пусни(); else спри();
    });
    if ('IntersectionObserver' in window && сек) {
      new IntersectionObserver(function (з) {
        наЕкрана = z_има(з);
        if (наЕкрана) пусни(); else спри();
      }, { threshold: .05 }).observe(сек);
    }
    пусни();
    setTimeout(емоджиНаКръга, 400);      // кръгът се рисува от home.js; иконките после
    setTimeout(емоджиНаКръга, 1600);
    return true;
  }
  function z_има(з) { for (var i = 0; i < з.length; i++) if (з[i].isIntersecting) return true; return false; }

  var опити = 0;
  (function чакай() { if (!старт() && ++опити < 80) setTimeout(чакай, 250); })();
  window.BL_PL_CHAS = { завърти: завърти, пусни: пусни, спри: спри, емоджиНаКръга: емоджиНаКръга };
})();
