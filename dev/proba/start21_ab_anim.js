// 21.10 · A/B в една страница: колко струва document.getAnimations() (с принудено преизчисляване на стила)
//   С облака/небето (css/pl-start.css) и БЕЗ него (линкът махнат). Медиана от 15 замера всяко.
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  await пауза(1500);
  const мери = () => {
    const т = []; let n = 0, върви = 0;
    for (let i = 0; i < 15; i++) {
      document.body.classList.toggle('x-mrasno');
      const а = performance.now(); const всички = document.getAnimations(); т.push(performance.now() - а);
      n = всички.length; върви = всички.filter(x => x.playState === 'running').length;
    }
    т.sort((a, b) => a - b);
    return { анимации: n, вървят: върви, медиана_ms: +т[7].toFixed(2), макс_ms: +т[14].toFixed(2) };
  };
  const с = мери();
  const л = document.querySelector('link[href*="pl-start.css"]'); if (л) л.remove();
  await пауза(1500);
  const без = мери();
  return { с_облака: с, без_облака: без };
})()
