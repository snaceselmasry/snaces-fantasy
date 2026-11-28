'use strict';
/* ============================================================
   صفحة الدولة — #/country?c=مصر
   كل بطولات البلد (رجال + سيدات) + مباريات قادمة + أخبار البلد
   ============================================================ */
const CTRY_WORDS = {
  'إنجلترا': ['إنجلترا', 'الإنجليزي', 'البريميرليج', 'مانشستر', 'ليفربول', 'أرسنال', 'تشيلسي', 'توتنهام', 'نيوكاسل'],
  'إسبانيا': ['إسبانيا', 'الإسباني', 'الليجا', 'ريال مدريد', 'برشلونة', 'أتلتيكو', 'إشبيلية'],
  'إيطاليا': ['إيطاليا', 'الإيطالي', 'الكالتشيو', 'يوفنتوس', 'إنتر', 'ميلان', 'نابولي', 'روما'],
  'ألمانيا': ['ألمانيا', 'الألماني', 'البوندسليجا', 'بايرن', 'دورتموند', 'ليفركوزن'],
  'فرنسا': ['فرنسا', 'الفرنسي', 'باريس سان جيرمان', 'مارسيليا', 'ليون', 'موناكو'],
  'البرتغال': ['البرتغال', 'البرتغالي', 'بنفيكا', 'بورتو', 'سبورتنج'],
  'تركيا': ['تركيا', 'التركي', 'جالطة سراي', 'غلطة سراي', 'فنربخشة', 'بشكتاش'],
  'البرازيل': ['البرازيل', 'البرازيلي', 'فلامنجو', 'بالميراس', 'سانتوس', 'كورينثيانز'],
  'مصر': ['مصر', 'المصري', 'الأهلي', 'الزمالك', 'الدوري المصري', 'منتخب مصر', 'بيراميدز'],
  'السعودية': ['السعودية', 'السعودي', 'الهلال', 'النصر', 'الاتحاد', 'الأهلي السعودي', 'دوري روشن'],
  'المغرب': ['المغرب', 'المغربي', 'الرجاء', 'الوداد', 'الجيش الملكي', 'المنتخب المغربي'],
  'تونس': ['تونس', 'التونسي', 'الترجي', 'النجم الساحلي', 'الصفاقسي', 'منتخب تونس'],
  'الجزائر': ['الجزائر', 'الجزائري', 'شباب بلوزداد', 'مولودية الجزائر', 'وفاق سطيف'],
  'الإمارات': ['الإمارات', 'الإماراتي', 'العين', 'الجزيرة', 'شباب الأهلي'],
  'قطر': ['قطر', 'القطري', 'السد', 'الدحيل', 'الريان', 'العربي'],
  'العراق': ['العراق', 'العراقي', 'الشرطة', 'الزوراء', 'القوة الجوية', 'منتخب العراق'],
  'الأردن': ['الأردن', 'الأردني', 'الفيصلي', 'الوحدات', 'منتخب الأردن'],
  'الكويت': ['الكويت', 'الكويتي', 'القادسية', 'الكويت', 'العربي الكويتي'],
  'عمان': ['عمان', 'العماني', 'السويق', 'ظفار', 'نهضة بركان'],
  'البحرين': ['البحرين', 'البحريني', 'الرفاع', 'المحرق'],
  'الولايات المتحدة': ['أمريكا', 'الأمريكي', 'MLS', 'إنتر ميامي', 'لوس أنجلوس', 'سياتل'],
  'المكسيك': ['المكسيك', 'المكسيكي', 'Liga MX', 'أمريكا المكسيكي', 'مونتيري', 'تيجريس'],
  'الأرجنتين': ['الأرجنتين', 'الأرجنتيني', 'بوكا', 'ريفر بليت', 'منتخب الأرجنتين', 'ميسي'],
  'كولومبيا': ['كولومبيا', 'الكولومبي', 'أتلتيكو ناسيونال', 'مليوناريوس']
};

