// 21.10 · голото „боси“ (rz-obuvki „Първите обувки“) хващаше „Ран Босилек“ (съдията на zn6). Маха се;
// остават/идват точни ключове. ПЪТ НАЗАД: git checkout -- js/kb.js
const path = require('path'); process.chdir(path.resolve(__dirname, '..', '..'));
const { хирург } = require(path.resolve('dev/klyuch_hirurg.js'));
console.log(JSON.stringify(хирург({ махни: { 'rz-obuvki': ['боси'] }, добави: { 'rz-obuvki': ['да ходи ли бос', 'бос вкъщи ли да ходи'] }, пиши: process.argv.includes('--pishi') })));
