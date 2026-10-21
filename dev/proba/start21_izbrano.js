// 21.10 · нощем избраният чип (.jr-chip.on / .pl-soft.on): цвят, контраст, снимка
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const контраст = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
  const чип = [...document.querySelectorAll('#roomOverlay .jr-chip, #roomOverlay .pl-soft')].find(x => x.getClientRects().length);
  if (!чип) return 'няма чип';
  const вече = чип.classList.contains('on');
  if (!вече) чип.click();
  await пауза(400);
  const ч = чип.classList.contains('on') ? чип : [...document.querySelectorAll('#roomOverlay .jr-chip.on, #roomOverlay .pl-soft.on')].find(x => x.getClientRects().length);
  if (!ч) return { бележка: 'кликът не сложи .on', клас: чип.className };
  ч.scrollIntoView({ block: 'center' }); await пауза(500);
  const с = getComputedStyle(ч);
  const съсед = [...ч.parentElement.children].find(x => x !== ч && !x.classList.contains('on'));
  return { клас: ч.className, текст: ч.textContent.trim().slice(0, 30), фон: с.backgroundColor, цвят: с.color, контраст: контраст(с.color, с.backgroundColor),
    съсед: съсед ? getComputedStyle(съсед).backgroundColor : null };
})()
