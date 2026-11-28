/* يبني data/follow.json — فهرس للمتابعة: بطولات + أندية + منتخبات */
import { readFile, writeFile, readdir } from "node:fs/promises";

const NT = new Set(["WC", "U20WC", "U17WC", "CONF", "ARB", "FINALISSIMA", "EURO", "CA", "AFCON",
  "ASIAN", "GOLD", "UNL", "CNL", "GULF", "WWC", "WU20", "WU17", "OLYW", "AFCW", "CAW", "GOLDW", "CAFW", "EU21", "EU19", "EU17"]);

const files = (await readdir("data")).filter(f => f.endsWith(".json") && !["follow.json", "fpl.json", "info.json", "meta.json", "news.json", "search.json", "sports.json", "transfers.json", "transfers-news.json", "home.json", "home-arab.json", "arab.json"].includes(f));

const clubs = new Map(), nats = new Map(), comps = new Map();

for (const f of files) {
  let d;
  try { d = JSON.parse(await readFile("data/" + f, "utf8")); } catch { continue; }
  const code = d.code || f.replace(/\.json$/, "");
  if (!d.code) continue;
  comps.set(code, { code, name: d.name || code, nameAr: d.nameAr || d.name || code });
  for (const r of d.standings || []) {
    const t = r && r.team;
    if (!t || !t.id) continue;
    if (!clubs.has(t.id)) clubs.set(t.id, { id: t.id, name: t.name, crest: t.crest, league: code });
  }
  if (NT.has(code)) {
    for (const m of d.matches || []) {
      for (const t of [m.home, m.away]) {
        if (t && t.id && !nats.has(t.id)) nats.set(t.id, { id: t.id, name: t.name, crest: t.crest });
      }
    }
  }
}

const out = {
  updated: new Date().toISOString(),
  comps: [...comps.values()].sort((a, b) => a.name.localeCompare(b.name)),
  clubs: [...clubs.values()].sort((a, b) => a.name.localeCompare(b.name)),
  nats: [...nats.values()].sort((a, b) => a.name.localeCompare(b.name))
};
await writeFile("data/follow.json", JSON.stringify(out));
console.log({ comps: out.comps.length, clubs: out.clubs.length, nats: out.nats.length });
