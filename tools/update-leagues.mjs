// يسحب كل البطولات (أوروبية + عربية) من واجهة 365Scores العامة
// ويكتب data/<CODE>.json + data/home.json + data/meta.json + data/arab.json + data/home-arab.json
import { mkdir, writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const H = { "User-Agent": UA, Accept: "application/json" };
const BASE = "https://webws.365scores.com/web";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(url, tries = 4) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: H, signal: AbortSignal.timeout(20000) });
      /* احترام حدود المصدر: 429/5xx → استنى Retry-After أو تأخير متزايد */
      if (r.status === 429 || r.status >= 500) {
        const ra = Number(r.headers.get("retry-after") || 0);
        await sleep(Math.min(ra > 0 ? ra * 1000 : 1500 * 2 ** (i - 1), 30000));
        throw new Error("HTTP " + r.status);
      }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { err = e; await sleep(700 * i); }
  }
  throw err;
}

const COMPS = [
  /* أوروبا والعالم */
  { code: "PL", id: 7, group: "eu", nameAr: "الإنجليزي" },
  { code: "PD", id: 11, group: "eu", nameAr: "الإسباني" },
  { code: "SA", id: 17, group: "eu", nameAr: "الإيطالي" },
  { code: "BL1", id: 25, group: "eu", nameAr: "الألماني" },
  { code: "FL1", id: 35, group: "eu", nameAr: "الفرنسي" },
  { code: "CL", id: 572, group: "eu", nameAr: "دوري الأبطال" },
  { code: "ELC", id: 1, group: "eu", nameAr: "التشامبيونشيب" },
  { code: "DED", id: 57, group: "eu", nameAr: "الهولندي" },
  { code: "PPL", id: 73, group: "eu", nameAr: "البرتغالي" },
  { code: "BSA", id: 113, group: "eu", nameAr: "البرازيلي" },
  { code: "TSL", id: 78, group: "eu", nameAr: "التركي", flag: "🇹🇷" },
  /* البطولات المحلية (كؤوس) مرتبطة بدوري بلدها */
  { code: "FACUP", id: 8, group: "cup", cupOf: "PL", nameAr: "كأس إنجلترا" },
  { code: "EFLCP", id: 9, group: "cup", cupOf: "PL", nameAr: "كأس كاراباو" },
  { code: "CDR", id: 13, group: "cup", cupOf: "PD", nameAr: "كأس إسبانيا" },
  { code: "COPPA", id: 20, group: "cup", cupOf: "SA", nameAr: "كأس إيطاليا" },
  { code: "DFBP", id: 28, group: "cup", cupOf: "BL1", nameAr: "كأس ألمانيا" },
  { code: "CDFR", id: 37, group: "cup", cupOf: "FL1", nameAr: "كأس فرنسا" },
  { code: "TACAP", id: 75, group: "cup", cupOf: "PPL", nameAr: "كأس البرتغال" },
  { code: "CDB", id: 115, group: "cup", cupOf: "BSA", nameAr: "كأس البرازيل" },
  { code: "TKUP", id: 80, group: "cup", cupOf: "TSL", nameAr: "كأس تركيا" },
  { code: "EGYCUP", id: 553, group: "cup", cupOf: "EGY", nameAr: "كأس مصر", flag: "🇪🇬" },
  { code: "EGYLC", id: 7808, group: "cup", cupOf: "EGY", nameAr: "كأس الرابطة المصرية", flag: "🇪🇬" },
  { code: "KINGCUP", id: 5501, group: "cup", cupOf: "SAU", nameAr: "كأس الملك", flag: "🇸🇦" },
  { code: "TRONE", id: 5420, group: "cup", cupOf: "MAR", nameAr: "كأس العرش", flag: "🇲🇦" },
  { code: "TUNCUP", id: 5558, group: "cup", cupOf: "TUN", nameAr: "كأس تونس", flag: "🇹🇳" },
  { code: "UAEPRES", id: 6346, group: "cup", cupOf: "UAE", nameAr: "كأس رئيس الإمارات", flag: "🇦🇪" },
  { code: "UAELC", id: 6181, group: "cup", cupOf: "UAE", nameAr: "كأس رابطة الإمارات", flag: "🇦🇪" },
  /* الدوريات العربية */
  { code: "EGY", id: 552, group: "ar", nameAr: "الدوري المصري", flag: "🇪🇬" },
  { code: "SAU", id: 649, group: "ar", nameAr: "الدوري السعودي", flag: "🇸🇦" },
  { code: "MAR", id: 557, group: "ar", nameAr: "الدوري المغربي", flag: "🇲🇦" },
  { code: "TUN", id: 554, group: "ar", nameAr: "الدوري التونسي", flag: "🇹🇳" },
  { code: "ALG", id: 560, group: "ar", nameAr: "الدوري الجزائري", flag: "🇩🇿" },
  { code: "UAE", id: 549, group: "ar", nameAr: "الدوري الإماراتي", flag: "🇦🇪" },
  { code: "QAT", id: 408, group: "ar", nameAr: "الدوري القطري", flag: "🇶🇦" },
  { code: "IRQ", id: 6822, group: "ar", nameAr: "الدوري العراقي", flag: "🇮🇶" },
  { code: "JOR", id: 565, group: "ar", nameAr: "الدوري الأردني", flag: "🇯🇴" },
  /* بطولات عربية وقارية */
  { code: "ARB", id: 7674, group: "ar", nameAr: "كأس العرب", flag: "🏆" },
  { code: "ARBCL", id: 6840, group: "ar", nameAr: "دوري أبطال العرب", flag: "🏆" },
  { code: "GULF", id: 5452, group: "ar", nameAr: "كأس الخليج", flag: "🏆" },
  { code: "AFCON", id: 167, group: "ar", nameAr: "كأس الأمم الأفريقية", flag: "🌍" },
  { code: "ASIAN", id: 6196, group: "ar", nameAr: "كأس آسيا", flag: "🌏" },
  /* Americas */
  { code: "MLS", id: 104, group: "am", nameAr: "MLS", flag: "🇺🇸" },
  { code: "LMX", id: 141, group: "am", nameAr: "Liga MX", flag: "🇲🇽" },
  { code: "ARG", id: 72, group: "am", nameAr: "Liga Profesional", flag: "🇦🇷" },
  { code: "COL", id: 620, group: "am", nameAr: "Liga BetPlay", flag: "🇨🇴" },
  { code: "USLC", id: 5663, group: "am", nameAr: "USL Championship", flag: "🇺🇸" },
  { code: "COPAARG", id: 640, group: "cup", cupOf: "ARG", nameAr: "كأس الأرجنتين", flag: "🇦🇷" },
  { code: "COPACOL", id: 616, group: "cup", cupOf: "COL", nameAr: "كأس كولومبيا", flag: "🇨🇴" }
];

