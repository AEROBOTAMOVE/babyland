// ═══════════════════════════════════════════════════════════
// ☠️ КРИВ ЗАПИС — подава ОТРОВНИ стойности и гледа коя карта умира
//
// ЗАЩО СЪЩЕСТВУВА (25–26.08.2026):
//   Одитът ИЗМЕРИ, че ЕДИН крив запис в паметта убива цели стаи:
//       bl_lab = {done:[]} / {list:[null]} / {done:[null]}
//           → „Лабораторията" става ПРАЗНА стая, без нито дума
//       bl_custom_lists = [null]
//           → badgesCard() гърми → „Дневник на мама" спира по средата:
//             от три карти остават НУЛА, изчезва И КЛЮЧАЛКАТА на дневника
//   Такъв запис идва от: внесено копие от друг телефон · стара версия ·
//   ръчно пипане · прекъснат запис · чужд бекъп. Тоест НЕ е хипотеза.
//
//   js/pazach_karti.js вече пази СЛЕДВАЩИТЕ карти. Но самата карта пак
//   изчезва — а тя може да е ключалката, спешният номер или лекарството.
//   Този уред намира ТОЧНО КОЯ карта умира и от КОЯ форма на записа.
//
// КАКВО ПРАВИ:
//   За всеки localStorage ключ, който четат моите файлове, подава поред
//   17 отровни форми и построява НАИСТИНА засегнатите стаи. Брои:
//     · 💀 УМРЕЛИ КАРТИ — брънка, която е ГРЪМНАЛА (уловена от пазача
//          или изхвърчала навън). Това е ЕДИНСТВЕНОТО сигурно число:
//          карта може ЗАКОННО да не се покаже при празни данни.
//     · ⬛ ПРАЗНА СТАЯ — нула карти в корена.
//     · 🟠 „undefined"/„null"/„NaN" в текста към майката.
//     · ♻️ РАЗПРОСТРАНЕНИЕ — приложението е ПРЕПИСАЛО кривия запис
//          обратно в паметта и го е направило постоянен.
//
// 🪤 КАПАНИТЕ, ЗАРАДИ КОИТО Е НАПИСАН ТАКА (всеки е моя сгрешена версия):
//   · МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. `--samoproverka` вкарва
//     НАРОЧНО счупена карта (гола `JSON.parse(...).forEach`) и иска уредът
//     ДА Я ХВАНЕ; и втора, ЗДРАВА, която НЕ бива да хване. Падне ли която
//     и да е от двете → изход 2 и числата долу НЕ ВАЖАТ.
//   · МОЯТ ПЪРВИ УРЕД БРОЕШЕ „ИЗЧЕЗНАЛИ КАРТИ" ПО РАЗЛИКАТА В БРОЯ ДЕЦА.
//     Това е лъжа: „последната ти бележка" ЗАКОННО изчезва при празен
//     списък. Затова разликата се ПОКАЗВА, но НЕ се брои за дефект —
//     дефект е само ГРЪМНАЛА брънка.
//   · ПЪРВОТО МИ ПУСКАНЕ ДАДЕ 4 ФАЛШИВИ ТРУПА — от МОЯ миниатюрен DOM
//     (`insertAdjacentHTML`, `createDocumentFragment` липсваха). Затова
//     ВСЯКО пускане първо мери ЧИСТА памет: базовите грешки се изваждат и
//     се печатат отделно. Ненулева база = уредът не е готов, не проектът.
//   · „0 находки" без брой ПРЕГЛЕДАНИ значи „0 прегледани". Печата се
//     КОЛКО КЛЮЧА × КОЛКО ФОРМИ × колко строежа на стаи.
//   · `typeof x === 'object'` е ИСТИНА за null; `JSON.parse('null')` не
//     гърми, а връща null; `Array.isArray(null)` е false. Трите изглеждат
//     различно — затова са ТРИ отделни форми, не една.
//   · CRLF: никъде няма split('\n').
//   · Кирилица в регулярни: `\b` НЕ работи — намира НУЛА и МЪЛЧИ. Затова
//     „undefined/null/NaN" се търсят с явни граници, не с `\b`.
//   · js/app.js не се зарежда без истинския index.html — ИЗКЛЮЧЕН е
//     нарочно и това се КАЗВА, а не се крие (той не пипа ROOM_FEATURES).
//
// ПУСКАНЕ:
//   node dev/kriv_zapis.js                  — целият обход
//   node dev/kriv_zapis.js --samoproverka   — уредът се изпитва В ДВЕТЕ ПОСОКИ
//   node dev/kriv_zapis.js --klyuch=bl_lab  — само един ключ
//   node dev/kriv_zapis.js --podrobno       — ред за всяка находка
//   node dev/kriv_zapis.js --bazа           — само базовото измерване
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. localStorage е обикновен обект в
//   паметта на Node — нула следи по диска. Изтрий го и нищо не се променя.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

