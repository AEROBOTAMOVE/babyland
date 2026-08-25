// ═══════════════════════════════════════════════════════════
// 💃 ИНТЕРАКТИВНОТО В „ЖЕНАТА В МЕН" — натиска всяко нещо и гледа какво става
//
// ЗАЩО: стая 8 е най-личното в приложението. Тук мама пише за СЕБЕ СИ —
// настроение, тяло, цикъл, желания, отношения. js/women3.js има 29 слушателя,
// women2.js — 27, profile.js — 28. Никой не е проверявал СИСТЕМНО дали
// написаното оцелява.
//
// ЗА ВСЯКО НЕЩО СЕ ПИТА (петте въпроса):
//   1. РЕАГИРА ЛИ            — мръдна ли изобщо нещо на екрана
//   2. ЗАПИСВА ЛИ            — мръдна ли localStorage
//   3. ПОКАЗВА ЛИ РЕЗУЛТАТ   — вижда ли се написаното от мама
//   4. ОЦЕЛЯВА ЛИ ПРЕЗАРЕЖДАНЕ — намира ли се пак, като стаята се построи наново
//   5. НЕ ЛЪЖЕ ЛИ           — показва „записано", а в паметта го няма
//
// 🪤 ТРИТЕ КАПАНА, ЗАРАДИ КОИТО УРЕДЪТ Е ТАКЪВ:
//   · „0 находки" без брой прегледани значи „0 ПРЕГЛЕДАНИ". Затова всеки
//     раздел печата КОЛКО Е ГЛЕДАЛ, а не само какво е намерил.
//   · МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. `--samoproverka` чупи нарочно
//     по едно нещо и иска уредът ДА ГО ХВАНЕ. Не го ли хване → изход 1.
//   · Всяко нещо се натиска в ЧИСТА стая: паметта се връща и стаята се строи
//     наново преди всеки тап. Иначе съседният бутон обяснява чуждия резултат.
//
// ПУСКАНЕ:
//   node dev/interaktivno_jenata.js                — опис + жив обход
//   node dev/interaktivno_jenata.js --opis         — само описът
//   node dev/interaktivno_jenata.js --samoproverka — уредът се изпитва В ДВЕТЕ ПОСОКИ
//   node dev/interaktivno_jenata.js --karta="Луната"   — само една карта
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. localStorage е обикновен обект в
//   паметта на Node — нула следи по диска. Изтрий файла и нищо не се променя.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const СТАЯ = ['js/women.js', 'js/women2.js', 'js/women3.js', 'js/women4.js', 'js/women5.js'];
const ПРОФИЛ = 'js/profile.js';

// ═══════════════════════════════════════════════════════════
// 1. МИНИАТЮРНИЯТ DOM
//    Пише се на ръка: jsdom го няма (проверено — require('jsdom') гърми).
// ═══════════════════════════════════════════════════════════
const ПРАЗНИ = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr', 'circle', 'path', 'rect', 'line']);
// класове, които в css/ са flex — women3.js `каз()` се качва над тях
const ФЛЕКС = new Set(['jr-addrow', 'jr-chips', 'jr-winrow', 'nl-ideas', 'wm-sizes', 'prof-quick']);

const разкодирай = s => String(s)
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const закодирай = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let ГРЕШКИ = [];      // необработени изключения от слушателите

class Текст {
  constructor(t) { this.nodeType = 3; this.data = String(t); this.parentNode = null; }
  get textContent() { return this.data; }
  set textContent(v) { this.data = String(v); }
  get outerHTML() { return закодирай(this.data); }
  get childNodes() { return []; }
}

class Възел {
  constructor(име, док) {
    this.nodeType = 1;
    this.tagName = String(име).toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.__док = док;
    this.__слушатели = {};
    this.__атр = {};
    this.className = '';
    this.id = '';
    this.hidden = false;
    this.disabled = false;
    this.style = новСтил();
    this.dataset = {};
    this.value = '';
    this.__пазенДисплей = '';
  }
  // ── деца ──
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  appendChild(n) {
    if (!n) return n;
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.childNodes.push(n); return n;
  }
  insertBefore(n, преди) {
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this;
    const i = преди ? this.childNodes.indexOf(преди) : -1;
    if (i < 0) this.childNodes.push(n); else this.childNodes.splice(i, 0, n);
    return n;
  }
  removeChild(n) {
    const i = this.childNodes.indexOf(n);
    if (i >= 0) { this.childNodes.splice(i, 1); n.parentNode = null; }
    return n;
  }
  replaceChild(нов, стар) {
    const i = this.childNodes.indexOf(стар);
    if (i < 0) return стар;
    if (нов.parentNode) нов.parentNode.removeChild(нов);
    this.childNodes[i] = нов; нов.parentNode = this; стар.parentNode = null;
    return стар;
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get firstElementChild() { return this.children[0] || null; }
  get nextSibling() {
    if (!this.parentNode) return null;
    const c = this.parentNode.childNodes; return c[c.indexOf(this) + 1] || null;
  }
  get nextElementSibling() {
    if (!this.parentNode) return null;
    const c = this.parentNode.children; return c[c.indexOf(this) + 1] || null;
  }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return !!n.__корен; }
  // видим ли е (нашият заместител на offsetParent)
  get __видим() {
    let n = this;
    while (n) { if (n.hidden === true) return false; if (n.style && n.style.display === 'none') return false; n = n.parentNode; }
    return this.isConnected;
  }
  // ── текст и html ──
  get textContent() { return this.childNodes.map(n => n.textContent).join(''); }
  set textContent(v) {
    this.childNodes.forEach(n => { n.parentNode = null; });
    this.childNodes = [];
    if (v !== '' && v != null) this.appendChild(new Текст(v));
  }
  get innerHTML() { return this.childNodes.map(n => n.outerHTML).join(''); }
  set innerHTML(html) {
    this.childNodes.forEach(n => { n.parentNode = null; });
    this.childNodes = [];
    if (html != null && html !== '') парсирай(String(html), this, this.__док);
  }
  get outerHTML() {
    const име = this.tagName.toLowerCase();
    let a = '';
    if (this.className) a += ' class="' + this.className + '"';
    if (this.id) a += ' id="' + this.id + '"';
    Object.keys(this.__атр).forEach(k => { if (k !== 'class' && k !== 'id') a += ' ' + k + '="' + this.__атр[k] + '"'; });
    if (ПРАЗНИ.has(име)) return '<' + име + a + '>';
    return '<' + име + a + '>' + this.innerHTML + '</' + име + '>';
  }
  // ── атрибути ──
  setAttribute(k, v) {
    k = String(k); v = String(v);
    this.__атр[k] = v;
    if (k === 'class') this.className = v;
    else if (k === 'id') this.id = v;
    else if (k === 'hidden') this.hidden = true;
    else if (k === 'value') this.value = v;
    else if (k === 'type') this.type = v;
    else if (k === 'src') this.src = v;
    else if (k === 'href') this.href = v;
    else if (k === 'title') this.title = v;
    else if (k === 'placeholder') this.placeholder = v;
    else if (k.indexOf('data-') === 0) this.dataset[к2д(k.slice(5))] = v;
  }
  getAttribute(k) {
    k = String(k);
    if (k === 'class') return this.className || null;
    if (k === 'id') return this.id || null;
    return k in this.__атр ? this.__атр[k] : null;
  }
  hasAttribute(k) { return this.getAttribute(k) != null; }
  removeAttribute(k) { delete this.__атр[k]; if (k === 'class') this.className = ''; }
  get classList() {
    const е = this;
    const чети = () => String(е.className || '').split(/\s+/).filter(Boolean);
    const пиши = a => { е.className = a.join(' '); е.__атр['class'] = е.className; };
    return {
      add(...cs) { const a = чети(); cs.forEach(c => { if (a.indexOf(c) < 0) a.push(c); }); пиши(a); },
      remove(...cs) { пиши(чети().filter(x => cs.indexOf(x) < 0)); },
      contains(c) { return чети().indexOf(c) >= 0; },
      toggle(c, сила) {
        const има = чети().indexOf(c) >= 0;
        const искаме = сила === undefined ? !има : !!сила;
        if (искаме && !има) this.add(c); else if (!искаме && има) this.remove(c);
        return искаме;
      }
    };
  }
  // ── търсене ──
  querySelector(сел) { const r = this.querySelectorAll(сел); return r.length ? r[0] : null; }
  querySelectorAll(сел) {
    const вс = [];
    (function събери(н) { н.children.forEach(c => { вс.push(c); събери(c); }); })(this);
    return вс.filter(e => пасваЛи(e, сел));
  }
  closest(сел) { let n = this; while (n && n.nodeType === 1) { if (пасваЛи(n, сел)) return n; n = n.parentNode; } return null; }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  // ── събития ──
  addEventListener(т, f) { (this.__слушатели[т] = this.__слушатели[т] || []).push(f); }
  removeEventListener(т, f) {
    const a = this.__слушатели[т]; if (!a) return;
    const i = a.indexOf(f); if (i >= 0) a.splice(i, 1);
  }
  dispatch(тип, доп) {
    const съб = Object.assign({
      type: тип, target: this, currentTarget: this, defaultPrevented: false,
      __стоп: false,
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
        catch (e) { ГРЕШКИ.push({ къде: 'слушател ' + тип + ' на ' + описание(н), грешка: e.name + ': ' + e.message }); }
      }
      if (съб.__стоп) break;
      н = н.parentNode;
    }
    return съб;
  }
  // `слот.click()` върху скрито <input type=file> отваря галерията в браузъра.
  // В Node няма галерия — затова само отбелязваме, че вратата Е отворена, за
  // да не обявим бутона за „мълчалив" (уредът щеше да лъже, не кодът).
  click() { if (this.type === 'file') this.__отворен = true; this.dispatch('click', {}); }
  focus() { if (this.__док) this.__док.activeElement = this; }
  blur() { this.dispatch('blur', {}); }
  select() {}
  scrollIntoView() {}
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 100, height: 44, x: 0, y: 0 }; }
  getContext() { return { drawImage() {}, fillRect() {} }; }
  toDataURL() { return 'data:image/jpeg;base64,AAAA'; }
  get offsetParent() { return this.__видим ? this.parentNode : null; }
  get scrollTop() { return this.__скрол || 0; }
  set scrollTop(v) { this.__скрол = v; }
  get files() { return this.__файлове || []; }
  set files(v) { this.__файлове = v; }
  get checked() { return !!this.__чек; }
  set checked(v) { this.__чек = !!v; }
  showPicker() {}
}

