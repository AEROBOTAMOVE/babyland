// zn7b · ХИПОТЕЗА за js/helper.js (кърпи САМО В ПАМЕТТА, файлът не се пипа):
//   „СЕДМИЦАТА КАЗВА КОГА“ брои тематичните попадения (темаMeaty) и от КОРЕНОВАТА точка.
//   А коренът се дава и на служебни думи: „имам“ улучва корена на ключа „имам 29 седмици“
//   (zn7b-…, br-sedmici), „седмица“ — на ключ, който почва със „седмиц…“. Така седмичната
//   карта/ br-sedmici изглеждат „тематични“ и правилото не се задейства или връща br-sedmici.
//   Поправката: (1) коренова точка от дума, която е само възраст/време/обща за седмицата,
//   не е тема; (2) едносричен ключ, който е само число/време („38“, „39“), не е тема.
//   Засяга САМО темаMeaty → само правилото „СЕДМИЦАТА КАЗВА КОГА“. Резултатите не се менят.
'use strict';
const заместа = (src, от, до) => {
  const n = src.split(от).length - 1;
  if (n !== 1) throw new Error('кръпката не е еднозначна (' + n + '): ' + от.slice(0, 60));
  return src.replace(от, до);
};
module.exports = function кръпкаКорен(hp) {
  const НР = hp.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  hp = hp.split('\r\n').join('\n');
  hp = заместа(hp, 'const коренДаден = new Set();', 'const коренДаден = new Set(); let коренВреме = false;');
  hp = заместа(hp, '          коренДаден.add(w);\n          return true;',
    '          коренДаден.add(w);\n          коренВреме = САМО_ВЪЗРАСТ.test(w) || ВРЕМЕ_ДОП.test(w) || ОБЩ_ЗА_СЕДМИЦАТА.test(w);\n          return true;');
  hp = заместа(hp, 'прощенаТежест(nk) : 1); meaty++; темаMeaty++;', 'прощенаТежест(nk) : 1); meaty++; if (!коренВреме) темаMeaty++;');
  hp = заместа(hp, "if (!isStop && !(nk.includes(' ') && седмичнаФраза(nk))) темаMeaty++;",
    "if (!isStop && !(nk.includes(' ') && седмичнаФраза(nk)) && !(!nk.includes(' ') && (САМО_ВЪЗРАСТ.test(nk) || ВРЕМЕ_ДОП.test(nk)))) темаMeaty++;");
  return НР === '\r\n' ? hp.split('\n').join('\r\n') : hp;
};
// ВАРИАНТ 2 (по-широк): служебната дума изобщо НЕ взема коренова точка (не само „не е тема“).
//   Причина: ключ, който почва със „седмица…“ („седмица съм и кървя“), вдига с корена всяка
//   карта при всеки въпрос „на N седмица …“ — мерено: „на 22 седмица съм и имам хемороиди“ и
//   „na 37 sedmica sam mozhe li da rodya“ сменят тематичния победител само заради тази точка.
//   Засяга резултата навсякъде → мери се с zn7b_korpus_hp.js (корпус + ключовете).
module.exports.v2 = function кръпкаКорен2(hp) {
  const НР = hp.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  hp = hp.split('\r\n').join('\n');
  hp = заместа(hp, "const w = words.find(w => w.length > 3 && !STOP.has(w) && !коренДаден.has(w) && nk.startsWith(w.slice(0, Math.min(6, w.length))));",
    "const w = words.find(w => w.length > 3 && !STOP.has(w) && !коренДаден.has(w) && !САМО_ВЪЗРАСТ.test(w) && !ВРЕМЕ_ДОП.test(w) && !ОБЩ_ЗА_СЕДМИЦАТА.test(w) && nk.startsWith(w.slice(0, Math.min(6, w.length))));");
  hp = заместа(hp, "if (!isStop && !(nk.includes(' ') && седмичнаФраза(nk))) темаMeaty++;",
    "if (!isStop && !(nk.includes(' ') && седмичнаФраза(nk)) && !(!nk.includes(' ') && (САМО_ВЪЗРАСТ.test(nk) || ВРЕМЕ_ДОП.test(nk)))) темаMeaty++;");
  return НР === '\r\n' ? hp.split('\n').join('\r\n') : hp;
};
// ВАРИАНТ 3 (тесен): вариант 1 + коренова точка НЕ се дава само за „имам“ и „седмица/седмици/седмицата“
//   (двата магнита, видени в мярката). Вариант 2 смени 8 изречения в корпуса (вкл. СПЕШНИ) — отхвърлен.
module.exports.v3 = function кръпкаКорен3(hp) {
  hp = module.exports(hp);
  const НР = hp.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  hp = hp.split('\r\n').join('\n');
  hp = заместа(hp, "const w = words.find(w => w.length > 3 && !STOP.has(w) && !коренДаден.has(w) && nk.startsWith(w.slice(0, Math.min(6, w.length))));",
    "const w = words.find(w => w.length > 3 && !STOP.has(w) && !коренДаден.has(w) && !/^(имам|седмица|седмици|седмицата)$/.test(w) && nk.startsWith(w.slice(0, Math.min(6, w.length))));");
  return НР === '\r\n' ? hp.split('\n').join('\r\n') : hp;
};
module.exports.izberi = v => v === '2' ? module.exports.v2 : v === '3' ? module.exports.v3 : module.exports;
