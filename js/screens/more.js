'use strict';
/* ============ المزيد — مرتب بالأقسام ============ */
screen('more', {
  title: 'المزيد', tab: 'more',
  async render(q, el) {
    const u = typeof ACC !== 'undefined' ? ACC.me() : null;
    const sk = (typeof ACC !== 'undefined' ? ACC.get('snaces_streak', { count: 0, best: 0 }) : store.get('snaces_streak', { count: 0, best: 0 }));
    const theme = document.documentElement.getAttribute('data-theme');

    const group = (title, rows) => `
      <div class="section">
        <div class="head"><h2>${title}</h2></div>
        <div class="dataPanel">${rows.map(([href, label, sub]) => `<a class="row" href="${href}"><span>${label}</span><span class="side">${sub} ‹</span></a>`).join('')}</div>
      </div>`;

    el.innerHTML = `
      <div class="dataPanel" style="padding:14px;margin-bottom:12px">
        <div class="lgTitle"><b>${u ? '👤 ' + esc(u.name) : '👤 حسابك'}</b><span class="pill">${u ? 'مسجّل' : 'ضيف'}</span></div>
        <p class="muted small" style="margin:8px 0">${u
          ? 'تشكيلتك ومتابعاتك وستريكك محفوظين باسمك.'
          : 'سجّل حسابك عشان الفانتازي والبطولات المتابَعة والستريك يتحفظوا باسمك.'}</p>
        <a class="btn ${u ? 'secondary' : 'primary'}" href="#/account">${u ? 'افتح حسابي' : 'إنشاء حساب'}</a>
      </div>

      ${group('⭐ متابعاتك', [
        ['#/favorites', '⭐ المفضلة', 'بطولات وأندية ومنتخبات اخترتها'],
        ['#/notifications', '🔔 إشعارات المباريات', (typeof NOTIFY !== 'undefined' && NOTIFY.unread()) ? NOTIFY.unread() + ' جديد' : 'بداية ونتيجة فرقك'],
        ['#/pick', '➕ اختيار المتابعات', 'أضف أو شيل أي بطولة/نادي/منتخب']
      ])}

      ${group('🏆 البطولات', [
        ['#/leagues', '🏆 البطولات المحلية', 'دوريات وكؤوس وسوبر كل دولة'],
        ['#/continental', '🌍 البطولات القارية للأندية', 'أبطال أوروبا وأفريقيا وآسيا والكونكاكاف'],
        ['#/world', '🌐 البطولات العالمية', 'كأس العالم والأندية والمنتخبات والشباب'],
        ['#/women', '👩 كرة القدم للسيدات', 'دوريات وقارية وعالمية للسيدات'],
        ['#/arab', '🌍 العالم العربي', 'كروت الدول ببطولاتها وأخبارها']
      ])}

      ${group('📰 المحتوى', [
        ['#/home', '🏠 الرئيسية', 'ملخص التطبيق والستريك'],
        ['#/matches', '⚽ المباريات', 'كل مباريات اليوم في مكان واحد'],
        ['#/news', '📰 آخر الأخبار', 'انتقالات وأخبار الكورة'],
        ['#/sports', '🏀 رياضات أخرى', 'سلة ويد وطائرة وبطولات عالمية'],
        ['#/videos', '🎬 وثائقيات', 'تاريخ الكورة وثائقي'],
        ['#/search', '🔍 بحث', 'فرق ولاعبين وبطولات']
      ])}

      ${group('🎮 العب واتعلم', [
        ['#/fantasy', '🎮 الفانتازي', 'ابنِ تشكيلتك'],
        ['#/challenges', '🎯 التحديات', '20+ لعبة ومستويات'],
        ['#/rules', '⚖️ قوانين اللعبة واللوائح', 'IFAB + VAR + FIFA/UEFA']
      ])}

      <div class="section">
        <div class="head"><h2>📊 سجلك</h2><a class="btn secondary" href="#/account">التفاصيل</a></div>
        <div class="kpis">
          <div class="kpi"><small>سلسلة الأيام</small><strong class="green">${sk.count || 0}</strong></div>
          <div class="kpi"><small>أفضل سلسلة</small><strong>${sk.best || 0}</strong></div>
          <div class="kpi"><small>«من هو اللاعب»</small><strong>${ACC.get('snaces_who', 0)}</strong></div>
          <div class="kpi"><small>التوقعات</small><strong>${Object.values(ACC.get('snaces_pred', {})).reduce((s, p) => s + (p.pts || 0), 0)}</strong></div>
        </div>
      </div>

      <div class="section" id="installSec">
        <div class="head"><h2>📱 نصّبه على الموبايل</h2></div>
        <div class="dataPanel" style="padding:14px">
          <p class="muted small" style="margin:0 0 10px" id="installHint">ثبّت التطبيق على شاشتك الرئيسية وافتحه بمجرد لمسة — من غير متصفح ومن غير نت أحيانًا.</p>
          <button class="btn primary" id="installBtn" type="button" style="width:100%" hidden>📥 تثبيت التطبيق</button>
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>⚙️ الإعدادات</h2></div>
        <div class="dataPanel">
          <div class="row">
            <span>الوضع الليلي</span>
            <span class="side"><button class="btn secondary" id="themeRow" type="button">${theme === 'light' ? 'مطفي 🌙' : 'شغال ☀️'}</button></span>
          </div>
          <div class="row">
            <span>تصفير تقدمي<br><small class="muted tiny">السلسلة والتحديات والتشكيلة${u ? ' الخاصة بحسابك' : ''}</small></span>
            <span class="side"><button class="btn secondary" id="reset" type="button">تصفير</button></span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="head"><h2>عن التطبيق</h2></div>
        <div class="dataPanel">
          <a class="row" href="#/about"><span>ℹ️ عن SNACES</span><span class="side">الإصدار 1.0.0 ‹</span></a>
          <a class="row" href="#/privacy"><span>🔒 سياسة الخصوصية</span><span class="side">‹</span></a>
          <a class="row" href="#/terms"><span>📜 شروط الاستخدام</span><span class="side">‹</span></a>
          <button class="row" type="button" data-share data-share-title="SNACES FOOTBALL" data-share-text="جرّب SNACES FOOTBALL — مباريات ونتائج وترتيب البطولات، أخبار وانتقالات، فانتازي بأسعار اللاعبين، وتحديات يومية." style="width:100%;background:none;border:0;color:inherit;text-align:right;font:inherit;padding:10px 12px;display:flex;justify-content:space-between;gap:10px;cursor:pointer"><span>🔗 شارك التطبيق</span><span class="side">‹</span></button>
        </div>
        <div class="disclaimer" style="margin-top:10px">
          SNACES FOOTBALL — تطبيق مستقل وغير تابع لأي دوري أو نادٍ.
          التوقعات تقديرية وليست ضمانًا لأي نتيجة.
        </div>
      </div>`;

    /* تثبيت PWA */
    const ib = $('#installBtn', el), ih = $('#installHint', el);
    const ua = navigator.userAgent;
    const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    /* الآيفون والآيباد — الآيباد الجديد بيعرّف نفسه MacIntel */
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    /* متصفحات جوّا تطبيقات (فيسبوك/انستجرام/واتساب) مش بتسمح بالتثبيت */
    const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Twitter/i.test(ua);
    const stepsHTML = () => (isIOS
      ? '📱 على الآيفون/الآيباد: افتح التطبيق في <b>Safari</b>، اضغط زر المشاركة ⬆️ ثم <b>«إضافة إلى الشاشة الرئيسية»</b>، وبعدها <b>«إضافة»</b>.'
      : '📱 من قائمة المتصفح ⋮ اختار <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>، وبعدها <b>«تثبيت»</b>.');

    if (isStandalone) {
      if (ih) ih.innerHTML = '✅ التطبيق مثبّت وشغال كتطبيق مستقل.';
      if (ib) ib.hidden = true;
    } else if (ib && ih) {
      ib.hidden = false;
      ih.innerHTML = stepsHTML();
      if (inApp) {
        ih.innerHTML = '⚠️ أنت جوه متصفح تطبيق تاني (فيسبوك/انستجرام/واتساب). افتح الرابط في <b>Safari</b> أو <b>Chrome</b> عشان تقدر تثبّت التطبيق.';
      }
      ib.onclick = async () => {
        const p = window.__snacesInstall;
        if (!p) {
          ih.innerHTML = stepsHTML();
          toast(isIOS ? 'اتبع خطوات Safari اللي فوق' : 'دوّر على «تثبيت التطبيق» في قائمة المتصفح');
          return;
        }
        window.__snacesInstall = null;
        ib.disabled = true;
        try {
          p.prompt();
          const r = await p.userChoice;
          if (r && r.outcome === 'accepted') { toast('اتثبّت ✅'); ib.hidden = true; ih.innerHTML = '✅ التطبيق مثبّت — افتحه من شاشة الهاتف.'; }
          else ib.disabled = false;
        } catch (e) { ib.disabled = false; ih.innerHTML = stepsHTML(); }
      };
      window.addEventListener('appinstalled', () => {
        toast('تم تثبيت SNACES ✅');
        ib.hidden = true;
        ih.innerHTML = '✅ التطبيق مثبّت — افتحه من شاشة الهاتف.';
      }, { once: true });
    }

    $('#themeRow', el).onclick = () => setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');

    $('#reset', el).onclick = () => {
      if (!confirm('هتمسح سلسلتك وتقدمك وتشكيلتك. متأكد؟')) return;
      ['snaces_day', 'snaces_streak', 'snaces_who', 'snaces_pred', 'snaces_squad', 'snaces_lv',
        'snaces_best_cat_all_1', 'snaces_best_cat_all_2', 'snaces_best_cat_all_3',
        'snaces_best_jersey_1', 'snaces_best_jersey_2', 'snaces_best_jersey_3',
        'snaces_best_journey_1', 'snaces_best_journey_2', 'snaces_best_journey_3',
        'snaces_best_logo_1', 'snaces_best_logo_2', 'snaces_best_logo_3',
        'snaces_best_more_1', 'snaces_best_more_2', 'snaces_best_more_3',
        'snaces_best_tf_1', 'snaces_best_tf_2', 'snaces_best_tf_3',
        'snaces_best_blitz_1', 'snaces_best_blitz_2', 'snaces_best_blitz_3'
      ].forEach(k => ACC.del(k));
      /* كاش البيانات الحيّة والأخبار */
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('snaces_live') || k === 'snaces_news' || k === 'snaces_leaders')
          .forEach(k => store.del(k));
      } catch (e) { }
      toast('اتصفّر ✓');
      render();
    };
  }
});