// Миниатюрният DOM е вече написан и изпитан в dev/interaktivno_jenata.js —
// вземаме двигателя оттам, вместо да пишем втори (и да се разминат).
const { новПрозорец, зареди } = require('./interaktivno_jenata.js');

// ═══ 1. РЕДЪТ НА ЗАРЕЖДАНЕ — взет ОТ index.html, не от паметта ми ═══
// js/app.js пада без истинския index.html (пише в елементи, които ги няма).
// Той НЕ пипа ROOM_FEATURES (проверено: grep -c → 0), затова е изключен.
const ИЗКЛЮЧЕНИ = new Set(['js/app.js']);
function веригата() {
  const html = fs.readFileSync('index.html', 'utf8');
  const вън = [];
  const видени = new Set();
  for (const m of html.matchAll(/js\/[A-Za-z0-9_.-]+\.js/g)) {
    const f = m[0];
    if (видени.has(f) || ИЗКЛЮЧЕНИ.has(f)) continue;
    видени.add(f);
    if (fs.existsSync(f)) вън.push(f);
  }
  return вън;
}

// ═══ 2. МОИТЕ ФАЙЛОВЕ — ключовете се вадят ОТ ТЯХ, не се съчиняват ═══
const МОИ = ['js/rooms.js', 'js/rooms3.js', 'js/rooms4.js', 'js/rooms5.js',
  'js/rooms6.js', 'js/rooms7.js', 'js/rooms14.js', 'js/rooms19.js',
  'js/river.js', 'js/yearbook.js', 'js/yearbook2.js', 'js/photos.js',
  'js/store.js', 'js/storage.js'];

// Ключове, които НЕ идват от моите файлове, но са ДОКУМЕНТИРАНИТЕ убийци от
// одита на 25.08 — заради тях изобщо съществува js/pazach_karti.js. Влизат в
// обхода нарочно: уред, който не проверява познатия виновник, е непълен.
const ДОПЪЛНИТЕЛНИ = {
  bl_custom_lists: 'одит 25.08: [null] → badgesCard() гърми → Дневникът губи ключалката',
  bl_pin: 'ключалката на дневника',
  bl_badges: 'медальоните до ключалката'
};

function ключовете() {
  const карта = new Map();          // ключ → Set(файлове)
  for (const k of Object.keys(ДОПЪЛНИТЕЛНИ)) карта.set(k, new Set(['(външен: ' + ДОПЪЛНИТЕЛНИ[k] + ')']));
  for (const f of МОИ) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/'(bl_[a-z0-9_]+)'/g)) {
      const k = m[1];
      if (k.endsWith('_')) continue;          // 'bl_draft_' е ПРЕДСТАВКА, не ключ
      if (!карта.has(k)) карта.set(k, new Set());
      карта.get(k).add(f.replace('js/', ''));
    }
  }
  return карта;
}

