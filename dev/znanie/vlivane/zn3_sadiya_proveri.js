// Съдията zn3 · проверител на картите и статиите по договора dev/znanie/AGENT_VLIVANE.md
// (пригоден от zn1d_sadiya_proveri.js: стаята е Инструменти; „Записките не заменят преглед.“ се иска от здравните статии).
// node dev/znanie/vlivane/zn3_sadiya_proveri.js              (само чете; изход 0 = чисто, 1 = има грешки)
// node dev/znanie/vlivane/zn3_sadiya_proveri.js --primamki   (самопроверка: вкарва грешки в копие и брои хванатите)
const fs = require('fs');
const K0 = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn3.json', 'utf8'));
const S0 = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn3.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const RAZDELI_DOGOVOR = {
  'Инструменти': ['💰 Помощи и НОИ', '⚖️ Права и закрила', '📄 Документи, ясли и кухни', '🚗 Продукти и безопасност', '🧳 Пътуване', '📎 Още'],
};
// Здравните статии (изследвания, ваксини, психично здраве) — последен ред „Записките не заменят преглед.“
const ZDRAVNI = new Set(['zn3-izsledvania-priem', 'zn3-otsastvie-izsledvania', 'zn3-linii-chuzhbina']);
const RAZDELI_IDX = {};
for (const i of idx.items) (RAZDELI_IDX[i.r] = RAZDELI_IDX[i.r] || new Set()).add(i.c);
const STAI = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm|g)\b/i;
const GRAM_G = /\d\s+г(?=[\s,;]|$)/;   // „2000 г“ — грамове или година? годините са с „г.“
// Сумите за 2026, които са сверени в присъдите (02 В1–В12, 03 В1–В13, 04 39·, 43·, 44·, 46·, 47·9) — всяко друго евро число се вади за поглед
const SVERENI = new Set(['398,81', '199', '199,40', '620,20', '2 111,64', '2 300', '115,04', '191,74', '460,17', '230,09', '153,39', '613,55',
  '1 472,52', '736,26', '25,57', '56,25', '84,37', '89,48', '10,23', '38,35', '102,26', '415', '415,01', '466', '230,09', '603,33',
  '3 067,75', '306,78', '6 135,50', '613,55', '9 203,25', '920,33', '155', '155,05', '51,13', '13', '300', '1 800', '1 200', '1 000', '259',
  '26', '77', '256', '399', '780', '900']);
const OBSHTI = new Set(['майчинство', 'помощи', 'отпуск', 'издръжка', 'ясла', 'градина', 'детски', 'нои', 'столче', 'празници', 'бебе', 'дете',
  'на колко месеца', 'готово ли е', 'втората година', 'майчинство 2026', 'помощи 2026']);

