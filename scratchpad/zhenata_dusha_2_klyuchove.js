// САМО ЧЕТЕ. Какво ИМА в базата по темите, които се скъсаха.
'use strict';
const path = require('path'), fs = require('fs');
const КОРЕН = path.resolve(__dirname, '..');
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const поId = new Map(KB.entries.map(e => [e.id, e]));

const ЦЕЛИ = [
  'nd-samotata-mezhdu', 'dn-samota', 'nia-sama', 'y6-samota-sred-hora',
  'nd-sled-kryasaka', 'dn-sram-sled-gniv', 'dn-gniv',
  'dn-skuchno-mi-e-da-igraya', 'nia-priklyuchenia', 'z4-spontannost',
  'nia-time', 'nia-vreme', 'dn-vreme-mama', 'nia-vkus',
  'nia-svekarva', 'y7-dvete-babi',
  'y7-skandal-v-tri', 'nia-prava-rabota', 'y6-intervyu-s-malko-dete',
  'y6-rabota-ot-vkashti-s-dete', 'dn-rabota-vkashti',
  'v5-predpochita-drugiya', 'y7-revnuva-karmeneto',
  'dn-pomosht', 'v4-izrechenieto-koeto-ne-izliza', 'nia-ne-smeya-lekar',
  'z4-sravnyavane-mayki', 'dn-sravnenie', 'z4-kritikat', 'z4-nevidim-tovar',
  'nia-tovar-predavane', 'z4-radostta-sama', 'nia-vina'
];
let out = '';
for (const id of ЦЕЛИ) {
  const e = поId.get(id);
  if (!e) { out += '\n### ' + id + ' — НЯМА ТАКАВА КАРТА\n'; continue; }
  out += '\n### ' + id + '  [' + e.room + ']  «' + e.title + '»\n';
  out += '    ключове (' + (e.keys || []).length + '): ' + (e.keys || []).join(' | ') + '\n';
  const тяло = JSON.stringify(e.body || e.text || e.answer || e.md || '');
  out += '    тяло: ' + тяло.slice(0, 400) + (тяло.length > 400 ? '…(' + тяло.length + ' знака)' : '') + '\n';
}
fs.writeFileSync(path.join(__dirname, 'zhenata_dusha_2_klyuchove.txt'), out, 'utf8');
console.log(out);
