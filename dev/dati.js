// ═══════════════════════════════════════════════════════════
// 📅 ДАТИТЕ, ВЪЗРАСТТА И СЪСТОЯНИЯТА — мярка без браузър
//
// КАКВО мери (три числа, всяко трябва да е 0):
//   1 · сблъсъци „две възрасти на един екран“ — банерът вика
//       „M-месечнина“, а възрастта до него пише „N дни“
//   2 · разминаване между текста на ваксинния ред и датата до него
//   3 · грешни посоки на „раждането гаси бременността“ — гаси ли, когато
//       трябва, и МЪЛЧИ ли, когато не трябва (пауза след загуба, второ
//       бебе на път, сбъркана дата)
//   + граничните: роден на 31-ви · 29 февруари · 00:30 и 23:59 ·
//     смяна на лятно/зимно време
//
// ЗАЩО съществува: и трите дефекта бяха НЕВИДИМИ за досегашните проверки —
// показват се само в определен ден от календара и само при определен профил.
// Тук денят и профилът се измислят, вместо да се чакат.
//
// ПУСКАНЕ:  node dev/dati.js                 → изход 1, ако нещо не е 0
//           node dev/dati.js --samoproverka  → връща поправките назад САМО
//           В ПАМЕТТА и иска от всяка мярка да почервенее (мярка, която не
//           може да гръмне, е нула)
//
// КАК работи: мъничък фалшив DOM (не рисува, само помни дървото) + vm
// пясъчник с ФАЛШИВО „сега“ и празен localStorage. Зареждат се истинските
// скриптове от index.html — не копия.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Не пипа нищо. Изтриваш го — нищо
// в приложението не се променя.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');


let ПРЕОБРАЗУВАТЕЛ = null;   // за самопроверката: връща поправките НАЗАД, само в паметта

