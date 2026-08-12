// ═══════════════════════════════════════════════════════════
// 🧹 МЕТАЧКА 2 — същото като dev/metachka.js, но по ГОТОВ план и
//    с честна сметка за ЗАГУБИТЕ, които първата версия не виждаше
//
// 🪤 КАКВО ПРОПУСКАШЕ ПЪРВАТА ВЕРСИЯ:
// Тя броеше „счупени" = ключове, които ДОСЕГА са намирали своя запис, а
// вече не. Но махнатият ключ ИЗЧЕЗВА от списъка — значи не се проверява
// изобщо. „0 счупени" не значеше „0 загуби".
// Хванах го само защото пуснах контролен въпрос на ръка: махнах „секс"
// от общата статия, мярката каза 0 счупени, а голото „секс" вече не
// намираше нищо.
// Затова тук ВСЕКИ махнат ключ се пробва ИЗРИЧНО след махането: къде
// отива сега? Ако никъде — това е загуба и се брои.
//
// ПУСКАНЕ: node dev/metachka2.js dev/nahodki/plan_sloi2.json
// Записва dev/nahodki/plan_chisti.json — НЕ пипа js/kb.js.
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
  return текст.slice(0, л) + кл.filter(x => x !== ключ).map(цит).join(', ') + текст.slice(д);
}

const план = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const суров = fs.readFileSync('js/kb.js', 'utf8');
const База = зареди(суров);
const базово = мъртви(База);
const стаяНа = {};
for (const з of (База.KB.entries || [])) стаяНа[з.id] = з.room;

console.log('🧹 МЕТАЧКА 2\n');
console.log('мъртви в началото: ' + базово.size);
const кандидати = [];
план.forEach(p => p.махни.forEach(k => кандидати.push({ запис: p.запис, ключ: k })));
console.log('кандидати: ' + кандидати.length + '\n');

const чисти = [];
for (const c of кандидати) {
  const нов = безКлюч(суров, c.запис, c.ключ);
  if (!нов) continue;
  const W = зареди(нов);
  const сл = мъртви(W);
  const оправени = [...базово].filter(x => !сл.has(x));
  const счупени = [...сл].filter(x => !базово.has(x) && x !== c.запис + '|' + c.ключ);

  // ⚠ ЧЕСТНАТА СМЕТКА: къде отива САМАТА махната дума сега?
  let къде = null;
  try { const r = W.BL_MATCH(c.ключ, стаяНа[c.запис] || ''); къде = r ? r.id : null; } catch (e) {}
  const загубена = !къде;

  if (оправени.length && !счупени.length && !загубена) {
    чисти.push(c);
    console.log('  ✅ ' + c.запис.padEnd(20) + '„' + c.ключ + '"' +
      ' '.repeat(Math.max(0, 14 - c.ключ.length)) + ' оправя ' + оправени.length +
      ' · думата отива при ' + къде);
  } else if (загубена && оправени.length) {
    console.log('  ⚠ ' + c.запис.padEnd(20) + '„' + c.ключ + '"' +
      ' '.repeat(Math.max(0, 14 - c.ключ.length)) + ' оправя ' + оправени.length +
      ' НО думата остава БЕЗ ОТГОВОР — пропускам');
  } else if (счупени.length) {
    console.log('  🔴 ' + c.запис.padEnd(20) + '„' + c.ключ + '" чупи ' + счупени.length);
  }
}

console.log('\nчисти поотделно: ' + чисти.length);
if (!чисти.length) process.exit(0);

let заедно = суров;
for (const c of чисти) { const н = безКлюч(заедно, c.запис, c.ключ); if (н) заедно = н; }
const Z = зареди(заедно);
const сЗ = мъртви(Z);
const опрЗ = [...базово].filter(x => !сЗ.has(x));
const счЗ = [...сЗ].filter(x => !базово.has(x) && !чисти.some(c => x === c.запис + '|' + c.ключ));
// и загубите заедно
const загубиЗ = чисти.filter(c => {
  let r = null; try { r = Z.BL_MATCH(c.ключ, стаяНа[c.запис] || ''); } catch (e) {}
  return !r;
});
console.log('ЗАЕДНО: мъртви ' + базово.size + ' → ' + сЗ.size +
            ' · оправени ' + опрЗ.length + ' · счупени ' + счЗ.length +
            ' · думи без отговор ' + загубиЗ.length);
счЗ.slice(0, 12).forEach(x => console.log('    🔴 ' + x));
загубиЗ.forEach(c => console.log('    ⚠ „' + c.ключ + '" остава без отговор'));

const добри = чисти.filter(c => !загубиЗ.some(z => z.запис === c.запис && z.ключ === c.ключ));
const план2 = {};
добри.forEach(c => { (план2[c.запис] = план2[c.запис] || []).push(c.ключ); });
fs.writeFileSync('dev/nahodki/plan_chisti.json',
  JSON.stringify(Object.keys(план2).map(з => ({ запис: з, махни: план2[з] })), null, 1), 'utf8');
console.log('\nпланът (без загубите): dev/nahodki/plan_chisti.json · ' +
            добри.length + ' ключа');
