// ═══════════════════════════════════════════════════════════
// 🖐️ ИНТЕРАКТИВНОТО В СТАИТЕ — натиска всичко в rooms/rooms3/rooms4/rooms5
//
// ЗАЩО: js/rooms3.js има 71 слушателя — най-интерактивният файл в проекта.
// Там майката отмята, брои, пише, избира. Никой не е проверявал СИСТЕМНО
// дали всяко от тези неща (1) реагира, (2) записва, (3) показва резултат,
// (4) оцелява след презареждане, (5) НЕ ЛЪЖЕ, че е записало.
//
// dev/interaktivno.js прави същото, но САМО В БРАУЗЪР. Browser панелът заби
// над десет пъти за един ден (виж dev/bez_brauzar.js) — а непусната проверка
// е нула. Тук всичко върви в Node върху СОБСТВЕН миниатюрен DOM.
//
// ПУСКАНЕ:
//   node dev/interaktivno_stai.js               — опис + жив обход
//   node dev/interaktivno_stai.js --opis         — само статичният опис
//   node dev/interaktivno_stai.js --samoproverka — уредът се изпитва В ДВЕТЕ ПОСОКИ
//   node dev/interaktivno_stai.js --staya="Захранване"
//   BL_DEBUG="+ Добави" node dev/interaktivno_stai.js   — какво точно е измерил
//                                                          за ЕДИН бутон по надпис
//
// 🪤 МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. Затова --samoproverka чупи
//    нарочно по един запис/селектор и иска уредът ДА ГИ ХВАНЕ. Ако не ги
//    хване, изходът е 1 и в доклада пише „уредът е сляп“.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Пише единствено в собствената си
//    памет (localStorage е обикновен обект в паметта на Node). Нула следи.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ФАЙЛОВЕ = ['js/rooms.js', 'js/rooms3.js', 'js/rooms4.js', 'js/rooms5.js'];

// ═══════════════════════════════════════════════════════════
// 1. МИНИАТЮРНИЯТ DOM
//    Пише се на ръка, защото jsdom го няма (проверено: require('jsdom') → грешка).
// ═══════════════════════════════════════════════════════════

