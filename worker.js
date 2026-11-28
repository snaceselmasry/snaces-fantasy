/* SNACES FOOTBALL — Worker: ملفات الموقع + مزامنة سحابية (Freebuff / Google) */
import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth';
import { buildPushPayload } from '@block65/webcrypto-web-push';

/* معرّف عام (مش سر) — يقدر يتغيّر من متغيّر البيئة لو حبيت */
const GOOGLE_CLIENT_ID = '129549290403-62sdrnpefi8o12v2p1e22sutogl8pgiv.apps.googleusercontent.com';
const SESSION_DAYS = 30;

let auth;
let app;
let dbReady;
let jwks = { keys: [], exp: 0 };

function setup(env) {
  auth ??= createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN,
  });
  const a = auth;
  app ??= a.wrap(async (request, env) => {
    const url = new URL(request.url);
    if (request.method === 'POST' && Number(request.headers.get('content-length') || 0) > 262144) {
      return harden(json({ error: 'too-large' }, 413), request, url);
    }
    const res = url.pathname.startsWith('/api/') ? await api(request, env, a) : await serve(request, env, url);
    return harden(res, request, url);
  });
  return app;
}

/* ============ رؤوس أمان لكل الردود ============ */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self' https://freebuff.site https://*.freebuff.site",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  /* accounts.google.com: ستايل زر «تسجيل الدخول بجوجل» (gsi/style) */
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://connect.facebook.net https://www.gstatic.com https://static.cloudflareinsights.com",
  "connect-src 'self' https:",
  "frame-src https://accounts.google.com https://connect.facebook.net",
].join('; ');

function harden(res, request, url) {
  try {
    const h = new Headers(res.headers);
    h.set('x-content-type-options', 'nosniff');
    h.set('referrer-policy', 'strict-origin-when-cross-origin');
    h.set('permissions-policy', 'geolocation=(), camera=(), microphone=(), payment=()');
    if (!h.has('content-security-policy')) h.set('content-security-policy', CSP);
    if (url.pathname.startsWith('/api/')) h.set('x-robots-tag', 'noindex');
    if (url.protocol === 'https:') h.set('strict-transport-security', 'max-age=15552000; includeSubDomains');
    if (request.method === 'HEAD' || res.status === 204 || res.status === 304 || !res.body) {
      return new Response(null, { status: res.status, statusText: res.statusText, headers: h });
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  } catch (e) {
    return res;
  }
}

/* حد بسيط للطلبات المتكررة (في الذاكرة — حماية إضافية مش مخزن دائم) */
const rlHits = new Map();
function throttled(key, max, windowMs) {
  const now = Date.now();
  const arr = (rlHits.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) { rlHits.set(key, arr); return true; }
  arr.push(now);
  rlHits.set(key, arr);
  if (rlHits.size > 3000) rlHits.clear();
  return false;
}
const clientIp = req => (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store' },
  });

const getCookie = (req, name) => {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
};

const sha256hex = async s => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
};

/* مقارنة ثابتة الزمن للأسرار (مفتاح cron) — من غير تسريب طول/بداية */
async function timingSafeEqual(a, b) {
  const [x, y] = await Promise.all([sha256hex(String(a || '')), sha256hex(String(b || ''))]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

const b64urlToBytes = s => {
  const t = String(s).replace(/-/g, '+').replace(/_/g, '/');
  const pad = t.length % 4 ? '='.repeat(4 - (t.length % 4)) : '';
  return Uint8Array.from(atob(t + pad), c => c.charCodeAt(0));
};

async function googleKeys() {
  if (Date.now() < jwks.exp && jwks.keys.length) return jwks.keys;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!r.ok) throw new Error('jwks');
  const j = await r.json();
  jwks = { keys: j.keys || [], exp: Date.now() + 3600 * 1000 };
  return jwks.keys;
}

async function verifyGoogle(token, clientId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('bad-token');
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  if (header.alg !== 'RS256') throw new Error('bad-alg');
  const keys = await googleKeys();
  const jwk = keys.find(k => k.kid === header.kid) || keys[0];
  if (!jwk) throw new Error('no-key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!ok) throw new Error('bad-signature');
  const now = Math.floor(Date.now() / 1000);
  if (!(payload.exp > now)) throw new Error('expired');
  if (payload.aud !== clientId) throw new Error('bad-aud');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) throw new Error('bad-iss');
  if (!payload.sub) throw new Error('no-sub');
  return payload;
}

async function ensureDb(env) {
  if (!dbReady) {
    dbReady = (async () => {
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS profiles (sub TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)'
      ).run();
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, sub TEXT NOT NULL, name TEXT, email TEXT, picture TEXT, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)'
      ).run();
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS push_subs (sub TEXT PRIMARY KEY, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, teams TEXT, names TEXT, comps TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'
      ).run();
      /* عمود تفضيلات لكل فريق/بطولة — ALTER بيتجاهل لو موجود */
      try { await env.DB.prepare('ALTER TABLE push_subs ADD COLUMN prefs TEXT').run(); } catch (e) { }
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS push_sent (sub TEXT NOT NULL, k TEXT NOT NULL, sent_at INTEGER NOT NULL, PRIMARY KEY (sub, k))'
      ).run();
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS kv_meta (k TEXT PRIMARY KEY, v TEXT)'
      ).run();
      /* غرف اللعب مع الصحاب */
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, game TEXT NOT NULL, host TEXT NOT NULL, state TEXT NOT NULL, version INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'
      ).run();
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS room_players (code TEXT NOT NULL, sub TEXT NOT NULL, name TEXT, picture TEXT, seat INTEGER NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (code, sub))'
      ).run();
    })().catch(e => { dbReady = null; throw e; }); /* فشل الإعداد؟ نحاول تاني في الطلب الجاي */
  }
  return dbReady;
}

