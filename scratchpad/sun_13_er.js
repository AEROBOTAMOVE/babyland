'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const МБ='Моето бебе';
console.log('КАК СЕ ПИШЕ „ъ“ НА ЛАТИНИЦА — какво приема двигателят');
const набор=[
 ['рутина за сън',['rutina za san','rutina za sun','rutina za syn','rutina za sxn','rutina za sn','rutina za sŭn']],
 ['трябва ли пълна тъмнина',['tryabva li palna tamnina','tryabva li pulna tumnina','tryabva li pylna tymnina','triabva li palna tamnina']],
 ['режимът се обърка',['rezhimat se obarka','rezhimut se oburka','rezhimyt se obyrka']],
 ['със шапка ли да спи',['sas shapka li da spi','sus shapka li da spi','sys shapka li da spi','s shapka li da spi']],
];
for(const [кир,варианти] of набор){
 const b=A.BL_MATCH(кир,МБ);
 console.log('\nКИР «'+кир+'» → '+(b?b.id+' «'+b.title+'»':'ТИШИНА'));
 for(const v of варианти){const e=A.BL_MATCH(v,МБ);
  console.log('   '+(e?(e.id===(b&&b.id)?'✔ ':'≠ ')+e.id:'✘ ТИШИНА').padEnd(30)+' ← '+v);}
}
