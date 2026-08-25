// ═══════════════════════════════════════════════════════════
// 🚪 ПЪРВАТА ВРАТА — всеки интерактивен елемент от входните файлове,
//    преброен и изигран в Node, без браузър.
//
// ЗАЩО (25.08): „0 находки“ без брой прегледани значи „0 прегледани“.
//    Затова уредът ПЪРВО брои какво е видял (и умира, ако е сляп), и чак
//    после съди. Всяка присъда е за ЕДНО от петте неща, които мама усеща:
//        РЕАГИРА · ЗАПИСВА · ПОКАЗВА РЕЗУЛТАТ · ОЦЕЛЯВА презареждане · НЕ ЛЪЖЕ
//
// ОБХВАТ (входните файлове): js/onboard.js · js/askfield.js · js/iface.js ·
//    js/calm.js · js/night.js · js/firstday.js  + разметката на #onbOverlay.
//
// 🪤 САМОПРОВЕРКА: накрая уредът си подменя изходния текст (в паметта, не на
//    диска) и иска ЧЕРВЕНО. Мярка, която не може да гръмне, не мери.
//
// ПУСКАНЕ:   node dev/parvata_vrata.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Трие се безболезнено.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const R = s => fs.readFileSync(path.join(ROOT, s), 'utf8');

const МОИ = ['js/onboard.js', 'js/askfield.js', 'js/iface.js', 'js/calm.js', 'js/night.js', 'js/firstday.js'];

let ЗЕЛЕНИ = 0; const ЧЕРВЕНО = [];
const ok = t => { ЗЕЛЕНИ++; console.log('   ✅ ' + t); };
const bad = t => { ЧЕРВЕНО.push(t); console.log('   ❌ ' + t); };
const инфо = t => console.log('   · ' + t);
const глава = t => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(2, 60 - [...t].length)));

// ═══════════════ МИНИ-DOM ═══════════════
// Пренесен от dev/parvata_minuta.js (там е работил) + textarea/select,
// `matches`, наблюдателите и разнасяне на събитието „input“ до document —
// защото точно на него виси общата чернова (daily.js:509).
const VOID = new Set(['input', 'br', 'img', 'hr', 'use', 'meta', 'link', 'source', 'path']);

