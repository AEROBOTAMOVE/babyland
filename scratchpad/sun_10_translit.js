'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const МБ='Моето бебе';
console.log('А) Кирилски двойник на латинските провали:');
for(const q of ['приуча','да спи само','го приуча','как да го приуча','приуча да спи','приучаване','как да приуча бебето да спи само'])
 {const e=A.BL_MATCH(q,МБ);console.log('  '+(e?e.id+' «'+e.title+'»':'ТИШИНА').padEnd(58)+' ← '+q);}
console.log('\nБ) Има ли ключ с „приуч“ някъде в базата:');
const KB=A.BL_KB||A.KB;
let бр=0;
for(const e of KB.entries) for(const k of (e.keys||[])) if(/приуч/.test(k)){console.log('  '+e.id+' «'+e.title+'» → '+k);бр++;}
console.log('  общо: '+бр);
console.log('\nВ) Работи ли транслитерацията изобщо (същата фраза, две азбуки):');
for(const [л,к] of [['kak da go otucha da zaspiva na race','как да го отуча да заспива на ръце'],['ritualat predi san','ритуалът преди сън'],['nostni sabuzhdania','нощни събуждания'],['tumno ili s lampa','тъмно или с лампа']])
 {const a=A.BL_MATCH(л,МБ),b=A.BL_MATCH(к,МБ);
  console.log('  ЛАТ '+(a?a.id:'ТИШИНА').padEnd(24)+' КИР '+(b?b.id:'ТИШИНА').padEnd(24)+' | '+л);}
