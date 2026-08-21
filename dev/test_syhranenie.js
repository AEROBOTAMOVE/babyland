// ═══════════════════════════════════════════════════════════
// 💾 ТЕСТ НА СЪХРАНЕНИЕТО — мълчаливата загуба на снимките и гласовите
//
// КАКВО: пуска js/store.js в пясъчник с подправени localStorage и IndexedDB и
//   проверява, че при НЕуспешен запис мама РАЗБИРА, а при успешен НЕ я плашим.
//   Четиринайсет сценария, всеки в двете посоки:
//     · база работи / база недостъпна (частен режим) / транзакция abort / put гърми
//     · нищо не се пише · само текст · пише се ДОКАТО init върви (нормално!)
//     · триене преди init (снимката не бива да ВЪЗКРЪСВА)
//     · викът преживява ли презареждането след „✔ Влезе!" — и не се ли повтаря
//     · след „Изтрий всичко" празният телефон трябва да МЪЛЧИ
//
// ЗАЩО: js/store.js мълчеше при `if (!db) return;` и `catch (e) {}`. Мама сменя
//   телефон, качва копието, чете „✔ Влезе! Зареждам всичко…", телефонът се
//   презарежда — и албумът ѝ го няма. Измерено 19.08: 3 от 3 счупени сценария
//   даваха 0 предупреждения и 0 неща на диска.
//   Обратната посока е точно толкова важна: запис ПРЕДИ базата да се е отворила
//   е НОРМАЛЕН (init го до-персистира). Наивното „викай щом няма db" би
//   гърмяло при всяко пускане на приложението.
//
// ПУСКАНЕ:
//   "C:/Users/User/AppData/Local/OpenAI/Codex/bin/5b9024f90663758b/node.exe" dev/test_syhranenie.js
//   Изход 0 = чисто. Изход 1 = поне един сценарий е паднал.
//
// ПЪТ НАЗАД: изтрий този файл. Нищо не зависи от него — той само ЧЕТЕ
//   js/store.js и не пипа нито приложението, нито паметта на браузър.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const KOREN = path.resolve(__dirname, '..');
const спи = ms => new Promise(r => setTimeout(r, ms));

// ── подправеният localStorage ──
function napraviLS() {
  const m = new Map();
  return {
    getItem: k => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => { m.set(String(k), String(v)); },
    removeItem: k => { m.delete(String(k)); },
    key: i => ([...m.keys()][i] === undefined ? null : [...m.keys()][i]),
    clear: () => m.clear(),
    get length() { return m.size; },
    _map: m
  };
}

// ── подправената IndexedDB: 'ok' | 'nema' | 'gramva' | 'abort' ──
function napraviIDB(rezhim, disk) {
  if (rezhim === 'nema') return { open() { throw new Error('SecurityError'); }, deleteDatabase() {} };
  let tx;
  const прави = () => ({
    objectStore() {
      return {
        put(v, k) {
          if (rezhim === 'gramva') throw new Error('put throw');
          if (rezhim === 'abort') { setTimeout(() => tx.onabort && tx.onabort(), 0); return {}; }
          disk.set(String(k), String(v));
          setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
          return {};
        },
        delete(k) { disk.delete(String(k)); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); return {}; },
        openCursor() {
          const rq = {}; const зап = [...disk.entries()]; let i = 0;
          setTimeout(function стъпка() {
            rq.result = i < зап.length
              ? { key: зап[i][0], value: зап[i][1], continue: () => { i++; setTimeout(стъпка, 0); } }
              : null;
            if (rq.onsuccess) rq.onsuccess();
          }, 0);
          return rq;
        }
      };
    }
  });
  const db = { transaction() { tx = прави(); return tx; }, close() {}, createObjectStore() { return {}; } };
  return {
    open() { const rq = { result: db }; setTimeout(() => rq.onsuccess && rq.onsuccess(), 0); return rq; },
    deleteDatabase() { disk.clear(); }
  };
}

