// ═══════════════════════════════════════════════════════════
// 💍 ПРИЛАГА РЕШЕНИЯТА ЗА ОСИРОТЕЛИТЕ СТАТИИ
//
// Чете dev/siraci_*_reshenie.json (какво са решили отрядите) и НЕ вярва на
// нито един запис. Всяка двойка минава през пет врати:
//   1. СЪЩЕСТВУВА ЛИ СТАТИЯТА в lib/index.json
//   2. СЪЩЕСТВУВА ЛИ КАРТАТА в js/kb.js
//   3. СИРАК ЛИ Е ВСЪЩНОСТ — ако някой вече сочи към нея, не се пипа
//   4. НЕ ПОВЕЧЕ ОТ ТРИ нови статии на карта (четвъртата е струпване)
//   5. НЕ Е ЛИ ВЕЧЕ ТАМ
//
// 🪤 ЗАЩО ИЗОБЩО: полето `lib` беше ЕДИН низ. 604 карти, 147 свободни →
//    таванът беше 147, а сираците 490. Полето стана СПИСЪК (js/helper.js,
//    функция избериСтатия), а приложението показва ЕДНА статия — онази, която
//    най-добре пасва на точните думи на майката.
//
// ПУСКАНЕ: node dev/prilozhi_siraci.js --suho   (само показва)
//          node dev/prilozhi_siraci.js          (пише в js/kb.js)
// ПЪТ НАЗАД: js/kb.js.PREDI_SIRACI
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const АП = String.fromCharCode(39);
const СУХО = process.argv.indexOf('--suho') >= 0;
// 🪤 26.08, преразгледано: таванът беше срещу СТРУПВАНЕ НА ЕКРАНА — а такова
//    няма. Показва се ЕДНА статия, избрана по думите на майката (виж
//    избериСтатия в js/helper.js). Значи повече КАНДИДАТИ е строго по-добре,
//    стига всички да са по темата. Вдигнат на 6; 18 двойки бяха отказани
//    заради стария таван, макар да бяха верни.
const МАКС_НА_КАРТА = 6;

// ── решенията ──
const файлове = fs.readdirSync(__dirname).filter(f => /^siraci_.*_reshenie\.json$/.test(f));
if (!файлове.length) { console.log('🔴 няма нито един dev/siraci_*_reshenie.json'); process.exit(2); }
const решения = [];
for (const ф of файлове) {
  let ч;
  try { ч = JSON.parse(fs.readFileSync(path.join(__dirname, ф), 'utf8')); }
  catch (e) { console.log('🔴 ' + ф + ' не се парсва: ' + e.message); process.exit(2); }
  if (!Array.isArray(ч)) { console.log('🔴 ' + ф + ' не е списък'); process.exit(2); }
  for (const р of ч) решения.push({ ...р, откъде: ф });
}

// ── данните ──
const статии = new Map();
for (const а of (JSON.parse(fs.readFileSync(path.join(КОРЕН, 'lib/index.json'), 'utf8')).items || []))
  if (а && а.id) статии.set(а.id, а);
const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
new vm.Script(fs.readFileSync(path.join(КОРЕН, 'js/kb.js'), 'utf8')).runInContext(ctx);
const записи = ((ctx.BL_KB || ctx.KB) || {}).entries || [];
const карти = new Map(записи.map(z => [z.id, z]));
const снимка = JSON.stringify(записи);

const приети = new Map();   // id на карта → списък нови статии
const отказани = [];
for (const р of решения) {
  const с = String(р.statia || '').trim();
  const к = р.karta == null ? null : String(р.karta).trim();
  const откажи = защо => отказани.push({ с, к, защо });
  if (!с) { откажи('празно id на статия'); continue; }
  if (!к) continue;                                        // нарочно оставен сирак
  if (!статии.has(с)) { откажи('статията не съществува'); continue; }
  if (!карти.has(к)) { откажи('картата не съществува'); continue; }
  if (снимка.indexOf(с) >= 0) { откажи('статията вече е посочена отнякъде'); continue; }
  const досега = приети.get(к) || [];
  const вКартата = (() => { const l = карти.get(к).lib; return Array.isArray(l) ? l.length : (l ? 1 : 0); })();
  if (досега.length + вКартата >= МАКС_НА_КАРТА + 1) { откажи('картата вече има ' + (досега.length + вКартата) + ' статии'); continue; }
  if (досега.indexOf(с) >= 0) { откажи('повторена в решенията'); continue; }
  досега.push(с);
  приети.set(к, досега);
}

