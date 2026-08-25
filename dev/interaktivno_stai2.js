// ═══════════════════════════════════════════════════════════
// 🖐️ ИНТЕРАКТИВНОТО В rooms2 / rooms15-18 — натиска всичко и МЕРИ
//
// ЗАЩО: js/rooms2.js е вторият най-интерактивен файл в проекта (60 слушателя).
// Там живеят растежът, зъбките, ританията, контракциите, ваксините, копието.
// rooms15-18 добавят още 33. Никой не е проверявал СИСТЕМНО дали всяко от тях
// (1) РЕАГИРА, (2) ЗАПИСВА, (3) ПОКАЗВА РЕЗУЛТАТ, (4) ОЦЕЛЯВА презареждане,
// (5) НЕ ЛЪЖЕ, че е записало.
//
// Миниатюрният DOM и пясъчникът се ВЗИМАТ от dev/interaktivno_stai.js (доказани
// на 11.08 върху rooms/rooms3/rooms4/rooms5). Втори DOM = втори набор дефекти.
//
// ПУСКАНЕ:
//   node dev/interaktivno_stai2.js               — опис + жив обход
//   node dev/interaktivno_stai2.js --opis         — само описът
//   node dev/interaktivno_stai2.js --samoproverka — уредът в ДВЕТЕ ПОСОКИ
//   node dev/interaktivno_stai2.js --staya="Моето бебе"
//   node dev/interaktivno_stai2.js --chuzhdi      — показва и находките в ЧУЖДИ карти
//
// 🪤 МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. --samoproverka чупи нарочно
//    по един запис/бутон/сметка и иска уредът ДА ГИ ХВАНЕ. Не ги ли хване,
//    изходът е 1 и в доклада пише „уредът е сляп“.
//
// 🔢 „0 находки“ БЕЗ брой прегледани значи „0 прегледани“. Затова всеки
//    раздел печата КОЛКО е погледнал, преди да каже колко е намерил.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта. localStorage е обект в паметта на Node.
//    Нула следи по диска.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const БАЗА = require(path.join(__dirname, 'interaktivno_stai.js'));
const { новПрозорец, зареди } = БАЗА;

// моите файлове — те се мерят
const МОИ = ['js/rooms2.js', 'js/rooms15.js', 'js/rooms16.js', 'js/rooms17.js', 'js/rooms18.js'];
// съседите, без които стаите не се строят (данните и основните стаи)
const ПОДПОРКИ = ['js/data.js', 'js/rooms.js'];
const ВСИЧКИ_ФАЙЛОВЕ = ['js/data.js', 'js/rooms.js', 'js/rooms2.js', 'js/rooms15.js', 'js/rooms16.js', 'js/rooms17.js', 'js/rooms18.js'];

// 🪤 rooms18 закача пакети към „Жената в мен“ и „Лабораторията“ — стаи, които
//    се раждат в women*.js и lab.js (не мои файлове). Без основа `if (!база)
//    return;` ги прескача и ДВЕ карти (банята, тетрадката) остават невидими за
//    уреда. Слагаме празна основа ПРЕДИ моите файлове.
const ЧУЖДИ_ОСНОВИ = ['Жената в мен', 'Лабораторията'];

// ═══════════════════════════════════════════════════════════
// 1. ОПИС — какво изобщо има в МОИТЕ файлове
// ═══════════════════════════════════════════════════════════

const УСПЕХ = /(✔|✓|записа|запечата|оставено|готово|копирано|върнах|прието|добавих|запазено|влезе|изпратено)/i;

