// Трета порция за БЕЗ_ПОДАВАНЕ — 7 карти, прочетени ОТ ЧОВЕК (15.09).
//
// Остатъкът от 10-те врати. При всяка печели ПРАВИЛНАТА карта, силно, но
// тя живее в друга стая и майката получаваше „Това е повече по частта на…“.
// Критерият тук НЕ е машинен: всяка двойка въпрос → карта е прочетена в
// тази сесия (dev/tarsi_karta.js --pitaj) и текстът отговаря на въпроса.
//
// ⚠️ nd-parvite-pati е пак ИЗКЛЮЧЕН — присъдата на панела от 09.09 важи.
// ⚠️ „къде да пиша ако нещо не работи“ НЕ се лекува тук: там печелеше
//    ГРЕШНА карта (търсачката). Лекът са ключове към правилната карта.
//
// ПУСКАНЕ: node dev/prilozhi_bez_podavane3.js [--pishi]   (без --pishi е сухо)
// ПЪТ НАЗАД: js/helper.js.PREDI_BEZ_PODAVANE3 · git revert
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));
const ПИШИ = process.argv.includes('--pishi');
const П = 'js/helper.js';
const НОВИ = JSON.parse(fs.readFileSync('dev/_bez_podavane_3.json', 'utf8'));

let s = fs.readFileSync(П, 'utf8');
const Р = /const БЕЗ_ПОДАВАНЕ = \[([\s\S]*?)\];/;
const бл = Р.exec(s);
if (!бл) { console.log('🔴 не намирам БЕЗ_ПОДАВАНЕ'); process.exit(2); }

const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const има = new Set(((W.BL_KB || W.KB).entries || []).map(e => e.id));
let лошо = 0;
for (const i of НОВИ) {
  if (!има.has(i)) { console.log('🔴 няма карта ' + i); лошо++; }
  if (бл[1].indexOf("'" + i + "'") >= 0) { console.log('🔴 вече е вътре: ' + i); лошо++; }
}
if (лошо) { console.log('\n🔴 ' + лошо + ' проблема — НЕ ПИША.'); process.exit(2); }
const преди = (бл[1].match(/'[a-z0-9-]+'/g) || []).length;
console.log('✅ всичките ' + НОВИ.length + ' id съществуват и не се повтарят · в списъка сега: ' + преди);

const NL = s.indexOf('\r\n') > -1 ? '\r\n' : '\n';
const КОМЕНТАР = [
  '        // ➕ 15.09 · ТРЕТА ПОРЦИЯ · 7 карти, прочетени ОТ ЧОВЕК за точно тези въпроси.',
  '        //   Остатъкът от 10-те врати: печели правилната карта, силно, но в друга стая.',
  '        //     „косата ми пада на кичури“ (Жената в мен) → pp-kosopad е в Здраве и SOS',
  '        //     „кога да си взема душ…“ (Дневник на мама) → mb-dushut е в Моето бебе',
  '        //     „колко пъти на ден ака на 2 месеца“ (Моето бебе) → Здраве и SOS',
  '        //   ⚠️ nd-parvite-pati остава ИЗКЛЮЧЕН (панелът от 09.09).',
].join(NL);
const нов = бл[0].replace(/\];$/, ',' + NL + КОМЕНТАР + NL + '        ' + НОВИ.map(i => "'" + i + "'").join(', ') + '];');
s = s.replace(бл[0], () => нов);

const пак = Р.exec(s);
const след = (пак[1].match(/'[a-z0-9-]+'/g) || []).length;
if (след !== преди + НОВИ.length) { console.log('🔴 броят е ' + след + ', очаквах ' + (преди + НОВИ.length) + ' — НЕ ПИША'); process.exit(2); }
for (const i of НОВИ) if (пак[1].indexOf("'" + i + "'") < 0) { console.log('🔴 „' + i + '“ не влезе'); process.exit(2); }
console.log('✅ списъкът става ' + след + ' карти');

if (!ПИШИ) { console.log('\n(сухо · за запис: --pishi)'); process.exit(0); }
fs.writeFileSync(П + '.PREDI_BEZ_PODAVANE3', fs.readFileSync(П, 'utf8'));
fs.writeFileSync(П, s);
console.log('\n✅ ЗАПИСАНО · копие: ' + П + '.PREDI_BEZ_PODAVANE3');
