'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const поId=new Map(KB.entries.map(e=>[e.id,e]));
for(const id of ['mb-otkaz-gyrda','rz-sramezhlivost-gosti','y4-koshara-s-rastezha','x1-izlizane-ot-nasheto-leglo'])
 console.log((поId.has(id)?'ИМА  '+поId.get(id).room+'  «'+поId.get(id).title+'»':'НЯМА')+'   '+id);
console.log('\nКъде водят сега тези фрази:');
for(const q of ['дърпа се от гърдата','крие се при гости','стеснява се от чужди хора','катери се от кошарата','катери се и излиза от кошарата'])
 {const e=A.BL_MATCH(q,'Моето бебе');console.log('  '+(e?e.id+' ['+e.room+'] «'+e.title+'»':'ТИШИНА').padEnd(66)+' ← '+q);}
console.log('\nКандидати по заглавие:');
for(const e of KB.entries) if(/стесн|срамеж|чужди хора|катери|излиза от кошар|дърпа се от гърда|отказва гърда/i.test(e.title+' '+(e.keys||[]).join(' ')))
 console.log('  '+e.id+' ['+e.room+'] «'+e.title+'»');
