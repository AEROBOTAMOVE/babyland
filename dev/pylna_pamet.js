// ═══════════════════════════════════════════════════════════
// 💾 ПЪЛНА ПАМЕТ — натиска едно и също нещо ДВА пъти и сравнява
//
// ЗАЩО (25.08.2026): dev/lazhliv_uspeh.js чете КОДА и казва къде отговорът на
// записа се хвърля. Той обаче не може да каже дали поправката РАБОТИ — а
// „поправено" без наблюдение е предположение. Тук всяко пипаемо нещо се
// натиска НАИСТИНА, в два свята:
//
//     СВЯТ 1 · НОРМАЛНО      localStorage приема  → успехът трябва ДА СЕ ВИДИ,
//                                                    полето трябва ДА СЕ ИЗЧИСТИ
//     СВЯТ 2 · ПЪЛНА ПАМЕТ   setItem хвърля        → успехът НЕ БИВА да се вижда,
//                            QuotaExceededError      полето НЕ БИВА да се чисти
//
// Уред, който мери само единия свят, не мери нищо: „✔ Записано" излиза и в
// двата случая, ако никой не пита втория.
//
// 🪤 КАПАНИТЕ, ЗАРАДИ КОИТО Е НАПРАВЕН ТАКА:
//   · МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. `--samoproverka` вкарва
//     нарочно счупена карта (голо `save` + „✔ Записано" + изчистено поле) и
//     иска уредът ДА Я ХВАНЕ; и втора, здрава, която НЕ бива да хване.
//     Падне ли която и да е от двете → изход 2 и числата долу не важат.
//   · „0 находки" без брой ПРЕГЛЕДАНИ значи „0 прегледани". Затова се печата
//     колко неща са натиснати и колко НЕ са стигнали до мерене.
//   · Сравнява се РАЗЛИКАТА преди/след натискането, не крайното състояние:
//     „✔" може вече да е било на екрана преди тапа.
//   · Всяко нещо се натиска в ЧИСТА стая с ЧИСТА памет — иначе съседният
//     бутон обяснява чуждия резултат.
//   · Изключение в слушател се ЛОВИ и се брои: пазач, който гърми, е мълчалив
//     пазач. (Точно така се хвана `НЕ_СЕ_ПОБРА` в women5.js — име, което го
//     няма във файла, викано САМО по пътя при пълна памет.)
//   · CRLF: никъде няма split('\n').
//
// ПУСКАНЕ:
//   node dev/pylna_pamet.js                 — целият обход
//   node dev/pylna_pamet.js --samoproverka  — уредът се изпитва В ДВЕТЕ ПОСОКИ
//   node dev/pylna_pamet.js --staya="Дневник на мама"
//   node dev/pylna_pamet.js --podrobno      — ред за всяко измерено нещо
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. localStorage е обикновен обект в
//   паметта на Node — нула следи по диска. Изтрий го и нищо не се променя.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

// Миниатюрният DOM е вече написан и изпитан в dev/interaktivno_jenata.js —
// вземаме двигателя оттам, вместо да пишем втори (и да се разминат).
const { новПрозорец, зареди } = require('./interaktivno_jenata.js');

