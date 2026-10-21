// zn5 · сглобява стаж-файловете от zn5_karti_data.js и zn5_statii_data.js.
// Пише САМО dev/nahodki/karti_zn5.json и dev/nahodki/statii_zn5.json (UTF-8, без BOM).
// node dev/znanie/vlivane/zn5_build.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
delete require.cache[require.resolve('./zn5_karti_data.js')];
delete require.cache[require.resolve('./zn5_statii_data.js')];
const карти = require('./zn5_karti_data.js');
const статии = require('./zn5_statii_data.js');
const ред = ['id', 'room', 'от', 'до', 'title', 'core', 'tip', 'follow', 'keys', 'chips'];
const К = карти.map(к => { const о = {}; for (const п of ред) if (к[п] != null) о[п] = к[п]; return о; });
const С = статии.map(с => ({ karta: с.karta, t: с.t, e: с.e, s: с.s, k: с.k, c: с.c, body: String(с.body).replace(/\r/g, '') }));
const ид = new Set(К.map(к => к.id));
const без = К.filter(к => !С.some(с => с.karta === к.id)).map(к => к.id);
const сираци = С.filter(с => !ид.has(с.karta)).map(с => с.karta);
fs.writeFileSync('dev/nahodki/karti_zn5.json', JSON.stringify(К, null, 1) + '\n', 'utf8');
fs.writeFileSync('dev/nahodki/statii_zn5.json', JSON.stringify(С, null, 1) + '\n', 'utf8');
console.log('карти: ' + К.length + ' · статии: ' + С.length +
  (без.length ? ' · БЕЗ статия: ' + без.join(', ') : '') + (сираци.length ? ' · статия без карта: ' + сираци.join(', ') : ''));
