'use strict';
/* ============================================================
   البيانات الحيّة — 365Scores (الواجهة بتسمح بـCORS)
   بنجيب الجدول والمباريات من المتصفح مباشرة، بنكاش 6 ساعات،
   ولو الشبكة وقعت أو المصدر رفض بنرجع لملفات data/ المحفوظة.
   ============================================================ */

const LIVE_COMPS = {
  PL: 7, PD: 11, SA: 17, BL1: 25, FL1: 35, CL: 572, ELC: 1, DED: 57, PPL: 73, BSA: 113, TSL: 78,
  /* كؤوس محلية */
  FACUP: 8, EFLCP: 9, CDR: 13, COPPA: 20, DFBP: 28, CDFR: 37, TACAP: 75, CDB: 115, TKUP: 80,
  EGYCUP: 553, EGYLC: 7808, KINGCUP: 5501, TRONE: 5420, TUNCUP: 5558, UAEPRES: 6346, UAELC: 6181,
  EGY: 552, SAU: 649, MAR: 557, TUN: 554, ALG: 560, UAE: 549, QAT: 408, IRQ: 6822, JOR: 565,
  ARB: 7674, ARBCL: 6840, GULF: 5452, AFCON: 167, ASIAN: 6196,
  /* بطولات قارية */
  UEL: 573, UECL: 7685, LIB: 102, SUDA: 389, CAFCL: 624, CAFCC: 627, CAFSC: 5581,
  ACL: 623, ACL2: 568, CCC: 171, UESC: 472, RECOPA: 601,
  /* سوبر محلي */
  CSHIELD: 10, SESP: 15, SITA: 82, SGER: 32, SFRA: 40, SPOR: 77, STUR: 93,
  /* Americas */
  MLS: 104, LMX: 141, ARG: 72, COL: 620, USLC: 5663,
  COPAARG: 640, COPACOL: 616,
  /* كؤوس قطر */
  QATEMIR: 6242, QATCUPS: 5832, QSL: 7653,
  /* سوبر محلي */
  EGYSC: 5595, SAUSC: 6164, ALGSC: 6165, ARGSC: 5433, COLSL: 5106, BRASC: 7284, MXSC: 6263,
  JORSC: 5599, JORSH: 6798, IRQSC: 7270, KUWSC: 5475, OMASC: 6166, BHRSC: 6904, TUNSC: 7203,
  /* سوبر قاري */
  CAMPEONES: 7259, UCBCH: 7970,
  /* عالمي — أندية */
  FIC: 8268,
  /* عالمي — منتخبات */
  WC: 5930, WWC: 597, U17WC: 5582, WU20: 6818, WU17: 6085, CONF: 5517, FINALISSIMA: 7823,
  /* منتخبات قارية */
  EURO: 6316, CA: 595, GOLD: 589, UNL: 7016, CNL: 7165, CAW: 7057,
  /* شباب قاري */
  EU21: 591, EU19: 467, EU17: 328, SA20: 5453, AFC20: 6815, CAF20: 7619, CONC20: 5485,
  CAFU17: 8640, ARBU20: 7321,
  /* كرة القدم للسيدات */
  WSL: 6216, WFACUP: 6217, WLCUP: 7918, LIGAF: 6220, SERIEAW: 6222, COPPAW: 8060, SUPCW: 8486,
  BLW: 6215, DFBPW: 6862, FRAUW: 6083, NWSL: 5566, NWSLCC: 7557, LMXF: 7143, BRAZW: 6223,
  CDBW: 8702, ARGW: 6224, COLW: 7041, SAUWPL: 8273, SAUWSC: 8830, SAFFW: 8895,
  PORWLC: 7871, PORWSC: 7749, UWCL: 6225, UWEC: 8833, LIBW: 6226, CAFW: 8746, AFCW: 9018,
  GOLDW: 7850, FWCC: 8882, OLYW: 6371, ICCW: 7860
};
const LIVE_TTL = 6 * 3600e3;        /* كاش الجدول والهدافين — مش النتايج */
const LIVE_LEAGUE_TTL = 2 * 60e3;   /* نتايج بطولة واحدة */
const LIVE_GAMES_TTL = 45e3;        /* سنابشوت كل البطولات */
const LIVE_RESULTS_TTL = 3 * 60e3;  /* نتايج منتهية ومفيش مباشر */
const LIVE_MATCH_TTL = 5 * 60e3;    /* تفاصيل مباراة مش مباشرة */
const LIVE_LEADERS_TTL = 12 * 3600e3;
const LIVE_BASE = 'https://webws.365scores.com/web';
const LIVE_SNAP_KEY = 'snaces_live_snapshot1';
const EU_CODES = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL', 'ELC', 'DED', 'PPL', 'BSA'];

const liveCrest = id => id
  ? `https://imagecache.365scores.com/image/upload/f_png,w_80,h_80,c_limit,q_auto:eco/v1/Competitors/${id}`
  : null;

/* ---------- محوّل الحالات الموحّد ----------
   statusGroup: 2 = لم تبدأ، 3 = مباشر، 4 = مجموعة المنتهية/المؤجلة
   statusId: 2 = لم تبدأ، 3 = انتهت، 5 = مؤجلة، 7 = بين الشوطين،
             8 = الشوط التاني، 154 = بعد الوقت الإضافي، 155 = بعد الترجيح
   النص بيسبق الأرقام في الحالات الشاذة (إلغاء/تأجيل/إيقاف/انسحاب).
   -1 معناها مفيش نتيجة، ومش صفر. */