/* ============ عن التطبيق — الخصوصية والشروط ============ */
screen('about', {
  title: 'عن التطبيق', tab: 'more', back: true,
  async render(q, el) {
    el.innerHTML = `
      <div class="heroCard" style="margin-bottom:14px">
        <div class="eyebrow">SNACES FOOTBALL</div>
        <h2>كل الكورة <span>في تطبيق واحد</span></h2>
        <p>مباريات ونتائج وترتيب البطولات العربية والأوروبية، أخبار وانتقالات، فانتازي بأسعار اللاعبين، وتحديات يومية.</p>
        <span class="ball" aria-hidden="true">⚽</span>
      </div>
      <div class="dataPanel" style="padding:14px;margin-bottom:10px">
        <div class="row"><span>الإصدار</span><span class="side"><b>1.0.0</b></span></div>
        <div class="row"><span>النوع</span><span class="side"><b>تطبيق ويب (PWA)</b></span></div>
        <div class="row"><span>اللغة</span><span class="side"><b>العربية (RTL)</b></span></div>
        <div class="row"><span>الحساب</span><span class="side"><b>اختياري</b></span></div>
      </div>
      <div class="dataPanel" style="padding:14px;margin-bottom:10px">
        <b style="font-size:15px">📊 عن البيانات</b>
        <p class="small" style="margin:8px 0 0">الجداول والمباريات واللاعبون وأسعار الفانتازي وألقاب الأندية بتتجمّع من قواعد بيانات رياضية وموسوعات عامة. التطبيق مستقل وغير تابع لأي جهة.</p>
      </div>
      <div class="dataPanel" style="padding:14px;margin-bottom:10px">
        <b style="font-size:15px">✅ وعدنا</b>
        <p class="small" style="margin:8px 0 0">بدون إعلانات، بدون بيع بيانات، وبدون تتبّع. حسابك اختياري، وبياناتك على جهازك إلا لو فعّلت المزامنة السحابية.</p>
      </div>
      <div class="dataPanel">
        <a class="row" href="#/privacy"><span>🔒 سياسة الخصوصية</span><span class="side">‹</span></a>
        <a class="row" href="#/terms"><span>📜 شروط الاستخدام</span><span class="side">‹</span></a>
      </div>`;
  }
});

