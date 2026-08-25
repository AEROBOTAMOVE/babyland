// ═══════════════════════════════════════════════════════════
// 📓 БРОЯЧИТЕ НА ДНЕВНИКА — където се губят ЗАПИСИТЕ на мама
//
// ЗАЩО СЪЩЕСТВУВА (25.08):
//   dev/broyachi.js вече лови РАЗМИНАВАНЕТО между два екрана („5 дни поред“
//   срещу „0 дни поред“). Този уред гледа другата половина на същата беда:
//   не какво ПОКАЗВА приложението, а какво ЗАПИСВА.
//     · запис, който не оцелява презареждане;
//     · „Прибрано ✔“ върху нищо (пълна памет → тих провал);
//     · дневен брояч, който полунощ изяжда, преди историята да го е взела;
//     · история без таван — един ден твърде голяма за паметта;
//     · два ключа-двойника, четени по различна формула.
//
// КАКВО ПРАВИ (5 прохода, всеки казва КОЛКО е прегледал):
//   П1 ИНВЕНТАР   — 28 елемента с АНКЪР в кода. Липсва ли анкър → гръм,
//                   не мълчание (елементът се е преместил, уредът е сляп).
//                   + регекс-обход: всеки bl_ ключ в моите файлове ТРЯБВА да
//                   е в таблицата, иначе „непознат елемент“.
//   П2 ЧУЖДИ ЧЕТЦИ — същите ключове в останалите 90 файла, един до друг.
//   П3 ТАВАНИ      — колко записа пази всеки списък и кой ги реже.
//   П4 ЖИВО        — истинският код на pump.js / quickadd.js / sleephist.js
//                    се пуска във vm с мъничък ДОМ и подвижен часовник:
//                    · пише ли · оцелява ли презареждане · какво казва при
//                    ПЪЛНА памет · какво става при преминаване през полунощ
//                    БЕЗ презареждане · разминават ли се двете числа за
//                    „сън днес“ (моето срещу картата в rooms2.js).
//   П5 САМОПРОВЕРКА — уредът се пуска срещу нарочно СЧУПЕНИ копия. Не
//                    гръмне ли там, целият доклад е невалиден (изход 2).
//
// 🪤 КАПАНИТЕ, заради които такъв уред обикновено лъже:
//   1. „0 находки“ без брой прегледани = 0 прегледани → всеки проход брои.
//   2. Мярка, която не може да гръмне, не мери → П5 в ДВЕТЕ посоки.
//   3. Часови пояс: никъде `new Date('2026-08-25')` (UTC полунощ). Всички
//      дати се строят с `new Date(г, м, д, 12)` и се форматират като
//      приложението (localDate).
//   4. Кирилица: няма нито един `\b` в регексите.
//   5. CRLF: всяко четене минава през `чети()`, което ги маха.
//
// ПУСКАНЕ: node dev/broyachi_dnevnik.js          (пълен доклад)
//          node dev/broyachi_dnevnik.js --tiho   (само находките)
// ИЗХОД:   0 = чисто · 1 = находки/гръм · 2 = самопроверката падна
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Не пише нищо в js/.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');
const ТИХО = process.argv.includes('--tiho');

const чети = отн => fs.readFileSync(path.join(КОРЕН, отн), 'utf8').replace(/\r\n/g, '\n');
const п = (...a) => { if (!ТИХО) console.log(...a); };

let НАХОДКИ = [];
let ГРЪМНАЛИ = [];
let ЗНАНИЕ = [];        // измерено, но НЕ е дефект — печата се, не вали присъдата
const находка = (клас, текст, къде) => НАХОДКИ.push({ клас, текст, къде: къде || '' });
const знание = (текст, къде) => ЗНАНИЕ.push({ текст, къде: къде || '' });
const гръм = т => ГРЪМНАЛИ.push(т);

// колко е прегледано — числото до всяко „0 находки“
const БРОЙ = {
  файлове: 0, редове: 0, елементи: 0, анкъри: 0, ключове: 0,
  чуждиМеста: 0, живиМерки: 0, състояния: 0, самопроверки: 0, датиМеста: 0
};

const МОИ = ['journal.js', 'broi.js', 'sleephist.js', 'pump.js', 'quickadd.js', 'expr.js'];

function живиФайлове() {
  return fs.readdirSync(path.join(КОРЕН, 'js'))
    .filter(f => f.endsWith('.js'))
    .filter(f => !/\.ARCHIVE\.js$|\.PREDI|\.BAK/.test(f));
}

// ═══════════════════════════════════════════════════════════
// ДАТИ — местен календарен ден, точно както ги смята приложението
// ═══════════════════════════════════════════════════════════
const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function денНазад(n, база) {
  const б = база || new Date();
  return localDate(new Date(б.getFullYear(), б.getMonth(), б.getDate() - n, 12, 0, 0));
}
const J = o => JSON.stringify(o);

// ═══════════════════════════════════════════════════════════
// МЪНИЧЪК ДОМ — колкото да проходи истинският код на картите
// ═══════════════════════════════════════════════════════════
function правиДОМ(W) {
  function Възел(tag) {
    this.tagName = String(tag || 'div').toUpperCase();
    this.children = []; this.parentNode = null;
    this._html = ''; this._text = null;
    this.style = {}; this.dataset = {}; this.attrs = {}; this.__h = {};
    this.hidden = false; this.value = ''; this.files = [];
    this.id = ''; this.className = ''; this.type = ''; this.isConnected = true;
    const s = this;
    this.classList = {
      add() { [].forEach.call(arguments, c => { if (s._кл().indexOf(c) < 0) s.className = (s.className + ' ' + c).trim(); }); },
      remove() { const м = [].slice.call(arguments); s.className = s._кл().filter(x => м.indexOf(x) < 0).join(' '); },
      contains: c => s._кл().indexOf(c) >= 0,
      toggle(c, вкл) { const има = s._кл().indexOf(c) >= 0; const иска = вкл === undefined ? !има : !!вкл; if (иска) this.add(c); else this.remove(c); }
    };
  }
  Възел.prototype._кл = function () { return String(this.className || '').split(/\s+/).filter(Boolean); };
  Object.defineProperty(Възел.prototype, 'innerHTML', {
    get() { return this._html; },
    set(v) { this._html = String(v == null ? '' : v); this._text = null; this.children = []; }
  });
  Object.defineProperty(Възел.prototype, 'textContent', {
    get() {
      const свой = this._text != null ? this._text : String(this._html).replace(/<[^>]*>/g, '');
      return свой + this.children.map(c => c.textContent).join('');
    },
    set(v) { this._text = String(v == null ? '' : v); this._html = this._text; this.children = []; }
  });
  Възел.prototype.appendChild = function (n) { n.parentNode = this; this.children.push(n); return n; };
  Възел.prototype.insertAdjacentHTML = function (_, h) { this._html += h; };
  Възел.prototype.removeChild = function (n) { const i = this.children.indexOf(n); if (i > -1) this.children.splice(i, 1); return n; };
  Възел.prototype.remove = function () { if (this.parentNode) this.parentNode.removeChild(this); };
  Възел.prototype.replaceWith = function () {};
  Възел.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); };
  Възел.prototype.getAttribute = function (k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; };
  Възел.prototype.removeAttribute = function (k) { delete this.attrs[k]; };
  Възел.prototype.addEventListener = function (t, f) { (this.__h[t] = this.__h[t] || []).push(f); };
  Възел.prototype.removeEventListener = function (t, f) { const a = this.__h[t] || []; const i = a.indexOf(f); if (i > -1) a.splice(i, 1); };
  Възел.prototype._пусни = function (t, съб) {
    const e = съб || {}; e.type = t; e.target = this; e.preventDefault = e.preventDefault || function () {};
    (this.__h[t] || []).slice().forEach(f => f.call(this, e));
  };
  Възел.prototype.click = function () { this._пусни('click'); };
  Възел.prototype.focus = function () {}; Возел_нищо(Възел, ['blur', 'select', 'scrollIntoView', 'setSelectionRange']);
  Възел.prototype.getBoundingClientRect = function () { return { top: 0, left: 0, width: 100, height: 44, bottom: 44, right: 100 }; };
  Възел.prototype._всички = function () {
    const вън = [];
    (function обходи(н) { н.children.forEach(c => { вън.push(c); обходи(c); }); })(this);
    return вън;
  };
  Възел.prototype._пасва = function (сел) {
    const s = String(сел).trim().replace(/^:scope\s*>\s*/, '');
    return s.split(/(?=[.#])/).filter(Boolean).every(част => {
      if (част[0] === '.') return this._кл().indexOf(част.slice(1)) >= 0;
      if (част[0] === '#') return this.id === част.slice(1);
      if (/^[a-zA-Z]/.test(част)) return this.tagName === част.toUpperCase();
      return true;
    });
  };
  Възел.prototype.querySelectorAll = function (сел) {
    const части = String(сел).split(',').map(x => x.trim()).filter(Boolean);
    const обхват = части.some(x => /^:scope\s*>/.test(x)) ? this.children : this._всички();
    return обхват.filter(н => части.some(x => н._пасва(x)));
  };
  Възел.prototype.querySelector = function (сел) { return this.querySelectorAll(сел)[0] || null; };

  function Возел_нищо(K, имена) { имена.forEach(и => { K.prototype[и] = function () {}; }); }

  const тяло = new Възел('body');
  W.document = {
    body: тяло, documentElement: new Възел('html'), head: new Възел('head'),
    createElement: t => new Възел(t),
    createTextNode: t => { const n = new Възел('span'); n.textContent = t; return n; },
    getElementById: id => тяло._всички().filter(n => n.id === id)[0] || null,
    querySelector: с => тяло.querySelector(с),
    querySelectorAll: с => тяло.querySelectorAll(с),
    __h: {},
    addEventListener(t, f) { (this.__h[t] = this.__h[t] || []).push(f); },
    removeEventListener(t, f) { const a = this.__h[t] || []; const i = a.indexOf(f); if (i > -1) a.splice(i, 1); },
    _пусни(t) { (this.__h[t] || []).slice().forEach(f => f({ type: t })); },
    readyState: 'complete', hidden: false, visibilityState: 'visible'
  };
  W.__възел = t => new Възел(t);
  return W.document;
}

