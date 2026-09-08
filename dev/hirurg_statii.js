#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 📚🔪 ХИРУРГ ПО СТАТИИТЕ — темата на статията да стига до нейната карта
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (07.09.2026): dev/izpit_statii.js пита заглавието на всяка статия и
// проверява дали стига до КАРТАТА, за която статията вече е вързана.
// В началото на деня: 233 тишини от 1143. Сега: 99. От тях 17 са заглавия на
// СПРАВОЧНИЦИ („Български здравни портали: Puls, Framar…"), които никоя майка
// не пише. Остават 82 истински.
//
// И пак излиза законът на този проект: КАРТИТЕ СЪЩЕСТВУВАТ, ДУМИТЕ ГИ НЯМА.
//     „Амниотомията: кукичката…"          →  nb-pukat-mehura
//     „Застоят: когато разкритието стои"  →  nb-ne-napredva
//     „Разкопчава колана, докато шофираш" →  in3-stolche-razkopchava
//     „Мое! — за споделянето"             →  rz-spodelyane
//
// ЗАЩО ТОЗИ УРЕД НЕ ГАДАЕ: не търси „най-близка" карта по думи. Статията ВЕЧЕ
// сочи към конкретни карти през полето `lib`. Ключът отива точно там —
// по връзка, не по прилика. Гадаенето вече ме подведе днес веднъж (вързах
// ключове за кървене от носа върху картата за гестационен диабет).
//
// КАКВО СЛАГА: темата на статията — заглавието до тирето/двоеточието, точно
// както го реже izpit_statii при питането. Ако темата е под 3 думи или вече е
// заета от друга карта, се пропуска и се КАЗВА.
//
// 🩹 ПОЯС: първият ключ на всяка карта преди и след. Нула счупени или нищо
//    не се записва.
//
// ⚠️ ПИШЕ в js/kb.js САМО с --pishi.  ПЪТ НАЗАД: git checkout -- js/kb.js
// ПУСКАНЕ: node dev/hirurg_statii.js [--pishi]
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ПИШИ = process.argv.includes('--pishi');
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));

