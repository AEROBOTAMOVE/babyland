// ═══════════════════════════════════════════════════════════
// 🎂 МЕРАЧ НА ВЪЗРАСТТА — снимка ПРЕДИ / снимка СЛЕД
//
// ЗАЩО СЪЩЕСТВУВА: полетата `от`/`до` НЕ режат — те само подреждат
//   (×0.55 при несъответствие, ×1.15 при съвпадение), а прагът „има ли
//   изобщо отговор" се съди БЕЗ множителя. Значи новото поле не може да
//   създаде тишина по устройство… НО може да смени КОЙ печели. Точно това
//   мери този уред.
//
// 🔑 КАПАНЪТ, който прави всяка друга мярка безполезна: в пясъчника няма
//   рождена дата, затова `възрастМесеци()` връща null и полетата са
//   ИНЕРТНИ. Уред без подмяна на възрастта ще обяви „нула промяна" за
//   промяна, която мени всичко. Затова тук възрастта се ПОДМЕНЯ в тялото
//   на функцията и котвата се проверява изрично.
//
// ⏱ ЕДИН МАЧ Е ~55 ms. 1800 въпроса × 6 възрасти = 11 000 мача = 10 минути
//   в един процес. Затова всяка възраст се смята в СОБСТВЕН процес.
//
// ПУСКАНЕ:
//   node dev/vazrast_mer.js predi   → записва снимката в dev/vazrast_mer.json
//   node dev/vazrast_mer.js sled    → сравнява с записаната снимка
//
// ПЪТ НАЗАД: уредът само ЧЕТЕ js/kb.js. Пише единствено своя .json.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

const КОТВА = 'function възрастМесеци() {';
function сВъзраст(м) {
  return текст => {
    if (текст.indexOf(КОТВА) < 0) throw new Error('НЯМА функция възрастМесеци — уредът мери нещо друго');
    return текст.replace(КОТВА, КОТВА + '\n    return ' + (м === null ? 'null' : м) + ';');
  };
}

// -4 = бременна (полетата на Бременност са отрицателни: от:-9 до:0)
const ВЪЗРАСТИ = [null, -4, 1, 8, 18, 36];

function въпроси() {
  const сп = [], видени = new Set();
  const добави = (т, с, спешно) => {
    if (!т || !с) return;
    const к = т + '|' + с;
    if (видени.has(к)) return;
    видени.add(к);
    сп.push({ t: т, r: с, sos: !!спешно });
  };
  for (const x of JSON.parse(fs.readFileSync(path.join(ROOT, 'dev/korpus350.json'), 'utf8')))
    добави(x.t, x.r, x.e === 'SPESHNO');
  for (const x of JSON.parse(fs.readFileSync(path.join(ROOT, 'dev/korpus_speshni.json'), 'utf8')))
    добави(x.t, x.r, true);
  for (const f of ['dev/vaprosi_nezavisimi.json', 'dev/vaprosi_nezavisimi2.json'])
    for (const x of JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) добави(x.v, x.r, false);
  const т = fs.readFileSync(path.join(ROOT, 'dev/tarsene_bez_otgovor.js'), 'utf8');
  const Р = /\[\s*'([^']{6,90})'\s*,\s*'([^']{3,30})'\s*\]/g;
  let m;
  while ((m = Р.exec(т))) добави(m[1], m[2], false);
  return сп;
}

// ═══ РЕЖИМ РАБОТНИК ═══════════════════════════════════════════
if (process.argv[2] === '__rabotnik') {
  const { zaredi } = require(path.join(ROOT, 'dev/pyasachnik.js'));
  const м = process.argv[3] === 'null' ? null : Number(process.argv[3]);
  const ВЪПРОСИ = въпроси();
  const W = zaredi(сВъзраст(м));
  const питай = (т, с) => {
    try {
      const р = W.BL_MATCH(т, с);
      const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
      return з && з.id ? з.id : 'ТИШИНА';
    } catch (e) { return 'ГРЕШКА'; }
  };
  const кол = ВЪПРОСИ.map(q => питай(q.t, q.r));
  // 🔑 ВТОРА МЯРКА — САМОНАМИРАНЕ. Всяка карта се пита с ПЪРВИЯ си ключ.
  //   Корпусът от въпроси покрива само темите, за които някой се е сетил;
  //   тази мярка покрива ВСИЧКИТЕ 750 карти и лови точно това, което
  //   възрастта може да направи — една карта да открадне въпроса на друга.
  const сам = W.KB.entries.map(x => {
    const к = (x.keys && x.keys[0]) || x.title;
    return питай(к, x.room) === x.id ? 1 : 0;
  });
  fs.writeFileSync(path.join(__dirname, '.vazrast_kol_' + process.argv[3] + '.json'),
    JSON.stringify({ кол, сам, идове: W.KB.entries.map(x => x.id) }));
  process.exit(0);
}

