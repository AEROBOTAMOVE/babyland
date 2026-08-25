// ═══════════════════════════════════════════════════════════
// 🌊 СЛИВАЧЪТ НА НАЛИВАНЕТО — прибира написаното от dev/nahodki/naliv/
//
// ЗАЩО СЪЩЕСТВУВА: двайсет писаря пишат успоредно. Ако всеки пипаше
// lib/index.json и js/kb.js направо, щяха да се изтрият взаимно — това вече
// се е случвало в този проект. Затова всеки пише в СВОЙ файл, а тук един
// сливач ги прибира наведнъж.
//
// 🪤 ОТКАЗВА ДА ПИШЕ, когато:
//   · някой файл не е валиден JSON
//   · статия няма заглавие, стая или тяло
//   · заглавието СЪВПАДА със съществуващо (преповтаряне)
//   · стаята не е една от деветте
//   · след писането базата не се зарежда или брои по-малко от преди
//
// 🪤 И ЕДНО, КОЕТО МЕ Е ЛОВИЛО: прав знак за кавичка в текста чупи целия
//   JSON файл. Тук се ЗАМЕНЯ с българските „ … " вместо да се откаже —
//   но се БРОИ и се казва, за да се знае колко пъти е станало.
//
// ПУСКАНЕ: node dev/slej_naliv.js [--pisi]
//          без --pisi само показва какво БИ направил
// ПЪТ НАЗАД: прави .PREDI_NALIV_SLEJ копия на всичко, което пипа.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const ПИШИ = process.argv.includes('--pisi');
const ПАПКА = 'dev/nahodki/naliv';
const СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS',
  'Развитие и игри', 'Жената в мен', 'Дневник на мама', 'Инструменти', 'Лабораторията'];

// ── четем базата
const индекс = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const записи = индекс.items;
const заглавияСега = new Set(записи.map(x => норм(x.t)));
function норм(s) { return String(s || '').toLowerCase().replace(/[^а-яa-z0-9]+/g, ' ').trim(); }

// в кой файл живеят телата на всяка стая — питаме СЪЩЕСТВУВАЩИТЕ, не гадаем
const файлНаСтая = {};
for (const z of записи) {
  if (!z.r || !z.f) continue;
  файлНаСтая[z.r] = файлНаСтая[z.r] || {};
  файлНаСтая[z.r][z.f] = (файлНаСтая[z.r][z.f] || 0) + 1;
}
const домНаСтая = {};
for (const [стая, бр] of Object.entries(файлНаСтая)) {
  домНаСтая[стая] = Object.entries(бр).sort((a, b) => b[1] - a[1])[0][0];
}

// ── kb.js
function зарediKB(текст) {
  const ctx = { console: { log() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(текст).runInContext(ctx);
  return (ctx.BL_KB || ctx.KB);
}
let kbИзвор = fs.readFileSync('js/kb.js', 'utf8');
const KB = зарediKB(kbИзвор);
const kbЗаглавия = new Set(KB.entries.map(x => норм(x.title)));
const kbИдта = new Set(KB.entries.map(x => x.id));
const всичкиКлючове = new Map();
KB.entries.forEach(z => (z.keys || []).forEach(k => всичкиКлючове.set(k, z.id)));

// ── детерминиран идентификатор (без Math.random — да е повторим)
function ид(текст) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < текст.length; i++) {
    h1 = (h1 ^ текст.charCodeAt(i)) >>> 0; h1 = (h1 * 16777619) >>> 0;
    h2 = (h2 + текст.charCodeAt(i) * (i + 7)) >>> 0;
  }
  return 'lib-' + (h1.toString(16) + h2.toString(16)).slice(0, 8).padEnd(8, '0');
}
function kbИд(стая, заглавие) {
  const пре = { 'Бременност': 'nb', 'Моето бебе': 'nm', 'Захранване': 'nz', 'Здраве и SOS': 'ns',
    'Развитие и игри': 'nr', 'Жената в мен': 'nw', 'Дневник на мама': 'nd',
    'Инструменти': 'ni', 'Лабораторията': 'nl' }[стая] || 'nx';
  const б = норм(заглавие).split(' ').filter(Boolean).slice(0, 3)
    .map(w => w.replace(/[аеиоуъюя]/g, '').slice(0, 4)).join('');
  let к = пре + '-' + (б || 'nov');
  let n = 1; while (kbИдта.has(к)) { к = пре + '-' + (б || 'nov') + (++n); }
  kbИдта.add(к);
  return к;
}

