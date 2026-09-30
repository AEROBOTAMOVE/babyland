'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
// А) майка с бебе на 10 месеца
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
// Б) бременна
const B=zaredi(null,{памет:{bl_lmp:'2026-04-01'}});
const KB=A.BL_KB||A.KB;const поId=new Map(KB.entries.map(e=>[e.id,e]));
for(const id of ['br-kramp','br-nespokoyni-kraka','br-son','br-son-pozi'])
 {const e=поId.get(id);console.log(id+'  от '+e.от+' до '+e.до+'  ['+e.room+'] «'+e.title+'»');}
console.log('\nВОДИ ЛИ ГЕЙТЪТ БРЕМЕННИ КАРТИ НА РОДИЛА ЖЕНА? (стая „Моето бебе“)');
for(const q of ['крачетата му ритат цяла нощ','крампи в краката нощем','краката не ме оставят да заспя','как да спя с корем']){
 const a=A.BL_MATCH(q,'Моето бебе'), b=B.BL_MATCH(q,'Бременност');
 console.log('  майка10м: '+(a?a.id+' ['+a.room+']':'ТИШИНА').padEnd(34)+' бременна: '+(b?b.id+' ['+b.room+']':'ТИШИНА').padEnd(30)+' ← '+q);}
