// 21.10 · шапката на стаята: позиции и изчислени отстъпи на ←/SOS/×, табовете и .ro-who (сравнение светло/тъмно)
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  await пауза(1200);
  const г = document.querySelector('#roomOverlay .ro-head');
  if (!г) return 'няма шапка';
  const м = е => { if (!е) return null; const b = е.getBoundingClientRect(), с = getComputedStyle(е); return { y: Math.round(b.top), h: Math.round(b.height), mt: с.marginTop, pt: с.paddingTop, top: с.top, pos: с.position, align: с.alignSelf, transform: с.transform.slice(0, 40) }; };
  const гс = getComputedStyle(г);
  return {
    тема: document.documentElement.getAttribute('data-theme'),
    шапка: { y: Math.round(г.getBoundingClientRect().top), h: Math.round(г.getBoundingClientRect().height), display: гс.display, align: гс.alignItems, pt: гс.paddingTop },
    назад: м(document.getElementById('roBack')), сос: м(document.getElementById('roSos')), затвори: м(document.getElementById('roClose')),
    табове: м(document.getElementById('roTabs')), who: м(г.querySelector('.ro-who')),
    редът: [...г.children].map(е => е.tagName.toLowerCase() + (е.id ? '#' + е.id : '') + '.' + String(е.className).split(' ')[0] + ' y=' + Math.round(е.getBoundingClientRect().top)),
  };
})()
