// ПРОВЕРКА НА ПРЕДЛОЖЕНИТЕ КЛЮЧОВЕ — три въпроса за всеки ключ:
//   (1) зает ли е вече от друга карта (буквално, нормализирано)
//   (2) води ли СЕГА до целевата карта (ако води — ключът е излишен)
//   (3) СЛЕД вливането: печели ли своята карта и КОЛКО чужди карти губи
// Нищо не се записва в js/kb.js — вливането е САМО в паметта на пясъчника.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { памет: { bl_baby: { birth: '2025-11-20' } } };

const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_predlozheni.json'), 'utf8'));
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'hranene_60.json'), 'utf8'));
const норм = s => String(s).toLowerCase().replace(/[^а-яa-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// ── ЧИСТИЯТ МОЗЪК ─────────────────────────────────────────
const W1 = zaredi(null, ПАМ);
const E1 = (W1.BL_KB || W1.KB).entries;
const зает = new Map();               // норм.ключ -> [id, …]
for (const c of E1) for (const k of (c.keys || [])) {
  const n = норм(k); if (!зает.has(n)) зает.set(n, []); зает.get(n).push(c.id);
}
// БАЗА: какво отговаря чистият мозък на заглавията на ВСИЧКИ карти в Захранване
const заглавия = E1.filter(c => c.room === 'Захранване').map(c => ({ id: c.id, t: c.title }));
const базаЗагл = заглавия.map(z => { const r = W1.BL_MATCH(z.t, 'Захранване'); return { id: z.id, t: z.t, наш: r ? r.id : null }; });
// БАЗА: какво отговаря на 60-те въпроса
const база60 = V.map(([, q]) => { const r = W1.BL_MATCH(q, 'Захранване'); return r ? r.id : null; });

console.log('═══ (1) ЗАЕТ ЛИ Е КЛЮЧЪТ · (2) ВОДИ ЛИ СЕГА ДО ЦЕЛТА ═══');
let брЗает = 0, брВоди = 0, брОк = 0;
const чисти = {};
for (const [цел, ключове] of Object.entries(P)) {
  чисти[цел] = [];
  for (const k of ключове) {
    const n = норм(k);
    const собственик = зает.get(n);
    const сега = W1.BL_MATCH(k, 'Захранване');
    const водиСега = сега && сега.id === цел;
    if (собственик) { console.log('ЗАЕТ  [' + цел + '] "' + k + '" ← вече е ключ на: ' + собственик.join(', ')); брЗает++; continue; }
    if (водиСега) { console.log('ИЗЛИШ [' + цел + '] "' + k + '" — вече води дотам без добавка'); брВоди++; continue; }
    чисти[цел].push(k); брОк++;
  }
}
console.log('ИТОГО: чисти ' + брОк + ' · заети ' + брЗает + ' · излишни ' + брВоди);

// ── ВЛЕЙ В ПАМЕТТА И МЕРИ ─────────────────────────────────
const W2 = zaredi(null, ПАМ);
const E2 = (W2.BL_KB || W2.KB).entries;
let влети = 0;
for (const [цел, ключове] of Object.entries(чисти)) {
  const c = E2.find(x => x.id === цел);
  if (!c) { console.log('!!! НЯМА КАРТА ' + цел); continue; }
  for (const k of ключове) { c.keys.push(k); влети++; }
}
console.log('\nВЛЕТИ В ПАМЕТТА: ' + влети + ' ключа (индексът още не е гра́ден — брои ги)');

// (3а) всеки влят ключ води ли СЕГА до своята карта
console.log('\n═══ (3а) СЛЕД ВЛИВАНЕТО: ключът води ли до своята карта ═══');
let водиСлед = 0, неВоди = 0;
for (const [цел, ключове] of Object.entries(чисти)) for (const k of ключове) {
  const r = W2.BL_MATCH(k, 'Захранване');
  if (r && r.id === цел) водиСлед++;
  else { неВоди++; console.log('НЕ ВОДИ [' + цел + '] "' + k + '" → ' + (r ? r.room + '/' + r.id : 'ТИШИНА')); }
}
console.log('води ' + водиСлед + ' · не води ' + неВоди);

// (3б) 60-те въпроса: преди срещу след
console.log('\n═══ (3б) 60-ТЕ ВЪПРОСА: ПРЕДИ → СЛЕД ═══');
const след60 = V.map(([, q]) => { const r = W2.BL_MATCH(q, 'Захранване'); return r ? r.id : null; });
V.forEach(([tema, q], i) => {
  const a = база60[i], b = след60[i];
  if (a !== b) console.log(String(i + 1).padStart(2) + ' ' + q + '\n      ' + (a || 'ТИШИНА') + '  →  ' + (b || 'ТИШИНА'));
});

// (3в) СЪПЪТСТВАЩА ЩЕТА: заглавията на всички карти в Захранване
console.log('\n═══ (3в) СЪПЪТСТВАЩА ЩЕТА (заглавия на 179 карти в Захранване) ═══');
let смени = 0, счупени = 0;
for (const z of базаЗагл) {
  const r = W2.BL_MATCH(z.t, 'Захранване');
  const нов = r ? r.id : null;
  if (нов !== z.наш) { смени++;
    const бешеВярно = z.наш === z.id, естеВярно = нов === z.id;
    const знак = (бешеВярно && !естеВярно) ? 'СЧУПЕНО' : (!бешеВярно && естеВярно) ? 'ОПРАВЕНО' : 'смяна';
    if (знак === 'СЧУПЕНО') счупени++;
    console.log(знак + ' « ' + z.t + ' » (' + z.id + ') : ' + (z.наш || 'ТИШИНА') + ' → ' + (нов || 'ТИШИНА'));
  }
}
console.log('смени ' + смени + ' от ' + базаЗагл.length + ' · СЧУПЕНИ ' + счупени);

// (3г) контролите пак
const ktrlPoz = ['кога да започна захранването', 'колко пъти на ден яде', 'хвърля храната на пода', 'как се стерилизира шише'];
const ktrlNeg = ['пшшш ъъъ ккк ммм', 'zzzz qqqq wwww', 'глупости небивалици измишльотини кречетало'];
const p = ktrlPoz.filter(q => W2.BL_MATCH(q, 'Захранване')).length;
const n = ktrlNeg.filter(q => !W2.BL_MATCH(q, 'Захранване')).length;
console.log('\nКОНТРОЛ СЛЕД ВЛИВАНЕТО: положителни ' + p + '/' + ktrlPoz.length + ' · отрицателни ' + n + '/' + ktrlNeg.length);

fs.writeFileSync(path.join(__dirname, 'klyuchove_hranene.json'), JSON.stringify(чисти, null, 2), 'utf8');
console.log('\nЗАПИСАНО: scratchpad/klyuchove_hranene.json');
