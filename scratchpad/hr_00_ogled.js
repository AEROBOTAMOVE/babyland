const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
console.log('KB keys:',Object.keys(KB).slice(0,40).join(', '));
const e=KB.entries;
console.log('entries:',Array.isArray(e)?e.length:typeof e);
const s=e[0];
console.log('поле на карта:',Object.keys(s).join(', '));
console.log(JSON.stringify(s).slice(0,1200));
// стаи
const rooms={};
for(const c of e){const r=c.room||c.стая||c.section||'?';rooms[r]=(rooms[r]||0)+1;}
console.log('СТАИ:',JSON.stringify(rooms,null,1));