const к2д = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const новСтил = () => {
  const o = { setProperty(k, v) { o[к2д(k)] = v; }, getPropertyValue(k) { return o[к2д(k)] || ''; }, removeProperty(k) { delete o[к2д(k)]; } };
  return o;
};
const описание = e => (e.tagName || '?') + (e.className ? '.' + String(e.className).split(' ')[0] : '') +
  (e.textContent ? ' „' + e.textContent.trim().slice(0, 26) + '"' : '');

// ── СЕЛЕКТОРИ: подмножеството, което стая 8 наистина ползва ──
function пасваПрост(e, част) {
  // `:not(...)` първо
  const не = [];
  част = част.replace(/:not\(([^)]*)\)/g, (_, вътре) => { не.push(вътре); return ''; });
  if (не.some(n => пасваПрост(e, n.trim()))) return false;
  const части = част.match(/^[a-zA-Z][a-zA-Z0-9]*|\.[^.[\]#]+|#[^.[\]#]+|\[[^\]]*\]/g);
  if (!части) return true;
  for (const p of части) {
    if (p[0] === '.') { if (!e.classList.contains(p.slice(1))) return false; }
    else if (p[0] === '#') { if (e.id !== p.slice(1)) return false; }
    else if (p[0] === '[') {
      const m = p.slice(1, -1).match(/^([^=~|^$*]+)(?:([~|^$*]?=)\s*["']?([^"']*)["']?)?$/);
      if (!m) return false;
      const v = e.getAttribute(m[1].trim());
      if (v == null) return false;
      if (m[2] && v !== m[3]) return false;
    } else if (e.tagName !== p.toUpperCase()) return false;
  }
  return true;
}
function пасваЛи(e, сел) {
  return String(сел).split(',').some(гр => {
    const стъпки = гр.trim().split(/\s+/).filter(Boolean);
    if (!стъпки.length) return false;
    if (!пасваПрост(e, стъпки[стъпки.length - 1])) return false;
    let n = e.parentNode;
    for (let i = стъпки.length - 2; i >= 0; i--) {
      let намерен = false;
      while (n && n.nodeType === 1) { if (пасваПрост(n, стъпки[i])) { намерен = true; n = n.parentNode; break; } n = n.parentNode; }
      if (!намерен) return false;
    }
    return true;
  });
}

function парсирай(html, родител, док) {
  let i = 0;
  const стек = [родител];
  const текст = s => { if (s) стек[стек.length - 1].appendChild(new Текст(разкодирай(s))); };
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { текст(html.slice(i)); break; }
    if (lt > i) текст(html.slice(i, lt));
    const gt = html.indexOf('>', lt);
    if (gt < 0) { текст(html.slice(lt)); break; }
    let вътре = html.slice(lt + 1, gt);
    i = gt + 1;
    if (вътре[0] === '!' || вътре[0] === '?') continue;
    if (вътре[0] === '/') {
      const име = вътре.slice(1).trim().toUpperCase();
      for (let k = стек.length - 1; k > 0; k--) if (стек[k].tagName === име) { стек.length = k; break; }
      continue;
    }
    let само = false;
    if (вътре.endsWith('/')) { само = true; вътре = вътре.slice(0, -1); }
    const м = вътре.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!м) continue;
    const име = м[1].toLowerCase();
    const е = док.createElement(име);
    const атр = вътре.slice(м[1].length);
    const re = /([a-zA-Z_:@\-.0-9]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let a;
    while ((a = re.exec(атр))) {
      const v = a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : a[5] !== undefined ? a[5] : '';
      е.setAttribute(a[1], разкодирай(v));
    }
    стек[стек.length - 1].appendChild(е);
    if (!само && !ПРАЗНИ.has(име)) стек.push(е);
  }
}