const crest = id => id ? `https://imagecache.365scores.com/image/upload/f_png,w_40,h_40,c_limit,q_auto:eco/v1/Competitors/${id}` : null;

function mapStatus(g) {
  const t = String(g.statusText || "");
  if (/ended|final|ft/i.test(t)) return "FINISHED";
  if (/scheduled|not started|postponed/i.test(t)) return "TIMED";
  if (/live|half|1st|2nd|in progress/i.test(t)) return "IN_PLAY";
  return "TIMED";
}

await mkdir("data", { recursive: true });

const packs = {};
for (const c of COMPS) {
  try {
    const st = await getJSON(`${BASE}/standings/?appTypeId=5&langId=1&competitions=${c.id}`);
    const past = await getJSON(`${BASE}/games/results/?appTypeId=5&langId=1&competitions=${c.id}&showOdds=false`);
    const now = await getJSON(`${BASE}/games/current/?appTypeId=5&langId=1&competitions=${c.id}`);

    /* ---------- الجدول ---------- */
    const standings = [];
    const groups = st.standings || [];
    for (const s of groups) {
      const rows = (s.rows || []).filter(r => {
        const n = String((r.competitor || {}).name || "");
        return !/^(winner|loser|tbd|to be|1st|2nd)\b/i.test(n);
      });
      rows.forEach((r, i) => {
        const t = r.competitor || {};
        /* البطولات المجمّعة: المجموعة بتيجي جوه الصف نفسه */
        const gn = r.groupNum && r.groupNum > 0 ? r.groupNum : 0;
        const group = gn ? "المجموعة " + gn : (groups.length > 1 ? (s.displayName || null) : null);
        standings.push({
          pos: r.position || r.rank || i + 1,
          group,
          gn,
          team: { id: t.id, name: t.name, crest: crest(t.id) },
          p: r.gamePlayed ?? 0,
          w: r.gamesWon ?? 0,
          d: r.gamesEven ?? 0,
          l: r.gamesLost ?? 0,
          gf: r.for ?? 0,
          ga: r.against ?? 0,
          gd: r.ratio ?? ((r.for ?? 0) - (r.against ?? 0)),
          pts: r.points ?? 0,
          /* خصم النقاط: المصدر مش دايماً بيعلّمه، فبنحسبه */
          ded: (r.points ?? 0) < 3 * (r.gamesWon ?? 0) + (r.gamesEven ?? 0)
        });
      });
    }
    /* بنحافظ على ترتيب المصدر، بس الأدوار التأهيلية (بدون مجموعة) تيجي في الآخر */
    standings.sort((a, b) => (a.gn ? 0 : 1) - (b.gn ? 0 : 1));

    /* ---------- المباريات ---------- */
    const seen = new Set();
    const all = [...(now.games || []), ...(past.games || [])].filter(g => {
      if (!g || seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });
    const mapped = all.map(g => {
      const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
      const status = mapStatus(g);
      const hs = Number(h.score), as = Number(a.score);
      const fin = status === "FINISHED" && hs >= 0 && as >= 0;
      return {
        id: g.id,
        date: g.startTime,
        status,
        md: g.roundNum || null,
        home: { id: h.id, name: h.name, crest: crest(h.id) },
        away: { id: a.id, name: a.name, crest: crest(a.id) },
        hg: fin ? hs : null,
        ag: fin ? as : null
      };
    }).filter(m => m.home.id && m.away.id)
      /* نستبعد مباريات الأقواس اللي أطرافها لسه مش معروفين */
      .filter(m => !/^(winner|loser|tbd|to be)\b/i.test(m.home.name) && !/^(winner|loser|tbd|to be)\b/i.test(m.away.name));

    const nowMs = Date.now() - 6 * 3600e3;
    const upcoming = mapped.filter(m => m.status !== "FINISHED" && new Date(m.date).getTime() > nowMs)
      .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 30);
    const finished = mapped.filter(m => m.status === "FINISHED")
      .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40);

    const name = (groups[0] && groups[0].displayName) || c.nameAr;
    const data = { code: c.code, name, nameAr: c.nameAr, standings, matches: [...upcoming, ...finished], scorers: [] };
    await writeFile(`data/${c.code}.json`, JSON.stringify(data));
    packs[c.code] = data;

    const top = standings[0];
    c.top = top ? { n: top.team.name, c: top.team.crest, pts: top.pts, p: top.p } : null;
    c.teams = standings.length;
    c.upcoming = upcoming;
    console.log("ok", c.code.padEnd(5), name.slice(0, 26).padEnd(26), "| جدول", String(standings.length).padStart(2), "| قادمة", String(upcoming.length).padStart(2), "| منتهية", finished.length);
  } catch (e) {
    console.warn("skip", c.code, e.message);
  }
  await sleep(300);
}

