// zn1a · СЪДИЯТА, втори кръг: ключове 2–6 думи и три статии, паднали под 260 думи след махането на непроверено.
// node dev/znanie/vlivane/zn1a_sadiya_popravki2.js   (cwd = корена) · всяка замяна — точно веднъж, иначе нищо не се пише.
// Добавеното е само от суровината: 02-novorodeno/07 (KidsHealth, NHS), 02-novorodeno/03 (NHS), 03-karmene/07 (НЦОЗА 2024).
const fs = require('fs');
const PK = 'dev/nahodki/karti_zn1a.json', PS = 'dev/nahodki/statii_zn1a.json';
const K = JSON.parse(fs.readFileSync(PK, 'utf8')), S = JSON.parse(fs.readFileSync(PS, 'utf8'));
const gr = [];
function zam(obj, pole, a, b, et) {
  const n = String(obj[pole]).split(a).length - 1;
  if (n !== 1) { gr.push(et + ': „' + a.slice(0, 40) + '“ ×' + n); return; }
  obj[pole] = obj[pole].replace(a, b);
}
function kl(id, staro, novo) {
  const k = K.find(x => x.id === id); const i = k ? k.keys.indexOf(staro) : -1;
  if (i < 0) gr.push(id + ': няма ключ ' + staro); else k.keys[i] = novo;
}
const st = id => S.find(s => s.karta === id);

kl('zn1a-glava-sled-razhdane', 'цефалохематом', 'цефалохематом на новородено');
kl('zn1a-cherveno-oko', 'сини очи на новородено ще останат ли', 'сините очи ще останат ли');

zam(st('zn1a-cherveno-oko'), 'body',
  '- ✅ Ако очите се разминават, отбележи си датата и занеси бележката на прегледа след четвъртия месец.',
  '- ✅ Ако очите се разминават, отбележи си датата и занеси бележката на прегледа след четвъртия месец.\n- ✅ Ако окото сълзи и сутрин е залепнало, а бялото му е спокойно, най-често е тесен сълзен канал — за него има отделна карта.\n\nПодутите клепачи в първите дни понякога пречат на бебето да отваря очите си широко. И това е от раждането и минава.', 'статия очи');

zam(st('zn1a-mramorna-kozha'), 'body',
  '## Как да провериш дали му е топло',
  '## Другите петна от първите дни\n\nДетските ръководства изброяват и други неща със свой срок: червени петна и синини от раждането избледняват за една-две седмици, лющенето — също, а розовите петна по клепачите, челото и врата бледнеят постепенно през първата година.\n\n## Как да провериш дали му е топло', 'статия мрамор');

zam(st('zn1a-chasti-pompa'), 'body',
  '## Помпа втора ръка',
  '## Трябва ли ти помпа изобщо\n\nПътеводителят на НЦОЗА от 2024 г. напомня, че ако бебето суче добре и наддава, изцеждане не е нужно. В първите дни ръчното изцеждане стига, а много болници имат свои помпи с лични части.\n\n## Помпа втора ръка', 'статия помпа');

if (gr.length) { console.log('🔴 НИЩО НЕ Е ЗАПИСАНО:\n  ' + gr.join('\n  ')); process.exit(1); }
fs.writeFileSync(PK, JSON.stringify(K, null, 1) + '\n');
fs.writeFileSync(PS, JSON.stringify(S, null, 1) + '\n');
console.log('✅ втори кръг записан');
