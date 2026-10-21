// zn5 · още ключове по пробата zn5_proba1.txt — пише само zn5_karti_data.js
const fs = require('fs');
const f = __dirname + '/zn5_karti_data.js';
let s = fs.readFileSync(f, 'utf8');
const DOB = {
 'zn5-kafe-i-sanyat': ['до колко часа да пия кафе', 'чаша вино за по-добър сън', 'вечерям късно не мога да заспя'],
 'zn5-dryamka-mama': ['дрямката през деня вредна ли е'],
 'zn5-chas-za-trevogi': ['тревожа се нощем за най-лошото'],
 'zn5-slance-za-mama': ['колко крем на лицето за слънце'],
 'zn5-rabotno-vreme': ['половин ден след майчинството', 'нощна смяна с дете до 6'],
 'zn5-izgoryala-mayka': ['писна ми от всичко'],
 'zn5-tatko-grubo': ['побеснява когато баща му се прибере'],
 'zn5-tatko-govori': ['мъжът ми почти не говори', 'да накарам мъжа си да говори'],
 'zn5-tatko-se-promenya': ['промени се откакто стана баща'],
};
const ZAM = [["'mazhat mi malchi'", "'mazhat mi ne govori'"]];
let n = 0;
for (const [id, kl] of Object.entries(DOB)) {
  const i = s.indexOf("id: '" + id + "'");
  const a = s.indexOf('keys: [', i), b = s.indexOf('],', a);
  s = s.slice(0, b) + ', ' + kl.map(k => "'" + k + "'").join(', ') + s.slice(b);
  n++;
}
for (const [a, b] of ZAM) { if (s.indexOf(a) < 0) console.log('НЕ НАМЕРИХ ' + a); else { s = s.split(a).join(b); n++; } }
fs.writeFileSync(f, s, 'utf8');
console.log('промени: ' + n);