const LIVE_SCORE_STATUS = ['IN_PLAY', 'FINISHED', 'AWARDED'];
const LIVE_DONE_STATUS = ['FINISHED', 'AWARDED', 'ABANDONED', 'CANCELLED'];
const LIVE_STATUS_AR = {
  IN_PLAY: 'مباشر', FINISHED: 'انتهت', TIMED: 'لم تبدأ', POSTPONED: 'مؤجلة',
  CANCELLED: 'ملغاة', SUSPENDED: 'متوقفة', AWARDED: 'محسومة', DELAYED: 'متأخرة',
  ABANDONED: 'متروكة', UNKNOWN: ''
};
const liveStatusLabel = s => LIVE_STATUS_AR[s] || '';
const liveStatusActive = s => s === 'IN_PLAY';
const liveStatusDone = s => LIVE_DONE_STATUS.includes(s);

function liveStatus(g) {
  if (!g) return 'UNKNOWN';
  const txt = String(g.statusText || g.shortStatusText || '').trim();
  const t = txt.toLowerCase();
  const sid = Number(g.statusId), sg = Number(g.statusGroup);

  /* الشاذة بالنص الأول — عشان «Postponed» جوه statusGroup 4 */
  if (/postpon|postponed/.test(t)) return 'POSTPONED';
  if (/cancel/.test(t)) return 'CANCELLED';
  if (/abandon/.test(t)) return 'ABANDONED';
  if (/suspend|interrupt|halt/.test(t)) return 'SUSPENDED';
  if (/award/.test(t)) return 'AWARDED';
  if (/delay/.test(t)) return 'DELAYED';

  /* ثم أكواد المصدر الموثوقة */
  if (sid === 154 || sid === 155 || sid === 3) return 'FINISHED';
  if (sid === 5) return 'POSTPONED';
  if (sid === 7 || sid === 8) return 'IN_PLAY';
  /* النص الصريح يسبق المجموعة لو حصل تعارض */
  if (/\b(ended|final|after (et|extra|pen)|full ?time|ft|aet)\b/.test(t)) return 'FINISHED';
  if (/\b(live|in progress|1st half|2nd half|half ?time|extra time|penalties|shootout)\b/.test(t)) return 'IN_PLAY';
  if (sg === 3) return 'IN_PLAY';
  if (sg === 2 || sid === 2) return 'TIMED';
  if (sg === 4) return 'FINISHED';
  if (/\b(sched|not started|upcoming|tbd|to be played)\b/.test(t)) return 'TIMED';
  return 'TIMED';
}

/* نتيجة المصدر: أرقام >= 0 بس. -1 وnull و'' كلها «مفيش نتيجة» */
function liveScore(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? Math.trunc(v) : null;
  if (typeof v === 'string' && /^\s*\d+\s*$/.test(v)) return Number(v.trim());
  return null;
}
const liveHasScore = m => m && liveScore(m.hg) != null && liveScore(m.ag) != null;

/* الملف المحفوظ مش مصدر مباشر: أي IN_PLAY قديمة ما تفضلش مباشرة */
function liveSanitizeSaved(m) {
  if (!m) return m;
  let s = String(m.s || m.status || 'UNKNOWN').toUpperCase();
  const t = Date.parse(m.d || m.date || '');
  if (s === 'IN_PLAY') {
    if (Number.isFinite(t) && t > Date.now() + 5 * 60e3) s = 'TIMED';
    else if (!Number.isFinite(t) || Date.now() - t > 4 * 3600e3) s = 'FINISHED';
  }
  return Object.assign({}, m, { s, status: s });
}

function liveGame(g) {
  const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
  const status = liveStatus(g);
  const hs = liveScore(h.score), as = liveScore(a.score);
  const scored = LIVE_SCORE_STATUS.includes(status) && hs != null && as != null;
  const gt = Number(g.gameTime);
  return {
    id: g.id, date: g.startTime, d: g.startTime, s: status, status,
    md: g.roundNum || null, cn: g.competitionDisplayName || '', compId: g.competitionId,
    gameTime: Number.isFinite(gt) ? gt : null,
    gtd: g.gameTimeDisplay || '', added: g.addedTime ?? null,
    /* نص حالة المصدر + الوقت الدقيق بالثواني (بييجي في تفاصيل المباراة) */
    stx: g.statusText || g.shortStatusText || '',
    precise: g.preciseGameTime && Number.isFinite(+g.preciseGameTime.minutes) ? g.preciseGameTime : null,
    preciseAt: Date.now(), syncAt: Date.now(),
    stage: g.stageName || null, stageNum: g.stageNum ?? null,
    home: { id: h.id, name: h.name, crest: liveCrest(h.id) },
    away: { id: a.id, name: a.name, crest: liveCrest(a.id) },
    h: { id: h.id, n: h.name || '', c: liveCrest(h.id) },
    a: { id: a.id, n: a.name || '', c: liveCrest(a.id) },
    hg: scored ? hs : null, ag: scored ? as : null
  };
}

/* ============================================================
   ساعة المباراة المباشرة
   المصدر بيعطي preciseGameTime بالثواني في تفاصيل المباراة،
   وgameTime بالدقائق في قائمة المباريات. بنثبّت آخر قراءة موثوقة
   (syncAt) وبنعدّ محليًا كل ثانية، بدون طلب API كل ثانية.
   ============================================================ */
const LIVE_CLOCK_MAP = new Map();
let LIVE_CLOCK_TIMER = null;

const liveClockPad = n => String(n).padStart(2, '0');