// ── кавичките: правият знак чупи JSON и се среща постоянно
let оправениКавички = 0;
function кав(s) {
  if (typeof s !== 'string') return s;
  if (s.indexOf('"') < 0) return s;
  оправениКавички++;
  let навън = true;
  return s.replace(/"/g, () => { навън = !навън; return навън ? '“' : '„'; });
}

// ═══ ЧЕТЕНЕ НА НАЛЯТОТО ═══
if (!fs.existsSync(ПАПКА)) { console.log('🔴 няма папка ' + ПАПКА); process.exit(1); }
const файлове = fs.readdirSync(ПАПКА).filter(f => f.endsWith('.json')).sort();
console.log('🌊 СЛИВАЧЪТ НА НАЛИВАНЕТО\n');
console.log('  файлове от писарите: ' + файлове.length);

const отказ = [], приети = [];
let прегледани = 0;

for (const f of файлове) {
  let данни;
  try { данни = JSON.parse(fs.readFileSync(ПАПКА + '/' + f, 'utf8')); }
  catch (e) { отказ.push('🔴 ' + f + ' — счупен JSON: ' + e.message); continue; }
  if (!Array.isArray(данни)) { отказ.push('🔴 ' + f + ' — не е масив'); continue; }
  for (const x of данни) {
    прегледани++;
    const заг = String(x.zaglavie || '').trim();
    const стая = String(x.staya || '').trim();
    const тяло = String(x.tialo || '').trim();
    if (!заг) { отказ.push('🔴 ' + f + ' — статия без заглавие'); continue; }
    if (!СТАИ.includes(стая)) { отказ.push('🔴 ' + f + ' „' + заг.slice(0, 40) + '" — непозната стая „' + стая + '"'); continue; }
    if (тяло.length < 400) { отказ.push('🔶 ' + f + ' „' + заг.slice(0, 40) + '" — тяло само ' + тяло.length + ' знака, под прага 400'); continue; }
    if (!домНаСтая[стая]) { отказ.push('🔴 ' + f + ' — не знам в кой файл живее стая „' + стая + '"'); continue; }
    // 🔴 25.08 — ДЕФЕКТ В ТОЗИ СЛИВАЧ, намерен от писар и потвърден на живо.
    //   Тук стоеше `continue` при вече съществуващо заглавие — и така
    //   прескачаше НЕ САМО статията, а И ИЗГРАЖДАНЕТО НА КАРТАТА, което е
    //   по-надолу в същия ход. Резултат: писар донесе 6 статии, влязоха 6
    //   статии и само 5 КАРТИ. Липсващата беше „предпазването при кърмене".
    //   ЖИВАТА ЦЕНА, измерена:
    //       «мога ли да забременея докато кърмя» → „Срам ме е да кърмя пред хора"
    //       «овулация при кърмене»               → „Колко мляко трябва"
    //   И по-лошо: при ВТОРИ рън статията вече е в библиотеката, значи пак
    //   се отказва — и картата ѝ не се построява НИКОГА. Тих, самозаключващ
    //   се дефект.
    //   ЛЕКЪТ: дубликатът се маркира, но записът МИНАВА НАТАТЪК. По-долу
    //   тялото и индексът се пропускат, а картата се строи както винаги
    //   (тя си има СВОЯ проверка за повтарящо се заглавие).
    const дубликат = заглавияСега.has(норм(заг));
    if (дубликат) отказ.push('🔶 ' + f + ' „' + заг.slice(0, 40) + '" — статията ВЕЧЕ СЪЩЕСТВУВА (картата ѝ пак се проверява)');
    else заглавияСега.add(норм(заг));
    приети.push({ f, стая, заг, тяло: кав(тяло), x, дубликат });
  }
}

console.log('  прегледани статии  : ' + прегледани);
console.log('  ✅ приети          : ' + приети.length);
console.log('  ⛔ отказани        : ' + отказ.length);
if (оправениКавички) console.log('  „ поправени кавички: ' + оправениКавички + ' текста');

if (отказ.length) {
  console.log('\n  ── ОТКАЗАНИ ──');
  отказ.slice(0, 40).forEach(x => console.log('     ' + x));
  if (отказ.length > 40) console.log('     … още ' + (отказ.length - 40));
}

if (!приети.length) { console.log('\n  нищо за сливане.'); process.exit(0); }

// ═══ СГЛОБЯВАНЕ ═══
const телаЗаПисане = {};
const новиИндекс = [];
const новиКарти = [];
let картиОтказ = 0;

for (const p of приети) {
  const id = ид(p.стая + '|' + p.заг);
  const дом = домНаСтая[p.стая];
  // Дубликат: статията вече е в библиотеката, тялото и индексът се пропускат.
  // Картата обаче ПРОДЪЛЖАВА надолу — виж коментара при `дубликат` по-горе.
  if (!p.дубликат) {
    телаЗаПисане[дом] = телаЗаПисане[дом] || {};
    телаЗаПисане[дом][id] = p.тяло;
    новиИндекс.push({
      id, t: кав(p.заг), r: p.стая,
      e: String(p.x.emodzhi || '📖').slice(0, 4),
      s: кав(String(p.x.rezyume || '').trim()),
      k: кав(String(p.x.tarsene || '').trim()),
      g: '', p: 50, c: (String(p.x.emodzhi || '') + ' ' + p.заг).trim(), f: дом
    });
  }

  const k = p.x.karta;
  if (!k || !k.title || !k.core) continue;
  if (kbЗаглавия.has(норм(k.title))) { картиОтказ++; continue; }
  const ключове = (k.klyuchove || []).map(String)
    .filter(kk => kk.trim() && kk.indexOf("'") < 0 && !всичкиКлючове.has(kk));
  if (ключове.length < 3) { картиОтказ++; continue; }
  ключове.forEach(kk => всичкиКлючове.set(kk, '~нов'));
  kbЗаглавия.add(норм(k.title));
  новиКарти.push({
    id: kbИд(p.стая, k.title), room: p.стая, lib: id, keys: ключове,
    title: k.title, core: k.core, tip: k.tip || '', follow: k.follow || ''
  });
}

console.log('\n  📖 нови статии : ' + новиИндекс.length);
console.log('  🃏 нови карти  : ' + новиКарти.length + (картиОтказ ? '   (отказани ' + картиОтказ + ': повтарящо заглавие или под 3 свежи ключа)' : ''));
console.log('  по стаи:');
const пс = {}; новиИндекс.forEach(x => пс[x.r] = (пс[x.r] || 0) + 1);
Object.entries(пс).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('     ' + String(v).padStart(3) + '  ' + k));

