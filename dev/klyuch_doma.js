// ═══════════════════════════════════════════════════════════
// 🏠 НАМИРА ЛИ КЛЮЧЪТ СВОЯТА КАРТА — бърза извадка
//
// dev/mrytvi.js мери същото, но обхожда ВСИЧКИТЕ ~6000 ключа и трае минути.
// Този взима равномерна извадка от около 850 и отговаря за 20 секунди —
// достатъчно, за да се сравнят ДВЕ версии на подредбата една след друга,
// докато още помниш какво си сменил.
//
// ЗАЩО СЪЩЕСТВУВА: правех промяна в правилото за РАВЕН РЕЗУЛТАТ и ми трябваше
// мярка, която мога да пусна два пъти в рамките на един ход. Тя ОБОРИ
// промяната (виж коментара при `score > bestScore` в js/helper.js).
//
// 🪤 Извадката е РАВНОМЕРНА през целия списък, не първите N — иначе меря само
//   първите стаи. Стъпката се печата, за да се знае колко е гледано.
//
// ПУСКАНЕ: node dev/klyuch_doma.js [--spisak]
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const СПИСЪК = process.argv.includes('--spisak');
const S = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Downloads-----/' +
          'a78d0ad3-272e-4eb0-929e-dba161c5ab2a/scratchpad';

let zaredi;
try { zaredi = require('./pyasachnik.js').zaredi; }
catch (e) { console.log('🔴 няма пясъчник: ' + e.message); process.exit(1); }
const W = zaredi(null);
if (typeof W.BL_MATCH !== 'function') { console.log('🔴 няма BL_MATCH'); process.exit(1); }

const ctx = { console: { log() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
new vm.Script(fs.readFileSync('js/kb.js', 'utf8')).runInContext(ctx);
const KB = ctx.BL_KB || ctx.KB;

const проби = [];
for (const z of (KB.entries || [])) {
  for (const k of (z.keys || [])) {
    if (String(k).length < 4) continue;      // късите се съдят другаде
    проби.push([k, z.room, z.id]);
  }
}
if (проби.length < 100) { console.log('🔴 само ' + проби.length + ' ключа — нещо не е наред'); process.exit(1); }

const СТЪПКА = Math.max(1, Math.ceil(проби.length / 900));
let n = 0, свой = 0, чужд = 0, тишина = 0;
const примери = [];
for (let i = 0; i < проби.length; i += СТЪПКА) {
  const [k, стая, id] = проби[i];
  n++;
  let m = null;
  try { m = W.BL_MATCH(k, стая); } catch (e) {}
  const намерен = (m && (m.id || (m.entry && m.entry.id))) || null;
  if (намерен === id) { свой++; continue; }
  if (!намерен) тишина++; else чужд++;
  if (примери.length < (СПИСЪК ? 999 : 10)) примери.push('„' + k + '" на ' + id + ' → ' + (намерен || 'ТИШИНА'));
}

console.log('🏠 НАМИРА ЛИ КЛЮЧЪТ СВОЯТА КАРТА\n');
console.log('  ключове общо : ' + проби.length + '   (под 4 знака не се броят)');
console.log('  ПРЕГЛЕДАНИ   : ' + n + '   (равномерна извадка, стъпка ' + СТЪПКА + ')\n');
console.log('  ✅ намират СВОЯТА карта : ' + свой + '  (' + (100 * свой / n).toFixed(1) + '%)');
console.log('  🔴 отиват при ЧУЖДА     : ' + чужд + '  (' + (100 * чужд / n).toFixed(1) + '%)');
console.log('  🔇 тишина               : ' + тишина + '  (' + (100 * тишина / n).toFixed(1) + '%)');
if (примери.length) { console.log('\n  ── примери ──'); примери.forEach(x => console.log('     ' + x)); }
console.log('\n  Числото е СРАВНИТЕЛНО: пусни го преди и след промяна в подредбата.');
