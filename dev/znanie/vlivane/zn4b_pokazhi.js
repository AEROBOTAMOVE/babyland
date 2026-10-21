// zn4b · показва цял запис (## ...) от файл в dev/znanie по част от името на файла и част от заглавието. Само чете.
// node dev/znanie/vlivane/zn4b_pokazhi.js "06-razvitie/10" "Лъже" ["15-dete-3-6/03" "Фантазия"] ...
const fs = require('fs'), path = require('path');
const BAZA = 'dev/znanie';
const a = process.argv.slice(2);
function nameri(chast) {
  const [p, f] = chast.split('/');
  const papka = fs.readdirSync(BAZA).find(x => x.startsWith(p));
  if (!papka) return null;
  const fail = fs.readdirSync(path.join(BAZA, papka)).find(x => x.startsWith(f));
  return fail ? path.join(BAZA, papka, fail) : null;
}
for (let i = 0; i + 1 < a.length; i += 2) {
  const f = nameri(a[i]);
  if (!f) { console.log('!! няма файл ' + a[i]); continue; }
  const t = fs.readFileSync(f, 'utf8');
  const zap = t.split(/\n(?=## )/).filter(s => s.startsWith('## ') && s.split('\n')[0].toLowerCase().includes(a[i + 1].toLowerCase()));
  if (!zap.length) { console.log('!! няма запис „' + a[i + 1] + '“ в ' + f); continue; }
  for (const z of zap) console.log('\n######## ' + f + '\n' + z.trim());
}
