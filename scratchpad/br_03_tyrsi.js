// Търси дума/израз в ЦЯЛАТА база (ключове + ядро + заглавие) — има ли СЪДЪРЖАНИЕ
const { zaredi } = require('../dev/pyasachnik.js');
const B = zaredi(null, { памет: { bl_lmp: '2026-04-01' } });
const e = (B.BL_KB || B.KB).entries;
for (const дума of process.argv.slice(2)) {
  const d = дума.toLowerCase();
  console.log('\n════════ „' + дума + '“ ════════');
  let бр = 0;
  for (const c of e) {
    const вЗагл = String(c.title||'').toLowerCase().includes(d);
    const вКл = (c.keys||[]).some(k => String(k).toLowerCase().includes(d));
    const вЯдро = String(c.core||'').toLowerCase().includes(d);
    const вТяло = JSON.stringify(c).toLowerCase().includes(d);
    if (вЗагл || вКл || вЯдро || вТяло) { бр++;
      console.log('  ' + (вЗагл?'З':'-') + (вКл?'К':'-') + (вЯдро?'Я':'-') + (вТяло?'Т':'-') + ' ' + c.room.padEnd(16) + c.id.padEnd(34) + c.title);
      if (вКл) console.log('        ключове: ' + (c.keys||[]).filter(k=>String(k).toLowerCase().includes(d)).join(' · '));
      if (вЯдро) { const i = String(c.core).toLowerCase().indexOf(d); console.log('        ядро: …' + String(c.core).replace(/\s+/g,' ').slice(Math.max(0,i-90), i+190) + '…'); }
    }
  }
  if (!бр) console.log('  НИЩО — нито заглавие, нито ключ, нито ядро, нито тяло');
}
