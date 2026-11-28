'use strict';
/* ============================================================
   SNACES FOOTBALL — نواة التطبيق
   أدوات عامة + تخزين محلي + راوتر + ثيم + حسابات كرة القدم
   ============================================================ */

/* ---------- أدوات ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => (Number.isFinite(+v) ? +v : 0);
const rnd = n => Math.floor(Math.random() * n);
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayKey = (d = Date.now()) => new Date(d).toLocaleDateString('en-CA');
const yest = k => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() - 1); return d.toLocaleDateString('en-CA'); };
const dt = d => (d ? new Date(d).toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'يحدد لاحقًا');
const ago = d => {
  if (!d) return '';
  const m = Math.max(1, Math.round((Date.now() - Date.parse(d)) / 60000));
  return m < 60 ? `منذ ${m} د` : m < 1440 ? `منذ ${Math.round(m / 60)} س` : `منذ ${Math.round(m / 1440)} يوم`;
};

/* ---------- تخزين ---------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};

/* ---------- بيانات ---------- */
const cache = new Map();
function getJSON(url, fresh) {
  if (fresh) cache.delete(url);
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      /* فشل الشبكة مايتخزنش — عشان المحاولة اللي بعدها ترجع تجرب */
      .catch(() => { cache.delete(url); return null; }));
  }
  return cache.get(url);
}

/* ---------- إشعارات ---------- */
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('on'), 2400);
}
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); toast('اتنسخ ✓'); }
  catch (e) { toast(txt); }
}

