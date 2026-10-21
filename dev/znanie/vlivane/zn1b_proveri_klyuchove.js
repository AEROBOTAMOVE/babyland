// zn1b · сблъсъци на предложените ключове (само чете): js/kb.js + моят стаж
// node dev/znanie/vlivane/zn1b_proveri_klyuchove.js
const fs = require('fs');
const kb = fs.readFileSync('js/kb.js', 'utf8');
const P = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn1b_klyuchove.json', 'utf8'));
const K = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1b.json', 'utf8'));
const zhivi = new Set();
for (const m of kb.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) {
  const v = m[1] != null ? m[1] : m[2];
  if (v && v.length >= 2) zhivi.add(v.toLowerCase());
}
const moi = new Set(K.flatMap(k => k.keys.map(x => x.toLowerCase())));
for (const [id, kl] of Object.entries(P)) {
  const ima = kb.indexOf("id: '" + id + "'") > -1 || kb.indexOf('id: "' + id + '"') > -1;
  const pr = kl.filter(x => zhivi.has(x.toLowerCase()) || moi.has(x.toLowerCase()) || /["'А-Я]/.test(x) || x.split(' ').length < 2 || x.split(' ').length > 6);
  console.log((ima && !pr.length ? '✅ ' : '🔴 ') + id + (ima ? '' : ' НЯМА КАРТА') + (pr.length ? ' · ' + pr.join(' | ') : ''));
}
console.log('живи низове: ' + zhivi.size);
