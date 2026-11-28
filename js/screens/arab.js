'use strict';
/* ============================================================
   العالم العربي — كروت الدول، وجوه كل دولة بطولاتها المحلية وأخبارها
   كل بطولة بتفتح صفحتها المستقلة، وكل دولة ليها صفحة كاملة
   ============================================================ */
screen('arab', {
  title: 'العالم العربي', back: true, tab: 'leagues',
  async render(q, el) {
    const idx = await arabIndex();
    const arab = (idx && idx.leagues) || [];
    const QCOUNT = typeof QB !== 'undefined' ? QB.filter(r => r[0] === 'arab').length : 0;

    if (!arab.length) {
      el.innerHTML = emptyBox('بيانات البطولات العربية مش متاحة حاليًا.', '<br><small>جرّب تحديث التطبيق بعد شوية.</small>');
      return;
    }

    const newsAll = (await getJSON('data/news.json')) || { items: [] };
    const ARAB_WORDS = ['مصر', 'السعودية', 'المغرب', 'تونس', 'الجزائر', 'الإمارات', 'قطر', 'العراق', 'الأردن', 'الكويت', 'البحرين', 'عمان',
      'الأهلي', 'الزمالك', 'الهلال', 'النصر', 'الاتحاد', 'الرجاء', 'الوداد', 'الترجي', 'الأهلي المصري', 'منتخب مصر', 'منتخب المغرب', 'دوري روشن', 'أفريقيا', 'آسيا'];
    const news = (newsAll.items || []).filter(n => ARAB_WORDS.some(w => String(n.t || '').includes(w)));
    const newsFor = ctry => news.filter(n => {
      const words = [ctry, ...(CTRY_WORDS[ctry] || [])];
      return words.some(w => String(n.t || '').includes(w));
    }).slice(0, 1)[0];

    const teams = arab.reduce((s, l) => s + (l.teams || 0), 0);

    el.innerHTML = `
    <div class="heroCard" style="margin-bottom:14px">
      <div class="eyebrow">ARAB FOOTBALL • من المحيط للخليج</div>
      <h2>الكورة <span>العربية</span><br>في مكان واحد.</h2>
      <p>${arab.length} بطولة عربية في ${ARAB_COUNTRIES.length} دولة. افتح أي دولة تشوف بطولاتها المحلية وأخبارها، وافتح أي بطولة تشوف ترتيبها وأدوارها الإقصائية وسجلها.</p>
      <div class="actions">
        <a class="btn primary" href="#/country?c=${encodeURIComponent('مصر')}">🇪🇬 مصر</a>
        <a class="btn secondary" href="#/challenges?game=cat&cat=arab">أسئلة عربية 🎯</a>
      </div>
      <span class="ball" aria-hidden="true">🌍</span>
    </div>

    <div class="kpis" style="margin-bottom:14px">
      ${kpi('بطولات عربية', arab.length, 'green')}
      ${kpi('دول', ARAB_COUNTRIES.length)}
      ${kpi('فرق', teams)}
      ${kpi('أسئلة عربية', QCOUNT)}
    </div>

    <div class="section">
      <div class="head"><h2>🌍 الدول العربية</h2><p>جوه كل دولة: البطولات المحلية + أخبارها.</p></div>
      <div class="arabGrid">
        ${ARAB_COUNTRIES.map(ctry => {
          const comps = compsOfCountry(ctry);
          const wm = womenCompsOfCountry(ctry);
          const n = newsFor(ctry);
          const flag = COUNTRY_FLAG[ctry] || '🏳️';
          return `<div class="arabCard">
            <a class="arabHead" href="#/country?c=${encodeURIComponent(ctry)}">
              <span class="ctryFlag">${flag}</span>
              <b>${esc(ctry)}</b>
              <small>${comps.length + wm.length} بطولة ›</small>
            </a>
            <div class="arabComps">
              ${comps.length ? comps.map(c => `<a href="#/league?l=${c}">${esc(LN[c] || c)}</a>`).join('') : '<span class="muted tiny">—</span>'}
              ${wm.length ? wm.map(c => `<a class="w" href="#/league?l=${c}">${esc(LN[c] || c)}</a>`).join('') : ''}
            </div>
            ${n ? `<a class="arabNews" href="${esc(n.u)}" target="_blank" rel="noopener noreferrer">📰 ${esc(n.t)}</a>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="section">
      <div class="head"><h2>🏆 بطولات عربية مشتركة</h2><p>قارية وعربية — كل واحدة في صفحة مستقلة.</p></div>
      <div class="compGrid">
        ${['ARB', 'ARBCL', 'GULF', 'AFCON', 'ASIAN'].filter(c => LN[c]).map(c => `<a class="compCard" href="#/league?l=${c}"><b>${esc(LN[c])}</b><small>عربي / قاري</small></a>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="head"><h2>📰 آخر أخبار الكورة العربية</h2><a class="btn secondary" href="#/news">الكل</a></div>
      <div class="dataPanel">
        ${news.length ? news.slice(0, 10).map(n => `<a class="row" href="${esc(n.u)}" target="_blank" rel="noopener noreferrer">
            <span>${esc(n.t)}</span><span class="side">${n.d ? ago(n.d) : ''} ‹</span></a>`).join('')
          : '<div class="empty">مفيش أخبار عربية متاحة دلوقتي.</div>'}
      </div>
    </div>

    <p class="footnote">الجداول والمباريات بتتحدّث تلقائيًا، والأخبار من موجز رياضي عام.</p>`;
  }
});
