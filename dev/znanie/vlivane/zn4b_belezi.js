// zn4b · брои записите (## ) и белезите на несигурност по файл в моите папки; с --zapisi показва заглавията и белезите им. Само чете.
// node dev/znanie/vlivane/zn4b_belezi.js [--zapisi] [папка/файл ...]
const fs = require('fs'), path = require('path');
const BAZA = 'dev/znanie';
const PAPKI = ['06-razvitie', '34-zanimania-0-3', '47-dvizhenie-sport', '15-dete-3-6', '26-po-mesetsi', '45-higiena-1-6'];
const args = process.argv.slice(2);
const zapisi = args.includes('--zapisi');
const tseli = args.filter(a => !a.startsWith('--'));
let failove = [];
for (const p of PAPKI) for (const f of fs.readdirSync(path.join(BAZA, p))) failove.push(p + '/' + f);
if (tseli.length) failove = failove.filter(f => tseli.some(t => f.includes(t)));
const B = { pam: /от паметта/gi, nepr: /непроверено/gi, P: /\[П\]/g, rez: /резюме/gi, pred: /ПРЕДПОЛОЖЕНО/g };
for (const f of failove) {
  const t = fs.readFileSync(path.join(BAZA, f), 'utf8');
  const br = k => (t.match(B[k]) || []).length;
  const zap = t.split(/\n(?=## )/).filter(s => s.startsWith('## '));
  console.log(f.padEnd(52) + ' записи ' + String(zap.length).padStart(3) + ' · памет ' + br('pam') + ' · непр ' + br('nepr') + ' · [П] ' + br('P') + ' · рез ' + br('rez') + ' · ПРЕДП ' + br('pred'));
  if (zapisi) for (const z of zap) {
    const ime = z.split('\n')[0].slice(3, 100);
    const b = [];
    for (const k of Object.keys(B)) { const n = (z.match(B[k]) || []).length; if (n) b.push(k + n); }
    console.log('    · ' + ime + (b.length ? '   [' + b.join(' ') + ']' : ''));
  }
}
