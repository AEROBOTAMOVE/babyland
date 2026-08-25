// ═══════════════════════════════════════════════════════════════════════
// 🎬 ЦЕНАТА И КАЧЕСТВОТО НА АНИМАЦИИТЕ — второ поколение
//
// Отговаря за ВСЯКА @keyframes на четири въпроса:
//   1) СКЪПА ли е — мени ли ПОДРЕДБАТА (width/height/top/left/margin/
//      padding), тоест браузърът да пресмята подредбата на всеки кадър;
//      или БОЯДИСВА (box-shadow/background/stroke/d); или е ЕВТИНА
//      (transform/opacity — само слой на видеокартата).
//   2) БЕЗКРАЙНА ли е.
//   3) ПОД УСЛОВИЕ ли е (.play/.on/.run/:hover/[data-…]) или върви винаги.
//   4) В КОЙ ФАЙЛ и на кой ред.
//
// И гледа КАЧЕСТВОТО, не само цената:
//   К1 мигане по-често от 3 пъти в секунда  (международно правило, не мнение)
//   К2 безкрайно движение под пръста — премества натискаемо нещо
//   К3 анимация, която сама мести подредбата (CLS) — вкл. transition
//   К4 безкрайна БЕЗУСЛОВНА анимация върху нещо, скрито по подразбиране
//   К5 различна скорост за едно и също действие
//   К6 анимация над 400 мс на нещо, което мама ЧАКА
//
// ─── 🪤 КАПАНЪТ, КОЙТО В ТОЗИ ПРОЕКТ ВЕЧЕ Е ПЛАТЕН ВЕДНЪЖ ──────────────
// Изразът /@keyframes\s+(\w+)\s*\{([\s\S]*?)\n\}/ ЛЪЖЕ тук. Повечето
// keyframes са на ЕДИН РЕД:
//     @keyframes ldOrb { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
// „\n}" се намира чак няколко правила по-долу, та в „тялото" влизат
// СЪСЕДНИТЕ правила — а те естествено съдържат left/top/width. Първият
// скенер така обяви 24 скъпи анимации; истината беше НУЛА.
// ТУК СЕ БРОЯТ СКОБИ. Самопроверката пуска и наивния израз върху същия
// капан и изисква той да сбърка, а моят — да не сбърка. Мярка, която не
// може да гръмне, не мери.
//
// ─── други капани, обезвредени тук ────────────────────────────────────
// · CRLF: 6 от 14 файла са с CRLF, 8 с голи LF. Чете се и се нормализира.
// · Кирилица: има 7 анимации с кирилски имена (героятВлиза, мигане,
//   щастлив, долТочки, помахване, мурПоп, мърдане). Старият израз
//   [a-zA-Z0-9_-]+ НЕ ги хващаше и МЪЛЧЕШЕ. \b също не работи на кирилица
//   → тук имената се сравняват по ЦЕЛИ ЖЕТОНИ, не с \b.
// · Коментари: в anim.css има ред „var() в @keyframes НЕ интерполира" —
//   наивното броене го смята за анимация. Коментарите се изтриват ПРЕДИ
//   разбора (заменят се с интервали, за да не мърдат номерата на редовете).
// · Скрит раздел не пуска requestAnimationFrame → тук НЕ се мери през
//   чакане. Всичко е СТАТИЧНО по файловете.
//
// ПУСКАНЕ:  node dev/cena_animacii2.js            (доклад + самопроверка)
//           node dev/cena_animacii2.js --spisak   (+ всяка една анимация)
//           node dev/cena_animacii2.js --test     (само самопроверката)
// ПЪТ НАЗАД: файлът САМО ЧЕТЕ. Нищо не пише, нищо не променя.
// ═══════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────
// АЗБУКАТА НА ЦЕНАТА
// ─────────────────────────────────────────────────────────────────────
// 🔴 ПОДРЕДБА — браузърът мери страницата наново на всеки кадър.
const ПОДРЕДБА = new Set([
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'block-size', 'inline-size', 'min-block-size', 'max-block-size',
  'top', 'left', 'right', 'bottom', 'inset', 'inset-block', 'inset-inline',
  'inset-block-start', 'inset-block-end', 'inset-inline-start', 'inset-inline-end',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-inline', 'margin-block-start', 'margin-block-end',
  'margin-inline-start', 'margin-inline-end',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-inline', 'padding-block-start', 'padding-block-end',
  'padding-inline-start', 'padding-inline-end',
  'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width',
  'border-left-width', 'border-block-width', 'border-inline-width',
  'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing',
  'word-spacing', 'text-indent', 'white-space',
  'flex', 'flex-basis', 'flex-grow', 'flex-shrink', 'order',
  'gap', 'row-gap', 'column-gap', 'grid-gap',
  'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-column', 'grid-row', 'columns', 'column-width', 'column-count',
  'vertical-align', 'zoom', 'aspect-ratio', 'position', 'display', 'float',
  'clear', 'box-sizing', 'writing-mode', 'overflow', 'overflow-x', 'overflow-y'
]);
// 🟠 БОЯ — подредбата не мърда, но пикселите се рисуват наново всеки кадър.
const БОЯ = new Set([
  'box-shadow', 'text-shadow', 'background', 'background-color', 'background-image',
  'background-position', 'background-size', 'background-clip', 'color',
  'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
  'border-left-color', 'border-radius', 'border-top-left-radius',
  'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
  'outline', 'outline-color', 'outline-offset', 'outline-width',
  'clip-path', 'mask', 'mask-image', 'mask-position', 'mask-size',
  'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width',
  'stroke-dashoffset', 'stroke-dasharray',
  'd', 'r', 'cx', 'cy', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2',
  'text-decoration-color', 'caret-color', 'accent-color',
  'offset-distance', 'offset-path', 'offset-rotate', 'offset-anchor'
]);
// 🟡 GPU-ТЕЖКА — върви на видеокартата, но е скъпа на слаб телефон.
const ГПУ_ТЕЖКА = new Set(['filter', 'backdrop-filter', 'perspective', 'mix-blend-mode']);
// 🟢 ЕВТИНА — само слой: композиторът я върти без да пипа подредбата.
const ЕВТИНА = new Set([
  'transform', 'translate', 'rotate', 'scale', 'opacity', 'transform-origin',
  'visibility', 'will-change', 'pointer-events', 'z-index', 'animation-timing-function'
]);

// ─────────────────────────────────────────────────────────────────────
// ЧЕТЕНЕ И ПОЧИСТВАНЕ
// ─────────────────────────────────────────────────────────────────────
// Коментарите се заменят с ИНТЕРВАЛИ (нови редове се пазят), за да не се
// разместят номерата на редовете. Кавичките се уважават, за да не убие
// едно „/*" вътре в url() половин файл.
function bezKomentari(t) {
  let out = '';
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '/' && t[i + 1] === '*') {
      let e = t.indexOf('*/', i + 2);
      if (e < 0) e = t.length - 2;
      const seg = t.slice(i, e + 2);
      out += seg.replace(/[^\n]/g, ' ');
      i = e + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < t.length && t[j] !== q) {
        if (t[j] === '\\') j++;
        j++;
      }
      out += t.slice(i, Math.min(j + 1, t.length));
      i = j + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function redoveIndeks(t) {
  const nach = [0];
  for (let i = 0; i < t.length; i++) if (t[i] === '\n') nach.push(i + 1);
  return nach;
}
function redNa(nach, idx) {
  let lo = 0, hi = nach.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (nach[m] <= idx) lo = m; else hi = m - 1;
  }
  return lo + 1;
}

// ─────────────────────────────────────────────────────────────────────
// НАМИРАНЕ НА @keyframes — БРОЕНЕ НА СКОБИ, не търсене на нов ред
// ─────────────────────────────────────────────────────────────────────
// Името се хваща с широк клас, който включва кирилица. Без \b — на
// кирилица \b дава грешен отговор и МЪЛЧИ.
const ИМЕ_ЗНАК = 'A-Za-z0-9_\\-\\u0080-\\uFFFF';
const RE_KEYFRAMES = new RegExp(
  '@(?:-webkit-|-moz-|-o-|-ms-)?keyframes\\s+([' + ИМЕ_ЗНАК + ']+|"[^"]*"|\'[^\']*\')\\s*\\{', 'g'
);

function namerKeyframes(t, файл) {
  const nach = redoveIndeks(t);
  const из = [];
  RE_KEYFRAMES.lastIndex = 0;
  let m;
  while ((m = RE_KEYFRAMES.exec(t))) {
    const отвор = m.index + m[0].length - 1; // сочи към '{'
    let d = 0, край = отвор;
    for (; край < t.length; край++) {
      if (t[край] === '{') d++;
      else if (t[край] === '}') { d--; if (d === 0) break; }
    }
    if (d !== 0) { // незатворена скоба — счупен css, докладва се
      из.push({ име: m[1], файл, ред: redNa(nach, m.index), тяло: '', счупена: true,
                нач: m.index, кр: t.length });
      break;
    }
    из.push({
      име: m[1].replace(/^['"]|['"]$/g, ''),
      файл, ред: redNa(nach, m.index),
      тяло: t.slice(отвор + 1, край),
      счупена: false, нач: m.index, кр: край + 1
    });
    RE_KEYFRAMES.lastIndex = край + 1; // не влизай пак в собственото си тяло
  }
  return из;
}

// Разбор на тялото на една @keyframes: спирки (0%, 50%, from, to) + свойства
function razborTyalo(тяло) {
  const стъпки = [];
  let i = 0, буф = '';
  while (i < тяло.length) {
    const c = тяло[i];
    if (c === '{') {
      let d = 0, e = i;
      for (; e < тяло.length; e++) {
        if (тяло[e] === '{') d++;
        else if (тяло[e] === '}') { d--; if (d === 0) break; }
      }
      стъпки.push({ спирки: разборСпирки(буф), декл: razborDeklaracii(тяло.slice(i + 1, e)) });
      буф = '';
      i = e + 1;
      continue;
    }
    буф += c;
    i++;
  }
  return стъпки;
}
function разборСпирки(s) {
  return s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
    if (/^from$/i.test(x)) return 0;
    if (/^to$/i.test(x)) return 100;
    const n = parseFloat(x);
    return isNaN(n) ? null : n;
  }).filter(x => x !== null);
}
function razborDeklaracii(s) {
  const из = [];
  let дълб = 0, буф = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') дълб++;
    else if (c === ')') дълб--;
    if (c === ';' && дълб === 0) { добави(буф); буф = ''; continue; }
    буф += c;
  }
  добави(буф);
  function добави(x) {
    x = x.trim();
    if (!x) return;
    const k = x.indexOf(':');
    if (k < 0) return;
    из.push({ свойство: x.slice(0, k).trim().toLowerCase(), стойност: x.slice(k + 1).trim() });
  }
  return из;
}

// ─────────────────────────────────────────────────────────────────────
// ОБХОД НА ПРАВИЛАТА (за да знаем СЕЛЕКТОРА на всяка употреба)
// ─────────────────────────────────────────────────────────────────────
// @keyframes телата се маскират с интервали ПРЕДИ обхода, иначе „50% {"
// влиза като селектор.
function maskirai(t, диапазони) {
  const a = t.split('');
  for (const d of диапазони)
    for (let i = d.нач; i < d.кр && i < a.length; i++)
      if (a[i] !== '\n') a[i] = ' ';
  return a.join('');
}

function obhodPravila(t, cb) {
  const стек = [];
  let буф = '', началоБуф = 0, i = 0;
  const декл = [];
  while (i < t.length) {
    const c = t[i];
    if (c === '{') {
      // всичко натрупано преди „{" е селектор/at-правило
      изсипи();
      стек.push(буф.trim());
      буф = ''; началоБуф = i + 1; i++;
      continue;
    }
    if (c === '}') {
      изсипи();
      if (декл.length) { cb(стек.slice(), декл.slice()); декл.length = 0; }
      стек.pop();
      буф = ''; началоБуф = i + 1; i++;
      continue;
    }
    if (c === ';') {
      изсипи();
      буф = ''; началоБуф = i + 1; i++;
      continue;
    }
    буф += c;
    i++;
  }
  function изсипи() {
    const x = буф.trim();
    if (!x) return;
    const k = x.indexOf(':');
    if (k < 0) return;
    const св = x.slice(0, k).trim().toLowerCase();
    if (!/^[-a-z]+$/.test(св)) return;      // селектор, не декларация
    декл.push({ свойство: св, стойност: x.slice(k + 1).trim(), индекс: началоБуф });
  }
}

// ─────────────────────────────────────────────────────────────────────
// УПОТРЕБИ НА АНИМАЦИИ
// ─────────────────────────────────────────────────────────────────────
function razdeliZapetai(s) { // запетаи на НУЛЕВА дълбочина
  const из = []; let д = 0, б = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') д++; else if (c === ')') д--;
    if (c === ',' && д === 0) { из.push(б.trim()); б = ''; continue; }
    б += c;
  }
  из.push(б.trim());
  return из.filter(x => x.length);
}
function vremena(s) { // всички <time> в реда на появата им
  const из = [];
  const re = /(^|[\s,(])(-?\d*\.?\d+)(ms|s)(?![a-zA-Z])/g;
  let m;
  while ((m = re.exec(s))) из.push(m[3] === 'ms' ? parseFloat(m[2]) : parseFloat(m[2]) * 1000);
  return из;
}
function zhetoni(s) {
  return s.split(new RegExp('[^' + ИМЕ_ЗНАК + ']+')).filter(Boolean);
}
const КЛЮЧОВИ = new Set([
  'infinite', 'alternate', 'alternate-reverse', 'reverse', 'normal', 'both',
  'forwards', 'backwards', 'none', 'paused', 'running', 'linear', 'ease',
  'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end', 'initial',
  'inherit', 'unset', 'revert', 'important'
]);

function upotrebiVFayl(t, файл, nach) {
  const из = [];
  obhodPravila(t, (стек, декл) => {
    const селектор = стек[стек.length - 1] || '';
    if (селектор.startsWith('@')) return;           // @font-face и подобни
    const контекст = стек.slice(0, -1).join(' ');
    const съкр = декл.filter(d => d.свойство === 'animation');
    const имена = декл.filter(d => d.свойство === 'animation-name');
    const трайн = декл.filter(d => d.свойство === 'animation-duration');
    const повт = декл.filter(d => d.свойство === 'animation-iteration-count');
    const посока = декл.filter(d => d.свойство === 'animation-direction');
    const крива = декл.filter(d => d.свойство === 'animation-timing-function');

    if (съкр.length) {
      for (const d of съкр) {
        for (const парче of razdeliZapetai(d.стойност)) {
          const тк = zhetoni(парче);
          const име = тк.find(x => !КЛЮЧОВИ.has(x.toLowerCase()) && !/^-?\d/.test(x) &&
                                   !/^(cubic|steps|linear|var|calc)$/i.test(x));
          if (!име) continue;
          const вр = vremena(парче);
          из.push({
            име, файл, селектор, контекст, декл,
            ред: redNa(nach, d.индекс),
            трайност: вр.length ? вр[0] : null,
            забавяне: вр.length > 1 ? вр[1] : 0,
            безкрайна: /(^|[\s(,])infinite([\s),]|$)/i.test(парче),
            повторения: (парче.match(/(^|[\s,])(\d+(?:\.\d+)?)(?=[\s,]|$)(?![a-z%])/i) || [])[2] || null,
            посока: (парче.match(/\b(alternate-reverse|alternate|reverse)\b/i) || [])[1] || 'normal',
            крива: (парче.match(/steps\([^)]*\)/i) || [])[0] || null,
            редуцирано: /prefers-reduced-motion/.test(контекст),
            изключена: /(^|[\s,])none([\s,]|$)/i.test(парче)
          });
        }
      }
    }
    if (имена.length) {
      for (const d of имена) {
        const списък = razdeliZapetai(d.стойност);
        списък.forEach((n, idx) => {
          if (!n || /^none$/i.test(n)) return;
          const взем = (arr, по) => {
            if (!arr.length) return null;
            const л = razdeliZapetai(arr[arr.length - 1].стойност);
            return л.length ? л[idx % л.length] : null;
          };
          const тр = взем(трайн);
          const пв = взем(повт);
          из.push({
            име: n, файл, селектор, контекст, декл,
            ред: redNa(nach, d.индекс),
            трайност: тр ? (vremena(тр)[0] ?? null) : null,
            забавяне: 0,
            безкрайна: пв ? /infinite/i.test(пв) : false,
            повторения: пв && !/infinite/i.test(пв) ? пв.trim() : null,
            посока: взем(посока) || 'normal',
            крива: (взем(крива) || '').match(/steps\([^)]*\)/i) ? взем(крива) : null,
            редуцирано: /prefers-reduced-motion/.test(контекст),
            изключена: false
          });
        });
      }
    }
  });
  return из;
}