const ok = COMPS.filter(c => packs[c.code]);
if (!ok.length) throw new Error("مفيش أي بيانات اتجابت — مش هنكتب فوق الملفات القديمة");

const updated = new Date().toISOString();

/* ---------- الرئيسية: متصدرو أوروبا + أقرب مباريات ---------- */
const eu = ok.filter(c => c.group === "eu" && c.top);
const next = ok.filter(c => c.group === "eu")
  .flatMap(c => (c.upcoming || []).map(m => ({ l: c.code, id: m.id, h: m.home.name, a: m.away.name, hc: m.home.crest, ac: m.away.crest, d: m.date })))
  .sort((a, b) => new Date(a.d) - new Date(b.d)).slice(0, 6);

await writeFile("data/home.json", JSON.stringify({
  updated,
  leaders: eu.map(c => ({ l: c.code, n: c.top.n, c: c.top.c, pts: c.top.pts, p: c.top.p })),
  next
}));

/* ---------- فهرس العربي ---------- */
const ar = ok.filter(c => c.group === "ar");
await writeFile("data/arab.json", JSON.stringify({
  updated,
  leagues: ar.map(c => ({ code: c.code, name: packs[c.code].name, nameAr: c.nameAr, flag: c.flag, teams: c.teams, top: c.top }))
}));

await writeFile("data/home-arab.json", JSON.stringify({
  updated,
  leaders: ar.filter(c => c.top && ["EGY", "SAU", "MAR", "TUN", "ALG", "UAE", "QAT", "IRQ", "JOR"].includes(c.code))
    .map(c => ({ l: c.code, n: c.top.n, c: c.top.c, pts: c.top.pts, p: c.top.p }))
}));

await writeFile("data/meta.json", JSON.stringify({ updated }));

console.log("done:", ok.map(c => c.code).join(", "));
