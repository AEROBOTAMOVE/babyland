// ═══════════════════════════════════════════════════════════════════════
// 🔢 ИЗОСТАНАЛИТЕ ВЕРСИИ — поправка, която НИКОГА не стига до майката
//
// ЗАЩО СЪЩЕСТВУВА (08.09.2026, хванато НА ЖИВО, не предположено):
//   В браузъра helper.js беше 314 594 байта. На диска — 315 541. Разлика
//   947 байта, в които стои пазачът „детето се блъсна в мен ≠ насилие".
//   Приложението вдигаше НАСИЛИЕ на невинно изречение, а поправката стоеше
//   написана, изпитана и комитната. Просто `?v=170` не беше вдигнато и
//   service worker-ът (кеш-първо по ТОЧЕН URL) връщаше стария файл. Мълчаливо.
//
//   `dev/vdigni_versii.js` вдига само пипнатото в ЕДИН комит (HEAD~1..HEAD).
//   Пропусне ли се веднъж, файлът остава изостанал ЗАВИНАГИ — и нищо не крещи.
//   Този проверчик гледа ЦЯЛАТА история, не последния комит.
//
// КАК МЕРИ (за всеки `path?v=N` в index.html):
//   а) последният комит, пипнал САМИЯ файл
//   б) последният комит, вкарал точно низа `path?v=N` в index.html
//   изостанал ⇔ (а) е СЛЕД (б)   ИЛИ   файлът е мръсен в работното дърво
//
// ПУСКАНЕ: node dev/versii_izostanali.js
// ИЗХОД:   0 = всичко стига до майката · 1 = има изостанали · 2 = проверчикът е сляп
// ПЪТ НАЗАД: няма нужда — този файл НЕ ПИШЕ нищо, само чете git и index.html.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const g = (cmd) => { try { return cp.execSync(cmd, { encoding: 'utf8', cwd: ROOT, stdio: ['ignore','pipe','ignore'] }).trim(); } catch (e) { return ''; } };
const NL_ = String.fromCharCode(10);
const QUOTE_ = String.fromCharCode(34);
// същото като g(), но БЕЗ trim: в „git status --porcelain" водещите
// интервали са ДАННИ, а не украса — точно този trim ме заслепи.
const g_raw = (cmd) => { try { return cp.execSync(cmd, { encoding: 'utf8', cwd: ROOT, stdio: ['ignore','pipe','ignore'] }); } catch (e) { return ''; } };

if (!g('git rev-parse --is-inside-work-tree')) { console.log('🔴 не е git хранилище — проверчикът е СЛЯП'); process.exit(2); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const активи = [];
const re = /(?:src|href)="((?:js|css)\/[^"?]+)\?v=(\d+)"/g;
let m; while ((m = re.exec(html))) активи.push({ файл: m[1], версия: m[2] });

// 🪞 САМОПРОВЕРКА: проверчик, който не намира активи, ще обяви „чисто" за
//    всичко. Точно това е формата на слепия пазач, който вече ме е лъгал.
if (активи.length < 50) { console.log('🔴 намерени само ' + активи.length + ' актива в index.html — СЛЯП'); process.exit(2); }

// 🔴 08.09, СОБСТВЕНАТА МИ ДУПКА, хваната час след като написах пазача:
//   помощната g() прави .trim() върху ЦЕЛИЯ изход. „git status --porcelain"
//   започва всеки ред с два знака за състояние (" M css/anim.css"), затова
//   trim-ът изяжда водещия интервал САМО НА ПЪРВИЯ РЕД. После рязането от
//   трети знак реже от грешно място и първият мръсен файл излиза като
//   „ss/anim.css" — тоест НЕ СЪВПАДА с нищо и минава за чист.
//   Пазачът беше СЛЯП ЗА ЕДИН ФАЙЛ ВСЕКИ ПЪТ, а кой — по азбучен ред.
//   Днес се падна css/anim.css: пипнат, невдигнат, обявен за чист.
//   ЛЕКЪТ: разбор по РЕД (издържа и преименуване „A -> B", и цитирани
//   пътища), плюс самопроверка, че броят пътища съвпада с броя редове.
const _st = g_raw("git status --porcelain");
const мръсни = new Set();
const _редовеСт = _st.split(NL_).filter(x => x.trim());
for (const ред of _редовеСт) {
  let п = ред.slice(3).trim();
  const стрелка = п.indexOf(" -> ");
  if (стрелка > -1) п = п.slice(стрелка + 4);
  if (п.charAt(0) === QUOTE_ && п.charAt(п.length - 1) === QUOTE_) п = п.slice(1, -1);
  if (п) мръсни.add(п);
}
// 🪞 САМОПРОВЕРКА: колкото непразни реда, толкова пътища.
if (мръсни.size !== _редовеСт.length) {
  console.log("🔴 разборът на git status се разминава: " + мръсни.size + " пътя от " + _редовеСт.length + " реда — СЛЯП");
  process.exit(2);
}

