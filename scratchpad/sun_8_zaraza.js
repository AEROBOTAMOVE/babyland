'use strict';
const path=require('path'),fs=require('fs');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
// 1) ключове-инструкции (не са въпрос на майка)
const боклук=[];
for(const e of KB.entries) for(const k of (e.keys||[]))
  if(/правилото|<|>|„|ВСЕКИ ключ|да се добави/.test(k)) боклук.push([e.id,e.room,e.title,k]);
console.log('=== КЛЮЧОВЕ-ИНСТРУКЦИИ В БАЗАТА: '+боклук.length+' ===');
for(const [id,r,t,k] of боклук) console.log('  '+id+' ['+r+'] «'+t+'»\n      → '+k);
// 2) един и същ ключ в повече от една карта
const карта=new Map();
for(const e of KB.entries) for(const k of (e.keys||[])){
  if(!карта.has(k))карта.set(k,[]); карта.get(k).push(e.id);}
const двойни=[...карта].filter(([k,v])=>v.length>1);
console.log('\n=== ДУБЛИРАНИ КЛЮЧОВЕ: '+двойни.length+' ===');
for(const [k,v] of двойни.slice(0,40)) console.log('  «'+k+'» → '+v.join(', '));
fs.writeFileSync(path.join(__dirname,'sun_8_zaraza.json'),JSON.stringify({боклук,двойни},null,1),'utf8');
