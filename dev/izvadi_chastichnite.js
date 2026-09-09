// Вади ЧАСТИЧНИТЕ отговори (карта на темата, но не на въпроса) заедно с
// точното „какво липсва" и СТАТИЯТА зад картата — защото дългото обяснение
// живее в библиотеката, не в картата (картата има таван).
const fs = require('fs');
const ДНЕВНИК = process.argv[2];
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай път до journal.jsonl'); process.exit(2); }

const врати = require('./_vrati_s_karti.json');
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const поId = new Map((KB.entries || []).map(e => [e.id, e]));
const индекс = JSON.parse(fs.readFileSync('lib/index.json', 'utf8')).items;
const статияПоId = new Map(индекс.map(i => [i.id, i]));

const присъди = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = (typeof o.result === 'string') ? (() => { try { return JSON.parse(o.result); } catch (e) { return null; } })() : o.result;
  if (r && Array.isArray(r.verdicts)) присъди.push(...r.verdicts);
}
const виждан = new Set();
const уник = присъди.filter(v => { const k = v.index + '|' + v.karta_id; if (виждан.has(k)) return false; виждан.add(k); return true; });

const част = уник.filter(v => v.verdict === 'CHASTICHEN').map(v => {
  const д = врати[v.index] || {};
  const e = поId.get(v.karta_id) || {};
  const art = (e.art || e.article || e.lib || '');
  const s = статияПоId.get(art);
  return {
    index: v.index,
    vapros: д.vapros || v.vapros,
    staya_na_mamata: д.staya_na_mamata,
    karta_id: v.karta_id,
    karta_zaglavie: д.karta_zaglavie,
    lipsva: v.lipsva || '',
    zashto: v.zashto,
    statia_id: art || null,
    statia_zaglavie: s ? (s.t || '') : null,
  };
});
fs.writeFileSync('dev/_chastichni.json', JSON.stringify(част, null, 1));
console.log('ЧАСТИЧНИ: ' + част.length + ' → dev/_chastichni.json');
console.log('с намерена статия: ' + част.filter(x => x.statia_id).length);
console.log('');
част.slice(0, 40).forEach(c => {
  console.log('   [' + c.staya_na_mamata + '] ' + c.vapros);
  console.log('        карта ' + c.karta_id + (c.statia_id ? ' · статия ' + c.statia_id : ' · БЕЗ СТАТИЯ'));
  console.log('        липсва: ' + String(c.lipsva).slice(0, 140));
});
