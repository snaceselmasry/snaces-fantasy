'use strict';
/* ============================================================
   صفحة الفريق: الملعب + المدينة + التأسيس + المدرب
   المصدر الأساسي Wikidata (الاسم بالعربي + تحقق من البلد)،
   وTheSportsDB احتياطي للملعب لو Wikidata ناقص.
   البيانات بتتكاش أسبوع، ولو مصدر وقع بنعرض اللي عندنا بس.
   ============================================================ */

const TSDB = 'https://www.thesportsdb.com/api/v1/json/123';
const WD = 'https://www.wikidata.org';
const TEAM_TTL = 7 * 864e5;

const normName = s => String(s || '').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
const teamKey = (code, name) => 'snaces_team4_' + code + '_' + normName(name).slice(0, 40);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function jget(url, tries = 2) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 10000);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: ctl.signal, headers: { Accept: 'application/json' } });
      if (r.status === 429 || r.status >= 500) { lastErr = new Error('HTTP ' + r.status); await sleep(700); continue; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return JSON.parse(await r.text());
    } catch (e) { lastErr = e; await sleep(500); }
    finally { clearTimeout(to); }
  }
  throw lastErr || new Error('failed');
}

/* ---------- بلد البطولة (عشان ما نطابقش نادي تاني بنفس الاسم) ---------- */
const TEAM_COUNTRY = {
  PL: 'England', PD: 'Spain', SA: 'Italy', BL1: 'Germany', FL1: 'France', ELC: 'England',
  DED: 'Netherlands', PPL: 'Portugal', BSA: 'Brazil', EGY: 'Egypt', SAU: 'Saudi Arabia',
  MAR: 'Morocco', TUN: 'Tunisia', ALG: 'Algeria', UAE: 'United Arab Emirates',
  QAT: 'Qatar', IRQ: 'Iraq', JOR: 'Jordan'
};
const COUNTRY_WORDS = {
  England: ['england', 'english', 'british'], Spain: ['spain', 'spanish'],
  Italy: ['italy', 'italian'], Germany: ['germany', 'german'], France: ['france', 'french'],
  Netherlands: ['netherlands', 'dutch'], Portugal: ['portugal', 'portuguese'],
  Brazil: ['brazil', 'brazilian'], Egypt: ['egypt', 'egyptian'],
  'Saudi Arabia': ['saudi', 'saudi arabia'], Morocco: ['morocco', 'moroccan'],
  Tunisia: ['tunisia', 'tunisian'], Algeria: ['algeria', 'algerian'],
  'United Arab Emirates': ['emirati', 'united arab emirates', 'uae'],
  Qatar: ['qatar', 'qatari'], Iraq: ['iraq', 'iraqi'], Jordan: ['jordan', 'jordanian']
};

const COUNTRY_AR = {
  England: 'إنجلترا', Spain: 'إسبانيا', Italy: 'إيطاليا', Germany: 'ألمانيا', France: 'فرنسا',
  Netherlands: 'هولندا', Portugal: 'البرتغال', Brazil: 'البرازيل', Egypt: 'مصر',
  'Saudi Arabia': 'السعودية', Morocco: 'المغرب', Tunisia: 'تونس', Algeria: 'الجزائر',
  'United Arab Emirates': 'الإمارات', Qatar: 'قطر', Iraq: 'العراق', Jordan: 'الأردن'
};

const tokens = s => String(s || '').toLowerCase().split(/[^a-z0-9\u0600-\u06FF]+/).filter(t => t.length > 1);
function overlap(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.length || !B.length) return 0;
  let n = 0;
  A.forEach(t => { if (B.includes(t)) n++; });
  return n / Math.max(A.length, B.length);
}
const shortName = n => String(n || '')
  .replace(/\s+(FC|SC|SCC|CF|Club)$/i, '')
  .replace(/\s+(Riyadh|Jeddah|Cairo|Casablanca|Tunis|Algiers|Abu Dhabi|Doha|Baghdad|Amman|Tripoli)$/i, '')
  .trim();

/* ---------- Wikidata: نادي كرة قدم + بلد مطابق ---------- */
function hitScore(hit, name, want) {
  const d = String(hit.description || '').toLowerCase();
  const football = /football|soccer/.test(d);
  if (!football && !/sports club|multi-sport/.test(d)) return -1;
  if (/women|basketball|handball|volleyball|rugby|futsal|season|list of|stadium|esports|match/.test(d)) return -1;
  const ov = overlap(name, hit.label);
  if (!football && ov < 0.5) return -1;
  let s = ov * 3 + (football ? 1 : 0);
  if (want) {
    const words = COUNTRY_WORDS[want] || [want.toLowerCase()];
    s += words.some(w => d.includes(w)) ? 5 : -3;
  }
  return s;
}

async function labelsOf(ids) {
  const out = {};
  if (!ids.length) return out;
  try {
    const j = await jget(`${WD}/w/api.php?action=wbgetentities&format=json&origin=*&props=labels&languages=ar|en&ids=${ids.join('|')}`);
    ids.forEach(id => {
      const x = j.entities && j.entities[id];
      const l = x && x.labels;
      if (l) out[id] = (l.ar && l.ar.value) || (l.en && l.en.value) || '';
    });
  } catch (e) { }
  return out;
}