function mkEl(tag) {
  const n = {
    tagName: String(tag || 'div').toUpperCase(),
    _cls: '', _html: '', _text: '',
    children: [], parent: null, attrs: {}, dataset: {},
    style: { setProperty(){}, getPropertyValue(){return '';}, removeProperty(){} },
    hidden: false, value: '', type: '', placeholder: '', maxLength: 0, id: '',
    classList: {
      add(...c) { c.forEach(x => { if (!n._cls.split(/\s+/).includes(x)) n._cls = (n._cls + ' ' + x).trim(); }); },
      remove(...c) { n._cls = n._cls.split(/\s+/).filter(x => x && !c.includes(x)).join(' '); },
      toggle(c, on) { if (on) n.classList.add(c); else n.classList.remove(c); },
      contains(c) { return n._cls.split(/\s+/).includes(c); }
    },
    appendChild(ch) { if (ch && ch._frag) { ch.children.forEach(x => n.appendChild(x)); return ch; } if (ch) { ch.parent = n; n.children.push(ch); } return ch; },
    append(...cs) { cs.forEach(c => n.appendChild(c)); },
    insertBefore(ch, ref) { return n.appendChild(ch); },
    after(...cs) { if (n.parent) cs.forEach(c => n.parent.appendChild(c)); },
    before(...cs) { if (n.parent) cs.forEach(c => n.parent.appendChild(c)); },
    insertAdjacentHTML() {}, insertAdjacentElement(p, c) { if (n.parent) n.parent.appendChild(c); return c; },
    removeChild(ch) { n.children = n.children.filter(x => x !== ch); return ch; },
    remove() { if (n.parent) n.parent.children = n.parent.children.filter(x => x !== n); },
    addEventListener() {}, removeEventListener() {},
    setAttribute(k, v) { n.attrs[k] = String(v); if (k === 'id') n.id = String(v); },
    getAttribute(k) { return k in n.attrs ? n.attrs[k] : null; },
    removeAttribute(k) { delete n.attrs[k]; },
    hasAttribute(k) { return k in n.attrs; },
    querySelector(sel) { return n.querySelectorAll(sel)[0] || null; },
    querySelectorAll(sel) { const out = []; walk(n, x => { if (x !== n && matches(x, sel)) out.push(x); }); return out; },
    closest() { return null; },
    focus() {}, blur() {}, click() {}, scrollIntoView() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
    animate() { return { finished: Promise.resolve(), cancel() {} }; },
    matches(sel) { return matches(n, sel); }
  };
  Object.defineProperty(n, 'className', { get: () => n._cls, set: v => { n._cls = String(v || ''); } });
  Object.defineProperty(n, 'innerHTML', { get: () => n._html, set: v => { n._html = String(v == null ? '' : v); n.children = []; } });
  Object.defineProperty(n, 'textContent', { get: () => n._text || stripTags(n._html), set: v => { n._text = String(v == null ? '' : v); n._html = ''; n.children = []; } });
  Object.defineProperty(n, 'firstChild', { get: () => n.children[0] || null });
  Object.defineProperty(n, 'childNodes', { get: () => n.children });
  Object.defineProperty(n, 'parentNode', { get: () => n.parent });
  return n;
}
function stripTags(h) { return String(h || '').replace(/<[^>]*>/g, ''); }
function walk(n, f) { (n.children || []).forEach(c => { f(c); walk(c, f); }); }
function matches(n, sel) {
  return String(sel).split(',').some(part => {
    part = part.trim();
    // взимаме само последната проста част (без комбинатори) — стига за броене
    const last = part.split(/\s+/).pop();
    const m = last.match(/^([a-zA-Z0-9]*)((?:[.#][\w-]+)*)(?:\[([\w-]+)(?:[\^$*]?=["']?([^\]"']*)["']?)?\])?$/);
    if (!m) return false;
    if (m[1] && n.tagName !== m[1].toUpperCase()) return false;
    const bits = (m[2] || '').match(/[.#][\w-]+/g) || [];
    for (const b of bits) {
      if (b[0] === '.' && !n.classList.contains(b.slice(1))) return false;
      if (b[0] === '#' && n.id !== b.slice(1)) return false;
    }
    if (m[3]) { if (!(m[3] in n.attrs)) return false; if (m[4] !== undefined && m[4] !== '' && n.attrs[m[3]] !== m[4]) return false; }
    return true;
  });
}

function tekst(n) {
  let s = stripTags(n._html || '') + ' ' + (n._text || '');
  (n.children || []).forEach(c => { s += ' ' + tekst(c); });
  return s.replace(/\s+/g, ' ').trim();
}



function zaredi(opt) {
  opt = opt || {};
  const nowMs = opt.now instanceof Date ? opt.now.getTime() : (opt.now ? new Date(opt.now).getTime() : Date.now());
  const store = new Map();
  // приложението пише през save() = JSON.stringify. Затова и тук всичко е JSON.
  // Ключове, писани със СУРОВ setItem (bl_expect_paused, bl_vax_schema) → opt.lsRaw.
  Object.keys(opt.ls || {}).forEach(k => store.set(k, JSON.stringify(opt.ls[k])));
  Object.keys(opt.lsRaw || {}).forEach(k => store.set(k, String(opt.lsRaw[k])));

  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(nowMs); else super(...a); }
    static now() { return nowMs; }
  }

  const body = mkEl('body');
  const document = {
    body,
    documentElement: mkEl('html'),
    createElement: mkEl,
    createTextNode: t => { const n = mkEl('span'); n.textContent = t; return n; },
    createDocumentFragment: () => { const n = mkEl('div'); n._frag = true; return n; },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    getElementById(id) { let r = null; walk(body, x => { if (x.id === id) r = r || x; }); return r; },
    querySelector(s) { return body.querySelector(s); },
    querySelectorAll(s) { return body.querySelectorAll(s); },
    readyState: 'complete', hidden: false, visibilityState: 'visible'
  };

  const w = {};
  Object.assign(w, {
    console, Math, JSON, RegExp, String, Number, Object, Array, Boolean, Error, Function,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    isNaN, isFinite, parseInt, parseFloat, TypeError, RangeError,
    Date: FakeDate,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    document,
    navigator: { userAgent: 'node', language: 'bg-BG', onLine: true, vibrate() {} },
    location: { href: 'http://localhost/', hash: '', search: '', pathname: '/' },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } },
    Event: class { constructor(t) { this.type = t; } },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear(),
      key: i => Array.from(store.keys())[i],
      get length() { return store.size; }
    },
    Storage: (function(){ function S(){} S.prototype.getItem=function(k){return store.has(k)?store.get(k):null;}; S.prototype.setItem=function(k,v){store.set(k,String(v));}; S.prototype.removeItem=function(k){store.delete(k);}; return S; })(), fetch: () => Promise.reject(new Error("без мрежа")),
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    performance: { now: () => 0 },
    alert() {}, confirm: () => true, scrollTo() {}, getComputedStyle: () => ({ getPropertyValue: () => '' })
  });
  w.window = w; w.self = w; w.globalThis = w; w.top = w;
  w._store = store;

  const ctx = vm.createContext(w);
  const t = opt.transform || ПРЕОБРАЗУВАТЕЛ || (s => s);
  (opt.files || ['js/data.js', 'js/expect.js', 'js/rooms2.js']).forEach(f => {
    const src = t(fs.readFileSync(path.join(ROOT, f), 'utf8'), f);
    try { new vm.Script(src, { filename: f }); } catch (e) { throw new Error('НЕ СЕ ПАРСВА ' + f + ': ' + e.message); }
    vm.runInContext(src, ctx, { filename: f });
  });
  return w;
}


// ─────────────────────────────────────────────────────────
// МЕРКИТЕ
// ─────────────────────────────────────────────────────────

const дн = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const БАЗА = zaredi({ now: '2026-08-19T09:00:00', files: ['js/data.js'] });

// целият списък скриптове от index.html, без трите, които стъпват на неща
// извън моя фалшив DOM (app/plavno/izvan_ekrana — рисуват, не смятат)
const ВСИЧКИ = [...fs.readFileSync(ROOT + '/index.html', 'utf8')
  .matchAll(/src="(js\/[^"?]+\.js)(?:\?[^"]*)?"/g)].map(m => m[1])
  .filter(f => fs.existsSync(ROOT + '/' + f))
  .filter(f => !/app\.js|plavno\.js|izvan_ekrana\.js/.test(f));

// ── 1 · ДВЕ ВЪЗРАСТИ НА ЕДИН ЕКРАН ────────────────────────────────
function празникДнес(birth, now) {
  const BL_DATE = БАЗА.BL_DATE;
  const nd = new Date(now);
  const к = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
  const b = new Date(birth);
  let ym = nd.getFullYear() * 12 + nd.getMonth() - (b.getFullYear() * 12 + b.getMonth());
  if (nd.getDate() < b.getDate()) ym--;
  let мес = null;
  [ym, ym + 1].forEach(м => { if (м >= 1 && к(BL_DATE.addMonths(birth, м)) === к(nd)) мес = м; });
  return мес;
}
function възрастНаЕкрана(now, birth) {
  const w = zaredi({ now, ls: { bl_baby: { name: 'Мира', sex: 'girl', birth } } });
  const root = mkEl('div');
  w.ROOM_FEATURES['Моето бебе'](root);
  const m = /е на\s+(\d+)\s+(дни|ден|месец|месеца)/.exec(tekst(root));
  return { текст: m ? m[0] : '?', число: m ? +m[1] : null, единица: m ? m[2] : '?' };
}
function тест1() {
  console.log('\n═══ 1 · ЕДИН ЕКРАН, ДВЕ ВЪЗРАСТИ ═══');
  const рождени = ['2026-01-31', '2026-03-31', '2026-05-31', '2026-08-31', '2024-02-29', '2026-01-30', '2026-01-29', '2026-01-15'];
  const часове = ['T00:30:00', 'T09:00:00', 'T23:59:00'];
  let сблъсъци = 0, прегледани = 0; const примери = [];
  рождени.forEach(birth => {
    for (let d = 1; d <= 800; d++) {
      const now = new Date(new Date(birth + 'T09:00:00').getTime() + d * 86400000);
      const мес = празникДнес(birth, now);
      if (!мес) continue;
      часове.forEach(ч => {
        const t = new Date(дн(now) + ч);
        if (!празникДнес(birth, t)) return;
        прегледани++;
        const екр = възрастНаЕкрана(t, birth);
        let лошо = false;
        if (екр.единица === 'дни' || екр.единица === 'ден') лошо = true;
        else if (екр.число !== мес && екр.число !== мес % 12) лошо = true;
        if (лошо) { сблъсъци++; if (примери.length < 8) примери.push('  ' + birth + ' → ' + дн(t) + ч + ': банер „' + мес + '-месечнина", възраст „' + екр.текст + '"'); }
      });
    }
  });
  console.log('  прегледани екрана С БАНЕР:', прегледани, '(ако е 0, мярката не е работила)');
  console.log('  сблъсъци (банер срещу възраст):', сблъсъци);
  if (!прегледани) { console.log('  🔴 НУЛА прегледани — числото 0 не значи нищо'); сблъсъци = -1; }
  примери.forEach(x => console.log(x));
  return сблъсъци;
}

// ── 2 · ВАКСИНИТЕ СРЕЩУ ДАТАТА ДО ТЯХ ─────────────────────────────
function тест2() {
  console.log('\n═══ 2 · ВАКСИНА: ТЕКСТ СРЕЩУ ДАТА ═══');
  const birth = '2026-01-15';
  const w = zaredi({ now: '2026-08-19T09:00:00', ls: { bl_baby: { name: 'Мира', sex: 'girl', birth } } });
  const root = mkEl('div');
  try { w.ROOM_FEATURES['Здраве и SOS'](root); } catch (e) {}
  const редове = root.querySelectorAll('.vx-row').map(r => tekst(r));
  let макс = 0;
  редове.forEach(t => {
    const дата = /≈\s*(\d+)\.(\d+)\.(\d+)/.exec(t);
    const сед = /(\d+)\s*-?\s*(?:та|ма|ва|ра)?\s*седмица/.exec(t);
    if (!дата || !сед) return;
    const d = new Date(+дата[3], +дата[2] - 1, +дата[1]);
    const b0 = new Date(2026, 0, 15);
    const денНаДатата = Math.round((d - b0) / 86400000);
    const от = (+сед[1] - 1) * 7, до = от + 6;       // „N-та седмица" = дни от..до
    const разлика = денНаДатата < от ? от - денНаДатата : денНаДатата > до ? денНаДатата - до : 0;
    макс = Math.max(макс, разлика);
    console.log('  ред: текст „' + сед[1] + '-та седмица" (дни ' + от + '–' + до + ') срещу дата на ден ' + денНаДатата + ' → ИЗВЪН с ' + разлика + ' дни');
  });
  console.log('  редове с ваксина:', редове.length, '· най-голямо разминаване:', макс, 'дни');
  return { макс, редове: редове.length };
}

// ── 3 · РАЖДАНЕТО СРЕЩУ БРЕМЕННОСТТА ──────────────────────────────
function бременнаСтая(ls, lsRaw, now) {
  const w = zaredi({ now, ls, lsRaw, files: ВСИЧКИ });
  const root = mkEl('div');
  try { w.ROOM_FEATURES['Бременност'](root); } catch (e) {}
  const t = tekst(root);
  const s = /[Сс]едмица\s+(\d+)/.exec(t);
  return { карти: root.querySelectorAll('.jr-card').length, седмица: s ? +s[1] : 0,
           lmpВиден: !!(w.BL_EXPECT && w.BL_EXPECT.lmp()), текст: t };
}
function тест3() {
  console.log('\n═══ 3 · РАЖДАНЕТО ГАСИ ЛИ БРЕМЕННОСТТА ═══');
  const now = '2026-08-19T09:00:00';
  const birth = '2026-08-18';
  const lmp = дн(new Date(new Date(birth).getTime() - 273 * 86400000));
  const lmp2 = дн(new Date(new Date(now).getTime() - 150 * 86400000));
  const сц = {
    'А) родила ВЧЕРА (дефектът)      ': [{ bl_baby: { name: 'Мира', sex: 'girl', birth }, bl_lmp: lmp }, {}],
    'Б) бременна, без бебе           ': [{ bl_lmp: lmp }, {}],
    'В) пауза след загуба            ': [{ bl_lmp: lmp }, { bl_expect_paused: '1' }],
    'Г) второ бебе на път (има 2-год)': [{ bl_baby: { name: 'Мира', sex: 'girl', birth: '2024-05-01' }, bl_lmp: lmp2 }, {}],
    'Д) само бебе, без бременност    ': [{ bl_baby: { name: 'Мира', sex: 'girl', birth } }, {}]
  };
  const из = {};
  Object.keys(сц).forEach(k => {
    const r = бременнаСтая(сц[k][0], сц[k][1], now);
    из[k[0]] = r;
    console.log('  ' + k + ' карти=' + String(r.карти).padStart(2) + ' седмица=' + String(r.седмица).padStart(2) + ' lmp се вижда=' + (r.lmpВиден ? 'ДА' : 'не'));
  });
  return из;
}


// Граничните случаи, поискани в задачата: роден на 31-ви · роден на 29 февруари
// · полунощ (00:30 и 23:59) · лятно/зимно време.

function екранГр(now, birth) {
  const w = zaredi({ now, ls: { bl_baby: { name: 'Мира', sex: 'girl', birth } } });
  const root = mkEl('div');
  w.ROOM_FEATURES['Моето бебе'](root);
  const t = tekst(root);
  const m = /е на\s+(\d+ (?:дни|ден|месеца|месец)(?: и \d+ (?:дни|ден))?)/.exec(t);
  const bd = new Date(birth), nd = new Date(now);
  const к = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
  let ym = nd.getFullYear() * 12 + nd.getMonth() - (bd.getFullYear() * 12 + bd.getMonth());
  if (nd.getDate() < bd.getDate()) ym--;
  let банер = null;
  [ym, ym + 1].forEach(м => { if (м >= 1 && к(БАЗА.BL_DATE.addMonths(birth, м)) === к(nd)) банер = м; });
  return { възраст: (m ? m[1] : '?').trim(), банер, бъдеще: /бъдещето/.test(t) };
}

const случаиГраници = [
  ['роден на 31-ви, къс месец',        '2026-01-31', '2026-02-28T09:00:00'],
  ['роден на 31-ви, полунощ 00:30',    '2026-01-31', '2026-02-28T00:30:00'],
  ['роден на 31-ви, 23:59',            '2026-01-31', '2026-02-28T23:59:00'],
  ['роден на 31-ви, ден по-късно',     '2026-01-31', '2026-03-01T09:00:00'],
  ['роден на 31-ви, 31-ви дълъг месец','2026-01-31', '2026-03-31T09:00:00'],
  ['29 февруари → невисокосна',        '2024-02-29', '2025-02-28T09:00:00'],
  ['29 февруари → високосна',          '2024-02-29', '2028-02-29T09:00:00'],
  ['29 февруари, месечнина в невис.',  '2024-02-29', '2024-03-29T09:00:00'],
  ['СМЯНА на лятно време (29.03)',     '2026-02-28', '2026-03-29T09:00:00'],
  ['СМЯНА на зимно време (25.10)',     '2026-09-25', '2026-10-25T09:00:00'],
  ['точно в деня на смяната, 03:30',   '2026-02-28', '2026-03-29T03:30:00'],
  ['роден ДНЕС, 00:30',                '2026-08-19', '2026-08-19T00:30:00'],
  ['роден ДНЕС, 23:59',                '2026-08-19', '2026-08-19T23:59:00'],
  ['роден вчера, 00:30',               '2026-08-18', '2026-08-19T00:30:00'],
  ['първи ден (1 ден, не „1 дни")',    '2026-08-18', '2026-08-19T09:00:00'],
  ['утре = бъдеще',                    '2026-08-20', '2026-08-19T09:00:00']
];


// В ДВЕТЕ ПОСОКИ: кога гасенето трябва да СРАБОТИ и кога трябва да МЪЛЧИ.
// Мери се какво остава в склада след зареждане на rooms2.js.
const now3 = '2026-08-19T09:00:00';

function следПосока(ls, lsRaw) {
  const w = zaredi({ now: now3, ls, lsRaw });
  return { lmp: w._store.get('bl_lmp') || null, архив: w._store.get('bl_lmp_rodeno') || null };
}

const случаиПосоки = [
  // [име, състояние, ОЧАКВАНО: гаси ли]
  ['родила вчера (една бременност)',        { bl_baby: { birth: '2026-08-18' }, bl_lmp: '2025-11-18' }, {}, true],
  ['родила преди 3 месеца',                 { bl_baby: { birth: '2026-05-19' }, bl_lmp: '2025-08-19' }, {}, true],
  ['раждане В СЪЩИЯ ден като началото',     { bl_baby: { birth: '2025-11-18' }, bl_lmp: '2025-11-18' }, {}, true],
  ['БРЕМЕННА, без бебе',                    { bl_lmp: '2025-11-18' }, {}, false],
  ['ПАУЗА след загуба (няма бебе)',         { bl_lmp: '2025-11-18' }, { bl_expect_paused: '1' }, false],
  ['ПАУЗА + по-голямо дете',                { bl_baby: { birth: '2024-05-01' }, bl_lmp: '2025-11-18' }, { bl_expect_paused: '1' }, false],
  ['второ бебе на път (има 2-годишно)',     { bl_baby: { birth: '2024-05-01' }, bl_lmp: '2026-03-22' }, {}, false],
  ['сбъркана рождена дата ПРЕДИ броенето',  { bl_baby: { birth: '2020-01-01' }, bl_lmp: '2025-11-18' }, {}, false],
  ['рождена дата в БЪДЕЩЕТО',               { bl_baby: { birth: '2026-12-01' }, bl_lmp: '2025-11-18' }, {}, false],
  ['празна рождена дата',                   { bl_baby: { birth: '' }, bl_lmp: '2025-11-18' }, {}, false],
  ['бебе, без никаква бременност',          { bl_baby: { birth: '2026-08-18' } }, {}, false]
];


function тестГраници() {
  console.log('\n═══ 4 · ГРАНИЧНИТЕ СЛУЧАИ ═══');
  let лоши = 0;
  случаиГраници.forEach(([име, birth, now]) => {
    const r = екранГр(now, birth);
    const дни = /дни|ден/.test(r.възраст);
    const конфликт = !!(r.банер && дни);
    if (конфликт) лоши++;
    console.log((конфликт ? '  🔴' : '  ✔ ') + ' ' + име.padEnd(34) + ' възраст: „' + r.възраст + '"' +
      (r.банер ? '  · банер: ' + r.банер + '-месечнина' : '') + (r.бъдеще ? '  · казва БЪДЕЩЕ' : ''));
  });
  console.log('  конфликти:', лоши);
  return лоши;
}

function тестПосоки() {
  console.log('\n═══ 5 · ГАСЕНЕТО В ДВЕТЕ ПОСОКИ ═══');
  let лоши = 0;
  случаиПосоки.forEach(([име, ls, lsRaw, очаквано]) => {
    const r = следПосока(ls, lsRaw);
    const угасена = r.lmp === null && !!ls.bl_lmp;
    const ок = угасена === очаквано;
    if (!ок) лоши++;
    console.log((ок ? '  ✔ ' : '  🔴') + ' ' + име.padEnd(38) +
      ' угасена=' + (угасена ? 'ДА ' : 'не ') + '(чакахме ' + (очаквано ? 'ДА' : 'не') + ')' +
      ' · архив=' + (r.архив ? 'има' : 'няма'));
  });
  console.log('  грешни посоки:', лоши, 'от', случаиПосоки.length);
  return лоши;
}


// ── САМОПРОВЕРКА: мярка, която не може да гръмне, е нула ──
// Връща трите поправки НАЗАД (само в паметта, файлът не се пипа) и иска
// от всяка мярка да ПОЧЕРВЕНЕЕ. Остане ли зелена — не мери каквото твърди.
// ПУСКАНЕ: node dev/dati.js --samoproverka
function върниДефектите(src, файл) {
  if (файл !== 'js/rooms2.js') return src;
  let s = src;
  // 1 · месеците пак по голия ден от календара
  s = s.replace('if (наДен(ym) > now) ym--;', 'if (now.getDate() < b.getDate()) ym--;');
  // 2 · закованата седмица се връща, изчислената се изключва
  s = s.replace(/d: 'първият прием след родилния дом[^']*'/, "d: 'около 6-та седмица — точния ден казва лекарят'");
  s = s.replace('if (v.m > 0 && v.m <= 4) {', 'if (false) {');
  // 3 · гасенето се обезсилва
  s = s.replace(/function гасиБременносттаПриРаждане\(\) \{/, 'function гасиБременносттаПриРаждане() { return false;');
  return s;
}

if (process.argv.includes('--samoproverka')) {
  ПРЕОБРАЗУВАТЕЛ = върниДефектите;
  console.log('🧪 САМОПРОВЕРКА: поправките са върнати НАЗАД в паметта.');
  const a = тест1(), b = тест2(), c = тест3(), d = тестГраници(), e = тестПосоки();
  const хванати = [['1 · възраст/банер', a > 0], ['2 · ваксина', b.макс > 0],
                   ['3 · бременност след раждане', c['А'].седмица > 0],
                   ['4 · гранични', d > 0], ['5 · посоки на гасенето', e > 0]];
  console.log('\n═══ САМОПРОВЕРКА ═══');
  хванати.forEach(([и, ок]) => console.log((ок ? '  ✅ хвана   ' : '  🔴 НЕ хвана') + ' ' + и));
  const пропуснати = хванати.filter(x => !x[1]).length;
  console.log(пропуснати ? '\n🔴 мярката не гърми за ' + пропуснати + ' от 5'
                         : '\n✅ и петте мерки гърмят, когато трябва');
  process.exit(пропуснати ? 1 : 0);
}

// ── общият край ───────────────────────────────────────────
const r1 = тест1();
const r2 = тест2();
const r3 = тест3();
const r4 = тестГраници();
const r5 = тестПосоки();

console.log('\n═══ РАВНОСМЕТКА ═══');
console.log('1 · сблъсъци възраст/банер   : ' + r1);
console.log('2 · разминаване ваксина      : ' + r2.макс + ' дни (' + r2.редове + ' реда)');
console.log('3 · родила вчера вижда       : ' + r3['А'].карти + ' бременни карти · „седмица ' + r3['А'].седмица + '"');
console.log('    контроли (не бива да мърдат): бременна ' + r3['Б'].карти + '/' + r3['Б'].седмица +
            ' · пауза ' + r3['В'].карти + '/' + r3['В'].седмица +
            ' · второ бебе ' + r3['Г'].карти + '/' + r3['Г'].седмица +
            ' · само бебе ' + r3['Д'].карти + '/' + r3['Д'].седмица);
console.log('4 · гранични конфликти       : ' + r4);
console.log('5 · грешни посоки на гасенето: ' + r5);

const паднали = r1 + r2.макс + r4 + r5 +
  (r3['А'].седмица ? 1 : 0) + (r3['Б'].седмица === 39 ? 0 : 1) + (r3['Г'].седмица === 21 ? 0 : 1);
console.log(паднали ? '\n🔴 ПАДА (' + паднали + ')' : '\n✅ ЧИСТО');
process.exit(паднали ? 1 : 0);
