// يجيب معلومات كل بطولة (الأبطال، أكثر فريق فاز، الهداف التاريخي، التأسيس، عدد الفرق)
// من صناديق معلومات Wikipedia ويكتب data/info.json
import { writeFile, mkdir } from "node:fs/promises";

const UA = "SNACES-FOOTBALL-data-builder/1.0 (contact: snaces@example.com)";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PAGES = {
  PL: "Premier League", PD: "La Liga", SA: "Serie A", BL1: "Bundesliga", FL1: "Ligue 1",
  PPL: "Primeira Liga", DED: "Eredivisie", TSL: "Süper Lig", BSA: "Campeonato Brasileiro Série A",
  CL: "UEFA Champions League", ELC: "EFL Championship",
  EGY: "Egyptian Premier League", SAU: "Saudi Pro League", MAR: "Botola", TUN: "Tunisian Ligue Professionnelle 1",
  ALG: "Algerian Ligue Professionnelle 1", UAE: "UAE Pro League", QAT: "Qatar Stars League",
  JOR: "Jordanian Pro League", IRQ: "Iraq Stars League",
  MLS: "Major League Soccer", LMX: "Liga MX", ARG: "Argentine Primera División",
  COL: "Categoría Primera A", USLC: "USL Championship",
  FACUP: "FA Cup", EFLCP: "EFL Cup", CDR: "Copa del Rey", COPPA: "Coppa Italia", DFBP: "DFB-Pokal",
  CDFR: "Coupe de France", TACAP: "Taça de Portugal", CDB: "Copa do Brasil", TKUP: "Turkish Cup",
  EGYCUP: "Egypt Cup", EGYLC: "Egyptian League Cup", KINGCUP: "King Cup", TRONE: "Coupe du Trône",
  TUNCUP: "Tunisian Cup", UAEPRES: "UAE President's Cup", UAELC: "UAE League Cup",
  COPAARG: "Copa Argentina", COPACOL: "Copa Colombia",
  UEL: "UEFA Europa League", UECL: "UEFA Conference League", LIB: "Copa Libertadores",
  SUDA: "Copa Sudamericana", CAFCL: "CAF Champions League", CAFCC: "CAF Confederation Cup",
  CAFSC: "CAF Super Cup", ACL: "AFC Champions League Elite", ACL2: "AFC Champions League Two",
  CCC: "CONCACAF Champions Cup", UESC: "UEFA Super Cup", RECOPA: "Recopa Sudamericana",
  CSHIELD: "FA Community Shield", SESP: "Supercopa de España", SITA: "Supercoppa Italiana",
  SGER: "DFL-Supercup", SFRA: "Trophée des Champions", SPOR: "Supertaça Cândido de Oliveira",
  STUR: "Turkish Süper Kupa",
  ARB: "FIFA Arab Cup", ARBCL: "Arab Club Champions Cup", GULF: "Arabian Gulf Cup",
  AFCON: "Africa Cup of Nations", ASIAN: "AFC Asian Cup"
};

const WANT = [
  "country", "region", "confed", "organiser", "founded", "teams", "champions", "season",
  "most_successful_club", "most_successful_team", "most_titles", "most_championships",
  "top_goalscorer", "most_appearances", "current_champions", "number_of_teams", "current"
];

/* أكواد المنتخبات اللي بتظهر في {{fb|XXX}} */
const NAT = {
  MAR: "المغرب", IRQ: "العراق", SEN: "السنغال", EGY: "مصر", JPN: "اليابان", QTR: "قطر",
  KSA: "السعودية", KUW: "الكويت", BHR: "البحرين", OMA: "عمان", UAE: "الإمارات", JOR: "الأردن",
  TUN: "تونس", ALG: "الجزائر", CMR: "الكاميرون", NGA: "نيجيريا", GHA: "غانا", CIV: "ساحل العاج",
  COD: "الكونغو الديمقراطية", ZAM: "زامبيا", RSA: "جنوب أفريقيا", AUS: "أستراليا", KOR: "كوريا الجنوبية",
  IRN: "إيران", CHN: "الصين", UZB: "أوزبكستان", SYR: "سوريا", LIB: "لبنان", PLE: "فلسطين",
  YEM: "اليمن", SUD: "السودان", BHR2: "البحرين", HKG: "هونغ كونغ", THA: "تايلاند", VIE: "فيتنام"
};