// ═══ 3. ОТРОВИТЕ — точно както биха стояли в localStorage (СУРОВ НИЗ) ═══
const ОТРОВИ = [
  ['null',              'null'],                                  // JSON.parse НЕ гърми — връща null
  ['празен низ',        ''],                                      // JSON.parse ГЪРМИ
  ['не е json',         'не е json'],                             // JSON.parse ГЪРМИ
  ['[]',                '[]'],
  ['[null]',            '[null]'],                                // ← истинският bl_custom_lists
  ['[undefined]',       '[undefined]'],                           // ръчно пипано, НЕВАЛИДЕН json
  ['{}',                '{}'],
  ['{done:null}',       '{"done":null}'],                         // ← истинският bl_lab
  ['{done:[]}',         '{"done":[]}'],                           // ← истинският bl_lab
  ['{done:[null]}',     '{"done":[null]}'],                       // ← истинският bl_lab
  ['{list:[null]}',     '{"list":[null]}'],                       // ← истинският bl_lab
  ['число',             '42'],
  ['масив от числа',    '[1,2,3]'],
  ['обект вместо масив', '{"0":"а","1":"б","length":2}'],
  ['вложен боклук',     '{"a":{"b":{"c":[[[{"d":null}]]]}}}'],
  ['дълъг низ',         JSON.stringify('я'.repeat(20000))],
  ['празни полета',     '{"n":null,"t":null,"d":null,"id":null,"date":null,"items":null}']
];

// ═══ 4. ШИМОВЕТЕ ═══
// Липсващо парче от миниатюрния DOM НЕ е дефект в приложението — иначе
// уредът обявява СВОЯ пропуск за находка (случи ми се: 4 фалшиви трупа).
const СКЛАД = {
  bl_mama: JSON.stringify({ name: 'Ани', emoji: '🌸', d: '2026-08-01' }),
  bl_baby: JSON.stringify({ name: 'Мими', birth: '2026-04-01', sex: 'girl' }),
  bl_onboarded: 'true'
};