/* بيرجّع {text, ticking, kind} أو null لو مفيش وقت موثوق */
function liveClockRaw(m) {
  if (!m || m.s !== 'IN_PLAY') return null;
  const txt = String(m.stx || '').toLowerCase();
  const disp = String(m.gtd || '').trim();
  const minuteOnly = () => {
    const mm = disp.match(/^\s*(\d{1,3})/);
    return mm ? mm[1] + '′' : null;
  };

  /* ركلات الترجيح: مفيش عدّاد دقائق */
  if (/penalt|shootout|ركلات ترجيح/.test(txt)) return { text: 'ركلات ترجيح', ticking: false, kind: 'pens' };
  /* الاستراحة وبين الشوطين: العداد متجمّد — 45:00 أو 105:00 في الوقت الإضافي */
  if (/half.?time|\bht\b|end of (first|1st)|break|between halves/.test(txt)) {
    const pm = m.precise && +m.precise.minutes;
    const gm = disp.match(/^\s*(\d{1,3})/);
    const baseMin = Number.isFinite(pm) ? pm : gm ? +gm[1] : 45;
    return { text: baseMin >= 100 ? '105:00' : baseMin >= 90 ? '90:00' : '45:00', ticking: false, kind: 'ht' };
  }
  /* توقف مؤقت: منعرضش وقت مضلل */
  if (/suspend|interrupt|halt|delay|abandon|postpon|\bstopped\b|\bpaused\b|\bstop\b|توقف|متوقف/.test(txt)) return null;
  /* بيانات قديمة/أوفلاين: الدقائق فقط، بدون عدّاد ثواني مخترع */
  if (m.stale) { const c = minuteOnly(); return c ? { text: c, ticking: false, kind: 'minutes' } : null; }

  const p = m.precise;
  let base = null, at = Number(m.syncAt) || 0, auto = true;
  if (p && Number.isFinite(+p.minutes)) {
    base = (+p.minutes) * 60 + Math.max(0, Math.min(59, +p.seconds || 0));
    at = Number(m.preciseAt) || at || Date.now();
    /* لو المصدر بيقول إن الساعة واقفة، منحركهاش */
    auto = p.autoProgress !== false && p.clockDirection !== 0;
  } else {
    /* من غير وقت دقيق بالثواني: نعرض الدقائق فقط بدل وقت مضلل */
    const mm = disp.match(/^\s*(\d{1,3})/) || (Number.isFinite(+m.gameTime) ? [null, String(+m.gameTime)] : null);
    return mm ? { text: mm[1] + '′', ticking: false, kind: 'minutes' } : null;
  }
  if (base == null) return minuteOnly() ? { text: minuteOnly(), ticking: false, kind: 'minutes' } : null;

  /* سقف لكل فترة مع سماح وقت البدل: الشوط الأول حتى 50:00، الثاني حتى 100:00،
     والوقت الإضافي حتى 130:00 — وبعد كده منعرضش ثواني مخترعة. */
  let cap = 7800;
  if (/1st half/.test(txt)) cap = 3000;
  else if (/2nd half/.test(txt)) cap = 6000;
  else if (/extra time/.test(txt)) cap = 7800;
  else cap = base > 6000 ? 7800 : base > 3000 ? 6000 : 7800;

  let sec = base + (auto && at ? Math.max(0, (Date.now() - at) / 1000) : 0);
  if (!Number.isFinite(sec) || sec < 0) sec = base;
  if (sec > cap) sec = cap;
  /* لو الدقائق نفسها أكبر من الحد (بيانات قديمة) منعرضش رقم غلط */
  if (base > cap) return minuteOnly() ? { text: minuteOnly(), ticking: false, kind: 'minutes' } : null;

  const s = Math.floor(sec);
  return { text: liveClockPad(Math.floor(s / 60)) + ':' + liveClockPad(s % 60), ticking: auto && s < cap, kind: 'clock' };
}

/* نص الساعة فقط (من غير شارة) */
function liveClockText(m) {
  const c = liveClockRaw(m);
  return c ? c.text : '';
}

/* نص موحّد: مباشر 67:38 / مباشر 45:00 / مباشر • ركلات ترجيح */
function liveClockLabel(m) {
  if (!m || m.s !== 'IN_PLAY') return '';
  const c = liveClockRaw(m);
  if (!c) return 'مباشر';
  return c.kind === 'pens' ? 'مباشر • ركلات ترجيح' : 'مباشر ' + c.text;
}

function liveClockRemember(m) {
  if (!m || m.s !== 'IN_PLAY') return;
  if (LIVE_CLOCK_MAP.size > 300) LIVE_CLOCK_MAP.clear();
  LIVE_CLOCK_MAP.set(String(m.id), m);
  if (LIVE_CLOCK_TIMER || typeof window === 'undefined') return;
  LIVE_CLOCK_TIMER = setInterval(liveClockTick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) liveClockTick(); });
}

function liveClockTick() {
  if (typeof document === 'undefined' || document.hidden) return;
  const els = document.querySelectorAll('[data-clock]');
  for (const el of els) {
    const m = LIVE_CLOCK_MAP.get(String(el.getAttribute('data-clock')));
    if (!m) continue;
    const c = liveClockRaw(m);
    if (c && c.kind === 'clock') el.textContent = c.text;
  }
}

/* الساعة فقط — عشان تندمج مع نص الحالة في هيدر المباراة */
function liveClockSpan(m) {
  if (!m || m.s !== 'IN_PLAY') return '';
  const c = liveClockRaw(m);
  if (!c) return '';
  liveClockRemember(m);
  if (c.kind === 'pens') return ' • ركلات ترجيح';
  if (c.kind === 'clock') return ' <span class="lclock" dir="ltr" data-clock="' + String(m.id) + '">' + c.text + '</span>';
  return ' ' + c.text;
}

/* شارة المباشر الموحّدة لكل الصفحات */
function liveClockHtml(m, withBadge) {
  if (!m || m.s !== 'IN_PLAY') return '';
  const c = liveClockRaw(m);
  liveClockRemember(m);
  const inner = !c ? 'مباشر'
    : c.kind === 'pens' ? 'مباشر • ركلات ترجيح'
    : c.kind === 'clock' ? 'مباشر <span class="lclock" dir="ltr" data-clock="' + String(m.id) + '">' + c.text + '</span>'
    : 'مباشر ' + c.text;
  if (withBadge === false) return inner.replace(/<[^>]+>/g, '');
  return '<span class="liveBadge">' + inner + '</span>';
}

