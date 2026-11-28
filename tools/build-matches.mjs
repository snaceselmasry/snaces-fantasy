/* يبني data/matches.json من ملفات البطولات (كل المباريات في ملف واحد للشاشة الجديدة) */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA = join(ROOT, 'data');

const files = (await readdir(DATA)).filter(f => /^[A-Z0-9]+\.json$/.test(f));
const seen = new Set();
const out = [];

for (const f of files) {
  let d;
  try { d = JSON.parse(await readFile(join(DATA, f), 'utf8')); } catch (e) { continue; }
  if (!d || !Array.isArray(d.matches)) continue;
  const code = d.code || f.replace('.json', '');
  for (const m of d.matches) {
    if (!m || !m.id || !m.date || !m.home || !m.away) continue;
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push({
      l: code,
      id: m.id,
      d: m.date,
      s: m.status || 'TIMED',
      hg: m.hg == null ? null : m.hg,
      ag: m.ag == null ? null : m.ag,
      h: { n: m.home.name, c: m.home.crest || '' },
      a: { n: m.away.name, c: m.away.crest || '' },
      md: m.md || null
    });
  }
}

/* نافذة زمنية معقولة: من 45 يوم فات لـ 30 يوم جاي */
const now = Date.now();
const MIN = now - 10 * 864e5;
const MAX = now + 10 * 864e5;
const list = out
  .filter(m => { const t = Date.parse(m.d); return t >= MIN && t <= MAX; })
  .sort((x, y) => Date.parse(x.d) - Date.parse(y.d));

await writeFile(join(DATA, 'matches.json'), JSON.stringify({ updated: new Date().toISOString(), matches: list }));
console.log(`matches ready: ${list.length} مباراة من ${files.length} ملف`);
