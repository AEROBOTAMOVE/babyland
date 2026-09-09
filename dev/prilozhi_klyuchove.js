// ═══════════════════════════════════════════════════════════════════════
// 🔑 КЛЮЧОВА ХИРУРГИЯ С МЯРКА — прилага набор ключове върху СЪЩЕСТВУВАЩИ карти
//
// ЗАЩО СЪЩЕСТВУВА: основният закон на този проект е, че СЪДЪРЖАНИЕТО почти
//   винаги го има, а липсват ДУМИТЕ. Тоест повечето работа е добавяне на
//   ключове — и точно там най-лесно се чупи нещо, защото нов ключ може да
//   ОТКРАДНЕ чужда карта, без никой да забележи.
//
// МЯРКАТА Е В ДВЕ ПОСОКИ:
//   1. Всеки нов ключ, зададен като въпрос, вади ли СВОЯТА карта?
//      (Мярката „улучва ли правилото само себе си" — намирала е мъртви ключове.)
//   2. Целият корпус от 1690 етикетирани изречения — колко от тях СМЕНЯТ
//      картата си? Смяна от ТИШИНА към карта е полза; смяна от една карта
//      към друга иска човешки поглед.
//
// ПУСКАНЕ: node dev/prilozhi_klyuchove.js <файл.json> [--pishi]
//   Файлът е { "id-на-карта": ["ключ", "ключ", …] }. Подава се като ФАЙЛ,
//   защото тръбата изяжда обратните черти и кавичките — платено няколко пъти.
// ИЗХОД: 0 = ок · 2 = сляп (липсва карта, липсва keys, сляпа сонда)
// ПЪТ НАЗАД: без --pishi нищо не се записва. С --pishi — git revert.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { zaredi } = require('./pyasachnik.js');
const САМО = !process.argv.includes('--pishi');
const ВХОД = process.argv[2];
if (!ВХОД || !fs.existsSync(ВХОД)) { console.log('🔴 подай json с {карта: [ключове]}'); process.exit(2); }
const НАБОР = JSON.parse(fs.readFileSync(ВХОД, 'utf8'));
const Ф = path.join(__dirname, '..', 'js/kb.js');
const изв = fs.readFileSync(Ф, 'utf8');

function опери(src) {
  const NL = src.indexOf('\r\n') > -1 ? '\r\n' : '\n';
  const L = src.split(/\r?\n/);
  let общо = 0; const по = {};
  for (const [id, кл] of Object.entries(НАБОР)) {
    // 🔴 09.09 (второто сляпо петно на същия уред): js/kb.js носи 667 id-та
    //   с ЕДИНИЧНИ и 32 с ДВОЙНИ кавички (dev/slivach_statii.js го знае и го
    //   пише в коментар). Тук се търсеше само единичната форма — тоест 32
    //   карти бяха „несъществуващи" за ключовата хирургия и уредът спираше
    //   с „няма карта", вместо да ги оперира. Намерено, защото реколтата
    //   поиска ключове за gz-kysno-govor.
    const i = L.findIndex(x => x.indexOf("id: '" + id + "'") > -1 || x.indexOf('id: "' + id + '"') > -1);
    if (i < 0) throw new Error('няма карта ' + id);
    // 🔴 09.09: прозорецът беше 16 реда и уредът обяви „няма keys за
    //   nia-gyrbat" — а keys ги ИМА. Между id и keys стоеше 40-редов
    //   коментар (защо голият ключ „гърб" е оборен с мярка). Тоест
    //   картите с най-скъпо платено обяснение бяха НЕДОСТИЖИМИ за
    //   уреда — точно обратното на нужното.
    //   Сега прозорецът е широк, но СПИРА на следващата карта: няма как
    //   да закачим чужди keys, колкото и дълъг да е коментарът.
    let k = -1;
    for (let j = i + 1; j < L.length; j++) {
      if (L[j].indexOf("id: '") > -1) break;              // започна следващата карта
      if (L[j].indexOf('keys: [') > -1) { k = j; break; }
    }
    if (k < 0) throw new Error('няма keys за ' + id);
    const нови = кл.filter(x => x && L[k].indexOf("'" + x + "'") < 0 && x.indexOf("'") < 0);
    L[k] = L[k].replace('keys: [', 'keys: [' + нови.map(x => "'" + x + "', ").join(''));
    общо += нови.length; по[id] = нови.length;
  }
  return { src: L.join(NL), общо, по };
}

let р;
try { р = опери(изв); } catch (e) { console.log('🔴 ' + e.message + ' — СЛЯП'); process.exit(2); }
console.log('добавени ключове: ' + р.общо);
for (const [k, v] of Object.entries(р.по)) console.log('   ' + k + ': +' + v);

const A = zaredi(null);
const B = zaredi(null, { kbPatch: () => р.src });
if (!A.BL_MATCH('температура')) { console.log('🔴 сляпа сонда'); process.exit(2); }
const кид = W => (t, s) => { const k = W.BL_MATCH(t, s || null); return k ? k.id : '-'; };
const а = кид(A), б = кид(B);

let ок = 0, общо = 0; const паднали = [];
for (const [id, кл] of Object.entries(НАБОР)) for (const к of кл) {
  общо++; const r = б(к); if (r === id) ок++; else паднали.push(id + '  ← „' + к + '"  дава ' + r);
}
let изр = 0; const смен = [];
for (const и of ['korpus350', 'korpus_nevinni', 'korpus_nevinni2', 'korpus_speshni', 'korpus_hipoteza'])
  for (const q of require('./' + и + '.json')) {
    const т = q.t; if (!т) continue; изр++;
    const x = а(т), y = б(т); if (x !== y) смен.push(и + ' [' + q.e + '] ' + т + '  : ' + x + ' -> ' + y);
  }
console.log('');
console.log('── РАВНОСМЕТКА ──');
console.log('  ключът вади СВОЯТА карта: ' + ок + '/' + общо);
паднали.slice(0, 25).forEach(x => console.log('     ⚠️ ' + x));
console.log('  корпус ' + изр + ' изречения · сменена карта при ' + смен.length);
смен.slice(0, 25).forEach(x => console.log('     ⚠️ ' + x));
if (!САМО) { fs.writeFileSync(Ф, р.src); console.log(''); console.log('✅ ЗАПИСАНО в js/kb.js'); }
else { console.log(''); console.log('(само мярка · за запис: --pishi)'); }
