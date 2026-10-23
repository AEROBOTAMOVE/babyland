// zn10 · веригата в ЕДИН слот на опашката: сборка (zn10_build) → сух гейт (slivach_karti --samo=zn10) → проба (zn10_proba).
// Пускане: node dev/proba/red.js mozak -- node dev/znanie/vlivane/zn10_vse.js <наставка>
// Изходите отиват в dev/znanie/vlivane/zn10_{build,gejt,proba}<наставка>.txt. Нищо извън стажа не пише; --pishi НЯМА.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
const н = process.argv[2] || '';
const пусни = (име, арг) => {
  const р = spawnSync(process.execPath, арг, { cwd: КОРЕН, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const изход = (р.stdout || '') + (р.stderr || '') + '\n[изход ' + р.status + ']\n';
  fs.writeFileSync(path.join(__dirname, 'zn10_' + име + н + '.txt'), изход, 'utf8');
  console.log('── ' + име + ': изход ' + р.status);
  return р.status;
};
if (пусни('build', ['dev/znanie/vlivane/zn10_build.js']) !== 0) console.log('сборката има грешки — гейтът пак се пуска за сведение');
пусни('gejt', ['dev/slivach_karti.js', '--samo=zn10']);
пусни('proba', ['dev/znanie/vlivane/zn10_proba.js']);