screen('country', {
  title: 'الدولة', tab: 'leagues', back: true,
  async render(q, el) {
    const ctry = q.c || 'مصر';
    const flag = COUNTRY_FLAG[ctry] || '🏳️';
    $('#screenTitle').textContent = ctry;

    const men = compsOfCountry(ctry);
    const wm = womenCompsOfCountry(ctry);
    const words = [ctry, ...(CTRY_WORDS[ctry] || [])];

    el.innerHTML = `
      <div class="dataPanel ctryHead" style="padding:14px;margin-bottom:12px">
        <div class="lgTitle"><b>${flag} ${esc(ctry)}</b><span class="pill">${men.length + wm.length} بطولة</span></div>
        <div class="chips" style="margin-top:8px">
          <a class="btn secondary" href="#/arab">العالم العربي ›</a>
          <a class="btn secondary" href="#/leagues">كل الدول ›</a>
        </div>
      </div>
      <div id="ctryBody"><div class="skel" style="height:180px"></div></div>`;

    /* أخبار البلد */
    const newsAll = (await getJSON('data/news.json')) || { items: [] };
    const news = (newsAll.items || []).filter(n => words.some(w => String(n.t || '').includes(w))).slice(0, 8);

    /* مباريات قادمة من بطولات البلد (أول 4 بطولات) */
    const codes = [...new Set([...men, ...wm])].slice(0, 4);
    const packs = await Promise.all(codes.map(c => leagueData(c).catch(() => null)));
    const up = [];
    packs.forEach((D, i) => {
      ((D && D.matches) || []).forEach(m => {
        if (['FINISHED', 'CANCELLED', 'POSTPONED', 'SUSPENDED'].includes(m.status)) return;
        up.push({ ...m, l: codes[i] });
      });
    });
    up.sort((a, b) => new Date(a.date) - new Date(b.date));
    const next = up.slice(0, 8);

    $('#ctryBody', el).innerHTML = `
      <div class="section">
        <div class="head"><h2>🏆 بطولات ${esc(ctry)}</h2><p>اضغط على أي بطولة تفتح صفحتها المستقلة.</p></div>
        ${men.length ? `<div class="compGrid">${men.map(c => `<a class="compCard" href="#/league?l=${c}">
            <b>${esc(LN[c] || c)}</b><small>${SUPERCUPS.includes(c) ? 'سوبر' : CUP_LEAGUE[c] ? 'كأس' : 'دوري'}</small></a>`).join('')}</div>`
          : '<div class="dataPanel"><div class="empty">مفيش بطولات رجالية مسجلة للدولة دي.</div></div>'}
      </div>
      ${wm.length ? `<div class="section">
        <div class="head"><h2>👩 كرة القدم للسيدات</h2><p>${wm.length} بطولة</p></div>
        <div class="compGrid">${wm.map(c => `<a class="compCard" href="#/league?l=${c}"><b>${esc(LN[c] || c)}</b><small>سيدات</small></a>`).join('')}</div>
      </div>` : ''}
      <div class="section">
        <div class="head"><h2>📅 مباريات قادمة</h2></div>
        <div class="dataPanel">
          ${next.length ? next.map(m => `<a class="row" href="#/match?l=${m.l}&id=${m.id}">
              <span>${crest(m.home.crest)}${esc(m.home.name)} <span class="muted">ضد</span> ${crest(m.away.crest)}${esc(m.away.name)}</span>
              <span class="side">${dt(m.date)}<span class="lg">${esc(LN[m.l] || m.l)}</span></span>
            </a>`).join('') : '<div class="empty">مفيش مباريات قادمة معلنة حاليًا.</div>'}
        </div>
      </div>
      <div class="section">
        <div class="head"><h2>📰 أخبار ${esc(ctry)}</h2><a class="btn secondary" href="#/news">كل الأخبار</a></div>
        <div class="dataPanel">
          ${news.length ? news.map(n => `<a class="row" href="${esc(n.u)}" target="_blank" rel="noopener noreferrer">
              <span>${esc(n.t)}</span><span class="side">${n.d ? ago(n.d) : ''} ‹</span></a>`).join('')
            : '<div class="empty">مفيش أخبار مطابقة للدولة دي دلوقتي.</div>'}
        </div>
      </div>`;
  }
});
