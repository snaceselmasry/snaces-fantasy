// يجلب بيانات الدوريات + دوري الأبطال + الفانتازي + أخبار الانتقالات ويحفظها في data/*.json
// التوكن بييجي من GitHub Secret: FOOTBALL_DATA_KEY
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const KEY = process.env.FOOTBALL_DATA_KEY;
const FD = process.env.FOOTBALL_BASE || "https://api.football-data.org/v4/";
const GAP = Number(process.env.GAP_MS ?? 7000); // الحد المجاني: 10 طلبات/دقيقة
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LEAGUES = ["PL", "PD", "SA", "BL1", "FL1", "CL", "ELC", "DED", "PPL", "BSA"];

async function getJSON(url, headers = {}, tries = 4) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", ...headers } });
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
const failures = [];

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
  } catch (e) { console.warn("skip", code, e.message); failures.push({ code, error: e.message }); }
}

// ===== فانتازي البريميرليج (واجهة FPL الرسمية) -> data/fpl.json =====
try {
  const FPL = process.env.FPL_BASE || "https://fantasy.premierleague.com/api/";
  const pk = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k]]));
  const b = await getJSON(FPL + "bootstrap-static/"); await sleep(1000);
  const fx = await getJSON(FPL + "fixtures/");
  if (!b.elements?.length || !b.teams?.length) throw new Error("bootstrap ناقص");
  out.fpl = {
    total_players: b.total_players,
    elements: b.elements.map(p => pk(p, ["id", "web_name", "first_name", "second_name", "team", "element_type", "now_cost", "total_points", "form", "selected_by_percent", "minutes", "expected_goals", "status"])),
    teams: b.teams.map(t => pk(t, ["id", "name", "short_name"])),
    events: b.events.map(e => pk(e, ["id", "is_current", "is_next", "finished", "deadline_time"])),
    fixtures: fx.map(f => pk(f, ["event", "team_h", "team_a", "team_h_difficulty", "team_a_difficulty"])),
  };
  console.log("ok FPL", out.fpl.elements.length, "players,", out.fpl.fixtures.length, "fixtures");
} catch (e) { console.warn("skip FPL", e.message); }

// ===== ملخص الرئيسية + بيانات ألعاب التحديات -> data/home.json =====
try {
  const now = Date.now(), nxt = [], leaders = [], seen = new Set(), teams = [];
  for (const code of ["PL", "PD", "SA", "BL1", "FL1", "CL"]) {
    const d = out[code]; if (!d) continue;
    d.matches.filter(m => ["SCHEDULED", "TIMED"].includes(m.status) && m.home?.id && m.away?.id && Date.parse(m.date) > now)
      .sort((x, y) => Date.parse(x.date) - Date.parse(y.date)).slice(0, 3)
      .forEach(m => nxt.push({ l: code, id: m.id, d: m.date, h: m.home.name, hc: m.home.crest, a: m.away.name, ac: m.away.crest }));
    if (code === "CL") continue;
    const t = d.standings.find(r => r.pos === 1); if (t) leaders.push({ l: code, n: t.team.name, c: t.team.crest, pts: t.pts, p: t.p });
    d.standings.forEach(r => { const k = code + r.team.id; if (r.team.crest && !seen.has(k)) { seen.add(k); teams.push({ n: r.team.name, c: r.team.crest, l: code, r: r.pos }); } });
  }
  nxt.sort((x, y) => Date.parse(x.d) - Date.parse(y.d));
  out.home = { next: nxt.slice(0, 10), leaders, teams };
  console.log("ok home", out.home.next.length, "next,", teams.length, "teams");
} catch (e) { console.warn("skip home", e.message); }

