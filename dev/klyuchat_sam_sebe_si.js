// ═══════════════════════════════════════════════════════════════════════
// 🔑 УЛУЧВА ЛИ ВСЕКИ КЛЮЧ СОБСТВЕНАТА СИ КАРТА
//
// ЗАЩО (08.09.2026): същата евтина мярка, която същия ден намери ЧЕТИРИ
//   заглушени спешности по оста на флаговете. Тук по оста на КАРТИТЕ:
//   ключ, който не вади собствената си карта, е мъртво тегло — написан е,
//   брои се в „27 791 ключа", и не работи.
//
//   Две различни причини за провал, и двете важни:
//     🔀 КРАДЕЦ — друга карта го бие. Значи две карти се бият за един ключ.
//     ⬜ НИЩО   — матчърът не намира нищо. Ключът е под прага.
//
// ПУСКАНЕ: node dev/klyuchat_sam_sebe_si.js [--vsichki] [--prag=N]
//   без флаг: извадка ~3000 ключа · с --vsichki: всичките
// ИЗХОД: 0 = под прага · 1 = над прага · 2 = уредът е сляп
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════════════════
const { zaredi } = require('./pyasachnik.js');
const ВСИЧКИ = process.argv.includes('--vsichki');
const ПРАГ = Number((process.argv.find(a => a.indexOf('--prag=') === 0) || '--prag=8').split('=')[1]);

const W = zaredi(null);
const карти = W.KB.entries;
if (!карти || карти.length < 500) { console.log('🔴 карти: ' + (карти || []).length + ' — СЛЯП'); process.exit(2); }

const двойки = [];
for (const e of карти) for (const k of (e.keys || [])) двойки.push([String(k), e]);
if (двойки.length < 5000) { console.log('🔴 двойки: ' + двойки.length + ' — СЛЯП'); process.exit(2); }

const стъпка = ВСИЧКИ ? 1 : Math.max(1, Math.round(двойки.length / 3000));
const извадка = двойки.filter((_, i) => i % стъпка === 0);

console.log('');
console.log('🔑 УЛУЧВА ЛИ ВСЕКИ КЛЮЧ СОБСТВЕНАТА СИ КАРТА');
console.log('');
console.log('   карти: ' + карти.length + ' · ключове: ' + двойки.length);
console.log('   проверявам: ' + извадка.length + (ВСИЧКИ ? ' (всички)' : ' (всеки ' + стъпка + '-и)'));
console.log('');

const крадци = new Map();   // „кой краде от кого" → брой
const нищо = [];
let вярно = 0;
for (const [k, e] of извадка) {
  let r = null;
  try { r = W.BL_MATCH(k, e.room); } catch (err) { r = null; }
  if (r && r.id === e.id) { вярно++; continue; }
  if (!r) { нищо.push([k, e.id]); continue; }
  const ключ = r.id + ' ⟵ ' + e.id;
  крадци.set(ключ, (крадци.get(ключ) || 0) + 1);
}

const крадени = [...крадци.values()].reduce((a, b) => a + b, 0);
const проц = (x) => (x / извадка.length * 100).toFixed(1) + '%';
console.log('   ✅ вярна карта : ' + вярно + '  (' + проц(вярно) + ')');
console.log('   🔀 друга карта : ' + крадени + '  (' + проц(крадени) + ')');
console.log('   ⬜ нищо        : ' + нищо.length + '  (' + проц(нищо.length) + ')');
console.log('');

const топ = [...крадци.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
if (топ.length) {
  console.log('   ── най-честите сблъсъци (крадец ⟵ ограбен) ──');
  for (const [к, n] of топ) console.log('      ' + String(n).padStart(4) + '×  ' + к);
}
if (нищо.length) {
  console.log('');
  console.log('   ── ключове, които не вадят НИЩО ──');
  for (const [k, id] of нищо.slice(0, 15)) console.log('      ' + id.padEnd(24).slice(0, 24) + ' « ' + k + ' »');
  if (нищо.length > 15) console.log('      … и още ' + (нищо.length - 15));
}

const лошо = (крадени + нищо.length) / извадка.length * 100;
console.log('');
console.log('   общо неулучени: ' + лошо.toFixed(1) + '%  (праг ' + ПРАГ + '%)');
process.exit(лошо > ПРАГ ? 1 : 0);