// ═══ редът на зареждане е РЕДЪТ ОТ index.html (сверен с grep 'script src') ═══
const ВЕРИГА = [
  'js/redna.js', 'js/broi.js', 'js/store.js', 'js/sleephist.js', 'js/expect.js',
  'js/kb.js', 'js/data.js', 'js/rooms.js', 'js/pazach_karti.js', 'js/tayni.js',
  'js/rooms2.js', 'js/pump.js', 'js/checkups.js', 'js/articles.js', 'js/reader.js',
  'js/lib.js', 'js/extras.js', 'js/extras2.js', 'js/photos.js', 'js/storage.js',
  'js/daily.js', 'js/quickadd.js', 'js/games2.js', 'js/wisdom.js', 'js/wisdom2.js',
  'js/expr.js', 'js/rooms3.js', 'js/rooms4.js', 'js/river.js', 'js/yearbook.js',
  'js/badges2.js', 'js/yearbook2.js', 'js/rooms5.js', 'js/search.js',
  'js/women.js', 'js/women2.js', 'js/women3.js', 'js/women4.js', 'js/women5.js',
  'js/lab.js', 'js/obichai.js', 'js/rooms6.js', 'js/rooms7.js', 'js/rooms8.js',
  'js/rooms9.js', 'js/rooms10.js', 'js/rooms11.js', 'js/rooms12.js', 'js/rooms13.js',
  'js/rooms14.js', 'js/rooms19.js', 'js/baby2.js', 'js/sos.js', 'js/journal.js',
  'js/dev.js', 'js/preg.js', 'js/order4.js', 'js/order8.js', 'js/order9.js',
  'js/preg20.js', 'js/dates2.js', 'js/printbox.js', 'js/shop.js', 'js/profile.js'
];

// стаите, в които живеят МОИТЕ файлове
// имената са ВЗЕТИ ОТ КОДА (ключовете на ROOM_FEATURES и на ПАКЕТИ в
// rooms8–13), не от паметта ми — сгрешено име дава тихо „0 прегледани".
const СТАИ = [
  'Дневник на мама', 'Моето бебе', 'Развитие и игри', 'Захранване',
  'Здраве и SOS', 'Жената в мен', 'Бременност', 'Инструменти', 'Лабораторията'
];

// ═══ какво значи „приложението каза, че е станало" ═══
// Същите думи като в dev/lazhliv_uspeh.js, за да мерят двата уреда едно и също.
const УСПЕХ_ТЕКСТ = /✔|✅|Запечат|Заключен|Записано|Записах|Запазено|запазено|Прибрано|Прибрах|Готово|Добавено|Добавих|Махнато|Махнах|Промених|В календара|Добре дошл/i;

const ПРОБЕН = 'ТЕСТМАМА';          // текстът, който „мама" пише в полетата
const ПРОБНА_ДАТА = '2026-08-20';
const СКЛАД = {                     // минимален профил, за да не са празни стаите
  bl_mama: JSON.stringify({ name: 'Ани', emoji: '🌸', d: '2026-08-01' }),
  bl_baby: JSON.stringify({ name: 'Мими', birth: '2026-04-01', sex: 'girl' }),
  bl_onboarded: 'true'
};

const арг = process.argv.slice(2);
const САМО = (арг.find(a => a.startsWith('--staya=')) || '').split('=')[1];
const ПОДРОБНО = арг.includes('--podrobno');
const САМОПРОВЕРКА = арг.includes('--samoproverka');

// ── помощници по DOM ──
const всичкиВъзли = корен => {
  const вън = [];
  (function обходи(в) {
    if (!в || !в.children) return;
    [...в.children].forEach(д => { вън.push(д); обходи(д); });
  })(корен);
  return вън;
};
const тагът = в => String((в && в.tagName) || '').toUpperCase();
const полета = корен => всичкиВъзли(корен).filter(в => тагът(в) === 'INPUT' || тагът(в) === 'TEXTAREA');
const бутони = корен => всичкиВъзли(корен).filter(в => тагът(в) === 'BUTTON');
const текстНа = к => { try { return String(к.textContent || ''); } catch (e) { return ''; } };
const снимкаПолета = к => полета(к).map(п => String(п.value == null ? '' : п.value));

