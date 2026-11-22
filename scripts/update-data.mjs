// يجلب بيانات الدوريات الخمسة الكبرى + دوري الأبطال وكأس العالم من football-data.org ويحفظها في data/*.json
// التوكن بييجي من GitHub Secret: FOOTBALL_DATA_KEY
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const KEY = process.env.FOOTBALL_DATA_KEY;
const FD = process.env.FOOTBALL_BASE || "https://api.football-data.org/v4/";
const GAP = Number(process.env.GAP_MS ?? 7000); // الحد المجاني: 10 طلبات/دقيقة
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LEAGUES = ["PL", "PD", "SA", "BL1", "FL1", "CL", "WC"];

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

if (!Object.keys(out).length) throw new Error("مفيش أي دوري اتجلب، مش هنكتب فوق الملفات القديمة");
await mkdir("data", { recursive: true });
const parts = [];
for (const [code, d] of Object.entries(out)) { const s = JSON.stringify(d); parts.push(s); await writeFile(`data/${code}.json`, s); }
const hash = createHash("sha256").update(parts.join("|")).digest("hex");
let old = {}; try { old = JSON.parse(await readFile("data/meta.json", "utf8")); } catch {}
if (old.hash !== hash) await writeFile("data/meta.json", JSON.stringify({ updated: new Date().toISOString(), hash }));
console.log("done:", Object.keys(out).join(", "));