// ─────────────────────────────────────────────────────────────────────
// СКРИТИ ПО ПОДРАЗБИРАНЕ (за проверка К4)
// ─────────────────────────────────────────────────────────────────────
// 🪤 Първата ми версия обяви .ld-drop и .ld-fire за „скрити по
// подразбиране", защото намери display:none за тях. Но този display:none
// стои вътре в @media (prefers-reduced-motion: reduce) — той е ПАЗАЧ, не
// състояние по подразбиране. (И между другото: върху display:none
// анимация изобщо не тиктака, така че тревогата беше двойно празна.)
function skritiPoPodrazbirane(t, набор) {
  obhodPravila(t, (стек, декл) => {
    const контекст = стек.slice(0, -1).join(' ');
    if (/prefers-reduced-motion|@media\s+print/i.test(контекст)) return;
    const сел = стек[стек.length - 1] || '';
    if (!сел || сел.startsWith('@')) return;
    const крие = декл.some(d =>
      (d.свойство === 'display' && /^none/i.test(d.стойност)) ||
      (d.свойство === 'visibility' && /^hidden/i.test(d.стойност)) ||
      (d.свойство === 'content-visibility' && /^hidden/i.test(d.стойност)));
    if (!крие) return;
    for (const част of сел.split(',')) {
      const п = част.trim();
      // само ПРОСТ селектор без състояние: .нещо  или  #нещо
      if (/^[.#][-\w-￿]+$/.test(п)) набор.add(п);
    }
  });
  return набор;
}

// ─────────────────────────────────────────────────────────────────────
// ПОД УСЛОВИЕ ЛИ Е
// ─────────────────────────────────────────────────────────────────────
const СЪСТОЯНИЕ_ПСЕВДО = /:(hover|active|focus|focus-visible|focus-within|checked|target|open|disabled|placeholder-shown|user-invalid|not|has|where|is)\b/i;
const СЪСТОЯНИЕ_КЛАС = /\.(play|playing|on|off|run|running|open|opened|active|is-[-\w]+|has-[-\w]+|show|shown|visible|vis|live|busy|loading|load|sel|selected|current|done|ok|err|error|warn|alert|anim|animate|animated|in|out|enter|leave|pulse|shake|flash|glow|ready|armed|hold|drag|dragging|press|pressed|tap|tapped|new|hot|urg|urgent|sos|kraen|krai|start|started|stop|edit|editing|mark|pin|pinned|expand|expanded|collapse|collapsed|toggl[-\w]*|snap|hit|win|fail|save|saved|copy|copied|nov|otvoren|aktiven|izbran|gotov|greshka)(?![-\w])/i;
const СЪСТОЯНИЕ_АТРИБУТ = /\[(data-|aria-|open|checked|hidden|disabled)/i;

function podUslovie(селектор, контекст) {
  const цял = (контекст + ' ' + селектор);
  if (СЪСТОЯНИЕ_ПСЕВДО.test(цял)) return true;
  if (СЪСТОЯНИЕ_АТРИБУТ.test(цял)) return true;
  if (СЪСТОЯНИЕ_КЛАС.test(цял)) return true;
  if (/\bbody\.[-\w]+|\bhtml\.[-\w]+/.test(цял)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// ЦЕНАТА НА ЕДНА @keyframes
// ─────────────────────────────────────────────────────────────────────
function cenaNaKeyframes(к) {
  const стъпки = razborTyalo(к.тяло);
  const свойства = [];
  for (const с of стъпки) for (const d of с.декл) свойства.push(d.свойство);
  const уник = [...new Set(свойства)];
  const подр = уник.filter(p => ПОДРЕДБА.has(p));
  const боя = уник.filter(p => БОЯ.has(p));
  const гпу = уник.filter(p => ГПУ_ТЕЖКА.has(p));
  const евт = уник.filter(p => ЕВТИНА.has(p));
  const непозн = уник.filter(p => !ПОДРЕДБА.has(p) && !БОЯ.has(p) && !ГПУ_ТЕЖКА.has(p) &&
                                  !ЕВТИНА.has(p) && !p.startsWith('--'));
  const свои = уник.filter(p => p.startsWith('--'));
  let тежест = 'ЕВТИНА', знак = '🟢';
  if (подр.length) { тежест = 'ПОДРЕДБА'; знак = '🔴'; }
  else if (боя.length) { тежест = 'БОЯ'; знак = '🟠'; }
  else if (гпу.length) { тежест = 'GPU'; знак = '🟡'; }
  return { стъпки, уник, подр, боя, гпу, евт, непозн, свои, тежест, знак };
}

// ─────────────────────────────────────────────────────────────────────
// К1 — МИГАНЕ. Колко пъти в секунда светва.
// ─────────────────────────────────────────────────────────────────────
// Не се брои всяка промяна на прозрачността, а само истинско СВЕТВАНЕ:
// преход от под 0.35 към над 0.75 (или обратно за угасване). Едно мигане
// = едно светване. При alternate обиколката е двойна.
function migania(стъпки) {
  const точки = [];
  for (const с of стъпки) {
    const о = с.декл.filter(d => d.свойство === 'opacity').pop();
    const в = с.декл.filter(d => d.свойство === 'visibility').pop();
    let стойност = null;
    if (о) { const n = parseFloat(о.стойност); if (!isNaN(n)) стойност = n; }
    else if (в) стойност = /hidden/i.test(в.стойност) ? 0 : 1;
    if (стойност === null) continue;
    for (const п of с.спирки) точки.push({ п, v: стойност });
  }
  точки.sort((a, b) => a.п - b.п);
  if (точки.length < 2) return { светвания: 0, точки: точки.length };
  let светвания = 0;
  for (let i = 1; i < точки.length; i++)
    if (точки[i - 1].v < 0.35 && точки[i].v > 0.75) светвания++;
  // затваряне на кръга (100% → 0% при повторение)
  if (точки[точки.length - 1].v < 0.35 && точки[0].v > 0.75) светвания++;
  return { светвания, точки: точки.length };
}

// ─────────────────────────────────────────────────────────────────────
// НАТИСКАЕМО ЛИ Е (К2)
// ─────────────────────────────────────────────────────────────────────
// 🪤 Първата ми версия беше /\.(btn|sos|…)(?![-\w])/ — тя иска класът да
// ЗАПОЧВА с думата и да свършва там. Затова НЕ хващаше „.sos-btn",
// „.bn-sos", „.btn-del" — тоест точно както се кръщават класовете тук.
// Сега думата се търси като ЦЯЛА ЧАСТ на името, разделена с „-" или „_".
const ЕЛЕМЕНТ_НАТИСКАЕМ = /(^|[\s>+~,(])(button|a|input|label|select|textarea|summary)(?![-\w])/i;
const РОЛЯ_НАТИСКАЕМА = /\[role\s*=\s*["']?(button|link|tab|switch|menuitem|checkbox|option)/i;
const ТАГ_НАТИСКАЕМ = /^(button|a|input|label|select|textarea|summary)$/i;

// 🪤 ВТОРАТА МИ ВЕРСИЯ ПАК ГАДАЕШЕ — по думата в името на класа. На
// живите файлове излъга два пъти:
//   · .btn-shine — <span> ВЪТРЕ в бутона, с pointer-events:none. Блясъкът
//     минава през бутона; самият бутон изобщо не мърда.
//   · .n6-chip   — <g> в SVG рисунка. Не се натиска.
// Затова тук вече НЕ се гадае по име, а се ЧЕТЕ РАЗМЕТКАТА: кои класове
// наистина стоят върху <button>/<a>/<input>/[role=button].
function natiskaemiKlasove(разметка) {
  const набор = new Set();
  for (const ф of разметка || []) {
    const t = ф.текст;
    const re = /<([a-zA-Z][-\w]*)\b([^>]*)>/g;
    let m;
    while ((m = re.exec(t))) {
      const таг = m[1], атр = m[2];
      const роля = ((атр.match(/role\s*=\s*["']([^"']+)["']/) || [])[1] || '').trim();
      const натиск = ТАГ_НАТИСКАЕМ.test(таг) ||
                     /^(button|link|tab|switch|menuitem|checkbox|option)$/i.test(роля) ||
                     /\bonclick\s*=/.test(атр);
      if (!натиск) continue;
      const кл = (атр.match(/class\s*=\s*["']([^"']*)["']/) || [])[1] || '';
      for (const к of кл.split(/[\s${}`+]+/)) if (к && /^[-\w-￿]+$/.test(к)) набор.add(к);
    }
    // фабриката на този проект: el('button', 'ro-fab')
    const re2 = /\bel\s*\(\s*["'](?:button|a|input|label|summary)["']\s*,\s*["']([^"']+)["']/g;
    while ((m = re2.exec(t)))
      for (const к of m[1].split(/\s+/)) if (к && /^[-\w-￿]+$/.test(к)) набор.add(к);
  }
  return набор;
}
// последният компаунд = елементът, който НАИСТИНА се движи
function posleden(сел) {
  const без = сел.replace(/\([^)]*\)/g, '');
  const части = без.trim().split(/[\s>+~]+/).filter(Boolean);
  return части.length ? части[части.length - 1] : без;
}
function natiskaemo(сел, декл, tapКласове) {
  if (декл && декл.some(d => d.свойство === 'pointer-events' && /^none/i.test(d.стойност)))
    return false;                       // блясък/було — не се натиска
  сел = posleden(сел);
  if (ЕЛЕМЕНТ_НАТИСКАЕМ.test(сел)) return true;
  if (РОЛЯ_НАТИСКАЕМА.test(сел)) return true;
  if (!tapКласове || !tapКласове.size) return false;
  const кл = (сел.match(/\.[-\w-￿]+/g) || []).map(x => x.slice(1));
  return кл.some(к => tapКласове.has(к));
}

function mestiLiSe(цена) {
  // Има ли ДВИЖЕНИЕ (не само мигане/растеж на място)
  for (const с of цена.стъпки)
    for (const d of с.декл) {
      if (d.свойство === 'translate') return true;
      if (d.свойство === 'transform' && /translate|matrix|perspective|skew/i.test(d.стойност)) return true;
      if (ПОДРЕДБА.has(d.свойство)) return true;
      if (d.свойство === 'offset-distance') return true;
    }
  return false;
}
// 🪤 ПЪРВАТА МИ МЯРКА ЗА „КОЛКО СЕ МЕСТИ" БЕШЕ ГРЕШНА И ГО ПОКАЗА НА ЖИВО.
// Тя вземаше НАЙ-ГОЛЯМОТО ЧИСЛО в transform. Затова за
//     0%,100% { transform: translate(-50%, 0)    scale(var(--sc,1)) }
//     50%     { transform: translate(-50%, -9px) scale(var(--sc,1)) }
// каза „150px", защото видя -50%. А -50% е ЦЕНТРИРАНЕ — то е ЕДНАКВО във
// всеки кадър и не мърда нищо. Истинското движение е 9px по Y.
// Мери се РАЗМАХЪТ (най-голямо минус най-малко) ПО ОСИ, не абсолютна стойност.
function вПиксели(ч, ед) {
  const v = parseFloat(ч);
  if (isNaN(v)) return 0;
  if (ед === 'px' || !ед) return v;
  if (ед === 'em' || ед === 'rem') return v * 16;
  if (ед === '%') return v * 0.6;   // ~60px типичен елемент; груба, но еднаква за всички кадри
  if (ед === 'vh' || ед === 'vw') return v * 4;
  return v;
}
function razborTranslate(стойност) {
  let tx = 0, ty = 0;
  const re = /\b(translate3d|translateX|translateY|translate)\s*\(([^)]*)\)/gi;
  let m;
  while ((m = re.exec(стойност))) {
    const вид = m[1].toLowerCase();
    const арг = m[2].split(',').map(s => s.trim());
    const чис = s => { const q = (s || '').match(/(-?\d*\.?\d+)\s*([a-z%]*)/i); return q ? вПиксели(q[1], q[2]) : 0; };
    if (вид === 'translatex') tx += чис(арг[0]);
    else if (вид === 'translatey') ty += чис(арг[0]);
    else { tx += чис(арг[0]); ty += чис(арг[1]); }
  }
  return { tx, ty };
}
// Връща: размах по X/Y в px  +  най-бързата отсечка в px за 300 мс
// (300 мс ≈ колкото пътува пръстът към бутона).
function dvizhenie(цена, трайност) {
  const точки = [];
  for (const с of цена.стъпки) {
    const t = [...с.декл].reverse().find(d => d.свойство === 'transform' || d.свойство === 'translate');
    const od = [...с.декл].reverse().find(d => d.свойство === 'offset-distance');
    let tx = 0, ty = 0;
    if (t) ({ tx, ty } = razborTranslate(t.стойност));
    if (od) { const n = parseFloat(od.стойност); if (!isNaN(n)) tx += n * 1.5; } // път по крива
    for (const п of с.спирки) точки.push({ п, tx, ty });
  }
  if (!точки.length) return { размах: 0, за300: 0 };
  точки.sort((a, b) => a.п - b.п);
  const xs = точки.map(p => p.tx), ys = точки.map(p => p.ty);
  const размах = Math.hypot(Math.max(...xs) - Math.min(...xs),
                            Math.max(...ys) - Math.min(...ys));
  let за300 = 0;
  if (трайност) {
    for (let i = 1; i < точки.length; i++) {
      const дп = точки[i].п - точки[i - 1].п;
      if (дп <= 0) continue;
      const мс = дп / 100 * трайност;
      const път = Math.hypot(точки[i].tx - точки[i - 1].tx, точки[i].ty - точки[i - 1].ty);
      const с300 = път * Math.min(1, 300 / мс);
      if (с300 > за300) за300 = с300;
    }
  }
  return { размах, за300 };
}

// ─────────────────────────────────────────────────────────────────────
// ВРЕМЕ, ДОКАТО НЕЩОТО СТАНЕ ВИДИМО  (за К5б и К6)
// ─────────────────────────────────────────────────────────────────────
// 🪤 ПРЕДИШНАТА МИ МЯРКА БЕШЕ „ЦЯЛАТА ТРАЙНОСТ" И ЛЪЖЕШЕ НА ЖИВО.
// Тя обяви `мурПоп 2.6s` за най-бавното влизане в проекта — ×8.1 над
// стандарта. Но тялото ѝ е:
//     0%      { opacity: 0 }
//     10%,82% { opacity: 1 }     ← балончето Е ВИДИМО още на 260 мс
//     100%    { opacity: 0 }     ← това е ИЗЛИЗАНЕТО, не влизането
// Тоест 2.6 сек не са чакане — те са поява + СТОЕНЕ ЗА ЧЕТЕНЕ + гасене
// в една @keyframes. Мама чака 260 мс, не 2.6 сек. Същото важи за всяка
// „изскочи-постой-изчезни" анимация.
// Затова тук се мери ПЪРВАТА спирка, на която прозрачността стига своя
// максимум — това е мигът, в който нещото е налице.
// Ако прозрачност изобщо не се анимира (напр. rmxHeroDepthIn мени само
// собствени --променливи), НЕ СЕ ГАДАЕ: връща се цялата трайност и се
// вдига флаг „неизмерено", за да се вижда, че числото е ГОРНА ГРАНИЦА.
function vremeDoVidimo(стъпки) {
  const т = [];
  for (const с of стъпки) {
    const o = с.декл.filter(d => d.свойство === 'opacity').pop();
    if (!o) continue;
    const n = parseFloat(o.стойност);
    if (isNaN(n)) continue;
    for (const п of с.спирки) т.push({ п, v: n });
  }
  if (!т.length) return { процент: 100, измерено: false };
  т.sort((a, b) => a.п - b.п);
  const макс = Math.max(...т.map(x => x.v));
  const първа = т.find(x => x.v >= макс - 1e-9);
  return { процент: първа.п, измерено: true };
}

// ─────────────────────────────────────────────────────────────────────
// К1б — МИГАНЕ ПО ЦВЯТ, не само по прозрачност
// ─────────────────────────────────────────────────────────────────────
// 🪤 К1 гледаше САМО opacity/visibility. Анимация, която сменя фона от
// бяло на червено и обратно, минаваше НЕВИДИМА през нея — а точно това
// е класическото мигане. Мярка, която не може да гръмне за цвят, не мери
// цвят. Тук се смята относителна яркост (WCAG) и се брои преминаване
// през праг от 10 процентни пункта разлика в яркостта.
const ЦВЕТНИ_СВОЙСТВА = new Set([
  'background', 'background-color', 'background-image', 'color',
  'border-color', 'box-shadow', 'text-shadow', 'outline-color', 'fill', 'stroke'
]);
const ИМЕНА_ЦВЕТОВЕ = { white: [255,255,255], black: [0,0,0], red: [255,0,0],
  green: [0,128,0], blue: [0,0,255], yellow: [255,255,0], transparent: null,
  orange: [255,165,0], pink: [255,192,203], gray: [128,128,128], grey: [128,128,128] };
function parsniCvyat(s) {
  if (!s) return null;
  s = s.trim();
  let m = s.match(/#([0-9a-f]{3,8})\b/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  m = s.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  for (const [име, ц] of Object.entries(ИМЕНА_ЦВЕТОВЕ))
    if (new RegExp('(^|[^-\\w])' + име + '([^-\\w]|$)', 'i').test(s)) return ц;
  return null;
}
function yarkost(rgb) {  // WCAG relative luminance
  if (!rgb) return null;
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function svetkaviciPoCvyat(стъпки) {
  const т = [];
  for (const с of стъпки) {
    let я = null;
    for (const d of с.декл) {
      if (!ЦВЕТНИ_СВОЙСТВА.has(d.свойство)) continue;
      const ц = yarkost(parsniCvyat(d.стойност));
      if (ц !== null) { я = ц; break; }
    }
    if (я === null) continue;
    for (const п of с.спирки) т.push({ п, я });
  }
  if (т.length < 2) return { светкавици: 0, размах: 0 };
  т.sort((a, b) => a.п - b.п);
  const я = т.map(x => x.я);
  const размах = Math.max(...я) - Math.min(...я);
  if (размах < 0.10) return { светкавици: 0, размах };  // под прага на WCAG
  const низ = (Math.max(...я) + Math.min(...я)) / 2;
  let бр = 0;
  for (let i = 1; i < т.length; i++) if (т[i-1].я < низ && т[i].я >= низ) бр++;
  if (т[т.length-1].я < низ && т[0].я >= низ) бр++;
  return { светкавици: бр, размах };
}

// ─────────────────────────────────────────────────────────────────────
// СЕМЕЙСТВО НА ДЕЙСТВИЕТО (К5)
// ─────────────────────────────────────────────────────────────────────
const СЕМЕЙСТВА = [
  ['ВЛИЗА', /(in|enter|reveal|show|appear|rise|влиза|появ)$/i],
  ['ИЗЛИЗА', /(out|leave|exit|hide|fade|излиза)$/i],
  ['ИЗСКАЧА', /(pop|bloom|burst|bounce|поп)$/i],
  ['ПУЛСИРА', /(pulse|breath|beat|throb|glow|shine|sheen|дишa|пулс)$/i],
  ['ТРЕСЕ', /(shake|wobble|jitter|buzz|тръс|мърдане)$/i],
  ['ВЪРТИ', /(spin|rotate|turn|въртене)$/i],
  ['РИСУВА', /(draw|trace|stroke|рисув)$/i],
  ['ПЛУВА', /(float|drift|sway|bob|плув)$/i],
  ['МИГА', /(blink|flash|мигане)$/i]
];
function semeystvo(име) {
  for (const [ime, re] of СЕМЕЙСТВА) if (re.test(име)) return ime;
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// К3 — КОЙ ПРЕХОД НАИСТИНА МЕСТИ СТРАНИЦАТА, И КОЙ Е ЗАТВОРЕН В КУТИЯ
// ─────────────────────────────────────────────────────────────────────
// „9 прехода по подредба" е брой, не присъда. Три от тях изобщо не могат
// да мръднат страницата:
//  · елемент с position:absolute/fixed е ИЗВЪН потока — колкото и да
//    расте, нищо около него не се измества;
//  · същото важи, ако някой РОДИТЕЛ в селектора е абсолютен: тогава
//    цялото разместване е заключено в неговата кутия;
//  · <text> вътре в <svg> има собствена координатна система — смяната на
//    font-size пренарежда рисунката, не HTML страницата.
// Затова тук се събират ДВА набора от фактите, не от предположение:
// абсолютните класове (от самия css) и класовете, видени вътре в <svg>
// (от разметката).
function absolutniKlasove(t, набор) {
  obhodPravila(t, (стек, декл) => {
    const сел = стек[стек.length - 1] || '';
    if (!сел || сел.startsWith('@')) return;
    if (!декл.some(d => d.свойство === 'position' && /^(absolute|fixed)/i.test(d.стойност))) return;
    for (const част of сел.split(',')) {
      const п = част.trim();
      if (/^[.#][-\w-￿]+$/.test(п)) набор.add(п);
    }
  });
  return набор;
}
// Класове, срещнати ВЪТРЕ в <svg>…</svg> в разметката. Броячът казва и
// колко svg блока изобщо са видени — иначе „0 намерени" не се различава
// от „0 прегледани".
function svgKlasove(разметка) {
  const набор = new Set();
  let блокове = 0;
  for (const ф of разметка || []) {
    const t = ф.текст;
    const re = /<(\/?)([a-zA-Z][-\w]*)\b([^>]*?)(\/?)>/g;
    let m, дълб = 0;
    while ((m = re.exec(t))) {
      const затв = m[1] === '/', таг = m[2].toLowerCase(), атр = m[3], сам = m[4] === '/';
      if (таг === 'svg') {
        if (затв) дълб = Math.max(0, дълб - 1);
        else { if (дълб === 0) блокове++; if (!сам) дълб++; }
        continue;
      }
      if (!дълб || затв) continue;
      const кл = (атр.match(/class\s*=\s*["']([^"']*)["']/) || [])[1] || '';
      for (const к of кл.split(/[\s${}`+]+/)) if (к && /^[-\w-￿]+$/.test(к)) набор.add(к);
    }
  }
  return { набор, блокове };
}
// Класове, ВЪТРЕ в които в разметката стои натискаемо нещо. За К7:
// „кутията се свива" е безобидно, докато в кутията няма бутон.
function klasoveSNatiskaemoVatre(разметка, tapКласове) {
  const набор = new Set();
  let прегледани = 0;
  for (const ф of разметка || []) {
    const t = ф.текст;
    const re = /<(\/?)([a-zA-Z][-\w]*)\b([^>]*?)(\/?)>/g;
    let m; const стек = [];
    while ((m = re.exec(t))) {
      const затв = m[1] === '/', таг = m[2].toLowerCase(), атр = m[3], сам = m[4] === '/';
      const празен = /^(br|hr|img|input|meta|link|source|path|circle|rect|line|use|stop|polygon|polyline|ellipse|area|col|embed|track|wbr)$/.test(таг);
      if (затв) { стек.pop(); continue; }
      const кл = (атр.match(/class\s*=\s*["']([^"']*)["']/) || [])[1] || '';
      const класове = кл.split(/[\s${}`+]+/).filter(к => к && /^[-\w-￿]+$/.test(к));
      const роля = ((атр.match(/role\s*=\s*["']([^"']+)["']/) || [])[1] || '').trim();
      const натиск = ТАГ_НАТИСКАЕМ.test(таг) ||
                     /^(button|link|tab|switch|menuitem|checkbox|option)$/i.test(роля) ||
                     класове.some(к => tapКласове && tapКласове.has(к));
      if (натиск) { прегледани++; for (const слой of стек) for (const к of слой) набор.add(к); }
      if (!сам && !празен) стек.push(класове);
    }
  }
  return { набор, натискаеми: прегледани };
}
function svitoLi(селектор, абсолютни, svgНабор) {
  const без = селектор.replace(/::?[-\w]+(\([^)]*\))?/g, '');
  const части = без.trim().split(/[\s>+~]+/).filter(Boolean);
  for (const ч of части) {
    for (const к of (ч.match(/[.#][-\w-￿]+/g) || [])) {
      if (абсолютни.has(к)) return 'ИЗВЪН ПОТОКА';
      if (к[0] === '.' && svgНабор.has(к.slice(1))) return 'В SVG';
    }
  }
  return null;
}
// Колко px са две стойности на едно и също свойство (за К7)
function pxRazlika(a, b) {
  const ч = s => {
    const q = String(s).trim().match(/(-?\d*\.?\d+)\s*(px|rem|em|%)?/);
    if (!q) return null;
    const v = parseFloat(q[1]);
    if (!q[2] || q[2] === 'px') return v;
    if (q[2] === 'rem' || q[2] === 'em') return v * 16;
    return null;                     // % без контекст — не се гадае
  };
  const x = ч(a), y = ч(b);
  if (x === null || y === null) return null;
  return Math.abs(x - y);
}
const САМОНАТИСК = /:(hover|active|focus|focus-visible|focus-within)\b/i;

// ─────────────────────────────────────────────────────────────────────
// СЪЩИЯТ ЛИ ЕЛЕМЕНТ Е? (за К7)
// ─────────────────────────────────────────────────────────────────────
// 🪤 ПЪРВАТА МИ ВЕРСИЯ ПИТАШЕ `r.селектор.includes('.' + клас)` И ДАДЕ
// 12 ЧЕРВЕНИ, ОТ КОИТО 11 БЯХА ЛЪЖА. Трите начина, по които се излъга:
//   1. ПОДНИЗ: „.ro-fab" се съдържа в „.ro-fab-hint" — два различни
//      елемента, обявени за един. (Точно капанът, който тази стая вече
//      е плащала: голият клас краде по начало на думата.)
//   2. ПСЕВДО-ЕЛЕМЕНТ: „.pin-btn" срещу „.pin-btn::after" — ::after е
//      ДРУГА кутия. Бутонът не мърда, мърда украсата му.
//   3. ПОТОМЪК: „.bn-item" срещу „.bn-item.bn-active span" — последният
//      компаунд е <span> ВЪТРЕ в бутона, не самият бутон.
// Затова тук се сравняват КОМПАУНДИ по цели жетони, а не низове.
function razborKompaund(сел) {
  const посл = posleden(сел);
  const псевдоЕл = ((посл.match(/::[-\w]+/) ||
                     посл.match(/:(before|after|first-line|first-letter|placeholder|backdrop|marker)\b/i) ||
                     [''])[0] || '').replace(/^:{1,2}/, '').toLowerCase();
  const без = посл.replace(/::?[-\w]+(\([^)]*\))?/g, '');
  return {
    псевдоЕл,
    класове: new Set((без.match(/\.[-\w-￿]+/g) || []).map(x => x.slice(1))),
    ид: (без.match(/#[-\w-￿]+/g) || []).map(x => x.slice(1)),
    таг: ((без.match(/^[a-zA-Z][-\w]*/) || [''])[0] || '').toLowerCase()
  };
}
function sashtiyatElement(цел, сменящ) {
  if (цел.псевдоЕл !== сменящ.псевдоЕл) return false;
  if (цел.таг && сменящ.таг && цел.таг !== сменящ.таг) return false;
  for (const к of цел.класове) if (!сменящ.класове.has(к)) return false;
  for (const i of цел.ид) if (!сменящ.ид.includes(i)) return false;
  return цел.класове.size > 0 || цел.ид.length > 0;
}
// „Невидим по подразбиране" — за да не се брои ВЛИЗАНЕ за бягаща цел.
// Модалната кутия се плъзга нагоре, докато булото се отваря: мама още
// не гледа натам, камо ли да посяга. Различно е от бутон, който се мести
// ПОД пръста ѝ.
function nevidimiPoPodrazbirane(t, набор) {
  obhodPravila(t, (стек, декл) => {
    const контекст = стек.slice(0, -1).join(' ');
    if (/prefers-reduced-motion|@media\s+print/i.test(контекст)) return;
    const сел = стек[стек.length - 1] || '';
    if (!сел || сел.startsWith('@')) return;
    const крие = декл.some(d =>
      (d.свойство === 'opacity' && parseFloat(d.стойност) === 0) ||
      (d.свойство === 'display' && /^none/i.test(d.стойност)) ||
      (d.свойство === 'visibility' && /^hidden/i.test(d.стойност)));
    if (!крие) return;
    for (const част of сел.split(',')) {
      const п = част.trim();
      if (/^[.#][-\w-￿]+$/.test(п)) набор.add(п.slice(1));
    }
  });
  return набор;
}

// ─────────────────────────────────────────────────────────────────────
// ГЛАВНИЯТ АНАЛИЗ — работи върху СПИСЪК ОТ ФАЙЛОВЕ В ПАМЕТТА,
// затова самопроверката може да го нахрани с измислени файлове.
// ─────────────────────────────────────────────────────────────────────
function analiz(файлове /* [{име, текст}] */, разметка /* [{име, текст}] — html/js */) {
  const tapКласове = natiskaemiKlasove(разметка);
  const преглед = { файлове: 0, байтове: 0, редове: 0, keyframes: 0, употреби: 0,
                    правила: 0, коментарни_примамки: 0,
                    разметка: (разметка || []).length, натискаеми_класове: tapКласове.size };
  const keyframes = [];
  const употреби = [];
  const скрити = new Set();
  const преходи = [];
  const преходиДвижение = [];
  const абсолютни = new Set();
  const невидими = new Set();
  const всичкиПравила = [];
  const { набор: svgНабор, блокове: svgБлокове } = svgKlasove(разметка);
  const { набор: съдържаНатискаемо, натискаеми: намеренНатискаеми } =
    klasoveSNatiskaemoVatre(разметка, tapКласове);
  преглед.svg_блокове = svgБлокове;
  преглед.svg_класове = svgНабор.size;
  преглед.кутии_с_бутон = съдържаНатискаемо.size;
  преглед.натискаеми_в_разметка = намеренНатискаеми;

  for (const ф of файлове) {
    const суров = ф.текст.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    преглед.файлове++;
    преглед.байтове += Buffer.byteLength(суров, 'utf8');
    преглед.редове += суров.split('\n').length;
    // колко пъти „@keyframes" се среща В КОМЕНТАР — примамки
    const сурови = (суров.match(/@(?:-webkit-|-moz-|-o-|-ms-)?keyframes/g) || []).length;

    const t = bezKomentari(суров);
    const nach = redoveIndeks(t);
    const кф = namerKeyframes(t, ф.име);
    преглед.коментарни_примамки += сурови - (t.match(/@(?:-webkit-|-moz-|-o-|-ms-)?keyframes/g) || []).length;
    for (const к of кф) { к.цена = cenaNaKeyframes(к); keyframes.push(к); }
    преглед.keyframes += кф.length;

    const без = maskirai(t, кф);
    const у = upotrebiVFayl(без, ф.име, nach);
    for (const x of у) употреби.push(x);
    преглед.употреби += у.length;

    skritiPoPodrazbirane(без, скрити);
    absolutniKlasove(без, абсолютни);
    nevidimiPoPodrazbirane(без, невидими);

    obhodPravila(без, (стек, декл) => {
      преглед.правила++;
      const сел = стек[стек.length - 1] || '';
      const ред = redNa(nach, декл[0].индекс);
      всичкиПравила.push({ файл: ф.име, ред, селектор: сел,
                           контекст: стек.slice(0, -1).join(' '), декл });
      for (const d of декл) {
        if (d.свойство !== 'transition' && d.свойство !== 'transition-property') continue;
        for (const парче of razdeliZapetai(d.стойност)) {
          const п = парче.trim().split(/\s+/)[0].toLowerCase();
          const запис = { файл: ф.име, ред: redNa(nach, d.индекс), селектор: сел, свойство: п };
          if (ПОДРЕДБА.has(п) || п === 'all') преходи.push(запис);
          // за К7 движението е по-широко от подредбата: transform:translate
          // мести целта също толкова истински, колкото и padding.
          else if (п === 'transform' || п === 'translate') преходиДвижение.push(запис);
        }
      }
    });
  }

  // свързване употреба → keyframes
  const поИме = new Map();
  for (const к of keyframes) {
    if (!поИме.has(к.име)) поИме.set(к.име, []);
    поИме.get(к.име).push(к);
  }
  for (const у of употреби) {
    у.известна = поИме.has(у.име);
    у.условна = podUslovie(у.селектор, у.контекст);
    у.скритРодител = [...скрити].some(с => (у.контекст + ' ' + у.селектор).includes(с));
  }
  for (const к of keyframes) {
    к.употреби = употреби.filter(у => у.име === к.име && !у.изключена && !у.редуцирано);
    к.безкрайна = к.употреби.some(у => у.безкрайна);
    к.условни = к.употреби.filter(у => у.условна).length;
    к.безусловни = к.употреби.filter(у => !у.условна).length;
    к.мин_трайност = к.употреби.map(у => у.трайност).filter(x => x != null)
                       .reduce((a, b) => Math.min(a, b), Infinity);
    if (!isFinite(к.мин_трайност)) к.мин_трайност = null;
    к.макс_трайност = к.употреби.map(у => у.трайност).filter(x => x != null)
                       .reduce((a, b) => Math.max(a, b), -Infinity);
    if (!isFinite(к.макс_трайност)) к.макс_трайност = null;
  }

  // ── находки ──────────────────────────────────────────────────────
  const н = { podredba: [], boya: [], gpu: [], migane: [], migane_cvyat: [], premestva: [],
              skrito: [], razlichna_skorost: [], bavni: [], nepolzvani: [],
              lipsvashti: [], schupeni: [], prehodi: преходи, nepoznati: [],
              mesti_buton: [] };

  // К3 — всеки преход по подредба получава ПРИСЪДА, не само ред в списък
  for (const п of преходи) п.свито = svitoLi(п.селектор, абсолютни, svgНабор);
  // transform НЕ се свива от „извън потока": абсолютен бутон, който се
  // плъзга, си бяга от пръста точно толкова, колкото и всеки друг.
  for (const п of преходиДвижение) п.свито = null;

  // ── К7 · ПРЕХОД, КОЙТО МЕСТИ НАТИСКАЕМО НЕЩО ─────────────────────
  // К2 гледа само БЕЗКРАЙНИ @keyframes. Но нищо не мести бутон така
  // сигурно, както преход по подредба върху кутията, в която бутонът
  // седи. Тази дупка беше отворена: мярка, която не може да гръмне за
  // преход, не мери преходи.
  // 🟢 ако смяната идва от :hover/:active/:focus върху СЪЩИЯ елемент —
  //    пръстът вече е там, целта не бяга.
  // 🔴 ако идва отвън (клас от скрол, от таймер, от чуждо докосване) —
  //    целта се мести, докато мама посяга.
  преглед.преходи_движение = преходиДвижение.length;
  // 🔢 БРОЯЧИ НА ОТСЕЯНОТО. „Една находка" не значи нищо, ако не се вижда
  // колко кандидата са минали и къде са отпаднали. В тази стая вече е
  // плащано: „0 находки" се оказа „0 ПРЕГЛЕДАНИ".
  const сито = { кандидати: 0, свити: 0, ненатискаеми: 0, псевдо: 0, невидими: 0,
                 двойки: 0, друг_елемент: 0, скриващи: 0, само_мащаб: 0 };
  for (const п of преходи.concat(преходиДвижение)) {
    сито.кандидати++;
    if (п.свито) { сито.свити++; continue; }
    const целК = razborKompaund(п.селектор);
    const класове = [...целК.класове];
    const самНатискаем = natiskaemo(п.селектор, null, tapКласове);
    const съдържаБутон = класове.some(к => съдържаНатискаемо.has(к));
    if (!самНатискаем && !съдържаБутон) { сито.ненатискаеми++; continue; }
    if (целК.псевдоЕл) { сито.псевдо++; continue; }     // ::before/::after не се натиска
    if (класове.some(к => невидими.has(к))) { сито.невидими++; continue; } // влизане, не бягство
    // 🪤 БАЗОВАТА СТОЙНОСТ НЕ ЖИВЕЕ В СЪЩИЯ ФАЙЛ. `.ro-head` носи
    // transition в css/rooms.css:820, а `padding: 14px 16px` е чак в
    // css/style.css:1146. Първата ми версия търсеше само в СЪЩИЯ файл и
    // отпечата „undefined → 7px 16px" — тоест намери дефекта, но не можа
    // да каже КОЛКО. Търси се във всички файлове, по реда на четене.
    let базова = null, базовФайл = null;
    for (const r of всичкиПравила) {
      if (r.селектор !== п.селектор) continue;
      const d = r.декл.filter(x => x.свойство === п.свойство).pop();
      if (d) { базова = d.стойност; базовФайл = r.файл + ':' + r.ред; }
    }
    for (const r of всичкиПравила) {
      if (r.селектор === п.селектор) continue;
      if (!sashtiyatElement(целК, razborKompaund(r.селектор))) { сито.друг_елемент++; continue; }
      const d = r.декл.filter(x => x.свойство === п.свойство).pop();
      if (!d) continue;
      сито.двойки++;
      // самото правило крие елемента → това е ВЛИЗАНЕ/ИЗЛИЗАНЕ, не бягство
      if (r.декл.some(x => (x.свойство === 'opacity' && parseFloat(x.стойност) === 0) ||
                           (x.свойство === 'display' && /^none/i.test(x.стойност)) ||
                           (x.свойство === 'visibility' && /^hidden/i.test(x.стойност)))) {
        сито.скриващи++; continue;
      }
      // предшественик, невидим по подразбиране → пак влизане
      const предци = r.селектор.replace(/\([^)]*\)/g, '').trim().split(/[\s>+~]+/).slice(0, -1).join(' ');
      if ((предци.match(/\.[-\w-￿]+/g) || []).some(x => невидими.has(x.slice(1)))) {
        сито.скриващи++; continue;
      }
      let px;
      if (п.свойство === 'transform' || п.свойство === 'translate') {
        const a = razborTranslate(базова || 'none'), b = razborTranslate(d.стойност);
        px = Math.hypot(b.tx - a.tx, b.ty - a.ty);
        if (px < 0.5) { сито.само_мащаб++; continue; }  // scale/rotate — центърът не бяга
      } else {
        px = базова ? pxRazlika(базова, d.стойност) : null;
      }
      н.mesti_buton.push({
        преход: п, правило: r, свойство: п.свойство,
        от: базова, базовФайл, до: d.стойност, px,
        подПръста: САМОНАТИСК.test(r.селектор),
        самНатискаем, съдържаБутон
      });
    }
  }
  н.sito = сито;

  for (const к of keyframes) {
    if (к.счупена) { н.schupeni.push(к); continue; }
    if (к.цена.подр.length) н.podredba.push(к);
    else if (к.цена.боя.length) н.boya.push(к);
    else if (к.цена.гпу.length) н.gpu.push(к);
    if (к.цена.непозн.length) н.nepoznati.push(к);
    if (!к.употреби.length) н.nepolzvani.push(к);

    // К1 мигане
    // 🪤 ПЪРВАТА МИ ВЕРСИЯ БЕШЕ ФАБРИКА ЗА ФАЛШИВА ТРЕВОГА. Тя смяташе
    // честота = светвания × 1000 / трайност и обяви 8 „опасни" анимации.
    // Всичките осем се оказаха ЕДНОКРАТНИ появявания (replyFade .3s,
    // profIn .22s, cardIn, jrIn) — едно избледняване 0→1, което става
    // ВЕДНЪЖ и спира. Едно светване не е мигане.
    // Правилото (WCAG 2.3.1) казва: ТРИ И ПОВЕЧЕ СВЕТВАНИЯ В ЕДНА СЕКУНДА.
    // Затова се иска и ПОВТОРЯЕМОСТ: или безкрайна, или поне 2 обиколки,
    // или самата анимация да свети 3+ пъти в рамките на една обиколка.
    const м = migania(к.цена.стъпки);
    if (м.светвания > 0) {
      for (const у of к.употреби) {
        if (!у.трайност) continue;
        const повт = у.безкрайна ? Infinity : parseFloat(у.повторения || '1') || 1;
        const повтаря_се = у.безкрайна || повт >= 2 || м.светвания >= 3;
        if (!повтаря_се) continue;
        const обиколка = /alternate/i.test(у.посока) ? у.трайност * 2 : у.трайност;
        const честота = м.светвания * 1000 / обиколка;
        if (честота > 3) н.migane.push({ к, у, честота, светвания: м.светвания, повт });
      }
    }
    // К2 премества натискаемо.
    // Мери се не размахът, а КОЛКО СЕ ИЗМЕСТВА, ДОКАТО ПРЪСТЪТ ПЪТУВА
    // (~300 мс). Талисман, който се люлее 16px за 9 секунди, се измества
    // 1.8px, докато мама посяга — това не е подвеждане. Същите 16px за
    // 0.4 сек са 12px и вече отместват целта.
    if (к.безкрайна && mestiLiSe(к.цена)) {
      for (const у of к.употреби) {
        if (!у.безкрайна) continue;
        if (!natiskaemo(у.селектор, у.декл, tapКласове)) continue;
        const д = dvizhenie(к.цена, у.трайност);
        if (д.размах < 3) continue;
        н.premestva.push({ к, у, размах: д.размах, за300: д.за300,
                           червено: д.за300 >= 8 });
      }
    }
    // К4 безкрайна безусловна върху скрито
    for (const у of к.употреби)
      if (у.безкрайна && !у.условна && у.скритРодител) н.skrito.push({ к, у });

    // К1б мигане по ЦВЯТ (не само по прозрачност)
    const цв = svetkaviciPoCvyat(к.цена.стъпки);
    if (цв.светкавици > 0) {
      for (const у of к.употреби) {
        if (!у.трайност) continue;
        const повт = у.безкрайна ? Infinity : parseFloat(у.повторения || '1') || 1;
        if (!(у.безкрайна || повт >= 2 || цв.светкавици >= 3)) continue;
        const обиколка = /alternate/i.test(у.посока) ? у.трайност * 2 : у.трайност;
        const честота = цв.светкавици * 1000 / обиколка;
        if (честота > 3) н.migane_cvyat.push({ к, у, честота, светкавици: цв.светкавици,
                                               размах: цв.размах });
      }
    }

    // К6 бавни
    // 🪤 СТАРИЯТ ФИЛТЪР БЕШЕ ПОДНИЗ `/(in|enter|…)/` И КРАДЕШЕ ЧУЖДИ ИМЕНА:
    // „logoW-in-k" и „secL-in-eDraw" влизаха заради буквите „in" НАСРЕД
    // думата. Едно намигане и едно рисуване на линия не са „нещо, което
    // мама чака". Сега се пита СЕМЕЙСТВОТО (то е закотвено на края на
    // името) — същият капан, който вече е плащан в тази стая.
    const семК = semeystvo(к.име);
    if (семК === 'ВЛИЗА' || семК === 'ИЗСКАЧА') {
      const вд = vremeDoVidimo(к.цена.стъпки);
      for (const у of к.употреби) {
        if (у.безкрайна || !у.трайност) continue;
        const мс = у.трайност * вд.процент / 100;
        if (мс > 400) н.bavni.push({ к, у, мс, процент: вд.процент, измерено: вд.измерено });
      }
    }
  }

  for (const у of употреби)
    if (!у.известна && !у.изключена && !/^(none|inherit|initial|unset)$/i.test(у.име))
      н.lipsvashti.push(у);

  // К5б — СОБСТВЕНИЯТ СТАНДАРТ НА ПРОЕКТА.
  // В css/anim.css е записано черно на бяло:
  //   --bl-t-press 120ms · --bl-t-soft 200ms · --bl-t-enter 320ms
  // „ползвай ги навсякъде". Тук се мери кой ги нарушава — това не е мое
  // мнение за вкус, а сравнение със записаното от собственика.
  н.tokeni = {};
  for (const ф of файлове) {
    const re = /--bl-t-([-\w]+)\s*:\s*(\d*\.?\d+)(ms|s)/g;
    let m;
    while ((m = re.exec(ф.текст)))
      н.tokeni['--bl-t-' + m[1]] = m[3] === 's' ? parseFloat(m[2]) * 1000 : parseFloat(m[2]);
  }
  const стандарт = н.tokeni['--bl-t-enter'] || null;
  н.nad_standarta = [];
  if (стандарт) {
    for (const к of keyframes) {
      const с = semeystvo(к.име);
      if (с !== 'ВЛИЗА' && с !== 'ИЗСКАЧА') continue;
      // мери се ВРЕМЕТО ДО ВИДИМО, не цялата трайност — иначе всяко
      // „изскочи-постой-изчезни" се брои за бавно влизане (виж мурПоп).
      const вд = vremeDoVidimo(к.цена.стъпки);
      for (const у of к.употреби) {
        if (у.безкрайна || !у.трайност) continue;
        const мс = у.трайност * вд.процент / 100;
        if (мс > стандарт * 1.5)
          н.nad_standarta.push({ к, у, мс, пъти: мс / стандарт,
                                 процент: вд.процент, измерено: вд.измерено });
      }
    }
  }

  // К5 различна скорост за едно действие
  const семейни = new Map();
  for (const к of keyframes) {
    const с = semeystvo(к.име);
    if (!с) continue;
    if (!семейни.has(с)) семейни.set(с, []);
    for (const у of к.употреби)
      if (у.трайност && !у.безкрайна) семейни.get(с).push({ име: к.име, t: у.трайност, у });
  }
  for (const [сем, списък] of семейни) {
    const т = [...new Set(списък.map(x => x.t))].sort((a, b) => a - b);
    if (т.length >= 2 && т[т.length - 1] / т[0] >= 3)
      н.razlichna_skorost.push({ семейство: сем, времена: т, брой: списък.length,
                                 примери: списък });
  }

  return { преглед, keyframes, употреби, скрити: [...скрити], находки: н };
}

// ─────────────────────────────────────────────────────────────────────
// САМОПРОВЕРКА В ДВЕТЕ ПОСОКИ
// ─────────────────────────────────────────────────────────────────────
// Мярка, която не може да гръмне, не мери. Затова:
//  · ГРЪМВА  — измислени файлове с ИСТИНСКИ дефект; уредът ТРЯБВА да го види.
//  · МЪЛЧИ   — измислени файлове БЕЗ дефект (вкл. точния капан от миналия
//              път); уредът ТРЯБВА да си замълчи.
//  · БРОЯЧ   — колко е прегледал трябва да съвпадне ТОЧНО.
//  · НАИВНИЯТ — старият израз се пуска върху капана и трябва ДА СБЪРКА,
//              иначе капанът не е капан и тестът нищо не доказва.
const КАПАН = [
  '@keyframes ldOrb { 0%,100% { opacity: .6 } 50% { opacity: 1 } }',
  '.ld-card { position: absolute; left: 12px; top: 4px; width: 60%; margin: 4px 0; padding: 8px }',
  '@keyframes ldBob { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-6px) rotate(2deg) } }',
  '.ld-bob { height: 40px; min-height: 12px; margin-left: 2px }',
  '@keyframes ldBadge { from { transform: scale(.6) } to { transform: scale(1) } }',
  '.ld-badge { padding: 2px 6px; border-width: 1px }',
  '@keyframes героятВлиза { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }',
  '.geroy { top: 0; left: 0 }',
  // ↓ многоредова — точно тя дава на наивния израз неговото „\n}" няколко
  //   правила по-надолу и той погълва .ld-card/.ld-bob/.geroy по пътя.
  '@keyframes ldAttn {',
  '  0%   { transform: scale(1);    opacity: .8 }',
  '  100% { transform: scale(1.06); opacity: 1 }',
  '}'
].join('\n');

function samoproverka() {
  const резултати = [];
  const T = (име, посока, ok, детайл) => резултати.push({ име, посока, ok, детайл });

  // ── ПОСОКА 1: ТРЯБВА ДА МЪЛЧИ ────────────────────────────────────
  {
    const r = analiz([{ име: 'капан.css', текст: КАПАН }]);
    T('капанът: 5 анимации намерени', 'МЪЛЧИ', r.преглед.keyframes === 5,
      'намерени ' + r.преглед.keyframes + ' (чакани 5)');
    T('капанът: НУЛА скъпи (съседното правило не влиза в тялото)', 'МЪЛЧИ',
      r.находки.podredba.length === 0,
      r.находки.podredba.length ? 'излъга за: ' + r.находки.podredba.map(x => x.име).join(', ') : 'нула');
    T('капанът: кирилското име е намерено', 'МЪЛЧИ',
      r.keyframes.some(k => k.име === 'героятВлиза'),
      r.keyframes.map(k => k.име).join(', '));
    // НАИВНИЯТ израз ТРЯБВА да сбърка — иначе капанът е безобиден и
    // цялата проверка е украса.
    const наивни = [];
    const re = /@keyframes\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
    let m;
    while ((m = re.exec(КАПАН)))
      if (/(^|[\s;{])(left|top|width|margin|padding)\s*:/.test(m[2])) наивни.push(m[1]);
    T('капанът наистина е капан (наивният израз греши)', 'ГРЪМВА',
      наивни.length > 0, 'наивният обяви за скъпи: ' + (наивни.join(', ') || 'нищо — капанът е мъртъв!'));
  }
  {
    const css = [
      '/* @keyframes измама { 0% { left: 0 } 100% { width: 9px } } */',
      '.a { color: red }',
      '@keyframes истинска { to { opacity: 1 } }'
    ].join('\n');
    const r = analiz([{ име: 'коментар.css', текст: css }]);
    T('коментарът не се брои за анимация', 'МЪЛЧИ',
      r.преглед.keyframes === 1 && r.keyframes[0].име === 'истинска',
      'намерени: ' + r.keyframes.map(k => k.име).join(',') + ' | примамки: ' + r.преглед.коментарни_примамки);
  }
  {
    const css = '@keyframes bavno { 0%{opacity:0} 50%{opacity:1} 100%{opacity:0} }\n' +
                '.x { animation: bavno .8s infinite }';
    const r = analiz([{ име: 'бавно.css', текст: css }]);
    T('мигане 1.25/сек не се обявява за опасно', 'МЪЛЧИ',
      r.находки.migane.length === 0,
      r.находки.migane.map(x => x.честота.toFixed(1)).join(',') || 'нула');
  }
  {
    // Правило вътре в prefers-reduced-motion се ВИЖДА (за да е честен
    // броячът), но НЕ се брои за жива употреба.
    const css = '@keyframes ok { to { transform: translateX(10px) } }\n' +
                '.tabx { animation: ok 3s infinite }\n' +
                '@media (prefers-reduced-motion: reduce) { .tabx { animation: ok 99s infinite } }';
    const r = analiz([{ име: 'редуц.css', текст: css }]);
    T('reduced-motion правилото се вижда, но не се брои', 'МЪЛЧИ',
      r.преглед.употреби === 2 && r.keyframes[0].употреби.length === 1 &&
      r.keyframes[0].макс_трайност === 3000,
      'видени ' + r.преглед.употреби + ', живи ' + r.keyframes[0].употреби.length +
      ', макс ' + r.keyframes[0].макс_трайност);
  }
  {
    const css = '@keyframes растеж { from { transform: scale(.8) } to { transform: scale(1) } }\n' +
                '.chip { animation: растеж .3s }';
    const r = analiz([{ име: 'бърз.css', текст: css }]);
    T('къса анимация (300 мс) не се обявява за бавна', 'МЪЛЧИ',
      r.находки.bavni.length === 0, String(r.находки.bavni.length));
  }
  {
    // ЕДНОКРАТНО избледняване 0→1 за 200 мс е 5 „светвания в секунда" по
    // наивната сметка — но става ВЕДНЪЖ. Не е мигане. Точно това
    // изхвърли 8 фалшиви тревоги от живия доклад.
    const css = '@keyframes поява { from { opacity: 0 } to { opacity: 1 } }\n' +
                '.card { animation: поява .2s ease }';
    const r = analiz([{ име: 'еднократно.css', текст: css }]);
    T('еднократна поява 0→1 за 200 мс НЕ е мигане', 'МЪЛЧИ',
      r.находки.migane.length === 0,
      r.находки.migane.map(x => x.честота.toFixed(1)).join(',') || 'нула');
  }
  {
    // блясък ВЪТРЕ в бутона: pointer-events:none → бутонът не мърда
    const css = '@keyframes блясък { 0%{transform:translateX(0)} 100%{transform:translateX(600%)} }\n' +
                '.btn-shine { pointer-events: none; animation: блясък 4s infinite }';
    const html = '<button class="btn"><span class="btn-shine"></span>Готово</button>';
    const r = analiz([{ име: 'блясък.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('блясък с pointer-events:none не е движещ се бутон', 'МЪЛЧИ',
      r.находки.premestva.length === 0,
      r.находки.premestva.map(x => x.у.селектор).join(',') || 'нула');
  }
  {
    // 🪤 центриращото -50% НЕ е движение — то е еднакво във всеки кадър.
    // Първата ми мярка го четеше като 150px и обяви къщичките за опасни.
    const css = '@keyframes къщаЛюлее {\n' +
                '  0%,100% { transform: translate(-50%, 0) scale(var(--sc,1)); }\n' +
                '  50%     { transform: translate(-50%, -9px) scale(var(--sc,1)); }\n}\n' +
                'button.ld-house { animation: къщаЛюлее 5.2s ease-in-out infinite }';
    const r = analiz([{ име: 'къща.css', текст: css }]);
    const х = r.находки.premestva[0];
    T('центриращото -50% не се брои за движение', 'МЪЛЧИ',
      х && Math.round(х.размах) === 9 && !х.червено,
      х ? 'размах ' + х.размах.toFixed(0) + 'px, за 300мс ' + х.за300.toFixed(1) + 'px' : 'изобщо не я видя');
  }
  {
    // бавно люлеене на талисман: 16px, но за 9 секунди
    const css = '@keyframes лети { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-16px)} }\n' +
                'button.mascot { animation: лети 9s ease-in-out infinite }';
    const r = analiz([{ име: 'талисман.css', текст: css }]);
    T('16px за 9 сек не подвежда пръста', 'МЪЛЧИ',
      r.находки.premestva.length === 1 && !r.находки.premestva[0].червено,
      r.находки.premestva.length ? 'за 300мс ' + r.находки.premestva[0].за300.toFixed(1) + 'px' : 'нищо');
  }
  {
    // клас, който звучи натискаемо, но в разметката е <g> в SVG
    const css = '@keyframes шав { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }\n' +
                '.n6-chip { animation: шав 9s infinite }';
    const html = '<svg><g class="n6-chip"></g></svg><button class="istinski">да</button>';
    const r = analiz([{ име: 'рисунка.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('SVG група с „chip" в името не е натискаема', 'МЪЛЧИ',
      r.находки.premestva.length === 0,
      r.находки.premestva.map(x => x.у.селектор).join(',') || 'нула');
  }

  // ── ПОСОКА 2: ТРЯБВА ДА ГРЪМНЕ ───────────────────────────────────
  {
    const css = '@keyframes lo { 0% { left: 0 } 100% { left: 40px } }\n.x{animation:lo 1s infinite}';
    const r = analiz([{ име: 'скъпа1.css', текст: css }]);
    T('едноредова анимация с left → ПОДРЕДБА', 'ГРЪМВА',
      r.находки.podredba.length === 1 && r.находки.podredba[0].име === 'lo',
      r.находки.podredba.map(x => x.име + ':' + x.цена.подр.join('/')).join(' ') || 'НЕ Я ВИДЯ');
  }
  {
    const css = '@keyframes hi {\n  from { height: 0; margin-top: 0 }\n  to { height: 200px; margin-top: 8px }\n}\n.y{animation:hi 1s}';
    const r = analiz([{ име: 'скъпа2.css', текст: css }]);
    T('многоредова анимация с height/margin → ПОДРЕДБА', 'ГРЪМВА',
      r.находки.podredba.length === 1 && r.находки.podredba[0].цена.подр.length === 2,
      (r.находки.podredba[0] ? r.находки.podredba[0].цена.подр.join('/') : 'НЕ Я ВИДЯ'));
  }
  {
    // скъпата е СЛЕД едноредова — ако тялото на първата „изяде" втората,
    // втората изчезва и уредът мълчи. Тук трябва да ги види И ДВЕТЕ.
    const css = '@keyframes a1 { 0%,100% { opacity: .5 } 50% { opacity: 1 } }\n' +
                '@keyframes a2 { 0% { padding-left: 0 } 100% { padding-left: 20px } }\n' +
                '.z{animation:a2 1s infinite}';
    const r = analiz([{ име: 'ред.css', текст: css }]);
    T('скъпа СЛЕД едноредова — вижда се', 'ГРЪМВА',
      r.преглед.keyframes === 2 && r.находки.podredba.length === 1 &&
      r.находки.podredba[0].име === 'a2',
      'намерени ' + r.преглед.keyframes + ', скъпи ' + r.находки.podredba.map(x => x.име).join(','));
  }
  {
    const css = '@keyframes мигач { 0%{opacity:0} 25%{opacity:1} 50%{opacity:0} 75%{opacity:1} 100%{opacity:0} }\n' +
                '.alarm { animation: мигач .4s infinite }';
    const r = analiz([{ име: 'мигач.css', текст: css }]);
    T('мигане 5/сек → опасно', 'ГРЪМВА',
      r.находки.migane.length === 1 && r.находки.migane[0].честота > 3,
      r.находки.migane.length ? r.находки.migane[0].честота.toFixed(1) + '/сек' : 'НЕ ГО ВИДЯ');
  }
  {
    const css = '@keyframes сянка { 0%,100%{box-shadow:0 0 0 red} 50%{box-shadow:0 0 20px red} }\n' +
                '.b{animation:сянка 2s infinite}';
    const r = analiz([{ име: 'боя.css', текст: css }]);
    T('box-shadow → БОЯ', 'ГРЪМВА',
      r.находки.boya.length === 1, r.находки.boya.map(x => x.име).join(',') || 'НЕ Я ВИДЯ');
  }
  {
    const css = '@keyframes шава { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }\n' +
                'button.sos-btn { animation: шава 1s infinite }';
    const r = analiz([{ име: 'бутон.css', текст: css }]);
    T('безкрайно движение под натискаем бутон (по таг)', 'ГРЪМВА',
      r.находки.premestva.length === 1 && r.находки.premestva[0].червено,
      r.находки.premestva.length ? r.находки.premestva[0].за300.toFixed(1) + 'px за 300мс' : 'НЕ ГО ВИДЯ');
  }
  {
    // същото, но класът се познава САМО от разметката (js фабрика)
    const css = '@keyframes шава2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(24px)} }\n' +
                '.ro-fab { animation: шава2 1s infinite }';
    const js = "fab = el('button', 'ro-fab'); fab.id = 'roFab';";
    const без = analiz([{ име: 'фаб.css', текст: css }]);
    const с = analiz([{ име: 'фаб.css', текст: css }], [{ име: 'h.js', текст: js }]);
    T('клас от js-фабрика el("button","ro-fab") се разпознава', 'ГРЪМВА',
      без.находки.premestva.length === 0 && с.находки.premestva.length === 1 &&
      с.находки.premestva[0].червено,
      'без разметка ' + без.находки.premestva.length + ' → с разметка ' + с.находки.premestva.length);
  }
  {
    const css = '@keyframes бърз { 0%{opacity:0} 20%{opacity:1} 40%{opacity:0} 60%{opacity:1} 80%{opacity:0} 100%{opacity:1} }\n' +
                '.ala { animation: бърз .5s ease }';
    const r = analiz([{ име: 'три.css', текст: css }]);
    T('ЕДНОКРАТНА, но 3 светвания за 500 мс → пак опасно', 'ГРЪМВА',
      r.находки.migane.length === 1 && r.находки.migane[0].светвания === 3,
      r.находки.migane.length ? r.находки.migane[0].честота.toFixed(1) + '/сек' : 'НЕ ГО ВИДЯ');
  }
  {
    const css = '.panel { display: none }\n' +
                '@keyframes върти { to { transform: rotate(360deg) } }\n' +
                '.panel .spinner { animation: върти 1s linear infinite }';
    const r = analiz([{ име: 'скрито.css', текст: css }]);
    T('безкрайна безусловна върху скрит родител', 'ГРЪМВА',
      r.находки.skrito.length === 1,
      r.находки.skrito.length ? r.находки.skrito[0].у.селектор : 'НЕ ГО ВИДЯ');
  }
  {
    // display:none, но само вътре в пазача за reduced-motion → НЕ е скрито
    const css = '@keyframes върти2 { to { transform: rotate(360deg) } }\n' +
                '.kap { animation: върти2 1s linear infinite }\n' +
                '@media (prefers-reduced-motion: reduce) { .kap { display: none } }';
    const r = analiz([{ име: 'пазач.css', текст: css }]);
    T('display:none от reduced-motion пазача не значи скрито', 'МЪЛЧИ',
      r.находки.skrito.length === 0 && r.скрити.length === 0,
      'скрити селектори: ' + r.скрити.join(',') + ' | находки ' + r.находки.skrito.length);
  }
  {
    const css = '@keyframes cardIn { from{opacity:0} to{opacity:1} }\n' +
                '.c{animation:cardIn 900ms}';
    const r = analiz([{ име: 'бавна.css', текст: css }]);
    T('900 мс вход → бавно', 'ГРЪМВА',
      r.находки.bavni.length === 1, r.находки.bavni.length ? '900' : 'НЕ ГО ВИДЯ');
  }
  {
    const css = ':root { --bl-t-enter: 320ms }\n' +
                '@keyframes kIn { from{opacity:0} to{opacity:1} }\n' +
                '.a{animation:kIn 700ms}\n.b{animation:kIn 300ms}';
    const r = analiz([{ име: 'стандарт.css', текст: css }]);
    T('токенът се чете и 700мс се мери спрямо 320мс', 'ГРЪМВА',
      r.находки.tokeni['--bl-t-enter'] === 320 && r.находки.nad_standarta.length === 1 &&
      Math.abs(r.находки.nad_standarta[0].пъти - 2.1875) < 0.01,
      'токен ' + r.находки.tokeni['--bl-t-enter'] + ', нарушения ' + r.находки.nad_standarta.length);
  }
  {
    const css = '@keyframes kIn2 { from{opacity:0} to{opacity:1} }\n.a{animation:kIn2 700ms}';
    const r = analiz([{ име: 'безтокен.css', текст: css }]);
    T('без токен не се измислят нарушения', 'МЪЛЧИ',
      r.находки.nad_standarta.length === 0 && !r.находки.tokeni['--bl-t-enter'],
      String(r.находки.nad_standarta.length));
  }
  {
    const css = '@keyframes липсва { to { opacity: 1 } }\n.q{animation: nyama_takava 1s}';
    const r = analiz([{ име: 'липса.css', текст: css }]);
    T('употреба без @keyframes → липсваща', 'ГРЪМВА',
      r.находки.lipsvashti.length === 1 && r.находки.lipsvashti[0].име === 'nyama_takava',
      r.находки.lipsvashti.map(x => x.име).join(',') || 'НЕ ГО ВИДЯ');
  }
  {
    const css = '@keyframes нищо { to { opacity: 1 } }';
    const r = analiz([{ име: 'сирак.css', текст: css }]);
    T('@keyframes без нито една употреба → неползвана', 'ГРЪМВА',
      r.находки.nepolzvani.length === 1, r.находки.nepolzvani.map(x => x.име).join(','));
  }
  {
    const css = '.a{transition: height .3s}\n.b{transition: transform .3s}';
    const r = analiz([{ име: 'преход.css', текст: css }]);
    T('transition по height → пренареждане', 'ГРЪМВА',
      r.находки.prehodi.length === 1 && r.находки.prehodi[0].свойство === 'height',
      r.находки.prehodi.map(x => x.свойство).join(',') || 'НЕ ГО ВИДЯ');
  }

  // ── ВРЕМЕ ДО ВИДИМО (К5б/К6) ─────────────────────────────────────
  {
    // точният случай, който старата мярка сбърка: поява 10% · стоене до
    // 82% · гасене. Мама чака 260 мс, не 2.6 сек.
    const css = ':root { --bl-t-enter: 320ms }\n' +
                '@keyframes мурПоп { 0% { opacity: 0; transform: scale(.4) }\n' +
                ' 10%,82% { opacity: 1; transform: scale(1) }\n' +
                ' 100% { opacity: 0; transform: scale(.8) } }\n' +
                '.мур { animation: мурПоп 2.6s both }';
    const r = analiz([{ име: 'поп.css', текст: css }]);
    T('изскочи-постой-изчезни: чака се 260мс, не 2.6с', 'МЪЛЧИ',
      r.находки.bavni.length === 0 && r.находки.nad_standarta.length === 0,
      'бавни ' + r.находки.bavni.length + ', над стандарта ' + r.находки.nad_standarta.length);
  }
  {
    const css = ':root { --bl-t-enter: 320ms }\n' +
                '@keyframes skRise { from { opacity: 0; transform: translateY(60px) } to { opacity: 1; transform: none } }\n' +
                '.sk { animation: skRise 3s ease-out forwards }';
    const r = analiz([{ име: 'изгрев.css', текст: css }]);
    T('истинско 3-секундно влизане пак гърми', 'ГРЪМВА',
      r.находки.bavni.length === 1 && Math.round(r.находки.bavni[0].мс) === 3000,
      r.находки.bavni.length ? Math.round(r.находки.bavni[0].мс) + 'мс' : 'НЕ ГО ВИДЯ');
  }
  {
    // „logoWink" и „secLineDraw" съдържат буквите „in" насред думата.
    // Старият подниз ги обявяваше за бавно влизане.
    const css = '@keyframes logoWink { 0%,100% { transform: none } 30% { transform: rotate(-7deg) } }\n' +
                '@keyframes secLineDraw { from { stroke-dashoffset: 100 } to { stroke-dashoffset: 0 } }\n' +
                '.lg { animation: logoWink 700ms ease }\n.ln { animation: secLineDraw 520ms ease }';
    const r = analiz([{ име: 'подниз.css', текст: css }]);
    T('„in" насред думата не прави влизане (logoWink/secLineDraw)', 'МЪЛЧИ',
      r.находки.bavni.length === 0, r.находки.bavni.map(x => x.к.име).join(',') || 'нула');
  }
  {
    // без opacity изобщо → числото е ГОРНА ГРАНИЦА и това си личи
    const css = '@keyframes depthIn { 0% { --o: 0 } 70% { --o: 1 } 100% { --o: 1 } }\n' +
                '.dp { animation: depthIn 700ms ease }';
    const r = analiz([{ име: 'горна.css', текст: css }]);
    T('без opacity се признава „неизмерено", не се гадае', 'ГРЪМВА',
      r.находки.bavni.length === 1 && r.находки.bavni[0].измерено === false &&
      r.находки.bavni[0].мс === 700,
      r.находки.bavni.length ? 'измерено=' + r.находки.bavni[0].измерено : 'НЕ ГО ВИДЯ');
  }

  // ── МИГАНЕ ПО ЦВЯТ (К1б) ─────────────────────────────────────────
  {
    // 🪤 ТОЗИ ТЕСТ МЕ ХВАНА МЕН, НЕ КОДА. Първо го написах с .4s и го
    // нарекох „опасно" — но една обиколка на 0.4 сек е 2.5 светкавици в
    // секунда, тоест ПОД международния праг от 3. Уредът мълчеше правилно,
    // а лъжеше очакването ми. Затова тук стоят И ДВЕТЕ трайности.
    const бавно = '@keyframes алармаБавно { 0%,100% { background: #ffffff } 50% { background: #000000 } }\n' +
                  '.al { animation: алармаБавно .4s infinite }';
    const бързо = '@keyframes алармаЦвят { 0%,100% { background: #ffffff } 50% { background: #000000 } }\n' +
                  '.al { animation: алармаЦвят .2s infinite }';
    const rb = analiz([{ име: 'цвятбавно.css', текст: бавно }]);
    const rf = analiz([{ име: 'цвят.css', текст: бързо }]);
    T('бяло↔черно 5 пъти в секунда → опасно по цвят', 'ГРЪМВА',
      rf.находки.migane_cvyat.length === 1 && rf.находки.migane_cvyat[0].честота === 5,
      rf.находки.migane_cvyat.length ? rf.находки.migane_cvyat[0].честота.toFixed(1) + '/сек' : 'НЕ ГО ВИДЯ');
    T('същото бяло↔черно, но 2.5/сек — под прага, мълчи', 'МЪЛЧИ',
      rb.находки.migane_cvyat.length === 0, String(rb.находки.migane_cvyat.length));
  }
  {
    // два пастела с почти еднаква яркост — това НЕ е светкавица
    const css = '@keyframes нежно { 0%,100% { background: #fde8d8 } 50% { background: #fdf0e4 } }\n' +
                '.ne { animation: нежно .3s infinite }';
    const r = analiz([{ име: 'пастел.css', текст: css }]);
    T('два близки пастела не са светкавица (под 10% яркост)', 'МЪЛЧИ',
      r.находки.migane_cvyat.length === 0,
      r.находки.migane_cvyat.length ? r.находки.migane_cvyat[0].размах.toFixed(3) : 'нула');
  }
  {
    const css = '@keyframes бавноЦвят { 0%,100% { background: #ffffff } 50% { background: #000000 } }\n' +
                '.bc { animation: бавноЦвят 2s infinite }';
    const r = analiz([{ име: 'бавноцв.css', текст: css }]);
    T('бяло↔черно веднъж на 2 сек не е опасно', 'МЪЛЧИ',
      r.находки.migane_cvyat.length === 0, String(r.находки.migane_cvyat.length));
  }

  // ── К3 ПРИСЪДА: СВИТО ИЛИ МЕСТИ СТРАНИЦАТА ───────────────────────
  {
    const css = '.box { position: absolute; left: 0 }\n' +
                '.box i { transition: width .25s ease }\n' +
                '.row { transition: height .3s ease }';
    const r = analiz([{ име: 'свито.css', текст: css }]);
    const swito = r.находки.prehodi.filter(x => x.свито);
    T('преход под абсолютен родител е СВИТ', 'ГРЪМВА',
      swito.length === 1 && swito[0].селектор === '.box i' && swito[0].свито === 'ИЗВЪН ПОТОКА',
      swito.map(x => x.селектор + '=' + x.свито).join(',') || 'НЕ ГО ВИДЯ');
    T('преход в нормалния поток НЕ се обявява за свит', 'МЪЛЧИ',
      r.находки.prehodi.some(x => x.селектор === '.row' && !x.свито),
      r.находки.prehodi.map(x => x.селектор + '=' + (x.свито || 'страница')).join(' '));
  }
  {
    const css = '.net-e { transition: font-size .3s ease }';
    const html = '<svg viewBox="0 0 10 10"><text class="net-e">x</text></svg>';
    const без = analiz([{ име: 'svg.css', текст: css }]);
    const с = analiz([{ име: 'svg.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('клас вътре в <svg> се разпознава от разметката', 'ГРЪМВА',
      !без.находки.prehodi[0].свито && с.находки.prehodi[0].свито === 'В SVG',
      'без разметка: ' + (без.находки.prehodi[0].свито || 'страница') +
      ' → с разметка: ' + с.находки.prehodi[0].свито);
  }

  // ── К7 ПРЕХОД, КОЙТО МЕСТИ НАТИСКАЕМО ────────────────────────────
  {
    const css = '.ro-head { padding: 14px 16px; transition: padding .35s ease }\n' +
                '.ro-head.shrunk { padding: 7px 16px }';
    const html = '<header class="ro-head"><button class="ro-sosbtn">🆘</button></header>';
    const без = analiz([{ име: 'глава.css', текст: css }]);
    const с = analiz([{ име: 'глава.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('кутия с бутон вътре, свита от ЧУЖД клас → гърми', 'ГРЪМВА',
      с.находки.mesti_buton.length === 1 && с.находки.mesti_buton[0].px === 7 &&
      с.находки.mesti_buton[0].подПръста === false,
      с.находки.mesti_buton.length ? с.находки.mesti_buton[0].px + 'px, подПръста=' +
        с.находки.mesti_buton[0].подПръста : 'НЕ ГО ВИДЯ');
    T('без разметка не се гадае, че вътре има бутон', 'МЪЛЧИ',
      без.находки.mesti_buton.length === 0, String(без.находки.mesti_buton.length));
  }
  {
    // натискане ВЪРХУ самия бутон — пръстът вече е там, целта не бяга
    const css = 'button.b { padding: 10px; transition: padding .2s ease }\n' +
                'button.b:active { padding: 8px }';
    const r = analiz([{ име: 'подпръста.css', текст: css }]);
    T(':active върху самия бутон е ПОД ПРЪСТА, не бягаща цел', 'МЪЛЧИ',
      r.находки.mesti_buton.length === 1 && r.находки.mesti_buton[0].подПръста === true,
      r.находки.mesti_buton.length ? 'подПръста=' + r.находки.mesti_buton[0].подПръста : 'нищо');
  }
  {
    // абсолютен елемент — колкото и да расте, не мести нищо
    const css = '.pill { position: absolute; padding: 10px; transition: padding .2s ease }\n' +
                '.pill.on { padding: 2px }';
    const html = '<div class="pill"><button class="x">да</button></div>';
    const r = analiz([{ име: 'абс.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('абсолютна кутия не се брои за местеща', 'МЪЛЧИ',
      r.находки.mesti_buton.length === 0,
      String(r.находки.mesti_buton.length));
  }
  {
    // transform:translate мести целта точно толкова, колкото padding —
    // и НЕ се извинява с „position:absolute".
    const css = 'button.sos { position: absolute; transform: translateY(0); transition: transform .3s ease }\n' +
                '.panel.otvoren button.sos { transform: translateY(-24px) }';
    const r = analiz([{ име: 'плъзга.css', текст: css }]);
    T('плъзгащ се бутон по чужд клас → гърми (дори абсолютен)', 'ГРЪМВА',
      r.находки.mesti_buton.length === 1 && Math.round(r.находки.mesti_buton[0].px) === 24 &&
      r.находки.mesti_buton[0].подПръста === false,
      r.находки.mesti_buton.length ? r.находки.mesti_buton[0].px + 'px' : 'НЕ ГО ВИДЯ');
  }
  {
    // scale/rotate не местят центъра — пръстът стига до същата точка
    const css = 'button.z { transform: scale(1); transition: transform .2s ease }\n' +
                '.grid.on button.z { transform: scale(1.1) rotate(4deg) }';
    const r = analiz([{ име: 'мащаб.css', текст: css }]);
    T('само scale/rotate не е бягаща цел', 'МЪЛЧИ',
      r.находки.mesti_buton.length === 0, String(r.находки.mesti_buton.length));
  }
  {
    // 🪤 ТРИТЕ ЛЪЖИ НА ПЪРВАТА МИ ВЕРСИЯ НА К7, ЗАКОВАНИ ТУК ЗАВИНАГИ.
    // Ако някой ден пак сравня селектори като низове, тези три ще паднат.
    const подниз = 'button.ro-fab { transform: translateY(0); transition: transform .25s ease }\n' +
                   '.ro-fab-hint { transform: translateY(-50%) }';
    const псевдо = 'button.pin-btn { transform: translateY(0); transition: transform .3s ease }\n' +
                   '.pin-btn::after { transform: translate(-50%, -50%) }';
    const потомък = 'button.bn-item { transform: translateY(0); transition: transform .3s ease }\n' +
                    '.bn-item.bn-active span { transform: translateY(-22px) }';
    const a = analiz([{ име: 'подниз.css', текст: подниз }]);
    const b = analiz([{ име: 'псевдо.css', текст: псевдо }]);
    const c = analiz([{ име: 'потомък.css', текст: потомък }]);
    T('„.ro-fab" НЕ е „.ro-fab-hint" (подниз)', 'МЪЛЧИ',
      a.находки.mesti_buton.length === 0, String(a.находки.mesti_buton.length));
    T('„.pin-btn" НЕ е „.pin-btn::after" (псевдо-елемент)', 'МЪЛЧИ',
      b.находки.mesti_buton.length === 0, String(b.находки.mesti_buton.length));
    T('„.bn-item" НЕ е „.bn-item.bn-active span" (потомък)', 'МЪЛЧИ',
      c.находки.mesti_buton.length === 0, String(c.находки.mesti_buton.length));
    // …но истинското състояние върху СЪЩИЯ елемент трябва да мине
    const истинско = 'button.bn-item { transform: translateY(0); transition: transform .3s ease }\n' +
                     '.bar.on button.bn-item { transform: translateY(-22px) }';
    const d = analiz([{ име: 'истинско.css', текст: истинско }]);
    T('същият елемент с чуждо състояние ВСЕ ПАК гърми', 'ГРЪМВА',
      d.находки.mesti_buton.length === 1 && Math.round(d.находки.mesti_buton[0].px) === 22,
      d.находки.mesti_buton.length ? d.находки.mesti_buton[0].px + 'px' : 'НЕ ГО ВИДЯ');
  }
  {
    // модал: булото е opacity:0 по подразбиране → кутията ВЛИЗА, не бяга
    const css = '.md-veil { opacity: 0; }\n.md-veil.on { opacity: 1 }\n' +
                '.md-box { transform: translateY(-16px); transition: transform .3s ease }\n' +
                '.md-veil.on .md-box { transform: none }';
    const html = '<div class="md-veil"><div class="md-box"><button class="ok">ок</button></div></div>';
    const r = analiz([{ име: 'модал.css', текст: css }], [{ име: 'i.html', текст: html }]);
    T('кутия, влизаща заедно с булото, не е бягаща цел', 'МЪЛЧИ',
      r.находки.mesti_buton.length === 0, String(r.находки.mesti_buton.length));
  }
  {
    // правилото, което САМО крие елемента, е излизане, не бягство
    const css = 'button.rc { transform: none; transition: transform .22s ease }\n' +
                '.rc.reveal { opacity: 0; transform: translateY(36px) }';
    const r = analiz([{ име: 'крие.css', текст: css }]);
    T('правило с opacity:0 е скриване, не бягаща цел', 'МЪЛЧИ',
      r.находки.mesti_buton.length === 0, String(r.находки.mesti_buton.length));
  }

  // ── БРОЯЧЪТ ──────────────────────────────────────────────────────
  {
    const css = ['@keyframes k1{to{opacity:1}}', '@keyframes k2{to{opacity:1}}',
                 '@keyframes k3{to{opacity:1}}', '@keyframes k4{to{opacity:1}}',
                 '@keyframes k5{to{opacity:1}}'].join('\n');
    const r = analiz([{ име: 'брой.css', текст: css }]);
    T('броячът казва точно 5 от 5', 'ГРЪМВА',
      r.преглед.keyframes === 5, 'каза ' + r.преглед.keyframes);
    const r2 = analiz([{ име: 'a.css', текст: css }, { име: 'b.css', текст: css }]);
    T('броячът събира по файлове (2×5=10)', 'ГРЪМВА',
      r2.преглед.keyframes === 10 && r2.преглед.файлове === 2,
      r2.преглед.keyframes + ' в ' + r2.преглед.файлове);
  }
  {
    // CRLF: същият файл с \r\n трябва да даде СЪЩИЯ отговор
    const a = analiz([{ име: 'lf.css', текст: КАПАН }]);
    const b = analiz([{ име: 'crlf.css', текст: КАПАН.replace(/\n/g, '\r\n') }]);
    T('CRLF дава същия отговор като LF', 'ГРЪМВА',
      a.преглед.keyframes === b.преглед.keyframes &&
      a.находки.podredba.length === b.находки.podredba.length,
      a.преглед.keyframes + ' срещу ' + b.преглед.keyframes);
  }
  {
    const css = '@keyframes u { 0%{opacity:0} 100%{opacity:1} }\n' +
                '.p:hover { animation: u 1s infinite }\n' +
                '.q { animation: u 1s infinite }';
    const r = analiz([{ име: 'условие.css', текст: css }]);
    const к = r.keyframes[0];
    T('условно/безусловно се различават', 'ГРЪМВА',
      к.условни === 1 && к.безусловни === 1, 'усл ' + к.условни + ' / безусл ' + к.безусловни);
  }

  return резултати;
}

// ─────────────────────────────────────────────────────────────────────
// ДОКЛАД
// ─────────────────────────────────────────────────────────────────────
function pad(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }
function ms(x) { return x == null ? '—' : (x >= 1000 ? (x / 1000) + 'с' : x + 'мс'); }

function glaven() {
  const самоЛиТест = process.argv.includes('--test');
  const списък = process.argv.includes('--spisak');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎬 ЦЕНАТА И КАЧЕСТВОТО НА АНИМАЦИИТЕ  ·  dev/cena_animacii2.js');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ── самопроверката ВИНАГИ първа: ако мярката е счупена, числата са боклук
  const тестове = samoproverka();
  const паднали = тестове.filter(t => !t.ok);
  const мълчи = тестове.filter(t => t.посока === 'МЪЛЧИ');
  const гърми = тестове.filter(t => t.посока === 'ГРЪМВА');
  console.log('🧪 САМОПРОВЕРКА В ДВЕТЕ ПОСОКИ');
  console.log('   ТРЯБВА ДА ГРЪМНЕ: ' + гърми.filter(t => t.ok).length + '/' + гърми.length +
              '   ТРЯБВА ДА МЪЛЧИ: ' + мълчи.filter(t => t.ok).length + '/' + мълчи.length);
  for (const t of тестове)
    console.log('   ' + (t.ok ? '✅' : '❌') + ' [' + pad(t.посока, 6) + '] ' +
                pad(t.име, 48) + ' ' + t.детайл);
  if (паднали.length) {
    console.log('\n   ❌ МЯРКАТА Е СЧУПЕНА — числата долу не струват. Спирам.');
    process.exitCode = 1;
    return;
  }
  console.log('   ✅ уредът греши, когато трябва, и мълчи, когато трябва.\n');
  if (самоЛиТест) return;

  // ── истинските файлове
  const файлове = [];
  for (const f of fs.readdirSync(path.join(КОРЕН, 'css')).filter(x => x.endsWith('.css')).sort())
    файлове.push({ име: 'css/' + f, текст: fs.readFileSync(path.join(КОРЕН, 'css', f), 'utf8') });
  // РАЗМЕТКАТА — за да се знае кое НАИСТИНА се натиска, а не да се гадае
  // по името на класа. index.html + всички js, които градят html.
  const разметка = [];
  разметка.push({ име: 'index.html',
                  текст: fs.readFileSync(path.join(КОРЕН, 'index.html'), 'utf8') });
  const jsПът = path.join(КОРЕН, 'js');
  let jsКф = 0, jsБрой = 0;
  if (fs.existsSync(jsПът)) {
    for (const f of fs.readdirSync(jsПът).filter(x => x.endsWith('.js')).sort()) {
      const t = fs.readFileSync(path.join(jsПът, f), 'utf8');
      разметка.push({ име: 'js/' + f, текст: t });
      jsБрой++;
      jsКф += (t.match(/@keyframes\s/g) || []).length;
    }
  }

  const r = analiz(файлове, разметка);
  const п = r.преглед;
  const н = r.находки;

  console.log('📏 КОЛКО ПРЕГЛЕДАХ');
  console.log('   css файлове ............ ' + п.файлове);
  console.log('   редове ................. ' + п.редове.toLocaleString('bg-BG'));
  console.log('   килобайта .............. ' + Math.round(п.байтове / 1024));
  console.log('   правила с декларации ... ' + п.правила);
  console.log('   @keyframes ............. ' + п.keyframes + '   ← всяка е разгледана');
  console.log('   употреби на анимации ... ' + п.употреби);
  console.log('   „@keyframes" в коментар  ' + п.коментарни_примамки + '   (изхвърлени, не се броят)');
  console.log('   @keyframes в js/ ....... ' + jsКф + '   (инжектират се от кода)');
  console.log('   скрити по подразбиране . ' + r.скрити.length + ' селектора');
  console.log('   прочетена разметка ..... index.html + ' + jsБрой + ' js файла');
  console.log('   натискаеми класове ..... ' + п.натискаеми_класове +
              '   (за К2 — не се гади по име)\n');

  // ── ЦЕНА
  const бр = { ПОДРЕДБА: 0, БОЯ: 0, GPU: 0, ЕВТИНА: 0 };
  for (const к of r.keyframes) if (!к.счупена) бр[к.цена.тежест]++;
  const безкр = r.keyframes.filter(к => к.безкрайна).length;
  const безкрБезусл = r.keyframes.filter(к => к.употреби.some(у => у.безкрайна && !у.условна)).length;
  const употрБезкр = r.употреби.filter(у => у.безкрайна && !у.изключена && !у.редуцирано).length;
  const употрБезкрУсл = r.употреби.filter(у => у.безкрайна && !у.изключена && !у.редуцирано && у.условна).length;

  console.log('💰 ЦЕНАТА');
  console.log('   🔴 ПОДРЕДБА (мени width/height/top/left/margin/padding) .. ' + бр.ПОДРЕДБА);
  console.log('   🟠 БОЯ (box-shadow/background/stroke/d — рисува наново) .. ' + бр.БОЯ);
  console.log('   🟡 GPU-тежка (filter/backdrop-filter) ................... ' + бр.GPU);
  console.log('   🟢 ЕВТИНА (само transform/opacity) ...................... ' + бр.ЕВТИНА);
  console.log('   ─────────────────────────────────────────────────────────');
  console.log('   безкрайни анимации (различни имена) .................... ' + безкр);
  console.log('   от тях с ПОНЕ ЕДНА безусловна употреба ................. ' + безкрБезусл);
  console.log('   безкрайни УПОТРЕБИ (правила) ........................... ' + употрБезкр);
  console.log('      · под условие (.on/.play/:hover/[data-]) ............ ' + употрБезкрУсл);
  console.log('      · БЕЗУСЛОВНИ (вървят щом елементът съществува) ...... ' +
              (употрБезкр - употрБезкрУсл) + '\n');

  if (бр.ПОДРЕДБА) {
    console.log('🔴 СКЪПИ — ПИПАТ ПОДРЕДБАТА');
    for (const к of н.podredba)
      console.log('   ' + pad(к.файл + ':' + к.ред, 22) + pad(к.име, 22) +
                  (к.безкрайна ? '∞ ' : '  ') + к.цена.подр.join(', '));
    console.log('');
  } else {
    console.log('🔴 СКЪПИ — ПИПАТ ПОДРЕДБАТА:  НУЛА от ' + п.keyframes +
                ' прегледани. Нито една @keyframes не мени width/height/top/\n' +
                '   left/margin/padding. (Това е ПРОВЕРЕНО, не предположено — виж самопроверката.)\n');
  }

  if (н.boya.length) {
    console.log('🟠 БОЯДИСВАТ НА ВСЕКИ КАДЪР (' + н.boya.length + ')');
    for (const к of н.boya.sort((a, b) => (b.безкрайна ? 1 : 0) - (a.безкрайна ? 1 : 0)))
      console.log('   ' + pad(к.файл + ':' + к.ред, 22) + pad(к.име, 22) +
                  (к.безкрайна ? '∞ ' : '  ') + pad(к.цена.боя.join(','), 26) +
                  'употреби:' + к.употреби.length);
    console.log('');
  }
  if (н.gpu.length) {
    console.log('🟡 GPU-ТЕЖКИ (' + н.gpu.length + ')');
    for (const к of н.gpu)
      console.log('   ' + pad(к.файл + ':' + к.ред, 22) + pad(к.име, 22) +
                  (к.безкрайна ? '∞ ' : '  ') + к.цена.гпу.join(','));
    console.log('');
  }

  // ── КАЧЕСТВО
  console.log('═══ КАЧЕСТВОТО ═══\n');

  console.log('К1 · МИГАНЕ ПО-ЧЕСТО ОТ 3 ПЪТИ В СЕКУНДА (риск от припадък)');
  if (!н.migane.length) {
    const проверени = r.keyframes.filter(к => migania(к.цена.стъпки).светвания > 0);
    console.log('   ✅ нула. Проверени са ' + проверени.length +
                ' анимации, които изобщо светват/угасват,\n      срещу ' +
                r.употреби.filter(у => у.трайност).length + ' употреби с известна трайност.\n');
  } else {
    for (const x of н.migane)
      console.log('   ❌ ' + pad(x.к.име, 20) + x.честота.toFixed(1) + '/сек  ' +
                  x.у.файл + ':' + x.у.ред + '  ' + x.у.селектор);
    console.log('');
  }

  console.log('К2 · БЕЗКРАЙНО ДВИЖЕНИЕ ПОД НАТИСКАЕМО НЕЩО');
  console.log('   мярка: колко се измества целта за 300 мс — толкова пътува пръстът.');
  console.log('   🔴 над 8px = мама може да натисне грешно · 🟢 под 8px = стига до целта');
  if (!н.premestva.length) console.log('   ✅ нула движещи се натискаеми\n');
  else {
    for (const x of н.premestva.slice().sort((a, b) => b.за300 - a.за300))
      console.log('   ' + (x.червено ? '🔴' : '🟢') + ' ' + pad(x.к.име, 18) +
                  pad('за 300мс: ' + x.за300.toFixed(1) + 'px', 20) +
                  pad('размах ' + x.размах.toFixed(0) + 'px', 14) +
                  pad(ms(x.у.трайност), 7) + x.у.файл + ':' + x.у.ред + '  ' + x.у.селектор);
    const чрв = н.premestva.filter(x => x.червено).length;
    console.log('   → червени: ' + чрв + ' от ' + н.premestva.length + ' прегледани\n');
  }

  console.log('К1б · МИГАНЕ ПО ЦВЯТ (фон/текст/сянка — не само прозрачност)');
  if (!н.migane_cvyat.length) {
    let цветни = 0, найБърза = null;
    for (const к of r.keyframes) {
      const цв = svetkaviciPoCvyat(к.цена.стъпки);
      if (!цв.размах) continue;
      цветни++;
      for (const у of к.употреби) {
        if (!у.трайност) continue;
        const об = /alternate/i.test(у.посока) ? у.трайност * 2 : у.трайност;
        if (!найБърза || об < найБърза.об) найБърза = { об, име: к.име, размах: цв.размах };
      }
    }
    console.log('   ✅ нула. Проверени ' + цветни + ' анимации, които изобщо сменят цвят.');
    if (найБърза)
      console.log('      най-бързата от тях: ' + найБърза.име + ' — една обиколка на ' +
                  ms(найБърза.об) + ' = ' + (1000 / найБърза.об).toFixed(1) +
                  '/сек, разлика в яркостта ' + (найБърза.размах * 100).toFixed(1) +
                  ' т. (прагът е 3/сек при 10 т.)');
    console.log('');
  } else {
    for (const x of н.migane_cvyat)
      console.log('   ❌ ' + pad(x.к.име, 20) + x.честота.toFixed(1) + '/сек  яркост ±' +
                  (x.размах * 100).toFixed(0) + ' т.  ' + x.у.файл + ':' + x.у.ред);
    console.log('');
  }

  console.log('К3 · САМА ПРЕНАРЕЖДА СТРАНИЦАТА (CLS)');
  console.log('   @keyframes с layout-свойство: ' + н.podredba.length);
  const прБезЛюб = н.prehodi.filter(x => x.свойство !== 'all');
  const прСвити = прБезЛюб.filter(x => x.свито);
  const прЖиви = прБезЛюб.filter(x => !x.свито);
  console.log('   transition по layout-свойство: ' + прБезЛюб.length +
              ' (+' + (н.prehodi.length - прБезЛюб.length) + ' × „transition: all")');
  console.log('   от тях СВИТИ (не могат да мръднат страницата): ' + прСвити.length);
  for (const x of прСвити)
    console.log('      🟢 ' + pad(x.свойство, 12) + pad(x.файл + ':' + x.ред, 20) +
                pad(x.селектор.slice(0, 26), 28) + '← ' + x.свито);
  console.log('   МОГАТ да пренаредят: ' + прЖиви.length);
  for (const x of прЖиви)
    console.log('      🟠 ' + pad(x.свойство, 12) + pad(x.файл + ':' + x.ред, 20) +
                x.селектор.slice(0, 40));
  console.log('');

  console.log('К4 · БЕЗКРАЙНА БЕЗУСЛОВНА ВЪРХУ НЕЩО, СКРИТО ПО ПОДРАЗБИРАНЕ');
  if (!н.skrito.length) console.log('   ✅ нула\n');
  else {
    const видени = new Set();
    for (const x of н.skrito) {
      const к = x.у.файл + x.у.ред + x.у.селектор;
      if (видени.has(к)) continue;
      видени.add(к);
      console.log('   🟠 ' + pad(x.к.име, 20) + x.у.файл + ':' + x.у.ред + '  ' + x.у.селектор);
    }
    console.log('   (' + видени.size + ' правила)\n');
  }

  console.log('К5 · РАЗЛИЧНА СКОРОСТ ЗА ЕДНО И СЪЩО ДЕЙСТВИЕ');
  if (!н.razlichna_skorost.length) console.log('   ✅ нула\n');
  else {
    for (const x of н.razlichna_skorost) {
      console.log('   🟠 ' + pad(x.семейство, 10) + x.брой + ' употреби, ' +
                  x.времена.length + ' различни скорости: ' + x.времена.map(ms).join(' · '));
      const най = x.примери.slice().sort((a, b) => a.t - b.t);
      console.log('      най-бърза: ' + най[0].име + ' ' + ms(най[0].t) +
                  '   най-бавна: ' + най[най.length - 1].име + ' ' + ms(най[най.length - 1].t));
    }
    console.log('');
  }

  console.log('К5б · НАРУШЕН СОБСТВЕНИЯТ СТАНДАРТ (css/anim.css: „ползвай ги навсякъде")');
  const тк = Object.entries(н.tokeni).map(([k, v]) => k + '=' + ms(v)).join(' · ');
  console.log('   записано: ' + (тк || 'няма токени'));
  if (!н.tokeni['--bl-t-enter']) console.log('   ⚠️ няма --bl-t-enter — не мога да меря\n');
  else if (!н.nad_standarta.length) console.log('   ✅ никое влизане не надхвърля 1.5× стандарта\n');
  else {
    const гр = new Map();
    for (const x of н.nad_standarta) {
      const к = x.к.име + '|' + x.у.трайност;
      if (!гр.has(к)) гр.set(к, { x, бр: 0 });
      гр.get(к).бр++;
    }
    console.log('   стандартът за влизане е ' + ms(н.tokeni['--bl-t-enter']) +
                '; над 1.5× от него: ' + н.nad_standarta.length + ' употреби, ' +
                гр.size + ' различни');
    for (const { x, бр } of [...гр.values()].sort((a, b) => b.x.мс - a.x.мс).slice(0, 12))
      console.log('      ' + pad(ms(Math.round(x.мс)), 8) + pad('×' + x.пъти.toFixed(1), 6) +
                  pad(x.к.име, 20) + (бр > 1 ? бр + '× · ' : '') + x.у.файл + ':' + x.у.ред +
                  (x.измерено ? '' : '   (неизмерено — горна граница)'));
    console.log('');
  }

  console.log('К7 · ПРЕХОД, КОЙТО МЕСТИ НАТИСКАЕМО НЕЩО (целта бяга под пръста)');
  console.log('   прочетени ' + п.натискаеми_в_разметка + ' натискаеми в разметката, ' +
              'от тях ' + п.кутии_с_бутон + ' класа-кутии с бутон вътре');
  const с_ = н.sito;
  console.log('   ситото: ' + с_.кандидати + ' прехода по движение → ' +
              'свити ' + с_.свити + ' · не се натискат ' + с_.ненатискаеми +
              ' · ::before/::after ' + с_.псевдо + ' · невидими ' + с_.невидими);
  console.log('            остават ' + (с_.кандидати - с_.свити - с_.ненатискаеми -
              с_.псевдо - с_.невидими) + ' → двойки основа/състояние ' + с_.двойки +
              ' → отпадат: влизане ' + с_.скриващи + ' · само мащаб ' + с_.само_мащаб);
  const бягащи = н.mesti_buton.filter(x => !x.подПръста);
  const подПръста = н.mesti_buton.filter(x => x.подПръста);
  if (!бягащи.length) console.log('   ✅ нула бягащи цели (' + подПръста.length +
                                  ' × под пръста — :hover/:active върху самия бутон)\n');
  else {
    for (const x of бягащи) {
      console.log('   🔴 ' + pad(x.свойство, 10) + pad((x.от || '?') + ' → ' + x.до, 26) +
                  pad(x.px != null ? x.px + 'px' : '?', 8) +
                  pad(x.преход.файл + ':' + x.преход.ред, 20) +
                  x.преход.селектор + '   ← сменя го ' + x.правило.селектор);
      console.log('      основата е в ' + (x.базовФайл || 'ненамерена') +
                  ' · смяната в ' + x.правило.файл + ':' + x.правило.ред);
    }
    console.log('   (' + подПръста.length + ' други са под пръста — :hover/:active върху самия бутон)\n');
  }

  console.log('К6 · НАД 400 мс, ДОКАТО НЕЩО СТАНЕ ВИДИМО (мама чака)');
  console.log('   мери се до ПЪРВАТА пълна видимост, не цялата трайност —');
  console.log('   „изскочи·постой·изчезни" не е чакане, а стоене за четене.');
  if (!н.bavni.length) console.log('   ✅ нула\n');
  else {
    const ред = н.bavni.slice().sort((a, b) => b.мс - a.мс);
    for (const x of ред.slice(0, 20))
      console.log('   🟠 ' + pad(ms(Math.round(x.мс)), 8) +
                  pad(x.измерено ? (x.процент < 100 ? '(' + x.процент + '% от ' + ms(x.у.трайност) + ')' : '') : '≤ (неизмерено)', 20) +
                  pad(x.к.име, 20) + x.у.файл + ':' + x.у.ред + '  ' + x.у.селектор.slice(0, 34));
    if (ред.length > 20) console.log('   … и още ' + (ред.length - 20));
    console.log('');
  }

  console.log('ДОПЪЛНИТЕЛНО');
  console.log('   употреба на несъществуваща @keyframes: ' + н.lipsvashti.length +
              (н.lipsvashti.length ? '  → ' + [...new Set(н.lipsvashti.map(x => x.име))].join(', ') : ''));
  console.log('   @keyframes без нито една употреба в css: ' + н.nepolzvani.length +
              (н.nepolzvani.length ? '  (може да се ползват от js)' : ''));
  console.log('   незатворена скоба: ' + н.schupeni.length);
  console.log('   непознато свойство в keyframes: ' + н.nepoznati.length +
              (н.nepoznati.length ? ' → ' + [...new Set(н.nepoznati.flatMap(k => k.цена.непозн))].join(', ') : ''));
  console.log('');

  if (списък) {
    console.log('📋 ВСЯКА ЕДНА ПРЕГЛЕДАНА @keyframes (' + p_(r.keyframes.length) + ')');
    console.log('   ' + pad('файл:ред', 22) + pad('име', 24) + pad('цена', 12) +
                pad('∞', 3) + pad('усл/безусл', 12) + 'свойства');
    for (const к of r.keyframes)
      console.log('   ' + pad(к.файл.replace('css/', '') + ':' + к.ред, 22) + pad(к.име, 24) +
                  pad(к.цена.знак + ' ' + к.цена.тежест, 12) +
                  pad(к.безкрайна ? '∞' : '', 3) +
                  pad(к.условни + '/' + к.безусловни, 12) +
                  к.цена.уник.join(','));
    console.log('');
  }
  function p_(x) { return x; }

  const червени = н.podredba.length + н.migane.length + н.migane_cvyat.length +
                  н.premestva.filter(x => x.червено).length + н.schupeni.length +
                  бягащи.length;
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(червени ? '❌ ЧЕРВЕНИ: ' + червени : '✅ НУЛА ЧЕРВЕНИ (подредба, мигане, движещи се бутони)');
  console.log('   оранжеви за преглед: боя ' + н.boya.length + ' · скрити ' +
              (new Set(н.skrito.map(x => x.у.файл + x.у.ред))).size + ' · бавни ' + н.bavni.length +
              ' · разнобой ' + н.razlichna_skorost.length +
              ' · transition-подредба ' + прЖиви.length + ' живи от ' + прБезЛюб.length);
  console.log('═══════════════════════════════════════════════════════════════');
  if (червени) process.exitCode = 1;
}

if (require.main === module) glaven();
module.exports = { analiz, samoproverka, cenaNaKeyframes, namerKeyframes, bezKomentari };