// ═══════════════════════════════════════════════════════════
// 2. ПРОЗОРЕЦЪТ (window/document/localStorage/часовник)
// ═══════════════════════════════════════════════════════════
function новПрозорец(опции) {
  опции = опции || {};
  const W = {};
  const склад = Object.assign({}, опции.склад || {});
  let записиПаднали = 0;

  // ── localStorage ──
  const ls = {
    getItem: k => (Object.prototype.hasOwnProperty.call(склад, String(k)) ? склад[String(k)] : null),
    setItem: (k, v) => {
      // 🪤 ПЪРВАТА ВЕРСИЯ ГЪРМЕШЕ САМО НАД 50 ЗНАКА — тоест „пълната памет"
      //    приемаше късите записи. Тогава чип с кратко име успяваше, казваше
      //    честно „Записах" и уредът го броеше за лъжец. Пълна памет значи
      //    пълна: не се побира НИЩО.
      if (опции.бездънно === false) { записиПаднали++; const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
      склад[String(k)] = String(v);
    },
    removeItem: k => { delete склад[String(k)]; },
    clear: () => { Object.keys(склад).forEach(k => delete склад[k]); },
    key: i => Object.keys(склад)[i] === undefined ? null : Object.keys(склад)[i]
  };
  Object.defineProperty(ls, 'length', { get: () => Object.keys(склад).length });

  // ── часовник: детерминиран, не истински ──
  let часовник = 0, бройТ = 0;
  const таймери = new Map();
  const постави = (f, ms, интервал) => { const id = ++бройТ; таймери.set(id, { at: часовник + (+ms || 0), f, интервал: интервал ? (+ms || 1) : 0 }); return id; };
  const махни = id => taimeriDelete(id);
  const taimeriDelete = id => { таймери.delete(id); };

  // ── документът ──
  const док = { __корен: true, nodeType: 9, __слушатели: {}, activeElement: null };
  док.createElement = име => {
    const e = new Възел(име, док);
    if (име === 'input' || име === 'textarea') { e.type = име === 'input' ? 'text' : ''; e.rows = 2; e.maxLength = 524288; }
    return e;
  };
  док.createTextNode = t => new Текст(t);
  док.addEventListener = (t, f) => { (док.__слушатели[t] = док.__слушатели[t] || []).push(f); };
  док.removeEventListener = (t, f) => { const a = док.__слушатели[t]; if (a) { const i = a.indexOf(f); if (i >= 0) a.splice(i, 1); } };
  док.documentElement = док.createElement('html');
  док.documentElement.parentNode = док;
  док.body = док.createElement('body');
  док.documentElement.appendChild(док.body);
  док.head = док.createElement('head');
  док.documentElement.appendChild(док.head);
  док.getElementById = id => {
    const r = док.body.querySelectorAll('#' + id);
    return r.length ? r[0] : null;
  };
  док.querySelector = с => док.body.querySelector(с);
  док.querySelectorAll = с => док.body.querySelectorAll(с);
  док.readyState = 'complete';
  док.hidden = false;
  Object.defineProperty(док, 'children', { get: () => док.documentElement ? [док.documentElement] : [] });

  // ── чуждите модули: стъбове, които БРОЯТ, за да се вижда какво е викано ──
  const дневник = { confetti: 0, cheer: 0, buzz: 0, print: 0, share: 0, clipboard: 0, reload: 0, confirm: 0 };

  Object.assign(W, {
    console, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect, TypeError, RangeError,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat, URL: {}
  });
  W.window = W;
  W.document = док;
  W.localStorage = ls;
  W.setTimeout = (f, ms) => постави(f, ms, false);
  W.setInterval = (f, ms) => постави(f, ms, true);
  W.clearTimeout = махни;
  W.clearInterval = махни;
  W.requestAnimationFrame = f => постави(() => f(часовник), 16, false);
  W.cancelAnimationFrame = махни;
  W.addEventListener = (t, f) => док.addEventListener(t, f);
  W.removeEventListener = (t, f) => док.removeEventListener(t, f);
  W.getComputedStyle = e => ({
    display: (e && e.style && e.style.display) || (e && [...String(e.className || '').split(' ')].some(c => ФЛЕКС.has(c)) ? 'flex' : 'block'),
    getPropertyValue: k => (e && e.style && e.style[к2д(k)]) || ''
  });
  W.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  W.navigator = { userAgent: 'node', language: 'bg' };   // без share/clipboard → пътят „нито едното"
  W.location = { href: 'http://localhost/', search: '', hash: '', reload: () => { дневник.reload++; } };
  W.innerHeight = 812; W.innerWidth = 375;
  W.visualViewport = { height: 400, width: 375, addEventListener() {}, removeEventListener() {} };
  W.IntersectionObserver = function (cb) { this.observe = () => {}; this.unobserve = () => {}; this.disconnect = () => {}; this.__cb = cb; };
  W.Image = function () { const s = this; s.onload = null; s.onerror = null; s.width = 100; s.height = 100; Object.defineProperty(s, 'src', { set(v) { s.__src = v; постави(() => { if (s.onload) s.onload(); }, 1, false); }, get() { return s.__src; } }); };
  W.FileReader = function () { const s = this; s.readAsText = f => постави(() => { s.result = (f && f.__текст) || '{}'; if (s.onload) s.onload(); }, 1, false); };
  W.Blob = function (ч) { this.__ч = ч; this.size = String(ч && ч[0] || '').length; };
  W.URL = { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
  W.confirm = () => { дневник.confirm++; return true; };
  W.alert = () => {};
  W.prompt = () => null;
  W.performance = { now: () => часовник };

  // помощничките от другите файлове (не са мои — стъбове)
  W.BL_FX = {
    confetti: () => { дневник.confetti++; },
    cheer: () => { дневник.cheer++; },
    buzz: () => { дневник.buzz++; },
    countUp: () => {}
  };
  W.BL_UI = { confirm: () => { дневник.confirm++; return Promise.resolve(опции.потвърди !== false); } };
  W.BL_EXPR = {
    printOverlay: () => { дневник.print++; },
    shrinkImage: (f, w, cb) => постави(() => cb('data:image/jpeg;base64,AAAA'), 1, false)
  };
  W.BL_BROI = Object.assign((n, ед, мн) => n + ' ' + (n === 1 ? ед : мн), { дума: (n, ед, мн) => (n === 1 ? ед : мн) });
  W.BL_RIVER = { add: () => {} };
  W.BL_EXPECT = { lmp: () => опции.lmp || '', paused: () => !!опции.пауза };
  W.MamaHelper = { open: () => {} };
  W.BL_POLISH_AGAIN = () => {};
  W.BL_STORE = null;
  W.BL_BADGES = { list: [] };
  W.BL_AGE = () => ({ text: '3 месеца' });
  W.BL_BABY2 = { has: () => false, get: () => null };
  W.BL_ONBOARD = { open: () => {} };
  W.BL_PIN = { has: () => false, unlocked: () => true };
  W.BL_CRYPTO = null;
  W.BL_STORAGE = null;
  W.BL_SLEEPHIST = null;

  vm.createContext(W);
  W.globalThis = W;

  // ── тик: изпълнява чакащите таймери до `ms` напред ──
  W.__тик = async ms => {
    const край = часовник + (ms || 0);
    let пазач = 0;
    while (пазач++ < 20000) {
      let най = null;
      таймери.forEach((t, id) => { if (t.at <= край && (!най || t.at < най.t.at)) най = { id, t }; });
      if (!най) break;
      часовник = най.t.at;
      if (най.t.интервал) най.t.at = часовник + най.t.интервал; else таймери.delete(най.id);
      try { най.t.f(); } catch (e) { ГРЕШКИ.push({ къде: 'таймер', грешка: e.name + ': ' + e.message }); }
      await Promise.resolve(); await Promise.resolve();
    }
    часовник = край;
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  };
  W.__склад = склад;
  W.__дневник = дневник;
  W.__записиПаднали = () => записиПаднали;
  return W;
}

function зареди(W, файлове) {
  for (const f of файлове) {
    const п = path.join(ROOT, f);
    try { new vm.Script(fs.readFileSync(п, 'utf8'), { filename: f }).runInContext(W); }
    catch (e) { return f + ' → ' + e.name + ': ' + e.message; }
  }
  return null;
}

// строи стаята в чист прозорец върху даден склад
async function построй(склад, опции) {
  опции = опции || {};
  const W = новПрозорец(Object.assign({ склад }, опции));
  const гр = зареди(W, СТАЯ);
  if (гр) throw new Error('зареждането падна: ' + гр);
  const док = W.document;
  const овърлей = док.createElement('div'); овърлей.id = 'roomOverlay'; овърлей.hidden = false;
  const загл = док.createElement('h3'); загл.id = 'roTitle'; загл.textContent = '💃 Жената в мен';
  const корен = док.createElement('div'); корен.id = 'roRoom';
  овърлей.appendChild(загл); овърлей.appendChild(корен); док.body.appendChild(овърлей);
  const строй = W.ROOM_FEATURES && W.ROOM_FEATURES['Жената в мен'];
  if (!строй) throw new Error('ROOM_FEATURES["Жената в мен"] липсва');
  строй(корен);
  await W.__тик(50);
  return { W, док, корен };
}

// ═══════════════════════════════════════════════════════════
// 3. ОПИСЪТ — статичният инвентар (какво има изобщо)
// ═══════════════════════════════════════════════════════════
function опис() {
  const редове = [];
  let общоРедове = 0, общоСлушатели = 0;
  const ключове = new Set();
  const поФайл = {};
  for (const ф of СТАЯ.concat([ПРОФИЛ])) {
    const текст = fs.readFileSync(path.join(ROOT, ф), 'utf8');
    const линии = текст.split(/\r?\n/);          // 🪤 CRLF: split('\n') оставя \r
    общоРедове += линии.length;
    let функция = '—';
    let слуш = 0;
    линии.forEach((л, i) => {
      const ф2 = л.match(/^\s*function\s+([A-Za-zА-Яа-я_0-9]+)/);
      if (ф2) функция = ф2[1];
      const ф3 = л.match(/^\s*(?:const|let)\s+([A-Za-zА-Яа-я_0-9]+)\s*=\s*(?:\(|function|async)/);
      if (ф3) функция = ф3[1];
      const сл = л.match(/addEventListener\(\s*'([a-z]+)'/g);
      if (сл) { сл.forEach(() => слуш++); }
      const кл = л.match(/(?:localStorage\.(?:get|set|remove)Item|load|save)\(\s*'(bl_[a-z_0-9]+)'/g);
      if (кл) кл.forEach(x => { const m = x.match(/'(bl_[a-z_0-9]+)'/); if (m) ключове.add(m[1]); });
      if (сл) редове.push({ файл: ф, ред: i + 1, функция, събития: сл.map(s => s.match(/'([a-z]+)'/)[1]) });
    });
    поФайл[ф] = { редове: линии.length, слушатели: слуш };
    общоСлушатели += слуш;
  }
  return { редове, общоРедове, общоСлушатели, ключове: [...ключове].sort(), поФайл };
}

// ═══════════════════════════════════════════════════════════
// 4. ЖИВИЯТ ОБХОД
// ═══════════════════════════════════════════════════════════
const МАРКЕР = 'ЖМАРКЕР';                       // уникален низ, който търсим после
// 🪤 ПЪРВАТА ВЕРСИЯ НА ТАЗИ МЯРКА ДАДЕ 121 ЧЕРВЕНИ — тоест не мереше, а
//    крещеше. Две неща я лъжеха и двете са поправени:
//    (1) търсеше думата „записано" в ЦЯЛАТА стая, а стаята е 47 карти текст
//        (вкл. „Нищо не е записано никъде" от „🔥 Изгори го");
//    (2) броеше за лъжа и чипа-подсказка, който записва СВОЯ текст, а не
//        маркера, който уредът е сложил в полето.
//    Сега се гледа само РАЗЛИКАТА в СВОЯТА карта и само две твърди условия.
const ТВЪРДИ_ЗАПИС = /Записано|Записах|Добавено|Добавих|Прибрано|Запазено|Заключено|Запечатано|Прието|Върнато|Върнах|Махнах|Изтрито|Отметнато|Изчистено|Изчистих|Сложих ти|Отбелязах/;
const безОтрицание = т => String(т).replace(/Нищо не е записано[^.]*\.?/g, '').replace(/нищо не пазя/g, '');

const заглавиеНаКарта = к => {
  const t = к.querySelector('.jr-title');
  return t ? t.textContent.replace(/\s+/g, ' ').trim().slice(0, 52) : '(без заглавие)';
};
const надпис = e => (e.getAttribute('aria-label') || e.placeholder || (e.textContent || '').trim() || e.className || e.tagName).replace(/\s+/g, ' ').slice(0, 44);

// 🪤 `textContent` брои и СКРИТИЯ текст. Тогава бутон, който само ОТКРИВА
//    съседа си („↩ Върни махнатото"), изглежда мълчалив — уредът щеше да
//    обвини правилния код. Мери се това, което мама ВИЖДА.
function отпечатък(възел) {
  let о = '';
  (function ходи(н) {
    if (н.nodeType === 3) { о += н.data; return; }
    if (н.hidden === true) return;
    if (н.style && н.style.display === 'none') return;
    н.childNodes.forEach(ходи);
  })(възел);
  return о.replace(/\s+/g, ' ');
}
const снимка = W => JSON.stringify(W.__склад);

// интерактивните вътре в един възел
function интерактивните(възел) {
  return възел.querySelectorAll('button, input, textarea, select, [role="button"]')
    .filter(e => e.__видим);
}

// текстовото поле, което „обслужва" даден бутон
function полетоНа(бутон, карта) {
  const свои = (бутон.parentNode ? бутон.parentNode.querySelectorAll('input, textarea') : [])
    .filter(e => e.type !== 'date' && e.type !== 'file');
  if (свои.length) return свои[0];
  const вКартата = карта.querySelectorAll('input, textarea').filter(e => e.type !== 'date' && e.type !== 'file');
  return вКартата.length ? вКартата[0] : null;
}
// поле, което САМО се пази (има change/input/blur) — а не поле, което чака „+"
const самоПазещо = п => ['change', 'input', 'blur'].some(т => (п.__слушатели[т] || []).length > 0);

async function обходи(опции) {
  опции = опции || {};
  const базаСклад = опции.склад || {};
  const резултат = { прегледани: 0, карти: 0, натиснати: 0, полета: 0, пропуснати: 0, находки: [], редове: [] };

  // 1) построяваме веднъж, за да преброим картите и елементите
  const { корен } = await построй(базаСклад, опции);
  const карти = корен.querySelectorAll('.jr-card');
  резултат.карти = карти.length;

  const план = [];
  карти.forEach((к, ki) => {
    if (опции.карта && заглавиеНаКарта(к).indexOf(опции.карта) < 0) return;
    интерактивните(к).forEach((e, ei) => {
      план.push({ ki, ei, заглавие: заглавиеНаКарта(к), име: надпис(e), таг: e.tagName, тип: e.type || '' });
    });
  });
  резултат.прегледани = план.length;

  // 2) всяко нещо се натиска в ЧИСТА, наново построена стая
  for (const п of план) {
    const { W, корен: k2 } = await построй(базаСклад, опции);
    const карти2 = k2.querySelectorAll('.jr-card');
    const карта = карти2[п.ki];
    if (!карта) { резултат.пропуснати++; continue; }
    const е = интерактивните(карта)[п.ei];
    if (!е) { резултат.пропуснати++; continue; }

    // мери се СВОЯТА карта, не цялата стая: съседната карта обяснява чужд резултат
    const предТекст = отпечатък(карта);
    const предСклад = снимка(W);
    ГРЕШКИ = [];

    if (е.tagName === 'INPUT' || е.tagName === 'TEXTAREA') {
      резултат.полета++;
      if (е.type === 'file') { резултат.пропуснати++; continue; }
      // поле без change/input/blur е поле-за-„+", не поле-което-само-се-пази
      if (!самоПазещо(е)) { резултат.пропуснати++; continue; }
      // 🪤 ДАТИТЕ ИМАТ ПОСОКА. Рождената дата се проверява „в миналото ли е",
      //    датата на преглед/вечер — „в бъдещето ли е". Уред с една дата
      //    обявяваше правилната проверка за дефект. Пробваме и двете посоки.
      const посоки = е.type === 'date' ? ['1994-03-25', '2026-12-24'] : [МАРКЕР];
      let записа = false, вПаметта = false, стойност = посоки[0];
      for (const v of посоки) {
        стойност = v;
        е.value = v;
        е.dispatch('input', {});
        е.dispatch('change', {});
        е.dispatch('blur', {});
        await W.__тик(3000);
        const тек = снимка(W);
        if (тек !== предСклад) записа = true;
        if (тек.indexOf(v) >= 0) { вПаметта = true; break; }
      }
      const следСклад = снимка(W);
      резултат.редове.push({
        карта: п.заглавие, име: п.име, вид: 'поле', реагира: отпечатък(карта) !== предТекст,
        записа, вПаметта, грешки: ГРЕШКИ.length
      });
      // 🪤 „не мръдна паметта" НЕ Е дефект, ако стойността ВЕЧЕ е там (вторият
      //    обход зарежда същата рождена дата). Съди се по КРАЙНОТО състояние.
      if (!вПаметта && !записа) резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'ПОЛЕ НЕ ЗАПИСВА НИЩО', карта: п.заглавие, име: п.име });
      else if (!вПаметта) резултат.находки.push({ тежест: 'ОРАНЖЕВО', вид: 'записа нещо, но не написаното', карта: п.заглавие, име: п.име });
      if (ГРЕШКИ.length) резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'гърми', карта: п.заглавие, име: п.име, детайл: ГРЕШКИ[0].грешка });
      continue;
    }

    // ── БУТОН, ПРОХОД А: празно поле (мълчалив ли е) ──
    const поле = полетоНа(е, карта);
    if (поле) поле.value = '';
    е.click();
    await W.__тик(3000);
    const аТекст = отпечатък(карта), аСклад = снимка(W);
    const аРеагира = аТекст !== предТекст;
    const аЗаписа = аСклад !== предСклад;
    резултат.натиснати++;

    const отвориГалерия = карта.querySelectorAll('input').some(i => i.type === 'file' && i.__отворен);
    if (!аРеагира && !аЗаписа && !W.__дневник.print && !W.__дневник.share && !отвориГалерия) {
      резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'МЪЛЧАЛИВ БУТОН', карта: п.заглавие, име: п.име,
        детайл: 'нито пиксел в картата, нито буква в паметта' });
    }
    if (ГРЕШКИ.length) резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'гърми', карта: п.заглавие, име: п.име, детайл: ГРЕШКИ[0].грешка });

    // ── БУТОН, ПРОХОД Б: пълно поле (записва ли · лъже ли) ──
    let бЗаписа = null, бЛъже = false, бПоказва = null;
    if (поле) {
      const { W: W3, корен: k3 } = await построй(базаСклад, опции);
      const карта3 = k3.querySelectorAll('.jr-card')[п.ki];
      const е3 = карта3 && интерактивните(карта3)[п.ei];
      const поле3 = е3 && полетоНа(е3, карта3);
      if (е3 && поле3 && поле3.type !== 'date') {
        const предС3 = снимка(W3);
        const предТ3 = отпечатък(карта3);
        поле3.value = МАРКЕР;
        поле3.dispatch('input', {});
        // 🪤 В БРАУЗЪРА тапът по бутон първо МАХА ФОКУСА от полето — тоест
        //    `blur`+`change` гърмят ПРЕДИ клика. Уред, който ги пропуска,
        //    обявява за „лъжа" всяко поле, което се пази на `change`.
        поле3.dispatch('change', {});
        поле3.dispatch('blur', {});
        ГРЕШКИ = [];
        е3.click();
        await W3.__тик(3000);
        const следС3 = снимка(W3);
        const следТ3 = отпечатък(карта3);
        бЗаписа = следС3 !== предС3;
        const вПаметта = следС3.indexOf(МАРКЕР) >= 0;
        const наЕкрана = следТ3.indexOf(МАРКЕР) >= 0 && предТ3.indexOf(МАРКЕР) < 0;
        // новото в СВОЯТА карта, без отрицателните обрати („нищо не е записано")
        const ново = безОтрицание(следТ3.split(предТ3.slice(0, 40)).pop() || следТ3);
        const обяви = ТВЪРДИ_ЗАПИС.test(ново) && !ТВЪРДИ_ЗАПИС.test(безОтрицание(предТ3));
        бПоказва = наЕкрана;
        // 🔴 ЛЪЖА №1: написаното от мама стои на екрана, а в паметта го няма
        if (наЕкрана && !вПаметта) {
          бЛъже = true;
          резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'ПОКАЗВА УСПЕХ БЕЗ ЗАПИС', карта: п.заглавие, име: п.име,
            детайл: 'текстът на мама е на екрана, но НЕ Е в паметта' });
        }
        // 🔴 ЛЪЖА №2: обявява „записано", а паметта е буква по буква същата
        else if (обяви && !бЗаписа) {
          бЛъже = true;
          резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'ОБЯВЯВА ЗАПИС, ПАМЕТТА НЕ МЪРДА', карта: п.заглавие, име: п.име,
            детайл: ново.trim().slice(0, 70) });
        }
        if (ГРЕШКИ.length) резултат.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'гърми (пълно поле)', карта: п.заглавие, име: п.име, детайл: ГРЕШКИ[0].грешка });
      }
    }
    резултат.редове.push({
      карта: п.заглавие, име: п.име, вид: 'бутон',
      реагира: аРеагира, записа: аЗаписа, бЗаписа, бПоказва, лъже: бЛъже
    });
  }
  return резултат;
}