/* ---------- ثوابت الكورة ---------- */
const LN = {
  PL: 'الإنجليزي', PD: 'الإسباني', SA: 'الإيطالي', BL1: 'الألماني', FL1: 'الفرنسي', CL: 'الأبطال', ELC: 'التشامبيونشيب', DED: 'الهولندي', PPL: 'البرتغالي', BSA: 'البرازيلي', TSL: 'التركي',
  /* كؤوس محلية */
  FACUP: 'كأس إنجلترا', EFLCP: 'كأس كاراباو', CDR: 'كأس إسبانيا', COPPA: 'كأس إيطاليا', DFBP: 'كأس ألمانيا',
  CDFR: 'كأس فرنسا', TACAP: 'كأس البرتغال', CDB: 'كأس البرازيل', TKUP: 'كأس تركيا',
  EGYCUP: 'كأس مصر', EGYLC: 'كأس الرابطة المصرية', KINGCUP: 'كأس الملك', TRONE: 'كأس العرش',
  TUNCUP: 'كأس تونس', UAEPRES: 'كأس رئيس الإمارات', UAELC: 'كأس رابطة الإمارات',
  /* عربي */
  EGY: 'المصري', SAU: 'السعودي', MAR: 'المغربي', TUN: 'التونسي', ALG: 'الجزائري', UAE: 'الإماراتي',
  QAT: 'القطري', IRQ: 'العراقي', JOR: 'الأردني',   ARB: 'كأس العرب', ARBCL: 'أبطال العرب',
  GULF: 'كأس الخليج', AFCON: 'أمم أفريقيا', ASIAN: 'كأس آسيا',
  /* قارية */
  UEL: 'الدوري الأوروبي', UECL: 'دوري المؤتمر', LIB: 'ليبرتادوريس', SUDA: 'سودأمريكانا',
  CAFCL: 'أبطال أفريقيا', CAFCC: 'الكونفدرالية الأفريقية', CAFSC: 'سوبر أفريقيا',
  ACL: 'أبطال آسيا', ACL2: 'أبطال آسيا 2', CCC: 'أبطال الكونكاكاف', UESC: 'سوبر أوروبا',
  RECOPA: 'ريكوبي',
  /* سوبر محلي */
  CSHIELD: 'درع المجتمع', SESP: 'سوبر إسبانيا', SITA: 'سوبر إيطاليا', SGER: 'سوبر ألمانيا',
  SFRA: 'سوبر فرنسا', SPOR: 'سوبر البرتغال', STUR: 'سوبر تركيا',
  /* Americas */
  MLS: 'MLS', LMX: 'Liga MX', ARG: 'الأرجنتيني', COL: 'الكولومبي', USLC: 'USL Championship',
  COPAARG: 'كأس الأرجنتين', COPACOL: 'كأس كولومبيا',
  /* كؤوس محلية إضافية */
  QATEMIR: 'كأس الأمير', QATCUPS: 'كأس قطر', QSL: 'كأس نجوم قطر',
  /* سوبر محلي (كل البطولات) */
  EGYSC: 'السوبر المصري', SAUSC: 'السوبر السعودي', ALGSC: 'السوبر الجزائري', ARGSC: 'السوبر الأرجنتيني',
  COLSL: 'السوبرليجا الكولومبي', BRASC: 'سوبر البرازيل', MXSC: 'السوبر المكسيكي', JORSC: 'السوبر الأردني',
  JORSH: 'درع الأردن', IRQSC: 'السوبر العراقي', KUWSC: 'السوبر الكويتي', OMASC: 'السوبر العماني',
  BHRSC: 'السوبر البحريني', TUNSC: 'السوبر التونسي',
  /* سوبر قاري */
  CAMPEONES: 'كامبيونيس كونكاكاف', UCBCH: 'تحدي أوروبا-أمريكا الجنوبية',
  /* عالمي — أندية */
  FIC: 'إنتركونتيننتال الأندية', CWC: 'كأس العالم للأندية',
  /* عالمي — منتخبات */
  WC: 'كأس العالم', WWC: 'كأس العالم للسيدات', U17WC: 'كأس العالم U17', U20WC: 'كأس العالم للشباب U20',
  /* كرة القدم للسيدات — دوريات */
  WSL: 'الدوري الإنجليزي للسيدات', WFACUP: 'كأس إنجلترا للسيدات', WLCUP: 'كأس رابطة السيدات',
  LIGAF: 'الدوري الإسباني للسيدات', SERIEAW: 'الدوري الإيطالي للسيدات', COPPAW: 'كأس إيطاليا للسيدات',
  SUPCW: 'السوبر الإيطالي للسيدات', BLW: 'الدوري الألماني للسيدات', DFBPW: 'كأس ألمانيا للسيدات',
  FRAUW: 'الدوري الفرنسي للسيدات', NWSL: 'الدوري الأمريكي للسيدات', NWSLCC: 'كأس تحدي NWSL',
  LMXF: 'الدوري المكسيكي للسيدات', BRAZW: 'الدوري البرازيلي للسيدات', CDBW: 'كأس البرازيل للسيدات',
  ARGW: 'الدوري الأرجنتيني للسيدات', COLW: 'الدوري الكولومبي للسيدات',
  SAUWPL: 'الدوري السعودي للسيدات', SAUWSC: 'السوبر السعودي للسيدات', SAFFW: 'كأس الاتحاد السعودي للسيدات',
  PORWLC: 'كأس رابطة البرتغال للسيدات', PORWSC: 'السوبر البرتغالي للسيدات',
  /* كرة القدم للسيدات — قاري وعالمي */
  UWCL: 'أبطال أوروبا للسيدات', UWEC: 'يوروبا كاب للسيدات', LIBW: 'ليبرتادوريس للسيدات',
  CAFW: 'أمم أفريقيا للسيدات', AFCW: 'كأس آسيا للسيدات', GOLDW: 'الكأس الذهبية للسيدات',
  FWCC: 'كأس العالم للأندية للسيدات', OLYW: 'أولمبياد السيدات', ICCW: 'كأس الأبطال الدولي للسيدات',
  WU20: 'مونديال السيدات U20', WU17: 'مونديال السيدات U17', CONF: 'كأس القارات', FINALISSIMA: 'فيناليسيما',
  /* منتخبات قارية */
  EURO: 'يورو', CA: 'كوبا أمريكا', GOLD: 'الكأس الذهبية', UNL: 'دوري الأمم الأوروبية',
  CNL: 'دوري الأمم الكونكاكاف', CAW: 'كوبا أمريكا للسيدات', ARBW: 'كأس العرب للسيدات',
  /* شباب قاري */
  EU21: 'يورو U21', EU19: 'يورو U19', EU17: 'يورو U17', SA20: 'سودامريكانو U20',
  AFC20: 'آسيا U20', CAF20: 'أفريقيا U20', CONC20: 'كونكاكاف U20', CAFU17: 'أفريقيا U17',
  ARBU20: 'كأس العرب U20'
};
const LEAGUES = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'CL', 'ELC', 'DED', 'PPL', 'BSA', 'TSL'];
const CONTINENTAL = ['CL', 'UEL', 'UECL', 'LIB', 'SUDA', 'CAFCL', 'CAFCC', 'ACL', 'ACL2', 'CCC', 'ARBCL'];
const SUPERCUPS = ['EGYSC', 'SAUSC', 'TUNSC', 'ALGSC', 'IRQSC', 'JORSC', 'JORSH',
  'CSHIELD', 'SESP', 'SITA', 'SGER', 'SFRA', 'SPOR', 'BRASC', 'STUR', 'ARGSC', 'COLSL', 'MXSC',
  'KUWSC', 'OMASC', 'BHRSC'];
