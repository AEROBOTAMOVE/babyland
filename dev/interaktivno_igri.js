// ═══════════════════════════════════════════════════════════
// 🎮 ИНТЕРАКТИВНОТО В ИГРИТЕ, ЛАБОРАТОРИЯТА И НАЧАЛНИЯ ЕКРАН
//
// Пускане:  node dev/interaktivno_igri.js
//           node dev/interaktivno_igri.js --samoproverka
//
// ЗАЩО СЪЩЕСТВУВА
//   Никой не се оплаква от игра, която не тръгва — просто я затваря. Затова
//   тук не се ЧЕТЕ код: тук се НАТИСКА. Файлът носи собствен мъничък DOM
//   (~300 реда), зарежда истинските js/lab.js, js/games2.js и js/extras.js,
//   построява картите им и натиска ВСЕКИ бутон, като мери четири неща:
//       РЕАГИРА · ЗАПИСВА · ПОКАЗВА РЕЗУЛТАТ · НЕ ЛЪЖЕ
//   и после ПРЕЗАРЕЖДА стаята, за да види оцелява ли записаното.
//
// 🔢 ВИНАГИ КАЗВА КОЛКО Е ПРЕГЛЕДАЛ.
//   „0 находки" без брой прегледани значи „0 прегледани". Всеки раздел на
//   доклада почва с бройката и всяка бройка има име зад себе си.
//
// ⚖️ ИЗПИТАН В ДВЕТЕ ПОСОКИ (--samoproverka)
//   Уред, който не може да гръмне, не мери. Самопроверката строи четири
//   изкуствени бутона — жив, пишещ, мълчалив и лъжец („undefined") — и
//   пада, ако обходчикът не различи и четирите. Пада и ако обяви безобиден
//   бутон за лъжец.
//
// 🪤 КАПАНИТЕ, ПЛАТЕНИ ТУК
//   · Скрит раздел НЕ пуска requestAnimationFrame → тук rAF е setTimeout(0).
//   · Кирилица + `\b` намира НУЛА и мълчи → никъде няма `\b`.
//   · CRLF: четенето реже `\r` изрично.
//   · vm.createContext върху обект, който Е сам себе си като window.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта и пише в СВОЙ фалшив localStorage.
//   Нищо в js/, css/ или lib/ не се пипа. Изтриваш файла — нищо не се губи.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const МОИТЕ = ['js/lab.js', 'js/games2.js', 'js/extras.js', 'js/hero.js', 'js/polish.js', 'js/home.js'];

function чети(п) { return fs.readFileSync(path.join(КОРЕН, п), 'utf8').replace(/\r\n/g, '\n'); }