const общоПриети = [...приети.values()].reduce((с, x) => с + x.length, 0);
console.log('');
console.log('💍 ПРИЛАГАНЕ НА РЕШЕНИЯТА ЗА СИРАЦИТЕ');
console.log('');
console.log('  прочетени файла   : ' + файлове.length + '  (' + файлове.join(', ') + ')');
console.log('  прегледани записа : ' + решения.length);
console.log('  нарочно оставени сираци : ' + решения.filter(р => !р.karta).length);
console.log('  ✅ приети двойки   : ' + общоПриети + '   върху ' + приети.size + ' карти');
console.log('  🔴 отказани        : ' + отказани.length);
const поПричина = {};
for (const о of отказани) поПричина[о.защо] = (поПричина[о.защо] || 0) + 1;
for (const [к, n] of Object.entries(поПричина).sort((a, b) => b[1] - a[1]))
  console.log('       ' + String(n).padStart(3) + '  ' + к);
if (отказани.length) {
  console.log('');
  for (const о of отказани.slice(0, 8)) console.log('     ' + о.с + ' → ' + о.к + '  :  ' + о.защо);
}
console.log('');

if (СУХО) { console.log('  (сухо пускане — нищо не е записано)'); process.exit(0); }
if (!общоПриети) { console.log('  нищо за писане'); process.exit(0); }

// ── писане: полето lib става списък там, където трябва ──
const П = path.join(КОРЕН, 'js/kb.js');
fs.copyFileSync(П, П + '.PREDI_SIRACI');
let src = fs.readFileSync(П, 'utf8');
let сменени = 0, ненамерени = [];
for (const [ид, нови] of приети) {
  // намираме записа и с единични, и с двойни кавички (474 срещу 33 в този файл)
  let н = src.indexOf("id: '" + ид + "'");
  if (н < 0) н = src.indexOf('id: "' + ид + '"');
  if (н < 0) { ненамерени.push(ид); continue; }
  const краяНаЗаписа = src.indexOf('\n    },', н);
  const парче = src.slice(н, краяНаЗаписа < 0 ? н + 6000 : краяНаЗаписа);
  const мЕдин = парче.match(/lib:\s*'([^']+)'/);
  const мМасив = парче.match(/lib:\s*\[[^\]]*\]/);
  const стари = мМасив ? [...мМасив[0].matchAll(/'([^']+)'/g)].map(x => x[1])
              : (мЕдин ? [мЕдин[1]] : []);
  const всички = стари.concat(нови);
  const нов = 'lib: [' + всички.map(x => АП + x + АП).join(', ') + ']';
  let замяна = null;
  if (мМасив) замяна = мМасив[0];
  else if (мЕдин) замяна = мЕдин[0];
  if (замяна) {
    src = src.slice(0, н) + парче.replace(замяна, нов) + src.slice(н + парче.length);
  } else {
    // картата няма поле lib — слага се веднага след id
    const край = н + ("id: '" + ид + "'").length;
    src = src.slice(0, край) + ', ' + нов + src.slice(край);
  }
  сменени++;
}
fs.writeFileSync(П, src);
console.log('  💾 ЗАПИСАНО · пипнати карти: ' + сменени + (ненамерени.length ? ' · НЕНАМЕРЕНИ: ' + ненамерени.join(', ') : ''));
console.log('  ПЪТ НАЗАД: js/kb.js.PREDI_SIRACI');
console.log('  ⚠️ Сега пусни: node dev/bez_brauzar.js · node dev/siraci.js · node dev/test_lib_masiv.js');
console.log('');
