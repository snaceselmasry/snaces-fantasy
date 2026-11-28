'use strict';
/* ============ تحليل مباراة ============ */
let MATCH_TIMER = null;
const stopMatchTimer = () => { if (MATCH_TIMER) { clearTimeout(MATCH_TIMER); MATCH_TIMER = null; } };
window.addEventListener('hashchange', stopMatchTimer);

/* ترجمات أسماء إحصائيات وأماكن 365Scores */
const STAT_AR = {
  'possession': 'الاستحواذ',
  'expected goals': 'الأهداف المتوقعة (xG)',
  'total shots': 'إجمالي التسديدات',
  'shots on target': 'تسديدات على المرمى',
  'big chances created': 'فرص كبيرة صُنعت',
  'corners': 'الركنيات',
  'offsides': 'التسلل',
  'passes completed': 'تمريرات صحيحة',
  'red cards': 'كروت حمراء',
  'attacks': 'الهجمات',
  'shots off target': 'تسديدات خارج المرمى',
  'shots blocked': 'تسديدات مصدودة',
  'hit woodwork': 'في العارضة/القائم',
  'expected goals on target': 'أهداف متوقعة على المرمى',
  'free kicks': 'ركلات حرة',
  'shots inside the box': 'تسديدات داخل المنطقة',
  'total passes': 'إجمالي التمريرات',
  'shots outside the box': 'تسديدات خارج المنطقة',
  'big chances missed': 'فرص كبيرة مهدورة',
  'expected assists': 'تمريرات حاسمة متوقعة (xA)',
  'crosses completed': 'عرضيات صحيحة',
  'passes own half': 'تمريرات في ملعبه',
  'passes opposition half': 'تمريرات في ملعب الخصم',
  'long passes completed': 'تمريرات طويلة صحيحة',
  'throw-ins': 'رميات التماس',
  'key passes': 'تمريرات مفتاحية',
  'passes into final third': 'تمريرات للثلث الأخير',
  'backward passes': 'تمريرات للخلف',
  'goal kicks': 'ركلات المرمى',
  'interceptions': 'اعتراضات',
  'expected goals conceded': 'أهداف متوقعة مستقبلة',
  'goalkeeper saves': 'تصديات الحارس',
  'tackles won': 'التحامات ناجحة',
  'tackles': 'التحامات',
  'clearances': 'تشتيت',
  'duels won': 'التحامات مكتسبة',
  'aerial duels won': 'التحامات هوائية',
  'ground duels won': 'التحامات أرضية',
  'was fouled': 'تعرض لخطأ',
  'successful dribbles': 'مراوغات ناجحة',
  'was dribbled past': 'تجاوزه مراوغ',
  'final third possession won': 'استحواذ في الثلث الأخير',
  'possession lost': 'فقدان الكرة',
  'fouls': 'الأخطاء',
  'fouls made': 'الأخطاء',
  'yellow cards': 'كروت صفراء',
  'substitutions': 'التبديلات',
  'shots': 'التسديدات',
  'passes': 'التمريرات',
  'discipline': 'الانضباط',
  'defense': 'الدفاع',
  'duels': 'الالتحامات',
  'goalkeeping': 'الحراسة'
};
const POS_AR = {
  'goalkeeper': 'حارس مرمى', 'defender': 'مدافع', 'midfielder': 'وسط', 'attacker': 'مهاجم',
  'centre back': 'قلب دفاع', 'center back': 'قلب دفاع', 'left back': 'ظهير أيسر', 'right back': 'ظهير أيمن',
  'left midfield': 'وسط أيسر', 'right midfield': 'وسط أيمن', 'central midfield': 'وسط ملعب',
  'attacking midfield': 'وسط مهاجم', 'defensive midfield': 'وسط مدافع',
  'centre forward': 'رأس حربة', 'center forward': 'رأس حربة', 'striker': 'مهاجم صريح',
  'left forward': 'مهاجم أيسر', 'right forward': 'مهاجم أيمن',
  'left wing': 'جناح أيسر', 'right wing': 'جناح أيمن', 'left winger': 'جناح أيسر', 'right winger': 'جناح أيمن',
  'coach': 'مدرب', 'management': 'الجهاز الفني', 'substitute': 'بديل'
};
const EVT_AR = {
  'goal': 'هدف', 'penalty': 'ركلة جزاء', 'own goal': 'هدف عكسي', 'yellow card': 'إنذار', 'second yellow card': 'إنذار ثاني',
  'red card': 'طرد', 'substitution': 'تبديل', 'var': 'تقنية الفيديو', 'missed penalty': 'ركلة جزاء مهدرة',
  'penalty missed': 'ركلة جزاء مهدرة', 'assist': 'صناعة'
};
/* البطاقات اللي المصدر مبيبعتهاش متصنّفة */
const STAT_CAT = {
  'big chances created': 'Shots', 'big chances missed': 'Shots', 'hit woodwork': 'Shots',
  'corners': 'Attacks', 'offsides': 'Attacks', 'attacks': 'Attacks', 'free kicks': 'Attacks',
  'throw-ins': 'Attacks', 'goal kicks': 'Attacks',
  'total passes': 'Passes', 'passes completed': 'Passes', 'passes own half': 'Passes',
  'passes opposition half': 'Passes', 'long passes completed': 'Passes', 'key passes': 'Passes',
  'passes into final third': 'Passes', 'backward passes': 'Passes', 'crosses completed': 'Passes',
  'substitutions': 'Discipline', 'fouls': 'Discipline', 'fouls made': 'Discipline',
  'yellow cards': 'Discipline', 'red cards': 'Discipline',
  'possession': 'Possession', 'final third possession won': 'Possession', 'possession lost': 'Possession'
};
const statAr = n => STAT_AR[String(n || '').toLowerCase()] || n;
const posAr = n => POS_AR[String(n || '').toLowerCase()] || n;
const evtAr = n => EVT_AR[String(n || '').toLowerCase()] || n;