/* تاريخ Wikidata بيجي بصيغة +2026-00-00 اللي المتصفحات مش بتفهمها */
function wdTime(t) {
  const m = String(t || '').replace(/^\+/, '').match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return 0;
  return Date.UTC(+m[1], Math.max(0, +(m[2] || 1) - 1), Math.max(1, +(m[3] || 1)));
}

/* بناخد البيان المفضّل (preferred) الأول، وبعده الأحدث */
function pickClaim(claims) {
  const list = (claims || []).filter(c => c.mainsnak && c.mainsnak.datavalue);
  if (!list.length) return null;
  const pref = list.filter(c => c.rank === 'preferred');
  if (pref.length) return pref[0];
  return list[list.length - 1];
}
const claimId = c => (c && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value && c.mainsnak.datavalue.value.id) || '';

async function wikiClub(name, want) {
  const short = shortName(name);
  const tryNames = [...new Set([name, short, short && short + ' FC'].filter(Boolean))].slice(0, 3);

  for (const q of tryNames) {
    let hits = [];
    try {
      const s = await jget(`${WD}/w/api.php?action=wbsearchentities&format=json&origin=*&language=en&uselang=en&limit=7&search=${encodeURIComponent(q)}`);
      hits = (s.search || []).map(h => ({ h, sc: hitScore(h, name, want) }))
        .filter(x => x.sc >= 2).sort((a, b) => b.sc - a.sc).slice(0, 2);
    } catch (e) { continue; }

    for (const { h } of hits) {
      let ent;
      try {
        const e = await jget(`${WD}/wiki/Special:EntityData/${h.id}.json`);
        ent = e.entities && e.entities[h.id];
      } catch (e) { continue; }
      if (!ent) continue;

      const cl = ent.claims || {};
      const venue = claimId(pickClaim(cl.P115));
      const country = claimId(pickClaim(cl.P17));
      let city = claimId(pickClaim(cl.P131));
      const inc = pickClaim(cl.P571);
      const year = inc && String((inc.mainsnak.datavalue.value || {}).time || '').slice(1, 5);

      /* المدرب الحالي: المفضّل، وإلا الأحدث اللي لسه مستمر */
      const coaches = (cl.P286 || []).map(c => {
        const qf = c.qualifiers || {};
        const start = (qf.P580 && qf.P580[0] && qf.P580[0].datavalue && qf.P580[0].datavalue.value.time) || '';
        const end = (qf.P582 && qf.P582[0] && qf.P582[0].datavalue && qf.P582[0].datavalue.value.time) || '';
        return { id: claimId(c), start: String(start), end: String(end), pref: c.rank === 'preferred' };
      }).filter(x => {
        if (!x.id || x.end) return false;
        /* المدرب اللي بدايته قديمة (أو مجهولة وغير مفضّل) مش المدرب الحالي */
        if (x.start) return wdTime(x.start) > Date.now() - 4 * 365 * 864e5;
        return x.pref;
      });
      coaches.sort((a, b) => (b.pref ? 1 : 0) - (a.pref ? 1 : 0) || b.start.localeCompare(a.start));
      const coach = coaches[0] ? coaches[0].id : '';

      /* المدينة: من الملعب لو مش موجودة على النادي */
      if (!city && venue) {
        try {
          const v = await jget(`${WD}/wiki/Special:EntityData/${venue}.json`);
          const ve = v.entities && v.entities[venue];
          city = claimId(pickClaim(ve && ve.claims && ve.claims.P131));
        } catch (e) { }
      }

      const ids = [venue, country, city, coach].filter(Boolean);
      if (!ids.length) continue;
      const L = await labelsOf(ids);
      const out = {
        stadium: L[venue] || '',
        city: L[city] || '',
        country: COUNTRY_AR[want] || L[country] || '',
        founded: year && year !== '0000' ? year : '',
        coach: L[coach] || '',
        wiki: (ent.sitelinks && ent.sitelinks.enwiki && ent.sitelinks.enwiki.title) || ''
      };
      if (out.stadium || out.coach || out.founded) return out;
    }
  }
  return {};
}

/* ---------- TheSportsDB: احتياطي للملعب (بلد مطابق بس) ---------- */
async function tsdbInfo(name, want) {
  const tryNames = [name, shortName(name)].filter(Boolean);
  for (const q of tryNames) {
    let list = [];
    try {
      const j = await jget(`${TSDB}/searchteams.php?t=${encodeURIComponent(q)}`);
      list = (j.teams || []).filter(t => /soccer/i.test(t.strSport || ''));
    } catch (e) { continue; }
    /* بلد مختلف = نادي تاني، مش بناخده */
    const inCountry = want ? list.filter(t => String(t.strCountry || '').toLowerCase() === want.toLowerCase()) : list;
    const best = inCountry.find(t => t.strStadium);
    if (!best) continue;
    return {
      stadium: best.strStadium || '',
      city: best.strLocation || '',
      country: best.strCountry || '',
      founded: best.intFormedYear && best.intFormedYear !== '0' ? String(best.intFormedYear) : ''
    };
  }
  return {};
}

