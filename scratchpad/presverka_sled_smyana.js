#!/usr/bin/env node
/* САМО ЧЕТЕ. Пресверка СЛЕД като js/helper.js се смени на 08:58:50 от друг агент.
   Мери само 14-те жертви + 33-те предложени ключа — бързо, без обиколката на 1621. */
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
console.log('helper.js: ' + fs.statSync('js/helper.js').size + ' б, ' + fs.statSync('js/helper.js').mtime.toISOString());
console.log('kb.js    : ' + fs.statSync('js/kb.js').size + ' б, ' + fs.statSync('js/kb.js').mtime.toISOString());
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
console.log('КОНТРОЛ: „Гнезденето" → ' + питай('Гнезденето','Бременност') +
  ' · „Колко тежи бебето" → ' + питай('Колко тежи бебето','Бременност') +
  ' · безсмислица → ' + питай('зжбкт пшшш кврлмн','Бременност'));
console.log('карти=' + KB.entries.length + ' ключа=' + Object.keys(собственик).length);
console.log('');
const РЯЗАН = т => String(т||'').replace(/[„“"”]/g,' ').replace(/\s*[—–-]\s*.*$/,'').replace(/[?!.]+$/,'').replace(/\s+/g,' ').trim();
const ЖЕРТВИ = ['in-dom-po-stai','rz-ekran','nia-sama','zim-suh-vazduh-nosle','ema-sama',
  'y2-smeseno-hranene','z3-glavobolie-bremenna','v4-komentari-za-tyaloto','lb3-biberon-gyrda',
  'g3r-zashto-moeto-e-po-trudno-ot-drugit','in-razvod-red','shevat-boli-sled-dva-meseca',
  'rz-bebe-1-3-meseca','br-hronichna-bolest-lekarstva'];
console.log('═══ 14-ТЕ ЖЕРТВИ: рязано заглавие срещу ПЪЛНО ═══');
let арт = 0, ист = 0;
for (const id of ЖЕРТВИ) {
  const e = поId.get(id);
  const оР = питай(РЯЗАН(e.title), e.room), оЦ = питай(e.title, e.room);
  if (оЦ === id) арт++; else ист++;
  console.log((оЦ === id ? '⚠ АРТЕФАКТ ' : '🔴 ИСТИНСКИ ') + id.padEnd(40) +
    ' рязан→' + String(оР).padEnd(26) + ' цял→' + оЦ);
}
console.log('── артефакт=' + арт + ' · истински недостижими=' + ист + ' ──');
console.log('');
const П = JSON.parse(fs.readFileSync('dev/nahodki/predlozhenie_dostizhimost.json','utf8')).predlozhenie;
console.log('═══ 33-ТЕ ПРЕДЛОЖЕНИ КЛЮЧА, ПРЕСВЕРЕНИ ═══');
let добри = 0, лоши = 0;
for (const [id, кл] of Object.entries(П)) {
  const e = поId.get(id);
  for (const k of кл) {
    const соб = собственик[k.toLowerCase().trim()];
    const сега = питай(k, e.room);
    const ок = !соб && сега !== id;
    if (ок) добри++; else { лоши++;
      console.log('  ❌ ' + id + ' „' + k + '" собственик=' + (соб?соб.join(','):'-') + ' сега→' + сега); }
  }
}
console.log('  ✅ годни (свободни И сега не водят при картата): ' + добри + ' от ' + (добри+лоши));
