'use strict';
/* ============================================================
   الحسابات — حساب لكل مستخدم على الجهاز
   بيحفظ: تشكيلة الفانتازي، البطولات المتابَعة، الستريك وأفضل النتائج
   ============================================================ */
const ACC = (() => {
  const USERS = 'snaces_users', SESS = 'snaces_session';
  const PKEY = ['snaces_squad', 'snaces_lv', 'snaces_day', 'snaces_streak', 'snaces_who', 'snaces_pred'];

  /* ---------- تشفير كلمات السر ----------
     PBKDF2-SHA256 فقط (150 ألف دورة). لو WebCrypto مش متاحة (http على شبكة محلية)
     بنرفض إنشاء حساب بكلمة سر جديدة بدل استخدام دالة تجزئة ضعيفة.
     الحسابات القديمة (djb2/slow) بتفضل شغالة وبتترقّى لـPBKDF2 أول دخول ناجح. */
  const hash = s => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  };
  const ITER = 150000;
  const rnd = n => {
    const a = new Uint8Array(n);
    (self.crypto || {}).getRandomValues ? self.crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.floor(Math.random() * 256));
    return a;
  };
  const b64 = a => btoa(String.fromCharCode(...a)).replace(/=+$/, '');
  const slow = (s, salt, rounds) => {
    let h = 2166136261;
    const str = salt + '|' + s;
    for (let r = 0; r < rounds; r++) {
      h ^= r;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
      h = ((h << 13) | (h >>> 19)) >>> 0;
    }
    return h.toString(36) + '.' + (h % 99991).toString(36);
  };
  async function derive(pin, name, salt, iter, kind) {
    const msg = name.toLowerCase() + '|' + String(pin).trim();
    if (kind === 'slow') return slow(msg, salt, 60000);
    const enc = new TextEncoder();
    const key = await self.crypto.subtle.importKey('raw', enc.encode(msg), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await self.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: iter, hash: 'SHA-256' }, key, 256);
    return b64(new Uint8Array(bits));
  }
  const canStrong = () => !!(self.crypto && self.crypto.subtle && self.isSecureContext !== false);
  async function makeHash(pin, name) {
    if (!canStrong()) {
      const e = new Error('crypto-unavailable');
      e.code = 'crypto-unavailable';
      throw e;
    }
    const salt = b64(rnd(16));
    const h = await derive(pin, name, salt, ITER, 'pbkdf2');
    return `pbkdf2$${ITER}$${salt}$${h}`;
  }
  async function checkHash(pin, name, stored) {
    const parts = String(stored || '').split('$');
    if (parts.length === 4) {
      const [kind, iter, salt, h] = parts;
      const calc = await derive(pin, name, salt, +iter, kind);
      return calc === h;
    }
    /* ترحيل الحسابات القديمة (djb2) — بيتقبل مرة واحدة وبعدها بيتحدّث */
    return stored === hash(name + '|' + pin);
  }
  const LOCK_STEP = 30000, LOCK_MAX = 600000, MAX_FAILS = 5;
  const lockLeft = u => Math.max(0, (u.lockUntil || 0) - Date.now());
  const users = () => store.get(USERS, []);
  const save = list => store.set(USERS, list);
  const me = () => {
    const id = store.get(SESS, null);
    return id ? users().find(u => u.id === id) || null : null;
  };
  const prefix = () => { const u = me(); return u ? 'u_' + u.id + '_' : ''; };

  /* ===== مزامنة سحابية (Sign in with Freebuff) ===== */
  const SYNC_KEYS = ['snaces_favs', 'snaces_follows', 'snaces_streak', 'snaces_day', 'snaces_lv', 'snaces_game', 'snaces_cat', 'snaces_squad', 'snaces_who', 'snaces_pred', 'snaces_qhist', 'snaces_week', 'snaces_pts', 'snaces_best_weekly'];
  const baseKey = k => k.replace(/^u_[a-z0-9]+_/i, '');
  let pushTimer = null;
  const cloud = { user: null, ready: false, pulled: false, init, push, signout, wipe, isOn: () => !!cloud.user };

  function snapshot() {
    const out = {};
    const add = k => {
      try { const raw = localStorage.getItem(prefix() + k); if (raw != null) out[k] = JSON.parse(raw); } catch (e) { }
    };
    SYNC_KEYS.forEach(add);
    Object.keys(localStorage).forEach(k => { const b = baseKey(k); if (b.startsWith('snaces_best_')) add(b); });
    return out;
  }
  function applyCloud(data) {
    let changed = false;
    Object.keys(data || {}).forEach(k => {
      if (!k.startsWith('snaces_')) return;
      const next = JSON.stringify(data[k]);
      if (localStorage.getItem(prefix() + k) !== next) { store.set(prefix() + k, data[k]); changed = true; }
    });
    return changed;
  }
  async function push(now) {
    if (!cloud.user) return;
    clearTimeout(pushTimer);
    const run = async () => {
      try {
        await fetch('/api/sync', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: snapshot() }) });
      } catch (e) { }
    };
    if (now) return run();
    pushTimer = setTimeout(run, 1000);
  }
  async function init() {
    if (cloud.ready) return cloud.pulled;
    cloud.ready = true;
    try {
      const r = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
      if (!r.ok) return false;
      const j = await r.json().catch(() => null);
      cloud.user = (j && j.user) || null;
      if (!cloud.user) return false;
      const s = await fetch('/api/sync', { credentials: 'same-origin', cache: 'no-store' });
      if (s.ok) {
        const d = await s.json();
        if (d && d.data && Object.keys(d.data).length) cloud.pulled = applyCloud(d.data);
        else await push(true);
      }
    } catch (e) { }
    return cloud.pulled;
  }
  /* حذف البيانات السحابية نهائيًا (المستخدم بيطلبها بنفسه) */
  async function wipe() {
    if (!cloud.user) return { ok: false, msg: 'مش مسجّل بحساب سحابي' };
    try {
      const r = await fetch('/api/account/delete', { method: 'POST', credentials: 'same-origin' });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || !j.ok) return { ok: false, msg: 'مقدرناش نحذف البيانات — جرّب تاني' };
      await signout();
      return { ok: true };
    } catch (e) { return { ok: false, msg: 'حصل خطأ في الاتصال' }; }
  }

  async function signout() {
    try { await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' }); } catch (e) { }
    try { await fetch('/auth/freebuff/signout', { method: 'POST', credentials: 'same-origin' }); } catch (e) { }
    cloud.user = null;
  }

  const get = (k, d) => store.get(prefix() + k, d);
  const set = (k, v) => {
    store.set(prefix() + k, v);
    if (cloud.user && (SYNC_KEYS.includes(k) || k.startsWith('snaces_best_'))) push();
  };
  const del = k => store.del(prefix() + k);

  /* نقل تقدّم الضيف لحساب جديد أول مرة */
  const migrate = id => {
    const p = 'u_' + id + '_';
    const copy = k => {
      if (localStorage.getItem(p + k) != null) return;
      const v = localStorage.getItem(k);
      if (v != null) store.set(p + k, JSON.parse(v));
    };
    PKEY.forEach(copy);
    try {
      Object.keys(localStorage).filter(k => k.startsWith('snaces_best_')).forEach(copy);
    } catch (e) { }
  };

  const signup = async (name, pin) => {
    name = String(name || '').trim();
    pin = String(pin || '').trim();
    if (name.length < 2) return { ok: false, msg: 'اكتب اسم من حرفين على الأقل' };
    if (pin.length < 6) return { ok: false, msg: 'الرقم السري 6 أرقام على الأقل (أقوى من 4)' };
    const list = users();
    if (list.some(u => u.name.toLowerCase() === name.toLowerCase())) return { ok: false, msg: 'الاسم ده موجود، جرّب اسم تاني أو سجّل دخول' };
    let ph;
    try { ph = await makeHash(pin, name); }
    catch (e) {
      if (e.code === 'crypto-unavailable') return { ok: false, msg: 'إنشاء كلمة سر آمن محتاج اتصال HTTPS. افتح الموقع بالرابط الرسمي أو استخدم تسجيل الدخول السحابي.' };
      return { ok: false, msg: 'تعذّر تأمين كلمة السر، جرّب تاني.' };
    }
    const u = { id: hash(name + '|' + Date.now() + '|' + b64(rnd(8))), name, ph, created: Date.now(), fails: 0, lockUntil: 0 };
    list.push(u);
    save(list);
    store.set(SESS, u.id);
    migrate(u.id);
    return { ok: true, user: u };
  };

  const login = async (name, pin) => {
    name = String(name || '').trim();
    const list = users();
    const u = list.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!u) return { ok: false, msg: 'مفيش حساب بالاسم ده' };
    const left = lockLeft(u);
    if (left > 0) return { ok: false, msg: `الحساب مقفول مؤقتًا — استنى ${Math.ceil(left / 1000)} ثانية` };
    const ok = await checkHash(pin, name, u.ph);
    if (!ok) {
      u.fails = (u.fails || 0) + 1;
      if (u.fails >= MAX_FAILS) {
        u.lockUntil = Date.now() + Math.min(LOCK_MAX, LOCK_STEP * (u.fails - MAX_FAILS + 1));
        u.fails = 0;
        save(list);
        return { ok: false, msg: 'محاولات كتير غلط — الحساب اتقفل ' + Math.round(lockLeft(u) / 1000) + ' ثانية' };
      }
      save(list);
      return { ok: false, msg: `الرقم السري غلط (باقي ${MAX_FAILS - u.fails} محاولات)` };
    }
    /* ترقية التشفير لو الحساب قديم (djb2 أو slow) — بعد التحقق من كلمة المرور فقط */
    if (!String(u.ph).startsWith('pbkdf2$') && canStrong()) {
      try { u.ph = await makeHash(pin, name); } catch (e) { }
    }
    u.fails = 0; u.lockUntil = 0; u.lastLogin = Date.now();
    save(list);
    store.set(SESS, u.id);
    migrate(u.id);
    return { ok: true, user: u };
  };

  /* ---------- دخول اجتماعي (Google / Facebook) ----------
     بيفضل محلي: بنحفظ معرّف الحساب بس، من غير ما نلمس كلمة سر. */
  const social = (provider, sub, name, email) => {
    if (!sub) return { ok: false, msg: 'معرّف الحساب مش وصل' };
    const ext = provider + ':' + sub;
    const list = users();
    let u = list.find(x => x.ext === ext);
    if (!u) {
      const base = String(name || '').trim() || (provider === 'google' ? 'حساب Google' : 'حساب Facebook');
      let nm = base.slice(0, 24), i = 2;
      while (list.some(x => x.name.toLowerCase() === nm.toLowerCase())) nm = base.slice(0, 22) + ' ' + i++;
      u = { id: hash(ext + Date.now()), name: nm, ph: 'oauth$' + ext, created: Date.now(), ext, email: email || '', fails: 0, lockUntil: 0 };
      list.push(u);
    }
    save(list);
    store.set(SESS, u.id);
    migrate(u.id);
    return { ok: true, user: u };
  };

  const logout = () => store.del(SESS);
  const remove = () => {
    const u = me();
    if (!u) return;
    save(users().filter(x => x.id !== u.id));
    try {
      Object.keys(localStorage).filter(k => k.startsWith('u_' + u.id + '_')).forEach(k => store.del(k));
    } catch (e) { }
    logout();
  };

  const follows = () => get('snaces_follows', []);
  const isFollowed = code => follows().includes(code);
  const toggleFollow = code => {
    const list = follows();
    const i = list.indexOf(code);
    if (i < 0) list.push(code); else list.splice(i, 1);
    set('snaces_follows', list);
    return i < 0;
  };

  /* ---------- المفضلات: بطولات (c) + أندية (k) + منتخبات (n) ---------- */
  const favEmpty = () => ({ c: [], k: [], n: [] });
  const favs = () => {
    const f = get('snaces_favs', null) || favEmpty();
    ['c', 'k', 'n'].forEach(t => { if (!Array.isArray(f[t])) f[t] = []; });
    /* ترحيل البطولات القديمة لمفضلة موحّدة */
    follows().forEach(code => { if (!f.c.includes(code)) f.c.push(code); });
    return f;
  };
  const keyOf = (type, item) => type === 'c' ? String(item) : String(item.id);
  const inFav = (type, item) => favs()[type].some(x => keyOf(type, x) === keyOf(type, item));
  const toggleFav = (type, item) => {
    const f = favs();
    const k = keyOf(type, item);
    const i = f[type].findIndex(x => keyOf(type, x) === k);
    if (i < 0) f[type].push(type === 'c' ? String(item) : { id: item.id, name: item.name, crest: item.crest || '', league: item.league || '' });
    else f[type].splice(i, 1);
    set('snaces_favs', f);
    if (type === 'c') set('snaces_follows', f.c.slice());
    return i < 0;
  };
  const addFav = (type, item) => { if (!inFav(type, item)) toggleFav(type, item); return true; };
  /* ترتيب يدوي: dir = -1 لفوق، +1 لتحت */
  const moveFav = (type, key, dir) => {
    const f = favs();
    const list = f[type];
    const i = list.findIndex(x => keyOf(type, x) === String(key));
    const j = i + (dir < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= list.length) return false;
    const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    set('snaces_favs', f);
    if (type === 'c') set('snaces_follows', f.c.slice());
    return true;
  };
  const clearFavs = () => { set('snaces_favs', favEmpty()); set('snaces_follows', []); };

  const bests = () => {
    const out = [];
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix() + 'snaces_best_'))
        .forEach(k => out.push({ k: k.slice((prefix() + 'snaces_best_').length), v: store.get(k, 0) }));
    } catch (e) { }
    return out.sort((a, b) => b.v - a.v);
  };

  /* ===== نسخة احتياطية مشفّرة ===== */
  const b64e = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const deriveBackupKey = async (pass, salt) => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  };
  const dl = (name, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const exportBackup = async (pass) => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); data[k] = localStorage.getItem(k); }
    const json = JSON.stringify({ v: 1, exportedAt: new Date().toISOString(), data });
    if (!crypto.subtle || !pass) { dl('snaces-backup.json', json, 'application/json'); return { ok: true, encrypted: false }; }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveBackupKey(pass, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(json));
    dl('snaces-backup.json', JSON.stringify({ v: 1, enc: 'aes-gcm', salt: b64e(salt), iv: b64e(iv), ct: b64e(ct) }), 'application/json');
    return { ok: true, encrypted: true };
  };
  const importBackup = async (file, pass) => {
    const text = await file.text();
    const obj = JSON.parse(text);
    let json;
    if (obj && obj.enc === 'aes-gcm') {
      if (!crypto.subtle) throw new Error('المتصفح لا يدعم التشفير');
      const salt = b64d(obj.salt), iv = b64d(obj.iv), ct = b64d(obj.ct);
      const key = await deriveBackupKey(pass || '', salt);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      json = new TextDecoder().decode(pt);
    } else { json = text; }
    const parsed = JSON.parse(json);
    if (!parsed || !parsed.data || typeof parsed.data !== 'object') throw new Error('ملف غير صالح');
    if (!confirm('سيتم استبدال جميع بياناتك على هذا الجهاز. متابعة؟')) return { ok: false, msg: 'ملغى' };
    localStorage.clear();
    Object.entries(parsed.data).forEach(([k, v]) => { if (typeof v === 'string') localStorage.setItem(k, v); });
    return { ok: true };
  };

  const stats = () => {
    const squad = get('snaces_squad', null) || {};
    const sk = get('snaces_streak', { count: 0, best: 0 });
    return {
      squad: Object.keys(squad).length,
      follows: follows().length,
      streak: sk.count || 0,
      best: sk.best || 0,
      who: get('snaces_who', 0),
      pred: Object.values(get('snaces_pred', {})).reduce((s, p) => s + (p.pts || 0), 0),
      bests: bests()
    };
  };

  return { users, me, signup, login, social, logout, remove, get, set, del, follows, isFollowed, toggleFollow,
    favs, inFav, toggleFav, addFav, moveFav, clearFavs, stats, exportBackup, importBackup, cloud };
})();

