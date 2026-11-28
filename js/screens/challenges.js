'use strict';
/* صور حقيقية لقمصان الأندية (أحدث طقم متاح من TheSportsDB + الأهلي المصري) */
const KIT_IMAGES = {
  "برشلونة": "https://r2.thesportsdb.com/images/media/team/equipment/8d0owu1794572729.png",
  "ريال مدريد": "https://r2.thesportsdb.com/images/media/team/equipment/gntr911750591256.png",
  "ليفربول": "https://r2.thesportsdb.com/images/media/team/equipment/xcqwib1789053497.png",
  "مانشستر يونايتد": "https://r2.thesportsdb.com/images/media/team/equipment/3ehp1w1789121144.png",
  "تشيلسي": "https://r2.thesportsdb.com/images/media/team/equipment/pswgm41793651166.png",
  "مانشستر سيتي": "https://r2.thesportsdb.com/images/media/team/equipment/8hmy511789121464.png",
  "يوفنتوس": "https://r2.thesportsdb.com/images/media/team/equipment/nh16rt1795363977.png",
  "ميلان": "https://r2.thesportsdb.com/images/media/team/equipment/bu8fct1785158548.png",
  "بوروسيا دورتموند": "https://r2.thesportsdb.com/images/media/team/equipment/d7umzq1762964863.png",
  "البرازيل (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/hi6ehj1781016313.png",
  "الأرجنتين (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/cjspqb1781016115.png",
  "هولندا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/g3bjsf1781015952.png",
  "الهلال": "https://r2.thesportsdb.com/images/media/team/equipment/4kp1l51750764133.png",
  "النصر": "https://r2.thesportsdb.com/images/media/team/equipment/vtj7z51709495056.png",
  "باريس سان جيرمان": "https://r2.thesportsdb.com/images/media/team/equipment/aq6x061766335844.png",
  "بايرن ميونخ": "https://r2.thesportsdb.com/images/media/team/equipment/c8lpxc1753443030.png",
  "آرسنال": "https://r2.thesportsdb.com/images/media/team/equipment/fwav4f1752100996.png",
  "إنتر": "https://r2.thesportsdb.com/images/media/team/equipment/7et5s11795431817.png",
  "أتلتيكو مدريد": "https://r2.thesportsdb.com/images/media/team/equipment/0u5pcp1794916984.png",
  "أياكس": "https://r2.thesportsdb.com/images/media/team/equipment/0c4ziw1760467715.png",
  "توتنهام": "https://r2.thesportsdb.com/images/media/team/equipment/rdl9lj1789400482.png",
  "نابولي": "https://r2.thesportsdb.com/images/media/team/equipment/tv0e631795193912.png",
  "روما": "https://r2.thesportsdb.com/images/media/team/equipment/o3epam1795180189.png",
  "بورتو": "https://r2.thesportsdb.com/images/media/team/equipment/dgerxo1626624511.png",
  "الاتحاد": "https://r2.thesportsdb.com/images/media/team/equipment/itm48j1709665889.png",
  "الوداد": "https://r2.thesportsdb.com/images/media/team/equipment/ixtery1625379609.png",
  "إسبانيا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/8ssgg31781016784.png",
  "إيطاليا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/3jyfgi1621777811.png",
  "مصر (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/mltm2u1780568796.png",
  "فرنسا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/0zir3s1668513851.png",
  "ألمانيا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/y2brdh1781016680.png",
  "وست هام": "https://r2.thesportsdb.com/images/media/team/equipment/aq4c0d1785687308.png",
  "أستون فيلا": "https://r2.thesportsdb.com/images/media/team/equipment/myv3051785745524.png",
  "نيوكاسل": "https://r2.thesportsdb.com/images/media/team/equipment/9y3pbu1789129177.png",
  "لاتسيو": "https://r2.thesportsdb.com/images/media/team/equipment/m7gfug1795356557.png",
  "سبورتينغ لشبونة": "https://r2.thesportsdb.com/images/media/team/equipment/y1mok81626619486.png",
  "سلتيك": "https://r2.thesportsdb.com/images/media/team/equipment/9lz22m1787856610.png",
  "بنفيكا": "https://r2.thesportsdb.com/images/media/team/equipment/mj8cp01626623880.png",
  "إيفرتون": "https://r2.thesportsdb.com/images/media/team/equipment/tt3hsg1788879971.png",
  "مرسيليا": "https://r2.thesportsdb.com/images/media/team/equipment/pok6qa1766154284.png",
  "العين": "https://r2.thesportsdb.com/images/media/team/equipment/wmtx8r1709569991.png",
  "الأهلي السعودي": "https://r2.thesportsdb.com/images/media/team/equipment/je9dd91750774425.png",
  "بلجيكا (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/sckyth1781016252.png",
  "أوروغواي (منتخب)": "https://r2.thesportsdb.com/images/media/team/equipment/pbybmn1780648606.png",
  "كريستال بالاس": "https://r2.thesportsdb.com/images/media/team/equipment/o69qfl1788797611.png",
  "فولهام": "https://r2.thesportsdb.com/images/media/team/equipment/207eo51788882201.png",
  "برايتون": "https://r2.thesportsdb.com/images/media/team/equipment/snj6531788701467.png",
  "بورنموث": "https://r2.thesportsdb.com/images/media/team/equipment/d291kc1785745600.png",
  "برينتفورد": "https://r2.thesportsdb.com/images/media/team/equipment/2skhr11785745741.png",
  "نوتنغهام فورست": "https://r2.thesportsdb.com/images/media/team/equipment/ygck2p1789381546.png",
  "ليستر سيتي": "https://r2.thesportsdb.com/images/media/team/equipment/j1wc6x1791217169.png",
  "ليدز يونايتد": "https://r2.thesportsdb.com/images/media/team/equipment/iotlm51789053050.png",
  "سيلتيك": "https://r2.thesportsdb.com/images/media/team/equipment/9lz22m1787856610.png",
  "رينجرز": "https://r2.thesportsdb.com/images/media/team/equipment/9zfmpa1788009341.png",
  "ريال سوسيداد": "https://r2.thesportsdb.com/images/media/team/equipment/lnfhxh1793996220.png",
  "أتلتيك بلباو": "https://r2.thesportsdb.com/images/media/team/equipment/eo8isg1794947737.png",
  "إشبيلية": "https://r2.thesportsdb.com/images/media/team/equipment/zrxvd01793985830.png",
  "ريال بيتيس": "https://r2.thesportsdb.com/images/media/team/equipment/stjkyd1794061410.png",
  "فالنسيا": "https://r2.thesportsdb.com/images/media/team/equipment/jpdrde1793973164.png",
  "فياريال": "https://r2.thesportsdb.com/images/media/team/equipment/fv7mnt1793971809.png",
  "خيتافي": "https://r2.thesportsdb.com/images/media/team/equipment/sf8xr61794572134.png",
  "سيلتا فيغو": "https://r2.thesportsdb.com/images/media/team/equipment/wuf0sv1794862444.png",
  "إسبانيول": "https://r2.thesportsdb.com/images/media/team/equipment/4zxpyt1794591092.png",
  "فيورنتينا": "https://r2.thesportsdb.com/images/media/team/equipment/mrwez41795552378.png",
  "أتالانتا": "https://r2.thesportsdb.com/images/media/team/equipment/30srzv1795627609.png",
  "بولونيا": "https://r2.thesportsdb.com/images/media/team/equipment/7ewqh81785172588.png",
  "تورينو": "https://r2.thesportsdb.com/images/media/team/equipment/9e0hp81795103699.png",
  "جنوى": "https://r2.thesportsdb.com/images/media/team/equipment/whlolp1795466617.png",
  "بايرن ليفركوزن": "https://r2.thesportsdb.com/images/media/team/equipment/4xz0nb1753441371.png",
  "لايبزيغ": "https://r2.thesportsdb.com/images/media/team/equipment/rw33f71763560197.png",
  "آينتراخت فرانكفورت": "https://r2.thesportsdb.com/images/media/team/equipment/e7zay71753449825.png",
  "شتوتغارت": "https://r2.thesportsdb.com/images/media/team/equipment/gx4l1n1763582814.png",
  "بوروسيا مونشنغلادباخ": "https://r2.thesportsdb.com/images/media/team/equipment/e8an3i1753448801.png",
  "فيردر بريمن": "https://r2.thesportsdb.com/images/media/team/equipment/h6hooi1763644019.png",
  "مارسيليا": "https://r2.thesportsdb.com/images/media/team/equipment/pok6qa1766154284.png",
  "ليون": "https://r2.thesportsdb.com/images/media/team/equipment/hglvbk1766149255.png",
  "موناكو": "https://r2.thesportsdb.com/images/media/team/equipment/96h6b91766238605.png",
  "ليل": "https://r2.thesportsdb.com/images/media/team/equipment/01h47e1792578467.png",
  "رين": "https://r2.thesportsdb.com/images/media/team/equipment/t72yex1766138500.png",
  "نيس": "https://r2.thesportsdb.com/images/media/team/equipment/wo71i91766320571.png",
  "فلامنغو": "https://r2.thesportsdb.com/images/media/team/equipment/5w0tei1753637451.png",
  "بالميراس": "https://r2.thesportsdb.com/images/media/team/equipment/oswyld1749485127.png",
  "سانتوس": "https://r2.thesportsdb.com/images/media/team/equipment/lpniwe1749480311.png",
  "كورينثيانز": "https://r2.thesportsdb.com/images/media/team/equipment/5b7nve1767285372.png",
  "بوكا جونيورز": "https://r2.thesportsdb.com/images/media/team/equipment/j4vsrh1789060490.png",
  "ريفر بليت": "https://r2.thesportsdb.com/images/media/team/equipment/8c46wo1755834946.png",
  "إنتر ميامي": "https://r2.thesportsdb.com/images/media/team/equipment/ycu1yw1766574736.png",
  "غلطة سراي": "https://r2.thesportsdb.com/images/media/team/equipment/wy99qy1779726291.png",
  "فنربخشة": "https://r2.thesportsdb.com/images/media/team/equipment/17uhvy1658264000.png",
  "بشكتاش": "https://r2.thesportsdb.com/images/media/team/equipment/l55pwl1787825757.png",
  "شاختار دونيتسك": "https://r2.thesportsdb.com/images/media/team/equipment/urbqof1779726704.png",
  "دينامو كييف": "https://r2.thesportsdb.com/images/media/team/equipment/358n4e1627895788.png",
  "زينيت": "https://r2.thesportsdb.com/images/media/team/equipment/8eb9mb1626378962.png",
  "الاتحاد السعودي": "https://r2.thesportsdb.com/images/media/team/equipment/itm48j1709665889.png",
  "النجم الساحلي": "https://r2.thesportsdb.com/images/media/team/equipment/3wu1my1623860962.png",
  "مولودية الجزائر": "https://r2.thesportsdb.com/images/media/team/equipment/y9vtpd1619447712.png",
  "شباب بلوزداد": "https://r2.thesportsdb.com/images/media/team/equipment/8az7ge1619447579.png",
  "الأهلي الإماراتي": "https://r2.thesportsdb.com/images/media/team/equipment/2020-137828-Jersey.png",
  "باير ليفركوزن": "https://r2.thesportsdb.com/images/media/team/equipment/4xz0nb1753441371.png",
  "شالكه": "https://r2.thesportsdb.com/images/media/team/equipment/38zufj1773612215.png",
  "فولفسبورغ": "https://r2.thesportsdb.com/images/media/team/equipment/io3rnz1763668281.png",
  "فينورد": "https://r2.thesportsdb.com/images/media/team/equipment/qdetju1760527562.png",
  "أيندهوفن": "https://r2.thesportsdb.com/images/media/team/equipment/e3kuej1760788746.png",
  "لانس": "https://r2.thesportsdb.com/images/media/team/equipment/8zq9m81765991298.png",
  "نانت": "https://r2.thesportsdb.com/images/media/team/equipment/368fh81689597615.png",
  "بوردو": "https://r2.thesportsdb.com/images/media/team/equipment/4s7xs41628607516.png",
  "سانت إتيان": "https://r2.thesportsdb.com/images/media/team/equipment/k8fdzq1755980093.png",
  "أودينيزي": "https://r2.thesportsdb.com/images/media/team/equipment/76j0oo1795038252.png",
  "هامبورغ": "https://r2.thesportsdb.com/images/media/team/equipment/dm0qd81763384834.png",
  "كولن": "https://r2.thesportsdb.com/images/media/team/equipment/ti93xh1763209884.png",
  "هوفنهايم": "https://r2.thesportsdb.com/images/media/team/equipment/zq3o4z1763485984.png",
  "بي إس في": "https://r2.thesportsdb.com/images/media/team/equipment/e3kuej1760788746.png",
  "الأهلي المصري": "assets/kits/al-ahly.jpg"
};
/* ============ التحديات والألعاب (أسئلة + ألعاب جلسة + تاريخية) ============ */
screen('challenges', {
  title: 'الألعاب والتحديات', tab: 'games',
  async render(q, el) {
    const N = 5, K = dayKey();
    let cur = ACC.get('snaces_game', 'daily');
    if (!G.some(g => g[0] === cur)) cur = 'daily';
    let lv = [1, 2, 3].includes(ACC.get('snaces_lv', 1)) ? ACC.get('snaces_lv', 1) : 1;
    let cat = ACC.get('snaces_cat', 'all');
    if (cat !== 'auto' && !CATS.some(c => c[0] === cat)) cat = 'all';
    /* فتح لعبة أو قسم مباشرة من لينك: #/challenges?game=cat&cat=arab */
    if (q.game && G.some(g => g[0] === q.game)) cur = q.game;
    /* وضع لعبة واحدة: #/games/<id> أو #/challenges?single=cat */
    const focus = q.single && G.some(g => g[0] === q.single) ? q.single : null;
    if (focus) cur = focus;
    /* auto بيتضاف للتصنيفات بعد تحميل أسئلة اليوم، فبنقبله هنا */
    if (q.cat && (q.cat === 'auto' || CATS.some(c => c[0] === q.cat))) cat = q.cat;
    let timer = null, HOME = null, FPLD = null;

    const home = async () => HOME || (HOME = (await getJSON('data/home.json')) || {});
    const fpl = async () => FPLD || (FPLD = await getJSON('data/fpl.json'));
    /* صور حقيقية: شارة النادي + صورة اللاعب (Premier League) */
    /* بدائل محلية لو أي صورة خارجية فشلت — من غير أيقونة صورة مكسورة */
    const FB_BADGE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#1d2b22"/><path d="M20 7l10 4.4v8.2c0 6.6-4.2 10.7-10 13.4-5.8-2.7-10-6.8-10-13.4V11.4z" fill="#3c5a48"/><path d="M20 15l4 1.8v3.4c0 2.8-1.7 4.6-4 5.8-2.3-1.2-4-3-4-5.8v-3.4z" fill="#7fd8a5"/></svg>');
    const FB_FACE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#1d2b22"/><circle cx="40" cy="31" r="14" fill="#3c5a48"/><path d="M16 70c2-17 11-25 24-25s22 8 24 25z" fill="#3c5a48"/></svg>');
    const badge = (t, cls) => (t && t.code ? `<img class="tbadge${cls ? ' ' + cls : ''}" src="${plBadge(t.code)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${FB_BADGE}" onerror="this.onerror=null;this.src=this.dataset.fb">` : '');
    const face = (p, cls) => {
      const u = p && p.photo ? plPhoto(p.photo) : '';
      return u ? `<img class="${cls || 'pImg'}" src="${u}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${FB_FACE}" onerror="this.onerror=null;this.src=this.dataset.fb;this.style.objectFit='contain'">` : '';
    };

    let st = ACC.get('snaces_day', null);
    if (!st || st.date !== K || st.v !== 3) st = { date: K, v: 3, i: 0, score: 0, done: false };
    /* بنك أسئلة اليوم: بيتولّد آليًا من أحدث بيانات البطولات */
    await ensureDailyQuestions();
    const qs = pickQ(K);
    const WK = qbWeekInfo().key;
    let wk = ACC.get('snaces_week', null);
    if (!wk || wk.week !== WK) wk = { week: WK, i: 0, score: 0, done: false };
    let sk = ACC.get('snaces_streak', { last: '', count: 0, best: 0 });

    const gameName = (G.find(g => g[0] === (focus || cur)) || [])[1] || 'لعبة';
    const info = typeof GAME_INFO !== 'undefined' && GAME_INFO[focus || cur] ? GAME_INFO[focus || cur] : null;
    if (focus) {
      const st = document.getElementById('screenTitle');
      if (st) st.textContent = gameName;
      document.title = gameName + ' | SNACES FOOTBALL';
    }
    el.innerHTML = focus ? `
      <div class="between" style="margin-bottom:8px">
        <div>
          <h2 style="margin:0;font-size:18px">${info ? info.icon : '🎮'} ${esc(gameName)}</h2>
          <p class="muted tiny" id="dsub" style="margin:2px 0 0">${esc((info && info.desc) || 'لعبة من SNACES FOOTBALL')}</p>
        </div>
        <div class="kpi" style="min-width:96px;padding:8px 12px">
          <small>أيام متتالية 🔥</small><strong class="green" id="streak">0</strong>
        </div>
      </div>
      <div class="gameFocusNav">
        <a class="btn secondary" href="#/games">‹ كل الألعاب</a>
        <a class="btn secondary" href="#/challenges">🏆 التحديات</a>
      </div>
      <div class="cmpBar" id="lv" style="margin:8px 0 12px"></div>
      <div class="dataPanel" id="game" style="padding:14px"></div>
      <div class="disclaimer" style="margin-top:12px">النتائج بتتحفظ على جهازك، وبتتزامن مع حسابك لو مسجل دخول.</div>` : `
      <div class="between" style="margin-bottom:10px">
        <div>
          <h2 style="margin:0;font-size:18px">🎯 التحديات والألعاب</h2>
          <p class="muted tiny" id="dsub" style="margin:2px 0 0"></p>
        </div>
        <div class="kpi" style="min-width:96px;padding:8px 12px">
          <small>أيام متتالية 🔥</small><strong class="green" id="streak">0</strong>
        </div>
      </div>
      <div class="gameLinks">
        <a class="gameLink" href="#/games"><b>🎮 كل الألعاب</b><small>${G.length} لعبة — اختار والعب</small></a>
        <a class="gameLink" href="#/challenges"><b>🏆 التحديات</b><small>يومي وأسبوعي + إنجازات</small></a>
      </div>
      <div id="chstatus"></div>
      <a class="rBanner" href="#/rooms">
        <span class="rBannerIc">👥</span>
        <span><b>العب مع صحابك</b><small>غرفة بينك وبين صاحبك — كونكت فور والتمثيل</small></span>
        <span class="side">‹</span>
      </a>
      <div class="between" style="margin-bottom:6px;gap:6px">
        <select class="control" id="quickGame" style="flex:1;min-width:0"></select>
        <button class="btn secondary" id="randGame" type="button">🎲 عشوائي</button>
      </div>
      <div id="gt"></div>
      <div class="cmpBar" id="lv" style="margin:8px 0 12px"></div>
      <div class="dataPanel" id="game" style="padding:14px"></div>
      <div id="achv"></div>
      <div class="disclaimer" style="margin-top:12px">
        نتايجك وسلسلتك بتتحفظ على جهازك بس. تحدي اليوم: 5 أسئلة جديدة كل يوم. باقي الألعاب تتعاد قد ما تحب،
        وتقدر تغيّر المستوى (سهل / متوسط / صعب). شارات الأندية وصور اللاعبين حقيقية،
        والقمصان والتشكيلات مرسومة بألوان الأندية.
      </div>`;

    const game = $('#game', el), gt = $('#gt', el), lvb = $('#lv', el), streakEl = $('#streak', el);
    game.addEventListener('keydown', (e) => {
      const opts = game.querySelectorAll('#opts button');
      if (!opts.length) return;
      const k = e.key;
      if (k >= '1' && k <= '4') {
        const idx = +k - 1;
        if (opts[idx] && !opts[idx].disabled) { opts[idx].click(); e.preventDefault(); }
      }
    });
    if (!focus) $('#dsub', el).textContent = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

    /* ---------- محرك تحدي اليوم ---------- */
    function mulberry(seed) {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    /* دالة مرفوعة (hoisted) عشان pickQ يقدر ينادى قبل تعريفها */
    function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
    function pickQ(k) {
      const r = mulberry(hash('snaces' + k));
      const sh = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
      return [[1, 2], [2, 2], [3, 1]]
        .flatMap(([l, n]) => sh(QB.filter(x => x[1] === l)).slice(0, n))
        .map(row => ({ id: row[7], q: row[2], o: sh(row.slice(3,7).map((t, j) => ({ t, ok: j === 0 }))) }));
    }

    const shownStreak = () => { streakEl.textContent = (sk.last === K || sk.last === yest(K)) ? sk.count : 0; };
    function finish() {
      if (st.done) return;
      st.done = true;
      ACC.set('snaces_day', st);
      if (sk.last !== K) {
        sk.count = sk.last === yest(K) ? sk.count + 1 : 1;
        sk.last = K;
        sk.best = Math.max(sk.best, sk.count);
        ACC.set('snaces_streak', sk);
      }
    }

    function dailyG() {
      shownStreak();
      if (st.i >= N) {
        finish();
        shownStreak();
        const msg = st.score === N ? 'ممتاز! كلها صح 🏆' : st.score >= 3 ? 'شغل حلو 👏' : 'حاول تاني بكرة 💪';
        const txt = `SNACES FOOTBALL ⚽ ${K} — ${st.score}/${N} 🔥${sk.count}`;
        game.innerHTML = `
          <h3 style="margin:0 0 6px">نتيجتك: ${st.score} من ${N}</h3>
          <p class="small">${msg}</p>
          <p class="muted small">تعالى بكرة لأسئلة جديدة، وجرّب الألعاب التانية فوق 👆</p>
          <button class="btn primary" id="share" type="button" style="margin-top:8px">انسخ النتيجة</button>`;
        $('#share', game).onclick = () => copyText(txt);
        return;
      }
            const q = qs[st.i];
      if (q.id && typeof QBHistory !== 'undefined') QBHistory.mark([q.id]);

      game.innerHTML = `
        <div class="quizmeta"><span>سؤال ${st.i + 1} من ${N} • من السهل للصعب</span><span>صح <b id="qscore">${st.score}</b></span></div>
        <h3 style="margin:2px 0 12px;font-size:15px">${esc(q.q)}</h3>
        <div id="opts">${q.o.map((o, j) => `<button class="btn secondary opt" type="button" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>
        <div class="fb" id="fb" role="status" aria-live="polite"></div>`;
      $$('#opts button', game).forEach(b => b.onclick = () => answerDaily(+b.dataset.j));
    }
    function answerDaily(j) {
      const q = qs[st.i];
      const bs = $$('#opts button', game);
      if (bs.some(b => b.disabled)) return;
      bs.forEach((b, i) => {
        b.disabled = true;
        if (q.o[i].ok) b.classList.add('correct');
        else if (i === j) b.classList.add('wrong');
      });
      const ok = q.o[j].ok;
      if (ok) st.score++;
      st.i++;
      ACC.set('snaces_day', st);
      const qsEl = $('#qscore', game);
      if (qsEl) qsEl.textContent = st.score;
      $('#fb', game).innerHTML = (ok ? '✅ صح!' : `❌ غلط — الإجابة: ${esc(q.o.find(o => o.ok).t)}`) +
        ` <button class="btn secondary" id="nx" type="button">${st.i >= N ? 'النتيجة' : 'التالي'}</button>`;
      $('#nx', game).onclick = dailyG;
    }

    /* ---------- تحدي الأسبوع ---------- */
    const WN = 10;
    let wqs = null;
    function weekQ() {
      if (wqs) return wqs;
      const r = mulberry(hash('snaces-week' + WK));
      const sh = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
      wqs = [[1, 4], [2, 4], [3, 2]]
        .flatMap(([l, n]) => sh(QB.filter(x => x[1] === l)).slice(0, n))
        .map(row => ({ id: row[7], q: row[2], lv: row[1], o: sh(row.slice(3,7).map((t, j) => ({ t, ok: j === 0 }))) }));
      return wqs;
    }
    function weeklyG() {
      shownStreak();
      const qsW = weekQ();
      const leftTxt = qbTimeLeft(qbWeekInfo().end);
      if (wk.done || wk.i >= WN) {
        if (!wk.done) { wk.done = true; ACC.set('snaces_week', wk); }
        const reward = 50 + wk.score * 10;
        const pts = ACC.get('snaces_pts', 0) + (wk.rewarded ? 0 : reward);
        if (!wk.rewarded) { wk.rewarded = true; ACC.set('snaces_week', wk); ACC.set('snaces_pts', pts); }
        const bestW = Math.max(wk.score, ACC.get('snaces_best_weekly', 0));
        ACC.set('snaces_best_weekly', bestW);
        game.innerHTML = `
          <div class="chDone">
            <div class="chDoneIc">🏆</div>
            <h3 style="margin:0 0 4px">خلصت تحدي الأسبوع</h3>
            <p class="small">نتيجتك: <b class="green">${wk.score}</b> من ${WN} • مكافأة <b>+${reward}</b> نقطة</p>
            <p class="muted small">أفضل نتيجة أسبوعية: ${bestW} • إجمالي نقاطك: ${ACC.get('snaces_pts', 0)}</p>
            <p class="muted tiny">تحدي جديد يوم الأحد • باقي ${leftTxt}</p>
            <div class="vs" style="margin-top:8px">
              <button class="btn primary" id="wshare" type="button" style="flex:1">انسخ النتيجة</button>
              <a class="btn secondary" href="#/games" style="flex:1">كل الألعاب</a>
            </div>
          </div>`;
        $('#wshare', game).onclick = () => {
          const end = new Date(qbWeekInfo().end);
          const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
          const fmt = d => d.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long' });
          const link = (typeof SITE_URL !== 'undefined' ? SITE_URL : location.origin) + '/#/game?g=weekly';
          copyText(`⚽ SNACES FOOTBALL\n🏆 تحدي الأسبوع (${fmt(start)} – ${fmt(end)} ${end.getFullYear()})\nنتيجتي: ${wk.score}/${WN}\nجرّب التحدي من هنا:\n${link}`);
        };
        achievementsUI();
        return;
      }
      if (wk.i === 0) {
        game.innerHTML = `
          <div class="chHero">
            <div class="chHeroIc">📅</div>
            <div>
              <h3 style="margin:0 0 4px">تحدي الأسبوع</h3>
              <p class="muted small" style="margin:0">${WN} أسئلة متنوعة — سهل ومتوسط وصعب. باقي ${leftTxt}.</p>
            </div>
          </div>
          <div class="chPills"><span>🎯 ${WN} أسئلة</span><span>⭐ حتى ${50 + WN * 10} نقطة</span><span>🏅 إنجاز أسبوعي</span></div>
          <button class="btn primary" id="wgo" type="button" style="width:100%;margin-top:8px">ابدأ التحدي</button>`;
        $('#wgo', game).onclick = () => { wk.i = 1; ACC.set('snaces_week', wk); weeklyG(); };
        return;
      }
      const idx = wk.i - 1, q = qsW[idx];
      if (!q) { wk.done = true; ACC.set('snaces_week', wk); weeklyG(); return; }
      if (q.id && typeof QBHistory !== 'undefined') QBHistory.mark([q.id]);
      game.innerHTML = `
        <div class="quizmeta"><span>سؤال ${wk.i} من ${WN} • أسبوعي</span><span>نقاطك ${wk.score}</span></div>
        <div class="qtrack"><span style="width:${(idx / WN) * 100}%"></span></div>
        <h3 style="margin:2px 0 12px;font-size:15px">${esc(q.q)}</h3>
        <div id="opts">${q.o.map((o, j) => `<button class="btn secondary opt" type="button" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>
        <div class="fb" id="fb" role="status" aria-live="polite"></div>
        <p class="muted tiny" style="margin-top:8px">باقي ${leftTxt}</p>`;
      $$('#opts button', game).forEach(b => b.onclick = () => {
        const bs = $$('#opts button', game);
        if (bs.some(x => x.disabled)) return;
        const j = +b.dataset.j;
        bs.forEach((x, k) => {
          x.disabled = true;
          if (q.o[k].ok) x.classList.add('correct');
          else if (k === j) x.classList.add('wrong');
        });
        if (q.o[j].ok) wk.score++;
        wk.i++;
        ACC.set('snaces_week', wk);
        $('#fb', game).innerHTML = (q.o[j].ok ? '✅ صح!' : `❌ غلط — الإجابة: ${esc(q.o.find(o => o.ok).t)}`) +
          ` <button class="btn secondary" id="nx" type="button">${wk.i >= WN ? 'النتيجة' : 'التالي'}</button>`;
        $('#nx', game).onclick = weeklyG;
      });
    }

    /* ---------- بانر تاريخي مصوّر لأسئلة البطولات ---------- */
    const HIST_META = { wc: ['🌍', 'كأس العالم'], euro: ['🏆', 'كأس أوروبا'], cl: ['🏆', 'دوري أبطال أوروبا'], afcon: ['🌍', 'كأس أمم أفريقيا'] };
    function histBanner(code, sub) {
      const m = HIST_META[code] || ['🏆', HCOMP[code] || code];
      return `<div class="histBanner"><span aria-hidden="true">${m[0]}</span><div><b>${esc(m[1])}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div></div>`;
    }

    /* ---------- محرك أسئلة اختيار من متعدد ---------- */
    function runQuiz(box, items, bestKey, again) {
      let i = 0, sc = 0, correctN = 0, locked = false;
      if (!items.length) {
        box.innerHTML = '<div class="emptyQuiz"><b>خلصت الأسئلة المتاحة</b><p class="muted small">جرّب مستوى أو تصنيف تاني، أو ارجع بكرة لأسئلة جديدة.</p></div>';
        return;
      }
      const show = () => {
        if (i >= items.length) {
          const best = Math.max(sc, ACC.get(bestKey, 0));
          ACC.set(bestKey, best);
          box.innerHTML = `
            <h3 style="margin:0 0 6px">نتيجتك: ${sc} نقطة</h3>
            <p class="small">${correctN} إجابة صح من ${items.length}</p>
            <p class="muted small">أفضل نتيجة في المستوى ده: ${best} نقطة</p>
            <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
          $('#again', box).onclick = again;
          return;
        }
        const q = items[i];
        box.innerHTML = `
          <div class="quizmeta"><span>سؤال ${i + 1} من ${items.length}</span><span>نقاطك ${sc}</span></div>
          ${q.pre || ''}
          <h3 style="margin:2px 0 12px;font-size:15px">${esc(q.q)}</h3>
          <div id="opts">${q.o.map((o, j) => `<button class="btn secondary opt" type="button" data-j="${j}">${o.img || ''}<span class="optTxt">${esc(o.t)}</span></button>`).join('')}</div>
          <div class="fb" id="fb"></div>`;
        $$('#opts button', box).forEach(b => b.onclick = () => {
          if (locked) return;
          locked = true;
          const j = +b.dataset.j, ok = q.o[j].ok;
          if (ok) { sc += q.pts || 10; correctN++; }
          const scoreEl = box.querySelector('.quizmeta span:last-child');
          if (scoreEl) scoreEl.textContent = 'نقاطك ' + sc;
          $$('#opts button', box).forEach((x, k) => {
            x.disabled = true;
            if (q.o[k].ok) x.classList.add('correct');
            else if (k === j) x.classList.add('wrong');
          });
          const right = (q.o.find(o => o.ok) || {}).t || '';
          $('#fb', box).innerHTML = (ok ? '✅ صح!' : '❌ غلط' + (right ? ' — الصح: ' + esc(right) : '')) +
            (q.exp ? `<div class="muted small" style="margin-top:4px;line-height:1.7">${esc(q.exp)}</div>` : '') +
            shirtFor(right, 74) + (q.reveal || playerReveal(right)) +
            ` <button class="btn secondary" id="nx" type="button">${i + 1 >= items.length ? 'النتيجة' : 'التالي'}</button>`;
          $('#nx', box).onclick = () => { i++; locked = false; show(); };
        });
      };
      show();
    }

    /* ---------- أسئلة بالأقسام ---------- */
    function catG() {
      game.innerHTML = `
        <div class="chips" id="cats" style="margin-bottom:10px">
          ${CATS.map(([k, n]) => `<button class="btn ${k === cat ? 'primary' : 'secondary'}" type="button" data-c="${k}">${n}</button>`).join('')}
        </div>
        <div id="qa"></div>`;
      $$('#cats button', game).forEach(b => b.onclick = () => { cat = b.dataset.c; ACC.set('snaces_cat', cat); catG(); });

      /* كل مستوى من بنكه: مفيش خلط لمستوى تاني عشان الصعوبة تفضل حقيقية */
      const base = QB.filter(r => (cat === 'all' || r[0] === cat) && r[1] === lv);
      const rows = qbTake(base, 12, r => r[7]);
      const items = rows.map(r => ({
        q: r[2],
        pts: [10, 15, 20][r[1] - 1] || 10,
        o: shuf(r.slice(3,7).map((t, j) => ({ t, ok: j === 0 })))
      }));
      runQuiz($('#qa', game), items, 'snaces_best_cat_' + cat + '_' + lv, catG);
    }

    /* ---------- اعرف الفريق من التيشرت ---------- */

    /* قميص احتياطي مرسوم بتفاصيل واقعية: أكمام، ياقة، لمعة قماش، شعار ورقم */
    function shirtSvg(t, w = 170) {
      const id = 'c' + Math.random().toString(36).slice(2, 8);
      const P = 'M62 18 L88 10 Q100 30 112 10 L138 18 L192 56 L170 94 L150 80 L150 192 L50 192 L50 80 L30 94 L8 56 Z';
      const c = t[3], p = t[2];
      let g = `<rect width="200" height="200" fill="${c[0]}"/>`;
      if (p === 'v') for (let i = 1; i < 10; i += 2) g += `<rect x="${i * 20}" width="20" height="200" fill="${c[1]}"/>`;
      else if (p === 'h') for (let i = 1; i < 10; i += 2) g += `<rect y="${i * 20}" width="200" height="20" fill="${c[1]}"/>`;
      else if (p === 'l') g += `<rect width="50" height="200" fill="${c[1]}"/><rect x="150" width="50" height="200" fill="${c[1]}"/>`;
      else if (p === 'b') g += `<rect x="82" width="36" height="200" fill="${c[1]}"/>`;
      else if (p === 'c') g += `<rect x="100" width="100" height="200" fill="${c[1]}"/>`;
      /* لمعة قماش + ظل الأكمام + لمعة أفقية */
      g += `<rect width="200" height="200" fill="url(#${id}s)"/>`;
      g += `<rect x="0" y="0" width="200" height="200" fill="#000" opacity=".10"/>
            <rect x="86" width="28" height="200" fill="#fff" opacity=".10"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" class="shirt" viewBox="0 0 200 200" width="${w}" height="${w}" role="img" aria-label="قميص فريق">
        <defs>
          <clipPath id="${id}"><path d="${P}"/></clipPath>
          <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
            <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity=".28"/>
          </linearGradient>
        </defs>
        <g clip-path="url(#${id})">${g}</g>
        <path d="M150 80 L150 192 L50 192 L50 80 L30 94 L8 56 L62 18 L88 10 Q100 30 112 10 L138 18 L192 56 L170 94 Z" fill="none" stroke="#00000088" stroke-width="2.5"/>
        <path d="M88 10 Q100 30 112 10" fill="none" stroke="#00000070" stroke-width="3"/>
        <path d="M30 94 L50 80 M170 94 L150 80" stroke="#00000055" stroke-width="2"/>
        <path d="M8 56 L30 94" stroke="${c[1] || '#ffffff'}" stroke-width="11" stroke-linecap="round" opacity=".95"/>
        <path d="M192 56 L170 94" stroke="${c[1] || '#ffffff'}" stroke-width="11" stroke-linecap="round" opacity=".95"/>
        <path d="M88 10 Q100 30 112 10" fill="none" stroke="${c[1] || '#ffffff'}" stroke-width="7" opacity=".95"/>
        <path d="M100 34 L100 186" stroke="#000" stroke-width="1" opacity=".12"/>
        <path d="M62 52 h18 v10 q0 9 -9 13 q-9 -4 -9 -13 Z" fill="#ffffff" opacity=".94" stroke="#00000055" stroke-width="1.2"/>
        <path d="M71 57l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#123"/>
        <text x="100" y="128" font-size="40" font-weight="800" text-anchor="middle" fill="#ffffff" opacity=".92" stroke="#00000066" stroke-width="1.6">10</text>
      </svg>`;
    }

    /* صورة القميص الحقيقية، والرسم بديل لو الصورة مش موجودة أو فشل تحميلها */
    function shirt(t, w = 170) {
      const src = KIT_IMAGES[t[0]];
      if (!src) return shirtSvg(t, w);
      const fb = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(shirtSvg(t, w));
      const tile = t[0] === 'الأهلي المصري' ? ' kitPhoto' : '';
      return `<img class="shirt${tile}" src="${src}" width="${w}" height="${w}" alt="قميص فريق" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fb="${fb}" onerror="this.onerror=null;this.src=this.dataset.fb">`;
    }

    /* قميص الفريق المذكور في السؤال */
    const normAr = s => String(s || '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
    /* نفس النادي ممكن يكون له أكثر من طقم في البيانات؛ نعرضه مرة واحدة في الاختيارات */
    const uniqClubs = arr => {
      const seen = new Set();
      return arr.filter(x => {
        const k = normAr(x[0]);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };
    function kitFor(text) {
      if (typeof J === 'undefined' || !text) return null;
      const t = normAr(text);
      let best = null, bestLen = 0;
      for (const k of J) {
        const nm = normAr(k[0]);
        if (nm.length < 4) continue;
        if (t.includes(nm) && nm.length > bestLen) { best = k; bestLen = nm.length; }
      }
      return best;
    }
    function shirtFor(text, w = 110) {
      const k = kitFor(text);
      return k ? `<div class="qshirt">${shirt(k, w)}</div>` : '';
    }

    function jerseyG() {
      const allJ = uniqClubs(J);
      const pool = allJ.filter(x => x[5] === lv);
      if (pool.length < 4) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      const jid = t => 'jersey:' + t[0] + '|' + t[2] + '|' + t[4];
      const opts = t => {
        const take = src => {
          const seen = new Set([t[4]]), out = [];
          for (const x of shuf(src)) {
            if (x[0] === t[0] || seen.has(x[4])) continue;
            seen.add(x[4]); out.push(x);
            if (out.length === 3) break;
          }
          return out;
        };
        const SIM = { s: ['s'], v: ['v', 'h'], h: ['h', 'v'], l: ['l', 'b', 'v'], b: ['b', 'l'], c: ['c', 'v'] };
        let o = take(allJ.filter(x => (lv === 3 ? SIM[t[2]].includes(x[2]) : x[5] <= lv)));
        if (o.length < 3) o = take(allJ);
        return shuf([t, ...o]);
      };
      const items = qbTake(pool, 10, jid).map(t => ({
        pre: shirt(t) + (lv === 2 ? `<p class="muted tiny" style="text-align:center;margin:0 0 8px">الدولة / الدوري: ${esc(t[1])}</p>` : ''),
        q: 'قميص أنهي فريق ده؟',
        pts: [10, 15, 20][lv - 1] || 10,
        o: opts(t).map(x => ({ t: x[0], ok: x === t }))
      }));
      runQuiz(game, items, 'snaces_best_jersey_' + lv, jerseyG);
    }

    /* ---------- رحلة اللاعب ---------- */
    function journeyG() {
      const pool = PJ.filter(x => x[2] <= lv);
      if (pool.length < 4) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      const items = qbTake(pool, 8, t => 'journey:' + t[0]).map(t => ({
        pre: `<div class="journeyPath" style="margin:4px 0 12px">${t[1].map(c => `<span class="journeyStop">${tttCrest(c, 'journeyCrest')}<b>${esc(c)}</b></span>`).join('<i class="journeyArrow" aria-hidden="true">›</i>')}</div>`,
        q: 'مين اللاعب اللي مرّ بالأندية دي بالترتيب؟',
        pts: [10, 15, 20][lv - 1] || 10,
        o: shuf([t, ...shuf(PJ.filter(x => x !== t)).slice(0, 3)]).map(x => ({ t: x[0], ok: x === t }))
      }));
      runQuiz(game, items, 'snaces_best_journey_' + lv, journeyG);
    }

    /* ---------- خمّن الشعار (شارات حقيقية من جداول البطولات) ---------- */
    async function logoG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const codes = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'SAU', 'EGY'];
      const Ds = (await Promise.all(codes.map(c => leagueData(c).catch(() => null))))
        .filter(D => D && D.standings && D.standings.length);
      const groups = Ds.map(D => ({
        code: D.code,
        teams: D.standings.map(r => r.team).filter(t => t && t.crest)
      })).filter(g => g.teams.length >= 8);
      if (!groups.length) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      const items = [];
      for (const g of shuf(groups)) {
        const lim = lv === 1 ? 6 : lv === 2 ? 12 : 99;
        const pool = shuf(g.teams.slice(0, lim));
        for (const t of pool) {
          if (items.length >= 10) break;
          const others = shuf(g.teams.filter(x => x.id !== t.id)).slice(0, 3);
          if (others.length < 3) continue;
          items.push({
            pre: `<div style="text-align:center">${crestBig(t.crest)}</div><p class="muted tiny" style="text-align:center;margin:0 0 8px">من ${esc(LN[g.code] || g.code)}</p>`,
            q: 'ما اسم هذا الفريق؟',
            pts: [10, 15, 20][lv - 1] || 10,
            o: shuf([t, ...others]).map(x => ({ t: x.name, ok: x.id === t.id }))
          });
        }
        if (items.length >= 10) break;
      }
      if (!items.length) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      runQuiz(game, items, 'snaces_best_logo_' + lv, logoG);
    }

    /* ---------- أيهما أكثر؟ ---------- */
    const STATS = [
      ['نقاط الموسم', p => p.total_points, v => v],
      ['السعر', p => p.now_cost / 10, v => '£' + v.toFixed(1)],
      ['نسبة الملكية', p => +p.selected_by_percent, v => v + '%'],
      ['xG المتوقعة', p => +p.expected_goals, v => v.toFixed(1)],
      ['الفورم', p => +p.form, v => v]
    ];
    async function moreG() {
      const F = await fpl();
      if (!F || !F.elements) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      const tm = {};
      F.teams.forEach(t => { tm[t.id] = t.short_name; });
      const pool = F.elements.filter(p => p.minutes > 400).sort((a, b) => b.total_points - a.total_points).slice(0, 150);
      const gapOk = (a, c) => {
        const hi = Math.max(a, c), lo = Math.min(a, c);
        if (hi === lo) return false;
        if (lo <= 0) return lv === 1;
        const r = hi / lo;
        return lv === 1 ? r >= 1.8 : lv === 2 ? (r >= 1.25 && r < 1.8) : r < 1.25;
      };
      const bk = 'snaces_more_best_' + lv;
      let streak = 0, best = ACC.get(bk, 0), A, B, S, locked = false;
      const tmObj = {};
      F.teams.forEach(t => { tmObj[t.id] = t; });
      const nm = p => `${face(p)}${esc(p.web_name)} <small class="muted">${badge(tmObj[p.team], 'sm')}${esc(tm[p.team] || '')}</small>`;

      const show = () => {
        game.innerHTML = `
          <div class="quizmeta"><span>السلسلة: ${streak}</span><span>أفضل: ${best}</span></div>
          <h3 style="margin:2px 0 12px;font-size:15px">مين الأعلى في: ${S[0]}؟</h3>
          <button class="btn secondary opt" type="button" data-w="A">${nm(A)}</button>
          <button class="btn secondary opt" type="button" data-w="B">${nm(B)}</button>
          <div class="fb" id="fb"></div>`;
        $$('.opt', game).forEach(b => b.onclick = () => {
          if (locked) return;
          locked = true;
          const a = S[1](A), c = S[1](B);
          const ok = b.dataset.w === (a > c ? 'A' : 'B');
          $('#fb', game).innerHTML = `${esc(A.web_name)}: <b>${S[2](a)}</b> • ${esc(B.web_name)}: <b>${S[2](c)}</b><br>` + (ok ? '✅ صح!' : '❌ غلط');
          if (ok) {
            streak++;
            if (streak > best) { best = streak; ACC.set(bk, best); }
            $('#fb', game).innerHTML += ' <button class="btn secondary" id="nx" type="button">التالي</button>';
            $('#nx', game).onclick = nextQ;
          } else {
            $('#fb', game).innerHTML += ` — انتهت سلسلتك عند ${streak}. <button class="btn primary" id="nx" type="button">العب تاني</button>`;
            streak = 0;
            $('#nx', game).onclick = nextQ;
          }
        });
      };
      const nextQ = () => {
        locked = false;
        let k = 0;
        do {
          S = STATS[Math.floor(Math.random() * STATS.length)];
          A = pool[Math.floor(Math.random() * pool.length)];
          B = pool[Math.floor(Math.random() * pool.length)];
          k++;
        } while ((A === B || !gapOk(S[1](A), S[1](B))) && k < 400);
        show();
      };
      nextQ();
    }

    /* ---------- من هو اللاعب؟ ---------- */
    let whoRun = null;
    function whoG(keep = false) {
      let pl = W.filter(x => x[2] === lv);
      if (!pl.length) pl = W;
      const run = keep && whoRun ? whoRun : (whoRun = { n: 0, pts: 0 });
      const a = qbTake(pl, 1, x => 'who:' + x[0])[0] || pl[0];
      const opts = shuf([a, ...shuf(W.filter(x => x !== a && x[0] !== a[0])).slice(0, 3)]);
      const wrong = new Set();
      let k = 1, done = false;
      const finishRun = () => {
        if (!document.body.contains(game)) return;
        game.innerHTML = `<h3 style="margin:0 0 6px">خلصت الجولة 🕵️</h3>
          <p class="muted small">جمعت ${run.pts} نقطة من 5 لاعبين.</p>
          <button class="btn primary" id="again" type="button" style="margin-top:8px">جولة جديدة</button>`;
        $('#again', game).onclick = () => whoG(false);
      };

      const show = () => {
        game.innerHTML = `
          <div class="quizmeta"><span>تلميح ${k} من 5</span><span>النقاط الممكنة: ${6 - k}</span></div>
          <h3 style="margin:2px 0 8px;font-size:15px">من هو اللاعب؟</h3>
          <div class="whoMystery" aria-hidden="true">؟</div>
          ${a[1].slice(0, k).map(c => `<div class="clue">${esc(c)}</div>`).join('')}
          <div style="margin-top:10px">
            ${opts.map(o => `<button class="btn secondary opt" type="button" data-n="${esc(o[0])}">${esc(o[0])}</button>`).join('')}
          </div>
          <div class="fb" id="fb"></div>`;
        $$('.opt', game).forEach(b => {
          if (wrong.has(b.dataset.n)) b.disabled = true;
          b.onclick = () => {
            if (done || b.disabled) return;
            if (b.dataset.n === a[0]) {
              done = true;
              const p = 6 - k, tot = ACC.get('snaces_who', 0) + p;
              ACC.set('snaces_who', tot);
              run.pts += p; run.n++;
              if (run.n >= 5) { setTimeout(finishRun, 260); return; }
              $('#fb', game).innerHTML = `✅ صح! +${p} نقاط • إجمالي نقاطك: ${tot} ${playerReveal(a[0])} <button class="btn primary" id="nx" type="button">لاعب تاني</button>`;
              $('#nx', game).onclick = () => whoG(true);
            } else {
              wrong.add(b.dataset.n);
              b.disabled = true;
              if (k < 5) {
                k++;
                $('#fb', game).textContent = '❌ غلط، تلميح جديد...';
                setTimeout(show, 500);
              } else {
                done = true;
                run.n++;
                if (run.n >= 5) { setTimeout(finishRun, 900); return; }
                $('#fb', game).innerHTML = `❌ الإجابة: ${esc(a[0])} ${playerReveal(a[0])} <button class="btn primary" id="nx" type="button">لاعب تاني</button>`;
                $('#nx', game).onclick = () => whoG(true);
              }
            }
          };
        });
      };
      show();
    }

    /* ---------- خمّن النتيجة ---------- */
    async function predG() {
      const h = await home();
      const pr = ACC.get('snaces_pred', {});
      const now = Date.now();
      const need = Object.values(pr).filter(p => !p.r && Date.parse(p.d) + 9e6 < now);
      const LIVE = typeof liveMatchesFor === 'function' ? await liveMatchesFor(null, { force: true }).catch(() => null) : null;
      const byId = new Map((LIVE || []).map(m => [String(m.id), m]));

      const D = {};
      await Promise.all([...new Set(need.map(p => p.l))].map(l =>
        getJSON('data/' + l + '.json').then(d => { D[l] = d; }).catch(() => 0)));

      const o = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
      need.forEach(p => {
        const lm = byId.get(String(p.id));
        const m = lm || (D[p.l] && (D[p.l].matches || []).find(x => x.id === p.id));
        const done = m && (m.s === 'FINISHED' || m.status === 'FINISHED') && m.hg != null && m.ag != null;
        if (done) {
          const hg = m.hg != null ? m.hg : m.homeScore, ag = m.ag != null ? m.ag : m.awayScore;
          p.r = [hg, ag];
          p.pts = (p.ph === hg && p.pa === ag) ? 3 : (o(p.ph, p.pa) === o(hg, ag) ? 1 : 0);
        }
        if (lm && !p.r && lm.s === 'IN_PLAY') p.r = null;
      });
      store.set('snaces_pred', pr);

      const up = LIVE
        ? LIVE.filter(m => m.s === 'TIMED' && Date.parse(m.d) > now).slice(0, 20)
          .map(m => ({ l: m.l, id: m.id, d: m.d, h: (m.home && m.home.name) || (m.h && m.h.n) || '', a: (m.away && m.away.name) || (m.a && m.a.n) || '' }))
        : (h.next || []).filter(m => Date.parse(m.d) > now);
      const all = Object.values(pr);
      const mine = all.slice().sort((a, b) => Date.parse(b.d) - Date.parse(a.d)).slice(0, 12);
      const tot = all.reduce((s, p) => s + (p.pts || 0), 0);
      const dn = all.filter(p => p.r).length;

      game.innerHTML = `
        <h3 style="margin:0 0 4px;font-size:15px">خمّن نتايج المباريات الجاية</h3>
        <p class="muted tiny" style="margin:0 0 12px">النتيجة بالظبط = 3 نقاط، والفائز الصح = نقطة. بنراجع توقعاتك تلقائيًا بعد المباراة. نقاطك: <b>${tot}</b> من ${dn} مباراة منتهية.</p>
        ${up.length ? up.map(m => {
          const k = m.l + ':' + m.id, p = pr[k];
          return `<div class="row" style="border:1px solid var(--line);border-radius:10px;margin-bottom:8px">
            <span>${esc(m.h)} ضد ${esc(m.a)} <span class="lg">${LN[m.l] || m.l}</span></span>
            <span class="side">
              <input class="control num" type="number" min="0" max="9" id="h_${k}" value="${p ? p.ph : ''}">
              -
              <input class="control num" type="number" min="0" max="9" id="a_${k}" value="${p ? p.pa : ''}">
              <button class="btn secondary sv" type="button" data-k="${esc(k)}">حفظ</button>
            </span>
          </div>`;
        }).join('') : '<p class="muted small">لا توجد مباريات قادمة في البيانات حاليًا.</p>'}
        <h3 style="margin:16px 0 8px;font-size:15px">توقعاتي</h3>
        ${mine.length ? mine.map(p => `<div class="row"><span>${esc(p.h)} ${p.ph}-${p.pa} ${esc(p.a)}</span>
          <span class="side">${p.r ? `النتيجة ${p.r[0]}-${p.r[1]} • <b>${p.pts}</b> نقطة` : 'في الانتظار'}</span></div>`).join('')
          : '<p class="muted small">لسه ما توقعتش حاجة.</p>'}`;

      $$('.sv', game).forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        const m = up.find(x => x.l + ':' + x.id === k);
        const ph = parseInt(document.getElementById('h_' + k).value, 10);
        const pa = parseInt(document.getElementById('a_' + k).value, 10);
        if (!m || !(ph >= 0 && ph <= 9 && pa >= 0 && pa <= 9)) { b.textContent = 'أدخل نتيجة صح'; return; }
        pr[k] = { l: m.l, id: m.id, d: m.d, h: m.h, a: m.a, ph, pa };
        ACC.set('snaces_pred', pr);
        b.textContent = 'اتحفظ ✓';
      });
    }

    /* ---------- صح أم خطأ ---------- */
    function tfG() {
      const pool = TF.filter(x => x[2] === lv);
      const items = qbTake(pool.length >= 8 ? pool : TF, 10, x => 'tf:' + x[0]);
      const bk = 'snaces_best_tf_' + lv;
      let i = 0, sc = 0, locked = false;

      const show = () => {
        if (i >= items.length) {
          const best = Math.max(sc, store.get(bk, 0));
          store.set(bk, best);
          game.innerHTML = `<h3 style="margin:0 0 6px">نتيجتك: ${sc} من ${items.length}</h3>
            <p class="muted small">أفضل نتيجة في المستوى ده: ${best}</p>
            <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
          $('#again', game).onclick = tfG;
          return;
        }
        game.innerHTML = `
          <div class="quizmeta"><span>جملة ${i + 1} من ${items.length}</span><span>نقاطك ${sc}</span></div>
          <div class="clue" style="font-size:14px;padding:14px">${esc(items[i][0])}</div>
          <div class="vs" style="margin-top:12px">
            <button class="btn primary" type="button" data-tf="1" style="flex:1">صح ✓</button>
            <button class="btn secondary" type="button" data-tf="0" style="flex:1">خطأ ✗</button>
          </div>
          <div class="fb" id="fb"></div>`;
        $$('[data-tf]', game).forEach(b => b.onclick = () => {
          if (locked) return;
          locked = true;
          const isTrue = items[i][1], ans = b.dataset.tf === '1';
          const ok = isTrue === ans;
          if (ok) sc++;
          $$('[data-tf]', game).forEach(x => { x.disabled = true; x.className = 'btn ' + (x.dataset.tf === '1' ? 'primary' : 'secondary'); });
          $('#fb', game).innerHTML = (ok ? '✅ صح!' : '❌ غلط') + ` — الجملة ${isTrue ? 'صح' : 'خطأ'} ` +
            `<button class="btn secondary" id="nx" type="button">${i + 1 >= items.length ? 'النتيجة' : 'التالي'}</button>`;
          $('#nx', game).onclick = () => { i++; locked = false; show(); };
        });
      };
      show();
    }

    /* ---------- تحدي السرعة (60 ثانية) ---------- */
    function blitzG() {
      const pool = QB.filter(x => x[1] === lv);
      const items = qbTake(pool.length >= 20 ? pool : QB, 40, r => r[7], false);
      const bk = 'snaces_best_blitz_' + lv;
      const best = ACC.get(bk, 0);
      let i = 0, sc = 0, left = 60, locked = false;

      const end = () => {
        if (timer) { clearInterval(timer); timer = null; }
        const b = Math.max(sc, best);
        ACC.set(bk, b);
        game.innerHTML = `
          <h3 style="margin:0 0 6px">${left <= 0 ? 'خلص الوقت ⚡' : 'خلصت الأسئلة ⚡'}</h3>
          <p class="small">جبت <b class="green">${sc}</b> إجابة صح ${left <= 0 ? 'في 60 ثانية' : 'قبل ما تخلص'}</p>
          <p class="muted small">أفضل نتيجة في المستوى ده: ${b}</p>
          <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
        $('#again', game).onclick = blitzG;
      };

      const next = () => {
        if (left <= 0) { end(); return; }
        if (i >= items.length) { end(); return; }
        const row = items[i++];
        if (row[7] && typeof QBHistory !== 'undefined') QBHistory.mark([row[7]]);
        const opts = shuf(row.slice(3,7).map((t, j) => ({ t, ok: j === 0 })));
        game.innerHTML = `
          <div class="quizmeta"><span>⏱ <b id="bt" class="green">${left}</b> ثانية</span><span>صح: ${sc} • أفضل: ${best}</span></div>
          <h3 style="margin:2px 0 12px;font-size:15px">${esc(row[2])}</h3>
          <div id="opts">${opts.map((o, j) => `<button class="btn secondary opt" type="button" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>`;
        $$('#opts button', game).forEach(b => b.onclick = () => {
          if (locked) return;
          locked = true;
          const ok = opts[+b.dataset.j].ok;
          if (ok) sc++;
          b.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) $$('#opts button', game).forEach((x, k) => { if (opts[k].ok) x.classList.add('correct'); });
          setTimeout(() => { locked = false; next(); }, ok ? 220 : 700);
        });
      };

      timer = setInterval(() => {
        left--;
        const t = $('#bt', game);
        if (t) t.textContent = left;
        if (left <= 0) end();
      }, 1000);
      next();
    }

    /* ---------- التوصيل (لاعب ↔ نادي) ---------- */
    function matchG() {
      const pool = PJ.filter(x => x[2] <= lv);
      const pairs = [], usedNames = new Set();
      for (const p of shuf(pool.length >= 5 ? pool : PJ)) {
        const club = p[1][0];
        if (!club || usedNames.has(club)) continue;
        usedNames.add(club);
        pairs.push({ player: p[0], club });
        if (pairs.length === 5) break;
      }
      if (pairs.length < 5) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const clubs = shuf(pairs.map(p => p.club));
      const usedClubs = new Set();
      let sel = -1, done = 0, errors = 0, locked = false, msg = 'اختار لاعب الأول 👇';

      const draw = () => {
        game.innerHTML = `
          <div class="quizmeta"><span>وصّل كل لاعب بأول نادي لعب له</span><span>أخطاء: ${errors}</span></div>
          <div class="grid2 matchGrid" style="gap:8px">
            <div>${pairs.map((p, i) => `<button class="btn secondary opt matchCard" type="button" data-p="${i}" ${p.ok ? 'disabled' : ''} style="margin-bottom:6px;${p.ok ? 'opacity:.55' : ''}${sel === i ? 'border-color:var(--green)' : ''}">${(() => { const rec = TTT_CAREERS[tttFind(p.player)]; return rec ? tttPhoto(rec, 'matchFace') : ''; })()}<span class="matchName">${esc(p.player)}</span></button>`).join('')}</div>
            <div>${clubs.map((c, i) => `<button class="btn secondary opt matchCard" type="button" data-c="${i}" ${usedClubs.has(i) ? 'disabled' : ''} style="margin-bottom:6px;${usedClubs.has(i) ? 'opacity:.55' : ''}">${tttCrest(c, 'matchCrest')}<span class="matchName">${esc(c)}</span></button>`).join('')}</div>
          </div>
          <div class="fb" id="fb">${esc(msg)}</div>`;

        $$('[data-p]', game).forEach(b => b.onclick = () => {
          if (locked || b.disabled) return;
          sel = +b.dataset.p;
          msg = 'دلوقتي اختار النادي';
          draw();
        });
        $$('[data-c]', game).forEach(b => b.onclick = () => {
          if (locked || b.disabled || sel < 0) return;
          const ci = +b.dataset.c;
          if (pairs[sel].club === clubs[ci]) {
            pairs[sel].ok = true;
            usedClubs.add(ci);
            done++;
            msg = '✅ صح! اختار لاعب تاني.';
            sel = -1;
            if (done === pairs.length) {
              const txt = errors === 0 ? 'كامل من غير غلطة 🏆' : `خلصتها بـ ${errors} أخطاء 👏`;
              game.innerHTML = `<h3 style="margin:0 0 6px">تمام! ${txt}</h3>
                <div class="matchDone">${pairs.map(p => `<div>${(() => { const rec = TTT_CAREERS[tttFind(p.player)]; return rec ? tttPhoto(rec, 'matchFace') : ''; })()}${tttCrest(p.club, 'matchCrest')}<b>${esc(p.player)}</b><small>${esc(p.club)}</small></div>`).join('')}</div>
                <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
              $('#again', game).onclick = matchG;
              return;
            }
            draw();
          } else {
            errors++;
            locked = true;
            b.classList.add('wrong');
            msg = '❌ مش النادي ده، جرّب تاني';
            $('#fb', game).textContent = msg;
            setTimeout(() => { locked = false; draw(); }, 550);
          }
        });
      };
      draw();
    }

    /* ---------- خمّن الفريق من نتايجه ---------- */
    async function resG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const codes = lv === 1 ? ['PL'] : lv === 2 ? ['PL', 'PD'] : ['PL', 'SAU', 'EGY'];
      const Ds = (await Promise.all(codes.map(c => leagueData(c).catch(() => null)))).filter(d => d && d.standings && d.standings.length);
      if (!Ds.length) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }

      const items = [];
      for (const D of Ds) {
        const fin = finOf(D);
        for (const r of D.standings) {
          const mine = fin.filter(m => m.home.id === r.team.id || m.away.id === r.team.id)
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);
          if (mine.length < 5) continue;
          const seq = mine.map(m => {
            const home = m.home.id === r.team.id;
            const gf = home ? m.hg : m.ag, ga = home ? m.ag : m.hg;
            return { res: gf > ga ? 'ف' : gf < ga ? 'خ' : 'ت', gf, ga };
          });
          const others = D.standings.filter(x => x.team.id !== r.team.id);
          if (others.length < 3) continue;
          items.push({ D, team: r.team, seq, others });
        }
      }
      if (items.length < 4) { game.innerHTML = '<p class="muted">مفيش نتايج كفاية.</p>'; return; }

      const quiz = shuf(items).slice(0, 8).map(it => ({
        pre: `<div class="sl" style="margin:4px 0 10px">${it.seq.map(s => `<span class="fdr fdr${s.res === 'ف' ? 1 : s.res === 'خ' ? 5 : 3}" style="color:#062015">${s.res} ${s.gf}-${s.ga}</span>`).join('')}</div>
              <p class="muted tiny" style="margin:0 0 8px">آخر 5 مباريات للفريق في ${esc(LN[it.D.code] || it.D.code)} — من الأحدث للأقدم</p>`,
        q: 'أي فريق ده؟',
        o: shuf([it.team, ...shuf(it.others.map(x => x.team)).slice(0, 3)]).map(t => ({ t: t.name, ok: t.id === it.team.id, img: crest(t.crest) }))
      }));
      runQuiz(game, quiz, 'snaces_best_res_' + lv, resG);
    }

    /* ---------- التشكيلة على الملعب بصور حقيقية: أي نادي؟ ---------- */
    const KITC = { ARS: '#ef0107', AVL: '#670e36', BOU: '#da291c', BRE: '#e30613', BHA: '#0057b8',
      CHE: '#034694', CRY: '#1b458f', EVE: '#003399', FUL: '#f4f4f4', IPS: '#0044a9', LEI: '#003090',
      LIV: '#c8102e', MCI: '#6cabdd', MUN: '#da291c', NEW: '#2b2b2b', NFO: '#dd0000', SOU: '#d71920',
      TOT: '#f4f4f4', WHU: '#7a263a', WOL: '#fdb913' };
    /* ملعب بصور اللاعبين (صور Premier League الحقيقية) */
    function photoPitch(players, color, rows) {
      const W = 300, H = 420, top = 52, bot = 392;
      const all = [1, ...rows];
      const gap = (bot - top) / (all.length - 1 || 1);
      let g = '', k = 0;
      all.forEach((n, ri) => {
        const y = ri === 0 ? bot : bot - ri * gap;
        for (let i = 0; i < n; i++) {
          const p = players[k++];
          if (!p) continue;
          const x = (W / (n + 1)) * (i + 1);
          const src = p.photo ? plPhoto(p.photo, true) : '';
          const ini = String(p.web_name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
          g += `<g transform="translate(${x} ${y})">
            <circle r="24" fill="${color}" opacity=".9"/>
            ${src
              ? `<image href="${src}" x="-55" y="-30" width="110" height="110" preserveAspectRatio="xMidYMid slice" clip-path="url(#pclip)"/>`
              : `<text x="0" y="5" font-size="15" font-weight="800" text-anchor="middle" fill="#08130d">${esc(ini)}</text>`}
            <circle r="24" fill="none" stroke="#ffffffcc" stroke-width="2"/>
            <rect x="-34" y="26" width="68" height="15" rx="7" fill="#000000a8"/>
            <text x="0" y="37" font-size="9.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(p.web_name).slice(0, 13)}</text>
          </g>`;
        }
      });
      return `<div class="pitchCard">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="تشكيل فريق على أرض الملعب">
          <defs>
            <pattern id="turf2" width="300" height="56" patternUnits="userSpaceOnUse">
              <rect width="300" height="28" fill="#14562f"/><rect y="28" width="300" height="28" fill="#175e36"/>
            </pattern>
            <clipPath id="pclip"><circle r="21"/></clipPath>
          </defs>
          <rect width="300" height="${H}" fill="url(#turf2)"/>
          <g fill="none" stroke="#eafff3" stroke-opacity=".5" stroke-width="1.6">
            <rect x="10" y="10" width="280" height="400" rx="4"/>
            <line x1="10" y1="210" x2="290" y2="210"/>
            <circle cx="150" cy="210" r="38"/>
            <rect x="85" y="10" width="130" height="48"/><rect x="85" y="362" width="130" height="48"/>
            <path d="M115 10 a35 35 0 0 0 70 0"/><path d="M115 410 a35 35 0 0 1 70 0"/>
          </g>
          ${g}
        </svg>
        <div class="pitchLegend"><span>⚪ تشكيلة أساسية</span><span>صور اللاعبين حقيقية</span></div>
      </div>`;
    }
    async function lineupG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements) || !F.elements.length) {
        game.innerHTML = '<p class="muted">بيانات اللاعبين مش متاحة حاليًا.</p>';
        return;
      }
      const byTeam = {};
      F.elements.forEach(p => { (byTeam[p.team] = byTeam[p.team] || []).push(p); });
      const teams = (F.teams || []).filter(t => (byTeam[t.id] || []).length >= 11);
      if (teams.length < 8) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const pick = (pool, n) => shuf(pool).slice(0, n);
      const items = teams.map(t => {
        const ps = byTeam[t.id].filter(p => p.photo);
        const gk = pick(ps.filter(p => p.element_type === 1), 1);
        const df = pick(ps.filter(p => p.element_type === 2), 4);
        const md = pick(ps.filter(p => p.element_type === 3), 4);
        const fw = pick(ps.filter(p => p.element_type === 4), 2);
        const used = new Set([...gk, ...df, ...md, ...fw].map(p => p.id));
        const rest = ps.filter(p => !used.has(p.id));
        while (df.length + md.length + fw.length < 10 && rest.length) {
          const p = rest.shift();
          if (p.element_type === 2) df.push(p); else if (p.element_type === 4) fw.push(p); else md.push(p);
        }
        const xi = [...gk, ...df, ...md, ...fw].slice(0, 11);
        if (xi.length < 11) return null;
        const others = shuf(teams.filter(x => x.id !== t.id)).slice(0, 3);
        return {
          pre: photoPitch(xi, KITC[t.short_name] || '#25d39a', [df.length, md.length, fw.length]) +
            `<p class="muted tiny" style="margin:6px 0 0">👥 11 لاعب من نفس النادي — مين النادي؟</p>`,
          q: 'التشكيلة دي بتاعة أي نادي؟',
          o: shuf([t, ...others]).map(x => ({ t: x.name, ok: x.id === t.id, img: badge(x) }))
        };
      }).filter(Boolean);
      if (items.length < 4) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      runQuiz(game, shuf(items).slice(0, 8), 'snaces_best_lineup_' + lv, lineupG);
    }

    /* ---------- حروف مبعثرة: اسم نادي أو لاعب ---------- */
    function scrambleG() {
      const names = [...J.map(x => x[0]), ...PJ.map(x => x[0]), ...W.map(x => x[0])]
        .filter(n => n.replace(/\s/g, '').length >= 4);
      const pool = names.filter((n, i) => names.indexOf(n) === i);
      const rows = qbTake(pool, 8, n => 'scramble:' + n);
      const mix = w => {
        const a = w.split('');
        if (new Set(a).size < 2) return a;
        for (let k = 0; k < 20; k++) {
          const s = shuf(a);
          if (s.join('') !== w) return s;
        }
        const s = a.slice();
        for (let i = 0; i < s.length - 1; i++) {
          if (s[i] !== s[i + 1]) { [s[i], s[i + 1]] = [s[i + 1], s[i]]; return s; }
        }
        return a.reverse();
      };
      const items = rows.map(n => {
        const letters = mix(n.replace(/\s/g, ''));
        const nOpt = lv >= 3 ? 3 : 4;
        const others = shuf(pool.filter(x => x !== n)).slice(0, nOpt - 1);
        const hint = lv === 1 ? `<p class="muted tiny" style="margin:0 0 8px">بيبدأ بحرف «${esc(n[0])}» • عدد الحروف ${n.replace(/\s/g, '').length}</p>`
          : `<p class="muted tiny" style="margin:0 0 8px">${n.replace(/\s/g, '').length} حروف</p>`;
        return {
          pre: `<div class="scrTiles" style="margin:4px 0 10px">${letters.map(c => `<span>${esc(c)}</span>`).join('')}</div>${hint}`,
          q: 'الحروف دي اسم نادي ولا لاعب إيه؟',
          pts: [10, 15, 20][lv - 1] || 10,
          o: shuf([n, ...others]).map(t => ({ t, ok: t === n }))
        };
      });
      runQuiz(game, items, 'snaces_best_scramble_' + lv, scrambleG);
    }

    /* ---------- نجم الفانتازي: من هو اللاعب من أرقامه ---------- */
    async function fplwhoG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements) || !F.elements.length) {
        game.innerHTML = '<p class="muted">بيانات الفانتازي مش متاحة حاليًا.</p>';
        return;
      }
      const POS = { 1: 'حراسة', 2: 'دفاع', 3: 'وسط', 4: 'هجوم' };
      const TM = {}, TO = {};
      (F.teams || []).forEach(t => { TM[t.id] = t.name; TO[t.id] = t; });
      const tmOf = id => TO[id];
      const seen = new Set();
      const pool = F.elements.filter(p => (p.total_points || 0) >= 15 && (p.minutes || 0) >= 450 && !seen.has(p.web_name) && seen.add(p.web_name));
      if (pool.length < 30) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const items = shuf(pool).slice(0, 8).map(p => {
        const peers = pool.filter(x => x.element_type === p.element_type && x.id !== p.id);
        const near = shuf(peers.filter(x => Math.abs(x.now_cost - p.now_cost) <= 15)).slice(0, 3);
        const others = near.length === 3 ? near : shuf(peers).slice(0, 3);
        const rows = [
          lv <= 1 ? `<tr><td class="muted">النادي</td><td>${badge(tmOf(p.team), 'sm')}${esc(TM[p.team] || '—')}</td></tr>` : '',
          `<tr><td class="muted">المركز</td><td>${POS[p.element_type]}</td></tr>`,
          `<tr><td class="muted">السعر</td><td>£${(p.now_cost / 10).toFixed(1)}</td></tr>`,
          `<tr><td class="muted">النقاط</td><td>${p.total_points}</td></tr>`,
          `<tr><td class="muted">الدقايق</td><td>${p.minutes}</td></tr>`,
          lv <= 2 ? `<tr><td class="muted">الفورم</td><td>${p.form}</td></tr>` : '',
          lv === 1 ? `<tr><td class="muted">xG</td><td>${p.expected_goals}</td></tr>` : ''
        ].join('');
        return {
          pre: `<div class="tableWrap"><table class="cmpTbl" style="min-width:0"><tbody>${rows}</tbody></table></div>`,
          q: 'الأرقام دي بتاعة مين؟',
          reveal: `<div class="answerCard fplAnswer">${face(p)}<div class="answerMeta"><b>${esc(p.web_name)}</b><small>${esc(TM[p.team] || '')}</small></div></div>`,
          o: shuf([p, ...others]).map(x => ({ t: x.web_name, ok: x.id === p.id }))
        };
      });
      runQuiz(game, items, 'snaces_best_fplwho_' + lv, fplwhoG);
    }

    /* ---------- سنة اللقب (تاريخ) ---------- */
    function yearG() {
      const comps = lv === 1 ? ['wc'] : lv === 2 ? ['wc', 'euro'] : ['wc', 'euro', 'cl'];
      const pool = HIST_FINALS.filter(f => comps.includes(f.c));
      const items = qbTake(pool, 8, f => 'year:' + f.c + f.y).map(f => {
        const lo = f.c === 'wc' ? 1930 : f.c === 'euro' ? 1960 : 1995;
        const years = new Set([f.y]);
        let guard = 0;
        while (years.size < 4 && guard++ < 200) years.add(lo + Math.floor(rnd(2025 - lo + 1)));
        return {
          pre: histBanner(f.c, 'النهائي'),
          q: `في أي سنة كسب ${f.w} ${HCOMP[f.c]} على حساب ${f.r}؟`,
          o: shuf([...years]).map(y => ({ t: String(y), ok: y === f.y }))
        };
      });
      runQuiz(game, items, 'snaces_best_year_' + lv, yearG);
    }

    /* ---------- بطل النهائي (تاريخ) ---------- */
    function finalG() {
      const comps = lv === 1 ? ['wc'] : lv === 2 ? ['wc', 'cl'] : ['wc', 'cl', 'euro'];
      const pool = HIST_FINALS.filter(f => comps.includes(f.c) && !(f.c === 'wc' && f.y === 1950));
      const items = qbTake(pool, 8, f => 'final:' + f.c + f.y).map(f => {
        const asRunner = lv >= 2 && rnd(2) === 1;
        /* الخيارات من نفس البطولة بس (أندية مع أندية، منتخبات مع منتخبات) */
        const comp = pool.filter(x => x.c === f.c);
        const right = asRunner ? f.r : f.w;
        const champs = shuf([...new Set(comp.map(x => asRunner ? x.r : x.w))].filter(n => n !== right)).slice(0, 3);
        return {
          pre: histBanner(f.c, `النهائي • ${f.s}`),
          q: asRunner ? `مين خسر نهائي ${HCOMP[f.c]} ${f.y}؟` : `مين كسب نهائي ${HCOMP[f.c]} ${f.y}؟`,
          o: shuf([right, ...champs]).map(t => ({ t, ok: t === right }))
        };
      });
      runQuiz(game, items, 'snaces_best_final_' + lv, finalG);
    }

    /* ---------- الدولة المستضيفة لكأس العالم (تاريخ) ---------- */
    function hostG() {
      const pool = HIST.wc.filter(r => lv === 1 ? r[0] >= 1990 : true);
      const hosts = [...new Set(HIST.wc.map(r => r[4]))];
      const items = qbTake(pool, 8, r => 'host:' + r[0]).map(r => ({
        pre: histBanner('wc', 'المستضيف'),
        q: `أي دولة استضافت كأس العالم ${r[0]}؟`,
        pts: [10, 15, 20][lv - 1] || 10,
        exp: `البطل: ${r[1]}`,
        o: shuf([r[4], ...shuf(hosts.filter(h => h !== r[4])).slice(0, 3)]).map(h => ({ t: h, ok: h === r[4] }))
      }));
      runQuiz(game, items, 'snaces_best_host_' + lv, hostG);
    }

    /* ---------- بطل أمم أفريقيا (تاريخ) ---------- */
    function champG() {
      const pool = lv === 1 ? HIST.afcon.filter(r => r[0] >= 2006) : HIST.afcon;
      const champs = [...new Set(HIST.afcon.map(r => r[1]))];
      const items = qbTake(pool, 8, r => 'champ:' + r[0]).map(r => ({
        pre: histBanner('afcon', `نسخة ${r[0]}`),
        q: `مين فاز بكأس أمم أفريقيا ${r[0]}؟`,
        o: shuf([r[1], ...shuf(champs.filter(c => c !== r[1])).slice(0, 3)]).map(c => ({ t: c, ok: c === r[1] }))
      }));
      runQuiz(game, items, 'snaces_best_champ_' + lv, champG);
    }

    /* ---------- مزاد اللاعبين: من الأفضل قيمة (نقاط/سعر) ---------- */
    async function auctionG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements)) { game.innerHTML = '<p class="muted">بيانات الفانتازي مش متاحة.</p>'; return; }
      const TM = {}, TO = {}; (F.teams || []).forEach(t => { TM[t.id] = t.short_name; TO[t.id] = t; });
      const value = p => p.total_points / (p.now_cost / 10);
      const seen = new Set();
      const pool = F.elements.filter(p => p.minutes > 400 && p.now_cost > 0 && (p.total_points || 0) > 0 && !seen.has(p.web_name) && seen.add(p.web_name)).sort((a, b) => value(b) - value(a));
      if (pool.length < 20) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const items = shuf(pool.slice(0, 60)).slice(0, 8).map(p => {
        const peers = shuf(pool.filter(x => x.id !== p.id && value(x) < value(p))).slice(0, 3);
        if (peers.length < 3) return null;
        const opts = shuf([p, ...peers]);
        const row = x => `<tr>
          <td><span class="aucName">${face(x, 'aucFace')}${esc(x.web_name)}</span></td>
          <td>${badge(TO[x.team], 'sm')}${esc(TM[x.team] || '—')}</td>
          <td>£${(x.now_cost / 10).toFixed(1)}</td>
          <td>${x.total_points}</td>
        </tr>`;
        return {
          pre: `<div class="tableWrap"><table class="cmpTbl" style="min-width:0"><thead><tr><th>اللاعب</th><th>النادي</th><th>السعر</th><th>النقاط</th></tr></thead><tbody>${opts.map(row).join('')}</tbody></table></div>
            <p class="muted tiny" style="margin:4px 0 8px">الترتيب عشوائي — احسب القيمة بنفسك: النقاط ÷ السعر بالمليون.</p>`,
          q: 'مين أفضل قيمة بين اللاعبين دول؟',
          pts: [10, 15, 20][lv - 1] || 10,
          exp: opts.map(x => `${x.web_name}: ${value(x).toFixed(1)}`).join(' • '),
          o: opts.map(x => ({ t: x.web_name, ok: x.id === p.id }))
        };
      }).filter(Boolean);
      runQuiz(game, items, 'snaces_best_auction_' + lv, auctionG);
    }

    /* ---------- توب 10: من الأعلى ---------- */
    async function top10G() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements)) { game.innerHTML = '<p class="muted">بيانات الفانتازي مش متاحة.</p>'; return; }
      const TM = {}; (F.teams || []).forEach(t => { TM[t.id] = t.short_name; });
      const cats = [
        ['total_points', 'نقاط', 'الأعلى نقاطًا'],
        ['goals_scored', 'أهداف', 'الأكثر أهدافًا'],
        ['assists', 'صناعة', 'الأكثر صناعة'],
        ['clean_sheets', 'شباك نظيفة', 'الأكثر شباك نظيفة'],
        ['bonus', 'بونص', 'الأكثر بونص']
      ];
      const [key, label, title] = cats[Math.floor(Math.random() * cats.length)];
      const seen = new Set();
      const top = F.elements.filter(p => p.minutes > 0).sort((a, b) => (b[key] || 0) - (a[key] || 0))
        .filter(p => !seen.has(p.web_name) && seen.add(p.web_name)).slice(0, 10);
      if (top.length < 10) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const quiz = shuf(top).slice(0, 6).map(p => {
        const val = p[key] || 0;
        const peers = shuf(top.filter(x => x.id !== p.id && (x[key] || 0) !== val)).slice(0, 3);
        const opts = shuf([p, ...peers]);
        return {
          pre: `<p class="muted tiny" style="margin:0 0 8px">توب 10 — ${esc(title)}</p>`,
          q: `أي لاعب عنده ${val} ${label} في توب 10 (${title})؟`,
          pts: [10, 15, 20][lv - 1] || 10,
          exp: `${p.web_name} — ${val} ${label}`,
          o: opts.map(x => ({ t: x.web_name, ok: x.id === p.id, img: face(x) }))
        };
      });
      runQuiz(game, quiz, 'snaces_best_top10_' + lv, top10G);
    }

    /* ---------- التشكيلة: شوف الرسم على الملعب واعرف الخطة ---------- */
    const FORMS = [['4-4-2', [4, 4, 2]], ['4-3-3', [4, 3, 3]], ['3-5-2', [3, 5, 2]],
      ['4-2-3-1', [4, 2, 3, 1]], ['5-3-2', [5, 3, 2]], ['4-1-4-1', [4, 1, 4, 1]]];
    /* ملعب SVG بخطوطه + قمصان اللاعبين في مراكزهم */
    function pitchSvg(rows, kit) {
      const W = 300, H = 400, P = 'M62 18 L88 10 Q100 30 112 10 L138 18 L192 56 L170 94 L150 80 L150 192 L50 192 L50 80 L30 94 L8 56 Z';
      const c = (kit && kit[3]) || ['#25d39a', '#0b3a28'];
      const all = [1, ...rows];
      const top = 34, bot = 372, gap = (bot - top) / (all.length - 1 || 1);
      let j = '';
      all.forEach((n, ri) => {
        const y = bot - ri * gap;
        for (let i = 0; i < n; i++) {
          const x = (W / (n + 1)) * (i + 1);
          j += `<g class="jrs" transform="translate(${x - 14} ${y - 16}) scale(0.14)">
            <path d="${P}" fill="${c[0]}" stroke="#00000055" stroke-width="10"/>
            <rect x="50" y="60" width="100" height="132" fill="${c[1]}" opacity=".55"/>
            <text x="100" y="140" font-size="46" font-weight="800" text-anchor="middle" fill="#fff" opacity=".9">${ri === 0 ? 1 : ri * 2}</text>
          </g>`;
        }
      });
      return `<div class="pitchCard">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="رسم تكتيكي على الملعب">
          <defs><pattern id="turf" width="300" height="52" patternUnits="userSpaceOnUse">
            <rect width="300" height="26" fill="#14562f"/><rect y="26" width="300" height="26" fill="#175e36"/>
          </pattern></defs>
          <rect width="300" height="400" fill="url(#turf)"/>
          <g fill="none" stroke="#eafff3" stroke-opacity=".55" stroke-width="1.6">
            <rect x="10" y="10" width="280" height="380" rx="4"/>
            <line x1="10" y1="200" x2="290" y2="200"/>
            <circle cx="150" cy="200" r="36"/>
            <circle cx="150" cy="200" r="3" fill="#eafff3" fill-opacity=".55"/>
            <rect x="85" y="10" width="130" height="46"/><rect x="85" y="344" width="130" height="46"/>
            <path d="M115 10 a35 35 0 0 0 70 0"/>
            <path d="M115 390 a35 35 0 0 1 70 0"/>
          </g>
          ${j}
        </svg>
        <div class="pitchLegend"><span>⚪ تشكيل الفريق</span><span>11 لاعب</span></div>
      </div>`;
    }
    function formationG() {
      const forms = lv === 1 ? FORMS.slice(0, 3) : FORMS;
      const kits = (typeof J !== 'undefined' ? J : []).filter(x => x[5] <= lv);
      const items = shuf(forms).slice(0, Math.min(8, forms.length)).map(f => {
        const others = shuf(forms.filter(x => x[0] !== f[0])).slice(0, 3);
        const kit = kits[Math.floor(Math.random() * kits.length)];
        return {
          pre: pitchSvg(f[1], kit) + `<p class="muted tiny" style="margin:8px 0 0">📐 الخطوط والمراكز دي بتاعة أي خطة؟</p>`,
          q: 'التشكيلة مرسومة على الملعب — إيه هي؟',
          o: shuf([f[0], ...others.map(x => x[0])]).map(t => ({ t, ok: t === f[0] }))
        };
      });
      runQuiz(game, items, 'snaces_best_formation_' + lv, formationG);
    }

    /* ---------- اللي مش زي التاني: ٣ قمصان من دولة وواحد من دولة تانية ---------- */
    function oddG() {
      const groupOf = src => {
        const by = {};
        src.forEach(k => { (by[k[1]] = by[k[1]] || []).push(k); });
        return Object.entries(by).filter(([, v]) => v.length >= 3);
      };
      let pool = uniqClubs(J.filter(x => x[5] <= lv));
      let groups = groupOf(pool);
      if (groups.length < 3) { pool = uniqClubs(J); groups = groupOf(pool); }
      if (groups.length < 3) { game.innerHTML = '<p class="muted">البيانات مش متاحة حاليًا.</p>'; return; }
      const items = shuf(groups).slice(0, 8).map(([country, list]) => {
        const three = shuf(uniqClubs(list)).slice(0, 3);
        const others = pool.filter(k => k[1] !== country);
        const odd = others[rnd(others.length)];
        const opts = shuf([...three, odd]);
        return {
          pre: `<div class="oddRow">${opts.map(k => shirt(k, 92)).join('')}</div>
            <p class="muted tiny" style="text-align:center;margin:2px 0 10px">٣ أقمصة لنفس الدولة + قميص واحد من دولة تانية</p>`,
          q: 'مين النادي اللي مش من نفس دولة التلاتة التانيين؟',
          o: opts.map(k => ({ t: k[0], ok: k === odd }))
        };
      });
      runQuiz(game, items, 'snaces_best_odd_' + lv, oddG);
    }

    /* ---------- لاعب مشوّش: صورة حقيقية بفلتر ضبابي ---------- */
    async function blurG() {
      game.innerHTML = '<p class="muted small">بيتم التحميل…</p>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements) || !F.elements.length) {
        game.innerHTML = '<p class="muted">بيانات الفانتازي مش متاحة حاليًا.</p>';
        return;
      }
      const seen = new Set();
      const pool = F.elements.filter(p => p.photo && (p.minutes || 0) >= 700 && (p.total_points || 0) >= 15 && !seen.has(p.web_name) && seen.add(p.web_name));
      if (pool.length < 40) { game.innerHTML = '<p class="muted">البيانات مش كفاية.</p>'; return; }
      const POS = { 1: 'حراسة', 2: 'دفاع', 3: 'وسط', 4: 'هجوم' };
      const TM = {};
      (F.teams || []).forEach(t => { TM[t.id] = t.name; });
      const blur = lv === 1 ? 5 : lv === 2 ? 9 : 14;
      const items = shuf(pool).slice(0, 8).map(p => {
        const peers = pool.filter(x => x.element_type === p.element_type && x.id !== p.id);
        const others = shuf(peers).slice(0, 3);
        return {
          pre: `<div class="blurWrap"><img class="blurFace" style="filter:blur(${blur}px)" src="${plPhoto(p.photo) || FB_FACE}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${FB_FACE}" onerror="this.onerror=null;this.src=this.dataset.fb;this.style.filter='none';this.style.objectFit='contain'"></div>
            <p class="muted tiny" style="text-align:center;margin:2px 0 10px">${POS[p.element_type] || ''} • ${esc(TM[p.team] || '')}</p>`,
          q: 'مين اللاعب المشوّش ده؟',
          o: shuf([p, ...others]).map(x => ({ t: x.web_name, ok: x.id === p.id }))
        };
      });
      runQuiz(game, items, 'snaces_best_blur_' + lv, blurG);
    }

    /* ---------- التمثيل / كلمة السر: لعبة جلسة بين صحابك ---------- */
    function partyG(mode) {
      const isPass = mode === 'pass';
      const TITLE = isPass ? '🔑 كلمة السر' : '🎭 التمثيل';
      const RULES = isPass
        ? 'الكلام مسموح — بس ممنوع تقول الاسم نفسه أو النادي أو البلد أو المركز أو رقم القميص.'
        : 'من غير كلام ولا صوت — إشارات وحركات بس. الباقي يخمّن قبل ما الوقت يخلص.';
      const SEC = isPass ? 45 : 60;
      let pool = (typeof W !== 'undefined') ? W.filter(x => x[2] === lv) : [];
      if (pool.length < 8) pool = (typeof W !== 'undefined') ? W.slice() : [];
      if (!pool.length) { game.innerHTML = '<p class="muted">البيانات مش متاحة.</p>'; return; }
      const deck = shuf(pool).slice(0, 18);
      const bestKey = 'snaces_best_party_' + mode + '_' + lv;
      let idx = 0, sc = 0, left = SEC, missed = [], running = false, card = null;

      const hud = () => {
        const t = $('#pTime', game);
        if (t) t.textContent = left + ' ث';
        const s = $('#pSc', game);
        if (s) s.textContent = sc + ' صح';
      };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } running = false; };

      const finish = () => {
        stop();
        const best = Math.max(sc, ACC.get(bestKey, 0));
        ACC.set(bestKey, best);
        game.innerHTML = `
          <h3 style="margin:0 0 6px">${TITLE} — نتيجتك: ${sc}</h3>
          <p class="muted small">أفضل نتيجة في المستوى ده: ${best}${idx < deck.length ? ' • الوقت خلص' : ' • خلصت الكروت'}</p>
          ${missed.length ? `<div class="dataPanel" style="padding:10px;margin:8px 0"><b class="small">اللي فاتكم (${missed.length}):</b><div class="muted small" style="margin-top:4px">${missed.map(n => esc(n)).join(' • ')}</div></div>` : ''}
          <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
        $('#again', game).onclick = () => partyG(mode);
      };

      const nextCard = () => {
        if (idx >= deck.length) return finish();
        card = deck[idx];
        game.innerHTML = `
          <div class="quizmeta"><span>${TITLE}</span><span>كارت ${idx + 1}/${deck.length}</span></div>
          <div class="pName">${esc(card[0])}</div>
          ${isPass ? '<div class="forbid"><span>🚫 الاسم</span><span>🚫 النادي</span><span>🚫 البلد</span><span>🚫 المركز</span><span>🚫 رقم القميص</span></div>' : ''}
          <p class="muted tiny" style="margin:0 0 8px">${RULES}</p>
          <div class="between pRow"><span class="pTime" id="pTime">${left} ث</span><span class="green" id="pSc">${sc} صح</span></div>
          <div class="pBtns">
            <button class="btn primary" id="ok" type="button">✅ عرفها</button>
            <button class="btn secondary" id="skip" type="button">⏭️ عدّيها</button>
          </div>`;
        $('#ok', game).onclick = () => { if (!running) return; sc++; idx++; nextCard(); };
        $('#skip', game).onclick = () => { if (!running) return; missed.push(card[0]); idx++; nextCard(); };
        hud();
      };

      const run = () => {
        stop();
        idx = 0; sc = 0; left = SEC; missed = []; running = true;
        timer = setInterval(() => {
          left--;
          if (left <= 0) { hud(); return finish(); }
          hud();
        }, 1000);
        nextCard();
      };

      game.innerHTML = `
        <h3 style="margin:0 0 6px">${TITLE}</h3>
        <p class="small">${RULES}</p>
        <div class="dataPanel" style="padding:10px;margin:8px 0 10px">
          <b class="small">طريقة اللعب</b>
          <p class="muted tiny" style="margin:4px 0 0">واحد يمسك الموبايل ويشرح اللاعب اللي ظاهر، والباقي يخمّن. الوقت ${SEC} ثانية. اضغط «عرفها» لما حد يجيب الاسم، و«عدّيها» لو عدّيتها.</p>
        </div>
        <button class="btn primary" id="go" type="button" style="width:100%">ابدأ الجولة (${SEC} ثانية)</button>`;
      $('#go', game).onclick = run;
    }

    /* ---------- مزاد التلميحات: قلّل تلميحاتك تاخد نقاط أكتر ---------- */
    function bidG() {
      let pool = (typeof W !== 'undefined') ? W.filter(x => x[2] === lv) : [];
      if (pool.length < 8) pool = (typeof W !== 'undefined') ? W.slice() : [];
      if (!pool.length) { game.innerHTML = '<p class="muted">البيانات مش متاحة.</p>'; return; }
      const chosen = shuf(pool).slice(0, 6);
      const bestKey = 'snaces_best_bid_' + lv;
      let i = 0, pts = 0;

      const result = () => {
        const best = Math.max(pts, ACC.get(bestKey, 0));
        ACC.set(bestKey, best);
        game.innerHTML = `<h3 style="margin:0 0 6px">نتيجتك: ${pts} نقطة</h3>
          <p class="muted small">أفضل نتيجة: ${best} — من ${chosen.length} لاعبين (الحد الأقصى ${chosen.length * 5}).</p>
          <button class="btn primary" id="again" type="button" style="margin-top:8px">العب تاني</button>`;
        $('#again', game).onclick = bidG;
      };

      const ask = () => {
        const p = chosen[i];
        const peers = shuf(pool.filter(x => x !== p && x[0] !== p[0])).slice(0, 3);
        const opts = shuf([p, ...peers]);
        const maxHints = Math.min(3, p[1].length);
        game.innerHTML = `
          <div class="quizmeta"><span>لاعب ${i + 1} من ${chosen.length}</span><span>نقاطك ${pts}</span></div>
          <h3 style="margin:2px 0 6px;font-size:15px">💰 مزاد التلميحات — هتحتاج كام تلميح؟</h3>
          <p class="muted tiny" style="margin:0 0 10px">قلّل تلميحاتك تاخد نقاط أكتر: تلميح واحد = 5 نقاط، واتنين = 4، وهكذا.</p>
          <div class="chips">${Array.from({ length: maxHints }, (_, k) => k + 1).map(n => `<button class="btn secondary" type="button" data-n="${n}">${n} تلميح • ${6 - n} نقاط</button>`).join('')}</div>
          <p class="muted tiny" style="margin:10px 0 0">مفيش تلميحات مكشوفة قبل المزاد — اللي تختاره هو اللي هتشوفه.</p>`;
        $$('[data-n]', game).forEach(b => b.onclick = () => {
          const n = Math.min(+b.dataset.n, p[1].length), gain = 6 - n;
          game.innerHTML = `
            <div class="quizmeta"><span>لاعب ${i + 1} من ${chosen.length}</span><span>نقاطك ${pts}</span></div>
            ${p[1].slice(0, n).map(c => `<div class="clue">${esc(c)}</div>`).join('')}
            <h3 style="margin:8px 0 10px;font-size:15px">مين اللاعب؟ (${n} تلميح = ${gain} نقاط)</h3>
            <div id="opts">${opts.map((x, j) => `<button class="btn secondary opt" type="button" data-j="${j}">${esc(x[0])}</button>`).join('')}</div>
            <div class="fb" id="fb"></div>`;
          $$('#opts button', game).forEach((x, j) => x.onclick = () => {
            const ok = opts[j] === p;
            if (ok) pts += gain;
            $$('#opts button', game).forEach((y, k) => { y.disabled = true; if (opts[k] === p) y.classList.add('correct'); });
            if (!ok) x.classList.add('wrong');
            $('#fb', game).innerHTML = (ok ? `✅ صح! +${gain}` : `❌ الصح: ${esc(p[0])}`) +
              ` <button class="btn primary" id="nx" type="button">${i + 1 >= chosen.length ? 'النتيجة' : 'التالي'}</button>`;
            $('#nx', game).onclick = () => { i++; if (i >= chosen.length) result(); else ask(); };
          });
        });
      };

      ask();
    }

    /* ============================================================
       ألعاب الجيل الجديد — آليات مختلفة عن كل الألعاب الحالية
       كلها داخل نفس الـclosure عشان تستخدم fpl/face/badge/ACC
       ============================================================ */
    const NG_POS = { 1: 'حارس', 2: 'دفاع', 3: 'وسط', 4: 'هجوم' };
    const NG_POSS = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    const ngClamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const ngPrice = p => (num(p.now_cost) / 10).toFixed(1);
    const ngTeam = (F, id) => (F.teams || []).find(t => t.id === id) || {};
    const ngAlive = () => document.body.contains(game);

    function ngIntro(icon, title, text, rules, btn, onStart) {
      game.innerHTML = `
        <div class="ngIntro">
          <div class="ngIntroIc">${icon}</div>
          <div>
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
          </div>
        </div>
        <div class="ngRules">
          <b>طريقة اللعب</b>
          <ul>${rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
        <button class="btn primary ngWide" id="ngStart" type="button">${esc(btn)}</button>`;
      $('#ngStart', game).onclick = onStart;
    }

    function ngPill(text, cls = '') {
      return `<span class="ngPill ${cls}">${esc(text)}</span>`;
    }

    /* ---------- 1) درافت الأبطال: لاعبان على نفس الجهاز ---------- */
    async function draftG() {
      game.innerHTML = '<div class="skel"></div><div class="skel" style="width:70%"></div>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements)) {
        game.innerHTML = '<p class="muted">بيانات اللاعبين مش متاحة دلوقتي. جرّب تحديث الصفحة.</p>';
        return;
      }
      const poolOf = (type, n) => shuf(F.elements
        .filter(p => p.element_type === type && p.minutes >= 450 && p.total_points > 0)
        .sort((a, b) => b.total_points - a.total_points).slice(0, 42))
        .slice(0, n);
      const pool = shuf([
        ...poolOf(1, 4), ...poolOf(2, 7), ...poolOf(3, 7), ...poolOf(4, 6)
      ]);
      if (pool.length < 16) {
        game.innerHTML = '<p class="muted">مفيش بيانات كفاية لتكوين الدرافت.</p>';
        return;
      }
      const order = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
      let turn = 0;
      const picks = [[], []];
      const needs = [['GK', 'DEF', 'MID', 'FWD', 'ANY'], ['GK', 'DEF', 'MID', 'FWD', 'ANY']];
      const taken = new Set();

      const canTake = (p, who) => {
        const n = needs[who];
        return n.includes(NG_POSS[p.element_type]) || n.includes('ANY');
      };
      const take = (p, who) => {
        const n = needs[who];
        const exact = n.indexOf(NG_POSS[p.element_type]);
        if (exact >= 0) n.splice(exact, 1);
        else n.splice(n.indexOf('ANY'), 1);
        picks[who].push(p);
        taken.add(p.id);
      };

      function squadHTML(who) {
        const active = order[turn] === who && turn < order.length;
        return `<div class="ngSquad ${active ? 'active' : ''}">
          <div class="ngSquadH"><b>${who === 0 ? 'اللاعب 1' : 'اللاعب 2'}</b>
            <span>${active ? 'دورك' : 'انتظار'}</span></div>
          <div class="ngSquadBody">
            ${picks[who].map(p => `<div class="ngSlot"><span>${NG_POSS[p.element_type]}</span><b>${esc(p.web_name)}</b></div>`).join('')}
            ${picks[who].length < 5 ? `<div class="ngSlot empty"><span>+</span><b>${needs[who].map(x => x === 'ANY' ? 'أي مركز' : x).join(' / ')}</b></div>` : ''}
          </div>
        </div>`;
      }

      function board() {
        if (turn >= order.length) return finish();
        const who = order[turn];
        game.innerHTML = `
          <div class="ngTop">
            <div><h3>درافت الأبطال</h3><p>اختيار بالتناوب — كل واحد يبني 5 لاعبين</p></div>
            <span class="ngBadge">${turn + 1}/10</span>
          </div>
          <div class="ngSquads">${squadHTML(0)}${squadHTML(1)}</div>
          <div class="ngTurn">دور <b>${who === 0 ? 'اللاعب 1' : 'اللاعب 2'}</b> — اختار لاعب من البطاقات</div>
          <div class="ngGrid ngDraftGrid">
            ${pool.map(p => {
          const owner = picks[0].includes(p) ? 1 : picks[1].includes(p) ? 2 : 0;
          const ok = !taken.has(p.id) && canTake(p, who);
          return `<button class="ngP ${owner ? 'taken' : ''}" type="button" data-pid="${p.id}" ${owner || !ok ? 'disabled' : ''}>
                <span class="ngFaceWrap">${face(p, 'ngFace')}${owner ? `<i class="ngOwner">${owner}</i>` : ''}</span>
                <span class="ngPBody"><b>${esc(p.web_name)}</b><small>${esc((ngTeam(F, p.team).short_name) || '')} • ${NG_POS[p.element_type]}</small>
                <span class="ngPStats">${ngPrice(p)}m <em>${p.total_points} نقطة</em></span></span>
              </button>`;
        }).join('')}
          </div>
          <p class="muted tiny ngNote">اللاعب المختار بيتقفل. لازم كل فريق يكمّل حارس + دفاع + وسط + هجوم + لاعب حر.</p>`;
        $$('.ngP[data-pid]', game).forEach(b => b.onclick = () => {
          const p = pool.find(x => x.id === +b.dataset.pid);
          if (!p || taken.has(p.id) || !canTake(p, who)) return;
          take(p, who);
          turn++;
          board();
        });
      }

      function finish() {
        const info = picks.map((ps, i) => {
          const atk = ps.filter(p => p.element_type >= 3).reduce((s, p) => s + num(p.goals_scored) + num(p.assists), 0);
          const dfn = ps.filter(p => p.element_type <= 2).reduce((s, p) => s + num(p.clean_sheets), 0);
          const power = atk - Math.round(dfn * .55);
          return { ps, atk, dfn, power };
        });
        const goals = info.map((x, i) => ngClamp(Math.round(1 + x.power / 14 + (Math.random() - .5) * 1.2), 0, 4));
        let res, tone;
        if (goals[0] > goals[1]) { res = 'فوز اللاعب 1'; tone = 'win'; }
        else if (goals[1] > goals[0]) { res = 'فوز اللاعب 2'; tone = 'win'; }
        else { res = 'تعادل — أعيدوا الدرافت'; tone = 'draw'; }
        if (goals[0] !== goals[1]) ACC.set('snaces_draft_wins', ACC.get('snaces_draft_wins', 0) + 1);
        game.innerHTML = `
          <div class="ngTop"><div><h3>نتيجة الدرافت</h3><p>${esc(res)}</p></div><span class="ngBadge ${tone}">FT</span></div>
          <div class="ngResult">
            ${info.map((x, i) => `<div class="ngResSide ${goals[i] > goals[1 - i] ? 'winner' : ''}">
              <b>اللاعب ${i + 1}</b><strong>${goals[i]}</strong>
              <small>هجوم ${x.atk} • دفاع ${x.dfn}</small>
              <div class="ngResPlayers">${x.ps.map(p => `<span>${esc(p.web_name)}</span>`).join('')}</div>
            </div>`).join('<div class="ngResVs">×</div>')}
          </div>
          <p class="muted small">القوة الهجومية والدفاعية محسوبة من أرقام اللاعبين في بيانات الفانتازي الحالية — مش أرقام مخترعة.</p>
          <button class="btn primary ngWide" id="again" type="button">درافت جديد</button>`;
        $('#again', game).onclick = draftG;
      }

      ngIntro('🃏', 'درافت الأبطال', 'لاعبان على نفس الجهاز. كل واحد يختار بالتناوب من 24 بطاقة لاعب حقيقية، وبعدين نحسب مباراة بين الفريقين.',
        ['24 لاعب من بيانات الفانتازي الحالية.', 'اللاعب 1 يبدأ، وبعدها التبادل.', 'كل فريق لازم يكمّل: حارس + دفاع + وسط + هجوم + لاعب حر.', 'ممنوع تختار لاعب أخده صاحبك.', 'الفريق الأقوى هجوميًا ودفاعيًا بيكسب المباراة.'],
        'ابدأ الدرافت', board);
    }

    /* ---------- 2) حرب الجزاءات: تسديد وتصدي ضد حارس ذكي ---------- */
    function penaltyG() {
      const ZONES = [
        { id: 'tl', n: 'أعلى يسار', c: 'زاوية' }, { id: 'tc', n: 'أعلى النص', c: 'فوق' }, { id: 'tr', n: 'أعلى يمين', c: 'زاوية' },
        { id: 'ml', n: 'وسط يسار', c: 'جنب' }, { id: 'mc', n: 'النص', c: 'وسط' }, { id: 'mr', n: 'وسط يمين', c: 'جنب' },
        { id: 'bl', n: 'أسفل يسار', c: 'زاوية' }, { id: 'bc', n: 'أسفل النص', c: 'تحت' }, { id: 'br', n: 'أسفل يمين', c: 'زاوية' }
      ];
      let you = 0, opp = 0, saves = 0, keeperSaves = 0, pair = 1, phase = 'shoot', busy = false, done = false, sudden = false;
      let shootHist = [], diveHist = [], last = null;
      const iq = [.28, .44, .6][Math.max(0, Math.min(2, lv - 1))];
      const alive = ngAlive;

      const keeperGuess = () => {
        if (!shootHist.length) return ZONES[rnd(9)].id;
        if (Math.random() < iq) {
          const c = {};
          shootHist.forEach(z => c[z] = (c[z] || 0) + 1);
          return Object.keys(c).sort((a, b) => c[b] - c[a])[0];
        }
        return ZONES[rnd(9)].id;
      };
      const aiShot = () => {
        if (!diveHist.length || Math.random() < iq * .7) return ZONES[rnd(9)].id;
        const c = {};
        diveHist.forEach(z => c[z] = (c[z] || 0) + 1);
        const fav = Object.keys(c).sort((a, b) => c[b] - c[a])[0];
        const rest = ZONES.filter(z => z.id !== fav);
        return rest[rnd(rest.length)].id;
      };

      function hud() {
        return `<div class="pkScore">
          <div><span>أنت</span><b class="green">${you}</b></div>
          <div class="pkRound">${sudden ? 'موت مفاجئ' : `الجولة ${Math.min(pair, 3)}/3`}</div>
          <div><span>الخصم</span><b class="red">${opp}</b></div>
        </div>`;
      }

      function render() {
        const msg = done ? '' : phase === 'shoot'
          ? 'اختار اتجاه التسديد — الحارس مش هيشوف اختيارك'
          : 'أنت الحارس — اختار اتجاه التصدي';
        game.innerHTML = `
          <div class="ngTop"><div><h3>حرب الجزاءات</h3><p>3 جولات: تسدد مرة، وتصد مرة</p></div>${ngPill(`مستوى ${lv}`, 'gold')}</div>
          ${hud()}
          <div class="pkStage">
            <div class="pkNet"><div class="pkGoal">
              ${ZONES.map(z => {
          const shot = last && last.shot === z.id;
          const keep = last && last.keeper === z.id;
          return `<button class="pkZone ${shot ? 'shot' : ''} ${keep ? 'keep' : ''}" type="button" data-z="${z.id}" aria-label="${z.n}" ${busy || done ? 'disabled' : ''}>
                  ${shot ? '<span class="pkBall">⚽</span>' : ''}${keep ? '<span class="pkGlove">🧤</span>' : ''}
                </button>`;
        }).join('')}
            </div></div>
            <div class="pkTurf"><span>🥅</span><small>${done ? 'انتهت المباراة' : msg}</small></div>
          </div>
          <div class="pkMsg" id="pkMsg">${last ? esc(last.txt) : 'الضربة الأولى لك... سجّل!'}</div>`;
        $$('.pkZone', game).forEach(b => b.onclick = () => kick(b.dataset.z));
      }

      function kick(zone) {
        if (busy || done) return;
        if (phase === 'shoot') {
          busy = true;
          const keeper = keeperGuess();
          shootHist.push(zone);
          const saved = keeper === zone;
          if (saved) keeperSaves++; else you++;
          last = { shot: zone, keeper, txt: saved ? '🧤 الحارس صدّها! اختار فكرة تانية المرة الجاية.' : '⚽ جووول! الكرة في الشبكة.' };
          render();
          setTimeout(() => {
            if (!alive() || done) return;
            phase = 'save'; busy = false; last = { txt: 'دورك في الحماية — فين هتتصدى؟' };
            render();
          }, 1150);
        } else if (phase === 'save') {
          busy = true;
          const shot = aiShot();
          diveHist.push(zone);
          const saved = shot === zone;
          if (saved) saves++; else opp++;
          last = { shot, keeper: zone, txt: saved ? '🧤 تصدي عالمي! أنقذت مرماك.' : '⚽ الخصم سجّل — الحارس اتلغبط.' };
          render();
          setTimeout(() => {
            if (!alive()) return;
            nextPair();
          }, 1250);
        }
      }

      function nextPair() {
        busy = false;
        if (pair < 3) {
          pair++; phase = 'shoot'; last = null; render(); return;
        }
        if (you === opp) {
          sudden = true; pair++; phase = 'shoot'; last = null; render(); return;
        }
        finish();
      }

      function finish() {
        done = true;
        const win = you > opp;
        if (win) ACC.set('snaces_penalty_wins', ACC.get('snaces_penalty_wins', 0) + 1);
        const best = ACC.get('snaces_penalty_best', 0);
        if (you > best) ACC.set('snaces_penalty_best', you);
        last = { txt: win ? '🏆 فوز مستحق! الحارس اتهز في النهاية.' : '😮 خسارة قريبة — جرّب تغيّر نمط تسديدك.' };
        game.innerHTML = `
          <div class="ngTop"><div><h3>${win ? 'فوز! 🏆' : 'خسارة'}</h3><p>النتيجة النهائية ${you} — ${opp}</p></div><span class="ngBadge ${win ? 'win' : ''}">FT</span></div>
          <div class="ngResult ngPenRes">
            <div class="ngResSide ${win ? 'winner' : ''}"><b>أنت</b><strong>${you}</strong><small>${shootHist.length} تسديدة • ${keeperSaves} اتصدت عليك</small></div>
            <div class="ngResVs">×</div>
            <div class="ngResSide ${!win ? 'winner' : ''}"><b>الخصم</b><strong>${opp}</strong><small>${diveHist.length} تصدي لك • ${saves} تصدي ناجح</small></div>
          </div>
          <p class="muted small">${esc(last.txt)}</p>
          <p class="muted tiny">أفضل نتيجة تسجيل: ${Math.max(you, best)} أهداف في مباراة.</p>
          <button class="btn primary ngWide" id="again" type="button">مباراة جديدة</button>`;
        $('#again', game).onclick = penaltyG;
      }

      ngIntro('🥅', 'حرب الجزاءات', 'مباراة جزاءات كاملة: تسدد 3 ضربات، وتقف في المرمى 3 مرات. الحارس بيتعلم من قراراتك.',
        ['9 اتجاهات للتسديد والتصدي.', 'كل جولة: أنت تسدد ثم أنت تتصدى.', 'لو التعادل بعد 3 جولات ندخل الموت المفاجئ.', 'الحارس الذكي بيتوقع الاتجاه اللي بتكرره — غيّر خططك.', 'الفوز بيضيف لسجلك المحلي.'],
        'ابدأ المباراة', () => { render(); });
    }

    /* ---------- 3) مايسترو التمرير: لغز مسار على الملعب ---------- */
    function tacticsG() {
      const MAPS = [
        { rows: ['..G..', '.D.D.', '.....', '.D.D.', '..B..'], limit: 6, name: 'بداية سريعة' },
        { rows: ['..G..', '.D.D.', '..D..', '.D.D.', '..B..'], limit: 10, name: 'سد الطريق' },
        { rows: ['.G...', '.D.D.', '..D..', 'D...D', '..B..'], limit: 12, name: 'الجدار الدفاعي' }
      ];
      let stage = 0, lives = 3, score = 0, moves = 0, ball = null, map = null, done = false, busy = false;

      function load(i) {
        stage = i; moves = 0; busy = false;
        map = MAPS[i].rows.map(r => r.split(''));
        for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (map[y][x] === 'B') ball = { x, y };
        render();
      }
      function free(x, y) {
        if (x < 0 || x > 4 || y < 0 || y > 4) return false;
        return map[y][x] !== 'D';
      }
      function adjacent(x, y) {
        return Math.abs(ball.x - x) + Math.abs(ball.y - y) === 1;
      }
      function step(x, y) {
        if (done || busy || !adjacent(x, y) || !free(x, y)) return;
        moves++;
        ball = { x, y };
        if (map[y][x] === 'G') {
          busy = true;
          score += Math.max(25, 120 - moves * 7) + lives * 5;
          render(true);
          return;
        }
        if (moves >= MAPS[stage].limit) {
          lives--;
          busy = true;
          render(false, true);
          return;
        }
        render();
      }
      function nextStage() {
        if (stage + 1 >= MAPS.length) return finish();
        load(stage + 1);
      }
      function render(goal = false, failed = false) {
        game.innerHTML = `
          <div class="ngTop"><div><h3>مايسترو التمرير</h3><p>${esc(MAPS[stage].name)} — المرحلة ${stage + 1}/3</p></div>
            <span class="ngBadge">${'❤️'.repeat(Math.max(0, lives))}${'🖤'.repeat(Math.max(0, 3 - lives))}</span></div>
          <div class="ngPills">${ngPill(`تمريرات ${moves}/${MAPS[stage].limit}`, moves >= MAPS[stage].limit - 1 ? 'warn' : '')}${ngPill(`نقاط ${score}`, 'gold')}</div>
          <div class="tacPitch" role="grid" aria-label="ملعب التمرير">
            ${map.map((row, y) => row.map((c, x) => {
          const isBall = ball.x === x && ball.y === y;
          const near = adjacent(x, y) && free(x, y);
          return `<button class="tacCell ${c === 'D' ? 'wall' : ''} ${near ? 'near' : ''} ${isBall ? 'hasBall' : ''}" type="button" data-x="${x}" data-y="${y}" ${c === 'D' || done || busy ? 'disabled' : ''} aria-label="${isBall ? 'الكرة' : c === 'G' ? 'المرمى' : c === 'D' ? 'مدافع' : 'مساحة فاضية'}">
                ${c === 'D' ? '<span class="tacDef">✖</span>' : isBall ? '<span class="tacBall">⚽</span>' : c === 'G' ? '<span class="tacGoal">🥅</span>' : ''}
              </button>`;
        }).join('')).join('')}
          </div>
          <p class="muted small">حرّك الكرة خطوة واحدة أفقيًا أو رأسيًا. المدافعين (✖) سدّوا المساحة — دوّر عليهم ووصل للشبكة قبل ما التمريرات تخلص.</p>
          ${goal ? `<div class="ngBanner win">هدف! المرحلة خلصت +${Math.max(25, 120 - moves * 7) + lives * 5} نقطة</div><button class="btn primary ngWide" id="next" type="button">${stage + 1 >= MAPS.length ? 'شوف النتيجة' : 'المرحلة التالية'}</button>` : ''}
          ${failed ? `<div class="ngBanner lose">خلصت التمريرات! خسرت قلب — ${lives > 0 ? 'جرّب المسار تاني' : 'انتهت المحاولات'}</div><button class="btn primary ngWide" id="retry" type="button">${lives > 0 ? 'أعد المرحلة' : 'شوف النتيجة'}</button>` : ''}`;
        $$('.tacCell[data-x]', game).forEach(b => b.onclick = () => step(+b.dataset.x, +b.dataset.y));
        const nx = $('#next', game); if (nx) nx.onclick = nextStage;
        const rt = $('#retry', game);
        if (rt) rt.onclick = () => {
          if (lives <= 0) return finish();
          load(stage);
        };
      }
      function finish() {
        done = true;
        const ok = stage + 1 >= MAPS.length && lives > 0;
        const best = ACC.get('snaces_tactics_best', 0);
        if (score > best) ACC.set('snaces_tactics_best', score);
        game.innerHTML = `
          <div class="ngTop"><div><h3>${ok ? 'مايسترو! 🧠' : 'المحاولات خلصت'}</h3><p>${ok ? 'عدّيت كل مراحل التمرير' : `وصلت للمرحلة ${stage + 1} من 3`}</p></div><span class="ngBadge ${ok ? 'win' : ''}">${score} نقطة</span></div>
          <div class="ngResult ngPenRes"><div class="ngResSide ${ok ? 'winner' : ''}"><b>نتيجتك</b><strong>${score}</strong><small>أفضل نتيجة ${Math.max(score, best)}</small></div></div>
          <p class="muted small">كل مرحلة ليها خريطة دفاعية مختلفة. المسار الصح مش دايمًا الأقصر.</p>
          <button class="btn primary ngWide" id="again" type="button">العب من الأول</button>`;
        $('#again', game).onclick = tacticsG;
      }

      ngIntro('🧩', 'مايسترو التمرير', 'لغز تكتيكي على ملعب 5×5. وصّل الكرة من البداية للشبكة من غير ما تدخل في المدافعين.',
        ['الكرة بتتحرك خطوة واحدة أفقي أو رأسي.', 'المدافعين بيسدّوا المربعات — مش هتعدي منهم.', 'كل مرحلة ليها عدد تمريرات محدد.', 'عندك 3 محاولات (قلوب).', 'المرحلة الأسرع = نقاط أكتر.'],
        'ابدأ التمرير', () => { score = 0; lives = 3; done = false; load(0); });
    }

    /* ---------- 4) عجلة القيود: تشكيلة بميزانية وقيد عشوائي ---------- */
    async function rouletteG() {
      game.innerHTML = '<div class="skel"></div><div class="skel" style="width:65%"></div>';
      const F = await fpl();
      if (!F || !Array.isArray(F.elements)) {
        game.innerHTML = '<p class="muted">بيانات الفانتازي مش متاحة. جرّب تحديث الصفحة.</p>';
        return;
      }
      const pool = F.elements.filter(p => p.minutes >= 300 && p.total_points > 0);
      if (pool.length < 40) { game.innerHTML = '<p class="muted">مفيش لاعبين كفاية.</p>'; return; }
      const rules = [
        { id: 'diffclub', label: 'كل لاعب من نادي مختلف', maxPerClub: 1 },
        { id: 'maxprice', label: 'ممنوع لاعب أغلى من 7.5 مليون', maxPrice: 75 },
        { id: 'threeclub', label: '3 أندية مختلفة على الأقل', minClubs: 3 },
        { id: 'onefwd', label: 'مهاجم واحد كحد أقصى', maxFwd: 1 },
        { id: 'budget45', label: 'الميزانية 45.0 مليون بدل 50', budget: 450 }
      ];
      const teamsWithPlayers = [...new Set(pool.map(p => p.team))];
      const mustTeamId = teamsWithPlayers[rnd(teamsWithPlayers.length)];
      const mustTeam = ngTeam(F, mustTeamId);
      const mustRule = { id: 'must', label: `لازم لاعب من ${mustTeam.name || mustTeam.short_name}`, mustTeam: mustTeamId };
      const rule = [...rules, mustRule][rnd(rules.length + 1)];
      const budget = rule.budget || 500;
      let picked = [];
      let filter = 0;
      const missingPositions = () => ['GK', 'DEF', 'MID', 'FWD'].filter(pos => !picked.some(x => NG_POSS[x.element_type] === pos));

      function addBlock(p) {
        if (picked.length >= 5) return 'اكتمل الفريق';
        if (picked.some(x => x.id === p.id)) return 'مختار';
        const cost = picked.reduce((s, x) => s + num(x.now_cost), 0);
        if (cost + num(p.now_cost) > budget) return 'الميزانية خلصت';
        if (rule.maxPrice && num(p.now_cost) > rule.maxPrice) return 'أغلى من المسموح';
        if (rule.maxPerClub && picked.filter(x => x.team === p.team).length >= rule.maxPerClub) return 'نفس النادي';
        if (rule.maxFwd && p.element_type === 4 && picked.filter(x => x.element_type === 4).length >= 1) return 'مهاجم زيادة';
        const pos = NG_POSS[p.element_type];
        const missing = missingPositions();
        const slotsLeft = 5 - picked.length;
        if (missing.length && slotsLeft <= missing.length && !missing.includes(pos)) return `لازم ${missing.join(' و')}`;
        if (rule.minClubs) {
          const clubs = new Set([...picked.map(x => x.team), p.team]);
          const slotsLeft = 5 - (picked.length + 1);
          if (clubs.size + slotsLeft < rule.minClubs) return `محتاج ${rule.minClubs} أندية`;
        }
        if (rule.mustTeam && picked.length === 4 && !picked.some(x => x.team === rule.mustTeam) && p.team !== rule.mustTeam) {
          return 'لازم لاعب من النادي المطلوب';
        }
        return '';
      }

      function choose(p) {
        if (addBlock(p)) return;
        picked.push(p);
        if (picked.length >= 5) finish(); else pickUI();
      }

      function pickUI() {
        const cost = picked.reduce((s, x) => s + num(x.now_cost), 0);
        const candidates = pool.filter(p => !filter || p.element_type === filter).sort((a, b) => b.total_points - a.total_points);
        const available = candidates.filter(p => !addBlock(p));
        const list = (available.length >= 5 ? available : candidates).slice(0, 80);
        const missing = missingPositions();
        game.innerHTML = `
          <div class="ngTop"><div><h3>عجلة القيود</h3><p>اختار 5 لاعبين — القيد الحالي: <b class="green">${esc(rule.label)}</b></p></div>
            <span class="ngBadge">${picked.length}/5</span></div>
          <div class="ngPills">
            ${ngPill(`المتبقي ${((budget - cost) / 10).toFixed(1)}m`, budget - cost < 50 ? 'warn' : 'gold')}
            ${ngPill(`المصروف ${(cost / 10).toFixed(1)}m`)}
            ${missing.map(x => ngPill(x)).join('')}
          </div>
          <div class="ngPicked">
            ${[0, 1, 2, 3, 4].map(i => picked[i] ? `<button class="ngPick" type="button" data-sell="${picked[i].id}" title="اضغط للبيع والاستبدال"><b>${NG_POSS[picked[i].element_type]}</b><span>${esc(picked[i].web_name)}</span><small>${ngPrice(picked[i])}m ✕</small></button>` : `<div class="ngPick empty"><b>?</b><span>${i === 4 ? 'حر' : 'اختار'}</span></div>`).join('')}
          </div>
          <div class="chips ngFilters">
            ${[[0, 'الكل'], [1, 'حراس'], [2, 'دفاع'], [3, 'وسط'], [4, 'هجوم']].map(([k, n]) => `<button class="btn ${filter === k ? 'primary' : 'secondary'}" type="button" data-f="${k}">${n}</button>`).join('')}
          </div>
          <div class="rlList">
            ${list.map(p => {
          const why = addBlock(p);
          const tm = ngTeam(F, p.team);
          return `<button class="rlRow" type="button" data-pid="${p.id}" ${why ? 'disabled' : ''}>
                ${face(p, 'ngFace')}
                <span class="rlBody"><b>${esc(p.web_name)}</b><small>${badge(tm, 'sm')}${esc(tm.short_name || '')} • ${NG_POS[p.element_type]}</small></span>
                <span class="rlNums"><b>${p.total_points}</b><small>${ngPrice(p)}m</small></span>
                <span class="rlAdd">${why || '+'}</span>
              </button>`;
        }).join('')}
          </div>
          <p class="muted tiny">الأرقام من بيانات الفانتازي الحالية. القيد بيتم تطبيقه أثناء الاختيار — مفيش غش.</p>`;
        $$('[data-f]', game).forEach(b => b.onclick = () => { filter = +b.dataset.f; pickUI(); });
        $$('.ngPick[data-sell]', game).forEach(b => b.onclick = () => {
          picked = picked.filter(x => x.id !== +b.dataset.sell);
          pickUI();
        });
        $$('.rlRow[data-pid]', game).forEach(b => b.onclick = () => {
          const p = pool.find(x => x.id === +b.dataset.pid);
          if (p) choose(p);
        });
      }

      function finish() {
        const cost = picked.reduce((s, x) => s + num(x.now_cost), 0);
        const pts = picked.reduce((s, x) => s + num(x.total_points), 0);
        const grade = pts >= 300 ? 'فريق أسطوري 🏆' : pts >= 240 ? 'فريق قوي 🔥' : pts >= 180 ? 'فريق واعد 👏' : 'محتاج تعديل 💪';
        const best = ACC.get('snaces_roulette_best', 0);
        if (pts > best) ACC.set('snaces_roulette_best', pts);
        ACC.set('snaces_roulette_runs', ACC.get('snaces_roulette_runs', 0) + 1);
        game.innerHTML = `
          <div class="ngTop"><div><h3>${esc(grade)}</h3><p>القيد كان: ${esc(rule.label)}</p></div><span class="ngBadge gold">${pts} نقطة</span></div>
          <div class="ngResult ngPenRes"><div class="ngResSide winner"><b>إجمالي نقاط الفريق</b><strong>${pts}</strong><small>${(cost / 10).toFixed(1)}m من ${(budget / 10).toFixed(1)}m</small></div></div>
          <div class="ngPicked">
            ${picked.map(p => `<div class="ngPick"><b>${NG_POSS[p.element_type]}</b><span>${esc(p.web_name)}</span><small>${p.total_points} نقطة</small></div>`).join('')}
          </div>
          <p class="muted small">أفضل نتيجة ليك: ${Math.max(pts, best)} نقطة. جرّب قيد تاني وعجلة جديدة.</p>
          <button class="btn primary ngWide" id="again" type="button">عجلة جديدة</button>`;
        $('#again', game).onclick = rouletteG;
      }

      game.innerHTML = `
        <div class="ngIntro"><div class="ngIntroIc">🎡</div><div><h3>عجلة القيود</h3><p>عجلة عشوائية بتختار قيد على التشكيلة. كوّن أفضل 5 لاعبين تحت القيد والميزانية.</p></div></div>
        <div class="rlWheelWrap"><div class="rlWheel" id="rlWheel"><span>🎡</span></div><div class="rlNeedle">▼</div></div>
        <div class="ngRules"><b>القيد اللي هيطلع</b><p class="muted small">${esc(rules.map(r => r.label).join(' • '))} • أو لاعب من نادي معين</p></div>
        <button class="btn primary ngWide" id="spin" type="button">أدر العجلة</button>`;
      $('#spin', game).onclick = () => {
        const w = $('#rlWheel', game);
        if (!w) return;
        w.classList.add('spin');
        $('#spin', game).disabled = true;
        setTimeout(() => {
          if (!ngAlive()) return;
          w.classList.remove('spin');
          game.innerHTML = `
            <div class="ngIntro"><div class="ngIntroIc">🎯</div><div><h3>القيد اتحدد</h3><p>${esc(rule.label)} — الميزانية ${(budget / 10).toFixed(1)} مليون</p></div></div>
            <div class="ngRules"><b>شروط ثابتة</b><ul><li>5 لاعبين: حارس + دفاع + وسط + هجوم + لاعب حر.</li><li>اختار من بيانات الفانتازي الحقيقية.</li><li>ممنوع تكرار اللاعب.</li></ul></div>
            <button class="btn primary ngWide" id="go" type="button">ابدأ الاختيار</button>`;
          $('#go', game).onclick = pickUI;
        }, 950);
      };
    }

    /* ---------- 5) ارتباطات الكورة: 4 أندية من نفس الدولة ---------- */
    function connectG() {
      const block = ['أوروبا', 'أفريقيا', 'أمريكا الجنوبية', 'آسيا', 'أمريكا الشمالية', 'أوقيانوسيا'];
      const by = {}, seen = new Set();
      (typeof J !== 'undefined' ? J : []).forEach(k => {
        const country = k[1], name = k[0];
        if (!country || block.includes(country) || /\(منتخب\)/.test(name) || seen.has(name)) return;
        seen.add(name);
        (by[country] = by[country] || []).push({ name, color: (k[3] && k[3][0]) || '#25d39a' });
      });
      const cats = Object.keys(by).filter(c => by[c].length >= 4);
      if (cats.length < 4) {
        game.innerHTML = '<p class="muted">بيانات الأندية مش كفاية للعبة الارتباطات.</p>';
        return;
      }
      const chosenCats = shuf(cats).slice(0, 4);
      const groups = chosenCats.map(c => ({ country: c, clubs: shuf(by[c]).slice(0, 4) }));
      let chips = shuf(groups.flatMap(g => g.clubs.map(c => ({ ...c, country: g.country }))));
      let selected = new Set();
      let solved = [];
      let lives = 4, mistakes = 0, score = 0, done = false;

      function render(msg = '') {
        game.innerHTML = `
          <div class="ngTop"><div><h3>ارتباطات الكورة</h3><p>جمّع 4 أندية من نفس الدولة</p></div>
            <span class="ngBadge">${'❤️'.repeat(Math.max(0, lives))}${'🖤'.repeat(Math.max(0, 4 - lives))}</span></div>
          <div class="ngPills">${ngPill(`مجموعات ${solved.length}/4`, 'gold')}${ngPill(`أخطاء ${mistakes}`, mistakes ? 'warn' : '')}</div>
          <div class="cnSolved">${solved.map(g => `<div class="cnRow"><b>${esc(g.country)}</b><span>${g.clubs.map(c => esc(c.name)).join(' • ')}</span></div>`).join('')}</div>
          <div class="cnGrid">
            ${chips.map(c => `<button class="cnChip ${selected.has(c.name) ? 'on' : ''}" type="button" data-name="${esc(c.name)}" ${done ? 'disabled' : ''}>
              <i style="background:${esc(c.color)}"></i><span>${esc(c.name)}</span>
            </button>`).join('')}
          </div>
          <div class="cnMsg" id="cnMsg">${esc(msg || (selected.size < 4 ? `اختار ${4 - selected.size} أندية كمان` : 'اضغط تحقّق لما تكون متأكد'))}</div>
          <div class="cnActions">
            <button class="btn primary" id="cnCheck" type="button" ${selected.size !== 4 || done ? 'disabled' : ''}>تحقّق من المجموعة</button>
            <button class="btn secondary" id="cnClear" type="button" ${!selected.size || done ? 'disabled' : ''}>امسح الاختيار</button>
          </div>
          <p class="muted tiny">كل مجموعة = 4 أندية من نفس الدولة. عندك 4 محاولات غلط. الأندية الحقيقية من بنك المشروع.</p>`;
        $$('.cnChip[data-name]', game).forEach(b => b.onclick = () => {
          if (done) return;
          const n = b.dataset.name;
          if (selected.has(n)) selected.delete(n);
          else if (selected.size < 4) selected.add(n);
          else return;
          render();
        });
        $('#cnClear', game).onclick = () => { selected.clear(); render(); };
        $('#cnCheck', game).onclick = check;
      }

      function check() {
        if (selected.size !== 4 || done) return;
        const names = [...selected];
        const counts = {};
        names.forEach(n => {
          const c = chips.find(x => x.name === n);
          if (c) counts[c.country] = (counts[c.country] || 0) + 1;
        });
        const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
        if (counts[top] === 4) {
          const g = groups.find(x => x.country === top);
          solved.push(g);
          chips = chips.filter(c => !names.includes(c.name));
          selected.clear();
          score += 100;
          if (solved.length >= 4) return finish(true);
          render(`✅ صح! ${top} — مجموعة كاملة.`);
        } else {
          lives--;
          mistakes++;
          selected.clear();
          if (lives <= 0) return finish(false);
          render(`❌ مش كلهم من نفس الدولة — منهم ${counts[top]} من دولة واحدة. باقي ${lives} محاولات.`);
        }
      }

      function finish(win) {
        done = true;
        const pts = Math.max(0, score - mistakes * 15 + lives * 10);
        const best = ACC.get('snaces_connect_best', 0);
        if (pts > best) ACC.set('snaces_connect_best', pts);
        game.innerHTML = `
          <div class="ngTop"><div><h3>${win ? 'شبكة كاملة! 🔗' : 'المحاولات خلصت'}</h3><p>${win ? 'ربطت كل المجموعات' : `حليت ${solved.length} من 4 مجموعات`}</p></div><span class="ngBadge ${win ? 'win' : ''}">${pts} نقطة</span></div>
          <div class="ngResult ngPenRes"><div class="ngResSide ${win ? 'winner' : ''}"><b>نتيجتك</b><strong>${pts}</strong><small>أفضل ${Math.max(pts, best)} • أخطاء ${mistakes}</small></div></div>
          <div class="cnSolved">${groups.map(g => `<div class="cnRow ${solved.some(s => s.country === g.country) ? 'ok' : ''}"><b>${esc(g.country)}</b><span>${g.clubs.map(c => esc(c.name)).join(' • ')}</span></div>`).join('')}</div>
          <button class="btn primary ngWide" id="again" type="button">شبكة جديدة</button>`;
        $('#again', game).onclick = connectG;
      }

      render();
    }

    /* ============================================================
       Football Tic-Tac-Toe + Memory + Bingo
       ============================================================ */
    const TTT_POOLS = {
      1: ['ريال مدريد', 'برشلونة', 'مانشستر يونايتد', 'تشيلسي', 'بايرن ميونخ', 'يوفنتوس', 'ليفربول', 'ميلان', 'إنتر', 'باريس سان جيرمان'],
      2: ['ريال مدريد', 'برشلونة', 'مانشستر يونايتد', 'تشيلسي', 'بايرن ميونخ', 'يوفنتوس', 'ليفربول', 'ميلان', 'إنتر', 'باريس سان جيرمان', 'آرسنال', 'مانشستر سيتي', 'أتلتيكو مدريد', 'بوروسيا دورتموند', 'نابولي', 'روما', 'توتنهام', 'أياكس', 'بورتو', 'بنفيكا'],
      3: null
    };
    const tttNorm = s => String(s || '').toLowerCase()
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const tttNameIndex = new Map();
    if (typeof TTT_CAREERS !== 'undefined') {
      TTT_CAREERS.forEach((p, i) => {
        [p[0], ...(p[1] || [])].forEach(n => {
          const k = tttNorm(n);
          if (k && !tttNameIndex.has(k)) tttNameIndex.set(k, i);
        });
      });
    }
    const tttCrest = (name, cls = 'tttCrest') => {
      const c = typeof TTT_CLUBS !== 'undefined' ? TTT_CLUBS[name] : null;
      if (!c) return `<span class="tttCrestTxt">${esc(name)}</span>`;
      const u = `https://imagecache.365scores.com/image/upload/f_png,w_80,h_80,c_limit,q_auto:eco/v1/Competitors/${c.id}`;
      return `<img class="${cls}" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${CREST_FB}" onerror="this.onerror=null;this.src=this.dataset.fb">`;
    };
    const tttInitials = name => String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('');
    const tttPhoto = (rec, cls = 'tttFace') => rec && rec[5]
      ? `<img class="${cls}" src="${plPhoto(rec[5], true)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${FB_FACE}" onerror="this.onerror=null;this.src=this.dataset.fb">`
      : `<span class="${cls} tttFaceFallback">${esc(tttInitials(rec && rec[0]))}</span>`;
    const tttCands = (r, c) => {
      if (typeof TTT_BY_CLUB === 'undefined') return [];
      const a = TTT_BY_CLUB[r] || [], b = new Set(TTT_BY_CLUB[c] || []);
      return a.filter(i => b.has(i));
    };
    const tttFind = q => {
      const k = tttNorm(q);
      if (!k) return -1;
      if (tttNameIndex.has(k)) return tttNameIndex.get(k);
      const hits = [...new Set([...tttNameIndex.entries()].filter(([n]) => n.includes(k) || (n.length >= 4 && k.includes(n))).map(x => x[1]))];
      return hits.length === 1 ? hits[0] : -1;
    };
    /* بطاقة صورة بعد الإجابة فقط — مش بتظهر في الاختيارات */
    function playerReveal(name) {
      if (typeof TTT_CAREERS === 'undefined') return '';
      /* مطابقة تامة فقط: الاسم الجزئي ممكن يخص لاعبًا تاني */
      const i = tttNameIndex.get(tttNorm(name));
      if (i == null) return '';
      const r = TTT_CAREERS[i];
      return `<div class="answerCard">${tttPhoto(r, 'answerFace')}
        <div class="answerMeta"><b>${esc(r[0])}</b><small>${esc(r[3] || '')}${r[4] ? ' • ' + esc(r[4]) : ''}</small>
        <span class="answerClubs">${(r[2] || []).slice(0, 4).map(c => tttCrest(c, 'answerCrest')).join('')}</span></div></div>`;
    }
    const tttSuggest = q => {
      const k = tttNorm(q);
      if (k.length < 2 || typeof TTT_CAREERS === 'undefined') return [];
      const out = [];
      TTT_CAREERS.forEach((p, i) => {
        if (out.length >= 8) return;
        if ([p[0], ...(p[1] || [])].some(n => tttNorm(n).includes(k))) out.push(i);
      });
      return out;
    };
    function tttMatchCount(cells) {
      const owner = {};
      const aug = (ci, seen) => {
        for (const p of cells[ci]) {
          if (seen.has(p)) continue;
          seen.add(p);
          if (owner[p] === undefined || aug(owner[p], seen)) { owner[p] = ci; return true; }
        }
        return false;
      };
      let n = 0;
      for (let i = 0; i < cells.length; i++) if (aug(i, new Set())) n++;
      return n;
    }
    function tttMakeBoard() {
      const pool = TTT_POOLS[lv] || (typeof TTT_CLUBS !== 'undefined' ? Object.keys(TTT_CLUBS) : []);
      for (let k = 0; k < 400; k++) {
        const sh = shuf(pool), rows = sh.slice(0, 3);
        const cand = sh.slice(3).filter(c => rows.every(r => tttCands(r, c).length));
        if (cand.length < 3) continue;
        const cols = shuf(cand).slice(0, 3);
        const cells = [];
        let ok = true;
        for (const r of rows) for (const c of cols) {
          const a = tttCands(r, c);
          if (!a.length) { ok = false; break; }
          cells.push(a);
        }
        if (ok && tttMatchCount(cells) === 9) return { rows, cols, cells };
      }
      return null;
    }

    let tttState = null, tttPick = null;
    function tttG() {
      if (typeof TTT_CAREERS === 'undefined' || typeof TTT_CLUBS === 'undefined') {
        game.innerHTML = '<p class="muted">قاعدة بيانات المسيرات مش محمّلة.</p>';
        return;
      }
      if (timer) { clearInterval(timer); timer = null; }
      tttState = null;
      tttPick = null;
      const best = mode => ACC.get('snaces_ttt_best_' + mode + '_' + lv, 0);
      const lvName = (LV.find(x => x[0] === lv) || [1, 'سهل'])[1];
      game.innerHTML = `
        <div class="ngIntro"><div class="ngIntroIc">⚽</div><div><h3>Football Tic-Tac-Toe</h3>
          <p>شبكة 3×3 من الأندية. كل خانة تقاطع نادٍ في الصف ونادٍ في العمود — اكتب لاعبًا لعب للفريقين رسميًا.</p></div></div>
        <div class="ngRules"><b>القواعد قبل ما تبدأ</b>
          <ul>
            <li>كل خانة = لاعب واحد لعب للفريقين مع الفريق الأول فقط (مفيش شباب أو رديف).</li>
            <li>ممنوع تكرار نفس اللاعب في اللوحة.</li>
            <li>كل الإجابات الصحيحة مقبولة — مش لاعب واحد محفوظ لكل خانة.</li>
            <li>لاعب واحد: 3 أخطاء كحد أقصى. لاعبان: دور بالتناوب و3 أخطاء لكل لاعب. تحدي زمني: 60–90 ثانية.</li>
            <li>بعد نهاية الجولة تظهر كل الإجابات الممكنة لكل خانة.</li>
          </ul>
          <p class="muted tiny">المستوى الحالي: <b>${esc(lvName)}</b> • قاعدة المسيرات: ${TTT_CAREERS.length} لاعبًا و${Object.keys(TTT_CLUBS).length} ناديًا.</p>
        </div>
        <div class="tttModes">
          <button class="btn primary" type="button" data-mode="solo">🎯 لاعب واحد<small>أفضل نتيجة • 3 أخطاء</small></button>
          <button class="btn secondary" type="button" data-mode="duo">👥 لاعبان<small>دور بالتناوب • نقاط</small></button>
          <button class="btn secondary" type="button" data-mode="timed">⏱️ تحدي زمني<small>${[90, 75, 60][lv - 1]} ثانية</small></button>
        </div>
        <div class="ngPills"><span class="ngPill">أفضل لاعب واحد: ${best('solo')}</span><span class="ngPill">أفضل زمني: ${best('timed')}</span></div>`;
      $$('[data-mode]', game).forEach(b => b.onclick = () => tttStart(b.dataset.mode));
    }

    function tttStart(mode) {
      if (timer) { clearInterval(timer); timer = null; }
      const board = tttMakeBoard();
      if (!board) { game.innerHTML = '<p class="muted">تعذّر توليد لوحة موثوقة — جرّب مستوى تاني.</p><button class="btn primary ngWide" id="tttBack" type="button">رجوع</button>'; $('#tttBack', game).onclick = tttG; return; }
      tttState = {
        mode, board, chosen: Array(9).fill(null), owner: Array(9).fill(0), used: new Set(),
        mistakes: 0, pMistakes: [0, 0], score: 0, correct: 0, turn: 1, left: 0, done: false
      };
      tttPick = null;
      if (mode === 'timed') {
        tttState.left = [90, 75, 60][lv - 1];
        timer = setInterval(() => {
          if (!tttState || tttState.done) return;
          if (!document.body.contains(game)) { clearInterval(timer); timer = null; return; }
          tttState.left--;
          const t = $('#tttTime', game), bar = $('#tttBar', game);
          if (t) t.textContent = Math.max(0, tttState.left);
          if (bar) bar.style.width = Math.max(0, tttState.left / [90, 75, 60][lv - 1] * 100) + '%';
          if (tttState.left <= 0) tttFinish('time');
        }, 1000);
      }
      tttRender('اختار خانة واكتب اسم اللاعب — كل الإجابات الصحيحة مقبولة.');
    }

    function tttRender(msg = '', tone = '') {
      const S = tttState;
      if (!S || S.done) return;
      const rowHeads = S.board.rows.map(r => `<div class="tttHead">${tttCrest(r)}<span>${esc(r)}</span></div>`).join('');
      let cells = '';
      for (let r = 0; r < 3; r++) {
        cells += `<div class="tttHead tttRowHead">${tttCrest(S.board.rows[r])}<span>${esc(S.board.rows[r])}</span></div>`;
        for (let c = 0; c < 3; c++) {
          const i = r * 3 + c, rec = S.chosen[i];
          const own = S.mode === 'duo' ? S.owner[i] : 1;
          cells += `<button class="tttCell ${rec ? 'done own' + own : ''}" type="button" data-i="${i}" ${rec || S.done ? 'disabled' : ''} title="${esc(S.board.rows[r])} × ${esc(S.board.cols[c])}">
            ${rec ? `<span class="tttCellDone">${tttPhoto(rec, 'tttCellFace')}<b>${esc(rec[0])}</b><span class="tttCellMini">${tttCrest(S.board.rows[r], 'tttMini')}${tttCrest(S.board.cols[c], 'tttMini')}</span></span>` : `<span class="tttPlus">＋</span><small>اضغط للإجابة</small>`}
          </button>`;
        }
      }
      const modeLabel = S.mode === 'solo' ? 'لاعب واحد' : S.mode === 'duo' ? 'لاعبان' : 'تحدي زمني';
      const lives = S.mode === 'solo'
        ? '❤️'.repeat(Math.max(0, 3 - S.mistakes)) + '🖤'.repeat(Math.min(3, S.mistakes))
        : S.mode === 'duo'
          ? `١: ${'❤️'.repeat(Math.max(0, 3 - S.pMistakes[0]))}${'🖤'.repeat(Math.min(3, S.pMistakes[0]))} • ٢: ${'❤️'.repeat(Math.max(0, 3 - S.pMistakes[1]))}${'🖤'.repeat(Math.min(3, S.pMistakes[1]))}`
          : `<b id="tttTime">${Math.max(0, S.left)}</b> ثانية`;
      const turn = S.mode === 'duo' ? `<span class="tttTurnPill ${S.turn === 1 ? 'p1' : 'p2'}">دور اللاعب ${S.turn === 1 ? '١' : '٢'}</span>` : '';
      game.innerHTML = `
        <div class="ngTop"><div><h3>${modeLabel} ${turn}</h3><p>${S.correct} من 9 خانات • ${S.mode === 'timed' ? 'الوقت' : 'المحاولات'}: ${lives}</p></div><span class="ngBadge ${S.correct === 9 ? 'win' : ''}">${S.score} نقطة</span></div>
        ${S.mode === 'timed' ? `<div class="tttTimeTrack"><span id="tttBar" style="width:${Math.max(0, S.left / [90, 75, 60][lv - 1] * 100)}%"></span></div>` : ''}
        <div class="tttBoardWrap"><div class="tttGrid">
          <div class="tttCorner">⚽</div>${S.board.cols.map(c => `<div class="tttHead tttColHead">${tttCrest(c)}<span>${esc(c)}</span></div>`).join('')}
          ${cells}
        </div></div>
        <div class="tttMsg ${tone}" id="tttMsg">${esc(msg)}</div>
        <div id="tttPick"></div>
        <div class="tttActions"><button class="btn secondary" type="button" id="tttFinishBtn">إنهاء وعرض الإجابات</button><button class="btn secondary" type="button" id="tttNewBtn">لعبة جديدة</button></div>
        <p class="muted tiny">المشاركة الرسمية مع الفريق الأول فقط. الصور لا تظهر قبل الإجابة الصحيحة.</p>`;
      $$('.tttCell[data-i]', game).forEach(b => b.onclick = () => tttPicker(+b.dataset.i));
      $('#tttFinishBtn', game).onclick = () => tttFinish('manual');
      $('#tttNewBtn', game).onclick = tttG;
      if (tttPick != null) tttPicker(tttPick);
    }

    function tttPicker(i) {
      const S = tttState;
      if (!S || S.done || S.chosen[i]) return;
      tttPick = i;
      const box = $('#tttPick', game);
      if (!box) return;
      const r = Math.floor(i / 3), c = i % 3;
      box.innerHTML = `<div class="tttPicker">
        <div class="tttPickerHead"><div><b>${tttCrest(S.board.rows[r], 'tttMini')} ${esc(S.board.rows[r])} <span class="muted">×</span> ${tttCrest(S.board.cols[c], 'tttMini')} ${esc(S.board.cols[c])}</b><small>لاعب لعب للفريقين مع الفريق الأول</small></div><button class="btn secondary" type="button" id="tttClose">✕</button></div>
        <div class="tttSearch"><input class="control" id="tttName" type="text" autocomplete="off" placeholder="اكتب اسم اللاعب بالعربي أو الإنجليزي…" aria-label="اسم اللاعب"><button class="btn primary" type="button" id="tttGo">تأكيد</button></div>
        <div class="tttSug" id="tttSug"></div>
        <p class="muted tiny" id="tttHint">الاقتراحات أسماء فقط — مفيش كشف للإجابة. اضغط على الاسم لو حابب.</p>
      </div>`;
      const input = $('#tttName', game), sug = $('#tttSug', game);
      const drawSug = () => {
        const q = input.value.trim();
        if (tttNorm(q).length < 2) { sug.innerHTML = ''; return; }
        const list = tttSuggest(q).filter(ix => !S.used.has(ix)).slice(0, 8);
        sug.innerHTML = list.length ? list.map(ix => `<button class="tttSugBtn" type="button" data-ix="${ix}">${esc(TTT_CAREERS[ix][0])}</button>`).join('') : '<span class="muted tiny">مفيش اقتراحات — جرّب الاسم كامل.</span>';
        $$('.tttSugBtn', sug).forEach(b => b.onclick = () => { input.value = TTT_CAREERS[+b.dataset.ix][0]; sug.innerHTML = ''; input.focus(); });
      };
      input.oninput = drawSug;
      input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); tttAttempt(i, input.value); } };
      $('#tttGo', game).onclick = () => tttAttempt(i, input.value);
      $('#tttClose', game).onclick = () => { tttPick = null; box.innerHTML = ''; };
      setTimeout(() => { if (document.body.contains(input)) input.focus(); }, 30);
    }

    function tttAttempt(i, value) {
      const S = tttState;
      if (!S || S.done || S.chosen[i]) return;
      const q = String(value || '').trim();
      if (!q) { $('#tttHint', game).textContent = 'اكتب اسم اللاعب الأول.'; return; }
      const ix = tttFind(q);
      if (ix < 0) return tttMiss(i, 'مش لاقي اللاعب ده في قاعدة المسيرات — جرّب الاسم كامل أو بالإنجليزي.');
      if (S.used.has(ix)) return tttMiss(i, 'اللاعب ده مستخدم قبل كده — ممنوع تكرار نفس اللاعب في اللوحة.');
      const rec = TTT_CAREERS[ix];
      if (!S.board.cells[i].includes(ix)) return tttMiss(i, `❌ ${rec[0]} لعب لـ ${rec[2].join('، ')} — لكنه مش لعب للفريقين معًا.`);
      S.chosen[i] = rec;
      S.used.add(ix);
      S.correct++;
      S.score += 100 + (lv - 1) * 20;
      if (S.mode === 'duo') S.owner[i] = S.turn;
      const gain = 100 + (lv - 1) * 20;
      const who = S.mode === 'duo' ? `اللاعب ${S.turn === 1 ? '١' : '٢'} ` : '';
      if (S.mode === 'duo') tttNextTurn();
      if (S.correct === 9) return tttFinish('full');
      tttPick = null;
      tttRender(`✅ ${who}${rec[0]} صح! +${gain} نقطة.`);
    }

    function tttNextTurn() {
      const S = tttState;
      if (!S || S.mode !== 'duo') return;
      if (S.pMistakes[0] >= 3 && S.pMistakes[1] >= 3) return tttFinish('lives');
      const other = S.turn === 1 ? 2 : 1;
      if (S.pMistakes[other - 1] < 3) S.turn = other;
    }

    function tttMiss(i, msg) {
      const S = tttState;
      if (!S || S.done) return;
      S.mistakes++;
      if (S.mode === 'duo') S.pMistakes[S.turn - 1]++;
      if (S.mode === 'timed') S.left = Math.max(0, S.left - 5);
      tttPick = null;
      if (S.mode === 'duo') {
        if (S.pMistakes[0] >= 3 && S.pMistakes[1] >= 3) return tttFinish('lives');
        tttNextTurn();
      } else if (S.mode === 'solo' && S.mistakes >= 3) return tttFinish('lives');
      if (S.mode === 'timed' && S.left <= 0) return tttFinish('time');
      tttRender(msg + (S.mode === 'timed' ? ' −5 ثوانٍ.' : S.mode === 'duo' ? ' الدور اتنقل.' : ' باقي ' + Math.max(0, 3 - S.mistakes) + ' محاولات.'), 'bad');
    }

    function tttFinish(reason) {
      const S = tttState;
      if (!S || S.done) return;
      S.done = true;
      if (timer) { clearInterval(timer); timer = null; }
      tttPick = null;
      const perfect = S.correct === 9;
      const pts = Math.max(0, S.score + (perfect ? 250 : 0) - S.mistakes * 10 + (S.mode === 'timed' ? Math.floor(Math.max(0, S.left) / 10) * 5 : 0));
      const bk = 'snaces_ttt_best_' + S.mode + '_' + lv;
      const best = Math.max(pts, ACC.get(bk, 0));
      ACC.set(bk, best);
      const c1 = S.owner.filter(x => x === 1).length, c2 = S.owner.filter(x => x === 2).length;
      const title = reason === 'time' ? 'خلص الوقت ⏱️' : perfect ? 'شبكة كاملة! 🏆' : reason === 'lives' ? 'المحاولات خلصت' : 'نهاية الجولة';
      const sub = S.mode === 'duo' ? `لاعب ١: ${c1} خانات • لاعب ٢: ${c2} خانات` : `${S.correct} من 9 خانات صحيحة`;
      game.innerHTML = `
        <div class="ngTop"><div><h3>${title}</h3><p>${sub}</p></div><span class="ngBadge ${perfect ? 'win' : ''}">${pts} نقطة</span></div>
        <div class="ngResult"><div class="ngResSide ${perfect ? 'winner' : ''}"><b>النتيجة</b><strong>${pts}</strong><small>أفضل ${best} • أخطاء ${S.mistakes}</small></div></div>
        <div class="tttRevealHead"><b>كل الإجابات الصحيحة الممكنة</b><span class="muted tiny">اضغط العب تاني للوحة جديدة</span></div>
        <div class="tttReveal">${S.board.rows.map((r, ri) => S.board.cols.map((c, ci) => {
          const i = ri * 3 + ci, rec = S.chosen[i];
          const names = S.board.cells[i].map(x => TTT_CAREERS[x][0]);
          return `<div class="tttRevRow ${rec ? 'ok' : ''}"><div class="tttRevHead" title="${esc(r)} × ${esc(c)}" aria-label="${esc(r)} × ${esc(c)}">${tttCrest(r, 'tttMini')}<span>×</span>${tttCrest(c, 'tttMini')}</div><div class="tttRevBody"><b>${rec ? esc(rec[0]) : '—'}</b><div class="tttRevChips">${names.map(n => `<span>${esc(n)}</span>`).join('')}</div></div></div>`;
        }).join('')).join('')}</div>
        <p class="muted tiny">المشاركة الرسمية مع الفريق الأول فقط. لو عندك لاعب صحيح مش ظاهر في القائمة، فهو مش موجود في قاعدة المسيرات الحالية.</p>
        <div class="tttActions"><button class="btn primary" type="button" id="tttAgain">العب تاني</button><button class="btn secondary" type="button" id="tttBack">الرئيسية</button></div>`;
      $('#tttAgain', game).onclick = () => tttStart(S.mode);
      $('#tttBack', game).onclick = tttG;
    }

    /* ---------- Memory Match: لاعب/اسم + شعار/نادي ---------- */
    function memoryG() {
      if (typeof TTT_CAREERS === 'undefined' || typeof TTT_CLUBS === 'undefined') {
        game.innerHTML = '<p class="muted">بيانات الذاكرة مش محمّلة.</p>';
        return;
      }
      if (timer) { clearInterval(timer); timer = null; }
      const pairCount = [4, 6, 8][lv - 1];
      const needPlayers = pairCount / 2;
      const knownPlayers = [];
      TTT_CAREERS.forEach((p, i) => { if (p[5] && knownPlayers.length < 40) knownPlayers.push(i); });
      const players = shuf(knownPlayers).slice(0, needPlayers);
      const clubPool = Object.keys(TTT_CLUBS).filter(c => tttCands(c, c).length || (typeof TTT_BY_CLUB !== 'undefined' && (TTT_BY_CLUB[c] || []).length));
      const clubs = shuf(clubPool).slice(0, pairCount - needPlayers);
      const cards = [];
      players.forEach(ix => {
        const p = TTT_CAREERS[ix];
        cards.push({ key: 'p' + ix, kind: 'photo', rec: p, ix });
        cards.push({ key: 'p' + ix, kind: 'pname', rec: p, ix });
      });
      clubs.forEach(c => {
        cards.push({ key: 'c' + c, kind: 'crest', club: c });
        cards.push({ key: 'c' + c, kind: 'cname', club: c });
      });
      const deck = shuf(cards);
      let flipped = [], matched = new Set(), moves = 0, lock = false, started = false, sec = 0, done = false;
      const bk = 'snaces_mem_best_' + lv;
      const best = ACC.get(bk, { moves: 0, sec: 0 });
      const startClock = () => {
        if (started) return;
        started = true;
        timer = setInterval(() => {
          if (done) return;
          if (!document.body.contains(game)) { clearInterval(timer); timer = null; return; }
          sec++;
          const t = $('#memTime', game); if (t) t.textContent = sec;
        }, 1000);
      };
      const faceOf = card => {
        if (card.kind === 'photo') return tttPhoto(card.rec, 'memPhoto') + `<small>${esc(card.rec[3] || 'لاعب')}</small>`;
        if (card.kind === 'pname') return `<b class="memName">${esc(card.rec[0])}</b><small>اسم اللاعب</small>`;
        if (card.kind === 'crest') return tttCrest(card.club, 'memCrest') + '<small>نادي</small>';
        return `<b class="memName">${esc(card.club)}</b><small>اسم النادي</small>`;
      };
      const draw = () => {
        game.innerHTML = `
          <div class="ngTop"><div><h3>Football Memory Match</h3><p>${matched.size / 2} من ${pairCount} أزواج</p></div><span class="ngBadge">حركات ${moves} • ⏱ <b id="memTime">${sec}</b></span></div>
          <div class="ngPills"><span class="ngPill">${lv === 1 ? '4 أزواج' : lv === 2 ? '6 أزواج' : '8 أزواج'}</span><span class="ngPill">لاعبون بصور + شعارات أندية</span></div>
          <div class="memGrid memLv${lv}">
            ${deck.map((c, i) => {
              const open = flipped.includes(i) || matched.has(c.key);
              const label = matched.has(c.key) ? 'تم التطابق' : !open ? 'كرت مقلوب' : c.kind === 'photo' ? 'صورة لاعب' : c.kind === 'pname' ? c.rec[0] : c.kind === 'crest' ? 'شعار نادي' : c.club;
              return `<button class="memCard ${open ? 'flip' : ''} ${matched.has(c.key) ? 'matched' : ''}" type="button" data-i="${i}" aria-label="${esc(label)}" ${matched.has(c.key) ? 'disabled' : ''}>
                <span class="memInner" aria-hidden="true"><span class="memBack">⚽<small>SNACES</small></span><span class="memFront">${faceOf(c)}</span></span>
              </button>`;
            }).join('')}
          </div>
          <div class="tttMsg">${matched.size ? '✅ كمّل باقي الأزواج' : 'اقلب كرتين — طابق صورة اللاعب باسمه، أو شعار النادي باسمه.'}</div>
          <div class="tttActions"><button class="btn secondary" type="button" id="memNew">لعبة جديدة</button></div>`;
        $$('.memCard[data-i]', game).forEach(b => b.onclick = () => flip(+b.dataset.i));
        $('#memNew', game).onclick = memoryG;
      };
      const flip = i => {
        if (lock || done || matched.has(deck[i].key) || flipped.includes(i)) return;
        startClock();
        flipped.push(i);
        if (flipped.length === 2) {
          moves++;
          const [a, b] = flipped;
          if (deck[a].key === deck[b].key) {
            matched.add(deck[a].key);
            flipped = [];
            draw();
            setTimeout(() => {
              if (matched.size / 2 === pairCount) finishMem();
            }, 260);
          } else {
            lock = true;
            draw();
            setTimeout(() => { flipped = []; lock = false; draw(); }, 720);
          }
        } else draw();
      };
      const finishMem = () => {
        done = true;
        if (timer) { clearInterval(timer); timer = null; }
        const better = !best.moves || moves < best.moves || (moves === best.moves && sec < best.sec);
        if (better) ACC.set(bk, { moves, sec });
        game.innerHTML = `
          <div class="ngTop"><div><h3>كل الأزواج اتطابقت! 🧠</h3><p>${pairCount} أزواج في ${moves} حركة و${sec} ثانية</p></div><span class="ngBadge win">أحسنت</span></div>
          <div class="ngResult"><div class="ngResSide winner"><b>النتيجة</b><strong>${moves}</strong><small>حركة • ${sec} ثانية • أفضل ${better ? 'نتيجة جديدة' : best.moves + ' حركة'}</small></div></div>
          <button class="btn primary ngWide" type="button" id="memAgain">العب تاني</button>`;
        $('#memAgain', game).onclick = memoryG;
      };
      draw();
    }

    /* ---------- Bingo: بطاقة أندية + لاعب مُستدعى ---------- */
    function bingoG() {
      if (typeof TTT_CAREERS === 'undefined' || typeof TTT_CLUBS === 'undefined') {
        game.innerHTML = '<p class="muted">بيانات البينغو مش محمّلة.</p>';
        return;
      }
      if (timer) { clearInterval(timer); timer = null; }
      const pool = TTT_POOLS[lv] || Object.keys(TTT_CLUBS);
      let board = null;
      for (let k = 0; k < 80 && !board; k++) {
        const b = shuf(pool).slice(0, 9);
        if (b.every(c => tttCands(c, c).length || (typeof TTT_BY_CLUB !== 'undefined' && (TTT_BY_CLUB[c] || []).length))) board = b;
      }
      if (!board) { game.innerHTML = '<p class="muted">تعذّر تجهيز بطاقة بينغو.</p>'; return; }
      let marked = Array(9).fill(null), mistakes = 0, score = 0, done = false, player = null, used = new Set();
      const bk = 'snaces_bingo_best_' + lv;
      const best = ACC.get(bk, 0);
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const line = () => lines.find(l => l.every(i => marked[i]));
      const nextPlayer = () => {
        const open = marked.map((m, i) => m ? -1 : i).filter(i => i >= 0);
        const cands = [];
        TTT_CAREERS.forEach((p, i) => {
          if (used.has(i)) return;
          if (p[2].some(c => open.some(ix => board[ix] === c))) cands.push(i);
        });
        if (!cands.length) { player = null; return; }
        const ix = cands[rnd(cands.length)];
        used.add(ix);
        player = { ix, rec: TTT_CAREERS[ix] };
      };
      const draw = (msg = '', tone = '') => {
        game.innerHTML = `
          <div class="ngTop"><div><h3>Football Bingo 🎟️</h3><p>${marked.filter(Boolean).length} خانات • ${mistakes} أخطاء</p></div><span class="ngBadge ${line() ? 'win' : ''}">${score} نقطة</span></div>
          <div class="bingoCall">
            ${player ? `${tttPhoto(player.rec, 'bingoFace')}<div><small>اللاعب المُستدعى</small><b>${esc(player.rec[0])}</b><span>${esc(player.rec[3] || '')} • ${esc(player.rec[4] || '')}</span></div>` : '<b>انتهت البطاقة</b>'}
            <span class="bingoLives">${'❤️'.repeat(Math.max(0, 3 - mistakes))}${'🖤'.repeat(Math.min(3, mistakes))}</span>
          </div>
          <p class="tttMsg ${tone}">${esc(msg || 'اضغط على نادي لعب له اللاعب. أكمل صف أو عمود أو قطر = BINGO!')}</p>
          <div class="bingoGrid">${board.map((c, i) => `<button class="bingoCell ${marked[i] ? 'on' : ''}" type="button" data-i="${i}" ${marked[i] || done ? 'disabled' : ''}>${tttCrest(c, 'bingoCrest')}<b>${esc(c)}</b>${marked[i] ? `<small>✓ ${esc(marked[i][0])}</small>` : ''}</button>`).join('')}</div>
          <div class="tttActions"><button class="btn secondary" type="button" id="bingoNew">بطاقة جديدة</button></div>
          <p class="muted tiny">اللاعبون من قاعدة المسيرات: 154 لاعبًا. البطاقة بتتغير كل جولة والمستوى بيغيّر صعوبة الأندية.</p>`;
        $$('.bingoCell[data-i]', game).forEach(b => b.onclick = () => pickClub(+b.dataset.i));
        $('#bingoNew', game).onclick = bingoG;
      };
      const pickClub = i => {
        if (done || marked[i] || !player) return;
        const club = board[i];
        if (player.rec[2].includes(club)) {
          marked[i] = player.rec;
          score += 100;
          const l = line();
          if (l) return finishBingo(true);
          if (marked.every(Boolean)) return finishBingo(true);
          nextPlayer();
          if (!player) return finishBingo(false);
          draw(`✅ ${marked[i][0]} لعب لـ ${club}. كمّل الخط!`);
        } else {
          mistakes++;
          if (mistakes >= 3) return finishBingo(false);
          draw(`❌ ${player.rec[0]} ما لعبش لـ ${club}. باقي ${3 - mistakes} محاولات.`, 'bad');
        }
      };
      const finishBingo = win => {
        done = true;
        const pts = Math.max(0, score + (win ? 300 : 0) - mistakes * 20);
        if (pts > best) ACC.set(bk, pts);
        game.innerHTML = `
          <div class="ngTop"><div><h3>${win ? 'BINGO! 🎟️' : 'خلصت المحاولات'}</h3><p>${win ? 'أكملت خطًا كاملًا' : `${marked.filter(Boolean).length} خانات مفتوحة`}</p></div><span class="ngBadge ${win ? 'win' : ''}">${pts} نقطة</span></div>
          <div class="ngResult"><div class="ngResSide ${win ? 'winner' : ''}"><b>النتيجة</b><strong>${pts}</strong><small>أفضل ${Math.max(pts, best)} • ${mistakes} أخطاء</small></div></div>
          <div class="bingoGrid end">${board.map((c, i) => `<div class="bingoCell ${marked[i] ? 'on' : ''}">${tttCrest(c, 'bingoCrest')}<b>${esc(c)}</b><small>${marked[i] ? esc(marked[i][0]) : '—'}</small></div>`).join('')}</div>
          <button class="btn primary ngWide" type="button" id="bingoAgain">بطاقة جديدة</button>`;
        $('#bingoAgain', game).onclick = bingoG;
      };
      nextPlayer();
      if (!player) { game.innerHTML = '<p class="muted">تعذّر استدعاء لاعب جديد — جرّب بطاقة جديدة.</p><button class="btn primary ngWide" type="button" id="bingoAgain">بطاقة جديدة</button>'; $('#bingoAgain', game).onclick = bingoG; return; }
      draw();
    }

    /* ---------- التابات والمستويات ---------- */
    function tabsUI() {
      const SEC = [['top', ''], ['games', '🕹️ ألعاب'], ['history', '📜 تاريخ الكورة']];
      gt.innerHTML = SEC.map(([k, label]) => {
        const list = G.filter(g => (g[3] || 'games') === k);
        if (!list.length) return '';
        return (label ? `<div class="muted" style="font-size:12px;font-weight:800;margin:10px 0 4px">${label}</div>` : '') +
          `<div class="chips" style="margin-bottom:4px">${list.map(([c, n]) =>
            `<button class="btn ${c === cur ? 'primary' : 'secondary'}" type="button" data-g="${c}">${n}</button>`).join('')}</div>`;
      }).join('');
              $$('[data-g]', gt).forEach(b => b.onclick = () => {
        cur = b.dataset.g;
        ACC.set('snaces_game', cur);
        tabsUI();
        levelsUI();
        start();
      });
      const qg2 = $('#quickGame', el);
      if (qg2) qg2.value = cur;
    }
    function levelsUI() {
      const needs = (G.find(g => g[0] === cur) || [])[2];
      lvb.style.display = needs ? '' : 'none';
      lvb.innerHTML = needs ? LV.map(([k, n]) => `<button class="btn ${k === lv ? 'primary' : 'secondary'}" type="button" data-l="${k}">${n}</button>`).join('') : '';
      $$('[data-l]', lvb).forEach(b => b.onclick = () => {
        lv = +b.dataset.l;
        store.set('snaces_lv', lv);
        levelsUI();
        start();
      });
    }
    function start() {
      if (timer) { clearInterval(timer); timer = null; }
      const map = {
        daily: dailyG, cat: catG, jersey: jerseyG, journey: journeyG, logo: logoG,
        more: moreG, who: whoG, pred: predG, tf: tfG, blitz: blitzG, match: matchG,
        res: resG, lineup: lineupG, scramble: scrambleG, fplwho: fplwhoG,
        auction: auctionG, top10: top10G, formation: formationG, odd: oddG, blur: blurG,
        act: () => partyG('act'), pass: () => partyG('pass'), bid: bidG, weekly: weeklyG,
        year: yearG, final: finalG, host: hostG, champ: champG,
        draft: draftG, penalty: penaltyG, tactics: tacticsG, roulette: rouletteG, connect: connectG,
        ttt: tttG, memory: memoryG, bingo: bingoG
      };
      (map[cur] || dailyG)();
      shownStreak();
    }

    /* التنقل السريع بين الألعاب */
    const qg = $('#quickGame', el), rg = $('#randGame', el);
    if (qg) {
      qg.innerHTML = G.map(([c, n]) => `<option value="${c}">${n}</option>`).join('');
      qg.value = cur;
      qg.onchange = () => { cur = qg.value; ACC.set('snaces_game', cur); tabsUI(); levelsUI(); start(); };
    }
    if (rg) rg.onclick = () => {
      const pick = G[Math.floor(Math.random() * G.length)][0];
      cur = pick;
      ACC.set('snaces_game', cur);
      if (qg) qg.value = cur;
      tabsUI(); levelsUI(); start();
    };
    /* keep select in sync */
    const origTabsUI = tabsUI;

    function chStatusUI() {
      const box = $('#chstatus', el);
      if (!box) return;
      const cs = qbChallengeState();
      const card = (href, ic, title, st, sub) => `<a class="challengeCard" href="${href}">
        <span class="ccIc">${ic}</span>
        <span class="ccBody"><b>${title}</b><small>${sub}</small></span>
        <span class="ccState ${st.label === 'مكتمل' ? 'done' : st.label === 'بدأ' ? 'started' : ''}">${st.label}</span>
      </a>`;
      box.innerHTML = card('#/challenges?game=daily', '📅', 'تحدي اليوم', cs.daily,
        `${cs.daily.state.score}/5 • باقي ${qbTimeLeft(cs.daily.left)}`) +
        card('#/challenges?game=weekly', '🏆', 'تحدي الأسبوع', cs.weekly,
          `${cs.weekly.state.score}/10 • باقي ${qbTimeLeft(cs.weekly.left)}`);
    }
    function achievementsUI() {
      const box = $('#achv', el);
      if (!box || typeof qbAchievements !== 'function') return;
      const list = qbAchievements();
      const got = list.filter(a => a.ok).length;
      box.innerHTML = `<div class="achHead"><b>🏅 الإنجازات</b><span class="muted tiny">${got} من ${list.length}</span></div>
        <div class="achGrid">${list.map(a => `<div class="ach ${a.ok ? 'ok' : ''}" title="${esc(a.desc)}">
          <span class="achIc">${a.ok ? a.icon : '🔒'}</span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small>
        </div>`).join('')}</div>`;
    }
    if (!focus) {
      chStatusUI();
      achievementsUI();
      tabsUI();
    } else {
      const gtEl = $('#gt', el); if (gtEl) gtEl.style.display = 'none';
    }
    levelsUI();
    start();
  }
});
