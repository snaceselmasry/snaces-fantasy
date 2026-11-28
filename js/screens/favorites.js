'use strict';
/* ============================================================
   المفضلات — كل مستخدم يختار بطولات وأندية ومنتخبات يتابعها
   #/favorites   صفحة المفضلة
   #/pick        اختيار/تعديل المتابعات
   ============================================================ */
let FOLLOW_INDEX = null;
const followIndex = async () => FOLLOW_INDEX || (FOLLOW_INDEX = await getJSON('data/follow.json') || { comps: [], clubs: [], nats: [] });
const favTypeAr = { c: 'بطولة', k: 'نادي', n: 'منتخب' };

/* ---------- صفحة المفضلة ---------- */
screen('favorites', {
  title: 'المفضلات', tab: 'more',
  async render(q, el) {
    const f = ACC.favs();
    const total = f.c.length + f.k.length + f.n.length;
    const u = ACC.me();

    el.innerHTML = `
      <div class="heroCard" style="margin-bottom:12px">
        <div class="eyebrow">MY FAVORITES</div>
        <h2>مفضلتك <span>في مكان واحد</span></h2>
        <p>اختار البطولات والأندية والمنتخبات اللي بتحبها، ورتّبهم بالأسهم ↑↓ زي ما تحب.</p>
      </div>

      <div class="kpis k3" style="margin-bottom:12px">
        <div class="kpi"><small>بطولات</small><strong class="green">${f.c.length}</strong></div>
        <div class="kpi"><small>أندية</small><strong>${f.k.length}</strong></div>
        <div class="kpi"><small>منتخبات</small><strong>${f.n.length}</strong></div>
      </div>

      <a class="btn primary" href="#/pick" style="width:100%;margin-bottom:14px">${total ? '✏️ عدّل متابعاتك' : '➕ اختار اللي تتابعه'}</a>

      ${!u ? `<div class="dataPanel" style="padding:12px;margin-bottom:12px">
        <p class="small" style="margin:0 0 8px">مفضلتك محفوظة على الجهاز. سجّل حساب عشان تفضل باسمك لو دخلت من حساب تاني.</p>
        <a class="btn secondary" href="#/account">إنشاء حساب</a></div>` : ''}

      ${total ? `
        ${f.c.length ? `<div class="section">
          <div class="head"><h2>🏆 بطولات بتتابعها</h2></div>
          <div class="dataPanel">${f.c.map((code, i) => `
            <div class="row">
              <a href="#/league?l=${encodeURIComponent(code)}" style="color:inherit;min-width:0"><b>${esc(LN[code] || code)}</b>
                <small class="muted tiny" style="display:block">${esc(countryOf(code) || '')}</small></a>
              <span class="side" style="display:flex;gap:4px;align-items:center">
                <button class="btn secondary" type="button" data-mv="c:${esc(code)}:-1" ${i === 0 ? 'disabled' : ''} aria-label="فوق" title="طلع لفوق" style="padding:2px 7px">↑</button>
                <button class="btn secondary" type="button" data-mv="c:${esc(code)}:1" ${i === f.c.length - 1 ? 'disabled' : ''} aria-label="تحت" title="نزّل لتحت" style="padding:2px 7px">↓</button>
                <button class="btn secondary" type="button" data-rm="c:${esc(code)}" style="padding:2px 9px">✕</button>
              </span>
            </div>`).join('')}</div>
        </div>` : ''}

        ${f.k.length ? `<div class="section">
          <div class="head"><h2>🛡️ أندية بتتابعها</h2></div>
          <div class="dataPanel">${f.k.map((c, i) => `
            <div class="row">
              <a href="#/team?l=${encodeURIComponent(c.league || 'PL')}&id=${encodeURIComponent(c.id)}&n=${encodeURIComponent(c.name)}" style="color:inherit;min-width:0;display:flex;align-items:center;gap:8px">
                ${c.crest ? `<img class="crest" src="${esc(c.crest)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
                <span style="min-width:0"><b>${esc(c.name)}</b><small class="muted tiny" style="display:block">${esc(LN[c.league] || countryOf(c.league) || '')}</small></span>
              </a>
              <span class="side" style="display:flex;gap:4px;align-items:center">
                <button class="btn secondary" type="button" data-mv="k:${esc(c.id)}:-1" ${i === 0 ? 'disabled' : ''} aria-label="فوق" title="طلع لفوق" style="padding:2px 7px">↑</button>
                <button class="btn secondary" type="button" data-mv="k:${esc(c.id)}:1" ${i === f.k.length - 1 ? 'disabled' : ''} aria-label="تحت" title="نزّل لتحت" style="padding:2px 7px">↓</button>
                <button class="btn secondary" type="button" data-rm="k:${esc(c.id)}" style="padding:2px 9px">✕</button>
              </span>
            </div>`).join('')}</div>
        </div>` : ''}

        ${f.n.length ? `<div class="section">
          <div class="head"><h2>🌍 منتخبات بتتابعها</h2></div>
          <div class="dataPanel">${f.n.map((t, i) => `
            <div class="row">
              <a href="#/team?l=WC&id=${encodeURIComponent(t.id)}&n=${encodeURIComponent(t.name)}" style="color:inherit;min-width:0;display:flex;align-items:center;gap:8px">
                ${t.crest ? `<img class="crest" src="${esc(t.crest)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
                <span style="min-width:0"><b>${esc(t.name)}</b><small class="muted tiny" style="display:block">منتخب</small></span>
              </a>
              <span class="side" style="display:flex;gap:4px;align-items:center">
                <button class="btn secondary" type="button" data-mv="n:${esc(t.id)}:-1" ${i === 0 ? 'disabled' : ''} aria-label="فوق" title="طلع لفوق" style="padding:2px 7px">↑</button>
                <button class="btn secondary" type="button" data-mv="n:${esc(t.id)}:1" ${i === f.n.length - 1 ? 'disabled' : ''} aria-label="تحت" title="نزّل لتحت" style="padding:2px 7px">↓</button>
                <button class="btn secondary" type="button" data-rm="n:${esc(t.id)}" style="padding:2px 9px">✕</button>
              </span>
            </div>`).join('')}</div>
        </div>` : ''}
      ` : `<div class="dataPanel"><div class="empty">لسه مفيش حاجة في مفضلتك.<br><br>اضغط «اختار اللي تتابعه» وابدأ ببطولة أو نادي أو منتخب.</div></div>`}
    `;

    el.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => {
      const [type, val, dir] = b.dataset.mv.split(':');
      if (ACC.moveFav(type, val, Number(dir))) render();
    });

    el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
      const [type, val] = b.dataset.rm.split(':');
      if (type === 'c') ACC.toggleFav('c', val);
      else {
        const f2 = ACC.favs();
        const item = (f2[type] || []).find(x => String(x.id) === String(val));
        ACC.toggleFav(type, item || { id: val, name: '' });
      }
      toast('اتشالت من المفضلة');
      render();
    });
  }
});