// ── ловим изключенията от слушателите (двигателят ги гълта в своя частен списък) ──
const ГРЕШКИ = [];
function прихвани(док) {
  const прото = Object.getPrototypeOf(док.createElement('div'));
  if (прото.__пълнаПаметЛовец) return;
  прото.__пълнаПаметЛовец = true;
  // ── кой ФАЙЛ е закачил слушателя ──
  // Без това уредът казва само „стая Х, бутон У" — а стаята се сглобява от
  // 8-10 файла на различни отряди и находката увисва без адрес. Стекът при
  // закачането го знае: vm.Script е зареден с filename 'js/….js'.
  const оригAdd = прото.addEventListener;
  прото.addEventListener = function (т, f) {
    if (f && !f.__файл) {
      const с = (new Error()).stack || '';
      const m = с.match(/js[\\/][A-Za-z0-9_.-]+\.js/);
      try { f.__файл = m ? m[0].replace(/\\/g, '/') : '?'; } catch (e) {}
    }
    return оригAdd.call(this, т, f);
  };
  прото.dispatch = function (тип, доп) {
    const съб = Object.assign({
      type: тип, target: this, currentTarget: this, defaultPrevented: false, __стоп: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.__стоп = true; },
      stopImmediatePropagation() { this.__стоп = true; }
    }, доп || {});
    let н = this;
    while (н) {
      съб.currentTarget = н;
      const сл = н.__слушатели && н.__слушатели[тип];
      if (сл) for (const f of сл.slice()) {
        try { f.call(н, съб); }
        catch (e) { ГРЕШКИ.push(e.name + ': ' + e.message); }
      }
      if (съб.__стоп) break;
      н = н.parentNode;
    }
    return съб;
  };
}

// ═══════════════════════════════════════════════════════════
// ЕДИН ПРОЗОРЕЦ ЗА СТАЯ × СВЯТ; чиста стая и чиста памет за всяко натискане
// ═══════════════════════════════════════════════════════════
// Двигателят е писан за петте файла на стая 8. Цялата верига пипа още няколко
// браузърни имена — добавят се тук, а НЕ в чуждия файл, за да не му мърдам
// измерванията. Всяко от тях е сложено, защото зареждането падна на него.
function допълни(W) {
  const прото = Object.getPrototypeOf(W.document.createElement('div'));
  W.Storage = function () {};
  W.Storage.prototype = Object.getPrototypeOf(W.localStorage) || {};
  W.Storage.prototype.setItem = W.localStorage.setItem;
  W.Storage.prototype.getItem = W.localStorage.getItem;
  W.Storage.prototype.removeItem = W.localStorage.removeItem;
  // 🪤 Липсващо парче от миниатюрния DOM/стъбовете НЕ е дефект в приложението —
  //    затова се допълва тук. Иначе уредът щеше да обяви СВОЯ пропуск за находка.
  if (!прото.after) прото.after = function (...в) { const p = this.parentNode; if (!p) return; let сл = this.nextSibling; в.forEach(n => p.insertBefore(n, сл)); };
  if (!прото.before) прото.before = function (...в) { const p = this.parentNode; if (!p) return; в.forEach(n => p.insertBefore(n, this)); };
  if (!прото.replaceWith) прото.replaceWith = function (...в) { const p = this.parentNode; if (!p) return; в.forEach(n => p.insertBefore(n, this)); p.removeChild(this); };
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
  W.Uint8Array = Uint8Array; W.ArrayBuffer = ArrayBuffer; W.DataView = DataView;
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
  W.print = () => {};
  W.open = () => null;
  W.scrollTo = () => {};
  W.history = { pushState() {}, replaceState() {}, back() {}, state: null };
  W.screen = { width: 375, height: 812, orientation: { type: 'portrait-primary' } };
  if (!W.navigator.share) W.navigator.vibrate = () => true;
  W.navigator.serviceWorker = { register: () => Promise.reject(new Error('няма')), controller: null, addEventListener() {} };
  W.navigator.storage = { estimate: () => Promise.resolve({ usage: 1, quota: 2 }) };
  W.navigator.onLine = true;
}

function прозорец(бездънно) {
  const W = новПрозорец({ склад: Object.assign({}, СКЛАД), бездънно });
  допълни(W);
  const гр = зареди(W, ВЕРИГА);
  if (гр) throw new Error('зареждането падна: ' + гр);
  прихвани(W.document);
  return W;
}