// ═══ РЕЖИМ ГЛАВЕН ═════════════════════════════════════════════
const ВЪПРОСИ = въпроси();
const ФАЙЛ = path.join(__dirname, 'vazrast_mer.json');
const режим = (process.argv[2] || '').toLowerCase();

function снимка(готово) {
  const кадри = {}, самите = {}, идове = {};
  let чака = ВЪЗРАСТИ.length;
  const старт = Date.now();
  for (const м of ВЪЗРАСТИ) {
    const ключ = String(м);
    const c = fork(__filename, ['__rabotnik', ключ], { stdio: 'inherit' });
    c.on('exit', код => {
      if (код !== 0) { console.log('   🔴 работникът за възраст ' + ключ + ' падна (код ' + код + ')'); process.exit(1); }
      const п = path.join(__dirname, '.vazrast_kol_' + ключ + '.json');
      const д = JSON.parse(fs.readFileSync(п, 'utf8'));
      кадри['в' + м] = д.кол; самите['в' + м] = д.сам; идове['в' + м] = д.идове;
      fs.unlinkSync(п);
      process.stdout.write('   · възраст ' + ключ + ' готова (' + ((Date.now() - старт) / 1000).toFixed(0) + 's)\n');
      if (--чака === 0) готово(кадри, самите, идове);
    });
  }
}

// проверката „възрастта наистина ли влияе" се смята ОТ САМАТА снимка —
// без втори скъп проход.
function влияе(кадри) {
  let р = 0;
  const a = кадри['в1'] || кадри['в8'], b = кадри['в36'];
  for (let i = 0; i < ВЪПРОСИ.length; i++) if (a[i] !== b[i]) р++;
  return р;
}

console.log('');
console.log('🎂 МЕРАЧ НА ВЪЗРАСТТА · ' + ВЪПРОСИ.length + ' въпроса × ' + ВЪЗРАСТИ.length + ' възрасти');
console.log('');

// котвата се проверява ВЕДНАГА в главния процес: ако функцията се
// преименува, уредът трябва да гръмне, а не тихо да мери приложение
// без възраст.
try {
  сВъзраст(1)(fs.readFileSync(path.join(ROOT, 'js/helper.js'), 'utf8'));
  console.log('   ✅ котвата „възрастМесеци" е налице');
} catch (e) { console.log('   🔴 ' + e.message); process.exit(1); }

