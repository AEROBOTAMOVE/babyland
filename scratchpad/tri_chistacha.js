#!/usr/bin/env node
/* САМО ЧЕТЕ. Три чистача на заглавието + индекс на всички ключове. */
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const KB = W.BL_KB || W.KB;

const питай = (т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null;
  } catch (e) { return 'ГРЪМНА'; }
};
const РЯЗАН = т => String(т || '').replace(/[„“"”]/g, ' ')
  .replace(/\s*[—–-]\s*.*$/, '').replace(/[?!.]+$/, '').replace(/\s+/g, ' ').trim();
const ЦЯЛ = т => String(т || '').replace(/[„“"”]/g, ' ')
  .replace(/[?!.]+$/, '').replace(/\s+/g, ' ').trim();          // нищо не се реже
const БЕЗТИРЕ = т => ЦЯЛ(т).replace(/\s*[—–]\s*/g, ' ');        // тирето → празно място

// ── 1. индекс на всички ключове (за проверка дали ключ е зает) ──
const индекс = {};
const списък = [];
for (const e of KB.entries) {
  списък.push({ id: e.id, room: e.room, title: e.title, keys: e.keys || [],
                от: e.от, до: e.до, core: e.core, tip: e.tip, follow: e.follow });
  for (const k of (e.keys || [])) {
    const н = String(k).toLowerCase().trim();
    (индекс[н] = индекс[н] || []).push(e.id);
  }
}
fs.writeFileSync(path.join(__dirname, 'index_karti.json'),
  JSON.stringify({ брой: списък.length, карти: списък, ключове: индекс }), 'utf8');
console.log('индекс: ' + списък.length + ' карти, ' + Object.keys(индекс).length + ' различни ключа');
const дубли = Object.entries(индекс).filter(([, v]) => v.length > 1);
console.log('ключове, държани от >1 карта: ' + дубли.length);
console.log('');

// ── 2. трите чистача върху ВСИЧКИ карти ──
const беда = [];
for (const e of KB.entries) {
  const р = РЯЗАН(e.title); if (р.length < 6) continue;
  const оР = питай(р, e.room);
  if (оР === e.id) continue;
  беда.push({ id: e.id, room: e.room, title: e.title,
    р, оР,
    ц: ЦЯЛ(e.title),      оЦ: питай(ЦЯЛ(e.title), e.room),
    б: БЕЗТИРЕ(e.title),  оБ: питай(БЕЗТИРЕ(e.title), e.room) });
}
console.log('=== ' + беда.length + ' карти падат на РЯЗАНИЯ тест ===');
console.log('');
let артефакт = 0, истински = 0;
for (const x of беда) {
  const ок = (x.оЦ === x.id) || (x.оБ === x.id);
  if (ок) артефакт++; else истински++;
  console.log((ок ? '⚠ АРТЕФАКТ ' : '🔴 ИСТИНСКИ ') + x.id + '   [' + x.room + ']');
  console.log('    рязан  „' + x.р + '“ → ' + x.оР);
  console.log('    цял    „' + x.ц + '“ → ' + x.оЦ);
  console.log('    безтире„' + x.б + '“ → ' + x.оБ);
}
console.log('');
console.log('── АРТЕФАКТ на рязането: ' + артефакт + ' · ИСТИНСКИ недостижими: ' + истински + ' ──');
