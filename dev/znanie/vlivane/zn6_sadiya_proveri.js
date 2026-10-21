// Съдията zn6 · проверител на картите и статиите по договора dev/znanie/AGENT_VLIVANE.md
// (пригоден от zn1d_sadiya_proveri.js: четири стаи — Моето бебе, Развитие и игри, Жената в мен, Лабораторията;
//  + цитат до 15 думи, „само за забавление“ в звездите, присъда с белег в Лабораторията; чип към сестра в стажа е позволен, както в гейта).
// node dev/znanie/vlivane/zn6_sadiya_proveri.js              (само чете; изход 0 = чисто, 1 = има грешки)
// node dev/znanie/vlivane/zn6_sadiya_proveri.js --primamki   (самопроверка: вкарва грешки в копие и брои хванатите)
const fs = require('fs');
const K0 = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn6.json', 'utf8'));
const S0 = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn6.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const RAZDELI_DOGOVOR = {
  'Моето бебе': ['🐣 Новородено', '🤱 Кърмене', '🍼 Шише и изцеждане', '😴 Сън', '🧴 Грижи', '📏 Растеж',
    '👶 Недоносено бебе и НИКУ', '👯 Близнаци', '🎉 Празници'],
  'Развитие и игри': ['🎲 Игра и учене', '🧺 Игри с това, което имаш', '🗣️ Говор', '🤸 Движение', '😤 Поведение',
    '📅 Месец по месец', '🎵 Музика и книжки', '👀 Тревоги', '🎒 Ясла и раздяла', '🚽 Гърне', '📱 Екрани', '🎉 Празници'],
  'Жената в мен': ['🪞 Тялото ми', '💜 Главата ми', '💗 Двамата', '👭 Хората около мен', '💼 Работа и пари', '🕯️ Аз, освен майка'],
  'Лабораторията': ['🔬 Лабораторията'],
};
const RAZDELI_IDX = {};
for (const i of idx.items) (RAZDELI_IDX[i.r] = RAZDELI_IDX[i.r] || new Set()).add(i.c);
const STAI = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm|g)\b/i;
const GRAM_G = /\d\s+г(?=[\s,;]|$)/;   // „2000 г“ — грамове или година? годините са с „г.“
const OBSHTI = new Set(['бабинден', 'кукери', 'уроки', 'зодия', 'хороскоп', 'пълнолуние', 'затъмнение', 'имен ден', 'кръщене',
  'гатанки', 'легенда', 'приказка', 'ценности', 'еньовден', 'лазаровден', 'цветница', 'амулет', 'благодаря', 'на колко месеца', 'готово ли е', 'бебе', 'дете']);
const VERDIKT = /🟡|⚠️|❌|✅/;