function допълни(W) {
  const прото = Object.getPrototypeOf(W.document.createElement('div'));
  // 🪤 Пазачът пише всяка уловена грешка в конзолата — правилно за браузъра,
  //    но тук 2000 строежа заливат доклада и той става нечетим. Числата НЕ
  //    идват от конзолата, а от window.BL_КАРТИ_ГРЕШКИ, така че нищо не се губи.
  //    БОНУС: js/pazach_karti.js подава на console.warn САМИЯ обект-грешка.
  //    Оттам взимаме СТЕКА → знаем КОЙ ФАЙЛ е гръмнал. Без това докладът
  //    сочи ключа, но не адреса, а стаята се сглобява от 8-10 файла.
  W.__последенСтек = null;
  W.console = {
    log() {}, error() {}, info() {}, debug() {}, trace() {}, table() {},
    group() {}, groupEnd() {}, time() {}, timeEnd() {}, assert() {}, dir() {}, count() {},
    warn() {
      for (const а of arguments) {
        if (а && а.stack) {
          const м = String(а.stack).match(/js[\\/][A-Za-z0-9_.-]+\.js:\d+/);
          if (м) { W.__последенСтек = м[0].replace(/\\/g, '/'); return; }
        }
      }
    }
  };
  W.Storage = function () {};
  W.Storage.prototype = Object.getPrototypeOf(W.localStorage) || {};
  W.Storage.prototype.setItem = W.localStorage.setItem;
  W.Storage.prototype.getItem = W.localStorage.getItem;
  W.Storage.prototype.removeItem = W.localStorage.removeItem;
  if (!прото.after) прото.after = function (...в) { const p = this.parentNode; if (!p) return; const сл = this.nextSibling; в.forEach(n => p.insertBefore(n, сл)); };
  if (!прото.before) прото.before = function (...в) { const p = this.parentNode; if (!p) return; в.forEach(n => p.insertBefore(n, this)); };
  if (!прото.replaceWith) прото.replaceWith = function (...в) { const p = this.parentNode; if (!p) return; в.forEach(n => p.insertBefore(n, this)); p.removeChild(this); };
  if (!прото.insertAdjacentHTML) прото.insertAdjacentHTML = function (поз, html) {
    const t = W.document.createElement('div');
    t.innerHTML = String(html == null ? '' : html);
    const деца = t.childNodes.slice();
    деца.forEach(n => { n.parentNode = null; }); t.childNodes = [];
    const p = this.parentNode;
    if (поз === 'afterbegin') деца.reverse().forEach(n => this.insertBefore(n, this.firstChild));
    else if (поз === 'beforebegin' && p) деца.forEach(n => p.insertBefore(n, this));
    else if (поз === 'afterend' && p) { const сл = this.nextSibling; деца.forEach(n => p.insertBefore(n, сл)); }
    else деца.forEach(n => this.appendChild(n));
  };
  if (!прото.__фрагПач) {           // createDocumentFragment: съдържанието се СЛИВА, не се увива
    прото.__фрагПач = 1;
    const оAppend = прото.appendChild, оInsert = прото.insertBefore;
    прото.appendChild = function (n) {
      if (n && n.nodeType === 11) { n.childNodes.slice().forEach(d => оAppend.call(this, d)); return n; }
      return оAppend.call(this, n);
    };
    прото.insertBefore = function (n, п) {
      if (n && n.nodeType === 11) { n.childNodes.slice().forEach(d => оInsert.call(this, d, п)); return n; }
      return оInsert.call(this, n, п);
    };
  }
  W.document.createDocumentFragment = function () { const f = W.document.createElement('div'); f.nodeType = 11; return f; };
  if (!W.BL_UI.note) W.BL_UI.note = () => {};
  if (!W.BL_UI.toast) W.BL_UI.toast = () => {};
  if (!W.BL_FX.chime) W.BL_FX.chime = () => {};
  if (!W.BL_FX.sparkle) W.BL_FX.sparkle = () => {};
  if (!W.BL_FX.pop) W.BL_FX.pop = () => {};
  W.Node = function () {}; W.Node.prototype = прото;
  W.HTMLElement = function () {}; W.HTMLElement.prototype = прото;
  W.Element = W.HTMLElement;
  W.Event = function (t, o) { Object.assign(this, { type: t }, o || {}); };
  W.CustomEvent = function (t, o) { Object.assign(this, { type: t }, o || {}); this.detail = (o || {}).detail; };
  W.MutationObserver = function (cb) { this.observe = () => {}; this.disconnect = () => {}; this.takeRecords = () => []; this.__cb = cb; };
  W.ResizeObserver = function () { this.observe = () => {}; this.unobserve = () => {}; this.disconnect = () => {}; };
  W.AbortController = function () { this.signal = {}; this.abort = () => {}; };
  W.TextEncoder = typeof TextEncoder !== 'undefined' ? TextEncoder : function () { this.encode = s => new Uint8Array(String(s).length); };
  W.Uint8Array = Uint8Array; W.ArrayBuffer = ArrayBuffer; W.DataView = DataView; W.Float32Array = Float32Array;
  W.crypto = { getRandomValues: a => a, randomUUID: () => 'x', subtle: null };
  W.fetch = () => Promise.reject(new Error('няма мрежа'));
  W.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] };
  W.SpeechSynthesisUtterance = function () {};
  W.AudioContext = function () {
    this.createOscillator = () => ({ connect() {}, start() {}, stop() {}, type: '', frequency: { value: 0, setValueAtTime() {} } });
    this.createGain = () => ({ connect() {}, gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } });
    this.createBuffer = () => ({ getChannelData: () => new Float32Array(8) });
    this.createBufferSource = () => ({ connect() {}, start() {}, stop() {}, buffer: null, loop: false });
    this.createBiquadFilter = () => ({ connect() {}, type: '', frequency: { value: 0 }, Q: { value: 0 } });
    this.destination = {}; this.currentTime = 0; this.sampleRate = 44100; this.state = 'running';
    this.resume = () => Promise.resolve(); this.suspend = () => Promise.resolve(); this.close = () => Promise.resolve();
  };
  W.webkitAudioContext = W.AudioContext;
  W.print = () => {}; W.open = () => null; W.scrollTo = () => {};
  W.history = { pushState() {}, replaceState() {}, back() {}, state: null };
  W.screen = { width: 375, height: 812, orientation: { type: 'portrait-primary' } };
  W.navigator.vibrate = () => true;
  W.navigator.serviceWorker = { register: () => Promise.reject(new Error('няма')), controller: null, addEventListener() {} };
  W.navigator.storage = { estimate: () => Promise.resolve({ usage: 1, quota: 2 }) };
  W.navigator.onLine = true;
}

