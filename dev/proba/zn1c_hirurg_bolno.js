// 21.10 · „bolno dete vaksina“ (zn1c-vaksina-bolno-dete) хващаше заглавието „ЕЗОК, застраховката и болно дете в
// чужбина“ (dostizhimost). Ключът е латиница с голо „болно дете“ — махаме го. ПЪТ НАЗАД: git checkout -- js/kb.js
const path = require('path'); process.chdir(path.resolve(__dirname, '..', '..'));
const { хирург } = require(path.resolve('dev/klyuch_hirurg.js'));
console.log(JSON.stringify(хирург({ махни: { 'zn1c-vaksina-bolno-dete': ['bolno dete vaksina'] }, пиши: process.argv.includes('--pishi') })));
