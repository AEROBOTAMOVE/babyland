// ═══════════════════════════════════════════════════════════════════════
// 🔗 ПРИЛАГАНЕ НА ЧИПОВЕ — с мярка, не наслуки
//
// Чипът е бутонът ПОД отговора. Той не мени КОЙ отговаря — мени накъде
// може да продължи майката. Затова мярката тук е друга от тази при
// ключовете:
//   1. всяко id съществува (чип към нищото изчезва БЕЗШУМНО, helper.js:2399)
//   2. никой чип не сочи към собствената си карта (гейтът го отказва)
//   3. НИТО ЕДИН отговор не се мени — чиповете не бива да пипат матчъра
//   4. kb.js се парсва след писането
//
// ПУСКАНЕ: node dev/prilozhi_chipove.js dev/nahodki/chipove.json [--pishi]
// ПЪТ НАЗАД: js/kb.js.PREDI_CHIPOVE  ·  git revert
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { zaredi } = require('./pyasachnik.js');
const ПИШИ = process.argv.includes('--pishi');
const ВХОД = process.argv[2];
if (!ВХОД || !fs.existsSync(ВХОД)) { console.log('🔴 подай json с {карта: [чипове]}'); process.exit(2); }
const НАБОР = JSON.parse(fs.readFileSync(ВХОД, 'utf8'));
const Ф = path.join(__dirname, '..', 'js/kb.js');
const изв = fs.readFileSync(Ф, 'utf8');

// ── 1 · контрол СРЕЩУ ЖИВАТА БАЗА, преди да се пипа текст ───────────────
const W0 = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB0 = W0.BL_KB || W0.KB;
const има = new Set((KB0.entries || []).map(e => e.id));
let лошо = 0;
for (const [цел, чипове] of Object.entries(НАБОР)) {
  if (!има.has(цел)) { console.log('🔴 няма карта ' + цел); лошо++; continue; }
  for (const c of чипове) {
    if (!има.has(c)) { console.log('🔴 чип към несъществуваща карта: ' + цел + ' → ' + c); лошо++; }
    if (c === цел) { console.log('🔴 чип към самата себе си: ' + цел); лошо++; }
  }
}
if (лошо) { console.log('\n🔴 ' + лошо + ' проблема — НЕ ПИША.'); process.exit(2); }
console.log('✅ всичките ' + Object.keys(НАБОР).length + ' карти и '
  + Object.values(НАБОР).reduce((a, x) => a + x.length, 0) + ' чипа съществуват');

// ── 2 · операцията върху текста ─────────────────────────────────────────
function опери(src) {
  const NL = src.indexOf('\r\n') > -1 ? '\r\n' : '\n';
  const L = src.split(/\r?\n/);
  let бр = 0; const пропуснати = [];
  for (const [цел, чипове] of Object.entries(НАБОР)) {
    // id-тата са с единични ИЛИ двойни кавички — платено веднъж вече
    const i = L.findIndex(x => x.indexOf("id: '" + цел + "'") > -1 || x.indexOf('id: "' + цел + '"') > -1);
    if (i < 0) { пропуснати.push(цел + ': няма ред с id'); continue; }
    // 🔴 09.09 (пробата отказа да пише и беше права): dev/slivach_karti.js
    //   НЕ ЗАПИСВА полето `chips`, когато масивът е празен. Тоест тези карти
    //   нямат празен масив за замяна — те изобщо нямат такъв ред.
    //   Затова: ако го има — заменяме; ако го няма — ВМЪКВАМЕ преди
    //   затварящата скоба на самата карта.
    const редНаЧипове = 'chips: [' + чипове.map(c => "'" + c + "'").join(', ') + ']';
    let k = -1, край = -1;
    for (let j = i + 1; j < L.length; j++) {
      if (L[j].indexOf("id: '") > -1 || L[j].indexOf('id: "') > -1) break;   // почна следващата карта
      if (/chips:\s*\[/.test(L[j])) { k = j; break; }
      if (/^\s*\},?\s*$/.test(L[j])) { край = j; break; }                    // краят на тази карта
    }
    if (k >= 0) {
      // пипаме САМО празни масиви — карта с чипове не се пренаписва
      if (!/chips:\s*\[\s*\]/.test(L[k])) { пропуснати.push(цел + ': chips НЕ е празен — не пипам'); continue; }
      L[k] = L[k].replace(/chips:\s*\[\s*\]/, редНаЧипове);
      бр++; continue;
    }
    if (край < 0) { пропуснати.push(цел + ': не намирам края на картата'); continue; }
    // отстъпът се взима от предишния ред, за да легне като останалите
    const отстъп = (L[край - 1].match(/^\s*/) || [''])[0];
    // предишният ред трябва да завършва със запетая, иначе става синтактична грешка
    if (!/,\s*$/.test(L[край - 1])) L[край - 1] = L[край - 1].replace(/\s*$/, ',');
    L.splice(край, 0, отстъп + редНаЧипове);
    бр++;
  }
  return { src: L.join(NL), бр, пропуснати };
}