const ALL_DOMESTIC_SUPERS = SUPERCUPS;
const AMERICAS = ['MLS', 'LMX', 'ARG', 'COL', 'USLC'];
const AMERICA_CUPS = ['COPAARG', 'COPACOL'];
/* الكأس المحلي لكل دوري — عشان يبان مع بطولات بلده */
const DOMESTIC = {
  PL: ['FACUP', 'EFLCP'], ELC: ['FACUP', 'EFLCP'], PD: ['CDR'], SA: ['COPPA'], BL1: ['DFBP'], FL1: ['CDFR'],
  PPL: ['TACAP'], BSA: ['CDB'], TSL: ['TKUP'], EGY: ['EGYCUP', 'EGYLC'], SAU: ['KINGCUP'],
  MAR: ['TRONE'], TUN: ['TUNCUP'], UAE: ['UAEPRES', 'UAELC'],
  QAT: ['QATEMIR', 'QATCUPS', 'QSL'],
  ARG: ['COPAARG'], COL: ['COPACOL'], MLS: [], USLC: [], LMX: []
};
/* سوبر كل دولة — بيتجمع مع بطولاتها المحلية */
const DOMESTIC_SUPER = {
  EGY: ['EGYSC'], SAU: ['SAUSC'], MAR: [], TUN: ['TUNSC'], ALG: ['ALGSC'], UAE: [], QAT: [],
  IRQ: ['IRQSC'], JOR: ['JORSC', 'JORSH'],
  PL: ['CSHIELD'], ELC: ['CSHIELD'], PD: ['SESP'], SA: ['SITA'], BL1: ['SGER'], FL1: ['SFRA'],
  PPL: ['SPOR'], BSA: ['BRASC'], TSL: ['STUR'],
  ARG: ['ARGSC'], COL: ['COLSL'], LMX: ['MXSC'], MLS: [], USLC: []
};
/* سوبر قاري */
const CONTINENTAL_SUPERS = ['UESC', 'RECOPA', 'CAFSC', 'CAMPEONES', 'UCBCH'];
/* بطولات عالمية — أندية */
const WORLD_CLUB = ['FIC', 'CWC'];
/* بطولات عالمية — منتخبات */
const WORLD_NT = ['WC', 'U20WC', 'U17WC', 'CONF', 'ARB', 'FINALISSIMA'];
/* منتخبات قارية (كأس القارات/الأمم) */
const NT_CONTINENTAL = ['EURO', 'CA', 'AFCON', 'ASIAN', 'GOLD', 'UNL', 'CNL', 'GULF'];
/* ===== كرة القدم للسيدات ===== */
const WOMEN_DOMESTIC = {
  'إنجلترا': ['WSL', 'WFACUP', 'WLCUP'],
  'إسبانيا': ['LIGAF'],
  'إيطاليا': ['SERIEAW', 'COPPAW', 'SUPCW'],
  'ألمانيا': ['BLW', 'DFBPW'],
  'فرنسا': ['FRAUW'],
  'البرتغال': ['PORWLC', 'PORWSC'],
  'الولايات المتحدة': ['NWSL', 'NWSLCC'],
  'المكسيك': ['LMXF'],
  'البرازيل': ['BRAZW', 'CDBW'],
  'الأرجنتين': ['ARGW'],
  'كولومبيا': ['COLW'],
  'السعودية': ['SAUWPL', 'SAUWSC', 'SAFFW']
};
const WOMEN_CONTINENTAL = ['UWCL', 'UWEC', 'LIBW', 'CAFW', 'AFCW', 'GOLDW', 'CAW'];
const WOMEN_WORLD = ['WWC', 'WU20', 'WU17', 'FWCC', 'OLYW', 'ICCW'];
const WOMEN_CODES = [...Object.values(WOMEN_DOMESTIC).flat(), ...WOMEN_CONTINENTAL, ...WOMEN_WORLD];
const WOMEN_SET = new Set(WOMEN_CODES);
const WOMEN_COUNTRY = Object.entries(WOMEN_DOMESTIC).reduce((m, [c, list]) => {
  list.forEach(k => { m[k] = c; });
  return m;
}, {});
/* بطولات الشباب القارية */
const YOUTH = ['EU21', 'EU19', 'EU17', 'SA20', 'AFC20', 'CAF20', 'CONC20', 'CAFU17', 'ARBU20'];
/* بطولات مش ليها تغطية جدول مباشرة — بتعرض سجل البطولة */
const INFO_ONLY = ['CWC', 'U20WC'];
/* الكأس يرجع لأي دوري */
/* بلد كل دوري (لعرض «كؤوس بلده») */
const COUNTRY = {
  PL: 'إنجلترا', ELC: 'إنجلترا', PD: 'إسبانيا', SA: 'إيطاليا', BL1: 'ألمانيا', FL1: 'فرنسا',
  PPL: 'البرتغال', BSA: 'البرازيل', TSL: 'تركيا', EGY: 'مصر', SAU: 'السعودية', MAR: 'المغرب',
  TUN: 'تونس', UAE: 'الإمارات', QAT: 'قطر', IRQ: 'العراق', JOR: 'الأردن', ALG: 'الجزائر',
  MLS: 'الولايات المتحدة', LMX: 'المكسيك', ARG: 'الأرجنتين', COL: 'كولومبيا', USLC: 'الولايات المتحدة',
  COPAARG: 'الأرجنتين', COPACOL: 'كولومبيا',
  KUWSC: 'الكويت', OMASC: 'عمان', BHRSC: 'البحرين'
};
const CUP_LEAGUE = Object.entries(DOMESTIC).reduce((m, [lg, cups]) => { cups.forEach(c => { if (!m[c]) m[c] = lg; }); return m; }, {});
const SUPER_COUNTRY = {
  EGYSC: 'مصر', SAUSC: 'السعودية', TUNSC: 'تونس', ALGSC: 'الجزائر', IRQSC: 'العراق', JORSC: 'الأردن', JORSH: 'الأردن',
  CSHIELD: 'إنجلترا', SESP: 'إسبانيا', SITA: 'إيطاليا', SGER: 'ألمانيا', SFRA: 'فرنسا', SPOR: 'البرتغال',
  BRASC: 'البرازيل', STUR: 'تركيا', ARGSC: 'الأرجنتين', COLSL: 'كولومبيا', MXSC: 'المكسيك',
  KUWSC: 'الكويت', OMASC: 'عمان', BHRSC: 'البحرين'
};
const COUNTRY_FLAG = {
  'إنجلترا': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'إسبانيا': '🇪🇸', 'إيطاليا': '🇮🇹', 'ألمانيا': '🇩🇪', 'فرنسا': '🇫🇷',
  'البرتغال': '🇵🇹', 'البرازيل': '🇧🇷', 'تركيا': '🇹🇷', 'مصر': '🇪🇬', 'السعودية': '🇸🇦',
  'المغرب': '🇲🇦', 'تونس': '🇹🇳', 'الإمارات': '🇦🇪', 'قطر': '🇶🇦', 'العراق': '🇮🇶',
  'الأردن': '🇯🇴', 'الجزائر': '🇩🇿', 'الولايات المتحدة': '🇺🇸', 'المكسيك': '🇲🇽',
  'الأرجنتين': '🇦🇷', 'كولومبيا': '🇨🇴', 'الكويت': '🇰🇼', 'عمان': '🇴🇲', 'البحرين': '🇧🇭'
};
const ARAB_LEAGUES = ['EGY', 'SAU', 'MAR', 'TUN', 'ALG', 'UAE', 'QAT', 'IRQ', 'JOR', 'ARB', 'ARBCL', 'GULF', 'AFCON', 'ASIAN'];
const ARAB_COUNTRIES = ['مصر', 'السعودية', 'المغرب', 'تونس', 'الجزائر', 'الإمارات', 'قطر', 'العراق', 'الأردن', 'الكويت', 'عمان', 'البحرين'];
/* بطولات الدولة (دوري + كؤوس + سوبر) — للرجال */
function compsOfCountry(ctry) {
  const leagues = Object.keys(COUNTRY).filter(c => COUNTRY[c] === ctry && !CUP_LEAGUE[c] && !SUPERCUPS.includes(c));
  const cups = leagues.flatMap(l => [...(DOMESTIC[l] || []), ...(DOMESTIC_SUPER[l] || [])]);
  const extra = Object.keys(COUNTRY).filter(c => COUNTRY[c] === ctry && CUP_LEAGUE[c] && !SUPERCUPS.includes(c));
  const supers = [...Object.keys(SUPER_COUNTRY), ...Object.keys(COUNTRY)].filter(c => countryOf(c) === ctry && SUPERCUPS.includes(c));
  return [...new Set([...leagues, ...cups, ...extra, ...supers])];
}
/* بطولات الدولة للسيدات */
function womenCompsOfCountry(ctry) { return WOMEN_DOMESTIC[ctry] || []; }
/* بلد أي بطولة (رجال أو سيدات) */
function countryOf(code) {
  return COUNTRY[code] || WOMEN_COUNTRY[code] || SUPER_COUNTRY[code] ||
    (CUP_LEAGUE[code] ? COUNTRY[CUP_LEAGUE[code]] : '') || '';
}
/* نطاق البطولة */
function scopeOf(code) {
  if (WOMEN_SET.has(code)) return 'women';
  if (WORLD_CLUB.includes(code) || WORLD_NT.includes(code) || YOUTH.includes(code)) return 'world';
  if (CONTINENTAL.includes(code) || CONTINENTAL_SUPERS.includes(code) || NT_CONTINENTAL.includes(code)) return 'continental';
  return 'domestic';
}
const arabIndex = () => getJSON('data/arab.json');
/* شارة بديلة محلية — تظهر لو فشل تحميل شعار النادي */
const CREST_FB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#1d2b22"/><path d="M20 7l10 4.4v8.2c0 6.6-4.2 10.7-10 13.4-5.8-2.7-10-6.8-10-13.4V11.4z" fill="#3c5a48"/><path d="M20 15l4 1.8v3.4c0 2.8-1.7 4.6-4 5.8-2.3-1.2-4-3-4-5.8v-3.4z" fill="#7fd8a5"/></svg>');
const crest = u => (u ? `<img class="crest" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="${CREST_FB}" onerror="this.onerror=null;this.src=this.dataset.fb">` : '');
const crestBig = u => (u ? `<img class="crestBig" src="${esc(u)}" alt="" referrerpolicy="no-referrer" data-fb="${CREST_FB}" onerror="this.onerror=null;this.src=this.dataset.fb">` : '');
/* صور حقيقية من Premier League (شارات الأندية + صور اللاعبين) */
const plBadge = c => (c ? `https://resources.premierleague.com/premierleague/badges/70/t${c}.png` : '');
const plPhoto = (f, big) => {
  const m = String(f || '').match(/(\d+)/);
  if (!m) return '';
  const size = big ? '250x250' : '110x140';
  return `https://resources.premierleague.com/premierleague/photos/players/${size}/p${m[1]}.png`;
};
/* أسهم لليسار/يمين لأي شريط بيتحرك أفقيًا */
function hArrows(box) {
  if (!box || box.dataset.arr || box.scrollWidth <= box.clientWidth + 12) return;
  box.dataset.arr = '1';
  box.classList.add('hscroll');
  const wrap = document.createElement('div');
  wrap.className = 'hwrap';
  box.parentNode.insertBefore(wrap, box);
  wrap.appendChild(box);
  const mk = cls => { const b = document.createElement('button'); b.type = 'button'; b.className = 'harr ' + cls; return b; };
  const prev = mk('prev'), next = mk('next');
  prev.innerHTML = '\u2039'; next.innerHTML = '\u203a';
  prev.setAttribute('aria-label', 'السابق'); next.setAttribute('aria-label', 'التالي');
  wrap.append(prev, next);
  const step = () => Math.max(140, Math.round(box.clientWidth * 0.8));
  const upd = () => {
    const max = box.scrollWidth - box.clientWidth;
    const x = Math.abs(box.scrollLeft);
    prev.classList.toggle('off', x < 8);
    next.classList.toggle('off', x > max - 8);
    wrap.classList.toggle('single', max <= 8);
  };
  const go = d => box.scrollBy({ left: d * step(), behavior: 'smooth' });
  prev.onclick = () => go(1);
  next.onclick = () => go(-1);
  box.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  setTimeout(upd, 60);
}
function hArrowsAll(scope) {
  (scope || document).querySelectorAll('.bracket, .chips, .sl, [data-arrows]').forEach(hArrows);
}

