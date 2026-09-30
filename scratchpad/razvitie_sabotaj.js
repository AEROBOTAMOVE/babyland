// КОНТРОЛ НА УРЕДА ЗА РЕГРЕСИЯ: нарочно счупвам нещо и гледам дали уредът вижда.
// Ако „променени: 0" и след саботажа — уредът е мъртъв и нулата отгоре е лъжа.
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const САБОТАЖ={"rz-ekran":["кога сяда","пълзенето","първите стъпки","музиката","кога проходява","гърнето"]};
function патч(src){
  for(const [id,кл] of Object.entries(САБОТАЖ)){
    let м=src.indexOf("id: '"+id+"'"); if(м<0)м=src.indexOf('id: "'+id+'"');
    const кп=src.indexOf('keys: [',м), вст=кп+'keys: ['.length;
    src=src.slice(0,вст)+кл.map(k=>"'"+k+"', ").join('')+src.slice(вст);
  }
  return src;
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
console.log('контрол: rz-ekran ключове '+(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='rz-ekran').keys.length+' -> '+(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='rz-ekran').keys.length);
const ent=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===R);
let n=0,счупени=[];
ent.forEach(e=>e.keys.forEach(k=>{
  if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
  if((a?a.id:null)!==(b?b.id:null))счупени.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
}));
console.log('проверени ключа: '+n+' · ПРОМЕНЕНИ: '+счупени.length);
счупени.slice(0,12).forEach(s=>console.log('  '+s));
console.log(счупени.length>0?'\n✓ УРЕДЪТ ВИЖДА — нулата от истинския патч значи нещо':'\n✗ УРЕДЪТ Е СЛЯП — нулата не значи нищо');
