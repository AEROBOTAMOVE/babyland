// Вади телата на най-дългите N статии в отделни .txt + скелета (h2 + думи под всяко h2)
// и КОИ КАРТИ сочат към тях (важно за „разделяне на две").  САМО ЧЕТЕ.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LIB = path.join(ROOT, 'lib');
const N = Number(process.argv[2] || 10);

const out = JSON.parse(fs.readFileSync(path.join(__dirname, 'dulgi_out.json'), 'utf8'));
const тела = {};
for (const f of fs.readdirSync(LIB).filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(тела, JSON.parse(fs.readFileSync(path.join(LIB, f), 'utf8')));

const { zaredi } = require(path.join(ROOT, 'dev/pyasachnik.js'));
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const K = (W.BL_KB || W.KB).entries;

const думи = t => (String(t).match(/[а-яА-Яa-zA-Z]+/g) || []).length;
const скелет = t => {
  const редове = String(t).split('\n');
  const части = []; let сег = { h: '(преди първото ## )', txt: [] };
  for (const р of редове) {
    if (/^##\s/.test(р)) { части.push(сег); сег = { h: р.replace(/^##\s*/, ''), txt: [] }; }
    else сег.txt.push(р);
  }
  части.push(сег);
  return части.filter(c => c.h !== '(преди първото ## )' || думи(c.txt.join(' ')) > 0)
    .map(c => ({ h: c.h, думи: думи(c.txt.join(' ')), булети: c.txt.filter(r => /^\s*[-*]\s/.test(r)).length }));
};

const дир = path.join(__dirname, 'dulgi_tela');
if (!fs.existsSync(дир)) fs.mkdirSync(дир);

const резюме = [];
out.над700.slice(0, N).forEach((x, i) => {
  const t = тела[x.id];
  const карти = K.filter(z => {
    const l = z.lib;
    if (!l) return false;
    return Array.isArray(l) ? l.includes(x.id) : l === x.id;
  }).map(z => z.id + ' · ' + (z.title || '') + ' [' + z.room + ']');
  fs.writeFileSync(path.join(дир, String(i + 1).padStart(2, '0') + '_' + x.id + '.txt'),
    '### ' + x.t + '\n### стая: ' + x.r + ' | раздел: ' + x.c + ' | думи: ' + x.думи + ' | файл: ' + x.файл +
    '\n### карти сочещи тук (' + карти.length + '): ' + (карти.join(' ; ') || 'НИКОЯ') + '\n\n' + t, 'utf8');
  const с = скелет(t);
  резюме.push({ n: i + 1, id: x.id, t: x.t, r: x.r, c: x.c, думи: x.думи, карти: карти.length, картиСписък: карти, скелет: с });
  console.log('');
  console.log('══ ' + (i + 1) + '. ' + x.t + '  [' + x.думи + ' думи · ' + x.r + ' · ' + x.c + ']');
  console.log('   карти сочещи тук: ' + карти.length + (карти.length ? '  → ' + карти.join(' ; ') : ''));
  for (const s of с) console.log('     ' + String(s.думи).padStart(4) + ' д · ' + String(s.булети).padStart(3) + ' бул · ## ' + s.h);
});
fs.writeFileSync(path.join(__dirname, 'dulgi_skelet.json'), JSON.stringify(резюме, null, 1), 'utf8');
console.log('');
console.log('→ scratchpad/dulgi_tela/*.txt и scratchpad/dulgi_skelet.json');
