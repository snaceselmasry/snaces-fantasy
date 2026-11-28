'use strict';
/* ============================================================
   صفحات البطولات (مراكز) — محلية / قارية / عالمية / سيدات
   كل كارت بيفتح صفحة مستقلة: #/country?c=... أو #/league?l=...
   ============================================================ */
const LEAGUE_PAGES = {
  domestic: 'البطولات المحلية',
  continental: 'البطولات القارية للأندية',
  world: 'البطولات العالمية',
  women: 'كرة القدم للسيدات'
};
const HUB_ROUTE = { domestic: 'leagues', continental: 'continental', world: 'world', women: 'women' };
const LEAGUE_ROWS = {
  continental: [
    ['🇪🇺 أوروبا', ['CL', 'UEL', 'UECL', 'UESC']],
    ['🌎 أمريكا الجنوبية', ['LIB', 'SUDA', 'RECOPA']],
    ['🌍 أفريقيا', ['CAFCL', 'CAFCC', 'CAFSC']],
    ['🌏 آسيا', ['ACL', 'ACL2']],
    ['🌐 الكونكاكاف', ['CCC']],
    ['🕌 عربي', ['ARBCL']]
  ],
  world: [
    ['🏆 أندية', WORLD_CLUB],
    ['🌍 منتخبات عالمية', WORLD_NT],
    ['🗺️ منتخبات قارية', NT_CONTINENTAL],
    ['🧒 شباب وبراعم', YOUTH]
  ]
};

const compCard = code => {
  const ctry = countryOf(code);
  return `<a class="compCard" href="#/league?l=${code}">
    <b>${esc(LN[code] || code)}</b>
    <small>${ctry ? esc(ctry) : (WOMEN_SET.has(code) ? 'سيدات' : '')}</small>
  </a>`;
};
const countryCard = ctry => {
  const men = compsOfCountry(ctry);
  const wm = womenCompsOfCountry(ctry);
  const n = men.length + wm.length;
  const flag = COUNTRY_FLAG[ctry] || '🏳️';
  const sample = [...men, ...wm].slice(0, 3).map(c => LN[c]).filter(Boolean);
  return `<a class="ctryCard" href="#/country?c=${encodeURIComponent(ctry)}">
    <span class="ctryFlag">${flag}</span>
    <span class="ctryName">${esc(ctry)}</span>
    <small>${n} بطولة${sample.length ? ' • ' + esc(sample.join('، ')) : ''}</small>
  </a>`;
};

function hubTabs(scope) {
  return `<div class="cmpBar" style="margin-bottom:12px">` +
    ['domestic', 'continental', 'world', 'women'].map(s =>
      `<button class="btn ${s === scope ? 'primary' : 'secondary'}" type="button" data-hub="${HUB_ROUTE[s]}">${LEAGUE_PAGES[s]}</button>`).join('') +
    `</div>`;
}

