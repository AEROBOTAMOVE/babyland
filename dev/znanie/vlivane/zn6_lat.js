// zn6 · кратка проба: кои латински ключове на zn6-lab-zatamnenie се намират (стажът само в паметта). Нищо не пише.
//   node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn6_lat.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn6.json', 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпка = kb => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  const блок = к => ['    {', '      id: ' + низ(к.id) + ',' + (к.от != null ? ' от: ' + к.от + ',' : '') + (к.до != null ? ' до: ' + к.до + ',' : '') + ' room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],', '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',',
    '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
const W1 = zaredi(null, { kbPatch: кръпка });
const питай = (т, с) => { try { const р = W1.BL_MATCH(т, с); const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); return з && з.id ? з.id : 'ТИШИНА'; } catch (e) { return 'ГР'; } };
const к = СТАЖ.find(x => x.id === 'zn6-lab-zatamnenie');
const проби = к.keys.concat(['zatamnenie dete', 'zatamnenie na slanceto', 'slanchevo zatamnenie', 'bremenna zatamnenie', 'zatamnenie bebe']);
for (const т of проби) console.log(('„' + т + '“').padEnd(46) + питай(т, 'Лабораторията') + '  |  Бременност: ' + питай(т, 'Бременност'));
