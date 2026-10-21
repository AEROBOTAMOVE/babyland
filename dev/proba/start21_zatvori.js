// 21.10 · за снимката на началото: затваря „Ново медальонче“ (ако излезе), качва горе и връща мерки на героя.
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) {
    const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent);
    if (б) { б.click(); await пауза(700); } else break;
  }
  scrollTo(0, 0); await пауза(500);
  const р = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), видим: getComputedStyle(e).display !== 'none' }; };
  return {
    сплеш: !!document.getElementById('blSplash'),
    лого: р('header.hero .logo-art'), заглавие: р('.pl-hero h1'), бебе: р('#plBaby'), търси: р('.pl-find'),
    сцена: р('#plScene'), небе: р('.sky'),
    фон: getComputedStyle(document.documentElement).backgroundImage.slice(0, 60),
    шир: document.scrollingElement.scrollWidth, клиент: document.documentElement.clientWidth,
  };
})()