// ═══════════════════════════════════════════════════════════
// ПЯСЪЧНИК — с подвижен часовник и (по избор) ПЪЛНА памет
// ═══════════════════════════════════════════════════════════
function пясъчник(памет, опции) {
  опции = опции || {};
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, RegExp, String, Number, Object, Array, Boolean, Error, TypeError,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect, FileReader: function () {},
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
  });

  // ⏰ подвижен часовник: приложението пита Date.now() и new Date() —
  //    и двете минават оттук, за да можем да прекрачим полунощ на живо.
  const Истински = Date;
  let отместване = опции.отместване || 0;
  function Д() {
    if (!(this instanceof Д)) return new Истински(Истински.now() + отместване).toString();
    if (arguments.length === 0) return new Истински(Истински.now() + отместване);
    if (arguments.length === 1) return new Истински(arguments[0]);
    return new Истински(arguments[0], arguments[1], arguments[2] || 1, arguments[3] || 0, arguments[4] || 0, arguments[5] || 0, arguments[6] || 0);
  }
  Д.prototype = Истински.prototype;
  Д.now = () => Истински.now() + отместване;
  Д.parse = Истински.parse; Д.UTC = Истински.UTC;
  w.Date = Д;
  w.__часовник = { премести(ms) { отместване += ms; }, сега: () => Д.now() };

  const S = Object.assign({}, памет);
  let пълна = !!опции.пълнаПамет;
  w.localStorage = {
    getItem: k => (Object.prototype.hasOwnProperty.call(S, k) ? S[k] : null),
    setItem(k, v) {
      if (пълна) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      S[k] = String(v);
    },
    removeItem(k) { delete S[k]; },
    clear() { Object.keys(S).forEach(k => delete S[k]); },
    key: i => Object.keys(S)[i] || null,
    get length() { return Object.keys(S).length; }
  };
  w.__S = S;
  w.__напълни = д => { пълна = !!д; };
  w.__чети = k => { try { return JSON.parse(S[k]); } catch (e) { return null; } };

  правиДОМ(w);
  w.addEventListener = function () {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = () => 0;
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '' };
  w.MutationObserver = function () { this.observe = function () {}; this.disconnect = function () {}; };
  w.IntersectionObserver = function () { this.observe = function () {}; this.disconnect = function () {}; };
  w.Image = function () { this.src = ''; };
  w.URL = { createObjectURL: () => '', revokeObjectURL() {} };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

function зареди(W, файл) {
  try {
    new vm.Script(чети('js/' + файл), { filename: файл }).runInContext(W);
    return true;
  } catch (e) { гръм('пясъчникът гръмна на ' + файл + ' → ' + e.message); return false; }
}

const ПОМОЩНИЦИ = `
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => localDate(new Date());
const esc = s => String(s == null ? '' : s);
`;

function изрежи(файл, отТам, доТам, име) {
  const т = чети('js/' + файл);
  const a = т.indexOf(отТам);
  if (a < 0) { гръм('АНКЪР ЛИПСВА: „' + отТам.slice(0, 46) + '…“ в ' + файл + ' (' + име + ')'); return null; }
  const b = т.indexOf(доТам, a + отТам.length);
  if (b < 0) { гръм('КРАЙ ЛИПСВА за ' + име + ' в ' + файл); return null; }
  return т.slice(a, b + доТам.length);
}

