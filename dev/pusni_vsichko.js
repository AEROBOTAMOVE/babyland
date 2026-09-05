#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🚂 ЕДНА КОМАНДА: слей стажа → провери всичко → вдигни номерата
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09): собственикът е прав — работех серийно и бавно. Всеки нов
// пакет от агенти струваше десетина отделни команди: три сливача, девет
// пазача, корпусът, номерата. Тук всичко е един ход.
//
// РЕДЪТ Е ВАЖЕН И Е ПЛАТЕН С ОПИТ:
//   1. КАРТИТЕ първо — гейтът за статии чете ЖИВИЯ kb.js и не вижда стажа;
//   2. СТАТИИТЕ после — вече намират картите си;
//   3. КЛЮЧОВЕТЕ накрая — те могат да сочат и към новите карти.
//
// ПУСКАНЕ: node dev/pusni_vsichko.js [--pishi]
// Без --pishi всичко е СУХО: сливачите само показват какво биха направили.
// ПЪТ НАЗАД: js/kb.js.PREDI_KARTI · .PREDI_KLYUCHOVE · lib/*.PREDI_SLIVANE
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ПИШИ = process.argv.includes('--pishi');
const NODE = process.execPath;

const пусни = (файл, арг = []) => {
  const r = cp.spawnSync(NODE, [path.join('dev', файл)].concat(арг), { encoding: 'utf8', cwd: КОРЕН });
  return { код: r.status, изход: (r.stdout || '') + (r.stderr || '') };
};
const ред = (име, ок, доп) => console.log('  ' + (ок ? '✅' : '🔴') + ' ' + име.padEnd(26) + (доп || ''));

console.log('');
console.log('  🚂 ЦЕЛИЯТ ЦИКЪЛ' + (ПИШИ ? '' : '   [СУХО]'));
console.log('');

// ── 1 · СЛИВАНЕ, в правилния ред ──
const сливачи = [
  ['slivach_karti.js', 'карти'],
  ['slivach_statii.js', 'статии'],
  ['slivach_klyuchove.js', 'ключове'],
];
console.log('  ── сливане ──');
for (const [файл, име] of сливачи) {
  const r = пусни(файл, ПИШИ ? ['--pishi'] : []);
  const ред1 = r.изход.split('\n').filter(x => /ПРИЕТИ|слети|вписани|нищо за писане|няма файлове/.test(x)).slice(0, 2).join(' | ').replace(/\x1b\[[0-9;]*m/g, '').trim();
  ред(име, r.код === 0, ред1.slice(0, 90));
  if (r.код !== 0) {
    const лошо = r.изход.split('\n').filter(x => /🔴/.test(x)).slice(0, 4);
    for (const l of лошо) console.log('        ' + l.trim().slice(0, 100));
  }
}

// ── 2 · ПАЗАЧИТЕ ──
console.log('');
console.log('  ── пазачите ──');
const пазачи = ['korpus350.js', 'standarti.js', 'obikolka_majka.js', 'opashki.js',
  'tayni_sinhron.js', 'pod_trevogata.js', 'podniz_smalltalk.js', 'sbogom.js',
  'dostizhimost.js', 'ustoychivost.js'];
let паднали = 0;
for (const п of пазачи) {
  if (!fs.existsSync(path.join('dev', п))) continue;
  const r = пусни(п);
  const ок = r.код === 0;
  if (!ок) паднали++;
  const кратко = r.изход.split('\n').filter(x => /ЧИСТО|ЗА ГЛЕДАНЕ|минава|под прага|над прага|не се намират|ПАЗАЧЪТ/.test(x)).pop();
  ред(п.replace('.js', ''), ок, (кратко || '').replace(/\x1b\[[0-9;]*m/g, '').trim().slice(0, 70));
}

// ── 3 · ЧИСЛАТА ──
delete require.cache[require.resolve(path.join(КОРЕН, 'dev/pyasachnik.js'))];
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const ix = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const K = W.KB;
console.log('');
console.log('  ── числата ──');
console.log('     карти ' + K.entries.length + ' · статии ' + ix.items.length +
  ' · ключове ' + K.entries.reduce((a, e) => a + (e.keys || []).length, 0));
console.log('     флагове: червени ' + K.redFlags.length + ' · майка ' +
  (K.motherFlags.length + K.heavyFlags.length) + ' · насилие ' + K.dvFlags.length);
const без = K.entries.filter(e => !e.lib || (Array.isArray(e.lib) && !e.lib.length)).length;
const безЧип = K.entries.filter(e => !e.chips || !e.chips.length).length;
const тънки = K.entries.filter(e => (e.keys || []).length < 5).length;
console.log('     без статия ' + без + ' · без чип ' + безЧип + ' · под 5 ключа ' + тънки);

// ── 4 · НОМЕРАТА ──
if (ПИШИ) {
  console.log('');
  const r = пусни('vdigni_versii.js', ['--pishi', 'HEAD~1']);
  const к = r.изход.split('\n').filter(x => /вдигнати|кешът е/.test(x)).map(x => x.replace(/\x1b\[[0-9;]*m/g, '').trim());
  console.log('  ── номерата ──');
  for (const l of к) console.log('     ' + l);
}

console.log('');
const чисто = паднали === 0 && без === 0 && безЧип === 0;
console.log('  ' + (чисто ? '✅ ВСИЧКО Е ЧИСТО' : '🔴 ' + паднали + ' пазача паднали · ' + без + ' без статия · ' + безЧип + ' без чип'));
console.log('');
process.exit(чисто ? 0 : 1);
