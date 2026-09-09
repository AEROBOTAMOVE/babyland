// ═══════════════════════════════════════════════════════════
// 🏖️ ПЯСЪЧНИКЪТ — зарежда js/kb.js + js/helper.js извън браузър
//
// 🔴 ЗАЩО Е ТУК (26.08.2026, платено с мъртъв пазач): този файл живееше във
//    ВРЕМЕННАТА папка на сесията. Днес тя се изчисти и `node dev/korpus350.js`
//    гръмна с „Cannot find module". Тоест ГЛАВНИЯТ ПАЗАЧ НА БЕЗОПАСНОСТТА —
//    онзи, който брои пропуснатите спешни случаи — беше невъзможно да се пусне,
//    а нищо не го обявяваше. Заедно с него висяха на същия файл:
//        dev/test_bremennost.js · dev/test_dv.js · dev/test_pauza.js
//        dev/test_prevenciya.js · dev/test_priznanie.js · dev/test_slepeni.js
//    Седем уреда, зависими от папка, която се трие. Уред, който не може да се
//    пусне, е нула — а тук нулата беше точно върху спешните случаи.
//
// ПОЛЗВАНЕ:
//     const { zaredi } = require('./pyasachnik.js');   // от dev/
//     const W = zaredi(null);                          // W.BL_MATCH, W.KB, …
//     const W2 = zaredi(src => src.replace('A', 'B')); // с подменен изходен код
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта и нищо не записва.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
// пътят е спрямо самия файл — уред, който работи само от една папка, не се пуска
const ROOT = path.resolve(__dirname, '..');

function ctx(опции) {
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
  });
  // ═══════════════════════════════════════════════════════════════════
  // 🔴 09.09 — ПРАЗНАТА ПАМЕТ БЕШЕ СЛЯПО ПЕТНО, НЕ НЕУТРАЛНОСТ.
  //   `getItem: () => null` изглежда като „чист лист". Всъщност е ЕДНА
  //   съвсем определена жена: без въведено бебе, без ПМЦ, без нищо.
  //   Заради това `helper.js:4340` — гейтът, който пази РОДИЛАТА жена да
  //   не бъде бутана към стая „Бременност" — НЕ СЕ ПАЛЕШЕ НИКОГА в нито
  //   една моя мярка. Тоест мерех врати, които в живото приложение ги няма.
  //   ИЗМЕРЕНО: 6 от 42 „грешни попадения" изчезват само от въведена дата
  //   на раждане.
  //   Сега паметта е ИСТИНСКА (Map) и се пълни от опции.памет.
  //   ⚠️ Празната памет остава по подразбиране — за да не се смени тихо
  //   смисълът на старите мерки. Който иска майка с бебе, го КАЗВА.
  // ═══════════════════════════════════════════════════════════════════
  const _пам = new Map();
  if (опции && опции.памет) for (const [k, v] of Object.entries(опции.памет))
    _пам.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  w.localStorage = {
    getItem: k => (_пам.has(k) ? _пам.get(k) : null),
    setItem: (k, v) => { _пам.set(String(k), String(v)); },
    removeItem: k => { _пам.delete(k); },
    clear: () => _пам.clear(),
    key: i => Array.from(_пам.keys())[i] || null,
    get length() { return _пам.size; },
  };
  // ═══════════════════════════════════════════════════════════════════
  // 🎭 БОГАТИЯТ КУКЛЕН DOM (08.09) — за да се чете ТЕКСТЪТ, който майката
  //    вижда, а не само коя врата е гърмяла.
  //
  //    ЗАЩО: всичките 14 пазача мерят ВРАТИТЕ (BL_REDFLAG и пр.). Нито един
  //    не чете самия отговор. А на 08.09 се хвана бременна жена, която
  //    ПОЛУЧИ отговор — но текстът беше писан за жена СЛЕД раждане. Врата
  //    вярна, текст грешен. Уред, който гледа само вратата, вижда „успех".
  //
  //    ⚠️ ТОВА НЕ Е БРАУЗЪР и не се преструва на такъв. Няма подредба, няма
  //    стилове, няма събития. Мери се САМО текстът, който влиза в мехурите.
  //    Живата обиколка си остава задължителна — тя намери тези дефекти.
  // ═══════════════════════════════════════════════════════════════════
  if (опции && опции.домБогат) {
    const възел = (таг) => {
      const н = {
        tagName: String(таг || "div").toUpperCase(), children: [], _текст: "", _html: "",
        style: {}, dataset: {}, hidden: false, offsetWidth: 1,
        className: "", id: "", value: "", checked: false, disabled: false, title: "",
        classList: { _s: new Set(), add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); }, contains(x) { return this._s.has(x); }, toggle(x) { this._s.has(x) ? this._s.delete(x) : this._s.add(x); } },
        appendChild(c) { this.children.push(c); return c; },
        append(...c) { c.forEach(x => this.children.push(x)); },
        prepend(c) { this.children.unshift(c); return c; },
        insertBefore(c) { this.children.unshift(c); return c; },
        removeChild(c) { const i = this.children.indexOf(c); if (i > -1) this.children.splice(i, 1); return c; },
        remove() {}, setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
        cloneNode(дълбоко) { const к = възел(this.tagName); к._текст = this._текст; к._html = this._html; к.className = this.className; if (дълбоко) к.children = this.children.map(c => c.cloneNode ? c.cloneNode(true) : c); return к; },
        contains() { return false; }, matches() { return false; }, replaceChildren(...c) { this.children = c; },
        insertAdjacentHTML(къде, х) { this._html += String(х); }, insertAdjacentElement(къде, е) { this.children.push(е); return е; },
        get firstChild() { return this.children[0] || null; }, get lastChild() { return this.children[this.children.length-1] || null; },
        get firstElementChild() { return this.children[0] || null; }, get parentNode() { return null; }, get parentElement() { return null; },
        get nextSibling() { return null; }, get previousSibling() { return null; }, get childNodes() { return this.children; },
        get offsetParent() { return null; }, get scrollHeight() { return 0; }, get clientHeight() { return 0; }, scrollTop: 0,
        hasAttribute() { return false; }, addEventListener() {}, removeEventListener() {},
        querySelector(с) { return (this._кеш = this._кеш || {}), (this._кеш[с] = this._кеш[с] || възел("div")); }, querySelectorAll() { return []; },
        closest() { return null; }, scrollIntoView() {}, focus() {}, blur() {}, click() {},
        getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = String(v); if (!v) this.children = []; },
        get textContent() { return this._текст || this._html.replace(/<[^>]*>/g, ""); },
        set textContent(v) { this._текст = String(v); },
        // целият видим текст на този възел и децата му — това чете уредът
        get всичкиятТекст() {
          const мой = this._текст || this._html.replace(/<[^>]*>/g, " ");
          return [мой].concat(this.children.map(c => c.всичкиятТекст || "")).join(" ").replace(/[ ]+/g, " ").trim();
        }
      };
      return н;
    };
    const поId = {};
    const поСелектор = {};
    w.document = {
      documentElement: възел("html"), body: возелТяло(), head: възел("head"),
      createElement: (t) => възел(t),
      createElementNS: (ns, t) => възел(t),
      createTextNode: (t) => { const н = възел("#text"); н.textContent = t; return н; },
      createDocumentFragment: () => възел("#fragment"),
      getElementById: (id) => (поId[id] = поId[id] || възел("div")),
      querySelector: (с) => (поСелектор[с] = поСелектор[с] || възел("div")), querySelectorAll: () => [],
      addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
      readyState: "complete", _поId: поId
    };
    function возелТяло() { const б = възел("body"); return б; }
    w.CustomEvent = function (име, о) { this.type = име; this.detail = о && o_detail(o); };
    function o_detail(o) { return o.detail; }
    w.Event = function (име) { this.type = име; };
    w.MutationObserver = function () { return { observe() {}, disconnect() {} }; };
    // истински браузърни глобали, не подпорки: приложението наистина ги вика
    w.history = { pushState() {}, replaceState() {}, back() {}, forward() {}, go() {}, state: null, length: 1 };
    w.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 0 };
    w.scrollTo = function () {}; w.scrollBy = function () {}; w.innerWidth = 390; w.innerHeight = 844;
    w.devicePixelRatio = 2; w.performance = { now: () => Date.now() };
    w.URL = URL; w.URLSearchParams = URLSearchParams; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
    w.btoa = (x) => Buffer.from(String(x), "binary").toString("base64");
    w.atob = (x) => Buffer.from(String(x), "base64").toString("binary");
    w.crypto = { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = (i * 2654435761) % 256; return a; }, randomUUID: () => "00000000-0000-4000-8000-000000000000" };
    w.fetch = () => Promise.reject(new Error("пясъчникът няма мрежа — нарочно"));
    w.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] };
    w.CSS = { supports: () => false };
    w.alert = function () {}; w.confirm = () => false; w.prompt = () => null;
    w.IntersectionObserver = function () { return { observe() {}, disconnect() {}, unobserve() {} }; };
  } else
  w.document = {
    documentElement: {}, body: {}, head: {},
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {} }),
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, readyState: 'complete'
  };
  w.addEventListener = function () {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = f => setTimeout(() => f(Date.now()), 0);
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '' };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

