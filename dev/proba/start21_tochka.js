// 21.10 · кое е червената точка в горния ляв ъгъл (0–5 px) — всички малки видими елементи там, вкл. pointer-events:none
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  scrollTo(0, 0); await пауза(400);
  const из = [];
  for (const e of document.querySelectorAll('body *')) {
    const b = e.getBoundingClientRect();
    if (b.width && b.width < 120 && b.height < 120 && b.left < 6 && b.top < 6 && b.right > 0 && b.bottom > 0) {
      const с = getComputedStyle(e);
      if (с.visibility === 'hidden' || с.opacity === '0') continue;
      из.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).trim().replace(/\s+/g, '.') + ' ' + Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + '×' + Math.round(b.height) + ' фон=' + с.backgroundColor + ' поз=' + с.position + ' род=' + (e.parentElement && (e.parentElement.id || e.parentElement.className)));
    }
  }
  return из.slice(0, 20);
})()
