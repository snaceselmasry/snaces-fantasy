/* تدقيق بيانات SNACES — فحص بنيوي/حسابي لكل ملفات البطولات.
   الاستخدام:
     bun tools/audit-data.mjs            فحص محلي سريع (بدون شبكة)
     bun tools/audit-data.mjs --live     + مقارنة الترتيب بالمصدر الحي (365Scores) بحدود آمنة
     bun tools/audit-data.mjs --strict   يفشل (exit 1) لو فيه أخطاء (للبناء/CI)
   بيكتب تقرير JSON في .tmp/data-audit.json
*/
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LIVE = process.argv.includes('--live');
const STRICT = process.argv.includes('--strict');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readJSON = p => JSON.parse(readFileSync(p, 'utf8'));

const errors = [], warns = [];
const err = (code, msg) => errors.push({ code, msg });
const wrn = (code, msg) => warns.push({ code, msg });

/* كود 365 للمقارنة الحية */
/* نفس معرّفات js/live.js — متطابقة مع بطولات 365Scores */
const COMPS = {
  PL: 7, PD: 11, SA: 17, BL1: 25, FL1: 35, CL: 572, ELC: 1, DED: 57, PPL: 73, BSA: 113, TSL: 78,
  EGY: 552, SAU: 649, MAR: 557, TUN: 554, ALG: 560, UAE: 549, QAT: 408, IRQ: 6822, JOR: 565,
  ARB: 7674, ARBCL: 6840, GULF: 5452, AFCON: 167, ASIAN: 6196,
  UEL: 573, UECL: 7685, LIB: 102, SUDA: 389, CAFCL: 624, CAFCC: 627, CAFSC: 5581,
  ACL: 623, ACL2: 568, CCC: 171, UESC: 472, RECOPA: 601,
  MLS: 104, LMX: 141, ARG: 72, COL: 620, USLC: 5663,
};

/* طلب محترم لحدود المصدر: مهلة + احترام 429/5xx + تأخير متزايد */
async function getJSON(url, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'SNACES-Audit/1.0 (+https://snaces-football-uiulk2.freebuff.site)', Accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      });
      if (r.status === 429 || r.status >= 500) {
        const ra = Number(r.headers.get('retry-after') || 0);
        const wait = Math.min(ra > 0 ? ra * 1000 : 2000 * 2 ** i, 30000);
        last = new Error('HTTP ' + r.status);
        await sleep(wait);
        continue;
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) { last = e; await sleep(1000 * (i + 1)); }
  }
  throw last || new Error('fetch failed');
}

const files = readdirSync('data').filter(f => f.endsWith('.json'));
const leagues = [];
for (const f of files) {
  let d;
  try { d = readJSON(join('data', f)); } catch (e) { err(f, 'JSON غير صالح: ' + e.message); continue; }
  if (!d || typeof d !== 'object' || (!d.standings && !d.matches)) continue;
  if (!d.code) continue;
  leagues.push({ file: f, d });
}

