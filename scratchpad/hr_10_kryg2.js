// КРЪГ 2: първите ключове + добавките за седемте оцелели.
// Проверява същите три въпроса + съпътстваща щета върху 179 заглавия
// И върху 60-те въпроса, които вече бяха ВЕРНИ.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { памет: { bl_baby: { birth: '2025-11-20' } } };
const P1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_predlozheni.json'), 'utf8'));
const P2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_predlozheni2.json'), 'utf8'));
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_60.json'), 'utf8'));
const норм = s => String(s).toLowerCase().replace(/[^а-яa-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const ВСИЧКИ = {};
for (const src of [P1, P2]) for (const [k, v] of Object.entries(src)) ВСИЧКИ[k] = (ВСИЧКИ[k] || []).concat(v);

// ── ЧИСТО ─────────────────────────────────────────────────
const W1 = zaredi(null, ПАМ);
const E1 = (W1.BL_KB || W1.KB).entries;
const зает = new Map();
for (const c of E1) for (const k of (c.keys || [])) { const n = норм(k); if (!зает.has(n)) зает.set(n, []); зает.get(n).push(c.id); }
const заглавия = E1.map(c => ({ id: c.id, room: c.room, t: c.title }));
const базаЗагл = заглавия.map(z => { const r = W1.BL_MATCH(z.t, z.room); return { ...z, наш: r ? r.id : null }; });
const база60 = V.map(([, q]) => { const r = W1.BL_MATCH(q, 'Захранване'); return r ? r.id : null; });

const чисти = {}; let брЗает = 0;
for (const [цел, кл] of Object.entries(ВСИЧКИ)) {
  чисти[цел] = [];
  for (const k of кл) {
    const n = норм(k), соб = зает.get(n);
    if (соб) { console.log('ЗАЕТ  [' + цел + '] "' + k + '" ← ' + соб.join(', ')); брЗает++; continue; }
    чисти[цел].push(k);
  }
}
const общо = Object.values(чисти).reduce((a, b) => a + b.length, 0);
console.log('ПРЕДЛОЖЕНИ: ' + общо + ' чисти ключа за ' + Object.keys(чисти).length + ' карти · отхвърлени като заети: ' + брЗает);

// ── ВЛЕЙ ──────────────────────────────────────────────────
const W2 = zaredi(null, ПАМ);
const E2 = (W2.BL_KB || W2.KB).entries;
for (const [цел, кл] of Object.entries(чисти)) { const c = E2.find(x => x.id === цел); if (!c) { console.log('!!! НЯМА ' + цел); continue; } for (const k of кл) c.keys.push(k); }

// всеки ключ води ли до своята карта
let водят = 0, неводят = [];
for (const [цел, кл] of Object.entries(чисти)) for (const k of кл) {
  const r = W2.BL_MATCH(k, 'Захранване');
  if (r && r.id === цел) водят++; else неводят.push('[' + цел + '] "' + k + '" → ' + (r ? r.room + '/' + r.id : 'ТИШИНА'));
}
console.log('\nКЛЮЧЪТ ВОДИ ДО СВОЯТА КАРТА: ' + водят + '/' + общо);
неводят.forEach(s => console.log('  НЕ ВОДИ ' + s));

// 60-те
const след60 = V.map(([, q]) => { const r = W2.BL_MATCH(q, 'Захранване'); return r ? r.id : null; });
console.log('\n═══ 60-ТЕ: ПРОМЕНИ ═══');
V.forEach(([, q], i) => { if (база60[i] !== след60[i]) console.log(String(i + 1).padStart(2) + ' ' + (база60[i] || 'ТИШИНА') + ' → ' + (след60[i] || 'ТИШИНА') + '   « ' + q + ' »'); });
fs.writeFileSync(path.join(__dirname, 'hranene_sled.json'), JSON.stringify(V.map(([t, q], i) => ({ n: i + 1, t, q, преди: база60[i], след: след60[i] })), null, 1), 'utf8');

// съпътстваща щета върху ВСИЧКИ 1621 заглавия
let счупени = [], оправени = 0, смени = 0;
for (const z of базаЗагл) {
  const r = W2.BL_MATCH(z.t, z.room); const нов = r ? r.id : null;
  if (нов === z.наш) continue; смени++;
  if (z.наш === z.id && нов !== z.id) счупени.push(z.room + '/' + z.id + ' « ' + z.t + ' » : себе си → ' + (нов || 'ТИШИНА'));
  else if (z.наш !== z.id && нов === z.id) оправени++;
}
console.log('\n═══ СЪПЪТСТВАЩА ЩЕТА върху ' + базаЗагл.length + ' заглавия (всички стаи) ═══');
console.log('смени ' + смени + ' · ОПРАВЕНИ ' + оправени + ' · СЧУПЕНИ ' + счупени.length);
счупени.forEach(s => console.log('  СЧУПЕНО ' + s));

// контроли
const kp = ['кога да започна захранването', 'колко пъти на ден яде', 'хвърля храната на пода', 'как се стерилизира шише'];
const kn = ['пшшш ъъъ ккк ммм', 'zzzz qqqq wwww', 'глупости небивалици измишльотини кречетало'];
console.log('\nКОНТРОЛ: положителни ' + kp.filter(q => W2.BL_MATCH(q, 'Захранване')).length + '/4 · отрицателни ' + kn.filter(q => !W2.BL_MATCH(q, 'Захранване')).length + '/3');

// червените флагове да не са пипнати: спешните фрази пак ли вдигат флаг
const спешни = ['бебето не диша', 'детето е много отпуснато и не реагира', 'има температура 40 и обрив'];
console.log('СПЕШНИ (трябва да НЕ са обикновена карта): ' + спешни.map(q => { const r = W2.BL_MATCH(q, 'Захранване'); return (r ? r.id : 'null'); }).join(' | '));

fs.writeFileSync(path.join(__dirname, 'klyuchove_hranene.json'), JSON.stringify(чисти, null, 2), 'utf8');
console.log('\nЗАПИСАНО: scratchpad/klyuchove_hranene.json (' + общо + ' ключа)');
