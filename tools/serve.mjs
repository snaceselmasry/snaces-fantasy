// سيرفر محلي بسيط لمعاينة التطبيق
// التشغيل:  bun tools/serve.mjs
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), ".."));
const PORT = Number(process.env.PORT || 5173);

const server = Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(join(ROOT, path));
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    return new Response(file, {
      headers: { "cache-control": "no-store", "service-worker-allowed": "/" }
    });
  }
});

console.log(`SNACES app → http://127.0.0.1:${server.port}`);
