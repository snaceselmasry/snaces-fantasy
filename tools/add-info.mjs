// يضيف/يحدّث بطولات معيّنة في data/info.json من ويكيبيديا من غير ما يمسح الباقي
// الاستخدام: bun tools/add-info.mjs [CODE ...]
import { readFile, writeFile } from "node:fs/promises";

const UA = "SNACES-FOOTBALL-data-builder/1.0 (contact: snaces@example.com)";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PAGES = {
  CWC: "FIFA Club World Cup",
  FIC: "FIFA Intercontinental Cup",
  WC: "FIFA World Cup",
  WWC: "FIFA Women's World Cup",
  U20WC: "FIFA U-20 World Cup",
  U17WC: "FIFA U-17 World Cup",
  WU20: "FIFA U-20 Women's World Cup",
  WU17: "FIFA U-17 Women's World Cup",
  CONF: "FIFA Confederations Cup",
  FINALISSIMA: "Finalissima",
  EURO: "UEFA European Championship",
  CA: "Copa América",
  GOLD: "CONCACAF Gold Cup",
  UNL: "UEFA Nations League",
  CNL: "CONCACAF Nations League",
  CAW: "Copa América Femenina",
  CAFW: "Women's Africa Cup of Nations",
  /* كرة القدم للسيدات */
  WSL: "Women's Super League",
  WFACUP: "Women's FA Cup",
  LIGAF: "Liga F",
  SERIEAW: "Serie A (women's football)",
  BLW: "Frauen-Bundesliga",
  FRAUW: "Première Ligue",
  NWSL: "National Women's Soccer League",
  LMXF: "Liga MX Femenil",
  BRAZW: "Campeonato Brasileiro de Futebol Feminino",
  SAUWPL: "Saudi Women's Premier League",
  UWCL: "UEFA Women's Champions League",
  LIBW: "Copa Libertadores Femenina",
  AFCW: "AFC Women's Asian Cup",
  GOLDW: "CONCACAF W Championship",
  FWCC: "FIFA Women's Champions Cup",
  OLYW: "Football at the Summer Olympics",
  EU21: "UEFA European Under-21 Championship",
  EU19: "UEFA European Under-19 Championship",
  EU17: "UEFA European Under-17 Championship",
  SA20: "South American U-20 Championship",
  AFC20: "AFC U-20 Asian Cup",
  CAF20: "U-20 Africa Cup of Nations",
  CONC20: "CONCACAF U-20 Championship",
  EGYSC: "Egyptian Super Cup",
  SAUSC: "Saudi Super Cup",
  ALGSC: "Algerian Super Cup",
  ARGSC: "Supercopa Argentina",
  BRASC: "Supercopa do Brasil",
  MXSC: "Campeón de Campeones",
  JORSC: "Jordan Super Cup",
  IRQSC: "Iraqi Super Cup",
  KUWSC: "Kuwait Super Cup",
  OMASC: "Omani Super Cup",
  BHRSC: "Bahraini Super Cup",
  TUNSC: "Tunisian Super Cup",
  USA: "UEFA Super Cup",
  EUWC: "UEFA Women's Championship"
};

const WANT = [
  "country", "region", "confed", "organiser", "founded", "teams", "champions", "season",
  "most_successful_club", "most_successful_team", "most_titles", "most_championships",
  "top_goalscorer", "most_appearances", "current_champions", "number_of_teams", "current"
];

