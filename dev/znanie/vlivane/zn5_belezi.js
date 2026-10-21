// zn5 · по раздел (## ) в папките на zn5: брой белези „проверено“ срещу „непроверено“. Само чете.
// node dev/znanie/vlivane/zn5_belezi.js
const fs = require('fs');
const P = ['08-mama','17-zdrave-zhena','18-roditelstvo','38-moderna-mayka','33-semeystvo','39-bashtata'];
const DOB = /\[(страница|ПРОЧЕТЕНО|прочетено|отворено|ТЕКСТ|проверено)[^\]]*\]|ПРОЧЕТЕНО/g;
const LOSH = /\[(непроверено|резюме|от паметта|П|авторско|предположено)[^\]]*\]|ПРЕДПОЛОЖЕНО/gi;
for (const p of P) {
  for (const f of fs.readdirSync('dev/znanie/' + p).filter(f => f.endsWith('.md'))) {
    const t = fs.readFileSync('dev/znanie/' + p + '/' + f, 'utf8').split(/\n(?=## )/);
    for (const s of t.slice(1)) {
      const h = s.split('\n')[0].slice(3, 70);
      const d = (s.match(DOB) || []).length, l = (s.match(LOSH) || []).length;
      const u = (s.match(/https?:\/\//g) || []).length;
      console.log(p.slice(0,2) + '/' + f.slice(0,2) + ' +' + d + ' -' + l + ' url' + u + ' · ' + h);
    }
  }
}