/* نسبة الشريط من نص القيمة: 72% / 21 / 2.57 / 15/20 */
function statNum(v) {
  const s = String(v == null ? '' : v);
  const pct = s.match(/^(\d+(?:[.,]\d+)?)%$/);
  if (pct) return Math.min(100, +pct[1].replace(',', '.'));
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)/);
  if (frac) return +frac[2] ? Math.round(+frac[1] / +frac[2] * 100) : null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? Math.abs(n) : null;
}

screen('match', {
  title: 'تحليل المباراة', tab: 'leagues', back: true,
  async render(q, el) {
    stopMatchTimer();
    const l = LN[q.l] ? q.l : 'PL';
    const D = await leagueData(l);
    const m = D && (D.matches || []).find(x => String(x.id) === String(q.id));

    if (!m) {
      el.innerHTML = emptyBox('المباراة مش موجودة في البيانات.', '<br><br><a class="btn secondary" href="#/leagues?l=' + l + '">رجوع للبطولة</a>');
      return;
    }

    const done = typeof liveStatusDone === 'function' ? liveStatusDone(m.status) : m.status === 'FINISHED';
    const live = m.status === 'IN_PLAY';
    const homeId = String(m.home.id), awayId = String(m.away.id);
    const A = (D.standings || []).find(r => String(r.team.id) === homeId);
    const B = (D.standings || []).find(r => String(r.team.id) === awayId);
    const pred = done ? null : predictMatch(D, m.home.id, m.away.id);
    const statusTxt = typeof liveStatusLabel === 'function' ? liveStatusLabel(m.status) : (done ? 'انتهت' : live ? 'مباشر' : 'لم تبدأ');

    /* ---- مباريات سابقة/تالية في نفس البطولة ---- */
    const chrono = ((D && D.matches) || []).slice().sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const at = chrono.findIndex(x => String(x.id) === String(m.id));
    const prevM = at > 0 ? chrono[at - 1] : null;
    const nextM = at >= 0 && at < chrono.length - 1 ? chrono[at + 1] : null;
    const navRow = '<div class="between" style="margin:12px 0">' +
      (prevM ? '<a class="btn secondary" href="#/match?l=' + l + '&id=' + prevM.id + '">‹ السابقة</a>' : '<span></span>') +
      (nextM ? '<a class="btn secondary" href="#/match?l=' + l + '&id=' + nextM.id + '">التالية ›</a>' : '<span></span>') +
      '</div>';

    /* ---- مواجهات مباشرة + آخر مباريات (من بيانات البطولة الحقيقية) ---- */
    const finAll = ((D && D.matches) || []).filter(isFin);
    const h2h = finAll.filter(x =>
      (String(x.home.id) === homeId && String(x.away.id) === awayId) ||
      (String(x.home.id) === awayId && String(x.away.id) === homeId)
    ).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const lastOf = tid => finAll.filter(x => String(x.home.id) === tid || String(x.away.id) === tid)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);

    const shortLine = (x, tid) => {
      const isHome = String(x.home.id) === tid;
      const o = isHome ? x.away : x.home;
      const gf = isHome ? x.hg : x.ag, ga = isHome ? x.ag : x.hg;
      const res = gf > ga ? 'ف' : gf < ga ? 'خ' : 'ت';
      const cls = gf > ga ? 'fdr1' : gf < ga ? 'fdr5' : 'fdr3';
      return '<div class="row" style="gap:8px">' +
        (crest(o.crest) || '') +
        '<span style="flex:1;min-width:0"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(o.name) + '</span>' +
        '<small class="muted tiny">' + dt(x.date) + (isHome ? ' • أرضنا' : ' • خارج') + '</small></span>' +
        '<span class="side"><b>' + gf + ' - ' + ga + '</b> <span class="fdr ' + cls + '" style="color:#062015">' + res + '</span></span>' +
      '</div>';
    };

    const h2hLine = x => {
      const hs = x.hg, as = x.ag;
      return '<a class="row" href="#/match?l=' + (x.code || l) + '&id=' + x.id + '" style="gap:8px">' +
        '<span style="flex:1;min-width:0"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(x.home.name) + ' × ' + esc(x.away.name) + '</span>' +
        '<small class="muted tiny">' + dt(x.date) + (x.md ? ' • جولة ' + x.md : '') + '</small></span>' +
        '<span class="side"><b>' + hs + ' - ' + as + '</b></span>' +
      '</a>';
    };

    const fold = (title, body, open) =>
      '<details class="fold"' + (open ? ' open' : '') + '><summary><h2>' + title + '</h2></summary><div class="foldBody">' + body + '</div></details>';

    /* ---- هيدر المباراة ---- */
    const kick = (() => {
      const d = new Date(m.date);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    })();
    const dayTxt = new Date(m.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

    const teamCol = (t, s) =>
      '<a class="mTeam" href="#/team?l=' + l + '&id=' + t.id + '&n=' + encodeURIComponent(t.name) + '">' +
        (t.crest ? '<img class="mCrest" src="' + esc(t.crest) + '" alt="" referrerpolicy="no-referrer">' : '<span class="mCrest ph">⚽</span>') +
        '<b class="mName">' + esc(t.name) + '</b>' +
        (s ? '<small class="muted">' + (s.pos ? 'المركز ' + s.pos : '') + (s.pos && s.pts != null ? ' • ' : '') + (s.pts != null ? s.pts + ' نقطة' : '') + '</small>' : '<small class="muted">&nbsp;</small>') +
      '</a>';

    const predHtml = pred ? (
      '<div class="dataPanel" style="padding:14px;margin-top:12px">' +
        '<div class="between"><b>🔮 التوقع الإحصائي</b><span class="lg">بواسون</span></div>' +
        '<div class="prob">' +
          '<span class="pw" style="width:' + pred.w + '%">' + pred.w + '%</span>' +
          '<span class="pd" style="width:' + pred.d + '%">' + pred.d + '%</span>' +
          '<span class="pl" style="width:' + pred.l + '%">' + pred.l + '%</span>' +
        '</div>' +
        '<p class="small" style="margin:6px 0 0">فوز ' + esc(m.home.name) + ' • تعادل • فوز ' + esc(m.away.name) + '<br>' +
        'أرجح نتيجة <b>' + pred.score[0] + ' - ' + pred.score[1] + '</b> • الأهداف المتوقعة ' + pred.xh.toFixed(1) + ' - ' + pred.xa.toFixed(1) + '</p>' +
      '</div>'
    ) : '';

    el.innerHTML =
      '<div class="mHero">' +
        '<div class="mHeroTop">' +
          '<span class="mComp"><a href="#/leagues?l=' + l + '" style="color:inherit">' + esc(LN[l] || l) + '</a>' + (m.md ? ' • الجولة ' + m.md : '') + '</span>' +
          '<span class="mSt ' + (done ? 'done' : live ? 'live' : 'soon') + '" id="mHeroStatus">' + statusTxt + (live ? (typeof liveClockSpan === 'function' ? liveClockSpan(m) : (m.gameTime ? ' ' + m.gameTime + "'" : '')) : '') + '</span>' +
        '</div>' +
        '<div class="mTeams">' +
          teamCol(m.home, A) +
          '<div class="mScore" id="mScoreBox">' + (m.hg != null && m.ag != null ? '<span id="mHomeScore">' + m.hg + '</span><i>-</i><span id="mAwayScore">' + m.ag + '</span>' : '<span class="vsTxt">VS</span>') + '</div>' +
          teamCol(m.away, B) +
        '</div>' +
        '<div class="mMeta">🗓️ ' + esc(dayTxt) + ' • ' + esc(kick) + '</div>' +
        (D && D.live && D.live.stale ? '<div class="muted tiny" id="mLiveNote" style="margin-top:6px">⚠️ نتيجة البطولة من نسخة محفوظة — التفاصيل تحت بتتحدّث من المصدر لو متاح.</div>' : '<div class="muted tiny" id="mLiveNote" style="margin-top:6px"></div>') +
        '<div class="mActions"><button class="btn secondary" type="button" data-share data-share-title="' + esc(m.home.name + ' × ' + m.away.name) + '" data-share-text="مباراة ' + esc(m.home.name) + ' ضد ' + esc(m.away.name) + ' — ' + esc(LN[l]) + ' على SNACES FOOTBALL">🔗 مشاركة المباراة</button></div>' +
      '</div>' +
      fold('📊 مقارنة الفريقين', '<div class="cmpGrid">' +
        '<div class="cmpCell"><small>الترتيب</small><b>' + (A ? A.pos : '—') + '</b><span>' + (B ? B.pos : '—') + '</span></div>' +
        '<div class="cmpCell"><small>النقاط</small><b>' + (A ? A.pts : '—') + '</b><span>' + (B ? B.pts : '—') + '</span></div>' +
        '<div class="cmpCell"><small>مباريات</small><b>' + (A ? A.p : '—') + '</b><span>' + (B ? B.p : '—') + '</span></div>' +
        '<div class="cmpCell"><small>فارق الأهداف</small><b>' + (A ? (A.gd > 0 ? '+' : '') + A.gd : '—') + '</b><span>' + (B ? (B.gd > 0 ? '+' : '') + B.gd : '—') + '</span></div>' +
        '<div class="cmpCell"><small>له / عليه</small><b>' + (A ? A.gf + ' / ' + A.ga : '—') + '</b><span>' + (B ? B.gf + ' / ' + B.ga : '—') + '</span></div>' +
        '<div class="cmpCell wide"><small>آخر 5</small><div class="cmpForm"><b>' + formChips(formOf(D, m.home.id)) + '</b><span>' + formChips(formOf(D, m.away.id)) + '</span></div></div>' +
      '</div>', true) +
      '<div id="mdetail"><div class="skel" style="height:120px"></div></div>' +
      (h2h.length ? fold('🔁 مواجهات مباشرة <small class="muted">(' + h2h.length + ')</small>', '<div class="dataPanel" style="padding:0 10px">' + h2h.slice(0, 6).map(h2hLine).join('') + '</div>', false) : '') +
      fold('📅 آخر مباريات الفريقين', '<div class="two">' +
        '<div class="dataPanel" style="padding:10px"><div class="between" style="margin-bottom:4px"><b>' + esc(m.home.name) + '</b>' + formChips(formOf(D, m.home.id)) + '</div>' + (lastOf(homeId).map(x => shortLine(x, homeId)).join('') || '<div class="row"><span class="muted small">أول مباريات الموسم</span></div>') + '</div>' +
        '<div class="dataPanel" style="padding:10px"><div class="between" style="margin-bottom:4px"><b>' + esc(m.away.name) + '</b>' + formChips(formOf(D, m.away.id)) + '</div>' + (lastOf(awayId).map(x => shortLine(x, awayId)).join('') || '<div class="row"><span class="muted small">أول مباريات الموسم</span></div>') + '</div>' +
      '</div>', false) +
      predHtml +
      navRow +
      '<a class="btn secondary" href="#/leagues?l=' + l + '" style="width:100%;margin-top:12px">رجوع لبطولة ' + esc(LN[l]) + '</a>' +
      (pred ? '<p class="muted tiny" style="text-align:center;margin:10px 0 0">التوقع محسوب من نتائج الموسم الحالي (بواسون) — مش بياخد الإصابات ولا التشكيلة في الحسبان.</p>' : '');

    const detailBox = document.getElementById('mdetail');
    if (!detailBox) return;

    /* ---- تفاصيل حيّة من 365Scores ---- */
    let info = null;
    if (typeof liveMatch === 'function' && LIVE_COMPS[l]) {
      try { info = await liveMatch(l, m.id); } catch (e) { info = null; }
    }
    const g = info && info.game;

    /* تحديث الهيدر من استجابة التفاصيل الأحدث — مش من نسخة البطولة القديمة */
    function paintLive(gg, fetchedAt, isStale) {
      if (!gg || !el.isConnected) return;
      const st = typeof liveStatus === 'function' ? liveStatus(gg) : m.status;
      const hc = gg.homeCompetitor || {}, ac = gg.awayCompetitor || {};
      const hs = typeof liveScore === 'function' ? liveScore(hc.score) : null;
      const as = typeof liveScore === 'function' ? liveScore(ac.score) : null;
      const scored = typeof LIVE_SCORE_STATUS !== 'undefined' && LIVE_SCORE_STATUS.includes(st) && hs != null && as != null;
      m.status = st; m.s = st;
      m.gameTime = gg.gameTime ?? m.gameTime;
      m.gtd = gg.gameTimeDisplay || m.gtd || '';
      m.stx = gg.statusText || gg.shortStatusText || '';
      m.precise = gg.preciseGameTime && Number.isFinite(+gg.preciseGameTime.minutes) ? gg.preciseGameTime : m.precise || null;
      m.preciseAt = Date.now(); m.syncAt = Date.now();
      if (scored) {
        m.hg = hs; m.ag = as;
        const box = document.getElementById('mScoreBox');
        if (box) box.innerHTML = '<span id="mHomeScore">' + hs + '</span><i>-</i><span id="mAwayScore">' + as + '</span>';
      }
      const stEl = document.getElementById('mHeroStatus');
      if (stEl) {
        const label = typeof liveStatusLabel === 'function' ? liveStatusLabel(st) : st;
        stEl.innerHTML = label + (st === 'IN_PLAY' && typeof liveClockSpan === 'function' ? liveClockSpan(m) : '');
        stEl.className = 'mSt ' + (typeof liveStatusDone === 'function' && liveStatusDone(st) ? 'done' : st === 'IN_PLAY' ? 'live' : 'soon');
      }
      const note = document.getElementById('mLiveNote');
      if (note) note.textContent = fetchedAt
        ? (isStale ? '⚠️ المصدر مش متاح — آخر تحديث ناجح: ' : 'آخر تحديث للمباراة من المصدر: ') + new Date(fetchedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '';
    }
    if (g) paintLive(g, info.fetchedAt, info && info.stale);
    if (!g && live) {
      const stEl = document.getElementById('mHeroStatus');
      if (stEl) { stEl.textContent = 'آخر حالة: مباشر'; stEl.className = 'mSt soon'; }
      const note = document.getElementById('mLiveNote');
      if (note) note.textContent = '⚠️ المصدر مش متاح — النتيجة والحالة المعروضة آخر نسخة سليمة، مش محدثة.';
    }

    /* تشكيلة فريق من آخر مباراة (للمباريات اللي لسه ما بدأتش) */
    async function lastLineup(tid, tname) {
      if (typeof liveTeamGames !== 'function' || typeof liveMatch !== 'function') return null;
      try {
        const G = await liveTeamGames(tid);
        const recent = G && G.finished && G.finished[0];
        if (!recent || !LIVE_COMPS[recent.code]) return null;
        const i2 = await liveMatch(recent.code, recent.id);
        const gg = i2 && i2.game;
        if (!gg) return null;
        const comp = [gg.homeCompetitor, gg.awayCompetitor].find(c => c && String(c.id) === String(tid));
        if (!comp || !comp.lineups || !(comp.lineups.members || []).length) return null;
        return { game: gg, comp, label: 'آخر تشكيلة لُعبت: ' + tname + ' × ' + (String(gg.homeCompetitor.id) === String(tid) ? gg.awayCompetitor.name : gg.homeCompetitor.name) + ' — ' + dt(gg.startTime) };
      } catch (e) { return null; }
    }

    const sections = [];
    const addSection = (title, body, open) => { if (body) sections.push(fold(title, body, open)); };

    /* الأحداث */
    if (g) {
      const members = g.members || [];
      const byId = {};
      members.forEach(mm => { byId[mm.id] = mm; });
      const evs = (g.events || []).slice().sort((a, b) => (a.gameTime || 0) - (b.gameTime || 0));
      if (evs.length) {
        const evHtml = evs.map(e => {
          const isHome = String(e.competitorId) === String(g.homeCompetitor && g.homeCompetitor.id);
          const pl = byId[e.playerId] || {};
          const pname = pl.name || '';
          const extra = (e.extraPlayers || []).map(x => byId[x]).filter(Boolean).map(m => (m.athleteId ? '<a href="#/player?id=' + m.athleteId + '&n=' + encodeURIComponent(m.name) + '" style="color:inherit">' + esc(m.name) + '</a>' : esc(m.name))).join('، ');
          const nameLink = pl.athleteId ? '<a href="#/player?id=' + pl.athleteId + '&n=' + encodeURIComponent(pname) + '" style="color:inherit">' + esc(pname) + '</a>' : esc(pname);
          const kind = String(e.eventType.name || '');
          const icon = kind === 'Goal' ? '⚽' : kind === 'Yellow Card' ? '🟨' : kind === 'Red Card' ? '🟥' : kind === 'Substitution' ? '🔄' : kind === 'Penalty' ? '🎯' : '•';
          let desc = nameLink;
          if (kind === 'Goal') desc = nameLink + (extra ? ' <small class="muted">(صنع: ' + extra + ')</small>' : '');
          else if (kind === 'Substitution') desc = '<small class="muted">خرج</small> ' + nameLink + (extra ? ' • <small class="muted">دخل</small> <span class="evIn">' + extra + '</span>' : '');
          else if (e.eventType.subTypeName && e.eventType.subTypeName !== kind) desc = nameLink + ' <small class="muted">(' + esc(evtAr(e.eventType.subTypeName)) + ')</small>';
          const t1 = (e.gameTimeDisplay || (e.gameTime + "'"));
          const sideTeam = isHome ? g.homeCompetitor : g.awayCompetitor;
          return '<div class="evRow' + (isHome ? ' h' : ' a') + '">' +
            (sideTeam && sideTeam.id ? '<img class="evCrest" src="' + esc('https://imagecache.365scores.com/image/upload/f_png,w_40,h_40,c_limit,q_auto:eco/v1/Competitors/' + sideTeam.id) + '" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '<span class="evCrest"></span>') +
            '<span class="evMin">' + esc(t1) + '</span>' +
            '<span class="evIcon">' + icon + '</span>' +
            '<span class="evTxt">' + desc + '</span>' +
          '</div>';
        }).join('');
        const ht = (g.stages || []).find(s => /half/i.test(s.name || '') || s.shortName === 'HT');
        const htRow = ht ? '<div class="htRow">⏱️ نهاية الشوط الأول <b>' + ht.homeCompetitorScore + ' - ' + ht.awayCompetitorScore + '</b></div>' : '';
        addSection('📋 أحداث المباراة <small class="muted">(' + evs.length + ')</small>', '<div class="dataPanel" style="padding:6px 10px">' + evHtml + htRow + '</div>', true);
      }
    }

    /* التشكيلات */
    const luConfirmed = comp => !!comp && comp.lineups && String(comp.lineups.status || '').toLowerCase() === 'confirmed';
    let lineupSource = null;
    if (g && g.hasLineups && (g.homeCompetitor.lineups || g.awayCompetitor.lineups)) {
      lineupSource = {
        game: g, home: g.homeCompetitor, away: g.awayCompetitor,
        label: (luConfirmed(g.homeCompetitor) && luConfirmed(g.awayCompetitor)) ? '' : 'تشكيلة متوقعة — بتتأكد قبل انطلاق المباراة.'
      };
    }
    else {
      const [hl, al] = await Promise.all([lastLineup(homeId, m.home.name), lastLineup(awayId, m.away.name)]);
      if (hl && al && hl.game === al.game) lineupSource = { game: hl.game, home: hl.comp, away: al.comp, label: 'التشكيلة من آخر مباراة لكل فريق (المباراة دي لسه ما بدأتش).' };
      else if (hl || al) lineupSource = { game: (hl || al).game, home: hl && hl.comp, away: al && al.comp, label: 'التشكيلة من آخر مباراة لكل فريق (المباريات دي لسه ما بدأتش).' };
    }

    if (lineupSource) {
      const gg = lineupSource.game;
      const byId = {};
      (gg.members || []).forEach(mm => { byId[mm.id] = mm; });
      const nm = lm => (byId[lm.id] && byId[lm.id].name) || ('#' + lm.id);
      const ath = lm => byId[lm.id] && byId[lm.id].athleteId;
      const shirt = lm => byId[lm.id] && byId[lm.id].jerseyNumber;
      const pImg = a => a ? ('https://imagecache.365scores.com/image/upload/f_png,w_80,h_80,c_limit,q_auto:eco/v1/Athletes/' + a) : '';

      const xiPlayer = (lm, side) => {
        const y = lm.yardFormation || {};
        const line = Number(y.fieldLine);
        const s = Number(y.fieldSide);
        if (!Number.isFinite(line) || !Number.isFinite(s)) return '';
        const top = side === 'home' ? (96 - line * 0.42) : (4 + line * 0.42);
        const left = side === 'home' ? (6 + s * 0.88) : (94 - s * 0.88);
        const a = ath(lm);
        const label = ((byId[lm.id] && (byId[lm.id].shortName || byId[lm.id].name)) || '').split(' ').slice(-1)[0];
        return '<div class="xiP ' + side + '" style="top:' + top.toFixed(1) + '%;left:' + left.toFixed(1) + '%">' +
          (a ? '<img src="' + esc(pImg(a)) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '<img alt="">') +
          '<span class="xiNum">' + (shirt(lm) || '') + '</span>' +
          '<b>' + esc(label) + '</b>' +
        '</div>';
      };

      const starters = (comp, side) => {
        const lu = comp && comp.lineups;
        if (!lu || !(lu.members || []).length) return '';
        return (lu.members || []).filter(x => x.status === 1).map(lm => xiPlayer(lm, side)).join('');
      };

      let pitch = '';
      if (starters(lineupSource.home, 'home') || starters(lineupSource.away, 'away')) {
        pitch = '<div class="xiWrap">' +
          '<div class="xiMid"></div><div class="xiCircle"></div>' +
          '<div class="xiBox top"></div><div class="xiBox bot"></div>' +
          starters(lineupSource.home, 'home') + starters(lineupSource.away, 'away') +
        '</div>' +
        '<div class="xiLegend"><span><i class="dotH"></i>' + esc((lineupSource.home && lineupSource.home.name) || m.home.name) + '</span><span><i class="dotA"></i>' + esc((lineupSource.away && lineupSource.away.name) || m.away.name) + '</span></div>';
      }

      const teamList = (comp) => {
        const lu = comp && comp.lineups;
        if (!lu || !(lu.members || []).length) return '';
        const rows = (arr) => arr.map(lm => {
          const name = nm(lm);
          const a = ath(lm);
          const link = a ? '<a href="#/player?id=' + a + '&n=' + encodeURIComponent(name) + '" style="color:inherit">' + esc(name) + '</a>' : esc(name);
          const rating = lm.ranking ? ' <span class="rate">' + lm.ranking + '</span>' : '';
          const pos = (lm.formation && (lm.formation.shortName || lm.formation.name)) || (lm.position && lm.position.name) || '';
          const num = shirt(lm) || (byId[lm.id] && byId[lm.id].jerseyNumber);
          return '<div class="plRow">' +
            (a ? '<img class="plImg" src="' + esc(pImg(a)) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '<span class="plImg ph">' + esc(String(num || '')) + '</span>') +
            '<span class="plMain">' + link + rating + (num ? ' <small class="muted">#' + esc(String(num)) + '</small>' : '') + '</span>' +
            '<span class="plPos">' + esc(posAr(pos)) + '</span>' +
          '</div>';
        }).join('');
        const st = (lu.members || []).filter(x => x.status === 1);
        const bn = (lu.members || []).filter(x => x.status === 2);
        const ms = (lu.members || []).filter(x => x.status === 3);
        const mg = (lu.members || []).filter(x => x.status === 4);
        return '<div class="dataPanel" style="padding:10px">' +
          '<div class="between" style="margin-bottom:6px"><b>' + esc(comp.name || '') + '</b>' + (lu.formation ? '<span class="lg">' + esc(typeof lu.formation === 'string' ? lu.formation : (lu.formation.name || '')) + '</span>' : '') + '</div>' +
          (st.length ? '<p class="muted tiny" style="margin:0 0 4px">الأساسيون (' + st.length + ')</p>' + rows(st) : '') +
          (bn.length ? '<p class="muted tiny" style="margin:8px 0 4px">البدلاء (' + bn.length + ')</p>' + rows(bn) : '') +
          (ms.length ? '<p class="muted tiny" style="margin:8px 0 4px">الغائبون (' + ms.length + ')</p>' + ms.map(lm => {
            const reason = (lm.suspension && lm.suspension.name) || (lm.injury && lm.injury.name) || '';
            return '<div class="plRow"><span class="plImg ph">✖</span><span class="plMain">' + esc(nm(lm)) + '</span><span class="plPos">' + esc(reason ? evtAr(reason) : '') + '</span></div>';
          }).join('') : '') +
          (mg.length ? '<p class="muted tiny" style="margin:8px 0 4px">الجهاز الفني</p>' + rows(mg) : '') +
        '</div>';
      };

      const body = (pitch ? pitch : '') +
        (lineupSource.label ? '<p class="muted tiny" style="margin:8px 0 0">' + esc(lineupSource.label) + '</p>' : '') +
        '<div class="luGrid" style="margin-top:10px">' + teamList(lineupSource.home) + teamList(lineupSource.away) + '</div>';
      addSection('🏟️ التشكيلات', body, !g || !(g.events || []).length);
    }

    /* الإحصائيات */
    const stats = (info && info.stats) || [];
    if (stats.length) {
      const homeCid = g && g.homeCompetitor && g.homeCompetitor.id;
      const awayCid = g && g.awayCompetitor && g.awayCompetitor.id;
      const H = {}, AW = {};
      stats.forEach(s => {
        if (String(s.competitorId) === String(homeCid)) H[s.name] = s;
        else if (String(s.competitorId) === String(awayCid)) AW[s.name] = s;
      });
      const names = [...new Set(stats.map(s => s.name))];
      const major = names.filter(n => (H[n] && H[n].isMajor) || (AW[n] && AW[n].isMajor));

      const statRow = n => {
        const h = H[n], a = AW[n];
        const hv = h ? h.value : '—', av = a ? a.value : '—';
        const hn = statNum(hv), an = statNum(av);
        let bars = '';
        if (hn != null && an != null && (hn + an) > 0) {
          const hp = Math.round(hn / (hn + an) * 100), ap = 100 - hp;
          bars = '<div class="sb"><i class="sbH" style="width:' + hp + '%"></i></div>' +
                 '<div class="sb"><i class="sbA" style="width:' + ap + '%"></i></div>';
        }
        return '<div class="stRow">' +
          '<div class="stTop"><b>' + esc(hv) + '</b><span>' + esc(statAr(n)) + '</span><b>' + esc(av) + '</b></div>' +
          bars +
        '</div>';
      };

      let body = '';
      if (major.length) body += '<div class="dataPanel" style="padding:12px 14px">' + major.map(statRow).join('') + '</div>';

      /* باقي الإحصائيات مجمّعة */
      const cats = [];
      names.filter(n => !major.includes(n)).forEach(n => {
        const c = (H[n] && H[n].categoryName) || (AW[n] && AW[n].categoryName) || STAT_CAT[String(n).toLowerCase()] || 'أخرى';
        let box = cats.find(x => x.name === c);
        if (!box) { box = { name: c, items: [] }; cats.push(box); }
        box.items.push(n);
      });
      cats.sort((x, y) => (x.name === 'أخرى' ? 1 : 0) - (y.name === 'أخرى' ? 1 : 0));
      if (cats.length) {
        body += cats.map(c => '<details class="fold"><summary><h2>' + esc(statAr(c.name)) + ' <small class="muted">(' + c.items.length + ')</small></h2></summary>' +
          '<div class="foldBody"><div class="dataPanel" style="padding:12px 14px">' + c.items.map(statRow).join('') + '</div></div></details>').join('');
      }
      addSection('📊 الإحصائيات <small class="muted">(' + names.length + ')</small>', body, !major.length);
    }

    /* أفضل اللاعبين */
    const tp = g && g.topPerformers;
    if (tp && Array.isArray(tp.categories) && tp.categories.length) {
      const catAr = { attacker: 'أفضل مهاجم', midfielder: 'أفضل لاعب وسط', defender: 'أفضل مدافع', goalkeeper: 'أفضل حارس' };
      const body = tp.categories.map(c => {
        const cell = p => {
          if (!p || !p.name) return '';
          const a = p.athleteId;
          const link = a ? '<a href="#/player?id=' + a + '&n=' + encodeURIComponent(p.name) + '" style="color:inherit">' + esc(p.name) + '</a>' : esc(p.name);
          const st = (p.stats || []).filter(s => s && !/[:]/.test(String(s.name || ''))).map(s => '<span class="tpStat">' + esc(statAr(s.name)) + ' <b>' + esc(s.value) + '</b></span>').join('');
          return '<div class="tpCell">' +
            (a ? '<img src="' + esc(pImg2(a)) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '') +
            '<div><b>' + link + '</b><small class="muted">' + esc(posAr(p.positionName)) + '</small><div class="tpStats">' + st + '</div></div>' +
          '</div>';
        };
        const hc = cell(c.homePlayer), ac = cell(c.awayPlayer);
        if (!hc && !ac) return '';
        return '<div class="dataPanel" style="padding:10px;margin-bottom:8px">' +
          '<div class="tpTitle">' + esc(catAr[String(c.name || '').toLowerCase()] || c.name) + '</div>' +
          '<div class="two">' + hc + ac + '</div>' +
        '</div>';
      }).join('');
      addSection(done || live ? '⭐ أفضل لاعبي المباراة' : '⭐ أبرز لاعبي الفريقين', body, false);
    }

    /* معلومات المباراة */
    const infoRows = [];
    if (g) {
      if (g.venue && g.venue.name) infoRows.push('<div class="row"><span>🏟️ الملعب</span><span class="side"><b>' + esc(g.venue.name) + '</b></span></div>');
      if (g.venue && g.venue.capacity) infoRows.push('<div class="row"><span>👥 سعة الملعب</span><span class="side"><b>' + g.venue.capacity.toLocaleString('ar-EG') + '</b></span></div>');
      if (g.venue && g.venue.attendance) infoRows.push('<div class="row"><span>🎟️ الحضور</span><span class="side"><b>' + g.venue.attendance.toLocaleString('ar-EG') + '</b></span></div>');
      if (g.officials && g.officials[0] && g.officials[0].name) infoRows.push('<div class="row"><span>⚖️ الحكم</span><span class="side"><b>' + esc(g.officials[0].name) + '</b></span></div>');
      if (g.gameTime) infoRows.push('<div class="row"><span>⏱️ وقت اللعب</span><span class="side"><b>' + g.gameTime + "'</b></span></div>");
    }
    if (m.md) infoRows.push('<div class="row"><span>🔢 الجولة</span><span class="side"><b>' + m.md + '</b></span></div>');
    infoRows.push('<div class="row"><span>📅 التاريخ</span><span class="side"><b>' + esc(dayTxt) + ' • ' + esc(kick) + '</b></span></div>');
    infoRows.push('<div class="row"><span>🏆 البطولة</span><span class="side"><b>' + esc(LN[l] || l) + '</b></span></div>');
    addSection('ℹ️ معلومات المباراة', '<div class="dataPanel">' + infoRows.join('') + '</div>', false);

    detailBox.innerHTML = sections.join('');
    if (!sections.length) detailBox.innerHTML = '';

    /* مباراة شغالة: الهيدر يتحدّث كل 30 ثانية، وإعادة رسم كاملة عند تغيّر الحالة */
    const initialStatus = g ? (typeof liveStatus === 'function' ? liveStatus(g) : m.status) : m.status;
    const arm = ms => {
      stopMatchTimer();
      if (document.visibilityState !== 'visible') return;
      MATCH_TIMER = setTimeout(async () => {
        MATCH_TIMER = null;
        const cur = parseHash();
        if (cur.path !== 'match' || String(cur.q.id) !== String(q.id) || !el.isConnected || document.visibilityState !== 'visible') return;
        let next = null;
        try { next = await liveMatch(l, m.id, true); } catch (e) { next = null; }
        const cur2 = parseHash();
        if (cur2.path !== 'match' || String(cur2.q.id) !== String(q.id) || !el.isConnected) return;
        const gg = next && next.game;
        if (!gg) {
          const note = document.getElementById('mLiveNote');
          if (note) note.textContent = '⚠️ تعذّر تحديث تفاصيل المباراة من المصدر — النتيجة المعروضة آخر نسخة سليمة.';
          arm(60000);
          return;
        }
        paintLive(gg, next.fetchedAt, next.stale);
        const ns = typeof liveStatus === 'function' ? liveStatus(gg) : m.status;
        if (ns !== initialStatus) {
          const y = window.scrollY;
          await render();
          try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); }
          return;
        }
        arm(ns === 'IN_PLAY' ? 30000 : 90000);
      }, ms);
    };
    if (initialStatus === 'IN_PLAY') arm(30000);
  }
});

function pImg2(a) {
  return a ? ('https://imagecache.365scores.com/image/upload/f_png,w_80,h_80,c_limit,q_auto:eco/v1/Athletes/' + a) : '';
}
