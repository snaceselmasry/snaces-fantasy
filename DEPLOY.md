# خطوات النشر — SNACES FOOTBALL

الموقع واجهة ثابتة (HTML/CSS/JS بدون build) + Worker بيقدّم الملفات ويشغّل
المزامنة السحابية. الدخول بـ **Sign in with Freebuff** (بدون أسرار).

## الملفات المهمة
| الملف | وظيفته |
|---|---|
| `worker.js` | المصدر: يغلّف الـassets بـ`createFreebuffAuth` + `/api/me` و`/api/sync` |
| `worker.bundle.js` | ناتج `bun build` — **هو اللي بيتنشر** (لازم يتولد بعد أي تعديل في `worker.js`) |
| `tools/build-dist.mjs` | بيبني `dist/` بالملفات الثابتة |
| `deploy.json` | Manifest النشر (entrypoint + modules → `worker.bundle.js` + assets) |

## قبل النشر
```bash
"$FREEBUFF_BUN" build worker.js --target browser --format esm --outfile worker.bundle.js
"$FREEBUFF_BUN" tools/build-dist.mjs
```
- أي تعديل في `js/` أو `css/` أو `sw.js` → أعد بناء `dist` وارفع رقم الكاش في `sw.js` (الحالي **snaces-v58**).
- **تحديث البيانات تلقائيًا**: `.github/workflows/update-data.yml` بيشغّل `tools/update-*.mjs` كل 3 ساعات ويحفظ في `data/` (محتاج سيكرت `FOOTBALL_DATA_KEY`).
- **النشر على Google Play**: الخطوات المبسّطة في `PLAY.md`.
- صفحات داخل التطبيق: `#/privacy`، `#/terms`، `#/about`، وحذف البيانات السحابية من `#/account` عبر `POST /api/account/delete`.
- مسارات `/api/*` و`/auth/*` مستثناة من كاش الـService Worker.

## البنية السحابية (Sites)
- **D1** باسم `DB` في بيئتي preview و production، جدول `profiles(sub, data, updated_at)` بيتعمل تلقائيًا أول مزامنة.
- **Auth**: `sites_enable_auth` مسجّل callbacks:
  - production: `https://snaces-football-uiulk2.freebuff.site/auth/freebuff/callback`
  - development: `http://127.0.0.1:59659/auth/freebuff/callback`
- المتغيرات العامة بتتحقن عند النشر: `FREEBUFF_CLIENT_ID`, `FREEBUFF_ISSUER`, `APP_ORIGIN`.

## التحقق بعد النشر
```bash
curl -s -o /dev/null -w '%{http_code}'  https://<origin>/api/sync          # 401
curl -s https://<origin>/auth/freebuff/session                             # {"user":null}
curl -s -o /dev/null -w '%{http_code}' 'https://<origin>/auth/freebuff/signin?returnTo=/'  # 303
```
- دخول فعلي بحساب Freebuff → الرجوع للموقع → ظهور الاسم في «حسابي».
- حسابين مختلفين لازم يشوفوا بيانات مختلفة.
- POST لـ`/api/sync` بـ`Origin` غريب → 403.

## إشعارات المباريات

### المرحلة 1 — جوّه التطبيق (منفّذة)
- الملف `js/notify.js` + شاشة `#/notifications` + رابط في «المزيد» بشارة عدد الجديد.
- بتفحص مباريات الأندية/المنتخبات اللي في المفضلة كل **5 دقايق** طول ما التطبيق مفتوح، وعند الرجوع له أو رجوع النت.
- مصدر البيانات: 365Scores (`games/current` + `games/results`) لنفس بطولات فرقك، مع مقارنة بـ`id` الفريق (365Scores) والاسم كخطة بديلة.
- تنبيه «بدأت» لأي مباراة `IN_PLAY` بدأت خلال 3 ساعات، وتنبيه «انتهت» لأي مباراة `FINISHED` بدأت خلال 12 ساعة.
- منع التكرار: `snaces_notify_seen` (صلاحية 3 أيام)، وأول تشغيل بيسجّل الموجود بدون ما يزعج المستخدم.
- إعدادات: مفتاح رئيسي + بداية/نتيجة، محفوظة لكل مستخدم (`snaces_notify`) وبتتزامن مع المزامنة السحابية.

### المرحلة 2 — Web Push على السيرفر (منفّذة)
- **المفاتيح**: VAPID (P-256) متولدة بـ`tools/gen-vapid.mjs`، ومخزّنة كأسرار على Sites في البيئتين: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, و`PUSH_TRIGGER_KEY` للـcron. تغيير المفاتيح بيلغي كل الاشتراكات القديمة.
- **D1**: `push_subs(sub PRIMARY KEY, endpoint, p256dh, auth, teams, names, comps, created_at, updated_at)` + `push_sent(sub, k, sent_at)` + `kv_meta(k, v)` — بتتعمل تلقائيًا.
- **الـWorker**:
  - `GET /api/push/key` → المفتاح العام (503 لو الأسرار مش متظبطة).
  - `POST /api/push/subscribe` و`/unsubscribe` → same-origin، وبتشتغل للضيف (مفتاح الجهاز `d:<uuid>`) وللمسجّل (`user.sub`).
  - `POST /api/push/check` → إما بـ`x-push-key: <PUSH_TRIGGER_KEY>` (cron)، أو من التطبيق نفسه same-origin بحد أقصى مرة كل 4 دقايق (`kv_meta.push_run`).
- **الإرسال**: `@block65/webcrypto-web-push` (VAPID + aes128gcm) جوّه الـbundle. تنبيه «بدأت» لمباريات `IN_PLAY` خلال 3 ساعات، و«انتهت» بالنتيجة خلال 12 ساعة، منع تكرار في `push_sent`، وحذف الاشتراكات الميتة (404/410).
- **الـSW**: `push` → `showNotification` عربية و`data.url=/#/matches`، و`notificationclick` بيركّز التطبيق أو يفتحه.
- **الجدولة الحالية**: أي فتح للتطبيق بينادي `/api/push/check` (مرة كل 4 دقايق للموقع كله) — يعني الإشعارات بتتبعت طول ما فيه حد بيفتح التطبيق. لجدولة 24/7: cron خارجي كل 5 دقايق على `POST /api/push/check` بهيدر `x-push-key`.
- **iOS**: لازم التطبيق مثبّت على الشاشة الرئيسية (iOS 16.4+) — الرسالة ظاهرة في شاشة الإشعارات.
- **أمان**: ممنوع طبع أو كتابة `PUSH_TRIGGER_KEY` أو مفاتيح VAPID في الشات/الكود/الـassets.

## ملاحظات
- صور اللاعبين والشارات من موارد خارجية (Premier League / 365Scores) — محتاجة إنترنت.
- الحساب المحلي (اسم + رقم سري) لسه شغال على الجهاز؛ المزامنة السحابية اختيارية وبتشتغل مع حساب Freebuff.
- نسخة احتياطية مشفّرة متاحة من صفحة الحساب (تصدير/استيراد).