function zaredi(opts) {
  opts = opts || {};
  const disk = opts.disk || new Map();
  const ls = opts.ls || napraviLS();
  const barove = [];

  function StorageCtor() {}
  StorageCtor.prototype = {
    getItem(k) { return ls.getItem(k); },
    setItem(k, v) { return ls.setItem(k, v); },
    removeItem(k) { return ls.removeItem(k); },
    key(i) { return ls.key(i); },
    clear() { return ls.clear(); }
  };
  const localStorage = Object.create(StorageCtor.prototype);
  Object.defineProperty(localStorage, 'length', { get: () => ls.length });

  const document = {
    body: { appendChild: n => barove.push(n) },
    createElement() {
      const n = { style: {}, className: '', _h: '' };
      Object.defineProperty(n, 'innerHTML', { get: () => n._h, set: v => { n._h = v; } });
      n.appendChild = () => {}; n.remove = () => {};
      n.querySelector = () => ({ addEventListener() {} });
      n.classList = { add() {}, remove() {}, contains: () => false, toggle() {} };
      return n;
    },
    querySelectorAll: () => ({ forEach() {} }),
    addEventListener() {}
  };

  const win = {
    localStorage, Storage: StorageCtor, document,
    indexedDB: napraviIDB(opts.idb || 'ok', disk),
    setTimeout, clearTimeout, Promise, console,
    WeakSet, Set, Object, Array, JSON, String, Math, Number, Error,
    IntersectionObserver: function () { this.observe = () => {}; this.unobserve = () => {}; }
  };
  win.window = win; win.globalThis = win;

  new vm.Script(fs.readFileSync(path.join(KOREN, 'js', 'store.js'), 'utf8'), { filename: 'store.js' })
    .runInNewContext(win);
  return { win, barove, ls, disk, localStorage, S: win.BL_STORE };
}

// ── сценариите ──
const провали = [];
function твърди(име, условие, какво) {
  if (условие) console.log('  ✅ ' + име);
  else { console.log('  ❌ ' + име + '   → ' + какво); провали.push(име); }
}

async function готов(п) { await п.S.init.catch(() => {}); await спи(60); await п.S.flush(); await спи(60); }

// стар store.js няма mediaOK — тестът трябва да КАЖЕ това, не да гръмне и да
// отнесе останалите тринайсет сценария със себе си (капан 6: „0 находки" без
// брой прегледани значи „0 прегледани")
const mediaOK = п => (typeof п.S.mediaOK === 'function' ? п.S.mediaOK() : 'НЯМА mediaOK()');

