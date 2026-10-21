// 21.10 · кой рисува фона точно под героя (шевът на ~477 px): фоновете на веригата от елементи на (195, 485)
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  scrollTo(0, 0); await пауза(400);
  const h = document.querySelector('header.hero').getBoundingClientRect();
  const верига = [];
  for (let e = document.elementFromPoint(20, Math.round(h.bottom) + 8); e; e = e.parentElement) {
    const с = getComputedStyle(e);
    верига.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' ' + с.backgroundColor + ' ' + с.backgroundImage.slice(0, 70) + ' z=' + с.zIndex + ' ' + Math.round(e.getBoundingClientRect().top));
  }
  const s = getComputedStyle(document.querySelector('header.hero .sky-layer') || document.body);
  return { героятДолу: Math.round(h.bottom), верига, небеМаска: s.maskImage || s.webkitMaskImage, небеФон: s.backgroundImage.slice(0, 60) };
})()
