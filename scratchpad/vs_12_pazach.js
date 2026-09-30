// ГОЛЯМ ПАЗАЧ: по 3 ключа от ВСЯКА карта — сравнява маршрута ПРЕДИ и СЛЕД добавянето.
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { bl_baby: { birth: '2025-11-20' } };
const К = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_vsekidnevie.json'), 'utf8'));
function вкарай(К){return s=>{let n=0;for(const[id,ks]of Object.entries(К)){let i=s.indexOf("id: '"+id+"'");if(i<0)i=s.indexOf('id: "'+id+'"');if(i<0)continue;const j=s.indexOf('keys: [',i);if(j<0||j-i>400)continue;const e=j+7;s=s.slice(0,e)+ks.map(k=>JSON.stringify(k)).join(', ')+', '+s.slice(e);n+=ks.length;}console.log('вкарани: '+n);return s;};}
const A = zaredi(null, { памет: ПАМ });
const B = zaredi(null, { памет: ПАМ, kbPatch: вкарай(К) });
const eA = (A.BL_KB || A.KB).entries;

const проби = [];
for (const c of eA) {
  const ks = (c.keys || []).filter(k => String(k).length > 8);
  for (const k of [ks[0], ks[Math.floor(ks.length/2)], ks[ks.length-1]]) if (k) проби.push([c.room, k, c.id]);
}
console.log('ПРОБИ: ' + проби.length + ' (по ~3 от ' + eA.length + ' карти)');
let разлики = 0, същи = 0, къмНовите = 0, отНовите = 0;
const цели = new Set(Object.keys(К));
const примери = [];
for (const [ст, k, соб] of проби) {
  const a = A.BL_MATCH(k, ст), b = B.BL_MATCH(k, ст);
  const ai = a ? a.id : null, bi = b ? b.id : null;
  if (ai === bi) { същи++; continue; }
  разлики++;
  if (цели.has(bi)) къмНовите++;      // отиде към карта, която подсилихме
  else if (цели.has(ai)) отНовите++;  // отдръпна се ОТ подсилена карта (лошо)
  if (примери.length < 25) примери.push([ст, k, соб, ai, bi]);
}
console.log('СЪЩИ: ' + същи + ' · РАЗЛИЧНИ: ' + разлики + '  (към подсилена карта: ' + къмНовите + ' · отдръпнали се от подсилена: ' + отНовите + ')');
if (примери.length) { console.log('\nПРИМЕРИ ЗА РАЗЛИКА:'); for (const [ст,k,соб,ai,bi] of примери) console.log('  [' + ст + '] « ' + k + ' » (на ' + соб + ')  ' + ai + ' → ' + bi); }
