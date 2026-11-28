'use strict';
/* ============================================================
   إشعارات المباريات — المرحلة الأولى (جوّه التطبيق)
   بتنبهك لبداية ونهاية مباريات فرقك المتابعة (أندية/منتخبات)
   وهي شغالة: فحص كل 5 دقايق طول ما التطبيق مفتوح + عند الرجوع له.
   المرحلة الثانية (Web Push وانت برّه التطبيق) موثّقة في DEPLOY.md.
   ============================================================ */
const NOTIFY = (() => {
  const SKEY = 'snaces_notify';          /* الإعدادات */
  const LKEY = 'snaces_notify_log';      /* صندوق الإشعارات */
  const SEEN = 'snaces_notify_seen';     /* اللي اتبعت عشان ميتكررش */
  const DEF = { on: true, kick: true, res: true };
  const MAX_LOG = 40;
  const SEEN_TTL = 3 * 864e5;
  const SEEN_MAX = 400;

  /* تطبيع الأسماء للمقارنة (عربي/إنجليزي) */
  const nm = s => String(s || '').toLowerCase()
    .replace(/[أإآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^a-z0-9\u0600-\u06FF]/g, '');

  /* ---------- الإعدادات ---------- */
  const settings = () => Object.assign({}, DEF, ACC.get(SKEY, {}) || {});
  const saveSettings = p => { ACC.set(SKEY, Object.assign(settings(), p)); return settings(); };

  /* ---------- تفضيلات لكل فريق/بطولة: all | kick | off ---------- */
  const PKEY = 'snaces_notify_prefs';
  const prefs = () => {
    const p = ACC.get(PKEY, null) || {};
    return {
      t: (p.t && typeof p.t === 'object') ? p.t : {},
      c: (p.c && typeof p.c === 'object') ? p.c : {}
    };
  };
  const prefOf = (type, key) => prefs()[type][String(key)] || 'all';
  const setPref = (type, key, val) => {
    const p = prefs();
    p[type][String(key)] = val;
    ACC.set(PKEY, p);
    if (typeof PUSH !== 'undefined' && PUSH.isOn()) PUSH.sync();
    return p;
  };

  /* ---------- صندوق الإشعارات ---------- */
  const log = () => { const l = ACC.get(LKEY, []); return Array.isArray(l) ? l : []; };
  const saveLog = l => ACC.set(LKEY, l.slice(0, MAX_LOG));
  const unread = () => log().filter(x => !x.read).length;
  const markRead = () => { const l = log(); if (l.some(x => !x.read)) saveLog(l.map(x => Object.assign({}, x, { read: true }))); };
  const clear = () => ACC.set(LKEY, []);

  /* ---------- الفحص ---------- */
  let busy = false;
  const memo = new Map();   /* كاش لكل بطولة: {t, games} */

  async function compGames(code) {
    const id = LIVE_COMPS[code];
    if (!id) return [];
    const c = memo.get(code);
    if (c && Date.now() - c.t < 90000) return c.games;
    const qs = `appTypeId=5&langId=1&competitions=${id}`;
    const [cur, past] = await Promise.all([
      liveGet(`${LIVE_BASE}/games/current/?${qs}`).catch(() => null),
      liveGet(`${LIVE_BASE}/games/results/?${qs}&showOdds=false`).catch(() => null)
    ]);
    const out = [];
    const add = g => {
      if (!g) return;
      const h = g.homeCompetitor || {}, a = g.awayCompetitor || {};
      if (!h.id || !a.id) return;
      if (out.some(x => x.id === g.id)) return;
      const status = liveStatus(g);
      const hs = liveScore(h.score), as = liveScore(a.score);
      const scored = LIVE_SCORE_STATUS.includes(status) && hs != null && as != null;
      out.push({
        id: g.id, code, date: g.startTime, status,
        home: { id: String(h.id), name: h.name || '' },
        away: { id: String(a.id), name: a.name || '' },
        hg: scored ? hs : null,
        ag: scored ? as : null
      });
    };
    ((cur && cur.games) || []).forEach(add);
    ((past && past.games) || []).forEach(add);
    memo.set(code, { t: Date.now(), games: out });
    return out;
  }

  /* البطولات اللي ممكن تلعب فيها فرقك: متابعاتك + أي بطولة ظهر فيها فريق متابَع */
  async function compCodes(fv, ids, names) {
    const comps = new Set(fv.c || []);
    const all = await getJSON('data/matches.json');
    ((all && all.matches) || []).forEach(m => {
      const h = m.h || {}, a = m.a || {};
      if (ids.has(String(h.id)) || ids.has(String(a.id)) || names.has(nm(h.n)) || names.has(nm(a.n))) comps.add(m.l);
    });
    return [...comps].filter(c => LIVE_COMPS[c]).slice(0, 5);
  }

  async function check() {
    if (busy) return 0;
    const s = settings();
    if (!s.on) return 0;
    const fv = ACC.favs();
    const teams = [...(fv.k || []), ...(fv.n || [])];
    const ids = new Set(teams.map(x => String((x && x.id) || '')).filter(Boolean));
    const names = new Set(teams.map(x => nm(x && x.name)).filter(Boolean));
    if (!ids.size && !names.size) return 0;

    busy = true;
    try {
      const codes = await compCodes(fv, ids, names);
      if (!codes.length) return 0;

      const lists = await Promise.all(codes.map(c => compGames(c)));
      const games = lists.flat();
      if (!games.length) return 0;

      const seenObj = ACC.get(SEEN, null);
      const firstRun = !seenObj;
      const seen = Object.assign({}, seenObj || {});
      const now = Date.now();
      const fresh = [];
      const pr = prefs();
      /* حالة كل فريق متابَع في المباراة: all | kick | off */
      const teamModes = g => {
        const out = [];
        if (ids.has(g.home.id)) out.push(pr.t[g.home.id] || 'all');
        if (ids.has(g.away.id)) out.push(pr.t[g.away.id] || 'all');
        const byName = n => { const t2 = teams.find(x => nm(x.name) === nm(n)); return t2 ? (pr.t[String(t2.id)] || 'all') : null; };
        if (!ids.has(g.home.id) && names.has(nm(g.home.name))) { const m = byName(g.home.name); if (m) out.push(m); }
        if (!ids.has(g.away.id) && names.has(nm(g.away.name))) { const m = byName(g.away.name); if (m) out.push(m); }
        return out;
      };

      for (const g of games) {
        const rel = ids.has(g.home.id) || ids.has(g.away.id) ||
          names.has(nm(g.home.name)) || names.has(nm(g.away.name));
        if (!rel) continue;
        const cm = pr.c[g.code] || 'all';
        if (cm === 'off') continue;
        const tms = teamModes(g);
        if (tms.length && tms.every(m => m === 'off')) continue;
        const allowKick = !tms.length || tms.some(m => m !== 'off');
        const allowRes = cm === 'all' && (!tms.length || tms.some(m => m === 'all'));
        const t = Date.parse(g.date) || 0;
        const who = `${g.home.name} × ${g.away.name}`;
        const lg = LN[g.code] || g.code;

        /* بداية المباراة */
        if (s.kick && allowKick && g.status === 'IN_PLAY' && now - t < 3 * 3600e3) {
          const k = 'k:' + g.id;
          if (!seen[k]) {
            seen[k] = now;
            if (!firstRun) {
              fresh.push({
                k, kind: 'kick', t: now, read: false,
                title: '⚽ بدأت المباراة',
                body: `${who} — ${lg}`,
                href: `#/match?l=${encodeURIComponent(g.code)}&id=${encodeURIComponent(g.id)}`
              });
            }
          }
        }

        /* نتيجة المباراة */
        if (s.res && allowRes && g.status === 'FINISHED' && now - t < 12 * 3600e3 && g.hg != null && g.ag != null) {
          const k = 'r:' + g.id;
          if (!seen[k]) {
            seen[k] = now;
            if (!firstRun) {
              fresh.push({
                k, kind: 'res', t: now, read: false,
                title: '🏁 انتهت المباراة',
                body: `${g.home.name} ${g.hg} - ${g.ag} ${g.away.name} — ${lg}`,
                href: `#/match?l=${encodeURIComponent(g.code)}&id=${encodeURIComponent(g.id)}`
              });
            }
          }
        }
      }

      /* تقليم اللي اتبعت */
      const keep = Object.keys(seen)
        .filter(k => now - seen[k] < SEEN_TTL)
        .sort((a, b) => seen[b] - seen[a])
        .slice(0, SEEN_MAX);
      const pruned = {};
      keep.forEach(k => { pruned[k] = seen[k]; });
      ACC.set(SEEN, pruned);

      if (fresh.length) {
        fresh.sort((a, b) => a.kind === b.kind ? 0 : (a.kind === 'kick' ? -1 : 1));
        const take = fresh.slice(0, 5);
        saveLog([...take, ...log()]);
        toast(take[0].body);
        try { window.dispatchEvent(new CustomEvent('snaces:notify', { detail: take })); } catch (e) { }
        return take.length;
      }
      return 0;
    } catch (e) {
      return 0;
    } finally {
      busy = false;
    }
  }

  /* تشغيل الفحص الدوري */
  /* دفعة إرسال للسيرفر (هو نفسه بيحدد مرة كل 4 دقايق) */
  const kickPush = () => {
    if (navigator.onLine === false) return;
    fetch('/api/push/check', { method: 'POST', credentials: 'same-origin' }).catch(() => { });
  };

  function start() {
    const run = () => { if (document.visibilityState === 'visible') { check().catch(() => { }); kickPush(); } };
    setTimeout(run, 4000);
    setInterval(run, 5 * 60e3);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') setTimeout(run, 1200);
    });
    window.addEventListener('online', () => setTimeout(run, 1200));
  }

  return { settings, saveSettings, prefs, prefOf, setPref, log, unread, markRead, clear, check, start };
})();