const isFin = m => m.status === 'FINISHED' && m.hg != null && m.ag != null;
const finOf = D => ((D && D.matches) || []).filter(isFin);
function formOf(D, id) {
  return finOf(D)
    .filter(m => m.home.id === id || m.away.id === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map(m => {
      const home = m.home.id === id, f = home ? m.hg : m.ag, a = home ? m.ag : m.hg;
      return f > a ? 'W' : f < a ? 'L' : 'D';
    });
}
const formChips = a => a.map(c =>
  `<span class="fdr fdr${c === 'W' ? 1 : c === 'L' ? 5 : 3}" style="min-width:22px">${c === 'W' ? 'ف' : c === 'L' ? 'خ' : 'ت'}</span>`
).join('') || '—';

const pois = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
/* نموذج بواسون بسيط — نفس منطق الموقع */
function predictMatch(D, homeId, awayId) {
  const f = finOf(D);
  if (f.length < 10) return null;
  const gH = f.reduce((s, m) => s + m.hg, 0) / f.length;
  const gA = f.reduce((s, m) => s + m.ag, 0) / f.length;
  const lg = (gH + gA) / 2, K = 3;
  const st = id => {
    const g = f.filter(m => m.home.id === id || m.away.id === id);
    let gf = 0, ga = 0;
    g.forEach(m => { const o = m.home.id === id; gf += o ? m.hg : m.ag; ga += o ? m.ag : m.hg; });
    return { att: ((gf + K * lg) / (g.length + K)) / lg, def: ((ga + K * lg) / (g.length + K)) / lg };
  };
  const x = st(homeId), y = st(awayId);
  const xh = Math.max(.15, gH * x.att * y.def), xa = Math.max(.15, gA * y.att * x.def);
  let w = 0, d = 0, l = 0, best = [0, 0, 0];
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const p = pois(xh, i) * pois(xa, j);
    if (i > j) w += p; else if (i === j) d += p; else l += p;
    if (p > best[2]) best = [i, j, p];
  }
  const t = w + d + l, W = Math.round(w / t * 100), Dr = Math.round(d / t * 100);
  return { w: W, d: Dr, l: 100 - W - Dr, score: [best[0], best[1]], xh, xa };
}

