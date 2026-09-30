// Колко ключа в стаята НЯМАТ прошка за вмъкната клитика (n<2 || n>5)
const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const ent=(A.BL_KB||A.KB).entries.filter(e=>e.room==='Развитие и игри');
let фрази=0,вОбхват=0,извън=0;
ent.forEach(e=>e.keys.forEach(k=>{
  const n=String(k).trim().split(/\s+/).length;
  if(n<2)return; фрази++;
  if(n>=2&&n<=5)вОбхват++; else извън++;
}));
console.log('многодумни ключа в стаята: '+фрази);
console.log('  с прошка за клитика (2–5 думи): '+вОбхват);
console.log('  БЕЗ прошка (над 5 думи):        '+извън+'  ('+(100*извън/фрази).toFixed(1)+'%)');
// контрол: прошката работи ли за 3-думен ключ
console.log('\nКОНТРОЛ на прошката:');
[['води ме за ръка вместо да ми каже какво иска','7-думен ключ'],
 ['хваща ми ръката и ме води','5-думен, без вмъкване']].forEach(([q,и])=>{
  const r=A.BL_MATCH(q,'Развитие и игри');
  console.log('  '+(r?r.id:'ТИШИНА').padEnd(24)+' | '+и+' | '+q);
});
