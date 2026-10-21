// Съдията zn6 · показва статия(и) по индекс или id: node dev/znanie/vlivane/zn6_sadiya_pokazhi.js 0 3   (само чете)
const fs = require('fs');
const S = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn6.json', 'utf8'));
const a = process.argv.slice(2);
const izb = a.length ? S.filter((s, i) => a.includes(String(i)) || a.includes(s.karta)) : S;
for (const s of izb) {
  console.log('### ' + S.indexOf(s) + ' ' + s.karta + ' | c=' + s.c + ' | e=' + s.e);
  console.log('T: ' + s.t);
  console.log('S: ' + s.s);
  console.log('K: ' + s.k);
  console.log(s.body);
  console.log();
}
