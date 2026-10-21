// 21.10 · проверка на поправките от одита в отворената стая: стрелки, SOS, лупа, микрофон нощем, плюш в „Хранене навън“, контрасти
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  await пауза(1200);
  const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => { const m = rgb(c); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const к = (a, b) => +((Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05)).toFixed(2);
  const еп = s => [...document.querySelectorAll(s)].find(x => x.getClientRects().length);
  const сос = document.getElementById('roSos');
  const сосС = сос && getComputedStyle(сос), сосП = сос && getComputedStyle(сос, '::before');
  const мик = еп('#roomOverlay .ask-mic');
  const лупа = еп('#roRoom .sec-nav .sec-find');
  const бр = [...document.querySelectorAll('#roRoom .br-b')].filter(x => x.getClientRects().length);
  const ут = [...document.querySelectorAll('#roRoom .jr-win > .ut-n')];
  const голиУт = ут.filter(у => /\p{Extended_Pictographic}/u.test([...у.childNodes].filter(н => н.nodeType === 3).map(н => н.nodeValue).join(''))).length;
  const плюшУт = ут.filter(у => у.querySelector('.pl-em.pl-pl, .pl-pl')).length;
  const sn = еп('#roRoom .sec-head .sec-n'), ml = еп('#roRoom .ml-big strong'), fd = еп('#roRoom .fd-grid .fd-card:not(.tried)');
  return {
    тема: document.documentElement.getAttribute('data-theme'),
    сос: сос ? { надпис: сосП.content, фон: сосС.backgroundImage.slice(0, 50), шрифт: сосС.fontSize, етикет: сос.getAttribute('aria-label').slice(0, 20) } : 'няма',
    микрофон: мик ? { фон: getComputedStyle(мик).backgroundColor, плюш: мик.classList.contains('pl-pl') } : 'няма (чатът не е отворен)',
    лупа: лупа ? { подсказка: лупа.placeholder, белег: лупа.getAttribute('data-pl-lupa') || лупа.getAttribute('data-pl-dn-lupa') || '—', картина: getComputedStyle(лупа).backgroundImage.slice(0, 30) } : 'няма',
    стрелки: бр.map(б => ({ текст: б.textContent.trim().slice(0, 20), pl_ar: б.querySelectorAll('.pl-ar').length, знак: (б.querySelector('.pl-ar') || {}).dataset ? б.querySelector('.pl-ar') && б.querySelector('.pl-ar').dataset.ar : null, pl_em: б.querySelectorAll('.pl-em').length })),
    хранене_навън: { редове: ут.length, плюшени: плюшУт, голи: голиУт },
    брояч: sn ? к(getComputedStyle(sn).color, getComputedStyle(sn).backgroundColor) : null,
    изпито: ml ? getComputedStyle(ml).color : null,
    ръб_храна: fd ? getComputedStyle(fd).borderTopColor : null,
  };
})()
