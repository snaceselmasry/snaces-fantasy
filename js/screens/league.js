'use strict';
/* ============================================================
   صفحة البطولة المستقلة — #/league?l=CODE
   ترتيب • مباريات • أدوار إقصائية بالرسم • هدافين • تحليل • سجل
   ============================================================ */

const STAGE_AR = [
  [/^final$/i, 'النهائي'],
  [/semi[- ]?finals?/i, 'نصف النهائي'],
  [/quarter[- ]?finals?/i, 'ربع النهائي'],
  [/round of 16/i, 'دور الـ16'],
  [/round of 32/i, 'دور الـ32'],
  [/round of 64/i, 'دور الـ64'],
  [/1st qualifying/i, 'التأهيل الأول'],
  [/2nd qualifying/i, 'التأهيل الثاني'],
  [/3rd qualifying/i, 'التأهيل الثالث'],
  [/4th qualifying/i, 'التأهيل الرابع'],
  [/play[- ]?offs?/i, 'الملحق'],
  [/group stage/i, 'دور المجموعات'],
  [/round of (\d+)/i, 'دور الـ$1'],
  [/^(\d+)(?:st|nd|rd|th) round$/i, 'الدور $1'],
  [/^round (\d+)$/i, 'الجولة $1'],
  [/^round$/i, 'دور'],
  [/knockout/i, 'الأدوار الإقصائية'],
  [/league phase/i, 'دور الدوري'],
  [/qualifying/i, 'التأهيل']
];
const stageAr = s => {
  const t = String(s || '');
  for (const [re, ar] of STAGE_AR) if (re.test(t)) return t.replace(re, ar);
  return t;
};
const AR_WORDS = {
  "United States": "الولايات المتحدة", "Saudi Arabia": "السعودية", "United Arab Emirates": "الإمارات",
  "South America": "أمريكا الجنوبية", "North America": "أمريكا الشمالية", "Women's": "السيدات",
  England: "إنجلترا", Spain: "إسبانيا", Italy: "إيطاليا", Germany: "ألمانيا", France: "فرنسا",
  Portugal: "البرتغال", Netherlands: "هولندا", Turkey: "تركيا", Brazil: "البرازيل", Egypt: "مصر",
  Morocco: "المغرب", Tunisia: "تونس", Algeria: "الجزائر", Qatar: "قطر", Jordan: "الأردن",
  Iraq: "العراق", Mexico: "المكسيك", Argentina: "الأرجنتين", Colombia: "كولومبيا",
  Africa: "أفريقيا", Asia: "آسيا", Europe: "أوروبا", International: "دولي"
};
function arTxt(s) {
  if (!s) return '';
  let t = String(s)
    .replace(/\b(\d+)(?:st|nd|rd|th) title\b/gi, "اللقب $1")
    .replace(/\btitles?\b/gi, "لقب")
    .replace(/\bsince\b/gi, "منذ")
    .replace(/\beach\b/gi, "لكل")
    .replace(/\bno break\b/gi, "")
    .replace(/Lang\|[a-z-]+\|/gi, "")
    .replace(/\|italic=no/gi, "")
    .replace(/\|(?:es|en|fr|de|it|pt|ar)=?\|?/g, " ")
    .replace(/\{\{|\}\}/g, " ");
  Object.keys(AR_WORDS).sort((a, b) => b.length - a.length).forEach(k => { t = t.split(k).join(AR_WORDS[k]); });
  return t.replace(/\s+/g, " ").trim();
}
const SCOPE_AR = { domestic: 'بطولة محلية', continental: 'بطولة قارية', world: 'بطولة عالمية', women: 'كرة القدم للسيدات' };

