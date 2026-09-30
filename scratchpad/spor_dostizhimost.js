#!/usr/bin/env node
/* САМО ЧЕТЕ. Изкарва двойките „недостижима карта → крадец" с пълния им текст. */
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
  } catch (e) { return 'ГРЪМНА:' + e.message; }
};
// точно същият чистач като dev/dostizhimost.js
const катоВъпросРЯЗАН = т => String(т || '')
  .replace(/[„“"”]/g, ' ').replace(/\s*[—–-]\s*.*$/, '')
  .replace(/[?!.]+$/, '').replace(/\s+/g, ' ').trim();
// чистач БЕЗ рязане на тирето — за да се види дали рязането само си вреди
const катоВъпросЦЯЛ = т => String(т || '')
  .replace(/[„“"”]/g, ' ').replace(/\s*[—–]\s*.*$/, '')
  .replace(/[?!.]+$/, '').replace(/\s+/g, ' ').trim();

const поId = new Map(KB.entries.map(e => [e.id, e]));

// ── 0. КОНТРОЛЕН СЛУЧАЙ: уредът вижда ли изобщо? ──
console.log('=== КОНТРОЛ (уредът трябва да РАЗЛИЧАВА) ===');
const к1 = питай('Гнезденето', 'Бременност');
console.log('  „Гнезденето"/Бременност → ' + к1 + '  (чакам br-podgotovka-dom)');
const к2 = питай('ъъъ пшшш кврлмн зжбкт', 'Бременност');
console.log('  безсмислица → ' + к2 + '  (чакам null или НЕ br-podgotovka-dom)');
const к3 = питай('Колко тежи бебето', 'Бременност');
console.log('  „Колко тежи бебето"/Бременност → ' + к3 + '  (чакам br-tegla-plod)');
console.log('  общо карти: ' + KB.entries.length + ' · redFlags: ' + (KB.redFlags || []).length);
console.log('');

// ── 1. мярката с двата чистача ──
const проблем = [];
for (const e of KB.entries) {
  const вР = катоВъпросРЯЗАН(e.title);
  if (вР.length < 6) continue;
  const оР = питай(вР, e.room);
  if (оР === e.id) continue;
  const вЦ = катоВъпросЦЯЛ(e.title);
  const оЦ = питай(вЦ, e.room);
  проблем.push({ id: e.id, room: e.room, title: e.title, вР, оР, вЦ, оЦ });
}
console.log('=== ' + проблем.length + ' карти не минават РЯЗАНИЯ тест ===');
let самоОтРязане = 0;
for (const p of проблем) {
  const бележка = (p.оЦ === p.id) ? '  ⚠ С ПЪЛНОТО ЗАГЛАВИЕ СЕ НАМИРА → дефект на уреда' : '';
  if (p.оЦ === p.id) самоОтРязане++;
  console.log('  ' + p.id.padEnd(32) + ' рязан „' + p.вР + '" → ' + p.оР +
              ' | цял „' + p.вЦ + '" → ' + p.оЦ + бележка);
}
console.log('  ── ' + самоОтРязане + ' от ' + проблем.length + ' са артефакт на рязането при тире ──');
console.log('');

// ── 2. пълният текст на двойките ──
const реж = (s, n) => String(s || '').replace(/\s+/g, ' ').slice(0, n);
console.log('=== ДВОЙКИТЕ (пълен текст) ===');
for (const p of проблем) {
  if (p.оЦ === p.id) continue; // артефакт — не е спор
  const a = поId.get(p.id), b = поId.get(p.оЦ);
  console.log('');
  console.log('################ ' + p.id + '  (стая: ' + p.room + ')');
  console.log('ВЪПРОС(рязан): ' + p.вР + '   ВЪПРОС(цял): ' + p.вЦ);
  console.log('--- ЖЕРТВА ' + p.id + ' | ' + a.room + ' | от=' + a.от + ' до=' + a.до);
  console.log('  TITLE: ' + a.title);
  console.log('  CORE : ' + реж(a.core, 900));
  console.log('  KEYS(' + (a.keys || []).length + '): ' + (a.keys || []).join(' | '));
  if (!b) { console.log('--- КРАДЕЦ: ' + p.оЦ + ' НЕ Е НАМЕРЕН В KB'); continue; }
  console.log('--- КРАДЕЦ ' + b.id + ' | ' + b.room + ' | от=' + b.от + ' до=' + b.до);
  console.log('  TITLE: ' + b.title);
  console.log('  CORE : ' + реж(b.core, 900));
  console.log('  KEYS(' + (b.keys || []).length + '): ' + (b.keys || []).join(' | '));
}
