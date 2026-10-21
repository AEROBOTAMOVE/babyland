// 21.10 · разследване на находки от одита: ch-row двойно кръгче, „Минута за теб“ шрифт, pg20 голи 🌱, шапката нощем
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  await пауза(800);
  const опис = e => e ? (e.tagName.toLowerCase() + '.' + String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).trim().replace(/\s+/g, '.') + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height)) : null;
  const из = { тема: document.documentElement.getAttribute('data-theme') };
  const ред = document.querySelector('#todaySection .ch-row');
  if (ред) {
    const ем = ред.querySelector('.ch-emo');
    из.chRow = { html: (ем ? ем.parentElement.outerHTML : ред.outerHTML).slice(0, 700), деца: ем ? [...ем.parentElement.children].map(опис) : null };
  }
  const мин = [...document.querySelectorAll('#todaySection strong, #todaySection b, #todaySection h3, #todaySection .td-tt')].find(e => /Минута за теб/.test(e.textContent || ''));
  if (мин) { const с = getComputedStyle(мин); из.минута = { ел: опис(мин), шрифт: с.fontFamily.slice(0, 50), роди: опис(мин.parentElement) }; }
  const под = [...document.querySelectorAll('#todaySection strong, #todaySection b')].find(e => /Под ръка/.test(e.textContent || ''));
  if (под) из.подРъка = { ел: опис(под), шрифт: getComputedStyle(под).fontFamily.slice(0, 50) };
  // стая отворена? → pg20 и шапката
  const стая = document.getElementById('roomOverlay');
  if (стая && !стая.hidden) {
    const свг = document.querySelector('#roRoom .pg20-svg');
    if (свг) {
      свг.scrollIntoView({ block: 'center' }); await пауза(1500);
      const текстове = [...свг.querySelectorAll('text')];
      из.pg20 = { текстове: текстове.length, голи: текстове.filter(т => /\p{Extended_Pictographic}/u.test(т.textContent || '') && т.getAttribute('data-pl-svg') !== '1').map(т => (т.textContent || '').trim() + '@' + getComputedStyle(т).fontSize + ' кутия ' + Math.round(т.getBBox().width)).slice(0, 12), плюшени: свг.querySelectorAll('.pl-svg-em').length };
      if (window.BL_PL_PLYUSH && BL_PL_PLYUSH.мини) { BL_PL_PLYUSH.мини(document); await пауза(400); из.pg20_след_мини = свг.querySelectorAll('.pl-svg-em').length; }
    }
    scrollTo(0, 0); document.getElementById('roRoom') && (document.getElementById('roRoom').scrollTop = 0);
    const г = document.querySelector('#roomOverlay .ro-head'); await пауза(300);
    if (г) из.шапка = ['#roBack', '#roSos', '#roClose', '#roTabs', '.ro-who'].map(с => { const е = г.querySelector(с) || document.querySelector('#roomOverlay ' + с); if (!е) return с + ': няма'; const b = е.getBoundingClientRect(); return с + ' y=' + Math.round(b.top) + ' h=' + Math.round(b.height); });
  }
  return из;
})()
