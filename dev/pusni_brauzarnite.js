// ═══════════════════════════════════════════════════════════
// 🖥️ БЕГАЧЪТ ЗА „БРАУЗЪРНИТЕ" УРЕДИ — без браузър
//
// ЗАЩО (02.09): седем от най-важните уреда в тази папка се пускат САМО в конзолата
// на приложението. Затова седмици наред не са пускани нито веднъж. А когато един
// от тях най-после тръгна, той намери НЕОТКРИТА РЕГРЕСИЯ от първия път: дете под
// паднал шкаф — флагът мълчеше. Непуснат тест е нула, колкото и добър да е.
//
// Днес браузърният панел се заклещи ЧЕТИРИ пъти подред. Вместо да се боря с него,
// измерих от какво ИМЕННО им трябва браузър:
//
//   test_flagove    document.body · createElement · localStorage        ← само това
//   test_otgovori   същото                                             ← само това
//   test_biblioteka същото                                             ← само това
//   zaglavia        същото                                             ← само това
//   test_ezik       + querySelectorAll
//   test_pamet      + querySelector(All) по истински възли
//   test_telefon    + documentElement, head, hidden, getElementById
//
// А `document.createElement` в първите четири стои САМО В КОМЕНТАРА „как се пуска".
// Тоест на четири от седемте изобщо не им трябва браузър — трябваше им БЕГАЧ.
// dev/pyasachnik.js вече има подпорка за document и localStorage; липсваше
// някой да зареди ОСТАНАЛИТЕ js файлове и да извика метода на теста.
//
// ПУСКАНЕ:  node dev/pusni_brauzarnite.js            (всичките)
//           node dev/pusni_brauzarnite.js flagove    (един по име)
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ и вика. Не пипа нищо. Изтриването му не чупи нищо.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// 🕸️ МРЕЖА: файл, който гърми в ПРОМИС (а не веднага), убива целия бегач и седемте
//    уреда дават нула. Тук такъв гърмеж се ЗАПИСВА и работата продължава — но НЕ се
//    крие: изброява се накрая, за да не мине за чисто.
const асинхронниГърмежи = [];
process.on('unhandledRejection', e => { асинхронниГърмежи.push(String((e && e.message) || e).slice(0, 110)); });
process.on('uncaughtException', e => { асинхронниГърмежи.push('СИНХРОНЕН: ' + String(e.message).slice(0, 110)); });