/* ---------- ألقاب النادي: جدول الألقاب من صفحة النادي على ويكيبيديا ---------- */
const HONOURS_TTL = 30 * 864e5;
const HONOUR_AR = {
  'premier league': 'الدوري الإنجليزي الممتاز',
  'first division': 'الدوري الإنجليزي (الدرجة الأولى)',
  'first division/premier league': 'الدوري الإنجليزي الممتاز',
  'football league first division': 'الدوري الإنجليزي (الدرجة الأولى)',
  'fa cup': 'كأس الاتحاد الإنجليزي',
  'efl cup': 'كأس الرابطة الإنجليزية',
  'football league cup': 'كأس الرابطة الإنجليزية',
  'efl trophy': 'كأس الرابطة الإنجليزية (الدرجة الأدنى)',
  'fa community shield': 'الدرع الخيرية',
  'fa charity shield': 'الدرع الخيرية',
  'uefa champions league': 'دوري أبطال أوروبا',
  'european cup': 'كأس أوروبا (الأبطال)',
  'uefa europa league': 'الدوري الأوروبي',
  'uefa cup': 'كأس الاتحاد الأوروبي',
  "uefa cup winners' cup": 'كأس الكؤوس الأوروبية',
  'uefa super cup': 'كأس السوبر الأوروبي',
  'uefa conference league': 'دوري المؤتمر الأوروبي',
  'fifa club world cup': 'كأس العالم للأندية',
  'intercontinental cup': 'كأس الإنتركونتيننتال',
  'la liga': 'الدوري الإسباني',
  'copa del rey': 'كأس ملك إسبانيا',
  'copa de la liga': 'كأس الرابطة الإسبانية',
  'supercopa de espana': 'كأس السوبر الإسباني',
  'serie a': 'الدوري الإيطالي',
  'coppa italia': 'كأس إيطاليا',
  'supercoppa italiana': 'كأس السوبر الإيطالي',
  'bundesliga': 'الدوري الألماني',
  'dfb-pokal': 'كأس ألمانيا',
  'dfl-supercup': 'كأس السوبر الألماني',
  'ligue 1': 'الدوري الفرنسي',
  'coupe de france': 'كأس فرنسا',
  'coupe de la ligue': 'كأس الرابطة الفرنسية',
  'trophee des champions': 'كأس السوبر الفرنسي',
  'eredivisie': 'الدوري الهولندي',
  'knvb cup': 'كأس هولندا',
  'primeira liga': 'الدوري البرتغالي',
  'taca de portugal': 'كأس البرتغال',
  'egyptian premier league': 'الدوري المصري الممتاز',
  'egypt cup': 'كأس مصر',
  'egyptian super cup': 'كأس السوبر المصري',
  'caf champions league': 'دوري أبطال أفريقيا',
  'caf confederation cup': 'كأس الكونفدرالية الأفريقية',
  'caf super cup': 'كأس السوبر الأفريقي',
  'afc champions league': 'دوري أبطال آسيا',
  'saudi professional league': 'الدوري السعودي للمحترفين',
  'king cup': 'كأس الملك',
  'kings cup': 'كأس الملك',
  'saudi super cup': 'كأس السوبر السعودي',
  'botola': 'الدوري المغربي',
  'botola pro': 'الدوري المغربي',
  'tunisian ligue professionnelle 1': 'الدوري التونسي',
  'algerian ligue professionnelle 1': 'الدوري الجزائري',
  'uae pro league': 'الدوري الإماراتي',
  'qatar stars league': 'دوري نجوم قطر',
  'copa libertadores': 'كأس ليبرتادوريس',
  'copa sudamericana': 'كأس السودأمريكانا',
  'mls cup': 'كأس الدوري الأمريكي',
  'brasileirao': 'الدوري البرازيلي',
  'copa do brasil': 'كأس البرازيل'
};
const honKeyNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
const honAr = n => {
  const k = honKeyNorm(n);
  if (HONOUR_AR[k]) return HONOUR_AR[k];
  const parts = k.split('/').map(x => HONOUR_AR[x.trim()]).filter(Boolean);
  return parts.length ? parts.join(' / ') : n;
};
const honKey = n => 'snaces_honours2_' + normName(n).slice(0, 40);

