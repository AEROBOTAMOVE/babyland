// zn2 · сглобява статиите от zn2_statii_a/b/c.js в dev/nahodki/statii_zn2.json (UTF-8, без BOM, без \r)
// node dev/znanie/vlivane/zn2_statii_build.js   (cwd = корена на проекта)
'use strict';
const fs = require('fs');
const path = require('path');
const тук = __dirname;
const всички = [];
for (const ч of ['a', 'b', 'c']) {
  const ф = path.join(тук, 'zn2_statii_' + ч + '.js');
  delete require.cache[require.resolve(ф)];
  for (const с of require(ф)) {
    всички.push({ karta: с.karta, t: с.t, e: с.e, s: с.s, k: с.k, c: с.c, body: String(с.body).replace(/\r/g, '').trim() });
  }
}
const изход = path.resolve(тук, '../../nahodki/statii_zn2.json');
fs.writeFileSync(изход, JSON.stringify(всички, null, 1) + '\n', 'utf8');
console.log('статии: ' + всички.length + ' → ' + изход);
