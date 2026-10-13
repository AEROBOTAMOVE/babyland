// пуска обиколката на 9-те стаи една след друга (Chrome по Chrome — машината е бавна)
const { spawnSync } = require('child_process');
const СТАИ = [['st1', 'Моето бебе'], ['st2', 'Захранване'], ['st3', 'Развитие и игри'], ['st4', 'Здраве и SOS'],
  ['st5', 'Бременност', 'preg'], ['st6', 'Жената в мен'], ['st7', 'Дневник на мама'], ['st8', 'Инструменти'], ['st9', 'Лабораторията']];
const само = process.argv[2] ? process.argv[2].split(',') : null;
for (const [име, стая, профил] of СТАИ) {
  if (само && !само.includes(име)) continue;
  const р = spawnSync(process.execPath, ['obikolka.js', '--out', име, '--room', стая, '--profile', профил || 'baby', '--max', '7'], { cwd: __dirname, encoding: 'utf8', timeout: 300000 });
  console.log('[' + стая + '] ' + ((р.stdout || '') + (р.stderr || '')).trim());
}
