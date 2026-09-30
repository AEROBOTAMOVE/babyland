const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {zaredi,ROOT}=require(path.join(__dirname,'..','dev','pyasachnik.js'));
const P=path.join(ROOT,'js/helper.js'),S=fs.readFileSync(P,'utf8');
console.log('# md5:',crypto.createHash('md5').update(S).digest('hex'));
const A='const сцен = (function () {',B='\n        })();';
const i=S.indexOf(A),j=S.indexOf(B,i),т=S.slice(i+A.length,j);
const K='  window.BL_REDFLAG = isRedFlag;';
const W=zaredi(s=>s.replace(K,K+'\n  window.__СЦЕН=function(text){'+т+'\n};\n'),{памет:{bl_baby:{birth:'2025-11-20'}}});
if(W.__СЦЕН('задави се')!=='zadavi')throw new Error('сляп');
const R=fs.readFileSync(path.join(ROOT,'js/rooms6.js'),'utf8');const ИМА=new Map();let m;
const rx=/\{\s*id:\s*'([a-z]+)',\s*e:\s*'([^']*)',\s*t:\s*'([^']*)'/g;while((m=rx.exec(R)))ИМА.set(m[1],m[3]);
const списък=['падна в басейна','падна в кофата с вода','удави се във ваната','потъна във ваната',
 'беше под водата','намерих го под водата','остана под водата','беше с лицето във водата',
 'главата му потъна','дави се във ваната','дави се в басейна','нагълта вода в басейна',
 'извадих го от водата','изпуснах бебето','изпуснах го на пода','изтървах го от масата',
 'не можах да го събудя','немога да го събудя','не мога да го събудя'];
for(const x of списък){
 const rf=!!W.BL_REDFLAG(x),mf=!!(W.BL_MOTHERFLAG&&W.BL_MOTHERFLAG(x,'Здраве и SOS')),с=W.__СЦЕН(x);
 const ст=rf&&!mf&&с&&с!=='poglatnat'&&ИМА.has(с);
 console.log((ст?'🚑':'❌')+' '+x.padEnd(30)+' флаг:'+(rf?'ДА':'не')+' сцен:'+String(с).padEnd(8)+' дава хватки за: '+(ИМА.get(с)||'—'));
}
