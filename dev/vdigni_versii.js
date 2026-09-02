// ═══════════════════════════════════════════════════════════
// 🔢 ВДИГАНЕ НА ВЕРСИИТЕ — иначе поправката не стига до майката
//
// ЗАЩО: приложението е PWA с КЕШ-ПЪРВО по ТОЧЕН URL (sw.js). Кешът се
// разминава само ако URL-ът се различава — тоест само ако `?v=` е вдигнато.
// Пипна ли js/kb.js, без да пипна `kb.js?v=161` в index.html, върналата се
// майка получава СТАРИЯ файл. Мълчаливо. Без грешка. Тя вижда приложение
// отпреди поправката, а бъгът, който съм „оправил", продължава да ѝ се случва.
//
// 🔑 ДНЕС ТОВА СЕ ВИДЯ НА ЖИВО: браузърът упорито показваше 698 карти, докато
//    на диска бяха 699, и трябваше ръчно да разрегистрирам service worker-а и
//    да изтрия кеш „babyland-v598", за да видя собствената си работа.
//    Точно това ще се случи и на майка с инсталирано приложение.
//
// ПУСКАНЕ:
//   node dev/vdigni_versii.js            ← показва кое ще се вдигне
//   node dev/vdigni_versii.js --pishi    ← вдига го
// ПЪТ НАЗАД: index.html.PREDI_VERSII · sw.js.PREDI_VERSII
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ПИШИ = process.argv.includes('--pishi');
const ОТКОЛКО = process.argv.find(a => /^HEAD~\d+$/.test(a)) || 'HEAD~1';

// ── кои файлове са пипани ──
let пипнати = [];
try {
  пипнати = cp.execSync('git diff --name-only ' + ОТКОЛКО + ' HEAD', { encoding: 'utf8', cwd: ROOT })
    .split('\n').map(s => s.trim()).filter(f => /^(js|css)\/.+\.(js|css)$/.test(f));
} catch (e) { console.log('🔴 git diff не мина: ' + e.message.slice(0, 80)); process.exit(1); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

console.log('');
console.log('🔢 ВДИГАНЕ НА ВЕРСИИТЕ');
console.log('');
console.log('   пипнати файлове от ' + ОТКОЛКО + ': ' + пипнати.length);

// ═══ САМОПРОВЕРКА ═══
// Мярка, която не намира нито едно ?v=, би обявила „нищо за вдигане" и
// поправките просто нямаше да стигнат до никого.
const всичкиV = [...html.matchAll(/(js|css)\/([A-Za-z0-9_.-]+)\.(js|css)\?v=(\d+)/g)];
const проби = [
  ['index.html носи ?v= номера', всичкиV.length > 20],
  ['kb.js има номер', всичкиV.some(m => m[2] === 'kb')],
  ['измислен файл НЕ се намира', !всичкиV.some(m => m[2] === 'няма-такъв-xyz')]
];
let слаби = 0;
for (const [и, ок] of проби) { if (!ок) слаби++; console.log('   ' + (ок ? '✅' : '🔴') + ' ' + и); }
if (слаби) { console.log(''); console.log('   🔴 УРЕДЪТ Е СЛЯП'); process.exit(1); }
console.log('   намерени номера в index.html: ' + всичкиV.length);
console.log('');

// ── кои от пипнатите имат номер ──
const план = [];
const безНомер = [];
for (const ф of пипнати) {
  const име = ф.replace(/^(js|css)\//, '').replace(/\.(js|css)$/, '');
  const вид = ф.endsWith('.css') ? 'css' : 'js';
  const Р = new RegExp('(' + вид + '\\/' + име.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.' + вид + '\\?v=)(\\d+)');
  const m = html.match(Р);
  if (!m) { безНомер.push(ф); continue; }
  план.push({ ф, стар: Number(m[2]), нов: Number(m[2]) + 1, израз: Р });
}
console.log('   ще се вдигнат: ' + план.length);
for (const п of план) console.log('      ' + п.ф.padEnd(22) + ' v' + п.стар + ' → v' + п.нов);
if (безНомер.length) {
  console.log('');
  console.log('   ⚠️ БЕЗ НОМЕР В index.html: ' + безНомер.length + '  ← те се кешират по ИМЕ и НЕ могат да се обновят');
  for (const ф of безНомер) console.log('      ' + ф);
}

const cache = (fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/const CACHE = '([^']+)'/) || [])[1];
const num = Number((String(cache).match(/v(\d+)/) || [])[1]);
console.log('');
console.log('   кешът на service worker: ' + cache + '  →  babyland-v' + (num + 1));

if (!ПИШИ) {
  console.log('');
  console.log('   ⏸️  СУХО ПУСКАНЕ. За прилагане: node dev/vdigni_versii.js --pishi [HEAD~N]');
  console.log('');
  process.exit(0);
}

// ═══ ПИСАНЕ ═══
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(ROOT, 'index.html.PREDI_VERSII'));
fs.copyFileSync(path.join(ROOT, 'sw.js'), path.join(ROOT, 'sw.js.PREDI_VERSII'));
let нов = html;
for (const п of план) нов = нов.replace(п.израз, '$1' + п.нов);
fs.writeFileSync(path.join(ROOT, 'index.html'), нов);

let sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
sw = sw.replace(/const CACHE = '[^']+'/, "const CACHE = 'babyland-v" + (num + 1) + "'");
fs.writeFileSync(path.join(ROOT, 'sw.js'), sw);

// ── СВЕРКА от диска НАНОВО ──
const пак = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let ок = 0, зле = 0;
for (const п of план) {
  const m = пак.match(п.израз);
  if (m && Number(m[2]) === п.нов) ок++; else { зле++; console.log('   🔴 не се вдигна: ' + п.ф); }
}
const пакSW = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const новКеш = (пакSW.match(/const CACHE = '([^']+)'/) || [])[1];
console.log('');
console.log('   ✅ вдигнати ' + ок + ' от ' + план.length + (зле ? '   🔴 провалени ' + зле : ''));
console.log('   ' + (новКеш === 'babyland-v' + (num + 1) ? '✅' : '🔴') + ' кешът е ' + новКеш);
console.log('');
process.exit(зле ? 1 : 0);