screen('privacy', {
  title: 'سياسة الخصوصية', tab: 'more', back: true,
  async render(q, el) {
    const h = (t, b) => `<div class="dataPanel" style="padding:14px;margin-bottom:10px"><b style="font-size:15px">${t}</b><p class="small" style="margin:8px 0 0;line-height:1.9">${b}</p></div>`;
    el.innerHTML = `
      ${h('🔒 الخلاصة', 'إحنا مش بنبيع بياناتك ومش بنعمل تتبّع ولا إعلانات. كل حاجة بتفضل على جهازك، إلا لو فعّلت المزامنة السحابية أو الإشعارات بنفسك.')}
      ${h('📱 بيانات على جهازك', 'المفضلة، إعدادات الإشعارات، تشكيلة الفانتازي، الستريك والتحديات بتتخزن في التخزين المحلي للمتصفح على جهازك. مسح بيانات المتصفح أو «تصفير التقدم» بيمسحها. ولو عملت حساب محلي على الجهاز، كلمة السر بتتخزن مُجزّأة بـPBKDF2 ومش بتتبعت للسيرفر.')}
      ${h('☁️ المزامنة السحابية (اختيارية)', 'لو سجّلت الدخول بحساب Freebuff/Google، بنخزّن نسخة من نفس البيانات (المفضلة، الستريك، التشكيلة) على سيرفرات Cloudflare D1 عشان تتزامن بين أجهزتك. البيانات دي مربوطة بمعرّف حسابك فقط، وتقدر تحذفها في أي وقت من «حسابي → حذف بياناتي السحابية».')}
      ${h('🔔 إشعارات المباريات', 'لو فعّلت إشعارات المتصفح، بنخزّن اشتراك الجهاز (رابط الإشعارات ومفاتيح التشفير العامة) والفرق/البطولات اللي تهمك، لغرض إرسال تنبيهات البداية والنتيجة فقط. إيقاف الإشعارات من داخل التطبيق بيمسح الاشتراك.')}
      ${h('🌐 خدمات خارجية', 'عشان نعرض المباريات والأسعار والألقاب، المتصفح بيتصل بمزوّدي بيانات رياضية وموسوعات عامة. دي خدمات مستقلة وليها سياسات خصوصية خاصة بيها. صور اللاعبين والشارات بتتحمّل من سيرفراتهم.')}
      ${h('🍪 كوكيز وتتبّع', 'مفيش كوكيز إعلانية ولا أدوات تحليل خارجية. بنستخدم التخزين المحلي لتشغيل التطبيق وحفظ إعداداتك فقط.')}
      ${h('👶 الأطفال', 'التطبيق مناسب لعمر 13 سنة أو أكبر، ومش بيجمع بيانات شخصية عن قصد من الأطفال.')}
      ${h('🗑️ حذف بياناتك', 'من «حسابي» تقدر تحذف بياناتك السحابية نهائيًا. ولحذف كل حاجة على الجهاز: «المزيد → تصفير التقدم» أو امسح بيانات الموقع من إعدادات المتصفح.')}
      ${h('📅 التحديثات', 'آخر تحديث للسياسة: نوفمبر 2026. أي تغيير مهم هيظهر في التطبيق قبل تطبيقه.')}
      <div class="disclaimer">لو عندك سؤال عن الخصوصية، استخدم «شارك التطبيق» أو تواصل معنا من صفحة التطبيق.</div>`;
  }
});