(async () => {
  console.log('\n💾 СЪХРАНЕНИЕТО — 14 сценария\n');
  console.log('— КАЗВА ЛИ, когато записът се загуби —');

  for (const [име, реж] of [['база НЕДОСТЪПНА', 'nema'], ['транзакция ABORT', 'abort'], ['put ГЪРМИ', 'gramva']]) {
    const п = zaredi({ idb: реж });
    await п.S.init.catch(() => {}); await спи(40);
    п.localStorage.setItem('bl_photos', '["албум"]');
    await спи(60);
    твърди(име + ' → мама е предупредена', п.barove.length === 1, 'барове=' + п.barove.length + ' (0 = мълчалива загуба)');
    твърди(име + ' → mediaOK() е false', mediaOK(п) === false, 'mediaOK=' + mediaOK(п));
  }

  console.log('\n— И В ДРУГАТА ПОСОКА: НЕ плаши, когато всичко е наред —');
  {
    const п = zaredi({ idb: 'ok' });
    await п.S.init.catch(() => {}); await спи(40);
    п.localStorage.setItem('bl_photos', '["албум"]');
    await готов(п);
    твърди('здрава база · снимка кацна', п.disk.has('bl_photos'), 'дискът е празен');
    твърди('здрава база · без фалшива тревога', п.barove.length === 0, 'барове=' + п.barove.length);
  }
  {
    const п = zaredi({ idb: 'ok' }); await готов(п);
    твърди('нищо не се пише · мълчи', п.barove.length === 0, 'барове=' + п.barove.length);
  }
  {
    const п = zaredi({ idb: 'ok' });
    await п.S.init.catch(() => {}); await спи(40);
    п.localStorage.setItem('bl_journal', '["ред"]'); await спи(40);
    твърди('само текст · мълчи', п.barove.length === 0, 'барове=' + п.barove.length);
  }
  {
    // НАЙ-ВАЖНАТА обратна посока: запис ПРЕДИ базата да се отвори е нормален
    const п = zaredi({ idb: 'ok' });
    п.localStorage.setItem('bl_bump', '["корем"]');
    await готов(п);
    твърди('пише се ДОКАТО init върви · кацна', п.disk.has('bl_bump'), 'дискът е празен');
    твърди('пише се ДОКАТО init върви · мълчи', п.barove.length === 0, 'барове=' + п.barove.length + ' (фалшива тревога при всяко пускане!)');
  }

  console.log('\n— БЛИЗНАКЪТ: изтритото не бива да възкръсва —');
  {
    const disk = new Map([['bl_photos', '["стара"]']]);
    const п = zaredi({ idb: 'ok', disk });
    п.localStorage.removeItem('bl_photos');          // ПРЕДИ init
    await готов(п);
    твърди('триене преди init · снимката НЕ се връща', !п.disk.has('bl_photos') && !('bl_photos' in п.S.mediaDump()),
      'диск=[' + [...п.disk.keys()] + '] кеш=[' + Object.keys(п.S.mediaDump()) + ']');
  }

  console.log('\n— викът преживява ли презареждането след „✔ Влезе!" —');
  {
    const ls = napraviLS(), disk = new Map();
    const п1 = zaredi({ idb: 'nema', ls, disk });
    await п1.S.init.catch(() => {}); await спи(40);
    п1.S.mediaRestore({ bl_photos: '["албум"]' });    // както прави „Възстанови от файл"
    await спи(40);
    const п2 = zaredi({ idb: 'nema', ls, disk });
    await п2.S.init.catch(() => {}); await спи(60);
    const п3 = zaredi({ idb: 'nema', ls, disk });
    await п3.S.init.catch(() => {}); await спи(60);
    твърди('след презареждане казва пак', п2.barove.length === 1, 'барове=' + п2.barove.length);
    твърди('на третото пускане МЪЛЧИ (не е папагал)', п3.barove.length === 0, 'барове=' + п3.barove.length);
  }
  {
    const ls = napraviLS(), disk = new Map();
    const п1 = zaredi({ idb: 'nema', ls, disk });
    await п1.S.init.catch(() => {}); await спи(40);
    п1.localStorage.setItem('bl_photos', '["x"]'); await спи(40);
    п1.S.wipe();
    [...ls._map.keys()].filter(k => k.indexOf('bl_') === 0).forEach(k => ls.removeItem(k));  // както rooms7.js
    const п2 = zaredi({ idb: 'nema', ls, disk });
    await п2.S.init.catch(() => {}); await спи(60);
    твърди('след „Изтрий всичко" празното мълчи', п2.barove.length === 0, 'барове=' + п2.barove.length);
  }
  {
    const п = zaredi({ idb: 'nema' });
    await п.S.init.catch(() => {}); await спи(40);
    for (let i = 0; i < 12; i++) п.localStorage.setItem('bl_photos', '["' + i + '"]');
    await спи(40);
    твърди('12 провалени записа = ЕДИН вик', п.barove.length === 1, 'барове=' + п.barove.length);
  }

  console.log('\n' + (провали.length ? '❌ ПАДНАЛИ: ' + провали.length : '✅ ЧИСТО'));
  process.exit(провали.length ? 1 : 0);
})();
