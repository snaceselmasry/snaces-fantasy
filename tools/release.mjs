/* يبني نسخة الإصدار: يرفع رقم كاش الـService Worker ثم يبني Worker وdist بالترتيب.
   الاستخدام: bun tools/release.mjs            (يرفع الكاش ويبني)
              bun tools/release.mjs --no-bump  (بناء بدون تغيير رقم الكاش)
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const noBump = process.argv.includes('--no-bump');
const swPath = 'sw.js';
let sw = readFileSync(swPath, 'utf8');
const m = sw.match(/const CACHE = 'snaces-v(\d+)';/);
if (!m) throw new Error('مش لاقي رقم الكاش في sw.js');

let version = Number(m[1]);
if (!noBump) {
  version += 1;
  sw = sw.replace(m[0], `const CACHE = 'snaces-v${version}';`);
  writeFileSync(swPath, sw);
  console.log(`🔖 كاش جديد: snaces-v${version}`);
} else {
  console.log(`🔖 كاش ثابت: snaces-v${version}`);
}

const run = (args, label) => {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${label} فشل (exit ${r.status})`);
};
run(['build', 'worker.js', '--target', 'browser', '--format', 'esm', '--outfile', 'worker.bundle.js'], 'بناء Worker');
run(['tools/build-dist.mjs'], 'بناء dist');
run(['tools/check-build.mjs'], 'فحص تطابق البناء');

console.log(`✅ الإصدار جاهز — snaces-v${version} | worker.bundle.js + dist محدّثين ومتطابقين`);