screen('terms', {
  title: 'شروط الاستخدام', tab: 'more', back: true,
  async render(q, el) {
    const h = (t, b) => `<div class="dataPanel" style="padding:14px;margin-bottom:10px"><b style="font-size:15px">${t}</b><p class="small" style="margin:8px 0 0;line-height:1.9">${b}</p></div>`;
    el.innerHTML = `
      ${h('✅ قبول الشروط', 'باستخدامك SNACES FOOTBALL، أنت موافق على الشروط دي. لو مش موافق، من فضلك متستخدمش التطبيق.')}
      ${h('⚽ طبيعة الخدمة', 'التطبيق بيعرض بيانات كرة قدم عامة بغرض المعرفة والترفيه. إحنا مش جهة رسمية ومش تابعين لأي دوري أو نادي أو اتحاد.')}
      ${h('📉 التوقعات والفانتازي', 'التوقعات الإحصائية، «متوقع النقاط»، واقتراحات التشكيلة تقديرات بتُحسب من بيانات متاحة — مش ضمان لأي نتيجة ومش نصيحة مالية. الفانتازي هنا أداة تخطيط مستقلة وغير مرتبطة رسميًا بلعبة Fantasy Premier League.')}
      ${h('⚠️ دقة البيانات', 'بنحاول نعرض بيانات محدّثة، لكن ممكن يحصل تأخير أو خطأ من المصادر أو انقطاع في الخدمة. اعتمد على المصادر الرسمية في القرارات المهمة.')}
      ${h('👤 حسابك', 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك. ممنوع استخدام التطبيق لإزعاج الآخرين أو محاولة اختراقه أو إساءة استخدام واجهاته.')}
      ${h('🔗 روابط خارجية', 'بعض اللينكات بتفتح مواقع أو تطبيقات تانية (مثل YouTube). إحنا مش مسؤولين عن محتواها أو سياساتها.')}
      ${h('🛑 إنهاء الاستخدام', 'ممكن نوقف أو نعدّل الخدمة في أي وقت. تقدر توقف استخدامك في أي لحظة وتحذف بياناتك السحابية من «حسابي».')}
      ${h('📅 التحديثات', 'آخر تحديث للشروط: نوفمبر 2026. استمرارك في استخدام التطبيق بعد التعديلات معناه موافقتك عليها.')}`;
  }
});