// ═══ 5. ПРОЗОРЕЦЪТ ═══
function прозорец() {
  const W = новПрозорец({ склад: Object.assign({}, СКЛАД) });
  допълни(W);
  const непокрити = [];
  for (const f of ВЕРИГА) { const гр = зареди(W, [f]); if (гр) непокрити.push(гр); }
  if (!W.ROOM_FEATURES) throw new Error('ROOM_FEATURES липсва — веригата не се е вдигнала');
  W.__непокрити = непокрити;

  // ловим кой ключ се чете, за да не строим стаи, които не го пипат
  const орГет = W.localStorage.getItem;
  W.__прочетени = null;
  W.localStorage.getItem = function (k) {
    if (W.__прочетени) W.__прочетени.add(String(k));
    return орГет.call(this, k);
  };
  W.Storage.prototype.getItem = W.localStorage.getItem;
  return W;
}

const ВЕРИГА = веригата();

// ═══ 6. ЕДИН СТРОЕЖ НА СТАЯ ═══
// 🪤 Текстът се събира ПО ВЪЗЕЛ, а не с голо textContent: то лепи съседите
//    без интервал и ражда думи-кентаври, които ги няма никъде в текста.
function текстНа(к) {
  const парчета = [];
  (function обходи(в) {
    if (!в) return;
    if (в.nodeType === 3) { парчета.push(String(в.data == null ? '' : в.data)); return; }
    (в.childNodes || []).forEach(обходи);
  })(к);
  return парчета.join(' ');
}

// „undefined"/„null"/„NaN" КАТО ОТДЕЛНА ДУМА пред очите на майката.
// 🪤 БЕЗ `\b` — в кирилица той не работи и мълчи. Явни граници.
const БОКЛУК_ТЕКСТ = /(^|[^A-Za-z0-9_])(undefined|NaN|null)([^A-Za-z0-9_]|$)/;

function построй(W, стая, склад) {
  const док = W.document;
  Object.keys(W.__склад).forEach(k => delete W.__склад[k]);
  Object.keys(склад).forEach(k => { W.__склад[k] = склад[k]; });
  док.body.children.slice().forEach(д => д.remove && д.remove());
  const о = док.createElement('div'); о.id = 'roomOverlay'; о.hidden = false;
  const з = док.createElement('h3'); з.id = 'roTitle'; з.textContent = стая;
  const к = док.createElement('div'); к.id = 'roRoom';
  о.appendChild(з); о.appendChild(к); док.body.appendChild(о);

  const преди = (W.BL_КАРТИ_ГРЕШКИ || []).length;
  let изхвърчала = null, къде = null;
  W.__последенСтек = null;
  try { W.ROOM_FEATURES[стая](к); }
  catch (e) { изхвърчала = (e && e.message) || String(e); къде = (String((e && e.stack) || '').match(/js[\\/][A-Za-z0-9_.-]+\.js:\d+/) || [])[0] || null; }
  const нови = (W.BL_КАРТИ_ГРЕШКИ || []).slice(преди);
  if (!къде) къде = W.__последенСтек;

  const т = текстНа(к);
  return {
    карти: к.children.length,
    трупове: нови.map(g => g.грешка),
    изхвърчала, къде,
    боклукТекст: БОКЛУК_ТЕКСТ.test(т) ? (т.match(БОКЛУК_ТЕКСТ) || [])[2] : null,
    // 🪤 „има undefined някъде" не се поправя — трябва ИЗРЕЧЕНИЕТО, което мама
    //    вижда. Затова се пази прозорче около намереното.
    околоБоклука: (() => {
      const м = т.match(БОКЛУК_ТЕКСТ);
      if (!м) return null;
      const i = т.indexOf(м[0]);
      return т.slice(Math.max(0, i - 45), i + 45).replace(/\s+/g, ' ');
    })(),
    текст: т
  };
}