// ===== أخبار الانتقالات تلقائيًا من RSS (عنوان + رابط + مصدر بس) -> data/transfers-news.json =====
try {
  const FEEDS = process.env.FEEDS_JSON ? JSON.parse(process.env.FEEDS_JSON) : [["Sky Sports", "https://www.skysports.com/rss/11095"], ["BBC Sport", "https://feeds.bbci.co.uk/sport/football/rss.xml"], ["The Guardian", "https://www.theguardian.com/football/rss"]];
  const dec = x => x.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();
  const tag = (x, t) => { const m = new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i").exec(x); return m ? dec(m[1]) : ""; };
  const KEEP = /transfer|\bsign(s|ed|ing)?\b|loan|\bbid\b|\bfee\b|medical|linked|target|swap|release clause|\btalks\b|gossip|rumou?r|joins?\b|\bdeal\b|contract|\boffer\b|window/i;
  const RUMOR = /rumou?r|gossip|linked|target|interest|\bbid\b|talks|\beyes?\b|monitor|\bwant|could|set to|poised|plan|consider|keen|\bmay\b|\bmight\b/i;
  const OFFICIAL = /confirm|complete|announce|unveil|officially|\bsigns?\b|signed|joins?\b|agree/i;
  const items = [], seenT = new Set();
  for (const [src, url] of FEEDS) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml, */*" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const xml = await r.text();
      for (const m of xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)) {
        const t = tag(m[1], "title"), u = tag(m[1], "link"), dd = Date.parse(tag(m[1], "pubDate"));
        if (!t || !/^https?:/.test(u) || !KEEP.test(t)) continue;
        const k = t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60); if (seenT.has(k)) continue; seenT.add(k);
        items.push({ t, u, s: src, d: Number.isFinite(dd) ? new Date(dd).toISOString() : null, k: RUMOR.test(t) ? "rumor" : OFFICIAL.test(t) ? "official" : "news" });
      }
      console.log("ok feed", src);
    } catch (e) { console.warn("skip feed", src, e.message); }
    await sleep(500);
  }
  items.sort((x, y) => Date.parse(y.d || 0) - Date.parse(x.d || 0));
  // ترجمة آلية للعربي. بنحفظ الترجمات القديمة عشان نترجم الجديد بس (حد أقصى 30 في التشغيلة).
  const GT = process.env.GT_BASE || "https://translate.googleapis.com/translate_a/single";
  const MM = process.env.MM_BASE || "https://api.mymemory.translated.net/get";
  const translate = async text => {
    try {
      const r = await fetch(`${GT}?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`, { headers: { "User-Agent": UA } });
      if (r.ok) { const j = await r.json(); const t = (j[0] || []).map(x => x[0]).join("").trim(); if (t) return t; }
    } catch {}
    try {
      const r = await fetch(`${MM}?langpair=en|ar&q=${encodeURIComponent(text)}`);
      if (r.ok) { const t = ((await r.json()).responseData?.translatedText || "").trim(); if (t && !/MYMEMORY WARNING|QUERY LENGTH|INVALID/i.test(t)) return t; }
    } catch {}
    return null;
  };
  const prev = {}; try { for (const i of JSON.parse(await readFile("data/transfers-news.json", "utf8")).items || []) if (i.ar) prev[i.u] = i.ar; } catch {}
  let tn = 0, tfail = 0;
  for (const it of items.slice(0, 40)) {
    if (prev[it.u]) { it.ar = prev[it.u]; continue; }
    if (tn >= 30) break;
    const t = await translate(it.t); tn++;
    if (t && t !== it.t) it.ar = t; else tfail++;
    await sleep(300);
  }
  console.log("translated", tn - tfail, "of", tn, "new headlines");
  if (items.length) { out["transfers-news"] = { items: items.slice(0, 40) }; console.log("ok news", items.length); } else console.warn("no transfer news items");
} catch (e) { console.warn("skip news", e.message); }

/* تقرير التحديث — بيتحفظ في .tmp وبيستخدمه الـworkflow للتوضيح */
const report = {
  updated: new Date().toISOString(),
  requested: LEAGUES.length,
  ok: Object.keys(out).filter(k => LEAGUES.includes(k)),
  failed: failures,
  partial: failures.length > 0,
};
try { await mkdir(".tmp", { recursive: true }); await writeFile(".tmp/update-report.json", JSON.stringify(report, null, 2)); } catch (e) { }
console.log(`تقرير التحديث: ${report.ok.length}/${LEAGUES.length} دوري تمام${failures.length ? " — فشل: " + failures.map(f => f.code).join(", ") : ""}`);

if (!Object.keys(out).length) throw new Error("مفيش أي دوري اتجلب، مش هنكتب فوق الملفات القديمة");

/* تنضيف قبل الحفظ: ممنوع مباراة مكررة (نفس الفريقين والموعد) أو id مكرر */
for (const d of Object.values(out)) {
  if (!Array.isArray(d.matches)) continue;
  const seenId = new Set(), seenPair = new Set();
  d.matches = d.matches.filter(m => {
    if (m.id != null) { if (seenId.has(m.id)) return false; seenId.add(m.id); }
    const hp = m.home && m.home.name ? String(m.home.name).toLowerCase() : '';
    const ap = m.away && m.away.name ? String(m.away.name).toLowerCase() : '';
    if (!hp || !ap) return true;
    const key = [hp, ap].sort().join('|') + '|' + String(m.date || '').slice(0, 16);
    if (seenPair.has(key)) return false;
    seenPair.add(key);
    return true;
  });
}

await mkdir("data", { recursive: true });
const parts = [];
for (const [code, d] of Object.entries(out)) { const s = JSON.stringify(d); parts.push(s); await writeFile(`data/${code}.json`, s); }
const hash = createHash("sha256").update(parts.join("|")).digest("hex");
let old = {}; try { old = JSON.parse(await readFile("data/meta.json", "utf8")); } catch {}
/* لو جزء من المصادر فشل، بنعلّم الميتا إن النسخة جزئية بدل ما نقدّمها كأنها كاملة */
const stale = failures.map(f => f.code);
const meta = { updated: new Date().toISOString(), hash, ...(stale.length ? { partial: true, stale } : {}) };
if (old.hash !== hash || !!old.partial !== !!stale.length || JSON.stringify(old.stale || []) !== JSON.stringify(stale)) {
  await writeFile("data/meta.json", JSON.stringify(meta));
}
console.log("done:", Object.keys(out).join(", "));
