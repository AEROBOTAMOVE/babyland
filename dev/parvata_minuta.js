// ═══════════════════════════════════════════════════════════
// 🕐 ПЪРВАТА МИНУТА — целият онбординг, изигран в Node, без браузър
//
// Защо съществува (19.08): приложението се раздава с линк. Майка го отваря
// ВЕДНЪЖ. Досега първата минута беше проверявана на парчета — това поле,
// онзи ключ — но никога като ЕДНО пътуване: тур → онбординг → какво остана
// в localStorage → какво вижда после.
//
// Какво прави:
//   1. ЧЕТЕ истинската разметка на #onbOverlay от index.html (не измислена)
//      и БРОИ колко полета е видял. Числото се печата — мярка, която не
//      казва колко е гледала, не мери.
//   2. Прави мини-DOM само от тази разметка и пуска js/expect.js +
//      js/onboard.js в него.
//   3. Изиграва състоянията: „още чакам“ · родила · недоносено ·
//      пропуска всичко · след пауза (загуба) + капаните (дата в бъдещето,
//      термин в миналото, термин след 2 години, латиница, празно име).
//   4. За всяко: какво пише в localStorage и какво казват вратарите после
//      (BL_EXPECT.lmp / paused, BL_FIRSTDAY.бременна, кой екран „Днес“).
//
// 🪤 Ако пясъчникът гръмне — грешката се ПЕЧАТА и изходът е 1.
//    Уред, който дава зелено при мъртъв пясъчник, е по-лош от липсващ.
//
// ПУСКАНЕ:  node dev/parvata_minuta.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Не пипа нищо. Трие се безболезнено.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const R = s => fs.readFileSync(path.join(ROOT, s), 'utf8');

let ПАДНАЛИ = 0, ЗЕЛЕНИ = 0;
const ЧЕРВЕНО = [];
const ok = (t) => { ЗЕЛЕНИ++; console.log('   ✅ ' + t); };
const bad = (t) => { ПАДНАЛИ++; ЧЕРВЕНО.push(t); console.log('   ❌ ' + t); };

// ═══════════════ 1. МИНИ-DOM ═══════════════
// Точно толкова, колкото иска onboard.js. Нищо повече — по-голям DOM
// значи повече мои догадки, а догадка, която мълчи, е най-скъпата.
const VOID = new Set(['input', 'br', 'img', 'hr', 'use', 'meta', 'link', 'source', 'path']);

function El(tag) {
  const e = {
    tagName: String(tag || '').toUpperCase(),
    id: '', className: '', dataset: {}, attrs: {},
    children: [], parent: null,
    value: '', _text: '',
    hidden: false, max: '', min: '', type: '', title: '',
    style: {},
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
    appendChild(n) { n.parent = this; this.children.push(n); return n; },
    insertBefore(n, преди) {
      n.parent = this;
      const i = преди ? this.children.indexOf(преди) : -1;
      if (i < 0) this.children.push(n); else this.children.splice(i, 0, n);
      return n;
    },
    // 🪤 „afterend“ ще ползвам в самия онбординг — ако мини-DOM-ът го нямаше,
    //    поправката щеше да мине зелена тук и да гръмне в телефона на мама.
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
    get parentNode() { return this.parent; },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; },
    addEventListener(t, f) { (this._lst[t] = this._lst[t] || []).push(f); },
    removeEventListener() {},
    querySelectorAll(sel) { return всички(this).filter(n => мач(n, sel)); },
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; },
    closest(sel) { let n = this; while (n) { if (мач(n, sel)) return n; n = n.parent; } return null; },
    focus() {},
    // изстрелва с истинско балонче нагоре, както в браузъра
    _click(mishena) {
      const ev = { target: mishena || this, type: 'click', key: '', preventDefault() {}, stopPropagation() {} };
      let n = this;
      while (n) { (n._lst.click || []).forEach(f => f.call(n, ev)); n = n.parent; }
    }
  };
  // textContent и innerHTML са ЖИВИ — иначе querySelector не намира нищо,
  // построено с innerHTML, а точно така рисуват firstday.js и rooms2.js.
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
function всички(n, out) { out = out || []; n.children.forEach(c => { out.push(c); всички(c, out); }); return out; }
function мач(n, sel) {
  return String(sel).split(',').map(s => s.trim()).some(s => {
    if (s.startsWith('.')) return n._cls().includes(s.slice(1));
    if (s.startsWith('#')) return n.id === s.slice(1);
    return n.tagName === s.toUpperCase();
  });
}

