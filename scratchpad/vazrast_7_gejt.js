// МЕРКА 7 — РАБОТИ ЛИ ГЕЙТЪТ? (лека版, пише напредък във файл)
// Въпросът: `възрастМесеци()` чете `load('bl_baby')`, но ГЛОБАЛЕН `load` няма
// в нито един от 60 файла в js/ — всеки има свой вътре в своя IIFE.
// ПЪТ НАЗАД: нищо не се пише в js/.
const fs = require('fs');
const { zaredi } = require('../dev/pyasachnik.js');
const ЛОГ = __dirname + '/_gejt.log';
const log = s => { console.log(s); fs.appendFileSync(ЛОГ, s + '\n'); };
fs.writeFileSync(ЛОГ, '');

const BL_AGE_replika = birth => {
  const b = new Date(birth + 'T00:00:00'), now = new Date('2026-09-30T00:00:00');
  if (isNaN(b) || b > now) return null;
  const totalDays = Math.round((now - b) / 86400000);
  return { months: totalDays / 30.4375, totalDays };   // rooms2.js:162
};
const КОТВА = "const б = (typeof load === 'function') ? load('bl_baby', {}) : null;";
const ОТВОРИ = src => {
  if (!src.includes(КОТВА)) throw new Error('КОТВАТА ИЗЧЕЗНА — мярката е негодна');
  return src.replace(КОТВА, "const б = (function(){ try { return JSON.parse(window.localStorage.getItem('bl_baby')) || {}; } catch(e){ return {}; } })();");
};
function мозък(birth, отворен) {
  const W = zaredi(отворен ? ОТВОРИ : null, { памет: { bl_baby: { birth } } });
  W.window = W; W.BL_AGE = BL_AGE_replika;
  return W;
}

log('КОНТРОЛА · реплика BL_AGE(2026-08-30) = ' + JSON.stringify(BL_AGE_replika('2026-08-30')) + '  (≈1.0 месец)');
log('КОНТРОЛА · реплика BL_AGE(2023-09-30) = ' + JSON.stringify(BL_AGE_replika('2023-09-30')) + '  (≈36 месеца)');

const W0 = мозък('2026-08-30', false);
const E = (W0.BL_KB || W0.KB).entries;

// корпус: карти с ТЯСЕН прозорец (до <= 12), за да е ясно кога са „не на място"
const тесни = E.filter(e => e.до != null && e.до <= 12 && e.keys && e.keys.length && e.room);
const корпус = тесни.map(e => ({
  чака: e.id, room: e.room, от: e.от, до: e.до,
  q: e.keys.filter(k => k.length >= 14).sort((a, b) => b.length - a.length)[0] || e.keys[0],
})).filter(x => x.q).slice(0, 220);
log('корпус: ' + корпус.length + ' въпроса от карти с тесен прозорец (до <= 12 месеца)');

function обиколка(W, име) {
  const t0 = Date.now(); const вън = [];
  for (const x of корпус) { let r = null; try { r = W.BL_MATCH(x.q, x.room); } catch (e) {} вън.push(r ? r.id : null); }
  log('  обиколка ' + име + ': ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  return вън;
}

const A1 = обиколка(W0, 'СЕГА·1м');
const A36 = обиколка(мозък('2023-09-30', false), 'СЕГА·36м');
const B1 = обиколка(мозък('2026-08-30', true), 'ОТВОРЕН·1м');
const B36 = обиколка(мозък('2023-09-30', true), 'ОТВОРЕН·36м');

const разл = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);
log('\n=== ЧИСЛАТА (' + корпус.length + ' въпроса) ===');
log('А) СЕГА    (жив код) · 1м срещу 36м : ' + разл(A1, A36));
log('Б) ОТВОРЕН гейт      · 1м срещу 36м : ' + разл(B1, B36));
log('   СЕГА·1м  срещу ОТВОРЕН·1м        : ' + разл(A1, B1));
log('   СЕГА·36м срещу ОТВОРЕН·36м       : ' + разл(A36, B36));

const мъртво = разл(A1, A36) === 0 && разл(A36, B36) > 0;
log('\nПРИСЪДА: ' + (мъртво
  ? 'ПОЛЕТО `от`/`до` НЕ РАБОТИ В ЖИВИЯ КОД. Гейтът `load` е затворен → възрастМесеци() = null → множителят е 1 за всичките 1621 карти.'
  : (разл(A1, A36) > 0 ? 'полето работи и сега' : 'и отвореният гейт не мени нищо в този корпус — виж по-широк корпус')));

if (разл(A36, B36) > 0) {
  log('\nпримери (36-месечно дете; СЕГА срещу ОТВОРЕН гейт):');
  let n = 0;
  for (let i = 0; i < корпус.length && n < 10; i++) if (A36[i] !== B36[i]) {
    log('  „' + корпус[i].q + '“  [от ' + корпус[i].от + ' до ' + корпус[i].до + ']');
    log('      СЕГА → ' + A36[i] + '   |   ОТВОРЕН → ' + B36[i]); n++;
  }
}
