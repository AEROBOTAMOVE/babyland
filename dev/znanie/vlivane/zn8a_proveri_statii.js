// zn8a · само чете: проверява statii_zn8a.json по правилата на dev/slivach_statii.js (ГЕЙТ), без „картата съществува“
// (картите още не са в kb.js — статиите се вливат след тях). Плюс: всяка статия има своя карта в karti_zn8a.json.
'use strict';
const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..'); process.chdir(КОРЕН);
const С = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn8a.json', 'utf8'));
const К = new Map(JSON.parse(fs.readFileSync('dev/nahodki/karti_zn8a.json', 'utf8')).map(к => [к.id, к]));
const индекс = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const РАЗДЕЛИ = {}; for (const it of индекс.items) (РАЗДЕЛИ[it.r] = РАЗДЕЛИ[it.r] || new Set()).add(it.c);
const ДОЗА = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const ОБЕЩАНИЯ = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const ЛАТ = /\d\s*(ml|mg|kg|cm)\b/i;
let лоши = 0;
for (const с of С) {
  const к = К.get(с.karta); const пр = [];
  const липсва = ['karta', 't', 'e', 's', 'k', 'c', 'body'].filter(x => !с[x] || !String(с[x]).trim());
  if (липсва.length) пр.push('липсват ' + липсва.join(','));
  if (!к) пр.push('няма карта в стажа');
  const думи = String(с.body).trim().split(/\s+/).length;
  if (думи < 220 || думи > 620) пр.push('думи ' + думи);
  const текст = [с.t, с.s, с.body].join('\n');
  if (/["']/.test(текст)) пр.push('права кавичка');
  if (ДОЗА.test(текст)) пр.push('доза');
  if (ОБЕЩАНИЯ.test(текст)) пр.push('обещание');
  if (ЛАТ.test(текст)) пр.push('латинска мярка');
  if (!/^##\s/.test(String(с.body).trim())) пр.push('не започва с ##');
  if ((String(с.body).match(/^##\s+.+$/gm) || []).length < 3) пр.push('под 3 раздела');
  if (String(с.body).split('\n').some(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l))) пр.push('🚨 не е в началото');
  if (/\r/.test(с.body)) пр.push('\\r');
  const стая = к ? к.room : '?';
  if (!(РАЗДЕЛИ[стая] && РАЗДЕЛИ[стая].has(с.c))) пр.push('разделът „' + с.c + '“ го няма в „' + стая + '“');
  if (String(с.s).length > 200) пр.push('резюме ' + String(с.s).length);
  if (к && String(с.t).trim() === String(к.title).trim()) пр.push('заглавие = на картата');
  if (String(с.body).trim().split('\n').pop() !== 'Записките не заменят преглед.') пр.push('последният ред не е „Записките не заменят преглед.“');
  const разд = (String(с.body).match(/^## .+$/gm) || []).join(' | ');
  if (разд !== '## Какво прави | ## Сън и хранене | ## Прегледи и ваксини | ## Игра за месеца | ## Кога да питаш педиатъра') пр.push('раздели: ' + разд);
  if (пр.length) лоши++;
  console.log((пр.length ? '🔴 ' : '✅ ') + с.karta.padEnd(14) + ' ' + думи + ' д. ' + (пр.join(' · ')));
}
// същите проверки за картите (текстът)
for (const к of К.values()) {
  const т = [к.title, к.core, к.tip, к.follow].join('\n'); const пр = [];
  const д = String(к.core).trim().split(/\s+/).length;
  if (д < 90 || д > 170) пр.push('core ' + д + ' думи (искано 90–170)');
  if (/["']/.test(т)) пр.push('права кавичка');
  if (ДОЗА.test(т) || ОБЕЩАНИЯ.test(т) || ЛАТ.test(т)) пр.push('доза/обещание/латинска мярка');
  if (к.keys.length < 12) пр.push('ключове ' + к.keys.length);
  const лат = к.keys.filter(x => /^[a-z0-9 ]+$/.test(x)).length; if (лат < 2) пр.push('латински ключове ' + лат);
  if (!(к.chips && к.chips.length >= 1 && к.chips.length <= 3)) пр.push('чипове ' + (к.chips || []).length);
  if (пр.length) лоши++;
  console.log((пр.length ? '🔴 ' : '✅ ') + к.id.padEnd(14) + ' карта · core ' + д + ' д. · ключове ' + к.keys.length + ' (латиница ' + лат + ') ' + пр.join(' · '));
}
console.log('\nстатии: ' + С.length + ' · карти: ' + К.size + ' · с проблем: ' + лоши);