// patch        = функция (изходен текст на helper.js) -> нов текст
// опции.kbPatch = функция (изходен текст на js/kb.js) -> нов текст
//
// 🔑 08.09 — ЗАЩО СЕ ДОБАВИ kbPatch:
//   Досега пясъчникът позволяваше опит само върху МОЗЪКА. Всяка промяна в
//   БАЗАТА (ключове, флагове, карти) можеше да се провери едва СЛЕД като е
//   записана в js/kb.js — тоест наживо, без път назад и без сравнение с
//   „както беше". А точно там живее по-голямата част от работата: законът
//   на този проект е, че съдържанието обикновено СЪЩЕСТВУВА, а липсват
//   ДУМИТЕ. Сега двата мозъка може да се различават и по база, и „цена
//   срещу полза" се мери за ключова хирургия по същия начин, както за код.
function zaredi(patch, опции) {
  const W = ctx(опции);
  let kb = fs.readFileSync(path.join(ROOT, 'js/kb.js'), 'utf8');
  if (опции && typeof опции.kbPatch === 'function') kb = опции.kbPatch(kb);
  let hp = fs.readFileSync(path.join(ROOT, 'js/helper.js'), 'utf8');
  if (patch) hp = patch(hp);
  new vm.Script(kb, { filename: 'kb.js' }).runInContext(W);
  new vm.Script(hp, { filename: 'helper.js' }).runInContext(W);
  // отказва ШУМНО: уред, който продължи без BL_MATCH, ще брои нули и ще ги
  // обяви за чисто
  if (!W.BL_MATCH) throw new Error('BL_MATCH липсва — пясъчникът не се зареди');
  return W;
}

module.exports = { zaredi, ROOT };
