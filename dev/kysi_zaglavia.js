const fs = require('fs'), vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
process.chdir(К);
const { zaredi } = require(К + 'dev/pyasachnik.js');
const ПИШИ = process.argv.includes('--pishi');

// същият превод като в dev/dostizhimost.js — пита се ТЕМАТА, не редакторското
// заглавие: майка пише „целевите помощи", не „Целевите помощи — отоплението и
// другите, за които не се говори".
const катоВъпрос = т => String(т || '')
  .replace(/[„“"”]/g, ' ')
  .replace(/\s*[—–-]\s*.*$/, '')
  .replace(/[?!.]+$/, '')
  .replace(/\s+/g, ' ').trim();

const питай = (W, т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null;
  } catch (e) { return null; }
};

const W0 = zaredi(null);
const ЗАЕТИ = new Map();
for (const e of W0.KB.entries) for (const k of (e.keys || [])) ЗАЕТИ.set(String(k).toLowerCase(), e.id);

// поясът: първият ключ на всяка карта
const снимка = W => { const м = new Map(); for (const e of W.KB.entries) { const k = (e.keys || [])[0]; if (k) м.set(e.id, питай(W, String(k), e.room)); } return м; };
const ПРЕДИ = снимка(W0);

const болни = [];
for (const e of W0.KB.entries) {
  const в = катоВъпрос(e.title);
  if (в.length < 6) continue;
  if (питай(W0, в, e.room) !== e.id) болни.push({ e: e, в: в });
}
console.log('');
console.log('  🎯 карти, чиято ТЕМА (заглавие до тирето) не ги намира: ' + болни.length);

let s = fs.readFileSync('js/kb.js', 'utf8');
let сложени = 0; const пропуснати = [];
for (const { e, в } of болни) {
  const ключ = в.toLowerCase();
  if (ЗАЕТИ.has(ключ)) { пропуснати.push(e.id + ': „' + ключ + '" вече е на ' + ЗАЕТИ.get(ключ)); continue; }
  const и = s.indexOf("      id: '" + e.id + "',");
  if (и < 0) { пропуснати.push(e.id + ': котвата липсва'); continue; }
  const кi = s.indexOf('keys: [', и); const край = s.indexOf(']', кi);
  s = s.slice(0, край) + ", '" + ключ.replace(/'/g, '') + "'" + s.slice(край);
  ЗАЕТИ.set(ключ, e.id);
  сложени++;
}
console.log('  🔑 сложени: ' + сложени + '   ·   пропуснати: ' + пропуснати.length);
for (const п of пропуснати.slice(0, 12)) console.log('     ⚪ ' + п);
if (!сложени) { console.log(''); process.exit(0); }

try { new vm.Script(s); } catch (e) { console.log('🔴 ЛОШ СИНТАКСИС: ' + e.message.slice(0, 140)); process.exit(2); }
const истински = fs.readFileSync('js/kb.js', 'utf8');
fs.writeFileSync('js/kb.js', s);
let СЛЕД, болниСлед;
try {
  const W1 = zaredi(null);
  СЛЕД = снимка(W1);
  болниСлед = W1.KB.entries.filter(e => { const в = катоВъпрос(e.title); return в.length >= 6 && питай(W1, в, e.room) !== e.id; }).length;
} finally { if (!ПИШИ) fs.writeFileSync('js/kb.js', истински); }

let счупени = 0; const списък = [];
for (const [id, п] of ПРЕДИ) {
  const с = СЛЕД.get(id);
  if (п === с) continue;
  if (п === id && с !== id) { счупени++; списък.push('     🔴 ' + id + ' → ' + (с || 'ТИШИНА')); }
}
console.log('');
console.log('  ── ПОЯС (първият ключ на всяка карта, ' + ПРЕДИ.size + ') ──');
console.log('     🔴 счупени: ' + счупени);
for (const р of списък.slice(0, 12)) console.log(р);
console.log('  ── недостижими по ТЕМА: ' + болни.length + ' → ' + болниСлед + ' ──');
console.log('');
if (!ПИШИ) { console.log('  СУХО. За писане: --pishi'); console.log(''); process.exit(0); }
if (счупени) { fs.writeFileSync('js/kb.js', истински); console.log('  🔴 ' + счупени + ' счупени — НИЩО не е записано'); process.exit(2); }
console.log('  ✅ записани ' + сложени + ' ключа');
console.log('');
