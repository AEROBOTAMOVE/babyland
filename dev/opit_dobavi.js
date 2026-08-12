// ═══════════════════════════════════════════════════════════
// 🧪 ОПИТ С ДОБАВЯНЕ — добавя ключ към запис и мери щетата
//
// Огледалото на dev/opit_klyuch.js. Там махаме лаком ключ; тук добавяме
// липсващ. И двете могат да навредят, затова и двете се мерят еднакво:
// зареждаме цялата база В ПАМЕТТА, пробваме ВСЕКИ ключ на ВСЕКИ запис,
// и гледаме кой е спечелил и кой е загубил.
//
// Добавянето изглежда безобидно, но не е: нов къс ключ може да открадне
// от трети запис. Затова нищо не се пише, докато щетата не е нула.
//
// ПУСКАНЕ:
//   node dev/opit_dobavi.js --plan dev/nahodki/plan_dobavi.json
//   node dev/opit_dobavi.js zd-atopichen-dermatit "сърби"
//
// ПЪТ НАЗАД: НИЩО не се записва. Само мери.
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
else план = [{ запис: арг[0], добави: [арг[1]] }];

const суров = fs.readFileSync('js/kb.js', 'utf8');
const кав = String.fromCharCode(34);
const цит = x => (x.indexOf("'") >= 0 ? кав + x + кав : "'" + x + "'");

const Преди = зареди(суров);
const п = мъртви(Преди);
console.log('🧪 ОПИТ С ДОБАВЯНЕ\n');
console.log('ПРЕДИ: пробвани ' + п.пробвани + ' · мъртви ' + п.мъртви.length);

let нов = суров, добавени = 0;
const задачи = [];
for (const стъпка of план) {
  let i = нов.indexOf("id: '" + стъпка.запис + "'");
  if (i < 0) i = нов.indexOf('id: ' + кав + стъпка.запис + кав);
  if (i < 0) { console.log('⚠ няма запис ' + стъпка.запис); continue; }
  const k = нов.indexOf('keys:', i);
  if (k < 0 || k - i > 3000) { console.log('⚠ няма keys до ' + стъпка.запис); continue; }
  задачи.push({ л: нов.indexOf('[', k) + 1, д: нов.indexOf(']', нов.indexOf('[', k)), с: стъпка });
}
задачи.sort((a, b) => b.л - a.л);
for (const t of задачи) {
  const кл = [];
  for (const m of нов.slice(t.л, t.д).matchAll(/'([^']*)'|"([^"]*)"/g))
    кл.push(m[1] !== undefined ? m[1] : m[2]);
  const нови = кл.slice();
  for (const x of t.с.добави) if (нови.indexOf(x) < 0) { нови.push(x); добавени++; }
  if (нови.length === кл.length) continue;
  нов = нов.slice(0, t.л) + нови.map(цит).join(', ') + нов.slice(t.д);
}
console.log('добавени ключа (в паметта): ' + добавени);

const След = зареди(нов);
const с = мъртви(След);
console.log('СЛЕД:  пробвани ' + с.пробвани + ' · мъртви ' + с.мъртви.length +
            '  (' + (с.мъртви.length - п.мъртви.length >= 0 ? '+' : '') +
            (с.мъртви.length - п.мъртви.length) + ')');

const бешеЛошо = new Set(п.мъртви), сегаЛошо = new Set(с.мъртви);
const оправени = [...бешеЛошо].filter(x => !сегаЛошо.has(x));
// новодобавените ключове САМИ по себе си не се броят за щета, ако не намират себе си —
// това е нула ефект, не регресия. Щета е само нещо, което ПРЕДИ е работело.
const счупени = [...сегаЛошо].filter(x => !бешеЛошо.has(x))
  .filter(x => {
    const [ид, ключ] = x.split('|');
    const с2 = план.find(p => p.запис === ид);
    return !(с2 && с2.добави.indexOf(ключ) >= 0);
  });
console.log('\n✅ ОПРАВЕНИ: ' + оправени.length);
оправени.slice(0, 40).forEach(x => console.log('    ' + x));
console.log('\n🔴 СЧУПЕНИ (работеха, вече не): ' + счупени.length);
счупени.slice(0, 40).forEach(x => console.log('    ' + x));
console.log('\nПРИСЪДА: ' + (счупени.length === 0 && оправени.length > 0
  ? '✅ чиста печалба'
  : счупени.length ? '⚠ има щета' : 'нула ефект'));
