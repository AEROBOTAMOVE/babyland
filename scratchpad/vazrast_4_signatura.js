const { zaredi } = require('../dev/pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
console.log('BL_AGE(2025-11-20) =', JSON.stringify(W.BL_AGE && W.BL_AGE('2025-11-20')));
const r = W.BL_MATCH('колко зъбки трябва да има', 'Здраве и SOS');
console.log('BL_MATCH тип:', typeof r, '· ключове:', r && Object.keys(r).join(','));
console.log(JSON.stringify(r, (k, v) => typeof v === 'string' && v.length > 90 ? v.slice(0, 90) + '…' : v, 1).slice(0, 1200));
