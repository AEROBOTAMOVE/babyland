// ═══════════════════════════════════════════════════════════
// „ КАВИЧКИТЕ — българска отваряща, затворена с ПРАВА
//
// В България кавичките са „ … " (U+201E … U+201C). В базата 364 двойки
// са отворени правилно и затворени с права машинописна " (U+0022).
// Майката го вижда: „не се СЪБУЖДА"  вместо  „не се СЪБУЖДА"
//
// 🪤 КАПАНЪТ, КОЙТО ЩЕШЕ ДА ИЗТРИЕ БИБЛИОТЕКАТА:
// в JSON вътрешната кавичка Е \" , а ГОЛАТА " е КРАЯТ НА НИЗА.
// Сляпа замяна на всяка " след „ би срязала низовете наполовина.
// Измерено ПРЕДИ да пипна каквото и да е:
//     js/kb.js    голи 204 · екранирани   0   → низовете са с апострофи
//     lib/*.json  голи   0 · екранирани 160   → всяка е вътрешна
// Тоест двата файла искат ДВА РАЗЛИЧНИ лека, а не един.
//
// ВТОРИЯТ КАПАН: обхватът да прескочи края на низа.
//     core: 'текст „да', tip: 'друго"'
// Затова между „ и затварящата НЕ СЕ ДОПУСКА нито делимитер, нито нов ред.
// По-добре пропусната поправка, отколкото счупен файл.
//
// ПУСКАНЕ:  node dev/kavichki.js          (само брои)
//           node dev/kavichki.js --pishi  (пише)
// ПЪТ НАЗАД: git checkout <sha> -- js/kb.js lib/
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const vm = require('vm');
process.chdir(path.resolve(__dirname, '..'));

const ПИШИ = process.argv.includes('--pishi');
const D = '„';   // „ отваряща
const C = '“';   // " затваряща (българска)

// ── kb.js: низовете са с апострофи → затварящата е ГОЛА "
//    забранени в обхвата: „ " ' \ и нов ред
const RE_KB = new RegExp(D + '([^' + D + C + '\'"\\\\\\n]{1,400})"', 'g');

// ── lib/*.json: всяка вътрешна кавичка е \" → махаме и чертата
//    забранени в обхвата: „ " \ и нов ред (наклонената черта значи escape)
const RE_JSON = new RegExp(D + '([^' + D + C + '"\\\\\\n]{1,400})\\\\"', 'g');

let общоKB = 0, общоJSON = 0;
const примери = [];

function поправи(път, re, замяна) {
  const преди = fs.readFileSync(път, 'utf8');
  let брой = 0;
  const след = преди.replace(re, function (цяло, вътре) {
    брой++;
    if (примери.length < 6) примери.push(път.replace(/\\/g, '/') + '  ' + (D + вътре + C).slice(0, 58));
    return D + вътре + замяна;
  });
  if (брой && ПИШИ) fs.writeFileSync(път, след, 'utf8');
  return { брой: брой, след: след, преди: преди };
}

// ═══ 1 · kb.js ═══
const r1 = поправи('js/kb.js', RE_KB, C);
общоKB = r1.брой;

// ═══ 2 · lib/*.json ═══
const джсън = [];
for (const f of fs.readdirSync('lib')) {
  if (!f.endsWith('.json') || /BAK|ARCHIVE/.test(f)) continue;
  const r = поправи('lib/' + f, RE_JSON, C);
  if (r.брой) джсън.push({ файл: 'lib/' + f, брой: r.брой, текст: r.след });
  общоJSON += r.брой;
}

console.log('„ КАВИЧКИТЕ\n');
console.log('  js/kb.js    : ' + общоKB);
console.log('  lib/*.json  : ' + общоJSON + '  в ' + джсън.length + ' файла');
console.log('  ОБЩО        : ' + (общоKB + общоJSON) + (ПИШИ ? '  ✍ ЗАПИСАНО' : '  (само броене — сложи --pishi)'));
console.log('\n  примери:');
примери.forEach(p => console.log('   ' + p));

if (!ПИШИ) process.exit(0);

// ═══ 3 · ПРОВЕРКАТА — без нея нищо не струва ═══
console.log('\n─── ПРОВЕРКА СЛЕД ЗАПИСА ───');
let зле = 0;

// kb.js трябва да се изпълнява и да дава същия брой записи/ключове
try {
  const текст = fs.readFileSync('js/kb.js', 'utf8');
  const ctx = { window: {}, document: { addEventListener: function () {} } };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(текст).runInContext(ctx);
  const kb = ctx.KB || ctx.window.KB;
  const записи = kb ? kb.length : 0;
  let ключове = 0;
  if (kb) kb.forEach(function (e) { ключове += (e.keys || []).length; });
  console.log('  kb.js се изпълнява ✅   записи: ' + записи + '   ключове: ' + ключове);
  if (записи !== 457) { console.log('  🔴 записите не са 457!'); зле++; }
} catch (e) {
  console.log('  🔴 kb.js НЕ СЕ ИЗПЪЛНЯВА: ' + e.message);
  зле++;
}

// всеки пипнат json трябва да се парсва и да пази броя си ключове
for (const j of джсън) {
  try {
    const д = JSON.parse(fs.readFileSync(j.файл, 'utf8'));
    const бр = Array.isArray(д) ? д.length : (д.items ? д.items.length : Object.keys(д).length);
    console.log('  ' + j.файл.padEnd(20) + 'JSON.parse ✅   единици: ' + бр + '   поправени: ' + j.брой);
  } catch (e) {
    console.log('  🔴 ' + j.файл + ' СЧУПЕН: ' + e.message);
    зле++;
  }
}

// не бива да е останала нито една права след „
const остатък = (function () {
  let n = 0;
  const re = new RegExp(D + '[^' + D + C + '\\n]{0,400}?"', 'g');
  const f = ['js/kb.js'].concat(джсън.map(x => x.файл));
  for (const p of f) { const m = fs.readFileSync(p, 'utf8').match(re); n += m ? m.length : 0; }
  return n;
})();
console.log('  остатък (права след „): ' + остатък);

console.log(зле ? '\n🔴 ' + зле + ' ПРОБЛЕМА — върни с git checkout' : '\n✅ ЧИСТО');
process.exit(зле ? 1 : 0);
