/* ============================================================
   build-search.mjs — فهرس البحث (فرق + لاعبين) في data/search.json
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CODES = ["PL", "PD", "SA", "BL1", "FL1", "CL", "ELC", "DED", "PPL", "BSA", "TSL",
  "EGY", "SAU", "MAR", "TUN", "ALG", "UAE", "QAT", "IRQ", "JOR", "ARB", "ARBCL", "GULF", "AFCON", "ASIAN"];

/* أسماء عربية للأندية المعروفة (عشان البحث بالعربي يلاقيها) */
const AR = {
  "Arsenal": "آرسنال", "Brighton": "برايتون", "Manchester City": "مانشستر سيتي", "Liverpool": "ليفربول",
  "Bournemouth": "بورنموث", "Brentford": "برينتفورد", "FC Barcelona": "برشلونة", "Real Madrid": "ريال مدريد",
  "Atletico Madrid": "أتلتيكو مدريد", "Real Betis": "ريال بيتيس", "Real Sociedad": "ريال سوسيداد", "Sevilla": "إشبيلية",
  "Lazio": "لاتسيو", "AS Roma": "روما", "Inter Milan": "إنتر ميلان", "AC Milan": "ميلان", "Como": "كومو", "Juventus": "يوفنتوس",
  "Borussia Dortmund": "بوروسيا دورتموند", "Bayern Munich": "بايرن ميونخ", "Freiburg": "فرايبورغ", "RB Leipzig": "لايبزيغ",
  "Bayer Leverkusen": "باير ليفركوزن", "Werder Bremen": "فيردر بريمن", "PSG": "باريس سان جيرمان", "Paris FC": "باريس إف سي",
  "Lille": "ليل", "Lyon": "ليون", "Olympique de Marseille": "مارسيليا", "Brest": "بريست",
  "PSV Eindhoven": "آيندهوفن", "Ajax": "أياكس", "Twente": "تفينتي", "AZ Alkmaar": "ألكمار", "Feyenoord": "فينورد",
  "FC Porto": "بورتو", "Benfica": "بنفيكا", "Sporting CP": "سبورتينغ لشبونة", "Santa Clara": "سانتا كلارا", "Arouca": "أروكا",
  "Flamengo": "فلامنغو", "Palmeiras": "بالميراس", "Cruzeiro": "كروزيرو", "Fluminense": "فلومينينسي", "Bahia": "باهيا",
  "Pyramids": "بيراميدز", "Zamalek SC": "الزمالك", "Al Ahly SC": "الأهلي", "Ceramica Cleopatra": "سيراميكا كليوباترا",
  "Al Ittehad": "الاتحاد السكندري", "Al Mokawloon Al Arab": "المقاولون العرب",
  "Al Hilal Riyadh": "الهلال", "Qadisiya": "القادسية", "Al Nassr FC Riyadh": "النصر", "Al Ahli Jeddah": "الأهلي السعودي",
  "Ittihad Jeddah": "الاتحاد", "NEOM SC": "نيوم",
  "Kawkab Marrakech": "الكوكب المراكشي", "CODM Meknes": "المغرب المكناسي", "Raja Casablanca": "الرجاء",
  "Wydad AC": "الوداد", "AS Far Rabat": "الجيش الملكي", "Maghreb Fès": "المغرب الفاسي",
  "Ben Guerdane": "بن قردان", "Esperance ST": "الترجي", "Stade Tunisien": "الملعب التونسي", "US Monastir": "المنستير",
  "Club Africain Tunis": "النادي الإفريقي", "CS Sfaxien": "الصفاقسي",
  "JS Kabylie": "شبيبة القبائل", "CR Belouizdad": "شباب بلوزداد", "MC Oran": "مولودية وهران", "MC Alger": "مولودية الجزائر",
  "USM Alger": "اتحاد الجزائر",
  "Jazira Abu Dhabi": "الجزيرة", "Sharjah SC": "الشارقة", "Al Ain": "العين", "Shabab Al Ahly": "شباب الأهلي",
  "Al Wasl": "الوصل", "Al-Wahda": "الوحدة",
  "Al Rayyan": "الريان", "Al Sadd": "السد", "Al Duhail": "الدحيل", "Al Arabi Doha": "العربي", "Al Shamal": "الشمال", "Al-Ahli Doha": "الأهلي القطري",
  "Al Shorta Baghdad": "الشرطة", "Al Zawraa Baghdad": "الزوراء", "Al Naft": "النفط", "Al Karma": "الكرمة", "Newroz": "نيروز",
  "Al Faisaly": "الفيصلي", "Al Ramtha": "الرمثا", "Al Wehdat": "الوحدات", "Al Hussein": "الحسين إربد"
};

const teams = [];
const seen = new Set();
for (const code of CODES) {
  const p = `data/${code}.json`;
  if (!existsSync(p)) continue;
  let d;
  try { d = JSON.parse(readFileSync(p, "utf8")); } catch (e) { continue; }
  for (const r of d.standings || []) {
    const k = code + ":" + r.team.id;
    if (!r.team?.name || seen.has(k)) continue;
    seen.add(k);
    teams.push([r.team.name, code, r.team.id, r.team.crest || "", AR[r.team.name] || ""]);
  }
}

let players = [];
if (existsSync("data/fpl.json")) {
  try {
    const F = JSON.parse(readFileSync("data/fpl.json", "utf8"));
    const tm = {};
    (F.teams || []).forEach(t => { tm[t.id] = t.short_name || t.name; });
    players = (F.elements || []).map(p => [p.web_name, tm[p.team] || "", p.id, p.element_type]);
  } catch (e) { }
}

writeFileSync("data/search.json", JSON.stringify({ updated: new Date().toISOString(), teams, players }));
console.log("ok search | فرق:", teams.length, "| لاعبين:", players.length,
  "| حجم:", Math.round(JSON.stringify({ teams, players }).length / 1024) + "KB");