function proveri(K, S) {
  const greshki = [], zaChetene = [];
  const g = (id, m) => greshki.push(id + ' · ' + m);
  const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;
  const svoi = new Set(K.map(k => k.id));
  const vidKl = new Map();
  const tsitati = (id, t, kade) => {           // всеки текст в „…“ над 15 думи → ЗА ЧЕТЕНЕ (чужд цитат ли е, или наше предложено изречение — решава човек)
    for (const m of String(t).matchAll(/„([^“]*)“/g)) if (dumi(m[1]) > 15) zaChetene.push(id + ' · цитат над 15 думи в ' + kade + ': „' + m[1].slice(0, 50) + '…“');
  };
  for (const k of K) {
    const id = k.id;
    if (!/^zn6-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
    if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
    if (!STAI.includes(k.room)) g(id, 'непозната стая ' + k.room);
    for (const p of ['title', 'core', 'tip', 'follow']) {
      if (!k[p] || !String(k[p]).trim()) { g(id, 'липсва ' + p); continue; }
      if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
      if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
      if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
      if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
      if (GRAM_G.test(k[p])) g(id, 'двусмислено „г“ до число в ' + p);
      tsitati(id, k[p], p);
    }
    const dc = dumi(k.core);
    if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
    if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
    if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
    if (String(k.follow).startsWith('🚨') && !/112|спешн|веднага|още днес|същия ден/.test(String(k.follow).split(/(?<=[.!?])\s/)[0])) g(id, '🚨 без 112 или „спешно/веднага“ в първото изречение');
    if (k.room === 'Жената в мен' && !/само за забавление/i.test(k.core)) g(id, 'звезди/числа без „само за забавление“ в core');
    if (k.room === 'Лабораторията' && !(/^Присъдата/.test(k.core) && VERDIKT.test(k.core.split(/(?<=[.!?])\s/)[0]))) g(id, 'Лабораторията: core не започва с присъда с белег');
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
    if (k['от'] != null && k['от'] < -9) g(id, 'от под −9');
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
    tsitati(id, tekst, 'статията');
    const losh = body.split('\n').find(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
    if (losh) g(id, 'ред с 🚨 не започва с 🚨: ' + losh.slice(0, 60));
    const dog = RAZDELI_DOGOVOR[k.room] || [];
    if (!dog.includes(s.c)) g(id, 'разделът не е от договора за стая ' + k.room + ': ' + s.c);
    if (!(RAZDELI_IDX[k.room] && RAZDELI_IDX[k.room].has(s.c))) g(id, 'разделът го няма в lib/index.json за стая ' + k.room + ': ' + s.c);
    if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
    if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
    const posl = body.trim().split('\n').pop().trim();
    const zdrave = /🚨|112/.test(body) || k.room === 'Лабораторията';
    if (zdrave && posl !== 'Записките не заменят преглед.') g(id, 'здравна статия (🚨/112/Лабораторията) без последен ред „Записките не заменят преглед.“');
    if (k.room === 'Жената в мен' && !/само за забавление/i.test(body)) g(id, 'звезди/числа: статията без „само за забавление“');
    if (k.room === 'Лабораторията' && !/^## Присъдата/m.test(body)) g(id, 'Лабораторията: статията без раздел „Присъдата“');
    if ([...String(s.e)].length > 3) g(id, 'e не е едно емоджи: ' + s.e);
  }
  for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');
  return { greshki, zaChetene };
}

if (process.argv.includes('--primamki')) {
  const K = JSON.parse(JSON.stringify(K0)), S = JSON.parse(JSON.stringify(S0));
  const ix = id => K.findIndex(k => k.id === id), sx = id => S.findIndex(s => s.karta === id);
  K[0].core += ' Дай 5 мл сироп.';                                         // 1 доза
  K[1].follow = 'Иди на лекар. 🚨 Ако не диша — 112.';                      // 2 🚨 не отпред
  K[2].keys.push('Главна Буква');                                           // 3 главна буква
  K[3].keys.push('кукери');                                                 // 4 една дума (+ гола обща)
  K[4].chips = ['nyama-takava-karta-xyz'];                                  // 5 чип в нищото
  K[5].tip = 'Пробвай ' + DQ + 'така' + DQ + '.';                           // 6 права кавичка + без 💡
  K[ix('zn6-ogneniyat-kon')].core = K[ix('zn6-ogneniyat-kon')].core.replace('Само за забавление, казано честно: ', '');   // 7 без „само за забавление“
  K[ix('zn6-lab-uroki')].core = K[ix('zn6-lab-uroki')].core.replace(/^Присъдата: /, '');                               // 8 Лаб без присъда
  S[0].body = S[0].body.replace('## Двете дати', '„' + 'дума '.repeat(16).trim() + '“\n\n## Двете дати');               // 9 цитат 16 думи (+ не почва с ##)
  S[1].c = '🦄 Несъществуващ';                                               // 10 раздел
  S[sx('zn6-enyovden')].body = S[sx('zn6-enyovden')].body.replace(/\n- 🚨/, '\n- Важно: 🚨');                           // 11 🚨 по средата на ред
  S[3].t = K[3].title;                                                      // 12 заглавие = карта
  S[sx('zn6-lab-amuleti')].body = S[sx('zn6-lab-amuleti')].body.replace('Записките не заменят преглед.', 'Край.');       // 13 без последния ред
  S[4].s = 'а'.repeat(201);                                                 // 14 дълго резюме
  const { greshki: gr, zaChetene: zc } = proveri(K, S);
  console.log('примамки: 13 грешки + 1 цитат вкарани → ' + gr.length + ' червени реда, ' + zc.length + ' за четене');
  for (const x of gr) console.log('  🔴 ' + x);
  for (const x of zc) console.log('  🟡 ' + x);
  process.exit(0);
}

const { greshki, zaChetene } = proveri(K0, S0);
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;
console.log('карти: ' + K0.length + ' · статии: ' + S0.length);
for (const s of S0) {
  const k = K0.find(x => x.id === s.karta) || {};
  console.log('  ' + s.karta.padEnd(26) + ' core ' + String(dumi(k.core || '')).padStart(3) + ' · тяло ' + dumi(s.body) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length + ' · ключове ' + (k.keys || []).length);
}
if (zaChetene.length) { console.log('🟡 ЗА ЧЕТЕНЕ (не е отказ): ' + zaChetene.length); for (const x of zaChetene) console.log('  ' + x); }
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
