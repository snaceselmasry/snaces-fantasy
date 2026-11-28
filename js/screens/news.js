'use strict';
/* ============ آخر الأخبار: انتقالات + كل أخبار الكورة العالمية والعربية ============ */

/* فيدات الأخبار — عربية بس (آخر 7 أيام) */
const BING_AR = q => `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=RSS&setlang=ar&cc=EG&qft=interval%3d%227%22`;
const NEWS_FEEDS = [
  { name: 'أخبار الكورة', ar: true, url: BING_AR('كرة القدم') },
  { name: 'الدوري المصري', ar: true, url: BING_AR('الدوري المصري') },
  { name: 'انتقالات', ar: true, url: BING_AR('انتقالات كرة القدم') }
];
const NEWS_TTL = 20 * 60e3;
const NEWS_TRANSFER = /transfer|sign|signs|signing|deal|move|loan|fee|bid|contract|انتقال|ينتقل|يرحل|تعاقد|صفقة|ضم|إعارة|اعارة|تجديد|بيع|ميركاتو/i;

async function newsFeed(f) {
  const u = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(f.url) + '&count=25';
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(u, { cache: 'no-store', signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (j.status !== 'ok') throw new Error('feed');
    return (j.items || []).map(it => ({
      t: String(it.title || '').trim(),
      u: it.link || '',
      d: it.pubDate || '',
      s: f.name,
      ar: !!f.ar
    })).filter(x => x.t);
  } finally { clearTimeout(to); }
}

function newsMerge(lists) {
  const seen = new Set();
  return lists.flat().filter(x => {
    if (!x || !x.t) return false;
    const k = x.t.toLowerCase().replace(/\s+/g, ' ').slice(0, 70);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => Date.parse(b.d || 0) - Date.parse(a.d || 0));
}

/* الأخبار المحفوظة (سريعة وموجودة دايمًا، بتتحدث مع كل build) */
async function newsItems(force) {
  const c = store.get('snaces_news', null);
  if (!force && c && Date.now() - c.t < NEWS_TTL) return c.items.filter(x => x.ar !== false);
  const f = await getJSON('data/news.json');
  const items = ((f && f.items) || (c && c.items) || []);
  return items.filter(x => x.ar !== false);
}

/* محاولة تحديث حي — لو الشبكة أو الوسيط رفض، بنرجع null ونكمل بالمحفوظ */
async function refreshNews() {
  /* لو آخر محاولة فشلت (حد الاستخدام مثلا) بنستنى نص ساعة قبل ما نحاول تاني */
  const failAt = store.get('snaces_news_fail', 0);
  if (Date.now() - failAt < 30 * 60e3) return null;

  const lists = await Promise.all(NEWS_FEEDS.map(f => newsFeed(f).catch(() => [])));
  const live = newsMerge(lists);
  if (!live.length) { store.set('snaces_news_fail', Date.now()); return null; }
  store.set('snaces_news_fail', 0);
  /* بنحتفظ بالأخبار العربية المحفوظة لو الفيد العربي رفض */
  const file = await getJSON('data/news.json');
  const cached = store.get('snaces_news', null);
  /* عربي بس — بنستبعد أي أخبار إنجليزية قديمة من الكاش */
  const base = [...((file && file.items) || []), ...((cached && cached.items) || [])].filter(x => x.ar !== false);
  const items = newsMerge([live, base]).slice(0, 50);
  store.set('snaces_news', { t: Date.now(), items });
  return items;
}

const NEWS_SCREEN = {
  title: 'آخر الأخبار', tab: 'news', back: false,
  async render(q, el) {
    let f = 'all';
    let all = [];

    el.innerHTML = `
      <div class="between" style="margin-bottom:8px">
        <div class="cmpBar" id="nf"></div>
        <button class="btn secondary" id="nrefresh" type="button">تحديث</button>
      </div>
      <p class="muted tiny" id="nmeta" style="margin:0 0 8px"></p>
      <div id="nlist"></div>
      <div class="disclaimer" style="margin-top:12px">
        الأخبار عربية وبتتجمع تلقائيًا من مصادر صحفية، وبنعرض العنوان والرابط بس.
        تصنيف «انتقال» آلي حسب كلمات العنوان وممكن يغلط.
      </div>`;

    const bar = $('#nf', el), list = $('#nlist', el), btn = $('#nrefresh', el), meta = $('#nmeta', el);
    const FILTERS = [['all', 'الكل'], ['transfer', 'انتقالات']];

    const tag = x => NEWS_TRANSFER.test(x.t) ? 'transfer' : 'news';

    function draw() {
      const l = all.filter(x => f === 'all' || (f === 'transfer' && tag(x) === 'transfer') || (f === 'ar' && x.ar));
      list.innerHTML = `<div class="dataPanel">${l.length ? l.map(x => `
        <a class="row" href="${esc(x.u || '#/news')}" ${x.u ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          <span>${esc(x.t)}</span>
          <span class="side">
            ${tag(x) === 'transfer' ? '<span class="fdr fdr1" style="color:#062015">انتقال</span>' : ''}
            ${esc(x.s || '')}<span class="tiny">${ago(x.d)}</span>
          </span>
        </a>`).join('') : '<div class="empty">مفيش أخبار في القسم ده دلوقتي.</div>'}</div>`;
    }

    function paintBar() {
      bar.innerHTML = FILTERS.map(([k, label]) =>
        `<button class="btn ${k === f ? 'primary' : 'secondary'}" type="button" data-f="${k}">${label}</button>`).join('');
    }

    bar.onclick = e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      f = b.dataset.f;
      paintBar();
      draw();
    };

    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = 'بيحمّل…';
      const live = await refreshNews();
      btn.disabled = false;
      btn.textContent = 'تحديث';
      if (live) { all = live; meta.textContent = 'محدّث الآن من المصادر'; draw(); toast('اتحدثت ✓'); }
      else toast('مش قادر يجيب جديد دلوقتي');
    };

    paintBar();
    list.innerHTML = '<div class="skel" style="height:70px"></div><div class="skel" style="height:200px"></div>';
    all = await newsItems();
    draw();

    /* محاولة تحديث في الخلفية بعد ما الصفحة تظهر */
    refreshNews().then(live => {
      if (!live) return;
      all = live;
      meta.textContent = 'محدّث الآن من المصادر';
      draw();
    }).catch(() => { });
  }
};

screen('news', NEWS_SCREEN);
/* اللينك القديم #/transfers يفضل شغال */
screen('transfers', NEWS_SCREEN);
