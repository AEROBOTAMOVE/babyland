#!/usr/bin/env node
/* САМО ЧЕТЕ. Втори кръг кандидати + заглавията на засегнатите карти. */
'use strict';
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const KB = W.BL_KB || W.KB;
const питай = (т, с) => { try { const р = W.BL_MATCH(т, с);
  const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
  return з ? з.id : null; } catch (e) { return 'ГРЪМНА'; } };
const поId = new Map(KB.entries.map(e => [e.id, e]));
const собственик = {};
for (const e of KB.entries) for (const k of (e.keys || [])) {
  const н = String(k).toLowerCase().trim();
  (собственик[н] = собственик[н] || []).push(e.id);
}
console.log('КОНТРОЛ: „Гнезденето" → ' + питай('Гнезденето','Бременност') + ' · безсмислица → ' + питай('зжбкт кврлмн','Бременност'));
console.log('');
console.log('═══ КОИ СА ЗАСЕГНАТИТЕ КАРТИ ═══');
for (const id of ['nia-ogledalo','nia-razdyala','mb-kolko-mliako','br-chanta','nm-zapusheno-nosle',
                  'dn-telo-posle','nia-simfiza-sled-razhdane','in-bezopasnost','nr-ekranite-chestno','dn-samota']) {
  const e = поId.get(id);
  console.log('  ' + id.padEnd(28) + (e ? '[' + e.room + '] от=' + e.от + ' до=' + e.до + ' · ' + e.title : 'НЯМА ГО'));
}
console.log('');
const КРУГ2 = {
  'zim-suh-vazduh-nosle': ['носленцето засъхва зиме','парното изсушава нослето',
    'сухият въздух зиме и нослето','запушено носле от сух въздух вкъщи','нослето се запушва от парното'],
  'v4-komentari-za-tyaloto': ['питат ме кога ще сваля килограмите','свекървата пита кога ще отслабна',
    'кога ще свалиш килограмите питат всички хора','казват ми да отслабна след раждането'],
  'in-razvod-red': ['по кой ред минава разводът с малко дете','развод по взаимно съгласие с малко дете',
    'какво става като се развеждаме с малко дете','подаваме за развод а детето е малко'],
  'br-hronichna-bolest-lekarstva': ['хроничната ми болест и лекарството в бременността',
    'лекарството ми за хронична болест не се спира','хронична болест лекарство бременност',
    'болна съм хронично и пия лекарство бременна'],
  'y2-smeseno-hranene': ['смесено хранене как се прави','кърма и шише заедно как се прави'],
  'rz-bebe-1-3-meseca': ['бебето между първия и третия месец','какво прави бебе на 1 до 3 месеца',
    'бебето на 1 3 месеца какво прави']
};
for (const [id, кл] of Object.entries(КРУГ2)) {
  const e = поId.get(id);
  console.log('── ' + id + '  [' + e.room + ']');
  for (const k of кл) {
    const соб = собственик[k.toLowerCase().trim()];
    const сега = питай(k, e.room);
    console.log('   „' + k + '"  собственик=' + (соб ? соб.join(',') : 'СВОБОДЕН') +
      '  сега→' + сега + (сега === id ? '  (вече се хваща)' : ''));
  }
  console.log('');
}
