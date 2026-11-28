'use strict';
/* ============================================================
   أسئلة اليوم — بتتولّد آليًا من أحدث بيانات البطولات
   كل يوم بيطلع بنك أسئلة جديد (متقدم/آخر/نقاط/نتايج) وبيتحسب
   من البيانات الحيّة نفسها، فالإجابات دايمًا صح.
   ============================================================ */

function dqHash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function dqRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dqPick(r, arr, n) {
  const a = arr.slice(), out = [];
  while (a.length && out.length < n) out.push(a.splice(Math.floor(r() * a.length), 1)[0]);
  return out;
}

/* أسئلة من بطولة واحدة */
const DQ_NAMES = {
  PL: 'الدوري الإنجليزي', PD: 'الدوري الإسباني', SA: 'الدوري الإيطالي', BL1: 'الدوري الألماني',
  FL1: 'الدوري الفرنسي', CL: 'دوري الأبطال', ELC: 'التشامبيونشيب', DED: 'الدوري الهولندي',
  PPL: 'الدوري البرتغالي', BSA: 'الدوري البرازيلي', EGY: 'الدوري المصري', SAU: 'الدوري السعودي',
  MAR: 'الدوري المغربي', TUN: 'الدوري التونسي', ALG: 'الدوري الجزائري', UAE: 'الدوري الإماراتي',
  QAT: 'الدوري القطري', IRQ: 'الدوري العراقي', JOR: 'الدوري الأردني'
};
function dqFromLeague(D, r, out) {
  const s = (D.standings || []).filter(x => x && x.team && x.team.name);
  if (s.length < 6) return;
  const name = DQ_NAMES[D.code] || D.nameAr || LN[D.code] || D.name || D.code;
  const top = s[0], last = s[s.length - 1];

  /* المتصدر */
  out.push(['auto', 1, `مين متصدر ${name} دلوقتي؟`, top.team.name,
    ...dqPick(r, s.slice(1), 3).map(x => x.team.name)]);

  /* الأخير */
  out.push(['auto', 1, `مين في آخر الترتيب في ${name}؟`, last.team.name,
    ...dqPick(r, s.slice(0, -1), 3).map(x => x.team.name)]);

  /* النقاط */
  const t = dqPick(r, s, 1)[0];
  const pts = num(t.pts);
  const wrong = [pts + 3, pts - 3, pts + 6, pts + 1]
    .filter((v, i, a) => v >= 0 && v !== pts && a.indexOf(v) === i)
    .slice(0, 3);
  while (wrong.length < 3) wrong.push(pts + 9 + wrong.length);
  out.push(['auto', 2, `كام نقطة جمع ${t.team.name} في ${name} الموسم ده؟`, String(pts), ...wrong.map(String)]);

  /* عدد الفرق */
  out.push(['auto', 1, `كام فريق بيلعب في ${name}؟`, String(s.length),
    String(s.length + 2), String(s.length - 2), String(s.length + 4)]);

  /* نتيجة مباراة */
  const fin = (D.matches || []).filter(m => m.status === 'FINISHED' && m.hg != null && m.ag != null);
  if (fin.length) {
    const m = dqPick(r, fin, 1)[0];
    if (m.hg !== m.ag) {
      const win = m.hg > m.ag ? m.home.name : m.away.name;
      const lose = m.hg > m.ag ? m.away.name : m.home.name;
      out.push(['auto', 2, `مين كسب مباراة ${m.home.name} ضد ${m.away.name}؟`, win, lose, 'التعادل', 'اتلغت']);
    } else {
      out.push(['auto', 2, `مباراة ${m.home.name} ضد ${m.away.name} انتهت بكام؟`,
        `${m.hg} - ${m.ag}`, `${m.hg + 1} - ${m.ag}`, `${m.hg} - ${m.ag + 1}`, `${m.hg + 1} - ${m.ag + 1}`]);
    }
  }
}

let DQ_P = null;
/* بتبني أسئلة اليوم مرة واحدة في اليوم */
function ensureDailyQuestions() {
  const day = dayKey();
  if (window.__dqDay === day) return Promise.resolve();
  if (DQ_P) return DQ_P;

  DQ_P = (async () => {
    if (typeof CATS !== 'undefined' && !CATS.some(c => c[0] === 'auto')) {
      CATS.push(['auto', 'أسئلة اليوم 📅']);
    }
    const packs = await Promise.all(['PL', 'EGY', 'SAU'].map(c => leagueData(c).catch(() => null)));
    const r = dqRng(dqHash('snaces-dq-' + day));
    const out = [];
    packs.forEach(D => { if (D) dqFromLeague(D, r, out); });
    if (!out.length) return;

    /* نستبدل أسئلة الأمس */
    for (let i = QB.length - 1; i >= 0; i--) if (QB[i][0] === 'auto') QB.splice(i, 1);
    const seen = new Set(QB.map(q => q[2]));
    out.filter(q => !seen.has(q[2])).forEach(q => {
      if (!q[7]) q[7] = 'auto:' + dqHash(q[2]).toString(36);
      QB.push(q);
    });
    window.__dqDay = day;
  })().catch(() => { }).then(() => { DQ_P = null; });

  return DQ_P;
}
