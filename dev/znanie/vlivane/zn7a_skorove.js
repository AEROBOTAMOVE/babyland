// zn7a · вижда ТОЧКИТЕ на първите 4 кандидата (helper.js се кърпи само в паметта, за да изнесе „близки“ със скора).
//   node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn7a_skorove.js [стаж.json] > изход
// Без запис в проекта.
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ_ПЪТ = process.argv[2] || 'dev/nahodki/karti_zn7a.json';
const СТАЖ = JSON.parse(fs.readFileSync(СТАЖ_ПЪТ, 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпкаКБ = kb => {
  const нр = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  const КРАЙ = нр + '    }' + нр + '  ]' + нр + '};';
  const блок = к => ['    {',
    '      id: ' + низ(к.id) + ',' + (к.от != null ? ' от: ' + к.от + ',' : '') + (к.до != null ? ' до: ' + к.до + ',' : '') + ' room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],',
    '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',', '      tip: ' + низ(к.tip) + ',',
    '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(нр);
  return kb.replace(КРАЙ, нр + '    },' + нр + СТАЖ.map(блок).join(',' + нр) + нр + '  ]' + нр + '};');
};
const ЦЕЛ = 'findEntry.почти = близки.slice(0, 3).map(x => x[1]);';
const кръпкаХ = hp => {
  if (hp.indexOf(ЦЕЛ) < 0) throw new Error('котвата в helper.js не е намерена');
  return hp.replace(ЦЕЛ, ЦЕЛ + ' window.__zn7a = близки.slice(0, 4).map(x => [Math.round(x[0] * 100) / 100, x[1].id]);');
};
const W = zaredi(кръпкаХ, { kbPatch: кръпкаКБ });
const ВЪПРОСИ = JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn7a_skorove_vaprosi.json', 'utf8'));
for (const [т, с] of ВЪПРОСИ) {
  W.__zn7a = null;
  let р; try { р = W.BL_MATCH(т, с); } catch (e) { р = null; }
  const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
  console.log('[' + с + '] „' + т + '“ → ' + (з && з.id ? з.id : 'ТИШИНА') + '   ' + JSON.stringify(W.__zn7a || []));
}
