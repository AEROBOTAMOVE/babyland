// СИМУЛАЦИЯ: добавя предложените ключове САМО в паметта (проектът не се пипа)
// и пуска пак 60-те въпроса + контролите.
// Първо — САМОПРОБА: вкарва безсмислен ключ и проверява дали изобщо се чете.
const fs = require('fs');
const path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');

function зареди() { return zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } }); }

// ── САМОПРОБА НА УРЕДА ────────────────────────────────────
const S = зареди();
const eS = (S.BL_KB || S.KB).entries;
const жертва = eS.find(x => x.id === 'in2-vana');
const преди = S.BL_MATCH('тарабамбука хвъркато', 'Инструменти');
жертва.keys.push('тарабамбука хвъркато');
const след = S.BL_MATCH('тарабамбука хвъркато', 'Инструменти');
console.log('САМОПРОБА: преди=' + (преди ? преди.id : 'ТИШИНА') + ' · след=' + (след ? след.id : 'ТИШИНА'));
if (!(преди === null && след && след.id === 'in2-vana')) {
  console.log('!!! УРЕДЪТ НЕ ЧЕТЕ ДОБАВЕНИТЕ КЛЮЧОВЕ — симулацията долу е НЕВАЛИДНА');
  process.exit(1);
}
console.log('САМОПРОБА ОК — добавените ключове се четат на живо\n');

// ── СИМУЛАЦИЯ ─────────────────────────────────────────────
const B = зареди();
const eB = (B.BL_KB || B.KB).entries;
const К = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_vsekidnevie.json'), 'utf8'));
let добавени = 0;
for (const [id, ks] of Object.entries(К)) {
  const c = eB.find(x => x.id === id);
  if (!c) { console.log('!!! липсва ' + id); continue; }
  for (const k of ks) { c.keys.push(k); добавени++; }
}
console.log('ДОБАВЕНИ В ПАМЕТТА: ' + добавени + ' ключа в ' + Object.keys(К).length + ' карти');

// контролите пак
const ktrlPoz = [['Моето бебе','къпането на бебето','mb-bath'],['Инструменти','как да избера количка','in-stroller'],
  ['Моето бебе','колко често да сменям пелената','mb-smiana-pelena'],['Инструменти','колко пари трябват наистина','in-budget']];
const ktrlNeg = ['пшшш ъъъ ккк ммм','zzzz qqqq wwww vvvv','глупости небивалици измишльотини кречетало','бръмбазък дрънкулка тарабамбука'];
let p=0,n=0;
for (const [ст,q,цел] of ktrlPoz) { const r=B.BL_MATCH(q,ст); if (r && r.id===цел) p++; else console.log('КОНТРОЛ СЧУПЕН: '+q+' → '+(r?r.id:'ТИШИНА')); }
for (const q of ktrlNeg) { const r=B.BL_MATCH(q,'Моето бебе'); if (!r) n++; else console.log('КОНТРОЛ СЧУПЕН: '+q+' → '+r.id); }
console.log('КОНТРОЛ СЛЕД ДОБАВЯНЕ: положителни ' + p + '/4 · отрицателни ' + n + '/4');

// ── ОЧАКВАНИЯТА ───────────────────────────────────────────
const очакв = JSON.parse(fs.readFileSync(path.join(__dirname, 'vs_ochakvania.json'), 'utf8'));
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'vsekidnevie_60.json'), 'utf8'));
const стар = JSON.parse(fs.readFileSync(path.join(__dirname, 'vsekidnevie_rezultat.json'), 'utf8'));
let оправени=0, всеОще=0, счупени=0;
console.log('\n═══ ПАК 60-те ВЪПРОСА СЛЕД ДОБАВЯНЕТО ═══');
V.forEach(([tema, staya, q], i) => {
  const r = B.BL_MATCH(q, staya);
  const с = стар[i];
  const целта = очакв[String(i+1)] || null;     // очакваната карта, ако въпросът беше сбъркан
  const бешеДобре = !целта;                      // няма очакване = въпросът е бил верен
  const сегаИд = r ? r.id : null;
  if (бешеДобре) {
    const старИд = с.a ? с.a.id : null;
    if (сегаИд !== старИд) { счупени++; console.log('СЧУПЕН ' + (i+1) + ' « ' + q + ' »  ' + старИд + ' → ' + сегаИд); }
  } else if (сегаИд === целта) { оправени++; }
  else { всеОще++; console.log('НЕ СЕ ОПРАВИ ' + (i+1) + ' « ' + q + ' »  очаквах=' + целта + ' получих=' + (сегаИд||'ТИШИНА')); }
});
console.log('\nОПРАВЕНИ: ' + оправени + ' · ВСЕ ОЩЕ СБЪРКАНИ: ' + всеОще + ' · СЧУПЕНИ (бяха верни): ' + счупени);