async function liveGet(url) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(url, { cache: 'no-store', signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}

/* ---------- سنابشوت واحد لكل البطولات ----------
   نفس الطلب بيتشارك بين الرئيسية والمباريات والتفاصيل. */
let LIVE_SNAP = store.get(LIVE_SNAP_KEY, null);
if (LIVE_SNAP && !Array.isArray(LIVE_SNAP.games)) LIVE_SNAP = null;
let LIVE_PROMISE = null;
const LIVE_ALL_IDS = [...new Set(Object.values(LIVE_COMPS))].join(',');

function liveSnapResult(snap, stale, error) {
  const games = snap.games.map(m => Object.assign({}, m, { stale: !!stale }));
  const live = games.filter(m => m.s === 'IN_PLAY').length;
  return {
    games,
    meta: {
      ok: !stale, stale: !!stale, fetchedAt: snap.at, lastUpdateId: snap.u ?? null,
      error: error || null, live, finished: games.filter(m => m.s === 'FINISHED').length
    }
  };
}

function liveSnapTtl(snap) {
  if (!snap || !Array.isArray(snap.games)) return LIVE_GAMES_TTL;
  if (snap.games.some(m => m.s === 'IN_PLAY')) return LIVE_GAMES_TTL;
  const now = Date.now();
  const near = snap.games.some(m => {
    const t = Date.parse(m.d || '');
    return Number.isFinite(t) && Math.abs(now - t) < 45 * 60e3;
  });
  return near ? 90e3 : LIVE_RESULTS_TTL;
}

async function liveSnapshot(force) {
  if (!force && LIVE_SNAP && Date.now() - LIVE_SNAP.at < liveSnapTtl(LIVE_SNAP)) return liveSnapResult(LIVE_SNAP, false);
  if (LIVE_PROMISE) return LIVE_PROMISE;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return LIVE_SNAP ? liveSnapResult(LIVE_SNAP, true, 'offline') : null;
  }
  LIVE_PROMISE = (async () => {
    try {
      const j = await liveGet(`${LIVE_BASE}/games/current/?appTypeId=5&langId=1&competitions=${LIVE_ALL_IDS}`);
      if (!j || !Array.isArray(j.games) || !j.games.length) throw new Error('empty response');
      const comps = {};
      (j.competitions || []).forEach(c => { comps[c.id] = c.name; });
      const games = j.games.map(g => {
        const m = liveGame(g);
        m.l = Object.keys(LIVE_COMPS).find(k => LIVE_COMPS[k] === Number(g.competitionId)) || '';
        if (!m.cn) m.cn = comps[g.competitionId] || '';
        return m;
      }).filter(m => m.l && m.home.id && m.away.id)
        .filter(m => !/^(winner|loser|tbd|to be)\b/i.test(String(m.home.name || '')) && !/^(winner|loser|tbd|to be)\b/i.test(String(m.away.name || '')));
      if (!games.length) throw new Error('no supported games');
      /* الوقت الدقيق بالثواني بييجي من تفاصيل المباراة — للمباشر بس */
      /* كل المباريات المباشرة (بسقف أمان) عشان الساعة بالثواني تبقى موحّدة في كل الكروت */
      await Promise.all(games.filter(m => m.s === 'IN_PLAY').slice(0, 24).map(liveClockSync));
      LIVE_SNAP = { at: Date.now(), u: j.lastUpdateId ?? null, games };
      store.set(LIVE_SNAP_KEY, LIVE_SNAP);
      return liveSnapResult(LIVE_SNAP, false);
    } catch (e) {
      /* فشل المصدر: آخر نسخة سليمة، وموسومة قديمة مش مباشرة */
      return LIVE_SNAP ? liveSnapResult(LIVE_SNAP, true, e.message || 'source failed') : null;
    } finally { LIVE_PROMISE = null; }
  })();
  return LIVE_PROMISE;
}

/* ---- دمج آمن بين المحفوظ والحي ----
   المعرف الثابت أولًا، وبعده البطولة + الفريقين + وقت الانطلاق.
   ماينفعش الحي يمسح نتيجة صحيحة بـnull، وماينفعش يرجع منتهية لمباشرة. */
function liveMatchKey(m) {
  if (m && m.id != null && m.id !== '') return 'id:' + String(m.id);
  const h = m && (m.home || m.h) || {}, a = m && (m.away || m.a) || {};
  if (!m || !m.d || !h.id || !a.id) return '';
  return 'k:' + (m.l || '') + ':' + h.id + ':' + a.id + ':' + m.d;
}

function liveMerge(base, incoming) {
  const out = [], idx = new Map();
  const put = m => {
    if (!m) return;
    const k = liveMatchKey(m);
    if (!k) return;
    if (!idx.has(k)) { idx.set(k, out.length); out.push(Object.assign({}, m)); return; }
    const i = idx.get(k), old = out[i];
    const nx = Object.assign({}, m);
    const nScore = liveHasScore(nx), oScore = liveHasScore(old);
    if (!nScore && oScore) { nx.hg = old.hg; nx.ag = old.ag; }
    /* منتهية بنتيجة ما ترجعش «لم تبدأ» أو «مباشرة» من استجابة أقدم */
    /* مباراة انتهت فعلاً ما ترجعش مباشرة أو لم تبدأ حتى لو وصلت نتيجة ناقصة/قديمة */
    if (old.s === 'FINISHED' && oScore && (nx.s === 'TIMED' || nx.s === 'IN_PLAY')) {
      nx.s = 'FINISHED'; nx.status = 'FINISHED'; nx.gameTime = old.gameTime ?? null;
      nx.hg = old.hg; nx.ag = old.ag;
    }
    if (!nx.s || nx.s === 'UNKNOWN') nx.s = old.s;
    if (nx.status == null) nx.status = nx.s;
    nx.h = Object.assign({}, old.h || old.home, nx.h || nx.home);
    nx.a = Object.assign({}, old.a || old.away, nx.a || nx.away);
    out[i] = Object.assign({}, old, nx);
  };
  (base || []).forEach(put);
  (incoming || []).forEach(put);
  return out;
}