// мъничък парсер: стига за един блок разметка, който сам съм извадил
function парсни(html) {
  const корен = El('root');
  const стек = [корен];
  const RX = /<(\/?)([a-zA-Z0-9]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = RX.exec(html))) {
    if (m[5] !== undefined) {                        // текст
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
      const стойност = a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : a[5] !== undefined ? a[5] : '';
      n.attrs[име] = стойност;
      if (име === 'id') n.id = стойност;
      else if (име === 'class') n.className = стойност;
      else if (име === 'hidden') n.hidden = true;
      else if (име === 'max') n.max = стойност;
      else if (име === 'type') n.type = стойност;
      else if (име === 'value') n.value = стойност;
      else if (име === 'placeholder') n.attrs.placeholder = стойност;
      else if (име.startsWith('data-')) n.dataset[име.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = стойност;
    }
    стек[стек.length - 1].appendChild(n);
    if (!сам) стек.push(n);
  }
  return корен;
}

// ═══════════════ 2. ИЗВАЖДАНЕ НА ИСТИНСКАТА РАЗМЕТКА ═══════════════
function извадиОнборда() {
  const html = R('index.html');
  const старт = html.indexOf('id="onbOverlay"');
  if (старт < 0) throw new Error('index.html: няма #onbOverlay — онбордингът е изчезнал или е преименуван');
  const отвор = html.lastIndexOf('<div', старт);
  // броим само <div…>/</div>, докато се затвори нашият
  let i = отвор, дълбочина = 0, край = -1;
  const RX = /<(\/?)div\b[^>]*>/g; RX.lastIndex = отвор;
  let m;
  while ((m = RX.exec(html))) {
    дълбочина += m[1] ? -1 : 1;
    if (дълбочина === 0) { край = m.index + m[0].length; break; }
  }
  if (край < 0) throw new Error('index.html: #onbOverlay не се затваря');
  return html.slice(отвор, край);
}

function makeStorage(начало) {
  const s = {};
  Object.entries(начало || {}).forEach(([k, v]) => { s[k] = String(v); });
  const def = (k, v) => Object.defineProperty(s, k, { value: v, enumerable: false });
  def('getItem', k => (Object.prototype.hasOwnProperty.call(s, k) ? String(s[k]) : null));
  def('setItem', (k, v) => { Object.defineProperty(s, k, { value: String(v), enumerable: true, writable: true, configurable: true }); });
  def('removeItem', k => { delete s[k]; });
  def('clear', () => { Object.keys(s).forEach(k => delete s[k]); });
  def('key', i => Object.keys(s)[i] || null);
  Object.defineProperty(s, 'length', { get: () => Object.keys(s).length, enumerable: false });
  return s;
}

// ═══════════════ 3. ПЯСЪЧНИК ═══════════════
function пясъчник(начало, файлове) {
  const корен = парсни(извадиОнборда());
  const дневник = { cheer: [], greet: 0, refresh: 0, helper: [], profile: 0, таймери: [] };

  const w = {};
  Object.assign(w, {
    console, Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent
  });
  // таймерите се събират, не се пускат сами — иначе тестът виси
  w.setTimeout = (f, ms) => { дневник.таймери.push({ f, ms }); return дневник.таймери.length; };
  w.clearTimeout = () => {};
  w.setInterval = () => 0; w.clearInterval = () => {};
  w.requestAnimationFrame = f => { дневник.таймери.push({ f, ms: 0 }); return 0; };
  w.localStorage = makeStorage(начало);
  w.CustomEvent = function (t, o) { return { type: t, detail: (o || {}).detail }; };

  const тяло = El('body'); тяло.style = {};
  const док = {
    documentElement: El('html'), body: тяло, head: El('head'),
    readyState: 'loading',
    createElement: t => El(t),
    getElementById: id => всички(корен).find(n => n.id === id) || null,
    querySelector: s => всички(корен).filter(n => мач(n, s))[0] || null,
    querySelectorAll: s => всички(корен).filter(n => мач(n, s)),
    _lst: {},
    addEventListener(t, f) { (док._lst[t] = док._lst[t] || []).push(f); },
    removeEventListener() {},
    dispatchEvent(ev) { (док._lst[ev.type] || []).forEach(f => f(ev)); return true; }
  };
  w.document = док;
  w.addEventListener = () => {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '', reload() {} };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;

  // съседите, които онбордингът пипа — записваме, не рисуваме
  w.BL_FX = { buzz() {}, confetti() {}, cheer(t) { дневник.cheer.push(String(t)); } };
  w.BL_GREET = () => { дневник.greet++; };
  w.BL_PROFILE = { refresh() { дневник.profile++; } };
  w.MamaHelper = { open(с) { дневник.helper.push(с); } };
  w.refreshToday = () => { дневник.refresh++; };

  (файлове || ['js/expect.js', 'js/onboard.js']).forEach(f => {
    new vm.Script(R(f), { filename: f }).runInContext(w);
  });
  док.readyState = 'complete';
  (док._lst.DOMContentLoaded || []).forEach(f => f({ type: 'DOMContentLoaded' }));

  return { w, док, корен, дневник, $: id => док.getElementById(id) };
}

