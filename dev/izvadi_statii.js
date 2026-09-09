// Изважда статиите от дневник на работилница в dev/nahodki/statii_<име>.json
//   node dev/izvadi_statii.js <journal.jsonl> <име>
const fs = require('fs');
const ДНЕВНИК = process.argv[2], ИМЕ = process.argv[3] || 'v2';
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай journal.jsonl'); process.exit(2); }

const статии = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = (typeof o.result === 'string') ? (() => { try { return JSON.parse(o.result); } catch (e) { return null; } })() : o.result;
  if (r && r.karta && r.body) статии.push(r);
  else if (r && Array.isArray(r.statii)) статии.push(...r.statii.filter(x => x && x.karta && x.body));
}
const виждан = new Set();
const уник = статии.filter(s => { if (виждан.has(s.karta)) return false; виждан.add(s.karta); return true; });

// ── дребните поправки, които гейтът иска, се правят ТУК, а не се оставят
//    на агента: прави кавички и апострофи, \r, интервали.
const ПРАВИ = /["'']/g;
let поправени = 0;
for (const s of уник) {
  const преди = s.body;
  s.body = String(s.body).replace(/\r/g, '');
  // права двойна кавичка → български „ и "; прав апостроф → „ и "
  s.body = s.body.replace(/"([^"]*)"/g, '„$1"').replace(/'([^']*)'/g, '„$1"');
  s.t = String(s.t).replace(ПРАВИ, '');
  s.s = String(s.s).replace(ПРАВИ, '').slice(0, 199);
  if (s.body !== преди) поправени++;
}

fs.mkdirSync('dev/nahodki', { recursive: true });
const път = 'dev/nahodki/statii_' + ИМЕ + '.json';
fs.writeFileSync(път, JSON.stringify(уник, null, 1));
console.log('статии: ' + статии.length + ' · уникални: ' + уник.length + ' → ' + път);
console.log('поправени кавички/CR в тялото: ' + поправени);
console.log('');
уник.forEach(s => {
  const думи = String(s.body).split(/\s+/).length;
  const раздели = (String(s.body).match(/^##\s/gm) || []).length;
  const бележки = [];
  if (думи < 220) бележки.push('ТЪНКА ' + думи);
  if (думи > 620) бележки.push('ДЪЛГА ' + думи);
  if (раздели < 3) бележки.push('само ' + раздели + ' раздела');
  if (/["'']/.test(s.body)) бележки.push('ПРАВА КАВИЧКА');
  if (String(s.s).length > 200) бележки.push('резюме ' + String(s.s).length);
  console.log('   ' + (бележки.length ? '🔴' : '✅') + ' ' + s.karta.padEnd(28) + ' ' + думи + ' думи · ' + раздели + ' раздела · ' + s.c + (бележки.length ? '   ← ' + бележки.join(', ') : ''));
});
