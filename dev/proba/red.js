// 🚦 ред.js — пуска команда, след като вземе слот от опашката (виж slot.js)
// node dev/proba/red.js mozak -- node dev/kade_otivat.js SCR/файл.json
// node dev/proba/red.js chrome -- node dev/proba/cdp_proba.js --out x   (пробите вече го правят сами)
const { spawn } = require('child_process');
const а = process.argv.slice(2);
const канал = а[0]; const к = а.indexOf('--');
if (!канал || к < 0 || к === а.length - 1) { console.log('ползване: node red.js <канал> -- <команда> [аргументи]'); process.exit(2); }
(async () => {
  const освободи = await require('./slot.js')(канал);
  let cmd = а[к + 1];
  if (cmd === 'node') cmd = process.execPath;
  const д = spawn(cmd, а.slice(к + 2), { stdio: 'inherit' });
  д.on('exit', код => { освободи(); process.exit(код == null ? 1 : код); });
  д.on('error', e => { console.log('🔴 ' + e.message); освободи(); process.exit(1); });
})();