// ═══════════════════════════════════════════════════════════
// 1. МЪНИЧЪК DOM — колкото картите да се построят и да се натиснат
// ═══════════════════════════════════════════════════════════
function направиDOM() {
  const ХАРТИЯ = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
  const развържи = s => String(s).replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => ХАРТИЯ[m]);

  class Текст {
    constructor(t) { this.nodeType = 3; this.textContent = String(t); this.parentNode = null; }
    get outerHTML() { return this.textContent; }
  }

  class Възел {
    constructor(tag) {
      this.nodeType = 1;
      this.tagName = String(tag).toUpperCase();
      this.childNodes = [];
      this.parentNode = null;
      this.attributes = {};
      this.dataset = {};
      this.style = new Proxy({ cssText: '', setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } }, {});
      this._слуш = {};
      this.hidden = false;
      this.disabled = false;
      this.value = '';
      this.className = '';
    }
    // ── деца ──
    get children() { return this.childNodes.filter(n => n.nodeType === 1); }
    get firstChild() { return this.childNodes[0] || null; }
    get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n._еДокумент === true; }
    get offsetParent() { return this.hidden ? null : (this.parentNode || null); }
    get offsetWidth() { return 100; }
    get offsetHeight() { return 20; }
    get offsetLeft() { return 0; }
    get offsetTop() { return 0; }
    get scrollTop() { return 0; }
    set scrollTop(v) { }
    get scrollWidth() { return 200; }
    get clientWidth() { return 200; }
    get clientHeight() { return 200; }
    appendChild(n) { if (!n) return n; if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; this.childNodes.push(n); return n; }
    append(...ns) { ns.forEach(n => this.appendChild(n)); }
    insertBefore(n, до) {
      if (!n) return n;
      if (n.parentNode) n.parentNode.removeChild(n);
      const i = до ? this.childNodes.indexOf(до) : -1;
      n.parentNode = this;
      if (i < 0) this.childNodes.push(n); else this.childNodes.splice(i, 0, n);
      return n;
    }
    after(n) { if (this.parentNode) this.parentNode.insertBefore(n, this.childNodes ? this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) + 1] : null); }
    removeChild(n) { const i = this.childNodes.indexOf(n); if (i >= 0) { this.childNodes.splice(i, 1); n.parentNode = null; } return n; }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
    replaceWith(n) { if (this.parentNode) { this.parentNode.insertBefore(n, this); this.parentNode.removeChild(this); } }
    contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
    // ── текст и разметка ──
    get textContent() { return this.childNodes.map(n => n.nodeType === 3 ? n.textContent : n.textContent).join(''); }
    set textContent(v) { this.childNodes = []; if (v !== '' && v != null) this.appendChild(new Текст(v)); }
    get innerText() { return this.textContent; }
    get innerHTML() { return this.childNodes.map(n => n.nodeType === 3 ? n.textContent : n.outerHTML).join(''); }
    set innerHTML(h) { this.childNodes = []; разбор(String(h == null ? '' : h), this); }
    get outerHTML() {
      const а = Object.keys(this.attributes).map(k => ' ' + k + '="' + this.attributes[k] + '"').join('');
      const кл = this.className ? ' class="' + this.className + '"' : '';
      return '<' + this.tagName.toLowerCase() + кл + а + '>' + this.innerHTML + '</' + this.tagName.toLowerCase() + '>';
    }
    // ── атрибути ──
    setAttribute(k, v) {
      v = String(v);
      if (k === 'class') { this.className = v; return; }
      if (k === 'id') { this.id = v; }
      if (k === 'hidden') { this.hidden = true; }
      this.attributes[k] = v;
      if (k.indexOf('data-') === 0) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
    }
    getAttribute(k) { if (k === 'class') return this.className; if (k === 'id') return this.id || null; return k in this.attributes ? this.attributes[k] : null; }
    removeAttribute(k) { delete this.attributes[k]; }
    hasAttribute(k) { return k in this.attributes; }
    // ── класове ──
    get classList() {
      const мен = this;
      const списък = () => (мен.className || '').split(/\s+/).filter(Boolean);
      return {
        add(...c) { const s = списък(); c.forEach(x => { if (x && s.indexOf(x) < 0) s.push(x); }); мен.className = s.join(' '); },
        remove(...c) { мен.className = списък().filter(x => c.indexOf(x) < 0).join(' '); },
        toggle(c, сила) { const има = списък().indexOf(c) >= 0; const нов = сила === undefined ? !има : !!сила; if (нов) this.add(c); else this.remove(c); return нов; },
        contains(c) { return списък().indexOf(c) >= 0; }
      };
    }
    // ── търсене ──
    matches(сел) { return съвпада(this, сел); }
    closest(сел) { let n = this; while (n && n.nodeType === 1) { if (съвпада(n, сел)) return n; n = n.parentNode; } return null; }
    querySelector(сел) { return this.querySelectorAll(сел)[0] || null; }
    querySelectorAll(сел) { return намери(this, сел); }
    // ── събития ──
    addEventListener(вид, ф) { (this._слуш[вид] || (this._слуш[вид] = [])).push(ф); }
    removeEventListener(вид, ф) { const a = this._слуш[вид]; if (a) { const i = a.indexOf(ф); if (i >= 0) a.splice(i, 1); } }
    dispatchEvent(съб) {
      съб.target = съб.target || this;
      let n = this;
      while (n) {
        const a = n._слуш && n._слуш[съб.вид || съб.type];
        if (a) a.slice().forEach(ф => ф.call(n, съб));
        const пр = n['on' + (съб.вид || съб.type)];
        if (typeof пр === 'function') пр.call(n, съб);
        if (съб._спрян) break;
        n = n.parentNode;
      }
      return true;
    }
    click() { this.dispatchEvent(ново('click', this)); }
    focus() { док.activeElement = this; }
    blur() { }
    select() { }
    setSelectionRange() { }
    scrollIntoView() { }
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 20, width: 100, height: 20, x: 0, y: 0 }; }
    insertAdjacentHTML() { }
  }

  function ново(вид, цел) {
    return {
      type: вид, вид, target: цел, currentTarget: цел, _спрян: false,
      preventDefault() { }, stopPropagation() { this._спрян = true; }, stopImmediatePropagation() { this._спрян = true; },
      key: '', bubbles: true, changedTouches: [], touches: []
    };
  }

  // ── мъничък разбор на разметка (само това, което картите наистина пишат) ──
  const САМИ = { br: 1, hr: 1, img: 1, input: 1, use: 1, source: 1, meta: 1, link: 1, circle: 1, rect: 1, path: 1, ellipse: 1, line: 1, polyline: 1, stop: 1, animatemotion: 1 };
  function разбор(h, корен) {
    const стек = [корен];
    const ТОК = /<\/?([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s">]+))?)*)\s*(\/?)>/g;
    let край = 0, m;
    while ((m = ТОК.exec(h))) {
      if (m.index > край) добавиТекст(h.slice(край, m.index));
      край = ТОК.lastIndex;
      const име = m[1].toLowerCase();
      if (m[0][1] === '/') {                                   // затваряне
        for (let i = стек.length - 1; i > 0; i--) if (стек[i].tagName.toLowerCase() === име) { стек.length = i; break; }
        continue;
      }
      const в = new Възел(име);
      разборАтрибути(m[2] || '', в);
      стек[стек.length - 1].appendChild(в);
      if (!m[3] && !САМИ[име]) стек.push(в);
    }
    if (край < h.length) добавиТекст(h.slice(край));
    function добавиТекст(t) { if (t) стек[стек.length - 1].appendChild(new Текст(развържи(t))); }
  }
  function разборАтрибути(s, в) {
    const А = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let m;
    while ((m = А.exec(s))) {
      const k = m[1]; if (!k) continue;
      const v = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
      в.setAttribute(k, развържи(v));
      if (k === 'type') в.type = развържи(v);
      if (k === 'value') в.value = развържи(v);
      if (k === 'disabled') в.disabled = true;
    }
  }

  // ── селектори: tag · .клас · #ид · [атр] · [атр="х"] · съставни · потомък ──
  function частиНаСелектор(с) {
    return с.split(',').map(x => x.trim()).filter(Boolean)
      .map(x => x.replace(/:scope\s*>?\s*/g, '').trim())
      .map(x => x.split(/\s+/).filter(y => y !== '>'));
  }
  function съвпадаПроста(в, п) {
    if (!п) return false;
    const ТОК = /([.#]?[\wЀ-ӿ-]+|\[[^\]]+\])/g;
    let m, ок = true;
    while ((m = ТОК.exec(п))) {
      const т = m[1];
      if (т[0] === '.') { if (!в.classList.contains(т.slice(1))) ок = false; }
      else if (т[0] === '#') { if ((в.id || '') !== т.slice(1)) ок = false; }
      else if (т[0] === '[') {
        const a = /^\[([^\]=~^$*|]+)(?:([~^$*|]?=)\s*"?'?([^"'\]]*)"?'?)?\]$/.exec(т);
        if (!a) { ок = false; continue; }
        const име = a[1].trim();
        const стойност = в.getAttribute(име);
        if (стойност == null) ок = false;
        else if (a[2] && стойност !== a[3]) ок = false;
      } else { if (в.tagName.toLowerCase() !== т.toLowerCase() && т !== '*') ок = false; }
    }
    return ок;
  }
  function съвпада(в, сел) {
    return частиНаСелектор(сел).some(пътека => съвпадаПроста(в, пътека[пътека.length - 1]));
  }
  function намери(корен, сел) {
    const пътеки = частиНаСелектор(сел);
    const вън = [];
    (function обходи(в) {
      в.children.forEach(д => {
        if (пътеки.some(п => пасваПътека(д, п))) вън.push(д);
        обходи(д);
      });
    })(корен);
    return вън;
    function пасваПътека(в, п) {
      let i = п.length - 1, n = в;
      if (!съвпадаПроста(n, п[i])) return false;
      i--; n = n.parentNode;
      while (i >= 0) {
        let нам = false;
        while (n && n !== корен.parentNode) { if (съвпадаПроста(n, п[i])) { нам = true; break; } n = n.parentNode; }
        if (!нам) return false;
        i--; n = n.parentNode;
      }
      return true;
    }
  }

  // ── документ ──
  const док = new Възел('#document');
  док._еДокумент = true;
  док.documentElement = new Възел('html');
  док.body = new Възел('body');
  док.head = new Възел('head');
  док.documentElement.appendChild(док.head);
  док.documentElement.appendChild(док.body);
  док.appendChild(док.documentElement);
  док.readyState = 'complete';
  док.hidden = false;
  док.activeElement = null;
  док.createElement = t => {
    const в = new Възел(t);
    if (t === 'canvas') {
      в.width = 0; в.height = 0;
      в.getContext = () => новКонтекст();
      в.toBlob = ф => ф({ size: 1000, type: 'image/png' });
    }
    return в;
  };
  док.createElementNS = (_, t) => док.createElement(t);
  док.createTextNode = t => new Текст(t);
  док.getElementById = ид => намери(док, '#' + ид)[0] || null;
  док.getElementsByClassName = к => намери(док, '.' + к);
  док._глобСлуш = {};
  док.addEventListener = function (вид, ф) { (док._глобСлуш[вид] || (док._глобСлуш[вид] = [])).push(ф); };
  док.removeEventListener = function () { };
  док.querySelector = сел => намери(док, сел)[0] || null;
  док.querySelectorAll = сел => намери(док, сел);

  // 🖼️ Картичката за Вайбър се РИСУВА, не се пише в страницата — значи
  //    „undefined" или „Invalid Date" върху нея е НЕВИДИМ за проверката на
  //    текста. Затова платното помни всяка изрисувана дума.
  док._канвасТекст = [];
  function новКонтекст() {
    const с = {
      font: '', fillStyle: '', strokeStyle: '', lineWidth: 1, textAlign: '',
      save() { }, restore() { }, translate() { }, scale() { }, beginPath() { }, moveTo() { }, lineTo() { },
      ellipse() { }, arc() { }, fill() { }, stroke() { }, fillRect() { }, roundRect() { },
      fillText(t) { док._канвасТекст.push(String(t)); }, measureText(t) { return { width: String(t).length * 20 }; },
      createLinearGradient() { return { addColorStop() { } }; },
      createRadialGradient() { return { addColorStop() { } }; }
    };
    return с;
  }

  return { док, Възел, Текст, ново, намери };
}

// ═══════════════════════════════════════════════════════════
// 2. ПЯСЪЧНИК — истинските файлове в мъничкия DOM
// ═══════════════════════════════════════════════════════════
function пясъчник(файлове, предиЗареждане) {
  const { док, ново } = направиDOM();
  const W = {};
  const памет = new Map();
  Object.assign(W, {
    console, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error, TypeError,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect, Function,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat,
    TextEncoder, TextDecoder,
    performance: { now: () => Date.now() }
  });
  // 🪤 setInterval държи процеса на Node жив ЗАВИНАГИ (звукът на сърцето в
  //    extras.js, каруселите в home.js). Тук часовниците са без референция и
  //    се броят — така обходът свършва, а броят им влиза в доклада.
  const часовници = [];
  W._часовници = часовници;
  W.setTimeout = (ф, ms) => { const h = setTimeout(ф, Math.min(ms || 0, 20)); if (h.unref) h.unref(); часовници.push(h); return h; };
  W.clearTimeout = h => clearTimeout(h);
  W.setInterval = (ф, ms) => { const h = setInterval(ф, Math.max(ms || 0, 60000)); if (h.unref) h.unref(); часовници.push(h); return h; };
  W.clearInterval = h => clearInterval(h);
  W.window = W;
  W.document = док;
  W.localStorage = {
    getItem: k => (памет.has(String(k)) ? памет.get(String(k)) : null),
    setItem: (k, v) => памет.set(String(k), String(v)),
    removeItem: k => памет.delete(String(k)),
    clear: () => памет.clear(),
    key: i => Array.from(памет.keys())[i] || null,
    get length() { return памет.size; }
  };
  W._памет = памет;
  W.requestAnimationFrame = ф => setTimeout(() => ф(Date.now()), 0);   // 🪤 скрит раздел не пуска rAF
  W.cancelAnimationFrame = clearTimeout;
  W.addEventListener = () => { };
  W.removeEventListener = () => { };
  W.matchMedia = () => ({ matches: false, addEventListener() { }, removeEventListener() { }, addListener() { } });
  W.getComputedStyle = () => ({ getPropertyValue: () => '', position: 'static' });
  W.navigator = { userAgent: 'node', language: 'bg', share: undefined, canShare: undefined, clipboard: { writeText: () => Promise.resolve() } };
  W.location = { href: 'http://localhost/', search: '', hash: '', pathname: '/' };
  W.history = { replaceState() { } };
  W.innerWidth = 390; W.innerHeight = 780; W.scrollY = 0;
  W.MutationObserver = function () { this.observe = () => { }; this.disconnect = () => { }; };
  W.IntersectionObserver = function () { this.observe = () => { }; this.disconnect = () => { }; this.unobserve = () => { }; };
  W.Event = function (t) { return ново(t, null); };
  W.Audio = function () { return { play: () => Promise.resolve(), pause() { }, currentTime: 0, loop: false, addEventListener() { } }; };
  W.speechSynthesis = { cancel() { }, speak() { }, speaking: false, pending: false, getVoices: () => [] };
  W.SpeechSynthesisUtterance = function (t) { this.text = t; };
  W.Blob = function (p, o) { this.size = 1000; this.type = (o && o.type) || ''; };
  W.File = function (p, n, o) { this.name = n; this.size = 1000; this.type = (o && o.type) || ''; };
  W.FileReader = function () { this.readAsDataURL = () => { this.result = 'data:audio/webm;base64,AAA'; if (this.onload) this.onload(); }; };
  W.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() { } };
  W.btoa = s => Buffer.from(String(s), 'binary').toString('base64');
  W.atob = s => Buffer.from(String(s), 'base64').toString('binary');
  W.crypto = globalThis.crypto;
  W.AudioContext = function () {
    const у = () => ({ connect() { }, disconnect() { }, start() { }, stop() { }, gain: { value: 0, setValueAtTime() { }, exponentialRampToValueAtTime() { } }, frequency: { value: 0, setValueAtTime() { } }, type: '', buffer: null, loop: false });
    return {
      sampleRate: 44100, currentTime: 0, destination: у(), resume() { },
      createGain: у, createBiquadFilter: у, createOscillator: у, createBufferSource: у,
      createBuffer: (a, len) => ({ getChannelData: () => new Float32Array(len) })
    };
  };
  vm.createContext(W);
  W.globalThis = W;
  if (предиЗареждане) предиЗареждане(W);
  const грешки = [];
  файлове.forEach(ф => {
    try { new vm.Script(чети(ф), { filename: ф }).runInContext(W); }
    catch (e) { грешки.push(ф + ' → ' + e.name + ': ' + e.message); }
  });
  W._грешкиПриЗареждане = грешки;
  return W;
}

// ═══════════════════════════════════════════════════════════
// 3. ОБХОДЧИКЪТ — натиска и мери
// ═══════════════════════════════════════════════════════════
const ЛЪЖИ = /undefined|\bNaN\b|\[object Object\]|Invalid Date|null,|,null|Infinity/;
const СЕЛЕКТОР = 'button, input, select, textarea, [data-a], [data-x], [data-d], [data-z]';

function снимкаПамет(W) { const o = {}; W._памет.forEach((v, k) => { o[k] = v; }); return o; }
function върниПамет(W, с) { W._памет.clear(); Object.keys(с).forEach(k => W._памет.set(k, с[k])); }
function разликаПамет(a, b) {
  const с = new Set(Object.keys(a).concat(Object.keys(b)));
  return [...с].filter(k => a[k] !== b[k]);
}
// 🪤 ПЪРВАТА МИ МЯРКА ЛЪЖЕШЕ: отпечатъкът беше „брой знаци + брой елементи".
//    „Бррр!" → „Дзън!" е същата дължина, „след 15 мин" → „след 30 мин" също —
//    и три ЖИВИ бутона излязоха „мълчаливи". Класът `on` (единствената видима
//    следа на чиповете-избор), `hidden` и `disabled` също не се брояха.
//    Сега отпечатъкът е сбор по СЪДЪРЖАНИЕ, не по дължина.
function хеш(с) { let h = 5381; for (let i = 0; i < с.length; i++) h = ((h * 33) ^ с.charCodeAt(i)) >>> 0; return h; }
function отпечатък(корен) {
  const части = [];
  (function обходи(в) {
    в.childNodes.forEach(д => {
      if (д.nodeType === 3) { части.push(д.textContent); return; }
      части.push('<' + д.tagName + '|' + (д.className || '') + '|' + (д.hidden ? 'h' : '') + (д.disabled ? 'd' : '') + '|' + (д.value || ''));
      обходи(д);
    });
  })(корен);
  const с = части.join('');
  return с.length + ':' + хеш(с);
}
const надпис = е => (е.getAttribute('aria-label') || е.textContent || е.getAttribute('placeholder') ||
  е.value || е.className || е.tagName || '').toString().trim().replace(/\s+/g, ' ').slice(0, 46) || '(без надпис)';

function натисни(W, е, корен) {
  const предП = снимкаПамет(W), предО = отпечатък(корен);
  let гръмна = null;
  try {
    const t = (е.tagName || '').toLowerCase();
    const вид = (е.type || '').toLowerCase();
    if (t === 'input' && (вид === 'number')) { е.value = '70'; е.dispatchEvent(W.Event('input')); е.dispatchEvent(W.Event('change')); }
    else if (t === 'input' && (вид === 'date')) { е.value = '2026-08-25'; е.dispatchEvent(W.Event('change')); }
    else if (t === 'input' && (вид === 'password')) { е.value = '1234'; е.dispatchEvent(W.Event('input')); }
    else if (t === 'input' || t === 'textarea') { е.value = 'проба'; е.dispatchEvent(W.Event('input')); е.dispatchEvent(W.Event('change')); }
    else if (t === 'select') { е.dispatchEvent(W.Event('change')); }
    else е.click();
  } catch (err) { гръмна = err.name + ': ' + err.message; }
  const следП = снимкаПамет(W);
  return {
    гръмна,
    записа: разликаПамет(предП, следП),
    промени: отпечатък(корен) !== предО
  };
}

function интерактивните(корен) {
  return корен.querySelectorAll(СЕЛЕКТОР).filter(е => !е.disabled);
}

// ═══════════════════════════════════════════════════════════
// 4. СЦЕНИТЕ — коя стая с кои файлове
// ═══════════════════════════════════════════════════════════
function празнаСтая(W, имена) {
  W.ROOM_FEATURES = W.ROOM_FEATURES || {};
  имена.forEach(и => { if (!W.ROOM_FEATURES[и]) W.ROOM_FEATURES[и] = () => { }; });
}

// 🏠 Черупката на стаята. Без нея lab.js:rerender() пада на първата проверка
//    (`#roRoom` липсва) и НИЩО не се пре-рисува — тогава всеки бутон, който
//    работи през rerender, изглежда „мълчалив". Тоест липсващата черупка
//    щеше да фабрикува 20 фалшиви находки.
function черупкаНаСтая(W, име) {
  const д = W.document;
  const тяло = д.createElement('div'); тяло.setAttribute('id', 'roRoom');
  const загл = д.createElement('h2'); загл.setAttribute('id', 'roTitle'); загл.textContent = име;
  const овърлей = д.createElement('div'); овърлей.setAttribute('id', 'roomOverlay'); овърлей.hidden = false;
  д.body.appendChild(овърлей); овърлей.appendChild(загл); овърлей.appendChild(тяло);
  W.MamaHelper = {
    open(р) { const с = W.ROOM_FEATURES[р]; загл.textContent = р; тяло.innerHTML = ''; if (с) с(тяло); },
    close() { }, ask() { }, showTab() { }, persona: () => ({})
  };
  return тяло;
}

const СЦЕНИ = [
  {
    име: 'Лабораторията 🔬 (js/lab.js)',
    файлове: ['js/lab.js'],
    стая: 'Лабораторията',
    подготви: W => { W._памет.set('bl_baby', JSON.stringify({ name: 'Мия', sex: 'girl', birth: '2025-09-01' })); }
  },
  {
    // опитът е на седмата вечер → рисуват се и Присъдата, и Тетрадката,
    // и Досието. Без това стаята показва само първите си две карти.
    име: 'Лабораторията 🔬 · опит на 7-та вечер + пълна тетрадка',
    файлове: ['js/lab.js'],
    стая: 'Лабораторията',
    подготви: W => {
      W._памет.set('bl_baby', JSON.stringify({ name: 'Мия', sex: 'girl', birth: '2025-09-01' }));
      const дн = д => { const t = new Date(); t.setDate(t.getDate() - д); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };
      const log = {};
      // 4 вечери „повито" (3 добри) срещу 3 вечери „непровито" (1 добра)
      [[6, 'a', 1], [5, 'a', 1], [4, 'a', 1], [3, 'a', 0], [2, 'b', 1], [1, 'b', 0], [0, 'b', 0]]
        .forEach(([д, arm, ok]) => { log[дн(д)] = { arm, ok }; });
      W._памет.set('bl_lab', JSON.stringify({
        list: [{ id: 'swaddle-1', e: '🌀', q: 'Спи ли по-добре повито?', a: 'повито', b: 'непровито', d: 7, log, started: дн(6), closed: false }],
        done: [{ q: 'Помага ли белият шум?', e: '🔊', t: 'При Мия „с бял шум" май работи.', tone: 'yes', d: дн(20), n: 7, tpl: 'noise' }]
      }));
      W._памет.set('bl_tried', JSON.stringify({ 'банан': '😋', 'грах': '⚠️' }));
    }
  },
  {
    // 🧨 Внесено копие от друга версия: няма `list`, има `null` в `done`.
    //    Стаята ТРЯБВА да се построи цяла — празна стая без нито дума е
    //    най-лошият изход, защото мама вижда, че „Лабораторията е счупена".
    име: 'Лабораторията 🧨 · крив внесен запис',
    файлове: ['js/lab.js'],
    стая: 'Лабораторията',
    подготви: W => {
      W._памет.set('bl_baby', JSON.stringify({ name: 'Мия', sex: 'girl', birth: '2025-09-01' }));
      W._памет.set('bl_lab', JSON.stringify({ done: [null, { q: 'ок', e: '🔬', t: 'Работи.', tone: 'yes', d: '2026-08-01' }] }));
    },
    очаквайКарти: 4
  },
  {
    име: 'Развитие и игри 🎈 (js/games2.js)',
    файлове: ['js/games2.js'],
    стая: 'Развитие и игри',
    предиЗареждане: W => празнаСтая(W, ['Развитие и игри']),
    // вече ИМА записан мамин глас → рисуват се „▶️ Пусни моя глас" и 🗑️,
    // тоест обходът стига и до тях. Без този ред двата бутона никога не се
    // раждат в пясъчника и „0 находки" пак е „0 прегледани".
    подготви: W => { W._памет.set('bl_lull_rec', JSON.stringify({ 'Спи, зайче, спи 🐇': 'data:audio/webm;base64,AAA' })); }
  },
  {
    име: 'Моето бебе 📏 (js/extras.js)',
    файлове: ['js/data.js', 'js/extras.js'],
    стая: 'Моето бебе',
    предиЗареждане: W => празнаСтая(W, ['Дневник на мама', 'Моето бебе', 'Здраве и SOS', 'Развитие и игри']),
    подготви: W => { W._памет.set('bl_baby', JSON.stringify({ name: 'Мия', sex: 'girl', birth: '2025-09-01' })); }
  },
  {
    име: 'Дневник на мама 🏅 (js/extras.js)',
    файлове: ['js/data.js', 'js/extras.js'],
    стая: 'Дневник на мама',
    предиЗареждане: W => празнаСтая(W, ['Дневник на мама', 'Моето бебе', 'Здраве и SOS', 'Развитие и игри'])
  },
  {
    // 🧨 КРИВИЯТ ЗАПИС: внесено резервно копие от друга версия. Стаята трябва
    //    да се построи ЦЯЛА (медальончета + споделяне + КЛЮЧАЛКАТА), а
    //    картичката за Вайбър да не носи „Invalid Date".
    име: 'Дневник на мама 🧨 · крив внесен запис',
    файлове: ['js/data.js', 'js/extras.js'],
    стая: 'Дневник на мама',
    предиЗареждане: W => празнаСтая(W, ['Дневник на мама', 'Моето бебе', 'Здраве и SOS', 'Развитие и игри']),
    подготви: W => {
      W._памет.set('bl_baby', JSON.stringify({ name: 'Мия', sex: 'girl', birth: '2025-09-01' }));
      W._памет.set('bl_custom_lists', JSON.stringify([null, { name: 'Без точки' }, { name: 'Готов', items: [{ t: 'а', done: true }, { t: 'б', done: true }, { t: 'в', done: true }] }]));
      W._памет.set('bl_firsts', JSON.stringify({ '😊 Първа усмивка': '', '🙃 Първо обръщане': '2026-01-05', '🦷 Първо зъбче': null }));
      W._памет.set('bl_pharmacy', JSON.stringify([null, { name: 'х', exp: '2020-01-01' }]));
    },
    очаквайКарти: 3
  },
  {
    име: 'Здраве и SOS 🌬️ (js/extras.js)',
    файлове: ['js/data.js', 'js/extras.js'],
    стая: 'Здраве и SOS',
    предиЗареждане: W => празнаСтая(W, ['Дневник на мама', 'Моето бебе', 'Здраве и SOS', 'Развитие и игри'])
  },
  {
    име: 'Развитие и игри 📖 (js/extras.js)',
    файлове: ['js/data.js', 'js/extras.js'],
    стая: 'Развитие и игри',
    предиЗареждане: W => празнаСтая(W, ['Дневник на мама', 'Моето бебе', 'Здраве и SOS', 'Развитие и игри'])
  }
];

function пуснСцена(сц) {
  const изход = { име: сц.име, прегледани: 0, реагират: 0, записват: 0, мълчат: 0, гърмят: 0, лъжат: 0, мълчаливи: [], гърмящи: [], лъжливи: [], бележки: [] };
  const W = пясъчник(сц.файлове, сц.предиЗареждане);
  if (W._грешкиПриЗареждане.length) { изход.бележки.push('🔴 не се зареди: ' + W._грешкиПриЗареждане.join(' | ')); return изход; }
  if (сц.подготви) сц.подготви(W);
  const строй = W.ROOM_FEATURES && W.ROOM_FEATURES[сц.стая];
  if (typeof строй !== 'function') { изход.бележки.push('🔴 ROOM_FEATURES["' + сц.стая + '"] липсва — стаята НЕ СЕ СТРОИ'); return изход; }

  const корен = черупкаНаСтая(W, сц.стая);
  try { строй(корен); } catch (e) { изход.бележки.push('🔴 строежът гръмна: ' + e.message); return изход; }

  const проверенТекст = т => ЛЪЖИ.test(т);
  if (проверенТекст(корен.textContent)) изход.лъжливи.push('ПРИ СТРОЕЖА: ' + примка(корен.textContent));

  // 🪤 ВТОРАТА МИ ЛЪЖЛИВА МЯРКА: първата версия правеше СПИСЪК и после
  //    натискаше по него. Но lab.js:rerender() сменя цялото тяло на стаята —
  //    и от второто натискане нататък списъкът сочеше ОТКАЧЕНИ елементи.
  //    Натискаш ги, слушателят им се изпълнява, но промяната им не е в
  //    страницата → уредът обявяваше 20 ЖИВИ бутона за „мълчаливи".
  //    Сега целта се търси НАНОВО преди всяко натискане и се пропуска, ако
  //    вече не е закачена за документа. Отпечатъкът на вече натиснатите е по
  //    ПОДПИС (вид·клас·надпис), защото пре-строяването ражда нови обекти за
  //    същия бутон.
  // 🪤 ТРЕТАТА МИ ЛЪЖЛИВА МЯРКА: подписът беше „вид·клас·надпис". Но чипът,
  //    щом го натиснеш, си слага клас `on` — значи СЛЕД натискането има ДРУГ
  //    подпис и уредът го натискаше ВТОРИ път. Второто натискане на вече
  //    избраната песничка не мени нищо → седем ЖИВИ чипа бяха обявени за
  //    мълчаливи. Подписът е по МЯСТО в дървото: то преживява и смяната на
  //    класа, и пре-строяването на стаята.
  const натиснати = new Set();
  const подпис = е => {
    const п = [];
    let n = е;
    while (n && n.parentNode) { п.push(n.parentNode.childNodes.indexOf(n)); n = n.parentNode; }
    return е.tagName + '@' + п.reverse().join('.');
  };
  for (let стъпка = 0; стъпка < 400; стъпка++) {
    const цели = W.document.body.querySelectorAll(СЕЛЕКТОР)
      .filter(е => !е.disabled && е.isConnected && !натиснати.has(подпис(е)));
    if (!цели.length) break;
    const е = цели[0];
    натиснати.add(подпис(е));
    const н = надпис(е);
    изход.прегледани++;
    const р = натисни(W, е, W.document.body);
    if (р.гръмна) { изход.гърмят++; изход.гърмящи.push(н + ' → ' + р.гръмна); continue; }
    if (р.записа.length) изход.записват++;
    if (р.промени || р.записа.length) изход.реагират++;
    else { изход.мълчат++; изход.мълчаливи.push(н); }
    const т = W.document.body.textContent + ' ‖ ' + W.document._канвасТекст.join(' ');
    if (проверенТекст(т)) { изход.лъжат++; изход.лъжливи.push(н + ' → ' + примка(т)); }
  }

  // ── оцелява ли презареждане: строим стаята НАНОВО върху същата памет ──
  const втори = W.document.createElement('div');
  W.document.body.appendChild(втори);
  try {
    строй(втори);
    if (проверенТекст(втори.textContent)) изход.лъжливи.push('СЛЕД ПРЕЗАРЕЖДАНЕ: ' + примка(втори.textContent));
    const карти = втори.querySelectorAll('.jr-card').length;
    изход.презареждане = 'строи се наново · ' + карти + ' карти';
    if (сц.очаквайКарти != null && карти < сц.очаквайКарти) {
      изход.бележки.push('🔴 ОЧАКВАХМЕ поне ' + сц.очаквайКарти + ' карти, а са ' + карти + ' — стаята спира по средата');
      изход.гърмят++;
    }
  } catch (e) { изход.бележки.push('🔴 ПРЕЗАРЕЖДАНЕТО ГРЪМНА: ' + e.message); изход.презареждане = 'ГРЪМНА'; }
  return изход;
}

function примка(т) {
  const m = ЛЪЖИ.exec(т);
  if (!m) return '';
  return '…' + т.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ') + '…';
}

// ═══════════════════════════════════════════════════════════
// 5. СТАТИЧНИЯТ БРОЯЧ — и за файловете, които искат цяла страница
// ═══════════════════════════════════════════════════════════
// маха коментарите, но ПАЗИ броя на редовете (иначе номерата в доклада лъжат)
//
// 🪤 ТРЕТАТА ЛЪЖА НА БРОЯЧА: първата версия на този стрипер НЕ познаваше
//    регулярните изрази. В js/extras.js:19 стои `.replace(/'/g, '&#39;')` —
//    апостроф ВЪТРЕ в регекс. Стриперът го взе за начало на низ, изяде кода
//    нататък и цял един setInterval изчезна. „0 находки" от изяден файл
//    изглежда точно като „0 находки" от чист файл.
//    ⚠️ Разликата „регекс или деление" се познава по последния значещ знак —
//    точно както го прави всеки лексер.
const ПРЕДИ_РЕГЕКС = '(,=:[!&|?{};+-*%~^<>';
const КЛЮЧОВИ_ПРЕДИ_РЕГЕКС = /(?:^|[^\wА-Яа-я$])(return|typeof|case|in|of|delete|void|do|else|yield|await|instanceof)\s*$/;
function безКоментариТекст(т) {
  let вън = '', i = 0, предишен = '';
  const n = т.length;
  // ⚠️ само последните 20 знака — иначе всяка наклонена черта преглежда целия
  //    файл отначало и уредът пълзи (квадратично време върху 1000 реда)
  const можеРегекс = () => предишен === '' || ПРЕДИ_РЕГЕКС.indexOf(предишен) >= 0 || КЛЮЧОВИ_ПРЕДИ_РЕГЕКС.test(вън.slice(-20));
  const празно = c => (c === '\n' ? '\n' : ' ');
  while (i < n) {
    const c = т[i], д = т[i + 1];
    if (c === '/' && д === '/') { while (i < n && т[i] !== '\n') { вън += ' '; i++; } continue; }
    if (c === '/' && д === '*') {
      вън += '  '; i += 2;
      while (i < n && !(т[i] === '*' && т[i + 1] === '/')) { вън += празно(т[i]); i++; }
      вън += '  '; i += 2; continue;
    }
    if (c === '/' && можеРегекс()) {                           // регулярен израз
      вън += ' '; i++;
      let вКлас = false;
      while (i < n && т[i] !== '\n') {
        if (т[i] === '\\') { вън += '  '; i += 2; continue; }
        if (т[i] === '[') вКлас = true;
        else if (т[i] === ']') вКлас = false;
        else if (т[i] === '/' && !вКлас) { вън += ' '; i++; break; }
        вън += ' '; i++;
      }
      while (i < n && /[a-z]/.test(т[i])) { вън += ' '; i++; }  // флаговете g/i/u/s
      предишен = 'x'; continue;
    }
    if (c === '"' || c === "'" || c === '`') {                 // низовете се прескачат цели
      вън += ' '; i++;
      while (i < n && т[i] !== c) { if (т[i] === '\\') { вън += '  '; i += 2; continue; } вън += празно(т[i]); i++; }
      вън += ' '; i++; предишен = 'x'; continue;
    }
    вън += c; i++;
    if (!/\s/.test(c)) предишен = c;
  }
  return вън;
}

function преброй(п) {
  const т = чети(п);
  const редове = т.split('\n');
  const бр = {
    файл: п, редове: редове.length,
    слушатели: 0, наклик: 0, бутониЕл: 0, бутониHTML: 0, полета: 0, делегирани: 0,
    празниУловки: 0, безкрайниТаймери: 0, таймериСПазач: 0, подробно: []
  };
  редове.forEach((р, i) => {
    const н = i + 1;
    const с = (р.match(/addEventListener\s*\(/g) || []).length; бр.слушатели += с;
    бр.наклик += (р.match(/\.on(click|change|input|submit)\s*=/g) || []).length;
    бр.бутониЕл += (р.match(/el\(\s*'button'/g) || []).length;
    бр.бутониHTML += (р.match(/<button/g) || []).length;
    бр.полета += (р.match(/el\(\s*'(input|textarea|select)'/g) || []).length + (р.match(/<(input|textarea|select)[\s>]/g) || []).length;
    бр.делегирани += (р.match(/data-(a|x|d|z|act)=/g) || []).length;
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(р)) бр.празниУловки++;
  });
  // 🪤 ПЪРВИЯТ БРОЯЧ НА ТАЙМЕРИ ЛЪЖЕШЕ: търсеше пазача на СЪЩИЯ ред. Но
  //    „setInterval(() => {" и „if (document.hidden) return;" са на два
  //    различни реда — затова обяви 5 таймера в home.js за незащитени, а
  //    трима от тях имат пазач един ред по-долу. Сега се чете ЦЯЛОТО тяло
  //    на извикването (по баланс на скобите), не редът.
  // 🪤 ВТОРАТА ЛЪЖА НА БРОЯЧА (хваната веднага след първата поправка): щом
  //    написах в КОМЕНТАР думата „setInterval", броячът я преброи за таймер и
  //    показа несъществуващ ред. Мярка, която брои собствените ми бележки, не
  //    мери кода. Коментарите се махат (редовете остават цели, за да не мръднат
  //    номерата), а `сиСтрува` влиза в речника на пазачите — тя Е пазачът.
  const ПАЗАЧ = /document\.hidden|isConnected|roomOverlay|offsetParent|видим|сиСтрува|\.hidden\b/;
  const безКоментари = безКоментариТекст(т);
  let к = 0;
  while ((к = безКоментари.indexOf('setInterval', к)) >= 0) {
    const отв = безКоментари.indexOf('(', к);
    let дълб = 0, край = отв;
    for (let i = отв; i < безКоментари.length; i++) {
      if (безКоментари[i] === '(') дълб++;
      else if (безКоментари[i] === ')') { дълб--; if (!дълб) { край = i; break; } }
    }
    const тяло = безКоментари.slice(отв, край + 1);
    const ред = безКоментари.slice(0, к).split('\n').length;
    if (ПАЗАЧ.test(тяло)) бр.таймериСПазач++;
    else { бр.безкрайниТаймери++; бр.подробно.push({ ред, вид: 'setInterval-без-пазач', текст: тяло.replace(/\s+/g, ' ').slice(0, 100) }); }
    к = край + 1;
  }
  бр.общоИнтерактивни = бр.слушатели + бр.наклик + бр.делегирани;
  return бр;
}

// ═══════════════════════════════════════════════════════════
// 6. САМОПРОВЕРКА — в ДВЕТЕ посоки
// ═══════════════════════════════════════════════════════════
function самопроверка() {
  const W = пясъчник([]);
  const д = W.document;
  const кутия = д.createElement('div'); д.body.appendChild(кутия);

  const жив = д.createElement('button'); жив.textContent = 'жив';
  жив.addEventListener('click', () => кутия.appendChild(д.createElement('span')));
  const пишещ = д.createElement('button'); пишещ.textContent = 'пишещ';
  пишещ.addEventListener('click', () => W.localStorage.setItem('__проба__', '1'));
  const мъртъв = д.createElement('button'); мъртъв.textContent = 'мъртъв';
  const лъжец = д.createElement('button'); лъжец.textContent = 'лъжец';
  лъжец.addEventListener('click', () => { кутия.appendChild(д.createTextNode('Бебето е на undefined месеца')); });
  const гърмящ = д.createElement('button'); гърмящ.textContent = 'гърмящ';
  гърмящ.addEventListener('click', () => { null.х = 1; });
  // двата, които СТАРАТА мярка обявяваше за мъртви (виж бележката при отпечатък)
  const самоКлас = д.createElement('button'); самоКлас.textContent = 'клас';
  самоКлас.addEventListener('click', () => самоКлас.classList.add('on'));
  const еднаДължина = д.createElement('button'); еднаДължина.textContent = 'дълж';
  const табло = д.createElement('span'); табло.textContent = 'Бррр!';
  еднаДължина.addEventListener('click', () => { табло.textContent = 'Дзън!'; });
  кутия.append(жив, пишещ, мъртъв, лъжец, гърмящ, самоКлас, еднаДължина, табло);

  const р1 = натисни(W, жив, д.body);
  const р2 = натисни(W, пишещ, д.body);
  const р3 = натисни(W, мъртъв, д.body);
  const текстПреди = д.body.textContent;
  const р4 = натисни(W, лъжец, д.body);
  const лъжаХваната = ЛЪЖИ.test(д.body.textContent);
  const лъжаНеПреди = !ЛЪЖИ.test(текстПреди);
  const р5 = натисни(W, гърмящ, д.body);
  const р6 = натисни(W, самоКлас, д.body);
  const р7 = натисни(W, еднаДължина, д.body);

  // и разметката: разбор + селектори (мъничкият DOM трябва да е верен)
  const к2 = д.createElement('div');
  к2.innerHTML = '<div class="bg-bar"><button class="jr-chip" data-a="p" type="button">‹</button>' +
    '<span id="bgSay">Пипни</span><button class="jr-chip" data-a="n">›</button></div>';
  const делег = к2.querySelectorAll('[data-a]');
  const поИд = к2.querySelector('#bgSay');
  const съставен = к2.querySelectorAll('.bg-bar .jr-chip');

  // и екранирането: &amp; трябва да СЕ РАЗВЪРЖЕ в текст, за да не лъже проверката
  const к3 = д.createElement('div'); к3.innerHTML = '<p>Мама &amp; бебе</p>';

  const проверки = {
    '✅ вижда ЖИВ бутон (мени страницата)': р1.промени === true,
    '✅ вижда ПИШЕЩ бутон (мени паметта)': р2.записа.indexOf('__проба__') >= 0,
    '✅ вижда МЪЛЧАЛИВ бутон (нищо)': р3.промени === false && р3.записа.length === 0,
    '✅ хваща ЛЪЖА на екрана ("undefined")': лъжаХваната === true,
    '✅ и НЕ вика лъжа, когато я няма (обратната посока)': лъжаНеПреди === true,
    '✅ хваща ГЪРМЯЩ бутон': !!р5.гръмна,
    '✅ и НЕ обявява живия за гърмящ (обратната посока)': !р1.гръмна,
    '✅ вижда бутон, който сменя САМО клас („on" на чип)': р6.промени === true,
    '✅ вижда смяна на текст със СЪЩАТА дължина („Бррр!"→„Дзън!")': р7.промени === true,
    '✅ НЕ натиска два пъти чип, който си е сменил класа': (() => {
      const п = M => { const о = []; let n = M; while (n && n.parentNode) { о.push(n.parentNode.childNodes.indexOf(n)); n = n.parentNode; } return M.tagName + '@' + о.reverse().join('.'); };
      const преди = п(самоКлас);
      самоКлас.classList.add('още-един-клас');
      return п(самоКлас) === преди;
    })(),
    '✅ и РАЗЛИЧАВА два съседни бутона (обратната посока)': (() => {
      const п = M => { const о = []; let n = M; while (n && n.parentNode) { о.push(n.parentNode.childNodes.indexOf(n)); n = n.parentNode; } return M.tagName + '@' + о.reverse().join('.'); };
      return п(жив) !== п(пишещ);
    })(),
    '✅ пропуска ОТКАЧЕН елемент (не е в документа)': (() => {
      const о = д.createElement('button'); о.textContent = 'вън';
      return о.isConnected === false && жив.isConnected === true;
    })(),
    '✅ разборът на разметка вижда 2 делегирани бутона': делег.length === 2,
    '✅ селектор по #ид': !!поИд && поИд.textContent === 'Пипни',
    '✅ съставен селектор „.bg-bar .jr-chip"': съставен.length === 2,
    '✅ dataset от разметка': делег.length === 2 && делег[0].dataset.a === 'p',
    '✅ &amp; се развързва (иначе всяко „&" щеше да е лъжа)': к3.textContent === 'Мама & бебе',
    '✅ броячът брои РЕАЛНИ редове (lab.js > 700)': преброй('js/lab.js').редове > 700,
    // и в ДВЕТЕ посоки: пазачът на СЛЕДВАЩИЯ ред трябва да се вижда,
    // а таймер БЕЗ пазач трябва да остане уловен
    // 🪤 стриперът не бива да ИЗЯЖДА код: `/'/g` в js/extras.js:19 (апостроф в
    //    регекс) го подведе веднъж и цял setInterval изчезна безшумно
    '✅ стриперът НЕ изяжда код заради регекс с апостроф': (() => {
      const т = "const esc = s => s.replace(/'/g, '&#39;');\nsetInterval(беат, 1000);\n";
      const ч = безКоментариТекст(т);
      return ч.indexOf('setInterval') >= 0 && ч.split('\n').length === т.split('\n').length;
    })(),
    '✅ и НЕ пропуска setInterval в js/extras.js (истинският файл)': (() => {
      const ч = безКоментариТекст(чети('js/extras.js'));
      return (ч.match(/setInterval/g) || []).length === 1;
    })(),
    '✅ броячът вижда пазач на СЛЕДВАЩИЯ ред и НЕ брои коментари/низове': (() => {
      const п = path.join(require('os').tmpdir(), 'bl_probe_' + Date.now() + '.js');
      fs.writeFileSync(п,
        '// тук пиша думата setInterval в коментар — НЕ бива да се брои\n' +
        'setInterval(() => {\n  if (document.hidden) return;\n  х();\n}, 800);\n' +
        'setInterval(function(){ у(); }, 900);\n' +
        'const с = "и в низ: setInterval(...) — също не се брои";\n');
      const пътОтн = path.relative(КОРЕН, п);
      const б = преброй(пътОтн);
      fs.unlinkSync(п);
      return б.таймериСПазач === 1 && б.безкрайниТаймери === 1;
    })(),
    '✅ и НЕ брои несъществуващи (празен низ → 0 слушатели)': (() => { try { преброй('js/НЯМА_ТАКЪВ.js'); return false; } catch (e) { return true; } })()
  };
  const паднали = Object.keys(проверки).filter(k => !проверки[k]);
  return { проверки, паднали };
}

// ═══════════════════════════════════════════════════════════
// 6б. СМЕТКИТЕ — всяка с РЪЧЕН пример, пресметнат на хартия
//
// Сгрешена сметка в приложение за бебе е опасна, не досадна. Затова тук
// всяко число има очакван резултат, изчислен ръчно, и уредът пада, ако
// кодът каже друго. Никоя проверка не сравнява кода със себе си.
// ═══════════════════════════════════════════════════════════
function сметки() {
  const р = [];
  const кажи = (име, ръчно, кодът, вярно) => р.push({ име, ръчно, кодът, ок: вярно });

  // ── 1. lab.js · verdict(): „твоите N вечери" ──
  {
    const W = пясъчник(['js/lab.js']);
    W._памет.set('bl_baby', JSON.stringify({ name: 'Мия' }));
    const log = {};
    // РЪЧНО: A = 4 вечери „повито", от тях 3 добри → 0.75
    //        B = 3 вечери „непровито", от тях 1 добра → 0.3333…
    //        разлика 0.4167 > 0.2 и е ПОЛОЖИТЕЛНА → присъда „май работи"
    //        редът трябва да пише 3 от 4 и 1 от 3, nA=4, nB=3
    [['д1', 'a', 1], ['д2', 'a', 1], ['д3', 'a', 1], ['д4', 'a', 0],
     ['д5', 'b', 1], ['д6', 'b', 0], ['д7', 'b', 0]].forEach(([k, arm, ok]) => { log[k] = { arm, ok }; });
    const v = W.BL_LAB.verdict({ a: 'повито', b: 'непровито', d: 7, log });
    кажи('lab.verdict · 3 от 4 срещу 1 от 3', 'tone=yes · nA=4 · nB=3 · „3 от 4" и „1 от 3"',
      'tone=' + v.tone + ' · nA=' + v.nA + ' · nB=' + v.nB,
      v.tone === 'yes' && v.nA === 4 && v.nB === 3 &&
      /3 от 4/.test(v.d) && /1 от 3/.test(v.d));

    // РЪЧНО: A=3 (2 добри)=0.6667, B=3 (2 добри)=0.6667 → разлика 0 → „няма разлика"
    const log2 = { a1: { arm: 'a', ok: 1 }, a2: { arm: 'a', ok: 1 }, a3: { arm: 'a', ok: 0 },
                   b1: { arm: 'b', ok: 1 }, b2: { arm: 'b', ok: 1 }, b3: { arm: 'b', ok: 0 } };
    const v2 = W.BL_LAB.verdict({ a: 'с баня', b: 'без баня', d: 6, log: log2 });
    кажи('lab.verdict · 2 от 3 срещу 2 от 3', 'tone=same (разлика 0)', 'tone=' + v2.tone, v2.tone === 'same');

    // РЪЧНО: A=2 вечери → под прага 3 → „още е рано", БЕЗ проценти
    const v3 = W.BL_LAB.verdict({ a: 'х', b: 'у', d: 7, log: { a1: { arm: 'a', ok: 1 }, a2: { arm: 'a', ok: 1 }, b1: { arm: 'b', ok: 0 }, b2: { arm: 'b', ok: 0 }, b3: { arm: 'b', ok: 1 } } });
    кажи('lab.verdict · само 2 вечери на рамо', 'tone=thin (прагът е 3)', 'tone=' + v3.tone, v3.tone === 'thin');

    // деление на нула: празен дневник не бива да дава NaN
    const v4 = W.BL_LAB.verdict({ a: 'х', b: 'у', d: 7, log: {} });
    кажи('lab.verdict · празен дневник', 'tone=thin, без NaN', 'tone=' + v4.tone + ' · NaN? ' + /NaN/.test(v4.d + v4.t),
      v4.tone === 'thin' && !/NaN|undefined/.test(v4.d + v4.t));
  }

  // ── 2. extras.js · СЗО-кривите (interp) ──
  {
    const W = пясъчник(['js/data.js']);
    const M = W.BL_DATA.who.months;                 // [0,1,2,3,4,5,6,8,10,12,15,18,21,24]
    // същата формула като в extras.js:lenHeadCard (копие, за да се мери отделно)
    const interp = (arr, age) => {
      const aa = Math.max(M[0], Math.min(M[M.length - 1], age));
      let i = 0; while (i < M.length - 1 && M[i + 1] < aa) i++;
      const t = (aa - M[i]) / ((M[i + 1] - M[i]) || 1);
      return arr[i] + t * (arr[i + 1] - arr[i]);
    };
    const L = W.BL_DATA.whoLen.girls, H = W.BL_DATA.whoHead.girls;
    // РЪЧНО: 12 м. е ТОЧНО в таблицата (индекс 9) → без интерполация → 74.0
    кажи('СЗО ръст · момиче 12 м. P50', '74.0 (таблична стойност, индекс 9)', interp(L.p50, 12).toFixed(2), Math.abs(interp(L.p50, 12) - 74.0) < 0.001);
    // РЪЧНО: 7 м. е по средата между 6 м. (65.7) и 8 м. (68.7) → 65.7+0.5·3.0 = 67.20
    кажи('СЗО ръст · момиче 7 м. P50 (средата 6–8 м.)', '67.20 = 65.7 + 0.5·(68.7−65.7)', interp(L.p50, 7).toFixed(2), Math.abs(interp(L.p50, 7) - 67.2) < 0.001);
    // РЪЧНО: краищата — 0 м. → 49.1 (първата клетка), 24 м. → 86.4 (последната)
    кажи('СЗО ръст · крайните възрасти 0 и 24 м.', '49.10 и 86.40', interp(L.p50, 0).toFixed(2) + ' и ' + interp(L.p50, 24).toFixed(2),
      Math.abs(interp(L.p50, 0) - 49.1) < 0.001 && Math.abs(interp(L.p50, 24) - 86.4) < 0.001);
    // РЪЧНО: извън таблицата се ЗАКОВАВА, не се екстраполира (иначе −5 см дава глупост)
    кажи('СЗО ръст · възраст 40 м. (извън таблицата)', 'заковава се на 86.40, не расте нататък', interp(L.p50, 40).toFixed(2), Math.abs(interp(L.p50, 40) - 86.4) < 0.001);
    // РЪЧНО: главата на 6 м., момиче: P3=39.7 · P50=42.2 · P97=44.6 (таблични, индекс 6)
    кажи('СЗО главичка · момиче 6 м. P3/P50/P97', '39.70 / 42.20 / 44.60',
      [interp(H.p3, 6), interp(H.p50, 6), interp(H.p97, 6)].map(x => x.toFixed(2)).join(' / '),
      Math.abs(interp(H.p3, 6) - 39.7) < 0.001 && Math.abs(interp(H.p50, 6) - 42.2) < 0.001 && Math.abs(interp(H.p97, 6) - 44.6) < 0.001);
    // РЪЧНО: таблиците ТРЯБВА да са с толкова клетки, колкото са месеците (14).
    //        Разминат ли се, интерполацията чете undefined и дава NaN на екрана.
    const дълж = [L.p3, L.p50, L.p97, H.p3, H.p50, H.p97, W.BL_DATA.whoLen.boys.p50, W.BL_DATA.whoHead.boys.p50].map(a => a.length);
    кажи('СЗО таблици · дължини срещу 14 месеца', 'всички по 14', дълж.join(','), дълж.every(x => x === M.length));
  }

  // ── 3. games2.js · превъртането на черно-белите картинки ──
  {
    const W = пясъчник(['js/games2.js'], w => празнаСтая(w, ['Развитие и игри']));
    const д = W.document;
    const корен = д.createElement('div'); д.body.appendChild(корен);
    W.ROOM_FEATURES['Развитие и игри'](корен);
    const чб = корен.querySelectorAll('.jr-chip').filter(b => /Черно-бели/.test(b.textContent))[0];
    чб.click();
    const ов = д.body.querySelectorAll('.bg-overlay')[0];
    const текст = () => ов.querySelectorAll('span').map(s => s.textContent).filter(t => /\d+\/\d+/.test(t))[0] || '';
    const назад = () => ов.querySelectorAll('[data-a]').filter(b => b.dataset.a === 'p')[0].click();
    const преди = текст();                              // РЪЧНО: първата е „Кръгове · 1/5"
    назад();                                            // РЪЧНО: от 1 назад → последната, „Лице · 5/5"
    const след = текст();
    кажи('игри · „‹" от първата картинка', 'от 1/5 → 5/5 (превърта, не излиза от списъка)', преди.trim() + ' → ' + след.trim(),
      /1\/5/.test(преди) && /5\/5/.test(след));
  }

  // ── 4. hero.js · значката „чака те тук" не бива да лъже ──
  {
    const W = пясъчник([]);
    // hero.js строи чак на DOMContentLoaded и иска .hero-inner; тук мерим
    // самото правило, преписано едно към едно от hero.js:чакаЛи
    const чети = (k, d) => { try { const v = JSON.parse(W.localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const дн = new Date();
    const кл = дн.getFullYear() + '-' + String(дн.getMonth() + 1).padStart(2, '0') + '-' + String(дн.getDate()).padStart(2, '0');
    const чакаЛаб = () => { const о = (чети('bl_lab', { list: [] }).list || []).filter(x => !x.closed); return о.length && !(о[0].log || {})[кл] ? '🔬' : ''; };
    W._памет.set('bl_lab', JSON.stringify({ list: [{ closed: false, log: {} }] }));
    const без = чакаЛаб();                               // РЪЧНО: неотметнат опит → 🔬
    W._памет.set('bl_lab', JSON.stringify({ list: [{ closed: false, log: { [кл]: { arm: 'a', ok: 1 } } }] }));
    const с = чакаЛаб();                                 // РЪЧНО: отметнат ДНЕС → празно
    кажи('hero · значка „🔬 чака те" на къщичката', 'неотметнат → 🔬 · отметнат днес → (празно)',
      JSON.stringify(без) + ' · ' + JSON.stringify(с), без === '🔬' && с === '');
  }
  return р;
}

// ═══════════════════════════════════════════════════════════
// 7. ДОКЛАДЪТ
// ═══════════════════════════════════════════════════════════
function главна() {
  const самоСП = process.argv.indexOf('--samoproverka') >= 0;
  const сп = самопроверка();
  console.log('═══ САМОПРОВЕРКА (уредът изпитан в ДВЕТЕ посоки) ═══');
  Object.keys(сп.проверки).forEach(k => console.log('  ' + (сп.проверки[k] ? k : '🔴 ПАДНА: ' + k.replace('✅ ', ''))));
  console.log('  → ' + (Object.keys(сп.проверки).length - сп.паднали.length) + ' от ' + Object.keys(сп.проверки).length + ' проверки минаха');
  if (сп.паднали.length) { console.log('\n🔴 УРЕДЪТ НЕ Е ГОДЕН — не вярвай на числата отдолу.'); process.exitCode = 1; return; }
  if (самоСП) return;

  console.log('\n═══ СТАТИЧЕН БРОЙ — колко има за преглеждане ═══');
  let общоСтат = 0, общоТаймери = 0, общоУловки = 0;
  const редове = [];
  МОИТЕ.forEach(ф => {
    const б = преброй(ф);
    общоСтат += б.общоИнтерактивни; общоТаймери += б.безкрайниТаймери; общоУловки += б.празниУловки;
    редове.push(б);
    console.log('  ' + ф.padEnd(16) + ' редове ' + String(б.редове).padStart(5) +
      ' · слушатели ' + String(б.слушатели).padStart(3) +
      ' · .onX ' + String(б.наклик).padStart(2) +
      ' · делегирани ' + String(б.делегирани).padStart(3) +
      ' · бутони ' + String(б.бутониЕл + б.бутониHTML).padStart(3) +
      ' · полета ' + String(б.полета).padStart(2) +
      ' · празни уловки ' + String(б.празниУловки).padStart(2) +
      ' · таймери без пазач ' + б.безкрайниТаймери);
  });
  console.log('  ─────────────────────────────────────────────');
  console.log('  ПРЕГЛЕДАНИ ' + МОИТЕ.length + ' файла · ' + общоСтат + ' точки на взаимодействие · ' +
    общоУловки + ' празни уловки · ' + общоТаймери + ' таймера без пазач');
  редове.forEach(б => б.подробно.forEach(д => console.log('    🟠 ' + б.файл + ':' + д.ред + ' ' + д.текст)));

  console.log('\n═══ СМЕТКИТЕ — всяка с РЪЧЕН пример ═══');
  const см = сметки();
  см.forEach(x => {
    console.log('  ' + (x.ок ? '✅' : '🔴 ГРЕШНА СМЕТКА:') + ' ' + x.име);
    console.log('      на ръка: ' + x.ръчно);
    console.log('      кодът : ' + x.кодът);
  });
  console.log('  → ПРЕГЛЕДАНИ ' + см.length + ' сметки · вярни ' + см.filter(x => x.ок).length + ' · ГРЕШНИ ' + см.filter(x => !x.ок).length);
  if (см.some(x => !x.ок)) process.exitCode = 1;

  console.log('\n═══ ЖИВ ОБХОД — всеки бутон НАТИСНАТ ═══');
  let вс = { прегледани: 0, реагират: 0, записват: 0, мълчат: 0, гърмят: 0, лъжат: 0 };
  СЦЕНИ.forEach(сц => {
    const р = пуснСцена(сц);
    ['прегледани', 'реагират', 'записват', 'мълчат', 'гърмят', 'лъжат'].forEach(k => { вс[k] += р[k]; });
    console.log('\n  ▸ ' + р.име);
    console.log('    ПРЕГЛЕДАНИ: ' + р.прегледани + ' · реагират ' + р.реагират + ' · записват ' + р.записват +
      ' · МЪЛЧАТ ' + р.мълчат + ' · ГЪРМЯТ ' + р.гърмят + ' · ЛЪЖАТ ' + р.лъжат);
    if (р.презареждане) console.log('    презареждане: ' + р.презареждане);
    р.бележки.forEach(б => console.log('    ' + б));
    р.гърмящи.slice(0, 12).forEach(x => console.log('    🔴 ГЪРМИ: ' + x));
    р.лъжливи.slice(0, 10).forEach(x => console.log('    🔴 ЛЪЖЕ: ' + x));
    р.мълчаливи.slice(0, 14).forEach(x => console.log('    🟠 мълчи: ' + x));
    if (р.мълчаливи.length > 14) console.log('    …и още ' + (р.мълчаливи.length - 14) + ' мълчаливи');
  });
  console.log('\n  ═══ ОБЩО ЖИВО: ПРЕГЛЕДАНИ ' + вс.прегледани + ' елемента · реагират ' + вс.реагират +
    ' · записват ' + вс.записват + ' · мълчат ' + вс.мълчат + ' · гърмят ' + вс.гърмят + ' · лъжат ' + вс.лъжат);
  if (вс.гърмят || вс.лъжат) process.exitCode = 1;
  // висящите часовници на пясъчниците не бива да държат Node буден
  setImmediate(() => process.exit(process.exitCode || 0));
}

if (require.main === module) главна();
module.exports = { пясъчник, направиDOM, преброй, самопроверка, пуснСцена, СЦЕНИ };
