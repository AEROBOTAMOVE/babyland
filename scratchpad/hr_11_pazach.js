// ПАЗАЧ: 1) червените флагове непипнати · 2) 1200 СЪЩЕСТВУВАЩИ ключа от
// всички стаи водят до същата карта преди и след вливането.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { памет: { bl_baby: { birth: '2025-11-20' } } };
const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_hranene.json'), 'utf8'));

const W1 = zaredi(null, ПАМ), W2 = zaredi(null, ПАМ);
const E1 = (W1.BL_KB || W1.KB).entries, E2 = (W2.BL_KB || W2.KB).entries;
for (const [цел, кл] of Object.entries(P)) { const c = E2.find(x => x.id === цел); for (const k of кл) c.keys.push(k); }

// 1) червените флагове
const K1 = (W1.BL_KB || W1.KB), K2 = (W2.BL_KB || W2.KB);
for (const поле of ['redFlags', 'pregFlags', 'dvFlags', 'motherFlags', 'heavyFlags', 'mamaBodyFlags', 'lossFlags']) {
  const a = JSON.stringify(K1[поле] && K1[поле].length), b = JSON.stringify(K2[поле] && K2[поле].length);
  console.log(поле + ': ' + a + ' → ' + b + (a === b ? '  непипнато' : '  !!! СМЕНЕНО'));
}
const флаг = W1.BL_REDFLAG || W1.BL_FLAG;
const спешни = ['бебето не диша', 'детето посиня', 'температура 39 на два месеца', 'бебето е отпуснато като парцал', 'падна от масата и повърна'];
if (typeof (W2.BL_REDFLAG) === 'function') {
  let еднакви = 0;
  for (const q of спешни) { const a = !!W1.BL_REDFLAG(q), b = !!W2.BL_REDFLAG(q); if (a === b) еднакви++; else console.log('!!! ФЛАГ СМЕНЕН: ' + q); }
  console.log('BL_REDFLAG: ' + еднакви + '/' + спешни.length + ' еднакви преди и след');
} else console.log('BL_REDFLAG го няма в прозореца — флаговете се четат само по дължина (горе)');

// 2) 1200 съществуващи ключа, по равно от всички стаи
const проби = [];
for (const c of E1) {
  const кл = (c.keys || []).filter(k => String(k).split(' ').length >= 2);
  if (кл.length) проби.push([кл[Math.floor(кл.length / 2)], c.id, c.room]);
}
let същ = 0, разл = [];
for (const [k, id, room] of проби) {
  const a = W1.BL_MATCH(k, room), b = W2.BL_MATCH(k, room);
  const ai = a ? a.id : null, bi = b ? b.id : null;
  if (ai === bi) същ++; else разл.push(room + '/' + id + ' « ' + k + ' » : ' + (ai || 'ТИШИНА') + ' → ' + (bi || 'ТИШИНА'));
}
console.log('\n' + проби.length + ' СЪЩЕСТВУВАЩИ многодумни ключа (всички 9 стаи): еднакъв отговор ' + същ + ' · СМЕНЕН ' + разл.length);
разл.forEach(s => console.log('  СМЯНА ' + s));
