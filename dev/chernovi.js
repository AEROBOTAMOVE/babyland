// ═══════════════════════════════════════════════════════════
// 📝 ЧЕРНОВИТЕ в rooms15/16/17 — връща ли се написаното след затваряне
//
// ЗАЩО: три полета в моите карти приемат дълъг текст, който мама пише бавно:
//   · rooms15 „Не-списъкът“      — решение, което се преформулира
//   · rooms16 „Смехът на деня“   — 120 знака с бебе на ръка
//   · rooms17 „Ехографията“      — ДУМИТЕ НА ЛЕКАРЯ от прегледа
// Стаята се строи наново при всяко отваряне. Без чернова текстът изчезва.
//
// 🪤 Записването на черновата живее в js/daily.js (глобален слушател на
//    `input` за всеки елемент с data-draft). Той НЕ се зарежда в пясъчника,
//    затова тук се проверяват ДВЕТЕ страни, които СА мои:
//      (1) полето обявява ли се за чернова (data-draft),
//      (2) връща ли записаната чернова при повторно отваряне,
//      (3) чисти ли я СЛЕД приет запис (иначе стар текст се лепи завинаги).
//
// 🪤 МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ: `--samoproverka` маха наум
//    черновата и иска проверката ДА ПАДНЕ. Не падне ли — уредът е сляп.
//
// ПУСКАНЕ:  node dev/chernovi.js  ·  node dev/chernovi.js --samoproverka
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. Нула следи по диска.
// ═══════════════════════════════════════════════════════════
'use strict';
const path = require('path');
const БАЗА = require(path.join(__dirname, 'interaktivno_stai.js'));
const { новПрозорец, зареди } = БАЗА;

const ФАЙЛОВЕ = ['js/data.js', 'js/rooms.js', 'js/rooms2.js', 'js/rooms15.js', 'js/rooms16.js', 'js/rooms17.js', 'js/rooms18.js'];

const ПОЛЕТА = [
  { файл: 'rooms15.js', стая: 'Дневник на мама', заглавие: /Не-списък/, ключ: 'bl_draft_notlist', примес: 'Няма да', текст: 'Няма да обяснявам защо не идваме на гости' },
  { файл: 'rooms16.js', стая: 'Дневник на мама', заглавие: /Смехът на деня/, ключ: 'bl_draft_laugh', примес: 'разсмя', текст: 'Кихна и се изплаши от себе си' },
  // 🪤 заглавието е „Ехо-албумът 🩻“, не „Ехография“ — първата ми догадка не
  //    съвпадаше с нищо и картата минаваше за ЛИПСВАЩА, а си беше там.
  { файл: 'rooms17.js', стая: 'Бременност', заглавие: /Ехо-албум/, ключ: 'bl_draft_echo', примес: 'видяхме', текст: 'Лекарят каза: всичко е по мярка' }
];

// 🪤 Първата ми версия си измисли как се строи стая (BL_ROOMS2.render + куки)
//    и даде „0 намерени полета“ — тоест 0 ПРЕГЛЕДАНИ, представени за находка.
//    Строежът е ТОЧНО този на dev/interaktivno_stai2.js: ROOM_FEATURES[стая].
const fs = require('fs');
const vm = require('vm');
function прозорец(без) {
  const W = новПрозорец();
  // същата подпорка като в interaktivno_stai2.js — иначе 29 фалшиви „ГРЪМВА“
  if (W.Node && W.Node.prototype && !W.Node.prototype.select) W.Node.prototype.select = function () {};
  зареди(W, ['js/data.js', 'js/rooms.js']);
  W.ROOM_FEATURES = W.ROOM_FEATURES || {};
  ['Жената в мен', 'Лабораторията'].forEach(с => { if (!W.ROOM_FEATURES[с]) W.ROOM_FEATURES[с] = () => {}; });
  const мои = ФАЙЛОВЕ.filter(f => /rooms(2|1[5-8])\.js$/.test(f));
  if (!без) { зареди(W, мои); return W; }
  // ✂️ САМО за самопроверката: махаме двата реда на черновата от ЕДИН файл,
  //    за да видим, че проверката наистина гърми, когато ги няма.
  for (const f of мои) {
    if (!f.endsWith(без.файл)) { зареди(W, [f]); continue; }
    const цял = fs.readFileSync(path.resolve(__dirname, '..', f), 'utf8');
    const код = цял
      .replace(new RegExp("\\n[^\\n]*\\.dataset\\.draft = '" + без.ключ + "';[^\\n]*", 'g'), '')
      .replace(new RegExp("\\n[^\\n]*\\.value = load\\('" + без.ключ + "', ''\\);[^\\n]*", 'g'), '');
    if (код === цял) throw new Error('самопроверката НЕ успя да махне черновата ' + без.ключ + ' — щеше да мери същия файл два пъти');
    new vm.Script(код, { filename: f }).runInContext(W);
  }
  return W;
}

