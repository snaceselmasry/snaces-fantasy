/* SNACES FOOTBALL — service worker */
const CACHE = 'snaces-v102';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './css/app.css',
  './css/rooms.css',
  './css/premium.css',
  './js/core.js',
  './js/live.js',
  './js/auth-config.js',
  './js/account.js',
  './js/notify.js',
  './js/banks.js',
  './js/banks-more.js',
  './js/history.js',
  './js/extra-questions.js',
  './js/banks-big.js',
  './js/arab-content.js',
  './js/daily-questions.js',
  './js/qbank.js',
  './js/teams.js',
  './js/app.js',
  './js/screens/matches.js',
  './js/screens/home.js',
  './js/screens/favorites.js',
  './js/screens/leagues.js',
  './js/screens/league.js',
  './js/screens/country.js',
  './js/screens/rules.js',
  './js/screens/arab.js',
  './js/screens/match.js',
  './js/screens/fantasy.js',
  './js/screens/challenges.js',
  './js/screens/games.js',
  './js/rooms.js',
  './js/screens/news.js',
  './js/screens/sports.js',
  './js/screens/search.js',
  './js/screens/more.js',
  './assets/icon-192.png',
  './assets/hero.jpg',
  './assets/share.jpg'
];

/* بيانات أساسية عشان التطبيق يفتح أوفلاين من أول مرة */
const DATA = [
  './data/follow.json',
  './data/home.json',
  './data/home-arab.json',
  './data/arab.json',
  './data/meta.json',
  './data/news.json',
  './data/search.json',
  './data/info.json',
  './data/matches.json'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* كل ملف لوحده: لو واحد ناقص التثبيت مايفشلش.
       بنستخدم fetch+put بدل add عشان الروابط اللي بتتحوّل (index.html → /) تتخزن برضه. */
    const save = u => (async () => {
      const r = await fetch(u, { cache: 'reload' });
      if (r && r.ok) await c.put(u, r);
    })().catch(() => { });
    await Promise.allSettled([...CORE, ...DATA].map(save));
    /* نسخة إضافية للصفحة الرئيسية بمساريها — عشان الفتح أوفلاين */
    await Promise.allSettled(['./', './index.html'].map(save));
    await self.skipWaiting();
  })());
});

/* ===== Web Push: تنبيهات وانت برّه التطبيق ===== */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'SNACES FOOTBALL';
  const url = d.url || '/#/matches';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    tag: d.tag || undefined,
    data: { url }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/#/matches';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        try { await c.focus(); if ('navigate' in c) await c.navigate(url); return; } catch (err) { }
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  /* مسارات الحساب والمزامنة لازم تروح للشبكة دايمًا — ممنوع تتخزن في الكاش */
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  /* بيانات المباريات: الأحدث أولًا، والكاش كخطة بديلة */
    if (url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => { });
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  /* الشبكة أولًا (عشان التحديثات تبان فورًا)، والكاش لما تكون أوفلاين.
     بنخزّن الردود الناجحة بس — عشان خطأ 404 مايثبتش في الكاش. */
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => { });
      }
      return res;
    }).catch(() => caches.match(req)
        .then(hit => hit || caches.match('./') || caches.match('./index.html')))
  );
});
