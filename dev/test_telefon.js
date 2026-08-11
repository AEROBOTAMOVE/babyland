// ═══════════════════════════════════════════════════════════
// 📱 ТЕСТ ЗА ТЕЛЕФОНА — 360×760, двете теми, всички екрани
//
// Защо съществува (11.08.2026):
//   Бейби Ленд се отваря с една ръка, в 3 през нощта, на телефон с широчина
//   360 CSS-пиксела. Дотук всички проверчици гледаха ДУМИТЕ (ключове, флагове,
//   статии). Този гледа СТЪКЛОТО: побира ли се, стига ли пръстът, вижда ли се
//   буквата и не пали ли екранът батерия, докато мама чете.
//
//   Четири въпроса, по един за всеки истински начин екранът да предаде:
//     1. РАЗМЕСТВАНЕ.  html.scrollWidth === html.clientWidth. Един елемент,
//        по-широк от 360, добавя воден хоризонтален скрол на ЦЕЛИЯ документ —
//        мама плъзга нагоре, страницата тръгва настрани, текстът избягва.
//     2. МИШЕНА ЗА ПРЪСТ. Всеки button/a/input/[role=button] ≥ 44×44.
//        Числото не е измислено: WCAG 2.5.5 (AAA) и Apple HIG казват 44,
//        Material — 48. Взето е по-снизходителното от двете.
//     3. КОНТРАСТ. Всеки видим текст ≥ 4.5 (≥3 за едър) — WCAG 2.1 AA.
//        „Едър" е ≥24px, или ≥18.66px при тегло ≥700 — точно както го
//        определя стандартът, не на око.
//     4. АНИМАЦИЯ. Безкраен цикъл по свойство извън transform/opacity кара
//        браузъра да прерисува (или преизчислява подредбата) кадър по кадър,
//        завинаги. На телефон това е топлина и празна батерия — точно докато
//        мама държи бебето с другата ръка.
//
// ⚠️ КАК СЕ МЕРИ КОНТРАСТЪТ (най-важното — тук се крие цялата честност)
//   Наивният проверчик чете `background-color` на елемента, вижда
//   `rgba(0,0,0,0)` и решава „фонът е бял". В приложение, построено от
//   полупрозрачни картички върху цветни сцени, това е ЛЪЖА и в двете посоки:
//   бял текст върху тъмна карта излиза „бяло върху бяло" (фалшива тревога),
//   а сив текст върху сив пласт излиза чист (пропусната дупка).
//   Затова тук фонът се СГЛОБЯВА както го сглобява браузърът:
//     · веригата от <html> надолу до самия елемент, отдолу нагоре;
//     · всеки пласт се смесва по alpha: c = a·пласт + (1−a)·подложка;
//     · `opacity` на всеки предшественик умножава alpha-та на всичко под него
//       И на самия текст (кумулативно, точно както прави композиторът).
//   ГРАДИЕНТИТЕ не се преструваме, че сме ги пресметнали: вадим ЦВЕТНИТЕ
//   СПИРКИ и мерим срещу ВСЯКА. Ако най-лошата спирка минава — зелено
//   (сигурно). Ако и най-добрата пада — червено (сигурно). Ако е по средата —
//   ЖЪЛТО: „зависи къде точно попада буквата". Число, което не мога да
//   проверя, е мнение с десетична запетая — затова тези отиват в жълто, не
//   в зелено и не в червено.
//   НЕ се мерят (и се броят отделно, за да се вижда КОЛКО са пропуснати):
//     · текст вътре в <svg> — там цветът често е `fill` от градиент/`use`;
//     · текст само от емоджи (🍼 · 💜) — цветът му не значи нищо;
//     · фон с растерна картинка `url(...)` — пиксел не мога да прочета;
//     · цвят, записан в `color(...)`/`oklch(...)` — не го разчитам.
//
// ⚠️ ЕДИНСТВЕНАТА ДУПКА, КОЯТО ЗНАЯ, ЧЕ ИМАМ: полупрозрачен НАКЛАДЕН слой
//   (overlay с `position:fixed` и alpha < 1) стои над съдържание, което не е
//   негов предшественик. Веригата нагоре дава подложката на страницата, не
//   каквото реално е отдолу. Такива редове носят бележка „през полупрозрачен
//   слой" и се броят отделно. Не ги обявявам за проверени.
//
// ⚠️ МИШЕНИТЕ — две снизхождения, за да не вика вълк:
//   · разширяване с ::before/::after: любимият трик за уголемяване на зоната
//     е невидим псевдо-елемент с отрицателни inset-и. Чете се и се прибавя.
//   · вграден линк в течащ текст (display:inline вътре в изречение) е ЖЪЛТ,
//     не червен — WCAG 2.5.8 изрично го изважда, защото не можеш да го
//     уголемиш, без да разкъсаш реда.
//
// КАК СЕ ПУСКА (в конзолата на приложението, на телефонна ширина):
//   1) Направи прозореца 360×760 (DevTools → устройство, или тесен прозорец).
//   2) const s=document.createElement('script'); s.src='dev/test_telefon.js'; document.body.appendChild(s);
//   3) await BL_ТЕЛЕФОН.провери()        // или BL_PHONE.провери()
//   По-бързо (без чакане на анимациите): await BL_PHONE.провери({пауза:250})
//
// ПЪТ НАЗАД: тестът ОТВАРЯ екрани (това е работата му), но всичко върнато:
//   · localStorage — пълна снимка преди и точно връщане след (изтрити добавени
//     ключове, върнати променените). Разликата се ПОКАЗВА, не се премълчава.
//   · темата (data-theme), document.title, body.style.overflow, позицията на
//     скрола, window._ldDirect — всяко се помни и връща.
//   · всички наслагвания се затварят със СОБСТВЕНИТЕ им бутони/функции.
//   Самопроверката строи фигурите си в отделен <div> и <style>, които маха и
//   проверява, че ги е махнала. Изтриването на файла не чупи нищо.
//   НЕ е закачен в index.html. Не прави мрежови заявки. Не пише никъде.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ───────────────────────── прагове (всички измерими) ─────────────────────
  var МИН_МИШЕНА = 44;            // WCAG 2.5.5 AAA / Apple HIG
  var ПРАГ_ДРЕБЕН = 4.5;          // WCAG 2.1 AA — обикновен текст
  var ПРАГ_ЕДЪР = 3.0;            // WCAG 2.1 AA — едър текст
  var ЕДЪР_PX = 24;               // ≥24px = едър
  var ПОЛУЕДЪР_PX = 18.66;        // ≥18.66px + тегло ≥700 = едър
  var ЦЕЛ_Ш = 360, ЦЕЛ_В = 760;   // телефонът, за който е писано приложението
  var ДОПУСК = 0.5;               // подпикселна търпимост при измерване на кутии

  // свойства, по които безкрайният цикъл е БЕЗПЛАТЕН (композиторът ги движи
  // на отделна нишка, без прерисуване и без преподреждане)
  var АНИМ_ЗЕЛЕНИ = {
    'transform': 1, '-webkit-transform': 1, 'translate': 1, 'rotate': 1,
    'scale': 1, 'opacity': 1, '-webkit-opacity': 1,
    'animation-timing-function': 1, '-webkit-animation-timing-function': 1
  };
  // движение по пътечка е transform под капака, но не е точно то → жълто
  var АНИМ_ЖЪЛТИ = { 'offset-distance': 1, 'offset-path': 1, 'offset-rotate': 1, 'visibility': 1 };

  var $ = function (id) { return document.getElementById(id); };

  // ⏳ ЗАЩО чакането минава през MessageChannel, а не е гол setTimeout
  //   (измерено на 11.08, не предположено): обиколката е верига от вложени
  //   таймери — всеки `await спи()` се насрочва ОТ ВЪТРЕШНОСТТА на предишния.
  //   Chrome брои това като „nesting level"; мине ли 5 при СКРИТ раздел, включва
  //   „intensive throttling" и пуска таймера ВЕДНЪЖ В МИНУТАТА. Първата версия
  //   на този файл заби точно така: екран 17 от 30, стъпка „затварям", и после
  //   нищо — при жив главен нишков поток и работещи таймери отвън. Не беше
  //   безкраен цикъл; беше 60 секунди за 120-милисекундна пауза.
  //   Един скок през MessageChannel връща nesting level на нула, защото
  //   таймерът вече се насрочва от съобщение, не от таймер.
  var спи = function (ms) {
    return new Promise(function (r) {
      try {
        var ch = new MessageChannel();
        ch.port1.onmessage = function () { setTimeout(r, ms); };
        ch.port2.postMessage(0);
      } catch (e) { setTimeout(r, ms); }
    });
  };

  // ═════════════════════════ 1. ЦВЯТ И КОНТРАСТ ════════════════════════════

  // Браузърът връща `rgb(r, g, b)` / `rgba(r, g, b, a)`. Хексът се среща само
  // в градиентните низове, писани на ръка. Всичко друго (color(), oklch())
  // честно връща null → редът отива в „неизмеримо", не в зелено.
  function цвят(s) {
    if (!s) return null;
    s = String(s).trim();
    if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    var m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
    if (m) {
      var a = m[4] === undefined ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      if (isNaN(a)) a = 1;
      return { r: +m[1], g: +m[2], b: +m[3], a: a };
    }
    var h = s.match(/^#([0-9a-fA-F]{3,8})$/);
    if (h) {
      var x = h[1];
      if (x.length === 3 || x.length === 4) x = x.split('').map(function (c) { return c + c; }).join('');
      if (x.length !== 6 && x.length !== 8) return null;
      return {
        r: parseInt(x.slice(0, 2), 16), g: parseInt(x.slice(2, 4), 16),
        b: parseInt(x.slice(4, 6), 16), a: x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1
      };
    }
    return null;
  }

  function канал(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function светлина(c) { return 0.2126 * канал(c.r) + 0.7152 * канал(c.g) + 0.0722 * канал(c.b); }
  function контраст(a, b) {
    var L1 = светлина(a), L2 = светлина(b);
    if (L1 < L2) { var t = L1; L1 = L2; L2 = t; }
    return (L1 + 0.05) / (L2 + 0.05);
  }
  // преден (с alpha) върху непрозрачна подложка — точно както смесва браузърът
  function върху(пр, зад) {
    var a = пр.a;
    return { r: пр.r * a + зад.r * (1 - a), g: пр.g * a + зад.g * (1 - a), b: пр.b * a + зад.b * (1 - a), a: 1 };
  }
  function вЗапис(c) { return 'rgb(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ')'; }

  var ЦВЯТ_В_НИЗ = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g;
  function спиркиОтГрадиент(bi) {
    var м = String(bi).match(ЦВЯТ_В_НИЗ) || [], out = [];
    for (var i = 0; i < м.length; i++) { var c = цвят(м[i]); if (c) out.push(c); }
    return out;
  }

  // кеш на изчислените стилове за ЕДНО минаване (getComputedStyle е скъп)
  var кешСтил = null;
  function стил(el) {
    if (!кешСтил) return getComputedStyle(el);
    var v = кешСтил.get(el);
    if (!v) { v = getComputedStyle(el); кешСтил.set(el, v); }
    return v;
  }

  // Сглобява ФОНА под даден елемент — веригата от <html> надолу.
  // Връща множество кандидати (>1 само когато има градиент).
  function фонПод(el) {
    var възли = [], n = el;
    while (n && n.nodeType === 1) { възли.push(n); n = n.parentElement; }
    var канд = [{ r: 255, g: 255, b: 255, a: 1 }];   // платното на браузъра
    var картинка = false, неясен = false, срязано = false, полупрозрачно = false;
    var филтър = '';
    var p = 1, opacityНаЕл = 1;

    for (var i = възли.length - 1; i >= 0; i--) {
      var cs = стил(възли[i]);
      // 🔴 11.08 — намерено при сверяване на живо, НЕ по четене на код:
      //   в нощна тема `.ro-head` носи `filter: brightness(.62) saturate(1.1)`
      //   върху светъл пастелен градиент. Филтърът важи И за фона, И за
      //   буквата (наследява се надолу), тоест и двете се променят. Без него
      //   сметката даваше контраст 1.02 и обявяваше „невидим текст" в ДЕВЕТ
      //   стаи — 24 червени реда, всичките измислени.
      //   Не се преструвам, че смятам филтри: такъв ред отива в ЖЪЛТО с име.
      if (cs.filter && cs.filter !== 'none') филтър = филтър || cs.filter;
      var o = parseFloat(cs.opacity); if (isNaN(o)) o = 1;
      p = p * o;
      if (i === 0) opacityНаЕл = p;

      var пластове = [];
      var bc = цвят(cs.backgroundColor);
      if (bc) { if (bc.a > 0) пластове.push([bc]); }
      else if (cs.backgroundColor && cs.backgroundColor !== 'none') неясен = true;

      var bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        if (/url\(/i.test(bi)) картинка = true;
        var сп = спиркиОтГрадиент(bi);
        if (сп.length) пластове.push(сп.slice(0, 8));
        else if (!/url\(/i.test(bi)) неясен = true;
      }

      for (var j = 0; j < пластове.length; j++) {
        var сп2 = пластове[j], нови = [];
        for (var k = 0; k < канд.length; k++) {
          for (var q = 0; q < сп2.length; q++) {
            var c = сп2[q], ea = c.a * p;
            if (ea > 0.02 && ea < 0.98) полупрозрачно = true;
            if (ea <= 0.004) { нови.push(канд[k]); continue; }
            нови.push(върху({ r: c.r, g: c.g, b: c.b, a: ea }, канд[k]));
          }
        }
        канд = свий(нови);
        if (нови.length > 32) срязано = true;
      }
    }
    return { кандидати: канд, картинка: картинка, неясен: неясен, срязано: срязано,
             полупрозрачно: полупрозрачно, opacity: opacityНаЕл, филтър: филтър };
  }

  // изхвърля повторенията и слага таван — иначе три градиента правят стотици
  function свий(списък) {
    var видени = {}, out = [];
    for (var i = 0; i < списък.length && out.length < 32; i++) {
      var c = списък[i], k = Math.round(c.r) + '|' + Math.round(c.g) + '|' + Math.round(c.b);
      if (видени[k]) continue;
      видени[k] = 1; out.push(c);
    }
    return out;
  }

  // ═════════════════════════ 2. ВИДИМОСТ И ТЕКСТ ═══════════════════════════

  var ПИКТО = null;
  try { ПИКТО = new RegExp('\\p{Extended_Pictographic}', 'u'); } catch (e) { ПИКТО = /[\uD800-\uDBFF][\uDC00-\uDFFF]/; }
  var МАХНИ = null;
  try { МАХНИ = new RegExp('[\\p{Extended_Pictographic}\\uFE0F\\uFE0E\\u200D\\u20E3\\s\\u00A0]', 'gu'); }
  catch (e2) { МАХНИ = new RegExp('[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uFE0F\\uFE0E\\u200D\\s\\u00A0]', 'g'); }

  // Текст само от емоджи: цветът на 🍼 не значи нищо. Но „✕" и „←" НЕ са
  // емоджи (не са Extended_Pictographic) — те са букви за пръста и си остават
  // под проверка. Затова условието е двойно: да няма буква/цифра И да ИМА
  // пиктограма.
  function самоЕмоджи(т) {
    if (!ПИКТО.test(т)) return false;
    return String(т).replace(МАХНИ, '').replace(/[^\wА-Яа-яЀ-ӿ0-9]/g, '') === '';
  }

  function собственТекст(el) {
    var т = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) т += n.nodeValue;
    }
    return т.trim();
  }

  var ПРОПУСНИ_ЕТИКЕТ = { SCRIPT: 1, STYLE: 1, TEMPLATE: 1, NOSCRIPT: 1, TITLE: 1, HEAD: 1, LINK: 1, META: 1, BR: 1 };

  // кумулативна прозрачност: `opacity` на предшественик важи и за детето
  function прозрачност(el) {
    var p = 1, n = el;
    while (n && n.nodeType === 1) {
      var o = parseFloat(стил(n).opacity);
      if (!isNaN(o)) p *= o;
      if (p <= 0.001) return 0;
      n = n.parentElement;
    }
    return p;
  }

  // 🔴 11.08 — намерено при първото пускане наживо: без проверката за
  // прозрачност ВСЕКИ .reveal елемент (opacity:0, докато наблюдателят не му
  // сложи .shown) излизаше с контраст точно 1.00 — „текст върху себе си".
  // 178 червени в една стая, всичките измислени. Невидимото не се СЪДИ, то се
  // БРОИ отделно; инак докладът се пълни с щети, които мама няма как да види.
  //   ⚠️ `безПрозрачност` е за АНИМАЦИИТЕ и е нарочно различно: цикъл, който
  //   върти `box-shadow` върху нещо на opacity 0, пак кара браузъра да смята
  //   кадър по кадър — батерията не пита вижда ли се. Иначе казано: за цвят и
  //   пръст „невидимо" значи „не се съди"; за анимация значи „все пак гори".
  //   (Мерено: с общата мярка проверката за анимации падаше от 16080 на 916
  //   прегледани елемента — тоест ставаше почти сляпа и после казваше „0".)
  function видим(el, cs, безПрозрачност) {
    cs = cs || стил(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;         // и sr-only клопките (1×1)
    if (!безПрозрачност && прозрачност(el) <= 0.02) return false;
    return true;
  }

  function път(el) {
    var ч = [], n = el, стъпки = 0;
    while (n && n.nodeType === 1 && стъпки < 4) {
      if (n.id) { ч.unshift('#' + n.id); break; }
      var с = n.tagName.toLowerCase();
      var кл = (typeof n.className === 'string' ? n.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      if (кл) с += '.' + кл;
      ч.unshift(с); n = n.parentElement; стъпки++;
    }
    return ч.join('>');
  }
  function откъс(т, н) { т = String(т).replace(/\s+/g, ' ').trim(); н = н || 40; return т.length > н ? т.slice(0, н) + '…' : т; }

  // ═════════════════════════ 3. ЧЕТИРИТЕ ПРОВЕРЧИКА ════════════════════════
  // Всеки приема КОРЕН отвън — за да може самопроверката да ги пусне върху
  // нарочно счупен корен и да докаже, че ловят. Проверчик, който не пада на
  // счупено, е декорация.

  // ── 3.1 хоризонтално разместване ──
  // ⚠️ Какво точно значи числото тук — научено от самопроверката, не предположено:
  //   style.css има `html { overflow-x: clip }` И `body { overflow-x: clip }`.
  //   Затова страницата НЕ се влачи настрани (няма скрол-контейнер), но
  //   `scrollWidth` ВСЕ ОЩЕ расте — Chrome го отчита като размер на
  //   съдържанието, не като размер на скрола. Значи разликата не е „мама
  //   плъзга встрани", а „нещо е ПО-ШИРОКО от екрана и се РЕЖЕ".
  //   Първата версия на този проверчик отчиташе разликата, но не даваше
  //   НИТО ЕДИН виновник: обхождането нагоре виждаше clip-а на <body> и
  //   решаваше „някой го отрязва, значи не е щета". Число без име е половин
  //   доклад — затова <html> и <body> вече не се броят за отрязващи.
  function провериРазместване(корени) {
    var h = document.documentElement;
    var scrollW = h.scrollWidth, clientW = h.clientWidth;
    var вx = стил(h).overflowX, бx = document.body ? стил(document.body).overflowX : '';
    var влачи = !(вx === 'hidden' || вx === 'clip' || бx === 'hidden' || бx === 'clip');
    var виновници = [], надясно = [], прегледани = 0;
    if (scrollW > clientW + ДОПУСК) {
      var всички = document.body.querySelectorAll('*');
      for (var i = 0; i < всички.length; i++) {
        var el = всички[i];
        прегледани++;
        var cs = стил(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        var r = el.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) continue;
        if (r.right <= clientW + 1 && r.left >= -1) continue;
        if (отрязанОтродител(el)) continue;             // родител с overflow скрива щетата
        var запис = { път: път(el), ляво: Math.round(r.left), дясно: Math.round(r.right),
                      широчина: Math.round(r.width), текст: откъс(собственТекст(el), 30) };
        if (r.right > clientW + 1) виновници.push(запис); else надясно.push(запис);
      }
    }
    // виновникът е най-външният — вътрешните само го повтарят
    виновници.sort(function (a, b) { return b.дясно - a.дясно; });
    return { scrollWidth: scrollW, clientWidth: clientW, разлика: scrollW - clientW,
             прегледани: прегледани, ВИНОВНИЦИ: виновници.slice(0, 8),
             влачи_ли_се: влачи, overflowX: 'html:' + вx + ' body:' + бx,
             жълто_излизат_наляво: надясно.slice(0, 5), брой_виновници: виновници.length };
  }
  function отрязанОтродител(el) {
    var n = el.parentElement;
    // <body> и <html> НЕ се броят: техният overflow се прехвърля на видимата
    // област и точно там живее щетата, която търсим.
    while (n && n !== document.documentElement && n !== document.body) {
      var cs = стил(n), ox = cs.overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') {
        var rn = n.getBoundingClientRect(), re = el.getBoundingClientRect();
        if (re.right > rn.right + 1 || re.left < rn.left - 1) return true;
      }
      n = n.parentElement;
    }
    return false;
  }

  // ── 3.2 мишени за пръст ──
  var СЕЛ_МИШЕНИ = 'button, a, input, select, textarea, summary, [role="button"], [role="tab"], [role="switch"], [role="link"], [role="checkbox"], [role="radio"]';

  function провериМишени(корени) {
    var прегледани = 0, МАЛКИ = [], жълто_вградени = [], пропуснати_невидими = 0;
    възлиОт(корени, СЕЛ_МИШЕНИ).forEach(function (el) {
      if (el.ownerSVGElement) return;                 // <a> вътре в рисунка не е бутон
      var cs = стил(el);
      if (el.tagName === 'INPUT' && el.type === 'hidden') return;
      if (cs.pointerEvents === 'none') return;
      if (!видим(el, cs)) { пропуснати_невидими++; return; }
      прегледани++;
      var к = разширенаКутия(el, cs);
      if (к.width >= МИН_МИШЕНА - ДОПУСК && к.height >= МИН_МИШЕНА - ДОПУСК) return;
      var запис = {
        път: път(el), етикет: откъс(el.getAttribute('aria-label') || el.textContent || el.value || el.placeholder || el.tagName, 34),
        мярка: Math.round(к.width) + '×' + Math.round(к.height),
        липсва: Math.max(0, Math.round(МИН_МИШЕНА - к.width)) + '×' + Math.max(0, Math.round(МИН_МИШЕНА - к.height))
      };
      if (вграденЛинк(el, cs)) { запис.защо_жълто = 'вграден в течащ текст — WCAG 2.5.8 го изважда'; жълто_вградени.push(запис); }
      else МАЛКИ.push(запис);
    });
    return { прегледани: прегледани, пропуснати_невидими: пропуснати_невидими, МАЛКИ: МАЛКИ, жълто_вградени: жълто_вградени };
  }

  // ::before/::after с отрицателни inset-и е стандартният начин зоната да се
  // уголеми, без кутията да порасне. Четем го — иначе бием здрав код.
  function разширенаКутия(el, cs) {
    var r = el.getBoundingClientRect();
    var л = 0, д = 0, г = 0, дол = 0;
    ['::before', '::after'].forEach(function (пс) {
      var p;
      try { p = getComputedStyle(el, пс); } catch (e) { return; }
      if (!p || p.content === 'none' || p.content === 'normal') return;
      if (p.position !== 'absolute' && p.position !== 'fixed') return;
      var f = function (v) { var n = parseFloat(v); return isNaN(n) ? 0 : Math.max(0, -n); };
      г = Math.max(г, f(p.top)); дол = Math.max(дол, f(p.bottom));
      л = Math.max(л, f(p.left)); д = Math.max(д, f(p.right));
    });
    return { width: r.width + л + д, height: r.height + г + дол };
  }

  function вграденЛинк(el, cs) {
    if (el.tagName !== 'A') return false;
    if (cs.display !== 'inline') return false;
    var p = el.parentElement;
    if (!p) return false;
    return собственТекст(p).length > 0;   // има съседен текст → тече в изречение
  }

  // ── 3.3 контраст ──
  function провериКонтраст(корени) {
    var р = {
      прегледани: 0, ЧЕРВЕНИ: [], ЖЪЛТИ: [], през_полупрозрачно: 0, през_филтър: 0,
      пропуснати: { svg: 0, емоджи: 0, невидими: 0, без_текст: 0, неразчетен_цвят: 0,
                    картинка_фон: 0, украса: 0 },
      най_слаб: null
    };
    възлиОт(корени, '*').forEach(function (el) {
      if (ПРОПУСНИ_ЕТИКЕТ[el.tagName]) return;
      var т = собственТекст(el);
      if (!т) { р.пропуснати.без_текст++; return; }
      if (el.ownerSVGElement || el.tagName === 'svg' || (window.SVGElement && el instanceof SVGElement)) { р.пропуснати.svg++; return; }
      if (самоЕмоджи(т)) { р.пропуснати.емоджи++; return; }
      var cs = стил(el);
      if (!видим(el, cs)) { р.пропуснати.невидими++; return; }

      // ✦ УКРАСА срещу ЗНАК ЗА ПРЪСТА — разликата е дали е в бутон.
      //   „✕" и „←" са единични символи, но живеят в бутон и мама ТРЯБВА да
      //   ги вижда → мерят се. „✦ ✧" в <span class="logo-spark"> са искри
      //   около логото: те са нарочно бледи и присъдата „контраст 1.68" върху
      //   тях е фалшива тревога, която удавя истинските редове.
      //   Затова: единичен символ БЕЗ буква и цифра, който НЕ е в интерактивен
      //   елемент → жълто (за поглед), не червено.
      var самоЗнак = т.length <= 2 && !/[0-9\wА-Яа-яЀ-ӿ]/.test(т);
      if (самоЗнак && !(el.closest && el.closest('button, a, summary, label, [role="button"], [role="tab"], [role="link"]'))) {
        р.пропуснати.украса++;
        return;
      }

      var текстовЦвят = цвят(cs.webkitTextFillColor && cs.webkitTextFillColor !== 'currentcolor' ? cs.webkitTextFillColor : cs.color);
      if (!текстовЦвят) { р.пропуснати.неразчетен_цвят++; return; }
      // буква, боядисана с градиент (background-clip:text) — пиксел не чета
      if ((cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text')) {
        р.ЖЪЛТИ.push({ път: път(el), текст: откъс(т), защо: 'буквите са боядисани с градиент (background-clip:text) — не се мери' });
        return;
      }

      var фон = фонПод(el);
      р.прегледани++;
      if (фон.полупрозрачно) р.през_полупрозрачно++;
      if (фон.картинка) { р.пропуснати.картинка_фон++;
        р.ЖЪЛТИ.push({ път: път(el), текст: откъс(т), защо: 'фонът е растерна картинка — пиксел не чета' }); return; }
      if (фон.неясен) {
        р.ЖЪЛТИ.push({ път: път(el), текст: откъс(т), защо: 'цвят на фона, който не разчитам (color()/oklch())' }); return; }
      if (фон.филтър) {
        р.през_филтър++;
        р.ЖЪЛТИ.push({ път: път(el), текст: откъс(т),
          защо: 'филтър по веригата (' + фон.филтър.slice(0, 40) + ') — мени и буквата, и фона: не смятам' });
        return; }

      var разм = parseFloat(cs.fontSize) || 16;
      var тегло = parseInt(cs.fontWeight, 10); if (isNaN(тегло)) тегло = (cs.fontWeight === 'bold' ? 700 : 400);
      var едър = разм >= ЕДЪР_PX || (разм >= ПОЛУЕДЪР_PX && тегло >= 700);
      var праг = едър ? ПРАГ_ЕДЪР : ПРАГ_ДРЕБЕН;

      var мин = Infinity, макс = -Infinity, найЛошФон = null;
      фон.кандидати.forEach(function (b) {
        var t = върху({ r: текстовЦвят.r, g: текстовЦвят.g, b: текстовЦвят.b, a: текстовЦвят.a * фон.opacity }, b);
        var к = контраст(t, b);
        if (к < мин) { мин = к; найЛошФон = b; }
        if (к > макс) макс = к;
      });
      if (!isFinite(мин)) { р.пропуснати.неразчетен_цвят++; р.прегледани--; return; }

      var запис = {
        път: път(el), текст: откъс(т), контраст: +мин.toFixed(2),
        нужно: праг, размер: Math.round(разм) + 'px/' + тегло + (едър ? ' (едър)' : ''),
        // ⚠️ Цветът се пише СУРОВ (с алфата), а не изгладен до rgb(): при
        // „бяло върху розово" сметката излизаше 1.48, а на ръка се получава
        // 1.94 — разликата е точно алфата на буквата (и кумулативната
        // прозрачност), която изгладеният запис мълчаливо изяждаше. Число,
        // което не можеш да пресметнеш пак от собствения му ред, е анекдот.
        цвят: cs.color + (фон.opacity < 0.999 ? ' × opacity ' + фон.opacity.toFixed(2) : ''),
        фон: вЗапис(найЛошФон)
      };
      if (фон.полупрозрачно) запис.бележка = 'през полупрозрачен слой';
      if (!р.най_слаб || мин < р.най_слаб.контраст) р.най_слаб = запис;

      if (мин >= праг) return;                                   // сигурно минава
      if (макс < праг) { р.ЧЕРВЕНИ.push(запис); return; }        // сигурно пада
      запис.диапазон = +мин.toFixed(2) + '–' + макс.toFixed(2);  // градиент: зависи
      запис.защо = 'градиент: минава на едни спирки, пада на други';
      р.ЖЪЛТИ.push(запис);
    });
    return р;
  }

  // ── 3.4 безкрайни анимации ──
  var кешКадри = null;
  function кадриНаДокумента() {
    if (кешКадри) return кешКадри;
    var карта = {};
    function обходи(правила) {
      for (var i = 0; i < правила.length; i++) {
        var р = правила[i];
        // CSSKeyframesRule е type 7; `name` имат и @layer блоковете — затова
        // проверката е двойна, иначе слоевете влизат като „кадри" и вадят
        // свойства, които никой не анимира.
        var еКадри = р.type === 7 || /CSSKeyframesRule/.test(String(р.constructor && р.constructor.name || ''));
        if (еКадри && р.name && р.cssRules) {
          var набор = карта[р.name] || (карта[р.name] = {});
          for (var j = 0; j < р.cssRules.length; j++) {
            var кф = р.cssRules[j];
            if (!кф.style) continue;
            for (var k = 0; k < кф.style.length; k++) набор[кф.style.item(k)] = 1;
          }
        } else if (р.cssRules) { try { обходи(р.cssRules); } catch (e) {} }
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) {
      try { обходи(document.styleSheets[s].cssRules); } catch (e) { /* чужд лист — няма такива тук */ }
    }
    кешКадри = карта;
    return карта;
  }

  function провериАнимации(корени) {
    var кадри = кадриНаДокумента();
    var р = { прегледани: 0, безкрайни: 0, ЧЕРВЕНИ: [], жълто_междинни: [], жълто_smil: [], непознати_кадри: [] };
    var виждани = {}, презаредено = false;
    function преглед(el, пс) {
      var cs;
      try { cs = пс ? getComputedStyle(el, пс) : стил(el); } catch (e) { return; }
      if (!cs || cs.animationName === 'none' || !cs.animationName) return;
      var имена = cs.animationName.split(',').map(function (x) { return x.trim(); });
      var броения = (cs.animationIterationCount || '').split(',').map(function (x) { return x.trim(); });
      имена.forEach(function (име, i) {
        var бр = броения[i] !== undefined ? броения[i] : броения[броения.length - 1];
        if (бр !== 'infinite') return;
        р.безкрайни++;
        var набор = кадри[име];
        // 🔴 11.08 — намерено от САМОПРОВЕРКАТА, не от четене: картата на
        // @keyframes се строеше веднъж и се пазеше. Всеки лист, добавен
        // ПОСЛЕ (както прави самата самопроверка, а може и стая да го
        // направи), оставаше непознат — и цикълът по `left` минаваше за чист.
        // Тоест кешът правеше проверчика СЛЯП, а не бавен. Един презапис на
        // цикъл и после мълчание.
        if (!набор && !презаредено) { презаредено = true; кешКадри = null; кадри = кадриНаДокумента(); набор = кадри[име]; }
        if (!набор) { if (р.непознати_кадри.indexOf(име) < 0) р.непознати_кадри.push(име); return; }
        Object.keys(набор).forEach(function (св) {
          if (АНИМ_ЗЕЛЕНИ[св]) return;
          var ключ = име + '|' + св;
          var кошница = АНИМ_ЖЪЛТИ[св] ? р.жълто_междинни : р.ЧЕРВЕНИ;
          if (виждани[ключ]) { виждани[ключ].елементи++; return; }
          var запис = { анимация: име, свойство: св, елементи: 1, пример: път(el) + (пс || ''),
                        продължителност: cs.animationDuration };
          виждани[ключ] = запис;
          кошница.push(запис);
        });
      });
    }
    възлиОт(корени, '*').forEach(function (el) {
      if (ПРОПУСНИ_ЕТИКЕТ[el.tagName]) return;
      var cs = стил(el);
      if (!видим(el, cs, true)) return;          // true = прозрачността не спасява
      р.прегледани++;
      преглед(el, null); преглед(el, '::before'); преглед(el, '::after');
    });
    // SMIL в SVG — отделна сметка, отделна присъда (жълто): приложението ги
    // спира, щом сцената излезе от екрана (IntersectionObserver в app.js).
    възлиОт(корени, 'animate, animateTransform, animateMotion, set').forEach(function (a) {
      if ((a.getAttribute('repeatCount') || '') !== 'indefinite') return;
      var ат = a.getAttribute('attributeName') || a.tagName;
      var ключ = 'smil|' + ат;
      var има = null;
      for (var i = 0; i < р.жълто_smil.length; i++) if (р.жълто_smil[i].ключ === ключ) има = р.жълто_smil[i];
      if (има) { има.елементи++; return; }
      р.жълто_smil.push({ ключ: ключ, свойство: ат, елементи: 1, пример: път(a.parentElement || a) });
    });
    return р;
  }

  // събира възлите под даден списък корени (без повторения)
  function възлиОт(корени, сел) {
    var out = [], видени = new Set();
    (корени || []).forEach(function (корен) {
      if (!корен) return;
      if (корен.matches && корен.matches(сел) && !видени.has(корен)) { видени.add(корен); out.push(корен); }
      var л = корен.querySelectorAll(сел);
      for (var i = 0; i < л.length; i++) if (!видени.has(л[i])) { видени.add(л[i]); out.push(л[i]); }
    });
    return out;
  }

  // ═════════════════════════ 4. ЕКРАНИТЕ ═══════════════════════════════════
  // Всеки екран знае да се отвори, знае КОИ корени да се мерят (за да не
  // премерваме 12 пъти долната навигация) и знае да се затвори със
  // собствения си бутон.

  function сел(с) { return document.querySelector(с); }
  function корениОт(списък) {
    var out = [];
    списък.forEach(function (с) { var e = typeof с === 'string' ? сел(с) : с; if (e) out.push(e); });
    return out;
  }

  function построиЕкрани() {
    var е = [];
    var празно = function () { return Promise.resolve(); };

    е.push({
      име: 'Начало (героят)',
      отвори: function () { window.scrollTo(0, 0); return спи(250); },
      корени: function () { return корениОт(['header.hero', '#todaySection', '.bottom-nav']); },
      затвори: празно
    });

    е.push({
      име: 'Стаите (решетката)',
      отвори: function () { var с = сел('#стаите'); if (с) с.scrollIntoView(); return спи(400); },
      корени: function () { return корениОт(['#стаите', '.bottom-nav']); },
      затвори: function () { window.scrollTo(0, 0); return спи(120); }
    });

    // деветте стаи — четат се от САМАТА страница, не се преписват наум
    var стаи = [];
    document.querySelectorAll('.room-card[data-room]').forEach(function (к) {
      var r = к.getAttribute('data-room');
      if (r && стаи.indexOf(r) < 0) стаи.push(r);
    });
    стаи.forEach(function (стая) {
      е.push({
        име: 'Стая · ' + стая,
        стая: стая,
        отвори: function (о) {
          window._ldDirect = true;                 // без прелитането на героя
          window.MamaHelper.open(стая);
          return спи(о.пауза + 400);               // скелетът е 640ms, числата 660ms
        },
        корени: function () { return корениОт(['#roomOverlay']); },
        затвори: function () { window.MamaHelper.close(); return спи(220); }
      });
    });

    е.push({
      име: 'Чат с помощничката',
      отвори: function (о) {
        window._ldDirect = true;
        window.MamaHelper.open(стаи[1] || стаи[0]);
        return спи(о.пауза + 300).then(function () { window.MamaHelper.showTab('chat'); return спи(500); });
      },
      корени: function () { return корениОт(['#roomOverlay']); },
      затвори: function () { window.MamaHelper.close(); return спи(220); }
    });

    е.push({
      име: 'Статия (четецът)',
      отвори: function (о) {
        var а = null;
        if (window.BL_ARTICLES) {
          for (var i = 0; i < стаи.length && !а; i++) {
            var сп = window.BL_ARTICLES.forRoom(стаи[i]) || [];
            if (сп.length) а = сп[0];
          }
        }
        if (!а) return Promise.resolve('няма нито една статия — BL_ARTICLES мълчи');
        window.BL_ARTICLES.open(а.id);
        return спи(о.пауза + 700);                 // тялото идва мързеливо от пакет
      },
      корени: function () { return корениОт(['#artOverlay']); },
      затвори: function () { var b = $('artClose'); if (b) b.click(); return спи(200); }
    });

    е.push({
      име: 'СОС (спешните номера)',
      отвори: function (о) {
        if (!window.BL_SOS_CENTER) return Promise.resolve('BL_SOS_CENTER липсва');
        window.BL_SOS_CENTER.open(); return спи(о.пауза);
      },
      корени: function () { return корениОт(['#sosOverlay']); },
      затвори: function () { var x = document.querySelector('#sosOverlay .sos-x'); if (x) x.click(); return спи(200); }
    });

    е.push({
      име: 'Търсене (с резултати)',
      отвори: function (о) {
        if (!window.BL_SEARCH) return Promise.resolve('BL_SEARCH липсва');
        window.BL_SEARCH.open();
        var inp = $('searchInput');
        if (inp) { inp.value = 'температура'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        return спи(о.пауза);
      },
      корени: function () { return корениОт(['#searchOverlay']); },
      затвори: function () { if (window.BL_SEARCH) window.BL_SEARCH.close(); var i = $('searchInput'); if (i) i.value = ''; return спи(150); }
    });

    // ако мама още не се е представила, първото запознаване стои НАД всичко —
    // мерим го само когато наистина се вижда
    var onb = $('onbOverlay');
    if (onb && !onb.hidden) {
      е.push({
        име: 'Първо запознаване',
        отвори: function () { onb.hidden = false; return спи(200); },
        корени: function () { return корениОт(['#onbOverlay']); },
        затвори: function () { onb.hidden = true; return спи(100); }
      });
    }
    return е;
  }

  // ═════════════════════════ 4б. ЗАВЕСАТА .reveal ══════════════════════════
  // ⚠️ ЗАЩО СЪЩЕСТВУВА ТОВА (измерено на 11.08, не предположено):
  //   Появяването при скрол се пали от IntersectionObserver. В СКРИТ раздел
  //   (document.hidden — какъвто е всеки автоматизиран браузър без показан
  //   панел) наблюдателят не се обажда НИКОГА: 29 елемента с .reveal, 0 със
  //   .shown, всичките на opacity:0. Тоест тестът щеше да мери празен екран и
  //   да върне „0 червени" — най-лошият възможен резултат: чисто, защото не е
  //   гледало.
  //   Затова завесата се вдига НАСИЛА, но само за времето на мерене и само
  //   там, където я е нямало — и точно тези елементи се връщат обратно.
  //   Броят им влиза в доклада: числото „разкрити насила" е част от истината.
  function вдигниЗавесата(корени) {
    var пипнати = [];
    (корени || []).forEach(function (корен) {
      if (!корен) return;
      var л = корен.querySelectorAll('.reveal:not(.shown)');
      for (var i = 0; i < л.length; i++) { л[i].classList.add('shown'); пипнати.push(л[i]); }
      if (корен.classList && корен.classList.contains('reveal') && !корен.classList.contains('shown')) {
        корен.classList.add('shown'); пипнати.push(корен);
      }
    });
    return пипнати;
  }
  function спусниЗавесата(пипнати) {
    (пипнати || []).forEach(function (el) { el.classList.remove('shown'); });
  }

  // ═════════════════════════ 4в. ЗАМРАЗЯВАНЕ НА ВЛИЗАНЕТО ══════════════════
  // ⚠️ Втората половина на същия урок (11.08): вдигането на .reveal не стигна.
  //   Класът .shown сменя opacity през ПРЕХОД, а преходите и появяващите се
  //   анимации не текат, докато разделът е скрит — браузърът е спрял
  //   рисуването. Мерено: 8141 елемента бяха отчетени като „невидими",
  //   проверени останаха 94. Тест, който гледа 94 от 8235 елемента и после
  //   казва „2 червени", лъже с мълчание.
  //   Затова за времето на мерене:
  //     · `transition: none` — .shown влиза мигновено, вместо за 600 ms;
  //     · `animation-duration: .001s` + `fill-mode: forwards` — анимациите за
  //       ВЛИЗАНЕ скачат на крайното си състояние (това, което мама гледа през
  //       99% от времето). Безкрайните не свършват — тях само ги ускорява, а
  //       в скрит раздел те и без това не текат.
  //   ВАЖНО за реда: `animation-name` и `iteration-count` НЕ се пипат, тоест
  //   проверката за безкрайни анимации остава честна. Но продължителността се
  //   подменя — затова тя се мери ПРЕДИ замразяването, не след.
  //   Мерено по стъпки на живо, за да не се гадае кое помага:
  //     само `transition:none`            →  94 видими текста от 8235
  //     + `animation:none`                → 148
  //     + правилата за влизане отдолу     → виж доклада (ПРОВЕРЕНИ_ТЕКСТОВИ…)
  //   Последният ред НЕ е измислен: това са точните правила, с които САМОТО
  //   приложение гаси влизането при `prefers-reduced-motion` (css/anim.css:647
  //   и js/anim.js, което крие картите с inline opacity + клас .is-pending).
  //   Тоест мерим състоянието, което мама вижда, ако си е изключила движението.
  var ЗАМРАЗЯВАНЕ = '*,*::before,*::after{transition:none !important;animation:none !important;}' +
    '.reveal{opacity:1 !important;transform:none !important;}' +
    '.is-pending,.jr-card.is-pending{opacity:1 !important;transform:none !important;}';
  function замрази() {
    if (document.getElementById('blТелефонЗамразяване')) return;
    var s = document.createElement('style');
    s.id = 'blТелефонЗамразяване';
    s.textContent = ЗАМРАЗЯВАНЕ;
    document.head.appendChild(s);
  }
  function размрази() {
    var s = document.getElementById('blТелефонЗамразяване');
    if (s) s.remove();
  }

  // ═════════════════════════ 5. ПАМЕТТА НА МАМА ════════════════════════════
  function снимкаLS() {
    try {
      var о = {};
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); о[k] = localStorage.getItem(k); }
      return о;
    } catch (e) { return null; }
  }
  function разликаLS(преди, след) {
    if (!преди || !след) return [];
    var р = [];
    Object.keys(след).forEach(function (k) {
      if (!(k in преди)) р.push({ ключ: k, какво: 'ДОБАВЕН от теста' });
      else if (преди[k] !== след[k]) р.push({ ключ: k, какво: 'ПРОМЕНЕН от теста' });
    });
    Object.keys(преди).forEach(function (k) { if (!(k in след)) р.push({ ключ: k, какво: 'ИЗТРИТ от теста' }); });
    return р;
  }
  function върниLS(преди) {
    if (!преди) return [];
    var върнати = [];
    try {
      var сега = снимкаLS();
      Object.keys(сега).forEach(function (k) { if (!(k in преди)) { localStorage.removeItem(k); върнати.push(k + ' (изтрит обратно)'); } });
      Object.keys(преди).forEach(function (k) { if (сега[k] !== преди[k]) { localStorage.setItem(k, преди[k]); върнати.push(k + ' (върната старата стойност)'); } });
    } catch (e) {}
    return върнати;
  }

  // ═════════════════════════ 6. САМОПРОВЕРКА ═══════════════════════════════
  // Нарочно счупено — и доказателство, че проверчикът го хваща. И обратната
  // посока: здравото НЕ бива да пада. (Пазач срещу фалшива тревога вече
  // веднъж роди пропусната дупка — затова тук всяка сцена има близнак.)
  function самопроверка() {
    var редове = [];
    var кутия = document.createElement('div');
    кутия.id = 'blТелефонПясъчник';
    // вън от полезрението, но НЕ display:none — иначе нищо не се мери
    кутия.style.cssText = 'position:absolute;left:0;top:0;width:320px;background:#fff;z-index:-1;opacity:1;';
    var стилче = document.createElement('style');
    стилче.id = 'blТелефонСтил';
    стилче.textContent =
      '@keyframes блТестЛошо { from { left: 0; box-shadow: 0 0 0 red; } to { left: 40px; box-shadow: 0 0 9px red; } }' +
      '@keyframes блТестДобро { from { transform: translateX(0); opacity: 1 } to { transform: translateX(9px); opacity: .4 } }' +
      '#blТелефонПясъчник .лоша-анимация { animation: блТестЛошо 2s infinite; position: relative; }' +
      '#blТелефонПясъчник .добра-анимация { animation: блТестДобро 2s infinite; }';
    document.head.appendChild(стилче);

    кутия.innerHTML =
      '<div id="бсКонтраст" style="background:#ffffff">' +
        '<p id="бсЛошТекст" style="color:#aaaaaa;font-size:14px">сив текст върху бяло — трябва да падне</p>' +
        '<p id="бсДобърТекст" style="color:#111111;font-size:14px">черен текст върху бяло — трябва да мине</p>' +
      '</div>' +
      '<div id="бсТъмен" style="background:#000000">' +
        '<div id="бсПрозрачен">' +
          '<p id="бсБял" style="color:#ffffff;font-size:14px">бял текст през прозрачен пласт върху черно — трябва да МИНЕ</p>' +
        '</div>' +
      '</div>' +
      '<div id="бсЕмоджи" style="background:#ffffff"><span style="color:#f2f2f2;font-size:14px">🍼</span></div>' +
      '<div style="background:#ffffff"><span id="бсИскра" style="color:#f0f0f0;font-size:14px">✦</span></div>' +
      '<button id="бсХикс" style="width:48px;height:48px;background:#ffffff;color:#f0f0f0;font-size:14px">✕</button>' +
      '<div id="бсФилтър" style="filter:brightness(0.62);background:#ffffff">' +
        '<p id="бсПодФилтър" style="color:#dddddd;font-size:14px">под филтър — не се съди, а се брои</p></div>' +
      '<svg id="бсSvg" width="60" height="20"><text x="0" y="14" fill="#f4f4f4" font-size="12">свг</text></svg>' +
      '<button id="бсМалък" style="width:20px;height:20px">x</button>' +
      '<button id="бсГолям" style="width:48px;height:48px">ок</button>' +
      '<div class="лоша-анимация" style="width:20px;height:20px">.</div>' +
      '<div class="добра-анимация" style="width:20px;height:20px">.</div>';
    document.body.appendChild(кутия);

    var корени = [кутия];
    кешСтил = new Map();

    // ── контраст ──
    var к = провериКонтраст(корени);
    var пътища = к.ЧЕРВЕНИ.map(function (x) { return x.път; }).join(' ');
    редове.push(сцена('контраст лови сив #aaa върху бяло (2.32)', 'ред за #бсЛошТекст',
      /бсЛошТекст/.test(пътища) ? 'хванат' : 'НЕ Е ХВАНАТ', /бсЛошТекст/.test(пътища)));
    редове.push(сцена('контраст НЕ лови черно върху бяло (обратна посока)', '0 реда за #бсДобърТекст',
      /бсДобърТекст/.test(пътища) ? 'фалшива тревога' : 'мълчи', !/бсДобърТекст/.test(пътища)));
    редове.push(сцена('смесването работи: бяло през ПРОЗРАЧЕН пласт върху ЧЕРНО',
      '0 реда за #бсБял (наивният проверчик щеше да види „бяло върху бяло")',
      /бсБял/.test(пътища) ? 'фалшива тревога — фонът НЕ се сглобява' : 'мълчи', !/бсБял/.test(пътища)));
    редове.push(сцена('текст само от емоджи се пропуска', 'поне 1 пропуснато емоджи',
      к.пропуснати.емоджи + ' пропуснати', к.пропуснати.емоджи >= 1));
    редове.push(сцена('текст в <svg> се пропуска', 'поне 1 пропуснат svg',
      к.пропуснати.svg + ' пропуснати', к.пропуснати.svg >= 1));
    редове.push(сцена('единичен знак-УКРАСА извън бутон се пропуска (✦)', '0 реда за #бсИскра',
      /бсИскра/.test(пътища) ? 'фалшива тревога върху украса' : 'мълчи', !/бсИскра/.test(пътища)));
    редове.push(сцена('същият знак В БУТОН се СЪДИ (✕) — обратната посока', 'ред за #бсХикс',
      /бсХикс/.test(пътища) ? 'хванат' : 'НЕ Е ХВАНАТ', /бсХикс/.test(пътища)));
    var жълтоПътища = к.ЖЪЛТИ.map(function (x) { return x.път; }).join(' ');
    редове.push(сцена('текст под filter: brightness НЕ се обявява за червен',
      '0 червени реда за #бсПодФилтър',
      /бсПодФилтър/.test(пътища) ? 'ФАЛШИВА ТРЕВОГА — филтърът се пренебрегва' : 'мълчи',
      !/бсПодФилтър/.test(пътища)));
    редове.push(сцена('…но се БРОИ като неизмерим (жълто, не тишина)',
      'ред в ЖЪЛТИ за #бсПодФилтър',
      /бсПодФилтър/.test(жълтоПътища) ? 'преброен' : 'ИЗЧЕЗНАЛ БЕЗ СЛЕДА',
      /бсПодФилтър/.test(жълтоПътища)));
    редове.push(сцена('контрастът изобщо е гледал нещо', '≥3 прегледани текстови елемента',
      к.прегледани + ' прегледани', к.прегледани >= 3));

    // ── мишени ──
    var м = провериМишени(корени);
    var мп = м.МАЛКИ.map(function (x) { return x.път; }).join(' ');
    редове.push(сцена('мишени ловят бутон 20×20', 'ред за #бсМалък',
      /бсМалък/.test(мп) ? 'хванат' : 'НЕ Е ХВАНАТ', /бсМалък/.test(мп)));
    редове.push(сцена('мишени НЕ ловят бутон 48×48 (обратна посока)', '0 реда за #бсГолям',
      /бсГолям/.test(мп) ? 'фалшива тревога' : 'мълчи', !/бсГолям/.test(мп)));

    // ── анимации ──
    var а = провериАнимации(корени);
    var ас = а.ЧЕРВЕНИ.map(function (x) { return x.анимация + ':' + x.свойство; }).join(' ');
    редове.push(сцена('анимации ловят безкраен цикъл по `left`', 'блТестЛошо:left',
      /блТестЛошо:left/.test(ас) ? 'хванат' : 'НЕ Е ХВАНАТ', /блТестЛошо:left/.test(ас)));
    редове.push(сцена('анимации ловят и `box-shadow` в същия цикъл', 'блТестЛошо:box-shadow',
      /блТестЛошо:box-shadow/.test(ас) ? 'хванат' : 'НЕ Е ХВАНАТ', /блТестЛошо:box-shadow/.test(ас)));
    редове.push(сцена('анимации НЕ ловят transform/opacity (обратна посока)', '0 реда за блТестДобро',
      /блТестДобро/.test(ас) ? 'фалшива тревога' : 'мълчи', !/блТестДобро/.test(ас)));

    // ── разместване ──
    // ⚠️ Мери се срещу СОБСТВЕНАТА изходна точка, не срещу „0". Ако страницата
    // вече се размества (истински дефект), сравнението „scrollWidth === client"
    // би обявило самопроверката за счупена и щеше да заглуши целия доклад
    // заради дефект, който тъкмо намираме. Затова: р0 → р1 → р2.
    кешСтил = new Map();
    var р0 = провериРазместване(корени);
    var широк = document.createElement('div');
    широк.id = 'бсШирок';
    широк.style.cssText = 'width:200vw;height:4px;background:#eee';
    кутия.appendChild(широк);
    кешСтил = new Map();
    var р1 = провериРазместване(корени);
    широк.remove();
    кешСтил = new Map();
    var р2 = провериРазместване(корени);
    редове.push(сцена('разместването лови елемент 200vw', 'scrollWidth расте над изходните ' + р0.scrollWidth,
      р1.scrollWidth + ' (беше ' + р0.scrollWidth + ')', р1.scrollWidth > р0.scrollWidth + ДОПУСК));
    редове.push(сцена('разместването се изчиства след махането (обратна посока)',
      'обратно на ' + р0.scrollWidth, р2.scrollWidth + '', Math.abs(р2.scrollWidth - р0.scrollWidth) <= ДОПУСК));
    редове.push(сцена('разместването сочи ВИНОВНИКА, не само числото', 'ред за #бсШирок',
      (р1.ВИНОВНИЦИ.map(function (x) { return x.път; }).join(' ').indexOf('бсШирок') >= 0) ? 'посочен' : 'НЕ Е ПОСОЧЕН',
      р1.ВИНОВНИЦИ.map(function (x) { return x.път; }).join(' ').indexOf('бсШирок') >= 0));

    // ── чистене и доказателство, че е чисто ──
    кутия.remove(); стилче.remove();
    редове.push(сцена('пясъчникът е махнат след себе си', '0 останали възела',
      (document.getElementById('blТелефонПясъчник') ? 1 : 0) + (document.getElementById('blТелефонСтил') ? 1 : 0) + ' останали',
      !document.getElementById('blТелефонПясъчник') && !document.getElementById('blТелефонСтил')));
    кешСтил = null;
    кешКадри = null;   // стилчето вече го няма — картата на кадрите се строи наново
    return редове;
  }
  function сцена(име, очаквано, получено, лови) {
    return { СЦЕНА: име, ОЧАКВАНО: очаквано, ПОЛУЧЕНО: получено, ЛОВИ_ЛИ: лови ? 'ДА' : 'НЕ' };
  }

  // ═════════════════════════ 7. РЕДОВЕТЕ ═══════════════════════════════════
  function ред(група, име, очаквано, получено, мина, бележка) {
    return { група: група, име: име, ОЧАКВАНО: очаквано, ПОЛУЧЕНО: получено, мина: !!мина, бележка: бележка || '' };
  }
  function списък(масив, поле, н) {
    н = н || 3;
    if (!масив.length) return '—';
    return масив.slice(0, н).map(function (x) { return x[поле]; }).join(' · ') + (масив.length > н ? ' … (+' + (масив.length - н) + ')' : '');
  }

  // ═════════════════════════ 8. ГЛАВНОТО МИНАВАНЕ ══════════════════════════
  async function провери(опции) {
    опции = Object.assign({ пауза: 900, паузаТема: 420, теми: ['light', 'dark'],
                            разкрий: true, замразявай: true,
                            // срок за отваряне на ЕДИН екран. 30 екрана × 2 теми
                            // в най-лошия случай = 12 мин, а не безкрайност.
                            срок: 12000 }, опции || {});
    if (!(опции.срок > 0)) опции.срок = 12000;   // подаден 0 или боклук → пак има изход
    var започна = Date.now(), разкритиНасила = 0;
    // 🔓 _ldDirect: без него MamaHelper.open чака полет, който в скрит таб
    // никога не свършва. Тестът си го включва сам — иначе всеки екран забива.
    var върниLd = window._ldDirect;
    window._ldDirect = true;
    console.log('%c📱 ТЕСТ ЗА ТЕЛЕФОНА', 'font-size:15px;font-weight:700');

    if (!window.MamaHelper) {
      var празно = { ПУСНАТИ_ТЕСТА: 0, ГРЕШКА: 'MamaHelper липсва — приложението не е заредено. Това НЕ е „чисто".' };
      console.log('%c🔴 ' + празно.ГРЕШКА, 'color:#c62828;font-weight:700');
      // и по ранния изход се връща както е заварено — иначе тест, който
      // излиза тук, оставя _ldDirect включено завинаги
      if (върниLd === undefined) { try { delete window._ldDirect; } catch (e) { window._ldDirect = undefined; } }
      else window._ldDirect = върниLd;
      window.BL_ТЕЛЕФОН.последен = празно;
      return празно;
    }

    // ── какво помним, за да го върнем ──
    var предиLS = снимкаLS();
    var предиТема = document.documentElement.getAttribute('data-theme');
    var предиЗаглавие = document.title;
    var предиПрелив = document.body.style.overflow;
    var предиСкрол = window.scrollY;
    var предиDirect = window._ldDirect;
    var предиЗавеса = document.querySelectorAll('.reveal.shown').length;

    var редове = [], екрани = построиЕкрани();
    var сборно = {
      текстови_елемента: 0, мишени: 0, елементи_за_анимация: 0, възли_за_разместване: 0,
      пропуснати_svg: 0, пропуснати_емоджи: 0, пропуснати_невидими: 0, през_полупрозрачно: 0,
      пропуснати_украса: 0, през_филтър: 0
    };
    var поЕкран = {};

    // ── две глобални мерки, преди да сме пипнали каквото и да е ──
    редове.push(ред('0 · сцената', 'видимата област е телефонна (' + ЦЕЛ_Ш + '×' + ЦЕЛ_В + ')',
      ЦЕЛ_Ш + '×' + ЦЕЛ_В, window.innerWidth + '×' + window.innerHeight,
      window.innerWidth === ЦЕЛ_Ш && window.innerHeight === ЦЕЛ_В,
      window.innerWidth === ЦЕЛ_Ш ? '' : 'мерено на друга ширина → числата долу важат за НЕЯ'));
    var стаиБрой = екрани.filter(function (е) { return е.стая; }).length;
    редове.push(ред('0 · сцената', 'намерени са 9-те стаи на страницата', '9 стаи',
      стаиБрой + ' стаи: ' + екрани.filter(function (е) { return е.стая; }).map(function (е) { return е.стая; }).join(', '),
      стаиБрой === 9));
    редове.push(ред('0 · сцената', 'разделът се вижда (иначе .reveal стои на opacity 0)',
      'document.hidden === false', 'document.hidden = ' + document.hidden +
      (document.hidden ? ' → завесата се вдига насила, за да има КАКВО да се мери' : ''),
      !document.hidden, document.hidden ? 'жълто — измерено с вдигната насила завеса' : ''));
    редове.push(ред('0 · сцената', 'покритие поне 12 екрана × 2 теми',
      '≥12 екрана × 2', екрани.length + ' екрана × ' + опции.теми.length + ' теми = ' +
      (екрани.length * опции.теми.length) + ' минавания',
      екрани.length >= 12 && опции.теми.length >= 2));

    // ── обиколката ──
    for (var т = 0; т < опции.теми.length; т++) {
      var тема = опции.теми[т];
      document.documentElement.setAttribute('data-theme', тема);
      await спи(опции.паузаТема);

      for (var i = 0; i < екрани.length; i++) {
        var е = екрани[i];
        var белег = е.име + ' · ' + (тема === 'dark' ? 'нощ' : 'ден');
        // 📍 живо табло за дълга обиколка: 30 минавания са дълго мълчание, а
        // мълчаливият тест не се различава от заклещен. Чете се отвън по всяко
        // време с BL_PHONE.прогрес.
        window.BL_ТЕЛЕФОН.прогрес = {
          екран: белег, номер: (т * екрани.length + i + 1), от: екрани.length * опции.теми.length,
          стъпка: 'отварям', секунди: Math.round((Date.now() - започна) / 1000)
        };
        var грешка = null;
        // ⏱ СРОК ЗА ОТВАРЯНЕ — добавен 11.08, след като тестът заби три пъти
        // и НИКОГА не върна резултат. Причината: `е.отвори()` чака нещо, което
        // в скрит таб не идва (браузърът дави таймерите и rAF), а тук нямаше
        // никакъв изход. Тест, който може да виси вечно, е тест, който не се
        // пуска — тоест нула. По-добре един червен ред „не се отвори за 12 сек",
        // отколкото цял доклад, който никой никога не вижда.
        try {
          грешка = await Promise.race([
            е.отвори(опции),
            new Promise(function (r) {
              setTimeout(function () { r('не се отвори за ' + (опции.срок / 1000) + ' сек — заклещено'); },
                         опции.срок);
            })
          ]);
        } catch (ex) { грешка = 'отварянето гръмна: ' + ex.message; }
        window.BL_ТЕЛЕФОН.прогрес.стъпка = 'меря';

        var корени = е.корени();
        var завеса = опции.разкрий ? вдигниЗавесата(корени) : [];
        разкритиНасила += завеса.length;
        if (завеса.length) await спи(60);          // да се преизчисли подредбата
        кешСтил = new Map();
        if (грешка || !корени.length) {
          редове.push(ред(белег, 'екранът се отваря', 'отворен и намерен в DOM',
            грешка || 'нито един корен не е намерен', false));
          размрази();
          спусниЗавесата(завеса);
          try { await е.затвори(); } catch (ex2) {}
          continue;
        }

        // РЕДЪТ Е ВАЖЕН: анимациите се мерят ЖИВИ (за да е вярна и
        // продължителността), после екранът се замразява в крайното си
        // състояние и чак тогава се мерят кутии, пръсти и цветове.
        var анм = провериАнимации(корени);
        if (опции.замразявай) {
          замрази();
          await спи(60);
          кешСтил = new Map();                     // стиловете се смениха → кешът е мъртъв
          завеса = завеса.concat(вдигниЗавесата(корени));
        }
        var разм = провериРазместване(корени);
        var миш = провериМишени(корени);
        var конт = провериКонтраст(корени);

        сборно.текстови_елемента += конт.прегледани;
        сборно.мишени += миш.прегледани;
        сборно.елементи_за_анимация += анм.прегледани;
        сборно.възли_за_разместване += разм.прегледани;
        сборно.пропуснати_svg += конт.пропуснати.svg;
        сборно.пропуснати_емоджи += конт.пропуснати.емоджи;
        сборно.пропуснати_невидими += конт.пропуснати.невидими;
        сборно.пропуснати_украса += конт.пропуснати.украса;
        сборно.през_филтър += конт.през_филтър;
        сборно.през_полупрозрачно += конт.през_полупрозрачно;
        поЕкран[белег] = {
          текст: конт.прегледани, мишени: миш.прегледани, анимации: анм.прегледани,
          червени: (разм.разлика > ДОПУСК ? 1 : 0) + миш.МАЛКИ.length + конт.ЧЕРВЕНИ.length + анм.ЧЕРВЕНИ.length,
          най_слаб_контраст: конт.най_слаб ? конт.най_слаб.контраст : '—'
        };

        редове.push(ред(белег, 'нула хоризонтално разместване',
          'scrollWidth === clientWidth (' + разм.clientWidth + ')',
          разм.scrollWidth + ' срещу ' + разм.clientWidth +
          (разм.разлика > ДОПУСК
            ? ' · +' + разм.разлика + 'px · ' + разм.брой_виновници + ' виновника: ' +
              списък(разм.ВИНОВНИЦИ, 'път') +
              (разм.влачи_ли_се ? ' · страницата СЕ влачи настрани'
                                : ' · не се влачи (' + разм.overflowX + '), но съдържанието се РЕЖЕ')
            : ''),
          разм.разлика <= ДОПУСК));

        редове.push(ред(белег, 'всяка мишена за пръст ≥ ' + МИН_МИШЕНА + '×' + МИН_МИШЕНА,
          '0 малки от ' + миш.прегледани + ' проверени',
          миш.МАЛКИ.length + (миш.МАЛКИ.length ? ': ' + миш.МАЛКИ.map(function (x) { return x.път + ' [' + x.мярка + ']'; }).slice(0, 4).join(' · ') : ''),
          миш.МАЛКИ.length === 0));

        if (миш.жълто_вградени.length)
          редове.push(ред(белег, 'ЖЪЛТО: вградени линкове под ' + МИН_МИШЕНА + 'px',
            '0 такива', миш.жълто_вградени.length + ': ' + списък(миш.жълто_вградени, 'път'),
            false, 'жълто — WCAG 2.5.8 ги изважда, но пръстът все пак ги мери'));

        редове.push(ред(белег, 'контраст ≥ ' + ПРАГ_ДРЕБЕН + ' (≥' + ПРАГ_ЕДЪР + ' за едър)',
          '0 паднали от ' + конт.прегледани + ' видими текста',
          конт.ЧЕРВЕНИ.length + (конт.ЧЕРВЕНИ.length ? ': ' + конт.ЧЕРВЕНИ.slice(0, 4).map(function (x) {
            return x.път + ' [' + x.контраст + ' < ' + x.нужно + '] „' + x.текст + '"'; }).join(' · ') : ''),
          конт.ЧЕРВЕНИ.length === 0));

        if (конт.ЖЪЛТИ.length)
          редове.push(ред(белег, 'ЖЪЛТО: контраст, който не мога да ЗАКЛЮЧА',
            '0 неизмерими', конт.ЖЪЛТИ.length + ': ' + списък(конт.ЖЪЛТИ, 'път'),
            false, 'жълто — градиент/картинка: не е зелено, но и не е присъда'));

        редове.push(ред(белег, 'нула безкрайни анимации извън transform/opacity',
          '0 такива от ' + анм.безкрайни + ' безкрайни цикъла',
          анм.ЧЕРВЕНИ.length + (анм.ЧЕРВЕНИ.length ? ': ' + анм.ЧЕРВЕНИ.slice(0, 5).map(function (x) {
            return x.анимация + '→' + x.свойство; }).join(' · ') : ''),
          анм.ЧЕРВЕНИ.length === 0));

        if (анм.жълто_smil.length || анм.жълто_междинни.length)
          редове.push(ред(белег, 'ЖЪЛТО: SMIL/междинни безкрайни движения',
            '0 такива', (анм.жълто_smil.length + анм.жълто_междинни.length) + ': ' +
            списък(анм.жълто_smil.concat(анм.жълто_междинни), 'свойство', 4),
            false, 'жълто — SVG-то се спира извън екрана (app.js), offset-* е transform под капака'));

        // цикъл, чиито кадри ги няма в нито един лист — не е чисто, а НЕПРОВЕРЕНО
        if (анм.непознати_кадри.length)
          редове.push(ред(белег, 'ЖЪЛТО: безкраен цикъл с ненамерени @keyframes',
            '0 непознати', анм.непознати_кадри.length + ': ' + анм.непознати_кадри.slice(0, 4).join(', '),
            false, 'жълто — не мога да кажа по кое свойство върви; НЕ значи „чисто"'));

        // подробностите се пазят цели, не само в реда
        поЕкран[белег].подробно = {
          разместване: разм.ВИНОВНИЦИ, малки_мишени: миш.МАЛКИ,
          слаб_контраст: конт.ЧЕРВЕНИ, неизмерим_контраст: конт.ЖЪЛТИ, анимации: анм.ЧЕРВЕНИ
        };

        window.BL_ТЕЛЕФОН.прогрес.стъпка = 'затварям';
        размрази();                                // екранът пак си движи анимациите
        спусниЗавесата(завеса);                    // завесата се връща както си беше
        try { await е.затвори(); } catch (ex3) {}
        кешСтил = null;
      }
    }

    // ── връщане на всичко пипнато ──
    window.BL_ТЕЛЕФОН.прогрес = { екран: 'край', стъпка: 'връщам всичко пипнато',
      секунди: Math.round((Date.now() - започна) / 1000) };
    if (предиТема === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', предиТема);
    document.title = предиЗаглавие;
    document.body.style.overflow = предиПрелив;
    window._ldDirect = предиDirect;
    window.scrollTo(0, предиСкрол);
    размрази();
    редове.push(ред('0 · сцената', 'замразяващият лист е махнат след теста',
      '0 останали <style>', (document.getElementById('blТелефонЗамразяване') ? 1 : 0) + ' останали',
      !document.getElementById('blТелефонЗамразяване')));
    var следЗавеса = document.querySelectorAll('.reveal.shown').length;
    редове.push(ред('0 · сцената', 'завесата .reveal е върната както си беше',
      предиЗавеса + ' показани .reveal', следЗавеса + ' показани .reveal (вдигнати насила по време на теста: ' +
      разкритиНасила + ')', предиЗавеса === следЗавеса));
    var следLS = снимкаLS();
    var промениLS = разликаLS(предиLS, следLS);
    var върнати = върниLS(предиLS);
    var остатъкLS = разликаLS(предиLS, снимкаLS());

    // ── самопроверката е ПОСЛЕДНА: тя чупи нарочно и трябва да чисти след себе си ──
    var сам = самопроверка();
    var самОк = сам.every(function (с) { return с.ЛОВИ_ЛИ === 'ДА'; });

    var паднали = редове.filter(function (р) { return !р.мина; });
    var жълти = паднали.filter(function (р) { return /^жълто/.test(р.бележка); });
    var червени = паднали.filter(function (р) { return !/^жълто/.test(р.бележка); });
    var поГрупи = {};
    червени.forEach(function (р) { поГрупи[р.група] = (поГрупи[р.група] || 0) + 1; });

    var доклад = {
      ПУСНАТИ_ТЕСТА: редове.length,
      МИНАЛИ: редове.length - паднали.length,
      ПАДНАЛИ_ЧЕРВЕНИ: червени.length,
      паднали_жълти: жълти.length,
      САМОПРОВЕРКА: самОк ? 'ОК — тестът пада на нарочно счупено (' + сам.length + ' сцени, в двете посоки)' : '🔴 СЧУПЕНА',
      ВРЕМЕ_СЕКУНДИ: Math.round((Date.now() - започна) / 1000),
      ВИДИМА_ОБЛАСТ: window.innerWidth + '×' + window.innerHeight + (window.innerWidth === ЦЕЛ_Ш ? '' : ' (НЕ е ' + ЦЕЛ_Ш + '×' + ЦЕЛ_В + '!)'),
      ПОКРИТИЕ: {
        екрани: екрани.length,
        теми: опции.теми.length,
        минавания_екран_х_тема: екрани.length * опции.теми.length,
        стаи: стаиБрой,
        ПРОВЕРЕНИ_ТЕКСТОВИ_ЕЛЕМЕНТА: сборно.текстови_елемента,
        ПРОВЕРЕНИ_МИШЕНИ: сборно.мишени,
        ПРОВЕРЕНИ_ЕЛЕМЕНТА_ЗА_АНИМАЦИЯ: сборно.елементи_за_анимация,
        прегледани_възела_при_разместване: сборно.възли_за_разместване,
        пропуснати_свг_текстове: сборно.пропуснати_svg,
        пропуснати_емоджи_текстове: сборно.пропуснати_емоджи,
        пропуснати_невидими: сборно.пропуснати_невидими,
        пропуснати_единични_знаци_украса: сборно.пропуснати_украса,
        мерени_през_полупрозрачен_слой: сборно.през_полупрозрачно,
        НЕизмерени_заради_филтър: сборно.през_филтър,
        разкрити_насила_reveal: разкритиНасила,
        разделът_беше_скрит: document.hidden,
        мерено_със_замразено_влизане: !!опции.замразявай
      },
      паднали_по_групи: поГрупи,
      ЧЕРВЕНИ: червени,
      ЖЪЛТИ: жълти,
      самопроверка_редове: сам,
      по_екран: поЕкран,
      localStorage: {
        ключове_преди: предиLS ? Object.keys(предиLS).length : '(недостъпен)',
        ПИПНАТИ_ОТ_ТЕСТА: промениLS.length ? промениLS : 'НЯМА',
        върнати_обратно: върнати.length ? върнати : 'нямаше какво да се връща',
        ОСТАТЪК_СЛЕД_ВРЪЩАНЕТО: остатъкLS.length ? остатъкLS : 'НЯМА — паметта на мама е както беше'
      },
      всички_редове: редове
    };

    // ── изход в конзолата ──
    console.log('пуснати теста: ' + доклад.ПУСНАТИ_ТЕСТА + '  ·  минали: ' + доклад.МИНАЛИ +
      '  ·  ЧЕРВЕНИ: ' + доклад.ПАДНАЛИ_ЧЕРВЕНИ + '  ·  жълти: ' + доклад.паднали_жълти);
    console.log('покритие: ' + екрани.length + ' екрана × ' + опции.теми.length + ' теми = ' +
      (екрани.length * опции.теми.length) + ' минавания  ·  ' + сборно.текстови_елемента +
      ' текстови елемента  ·  ' + сборно.мишени + ' мишени  ·  ' + сборно.елементи_за_анимация +
      ' елемента за анимация');
    console.log('пропуснати (и защо): ' + сборно.пропуснати_svg + ' в svg · ' +
      сборно.пропуснати_емоджи + ' само емоджи · ' + сборно.пропуснати_украса +
      ' единичен знак-украса · ' + сборно.пропуснати_невидими + ' невидими');
    console.log('видима област: ' + доклад.ВИДИМА_ОБЛАСТ);
    console.log('localStorage: ' + (промениLS.length ? '🔴 пипнати ' + промениLS.length +
      ' ключа → върнати; остатък: ' + (остатъкLS.length ? остатъкLS.length : 0)
      : 'непокътнат (' + (предиLS ? Object.keys(предиLS).length : '?') + ' ключа)'));

    if (!самОк) console.log('%c🔴 САМОПРОВЕРКАТА Е СЧУПЕНА — не вярвай на нищо отгоре', 'color:#c62828;font-weight:700');
    else console.log('%c✔ самопроверка: ' + сам.length + ' сцени, ловят счупеното и мълчат на здравото', 'color:#2e7d32');
    console.table(сам);

    if (червени.length) {
      console.log('%c🔴 ЧЕРВЕНИ: ' + червени.length, 'color:#c62828;font-weight:700');
      console.table(червени.map(function (р) {
        return { екран: р.група, тест: р.име, ОЧАКВАНО: р.ОЧАКВАНО, ПОЛУЧЕНО: р.ПОЛУЧЕНО };
      }));
    } else {
      console.log('%c✅ 0 червени от ' + редове.length + ' пуснати теста.', 'color:#2e7d32;font-weight:700');
    }
    if (жълти.length) {
      console.log('%c⚠ жълти (за поглед, не присъда): ' + жълти.length, 'color:#ef6c00');
      console.table(жълти.map(function (р) { return { екран: р.група, тест: р.име, ПОЛУЧЕНО: р.ПОЛУЧЕНО, защо: р.бележка }; }));
    }
    console.table(Object.keys(поЕкран).map(function (k) {
      return { екран: k, текст: поЕкран[k].текст, мишени: поЕкран[k].мишени,
               анимации: поЕкран[k].анимации, червени: поЕкран[k].червени,
               най_слаб_контраст: поЕкран[k].най_слаб_контраст };
    }));

    // 🔓 връщаме _ldDirect както го заварихме — тестът не бива да оставя
    // приложението в друго състояние, отколкото го е намерил.
    if (върниLd === undefined) { try { delete window._ldDirect; } catch (e) { window._ldDirect = undefined; } }
    else window._ldDirect = върниLd;

    window.BL_ТЕЛЕФОН.последен = доклад;
    return доклад;
  }
  window.BL_ТЕЛЕФОН = {
    провери: провери, последен: null, прогрес: null,
    самопроверка: самопроверка,
    // отделните проверчици — за ръчно ровене по един екран:
    //   BL_PHONE.проверчици.контраст([document.getElementById('roomOverlay')])
    проверчици: {
      разместване: провериРазместване, мишени: провериМишени,
      контраст: провериКонтраст, анимации: провериАнимации,
      фонПод: фонПод, контрастМежду: контраст
    }
  };
  window.BL_PHONE = window.BL_ТЕЛЕФОН;   // за писане без кирилица в конзолата
  console.log('📱 тестът за телефона е зареден → await BL_ТЕЛЕФОН.провери()  (или BL_PHONE.провери())');
})();
