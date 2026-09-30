#!/usr/bin/env node
/* САМО ЧЕТЕ. 1) какво връща ПЪЛНОТО заглавие; 2) свободен ли е всеки предложен ключ. */
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const KB = W.BL_KB || W.KB;
const питай = (т, с) => {
  try { const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null; } catch (e) { return 'ГРЪМНА'; }
};
const поId = new Map(KB.entries.map(e => [e.id, e]));
const собственик = {};
for (const e of KB.entries) for (const k of (e.keys || [])) {
  const н = String(k).toLowerCase().trim();
  (собственик[н] = собственик[н] || []).push(e.id);
}

// ── КОНТРОЛ: уредът различава ли ──
console.log('КОНТРОЛ: „Гнезденето"/Бременност → ' + питай('Гнезденето', 'Бременност') + ' (чакам br-podgotovka-dom)');
console.log('КОНТРОЛ: безсмислица → ' + питай('зжбкт пшшш кврлмн', 'Бременност') + ' (чакам null)');
console.log('КОНТРОЛ: ключ, който НЕ съществува никъде → собственик = ' +
  JSON.stringify(собственик['абсолютно измислен ключ хххх'] || null));
console.log('ключове, държани от >1 карта: ' + Object.values(собственик).filter(v => v.length > 1).length);
console.log('');

const ЖЕРТВИ = ['in-dom-po-stai','rz-ekran','nia-sama','zim-suh-vazduh-nosle','ema-sama',
  'y2-smeseno-hranene','z3-glavobolie-bremenna','v4-komentari-za-tyaloto','lb3-biberon-gyrda',
  'g3r-zashto-moeto-e-po-trudno-ot-drugit','in-razvod-red','shevat-boli-sled-dva-meseca',
  'rz-bebe-1-3-meseca','br-hronichna-bolest-lekarstva'];

console.log('═══ ПЪЛНОТО ЗАГЛАВИЕ, БЕЗ НИКАКВО РЯЗАНЕ ═══');
for (const id of ЖЕРТВИ) {
  const e = поId.get(id); if (!e) { console.log(id + ' НЯМА ГО'); continue; }
  const о = питай(e.title, e.room);
  console.log((о === id ? '✅ намира се   ' : '🔴 НЕ се намира') + ' ' + id.padEnd(40) +
    ' „' + e.title + '" → ' + о);
}
console.log('');

const ПРЕДЛОЖЕНИЕ = {
  'zim-suh-vazduh-nosle': ['нослето засъхва от парното','коричка в нослето зиме',
    'физиологичен разтвор при сух въздух','аспиратор при запушено носле зиме'],
  'y2-smeseno-hranene': ['кърма и адаптирано едновременно','как да комбинирам кърма и адаптирано',
    'как се дохранва с адаптирано','да добавя адаптирано към кърменето'],
  'z3-glavobolie-bremenna': ['заболя ме главата и съм бременна','какво да взема за главоболие бременна',
    'главоболие бременна какво да взема','заболя те глава какво можеш да вземеш'],
  'v4-komentari-za-tyaloto': ['кога ще свалиш килограмите','кога ще отслабнеш след раждането',
    'всички питат кога ще сваля килограмите','коментират килограмите ми след раждането'],
  'lb3-biberon-gyrda': ['биберонът и гърдата','биберон при кърмено бебе',
    'ще откаже ли гърдата от биберона','объркване между биберона и гърдата'],
  'in-razvod-red': ['разводът с малко дете','развод с малко дете',
    'стъпките при развод с дете','как се развеждаме с малко дете'],
  'shevat-boli-sled-dva-meseca': ['шевът още боли','шевът още ме боли',
    'шевът боли месеци след раждането','болка на шева след два месеца'],
  'br-hronichna-bolest-lekarstva': ['хронична болест и бременност',
    'хронична болест лекарството не се спира сама',
    'лекарството за хронична болест в бременността','да спра ли хроничното лекарство бременна'],
  'rz-bebe-1-3-meseca': ['бебето на 1 3 месеца','развитие на бебе от 1 до 3 месеца',
    'какво прави бебето на 1 3 месеца'],
  'in-dom-po-stai': ['обезопасяване стая по стая'],
  'rz-ekran': ['екраните'],
  'nia-sama': ['сама съм'],
  'ema-sama': ['сама съм']
};

console.log('═══ СВОБОДЕН ЛИ Е ВСЕКИ ПРЕДЛОЖЕН КЛЮЧ ═══');
for (const [id, кл] of Object.entries(ПРЕДЛОЖЕНИЕ)) {
  const e = поId.get(id);
  console.log('');
  console.log('── ' + id + '  [' + e.room + ']');
  for (const k of кл) {
    const н = k.toLowerCase().trim();
    const соб = собственик[н];
    const сега = питай(k, e.room);
    console.log('   „' + k + '"');
    console.log('      буквален собственик: ' + (соб ? соб.join(',') : 'НИКОЙ (свободен)'));
    console.log('      сега отива при      : ' + сега + (сега === id ? '  (вече се хваща!)' : ''));
  }
}
