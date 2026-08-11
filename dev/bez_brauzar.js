// ═══════════════════════════════════════════════════════════
// 🖥️ БЕЗ БРАУЗЪР — пуска проверките, които не искат екран
//
// Защо съществува (12.08): Browser панелът заби над десет пъти в един ден.
// Тестът за паметта дори ПРЕЗАРЕЖДА страницата по средата и трие всичко,
// което е било измерено дотук. Проверка, която зависи от капризен таб,
// на практика не се пуска — а непусната проверка е нула.
//
// Тук вървят само тези, които четат ДАННИ, не рисуват:
//   · dev/zaglavia.js  — записът знае ли се по собственото си заглавие
//   · dev/mrytvi.js    — всеки ключ намира ли своя запис  (пуска се отделно,
//                        защото е бавен: 3628 ключа × 383 записа)
//
// Останалите (телефон, памет, оформление) ИСКАТ истински екран и си остават
// в браузъра — тук няма как да се излъжат.
//
// ПУСКАНЕ:  node dev/bez_brauzar.js
// Връща изход 1, ако нещо падне — за да може да се вика от друг скрипт.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Не пипа нищо в проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// от dev/ нагоре до корена на проекта
process.chdir(path.resolve(__dirname, '..'));

function пясъчник() {
  // 🪤 Контекстът се прави ОТ window, за да Е window глобалният обект.
  // js/kb.js пише `window.KB = {...}`, а js/helper.js чете ГОЛО `KB`.
  // В браузъра това е едно и също. Ако window е обикновен обект, не е —
  // и всичко тихо връща null. Точно това ме излъга веднъж с „100% мъртви".
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
  });
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

function зареди(w, файлове) {
  for (const f of файлове) {
    try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }).runInContext(w); }
    catch (e) { return f + ' → ' + e.name + ': ' + e.message; }
  }
  return null;
}

let паднали = 0;
const редове = [];

// ── 1. ЗАГЛАВИЯ ──
{
  const w = пясъчник();
  const гр = зареди(w, ['js/kb.js', 'dev/zaglavia.js']);
  if (гр) { редове.push('🔴 заглавия — не се зареди: ' + гр); паднали++; }
  else if (!w.BL_ЗАГЛАВИЯ) { редове.push('🔴 заглавия — не се експортира'); паднали++; }
  else {
    // ЕДНО викане: то само прави самопроверката вътре в себе си.
    // Преди тук се викаше два пъти — излишна работа върху 383 записа.
    const x = w.BL_ЗАГЛАВИЯ.провери();
    const ок = x.САМОПРОВЕРКА && x.САМОПРОВЕРКА.мина;
    if (!ок) { редове.push('🔴 заглавия — САМОПРОВЕРКАТА пада, не вярвай на числото'); паднали++; }
    редове.push((x.ПАДНАЛИ ? '🔴' : '✅') + ' заглавия    прегледани ' + x.ПРЕГЛЕДАНИ
      + ' · от тях въпроси ' + x.ОТ_ТЯХ_ВЪПРОСИ + ' · паднали ' + x.ПАДНАЛИ);
    if (x.ПАДНАЛИ) {
      паднали += x.ПАДНАЛИ;
      x.НАХОДКИ.forEach(n => редове.push('     ' + n.id.padEnd(22)
        + n.заглавие.slice(0, 42) + '  ↯ ' + n.липсват_в_ключовете.join(', ')));
    }
  }
}