// удобства за изиграване
const П = {
  отвори: s => s.w.BL_ONBOARD.open(),
  пол: (s, кой) => { const b = s.$('onbSex').querySelectorAll('.onb-sexbtn').find(x => x.dataset.sex === кой); if (!b) throw new Error('няма бутон за пол ' + кой); b._click(b); return b; },
  пиши: (s, id, v) => { const e = s.$(id); if (!e) throw new Error('няма поле ' + id); e.value = v; },
  готово: s => s.$('onbSave')._click(s.$('onbSave')),
  покъсно: s => s.$('onbSkip')._click(s.$('onbSkip')),
  склад: s => { const o = {}; Object.keys(s.w.localStorage).sort().forEach(k => { o[k] = s.w.localStorage.getItem(k); }); return o; }
};

const днес = new Date();
const дата = д => d2(new Date(днес.getTime() + д * 86400000));
function d2(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

// какво вижда после: същите въпроси, които задават rooms2.js / firstday.js
function следТова(s) {
  const L = s.w.localStorage;
  const baby = JSON.parse(L.getItem('bl_baby') || '{}');
  const пауза = L.getItem('bl_expect_paused') === '1';
  const суров = (L.getItem('bl_lmp') || '').replace(/^"|"$/g, '');
  const през = пауза ? '' : суров;                 // това вижда ОСТАНАЛОТО приложение
  let екран;
  if (baby.birth) екран = 'Днес по възраст (има рождена дата)';
  else if (през) екран = 'Карта „Седмица N 🤰“ + бутон „Отвори Бременност“';
  else екран = 'Приветствие „Здравей, мамо 🌸“ + „✨ Запознай ме с бебето“';
  return {
    име: baby.name || '(празно)', пол: baby.sex || '(няма)', рожден: baby.birth || '(няма)',
    'bl_lmp (суров)': суров || '(няма)',
    'вижда се от приложението': през || '(нищо)',
    пауза, недоносеност: L.getItem('bl_preterm') || '(няма)',
    'мама родена': (JSON.parse(L.getItem('bl_me') || '{}').birth) || '(няма)',
    онбордвана: L.getItem('bl_onboarded') === 'true', екран
  };
}

// текстът, който мама наистина вижда В КАРТАТА (не toast, който може да е заглушен)
function видимоСъобщение(s) {
  const n = s.$('onbSay');
  if (!n || n.hidden) return '';
  return (n.textContent || '').trim();
}

function печат(з, s, доп) {
  console.log('\n── ' + з + ' ' + '─'.repeat(Math.max(2, 58 - з.length)));
  const r = следТова(s);
  Object.entries(r).forEach(([k, v]) => console.log('   ' + (k + ' ').padEnd(30, '·') + ' ' + v));
  if (s.дневник.cheer.length) console.log('   ' + 'казано на глас ·'.padEnd(30, '·') + ' ' + s.дневник.cheer.join(' | '));
  const съоб = видимоСъобщение(s);
  if (съоб) console.log('   ' + 'пише в картата ·'.padEnd(30, '·') + ' ' + съоб);
  if (s.дневник.helper.length) console.log('   ' + 'води я в стая ·'.padEnd(30, '·') + ' ' + s.дневник.helper.join(', '));
  if (доп) доп(r, s);
  return r;
}

// ═══════════════════════════════════════════════════════════
console.log('═══ ПЪРВАТА МИНУТА — ' + d2(днес) + ' ═══');

let разметка;
try { разметка = извадиОнборда(); } catch (e) { console.log('💥 ' + e.message); process.exit(1); }

// ── ПРЕГЛЕДАНИ ПОЛЕТА (числото, което прави мярката проверима) ──
const дърво = парсни(разметка);
const въз = всички(дърво);
const полета = въз.filter(n => ['INPUT', 'SELECT', 'TEXTAREA'].includes(n.tagName));
const бутони = въз.filter(n => n.tagName === 'BUTTON');
const надписи = въз.filter(n => ['LABEL', 'H3', 'P'].includes(n.tagName));
console.log('\n📋 ПРЕГЛЕДАНИ ЕЛЕМЕНТИ НА ОНБОРДИНГА (от index.html, не от паметта ми)');
console.log('   полета за писане : ' + полета.length + '  → ' + полета.map(n => n.id || n.tagName).join(', '));
console.log('   бутони           : ' + бутони.length + '  → ' + бутони.map(n => (n.textContent || '').trim() || n.id).join(' | '));
console.log('   надписи/текстове : ' + надписи.length);
console.log('   ОБЩО ПРЕГЛЕДАНИ  : ' + (полета.length + бутони.length + надписи.length));
if (полета.length + бутони.length + надписи.length < 10) {
  console.log('   💥 под 10 елемента — парсерът е сляп, не вярвай на нищо по-долу');
  process.exit(1);
}

// всяко поле за писане казва ли КАКВО се иска (етикет или подсказка)?
console.log('\n📝 ВСЯКО ПОЛЕ ОБЯСНЕНО ЛИ Е');
полета.forEach(n => {
  const lbl = въз.find(x => x.tagName === 'LABEL' && (x.attrs.for === n.id || x.id === n.id + 'Lbl'));
  const текст = (lbl && lbl.textContent.trim()) || n.attrs.placeholder || '';
  const поЖелание = /по желание|ако искаш|не е задължител/i.test(текст);
  console.log('   ' + (n.id + ' ').padEnd(14, '·') + ' „' + текст.trim() + '“' + (поЖелание ? '   [по желание ✓]' : '   [не пише, че е по желание]'));
});

// етикетът на датата се сменя в JS (updateDateLbl) — четем го ЖИВ, в двете състояния
{
  console.log('\n📋 ЕТИКЕТЪТ НА ДАТАТА, ЖИВ (не от разметката)');
  const проба = (кой, з) => {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s); if (кой) П.пол(s, кой);
    const lbl = s.$('onbDateLbl').textContent.trim();
    const защо = (s.$('onbWhy') || { textContent: '' }).textContent.trim();
    console.log('   ' + (з + ' ').padEnd(14, '·') + ' „' + lbl + '“');
    console.log('   ' + ''.padEnd(14) + '   ↳ „' + (защо || '(нищо)') + '“');
    /по желание/i.test(lbl) ? ok(з + ': казваме, че датата е по желание') : bad(з + ': не пише, че датата е по желание → изглежда задължителна');
    защо ? ok(з + ': казваме какво ѝ дава датата') : bad(з + ': не казваме защо да я дава');
  };
  проба('girl', 'родила');
  проба('wait', 'чакаща');
}

