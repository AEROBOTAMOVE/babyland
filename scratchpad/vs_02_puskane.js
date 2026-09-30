// Пуска 60-те въпроса за ВСЕКИДНЕВИЕТО през BL_MATCH.
// A = майка с бебе 10 м. (2025-11-20) · D = дете 2 г. (2024-09-20) · B = бременна (ПМЦ 2026-04-01)
const fs = require('fs');
const path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');

const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const D = zaredi(null, { памет: { bl_baby: { birth: '2024-09-20' } } });
const B = zaredi(null, { памет: { bl_lmp: '2026-04-01' } });

// ── КОНТРОЛИ (уредът мери ли себе си) ─────────────────────
const ktrlPoz = [
  ['Моето бебе', 'къпането на бебето'],
  ['Инструменти', 'как да избера количка'],
  ['Моето бебе', 'колко често да сменям пелената'],
  ['Инструменти', 'колко пари трябват наистина'],
];
const ktrlNeg = [
  ['Моето бебе', 'пшшш ъъъ ккк ммм'],
  ['Инструменти', 'zzzz qqqq wwww vvvv'],
  ['Моето бебе', 'глупости небивалици измишльотини кречетало'],
  ['Инструменти', 'бръмбазък дрънкулка тарабамбука'],
];
let pozOk = 0, negOk = 0;
console.log('═══ КОНТРОЛ ПОЛОЖИТЕЛЕН (трябва КАРТА) ═══');
for (const [st, q] of ktrlPoz) {
  const r = A.BL_MATCH(q, st);
  console.log((r ? 'OK   ' : 'ГРЕШ ') + '[' + st + '] ' + q + ' → ' + (r ? r.id : 'ТИШИНА'));
  if (r) pozOk++;
}
console.log('═══ КОНТРОЛ ОТРИЦАТЕЛЕН (трябва ТИШИНА) ═══');
for (const [st, q] of ktrlNeg) {
  const r = A.BL_MATCH(q, st);
  console.log((r ? 'ГРЕШ ' : 'OK   ') + '[' + st + '] ' + q + ' → ' + (r ? r.id + ' / ' + r.title : 'ТИШИНА'));
  if (!r) negOk++;
}
console.log('КОНТРОЛ: положителни ' + pozOk + '/' + ktrlPoz.length + ' · отрицателни ' + negOk + '/' + ktrlNeg.length);
if (pozOk !== ktrlPoz.length || negOk !== ktrlNeg.length) console.log('!!! УРЕДЪТ Е СЪМНИТЕЛЕН');

// ── 60-те въпроса ─────────────────────────────────────────
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'vsekidnevie_60.json'), 'utf8'));
console.log('\nБРОЙ ВЪПРОСИ: ' + V.length);
console.log('\n═══ 60 ВЪПРОСА · ВСЕКИДНЕВИЕТО ═══');
const out = [];
const кратко = r => r ? (r.room + '::' + r.id + ' « ' + r.title + ' »') : 'ТИШИНА';
V.forEach(([tema, staya, q], i) => {
  const a = A.BL_MATCH(q, staya);
  const d = D.BL_MATCH(q, staya);
  const b = B.BL_MATCH(q, staya);
  out.push({ n: i + 1, tema, staya, q,
    a: a ? { id: a.id, room: a.room, title: a.title } : null,
    d: d ? { id: d.id, room: d.room, title: d.title } : null,
    b: b ? { id: b.id, room: b.room, title: b.title } : null });
  console.log(String(i + 1).padStart(2) + ' [' + tema + '|' + staya + '] ' + q);
  console.log('     A(10м): ' + кратко(a));
  if ((a && d && a.id !== d.id) || (!a && d) || (a && !d)) console.log('     D(24м): ' + кратко(d));
  if ((a && b && a.id !== b.id) || (!a && b) || (a && !b)) console.log('     B(брем): ' + кратко(b));
});
fs.writeFileSync(path.join(__dirname, 'vsekidnevie_rezultat.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('\nТИШИНИ при A(10м): ' + out.filter(o => !o.a).length + '/' + V.length);