/* صفحة النادي على ويكيبيديا الإنجليزية (احتياطي لو Wikidata مالوش لينك) */
async function enWikiPage(name) {
  try {
    const j = await jget(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=5&srsearch=${encodeURIComponent(name + ' football club')}`);
    const hits = (j.query && j.query.search) || [];
    const pick = hits.find(h => overlap(name, h.title) >= 0.5 && !/^(list of|season|women|reserves|academy)/i.test(h.title));
    return pick ? pick.title : '';
  } catch (e) { return ''; }
}

/* جدول الألقاب: عمود Titles + اسم البطولة (أو أول رقم في الصف) */
function parseHonours(html) {
  const found = new Map();
  let doc;
  try { doc = new DOMParser().parseFromString(html, 'text/html'); } catch (e) { return []; }
  const clean = s => String(s || '').replace(/\[\s*[a-z0-9 ]{0,8}\s*\]/gi, '').replace(/\s+/g, ' ').trim();
  doc.querySelectorAll('table').forEach(tb => {
    [...tb.querySelectorAll('tr')].forEach(tr => {
      const cells = [...tr.children].map(c => clean(c.textContent));
      if (cells.length < 2) return;
      /* أول خلية رقم صغير (1-2 خانة) = عدد الألقاب، اللي قبلها اسم البطولة */
      const ci = cells.findIndex((c, i) => i > 0 && /^\d{1,2}$/.test(c));
      if (ci < 1) return;
      const n = Number(cells[ci]);
      if (!(n > 0)) return;
      const comp = cells.slice(0, ci).filter(c => c && !/^(domestic|continental|worldwide|international|other|type|competition|titles?)$/i.test(c)).pop() || '';
      if (comp.length < 3) return;
      if (!found.has(comp) || found.get(comp) < n) found.set(comp, n);
    });
  });
  return [...found].map(([n, count]) => ({ name: n, count })).sort((a, b) => b.count - a.count).slice(0, 16);
}

async function teamHonours(name, page, want) {
  const key = honKey(name);
  const c = store.get(key, null);
  if (c && c.d && Date.now() - c.t < HONOURS_TTL) return c.d;
  try {
    const pg = page || await enWikiPage(name);
    if (!pg) return (c && c.d) || null;
    const S = await jget(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&prop=sections&page=${encodeURIComponent(pg)}`);
    const list = (S.parse && S.parse.sections) || [];
    const hon = list.find(s => /^honou?rs/i.test(s.line)) || list.find(s => /honou?rs|trophies/i.test(s.line));
    if (!hon) return (c && c.d) || null;
    const T = await jget(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&prop=text&page=${encodeURIComponent(pg)}&section=${hon.index}`);
    const html = (T.parse && T.parse.text && T.parse.text['*']) || '';
    const items = parseHonours(html);
    if (!items.length) return (c && c.d) || null;
    const out = { page: pg, items };
    store.set(key, { t: Date.now(), d: out });
    return out;
  } catch (e) {
    return (c && c.d) || null;
  }
}

/* ---------- ملف الفريق (كاش أسبوع) ---------- */
async function teamProfile(name, code) {
  const key = teamKey(code, name);
  const c = store.get(key, null);
  if (c && Date.now() - c.t < TEAM_TTL) return c.d;

  const want = TEAM_COUNTRY[code] || '';
  const out = { stadium: '', city: '', country: '', founded: '', coach: '', wiki: '' };
  try { Object.assign(out, await wikiClub(name, want)); } catch (e) { }
  if (!out.stadium || !out.founded) {
    try {
      const t = await tsdbInfo(name, want);
      out.stadium = out.stadium || t.stadium || '';
      out.city = out.city || t.city || '';
      out.country = out.country || t.country || '';
      out.founded = out.founded || t.founded || '';
    } catch (e) { }
  }
  /* بلد البطولة معروف، فبنعرضه بالعربي دايمًا بدل خلط لغتين */
  if (want && COUNTRY_AR[want]) out.country = COUNTRY_AR[want];
  if (out.stadium || out.city || out.coach || out.founded) store.set(key, { t: Date.now(), d: out });
  return out;
}

/* ---------- الشاشة ---------- */
screen('team', {
  title: 'الفريق', tab: 'leagues', back: true,
  async render(q, el) {
    const l = LN[q.l] ? q.l : 'PL';
    const D = await leagueData(l);
    const id = q.id, nm0 = q.n || '';

    const rows = (D && D.standings) || [];
    const row = rows.find(r => String(r.team.id) === String(id)) || rows.find(r => normName(r.team.name) === normName(nm0));
    const team = (row && row.team) || { id, name: nm0 || 'الفريق', crest: '' };
    const name = team.name;
    const tid = String(team.id || id || '');

    el.innerHTML = `
      <div class="dataPanel" style="padding:16px">
        <div style="display:flex;gap:14px;align-items:center">
          <div>${crestBig(team.crest)}</div>
          <div style="min-width:0">
            <h2 style="margin:0;font-size:20px">${esc(name)}</h2>
            <p class="muted small" style="margin:4px 0 0">
              <a href="#/leagues?l=${l}" style="color:inherit">${esc(LN[l] || l)}</a>
              ${row ? ` • المركز ${row.pos} • ${row.pts} نقطة` : ''}
            </p>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin:10px 0 0">
        <button class="btn secondary" type="button" data-share data-share-title="${esc(name)}" data-share-text="صفحة ${esc(name)} على SNACES FOOTBALL">🔗 مشاركة صفحة الفريق</button>
      </div>

      ${row ? `<div class="kpis" style="margin:12px 0">
        ${kpi('المركز', row.pos, 'green')}${kpi('النقاط', row.pts)}
        ${kpi('لعب', row.p)}${kpi('له / عليه', row.gf + ' / ' + row.ga)}
      </div>` : ''}

      <details class="fold">
        <summary><h2>📅 مباريات الفريق <small class="muted" id="tmCount"></small></h2></summary>
        <div class="foldBody" id="tm"><div class="row"><span class="muted">بيتم التحميل…</span></div></div>
      </details>

      <details class="fold" open>
        <summary><h2>🏆 ألقاب النادي <small class="muted" id="ttCount"></small></h2></summary>
        <div class="foldBody" id="tt"><div class="row"><span class="muted">بيتم التحميل…</span></div></div>
      </details>

      <details class="fold">
        <summary><h2>🏟️ معلومات النادي</h2></summary>
        <div class="foldBody" id="tp"><div class="row"><span class="muted">بيتم التحميل…</span></div></div>
      </details>

      <details class="fold">
        <summary><h2>👥 تشكيلة الفريق</h2></summary>
        <div class="foldBody" id="sq"><div class="row"><span class="muted">بيتم التحميل…</span></div></div>
      </details>

      <a class="btn secondary" href="javascript:history.back()" style="width:100%;margin-top:12px">رجوع</a>`;

    /* ---------- كل مباريات النادي ---------- */
    const G = (typeof liveTeamGames === 'function') ? await liveTeamGames(tid).catch(() => null) : null;
    const mine = ((D && D.matches) || []).filter(m => String(m.home.id) === tid || String(m.away.id) === tid);
    const norm = m => ({
      id: m.id, code: m.code || l, comp: m.comp || (D && D.name) || LN[l] || '',
      date: m.date, status: m.status, s: m.s || m.status, md: m.md || null,
      gameTime: m.gameTime ?? null, gtd: m.gtd || '', stx: m.stx || '', syncAt: m.syncAt || null,
      home: { id: String(m.home.id), name: m.home.name || '', crest: m.home.crest || '' },
      away: { id: String(m.away.id), name: m.away.name || '', crest: m.away.crest || '' },
      hg: m.hg, ag: m.ag
    });
    const up = G ? [...(G.live || []), ...G.upcoming] : mine.filter(m => m.status !== 'FINISHED').sort((a, b) => new Date(a.date) - new Date(b.date)).map(norm);
    const fin = G ? G.finished : mine.filter(isFin).sort((a, b) => new Date(b.date) - new Date(a.date)).map(norm);
    const form = fin.slice(0, 5).map(m => {
      const home = m.home.id === tid;
      const f = home ? m.hg : m.ag, a = home ? m.ag : m.hg;
      return f > a ? 'W' : f < a ? 'L' : 'D';
    });
    const line = m => {
      const home = m.home.id === tid;
      const o = home ? m.away : m.home;
      const gf = home ? m.hg : m.ag, ga = home ? m.ag : m.hg;
      const done = m.hg != null && m.ag != null;
      const isLive = m.s === 'IN_PLAY';
      const res = done && !isLive ? (gf > ga ? 'W' : gf < ga ? 'L' : 'D') : '';
      const score = isLive && typeof liveClockHtml === 'function'
        ? `<b class="green">${done ? gf + ' - ' + ga : '—'}</b> ${liveClockHtml(m)}`
        : done
        ? `<b>${gf} - ${ga}</b> ${res ? `<span class="fdr ${res === 'W' ? 'fdr1' : res === 'L' ? 'fdr5' : 'fdr3'}" style="color:#062015">${res === 'W' ? 'ف' : res === 'L' ? 'خ' : 'ت'}</span>` : ''}`
        : dt(m.date);
      const meta = [m.comp, m.md ? 'جولة ' + m.md : ''].filter(Boolean).join(' • ');
      const inner = `<span style="min-width:0;display:flex;gap:8px;align-items:center">${crest(o.crest)}<span style="min-width:0"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(o.name)}${home ? ' <small class="muted">(أرضنا)</small>' : ''}</span>${meta ? `<small class="muted tiny">${esc(meta)}</small>` : ''}</span></span><span class="side">${score}</span>`;
      return m.code ? `<a class="row" href="#/match?l=${m.code}&id=${m.id}">${inner}</a>` : `<div class="row">${inner}</div>`;
    };
    const tm = $('#tm', el);
    if (tm) {
      tm.innerHTML = (up.length || fin.length)
        ? `${form.length ? `<div class="dataPanel" style="padding:10px;margin-bottom:8px"><div class="between"><span class="muted small">آخر 5 نتائج</span><span>${formChips(form)}</span></div></div>` : ''}
           ${up.length ? `<div class="head" style="margin:6px 0"><h2>القادمة (${up.length})</h2></div><div class="dataPanel" style="padding:0 10px">${up.map(line).join('')}</div>` : ''}
           ${fin.length ? `<div class="head" style="margin:12px 0 6px"><h2>النتائج (${fin.length})</h2></div><div class="dataPanel" style="padding:0 10px">${fin.map(line).join('')}</div>` : ''}`
        : '<div class="empty">لا توجد مباريات في البيانات.</div>';
      const c = $('#tmCount', el);
      if (c) c.textContent = `(${up.length + fin.length})`;
    }

    /* ---------- ألقاب النادي ---------- */
    (async () => {
      const box = $('#tt', el);
      if (!box) return;
      const p = await teamProfile(name, l);
      const h = await teamHonours(name, p.wiki, TEAM_COUNTRY[l]);
      if (!h || !h.items.length) { box.innerHTML = '<div class="empty">ألقاب النادي مش متاحة في المصادر حاليًا.</div>'; return; }
      box.innerHTML = `<div class="dataPanel" style="padding:10px">${h.items.map(t => `<div class="row"><span>🏆 ${esc(honAr(t.name))}</span><span class="side"><b>${t.count}</b></span></div>`).join('')}</div>
        <p class="muted tiny" style="margin:8px 0 0">الألقاب والتواريخ حسب أرشيف النادي${h.page ? ' — ' + esc(String(h.page).replace(/_/g, ' ')) : ''}.</p>`;
      const c = $('#ttCount', el);
      if (c) c.textContent = `(${h.items.reduce((s, t) => s + t.count, 0)})`;
    })();

    /* ---------- تشكيلة الفريق — من آخر مباراة (بيانات 365Scores) ---------- */
    (async () => {
      const box = $('#sq', el);
      if (!box) return;
      const recent = fin[0] || up[0];
      if (typeof liveMatch !== 'function' || !recent) { box.innerHTML = '<div class="empty">لا توجد مباريات لاستخراج التشكيلة.</div>'; return; }
      const code = recent.code || l;
      if (!LIVE_COMPS[code]) { box.innerHTML = '<div class="empty">التشكيلات مش متاحة لهذه البطولة.</div>'; return; }
      try {
        const info = await liveMatch(code, recent.id);
        if (!info || !info.game) { box.innerHTML = '<div class="empty">تعذّر جلب التشكيلة.</div>'; return; }
        const g = info.game;
        const members = g.members || [];
        const teamMembers = members.filter(mm => String(mm.competitorId) === tid);
        if (!teamMembers.length) { box.innerHTML = '<div class="empty">لا توجد بيانات لاعبين.</div>'; return; }
        const seen = new Set();
        const uniq = teamMembers.filter(mm => { if (seen.has(mm.id)) return false; seen.add(mm.id); return true; });
        box.innerHTML = uniq.map(mm => {
          const img = `https://imagecache.365scores.com/image/upload/f_png,w_40,h_40,c_limit,q_auto:eco/v1/Athletes/${mm.athleteId}`;
          const link = mm.athleteId ? `<a href="#/player?id=${mm.athleteId}&n=${encodeURIComponent(mm.name)}" style="color:inherit">${esc(mm.name)}</a>` : esc(mm.name);
          return `<div class="row"><span style="display:flex;align-items:center;gap:8px"><img src="${esc(img)}" alt="" width="28" height="28" style="border-radius:50%;object-fit:cover" referrerpolicy="no-referrer" onerror="this.style.display='none'"><span>${link} <small class="muted">#${mm.jerseyNumber || '—'}</small></span></span></div>`;
        }).join('');
      } catch (e) { box.innerHTML = '<div class="empty">تعذّر جلب التشكيلة.</div>'; }
    })();

    /* ---------- معلومات النادي ---------- */
    const box = $('#tp', el);
    const p = await teamProfile(name, l);
    const item = (icon, label, val) => val ? `<div class="row"><span>${icon} ${label}</span><span class="side"><b>${esc(val)}</b></span></div>` : '';
    const html = item('🏟️', 'الملعب', p.stadium) + item('📍', 'المدينة', p.city) +
      item('🌍', 'البلد', p.country) + item('📅', 'سنة التأسيس', p.founded) +
      item('🎽', 'المدرب', p.coach);
    if (box) box.innerHTML = html || '<div class="empty">معلومات النادي مش متاحة في المصادر حاليًا.</div>';
  }
});

