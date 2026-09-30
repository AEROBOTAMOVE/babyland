// Мери дължината на статиите точно както dokade_sme.js ред 222:
//   (body.match(/[а-яА-Яa-zA-Z]+/g) || []).length > 700  →  "над 4 минути четене"
// САМО ЧЕТЕ. Изход: scratchpad/dulgi_out.json + таблица на екрана.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LIB = path.join(ROOT, 'lib');

const idx = JSON.parse(fs.readFileSync(path.join(LIB, 'index.json'), 'utf8'));
const статии = idx.items || [];

// същият филтър на файлове като в dokade_sme.js
const файлове = fs.readdirSync(LIB).filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json');
const тела = {};
const откъде = {};
let сблъсъци = 0;
for (const f of файлове) {
  const j = JSON.parse(fs.readFileSync(path.join(LIB, f), 'utf8'));
  for (const k of Object.keys(j)) {
    if (тела[k] !== undefined) сблъсъци++;
    тела[k] = j[k];
    откъде[k] = f;
  }
}

const думи = t => (String(t).match(/[а-яА-Яa-zA-Z]+/g) || []).length;
const мета = {};
for (const a of статии) мета[a.id] = a;

const всички = Object.keys(тела).filter(k => typeof тела[k] === 'string').map(k => {
  const t = тела[k];
  const m = мета[k] || {};
  return {
    id: k,
    файл: откъде[k],
    t: m.t || '(няма в index.json)',
    r: m.r || '',
    c: m.c || '',
    karta_lib: m.f || '',
    думи: думи(t),
    знаци: t.length,
    редове: t.split('\n').length,
    h2: (t.match(/^## /gm) || []).length,
    булети: (t.match(/^[-*] /gm) || []).length,
    в_index: !!мета[k]
  };
});

const над700 = всички.filter(x => x.думи > 700).sort((a, b) => b.думи - a.думи);
const над520 = всички.filter(x => x.думи > 520);
const над450 = всички.filter(x => x.думи > 450);

console.log('');
console.log('── УРЕДЪТ ВИЖДА ЛИ? (контрола) ──');
console.log('  файлове с тела        : ' + файлове.length);
console.log('  тела-низове общо      : ' + всички.length);
console.log('  статии в index.json   : ' + статии.length + '  (index.n = ' + idx.n + ')');
console.log('  id сблъсъци при сливане: ' + сблъсъци);
console.log('  тела БЕЗ ред в index  : ' + всички.filter(x => !x.в_index).length);
console.log('  редове в index БЕЗ тяло: ' + статии.filter(a => typeof тела[a.id] !== 'string').length);
console.log('');
console.log('── РАЗПРЕДЕЛЕНИЕ (законът: 380–450 думи, таван 520) ──');
console.log('  над 450 думи : ' + над450.length);
console.log('  над 520 думи : ' + над520.length + '   ← законът казва „за рязане"');
console.log('  над 700 думи : ' + над700.length + '   ← това брои dokade_sme.js като „над 4 минути"');
console.log('  най-дълга    : ' + (над700[0] ? над700[0].думи : 0) + ' думи');
console.log('  най-къса     : ' + Math.min(...всички.map(x => x.думи)) + ' думи');
// контролен случай, който ТРЯБВА да гръмне: праг 0 трябва да хване всички
const контрола = всички.filter(x => x.думи > 0).length;
console.log('  КОНТРОЛА праг>0 хваща : ' + контрола + '/' + всички.length + (контрола === всички.length ? '  ✅ уредът вижда' : '  ❌ уредът е сляп'));
console.log('');

console.log('── ' + над700.length + ' СТАТИИ НАД 700 ДУМИ, по дължина ──');
console.log('  #   думи  знаци  h2 бул  id               стая                заглавие');
над700.forEach((x, i) => {
  console.log('  ' + String(i + 1).padStart(2) + '  ' + String(x.думи).padStart(4) + ' ' +
    String(x.знаци).padStart(6) + '  ' + String(x.h2).padStart(2) + ' ' + String(x.булети).padStart(3) + '  ' +
    x.id.padEnd(16) + ' ' + String(x.r).padEnd(18).slice(0, 18) + '  ' + x.t);
});
console.log('');

fs.writeFileSync(path.join(__dirname, 'dulgi_out.json'), JSON.stringify({
  сумарно: {
    тела: всички.length, над450: над450.length, над520: над520.length, над700: над700.length,
    сблъсъци, безIndex: всички.filter(x => !x.в_index).length
  },
  над700
}, null, 1), 'utf8');
console.log('→ scratchpad/dulgi_out.json записан');
