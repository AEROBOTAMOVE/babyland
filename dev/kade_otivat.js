// ═══════════════════════════════════════════════════════════════════════
// 🧭 КЪДЕ ОТИВАТ — за изречения: коя карта вади помощничката (по стаи).
// ЗАЩО (06.10): в sn-potene („Поти се, докато спи“) стояха 8 чужди ключа
//   („се дърпа от гърдата“, „се изринало от памперса“…) и текст на инструкция —
//   залепени от скрипт. Преди да ги преместя, гледам къде отиват БЕЗ тях.
// ПУСКАНЕ: node dev/kade_otivat.js файл.json [--bez id:ключ1|ключ2]
//   файл.json = [["изречение", "Стая"], …]
// ПЪТ НАЗАД: само чете проекта.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const { zaredi } = require('./pyasachnik.js');
const ВХ = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const и = process.argv.indexOf('--bez');
let кръпка = null;
if (и > -1) {
  const арг = process.argv[и + 1], д = арг.indexOf(':');            // само ПЪРВОТО „:“ — ключът-инструкция носи свое
  const id = арг.slice(0, д), кл = арг.slice(д + 1);
  const махни = кл.split('|');
  кръпка = src => {
    const L = src.split(/\r?\n/), i = L.findIndex(x => x.indexOf("id: '" + id + "'") > -1);
    for (let j = i + 1; j < L.length && L[j].indexOf("id: '") < 0; j++)
      if (L[j].indexOf('keys: [') > -1) { for (const к of махни) L[j] = L[j].split("'" + к + "', ").join('').split(", '" + к + "'").join(''); break; }
    return L.join('\n');
  };
}
const W = zaredi(null, кръпка ? { kbPatch: кръпка } : undefined);   // 1-ият аргумент кърпи helper.js, не kb.js
const заглавие = id => { const е = W.KB.entries.find(x => x.id === id); return е ? е.title : '?'; };
for (const [т, стая] of ВХ) {
  let р; try { р = W.BL_MATCH(т, стая); } catch (e) { р = null; }
  const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
  const id = з && з.id;
  console.log((стая + '').padEnd(16) + ' „' + т + '“ → ' + (id ? id + ' · ' + заглавие(id) : '— тишина'));
}