// ── ПРОФИЛЪТ: свой прозорец, защото живее в овърлей, не в стая ──
async function постройПрофил(склад) {
  const W = новПрозорец({ склад: склад || {} });
  const гр = зареди(W, [ПРОФИЛ]);
  if (гр) throw new Error('profile.js не се зареди: ' + гр);
  const бн = W.document.createElement('button'); бн.id = 'bnProfile';
  W.document.body.appendChild(бн);
  W.BL_PROFILE.open();
  await W.__тик(50);
  const кутия = W.document.body.querySelector('.prof-box');
  if (!кутия) throw new Error('профилът не се отвори');
  return { W, кутия };
}

async function обходиПрофил(склад) {
  const рез = { прегледани: 0, карти: 0, натиснати: 0, находки: [] };
  const { кутия } = await постройПрофил(склад);
  const карти = кутия.querySelectorAll('.prof-card');
  рез.карти = карти.length;
  const план = [];
  карти.forEach((к, ki) => интерактивните(к).forEach((e, ei) => план.push({
    ki, ei, заглавие: (к.querySelector('.prof-h') ? к.querySelector('.prof-h').textContent : 'профил').replace(/\s+/g, ' ').slice(0, 44), име: надпис(e)
  })));
  рез.прегледани = план.length;

  for (const п of план) {
    const { W, кутия: к2 } = await постройПрофил(склад);
    const карта = к2.querySelectorAll('.prof-card')[п.ki];
    if (!карта) continue;
    const е = интерактивните(карта)[п.ei];
    if (!е) continue;
    if (е.tagName === 'INPUT' && (е.type === 'file')) continue;
    const предТ = отпечатък(карта), предС = снимка(W);
    ГРЕШКИ = [];
    if (е.tagName === 'INPUT' || е.tagName === 'TEXTAREA') {
      if (!самоПазещо(е)) continue;
      е.value = МАРКЕР; е.dispatch('input', {}); е.dispatch('change', {}); е.dispatch('blur', {});
      await W.__тик(3000);
      if (снимка(W).indexOf(МАРКЕР) < 0) рез.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'ПОЛЕ НЕ ЗАПИСВА НИЩО', карта: п.заглавие, име: п.име });
      continue;
    }
    е.click();
    await W.__тик(3000);
    рез.натиснати++;
    // 🪤 бутон, който ЗАТВАРЯ профила и отваря стая, не е мълчалив — просто
    //    собствената му карта вече не е на екрана. Уредът щеше да обвини
    //    правилния код за навигация.
    const затвориСе = !W.document.body.querySelector('.prof-overlay');
    if (отпечатък(карта) === предТ && снимка(W) === предС && !затвориСе && !W.__дневник.reload && !W.__дневник.confirm) {
      рез.находки.push({ тежест: 'ОРАНЖЕВО', вид: 'МЪЛЧАЛИВ БУТОН (профил)', карта: п.заглавие, име: п.име });
    }
    if (ГРЕШКИ.length) рез.находки.push({ тежест: 'ЧЕРВЕНО', вид: 'гърми (профил)', карта: п.заглавие, име: п.име, детайл: ГРЕШКИ[0].грешка });
  }
  return рез;
}

