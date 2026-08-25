// ═══════════════════════════════════════════════════════════
// 🧯 СКЛАДЪТ — уред за МЪЛЧАЛИВИТЕ провали при запис
//
// ЗАЩО: тук майка държи снимките на бебето си и дневника си. Няма сървър,
//   няма възстановяване. Приложението може да ѝ каже „✔ Влезе!“ и да не е
//   записало нищо. Този уред търси местата, където това е възможно.
//
// КАКВО ПРАВИ — две части, всяка казва КОЛКО МЕСТА Е ПРЕГЛЕДАЛА:
//
//   ЧАСТ 1 · СТАТИЧЕН ОГЛЕД (чете кода)
//     A. празна уловка `catch (e) {}` около ЗАПИС (setItem/put/delete/save)
//     B. IndexedDB onerror/onabort, който не води доникъде
//     C. успех, обявен ПРЕДИ записът да е потвърден
//        (при IndexedDB успехът е в transaction.oncomplete, НЕ в request.onsuccess)
//     D. мълчалив отказ: `if (!нещо) return;` вътре в записваща функция
//
//   ЧАСТ 2 · ЖИВА МЯРКА (пуска js/store.js в пясъчник)
//     · брои ли „вече има записи (N неща)“ на ПРАЗЕН телефон
//     · брои ли демо-данните и служебните флагове като записи на майката
//     · и в ДРУГАТА посока: истински неин запис ТРЯБВА да се брои
//
// „0 находки“ без брой прегледани значи „0 прегледани“ — затова всеки ред
// от доклада носи и знаменателя си.
//
// ПУСКАНЕ:
//   node dev/skladat.js              → моите пет файла (storage/photos/crypto/profile/store)
//   node dev/skladat.js --vsichki    → всички js/*.js (без ARCHIVE/PREDI копия)
//   node dev/skladat.js --fail       → изход 1, ако има находка (за автоматика)
//   node dev/skladat.js --izpitai    → изпитва САМИЯ уред: подава нарочно
//                                      счупен код и проверява, че го ХВАЩА,
//                                      и здрав код — че МЪЛЧИ. Мярка, която не
//                                      може да гръмне, не мери.
//
// ПЪТ НАЗАД: изтрий този файл. Той само ЧЕТЕ — не пипа нито приложението,
//   нито паметта на браузър, нито един ред от js/.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const KOREN = path.resolve(__dirname, '..');
const МОИТЕ = ['storage.js', 'photos.js', 'crypto.js', 'profile.js', 'store.js'];

// ── помощни: работа с фигурни скоби, за да намерим тялото на try/функция ──
// НЕ ползваме регулярни за структура — те не броят скоби.
function телоСлед(текст, отвНач) {
  // отвНач сочи към '{'; връща [начало, край) на тялото
  let d = 0;
  for (let i = отвНач; i < текст.length; i++) {
    const c = текст[i];
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return [отвНач + 1, i]; }
  }
  return [отвНач + 1, текст.length];
}
function телоПреди(текст, затвКрай) {
  // затвКрай сочи към '}'; връща индекса на съответната '{'
  let d = 0;
  for (let i = затвКрай; i >= 0; i--) {
    const c = текст[i];
    if (c === '}') d++;
    else if (c === '{') { d--; if (d === 0) return i; }
  }
  return -1;
}
const редНа = (текст, i) => текст.slice(0, i).split('\n').length;
const редътТекст = (текст, i) => {
  const a = текст.lastIndexOf('\n', i - 1) + 1;
  let b = текст.indexOf('\n', i); if (b < 0) b = текст.length;
  return текст.slice(a, b).trim();
};
const съкрати = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);

