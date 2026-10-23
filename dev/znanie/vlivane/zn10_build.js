// zn10 · сглобява стажа и проверява правилата на договора (AGENT_VLIVANE.md + задачата: core 80–150, статия 300–600),
// без да пипа js/. Пише САМО dev/nahodki/karti_zn10.json и dev/nahodki/statii_zn10.json.
// Пускане (през опашката, защото зарежда kb.js през пясъчника):
//   node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn10_build.js
// Път назад: изтрий двата стаж-файла; js/ не се пипа.
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);

delete require.cache[require.resolve(path.join(__dirname, 'zn10_src.js'))];
const { КАРТИ, СТАТИИ } = require(path.join(__dirname, 'zn10_src.js'));

const карти = КАРТИ.map(к => {
  const о = { id: к.id, room: к.room };
  if (к.от != null) о.от = к.от;
  if (к.до != null) о.до = к.до;
  о.title = к.title; о.core = к.core; о.tip = к.tip;
  if (к.follow) о.follow = к.follow;
  о.keys = к.keys; о.chips = к.chips || [];
  return о;
});
const статии = СТАТИИ.map(с => ({ karta: с.karta, t: с.t, e: с.e, s: с.s, k: с.k, c: с.c, body: с.body.replace(/\r/g, '').trim() }));
fs.writeFileSync('dev/nahodki/karti_zn10.json', JSON.stringify(карти, null, 1) + '\n', 'utf8');
fs.writeFileSync('dev/nahodki/statii_zn10.json', JSON.stringify(статии, null, 1) + '\n', 'utf8');
console.log('записани: карти ' + карти.length + ' · статии ' + статии.length);

