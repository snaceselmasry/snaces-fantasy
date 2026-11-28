// يجلب رياضات إضافية (سلة / أمريكي / هوكي / فورمولا 1) من واجهات ESPN العامة
// ويحفظها في data/sports.json — من غير أي مفاتيح API
import { mkdir, writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const H = { "User-Agent": UA, Accept: "application/json" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: H });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { err = e; await sleep(800 * i); }
  }
  throw err;
}

const SPORTS = [
  { id: "nba", path: "basketball/nba", name: "NBA", nameAr: "دوري السلة الأمريكي", icon: "🏀", standings: true },
  { id: "nfl", path: "football/nfl", name: "NFL", nameAr: "الدوري الأمريكي لكرة القدم الأمريكية", icon: "🏈" },
  { id: "nhl", path: "hockey/nhl", name: "NHL", nameAr: "دوري الهوكي الأمريكي", icon: "🏒" },
];

const out = { updated: new Date().toISOString(), sports: [] };

function gameOf(e) {
  const c = (e.competitions || [])[0] || {};
  const comp = c.competitors || [];
  const home = comp.find(x => x.homeAway === "home") || comp[0] || {};
  const away = comp.find(x => x.homeAway === "away") || comp[1] || {};
  const st = (e.status || {}).type || {};
  return {
    id: e.id,
    date: e.date,
    state: st.state || "pre",           // pre | in | post
    detail: st.shortDetail || st.detail || "",
    home: (home.team || {}).displayName || (home.team || {}).name || "",
    away: (away.team || {}).displayName || (away.team || {}).name || "",
    hs: home.score != null ? String(home.score) : "",
    as: away.score != null ? String(away.score) : "",
    venue: (c.venue || {}).fullName || ""
  };
}

for (const s of SPORTS) {
  try {
    const sb = await getJSON(`https://site.api.espn.com/apis/site/v2/sports/${s.path}/scoreboard`);
    const games = (sb.events || []).map(gameOf).slice(0, 12);
    const item = { id: s.id, name: s.name, nameAr: s.nameAr, icon: s.icon, games };

    if (s.standings) {
      try {
        const st = await getJSON(`https://site.web.api.espn.com/apis/v2/sports/${s.path}/standings`);
        item.standings = (st.children || []).map(conf => ({
          group: conf.name || "",
          rows: ((conf.standings || {}).entries || []).slice(0, 15).map(en => {
            const get = n => {
              const f = (en.stats || []).find(x => x.name === n);
              return f ? f.value : null;
            };
            const pct = get("winPercent") ?? get("leagueWinPercent");
            return {
              team: (en.team || {}).displayName || "",
              w: get("wins"),
              l: get("losses"),
              pct: pct != null ? Number(pct).toFixed(3).replace(/^0/, "") : ""
            };
          })
        }));
      } catch (e) { console.warn("skip standings", s.id, e.message); }
    }
    out.sports.push(item);
    console.log("ok", s.id, games.length, "games");
  } catch (e) {
    console.warn("skip", s.id, e.message);
  }
  await sleep(400);
}

// فورمولا 1: جدول السباقات (مفيش نتائج تفصيلية في نفس الواجهة)
try {
  const f1 = await getJSON("https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard");
  const races = (f1.events || []).map(e => {
    const st = (e.status || {}).type || {};
    const c = (e.competitions || [])[0] || {};
    return {
      name: e.name,
      date: e.date,
      state: st.state || "pre",
      detail: st.shortDetail || st.detail || "",
      venue: (c.venue || {}).fullName || ""
    };
  }).slice(0, 10);
  out.sports.push({ id: "f1", name: "Formula 1", nameAr: "فورمولا 1", icon: "🏎️", races });
  console.log("ok f1", races.length, "races");
} catch (e) {
  console.warn("skip f1", e.message);
}

if (!out.sports.length) throw new Error("مفيش أي رياضة اتجابت — مش هنكتب فوق الملف القديم");

await mkdir("data", { recursive: true });
await writeFile("data/sports.json", JSON.stringify(out));
console.log("done:", out.sports.map(s => s.id).join(", "));
