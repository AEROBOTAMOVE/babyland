'use strict';
const path=require('path');
const КОРЕН=path.resolve(__dirname,'..');
const {zaredi}=require(path.join(КОРЕН,'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const поId=new Map(KB.entries.map(e=>[e.id,e]));
const Ц=process.argv.slice(2);
for(const id of Ц){const e=поId.get(id);
  if(!e){console.log('### '+id+' НЯМА');continue;}
  console.log('\n=== '+id+' ['+e.room+'] «'+e.title+'» от '+e.от+' до '+e.до+'  ключове: '+(e.keys||[]).length);
  (e.keys||[]).forEach((k,i)=>console.log('   '+(i+1)+'. '+k));
}
