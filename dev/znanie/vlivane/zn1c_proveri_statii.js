// Съдията zn1c · проверител на статиите и картите по договора dev/znanie/AGENT_VLIVANE.md.
// node dev/znanie/vlivane/zn1c_proveri_statii.js   (само чете; изход 0 = чисто, 1 = има грешки)
const fs = require('fs');
const K = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1c.json', 'utf8'));
const S = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn1c.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const RAZDELI_DOGOVOR = ['🌡️ Температура и инфекции', '🚨 Спешно и травми', '🩹 Кожа и обриви', '🌦️ Сезони и навън',
  '🚸 Безопасност', '💉 Ваксини', '💩 Коремчето', '🦷 Зъбки и уста', '⚠️ Алергии'];
const RAZDELI_IDX = new Set(idx.items.filter(i => i.r === 'Здраве и SOS').map(i => i.c));
const STAI = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm)\b/i;
const OBSHTI = new Set(['сън', 'температура', 'кашлица', 'ваксина', 'ваксини', 'зъби', 'на колко месеца', 'готово ли е', 'ясла', 'градина', 'бебе', 'дете']);
const greshki = [];
const g = (id, m) => greshki.push(id + ' · ' + m);
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;

// ── карти ──
const vidKl = new Map();
for (const k of K) {
  const id = k.id;
  if (!/^zn1c-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
  if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
  if (!STAI.includes(k.room)) g(id, 'непозната стая ' + k.room);
  for (const p of ['title', 'core', 'tip', 'follow']) {
    if (!k[p] || !String(k[p]).trim()) g(id, 'липсва ' + p);
    if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
    if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
    if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
    if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
  }
  const dc = dumi(k.core);
  if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
  if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
  if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
  if (!Array.isArray(k.keys) || k.keys.length < 12) g(id, 'ключове ' + (k.keys || []).length + ' (под 12)');
  for (const kl of k.keys || []) {
    if (kl !== kl.toLowerCase()) g(id, 'главна буква в ключ: ' + kl);
    if (/["']/.test(kl)) g(id, 'права кавичка в ключ: ' + kl);
    const n = dumi(kl);
    if (n < 2 || n > 6) g(id, 'ключ с ' + n + ' думи: ' + kl);
    if (OBSHTI.has(kl)) g(id, 'гола обща дума: ' + kl);
    if (vidKl.has(kl)) g(id, 'ключът е и в ' + vidKl.get(kl) + ': ' + kl);
    vidKl.set(kl, id);
  }
  const lat = (k.keys || []).filter(x => /^[a-z0-9 ]+$/.test(x)).length;
  if (lat < 2 || lat > 3) g(id, 'латински ключове: ' + lat + ' (2–3)');
  if (!Array.isArray(k.chips) || k.chips.length < 1 || k.chips.length > 3) g(id, 'чипове: ' + (k.chips || []).length);
  for (const c of k.chips || []) if (brojId(c) !== 1) g(id, 'чип не е точно една съществуваща карта: ' + c);
  if (k['от'] != null && k['до'] != null && k['от'] > k['до']) g(id, 'от > до');
}

// ── статии ──
const vidS = new Set();
for (const s of S) {
  const id = s.karta;
  const k = K.find(x => x.id === id);
  if (!k) { g(id, 'статия без карта в стажа'); continue; }
  if (vidS.has(id)) g(id, 'втора статия за същата карта');
  vidS.add(id);
  for (const p of ['karta', 't', 'e', 's', 'k', 'c', 'body']) if (!s[p] || !String(s[p]).trim()) g(id, 'статия: липсва ' + p);
  const body = String(s.body);
  const n = dumi(body);
  if (n < 260 || n > 600) g(id, 'тяло ' + n + ' думи (260–600)');
  if (!/^## /.test(body)) g(id, 'тялото не започва с „## “');
  const razd = (body.match(/^## .+$/gm) || []).length;
  if (razd < 3) g(id, 'раздели: ' + razd);
  if (/\r/.test(body)) g(id, '\\r в тялото');
  const tekst = [s.t, s.s, s.k, body].join('\n');
  if (/["']/.test(tekst)) g(id, 'права кавичка в статията');
  if (DOZA.test(tekst)) g(id, 'ДОЗА в статията');
  if (OBESHT.test(tekst)) g(id, 'обещание в статията');
  if (LAT.test(tekst)) g(id, 'латинска мярка в статията');
  const losh = body.split('\n').find(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
  if (losh) g(id, 'ред с 🚨 не започва с 🚨: ' + losh.slice(0, 60));
  if (!RAZDELI_DOGOVOR.includes(s.c)) g(id, 'разделът не е от договора: ' + s.c);
  if (!RAZDELI_IDX.has(s.c)) g(id, 'разделът го няма в lib/index.json: ' + s.c);
  if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
  if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
  const posl = body.trim().split('\n').pop().trim();
  if (posl !== 'Записките не заменят преглед.') g(id, 'последният ред не е „Записките не заменят преглед.“');
  if ([...String(s.e)].length > 3) g(id, 'e не е едно емоджи: ' + s.e);
}
for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');

console.log('карти: ' + K.length + ' · статии: ' + S.length);
for (const s of S) console.log('  ' + s.karta.padEnd(30) + dumi(s.body) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length);
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
