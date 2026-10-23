// zn8a · само чете: изброява живите ключове с „месец/месеца/meseca/mesec/месечно“ и кои карти ги носят.
'use strict';
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null);
const рх = /месец|месеца|месечн|meseca|mesec|mesechn|развитие|какво прави|какво може|трябва да може|да очаквам/;
const ред = [];
for (const е of W.KB.entries) for (const k of (е.keys || [])) if (рх.test(String(k).toLowerCase())) ред.push(е.id.padEnd(30) + ' [' + е.room + '] ' + k);
console.log(ред.join('\n'));
console.log('\nобщо: ' + ред.length + ' · карти: ' + W.KB.entries.length);
for (const id of ['zn8a-mesec-0']) console.log(id + ' съществува ли: ' + W.KB.entries.some(е => е.id.startsWith('zn8a')));
