// zn1b · сглобява dev/nahodki/statii_zn1b.json от dev/znanie/vlivane/zn1b_statii_izvor.txt (пише само в моя стаж-файл)
// Формат на извора: „@@@ <id на картата>“, после редове t:/e:/s:/k:/c:, ред „---“ и тялото до следващото „@@@“.
// node dev/znanie/vlivane/zn1b_statii.js
const fs = require('fs');
const текст = fs.readFileSync('dev/znanie/vlivane/zn1b_statii_izvor.txt', 'utf8').replace(/\r/g, '');
const блокове = текст.split(/^@@@ /m).filter(б => б.trim());
const изход = [];
for (const б of блокове) {
  const [глава, ...тяло] = б.split(/^---$/m);
  const редове = глава.split('\n');
  const с = { karta: редове[0].trim() };
  for (const р of редове.slice(1)) {
    const м = р.match(/^([tesk c]|[tesck]):\s*(.*)$/);
    if (м) с[м[1]] = м[2].trim();
  }
  с.body = тяло.join('---').trim();
  изход.push({ karta: с.karta, t: с.t, e: с.e, s: с.s, k: с.k, c: с.c, body: с.body });
}
fs.writeFileSync('dev/nahodki/statii_zn1b.json', JSON.stringify(изход, null, 1) + '\n');
console.log('статии: ' + изход.length);
for (const с of изход) for (const п of ['t', 'e', 's', 'k', 'c', 'body']) if (!с[п]) console.log('🔴 ' + с.karta + ' без ' + п);
