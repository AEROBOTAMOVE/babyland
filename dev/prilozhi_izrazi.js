// ═══════════════════════════════════════════════════════════
// ✍️ ПРИЛОЖИ ИЗРАЗИТЕ — сипва в kb.js ключовете, с които МАЙКАТА пише
//
// Защо: 35 карти имаха под 5 ключа. Съдържанието им е отлично (проверено на
// ръка), но не се стига. Отлична карта, която не се намира, е нула.
// Плюс три ГОЛИ ключа с доказана кражба:
//     «боли ме главата»            → Формата на главата (на бебето)
//     «вдигна се на ръце»          → Температурата
//     «кой крем за лице да ползвам»→ Кожата на бебето
//
// 🪤 ТОЗИ ФАЙЛ ОТКАЗВА ДА ПИШЕ, когато:
//   · ключът за махане не е там (не гадае)
//   · ключът за добавяне ВЕЧЕ СЪЩЕСТВУВА на ДРУГА карта — това не е дубликат
//     за подминаване, а двусмислие: два записа се бият за един и същ въпрос
//   · записът с това id не съществува
//   · след писането файлът не се зарежда
//
// ПУСКАНЕ: node dev/prilozhi_izrazi.js [--pisi]
//          без --pisi само показва какво БИ направил
// ПЪТ НАЗАД: js/kb.PREDI_IZRAZI.js се прави тук, преди всичко.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const ПИШИ = process.argv.includes('--pisi');
const план = JSON.parse(fs.readFileSync('dev/nahodki/plan_izrazi.json', 'utf8'));
let src = fs.readFileSync('js/kb.js', 'utf8');

