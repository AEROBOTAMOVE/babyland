// zn3 · строи dev/nahodki/karti_zn3.json и statii_zn3.json от zn3_karti_data.js / zn3_statii_data.js
// и проверява правилата на договора (AGENT_VLIVANE.md) преди гейта. Пише САМО двата стаж-файла.
// node dev/znanie/vlivane/zn3_build.js
const fs = require('fs');
const path = require('path');
const K = require('./zn3_karti_data.js');
const S = require('./zn3_statii_data.js');
const СТАИ = new Set(['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията']);
const РАЗДЕЛИ = new Set(['🚗 Продукти и безопасност', '📄 Документи, ясли и кухни', '📎 Още', '⚖️ Права и закрила', '💰 Помощи и НОИ', '🧳 Пътуване']);
const ДОЗА = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const ОБЕЩ = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const ЛАТ = /\d\s*(ml|mg|kg|cm)\b/i;
const думи = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const грешки = [];
const гр = (id, m) => грешки.push(id + ' · ' + m);
const ids = new Set();
for (const к of K) {
  if (!/^zn3-[a-z0-9-]{1,36}$/.test(к.id)) гр(к.id, 'id');
  if (ids.has(к.id)) гр(к.id, 'повторено id'); ids.add(к.id);
  if (!СТАИ.has(к.room)) гр(к.id, 'стая');
  const т = [к.title, к.core, к.tip, к.follow].join('\n');
  if (/["']/.test(т)) гр(к.id, 'права кавичка в текста');
  if (ДОЗА.test(т)) гр(к.id, 'доза');
  if (ОБЕЩ.test(т)) гр(к.id, 'обещание');
  if (ЛАТ.test(т)) гр(к.id, 'латинска мярка');
  const dc = думи(к.core);
  if (dc < 60 || dc > 150) гр(к.id, 'core ' + dc + ' думи (60–150)');
  if (!/^💡/.test(к.tip)) гр(к.id, 'tip без 💡');
  if (к.follow && /🚨/.test(к.follow) && !/^🚨/.test(к.follow)) гр(к.id, '🚨 не е отпред');
  if (к.keys.length < 12) гр(к.id, 'ключове ' + к.keys.length);
  const лат = к.keys.filter(k => /^[a-z0-9 ]+$/.test(k) && /[a-z]{3}/.test(k)).length;
  if (лат < 2) гр(к.id, 'шльокавица ' + лат);
  const вид = new Set();
  for (const k of к.keys) {
    if (k !== k.toLowerCase()) гр(к.id, 'главна буква в ключ: ' + k);
    if (/["']/.test(k)) гр(к.id, 'кавичка в ключ: ' + k);
    const n = думи(k); if (n < 2 || n > 6) гр(к.id, 'ключ ' + n + ' думи: ' + k);
    if (вид.has(k)) гр(к.id, 'повторен ключ: ' + k); вид.add(k);
  }
  if (!к.chips || к.chips.length < 1 || к.chips.length > 3) гр(к.id, 'чипове');
}
// ключ-крадец между собствените карти
const всички = new Map();
for (const к of K) for (const k of к.keys) { if (всички.has(k)) гр(к.id, 'ключът е и на ' + всички.get(k) + ': ' + k); всички.set(k, к.id); }
// статиите
const скарти = new Set();
for (const с of S) {
  const к = K.find(x => x.id === с.karta);
  if (!к) { гр(с.karta, 'статия без карта'); continue; }
  if (скарти.has(с.karta)) гр(с.karta, 'две статии'); скарти.add(с.karta);
  с.body = String(с.body).replace(/\r/g, '').trim();
  const db = думи(с.body);
  if (db < 260 || db > 600) гр(с.karta, 'статия ' + db + ' думи (260–600)');
  if (!/^##\s/.test(с.body)) гр(с.karta, 'тялото не почва с ##');
  const р = (с.body.match(/^##\s+.+$/gm) || []).length; if (р < 3) гр(с.karta, 'раздели ' + р);
  const т = [с.t, с.s, с.body].join('\n');
  if (/["']/.test(т)) гр(с.karta, 'права кавичка в статията');
  if (ДОЗА.test(т)) гр(с.karta, 'доза в статията');
  if (ОБЕЩ.test(т)) гр(с.karta, 'обещание в статията');
  if (ЛАТ.test(т)) гр(с.karta, 'латинска мярка в статията');
  const лош = с.body.split('\n').findIndex(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
  if (лош >= 0) гр(с.karta, '🚨 по средата на ред ' + (лош + 1));
  if (!РАЗДЕЛИ.has(с.c)) гр(с.karta, 'раздел ' + с.c);
  if (String(с.s).length > 200) гр(с.karta, 'резюме ' + String(с.s).length + ' знака');
  if (с.t.trim() === к.title.trim()) гр(с.karta, 'заглавие като на картата');
  if (/https?:|www\./.test(с.body)) гр(с.karta, 'URL в тялото');
}
for (const к of K) if (!скарти.has(к.id)) гр(к.id, 'карта без статия');
const out = d => JSON.stringify(d, null, 1);
const НАХ = path.resolve(__dirname, '../../nahodki');
console.log('карти: ' + K.length + ' · статии: ' + S.length);
for (const к of K) console.log('   ' + к.id.padEnd(30) + ' core ' + String(думи(к.core)).padStart(3) + ' · ключове ' + к.keys.length +
  ' · статия ' + думи((S.find(s => s.karta === к.id) || {}).body || ''));
if (грешки.length) { console.log('\n🔴 ' + грешки.length + ' грешки:'); for (const g of грешки) console.log('   ' + g); process.exit(1); }
fs.writeFileSync(path.join(НАХ, 'karti_zn3.json'), out(K.map(к => { const o = { id: к.id, room: к.room }; if (к.от != null) o['от'] = к.от; if (к.до != null) o['до'] = к.до; Object.assign(o, { title: к.title, core: к.core, tip: к.tip, follow: к.follow, keys: к.keys, chips: к.chips }); return o; })), 'utf8');
fs.writeFileSync(path.join(НАХ, 'statii_zn3.json'), out(S.map(с => ({ karta: с.karta, t: с.t, e: с.e, s: с.s, k: с.k, c: с.c, body: с.body }))), 'utf8');
console.log('\n✅ записани dev/nahodki/karti_zn3.json и statii_zn3.json');
