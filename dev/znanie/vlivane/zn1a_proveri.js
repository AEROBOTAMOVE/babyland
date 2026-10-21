// zn1a · бърза суха проверка на стажа (само чете): думи, кавички, мл, ключове-сблъсъци, чипове
// node dev/znanie/vlivane/zn1a_proveri.js   (cwd = корена)
const fs = require('fs');
const kb = fs.readFileSync('js/kb.js', 'utf8');
const K = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1a.json', 'utf8'));
const ids = new Set(K.map(k => k.id));
const zhivi = new Set();
for (const m of kb.matchAll(/'([^'\\]{2,80})'/g)) zhivi.add(m[1].toLowerCase());
const vsichkiKl = new Map();
for (const k of K) for (const x of k.keys) { const l = x.toLowerCase(); vsichkiKl.set(l, (vsichkiKl.get(l) || 0) + 1); }
for (const k of K) {
  const w = k.core.split(/\s+/).length;
  const t = [k.title, k.core, k.tip, k.follow].join(' ');
  const pr = [];
  if (w < 60 || w > 150) pr.push('core ' + w + ' думи');
  if (/["']/.test(t) || k.keys.some(x => /["']/.test(x))) pr.push('права кавичка');
  if (/\d+\s*(мг|мл|mg|ml|милилитр)/i.test(t)) pr.push('мл/мг до число');
  if (/(гарантиран|100\s*%|напълно безопасн|няма никакъв риск|винаги помага|спасително средство)/i.test(t)) pr.push('обещание');
  if (!/^💡/.test(k.tip)) pr.push('tip без 💡');
  if (k.follow && /🚨/.test(k.follow) && !/^🚨/.test(k.follow)) pr.push('🚨 не е отпред');
  if (k.keys.length < 12) pr.push('ключове ' + k.keys.length);
  if (k.keys.some(x => /[А-Я]/.test(x))) pr.push('главна буква в ключ');
  const lat = k.keys.filter(x => /^[a-z ]+$/.test(x)).length; if (lat < 2 || lat > 3) pr.push('латиница ' + lat);
  const sbl = k.keys.filter(x => zhivi.has(x.toLowerCase())); if (sbl.length) pr.push('СБЛЪСЪК: ' + sbl.join(' | '));
  const vatr = k.keys.filter(x => vsichkiKl.get(x.toLowerCase()) > 1); if (vatr.length) pr.push('ВЪТРЕШЕН: ' + vatr.join(' | '));
  const dalgi = k.keys.filter(x => x.split(' ').length > 6); if (dalgi.length) pr.push('над 6 думи: ' + dalgi.join(' | '));
  const lchip = (k.chips || []).filter(c => !ids.has(c) && kb.indexOf("id: '" + c + "'") < 0); if (lchip.length) pr.push('ЧИП НЯМА: ' + lchip.join(','));
  if (kb.indexOf("id: '" + k.id + "'") > -1) pr.push('ID ЗАЕТО');
  console.log((pr.length ? '🔴 ' : '✅ ') + k.id.padEnd(28) + w + ' д. · ' + k.keys.length + ' кл. ' + pr.join(' · '));
}
console.log('карти: ' + K.length);
