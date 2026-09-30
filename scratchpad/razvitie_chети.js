const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const ids=process.argv.slice(2);
ids.forEach(id=>{
  const e=KB.entries.find(x=>x.id===id);
  if(!e){console.log('### '+id+' — НЯМА ТАКАВА КАРТА');return;}
  console.log('### '+e.id+' | стая: '+e.room+' | '+e.от+'..'+e.до+' | '+e.title);
  console.log('CORE: '+String(e.core||'').slice(0,420));
  console.log('KEYS('+e.keys.length+'): '+e.keys.join(' · '));
  console.log('');
});
