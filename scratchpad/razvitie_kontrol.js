const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const R='Развитие и игри';
const трябва=['кога сяда бебето','кога проходява','екрани','музиката','пълзене'];
const безсмислица=['бла бла зззз кврт','ипсилон марамбо дрън','xyzq wwww','плюмбус вертикулатор','ъъъ хм хм'];
console.log('=== ТРЯБВА ДА НАМЕРИ ===');
трябва.forEach(t=>{const r=A.BL_MATCH(t,R);console.log((r?'OK  ':'FAIL')+' | '+t+' -> '+(r?r.id+' | '+r.title:'ТИШИНА'));});
console.log('=== ТРЯБВА ДА Е ТИШИНА ===');
безсмислица.forEach(t=>{const r=A.BL_MATCH(t,R);console.log((r?'FAIL':'OK  ')+' | '+t+' -> '+(r?r.id+' | '+r.title:'ТИШИНА'));});