// ═══════════════ СЪСТОЯНИЯТА ═══════════════
const РЕЗ = {};
try {

  // 1) ОЩЕ ЧАКАМ ─────────────────────────────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'wait');
    П.пиши(s, 'onbDate', дата(120));
    П.пиши(s, 'onbName', '');
    П.готово(s);
    const r = печат('1. ОЩЕ ЧАКАМ (термин след 120 дни)', s);
    РЕЗ.чакам = r;
    r['bl_lmp (суров)'] !== '(няма)' ? ok('очакваната дата пуска бременностната машина') : bad('очакваната дата се губи — приложението остава празно');
    s.$('onbPretermWrap').hidden ? ok('недоносеността е скрита за чакащата') : bad('питаме чакаща жена за гестационна седмица');
    /по желание/i.test(s.$('onbDateLbl').textContent) ? ok('надписът казва, че датата е по желание') : bad('надписът не казва, че датата е по желание');
  }

  // 2) РОДИЛА ────────────────────────────────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'girl');
    П.пиши(s, 'onbName', 'Мила');
    П.пиши(s, 'onbDate', дата(-90));
    П.готово(s);
    const r = печат('2. РОДИЛА (преди 90 дни, момиче „Мила“)', s);
    РЕЗ.родила = r;
    r.рожден !== '(няма)' ? ok('рождената дата се записва') : bad('рождената дата се губи');
    r.пол === 'girl' ? ok('полът се записва (кривите на СЗО са различни)') : bad('полът се губи');
  }

  // 3) НЕДОНОСЕНО ───────────────────────────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'boy');
    П.пиши(s, 'onbDate', дата(-40));
    П.пиши(s, 'onbPreterm', '32');
    П.готово(s);
    const r = печат('3. НЕДОНОСЕНО (32-ра седмица)', s);
    РЕЗ.недоносено = r;
    r.недоносеност === '32' ? ok('гестационната седмица се записва → коригирана възраст') : bad('недоносеността се губи: развитие/храни се мерят по грешна възраст');
  }

  // 4) ПРОПУСКА ВСИЧКО ──────────────────────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.покъсно(s);
    const r = печат('4. ПРОПУСКА ВСИЧКО („По-късно“)', s);
    РЕЗ.пропуска = r;
    r.онбордвана ? ok('не я питаме пак сама (bl_onboarded)') : bad('ще изскочи пак — досада');
    /Запознай ме/.test(r.екран) ? ok('има обратен път: приветствието на „Днес“ води до онбординга') : bad('няма обратен път към онбординга');
    s.$('onbOverlay').hidden ? ok('оверлеят се затваря') : bad('оверлеят остава отворен');
  }

  // 5) СЛЕД ПАУЗА (загуба) → НОВА БРЕМЕННОСТ ────────────────
  {
    const s = пясъчник({ bl_tour_done: '1', bl_onboarded: 'true', bl_expect_paused: '1', bl_lmp: '"2025-11-01"' });
    П.отвори(s);
    const прочетено = s.$('onbDate').value;
    П.пол(s, 'wait');
    П.пиши(s, 'onbDate', дата(150));
    П.готово(s);
    const r = печат('5. СЛЕД ПАУЗА (загуба) → въвежда НОВ термин', s);
    РЕЗ.пауза = r;
    прочетено === '' ? ok('паузата не пре-утвърждава спряната бременност в полето') : bad('полето ѝ показва старата бременност: „' + прочетено + '“');
    r['вижда се от приложението'] !== '(нищо)'
      ? ok('новият термин наистина пуска броенето')
      : bad('НОВИЯТ ТЕРМИН Е ЗАПИСАН, НО ПАУЗАТА ГО ГАСИ — нищо не се случва пред нея');
  }

  // 5б) ПАУЗАТА ТРЯБВА ДА ОЦЕЛЕЕ, ако тя не е поискала нищо ───
  // Обратната посока на поправка 5. Паузата е нейно решение; приложението
  // няма право да я вдига само защото е минала през онбординга.
  {
    const s = пясъчник({ bl_tour_done: '1', bl_onboarded: 'true', bl_expect_paused: '1', bl_lmp: '"2025-11-01"' });
    П.отвори(s);
    П.покъсно(s);
    const r = печат('5б. На пауза → натиска „По-късно“ (нищо не иска)', s);
    r.пауза ? ok('паузата ѝ стои — не я вдигаме сами') : bad('вдигнахме паузата на жена, която не е поискала нищо');
    r['bl_lmp (суров)'] !== '(няма)' ? ok('датата ѝ не е изтрита (паузата никога не трие)') : bad('изтрихме bl_lmp');
  }
  {
    const s = пясъчник({ bl_tour_done: '1', bl_onboarded: 'true', bl_expect_paused: '1', bl_lmp: '"2025-11-01"' });
    П.отвори(s); П.пол(s, 'girl'); П.пиши(s, 'onbDate', дата(-30)); П.готово(s);
    const r = печат('5в. На пауза → казва, че бебето е РОДЕНО', s);
    !r.пауза ? ok('паузата вече няма какво да пази → бутонът ѝ изчезва от настройките') : bad('в настройките остава „▶️ Пусни отново броенето“ пред мама с бебе на ръце');
    r.рожден !== '(няма)' ? ok('рождената дата се записва') : bad('рождената дата се губи');
  }

  // 6) КАПАН: рождена дата в бъдещето ───────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'girl');
    П.пиши(s, 'onbDate', дата(30));
    П.готово(s);
    const r = печат('6. КАПАН: рождена дата в БЪДЕЩЕТО (+30 дни)', s);
    !r.онбордвана ? ok('спираме записа и питаме') : bad('записахме бъдеща рождена дата — BL_AGE става null, апп-ът се държи, че няма бебе');
    видимоСъобщение(s) ? ok('казваме ѝ защо — В КАРТАТА, до полето') : bad('нищо не ѝ казваме — формата просто не реагира');
  }

  // 6б) СЪЩОТО, но мама е избрала тона „🫂 на ръба“ ─────────
  // firstday.js заглушава BL_FX.cheer за целия ден. Съобщение, което минава
  // само оттам, е невидимо точно за нея. Тук cheer е МЪРТЪВ нарочно.
  {
    const s = пясъчник({ bl_tour_done: '1' });
    s.w.BL_FX.cheer = () => {};                   // както го оставя „на ръба“
    П.отвори(s);
    П.пол(s, 'girl');
    П.пиши(s, 'onbDate', дата(30));
    П.готово(s);
    печат('6б. КАПАН: същото при заглушен BL_FX.cheer („на ръба“)', s);
    видимоСъобщение(s)
      ? ok('и при заглушен cheer жената вижда защо')
      : bad('при тона „на ръба“ грешката е НЕВИДИМА — формата мълчи и не записва');
  }

  // 7) КАПАН: термин ДЪЛБОКО в миналото ─────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'wait');
    П.пиши(s, 'onbDate', дата(-400));
    П.готово(s);
    const r = печат('7. КАПАН: очакван термин преди 400 дни', s);
    const lmp = r['вижда се от приложението'];
    const седм = lmp === '(нищо)' ? null : Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000));
    console.log('   ' + 'седмица, която ще види ·'.padEnd(30, '·') + ' ' + (седм === null ? '—' : седм));
    (седм === null || седм <= 45) ? ok('няма невъзможна седмица') : bad('ще ѝ покажем „седмица ' + седм + '“ — сгрешена година минава без дума');
  }

  // 8) КАПАН: термин след 2 години ──────────────────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'wait');
    П.пиши(s, 'onbDate', дата(730));
    П.готово(s);
    const r = печат('8. КАПАН: очакван термин след 730 дни', s);
    const lmp = r['вижда се от приложението'];
    const седм = lmp === '(нищо)' ? null : Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000));
    console.log('   ' + 'седмица, която ще види ·'.padEnd(30, '·') + ' ' + (седм === null ? '—' : седм));
    (седм === null || седм >= 0) ? ok('няма отрицателна седмица') : bad('отрицателна седмица (' + седм + ') — сгрешена година минава без дума');
  }

  // 8б) ГРАНИЦАТА В ДВЕТЕ ПОСОКИ ────────────────────────────
  // Пазач, изпитан само отвън, не е изпитан. Тук минаваме по ръба:
  // всичко, което приложението УМЕЕ да покаже (седмица 1–45), трябва да
  // мине; едно денонощие извън него — да спре. Ако някой ден се разминат,
  // това червено ще го хване преди мама.
  {
    console.log('\n── 8б. ГРАНИЦАТА на очакваната дата (в ДВЕТЕ посоки) ─────');
    let гр = 0, лошо = 0;
    for (const дни of [-60, -42, -41, -20, 0, 60, 200, 272, 273, 274, 400]) {
      const s = пясъчник({ bl_tour_done: '1' });
      П.отвори(s); П.пол(s, 'wait'); П.пиши(s, 'onbDate', дата(дни)); П.готово(s);
      const lmp = s.w.localStorage.getItem('bl_lmp');
      const прието = !!lmp;
      const w = прието ? Math.floor((Date.now() - new Date(JSON.parse(lmp))) / 604800000) : null;
      const трябва = дни >= -41 && дни <= 273;
      const вярно = прието === трябва && (!прието || (w >= 1 && w <= 45));
      if (вярно) гр++; else лошо++;
      console.log('   ОДР ' + String(дни).padStart(5) + ' дни → ' + (прието ? 'прието, седмица ' + w : 'спряно  ') +
        '   ' + (вярно ? '✓' : '✗ очаквах ' + (трябва ? 'да мине' : 'да спре')));
    }
    лошо ? bad('границата на термина се разминава с това, което приложението показва (' + лошо + ' от 11)')
         : ok('границата съвпада с показваното навсякъде (11 точки, двете посоки)');
  }

  // 9) КАПАН: латиница + само интервали в името ────────────
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'girl');
    П.пиши(s, 'onbName', '   ');
    П.пиши(s, 'onbDate', дата(-200));
    П.готово(s);
    const r = печат('9. КАПАН: име само от интервали', s);
    r.име === '(празно)' ? ok('интервалите се изчистват (иначе поздравът е „Здравей,    !“)') : bad('името остава „' + r.име + '“');
  }
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'boy');
    П.пиши(s, 'onbName', 'Alex');
    П.пиши(s, 'onbDate', дата(-200));
    П.готово(s);
    const r = печат('9б. КАПАН: латинско име', s);
    r.име === 'Alex' ? ok('латиницата се приема, без да се съди') : bad('латиницата се изяжда');
  }

  // 10) КАПАН: рождената дата на МАМА не бива да е в бъдещето
  {
    const s = пясъчник({ bl_tour_done: '1' });
    П.отвори(s);
    П.пол(s, 'wait');                       // чакаща → onbDate.max се изчиства
    const maxМама = s.$('onbMeDate').max;
    П.пиши(s, 'onbDate', дата(100));
    П.пиши(s, 'onbMeDate', дата(365));      // мама, родена догодина
    П.готово(s);
    const r = печат('10. КАПАН: рождена дата на МАМА в бъдещето', s);
    r['мама родена'] === '(няма)' ? ok('бъдеща дата за мама не се записва') : bad('записахме, че мама се ражда след година (' + r['мама родена'] + ') → хороскоп/число/таро на нероден човек');
    console.log('   ' + 'onbMeDate.max при чакаща ·'.padEnd(30, '·') + ' „' + maxМама + '“');
  }

  // 10б) СЪЩОТО за мама, която ВЕЧЕ е бременна и си отваря профила ─
  // Тук open() слага sex='wait' САМ, а updateDateLbl() изчиства max на
  // onbDate. Ако рожденият ден на мама си взима тавана назаем оттам,
  // остава без таван точно при бременната.
  {
    const s = пясъчник({ bl_tour_done: '1', bl_onboarded: 'true', bl_lmp: '"' + d2(new Date(днес.getTime() - 150 * 86400000)) + '"' });
    П.отвори(s);
    const мx = s.$('onbMeDate').max, дx = s.$('onbDate').max;
    console.log('\n── 10б. Бременна отваря профила: таваните ' + '─'.repeat(19));
    console.log('   ' + 'onbDate.max ·'.padEnd(30, '·') + ' „' + дx + '“ (правилно празно — терминът е напред)');
    console.log('   ' + 'onbMeDate.max ·'.padEnd(30, '·') + ' „' + мx + '“');
    мx === d2(днес) ? ok('рожденият ден на мама си има свой таван (не назаем)') : bad('onbMeDate.max е „' + мx + '“ — взет назаем от поле, чийто таван току-що е изчистен');
  }

  // 11) ПРЕВКЛЮЧВАНЕ чакам → роди се (известният капан) ─────
  {
    const s = пясъчник({ bl_tour_done: '1', bl_lmp: '"' + d2(new Date(днес.getTime() - 200 * 86400000)) + '"' });
    П.отвори(s);
    const предложено = s.$('onbDate').value;
    П.пол(s, 'girl');
    const следПревключване = s.$('onbDate').value;
    печат('11. Чакам → „Момиче“ (полето трябва да се изчисти)', s);
    console.log('   ' + 'предложена ОДР ·'.padEnd(30, '·') + ' ' + (предложено || '(празно)'));
    console.log('   ' + 'след превключване ·'.padEnd(30, '·') + ' ' + (следПревключване || '(празно)'));
    (предложено && !следПревключване) ? ok('очакваната дата не става рождена с едно докосване') : bad('очакваната дата остава в полето „Рождена дата“');
  }

} catch (e) {
  console.log('\n💥 ПЯСЪЧНИКЪТ ГРЪМНА — нищо по-горе не струва');
  console.log(e && e.stack || e);
  process.exit(1);
}