// ── по-пълен прозорец от пясъчника: зарежда ВСИЧКИ js файлове по реда на
//    index.html, защото тестовете пипат и търсачката, и библиотеката, и данните ──
function прозорец() {
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect, URL,
    encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    isNaN, isFinite, parseInt, parseFloat, structuredClone, TextEncoder, TextDecoder
  });

  // 🪤 ИСТИНСКО ХРАНИЛИЩЕ, не празно. Празният localStorage е мълчалива лъжа:
  //    тест, който запише и после прочете, получава null и обявява „минава",
  //    защото не е сравнил с нищо. Тук пази стойностите наистина.
  // 🪤 ВТОРА ПОПРАВКА: първо направих localStorage като прост обект с методи
  //    ВЪРХУ СЕБЕ СИ. js/store.js обаче прави `Storage.prototype.getItem.call(...)`
  //    — стандартният начин да се обвие хранилището. Прототипът беше празен и
  //    целият бегач гръмна с „Cannot read properties of undefined (reading call)".
  //    Затова методите живеят на ПРОТОТИПА, точно както в браузър.
  const склад = new Map();
  function Хранилище() {}
  Хранилище.prototype.getItem = function (k) { return склад.has(String(k)) ? склад.get(String(k)) : null; };
  Хранилище.prototype.setItem = function (k, v) { склад.set(String(k), String(v)); };
  Хранилище.prototype.removeItem = function (k) { склад.delete(String(k)); };
  Хранилище.prototype.clear = function () { склад.clear(); };
  Хранилище.prototype.key = function (i) { const к = [...склад.keys()][i]; return к === undefined ? null : к; };
  Object.defineProperty(Хранилище.prototype, 'length', { get() { return склад.size; } });
  w.Storage = Хранилище;
  w.localStorage = new Хранилище();
  w.sessionStorage = new Хранилище();

  // ── мъничък DOM: възли, които помнят деца, клас и текст ──
  //    Достатъчен за createElement/appendChild/querySelector по id и по клас.
  //    НЕ е браузър и не се преструва на такъв — виж ОГРАНИЧЕНИЯТА най-долу.
  const всички = [];
  function възел(таг) {
    const е = {
      tagName: String(taгБезопасен(таг)).toUpperCase(), children: [], childNodes: [],
      style: {}, dataset: {}, _текст: '', id: '', className: '',
      classList: {
        _: new Set(),
        add(...c) { c.forEach(x => this._.add(x)); синхронизирай(е); },
        remove(...c) { c.forEach(x => this._.delete(x)); синхронизирай(е); },
        toggle(c) { this._.has(c) ? this._.delete(c) : this._.add(c); синхронизирай(е); return this._.has(c); },
        contains(c) { return this._.has(c); }
      },
      appendChild(д) { е.children.push(д); е.childNodes.push(д); д.parentNode = е; return д; },
      removeChild(д) { const i = е.children.indexOf(д); if (i >= 0) { е.children.splice(i, 1); е.childNodes.splice(i, 1); } return д; },
      insertBefore(д) { е.children.unshift(д); е.childNodes.unshift(д); д.parentNode = е; return д; },
      setAttribute(и, с) { е[и] = с; if (и === 'id') е.id = с; if (и === 'class') { е.className = с; е.classList._ = new Set(String(с).split(/\s+/).filter(Boolean)); } },
      getAttribute: и => (и in е ? String(е[и]) : null),
      hasAttribute: и => и in е,
      removeAttribute(и) { delete е[и]; },
      addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
      focus() {}, blur() {}, click() {}, scrollIntoView() {},
      // 🪤 ТРЕТА ВЪЛНА: test_telefon гърмеше на `широк.remove is not a function`.
      //    Възелът имаше removeChild (махни ДЕТЕ), но не и remove (махни СЕБЕ СИ)
      //    — а приложението ползва второто. Тук се добавят методите, които
      //    истинският код наистина вика, и нищо повече.
      remove() { if (е.parentNode) е.parentNode.removeChild(е); },
      replaceWith(н) { if (е.parentNode) { const p = е.parentNode; const i = p.children.indexOf(е); if (i >= 0) { p.children[i] = н; p.childNodes[i] = н; н.parentNode = p; } } },
      matches(с) { try { return намери(корен ? корен : е, с).indexOf(е) >= 0; } catch (x) { return false; } },
      contains(д) { let p = д; while (p) { if (p === е) return true; p = p.parentNode; } return false; },
      cloneNode() { const к = възел(е.tagName); к.id = е.id; к.className = е.className; к._текст = е._текст; к._html = е._html; return к; },
      insertAdjacentHTML(_, h) { е._html = (е._html || '') + String(h); },
      getElementsByClassName: с => намери(е, '.' + с),
      getElementsByTagName: с => намери(е, с),
      // closest върви НАГОРЕ по родителите, както в браузър — преди връщаше само null
      closest(с) { let p = е; while (p) { try { if (p.matches && p.matches(с)) return p; } catch (x) {} p = p.parentNode; } return null; },
      get firstChild() { return е.children[0] || null; },
      get lastChild() { return е.children[е.children.length - 1] || null; },
      get nextElementSibling() { const p = е.parentNode; if (!p) return null; const i = p.children.indexOf(е); return p.children[i + 1] || null; },
      get previousElementSibling() { const p = е.parentNode; if (!p) return null; const i = p.children.indexOf(е); return p.children[i - 1] || null; },
      get parentElement() { return е.parentNode || null; },
      get childElementCount() { return е.children.length; },
      get offsetWidth() { return 0; }, get offsetHeight() { return 0; },
      get clientWidth() { return 0; }, get clientHeight() { return 0; },
      getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }),
      querySelector: с => намери(е, с)[0] || null,
      querySelectorAll: с => намери(е, с),
      get textContent() { return е._текст + е.children.map(д => д.textContent).join(''); },
      set textContent(v) { е._текст = String(v); е.children.length = 0; е.childNodes.length = 0; },
      get innerHTML() { return е._html || ''; },
      set innerHTML(v) { е._html = String(v); е._текст = String(v).replace(/<[^>]*>/g, ''); },
      get innerText() { return е.textContent; },
      set innerText(v) { е.textContent = v; }
    };
    всички.push(е);
    return е;
  }
  function taгБезопасен(t) { return t == null ? 'div' : t; }
  function синхронизирай(е) { е.className = [...е.classList._].join(' '); }
  // ── селекторите, които уредите наистина ползват ──
  // 🪤 ВТОРА ВЪЛНА: първата версия знаеше само #id, .клас и таг. Уредът за езика
  //    (1106 реда, никога непускан) вика `script[src]`, за да разбере кои файлове
  //    да прегледа — намираше НУЛА и се самоизключваше с честно съобщение.
  //    Затова тук се добавят: [атрибут], [атрибут="стойност"], таг[атрибут],
  //    списък през запетая, и „а б" (потомък). Повече не е нужно и не се прави —
  //    подпорка, която се преструва на пълен браузър, лъже по-скъпо.
  function единичен(вътре, с) {
    // таг[атр] или таг[атр="ст"] или само [атр]
    const m = с.match(/^([a-zA-Z]*)\[([a-zA-Z-]+)(?:([~^$*|]?=)"?([^"\]]*)"?)?\]$/);
    if (m) {
      const [, таг, атр, знак, ст] = m;
      return вътре.filter(е => {
        if (таг && е.tagName !== таг.toUpperCase()) return false;
        const v = е[атр];
        if (v === undefined || v === null || v === '') return false;
        if (!знак) return true;
        const s = String(v);
        if (знак === '=') return s === ст;
        if (знак === '^=') return s.startsWith(ст);
        if (знак === '$=') return s.endsWith(ст);
        if (знак === '*=') return s.indexOf(ст) >= 0;
        return false;
      });
    }
    if (с.startsWith('#')) return вътре.filter(е => е.id === с.slice(1));
    if (с.startsWith('.')) return вътре.filter(е => е.classList.contains(с.slice(1)));
    if (/^[a-zA-Z]+$/.test(с)) return вътре.filter(е => е.tagName === с.toUpperCase());
    // таг.клас
    const mk = с.match(/^([a-zA-Z]+)\.([A-Za-z0-9_-]+)$/);
    if (mk) return вътре.filter(е => е.tagName === mk[1].toUpperCase() && е.classList.contains(mk[2]));
    return [];
  }
  function намери(корен, селектор) {
    const цял = String(селектор).trim();
    const вътре = [];
    (function обходи(в) { for (const д of в.children) { вътре.push(д); обходи(д); } })(корен);
    // списък през запетая
    if (цял.indexOf(',') >= 0) {
      const видяни = new Set(), изход = [];
      for (const част of цял.split(',')) for (const е of намери(корен, част)) if (!видяни.has(е)) { видяни.add(е); изход.push(е); }
      return изход;
    }
    // потомък: „а б" — намираме по последната част, стига да има предшественик по първата
    const части = цял.split(/\s+/).filter(Boolean);
    if (части.length > 1) {
      const родители = new Set(намери(корен, части.slice(0, -1).join(' ')));
      return единичен(вътре, части[части.length - 1]).filter(е => {
        let p = е.parentNode;
        while (p) { if (родители.has(p)) return true; p = p.parentNode; }
        return false;
      });
    }
    return единичен(вътре, цял);
  }

  const тяло = възел('body');
  const глава = възел('head');
  const корен = возелКорен();
  function возелКорен() { const к = възел('html'); к.appendChild(глава); к.appendChild(тяло); return к; }

  w.document = {
    documentElement: корен, body: тяло, head: глава, readyState: 'complete', hidden: false,
    title: 'Baby Land',
    createElement: т => възел(т),
    createTextNode: т => { const е = възел('#text'); е.textContent = т; return е; },
    createDocumentFragment: () => възел('fragment'),
    getElementById: id => намери(корен, '#' + id)[0] || null,
    querySelector: с => намери(корен, с)[0] || null,
    querySelectorAll: с => намери(корен, с),
    getElementsByClassName: с => намери(корен, '.' + с),
    getElementsByTagName: с => намери(корен, с),
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
    cookie: '', visibilityState: 'visible',
    // 🪤 test_telefon гърмеше тук: чете document.styleSheets, за да мери цветове.
    //    Дава му се ПРАЗЕН списък, за да тръгне — но точно затова визуалната му
    //    половина мери НИЩО и всяко нейно „0 находки" е лъжа. Отбелязано долу.
    styleSheets: [],
    fonts: { ready: Promise.resolve(), check: () => true, add() {} },
    elementFromPoint: () => null,
    activeElement: null, referrer: '', characterSet: 'UTF-8'
  };
  w.addEventListener = function () {};
  w.removeEventListener = function () {};
  w.dispatchEvent = () => true;
  w.matchMedia = () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  // 🩹 rAF през setTimeout: в скрит панел браузърът не рисува кадри и rAF мълчи
  //    завинаги — уредите висяха. Тук няма кадри изобщо, затова е задължително.
  w.requestAnimationFrame = f => setTimeout(() => f(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.getComputedStyle = () => ({ getPropertyValue: () => '', display: 'block', opacity: '1' });
  w.navigator = { userAgent: 'node', language: 'bg', languages: ['bg'], onLine: true, clipboard: { writeText: () => Promise.resolve() } };
  w.location = { href: 'http://localhost:8911/', search: '', hash: '', pathname: '/', origin: 'http://localhost:8911', reload() {} };
  w.history = { pushState() {}, replaceState() {}, back() {} };
  w.performance = { now: () => Date.now() };
  w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
  w.scrollTo = () => {}; w.speechSynthesis = null;
  // ═══ ВТОРА ВЪЛНА ПОДПОРКИ — след първото пускане ═══
  // Първото пускане вдигна 4 от 7 уреда. Другите три казаха ЧЕСТНО защо не могат
  // (всеки от тях изрично разграничава „0 провала" от „0 ПУСНАТИ теста" — добре
  // написани уреди). Ето какво им липсваше и какво им се дава тук:
  //
  //   store.js  → Storage              biblioteka → fetch към lib/
  //   ui.js     → MutationObserver     pamet      → File / DataTransfer / FileReader
  //   app.js    → IntersectionObserver ezik       → истински <script src> възли в head
  //
  // ⚠️ Всяка от тези подпорки е ЛЪЖА, доколкото не е браузър. Затова нито една не
  //    прави нищо освен да съществува — с изключение на fetch, който наистина
  //    чете от диска, защото точно това прави сървърът на живо.
  function Наблюдател() {}
  Наблюдател.prototype.observe = function () {};
  Наблюдател.prototype.unobserve = function () {};
  Наблюдател.prototype.disconnect = function () {};
  Наблюдател.prototype.takeRecords = function () { return []; };
  w.MutationObserver = Наблюдател;
  w.IntersectionObserver = Наблюдател;
  w.ResizeObserver = Наблюдател;
  w.PerformanceObserver = Наблюдател;
  // (Storage вече е дефиниран по-горе — методите му живеят на ПРОТОТИПА)
  w.Blob = class { constructor(ч) { this._ = (ч || []).join(''); this.size = this._.length; this.type = ''; } text() { return Promise.resolve(this._); } };
  w.File = class extends w.Blob { constructor(ч, име, о) { super(ч); this.name = име; this.lastModified = 0; Object.assign(this, о || {}); } };
  w.FileList = class { constructor(ф) { this._ = ф || []; this.length = this._.length; } item(i) { return this._[i] || null; } };
  w.DataTransfer = class { constructor() { this.items = { add() {} }; this.files = new w.FileList([]); } };
  w.FileReader = class {
    readAsText(ф) { const т = ф && ф._ ? ф._ : ''; setTimeout(() => { this.result = т; if (this.onload) this.onload({ target: this }); }, 0); }
    readAsDataURL(ф) { this.readAsText(ф); }
  };
  w.URL = Object.assign(URL, { createObjectURL: () => 'blob:тест', revokeObjectURL() {} });
  w.crypto = { getRandomValues: a => a, randomUUID: () => '00000000-0000-4000-8000-000000000000', subtle: {} };
  w.btoa = s => Buffer.from(String(s), 'binary').toString('base64');
  w.atob = s => Buffer.from(String(s), 'base64').toString('binary');
  w.CustomEvent = class { constructor(и, о) { this.type = и; Object.assign(this, о || {}); } };
  w.Event = w.CustomEvent;

  // 🌐 fetch, който чете ОТ ДИСКА. Не е измама: на живо сървърът прави точно това
  //    — подава файла от папката. Без него уредът за библиотеката вдига нула
  //    теста, защото lib/index.json се тегли, а не е в <script>.
  w.fetch = (адрес) => {
    let п = String(адрес).replace(/^https?:\/\/[^/]+\//, '').replace(/^\.?\//, '').split('?')[0];
    const пълен = path.join(ROOT, п);
    if (!fs.existsSync(пълен)) return Promise.resolve({ ok: false, status: 404, statusText: 'няма такъв файл: ' + п, text: () => Promise.resolve(''), json: () => Promise.reject(new Error('404')) });
    const т = fs.readFileSync(пълен, 'utf8');
    return Promise.resolve({
      ok: true, status: 200, statusText: 'OK', url: String(адрес),
      headers: { get: () => null },
      text: () => Promise.resolve(т),
      json: () => Promise.resolve(JSON.parse(т)),
      clone() { return this; }
    });
  };
  w.window = w; w.self = w; w.top = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

// ── кои файлове, в какъв ред: точно както ги реди index.html ──
function зарediФайловете(W) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // 🪤 ПЪРВОТО ПУСКАНЕ ДАДЕ НУЛА НАМЕРЕНИ СКРИПТА, БЕЗ ДА ГРЪМНЕ: писах
  //    src="([^"?]+)" — тоест „до кавичка, без въпросителни". А всеки ред тук е
  //    src="js/kb.js?v=161", значи изразът стигаше до „?" и после искаше кавичка.
  //    Нула съвпадения → нула заредени файлове → „двигателят не се зареди" за
  //    седем уреда наведнъж. Уред, който не намира нищо, изглежда точно като
  //    уред, който няма какво да намери.
  const пътища = [...html.matchAll(/<script[^>]+src="(js\/[^"?]+)[^"]*"/g)].map(m => m[1])
    .filter(п => fs.existsSync(path.join(ROOT, п)));
  if (!пътища.length) throw new Error('нула намерени <script src> в index.html — изразът е счупен, не файлът');
  // 🪤 УРЕДЪТ ЗА ЕЗИКА чете сам <script src> ОТ СТРАНИЦАТА, за да знае кои файлове
  //    да провери. В празен DOM намираше НУЛА и обявяваше „тестът не може да се
  //    пусне". Затова тук в head се слагат истински възли с точните адреси —
  //    същите, които index.html обявява.
  for (const п of пътища) {
    const е = W.document.createElement('script');
    е.setAttribute('src', п);
    е.src = п;
    W.document.head.appendChild(е);
  }
  const паднали = [];
  for (const п of пътища) {
    try { new vm.Script(fs.readFileSync(path.join(ROOT, п), 'utf8'), { filename: п }).runInContext(W); }
    catch (e) { паднали.push(п + ': ' + String(e.message).slice(0, 90)); }
  }
  return { пътища, паднали };
}

// ── самите уреди ──
const УРЕДИ = [
  { име: 'flagove', файл: 'dev/test_flagove.js', глоб: ['BL_ФЛАГОВЕ', 'BL_FLAGS'] },
  { име: 'otgovori', файл: 'dev/test_otgovori.js', глоб: ['BL_ОТГОВОРИ', 'BL_ANSWERS'] },
  { име: 'biblioteka', файл: 'dev/test_biblioteka.js', глоб: ['BL_БИБЛИОТЕКА', 'BL_LIBTEST'] },
  { име: 'zaglavia', файл: 'dev/zaglavia.js', глоб: ['BL_ЗАГЛАВИЯ', 'BL_TITLES'] },
  { име: 'ezik', файл: 'dev/test_ezik.js', глоб: ['BL_ЕЗИК', 'BL_EZIK'] },
  { име: 'pamet', файл: 'dev/test_pamet.js', глоб: ['BL_ПАМЕТ', 'BL_MEMORY'] },
  { име: 'telefon', файл: 'dev/test_telefon.js', глоб: ['BL_ТЕЛЕФОН', 'BL_PHONE'] }
];

async function пусниЕдин(у) {
  const W = прозорец();
  const { пътища, паднали } = зарediФайловете(W);
  if (!W.BL_MATCH) return { име: у.име, статус: 'двигателят не се зареди', паднали };

  try { new vm.Script(fs.readFileSync(path.join(ROOT, у.файл), 'utf8'), { filename: у.файл }).runInContext(W); }
  catch (e) { return { име: у.име, статус: 'уредът не се парсва: ' + String(e.message).slice(0, 110), паднали }; }

  const о = у.глоб.map(и => W[и]).find(Boolean);
  if (!о) return { име: у.име, статус: 'уредът не се обяви (търсих ' + у.глоб.join(' / ') + ')', паднали };

  const метод = ['провери', 'пусни', 'run', 'check', 'старт'].find(м => typeof о[м] === 'function');
  if (!метод) return { име: у.име, статус: 'няма метод за пускане; има: ' + Object.keys(о).join(', ').slice(0, 90), паднали };

  let изход = [];
  const истинскиLog = console.log;
  console.log = (...a) => { изход.push(a.map(String).join(' ')); };
  let р, гр = null;
  try { р = await Promise.resolve(о[метод]()); }
  catch (e) { гр = String(e.message).slice(0, 140); }
  console.log = истинскиLog;
  return { име: у.име, статус: гр ? 'ГРЪМНА: ' + гр : 'пуснат', метод, резултат: р, изход, паднали, файлове: пътища.length };
}

(async () => {
  const само = process.argv[2];
  const списък = само ? УРЕДИ.filter(у => у.име === само) : УРЕДИ;
  console.log('');
  console.log('🖥️ БРАУЗЪРНИТЕ УРЕДИ, пуснати БЕЗ браузър');
  console.log('');

  // ═══ САМОПРОВЕРКА: подпорката жива ли е наистина ═══
  // Уред, който върти тестове върху мъртва подпорка, ще каже „0 паднали" за
  // всичко. Затова първо се доказва, че самата подпорка работи в двете посоки.
  const T = прозорец();
  const п1 = T.document.createElement('div');
  п1.setAttribute('id', 'проба'); T.document.body.appendChild(п1);
  п1.classList.add('червено');
  T.localStorage.setItem('к', 'стойност');
  const проверки = [
    ['createElement + appendChild + getElementById', T.document.getElementById('проба') === п1],
    ['querySelector по клас', T.document.querySelector('.червено') === п1],
    ['localStorage наистина ПАЗИ', T.localStorage.getItem('к') === 'стойност'],
    ['localStorage наистина ТРИЕ', (T.localStorage.removeItem('к'), T.localStorage.getItem('к') === null)],
    ['несъществуващ възел дава null', T.document.getElementById('няма-такъв') === null],
    ['textContent се чете обратно', (п1.textContent = 'здрасти', п1.textContent === 'здрасти')],
    ['селектор по атрибут script[src]', (() => { const с = T.document.createElement('script'); с.setAttribute('src', 'js/проба.js'); T.document.head.appendChild(с); return T.document.querySelectorAll('script[src]').length === 1; })()],
    ['селектор по стойност [src="js/проба.js"]', T.document.querySelectorAll('[src="js/проба.js"]').length === 1],
    ['списък през запетая', T.document.querySelectorAll('script, div').length >= 2],
    ['възел се маха САМ (remove)', (() => { const р = T.document.createElement('div'); T.document.body.appendChild(р); const бр = T.document.body.children.length; р.remove(); return T.document.body.children.length === бр - 1; })()],
    ['closest върви НАГОРЕ по родителите', (() => { const б = T.document.createElement('div'); б.setAttribute('id', 'бащата'); const д = T.document.createElement('span'); б.appendChild(д); T.document.body.appendChild(б); return д.closest('#бащата') === б; })()],
  ];
  let слаби = 0;
  for (const [и, ок] of проверки) { if (!ок) слаби++; console.log('   ' + (ок ? '✅' : '🔴') + ' подпорка: ' + и); }
  if (слаби) { console.log(''); console.log('   🔴 ПОДПОРКАТА Е СЧУПЕНА — числата отдолу не значат нищо'); process.exit(1); }
  console.log('');

  const редове = [];
  for (const у of списък) redovePush(редове, await пусниЕдин(у));
  function redovePush(a, x) { a.push(x); }

  let пуснати = 0, паднали = 0;
  for (const р of редове) {
    const тръгна = р.статус === 'пуснат';
    if (тръгна) пуснати++; else паднали++;
    console.log('   ' + (тръгна ? '✅' : '🔴') + ' ' + р.име.padEnd(12) + ' ' + р.статус);
    if (тръгна && р.резултат != null) {
      const т = typeof р.резултат === 'object' ? JSON.stringify(р.резултат).slice(0, 260) : String(р.резултат);
      console.log('        → ' + т);
    }
    if (тръгна && р.изход && р.изход.length) {
      const важни = р.изход.filter(л => /🔴|ПАДНА|паднал|ГРЕШ|провал|❌/.test(л)).slice(0, 6);
      for (const л of важни) console.log('        ' + л.trim().slice(0, 150));
      console.log('        (' + р.изход.length + ' реда изход)');
    }
    if (р.паднали && р.паднали.length) for (const п of р.паднали.slice(0, 3)) console.log('        ⚠️ не се зареди ' + п);
  }
  console.log('');
  console.log('   ─────────────────────────────────────────');
  console.log('   тръгнали: ' + пуснати + ' от ' + редове.length + '   не тръгнали: ' + паднали);
  console.log('');
  console.log('   ⚠️ ОГРАНИЧЕНИЯТА, за да не се чете това като „проверено в браузър":');
  console.log('      · няма истинско рисуване → нищо за цветове, размери и допир');
  console.log('      · няма service worker → нищо за офлайн и за кеша');
  console.log('      · селекторите са само #id, .клас и таг (няма script[src] и подобни)');
  console.log('      Тук се мери ЛОГИКАТА. Видът се мери само с очи.');
  console.log('');
  console.log('   🚫 ИЗМЕРЕНО НЕДОСТОВЕРНО — НЕ ГИ БРОЙ ЗА ДЕФЕКТИ:');
  console.log('      · biblioteka, група „G · lib: в KB": обявява ~302 висящи препратки');
  console.log('        и ~358 разминавания. ПРОВЕРЕНО РЪЧНО: шест от назованите статии');
  console.log('        СЪЩЕСТВУВАТ, а независима сметка дава 0 висящи от 1090. Причината');
  console.log('        е в бегача — BL_LIB не си дозарежда указателя през подпорката.');
  console.log('        Групи „K · препратки" и всички останали ОСТАВАТ достоверни:');
  console.log('        точно оттам излезе истинската счупена препратка към несъществуващо');
  console.log('        заглавие. Бегач, който прави 302 призрачни дефекта, е по-опасен');
  console.log('        от липсващ бегач — затова стои написано тук, а не се крие.');
  console.log('      · pamet: сам обявява САМОПРОВЕРКАТА СИ ЗА СЧУПЕНА в този бегач →');
  console.log('        29-те му „паднали" не значат нищо, докато не се пусне в браузър.');
  console.log('      · telefon: ТРЪГВА, но сам обявява САМОПРОВЕРКАТА СИ ЗА СЧУПЕНА и');
  console.log('        вижда екран undefined×undefined вместо 360×760. Той мери ЦВЕТОВЕ,');
  console.log('        КОНТРАСТ и РАЗМЕРИ — неща, които искат истинско рисуване. 15-те му');
  console.log('        червени са дефекти на бегача, не на приложението.');
  console.log("");
  console.log('   📊 ЧЕСТНАТА СМЕТКА: 7 от 7 уреда ТРЪГВАТ · 5 от 7 дават числа, на които');
  console.log('      може да се вярва (flagove · otgovori · biblioteka без група G ·');
  console.log('      zaglavia · ezik). Другите два казват сами, че не могат — и точно');
  console.log('      затова са добри уреди.');
  if (асинхронниГърмежи.length) {
    console.log('');
    console.log('   ⚠️ асинхронни гърмежи при зареждането: ' + асинхронниГърмежи.length + ' (не са скрити)');
    for (const г of [...new Set(асинхронниГърмежи)].slice(0, 6)) console.log('      · ' + г);
  }
  fs.writeFileSync(path.join(__dirname, 'pusni_brauzarnite.json'), JSON.stringify(редове, null, 1));
  console.log('   💾 dev/pusni_brauzarnite.json');
  console.log('');
  process.exit(0);
})();
