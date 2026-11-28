/* يجهّز مجلد dist للنشر: بينسخ ملفات الموقع الثابتة بس (من غير tools/worker/dist).
   النطاق قابل للتغيير من متغيّر SITE_ORIGIN من غير ما تلمس الملفات:
     SITE_ORIGIN=https://example.com bun tools/build-dist.mjs
*/
import { cp, mkdir, rm, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'robots.txt', 'sitemap.xml'];
const DIRS = ['css', 'js', 'data', 'assets'];
const FALLBACK_ORIGIN = 'https://snaces-football-uiulk2.freebuff.site';
const ORIGIN = String(process.env.SITE_ORIGIN || FALLBACK_ORIGIN).replace(/\/+$/, '');
if (!/^https?:\/\/[^\s]+$/.test(ORIGIN)) throw new Error('SITE_ORIGIN غير صالح: ' + ORIGIN);

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const f of FILES) await cp(join(ROOT, f), join(DIST, f));
for (const d of DIRS) await cp(join(ROOT, d), join(DIST, d), { recursive: true });
/* أصول المتجر (assets/store) مش جزء من الموقع — متتنشرش */
await rm(join(DIST, 'assets', 'store'), { recursive: true, force: true });

/* النطاق: بنستبدل النطاق الافتراضي في الملفات اللي فيها روابط مطلقة */
let lastmod = new Date().toISOString().slice(0, 10);
try {
  const meta = JSON.parse(await readFile(join(ROOT, 'data/meta.json'), 'utf8'));
  if (meta.updated && /^\d{4}-\d{2}-\d{2}/.test(meta.updated)) lastmod = meta.updated.slice(0, 10);
} catch (e) { }
for (const f of ['index.html', 'robots.txt', 'sitemap.xml']) {
  const p = join(DIST, f);
  let txt = await readFile(p, 'utf8');
  txt = txt.split(FALLBACK_ORIGIN).join(ORIGIN.replace(/&/g, '&amp;'));
  if (f === 'sitemap.xml') txt = txt.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
  await writeFile(p, txt);
}

/* تقرير سريع */
let count = 0, bytes = 0;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else { const s = await stat(p); count++; bytes += s.size; }
  }
}
await walk(DIST);
console.log(`dist ready: ${count} ملف — ${(bytes / 1048576).toFixed(2)} MB — origin: ${ORIGIN}`);
