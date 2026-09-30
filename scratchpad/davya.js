const path=require('path');
const {zaredi}=require(path.join(__dirname,'..','dev','pyasachnik.js'));
const W=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=W.BL_KB||W.KB;
const rf=(KB.redFlags||[]).filter(x=>typeof x==='string');
console.log('# флагове с „дав":', rf.filter(x=>/дав/i.test(x)).join(' · '));
console.log('# флагове с „удав":', rf.filter(x=>/удав/i.test(x)).join(' · ') || 'НИТО ЕДИН');
for (const т of ['давя го от водата','дави се','се дави','детето се дави','дави се във ваната','удави се','удави се във ваната'])
  console.log('  '+т.padEnd(24)+' → BL_REDFLAG: '+(!!W.BL_REDFLAG(т))+' | карта: '+(()=>{const e=W.BL_MATCH(т,'Здраве и SOS');return e?e.id+' («'+e.title+'»)':'няма';})());
