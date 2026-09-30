'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const МБ='Моето бебе';
console.log('ХИПОТЕЗА: „iu“ се чете като „ю“, не като „иу“.');
const т=[
 ['kak da go priucha da spi samo','iu'],
 ['kak da go priiucha da spi samo','ii+u'],
 ['kak da go pri ucha da spi samo','раздел.'],
 ['kak da go prucha da spi samo','без i'],
 ['ritualat predi san','iu'],
 ['ritualyt predi san','iu'],
 ['noshtni sabuzhdania','правилно sht'],
 ['nostni sabuzhdania','грешно st'],
 ['tumno ili s lampa','ъ→u'],
 ['tamno ili s lampa','ъ→a'],
];
for(const [q,бел] of т){const e=A.BL_MATCH(q,МБ);
 console.log('  '+(e?e.id+' «'+e.title+'»':'ТИШИНА').padEnd(58)+' ['+бел+'] ← '+q);}
