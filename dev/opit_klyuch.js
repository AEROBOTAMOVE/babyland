// ═══════════════════════════════════════════════════════════
// 🧪 ОПИТ С КЛЮЧ — маха ключ от запис и мери ЦЯЛАТА щета и полза
//
// Защо: работилницата предложи 51 „махни ключ X от запис Y". Махането е
// опасната хирургия — ключът може да носи ВЕРНИ попадения другаде, които
// изчезват мълчаливо. Затова не се маха на доверие: маха се В ПАМЕТТА,
// мери се цялата база, и чак после се пипа файлът.
//
// Мери три неща наведнъж:
//   1. ПОЛЗА  — колко от 63-те сгрешени фрази тръгват към верния запис
//   2. ЩЕТА   — колко ключа, които ДОСЕГА намираха своя запис, спират
//   3. ЦЯЛОТО — общият брой мъртви ключове преди и след
//
// ПУСКАНЕ:
//   node dev/opit_klyuch.js --plan dev/nahodki/plan_klyuchove.json
//   node dev/opit_klyuch.js zd-cough "кашля"        (един ключ, на сухо)
//
// ПЪТ НАЗАД: НИЩО не се записва на диска. Само мери.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

function зареди(текстНаKB) {
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
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
  new vm.Script(текстНаKB, { filename: 'kb' }).runInContext(w);
  new vm.Script(fs.readFileSync('js/helper.js', 'utf8'), { filename: 'helper' }).runInContext(w);
  return w;
}

// пълна мярка: колко ключа НЕ намират своя запис
function мъртви(W) {
  const записи = W.KB.entries || W.KB.items || [];
  let пробвани = 0; const лоши = [];
  for (const з of записи) {
    for (const k of (з.keys || [])) {
      if (!k || k.length < 4) continue;
      пробвани++;
      let r = null;
      try { r = W.BL_MATCH(k, з.room); } catch (e) {}
      if (!r || r.id !== з.id) лоши.push(з.id + '|' + k);
    }
  }
  return { пробвани: пробвани, мъртви: лоши };
}

const арг = process.argv.slice(2);
let план;
if (арг[0] === '--plan') план = JSON.parse(fs.readFileSync(арг[1], 'utf8'));
else план = [{ запис: арг[0], махни: [арг[1]] }];

const суров = fs.readFileSync('js/kb.js', 'utf8');
const кав = String.fromCharCode(34);

// ── ПРЕДИ ──
const Преди = зареди(суров);
const п = мъртви(Преди);
console.log('🧪 ОПИТ С КЛЮЧОВЕ\n');
console.log('ПРЕДИ: пробвани ' + п.пробвани + ' · мъртви ' + п.мъртви.length);

// ── махаме в ПАМЕТТА ──
let нов = суров, махнати = 0;
for (const стъпка of план) {
  let i = нов.indexOf("id: '" + стъпка.запис + "'");
  if (i < 0) i = нов.indexOf('id: ' + кав + стъпка.запис + кав);
  if (i < 0) { console.log('⚠ няма запис ' + стъпка.запис); continue; }
  const k = нов.indexOf('keys:', i);
  if (k < 0 || k - i > 3000) { console.log('⚠ няма keys до ' + стъпка.запис); continue; }
  const л = нов.indexOf('[', k), д = нов.indexOf(']', л);
  const кл = [];
  for (const m of нов.slice(л + 1, д).matchAll(/'([^']*)'|"([^"]*)"/g))
    кл.push(m[1] !== undefined ? m[1] : m[2]);
  const остават = кл.filter(x => стъпка.махни.indexOf(x) < 0);
  if (остават.length === кл.length) { console.log('⚠ ' + стъпка.запис + ': нито един от ' + JSON.stringify(стъпка.махни) + ' не е там'); continue; }
  махнати += кл.length - остават.length;
  const цит = x => (x.indexOf("'") >= 0 ? кав + x + кав : "'" + x + "'");
  нов = нов.slice(0, л + 1) + остават.map(цит).join(', ') + нов.slice(д);
}
console.log('махнати ключа (в паметта): ' + махнати);

// ── СЛЕД ──
const След = зареди(нов);
const с = мъртви(След);
console.log('СЛЕД:  пробвани ' + с.пробвани + ' · мъртви ' + с.мъртви.length +
            '  (' + (с.мъртви.length - п.мъртви.length >= 0 ? '+' : '') +
            (с.мъртви.length - п.мъртви.length) + ')');

const бешеЛошо = new Set(п.мъртви), сегаЛошо = new Set(с.мъртви);
const оправени = [...бешеЛошо].filter(x => !сегаЛошо.has(x));
const счупени = [...сегаЛошо].filter(x => !бешеЛошо.has(x));
console.log('\n✅ ОПРАВЕНИ: ' + оправени.length);
оправени.slice(0, 30).forEach(x => console.log('    ' + x));
console.log('\n🔴 СЧУПЕНИ (работеха, вече не): ' + счупени.length);
счупени.slice(0, 30).forEach(x => console.log('    ' + x));
console.log('\nПРИСЪДА: ' + (счупени.length === 0 && оправени.length > 0
  ? '✅ чиста печалба — може да се приложи'
  : счупени.length ? '⚠ има щета — преценява се едно по едно' : 'нула ефект'));
