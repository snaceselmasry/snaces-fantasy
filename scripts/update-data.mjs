// يجلب بيانات الدوريات الخمسة الكبرى + دوري أبطال أوروبا من football-data.org، والدوري الأوروبي والمؤتمرات والسوبر من ESPN ويحفظها في data/*.json
// التوكن بييجي من GitHub Secret: FOOTBALL_DATA_KEY
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const KEY = process.env.FOOTBALL_DATA_KEY;
const FD = process.env.FOOTBALL_BASE || "https://api.football-data.org/v4/";
const GAP = Number(process.env.GAP_MS ?? 7000); // الحد المجاني: 10 طلبات/دقيقة
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LEAGUES = ["PL", "PD", "SA", "BL1", "FL1", "CL"];

async function getJSON(url, headers = {}, tries = 4) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "application/json", ...headers } });
      if (r.status === 429) { await sleep(Math.min(GAP * 5, 65000)); throw new Error("HTTP 429"); }
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return await r.json();
    } catch (e) { err = e; await sleep(1500 * i); }
  }
  throw err;
}
const fd = p => getJSON(FD + p, { "X-Auth-Token": KEY });
const tm = t => ({ id: t.id, name: t.shortName || t.name, crest: t.crest || null });

if (!KEY) throw new Error("FOOTBALL_DATA_KEY مش موجود في الـ Secrets");
const out = {};

for (const code of LEAGUES) {
  try {
    const st = await fd(`competitions/${code}/standings`); await sleep(GAP);
    const mt = await fd(`competitions/${code}/matches`); await sleep(GAP);
    const sc = await fd(`competitions/${code}/scorers?limit=40`); await sleep(GAP);
    // الدوريات: جدول واحد. البطولات: ممكن مجموعات (كل صف بياخد اسم المجموعة)
    const tabs = (st.standings || []).filter(s => s.type === "TOTAL");
    out[code] = {
      code, name: st.competition?.name || code,
      standings: tabs.flatMap(s => (s.table || []).map(r => ({ pos: r.position, group: s.group || null, team: tm(r.team), p: r.playedGames, w: r.won, d: r.draw, l: r.lost, gf: r.goalsFor, ga: r.goalsAgainst, gd: r.goalDifference, pts: r.points }))),
      matches: (mt.matches || []).map(m => ({ id: m.id, date: m.utcDate, status: m.status, md: m.matchday, ...(m.stage && m.stage !== "REGULAR_SEASON" ? { stage: m.stage } : {}), ...(m.group ? { group: m.group } : {}), home: tm(m.homeTeam), away: tm(m.awayTeam), hg: m.score?.fullTime?.home ?? null, ag: m.score?.fullTime?.away ?? null })),
      scorers: (sc.scorers || []).map(s => ({ name: s.player?.name, team: s.team?.shortName || s.team?.name, played: s.playedMatches, goals: s.goals ?? 0, assists: s.assists ?? null })),
    };
    console.log("ok", code);
  } catch (e) { console.warn("skip", code, e.message); }
}

// ===== بطولات من ESPN (واجهة غير رسمية، ممكن تتغير): الدوري الأوروبي، المؤتمرات، السوبر =====
const ESPN = process.env.ESPN_BASE || "https://site.api.espn.com/apis/";
const ESPN_COMPS = { EL: ["uefa.europa", "UEFA Europa League"], ECL: ["uefa.europa.conf", "UEFA Conference League"], USC: ["uefa.super_cup", "UEFA Super Cup"] };
const NOW = new Date(), SY = NOW.getMonth() >= 6 ? NOW.getFullYear() : NOW.getFullYear() - 1;
const et = t => ({ id: Number(t.id), name: t.shortDisplayName || t.displayName || t.name, crest: t.logos?.[0]?.href || t.logo || null });
const stageOf = s => { s = (s || "").toLowerCase(); return s.includes("league") ? "LEAGUE_STAGE" : s.includes("playoff") ? "PLAYOFFS" : s.includes("16") ? "LAST_16" : s.includes("quarter") ? "QUARTER_FINALS" : s.includes("semi") ? "SEMI_FINALS" : s.includes("third") ? "THIRD_PLACE" : s.includes("final") ? "FINAL" : s.includes("group") ? "GROUP_STAGE" : undefined; };
const score = x => { const v = x.score?.displayValue ?? x.score; return v === undefined || v === "" || v === null ? null : Number(v); };