// ═══════════════════════════════════════════════════════════
// П1 · ИНВЕНТАР — всеки елемент с анкър в кода
// ═══════════════════════════════════════════════════════════
// вид: БРОЯЧ (число за днес) · ИСТОРИЯ (расте с дните) · ПОЛЕ (мама пише)
//      · ТАВАН (реже) · ФОРМА (дума/число) · ПОДРЕДБА
const ЕЛЕМЕНТИ = [
  // ── sleephist.js ──
  { ф: 'sleephist.js', вид: 'ИСТОРИЯ', ключ: 'bl_sleep_hist', име: 'нощите назад (ден → минути)', анкър: "const K = 'bl_sleep_hist';", показва: 'rooms13 „Числата вместо усещането“ · profile „измерени нощи“ · rooms14/17' },
  { ф: 'sleephist.js', вид: 'БРОЯЧ', ключ: 'bl_sleep', име: 'прибиране на вчерашния сън', анкър: "let s = load('bl_sleep', null);", показва: '— (пише в историята)' },
  { ф: 'sleephist.js', вид: 'ТАВАН', ключ: 'bl_sleep', име: 'разцепване в полунощ до 12 ч', анкър: 'const ТАВАН = 12 * 3600000;', показва: '—' },
  { ф: 'sleephist.js', вид: 'БРОЯЧ', ключ: 'bl_sleep', име: 'днес() — сборът за днес', анкър: 'function днес() {', показва: 'profile „😴 X ч Y мин сън“ · rooms13 „днес досега“' },
  { ф: 'sleephist.js', вид: 'БРОЯЧ', ключ: 'bl_sleep_hist', име: 'средно() — базата за сравнение', анкър: 'function средно(преди, максДни) {', показва: 'rooms13 „средно за N дни“' },
  { ф: 'sleephist.js', вид: 'БРОЯЧ', ключ: 'bl_sleep_hist', име: 'брой() — колко нощи имаме', анкър: 'const брой = () => Object.keys(чети()).length;', показва: 'rooms13 „средно за N дни“' },
  { ф: 'sleephist.js', вид: 'ТАВАН', ключ: 'bl_sleep_hist', име: '120 нощи назад', анкър: 'while (ключове.length > 120)', показва: '—' },
  { ф: 'sleephist.js', вид: 'ИСТОРИЯ', ключ: 'bl_water_hist', име: 'чашите вода по дни', анкър: "[['bl_water', 'bl_water_hist'], ['bl_ml', 'bl_ml_hist']]", показва: 'profile цел „3 дни по 6+ чаши“ · rooms6 календар', още: ['bl_water', 'bl_ml'] },
  { ф: 'sleephist.js', вид: 'ПАЗАЧ', ключ: 'bl_water', име: 'пазачът на полунощ (сверява деня)', анкър: 'function сверка() {', показва: '— (спасява вчерашните числа преди нулирането)', още: ['bl_metime'] },
  { ф: 'sleephist.js', вид: 'ИСТОРИЯ', ключ: 'bl_ml_hist', име: 'изпитите мл по дни', анкър: "['bl_ml', 'bl_ml_hist']", показва: 'BL_DAYHIST.мл (никой не я чете — виж находките)' },
  { ф: 'sleephist.js', вид: 'ТАВАН', ключ: 'bl_water_hist', име: '120 дни назад (вода и мл)', анкър: 'while (кл.length > 120)', показва: '—' },
  { ф: 'sleephist.js', вид: 'ИСТОРИЯ', ключ: 'bl_metime_hist', име: 'седмиците „време за мен“', анкър: "const м = load('bl_metime', null);", показва: 'profile „седмици с време за мен“' },
  { ф: 'sleephist.js', вид: 'ТАВАН', ключ: 'bl_metime_hist', име: '60 седмици назад', анкър: 'while (кл.length > 60)', показва: '—' },
  // ── pump.js ──
  { ф: 'pump.js', вид: 'ИСТОРИЯ', ключ: 'bl_pump', име: 'дневникът за помпене', анкър: "const log = load('bl_pump', []);", показва: 'стая „Моето бебе“ · карта „Дневник за помпене“' },
  { ф: 'pump.js', вид: 'ТАВАН', ключ: 'bl_pump', име: '200 записа', анкър: "save('bl_pump', log.slice(-200))", показва: '—' },
  { ф: 'pump.js', вид: 'ПОЛЕ', ключ: 'bl_pump', име: 'колко мл (по желание, 0–1500)', анкър: 'function прочетиМл() {', показва: 'същата карта' },
  { ф: 'pump.js', вид: 'БРОЯЧ', ключ: 'bl_pump', име: '„Последно преди X ч Y мин“', анкър: 'const изтекло = Date.now() - last.t;', показва: 'същата карта' },
  { ф: 'pump.js', вид: 'ИСТОРИЯ', ключ: 'bl_pump', име: 'преглед на последните 3', анкър: 'const прегл = log.slice(-3).reverse()', показва: 'същата карта' },
  { ф: 'pump.js', вид: 'ПОЛЕ', ключ: 'bl_pump', име: 'път назад „↺ Върни последното“', анкър: "undo.addEventListener('click', () => {", показва: 'същата карта' },
  // ── quickadd.js ──
  { ф: 'quickadd.js', вид: 'ПОЛЕ', ключ: 'bl_wm_diary', име: '„✍️ Един таен ред“ (до 200 знака)', анкър: "const items = load('bl_wm_diary', []);", показва: '„Днес“ · карта „Бързо, преди да отлети“' },
  { ф: 'quickadd.js', вид: 'ПОЛЕ', ключ: 'bl_wm_diary', име: 'ключалката (ПИН) преди писане', анкър: 'const заключено = window.BL_PIN', показва: 'същата карта' },
  // ── expr.js ──
  { ф: 'expr.js', вид: 'ИСТОРИЯ', ключ: '(по подаден ключ)', име: 'photoListCard — датирани снимки', анкър: 'function photoListCard(title, key, opts) {', показва: 'bl_food_faces (Захранване) · bl_rash (Здраве и SOS)' },
  { ф: 'expr.js', вид: 'ТАВАН', ключ: '(по подаден ключ)', име: 'opts.max — реже НАЙ-СТАРИТЕ снимки', анкър: 'if (opts.max) while (items.length > opts.max) items.shift();', показва: '—' },
  { ф: 'expr.js', вид: 'ИСТОРИЯ', ключ: '(по подаден ключ)', име: 'voiceCard — гласови записи', анкър: 'function voiceCard(title, key, opts) {', показва: 'bl_voice (Дневник на мама) · bl_baby_sounds (Моето бебе)' },
  { ф: 'expr.js', вид: 'БРОЯЧ', ключ: 'bl_baby', име: 'възрастта, подпечатана върху споделена снимка', анкър: 'function възрастНа(ts) {', показва: 'споделената картинка (завинаги)' },
  { ф: 'expr.js', вид: 'ПОЛЕ', ключ: '(по подаден ключ)', име: 'надпис под снимката (до 60 знака)', анкър: 'function питайЗаНадпис() {', показва: 'решетката със снимки' },
  // ── broi.js ──
  { ф: 'broi.js', вид: 'ФОРМА', ключ: '—', име: 'BL_BROI — числото и думата до него', анкър: 'function брой(n, ед, мн) {', показва: '14 файла (profile, rooms2/3/6/10/16/17/18, women2/5, river, photos, polish, extras2)' },
  { ф: 'broi.js', вид: 'ФОРМА', ключ: '—', име: 'самопроверката на речника', анкър: 'function самопроверка() {', показва: '—' },
  // ── journal.js ──
  { ф: 'journal.js', вид: 'ПОДРЕДБА', ключ: '—', име: '6-те кътчета на „Дневник на мама“', анкър: 'window.BL_ROOM_SECTIONS[ROOM] =', показва: 'стая „Дневник на мама“' }
];

