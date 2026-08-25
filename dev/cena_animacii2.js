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

    obhodPravila(без, (стек, декл) => {
      преглед.правила++;
      const сел = стек[стек.length - 1] || '';
      for (const d of декл) {
        if (d.свойство !== 'transition' && d.свойство !== 'transition-property') continue;
        for (const парче of razdeliZapetai(d.стойност)) {
          const п = парче.trim().split(/\s+/)[0].toLowerCase();
          if (ПОДРЕДБА.has(п) || п === 'all')
            преходи.push({ файл: ф.име, ред: redNa(nach, d.индекс), селектор: сел, свойство: п });
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
  const н = { podredba: [], boya: [], gpu: [], migane: [], premestva: [],
              skrito: [], razlichna_skorost: [], bavni: [], nepolzvani: [],
              lipsvashti: [], schupeni: [], prehodi: преходи, nepoznati: [] };

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

    // К6 бавни
    for (const у of к.употреби)
      if (!у.безкрайна && у.трайност && у.трайност > 400 &&
          /(in|enter|reveal|show|appear|pop|влиза|появ)/i.test(к.име))
        н.bavni.push({ к, у });
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
      for (const у of к.употреби) {
        if (у.безкрайна || !у.трайност) continue;
        if (у.трайност > стандарт * 1.5)
          н.nad_standarta.push({ к, у, пъти: у.трайност / стандарт });
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

  console.log('К3 · САМА ПРЕНАРЕЖДА СТРАНИЦАТА (CLS)');
  console.log('   @keyframes с layout-свойство: ' + н.podredba.length);
  const прБезЛюб = н.prehodi.filter(x => x.свойство !== 'all');
  console.log('   transition по layout-свойство: ' + прБезЛюб.length +
              ' (+' + (н.prehodi.length - прБезЛюб.length) + ' × „transition: all")');
  if (прБезЛюб.length) {
    const поСв = {};
    for (const x of прБезЛюб) (поСв[x.свойство] = поСв[x.свойство] || []).push(x);
    for (const [св, сп] of Object.entries(поСв).sort((a, b) => b[1].length - a[1].length))
      console.log('      ' + pad(св, 16) + сп.length + '×   напр. ' + сп[0].файл + ':' + сп[0].ред +
                  '  ' + сп[0].селектор.slice(0, 46));
  }
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
    for (const { x, бр } of [...гр.values()].sort((a, b) => b.x.у.трайност - a.x.у.трайност).slice(0, 12))
      console.log('      ' + pad(ms(x.у.трайност), 8) + pad('×' + x.пъти.toFixed(1), 6) +
                  pad(x.к.име, 20) + (бр > 1 ? бр + '× · ' : '') + x.у.файл + ':' + x.у.ред);
    console.log('');
  }

  console.log('К6 · НАД 400 мс НА НЕЩО, КОЕТО МАМА ЧАКА');
  if (!н.bavni.length) console.log('   ✅ нула\n');
  else {
    const ред = н.bavni.slice().sort((a, b) => b.у.трайност - a.у.трайност);
    for (const x of ред.slice(0, 20))
      console.log('   🟠 ' + pad(ms(x.у.трайност), 8) + pad(x.к.име, 22) +
                  x.у.файл + ':' + x.у.ред + '  ' + x.у.селектор.slice(0, 44));
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

  const червени = н.podredba.length + н.migane.length +
                  н.premestva.filter(x => x.червено).length + н.schupeni.length;
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(червени ? '❌ ЧЕРВЕНИ: ' + червени : '✅ НУЛА ЧЕРВЕНИ (подредба, мигане, движещи се бутони)');
  console.log('   оранжеви за преглед: боя ' + н.boya.length + ' · скрити ' +
              (new Set(н.skrito.map(x => x.у.файл + x.у.ред))).size + ' · бавни ' + н.bavni.length +
              ' · разнобой ' + н.razlichna_skorost.length + ' · transition-подредба ' + прБезЛюб.length);
  console.log('═══════════════════════════════════════════════════════════════');
  if (червени) process.exitCode = 1;
}

if (require.main === module) glaven();
module.exports = { analiz, samoproverka, cenaNaKeyframes, namerKeyframes, bezKomentari };