// същият превод като в dev/izpit_statii.js — темата, не редакторското заглавие
const катоТема = т => String(т || '')
  .replace(/[„“"”]/g, ' ')
  .replace(/\s*[—–:]\s*.*$/, '')
  .replace(/[?!.]+$/, '')
  .replace(/\s+/g, ' ').trim().toLowerCase();

// справочниците не са майчини въпроси и не получават ключове
const СПРАВОЧНИК = /портал|източниц|блог|bg-mamma|карта:|маршрут|навигационна|каузални|дазд|мтсп|грао|оле мале|тематична карта|българия 20\d\d|експертни|институционал|инфлуенсър|бранд сайтове|бранд клубове|частни болници|магазини/i;

const питай = (W, т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null;
  } catch (e) { return null; }
};
const снимка = W => {
  const м = new Map();
  for (const e of W.KB.entries) { const k = (e.keys || [])[0]; if (k) м.set(e.id, питай(W, String(k), e.room)); }
  return м;
};

const W0 = zaredi(null);
const ПРЕДИ = снимка(W0);
const ЗАЕТИ = new Map();
for (const e of W0.KB.entries) for (const k of (e.keys || [])) ЗАЕТИ.set(String(k).toLowerCase(), e.id);
const КАРТА = new Map(W0.KB.entries.map(e => [e.id, e]));

const индекс = JSON.parse(fs.readFileSync(path.join('lib', 'index.json'), 'utf8'));
const статии = (Array.isArray(индекс.items) ? индекс.items : Object.values(индекс.items || {}))
  .filter(x => x && x.id && x.t);
if (статии.length < 500) { console.error('\n  🔴 СЛЯП УРЕД: ' + статии.length + ' статии\n'); process.exit(2); }

// статия → вързаните ѝ карти
const къмКарти = new Map();
for (const e of W0.KB.entries) {
  for (const л of (Array.isArray(e.lib) ? e.lib : (e.lib ? [e.lib] : []))) {
    let н = къмКарти.get(л); if (!н) { н = []; къмКарти.set(л, н); } н.push(e.id);
  }
}

const план = []; const пропуснати = [];
for (const с of статии) {
  const цел = къмКарти.get(с.id);
  if (!цел || !цел.length) continue;
  const стая = с.r || КАРТА.get(цел[0]).room;
  const о = питай(W0, с.t, стая);
  if (о && цел.indexOf(о) > -1) continue;            // вече стига
  if (СПРАВОЧНИК.test(с.t)) { пропуснати.push([с.t, 'справочник — майка не го пише']); continue; }
  const тема = катоТема(с.t);
  if (тема.split(' ').filter(Boolean).length < 3) { пропуснати.push([с.t, 'темата е под 3 думи: „' + тема + '"']); continue; }
  if (ЗАЕТИ.has(тема)) { пропуснати.push([с.t, 'темата вече е на ' + ЗАЕТИ.get(тема)]); continue; }
  const карта = цел[0];
  if (!КАРТА.has(карта)) { пропуснати.push([с.t, 'вързаната карта не съществува']); continue; }
  план.push({ карта: карта, тема: тема, заглавие: с.t });
  ЗАЕТИ.set(тема, карта);
}

console.log('');
console.log('  📚🔪 ХИРУРГ ПО СТАТИИТЕ');
console.log('     статии с вързана карта, чието заглавие НЕ стига до нея: ' + (план.length + пропуснати.length));
console.log('     ✅ получават темата си като ключ : ' + план.length);
console.log('     ⚪ пропуснати                    : ' + пропуснати.length);
for (const [т, з] of пропуснати.slice(0, 12)) console.log('        · ' + т.slice(0, 48) + '  — ' + з);
if (пропуснати.length > 12) console.log('        … и още ' + (пропуснати.length - 12));
if (!план.length) { console.log(''); process.exit(0); }

let s = fs.readFileSync('js/kb.js', 'utf8');
let сложени = 0;
for (const п of план) {
  // 🪤 07.09: част от картите са с ДВОЙНИ кавички и на ЕДИН ред
  //    (id: "pp-kosopad", от: 0, до: 18, lib: [...]). Първата версия търсеше
  //    само единични кавички и обяви 12 котви за липсващи. Не липсваха —
  //    просто бяха написани другояче. Уред, който познава един стил, мълчи
  //    върху другия и това изглежда като чиста работа.
  let и = s.indexOf("      id: '" + п.карта + "',");
  if (и < 0) и = s.indexOf('      id: "' + п.карта + '",');
  if (и < 0) { console.log('     🔴 котвата липсва ' + п.карта); continue; }
  const кi = s.indexOf('keys: [', и); const край = s.indexOf(']', кi);
  s = s.slice(0, край) + ", '" + п.тема.replace(/'/g, '') + "'" + s.slice(край);
  сложени++;
}
try { new vm.Script(s); } catch (e) { console.log('\n  🔴 ЛОШ СИНТАКСИС: ' + e.message.slice(0, 140) + '\n'); process.exit(2); }

const истински = fs.readFileSync('js/kb.js', 'utf8');
fs.writeFileSync('js/kb.js', s);
let СЛЕД, останали;
try {
  const W1 = zaredi(null);
  СЛЕД = снимка(W1);
  останали = статии.filter(с => {
    const цел = къмКарти.get(с.id); if (!цел || !цел.length) return false;
    const о = питай(W1, с.t, с.r || КАРТА.get(цел[0]).room);
    return !(о && цел.indexOf(о) > -1);
  }).length;
} finally { if (!ПИШИ) fs.writeFileSync('js/kb.js', истински); }

let счупени = 0; const списък = [];
for (const [id, п] of ПРЕДИ) {
  const с2 = СЛЕД.get(id);
  if (п === с2) continue;
  if (п === id && с2 !== id) { счупени++; списък.push('     🔴 ' + id + ' → ' + (с2 || 'ТИШИНА')); }
}
console.log('');
console.log('  ── ПОЯС (' + ПРЕДИ.size + ' въпроса) ── счупени: ' + счупени);
for (const р of списък.slice(0, 10)) console.log(р);
console.log('  ── статии, които не стигат до картата си: ' + (план.length + пропуснати.length) + ' → ' + останали + ' ──');
console.log('');
if (!ПИШИ) { console.log('  СУХО. За писане: node dev/hirurg_statii.js --pishi'); console.log(''); process.exit(0); }
if (счупени) { fs.writeFileSync('js/kb.js', истински); console.log('  🔴 ' + счупени + ' счупени — НИЩО не е записано'); process.exit(2); }
console.log('  ✅ записани ' + сложени + ' ключа');
console.log('');
