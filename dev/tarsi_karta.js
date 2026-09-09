// Търсачка в базата — за да НЕ се пише нова карта, когато вече има такава.
// Основният закон на проекта: съдържанието почти винаги го има, липсват ДУМИТЕ.
//
//   node dev/tarsi_karta.js "напукани зърна"            → карти по дума
//   node dev/tarsi_karta.js --id mb-nokti               → цялата карта
//   node dev/tarsi_karta.js --pitaj "въпросът на мама" [стая]
//        → какво отговаря приложението ДНЕС (коя карта печели и слабо ли е)
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const ВСИЧКИ = KB.entries || [];

const арг = process.argv.slice(2);
const тяло = e => String(e.core || e.text || e.body || '').replace(/\s+/g, ' ');
const кл = e => (e.k || e.keys || []);

if (арг[0] === '--id') {
  const e = ВСИЧКИ.find(x => x.id === арг[1]);
  if (!e) { console.log('няма такава карта'); process.exit(1); }
  console.log('ID      : ' + e.id);
  console.log('СТАЯ    : ' + e.room);
  console.log('ЗАГЛАВИЕ: ' + (e.t || e.title || ''));
  console.log('ТЕКСТ   : ' + тяло(e));
  console.log('КЛЮЧОВЕ (' + кл(e).length + '):');
  кл(e).forEach(k => console.log('   · ' + k));
  process.exit(0);
}

if (арг[0] === '--pitaj') {
  const q = арг[1], стая = арг[2] || null;
  if (W.BL_SHAKEN && W.BL_SHAKEN(q)) { console.log('ТРЕВОГА: разтърсване'); process.exit(0); }
  const m = W.BL_MOTHERFLAG(q); if (m) { console.log('ТРЕВОГА: ' + m); process.exit(0); }
  if (W.BL_PREGFLAG(q, стая)) { console.log('ТРЕВОГА: preg'); process.exit(0); }
  if (W.BL_REDFLAG(q)) { console.log('ТРЕВОГА: red'); process.exit(0); }
  const k = W.BL_MATCH(q, стая);
  const слабо = W.BL_SLABO ? W.BL_SLABO() : '?';
  if (!k) { console.log('ТИШИНА'); process.exit(0); }
  console.log('печели : ' + k.id + '  [' + k.room + ']  ' + (слабо ? '⚠️ СЛАБО' : 'силно'));
  console.log('заглавие: ' + (k.t || k.title || ''));
  console.log('текст  : ' + тяло(k).slice(0, 400));
  process.exit(0);
}

const дума = арг.join(' ').toLowerCase().trim();
if (!дума) { console.log('подай дума, --id <карта> или --pitaj "въпрос" [стая]'); process.exit(2); }
const части = дума.split(/\s+/).filter(x => x.length > 2);
const оценени = ВСИЧКИ.map(e => {
  const хей = ((e.t || e.title || '') + ' ' + тяло(e) + ' ' + кл(e).join(' ')).toLowerCase();
  let т = 0;
  if (хей.indexOf(дума) >= 0) т += 10;
  части.forEach(ч => { if (хей.indexOf(ч) >= 0) т += 1; });
  const загл = String(e.t || e.title || '').toLowerCase();
  части.forEach(ч => { if (загл.indexOf(ч) >= 0) т += 3; });
  return { e, т };
}).filter(x => x.т > 0).sort((a, b) => b.т - a.т).slice(0, 12);

if (!оценени.length) { console.log('НИЩО. Такава карта вероятно НЯМА.'); process.exit(0); }
оценени.forEach(({ e, т }) => {
  console.log('\n[' + т + '] ' + e.id + '  [' + e.room + ']  ' + (e.t || e.title || ''));
  console.log('    ' + тяло(e).slice(0, 190));
  console.log('    ключове: ' + кл(e).slice(0, 8).join(' | '));
});