async function построй(W, стая) {
  // чиста памет за всяко натискане
  Object.keys(W.__склад).forEach(k => delete W.__склад[k]);
  Object.keys(СКЛАД).forEach(k => { W.__склад[k] = СКЛАД[k]; });
  const док = W.document;
  док.body.children.slice().forEach(д => д.remove && д.remove());
  const овърлей = док.createElement('div'); овърлей.id = 'roomOverlay'; овърлей.hidden = false;
  const загл = док.createElement('h3'); загл.id = 'roTitle'; загл.textContent = стая;
  const корен = док.createElement('div'); корен.id = 'roRoom';
  овърлей.appendChild(загл); овърлей.appendChild(корен); док.body.appendChild(овърлей);
  const строй = W.ROOM_FEATURES && W.ROOM_FEATURES[стая];
  if (!строй) return null;
  строй(корен);
  await W.__тик(60);
  // мама пише във всяко празно поле (без събитие — иначе тапът се смесва с писането)
  полета(корен).forEach(п => {
    if (String(п.value || '').trim()) return;
    п.value = String(п.type) === 'date' ? ПРОБНА_ДАТА : ПРОБЕН;
  });
  return корен;
}

// натиска нещо №n (бутон, или поле, ако е от списъка с полета) и връща РАЗЛИКАТА
async function натисни(W, стая, вид, n) {
  const корен = await построй(W, стая);
  if (!корен) return null;
  const цели = вид === 'поле' ? полета(корен) : бутони(корен);
  const ц = цели[n];
  if (!ц) return null;
  const надпис = (вид === 'поле'
    ? ('поле „' + String(ц.placeholder || ц.getAttribute && ц.getAttribute('aria-label') || '').slice(0, 34) + '"')
    : (текстНа(ц).trim().slice(0, 40) || '(без надпис)'));

  const тип = вид === 'поле' ? 'input' : 'click';
  const файлове = [...new Set(((ц.__слушатели && ц.__слушатели[тип]) || []).map(f => f.__файл || '?'))].join('+') || '—';

  const предиТекст = текстНа(корен);
  const предиПолета = снимкаПолета(корен);
  ГРЕШКИ.length = 0;
  if (вид === 'поле') { ц.value = ПРОБЕН + '2'; ц.dispatch('input', {}); }
  else ц.click();
  await W.__тик(3000);

  const следТекст = текстНа(корен);
  const следПолета = снимкаПолета(корен);
  const ново = следТекст.split(/\s+/).filter(д => д && предиТекст.indexOf(д) < 0).join(' ');
  // BL_DEBUG="част от надписа" node dev/pylna_pamet.js  → показва КАКВО е сметнал
  if (process.env.BL_DEBUG && надпис.indexOf(process.env.BL_DEBUG) >= 0) {
    console.log('   ⟨debug⟩ ' + (W.__склад.__бездънно === undefined ? '' : '') + надпис
      + '\n      ново: ' + ново.slice(0, 400)
      + '\n      успех: ' + УСПЕХ_ТЕКСТ.test(ново));
  }
  return {
    надпис, файлове,
    успех: УСПЕХ_ТЕКСТ.test(ново),
    изчистено: предиПолета.some((в, i) => в && в.trim() && !(следПолета[i] || '').trim()),
    гърми: ГРЕШКИ.slice(0, 1)[0] || null
  };
}

