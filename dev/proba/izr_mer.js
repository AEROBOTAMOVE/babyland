(async () => {
  await new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); });
  const к = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), pad: cs.padding, mar: cs.margin, pos: cs.position }; };
  const ns = document.querySelector('.netsec');
  const деца = ns ? [...ns.children].map(e => e.className + ' ' + Math.round(e.getBoundingClientRect().bottom + scrollY)) : [];
  const мт = [...document.querySelectorAll('.section-title')].find(e => /Запознай/.test(e.textContent));
  const емо = мт && мт.querySelector('.pl-em');
  return {
    netsec: к('.netsec'), stage: к('.net-stage'), svg: к('.net-svg'), panel: к('.net-panel'), list: к('.net-list'), деца,
    askme: к('.askme'), box: к('.askme-box'), ava: к('.askme-ava'), avaEm: к('.askme-ava .pl-em'),
    meetT: мт ? { html: мт.innerHTML.slice(0, 300), r: к('.meet .section-title') } : null,
    meetEm: емо ? { cls: емо.className, cs: (() => { const c = getComputedStyle(емо); return c.position + ' ' + c.marginLeft + ' ' + c.width + ' ' + c.verticalAlign + ' ' + c.display; })(), r: (() => { const r = емо.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; })() } : null
  };
})()