screen('account', {
  title: 'حسابي', tab: 'more', back: true,
  async render(q, el) {
    const u = ACC.me();

    const cloudCard = () => {
      const cu = ACC.cloud.user;
      if (cu) {
        const who = esc(cu.name || cu.email || 'حسابك');
        return `<div class="section">
          <div class="head"><h2>☁️ المزامنة السحابية</h2></div>
          <div class="dataPanel" style="padding:14px">
            <div class="row"><span>متصل بـ Freebuff</span><span class="side"><b>${who}</b></span></div>
            <p class="muted tiny" style="margin:8px 0 10px">المفضلة والستريك والتشكيلة بتتزامن تلقائيًا بين أجهزتك.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn secondary" id="cloudNow" type="button">مزامنة الآن</button>
              <button class="btn secondary" id="cloudOut" type="button">خروج من Freebuff</button>
              <button class="btn secondary" id="cloudWipe" type="button">حذف بياناتي السحابية</button>
            </div>
          </div>
        </div>`;
      }
      return `<div class="section">
        <div class="head"><h2>☁️ المزامنة السحابية</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="small" style="margin:0 0 10px">سجّل بحساب Freebuff عشان المفضلة والستريك والتشكيلة يتزامنوا بين أجهزتك. الحساب المحلي بيفضل شغال زي ما هو.</p>
          <a class="btn primary" href="/auth/freebuff/signin?returnTo=/" style="width:100%;display:block;text-align:center">تسجيل الدخول بـFreebuff</a>
        </div>
      </div>`;
    };
    /* حذف البيانات السحابية — موجود في كارت المزامنة في الحالتين */
    const wireWipe = () => {
      ['cloudWipe', 'cloudWipe2'].forEach(id => {
        const b = $('#' + id, el);
        if (!b) return;
        b.onclick = async () => {
          if (!confirm('هيتم حذف بياناتك السحابية نهائيًا: المفضلة، الستريك، التشكيلة، واشتراك الإشعارات. اللي على الجهاز مش هيتمسح. متأكد؟')) return;
          b.disabled = true;
          b.textContent = 'بيتم الحذف…';
          const r = await ACC.cloud.wipe();
          toast(r.ok ? 'اتحذفت بياناتك السحابية ✓' : r.msg);
          render();
        };
      });
    };

    const wireCloud = () => {
      wireWipe();
      const cn = $('#cloudNow', el);
      if (cn) cn.onclick = async () => {
        cn.disabled = true; cn.textContent = 'بيتم…';
        await ACC.cloud.push(true);
        cn.disabled = false; cn.textContent = 'مزامنة الآن';
        toast('تمت المزامنة ✅');
      };
      const co = $('#cloudOut', el);
      if (co) co.onclick = async () => {
        await ACC.cloud.signout();
        toast('خرجت من Freebuff');
        render();
      };
    };

    /* مسجّل بحساب Google/Freebuff: صفحة الحساب السحابي بدل فورم التسجيل */
    const cu0 = ACC.cloud.user;
    if (!u && cu0) {
      const fv0 = ACC.favs();
      const fl0 = fv0.c.filter(c => LN[c]);
      el.innerHTML = `
        <div class="dataPanel" style="padding:16px;margin-bottom:12px">
          <div class="lgTitle" style="gap:8px">
            ${cu0.picture ? `<img src="${esc(cu0.picture)}" alt="" width="38" height="38" style="border-radius:50%;object-fit:cover">` : '👤'}
            <b>${esc(cu0.name || 'حسابك')}</b>
            <span class="pill">${cu0.via === 'google' ? 'Google' : 'Freebuff'}</span>
          </div>
          ${cu0.email ? `<p class="muted tiny" style="margin:8px 0 0">${esc(cu0.email)}</p>` : ''}
        </div>

        <div class="section">
          <div class="head"><h2>⭐ مفضلتك</h2><a class="btn secondary" href="#/favorites">افتح</a></div>
          <div class="kpis k3">
            ${kpi('بطولات', fl0.length, 'green')}${kpi('أندية', fv0.k.length)}${kpi('منتخبات', fv0.n.length)}
          </div>
          <div class="dataPanel" style="margin-top:10px">
            ${(fl0.length || fv0.k.length || fv0.n.length) ? [...fl0.slice(0, 6).map(c => `<a class="row" href="#/league?l=${c}"><span>${esc(LN[c])}</span><span class="side">${esc(countryOf(c) || '')} ‹</span></a>`),
              ...fv0.k.slice(0, 4).map(c => `<a class="row" href="#/team?l=${encodeURIComponent(c.league || 'PL')}&id=${encodeURIComponent(c.id)}&n=${encodeURIComponent(c.name)}"><span>${esc(c.name)}</span><span class="side">نادي ‹</span></a>`),
              ...fv0.n.slice(0, 4).map(t => `<a class="row" href="#/team?l=WC&id=${encodeURIComponent(t.id)}&n=${encodeURIComponent(t.name)}"><span>${esc(t.name)}</span><span class="side">منتخب ‹</span></a>`)].join('')
              : `<div class="empty">لسه مفيش متابعات. <a class="btn secondary" href="#/pick">اختار بطولة أو نادي</a></div>`}
          </div>
          <a class="btn primary" href="#/pick" style="width:100%;margin-top:10px">➕ عدّل متابعاتك</a>
        </div>

        <div class="section">
          <div class="head"><h2>☁️ المزامنة</h2></div>
          <div class="dataPanel" style="padding:14px">
            <p class="muted tiny" style="margin:0 0 10px">بياناتك متزامنة مع حسابك — سجّل من أي جهاز وهتلاقي مفضلتك وستريكك وتشكيلتك.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn secondary" id="cloudNow" type="button">مزامنة الآن</button>
              <button class="btn secondary" id="cloudOut" type="button">خروج من الحساب</button>
              <button class="btn secondary" id="cloudWipe2" type="button">حذف بياناتي السحابية</button>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="head"><h2>الأقسام</h2></div>
          <div class="quick">
            <a href="#/fantasy"><i>🎮</i><span>الفانتازي<small>ابنِ تشكيلتك</small></span></a>
            <a href="#/challenges"><i>🎯</i><span>التحديات<small>ستريك وألعاب يومية</small></span></a>
            <a href="#/favorites"><i>⭐</i><span>المفضلات<small>كل اللي بتتابعه</small></span></a>
          </div>
        </div>

        <p class="footnote">حسابك متزامن سحابيًا. الخروج مش بيمسح بياناتك من حسابك.</p>`;
      wireCloud();
      return;
    }

    if (!u) {
      el.innerHTML = `
        <div class="heroCard" style="margin-bottom:14px">
          <div class="eyebrow">MY ACCOUNT</div>
          <h2>حسابك <span>على التطبيق</span></h2>
          <p>سجّل حسابك عشان تشكيلة الفانتازي والبطولات اللي بتتابعها والستريك بتاعك يتحفظوا باسمك.</p>
          <span class="ball" aria-hidden="true">👤</span>
        </div>

        ${cloudCard()}

        <div class="section">
          <div class="head"><h2>دخول سريع</h2></div>
          <div class="dataPanel" id="socialWrap" style="padding:12px;display:flex;flex-direction:column;gap:8px"></div>
        </div>

        <div class="section">
          <div class="head"><h2>إنشاء حساب</h2></div>
          <div class="dataPanel" style="padding:14px">
            <label class="small muted">الاسم</label>
            <input class="control" id="suName" placeholder="اسمك" style="width:100%;margin:6px 0 10px" autocomplete="username">
            <label class="small muted">رقم سري (6 أرقام على الأقل)</label>
            <input class="control" id="suPin" type="password" inputmode="numeric" placeholder="••••••" style="width:100%;margin:6px 0 12px" autocomplete="new-password">
            <button class="btn primary" id="suGo" type="button" style="width:100%">سجّل وابدأ</button>
            <p class="muted tiny" style="margin-top:8px">🔒 الرقم السري بيتخزن مُجزّأ (hash) بـPBKDF2 (150 ألف دورة + ملح عشوائي) على الجهاز ده، ومش بيتبعت لأي مكان. بعد 5 محاولات غلط الحساب بيتقفل مؤقتًا.<br>⚠️ الحساب المحلي للجهاز ده بس — للمزامنة بين الأجهزة استخدم «دخول Freebuff» بالأعلى.</p>
          </div>
        </div>

        <div class="section">
          <div class="head"><h2>دخول لحساب موجود</h2></div>
          <div class="dataPanel" style="padding:14px">
            <label class="small muted">الاسم</label>
            <input class="control" id="liName" placeholder="اسمك" style="width:100%;margin:6px 0 10px">
            <label class="small muted">الرقم السري</label>
            <input class="control" id="liPin" type="password" inputmode="numeric" placeholder="••••" style="width:100%;margin:6px 0 12px">
            <button class="btn secondary" id="liGo" type="button" style="width:100%">دخول</button>
          </div>
        </div>`;

      const su = $('#suGo', el), li = $('#liGo', el);
      su.onclick = async () => {
        su.disabled = true; su.textContent = 'بيتم التشفير…';
        try {
          const r = await ACC.signup($('#suName', el).value, $('#suPin', el).value);
          if (!r.ok) { toast(r.msg); su.disabled = false; su.textContent = 'سجّل وابدأ'; return; }
          toast('أهلًا ' + r.user.name + ' 👋');
          render();
        } catch (e) { su.disabled = false; su.textContent = 'سجّل وابدأ'; toast('حصل خطأ، جرّب تاني'); }
      };
      li.onclick = async () => {
        li.disabled = true; li.textContent = 'بيتم التحقق…';
        try {
          const r = await ACC.login($('#liName', el).value, $('#liPin', el).value);
          if (!r.ok) { toast(r.msg); li.disabled = false; li.textContent = 'دخول'; return; }
          toast('نورت تاني ' + r.user.name);
          render();
        } catch (e) { li.disabled = false; li.textContent = 'دخول'; toast('حصل خطأ، جرّب تاني'); }
      };

      /* دخول Google / Facebook — بيظهر لو الإعدادات فيها معرّفات */
      const cfg = window.SNACES_AUTH || {};
      const wrap = $('#socialWrap', el);
      const addSoc = (label, bg, color, fn) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn'; b.textContent = label;
        b.style.cssText = `width:100%;background:${bg};color:${color};border:1px solid ${color}33;font-weight:800`;
        b.onclick = () => fn(b);
        wrap.appendChild(b);
        return b;
      };

      const loadGis = () => new Promise((res, rej) => {
        if (window.google && google.accounts && google.accounts.id) return res();
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true; s.defer = true;
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });

      /* زر Google الرسمي — التوكن بيتحقق منه على السيرفر، مش في المتصفح */
      const googleButton = () => {
        const holder = document.createElement('div');
        holder.style.cssText = 'display:flex;justify-content:center;min-height:44px;width:100%';
        wrap.appendChild(holder);
        loadGis().then(() => {
          /* initialize مرة واحدة بس — النداء المتكرر بيطلع تحذير وبيتلغي الزر القديم */
          if (!window.__snacesGsi) {
            google.accounts.id.initialize({
              client_id: cfg.googleClientId,
              callback: async r => {
                try {
                  const res = await fetch('/api/auth/google', {
                    method: 'POST', credentials: 'same-origin',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ credential: r.credential })
                  });
                  if (!res.ok) { toast('فشل تسجيل الدخول بجوجل'); return; }
                  toast('تم تسجيل الدخول ✅');
                  setTimeout(() => location.reload(), 500);
                } catch (e) { toast('فشل تسجيل الدخول بجوجل'); }
              }
            });
            window.__snacesGsi = 1;
          }
          google.accounts.id.renderButton(holder, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 300, locale: 'ar' });
        }).catch(() => { holder.innerHTML = '<span class="muted tiny">مش قادر أحمّل زر Google</span>'; });
      };

      const fbLogin = b => {
        const load = () => new Promise((res, rej) => {
          if (window.FB) return res();
          window.fbAsyncInit = () => { FB.init({ appId: cfg.facebookAppId, cookie: true, xfbml: false, version: 'v19.0' }); res(); };
          const s = document.createElement('script');
          s.src = 'https://connect.facebook.net/ar_AR/sdk.js';
          s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
          s.onerror = rej; document.head.appendChild(s);
        });
        b.disabled = true;
        load().then(() => FB.login(res => {
          if (!res.authResponse) { b.disabled = false; return; }
          FB.api('/me', { fields: 'id,name,email' }, r => {
            const out = ACC.social('facebook', r && r.id, r && r.name, r && r.email);
            if (!out.ok) { toast(out.msg); b.disabled = false; return; }
            toast('أهلًا ' + out.user.name + ' 👋'); render();
          });
        }, { scope: 'public_profile,email' })).catch(() => { toast('مش قادر أفتح تسجيل Facebook'); b.disabled = false; });
      };

      if (cfg.googleClientId) googleButton();
      if (cfg.facebookAppId) addSoc('متابعة بحساب Facebook', '#1877f2', '#ffffff', fbLogin);
      if (!cfg.googleClientId && !cfg.facebookAppId) {
        wrap.innerHTML = '<p class="muted small" style="margin:0">الدخول الاجتماعي مش متاح حاليًا، استخدم الحساب العادي أو المزامنة السحابية.</p>';
      }
      wireCloud();
      return;
    }

    const st = ACC.stats();
    const fv = ACC.favs();
    const fl = fv.c.filter(c => LN[c]);
    const best = st.bests.slice(0, 6);

    el.innerHTML = `
      <div class="dataPanel" style="padding:16px;margin-bottom:12px">
        <div class="lgTitle"><b>👤 ${esc(u.name)}</b><span class="pill">عضو من ${new Date(u.created).toLocaleDateString('ar-EG')}</span></div>
        <div class="kpis" style="margin-top:12px">
          ${kpi('لاعبين في تشكيلتك', st.squad, 'green')}
          ${kpi('بطولات متابَعة', st.follows)}
          ${kpi('ستريك حالي', st.streak)}
          ${kpi('أفضل ستريك', st.best)}
        </div>
      </div>

      ${cloudCard()}

      <div class="section">
        <div class="head"><h2>⭐ مفضلتك</h2><a class="btn secondary" href="#/favorites">افتح</a></div>
        <div class="kpis k3">
          ${kpi('بطولات', fl.length, 'green')}${kpi('أندية', fv.k.length)}${kpi('منتخبات', fv.n.length)}
        </div>
        <div class="dataPanel" style="margin-top:10px">
          ${(fl.length || fv.k.length || fv.n.length) ? [...fl.slice(0, 6).map(c => `<a class="row" href="#/league?l=${c}"><span>${esc(LN[c])}</span><span class="side">${esc(countryOf(c) || '')} ‹</span></a>`),
            ...fv.k.slice(0, 4).map(c => `<a class="row" href="#/team?l=${encodeURIComponent(c.league || 'PL')}&id=${encodeURIComponent(c.id)}&n=${encodeURIComponent(c.name)}"><span>${esc(c.name)}</span><span class="side">نادي ‹</span></a>`),
            ...fv.n.slice(0, 4).map(t => `<a class="row" href="#/team?l=WC&id=${encodeURIComponent(t.id)}&n=${encodeURIComponent(t.name)}"><span>${esc(t.name)}</span><span class="side">منتخب ‹</span></a>`)].join('')
            : `<div class="empty">لسه مفيش متابعات. <a class="btn secondary" href="#/pick">اختار بطولة أو نادي</a></div>`}
        </div>
        <a class="btn primary" href="#/pick" style="width:100%;margin-top:10px">➕ عدّل متابعاتك</a>
      </div>

      <div class="section">
        <div class="head"><h2>🎮 تشكيلة الفانتازي</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="small" style="margin:0 0 10px">${st.squad ? `عندك ${st.squad} لاعب محفوظين باسمك.` : 'لسه مبنيش تشكيلة.'}</p>
          <a class="btn primary" href="#/fantasy">${st.squad ? 'كمّل تشكيلتك' : 'ابنِ تشكيلتك'}</a>
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>🎯 الستريك والتحديات</h2></div>
        <div class="dataPanel">
          <div class="row"><span>الستريك الحالي</span><span class="side"><b class="green">${st.streak} يوم</b></span></div>
          <div class="row"><span>أفضل ستريك</span><span class="side"><b>${st.best} يوم</b></span></div>
          <div class="row"><span>نقاط «من هو اللاعب»</span><span class="side"><b>${st.who}</b></span></div>
          <div class="row"><span>نقاط التوقعات</span><span class="side"><b>${st.pred}</b></span></div>
        </div>
        ${best.length ? `<div class="section" style="margin-top:10px">
          <div class="head"><h2>🏅 أفضل نتائجك</h2></div>
          <div class="dataPanel">${best.map(b => `<div class="row"><span>${esc(b.k.replace(/snaces_best_|_/g, ' ').trim())}</span><span class="side"><b>${b.v}</b></span></div>`).join('')}</div>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="head"><h2>💾 النسخة الاحتياطية</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="small" style="margin:0 0 10px">صدّر بياناتك (الحساب، المفضلة، الستريك، التشكيلة) إلى ملف — مشفّر بكلمة مرور إذا أردت — لاستعادتها على جهاز آخر.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn primary" id="bkExport" type="button">تصدير</button>
            <label class="btn secondary" style="cursor:pointer;margin:0">استيراد<input type="file" id="bkFile" accept="application/json,.json" hidden></label>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>الإعدادات</h2></div>
        <div class="dataPanel">
          <div class="row"><span>تسجيل الخروج</span><span class="side"><button class="btn secondary" id="out" type="button">خروج</button></span></div>
          <div class="row"><span>حذف الحساب<br><small class="muted tiny">بيمسح بياناتك المحفوظة على الجهاز</small></span><span class="side"><button class="btn secondary" id="delAcc" type="button">حذف</button></span></div>
        </div>
      </div>

      <p class="footnote">الحساب محلي على الجهاز ده (من غير سيرفر)، وكل مستخدم بياناته منفصلة عن التاني.</p>`;

    $('#out', el).onclick = () => { ACC.logout(); toast('خرجت من الحساب'); render(); };
    $('#delAcc', el).onclick = () => {
      if (!confirm('هتمسح حسابك وكل بياناته من الجهاز. متأكد؟')) return;
      ACC.remove();
      toast('اتمسح الحساب');
      render();
    };

    wireCloud();

    const bkExp = $('#bkExport', el);
    if (bkExp) bkExp.onclick = async () => {
      const pass = prompt('كلمة مرور للملف (اتركها فارغة لنسخة غير مشفّرة):');
      if (pass === null) return;
      bkExp.disabled = true; bkExp.textContent = 'بيتم التحضير…';
      try {
        const r = await ACC.exportBackup(pass);
        toast(r.encrypted ? 'تم التصدير (مشفّر) ✅' : 'تم التصدير (غير مشفّر)');
      } catch (e) { toast('فشل التصدير'); }
      bkExp.disabled = false; bkExp.textContent = 'تصدير';
    };
    const bkFile = $('#bkFile', el);
    if (bkFile) bkFile.onchange = async () => {
      const f = bkFile.files && bkFile.files[0]; if (!f) return;
      let pass = '';
      try { const peek = JSON.parse(await f.text()); if (peek && peek.enc === 'aes-gcm') { const p = prompt('كلمة مرور الملف:'); if (p === null) { bkFile.value = ''; return; } pass = p; } } catch (e) { }
      try {
        const r = await ACC.importBackup(f, pass);
        if (!r.ok) { toast(r.msg || 'ملغى'); bkFile.value = ''; return; }
        toast('تم الاستيراد — بيجيه تحديث...');
        setTimeout(() => location.reload(), 700);
      } catch (e) { toast('فشل الاستيراد: ' + (e && e.message ? e.message : '')); }
      bkFile.value = '';
    };
  }
});
