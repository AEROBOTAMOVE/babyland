// zn1b · бърза суха проверка на стажа (само чете): думи, кавички, мл, ключове-сблъсъци, чипове, статии
// node dev/znanie/vlivane/zn1b_proveri.js   (cwd = корена)
const fs = require('fs');
const kb = fs.readFileSync('js/kb.js', 'utf8');
const K = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn1b.json', 'utf8'));
let S = [];
try { S = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn1b.json', 'utf8')); } catch (e) { }
const ids = new Set(K.map(k => k.id));
const imaId = id => kb.indexOf("id: '" + id + "'") > -1 || kb.indexOf('id: "' + id + '"') > -1;
const zhivi = new Set();
// низовите литерали се четат по двойки правилно (без таван на дължината — иначе двойките се разместват)
for (const m of kb.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) {
  const v = m[1] != null ? m[1] : m[2];
  if (v && v.length >= 2) zhivi.add(v.toLowerCase());
}
const vsichkiKl = new Map();
for (const k of K) for (const x of k.keys) { const l = x.toLowerCase(); vsichkiKl.set(l, (vsichkiKl.get(l) || 0) + 1); }
let lоши = 0;
for (const k of K) {
  const w = k.core.split(/\s+/).length;
  const t = [k.title, k.core, k.tip, k.follow].join(' ');
  const pr = [];
  if (w < 60 || w > 150) pr.push('core ' + w + ' думи');
  if (/["']/.test(t) || k.keys.some(x => /["']/.test(x))) pr.push('права кавичка');
  if (/\d+\s*(мг|мл|mg|ml|милилитр|kg|cm)/i.test(t)) pr.push('мерка до число');
  if (/(гарантиран|100\s*%|напълно безопасн|няма никакъв риск|винаги помага|спасително средство)/i.test(t)) pr.push('обещание');
  if (!/^💡/.test(k.tip)) pr.push('tip без 💡');
  if (k.follow && /🚨/.test(k.follow) && !/^🚨/.test(k.follow)) pr.push('🚨 не е отпред');
  if (k.keys.length < 12) pr.push('ключове ' + k.keys.length);
  if (k.keys.some(x => /[А-ЯA-Z]/.test(x))) pr.push('главна буква в ключ');
  const lat = k.keys.filter(x => /^[a-z0-9 ]+$/.test(x) && /[a-z]/.test(x)).length; if (lat < 2 || lat > 3) pr.push('латиница ' + lat);
  const sbl = k.keys.filter(x => zhivi.has(x.toLowerCase())); if (sbl.length) pr.push('СБЛЪСЪК: ' + sbl.join(' | '));
  const vatr = k.keys.filter(x => vsichkiKl.get(x.toLowerCase()) > 1); if (vatr.length) pr.push('ВЪТРЕШЕН: ' + vatr.join(' | '));
  const dalgi = k.keys.filter(x => x.split(' ').length > 6 || x.split(' ').length < 2); if (dalgi.length) pr.push('думи извън 2–6: ' + dalgi.join(' | '));
  const lchip = (k.chips || []).filter(c => !ids.has(c) && !imaId(c)); if (lchip.length) pr.push('ЧИП НЯМА: ' + lchip.join(','));
  if ((k.chips || []).length < 1 || (k.chips || []).length > 3) pr.push('чипове ' + (k.chips || []).length);
  if (imaId(k.id)) pr.push('ID ЗАЕТО');
  if (!/^zn1b-[a-z0-9-]{1,35}$/.test(k.id)) pr.push('лош id');
  const st = S.find(s => s.karta === k.id);
  if (S.length) {
    if (!st) pr.push('НЯМА СТАТИЯ');
    else {
      const sw = st.body.trim().split(/\s+/).length;
      const raz = (st.body.match(/^##\s+.+$/gm) || []).length;
      const tx = [st.t, st.s, st.body].join('\n');
      if (sw < 260 || sw > 600) pr.push('статия ' + sw + ' думи');
      if (raz < 3) pr.push('статия раздели ' + raz);
      if (!/^##\s/.test(st.body)) pr.push('статия не почва с ##');
      if (/["']/.test(tx)) pr.push('статия права кавичка');
      if (/\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i.test(tx) || /\d\s*(ml|mg|kg|cm)\b/i.test(tx)) pr.push('статия мерка');
      if (/(гарантиран|100\s*%|напълно безопасн|няма никакъв риск|винаги помага|спасително средство)/i.test(tx)) pr.push('статия обещание');
      if (/\r/.test(st.body)) pr.push('статия \\r');
      const sos = st.body.split('\n').findIndex(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l)); if (sos >= 0) pr.push('статия 🚨 по средата ред ' + (sos + 1));
      if (String(st.s).length > 200) pr.push('резюме ' + String(st.s).length);
      if (st.t.trim() === k.title.trim()) pr.push('заглавие = картата');
      if ((k.room === 'Здраве и SOS' || /лекар|педиатър|преглед|НЗОК/.test(st.body)) && !/Записките не заменят преглед\.\s*$/.test(st.body)) pr.push('без „Записките не заменят преглед.“');
      if ([...st.e].length > 2) pr.push('емоджи?');
    }
  }
  if (pr.length) lоши++;
  console.log((pr.length ? '🔴 ' : '✅ ') + k.id.padEnd(28) + w + ' д. · ' + k.keys.length + ' кл.' + (st ? ' · ст. ' + st.body.trim().split(/\s+/).length + ' д.' : '') + ' ' + pr.join(' · '));
}
console.log('карти: ' + K.length + ' · статии: ' + S.length + ' · с бележки: ' + lоши);
