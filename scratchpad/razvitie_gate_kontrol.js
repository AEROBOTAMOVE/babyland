const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});   // 10 м
const B=zaredi(null,{памет:{bl_baby:{birth:'2024-03-30'}}});   // 30 м
console.log('възраст A (мес):', A.BL_VAZRAST?A.BL_VAZRAST():'няма кука');
// контрол: въпрос, за който възрастта ТРЯБВА да промени реда
const тест=['гърне','кога се маха памперса','игри','инат','сортер','наужким','боички','кубчета'];
tест=null;
tест;
const R='Развитие и игри';
тест.forEach(q=>{
  const a=A.BL_MATCH(q,R), b=B.BL_MATCH(q,R);
  console.log((a&&b&&a.id===b.id?'=  ':'РАЗЛ')+' | '+q.padEnd(24)+' | 10м: '+(a?a.id:'ТИШИНА').padEnd(28)+' | 30м: '+(b?b.id:'ТИШИНА'));
});