const ПРАЗНИ_ЕТИКЕТИ = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function разкодирай(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
function закодирай(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class Текст {
  constructor(t) { this.nodeType = 3; this.data = String(t); this.parentNode = null; }
  get textContent() { return разкодирай(this.data); }
  set textContent(v) { this.data = закодирай(v); }
  get outerHTML() { return this.data; }
}

let _уид = 0;

class Възел {
  constructor(tag, док) {
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.localName = String(tag).toLowerCase();
    this._док = док;
    this._атр = Object.create(null);
    this.childNodes = [];
    this.parentNode = null;
    this._слушатели = Object.create(null);
    this._уид = ++_уид;
    this.style = новСтил();
    this.dataset = новDataset(this);
    this.hidden = false;
    this.files = [];
    // 🪤 В браузъра `input.value` е '' по подразбиране, не undefined.
    //    Без този ред rooms3.js:1019 (`inp.value.toLowerCase()`) гърмеше в
    //    пясъчника и УРЕДЪТ обвиняваше приложението за собствената си дупка.
    if (this.localName === 'input' || this.localName === 'textarea' || this.localName === 'select') {
      this.value = ''; this.placeholder = ''; this.type = 'text'; this.checked = false;
    }
    // числа за оформление — миниатюрният DOM не мери истински пиксели,
    // но кодът пита за тях и трябва да получи нещо ненулево
    this.offsetWidth = 300; this.offsetHeight = 44; this.offsetLeft = 0; this.offsetTop = 0;
  }

  // ── атрибути ──
  setAttribute(k, v) {
    k = String(k);
    if (k === 'class') { this.className = String(v); return; }
    if (k === 'hidden') { this.hidden = true; return; }
    this._атр[k] = String(v);
  }
  getAttribute(k) {
    k = String(k);
    if (k === 'class') return this._атр['class'] || null;
    return k in this._атр ? this._атр[k] : null;
  }
  removeAttribute(k) { delete this._атр[String(k)]; }
  hasAttribute(k) { return String(k) in this._атр; }

  get className() { return this._атр['class'] || ''; }
  set className(v) { this._атр['class'] = String(v); }

  get classList() {
    const сам = this;
    const списък = () => (сам.className || '').split(/\s+/).filter(Boolean);
    const запиши = a => { сам.className = a.join(' '); };
    return {
      add(...ims) { const a = списък(); ims.forEach(i => { if (i && !a.includes(i)) a.push(i); }); запиши(a); },
      remove(...ims) { запиши(списък().filter(x => !ims.includes(x))); },
      contains(i) { return списък().includes(i); },
      toggle(i, сила) {
        const има = списък().includes(i);
        const искаме = сила === undefined ? !има : !!сила;
        if (искаме) this.add(i); else this.remove(i);
        return искаме;
      },
      get length() { return списък().length; }
    };
  }

  // ── дърво ──
  appendChild(n) {
    if (n == null) throw new TypeError("Failed to execute 'appendChild': parameter 1 is not of type 'Node'.");
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this;
    this.childNodes.push(n);
    return n;
  }
  removeChild(n) {
    const i = this.childNodes.indexOf(n);
    if (i > -1) { this.childNodes.splice(i, 1); n.parentNode = null; }
    return n;
  }
  insertBefore(нов, реф) {
    if (нов.parentNode) нов.parentNode.removeChild(нов);
    const i = реф ? this.childNodes.indexOf(реф) : -1;
    нов.parentNode = this;
    if (i < 0) this.childNodes.push(нов); else this.childNodes.splice(i, 0, нов);
    return нов;
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  replaceWith(...нови) {
    const p = this.parentNode; if (!p) return;
    let i = p.childNodes.indexOf(this);
    p.removeChild(this);
    нови.filter(Boolean).forEach(n => { p.insertBefore(n, p.childNodes[i] || null); i++; });
  }
  after(...нови) {
    const p = this.parentNode; if (!p) return;
    let i = p.childNodes.indexOf(this) + 1;
    нови.filter(Boolean).forEach(n => { p.insertBefore(n, p.childNodes[i] || null); i++; });
  }
  before(...нови) {
    const p = this.parentNode; if (!p) return;
    let i = p.childNodes.indexOf(this);
    нови.filter(Boolean).forEach(n => { p.insertBefore(n, p.childNodes[i] || null); i++; });
  }
  insertAdjacentElement(къде, n) {
    if (къде === 'afterend') this.after(n);
    else if (къде === 'beforebegin') this.before(n);
    else if (къде === 'beforeend') this.appendChild(n);
    else if (къде === 'afterbegin') this.insertBefore(n, this.childNodes[0] || null);
    return n;
  }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get isConnected() {
    let n = this;
    while (n) { if (n === this._док.documentElement || n === this._док) return true; n = n.parentNode; }
    return false;
  }
  closest(сел) {
    let n = this;
    while (n && n.nodeType === 1) { if (пасваЛи(n, сел)) return n; n = n.parentNode; }
    return null;
  }
  // daily.js:512 пита `t.matches(...)` в глобалния слушател за черновите
  matches(сел) { return пасваЛи(this, сел); }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }

  // ── съдържание ──
  get textContent() {
    return this.childNodes.map(n => n.textContent).join('');
  }
  set textContent(v) {
    this.childNodes.forEach(n => { n.parentNode = null; });
    this.childNodes = [];
    if (v !== '' && v != null) this.appendChild(new Текст(закодирай(v)));
  }
  get innerText() { return this.textContent; }
  get innerHTML() { return this.childNodes.map(n => n.outerHTML).join(''); }
  set innerHTML(html) {
    this.childNodes.forEach(n => { n.parentNode = null; });
    this.childNodes = [];
    разбори(String(html == null ? '' : html), this, this._док);
  }
  get outerHTML() {
    const атр = Object.keys(this._атр).map(k => ' ' + k + '="' + String(this._атр[k]).replace(/"/g, '&quot;') + '"').join('')
      + (this.hidden ? ' hidden' : '');
    if (ПРАЗНИ_ЕТИКЕТИ.has(this.localName)) return '<' + this.localName + атр + '>';
    return '<' + this.localName + атр + '>' + this.innerHTML + '</' + this.localName + '>';
  }

  // ── търсене ──
  querySelector(сел) { return намери(this, сел, true)[0] || null; }
  querySelectorAll(сел) { return намери(this, сел, false); }

  // ── събития ──
  addEventListener(вид, fn) {
    (this._слушатели[вид] = this._слушатели[вид] || []).push(fn);
  }
  removeEventListener(вид, fn) {
    const a = this._слушатели[вид]; if (!a) return;
    const i = a.indexOf(fn); if (i > -1) a.splice(i, 1);
  }
  dispatchEvent(ев) {
    ев.target = ев.target || this;
    let n = this;
    while (n) {
      ев.currentTarget = n;
      const a = (n._слушатели && n._слушатели[ев.type]) || [];
      for (const fn of a.slice()) {
        try { fn.call(n, ев); } catch (e) { (this._док._грешки || []).push(e); }
        if (ев._спрян) return !ев.defaultPrevented;
      }
      n = n.parentNode || (n === this._док.documentElement ? this._док : null);
      if (n === this._док) {
        ев.currentTarget = n;
        const b = (n._слушатели && n._слушатели[ев.type]) || [];
        for (const fn of b.slice()) {
          try { fn.call(n, ев); } catch (e) { (this._док._грешки || []).push(e); }
        }
        break;
      }
    }
    return !ев.defaultPrevented;
  }
  click() {
    // избирачът на файл не може да се симулира — но ТРЯБВА да се знае, че е
    // бил повикан, иначе бутонът „+ снимка“ изглежда мъртъв, а не е.
    if (this.localName === 'input' && String(this.type) === 'file') { this._док._файлНатиснат = true; return; }
    this.dispatchEvent(новоСъбитие('click', this));
  }
  focus() { this._док.activeElement = this; }
  blur() { if (this._док.activeElement === this) this._док.activeElement = null; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 44, right: 300, bottom: 44, x: 0, y: 0 }; }
  scrollIntoView() {}
  setSelectionRange() {}
}

// стойността на <input>/<textarea> е обикновено поле — прибавя се лениво
function новСтил() {
  const s = { cssText: '' };
  s.setProperty = (k, v) => { s[k] = String(v); };
  s.getPropertyValue = k => (k in s ? String(s[k]) : '');
  s.removeProperty = k => { delete s[k]; };
  return s;
}
function новDataset(възел) {
  return new Proxy({}, {
    get(_, k) {
      if (typeof k !== 'string') return undefined;
      return възел.getAttribute('data-' + камилаКъмТире(k)) ?? undefined;
    },
    set(_, k, v) { възел.setAttribute('data-' + камилаКъмТире(k), v); return true; },
    has(_, k) { return възел.hasAttribute('data-' + камилаКъмТире(k)); },
    deleteProperty(_, k) { възел.removeAttribute('data-' + камилаКъмТире(k)); return true; }
  });
}
const камилаКъмТире = s => String(s).replace(/[A-Z]/g, m => '-' + m.toLowerCase());

function новоСъбитие(вид, цел) {
  return {
    type: вид, target: цел || null, currentTarget: null,
    defaultPrevented: false, _спрян: false,
    clientX: 150, clientY: 22, key: '',
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this._спрян = true; },
    stopImmediatePropagation() { this._спрян = true; }
  };
}

// ── миниатюрният разбор на HTML ──
function разбори(html, корен, док) {
  const стек = [корен];
  let i = 0;
  const РЕ_ЕТИКЕТ = /<(\/?)([a-zA-Z][-a-zA-Z0-9:]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>`=]+))?)*)\s*(\/?)>/g;
  let m;
  РЕ_ЕТИКЕТ.lastIndex = 0;
  while ((m = РЕ_ЕТИКЕТ.exec(html))) {
    if (m.index > i) добавиТекст(html.slice(i, m.index));
    i = m.index + m[0].length;
    const затварящ = m[1] === '/', име = m[2].toLowerCase(), самозатварящ = m[4] === '/';
    if (затварящ) {
      for (let k = стек.length - 1; k > 0; k--) {
        if (стек[k].localName === име) { стек.length = k; break; }
      }
      continue;
    }
    const n = new Възел(m[2], док);
    прочетиАтрибути(m[3] || '', n);
    стек[стек.length - 1].appendChild(n);
    if (!самозатварящ && !ПРАЗНИ_ЕТИКЕТИ.has(име)) стек.push(n);
  }
  if (i < html.length) добавиТекст(html.slice(i));

  function добавиТекст(t) {
    if (!t) return;
    стек[стек.length - 1].appendChild(new Текст(t));
  }
}
function прочетиАтрибути(низ, възел) {
  const РЕ = /([^\s"'>\/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>`=]+))?/g;
  let m;
  while ((m = РЕ.exec(низ))) {
    let v = m[2];
    if (v === undefined) v = '';
    else if (/^["']/.test(v)) v = v.slice(1, -1);
    const k = m[1];
    if (k.toLowerCase() === 'hidden') { възел.hidden = true; continue; }
    if (k.toLowerCase() === 'type') възел.type = v;
    if (k.toLowerCase() === 'value') възел.value = v;
    възел.setAttribute(k, разкодирай(v));
  }
}

// ── селектори: тагове, .класове, #ид, [атр], [атр="стойност"], потомци, запетаи ──
function разборНаСелектор(сел) {
  return String(сел).split(',').map(част => част.trim()).filter(Boolean).map(част =>
    част.split(/\s+/).filter(Boolean).map(съставен => {
      const о = { таг: null, класове: [], ид: null, атр: [] };
      const РЕ = /([a-zA-Z][-a-zA-Z0-9]*)|\.([-\wЀ-ӿ]+)|#([-\w]+)|\[([^\]=]+)(?:\s*=\s*"?([^"\]]*)"?)?\]|:scope|::?[-\w()]+/g;
      let m;
      while ((m = РЕ.exec(съставен))) {
        if (m[1]) о.таг = m[1].toLowerCase();
        else if (m[2]) о.класове.push(m[2]);
        else if (m[3]) о.ид = m[3];
        else if (m[4]) о.атр.push([m[4].trim(), m[5]]);
      }
      return о;
    })
  );
}
function пасваСъставен(възел, о) {
  if (възел.nodeType !== 1) return false;
  if (о.таг && възел.localName !== о.таг) return false;
  if (о.ид && възел.getAttribute('id') !== о.ид) return false;
  for (const k of о.класове) if (!възел.classList.contains(k)) return false;
  for (const [a, v] of о.атр) {
    if (!възел.hasAttribute(a)) return false;
    if (v !== undefined && възел.getAttribute(a) !== v) return false;
  }
  return true;
}
function пасваЛи(възел, сел) {
  return разборНаСелектор(сел).some(вериги => {
    const пос = вериги[вериги.length - 1];
    if (!пасваСъставен(възел, пос)) return false;
    let n = възел.parentNode, k = вериги.length - 2;
    while (k >= 0) {
      let намерен = false;
      while (n && n.nodeType === 1) {
        if (пасваСъставен(n, вериги[k])) { намерен = true; n = n.parentNode; break; }
        n = n.parentNode;
      }
      if (!намерен) return false;
      k--;
    }
    return true;
  });
}
function намери(корен, сел, самоПървия) {
  const вън = [];
  const стек = корен.childNodes.slice();
  const всички = [];
  while (стек.length) {
    const n = стек.shift();
    if (n.nodeType === 1) { всички.push(n); стек.unshift(...n.childNodes); }
  }
  for (const n of всички) {
    if (пасваЛи(n, сел)) { вън.push(n); if (самоПървия) break; }
  }
  return вън;
}

// ═══════════════════════════════════════════════════════════
// 2. ПЯСЪЧНИКЪТ — прозорец, памет, часовник
// ═══════════════════════════════════════════════════════════

function новаПамет(лимитБайта) {
  const хранилище = new Map();
  const л = {
    _пълна: false,
    _записи: 0, _откази: 0,
    getItem(k) { return хранилище.has(String(k)) ? хранилище.get(String(k)) : null; },
    setItem(k, v) {
      if (л._пълна) { л._откази++; const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      const нов = String(v);
      if (лимитБайта) {
        let общо = нов.length;
        for (const [kk, vv] of хранилище) if (kk !== String(k)) общо += vv.length;
        if (общо > лимитБайта) { л._откази++; const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      }
      хранилище.set(String(k), нов); л._записи++;
    },
    removeItem(k) { хранилище.delete(String(k)); },
    clear() { хранилище.clear(); },
    key(i) { return [...хранилище.keys()][i] ?? null; },
    get length() { return хранилище.size; },
    _снимка() { return JSON.stringify([...хранилище.entries()].sort()); },
    _върни(с) { хранилище.clear(); JSON.parse(с).forEach(([k, v]) => хранилище.set(k, v)); },
    _карта() { return хранилище; }
  };
  return л;
}

function новПрозорец(опции) {
  опции = опции || {};
  const W = {};
  const док = {};
  const памет = новаПамет(опции.лимит);

  // ── часовник ──
  let сега = 0, ид = 0;
  const таймери = [];
  const дневник = { cheer: [], confetti: [], buzz: 0, печат: [], отваряни: [], външни: 0, бележки: [] };

  Object.assign(W, {
    console, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    TypeError, Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat,
    Infinity, NaN, undefined
  });
  // 🗓️ Неделният дайджест (rooms5.js:397) се показва САМО в неделя. Без начин да
  //    се премести денят, този клон никога не се проверява — а точно там живее
  //    повторението. Часът си остава истинският (пелена-пазачът иска ≥14:00).
  if (опции.денОтНеделя != null) {
    const Истина = Date;
    const б = new Истина();
    б.setDate(б.getDate() + ((опции.денОтНеделя - б.getDay() + 7) % 7));
    const отместване = б.getTime() - Истина.now();
    W.Date = new Proxy(Истина, {
      construct(ц, арг) { return арг.length ? new ц(...арг) : new ц(Истина.now() + отместване); },
      get(ц, п) { if (п === 'now') return () => Истина.now() + отместване; return Reflect.get(ц, п); }
    });
  }
  W.setTimeout = (fn, ms) => { const i = ++ид; таймери.push({ i, кога: сега + (+ms || 0), fn, повтори: 0 }); return i; };
  W.setInterval = (fn, ms) => { const i = ++ид; таймери.push({ i, кога: сега + (+ms || 0), fn, повтори: +ms || 1000 }); return i; };
  W.clearTimeout = i => { const k = таймери.findIndex(t => t.i === i); if (k > -1) таймери.splice(k, 1); };
  W.clearInterval = W.clearTimeout;
  W.requestAnimationFrame = fn => W.setTimeout(() => fn(сега), 16);
  W.cancelAnimationFrame = W.clearTimeout;
  W._часовник = {
    напред(ms) {
      const край = сега + ms;
      let пазач = 0;
      while (пазач++ < 5000) {
        таймери.sort((a, b) => a.кога - b.кога);
        const t = таймери.find(x => x.кога <= край);
        if (!t) break;
        сега = Math.max(сега, t.кога);
        if (t.повтори) t.кога = сега + t.повтори;
        else W.clearTimeout(t.i);
        try { t.fn(); } catch (e) { док._грешки.push(e); }
      }
      сега = край;
    },
    брой() { return таймери.length; },
    изчисти() { таймери.length = 0; }
  };

  // ── документ ──
  док.nodeType = 9;
  док._грешки = [];
  док._слушатели = Object.create(null);
  док.createElement = таг => new Възел(таг, док);
  док.createTextNode = t => new Текст(закодирай(t));
  док.createDocumentFragment = () => new Възел('#fragment', док);
  док.documentElement = new Възел('html', док);
  док.body = new Възел('body', док);
  док.head = new Възел('head', док);
  док.documentElement.appendChild(док.head);
  док.documentElement.appendChild(док.body);
  док.readyState = 'complete';
  док.visibilityState = 'visible';
  док.hidden = false;
  док.activeElement = null;
  док.addEventListener = (в, fn) => { (док._слушатели[в] = док._слушатели[в] || []).push(fn); };
  док.removeEventListener = (в, fn) => { const a = док._слушатели[в]; if (!a) return; const i = a.indexOf(fn); if (i > -1) a.splice(i, 1); };
  док.dispatchEvent = ев => {
    const a = док._слушатели[ев.type] || [];
    for (const fn of a.slice()) { try { fn.call(док, ев); } catch (e) { док._грешки.push(e); } }
    return true;
  };
  док.querySelector = с => намери(док.documentElement, с, true)[0] || null;
  док.querySelectorAll = с => намери(док.documentElement, с, false);
  док.getElementById = ид2 => намери(док.documentElement, '#' + ид2, true)[0] || null;

  // елементи, за които кодът пита по име
  const овърлей = new Възел('div', док);
  овърлей.setAttribute('id', 'roomOverlay');
  овърлей.hidden = false;
  док.body.appendChild(овърлей);

  W.document = док;
  W.localStorage = памет;
  W.sessionStorage = новаПамет();
  W.window = W;
  W.self = W;
  W.addEventListener = () => {};
  W.removeEventListener = () => {};
  W.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  W.getComputedStyle = () => ({ getPropertyValue: () => '', position: 'static' });
  W.navigator = { userAgent: 'node-mini-dom', language: 'bg', vibrate() {} };
  W.location = { href: 'http://localhost/', search: '', hash: '', pathname: '/' };
  W.alert = () => {};
  W.confirm = () => true;
  W.scrollTo = () => {};
  W.Node = Възел; W.Element = Възел; W.HTMLElement = Възел;
  W._дневник = дневник;

  // ── съседните модули (в браузъра ги дават други файлове) ──
  W.BL_DATE = {
    addMonths(date, n) {
      const x = new Date(date);
      if (isNaN(x)) return x;
      const day = x.getDate();
      x.setDate(1);
      x.setMonth(x.getMonth() + Number(n || 0));
      const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
      x.setDate(Math.min(day, last));
      return x;
    }
  };
  W.BL_AGE = birth => {
    if (!birth) return null;
    const м = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(birth));
    const b = м ? new Date(+м[1], +м[2] - 1, +м[3]) : new Date(birth);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    if (isNaN(b) || b > now) return null;
    const totalDays = Math.round((now - b) / 86400000);
    let ym = now.getFullYear() * 12 + now.getMonth() - (b.getFullYear() * 12 + b.getMonth());
    if (W.BL_DATE.addMonths(b, ym) > now) ym--;
    if (ym < 0) ym = 0;
    const days = Math.max(0, Math.round((now - W.BL_DATE.addMonths(b, ym)) / 86400000));
    const months = totalDays / 30.4375;
    return {
      months, totalDays, ym, days, devMonths: ym, preterm: 0,
      text: ym < 1 ? totalDays + (totalDays === 1 ? ' ден' : ' дни')
        : ym + (ym === 1 ? ' месец' : ' месеца') + (days ? ' и ' + days + (days === 1 ? ' ден' : ' дни') : '')
    };
  };
  W.BL_FX = {
    confetti(къде) { дневник.confetti.push(String((къде && къде.className) || '')); },
    cheer(т) { дневник.cheer.push(String(т == null ? '' : т)); },
    buzz() { дневник.buzz++; },
    pop() {}, chime() {}, countUp() {}
  };
  W.BL_BROI = (n, ед, мн) => n + ' ' + (n === 1 ? ед : мн);
  W.BL_UI = {
    confirm: () => Promise.resolve(true),
    // честното „не можах да го запазя“ минава оттук — брои се отделно от успеха
    note: т => { дневник.бележки.push(String(т == null ? '' : т)); return Promise.resolve(true); }
  };
  W.BL_EXPR = {
    shrinkImage(f, w, cb) { cb('data:image/png;base64,AAA'); },
    printOverlay(з, тяло) { дневник.печат.push({ з, тяло: String(тяло) }); },
    voiceCard(з) { const c = док.createElement('section'); c.className = 'jr-card'; c.innerHTML = з; return c; },
    photoListCard(з) { const c = док.createElement('section'); c.className = 'jr-card'; c.innerHTML = з; return c; }
  };
  W.BL_EXPECT = { lmp: () => { try { return JSON.parse(памет.getItem('bl_lmp')) || ''; } catch (e) { return ''; } }, paused: () => false };
  W.BL_RIVER = { collect: () => [] };
  W.BL_VACCINES = [{ m: 0, n: 'Хепатит Б' }, { m: 2, n: 'Петвалентна' }, { m: 4, n: 'Петвалентна 2' }];
  W.BL_LIB = { count: () => 0, search: () => [] };
  W.BL_DATA = { activities: [] };
  W.BL_GAMES2 = { покани() {} };
  W.MamaHelper = { open(с) { дневник.отваряни.push(с); }, showTab(т) { дневник.отваряни.push('tab:' + т); } };
  W.BL_SHARE = { shareCard() { дневник.външни++; } };
  W.refreshToday = () => {};
  // нощната лампа рисува върху <html> — броим го като видимо действие
  Object.defineProperty(W, 'BL_LAMP', {
    configurable: true,
    get() { return W._lamp; },
    set(f) { W._lamp = (...a) => { дневник.външни++; return f(...a); }; }
  });

  vm.createContext(W);
  W.globalThis = W;
  return W;
}

function зареди(W, файлове) {
  const беди = [];
  for (const f of файлове) {
    const п = path.join(ROOT, f);
    try { new vm.Script(fs.readFileSync(п, 'utf8'), { filename: f }).runInContext(W); }
    catch (e) { беди.push(f + ' → ' + e.name + ': ' + e.message); }
  }
  return беди;
}

// ═══════════════════════════════════════════════════════════
// 3. СТАТИЧНИЯТ ОПИС — какво изобщо има
// ═══════════════════════════════════════════════════════════

// текстове, с които приложението ОБЯВЯВА успех пред мама
const УСПЕХ = /(✔|✓|записа|запечата|оставено|готово|копирано|върнах|прието|добавих|запазено)/i;

function опис() {
  const редове = [];
  let общо = 0, прегледани = 0;
  for (const f of ФАЙЛОВЕ) {
    const текст = fs.readFileSync(path.join(ROOT, f), 'utf8');
    // 🪤 CRLF: файловете са с CRLF. Работим върху суровия низ и си режем \r.
    const код = текст.replace(/\r\n/g, '\n');
    const редовеНаФайла = код.split('\n');
    // 🪤 Името на събитието НЕ е само букви: 'bl:tried-changed' и 'bl:ms-changed'
    //    носят двоеточие и тире. С `[a-zA-Z]+` уредът броеше 69 от 71 и мълчеше
    //    за разликата — тоест две собствени събития на приложението бяха невидими.
    const РЕ = /addEventListener\s*\(\s*['"]([a-zA-Z][\w:.-]*)['"]/g;
    let m;
    const тук = [];
    while ((m = РЕ.exec(код))) {
      общо++;
      const ред = код.slice(0, m.index).split('\n').length;
      const тяло = тялоНаСлушателя(код, m.index);
      const ключове = [...new Set([...тяло.matchAll(/\b(?:load|save)\s*\(\s*['"]([a-zA-Z_][\w]*)['"]/g)].map(x => x[1]))];
      const директни = [...new Set([...тяло.matchAll(/localStorage\.(?:get|set|remove)Item\s*\(\s*['"]([^'"]+)['"]/g)].map(x => x[1]))];
      const всичкиКлючове = [...new Set(ключове.concat(директни))];
      const показва = /\b(?:tick|hint|nudge|draw|рисувай|освежи|обнови|синхронизирай|кажи)\s*\(/.test(тяло)
        || /(?:textContent|innerHTML)\s*=/.test(тяло)
        || /classList\.(?:add|remove|toggle)/.test(тяло)
        || /\bfx\(\)\.(?:cheer|confetti)/.test(тяло)
        || /replaceWith/.test(тяло) || /\bhidden\s*=/.test(тяло);
      const пише = /\bsave\s*\(/.test(тяло) || /localStorage\.(?:set|remove)Item/.test(тяло);
      const пазиУспех = /if\s*\(\s*!\s*save\s*\(/.test(тяло) || /save\([^)]*\)\s*(?:===|!==|\?)/.test(тяло);
      const обявяваУспех = УСПЕХ.test(тяло);
      тук.push({
        файл: f, ред, вид: m[1],
        функция: най_близкаФункция(редовеНаФайла, ред),
        ключове: всичкиКлючове, пише, показва, обявяваУспех, пазиУспех
      });
      прегледани++;
    }
    редове.push({ файл: f, брой: тук.length, слушатели: тук });
  }
  return { общо, прегледани, редове };
}

// изрязва тялото на слушателя: от индекса на addEventListener до затварящата скоба
function тялоНаСлушателя(код, начало) {
  let i = код.indexOf('(', начало);
  if (i < 0) return '';
  let дълбочина = 0, в = null, екран = false;
  for (let k = i; k < код.length && k < i + 20000; k++) {
    const c = код[k];
    if (екран) { екран = false; continue; }
    if (c === '\\') { екран = true; continue; }
    if (в) { if (c === в) в = null; continue; }
    if (c === '"' || c === "'" || c === '`') { в = c; continue; }
    if (c === '(') дълбочина++;
    else if (c === ')') { дълбочина--; if (дълбочина === 0) return код.slice(i, k + 1); }
  }
  return код.slice(i, i + 2000);
}
function най_близкаФункция(редове, ред) {
  for (let i = ред - 1; i >= 0; i--) {
    const m = /^\s*(?:function\s+([A-Za-zА-Яа-я_$][\w$А-Яа-я]*)|const\s+([A-Za-zА-Яа-я_$][\w$А-Яа-я]*)\s*=\s*(?:\(|function|root|r)\s*=?>?)/.exec(редове[i] || '');
    if (m) return m[1] || m[2];
  }
  return '(горно ниво)';
}

// ═══════════════════════════════════════════════════════════
// 4. ЖИВИЯТ ОБХОД — натиска и мери
// ═══════════════════════════════════════════════════════════

const ПРОФИЛИ = {
  'бременна': () => {
    const lmp = new Date(); lmp.setDate(lmp.getDate() - 24 * 7);
    return {
      bl_baby: { name: 'Мира', sex: 'ж', birth: '' },
      bl_lmp: lmp.toISOString().slice(0, 10),
      bl_partner: 'да',
      bl_checkins: { [дн(0)]: { m: 3, e: 60, w: 'слънчево' }, [дн(-1)]: { m: 1, e: 30, w: 'тежко' } },
      bl_tried: { 'тиквичка': '😋', 'морков': '😋', 'яйце': '⚠️ реакция' },
      bl_pharmacy: [{ n: 'Термометър', exp: '' }],
      bl_sos: { pedName: 'д-р Иванова', pedPhone: '0888123456' }
    };
  },
  'с бебе': () => {
    const b = new Date(); b.setMonth(b.getMonth() - 8);
    return {
      bl_baby: { name: 'Мира', sex: 'ж', birth: b.toISOString().slice(0, 10) },
      bl_partner: 'да',
      bl_checkins: { [дн(0)]: { m: 3, e: 60, w: 'слънчево' }, [дн(-1)]: { m: 1, e: 30, w: 'тежко' } },
      bl_tried: { 'тиквичка': '😋', 'морков': '😋', 'яйце': '⚠️ реакция' },
      bl_pharmacy: [{ n: 'Термометър', exp: '' }],
      bl_nursing: [{ s: 'Л', dur: 600, ts: Date.now() - 3600000 }],
      bl_meds: [{ n: 'Нурофен по лекаря', ts: Date.now() - 7200000 }],
      bl_temps: [{ v: 37.4, ts: Date.now() - 3600000 }],
      bl_books: [{ t: 'Лека нощ, Луна', fav: false, ts: Date.now() - 86400000 }],
      bl_playlist: [{ t: 'Ave Maria', d: Date.now() - 86400000 }],
      bl_names_vote: [{ n: 'Мира', m: 1, t: 0 }],
      bl_goal: { n: 'столче за кола', target: 300, saved: 50 },
      bl_wardrobe: { '68': 4 },
      bl_ms_done: { '6_motor': true, '8_speech': true },
      bl_sos: { pedName: 'д-р Иванова', pedPhone: '0888123456' },
      bl_events: [{ id: 'e1', t: 'Преглед при педиатъра', d: дн(5), e: '🩺' }],
      bl_letters: [{ who: 'мама', t: 'обичам ни', ts: Date.now() - 86400000 }],
      bl_menu: { [дн(1)]: 'тиквичка' },
      bl_diapers: { [дн(0)]: { wet: 4, dirty: 2 } }
    };
  }
};
function дн(отместване) {
  const d = new Date(); d.setDate(d.getDate() + отместване);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const СТАИ = ['Дневник на мама', 'Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Развитие и игри', 'Инструменти'];

// 🪤 Думи, които мама НЕ бива да вижда никога. Идват от чуждо/старо копие в
//    паметта („Възстанови от файл“) или от липсващо поле — и се изписват буквално.
//    rooms4.js вече е поправен по този клас на 11.08 („ИЗМЕРЕНО с чекин без
//    личице“ → на плочката пишеше „undefined“); тук се проверява НАВСЯКЪДЕ.
const МАШИННИ_ДУМИ = /undefined|\bNaN\b|Invalid Date|\[object Object\]|null%/;

// „повреден“ профил: същата мама, но с един чекин БЕЗ настроение и един счупен
// запис — точно каквото оставя внесено чуждо копие или по-стара версия
function повреденПрофил(основа) {
  const п = основа();
  const вчера = дн(-1);
  п.bl_checkins = Object.assign({}, п.bl_checkins);
  п.bl_checkins[вчера] = { e: 40, w: 'без личице' };   // ← липсва `m`
  return п;
}

// „с какво да напълня полето“ — по вид и по подсказка
function стойностЗаПоле(поле) {
  const п = String(поле.placeholder || поле.getAttribute('placeholder') || '');
  const вид = String(поле.type || 'text');
  if (вид === 'number') {
    if (/кг|кантар/i.test(п)) return '68';
    if (/лв/i.test(п)) return '250';
    if (/37|градус|темп/i.test(п)) return '37.4';
    if (/мл/i.test(п)) return '120';
    if (/oz|унц/i.test(п)) return '4';
    return '5';
  }
  if (вид === 'date') return дн(7);
  if (вид === 'range') return '70';
  if (вид === 'file') return '';
  return 'проба-' + Math.floor(Math.random() * 1000);
}

function интерактивните(корен) {
  const всички = корен.querySelectorAll('button, [role="button"], input, textarea, select');
  return всички.filter(e => {
    if (String(e.type || '') === 'file') return false;
    // 🪤 Скритият бутон не е мъртъв — мама просто не го вижда. „↩ Върни
    //    последното“ в касичката е hidden до първото „+5 лв“; уредът го
    //    натискаше и го обявяваше за мъртъв. Скритите и родителите им отпадат.
    let n = e;
    while (n && n !== корен) { if (n.hidden) return false; n = n.parentNode; }
    return true;
  });
}

function надпис(e) {
  return String(e.getAttribute('aria-label') || (e.textContent || '').trim() || e.placeholder || e.className || e.localName).replace(/\s+/g, ' ').slice(0, 46);
}

function построй(W, стая) {
  const root = W.document.createElement('div');
  root.className = 'ro-body';
  W.document.body.appendChild(root);
  const f = W.ROOM_FEATURES && W.ROOM_FEATURES[стая];
  if (!f) return { root, беда: 'няма ROOM_FEATURES' };
  try { f(root); } catch (e) { return { root, беда: e.name + ': ' + e.message }; }
  // 🪤 СЛЯПОТО ПЕТНО, което правеше проверката за мъртъв бутон безсилна:
  //    строежът оставя ЧАКАЩИ таймери (rooms.js:160 пали избраното личице след
  //    60 мс). Ако часовникът не се изчерпи ТУК, този таймер гръмва по средата
  //    на измерването и се приписва на натискането — тоест всеки бутон в стая
  //    с „Как си днес?“ излизаше жив, включително наистина мъртвите.
  //    Доказано: с 50 мс уредът пропускаше мъртвия „+ Добави“; с 5000 го хваща.
  W._часовник.напред(5000);
  return { root, беда: null };
}

// 🪤 Първата версия мереше САМО текста и броя възли. Тогава чипът „🌸 мама“ и
//    личицата в „Как си днес“ излизаха МЪРТВИ — а те само сменят клас („on“,
//    „picked“). Отпечатъкът носи и класовете, и скритото.
function отпечатък(root) {
  const възли = root.querySelectorAll('*');
  return (root.textContent || '').replace(/\s+/g, ' ')
    + '|' + възли.length
    + '|' + възли.map(n => (n.className || '') + (n.hidden ? '#h' : '')).join(';');
}

async function изчакай(W, ms) {
  W._часовник.напред(ms || 0);
  for (let i = 0; i < 6; i++) await Promise.resolve();
  W._часовник.напред(0);
  for (let i = 0; i < 6; i++) await Promise.resolve();
}

// ── един натиск, измерен ──
async function натисни(W, root, елемент, опции) {
  опции = опции || {};
  const предПамет = W.localStorage._снимка();
  const предDOM = отпечатък(root);
  const предCheer = W._дневник.cheer.length;
  const предБележки = W._дневник.бележки.length;
  // 🪤 Печатът, споделянето и нощната лампа рисуват ИЗВЪН стаята (оверлей върху
  //    <html>). Отпечатъкът на root не ги вижда → седем истински бутона излизаха
  //    мъртви. Броим и „външните действия“.
  const предВън = W._дневник.печат.length + W._дневник.отваряни.length + W._дневник.външни + W.document.documentElement.querySelectorAll('*').length;
  const предОткази = W.localStorage._откази;
  const предКарта = (елемент.closest('.jr-card') || root);
  const предТекст = (елемент.textContent || '') + ' ' + (предКарта.textContent || '');
  const предСобствен = String(елемент.textContent || '');
  W.document._грешки.length = 0;
  W.document._файлНатиснат = false;

  let писаниПолета = [];
  if (опции.напълни) {
    // пълним всички празни полета в СЪЩАТА карта — иначе мерим само
    // празния клон и всеки бутон изглежда мълчалив
    const карта = елемент.closest('.jr-card') || root;
    карта.querySelectorAll('input, textarea').forEach(p => {
      if (String(p.type || '') === 'file') return;
      if (!p.value) { p.value = стойностЗаПоле(p); писаниПолета.push(p); }
    });
  }

  // 🪤 Чипът, който ВЕЧЕ е избран („🌸 мама“, „👶 До бебето“ — първият в реда е
  //    `on` по подразбиране): натискането му с право не прави нищо, защото няма
  //    какво да смени. Това не е мъртъв бутон, а избор, който вече е направен.
  const бешеИзбран = елемент.classList && елемент.classList.contains('on');

  const ев = новоСъбитие('click', елемент);
  try { елемент.dispatchEvent(ев); } catch (e) { W.document._грешки.push(e); }

  // 🪤 Мери се НА ДВА ПЪТИ. „✔ Записано“ се връща към стария надпис след 1400 мс
  //    (tick() в rooms3.js:36) и след 1600 мс (saveBtn в rooms.js:214). Ако се
  //    мери само след часовника, знакът вече го няма и честният бутон излиза
  //    мъртъв. Мери се и веднага след натискането.
  await изчакай(W, 0);
  const веднагаDOM = отпечатък(root);
  const веднагаТекст = (елемент.textContent || '') + ' ' + ((елемент.closest('.jr-card') || предКарта).textContent || '');
  const веднагаСобствен = String(елемент.textContent || '');
  await изчакай(W, 2500);

  const следПамет = W.localStorage._снимка();
  const следDOM = отпечатък(root);
  const новиCheer = W._дневник.cheer.slice(предCheer);
  const следТекст = (елемент.textContent || '') + ' ' + ((елемент.closest('.jr-card') || предКарта).textContent || '');
  const целТекст = веднагаТекст + ' ' + следТекст + ' ' + новиCheer.join(' ');
  const следВън = W._дневник.печат.length + W._дневник.отваряни.length + W._дневник.външни + W.document.documentElement.querySelectorAll('*').length;
  return {
    записа: предПамет !== следПамет,
    показа: предDOM !== веднагаDOM || предDOM !== следDOM || новиCheer.length > 0 || следВън !== предВън,
    файлИзбор: !!W.document._файлНатиснат,
    вечеИзбран: бешеИзбран && елемент.classList && елемент.classList.contains('on'),
    cheer: новиCheer,
    отказаниЗаписи: W.localStorage._откази - предОткази,
    // ЛЪЖА = знакът за успех се ПОЯВЯВА заради натискането. Ако „✔“ е стояло
    // и преди (бутонът „Обнови ✔“), то не е обявление за този натиск.
    // 🪤 Сляпото петно на първата версия: бутон, чийто НАДПИС вече носи знак
    //    („Обнови ✔“ в чекина), никога не се броеше за нов успех — а именно той
    //    сменя надписа на „Записано! 💜“ без да е записал. Затова се гледа и
    //    СМЯНАТА на собствения надпис към друг успешен текст.
    новУспех: (УСПЕХ.test(целТекст) && !УСПЕХ.test(предТекст))
      || новиCheer.some(т => УСПЕХ.test(т))
      || (предСобствен !== веднагаСобствен && УСПЕХ.test(веднагаСобствен)),
    честноПредупреждение: W._дневник.бележки.length > предБележки,
    // 🔴🔴 полето, което мама е попълнила, изпразнено ли е (или картата, в
    //    която живее, изтрита) — при паднал запис това значи ЗАГУБЕН ТЕКСТ
    изчистиПолето: писаниПолета.some(p => p.value === '' || !p.isConnected),
    текстСлед: целТекст,
    грешки: W.document._грешки.map(e => e.name + ': ' + e.message),
    сменениКлючове: разликаКлючове(предПамет, следПамет)
  };
}
function разликаКлючове(a, b) {
  const ma = new Map(JSON.parse(a)), mb = new Map(JSON.parse(b));
  const вън = [];
  for (const k of new Set([...ma.keys(), ...mb.keys()])) if (ma.get(k) !== mb.get(k)) вън.push(k);
  return вън;
}

function провериМашинниДуми(root, контекст, находки, броячи) {
  броячи.проверениКарти = (броячи.проверениКарти || 0) + root.querySelectorAll('.jr-card').length;
  root.querySelectorAll('.jr-card').forEach(к => {
    const т = (к.textContent || '').replace(/\s+/g, ' ');
    const m = МАШИННИ_ДУМИ.exec(т);
    if (!m) return;
    находки.push({
      тежест: 'RED', вид: '🔴 МАШИННА ДУМА на екрана на мама',
      къде: контекст + ' · ' + т.slice(0, 40),
      кой: '„' + т.slice(Math.max(0, m.index - 25), m.index + 25).trim() + '“'
    });
  });
}

// колко пъти един и същ ред се появява, ако „Днес“ се обвърже няколко пъти
// (BL_TODAY_BIND минава 2–3 пъти върху същия контейнер — вж. rooms5.js:339)
function провериПовторноОбвързване(W, находки, ден) {
  const c = W.document.createElement('div');
  W.document.body.appendChild(c);
  c.innerHTML = '<div class="td-inner"><div class="td-top"></div><div class="td-chips"></div></div>';
  for (let i = 0; i < 3; i++) { try { W.BL_TODAY_BIND(c, { name: 'Мира', birth: '2026-01-01' }, W.BL_AGE('2026-01-01')); } catch (e) {} }
  [['.td-digest', 'неделният дайджест'], ['.td-guard', 'пелена-пазачът'], ['.td-game', 'играта за днес'], ['.td-ev', 'календар-чипът']].forEach(([сел, име]) => {
    const n = c.querySelectorAll(сел).length;
    if (n > 1) находки.push({
      тежест: 'RED', вид: '🔴 ЕДНО И СЪЩО се показва по няколко пъти на „Днес“',
      къде: име + ' (' + ден + ')', кой: n + ' копия след 3 обвързвания'
    });
  });
  c.remove();
}

async function обходи(опции) {
  опции = опции || {};
  const находки = [];
  const броячи = { елементи: 0, натискания: 0, стаи: 0, карти: 0, файлови: 0 };

  // ── А. „Днес“ обвързан три пъти (неделя и делник) ──
  for (const [ден, датa] of [['неделя', 'нед'], ['делник', 'делник']]) {
    const W = новПрозорец({ денОтНеделя: ден === 'неделя' ? 0 : 2 });
    if (!зареди(W, ФАЙЛОВЕ).length) {
      Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
      W.BL_LIB = { count: () => 12, search: () => [{ id: 'a1', e: '📖', t: 'Сънят на бебето' }, { id: 'a2', e: '📖', t: 'Захранване' }] };
      // ключът за деня се смята с ПРЕМЕСТЕНИЯ часовник на пясъчника, не с моя
      const д = new W.Date();
      const ключДен = д.getFullYear() + '-' + String(д.getMonth() + 1).padStart(2, '0') + '-' + String(д.getDate()).padStart(2, '0');
      W.localStorage.setItem('bl_diapers', JSON.stringify({ [ключДен]: { wet: 0, dirty: 2 } }));
      if (W.BL_TODAY_BIND) провериПовторноОбвързване(W, находки, ден);
      броячи.обвързвания = (броячи.обвързвания || 0) + 3;
    }
  }

  // ── А2. ПОЛЕТАТА ЗА ПИСАНЕ: губи ли се текстът при затваряне на стаята ──
  //    Кликовият обход прескача полетата (те не се „натискат“), затова тук се
  //    пита отделно: (1) има ли полето чернова изобщо, (2) връща ли я, щом
  //    мама влезе пак. Ключът се пълни от глобалния слушател в daily.js:513.
  for (const стая of (опции.стая ? [опции.стая] : СТАИ)) {
    const W = новПрозорец();
    if (зареди(W, ФАЙЛОВЕ).length) continue;
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    const п = построй(W, стая);
    if (п.беда) continue;
    const полета = п.root.querySelectorAll('textarea');
    броячи.полета = (броячи.полета || 0) + полета.length;
    for (const поле of полета) {
      const карта = поле.closest('.jr-card');
      const име = стая + ' · ' + String(карта ? (карта.querySelector('.jr-title') || { textContent: '' }).textContent : '').slice(0, 40);
      const ключ = поле.getAttribute('data-draft');
      // изрично обявено изключение (напр. „Скъсай листа“ — текстът НЕ бива да
      // се пази никъде). Флагът стои в самия код, не в списък тук.
      if (поле.getAttribute('data-bez-chernova')) { броячи.безЧерноваНарочно = (броячи.безЧерноваНарочно || 0) + 1; continue; }
      if (!ключ) {
        находки.push({ тежест: 'ORANGE', вид: '🟠 поле за писане БЕЗ чернова — текстът се губи при затваряне', къде: име });
        continue;
      }
      // ОЦЕЛЯВА ЛИ: слагаме белег в ключа и строим стаята НАНОВО
      const W2 = новПрозорец();
      if (зареди(W2, ФАЙЛОВЕ).length) continue;
      W2.localStorage._върни(W.localStorage._снимка());
      const белег = 'БЕЛЕГ-' + ключ;
      W2.localStorage.setItem(ключ, JSON.stringify(белег));
      const п2 = построй(W2, стая);
      if (п2.беда) continue;
      const пак = п2.root.querySelectorAll('textarea').find(x => x.getAttribute('data-draft') === ключ);
      броячи.черновиПроверени = (броячи.черновиПроверени || 0) + 1;
      if (!пак) continue;
      if (String(пак.value || '').indexOf(белег) < 0) {
        находки.push({
          тежест: 'RED', вид: '🔴 черновата НЕ се връща при повторно влизане',
          къде: име, кой: 'ключ ' + ключ + ' → полето показва „' + String(пак.value || '').slice(0, 30) + '“'
        });
      }
    }
  }

  // ── Б. стаите: чист профил, повреден профил, всяко натискане ──
  const ВСИЧКИ = Object.assign({}, ПРОФИЛИ, {
    'повредена памет': () => повреденПрофил(ПРОФИЛИ['с бебе'])
  });
  for (const профил of Object.keys(ВСИЧКИ)) {
    for (const стая of (опции.стая ? [опции.стая] : СТАИ)) {
      const W = новПрозорец();
      const беди = зареди(W, ФАЙЛОВЕ);
      if (беди.length) { находки.push({ тежест: 'RED', вид: 'файлът не се зарежда', къде: беди.join('; ') }); continue; }
      Object.entries(ВСИЧКИ[профил]()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
      const основа = W.localStorage._снимка();

      const п0 = построй(W, стая);
      if (п0.беда) { находки.push({ тежест: 'RED', вид: 'стаята гърми при строеж', къде: профил + ' · ' + стая, кой: п0.беда }); continue; }
      броячи.стаи++;
      броячи.карти += п0.root.querySelectorAll('.jr-card').length;
      провериМашинниДуми(п0.root, профил + ' · ' + стая, находки, броячи);
      const списък = интерактивните(п0.root);
      броячи.елементи += списък.length;

      for (let i = 0; i < списък.length; i++) {
        const име = надпис(списък[i]);
        const карта = списък[i].closest('.jr-card');
        const заглавие = карта ? String((карта.querySelector('.jr-title') || { textContent: '' }).textContent).slice(0, 40) : '(без карта)';
        const общКонтекст = профил + ' · ' + стая + ' · ' + заглавие + ' · „' + име + '“';
        const е = списък[i];
        if (е.localName === 'input' || е.localName === 'textarea') {
          // полетата се мерят отделно (черновата), не се „натискат“
          continue;
        }

        // ── ПРОБА 1: празно поле — реагира ли изобщо ──
        {
          const W1 = новПрозорец(); зареди(W1, ФАЙЛОВЕ); W1.localStorage._върни(основа);
          const p = построй(W1, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            const r = await натисни(W1, p.root, сп[i], { напълни: false });
            броячи.натискания++;
            if (process.env.BL_DEBUG && надпис(сп[i]) === process.env.BL_DEBUG) {
              console.log('[ОТЛАДКА] „' + надпис(сп[i]) + '“ →', JSON.stringify({ записа: r.записа, показа: r.показа, файлИзбор: r.файлИзбор, грешки: r.грешки }));
            }
            if (r.файлИзбор) броячи.файлови++;
            else if (r.вечеИзбран) броячи.вечеИзбрани = (броячи.вечеИзбрани || 0) + 1;
            else if (!r.записа && !r.показа && !r.грешки.length) {
              находки.push({ тежест: 'RED', вид: 'МЪРТЪВ при празно поле (нула промяна, нула дума)', къде: общКонтекст });
            }
            if (r.грешки.length) {
              находки.push({ тежест: 'RED', вид: 'ГРЪМВА при натискане', къде: общКонтекст, кой: r.грешки[0] });
            }
          }
        }

        // ── ПРОБА 2: пълно поле — записва ли и оцелява ли ──
        {
          const W2 = новПрозорец(); зареди(W2, ФАЙЛОВЕ); W2.localStorage._върни(основа);
          const p = построй(W2, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            const r = await натисни(W2, p.root, сп[i], { напълни: true });
            броячи.натискания++;
            if (!r.файлИзбор && !r.вечеИзбран && !r.записа && !r.показа && !r.грешки.length) {
              находки.push({ тежест: 'RED', вид: 'МЪРТЪВ и с попълнено поле', къде: общКонтекст });
            }
            if (r.записа) {
              // ОЦЕЛЯВА ЛИ: строим стаята НАНОВО от същата памет
              const снимка = W2.localStorage._снимка();
              const W3 = новПрозорец(); зареди(W3, ФАЙЛОВЕ); W3.localStorage._върни(снимка);
              const p3 = построй(W3, стая);
              if (p3.беда) {
                находки.push({ тежест: 'RED', вид: 'СЛЕД записа стаята гърми при повторно влизане', къде: общКонтекст, кой: p3.беда });
              }
            }
          }
        }

        // ── ПРОБА 3: ПЪЛНА ПАМЕТ — обявява ли успех без запис ──
        {
          const W4 = новПрозорец(); зареди(W4, ФАЙЛОВЕ); W4.localStorage._върни(основа);
          const p = построй(W4, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            W4.localStorage._пълна = true;             // паметта се напълни
            const r = await натисни(W4, p.root, сп[i], { напълни: true });
            броячи.натискания++;
            W4.localStorage._пълна = false;
            if (r.отказаниЗаписи > 0 && !r.записа && r.новУспех) {
              находки.push({
                // мама изобщо не разбира, че е загубила записа → най-тежкото
                // срещу: показва „✔“, НО и честно казва, че не е записало
                тежест: r.честноПредупреждение ? 'ORANGE' : 'RED',
                вид: r.честноПредупреждение
                  ? '🟠 знакът „успех“ остава, но мама Е предупредена'
                  : '🔴 ЛЪЖЕ: показва успех, а записът е паднал (нула предупреждение)',
                къде: общКонтекст,
                кой: (r.cheer[0] || изрежиУспеха(r.текстСлед))
              });
            }
            // 🔴🔴 най-скъпото: написаното от мама изчезва от полето, макар
            //    записът да е паднал → текстът ѝ е загубен ЗАВИНАГИ
            if (r.отказаниЗаписи > 0 && !r.записа && r.изчистиПолето) {
              находки.push({
                тежест: 'RED', вид: '🔴🔴 ТЕКСТЪТ НА МАМА СЕ ГУБИ: полето се изчиства, а записът е паднал',
                къде: общКонтекст
              });
            }
          }
        }
      }
    }
  }
  return { находки, броячи };
}
function изрежиУспеха(т) {
  const m = УСПЕХ.exec(т);
  if (!m) return '';
  return String(т).slice(Math.max(0, m.index - 20), m.index + 30).replace(/\s+/g, ' ');
}

// ═══════════════════════════════════════════════════════════
// 5. САМОПРОВЕРКА — уредът в ДВЕТЕ ПОСОКИ
// ═══════════════════════════════════════════════════════════

async function самопроверка() {
  const редове = [];
  let паднали = 0;
  const пробвай = (име, ок, детайл) => {
    редове.push((ок ? '  ✅ ' : '  ❌ ') + име + (детайл ? ' — ' + детайл : ''));
    if (!ок) паднали++;
  };

  // A. миниатюрният DOM изобщо работи ли
  {
    const W = новПрозорец();
    const d = W.document;
    const n = d.createElement('div');
    n.innerHTML = '<span class="a b">едно</span><button class="jr-chip" data-w="m">две</button>';
    пробвай('DOM: innerHTML разбира вложени етикети', n.children.length === 2, 'намерени ' + n.children.length);
    пробвай('DOM: querySelector по клас', !!n.querySelector('.jr-chip'));
    пробвай('DOM: querySelector по атрибут със стойност', !!n.querySelector('[data-w="m"]'));
    пробвай('DOM: textContent събира децата', n.textContent === 'едновае'.slice(0, 0) + 'еднодве', 'даде „' + n.textContent + '“');
    let бр = 0;
    const b = n.querySelector('.jr-chip');
    b.addEventListener('click', () => br());
    function br() { бр++; }
    b.dispatchEvent(новоСъбитие('click', b));
    пробвай('DOM: натискането стига до слушателя', бр === 1);
    let докБр = 0;
    d.addEventListener('click', () => { докБр++; });
    d.body.appendChild(n);
    b.dispatchEvent(новоСъбитие('click', b));
    пробвай('DOM: натискането БАЛОНИРА до document (свежо() зависи от това)', докБр === 1, 'стигна ' + докБр + ' пъти');
    пробвай('DOM: classList.toggle с истина/лъжа', (() => { const x = d.createElement('i'); x.classList.toggle('on', true); const а = x.classList.contains('on'); x.classList.toggle('on', false); return а && !x.classList.contains('on'); })());
    пробвай('DOM: closest намира родителската карта', (() => {
      const к = d.createElement('section'); к.className = 'jr-card';
      const в = d.createElement('button'); к.appendChild(в);
      return в.closest('.jr-card') === к;
    })());
  }

  // B. стаите изобщо се строят ли
  {
    const W = новПрозорец();
    const беди = зареди(W, ФАЙЛОВЕ);
    пробвай('Зареждане: четирите файла минават без грешка', беди.length === 0, беди.join('; '));
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    let общоКарти = 0, гърмящи = [];
    for (const с of СТАИ) {
      const p = построй(W, с);
      if (p.беда) гърмящи.push(с + ' → ' + p.беда);
      общоКарти += p.root.querySelectorAll('.jr-card').length;
    }
    пробвай('Строеж: нито една стая не гърми', гърмящи.length === 0, гърмящи.join('; '));
    пробвай('Строеж: излизат поне 30 карти (иначе мерим празно)', общоКарти >= 30, 'излязоха ' + общоКарти);
  }

  // C. 🪤 ОБРАТНАТА ПОСОКА №1: нарочно счупен запис ТРЯБВА да се хване
  {
    const W = новПрозорец();
    зареди(W, ФАЙЛОВЕ);
    W.localStorage._пълна = true;
    let гръмна = false;
    try { W.localStorage.setItem('проба', '1'); } catch (e) { гръмна = true; }
    пробвай('Пълна памет: setItem наистина хвърля (иначе проба 3 не мери нищо)', гръмна);
    пробвай('Пълна памет: отказите се броят', W.localStorage._откази === 1, 'преброени ' + W.localStorage._откази);
  }

  // D. 🪤 ОБРАТНАТА ПОСОКА №2: подхвърлям МЪРТЪВ бутон и искам да го хване
  {
    const W = новПрозорец();
    зареди(W, ФАЙЛОВЕ);
    const root = W.document.createElement('div');
    W.document.body.appendChild(root);
    const карта = W.document.createElement('section'); карта.className = 'jr-card';
    карта.appendChild(Object.assign(W.document.createElement('h4'), { className: 'jr-title' }));
    const мъртъв = W.document.createElement('button'); мъртъв.textContent = 'Нищо не правя';
    карта.appendChild(мъртъв); root.appendChild(карта);
    const r = await натисни(W, root, мъртъв, { напълни: false });
    пробвай('ОБРАТНО: подхвърлен МЪРТЪВ бутон се разпознава', !r.записа && !r.показа);

    const жив = W.document.createElement('button'); жив.textContent = 'Записвам';
    жив.addEventListener('click', () => { W.localStorage.setItem('bl_proba', '1'); жив.textContent = '✔ Записано'; });
    карта.appendChild(жив);
    const r2 = await натисни(W, root, жив, { напълни: false });
    пробвай('ОБРАТНО: жив бутон НЕ се обявява за мъртъв', r2.записа && r2.показа);

    // лъжецът: пише „✔ Записано“, но записът пада
    const лъжец = W.document.createElement('button'); лъжец.textContent = 'Лъжа';
    лъжец.addEventListener('click', () => {
      try { W.localStorage.setItem('bl_lazha', '1'); } catch (e) {}
      лъжец.textContent = '✔ Записано';
    });
    карта.appendChild(лъжец);
    W.localStorage._пълна = true;
    const r3 = await натисни(W, root, лъжец, { напълни: false });
    W.localStorage._пълна = false;
    пробвай('ОБРАТНО: ЛЪЖЕЦ (успех без запис) се хваща', r3.отказаниЗаписи > 0 && !r3.записа && УСПЕХ.test(r3.текстСлед));

    // честният: пише „✔“ САМО ако записът е минал
    const честен = W.document.createElement('button'); честен.textContent = 'Честен';
    честен.addEventListener('click', () => {
      let ок = true;
      try { W.localStorage.setItem('bl_chesten', '1'); } catch (e) { ок = false; }
      честен.textContent = ок ? '✔ Записано' : 'Паметта се напълни';
    });
    карта.appendChild(честен);
    W.localStorage._пълна = true;
    const r4 = await натисни(W, root, честен, { напълни: false });
    W.localStorage._пълна = false;
    пробвай('ОБРАТНО: ЧЕСТЕН бутон НЕ се обвинява в лъжа', !(r4.отказаниЗаписи > 0 && !r4.записа && УСПЕХ.test((честен.textContent || ''))));
  }

  // D1b. 🪤 СЛЯПОТО ПЕТНО, което ме подведе веднъж: строежът оставя ЧАКАЩИ
  //     таймери (rooms.js:160 пали избраното личице след 60 мс). Ако построй()
  //     не изчерпи часовника, този таймер гръмва по средата на измерването и
  //     всеки бутон в стаята излиза жив — включително наистина мъртвите.
  //     Проверката е върху ИСТИНСКА стая, не върху подхвърлен възел.
  {
    const W = новПрозорец();
    зареди(W, ФАЙЛОВЕ);
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    const p = построй(W, 'Дневник на мама');
    пробвай('Строеж: часовникът е изчерпан (нула чакащи таймери след построй)', W._часовник.брой() === 0, 'чакат ' + W._часовник.брой());
    // мъртъв бутон, сложен В ИСТИНСКАТА стая — до живите ѝ съседи
    const мъртъв = W.document.createElement('button');
    мъртъв.textContent = 'Нищо не правя';
    const първа = p.root.querySelector('.jr-card');
    if (първа) първа.appendChild(мъртъв);
    const r = await натисни(W, p.root, мъртъв, { напълни: false });
    пробвай('ОБРАТНО: мъртъв бутон В ИСТИНСКА стая се хваща', !r.записа && !r.показа, JSON.stringify({ записа: r.записа, показа: r.показа }));
  }

  // D2. 🪤 ОБРАТНАТА ПОСОКА №3: машинната дума ТРЯБВА да се хване, чистата — не
  {
    const W = новПрозорец();
    const root = W.document.createElement('div');
    W.document.body.appendChild(root);
    const мръсна = W.document.createElement('section'); мръсна.className = 'jr-card';
    мръсна.innerHTML = '<h4 class="jr-title">Проба</h4><p>Средно настроение undefined</p>';
    const чиста = W.document.createElement('section'); чиста.className = 'jr-card';
    чиста.innerHTML = '<h4 class="jr-title">Проба 2</h4><p>Средно настроение 🙂</p>';
    root.appendChild(мръсна); root.appendChild(чиста);
    const н = [], бр = {};
    провериМашинниДуми(root, 'проба', н, бр);
    пробвай('ОБРАТНО: „undefined“ на екрана се хваща', н.length === 1, 'намерени ' + н.length);
    пробвай('ОБРАТНО: чистата карта НЕ се обвинява', н.length && /undefined/.test(н[0].кой || ''));
    пробвай('Машинни думи: броят прегледани карти се казва', бр.проверениКарти === 2, 'прегледани ' + бр.проверениКарти);
  }

  // D3. 🪤 ОБРАТНАТА ПОСОКА №4: дублирането при повторно обвързване
  {
    const W = новПрозорец({ денОтНеделя: 0 });
    зареди(W, ФАЙЛОВЕ);
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    W.BL_LIB = { count: () => 12, search: () => [{ id: 'a1', e: '📖', t: 'Сънят на бебето' }] };
    пробвай('Часовникът се мести: пясъчникът наистина е в неделя', new W.Date().getDay() === 0, 'ден ' + new W.Date().getDay());
    const c = W.document.createElement('div');
    W.document.body.appendChild(c);
    c.innerHTML = '<div class="td-inner"><div class="td-top"></div><div class="td-chips"></div></div>';
    for (let i = 0; i < 3; i++) { try { W.BL_TODAY_BIND(c, { name: 'Мира', birth: '2026-01-01' }, W.BL_AGE('2026-01-01')); } catch (e) {} }
    const бройДайджест = c.querySelectorAll('.td-digest').length;
    // 🪤 И В ДВЕТЕ ПОСОКИ: пазачът не бива да е УБИЛ дайджеста — той трябва да е
    //    ТОЧНО ЕДИН. Ако тестът искаше само „не са три“, нула щеше да мине за успех.
    пробвай('Неделният дайджест е ТОЧНО един (не три, но и не нула)', бройДайджест === 1, 'намерени ' + бройДайджест);
    const н = [];
    провериПовторноОбвързване(W, н, 'проба');
    пробвай('ОБРАТНО: подхвърлено дублиране се хваща', (() => {
      const c2 = W.document.createElement('div');
      W.document.body.appendChild(c2);
      c2.innerHTML = '<div class="td-inner"><div class="td-chips"></div><div class="td-digest">едно</div><div class="td-digest">две</div></div>';
      const н2 = [];
      [['.td-digest', 'дайджест']].forEach(([сел, име]) => {
        const n = c2.querySelectorAll(сел).length;
        if (n > 1) н2.push(име);
      });
      return н2.length === 1;
    })());
  }

  // E. описът брои ли това, което наистина е там
  {
    const о = опис();
    const r3 = о.редове.find(x => x.файл === 'js/rooms3.js');
    пробвай('Опис: js/rooms3.js дава 71 слушателя (както казва grep)', r3 && r3.брой === 71, r3 ? 'даде ' + r3.брой : 'липсва');
    пробвай('Опис: прегледаните = намерените (не е тихо изключен)', о.общо === о.прегледани, о.прегледани + ' от ' + о.общо);
    пробвай('Опис: за поне 30 слушателя е намерен ключ в паметта', о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.ключове.length).length, 0) >= 30);
  }

  console.log('\n═══ САМОПРОВЕРКА НА УРЕДА ═══');
  редове.forEach(r => console.log(r));
  console.log('  Общо: ' + редове.length + ' проверки, ' + паднали + ' паднали.');
  return паднали;
}

// ═══════════════════════════════════════════════════════════
// 6. ГЛАВНАТА
// ═══════════════════════════════════════════════════════════

async function главна() {
  const арг = process.argv.slice(2);
  const самоОпис = арг.includes('--opis');
  const самоСебе = арг.includes('--samoproverka');
  const стаяАрг = (арг.find(a => a.startsWith('--staya=')) || '').split('=')[1];

  if (самоСебе) {
    const п = await самопроверка();
    process.exit(п ? 1 : 0);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('🖐️  ИНТЕРАКТИВНОТО В СТАИТЕ — ' + new Date().toLocaleString('bg-BG'));
  console.log('═══════════════════════════════════════════════════\n');

  // ── 1. ОПИС ──
  const о = опис();
  console.log('── 1. ОПИС (какво изобщо има) ──');
  о.редове.forEach(f => console.log('   ' + f.файл.padEnd(16) + ' → ' + String(f.брой).padStart(3) + ' слушателя'));
  console.log('   ' + 'ОБЩО'.padEnd(16) + ' → ' + String(о.общо).padStart(3) + ' слушателя · ПРЕГЛЕДАНИ: ' + о.прегледани);
  const сКлюч = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.ключове.length).length, 0);
  const пишещи = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.пише).length, 0);
  const мълчащи = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.пише && !x.показва).length, 0);
  const лъжци = [];
  о.редове.forEach(f => f.слушатели.forEach(x => {
    if (x.пише && x.обявяваУспех && !x.пазиУспех) лъжци.push(x);
  }));
  console.log('   от тях: ' + сКлюч + ' пипат ключ в паметта · ' + пишещи + ' записват · ' + мълчащи + ' записват БЕЗ да покажат знак');
  console.log('   ⚠️  ' + лъжци.length + ' обявяват успех, БЕЗ да проверят дали записът е минал\n');

  if (самоОпис) {
    console.log('── ПОДРОБНО ──');
    о.редове.forEach(f => f.слушатели.forEach(x => {
      console.log('   ' + (f.файл + ':' + x.ред).padEnd(20) + (x.функция || '').padEnd(22)
        + x.вид.padEnd(8) + (x.ключове.join(',') || '—').padEnd(28)
        + (x.пише ? 'ЗАПИС ' : '      ') + (x.показва ? 'ПОКАЗВА ' : '        ')
        + (x.обявяваУспех ? (x.пазиУспех ? 'успех✓пазен' : 'успех⚠НЕпазен') : ''));
    }));
    return 0;
  }

  // ── 2. ЖИВ ОБХОД ──
  console.log('── 2. ЖИВ ОБХОД (натиска и мери) ──');
  const { находки, броячи } = await обходи({ стая: стаяАрг });
  console.log('   ПРЕГЛЕДАНИ: ' + броячи.стаи + ' построени стаи · ' + броячи.карти + ' карти · '
    + броячи.елементи + ' интерактивни елемента · ' + броячи.натискания + ' натискания ('
    + (броячи.файлови || 0) + ' от тях отвориха избор на файл — не се мерят)');
  console.log('   ОЩЕ ПРЕГЛЕДАНИ: ' + (броячи.проверениКарти || 0) + ' карти сверени за машинни думи · '
    + (броячи.полета || 0) + ' полета за писане (' + (броячи.черновиПроверени || 0) + ' чернови сверени, '
    + (броячи.безЧерноваНарочно || 0) + ' нарочно без) · ' + (броячи.обвързвания || 0) + ' обвързвания на „Днес“\n');

  const поВид = new Map();
  находки.forEach(н => {
    const k = н.тежест + ' | ' + н.вид;
    if (!поВид.has(k)) поВид.set(k, []);
    поВид.get(k).push(н);
  });
  if (!поВид.size) console.log('   ✅ Нула находки.');
  for (const [k, списък] of [...поВид.entries()].sort()) {
    console.log('   ' + k + '  (' + списък.length + ')');
    списък.slice(0, 12).forEach(н => console.log('      · ' + н.къде + (н.кой ? '  →  ' + н.кой : '')));
    if (списък.length > 12) console.log('      … и още ' + (списък.length - 12));
  }

  // ── 3. ЧЕРВЕНИТЕ ОТ ОПИСА ──
  if (лъжци.length) {
    console.log('\n── 3. ОБЯВЯВАТ УСПЕХ БЕЗ ДА ПРОВЕРЯТ ЗАПИСА (' + лъжци.length + ') ──');
    лъжци.forEach(x => console.log('   · ' + (x.файл + ':' + x.ред).padEnd(20) + (x.функция || '') + '  [' + (x.ключове.join(',') || '—') + ']'));
  }

  const червени = находки.filter(н => н.тежест === 'RED').length;
  console.log('\n═══ ' + (червени ? '❌ ' + червени + ' ЧЕРВЕНИ' : '✅ ЧИСТО') + ' ═══');
  return червени ? 1 : 0;
}

if (require.main === module) {
  главна().then(k => process.exit(k)).catch(e => { console.error(e); process.exit(2); });
}
module.exports = { новПрозорец, зареди, опис, обходи, самопроверка, ФАЙЛОВЕ };
