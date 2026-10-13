(async () => {
  await new Promise(r => { let k = 0; const f = () => (++k >= 60 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); });
  const С = window.BL_PL_SVETLINA, к = document.querySelector('#plScene .pl-hero-svetlina');
  if (!С || !к) return { ГРЕШКА: 'няма светлина', С: !!С, к: !!к };
  const cs = getComputedStyle(к);
  // ярост на платното: средна алфа в горната половина (има ли изобщо светлина)
  const д = к.getContext('2d').getImageData(0, 0, к.width, Math.round(к.height / 2)).data;
  let сума = 0, свети = 0; for (let i = 3; i < д.length; i += 4) { сума += д[i]; if (д[i] > 8) свети++; }
  return {
    проверка: С.проверка(), шев: С.шев(), тече: С.тече(),
    платно: к.width + '×' + к.height, css: cs.zIndex + ' ' + cs.mixBlendMode + ' ' + Math.round(к.getBoundingClientRect().height),
    среднаАлфа: +(сума / (д.length / 4)).toFixed(2), светещи: +(свети / (д.length / 4)).toFixed(3)
  };
})()
