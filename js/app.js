'use strict';
/* ============ تشغيل التطبيق ============ */
(function () {
  initTheme();

  /* تثبيت التطبيق على الموبايل (PWA) */
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window.__snacesInstall = e;
  });

  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur === 'light' ? 'dark' : 'light');
  });

  $('#backBtn').addEventListener('click', () => {
    const { path } = parseHash();
    const def = SCREENS[path];
    go(def && def.tab ? def.tab : 'home');
  });

  $('#tabbar').addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
  });

  window.addEventListener('hashchange', () => {
    render();
    /* ننقل التركيز للمحتوى عشان قارئ الشاشة يعلن الشاشة الجديدة */
    const v = $('#view');
    if (v) { try { v.focus({ preventScroll: true }); } catch (e) { } }
  });
  render();

  /* رابط «تخطّى إلى المحتوى» — من غير ما يغيّر الـhash */
  const skip = document.querySelector('.skip');
  if (skip) skip.addEventListener('click', ev => {
    ev.preventDefault();
    const v = $('#view');
    if (v) v.focus();
  });

  /* مشاركة أي عنصر عليه data-share (مباراة/لاعب/فريق/التطبيق) */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-share]');
    if (!b) return;
    e.preventDefault();
    const title = b.dataset.shareTitle || document.title;
    const text = b.dataset.shareText || '';
    shareLink(title, text, b.dataset.shareUrl || '');
  });

  /* تنبيه إن فيه نسخة جديدة بعد ما الـSW ياخد السيطرة */
  const hadSw = !!navigator.serviceWorker.controller;
  let updateShown = false;
  const showUpdate = () => {
    if (updateShown) return;
    updateShown = true;
    if ($('#updateBar')) return;
    const bar = document.createElement('div');
    bar.id = 'updateBar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>✨ فيه نسخة جديدة من التطبيق</span><button class="btn primary" type="button" id="updateNow">تحديث</button>';
    document.body.appendChild(bar);
    const go = bar.querySelector('#updateNow');
    if (go) go.onclick = () => location.reload();
  };
  if ('serviceWorker' in navigator && hadSw) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      /* لو الصفحة دي أول مرة تتثبت مفيش تنبيه؛ التنبيه للتحديثات بس */
      showUpdate();
    });
  }

  /* صور فشلت في التحميل (شعارات/صور لاعبين من مصادر خارجية): نخفيها
     بدل أيقونة الصورة المكسورة — من غير ما نغيّر باقي التصميم */
  document.addEventListener('error', ev => {
    const t = ev.target;
    if (t && t.tagName === 'IMG' && !t.dataset.imgFail) {
      t.dataset.imgFail = '1';
      t.style.visibility = 'hidden';
      t.setAttribute('aria-hidden', 'true');
    }
  }, true);

  /* شريط الأوفلاين (العنصر موجود في index.html) */
  const offBar = $('#offlineBar');
  const syncOnline = () => { if (offBar) offBar.classList.toggle('on', navigator.onLine === false); };
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
  syncOnline();

  /* المزامنة السحابية: لو المستخدم داخل بحساب Freebuff بنجيب بياناته ونعيد الرسم */
  if (typeof ACC !== 'undefined' && ACC.cloud) {
    ACC.cloud.init().then(changed => { if (changed || ACC.cloud.user) render(); }).catch(() => { });
  }

  /* إشعارات مباريات الفرق المتابَعة (جوّه التطبيق + Web Push) */
  if (typeof NOTIFY !== 'undefined') {
    NOTIFY.start();
    if (NOTIFY.push) NOTIFY.push.init();
  }

  /* تحديث متصدري البطولات في الخلفية (مرة كل 12 ساعة) */
  setTimeout(() => { if (navigator.onLine !== false) refreshLeaders().catch(() => { }); }, 5000);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    /* وضع التطبيق المثبّت (standalone): بنحط شريط غامق ورا شريط حالة الآيفون
       عشان أيقوناته تفضل مقروءة حتى مع الثيم الفاتح (iOS بيثبّت لون الأيقونات أبيض) */
    try {
      if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
        document.documentElement.classList.add('standalone');
      }
    } catch (e) { }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { });
    });
  }
})();
