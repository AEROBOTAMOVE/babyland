// zn1a · предложените ключове: картата съществува ли, ключът зает ли е вече (жив или в моя стаж)
const fs = require('fs');
const kb = fs.readFileSync('js/kb.js', 'utf8');
const zh = new Set();
for (const m of kb.matchAll(/'([^'\\]{2,80})'/g)) zh.add(m[1].toLowerCase());
const moi = new Set();
for (const k of JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1a.json', 'utf8'))) for (const x of k.keys) moi.add(x.toLowerCase());
const P = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn1a_klyuchove.json', 'utf8'));
let n = 0;
for (const [id, ks] of Object.entries(P)) {
  if (kb.indexOf("id: '" + id + "'") < 0) console.log('🔴 НЯМА КАРТА ' + id);
  for (const k of ks) {
    n++;
    if (zh.has(k)) console.log('🟡 вече жив: ' + id + ' · ' + k);
    if (moi.has(k)) console.log('🔴 в моя стаж: ' + id + ' · ' + k);
  }
}
console.log('проверени ключове: ' + n);
