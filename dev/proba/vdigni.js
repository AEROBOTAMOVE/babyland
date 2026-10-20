// 🔢 20.10 · вдига ?v= в index.html САМО за изброените файлове (+ по желание CACHE в sw.js).
// Защо отделно от dev/versii_po_sadarjanie.js: агентите работят паралелно и онзи вдига ВСИЧКИ
// променени файлове — тук вдигам точно тези, които влизат в комита.
// ПУСКАНЕ (cwd = корена): node dev/proba/vdigni.js css/pl-bebe.css js/pl-bebe.js [--sw]
const fs = require('fs');
const файлове = process.argv.slice(2).filter(a => !a.startsWith('--'));
let h = fs.readFileSync('index.html', 'utf8'); const лог = [];
for (const f of файлове) {
  const и = h.indexOf(f + '?v=');
  if (и < 0) { лог.push('НЯМА ' + f); continue; }
  const от = и + f.length + 3; let до = от; while (/\d/.test(h[до])) до++;
  const v = Number(h.slice(от, до)); h = h.slice(0, от) + (v + 1) + h.slice(до); лог.push(f + ' ' + v + '→' + (v + 1));
}
fs.writeFileSync('index.html', h);
if (process.argv.includes('--sw')) {
  let s = fs.readFileSync('sw.js', 'utf8'); const м = s.match(/const CACHE = 'babyland-v(\d+)'/);
  if (м) { s = s.replace(м[0], "const CACHE = 'babyland-v" + (Number(м[1]) + 1) + "'"); fs.writeFileSync('sw.js', s); лог.push('sw ' + м[1] + '→' + (Number(м[1]) + 1)); }
}
console.log(лог.join(' · '));
