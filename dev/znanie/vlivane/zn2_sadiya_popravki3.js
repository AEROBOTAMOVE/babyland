// Съдията zn2 · трета пачка (четене на поправеното, 21.10.2026): повторено „колко ми остава“ в статията за АМХ. Път назад: …_PREDI_*.json.
const fs = require('fs');
const SF = 'dev/nahodki/statii_zn2.json';
const S = JSON.parse(fs.readFileSync(SF, 'utf8'));
const s = S.find(x => x.karta === 'zn2-amh');
const staro = 'Числото е полезно на лекаря, но не е отговор на въпроса „колко ми остава“. В последните години';
if (s.body.split(staro).length !== 2) throw new Error('не е точно веднъж');
s.body = s.body.replace(staro, 'Числото е полезно на лекаря. В последните години');
fs.writeFileSync(SF, JSON.stringify(S, null, 1) + '\n');
console.log('🟢 записано');