/* ---------- الراوتر ---------- */
const SCREENS = {};
/* أيقونات SVG موحّدة (مش إيموجي) عشان تظهر بنفس الشكل على كل الأجهزة */
const IC = 'viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
const TABS = [
  { id: 'matches', label: 'المباريات', icon: `<svg ${IC}><circle cx="12" cy="12" r="8.6"/><path d="M12 7.4l4.1 3-1.6 4.8H9.5L7.9 10.4z"/><path d="M12 3.6v3.8M4.1 10.1l3.8 2.4M19.9 10.1l-3.8 2.4M7.6 20l1.8-3.8M16.4 20l-1.8-3.8"/></svg>` },
  { id: 'leagues', label: 'البطولات', icon: `<svg ${IC}><path d="M8 4h8v3.2a4 4 0 0 1-8 0z"/><path d="M8 5H5.6a2.4 2.4 0 0 0 2.4 4"/><path d="M16 5h2.4a2.4 2.4 0 0 1-2.4 4"/><path d="M12 11.2V15M9.2 20h5.6M10.2 20l.5-3h2.6l.5 3"/></svg>` },
  { id: 'games', label: 'الألعاب', icon: `<svg ${IC}><path d="M7.4 8h9.2a4.4 4.4 0 0 1 4.3 3.5l.6 4a2.9 2.9 0 0 1-5 2.5l-1.2-1H8.7l-1.2 1a2.9 2.9 0 0 1-5-2.5l.6-4A4.4 4.4 0 0 1 7.4 8z"/><path d="M7.4 11.6v3M5.9 13.1h3M15.8 12.3h.1M18.2 14.1h.1"/></svg>` },
  { id: 'fantasy', label: 'الفانتازي', icon: `<svg ${IC}><path d="M9 4l3 1.4L15 4l4 1.9-1.4 3.5L15 8.2V15l-3 5-3-5V8.2l-2.6 1.2L5 5.9z"/></svg>` },
  { id: 'news', label: 'الأخبار', icon: `<svg ${IC}><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M7.8 9h4.2M7.8 12.4h8.4M7.8 15.6h6.2"/></svg>` },
  { id: 'more', label: 'المزيد', icon: `<svg ${IC}><circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>` }
];
function screen(id, def) { SCREENS[id] = def; }