const NAT = {
  MAR: "المغرب", IRQ: "العراق", SEN: "السنغال", EGY: "مصر", JPN: "اليابان", QTR: "قطر",
  KSA: "السعودية", KUW: "الكويت", BHR: "البحرين", OMA: "عمان", UAE: "الإمارات", JOR: "الأردن",
  TUN: "تونس", ALG: "الجزائر", CMR: "الكاميرون", NGA: "نيجيريا", GHA: "غانا", CIV: "ساحل العاج",
  COD: "الكونغو الديمقراطية", ZAM: "زامبيا", RSA: "جنوب أفريقيا", AUS: "أستراليا", KOR: "كوريا الجنوبية",
  IRN: "إيران", CHN: "الصين", UZB: "أوزبكستان", SYR: "سوريا", LIB: "لبنان", PLE: "فلسطين",
  ESP: "إسبانيا", USA: "الولايات المتحدة", GER: "ألمانيا", FRG: "ألمانيا الغربية", BRA: "البرازيل",
  FRA: "فرنسا", ENG: "إنجلترا", ARG: "الأرجنتين", ITA: "إيطاليا", NED: "هولندا", POR: "البرتغال",
  MEX: "المكسيك", SWE: "السويد", NOR: "النرويج", DEN: "الدنمارك", URU: "أوروغواي", COL: "كولومبيا",
  CHI: "تشيلي", BEL: "بلجيكا", CRO: "كرواتيا", SRB: "صربيا", RUS: "روسيا", TUR: "تركيا",
  POL: "بولندا", UKR: "أوكرانيا", ISR: "إسرائيل", NZL: "نيوزيلندا", CAN: "كندا", CRC: "كوستاريكا",
  HON: "هندوراس", PAN: "بنما", JAM: "جامايكا", GUA: "غواتيمالا", SLV: "السلفادور", TRI: "ترينيداد",
  HAI: "هايتي", ECU: "الإكوادور", PAR: "باراغواي", PER: "بيرو", BOL: "بوليفيا", VEN: "فنزويلا",
  CHN2: "الصين", PRK: "كوريا الشمالية", SCO: "اسكتلندا", WAL: "ويلز", IRL: "أيرلندا", AUT: "النمسا",
  SUI: "سويسرا", GRE: "اليونان", CZE: "التشيك", HUN: "هنغاريا", ROU: "رومانيا", SVK: "سلوفاكيا",
  FIN: "فنلندا", ISL: "آيسلندا", MLI: "مالي", BFA: "بوركينا فاسو", GUI: "غينيا", ANG: "أنغولا",
  ZIM: "زيمبابوي", UGA: "أوغندا", KEN: "كينيا", ETH: "إثيوبيا", MOZ: "موزمبيق", GAB: "الغابون",
  BEN: "بنين", TOG: "توغو", NIG: "النيجر", MTN: "موريتانيا", LBY: "ليبيا", SDN: "السودان"
};

function clean(s) {
  if (!s) return null;
  let t = s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[\s\S]*?<\/ref>/gi, "")
    .replace(/\{\{fbaicon\|[^}]*\}\}/gi, "")
    .replace(/\{\{flagicon\|[^}]*\}\}/gi, "")
    .replace(/\{\{fb[a-z]*\|(?:\d+\|)?([^|}]+)\}\}/gi, (m, c) => NAT[c.trim().toUpperCase()] || c.trim())
    .replace(/\{\{flag(?:icon)?\|([A-Za-z]{3})\}\}/gi, (m, c) => NAT[c.toUpperCase()] || "")
    .replace(/\{\{lang\|[a-z-]+\|([^|}]*)[^}]*\}\}/gi, "$1")
    .replace(/\{\{(?:nowrap|nowrap begin|no wrap)\|([^}]*)\}\}/gi, "$1")
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
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) { await sleep(5000 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (j.error) throw new Error(j.error.info || "wiki error");
    return (j.parse && j.parse.wikitext && j.parse.wikitext["*"]) || "";
  }
  throw new Error("HTTP 429 بعد المحاولات");
}

const db = JSON.parse(await readFile("data/info.json", "utf8"));
db.leagues = db.leagues || {};

const only = process.argv.slice(2);
const codes = only.length ? only.filter(c => PAGES[c]) : Object.keys(PAGES);

let okN = 0, failN = 0;
for (const code of codes) {
  if (!only.length && db.leagues[code] && db.leagues[code].champions) { console.log("skip موجود", code); continue; }
  try {
    const w = await wiki(PAGES[code]);
    if (!w) { console.log("skip فاضي", code); continue; }
    const f = fields(w);
    const most = f.most_successful_club || f.most_successful_team || f.most_titles || f.most_championships || null;
    const champ = f.current_champions || f.champions || null;
    if (!champ && !most) { console.log("skip بدون صناديق", code); failN++; continue; }
    db.leagues[code] = { page: PAGES[code], champions: champ, mostSuccessful: most, ...f };
    okN++;
    console.log("ok", code.padEnd(10), String(champ || "-").slice(0, 34).padEnd(34), "| الأكثر:", String(most || "-").slice(0, 30));
  } catch (e) {
    failN++;
    console.log("fail", code, e.message);
  }
  await sleep(1200);
}

db.updated = new Date().toISOString();
await writeFile("data/info.json", JSON.stringify(db));
console.log("done. ok:", okN, "fail:", failN, "total:", Object.keys(db.leagues).length);
