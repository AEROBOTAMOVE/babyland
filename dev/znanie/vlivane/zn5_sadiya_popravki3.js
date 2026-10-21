// Съдията zn5 · трети кръг: следродилното — 112 ясно и в статията за петте стъпки (17/08 „мост“ → 112 при мисли за нараняване)
// node dev/znanie/vlivane/zn5_sadiya_popravki3.js
const fs = require('fs');
const FS = 'dev/nahodki/statii_zn5.json';
const S = JSON.parse(fs.readFileSync(FS, 'utf8'));
const P = [['zn5-pet-stapki-dobre', 'body',
  'следродилната депресия може да дойде до година след раждането и се лекува.\n\nЗаписките не заменят преглед.',
  'следродилната депресия може да дойде до година след раждането и се лекува.\n\n- 🚨 При мисли да нараниш себе си или бебето — 112.\n\nЗаписките не заменят преглед.']];
for (const [id, pole, staro, novo] of P) {
  const s = S.find(x => x.karta === id);
  const t = s ? String(s[pole]) : '';
  if (t.split(staro).length - 1 !== 1) { console.log('🔴 НЕ ПИША — не е намерено точно веднъж: ' + id); process.exit(1); }
  s[pole] = t.replace(staro, novo);
}
fs.writeFileSync(FS, JSON.stringify(S, null, 1) + '\n', 'utf8');
JSON.parse(fs.readFileSync(FS, 'utf8'));
console.log('🟢 приложени ' + P.length + ' замени · JSON се парсва');
