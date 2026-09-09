// Вади ГРЕШНИТЕ попадения от дневника на съдийския панел и ги сглобява с
// въпроса и картата — за да се работи по КЛЮЧОВЕТЕ, не по вратата.
const fs = require('fs');
const ДНЕВНИК = process.argv[2];
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай път до journal.jsonl'); process.exit(2); }

const врати = require('./_vrati_s_karti.json');
const присъди = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = o.result;
  const обект = (typeof r === 'string') ? (() => { try { return JSON.parse(r); } catch (e) { return null; } })() : r;
  if (obj_ok(обект)) присъди.push(...обект.verdicts);
}
function obj_ok(x) { return x && Array.isArray(x.verdicts); }

const виждан = new Set();
const уник = присъди.filter(v => { const k = v.index + '|' + v.karta_id; if (виждан.has(k)) return false; виждан.add(k); return true; });
console.log('присъди: ' + присъди.length + ' · уникални: ' + уник.length);
const бр = {};
уник.forEach(v => { бр[v.verdict] = (бр[v.verdict] || 0) + 1; });
console.log('   ' + JSON.stringify(бр));

const греш = уник.filter(v => v.verdict === 'GRESHEN').map(v => {
  const д = врати[v.index] || {};
  return {
    index: v.index,
    vapros: д.vapros || v.vapros,
    staya_na_mamata: д.staya_na_mamata,
    kradec_id: v.karta_id,
    kradec_zaglavie: д.karta_zaglavie,
    zashto: v.zashto,
    lipsva: v.lipsva || '',
  };
});
fs.writeFileSync('dev/_greshni.json', JSON.stringify(греш, null, 1));
console.log('\n🔴 ГРЕШНИ: ' + греш.length + '  → dev/_greshni.json');
const поКарта = {};
греш.forEach(g => { поКарта[g.kradec_id] = (поКарта[g.kradec_id] || 0) + 1; });
console.log('\n── КРАДЦИТЕ (карта → колко чужди въпроса краде) ──');
Object.entries(поКарта).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => { if (n > 1) console.log('   ' + String(n) + '  ' + k); });
console.log('');
греш.slice(0, 45).forEach(g => console.log('   [' + g.staya_na_mamata + '] ' + g.vapros + '   ←крадец: ' + g.kradec_id));