// ═══════════════════════════════════════════════════════════
// 5. СЦЕНАРИИТЕ — редици, които единичният тап не може да види
//    (тук живеят дефектите „поле губи написаното при смяна на раздел")
// ═══════════════════════════════════════════════════════════
async function сценарии() {
  const н = [];
  const бр = { пуснати: 0 };

  // — С1: „Обратното броене до работа": първо ДАТАТА, после списъкът —
  bloc: {
    бр.пуснати++;
    const { W, корен } = await построй({});
    const карта = корен.querySelectorAll('.jr-card').find(k => заглавиеНаКарта(k).indexOf('Обратното броене') >= 0);
    if (!карта) { н.push({ тежест: 'ОРАНЖЕВО', вид: 'сценарий не намери картата', детайл: 'Обратното броене до работа' }); break bloc; }
    const дата = карта.querySelectorAll('input').find(i => i.type === 'date');
    dispatchValue(дата, '2026-10-01');
    await W.__тик(100);
    const поле = карта.querySelectorAll('input').find(i => i.type !== 'date');
    const плюс = карта.querySelectorAll('button').find(b => b.textContent.trim() === '+');
    поле.value = МАРКЕР + '1';
    плюс.click();
    await W.__тик(100);
    const пам = JSON.stringify(W.__склад);
    const екран = отпечатък(корен);
    if (екран.indexOf(МАРКЕР + '1') >= 0 && пам.indexOf(МАРКЕР + '1') < 0) {
      н.push({ тежест: 'ЧЕРВЕНО', вид: 'СЦЕНАРИЙ: списъкът се откача след смяна на датата', карта: 'Обратното броене до работа 💼', детайл: 'редът е на екрана, но НЕ е в паметта' });
    }
  }

  // — С2: НАЙ-ТЕЖКОТО ВЪЗМОЖНО — дългият текст на мама изчезва —
  //   Тук се пишат дълги текстове. Телефонът затваря приложението, докато тя
  //   пише (обаждане, бебето се събуди, заключен екран). Тогава `change` и
  //   `blur` НИКОГА не гърмят — гърми само `input`. Поле, което пази само на
  //   `change`, губи всичко написано. Точно затова women3.js и women5.js вече
  //   слушат `input` с изчакване; проверяваме кои НЕ го правят.
  {
    бр.пуснати++;
    const { корен } = await построй({});
    const бройПолета = корен.querySelectorAll('textarea').length;
    for (let i = 0; i < бройПолета; i++) {
      const { W, корен: к } = await построй({});
      const t = к.querySelectorAll('textarea')[i];
      if (!t) continue;
      const карта = t.closest('.jr-card');
      const бутони = карта ? карта.querySelectorAll('button').map(b => b.textContent) : [];
      // поле с изричен бутон „запази" не е длъжно да пази само
      if (бутони.some(b => /Заключи|Запечатай|Запази|Изгори/.test(b))) continue;
      const маркер = МАРКЕР + '_T' + i;
      t.value = маркер;
      t.dispatch('input', {});          // САМО input — телефонът угасва тук
      await W.__тик(5000);
      if (JSON.stringify(W.__склад).indexOf(маркер) < 0) н.push({
        тежест: 'ЧЕРВЕНО', вид: 'ДЪЛГИЯТ ТЕКСТ СЕ ГУБИ (пази само на „change")',
        карта: карта ? заглавиеНаКарта(карта) : '?',
        детайл: 'подкана „' + (t.placeholder || '').slice(0, 34) + '" · след „input" паметта е празна'
      });
    }
    // същото за едноредовите полета, които се пазят сами
    const { корен: кв } = await построй({});
    const вход = кв.querySelectorAll('input').filter(i => i.type !== 'date' && i.type !== 'file' && самоПазещо(i));
    for (let i = 0; i < вход.length; i++) {
      const { W, корен: к } = await построй({});
      const п = к.querySelectorAll('input').filter(x => x.type !== 'date' && x.type !== 'file' && самоПазещо(x))[i];
      if (!п) continue;
      const маркер = МАРКЕР + '_I' + i;
      п.value = маркер; п.dispatch('input', {});
      await W.__тик(5000);
      if (JSON.stringify(W.__склад).indexOf(маркер) < 0) н.push({
        тежест: 'ОРАНЖЕВО', вид: 'кратко поле се пази само на „change"',
        карта: (п.closest('.jr-card') ? заглавиеНаКарта(п.closest('.jr-card')) : '?'),
        детайл: 'подкана „' + (п.placeholder || п.getAttribute('aria-label') || '').slice(0, 34) + '"'
      });
    }
  }

  // — С3: интимното/възрастното не изтича там, където го вижда друг —
  {
    бр.пуснати++;
    const интимен = 'ИНТИМНО_' + МАРКЕР;
    const тайни = {
      bl_wm_diary: 'списък', bl_wm_confess: 'списък', bl_wm_sins: 'списък',
      bl_wm_rage: 'списък', bl_wm_maika: 'списък', bl_wm_replies: 'списък',
      bl_wm_birthstory: 'обект', bl_wm_visit: 'преглед', bl_wm_trip: 'карта', bl_wm_qme: 'карта'
    };
    const склад = {};
    Object.keys(тайни).forEach(k => {
      const т = интимен + '_' + k;
      склад[k] = тайни[k] === 'обект' ? JSON.stringify({ t: т })
        : тайни[k] === 'преглед' ? JSON.stringify({ ticked: [], own: [{ t: т, d: '2026-08-25' }], when: '' })
        : тайни[k] === 'карта' ? JSON.stringify({ was: т, am: т, '2026-08-25': т })
        : JSON.stringify([{ t: т, d: '2026-08-25' }]);
    });
    const { корен: к4 } = await построй(склад);
    // (а) всеки таен ред се вижда САМО в своята карта — не в обща сводка
    Object.keys(тайни).forEach(k => {
      const текст = интимен + '_' + k;
      const карти = к4.querySelectorAll('.jr-card').filter(c => отпечатък(c).indexOf(текст) >= 0);
      if (карти.length > 1) н.push({
        тежест: 'ЧЕРВЕНО', вид: 'ТАЙНО СЪДЪРЖАНИЕ В ДВЕ КАРТИ',
        детайл: k + ' се вижда в: ' + карти.map(заглавиеНаКарта).join(' | ')
      });
    });
    // (б) ПРОФИЛЪТ е екранът, който мама показва на друг (ниво, медальони).
    //     Там не бива да има нито буква от интимното.
    try {
      const { кутия } = await постройПрофил(склад);
      const текстНаПрофила = отпечатък(кутия) + ' ' + кутия.innerHTML;
      Object.keys(тайни).forEach(k => {
        if (текстНаПрофила.indexOf(интимен + '_' + k) >= 0) н.push({
          тежест: 'ЧЕРВЕНО', вид: 'ИНТИМНОТО СЕ ВИЖДА В ПРОФИЛА', детайл: k
        });
      });
    } catch (e) { н.push({ тежест: 'ОРАНЖЕВО', вид: 'профилът не се отвори за проверка', детайл: e.message }); }
    // (в) „Копие БЕЗ тайните" — файлът, който ПЪТУВА по мейл и в облака
    {
      const { W } = await постройПрофил(склад);
      const ЗАКЛ = /^(bl_wm_diary|bl_wm_confess|bl_wm_sins|bl_wm_rage|bl_wm_maika|bl_wm_money)$/;
      const изтичат = Object.keys(тайни).filter(k => !ЗАКЛ.test(k));
      if (изтичат.length) н.push({
        тежест: 'ОРАНЖЕВО', вид: 'в „копие без тайните" пътува и това',
        детайл: изтичат.join(', ')
      });
    }
  }

  // — С4: пътищата за помощ (насилие вкъщи) не зависят от нищо чупливо —
  {
    бр.пуснати++;
    for (const склад of [{}, { bl_partner: '"не"' }, { bl_wm_safe: '{"hidden":true}' }, { bl_baby: '{"birth":"2026-05-01"}' }]) {
      const { корен: k } = await построй(склад);
      const текст = отпечатък(k);
      const имаТел = текст.indexOf('0800 18 676') >= 0 || текст.indexOf('112') >= 0;
      const скрита = текст.indexOf('Скрита карта') >= 0;
      if (!имаТел && !скрита) н.push({
        тежест: 'ЧЕРВЕНО', вид: 'ПЪТЯТ ЗА ПОМОЩ ГО НЯМА', детайл: 'склад: ' + JSON.stringify(склад).slice(0, 60)
      });
    }
    // и: скритата карта наистина ли се връща
    const { W, корен: k } = await построй({ bl_wm_safe: '{"hidden":true}' });
    const скрита = k.querySelectorAll('.jr-card').find(c => заглавиеНаКарта(c).indexOf('Скрита карта') >= 0);
    if (!скрита) н.push({ тежест: 'ЧЕРВЕНО', вид: 'скритата карта я няма изобщо' });
    else {
      const върни = скрита.querySelectorAll('button')[0];
      върни.click(); await W.__тик(100);
      const текст = отпечатък(k);
      if (текст.indexOf('0800 18 676') < 0) н.push({ тежест: 'ЧЕРВЕНО', вид: '„Върни я" не връща картата' });
    }
  }

  // — С5: числото от въпросник обяснено ли е —
  {
    бр.пуснати++;
    const { корен: k } = await построй({
      bl_wm_colors: JSON.stringify({ a: { 0: 'warm', 1: 'warm', 2: 'warm', 3: 'warm', 4: 'bright' }, type: 'пролет' }),
      bl_me: JSON.stringify({ name: 'Ани', birth: '1994-03-25' })
    });
    const цвят = k.querySelectorAll('.jr-card').find(c => заглавиеНаКарта(c).indexOf('Цветовете') >= 0);
    if (цвят && цвят.textContent.indexOf('ПРОЛЕТ') >= 0 && цвят.textContent.length < 200) {
      н.push({ тежест: 'ОРАНЖЕВО', вид: 'резултат без обяснение', карта: 'Цветовете ми 🎨' });
    }
    const число = k.querySelectorAll('.jr-card').find(c => заглавиеНаКарта(c).indexOf('число') >= 0);
    if (число && !/Пътят|число/.test(число.textContent)) {
      н.push({ тежест: 'ОРАНЖЕВО', вид: 'резултат без обяснение', карта: 'Твоето число 🔢' });
    }
  }

  // — С6: ПЪЛНА ПАМЕТ — обявява ли успех, който не е станал —
  //   🪤 `try { localStorage.setItem(…) } catch (e) {}` е ПРАЗНА уловка: записът
  //   пада тихо, а майката чете „🔒 Заключено" и полето ѝ се изчиства. Тоест
  //   написаното изчезва ДВА ПЪТИ — от паметта и от екрана.
  //   ЖЕЛЯЗНОТО ПРАВИЛО: поле се чисти САМО след потвърден запис.
  {
    бр.пуснати++;
    const { корен: к0 } = await построй({});
    const карти0 = к0.querySelectorAll('.jr-card');
    for (let ki = 0; ki < карти0.length; ki++) {
      const бутони0 = интерактивните(карти0[ki]).filter(e => e.tagName === 'BUTTON');
      for (let bi = 0; bi < бутони0.length; bi++) {
        // строим НОВ прозорец, в който паметта е ПЪЛНА (setItem гърми)
        const { W, корен } = await построй({}, { бездънно: false });
        const карта = корен.querySelectorAll('.jr-card')[ki];
        if (!карта) continue;
        const е = интерактивните(карта).filter(x => x.tagName === 'BUTTON')[bi];
        if (!е) continue;
        const поле = полетоНа(е, карта);
        if (!поле || поле.type === 'date' || поле.type === 'file') continue;
        const текст = 'ДЪЛГИЯТ ТЕКСТ НА МАЙКАТА ' + МАРКЕР + ' който в никакъв случай не бива да изчезне от полето ѝ';
        поле.value = текст;
        поле.dispatch('input', {}); поле.dispatch('change', {}); поле.dispatch('blur', {});
        const предТ = отпечатък(карта);
        // 🪤 БРОЯЧЪТ ТРЯБВА ДА Е РАЗЛИКА, НЕ СБОР. Строежът на стаята сам пише
        //    (bl_wm_visits) и пада — тогава всеки бутон изглежда „пишещ", вкл.
        //    „🔥 Изгори го", който нарочно чисти полето и НЕ пази нищо.
        const предиПаднали = W.__записиПаднали();
        е.click();
        await W.__тик(3000);
        if (W.__записиПаднали() === предиПаднали) continue;   // този бутон изобщо не пише
        const следТ = отпечатък(карта);
        const ново = безОтрицание(следТ.split(предТ.slice(0, 40)).pop() || следТ);
        const обяви = ТВЪРДИ_ЗАПИС.test(ново);
        // 🪤 „изчисти" значи ПРАЗНО поле. Чип-подсказка, който ЗАМЕНЯ текста
        //    със своя, не е загуба — мама сама е избрала предложението.
        const изчисти = поле.value === '';
        if (обяви) н.push({
          тежест: 'ЧЕРВЕНО', вид: 'ПРИ ПЪЛНА ПАМЕТ ОБЯВЯВА УСПЕХ', карта: заглавиеНаКарта(карта),
          име: надпис(е), детайл: ново.trim().slice(0, 60)
        });
        if (изчисти) н.push({
          тежест: 'ЧЕРВЕНО', вид: 'ПРИ ПЪЛНА ПАМЕТ ЧИСТИ ПОЛЕТО (текстът изчезва два пъти)',
          карта: заглавиеНаКарта(карта), име: надпис(е)
        });
      }
    }
  }

  return { находки: н, пуснати: бр.пуснати };
}
function dispatchValue(e, v) { if (!e) return; e.value = v; e.dispatch('input', {}); e.dispatch('change', {}); }

