// zn2 · показва title/core/tip/follow/keys на карти от js/kb.js (само чете)
// node dev/znanie/vlivane/zn2_pokazhi.js id1 id2 ... [--keys]
const fs = require('fs');
const src = fs.readFileSync('js/kb.js', 'utf8');
const L = src.split(/\r?\n/);
const sKeys = process.argv.includes('--keys');
for (const id of process.argv.slice(2).filter(a => !a.startsWith('--'))) {
  const i = L.findIndex(x => x.indexOf("id: '" + id + "'") > -1);
  if (i < 0) { console.log('=== ' + id + ' — НЯМА'); continue; }
  console.log('=== ' + id + ' · ' + L[i].trim().slice(0, 120));
  for (let j = i + 1; j < L.length && L[j].indexOf("id: '") < 0; j++) {
    const t = L[j].trim();
    if (/^(title|core|tip|follow|chips):/.test(t)) console.log('  ' + t.slice(0, 1400));
    if (sKeys && /^keys:/.test(t)) console.log('  ' + t.slice(0, 2500));
  }
}