/* ---------- اختيار المتابعات ---------- */
screen('pick', {
  title: 'اختار متابعاتك', tab: 'more', back: true,
  async render(q, el) {
    const data = await followIndex();
    const f = ACC.favs();
    const type = ['c', 'k', 'n'].includes(q.t) ? q.t : 'c';
    const term = (q.q || '').toLowerCase();

    /* البطولات من LN (كل البطولات المعروفة) */
    const compList = Object.keys(LN).map(code => ({ code, name: LN[code], country: countryOf(code), scope: scopeOf(code) }))
      .filter(c => c.scope !== 'women' || true);

    const source = type === 'c'
      ? compList.map(c => ({ id: c.code, name: c.name, sub: c.country || 'بطولة', crest: '' }))
      : type === 'k'
        ? data.clubs.map(c => ({ id: c.id, name: c.name, sub: LN[c.league] || '', crest: c.crest, league: c.league }))
        : data.nats.map(t => ({ id: t.id, name: t.name, sub: 'منتخب', crest: t.crest }));

    const list = source.filter(x => !term || (x.name + ' ' + x.sub).toLowerCase().includes(term)).slice(0, 250);

    el.innerHTML = `
      <div class="heroCard" style="margin-bottom:12px">
        <div class="eyebrow">FOLLOW</div>
        <h2>اختار <span>اللي يهمك</span></h2>
        <p>اضغط ⭐ جنب أي بطولة أو نادي أو منتخب، وهتلاقيه في المفضلة.</p>
      </div>

      <div class="vs" style="margin-bottom:10px">
        <button class="btn ${type === 'c' ? 'primary' : 'secondary'}" data-t="c" type="button">🏆 بطولات</button>
        <button class="btn ${type === 'k' ? 'primary' : 'secondary'}" data-t="k" type="button">🛡️ أندية</button>
        <button class="btn ${type === 'n' ? 'primary' : 'secondary'}" data-t="n" type="button">🌍 منتخبات</button>
      </div>

      <input class="control" id="favQ" placeholder="دوّر بالاسم…" value="${esc(q.q || '')}" style="width:100%;margin-bottom:10px">

      <div class="dataPanel" id="favList">
        ${list.length ? list.map(x => {
          const on = type === 'c'
            ? f.c.includes(x.id)
            : (f[type] || []).some(y => String(y.id) === String(x.id));
          return `<div class="row">
            <span style="min-width:0;display:flex;align-items:center;gap:8px">
              ${x.crest ? `<img class="crest" src="${esc(x.crest)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
              <span><b>${esc(x.name)}</b><small class="muted tiny" style="display:block">${esc(x.sub || '')}</small></span>
            </span>
            <span class="side"><button class="btn ${on ? 'primary' : 'secondary'}" type="button"
              data-fav="${type}" data-id="${esc(x.id)}" data-name="${esc(x.name)}" data-crest="${esc(x.crest || '')}" data-league="${esc(x.league || '')}"
              style="padding:3px 10px">${on ? '⭐ متابَع' : '☆ متابعة'}</button></span>
          </div>`;
        }).join('') : '<div class="empty">مفيش نتائج بالاسم ده.</div>'}
      </div>

      <a class="btn secondary" href="#/favorites" style="width:100%;margin-top:12px">روح للمفضلة ←</a>`;

    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => go('pick', { t: b.dataset.t, q: q.q || '' }));

    const qi = $('#favQ', el);
    qi.oninput = () => {
      const v = qi.value.trim().toLowerCase();
      el.querySelectorAll('#favList [data-fav]').forEach(btn => {
        const row = btn.closest('.row');
        row.style.display = (!v || row.textContent.toLowerCase().includes(v)) ? '' : 'none';
      });
    };

    el.querySelectorAll('[data-fav]').forEach(btn => btn.onclick = () => {
      const t = btn.dataset.fav;
      const item = t === 'c'
        ? btn.dataset.id
        : { id: btn.dataset.id, name: btn.dataset.name, crest: btn.dataset.crest, league: btn.dataset.league };
      const added = ACC.toggleFav(t, item);
      btn.textContent = added ? '⭐ متابَع' : '☆ متابعة';
      btn.className = 'btn ' + (added ? 'primary' : 'secondary');
      toast(added ? 'اتضاف للمفضلة ⭐' : 'اتشال من المفضلة');
    });
  }
});
