'use strict';
/* ============ البحث: بطولات + فرق + لاعبين ============ */

const srchNorm = s => String(s || '').toLowerCase()
  .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
  .replace(/[أإآا]/g, 'ا')
  .replace(/ى/g, 'ي').replace(/ئ/g, 'ي').replace(/ؤ/g, 'و').replace(/ة/g, 'ه')
  .replace(/[^a-z0-9\u0600-\u06FF ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

screen('search', {
  title: 'بحث', tab: 'home',
  async render(q, el) {
    let text = q.q || '';

    el.innerHTML = `
      <div class="vs" style="margin-bottom:10px">
        <input class="control" id="sQ" type="search" placeholder="دوّر على فريق، لاعب، أو بطولة…" value="${esc(text)}" style="flex:1;min-width:0" autocomplete="off">
      </div>
      <div class="cmpBar" id="sQuick" style="margin-bottom:12px"></div>
      <div id="sOut"></div>`;

    const input = $('#sQ', el), out = $('#sOut', el);

    /* اختصارات سريعة */
    const quick = ['الدوري الإنجليزي', 'ريال مدريد', 'ليفربول', 'الأهلي', 'الهلال', 'دوري الأبطال'];
    $('#sQuick', el).innerHTML = quick.map(x => `<button class="btn secondary" type="button" data-q="${esc(x)}">${esc(x)}</button>`).join('');
    $$('[data-q]', el).forEach(b => b.onclick = () => { text = b.dataset.q; input.value = text; run(); });

    const idx = await getJSON('data/search.json');
    const teams = (idx && idx.teams) || [];
    const players = (idx && idx.players) || [];

    function highlight(name, needle) {
      const raw = String(name || '');
      const q = String(needle || '').trim();
      if (!q) return esc(raw);
      let at = raw.toLowerCase().indexOf(q.toLowerCase());
      let len = q.length;
      if (at < 0) {
        const nq = srchNorm(q), n = srchNorm(raw);
        at = n.indexOf(nq);
        len = nq.length;
        if (at < 0) return esc(raw);
      }
      len = Math.max(1, Math.min(len, raw.length - at));
      return esc(raw.slice(0, at)) + '<mark>' + esc(raw.slice(at, at + len)) + '</mark>' + esc(raw.slice(at + len));
    }

    function run() {
      const nq = srchNorm(text);
      if (!nq) {
        out.innerHTML = emptyBox('اكتب حاجة فوق 👆', '<br><small>مثلًا: الأهلي، صلاح، أو الدوري السعودي.</small>');
        return;
      }
      const lg = Object.keys(LN).filter(c => srchNorm(LN[c]).includes(nq) || srchNorm(c) === nq).slice(0, 5);
      const ttSeen = new Set();
      const tt = teams.filter(t => srchNorm(t[0] + ' ' + (t[4] || '')).includes(nq))
        .filter(t => (ttSeen.has(String(t[2])) ? false : (ttSeen.add(String(t[2])), true)))
        .slice(0, 20);
      const pp = players.filter(p => srchNorm(p[0]).includes(nq)).slice(0, 20);

      if (!lg.length && !tt.length && !pp.length) {
        out.innerHTML = emptyBox('مفيش نتايج لـ «' + esc(text) + '»', '<br><small>جرّب اسم أقصر، أو اكتب اسم اللاعب بالإنجليزي (زي Salah).</small>');
        return;
      }

      out.innerHTML = `
        ${lg.length ? `<div class="section"><div class="section-head"><h2>🏆 بطولات</h2></div>
          <div class="dataPanel">${lg.map(c => `<a class="row" href="#/league?l=${c}"><span>${esc(LN[c])}</span><span class="side">‹</span></a>`).join('')}</div></div>` : ''}
        ${tt.length ? `<div class="section"><div class="section-head"><h2>🛡️ فرق (${tt.length})</h2></div>
          <div class="dataPanel">${tt.map(t => `<a class="row" href="#/team?l=${t[1]}&id=${t[2]}&n=${encodeURIComponent(t[0])}">
            <span>${crest(t[3])}${highlight(t[4] || t[0], text.trim())}${t[4] ? ` <small class="muted">${esc(t[0])}</small>` : ''}</span><span class="side"><small class="muted">${esc(LN[t[1]] || t[1])}</small> ‹</span></a>`).join('')}</div></div>` : ''}
        ${pp.length ? `<div class="section"><div class="section-head"><h2>👤 لاعبين (${pp.length})</h2></div>
          <div class="dataPanel">${pp.map(p => `<a class="row" href="#/fantasy?p=${p[2]}">
            <span>${highlight(p[0], text.trim())} <small class="muted">${esc(p[1] || '')}</small></span><span class="side">‹</span></a>`).join('')}</div></div>` : ''}
        <p class="muted tiny" style="margin-top:10px">نتايج الفرق من كل البطولات، واللاعبين من بيانات الفانتازي (أسماؤهم بالإنجليزي).</p>`;
    }

    input.oninput = e => {
      text = e.target.value;
      run();
    };
    input.focus();
    run();
  }
});
