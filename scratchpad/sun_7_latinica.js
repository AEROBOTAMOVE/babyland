'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const МБ='Моето бебе';
const пари=[
 ['kak da go priucha da spi samo','как да го приуча да спи само'],
 ['ne spi prez noshtta','не спи през нощта'],
 ['budi se po 5 pati na nosht','буди се по 5 пъти на нощ'],
 ['ljulka ili krevatche koe e po dobre','люлка или креватче кое е по-добре'],
 ['kolko trqbva da spi bebeto','колко трябва да спи бебето'],
 ['spi samo na race','спи само на ръце'],
];
for(const [лат,кир] of пари){
 const a=A.BL_MATCH(лат,МБ), b=A.BL_MATCH(кир,МБ);
 console.log('ЛАТ '+(a?a.id+' «'+a.title+'»':'ТИШИНА').padEnd(56)+' | КИР '+(b?b.id+' «'+b.title+'»':'ТИШИНА'));
 console.log('    '+лат+'  ||  '+кир);
}
