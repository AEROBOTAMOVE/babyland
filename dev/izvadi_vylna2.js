// Разглобява резултата на вълна 2 в двата формата, които сливачите приемат:
//   dev/nahodki/klyuchove_v2.json  → { "карта": ["ключ", …] }  (prilozhi_klyuchove.js)
//   dev/nahodki/karti_v2.json      → [ {id, room, title, core, tip, follow, keys, chips} ]
// Нищо не се записва в живите файлове тук — само се подрежда за гейта.
const fs = require('fs');
const ДНЕВНИК = process.argv[2];
const ИМЕ = process.argv[3] || 'v2';   // 09.09: беше заковано на v2
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай journal.jsonl'); process.exit(2); }

const редове = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = (typeof o.result === 'string') ? (() => { try { return JSON.parse(o.result); } catch (e) { return null; } })() : o.result;
  if (r && Array.isArray(r.results)) редове.push(...r.results);
}
const виждан = new Set();
const уник = редове.filter(r => { const k = r.index + '|' + r.reshenie; if (виждан.has(k)) return false; виждан.add(k); return true; });
console.log('редове: ' + редове.length + ' · уникални: ' + уник.length);

// ── проверка срещу ЖИВАТА база ───────────────────────────────────────────
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const има = new Set((KB.entries || []).map(e => e.id));
const заети = new Map();
for (const e of (KB.entries || [])) for (const k of (e.keys || [])) заети.set(String(k).toLowerCase(), e.id);

const ключове = {}; const карти = []; const откази = [];
let общоКлючове = 0, махнатиЗаети = 0;
for (const r of уник) {
  if (r.reshenie === 'KLYUCHOVE') {
    const ц = r.celeva_karta;
    if (!ц) { откази.push(r.index + ': KLYUCHOVE без целева карта'); continue; }
    if (!има.has(ц)) { откази.push(r.index + ': няма карта ' + ц); continue; }
    const нови = (r.novi_klyuchove || []).map(k => String(k).toLowerCase().trim())
      .filter(k => k.length > 4 && !/["']/.test(k));
    const свободни = нови.filter(k => !заети.has(k));
    махнатиЗаети += нови.length - свободни.length;
    if (!свободни.length) { откази.push(r.index + ': всичките ключове са заети (' + ц + ')'); continue; }
    ключове[ц] = (ключове[ц] || []).concat(свободни);
    свободни.forEach(k => заети.set(k, ц));      // и вътре в набора не се повтарят
    общоКлючове += свободни.length;
  } else if (r.reshenie === 'NOVA_KARTA') {
    const к = r.nova_karta;
    if (!к || !к.id) { откази.push(r.index + ': NOVA_KARTA без тяло'); continue; }
    if (има.has(к.id)) { откази.push(r.index + ': id вече съществува — ' + к.id); continue; }
    if (карти.some(x => x.id === к.id)) { откази.push(r.index + ': id се повтаря в набора — ' + к.id); continue; }
    к.chips = [];
    к.keys = (к.keys || []).map(k => String(k).toLowerCase().trim()).filter(k => k.length > 4 && !заети.has(k));
    к.keys.forEach(k => заети.set(k, к.id));
    карти.push(к);
  }
}
for (const ц of Object.keys(ключове)) ключове[ц] = [...new Set(ключове[ц])];

fs.mkdirSync('dev/nahodki', { recursive: true });
fs.writeFileSync('dev/nahodki/klyuchove_' + ИМЕ + '.json', JSON.stringify(ключове, null, 1));
fs.writeFileSync('dev/nahodki/karti_' + ИМЕ + '.json', JSON.stringify(карти, null, 1));
console.log('');
console.log('🔑 ключове: ' + общоКлючове + ' върху ' + Object.keys(ключове).length + ' карти  (махнати вече заети: ' + махнатиЗаети + ')');
console.log('🃏 нови карти: ' + карти.length + '  → ' + карти.map(k => k.id).join(', '));
console.log('   с под 8 ключа: ' + карти.filter(k => k.keys.length < 8).map(k => k.id + '(' + k.keys.length + ')').join(', '));
if (откази.length) { console.log('\n⚠️ пропуснати: ' + откази.length); откази.forEach(x => console.log('   ' + x)); }
