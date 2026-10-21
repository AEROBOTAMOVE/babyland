// zn1a · проверител на СЪДИЯТА (само чете): статиите по договора + основното по картите
// node dev/znanie/vlivane/zn1a_proveri_statii.js   (cwd = корена)
// Статия: 260–600 думи · „## “ в началото · ≥ 3 раздела · "c" от списъка на „Моето бебе“ · без прави кавички
// · ред с 🚨 започва с 🚨 (или „- 🚨“) · заглавие ≠ картата · резюме ≤ 200 · без \r · последен ред „Записките не заменят преглед.“
// · без доза / обещание / латинска мярка до число · по една статия на карта.
// Карта: ≥ 12 ключа, малки букви, 2–6 думи, без прави кавички, 2–3 на латиница, без вътрешни повтори;
// чиповете — само съществуващи id в js/kb.js; id-то не е заето в js/kb.js.
const fs = require('fs');
const kb = fs.readFileSync('js/kb.js', 'utf8');
const K = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1a.json', 'utf8'));
const S = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn1a.json', 'utf8'));
const RAZDELI = ['🐣 Новородено', '🤱 Кърмене', '🍼 Шише и изцеждане', '😴 Сън', '🧴 Грижи', '📏 Растеж', '👶 Недоносено бебе и НИКУ', '👯 Близнаци', '🎉 Празници'];
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const LAT = /\d\s*(ml|mg|kg|cm)\b/i;
const GOLI = ['сън', '6 месеца', 'на колко месеца', 'готово ли е', 'бебе', 'кърмене', 'пелени'];
const idKarti = new Map(K.map(k => [k.id, k]));
let losho = 0;
const red = (ok, et, pr) => { if (!ok) losho++; console.log((ok ? '✅ ' : '🔴 ') + et + (pr.length ? ' · ' + pr.join(' · ') : '')); };

console.log('── СТАТИИ ──');
const vidyani = new Map();
for (const s of S) {
  const pr = [];
  const k = idKarti.get(s.karta);
  if (!k) pr.push('НЯМА карта ' + s.karta);
  if (vidyani.has(s.karta)) pr.push('втора статия за същата карта');
  vidyani.set(s.karta, 1);
  for (const p of ['karta', 't', 'e', 's', 'k', 'c', 'body']) if (!s[p] || !String(s[p]).trim()) pr.push('празно ' + p);
  const b = String(s.body || '');
  const dumi = b.trim().split(/\s+/).length;
  if (dumi < 260 || dumi > 600) pr.push('думи ' + dumi);
  if (!/^## /.test(b)) pr.push('не започва с „## “');
  const razd = (b.match(/^## .+$/gm) || []).length;
  if (razd < 3) pr.push('раздели ' + razd);
  if (!RAZDELI.includes(s.c)) pr.push('раздел „' + s.c + '“ не е от списъка');
  const vsichko = [s.t, s.e, s.s, s.k, b].join('\n');
  if (/["']/.test(vsichko)) pr.push('ПРАВА КАВИЧКА');
  const losh = b.split('\n').findIndex(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
  if (losh >= 0) pr.push('🚨 не е в началото на ред ' + (losh + 1));
  if (k && String(s.t).trim() === String(k.title).trim()) pr.push('заглавието = картата');
  if (String(s.s).length > 200) pr.push('резюме ' + String(s.s).length + ' знака');
  if (/\r/.test(vsichko)) pr.push('има \\r');
  const posleden = b.trim().split('\n').pop().trim();
  if (posleden !== 'Записките не заменят преглед.') pr.push('последният ред не е „Записките не заменят преглед.“');
  if (DOZA.test(vsichko)) pr.push('ДОЗА/мл до число');
  if (OBESHT.test(vsichko)) pr.push('обещание');
  if (LAT.test(vsichko)) pr.push('латинска мярка до число');
  if ([...String(s.e)].length > 2) pr.push('емоджито е повече от едно');
  red(!pr.length, s.karta.padEnd(28) + String(dumi).padStart(4) + ' д. · ' + razd + ' разд. · резюме ' + String(s.s).length, pr);
}
for (const k of K) if (!vidyani.has(k.id)) red(false, k.id, ['картата няма статия']);

console.log('── КАРТИ (ключове и чипове) ──');
const vsKl = new Map();
for (const k of K) for (const x of k.keys) vsKl.set(x, (vsKl.get(x) || 0) + 1);
for (const k of K) {
  const pr = [];
  if (k.keys.length < 12) pr.push('ключове ' + k.keys.length);
  const tekst = [k.title, k.core, k.tip, k.follow].join(' ');
  if (/["']/.test(tekst) || k.keys.some(x => /["']/.test(x))) pr.push('ПРАВА КАВИЧКА');
  const glavni = k.keys.filter(x => x !== x.toLowerCase()); if (glavni.length) pr.push('главни: ' + glavni.join(' | '));
  const dumi = k.keys.filter(x => { const n = x.trim().split(/\s+/).length; return n < 2 || n > 6; }); if (dumi.length) pr.push('не 2–6 думи: ' + dumi.join(' | '));
  const lat = k.keys.filter(x => /^[a-z ]+$/.test(x)).length; if (lat < 2 || lat > 3) pr.push('латиница ' + lat);
  const goli = k.keys.filter(x => GOLI.includes(x)); if (goli.length) pr.push('голи: ' + goli.join(' | '));
  const vatr = k.keys.filter(x => vsKl.get(x) > 1); if (vatr.length) pr.push('вътрешен повтор: ' + vatr.join(' | '));
  const chips = k.chips || [];
  if (chips.length < 1 || chips.length > 3) pr.push('чипове ' + chips.length);
  const nyama = chips.filter(c => kb.indexOf("id: '" + c + "'") < 0 && kb.indexOf('id: "' + c + '"') < 0); if (nyama.length) pr.push('ЧИП НЯМА: ' + nyama.join(','));
  if (kb.indexOf("id: '" + k.id + "'") > -1) pr.push('ID ЗАЕТО в kb.js');
  const cw = k.core.trim().split(/\s+/).length; if (cw < 60 || cw > 150) pr.push('core ' + cw + ' думи');
  if (!/^💡/.test(k.tip)) pr.push('tip без 💡');
  if (/🚨/.test(k.follow) && !/^🚨/.test(k.follow)) pr.push('🚨 не е отпред');
  if (DOZA.test(tekst)) pr.push('ДОЗА/мл до число');
  if (OBESHT.test(tekst)) pr.push('обещание');
  red(!pr.length, k.id.padEnd(28) + String(cw).padStart(4) + ' д. · ' + k.keys.length + ' кл. · ' + chips.length + ' чипа', pr);
}
console.log('карти ' + K.length + ' · статии ' + S.length + ' · проблеми ' + losho);
process.exit(losho ? 1 : 0);
