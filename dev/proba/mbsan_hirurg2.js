// 🔑 20.10 · втора стъпка: голите ключове на mb-san („спи ли“, „спи бебето“, „бебето спи“, „спи бебе“) крадат —
// мерено (kade_otivat): „бебето спи по корем безопасно ли е“ отиваше в „Колко трябва да спи“, а без тях — в
// „Безопасният сън“; „спи ли нормално с отворена уста“ → „Бебето хърка“. Махаме ги; за „спи много“ — точен ключ.
// ПУСКАНЕ (cwd = корена): node dev/proba/mbsan_hirurg2.js [--pishi]    ПЪТ НАЗАД: git checkout -- js/kb.js
const path = require('path');
process.chdir(path.resolve(__dirname, '..', '..'));
const { хирург } = require(path.resolve('dev/klyuch_hirurg.js'));
const р = хирург({ махни: { 'mb-san': ['спи ли', 'спи бебето', 'бебето спи', 'спи бебе'] },
  добави: { 'mb-san': ['спи много нормално ли е', 'бебето спи много'] }, пиши: process.argv.includes('--pishi') });
console.log(JSON.stringify(р));
