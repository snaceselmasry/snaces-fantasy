// يولّد أيقونات التطبيق PNG من غير أي مكتبات (zlib المدمج بس)
import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

/* ---------- PNG ---------- */
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
const crc32 = buf => { let c = -1; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---------- رسم ---------- */
function render(size) {
  const W = size * 2, H = size * 2, out = Buffer.alloc(W * H * 3);
  const cx = W / 2, cy = H / 2;
  const corner = 0.22 * W;
  const ballR = 0.30 * W;
  const inRound = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const rx = Math.min(x, W - 1 - x), ry = Math.min(y, H - 1 - y);
    if (rx >= corner || ry >= corner) return true;
    const dx = corner - rx, dy = corner - ry;
    return dx * dx + dy * dy <= corner * corner;
  };
  const poly = pts => (x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const pentagon = (r, rot, ox = cx, oy = cy) => {
    const pts = [];
    for (let i = 0; i < 5; i++) { const a = rot + (i * 2 * Math.PI) / 5; pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]); }
    return poly(pts);
  };

  const patches = [pentagon(0.115 * W, -Math.PI / 2)];
  for (let k = 0; k < 5; k++) {
    const A = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    const d = 0.187 * W;
    patches.push(pentagon(0.074 * W, A + Math.PI / 5, cx + Math.cos(A) * d, cy + Math.sin(A) * d));
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (!inRound(x, y)) { out[i] = 7; out[i + 1] = 19; out[i + 2] = 15; continue; }

      /* خلفية متدرجة */
      const t = y / H;
      let r = Math.round(14 + (7 - 14) * t);
      let g = Math.round(43 + (19 - 43) * t);
      let b = Math.round(32 + (15 - 32) * t);

      /* هالة خضراء حوالين الكورة */
      const dist = Math.hypot(x - cx, y - cy);
      const glow = Math.max(0, 1 - dist / (0.78 * W));
      g = Math.min(255, Math.round(g + glow * 34));
      r = Math.min(255, Math.round(r + glow * 6));
      b = Math.min(255, Math.round(b + glow * 16));

      /* الكورة */
      if (dist <= ballR) {
        const shade = 1 - 0.10 * (y - (cy - ballR)) / (2 * ballR);
        r = Math.round(246 * shade); g = Math.round(252 * shade); b = Math.round(248 * shade);
        for (const p of patches) if (p(x, y)) { r = 11; g = 29; b = 22; break; }
        /* خط رفيع على حرف الكورة */
        if (dist > ballR - 2) { r = 210; g = 228; b = 218; }
      }
      out[i] = r; out[i + 1] = g; out[i + 2] = b;
    }
  }

  /* تصغير 2×2 */
  const res = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const i = ((y * 2 + dy) * W + (x * 2 + dx)) * 3;
      r += out[i]; g += out[i + 1]; b += out[i + 2];
    }
    const o = (y * size + x) * 3;
    res[o] = Math.round(r / 4); res[o + 1] = Math.round(g / 4); res[o + 2] = Math.round(b / 4);
  }
  return png(size, size, res);
}

await mkdir("assets", { recursive: true });
for (const size of [192, 512]) {
  const buf = render(size);
  await writeFile(`assets/icon-${size}.png`, buf);
  console.log("icon", size, buf.length, "bytes");
}
