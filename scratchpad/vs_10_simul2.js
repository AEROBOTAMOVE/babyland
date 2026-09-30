// СИМУЛАЦИЯ през ИЗВОРА (kbPatch) — проектът НЕ се пипа, само паметта на пробата.
const fs = require('fs');
const path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { bl_baby: { birth: '2025-11-20' } };

function вкарай(К) {
  return (src) => {
    let s = src, влезли = 0, липсващи = [];
    for (const [id, ks] of Object.entries(К)) {
      let i = s.indexOf("id: '" + id + "'"); if (i < 0) i = s.indexOf('id: "' + id + '"');
      if (i < 0) { липсващи.push(id + ' (няма id)'); continue; }
      const j = s.indexOf('keys: [', i);
      if (j < 0 || j - i > 400) { липсващи.push(id + ' (няма keys след id)'); continue; }
      const край = j + 'keys: ['.length;
      const вставка = ks.map(k => JSON.stringify(k)).join(', ') + ', ';
      s = s.slice(0, край) + вставка + s.slice(край);
      влезли += ks.length;
    }
    if (липсващи.length) console.log('!!! НЕ ВЛЯЗОХА: ' + липсващи.join(' · '));
    console.log('ВКАРАНИ В ИЗВОРА: ' + влезли + ' ключа');
    return s;
  };
}

// ── САМОПРОБА: безсмислен ключ в известна карта ───────────
const S0 = zaredi(null, { памет: ПАМ });
const преди = S0.BL_MATCH('тарабамбука хвъркато', 'Инструменти');
const S1 = zaredi(null, { памет: ПАМ, kbPatch: вкарай({ 'in2-vana': ['тарабамбука хвъркато'] }) });
const след = S1.BL_MATCH('тарабамбука хвъркато', 'Инструменти');
console.log('САМОПРОБА: преди=' + (преди ? преди.id : 'ТИШИНА') + ' · след=' + (след ? след.id : 'ТИШИНА'));
if (!(преди === null && след && след.id === 'in2-vana')) { console.log('!!! УРЕДЪТ НЕ ЧЕТЕ — СПИРАМ'); process.exit(1); }
console.log('САМОПРОБА ОК\n');

// ── СИМУЛАЦИЯ ─────────────────────────────────────────────
const К = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_vsekidnevie.json'), 'utf8'));
const B = zaredi(null, { памет: ПАМ, kbPatch: вкарай(К) });

const ktrlPoz = [['Моето бебе','къпането на бебето','mb-bath'],['Инструменти','как да избера количка','in-stroller'],
  ['Моето бебе','колко често да сменям пелената','mb-smiana-pelena'],['Инструменти','колко пари трябват наистина','in-budget']];
const ktrlNeg = ['пшшш ъъъ ккк ммм','zzzz qqqq wwww vvvv','глупости небивалици измишльотини кречетало','бръмбазък дрънкулка тарабамбука'];
let p=0,n=0;
for (const [ст,q,цел] of ktrlPoz) { const r=B.BL_MATCH(q,ст); if (r && r.id===цел) p++; else console.log('КОНТРОЛ СЧУПЕН: '+q+' → '+(r?r.id:'ТИШИНА')); }
for (const q of ktrlNeg) { const r=B.BL_MATCH(q,'Моето бебе'); if (!r) n++; else console.log('КОНТРОЛ СЧУПЕН: '+q+' → '+r.id); }
console.log('КОНТРОЛ СЛЕД ДОБАВЯНЕ: положителни ' + p + '/4 · отрицателни ' + n + '/4');

const очакв = JSON.parse(fs.readFileSync(path.join(__dirname, 'vs_ochakvania.json'), 'utf8'));
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'vsekidnevie_60.json'), 'utf8'));
const стар = JSON.parse(fs.readFileSync(path.join(__dirname, 'vsekidnevie_rezultat.json'), 'utf8'));
let оправени=0, всеОще=0, счупени=0;
console.log('\n═══ 60-те ВЪПРОСА СЛЕД ДОБАВЯНЕТО ═══');
V.forEach(([tema, staya, q], i) => {
  const r = B.BL_MATCH(q, staya);
  const целта = очакв[String(i+1)] || null;
  const сегаИд = r ? r.id : null;
  if (!целта) {
    const старИд = стар[i].a ? стар[i].a.id : null;
    if (сегаИд !== старИд) { счупени++; console.log('СЧУПЕН ' + (i+1) + ' « ' + q + ' »  ' + старИд + ' → ' + (сегаИд||'ТИШИНА')); }
  } else if (сегаИд === целта) оправени++;
  else { всеОще++; console.log('НЕ СЕ ОПРАВИ ' + (i+1) + ' « ' + q + ' »  очаквах=' + целта + ' получих=' + (сегаИд||'ТИШИНА')); }
});
console.log('\nОПРАВЕНИ: ' + оправени + '/' + Object.keys(очакв).length + ' · ВСЕ ОЩЕ СБЪРКАНИ: ' + всеОще + ' · СЧУПЕНИ (бяха верни): ' + счупени);

// ── СТРАНИЧЕН ПАЗАЧ: 120 чужди въпроса, да не се е разместило нещо ──
const чужди = [
 ['Захранване','кога да започна захранването'],['Захранване','колко пъти на ден яде'],
 ['Здраве и SOS','има температура 38'],['Здраве и SOS','кашля от два дни'],
 ['Бременност','колко тежи мъника'],['Бременност','не мога да спя'],
 ['Дневник на мама','не издържам вече'],['Дневник на мама','кого да слушам като всички говорят различно'],
 ['Развитие и игри','кога ще проходи'],['Развитие и игри','не гука'],
 ['Жената в мен','боли ме кръста след раждането'],['Лабораторията','бабини съвети'],
 ['Моето бебе','колко спи бебето'],['Моето бебе','плаче много'],
 ['Инструменти','столчето за кола'],['Инструменти','детските надбавки'],
];
let разлики = 0;
for (const [ст,q] of чужди) {
  const a = S0.BL_MATCH(q,ст), b = B.BL_MATCH(q,ст);
  const ai = a?a.id:null, bi = b?b.id:null;
  if (ai !== bi) { разлики++; console.log('РАЗМЕСТЕН [' + ст + '] « ' + q + ' »  ' + ai + ' → ' + bi); }
}
console.log('СТРАНИЧЕН ПАЗАЧ: ' + (чужди.length - разлики) + '/' + чужди.length + ' непокътнати · разместени ' + разлики);
