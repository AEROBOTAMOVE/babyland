// ═══════════════════════════════════════════════════════════════════════
// 🚪 БЕЗ_ПОДАВАНЕ — общ инструмент за порции (15.09.2026)
//
// ЗАЩО: първите три порции имаха по свой инструмент с твърдо зашит списък,
//   котва и коментар (prilozhi_bez_podavane.js, …2.js, …3.js). Всяка нова
//   порция щеше да е четвърто копие. Тук входът е файл, логиката е тази от
//   третата порция, проверена на 15.09 (81 → 88).
//
// КРИТЕРИЙ ЗА ВХОД: картата е ПРОЧЕТЕНА от човек срещу въпроса, в тази сесия,
//   и печели СИЛНО, но в друга стая. Списък по id е сляп за въпроса — затова
//   карта, отсъдена веднъж като грешна (nd-parvite-pati), НЕ влиза.
//
// ПУСКАНЕ: node dev/prilozhi_bez_podavane_obsht.js <вход.json> [--pishi]
//   входът е { "comment": ["ред", …], "ids": ["id", …] }   (без --pishi е сухо)
// ПЪТ НАЗАД: js/helper.js.PREDI_BEZ_PODAVANE_<N> · git revert
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));
const ПИШИ = process.argv.includes('--pishi');
const ВХОД = process.argv.slice(2).find(a => /\.json$/.test(a));
if (!ВХОД || !fs.existsSync(ВХОД)) { console.log('ПУСКАНЕ: node dev/prilozhi_bez_podavane_obsht.js <вход.json> [--pishi]'); process.exit(2); }
const вх = JSON.parse(fs.readFileSync(ВХОД, 'utf8'));
const НОВИ = вх.ids || [];
const РЕДОВЕ = вх.comment || [];
if (!НОВИ.length) { console.log('🔴 празен списък ids'); process.exit(2); }
if (!РЕДОВЕ.length) { console.log('🔴 порция без коментар не се пише — следващият човек трябва да знае ЗАЩО'); process.exit(2); }

const П = 'js/helper.js';
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
  if (i === 'nd-parvite-pati') { console.log('🔴 nd-parvite-pati е отсъдена като И вярна, И грешна (09.09) — не влиза'); лошо++; }
}
if (лошо) { console.log('\n🔴 ' + лошо + ' проблема — НЕ ПИША.'); process.exit(2); }
const преди = (бл[1].match(/'[a-z0-9-]+'/g) || []).length;
console.log('✅ всичките ' + НОВИ.length + ' id съществуват и не се повтарят · в списъка сега: ' + преди);

const NL = s.indexOf('\r\n') > -1 ? '\r\n' : '\n';
const КОМЕНТАР = РЕДОВЕ.map(р => '        // ' + р).join(NL);
const нов = бл[0].replace(/\];$/, ',' + NL + КОМЕНТАР + NL + '        ' + НОВИ.map(i => "'" + i + "'").join(', ') + '];');
s = s.replace(бл[0], () => нов);

const пак = Р.exec(s);
const след = (пак[1].match(/'[a-z0-9-]+'/g) || []).length;
if (след !== преди + НОВИ.length) { console.log('🔴 броят е ' + след + ', очаквах ' + (преди + НОВИ.length) + ' — НЕ ПИША'); process.exit(2); }
for (const i of НОВИ) if (пак[1].indexOf("'" + i + "'") < 0) { console.log('🔴 „' + i + '“ не влезе'); process.exit(2); }
console.log('✅ списъкът става ' + след + ' карти');

if (!ПИШИ) { console.log('\n(сухо · за запис: --pishi)'); process.exit(0); }
const копие = П + '.PREDI_BEZ_PODAVANE_' + след;
fs.writeFileSync(копие, fs.readFileSync(П, 'utf8'));
fs.writeFileSync(П, s);
console.log('\n✅ ЗАПИСАНО · копие: ' + копие);
