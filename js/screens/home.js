'use strict';
/* ============ الرئيسية ============ */
let HOME_TIMER = null;
let HOME_CTX = null;
let HOME_GEN = 0;
const stopHomeTimer = () => { if (HOME_TIMER) { clearTimeout(HOME_TIMER); HOME_TIMER = null; } };
window.addEventListener('hashchange', () => { stopHomeTimer(); HOME_CTX = null; });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && HOME_CTX && HOME_CTX.el.isConnected && parseHash().path === 'home') HOME_CTX.fill(false);
});
screen('home', {
  title: '', tab: 'home',
  async render(q, el) {
    stopHomeTimer();
    const homeGen = ++HOME_GEN;
    const GAMES_N = typeof G !== 'undefined' ? Math.max(0, G.length - 2) : 11;
    const [h, meta, ha, news] = await Promise.all([
      getJSON('data/home.json'),
      getJSON('data/meta.json'),
      getJSON('data/home-arab.json'),
      newsItems().catch(() => [])
    ]);

    const sk = store.get('snaces_streak', { last: '', count: 0 });
    const today = dayKey();
    const alive = sk.count > 0 && (sk.last === today || sk.last === yest(today));

    /* متصدرو البطولات: من البيانات الحيّة لو الكاش طازة، وإلا من الملف */
    const L = cachedLeaders();
    const leaders = (L && L.eu && L.eu.length ? L.eu : (h && h.leaders)) || [];
    const arLeaders = (L && L.ar && L.ar.length ? L.ar : (ha && ha.leaders)) || [];
    /* القادم من الملف المحفوظ مش مصدر حي: نستبعد أي مباراة بدأت بالفعل */
    const next = ((h && h.next) || []).filter(m => Date.parse(m.d) > Date.now() - 5 * 60e3);
    const items = (Array.isArray(news) ? news : (news && news.items) || []).slice(0, 4);

    const updatedAt = meta && meta.updated ? Date.parse(meta.updated) : 0;
    const staleH = updatedAt ? (Date.now() - updatedAt) / 36e5 : 0;
    const whenTxt = updatedAt ? new Date(updatedAt).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const updated = !updatedAt ? ''
      : meta.partial ? '⚠️ بعض البطولات بآخر نسخة سليمة — ' + whenTxt
      : staleH > 24 ? '⚠️ بيانات بتاريخ ' + whenTxt
      : 'آخر تحديث: ' + whenTxt;

    el.innerHTML = `
    <div class="heroCard">
      <div class="heroArt" style="background-image:url('assets/hero.jpg')" aria-hidden="true"></div>
      <div class="hc">
        <div class="eyebrow">MATCHES • TABLES • ANALYSIS</div>
        <h2>تابع الكورة<br><span>بالأرقام.</span></h2>
        <p>بطولات عربية وأوروبية، تحليل وتوقع كل مباراة، فانتازي، وأسئلة وتحديات يومية.</p>
        <div class="actions">
          <a class="btn primary" href="#/matches">المباريات</a>
          <a class="btn secondary" href="#/challenges">تحدي اليوم 🎯</a>
        </div>
      </div>
    </div>

    <a class="streakCard" href="#/challenges">
      <span class="big">${alive ? sk.count : 0}</span>
      <span>
        <b>${alive ? 'سلسلتك الحالية 🔥' : 'ابدأ سلسلتك 🔥'}</b>
        <small>${alive ? 'كمّل النهارده عشان السلسلة تكبر' : '5 أسئلة جديدة كل يوم + ' + GAMES_N + ' لعبة'}</small>
      </span>
      <span class="chev">‹</span>
    </a>

    <div class="section" id="homeLive" hidden>
      <div class="head"><h2 id="homeLiveTitle">🔴 مباشر الآن</h2><a class="btn secondary" href="#/matches">الكل</a></div>
      <div class="muted tiny" id="homeLiveNote" style="margin:-4px 0 6px"></div>
      <div class="dataPanel" id="homeLiveList"></div>
    </div>

    <div class="section" id="homeResults" hidden>
      <div class="head"><h2>📊 أهم نتائج اليوم</h2><a class="btn secondary" href="#/matches">الكل</a></div>
      <div class="muted tiny" id="homeResultsNote" style="margin:-4px 0 6px"></div>
      <div class="dataPanel" id="homeResultsList"></div>
    </div>

    <div class="section">
      <div class="head"><h2>🏅 متصدرو الدوريات العربية</h2><a class="btn secondary" href="#/arab">الكل</a></div>
      ${arLeaders.length
        ? `<div class="chips">${arLeaders.map(x => `
            <a class="kpi leadcard" href="#/league?l=${x.l}">
              <small>${LN[x.l] || x.l}</small>
              <strong>${crest(x.c)}${esc(x.n)}</strong>
              <small>${x.pts} نقطة • ${x.p} مباراة</small>
            </a>`).join('')}</div>`
        : emptyBox('البيانات العربية مش متاحة حاليًا.')}
    </div>

    <div class="section">
      <div class="head"><h2>🥇 متصدرو الدوريات الأوروبية</h2><p>${updated}</p></div>
      ${leaders.length
        ? `<div class="chips">${leaders.map(x => `
            <a class="kpi leadcard" href="#/league?l=${x.l}">
              <small>${LN[x.l] || x.l}</small>
              <strong>${crest(x.c)}${esc(x.n)}</strong>
              <small>${x.pts} نقطة • ${x.p} مباراة</small>
            </a>`).join('')}</div>`
        : emptyBox('البيانات مش متاحة حاليًا.')}
    </div>

    <div class="section">
      <div class="head"><h2>📅 مباريات قادمة</h2><a class="btn secondary" href="#/leagues">الكل</a></div>
      <div class="dataPanel" id="homeNextList">
        ${next.length ? next.slice(0, 5).map(m => `
          <a class="row" href="#/match?l=${m.l}&id=${m.id}">
            <span>${crest(m.hc)}${esc(m.h)} <span class="muted">ضد</span> ${crest(m.ac)}${esc(m.a)}</span>
            <span class="side">${dt(m.d)}<span class="lg">${LN[m.l] || m.l}</span></span>
          </a>`).join('') : '<div class="empty">لا توجد مباريات قادمة.</div>'}
      </div>
    </div>

    <div class="section">
      <div class="head"><h2>⭐ مباريات بطولاتك</h2><a class="btn secondary" href="#/pick">عدّل</a></div>
      <div class="dataPanel" id="homeMineList">
        ${(() => {
          const favs = (typeof ACC !== 'undefined' && ACC.follows) ? ACC.follows() : [];
          const mine = favs.length ? next.filter(m => favs.includes(m.l)) : [];
          if (!favs.length) return '<div class="empty">لم تتابع أي بطولة بعد. <a href="#/pick">اختار</a></div>';
          if (!mine.length) return '<div class="empty">لا توجد مباريات قادمة لبطولاتك حالياً.</div>';
          return mine.slice(0, 6).map(m => `
            <a class="row" href="#/match?l=${m.l}&id=${m.id}">
              <span>${crest(m.hc)}${esc(m.h)} <span class="muted">ضد</span> ${crest(m.ac)}${esc(m.a)}</span>
              <span class="side">${dt(m.d)}<span class="lg">${LN[m.l] || m.l}</span></span>
            </a>`).join('');
        })()}
      </div>
    </div>

    <div class="section">
      <div class="head"><h2>📰 آخر الأخبار</h2><a class="btn secondary" href="#/news">الكل</a></div>
      <div class="dataPanel">
        ${items.length ? items.map(i => `
          <a class="row" href="${esc(i.u || '#/news')}" ${i.u ? 'target="_blank" rel="noopener noreferrer"' : ''}>
            <span>${esc(i.t)}</span>
            <span class="side">${esc(i.s || '')}<span class="tiny">${ago(i.d)}</span></span>
          </a>`).join('') : '<div class="empty">لا توجد أخبار حاليًا.</div>'}
      </div>
    </div>

    <div class="section">
      <div class="head"><h2>الأقسام</h2></div>
      <div class="quick">
        <a href="#/arab"><i>🌍</i><span>العالم العربي<small>بطولات ومباريات وأرقام</small></span></a>
        <a href="#/leagues"><i>🏆</i><span>البطولات المحلية<small>دوريات وكؤوس وسوبر</small></span></a>
        <a href="#/continental"><i>🌍</i><span>البطولات القارية<small>أبطال أوروبا وأفريقيا وآسيا</small></span></a>
        <a href="#/world"><i>🌐</i><span>البطولات العالمية<small>كأس العالم والأندية والشباب</small></span></a>
        <a href="#/women"><i>👩</i><span>كرة القدم للسيدات<small>دوريات وقارية وعالمية</small></span></a>
        <a href="#/account"><i>👤</i><span>حسابي<small>فانتازي • متابعات • ستريك</small></span></a>
        <a href="#/rules"><i>⚖️</i><span>قوانين الكورة<small>IFAB + VAR + لوائح FIFA/UEFA</small></span></a>
        <a href="#/fantasy"><i>🎮</i><span>الفانتازي<small>ابنِ تشكيلتك</small></span></a>
        <a href="#/challenges"><i>🎯</i><span>التحديات<small>${GAMES_N} لعبة ومستويات</small></span></a>
        <a href="#/transfers"><i>🔁</i><span>الانتقالات<small>آخر الأخبار والصفقات</small></span></a>
        <a href="#/sports"><i>🏀</i><span>رياضات أخرى<small>سلة ويد وطائرة وبطولات عالمية</small></span></a>
      </div>
    </div>

    <p class="footnote">تطبيق مستقل وغير تابع لأي دوري أو نادٍ.</p>`;

    /* شريط «مباشر الآن» — كل البطولات في طلب واحد مشترك، وبيتملي بعد الرسم */
    const armHome = ms => {
      stopHomeTimer();
      HOME_TIMER = setTimeout(async () => {
        HOME_TIMER = null;
        if (homeGen !== HOME_GEN || !el.isConnected || parseHash().path !== 'home') return;
        if (document.visibilityState !== 'visible') { armHome(60000); return; }
        await fillLive(true);
      }, ms);
    };

    async function fillLive(force) {
      if (typeof liveMatchesFor !== 'function') return;
      const lm = await liveMatchesFor(null, { force: !!force }).catch(() => null);
      if (homeGen !== HOME_GEN || !el.isConnected || parseHash().path !== 'home') return;
      if (!lm) {
        const note = el.querySelector('#homeLiveNote');
        if (note) note.textContent = '⚠️ المصدر الحي مش متاح — مفيش نتايج مباشرة محدثة دلوقتي.';
        armHome(60000);
        return;
      }

      const meta = lm.meta || {};
      const stale = !!meta.stale;
      const fmt = ts => ts ? new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
      const live = stale ? [] : lm.filter(m => m.s === 'IN_PLAY').slice(0, 4);
      const sec = el.querySelector('#homeLive'), body = el.querySelector('#homeLiveList');
      const title = el.querySelector('#homeLiveTitle'), note = el.querySelector('#homeLiveNote');
      if (live.length && sec && body) {
        body.innerHTML = live.map(m => {
          const score = m.hg != null && m.ag != null ? `${m.hg} - ${m.ag}` : '—';
          return `
            <a class="row" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
              <span>${crest(m.h.c)}${esc(m.h.n)} <span class="muted">ضد</span> ${crest(m.a.c)}${esc(m.a.n)}</span>
              <span class="side"><b class="green">${esc(score)}</b>${typeof liveClockHtml === 'function' ? liveClockHtml(m) : '<span class="liveBadge">مباشر</span>'}<span class="lg">${LN[m.l] || m.l}</span></span>
            </a>`;
        }).join('');
        if (title) title.textContent = '🔴 مباشر الآن';
        if (note) note.textContent = meta.fetchedAt ? 'آخر تحديث من المصدر: ' + fmt(meta.fetchedAt) : '';
        sec.hidden = false;
      } else {
        if (sec) sec.hidden = !stale;
        if (title && stale) title.textContent = '⚠️ نتائج غير محدّثة';
        const oldLive = stale ? lm.filter(m => m.s === 'IN_PLAY').slice(0, 4) : [];
        if (body && stale) body.innerHTML = oldLive.length ? oldLive.map(m => `
          <a class="row" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
            <span>${crest(m.h.c)}${esc(m.h.n)} <span class="muted">ضد</span> ${crest(m.a.c)}${esc(m.a.n)}</span>
            <span class="side"><b>${m.hg != null && m.ag != null ? esc(m.hg + ' - ' + m.ag) : '—'}</b><span class="muted tiny">آخر حالة</span></span>
          </a>`).join('') : '<div class="empty">مفيش نتايج مباشرة محفوظة.</div>';
        if (note) {
          if (stale) note.textContent = '⚠️ المصدر مش متاح — آخر نسخة سليمة' + (meta.fetchedAt ? ' من ' + fmt(meta.fetchedAt) : '') + '، ومش وصف مباشر للحالة الحالية.';
          else if (meta.ok) note.textContent = 'مفيش مباريات مباشرة دلوقتي.';
        }
      }

      /* نتائج النهارده — نفس الاستجابة، من غير طلب إضافي */
      const todayStr = new Date().toDateString();
      const results = lm.filter(m => m.s === 'FINISHED' && m.hg != null && m.ag != null && new Date(m.d).toDateString() === todayStr).slice(0, 4);
      const rsec = el.querySelector('#homeResults'), rbody = el.querySelector('#homeResultsList');
      const rnote = el.querySelector('#homeResultsNote');
      if (results.length && rsec && rbody) {
        rbody.innerHTML = results.map(m => `
          <a class="row" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
            <span>${crest(m.h.c)}${esc(m.h.n)} <span class="muted">ضد</span> ${crest(m.a.c)}${esc(m.a.n)}</span>
            <span class="side"><b>${esc(m.hg)} - ${esc(m.ag)}</b><span class="lg">${LN[m.l] || m.l}</span></span>
          </a>`).join('');
        if (rnote) rnote.textContent = stale ? '⚠️ نتايج آخر نسخة سليمة — مش محدثة.' : (meta.fetchedAt ? 'آخر تحديث: ' + fmt(meta.fetchedAt) : '');
        rsec.hidden = false;
      } else if (rsec) rsec.hidden = true;

      /* المباريات القادمة من نفس المصدر — مش من ملف ثابت */
      const upcoming = lm.filter(m => m.s === 'TIMED' && Date.parse(m.d) > Date.now() - 5 * 60e3)
        .sort((a, b) => new Date(a.d) - new Date(b.d)).slice(0, 5);
      const nextBody = el.querySelector('#homeNextList');
      if (nextBody) {
        nextBody.innerHTML = upcoming.length ? upcoming.map(m => `
          <a class="row" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
            <span>${crest(m.h.c)}${esc(m.h.n)} <span class="muted">ضد</span> ${crest(m.a.c)}${esc(m.a.n)}</span>
            <span class="side">${dt(m.d)}<span class="lg">${LN[m.l] || m.l}</span></span>
          </a>`).join('') + (stale ? '<div class="muted tiny" style="padding:8px 12px">⚠️ مواعيد آخر نسخة سليمة — مش محدثة.</div>' : '')
          : '<div class="empty">لا توجد مباريات قادمة.</div>';
      }
      const favs = (typeof ACC !== 'undefined' && ACC.follows) ? ACC.follows() : [];
      const mineBody = el.querySelector('#homeMineList');
      if (mineBody) {
        const mine = upcoming.filter(m => favs.includes(m.l));
        mineBody.innerHTML = !favs.length
          ? '<div class="empty">لم تتابع أي بطولة بعد. <a href="#/pick">اختار</a></div>'
          : mine.length ? mine.map(m => `
            <a class="row" href="#/match?l=${encodeURIComponent(m.l)}&id=${encodeURIComponent(m.id)}">
              <span>${crest(m.h.c)}${esc(m.h.n)} <span class="muted">ضد</span> ${crest(m.a.c)}${esc(m.a.n)}</span>
              <span class="side">${dt(m.d)}<span class="lg">${LN[m.l] || m.l}</span></span>
            </a>`).join('')
            : '<div class="empty">لا توجد مباريات قادمة لبطولاتك حالياً.</div>';
      }

      HOME_CTX = { el, fill: fillLive };
      armHome(meta.live || stale ? 60000 : 180000);
    }

    try {
      HOME_CTX = { el, fill: fillLive };
      await fillLive(false);
    } catch (e) { }
  }
});
