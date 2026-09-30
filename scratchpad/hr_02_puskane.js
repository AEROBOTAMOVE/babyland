// Пуска 60-те въпроса през BL_MATCH в стая „Захранване“.
// Две майки: A = бебе 10 м. (2025-11-20) · C = дете 2 г. (2024-09-20)
// Контроли: въпрос, който ТРЯБВА да намери, и безсмислица, която ТРЯБВА да е null.
const fs = require('fs');
const path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');

const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const C = zaredi(null, { памет: { bl_baby: { birth: '2024-09-20' } } });

// ── КОНТРОЛИ ──────────────────────────────────────────────
const ktrlPoz = [
  'кога да започна захранването',
  'колко пъти на ден яде',
  'хвърля храната на пода',
  'как се стерилизира шише',
];
const ktrlNeg = [
  'пшшш ъъъ ккк ммм',
  'zzzz qqqq wwww',
  'глупости небивалици измишльотини кречетало',
];
console.log('═══ КОНТРОЛ ПОЛОЖИТЕЛЕН (трябва КАРТА) ═══');
let pozOk = 0;
for (const q of ktrlPoz) {
  const r = A.BL_MATCH(q, 'Захранване');
  console.log((r ? 'OK   ' : 'ГРЕШ ') + q + ' → ' + (r ? r.id : 'ТИШИНА'));
  if (r) pozOk++;
}
console.log('═══ КОНТРОЛ ОТРИЦАТЕЛЕН (трябва ТИШИНА) ═══');
let negOk = 0;
for (const q of ktrlNeg) {
  const r = A.BL_MATCH(q, 'Захранване');
  console.log((r ? 'ГРЕШ ' : 'OK   ') + q + ' → ' + (r ? r.id + ' / ' + r.title : 'ТИШИНА'));
  if (!r) negOk++;
}
console.log('КОНТРОЛ: положителни ' + pozOk + '/' + ktrlPoz.length + ' · отрицателни ' + negOk + '/' + ktrlNeg.length);
if (pozOk !== ktrlPoz.length || negOk !== ktrlNeg.length) console.log('!!! УРЕДЪТ Е СЪМНИТЕЛЕН — числата долу не се четат');

// ── 60-те въпроса ─────────────────────────────────────────
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_60.json'), 'utf8'));
console.log('\n═══ 60 ВЪПРОСА (стая Захранване) ═══');
const out = [];
V.forEach(([tema, q], i) => {
  const a = A.BL_MATCH(q, 'Захранване');
  const c = C.BL_MATCH(q, 'Захранване');
  const red = (r) => r ? (r.room + '::' + r.id + ' « ' + r.title + ' »') : 'ТИШИНА';
  out.push({ n: i + 1, tema, q, a: a ? { id: a.id, room: a.room, title: a.title } : null, c: c ? { id: c.id, room: c.room, title: c.title } : null });
  console.log(String(i + 1).padStart(2) + ' [' + tema + '] ' + q);
  console.log('     A(10м): ' + red(a));
  if (!a || !c || a.id !== c.id) console.log('     C(24м): ' + red(c));
});
fs.writeFileSync(path.join(__dirname, 'hranene_rezultat.json'), JSON.stringify(out, null, 1), 'utf8');
const tishina = out.filter(o => !o.a).length;
console.log('\nТИШИНИ при A(10м): ' + tishina + '/60');