/* مزامنة الوقت الدقيق (دقائق + ثواني) للمباريات المباشرة من صفحة التفاصيل */
async function liveClockSync(m) {
  if (!m || !m.id || m.s !== 'IN_PLAY') return;
  try {
    const j = await liveGet(`${LIVE_BASE}/game/?appTypeId=5&langId=1&gameId=${m.id}`);
    const g = j && j.game;
    const p = g && g.preciseGameTime;
    if (p && Number.isFinite(+p.minutes)) {
      m.precise = p;
      m.preciseAt = Date.now();
      m.syncAt = Date.now();
      if (g.statusText) m.stx = g.statusText;
      if (g.gameTimeDisplay) m.gtd = g.gameTimeDisplay;
    }
  } catch (e) { }
}

/* مباريات كل البطولات المدعومة (أو بطولات محددة) من المصدر الحي */
async function liveMatchesFor(codes, opts) {
  const r = await liveSnapshot(!!(opts && opts.force));
  if (!r) return null;
  let games = r.games;
  if (codes && codes.length) {
    const set = new Set(codes);
    games = games.filter(m => set.has(m.l));
  }
  const out = games.map(m => Object.assign({}, m));
  out.meta = r.meta;
  return out;
}

/* جلب بطولة واحدة: جدول (كاش 6 س) + نتايج حية (كاش قصير) */
const LIVE_COMP_P = new Map();
async function liveComp(id, force) {
  const k = String(id);
  if (LIVE_COMP_P.has(k)) return LIVE_COMP_P.get(k);
  const p = liveCompNow(id, force);
  LIVE_COMP_P.set(k, p);
  try { return await p; }
  finally { if (LIVE_COMP_P.get(k) === p) LIVE_COMP_P.delete(k); }
}

