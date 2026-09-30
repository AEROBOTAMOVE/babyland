const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const e=KB.entries;
const rooms={};
e.forEach(x=>{rooms[x.room]=(rooms[x.room]||0)+1;});
console.log(JSON.stringify(rooms,null,1));
console.log('--- РАЗВИТИЕ ---');
e.filter(x=>x.room==='Развитие и игри').forEach(x=>console.log(x.id+' | '+x.от+'..'+x.до+' | '+x.title));
