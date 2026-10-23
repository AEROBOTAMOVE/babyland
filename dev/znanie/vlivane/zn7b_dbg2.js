// zn7b · дебъг 2: за всеки въпрос — първите кандидати с резултат, meaty, темаMeaty и улучените ключове.
// helper.js се кърпи САМО В ПАМЕТТА (събира следа), стажът karti_zn7b.json — също. Нищо не пише.
// node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7b_dbg2.js [--bez-staj] "въпрос1" "въпрос2" …
// ZN7B_KLYUCHOVE=файл.json → добавя предложени ключове към съществуващи карти (също в паметта).
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync(process.env.ZN7B_STAZH || 'dev/nahodki/karti_zn7b.json', 'utf8'));
const КЛ = process.env.ZN7B_KLYUCHOVE ? process.env.ZN7B_KLYUCHOVE.split(',').reduce((о, ф) => { for (const [и, к] of Object.entries(JSON.parse(fs.readFileSync(ф, 'utf8')))) о[и] = (о[и] || []).concat(к); return о; }, {}) : {};
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const БЕЗ = process.argv.includes('--bez-staj');
const кръпкаKB = kb => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  // предложени ключове към чужди карти
  for (const [id, нови] of Object.entries(КЛ)) {
    const Ls = kb.split(НР); const i = Ls.findIndex(x => x.indexOf("id: '" + id + "'") > -1);
    if (i < 0) throw new Error('няма карта ' + id);
    let j = i; while (j < Ls.length && Ls[j].indexOf('keys: [') < 0) j++;
    Ls[j] = Ls[j].replace('keys: [', 'keys: [' + нови.map(низ).join(', ') + ', ');
    kb = Ls.join(НР);
  }
  if (БЕЗ) return kb;
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  const блок = к => ['    {',
    '      id: ' + низ(к.id) + ',' + (к.от != null ? ' от: ' + к.от + ',' : '') + (к.до != null ? ' до: ' + к.до + ',' : '') + ' room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],',
    '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',',
    '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
const заместа = (src, от, до) => { if (src.split(от).length !== 2) throw new Error('кръпката не е еднозначна: ' + от.slice(0, 50)); return src.replace(от, до); };
const кръпкаH = hp => {
  hp = заместа(hp, 'const коренДаден = new Set();', 'const коренДаден = new Set(); const __хит = [];');
  hp = заместа(hp, 'if (улучва) {\n', 'if (улучва) { __хит.push(nk);\n');
  hp = заместа(hp, '      if (score > bestScore) { bestScore = score;',
    '      if (globalThis.__DBG && score > 0) globalThis.__DBG.push({ id: e.id, room: e.room, score: +score.toFixed(2), без: +безВъзраст.toFixed(2), meaty, темаMeaty, хит: __хит.slice() });\n      if (score > bestScore) { bestScore = score;');
  return hp;
};
const hpТекст = fs.readFileSync('js/helper.js', 'utf8');
const КОРЕН_Х = process.env.ZN7B_KOREN ? require('./zn7b_koren_kryapka.js').izberi(process.env.ZN7B_KOREN) : (x => x);
const кръпкаH2 = hp => кръпкаH(КОРЕН_Х(hp).split('\r\n').join('\n'));
void hpТекст;
const W = zaredi(кръпкаH2, { kbPatch: кръпкаKB });
const въпроси = process.argv.slice(2).filter(x => x !== '--bez-staj');
for (const т of въпроси) {
  W.__DBG = [];
  let р = null; try { р = W.BL_MATCH(т, 'Бременност'); } catch (e) { }
  const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
  const сл = W.__DBG.slice().sort((a, b) => b.score - a.score).slice(0, 6);
  console.log('❓ „' + т + '“ → ' + (з && з.id || 'ТИШИНА'));
  for (const к of сл) console.log('    ' + к.score + ' (без ' + к.без + ') m' + к.meaty + ' т' + к.темаMeaty + '  ' + к.id + ' [' + к.room + ']  ' + к.хит.map(x => '«' + x + '»').join(' '));
}