// ═══ 7. САМОПРОВЕРКА — В ДВЕТЕ ПОСОКИ ═══
// Уред, който не е бил изпитан със СЧУПЕНА карта, е само добро намерение.
// 🪤 ПЪРВАТА МИ ВЕРСИЯ СЛАГАШЕ ДВЕТЕ КАРТИ В ЕДИН ПРОЗОРЕЦ — здравата стоеше
//    НАД счупената и наследяваше нейния труп, тоест „не хваща здравата" се
//    доказваше с изваждане, не с наблюдение. Сега всяка карта е в СВОЙ свят.
function самопроверка() {
  const СТАЯ = 'Лабораторията';
  const КЛЮЧ = 'bl_samoproverka_krivo';

  // ── (а) НАРОЧНО СЧУПЕНА карта: гола `JSON.parse(...).forEach`
  const W1 = прозорец();
  const база1 = W1.ROOM_FEATURES[СТАЯ];
  W1.ROOM_FEATURES[СТАЯ] = function (root) {
    база1(root);
    JSON.parse(W1.localStorage.getItem(КЛЮЧ)).forEach(function () {});
  };
  const чиста1 = построй(W1, СТАЯ, Object.assign({}, СКЛАД, { [КЛЮЧ]: '[]' }));
  const лош = построй(W1, СТАЯ, Object.assign({}, СКЛАД, { [КЛЮЧ]: 'null' }));

  // ── (б) ЗДРАВА карта: същият ключ, същата отрова, но чете по правилото
  //       от `load` в js/rooms.js — проверява ФОРМАТА и пада към празното
  const W2 = прозорец();
  const база2 = W2.ROOM_FEATURES[СТАЯ];
  W2.ROOM_FEATURES[СТАЯ] = function (root) {
    база2(root);
    let v; try { v = JSON.parse(W2.localStorage.getItem(КЛЮЧ)); } catch (e) { v = null; }
    if (!Array.isArray(v)) v = [];
    v.forEach(function () {});
  };
  const чиста2 = построй(W2, СТАЯ, Object.assign({}, СКЛАД, { [КЛЮЧ]: '[]' }));
  const добър = построй(W2, СТАЯ, Object.assign({}, СКЛАД, { [КЛЮЧ]: 'null' }));

  const бр = r => r.трупове.length + (r.изхвърчала ? 1 : 0);
  return {
    хвана: бр(лош) - бр(чиста1) > 0,
    неХвана: бр(добър) - бр(чиста2) === 0,
    подробно: {
      'счупена карта · чиста памет': бр(чиста1),
      'счупена карта · отрова null': бр(лош),
      'здрава карта · чиста памет': бр(чиста2),
      'здрава карта · отрова null': бр(добър)
    }
  };
}

