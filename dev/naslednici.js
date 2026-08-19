// ═══════════════════════════════════════════════════════════
// 🧬 НАСЛЕДНИЦИТЕ — коя изтрита статия в коя е слята, ДОКАЗАНО по съдържание
//
// ЗАЩО: сливане на дубликати изтрива статии. Всяка карта, която е сочела към
// изтритата, увисва — майката натиска „прочети повече" и не отива никъде.
// Днес: 28 изтрити статии → 303 увиснали препратки.
//
// 🪤 ЗАЩО НЕ ПО ЗАГЛАВИЕ: „Колики, рефлукс и безкраен плач" има три кандидата
// с еднакво тегло. Заглавието е твърде кратко, за да реши. Затова тук се мери
// СЪДЪРЖАНИЕТО: слятата статия трябва да съдържа ИЗРЕЧЕНИЯТА на изтритата.
// Това не е предположение — това е следа, оставена от самото сливане.
//
// КАК: взима изтритото тяло от git, реже го на изречения над 40 знака, и
// пита коя ЖИВА статия съдържа най-много от тях. Дава и ПРОЦЕНТ на покритие,
// за да се вижда колко сигурен е изводът.
//
// ПУСКАНЕ: node dev/naslednici.js [--prilozhi]
//   без --prilozhi: само показва картата на наследниците
//   с --prilozhi:   пренасочва препратките в js/kb.js и в lib/
// ПЪТ НАЗАД: git checkout <sha> -- js/kb.js lib/
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
process.chdir(path.resolve(__dirname, '..'));

const ПРИЛОЖИ = process.argv.includes('--prilozhi');
const БАЗА = process.argv.find(a => /^[0-9a-f]{7,40}$/.test(a)) || 'HEAD';

const g = c => { try { return execSync(c, { encoding: 'utf8', maxBuffer: 1e9 }); } catch (e) { return ''; } };

// ── СЕГА
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const живиРедове = new Set((idx.items || []).map(x => x.id));
const тела = {}, файлНа = {};
for (const f of fs.readdirSync('lib')) {
  if (!f.endsWith('.json') || /BAK|ARCHIVE|index/.test(f)) continue;
  const d = JSON.parse(fs.readFileSync('lib/' + f, 'utf8'));
  for (const k in d) { тела[k] = String(d[k]); файлНа[k] = 'lib/' + f; }
}

// ── ПРЕДИ
const староТела = {};
for (const f of fs.readdirSync('lib')) {
  if (!f.endsWith('.json') || /BAK|ARCHIVE|index/.test(f)) continue;
  const сурово = g('git show ' + БАЗА + ':lib/' + f);
  if (!сурово) continue;
  let d; try { d = JSON.parse(сурово); } catch (e) { continue; }
  for (const k in d) староТела[k] = String(d[k]);
}
const староIdx = JSON.parse(g('git show ' + БАЗА + ':lib/index.json') || '{"items":[]}');
const стариЗагл = {}; (староIdx.items || []).forEach(x => стариЗагл[x.id] = x.t);

const изтрити = Object.keys(староТела).filter(k => !тела[k]);

function изречения(t) {
  return String(t).replace(/<[^>]*>/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length >= 40);
}

console.log('🧬 НАСЛЕДНИЦИТЕ\n');
console.log('  статии: ' + (староIdx.items || []).length + ' → ' + (idx.items || []).length);
console.log('  ИЗТРИТИ: ' + изтрити.length + '\n');
if (!изтрити.length) { console.log('  ✅ няма изтрити — няма какво да се пренасочва'); process.exit(0); }

const карта = {};
const живи = Object.keys(тела);
for (const ид of изтрити) {
  const изр = изречения(староТела[ид]);
  if (!изр.length) { карта[ид] = { към: null, покритие: 0, защо: 'няма достатъчно дълги изречения' }; continue; }
  let най = null, найБр = 0;
  for (const ж of живи) {
    const т = тела[ж];
    let бр = 0;
    for (const и of изр) if (т.indexOf(и) > -1) бр++;
    if (бр > найБр) { найБр = бр; най = ж; }
  }
  карта[ид] = { към: най, покритие: Math.round(100 * найБр / изр.length), общо: изр.length, съвпаднали: найБр };
}

const сигурни = [], несигурни = [];
for (const ид of изтрити) {
  const к = карта[ид];
  const ред = '  ' + ид + '  „' + String(стариЗагл[ид] || '').slice(0, 46) + '"\n' +
    '      → ' + (к.към || 'НЕ НАМЕРЕН') +
    (к.към ? '  „' + String((idx.items || []).find(x => x.id === к.към) || {}).slice(0, 0) : '') +
    '   покритие ' + к.покритие + '%  (' + (к.съвпаднали || 0) + ' от ' + (к.общо || 0) + ' изречения)';
  if (к.към && к.покритие >= 30) сигурни.push({ ид, ...к, ред }); else несигурни.push({ ид, ...к, ред });
}

console.log('✅ СИГУРНИ (покритие 30% и нагоре): ' + сигурни.length);
сигурни.forEach(x => console.log(x.ред));
console.log('\n🟠 НЕСИГУРНИ: ' + несигурни.length);
несигурни.forEach(x => console.log(x.ред));

// ── колко препратки увисват
const kb = fs.readFileSync('js/kb.js', 'utf8');
let увиснали = 0;
for (const ид of изтрити) {
  увиснали += (kb.split("lib: '" + ид + "'").length - 1) + (kb.split('lib: "' + ид + '"').length - 1);
  увиснали += (kb.split("'" + ид + "'").length - 1) - (kb.split("lib: '" + ид + "'").length - 1);
}
console.log('\n  УВИСНАЛИ ПРЕПРАТКИ в js/kb.js: ' + увиснали);

if (!ПРИЛОЖИ) { console.log('\n  (пусни с --prilozhi, за да ги пренасочи)'); process.exit(0); }

// ── ПРИЛАГАНЕ: само сигурните
let нов = kb, смени = 0;
for (const x of сигурни) {
  const преди = нов;
  нов = нов.split("'" + x.ид + "'").join("'" + x.към + "'");
  нов = нов.split('"' + x.ид + '"').join('"' + x.към + '"');
  if (нов !== преди) смени++;
}
new (require('vm').Script)(нов, { filename: 'kb.js' });
fs.writeFileSync('js/kb.js', нов, 'utf8');
console.log('\n  ✅ пренасочени в js/kb.js: ' + смени + ' изтрити id-та');

// и вътре в lib/
for (const f of fs.readdirSync('lib')) {
  if (!f.endsWith('.json') || /BAK|ARCHIVE/.test(f)) continue;
  let t = fs.readFileSync('lib/' + f, 'utf8');
  const старо = t;
  for (const x of сигурни) t = t.split(x.ид).join(x.към);
  if (t !== старо) { JSON.parse(t); fs.writeFileSync('lib/' + f, t, 'utf8'); console.log('  ✅ lib/' + f); }
}
console.log('\n  НЕСИГУРНИТЕ НЕ СА ПИПАНИ — те искат човешко око.');
