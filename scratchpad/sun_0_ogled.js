'use strict';
const path=require('path'),fs=require('fs');
const КОРЕН=path.resolve(__dirname,'..');
const {zaredi}=require(path.join(КОРЕН,'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
console.log('BL_MATCH:',typeof A.BL_MATCH, A.BL_MATCH&&A.BL_MATCH.length);
console.log('entries:',KB.entries.length);
const стаи={};
for(const e of KB.entries){стаи[e.room]=(стаи[e.room]||0)+1;}
console.log(JSON.stringify(стаи,null,1));
const e0=KB.entries[0];
console.log('полета:',Object.keys(e0).join(', '));
