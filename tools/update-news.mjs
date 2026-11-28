// يسحب عناوين الأخبار من فيدات RSS ويكتب data/news.json
// (نسخة احتياطية للتطبيق لو الشبكة أو وسيط الفيدات وقع)
import { writeFile } from "node:fs/promises";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" };
const BING = q => `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=RSS&setlang=ar&cc=EG&qft=interval%3d%227%22`;
const FEEDS = [
  /* عناوين عربية لكرة القدم من آخر 7 أيام */
  { name: "أخبار الكورة", ar: true, url: BING("كرة القدم") },
  { name: "الدوري المصري", ar: true, url: BING("الدوري المصري") },
  { name: "انتقالات", ar: true, url: BING("انتقالات كرة القدم") }
];

const clean = s => String(s || "")
  .replace(/<!\[CDATA\[|\]\]>/g, "")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\s+/g, " ").trim();

function parse(xml, feed) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map(m => {
    const it = m[0];
    const pick = tag => {
      const r = it.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
      return r ? clean(r[1]) : "";
    };
    return { t: pick("title"), u: pick("link"), d: pick("pubDate"), s: feed.name, ar: !!feed.ar };
  }).filter(x => x.t && x.u);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const items = [];
for (const f of FEEDS) {
  try {
    let r;
    for (let i = 0; i < 3; i++) {
      r = await fetch(f.url, { headers: H, signal: AbortSignal.timeout(20000) });
      if (r.status !== 429 && r.status < 500) break;
      const ra = Number(r.headers.get("retry-after") || 0);
      await sleep(Math.min(ra > 0 ? ra * 1000 : 1500 * 2 ** i, 20000));
    }
    if (!r || !r.ok) throw new Error("HTTP " + (r ? r.status : "?"));
    const xml = await r.text();
    const got = parse(xml, f);
    items.push(...got);
    console.log("ok", f.name, got.length);
  } catch (e) {
    console.warn("skip", f.name, e.message);
  }
}

const seen = new Set();
const out = items.filter(x => {
  const k = x.t.toLowerCase().slice(0, 70);
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
}).sort((a, b) => Date.parse(b.d || 0) - Date.parse(a.d || 0)).slice(0, 40);

if (!out.length) throw new Error("مفيش أخبار اتجابت — مش هنكتب فوق الملف القديم");
await writeFile("data/news.json", JSON.stringify({ updated: new Date().toISOString(), items: out }));
console.log("done:", out.length, "خبر");
