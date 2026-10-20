// ⏱️ Обобщава CPU профил от CDP (Profiler.stop) — собствено време по файл и по функция.
// Ползва го tezhest.js --profil. Само чете профила, нищо не пише.
module.exports = function обобщи(пр, бройФайлове = 22, бройФункции = 28) {
  const възли = new Map(пр.nodes.map(x => [x.id, x]));
  const сам = new Map(); const дт = пр.timeDeltas || [];
  for (let i = 0; i < пр.samples.length; i++) сам.set(пр.samples[i], (сам.get(пр.samples[i]) || 0) + (дт[i] || 0));
  const поФайл = {}, поФункция = {};
  for (const [id, us] of сам) {
    const cf = възли.get(id).callFrame;
    const ф = (cf.url ? cf.url.replace(/^https?:\/\/[^/]+\//, '').replace(/\?.*$/, '') : '(' + (cf.functionName || 'вътрешно') + ')');
    поФайл[ф] = (поФайл[ф] || 0) + us;
    const к = ф + ' :: ' + (cf.functionName || '(анонимна)') + ':' + (cf.lineNumber + 1);
    поФункция[к] = (поФункция[к] || 0) + us;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => String(Math.round(v / 1000)).padStart(6) + ' ms  ' + k);
  console.log('\n⏱️ ПРОФИЛ — собствено време по файл:\n' + top(поФайл, бройФайлове).join('\n'));
  console.log('\n⏱️ по функция:\n' + top(поФункция, бройФункции).join('\n'));
  return { поФайл, поФункция };
};
