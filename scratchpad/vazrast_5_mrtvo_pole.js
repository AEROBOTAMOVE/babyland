// МЕРКА 5 — РАБОТИ ЛИ ИЗОБЩО ПОЛЕТО `от`/`до`?
//
// Съмнението: helper.js:1370 чете `load('bl_baby', {})`, но НИТО ЕДИН файл в js/
// не дефинира ГЛОБАЛЕН `load` — всеки има свой `const load` вътре в своя IIFE.
// helper.js също е IIFE ('use strict') и НЕ декларира load. Значи
// `typeof load === 'function'` е false → възрастМесеци() връща null → множителят
// е 1 за ВСЯКА карта.
//
// Уредът трябва да отговори на ТРИ въпроса с числа:
//   А) както е СЕГА (пясъчник = жив код): мени ли възрастта отговорите?
//   Б) с ОТВОРЕН гейт (работещ load + BL_AGE): мени ли ги?
//   В) ако Б мени, а А не — гейтът е причината, полето е МЪРТВО.
//
// ПЪТ НАЗАД: нищо не се записва в js/. kbPatch/patch живеят само в паметта.
const { zaredi } = require('../dev/pyasachnik.js');

// ── BL_AGE: ВЯРНО КОПИЕ на rooms2.js:156-192 (само термин, без корекция) ──
//    months = totalDays / 30.4375  (rooms2.js:162)
function BL_AGE_replika(birth) {
  if (!birth) return null;
  const b = new Date(birth + 'T00:00:00');
  const now = new Date('2026-09-30T00:00:00');
  if (isNaN(b) || b > now) return null;
  const totalDays = Math.round((now - b) / 86400000);
  return { months: totalDays / 30.4375, totalDays };
}

// патч, който ОТВАРЯ гейта — минимална промяна, само реда 1370
const ОТВОРИ = src => {
  const старо = "const б = (typeof load === 'function') ? load('bl_baby', {}) : null;";
  if (!src.includes(старо)) throw new Error('КОТВАТА ЗА ПАТЧ ИЗЧЕЗНА — helper.js се е сменил, мярката е негодна');
  return src.replace(старо, "const б = (function(){ try { return JSON.parse(window.localStorage.getItem('bl_baby')) || {}; } catch(e){ return {}; } })();");
};

function мозък(birth, отворен) {
  const W = zaredi(отворен ? ОТВОРИ : null, { памет: { bl_baby: { birth } } });
  W.BL_AGE = BL_AGE_replika; W.window = W;
  return W;
}

// ── КОНТРОЛА 1: вижда ли самият патч? ─────────────────────────────────
const Wо = мозък('2026-08-30', true);   // бебе на 1 месец
console.log('КОНТРОЛА · BL_AGE реплика за 2026-08-30 →',
  JSON.stringify(BL_AGE_replika('2026-08-30')), '(≈1 месец)');

// ── корпус: по един СОБСТВЕН ключ от всяка карта С поле `от`/`до` ──────
const E0 = (мозък('2026-08-30', false).BL_KB || мозък('2026-08-30', false).KB).entries;
const сПоле = E0.filter(e => (e.от != null || e.до != null) && e.keys && e.keys.length && e.room);
console.log('карти С поле и с ключове:', сПоле.length);

// вземи ключ, който е ДОСТАТЪЧНО дълъг (за да не се разсее)
const корпус = сПоле.map(e => ({
  чака: e.id, room: e.room,
  q: (e.keys.filter(k => k.length >= 12).sort((a, b) => b.length - a.length)[0]) || e.keys[0],
  от: e.от, до: e.до,
})).filter(x => x.q);
console.log('корпус въпроси:', корпус.length);

function обиколка(W) {
  const вън = [];
  for (const x of корпус) {
    let r = null; try { r = W.BL_MATCH(x.q, x.room); } catch (e) {}
    вън.push(r ? r.id : null);
  }
  return вън;
}

// две много различни възрасти
const ВЪЗРАСТИ = [['2026-08-30', '≈1 месец'], ['2023-09-30', '≈36 месеца']];
const снимки = {};
for (const [birth, име] of ВЪЗРАСТИ) for (const отворен of [false, true]) {
  const W = мозък(birth, отворен);
  снимки[(отворен ? 'ОТВОРЕН' : 'СЕГА') + '|' + име] = обиколка(W);
}

const ключове = Object.keys(снимки);
console.log('\n=== РАЗЛИКИ между снимките (брой въпроси с РАЗЛИЧЕН отговор) ===');
function разлика(a, b) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; }

const A1 = снимки['СЕГА|≈1 месец'], A36 = снимки['СЕГА|≈36 месеца'];
const B1 = снимки['ОТВОРЕН|≈1 месец'], B36 = снимки['ОТВОРЕН|≈36 месеца'];
console.log('А) СЕГА    · 1 месец срещу 36 месеца :', разлика(A1, A36), 'от', корпус.length);
console.log('Б) ОТВОРЕН · 1 месец срещу 36 месеца :', разлика(B1, B36), 'от', корпус.length);
console.log('   СЕГА(1м) срещу ОТВОРЕН(1м)        :', разлика(A1, B1));
console.log('   СЕГА(36м) срещу ОТВОРЕН(36м)      :', разлика(A36, B36));

const мъртво = разлика(A1, A36) === 0 && разлика(B1, B36) > 0;
console.log('\nПРИСЪДА:', мъртво
  ? 'ПОЛЕТО `от`/`до` Е МЪРТВО в живия код. Възрастта не мени НИЩО, докато гейтът `load` е затворен.'
  : (разлика(A1, A36) > 0 ? 'полето РАБОТИ и сега — възрастта мени отговори' : 'нито отворен, нито затворен мени нищо — виж корпуса'));

// колко карти биха паднали/качили при отворен гейт (примери)
if (мъртво) {
  const примери = [];
  for (let i = 0; i < корпус.length && примери.length < 8; i++)
    if (B1[i] !== B36[i]) примери.push(корпус[i].q + '  →  1м: ' + B1[i] + '   |   36м: ' + B36[i]);
  console.log('\nпримери (само при ОТВОРЕН гейт се различават):');
  примери.forEach(p => console.log('  ' + p));
}