if (!ПИШИ) { console.log('\n  (пробен ход — пусни с --pisi, за да запише)'); process.exit(0); }

// ═══ ПИСАНЕ ═══
const ПЕЧАТ = '.PREDI_NALIV_SLEJ';
fs.copyFileSync('lib/index.json', 'lib/index.json' + ПЕЧАТ);
fs.copyFileSync('js/kb.js', 'js/kb.js' + ПЕЧАТ);

for (const [дом, тела] of Object.entries(телаЗаПисане)) {
  const път = 'lib/' + дом;
  fs.copyFileSync(път, път + ПЕЧАТ);
  const стар = JSON.parse(fs.readFileSync(път, 'utf8'));
  Object.assign(стар, тела);
  fs.writeFileSync(път, JSON.stringify(стар, null, 1));
}
индекс.items = записи.concat(новиИндекс);
fs.writeFileSync('lib/index.json', JSON.stringify(индекс, null, 1));

if (новиКарти.length) {
  const редове = новиКарти.map(c => "    {\n" +
    "      id: '" + c.id + "', room: '" + c.room + "',\n" +
    "      lib: '" + c.lib + "',\n" +
    "      keys: [" + c.keys.map(k => "'" + k + "'").join(', ') + "],\n" +
    "      title: '" + c.title.replace(/'/g, '’') + "',\n" +
    "      core: '" + c.core.replace(/'/g, '’') + "',\n" +
    "      tip: '" + (c.tip || '').replace(/'/g, '’') + "',\n" +
    "      follow: '" + (c.follow || '').replace(/'/g, '’') + "'\n" +
    "    }").join(',\n');
  // вмъкваме преди затварянето на entries — питаме ПОСЛЕДНИЯ съществуващ запис
  const последен = KB.entries[KB.entries.length - 1].id;
  const мк = kbИзвор.lastIndexOf("id: '" + последен + "'");
  if (мк < 0) { console.log('🔴 не намирам последния запис — картите НЕ са добавени'); }
  else {
    const край = kbИзвор.indexOf('\n    }', мк);
    if (край < 0) { console.log('🔴 не намирам края на последния запис — картите НЕ са добавени'); }
    else {
      kbИзвор = kbИзвор.slice(0, край + 6) + ',\n' + редове + kbИзвор.slice(край + 6);
      let проба;
      try { проба = зарediKB(kbИзвор); } catch (e) { проба = null; console.log('🔴 kb.js не се зарежда след добавянето: ' + e.message); }
      if (проба && проба.entries.length === KB.entries.length + новиКарти.length) {
        fs.writeFileSync('js/kb.js', kbИзвор);
        console.log('  ✅ kb.js: ' + KB.entries.length + ' → ' + проба.entries.length + ' карти');
      } else if (проба) {
        console.log('🔴 записите станаха ' + проба.entries.length + ' вместо ' + (KB.entries.length + новиКарти.length) + ' — kb.js НЕ е пипнат');
      }
    }
  }
}

// ═══ ПАЗАЧ СЛЕД ПИСАНЕТО ═══
const после = JSON.parse(fs.readFileSync('lib/index.json', 'utf8')).items;
console.log('  ✅ библиотека: ' + записи.length + ' → ' + после.length + ' статии');
let безТяло = 0;
const домове = {};
for (const z of после) {
  if (!домове[z.f]) { try { домове[z.f] = JSON.parse(fs.readFileSync('lib/' + z.f, 'utf8')); } catch (e) { домове[z.f] = {}; } }
  if (!домове[z.f][z.id]) безТяло++;
}
console.log((безТяло ? '  🔴 ' : '  ✅ ') + 'записи без тяло: ' + безТяло);
console.log('\n  💾 ЗАПИСАНО.  ПЪТ НАЗАД: файловете с наставка ' + ПЕЧАТ);
console.log('  СЛЕДВАЩО: node dev/bez_brauzar.js  ·  node dev/pazach_kavichki.js');
