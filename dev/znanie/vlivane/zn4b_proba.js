// zn4b · проба в пясъчника: стажът dev/nahodki/karti_zn4b.json се вмъква САМО В ПАМЕТТА (kbPatch на dev/pyasachnik.js)
// и се мери кой отговаря преди и след. Нищо не пише. Пускане през опашката:
//   node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn4b_proba.js
// Вход: zn4b_vaprosi2.json ([въпрос, стая, очаквано-id]) + първия и последния ключ на всяка моя карта
// + първите 2 ключа на всяка жива карта от „Развитие и игри“ и „Моето бебе“ (за кражби) + контролните на slivach_karti.js.
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn4b.json', 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпка = kb => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  if (kb.split(КРАЙ).length !== 2) throw new Error('краят на entries не е разпознат');
  const блок = к => ['    {',
    '      id: ' + низ(к.id) + ',' + (к.от != null ? ' от: ' + к.от + ',' : '') + (к.до != null ? ' до: ' + к.до + ',' : '') + ' room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],',
    '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',',
    '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
const W0 = zaredi(null);
const W1 = zaredi(null, { kbPatch: кръпка });
const питай = (W, т, с) => { try { const р = W.BL_MATCH(т, с); const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); return з && з.id ? з.id : 'ТИШИНА'; } catch (e) { return 'ГР:' + e.message.slice(0, 40); } };
const мои = new Set(СТАЖ.map(к => к.id));
const въпроси = [];
for (const [т, с, цел] of JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn4b_vaprosi2.json', 'utf8'))) въпроси.push([т, с, 'цел:' + цел]);
for (const к of СТАЖ) въпроси.push([к.keys[0], к.room, 'ключ1:' + к.id], [к.keys[к.keys.length - 1], к.room, 'ключN:' + к.id]);
for (const е of W0.KB.entries) if ((е.room === 'Развитие и игри' || е.room === 'Моето бебе') && !мои.has(е.id)) for (const k of (е.keys || []).slice(0, 2)) въпроси.push([String(k), е.room, 'чужд:' + е.id]);
const КОНТРОЛ = [['не ме пуска да излизам', 'Жената в мен'], ['страх ме е от него', 'Жената в мен'], ['той не ме вижда вече', 'Жената в мен'], ['ревността от новото бебе', 'Развитие и игри'], ['нямам свои пари', 'Жената в мен'], ['второ дете искам ли аз', 'Жената в мен'], ['тръшка се', 'Развитие и игри'], ['кога на ясла', 'Развитие и игри'], ['не иска да яде', 'Захранване'], ['спи само на ръце', 'Моето бебе'], ['как да спра млякото след загуба', 'Захранване'], ['глътна монета', 'Здраве и SOS'], ['цялото е в обрив и се подува', 'Здраве и SOS'], ['шевовете долу', 'Жената в мен'], ['натискат ме за второ дете', 'Дневник на мама']];
for (const [т, с] of КОНТРОЛ) въпроси.push([т, с, 'контрол']);
let кражби = 0, хванати = 0, целиОк = 0, цели = 0;
const ред = [];
for (const [т, с, вид] of въпроси) {
  const п = питай(W0, т, с), с1 = питай(W1, т, с);
  if (вид.startsWith('чужд:') || вид === 'контрол') {
    if (п !== с1) { кражби++; ред.push('🔴 ' + вид + '  „' + т + '“  ' + п + ' → ' + с1); }
  } else if (вид.startsWith('ключ')) {
    const цел = вид.split(':')[1];
    if (с1 !== цел) ред.push('🟡 ' + вид + '  „' + т + '“ → ' + с1); else хванати++;
  } else {
    const цел = вид.split(':')[1]; цели++;
    if (с1 === цел) целиОк++;
    ред.push((с1 === цел ? '✅' : '❌') + ' „' + т + '“  ' + п + ' → ' + с1 + (с1 === цел ? '' : '   (чаках ' + цел + ')'));
  }
}
console.log(ред.join('\n'));
console.log('\nкарти в стажа: ' + СТАЖ.length + ' · въпроси към целта: ' + целиОк + '/' + цели + ' · ключ1/ключN хванати: ' + хванати + '/' + (СТАЖ.length * 2) +
  ' · чужди/контролни въпроси: ' + въпроси.filter(в => в[2].startsWith('чужд:') || в[2] === 'контрол').length + ' · мръднали: ' + кражби);