// ═══════════════════════════════════════════════════════════
// 6. САМОПРОВЕРКАТА — уредът се чупи нарочно и трябва ДА СЕ ХВАНЕ
// ═══════════════════════════════════════════════════════════
// 🪤 ПЪРВАТА ВЕРСИЯ НА САМОПРОВЕРКАТА БЕШЕ СЛЯПА ЗА 3 ОТ 3 ПРИМАМКИ — и то не
//    защото уредът не ги хващаше, а защото ТЯ търсеше находката ПО ИМЕ, с
//    `indexOf` върху низ, който в уреда е с ГЛАВНИ букви. Тоест проверката на
//    проверката имаше същия дефект, срещу който е направена. Сега критерият е
//    БРОЙ: мери се чисто, чупи се, мери се пак. Порасне ли броят червени за
//    същата карта — примамката е хваната. Името няма значение.
async function самопроверка() {
  const резултати = [];
  const файл = path.join(ROOT, 'js/women2.js');
  const оригинал = fs.readFileSync(файл, 'utf8');
  const върни = () => fs.writeFileSync(файл, оригинал);
  const червени = р => р.находки.filter(x => x.тежест === 'ЧЕРВЕНО').length;

  const пробвай = async (име, счупи, карта) => {
    const счупен = счупи(оригинал);
    if (счупен === оригинал) { резултати.push({ име, изход: 'ПРИМАМКАТА НЕ СЕ ПОСТАВИ ❌' }); return; }
    // карта === null значи: примамката се лови САМО от сценариите (пълна памет),
    // тоест проверява се и че ТЕ са живи, не само единичният тап.
    const мери = карта ? () => обходи({ карта }) : () => сценарии();
    let предиБр = 0, следБр = -1, гр = '', видове = [];
    try {
      предиБр = червени(await мери());                  // МЕРИ ПРЕДИ
      fs.writeFileSync(файл, счупен);
      const р = await мери();                           // МЕРИ ПАК
      следБр = червени(р);
      видове = р.находки.filter(x => x.тежест === 'ЧЕРВЕНО').map(x => x.вид);
    } catch (e) { гр = e.message; }
    върни();
    const хвана = следБр > предиБр;
    резултати.push({
      име, изход: хвана ? 'ХВАНАТА ✅' : ('ПРОПУСНАТА ❌' + (гр ? ' (' + гр + ')' : '')),
      детайл: 'червени ' + предиБр + ' → ' + следБр + (видове.length ? ' · ' + видове.join(', ') : '')
    });
  };

  // (1) махаме записа в „Списъкът с желания" — екранът показва, паметта не
  await пробвай('записът изчезва (Списъкът с желания)',
    т => т.replace("if (!save('bl_wm_wish', cur)) { каз(row2, НЕ_СЕ_ПОБРА, inp); fx().buzz(6); return; }", ""),
    'Списъкът с желания');

  // (2) правим бутона мълчалив при празно поле
  await пробвай('бутонът онемява (Свободният ден)',
    т => т.replace("if (!t) { каз(share, 'Първо го напиши — после ще има какво да покажеш.', ta); return; }",
      "if (!t) { return; }"),
    'свободен ден');

  // (3) счупваме полето „Мечтите ми" да не пази
  await пробвай('голямото поле спира да пази (Мечтите ми)',
    т => т.replace("if (!save('bl_wm_dreams', cur)) { if (сДума) каз(ta, НЕ_СЕ_ПОБРА); return; }", "d[k] = ta.value;"),
    'Мечтите ми');

  // (4) ВРЪЩАМЕ ПРАЗНАТА УЛОВКА — точно дефектът, който съседният отряд намери:
  //     „🔒 Заключено" върху нищо + изчистено поле при пълна памет.
  //     Тази примамка се хваща САМО от сценария за пълна памет (С6) — тоест
  //     проверява и че той е жив, не само единичният тап.
  await пробвай('празната уловка се връща (Заключеното дневниче)',
    т => т.replace("if (!save(key, cur)) { каз(b, НЕ_СЕ_ПОБРА, ta); fx().buzz(6); return; }",
      "save(key, cur);"),
    null);

  // (4) КОНТРОЛА В ОБРАТНАТА ПОСОКА: без примамка броят НЕ бива да расте.
  //     Мярка, която крещи и на здраво, е също толкова безполезна.
  let фалшива = null;
  try {
    const a = червени(await обходи({ карта: 'Списъкът с желания' }));
    const b = червени(await обходи({ карта: 'Списъкът с желания' }));
    фалшива = (a === b && a === 0);
    резултати.push({ име: 'КОНТРОЛА: здравата карта мълчи и при два пробега', изход: фалшива ? 'ДА ✅' : 'НЕ ❌', детайл: a + ' и ' + b + ' червени' });
  } catch (e) { резултати.push({ име: 'КОНТРОЛА', изход: 'ПАДНА ❌', детайл: e.message }); }

  върни();
  const върнатОК = fs.readFileSync(файл, 'utf8') === оригинал;
  return { резултати, върнатОК };
}

