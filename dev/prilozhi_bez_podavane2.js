// Втора порция за БЕЗ_ПОДАВАНЕ — 22 карти, чийто КЛЮЧ Е самият въпрос
// на майката. Тоест те са верният отговор ПО СТРОЕЖ, не по преценка.
//
// ⚠️ Изключен е nd-parvite-pati: панелът от 12 съдии вече го отсъди като
//    И верен, И грешен според въпроса. Списък по id е сляп за въпроса.
//
// ПЪТ НАЗАД: js/helper.js.PREDI_BEZ_PODAVANE2 · git revert · масивът се
// реже id по id.
const fs = require('fs');
const ПИШИ = process.argv.includes('--pishi');
const П = 'js/helper.js';
const НОВИ = JSON.parse(fs.readFileSync('dev/_bez_podavane_2.json', 'utf8'));

let s = fs.readFileSync(П, 'utf8');
const бл = /const БЕЗ_ПОДАВАНЕ = \[([\s\S]*?)\];/.exec(s);
if (!бл) { console.log('🔴 не намирам БЕЗ_ПОДАВАНЕ'); process.exit(2); }

const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const има = new Set((KB.entries || []).map(e => e.id));
let лошо = 0;
for (const i of НОВИ) {
  if (!има.has(i)) { console.log('🔴 няма карта ' + i); лошо++; }
  if (бл[1].indexOf("'" + i + "'") >= 0) { console.log('🔴 вече е вътре: ' + i); лошо++; }
}
if (лошо) { console.log('\n🔴 ' + лошо + ' проблема — НЕ ПИША.'); process.exit(2); }
console.log('✅ всичките ' + НОВИ.length + ' id съществуват и не се повтарят');

const КОТВА = "        'zim-oblichane-sloeve', 'zim-studeno-razhodka'];";
if (s.split(КОТВА).length - 1 !== 1) {
  // котвата е последният ред на масива — намираме го по друг път
  const край = бл[0];
  const нов = край.replace(/\];\s*$/, ",\n" + КОМЕНТАР() + '\n        ' + НОВИ.map(i => "'" + i + "'").join(', ') + '];');
  s = s.replace(край, нов);
} else {
  s = s.replace(КОТВА, КОТВА.replace('];', ',\n' + КОМЕНТАР() + '\n        ' + НОВИ.map(i => "'" + i + "'").join(', ') + '];'));
}

function КОМЕНТАР() {
  return [
    '        // ➕ 09.09 · ВТОРА ПОРЦИЯ · 22 карти, чийто КЛЮЧ Е САМИЯТ ВЪПРОС.',
    '        //   Критерият тук е по-строг от „съдия каза, че е добра": въпросът на',
    '        //   майката е БУКВАЛНО ключ на картата, тоест тя е верният отговор по',
    '        //   СТРОЕЖ. Всичките 22 бяха написани или напаснати днес точно за тези',
    '        //   въпроси и въпреки това майката получаваше врата, защото картата',
    '        //   живее в друга стая:',
    '        //     „гърдите ми са като камъни" (Захранване) → картата е в Моето бебе',
    '        //     „желязо трябва ли на кърмено бебе" (Здраве) → в Захранване',
    '        //     „на 9 месеца колко зъба" (Моето бебе) → в Здраве и SOS',
    '        //   ⚠️ nd-parvite-pati Е ИЗКЛЮЧЕН, макар да минава критерия: панелът',
    '        //   от 12 съдии вече го отсъди като И верен, И ГРЕШЕН според въпроса.',
    '        //   Списък по id е сляп за въпроса — това е цената му.',
  ].join('\n');
}

const проверка = /const БЕЗ_ПОДАВАНЕ = \[([\s\S]*?)\];/.exec(s);
const брой = (проверка[1].match(/'[a-z0-9-]+'/g) || []).length;
console.log('✅ списъкът става ' + брой + ' карти');
for (const i of НОВИ) if (проверка[1].indexOf("'" + i + "'") < 0) { console.log('🔴 „' + i + '" не влезе'); process.exit(2); }

if (!ПИШИ) { console.log('\n(сухо · за запис: --pishi)'); process.exit(0); }
fs.writeFileSync(П + '.PREDI_BEZ_PODAVANE2', fs.readFileSync(П, 'utf8'));
fs.writeFileSync(П, s);
console.log('\n✅ ЗАПИСАНО · копие: ' + П + '.PREDI_BEZ_PODAVANE2');
