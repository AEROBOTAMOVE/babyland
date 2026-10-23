// zn8a · разбор: кои варианти на въпроса хващат картата (стажът е само в паметта). Само чете.
// node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn8a_razbor.js "въпрос1 || въпрос2 ..."
'use strict';
const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..'); process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const СТАЖ = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn8a.json', 'utf8'));
const низ = s => "'" + String(s).replace(/\\/g, '\\\\') + "'";
const кръпка = kb => {
  const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  const КРАЙ = НР + '    }' + НР + '  ]' + НР + '};';
  const блок = к => ['    {', '      id: ' + низ(к.id) + ', от: ' + к.от + ', до: ' + к.до + ', room: ' + низ(к.room) + ',',
    '      keys: [' + к.keys.map(низ).join(', ') + '],', '      title: ' + низ(к.title) + ',', '      core: ' + низ(к.core) + ',',
    '      tip: ' + низ(к.tip) + ',', '      follow: ' + низ(к.follow || '') + ',', '      chips: [' + (к.chips || []).map(низ).join(', ') + ']', '    }'].join(НР);
  return kb.replace(КРАЙ, НР + '    },' + НР + СТАЖ.map(блок).join(',' + НР) + НР + '  ]' + НР + '};');
};
// по желание (ZN8A_GRESHKI=1) — кърпи helper.js САМО В ПАМЕТТА, за да видим грешка, която BL_MATCH поглъща
const кръпкаХ = process.env.ZN8A_GRESHKI ? src => src.replace(
  'window.BL_MATCH = (текст, стая) => { try { return findEntry(текст, стая) || null; } catch (e) { return null; } };',
  'window.BL_MATCH = (текст, стая) => { try { return findEntry(текст, стая) || null; } catch (e) { console.log("ГРЕШКА: " + (e && e.stack || e).toString().slice(0, 600)); return null; } };') : null;
const W1 = zaredi(кръпкаХ, { kbPatch: кръпка });
const стая = process.env.ZN8A_STAYA || 'Развитие и игри';
const въпроси = process.argv.slice(2).join(' ').split('||').map(s => s.trim()).filter(Boolean);
for (const т of въпроси) {
  let р; try { р = W1.BL_MATCH(т, стая); } catch (e) { р = null; }
  const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
  console.log('„' + т + '“ → ' + (з && з.id ? з.id : 'ТИШИНА'));
}
