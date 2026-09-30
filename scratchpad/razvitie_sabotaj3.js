// КОНТРОЛ 3 (бърз): СЪЩИЯТ сравняващ цикъл, но върху 30 ключа на rz-sedene,
// след като ѝ изтрия ключовете. Уред, който тук каже 0, е сляп.
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
function патч(src){
  const м=src.indexOf("id: 'rz-sedene'");
  const кп=src.indexOf('keys: [',м), край=src.indexOf(']',кп);
  return src.slice(0,кп)+"keys: ['зззз-нищо-няма-такова']"+src.slice(край+1);
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
const преди=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='rz-sedene');
const след =(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='rz-sedene');
console.log('контрол: rz-sedene ключове '+преди.keys.length+' -> '+след.keys.length);
let n=0,счупени=[];
преди.keys.slice(0,30).forEach(k=>{
  if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
  if((a?a.id:null)!==(b?b.id:null))счупени.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
});
console.log('проверени: '+n+' · ПРОМЕНЕНИ: '+счупени.length);
счупени.slice(0,6).forEach(s=>console.log('  '+s));
console.log(счупени.length>0?'\n✓ СЪЩИЯТ ЦИКЪЛ ВИЖДА ПРОМЯНА — нулата от истинския патч значи нещо':'\n✗ ЦИКЪЛЪТ Е СЛЯП');