function El(tag) {
  const e = {
    tagName: String(tag || '').toUpperCase(),
    id: '', className: '', dataset: {}, attrs: {},
    children: [], parent: null,
    value: '', _text: '', rows: 0, maxLength: 0, placeholder: '',
    hidden: false, max: '', min: '', type: '', title: '', disabled: false,
    style: {}, isConnected: true,
    _lst: {},
    get classList() {
      const self = this;
      return {
        add(c) { if (!self._cls().includes(c)) self.className = (self.className + ' ' + c).trim(); },
        remove(c) { self.className = self._cls().filter(x => x !== c).join(' '); },
        contains(c) { return self._cls().includes(c); },
        toggle(c, on) { if (on === undefined) on = !self._cls().includes(c); on ? this.add(c) : this.remove(c); return on; }
      };
    },
    _cls() { return String(this.className || '').split(/\s+/).filter(Boolean); },
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'max') this.max = String(v); },
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    matches(sel) { return мач(this, sel); },
    appendChild(n) { n.parent = this; this.children.push(n); return n; },
    insertBefore(n, преди) {
      n.parent = this;
      const i = преди ? this.children.indexOf(преди) : -1;
      if (i < 0) this.children.push(n); else this.children.splice(i, 0, n);
      return n;
    },
    insertAdjacentElement(къде, n) {
      if (къде === 'afterend') return this.parent && this.parent.insertBefore(n, this.nextSibling);
      if (къде === 'beforebegin') return this.parent && this.parent.insertBefore(n, this);
      if (къде === 'beforeend') return this.appendChild(n);
      if (къде === 'afterbegin') return this.insertBefore(n, this.children[0]);
      throw new Error('insertAdjacentElement: непознато място ' + къде);
    },
    get nextSibling() {
      if (!this.parent) return null;
      const i = this.parent.children.indexOf(this);
      return this.parent.children[i + 1] || null;
    },
    get firstChild() { return this.children[0] || null; },
    get parentNode() { return this.parent; },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; this.isConnected = false; },
    replaceWith(n) { if (this.parent) this.parent.insertBefore(n, this); this.remove(); },
    addEventListener(t, f, o) { (this._lst[t] = this._lst[t] || []).push({ f, once: !!(o && o.once) }); },
    removeEventListener(t, f) { if (this._lst[t]) this._lst[t] = this._lst[t].filter(x => x.f !== f); },
    querySelectorAll(sel) { return всички(this).filter(n => мач(n, sel)); },
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; },
    closest(sel) { let n = this; while (n) { if (мач(n, sel)) return n; n = n.parent; } return null; },
    focus() { ДОКУМЕНТ && (ДОКУМЕНТ.activeElement = this); this._фокусиран = (this._фокусиран || 0) + 1; изстреляй(this, 'focus'); },
    blur() {},
    scrollIntoView() { this._скролнат = (this._скролнат || 0) + 1; },
    _click(mishena) { изстреляй(this, 'click', { target: mishena || this }); },
    _key(k) { изстреляй(this, 'keydown', { key: k, target: this }); },
    _input(v) { if (v !== undefined) this.value = v; изстреляй(this, 'input', { target: this }); }
  };
  Object.defineProperty(e, 'textContent', {
    get() { return this._text + this.children.map(c => c.textContent).join(''); },
    set(v) { this.children = []; this._text = String(v == null ? '' : v); },
    enumerable: true, configurable: true
  });
  Object.defineProperty(e, 'innerHTML', {
    get() { return this._text + this.children.map(c => c.textContent).join(''); },
    set(v) { const r = парсни(String(v == null ? '' : v)); this.children = []; this._text = r._text; r.children.forEach(c => this.appendChild(c)); },
    enumerable: true, configurable: true
  });
  return e;
}
let ДОКУМЕНТ = null;
// балонче нагоре + разнасяне до document (там виси общата чернова)
function изстреляй(възел, тип, доп) {
  const ev = Object.assign({ type: тип, target: възел, key: '', preventDefault() {}, stopPropagation() {} }, доп || {});
  let n = възел;
  while (n) {
    const списък = (n._lst[тип] || []).slice();
    списък.forEach(x => { if (x.once) n._lst[тип] = n._lst[тип].filter(y => y !== x); x.f.call(n, ev); });
    n = n.parent;
  }
  if (ДОКУМЕНТ && ДОКУМЕНТ._lst[тип]) ДОКУМЕНТ._lst[тип].slice().forEach(x => x.f(ev));
}
function всички(n, out) { out = out || []; n.children.forEach(c => { out.push(c); всички(c, out); }); return out; }
// 🪤 Тук се крие най-лесната слепота: селектор, който парсерът не разбира,
//    връща 0 възела и пробата над него става зелена без да е гледала нищо.
//    Затова прост, но ПЪЛЕН разбор на това, което входните файлове ползват:
//    таг, #id, .клас (няколко), [атрибут] и [атрибут="стойност"], с интервал
//    за предшественик и запетая за „или“.
function простМач(n, s) {
  const RX = /([A-Za-z][A-Za-z0-9]*)|#([A-Za-z0-9_-]+)|\.([^\s.#\[]+)|\[([a-zA-Z-]+)(?:="([^"]*)")?\]/g;
  let m, видяно = 0;
  while ((m = RX.exec(s))) {
    видяно++;
    if (m[1]) { if (n.tagName !== m[1].toUpperCase()) return false; }
    else if (m[2]) { if (n.id !== m[2]) return false; }
    else if (m[3]) { if (!n._cls().includes(m[3])) return false; }
    else if (m[4]) {
      const v = n.getAttribute(m[4]);
      if (m[5] === undefined) { if (v === null) return false; }
      else if (v !== m[5]) return false;
    }
  }
  if (!видяно) throw new Error('непознат селектор: „' + s + '“ — парсерът щеше да мълчи');
  return true;
}
function мач(n, sel) {
  return String(sel).split(',').map(s => s.trim()).filter(Boolean).some(s => {
    const части = s.split(/\s+/).filter(Boolean);
    if (!простМач(n, части[части.length - 1])) return false;
    let p = n.parent, i = части.length - 2;
    while (i >= 0) {
      let намерен = false;
      while (p) { if (простМач(p, части[i])) { намерен = true; p = p.parent; break; } p = p.parent; }
      if (!намерен) return false;
      i--;
    }
    return true;
  });
}
function парсни(html) {
  const корен = El('root');
  const стек = [корен];
  const RX = /<(\/?)([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = RX.exec(html))) {
    if (m[5] !== undefined) {
      const t = m[5].replace(/\s+/g, ' ');
      if (t.trim()) стек[стек.length - 1]._text += t;
      continue;
    }
    const затваря = m[1] === '/', таг = m[2].toLowerCase(), сам = m[4] === '/' || VOID.has(таг);
    if (затваря) { if (стек.length > 1) стек.pop(); continue; }
    const n = El(таг);
    const A = /([a-zA-Z0-9_-]+)(?:=("([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    while ((a = A.exec(m[3]))) {
      const име = a[1].toLowerCase();
      const ст = a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : a[5] !== undefined ? a[5] : '';
      n.attrs[име] = ст;
      if (име === 'id') n.id = ст;
      else if (име === 'class') n.className = ст;
      else if (име === 'hidden') n.hidden = true;
      else if (име === 'max') n.max = ст;
      else if (име === 'type') n.type = ст;
      else if (име === 'value') n.value = ст;
      else if (име === 'placeholder') { n.attrs.placeholder = ст; n.placeholder = ст; }
      else if (име.startsWith('data-')) n.dataset[име.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = ст;
    }
    стек[стек.length - 1].appendChild(n);
    if (!сам) стек.push(n);
  }
  return корен;
}

// `пълна: true` = телефон с пълна памет / частен прозорец — точно състоянието,
// в което празната уловка `catch (e) {}` показва успех върху нищо
function склад(начало, пълна) {
  const s = {};
  Object.entries(начало || {}).forEach(([k, v]) => { s[k] = String(v); });
  const def = (k, v) => Object.defineProperty(s, k, { value: v, enumerable: false });
  def('getItem', k => (Object.prototype.hasOwnProperty.call(s, k) ? String(s[k]) : null));
  def('setItem', (k, v) => {
    if (пълна) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
    Object.defineProperty(s, k, { value: String(v), enumerable: true, writable: true, configurable: true });
  });
  def('removeItem', k => { delete s[k]; });
  def('clear', () => { Object.keys(s).forEach(k => delete s[k]); });
  def('key', i => Object.keys(s)[i] || null);
  Object.defineProperty(s, 'length', { get: () => Object.keys(s).length, enumerable: false });
  return s;
}

// ═══════════════ ПЯСЪЧНИК ═══════════════
// `патчове` = { 'js/askfield.js': текст => новТекст } — за самопроверката.
function пясъчник(опции) {
  опции = опции || {};
  const корен = парсни(опции.разметка || '<div id="roRoom"></div>');
  const дн = {
    cheer: [], confetti: 0, buzz: [], greet: 0, refresh: 0, отворени: [],
    ask: [], tab: [], таймери: [], интервали: []
  };
  const w = {};
  Object.assign(w, {
    console, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent
  });
  w.setTimeout = (f, ms) => { дн.таймери.push({ f, ms }); return дн.таймери.length; };
  w.clearTimeout = () => {};
  w.setInterval = (f, ms) => { дн.интервали.push({ f, ms }); return дн.интервали.length; };
  w.clearInterval = () => {};
  w.requestAnimationFrame = f => { дн.таймери.push({ f, ms: 0 }); return 0; };
  w.localStorage = склад(опции.склад, опции.пълнаПамет);
  w.BL_ZAPIS_PADNA = () => { дн.провалКазан = (дн.провалКазан || 0) + 1; };
  w.CustomEvent = function (t, o) { return { type: t, detail: (o || {}).detail }; };
  w.MutationObserver = function (cb) { дн.наблюдатели = (дн.наблюдатели || 0) + 1; this._cb = cb; this.живо = true; this.observe = () => {}; this.disconnect = () => { this.живо = false; }; };
  w.IntersectionObserver = function (cb) { this._cb = cb; this._цели = []; this.observe = n => this._цели.push(n); this.unobserve = () => {}; this.disconnect = () => {}; };

  const тяло = El('body');
  const док = {
    documentElement: El('html'), body: тяло, head: El('head'),
    readyState: 'loading', activeElement: null,
    createElement: t => El(t),
    getElementById: id => всички(корен).find(n => n.id === id) || (корен.id === id ? корен : null) || null,
    querySelector: s => всички(корен).filter(n => мач(n, s))[0] || null,
    querySelectorAll: s => всички(корен).filter(n => мач(n, s)),
    _lst: {},
    addEventListener(t, f) { (док._lst[t] = док._lst[t] || []).push({ f }); },
    removeEventListener() {},
    dispatchEvent(ev) { (док._lst[ev.type] || []).forEach(x => x.f(ev)); return true; }
  };
  ДОКУМЕНТ = док;
  w.document = док;
  w.addEventListener = () => {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '', reload() { дн.reload = (дн.reload || 0) + 1; } };
  w.history = { state: null, pushState() {}, replaceState() {}, back() {} };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;

  // ── съседите: записваме какво им е поискано, не рисуваме ──
  w.BL_FX = {
    buzz(n) { дн.buzz.push(n); },
    confetti() { дн.confetti++; },
    cheer(t) { дн.cheer.push(t === undefined ? '(без текст)' : String(t)); },
    pop() {}, chime() {}, countUp() {}
  };
  w.BL_GREET = () => { дн.greet++; };
  w.BL_PROFILE = { refresh() {} };
  w.refreshToday = () => { дн.refresh++; };
  w.ROOM_FEATURES = опции.roomFeatures || {};
  w.MamaHelper = {
    persona: r => (ПЕРСОНИ[r] || null),
    showTab: t => дн.tab.push(t),
    ask: (t) => { if (опции.askГърми) throw new Error('чатът не пое въпроса'); дн.ask.push(t); },
    open: r => дн.отворени.push(r),
    close() {}
  };
  Object.assign(w, опции.глобални || {});

  (опции.файлове || []).forEach(f => {
    let src = R(f);
    if (опции.патчове && опции.патчове[f]) src = опции.патчове[f](src);
    new vm.Script(src, { filename: f }).runInContext(w);
  });
  док.readyState = 'complete';
  (док._lst.DOMContentLoaded || []).forEach(x => x.f({ type: 'DOMContentLoaded' }));
  return { w, док, корен, дн, $: id => док.getElementById(id), пусниТаймери: () => { const т = дн.таймери.splice(0); т.forEach(x => { try { x.f(); } catch (e) {} }); } };
}

// истинските персони — взети от живия helper.js, не измислени
const ПЕРСОНИ = {};
(function вземиПерсони() {
  try {
    const W = {};
    Object.assign(W, { console: { log() {}, warn() {}, error() {} }, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error, Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent });
    W.setTimeout = () => 0; W.clearTimeout = () => {}; W.setInterval = () => 0; W.clearInterval = () => {};
    W.localStorage = склад({});
    W.document = { documentElement: {}, body: {}, head: {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, querySelectorAll: () => [], addEventListener() {} }), getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, readyState: 'complete' };
    W.addEventListener = () => {};
    W.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    W.requestAnimationFrame = () => 0;
    W.getComputedStyle = () => ({ getPropertyValue: () => '' });
    W.navigator = { userAgent: 'node', language: 'bg' };
    W.location = { href: 'http://localhost/', search: '', hash: '' };
    W.window = W; vm.createContext(W); W.globalThis = W;
    new vm.Script(R('js/kb.js'), { filename: 'kb.js' }).runInContext(W);
    new vm.Script(R('js/helper.js'), { filename: 'helper.js' }).runInContext(W);
    ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама',
      'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията'].forEach(r => {
        const p = W.MamaHelper && W.MamaHelper.persona(r);
        if (p) ПЕРСОНИ[r] = p;
      });
  } catch (e) { console.log('💥 персоните не се заредиха: ' + e.message); }
})();

