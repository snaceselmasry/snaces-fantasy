'use strict';
/* ============ المباريات — كل مباريات اليوم في شاشة واحدة ============ */
(function () {
  const DAYS = [['prev', 'أمس'], ['today', 'النهارده'], ['next', 'بكرة']];
  let lastData = null;         /* آخر نسخة ناجحة — عشان التحديث الفاشل ما يفضّيش الشاشة */
  let gen = 0;                 /* بيلغي أي رسم قديم لسه بيتنفذ */
  let timer = null;            /* مؤقت واحد بس، ملك الشاشة دي */
  let state = null;            /* { q, el } طول ما فيه تحديث دوري */
  let lastSig = '';            /* بصمة البيانات — لو مفيش تغيير منعيدش الرسم */

  const stopTimer = () => { if (timer) { clearTimeout(timer); timer = null; } };

  /* 60 ثانية لو فيه مباشر أو المصدر فشل، و180 ثانية للنتايج العادية */
  function schedule(q, el, delay) {
    stopTimer();
    state = delay ? { q, el } : null;
    if (state && document.visibilityState === 'visible') timer = setTimeout(tick, delay);
  }

  async function tick() {
    timer = null;
    if (!state) return;
    if (document.visibilityState !== 'visible' || parseHash().path !== 'matches' || !state.el.isConnected) { state = null; return; }
    await paint(state.q, state.el, 'auto');
  }

  /* الملف المحفوظ مش مصدر مباشر: أي IN_PLAY قديمة بتتعامل كمنتهية */
  function cleanSaved(m) {
    if (!m) return m;
    let s = String(m.s || m.status || 'UNKNOWN').toUpperCase();
    const t = Date.parse(m.d || '');
    if (s === 'IN_PLAY') {
      if (Number.isFinite(t) && t > Date.now() + 5 * 60e3) s = 'TIMED';
      else if (!Number.isFinite(t) || Date.now() - t > 4 * 3600e3) s = 'FINISHED';
    }
    return Object.assign({}, m, { s, status: s });
  }

  /* نسيب الشاشة → المؤقت يقف فورًا */
  window.addEventListener('hashchange', () => { gen++; stopTimer(); state = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return stopTimer();
    if (!state) return;
    if (!timer) timer = setTimeout(tick, 800);
  });

  async function paint(q, el, mode) {
    const me = ++gen;
    const fresh = !!mode;                 /* تحديث يدوي أو تلقائي */
    const keepY = fresh ? window.scrollY : 0;
    const data = (await getJSON('data/matches.json', fresh)) || lastData || { matches: [] };
    if (me !== gen) return;
    if (Array.isArray(data.matches)) lastData = data;

    let all = (Array.isArray(data.matches) ? data.matches : []).map(cleanSaved);
    const meta = (await getJSON('data/meta.json')) || {};
    if (me !== gen) return;
    let updated = data.updated || meta.updated;
    let liveSource = false;
    let liveMeta = null;
    let sourceTried = false;

    const day = DAYS.some(d => d[0] === q.day) ? q.day : 'today';
    /* الافتراضي: متابعاتك بس. لو المستخدم مش مختار أي متابعة بنعرض الكل مع تنبيه */
    const wantFav = q.fav !== '0';
    const keyOf = iso => new Date(iso).toLocaleDateString('en-CA');
    const today = dayKey();
    const target = day === 'prev' ? yest(today)
      : day === 'next' ? (() => { const d = new Date(today + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toLocaleDateString('en-CA'); })()
        : today;

    const fv = (typeof ACC !== 'undefined' && ACC.favs) ? ACC.favs() : { c: [], k: [], n: [] };
    const favComps = new Set(fv.c || []);
    const cid = u => { const m = String(u || '').match(/Competitors\/(\d+)/); return m ? m[1] : ''; };
    const favTeams = [...(fv.k || []), ...(fv.n || [])].filter(Boolean);
    const favIds = new Set(favTeams.map(t => String(t.id)).filter(Boolean));
    const favNames = new Set(favTeams.map(t => t.name).filter(Boolean));
    /* ترتيب المفضلة اليدوي: البطولات والفرق */
    const compOrder = new Map((fv.c || []).map((c, i) => [c, i]));
    const teamOrder = new Map(favTeams.map((t, i) => [String(t.id), i]));
    const rankTeam = m => Math.min(
      teamOrder.has(cid(m.h.c)) ? teamOrder.get(cid(m.h.c)) : 999,
      teamOrder.has(cid(m.a.c)) ? teamOrder.get(cid(m.a.c)) : 999
    );
    const isFavTeam = t => !!t && (favIds.has(cid(t.c)) || favIds.has(String(t.id || '')) || favNames.has(t.n));
    const hasFav = favComps.size > 0 || favIds.size > 0;
    const onlyFav = wantFav && hasFav;

    /* المصدر الحي: كل البطولات المدعومة في طلب واحد مشترك (بدون حد 16). */
    if (typeof liveMatchesFor === 'function') {
      sourceTried = true;
      const lm = await liveMatchesFor(null, { force: fresh }).catch(() => null);
      if (me !== gen) return;
      if (lm) {
        liveSource = true;
        liveMeta = lm.meta || null;
        if (lm.meta && lm.meta.fetchedAt) updated = lm.meta.fetchedAt;
        all = liveMerge(all, lm);
      }
    }
    const stale = !!(liveMeta && liveMeta.stale);

    let list = all.filter(m => keyOf(m.d) === target).map(cleanSaved);
    if (onlyFav) list = list.filter(m => favComps.has(m.l) || isFavTeam(m.h) || isFavTeam(m.a));
    /* عدد المباشر بيتحسب من اللي معروض فعلاً — عشان الشريط ما يعدّش ماتشات مخفية بالفلتر */
    /* لو النسخة قديمة/فاشلة ما نوصفهاش كمباشرة محدثة */
    const liveCount = stale ? 0 : list.filter(m => m.s === 'IN_PLAY').length;
    const staleLive = stale ? list.filter(m => m.s === 'IN_PLAY').length : 0;
    const liveTxt = liveCount === 1 ? 'مباراة مباشرة' : liveCount === 2 ? 'مباراتين مباشرتين' : 'مباريات مباشرة';

    /* المباشر الأول، وبعدها ترتيب المفضلة (في «متابعاتي»)، وبعدها الوقت */
    list.sort((a, b) => {
      const la = a.s === 'IN_PLAY' ? 0 : 1, lb = b.s === 'IN_PLAY' ? 0 : 1;
      if (la !== lb) return la - lb;
      if (onlyFav) { const ra = rankTeam(a), rb = rankTeam(b); if (ra !== rb) return ra - rb; }
      return Date.parse(a.d) - Date.parse(b.d);
    });

    const groups = new Map();
    for (const m of list) {
      if (!groups.has(m.l)) groups.set(m.l, []);
      groups.get(m.l).push(m);
    }
    const groupKeys = [...groups.keys()].sort((a, b) => {
      if (onlyFav) {
        const ia = compOrder.has(a) ? compOrder.get(a) : 999;
        const ib = compOrder.has(b) ? compOrder.get(b) : 999;
        if (ia !== ib) return ia - ib;
      }
      const fa = favComps.has(a) ? 0 : 1, fb = favComps.has(b) ? 0 : 1;
      return fa - fb || (LN[a] || a).localeCompare(LN[b] || b, 'ar');
    });

    const timeOf = iso => new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const rowHTML = m => {
      const hasScore = typeof liveHasScore === 'function' ? liveHasScore(m) : (m.hg != null && m.ag != null);
      const isLive = m.s === 'IN_PLAY' && !stale;
      const lab = isLive ? '' : (typeof liveStatusLabel === 'function' ? liveStatusLabel(m.s) : '');
      const score = hasScore ? `${m.hg} - ${m.ag}` : (m.s === 'FINISHED' ? '—' : timeOf(m.d));
      const badge = isLive
        ? (typeof liveClockHtml === 'function' ? liveClockHtml(m) : `<span class="liveBadge">مباشر${m.gameTime ? ' ' + m.gameTime + "'" : ''}</span>`)
        : m.s === 'IN_PLAY' && stale ? '<span class="muted tiny">آخر حالة: مباشر</span>'
        : lab ? `<span class="muted tiny">${lab}</span>` : '';
      return `<a class="row mRow" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
        <span class="mTeams">
          <span class="mTeam">${crest(m.h.c)}${esc(m.h.n)}</span>
          <span class="mTeam">${crest(m.a.c)}${esc(m.a.n)}</span>
        </span>
        <span class="side mScore">
          <b class="${isLive ? 'green' : ''}">${esc(score)}</b>
          ${badge}
        </span>
      </a>`;
    };

    const delay = (liveCount || stale) ? 60000
      : sourceTried && !liveSource ? (navigator.onLine === false ? 180000 : 60000)
      : liveSource ? 180000 : 0;
    const stampTxt = updated
      ? (stale ? 'آخر تحديث ناجح: ' : 'آخر تحديث: ') + new Date(updated).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '';
    const sourceTxt = stale
      ? '⚠️ المصدر الحي مش متاح دلوقتي — المعروض آخر نسخة سليمة، ومش وصف مباشر للحالة الحالية'
      : liveSource ? 'نتايج ومواعيد من المصدر الحي — بتتحدّث تلقائيًا'
      : 'المصدر الحي مش متاح — المعروض نسخة محفوظة وليست مباشرة';

    /* مفيش تغيير في المباريات؟ منعيدش الرسم — بنحدّث وقت آخر تحديث بس */
    const sig = `${day}|${onlyFav}|${stale ? 1 : 0}|${list.map(m => m.id + ':' + m.s + ':' + m.hg + '-' + m.ag).join(',')}`;
    if (mode === 'auto' && sig === lastSig) {
      /* الساعة بتتحدّث من الكائنات الجديدة حتى لو ما أعدناش رسم الصفوف */
      if (typeof liveClockRemember === 'function') list.forEach(m => { if (m.s === 'IN_PLAY') liveClockRemember(m); });
      const stamp = $('#mUpdated', el);
      if (stamp) stamp.textContent = stampTxt;
      const note = $('#mSourceNote', el);
      if (note) note.textContent = sourceTxt;
      schedule(q, el, delay);
      return;
    }
    lastSig = sig;
    if (typeof liveClockRemember === 'function') list.forEach(m => { if (m.s === 'IN_PLAY') liveClockRemember(m); });

    el.innerHTML = `
      <div class="cmpBar" style="margin-bottom:8px">
        ${DAYS.map(([k, label]) => `<button class="btn ${k === day ? 'primary' : 'secondary'}" type="button" data-day="${k}">${label}</button>`).join('')}
      </div>
      <div class="between" style="margin-bottom:10px;gap:8px">
        <div class="muted tiny"><span id="mUpdated">${stampTxt}</span><br><span id="mSourceNote">${sourceTxt}</span></div>
        <div style="display:flex;gap:6px">
          <button class="btn ${onlyFav ? 'primary' : 'secondary'}" id="favOnly" type="button" style="padding:6px 10px">${onlyFav ? '⭐ متابعاتي' : '🌍 كل المباريات'}</button>
          <button class="btn secondary" id="refresh" type="button" style="padding:6px 10px" aria-label="تحديث">↻</button>
        </div>
      </div>
      ${stale ? `<div class="dataPanel" style="padding:12px;margin-bottom:10px;border-color:#8a6d1f">⚠️ تعذّر الوصول للمصدر الحي. المعروض آخر نسخة سليمة${updated ? ' من ' + new Date(updated).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}، وممكن تكون النتايج اتغيرت.${staleLive ? ' فيه ' + staleLive + ' مباراة كانت مباشرة في النسخة دي.' : ''}</div>` : ''}
      ${hasFav ? '' : `<div class="dataPanel" style="padding:12px;margin-bottom:10px"><a href="#/pick">➕ اختار بطولاتك وفرقك المفضلة — وبعدها هتشوف مبارياتهم هنا بس</a></div>`}
      ${liveCount ? `<div class="liveBar">🔴 ${liveCount} ${liveTxt} — بيتحدّث تلقائيًا كل دقيقة</div>` : ''}
      ${groups.size ? groupKeys.map(code => `
        <div class="section">
          <div class="head"><h2>${esc(LN[code] || code)}</h2><a class="btn secondary" href="#/league?l=${encodeURIComponent(code)}">البطولة</a></div>
          <div class="dataPanel">${groups.get(code).map(rowHTML).join('')}</div>
        </div>`).join('')
        : `<div class="empty" style="margin-top:20px">مفيش مباريات ${day === 'today' ? 'النهارده' : day === 'prev' ? 'امبارح' : 'بكرة'}${onlyFav ? ' في متابعاتك' : ''}.<br><small class="muted">جرّب يوم تاني أو شيل فلتر «متابعاتي».</small></div>`}
    `;

    el.querySelectorAll('[data-day]').forEach(b => b.onclick = () => go('matches', { day: b.dataset.day, fav: onlyFav ? '1' : '0' }));
    $('#favOnly', el).onclick = () => go('matches', { day, fav: onlyFav ? '0' : '1' });
    const btn = $('#refresh', el);
    btn.onclick = async () => {
      btn.disabled = true;
      await paint(q, el, true);
      toast('اتحدّثت البيانات ✓');
    };

    /* الحفاظ على مكان التمرير عند أي تحديث (يدوي أو تلقائي) */
    if (fresh && keepY) {
      try { window.scrollTo({ top: keepY, left: 0, behavior: 'instant' }); }
      catch (e) { window.scrollTo(0, keepY); }
    }

    schedule(q, el, delay);
  }

  screen('matches', {
    title: 'المباريات', tab: 'matches',
    render(q, el) { return paint(q, el, false); }
  });
})();