function proveri(K, S) {
  const greshki = [];
  const g = (id, m) => greshki.push(id + ' · ' + m);
  const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;
  const svoi = new Set(K.map(k => k.id));
  const vidKl = new Map();
  for (const k of K) {
    const id = k.id;
    if (!/^zn3-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
    if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
    if (!STAI.includes(k.room)) g(id, 'непозната стая ' + k.room);
    if (k.room !== 'Инструменти') g(id, 'стаята не е Инструменти: ' + k.room);
    for (const p of ['title', 'core', 'tip', 'follow']) {
      if (!k[p] || !String(k[p]).trim()) { g(id, 'липсва ' + p); continue; }
      if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
      if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
      if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
      if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
      if (GRAM_G.test(k[p])) g(id, 'двусмислено „г“ до число в ' + p);
    }
    const dc = dumi(k.core);
    if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
    if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
    if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
    if (String(k.follow).startsWith('🚨') && !/112|спешн|веднага/.test(String(k.follow).split(/(?<=[.!?])\s/)[0])) g(id, '🚨 без 112 или „спешно/веднага“ в първото изречение');
    if (!Array.isArray(k.keys) || k.keys.length < 12) g(id, 'ключове ' + (k.keys || []).length + ' (под 12)');
    for (const kl of k.keys || []) {
      if (kl !== kl.toLowerCase()) g(id, 'главна буква в ключ: ' + kl);
      if (/["']/.test(kl)) g(id, 'права кавичка в ключ: ' + kl);
      const n = dumi(kl);
      if (n < 2 || n > 6) g(id, 'ключ с ' + n + ' думи: ' + kl);
      if (OBSHTI.has(kl)) g(id, 'гола обща дума: ' + kl);
      if (vidKl.has(kl)) g(id, 'ключът е и в ' + vidKl.get(kl) + ': ' + kl);
      vidKl.set(kl, id);
      if (kb.includes(Q + kl + Q) || kb.includes(DQ + kl + DQ)) g(id, 'ключът вече е в js/kb.js: ' + kl);
    }
    const lat = (k.keys || []).filter(x => /^[a-z0-9 ]+$/.test(x)).length;
    if (lat < 2 || lat > 3) g(id, 'латински ключове: ' + lat + ' (2–3)');
    if (!Array.isArray(k.chips) || k.chips.length < 1 || k.chips.length > 3) g(id, 'чипове: ' + (k.chips || []).length);
    for (const c of k.chips || []) {
      if (c === id) g(id, 'чип към себе си');
      else if (!(brojId(c) === 1 || (svoi.has(c) && brojId(c) === 0))) g(id, 'чип не е съществуваща карта (kb.js или сестра в стажа): ' + c);
    }
    if (k['от'] != null && k['до'] != null && k['от'] > k['до']) g(id, 'от > до');
    if ((k['от'] != null) !== (k['до'] != null)) g(id, 'само едното от „от“/„до“');
  }
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
    if (GRAM_G.test(tekst)) g(id, 'двусмислено „г“ до число в статията');
    const losh = body.split('\n').find(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
    if (losh) g(id, 'ред с 🚨 не започва с 🚨: ' + losh.slice(0, 60));
    const dog = RAZDELI_DOGOVOR[k.room] || [];
    if (!dog.includes(s.c)) g(id, 'разделът не е от договора за стая ' + k.room + ': ' + s.c);
    if (!(RAZDELI_IDX[k.room] && RAZDELI_IDX[k.room].has(s.c))) g(id, 'разделът го няма в lib/index.json за стая ' + k.room + ': ' + s.c);
    if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
    if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
    const posl = body.trim().split('\n').pop().trim();
    if (ZDRAVNI.has(id) && posl !== 'Записките не заменят преглед.') g(id, 'здравна статия: последният ред не е „Записките не заменят преглед.“');
    const grafemi = [...new Intl.Segmenter('bg', { granularity: 'grapheme' }).segment(String(s.e))].length;   // 👨‍👩‍👧 е една графема
    if (grafemi !== 1) g(id, 'e не е едно емоджи: ' + s.e);
    if (body.includes('🚨') && body.indexOf('🚨') > body.length * 0.5 && ZDRAVNI.has(id)) g(id, '🚨 е в долната половина на здравна статия');
  }
  for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');
  return greshki;
}

// Сумите в евро, които НЕ са сред сверените — само за поглед (не са грешка сами по себе си)
function evroZaPogled(K, S) {
  const out = [];
  const re = /(\d[\d ]*(?:,\d+)?)\s*(?:евро|€)/g;
  for (const k of K) for (const p of ['core', 'tip', 'follow']) for (const m of String(k[p]).matchAll(re)) if (!SVERENI.has(m[1].trim())) out.push(k.id + ' К.' + p + ': ' + m[0]);
  for (const s of S) for (const m of String(s.body + ' ' + s.s).matchAll(re)) if (!SVERENI.has(m[1].trim())) out.push(s.karta + ' С: ' + m[0]);
  return out;
}

if (process.argv.includes('--primamki')) {
  const K = JSON.parse(JSON.stringify(K0)), S = JSON.parse(JSON.stringify(S0));
  K[0].core += ' Дай 5 мл сироп.';                                   // доза
  K[1].follow = 'Иди в НОИ. 🚨 Ако не диша — 112.';                  // 🚨 не отпред
  K[2].keys.push('Главна Буква');                                     // главна буква
  K[3].keys.push('майчинство');                                       // 1 дума + гола обща дума
  K[4].chips = ['nyama-takava-karta-xyz'];                            // чип в нищото
  K[5].tip = 'Пробвай ' + DQ + 'така' + DQ + '.';                     // права кавичка + без 💡
  K[6].keys.push(K[7].keys[0]);                                       // ключ в две карти
  S[0].body = S[0].body.replace(/^## /, 'Увод. ## ');                  // не започва с „## “
  S[1].c = '🦄 Несъществуващ';                                         // раздел
  S[17].body = S[17].body.replace('Записките не заменят преглед.', 'Край.'); // здравна статия без последния ред
  S[3].t = K[3].title;                                                // заглавие = карта
  S[4].s = 'а'.repeat(201);                                           // дълго резюме
  S[5].body += '\nВажно: 🚨 звънни.';                                  // 🚨 по средата на ред
  const gr = proveri(K, S);
  console.log('примамки: 13 вкарани → ' + gr.length + ' червени реда');
  for (const x of gr) console.log('  ' + x);
  process.exit(0);
}

const greshki = proveri(K0, S0);
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
console.log('карти: ' + K0.length + ' · статии: ' + S0.length);
for (const s of S0) {
  const k = K0.find(x => x.id === s.karta) || {};
  console.log('  ' + s.karta.padEnd(30) + ' core ' + String(dumi(k.core || '')).padStart(3) + ' · тяло ' + dumi(s.body) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length + ' · ключове ' + (k.keys || []).length + ' · ' + s.c);
}
const ev = evroZaPogled(K0, S0);
if (ev.length) { console.log('ℹ️ евро числа извън сверения списък (за поглед): ' + ev.length); for (const x of ev) console.log('  ' + x); }
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