/* ============ وثائقيات كروية ============ */
const VIDEOS = [
  { t: 'تاريخ كأس العالم — FIFA', q: 'history of FIFA World Cup documentary' },
  { t: 'مارادونا — حكاية الأسطورة', q: 'Maradona documentary football' },
  { t: 'رونالدو — R9', q: 'Ronaldo Nazario documentary' },
  { t: 'زيدان — صورة القرن 21', q: 'Zidane a 21st century portrait' },
  { t: 'ميسي — The Greatest', q: 'Lionel Messi documentary career' },
  { t: 'كرويف — total football', q: 'Johan Cruyff total football documentary' },
  { t: 'ببليه — The King', q: 'Pele documentary football' },
  { t: 'ليفربول — Istanbul 2005', q: 'Liverpool Istanbul 2005 documentary' },
  { t: 'مانشستر يونايتد — 1999', q: 'Manchester United treble 1999 documentary' },
  { t: 'ريال مدريد — La Decima', q: 'Real Madrid La Decima documentary' },
  { t: 'برشلونة — Tiki Taka', q: 'Barcelona tiki taka documentary' },
  { t: 'الأهلي — تاريخ النادي', q: 'Al Ahly club history documentary' }
];

screen('videos', {
  title: 'وثائقيات', tab: 'more', back: true,
  async render(q, el) {
    el.innerHTML = `
      <div class="section">
        <div class="head"><h2>🎬 وثائقيات كروية</h2></div>
        <div class="disclaimer" style="margin-bottom:10px">روابط للبحث في YouTube. افتحها في تطبيق/متصفح YouTube.</div>
        <div class="dataPanel">
          ${VIDEOS.map(v => `<a class="row" href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}" target="_blank" rel="noopener noreferrer"><span>🎬 ${esc(v.t)}</span><span class="side">YouTube ‹</span></a>`).join('')}
        </div>
      </div>`;
  }
});