console.log('');
console.log('🔢 ИЗОСТАНАЛИ ВЕРСИИ — стига ли поправката до майката');
console.log('');
console.log('   активи с ?v= в index.html: ' + активи.length);
console.log('');

const изостанали = [];
for (const а of активи) {
  if (!fs.existsSync(path.join(ROOT, а.файл))) { изостанали.push({ ...а, защо: 'ФАЙЛЪТ ЛИПСВА' }); continue; }
  if (мръсни.has(а.файл)) { изостанали.push({ ...а, защо: 'некомитнат на диска' }); continue; }
  const пипнат = g('git log -1 --format=%ct -- "' + а.файл + '"');
  // -S брои появите на низа: комитът, който е вкарал ТОЧНО тази версия
  const вдигнат = g('git log -1 --format=%ct -S"' + а.файл + '?v=' + а.версия + '" -- index.html');
  if (!пипнат) continue;                       // файлът не е в историята — нов, ще влезе с комита
  if (!вдигнат) { изостанали.push({ ...а, защо: 'този номер го няма в историята на index.html' }); continue; }
  if (Number(пипнат) > Number(вдигнат)) {
    const дни = Math.round((Number(пипнат) - Number(вдигнат)) / 86400 * 10) / 10;
    изостанали.push({ ...а, защо: 'файлът е пипан ' + дни + ' дни СЛЕД вдигането' });
  }
}

// ── режим ПИША: вдига само изостаналите, с един номер, и прави копие ──
const ПИША = process.argv.includes("--pishi");

if (!изостанали.length) {
  console.log('   ✅ нула изостанали — всяка поправка стига до върналата се майка');
  process.exit(0);
}
console.log('   🔴 ИЗОСТАНАЛИ: ' + изостанали.length + ' — тези поправки НЕ стигат до майката');
console.log('');
for (const и of изостанали) console.log('      ' + и.файл + '?v=' + и.версия + '  ← ' + и.защо);
console.log('');
console.log('   ЛЕК: вдигни номера в index.html (и CACHE в sw.js), после провери пак.');

if (!ПИША) { console.log(""); console.log("   пусни с --pishi за да ги вдигна"); process.exit(1); }

// 🧷 ПЪТ НАЗАД ПРЕДИ ДЕЙСТВИЕТО: копие на index.html до .PREDI_IZOSTANALI
fs.writeFileSync(path.join(ROOT, "index.html.PREDI_IZOSTANALI"), html);
let нов = html, вдигнати = 0;
for (const и of изостанали) {
  if (и.защо === "ФАЙЛЪТ ЛИПСВА") { console.log("   ⏭ пропускам липсващ: " + и.файл); continue; }
  const стар = и.файл + "?v=" + и.версия;
  const нова = String(Number(и.версия) + 1);
  const цел  = и.файл + "?v=" + нова;
  if (нов.indexOf(стар) < 0) { console.log("   🔴 не намерих в index.html: " + стар); continue; }
  нов = нов.split(стар).join(цел);
  console.log("   ⬆ " + и.файл + ": " + и.версия + " → " + нова);
  вдигнати++;
}
if (!вдигнати) { console.log("   нищо не се вдигна"); process.exit(1); }
fs.writeFileSync(path.join(ROOT, "index.html"), нов);
console.log(""); console.log("   ✅ вдигнати " + вдигнати + " · копие: index.html.PREDI_IZOSTANALI");
console.log("   пусни проверчика ПАК — трябва да каже нула.");
process.exit(0);
process.exit(1);
