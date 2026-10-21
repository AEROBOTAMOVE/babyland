// Съдията zn1b · проверител на статиите и картите по договора dev/znanie/AGENT_VLIVANE.md
// (копие на zn1c_proveri_statii.js, пригодено за две стаи и за сън/прегледи).
// node dev/znanie/vlivane/zn1b_sadiya_proveri.js   (само чете; изход 0 = чисто, 1 = има грешки)
// node dev/znanie/vlivane/zn1b_sadiya_proveri.js --karti=ФАЙЛ --statii=ФАЙЛ   (за самопроверка с примамки)
const fs = require('fs');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const K = JSON.parse(fs.readFileSync(arg('karti') || 'dev/nahodki/karti_zn1b.json', 'utf8'));
const S = JSON.parse(fs.readFileSync(arg('statii') || 'dev/nahodki/statii_zn1b.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const RAZDELI_DOGOVOR = {
  'Моето бебе': ['🐣 Новородено', '🤱 Кърмене', '🍼 Шише и изцеждане', '😴 Сън', '🧴 Грижи', '📏 Растеж', '👶 Недоносено бебе и НИКУ', '👯 Близнаци', '🎉 Празници'],
  'Здраве и SOS': ['🌡️ Температура и инфекции', '🚨 Спешно и травми', '🩹 Кожа и обриви', '🌦️ Сезони и навън', '🚸 Безопасност', '💉 Ваксини', '💩 Коремчето', '🦷 Зъбки и уста', '⚠️ Алергии']
};
const RAZDELI_IDX = {};
for (const i of idx.items) (RAZDELI_IDX[i.r] = RAZDELI_IDX[i.r] || new Set()).add(i.c);
const STAI = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const NE_ZDRAVNI = new Set(['zn1b-banya-razbuzhda', 'zn1b-prispivni-bg']);   // ритуал и песни — не са здравни
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm)\b/i;
const OBSHTI = new Set(['сън', 'спи ли', 'бебето спи', 'режим', 'дрямка', 'дрямки', 'на колко месеца', 'готово ли е', '6 месеца',
  'преглед', 'прегледи', 'баня', 'люлеене', 'перцентил', 'паста', 'тегло', 'бебе', 'дете', 'ваксини', 'като пружина', 'къпя го вечер']);
const TRYABVA = /(^|[^а-я])(трябва|длъжна|задължително)([^а-я]|$)/i;
const greshki = [], vnimanie = [];
const g = (id, m) => greshki.push(id + ' · ' + m);
const v = (id, m) => vnimanie.push(id + ' · ' + m);
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;
const ids = new Set(K.map(k => k.id));

// ── карти ──
const vidKl = new Map();
for (const k of K) {
  const id = k.id;
  if (!/^zn1b-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
  if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
  if (!STAI.includes(k.room)) g(id, 'непозната стая ' + k.room);
  for (const p of ['title', 'core', 'tip', 'follow']) {
    if (!k[p] || !String(k[p]).trim()) g(id, 'липсва ' + p);
    if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
    if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
    if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
    if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
    if (/\r/.test(k[p])) g(id, '\\r в ' + p);
    const mt = String(k[p]).match(TRYABVA);
    if (mt) v(id, '„трябва/длъжна/задължително“ в ' + p + ': …' + String(k[p]).slice(Math.max(0, mt.index - 40), mt.index + 40) + '…');
  }
  const dc = dumi(k.core);
  if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
  if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
  if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
  if (String(k.follow).startsWith('🚨') && !/112/.test(k.follow)) v(id, 'follow с 🚨 без 112');
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
  for (const c of k.chips || []) {
    if (c === id) g(id, 'чип към себе си');
    else if (c.startsWith('zn1b-')) { if (!ids.has(c)) g(id, 'чип към сестринска карта, която я няма в стажа: ' + c); }
    else if (brojId(c) !== 1) g(id, 'чип не е точно една съществуваща карта: ' + c);
  }
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
  for (const l of body.split('\n').filter(l => /^\s*(?:[-*]\s*)?🚨/.test(l))) if (!/112/.test(l)) v(id, 'ред с 🚨 без 112: ' + l.slice(0, 70));
  const dog = RAZDELI_DOGOVOR[k.room] || [];
  if (!dog.includes(s.c)) g(id, 'разделът не е от договора за ' + k.room + ': ' + s.c);
  if (!(RAZDELI_IDX[k.room] && RAZDELI_IDX[k.room].has(s.c))) g(id, 'разделът го няма в lib/index.json: ' + s.c);
  if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
  if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
  const posl = body.trim().split('\n').pop().trim();
  if (!NE_ZDRAVNI.has(id) && posl !== 'Записките не заменят преглед.') g(id, 'последният ред не е „Записките не заменят преглед.“');
  if ([...String(s.e)].length > 3) g(id, 'e не е едно емоджи: ' + s.e);
  if (TRYABVA.test(body)) v(id, '„трябва/длъжна/задължително“ в тялото (' + (body.match(new RegExp(TRYABVA.source, 'gi')) || []).length + ')');
}
for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');

console.log('карти: ' + K.length + ' · статии: ' + S.length);
for (const s of S) console.log('  ' + s.karta.padEnd(30) + String(dumi(s.body)).padStart(4) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length + ' · core ' + dumi((K.find(x => x.id === s.karta) || {}).core || ''));
if (vnimanie.length) { console.log('🟡 ЗА ПРЕГЛЕД (не са грешки): ' + vnimanie.length); for (const x of vnimanie) console.log('  ' + x); }
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
