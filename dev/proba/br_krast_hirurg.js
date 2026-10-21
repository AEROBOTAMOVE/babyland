// 21.10 · голият ключ „кръст“ в br-diskomfort крадеше „кръстник“, „кръщене“ (съдията на zn6, dopalnenia).
// Маха се; на негово място точни ключове за болката в кръста. ПЪТ НАЗАД: git checkout -- js/kb.js
const path = require('path'); process.chdir(path.resolve(__dirname, '..', '..'));
const { хирург } = require(path.resolve('dev/klyuch_hirurg.js'));
console.log(JSON.stringify(хирург({ махни: { 'br-diskomfort': ['кръст'] }, добави: { 'br-diskomfort': ['кръстът ме боли', 'боли ме кръста', 'боли ме кръстът'] }, пиши: process.argv.includes('--pishi') })));