/* ============ Web Push — إشعارات وانت برّه التطبيق ============ */
const PUSH = (() => {
  const DKEY = 'snaces_device';
  const ON = 'snaces_push_on';
  const b64 = s => {
    const t = String(s).replace(/-/g, '+').replace(/_/g, '/');
    const pad = t.length % 4 ? '='.repeat(4 - (t.length % 4)) : '';
    return Uint8Array.from(atob(t + pad), c => c.charCodeAt(0));
  };
  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const device = () => {
    let d = ACC.get(DKEY, '');
    if (!d) { d = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); ACC.set(DKEY, d); }
    return d;
  };
  async function registration() {
    try { return await navigator.serviceWorker.ready; } catch (e) { return null; }
  }
  async function current() {
    const r = await registration();
    if (!r) return null;
    try { return await r.pushManager.getSubscription(); } catch (e) { return null; }
  }
  /* فرقك وبطولاتك — السيرفر بيستخدمهم في تحديد مين يوصله إيه */
  async function targets() {
    const fv = ACC.favs();
    const list = [...(fv.k || []), ...(fv.n || [])];
    const teams = list.map(x => String(x.id || '')).filter(Boolean);
    const names = list.map(x => x.name || '').filter(Boolean);
    const comps = new Set((fv.c || []).map(c => LIVE_COMPS[c]).filter(Boolean));
    try {
      const d = await getJSON('data/matches.json');
      ((d && d.matches) || []).forEach(m => {
        const hid = (String((m.h && m.h.c) || '').match(/Competitors\/(\d+)/) || [])[1];
        const aid = (String((m.a && m.a.c) || '').match(/Competitors\/(\d+)/) || [])[1];
        if ((hid && teams.includes(hid)) || (aid && teams.includes(aid))) {
          const id = LIVE_COMPS[m.l];
          if (id) comps.add(id);
        }
      });
    } catch (e) { }
    /* تفضيلات لكل فريق/بطولة — السيرفر بيستخدمها وقت الإرسال */
    const pr = NOTIFY.prefs();
    const tPrefs = {};
    Object.entries(pr.t || {}).forEach(([id, v]) => { if (v && v !== 'all') tPrefs[id] = v; });
    const cPrefs = {};
    Object.entries(pr.c || {}).forEach(([code, v]) => { const id = LIVE_COMPS[code]; if (id && v && v !== 'all') cPrefs[id] = v; });
    return { teams, names, comps: [...comps].slice(0, 12), prefs: { t: tPrefs, c: cPrefs } };
  }
  async function save(s) {
    const t = await targets();
    const r = await fetch('/api/push/subscribe', {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ device: device(), endpoint: s.endpoint, keys: s.toJSON().keys, ...t })
    });
    return r.ok;
  }
  async function enable() {
    if (!supported()) return { ok: false, msg: 'المتصفح ده مش بيدعم إشعارات خارج التطبيق' };
    let perm = Notification.permission;
    if (perm !== 'granted') perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, msg: 'لازم توافق على الإشعارات من المتصفح' };
    const kr = await fetch('/api/push/key', { credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
    if (!kr || !kr.key) return { ok: false, msg: 'الإشعارات لسه مش متفعّلة على السيرفر' };
    const reg = await registration();
    if (!reg) return { ok: false, msg: 'جرّب تحديث الصفحة — الـService Worker مش جاهز' };
    let s = await current();
    if (!s) {
      try { s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(kr.key) }); }
      catch (e) { return { ok: false, msg: 'مقدرناش نسجّل الجهاز — جرّب من متصفح تاني' }; }
    }
    if (!(await save(s))) return { ok: false, msg: 'السيرفر رفض الاشتراك' };
    store.set(ON, true);
    fetch('/api/push/check', { method: 'POST', credentials: 'same-origin' }).catch(() => { });
    return { ok: true };
  }
  async function disable() {
    const s = await current();
    if (s) {
      try { await s.unsubscribe(); } catch (e) { }
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ device: device() })
        });
      } catch (e) { }
    }
    store.set(ON, false);
    return { ok: true };
  }
  async function sync() {
    const s = await current();
    if (s) await save(s).catch(() => { });
  }
  async function init() {
    if (!supported() || Notification.permission !== 'granted') return;
    const s = await current();
    if (s && store.get(ON, false)) sync();
  }
  async function test() {
    if (!isOn()) return { ok: false, msg: 'شغّل الإشعارات الأول' };
    const r = await fetch('/api/push/test', {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ device: device() })
    }).then(x => x.json()).catch(() => null);
    if (!r) return { ok: false, msg: 'مقدرناش نوصل للسيرفر' };
    if (r.ok) return { ok: true };
    if (r.error === 'subscription-expired') return { ok: false, msg: 'الاشتراك انتهى — اقفل الإشعارات وشغّلها تاني' };
    if (r.error === 'not-subscribed') return { ok: false, msg: 'الجهاز مش مسجّل — شغّل الإشعارات تاني' };
    return { ok: false, msg: 'السيرفر مردّش يبعت الإشعار' };
  }
  const isOn = () => supported() && Notification.permission === 'granted' && !!store.get(ON, false);
  return { supported, isOn, enable, disable, sync, init, current, test };
})();
NOTIFY.push = PUSH;

