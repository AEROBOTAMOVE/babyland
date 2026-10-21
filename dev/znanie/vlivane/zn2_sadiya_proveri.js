// Съдията zn2 · проверител на статиите и картите по договора dev/znanie/AGENT_VLIVANE.md (по образеца zn1c_proveri_statii.js).
// node dev/znanie/vlivane/zn2_sadiya_proveri.js   (само чете; изход 0 = чисто, 1 = има грешки)
// node dev/znanie/vlivane/zn2_sadiya_proveri.js --primamki   (самопроверка: вкарва грешки в копие в паметта и брои хванатите)
const fs = require('fs');
const K0 = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn2.json', 'utf8'));
const S0 = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn2.json', 'utf8'));
const kb = fs.readFileSync('js/kb.js', 'utf8');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const Q = String.fromCharCode(39), DQ = String.fromCharCode(34);
const STAQ = 'Бременност';
const RAZDELI_DOGOVOR = ['🗓️ Триместри и прегледи', '👶 Раждането', '🚨 Тревожни сигнали', '🥗 Хранене и лекарства', '🏥 Родилното и първите дни'];
const RAZDELI_IDX = new Set(idx.items.filter(i => i.r === STAQ).map(i => i.c));
const NE_ZDRAVNI = new Set(['zn2-maychinstvo-bremenna', 'zn2-dokumenti-rodilno', 'zn2-chanta-tatko']);   // пари/документи/чанта — без „Записките…“
const DOZA = /\d+\s*(мг|мл|mg|ml|мкг|µg|милиграм|милилитр)/i;
const OBESHT = /(гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск|спасително средство)/i;
const LAT = /\d\s*(ml|mg|kg|cm)\b/i;
const NAD35 = /над 35(?! години се добавят)/;   // присъда 03 Б9: „от 35“; „над 35 години“ остава само за пакета на НЗОК (01 №11)
const OBSHTI = new Set(['бременна', 'бременност', 'на колко месеца', 'готово ли е', 'колко кафета', 'кафета на ден', 'колко риба', 'втора черта', 'партньорът помага', 'избера болница']);
const brojId = id => kb.split('id: ' + Q + id + Q).length - 1 + kb.split('id: ' + DQ + id + DQ).length - 1;
const dumi = t => String(t).trim().split(/\s+/).filter(Boolean).length;

