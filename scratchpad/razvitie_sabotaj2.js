// КОНТРОЛ 2: изтривам ключовете на rz-sedene. Ако уредът вижда, 38-те ѝ ключа
// трябва да спрат да я намират. Ако пак каже 0 — уредът е сляп.
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
function патч(src){
  const м=src.indexOf("id: 'rz-sedene'");
  const кп=src.indexOf('keys: [',м);
  const край=src.indexOf(']',кп);
  return src.slice(0,кп)+"keys: ['зззз-нищо-няма-такова']"+src.slice(край+1);
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
console.log('контрол: rz-sedene ключове '+(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='rz-sedene').keys.length+' -> '+(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='rz-sedene').keys.length);
const ent=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===R);
let n=0,счупени=[];
ent.forEach(e=>e.keys.forEach(k=>{
  if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
  if((a?a.id:null)!==(b?b.id:null))счупени.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
}));
console.log('проверени ключа: '+n+' · ПРОМЕНЕНИ: '+счупени.length);
счупени.slice(0,8).forEach(s=>console.log('  '+s));
console.log(счупени.length>0?'\n✓ УРЕДЪТ ВИЖДА':'\n✗ УРЕДЪТ Е СЛЯП');
