// أداة فحص: بتقولك أنهي بطولات ومصادر أخبار بتشتغل فعلًا من سيرفرات GitHub. بتشتغل يدويًا من تبويب Actions.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const j = async (url, headers = {}) => { const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", ...headers } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); };

console.log("===== 1) بطولات football-data.org المتاحة على حسابك =====");
try {
  const d = await j("https://api.football-data.org/v4/competitions", { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY || "" });
  const free = d.competitions.filter(c => c.plan === "TIER_ONE");
  console.log("مجاني (TIER_ONE):", free.length, "→", free.map(c => `${c.code}=${c.name}`).join(" | "));
  const other = {}; d.competitions.filter(c => c.plan !== "TIER_ONE").forEach(c => (other[c.plan] ??= []).push(c.code));
  for (const [p, l] of Object.entries(other)) console.log("مدفوع", p, ":", l.slice(0, 60).join(","), l.length > 60 ? "..." : "");
} catch (e) { console.log("فشل:", e.message); }

console.log("\n===== 2) بطولات ESPN (ترتيب + مباريات اليوم) =====");
const slugs = ["uefa.champions","uefa.europa","uefa.europa.conf","uefa.super_cup","uefa.euro","uefa.nations","fifa.world","fifa.cwc","fifa.friendly","fifa.arab.cup",
 "caf.champions","caf.confed","caf.nations","afc.champions","afc.cup","afc.asian.cup","conmebol.libertadores","conmebol.sudamericana","conmebol.america","concacaf.gold","concacaf.champions",
 "eng.1","eng.2","eng.fa","eng.league_cup","esp.1","esp.copa_del_rey","ita.1","ita.coppa_italia","ger.1","ger.dfb_pokal","fra.1","fra.coupe_de_france","ned.1","por.1","bra.1","arg.1","usa.1","mex.1","sco.1","tur.1","bel.1","gre.1",
 "ksa.1","uae.1","qat.1","egy.1","mar.1","tun.1","alg.1","jor.1","irq.1","kuw.1","bah.1","oma.1","rsa.1"];
const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
for (const s of slugs) {
  let st = "—", sb = "—", name = "";
  try { const d = await j(`https://site.api.espn.com/apis/v2/sports/soccer/${s}/standings`); st = (d.children || []).reduce((n, c) => n + (c.standings?.entries?.length || 0), 0) + " فريق"; name = d.name || ""; } catch (e) { st = e.message; }
  try { const d = await j(`https://site.api.espn.com/apis/site/v2/sports/soccer/${s}/scoreboard`); sb = (d.events?.length ?? 0) + " مباراة"; name = name || d.leagues?.[0]?.name || ""; } catch (e) { sb = e.message; }
  let day = "—"; try { const d = await j(`https://site.api.espn.com/apis/site/v2/sports/soccer/${s}/scoreboard?dates=${ymd}`); day = (d.events?.length ?? 0) + ""; } catch (e) { day = e.message; }
  console.log(`${s.padEnd(24)} ترتيب: ${String(st).padEnd(12)} مباريات: ${String(sb).padEnd(14)} اليوم: ${String(day).padEnd(10)} ${name}`);
  await sleep(250);
}

console.log("\n===== 3) مصادر أخبار عربية (RSS) =====");
const feeds = ["https://feeds.bbci.co.uk/arabic/rss.xml","https://feeds.bbci.co.uk/arabic/sports/rss.xml","https://www.skynewsarabia.com/web/rss","https://www.skynewsarabia.com/rss","https://www.alarabiya.net/.mrss/ar/sport.xml","https://arabic.cnn.com/api/v1/rss/sport/rss.xml","https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss","https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/4e9f9c50-d9bf-4c9d-8d41-1b9a6b2e8e3c","https://www.kooora.com/rss","https://www.yallakora.com/rss","https://www.filgoal.com/rss","https://www.beinsports.com/ar/rss","https://www.masrawy.com/rss/sports"];
for (const u of feeds) {
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml, */*" } });
    if (!r.ok) { console.log("✗", r.status, u); continue; }
    const x = await r.text(), n = (x.match(/<item[\s>]/gi) || []).length, tr = (x.match(/انتقال|صفقة|تعاقد|ينضم|يضم|رحيل|إعارة|ميركاتو|مفاوضات/g) || []).length;
    const t = /<item[\s>][\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/i.exec(x);
    console.log("✓", n, "خبر،", tr, "كلمة انتقالات |", u, "|", (t?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim().slice(0, 70));
  } catch (e) { console.log("✗", e.message, u); }
  await sleep(300);
}
console.log("\nخلص الفحص.");
