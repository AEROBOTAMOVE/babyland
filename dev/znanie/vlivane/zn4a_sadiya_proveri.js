// Съдията zn4a · проверител на картите и статиите по договора dev/znanie/AGENT_VLIVANE.md
// (пригоден от zn1d_sadiya_proveri.js: една стая — Захранване; + ключовете за живи карти от zn4a_klyuchove.json; + правилата за ядки и мед от поръчката).
// node dev/znanie/vlivane/zn4a_sadiya_proveri.js   (само чете; изход 0 = чисто, 1 = има грешки)
// node dev/znanie/vlivane/zn4a_sadiya_proveri.js --primamki   (самопроверка: вкарва грешки в копие и брои хванатите)
const fs = require('fs');
const K0 = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn4a.json', 'utf8'));
const S0 = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn4a.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const RAZDELI_DOGOVOR = {
  'Захранване': ['🥄 Първите лъжички', '🥦 Какво влиза в чинията', '🍽️ На масата', '🥤 Пиене', '⚠️ Безопасност и алергени', '🩺 Когато нещо не е наред'],
};
const RAZDELI_IDX = {};
for (const i of idx.items) (RAZDELI_IDX[i.r] = RAZDELI_IDX[i.r] || new Set()).add(i.c);
const STAI = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm|g)\b/i;
const GRAM_G = /\d\s+г(?=[\s,;]|$)/;   // „2000 г“ — грамове или година? пиши „грама“ (годините са с „г.“ — с точка)
const OBSHTI = new Set(['сън', 'температура', 'кашлица', 'ваксина', 'ваксини', 'зъби', 'на колко месеца', 'готово ли е', 'ясла', 'градина', 'бебе', 'дете', 'болница', 'кърлеж', 'змия', 'гъби', 'захранване', 'мед', 'сол', 'захар', 'боб', 'яйце', 'риба', 'каша', 'мляко', 'пюре', 'сирене', 'хляб']);
// поръчката: цели ядки — не до 5 г. (01 №15, NHS); мед — само „до (навършена) година“, никога по-малко
const YADKI_45 = /(цели|цяла|цял)\s+(ядки|фъстъци|фъстък|орехи)[^.]{0,40}4\s*[–-]\s*5/i;
const MED_RANO = /мед[^.]{0,60}(от|след)\s+([1-9]|1[01])\s*(-?ия|-и)?\s*месец/i;
const VODA_RANO = /вода[^.]{0,50}(под|преди|до)\s+6\s+месеца[^.]{0,30}(може|давай|дай)/i;

