// Разглобява ГОЛЯМАТА реколта (28 агента, 14 среза по стая и възраст) в
// двата формата, които сливачите приемат. Агентите не са давали id и стая
// на новите карти — тук се извеждат: стаята от името на среза, id-то от
// заглавието по транслитерация.
//
// НИЩО не се пише в живите файлове. Само подрежда за гейта.
const fs = require('fs');
const ДНЕВНИК = process.argv[2];
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай journal.jsonl'); process.exit(2); }

const СТАИ = ['Бременност', 'Моето бебе', 'Здраве и SOS', 'Захранване',
  'Развитие и игри', 'Дневник на мама', 'Жената в мен', 'Инструменти', 'Лабораторията'];
const ПРЕФИКС = {
  'Бременност': 'g3-', 'Моето бебе': 'g3b-', 'Здраве и SOS': 'g3z-', 'Захранване': 'g3h-',
  'Развитие и игри': 'g3r-', 'Дневник на мама': 'g3d-', 'Жената в мен': 'g3j-',
  'Инструменти': 'g3i-', 'Лабораторията': 'g3l-',
};
const ЛАТ = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: '', ю: 'yu', я: 'ya' };
const слуг = s => String(s).toLowerCase().split('').map(c => (ЛАТ[c] !== undefined ? ЛАТ[c] : (/[a-z0-9]/.test(c) ? c : '-')))
  .join('').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 34).replace(/-$/, '');

const рез = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = (typeof o.result === 'string') ? (() => { try { return JSON.parse(o.result); } catch (e) { return null; } })() : o.result;
  if (r && Array.isArray(r.nahodki)) рез.push(r);
}
console.log('срезове с находки: ' + рез.length);

const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const има = new Set((KB.entries || []).map(e => e.id));
const заети = new Map();
for (const e of (KB.entries || [])) for (const k of (e.keys || [])) заети.set(String(k).toLowerCase(), e.id);

const ключове = {}; const карти = []; const откази = [];
let общоК = 0, махнати = 0, дублиИд = 0;
const видениВъпроси = new Set();

for (const r of рез) {
  const стая = СТАИ.find(с => String(r.srez || '').indexOf(с) >= 0) || null;
  for (const н of r.nahodki) {
    const въпрос = String(н.vypros || '').trim();
    if (!въпрос || видениВъпроси.has(въпрос)) continue;
    видениВъпроси.add(въпрос);
    const нови = (н.novi_klyuchove || []).map(k => String(k).toLowerCase().trim())
      .filter(k => k.length > 4 && !/["']/.test(k) && !/[А-Я]/.test(k));

    if (н.nuzhna_nova && н.chernova_title && н.chernova_core) {
      if (!стая) { откази.push('няма стая за среза: ' + String(r.srez).slice(0, 60)); continue; }
      let id = ПРЕФИКС[стая] + слуг(н.chernova_title);
      if (има.has(id) || карти.some(c => c.id === id)) { id = id.slice(0, 30) + '-' + (++дублиИд); }
      if (!/^[a-z][a-z0-9-]{2,39}$/.test(id)) { откази.push('лошо id: ' + id); continue; }
      const свободни = нови.filter(k => !заети.has(k));
      махнати += нови.length - свободни.length;
      if (свободни.length < 8) { откази.push(id + ': само ' + свободни.length + ' свободни ключа'); continue; }
      свободни.forEach(k => заети.set(k, id));
      карти.push({
        id, room: стая, title: String(н.chernova_title).trim(),
        core: String(н.chernova_core).trim(),
        tip: String(н.chernova_tip || н.tip || '').trim() || 'Пиши ми, ако нещо от това не пасва на твоя случай.',
        follow: String(н.chernova_follow || н.follow || '').trim(),
        keys: свободни, chips: [],
      });
      continue;
    }

    const ц = н.karta_id && String(н.karta_id).trim();
    if (!ц) continue;
    if (!има.has(ц)) { откази.push('няма карта ' + ц + ' (за „' + въпрос.slice(0, 40) + '")'); continue; }
    const свободни = нови.filter(k => !заети.has(k));
    махнати += нови.length - свободни.length;
    if (!свободни.length) continue;
    свободни.forEach(k => заети.set(k, ц));
    ключове[ц] = (ключове[ц] || []).concat(свободни);
    общоК += свободни.length;
  }
}
for (const ц of Object.keys(ключове)) ключове[ц] = [...new Set(ключове[ц])];

fs.mkdirSync('dev/nahodki', { recursive: true });
fs.writeFileSync('dev/nahodki/klyuchove_v3.json', JSON.stringify(ключове, null, 1));
fs.writeFileSync('dev/nahodki/karti_v3.json', JSON.stringify(карти, null, 1));
console.log('');
console.log('🔑 ключове: ' + общоК + ' върху ' + Object.keys(ключове).length + ' карти  (махнати заети: ' + махнати + ')');
console.log('🃏 нови карти: ' + карти.length);
const поСтаи = {}; карти.forEach(k => { поСтаи[k.room] = (поСтаи[k.room] || 0) + 1; });
Object.entries(поСтаи).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log('     ' + String(n).padStart(3) + '  ' + r));
console.log('   без follow: ' + карти.filter(k => !k.follow).length + ' · с кратък core (<400 знака): ' + карти.filter(k => k.core.length < 400).length);
if (откази.length) { console.log('\n⚠️ пропуснати: ' + откази.length); откази.slice(0, 20).forEach(x => console.log('   ' + x)); }