// 🪤 25.08 (ИЗМЕРЕНО — мярка, която мери грешното нещо): раздел 3 пускаше
//    УСПЕХ върху СУРОВИЯ изходен код, а коментарите тук са на български и
//    почти всеки съдържа „ПРЕДИ записа“, „пресен прочит ПРЕДИ записа“, „✔“.
//    Тоест колкото повече ЧЕСТНИ коментари напише човек над една поправка,
//    толкова по-силно уредът я обявява за ЛЪЖЕЦ. Доказано с две тела:
//    „…// пресен прочит ПРЕДИ записа“ (нула екранен текст) даваше true.
//    Същото важи и за `пазиУспех`: `if (!save(` в коментар щеше да ИЗВИНИ
//    истински лъжец. Затова и двете се смятат върху код БЕЗ коментари.
//    Низовете се пазят — там живее текстът, който мама наистина вижда.
function безКоментари(код) {
  let вън = '', в = null, i = 0;
  while (i < код.length) {
    const c = код[i], сл = код[i + 1];
    if (в) {
      if (c === '\\') { вън += '  '; i += 2; continue; }
      if (c === в) в = null;
      вън += c; i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { в = c; вън += c; i++; continue; }
    if (c === '/' && сл === '/') { while (i < код.length && код[i] !== '\n') { вън += ' '; i++; } continue; }
    if (c === '/' && сл === '*') {
      i += 2; вън += '  ';
      while (i < код.length && !(код[i] === '*' && код[i + 1] === '/')) { вън += (код[i] === '\n' ? '\n' : ' '); i++; }
      i += 2; вън += '  '; continue;
    }
    // екранираната наклонена в регулярен израз (`/\/\//`) не бива да мине за коментар
    if (c === '\\') { вън += '  '; i += 2; continue; }
    вън += c; i++;
  }
  return вън;
}

function тялоНаСлушателя(код, начало) {
  let i = код.indexOf('(', начало);
  if (i < 0) return '';
  let дълбочина = 0, в = null, екран = false;
  for (let k = i; k < код.length && k < i + 20000; k++) {
    const c = код[k];
    if (екран) { екран = false; continue; }
    if (c === '\\') { екран = true; continue; }
    if (в) { if (c === в) в = null; continue; }
    if (c === '"' || c === "'" || c === '`') { в = c; continue; }
    if (c === '(') дълбочина++;
    else if (c === ')') { дълбочина--; if (дълбочина === 0) return код.slice(i, k + 1); }
  }
  return код.slice(i, i + 2000);
}
function най_близкаФункция(редове, ред) {
  for (let i = ред - 1; i >= 0; i--) {
    const m = /^\s*(?:function\s+([A-Za-zА-Яа-я_$][\w$А-Яа-я]*)|const\s+([A-Za-zА-Яа-я_$][\w$А-Яа-я]*)\s*=)/.exec(редове[i] || '');
    if (m) return m[1] || m[2];
  }
  return '(горно ниво)';
}

// заглавията на МОИТЕ карти — за да знам кои находки са мои и кои чужди
function моитеЗаглавия() {
  const вън = new Map();   // първите ~30 знака на заглавието → файл
  for (const f of МОИ) {
    const код = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
    // card('Заглавие …') и card("…") и card(`…`)
    const РЕ = /\bcard\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    let m;
    while ((m = РЕ.exec(код))) {
      const сурово = m[2].replace(/<[^>]*>/g, ' ').replace(/\$\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
      const ключ = сурово.slice(0, 24);
      if (ключ.length >= 6) вън.set(ключ, f);
    }
    // checklistCard('Заглавие …', …) — минава през същия card(), но текстът е тук
    const РЕ2 = /checklistCard\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    while ((m = РЕ2.exec(код))) {
      const ключ = m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
      if (ключ.length >= 6) вън.set(ключ, f);
    }
    // notesCard('Заглавие …', …)
    const РЕ3 = /notesCard\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    while ((m = РЕ3.exec(код))) {
      const ключ = m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
      if (ключ.length >= 6) вън.set(ключ, f);
    }
    // voiceCard / photoListCard идват от BL_EXPR, но заглавието се пише ТУК
    const РЕ4 = /(?:voiceCard|photoListCard)\s*\(\s*\n?\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    while ((m = РЕ4.exec(код))) {
      const ключ = m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
      if (ключ.length >= 6) вън.set(ключ, f);
    }
  }
  return вън;
}

function опис() {
  const редове = [];
  let общо = 0, прегледаниРеда = 0;
  for (const f of МОИ) {
    const текст = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const код = текст.replace(/\r\n/g, '\n');       // 🪤 CRLF: split('\n') оставя \r
    прегледаниРеда += код.split('\n').length;
    const редовеНаФайла = код.split('\n');
    // 🪤 имена на събития с двоеточие/тире ('bl:tried-changed') — иначе невидими
    const РЕ = /addEventListener\s*\(\s*['"]([a-zA-Z][\w:.-]*)['"]/g;
    let m;
    const тук = [];
    while ((m = РЕ.exec(код))) {
      общо++;
      const ред = код.slice(0, m.index).split('\n').length;
      const тяло = тялоНаСлушателя(код, m.index);
      const прекиКлючове = [...new Set([...тяло.matchAll(/\b(?:load|save)\s*\(\s*['"]([a-zA-Z_][\w]*)['"]/g)].map(x => x[1]))];
      const директни = [...new Set([...тяло.matchAll(/localStorage\.(?:get|set|remove)Item\s*\(\s*['"]([^'"]+)['"]/g)].map(x => x[1]))];
      const ключове = [...new Set(прекиКлючове.concat(директни))];
      const показва = /(?:textContent|innerHTML)\s*=/.test(тяло)
        || /classList\.(?:add|remove|toggle)/.test(тяло)
        || /\b(?:рисувай|рисувайИстория|рисувайЧасовник|рисувайСбор|drawHist|drawCon|drawTried|drawFavs|drawAll|draw|refreshAge|refreshFeed|refreshSleep|calc|calcSize|total|thCount|upd|updateCap|знак|каз|кажи)\s*\(/.test(тяло)
        || /\bfx\(\)\.(?:cheer|confetti)/.test(тяло) || /BL_FX\.(?:cheer|confetti)/.test(тяло)
        || /replaceWith/.test(тяло) || /\bhidden\s*=/.test(тяло) || /\.focus\s*\(/.test(тяло);
      const пише = /\bsave\s*\(/.test(тяло) || /localStorage\.(?:set|remove)Item/.test(тяло);
      // 🪤 върху код БЕЗ коментари — виж безКоментари() горе
      const голо = безКоментари(тяло);
      // пази ли успеха: `if (!save(` или `if (save(` или `save(…) ?`
      const пазиУспех = /if\s*\(\s*!?\s*save\s*\(/.test(голо) || /save\s*\([^;]*\)\s*(?:\?|===|!==)/.test(голо)
        || /=\s*save\s*\(/.test(голо);
      const обявяваУспех = УСПЕХ.test(голо);
      тук.push({
        файл: f, ред, вид: m[1],
        функция: най_близкаФункция(редовеНаФайла, ред),
        ключове, пише, показва, обявяваУспех, пазиУспех
      });
    }
    редове.push({ файл: f, брой: тук.length, слушатели: тук, редовеБрой: редовеНаФайла.length });
  }
  return { общо, прегледаниРеда, редове };
}

// ═══════════════════════════════════════════════════════════
// 2. ПРОФИЛИ — състоянията на майката, в които се мери
// ═══════════════════════════════════════════════════════════

function дн(отместване) {
  const d = new Date(); d.setDate(d.getDate() + отместване);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const ПРОФИЛИ = {
  'бременна': () => {
    return {
      bl_lmp: дн(-24 * 7),
      bl_baby: { name: 'Мира', sex: '', birth: '' },
      bl_partner: 'да',
      bl_checkins: { [дн(0)]: { m: 3, e: 60, w: 'слънчево' }, [дн(-1)]: { m: 1, e: 30, w: 'тежко' }, [дн(-2)]: { m: 4, e: 20, w: '' } },
      bl_kicks: [{ ts: Date.now() - 86400000, mins: 22 }, { ts: Date.now() - 172800000, mins: 30 }, { ts: Date.now() - 259200000, mins: 18 }],
      bl_contract: [{ start: Date.now() - 3600000, dur: 50, interval: null }, { start: Date.now() - 3000000, dur: 55, interval: 10 }],
      bl_bump: { '20': 'data:image/png;base64,AAA', '24': 'data:image/png;base64,BBB', '28': 'data:image/png;base64,CCC' },
      bl_echo: [{ img: 'data:image/png;base64,AAA', w: 12, t: 'маха с ръчичка', d: дн(-30) }],
      bl_wm_notlist: [{ t: 'Няма да гладя чаршафи. Никога повече.', d: дн(-3) }]
    };
  },
  'с бебе': () => {
    return {
      bl_baby: { name: 'Мира', sex: 'girl', birth: дн(-243) },
      bl_partner: 'да',
      bl_checkins: { [дн(0)]: { m: 3, e: 60, w: 'слънчево' }, [дн(-1)]: { m: 1, e: 30, w: 'тежко' }, [дн(-2)]: { m: 4, e: 20, w: '' }, [дн(-3)]: { m: 2, e: 10, w: '' } },
      bl_growth: [{ d: дн(-30), m: 7, w: 7.4, p: 44 }, { d: дн(-2), m: 8, w: 7.9, p: 47 }],
      bl_growth_len: [{ d: дн(-2), v: 69 }],
      bl_feed: { t: Date.now() - 5400000, s: 'left' },
      bl_feedlog: [Date.now() - 5400000, Date.now() - 16200000, Date.now() - 27000000, Date.now() - 37800000, Date.now() - 48600000],
      bl_nursing: [{ s: 'Л', dur: 600, ts: Date.now() - 3600000 }],
      bl_diapers: { [дн(0)]: { wet: 4, dirty: 2 }, [дн(-1)]: { wet: 6, dirty: 1 }, [дн(-2)]: { wet: 5, dirty: 3 }, [дн(-3)]: { wet: 6, dirty: 2 } },
      bl_sleep: { d: дн(0), segs: [{ s: Date.now() - 18000000, e: Date.now() - 12600000 }], open: null },
      bl_sleep_hist: { [дн(-1)]: 620, [дн(-2)]: 700, [дн(-3)]: 660 },
      bl_teeth: [10, 11],
      bl_teeth_d: { 10: Date.now() - 86400000, 11: Date.now() - 43200000 },
      bl_tried: { 'Тиквичка': '😋 хареса', 'Морков': '😐 неутрално' },
      bl_tried_d: { 'Тиквичка': Date.now() - 86400000 },
      bl_custom_foods: [{ n: 'Дюля', e: '🏠', from: 8, cat: 'Мои', alrg: false, how: 'Печена.' }],
      bl_ms_done: { '6_motor': true, '8_speech': true },
      bl_ms_d: { '6_motor': Date.now() - 86400000 },
      bl_ranges: { smile: 2, roll: 5 },
      bl_firsts: { '😊 Първа усмивка': дн(-180) },
      bl_vax: { 0: true, 1: true },
      bl_temps: [{ v: 37.4, ts: Date.now() - 3600000 }],
      bl_sos: { pedName: 'д-р Иванова', pedPhone: '0888123456', closeName: '', closePhone: '' },
      bl_budget: { pel: 80, other: 60 },
      bl_fav_names: ['Мира', 'Ния'],
      bl_custom_lists: [{ name: 'За морето', items: [{ t: 'Шапка', done: true }, { t: 'Плувни памперси', done: false }] }],
      bl_baby_lexicon: { 'Първата ти дума': 'мама' },
      bl_spend: [{ d: дн(-40), k: 'pel', v: 78 }, { d: дн(-8), k: 'milk', v: 120 }, { d: дн(-1), k: 'cloth', v: 45 }],
      bl_laughs: [{ t: 'Кихна и се уплаши от себе си.', d: дн(-1) }],
      bl_utensils: { cup_open: дн(-20) },
      bl_outbag: { bib: true, wipes: true },
      bl_scale_toy: 'кафявото мече',
      bl_bath: { d: дн(0), n: 12 },
      bl_bath_total: 96,
      bl_menu: { [дн(1)]: 'Тиквичка', [дн(2)]: 'Морков' },
      bl_shoplist_done: {},
      bl_photos: { '6': 'data:image/png;base64,AAA' },
      bl_lab: { done: [{ e: '🔬', q: 'Заспива ли по-бързо с бяло шумче?', t: 'Да, с 8 минути.', d: дн(-14) }] },
      bl_wm_notlist: [{ t: 'Няма да пека сладки за детския рожден ден. Купувам.', d: дн(-3) }],
      bl_voice_diary: [], bl_art_months: []
    };
  }
};

// „повреден“ профил: същите данни, но с точно тези дупки, които оставя
// внесено чуждо/старо копие. Всяка е ИЗМЕРЕНА като реален източник в проекта.
function повреден() {
  const п = ПРОФИЛИ['с бебе']();
  п.bl_checkins = Object.assign({}, п.bl_checkins);
  п.bl_checkins[дн(-1)] = { e: 40, w: 'без личице' };           // липсва `m`
  п.bl_spend = [{ k: 'pel', v: 78 }, { k: 'milk', v: 120 }];    // липсва `d` → делене на нула
  п.bl_sleep_hist = { [дн(-1)]: 620, [дн(-2)]: null, [дн(-3)]: 660 };
  п.bl_diapers = Object.assign({}, п.bl_diapers, { [дн(-5)]: 7 });   // число вместо обект
  п.bl_growth = [{ d: дн(-30), m: 7, w: 7.4 }];                 // липсва `p`
  п.bl_feed = { t: Date.now() + 7200000, s: 'left' };           // хранене в БЪДЕЩЕТО
  return п;
}

const СТАИ = ['Моето бебе', 'Бременност', 'Захранване', 'Развитие и игри', 'Инструменти', 'Здраве и SOS', 'Дневник на мама', 'Жената в мен', 'Лабораторията'];

// ═══════════════════════════════════════════════════════════
// 3. СТРОЕЖ И НАТИСКАНЕ
// ═══════════════════════════════════════════════════════════

function прозорецСМоите(опции) {
  const W = новПрозорец(опции);
  // 🪤 ДУПКА В САМИЯ УРЕД (измерена: 29 фалшиви „ГРЪМВА при натискане“).
  //    Миниатюрният DOM имаше setSelectionRange, но НЕ и select(). Кодът вика
  //    `поле.select()` на 3 места (rooms17.js:219, rooms16.js:272, rooms2.js) —
  //    в браузъра HTMLInputElement.select() съществува за ВСЕКИ тип вход (за
  //    типове без текстов избор просто не прави нищо; хвърля само
  //    setSelectionRange). Тоест уредът обвиняваше приложението за собствената
  //    си липса. Ако този ред се махне, 29-те фалшиви червени се връщат.
  if (W.Node && W.Node.prototype && !W.Node.prototype.select) W.Node.prototype.select = function () {};
  const беди = зареди(W, ПОДПОРКИ);
  // 🪤 без тези две празни основи rooms18 прескача банята и тетрадката
  W.ROOM_FEATURES = W.ROOM_FEATURES || {};
  ЧУЖДИ_ОСНОВИ.forEach(с => { if (!W.ROOM_FEATURES[с]) W.ROOM_FEATURES[с] = () => {}; });
  беди.push(...зареди(W, МОИ));
  return { W, беди };
}

function построй(W, стая) {
  const root = W.document.createElement('div');
  root.className = 'ro-body';
  W.document.body.appendChild(root);
  const f = W.ROOM_FEATURES && W.ROOM_FEATURES[стая];
  if (!f) return { root, беда: 'няма ROOM_FEATURES' };
  try { f(root); } catch (e) { return { root, беда: e.name + ': ' + e.message }; }
  W._часовник.напред(50);
  return { root, беда: null };
}

function интерактивните(корен) {
  return корен.querySelectorAll('button, [role="button"], input, textarea, select').filter(e => {
    if (String(e.type || '') === 'file') return false;
    let n = e;
    while (n && n !== корен) { if (n.hidden) return false; n = n.parentNode; }
    return true;
  });
}
function надпис(e) {
  return String(e.getAttribute('aria-label') || (e.textContent || '').trim() || e.placeholder || e.className || e.localName)
    .replace(/\s+/g, ' ').slice(0, 44);
}
function заглавиеНаКартата(e, root) {
  const к = e.closest('.jr-card');
  if (!к) return '(без карта)';
  const t = к.querySelector('.jr-title');
  return String((t && t.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

// 🪤 Първата версия мереше САМО текста. Тогава чипът „Мои“ и личицата излизаха
//    МЪРТВИ — те само сменят клас. Отпечатъкът носи класове, скрито И стойности
//    на полетата (иначе „↺ Изчисти“ и полетата изглеждат мълчаливи).
function отпечатък(root) {
  const възли = root.querySelectorAll('*');
  // 🪤 и `placeholder`: „+“ в „Моите списъци“ на празно поле сменя ПОДСКАЗКАТА
  //    („Напиши точката тук…“) и нищо друго. Без нея уредът го обявяваше за
  //    мъртъв — а той казва точно каквото трябва.
  return (root.textContent || '').replace(/\s+/g, ' ')
    + '|' + възли.length
    + '|' + възли.map(n => (n.className || '') + (n.hidden ? '#h' : '')
      + (n.value !== undefined ? '=' + n.value : '')
      + (n.placeholder ? '~' + n.placeholder : '')).join(';');
}

// 🪤 Чип, който ВЕЧЕ е избран, по устройство не променя нищо при повторен тап
//    („Всички“ във филтъра, „👧 Момиче“ при момиче, „под 3 мес“ при бебе под 3
//    месеца). Уредът ги обявяваше за МЪРТВИ — 11 фалшиви червени. Мълчанието
//    на вече избран избор не е дефект; мълчанието на НЕизбран — е.
function вечеИзбран(e) {
  return (e.classList && e.classList.contains('on')) || e.getAttribute('aria-pressed') === 'true';
}

async function изчакай(W, ms) {
  W._часовник.напред(ms || 0);
  for (let i = 0; i < 8; i++) await Promise.resolve();
  W._часовник.напред(0);
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

function стойностЗаПоле(поле) {
  const п = String(поле.placeholder || поле.getAttribute('placeholder') || '');
  const ал = String(поле.getAttribute('aria-label') || '');
  const вид = String(поле.type || 'text');
  const и = (п + ' ' + ал).toLowerCase();
  if (вид === 'number') {
    if (/кг|тегло/.test(и)) return '7.8';
    if (/възраст|месец/.test(и)) return '8';
    if (/лв/.test(и)) return '42';
    if (/градус|темп|°c/.test(и)) return '37.6';
    if (/седмиц/.test(и)) return '22';
    return '6';
  }
  if (вид === 'date') return дн(-3);
  if (вид === 'checkbox') return '';
  return 'проба-' + Math.floor(Math.random() * 900 + 100);
}

async function натисни(W, root, елемент, опции) {
  опции = опции || {};
  const предПамет = W.localStorage._снимка();
  const предDOM = отпечатък(root);
  const предCheer = W._дневник.cheer.length;
  const предБележки = W._дневник.бележки.length;
  const предВън = W._дневник.печат.length + W._дневник.отваряни.length + W._дневник.външни
    + W.document.documentElement.querySelectorAll('*').length;
  const предОткази = W.localStorage._откази;
  const предКарта = елемент.closest('.jr-card') || root;
  const предТекст = (елемент.textContent || '') + ' ' + (предКарта.textContent || '');
  const предСобствен = String(елемент.textContent || '');
  W.document._грешки.length = 0;
  W.document._файлНатиснат = false;

  const писаниПолета = [];
  if (опции.напълни) {
    предКарта.querySelectorAll('input, textarea').forEach(p => {
      if (String(p.type || '') === 'file' || String(p.type || '') === 'checkbox') return;
      if (!p.value) { p.value = стойностЗаПоле(p); писаниПолета.push(p); }
    });
  }

  const ев = {
    type: 'click', target: елемент, currentTarget: null, defaultPrevented: false, _спрян: false,
    clientX: 150, clientY: 22, key: '',
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this._спрян = true; },
    stopImmediatePropagation() { this._спрян = true; }
  };
  try { елемент.dispatchEvent(ев); } catch (e) { W.document._грешки.push(e); }

  // 🪤 Мери се НА ДВА ПЪТИ: „✔ Запазено“ се връща към стария надпис след 1800 мс
  //    (notesCard) и 2600 мс (копието). Мери се веднага И след часовника.
  await изчакай(W, 0);
  const веднагаDOM = отпечатък(root);
  const веднагаТекст = (елемент.textContent || '') + ' ' + ((елемент.closest('.jr-card') || предКарта).textContent || '');
  const веднагаСобствен = String(елемент.textContent || '');
  await изчакай(W, 3000);

  const следПамет = W.localStorage._снимка();
  const следDOM = отпечатък(root);
  const новиCheer = W._дневник.cheer.slice(предCheer);
  const следТекст = (елемент.textContent || '') + ' ' + ((елемент.closest('.jr-card') || предКарта).textContent || '');
  const целТекст = веднагаТекст + ' ' + следТекст + ' ' + новиCheer.join(' ');
  const следВън = W._дневник.печат.length + W._дневник.отваряни.length + W._дневник.външни
    + W.document.documentElement.querySelectorAll('*').length;
  return {
    записа: предПамет !== следПамет,
    показа: предDOM !== веднагаDOM || предDOM !== следDOM || новиCheer.length > 0 || следВън !== предВън,
    файлИзбор: !!W.document._файлНатиснат,
    cheer: новиCheer,
    отказаниЗаписи: W.localStorage._откази - предОткази,
    новУспех: (УСПЕХ.test(целТекст) && !УСПЕХ.test(предТекст))
      || новиCheer.some(т => УСПЕХ.test(т))
      || (предСобствен !== веднагаСобствен && УСПЕХ.test(веднагаСобствен)),
    честноПредупреждение: W._дневник.бележки.length > предБележки
      || /(пълн|няма място|не можах|не се получи|не тръгна)/i.test(целТекст),
    изчистиПолето: писаниПолета.some(p => p.value === '' || !p.isConnected),
    текстСлед: целТекст,
    грешки: W.document._грешки.map(e => e.name + ': ' + e.message),
    сменениКлючове: разликаКлючове(предПамет, следПамет)
  };
}
function разликаКлючове(a, b) {
  const ma = new Map(JSON.parse(a)), mb = new Map(JSON.parse(b));
  const вън = [];
  for (const k of new Set([...ma.keys(), ...mb.keys()])) if (ma.get(k) !== mb.get(k)) вън.push(k);
  return вън;
}

// ═══════════════════════════════════════════════════════════
// 4. МАШИННИ ДУМИ — какво мама НЕ бива да вижда
// ═══════════════════════════════════════════════════════════
// 🪤 ФАЛШИВА ТРЕВОГА (измерена: 23 попадения): `-\d+ мин` хващаше „45-60 мин“
//    в Речника на мама — честен диапазон, не отрицателно число. Минусът брои
//    само когато ПРЕДИ него няма цифра. Изпитано в двете посоки долу.
const МАШИННИ = /undefined|\bNaN\b|Invalid Date|\[object Object\]|null%|\bnull\b|преди\s+-|(^|[^\d])-\d+\s*(?:мин|ч\b)/;

function провериМашинниДуми(root, контекст, находки, броячи, чияКарта) {
  const карти = root.querySelectorAll('.jr-card');
  броячи.проверениКарти += карти.length;
  карти.forEach(к => {
    const т = (к.textContent || '').replace(/\s+/g, ' ');
    const m = МАШИННИ.exec(т);
    if (!m) return;
    const заг = String((к.querySelector('.jr-title') || { textContent: '' }).textContent).replace(/\s+/g, ' ').trim().slice(0, 40);
    находки.push({
      тежест: 'RED', вид: '🔴 МАШИННА ДУМА на екрана на мама',
      чий: чияКарта(заг),
      къде: контекст + ' · ' + заг,
      кой: '„…' + т.slice(Math.max(0, m.index - 30), m.index + 30).trim() + '…“'
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 5. ЖИВИЯТ ОБХОД
// ═══════════════════════════════════════════════════════════

async function обходи(опции) {
  опции = опции || {};
  const находки = [];
  const броячи = { стаи: 0, карти: 0, елементи: 0, натискания: 0, проверениКарти: 0, файлови: 0, презареждания: 0, полунощни: 0 };
  const заглавия = моитеЗаглавия();
  броячи.моиЗаглавия = заглавия.size;
  const чияКарта = заг => {
    for (const [к, f] of заглавия) if (заг.indexOf(к) === 0 || заг.indexOf(к) > -1) return f;
    return 'ЧУЖДА';
  };

  const ВСИЧКИ = Object.assign({}, ПРОФИЛИ, { 'повредена памет': повреден });
  const стаи = опции.стая ? [опции.стая] : СТАИ;

  for (const профил of Object.keys(ВСИЧКИ)) {
    for (const стая of стаи) {
      const { W, беди } = прозорецСМоите();
      if (беди.length) { находки.push({ тежест: 'RED', вид: 'файл не се зарежда', чий: 'уред', къде: беди.join('; ') }); continue; }
      Object.entries(ВСИЧКИ[профил]()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
      const основа = W.localStorage._снимка();

      const п0 = построй(W, стая);
      if (п0.беда) {
        находки.push({ тежест: 'RED', вид: '🔴 стаята ГЪРМИ при строеж', чий: 'МОЯ?', къде: профил + ' · ' + стая, кой: п0.беда });
        continue;
      }
      броячи.стаи++;
      броячи.карти += п0.root.querySelectorAll('.jr-card').length;
      провериМашинниДуми(п0.root, профил + ' · ' + стая, находки, броячи, чияКарта);

      const списък = интерактивните(п0.root);
      броячи.елементи += списък.length;

      for (let i = 0; i < списък.length; i++) {
        const е0 = списък[i];
        if (е0.localName === 'input' || е0.localName === 'textarea' || е0.localName === 'select') continue;
        const име = надпис(е0);
        const заг = заглавиеНаКартата(е0, п0.root);
        const чий = чияКарта(заг);
        if (чий === 'ЧУЖДА' && !опции.чужди) continue;
        const общКонтекст = профил + ' · ' + стая + ' · ' + заг + ' · „' + име + '“';

        // ── ПРОБА 1: празно поле — реагира ли изобщо ──
        {
          const { W: W1 } = прозорецСМоите(); W1.localStorage._върни(основа);
          const p = построй(W1, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            const r = await натисни(W1, p.root, сп[i], { напълни: false });
            броячи.натискания++;
            if (r.файлИзбор) броячи.файлови++;
            else if (!r.записа && !r.показа && !r.грешки.length && !вечеИзбран(сп[i])) {
              находки.push({ тежест: 'RED', вид: '🔴 МЪЛЧАЛИВ при празно поле (нула промяна, нула дума)', чий, къде: общКонтекст });
            }
            if (r.грешки.length) находки.push({ тежест: 'RED', вид: '🔴 ГРЪМВА при натискане', чий, къде: общКонтекст, кой: r.грешки[0] });
          }
        }

        // ── ПРОБА 2: пълно поле — записва ли, оцелява ли, лъже ли текстът ──
        {
          const { W: W2 } = прозорецСМоите(); W2.localStorage._върни(основа);
          const p = построй(W2, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            const r = await натисни(W2, p.root, сп[i], { напълни: true });
            броячи.натискания++;
            if (!r.файлИзбор && !r.записа && !r.показа && !r.грешки.length && !вечеИзбран(сп[i])) {
              находки.push({ тежест: 'RED', вид: '🔴 МЪЛЧАЛИВ и с попълнено поле', чий, къде: общКонтекст });
            }
            if (r.записа) {
              const снимка = W2.localStorage._снимка();
              const { W: W3 } = прозорецСМоите(); W3.localStorage._върни(снимка);
              const p3 = построй(W3, стая);
              броячи.презареждания++;
              if (p3.беда) {
                находки.push({ тежест: 'RED', вид: '🔴 СЛЕД записа стаята ГЪРМИ при повторно влизане', чий, къде: общКонтекст, кой: p3.беда });
              } else {
                провериМашинниДуми(p3.root, 'СЛЕД ЗАПИС · ' + общКонтекст, находки, броячи, чияКарта);
              }
            }
          }
        }

        // ── ПРОБА 3: ПЪЛНА ПАМЕТ — обявява ли успех без запис ──
        {
          const { W: W4 } = прозорецСМоите(); W4.localStorage._върни(основа);
          const p = построй(W4, стая); if (p.беда) continue;
          const сп = интерактивните(p.root);
          if (сп[i]) {
            W4.localStorage._пълна = true;
            const r = await натисни(W4, p.root, сп[i], { напълни: true });
            броячи.натискания++;
            W4.localStorage._пълна = false;
            if (r.отказаниЗаписи > 0 && !r.записа && r.новУспех) {
              находки.push({
                тежест: r.честноПредупреждение ? 'ORANGE' : 'RED',
                вид: r.честноПредупреждение
                  ? '🟠 знакът „успех“ остава, но мама Е предупредена'
                  : '🔴 ЛЪЖЕ: показва УСПЕХ, а записът е паднал (нула предупреждение)',
                чий, къде: общКонтекст, кой: (r.cheer[0] || изрежи(r.текстСлед))
              });
            }
            if (r.отказаниЗаписи > 0 && !r.записа && r.изчистиПолето) {
              находки.push({
                тежест: 'RED', вид: '🔴🔴 ТЕКСТЪТ НА МАМА СЕ ГУБИ: полето се чисти, а записът е паднал',
                чий, къде: общКонтекст
              });
            }
          }
        }
      }
    }
  }

  // ── ПРОБА 4: ПОЛУНОЩ — стаята, отворена в 23:50, натисната в 00:10 ──
  await полунощ(находки, броячи, чияКарта);

  return { находки, броячи };
}
function изрежи(т) {
  const m = УСПЕХ.exec(т);
  if (!m) return '';
  return String(т).slice(Math.max(0, m.index - 25), m.index + 35).replace(/\s+/g, ' ');
}

// 🕛 ИЗМЕРЕНО от съседен отряд: прибирачите на деня се викаха САМО при
//    зареждане. Майка с отворено приложение 23:50 → 00:10 губеше вчерашните
//    числа при първото си докосване. Тук проверяваме СЪЩИЯ модел: строим
//    стаята „вчера“, местим часовника отвъд полунощ и натискаме.
async function полунощ(находки, броячи, чияКарта) {
  const { W, беди } = прозорецСМоите();
  if (беди.length) return;
  Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));

  // избутваме истинския часовник до 23:50 днес
  const Истина = Date;
  const сега = new Истина();
  const край = new Истина(сега.getFullYear(), сега.getMonth(), сега.getDate(), 23, 50, 0, 0);
  let отместване = край.getTime() - Истина.now();
  W.Date = new Proxy(Истина, {
    construct(ц, арг) { return арг.length ? new ц(...арг) : new ц(Истина.now() + отместване); },
    get(ц, п) { if (п === 'now') return () => Истина.now() + отместване; return Reflect.get(ц, п); }
  });

  const п = построй(W, 'Моето бебе');
  if (п.беда) return;
  броячи.полунощни++;

  const плюсове = п.root.querySelectorAll('.bb-dipbtn').filter(b => (b.textContent || '').trim() === '+');
  if (!плюсове.length) return;
  const num = плюсове[0].parentNode.querySelector('.bb-dipnum');
  const вечерта = String(num.textContent);          // вчерашното число, докато е още вчера

  // ⏰ 20 минути по-късно = 00:10 НА СЛЕДВАЩИЯ КАЛЕНДАРЕН ДЕН.
  //    🪤 Първата версия само местеше датата и обявяваше червено — но в
  //    ИСТИНСКИЯ свят минутите наистина минават и минутните тикове на картата
  //    се пускат. Тест, който не ги пуска, мери свят, който не съществува, и
  //    дава фалшива находка. Затова местим и ЧАСОВНИКА на пясъчника.
  отместване += 20 * 60000;
  W._часовник.напред(20 * 60000);
  for (let i = 0; i < 8; i++) await Promise.resolve();

  const следПолунощ = String(num.textContent);      // това вижда мама в 00:10
  const дн0 = дн(0), дн1 = дн(1);

  // 🔴 ПЪРВОТО: числото на екрана трябва да е на НОВИЯ ден (0), не вчерашното
  if (следПолунощ === вечерта && вечерта !== '0') {
    находки.push({
      тежест: 'RED',
      вид: '🔴 ПОЛУНОЩ: броячът на екрана остава ВЧЕРАШНИЯ, а бутонът пише в ДНЕШНИЯ ден',
      чий: 'js/rooms2.js',
      къде: 'Моето бебе · Пелени днес · стая, отворена в 23:50, гледана в 00:10',
      кой: 'на екрана още „' + вечерта + '“, а „+“ ще запише в ' + дн1
    });
  }

  // 🔴 ВТОРОТО: натискането трябва да продължи от показаното, не да „скочи“
  await натисни(W, п.root, плюсове[0], {});
  const следКлик = String(num.textContent);
  let склад = {};
  try { склад = JSON.parse(W.localStorage.getItem('bl_diapers') || '{}'); } catch (e) {}
  const вНовияДен = (склад[дн1] || {}).wet;
  if (String(+следПолунощ + 1) !== следКлик) {
    находки.push({
      тежест: 'RED',
      вид: '🔴 ПОЛУНОЩ: числото СКАЧА при първото докосване (показано ≠ записано)',
      чий: 'js/rooms2.js',
      къде: 'Моето бебе · Пелени днес · „+“ в 00:10',
      кой: 'на екрана „' + следПолунощ + '“ → „' + следКлик + '“; в паметта ' + дн0 + '.wet=' + ((склад[дн0] || {}).wet) + ' и ' + дн1 + '.wet=' + вНовияДен
    });
  }
  // 🔴 ТРЕТОТО: вчерашните числа НЕ бива да са изтрити
  if ((склад[дн0] || {}).wet !== 4) {
    находки.push({
      тежест: 'RED', вид: '🔴 ПОЛУНОЩ: вчерашните числа са ЗАГУБЕНИ след първото докосване',
      чий: 'js/rooms2.js', къде: 'Моето бебе · Пелени днес',
      кой: 'вчера ' + дн0 + '.wet=' + ((склад[дн0] || {}).wet) + ' (беше 4)'
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 6. САМОПРОВЕРКА — уредът в ДВЕТЕ ПОСОКИ
// ═══════════════════════════════════════════════════════════

async function самопроверка() {
  const редове = [];
  let паднали = 0, проверени = 0;
  const пробвай = (име, ок, детайл) => {
    проверени++;
    редове.push((ок ? '  ✅ ' : '  ❌ ') + име + (детайл ? ' — ' + детайл : ''));
    if (!ок) паднали++;
  };

  // A. зареждат ли се файловете и строят ли се стаите
  {
    const { W, беди } = прозорецСМоите();
    пробвай('Зареждане: 7-те файла минават без грешка', беди.length === 0, беди.join('; '));
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    let карти = 0, гърмящи = [];
    for (const с of СТАИ) {
      const p = построй(W, с);
      if (p.беда) гърмящи.push(с + ' → ' + p.беда);
      карти += p.root.querySelectorAll('.jr-card').length;
    }
    пробвай('Строеж: нито една от 9-те стаи не гърми', гърмящи.length === 0, гърмящи.join('; '));
    пробвай('Строеж: излизат поне 30 карти (иначе мерим празно)', карти >= 30, 'излязоха ' + карти);
  }

  // B. описът брои ли това, което наистина е там
  {
    const о = опис();
    // 🪤 „60 слушателя“ идваше от `grep -c`, а той брои РЕДОВЕ с попадение, не
    //    попаденията. `grep -o | wc -l` дава 62 в rooms2 и 95 общо (62+7+12+6+8).
    //    Числото в заданието беше подценено с два слушателя — а точно те живеят
    //    на редове с ПО ДВА addEventListener (rooms2.js:297 и 2049).
    //    25.08: котвата мръдна 62→63 (95→96), защото самата поправка на
    //    „Не-списъкът“ добави слушател. СВЕРЕНО НА РЪКА в тази сесия:
    //    `grep -o addEventListener js/rooms2.js | wc -l` → 63.
    const r2 = о.редове.find(x => x.файл === 'js/rooms2.js');
    пробвай('Опис: js/rooms2.js дава 63 слушателя (grep -o, не grep -c)', r2 && r2.брой === 63, r2 ? 'даде ' + r2.брой : 'липсва');
    пробвай('Опис: общо 96 слушателя в 5-те файла (63+7+12+6+8)', о.общо === 96, 'даде ' + о.общо);
    пробвай('Опис: поне 40 слушателя пипат ключ в паметта',
      о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.ключове.length).length, 0) >= 40);
    const заг = моитеЗаглавия();
    пробвай('Опис: намерени са поне 30 МОИ заглавия на карти', заг.size >= 30, 'намерени ' + заг.size);
  }

  // B2. 🪤 ОБРАТНАТА ПОСОКА — мярката брои ли КОМЕНТАРИ вместо екранен текст
  {
    const самоКоментар = 'const с = load(k, []);   // пресен прочит ПРЕДИ записа\n save(k, с); draw();';
    const истински = 'save(k, v); btn.textContent = "✔ Запазено";';
    const извинениеВКоментар = '// тук има if (!save( в коментар\n save(k, v); b.textContent = "✔ Запазено";';
    const низСНаклонени = 'a.href = "https://x//y"; save(k, v); b.textContent = "✔ Запазено";';
    пробвай('ОБРАТНО: „записа“ САМО в коментар НЕ е обявяване на успех',
      !УСПЕХ.test(безКоментари(самоКоментар)));
    пробвай('ОБРАТНО: „✔ Запазено“ в НИЗ си остава обявяване на успех',
      УСПЕХ.test(безКоментари(истински)));
    пробвай('ОБРАТНО: `if (!save(` в КОМЕНТАР не извинява лъжеца',
      !/if\s*\(\s*!?\s*save\s*\(/.test(безКоментари(извинениеВКоментар)));
    пробвай('ОБРАТНО: „//“ вътре в низ не изяжда останалото',
      УСПЕХ.test(безКоментари(низСНаклонени)));
    пробвай('ОБРАТНО: истински `if (!save(` пази успеха',
      /if\s*\(\s*!?\s*save\s*\(/.test(безКоментари('if (!save(k, v)) return; b.textContent = "✔";')));
  }

  // C. 🪤 ОБРАТНАТА ПОСОКА №1 — пълната памет наистина ли гърми
  {
    const { W } = прозорецСМоите();
    W.localStorage._пълна = true;
    let гръмна = false;
    try { W.localStorage.setItem('проба', '1'); } catch (e) { гръмна = true; }
    пробвай('Пълна памет: setItem наистина хвърля (иначе проба 3 не мери нищо)', гръмна);
    пробвай('Пълна памет: отказите се броят', W.localStorage._откази === 1, 'преброени ' + W.localStorage._откази);
  }

  // D. 🪤 ОБРАТНАТА ПОСОКА №2 — подхвърлени мъртъв / жив / лъжец / честен
  {
    const { W } = прозорецСМоите();
    const root = W.document.createElement('div'); W.document.body.appendChild(root);
    const карта = W.document.createElement('section'); карта.className = 'jr-card';
    карта.appendChild(Object.assign(W.document.createElement('h4'), { className: 'jr-title' }));
    root.appendChild(карта);

    const мъртъв = W.document.createElement('button'); мъртъв.textContent = 'Нищо не правя';
    карта.appendChild(мъртъв);
    const r1 = await натисни(W, root, мъртъв, { напълни: false });
    пробвай('ОБРАТНО: подхвърлен МЪРТЪВ бутон се разпознава', !r1.записа && !r1.показа);

    const жив = W.document.createElement('button'); жив.textContent = 'Записвам';
    жив.addEventListener('click', () => { W.localStorage.setItem('bl_proba', '1'); жив.textContent = '✔ Записано'; });
    карта.appendChild(жив);
    const r2 = await натисни(W, root, жив, { напълни: false });
    пробвай('ОБРАТНО: жив бутон НЕ се обявява за мъртъв', r2.записа && r2.показа);

    const лъжец = W.document.createElement('button'); лъжец.textContent = 'Лъжа';
    лъжец.addEventListener('click', () => { try { W.localStorage.setItem('bl_lazha', '1'); } catch (e) {} лъжец.textContent = '✔ Записано'; });
    карта.appendChild(лъжец);
    W.localStorage._пълна = true;
    const r3 = await натисни(W, root, лъжец, { напълни: false });
    W.localStorage._пълна = false;
    пробвай('ОБРАТНО: ЛЪЖЕЦ (успех без запис) се хваща',
      r3.отказаниЗаписи > 0 && !r3.записа && r3.новУспех && !r3.честноПредупреждение);

    const честен = W.document.createElement('button'); честен.textContent = 'Честен';
    честен.addEventListener('click', () => {
      let ок = true;
      try { W.localStorage.setItem('bl_chesten', '1'); } catch (e) { ок = false; }
      честен.textContent = ок ? '✔ Записано' : '🤍 Паметта на телефона е пълна — не можах да го запазя.';
    });
    карта.appendChild(честен);
    W.localStorage._пълна = true;
    const r4 = await натисни(W, root, честен, { напълни: false });
    W.localStorage._пълна = false;
    пробвай('ОБРАТНО: ЧЕСТЕН бутон НЕ се обвинява в лъжа',
      !(r4.отказаниЗаписи > 0 && !r4.записа && r4.новУспех && !r4.честноПредупреждение));
  }

  // E. 🪤 ОБРАТНАТА ПОСОКА №3 — хваща ли се МАШИННА ДУМА
  {
    const { W } = прозорецСМоите();
    const root = W.document.createElement('div'); W.document.body.appendChild(root);
    const к = W.document.createElement('section'); к.className = 'jr-card';
    к.innerHTML = '<h4 class="jr-title">Проба</h4><p>Средно: NaN лв/месец.</p>';
    root.appendChild(к);
    const н = [], б = { проверениКарти: 0 };
    провериМашинниДуми(root, 'проба', н, б, () => 'проба');
    пробвай('ОБРАТНО: подхвърлена МАШИННА ДУМА (NaN) се хваща', н.length === 1, 'намерени ' + н.length);
    пробвай('ОБРАТНО: и се брои колко карти са ПРЕГЛЕДАНИ', б.проверениКарти === 1, 'преброени ' + б.проверениКарти);

    const н2 = [], б2 = { проверениКарти: 0 };
    к.innerHTML = '<h4 class="jr-title">Проба</h4><p>Средно: 42 лв/месец.</p>';
    провериМашинниДуми(root, 'проба', н2, б2, () => 'проба');
    пробвай('ОБРАТНО: чиста карта НЕ дава фалшива находка', н2.length === 0, 'намерени ' + н2.length);

    // 🪤 двете посоки на поправения филтър за отрицателни числа
    const н3 = [], б3 = { проверениКарти: 0 };
    к.innerHTML = '<h4 class="jr-title">Проба</h4><p>новородено: 45-60 мин; към 6 м.: 2-3 ч.</p>';
    провериМашинниДуми(root, 'проба', н3, б3, () => 'проба');
    пробвай('ОБРАТНО: честен диапазон „45-60 мин“ НЕ е находка', н3.length === 0, 'намерени ' + н3.length);
    const н4 = [], б4 = { проверениКарти: 0 };
    к.innerHTML = '<h4 class="jr-title">Проба</h4><p>Последно преди -27 мин.</p>';
    провериМашинниДуми(root, 'проба', н4, б4, () => 'проба');
    пробвай('ОБРАТНО: истинско „преди -27 мин“ СЕ хваща', н4.length === 1, 'намерени ' + н4.length);
  }

  // E2. 🪤 select() — дупката, която обвиняваше приложението
  {
    const { W } = прозорецСМоите();
    const i = W.document.createElement('input'); i.type = 'number';
    let гръмна = false;
    try { i.select(); } catch (e) { гръмна = true; }
    пробвай('DOM: input.select() съществува (иначе 29 фалшиви „ГРЪМВА“)', !гръмна);
  }

  // E3. 🪤 вечеИзбран — в двете посоки
  {
    const { W } = прозорецСМоите();
    const a = W.document.createElement('button'); a.className = 'jr-chip on';
    const b = W.document.createElement('button'); b.className = 'jr-chip';
    const c2 = W.document.createElement('button'); c2.setAttribute('aria-pressed', 'true');
    пробвай('ОБРАТНО: вече избран чип се разпознава (клас „on“)', вечеИзбран(a));
    пробвай('ОБРАТНО: вече избран се разпознава и по aria-pressed', вечеИзбран(c2));
    пробвай('ОБРАТНО: НЕизбран чип НЕ се извинява (иначе мъртвите се крият)', !вечеИзбран(b));
  }

  // F. 🪤 ОБРАТНАТА ПОСОКА №4 — знае ли уредът кои карти са МОИ
  {
    const заг = моитеЗаглавия();
    const чия = з => { for (const [k, f] of заг) if (з.indexOf(k) > -1) return f; return 'ЧУЖДА'; };
    // 🪤 детайлът ТРЯБВА да е от СЪЩИЯ низ като условието. Първата версия
    //    печаташе „даде ЧУЖДА“ до зелена отметка (питаше с по-къс низ) —
    //    доклад, който сам си противоречи.
    const проб = (име, низ, чакан) => пробвай(име, чия(низ) === чакан, 'даде ' + чия(низ));
    проб('ОБРАТНО: „Калкулатор на растежа“ се познава за rooms2', 'Калкулатор на растежа ⭐ къде е бебето', 'js/rooms2.js');
    проб('ОБРАТНО: „Разходите по месеци“ се познава за rooms16', 'Разходите по месеци 📊 истинските', 'js/rooms16.js');
    проб('ОБРАТНО: „Банята като храм“ се познава за rooms18', 'Банята като храм 🛁 15 минути', 'js/rooms18.js');
    пробвай('ОБРАТНО: чуждо заглавие НЕ се приписва на мен',
      чия('Съвсем измислена карта на съседа') === 'ЧУЖДА', 'даде ' + чия('Съвсем измислена карта на съседа'));
  }

  // G. 🪤 ОБРАТНАТА ПОСОКА №5 — стаята с ЧУЖДА основа наистина ли се пълни
  {
    const { W } = прозорецСМоите();
    Object.entries(ПРОФИЛИ['с бебе']()).forEach(([k, v]) => W.localStorage.setItem(k, JSON.stringify(v)));
    const p = построй(W, 'Жената в мен');
    пробвай('Чужда основа: „Жената в мен“ получава банята от rooms18',
      /Банята като храм/.test(p.root.textContent), 'намерено: ' + p.root.textContent.slice(0, 50));
    const p2 = построй(W, 'Лабораторията');
    пробвай('Чужда основа: „Лабораторията“ се строи без гръм', !p2.беда, p2.беда || '');
  }

  console.log('\n═══ САМОПРОВЕРКА НА УРЕДА ═══');
  редове.forEach(r => console.log(r));
  console.log('  ПРЕГЛЕДАНИ: ' + проверени + ' проверки · ПАДНАЛИ: ' + паднали);
  return паднали;
}

// ═══════════════════════════════════════════════════════════
// 7. ГЛАВНАТА
// ═══════════════════════════════════════════════════════════

async function главна() {
  const арг = process.argv.slice(2);
  if (арг.includes('--samoproverka')) { process.exit(await самопроверка() ? 1 : 0); }

  const самоОпис = арг.includes('--opis');
  const чужди = арг.includes('--chuzhdi');
  const стаяАрг = (арг.find(a => a.startsWith('--staya=')) || '').split('=')[1];

  console.log('═══════════════════════════════════════════════════');
  console.log('🖐️  ИНТЕРАКТИВНОТО в rooms2 / rooms15-18 — ' + new Date().toLocaleString('bg-BG'));
  console.log('═══════════════════════════════════════════════════\n');

  const о = опис();
  const заг = моитеЗаглавия();
  console.log('── 1. ОПИС (какво изобщо има) ──');
  о.редове.forEach(f => console.log('   ' + f.файл.padEnd(16) + ' → ' + String(f.брой).padStart(3) + ' слушателя  (' + f.редовеБрой + ' реда)'));
  const сКлюч = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.ключове.length).length, 0);
  const пишещи = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.пише).length, 0);
  const мълчащи = о.редове.reduce((s, f) => s + f.слушатели.filter(x => x.пише && !x.показва).length, 0);
  const лъжци = [];
  о.редове.forEach(f => f.слушатели.forEach(x => { if (x.пише && x.обявяваУспех && !x.пазиУспех) лъжци.push(x); }));
  console.log('   ' + 'ОБЩО'.padEnd(16) + ' → ' + String(о.общо).padStart(3) + ' слушателя · ПРЕГЛЕДАНИ ' + о.прегледаниРеда + ' реда · ' + заг.size + ' мои карти');
  console.log('   от тях: ' + сКлюч + ' пипат ключ · ' + пишещи + ' записват · ' + мълчащи + ' записват БЕЗ видим знак');
  console.log('   ⚠️  ' + лъжци.length + ' обявяват успех, БЕЗ да проверят дали записът е минал\n');

  if (самоОпис) {
    console.log('── ПОДРОБНО ──');
    о.редове.forEach(f => f.слушатели.forEach(x => {
      console.log('   ' + (f.файл.replace('js/', '') + ':' + x.ред).padEnd(18) + (x.функция || '').padEnd(20)
        + x.вид.padEnd(9) + (x.ключове.join(',') || '—').padEnd(30)
        + (x.пише ? 'ЗАПИС ' : '      ') + (x.показва ? 'ПОКАЗВА ' : '        ')
        + (x.обявяваУспех ? (x.пазиУспех ? 'успех✓пазен' : 'успех⚠НЕпазен') : ''));
    }));
    return 0;
  }

  console.log('── 2. ЖИВ ОБХОД (натиска и мери) ──');
  const { находки, броячи } = await обходи({ стая: стаяАрг, чужди });
  console.log('   ПРЕГЛЕДАНИ: ' + броячи.стаи + ' построени стаи · ' + броячи.карти + ' карти · '
    + броячи.елементи + ' интерактивни елемента · ' + броячи.натискания + ' натискания · '
    + броячи.презареждания + ' презареждания · ' + броячи.проверениКарти + ' карти сверени за машинни думи · '
    + броячи.полунощни + ' полунощни проби\n');

  const мои = находки.filter(н => н.чий !== 'ЧУЖДА');
  const чуждиН = находки.filter(н => н.чий === 'ЧУЖДА');

  const поВид = new Map();
  мои.forEach(н => {
    const k = н.тежест + ' | ' + н.вид;
    if (!поВид.has(k)) поВид.set(k, []);
    поВид.get(k).push(н);
  });
  if (!поВид.size) console.log('   ✅ Нула находки в МОИТЕ карти.');
  for (const [k, списък] of [...поВид.entries()].sort()) {
    console.log('   ' + k + '  (' + списък.length + ')');
    const видяни = new Set();
    списък.forEach(н => {
      const кратко = н.къде.replace(/^[^·]*· /, '');
      if (видяни.has(кратко)) return;
      видяни.add(кратко);
      if (видяни.size <= 14) console.log('      · [' + String(н.чий).replace('js/', '') + '] ' + кратко + (н.кой ? '  →  ' + н.кой : ''));
    });
    if (видяни.size > 14) console.log('      … и още ' + (видяни.size - 14) + ' различни места');
  }
  if (чуждиН.length) console.log('\n   (в ЧУЖДИ карти: ' + чуждиН.length + ' находки — не са мои за поправяне; --chuzhdi ги показва)');

  if (лъжци.length) {
    console.log('\n── 3. ОБЯВЯВАТ УСПЕХ, БЕЗ ДА ПРОВЕРЯТ ЗАПИСА (' + лъжци.length + ') ──');
    лъжци.forEach(x => console.log('   · ' + (x.файл.replace('js/', '') + ':' + x.ред).padEnd(18) + (x.функция || '').padEnd(20) + '[' + (x.ключове.join(',') || '—') + ']'));
  }

  const червени = мои.filter(н => н.тежест === 'RED').length;
  console.log('\n═══ ' + (червени ? '❌ ' + червени + ' ЧЕРВЕНИ в моите файлове' : '✅ ЧИСТО в моите файлове') + ' ═══');
  return червени ? 1 : 0;
}

if (require.main === module) {
  главна().then(k => process.exit(k)).catch(e => { console.error(e); process.exit(2); });
}
module.exports = { опис, обходи, самопроверка, прозорецСМоите, построй, МОИ };
