// 21.10 · ниските находки на финалния одит — мерене на живо (цвят, реален фон, контраст, размер) в отворената стая
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = c => { const m = rgb(c); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const фон = e => { for (let x = e; x; x = x.parentElement) { const с = getComputedStyle(x); const m = rgb(с.backgroundColor); if (m.length >= 3 && (m[3] === undefined || m[3] > .85)) return с.backgroundColor; if (с.backgroundImage && с.backgroundImage !== 'none' && x !== e) return 'картина:' + с.backgroundImage.slice(0, 40); } return 'rgb(255,255,255)'; };
  const мери = (sel, бележка) => {
    const e = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length);
    if (!e) return { sel, няма: true };
    const с = getComputedStyle(e), ф = фон(e);
    const к = ф.startsWith('картина') ? null : +((Math.max(lum(с.color), lum(ф)) + .05) / (Math.min(lum(с.color), lum(ф)) + .05)).toFixed(2);
    return { sel, бележка, цвят: с.color, фон: ф, контраст: к, размер: с.fontSize, тегло: с.fontWeight, прозрачност: с.opacity, ръб: с.borderTopColor, текст: (e.textContent || '').trim().slice(0, 30) };
  };
  await пауза(800);
  const стая = (document.querySelector('#roomOverlay .ro-title, #roomOverlay h2') || {}).textContent || '';
  return {
    стая: стая.trim().slice(0, 30),
    тема: document.documentElement.getAttribute('data-theme'),
    мерки: [
      мери('#roRoom .sec-head .sec-n', 'брояч до заглавието'),
      мери('#roRoom .ml-big strong', 'изпито днес'),
      мери('#roRoom .bb-dip .bb-dipbox .bb-diplbl', 'Мокри/Каки'),
      мери('#roRoom section.fs-keep .fs-pane.fs-ok p.fs-pt', 'Напъване — нормално'),
      мери('#roRoom .fd-grid button.fd-card', 'картичка храна (ръб)'),
    ],
  };
})()
