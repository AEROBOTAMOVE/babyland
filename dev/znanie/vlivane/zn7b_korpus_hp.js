// zn7b · мярка на ХИПОТЕЗА за helper.js (кърпи САМО В ПАМЕТТА) срещу живия helper.js. Нищо не пише.
//   ZN7B_KOREN=1|2   → коя кръпка от zn7b_koren_kryapka.js (задължително)
//   ZN7B_SA_STAZH=1  → и двата мозъка носят стажа karti_zn7b.json (светът след вливането)
//   ZN7B_KLYUCHOVE=f → и двата мозъка носят предложените ключове
// Мери: 5-те корпуса (стая null, както prilozhi_klyuchove) + ключовете на стая „Бременност“ и всеки
//   ключ с „имам/седмиц/бременна/съм“ (зададен в своята стая) → своята карта ли вади, A срещу B.
// node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7b_korpus_hp.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
if (!process.env.ZN7B_KOREN) { console.log('🔴 ZN7B_KOREN=1|2'); process.exit(2); }
const HP = require('./zn7b_koren_kryapka.js').izberi(process.env.ZN7B_KOREN);
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const СТАЖ = process.env.ZN7B_SA_STAZH ? JSON.parse(fs.readFileSync('dev/nahodki/karti_zn7b.json', 'utf8')) : [];
const КЛ = process.env.ZN7B_KLYUCHOVE ? process.env.ZN7B_KLYUCHOVE.split(',').reduce((о, ф) => { for (const [и, к] of Object.entries(JSON.parse(fs.readFileSync(ф, 'utf8')))) о[и] = (о[и] || []).concat(к); return о; }, {}) : {};
// ZN7B_KL_SAMO_B=1 → и двата мозъка носят кръпката (ZN7B_KOREN), а ключовете — САМО B: мери ключовете при кръпката
const САМО_B = !!process.env.ZN7B_KL_SAMO_B;
const kbP = (kb, безКлючове) => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  let Ls = kb.split(НР);
  for (const [id, нови] of Object.entries(безКлючове ? {} : КЛ)) {
    const i = Ls.findIndex(x => x.indexOf("id: '" + id + "'") > -1); if (i < 0) throw new Error('няма карта ' + id);
    let j = i; while (Ls[j].indexOf('keys: [') < 0) j++;
    Ls[j] = Ls[j].replace('keys: [', 'keys: [' + нови.map(низ).join(', ') + ', ');
  }
  kb = Ls.join(НР);
  if (!СТАЖ.length) return kb;
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  const блок = к => ['    {',
    '      id: ' + низ(к.id) + ',' + (к.от != null ? ' от: ' + к.от + ',' : '') + (к.до != null ? ' до: ' + к.до + ',' : '') + ' room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],',
    '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',',
    '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
const A = САМО_B ? zaredi(HP, { kbPatch: kb => kbP(kb, true) }) : zaredi(null, { kbPatch: kb => kbP(kb) });
const B = zaredi(HP, { kbPatch: kb => kbP(kb) });
if (САМО_B) console.log('РЕЖИМ: A = кръпка без ключовете · B = кръпка + ключовете');
const id = (W, t, s) => { try { const r = W.BL_MATCH(t, s || null); return r ? r.id : '-'; } catch (e) { return 'ГР'; } };
console.log('ХИПОТЕЗА корен v' + process.env.ZN7B_KOREN + (СТАЖ.length ? ' · със стажа zn7b' : ' · без стажа') + (process.env.ZN7B_KLYUCHOVE ? ' · ключове ' + process.env.ZN7B_KLYUCHOVE : ''));
let изр = 0; const смен = [];
for (const и of ['korpus350', 'korpus_nevinni', 'korpus_nevinni2', 'korpus_speshni', 'korpus_hipoteza'])
  for (const q of require(path.join(КОРЕН, 'dev', и + '.json'))) {
    const т = q.t; if (!т) continue; изр++;
    const x = id(A, т), y = id(B, т); if (x !== y) смен.push(и + ' [' + q.e + '] ' + т + '  : ' + x + ' -> ' + y);
  }
console.log('корпус ' + изр + ' изречения · сменени ' + смен.length);
смен.slice(0, 40).forEach(x => console.log('   ⚠️ ' + x));
let общо = 0, свояA = 0, свояB = 0; const ключСмен = [];
for (const e of A.KB.entries) for (const k of e.keys) {
  const s = String(k);
  if (!(e.room === 'Бременност' || /имам|седмиц|бременна|съм/.test(s))) continue;
  общо++;
  const x = id(A, s, e.room), y = id(B, s, e.room);
  if (x === e.id) свояA++; if (y === e.id) свояB++;
  if (x !== y) ключСмен.push((y === e.id ? '🟢 ' : x === e.id ? '🔴 ' : '🟡 ') + e.id + ' „' + s + '“ [' + e.room + ']  ' + x + ' -> ' + y);
}
console.log('ключове ' + общо + ' · своята карта: днес ' + свояA + ' · с кръпката ' + свояB + ' · сменени ' + ключСмен.length);
ключСмен.slice(0, 60).forEach(x => console.log('   ' + x));
