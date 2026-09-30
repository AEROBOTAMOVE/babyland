// Пуска 60-те въпроса през BL_MATCH в стая „Бременност“, профил бременна.
// B  = ПМЦ 2026-04-01 (≈26 с. на 30.09.2026) — основният профил по задание
// B1 = ПМЦ 2026-08-20 (≈6 с.)  — за въпросите от началото
// B3 = ПМЦ 2026-01-20 (≈36 с.) — за въпросите от края
// Контроли: 4 въпроса, които ТРЯБВА да намерят карта, и 3 безсмислици → null.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');

const B  = zaredi(null, { памет: { bl_lmp: '2026-04-01' } });
const B1 = zaredi(null, { памет: { bl_lmp: '2026-08-20' } });
const B3 = zaredi(null, { памет: { bl_lmp: '2026-01-20' } });

const ktrlPoz = [
  'гаденето нормално ли е',
  'какво да сложа в чантата за болницата',
  'как се броят седмиците',
  'може ли секс в бременността',
];
const ktrlNeg = [
  'пшшш ъъъ ккк ммм',
  'zzzz qqqq wwww',
  'глупости небивалици измишльотини кречетало',
];
console.log('═══ КОНТРОЛ ПОЛОЖИТЕЛЕН (трябва КАРТА) ═══');
let pozOk = 0;
for (const q of ktrlPoz) { const r = B.BL_MATCH(q, 'Бременност');
  console.log((r ? 'OK   ' : 'ГРЕШ ') + q + ' → ' + (r ? r.id + ' « ' + r.title + ' »' : 'ТИШИНА')); if (r) pozOk++; }
console.log('═══ КОНТРОЛ ОТРИЦАТЕЛЕН (трябва ТИШИНА) ═══');
let negOk = 0;
for (const q of ktrlNeg) { const r = B.BL_MATCH(q, 'Бременност');
  console.log((r ? 'ГРЕШ ' : 'OK   ') + q + ' → ' + (r ? r.id + ' / ' + r.title : 'ТИШИНА')); if (!r) negOk++; }
console.log('КОНТРОЛ: положителни ' + pozOk + '/' + ktrlPoz.length + ' · отрицателни ' + negOk + '/' + ktrlNeg.length);
if (pozOk !== ktrlPoz.length || negOk !== ktrlNeg.length) console.log('!!! УРЕДЪТ Е СЪМНИТЕЛЕН — числата долу не се четат');

const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'bremennost_60.json'), 'utf8'));
console.log('\n═══ 60 ВЪПРОСА (стая Бременност) ═══');
const out = [];
const кр = r => r ? { id: r.id, room: r.room, title: r.title } : null;
const ред = r => r ? (r.room + '::' + r.id + ' « ' + r.title + ' »') : 'ТИШИНА';
V.forEach(([tema, q], i) => {
  const b = B.BL_MATCH(q, 'Бременност');
  const b1 = B1.BL_MATCH(q, 'Бременност');
  const b3 = B3.BL_MATCH(q, 'Бременност');
  out.push({ n: i + 1, tema, q, b: кр(b), b1: кр(b1), b3: кр(b3) });
  console.log(String(i + 1).padStart(2) + ' [' + tema + '] ' + q);
  console.log('     B (26с): ' + ред(b));
  const id = x => x ? x.id : null;
  if (id(b1) !== id(b)) console.log('     B1( 6с): ' + ред(b1));
  if (id(b3) !== id(b)) console.log('     B3(36с): ' + ред(b3));
});
fs.writeFileSync(path.join(__dirname, 'bremennost_rezultat.json'), JSON.stringify(out, null, 1), 'utf8');
const tish = out.filter(o => !o.b).length;
const tishVsi = out.filter(o => !o.b && !o.b1 && !o.b3).length;
console.log('\nТИШИНИ при B(26с): ' + tish + '/60 · тишина и при трите профила: ' + tishVsi + '/60');
