'use strict';
/* ============ الفانتازي ============ */
screen('fantasy', {
  title: 'الفانتازي', tab: 'fantasy',
  async render(q, el) {
    const F = await getJSON('data/fpl.json');
    if (!F || !Array.isArray(F.elements) || !F.elements.length) {
      el.innerHTML = emptyBox('بيانات الفانتازي مش متاحة حاليًا.', '<br><small>جرّب بعد شوية.</small>');
      return;
    }

    const POS = { 1: 'حارس', 2: 'مدافع', 3: 'وسط', 4: 'مهاجم' };
    const CAP = { 1: 2, 2: 5, 3: 5, 4: 3 };
    const BUDGET = 1000; /* 100 مليون × 10 */
    const FORMS = { '4-4-2': [4, 4, 2], '4-3-3': [4, 3, 3], '3-5-2': [3, 5, 2], '3-4-3': [3, 4, 3], '4-5-1': [4, 5, 1], '5-3-2': [5, 3, 2], '5-4-1': [5, 4, 1] };

    const T = {}, P = {};
    (F.teams || []).forEach(t => { T[t.id] = t; });
    F.elements.forEach(p => { P[p.id] = p; });

    /* أسعار FPL الحيّة: تغيّر السعر + حركة الانتقالات (من بروكسي التطبيق) */
    try {
      const pc = store.get('snaces_fpl_prices', null);
      let live = pc && pc.d && Date.now() - pc.t < 15 * 60e3 ? pc.d : null;
      if (!live) {
        const r = await fetch('/api/fpl/prices', { credentials: 'same-origin' });
        if (r.ok) {
          live = await r.json();
          if (live && live.prices) store.set('snaces_fpl_prices', { t: Date.now(), d: live });
        }
      }
      ((live && live.prices) || []).forEach(a => {
        const p = P[a[0]];
        if (!p) return;
        if (a[1]) p.now_cost = a[1];
        p.cost_change_start = a[2] || 0;
        p.cost_change_event = a[3] || 0;
        p.cost_change_start_fall = a[4] || 0;
        p.cost_change_event_fall = a[5] || 0;
        p.transfers_in_event = a[6] || 0;
        p.transfers_out_event = a[7] || 0;
      });
    } catch (e) { }

    const events = F.events || [];
    const nextEv = events.find(e => e.is_next) || events.find(e => e.is_current) || { id: 1 };
    const curEv = events.find(e => e.is_current) || nextEv;

    const fdrCache = new Map();
    function fdrOf(teamId) {
      if (fdrCache.has(teamId)) return fdrCache.get(teamId);
      const fx = (F.fixtures || [])
        .filter(f => f.event && f.event >= nextEv.id && (f.team_h === teamId || f.team_a === teamId))
        .sort((a, b) => a.event - b.event).slice(0, 3);
      const v = fx.length ? fx.reduce((s, f) => s + (f.team_h === teamId ? f.team_h_difficulty : f.team_a_difficulty), 0) / fx.length : 3;
      fdrCache.set(teamId, v);
      return v;
    }
    const ppg = p => p.total_points / Math.max(1, (p.minutes || 0) / 90);
    /* توقع نقاط: معدل النقاط لكل 90 + الفورم، معدّلين بصعوبة المباريات وبدقائق اللعب */
    const xp = p => {
      const base = 0.6 * ppg(p) + 0.4 * num(p.form);
      const fac = Math.max(0.8, Math.min(1.35, 1.25 - 0.15 * (fdrOf(p.team) - 3)));
      const rel = Math.min(1, Math.max(0.55, (p.minutes || 0) / 900));
      return Math.max(0, base * fac * rel);
    };
    const price = p => (p.now_cost / 10).toFixed(1);
    const val = p => (p.now_cost ? p.total_points / (p.now_cost / 10) : 0);
    /* تغيّر السعر (بوحدات 0.1): موجب = غلا، سالب = رخص */
    const chgEv = p => Number(p.cost_change_event) || 0;
    const chgSt = p => Number(p.cost_change_start) || 0;
    const chgOf = p => chgEv(p) || chgSt(p);
    const chgTxt = d => (d > 0 ? '▲' : d < 0 ? '▼' : '—') + (d ? (Math.abs(d) / 10).toFixed(1) : '');
    const chgCls = d => d > 0 ? 'green' : d < 0 ? 'red' : 'muted';
    const priceTag = p => {
      const d = chgOf(p);
      if (!d) return '<br><small class="muted">—</small>';
      return `<br><small class="${chgCls(d)}" title="تغيّر السعر ${chgEv(p) ? 'هذه الجولة' : 'من بداية الموسم'}">${chgTxt(d)}</small>`;
    };

    /* ---------- التشكيلة ---------- */
    const blank = () => ({ 1: [null, null], 2: [null, null, null, null, null], 3: [null, null, null, null, null], 4: [null, null, null] });
    function loadSquad() {
      const s = ACC.get('snaces_squad', null);
      const b = blank();
      if (s && s.sq) for (const t in b) for (let i = 0; i < b[t].length; i++) {
        const id = (s.sq[t] || [])[i];
        b[t][i] = P[id] ? id : null;
      }
      return { sq: b, form: s && FORMS[s.form] ? s.form : '4-4-2', cap: s && P[s.cap] ? s.cap : null };
    }
    let S = loadSquad();
    const save = () => ACC.set('snaces_squad', S);
    const ids = () => [1, 2, 3, 4].flatMap(t => S.sq[t]).filter(Boolean);
    const cost = () => ids().reduce((s, id) => s + P[id].now_cost, 0);
    const nStart = t => (t === 1 ? 1 : FORMS[S.form][t - 2]);
    const starters = () => [1, 2, 3, 4].flatMap(t => S.sq[t].slice(0, nStart(t))).filter(Boolean);

    function canAdd(p, ex) {
      if (ids().includes(p.id) && p.id !== ex) return 'موجود بالفعل';
      if (cost() - (ex ? P[ex].now_cost : 0) + p.now_cost > BUDGET) return 'فوق الميزانية';
      if (ids().filter(id => id !== ex && P[id].team === p.team).length >= 3) return '3 لاعبين من نفس النادي';
      return '';
    }

    /* ---------- حالة الواجهة ---------- */
    let view = 'players';
    let pos = 0, sort = 'total_points', text = '', shown = 30, filt = 'all';
    let pick = null;

    el.innerHTML = `
      <div class="kpis">
        <div class="kpi"><small>الجولة</small><strong class="green">${curEv ? curEv.id : '—'}</strong></div>
        <div class="kpi"><small>الموعد النهائي</small><strong style="font-size:13px">${nextEv && nextEv.deadline_time ? dt(nextEv.deadline_time) : '—'}</strong></div>
        <div class="kpi"><small>لاعبين</small><strong>${F.elements.length}</strong></div>
        <div class="kpi"><small>مشاركون</small><strong style="font-size:14px">${F.total_players ? Number(F.total_players).toLocaleString('ar-EG') : '—'}</strong></div>
      </div>
      <div class="chips" id="ftabs" style="margin:12px 0"></div>
      <div id="fbody"></div>
      <div class="disclaimer" style="margin-top:12px">
        النقاط المعروضة نقاط الموسم الحالي (مؤشر على المستوى)، و«متوقع» تقدير بسيط من الفورم وصعوبة المباريات الجاية — مش توقع رسمي.
        الأسعار وتغيّرها بتتحدّث تلقائيًا كل ربع ساعة.
        تشكيلتك بتتحفظ على جهازك.
      </div>
      <div class="modal" id="pk"><div id="pkBox"></div></div>`;

    const tabsEl = $('#ftabs', el), body = $('#fbody', el), modal = $('#pk', el);

    const TABS = [['players', 'اللاعبين'], ['prices', '📈 الأسعار'], ['squad', 'تشكيلتي'], ['best', 'أفضل التشكيلات'], ['ai', '🤖 المساعد'], ['fdr', 'الصعوبة'], ['compare', 'مقارنة'], ['help', 'كيف تلعب']];
    function paintTabs() {
      tabsEl.innerHTML = TABS.map(([k, n]) => `<button class="btn ${k === view ? 'primary' : 'secondary'}" type="button" data-v="${k}">${n}</button>`).join('');
    }
    tabsEl.onclick = e => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      view = b.dataset.v;
      paintTabs();
      paint();
    };

    function paint() {
      if (view === 'players') playersView();
      else if (view === 'prices') pricesView();
      else if (view === 'squad') squadView();
      else if (view === 'best') bestView();
      else if (view === 'ai') aiView();
      else if (view === 'fdr') fdrView();
      else if (view === 'compare') compareView();
      else helpView();
    }

    /* ---------- اللاعبين ---------- */
    const FILTERS = [['all', 'الكل'], ['rise', '📈 صاعد'], ['fall', '📉 هابط'], ['diff', 'مفاجآت'], ['cheap', 'تحت 5.5'], ['form', 'فورم عالي'], ['mins', 'أساسي']];
    const SORTS = [['total_points', 'الأكثر نقاطًا'], ['xp', 'الأعلى توقعًا'], ['form', 'الأفضل فورم'], ['value', 'الأفضل قيمة'], ['change', 'أعلى ارتفاع سعر'], ['drop', 'أكبر انخفاض سعر'], ['selected_by_percent', 'الأكثر ملكية'], ['now_cost', 'الأغلى سعرًا'], ['expected_goals', 'الأعلى xG']];

    const filtered = () => F.elements
      .filter(p => (!pos || p.element_type === pos))
      .filter(p => {
        if (filt === 'rise') return chgEv(p) > 0;
        if (filt === 'fall') return chgEv(p) < 0;
        if (filt === 'diff') return num(p.selected_by_percent) < 5 && p.total_points > 40;
        if (filt === 'cheap') return p.now_cost <= 55;
        if (filt === 'form') return num(p.form) >= 5;
        if (filt === 'mins') return (p.minutes || 0) > 900;
        return true;
      })
      .filter(p => {
        if (!text) return true;
        const hay = (p.web_name + ' ' + (p.first_name || '') + ' ' + (p.second_name || '')).toLowerCase();
        return hay.includes(text);
      })
      .sort((a, b) => {
        if (sort === 'xp') return xp(b) - xp(a);
        if (sort === 'value') return val(b) - val(a);
        if (sort === 'change') return chgEv(b) - chgEv(a);
        if (sort === 'drop') return chgEv(a) - chgEv(b);
        return num(b[sort]) - num(a[sort]);
      });

    function rowsHtml(list) {
      return list.length ? list.slice(0, shown).map((p, i) => {
        const t = T[p.team] || {};
        const hurt = p.status && p.status !== 'a';
        return `<tr>
          <td>${i + 1}</td>
          <td style="text-align:right"><a href="#" data-info="${p.id}" style="color:inherit;display:flex;align-items:center;gap:8px">
            ${p.photo ? `<img class="pImg" src="${plPhoto(p.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
            <span><b>${esc(p.web_name)}</b>${hurt ? ' <span class="gold" title="غير متاح">⚠</span>' : ''}<br><small class="muted">${t.code ? `<img class="tbadge sm" src="${plBadge(t.code)}" alt="" loading="lazy">` : ''}${esc(t.short_name || t.name || '')}</small></span></a></td>
          <td>${POS[p.element_type] || ''}</td>
          <td style="white-space:nowrap">£${price(p)}${priceTag(p)}</td>
          <td><b>${p.total_points}</b></td>
          <td>${p.form}</td>
          <td class="green">${xp(p).toFixed(1)}</td>
          <td>${p.selected_by_percent}%</td>
          <td style="white-space:nowrap"><button class="btn secondary" type="button" data-add="${p.id}" style="padding:3px 9px">＋</button> <button class="btn secondary" type="button" data-info="${p.id}" style="padding:3px 8px">ℹ</button></td>
        </tr>`;
      }).join('') : '<tr><td colspan="9" class="empty">لا نتائج.</td></tr>';
    }

    function wireRows() {
      $$('[data-add]', body).forEach(b => b.onclick = () => add(+b.dataset.add));
      $$('[data-info]', body).forEach(b => b.onclick = e => { e.preventDefault(); openPlayer(+b.dataset.info); });
      const more = $('#more', body);
      if (more) more.onclick = () => { shown += 30; fillRows(); };
    }

    function fillRows() {
      const list = filtered();
      const tb = $('#plist', body);
      if (!tb) return;
      tb.innerHTML = rowsHtml(list);
      const mt = $('#moreWrap', body);
      if (mt) mt.innerHTML = list.length > shown ? `<button class="btn secondary" id="more" type="button" style="width:100%;margin-top:10px">عرض المزيد (${list.length - shown})</button>` : '';
      wireRows();
    }

    function playersView() {
      const list = filtered();

      body.innerHTML = `
        <div class="vs" style="margin-bottom:8px">
          <input class="control" id="q" placeholder="ابحث عن لاعب..." value="${esc(text)}" style="flex:1;min-width:0">
          <select class="control" id="sort" style="flex:0 0 auto;min-width:130px">
            ${SORTS.map(([k, n]) => `<option value="${k}"${k === sort ? ' selected' : ''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="cmpBar" id="posBar" style="margin-bottom:6px">
          ${[[0, 'الكل'], [1, 'حراس'], [2, 'مدافعين'], [3, 'وسط'], [4, 'مهاجمين']].map(([k, n]) => `<button class="btn ${k === pos ? 'primary' : 'secondary'}" type="button" data-p="${k}">${n}</button>`).join('')}
        </div>
        <div class="cmpBar" id="fltBar" style="margin-bottom:10px">
          ${FILTERS.map(([k, n]) => `<button class="btn ${k === filt ? 'primary' : 'secondary'}" type="button" data-f="${k}">${n}</button>`).join('')}
        </div>
        <div class="dataPanel"><div class="tableWrap"><table style="min-width:600px">
          <thead><tr><th>#</th><th style="text-align:right">اللاعب</th><th>المركز</th><th>السعر</th><th>نقاط</th><th>فورم</th><th>متوقع</th><th>ملكية</th><th></th></tr></thead>
          <tbody id="plist">${rowsHtml(list)}</tbody></table></div></div>
        <div id="moreWrap">${list.length > shown ? `<button class="btn secondary" id="more" type="button" style="width:100%;margin-top:10px">عرض المزيد (${list.length - shown})</button>` : ''}</div>`;

      /* البحث بيفلتر في مكانه من غير ما يفقد التركيز */
      $('#q', body).oninput = e => {
        const caret = e.target.selectionStart;
        text = e.target.value.trim().toLowerCase();
        shown = 30;
        fillRows();
        const q = $('#q', body);
        if (q) { q.focus(); try { q.setSelectionRange(caret, caret); } catch (_) { } }
      };
      $('#sort', body).onchange = e => { sort = e.target.value; shown = 30; fillRows(); };
      body.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { pos = +b.dataset.p; shown = 30; playersView(); });
      body.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filt = b.dataset.f; shown = 30; playersView(); });
      wireRows();
    }

    function add(id) {
      const p = P[id], t = p.element_type;
      const i = S.sq[t].indexOf(null);
      if (i < 0) { toast('مركز ' + POS[t] + ' مكتمل — احذف لاعب الأول'); return; }
      const w = canAdd(p, null);
      if (w) { toast(p.web_name + ': ' + w); return; }
      S.sq[t][i] = id;
      save();
      toast('اتضاف ' + p.web_name + ' ✓ (' + ids().length + '/15)');
    }

    /* ---------- تشكيلتي ---------- */
    function slot(t, i) {
      const id = S.sq[t][i];
      if (!id) return `<div class="slot" data-t="${t}" data-i="${i}"><b>＋</b><span>${POS[t]}</span></div>`;
      const p = P[id], tm = T[p.team] || {};
      return `<div class="slot has${id === S.cap ? ' cap' : ''}" data-t="${t}" data-i="${i}">
        ${p.photo ? `<img class="slotFace" src="${plPhoto(p.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
        <b>${esc(p.web_name)}${id === S.cap ? ' ©' : ''}</b>
        <span>${tm.code ? `<img class="tbadge sm" src="${plBadge(tm.code)}" alt="" loading="lazy">` : ''}${esc(tm.short_name || '')}</span>
        <span>£${price(p)}${chgEv(p) ? ` <small class="${chgCls(chgEv(p))}">${chgTxt(chgEv(p))}</small>` : ''}</span></div>`;
    }

    function squadView() {
      const st = starters();
      if (!st.includes(S.cap)) {
        S.cap = st.length ? st.slice().sort((a, b) => xp(P[b]) - xp(P[a]))[0] : null;
      }
      const bestCap = st.length ? st.slice().sort((a, b) => xp(P[b]) - xp(P[a]))[0] : null;
      const pts = st.reduce((s, id) => s + P[id].total_points, 0) + (S.cap ? P[S.cap].total_points : 0);
      const c = cost();
      const chgVal = ids().reduce((s, id) => s + chgSt(P[id]), 0);

      body.innerHTML = `
        <div class="kpis">
          <div class="kpi"><small>اللاعبين</small><strong class="green">${ids().length}/15</strong></div>
          <div class="kpi"><small>القيمة</small><strong>£${(c / 10).toFixed(1)}${chgVal ? ` <small class="${chgCls(chgVal)}">${chgTxt(chgVal)}</small>` : ''}</strong></div>
          <div class="kpi"><small>المتبقي</small><strong>£${((BUDGET - c) / 10).toFixed(1)}</strong></div>
          <div class="kpi"><small>نقاط الأساسيين</small><strong>${pts}</strong></div>
        </div>
        ${bestCap ? `<div class="streakCard" style="margin-top:12px">
          <span class="big" style="font-size:20px">©</span>
          <span><b>الكابتن المقترح: ${esc(P[bestCap].web_name)}</b>
          <small>متوقع ${xp(P[bestCap]).toFixed(1)} نقطة • ${esc((T[P[bestCap].team] || {}).short_name || '')}</small></span>
        </div>` : ''}
        <div class="vs" style="margin:12px 0">
          <select class="control" id="form" style="flex:1;min-width:0">
            ${Object.keys(FORMS).map(k => `<option value="${k}"${k === S.form ? ' selected' : ''}>${k}</option>`).join('')}
          </select>
          <button class="btn primary" id="auto" type="button">بناء تلقائي</button>
          <button class="btn secondary" id="copy" type="button">نسخ</button>
          <button class="btn secondary" id="clear" type="button">مسح</button>
        </div>
        <div class="sq" id="pitch">
          ${[4, 3, 2, 1].map(t => `<div class="sqRow">${Array.from({ length: nStart(t) }, (_, i) => slot(t, i)).join('')}</div>`).join('')}
        </div>
        <div class="bench">
          <small class="muted">البدلاء</small>
          <div class="sqRow" style="margin-top:8px">
            ${[1, 2, 3, 4].map(t => Array.from({ length: CAP[t] - nStart(t) }, (_, k) => slot(t, nStart(t) + k)).join('')).join('')}
          </div>
        </div>
        <p class="muted tiny" style="margin-top:10px">دوس على أي خانة تختار منها لاعب، أو تحدد كابتن / تحذف.</p>`;

      $('#form', body).onchange = e => { S.form = e.target.value; save(); squadView(); };
      $('#auto', body).onclick = autoBuild;
      $('#copy', body).onclick = copySquad;
      $('#clear', body).onclick = () => { S.sq = blank(); S.cap = null; save(); squadView(); toast('اتمسحت التشكيلة'); };
      $('#pitch', body).onclick = e => {
        const s = e.target.closest('.slot');
        if (s) openPick(+s.dataset.t, +s.dataset.i);
      };
      body.querySelector('.bench').onclick = e => {
        const s = e.target.closest('.slot');
        if (s) openPick(+s.dataset.t, +s.dataset.i);
      };
      save();
    }

    function autoBuild() {
      const quota = { 1: 2, 2: 5, 3: 5, 4: 3 };
      const ch = { 1: [], 2: [], 3: [], 4: [] }, club = {};
      let c = 0;
      const used = new Set();

      /* 1) أرخص لاعب في كل مركز الأول — يضمن 15 لاعب جوه الميزانية */
      [1, 2, 3, 4].forEach(t => {
        while (ch[t].length < quota[t]) {
          const cand = F.elements
            .filter(p => p.element_type === t && !used.has(p.id) && (club[p.team] || 0) < 3)
            .sort((a, b) => a.now_cost - b.now_cost)[0];
          if (!cand) break;
          ch[t].push(cand);
          used.add(cand.id);
          club[cand.team] = (club[cand.team] || 0) + 1;
          c += cand.now_cost;
        }
      });

      /* 2) ترقية كل خانة لأفضل لاعب متاح في حدود الميزانية */
      [1, 2, 3, 4].forEach(t => {
        for (let i = 0; i < ch[t].length; i++) {
          const cur = ch[t][i];
          const better = F.elements
            .filter(p => p.element_type === t && !used.has(p.id) && p.status === 'a' &&
              (club[p.team] || 0) - (p.team === cur.team ? 1 : 0) < 3)
            .sort((a, b) => xp(b) - xp(a))
            .find(p => c - cur.now_cost + p.now_cost <= BUDGET && xp(p) > xp(cur));
          if (!better) continue;
          club[cur.team] = (club[cur.team] || 0) - 1;
          club[better.team] = (club[better.team] || 0) + 1;
          used.delete(cur.id);
          used.add(better.id);
          c = c - cur.now_cost + better.now_cost;
          ch[t][i] = better;
        }
      });

      S.sq = blank();
      [1, 2, 3, 4].forEach(t => ch[t].forEach((p, i) => { S.sq[t][i] = p.id; }));
      S.cap = null;
      save();
      squadView();
      const total = ids().length;
      toast(total === 15 ? 'تم البناء التلقائي ✓' : 'اتبنى ' + total + '/15 — جرّب تمسح وتعيد');
    }

    function copySquad() {
      const row = t => S.sq[t].slice(0, nStart(t)).map(id => (id ? P[id].web_name + (id === S.cap ? ' (C)' : '') : '—')).join(' • ');
      const txt = 'SNACES FOOTBALL — تشكيلتي (' + S.form + ')\n' +
        [4, 3, 2, 1].map(row).join('\n') +
        '\nالبدلاء: ' + [1, 2, 3, 4].flatMap(t => S.sq[t].slice(nStart(t))).map(id => (id ? P[id].web_name : '—')).join(' • ') +
        '\nالقيمة: £' + (cost() / 10).toFixed(1);
      copyText(txt);
    }

    /* ---------- اختيار لاعب ---------- */
    function openPick(t, i) {
      pick = { t, i, q: '', sort: 'xp' };
      const cur = S.sq[t][i];
      $('#pkBox', modal).innerHTML = `
        <div class="between" style="margin-bottom:8px">
          <b>اختر ${POS[t]}</b>
          <button class="btn secondary" id="pkClose" type="button">إغلاق</button>
        </div>
        ${cur ? `<div class="cmpBar" style="margin-bottom:8px">
          <button class="btn secondary" id="pkCap" type="button">كابتن ©</button>
          <button class="btn secondary" id="pkDel" type="button">حذف اللاعب</button></div>` : ''}
        <input class="control" id="pkQ" placeholder="ابحث..." style="width:100%;margin-bottom:8px">
        <select class="control" id="pkS" style="width:100%;margin-bottom:8px">
          <option value="xp">الأعلى توقعًا</option>
          <option value="total_points">الأكثر نقاطًا</option>
          <option value="value">الأفضل قيمة</option>
          <option value="now_cost">الأغلى</option>
        </select>
        <div class="pkbox" id="pkList"></div>`;
      modal.classList.add('open');

      $('#pkClose', modal).onclick = closePick;
      if (cur) {
        $('#pkCap', modal).onclick = () => {
          if (i < nStart(t)) { S.cap = cur; save(); closePick(); squadView(); }
          else toast('الكابتن لازم يكون من الأساسيين');
        };
        $('#pkDel', modal).onclick = () => { S.sq[t][i] = null; save(); closePick(); squadView(); };
      }
      $('#pkQ', modal).oninput = e => { pick.q = e.target.value.toLowerCase(); pkList(); };
      $('#pkS', modal).onchange = e => { pick.sort = e.target.value; pkList(); };
      pkList();
    }

    function pkList() {
      const { t, i } = pick, cur = S.sq[t][i], qq = pick.q;
      const f = pick.sort === 'now_cost' ? (p => p.now_cost) : pick.sort === 'value' ? val : pick.sort === 'xp' ? xp : (p => p.total_points);
      const l = F.elements
        .filter(p => p.element_type === t && (!qq || (p.web_name + ' ' + (p.second_name || '')).toLowerCase().includes(qq)))
        .sort((a, b) => f(b) - f(a)).slice(0, 40);
      $('#pkList', modal).innerHTML = l.map(p => {
        const w = canAdd(p, cur);
        return `<div class="pk${w ? ' off' : ''}" data-id="${p.id}">
          <span><b>${esc(p.web_name)}</b> <small class="muted">${esc((T[p.team] || {}).short_name || '')}</small>
          ${w ? `<br><small class="gold">${w}</small>` : ''}</span>
          <span>£${price(p)}${chgEv(p) ? ` <small class="${chgCls(chgEv(p))}">${chgTxt(chgEv(p))}</small>` : ''} • ${p.total_points}</span></div>`;
      }).join('') || '<div class="empty">لا نتائج</div>';
      $('#pkList', modal).querySelectorAll('.pk').forEach(x => x.onclick = () => choose(+x.dataset.id));
    }

    function choose(id) {
      const { t, i } = pick, p = P[id];
      const w = canAdd(p, S.sq[t][i]);
      if (w) { toast(w); return; }
      S.sq[t][i] = id;
      save();
      closePick();
      squadView();
    }
    function closePick() { modal.classList.remove('open'); pick = null; }
    modal.onclick = e => { if (e.target === modal) closePick(); };

    /* ---------- صعوبة المباريات ---------- */
    function fdrView() {
      const ev = nextEv.id;
      const rows = (F.teams || []).map(t => {
        const fx = (F.fixtures || [])
          .filter(f => f.event && f.event >= ev && (f.team_h === t.id || f.team_a === t.id))
          .sort((a, b) => a.event - b.event).slice(0, 5)
          .map(f => {
            const home = f.team_h === t.id;
            const o = T[home ? f.team_a : f.team_h] || {};
            return { n: o.short_name || '?', home, d: home ? f.team_h_difficulty : f.team_a_difficulty };
          });
        const avg = fx.length ? fx.reduce((s, x) => s + x.d, 0) / fx.length : 9;
        return { t, fx, avg };
      }).sort((a, b) => a.avg - b.avg);

      body.innerHTML = `<div class="dataPanel"><div class="tableWrap"><table style="min-width:460px">
        <thead><tr><th style="text-align:right">الفريق</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td style="text-align:right;font-weight:700">${esc(r.t.name)}</td>
          ${[0, 1, 2, 3, 4].map(i => {
            const x = r.fx[i];
            return x ? `<td><span class="fdr fdr${x.d}" style="min-width:46px">${esc(x.n)} ${x.home ? '(H)' : '(A)'}</span></td>` : '<td>—</td>';
          }).join('')}
        </tr>`).join('')}</tbody></table></div></div>
        <p class="muted tiny" style="margin-top:8px">الأسهل أولًا. 1 سهل جدًا و5 صعب جدًا.</p>`;
    }

    /* ---------- مقارنة ---------- */
    function compareView() {
      const opts = F.elements.slice().sort((a, b) => b.total_points - a.total_points).slice(0, 200)
        .map(p => `<option value="${p.id}">${esc(p.web_name)} — ${esc((T[p.team] || {}).short_name || '')}</option>`).join('');
      body.innerHTML = `
        <div class="vs" style="margin-bottom:10px">
          <select class="control" id="c1" style="flex:1;min-width:0">${opts}</select>
          <b>ضد</b>
          <select class="control" id="c2" style="flex:1;min-width:0">${opts}</select>
        </div>
        <div id="cmpOut"></div>`;
      const c1 = $('#c1', body), c2 = $('#c2', body), out = $('#cmpOut', body);
      if (c2.options[1]) c2.selectedIndex = 1;

      function draw() {
        const A = P[c1.value], B = P[c2.value];
        if (!A || !B) { out.innerHTML = ''; return; }
        if (A.id === B.id) { out.innerHTML = '<p class="muted small">اختر لاعبين مختلفين.</p>'; return; }
        const row = (label, x, y, hi) => {
          const ax = typeof x === 'number' ? x : null, by = typeof y === 'number' ? y : null;
          const aWin = ax != null && by != null && ax > by, bWin = ax != null && by != null && by > ax;
          return `<tr><td class="${aWin ? 'win' : ''}">${x}</td><td class="muted">${label}</td><td class="${bWin ? 'win' : ''}">${y}</td></tr>`;
        };
        out.innerHTML = `
          <div class="dataPanel" style="padding:14px">
            <div class="between" style="margin-bottom:8px">
              <b>${esc(A.web_name)}</b><span class="lg">مقارنة</span><b>${esc(B.web_name)}</b>
            </div>
            <div class="tableWrap"><table class="cmpTbl" style="min-width:0"><tbody>
              ${row('النادي', esc((T[A.team] || {}).short_name || ''), esc((T[B.team] || {}).short_name || ''))}
              ${row('المركز', POS[A.element_type], POS[B.element_type])}
              ${row('السعر', '£' + price(A), '£' + price(B))}
              ${row('تغيّر الأسبوع', chgTxt(chgEv(A)), chgTxt(chgEv(B)))}
              ${row('تغيّر الموسم', chgTxt(chgSt(A)), chgTxt(chgSt(B)))}
              ${row('النقاط', A.total_points, B.total_points)}
              ${row('الفورم', num(A.form), num(B.form))}
              ${row('متوقع الجولة', xp(A).toFixed(1), xp(B).toFixed(1))}
              ${row('ملكية', A.selected_by_percent + '%', B.selected_by_percent + '%')}
              ${row('قيمة (نقطة/مليون)', val(A).toFixed(1), val(B).toFixed(1))}
              ${row('xG', (+A.expected_goals || 0).toFixed(1), (+B.expected_goals || 0).toFixed(1))}
              ${row('دقائق', A.minutes || 0, B.minutes || 0)}
              ${row('صعوبة 3 مباريات', fdrOf(A.team).toFixed(1), fdrOf(B.team).toFixed(1))}
            </tbody></table></div>
          </div>`;
      }
      c1.onchange = draw;
      c2.onchange = draw;
      draw();
    }

    /* ---------- كارت اللاعب ---------- */
    function openPlayer(id) {
      const p = P[id];
      if (!p) return;
      const t = T[p.team] || {};
      const same = F.elements.filter(x => x.element_type === p.element_type);
      const rank = same.slice().sort((a, b) => b.total_points - a.total_points).findIndex(x => x.id === p.id) + 1;
      const fx = (F.fixtures || [])
        .filter(f => f.team_h === p.team || f.team_a === p.team)
        .sort((a, b) => a.event - b.event).slice(0, 3)
        .map(f => {
          const home = f.team_h === p.team;
          const o = T[home ? f.team_a : f.team_h] || {};
          const d = home ? f.team_h_difficulty : f.team_a_difficulty;
          return `<span class="fdr fdr${d}">${esc(o.short_name || '?')} ${home ? 'أرضنا' : 'خارج'}</span>`;
        }).join(' ');
      const v = xp(p);
      const tin = p.transfers_in_event || 0, tout = p.transfers_out_event || 0;
      const fmtN = n => Number(n).toLocaleString('ar-EG');
      const verdict = v >= 5 ? '🔥 خيار قوي للجولة' : v >= 3 ? '👌 خيار متوسط' : '⚠️ مش الأفضل دلوقتي';
      $('#pkBox', modal).innerHTML = `
        <div class="between" style="margin-bottom:10px">
          <b style="font-size:17px">${esc(p.web_name)}</b>
          <button class="btn secondary" id="pkClose" type="button">إغلاق</button>
        </div>
        <p class="muted small" style="margin:0 0 10px">${esc(p.first_name || '')} ${esc(p.second_name || '')} • ${esc(t.name || '')} • ${POS[p.element_type]}</p>
        <div class="kpis" style="grid-template-columns:repeat(2,1fr)">
          ${kpi('السعر', '£' + price(p) + (chgOf(p) ? ' ' + chgTxt(chgOf(p)) : ''))}${kpi('النقاط', p.total_points, 'green')}
          ${kpi('متوقع الجولة', v.toFixed(1))}${kpi('ملكية', p.selected_by_percent + '%')}
        </div>
        <div class="dataPanel" style="margin-top:10px">
          <div class="row"><span>الفورم</span><span class="side"><b>${p.form}</b></span></div>
          <div class="row"><span>الدقائق</span><span class="side"><b>${p.minutes || 0}</b></span></div>
          <div class="row"><span>xG المتوقع</span><span class="side"><b>${(+p.expected_goals || 0).toFixed(1)}</b></span></div>
          <div class="row"><span>تغيّر السعر (الجولة)</span><span class="side"><b class="${chgCls(chgEv(p))}">${chgEv(p) ? chgTxt(chgEv(p)) + ' مليون' : 'بدون تغيير'}</b></span></div>
          <div class="row"><span>تغيّر السعر (الموسم)</span><span class="side"><b class="${chgCls(chgSt(p))}">${chgSt(p) ? chgTxt(chgSt(p)) + ' مليون' : 'بدون تغيير'}</b></span></div>
          <div class="row"><span>شراء / بيع (الجولة)</span><span class="side"><b>${fmtN(tin)} / ${fmtN(tout)}</b></span></div>
          <div class="row"><span>قيمة النقطة (مليون)</span><span class="side"><b>${val(p) ? (1 / val(p)).toFixed(2) : '—'}</b></span></div>
          <div class="row"><span>ترتيبه في مركزه</span><span class="side"><b>${rank} من ${same.length}</b></span></div>
          <div class="row"><span>الحالة</span><span class="side"><b>${p.status === 'a' ? 'متاح ✓' : 'مش متاح ⚠'}</b></span></div>
          <div class="row"><span>صعوبة 3 مباريات</span><span class="side"><b>${fdrOf(p.team).toFixed(1)} / 5</b></span></div>
        </div>
        <p class="small" style="margin:10px 0 4px"><b>المباريات الجاية:</b> ${fx || '—'}</p>
        <p class="small">${verdict}</p>
        <button class="btn primary" id="pkAdd" type="button" style="width:100%;margin-top:8px">ضيف للتشكيلة ＋</button>`;
      modal.classList.add('open');
      $('#pkClose', modal).onclick = closePick;
      $('#pkAdd', modal).onclick = () => { add(p.id); closePick(); };
    }

    /* ---------- محسّن التشكيلة (بناء أفضل 15 لاعب) ---------- */
    const NEED = { 1: 2, 2: 5, 3: 5, 4: 3 };
    function optimize(budget) {
      const chosen = { 1: [], 2: [], 3: [], 4: [] };
      const used = new Set(), club = {};
      let cost = 0;

      /* 1) املأ 15 خانة بالأرخص — يضمن تشكيلة كاملة جوه الميزانية */
      for (const t of [1, 2, 3, 4]) {
        while (chosen[t].length < NEED[t]) {
          const cand = F.elements
            .filter(p => p.element_type === t && !used.has(p.id) && (club[p.team] || 0) < 3)
            .sort((a, b) => a.now_cost - b.now_cost)[0];
          if (!cand) break;
          chosen[t].push(cand); used.add(cand.id);
          club[cand.team] = (club[cand.team] || 0) + 1;
          cost += cand.now_cost;
        }
      }

      /* 2) ترقية: كل مرة بنعمل أحسن استبدال ممكن (أعلى مكسب في التوقع) */
      for (let pass = 0; pass < 260; pass++) {
        let gain = 0.05, move = null;
        for (const t of [1, 2, 3, 4]) {
          for (let i = 0; i < chosen[t].length; i++) {
            const cur = chosen[t][i];
            for (const p of F.elements) {
              if (p.element_type !== t || used.has(p.id) || p.status !== 'a') continue;
              if ((club[p.team] || 0) - (p.team === cur.team ? 1 : 0) >= 3) continue;
              if (cost + p.now_cost - cur.now_cost > budget) continue;
              const g = xp(p) - xp(cur);
              if (g > gain) { gain = g; move = { t, i, cur, p }; }
            }
          }
        }
        if (!move) break;
        club[move.cur.team]--;
        club[move.p.team] = (club[move.p.team] || 0) + 1;
        used.delete(move.cur.id); used.add(move.p.id);
        cost += move.p.now_cost - move.cur.now_cost;
        chosen[move.t][move.i] = move.p;
      }
      return { chosen, cost };
    }

    function xiOf(chosen, form) {
      const f = FORMS[form];
      const xi = [chosen[1][0], ...chosen[2].slice(0, f[0]), ...chosen[3].slice(0, f[1]), ...chosen[4].slice(0, f[2])].filter(Boolean);
      const total = xi.reduce((s, p) => s + xp(p), 0);
      const cap = xi.slice().sort((a, b) => xp(b) - xp(a))[0];
      return { xi, total, cap, projected: total + (cap ? xp(cap) : 0) };
    }

    let BEST = null;
    function bestSet() {
      if (BEST) return BEST;
      const opt = optimize(BUDGET);
      const rows = Object.keys(FORMS).map(form => ({ form, opt, ...xiOf(opt.chosen, form) }))
        .filter(r => r.xi.length >= 11)
        .sort((a, b) => b.projected - a.projected);
      BEST = { opt, rows };
      return BEST;
    }

    function loadBest(opt, form) {
      S.sq = blank();
      [1, 2, 3, 4].forEach(t => opt.chosen[t].forEach((p, i) => { S.sq[t][i] = p.id; }));
      S.form = form;
      const xi = xiOf(opt.chosen, form);
      S.cap = xi.cap ? xi.cap.id : null;
      save();
      view = 'squad';
      paintTabs();
      squadView();
      toast('اتحمّلت أفضل تشكيلة ✓');
    }

    /* ---------- أفضل التشكيلات ---------- */
    function bestView() {
      const B = bestSet();
      if (!B.rows.length) { body.innerHTML = emptyBox('البيانات مش كفاية لحساب تشكيلة.'); return; }
      body.innerHTML = `
        <p class="muted small" style="margin:0 0 10px">أفضل تشكيلة ممكنة لكل خطة، محسوبة من توقع النقاط (الفورم + صعوبة المباريات) بحدود الميزانية وقواعد 3 لاعبين من نفس النادي. الترتيب من الأعلى توقعًا.</p>
        ${B.rows.slice(0, 4).map((r, i) => `
          <div class="dataPanel" style="padding:14px;margin-bottom:10px">
            <div class="between" style="margin-bottom:8px">
              <b style="font-size:16px">${i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}خطة ${r.form}</b>
              <span class="lg">متوقع ${r.projected.toFixed(1)} نقطة</span>
            </div>
            <p class="muted tiny" style="margin:0 0 8px">القيمة £${(r.opt.cost / 10).toFixed(1)} • الكابتن: ${esc(r.cap ? r.cap.web_name : '—')}</p>
            <div class="sl" style="margin-bottom:10px">${r.xi.map(p => `<span>${esc(p.web_name)}</span>`).join('<b class="muted">·</b>')}</div>
            <button class="btn ${i === 0 ? 'primary' : 'secondary'}" type="button" data-load="${r.form}" style="width:100%">استخدم التشكيلة دي</button>
          </div>`).join('')}
        <p class="muted tiny">«متوقع» رقم تقديري للمقارنة بين الخطط، مش ضمان للنقاط.</p>`;
      $$('[data-load]', body).forEach(b => b.onclick = () => {
        const r = B.rows.find(x => x.form === b.dataset.load);
        if (r) loadBest(r.opt, r.form);
      });
    }

    /* ---------- المساعد الذكي ---------- */
    function aiView() {
      const B = bestSet();
      const top = B.rows[0];
      const st = starters();
      const myXi = st.map(id => P[id]);
      const injured = myXi.filter(p => p.status !== 'a');
      const lowMins = myXi.filter(p => (p.minutes || 0) < 400);
      const weak = myXi.filter(p => xp(p) < 2.5);
      const bestCap = top ? top.cap : null;
      let diffPool = F.elements.filter(p => num(p.selected_by_percent) < 8 && p.status === 'a' && xp(p) >= 3.5)
        .sort((a, b) => xp(b) - xp(a)).slice(0, 3);
      if (!diffPool.length) diffPool = F.elements.filter(p => p.status === 'a').sort((a, b) => xp(b) - xp(a)).slice(0, 3);
      const teamsFdr = (F.teams || []).map(t => ({ t, f: fdrOf(t.id) })).sort((a, b) => a.f - b.f).slice(0, 3);
      const cheap = F.elements.filter(p => p.now_cost <= 60 && p.status === 'a')
        .sort((a, b) => (xp(b) / b.now_cost) - (xp(a) / a.now_cost)).slice(0, 3);

      const tips = [];
      if (injured.length) tips.push(`⚠️ عندك ${injured.length} لاعب مش متاح (${injured.map(p => p.web_name).join('، ')}) — استبدلهم.`);
      if (lowMins.length) tips.push(`⏱ ${lowMins.length} لاعب بدقائق قليلة وممكن ما يلعبش: ${lowMins.map(p => p.web_name).join('، ')}.`);
      if (weak.length) tips.push(`📉 ${weak.length} لاعب متوقعه ضعيف الجولة دي: ${weak.map(p => p.web_name).join('، ')}.`);
      if (!myXi.length) tips.push('🧩 تشكيلتك فاضية — اضغط «ابنِ أفضل تشكيلة» وهجهزلك واحدة جاهزة.');
      else if (bestCap && S.cap && P[S.cap] && xp(P[S.cap]) < xp(bestCap) - 0.5) tips.push(`© الكابتن الأحسن دلوقتي ${bestCap.web_name} بدل ${P[S.cap].web_name}.`);
      const left = (BUDGET - cost()) / 10;
      if (myXi.length && left > 5) tips.push(`💰 عندك £${left.toFixed(1)} متبقية — حسب التوقع مفيش استبدال بيرفع النقاط دلوقتي، سيبهم للمرونة أو استنى تشكيلات الجولة.`);
      if (!tips.length) tips.push('✅ تشكيلتك منطقية على بيانات الجولة الحالية.');

      body.innerHTML = `
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <div class="between" style="margin-bottom:8px"><b>🤖 المساعد الذكي</b><span class="lg">تحليل محلي</span></div>
          <p class="muted small" style="margin:0">المساعد بيحلل بيانات الفانتازي على جهازك (نقاط، فورم، دقائق، ملكية، صعوبة المباريات) ويطلع توصيات بقواعد واضحة — مش خدمة خارجية ومش ضمان للنتيجة.</p>
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">📋 قراءة تشكيلتك</b>
          ${tips.map(t => `<p class="small" style="margin:8px 0 0">${esc(t)}</p>`).join('')}
        </div>
        <div class="grid2" style="gap:10px;margin-bottom:10px">
          <div class="dataPanel" style="padding:12px">
            <b style="font-size:14px">🏆 أفضل خطة</b>
            <p class="muted tiny" style="margin:4px 0 8px">${top ? 'خطة ' + top.form + ' • متوقع ' + top.projected.toFixed(1) : '—'}</p>
            <button class="btn primary" id="aiBuild" type="button" style="width:100%">ابنِ أفضل تشكيلة</button>
          </div>
          <div class="dataPanel" style="padding:12px">
            <b style="font-size:14px">© الكابتن</b>
            <p class="muted tiny" style="margin:4px 0 8px">${bestCap ? esc(bestCap.web_name) + ' • ' + xp(bestCap).toFixed(1) + ' نقطة متوقعة' : '—'}</p>
            <button class="btn secondary" id="aiCap" type="button" style="width:100%">اختاره كابتن</button>
          </div>
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">💎 مفاجآت (ملكية قليلة وتوقع عالي)</b>
          ${diffPool.length ? diffPool.map(p => `<div class="row"><span>${esc(p.web_name)} <small class="muted">${esc((T[p.team] || {}).short_name || '')}</small></span><span class="side">£${price(p)} • ${xp(p).toFixed(1)} متوقع</span></div>`).join('') : '<p class="muted small">مفيش حاليًا.</p>'}
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">💰 أحسن قيمة تحت 6.0</b>
          ${cheap.map(p => `<div class="row"><span>${esc(p.web_name)} <small class="muted">${esc((T[p.team] || {}).short_name || '')}</small></span><span class="side">£${price(p)} • ${p.total_points} نقطة</span></div>`).join('')}
        </div>
        <div class="dataPanel" style="padding:14px">
          <b style="font-size:15px">📅 أسهل فرق الجولات الجاية</b>
          ${teamsFdr.map(x => `<div class="row"><span>${esc(x.t.name)}</span><span class="side">صعوبة ${x.f.toFixed(1)}</span></div>`).join('')}
        </div>`;
      $('#aiBuild', body).onclick = () => { if (top) loadBest(top.opt, top.form); };
      $('#aiCap', body).onclick = () => {
        if (!bestCap) return toast('مفيش لاعبين كفاية');
        if (!S.sq[bestCap.element_type].includes(bestCap.id)) { toast('ضيف اللاعب للتشكيلة الأول'); return; }
        if (!starters().includes(bestCap.id)) { toast('اللاعب على الدكة — بدّله مع أساسي'); return; }
        S.cap = bestCap.id; save(); toast('اتعين كابتن ©'); squadView();
      };
    }

    /* ---------- حركة الأسعار ---------- */
    function pricesView() {
      const all = F.elements.slice();
      const risers = all.filter(p => chgEv(p) > 0).sort((a, b) => chgEv(b) - chgEv(a)).slice(0, 8);
      const fallers = all.filter(p => chgEv(p) < 0).sort((a, b) => chgEv(a) - chgEv(b)).slice(0, 8);
      const upStart = all.filter(p => chgSt(p) > 0).sort((a, b) => chgSt(b) - chgSt(a)).slice(0, 6);
      const downStart = all.filter(p => chgSt(p) < 0).sort((a, b) => chgSt(a) - chgSt(b)).slice(0, 6);
      const nUp = all.filter(p => chgEv(p) > 0).length;
      const nDn = all.filter(p => chgEv(p) < 0).length;

      const line = p => {
        const t = T[p.team] || {};
        const net = (p.transfers_in_event || 0) - (p.transfers_out_event || 0);
        const d = chgOf(p);
        return `<a class="row" href="#" data-info="${p.id}" style="color:inherit">
          <span style="min-width:0;display:flex;align-items:center;gap:8px">${p.photo ? `<img class="pImg" src="${plPhoto(p.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
            <span style="min-width:0"><b>${esc(p.web_name)}</b><br><small class="muted">${esc(t.short_name || t.name || '')} • ${POS[p.element_type]}</small></span></span>
          <span class="side" style="text-align:left">£${price(p)} <b class="${chgCls(d)}">${chgTxt(d)}</b>
            <br><small class="muted tiny">${net >= 0 ? 'شراء' : 'بيع'} ${Number(Math.abs(net)).toLocaleString('ar-EG')}</small></span>
        </a>`;
      };

      body.innerHTML = `
        <div class="kpis" style="margin-bottom:10px">
          ${kpi('غلوا سعرهم', nUp, 'green')}${kpi('رخص سعرهم', nDn)}
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">📈 أعلى ارتفاع هذا الأسبوع</b>
          ${risers.length ? risers.map(line).join('') : '<div class="empty">مفيش لاعبين غلوا الجولة دي لحد الآن.</div>'}
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">📉 أكبر انخفاض هذا الأسبوع</b>
          ${fallers.length ? fallers.map(line).join('') : '<div class="empty">مفيش لاعبين رخصوا الجولة دي لحد الآن.</div>'}
        </div>
        <div class="grid2" style="gap:10px">
          <div class="dataPanel" style="padding:12px">
            <b style="font-size:14px">▲ غلاء من بداية الموسم</b>
            ${upStart.length ? upStart.map(line).join('') : '<p class="muted small">—</p>'}
          </div>
          <div class="dataPanel" style="padding:12px">
            <b style="font-size:14px">▼ رخص من بداية الموسم</b>
            ${downStart.length ? downStart.map(line).join('') : '<p class="muted small">—</p>'}
          </div>
        </div>
        <p class="muted tiny" style="margin-top:10px">الأسعار بتتحدّث كل ربع ساعة. «شراء/بيع» = صافي انتقالات الفانتازي في الجولة (مؤشر على الطلب، مش توقع رسمي لتغيير السعر).</p>
        <div class="chips" style="margin-top:8px">
          <button class="btn secondary" type="button" id="prRise">اعرض الصاعدين في اللاعبين</button>
          <button class="btn secondary" type="button" id="prFall">اعرض الهابطين في اللاعبين</button>
        </div>`;
      $$('[data-info]', body).forEach(b => b.onclick = e => { e.preventDefault(); openPlayer(+b.dataset.info); });
      const fr = $('#prRise', body), ff = $('#prFall', body);
      if (fr) fr.onclick = () => { view = 'players'; filt = 'rise'; sort = 'change'; paintTabs(); paint(); };
      if (ff) ff.onclick = () => { view = 'players'; filt = 'fall'; sort = 'drop'; paintTabs(); paint(); };
    }

    /* ---------- كيف تلعب ---------- */
    function helpView() {
      body.innerHTML = `
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">🎮 فكرة اللعبة</b>
          <p class="small" style="margin:8px 0 0">بتختار 15 لاعب من الدوري الإنجليزي بميزانية 100 مليون، وكل جولة بتاخد نقاط على حسب أداء لاعبينك الحقيقي (أهداف، أسيست، شباك نظيفة…). اللي يجمع نقاط أكتر يكسب.</p>
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">📋 القواعد</b>
          <p class="small" style="margin:8px 0 0">• التشكيلة: حارسين، 5 مدافعين، 5 وسط، 3 مهاجمين.<br>• 11 أساسي + 4 بدلاء، والخطة بتحدد توزيع الأساسيين (مثلًا 4-3-3).<br>• أقصى 3 لاعبين من نفس النادي.<br>• الكابتن بياخد ضعف نقاطه.<br>• الميزانية 100 مليون — والمتبقي بيظهرلك فوق.</p>
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">💸 أسعار اللاعبين</b>
          <p class="small" style="margin:8px 0 0">كل لاعب بيعرض سعره وتغيّره: ▲ يعني سعره غلا، ▼ يعني رخص. تغيّر الأسبوع (الجولة) جوه «📈 الأسعار» وكارت اللاعب، وتغيّر الموسم كامل موجود في الكارت. «شراء/بيع» = صافي انتقالات الفانتازي للاعب في الجولة — مؤشر على الطلب وبيسبق تغيير السعر عادةً.</p>
        </div>
        <div class="dataPanel" style="padding:14px;margin-bottom:10px">
          <b style="font-size:15px">🧠 إزاي تختار صح</b>
          <p class="small" style="margin:8px 0 0">1) بص على «متوقع» — بيجمع الفورم مع صعوبة المباريات الجاية.<br>2) اللاعب اللي دقايقه قليلة أو حالته ⚠ مش مضمون.<br>3) «مفاجآت» = لاعبين كويسين بملكية قليلة، بيفرقوا في الترتيب.<br>4) استخدم تبويب «أفضل التشكيلات» أو «المساعد» لو مش عارف تبدأ منين.</p>
        </div>
        <div class="dataPanel" style="padding:14px">
          <b style="font-size:15px">ℹ️ ملاحظات</b>
          <p class="small" style="margin:8px 0 0">النقاط المعروضة نقاط الموسم الحالي كمؤشر مستوى، و«متوقع» تقدير خاص بالتطبيق. التطبيق مستقل وغير تابع لأي دوري أو جهة رسمية.</p>
        </div>`;
    }

    paintTabs();
    paint();
    /* لينك مباشر لكارت لاعب: #/fantasy?p=ID */
    if (q.p && P[+q.p]) openPlayer(+q.p);
  }
});
