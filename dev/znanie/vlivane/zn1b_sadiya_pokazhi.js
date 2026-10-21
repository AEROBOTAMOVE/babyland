// Съдията zn1b: показва title/core/tip/follow на съществуващи карти от js/kb.js (само чете; чете kb.js веднъж).
// node dev/znanie/vlivane/zn1b_sadiya_pokazhi.js id1 id2 …
// node dev/znanie/vlivane/zn1b_sadiya_pokazhi.js --prefix=zn1a   (само заглавията на картите с такъв префикс)
const src = require('fs').readFileSync('js/kb.js', 'utf8');
const Q = String.fromCharCode(39);
const DQ = String.fromCharCode(34);
function pick(blk, k) {
  let q = Q, i = blk.indexOf('\n      ' + k + ': ' + Q);
  if (i < 0) { q = DQ; i = blk.indexOf('\n      ' + k + ': ' + DQ); }
  if (i < 0) return '';
  let j = i + ('\n      ' + k + ': ' + q).length, out = '';
  while (j < blk.length) {
    const c = blk[j];
    if (c === '\\') { out += blk[j + 1]; j += 2; continue; }
    if (c === q) break;
    out += c; j++;
  }
  return out;
}
function blok(id) {
  let i = src.indexOf('id: ' + Q + id + Q);
  if (i < 0) i = src.indexOf('id: ' + DQ + id + DQ);
  if (i < 0) return null;
  const j = src.indexOf('\n    {', i + 10);
  return '\n      ' + src.slice(i, j > 0 ? j : i + 8000);
}
const args = process.argv.slice(2);
const pre = args.find(a => a.startsWith('--prefix='));
if (pre) {
  const p = pre.slice(9);
  const re = new RegExp('id: ' + Q + '(' + p + '[a-z0-9-]*)' + Q, 'g');
  let m;
  while ((m = re.exec(src))) { const b = blok(m[1]); console.log(m[1] + ' | ' + pick(b, 'title')); }
} else {
  for (const id of args) {
    const b = blok(id);
    if (!b) { console.log('НЯМА', id); continue; }
    console.log('=====', id, '|', pick(b, 'title'));
    console.log('CORE:', pick(b, 'core'));
    console.log('TIP:', pick(b, 'tip'));
    console.log('FOLLOW:', pick(b, 'follow'));
  }
}
