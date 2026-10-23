// zn7b · мярка на предложените ключове (zn7b_klyuchove.json) — добавят се САМО В ПАМЕТТА. Нищо не пише.
// node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7b_proba_klyuchove.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const ПР = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn7b_klyuchove.json', 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпка = src => {
  const Ls = src.split(/\r?\n/);
  for (const [id, нови] of Object.entries(ПР)) {
    const i = Ls.findIndex(x => x.indexOf("id: '" + id + "'") > -1);
    for (let j = i + 1; j < Ls.length && Ls[j].indexOf("id: '") < 0; j++)
      if (Ls[j].indexOf('keys: [') > -1) { Ls[j] = Ls[j].replace('keys: [', 'keys: [' + нови.map(низ).join(', ') + ', '); break; }
  }
  return Ls.join('\n');
};
const W0 = zaredi(null), W1 = zaredi(null, { kbPatch: кръпка });
const живи = new Map(); for (const е of W0.KB.entries) for (const k of (е.keys || [])) живи.set(String(k).toLowerCase(), е.id);
const питай = (W, т) => { try { const р = W.BL_MATCH(т, 'Бременност'); const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); return з && з.id || 'ТИШИНА'; } catch (e) { return 'ГР'; } };
let ок = 0, вс = 0, заети = 0;
for (const [id, нови] of Object.entries(ПР)) for (const k of нови) {
  вс++; if (живи.has(k)) { заети++; console.log('🔴 вече е ключ на ' + живи.get(k) + ': „' + k + '“'); }
  const п = питай(W0, k), с = питай(W1, k); if (с === id) ок++;
  console.log((с === id ? '✅' : '❌') + ' „' + k + '“  ' + п + ' → ' + с + (с === id ? '' : '  (чаках ' + id + ')'));
}
// чужди ключове на същите 4 карти и на br-sedmici не бива да мръднат
let мръднали = 0, пров = 0;
for (const е of W0.KB.entries) for (const k of (е.keys || []).slice(0, 4)) {
  if (е.room !== 'Бременност') continue; пров++;
  const п = питай(W0, k), с = питай(W1, k); if (п !== с) { мръднали++; console.log('🔴 мръдна „' + k + '“ ' + п + ' → ' + с); }
}
console.log('\nпредложени ' + вс + ' · стигат до своята карта ' + ок + ' · вече заети ' + заети + ' · проверени чужди (първите 4 ключа на „Бременност“) ' + пров + ' · мръднали ' + мръднали);