/* مشاركة لينك: Web Share API، ولو مش مدعوم بننسخ */
async function shareLink(title, text, url) {
  const u = url || location.origin + '/' + (location.hash || '');
  try {
    if (navigator.share) {
      await navigator.share({ title: title || document.title, text: text || '', url: u });
      return true;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return false;
  }
  try {
    await copyText((text ? text + '\n' : '') + u);
    toast('اتنسخ اللينك — الصقه في أي مكان ✓');
  } catch (e) { }
  return true;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const i = raw.indexOf('?');
  const path = (i < 0 ? raw : raw.slice(0, i)) || 'home';
  const qs = i < 0 ? '' : raw.slice(i + 1);
  return { path, q: Object.fromEntries(new URLSearchParams(qs)) };
}
function go(route, q) {
  const p = new URLSearchParams();
  if (q) for (const k in q) if (q[k] != null && q[k] !== '') p.set(k, q[k]);
  const s = p.toString();
  const h = '#/' + route + (s ? '?' + s : '');
  if (location.hash === h) render(); else location.hash = h;
}

/* ---------- SEO ومشاركة الصفحات ---------- */
/* النطاق الرسمي بييجي من index.html (meta snaces-origin) — بيتبدّل وقت البناء بـSITE_ORIGIN */
const SITE_URL = (document.querySelector('meta[name="snaces-origin"]')?.content || location.origin).replace(/\/+$/, '');
const SITE_NAME = 'SNACES FOOTBALL';
const SITE_DESC = 'SNACES FOOTBALL: مباريات مباشرة ونتائج وترتيب البطولات العربية والأوروبية، أخبار وانتقالات، فانتازي بأسعار اللاعبين، تحديات يومية وغرف لعب مع الصحاب.';
const SEO = {
  home: { t: 'مباريات اليوم ونتائج مباشرة وترتيب البطولات', d: 'تابع مباريات اليوم لحظة بلحظة، النتائج، ترتيب البطولات العربية والأوروبية، والأخبار والانتقالات في مكان واحد.' },
  matches: { t: 'مباريات اليوم ومواعيد المباريات', d: 'جدول مباريات اليوم ومواعيد كل البطولات المحلية والعربية والأوروبية، مع النتائج والتحديث المباشر.' },
  leagues: { t: 'الدوريات والبطولات', d: 'كل الدوريات والبطولات العربية والأوروبية والعالمية في مكان واحد: الترتيب، المباريات، والهدافون.' },
  league: { t: 'تفاصيل البطولة والترتيب', d: 'ترتيب جدول البطولة، مباريات الجولة، الهدافون، وإحصائيات الفرق والأندية.' },
  continental: { t: 'البطولات القارية', d: 'دوري أبطال أوروبا، الدوري الأوروبي، دوري المؤتمر، أبطال أفريقيا، أبطال آسيا وغيرها.' },
  world: { t: 'البطولات العالمية', d: 'كأس العالم للأندية، الإنتركونتيننتال، وبطولات المنتخبات العالمية.' },
  women: { t: 'بطولات الكرة النسائية', d: 'بطولات وترتيب ومباريات الكرة النسائية في أوروبا والعالم.' },
  arab: { t: 'البطولات العربية', d: 'الدوري المصري والسعودي والمغربي والتونسي والجزائري والإماراتي، كأس العرب، وأمم أفريقيا.' },
  country: { t: 'بطولات الدولة وفرقها', d: 'كل بطولات الدولة، ترتيب الدوريات، والمباريات القادمة لفرقها.' },
  team: { t: 'صفحة الفريق', d: 'مباريات الفريق القادمة، آخر النتائج، الترتيب، وألقاب النادي.' },
  player: { t: 'صفحة اللاعب', d: 'بيانات اللاعب، فريقه، ومركزه داخل الملعب.' },
  match: { t: 'تفاصيل المباراة', d: 'تشكيلة الفريقين، إحصائيات المباراة، التوقع التحليلي، والأحداث لحظة بلحظة.' },
  news: { t: 'أخبار كرة القدم', d: 'آخر أخبار كرة القدم العربية والعالمية من مصادر رياضية حقيقية.' },
  transfers: { t: 'الانتقالات', d: 'آخر انتقالات اللاعبين والأندية في الدوريات العربية والأوروبية.' },
  videos: { t: 'أهداف وملخصات', d: 'أهداف ومهارات وملخصات كرة القدم.' },
  sports: { t: 'الرياضات الأخرى', d: 'أخبار النتائج والترتيب لرياضات أخرى غير كرة القدم.' },
  search: { t: 'البحث', d: 'ابحث في البطولات، الفرق، اللاعبين، والأخبار داخل التطبيق.' },
  fantasy: { t: 'الفانتازي — اختَر تشكيلتك', d: 'ابنِ تشكيلة الفانتازي بميزانية حقيقية، اختار اللاعبين والأسعار، وتابع نقاطك حسب قواعد اللعبة.' },
  games: { t: 'الألعاب والتحديات', d: 'ألعاب كرة قدم، أسئلة في التاريخ والبطولات واللاعبين، تحديات يومية وأسبوعية ومستويات صعبة.' },
  game: { t: 'لعبة كرة قدم', d: 'العب لعبة كرة قدم من SNACES FOOTBALL: أسئلة، نتايج، تحديات ومستويات صعوبة.' },
  challenges: { t: 'التحديات والأسئلة', d: 'أسئلة كرة قدم يومية، «من هو اللاعب»، توقع النتائج، وغرف لعب مع الصحاب.' },
  rooms: { t: 'العب مع صحابك', d: 'اعمل غرفة لعب مع صاحبك على الكونكت فور والتمثيل، كل واحد من جهازه.' },
  rules: { t: 'قواعد اللعبة', d: 'شرح قواعد الفانتازي والتحديات والسكور خطوة بخطوة.' },
  more: { t: 'المزيد', d: 'المفضلة، الإشعارات، الإعدادات، وصفحات المعلومات.' },
  account: { t: 'حسابي', d: 'بياناتك، مفضلتك، تشكيلتك، والمزامنة السحابية.' },
  favorites: { t: 'المفضلة', d: 'البطولات والأندية والمنتخبات اللي بتتابعها.' },
  notifications: { t: 'الإشعارات', d: 'إشعارات المباريات والفرق المتابعة.' },
  about: { t: 'عن التطبيق', d: 'SNACES FOOTBALL تطبيق كرة قدم عربي مستقل: مباريات ونتائج وترتيب وفانتازي وتحديات.' },
  privacy: { t: 'سياسة الخصوصية', d: 'إزاي بنجمع بياناتك ونحفظها، وإيه اللي بيتخزن على جهازك أو على السحابة.' },
  terms: { t: 'شروط الاستخدام', d: 'شروط استخدام SNACES FOOTBALL.' },
  pick: { t: 'اختيار المتابعات', d: 'اختار البطولات والأندية اللي تحب تتابعها.' }
};
const SEO_PRIVATE = new Set(['account', 'favorites', 'notifications', 'room', 'rooms', 'pick']);

function metaTag(attr, name) {
  let m = document.head.querySelector('meta[' + attr + '="' + name + '"]');
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute(attr, name);
    document.head.appendChild(m);
  }
  return m;
}
function linkTag(rel) {
  let l = document.head.querySelector('link[rel="' + rel + '"]');
  if (!l) {
    l = document.createElement('link');
    l.rel = rel;
    document.head.appendChild(l);
  }
  return l;
}
function applySeo(path, def, q) {
  const base = SEO[path] || { t: def.title || 'كرة القدم', d: SITE_DESC };
  let title = String(base.t || '').trim();
  if (!title.includes(SITE_NAME)) title += ' — ' + SITE_NAME;
  const desc = String(base.d || SITE_DESC).slice(0, 300);
  const isPrivate = SEO_PRIVATE.has(path);
  document.title = title;
  metaTag('name', 'description').content = desc;
  metaTag('name', 'robots').content = isPrivate ? 'noindex,follow' : 'index,follow,max-image-preview:large';
  linkTag('canonical').href = SITE_URL + '/';
  metaTag('property', 'og:title').content = title;
  metaTag('property', 'og:description').content = desc;
  metaTag('property', 'og:url').content = SITE_URL + '/';
  metaTag('property', 'og:image').content = SITE_URL + '/assets/share.jpg';
  metaTag('property', 'og:type').content = path === 'match' ? 'article' : 'website';
  metaTag('name', 'twitter:title').content = title;
  metaTag('name', 'twitter:description').content = desc;
  metaTag('name', 'twitter:image').content = SITE_URL + '/assets/share.jpg';
  metaTag('name', 'twitter:card').content = 'summary_large_image';
  /* JSON-LD للصفحة الحالية — من غير أي بيانات مخترعة */
  try {
    let s = document.getElementById('seo-jsonld');
    if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'seo-jsonld'; document.head.appendChild(s); }
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: desc,
      url: SITE_URL + '/',
      inLanguage: 'ar',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL + '/' },
      ...(isPrivate ? { isAccessibleForFree: true } : {})
    });
  } catch (e) { }
}