function proveri(K, S) {
  const greshki = [], g = (id, m) => greshki.push(id + ' · ' + m);
  const nashi = new Set(K.map(k => k.id));
  const vidKl = new Map();
  for (const k of K) {
    const id = k.id;
    if (!/^zn2-[a-z0-9-]{3,40}$/.test(id)) g(id, 'id не е латиница-кебаб');
    if (brojId(id) !== 0) g(id, 'id вече е в js/kb.js');
    if (k.room !== STAQ) g(id, 'стаята не е ' + STAQ + ': ' + k.room);
    for (const p of ['title', 'core', 'tip', 'follow']) {
      if (!k[p] || !String(k[p]).trim()) { g(id, 'липсва ' + p); continue; }
      if (/["']/.test(k[p])) g(id, 'права кавичка в ' + p);
      if (DOZA.test(k[p])) g(id, 'ДОЗА в ' + p);
      if (OBESHT.test(k[p])) g(id, 'обещание в ' + p);
      if (LAT.test(k[p])) g(id, 'латинска мярка в ' + p);
      if (NAD35.test(k[p])) g(id, '„над 35“ в ' + p + ' (присъда Б9: от 35)');
      if (/\r/.test(k[p])) g(id, '\\r в ' + p);
    }
    const dc = dumi(k.core);
    if (dc < 60 || dc > 150) g(id, 'core е ' + dc + ' думи (60–150)');
    if (!String(k.tip).startsWith('💡')) g(id, 'tip не започва с 💡');
    if (String(k.follow).includes('🚨') && !String(k.follow).startsWith('🚨')) g(id, '🚨 не е най-отпред във follow');
    if (String(k.follow).startsWith('🚨') && !String(k.follow).includes('112')) g(id, '🚨 без 112 във follow');
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
    let vKb = 0;
    for (const c of k.chips || []) {
      if (c === id) g(id, 'чип към себе си');
      else if (brojId(c) === 1) vKb++;
      else if (!nashi.has(c)) g(id, 'чип нито в kb.js, нито сестринска приета карта: ' + c);
    }
    if (vKb < 1) g(id, 'нито един чип към карта, която ВЕЧЕ е в kb.js');
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
    if (/\n\n\n/.test(body)) g(id, 'празни редове една след друга');
    if (/^## [^\n]*\n\n## /m.test(body)) g(id, 'празен раздел');
    const tekst = [s.t, s.s, s.k, body].join('\n');
    if (/["']/.test(tekst)) g(id, 'права кавичка в статията');
    if (DOZA.test(tekst)) g(id, 'ДОЗА в статията');
    if (OBESHT.test(tekst)) g(id, 'обещание в статията');
    if (LAT.test(tekst)) g(id, 'латинска мярка в статията');
    if (NAD35.test(tekst)) g(id, '„над 35“ в статията (присъда Б9: от 35)');
    const losh = body.split('\n').find(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
    if (losh) g(id, 'ред с 🚨 не започва с 🚨: ' + losh.slice(0, 60));
    const bez112 = body.split('\n').find(l => /^\s*(?:[-*]\s*)?🚨/.test(l) && !l.includes('112'));
    if (bez112) g(id, 'ред с 🚨 без 112: ' + bez112.slice(0, 60));
    if (!RAZDELI_DOGOVOR.includes(s.c)) g(id, 'разделът не е от договора: ' + s.c);
    if (!RAZDELI_IDX.has(s.c)) g(id, 'разделът го няма в lib/index.json: ' + s.c);
    if (String(s.s).length > 200) g(id, 'резюме ' + String(s.s).length + ' знака');
    if (String(s.t).trim() === String(k.title).trim()) g(id, 'заглавието е като на картата');
    const posl = body.trim().split('\n').pop().trim();
    if (!NE_ZDRAVNI.has(id) && posl !== 'Записките не заменят преглед.') g(id, 'последният ред не е „Записките не заменят преглед.“');
    if ([...String(s.e)].length > 3) g(id, 'e не е едно емоджи: ' + s.e);
  }
  for (const k of K) if (!vidS.has(k.id)) g(k.id, 'карта без статия');
  return greshki;
}

if (process.argv.includes('--primamki')) {
  const kop = x => JSON.parse(JSON.stringify(x));
  const K = kop(K0), S = kop(S0);
  K[0].core += ' Дай 5 мг.'; K[1].keys.push('Голяма Буква'); K[2].keys = K[2].keys.slice(0, 5); K[3].chips = ['nyama-takava-xyz'];
  K[4].follow = 'Звънни. 🚨 Кървене'; K[5].tip = 'без крушка'; K[6].core += ' Това е 100 % сигурно.';
  K[7].keys.push(K[8].keys[0]);
  S[0].body = S[0].body.replace('## ', '# '); S[1].c = '🍼 Шише'; S[2].t = K[2].title; S[3].body += '\nкрай'; S[4].body = S[4].body.replace('Записките', 'Записки');
  S[5].body += '\n\nтекст 🚨 по средата'; S[6].s = 'х'.repeat(201); S[7].body += '\n\n🚨 Кървене — към лекар.\n\nЗаписките не заменят преглед.';
  S[8].body = S[8].body.replace('\n\n', '\n\n\n'); K[9].follow += ' Ако си над 35, иди.'; S.pop();
  const gr = proveri(K, S);
  console.log('примамки: 18 вкарани · червени редове: ' + gr.length); for (const x of gr) console.log('  ' + x);
  process.exit(0);
}
const greshki = proveri(K0, S0);
console.log('карти: ' + K0.length + ' · статии: ' + S0.length);
for (const s of S0) console.log('  ' + s.karta.padEnd(32) + dumi(s.body) + ' думи · ' + (String(s.body).match(/^## /gm) || []).length + ' раздела · резюме ' + String(s.s).length + ' · ' + s.c);
for (const k of K0) console.log('  ' + k.id.padEnd(32) + 'core ' + dumi(k.core) + ' · ключове ' + k.keys.length + ' · чипове ' + k.chips.join(','));
if (greshki.length) { console.log('🔴 ГРЕШКИ: ' + greshki.length); for (const x of greshki) console.log('  ' + x); process.exit(1); }
console.log('🟢 чисто: 0 грешки');
