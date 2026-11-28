/* ============================================================
   بناء data/squads.json — تشكيلات الأندية مع جنسيات اللاعبين
   المصدر: Wikidata (P54 عضو فريق + P580 تاريخ البدء + P27 الجنسية)
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA = { "User-Agent": "SNACES-FOOTBALL/1.0 (squad builder)", Accept: "application/sparql-results+json" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const LEAGUES = {
  PL: { country: "England", words: ["england", "english"] },
  PD: { country: "Spain", words: ["spain", "spanish"] },
  SA: { country: "Italy", words: ["italy", "italian"] },
  BL1: { country: "Germany", words: ["germany", "german"] },
  FL1: { country: "France", words: ["france", "french"] },
  SAU: { country: "Saudi Arabia", words: ["saudi"] },
  EGY: { country: "Egypt", words: ["egypt", "egyptian"] },
  MAR: { country: "Morocco", words: ["morocco", "moroccan"] },
  TUN: { country: "Tunisia", words: ["tunisia", "tunisian"] },
  ALG: { country: "Algeria", words: ["algeria", "algerian"] },
  QAT: { country: "Qatar", words: ["qatar", "qatari"] },
  UAE: { country: "United Arab Emirates", words: ["emirati", "united arab emirates"] }
};

const TOP = 8; /* أول 8 فرق من كل دوري */

async function jget(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.status === 429 || r.status >= 500) { last = new Error("HTTP " + r.status); await sleep(1500 * (i + 1)); continue; }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { last = e; await sleep(900); }
  }
  throw last;
}

/* ---------- 1) الفرق ---------- */
const clubs = [];
for (const code in LEAGUES) {
  const p = `data/${code}.json`;
  if (!existsSync(p)) continue;
  const d = JSON.parse(readFileSync(p, "utf8"));
  (d.standings || []).slice(0, TOP).forEach(r => clubs.push({ code, name: r.team.name }));
}
console.log("فرق مطلوبة:", clubs.length);

/* ---------- 2) كود Wikidata لكل نادي ---------- */
const tokens = s => String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1);
const overlap = (a, b) => {
  const A = tokens(a), B = tokens(b);
  if (!A.length || !B.length) return 0;
  let n = 0; A.forEach(t => { if (B.includes(t)) n++; });
  return n / Math.max(A.length, B.length);
};

async function findQid(name, lg) {
  const variants = [name, name.replace(/\s+(FC|SC|CF|Club)$/i, ""), name.replace(/\s+(Riyadh|Jeddah|Cairo|Casablanca|Tunis|Algiers|Doha|Abu Dhabi|Baghdad|Amman)$/i, "")];
  for (const v of new Set(variants)) {
    let res;
    try {
      res = await jget(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*&language=en&uselang=en&limit=6&search=${encodeURIComponent(v)}`);
    } catch (e) { continue; }
    const scored = (res.search || []).map(h => {
      const d = String(h.description || "").toLowerCase();
      if (!/football|soccer/.test(d)) return null;
      if (/women|basketball|handball|volleyball|futsal|season|stadium|esports/.test(d)) return null;
      let sc = overlap(name, h.label) * 3;
      sc += lg.words.some(w => d.includes(w)) ? 5 : -3;
      return { id: h.id, sc };
    }).filter(Boolean).sort((a, b) => b.sc - a.sc);
    if (scored.length && scored[0].sc >= 2) return scored[0].id;
    await sleep(220);
  }
  return "";
}

const withQid = [];
for (const c of clubs) {
  const q = await findQid(c.name, LEAGUES[c.code]);
  if (q) withQid.push({ ...c, q });
  await sleep(200);
}
console.log("اتعرف عليهم:", withQid.length, "من", clubs.length);

/* ---------- 3) التشكيلات من SPARQL ---------- */
const SINCE = "2025-01-01";
const byQid = new Map();
const chunks = [];
for (let i = 0; i < withQid.length; i += 25) chunks.push(withQid.slice(i, i + 25));

for (const chunk of chunks) {
  const values = chunk.map(c => "wd:" + c.q).join(" ");
  const sparql = `SELECT ?club ?playerLabel ?countryLabel ?start WHERE {
    VALUES ?club { ${values} }
    ?player p:P54 ?st . ?st ps:P54 ?club . ?st pq:P580 ?start .
    OPTIONAL { ?st pq:P582 ?end }
    FILTER(!BOUND(?end) && ?start >= "${SINCE}"^^xsd:dateTime)
    ?player wdt:P27 ?country .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
  } LIMIT 4000`;
  try {
    const j = await jget("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql));
    for (const b of (j.results && j.results.bindings) || []) {
      const qid = b.club.value.split("/").pop();
      if (!byQid.has(qid)) byQid.set(qid, []);
      byQid.get(qid).push([b.playerLabel.value, b.countryLabel.value]);
    }
  } catch (e) {
    console.log("SPARQL فشل:", e.message);
  }
  await sleep(1200);
}

/* ---------- 4) التجميع والكتابة ---------- */
const out = [];
for (const c of withQid) {
  const rows = (byQid.get(c.q) || []).filter(([p, n]) => p && n);
  const seen = new Set();
  const players = [];
  for (const [p, n] of rows) {
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    players.push([p, n]);
  }
  if (players.length < 6) continue;
  const cnt = {};
  players.forEach(([, n]) => { cnt[n] = (cnt[n] || 0) + 1; });
  const nats = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
  out.push({ n: c.name, l: c.code, q: c.q, players: players.slice(0, 40), nats });
}

out.sort((a, b) => a.l.localeCompare(b.l) || b.players.length - a.players.length);
if (!out.length) throw new Error("مفيش قوائم فرق اتجابت — مش هنكتب فوق الملف القديم");
writeFileSync("data/squads.json", JSON.stringify({ updated: new Date().toISOString(), clubs: out }, null, 0));
console.log("اتكتب data/squads.json | أندية:", out.length, "| متوسط لاعبين:", Math.round(out.reduce((s, c) => s + c.players.length, 0) / Math.max(1, out.length)));
out.slice(0, 5).forEach(c => console.log("  ", c.n, "(" + c.l + ")", c.players.length, "لاعب |", c.nats.slice(0, 4).map(x => x[0] + ":" + x[1]).join(", ")));