// ═══════════════ ПЪРВИЯТ ДЕН — НАИСТИНА ПУСНАТ ═══════════════
// Не грепване по изходния текст: зареждаме js/firstday.js и викаме
// BL_TODAY_BIND със същия контейнер, който му подава daily.js.
console.log('\n\n═══ ВТОРИ ВЪПРОС: КАКВО ВИЖДА В ПЪРВИЯ СИ ДЕН ═══');
function екранДнес(начало) {
  const s = пясъчник(начало, ['js/expect.js', 'js/firstday.js']);
  if (typeof s.w.BL_TODAY_BIND !== 'function') throw new Error('firstday.js не закачи BL_TODAY_BIND — пясъчникът е мъртъв');
  const контейнер = El('div');
  const вътре = El('div'); вътре.className = 'td-inner';
  контейнер.appendChild(вътре);
  const baby = JSON.parse(s.w.localStorage.getItem('bl_baby') || '{}');
  s.w.BL_TODAY_BIND(контейнер, baby, null);
  const карти = вътре.children.map(c => (c.className || c.tagName));
  return { s, вътре, карти };
}
try {
  const вчера = d2(new Date(днес.getTime() - 86400000));
  const общо = { bl_tour_done: '1', bl_onboarded: 'true', bl_baby: JSON.stringify({ name: 'Мила', sex: 'girl', birth: дата(-90) }) };

  const д1 = екранДнес(Object.assign({}, общо));
  console.log('\n── ДЕН 1 (само влязла, нула записи) ' + '─'.repeat(24));
  console.log('   картите в „Днес“ : ' + (д1.карти.join(' · ') || '(НИЩО)'));
  д1.вътре.children.forEach(c => console.log('     · ' + c.textContent.trim().slice(0, 120)));
  const имаДемо1 = д1.карти.some(c => /fd-demo/.test(c));
  const имаТон1 = д1.карти.some(c => /fd-tone/.test(c));
  const имаЗдр1 = д1.карти.some(c => /fd-hello/.test(c));
  имаЗдр1 ? ok('ден 1: посреща я тихо, без да иска нищо') : bad('ден 1: няма тих поздрав');
  имаТон1 ? ok('ден 1: има един въпрос, на който може да отговори') : bad('ден 1: няма нищо за докосване');
  имаДемо1 ? ok('ден 1: има какво да ПОГЛЕДНЕ (демото), не само празнина') : bad('ден 1: празен екран — нищо не показва за какво е приложението');

  // 🪤 bl_day1 се чете с JSON.parse. Първия път го подадох като гол низ
  //    '2026-08-24' → parse гърми → firstday.js записва ДНЕШНАТА дата и
  //    „ден 2“ се държеше като ден 1. Мярката лъжеше, не кодът.
  const д2 = екранДнес(Object.assign({}, общо, { bl_day1: JSON.stringify(вчера) }));
  console.log('\n── ДЕН 2 ' + '─'.repeat(51));
  console.log('   картите в „Днес“ : ' + (д2.карти.join(' · ') || '(НИЩО)'));
  const питаноД2 = (д2.вътре.querySelector('.fd-tq') || { textContent: '' }).textContent.trim();
  console.log('   тонът пита       : „' + питаноД2 + '“');
  /как да говорим/i.test(питаноД2) ? ok('ден 2: тонът обяснява какво прави отговорът') : bad('ден 2: тонът пита „' + питаноД2 + '“ — без карта, която да обясни защо');
  д2.карти.some(c => /fd-q30/.test(c)) ? ok('ден 2: въпросът 1/30 се появява') : bad('ден 2: въпросът 1/30 липсва');
  д2.карти.some(c => /fd-demo/.test(c)) ? ok('ден 2: демото се предлага') : bad('ден 2: демото липсва (имаДемоБутон() казва „не“ — виж колко bl_ ключа има)');

  // 🤰 бременната НЕ бива да получава демо с първи усмивки и лъжички
  const бр = екранДнес({ bl_tour_done: '1', bl_onboarded: 'true', bl_lmp: JSON.stringify(дата(-150)) });
  console.log('\n── ДЕН 1, БРЕМЕННА ' + '─'.repeat(41));
  console.log('   картите в „Днес“ : ' + (бр.карти.join(' · ') || '(нищо — рисува я rooms2.js)'));
  !бр.карти.some(c => /fd-demo/.test(c))
    ? ok('бременната не получава демо с храни и първи усмивки')
    : bad('на бременна предлагаме демо с лъжички и първо обръщане — чужд живот');

  // обещаният въпрос и показаният трябва да съвпадат
  const обещано = (д1.вътре.querySelector('.fd-small') || { textContent: '' }).textContent;
  const питано = (д1.вътре.querySelector('.fd-tq') || { textContent: '' }).textContent;
  console.log('\n   обещаваме : „' + обещано.trim() + '“');
  console.log('   а питаме  : „' + питано.trim() + '“');
  const дума = (обещано.match(/ако искаш:\s*([^“"]+?)\s*$/) || [])[1] || '';
  (!дума || питано.toLowerCase().includes(дума.toLowerCase().replace(/[?!.]/g, '')))
    ? ok('обещаният въпрос и показаният съвпадат')
    : bad('първият ден обещава „' + дума + '“, а показва друг въпрос: „' + питано.trim() + '“');
} catch (e) {
  console.log('\n💥 ПЯСЪЧНИКЪТ НА ПЪРВИЯ ДЕН ГРЪМНА');
  console.log(e && e.stack || e);
  process.exit(1);
}

// ═══════════════ РАВНОСМЕТКА ═══════════════
console.log('\n\n═══ РАВНОСМЕТКА ═══');
console.log('   ПРЕГЛЕДАНО: ' + полета.length + ' полета · ' + бутони.length + ' бутона · ' + надписи.length +
  ' надписа от index.html · 2 живи етикета · 15 изиграни състояния (вкл. 11 точки по границата на термина) · 3 екрана „Днес“');
console.log('   зелени : ' + ЗЕЛЕНИ);
console.log('   червени: ' + ПАДНАЛИ);
ЧЕРВЕНО.forEach(t => console.log('     ❌ ' + t));
if (ЗЕЛЕНИ + ПАДНАЛИ < 15) { console.log('   💥 под 15 проверки — уредът се е самоизключил някъде'); process.exit(1); }
process.exit(ПАДНАЛИ ? 1 : 0);
