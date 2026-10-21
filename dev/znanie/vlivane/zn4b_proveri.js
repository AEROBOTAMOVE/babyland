// zn4b · предварителна проверка на стажа (карти + статии) по договора AGENT_VLIVANE.md. Само чете.
// node dev/znanie/vlivane/zn4b_proveri.js
const fs = require('fs');
const src = fs.readFileSync('js/kb.js', 'utf8');
const window = {};
new Function('window', src)(window);
const karti = [];
(function obh(o) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { o.forEach(obh); return; }
  if (typeof o.id === 'string' && typeof o.core === 'string') { karti.push(o); return; }
  for (const k of Object.keys(o)) obh(o[k]);
})(window.KB);
const ID = new Set(karti.map(k => k.id));
const ZHIVI = new Map();
for (const e of karti) for (const k of (e.keys || [])) ZHIVI.set(String(k).toLowerCase(), e.id);
const moi = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn4b.json', 'utf8'));
const moiId = new Set(moi.map(k => k.id));
const chuzhdi = new Map();
const chuzhdiId = new Set();
for (const f of fs.readdirSync('dev/nahodki').filter(f => /^karti_.*\.json$/.test(f) && f !== 'karti_zn4b.json')) {
  try { for (const k of JSON.parse(fs.readFileSync('dev/nahodki/' + f, 'utf8'))) { chuzhdiId.add(k.id); for (const kl of (k.keys || [])) chuzhdi.set(String(kl).toLowerCase(), k.id + ' [' + f + ']'); } } catch (e) {}
}
const DOZA = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const OBESHT = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const GOLI = new Set(['сън', '6 месеца', 'на колко месеца', 'готово ли е']);
let losho = 0;
const vidyani = new Map();
for (const k of moi) {
  const p = [];
  if (ID.has(k.id)) p.push('id вече съществува');
  if (chuzhdiId.has(k.id)) p.push('id в чужд стаж');
  if (!/^zn4b-[a-z0-9-]{2,35}$/.test(k.id) || k.id.length > 40) p.push('лош id');
  const t = [k.title, k.core, k.tip, k.follow || ''].join('\n');
  if (/["']/.test(t)) p.push('права кавичка');
  if (DOZA.test(t)) p.push('доза');
  if (OBESHT.test(t)) p.push('обещание');
  if (/\d\s*(ml|mg|kg|cm)\b/i.test(t)) p.push('латинска мярка');
  const dumi = k.core.split(/\s+/).length;
  if (dumi < 60 || dumi > 150) p.push('core думи ' + dumi);
  if (!/^💡/.test(k.tip)) p.push('tip без 💡');
  if (/🚨/.test(k.follow || '') && !/^🚨/.test(k.follow)) p.push('🚨 не е отпред');
  if (k.keys.length < 12) p.push('ключове ' + k.keys.length);
  const lat = k.keys.filter(x => /[a-z]/.test(x) && !/[а-я]/.test(x)).length;
  if (lat < 2 || lat > 3) p.push('латиница ' + lat);
  for (const kl of k.keys) {
    const n = kl.split(/\s+/).length;
    if (n > 6 || (n < 2 && !/[a-z]/.test(kl))) p.push('ключ дума-брой „' + kl + '“ ' + n);
    if (/[А-ЯA-Z]/.test(kl)) p.push('главна в „' + kl + '“');
    if (/["']/.test(kl)) p.push('кавичка в ключ');
    if (GOLI.has(kl)) p.push('гола обща дума „' + kl + '“');
    const lk = kl.toLowerCase();
    if (ZHIVI.has(lk)) p.push('ЗАЕТ „' + kl + '“ → ' + ZHIVI.get(lk));
    if (chuzhdi.has(lk)) p.push('в чужд стаж „' + kl + '“ → ' + chuzhdi.get(lk));
    if (vidyani.has(lk)) p.push('повтарям „' + kl + '“ с ' + vidyani.get(lk));
    vidyani.set(lk, k.id);
  }
  if (!k.chips || k.chips.length < 1 || k.chips.length > 3) p.push('чипове ' + (k.chips || []).length);
  for (const c of (k.chips || [])) if (!ID.has(c) && !moiId.has(c) && !chuzhdiId.has(c)) p.push('чип няма: ' + c);
  if (p.length) losho++;
  console.log((p.length ? '🔴 ' : '✅ ') + k.id.padEnd(32) + ' core ' + dumi + (p.length ? '  ' + p.join(' · ') : ''));
}
console.log('карти: ' + moi.length + ' · с бележки: ' + losho);
// статиите
if (fs.existsSync('dev/nahodki/statii_zn4b.json')) {
  const st = JSON.parse(fs.readFileSync('dev/nahodki/statii_zn4b.json', 'utf8'));
  const ix = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
  const RAZD = {};
  for (const it of ix.items) (RAZD[it.r] = RAZD[it.r] || new Set()).add(it.c);
  const ZDRAVNI = new Set(['zn4b-buen-na-4', 'zn4b-yuzdichka', 'zn4b-w-sedene', 'zn4b-kateri-se', 'zn4b-bolno-skuchae', 'zn4b-esen-navan', 'zn4b-miene-na-race', 'zn4b-detska-kozmetika', 'zn4b-dvizhenie-na-den', 'zn4b-vazano-v-kolichkata', 'zn4b-spokoyno-dete', 'zn4b-na-3-godini', 'zn4b-na-4-godini', 'zn4b-na-5-godini', 'zn4b-testo-za-igra', 'zn4b-kolelo-po-zakon', 'zn4b-strah-ot-doktora']);
  let sl = 0;
  const vz = new Set();
  for (const s of st) {
    const p = [];
    const k = moi.find(x => x.id === s.karta);
    if (!k) p.push('няма карта ' + s.karta);
    if (vz.has(s.karta)) p.push('втора статия за картата'); vz.add(s.karta);
    for (const f of ['karta', 't', 'e', 's', 'k', 'c', 'body']) if (!s[f] || !String(s[f]).trim()) p.push('липсва ' + f);
    const d = s.body.trim().split(/\s+/).length;
    if (d < 260 || d > 600) p.push('думи ' + d);
    const tx = [s.t, s.s, s.k, s.body].join('\n');
    if (/["']/.test(tx)) p.push('права кавичка');
    if (DOZA.test(tx)) p.push('доза');
    if (OBESHT.test(tx)) p.push('обещание');
    if (/\d\s*(ml|mg|kg|cm)\b/i.test(tx)) p.push('латинска мярка');
    if (!/^##\s/.test(s.body)) p.push('не започва с ##');
    const z = (s.body.match(/^##\s+.+$/gm) || []).length;
    if (z < 3) p.push('раздели ' + z);
    const bad = s.body.split('\n').findIndex(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
    if (bad >= 0) p.push('🚨 по средата, ред ' + (bad + 1));
    if (/\r/.test(s.body)) p.push('\\r');
    if (k && !(RAZD[k.room] && RAZD[k.room].has(s.c))) p.push('разделът ' + s.c + ' не е в ' + (k && k.room));
    if (String(s.s).length > 200) p.push('резюме ' + String(s.s).length);
    if ([...String(s.e)].length > 2) p.push('емоджи?');
    if (k && s.t.trim() === k.title.trim()) p.push('заглавие = карта');
    const posl = s.body.trim().split('\n').pop().trim();
    if (ZDRAVNI.has(s.karta) && posl !== 'Записките не заменят преглед.') p.push('здравна без последния ред');
    if (p.length) sl++;
    console.log((p.length ? '🔴 ' : '✅ ') + String(s.karta).padEnd(32) + ' думи ' + d + (p.length ? '  ' + p.join(' · ') : ''));
  }
  const bez = moi.filter(k => !vz.has(k.id)).map(k => k.id);
  console.log('статии: ' + st.length + ' · с бележки: ' + sl + (bez.length ? ' · БЕЗ статия: ' + bez.join(', ') : ''));
}