async function liveCompNow(id, force) {
  const key = 'snaces_live4_' + id;
  const c = store.get(key, null);
  if (!force && c && c.d && Date.now() - c.t < LIVE_LEAGUE_TTL) return c.d;
  const qs = 'appTypeId=5&langId=1&competitions=' + id;
  const sKey = 'snaces_standings6_' + id, rKey = 'snaces_results6_' + id;
  const sC = store.get(sKey, null), rC = store.get(rKey, null);
  const stFresh = sC && sC.d && Date.now() - sC.t < LIVE_TTL ? sC.d : null;
  const pastFresh = rC && rC.d && Date.now() - rC.t < LIVE_TTL ? rC.d : null;
  const [st, past, now] = await Promise.all([
    stFresh ? stFresh : liveGet(`${LIVE_BASE}/standings/?${qs}`)
      .then(j => { store.set(sKey, { t: Date.now(), d: j }); return j; })
      .catch(() => sC && sC.d ? sC.d : null),
    pastFresh ? pastFresh : liveGet(`${LIVE_BASE}/games/results/?${qs}&showOdds=false`)
      .then(j => { store.set(rKey, { t: Date.now(), d: j }); return j; })
      .catch(() => rC && rC.d ? rC.d : null),
    liveGet(`${LIVE_BASE}/games/current/?${qs}`).catch(() => null)
  ]);
  if (!st && !past && !now) throw new Error('source failed');

  const standings = [];
  const groups = (st && st.standings) || (c && c.d && c.d.standings) || [];
  groups.forEach(s => {
    (s.rows || []).forEach((r, i) => {
      const t = r.competitor || {};
      /* صفوف الأقواس في البطولات مش جدول حقيقي */
      if (/^(winner|loser|tbd|to be|1st|2nd)\b/i.test(String(t.name || ''))) return;
      /* البطولات المجمّعة: المجموعة بتيجي جوه الصف نفسه */
      const gn = r.groupNum && r.groupNum > 0 ? r.groupNum : 0;
      const group = gn ? 'المجموعة ' + gn : (groups.length > 1 ? (s.displayName || null) : null);
      standings.push({
        pos: r.position || r.rank || i + 1,
        group,
        gn,
        team: { id: t.id, name: t.name, crest: liveCrest(t.id) },
        p: r.gamePlayed ?? 0, w: r.gamesWon ?? 0, d: r.gamesEven ?? 0, l: r.gamesLost ?? 0,
        gf: r.for ?? 0, ga: r.against ?? 0,
        gd: r.ratio ?? ((r.for ?? 0) - (r.against ?? 0)),
        pts: r.points ?? 0,
        /* خصم النقاط: المصدر مش دايماً بيعلّمه، فبنحسبه */
        ded: (r.points ?? 0) < 3 * (r.gamesWon ?? 0) + (r.gamesEven ?? 0)
      });
    });
  });
  /* ترتيب المصدر هو المرجع، بس الأدوار التأهيلية (بدون مجموعة) في الآخر */
  standings.sort((a, b) => (a.gn ? 0 : 1) - (b.gn ? 0 : 1));

  const seen = new Set();
  const raw = [...((now && now.games) || []), ...((past && past.games) || [])].filter(g => {
    if (!g || seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
  const mapped = raw.map(liveGame).filter(m => m.home.id && m.away.id)
    .filter(m => !/^(winner|loser|tbd|to be)\b/i.test(String(m.home.name || '')) && !/^(winner|loser|tbd|to be)\b/i.test(String(m.away.name || '')));

  const nowMs = Date.now() - 6 * 3600e3;
  const upcoming = mapped.filter(m => !liveStatusDone(m.s) && new Date(m.date).getTime() > nowMs)
    .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 30);
  const finished = mapped.filter(m => liveStatusDone(m.s))
    .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40);
  const out = {
    name: (groups[0] && groups[0].displayName) || (c && c.d && c.d.name) || '',
    standings,
    matches: liveMerge([], [...upcoming, ...finished]),
    fetchedAt: Date.now(),
    lastUpdateId: (now && now.lastUpdateId) ?? null
  };
  const hasLive = out.matches.some(m => m.s === 'IN_PLAY');
  store.set(key, { t: Date.now(), d: out, ttl: hasLive ? LIVE_LEAGUE_TTL : LIVE_RESULTS_TTL });
  return out;
}

/* كل مباريات فريق واحد (نتائج + قادمة) من المصدر الحي — بيتنقل بين الصفحات */
async function liveTeamGames(id) {
  const key = 'snaces_teamgames2_' + id;
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < 30 * 60e3) return c.d;
  const qs = 'appTypeId=5&langId=1&competitors=' + encodeURIComponent(id);
  const batches = [];
  let next = `${LIVE_BASE}/games/results/?${qs}&showOdds=false`;
  for (let i = 0; i < 10 && next; i++) {
    let j = null;
    try { j = await liveGet(next); } catch (e) { break; }
    batches.push(j);
    const np = j && j.paging && j.paging.nextPage;
    next = np ? 'https://webws.365scores.com' + np : '';
  }
  try { batches.push(await liveGet(`${LIVE_BASE}/games/current/?${qs}`)); } catch (e) { }
  if (!batches.length) { if (c && c.d) return c.d; return null; }

  const compNames = {};
  batches.forEach(j => ((j && j.competitions) || []).forEach(x => { compNames[x.id] = x.name; }));
  const byId = new Map();
  batches.forEach(j => ((j && j.games) || []).forEach(g => {
    const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
    if (!h.id || !a.id || byId.has(g.id)) return;
    const status = liveStatus(g);
    const hs = liveScore(h.score), as = liveScore(a.score);
    const scored = LIVE_SCORE_STATUS.includes(status) && hs != null && as != null;
    const gt = Number(g.gameTime);
    byId.set(g.id, {
      id: g.id,
      code: Object.keys(LIVE_COMPS).find(k => LIVE_COMPS[k] === Number(g.competitionId)) || '',
      comp: compNames[g.competitionId] || g.competitionDisplayName || '',
      date: g.startTime, d: g.startTime, status, s: status, md: g.roundNum || null,
      gameTime: Number.isFinite(gt) ? gt : null, gtd: g.gameTimeDisplay || '',
      stx: g.statusText || g.shortStatusText || '', syncAt: Date.now(),
      home: { id: String(h.id), name: h.name || '', crest: liveCrest(h.id) },
      away: { id: String(a.id), name: a.name || '', crest: liveCrest(a.id) },
      hg: scored ? hs : null, ag: scored ? as : null
    });
  }));
  const all = [...byId.values()];
  if (!all.length) { if (c && c.d) return c.d; return null; }
  const out = {
    live: all.filter(m => m.status === 'IN_PLAY').sort((a, b) => new Date(a.date) - new Date(b.date)),
    upcoming: all.filter(m => !liveStatusDone(m.status) && m.status !== 'IN_PLAY').sort((a, b) => new Date(a.date) - new Date(b.date)),
    finished: all.filter(m => liveStatusDone(m.status)).sort((a, b) => new Date(b.date) - new Date(a.date))
  };
  store.set(key, { t: Date.now(), d: out });
  return out;
}

/* بيانات بطولة: حيّة أولًا، ولو فشلت نرجع للكاش ثم للملف
   كاش النتايج هنا قصير، وكاش الجدول جوه liveComp منفصل 6 ساعات. */
async function leagueData(code, force) {
  if (!LIVE_COMPS[code]) return getJSON('data/' + code + '.json');
  const key = 'snaces_league4_' + code;
  const c = store.get(key, null);
  const ttl = c && c.ttl ? c.ttl : LIVE_LEAGUE_TTL;
  if (!force && c && c.d && Date.now() - c.t < ttl) return c.d;

  try {
    const d = await liveComp(LIVE_COMPS[code], force);
    if (!d.standings.length && !d.matches.length) throw new Error('empty');
    const hasLive = d.matches.some(m => m.s === 'IN_PLAY');
    const out = {
      code, name: d.name || LN[code] || code, nameAr: LN[code] || code,
      standings: d.standings, matches: d.matches, scorers: [],
      live: { ok: true, stale: false, fetchedAt: d.fetchedAt, lastUpdateId: d.lastUpdateId ?? null, error: null }
    };
    store.set(key, { t: Date.now(), ttl: hasLive ? LIVE_LEAGUE_TTL : LIVE_RESULTS_TTL, d: out });
    return out;
  } catch (e) {
    if (c && c.d) {
      const out = Object.assign({}, c.d, {
        live: Object.assign({}, c.d.live || {}, { ok: false, stale: true, error: e.message || 'source failed' })
      });
      return out;
    }
    const saved = await getJSON('data/' + code + '.json');
    if (!saved) return null;
    /* الملف المحفوظ مش مصدر مباشر: بنعلّمه قديم، والحالات القديمة بتتنضف في الصفحات */
    return Object.assign({}, saved, {
      matches: (saved.matches || []).map(liveSanitizeSaved),
      live: { ok: false, stale: true, fetchedAt: saved.updated ? Date.parse(saved.updated) : null, lastUpdateId: null, error: e.message || 'source failed' }
    });
  }
}

