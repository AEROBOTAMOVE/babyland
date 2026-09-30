'use strict';
// Върху ЖИВАТА база (10:48, вече с моите ключове): само премествания, нищо добавено.
const path=require('path'),fs=require('fs');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const ПРЕМ=JSON.parse(fs.readFileSync(path.join(__dirname,'premestvane_sun.json'),'utf8'));
function зар(премести){
 const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
 const KB=A.BL_KB||A.KB,поId=new Map(KB.entries.map(e=>[e.id,e]));
 if(премести) for(const {от,към,ключове} of ПРЕМ){
  const a=поId.get(от),b=поId.get(към); if(!a)continue;
  a.keys=(a.keys||[]).filter(k=>!ключове.includes(k));
  if(b)b.keys=(b.keys||[]).concat(ключове.filter(k=>!(b.keys||[]).includes(k)));}
 return A;
}
const проби=[
 ['буди се щом го сложа долу защо','x1-slagane-bez-budene'],
 ['пищи като го слагам да спи','x1-slagane-bez-budene'],
 // КОНТРОЛИ: тези НЕ бива да се развалят
 ['колко трябва да спи бебето','mb-san'],
 ['поти се докато спи','sn-potene'],
 ['потна главичка сутрин','sn-potene'],
 ['стеснява се от чужди хора','mb5-strah-nepoznati'],
 ['катери се от кошарата','sn-detsko-leglo'],
 ['дърпа се от гърдата','mb-otkaz-gyrda'],
];
const A0=зар(false),A1=зар(true);
console.log('ЖИВА БАЗА: без премествания → с премествания   (очаквано)');
for(const [q,оч] of проби){
 const a=A0.BL_MATCH(q,'Моето бебе'),b=A1.BL_MATCH(q,'Моето бебе');
 const з=x=>(x&&x.id===оч)?'✔':'✗';
 console.log('  '+з(a)+' '+(a?a.id:'ТИШИНА').padEnd(24)+' → '+з(b)+' '+(b?b.id:'ТИШИНА').padEnd(24)+'  ('+оч+')\n      ← '+q);}
