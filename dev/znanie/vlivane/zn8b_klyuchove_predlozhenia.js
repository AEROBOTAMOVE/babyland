// zn8b · предложения за ключове към СЪЩЕСТВУВАЩИТЕ карти за 3, 4, 5 и 6 години (вместо нови дублиращи карти).
// Същите шаблони като zn8b_klyuchove_shabloni.js; махат се ключовете, които вече са на някоя жива карта.
// Пише САМО dev/znanie/vlivane/zn8b_klyuchove.json. Пускане: node dev/znanie/vlivane/zn8b_klyuchove_predlozhenia.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null);
const живи = new Set();
for (const е of W.KB.entries) for (const k of (е.keys || [])) живи.add(String(k).toLowerCase());
const ШАБЛОНИ = [
  в => в + ' какво трябва да може',
  в => в + ' какво е нормално да може',
  в => в + ' какво е нормално да прави',
  в => в + ' какво трябва да умее',
  в => в + ' какво се очаква да може',
  в => в + ' какво се очаква да прави',
  в => в + ' какво трябва да знае'
];
// втори кръг — както в zn8b_klyuchove_shabloni.js, само за основния израз на възрастта (първия в списъка)
const ШАБЛОНИ2 = [
  в => в + ' какво трябва да прави',
  в => 'се очаква от дете на ' + в,
  в => 'може дете на ' + в,
  в => в + ' какво е нормално да умее',
  в => 'нормално да прави на ' + в,
  в => 'нормално да може на ' + в,
  в => в + ' какви умения'
];
const ВЪЗРАСТИ = {
  'zn4b-na-3-godini': ['3 години', 'три години', '3 годинки', '3 години и половина'],
  'zn4b-na-4-godini': ['4 години', 'четири години', '4 годинки', '4 години и половина'],
  'zn4b-na-5-godini': ['5 години', 'пет години', '5 години и половина'],
  'zn4b-gotov-za-parvi-klas': ['6 години', 'шест години']
};
const ДОП = {
  'zn4b-na-3-godini': ['тригодишно дете какво прави', 'тригодишно дете какво трябва да умее', 'dete na 3 godini kakvo trqbva da moje'],
  'zn4b-na-4-godini': ['четиригодишно дете какво трябва да може', 'четиригодишно дете какво трябва да умее', 'na 4 godini kakvo trqbva da znae'],
  'zn4b-na-5-godini': ['петгодишно дете какво трябва да може', 'петгодишно дете какво трябва да умее', 'dete na 5 godini kakvo trqbva da moje'],
  'zn4b-gotov-za-parvi-klas': ['шестгодишно дете какво трябва да може', 'шестгодишно дете какво трябва да знае', 'dete na 6 godini kakvo trqbva da znae']
};
const изход = {};
for (const [id, възр] of Object.entries(ВЪЗРАСТИ)) {
  if (!W.KB.entries.find(е => е.id === id)) { console.log('🔴 няма карта ' + id); continue; }
  const нови = [];
  for (const в of възр) for (const ш of ШАБЛОНИ) нови.push(ш(в));
  for (const ш of ШАБЛОНИ2) нови.push(ш(възр[0]));
  for (const k of (ДОП[id] || [])) нови.push(k);
  изход[id] = [...new Set(нови)].filter(k => !живи.has(k.toLowerCase()));
}
fs.writeFileSync(path.join(__dirname, 'zn8b_klyuchove.json'), JSON.stringify(изход, null, 2) + '\n', 'utf8');
console.log(Object.entries(изход).map(([id, к]) => id + ': ' + к.length).join(' · '));
