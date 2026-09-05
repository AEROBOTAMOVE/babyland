#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 📚 ИЗПИТ ОТ СТАТИИТЕ — 1133 въпроса с ГОТОВ верен отговор, нито един писан
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09.2026): изпитите, писани на ръка, са по 40 въпроса и струват
// скъпо на време и токени. Собственикът го каза право в очите и беше прав.
//
// ИЗВОРЪТ: всяка статия носи ЗАГЛАВИЕ, писано отделно от ключовете на картите,
// и вече е ВЪРЗАНА за конкретни карти през полето `lib`. Значи имаме 1133
// готови двойки „въпрос → верен отговор", които никой не е съчинявал за изпит.
// Заглавието е тематично — точно както майката пита.
//
// МЯРКАТА: пита се заглавието на статията в стаята на статията. Отговорът е
// ВЕРЕН, ако върнатата карта сочи към ТАЗИ статия в `lib`.
//
// ⚠️ СЛЯПОТО ПЕТНО, КАЗАНО ЧЕСТНО: една статия виси на 1-3 карти, а темата ѝ
//    може почтено да пасва и на четвърта. „Сгрешил" тук значи „не стигна до
//    вързаната карта", НЕ непременно „сбърка". Числото е ПОСОКА, не присъда —
//    гледат се примерите. Затова няма праг и няма изход 1 по процент.
//
// 🩺 САМОПРОВЕРКА: уред, който казва „0", е СЛЯП, не чист. Първата версия на
//    този файл четеше грешния формат, намери 0 статии и весело обяви резултат
//    с NaN%. Затова сега спира с грешка, ако прочетеното е подозрително малко.
//
// ⚠️ ТОЗИ ФАЙЛ САМО ЧЕТЕ.
// ПУСКАНЕ: node dev/izpit_statii.js [--vsichki] [--zapis] [--rezyume]
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ВСИЧКИ = process.argv.includes('--vsichki');
const ЗАПИС = process.argv.includes('--zapis');
const РЕЗЮМЕ = process.argv.includes('--rezyume');
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);

const индекс = JSON.parse(fs.readFileSync(path.join('lib', 'index.json'), 'utf8'));
const сурови = Array.isArray(индекс.items) ? индекс.items : Object.values(индекс.items || {});
const статии = сурови.filter(x => x && x.id && x.t)
  .map(x => ({ id: x.id, title: x.t, room: x.r, summary: x.s }));

if (статии.length < 500) {
  console.error('');
  console.error('  🔴 СЛЯП УРЕД: прочетени само ' + статии.length + ' статии от lib/index.json.');
  console.error('     Форматът се е сменил. Числата нямаше да значат нищо — затова ги няма.');
  console.error('');
  process.exit(2);
}

const статияКъмКарти = new Map();
for (const e of W.KB.entries) {
  const списък = Array.isArray(e.lib) ? e.lib : (e.lib ? [e.lib] : []);
  for (const л of списък) {
    let н = статияКъмКарти.get(л);
    if (!н) { н = new Set(); статияКъмКарти.set(л, н); }
    н.add(e.id);
  }
}
if (статияКъмКарти.size < 200) {
  console.error('');
  console.error('  🔴 СЛЯП УРЕД: само ' + статияКъмКарти.size + ' статии имат вързана карта.');
  console.error('');
  process.exit(2);
}

const питай = (т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з || null;
  } catch (e) { return null; }
};

let вярна = 0, чужда = 0, тишина = 0, безВръзка = 0;
const лоши = [];
const кръст = new Map();
for (const с of статии) {
  const цел = статияКъмКарти.get(с.id);
  if (!цел || !цел.size) { безВръзка++; continue; }
  const въпрос = РЕЗЮМЕ && с.summary ? с.summary : с.title;
  const о = питай(въпрос, с.room || 'Моето бебе');
  if (!о) { тишина++; лоши.push({ ст: с.id, q: въпрос, room: с.room, взе: null, цел: [...цел] }); continue; }
  if (цел.has(о.id)) { вярна++; continue; }
  чужда++;
  if (о.room !== с.room) {
    const к = с.room + ' → ' + о.room;
    кръст.set(к, (кръст.get(к) || 0) + 1);
  }
  лоши.push({ ст: с.id, q: въпрос, room: с.room, взе: о.id, вт: о.title, вр: о.room, цел: [...цел] });
}

const общо = вярна + чужда + тишина;
console.log('');
console.log('  📚 ИЗПИТ ОТ СТАТИИТЕ · ' + статии.length + ' статии, ' + общо + ' с вързана карта');
console.log('     питано с: ' + (РЕЗЮМЕ ? 'РЕЗЮМЕТО' : 'ЗАГЛАВИЕТО') + ' · ' + безВръзка + ' статии без карта не се изпитват');
console.log('');
console.log('  ✅ стига до вързаната карта : ' + вярна + '  (' + (вярна * 100 / общо).toFixed(1) + '%)');
console.log('  🟠 стига до ДРУГА карта     : ' + чужда + '  (' + (чужда * 100 / общо).toFixed(1) + '%)');
console.log('  🔴 тишина                   : ' + тишина + '  (' + (тишина * 100 / общо).toFixed(1) + '%)');
if (кръст.size) {
  console.log('');
  console.log('  ── стигна до ДРУГА СТАЯ ──');
  [...кръст.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([k, v]) => console.log('   ' + String(v).padStart(4) + '  ' + k));
}
console.log('');
for (const x of (ВСИЧКИ ? лоши : лоши.slice(0, 25))) {
  console.log('  ' + (x.взе ? '🟠' : '🔴') + ' [' + (x.room || '?') + '] „' + String(x.q).slice(0, 64) + '“');
  console.log('      взе : ' + (x.взе ? x.взе + ' „' + String(x.вт).slice(0, 34) + '“' : 'ТИШИНА'));
  console.log('      цел : ' + x.цел.slice(0, 3).join(', '));
}
if (!ВСИЧКИ && лоши.length > 25) console.log('  … и още ' + (лоши.length - 25));
if (ЗАПИС) {
  fs.writeFileSync('dev/nahodki/_izpit_statii.json', JSON.stringify(лоши, null, 1));
  console.log('');
  console.log('  записано в dev/nahodki/_izpit_statii.json (' + лоши.length + ')');
}
console.log('');
