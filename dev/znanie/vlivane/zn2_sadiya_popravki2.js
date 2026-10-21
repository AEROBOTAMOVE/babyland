// Съдията zn2 · втора пачка поправки (след проверителя, 21.10.2026). Път назад: …_PREDI_*.json.
const fs = require('fs');
const KF = 'dev/nahodki/karti_zn2.json', SF = 'dev/nahodki/statii_zn2.json';
const K = JSON.parse(fs.readFileSync(KF, 'utf8'));
const S = JSON.parse(fs.readFileSync(SF, 'utf8'));
function kluch(id, staro, novo) {
  const k = K.find(x => x.id === id); if (!k) throw new Error('няма ' + id);
  const i = k.keys.indexOf(staro);
  if (i < 0 || k.keys.indexOf(staro, i + 1) > -1) throw new Error(id + ' · ключ не е точно веднъж: ' + staro);
  if (k.keys.includes(novo)) throw new Error(id + ' · новият ключ вече го има: ' + novo);
  k.keys[i] = novo;
}
kluch('zn2-oshte-ne-go-chuvstvam', 'да се свържа с бебето в корема', 'да се свържа с бебето бременна');
kluch('zn2-strahat-na-tatko', 'мъжът ми е раздразнителен откакто съм бременна', 'мъжът ми е раздразнителен откакто забременях');
kluch('zn2-hemoroidi', 'боли ме когато ходя по нужда бременна', 'боли ме по нужда бременна');
kluch('zn2-toy-v-zalata', 'как да ми помогне мъжът при раждане', 'мъжът да ми помага при раждане');
kluch('zn2-bleda-cherta', 'втора черта', 'втора черта на теста');
const s = S.find(x => x.karta === 'zn2-toy-na-pregledite');
if (s.e !== '👨‍👩‍👧') throw new Error('емоджито не е очакваното');
s.e = '👪';   // една кодова точка вместо ZWJ-поредица от 5
fs.writeFileSync(KF, JSON.stringify(K, null, 1) + '\n');
fs.writeFileSync(SF, JSON.stringify(S, null, 1) + '\n');
console.log('🟢 записано');