function clean(s) {
  if (!s) return null;
  let t = s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[\s\S]*?<\/ref>/gi, "")
    .replace(/\{\{fbaicon\|[^}]*\}\}/gi, "")
    .replace(/\{\{flagicon\|[^}]*\}\}/gi, "")
    .replace(/\{\{fb\|([A-Za-z]{2,4})\}\}/g, (m, c) => NAT[c.toUpperCase()] || c.toUpperCase())
    .replace(/\{\{lang\|[a-z-]+\|([^|}]*)[^}]*\}\}/gi, "$1")
    .replace(/\{\{[^{}]*\}\}/g, " ")
    .replace(/\{\{ubl\|/gi, "")
    .replace(/\{\{Start date and age\|([^}]*)\}\}/gi, (m, a) => (a.match(/\d{4}/) || [""])[0])
    .replace(/\{\{refn[\s\S]*?\}\}/gi, "")
    .replace(/\{\{efn[\s\S]*?\}\}/gi, "")
    .replace(/\{\{start date and age\|(\d{4})[^}]*\}\}/gi, "$1")
    .replace(/\{\{plainlist\|/gi, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\{\{nowrap\|([^}]*)\}\}/gi, "$1")
    .replace(/\b(?:nowrap|small|no break|fb|fbaicon|flagicon|ubl|plainlist|nobold)\|/gi, "")
    .replace(/^\s*\|+/, "")
    .replace(/'''?/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(/^[*•\s]+/, "").trim();
  return t || null;
}

function fields(wikitext) {
  const out = {};
  const lines = wikitext.split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*\|\s*([a-zA-Z][a-zA-Z _0-9]*?)\s*=\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase().trim().replace(/\s+/g, "_");
    if (!WANT.includes(k)) continue;
    let v = m[2];
    /* القيم اللي بتكمل في سطور جوه plainlist */
    if (/^\{\{plainlist/i.test(v.trim()) || v.trim() === "") {
      const i = lines.indexOf(line);
      let buf = v;
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        if (/^\s*\|/.test(lines[j])) break;
        buf += " " + lines[j];
        if (lines[j].includes("}}")) break;
      }
      v = buf;
    }
    const c = clean(v);
    if (c) out[k] = c;
  }
  return out;
}

async function wiki(page) {
  const url = "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&section=0&origin=*&page=" +
    encodeURIComponent(page);
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) {
      const wait = 4000 * (attempt + 1);
      console.warn("   429 — استنى", wait / 1000, "ث");
      await sleep(wait);
      continue;
    }
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (j.error) throw new Error(j.error.info || "wiki error");
    return (j.parse && j.parse.wikitext && j.parse.wikitext["*"]) || "";
  }
  throw new Error("HTTP 429 بعد المحاولات");
}

await mkdir("data", { recursive: true });
const out = { updated: new Date().toISOString(), source: "Wikipedia", leagues: {} };

for (const [code, page] of Object.entries(PAGES)) {
  try {
    const w = await wiki(page);
    if (!w) { console.warn("skip", code, "empty"); continue; }
    const f = fields(w);
    const most = f.most_successful_club || f.most_successful_team || f.most_titles || f.most_championships || null;
    const champ = f.current_champions || f.champions || null;
    if (!champ && !most) { console.warn("skip", code, "no infobox fields"); continue; }
    out.leagues[code] = { page, champions: champ, mostSuccessful: most, ...f };
    console.log("ok", code.padEnd(8), String(champ || "-").slice(0, 32).padEnd(32), "| الأكثر:", String(most || "-").slice(0, 32));
  } catch (e) {
    console.warn("skip", code, e.message);
  }
  await sleep(1400);
}

if (!Object.keys(out.leagues).length) throw new Error("مفيش بيانات — مش هنكتب فوق الملف القديم");
await writeFile("data/info.json", JSON.stringify(out));
console.log("done:", Object.keys(out.leagues).length, "بطولة");