// ── кой ключ на коя карта е сега (за да ловим двусмислията)
function зареди(текст) {
  const ctx = { console: { log() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(текст).runInContext(ctx);
  return (ctx.BL_KB || ctx.KB).entries;
}
const записи = зареди(src);
const чийКлюч = new Map();
записи.forEach(z => (z.keys || []).forEach(k => {
  if (!чийКлюч.has(k)) чийКлюч.set(k, []);
  чийКлюч.get(k).push(z.id);
}));
const поId = new Map(записи.map(z => [z.id, z]));

// ── намиране на реда `keys: [...]` вътре в записа с това id
function редътСКлючове(id) {
  const маркер = "id: '" + id + "'";
  const н = src.indexOf(маркер);
  if (н < 0) return null;
  const кн = src.indexOf('keys: [', н);
  if (кн < 0) return null;
  const кк = src.indexOf(']', кн);
  if (кк < 0) return null;
  // пазач: между id-то и keys не бива да има друго id (значи сме прескочили записа)
  if (src.slice(н + маркер.length, кн).indexOf("id: '") >= 0) return null;
  return { от: кн, до: кк + 1, текст: src.slice(кн, кк + 1) };
}

const отказ = [], сторено = [];

// ══ 1. МАХАНЕ ══
for (const м of (план.махни || [])) {
  const з = поId.get(м.id);
  if (!з) { отказ.push('няма запис ' + м.id); continue; }
  if (!(з.keys || []).includes(м.ключ)) { отказ.push('«' + м.ключ + '» вече го няма на ' + м.id); continue; }
  const р = редътСКлючове(м.id);
  if (!р) { отказ.push('не намирам реда с ключове на ' + м.id); continue; }
  const нови = з.keys.filter(k => k !== м.ключ);
  const нов = 'keys: [' + нови.map(k => "'" + k + "'").join(', ') + ']';
  src = src.slice(0, р.от) + нов + src.slice(р.до);
  з.keys = нови;
  сторено.push('🗑️  ' + м.id + '  −«' + м.ключ + '»   ' + м.защо);
}

// ══ 2. ДОБАВЯНЕ ══
let добавени = 0;
for (const [id, ключове] of Object.entries(план.добави || {})) {
  const з = поId.get(id);
  if (!з) { отказ.push('няма запис ' + id); continue; }
  const свежи = [];
  for (const k of ключове) {
    if (k.indexOf("'") >= 0) { отказ.push('апостроф в «' + k + '» — би счупил низа'); continue; }
    if ((з.keys || []).includes(k)) continue;                       // вече е тук
    const чужди = (чийКлюч.get(k) || []).filter(x => x !== id);
    if (чужди.length) { отказ.push('🔶 «' + k + '» вече е на ' + чужди.join(',') + ' — ДВУСМИСЛИЕ, не го слагам и на ' + id); continue; }
    свежи.push(k);
    чийКлюч.set(k, [id]);
  }
  if (!свежи.length) continue;
  const р = редътСКлючове(id);
  if (!р) { отказ.push('не намирам реда с ключове на ' + id); continue; }
  const нови = (з.keys || []).concat(свежи);
  const нов = 'keys: [' + нови.map(k => "'" + k + "'").join(', ') + ']';
  src = src.slice(0, р.от) + нов + src.slice(р.до);
  з.keys = нови;
  добавени += свежи.length;
  сторено.push('➕ ' + id + '  +' + свежи.length + ' ключа  (' + (нови.length - свежи.length) + '→' + нови.length + ')');
}

// ══ 3. ТЕКСТ ══
for (const т of (план.текст || [])) {
  const з = поId.get(т.id);
  if (!з) { отказ.push('няма запис ' + т.id); continue; }
  for (const поле of ['title', 'core', 'tip', 'follow']) {
    if (!(поле in т)) continue;
    if (т[поле].indexOf("'") >= 0) { отказ.push('апостроф в ' + поле + ' на ' + т.id); continue; }
    const маркер = "id: '" + т.id + "'";
    const н = src.indexOf(маркер);
    const пн = src.indexOf('\n      ' + поле + ": '", н);
    if (пн < 0) { отказ.push('не намирам поле ' + поле + ' на ' + т.id); continue; }
    const начало = пн + ('\n      ' + поле + ": '").length;
    const край = src.indexOf("',", начало);
    if (край < 0) { отказ.push('не намирам края на ' + поле + ' на ' + т.id); continue; }
    src = src.slice(0, начало) + т[поле] + src.slice(край);
    сторено.push('✏️  ' + т.id + '  ' + поле + ' пренаписано');
  }
}

// ══ ДОКЛАД ══
console.log('✍️  ИЗРАЗИТЕ НА МАЙКАТА\n');
сторено.forEach(x => console.log('  ' + x));
console.log('\n  ДОБАВЕНИ КЛЮЧА: ' + добавени + '   ·   ПИПНАТИ КАРТИ: ' +
            new Set(сторено.map(x => (x.match(/\s([a-z0-9-]{4,})\s/) || [])[1])).size);
if (отказ.length) {
  console.log('\n  ⛔ ОТКАЗАНИ (' + отказ.length + '):');
  отказ.forEach(x => console.log('     ' + x));
}

// ══ ПАЗАЧ: зарежда ли се още ══
let след;
try { след = зареди(src); }
catch (e) { console.log('\n🔴 НОВИЯТ ФАЙЛ НЕ СЕ ЗАРЕЖДА: ' + e.message + '\n   НИЩО НЕ Е ЗАПИСАНО.'); process.exit(1); }
if (след.length !== записи.length) { console.log('\n🔴 записите станаха ' + след.length + ' вместо ' + записи.length + ' — НИЩО НЕ Е ЗАПИСАНО.'); process.exit(1); }
const общоКлючове = след.reduce((s, z) => s + (z.keys || []).length, 0);
console.log('\n  ✅ файлът се зарежда · записи ' + след.length + ' · ключове общо ' + общоКлючове);

if (!ПИШИ) { console.log('\n  (пробен ход — пусни с --pisi, за да запише)'); process.exit(0); }
fs.copyFileSync('js/kb.js', 'js/kb.PREDI_IZRAZI.js');
fs.writeFileSync('js/kb.js', src);
console.log('\n  💾 ЗАПИСАНО.  ПЪТ НАЗАД: js/kb.PREDI_IZRAZI.js');
