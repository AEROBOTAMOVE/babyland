(async () => {
  const п = ms => new Promise(r => setTimeout(r, ms));
  const ск = document.scrollingElement;
  const мери = async () => {
    ск.scrollTop = 0; await п(400);
    const д = []; let пр = performance.now();
    for (let i = 0; i < 150; i++) {
      await new Promise(r => requestAnimationFrame(r));
      const с = performance.now(); д.push(с - пр); пр = с;
      ск.scrollTop += (i < 75 ? 34 : -34);
    }
    д.sort((a, b) => a - b);
    const ср = д.reduce((a, b) => a + b, 0) / д.length;
    return { средно: +ср.toFixed(1), p95: +д[Math.floor(д.length * .95)].toFixed(1), над20: д.filter(x => x > 20).length };
  };
  const нощ = document.documentElement.classList.contains('bl-night');
  const филтър = getComputedStyle(document.documentElement).filter;
  const а1 = await мери();
  const ст = document.createElement('style'); ст.textContent = 'html.bl-night{filter:none !important}'; document.head.appendChild(ст);
  await п(300); const б1 = await мери();
  ст.remove(); await п(300); const а2 = await мери();
  document.head.appendChild(ст); await п(300); const б2 = await мери();
  return { нощ, филтър, сФилтър: [а1, а2], безФилтър: [б1, б2] };
})()