for (const [code, [slug, name]] of Object.entries(ESPN_COMPS)) {
  try {
    let standings = [];
    try {
      const st = await getJSON(`${ESPN}v2/sports/soccer/${slug}/standings`);
      const kids = st.children || [];
      standings = kids.flatMap(c => (c.standings?.entries || []).map((e, i) => {
        const g = n => e.stats?.find(s => s.name === n)?.value ?? 0, gm = /group\s+(\w+)/i.exec(c.name || "");
        return { pos: g("rank") || i + 1, group: kids.length > 1 && gm ? "GROUP_" + gm[1].toUpperCase() : null, team: et(e.team), p: g("gamesPlayed"), w: g("wins"), d: g("ties"), l: g("losses"), gf: g("pointsFor"), ga: g("pointsAgainst"), gd: g("pointDifferential"), pts: g("points") };
      }));
    } catch (e) { console.warn("no standings", code, e.message); }
    await sleep(600);
    // المباريات: شهر بشهر (ESPN بيرفض طلب الموسم كله). لو طلب فشل بنجرب نسخة تانية منه وبنكمل.
    const evs = new Map();
    for (let k = 0; k < 12; k++) {
      const d = new Date(Date.UTC(SY, 6 + k, 1)), y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, last = new Date(Date.UTC(y, m, 0)).getUTCDate(), p = n => String(n).padStart(2, "0");
      const range = `${y}${p(m)}01-${y}${p(m)}${p(last)}`;
      for (const extra of ["&limit=300", ""]) {
        try { const sb = await getJSON(`${ESPN}site/v2/sports/soccer/${slug}/scoreboard?dates=${range}${extra}`, {}, 1); (sb.events || []).forEach(e => evs.set(e.id, e)); break; }
        catch (e) { if (extra === "") console.warn("month fail", code, range, e.message); }
      }
      await sleep(400);
    }
    const matches = [...evs.values()].map(ev => {
      const c = ev.competitions?.[0] || {}, h = c.competitors?.find(x => x.homeAway === "home"), a = c.competitors?.find(x => x.homeAway === "away");
      if (!h || !a) return null;
      const ty = (ev.status || c.status)?.type || {}, done = ty.state === "post" || ty.completed === true, sn = ty.name || "";
      const status = /POSTPONED/.test(sn) ? "POSTPONED" : /CANCEL/.test(sn) ? "CANCELLED" : done ? "FINISHED" : ty.state === "in" ? "IN_PLAY" : "SCHEDULED";
      return { id: Number(ev.id), date: ev.date, status, md: null, stage: stageOf(ev.season?.slug), home: et(h.team), away: et(a.team), hg: done ? score(h) : null, ag: done ? score(a) : null };
    }).filter(Boolean);
    if (!standings.length && !matches.length) throw new Error("مفيش بيانات");
    out[code] = { code, name, standings, matches, scorers: [], source: "espn" };
    console.log("ok", code, "(ESPN)", standings.length, "teams,", matches.length, "matches");
  } catch (e) { console.warn("skip", code, e.message); }
  await sleep(600);
}

if (!Object.keys(out).length) throw new Error("مفيش أي دوري اتجلب، مش هنكتب فوق الملفات القديمة");
await mkdir("data", { recursive: true });
const parts = [];
for (const [code, d] of Object.entries(out)) { const s = JSON.stringify(d); parts.push(s); await writeFile(`data/${code}.json`, s); }
const hash = createHash("sha256").update(parts.join("|")).digest("hex");
let old = {}; try { old = JSON.parse(await readFile("data/meta.json", "utf8")); } catch {}
if (old.hash !== hash) await writeFile("data/meta.json", JSON.stringify({ updated: new Date().toISOString(), hash }));
console.log("done:", Object.keys(out).join(", "));
