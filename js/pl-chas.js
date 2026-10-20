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

  // 20.10 · ТЕЖЕСТТА (CPU профил на главната сесия, ×4: емоджиНаКръга = 1020–1603 ms собствено време — второто
  //   най-тежко в приложението). Причината: в цикъла четене (getComputedStyle, getBBox) и писане (insertBefore,
  //   textContent) се редуваха → всяко четене пресмяташе наново стиловете/подредбата на целия документ, и то
  //   по време на старта. Сега: ФАЗА 1 само чете (един размер на шрифт за клас, всички кутии наведнъж),
  //   ФАЗА 2 само пише; и тръгва чак когато кръгът наближи екрана, в празно време на браузъра.
  //   Слънцето и луната (.d24-orbit) са скрити (css/pl-chas.css) — за тях вече не се рисува нищо.
  //   ПЪТ НАЗАД: dev/proba/gl20_predi/js/pl-chas.js (старата функция с двата setTimeout).
  function емоджиНаКръга() {
    var свод = document.querySelector('.d24-svg');
    var П = window.BL_PL_PLYUSH;
    if (!свод || свод.dataset.plChas) return true;
    if (!П || !П.К) return false;
    var ЕМО = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*/u;
    // ── ФАЗА 1 · само четене ──
    var шрифт = {};
    function F(е, по) { var к = е.getAttribute('class') || ''; if (!(к in шрифт)) шрифт[к] = parseFloat(getComputedStyle(е).fontSize) || по; return шрифт[к]; }
    var точки = [], етикети = [];
    var сами = свод.querySelectorAll('text.d24-e');
    for (var i = 0; i < сами.length; i++) {
      var м = (сами[i].textContent || '').trim().match(ЕМО);
      if (м && П.К[м[0]]) точки.push({ т: сами[i], з: м[0], F: F(сами[i], 13) });
    }
    var надписи = свод.querySelectorAll('text.d24-lbl');
    for (var k = 0; k < надписи.length; k++) {
      var текст = надписи[k].textContent || '', м2 = текст.match(ЕМО);
      if (м2 && П.К[м2[0]]) етикети.push({ н: надписи[k], текст: текст, м: м2, F: F(надписи[k], 11), к: надписи[k].getBBox() });
    }
    // ── ФАЗА 2 · само писане ──
    var брой = 0;
    точки.forEach(function (о) {
      var x = parseFloat(о.т.getAttribute('x')) || 0, y = (parseFloat(о.т.getAttribute('y')) || 0) - о.F * .34;
      var g = рисунка(свод, x, y, о.F * 1.22, П.К[о.з]); if (!g) return;
      о.т.classList.add('pl-chas-skrit'); о.т.parentNode.insertBefore(g, о.т.nextSibling); брой++;
    });
    етикети.forEach(function (о) {
      var g2 = рисунка(свод, о.к.x + о.F * .55, о.к.y + о.к.height * .45, о.F * 1.25, П.К[о.м[0]]); if (!g2) return;
      var преди = о.текст.slice(0, о.м.index), знак = о.м[0], след = о.текст.slice(о.м.index + знак.length);
      о.н.textContent = '';
      if (преди) о.н.appendChild(document.createTextNode(преди));
      var ts = НС('tspan', { class: 'pl-chas-skrit' }); ts.textContent = знак; о.н.appendChild(ts);
      if (след) о.н.appendChild(document.createTextNode(след));
      о.н.parentNode.insertBefore(g2, о.н.nextSibling); брой++;
    });
    свод.dataset.plChas = брой || 'празно';
    return true;
  }
  // кога: щом кръгът наближи екрана (600 px), в празно време; плюшеният речник може още да не е готов — до 8 опита
  function иконкиКогатоТрябва(сек) {
    var опит = 0;
    function направиСега() {
      var празно = window.requestIdleCallback || function (ф) { return setTimeout(ф, 60); };
      празно(function () { if (!емоджиНаКръга() && ++опит < 8) setTimeout(направиСега, 700); }, { timeout: 1500 });
    }
    if (!('IntersectionObserver' in window) || !сек) { setTimeout(направиСега, 1600); return; }
    var н = new IntersectionObserver(function (з) { if (z_има(з)) { н.disconnect(); направиСега(); } }, { rootMargin: '600px 0px' });
    н.observe(сек);
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
    иконкиКогатоТрябва(сек);              // 20.10: беше setTimeout 400 + 1600 по време на старта (вж. горе)
    return true;
  }
  function z_има(з) { for (var i = 0; i < з.length; i++) if (з[i].isIntersecting) return true; return false; }

  var опити = 0;
  (function чакай() { if (!старт() && ++опити < 80) setTimeout(чакай, 250); })();
  window.BL_PL_CHAS = { завърти: завърти, пусни: пусни, спри: спри, емоджиНаКръга: емоджиНаКръга };
})();
