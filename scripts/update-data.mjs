import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const KEY = process.env.FOOTBALL_DATA_KEY;
const FD = process.env.FOOTBALL_BASE || "https://api.football-data.org/v4/";
const TSDB = process.env.TSDB_BASE || "https://www.thesportsdb.com/api/v1/json/123/";
const GAP = Number(process.env.GAP_MS ?? 7000); // الحد المجاني: 10 طلبات/دقيقة
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FD_LEAGUES = ["PL", "PD", "SA", "BL1", "FL1"];

async function getJSON(url, headers = {}, tries = 4) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "snaces-football-bot", ...headers } });
      if (r.status === 429) { await sleep(Math.min(GAP * 5, 65000)); throw new Error("HTTP 429"); }
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return await r.json();
    } catch (e) { err = e; await sleep(1500 * i); }
  }
  throw err;
}
const fd = p => getJSON(FD + p, { "X-Auth-Token": KEY });
const tm = t => ({ id: t.id, name: t.shortName || t.name, crest: t.crest || null });

function computeTable(matches) {
  const T = {};
  const row = t => (T[t.id] ??= { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  for (const m of matches) {
    if (m.status !== "FINISHED" || m.hg == null || m.ag == null) continue;
    const h = row(m.home), a = row(m.away);
    h.p++; a.p++; h.gf += m.hg; h.ga += m.ag; a.gf += m.ag; a.ga += m.hg;
    if (m.hg > m.ag) { h.w++; a.l++; h.pts += 3; } else if (m.hg < m.ag) { a.w++; h.l++; a.pts += 3; } else { h.d++; a.d++; h.pts++; a.pts++; }
  }
  return Object.values(T).map(r => ({ ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf).map((r, i) => ({ pos: i + 1, ...r }));
}

const out = {};
if (!KEY) throw new Error("FOOTBALL_DATA_KEY مش موجود في الـ Secrets");

for (const code of FD_LEAGUES) {
  try {
    const st = await fd(`competitions/${code}/standings`); await sleep(GAP);
    const mt = await fd(`competitions/${code}/matches`); await sleep(GAP);
    const sc = await fd(`competitions/${code}/scorers?limit=40`); await sleep(GAP);
    const total = (st.standings || []).find(s => s.type === "TOTAL") || st.standings?.[0];
    out[code] = {
      code, name: st.competition?.name || code,
      standings: (total?.table || []).map(r => ({ pos: r.position, team: tm(r.team), p: r.playedGames, w: r.won, d: r.draw, l: r.lost, gf: r.goalsFor, ga: r.goalsAgainst, gd: r.goalDifference, pts: r.points })),
      matches: (mt.matches || []).map(m => ({ id: m.id, date: m.utcDate, status: m.status, md: m.matchday, home: tm(m.homeTeam), away: tm(m.awayTeam), hg: m.score?.fullTime?.home ?? null, ag: m.score?.fullTime?.away ?? null })),
      scorers: (sc.scorers || []).map(s => ({ name: s.player?.name, team: s.team?.shortName || s.team?.name, played: s.playedMatches, goals: s.goals ?? 0, assists: s.assists ?? null })),
    };
  } catch (e) { console.warn("skip", code, e.message); }
}

// الدوري المصري من TheSportsDB (id 4829). الجدول بيتحسب من النتايج، ومفيش هدافين على المصدر المجاني.
try {
  const y = new Date().getFullYear(), season = new Date().getMonth() >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  const ev = (await getJSON(`${TSDB}eventsseason.php?id=4829&s=${season}`)).events;
  if (!ev?.length) throw new Error("مفيش أحداث للدوري المصري");
  const t = (id, name, badge) => ({ id: Number(id), name, crest: badge || null });
  const matches = ev.map(e => {
    const done = e.intHomeScore != null && e.intAwayScore != null && e.intHomeScore !== "";
    return { id: Number(e.idEvent), date: e.strTimestamp ? e.strTimestamp + "Z" : `${e.dateEvent}T${e.strTime || "00:00:00"}Z`,
      status: done ? "FINISHED" : "SCHEDULED", md: Number(e.intRound) || null,
      home: t(e.idHomeTeam, e.strHomeTeam, e.strHomeTeamBadge), away: t(e.idAwayTeam, e.strAwayTeam, e.strAwayTeamBadge),
      hg: done ? Number(e.intHomeScore) : null, ag: done ? Number(e.intAwayScore) : null };
  });
  out.EGY = { code: "EGY", name: "Egyptian Premier League", standings: computeTable(matches), matches, scorers: [], partial: true, truncated: ev.length >= 100 };
} catch (e) { console.warn("skip EGY", e.message); }

if (!Object.keys(out).length) throw new Error("مفيش أي دوري اتجلب، مش هنكتب فوق الملفات القديمة");
await mkdir("data", { recursive: true });
const parts = [];
for (const [code, d] of Object.entries(out)) { const s = JSON.stringify(d); parts.push(s); await writeFile(`data/${code}.json`, s); }
const hash = createHash("sha256").update(parts.join("|")).digest("hex");
let old = {}; try { old = JSON.parse(await readFile("data/meta.json", "utf8")); } catch {}
if (old.hash !== hash) await writeFile("data/meta.json", JSON.stringify({ updated: new Date().toISOString(), hash }));
console.log("done:", Object.keys(out).join(", "));