// ═══════════════════════════════════════════════════════════
// 7. ДОКЛАДЪТ
// ═══════════════════════════════════════════════════════════
async function главна() {
  const арг = process.argv.slice(2);
  const самоОпис = арг.includes('--opis');
  const само = арг.includes('--samoproverka');
  const кАрг = арг.find(a => a.indexOf('--karta=') === 0);
  const карта = кАрг ? кАрг.split('=')[1].replace(/^["']|["']$/g, '') : null;

  console.log('\n💃  ИНТЕРАКТИВНОТО В „ЖЕНАТА В МЕН"\n');

  if (само) {
    console.log('── САМОПРОВЕРКА (уредът се чупи нарочно) ──');
    const с = await самопроверка();
    с.резултати.forEach(r => console.log('   ' + r.изход.padEnd(16) + r.име + (r.детайл ? '\n' + ' '.repeat(19) + r.детайл : '')));
    console.log('   файлът върнат непокътнат: ' + (с.върнатОК ? 'да ✅' : 'НЕ ❌'));
    const паднали = с.резултати.filter(r => r.изход.indexOf('✅') < 0).length;
    console.log('\n═══ ' + (паднали ? '❌ УРЕДЪТ Е СЛЯП за ' + паднали + ' неща' : '✅ УРЕДЪТ ВИЖДА И В ДВЕТЕ ПОСОКИ') + ' ═══\n');
    return паднали || !с.върнатОК ? 1 : 0;
  }

  // ── 1. ОПИС ──
  const о = опис();
  console.log('── 1. ОПИС (какво изобщо има) ──');
  Object.keys(о.поФайл).forEach(ф => {
    console.log('   ' + ф.padEnd(16) + String(о.поФайл[ф].редове).padStart(5) + ' реда · ' +
      String(о.поФайл[ф].слушатели).padStart(3) + ' слушателя');
  });
  console.log('   ' + 'ОБЩО'.padEnd(16) + String(о.общоРедове).padStart(5) + ' реда · ' +
    String(о.общоСлушатели).padStart(3) + ' слушателя · ' + о.ключове.length + ' ключа в паметта');
  console.log('   ключове: ' + о.ключове.join(' '));

  if (самоОпис) { console.log(''); return 0; }

  // ── 2. ЖИВ ОБХОД ──
  console.log('\n── 2. ЖИВ ОБХОД (всяко нещо се натиска в чиста стая) ──');
  const празна = await обходи({ карта });
  console.log('   ПРЕГЛЕДАНИ: ' + празна.карти + ' карти · ' + празна.прегледани + ' интерактивни неща');
  console.log('   натиснати бутони: ' + празна.натиснати + ' · полета: ' + празна.полета + ' · пропуснати: ' + празна.пропуснати);

  // втори обход: с попълнени данни на майката (карти, които се отключват)
  const пълен = {
    bl_me: JSON.stringify({ name: 'Ани', birth: '1994-03-25' }),
    bl_baby: JSON.stringify({ name: 'Мая', birth: '2026-01-11' }),
    bl_wm_visits: JSON.stringify(['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24']),
    bl_wm_letters: JSON.stringify([{ t: 'старо писмо', d: '2025-01-01' }]),
    bl_wm_bucket: JSON.stringify([{ t: 'да отида на море' }]),
    bl_wm_inframe: JSON.stringify({ '2026-07': 'data:image/jpeg;base64,AAA' }),
    bl_wm_taste: JSON.stringify([{ t: 'моята песен', d: '2026-08-01' }]),
    bl_wm_hora: JSON.stringify([{ t: 'Мими' }]),
    bl_wm_replies: JSON.stringify([{ t: 'моето изречение', d: '2026-08-01' }]),
    bl_wm_night: JSON.stringify({ '2026-08-24': 2, '2026-08-25': 1 })
  };
  const втори = await обходи({ карта, склад: пълен });
  console.log('   ВТОРИ ОБХОД (с данни на майката): ' + втори.карти + ' карти · ' + втори.прегледани + ' неща');

  // ── 2б. ПРОФИЛЪТ ──
  let проф = { прегледани: 0, карти: 0, натиснати: 0, находки: [] };
  try {
    проф = await обходиПрофил({ bl_mama: JSON.stringify({ name: 'Ани', emoji: '🌸' }), bl_onboarded: 'true' });
    console.log('   ПРОФИЛЪТ: ' + проф.карти + ' карти · ' + проф.прегледани + ' неща · натиснати ' + проф.натиснати);
  } catch (e) { console.log('   ПРОФИЛЪТ: не се отвори — ' + e.message); }

  // ── 3. СЦЕНАРИИ ──
  console.log('\n── 3. СЦЕНАРИИ (редици, които единичният тап не вижда) ──');
  const с = await сценарии();
  console.log('   пуснати сценария: ' + с.пуснати);

  // ── 4. НАХОДКИТЕ ──
  const всички = [];
  const ключ = н => н.тежест + '|' + н.вид + '|' + (н.карта || '') + '|' + (н.име || '');
  const видени = new Set();
  [].concat(празна.находки, втори.находки, проф.находки, с.находки).forEach(н => {
    if (видени.has(ключ(н))) return; видени.add(ключ(н)); всички.push(н);
  });
  const червени = всички.filter(н => н.тежест === 'ЧЕРВЕНО');
  const оранжеви = всички.filter(н => н.тежест === 'ОРАНЖЕВО');

  console.log('\n── 4. НАХОДКИ ──');
  if (!всички.length) console.log('   няма (прегледани ' + (празна.прегледани + втори.прегледани) + ' неща + ' + с.пуснати + ' сценария)');
  [['🔴 ЧЕРВЕНИ', червени], ['🟠 ОРАНЖЕВИ', оранжеви]].forEach(([загл, списък]) => {
    if (!списък.length) return;
    console.log('\n   ' + загл + ' (' + списък.length + ')');
    списък.forEach(н => console.log('      · ' + (н.карта || '—') + '  →  ' + (н.име || '') +
      '\n        ' + н.вид + (н.детайл ? ' · ' + н.детайл : '')));
  });

  console.log('\n═══ ' + (червени.length ? '❌ ' + червени.length + ' ЧЕРВЕНИ' : '✅ ЧИСТО') +
    ' · прегледани ' + (празна.прегледани + втори.прегледани) + ' интерактивни неща в ' +
    (празна.карти + втори.карти) + ' карти ═══\n');
  return червени.length ? 1 : 0;
}

if (require.main === module) {
  главна().then(k => process.exit(k)).catch(e => { console.error(e); process.exit(2); });
}
module.exports = { новПрозорец, зареди, построй, опис, обходи, сценарии, самопроверка, СТАЯ };
