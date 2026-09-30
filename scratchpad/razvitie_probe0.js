const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
console.log('KB keys:',Object.keys(KB).slice(0,30).join(','));
const e=KB.entries;
console.log('entries type:',Array.isArray(e)?'array':typeof e,'len:',e&&e.length);
const first=Array.isArray(e)?e[0]:Object.values(e)[0];
console.log('first entry keys:',Object.keys(first).join(','));
console.log(JSON.stringify(first).slice(0,1200));
