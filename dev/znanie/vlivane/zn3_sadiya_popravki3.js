// Съдията zn3 · трети кръг: две изречения от първия кръг, прочетени наново — по-ясен ред и без твърдение без опора.
// node dev/znanie/vlivane/zn3_sadiya_popravki3.js   (спира, ако старият текст не е намерен точно веднъж)
const fs = require('fs');
const FK = 'dev/nahodki/karti_zn3.json', FS = 'dev/nahodki/statii_zn3.json';
const K = JSON.parse(fs.readFileSync(FK, 'utf8'));
const S = JSON.parse(fs.readFileSync(FS, 'utf8'));
function zamen(o, pole, staro, novo) {
  const t = String(o[pole]);
  const b = t.split(staro).length - 1;
  if (b !== 1) throw new Error(pole + ': ' + b + ' пъти: ' + staro.slice(0, 60));
  o[pole] = t.replace(staro, () => novo);
}
zamen(K.find(x => x.id === 'zn3-otsastvie-izsledvania'), 'follow',
  'решават лекарят и правилникът на яслата или градината — че детето не е заразно, го удостоверява лекар след преглед:',
  'решават лекарят и правилникът на яслата или градината. Че не е заразно, удостоверява лекар след преглед:');
// КТ чл. 167а е право на родителя — „разрешен от работодателя“ звучи като милост; казва се само, че се иска писмено
zamen(S.find(x => x.karta === 'zn3-neplaten-do-8'), 'body',
  'а неплатеният не започва сам — трябва да е разрешен от работодателя.',
  'а неплатеният не започва сам — иска се писмено.');
fs.writeFileSync(FK, JSON.stringify(K, null, 1));
fs.writeFileSync(FS, JSON.stringify(S, null, 1));
JSON.parse(fs.readFileSync(FK, 'utf8')); JSON.parse(fs.readFileSync(FS, 'utf8'));
console.log('2 замени · JSON се парсва');