const publicUser = u => ({ sub: u.sub, name: u.name || '', email: u.email || '', picture: u.picture || '', via: u.via || '' });

async function resolveUser(request, env, a) {
  try {
    const fb = await a.getUser(request);
    if (fb && fb.sub) return { sub: fb.sub, name: fb.name, email: fb.email, picture: fb.picture, via: 'freebuff' };
  } catch (e) { }
  const sid = getCookie(request, 'snaces_sid');
  if (!sid) return null;
  await ensureDb(env);
  const tokenHash = await sha256hex(sid);
  const row = await env.DB.prepare('SELECT * FROM sessions WHERE token_hash = ?').bind(tokenHash).first();
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    /* تنضيف الجلسة المنتهية بدل ما تفضل في قاعدة البيانات */
    try { await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run(); } catch (e) { }
    return null;
  }
  return { sub: row.sub, name: row.name, email: row.email, picture: row.picture, via: 'google' };
}

/* ============ Web Push (365Scores → إشعارات وانت برّه التطبيق) ============ */
const safeArr = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
const safeObj = s => { try { const o = JSON.parse(s || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const normName = s => String(s || '').toLowerCase()
  .replace(/[أإآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[^a-z0-9\u0600-\u06FF]/g, '');

async function fetchCompGames(ids) {
  if (!ids.length) return [];
  const qs = 'appTypeId=5&langId=1&competitions=' + ids.join(',');
  const get = u => fetch(u).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const [cur, past] = await Promise.all([
    get(`https://webws.365scores.com/web/games/current/?${qs}`),
    get(`https://webws.365scores.com/web/games/results/?${qs}&showOdds=false`),
  ]);
  const out = [];
  const seen = new Set();
  const add = g => {
    if (!g || seen.has(g.id)) return;
    const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
    if (!h.id || !a.id) return;
    seen.add(g.id);
    const t = String(g.statusText || '');
    const status = /ended|final|ft/i.test(t) ? 'FINISHED' : /live|half|1st|2nd|in progress/i.test(t) ? 'IN_PLAY' : 'TIMED';
    const hs = Number(h.score), as = Number(a.score);
    const scored = status !== 'TIMED' && Number.isFinite(hs) && Number.isFinite(as);
    out.push({
      id: g.id, comp: Number(g.competitionId) || 0, date: g.startTime, status,
      hg: scored ? hs : null, ag: scored ? as : null,
      h: { id: String(h.id), name: h.name || '' },
      a: { id: String(a.id), name: a.name || '' },
    });
  };
  ((cur && cur.games) || []).forEach(add);
  ((past && past.games) || []).forEach(add);
  return out;
}

async function pushDispatch(env) {
  const pub = env.VAPID_PUBLIC_KEY, priv = env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return { ok: false, error: 'push-not-configured' };
  await ensureDb(env);
  const rows = (await env.DB.prepare('SELECT * FROM push_subs').all()).results || [];
  if (!rows.length) return { ok: true, subs: 0, sent: 0 };

  const subs = rows.map(r => ({
    ...r,
    teams: safeArr(r.teams).map(String),
    names: safeArr(r.names).map(normName).filter(Boolean),
    comps: safeArr(r.comps).map(Number).filter(Boolean),
    prefs: safeObj(r.prefs),
  }));
  const comps = [...new Set(subs.flatMap(s => s.comps))].slice(0, 15);
  const games = await fetchCompGames(comps);
  if (!games.length) return { ok: true, subs: subs.length, sent: 0 };

  const vapid = { subject: env.VAPID_SUBJECT || 'https://snaces-football-uiulk2.freebuff.site', publicKey: pub, privateKey: priv };
  const now = Date.now();
  let sent = 0, removed = 0;

  for (const s of subs) {
    const teams = new Set(s.teams);
    const names = new Set(s.names);
    const tPrefs = s.prefs.t || {};
    const cPrefs = s.prefs.c || {};
    for (const g of games) {
      const rel = teams.has(g.h.id) || teams.has(g.a.id) || names.has(normName(g.h.name)) || names.has(normName(g.a.name));
      if (!rel) continue;
      /* تفضيلات لكل بطولة/فريق: all | kick | off */
      const cm = cPrefs[String(g.comp)] || 'all';
      if (cm === 'off') continue;
      const modes = [];
      if (teams.has(g.h.id)) modes.push(tPrefs[g.h.id] || 'all');
      if (teams.has(g.a.id)) modes.push(tPrefs[g.a.id] || 'all');
      if (modes.length && modes.every(m => m === 'off')) continue;
      const allowKick = !modes.length || modes.some(m => m !== 'off');
      const allowRes = cm === 'all' && (!modes.length || modes.some(m => m === 'all'));

      const t = Date.parse(g.date) || 0;
      let kind = '', title = '', body = '';
      if (allowKick && g.status === 'IN_PLAY' && now - t < 3 * 3600e3) {
        kind = 'kick'; title = '⚽ بدأت المباراة'; body = `${g.h.name} × ${g.a.name}`;
      } else if (allowRes && g.status === 'FINISHED' && g.hg != null && g.ag != null && now - t < 12 * 3600e3) {
        kind = 'res'; title = '🏁 انتهت المباراة'; body = `${g.h.name} ${g.hg} - ${g.ag} ${g.a.name}`;
      }
      if (!kind) continue;
      if (sent >= 60) break;
      const k = kind + ':' + g.id;
      const already = await env.DB.prepare('SELECT 1 FROM push_sent WHERE sub = ? AND k = ?').bind(s.sub, k).first();
      if (already) continue;
      try {
        const payload = await buildPushPayload(
          { data: JSON.stringify({ title, body, url: '/#/matches' }), options: { ttl: 3600, urgency: 'high' } },
          { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } },
          vapid
        );
        const res = await fetch(s.endpoint, payload);
        if (res.status === 404 || res.status === 410) {
          await env.DB.prepare('DELETE FROM push_subs WHERE sub = ?').bind(s.sub).run();
          removed++;
          break;
        }
        if (res.ok) {
          sent++;
          await env.DB.prepare('INSERT OR IGNORE INTO push_sent (sub, k, sent_at) VALUES (?, ?, ?)').bind(s.sub, k, now).run();
        }
      } catch (e) { }
    }
  }

  await env.DB.prepare('DELETE FROM push_sent WHERE sent_at < ?').bind(now - 3 * 864e5).run();
  return { ok: true, subs: subs.length, sent, removed };
}

/* ============ غرف اللعب مع الصحاب (كونكت 4 + التمثيل) ============ */
const ROOM_TTL = 6 * 3600e3;
const ONLINE_MS = 25000;

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeRoomCode() {
  const r = crypto.getRandomValues(new Uint8Array(5));
  let s = '';
  for (const x of r) s += ROOM_CODE_ALPHABET[x % ROOM_CODE_ALPHABET.length];
  return s;
}

const roomNorm = s => String(s || '').toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[^a-z0-9\u0600-\u06FF]/g, '');

/* كلمات لعبة التمثيل: [الكلمة، التصنيف] */
const ACT_WORDS = [
  ['محمد صلاح', 'لاعبين'], ['رونالدو', 'لاعبين'], ['ميسي', 'لاعبين'], ['أوباميانج', 'لاعبين'], ['حارس المرمى', 'كورة'],
  ['هدف', 'كورة'], ['ضربة جزاء', 'كورة'], ['إنذار', 'كورة'], ['تسلل', 'كورة'], ['ركلات ترجيح', 'كورة'],
  ['الأهلي', 'أندية'], ['ريال مدريد', 'أندية'], ['برشلونة', 'أندية'], ['مانشستر يونايتد', 'أندية'], ['ريفر بليت', 'أندية'],
  ['كورة قدم', 'كورة'], ['ملعب', 'كورة'], ['مدرب', 'كورة'], ['شبكة المرمى', 'كورة'], ['VAR', 'كورة'],
  ['تمساح', 'حيوانات'], ['قرش', 'حيوانات'], ['بطريق', 'حيوانات'], ['قرد', 'حيوانات'], ['قطة', 'حيوانات'],
  ['زرافة', 'حيوانات'], ['بطة', 'حيوانات'], ['عقرب', 'حيوانات'], ['أرنب', 'حيوانات'], ['خروف', 'حيوانات'],
  ['طبيب', 'مهن'], ['كهربائي', 'مهن'], ['طيار', 'مهن'], ['ممرضة', 'مهن'], ['حلاق', 'مهن'],
  ['شرطي', 'مهن'], ['طباخ', 'مهن'], ['مبرمج', 'مهن'], ['نجار', 'مهن'], ['صياد', 'مهن'],
  ['كشري', 'أكل'], ['فطير', 'أكل'], ['بيتزا', 'أكل'], ['شاورما', 'أكل'], ['بطيخ', 'أكل'],
  ['آيس كريم', 'أكل'], ['قهوة', 'أكل'], ['شاي', 'أكل'], ['مكرونة', 'أكل'], ['فول وطعمية', 'أكل'],
  ['تليفون', 'أشياء'], ['ساعة', 'أشياء'], ['جزمة', 'أشياء'], ['مفتاح', 'أشياء'], ['فرشة أسنان', 'أشياء'],
  ['نظارة', 'أشياء'], ['شنطة', 'أشياء'], ['مرايا', 'أشياء'], ['مقص', 'أشياء'], ['مروحة', 'أشياء'],
  ['نادي رياضي', 'أماكن'], ['مستشفى', 'أماكن'], ['بحر', 'أماكن'], ['حلوان', 'أماكن'], ['المدرسة', 'أماكن'],
  ['سوبر ماركت', 'أماكن'], ['برج إيفل', 'أماكن'], ['الهرم', 'أماكن'], ['مطار', 'أماكن'], ['قهوة بلدي', 'أماكن'],
  ['تيتانيك', 'سينما'], ['باب الحارة', 'سينما'], ['مقدمة', 'سينما'], ['ساعي البريد', 'سينما'], ['علاء الدين', 'سينما'],
  ['كابوريا', 'سينما'], ['الفيل الأزرق', 'سينما'], ['سبايدرمان', 'سينما'], ['رامي', 'سينما'], ['ليلة سعيدة', 'سينما']
];

function c4Winner(b) {
  const at = (r, c) => b[r * 7 + c];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const v = at(r, c);
    if (!v) continue;
    if (c + 3 < 7 && at(r, c + 1) === v && at(r, c + 2) === v && at(r, c + 3) === v) return v;
    if (r + 3 < 6 && at(r + 1, c) === v && at(r + 2, c) === v && at(r + 3, c) === v) return v;
    if (r + 3 < 6 && c + 3 < 7 && at(r + 1, c + 1) === v && at(r + 2, c + 2) === v && at(r + 3, c + 3) === v) return v;
    if (r + 3 < 6 && c - 3 >= 0 && at(r + 1, c - 1) === v && at(r + 2, c - 2) === v && at(r + 3, c - 3) === v) return v;
  }
  return 0;
}

function actNewWord(st) {
  const used = new Set(st.used || []);
  const pool = ACT_WORDS.filter(w => !used.has(w[0]));
  const pick = (pool.length ? pool : ACT_WORDS)[Math.floor(Math.random() * (pool.length || ACT_WORDS.length))];
  st.word = pick[0];
  st.cat = pick[1];
  st.used = [...(st.used || []), pick[0]].slice(-55);
  st.guesses = [];
  st.phase = 'play';
}

function roomInit(game) {
  if (game === 'act') {
    const st = { actor: 1, round: 1, score: [0, 0], skips: 0, guesses: [], used: [] };
    actNewWord(st);
    return st;
  }
  return { b: new Array(42).fill(0), t: 1, w: 0, d: 0, n: 0 };
}

/* تطبيق حركة على حالة الغرفة — الرد { error } لو الحركة مش مسموحة */
function roomAct(game, st, seat, action) {
  if (game === 'c4') {
    if (action && action.a === 'reset') { st.b = new Array(42).fill(0); st.t = 1; st.w = 0; st.d = 0; st.n = 0; return {}; }
    if (st.w || st.d) return { error: 'finished' };
    if (st.t !== seat) return { error: 'not-your-turn' };
    const col = Number(action && action.c);
    if (!(col >= 0 && col <= 6)) return { error: 'bad-move' };
    let row = -1;
    for (let r = 5; r >= 0; r--) if (!st.b[r * 7 + col]) { row = r; break; }
    if (row < 0) return { error: 'column-full' };
    st.b[row * 7 + col] = seat;
    st.n = (st.n || 0) + 1;
    const w = c4Winner(st.b);
    if (w) st.w = w;
    else if (st.n >= 42) st.d = 1;
    st.t = seat === 1 ? 2 : 1;
    return {};
  }

  /* التمثيل */
  if (!action) return { error: 'bad-action' };
  if (action.a === 'reset') { st.score = [0, 0]; st.actor = 1; st.round = 1; st.skips = 0; actNewWord(st); return {}; }
  if (action.a === 'skip') {
    if (seat !== st.actor) return { error: 'actor-only' };
    if (st.phase !== 'play') return { error: 'wait-next' };
    st.skips = (st.skips || 0) + 1;
    actNewWord(st);
    return {};
  }
  if (action.a === 'next') {
    if (st.phase !== 'done') return { error: 'not-finished' };
    st.round = (st.round || 1) + 1;
    st.actor = st.actor === 1 ? 2 : 1;
    actNewWord(st);
    return {};
  }
  if (action.a === 'guess') {
    if (st.phase !== 'play') return { error: 'finished' };
    if (seat === st.actor) return { error: 'actor-cannot-guess' };
    const text = String(action.text || '').trim().slice(0, 60);
    if (!text) return { error: 'empty' };
    const g = roomNorm(text), w = roomNorm(st.word);
    const ok = !!w && (g === w || (w.length >= 4 && g.length >= 3 && (w.includes(g) || g.includes(w))));
    st.guesses = [...(st.guesses || []), { seat, text, ok }].slice(-12);
    if (ok) {
      st.score[seat - 1] = (st.score[seat - 1] || 0) + 1;
      st.phase = 'done';
    }
    return {};
  }
  return { error: 'bad-action' };
}

function roomPublicState(game, st, seat) {
  if (game === 'c4') return { b: st.b, t: st.t, w: st.w, d: st.d, n: st.n };
  return {
    actor: st.actor, round: st.round, score: st.score, skips: st.skips,
    guesses: st.guesses || [], phase: st.phase,
    cat: st.cat, word: (seat === st.actor || st.phase === 'done') ? st.word : ''
  };
}

async function roomPlayers(env, code, viewerSub) {
  const now = Date.now();
  const rows = (await env.DB.prepare('SELECT sub, name, picture, seat, last_seen FROM room_players WHERE code = ? ORDER BY seat').bind(code).all()).results || [];
  return rows.map(r => ({
    sub: r.sub, name: r.name || 'لاعب', picture: r.picture || '', seat: r.seat,
    online: now - Number(r.last_seen || 0) < ONLINE_MS,
    seen: Number(r.last_seen || 0), me: r.sub === viewerSub
  }));
}

async function roomDrop(env, code) {
  try { await env.DB.prepare('DELETE FROM room_players WHERE code = ?').bind(code).run(); } catch (e) { }
  try { await env.DB.prepare('DELETE FROM rooms WHERE code = ?').bind(code).run(); } catch (e) { }
}

async function roomApi(request, env, a, url) {
  const user = await resolveUser(request, env, a);
  if (!user) return json({ error: 'sign-in-required' }, 401);
  await ensureDb(env);
  const now = Date.now();
  const p = url.pathname;

  if (p === '/api/room/create' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const game = body.game === 'act' ? 'act' : 'c4';
    try { await env.DB.prepare('DELETE FROM rooms WHERE updated_at < ?').bind(now - ROOM_TTL).run(); } catch (e) { }
    const mine = await env.DB.prepare('SELECT code FROM rooms WHERE host = ?').bind(user.sub).first();
    if (mine && mine.code) await roomDrop(env, mine.code);
    let code = '';
    for (let i = 0; i < 8; i++) {
      const c = makeRoomCode();
      const ex = await env.DB.prepare('SELECT 1 AS x FROM rooms WHERE code = ?').bind(c).first();
      if (!ex) { code = c; break; }
    }
    if (!code) return json({ error: 'busy' }, 503);
    await env.DB.prepare('INSERT INTO rooms (code, game, host, state, version, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)')
      .bind(code, game, user.sub, JSON.stringify(roomInit(game)), now, now).run();
    await env.DB.prepare('INSERT OR REPLACE INTO room_players (code, sub, name, picture, seat, last_seen) VALUES (?, ?, ?, ?, 1, ?)')
      .bind(code, user.sub, user.name || 'لاعب', user.picture || '', now).run();
    return json({ ok: true, code, game });
  }

  if (p === '/api/room/join' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!code) return json({ error: 'bad-code' }, 400);
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first();
    if (!room) return json({ error: 'not-found' }, 404);
    const already = await env.DB.prepare('SELECT seat FROM room_players WHERE code = ? AND sub = ?').bind(code, user.sub).first();
    if (already) {
      await env.DB.prepare('UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?').bind(now, code, user.sub).run();
      return json({ ok: true, code, game: room.game, seat: already.seat });
    }
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM room_players WHERE code = ?').bind(code).first();
    if (Number(count && count.n) >= 2) return json({ error: 'full' }, 409);
    await env.DB.prepare('INSERT INTO room_players (code, sub, name, picture, seat, last_seen) VALUES (?, ?, ?, ?, 2, ?)')
      .bind(code, user.sub, user.name || 'لاعب', user.picture || '', now).run();
    return json({ ok: true, code, game: room.game, seat: 2 });
  }

  if (p === '/api/room' && request.method === 'GET') {
    const code = String(url.searchParams.get('code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const room = code && await env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first();
    if (!room) return json({ error: 'not-found' }, 404);
    const me = await env.DB.prepare('SELECT * FROM room_players WHERE code = ? AND sub = ?').bind(code, user.sub).first();
    if (!me) return json({ error: 'not-member' }, 403);
    await env.DB.prepare('UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?').bind(now, code, user.sub).run();
    let st = {};
    try { st = JSON.parse(room.state); } catch (e) { st = roomInit(room.game); }
    const players = await roomPlayers(env, code, user.sub);
    return json({
      ok: true, code, game: room.game, version: room.version, host: room.host === user.sub,
      seat: me.seat, players, state: roomPublicState(room.game, st, me.seat)
    });
  }

  if (p === '/api/room/act' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const room = code && await env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first();
    if (!room) return json({ error: 'not-found' }, 404);
    const me = await env.DB.prepare('SELECT * FROM room_players WHERE code = ? AND sub = ?').bind(code, user.sub).first();
    if (!me) return json({ error: 'not-member' }, 403);
    if (Number(body.v) !== Number(room.version)) return json({ error: 'stale', version: room.version }, 409);
    const players = await roomPlayers(env, code, user.sub);
    if (players.length < 2) return json({ error: 'waiting' }, 409);
    let st = {};
    try { st = JSON.parse(room.state); } catch (e) { st = roomInit(room.game); }
    const r = roomAct(room.game, st, me.seat, body.action || {});
    if (r.error) return json({ error: r.error, version: room.version }, 409);
    const v = Number(room.version) + 1;
    await env.DB.prepare('UPDATE rooms SET state = ?, version = ?, updated_at = ? WHERE code = ?')
      .bind(JSON.stringify(st), v, now, code).run();
    await env.DB.prepare('UPDATE room_players SET last_seen = ? WHERE code = ? AND sub = ?').bind(now, code, user.sub).run();
    return json({ ok: true, version: v, state: roomPublicState(room.game, st, me.seat) });
  }

  if (p === '/api/room/leave' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const room = code && await env.DB.prepare('SELECT host FROM rooms WHERE code = ?').bind(code).first();
    if (!room) return json({ ok: true });
    if (room.host === user.sub) await roomDrop(env, code);
    else await env.DB.prepare('DELETE FROM room_players WHERE code = ? AND sub = ?').bind(code, user.sub).run();
    return json({ ok: true });
  }

  return json({ error: 'not-found' }, 404);
}

async function api(request, env, a) {
  const url = new URL(request.url);
  /* أي طلب بيغيّر حاجة لازم يكون من نفس أصل الموقع (ما عدا cron الإشعارات بمفتاحه) */
  const mutation = request.method !== 'GET' && request.method !== 'HEAD';
  const cron = url.pathname === '/api/push/check' && !!request.headers.get('x-push-key');
  if (mutation && !cron && !isSameOriginRequest(request, env.APP_ORIGIN)) {
    return new Response(null, { status: 403 });
  }
  if (url.pathname.startsWith('/api/room') && throttled('room:' + clientIp(request), 150, 60000)) {
    return json({ error: 'slow-down' }, 429);
  }
  /* حد عام لمسارات الحساب والمزامنة والإشعارات — 90 عملية/دقيقة لكل IP */
  if (!cron && (url.pathname.startsWith('/api/auth') || url.pathname === '/api/sync' ||
      url.pathname.startsWith('/api/push') || url.pathname === '/api/account/delete')) {
    if (throttled('acct:' + clientIp(request), 90, 60000)) return json({ error: 'slow-down' }, 429);
  }
  if (url.pathname.startsWith('/api/room')) return roomApi(request, env, a, url);

  if (url.pathname === '/api/auth/google' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = await request.json().catch(() => null);
    let p;
    try { p = await verifyGoogle(body && body.credential, GOOGLE_CLIENT_ID); }
    catch (e) { return json({ error: 'invalid-token' }, 401); }
    await ensureDb(env);
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const now = Date.now();
    const exp = now + SESSION_DAYS * 24 * 3600 * 1000;
    await env.DB.prepare(
      'INSERT INTO sessions (token_hash, sub, name, email, picture, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(await sha256hex(token), 'g:' + p.sub, p.name || '', p.email || '', p.picture || '', now, exp).run();
    const secure = url.protocol === 'https:' ? ' Secure;' : '';
    return new Response(JSON.stringify({
      ok: true,
      user: { sub: 'g:' + p.sub, name: p.name || '', email: p.email || '', picture: p.picture || '', via: 'google' },
    }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, no-store',
        'set-cookie': `snaces_sid=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 3600}`,
      },
    });
  }

  if (url.pathname === '/api/auth/signout' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const sid = getCookie(request, 'snaces_sid');
    if (sid) {
      await ensureDb(env);
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256hex(sid)).run();
    }
    const secure = url.protocol === 'https:' ? ' Secure;' : '';
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, no-store',
        'set-cookie': `snaces_sid=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`,
      },
    });
  }

  if (url.pathname === '/api/me') {
    const user = await resolveUser(request, env, a);
    if (!user) return json({ error: 'sign-in-required' }, 401);
    return json({ user: publicUser(user) });
  }

  if (url.pathname === '/api/sync' && request.method === 'GET') {
    const user = await resolveUser(request, env, a);
    if (!user) return json({ error: 'sign-in-required' }, 401);
    await ensureDb(env);
    const row = await env.DB.prepare('SELECT data, updated_at FROM profiles WHERE sub = ?').bind(user.sub).first();
    let data = null;
    if (row && row.data) { try { data = JSON.parse(row.data); } catch (e) { data = null; } }
    return json({ user: publicUser(user), data, updatedAt: row ? row.updated_at : 0 });
  }

  /* حذف بيانات الحساب السحابية بطلب من صاحبه */
  if (url.pathname === '/api/account/delete' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const user = await resolveUser(request, env, a);
    if (!user) return json({ error: 'sign-in-required' }, 401);
    await ensureDb(env);
    try { await env.DB.prepare('DELETE FROM profiles WHERE sub = ?').bind(user.sub).run(); } catch (e) { }
    try { await env.DB.prepare('DELETE FROM push_subs WHERE sub = ?').bind(user.sub).run(); } catch (e) { }
    try { await env.DB.prepare('DELETE FROM push_sent WHERE sub = ?').bind(user.sub).run(); } catch (e) { }
    try { await env.DB.prepare('DELETE FROM sessions WHERE sub = ?').bind(user.sub).run(); } catch (e) { }
    /* غرف اللعب: نشيل اللاعب من أي غرفة، ونقفل الغرف اللي هو مستضيفها */
    try {
      const hosted = (await env.DB.prepare('SELECT code FROM rooms WHERE host = ?').bind(user.sub).all()).results || [];
      for (const r of hosted) {
        await env.DB.prepare('DELETE FROM room_players WHERE code = ?').bind(r.code).run();
        await env.DB.prepare('DELETE FROM rooms WHERE code = ?').bind(r.code).run();
      }
      await env.DB.prepare('DELETE FROM room_players WHERE sub = ?').bind(user.sub).run();
    } catch (e) { }
    return json({ ok: true });
  }

  if (url.pathname === '/api/sync' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const user = await resolveUser(request, env, a);
    if (!user) return json({ error: 'sign-in-required' }, 401);
    const body = await request.json().catch(() => null);
    const data = body && body.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'bad-data' }, 400);
    const text = JSON.stringify(data);
    if (text.length > 200000) return json({ error: 'too-large' }, 413);
    await ensureDb(env);
    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO profiles (sub, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(sub) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).bind(user.sub, text, now).run();
    return json({ ok: true, updatedAt: now });
  }

  if (url.pathname === '/api/push/key') {
    if (!env.VAPID_PUBLIC_KEY) return json({ error: 'push-not-configured' }, 503);
    return new Response(JSON.stringify({ key: env.VAPID_PUBLIC_KEY }), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' },
    });
  }

  if (url.pathname === '/api/push/subscribe' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const endpoint = String(body.endpoint || '');
    const p256dh = String((body.keys && body.keys.p256dh) || '');
    const authKey = String((body.keys && body.keys.auth) || '');
    if (!/^https:\/\//.test(endpoint) || !p256dh || !authKey) return json({ error: 'bad-subscription' }, 400);
    const user = await resolveUser(request, env, a);
    const device = String(body.device || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const sub = user ? user.sub : device ? 'd:' + device : '';
    if (!sub) return json({ error: 'device-required' }, 400);
    await ensureDb(env);
    /* لو دخل بحساب، نشيل اشتراك الجهاز القديم عشان مايجيلوش إشعارين */
    if (user && device) await env.DB.prepare('DELETE FROM push_subs WHERE sub = ?').bind('d:' + device).run();
    const now = Date.now();
    await env.DB.prepare(
      `INSERT INTO push_subs (sub, endpoint, p256dh, auth, teams, names, comps, prefs, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(sub) DO UPDATE SET endpoint=excluded.endpoint, p256dh=excluded.p256dh, auth=excluded.auth,
         teams=excluded.teams, names=excluded.names, comps=excluded.comps, prefs=excluded.prefs, updated_at=excluded.updated_at`
    ).bind(
      sub, endpoint, p256dh, authKey,
      JSON.stringify((body.teams || []).slice(0, 30)),
      JSON.stringify((body.names || []).slice(0, 30)),
      JSON.stringify((body.comps || []).slice(0, 12)),
      JSON.stringify(body.prefs && typeof body.prefs === 'object' ? body.prefs : {}),
      now, now
    ).run();
    return json({ ok: true, scope: user ? 'user' : 'device' });
  }

  if (url.pathname === '/api/push/unsubscribe' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const body = (await request.json().catch(() => null)) || {};
    const user = await resolveUser(request, env, a);
    const device = String(body.device || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const sub = user ? user.sub : device ? 'd:' + device : '';
    if (!sub) return json({ error: 'device-required' }, 400);
    await ensureDb(env);
    await env.DB.prepare('DELETE FROM push_subs WHERE sub = ?').bind(sub).run();
    return json({ ok: true });
  }

  /* أسعار الفانتازي الحيّة (FPL) — بروكسي لأن واجهة FPL مش بتسمح بـCORS */
  if (url.pathname === '/api/fpl/prices' && request.method === 'GET') {
    await ensureDb(env);
    const row = await env.DB.prepare("SELECT v FROM kv_meta WHERE k = 'fpl_prices'").first();
    if (row && row.v) {
      try {
        const c = JSON.parse(row.v);
        if (Date.now() - c.t < 20 * 60e3) return json(c.d);
      } catch (e) { }
    }
    try {
      const r = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
        headers: { 'user-agent': 'Mozilla/5.0 SNACES', accept: 'application/json' },
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const b = await r.json();
      const prices = (b.elements || []).map(p => [
        p.id, p.now_cost || 0, p.cost_change_start || 0, p.cost_change_event || 0,
        p.cost_change_start_fall || 0, p.cost_change_event_fall || 0,
        p.transfers_in_event || 0, p.transfers_out_event || 0,
      ]);
      const cur = (b.events || []).find(e => e.is_current) || (b.events || []).find(e => e.is_next) || null;
      const d = { updated: new Date().toISOString(), event: cur ? { id: cur.id, name: cur.name, deadline_time: cur.deadline_time } : null, prices };
      await env.DB.prepare("INSERT INTO kv_meta (k, v) VALUES ('fpl_prices', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v")
        .bind(JSON.stringify({ t: Date.now(), d })).run();
      return json(d);
    } catch (e) {
      if (row && row.v) { try { return json(JSON.parse(row.v).d); } catch (e2) { } }
      return json({ error: 'fpl-unavailable' }, 503);
    }
  }

  /* إشعار تجريبي للتأكد إن الجهاز مسجّل فعلًا */
  if (url.pathname === '/api/push/test' && request.method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
    const pub = env.VAPID_PUBLIC_KEY, priv = env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) return json({ error: 'push-not-configured' }, 503);
    const body = (await request.json().catch(() => null)) || {};
    const user = await resolveUser(request, env, a);
    const device = String(body.device || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const sub = user ? user.sub : device ? 'd:' + device : '';
    if (!sub) return json({ error: 'device-required' }, 400);
    await ensureDb(env);
    const row = await env.DB.prepare('SELECT * FROM push_subs WHERE sub = ?').bind(sub).first();
    if (!row) return json({ error: 'not-subscribed' }, 404);
    try {
      const payload = await buildPushPayload(
        { data: JSON.stringify({ title: 'إشعار تجريبي 🔔', body: 'لو وصلت، يبقى إشعارات SNACES شغالة على الجهاز ده.', url: '/#/notifications' }), options: { ttl: 120, urgency: 'high' } },
        { endpoint: row.endpoint, expirationTime: null, keys: { p256dh: row.p256dh, auth: row.auth } },
        { subject: env.VAPID_SUBJECT || 'https://snaces-football-uiulk2.freebuff.site', publicKey: pub, privateKey: priv }
      );
      const res = await fetch(row.endpoint, payload);
      if (res.status === 404 || res.status === 410) {
        await env.DB.prepare('DELETE FROM push_subs WHERE sub = ?').bind(sub).run();
        return json({ error: 'subscription-expired' }, 410);
      }
      if (!res.ok) return json({ error: 'push-failed', status: res.status }, 502);
      return json({ ok: true });
    } catch (e) {
      return json({ error: 'push-failed' }, 502);
    }
  }

  /* إرسال الإشعارات: إما cron بمفتاح سري، أو نداء من التطبيق نفسه (مرة كل 4 دقايق لكل الموقع) */
  if (url.pathname === '/api/push/check' && request.method === 'POST') {
    const secret = request.headers.get('x-push-key') || '';
    const cron = !!(env.PUSH_TRIGGER_KEY && await timingSafeEqual(secret, env.PUSH_TRIGGER_KEY));
    if (!cron) {
      if (!isSameOriginRequest(request, env.APP_ORIGIN)) return new Response(null, { status: 403 });
      await ensureDb(env);
      const row = await env.DB.prepare("SELECT v FROM kv_meta WHERE k = 'push_run'").first();
      if (row && Date.now() - Number(row.v) < 240000) return json({ ok: true, skipped: true });
      await env.DB.prepare("INSERT INTO kv_meta (k, v) VALUES ('push_run', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v")
        .bind(String(Date.now())).run();
    }
    try {
      return json(await pushDispatch(env));
    } catch (e) {
      /* ممنوع خطأ الإشعارات يوقّع الصفحة كلها */
      return json({ ok: false, error: 'push-failed' }, 500);
    }
  }

  return json({ error: 'not-found' }, 404);
}

async function serve(request, env, url) {
  const res = await env.ASSETS.fetch(request);
  if (res.status !== 404) return res;
  /* أي مسار مش ملف → رجّع index.html (التطبيق بيقرا الـhash بنفسه) */
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
  }
  return res;
}

export default {
  async fetch(request, env) {
    try {
      return await setup(env)(request, env);
    } catch (e) {
      /* آخر خط دفاع: رد JSON بدل صفحة 502 من المنصة */
      return new Response(JSON.stringify({ error: 'server-error' }), {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
  },
};
