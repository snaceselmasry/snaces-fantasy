'use strict';
/* ============ رياضات أخرى ============ */
screen('sports', {
  title: 'رياضات أخرى', tab: 'more', back: true,
  async render(q, el) {
    const d = await getJSON('data/sports.json');
    if (!d || !Array.isArray(d.sports) || !d.sports.length) {
      el.innerHTML = emptyBox('بيانات الرياضات مش متاحة حاليًا.', '<br><small>جرّب بعد شوية.</small>');
      return;
    }

    const all = [...d.sports,
      { id: 'handball', name: 'Handball', nameAr: 'كرة اليد', icon: '🤾', live: true },
      { id: 'worldcomps', name: 'World competitions', nameAr: 'بطولات عالمية', icon: '🌐', live: true }];
    let cur = (all.find(s => s.id === q.s) || all[0]).id;

    el.innerHTML = `
      <div class="chips" id="spbar"></div>
      <div id="spbody" style="margin-top:4px"></div>
      <p class="muted tiny" style="text-align:center;margin-top:14px">
        البيانات بتتحدّث تلقائيًا${d.updated ? ' • آخر تحديث: ' + new Date(d.updated).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
      </p>`;

    const bar = $('#spbar', el), body = $('#spbody', el);

    const stateBadge = g => {
      if (g.state === 'in') return '<span class="fdr fdr1" style="color:#062015">مباشر</span>';
      if (g.state === 'post') return '<span class="fdr fdr3" style="color:#062015">انتهت</span>';
      return '<span class="fdr fdr4">لم تبدأ</span>';
    };

    function gamesBlock(s) {
      const games = s.games || [];
      if (!games.length) return '<div class="dataPanel"><div class="empty">لا توجد مباريات في الجدول حاليًا.</div></div>';
      return `<div class="dataPanel">${games.map(g => {
        const showScore = g.state !== 'pre' && (g.hs !== '' || g.as !== '');
        return `<div class="row">
          <span>${esc(g.home)} ${showScore ? `<b>${esc(g.hs)} - ${esc(g.as)}</b>` : '<span class="muted">ضد</span>'} ${esc(g.away)}</span>
          <span class="side">${stateBadge(g)}<span class="tiny">${g.state === 'pre' ? dt(g.date) : esc(g.detail || '')}</span></span>
        </div>`;
      }).join('')}</div>`;
    }

    function standingsBlock(s) {
      if (!s.standings || !s.standings.length) return '';
      return s.standings.map(conf => `<div class="dataPanel" style="margin-top:12px">
        <div class="dataTop"><b>${esc(conf.group || 'الترتيب')}</b></div>
        <div class="tableWrap"><table style="min-width:0">
          <thead><tr><th>#</th><th style="text-align:right">الفريق</th><th>ف</th><th>خ</th><th>%</th></tr></thead>
          <tbody>${conf.rows.map((r, i) => `<tr>
            <td>${i + 1}</td>
            <td style="text-align:right;font-weight:700">${esc(r.team)}</td>
            <td>${r.w ?? '—'}</td><td>${r.l ?? '—'}</td><td>${r.pct || '—'}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>`).join('');
    }

    function racesBlock(s) {
      const races = s.races || [];
      if (!races.length) return '<div class="dataPanel"><div class="empty">لا توجد سباقات في الجدول حاليًا.</div></div>';
      return `<div class="dataPanel">${races.map(r => `<div class="row">
        <span>🏁 ${esc(r.name)}${r.venue ? `<br><small class="muted">${esc(r.venue)}</small>` : ''}</span>
        <span class="side">${stateBadge(r)}<span class="tiny">${dt(r.date)}</span></span>
      </div>`).join('')}</div>`;
    }

    let HB_EXPANDED = false;

    async function handballBlock() {
      body.innerHTML = '<div class="skel" style="height:180px"></div>';
      const hb = await liveHandball().catch(() => null);
      if (!hb || !hb.comps || !hb.comps.length) {
        body.innerHTML = emptyBox('بيانات كرة اليد مش متاحة حاليًا.', '<br><small>جرّب بعد شوية.</small>');
        return;
      }
      const shown = HB_EXPANDED ? hb.comps : hb.comps.slice(0, 3);
      const blocks = shown.map((c, i) => `
        <div class="dataPanel" style="margin-top:${i ? 12 : 0}px">
          <div class="dataTop"><b>🤾 ${esc(c.name)}</b><span class="muted tiny">${c.games.length} مباراة</span></div>
          ${c.games.slice(0, HB_EXPANDED ? 20 : 6).map(g => `<div class="row">
            <span>${esc(g.h)} ${g.hs != null ? `<b>${g.hs} - ${g.as}</b>` : '<span class="muted">ضد</span>'} ${esc(g.a)}</span>
            <span class="side">${g.live ? '<span class="fdr fdr1" style="color:#062015">مباشر</span>' : g.done ? '<span class="fdr fdr3" style="color:#062015">انتهت</span>' : `<span class="tiny">${dt(g.date)}</span>`}</span>
          </div>`).join('')}
        </div>`).join('');
      const more = hb.comps.length > 3
        ? `<div style="text-align:center;margin-top:10px"><button class="btn secondary" type="button" id="hbMore">${HB_EXPANDED ? 'إظهار أقل' : 'المزيد (' + (hb.comps.length - 3) + ' بطولة)'}</button></div>`
        : '';
      body.innerHTML = `<div class="section-head" style="margin-top:10px"><h2>🤾 Handball</h2><span class="lg">كرة اليد</span></div>`
        + blocks + more
        + `<div class="disclaimer" style="margin-top:12px">مباريات كرة اليد بتتحدّث كل ساعة.</div>`;
      const mb = $('#hbMore', el);
      if (mb) mb.onclick = () => { HB_EXPANDED = !HB_EXPANDED; handballBlock(); };
    }

    let WC_EXPANDED = false;
    const WORLD_SPORTS = [[2, '🏀 كرة السلة'], [5, '🤾 كرة اليد'], [8, '🏐 الكرة الطائرة']];

    async function worldBlock() {
      body.innerHTML = '<div class="skel" style="height:220px"></div>';
      const packs = await Promise.all(WORLD_SPORTS.map(([id]) => liveWorldSport(id).catch(() => null)));
      const secs = packs.map((p, i) => ({ label: WORLD_SPORTS[i][1], comps: (p && p.comps) || [] }));
      if (!secs.some(s => s.comps.length)) {
        body.innerHTML = emptyBox('بطولات عالمية مش متاحة حاليًا.', '<br><small>جرّب بعد شوية.</small>');
        return;
      }
      const html = secs.map(sec => {
        if (!sec.comps.length) return '';
        const list = WC_EXPANDED ? sec.comps : sec.comps.slice(0, 3);
        return `<div class="section-head" style="margin-top:14px"><h2>${sec.label}</h2><span class="lg">${sec.comps.length} بطولة</span></div>`
          + list.map(c => `<div class="dataPanel" style="margin-top:10px">
              <div class="dataTop"><b>${esc(c.name)}</b><span class="muted tiny">${c.games.length} مباراة</span></div>
              ${c.games.slice(0, WC_EXPANDED ? 20 : 5).map(g => `<div class="row">
                <span>${esc(g.h)} ${g.hs != null ? `<b>${g.hs} - ${g.as}</b>` : '<span class="muted">ضد</span>'} ${esc(g.a)}</span>
                <span class="side">${g.live ? '<span class="fdr fdr1" style="color:#062015">مباشر</span>' : g.done ? '<span class="fdr fdr3" style="color:#062015">انتهت</span>' : `<span class="tiny">${dt(g.date)}</span>`}</span>
              </div>`).join('')}
            </div>`).join('');
      }).join('');
      const anyMore = secs.some(s => s.comps.length > 3);
      body.innerHTML = '<div class="section-head" style="margin-top:10px"><h2>🌐 بطولات عالمية</h2><span class="lg">كل الرياضات</span></div>'
        + html
        + (anyMore ? `<div style="text-align:center;margin-top:12px"><button class="btn secondary" type="button" id="wcMore">${WC_EXPANDED ? 'إظهار أقل' : 'المزيد'}</button></div>` : '')
        + '<div class="disclaimer" style="margin-top:12px">البطولات الدولية (منتخبات/أندية) لكل رياضة.</div>';
      const mb = $('#wcMore', el);
      if (mb) mb.onclick = () => { WC_EXPANDED = !WC_EXPANDED; worldBlock(); };
    }

    function draw() {
      bar.innerHTML = all.map(s =>
        `<button class="btn ${s.id === cur ? 'primary' : 'secondary'}" type="button" data-s="${s.id}">${s.icon || ''} ${esc(s.nameAr || s.name)}</button>`).join('');
      const s = all.find(x => x.id === cur) || all[0];
      if (s.id === 'handball') { handballBlock(); return; }
      if (s.id === 'worldcomps') { worldBlock(); return; }
      body.innerHTML = `
        <div class="section-head" style="margin-top:10px"><h2>${s.icon || ''} ${esc(s.name)}</h2>
          <span class="lg">${esc(s.nameAr || '')}</span></div>
        ${s.races ? racesBlock(s) : gamesBlock(s)}
        ${standingsBlock(s)}
        <div class="disclaimer" style="margin-top:12px">البيانات رياضية عامة من ESPN، وبتتحدّث تلقائيًا. المواعيد بتظهر بتوقيت جهازك.</div>`;
    }

    bar.onclick = e => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      cur = b.dataset.s;
      draw();
    };

    draw();
  }
});
