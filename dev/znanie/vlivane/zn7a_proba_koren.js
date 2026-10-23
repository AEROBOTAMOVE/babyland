// zn7a · ОПИТ САМО В ПАМЕТТА: правилото „СЕДМИЦАТА КАЗВА КОГА“ + корен-клонът да не дава тематична точка
// на седмичен ключ. Мерено 22.10: с ключовете V1 „8 седмица бременност ми се гади“ остава при седмичната
// карта, защото ключ „бременна в 8 седмица“ (неулучен като фраза) взема КОРЕНОВА точка от думата
// „бременност“ → темаMeaty++ → bestТема = 1 → правилото не се задейства. Същото с „родих преди …“ от „родих“.
// Тук корен-клонът брои темаMeaty само ако ключът НЕ е седмична фраза. js/helper.js НЕ се пипа —
// кръпката е върху текста в паметта (опцията patch на pyasachnik.zaredi).
//   node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7a_proba_koren.js ИЗХОД.txt [--staj=…] [--smes=…] [--bez4]
'use strict';
const path = require('path');
const П = require(path.resolve(__dirname, '../../pyasachnik.js'));
const СТАР = ': 1); meaty++; темаMeaty++;';
const НОВ = ": 1); meaty++; if (!(nk.includes(' ') && седмичнаФраза(nk))) темаMeaty++;";
const кръпка = hp => {
  const n = hp.split(СТАР).length - 1;
  if (n !== 1) throw new Error('корен-клонът не е разпознат (намерени ' + n + ')');
  return hp.replace(СТАР, НОВ);
};
const оригинал = П.zaredi;
П.zaredi = (patch, опции) => оригинал(hp => кръпка(patch ? patch(hp) : hp), опции);
console.log('🧪 корен-кръпка в паметта: включена');
require('./zn7a_proba.js');