// ── коментарите не са код: изрязваме ги, за да не броим обяснения като находки
// (в този проект коментарите цитират стари дефекти дума по дума!) ──
//
// 🪤 ИЗМЕРЕНО 21.08: първата версия НЕ познаваше регулярните литерали. Редът
//    js/profile.js:20 `.replace(/'/g, '&#39;')` има ДВЕ апострофчета вътре в
//    регулярно — четачът реши, че почва низ, и се разсинхронизира за целия
//    останал файл. Резултат: обяви коментара на ред 97 („'\"><img onerror=…“)
//    за истински обработчик. Едно фалшиво червено значи, че и зелените са под
//    съмнение — затова тук се познава и регулярен литерал.
const ПРЕДИ_РЕГУЛЯРЕН = /[([{,;:=!&|?+\-*%~^<>]$|\b(return|typeof|case|in|of|do|else|void|delete|instanceof|new|yield|await)$/;
function безКоментари(текст) {
  const вън = [];
  let опашка = '';        // последните няколко значещи знака (за ПРЕДИ_РЕГУЛЯРЕН)
  const бутни = c => { вън.push(c); if (!/\s/.test(c)) { опашка = (опашка + c).slice(-12); } };
  let реж = 0;   // 0 код · 1 // · 2 /* */ · 3 '…' · 4 "…" · 5 `…` · 6 /…/
  for (let i = 0; i < текст.length; i++) {
    const c = текст[i], n = текст[i + 1];
    if (реж === 0) {
      if (c === '/' && n === '/') { реж = 1; вън.push('  '); i++; continue; }
      if (c === '/' && n === '*') { реж = 2; вън.push('  '); i++; continue; }
      if (c === '/') {
        // регулярен литерал ли е, или делене? гледаме последното значещо назад
        if (ПРЕДИ_РЕГУЛЯРЕН.test(опашка) || опашка === '') { реж = 6; бутни(c); continue; }
      }
      if (c === "'") реж = 3; else if (c === '"') реж = 4; else if (c === '`') реж = 5;
      бутни(c); continue;
    }
    if (реж === 1) { if (c === '\n') { реж = 0; вън.push('\n'); } else вън.push(' '); continue; }
    if (реж === 2) { if (c === '*' && n === '/') { реж = 0; вън.push('  '); i++; } else вън.push(c === '\n' ? '\n' : ' '); continue; }
    // низ или регулярно: пазим го цял (текстовете към майката ни трябват за правило C)
    бутни(c);
    if (c === '\\') { бутни(текст[i + 1] || ''); i++; continue; }
    if (реж === 6) {
      if (c === '[') { реж = 7; continue; }                 // [/] вътре в клас не затваря
      if (c === '/') реж = 0;
      else if (c === '\n') реж = 0;                          // недовършено — по-добре се откажи
      continue;
    }
    if (реж === 7) { if (c === ']') реж = 6; continue; }
    if ((реж === 3 && c === "'") || (реж === 4 && c === '"') || (реж === 5 && c === '`')) реж = 0;
  }
  return вън.join('');
}

// ── думите, които значат „записваме нещо на диска“ ──
const ЗАПИС = /(\.setItem\s*\(|\.removeItem\s*\(|\bsave\s*\(\s*'bl_|\.put\s*\(|\.delete\s*\(|idbSet\s*\(|idbDel\s*\(|mediaRestore\s*\(|deleteDatabase\s*\()/;
// ── думите, които значат „някой е чул“ ──
// `кажи`/`знак`/`бележка` са как СЪЩИЯТ проект казва нещо на майката
// (js/extras2.js:85 `знак(бележка, …)`, js/photos.js:108 `бележка.textContent`).
const ЧУВА = /(вик|cheer|лента|кажи|знак|бележка|BL_FX|BL_UI|провал|останало|недостиг|console\.|throw|reject|textContent\s*=|innerHTML\s*=|appendChild)/;
// ── думите, с които приложението обявява успех пред майката ──
const УСПЕХ = /(Влезе|Запазено|Записано|Готово|Свалено|✔|✅|Изпратено)/;

// ── ПИСМЕНОТО ОПРОВЕРЖЕНИЕ ──
// Ред с `// ЧУТО: …` НАД находката значи: човек е погледнал това място и е
// обяснил защо мама пак разбира. Такава находка се маха от червеното, но НЕ
// изчезва — брои се и се изписва отделно, с обяснението си. Иначе „опростено“
// става тихо място за криене, а точно от такива места тръгна цялата беда.
const ЧУТО = /\/\/\s*ЧУТО:\s*(.+)$/;
function опровержение(редове, ред1) {          // ред1 е 1-базиран
  for (let i = ред1 - 1; i >= Math.max(0, ред1 - 4); i--) {
    const m = ЧУТО.exec(редове[i] || '');
    if (m) return m[1].trim();
  }
  return null;
}

function огледайФайл(път) {
  const сурово = fs.readFileSync(път, 'utf8');
  const т = безКоментари(сурово);
  const име = path.relative(KOREN, път).replace(/\\/g, '/');
  const находки = [];
  const брояч = { catch: 0, handler: 0, uspeh: 0, rannoIzlizane: 0 };

  // ── A · празна уловка около ЗАПИС ──
  const reCatch = /catch\s*\(\s*[A-Za-z_$][\w$]*\s*\)\s*\{/g;
  let m;
  while ((m = reCatch.exec(т))) {
    брояч.catch++;
    const отв = m.index + m[0].length - 1;
    const [a, b] = телоСлед(т, отв);
    const тяло = т.slice(a, b);
    if (тяло.trim() !== '') continue;                       // уловката прави нещо
    // назад до `try {`, за да видим какво е пазила
    const преди = т.lastIndexOf('}', m.index);
    const tryОтв = телоПреди(т, преди);
    if (tryОтв < 0) continue;
    const опит = т.slice(tryОтв, преди);
    if (!ЗАПИС.test(опит)) continue;                        // не е запис — не е нашата риба
    находки.push({
      вид: 'A', файл: име, ред: редНа(сурово, m.index),
      какво: 'празна уловка около запис',
      код: съкрати(редътТекст(сурово, m.index), 110)
    });
  }

  // ── B · IndexedDB onerror/onabort, който не води доникъде ──
  const reH = /\.?on(error|abort)\s*=\s*/g;
  while ((m = reH.exec(т))) {
    брояч.handler++;
    const след = т.slice(m.index, m.index + 260);
    // тялото на обработчика: до края на реда/блока — стига за груба преценка
    let тяло = след;
    const отв = след.indexOf('{');
    const стрелка = след.indexOf('=>');
    if (отв >= 0 && (стрелка < 0 || отв < стрелка + 4)) {
      const [a, b] = телоСлед(след, отв);
      тяло = след.slice(a, b);
    } else {
      const край = след.indexOf('\n');
      тяло = след.slice(0, край < 0 ? след.length : край);
    }
    if (ЧУВА.test(тяло)) continue;                          // някой чува
    находки.push({
      вид: 'B', файл: име, ред: редНа(сурово, m.index),
      какво: 'on' + m[1] + ' не води доникъде',
      код: съкрати(редътТекст(сурово, m.index), 110)
    });
  }

  // ── C · успех, обявен ПРЕДИ потвърждение ──
  // Правилото: ако в СЪЩАТА функция по-нататък се чака `flush()` (или
  // `oncomplete`), а надписът за успех е сложен ПРЕДИ него — обявили сме
  // успех, преди записът да е кацнал.
  const редове = сурово.split('\n');
  редове.forEach((ред, i) => {
    if (!/(textContent|innerHTML|cheer|знак)\s*[=(]/.test(ред)) return;
    if (!УСПЕХ.test(ред)) return;
    if (/^\s*(\/\/|\*)/.test(ред)) return;                  // коментар
    брояч.uspeh++;
    const прозорец = редове.slice(i + 1, i + 14).join('\n');
    if (!/(flush\s*\(|oncomplete)/.test(прозорец)) return;  // няма какво да чака
    if (/(mediaOK|провал|потвърд)/.test(редове.slice(Math.max(0, i - 6), i + 14).join('\n'))) return;
    находки.push({
      вид: 'C', файл: име, ред: i + 1,
      какво: 'успех, обявен преди flush()/oncomplete да потвърди',
      код: съкрати(ред.trim(), 110)
    });
  });

  // ── C2 · „Влезе“ без проверка дали МЕДИЯТА е кацнала ──
  // Правило с ОБРАТЕН знак: не търсим лош ред, а изискваме добър. Който обявява
  // „✔ Влезе!“ след внасяне на копие, ТРЯБВА наблизо да е питал BL_STORE.mediaOK().
  // Без този въпрос надписът е лъжа за снимките — те са само в паметта и
  // изчезват при презареждането, което самият надпис прави 400 ms по-късно.
  редове.forEach((ред, i) => {
    if (!/Влезе/.test(ред)) return;
    if (!/(textContent|innerHTML)\s*=/.test(ред)) return;
    if (/^\s*(\/\/|\*)/.test(ред)) return;
    брояч.uspeh++;
    const околност = редове.slice(Math.max(0, i - 16), i + 4).join('\n');
    if (/mediaOK/.test(околност)) return;
    находки.push({
      вид: 'C', файл: име, ред: i + 1,
      какво: '„Влезе“ без BL_STORE.mediaOK() — надписът не знае дали снимките са кацнали',
      код: съкрати(ред.trim(), 110)
    });
  });

  // ── D · мълчалив отказ вътре в записваща функция ──
  const reF = /function\s+([A-Za-z_$Ѐ-ӿ][\w$Ѐ-ӿ]*)\s*\([^)]*\)\s*\{/g;
  while ((m = reF.exec(т))) {
    const отв = m.index + m[0].length - 1;
    const [a, b] = телоСлед(т, отв);
    const тяло = т.slice(a, b);
    if (!ЗАПИС.test(тяло)) continue;                        // не е записваща функция
    const rr = /if\s*\(\s*!\s*[A-Za-z_$Ѐ-ӿ][\w$.Ѐ-ӿ]*\s*\)\s*return\s*;/g;
    let r;
    while ((r = rr.exec(тяло))) {
      брояч.rannoIzlizane++;
      const абс = a + r.index;
      const околност = тяло.slice(Math.max(0, r.index - 400), r.index + 200);
      if (ЧУВА.test(околност)) continue;                    // някой чува наблизо
      находки.push({
        вид: 'D', файл: име, ред: редНа(сурово, абс),
        какво: 'мълчалив отказ в „' + m[1] + '“ — записът просто не се случва',
        код: съкрати(редътТекст(сурово, абс), 110)
      });
    }
  }

  // всяка находка минава през писменото опровержение (и остава видима)
  const всичкиРедове = сурово.split('\n');
  находки.forEach(н => { н.чуто = опровержение(всичкиРедове, н.ред); });
  return {
    находки: находки.filter(н => !н.чуто),
    опровергани: находки.filter(н => н.чуто),
    брояч, редове: всичкиРедове.length
  };
}

// ═══════════ ЧАСТ 2 · ЖИВА МЯРКА ═══════════
// Пуска js/store.js в подправен браузър и мери какво брои „вече има записи“.
function пясъчник(начално) {
  const m = new Map(Object.entries(начално || {}));
  const disk = new Map();
  function StorageCtor() {}
  StorageCtor.prototype = {
    getItem(k) { return m.has(String(k)) ? m.get(String(k)) : null; },
    setItem(k, v) { m.set(String(k), String(v)); },
    removeItem(k) { m.delete(String(k)); },
    key(i) { const a = [...m.keys()]; return a[i] === undefined ? null : a[i]; },
    clear() { m.clear(); }
  };
  const localStorage = Object.create(StorageCtor.prototype);
  Object.defineProperty(localStorage, 'length', { get: () => m.size });

  let tx;
  const indexedDB = {
    open() {
      const rq = { result: { transaction() { tx = { objectStore: () => ({ put(v, k) { disk.set(String(k), String(v)); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); return {}; }, delete(k) { disk.delete(String(k)); return {}; }, openCursor() { const q = {}; setTimeout(() => { q.result = null; q.onsuccess && q.onsuccess(); }, 0); return q; } }) }; return tx; }, close() {}, createObjectStore: () => ({}) } };
      setTimeout(() => rq.onsuccess && rq.onsuccess(), 0);
      return rq;
    },
    deleteDatabase() { disk.clear(); }
  };
  const барове = [];
  const document = {
    body: { appendChild: n => барове.push(n) },
    createElement() {
      const n = { style: {}, className: '', innerHTML: '' };
      n.appendChild = () => {}; n.remove = () => {};
      n.querySelector = () => ({ addEventListener() {} });
      n.classList = { add() {}, remove() {}, contains: () => false };
      return n;
    },
    querySelectorAll: () => ({ forEach() {} }),
    addEventListener() {}
  };
  const win = {
    localStorage, Storage: StorageCtor, document, indexedDB,
    setTimeout, clearTimeout, Promise, console,
    WeakSet, Set, Object, Array, JSON, String, Math, Number, Error, RegExp, Date,
    IntersectionObserver: function () { this.observe = () => {}; this.unobserve = () => {}; }
  };
  win.window = win; win.globalThis = win;
  new vm.Script(fs.readFileSync(path.join(KOREN, 'js', 'store.js'), 'utf8'), { filename: 'store.js' })
    .runInNewContext(win);
  return { win, m, барове, S: win.BL_STORE, localStorage };
}

// ═══════════ ИЗПИТВАНЕ НА САМИЯ УРЕД ═══════════
const ИЗПИТИ = [
  { вид: 'A', трябва: true, код: "function f(){ try { localStorage.setItem('bl_x','1'); } catch (e) {} }" },
  { вид: 'A', трябва: false, код: "function f(){ try { localStorage.setItem('bl_x','1'); } catch (e) { вик(); } }" },
  { вид: 'A', трябва: false, код: "function f(){ try { const v = localStorage.getItem('bl_x'); } catch (e) {} }" },
  { вид: 'B', трябва: true, код: "const rq = st.openCursor(); rq.onerror = () => res(out);" },
  { вид: 'B', трябва: false, код: "tx.onerror = tx.onabort = () => { провал++; медияВик('pyalna'); res(); };" },
  { вид: 'C', трябва: true, код: "лейбъл.textContent = '✔ Влезе!';\nconst ч = BL_STORE.flush();\nч.then(() => location.reload());" },
  { вид: 'C', трябва: false, код: "await BL_STORE.flush();\nif (!BL_STORE.mediaOK()) казвам();\nлейбъл.textContent = '✔ Влезе!';" },
  { вид: 'D', трябва: true, код: "function idbSet(k, v) {\n  if (!db) return;\n  db.put(v, k);\n}" },
  { вид: 'D', трябва: false, код: "function idbSet(k, v) {\n  if (!db) { провал++; медияВик('nema'); return; }\n  db.put(v, k);\n}" },
  // ── самото ОПРОВЕРЖЕНИЕ: маха от червеното, но НЕ крие ──
  { вид: 'A', трябва: false, опровергано: true,
    код: "function f(){\n  // ЧУТО: обяснено е защо мама пак разбира\n  try { localStorage.setItem('bl_x','1'); } catch (e) {}\n}" },
  { вид: 'A', трябва: true, опровергано: false,
    код: "function f(){\n  // обикновен коментар, не опровержение\n  try { localStorage.setItem('bl_x','1'); } catch (e) {}\n}" }
];
function изпитайУреда() {
  const tmp = path.join(require('os').tmpdir(), 'skladat_izpit.js');
  let добри = 0;
  console.log('\n🧪 ИЗПИТВАНЕ НА УРЕДА — ' + ИЗПИТИ.length + ' проби в ДВЕТЕ посоки\n');
  ИЗПИТИ.forEach((из, i) => {
    fs.writeFileSync(tmp, из.код, 'utf8');
    const r = огледайФайл(tmp);
    const хвана = r.находки.some(н => н.вид === из.вид);
    const опров = r.опровергани.some(н => н.вид === из.вид);
    let ок = хвана === из.трябва;
    // опровергано ≠ изчезнало: щом сме казали „ЧУТО“, находката ТРЯБВА да е
    // в списъка на опроверганите. Иначе опровержението е място за криене.
    if (из.опровергано !== undefined) ок = ок && (опров === из.опровергано);
    if (ок) добри++;
    console.log('  ' + (ок ? '✅' : '❌') + ' проба ' + (i + 1) + ' · вид ' + из.вид + ' · ' +
      (из.трябва ? 'ТРЯБВА да хване' : 'НЕ бива да хване') +
      (из.опровергано !== undefined ? (из.опровергано ? ' + да го ОПРОВЕРГАЕ видимо' : ' + без опровержение') : '') +
      ' → ' + (хвана ? 'хвана' : 'мълча') + (опров ? ', опроверга' : ''));
  });
  try { fs.unlinkSync(tmp); } catch (e) {}
  console.log('\n  изпитани проби: ' + ИЗПИТИ.length + ' · верни: ' + добри);
  if (добри !== ИЗПИТИ.length) console.log('  🔴 УРЕДЪТ НЕ МЕРИ ВЯРНО — не вярвай на доклада му.');
  return добри === ИЗПИТИ.length;
}

// ═══════════ ДОКЛАД ═══════════
const ИМЕНА = {
  A: 'A · празна уловка около ЗАПИС',
  B: 'B · IndexedDB onerror/onabort не води доникъде',
  C: 'C · успех, обявен ПРЕДИ потвърждение',
  D: 'D · мълчалив отказ в записваща функция'
};

(function главно() {
  const арг = process.argv.slice(2);
  if (арг.includes('--izpitai')) { process.exit(изпитайУреда() ? 0 : 1); }

  const всички = арг.includes('--vsichki');
  const дир = path.join(KOREN, 'js');
  const файлове = (всички
    ? fs.readdirSync(дир).filter(f => /\.js$/.test(f) && !/ARCHIVE|PREDI|\.BAK/.test(f))
    : МОИТЕ
  ).map(f => path.join(дир, f)).filter(f => fs.existsSync(f));

  console.log('\n🧯 СКЛАДЪТ — мълчаливите провали при запис');
  console.log('   ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' · ' +
    (всички ? 'всички js/' : 'петте складови файла'));

  const всичкиНаходки = [];
  const всичкиОпровергани = [];
  const общБрояч = { catch: 0, handler: 0, uspeh: 0, rannoIzlizane: 0 };
  let общоРедове = 0;
  файлове.forEach(f => {
    const r = огледайФайл(f);
    всичкиНаходки.push(...r.находки);
    всичкиОпровергани.push(...r.опровергани);
    Object.keys(общБрояч).forEach(k => { общБрояч[k] += r.брояч[k]; });
    общоРедове += r.редове;
  });

  console.log('\n📏 КОЛКО МЕСТА ПРЕГЛЕДАХ');
  console.log('   файлове: ' + файлове.length + '   редове код: ' + общоРедове);
  console.log('   уловки catch: ' + общБрояч.catch +
    '   on(error|abort): ' + общБрояч.handler +
    '   надписа за успех: ' + общБрояч.uspeh +
    '   ранни излизания: ' + общБрояч.rannoIzlizane);
  const прегледани = общБрояч.catch + общБрояч.handler + общБрояч.uspeh + общБрояч.rannoIzlizane;
  console.log('   ОБЩО ПРЕГЛЕДАНИ МЕСТА: ' + прегледани);
  if (!прегледани) console.log('   🔴 0 прегледани места — уредът не е чел нищо. Не вярвай на „0 находки“.');

  console.log('\n🔎 НАХОДКИ ПО ВИД');
  ['A', 'B', 'C', 'D'].forEach(в => {
    const н = всичкиНаходки.filter(x => x.вид === в);
    console.log('   ' + ИМЕНА[в] + ': ' + н.length);
    н.forEach(x => {
      console.log('      · ' + x.файл + ':' + x.ред + '  ' + x.какво);
      console.log('        ' + x.код);
    });
  });
  console.log('\n   ВСИЧКО: ' + всичкиНаходки.length + ' находки от ' + прегледани + ' прегледани места');

  console.log('\n📝 ПИСМЕНО ОПРОВЕРГАНИ (`// ЧУТО:`) — прегледани, не скрити: ' + всичкиОпровергани.length);
  всичкиОпровергани.forEach(x => {
    console.log('      · ' + x.файл + ':' + x.ред + '  [' + x.вид + '] ' + x.какво);
    console.log('        ЧУТО: ' + x.чуто);
  });

  // ── ЖИВАТА МЯРКА ──
  console.log('\n📦 ЖИВА МЯРКА · „вече има записи (N неща)“');
  const п = пясъчник();
  const брои = (typeof п.S.броиНейни === 'function') ? п.S.броиНейни : null;
  if (!брои) {
    console.log('   ⚠️ js/store.js още няма BL_STORE.броиНейни() — броенето живее');
    console.log('      разпиляно в js/profile.js и js/rooms2.js и не може да се измери оттук.');
  } else {
    const случаи = [
      ['празен телефон', {}, 0],
      ['само служебни флагове', { bl_theme: 'dark', bl_tz: '"EET"', bl_day1: '"2026-08-19"', bl_vax_schema: '2', bl_art_merged: '1', bl_qped_merged: '1', bl_onboarded: 'true' }, 0],
      ['демо-данните („Покажи ми“)', { bl_demo_keys: '["bl_checkins","bl_tried","bl_firsts","bl_walk_days"]', bl_checkins: '{"a":1}', bl_tried: '{"b":2}', bl_firsts: '{"c":3}', bl_walk_days: '{"d":4}' }, 0],
      ['празни черупки', { bl_journal: '[]', bl_notes_baby: '{}', bl_mama: 'null', bl_baby: '""' }, 0],
      ['ЕДИН неин запис', { bl_journal: '[{"t":"първата усмивка"}]' }, 1],
      ['неин запис + служебни', { bl_theme: 'dark', bl_day1: '"x"', bl_journal: '[{"t":"x"}]', bl_growth: '{"3":5200}' }, 2],
      ['демо + неин запис', { bl_demo_keys: '["bl_tried"]', bl_tried: '{"b":2}', bl_journal: '[{"t":"x"}]' }, 1]
    ];
    let вярни = 0;
    случаи.forEach(([име, състояние, чакано]) => {
      const с = пясъчник(състояние);
      const n = с.S.броиНейни();
      const ок = n === чакано;
      if (ок) вярни++;
      console.log('   ' + (ок ? '✅' : '❌') + ' ' + име + ' → брои ' + n + ' (чакано ' + чакано + ')');
    });
    console.log('   измерени случая: ' + случаи.length + ' · верни: ' + вярни);
    if (вярни !== случаи.length) всичкиНаходки.push({ вид: 'Ж', какво: 'броячът лъже' });
  }

  console.log('');
  if (арг.includes('--fail')) process.exit(всичкиНаходки.length ? 1 : 0);
})();
