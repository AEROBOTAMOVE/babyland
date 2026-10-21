// 21.10 · проверка на поправките от одита (начало + стаи): небе, тема, лента, банер, медал, шапка, микрофон
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  await пауза(1500);
  const из = { тема: document.documentElement.getAttribute('data-theme') };
  const стая = document.getElementById('roomOverlay');
  if (!стая || стая.hidden) {
    const небе = [...document.querySelectorAll('header.hero .sky-layer span')].filter(e => /\p{Extended_Pictographic}/u.test(e.textContent || ''));
    из.небе = { всички: небе.length, плюшени: небе.filter(e => e.classList.contains('pl-pl')).length, голи: небе.filter(e => !e.classList.contains('pl-pl') && !e.classList.contains('sk-fly') && getComputedStyle(e).color !== 'rgba(0, 0, 0, 0)').map(e => e.className + ':' + e.textContent) };
    const т = document.getElementById('themeToggle'); if (т) { const п = getComputedStyle(т, '::before'); из.тема_бутон = { шрифт: getComputedStyle(т).fontSize, картина: п.backgroundImage.slice(0, 40) }; }
    const ем = document.querySelector('#todaySection .ch-emo.pl-pl'); if (ем) из.ch_emo = Math.round(ем.getBoundingClientRect().width) + '×' + Math.round(ем.getBoundingClientRect().height);
    const мин = [...document.querySelectorAll('#todaySection .bn-txt strong')].find(e => /Минута/.test(e.textContent)); if (мин) из.минута = getComputedStyle(мин).fontFamily.slice(0, 20);
    const футер = document.querySelector('footer.footer'); if (футер) из.футер_голи = (футер.textContent.match(/\p{Extended_Pictographic}/gu) || []).length - футер.querySelectorAll('.pl-em').length;
    const ощe = document.querySelector('.pl-oshte-h'); if (ощe) { ощe.scrollIntoView({ block: 'start' }); await пауза(1200); из.лента_при_още = (document.querySelector('.bn-item.bn-active') || {}).textContent; }
  } else {
    const г = document.querySelector('#roomOverlay .ro-head');
    из.шапка = ['#roBack', '#roSos', '#roClose', '#roTabs'].map(с => { const е = document.querySelector(с); return с + ' y=' + (е ? Math.round(е.getBoundingClientRect().top) : '—'); });
    const бан = document.querySelector('#roRoom > .pl-rhero > img'); из.банер = бан ? getComputedStyle(бан).display : 'няма';
    const медал = [...document.querySelectorAll('#roRoom .jr-card > h4.jr-title > span.jr-medal')].find(e => /🎭/.test(e.textContent)); if (медал) из.медал_маска = медал.classList.contains('pl-pl');
    const мик = [...document.querySelectorAll('#roomOverlay .ask-mic')].find(x => x.getClientRects().length); if (мик) из.микрофон = getComputedStyle(мик).backgroundColor + (мик.classList.contains('pl-pl') ? ' плюш' : ' не-плюш');
    const диск = document.querySelector('#roomOverlay .ro-panel > p.ro-disc'); if (диск) из.бележка_голи = (диск.textContent.match(/\p{Extended_Pictographic}/gu) || []).length - диск.querySelectorAll('.pl-em').length;
  }
  return из;
})()
