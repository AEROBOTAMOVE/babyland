// 20.11 · ОДИТ НА ЖИВОТО: свършеното днес/вчера наистина ли е на живия адрес? Само четене (fetch), нищо не пише.
// ПУСКАНЕ: node dev/proba/odit_zhivo.js [адрес]   → ✅/🔴 по редове + „ОДИТ: N/M“.
const fs = require('fs'); const path = require('path');
const А = (process.argv[2] || 'https://babyland.aaeromove.workers.dev').replace(/\/$/, '');
const ПР = path.join(__dirname, '..', '..');
const вземи = async п => { const r = await fetch(А + '/' + п + (п.includes('?') ? '&' : '?') + 'odit=' + Date.now()); return r.ok ? r.text() : ''; };
(async () => {
  const idx = await вземи('index.html');
  const вер = f => (new RegExp(f.replace(/[.]/g, '\\.') + '\\?v=(\\d+)').exec(idx) || [])[1];
  const kb = await вземи('js/kb.js?v=' + вер('js/kb.js'));
  const libjs = await вземи('js/lib.js?v=' + вер('js/lib.js'));
  const LV = (/const LV\s*=\s*'(\d+)'/.exec(libjs) || [])[1];
  const libФ = fs.readdirSync(path.join(ПР, 'lib')).filter(f => /\.json$/.test(f));
  let lib = ''; for (const f of libФ) lib += await вземи('lib/' + f + '?v=' + LV);
  const sw = await вземи('sw.js');
  const ch = await вземи('js/chasovnik.js?v=' + вер('js/chasovnik.js'));
  const r16 = await вземи('js/rooms16.js?v=' + вер('js/rooms16.js'));
  const r3 = await вземи('js/rooms3.js?v=' + вер('js/rooms3.js'));
  const hl = await вземи('js/helper.js?v=' + вер('js/helper.js'));
  const fcss = await вземи('css/fonts.css?v=' + вер('css/fonts.css'));
  const редове = []; const п = (име, ок, д) => редове.push((ок ? '✅ ' : '🔴 ') + име + (д ? ' — ' + д : ''));
  п('версия', true, (/babyland-v\d+/.exec(sw) || ['?'])[0] + ' · kb ?v=' + вер('js/kb.js') + ' · LV ' + LV);
  п('знанието е там', kb.length > 1e6, (kb.length / 1e6).toFixed(2) + ' MB');
  // 1) 17-те поправени факта от 18.11: старият цитат НЕ трябва да е на живо (нито в kb, нито в статиите)
  const ф1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'FAKTI_POTVARDENI_18-11.json'), 'utf8'));
  // ЦЕЛИЯТ цитат — началото често остава и в поправката
  let ост = []; for (const f of ф1) { const q = f.quote.replace(/^[„"]|[“"]$/g, '').trim(); if (q.length > 15 && (kb.includes(q) || lib.includes(q))) ост.push(f.id); }
  п('17-те факта от 18.11 — старите цитати ги няма', !ост.length, ост.length ? 'още на живо: ' + ост.join(', ') : ф1.length + ' проверени');
  for (const ф2п of fs.readdirSync(__dirname).filter(f => /^FAKTI_POTVARDENI_\d+_.*\.json$/.test(f)).map(f => path.join(__dirname, f))) {
    const ф2 = JSON.parse(fs.readFileSync(ф2п, 'utf8')); const о2 = [];
    for (const f of ф2) { const q = f.quote.replace(/^[„"]|[“"]$/g, '').trim(); if (q.length > 15 && (kb.includes(q) || lib.includes(q))) о2.push(f.id); }
    п(path.basename(ф2п) + ' — старите цитати ги няма', !о2.length, о2.length ? 'още на живо: ' + о2.join(', ') : ф2.length + ' проверени');
  }
  // 2) остатъчни стари грешки (широки варианти)
  for (const [име, x] of [['„няколко литра“ кръв', /няколко литра повече/], ['„за сън се маха един“', /за сън се маха един/], ['540 °C', /540\s?°/]]) { const н = (kb + lib).match(new RegExp(x, 'g')); п(име + ' го няма', !н, н ? н.length + ' пъти' : ''); }
  // 3) нови неща
  п('карта „пробиване на уши“', kb.includes('mb-probivane-ushi'));
  п('„около литър и половина“', /около литър и половина/.test(kb + lib));
  // 4) марки и лева в инструментите
  п('без „Нурофен“/„Панадол“ в „Преди колко време?“', !/Нурофен|Панадол|Ефералган/.test(ch) && /Ибупрофен/.test(ch));
  п('разходи и цели в €', !/лв<\/strong>|' лв\)|' лв\?|\} лв ·|' лв отгоре/.test(r16 + r3 + hl), '');
  // 5) шрифтовете — един файл за всички тегла
  п('шрифтове без дублиращи файлове', !/nunito-(400|600|800)-(latin|cyrillic)|comfortaa-(400|600)-/.test(fcss + idx), (fcss.match(/fonts\/[\w-]+\.woff2/g) || []).filter((x, i, a) => a.indexOf(x) === i).length + ' уникални в fonts.css');
  // 6) V2 е върнат (29-те скрипта на място), знанието async
  п('без <template id="blPosle">', !idx.includes('id="blPosle"'));
  п('kb.js async от началото', /<script src="js\/kb\.js\?v=\d+" async/.test(idx));
  console.log(редове.join('\n'));
  const ок = редове.filter(x => x.startsWith('✅')).length; console.log('\nОДИТ: ' + ок + '/' + редове.length);
})();
