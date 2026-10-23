// zn7b · кратък дебъг: кой отговаря и с какъв суров резултат (стажът в паметта). Нищо не пише.
// node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7b_dbg.js "въпрос1" "въпрос2" …
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync(process.env.ZN7B_STAZH || 'dev/nahodki/karti_zn7b.json', 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпка = kb => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  const блок = к => ['    {', '      id: ' + низ(к.id) + ', от: -9, до: 0, room: ' + низ(к.room) + ',', '      keys: [' + к.keys.map(низ).join(', ') + '],',
    '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',', '      follow: ' + низ(к.follow || '') + ',', '      chips: []', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
const W0 = zaredi(null), W1 = zaredi(null, { kbPatch: кръпка });
for (const т of process.argv.slice(2)) {
  for (const [име, W] of [['ДНЕС', W0], ['СЛЕД', W1]]) {
    let р = null; try { р = W.BL_MATCH(т, 'Бременност'); } catch (e) {}
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    const почти = (W.BL_MATCH && W.findEntry && W.findEntry.почти) || [];
    let фл = ''; try { фл = ' · флаг ' + JSON.stringify(W.BL_PREGFLAG ? W.BL_PREGFLAG(т) : null) + '/' + JSON.stringify(W.BL_REDFLAG ? W.BL_REDFLAG(т) : null); } catch (e) { фл = ' · флаг ГР'; }
    console.log(име + ' „' + т + '“ → ' + (з && з.id || 'ТИШИНА') + ' · скор ' + (W.BL_SKOR ? W.BL_SKOR() : '?') + ' · фраза ' + (W.BL_FRAZA ? W.BL_FRAZA() : '?') + фл);
  }
}