function leagueHub(scope) {
  return {
    title: LEAGUE_PAGES[scope], tab: 'leagues', back: scope !== 'domestic',
    async render(q, el) {
      /* الروابط القديمة #/leagues?l=PL المفروض تفتح البطولة نفسها */
      if (scope === 'domestic' && q && q.l) { go('league', { l: q.l }); return; }
      const idx = await arabIndex();
      const arab = (idx && idx.leagues) || [];
      let html = hubTabs(scope);

      if (scope === 'domestic') {
        const countries = new Set();
        Object.keys(COUNTRY).forEach(c => { if (!CUP_LEAGUE[c] && !SUPERCUPS.includes(c) && !NON_DOMESTIC_SET.has(c)) countries.add(COUNTRY[c]); });
        Object.keys(WOMEN_DOMESTIC).forEach(c => countries.add(c));
        Object.keys(SUPER_COUNTRY).forEach(c => countries.add(SUPER_COUNTRY[c]));
        const PREF = ARAB_COUNTRIES;
        const list = [...countries].sort((a, b) => {
          const ia = PREF.indexOf(a), ib = PREF.indexOf(b);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
        html += `
          <div class="section">
            <div class="head"><h2>🌍 الدول والبطولات المحلية</h2><p>اضغط على الدولة تشوف كل بطولاتها (دوري + كؤوس + سوبر + أخبار) في صفحة لوحدها.</p></div>
            <div class="ctryGrid">${list.map(countryCard).join('')}</div>
          </div>
          <div class="section">
            <div class="head"><h2>🏅 كل بطولات السوبر</h2><p>${SUPERCUPS.length} سوبر محلي — كل واحد في صفحة مستقلة.</p></div>
            <div class="compGrid">${SUPERCUPS.map(compCard).join('')}</div>
          </div>
          <div class="section">
            <div class="head"><h2>🌍 العربي</h2></div>
            <div class="compGrid">
              <a class="compCard" href="#/arab"><b>العالم العربي</b><small>كل البطولات العربية والأخبار</small></a>
              ${arab.slice(0, 6).map(l => compCard(l.code)).join('')}
            </div>
          </div>`;
      }

      if (scope === 'continental' || scope === 'world') {
        const rows = LEAGUE_ROWS[scope];
        html += rows.map(([label, codes]) => {
          const list = codes.filter(c => LN[c]);
          if (!list.length) return '';
          return `<div class="section">
            <div class="head"><h2>${label}</h2><p>${list.length} بطولة</p></div>
            <div class="compGrid">${list.map(compCard).join('')}</div>
          </div>`;
        }).join('');
        html += `<div class="disclaimer">كل بطولة ليها صفحة مستقلة فيها الترتيب، المباريات، الأدوار الإقصائية بالرسم، الهدافين، والسجل التاريخي.</div>`;
      }

      if (scope === 'women') {
        html += `
          <div class="heroCard" style="margin-bottom:14px">
            <div class="eyebrow">WOMEN'S FOOTBALL</div>
            <h2>كرة القدم <span>للسيدات</span><br>بكل البطولات.</h2>
            <p>${WOMEN_CODES.length} بطولة: دوريات محلية، أبطال أوروبا وأفريقيا وآسيا وأمريكا الجنوبية، وكأس العالم للأندية والمنتخبات.</p>
            <span class="ball" aria-hidden="true">⚽</span>
          </div>
          <div class="section">
            <div class="head"><h2>🌍 الدوريات المحلية للسيدات</h2></div>
            <div class="ctryGrid">${Object.keys(WOMEN_DOMESTIC).map(ctry => `<a class="ctryCard" href="#/country?c=${encodeURIComponent(ctry)}">
              <span class="ctryFlag">${COUNTRY_FLAG[ctry] || '👩'}</span>
              <span class="ctryName">${esc(ctry)}</span>
              <small>${WOMEN_DOMESTIC[ctry].length} بطولة • ${esc(WOMEN_DOMESTIC[ctry].slice(0, 2).map(c => LN[c]).join('، '))}</small>
            </a>`).join('')}</div>
          </div>
          <div class="section">
            <div class="head"><h2>🏆 البطولات القارية للسيدات</h2><p>${WOMEN_CONTINENTAL.length} بطولة</p></div>
            <div class="compGrid">${WOMEN_CONTINENTAL.map(compCard).join('')}</div>
          </div>
          <div class="section">
            <div class="head"><h2>🌐 البطولات العالمية للسيدات</h2><p>${WOMEN_WORLD.length} بطولة</p></div>
            <div class="compGrid">${WOMEN_WORLD.map(compCard).join('')}</div>
          </div>`;
      }

      el.innerHTML = html;
      el.querySelectorAll('[data-hub]').forEach(b => b.onclick = () => go(b.dataset.hub));
    }
  };
}

const NON_DOMESTIC_SET = new Set([...CONTINENTAL, ...CONTINENTAL_SUPERS, ...WORLD_CLUB,
  ...WORLD_NT, ...NT_CONTINENTAL, ...YOUTH, ...WOMEN_CODES]);

screen('leagues', leagueHub('domestic'));
screen('continental', leagueHub('continental'));
screen('world', leagueHub('world'));
screen('women', leagueHub('women'));