/* ---------- الهدافون وأكثر صناعة (من إحصائيات 365Scores) ---------- */
async function liveScorers(code) {
  const id = LIVE_COMPS[code];
  if (!id) return null;
  const key = 'snaces_scorers_' + code;
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < LIVE_TTL) return c.d;
  try {
    const j = await liveGet(`${LIVE_BASE}/stats/?appTypeId=5&langId=1&competitions=${id}`);
    const tables = (j.stats && j.stats.athletesStats && j.stats.athletesStats.tables) || [];
    const pick = (name, typeId) => {
      const t = tables.find(x => String(x.name || '').toLowerCase() === name);
      if (!t) return [];
      return (t.rows || []).map(r => {
        const e = r.entity || {};
        const s = (r.stats || []).find(x => x.typeId === typeId);
        return { id: e.id, name: e.name, teamId: e.competitorId, value: num(s && s.value) };
      }).filter(x => x.name && x.value > 0).sort((a, b) => b.value - a.value).slice(0, 20);
    };
    const out = { goals: pick('goals', 1), assists: pick('assists', 2) };
    if (!out.goals.length && !out.assists.length) return null;
    store.set(key, { t: Date.now(), d: out });
    return out;
  } catch (e) {
    if (c && c.d) return c.d;
    return null;
  }
}

/* ---------- كرة اليد (رياضة 5 عند 365Scores) ---------- */
const pad2 = n => String(n).padStart(2, '0');
const dmy = d => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

async function liveHandball() {
  const key = 'snaces_handball';
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < 60 * 60e3) return c.d;
  try {
    const from = new Date(Date.now() - 2 * 864e5);
    const to = new Date(Date.now() + 4 * 864e5);
    const j = await liveGet(`${LIVE_BASE}/games/current/?appTypeId=5&langId=1&sports=5&startDate=${dmy(from)}&endDate=${dmy(to)}`);
    const games = (j.games || []).filter(g => g.homeCompetitor && g.awayCompetitor);
    if (!games.length) throw new Error('empty');

    const ids = [...new Set(games.map(g => g.competitionId).filter(Boolean))];
    let names = {};
    try {
      const cj = await liveGet(`${LIVE_BASE}/competitions/?appTypeId=5&langId=1&competitions=${ids.join(',')}`);
      (cj.competitions || []).forEach(x => { names[x.id] = x.name; });
    } catch (e) { }

    const byComp = new Map();
    games.forEach(g => {
      const h = g.homeCompetitor, a = g.awayCompetitor;
      const hs = liveScore(h.score), as = liveScore(a.score);
      const status = liveStatus(g);
      const done = liveStatusDone(status);
      const live = status === 'IN_PLAY';
      const scored = (done || live) && hs != null && as != null;
      const item = {
        id: g.id, date: g.startTime, comp: g.competitionId, status,
        live, done,
        h: h.name, a: a.name,
        hs: scored ? hs : null,
        as: scored ? as : null
      };
      if (!byComp.has(g.competitionId)) byComp.set(g.competitionId, []);
      byComp.get(g.competitionId).push(item);
    });

    const comps = [...byComp.entries()].map(([id, list]) => ({
      id, name: names[id] || ('بطولة ' + id),
      games: list.sort((x, y) => new Date(x.date) - new Date(y.date))
    })).sort((a, b) => b.games.length - a.games.length);

    const out = { t: Date.now(), comps };
    store.set(key, out);
    return out;
  } catch (e) {
    return c ? c : null;
  }
}

/* ---------- معلومات البطولة (أبطال/أكثر فريق فاز/هداف تاريخي) ---------- */
let INFO_PACK = null;
async function leagueInfo(code) {
  if (!INFO_PACK) {
    const k = 'snaces_info_v3';
    const c = store.get(k, null);
    if (c && c.d && Date.now() - c.t < 7 * 864e5) INFO_PACK = c.d;
    else {
      const j = await getJSON('data/info.json');
      INFO_PACK = (j && j.leagues) || {};
      if (j) store.set(k, { t: Date.now(), d: INFO_PACK });
    }
  }
  return INFO_PACK[code] || null;
}

/* ---------- بطولات عالمية لرياضات تانية (365Scores) ---------- */
async function liveWorldSport(sportId) {
  const key = 'snaces_wsport_' + sportId;
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < 60 * 60e3) return c.d;
  try {
    const cj = await liveGet(`${LIVE_BASE}/competitions/?appTypeId=5&langId=1&sports=${sportId}`).catch(() => ({ competitions: [] }));
    /* 54 = البطولات الدولية/العالمية */
    const intl = (cj.competitions || [])
      .filter(x => x.countryId === 54 && String(x.sportId) === String(sportId))
      .sort((a, b) => (b.popularityRank || 0) - (a.popularityRank || 0))
      .slice(0, 8);
    if (!intl.length) throw new Error('empty');
    const from = new Date(Date.now() - 45 * 864e5);
    const to = new Date(Date.now() + 30 * 864e5);
    const packs = await Promise.all(intl.map(x =>
      liveGet(`${LIVE_BASE}/games/current/?appTypeId=5&langId=1&competitions=${x.id}&startDate=${dmy(from)}&endDate=${dmy(to)}&onlyMajor=0`)
        .then(j => ({ comp: x, games: (j.games || []).filter(g => g.homeCompetitor && g.awayCompetitor) }))
        .catch(() => ({ comp: x, games: [] }))
    ));
    packs.forEach(p => p.games.forEach(g => { g.__comp = p.comp; }));
    const games = packs.flatMap(p => p.games);
    if (!games.length) throw new Error('empty');
    const names = {};
    packs.forEach(p => { names[p.comp.id] = p.comp.name; });
    games.forEach(g => { if (!names[g.competitionId]) names[g.competitionId] = g.__comp ? g.__comp.name : ('بطولة ' + g.competitionId); });
    const byComp = new Map();
    games.forEach(g => {
      const h = g.homeCompetitor, a = g.awayCompetitor;
      const status = liveStatus(g);
      const done = liveStatusDone(status);
      const live = status === 'IN_PLAY';
      const hs = liveScore(h.score), as = liveScore(a.score);
      const scored = (done || live) && hs != null && as != null;
      const item = {
        id: g.id, date: g.startTime, status, live, done,
        h: h.name, a: a.name,
        hs: scored ? hs : null, as: scored ? as : null
      };
      if (!byComp.has(g.competitionId)) byComp.set(g.competitionId, []);
      byComp.get(g.competitionId).push(item);
    });
    const comps = [...byComp.entries()].map(([id, list]) => ({
      id, name: names[id] || ('بطولة ' + id),
      games: list.sort((x, y) => new Date(x.date) - new Date(y.date))
    })).sort((a, b) => b.games.length - a.games.length);
    const out = { t: Date.now(), comps };
    store.set(key, out);
    return out;
  } catch (e) {
    return c ? c : null;
  }
}