// ═══════════════════════════════════════════════════════════
// ЧАСТ 1 · ИНВЕНТАР — колко елемента изобщо СЪЩЕСТВУВАТ
// ═══════════════════════════════════════════════════════════
console.log('═══ 🚪 ПЪРВАТА ВРАТА ═══');
console.log('   персони от живия helper.js: ' + Object.keys(ПЕРСОНИ).length + ' (0 значи, че съм сляп за персоните)');

const ИНВ = [];
const СЪЗДАВА = /(?:\bel|createElement)\s*\(\s*['"](button|input|textarea|select|a)['"]/g;
const РАЗМЕТКА = /<(button|input|textarea|select)\b/gi;
const СЛУШАЧ = /addEventListener\s*\(\s*['"](click|keydown|keyup|input|change|focus|blur|submit|touchstart|touchend|touchmove)['"]/g;

function преброй(път, src) {
  const без = src.replace(/^\s*\/\/.*$/gm, '');            // редовите коментари не са код
  const създадени = [...без.matchAll(СЪЗДАВА)].map(m => m[1]);
  const вРазметка = [...без.matchAll(РАЗМЕТКА)].map(m => m[1].toLowerCase());
  const слушачи = [...без.matchAll(СЛУШАЧ)].map(m => m[1]);
  const запис = /localStorage\.setItem|\bsave\s*\(/g;
  const записи = (без.match(запис) || []).length;
  const ред = {
    път,
    създадени: създадени.length, вРазметка: вРазметка.length, слушачи: слушачи.length,
    записи,
    видове: [...new Set(създадени.concat(вРазметка))].sort().join('/') || '—',
    събития: [...new Set(слушачи)].sort().join('/') || '—'
  };
  ИНВ.push(ред);
  return ред;
}

глава('ЧАСТ 1 · ИНВЕНТАР НА ВХОДНИТЕ ФАЙЛОВЕ');
console.log('   ' + 'файл'.padEnd(20) + ' контроли  слушачи  записи   видове');
МОИ.forEach(f => {
  const р = преброй(f, R(f));
  console.log('   ' + f.replace('js/', '').padEnd(20) +
    String(р.създадени + р.вРазметка).padStart(6) + String(р.слушачи).padStart(9) +
    String(р.записи).padStart(9) + '   ' + р.видове + ' · ' + р.събития);
});
// + истинската разметка на онбординга от index.html
const онбHtml = (() => {
  const h = R('index.html');
  const i = h.indexOf('id="onbOverlay"');
  if (i < 0) return '';
  const o = h.lastIndexOf('<div', i);
  let d = 0, e = -1; const RX = /<(\/?)div\b[^>]*>/g; RX.lastIndex = o; let m;
  while ((m = RX.exec(h))) { d += m[1] ? -1 : 1; if (d === 0) { e = m.index + m[0].length; break; } }
  return e < 0 ? '' : h.slice(o, e);
})();
const онбДърво = парсни(онбHtml);
const онбКонтроли = всички(онбДърво).filter(n => ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(n.tagName));
console.log('   ' + 'index.html #onbOverlay'.padEnd(20) + String(онбКонтроли.length).padStart(6) + '        —        —   ' +
  онбКонтроли.map(n => n.id || n.dataset.sex || n.tagName).join(', '));

const ОБЩО_КОНТРОЛИ = ИНВ.reduce((s, x) => s + x.създадени + x.вРазметка, 0) + онбКонтроли.length;
const ОБЩО_СЛУШАЧИ = ИНВ.reduce((s, x) => s + x.слушачи, 0);
console.log('\n   ПРЕГЛЕДАНИ: ' + МОИ.length + ' файла + разметката на онбординга');
console.log('   ОБЩО КОНТРОЛИ (полета/бутони): ' + ОБЩО_КОНТРОЛИ);
console.log('   ОБЩО СЛУШАЧИ НА СЪБИТИЯ:       ' + ОБЩО_СЛУШАЧИ);
console.log('   ОБЩО ЗАПИСИ В ПАМЕТТА:         ' + ИНВ.reduce((s, x) => s + x.записи, 0));
if (ОБЩО_КОНТРОЛИ < 20 || ОБЩО_СЛУШАЧИ < 20) {
  console.log('   💥 под прага — четецът е сляп, нищо по-долу не важи');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════
// ЧАСТ 2 · ЖИВАТА ОБИКОЛКА — стъпка по стъпка, като мама
// Всяка проба съди по ЕДНО от петте: РЕАГИРА · ЗАПИСВА · ПОКАЗВА ·
// ОЦЕЛЯВА · НЕ ЛЪЖЕ. Броят на изиграните стъпки се печата накрая.
// ═══════════════════════════════════════════════════════════
let СТЪПКИ = 0;
const стъпка = () => { СТЪПКИ++; };

// час по поръчка — иначе нощният режим е непроверим денем
function ЧасовникДата(ms) {
  return class D extends Date {
    constructor(...a) { if (!a.length) super(ms); else super(...a); }
    static now() { return ms; }
  };
}
const днесНиз = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама',
  'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията'];
const празниСтаи = () => { const o = {}; СТАИ.forEach(r => { o[r] = () => {}; }); return o; };

// ── общ строител на полето на помощничката ──
function полеЗа(стая, начало, патчове, опции) {
  const s = пясъчник(Object.assign({
    файлове: ['js/askfield.js'], склад: начало || {}, roomFeatures: празниСтаи(), патчове
  }, опции || {}));
  const root = El('div'); root.id = 'roRoom';
  s.w.ROOM_FEATURES[стая](root);
  const карта = root.querySelector('.ask-card');
  return {
    s, root, карта,
    inp: карта && карта.querySelector('.ask-inp'),
    прати: карта && карта.querySelector('.ask-send'),
    чипове: карта ? карта.querySelectorAll('.ask-chip') : [],
    посл: карта && карта.querySelector('.ask-last')
  };
}
const видимТекст = n => (n ? (n.textContent || '').replace(/\s+/g, ' ').trim() : '');

// ═══════ 2.1 ПОЛЕТО НА ПОМОЩНИЧКАТА (askfield.js) ═══════
глава('2.1 ГЛАВНОТО ПОЛЕ ЗА ПИСАНЕ · Моето бебе');
{
  const A = полеЗа('Моето бебе');
  стъпка();
  if (!A.карта || !A.inp || !A.прати) {
    bad('полето изобщо не се построи — всичко по-долу е безпредметно');
  } else {
    инфо('построени: 1 поле + 1 бутон „изпрати“ + ' + A.чипове.length + ' чипа');

    // ── РЕАГИРА · ЗАПИСВА · ПОКАЗВА ──
    стъпка();
    A.inp.value = 'плаче вечер';
    A.прати._click();
    A.s.дн.ask.length === 1 && A.s.дн.ask[0] === 'плаче вечер'
      ? ok('РЕАГИРА: написаното стига до двигателя') : bad('написаното НЕ стига до двигателя');
    A.s.дн.tab.includes('chat')
      ? ok('ПОКАЗВА: скача в чат-таба, където ще е отговорът') : bad('не завежда мама там, където е отговорът');
    (A.s.w.localStorage.getItem('bl_ask_last') || '').includes('плаче вечер')
      ? ok('ЗАПИСВА: последният въпрос остава в паметта') : bad('последният въпрос не се пази');

    // ── ОЦЕЛЯВА ЛИ НАПИСАНОТО ──
    стъпка();
    const Б = полеЗа('Моето бебе');
    Б.inp._input('защо не спи следобед');          // мама пише, но НЕ праща
    const склад2 = {}; Object.keys(Б.s.w.localStorage).forEach(k => { склад2[k] = Б.s.w.localStorage.getItem(k); });
    const В = полеЗа('Моето бебе', склад2);        // затваря стаята и я отваря пак
    В.inp && В.inp.value === 'защо не спи следобед'
      ? ok('ОЦЕЛЯВА: написаното е още в полето след затваряне/презареждане')
      : bad('🔴 полето ГУБИ написаното при затваряне на стаята и при презареждане');
    Б.inp.dataset && Б.inp.dataset.draft
      ? ok('полето обявява чернова (data-draft) — общият пазач в daily.js я пише на всяко натискане')
      : bad('🔴 полето не обявява чернова — нищо не я пази');

    // ── ПРАЗНО ИЗПРАЩАНЕ: реагира ли изобщо ──
    стъпка();
    const Г = полеЗа('Моето бебе');
    const предиТекст = видимТекст(Г.карта);
    Г.inp.value = '';
    Г.прати._click();
    const следТекст = видимТекст(Г.карта);
    следТекст !== предиТекст
      ? ok('РЕАГИРА на празно изпращане с ВИДИМИ думи')
      : bad('🔴 празно ➤ не казва нищо — мама натиска и „нищо не става“');
    (Г.inp._фокусиран || 0) > 0 ? ok('курсорът отива в полето') : bad('курсорът не отива в полето');

    // ── ДВОЙНО НАТИСКАНЕ НА ЧИП ──
    стъпка();
    const Д = полеЗа('Моето бебе');
    if (Д.чипове.length) {
      Д.чипове[0]._click(); Д.чипове[0]._click();
      Д.s.дн.ask.length === 1
        ? ok('двойното натискане на чип праща ЕДИН въпрос')
        : bad('🟠 двойно натискане на чип праща ' + Д.s.дн.ask.length + ' въпроса');
    } else bad('няма нито един чип — не мога да меря двойното натискане');

    // ── КОГАТО ДВИГАТЕЛЯТ ГРЪМНЕ ──
    стъпка();
    const Е = полеЗа('Моето бебе', null, null, { askГърми: true });
    Е.inp.value = 'страх ме е';
    let гръмна = false;
    try { Е.прати._click(); } catch (e) { гръмна = true; }
    const оцеляло = Е.inp.value === 'страх ме е';
    оцеляло && !гръмна
      ? ok('НЕ ЛЪЖЕ: щом чатът не поеме въпроса, думите ѝ се връщат в полето')
      : bad('🔴 при провал думите на мама изчезват' + (гръмна ? ' (и грешката излита нагоре)' : ''));
    видимТекст(Е.карта).length > видимТекст(полеЗа('Моето бебе').карта).length
      ? ok('НЕ ЛЪЖЕ: провалът се КАЗВА') : bad('🔴 провалът минава мълчаливо');

    // ── „последно попита“: води ли донякъде ──
    стъпка();
    const посл = {}; посл['Моето бебе'] = { q: 'колко трябва да спи', d: днесНиз() };
    const Ж = полеЗа('Моето бебе', { bl_ask_last: JSON.stringify(посл) });
    if (!Ж.посл) bad('бутонът „последно попита“ не се появи, макар да има записан въпрос');
    else {
      Ж.посл._click();
      const върнато = Ж.inp.value === 'колко трябва да спи';
      const питано = Ж.s.дн.ask.length > 0;
      върнато || питано
        ? ok('НЕ ЛЪЖЕ: „последно попита“ наистина ВРЪЩА въпроса (' + (върнато ? 'в полето' : 'пита пак') + ')')
        : bad('🔴 „последно попита“ само сменя таба — чатът не се пази, мама вижда празно');
    }

    // ── клавиатурата на телефона ──
    стъпка();
    const З = полеЗа('Моето бебе');
    З.inp.focus(); З.s.пусниТаймери();
    (З.inp._скролнат || 0) > 0
      ? ok('при фокус полето се издърпва над клавиатурата')
      : bad('🟠 клавиатурата може да покрие полето — няма scrollIntoView при фокус');
  }
}

// ═══════ 2.2 ВЪПРОСЪТ ЗА ДЕНЯ (firstday.js) ═══════
глава('2.2 ВЪПРОСЪТ 1/30 НА ЕКРАНА „ДНЕС“');
function екранДнес(начало, патчове, час) {
  const о = { файлове: ['js/firstday.js'], склад: начало || {}, roomFeatures: празниСтаи(), патчове };
  if (час) о.глобални = {};
  const s = пясъчник(о);
  if (час) { /* часът се подава само където има значение */ }
  const c = El('div');
  const inner = El('div'); inner.className = 'td-inner'; c.appendChild(inner);
  s.w.BL_TODAY_BIND(c, {}, null);
  return { s, c, inner, q30: inner.querySelector('.fd-q30'), тон: inner.querySelector('.fd-tone') };
}
{
  // ден 2+, за да не е „тихият пръв ден“
  const вчера = new Date(Date.now() - 86400000);
  const д1 = вчера.getFullYear() + '-' + String(вчера.getMonth() + 1).padStart(2, '0') + '-' + String(вчера.getDate()).padStart(2, '0');
  const база = { bl_day1: JSON.stringify(д1) };

  стъпка();
  const A = екранДнес(база);
  if (!A.q30) bad('картата с въпроса за деня не се построи');
  else {
    const вход = A.q30.querySelector('.fd-qi'), бут = A.q30.querySelector('.fd-qb');
    инфо('построени: 1 поле + 1 бутон „✔“');

    // ОЦЕЛЯВА
    стъпка();
    вход._input('днес се смя за пръв път');
    const с2 = {}; Object.keys(A.s.w.localStorage).forEach(k => { с2[k] = A.s.w.localStorage.getItem(k); });
    const Б = екранДнес(с2);
    const вход2 = Б.q30 && Б.q30.querySelector('.fd-qi');
    вход2 && вход2.value === 'днес се смя за пръв път'
      ? ok('ОЦЕЛЯВА: недописаният отговор се връща в полето')
      : bad('🔴 недописаният отговор изчезва при пре-рисуване/презареждане');
    вход.dataset && вход.dataset.draft ? ok('полето обявява чернова (data-draft)') : bad('🔴 полето не обявява чернова');

    // РЕАГИРА · ЗАПИСВА · ПОКАЗВА
    стъпка();
    const В = екранДнес(база);
    const вх = В.q30.querySelector('.fd-qi'), бт = В.q30.querySelector('.fd-qb');
    вх.value = 'първата усмивка'; бт._click();
    const q30 = JSON.parse(В.s.w.localStorage.getItem('bl_q30') || '{}');
    Object.values(q30.a || {}).includes('първата усмивка') ? ok('ЗАПИСВА: отговорът влиза в bl_q30') : bad('отговорът не се записва');
    (В.s.w.localStorage.getItem('bl_prompt_log') || '').includes('първата усмивка') ? ok('ЗАПИСВА: влива се и в дневника (Реката го вижда)') : bad('отговорът не стига до дневника');
    // резултатът се търси в ЦЕЛИЯ екран „Днес“, не в старата карта — тя може
    // и да е сменена с друга; мама гледа екрана, не възела
    видимТекст(В.inner).includes('Записано') ? ok('ПОКАЗВА: казва „Записано“') : bad('не показва резултат');

    // ИЗХОД НАЗАД
    стъпка();
    const с3 = {}; Object.keys(В.s.w.localStorage).forEach(k => { с3[k] = В.s.w.localStorage.getItem(k); });
    const Г = екранДнес(с3);
    const имаПоправка = !!(Г.inner.querySelector('.fd-q30fix') ||
      /поправ|допиш|промен/i.test(видимТекст(Г.inner)));
    имаПоправка
      ? ok('ИЗХОД НАЗАД: днешният отговор може да се поправи')
      : bad('🔴 отговорът се заключва за 24 часа — сгрешена дума не може да се пипне');
  }

  // ✕ „не питай повече“ — има ли връщане
  стъпка();
  const Д = екранДнес(база);
  if (!Д.тон) bad('редът с тона не се построи');
  else {
    const х = Д.тон.querySelectorAll('.fd-tx')[0];
    const отговори = Д.тон.querySelectorAll('.fd-tb');
    инфо('построени: ' + отговори.length + ' отговора + 1 „✕“');
    х._click();
    Д.s.w.localStorage.getItem('bl_tone_off') === 'true'
      ? инфо('✕ записа bl_tone_off = true') : инфо('✕ не записа нищо');
    const текстСлед = видимТекст(Д.inner);
    /върн|размисл|пак|отмен/i.test(текстСлед)
      ? ok('ИЗХОД НАЗАД: след ✕ има как да се размисли')
      : bad('🟠 ✕ е необратим с едно докосване — никъде в приложението няма връщане');
  }
}

// ═══════ 2.3 ИГРИТЕ ЗА МАМА (calm.js) ═══════
глава('2.3 ДИШАНЕТО И „ПОДРЕДИ МИСЛИТЕ“ · Дневник на мама');
{
  стъпка();
  const s = пясъчник({ файлове: ['js/calm.js'], roomFeatures: празниСтаи() });
  const root = El('div');
  s.w.ROOM_FEATURES['Дневник на мама'](root);
  const карти = root.querySelectorAll('.jr-card');
  инфо('построени карти: ' + карти.length + ' · бутони: ' + root.querySelectorAll('button').length +
    ' · полета: ' + root.querySelectorAll('textarea').length);
  const дишане = карти.find(c => видимТекст(c).includes('Дишай с формата'));
  const мисли = карти.find(c => видимТекст(c).includes('Подреди мислите'));

  // дишането — има ли изход
  стъпка();
  if (!дишане) bad('картата за дишане не се построи');
  else {
    const b = дишане.querySelectorAll('button').find(x => видимТекст(x).includes('Дишай с мен'));
    b._click();
    const спиране = дишане.querySelectorAll('button').some(x => /спри|стоп|стига|достатъчно/i.test(видимТекст(x)));
    спиране
      ? ok('ИЗХОД НАЗАД: започнатото дишане може да се спре')
      : bad('🔴 57 секунди без спирачка — мама не може да излезе от започнатото');
  }

  // „Подреди мислите“ — празно поле
  стъпка();
  if (!мисли) bad('картата „Подреди мислите“ не се построи');
  else {
    const t = мисли.querySelector('textarea');
    const b = мисли.querySelectorAll('button').find(x => видимТекст(x).includes('Подреди'));
    const преди = видимТекст(мисли);
    b._click();
    видимТекст(мисли) !== преди
      ? ok('РЕАГИРА: празното „Подреди“ обяснява какво се иска')
      : bad('🔴 празното „Подреди“ мълчи');
    // обещанието „нищо не се записва“ — ДЪРЖИ ЛИ СЕ
    стъпка();
    t.value = 'пране\nда звънна на лекаря'; b._click();
    const ключове = Object.keys(s.w.localStorage);
    ключове.length === 0
      ? ok('НЕ ЛЪЖЕ: „Нищо не се записва“ е вярно — нула ключа след подреждането')
      : bad('🔴 обещава „нищо не се записва“, а записа: ' + ключове.join(', '));
  }
}

// ═══════ 2.4 НОЩТА — изяжда ли съобщения (night.js / firstday.js) ═══════
глава('2.4 НОЩЕМ И „НА РЪБА“: КОЕ СЕ ЧУВА И КОЕ СЕ ИЗЯЖДА');
// истинските текстове, които ДРУГИ файлове пращат по същия канал (BL_FX.cheer)
const ВАЖНИ = [
  ['js/expr.js:148', 'Паметта се напълни — изтрий нещо старо. 😕'],
  ['js/extras2.js:238', 'Паметта се напълни — изтрий стара снимка. 😕'],
  ['js/rooms17.js:85', 'Паметта се напълни. 😕'],
  ['js/games2.js:349', 'Камерата не е позволена — от настройките на браузъра, ако размислиш.'],
  ['js/extras.js:1016', 'Не чух нищо. Ако телефонът пита за микрофона — разреши му, или просто пиши 💜'],
  ['js/printbox.js:59', 'Картата е в тази стая — превърти надолу 👇'],
  ['js/dev.js:270', 'Чака те при въпросите за педиатъра, в „Моето бебе“ 💜']
];
const ПРАЗНИЦИ = [
  ['js/daily.js:431', 'Трите за днес — готови! 🎉'],
  ['js/dev.js:231', 'Ново умение! Дървото цъфна 🌳'],
  ['js/rooms2.js:2435', 'Лексиконът е пълен! 🌟'],
  ['(без аргумент)', undefined]
];
// нощта се мери в ИСТИНСКИЯ ред на зареждане (index.html:1469 firstday,
// :1477 night) — правилото „кое е празник“ живее в първия и се ползва от втория
function нощенПясъчник(патчове) {
  const три = new Date(); три.setHours(3, 12, 0, 0);
  return пясъчник({
    файлове: ['js/firstday.js', 'js/night.js'],
    roomFeatures: празниСтаи(),
    глобални: { Date: ЧасовникДата(три.getTime()) },
    патчове
  });
}
{
  стъпка();
  // 03:12 — часът, за който е писан целият файл
  const s = нощенПясъчник();
  // night.js прочете часа при зареждане; проверяваме самия пазач
  s.w.BL_NIGHT.е() ? инфо('часът в пясъчника е 03:12 — нощ ✔') : инфо('⚠ часът не е нощен, пробата е безсмислена');
  инфо('прегледани съобщения: ' + (ВАЖНИ.length + ПРАЗНИЦИ.length) + ' (' + ВАЖНИ.length + ' важни · ' + ПРАЗНИЦИ.length + ' празнични) — истински текстове от 11 чужди файла');

  const преди = s.дн.cheer.length;
  ВАЖНИ.forEach(([, т]) => s.w.BL_FX.cheer(т));
  const минали = s.дн.cheer.length - преди;
  минали === ВАЖНИ.length
    ? ok('НЕ ЛЪЖЕ: нощем важните съобщения (пълна памет, камера, „картата е тук“) СТИГАТ до мама')
    : bad('🔴 нощем се изяждат ' + (ВАЖНИ.length - минали) + ' от ' + ВАЖНИ.length + ' ВАЖНИ съобщения — мама натиска и не научава нищо');

  стъпка();
  const преди2 = s.дн.cheer.length;
  ПРАЗНИЦИ.forEach(([, т]) => s.w.BL_FX.cheer(т));
  s.дн.cheer.length === преди2
    ? ok('в 3 сутринта не се празнува (всички празнични надписи мълчат)')
    : bad('🟠 в 3 сутринта още гърми празник: ' + s.дн.cheer.slice(преди2).join(' | '));
  const кПреди = s.дн.confetti; s.w.BL_FX.confetti();
  s.дн.confetti === кПреди ? ok('конфетите мълчат нощем (12.11.6)') : bad('конфети в 3 сутринта');
}
{
  стъпка();
  const тон = { d: днесНиз(), v: 'на ръба' };
  const s = пясъчник({ файлове: ['js/firstday.js'], склад: { bl_day_tone: JSON.stringify(тон) }, roomFeatures: празниСтаи() });
  const преди = s.дн.cheer.length;
  ВАЖНИ.forEach(([, т]) => s.w.BL_FX.cheer(т));
  const минали = s.дн.cheer.length - преди;
  минали === ВАЖНИ.length
    ? ok('НЕ ЛЪЖЕ: и в ден „🫂 на ръба“ важните съобщения стигат до мама')
    : bad('🔴 в ден „на ръба“ се изяждат ' + (ВАЖНИ.length - минали) + ' от ' + ВАЖНИ.length + ' важни съобщения');
  const преди2 = s.дн.cheer.length;
  ПРАЗНИЦИ.forEach(([, т]) => s.w.BL_FX.cheer(т));
  s.дн.cheer.length === преди2
    ? ok('в ден „на ръба“ не се празнува') : bad('🟠 в ден „на ръба“ още се празнува');
}

// ═══════ 2.5 ОНБОРДИНГЪТ НОЩЕМ (onboard.js + night.js) ═══════
глава('2.5 НОВА МАМА ЗАВЪРШВА ЗАПОЗНАВАНЕТО В 3 СУТРИНТА');
{
  стъпка();
  const три = new Date(); три.setHours(3, 12, 0, 0);
  const s = пясъчник({
    файлове: ['js/expect.js', 'js/onboard.js', 'js/night.js'],
    склад: { bl_tour_done: '1' }, разметка: онбHtml,
    глобални: { Date: ЧасовникДата(три.getTime()) }
  });
  s.w.BL_ONBOARD.open();
  const мом = s.$('onbSex').querySelectorAll('.onb-sexbtn').find(b => b.dataset.sex === 'girl');
  мом._click(мом);
  s.$('onbName').value = 'Мила';
  const преди90 = new Date(Date.now() - 90 * 86400000);
  s.$('onbDate').value = преди90.getFullYear() + '-' + String(преди90.getMonth() + 1).padStart(2, '0') + '-' + String(преди90.getDate()).padStart(2, '0');
  s.$('onbSave')._click(s.$('onbSave'));
  const записано = (s.w.localStorage.getItem('bl_baby') || '').includes('Мила');
  записано ? ok('ЗАПИСВА: нощем данните на бебето влизат както денем') : bad('нощем записът пада');
  s.$('onbOverlay').hidden ? ok('ПОКАЗВА: екранът се затваря — видим знак, че е минало') : bad('екранът не се затваря');
  s.дн.cheer.length
    ? ok('нощем мама пак получава дума („' + s.дн.cheer.join(' | ') + '“)')
    : инфо('нощем поздравът мълчи — правилно е (празник в 3 ч.), затварянето на екрана носи знака');
}

// ═══════ 2.6 ЛЕНТАТА „ДОКЪДЕ СИ СТИГНАЛА“ (iface.js) ═══════
глава('2.6 „РАЗГЛЕДАНИ N ОТ M КЪТЧЕТА“ — ЧЕСТНО ЛИ Е ЧИСЛОТО');
{
  стъпка();
  const видени = { 'Моето бебе': { a: 1, b: 1, c: 1, d: 1, izchezna1: 1, izchezna2: 1 } };
  const s = пясъчник({ файлове: ['js/iface.js'], склад: { bl_seen_cards: JSON.stringify(видени) } });
  const roRoom = El('div'); roRoom.id = 'roRoom';
  const toc = El('section'); toc.className = 'jr-card toc-card';
  const заг = El('h4'); заг.className = 'jr-title'; заг.textContent = 'Съдържание';
  toc.appendChild(заг); roRoom.appendChild(toc);
  ['a', 'b', 'c', 'd'].forEach(k => { const c = El('section'); c.className = 'jr-card'; c.dataset.blkey = k; c.setAttribute('data-blkey', k); roRoom.appendChild(c); });
  s.корен.appendChild(roRoom);
  инфо('прегледани: 4 живи кътчета в стаята срещу 6 запомнени (2 вече не съществуват)');
  s.w.BL_IFACE.обновиЛента('Моето бебе');
  const текст = видимТекст(toc.querySelector('.toc-progtxt'));
  инфо('лентата пише: „' + текст + '“');
  текст.includes('всичко')
    ? ok('4 от 4 наистина видени → „Разгледала си всичко“ (при 6 запомнени срещу 4 живи)')
    : bad('лентата не стига до 4/4');

  // обратната посока: 2 видени от 4 живи не бива да е „всичко“
  стъпка();
  const s2 = пясъчник({ файлове: ['js/iface.js'], склад: { bl_seen_cards: JSON.stringify({ 'Моето бебе': { a: 1, izchezna1: 1, izchezna2: 1, izchezna3: 1 } }) } });
  const r2 = El('div'); r2.id = 'roRoom';
  const t2 = El('section'); t2.className = 'jr-card toc-card';
  const з2 = El('h4'); з2.className = 'jr-title'; з2.textContent = 'Съдържание'; t2.appendChild(з2); r2.appendChild(t2);
  ['a', 'b', 'c', 'd'].forEach(k => { const c = El('section'); c.className = 'jr-card'; c.setAttribute('data-blkey', k); r2.appendChild(c); });
  s2.корен.appendChild(r2);
  s2.w.BL_IFACE.обновиЛента('Моето бебе');
  const т2 = видимТекст(t2.querySelector('.toc-progtxt'));
  инфо('1 живо видяно + 3 изчезнали запомнени → лентата пише: „' + т2 + '“');
  т2.includes('1 от 4')
    ? ok('НЕ ЛЪЖЕ: броят се само ЖИВИТЕ кътчета, изчезналите не се броят')
    : bad('🟠 лентата брои и кътчета, които вече ги няма в стаята — „' + т2 + '“ вместо „Разгледани 1 от 4“');
}

// ═══════ 2.7 ЗНАЧКАТА НА РАФТА ПРИ СМЯНА НА СТАЯ (iface.js) ═══════
глава('2.7 ПАЗАЧЪТ НА ЗНАЧКАТА ОЦЕЛЯВА ЛИ СМЯНАТА НА СТАЯ');
{
  стъпка();
  const МО = [];
  const s = пясъчник({ файлове: ['js/iface.js'] });
  s.w.MutationObserver = function (cb) { МО.push(this); this.живо = false; this.observe = () => { this.живо = true; }; this.disconnect = () => { this.живо = false; }; };
  // строим общата обвивка на стаята
  const ov = El('div'); ov.id = 'roomOverlay'; ov.hidden = false;
  const бан = El('div'); бан.id = 'roBanner';
  const табове = El('div'); табове.id = 'roTabs';
  const таб = El('button'); таб.setAttribute('data-tab', 'articles'); таб.dataset.tab = 'articles'; табове.appendChild(таб);
  const rr = El('div'); rr.id = 'roRoom';
  s.корен.appendChild(ov); s.корен.appendChild(бан); s.корен.appendChild(табове); s.корен.appendChild(rr);
  s.w.BL_ARTICLES = { forRoom: r => (r === 'Здраве и SOS' ? [1, 2, 3] : []) };
  s.w.MamaHelper.open('Здраве и SOS'); s.пусниТаймери();
  const живиСлед1 = МО.filter(x => x.живо).length;
  s.w.MamaHelper.open('Инструменти'); s.пусниТаймери();   // стая БЕЗ статии
  const живиСлед2 = МО.filter(x => x.живо).length;
  инфо('прегледани: 2 отваряния на стая · създадени пазачи: ' + МО.length + ' · живи след 1-вата: ' + живиСлед1 + ' · след 2-рата: ' + живиСлед2);
  живиСлед2 === 0
    ? ok('пазачът от предишната стая се изключва при влизане в стая без статии')
    : bad('🟠 пазачът на „Здраве и SOS“ остава жив в чужда стая — може да лепи значка не на място');
}

// ═══════ 2.8 ТЕЛЕФОН С ПЪЛНА ПАМЕТ — казва ли се истината ═══════
глава('2.8 ПЪЛНА ПАМЕТ / ЧАСТЕН ПРОЗОРЕЦ: УСПЕХ ЛИ СЕ ПОКАЗВА ВЪРХУ НИЩО');
{
  // онбордингът
  стъпка();
  const s = пясъчник({
    файлове: ['js/expect.js', 'js/onboard.js'], склад: { bl_tour_done: '1' },
    разметка: онбHtml, пълнаПамет: true
  });
  s.w.BL_ONBOARD.open();
  const мом = s.$('onbSex').querySelectorAll('.onb-sexbtn').find(b => b.dataset.sex === 'girl');
  мом._click(мом);
  s.$('onbName').value = 'Мила';
  s.$('onbSave')._click(s.$('onbSave'));
  инфо('прегледано: 1 пълен онбординг при склад, който хвърля при всеки запис');
  s.дн.cheer.length === 0
    ? ok('НЕ ЛЪЖЕ: при провалил се запис няма поздрав „Радвам се, че сте тук“')
    : bad('🔴 показва „' + s.дн.cheer.join(' | ') + '“ върху запис, който не е минал');
  (s.дн.провалКазан || 0) > 0 ? ok('провалът се съобщава (BL_ZAPIS_PADNA)') : bad('🔴 провалът минава мълчаливо');
  const съоб = s.$('onbSay');
  съоб && !съоб.hidden && видимТекст(съоб).length > 10
    ? ok('в самата карта стои какво да направи') : bad('картата не казва нищо');
  // изходът назад е ЦЯЛ и при провал
  const пропусни = s.$('onbSkip');
  пропусни._click(пропусни);
  s.$('onbOverlay').hidden ? ok('ИЗХОД НАЗАД: „По-късно“ работи и при счупен склад') : bad('🔴 мама остава заключена в първия екран');

  // въпросът за деня
  стъпка();
  const вчера = new Date(Date.now() - 86400000);
  const д1 = вчера.getFullYear() + '-' + String(вчера.getMonth() + 1).padStart(2, '0') + '-' + String(вчера.getDate()).padStart(2, '0');
  const f = пясъчник({ файлове: ['js/firstday.js'], склад: { bl_day1: JSON.stringify(д1) }, roomFeatures: празниСтаи(), пълнаПамет: true });
  const c = El('div'); const inner = El('div'); inner.className = 'td-inner'; c.appendChild(inner);
  f.w.BL_TODAY_BIND(c, {}, null);
  const к = inner.querySelector('.fd-q30');
  if (!к) bad('картата с въпроса не се построи при пълна памет');
  else {
    const в = к.querySelector('.fd-qi'), б = к.querySelector('.fd-qb');
    в.value = 'първите три часа сън'; б._click();
    !видимТекст(inner).includes('Записано')
      ? ok('НЕ ЛЪЖЕ: не се пише „Записано — тече към Реката“ върху нищо')
      : bad('🔴 казва „Записано“, а bl_q30 е празен');
    в.value === 'първите три часа сън'
      ? ok('думите ѝ остават в полето, за да не се пишат втори път')
      : bad('🔴 отговорът изчезва И не е записан');
  }

  // „Подреди мислите“ → задържане в бележките
  стъпка();
  const g = пясъчник({ файлове: ['js/calm.js'], roomFeatures: празниСтаи(), пълнаПамет: true });
  const root = El('div');
  g.w.ROOM_FEATURES['Дневник на мама'](root);
  const мисли = root.querySelectorAll('.jr-card').find(x => видимТекст(x).includes('Подреди мислите'));
  const t = мисли.querySelector('textarea');
  t.value = 'пране\nда звънна на лекаря';
  мисли.querySelectorAll('button').find(x => видимТекст(x).includes('Подреди'))._click();
  // и двете отиват в „🔴 Сега“
  for (let i = 0; i < 2; i++) {
    const ч = мисли.querySelectorAll('.jr-chip').find(x => видимТекст(x).includes('Сега'));
    if (ч) ч._click();
  }
  const задръж = мисли.querySelectorAll('button').find(x => видимТекст(x).includes('Задръж'));
  if (!задръж) bad('бутонът „Задръж само „Сега““ не се появи');
  else {
    задръж._click();
    !видимТекст(задръж).includes('Чакат те')
      ? ok('НЕ ЛЪЖЕ: не обещава „✔ Чакат те в 🧰 Инструменти“, щом записът е паднал')
      : bad('🔴 обещава бележки, които ги няма');
    !задръж.disabled ? ok('бутонът остава натискаем — има втори опит') : bad('бутонът се заключва след провал');
  }

  // полето на помощничката: въпросът НЕ зависи от склада
  стъпка();
  const A = полеЗа('Моето бебе', null, null, { пълнаПамет: true });
  A.inp.value = 'кога да се обадя на лекар';
  A.прати._click();
  A.s.дн.ask.length === 1
    ? ok('въпросът стига до помощничката и при счупен склад (пътят му е през екрана, не през паметта)')
    : bad('🔴 при счупен склад мама не може дори да попита');
}

// ═══════ 2.9 КЛАВИАТУРАТА НА ТЕЛЕФОНА ═══════
глава('2.9 КЛАВИАТУРАТА ПОКРИВА ЛИ ПОЛЕТАТА НА ЗАПОЗНАВАНЕТО');
{
  стъпка();
  const s = пясъчник({ файлове: ['js/expect.js', 'js/onboard.js'], склад: { bl_tour_done: '1' }, разметка: онбHtml });
  s.w.BL_ONBOARD.open();
  const полета = ['onbName', 'onbDate', 'onbMeDate', 'onbPreterm'];
  инфо('прегледани полета: ' + полета.length + ' (' + полета.join(', ') + ')');
  const без = [];
  полета.forEach(id => { const п = s.$(id); if (!п) return; п.focus(); });
  s.пусниТаймери();
  полета.forEach(id => { const п = s.$(id); if (п && !(п._скролнат > 0)) без.push(id); });
  без.length === 0
    ? ok('всичките ' + полета.length + ' полета се издърпват над клавиатурата при фокус')
    : bad('🟠 клавиатурата може да покрие: ' + без.join(', '));
}

// ═══════ 2.10 САМОПРОВЕРКА — уредът може ли да гръмне ═══════
глава('2.10 САМОПРОВЕРКА (уред, който не може да гръмне, не мери)');
{
  let хванати = 0, примамки = 0;

  // (1) черновата на полето: СЪЩИЯТ склад, веднъж със здрав файл и веднъж с
  //     махнато възстановяване. Здравият ТРЯБВА да върне текста, счупеният — не.
  примамки++;
  const семе = {}; семе['bl_draft_ask_Моето бебе'] = JSON.stringify('примамка');
  const патч1 = { 'js/askfield.js': t => t.replace(/inp\.value\s*=\s*load\(ЧЕРНОВА[^\n]*\n/, '\n') };
  let здравВърна = false, счупенВърна = true;
  try { const З = полеЗа('Моето бебе', семе); здравВърна = !!(З.inp && З.inp.value === 'примамка'); } catch (e) {}
  try { const С = полеЗа('Моето бебе', семе, патч1); счупенВърна = !!(С.inp && С.inp.value === 'примамка'); } catch (e) { счупенВърна = false; }
  if (здравВърна && !счупенВърна) хванати++;
  else инфо('примамка 1: здрав върна ' + здравВърна + ' · счупен върна ' + счупенВърна);

  // (2) правим нощта да изяжда ВСИЧКО (както беше преди поправката)
  примамки++;
  const патч2 = { 'js/night.js': t => t.replace(/if \(нощ\(\) && window\.BL_PRAZNIK[^\n]*\n/, 'if (нощ()) return;\n') };
  const s2 = нощенПясъчник(патч2);
  const преди = s2.дн.cheer.length;
  ВАЖНИ.forEach(([, т]) => s2.w.BL_FX.cheer(т));
  if (s2.дн.cheer.length - преди !== ВАЖНИ.length) хванати++;
  else инфо('примамка 2: счупената нощ пусна всичките ' + ВАЖНИ.length + ' — патчът не е налазил');

  // (3) сляп инвентар: празен файл трябва да даде 0 контроли
  примамки++;
  const празен = преброй('(примамка)', '// само коментар\n');
  ИНВ.pop();
  if (празен.създадени + празен.вРазметка === 0 && празен.слушачи === 0) хванати++;

  // (4) обратната посока: инвентарът вижда ли добавена контрола
  примамки++;
  const плюс = преброй('(примамка2)', "const b = el('button','x','y'); b.addEventListener('click', () => {});\n");
  ИНВ.pop();
  if (плюс.създадени === 1 && плюс.слушачи === 1) хванати++;

  // (5) връщаме празната уловка в onboard.js — поздравът пак трябва да лъже
  примамки++;
  const патч5 = { 'js/onboard.js': t => t.replace(/const save = \(k, v\) =>[^\n]*\n/, 'const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return true; };\n') };
  const s5 = пясъчник({ файлове: ['js/expect.js', 'js/onboard.js'], склад: { bl_tour_done: '1' }, разметка: онбHtml, пълнаПамет: true, патчове: патч5 });
  s5.w.BL_ONBOARD.open();
  const g5 = s5.$('onbSex').querySelectorAll('.onb-sexbtn').find(b => b.dataset.sex === 'girl');
  g5._click(g5);
  s5.$('onbSave')._click(s5.$('onbSave'));
  if (s5.дн.cheer.length > 0) хванати++;
  else инфо('примамка 5: върнатата празна уловка НЕ доведе до фалшив поздрав — патчът не е налазил');

  // (6) махаме издърпването над клавиатурата
  примамки++;
  const патч6 = { 'js/onboard.js': t => t.replace(/\['onbName', 'onbDate', 'onbMeDate', 'onbPreterm'\][\s\S]*?\n    \}\);\n/, '') };
  const s6 = пясъчник({ файлове: ['js/expect.js', 'js/onboard.js'], склад: { bl_tour_done: '1' }, разметка: онбHtml, патчове: патч6 });
  s6.w.BL_ONBOARD.open();
  s6.$('onbMeDate').focus(); s6.пусниТаймери();
  if (!(s6.$('onbMeDate')._скролнат > 0)) хванати++;
  else инфо('примамка 6: полето пак се издърпа — патчът не е налазил');

  // (7) счупваме броенето на живите кътчета — лентата пак трябва да лъже
  примамки++;
  const патч7 = { 'js/iface.js': t => t.replace(/const н = живи\.filter[^\n]*\n/, 'const н = Math.min(Object.keys(запомнени).length, всички);\n') };
  const s7 = пясъчник({ файлове: ['js/iface.js'], склад: { bl_seen_cards: JSON.stringify({ 'Моето бебе': { a: 1, x1: 1, x2: 1, x3: 1 } }) }, патчове: патч7 });
  const r7 = El('div'); r7.id = 'roRoom';
  const t7 = El('section'); t7.className = 'jr-card toc-card';
  const з7 = El('h4'); з7.className = 'jr-title'; з7.textContent = 'Съдържание'; t7.appendChild(з7); r7.appendChild(t7);
  ['a', 'b', 'c', 'd'].forEach(k => { const c = El('section'); c.className = 'jr-card'; c.setAttribute('data-blkey', k); r7.appendChild(c); });
  s7.корен.appendChild(r7);
  s7.w.BL_IFACE.обновиЛента('Моето бебе');
  if (видимТекст(t7.querySelector('.toc-progtxt')).includes('всичко')) хванати++;
  else инфо('примамка 7: счупената лента не излъга — патчът не е налазил');

  хванати === примамки
    ? ok('всичките ' + примамки + ' примамки бяха хванати — уредът мери в двете посоки')
    : bad('💥 уредът пропусна ' + (примамки - хванати) + ' от ' + примамки + ' примамки — не вярвай на зелените горе');
}

console.log('\n═══ РАВНОСМЕТКА ═══');
console.log('   ПРЕГЛЕДАНО: ' + ОБЩО_КОНТРОЛИ + ' контроли · ' + ОБЩО_СЛУШАЧИ + ' слушача · ' +
  МОИ.length + ' входни файла · ' + Object.keys(ПЕРСОНИ).length + ' живи персони · ' +
  СТЪПКИ + ' изиграни стъпки от пътя на мама');
console.log('   зелени : ' + ЗЕЛЕНИ);
console.log('   червени: ' + ЧЕРВЕНО.length);
ЧЕРВЕНО.forEach(t => console.log('      ❌ ' + t));
process.exitCode = ЧЕРВЕНО.length ? 1 : 0;
