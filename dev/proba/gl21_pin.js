(async () => {
  const п = ms => new Promise(r => setTimeout(r, ms));
  const ov = document.getElementById('roomOverlay');
  const b = [...document.querySelectorAll('#roRoom .pin-btn')].find(x => x.offsetParent);
  if (!b) return 'няма карфица';
  const име = (b.closest('.jr-card') || {}).querySelector ? (b.closest('.jr-card').querySelector('h3,.jr-title,.sec-title') || {}).textContent : '?';
  b.click(); await п(2500);
  const пинове = JSON.parse(localStorage.getItem('bl_pins') || '{}');
  const първа = document.querySelector('#roRoom .jr-card');
  return { стаятаОтворена: !ov.hidden, историята: JSON.stringify(history.state), закачени: Object.keys(пинове).length, картаКлик: String(име || '').slice(0, 40), първаСега: първа ? String((първа.querySelector('h3,.jr-title') || {}).textContent || '').slice(0, 40) : '—' };
})()
