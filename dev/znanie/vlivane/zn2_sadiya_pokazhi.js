// Съдията zn2: показва title/core/tip/follow на съществуващи карти от js/kb.js (само чете).
// node dev/znanie/vlivane/zn1c_sadiya_pokazhi.js id1 id2 …
const src = require('fs').readFileSync('js/kb.js', 'utf8');
const Q = String.fromCharCode(39);
function pick(blk, k) {
  const i = blk.indexOf('\n      ' + k + ': ' + Q);
  if (i < 0) return '';
  let j = i + ('\n      ' + k + ': ' + Q).length, out = '';
  while (j < blk.length) {
    const c = blk[j];
    if (c === '\\') { out += blk[j + 1]; j += 2; continue; }
    if (c === Q) break;
    out += c; j++;
  }
  return out;
}
for (const id of process.argv.slice(2)) {
  const i = src.indexOf('id: ' + Q + id + Q);
  if (i < 0) { console.log('НЯМА', id); continue; }
  const j = src.indexOf('\n    {', i + 10);
  const blk = '\n      ' + src.slice(i, j > 0 ? j : i + 8000);
  console.log('=====', id, '|', pick(blk, 'title'));
  console.log('CORE:', pick(blk, 'core'));
  console.log('TIP:', pick(blk, 'tip'));
  console.log('FOLLOW:', pick(blk, 'follow'));
}
