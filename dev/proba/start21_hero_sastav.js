// 21.10 · какво има в header.hero след всички скриптове + какво е червената точка горе вляво
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  scrollTo(0, 0); await пауза(400);
  const h = document.querySelector('header.hero');
  const опис = e => { const b = e.getBoundingClientRect(); return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '')) + ' ' + Math.round(b.y) + '+' + Math.round(b.height) + (getComputedStyle(e).display === 'none' ? ' (скрит)' : ''); };
  const дърво = [];
  (function обходи(e, д) { if (д > 3) return; for (const c of e.children) { дърво.push('  '.repeat(д) + опис(c)); обходи(c, д + 1); } })(h, 0);
  const горе = document.elementsFromPoint(3, 3).slice(0, 4).map(опис);
  return { дърво: дърво.slice(0, 60), горе };
})()
