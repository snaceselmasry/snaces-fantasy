// يتأكد من صور اللاعبين: 250x250 لو موجودة، وإلا 110x140، وإلا يشيلها
import { readFile, writeFile } from "node:fs/promises";
const D = JSON.parse(await readFile("data/fpl.json", "utf8"));
const B = "https://resources.premierleague.com/premierleague/photos/players/";
const ok = async u => { try { const r = await fetch(u, { method: "HEAD" }); return r.ok && (+r.headers.get("content-length") || 0) > 2000; } catch { return false; } };
let big = 0, small = 0, none = 0;
const queue = [...D.elements];
const worker = async () => {
  while (queue.length) {
    const p = queue.shift();
    if (!p.photo || !/^p\d+\.png$/.test(p.photo)) { p.photo = null; none++; continue; }
    if (await ok(B + "250x250/" + p.photo)) { p.photoBig = true; big++; continue; }
    if (await ok(B + "110x140/" + p.photo)) { p.photoBig = false; small++; continue; }
    p.photo = null; none++;
  }
};
await Promise.all(Array.from({ length: 12 }, worker));
await writeFile("data/fpl.json", JSON.stringify(D));
console.log({ big, small, none, total: D.elements.length, sample: D.elements[0] && { id: D.elements[0].id, photo: D.elements[0].photo, photoBig: D.elements[0].photoBig } });
