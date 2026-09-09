// ⚖️ ОТ КАКВО Е НАПРАВЕН kb.js — преброено, не предположено.
//
// Таванът за JS беше вдигнат 2.40 → 2.60 МБ с изричен срок: „следващото
// прекрачване НЕ се вдига — разцепва се". Преди да се разцепва каквото и
// да било, трябва да се знае КОЕ тежи. Гадаенето тук струва един ден.
//
// Мери се и СУРОВО, и GZIP — защото по мрежата пътува gzip, а решението
// „втори файл" се плаща точно там.
const fs = require('fs');
const zlib = require('zlib');
const { zaredi } = require('./pyasachnik.js');

const сурово = fs.readFileSync('js/kb.js', 'utf8');
const W = zaredi(null);
const KB = W.BL_KB || W.KB;
const карти = KB.entries || [];

const gz = s => zlib.gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;
const кб = n => (n / 1024).toFixed(0) + ' КБ';
const мб = n => (n / 1048576).toFixed(2) + ' МБ';

// ── съставките, всяка сглобена като собствен текст ──────────────────────
const части = {
  'ключове': [], 'заглавия': [], 'core (текстът за майката)': [],
  'tip': [], 'follow': [], 'chips': [], 'id + стая + възраст': [], 'lib': [],
};
for (const e of карти) {
  части['ключове'].push((e.keys || []).join('\n'));
  части['заглавия'].push(String(e.title || e.t || ''));
  части['core (текстът за майката)'].push(String(e.core || ''));
  части['tip'].push(String(e.tip || ''));
  части['follow'].push(String(e.follow || ''));
  части['chips'].push((e.chips || []).join(','));
  части['id + стая + възраст'].push([e.id, e.room, e['от'], e['до']].join('|'));
  части['lib'].push(String(e.lib || ''));
}

// флаговете живеят извън entries
const флагови = ['redFlags', 'motherFlags', 'heavyFlags', 'mamaBodyFlags', 'lossFlags', 'dvFlags', 'pregFlags'];
части['флагове (списъци)'] = флагови.map(и => (KB[и] || []).join('\n'));

console.log('');
console.log('⚖️  ОТ КАКВО Е НАПРАВЕН js/kb.js');
console.log('    файлът на диска: ' + мб(Buffer.byteLength(сурово, 'utf8')) + '   ·  gzip: ' + кб(gz(сурово)));
console.log('    карти: ' + карти.length + '  ·  ключове: ' + карти.reduce((a, e) => a + (e.keys || []).length, 0));
console.log('');
console.log('    съставка                          сурово        gzip     дял от gzip');
console.log('    ' + '─'.repeat(66));

const общГз = gz(сурово);
const редове = [];
for (const [име, парчета] of Object.entries(части)) {
  const текст = парчета.join('\n');
  const с = Buffer.byteLength(текст, 'utf8');
  const g = gz(текст);
  редове.push({ име, с, g });
}
редове.sort((a, b) => b.g - a.g);
let сумаГз = 0;
for (const р of редове) {
  сумаГз += р.g;
  console.log('    ' + р.име.padEnd(32) + кб(р.с).padStart(9) + кб(р.g).padStart(12) + ('  ' + (100 * р.g / общГз).toFixed(1) + '%').padStart(14));
}
console.log('    ' + '─'.repeat(66));
console.log('    ' + 'сборът на съставките'.padEnd(32) + ''.padStart(9) + кб(сумаГз).padStart(12) + ('  ' + (100 * сумаГз / общГз).toFixed(1) + '%').padStart(14));
console.log('');
console.log('    ⚠️  Сборът НЕ Е равен на файла: gzip печели от повторения МЕЖДУ');
console.log('        съставките, а тук всяка е стисната сама. Затова числото за');
console.log('        „какво ще спестим" е ПО-МАЛКО от дела — виж следващия ред.');
console.log('');

// ── ИСТИНСКИЯТ въпрос: колко пада файлът, ако ключовете ги няма ─────────
const безКлючове = сурово.replace(/keys: \[[^\]]*\]/g, 'keys: []');
const безCore = сурово.replace(/core: ('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, "core: ''");
console.log('    ── КОЛКО ПАДА САМИЯТ ФАЙЛ (истинската мярка) ──');
console.log('       както е сега                    ' + кб(gz(сурово)).padStart(10));
console.log('       БЕЗ ключовете                   ' + кб(gz(безКлючове)).padStart(10) + '   спестени ' + кб(gz(сурово) - gz(безКлючове)));
console.log('       БЕЗ core                        ' + кб(gz(безCore)).padStart(10) + '   спестени ' + кб(gz(сурово) - gz(безCore)));
console.log('');

// ── и колко тежи САМО файлът с ключовете, ако се изнесе ────────────────
const самоКлючове = карти.map(e => e.id + '\t' + (e.keys || []).join('\t')).join('\n');
console.log('    ── АКО КЛЮЧОВЕТЕ СТАНАТ ОТДЕЛЕН ФАЙЛ ──');
console.log('       kb.js без тях                   ' + кб(gz(безКлючове)).padStart(10));
console.log('       новият файл (табулиран текст)   ' + кб(gz(самоКлючове)).padStart(10));
console.log('       ДВАТА ЗАЕДНО                    ' + кб(gz(безКлючове) + gz(самоКлючове)).padStart(10)
  + '   спрямо сегашния: ' + (gz(безКлючове) + gz(самоКлючове) - gz(сурово) > 0 ? '+' : '') + кб(gz(безКлючове) + gz(самоКлючове) - gz(сурово)));
console.log('');
console.log('       ⚠️  Ако „двата заедно" е повече от сегашния, разцепването НЕ');
console.log('           спестява трафик — то само отлага част от него. Печалбата');
console.log('           тогава е в ПЪРВОТО РИСУВАНЕ, не в общото тегло.');
console.log('');

// ── повторенията: колко ключа са подниз на друг ключ на СЪЩАТА карта ───
let излишни = 0, прегледани = 0;
for (const e of карти) {
  const k = (e.keys || []).map(String);
  прегледани += k.length;
  for (let i = 0; i < k.length; i++)
    for (let j = 0; j < k.length; j++)
      if (i !== j && k[j].length > k[i].length && k[j].indexOf(k[i]) >= 0) { излишни++; break; }
}
console.log('    ── ПОВТОРЕНИЯ ВЪТРЕ В САМИТЕ КЛЮЧОВЕ ──');
console.log('       ключове общо: ' + прегледани);
console.log('       ключ, който е ПОДНИЗ на друг ключ на същата карта: ' + излишни
  + '  (' + (100 * излишни / прегледани).toFixed(1) + '%)');
console.log('       ⚠️ Подниз НЕ значи излишен: матчърът иска НЕПРЕКЪСНАТА част от');
console.log('          изречението, а по-късият ключ хваща изречения, в които');
console.log('          по-дългият не се побира. Това е число за ЧЕТЕНЕ, не за рязане.');
console.log('');
