// ═══════════════════════════════════════════════════════════
// 🧹 МЕТАЧКА — пробва всеки заподозрян ключ ПООТДЕЛНО и пази само
//    чистите печалби
//
// Шаблонът, който остана след ръчните поправки: ГОЛ ЕДНОСРИЧЕН КЛЮЧ на
// общ запис краде от точния. „секс" на общата статия прибира 11 чужди
// ключа; „плаче" на „Плачът" — 9; „сън/спи" на „Колко трябва да спи" — 7.
// Специалната карта („Секс при нормална бременност — кога лекарят казва
// не", „Плаче на гърдата", „Плаче насън") губи собствената си дума.
//
// Не се маха на око. За ВСЕКИ кандидат поотделно:
//   1. маха се В ПАМЕТТА
//   2. презарежда се цялата база и се пробва ВСЕКИ ключ на ВСЕКИ запис
//   3. брои се и ползата, и щетата
//   4. пази се САМО ако щетата е нула
// Накрая всички оцелели се пробват ЗАЕДНО — две поправки, всяка чиста
// поотделно, могат да си пречат.
//
// ПУСКАНЕ: node dev/metachka.js [брой-крадци]     (по подразбиране 12)
// Записва плана в dev/nahodki/plan_metachka.json — НЕ пипа js/kb.js.
//
// ПЪТ НАЗАД: не е нужен — нищо не се записва в проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

function зареди(текст) {
  const w = {};
  Object.assign(w, {
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
  });
  w.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 0 };
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
  new vm.Script(текст, { filename: 'kb' }).runInContext(w);
  new vm.Script(fs.readFileSync('js/helper.js', 'utf8'), { filename: 'helper' }).runInContext(w);
  return w;
}

function мъртви(W) {
  const записи = W.KB.entries || W.KB.items || [];
  const лоши = new Set();
  for (const з of записи)
    for (const k of (з.keys || [])) {
      if (!k || k.length < 4) continue;
      let r = null;
      try { r = W.BL_MATCH(k, з.room); } catch (e) {}
      if (!r || r.id !== з.id) лоши.add(з.id + '|' + k);
    }
  return лоши;
}

const кав = String.fromCharCode(34);
const цит = x => (x.indexOf("'") >= 0 ? кав + x + кав : "'" + x + "'");

function безКлюч(текст, запис, ключ) {
  let i = текст.indexOf("id: '" + запис + "'");
  if (i < 0) i = текст.indexOf('id: ' + кав + запис + кав);
  if (i < 0) return null;
  const k = текст.indexOf('keys:', i);
  if (k < 0 || k - i > 3000) return null;
  const л = текст.indexOf('[', k) + 1, д = текст.indexOf(']', л);
  const кл = [];
  for (const m of текст.slice(л, д).matchAll(/'([^']*)'|"([^"]*)"/g))
    кл.push(m[1] !== undefined ? m[1] : m[2]);
  if (кл.indexOf(ключ) < 0) return null;
  const остават = кл.filter(x => x !== ключ);
  return текст.slice(0, л) + остават.map(цит).join(', ') + текст.slice(д);
}

// ── започваме ──
const суров = fs.readFileSync('js/kb.js', 'utf8');
const База = зареди(суров);
const базово = мъртви(База);
console.log('🧹 МЕТАЧКА\n');
console.log('мъртви ключове в началото: ' + базово.size);

// кои записи крадат най-много
const крадци = {};
for (const з of (База.KB.entries || []))
  for (const k of (з.keys || [])) {
    if (!k || k.length < 4) continue;
    let r = null;
    try { r = База.BL_MATCH(k, з.room); } catch (e) {}
    if (r && r.id !== з.id) крадци[r.id] = (крадци[r.id] || 0) + 1;
  }
const колко = parseInt(process.argv[2] || '12', 10);
const топ = Object.entries(крадци).sort((a, b) => b[1] - a[1]).slice(0, колко);

// заподозрени: голите едносрични ключове на всеки крадец
const кандидати = [];
for (const [ид] of топ) {
  const з = (База.KB.entries || []).find(e => e.id === ид);
  if (!з) continue;
  for (const k of (з.keys || []))
    if (k && k.split(' ').length === 1 && k.length >= 4) кандидати.push({ запис: ид, ключ: k });
}
console.log('заподозрени голи ключа: ' + кандидати.length + ' в ' + топ.length + ' записа\n');

const чисти = [];
for (const c of кандидати) {
  const нов = безКлюч(суров, c.запис, c.ключ);
  if (!нов) continue;
  const сл = мъртви(зареди(нов));
  const оправени = [...базово].filter(x => !сл.has(x));
  const счупени = [...сл].filter(x => !базово.has(x) && x !== c.запис + '|' + c.ключ);
  const знак = счупени.length === 0 && оправени.length > 0 ? '✅' : (счупени.length ? '🔴' : '·');
  if (знак !== '·')
    console.log('  ' + знак + ' ' + c.запис.padEnd(22) + '„' + c.ключ + '"'.padEnd(14) +
                '  оправя ' + оправени.length + ' · чупи ' + счупени.length);
  if (счупени.length === 0 && оправени.length > 0) чисти.push(c);
}

console.log('\nчисти поотделно: ' + чисти.length);
if (!чисти.length) process.exit(0);

// ── и заедно ── две чисти поправки могат да си пречат
let заедно = суров;
for (const c of чисти) {
  const н = безКлюч(заедно, c.запис, c.ключ);
  if (н) заедно = н;
}
const сЗаедно = мъртви(зареди(заедно));
const опрЗ = [...базово].filter(x => !сЗаедно.has(x));
const счЗ = [...сЗаедно].filter(x => !базово.has(x) &&
  !чисти.some(c => x === c.запис + '|' + c.ключ));
console.log('ЗАЕДНО: мъртви ' + базово.size + ' → ' + сЗаедно.size +
            '  · оправени ' + опрЗ.length + ' · счупени ' + счЗ.length);
счЗ.slice(0, 20).forEach(x => console.log('    🔴 ' + x));

const план = {};
чисти.forEach(c => { (план[c.запис] = план[c.запис] || []).push(c.ключ); });
fs.writeFileSync('dev/nahodki/plan_metachka.json',
  JSON.stringify(Object.keys(план).map(з => ({ запис: з, махни: план[з] })), null, 1), 'utf8');
console.log('\nпланът е в dev/nahodki/plan_metachka.json');
console.log('ПРИСЪДА: ' + (счЗ.length === 0 ? '✅ може да се приложи целият' : '⚠ заедно чупят — прилагай подгрупи'));