/* ============ ملف اللاعب ============ */
screen('player', {
  title: 'اللاعب', tab: 'leagues', back: true,
  async render(q, el) {
    const id = q.id;
    const nm = q.n || '';
    el.innerHTML = '<div class=\"skel\" style=\"height:200px\"></div>';
    let a = null;
    if (typeof livePlayer === 'function') a = await livePlayer(id);
    if (!a) {
      el.innerHTML = emptyBox('معلومات اللاعب مش متاحة حاليًا.', '<br><br><a class=\"btn secondary\" href=\"javascript:history.back()\">رجوع</a>');
      return;
    }
    const img = `https://imagecache.365scores.com/image/upload/f_png,w_250,h_250,c_limit,q_auto:eco/v1/Athletes/${id}`;
    /* صورة بديلة من بيانات الدوريات الكبيرة لو المصدر مالوش صورة */
    let altImg = '';
    try {
      const d = typeof getJSON === 'function' ? await getJSON('data/fpl.json') : null;
      const nm0 = normName(a.name || nm);
      const el2 = d && (d.elements || []).find(x => normName(x.web_name) === nm0 || normName(x.second_name || '') === nm0 || normName((x.first_name || '') + ' ' + (x.second_name || '')) === nm0);
      if (el2 && el2.photo) altImg = plPhoto(el2.photo, true);
    } catch (e) { }
    let club = (a.competitor || (a.competitors || []).find(c => c.id === a.competitorId)) || null;
    const initials = String(a.name || nm).trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('');
    const details = (a.playerDetails || []).slice(0, 6).map(d => `<div class=\"row\"><span class=\"muted\">${esc(d.title || d.name || '')}</span><span class=\"side\"><b>${esc(d.value || '')}</b></span></div>`).join('');
    const hl = (a.highlightStats || []).map(hs => {
      const stArr = Array.isArray(hs.stats) ? hs.stats : (hs.stats ? Object.values(hs.stats) : []);
      const stats = stArr.map(s => `<tr><td>${esc(s && s.value)}</td><td class=\"muted\">${esc(s && (s.name || s.title))}</td></tr>`).join('');
      const compName = hs.name || ('بطولة ' + (hs.competitionId || ''));
      return `<div class=\"dataPanel\" style=\"padding:10px;margin-top:8px\"><div class=\"between\" style=\"margin-bottom:6px\"><b>${esc(compName)}</b></div><div class=\"tableWrap\"><table class=\"cmpTbl\" style=\"min-width:0\"><tbody>${stats}</tbody></table></div></div>`;
    }).join('');
    const transfersArr = (Array.isArray(a.transfers) ? a.transfers : (a.transfers ? Object.values(a.transfers) : []))
      .filter(t => t && t.competitorId)
      .sort((x, y) => Date.parse(y.date || 0) - Date.parse(x.date || 0))
      .slice(0, 12);

    /* المصدر مش بيبعت أسماء الأندية مع اللاعب — بنجيبها مرة وبنكاشها */
    const transferIds = [...new Set([...transfersArr.map(t => t.competitorId), a.competitorId].filter(Boolean))];
    const clubNames = {};
    if (transferIds.length && typeof liveGet === 'function') {
      const nk = 'snaces_clubnames_' + transferIds.slice(0, 12).join('_');
      const cached = store.get(nk, null);
      if (cached && cached.d && Date.now() - cached.t < 7 * 864e5) Object.assign(clubNames, cached.d);
      else {
        try {
          const j = await liveGet(`${LIVE_BASE}/competitors/?appTypeId=5&langId=1&competitors=${transferIds.slice(0, 12).join(',')}`);
          (j.competitors || []).forEach(x => { clubNames[x.id] = x.name; });
          store.set(nk, { t: Date.now(), d: clubNames });
        } catch (e) { }
      }
    }
    if (!club && a.competitorId && clubNames[a.competitorId]) club = { name: clubNames[a.competitorId], crest: liveCrest(a.competitorId) };
    const transfers = transfersArr.map(t => {
      const comp = (a.competitors || []).find(c => c.id === t.competitorId);
      const clubName = (comp && comp.name) || clubNames[t.competitorId] || ('نادي ' + t.competitorId);
      const price = t.price ? ` • ${esc(t.price)}` : '';
      const until = t.contractUntil ? ` • حتى ${esc(String(t.contractUntil).slice(0, 10))}` : '';
      const typ = ({ 0: 'انضمام', 1: 'انضمام', 2: 'انتقال', 3: 'إعارة', 4: 'رجوع من إعارة' })[t.transferType] || 'انتقال';
      return `<div class=\"row\"><span>${esc(clubName)} <small class=\"muted\">${esc(typ)}${price}${until}</small></span><span class=\"side muted tiny\">${esc(String(t.date || '').slice(0, 10))}</span></div>`;
    }).join('');
    const trophies = ((a.trophies && a.trophies.categories) || []).slice(0, 4);
    const trophyHtml = trophies.map(cat => {
      const ts = (cat.trophies || []).map(t => `<div class=\"row\"><span>🏆 ${esc(t.name || t.displayName || '')}</span><span class=\"side\"><b>${t.count || 1}</b></span></div>`).join('');
      return ts ? `<div class=\"dataPanel\" style=\"padding:10px;margin-top:8px\"><div class=\"between\" style=\"margin-bottom:6px\"><b>${esc(cat.name || '')}</b></div>${ts}</div>` : '';
    }).join('');
    const career = ((a.careerStats && a.careerStats.seasons) || []).slice(0, 12);
    const careerHtml = career.length ? `<div class=\"dataPanel\" style=\"padding:10px;margin-top:8px\"><div class=\"tableWrap\"><table class=\"cmpTbl\" style=\"min-width:0\"><thead><tr><th>الموسم</th><th>البطولة</th><th>مباريات</th><th>أهداف</th><th>صناعة</th></tr></thead><tbody>${career.map(s => {
      const stats = Array.isArray(s.stats) ? s.stats : (s.stats ? Object.values(s.stats) : []);
      const get = (name) => { const x = (stats || []).find(z => z && (z.name === name || z.shortName === name)); return x ? (x.value != null ? x.value : '—') : '—'; };
      return `<tr><td>${esc(s.seasonName || s.season || '')}</td><td>${esc(s.competitionName || '')}</td><td>${esc(get('Appearances'))}</td><td>${esc(get('Goals'))}</td><td>${esc(get('Assists'))}</td></tr>`;
    }).join('')}</tbody></table></div></div>` : '';

    el.innerHTML = `
      <div class=\"dataPanel\" style=\"padding:16px\">
        <div style=\"display:flex;gap:14px;align-items:center\">
          <div style=\"position:relative;width:104px;height:104px;flex:0 0 104px;border-radius:50%;overflow:hidden;background:#0f2b1f;display:grid;place-items:center\">
            <span style=\"font-size:30px;font-weight:900;color:#68d39b\">${esc(initials || '⚽')}</span>
            <img src=\"${esc(img)}\" alt=\"${esc(a.name || nm)}\" width=\"104\" height=\"104\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover\" referrerpolicy=\"no-referrer\"
              onerror=\"if(this.dataset.alt){this.remove()}else if('${esc(altImg)}'){this.dataset.alt='1';this.src='${esc(altImg)}'}else{this.remove()}\">
          </div>
          <div style=\"min-width:0\">
            <h2 style=\"margin:0;font-size:20px\">${esc(a.name || nm)}</h2>
            <p class=\"muted small\" style=\"margin:4px 0 0\">${esc(a.shortBio || '')}</p>
            <p class=\"muted tiny\" style=\"margin:4px 0 0\">${esc(a.nationalityName || '')} • ${esc(a.position && a.position.name || '')} • #${a.jerseyNum || '—'}</p>
            ${club ? `<p class=\"muted tiny\" style=\"margin:5px 0 0;display:flex;align-items:center;gap:6px\">${club.crest ? `<img class=\"crest\" src=\"${esc(club.crest)}\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\">` : ''}<span>${esc(club.name || '')}</span></p>` : ''}
          </div>
        </div>
      </div>
      <div style=\"text-align:center;margin-top:10px\">
        <button class=\"btn secondary\" type=\"button\" data-share data-share-title=\"${esc(a.name || nm)}\" data-share-text=\"ملف ${esc(a.name || nm)} على SNACES FOOTBALL\">🔗 مشاركة صفحة اللاعب</button>
      </div>
      ${details ? `<div class=\"dataPanel\" style=\"padding:10px;margin-top:12px\">${details}</div>` : ''}
      ${hl ? `<div class=\"section\"><div class=\"head\"><h2>📊 أرقام</h2></div>${hl}</div>` : ''}
      ${transfers ? `<div class=\"section\"><div class=\"head\"><h2>🔁 انتقالات</h2></div><div class=\"dataPanel\" style=\"padding:10px\">${transfers}</div></div>` : ''}
      ${trophyHtml ? `<div class=\"section\"><div class=\"head\"><h2>🏆 ألقاب</h2></div>${trophyHtml}</div>` : ''}
      ${careerHtml ? `<div class=\"section\"><div class=\"head\"><h2>📅 مسيرة</h2></div>${careerHtml}</div>` : ''}
      <a class=\"btn secondary\" href=\"javascript:history.back()\" style=\"width:100%;margin-top:12px\">رجوع</a>`;

    /* تقصير الصفحة: الأقسام الطويلة تبقى قابلة للفتح */
    el.querySelectorAll('.section').forEach((sec, i) => {
      const head = sec.querySelector('.head');
      const title = sec.querySelector('.head h2');
      if (!head || !title) return;
      const d = document.createElement('details');
      d.className = 'fold';
      const sum = document.createElement('summary');
      sum.innerHTML = title.outerHTML;
      const body = document.createElement('div');
      body.className = 'foldBody';
      [...sec.children].forEach(c => { if (c !== head) body.appendChild(c); });
      d.append(sum, body);
      if (i === 0) d.setAttribute('open', '');
      sec.replaceWith(d);
    });
    /* جوه «أرقام»: أول بطولة بس ظاهرة، والباقي يتفتح لوحده */
    const statsBody = el.querySelector('details.fold .foldBody');
    if (statsBody) {
      const panels = [...statsBody.querySelectorAll(':scope > .dataPanel')];
      if (panels.length > 1) {
        const rest = document.createElement('details');
        rest.className = 'fold';
        const sum = document.createElement('summary');
        sum.innerHTML = '<h2>باقي البطولات</h2>';
        const b = document.createElement('div');
        b.className = 'foldBody';
        panels.slice(1).forEach(p => b.appendChild(p));
        rest.append(sum, b);
        statsBody.appendChild(rest);
      }
    }
    const bio = el.querySelector('.dataPanel p.small');
    if (bio) bio.classList.add('clamp2');
  }
});