function построй(W, стая) {
  const root = W.document.createElement('div');
  root.className = 'ro-body';
  W.document.body.appendChild(root);
  const f = W.ROOM_FEATURES && W.ROOM_FEATURES[стая];
  if (!f) return root;
  try { f(root); } catch (e) {}
  try { W._часовник.напред(50); } catch (e) {}
  return root;
}

function картата(root, заглавие) {
  return [...root.querySelectorAll('.jr-card')].find(c => {
    const t = c.querySelector('.jr-title');
    return t && заглавие.test(t.textContent || '');
  });
}

function полето(карта, примес) {
  if (!карта) return null;
  return [...карта.querySelectorAll('input, textarea')]
    .find(x => (x.placeholder || '').indexOf(примес) > -1) || null;
}

function мери(без) {
  const редове = [];
  for (const п of ПОЛЕТА) {
    if (без && без.ключ !== п.ключ) continue;
    const W = прозорец(без);
    // ── А. празна памет: полето обявява ли се за чернова ──
    W.localStorage.setItem('bl_lmp', JSON.stringify('2026-03-01'));
    W.localStorage.setItem('bl_baby', JSON.stringify({ name: 'Мира', birth: '2026-02-01', sex: 'girl' }));
    let root = построй(W, п.стая);
    let к = картата(root, п.заглавие);
    let e = полето(к, п.примес);
    const обявено = !!(e && e.dataset && e.dataset.draft === п.ключ);
    // ── Б. с записана чернова: връща ли я при ново отваряне ──
    W.localStorage.setItem(п.ключ, JSON.stringify(п.текст));
    root = построй(W, п.стая);
    к = картата(root, п.заглавие);
    e = полето(к, п.примес);
    const върната = !!(e && e.value === п.текст);
    // ── В. след приет запис: чисти ли се черновата ──
    let изчистена = null;
    if (e) {
      e.value = п.текст;
      const бутон = [...к.querySelectorAll('button')]
        .find(b => /Отказвам се|Запиши/.test(b.textContent || ''));
      if (бутон) {
        try { бутон.click(); } catch (err) {}
        let ст = null; try { ст = JSON.parse(W.localStorage.getItem(п.ключ)); } catch (err) {}
        изчистена = (ст === '' || ст == null);
      }
    }
    редове.push({ п, намерено: !!e, обявено, върната, изчистена });
  }
  return редове;
}

function докладвай(редове) {
  let червени = 0;
  for (const r of редове) {
    const име = r.п.файл + ' · ' + r.п.ключ;
    if (!r.намерено) { console.log('  ❌ ' + име + ' — ПОЛЕТО НЕ Е НАМЕРЕНО (мерим празно)'); червени++; continue; }
    console.log('  ' + (r.обявено ? '✅' : '❌') + ' ' + име + ' — полето се обявява за чернова (data-draft)');
    console.log('  ' + (r.върната ? '✅' : '❌') + ' ' + име + ' — записаната чернова се ВРЪЩА при ново отваряне');
    if (r.изчистена === null) console.log('  ·  ' + име + ' — бутонът за приемане не е намерен, не мерих чистенето');
    else console.log('  ' + (r.изчистена ? '✅' : '❌') + ' ' + име + ' — черновата се ЧИСТИ след приет запис');
    if (!r.обявено) червени++;
    if (!r.върната) червени++;
    if (r.изчистена === false) червени++;
  }
  return червени;
}

if (process.argv.includes('--samoproverka')) {
  console.log('═══ САМОПРОВЕРКА: гърми ли уредът, когато черновата я НЯМА ═══');
  let паднали = 0, прегледани = 0;
  for (const п of ПОЛЕТА) {
    const със = мери(null).find(r => r.п.ключ === п.ключ);
    const без = мери(п)[0];
    прегледани += 2;
    const добре1 = със && със.обявено && със.върната;
    const добре2 = без && !без.обявено && !без.върната;
    console.log('  ' + (добре1 ? '✅' : '❌') + ' СЪС черновата ' + п.ключ + ' → минава');
    console.log('  ' + (добре2 ? '✅' : '❌') + ' БЕЗ черновата ' + п.ключ + ' → ПАДА (иначе мярката е сляпа)');
    if (!добре1) паднали++;
    if (!добре2) паднали++;
  }
  console.log('  ПРЕГЛЕДАНИ: ' + прегледани + ' проверки · ПАДНАЛИ: ' + паднали);
  process.exit(паднали ? 1 : 0);
}

console.log('═══ 📝 ЧЕРНОВИТЕ — ' + new Date().toLocaleString('bg-BG') + ' ═══');
console.log('ПРЕГЛЕДАНИ: ' + ПОЛЕТА.length + ' полета в 3 файла\n');
const червени = докладвай(мери(null));
console.log('\n' + (червени ? '❌ ' + червени + ' ЧЕРВЕНИ' : '✅ ЧИСТО'));
process.exit(червени ? 1 : 0);