/* هوية بصرية لكل بطولة: لونان + أيقونة + زخرفة + الاسم اللاتيني */
const COMP_VISUAL = {
  PL: ['#3d195b', '#00ff87', '🦁', 'crown', 'Premier League'],
  PD: ['#c8102e', '#ffc400', '🏆', 'dots', 'LaLiga'],
  SA: ['#0068a8', '#ffffff', '⚽', 'stripes', 'Serie A'],
  BL1: ['#d20515', '#ffffff', '🛡️', 'grid', 'Bundesliga'],
  FL1: ['#091c3e', '#dae025', '⚽', 'diagonal', 'Ligue 1'],
  CL: ['#0b1a4a', '#f5c542', '🏆', 'stars', 'UEFA Champions League'],
  UEL: ['#f36c21', '#111111', '🏆', 'rings', 'UEFA Europa League'],
  UECL: ['#00a651', '#111111', '🏆', 'diagonal', 'UEFA Conference League'],
  ELC: ['#1d2b53', '#f5c542', '🏅', 'stripes', 'Championship'],
  FACUP: ['#c8102e', '#ffffff', '🏆', 'crown', 'FA Cup'],
  EFLCP: ['#c8102e', '#ffffff', '🏆', 'rings', 'EFL Cup'],
  CDR: ['#c60b1e', '#ffc400', '👑', 'dots', 'Copa del Rey'],
  COPPA: ['#0068a8', '#ffffff', '🏆', 'rings', 'Coppa Italia'],
  DFBP: ['#111111', '#d20515', '🏆', 'grid', 'DFB Pokal'],
  CDFR: ['#091c3e', '#dae025', '🏆', 'stripes', 'Coupe de France'],
  TACAP: ['#006600', '#ffffff', '🛡️', 'diagonal', 'Taça de Portugal'],
  EGY: ['#c8102e', '#ffffff', '🏆', 'stripes', 'Egyptian Premier League'],
  SAU: ['#006c35', '#ffffff', '🏆', 'grid', 'Saudi Pro League'],
  MAR: ['#c1272d', '#006233', '🏆', 'stars', 'Botola Pro'],
  TUN: ['#e70013', '#ffffff', '🏆', 'rings', 'Ligue 1 Tunisie'],
  ALG: ['#006233', '#d21034', '🏆', 'diagonal', 'Ligue 1 Algérie'],
  UAE: ['#00732f', '#ff0000', '🏆', 'stripes', 'UAE Pro League'],
  QAT: ['#8a1538', '#ffffff', '🏆', 'crown', 'Qatar Stars League'],
  AFCON: ['#00a651', '#f5c542', '🌍', 'stars', 'Africa Cup of Nations'],
  CAFCL: ['#f5a623', '#111111', '🌍', 'rings', 'CAF Champions League'],
  ASIAN: ['#0b3d91', '#f5c542', '🌍', 'dots', 'AFC Asian Cup'],
  ACL: ['#0b3d91', '#f5c542', '🌍', 'stripes', 'AFC Champions League'],
  WC: ['#8a1538', '#f5c542', '🌍', 'stars', 'FIFA World Cup'],
  WWC: ['#8a1538', '#f5c542', '👩', 'dots', 'FIFA Women\u2019s World Cup'],
  CWC: ['#0b1a4a', '#c9a227', '🌍', 'rings', 'FIFA Club World Cup'],
  WSL: ['#3d195b', '#00ff87', '👩', 'crown', 'Women\u2019s Super League'],
  MLS: ['#1c2c5b', '#c8102e', '⚽', 'stripes', 'Major League Soccer'],
  LMX: ['#006847', '#ce1126', '⚽', 'grid', 'Liga MX'],
  ARG: ['#75aadb', '#ffffff', '⚽', 'diagonal', 'Liga Profesional'],
  BSA: ['#009c3b', '#ffdf00', '⚽', 'crown', 'Brasileirão'],
  DED: ['#ff6a00', '#ffffff', '⚽', 'grid', 'Eredivisie'],
  PPL: ['#006600', '#ffffff', '⚽', 'stripes', 'Primeira Liga'],
  TSL: ['#e30a17', '#ffffff', '⚽', 'stars', 'Süper Lig']
};
const COMP_COUNTRY = {
  'إنجلترا': ['#3d195b', '#00ff87', '🦁'], 'إسبانيا': ['#c60b1e', '#ffc400', '🏆'],
  'إيطاليا': ['#0068a8', '#ffffff', '🛡️'], 'ألمانيا': ['#111111', '#d20515', '🛡️'],
  'فرنسا': ['#091c3e', '#dae025', '⚽'], 'مصر': ['#c8102e', '#ffffff', '🏆'],
  'السعودية': ['#006c35', '#ffffff', '🏆'], 'المغرب': ['#c1272d', '#006233', '🏆'],
  'تونس': ['#e70013', '#ffffff', '🏆'], 'الجزائر': ['#006233', '#d21034', '🏆'],
  'الإمارات': ['#00732f', '#ff0000', '🏆'], 'قطر': ['#8a1538', '#ffffff', '🏆'],
  'البرازيل': ['#009c3b', '#ffdf00', '⚽'], 'الأرجنتين': ['#75aadb', '#ffffff', '⚽'],
  'البرتغال': ['#006600', '#ffffff', '⚽'], 'هولندا': ['#ff6a00', '#ffffff', '⚽'],
  'تركيا': ['#e30a17', '#ffffff', '⚽']
};
const COMP_PATTERNS = ['stripes', 'dots', 'grid', 'diagonal', 'rings', 'stars', 'crown'];
function compVisual(code, sc, ctry) {
  const v = COMP_VISUAL[code];
  if (v) return { c1: v[0], c2: v[1], icon: v[2], pattern: v[3], tag: v[4] };
  let h = 0;
  for (const ch of String(code)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const pattern = COMP_PATTERNS[h % COMP_PATTERNS.length];
  const cv = COMP_COUNTRY[ctry];
  if (cv) return { c1: cv[0], c2: cv[1], icon: cv[2], pattern, tag: code };
  const icon = sc === 'women' ? '👩' : sc === 'continental' ? '🏆' : sc === 'world' ? '🌍' : '🛡️';
  const c1 = `hsl(${h} 52% 27%)`, c2 = `hsl(${(h + 42) % 360} 74% 60%)`;
  return { c1, c2, icon, pattern, tag: code };
}

/* البطولات المرتبطة بنفس البلد/النطاق */
function relatedComps(code) {
  const sc = scopeOf(code);
  let list = [];
  if (sc === 'women') {
    const c = WOMEN_COUNTRY[code];
    list = c ? (WOMEN_DOMESTIC[c] || []) : [...WOMEN_CONTINENTAL, ...WOMEN_WORLD];
  } else if (sc === 'domestic') {
    list = compsOfCountry(countryOf(code));
  } else if (sc === 'continental') {
    list = [...CONTINENTAL, ...CONTINENTAL_SUPERS, ...NT_CONTINENTAL];
  } else {
    list = [...WORLD_CLUB, ...WORLD_NT, ...YOUTH];
  }
  return [...new Set(list)].filter(c => c !== code && LN[c]);
}

screen('league', {
  title: 'البطولة', tab: 'leagues', back: true,
  async render(q, el) {
    const code = LN[q.l] ? q.l : 'PL';
    const name = LN[code] || code;
    $('#screenTitle').textContent = name;
    store.set('snaces_league', code);

    const sc = scopeOf(code);
    const ctry = countryOf(code);
    const flag = COUNTRY_FLAG[ctry] || (WOMEN_SET.has(code) ? '👩' : '');
    let D = null, mode = '', fxView = 'next', expanded = false, tableExpanded = false, SC_LIVE = null;

    const hasTable = d => !!(d && d.standings && d.standings.length);
    const hasMatches = d => !!(d && d.matches && d.matches.length);
    const stageGroups = () => {
      const ms = ((D && D.matches) || []).filter(m => m.stage);
      const map = new Map();
      ms.forEach(m => {
        const k = m.stageNum == null ? 0 : m.stageNum;
        if (!map.has(k)) map.set(k, { k, name: m.stage, ms: [] });
        map.get(k).ms.push(m);
      });
      return [...map.values()].sort((a, b) => a.k - b.k);
    };

    const V = compVisual(code, sc, ctry);
    el.innerHTML = `
      <div class="dataPanel lgHead lgId" data-comp="${esc(code)}" data-pattern="${V.pattern}" style="--c1:${V.c1};--c2:${V.c2};padding:14px;margin-bottom:10px">
        <span class="lgIdGlow" aria-hidden="true"></span><span class="lgMark" aria-hidden="true">${V.icon}</span>
        <div class="lgTitle"><b>${flag} ${esc(name)}</b><span class="pill">${SCOPE_AR[sc]}</span></div>
        <div class="lgMeta"><span class="lgTag">${esc(V.tag)}</span>${[ctry, (D && D.standings && D.standings.length) ? D.standings.length + ' فريق' : ''].filter(Boolean).map(esc).join(' • ') ? ' • ' + [ctry, (D && D.standings && D.standings.length) ? D.standings.length + ' فريق' : ''].filter(Boolean).map(esc).join(' • ') : ''}</div>
        <div class="chips" style="margin-top:8px">
          <button class="btn secondary" type="button" id="lgFollow">${typeof ACC !== 'undefined' && (ACC.inFav ? ACC.inFav('c', code) : ACC.isFollowed(code)) ? '⭐ في المفضلة' : '☆ متابعة'}</button>
          <a class="btn secondary" href="#/${sc === 'women' ? 'women' : sc === 'domestic' ? 'leagues' : sc}">كل البطولات ›</a>
        </div>
        <div class="chips" id="lgSib" style="margin-top:8px"></div>
      </div>
      <div class="cmpBar" id="modebar" style="margin-bottom:10px"></div>
      <div id="lgb"></div>`;

    const sib = $('#lgSib', el);
    const rel = relatedComps(code).slice(0, 10);
    sib.innerHTML = rel.length
      ? `<span class="muted tiny" style="align-self:center">بطولات مرتبطة:</span>` +
        rel.map(c => `<a class="btn secondary" style="font-size:12px;padding:4px 8px" href="#/league?l=${c}">${esc(LN[c])}</a>`).join('')
      : '';

    const fb = $('#lgFollow', el);
    fb.onclick = () => {
      const on = ACC.inFav ? ACC.toggleFav('c', code) : ACC.toggleFollow(code);
      fb.textContent = on ? '⭐ في المفضلة' : '☆ متابعة';
      toast(on ? 'اتضافت ' + name + ' للمفضلة ⭐' : 'شيلنا ' + name + ' من المفضلة');
    };

    const modebar = $('#modebar', el), body = $('#lgb', el);

    function modesFor(d) {
      const m = [];
      if (hasTable(d)) m.push(['table', 'الترتيب']);
      if (hasMatches(d)) m.push(['matches', 'المباريات']);
      if (stageGroups().length > 1 || (!hasTable(d) && stageGroups().length)) m.push(['bracket', 'الأدوار الإقصائية']);
      if ((d && d.scorers && d.scorers.length) || LIVE_COMPS[code]) m.push(['scorers', 'الهدافين']);
      if (hasTable(d)) m.push(['analysis', 'تحليل']);
      m.push(['info', 'السجل والمعلومات']);
      return m;
    }

    function paintModes() {
      const modes = modesFor(D);
      if (!modes.some(m => m[0] === mode)) mode = modes.length ? modes[0][0] : 'info';
      modebar.innerHTML = modes.map(([k, n]) =>
        `<button class="btn ${k === mode ? 'primary' : 'secondary'}" type="button" data-m="${k}">${n}</button>`).join('');
    }

    /* ---------- الرسم: الأدوار الإقصائية ---------- */
    function bracket() {
      const gs = stageGroups();
      if (!gs.length) return emptyBox('الأدوار الإقصائية مش متاحة للبطولة دي حاليًا.');
      const byDate = ms => ms.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      const mCard = m => {
        const fin = m.status === 'FINISHED';
        const wh = fin && m.hg > m.ag, wa = fin && m.ag > m.hg;
        return `<a class="brCard" href="#/match?l=${code}&id=${m.id}">
          <div class="brRow${wh ? ' win' : ''}">${crest(m.home.crest)}<span>${esc(m.home.name)}</span><b>${fin ? m.hg : '—'}</b></div>
          <div class="brRow${wa ? ' win' : ''}">${crest(m.away.crest)}<span>${esc(m.away.name)}</span><b>${fin ? m.ag : '—'}</b></div>
        </a>`;
      };
      const note = `<p class="muted tiny" style="margin:8px 4px">* ${gs.length} مرحلة رسمية. اسحب يمين/شمال لو الرسم أوسع من الشاشة.</p>`;

      /* مرحلة واحدة: كروت في شبكة مرتبة (مفيش شجرة ممكن ترسم) */
      if (gs.length === 1) {
        const ms = byDate(gs[0].ms);
        return `<div class="brHead" style="margin-bottom:8px">${esc(stageAr(gs[0].name))}</div>
          <div class="brGrid">${ms.map(mCard).join('')}</div>${note}`;
      }

      /* شجرة من الجهتين: الأدوار بتتفرّع من برّه لحد النهائي في النص */
      const stages = gs.slice(-5);
      const side = stages.slice(0, -1);
      const fin = stages[stages.length - 1];
      /* لو آخر مرحلة مش نهائي (مثلاً أدوار تأهيلية) نعرضها كمراحل متتالية */
      const fnm = String(fin.name || '');
      const isFinal = (/final/i.test(fnm) && !/semi|1\/2|half/i.test(fnm)) ||
        (/النهائي\s*$/.test(fnm) && !/نصف|ربع/.test(fnm));
      const finOk = isFinal && byDate(fin.ms).length <= 2;
      if (!finOk) {
        return `<div class="bracket">` + stages.map(g => `
          <div class="brCol">
            <div class="brHead">${esc(stageAr(g.name))}</div>
            <div class="brBody">${byDate(g.ms).map(mCard).join('')}</div>
          </div>`).join('') + `</div>${note}`;
      }
      const half = ms => { const h = Math.ceil(ms.length / 2); return [byDate(ms).slice(0, h), byDate(ms).slice(h)]; };
      const halves = side.map(g => half(g.ms));
      const col = (ms, name, sideCls, isFinal) => ms.length ? `
        <div class="brCol${isFinal ? ' f' : ''}${sideCls ? ' ' + sideCls : ''}">
          <div class="brHead">${isFinal ? '🏆 ' : ''}${esc(stageAr(name))}</div>
          <div class="brBody">${ms.map(mCard).join('')}</div>
        </div>` : '';

      const leftCols = halves.map((h, i) => col(h[0], side[i].name, 'sb l')).filter(Boolean);
      const rightCols = halves.slice().reverse().map((h, i) => col(h[1], side[side.length - 1 - i].name, 'sb r')).filter(Boolean);
      /* فراغات بتحافظ على النهائي في نص الشاشة لو جهة فيها مراحل أقل */
      const sp = `<div class="brCol sp" aria-hidden="true"></div>`;
      const fill = n => sp.repeat(Math.max(0, n));
      const nL = leftCols.length, nR = rightCols.length;
      const left = leftCols.join('') + fill(nR - nL);
      const right = fill(nL - nR) + rightCols.join('');
      return `<div class="bracket two" dir="ltr">${left}${col(byDate(fin.ms), fin.name, '', true)}${right}</div>${note}`;
    }

    /* ---------- الترتيب ---------- */
    function table() {
      const n = D.standings.length;
      const relFrom = n > 12 ? n - 2 : n;
      const limit = tableExpanded ? n : Math.min(8, n);
      let lastGroup = null;
      const rows = D.standings.slice(0, limit).map(r => {
        let head = '';
        if (r.group && r.group !== lastGroup) {
          lastGroup = r.group;
          head = `<tr><td colspan="9" style="text-align:right;font-weight:800;padding:10px 8px;background:rgba(255,255,255,.04)">${esc(r.group)}</td></tr>`;
        }
        return head + `
        <tr>
          <td><span class="pos ${r.pos <= 4 ? 'top' : r.pos >= relFrom ? 'rel' : ''}">${r.pos}</span></td>
          <td style="text-align:right;font-weight:700"><a href="#/team?l=${code}&id=${r.team.id}&n=${encodeURIComponent(r.team.name)}" style="color:inherit">${crest(r.team.crest)}${esc(r.team.name)}</a></td>
          <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
          <td>${r.gd > 0 ? '+' : ''}${r.gd}</td>
          <td><b>${r.pts}</b>${r.ded ? '<sup title="نقاط بعد خصم">*</sup>' : ''}</td>
          <td>${formChips(formOf(D, r.team.id))}</td>
        </tr>`;
      }).join('');
      const anyDed = D.standings.some(r => r.ded);
      return `<div class="dataPanel"><div class="tableWrap"><table style="min-width:540px">
        <thead><tr><th>#</th><th style="text-align:right">الفريق</th><th>لعب</th><th>ف</th><th>ت</th><th>خ</th><th>+/-</th><th>نقاط</th><th>آخر 5</th></tr></thead>
        <tbody>${rows}</tbody></table></div></div>
        ${n > 8 ? `<div style="text-align:center;margin-top:8px"><button class="btn secondary" type="button" data-more-table="1">${tableExpanded ? 'إظهار أقل' : 'المزيد (' + (n - 8) + ')'}</button></div>` : ''}
        ${anyDed ? '<p class="muted tiny" style="margin:6px 4px">* نقاط بعد خصم إداري</p>' : ''}`;
    }

    /* ---------- المباريات ---------- */
    function matches() {
      const all = D.matches || [];
      const upcoming = all.filter(m => !['FINISHED', 'CANCELLED', 'POSTPONED', 'SUSPENDED'].includes(m.status));
      if (fxView === 'next' && !upcoming.length && finOf(D).length) fxView = 'res';
      const lim = expanded ? 30 : 8;
      const filtered = fxView === 'next'
        ? upcoming.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
        : finOf(D).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      const list = filtered.slice(0, lim);
      const rows = list.map(m => {
        const isLive = m.s === 'IN_PLAY' || m.status === 'IN_PLAY';
        const score = isLive && m.hg != null && m.ag != null ? `<b class="green">${m.hg} - ${m.ag}</b>`
          : fxView === 'res' ? `<b>${m.hg} - ${m.ag}</b>` : '<span class="muted">ضد</span>';
        const badge = isLive
          ? (typeof liveClockHtml === 'function' ? liveClockHtml(m) : '<span class="liveBadge">مباشر</span>')
          : dt(m.date);
        return `
        <a class="row" href="#/match?l=${code}&id=${m.id}">
          <span>${crest(m.home.crest)}${esc(m.home.name)}
            ${score}
            ${crest(m.away.crest)}${esc(m.away.name)}</span>
          <span class="side">${badge}<span class="lg">${m.stage ? esc(stageAr(m.stage)) : 'تحليل'}</span></span>
        </a>`;
      }).join('');
      return `<div class="cmpBar" style="margin-bottom:8px">
          <button class="btn ${fxView === 'next' ? 'primary' : 'secondary'}" type="button" data-fx="next">القادمة</button>
          <button class="btn ${fxView === 'res' ? 'primary' : 'secondary'}" type="button" data-fx="res">النتائج</button>
        </div>
        <div class="dataPanel">${rows || '<div class="empty">لا توجد مباريات.</div>'}</div>
        ${filtered.length > lim || expanded ? `<div style="text-align:center;margin-top:8px"><button class="btn secondary" type="button" data-more-matches="1">${expanded ? 'إظهار أقل' : 'المزيد (' + (filtered.length - lim) + ')'}</button></div>` : ''}`;
    }

    /* ---------- الهدافين ---------- */
    function scorers(live) {
      const teamOf = id => {
        const r = (D.standings || []).find(x => String(x.team.id) === String(id));
        return r ? r.team.name : '';
      };
      const sl = expanded ? 20 : 5;
      let g, a;
      if (live && (live.goals.length || live.assists.length)) {
        g = live.goals.slice(0, sl).map(x => ({ name: x.name, team: teamOf(x.teamId), goals: x.value }));
        a = live.assists.slice(0, sl).map(x => ({ name: x.name, team: teamOf(x.teamId), assists: x.value }));
      } else {
        const sc = D.scorers || [];
        g = sc.slice().sort((x, y) => num(y.goals) - num(x.goals)).slice(0, sl);
        a = sc.filter(s => num(s.assists) > 0).sort((x, y) => num(y.assists) - num(x.assists)).slice(0, sl);
      }
      const tbl = (rows, col, label) => `<div class="tableWrap"><table style="min-width:260px">
        <thead><tr><th>#</th><th style="text-align:right">اللاعب</th><th>${label}</th></tr></thead>
        <tbody>${rows.length ? rows.map((s, i) => `<tr><td>${i + 1}</td>
          <td style="text-align:right"><b>${esc(s.name)}</b><br><small class="muted">${esc(s.team || '')}</small></td>
          <td><b>${s[col]}</b></td></tr>`).join('') : '<tr><td colspan="3" class="empty">البيانات دي مش متاحة.</td></tr>'}</tbody>
      </table></div>`;
      return `<div class="two">
        <div class="dataPanel"><div class="dataTop"><b>⚽ الهدافين</b></div>${tbl(g, 'goals', 'أهداف')}</div>
        <div class="dataPanel"><div class="dataTop"><b>🅰️ صناعة</b></div>${tbl(a, 'assists', 'صناعة')}</div>
      </div>`;
    }

    /* ---------- تحليل ---------- */
    function analysis() {
      const opts = D.standings.map(r => `<option value="${r.team.id}">${esc(r.team.name)}</option>`).join('');
      return `<div class="dataPanel" style="padding:14px">
        <p class="muted small" style="margin:0 0 10px">اختر فريقين وشوف التوقع الإحصائي (نموذج بواسون من نتائج الموسم).</p>
        <div class="vs">
          <select class="control" id="t1" style="flex:1;min-width:0">${opts}</select>
          <b>ضد</b>
          <select class="control" id="t2" style="flex:1;min-width:0">${opts}</select>
        </div>
        <button class="btn primary" id="goAna" type="button" style="margin-top:10px;width:100%">حلل المباراة</button>
        <div id="anaOut" style="margin-top:12px"></div>
      </div>
      <div class="disclaimer" style="margin-top:12px">التوقع تقدير إحصائي من نتائج الموسم الحالي، مش بياخد الإصابات ولا التشكيلة في الحسبان، وما هواش ضمان لأي نتيجة.</div>`;
    }

    function wireAnalysis() {
      const t1 = $('#t1', el), t2 = $('#t2', el), out = $('#anaOut', el);
      if (!t1 || !t2) return;
      if (D.standings[1]) t2.value = D.standings[1].team.id;
      $('#goAna', el).onclick = () => {
        const A = D.standings.find(r => String(r.team.id) === t1.value);
        const B = D.standings.find(r => String(r.team.id) === t2.value);
        if (!A || !B || A.team.id === B.team.id) { out.innerHTML = '<p class="muted small">اختر فريقين مختلفين.</p>'; return; }
        const p = predictMatch(D, A.team.id, B.team.id);
        if (!p) { out.innerHTML = '<p class="muted small">عدد المباريات لسه قليل للتحليل.</p>'; return; }
        out.innerHTML = `
          <div class="prob">
            <span class="pw" style="width:${p.w}%">${p.w}%</span>
            <span class="pd" style="width:${p.d}%">${p.d}%</span>
            <span class="pl" style="width:${p.l}%">${p.l}%</span>
          </div>
          <p class="small" style="margin:6px 0">
            فوز ${esc(A.team.name)} • تعادل • فوز ${esc(B.team.name)}<br>
            أرجح نتيجة <b>${p.score[0]} - ${p.score[1]}</b> • الأهداف المتوقعة ${p.xh.toFixed(1)} - ${p.xa.toFixed(1)}
          </p>
          <div class="tableWrap"><table class="cmpTbl" style="min-width:0"><tbody>
            <tr><td>${A.pos}</td><td class="muted">الترتيب</td><td>${B.pos}</td></tr>
            <tr><td>${A.pts}</td><td class="muted">النقاط</td><td>${B.pts}</td></tr>
            <tr><td>${A.gd}</td><td class="muted">فارق الأهداف</td><td>${B.gd}</td></tr>
            <tr><td>${formChips(formOf(D, A.team.id))}</td><td class="muted">آخر 5</td><td>${formChips(formOf(D, B.team.id))}</td></tr>
          </tbody></table></div>`;
      };
    }

    /* ---------- السجل والمعلومات ---------- */
    async function info() {
      const inf = await leagueInfo(code).catch(() => null);
      const st = (D && D.standings) || [];
      const leader = st[0];
      const mostWins = st.slice().sort((a, b) => b.w - a.w)[0];
      const bestDef = st.slice().sort((a, b) => a.ga - b.ga)[0];
      const topSc = ((D && D.scorers) || []).slice().sort((a, b) => num(b.goals) - num(a.goals))[0];
      const finished = finOf(D || {});
      let biggest = null;
      finished.forEach(m => {
        const diff = Math.abs(m.hg - m.ag);
        if (!biggest || diff > biggest.diff) biggest = { m, diff };
      });
      const avg = finished.length ? (finished.reduce((s, m) => s + m.hg + m.ag, 0) / finished.length).toFixed(2) : '—';
      const row = (label, value) => `<tr><td class="muted">${label}</td><td style="text-align:left;font-weight:700">${value}</td></tr>`;
      const hist = inf ? [
        inf.champions ? row('بطل النسخة الأخيرة', esc(arTxt(inf.champions)) + (inf.season ? ' <small class="muted">(' + esc(arTxt(inf.season)) + ')</small>' : '')) : '',
        inf.mostSuccessful ? row('أكثر فريق فاز', esc(arTxt(inf.mostSuccessful))) : '',
        inf.top_goalscorer ? row('الهداف التاريخي', esc(arTxt(inf.top_goalscorer))) : '',
        inf.most_appearances ? row('الأكثر مشاركة', esc(arTxt(inf.most_appearances))) : '',
        inf.founded ? row('سنة التأسيس', esc(arTxt(inf.founded))) : '',
        inf.number_of_teams ? row('عدد الفرق', esc(arTxt(inf.number_of_teams))) : (inf.teams ? row('عدد الفرق', esc(arTxt(inf.teams))) : ''),
        inf.country ? row('الدولة', esc(arTxt(inf.country))) : (inf.region ? row('المنطقة', esc(arTxt(inf.region))) : ''),
        inf.organiser ? row('المنظم', esc(arTxt(inf.organiser))) : '',
        inf.current ? row('النسخة الحالية/القادمة', esc(arTxt(inf.current))) : ''
      ].filter(Boolean).join('') : '';
      return `
      ${hist ? `<div class="dataPanel" style="padding:14px;margin-bottom:12px">
        <div class="dataTop"><b>📜 سجل ${esc(name)}</b></div>
        <div class="tableWrap"><table style="min-width:0;width:100%"><tbody>${hist}</tbody></table></div>
        <p class="muted tiny" style="margin-top:8px">* السجل التاريخي بيتجمّع من الأرشيف الرياضي.</p>
      </div>` : ''}
      <div class="dataPanel" style="padding:14px">
        <div class="dataTop"><b>ℹ️ أرقام الموسم الحالي</b></div>
        <div class="tableWrap"><table style="min-width:0;width:100%">
          <tbody>
            ${leader ? row('المتصدر', esc(leader.team.name) + ' (' + leader.pts + ' نقطة)') : ''}
            ${mostWins && mostWins.w ? row('أكثر فوز', esc(mostWins.team.name) + ' (' + mostWins.w + ')') : ''}
            ${bestDef && bestDef.ga != null ? row('أفضل دفاع', esc(bestDef.team.name) + ' (' + bestDef.ga + ' هدف)') : ''}
            ${topSc ? row('أفضل هداف', esc(topSc.name) + ' (' + topSc.goals + ')') : ''}
            ${biggest ? row('أكبر نتيجة', esc(biggest.m.home.name) + ' ' + biggest.m.hg + '-' + biggest.m.ag + ' ' + esc(biggest.m.away.name)) : ''}
            ${row('مباريات منتهية', finished.length)}
            ${row('أهداف/مباراة', avg)}
            ${st.length ? row('فرق', st.length) : ''}
          </tbody>
        </table></div>
        ${!hist && !st.length && !finished.length ? '<p class="muted small" style="margin-top:8px">مفيش بيانات مباشرة للبطولة دي دلوقتي.</p>' : ''}
        <p class="muted tiny" style="margin-top:8px">* أرقام الموسم محدّثة لحظة بلحظة.</p>
      </div>`;
    }

    /* ---------- العرض ---------- */
    async function paint() {
      if (INFO_ONLY.includes(code)) {
        body.innerHTML = '<div class="skel" style="height:200px"></div>';
        body.innerHTML = await info();
        return;
      }
      if (!D || (!hasTable(D) && !hasMatches(D))) {
        body.innerHTML = '<div class="skel" style="height:200px"></div>';
        body.innerHTML = await info();
        return;
      }
      if (mode === 'table') body.innerHTML = table();
      else if (mode === 'matches') body.innerHTML = matches();
      else if (mode === 'bracket') body.innerHTML = bracket();
      else if (mode === 'scorers') {
        body.innerHTML = '<div class="skel" style="height:200px"></div>';
        SC_LIVE = await liveScorers(code).catch(() => null);
        body.innerHTML = scorers(SC_LIVE);
      }
      else if (mode === 'analysis') { body.innerHTML = analysis(); wireAnalysis(); }
      else body.innerHTML = await info();

      /* ربط الأزرار */
      body.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { fxView = b.dataset.fx; paint(); });
      const mt = body.querySelector('[data-more-table]');
      if (mt) mt.onclick = () => { tableExpanded = !tableExpanded; body.innerHTML = table(); };
      const mm = body.querySelector('[data-more-matches]');
      if (mm) mm.onclick = () => { expanded = !expanded; paint(); };
      hArrowsAll(body);
    }

    modebar.onclick = e => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      mode = b.dataset.m;
      expanded = false;
      paintModes();
      paint();
    };

    D = await leagueData(code);
    paintModes();
    await paint();
  }
});
