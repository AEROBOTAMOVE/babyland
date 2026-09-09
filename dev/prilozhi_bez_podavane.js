// Разширява БЕЗ_ПОДАВАНЕ с 46-те карти, съдени ДОБЪР от панела и ПРОВЕРЕНИ
// да нямат нито един ред, в който същата карта е ГРЕШЕН отговор.
//
// ПЪТ НАЗАД (преди действието):
//   1. js/helper.js.PREDI_BEZ_PODAVANE46 — копие байт за байт
//   2. git revert
//   3. промяната е ЕДИН масив от низове — маха се id по id
//
// Без --pishi само мери.
const fs = require('fs');
const ПИШИ = process.argv.includes('--pishi');
const П = 'js/helper.js';

const НОВИ = ["bz-what","dn-kogo-da-slusham","in-cheteneto-online","in-samolet","in2-vlazhnost",
"lb-mastit","lb-parvi-zabi","lb2-aki-cvetove","lb2-kola-pat","lb2-noshtni","lb3-razglezvane",
"mb-head","mb-kurmene-navun","mb-navel","mb-otbi-kak","mb-parvite-40-dni","mb5-strah-nepoznati",
"mm-lohia","mst-izlizane-dve-deca","mst-planina-bebe","nd-golyamoto-varna","nd-razlika-decata",
"nd-tatko-ne-zhivee","ni-pat-bebe","nia-dush","nia-nosht-smyana","nia-vino","nia-work",
"nia-yad-adres","pp-cikyl","prz-martenica","pz-cherkva-zimata","rz-govor","rz-gukane","rz-gyrne",
"rz-smyah","sn-budene-za-hranene","sn-hranene-na-san","sn-navan-chas","z4-priyatelka-bez-deca",
"z8-hrana-kyrmachka","zd-teeth","zh-probiotik","zh-weight","zim-oblichane-sloeve","zim-studeno-razhodka"];

const КОТВА = "        'mb-otpusnato', 'zd-pypna-ranka'];";
let s = fs.readFileSync(П, 'utf8');
if (s.split(КОТВА).length - 1 !== 1) { console.log('🔴 котвата не е точно една — НЕ ПИША'); process.exit(2); }

// ── КОНТРОЛ: всяко id трябва да СЪЩЕСТВУВА в базата ──
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const има = new Set((KB.entries || []).map(e => e.id));
const липсват = НОВИ.filter(i => !има.has(i));
if (липсват.length) { console.log('🔴 несъществуващи id: ' + липсват.join(', ')); process.exit(2); }
const дубли = НОВИ.filter((x, i) => НОВИ.indexOf(x) !== i);
if (дубли.length) { console.log('🔴 повторени id: ' + дубли.join(', ')); process.exit(2); }
console.log('✅ всичките ' + НОВИ.length + ' id съществуват, без повторения');

// ── КОНТРОЛ: не пипаме вече вписаните ──
const сегашни = (/const БЕЗ_ПОДАВАНЕ = \[([\s\S]*?)\];/.exec(s) || [])[1] || '';
const вече = НОВИ.filter(i => сегашни.indexOf("'" + i + "'") >= 0);
if (вече.length) { console.log('⚠️ вече ги има: ' + вече.join(', ')); }

const КОМ = [
  "        // ➕ 09.09 · 46 КАРТИ, СЪДЕНИ ОТ ПАНЕЛ ВЪРХУ 146 ЖИВИ ВРАТИ.",
  "        //   Мярката: 609 независими въпроса през реда на вратите → 141 от тях",
  "        //   (23%) получаваха „Това е повече по частта на…\" вместо отговора.",
  "        //   Дванайсет съдии прочетоха ВЪПРОСА и ТЕКСТА на намерената карта:",
  "        //       ДОБЪР 64 · ЧАСТИЧЕН 40 · ГРЕШЕН 42",
  "        //   Тоест вратата НЕ Е излишна — тя спира 42 уверено грешни отговора.",
  "        //   Затова тук влизат само карти, които са ДОБЪР отговор и нямат",
  "        //   НИТО ЕДИН ред, в който същата карта е ГРЕШЕН отговор.",
  "        //   ⚠️ Шест карти са и вярна, и грешна според въпроса и НЕ влизат:",
  "        //   ch-spisak · in-samoto-prilozhenie · mb-dushut · nd-parvite-pati ·",
  "        //   nia-rabota · pp-kosopad. Пример, проверен на ръка: nia-rabota е",
  "        //   верен за „връщам се на работа и ме боли\" и грешен за „как да кажа",
  "        //   на шефа\". Списък по id е сляп за въпроса — затова изключение, не",
  "        //   правило. Истинската поправка на тези е в КЛЮЧОВЕТЕ.",
  "        //   ⚠️ И още: вратата ВЕЧЕ носи въпроса (helper.js:3715 → open(…, вземи)",
  "        //   → ask), тоест цената ѝ е едно докосване, не преписване. Затова",
  "        //   тук не се пипа самата врата, а само кои карти я заобикалят.",
].join('\n');

const ред = НОВИ.map(i => "'" + i + "'").join(', ');
const нов = s.replace(КОТВА, "        'mb-otpusnato', 'zd-pypna-ranka',\n" + КОМ + '\n        ' + ред + '];');
if (нов === s) { console.log('🔴 нищо не се смени'); process.exit(2); }
for (const i of ['bz-what', 'zim-studeno-razhodka', 'nia-vino']) {
  if (нов.indexOf("'" + i + "'") < 0) { console.log('🔴 „' + i + '" не влезе'); process.exit(2); }
}
console.log('✅ замяната е готова (' + (нов.length - s.length) + ' знака повече)');
if (!ПИШИ) { console.log('\n(сухо · пусни с --pishi)'); process.exit(0); }
fs.writeFileSync(П + '.PREDI_BEZ_PODAVANE46', s);
fs.writeFileSync(П, нов);
console.log('\n✅ ЗАПИСАНО · копие: ' + П + '.PREDI_BEZ_PODAVANE46');
