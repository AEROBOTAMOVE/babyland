const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const р=[/срамежл|стеснит|стеснява/i,/поздрав/i,/лъж|измисля си/i,/прекъсва|изчаква реда|изчака/i,
 /по-малките|по-малко дете|грубо/i,/загубата|редуване/i,/разказва/i,/отстрани|не се включва/i,/наблюдава/i];
console.log('=== в ЗАГЛАВИЯТА на всичките 1621 карти ===');
р.forEach(rg=>{
  const н=KB.entries.filter(e=>rg.test(String(e.title)));
  console.log('\n'+rg+'  -> '+н.length);
  н.forEach(e=>console.log('    '+e.id.padEnd(32)+'| '+e.room.padEnd(16)+'| '+e.title));
});
console.log('\n=== rz-udrya: за кого е ===');
const u=KB.entries.find(e=>e.id==='rz-udrya');
console.log(u.title+' | '+String(u.core).slice(0,260));
console.log('KEYS: '+u.keys.join(' · '));