/* ============ شاشة الإشعارات ============ */
screen('notifications', {
  title: 'إشعارات المباريات', tab: 'more', back: true,
  async render(q, el) {
    const s = NOTIFY.settings();
    const rows = NOTIFY.log();
    const fv = ACC.favs();
    const teams = (fv.k || []).length + (fv.n || []).length;
    const pushOn = PUSH.isOn();
    const pushSupported = PUSH.supported();
    const teamsList = [...(fv.k || []), ...(fv.n || [])];
    const prefRow = (type, key, label) => {
      const cur = NOTIFY.prefOf(type, key);
      const opt = (val, txt) => `<button class="btn ${cur === val ? 'primary' : 'secondary'}" type="button" data-pref="${type}|${esc(key)}|${val}" style="padding:3px 8px;font-size:11px">${txt}</button>`;
      return `<div class="row"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span><span class="side" style="display:flex;gap:4px">${opt('all', 'الكل')}${opt('kick', 'بداية')}${opt('off', 'كتم')}</span></div>`;
    };
    const pushState = !pushSupported ? 'مش مدعوم في المتصفح'
      : Notification.permission === 'denied' ? 'المتصفح مانع الإشعارات'
        : pushOn ? 'متشغّلة' : 'مقفولة';

    el.innerHTML = `
      <div class="section">
        <div class="head"><h2>🔔 إشعارات المباريات</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="muted small" style="margin:0 0 10px">بنبهك أول ما مباراة لفريق من فرقك المتابعة تبدأ، ولما تخلص بنتيجتها. الفحص بيتم كل 5 دقايق طول ما التطبيق مفتوح.</p>
          ${teams ? `<div class="row"><span>فرقك المتابعة</span><span class="side"><b>${teams}</b></span></div>`
        : `<div class="row"><span>مفيش فرق في متابعاتك</span><span class="side"><a class="btn secondary" href="#/pick?t=k">أضف فريق</a></span></div>`}
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>📲 إشعارات وانت برّه التطبيق</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="muted small" style="margin:0 0 10px">بتخليك توصلك تنبيهات بداية ونتيجة مباريات فرقك حتى لو التطبيق مقفول.</p>
          <div class="row"><span>الحالة</span><span class="side"><b>${pushState}</b></span></div>
          ${pushSupported
        ? `<button class="btn ${pushOn ? 'secondary' : 'primary'}" id="pushBtn" type="button" style="width:100%;margin-top:10px">${pushOn ? 'إيقاف إشعارات خارج التطبيق' : 'تشغيل إشعارات خارج التطبيق'}</button>`
        : `<p class="muted tiny" style="margin:8px 0 0">على الآيفون: ثبّت التطبيق على الشاشة الرئيسية الأول (iOS 16.4+) عشان تقدر تشغّلها.</p>`}
          ${pushOn ? `<button class="btn secondary" id="pushTest" type="button" style="width:100%;margin-top:8px">إرسال إشعار تجريبي</button>` : ''}
          ${teams ? '' : '<p class="muted tiny" style="margin:8px 0 0">ضيف فرق في المفضلة الأول عشان تعرف تجيبلك مباريات مين.</p>'}
        </div>
      </div>

      <details class="fold">
        <summary><h2>🎛️ تحكم لكل فريق/بطولة</h2></summary>
        <div class="foldBody">
          <p class="muted tiny" style="margin:0 0 8px">الكل = بداية + نتيجة، بداية = بدون نتيجة، كتم = مفيش إشعارات.</p>
          ${(fv.c || []).length ? `<div class="head" style="margin:6px 0"><h2>🏆 بطولات</h2></div><div class="dataPanel">${(fv.c || []).map(code => prefRow('c', code, LN[code] || code)).join('')}</div>` : ''}
          ${teamsList.length ? `<div class="head" style="margin:10px 0 6px"><h2>🛡️ فرق</h2></div><div class="dataPanel">${teamsList.map(t => prefRow('t', t.id, t.name)).join('')}</div>` : ''}
          ${(!(fv.c || []).length && !teamsList.length) ? '<div class="empty">ضيف بطولات أو فرق في المفضلة الأول.</div>' : ''}
        </div>
      </details>

      <div class="section">
        <div class="head"><h2>⚙️ الإعدادات</h2></div>
        <div class="dataPanel">
          <div class="row"><span>الإشعارات كلها<br><small class="muted tiny">مفتاح رئيسي بيوقف كل حاجة</small></span><span class="side"><button class="btn ${s.on ? 'primary' : 'secondary'}" type="button" id="nOn" style="padding:4px 12px">${s.on ? 'شغال' : 'مطفي'}</button></span></div>
          <div class="row"><span>بداية المباريات</span><span class="side"><button class="btn ${s.kick ? 'primary' : 'secondary'}" type="button" id="nKick" style="padding:4px 12px" ${s.on ? '' : 'disabled'}>${s.kick ? 'شغال' : 'مطفي'}</button></span></div>
          <div class="row"><span>النتائج النهائية</span><span class="side"><button class="btn ${s.res ? 'primary' : 'secondary'}" type="button" id="nRes" style="padding:4px 12px" ${s.on ? '' : 'disabled'}>${s.res ? 'شغال' : 'مطفي'}</button></span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn primary" type="button" id="nNow" style="flex:1">افحص دلوقتي</button>
          <button class="btn secondary" type="button" id="nClear" style="flex:1">مسح الصندوق</button>
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>📥 الصندوق</h2>${rows.length ? `<span class="pill">${rows.length}</span>` : ''}</div>
        ${rows.length ? `<div class="dataPanel">${rows.map(x => `
          <a class="row ${x.read ? '' : 'nUnread'}" href="${x.href}">
            <span>${x.read ? '' : '<span class="nDot"></span>'}${esc(x.title)}<br><small class="muted tiny">${esc(x.body)}</small></span>
            <span class="side"><small class="muted tiny">${ago(new Date(x.t).toISOString())}</small> ‹</span>
          </a>`).join('')}</div>`
        : `<div class="dataPanel"><div class="empty">مفيش إشعارات لسه.<br><small class="muted">أول ما مباراة لفريق متابَع تبدأ هتلاقيها هنا.</small></div></div>`}
      </div>

      <div class="disclaimer">
        المرحلة الأولى: تنبيهات جوّه التطبيق. إشعارات Web Push (والتطبيق مقفول) محتاجة تفعيل السيرفر — الخطوات مكتوبة في DEPLOY.md.
      </div>`;

    const flip = (key) => {
      NOTIFY.saveSettings({ [key]: !NOTIFY.settings()[key] });
      render();
    };
    $('#nOn', el).onclick = () => {
      const on = !NOTIFY.settings().on;
      NOTIFY.saveSettings({ on });
      toast(on ? 'الإشعارات اتشغلت 🔔' : 'الإشعارات اتطفت 🔕');
      render();
    };
    $('#nKick', el).onclick = () => { flip('kick'); };
    $('#nRes', el).onclick = () => { flip('res'); };
    $('#nNow', el).onclick = async e => {
      e.target.disabled = true;
      e.target.textContent = 'بيتم الفحص…';
      const n = await NOTIFY.check();
      toast(n ? `وصل ${n} إشعار جديد 🔔` : 'مفيش جديد — كل حاجة متابَعة');
      render();
    };
    $('#nClear', el).onclick = () => { NOTIFY.clear(); toast('اتمسح ✓'); render(); };

    const pb = $('#pushBtn', el);
    if (pb) pb.onclick = async () => {
      pb.disabled = true;
      pb.textContent = 'بيتم…';
      if (PUSH.isOn()) {
        await PUSH.disable();
        toast('إشعارات خارج التطبيق اتقفلت');
      } else {
        const r = await PUSH.enable();
        toast(r.ok ? 'الإشعارات اتشغلت 🔔' : r.msg);
      }
      render();
    };

    const pt = $('#pushTest', el);
    if (pt) pt.onclick = async () => {
      pt.disabled = true;
      pt.textContent = 'بيتبعت…';
      const r = await PUSH.test();
      toast(r.ok ? 'الإشعار التجريبي اتبعت 🔔' : r.msg);
      pt.disabled = false;
      pt.textContent = 'إرسال إشعار تجريبي';
    };

    el.querySelectorAll('[data-pref]').forEach(b => b.onclick = () => {
      const [type, key, val] = b.dataset.pref.split('|');
      NOTIFY.setPref(type, key, val);
      b.parentElement.querySelectorAll('[data-pref]').forEach(x => {
        const v = x.dataset.pref.split('|')[2];
        x.className = 'btn ' + (v === val ? 'primary' : 'secondary');
        x.style.padding = '3px 8px';
        x.style.fontSize = '11px';
      });
      toast(val === 'off' ? 'مكتوم 🔕' : val === 'kick' ? 'بداية بس ⚽' : 'الكل 🔔');
    });

    /* أي إشعار مفتوح بيتعلّم كمقروء */
    NOTIFY.markRead();
  }
});
