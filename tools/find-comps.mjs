/* استكشاف IDs البطولات من 365Scores */
const BASE = 'https://webws.365scores.com/web';
const NAMES = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const q of NAMES) {
  try {
    const r = await fetch(`${BASE}/search/?appTypeId=5&langId=1&query=${encodeURIComponent(q)}`);
    const j = await r.json();
    const comps = (j.competitions || []).map(c => `${c.id}:${c.name}${c.countryId ? '(' + c.countryId + ')' : ''}${c.sportId ? '[s' + c.sportId + ']' : ''}`);
    console.log(`== ${q}\n   ${comps.slice(0, 8).join(' | ') || '—'}`);
  } catch (e) {
    console.log(`== ${q} -> ERR ${e.message}`);
  }
  await sleep(350);
}
