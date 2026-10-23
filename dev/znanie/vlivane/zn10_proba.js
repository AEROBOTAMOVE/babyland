// zn10 · проба в пясъчника: стажът dev/nahodki/karti_zn10.json (+ предложените ключове от zn10_klyuchove.json
// към съществуващи карти) се вмъква САМО В ПАМЕТТА (kbPatch) и се мери кой отговаря преди и след. Нищо не пише.
// Пускане през опашката:  node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn10_proba.js
// Вход: zn10_test.json (2 въпроса на карта, по реда на стажа), zn10_vaprosi.json, всеки ключ на моите карти,
//       ключовете на живите карти от 2-те стаи (кражби), контролните въпроси на slivach_karti.js.
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn10.json', 'utf8'));
let ПРЕДЛ = {};
try { ПРЕДЛ = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn10_klyuchove.json', 'utf8')); } catch (e) { }
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const сКарти = kb => {
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
const сКлючове = kb => {
  const L = kb.split(/\r?\n/);
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  for (const [id, кл] of Object.entries(ПРЕДЛ)) {
    const i = L.findIndex(x => x.indexOf("id: '" + id + "'") > -1);
    if (i < 0) { console.log('🔴 предложение към несъществуваща карта: ' + id); continue; }
    let ок = false;
    for (let j = i; j < L.length && (j === i || L[j].indexOf("id: '") < 0); j++) {
      const п = L[j].indexOf('keys: [');
      if (п > -1) { L[j] = L[j].slice(0, п + 7) + кл.map(низ).join(', ') + ', ' + L[j].slice(п + 7); ок = true; break; }
    }
    if (!ок) console.log('🔴 не намерих keys: [ на ' + id);
  }
  return L.join(НР);
};
const W0 = zaredi(null);
const W1 = zaredi(null, { kbPatch: сКарти });
const W2 = zaredi(null, { kbPatch: kb => сКлючове(сКарти(kb)) });
const питай = (W, т, с) => { try { const р = W.BL_MATCH(т, с); const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); return з && з.id ? з.id : 'ТИШИНА'; } catch (e) { return 'ГР:' + e.message.slice(0, 40); } };
const мои = СТАЖ.map(к => к.id);
const ред = [];
// 1 · тестът
const ТЕСТ = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn10_test.json', 'utf8'));
let т_добре = 0;
ТЕСТ.forEach((в, i) => {
  const цел = мои[Math.floor(i / 2)], о0 = питай(W0, в.q, в.r), о1 = питай(W1, в.q, в.r);
  if (о1 === цел) т_добре++;
  ред.push((о1 === цел ? '✅' : '🔴') + ' ТЕСТ „' + в.q + '“  ' + о0 + ' → ' + о1 + (о1 === цел ? '' : '   (чака ' + цел + ')'));
});
// 2 · въпросите преди писане (W0 → W1 → W2)
try {
  for (const [т, с] of JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn10_vaprosi.json', 'utf8')))
    ред.push('·  ВЪПР „' + т + '“  ' + питай(W0, т, с) + ' → ' + питай(W1, т, с) + ' → ' + питай(W2, т, с));
} catch (e) { }
// 2б · предложените ключове към чужди карти трябва да вадят своята карта в W2
for (const [id, кл] of Object.entries(ПРЕДЛ)) {
  const е = W0.KB.entries.find(x => x.id === id);
  for (const k of кл) { const о = питай(W2, k, е ? е.room : ''); ред.push((о === id ? '✅' : '🔴') + ' ПРЕДЛ „' + k + '“ → ' + о + (о === id ? '' : '   (чака ' + id + ')')); }
}
// 3 · всеки мой ключ трябва да вади своята карта
let кл_добре = 0, кл_всички = 0;
for (const к of СТАЖ) for (const k of к.keys) {
  кл_всички++;
  const о = питай(W1, k, к.room);
  if (о === к.id) кл_добре++; else ред.push('🟡 КЛЮЧ „' + k + '“ на ' + к.id + ' → ' + о);
}
// 4 · кражби: всеки ключ на живите карти в моите стаи — вади ли същото преди и след
const СТАИ = new Set(СТАЖ.map(к => к.room));
let кр = 0, кр_всички = 0;
for (const е of W0.KB.entries) {
  if (!СТАИ.has(е.room)) continue;
  for (const k of (е.keys || [])) {
    const о0 = питай(W0, k, е.room);
    if (о0 !== е.id) continue;             // ключът и преди не е вадил своята карта — не е мярка
    кр_всички++;
    const о1 = питай(W1, k, е.room);
    if (о1 !== о0) { кр++; ред.push('🔴 КРАЖБА „' + k + '“  ' + о0 + ' → ' + о1); }
  }
}
// 5 · контролните въпроси на гейта
const КОНТРОЛ = [
  ['не ме пуска да излизам', 'Жената в мен'], ['страх ме е от него', 'Жената в мен'],
  ['той не ме вижда вече', 'Жената в мен'], ['ревността от новото бебе', 'Развитие и игри'],
  ['нямам свои пари', 'Жената в мен'], ['второ дете искам ли аз', 'Жената в мен'],
  ['тръшка се', 'Развитие и игри'], ['кога на ясла', 'Развитие и игри'],
  ['не иска да яде', 'Захранване'], ['спи само на ръце', 'Моето бебе'],
  ['как да спра млякото след загуба', 'Захранване'], ['глътна монета', 'Здраве и SOS'],
  ['цялото е в обрив и се подува', 'Здраве и SOS'], ['шевовете долу', 'Жената в мен'],
  ['натискат ме за второ дете', 'Дневник на мама']
];
let к_мръд = 0;
for (const [т, с] of КОНТРОЛ) { const а = питай(W0, т, с), б = питай(W2, т, с); if (а !== б) { к_мръд++; ред.push('🔴 КОНТРОЛ „' + т + '“  ' + а + ' → ' + б); } }
console.log(ред.join('\n'));
console.log('\n── ТЕСТ: ' + т_добре + '/' + ТЕСТ.length + ' · КЛЮЧОВЕ към своята карта: ' + кл_добре + '/' + кл_всички +
  ' · КРАЖБИ: ' + кр + ' от ' + кр_всички + ' живи ключа · КОНТРОЛ мръднали: ' + к_мръд + ' ──');