// ═══════════════════════════════════════════════════════════
// ОБХОДЪТ
// ═══════════════════════════════════════════════════════════
async function обходи() {
  const падания = [], гърмежи = [], неизмерени = [];
  let натиснати = 0, стаиОК = 0, обещаващи = 0;

  for (const стая of СТАИ) {
    if (САМО && стая !== САМО) continue;
    let Wн, Wк;
    try { Wн = прозорец(true); Wк = прозорец(false); }
    catch (e) { неизмерени.push(стая + ' · ' + e.message); continue; }
    let корен;
    try { корен = await построй(Wн, стая); }
    catch (e) { неизмерени.push(стая + ' · строеж → ' + e.message); continue; }
    if (!корен) { неизмерени.push(стая + ' · няма такава стая в ROOM_FEATURES'); continue; }
    const броеве = { бутон: бутони(корен).length, поле: полета(корен).length };
    if (!броеве.бутон && !броеве.поле) { неизмерени.push(стая + ' · нула пипаеми неща'); continue; }
    стаиОК++;

    for (const вид of ['бутон', 'поле']) {
      for (let i = 0; i < броеве[вид]; i++) {
        let н, к;
        try { н = await натисни(Wн, стая, вид, i); } catch (e) { неизмерени.push(стая + ' ' + вид + ' #' + i + ' → ' + e.message); continue; }
        try { к = await натисни(Wк, стая, вид, i); } catch (e) { неизмерени.push(стая + ' ' + вид + ' #' + i + ' (квота) → ' + e.message); continue; }
        if (!н || !к) continue;
        // 🪤 ПОДРЕЖДАНЕТО МОЖЕ ДА СЕ РАЗМИНЕ. Някои карти пишат в паметта още
        //    ПРИ РИСУВАНЕ (markDay, брояч на посещения). В света с пълна памет
        //    тези записи падат и стаята се строи мъничко различно — тогава
        //    „бутон №7" в двата свята е РАЗЛИЧЕН бутон и сравнението е между
        //    ябълка и круша. Ако надписите не съвпадат, не мерим: по-добре
        //    „неизмерено" (и да се вижда), отколкото измислена находка.
        if (н.надпис !== к.надпис) {
          неизмерени.push(стая + ' · ' + вид + ' #' + i + ' · подредбата се размина („'
            + н.надпис + '" срещу „' + к.надпис + '")');
          continue;
        }
        натиснати++;
        if (к.гърми) гърмежи.push(стая + ' · ' + к.надпис + ' → при ПЪЛНА ПАМЕТ гърми: ' + к.гърми);
        const обещава = н.успех || н.изчистено;
        if (!обещава) continue;
        обещаващи++;
        if (к.успех || к.изчистено) {
          падания.push({
            файл: н.файлове,
            къде: стая + ' · ' + вид + ' „' + н.надпис + '"',
            какво: [к.успех ? 'обявява успех при ПЪЛНА ПАМЕТ' : null,
                    к.изчистено ? 'ЧИСТИ ПОЛЕТО при ПЪЛНА ПАМЕТ' : null].filter(Boolean).join(' + ')
          });
        } else if (ПОДРОБНО) {
          console.log('     ✅ ' + н.файлове + ' · ' + стая + ' · ' + н.надпис + ' — нормално: '
            + (н.успех ? 'казва „стана" ' : '') + (н.изчистено ? '+ чисти поле' : '')
            + ' · пълна памет: мълчи и пази');
        }
      }
    }
  }
  return { падания, гърмежи, неизмерени, натиснати, стаиОК, обещаващи };
}

// ═══════════════════════════════════════════════════════════
// САМОПРОВЕРКА В ДВЕТЕ ПОСОКИ — без нея числата долу не значат нищо.
// Прави се върху ИЗКУСТВЕНА карта, не върху проекта: нищо не се пипа.
// ═══════════════════════════════════════════════════════════
const ПРОБНА_КАРТА = счупена => `
  window.__ПРОБА = function (root, document) {
    var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
    var поле = document.createElement('textarea');
    var б = document.createElement('button'); б.textContent = 'Запиши';
    var вест = document.createElement('p');
    б.addEventListener('click', function () {
      ${счупена
      ? "save('bl_proba', поле.value); поле.value = ''; вест.textContent = 'Записано';"
      : "if (!save('bl_proba', поле.value)) { вест.textContent = 'Не можах да го запазя.'; return; } поле.value = ''; вест.textContent = 'Записано';"}
    });
    root.appendChild(поле); root.appendChild(б); root.appendChild(вест);
  };`;