// ── 2. ЦЯЛОСТ НА БАЗАТА ── (счупени ключове, увиснали бутони, счупени препратки)
{
  const s = fs.readFileSync('js/kb.js', 'utf8');
  const ids = new Set();
  for (const m of s.matchAll(/id:\s*['"]([^'"]+)['"]/g)) ids.add(m[1]);

  let счуп = 0, брК = 0;
  for (const m of s.matchAll(/keys:\s*\[([^\]]*)\]/g))
    for (const x of m[1].matchAll(/'([^']*)'|"([^"]*)"/g)) {
      const k = (x[1] !== undefined ? x[1] : x[2]).trim();
      брК++;
      if (!k || /^[,)(\[\]{};:]+$/.test(k)) счуп++;
    }
  редове.push((счуп ? '🔴' : '✅') + ' ключове     ' + брК + ' общо · счупени (празни/скоби) ' + счуп);
  паднали += счуп;

  const chips = new Set();
  for (const m of s.matchAll(/chips:\s*\[([^\]]*)\]/g))
    for (const x of m[1].matchAll(/['"]([^'"]+)['"]/g)) chips.add(x[1]);
  const увис = [...chips].filter(c => !ids.has(c));
  редове.push((увис.length ? '🔴' : '✅') + ' бутони      ' + chips.size
    + ' предложения · увиснали (сочат никъде) ' + увис.length
    + (увис.length ? ': ' + увис.slice(0, 6).join(', ') : ''));
  паднали += увис.length;

  const инд = new Set(JSON.parse(fs.readFileSync('lib/index.json', 'utf8')).items.map(x => x.id));
  const libs = [...s.matchAll(/lib:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const сч = libs.filter(l => !инд.has(l));
  редове.push((сч.length ? '🔴' : '✅') + ' библиотека  ' + libs.length
    + ' препратки · счупени ' + сч.length + (сч.length ? ': ' + сч.slice(0, 6).join(', ') : ''));
  паднали += сч.length;
}

// ── 3. ВСИЧКО СЕ ПАРСВА ── (дублиран const убива цял файл МЪЛЧАЛИВО)
{
  const фф = fs.readdirSync('js').filter(f => f.endsWith('.js')
    && !/ARCHIVE|PREDI|BAK|NOV_|_izmervane/.test(f));
  const лоши = [];
  for (const f of фф) {
    try { new vm.Script(fs.readFileSync('js/' + f, 'utf8'), { filename: f }); }
    catch (e) { лоши.push(f + ' → ' + e.message.slice(0, 60)); }
  }
  редове.push((лоши.length ? '🔴' : '✅') + ' парсване    ' + фф.length
    + ' файла · счупени ' + лоши.length);
  лоши.forEach(x => редове.push('     ' + x));
  паднали += лоши.length;
}

// ── 4. БИБЛИОТЕКАТА ── резюметата, които майката чете под заглавието
{
  const j = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));

  // 4а. отрязано с многоточие — рязано на 101 знака при внасянето
  const мн = j.items.filter(s => /(…|\.\.\.)\s*$/.test(String(s.s || ''))).length;

  // 4б. отрязано БЕЗ многоточие — по-лошо: нищо не подсказва, че липсва край
  const без = j.items.filter(s => {
    const t = String(s.s || '').trim();
    return t && !/[.!?»"”)]$/.test(t) && !/[;,:]$/.test(t);
  });

  // 4в. резюмето е ЕДИН чужд въпрос в кавички, вместо да казва какво има вътре.
  //     ⚠ Тесен нарочно: 47 резюмета започват с кавичка и 40 от тях са ДОБРИ —
  //     цитират мит и веднага го оборват („Момчетата проговарят по-късно“
  //     понякога е вярно. Но…). Лошо е само когато СЛЕД кавичките няма нищо.
  const ОТВ = '[„“«"]', ЗАТВ = '[“”»"]';
  const САМО_ЦИТАТ = new RegExp('^\\s*' + ОТВ + '[^“”„«»"]*' + ЗАТВ + '?\\s*$');
  const цит = j.items.filter(s => {
    const t = String(s.s || '').trim();
    return t && САМО_ЦИТАТ.test(t);
  });

  редове.push((мн || без.length || цит.length ? '🔴' : '✅') + ' резюмета    ' + j.items.length
    + ' записа · с многоточие ' + мн + ' · без завършващ знак ' + без.length
    + ' · само цитат ' + цит.length);
  if (без.length) редове.push('     без край: ' + без.slice(0, 8).map(x => x.id).join(', ')
    + (без.length > 8 ? ' … +' + (без.length - 8) : ''));
  if (цит.length) редове.push('     само цитат: ' + цит.map(x => x.id).join(', '));
  паднали += мн + без.length + цит.length;
}

console.log('\n🖥️  БЕЗ БРАУЗЪР\n');
console.log(редове.join('\n'));
console.log('\n' + (паднали ? '🔴 ПАДНАЛИ: ' + паднали : '✅ ЧИСТО'));
process.exit(паднали ? 1 : 0);