/* ---------- متصدرو البطولات (للرئيسية) ---------- */
/* بيشتغل في الخلفية بهدوء: طلب واحد لكل بطولة مع فاصل زمني */
async function refreshLeaders(force) {
  const c = store.get('snaces_leaders', null);
  if (!force && c && Date.now() - c.t < LIVE_LEADERS_TTL) return c;
  if (navigator.onLine === false) return c;

  const eu = [], ar = [];
  for (const code of Object.keys(LIVE_COMPS)) {
    if (['ARB', 'ARBCL', 'GULF', 'AFCON', 'ASIAN'].includes(code)) continue;
    if (typeof CUP_LEAGUE !== 'undefined' && CUP_LEAGUE[code]) continue; /* الكؤوس مش دوريات */
    if (typeof CONTINENTAL !== 'undefined' && CONTINENTAL.includes(code)) continue;
    if (typeof SUPERCUPS !== 'undefined' && SUPERCUPS.includes(code)) continue;
    try {
      const D = await leagueData(code);
      const t = D && D.standings && D.standings[0];
      if (t) {
        const item = { l: code, n: t.team.name, c: t.team.crest, pts: t.pts, p: t.p };
        (EU_CODES.includes(code) ? eu : ar).push(item);
      }
    } catch (e) { /* نتجاهل البطولة دي ونكمل */ }
    await new Promise(r => setTimeout(r, 350));
  }
  if (!eu.length && !ar.length) return c;
  const out = { t: Date.now(), eu, ar };
  store.set('snaces_leaders', out);
  return out;
}

/* متصدرو البطولات من الكاش لو لسه طازة */
function cachedLeaders() {
  const c = store.get('snaces_leaders', null);
  return c && Date.now() - c.t < LIVE_LEADERS_TTL ? c : null;
}

/* ---------- تفاصيل مباراة: تشكيلات + أحداث + إحصائيات ----------
   كاش المباشر 30 ثانية، وغير المباشر 5 دقايق. */
const LIVE_MATCH_P = new Map();
async function liveMatch(code, gameId, force) {
  if (!gameId) return null;
  const k = String(gameId);
  if (LIVE_MATCH_P.has(k)) return LIVE_MATCH_P.get(k);
  const p = liveMatchNow(code, gameId, force);
  LIVE_MATCH_P.set(k, p);
  try { return await p; }
  finally { if (LIVE_MATCH_P.get(k) === p) LIVE_MATCH_P.delete(k); }
}

async function liveMatchNow(code, gameId, force) {
  const key = 'snaces_match3_' + gameId;
  const c = store.get(key, null);
  const cachedLive = c && c.d && c.d.game && liveStatus(c.d.game) === 'IN_PLAY';
  const ttl = cachedLive ? 30e3 : LIVE_MATCH_TTL;
  if (!force && c && c.d && Date.now() - c.t < ttl) return c.d;
  try {
    const url = `${LIVE_BASE}/game/?appTypeId=5&langId=1&gameId=${gameId}&topBookmaker=14`;
    const j = await liveGet(url);
    const g = j && j.game;
    if (!g) throw new Error('no game');
    const statsRes = await liveGet(`${LIVE_BASE}/game/stats/?appTypeId=5&langId=1&games=${gameId}`).catch(() => null);
    const out = {
      game: g, stats: (statsRes && statsRes.statistics) || [],
      fetchedAt: Date.now(), lastUpdateId: (j && j.lastUpdateId) ?? g.lastUpdateId ?? null
    };
    store.set(key, { t: Date.now(), d: out });
    return out;
  } catch (e) {
    if (c && c.d) return Object.assign({}, c.d, { stale: true });
    return null;
  }
}

/* ---------- ملف لاعب ---------- */
async function livePlayer(athleteId) {
  if (!athleteId) return null;
  const key = 'snaces_player_' + athleteId;
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < TEAM_TTL) return c.d;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const j = await liveGet(`${LIVE_BASE}/athletes/?appTypeId=5&langId=1&athletes=${athleteId}&fullDetails=true`);
      const a = (j.athletes || [])[0];
      if (!a) throw new Error('no athlete');
      store.set(key, { t: Date.now(), d: a });
      return a;
    } catch (e) {
      if (attempt < 2) { await new Promise(r => setTimeout(r, 300 * (attempt + 1))); continue; }
      if (c && c.d) return c.d;
      return null;
    }
  }
  return null;
}