async function самопроверка() {
  const редове = [];
  for (const [счупена, очаква, име] of [
    [true, true, 'ХВАЩА счупеното (голо save + „Записано" + изчистено поле)'],
    [false, false, 'ПРОПУСКА здравото (проверен отговор → мълчи и пази полето)']
  ]) {
    const мери = async бездънно => {
      const W = новПрозорец({ склад: {}, бездънно });
      прихвани(W.document);
      new vm.Script(ПРОБНА_КАРТА(счупена), { filename: 'проба.js' }).runInContext(W);
      const к = W.document.createElement('div');
      W.document.body.appendChild(к);
      W.__ПРОБА(к, W.document);
      полета(к).forEach(п => { п.value = ПРОБЕН; });
      const предиТ = текстНа(к), предиП = снимкаПолета(к);
      ГРЕШКИ.length = 0;
      бутони(к)[0].click();
      await W.__тик(100);
      const ново = текстНа(к).split(/\s+/).filter(д => д && предиТ.indexOf(д) < 0).join(' ');
      const следП = снимкаПолета(к);
      return {
        успех: УСПЕХ_ТЕКСТ.test(ново),
        изчистено: предиП.some((в, i) => в && в.trim() && !(следП[i] || '').trim())
      };
    };
    const н = await мери(true), к = await мери(false);
    const обещава = н.успех || н.изчистено;
    const хванато = обещава && (к.успех || к.изчистено);
    редове.push([хванато === очаква, (очаква ? 'ХВАЩА   ' : 'ПРОПУСКА') + ' ' + име,
      'нормално: ' + (н.успех ? 'успех ' : '') + (н.изчистено ? 'чисти' : '') +
      ' · пълна памет: ' + (к.успех ? 'успех ' : '') + (к.изчистено ? 'чисти' : '') || 'мълчи']);
  }
  return редове;
}

(async () => {
  console.log('💾 ПЪЛНА ПАМЕТ — едно натискане, два свята\n');

  const сп = await самопроверка();
  console.log('  САМОПРОВЕРКА (иначе числата долу не значат нищо):');
  сп.forEach(([ок, т, д]) => console.log('     ' + (ок ? '✅' : '🔴') + ' ' + т + '\n          ' + д));
  if (сп.some(([ок]) => !ок)) {
    console.log('\n  🔴 САМОПРОВЕРКАТА ПАДНА — уредът е сляп, числата долу не важат.');
    process.exit(2);
  }
  if (САМОПРОВЕРКА) process.exit(0);

  const р = await обходи();
  console.log('\n  ПРЕГЛЕДАНИ СТАИ    : ' + р.стаиОК);
  console.log('  НАТИСНАТИ НЕЩА     : ' + р.натиснати + '   (× 2 свята = ' + (р.натиснати * 2) + ' натискания)');
  console.log('  ОТ ТЯХ ОБЕЩАВАЩИ   : ' + р.обещаващи + '   (в нормален свят казват „стана" или чистят поле)');
  console.log('  ' + (р.падания.length ? '🔴' : '✅') + ' ЛЪЖАТ ПРИ ПЪЛНА ПАМЕТ: ' + р.падания.length);
  console.log('  ' + (р.гърмежи.length ? '🔴' : '✅') + ' ГЪРМЯТ ПРИ ПЪЛНА ПАМЕТ: ' + р.гърмежи.length + '\n');
  const поФайл = {};
  р.падания.forEach(п => { (поФайл[п.файл] = поФайл[п.файл] || []).push(п); });
  console.log('  ПО ФАЙЛ:');
  Object.keys(поФайл).sort((a, b) => поФайл[b].length - поФайл[a].length)
    .forEach(ф => console.log('     ' + String(поФайл[ф].length).padStart(3) + '  ' + ф));
  console.log('');
  р.падания.forEach(п => console.log('  🔴 ' + п.файл + '  ·  ' + п.къде + '\n        ' + п.какво));
  [...new Set(р.гърмежи)].forEach(г => console.log('  🔴 ' + г));
  if (р.неизмерени.length) {
    console.log('\n  ⚪ НЕИЗМЕРЕНИ (уредът не стигна дотам — това НЕ е зелено):');
    [...new Set(р.неизмерени)].slice(0, 25).forEach(г => console.log('     · ' + г));
  }
  process.exit(р.падания.length || р.гърмежи.length ? 1 : 0);
})();
