// МЕРКА 1: колко карти имат/нямат възраст (полета `от`/`до`, в месеци)
// ПЪТ НАЗАД: този файл само ЧЕТЕ. Нищо не записва в проекта.
const { zaredi } = require('../dev/pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const E = KB.entries;

console.log('ОБЩО карти (entries.length):', E.length);

// контролен случай: уредът ВИЖДА ли изобщо полето?
const първа = E[0];
console.log('КОНТРОЛА · entries[0].id =', първа.id, '· от =', първа.от, '· до =', първа.до);
if (първа.от == null && първа.до == null) {
  console.log('!!! КОНТРОЛАТА ГРЪМНА: първата карта (бременност) ТРЯБВА да има `от`. Уредът не вижда полето.');
  process.exit(2);
}

let сОт = 0, сДо = 0, сНякое = 0, безНищо = 0;
const без = [];
for (const e of E) {
  if (e.от != null) сОт++;
  if (e.до != null) сДо++;
  if (e.от != null || e.до != null) сНякое++;
  else { безНищо++; без.push(e); }
}
console.log('с `от`        :', сОт);
console.log('с `до`        :', сДо);
console.log('с ПОНЕ едното :', сНякое);
console.log('БЕЗ възраст   :', безНищо);
console.log('проверка сбор :', сНякое + безНищо, '=== ', E.length, sумОК(сНякое + безНищо, E.length));
function sумОК(a, b) { return a === b ? 'ОК' : 'РАЗМИНАВА СЕ'; }

// дубликати по id — за да не броя една карта два пъти
const ids = new Set(E.map(e => e.id));
console.log('уникални id   :', ids.size, ids.size === E.length ? '(няма дубликати)' : '(!!! ДУБЛИКАТИ: ' + (E.length - ids.size) + ')');

// по стаи
const стаи = new Map();
for (const e of E) {
  const r = e.room || '(без стая)';
  if (!стаи.has(r)) стаи.set(r, { общо: 0, без: 0 });
  const с = стаи.get(r); с.общо++;
  if (e.от == null && e.до == null) с.без++;
}
console.log('\n=== ПО СТАИ (общо / без възраст / % без) ===');
[...стаи.entries()].sort((a, b) => b[1].без - a[1].без).forEach(([r, с]) => {
  console.log(String(r).padEnd(28), String(с.общо).padStart(5), String(с.без).padStart(5),
    (100 * с.без / с.общо).toFixed(0).padStart(4) + '%');
});

require('fs').writeFileSync(__dirname + '/_bez_vazrast.json',
  JSON.stringify(без.map(e => ({ id: e.id, room: e.room || null, title: e.title || null })), null, 1), 'utf8');
console.log('\nзаписах списъка в scratchpad/_bez_vazrast.json ·', без.length, 'реда');