function П1_инвентар() {
  п('\n═══ П1 · ИНВЕНТАР НА МОИТЕ ШЕСТ ФАЙЛА ═══');
  const текстове = {};
  МОИ.forEach(ф => {
    const т = чети('js/' + ф);
    текстове[ф] = т;
    БРОЙ.файлове++; БРОЙ.редове += т.split('\n').length;
  });
  ЕЛЕМЕНТИ.forEach(е => {
    БРОЙ.елементи++;
    const т = текстове[е.ф];
    if (!т) { гръм('няма такъв файл: ' + е.ф); return; }
    if (т.indexOf(е.анкър) < 0) {
      гръм('АНКЪР ЛИПСВА в ' + е.ф + ': „' + е.анкър.slice(0, 46) + '…“ (' + е.име + ')');
    } else { БРОЙ.анкъри++; }
  });
  // регекс-обход: няма ли ключ, който таблицата не познава?
  const знаем = new Set();
  ЕЛЕМЕНТИ.forEach(е => { знаем.add(е.ключ); (е.още || []).forEach(k => знаем.add(k)); });
  const намерени = new Set();
  МОИ.forEach(ф => {
    const re = /['"](bl_[a-z0-9_]+)['"]/g; let m;
    while ((m = re.exec(текстове[ф]))) { намерени.add(m[1]); БРОЙ.ключове++; }
  });
  намерени.forEach(k => {
    if (!знаем.has(k)) находка('🟠', 'ключ „' + k + '“ се ползва в моите файлове, но липсва в инвентара — уредът е сляп за него', 'П1');
  });
  if (!ТИХО) {
    const поФайл = {};
    ЕЛЕМЕНТИ.forEach(е => { (поФайл[е.ф] = поФайл[е.ф] || []).push(е); });
    Object.keys(поФайл).forEach(ф => {
      п('\n  ── ' + ф + ' ──');
      поФайл[ф].forEach(е => п('     ' + е.вид.padEnd(8) + ' ' + String(е.ключ).padEnd(16) + ' ' + е.име + '\n              показва се: ' + е.показва));
    });
  }
  п('\n  ПРЕГЛЕДАНИ: ' + БРОЙ.файлове + ' файла · ' + БРОЙ.редове + ' реда · ' +
    БРОЙ.елементи + ' елемента · ' + БРОЙ.анкъри + '/' + БРОЙ.елементи + ' анкъра намерени · ' +
    намерени.size + ' различни ключа');
}

// ═══════════════════════════════════════════════════════════
// П1б · ЧАСОВИЯТ ПОЯС — най-скъпият капан в броячите
// ═══════════════════════════════════════════════════════════
// `new Date('2026-08-25')` е полунощ по ГРИНУИЧ, а всичко в приложението
// брои по МЕСТЕН календарен ден. Изваждането им дава ±1 ден и точно това
// къса серии и мести записи в „вчера“. Тук се брои КОЛКО места са гледани.
function часовиПояс(текст) {
  const лоши = [];
  текст.split('\n').forEach((ред, i) => {
    let m;
    const re = /new Date\(([^)]*)\)/g;
    while ((m = re.exec(ред))) {
      БРОЙ.датиМеста++;
      const арг = m[1];
      if (/^\s*['"]\d{4}-\d{2}-\d{2}['"]\s*$/.test(арг)) {
        лоши.push({ ред: i + 1, т: ред.trim().slice(0, 90), защо: 'гола дата в кавички = UTC полунощ' });
      } else if (/['"][^'"]*-[^'"]*['"]/.test(арг) && арг.indexOf('T') < 0) {
        // сглобена дата-низ („… + '-01'“) без час → пак UTC полунощ
        лоши.push({ ред: i + 1, т: ред.trim().slice(0, 90), защо: 'сглобен дата-низ без час („T…“) = UTC полунощ' });
      }
    }
  });
  return лоши;
}

function П1б_pояс() {
  п('\n═══ П1б · ЧАСОВИЯТ ПОЯС ═══');
  let общо = 0;
  МОИ.forEach(ф => {
    const лоши = часовиПояс(чети('js/' + ф));
    общо += лоши.length;
    лоши.forEach(л => находка('🔴', ф + ':' + л.ред + ' — ' + л.защо + ' → ' + л.т, 'П1б'));
    if (лоши.length) п('  🔴 ' + ф + ': ' + лоши.length);
  });
  п('  ПРЕГЛЕДАНИ: ' + БРОЙ.датиМеста + ' места с `new Date(` · нарушители: ' + общо);
}

// ═══════════════════════════════════════════════════════════
// П2 · ЧУЖДИТЕ ЧЕТЦИ — двойниците един до друг
// ═══════════════════════════════════════════════════════════
const МОИТЕ_КЛЮЧОВЕ = ['bl_sleep', 'bl_sleep_hist', 'bl_water', 'bl_water_hist',
  'bl_ml', 'bl_ml_hist', 'bl_metime', 'bl_metime_hist', 'bl_pump', 'bl_wm_diary',
  'bl_voice', 'bl_baby_sounds', 'bl_food_faces', 'bl_rash'];

// формата, в която ДАДЕН файл пише в даден ключ: имената на полетата при push
function формиНаЗаписа(ключ, файлове) {
  return файлове.map(ф => {
    const т = чети('js/' + ф);
    // търсим `push({ … })` в блока около ключа — най-близкото до споменаването
    const i = т.indexOf("'" + ключ + "'");
    const около = i < 0 ? т : т.slice(Math.max(0, i - 900), i + 900);
    const m = /push\(\s*\{([^}]*)\}/.exec(около) || /save\(\s*['"][a-z_]+['"]\s*,\s*\{([^}]*)\}/.exec(около);
    if (!m) return { ф, полета: '?' };
    // 🪤 `push({ t: v.slice(0, 200), d: today() })` — запетаята ВЪТРЕ в скобите
    //    чупи наивното split(','). Първо изпразваме всички скоби.
    let тяло = m[1];
    for (let i = 0; i < 6; i++) { const н = тяло.replace(/\([^()]*\)/g, '()'); if (н === тяло) break; тяло = н; }
    const полета = тяло.split(',').map(x => (x.indexOf(':') > -1 ? x.split(':')[0] : x).trim())
      .filter(x => x && /^[A-Za-zА-Яа-я_$][\wА-Яа-я$]*$/.test(x)).sort().join(',');
    return { ф, полета: полета || '?' };
  });
}

function П2_чужди() {
  п('\n═══ П2 · КОЙ ДРУГ ПИПА СЪЩИТЕ КЛЮЧОВЕ ═══');
  const карта = {};
  МОИТЕ_КЛЮЧОВЕ.forEach(k => { карта[k] = []; });
  живиФайлове().forEach(ф => {
    const редове = чети('js/' + ф).split('\n');
    редове.forEach((ред, i) => {
      МОИТЕ_КЛЮЧОВЕ.forEach(k => {
        if (ред.indexOf("'" + k + "'") < 0 && ред.indexOf('"' + k + '"') < 0) return;
        const пише = /save\s*\(|setItem\s*\(/.test(ред);
        карта[k].push({ ф, ред: i + 1, пише, текст: ред.trim().slice(0, 96) });
        БРОЙ.чуждиМеста++;
      });
    });
  });
  МОИТЕ_КЛЮЧОВЕ.forEach(k => {
    const места = карта[k];
    const файлове = [...new Set(места.map(m => m.ф))];
    const пишещи = [...new Set(места.filter(m => m.пише).map(m => m.ф))];
    п('\n  ' + k + '  · ' + места.length + ' места в ' + файлове.length + ' файла · пишат: ' + (пишещи.join(', ') || '—'));
    if (!ТИХО) места.forEach(m => п('     ' + (m.пише ? '✍️ ' : '👁️ ') + m.ф + ':' + m.ред + '  ' + m.текст));
    if (пишещи.length > 1) {
      // 🪤 Двама автори на един ключ не е дефект САМ ПО СЕБЕ СИ — дефект е,
      //    ако пишат РАЗЛИЧНА форма (единият { t, d }, другият { текст, дата }),
      //    защото тогава четящият вижда празни полета. Мерим формата.
      const форми = формиНаЗаписа(k, пишещи);
      const различни = [...new Set(форми.map(ф => ф.полета))];
      if (форми.some(ф => ф.полета === '?')) {
        знание('ключ „' + k + '“ се пише от ' + пишещи.length + ' файла (' + пишещи.join(', ') +
          '); формата НЕ се мери автоматично тук — сверявай на ръка', 'П2');
      } else if (различни.length > 1) {
        находка('🔴', 'ключ „' + k + '“ се пише в РАЗЛИЧНА форма: ' +
          форми.map(ф => ф.ф + ' → {' + ф.полета + '}').join(' · ') + ' — четящият ще вижда празни полета', 'П2');
      } else {
        знание('ключ „' + k + '“ се пише от ' + пишещи.length + ' файла (' + пишещи.join(', ') +
          '), но в ЕДНА И СЪЩА форма {' + (различни[0] || '?') + '} — сверено', 'П2');
      }
    }
    if (места.length && !места.some(m => m.ф !== 'sleephist.js' && !m.пише) && k.slice(-5) === '_hist') {
      // 🪤 „Никой не я чете“ е дефект САМО ако е случайно. Съзнателното
      //    решение трябва да е ЗАПИСАНО във файла — изчезне ли обяснението,
      //    находката се връща сама.
      const обяснено = чети('js/sleephist.js').indexOf('📌 ' + k + ' СЕ ПЪЛНИ') >= 0;
      if (обяснено) знание('история „' + k + '“ се пълни без нито един четец — но решението е обяснено във файла (вратата е BL_DAYHIST)', 'П2');
      else находка('🟠', 'история „' + k + '“ се ПЪЛНИ, но никой освен sleephist.js не я ЧЕТЕ — мама пълни чекмедже, което никой не отваря', 'П2');
    }
  });
  п('\n  ПРЕГЛЕДАНИ: ' + живиФайлове().length + ' живи файла · ' + БРОЙ.чуждиМеста + ' места с моите ключове');
}

// ═══════════════════════════════════════════════════════════
// П3 · ТАВАНИТЕ — колко записа пази всеки списък
// ═══════════════════════════════════════════════════════════
// „честен“ = изречението, което картата казва на мама при ПЪЛНА памет.
// Липсва ли този текст във файла → гръм: предпазителят е махнат, а уредът
// щеше да мълчи вместо да мери.
const СПИСЪЦИ = [
  { ключ: 'bl_pump', ф: 'pump.js', таван: 200, как: 'slice(-200)', честен: 'Паметта на телефона се напълни — това изцеждане НЕ се записа' },
  { ключ: 'bl_sleep_hist', ф: 'sleephist.js', таван: 120, как: 'shift() над 120' },
  { ключ: 'bl_water_hist', ф: 'sleephist.js', таван: 120, как: 'shift() над 120' },
  { ключ: 'bl_ml_hist', ф: 'sleephist.js', таван: 120, как: 'shift() над 120' },
  { ключ: 'bl_metime_hist', ф: 'sleephist.js', таван: 60, как: 'shift() над 60' },
  { ключ: 'bl_wm_diary', ф: 'quickadd.js', таван: null, как: 'НЯМА — нарочно (дневникът ѝ)', честен: 'Паметта на телефона е пълна — редът НЕ е записан' },
  { ключ: 'bl_voice', ф: 'expr.js', таван: null, как: 'НЯМА (rooms3.js не подава opts.max)', честен: 'Паметта се напълни — изтрий стар запис.' },
  { ключ: 'bl_baby_sounds', ф: 'expr.js', таван: null, как: 'НЯМА (rooms3.js не подава opts.max)', честен: 'Паметта се напълни — изтрий стар запис.' },
  { ключ: 'bl_food_faces', ф: 'expr.js', таван: null, как: 'НЯМА (rooms3.js не подава opts.max)', честен: 'Паметта се напълни — изтрий нещо старо.' },
  { ключ: 'bl_rash', ф: 'expr.js', таван: null, как: 'НЯМА (rooms3.js не подава opts.max)', честен: 'Паметта се напълни — изтрий нещо старо.' }
];

function П3_тавани() {
  п('\n═══ П3 · ТАВАНИТЕ ═══');
  if (чети('js/pump.js').indexOf('log.slice(-200)') < 0) гръм('таванът на bl_pump вече не е slice(-200) — П3 мери сляпо');
  СПИСЪЦИ.forEach(с => {
    const т = чети('js/' + с.ф);
    const казваИстината = с.честен ? т.indexOf(с.честен) >= 0 : null;
    if (с.честен && !казваИстината) {
      гръм('изчезна изречението за пълна памет в ' + с.ф + ': „' + с.честен.slice(0, 40) + '…“ — предпазителят е махнат');
    }
    п('  ' + с.ключ.padEnd(16) + ' ' + (с.таван ? String(с.таван).padStart(4) + ' записа' : '  БЕЗ ТАВАН') +
      '  · ' + с.ф + ' · ' + с.как + (казваИстината === null ? '' : казваИстината ? ' · при пълна памет КАЗВА истината ✅' : ' · МЪЛЧИ при пълна памет 🔴'));
    if (с.таван === null) {
      if (казваИстината) {
        знание('списък „' + с.ключ + '“ расте без таван (' + с.ф + '), но при пълна памет картата казва истината и мама може да трие сама — измерено', 'П3');
      } else {
        находка('🟠', 'списък „' + с.ключ + '“ расте без таван (' + с.ф + ') И мълчи при пълна памет — записите ѝ ще падат невидимо', 'П3');
      }
    }
  });
  п('  ПРЕГЛЕДАНИ: ' + СПИСЪЦИ.length + ' списъка');
}

// ═══════════════════════════════════════════════════════════
// П3б · ПРОВЕРЕН ЛИ Е ЗАПИСЪТ — колко save() имат отговор
// ═══════════════════════════════════════════════════════════
// „успех върху нищо“ = запис без проверка, а веднага след него обявен успех
function записиБезОтговор(текст) {
  const редове = текст.split('\n');
  let общо = 0, проверени = 0; const лоши = [];
  редове.forEach((ред, i) => {
    const бр = (ред.match(/(?:^|[^а-яА-Я\w.])save\(/g) || []).length;
    if (!бр) return;
    общо += бр;
    if (/if\s*\(\s*!?\s*save\(/.test(ред)) { проверени += бр; return; }
    const околност = редове.slice(i, i + 4).join(' ');
    if (/(Прибрано|Прибрах|Заключено|Върнах|Махнах|✔)/.test(околност)) {
      лоши.push('ред ' + (i + 1) + ': запис без проверка, а веднага след него — обявен успех');
    }
  });
  return { общо, проверени, лоши };
}

function П3б_записи() {
  п('\n═══ П3б · ВСЕКИ ЗАПИС ИМА ЛИ ОТГОВОР ═══');
  let общо = 0, проверени = 0;
  МОИ.forEach(ф => {
    const р = записиБезОтговор(чети('js/' + ф));
    общо += р.общо; проверени += р.проверени;
    if (р.общо) п('  ' + ф.padEnd(15) + ' записи: ' + р.общо + ' · с проверка: ' + р.проверени + (р.лоши.length ? '\n     ' + р.лоши.join('\n     ') : ''));
    р.лоши.forEach(л => находка('🔴', ф + ' — ' + л, 'П3б'));
  });
  п('  ПРЕГЛЕДАНИ: ' + общо + ' записа в паметта · ' + проверени + ' с проверен резултат');
}

// ═══════════════════════════════════════════════════════════
// П4 · ЖИВО — истинският код, истински състояния
// ═══════════════════════════════════════════════════════════
const СЪСТОЯНИЯ = [
  { име: 'нов потребител', памет: {} },
  { име: '3 дни поред', памет: { bl_sleep_hist: J({ [денНазад(1)]: 600, [денНазад(2)]: 580, [денНазад(3)]: 610 }) } },
  { име: 'прекъснала вчера', памет: { bl_sleep_hist: J({ [денНазад(2)]: 600, [денНазад(3)]: 580 }) } },
  {
    име: '40 дни поред', памет: {
      bl_sleep_hist: J(Object.fromEntries(Array.from({ length: 40 }, (_, i) => [денНазад(i + 1), 540 + i]))),
      bl_water_hist: J(Object.fromEntries(Array.from({ length: 40 }, (_, i) => [денНазад(i + 1), 6])))
    }
  },
  { име: 'бебето спи в момента', памет: { bl_sleep: J({ d: денНазад(0), segs: [{ s: Date.now() - 8 * 3600000, e: Date.now() - 5 * 3600000 }], open: Date.now() - 2 * 3600000 }) } },
  { име: 'забравен брояч (20 ч отворен)', памет: { bl_sleep: J({ d: денНазад(0), segs: [], open: Date.now() - 20 * 3600000 }) } },
  { име: 'записи от миналата година', памет: { bl_sleep_hist: J({ '2025-08-25': 620, '2025-12-31': 640 }), bl_pump: J([{ t: new Date(new Date().getFullYear() - 1, 7, 25, 10, 0, 0).getTime(), s: 'left', ml: 90 }]) } }
];

function П4_живо() {
  п('\n═══ П4 · ЖИВИ МЕРКИ ═══');

  // ── 4.1 · СЪНЯТ ДНЕС: моето число срещу картата в стаята ──
  п('\n  ── 4.1 „Сънят днес“: sleephist.днес() срещу rooms2 „Днес: X ч Y мин“ ──');
  const кодRooms2 = изрежи('rooms2.js', 'const ТАВАН_СЪН = 14 * 3600000;',
    'const m = Math.floor(ms / 60000); return `${Math.floor(m / 60)} ч ${m % 60} мин`;\n    }', 'rooms2 totalSleep');
  СЪСТОЯНИЯ.forEach(с => {
    БРОЙ.състояния++;
    const A = (() => {
      const W = пясъчник(с.памет);
      if (!зареди(W, 'sleephist.js')) return '⛔';
      const m = W.BL_SLEEPHIST.днес();
      БРОЙ.живиМерки++;
      return Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин';
    })();
    const B = (() => {
      if (!кодRooms2) return '⛔';
      const W = пясъчник(с.памет);
      try {
        БРОЙ.живиМерки++;
        return vm.runInContext('(function(){' + ПОМОЩНИЦИ + кодRooms2 +
          "const t=today(); let s=load('bl_sleep',{d:t,segs:[],open:null}); if(s.d!==t)s={d:t,segs:[],open:null}; if(!Array.isArray(s.segs))s.segs=[]; return totalSleep(s);})()", W);
      } catch (e) { гръм('rooms2 totalSleep → ' + e.message); return '⛔'; }
    })();
    const еднакви = A === B;
    п('     ' + (еднакви ? '✅' : '🔴') + ' ' + с.име.padEnd(30) + ' моето: ' + String(A).padEnd(12) + ' стаята: ' + B);
    if (!еднакви) {
      находка('🔴', 'РАЗЛИЧНИ ЧИСЛА за „сън днес“ при „' + с.име + '“: sleephist.днес() → ' + A + ' · картата в rooms2.js → ' + B, 'П4.1');
    }
  });

  // ── 4.2 · ПОЛУНОЩ БЕЗ ПРЕЗАРЕЖДАНЕ ──
  // Мама държи приложението отворено от 23:50 до 00:10. Прибирачът на
  // вчерашното се вика САМО при зареждане на файла. Ако не се вика пак,
  // първото ѝ докосване след полунощ трие вчерашния ден (rooms4.js:39
  // `if (data.d !== today()) data = { d: today(), n: 0 }`).
  п('\n  ── 4.2 полунощ, БЕЗ презареждане (23:50 → 00:10) ──');
  {
    const вчера = денНазад(0);                 // „днес“ по време на зареждането
    const памет = {
      bl_water: J({ d: вчера, n: 6 }),
      bl_ml: J({ d: вчера, n: 480 }),
      bl_sleep: J({ d: вчера, segs: [{ s: Date.now() - 5 * 3600000, e: Date.now() - 2 * 3600000 }], open: null })
    };
    const W = пясъчник(памет);
    if (зареди(W, 'sleephist.js')) {
      БРОЙ.живиМерки++;
      // при зареждане няма какво да се прибира — всичко е „днешно“
      const преди = W.__чети('bl_water_hist') || {};
      // ⏰ прекрачваме полунощ, без да презареждаме нищо
      const н = new Date();
      const доПолунощ = new Date(н.getFullYear(), н.getMonth(), н.getDate() + 1, 0, 10, 0).getTime() - Date.now();
      W.__часовник.премести(доПолунощ);
      // това, което браузърът прави сам: връщане в кадър
      W.document._пусни('visibilitychange');
      const след = W.__чети('bl_water_hist') || {};
      const млСлед = W.__чети('bl_ml_hist') || {};
      const сънСлед = W.__чети('bl_sleep_hist') || {};
      п('     вода вчера: ' + (след[вчера] !== undefined ? '✅ прибрана (' + след[вчера] + ')' : '🔴 НЯМА Я') +
        ' · мл: ' + (млСлед[вчера] !== undefined ? '✅ (' + млСлед[вчера] + ')' : '🔴 НЯМА ГИ') +
        ' · сън: ' + (сънСлед[вчера] !== undefined ? '✅ (' + сънСлед[вчера] + ' мин)' : '🔴 НЯМА ГО') +
        '  [преди полунощ в историята: ' + Object.keys(преди).length + ' дни]');
      if (след[вчера] === undefined || млСлед[вчера] === undefined || сънСлед[вчера] === undefined) {
        находка('🔴', 'приложението мина ПОЛУНОЩ, без да е презареждано: вчерашните ' +
          [след[вчера] === undefined ? 'чаши вода' : null, млСлед[вчера] === undefined ? 'милилитри' : null, сънСлед[вчера] === undefined ? 'минути сън' : null].filter(Boolean).join(' + ') +
          ' НЕ влизат в историята → първото докосване след 00:00 ги нулира завинаги', 'П4.2');
      }
    }
  }

  // ── 4.3 · ПЪЛНА ПАМЕТ: показва ли успех върху нищо ──
  п('\n  ── 4.3 пълна памет: „Прибрано ✔“ върху нищо? ──');
  {
    // quickadd: „✍️ Един таен ред“
    const W = пясъчник({}, { пълнаПамет: true });
    if (зареди(W, 'quickadd.js')) {
      БРОЙ.живиМерки++;
      const кутия = W.__възел('div');
      const inner = W.__възел('div'); inner.className = 'td-inner';
      кутия.appendChild(inner);
      кутия.className = 'td-wrap';
      W.BL_TODAY_BIND(кутия, { name: 'Мими' }, {});
      const поле = кутия.querySelector('.qa-inp');
      const копче = кутия.querySelector('.qa-b');
      const изход = кутия.querySelector('.qa-out');
      if (!поле || !копче || !изход) { гръм('quickadd: картата не се нарисува в пясъчника (поле/копче/изход липсват)'); }
      else {
        поле.value = 'Днес не издържах и плаках в банята.';
        копче.click();
        const записано = W.__чети('bl_wm_diary');
        const казва = изход.textContent;
        const лъже = !записано && /Прибрано|прибрах|Заключено/i.test(казва);
        п('     quickadd „таен ред“: записано=' + (записано ? записано.length : 0) + ' · казва: „' + казва + '“ ' + (лъже ? '🔴' : '✅'));
        if (лъже) находка('🔴', 'quickadd.js: при ПЪЛНА памет тайният ред НЕ се записва, а картата казва „' + казва + '“ — успех върху нищо', 'П4.3');
        if (!записано && !казва) находка('🟠', 'quickadd.js: при пълна памет картата МЪЛЧИ — мама не разбира, че редът е изгубен', 'П4.3');
      }
    }
    // pump: бутон „Ляво“
    const W2 = пясъчник({}, { пълнаПамет: true });
    W2.ROOM_FEATURES = { 'Моето бебе': function () {} };
    if (зареди(W2, 'pump.js')) {
      БРОЙ.живиМерки++;
      const root = W2.__възел('div');
      W2.ROOM_FEATURES['Моето бебе'](root);
      const ляво = root.querySelectorAll('button').filter(b => /Ляво/.test(b.innerHTML))[0];
      const редове = root.querySelectorAll('.bb-feed');
      if (!ляво) { гръм('pump: бутонът „Ляво“ не се намери в пясъчника'); }
      else {
        ляво.click();
        const записано = W2.__чети('bl_pump');
        const казва = редове.map(r => r.textContent).join(' | ');
        const намек = root.querySelectorAll('.jr-hint').map(x => (x.hidden ? '' : x.textContent)).join('');
        const мълчи = !записано && !намек;
        п('     pump „Ляво“: записано=' + (записано ? записано.length : 0) + ' · казва: „' + казва.slice(0, 80) + '“ · намек: „' + намек + '“ ' + (мълчи ? '🔴' : '✅'));
        if (мълчи) находка('🔴', 'pump.js: при ПЪЛНА памет изцеждането не се записва и картата не казва нищо — само „↺ Върни последното“ светва върху несъществуващ запис', 'П4.3');
      }
    }
  }

  // ── 4.4 · ОЦЕЛЯВА ЛИ ЗАПИСЪТ ПРЕЗАРЕЖДАНЕ ──
  п('\n  ── 4.4 оцелява ли записът презареждане ──');
  {
    const W = пясъчник({});
    W.ROOM_FEATURES = { 'Моето бебе': function () {} };
    if (зареди(W, 'pump.js')) {
      БРОЙ.живиМерки++;
      const root = W.__възел('div');
      W.ROOM_FEATURES['Моето бебе'](root);
      const amt = root.querySelectorAll('input').filter(i => i.type === 'number')[0];
      const дясно = root.querySelectorAll('button').filter(b => /Дясно/.test(b.innerHTML))[0];
      if (amt && дясно) {
        amt.value = '120';
        дясно.click();
        const памет = Object.assign({}, W.__S);
        // „презареждане“: нов пясъчник със СЪЩАТА памет
        const W2 = пясъчник(памет);
        W2.ROOM_FEATURES = { 'Моето бебе': function () {} };
        зареди(W2, 'pump.js');
        const root2 = W2.__възел('div');
        W2.ROOM_FEATURES['Моето бебе'](root2);
        const текст = root2.querySelectorAll('.bb-feed').map(r => r.textContent).join(' | ');
        const ок = /120 мл/.test(текст) && /Дясно/.test(текст);
        п('     pump след презареждане: ' + (ок ? '✅ ' : '🔴 ') + текст.slice(0, 110));
        if (!ок) находка('🔴', 'pump.js: записът НЕ оцелява презареждане — след повторно рисуване картата не показва „Дясно · 120 мл“', 'П4.4');
      } else гръм('pump: полето за мл или бутонът „Дясно“ не се намериха');
    }
  }

  // ── 4.5 · ПОГРЕШНО ДОКОСВАНЕ: има ли път назад ──
  п('\n  ── 4.5 натиснато по погрешка → има ли връщане ──');
  {
    const W = пясъчник({});
    W.ROOM_FEATURES = { 'Моето бебе': function () {} };
    if (зареди(W, 'pump.js')) {
      БРОЙ.живиМерки++;
      const root = W.__възел('div');
      W.ROOM_FEATURES['Моето бебе'](root);
      const бутони = root.querySelectorAll('button');
      const ляво = бутони.filter(b => /Ляво/.test(b.innerHTML))[0];
      const върни = бутони.filter(b => /Върни последното/.test(b.innerHTML))[0];
      ляво.click();
      const след1 = (W.__чети('bl_pump') || []).length;
      // мама натиска ПАК (второ изцеждане) и чак после „Върни последното“
      ляво.click();
      const след2 = (W.__чети('bl_pump') || []).length;
      върни.click();
      const след3 = (W.__чети('bl_pump') || []).length;
      п('     след 1 докосване: ' + след1 + ' · след 2: ' + след2 + ' · след „Върни“: ' + след3 + (след3 === 1 ? ' ✅' : ' 🔴'));
      if (след3 !== 1) находка('🟠', 'pump.js: „↺ Върни последното“ след два записа остави ' + след3 + ' записа вместо 1', 'П4.5');
    }
  }

  // ── 4.6 · ТАВАНЪТ НА ДНЕВНИКА ЗА ПОМПЕНЕ ──
  п('\n  ── 4.6 таванът на bl_pump (200) ──');
  {
    const стари = Array.from({ length: 205 }, (_, i) => ({ t: Date.now() - (205 - i) * 3600000, s: 'left', ml: 60 }));
    const W = пясъчник({ bl_pump: J(стари) });
    W.ROOM_FEATURES = { 'Моето бебе': function () {} };
    if (зареди(W, 'pump.js')) {
      БРОЙ.живиМерки++;
      const root = W.__възел('div');
      W.ROOM_FEATURES['Моето бебе'](root);
      root.querySelectorAll('button').filter(b => /Двете/.test(b.innerHTML))[0].click();
      const дълж = (W.__чети('bl_pump') || []).length;
      п('     205 стари + 1 нов → ' + дълж + ' записа (таван 200) ' + (дълж === 200 ? '✅' : '🔴'));
      if (дълж !== 200) находка('🟠', 'pump.js: таванът не сработи както е обявен — ' + дълж + ' записа', 'П4.6');
    }
  }

  // ── 4.7 · BL_BROI: собствената самопроверка на broi.js ──
  п('\n  ── 4.7 broi.js — самопроверката на речника ──');
  {
    const W = пясъчник({});
    if (зареди(W, 'broi.js')) {
      const р = W.BL_BROI.самопроверка();
      БРОЙ.живиМерки += р.проверени;
      п('     ' + р.присъда + ' · проверени ' + р.проверени + ' · грешни ' + р.грешни + (р.списък.length ? '\n       ' + р.списък.join('\n       ') : ''));
      if (р.грешни) находка('🔴', 'broi.js: собствената самопроверка пада — ' + р.списък.join(' · '), 'П4.7');
    }
  }

  // ── 4.9 · НИВОТО, което МОИТЕ истории пълнят ──
  // Всяка нощ в bl_sleep_hist и всеки ден в bl_water_hist дават по 3 звездички
  // (profile.js:193-194). Лентата и надписът до нея трябва да казват едно и
  // също: „1900 / 2500“ до лента на 0% беше точно този клас дефект.
  п('\n  ── 4.9 нивото: лентата срещу надписа (моите истории дават звездички) ──');
  {
    const точкиКод = изрежи('profile.js', 'function точки() {', 'return xp;\n  }', 'profile точки');
    const нивоКод = изрежи('profile.js', 'const НИВА = [', 'return { n: i + 1, e: тек[1], име: тек[2], проц, след, xp };\n  }', 'profile ниво');
    const проби = [
      { име: 'нов потребител', памет: {} },
      { име: '120 нощи + 120 дни вода', памет: { bl_sleep_hist: J(Object.fromEntries(Array.from({ length: 120 }, (_, i) => [денНазад(i + 1), 540]))), bl_water_hist: J(Object.fromEntries(Array.from({ length: 120 }, (_, i) => [денНазад(i + 1), 6]))) } },
      { име: 'точно 1900 звездички', памет: { bl_lab: J({ done: Array.from({ length: 25 }, () => ({ e: '🔬' })) }), bl_firsts: J(Object.fromEntries(Array.from({ length: 60 }, (_, i) => ['п' + i, 1]))) } }
    ];
    проби.forEach(пр => {
      if (!точкиКод || !нивоКод) return;
      const W = пясъчник(пр.памет);
      try {
        БРОЙ.живиМерки++;
        const р = vm.runInContext('(function(){' + ПОМОЩНИЦИ + точкиКод + нивоКод +
          'const xp = точки(); const л = ниво(xp); return { xp: xp, проц: л.проц, праг: л.след ? л.след[0] : null };})()', W);
        const надпис = р.праг == null ? (р.xp + ' звездички · върхът') : (р.xp + ' / ' + р.праг);
        const очакван = р.праг == null ? 100 : Math.max(0, Math.min(100, Math.round(р.xp / р.праг * 100)));
        const съгласни = р.проц === очакван && !(р.xp > 0 && р.проц === 0);
        п('     ' + (съгласни ? '✅' : '🔴') + ' ' + пр.име.padEnd(28) + ' надпис: „' + надпис + '“ · лента: ' + р.проц + '%');
        if (!съгласни) находка('🔴', 'нивото: надписът казва „' + надпис + '“, а лентата стои на ' + р.проц + '% (' + пр.име + ')', 'П4.9');
      } catch (e) { гръм('profile точки/ниво → ' + e.message); }
    });
  }

  // ── 4.8 · ИСТОРИЯТА НА СЪНЯ: средно/брой при състоянията ──
  п('\n  ── 4.8 историята на съня: брой() и средно() ──');
  СЪСТОЯНИЯ.forEach(с => {
    const W = пясъчник(с.памет);
    if (!зареди(W, 'sleephist.js')) return;
    БРОЙ.живиМерки += 2;
    const H = W.BL_SLEEPHIST;
    const б = H.брой(), ср = H.средно(денНазад(0), 14);
    п('     ' + с.име.padEnd(30) + ' нощи: ' + String(б).padStart(3) + ' · средно: ' + (ср == null ? '—' : ср + ' мин'));
    if (б > 0 && ср == null) находка('🟠', 'sleephist.js: при „' + с.име + '“ има ' + б + ' нощи, но средно() връща нищо', 'П4.8');
  });

  п('\n  ПРЕГЛЕДАНИ: ' + БРОЙ.състояния + ' състояния · ' + БРОЙ.живиМерки + ' живи измервания');
}

// ═══════════════════════════════════════════════════════════
// П5 · САМОПРОВЕРКА — уредът длъжен ли е да гърми
// ═══════════════════════════════════════════════════════════
function П5_самопроверка() {
  const резултати = [];
  const тест = (име, дали) => { резултати.push({ име, ок: !!дали }); БРОЙ.самопроверки++; };

  // 1. Мъничкият ДОМ наистина ли пуска събития
  {
    const W = пясъчник({});
    const б = W.__възел('button'); let бутнат = 0;
    б.addEventListener('click', () => бутнат++);
    б.click();
    тест('ДОМ: click стига до слушателя', бутнат === 1);
  }
  // 2. querySelector по клас
  {
    const W = пясъчник({});
    const a = W.__възел('div'), b = W.__възел('span'); b.className = 'qa-inp';
    a.appendChild(b);
    тест('ДОМ: querySelector(".qa-inp") намира вложен възел', a.querySelector('.qa-inp') === b);
  }
  // 3. Пълната памет ГЪРМИ
  {
    const W = пясъчник({}, { пълнаПамет: true });
    let гръмна = false;
    try { W.localStorage.setItem('x', '1'); } catch (e) { гръмна = true; }
    тест('памет: пълната памет хвърля грешка', гръмна);
  }
  // 4. Часовникът се мести
  {
    const W = пясъчник({});
    const а = W.Date.now();
    W.__часовник.премести(86400000);
    тест('часовник: +1 ден се вижда от Date.now()', W.Date.now() - а >= 86399000);
  }
  // 5. Липсващ анкър вдига гръм (примамка)
  {
    const преди = ГРЪМНАЛИ.length;
    изрежи('sleephist.js', 'ТОВА-ГО-НЯМА-НИКЪДЕ-В-ФАЙЛА', 'нито-това', 'примамка');
    const хвана = ГРЪМНАЛИ.length === преди + 1;
    if (хвана) ГРЪМНАЛИ.pop();
    тест('анкър: липсващ анкър вдига гръм (примамка)', хвана);
  }
  // 6. Инвентарът гърми при преместен елемент (примамка в двете посоки)
  {
    const истински = ЕЛЕМЕНТИ[0].анкър;
    const преди = ГРЪМНАЛИ.length;
    ЕЛЕМЕНТИ[0].анкър = 'НЯМА-ГО-ТОЗИ-АНКЪР';
    const т = чети('js/' + ЕЛЕМЕНТИ[0].ф);
    if (т.indexOf(ЕЛЕМЕНТИ[0].анкър) < 0) гръм('(примамка)');
    const хвана = ГРЪМНАЛИ.length === преди + 1;
    if (хвана) ГРЪМНАЛИ.pop();
    ЕЛЕМЕНТИ[0].анкър = истински;
    тест('инвентар: преместен елемент вдига гръм', хвана && чети('js/' + ЕЛЕМЕНТИ[0].ф).indexOf(истински) >= 0);
  }
  // 7. Мярката за „различни числа“ може да гръмне — и може да мълчи
  {
    const еднакви = '3 ч 0 мин' === '3 ч 0 мин';
    const различни = '3 ч 0 мин' === '5 ч 0 мин';
    тест('сравнение: еднакви мълчи, различни гърми', еднакви === true && различни === false);
  }
  // 8. Живият код на quickadd наистина пише при ЗДРАВА памет
  {
    const W = пясъчник({});
    let ок = false;
    if (зареди(W, 'quickadd.js')) {
      const кутия = W.__възел('div'); const inner = W.__възел('div'); inner.className = 'td-inner';
      кутия.appendChild(inner);
      W.BL_TODAY_BIND(кутия, {}, {});
      const поле = кутия.querySelector('.qa-inp'); const копче = кутия.querySelector('.qa-b');
      if (поле && копче) { поле.value = 'проба'; копче.click(); }
      const з = W.__чети('bl_wm_diary');
      ок = !!(з && з.length === 1 && з[0].t === 'проба');
    }
    тест('живо: quickadd пише при здрава памет (иначе 4.3 е безсмислен)', ок);
  }
  // 9. Живият код на pump наистина пише при ЗДРАВА памет
  {
    const W = пясъчник({});
    W.ROOM_FEATURES = { 'Моето бебе': function () {} };
    let ок = false;
    if (зареди(W, 'pump.js')) {
      const root = W.__възел('div');
      W.ROOM_FEATURES['Моето бебе'](root);
      const л = root.querySelectorAll('button').filter(b => /Ляво/.test(b.innerHTML))[0];
      if (л) л.click();
      const з = W.__чети('bl_pump');
      ок = !!(з && з.length === 1 && з[0].s === 'left');
    }
    тест('живо: pump пише при здрава памет', ок);
  }
  // 10. sleephist прибира вчерашното (иначе 4.2 не мери нищо)
  {
    const вчера = денНазад(1);
    const W = пясъчник({ bl_water: J({ d: вчера, n: 5 }) });
    let ок = false;
    if (зареди(W, 'sleephist.js')) {
      const h = W.__чети('bl_water_hist') || {};
      ок = h[вчера] === 5;
    }
    тест('живо: sleephist прибира вчерашната вода при зареждане', ок);
  }
  // 11. Кирилицата в регексите работи (капанът с \\b)
  {
    тест('кирилица: регексът хваща българска дума', /поред/.test('5 дни поред'));
  }
  // 12б. „Успех върху нищо“: примамка в ДВЕТЕ посоки
  {
    const лош = "save('bl_x', items);\nизход.textContent = '🔒 Прибрано.';";
    const добър = "if (!save('bl_x', items)) return false;\nизход.textContent = '🔒 Прибрано.';";
    const тих = "save('bl_x', items);\ndraw();";
    тест('запис: примамката „успех върху нищо“ се хваща, поправеното мълчи',
      записиБезОтговор(лош).лоши.length === 1 &&
      записиБезОтговор(добър).лоши.length === 0 &&
      записиБезОтговор(тих).лоши.length === 0);
  }
  // 12. Часовият пояс: примамка в ДВЕТЕ посоки
  {
    const хваща = часовиПояс("const d = new Date('2026-08-25');").length === 1;
    const хваща2 = часовиПояс("const d = new Date(s + '-01');").length === 1;
    const мълчи = часовиПояс("const d = new Date(today() + 'T00:00:00');").length === 0 &&
                  часовиПояс('const d = new Date(2026, 7, 25);').length === 0 &&
                  часовиПояс('const d = new Date(ts);').length === 0;
    тест('часови пояс: примамката се хваща, здравото мълчи', хваща && хваща2 && мълчи);
  }

  const паднали = резултати.filter(r => !r.ок);
  п('\n🧪 САМОПРОВЕРКА: ' + (резултати.length - паднали.length) + '/' + резултати.length +
    (паднали.length ? '  🔴 ПАДНА:\n   ' + паднали.map(r => r.име).join('\n   ') : '  ✅ уредът може да гърми И може да мълчи'));
  return паднали.length === 0;
}

// ═══════════════════════════════════════════════════════════
// ГЛАВНОТО
// ═══════════════════════════════════════════════════════════
console.log('═══ 📓 БРОЯЧИТЕ НА ДНЕВНИКА — къде се губят записите на мама ═══');
if (!П5_самопроверка()) {
  console.log('\n🔴 САМОПРОВЕРКАТА ПАДНА — докладът е невалиден и не се печата.');
  process.exit(2);
}
П1_инвентар();
П1б_pояс();
П2_чужди();
П3_тавани();
П3б_записи();
П4_живо();

console.log('\n══════════════════════════════════════════════════════');
console.log('ПРЕГЛЕДАНИ: ' + БРОЙ.файлове + ' мои файла (' + БРОЙ.редове + ' реда) · ' +
  БРОЙ.елементи + ' елемента · ' + БРОЙ.анкъри + ' анкъра · ' + БРОЙ.чуждиМеста + ' чужди места · ' +
  СПИСЪЦИ.length + ' списъка · ' + БРОЙ.състояния + ' състояния · ' + БРОЙ.живиМерки + ' живи измервания · ' +
  БРОЙ.самопроверки + ' самопроверки');

if (ГРЪМНАЛИ.length) {
  console.log('\n💥 ГРЪМНАЛИ МЕРКИ: ' + ГРЪМНАЛИ.length + ' (мярка, която гърми, НЕ мери)');
  ГРЪМНАЛИ.forEach((г, i) => console.log('   ' + (i + 1) + '. ' + г));
}
if (ЗНАНИЕ.length) {
  console.log('\n🟡 ЗА ЗНАНИЕ (измерено, не е дефект): ' + ЗНАНИЕ.length);
  ЗНАНИЕ.forEach(з => console.log('   🟡 [' + з.къде + '] ' + з.текст));
}
if (НАХОДКИ.length) {
  console.log('\n🔴 НАХОДКИ: ' + НАХОДКИ.length);
  ['🔴', '🟠', '🟡'].forEach(к => {
    НАХОДКИ.filter(н => н.клас === к).forEach((н, i) => console.log('   ' + к + ' [' + н.къде + '] ' + н.текст));
  });
} else {
  console.log('\n✅ ЧИСТО — 0 находки при горните числа прегледани.');
}
process.exit(НАХОДКИ.length || ГРЪМНАЛИ.length ? 1 : 0);