const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null);
const ЖИВИ = new Map(W.KB.entries.map(e => [e.id, e]));
const ЖИВИ_КЛ = new Map();
for (const e of W.KB.entries) for (const k of (e.keys || [])) ЖИВИ_КЛ.set(String(k).toLowerCase(), e.id);
const МОИ = new Set(карти.map(к => к.id));
const РАЗДЕЛИ = {
  'Моето бебе': ['🐣 Новородено', '🤱 Кърмене', '🍼 Шише и изцеждане', '😴 Сън', '🧴 Грижи', '📏 Растеж', '👶 Недоносено бебе и НИКУ', '👯 Близнаци', '🎉 Празници'],
  'Развитие и игри': ['🎲 Игра и учене', '🧺 Игри с това, което имаш', '🗣️ Говор', '🤸 Движение', '😤 Поведение', '📅 Месец по месец', '🎵 Музика и книжки', '👀 Тревоги', '🎒 Ясла и раздяла', '🚽 Гърне', '📱 Екрани', '🎉 Празници'],
  'Дневник на мама': ['💜 Емоции', '👨‍👩‍👧 Семейство', '👵 Роднини и граници', '🩺 Възстановяване', '🎉 Празници']
};
const думи = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const ДОЗА = /\d+\s*(мг|мл|mg|ml)/i;
const ОБЕЩ = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасно|няма никакъв риск)/i;
const ГОЛИ = new Set(['приказка', 'история', 'игра', 'приказки', 'игри', 'буквите', 'баба']);
let грешки = 0, жълто = 0;
const гр = (id, т) => { грешки++; console.log('  🔴 ' + id + ': ' + т); };
const жл = (id, т) => { жълто++; console.log('  🟡 ' + id + ': ' + т); };
const вид = new Map();
for (const к of карти) {
  if (!/^zn10-[a-z0-9-]{1,35}$/.test(к.id) || к.id.length > 40) гр(к.id, 'лош id');
  if (ЖИВИ.has(к.id)) гр(к.id, 'id вече е в kb.js');
  if (!РАЗДЕЛИ[к.room]) гр(к.id, 'стая извън плана: ' + к.room);
  const т = [к.title, к.core, к.tip, к.follow || ''].join('\n');
  if (/["'`]/.test(т)) гр(к.id, 'права кавичка');
  if (ДОЗА.test(т)) гр(к.id, 'доза');
  if (ОБЕЩ.test(т)) гр(к.id, 'обещание');
  if (/\b112\b/.test(т)) гр(к.id, '112 в нездравна карта');
  const д = думи(к.core);
  if (д < 80 || д > 150) гр(к.id, 'core е ' + д + ' думи (цел 80–150)');
  if (!/^💡/.test(к.tip)) гр(к.id, 'tip без 💡');
  if (!к.follow) гр(к.id, 'няма follow');
  if (к.keys.length < 12) гр(к.id, 'само ' + к.keys.length + ' ключа');
  const лат = к.keys.filter(x => /[a-z]/.test(x)).length;
  if (лат < 2 || лат > 3) гр(к.id, 'шльокавица: ' + лат);
  for (const x of к.keys) {
    if (x !== x.toLowerCase()) гр(к.id, 'главна буква в ключ „' + x + '“');
    if (/["'`]/.test(x)) гр(к.id, 'кавичка в ключ');
    const n = думи(x);
    if (n < 2 || n > 6) гр(к.id, 'ключ с ' + n + ' думи: „' + x + '“');
    if (ГОЛИ.has(x)) гр(к.id, 'гол общ ключ „' + x + '“');
    if (ЖИВИ_КЛ.has(x.toLowerCase())) гр(к.id, 'ключ-крадец „' + x + '“ → ' + ЖИВИ_КЛ.get(x.toLowerCase()));
    if (вид.has(x)) гр(к.id, 'ключ повтаря моя карта ' + вид.get(x) + ': „' + x + '“'); else вид.set(x, к.id);
  }
  if (!к.chips.length || к.chips.length > 3) гр(к.id, 'чипове: ' + к.chips.length);
  for (const ч of к.chips) if (!ЖИВИ.has(ч) && !МОИ.has(ч)) гр(к.id, 'чип към несъществуваща: ' + ч);
  if (к.chips.includes(к.id)) гр(к.id, 'чип към себе си');
  // цитат над 15 думи в „…“ — за четене (нашите изречения към детето са позволени, чужд текст — не)
  for (const m of т.match(/„[^“]*“/g) || []) if (думи(m) > 15) жл(к.id, 'цитат ' + думи(m) + ' думи: ' + m.slice(0, 60) + '…');
}
const сКарта = new Map(карти.map(к => [к.id, к]));
const видяниСт = new Set();
for (const с of статии) {
  const к = сКарта.get(с.karta);
  if (!к) { гр(с.karta, 'статия без карта'); continue; }
  if (видяниСт.has(с.karta)) гр(с.karta, 'втора статия'); видяниСт.add(с.karta);
  if (с.t === к.title) гр(с.karta, 'заглавието на статията = на картата');
  if ([...с.e].length > 3 || !с.e) гр(с.karta, 'емоджи: ' + с.e);
  if (с.s.length > 200) гр(с.karta, 's е ' + с.s.length + ' знака');
  if (!(РАЗДЕЛИ[к.room] || []).includes(с.c)) гр(с.karta, 'раздел „' + с.c + '“ не е на стаята');
  const б = с.body;
  if (!/^## /.test(б)) гр(с.karta, 'тялото не почва с ##');
  if (/\r/.test(б)) гр(с.karta, '\\r в тялото');
  const разд = (б.match(/^## /gm) || []).length;
  if (разд < 3) гр(с.karta, 'раздели: ' + разд);
  const дб = думи(б.replace(/[#*✅⛔⚠️🟡🚨-]/g, ' '));
  if (дб < 300 || дб > 600) гр(с.karta, 'тялото е ' + дб + ' думи (цел 300–600)');
  if (/["'`]/.test(б + с.t + с.s + с.k)) гр(с.karta, 'права кавичка в статията');
  if (ДОЗА.test(б)) гр(с.karta, 'доза в статията');
  if (ОБЕЩ.test(б)) гр(с.karta, 'обещание в статията');
  for (const ред of б.split('\n')) if (/🚨/.test(ред) && !/^(🚨|- 🚨)/.test(ред)) гр(с.karta, 'ред с 🚨 не почва с 🚨: ' + ред.slice(0, 50));
  for (const m of б.match(/„[^“]*“/g) || []) if (думи(m) > 15) жл(с.karta, 'цитат в статията ' + думи(m) + ' думи: ' + m.slice(0, 60) + '…');
  console.log('  · ' + с.karta.padEnd(30) + ' core ' + String(думи(к.core)).padStart(3) + ' · статия ' + String(дб).padStart(3) + ' · ключове ' + к.keys.length + ' · ' + к.room + ' / ' + с.c);
}
for (const к of карти) if (!видяниСт.has(к.id)) гр(к.id, 'карта без статия');
console.log((жълто ? '\n🟡 за четене: ' + жълто : '') + (грешки ? '\n🔴 грешки: ' + грешки : '\n✅ всички правила минават (' + карти.length + ' карти, ' + статии.length + ' статии)'));
process.exit(грешки ? 1 : 0);