if (режим === 'predi') {
  снимка((кадри, самите, идове) => {
    const р = влияе(кадри);
    console.log('   ' + (р > 0 ? '✅' : '🔴') + ' възрастта ВЛИЯЕ: ' + р + ' разлики между 1 и 36 мес.');
    fs.writeFileSync(ФАЙЛ, JSON.stringify({ въпроси: ВЪПРОСИ, кадри, самите, идове }, null, 0));
    console.log('   💾 снимка ПРЕДИ · ' + кадри['вnull'].filter(x => x === 'ТИШИНА').length + ' тишини при неизвестна възраст');
    for (const м of ВЪЗРАСТИ) console.log('      самонамиране в' + м + ': ' + самите['в' + м].filter(Boolean).length + '/' + самите['в' + м].length);
    console.log('');
  });
} else if (режим === 'sled') {
  if (!fs.existsSync(ФАЙЛ)) { console.log('   🔴 няма снимка ПРЕДИ\n'); process.exit(2); }
  const стар = JSON.parse(fs.readFileSync(ФАЙЛ, 'utf8'));
  if (стар.въпроси.length !== ВЪПРОСИ.length) { console.log('   🔴 корпусът се е сменил\n'); process.exit(2); }
  снимка((нов, самите, идове) => {
    const р = влияе(нов);
    console.log('   ' + (р > 0 ? '✅' : '🔴') + ' възрастта ВЛИЯЕ: ' + р + ' разлики между 1 и 36 мес.');
    console.log('');
    console.log('   възраст   смени отговор   НОВА ТИШИНА   спешни мръднали');
    console.log('   ' + '─'.repeat(58));
    let червено = 0;
    const дневник = [];
    for (const м of ВЪЗРАСТИ) {
      const k = 'в' + м, a = стар.кадри[k], b = нов[k];
      let смени = 0, тишина = 0, сос = 0;
      const пример = [], тиши = [], соси = [];
      ВЪПРОСИ.forEach((q, i) => {
        if (a[i] === b[i]) return;
        смени++;
        if (пример.length < 8) пример.push(q.t + ' :: ' + a[i] + ' → ' + b[i]);
        if (b[i] === 'ТИШИНА' && a[i] !== 'ТИШИНА') { тишина++; тиши.push(q.t + ' (беше ' + a[i] + ')'); }
        if (q.sos) { сос++; соси.push(q.t + ' :: ' + a[i] + ' → ' + b[i]); }
      });
      if (тишина || сос) червено++;
      console.log('   ' + (тишина || сос ? '🔴' : '✅') + ' ' + String(м === null ? 'няма' : м + ' м.').padEnd(8) +
        String(смени).padStart(9) + String(тишина).padStart(14) + String(сос).padStart(17));
      дневник.push({ възраст: м, смени, тишина, сос, тиши, соси, пример });
    }
    console.log('');
    for (const d of дневник) {
      if (!d.смени) continue;
      console.log('   ── ' + (d.възраст === null ? 'без възраст' : d.възраст + ' месеца') + ' ──');
      for (const x of d.тиши.slice(0, 15)) console.log('      🔇 ЗАНЕМЯ: ' + x);
      for (const x of d.соси.slice(0, 15)) console.log('      🚨 СПЕШЕН мръдна: ' + x);
      if (!d.тишина && !d.сос) for (const x of d.пример) console.log('      · ' + x);
      console.log('');
    }
    // ── ВТОРА МЯРКА: самонамирането по всичките 750 карти ──
    console.log('   ── самонамиране (всяка карта, питана с първия си ключ) ──');
    let загубени = 0;
    for (const м of ВЪЗРАСТИ) {
      const k = 'в' + м;
      const a = стар.самите && стар.самите[k], b = самите[k];
      if (!a) { console.log('      ⚪ ' + k + ': старата снимка няма тази мярка'); continue; }
      const аИд = стар.идове[k], бИд = идове[k];
      const бе = {}, е = {};
      аИд.forEach((id, i) => бе[id] = a[i]);
      бИд.forEach((id, i) => е[id] = b[i]);
      const паднали = Object.keys(бе).filter(id => бе[id] === 1 && е[id] === 0);
      загубени += паднали.length;
      console.log('      ' + (паднали.length ? '🔴' : '✅') + ' ' + String(м === null ? 'няма' : м + ' м.').padEnd(7) +
        ' намират себе си: ' + b.filter(Boolean).length + '/' + b.length +
        (паднали.length ? '   ЗАГУБИЛИ СЕБЕ СИ: ' + паднали.join(', ') : ''));
    }
    console.log('');
    fs.writeFileSync(path.join(__dirname, 'vazrast_mer_dnevnik.json'), JSON.stringify(дневник, null, 1));
    if (червено || загубени) { console.log('   🔴 РЕГРЕСИЯ — върни партидата\n'); process.exit(1); }
    // ✅ зелено → снимката СЛЕД става новата основа, за да струва
    //   следващата партида един проход, а не два. Нулевата основа е
    //   запазена отделно в vazrast_mer.NULEVA.json за крайната сверка.
    fs.writeFileSync(ФАЙЛ, JSON.stringify({ въпроси: ВЪПРОСИ, кадри: нов, самите, идове }, null, 0));
    console.log('   ✅ нула нови тишини, нула мръднали спешни, нула загубили себе си · основата е преместена\n');
  });
} else {
  console.log('   употреба: node dev/vazrast_mer.js predi|sled\n');
  process.exit(2);
}
