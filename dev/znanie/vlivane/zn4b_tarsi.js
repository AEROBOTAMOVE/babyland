// zn4b · търси регекс в картите на js/kb.js И в чуждите стаж-файлове dev/nahodki/karti_zn*.json. Само чете.
// node dev/znanie/vlivane/zn4b_tarsi.js "регекс1" "регекс2" ...   id:<id> = цялата карта · --pylno = цял текст
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
for (const f of fs.readdirSync('dev/nahodki').filter(x => /^karti_zn.*\.json$/.test(x) && x !== 'karti_zn4b.json')) {
  try { for (const c of JSON.parse(fs.readFileSync('dev/nahodki/' + f, 'utf8'))) { c.room = (c.room || '') + '·СТАЖ'; karti.push(c); } } catch (e) { console.log('!! ' + f + ' ' + e.message); }
}
const args = process.argv.slice(2);
const pylno = args.includes('--pylno');
const res = args.filter(a => !a.startsWith('--'));
console.log('карти:', karti.length);
for (const r of res.filter(a => a.startsWith('id:'))) {
  const c = karti.find(k => k.id === r.slice(3));
  if (!c) { console.log('\n=== НЯМА ' + r); continue; }
  console.log('\n=== ' + c.id + ' [' + c.room + '] от ' + c.от + ' до ' + c.до + '\nT: ' + c.title + '\nC: ' + c.core + '\nTIP: ' + c.tip + '\nF: ' + c.follow + '\nCH: ' + (c.chips || []).join(', ') + '\nK: ' + (c.keys || []).slice(0, 40).join(' | '));
}
for (const r of res.filter(a => !a.startsWith('id:'))) {
  const re = new RegExp(r, 'i');
  const hit = karti.filter(c => re.test([c.title, c.core, c.tip, c.follow, (c.keys || []).join(' | ')].join(' ¦ ')));
  console.log('\n### /' + r + '/ → ' + hit.length);
  for (const c of hit.slice(0, 20)) {
    const t = [c.title, c.core, c.tip, c.follow].join(' ¦ ');
    const m = t.match(re);
    let sn = '';
    if (m) { const i = Math.max(0, m.index - 60); sn = t.slice(i, m.index + 90).replace(/\s+/g, ' '); }
    else sn = '(в ключовете)';
    console.log('- ' + c.id + ' [' + c.room + '] ' + c.title + ' :: ' + (pylno ? t : sn));
  }
}