let renderSeq = 0;
async function render() {
  const { path, q } = parseHash();
  const def = SCREENS[path] || SCREENS.home;
  const view = $('#view');
  const seq = ++renderSeq;

  $('#screenTitle').textContent = def.title || '';
  $('#backBtn').hidden = !def.back;
  paintTabs(def.tab || null);
  try { applySeo(path in SCREENS ? path : 'home', def, q); } catch (e) { }
  window.scrollTo(0, 0);

  view.innerHTML = '<div class="skel" style="height:96px"></div><div class="skel" style="height:220px"></div>';
  try {
    await def.render(q, view);
  } catch (err) {
    console.error(err);
    if (seq === renderSeq) {
      view.innerHTML = '<div class="dataPanel"><div class="empty">حصل خطأ في تحميل الشاشة.<br><br>' +
        '<button class="btn secondary" type="button" onclick="location.reload()">تحديث</button></div></div>';
    }
    return;
  }
  if (seq !== renderSeq) return;
  view.classList.remove('fade');
  void view.offsetWidth;
  view.classList.add('fade');
  hArrowsAll(view);
  setTimeout(() => hArrowsAll(view), 400);
}

function paintTabs(active) {
  $('#tabbar').innerHTML = TABS.map(t =>
    `<button class="tab${t.id === active ? ' active' : ''}" type="button" data-go="${t.id}" aria-current="${t.id === active ? 'page' : 'false'}"><i>${t.icon}</i><span>${t.label}</span></button>`
  ).join('');
}

/* ---------- الثيم ---------- */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  store.set('snaces_theme', t);
  const b = $('#themeBtn');
  if (b) b.innerHTML = t === 'light'
    ? `<svg ${IC}><path d="M20 14.4A8.4 8.4 0 1 1 9.6 4a6.9 6.9 0 0 0 10.4 10.4z"/></svg>`
    : `<svg ${IC}><circle cx="12" cy="12" r="4.1"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>`;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = t === 'light' ? '#f3f8f5' : '#07130f';
}
function initTheme() { setTheme(store.get('snaces_theme', 'dark')); }

/* ---------- قطع واجهة مشتركة ---------- */
const emptyBox = (msg, extra = '') => `<div class="dataPanel"><div class="empty">${msg}${extra}</div></div>`;
const kpi = (label, value, cls = '') => `<div class="kpi"><small>${label}</small><strong class="${cls}">${value}</strong></div>`;
