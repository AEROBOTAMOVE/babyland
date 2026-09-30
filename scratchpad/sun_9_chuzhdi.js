'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const поId=new Map(KB.entries.map(e=>[e.id,e]));
const чужди=['се буди в 5 сутринта','се дърпа от гърдата','се изринало от памперса','се крие при гости','се стеснява от чужди хора','се катери от кошарата','се събужда след половин час','крие се при гости'];
console.log('КЪДЕ ОТИВАТ ЧУЖДИТЕ КЛЮЧОВЕ НА sn-potene (стая „Моето бебе“):');
for(const k of чужди){const e=A.BL_MATCH(k,'Моето бебе');
 console.log('  «'+k+'»\n     → '+(e?e.id+' «'+e.title+'»':'ТИШИНА'));}
console.log('\nИМА ЛИ ГО ИСТИНСКАТА КАРТА?');
const двойки=[['се буди в 5 сутринта','sn-ranno-sabuzhdane'],['се събужда след половин час','sn-cikli-40min'],['се катери от кошарата',null],['се крие при гости',null]];
for(const [k,id] of двойки){
 const носители=KB.entries.filter(e=>(e.keys||[]).includes(k)).map(e=>e.id);
 console.log('  «'+k+'» носят: '+носители.join(', ')+(id?('   (истинската е '+id+' — има ли го? '+((поId.get(id).keys||[]).includes(k)?'ДА':'НЕ')+')'):''));}
// Латиница: къде се чупи
console.log('\nЛАТИНИЦА — дума по дума:');
for(const q of ['priucha','da spi samo','go priucha','kak da go priucha','priucha da spi','da priucha','priuchavane','kak da priucha bebeto da spi samo','kak da go otucha da zaspiva na race'])
 {const e=A.BL_MATCH(q,'Моето бебе');console.log('  '+(e?e.id+' «'+e.title+'»':'ТИШИНА').padEnd(60)+' ← '+q);}
