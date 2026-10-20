// 📋 ОПИС „КАКВО ВЕЧЕ ИМАМЕ“ — всички карти от js/kb.js по стаи: id · заглавие · първите думи от ядрото.
// Агентите на знанието го четат, за да носят НОВОТО, не повторения.
// ПУСКАНЕ: node dev/znanie/opis_imame.js  → dev/znanie/00-IMAME.md
// ПЪТ НАЗАД: само чете kb.js.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../pyasachnik.js');
const W = zaredi(null);
const по = {};
for (const е of W.KB.entries) (по[е.room || '—'] = по[е.room || '—'] || []).push(е);
let out = '# 📋 КАКВО ВЕЧЕ ИМАМЕ — ' + W.KB.entries.length + ' карти (js/kb.js)\n\n' +
  'Формат: `id` · заглавие — началото на ядрото. Носи НОВО или ДОПЪЛНЕНИЕ към тях.\n';
for (const стая of Object.keys(по).sort()) {
  out += '\n## ' + стая + ' (' + по[стая].length + ')\n';
  for (const е of по[стая].sort((a, b) => String(a.title).localeCompare(String(b.title), 'bg')))
    out += '- `' + е.id + '` · ' + String(е.title || '').trim() + ' — ' + String(е.core || '').replace(/\s+/g, ' ').slice(0, 90) + '\n';
}
fs.writeFileSync(path.join(__dirname, '00-IMAME.md'), out);
console.log('✅ 00-IMAME.md · ' + W.KB.entries.length + ' карти · ' + Object.keys(по).length + ' стаи · ' + Math.round(out.length / 1024) + ' KB');
