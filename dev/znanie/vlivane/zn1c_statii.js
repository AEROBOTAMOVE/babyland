// zn1c · статиите: zn1c_statii_izvor.txt → dev/nahodki/statii_zn1c.json + проверка по договора (AGENT_VLIVANE.md)
// node dev/znanie/vlivane/zn1c_statii.js        (пише само стаж-файла на zn1c)
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
const ИЗВОР = path.join(__dirname, 'zn1c_statii_izvor.txt');
const ИЗХОД = path.join(КОРЕН, 'dev/nahodki/statii_zn1c.json');
const КАРТИ = JSON.parse(fs.readFileSync(path.join(КОРЕН, 'dev/nahodki/karti_zn1c.json'), 'utf8'));
const РАЗДЕЛИ = ['🌡️ Температура и инфекции', '🚨 Спешно и травми', '🩹 Кожа и обриви', '🌦️ Сезони и навън', '🚸 Безопасност', '💉 Ваксини', '💩 Коремчето', '🦷 Зъбки и уста', '⚠️ Алергии'];
const текст = fs.readFileSync(ИЗВОР, 'utf8').replace(/\r/g, '');
const статии = [];
for (const парче of текст.split(/^=== /m).filter(x => x.trim())) {
  const [глава, ...тяло] = парче.split(/\n---\n/);
  const редове = глава.split('\n');
  const с = { karta: редове[0].trim() };
  for (const р of редове.slice(1)) { const м = р.match(/^(t|e|s|k|c): (.*)$/); if (м) с[м[1]] = м[2].trim(); }
  с.body = тяло.join('\n---\n').trim();
  статии.push(с);
}
const грешки = [];
const ид = new Set(КАРТИ.map(к => к.id));
for (const с of статии) {
  const к = КАРТИ.find(x => x.id === с.karta);
  const г = м => грешки.push(с.karta + ': ' + м);
  if (!ид.has(с.karta)) г('няма такава карта в стажа');
  for (const п of ['t', 'e', 's', 'k', 'c', 'body']) if (!с[п]) г('липсва ' + п);
  if (к && с.t === к.title) г('заглавието е буква по буква като на картата');
  if (с.s && с.s.length > 200) г('резюмето е ' + с.s.length + ' знака');
  if (!РАЗДЕЛИ.includes(с.c)) г('непознат раздел „' + с.c + '“');
  const б = с.body || '';
  const думи = б.split(/\s+/).filter(Boolean).length;
  if (думи < 260 || думи > 600) г('тялото е ' + думи + ' думи');
  if (!б.startsWith('## ')) г('тялото не започва с „## “');
  if ((б.match(/^## /gm) || []).length < 3) г('под 3 раздела');
  if (/\r/.test(б)) г('\\r в тялото');
  for (const ред of б.split('\n')) if (/🚨/.test(ред) && !/^(🚨|- 🚨)/.test(ред)) г('ред с 🚨 не започва с него: ' + ред.slice(0, 50));
  if (б.split('\n').pop().trim() !== 'Записките не заменят преглед.') г('последният ред не е „Записките не заменят преглед.“');
  const всичко = [с.t, с.s, с.k, б].join('\n');
  if (/["']/.test(всичко)) г('права кавичка или апостроф');
  if (/\d+\s*(мг|мл|mg|ml)/i.test(всичко)) г('доза (число + мг/мл)');
  if (/(гарантиран|100\s*%|винаги помага|напълно безопасно|няма никакъв риск)/i.test(всичко)) г('обещание');
  if ([...(с.e || '')].length > 3) г('емоджито е повече от едно: ' + с.e);
}
const липсващи = КАРТИ.filter(к => !статии.find(с => с.karta === к.id)).map(к => к.id);
if (липсващи.length) грешки.push('карти без статия: ' + липсващи.join(', '));
fs.writeFileSync(ИЗХОД, JSON.stringify(статии, null, 1) + '\n');
for (const с of статии) console.log(с.karta.padEnd(30) + String(с.body.split(/\s+/).filter(Boolean).length).padStart(4) + ' думи · ' + с.c);
console.log('\nстатии: ' + статии.length + ' · карти: ' + КАРТИ.length + ' · грешки: ' + грешки.length);
for (const г of грешки) console.log('🔴 ' + г);
process.exit(грешки.length ? 1 : 0);
