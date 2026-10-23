// zn10 · показва карти от js/kb.js по id или търси по дума в title/keys (само чете текста, не зарежда пясъчника)
// node dev/znanie/vlivane/zn10_pokazhi.js id1 id2 …   |   node … --tarsi=дума1,дума2
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
const txt = fs.readFileSync(path.join(КОРЕН, 'js/kb.js'), 'utf8');
const блокове = txt.split(/\n\s*\{\s*\n/).filter(b => /\bid: '/.test(b));
const вземи = (b, поле) => { const m = b.match(new RegExp('\\b' + поле + ": '((?:[^'\\\\]|\\\\.)*)'")); return m ? m[1] : ''; };
const ключове = b => { const m = b.match(/keys: \[([^\]]*)\]/); return m ? m[1] : ''; };
const арг = process.argv.slice(2);
const търси = арг.find(a => a.startsWith('--tarsi='));
if (търси) {
  const думи = търси.slice(8).split(',').map(s => s.toLowerCase());
  for (const b of блокове) {
    const id = вземи(b, 'id'), t = вземи(b, 'title'), k = ключове(b).toLowerCase(), c = вземи(b, 'core').toLowerCase();
    const h = думи.filter(d => t.toLowerCase().includes(d) || k.includes(d));
    if (h.length) console.log(id.padEnd(30) + ' · ' + t + '  [' + h.join(',') + ']');
  }
} else {
  for (const id of арг) {
    const b = блокове.find(x => вземи(x, 'id') === id);
    if (!b) { console.log('##### ' + id + ' — НЯМА'); continue; }
    console.log('##### ' + id + ' · ' + (b.match(/room: '([^']*)'/) || [])[1] + ' · ' + вземи(b, 'title'));
    console.log('CORE: ' + вземи(b, 'core'));
    console.log('KEYS: ' + ключове(b));
  }
}