let р;
try { р = опери(изв); } catch (e) { console.log('🔴 ' + e.message + ' — СЛЯП'); process.exit(2); }
console.log('✅ вписани: ' + р.бр + ' карти');
if (р.пропуснати.length) { console.log('⚠️ пропуснати ' + р.пропуснати.length + ':'); р.пропуснати.slice(0, 10).forEach(x => console.log('   ' + x)); }
if (!р.бр) { console.log('🔴 нищо не се вписа'); process.exit(2); }

// ── 3 · МЯРКАТА: мени ли се КОЙ отговаря ────────────────────────────────
const W1 = zaredi(null, { kbPatch: () => р.src, памет: { bl_baby: { birth: '2025-11-20' } } });
const KB1 = W1.BL_KB || W1.KB;
if ((KB1.entries || []).length !== (KB0.entries || []).length) { console.log('🔴 броят карти се смени!'); process.exit(2); }
if (W1.BL_REDFLAG('бебето не диша') !== true) { console.log('🔴 контролата пада'); process.exit(2); }

const съди = W => (t, s) => {
  try {
    if (W.BL_SHAKEN && W.BL_SHAKEN(t)) return 'shaken';
    const m = W.BL_MOTHERFLAG(t); if (m) return m;
    if (W.BL_PREGFLAG(t, s || null)) return 'preg';
    if (W.BL_REDFLAG(t)) return 'red';
    const k = W.BL_MATCH(t, s || null); return k ? k.id : '—';
  } catch (e) { return 'грешка'; }
};
const а = съди(W0), б = съди(W1);
let изр = 0; const смени = [];
for (const и of ['korpus350', 'korpus_nevinni', 'korpus_nevinni2', 'korpus_speshni', 'korpus_hipoteza']) {
  let сп; try { сп = require('./' + и + '.json'); } catch (e) { continue; }
  for (const q of сп) { if (!q.t) continue; изр++; const x = а(q.t, q.r), y = б(q.t, q.r); if (x !== y) смени.push('[' + q.e + '] ' + q.t + '  ' + x + ' → ' + y); }
}
console.log('✅ корпус ' + изр + ' изречения · сменен отговор при ' + смени.length);
смени.slice(0, 8).forEach(x => console.log('   ⚠️ ' + x));
if (смени.length) { console.log('🔴 чиповете НЕ бива да менят кой отговаря — спирам.'); process.exit(2); }

// ── 4 · счупени чипове в цялата база СЛЕД промяната ────────────────────
const имаСлед = new Set((KB1.entries || []).map(e => e.id));
const счупени = [];
for (const e of (KB1.entries || [])) for (const c of (e.chips || [])) if (!имаСлед.has(String(c))) счупени.push(e.id + ' → ' + c);
console.log('✅ счупени чипове в цялата база след промяната: ' + счупени.length);
if (счупени.length) { счупени.slice(0, 8).forEach(x => console.log('   🔴 ' + x)); process.exit(2); }
const безЧипСлед = (KB1.entries || []).filter(e => !((e.chips || []).length)).length;
console.log('✅ карти без чип: ' + (KB0.entries || []).filter(e => !((e.chips || []).length)).length + ' → ' + безЧипСлед);

if (!ПИШИ) { console.log('\n(само мярка · за запис: --pishi)'); process.exit(0); }
fs.writeFileSync(Ф + '.PREDI_CHIPOVE', изв);
fs.writeFileSync(Ф, р.src);
console.log('\n✅ ЗАПИСАНО в js/kb.js  ·  копие: js/kb.js.PREDI_CHIPOVE');
