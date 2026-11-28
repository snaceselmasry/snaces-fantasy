/* فحص البناء قبل النشر:
   1) worker.bundle.js لازم يطابق ناتج بناء worker.js الحالي
   2) كل ملف في dist لازم يطابق نظيره في المصدر
   3) ممنوع أي ملفات أسرار/مؤقتة داخل dist
*/
import { readFileSync, readdirSync, statSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';

const fail = [];
const tmp = '.tmp/worker-check.js';
mkdirSync('.tmp', { recursive: true });
const r = spawnSync(process.execPath, ['build', 'worker.js', '--target', 'browser', '--format', 'esm', '--outfile', tmp], { stdio: 'pipe' });
if (r.status !== 0) { fail.push('بناء worker.js للفحص فشل: ' + String(r.stderr || '').slice(0, 400)); }
else {
  const fresh = readFileSync(tmp);
  let shipped;
  try { shipped = readFileSync('worker.bundle.js'); } catch { shipped = null; }
  if (!shipped) fail.push('worker.bundle.js مش موجود');
  else if (!fresh.equals(shipped)) fail.push('worker.bundle.js قديم — مش مطابق لآخر worker.js (شغّل npm run build:worker)');
}
rmSync(tmp, { force: true });

const FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'robots.txt', 'sitemap.xml'];
const DIRS = ['css', 'js', 'data', 'assets'];

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

/* أصول المتجر مش جزء من الموقع المنشور */
const SKIP = p => String(p).replace(/\\/g, '/').startsWith('assets/store/');

const expected = new Set(FILES);
for (const d of DIRS) {
  if (!statSync(d).isDirectory()) { fail.push(`مجلد المصدر مفقود: ${d}`); continue; }
  for (const p of walk(d)) {
    const rel = relative('.', p).replace(/\\/g, '/');
    if (!SKIP(rel)) expected.add(rel);
  }
}
const actual = new Set(walk('dist').map(p => relative('dist', p).replace(/\\/g, '/')).filter(p => !SKIP(p)));

/* الملفات اللي build-dist بيعدّل فيها النطاق/تاريخ الخريطة بطريقة مقصودة */
const REWRITTEN = new Set(['index.html', 'robots.txt', 'sitemap.xml']);
const ORIGIN = String(process.env.SITE_ORIGIN || 'https://snaces-football-uiulk2.freebuff.site').replace(/\/+$/, '');
for (const f of expected) {
  if (!actual.has(f)) { fail.push(`ناقص في dist: ${f}`); continue; }
  if (REWRITTEN.has(f)) {
    const txt = readFileSync(join('dist', f), 'utf8');
    if (!txt.includes(ORIGIN)) fail.push(`النطاق مش متطبّق على ${f}`);
    if (f === 'sitemap.xml' && !/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(txt)) fail.push('sitemap.xml بدون lastmod صالح');
    continue;
  }
  try {
    if (!readFileSync(f).equals(readFileSync(join('dist', f)))) fail.push(`مختلف عن المصدر: ${f}`);
  } catch (e) { fail.push(`تعذّرت قراءة ${f}`); }
}
for (const f of actual) if (!expected.has(f)) fail.push(`ملف زائد في dist: ${f}`);

const BAD = /(^|\/)(\.env|\.dev\.vars|.*vapid.*\.txt|.*\.log|.*\.tmp|.*\.db|.*\.sqlite.*|.*\.map)$/i;
for (const f of actual) if (BAD.test(f)) fail.push(`ملف ممنوع في dist: ${f}`);

/* فحص محتوى سريع: أي مفتاح خاص أو مفتاح إرسال حقيقي داخل ما يُنشر */
for (const f of [...actual].filter(f => /\.(js|json|txt|html|xml|webmanifest)$/i.test(f))) {
  const txt = readFileSync(join('dist', f), 'utf8');
  if (/BEGIN (RSA |EC |)PRIVATE KEY/.test(txt)) fail.push(`مفتاح خاص داخل ${f}`);
  if (/PUSH_TRIGGER_KEY\s*=\s*['"][^'"]+/.test(txt)) fail.push(`قيمة PUSH_TRIGGER_KEY داخل ${f}`);
}

if (fail.length) {
  console.log('❌ فحص البناء فشل:');
  for (const x of fail.slice(0, 40)) console.log('  - ' + x);
  if (fail.length > 40) console.log(`  … و${fail.length - 40} كمان`);
  process.exit(1);
}
console.log(`✅ البناء متطابق: worker.bundle.js محدّث، وdist ${actual.size} ملف كلهم مطابقين للمصدر وبدون أسرار`);
