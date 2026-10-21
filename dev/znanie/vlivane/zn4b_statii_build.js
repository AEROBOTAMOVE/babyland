// zn4b · сглобява dev/nahodki/statii_zn4b.json от zn4b_statii_a.js + zn4b_statii_b.js (пише само в моя стаж).
// node dev/znanie/vlivane/zn4b_statii_build.js
const fs = require('fs');
const path = require('path');
const a = require(path.join(__dirname, 'zn4b_statii_a.js'));
const b = require(path.join(__dirname, 'zn4b_statii_b.js'));
const vse = a.concat(b).map(s => ({ karta: s.karta, t: s.t, e: s.e, s: s.s, k: s.k, c: s.c, body: s.body.replace(/\r/g, '').trim() }));
fs.writeFileSync('dev/nahodki/statii_zn4b.json', JSON.stringify(vse, null, 1) + '\n');
console.log('статии: ' + vse.length);