let teamRows = 0, matchRows = 0;
for (const { file, d } of leagues) {
  const s = Array.isArray(d.standings) ? d.standings : [];
  const m = Array.isArray(d.matches) ? d.matches : [];
  const code = d.code || file.replace('.json', '');
  /* نوع البطولة: كأس (مفيش جدول) / مجموعات (جداول متعددة) / دوري (جدول واحد).
     بعض الملفات القديمة مفيهاش kind فبنستنتجه من الجدول. */
  const kind = d.kind || (s.length && (s.some(r => r.gn > 0) || new Set(s.map(r => r.group)).size > 1) ? 'group' : 'league');
  teamRows += s.length; matchRows += m.length;
  if (!s.length && !m.length) { err(code, 'الملف فاضي (لا جدول ولا مباريات)'); continue; }

  const ids = new Map(), names = new Map(), groups = new Set();
  for (const r of s) {
    const nm = r.team?.name || '(بدون اسم)';
    if (!r.team?.name) err(code, 'صف بدون اسم فريق');
    if (r.team?.id != null) {
      if (ids.has(r.team.id)) err(code, `معرّف فريق مكرر ${r.team.id} (${nm} و${ids.get(r.team.id)})`);
      else ids.set(r.team.id, nm);
    }
    const key = String(nm).trim().toLowerCase();
    if (names.has(key)) err(code, `فريق مكرر في الجدول: ${nm}`);
    names.set(key, true);
    if (r.group) groups.add(r.group);
    for (const k of ['p', 'w', 'd', 'l', 'gf', 'ga', 'gd', 'pts']) {
      if (!Number.isFinite(r[k])) err(code, `${nm}: قيمة ${k} غير رقمية`);
    }
    if (Number.isFinite(r.p) && r.p !== r.w + r.d + r.l) err(code, `${nm}: لعب ${r.p} ≠ ${r.w}+${r.d}+${r.l}`);
    if (Number.isFinite(r.gd) && r.gd !== r.gf - r.ga) err(code, `${nm}: الفارق ${r.gd} ≠ ${r.gf}-${r.ga}`);
    /* النقاط: 3 للفوز + 1 للتعادل، إلا لو فيه خصم نقاط معلن */
    if (Number.isFinite(r.pts) && !r.ded && r.pts !== r.w * 3 + r.d) err(code, `${nm}: النقاط ${r.pts} ≠ 3×${r.w}+${r.d}`);
    if (!r.team?.crest) wrn(code, `${nm}: بدون شعار`);
    else if (!/^https:\/\//.test(String(r.team.crest))) wrn(code, `${nm}: رابط شعار غير https`);
    if (r.w < 0 || r.d < 0 || r.l < 0 || r.gf < 0 || r.ga < 0) err(code, `${nm}: أرقام سالبة`);
  }

  /* ترتيب المراكز داخل كل مجموعة */
  /* نقاط فريقين في المواجهات المباشرة من المباريات المحفوظة (لما تكون متاحة) */
  const h2hPoints = (above, below) => {
    const na = String(above.team?.name || '').trim().toLowerCase();
    const nb = String(below.team?.name || '').trim().toLowerCase();
    let pa = 0, pb = 0, n = 0;
    for (const x of m) {
      if (x.status !== 'FINISHED' || x.hg == null || x.ag == null) continue;
      const h = String(x.home?.name || '').trim().toLowerCase();
      const w = String(x.away?.name || '').trim().toLowerCase();
      let ha = null, hb = null;
      if (h === na && w === nb) { ha = x.hg; hb = x.ag; }
      else if (h === nb && w === na) { ha = x.ag; hb = x.hg; }
      else continue;
      n++;
      if (ha > hb) pa += 3; else if (ha < hb) pb += 3; else { pa++; pb++; }
    }
    return { n, pa, pb };
  };
  const byGroup = new Map();
  for (const r of s) {
    const g = r.group || '-';
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(r);
  }
  for (const [g, rows] of byGroup) {
    const seen = new Set();
    rows.forEach((r, i) => {
      if (!Number.isFinite(r.pos)) return;
      if (seen.has(r.pos)) err(code, `مركز مكرر ${r.pos} في ${g}`);
      seen.add(r.pos);
      if (r.pos !== i + 1) wrn(code, `مركز ${r.pos} في مكان ${i + 1} داخل ${g} (${r.team?.name})`);
      const prev = rows[i - 1];
      if (prev && Number.isFinite(prev.pts) && Number.isFinite(r.pts)) {
        if (r.pts > prev.pts) err(code, `ترتيب مقلوب في ${g}: ${r.team?.name} (${r.pts}) بعد ${prev.team?.name} (${prev.pts})`);
        else if (r.pts === prev.pts && r.gd > prev.gd) {
          /* التعادل بيتحل بقواعد البطولة: عدد الانتصارات أو المواجهات المباشرة قبل الفارق.
             بنحذّر بس لو مفيش أي قاعدة معروفة بتبرّر الترتيب. */
          const winsFirst = Number.isFinite(r.w) && Number.isFinite(prev.w) && r.w < prev.w;
          const h = h2hPoints(prev, r);
          /* مفيش مباراة محفوظة بينهم = مفيش دليل على خطأ (الترتيب من المصدر) */
          const provable = h.n > 0 && h.pa < h.pb;
          if (!winsFirst && provable) wrn(code, `تعادل نقاط بفارق غير مرتّب في ${g}: ${r.team?.name}`);
        }
      }
    });
  }

  /* اتزان الجدول: مجموع الانتصارات = مجموع الخسائر، والأهداف متساوية */
  if (s.length) {
    const sum = k => s.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    if (sum('w') !== sum('l')) wrn(code, `مجموع الانتصارات ${sum('w')} ≠ مجموع الخسائر ${sum('l')}`);
    if (sum('gf') !== sum('ga')) wrn(code, `مجموع الأهداف له ${sum('gf')} ≠ عليه ${sum('ga')}`);
    /* المباريات المحفوظة ممكن تكون نافذة جزئية من الموسم، فالمقارنة هنا اتجاه واحد فقط:
       مجموع المباريات الملعوبة لازم يكون >= ضعف المباريات المنتهية المحفوظة. */
    const finished = m.filter(x => x.status === 'FINISHED').length;
    /* المقارنة دي منطقية للدوري بس (كل فريق بيلعب مع الكل). في المجموعات/الكؤوس
       المباريات المحفوظة تشمل أدوار خروج المغلوب اللي مش في الجدول، فمش مقارنة عادلة. */
    if (kind === 'league' && finished && sum('p') < finished * 2 - 2) {
      wrn(code, `جدول الترتيب ناقص: مجموع الملعوبة ${sum('p')} أقل من ${finished} مباراة منتهية محفوظة`);
    }
  }

  /* المباريات */
  const mids = new Set(), pairs = new Set();
  let finishedNoScore = 0, badDate = 0, futureFinished = 0, stalePending = 0, ghosts = 0, negScore = 0;
  for (const x of m) {
    if (x.id != null) {
      if (mids.has(x.id)) err(code, `مباراة مكررة id=${x.id}`);
      mids.add(x.id);
    }
    const t = Date.parse(x.date);
    if (!Number.isFinite(t)) badDate++;
    if (!x.home?.name || !x.away?.name) err(code, `مباراة ${x.id}: فريق ناقص`);
    if (x.home?.name && x.away?.name) {
      const pk = [x.home.name, x.away.name].map(v => String(v).trim().toLowerCase()).sort().join('|') + '|' + (x.date || '').slice(0, 10);
      if (pairs.has(pk)) wrn(code, `مباراة مكررة (نفس الفريقين واليوم): ${x.home.name} × ${x.away.name}`);
      pairs.add(pk);
      if (s.length && kind === 'league') {
        const inTable = nm => names.has(String(nm).trim().toLowerCase());
        if (!inTable(x.home.name) && !inTable(x.away.name)) ghosts++;
      }
    }
    if (x.status === 'FINISHED' && (x.hg == null || x.ag == null)) finishedNoScore++;
    if (x.status === 'FINISHED' && Number.isFinite(t) && t > Date.now() + 864e5) futureFinished++;
    if (x.status !== 'FINISHED' && Number.isFinite(t) && t < Date.now() - 30 * 864e5) stalePending++;
    if ((x.hg ?? 0) < 0 || (x.ag ?? 0) < 0) negScore++;
  }
  if (finishedNoScore) err(code, `${finishedNoScore} مباراة منتهية بدون نتيجة`);
  if (badDate) err(code, `${badDate} مباراة بتاريخ غير صالح`);
  if (futureFinished) wrn(code, `${futureFinished} مباراة منتهية بتاريخ مستقبلي`);
  if (stalePending) wrn(code, `${stalePending} مباراة لم تُلعب وموعدها أقدم من 30 يوم`);
  if (ghosts) wrn(code, `${ghosts} مباراة بفريقين غير موجودين في الجدول`);
  if (negScore) err(code, `${negScore} مباراة بنتيجة سالبة`);
}

/* ---------- مقارنة حية اختيارية ---------- */
const live = { checked: 0, matched: 0, mismatched: 0, failed: 0 };
if (LIVE) {
  for (const { file, d } of leagues) {
    const c = d.code || file.replace('.json', '');
    const id = COMPS[c];
    if (!id || !Array.isArray(d.standings) || !d.standings.length) continue;
    try {
      const j = await getJSON(`https://webws.365scores.com/web/standings/?appTypeId=5&langId=1&competitions=${id}`);
      const rows = ((j.standings || [])[0] || {}).rows || [];
      const real = rows.filter(r => !/^(winner|loser|tbd|to be)\b/i.test(String(r.competitor?.name || '')));
      if (!real.length) { live.failed++; wrn(c, 'المصدر الحي رجّع جدول فاضي'); await sleep(1200); continue; }
      live.checked++;
      const fileRows = d.standings;
      /* المقارنة بالمعرّف مش بالاسم: أسماء المصدر بتختلف في الاختصارات */
      const byId = new Map(fileRows.map(r => [Number(r.team?.id), r]));
      const liveIds = new Set(real.map(r => Number(r.competitor?.id)));
      const missing = fileRows.filter(r => !liveIds.has(Number(r.team?.id))).length;
      const extra = real.filter(r => !byId.has(Number(r.competitor?.id))).length;
      let diff = 0;
      for (const r of real) {
        const f = byId.get(Number(r.competitor?.id));
        if (f && (f.pts !== r.points || f.p !== (r.gamesPlayed ?? f.p))) diff++;
      }
      if (missing || extra) {
        live.mismatched++;
        wrn(c, `فرق غير متطابقة مع المصدر: ${missing} في الملف مش في الحي، ${extra} في الحي مش في الملف`);
      } else if (diff) {
        live.mismatched++;
        wrn(c, `${diff} فريق بنقاط/مباريات مختلفة عن المصدر الحي`);
      } else live.matched++;
    } catch (e) { live.failed++; wrn(c, 'تعذّرت المقارنة الحية: ' + e.message); }
    await sleep(1500); /* حد آمن: طلب كل 1.5 ثانية */
  }
}

const report = {
  at: new Date().toISOString(),
  live,
  totals: { leagues: leagues.length, teamRows, matchRows, errors: errors.length, warnings: warns.length },
  errors, warns,
};
try { mkdirSync('.tmp', { recursive: true }); writeFileSync('.tmp/data-audit.json', JSON.stringify(report, null, 2)); } catch (e) { }

console.log(`\n📊 تدقيق البيانات: ${leagues.length} بطولة — ${teamRows} صف ترتيب — ${matchRows} مباراة`);
if (LIVE) console.log(`🌐 مقارنة حية: ${live.matched} مطابقة، ${live.mismatched} مختلفة، ${live.failed} فشلت`);
if (warns.length) {
  console.log(`\n⚠️ تحذيرات (${warns.length}):`);
  for (const w of warns.slice(0, 40)) console.log(`  [${w.code}] ${w.msg}`);
  if (warns.length > 40) console.log(`  … و${warns.length - 40} تحذير كمان`);
}
if (errors.length) {
  console.log(`\n❌ أخطاء (${errors.length}):`);
  for (const e of errors.slice(0, 60)) console.log(`  [${e.code}] ${e.msg}`);
  if (errors.length > 60) console.log(`  … و${errors.length - 60} خطأ كمان`);
}
console.log(errors.length ? `\nالنتيجة: فشل — ${errors.length} خطأ / ${warns.length} تحذير` : `\nالنتيجة: ✅ لا أخطاء (${warns.length} تحذير)`);
if (STRICT && errors.length) process.exit(1);