// ═══ 8. ОБХОДЪТ ═══
function главно() {
  const арг = process.argv.slice(2);
  const САМО_КЛЮЧ = (арг.find(a => a.startsWith('--klyuch=')) || '').split('=')[1];
  const ПОДРОБНО = арг.includes('--podrobno');
  const САМО_БАЗА = арг.includes('--baza');

  if (арг.includes('--samoproverka')) {
    const с = самопроверка();
    console.log('\n🧪 САМОПРОВЕРКА НА УРЕДА — В ДВЕТЕ ПОСОКИ\n');
    Object.keys(с.подробно).forEach(k => console.log('   ' + k.padEnd(34) + ' трупове: ' + с.подробно[k]));
    console.log('\n   ' + (с.хвана ? '✅' : '🔴') + ' ХВАЩА нарочно счупена карта (иначе всяка нула е празна)');
    console.log('   ' + (с.неХвана ? '✅' : '🔴') + ' НЕ хваща здравата карта до нея (иначе всяко число е шум)');
    process.exit(с.хвана && с.неХвана ? 0 : 2);
  }

  const W = прозорец();
  const карта = ключовете();
  let КЛЮЧОВЕ = [...карта.keys()].sort();
  if (САМО_КЛЮЧ) КЛЮЧОВЕ = КЛЮЧОВЕ.filter(k => k === САМО_КЛЮЧ);
  const СТАИ = Object.keys(W.ROOM_FEATURES);

  // ── 8а. БАЗА: чиста памет. Всичко тук е МОЙ пропуск, не дефект в проекта.
  const база = {};
  let базовиТрупове = 0;
  for (const с of СТАИ) {
    W.__прочетени = new Set();
    база[с] = построй(W, с, Object.assign({}, СКЛАД));
    база[с].чете = W.__прочетени;
    W.__прочетени = null;
    базовиТрупове += база[с].трупове.length + (база[с].изхвърчала ? 1 : 0);
  }

  console.log('\n☠️  КРИВ ЗАПИС — коя карта умира от отровен запис\n');
  console.log('   ВЕРИГА       : ' + ВЕРИГА.length + ' файла от index.html'
    + (W.__непокрити.length ? '  (не се зареди: ' + W.__непокрити.length + ')' : ''));
  W.__непокрити.forEach(x => console.log('      ⚠ ' + x));
  console.log('   ИЗКЛЮЧЕН     : js/app.js (иска истинския index.html; не пипа ROOM_FEATURES)');
  console.log('\n   ── БАЗА (чиста памет) ──');
  for (const с of СТАИ) console.log('      ' + с.padEnd(18) + String(база[с].карти).padStart(3) + ' карти'
    + (база[с].трупове.length ? '   🔴 базови трупове: ' + база[с].трупове.length : '')
    + (база[с].боклукТекст ? '   🟠 „' + база[с].боклукТекст + '" в текста' : ''));
  console.log('      ' + (базовиТрупове ? '🔴 БАЗАТА НЕ Е ЧИСТА (' + базовиТрупове + ') — това са МОИ пропуски в DOM-а, не находки'
    : '✅ базата е чиста: 0 трупа при здрава памет'));
  if (САМО_БАЗА) return 0;

  // ── 8б. кой ключ коя стая пипа (НАБЛЮДАВАНО, не предположено) ──
  const стаиНа = k => {
    const с = СТАИ.filter(x => база[x].чете.has(k));
    return с.length ? с : СТАИ;      // не се чете при строене → пробваме навсякъде
  };
  const четени = КЛЮЧОВЕ.filter(k => СТАИ.some(x => база[x].чете.has(k)));

  // ── 8в. ОТРОВИТЕ ──
  const находки = [];
  let строежи = 0, комбинации = 0;
  for (const k of КЛЮЧОВЕ) {
    const мои = стаиНа(k);
    for (const [име, стойност] of ОТРОВИ) {
      комбинации++;
      for (const с of мои) {
        строежи++;
        const склад = Object.assign({}, СКЛАД);
        склад[k] = стойност;
        const преди = склад[k];
        const r = построй(W, с, склад);
        const трупове = r.трупове.length + (r.изхвърчала ? 1 : 0) - (база[с].трупове.length + (база[с].изхвърчала ? 1 : 0));
        const празна = r.карти === 0 && база[с].карти > 0;
        const бокл = r.боклукТекст && !база[с].боклукТекст ? r.боклукТекст : null;
        // ♻️ разпространение: приложението е ПРЕПИСАЛО кривото обратно
        const след = W.__склад[k];
        let разпр = null;
        if (след !== undefined && след !== преди) {
          let ок = true;
          try { const v = JSON.parse(след); if (v === null || (Array.isArray(v) && v.some(x => x === null))) ок = false; }
          catch (e) { ок = false; }
          if (!ок) разпр = String(след).slice(0, 40);
        }
        if (трупове > 0 || празна || бокл || разпр) {
          находки.push({
            ключ: k, форма: име, стая: с, трупове: Math.max(0, трупове), празна, бокл, разпр,
            около: r.околоБоклука,
            карти: r.карти, база: база[с].карти,
            грешка: (r.изхвърчала || r.трупове[r.трупове.length - 1] || '').slice(0, 90),
            къде: r.къде || '?',
            файлове: [...(карта.get(k) || [])].join(', ')
          });
        }
      }
    }
  }

  // ── 8г. ДОКЛАД ──
  console.log('\n   ── КОЛКО Е ПРОБВАНО ──');
  console.log('      КЛЮЧОВЕ           : ' + КЛЮЧОВЕ.length + '  (извлечени от ' + МОИ.length + ' мои файла + '
    + Object.keys(ДОПЪЛНИТЕЛНИ).length + ' известни виновника отвън: ' + Object.keys(ДОПЪЛНИТЕЛНИ).join(', ') + ')');
  console.log('      от тях се ЧЕТАТ при строене на стая: ' + четени.length
    + '   · останалите ' + (КЛЮЧОВЕ.length - четени.length) + ' се четат чак при натискане → пробвани във ВСИЧКИ стаи');
  console.log('      ФОРМИ НА ОТРОВА   : ' + ОТРОВИ.length);
  console.log('      КОМБИНАЦИИ        : ' + комбинации + '  (ключ × форма)');
  console.log('      СТРОЕЖА НА СТАИ   : ' + строежи);

  const умрели = находки.filter(f => f.трупове > 0);
  const празни = находки.filter(f => f.празна);
  const боклуци = находки.filter(f => f.бокл);
  const разпр = находки.filter(f => f.разпр);

  console.log('\n   ── НАМЕРЕНО ──');
  console.log('      💀 УМРЕЛИ КАРТИ (гръмнала брънка) : ' + умрели.length + ' случая · '
    + new Set(умрели.map(f => f.ключ)).size + ' ключа · ' + new Set(умрели.map(f => f.стая)).size + ' стаи');
  console.log('      ⬛ ПРАЗНА СТАЯ (0 карти)          : ' + празни.length);
  console.log('      🟠 „undefined/null/NaN" в текста  : ' + боклуци.length);
  console.log('      ♻️ КРИВОТО СЕ ПРЕПИСВА обратно    : ' + разпр.length);

  const покажи = (заглавие, списък, огр) => {
    if (!списък.length) return;
    console.log('\n   ── ' + заглавие + ' ──');
    // сгъваме по (ключ, стая, грешка) — иначе 17 форми правят 17 еднакви реда
    const групи = new Map();
    for (const f of списък) {
      const ид = f.ключ + '|' + f.стая + '|' + f.грешка;
      if (!групи.has(ид)) групи.set(ид, { ...f, форми: [] });
      групи.get(ид).форми.push(f.форма);
    }
    const общо = [...групи.values()];
    (ПОДРОБНО ? общо : общо.slice(0, огр)).forEach(g => {
      console.log('      ' + g.ключ.padEnd(20) + ' [' + g.стая + ']  ' + g.карти + '/' + g.база + ' карти'
        + (g.къде && g.къде !== '?' ? '   ⟵ ' + g.къде : ''));
      console.log('         форми: ' + g.форми.join(' · '));
      if (g.грешка) console.log('         ↯ ' + g.грешка);
      if (g.около) console.log('         🟠 „…' + g.около + '…"');
      if (g.файлове) console.log('         ключът се среща в: ' + g.файлове);
    });
    if (!ПОДРОБНО && общо.length > огр) console.log('      … още ' + (общо.length - огр) + ' — с --podrobno');
  };

  покажи('💀 УМРЕЛИ КАРТИ', умрели, 30);
  покажи('⬛ ПРАЗНИ СТАИ', празни, 15);
  покажи('🟠 БОКЛУК В ТЕКСТА', боклуци, 15);
  покажи('♻️ РАЗПРОСТРАНЕНИЕ', разпр, 15);

  const с = самопроверка();
  console.log('\n   ── САМОПРОВЕРКА (иначе нулите не значат нищо) ──');
  console.log('      ' + (с.хвана ? '✅' : '🔴') + ' уредът ХВАЩА нарочно счупена карта');
  console.log('      ' + (с.неХвана ? '✅' : '🔴') + ' уредът НЕ хваща здравата карта до нея');
  if (!с.хвана || !с.неХвана) { console.log('\n   🔴 САМОПРОВЕРКАТА ПАДА — числата горе НЕ ВАЖАТ.'); return 2; }

  console.log('\n   ' + (умрели.length || празни.length ? '🔴 ИМА УМРЕЛИ КАРТИ' : '✅ НИТО ЕДНА КАРТА НЕ УМИРА ОТ ОТРОВЕН ЗАПИС'));
  return 0;
}

// Двигателят се дава назаем (пясъчникът + шимовете са скъпи да се пишат пак).
module.exports = { прозорец, построй, текстНа, СКЛАД, ВЕРИГА, ОТРОВИ, ключовете };

if (require.main === module) process.exitCode = главно();