function proveri(K, S) {
  const greshki = [];
  const g = (id, m) => greshki.push(id + ' · ' + m);
  const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;
  const svoi = new Set(K.map(k => k.id));
  const vidKl = new Map();
  for (const k of K) {
    const id = k.id;
    if (!/^zn4a-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
    if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
    if (!STAI.includes(k.room)) g(id, 'непозната стая ' + k.room);
    for (const p of ['title', 'core', 'tip', 'follow']) {
      if (!k[p] || !String(k[p]).trim()) { g(id, 'липсва ' + p); continue; }
      if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
      if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
      if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
      if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
      if (GRAM_G.test(k[p])) g(id, 'двусмислено „г“ до число в ' + p);
      if (YADKI_45.test(k[p])) g(id, 'цели ядки „4–5 г.“ — поръчката: до 5 г. в ' + p);
      if (MED_RANO.test(k[p])) g(id, 'мед преди годината в ' + p);
      if (VODA_RANO.test(k[p])) g(id, 'вода под 6 м. в ' + p);
    }
    const dc = dumi(k.core);
    if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
    if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
    if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
    if (String(k.follow).startsWith('🚨') && !/112|спешн|веднага|още днес|същия ден|сестрата/.test(String(k.follow).split(/(?<=[.!?])\s/)[0])) g(id, '🚨 без 112 или „спешно/веднага“ в първото изречение');
    if (!Array.isArray(k.keys) || k.keys.length < 12) g(id, 'ключове ' + (k.keys || []).length + ' (под 12)');
    for (const kl of k.keys || []) {
      if (kl !== kl.toLowerCase()) g(id, 'главна буква в ключ: ' + kl);
      if (/["']/.test(kl)) g(id, 'права кавичка в ключ: ' + kl);
      const n = dumi(kl);
      if (n < 2 || n > 6) g(id, 'ключ с ' + n + ' думи: ' + kl);
      if (OBSHTI.has(kl)) g(id, 'гола обща дума: ' + kl);
      if (vidKl.has(kl)) g(id, 'ключът е и в ' + vidKl.get(kl) + ': ' + kl);
      vidKl.set(kl, id);
      if (kb.includes(Q + kl + Q)) g(id, 'ключът вече е в js/kb.js: ' + kl);
    }
    const lat = (k.keys || []).filter(x => /^[a-z0-9 ]+$/.test(x)).length;
    if (lat < 2 || lat > 3) g(id, 'латински ключове: ' + lat + ' (2–3)');
    if (!Array.isArray(k.chips) || k.chips.length < 1 || k.chips.length > 3) g(id, 'чипове: ' + (k.chips || []).length);
    for (const c of k.chips || []) {
      if (c === id) g(id, 'чип към себе си');
      else if (!(brojId(c) === 1 || (svoi.has(c) && brojId(c) === 0))) g(id, 'чип не е съществуваща карта (kb.js или сестра в стажа): ' + c);
    }
    if (k['от'] != null && k['до'] != null && k['от'] > k['до']) g(id, 'от > до');
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
    if (YADKI_45.test(tekst)) g(id, 'цели ядки „4–5 г.“ в статията — поръчката: до 5 г.');
    if (MED_RANO.test(tekst)) g(id, 'мед преди годината в статията');
    if (VODA_RANO.test(tekst)) g(id, 'вода под 6 м. в статията');
    if (!/^## /.test(body.split('\n').filter(l => l.trim())[0] || '')) g(id, 'първият непразен ред не е „## “');
    const losh = body.split('\n').find(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
    if (losh) g(id, 'ред с 🚨 не започва с 🚨: ' + losh.slice(0, 60));
    const dog = RAZDELI_DOGOVOR[k.room] || [];
    if (!dog.includes(s.c)) g(id, 'разделът не е от договора за стая ' + k.room + ': ' + s.c);
    if (!(RAZDELI_IDX[k.room] && RAZDELI_IDX[k.room].has(s.c))) g(id, 'разделът го няма в lib/index.json за стая ' + k.room + ': ' + s.c);
    if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
    if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
    const posl = body.trim().split('\n').pop().trim();
    if (posl !== 'Записките не заменят преглед.') g(id, 'последният ред не е „Записките не заменят преглед.“');
    if ([...String(s.e)].length > 3) g(id, 'e не е едно емоджи: ' + s.e);
  }
  for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');
  // ключовете за ЖИВИ карти (zn4a_klyuchove.json): картата съществува, ключът е по правилата и още не е нито в kb.js, нито в стажа
  let KL = {}; try { KL = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn4a_klyuchove.json', 'utf8')); } catch (e) { g('zn4a_klyuchove.json', 'не се парсва: ' + e.message); }
  const vidKL = new Set();
  for (const [kid, kls] of Object.entries(KL)) {
    if (brojId(kid) !== 1) g('ключове → ' + kid, 'няма такава жива карта в js/kb.js');
    for (const kl of kls) {
      if (kl !== kl.toLowerCase()) g('ключове → ' + kid, 'главна буква: ' + kl);
      if (/["']/.test(kl)) g('ключове → ' + kid, 'права кавичка: ' + kl);
      const n = dumi(kl); if (n < 2 || n > 6) g('ключове → ' + kid, n + ' думи: ' + kl);
      if (OBSHTI.has(kl)) g('ключове → ' + kid, 'гола обща дума: ' + kl);
      if (kb.includes(Q + kl + Q)) g('ключове → ' + kid, 'вече е в js/kb.js: ' + kl);
      if (vidKl.has(kl)) g('ключове → ' + kid, 'ключът е и в новата карта ' + vidKl.get(kl) + ': ' + kl);
      if (vidKL.has(kl)) g('ключове → ' + kid, 'повторен ключ: ' + kl);
      vidKL.add(kl);
    }
  }
  return greshki;
}

if (process.argv.includes('--primamki')) {
  const K = JSON.parse(JSON.stringify(K0)), S = JSON.parse(JSON.stringify(S0));
  K[0].core += ' Дай 5 мл сироп.';                                  // доза
  K[1].follow = 'Иди на лекар. 🚨 Ако не диша — 112.';               // 🚨 не отпред
  K[2].keys.push('Главна Буква');                                    // главна буква
  K[3].keys.push('ечемик');                                          // 1 дума
  K[4].chips = ['nyama-takava-karta-xyz'];                           // чип в нищото
  K[5].tip = 'Пробвай ' + DQ + 'така' + DQ + '.';                    // права кавичка + без 💡
  K[22].core += ' Тежи 300 г вечер.';                                // двусмислено „г“
  K[6].tip += ' Цели ядки не преди около 4–5 години.';               // ядки 4–5 (поръчката: 5)
  K[7].core += ' Мед може от 9 месеца.';                             // мед преди годината
  S[0].body = S[0].body.replace('Записките не заменят преглед.', 'Край.'); // последен ред
  S[1].c = '🦄 Несъществуващ';                                        // раздел
  S[2].body = S[2].body.replace(/\n🚨/, '\nВажно: 🚨');               // 🚨 по средата на ред
  S[3].t = K[3].title;                                               // заглавие = карта
  S[4].s = 'а'.repeat(201);                                          // дълго резюме
  const gr = proveri(K, S);
  console.log('примамки: 15 вкарани → ' + gr.length + ' червени реда');
  for (const x of gr) console.log('  ' + x);
  process.exit(0);
}

const greshki = proveri(K0, S0);
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
console.log('карти: ' + K0.length + ' · статии: ' + S0.length);
for (const s of S0) {
  const k = K0.find(x => x.id === s.karta) || {};
  console.log('  ' + s.karta.padEnd(28) + ' core ' + String(dumi(k.core || '')).padStart(3) + ' · тяло ' + dumi(s.body) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length + ' · ключове ' + (k.keys || []).length);
}
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
