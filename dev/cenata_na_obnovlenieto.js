// 🔁 ТРЕТАТА МЯРКА: колко плаща ВЪРНАЛАТА СЕ майка.
//
// Първото сваляне е еднократно. Но кешът е „кеш-първо по ТОЧЕН URL" и всяка
// промяна вдига `?v=` — тоест при всяко обновяване майката тегли ЦЕЛИЯ
// kb.js наново. Днес го вдигнах шест пъти.
//
// Ако разцепването има смисъл, той е ТУК: по-малки парчета → по-малко
// теглене при обновяване. Затова се мери КОЛКО ОТ ФАЙЛА се мени наистина.
const { execSync } = require('child_process');
const zlib = require('zlib');
const fs = require('fs');
const кб = n => (n / 1024).toFixed(0) + ' КБ';
const gz = s => zlib.gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;

function версия(sha, път) {
  try { return execSync('git show ' + sha + ':' + път, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return null; }
}

// началото на деня и сега
const НАЧАЛО = process.argv[2] || 'b3458de';
const стар = версия(НАЧАЛО, 'js/kb.js');
const нов = fs.readFileSync('js/kb.js', 'utf8');
if (!стар) { console.log('🔴 не намирам стария kb.js при ' + НАЧАЛО); process.exit(2); }

console.log('');
console.log('🔁 ЦЕНАТА ЗА ВЪРНАЛАТА СЕ МАЙКА');
console.log('    kb.js в началото на деня (' + НАЧАЛО + '): ' + кб(gz(стар)) + ' gzip');
console.log('    kb.js сега                           : ' + кб(gz(нов)) + ' gzip');
console.log('    ⚠️ При обновяване тя тегли ЦЕЛИТЕ ' + кб(gz(нов)) + ', не разликата.');
console.log('');

// колко карти НАИСТИНА се смениха
const { zaredi } = require('./pyasachnik.js');
const сегашни = (zaredi(null).KB.entries || []);
fs.writeFileSync('dev/_star_kb.js', стар);
let стариКарти = [];
try { стариКарти = (zaredi(null, { kbPatch: () => стар }).KB.entries || []); } catch (e) { console.log('⚠️ старият kb.js не се зарежда в пясъчника: ' + e.message); }
fs.unlinkSync('dev/_star_kb.js');

if (стариКарти.length) {
  const п = new Map(стариКарти.map(e => [e.id, JSON.stringify(e)]));
  let нови = 0, сменени = 0, същите = 0;
  for (const e of сегашни) {
    const с = п.get(e.id);
    if (с === undefined) нови++;
    else if (с !== JSON.stringify(e)) сменени++;
    else същите++;
  }
  console.log('    ── КОЛКО ОТ БАЗАТА СЕ ПРОМЕНИ ЗА ЕДИН ДЕН ──');
  console.log('       карти в началото : ' + стариКарти.length);
  console.log('       карти сега       : ' + сегашни.length);
  console.log('       НОВИ             : ' + нови);
  console.log('       СМЕНЕНИ          : ' + сменени + '  (най-често само добавени ключове)');
  console.log('       НЕПИПНАТИ        : ' + същите + '  (' + (100 * същите / сегашни.length).toFixed(1) + '%)');
  console.log('');

  // ── ако беше разцепен по СТАЯ: колко щеше да се тегли ──
  const промененаСтая = new Set();
  for (const e of сегашни) { const с = п.get(e.id); if (с === undefined || с !== JSON.stringify(e)) промененаСтая.add(e.room); }
  const поСтаи = {};
  for (const e of сегашни) (поСтаи[e.room] = поСтаи[e.room] || []).push(e);
  let общоСтаи = 0, теглени = 0;
  const редове = [];
  for (const [стая, списък] of Object.entries(поСтаи)) {
    const текст = списък.map(x => JSON.stringify(x)).join('\n');
    const g = gz(текст);
    общоСтаи += g;
    const мени = промененаСтая.has(стая);
    if (мени) теглени += g;
    редове.push([стая, g, мени]);
  }
  console.log('    ── АКО БЕШЕ РАЗЦЕПЕН ПО СТАЯ (9 файла) ──');
  редове.sort((a, b) => b[1] - a[1]).forEach(([с, g, м]) => console.log('       ' + (м ? '🔁' : '  ') + ' ' + с.padEnd(20) + кб(g).padStart(9) + (м ? '   тегли се пак' : '   остава в кеша')));
  console.log('       ' + '─'.repeat(52));
  console.log('       общо деветте            ' + кб(общоСтаи).padStart(9));
  console.log('       ЩЕШЕ ДА СЕ ТЕГЛИ ДНЕС   ' + кб(теглени).padStart(9)
    + '   срещу ' + кб(gz(нов)) + ' сега');
  console.log('');
  const печалба = gz(нов) - теглени;
  console.log('       печалба при ДНЕШНОТО обновяване: ' + (печалба > 0 ? '−' : '+') + кб(Math.abs(печалба)));
  console.log('       ⚠️ Днес пипнах почти всяка стая. При обновяване, което');
  console.log('          пипа ЕДНА стая, печалбата е много по-голяма — но такъв');
  console.log('          ден трябва да се види, преди да се твърди.');
}
console.log('');
