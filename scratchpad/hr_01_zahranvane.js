const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const e=(A.BL_KB||A.KB).entries;
const z=e.filter(c=>c.room==='Захранване');
console.log('Захранване:',z.length);
for(const c of z) console.log(c.id+' | '+c.title+' | '+(c.от)+'..'+(c.до)+' | k='+c.keys.length);
