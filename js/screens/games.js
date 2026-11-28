'use strict';
/* ============ Games & Challenges — الصفحة الرئيسية وصفحة كل لعبة ============ */

const GAME_INFO = {
  daily: { icon: '📅', cat: 'daily', desc: '5 أسئلة جديدة كل يوم — من السهل للصعب' },
  weekly: { icon: '🏆', cat: 'daily', desc: '10 أسئلة أسبوعية ومكافأة نقاط' },
  cat: { icon: '🧠', cat: 'quiz', desc: 'أسئلة في التاريخ والبطولات واللاعبين والأندية' },
  tf: { icon: '✅', cat: 'quiz', desc: 'جملة كروية — صح أم خطأ؟' },
  blitz: { icon: '⚡', cat: 'quiz', desc: '60 ثانية وأكبر عدد من الإجابات الصح' },
  who: { icon: '🕵️', cat: 'quiz', desc: 'خمّن اللاعب من التلميحات قبل ما تنتهي المحاولات' },
  journey: { icon: '🧭', cat: 'quiz', desc: 'مين اللاعب اللي مرّ بالأندية دي بالترتيب؟' },
  jersey: { icon: '👕', cat: 'fun', desc: 'قميص أنهي فريق؟ ألوان وتصميمات الأندية' },
  logo: { icon: '🛡️', cat: 'fun', desc: 'خمّن النادي من شعاره' },
  more: { icon: '📊', cat: 'fun', desc: 'أيهما أكثر؟ قارن أرقام اللاعبين' },
  res: { icon: '🎯', cat: 'fun', desc: 'خمّن الفريق من آخر 5 نتائج' },
  lineup: { icon: '👥', cat: 'fun', desc: 'التشكيلة دي بتاعة أي نادي؟' },
  scramble: { icon: '🔤', cat: 'fun', desc: 'رتّب الحروف واعرف اسم النادي أو اللاعب' },
  fplwho: { icon: '⭐', cat: 'fun', desc: 'من هو اللاعب من أرقام الفانتازي؟' },
  auction: { icon: '💰', cat: 'fun', desc: 'مين أفضل قيمة (نقاط لكل جنيه)؟' },
  top10: { icon: '🏅', cat: 'fun', desc: 'اعرف اللاعب من قيمته داخل توب 10' },
  formation: { icon: '📐', cat: 'fun', desc: 'الخطوط والمراكز دي بتاعة أي خطة؟' },
  pred: { icon: '🔮', cat: 'fun', desc: 'توقّع نتايج المباريات الجاية' },
  odd: { icon: '🔍', cat: 'fun', desc: 'اللي مش زي التاني — قميص من دولة تانية' },
  blur: { icon: '🫥', cat: 'fun', desc: 'لاعب مشوّش — خمّن من الصورة' },
  act: { icon: '🎭', cat: 'fun', desc: 'التمثيل — اشرح اللاعب بإشارات من غير كلام' },
  pass: { icon: '🔑', cat: 'fun', desc: 'كلمة السر — اشرح اللاعب من غير ما تنطق اسمه' },
  bid: { icon: '💰', cat: 'fun', desc: 'مزاد التلميحات — قلّل تلميحاتك تاخد نقاط أكتر' },
  match: { icon: '🔗', cat: 'fun', desc: 'وصّل كل لاعب بأول نادي لعب له' },
  draft: { icon: '🃏', cat: 'strategy', desc: 'درافت لاعبين ضد صاحبك — اختار بالتناوب وكوّن أقوى تشكيلة' },
  penalty: { icon: '🥅', cat: 'action', desc: 'ضربات جزاء ضد حارس ذكي — خدّع الحارس وسجّل' },
  tactics: { icon: '🧩', cat: 'puzzle', desc: 'لغز تمرير على الملعب — وصّل الكرة للهدف قبل نهاية التمريرات' },
  roulette: { icon: '🎡', cat: 'strategy', desc: 'عجلة قيود عشوائية + ميزانية — كوّن أفضل 5 لاعبين' },
  connect: { icon: '🔗', cat: 'puzzle', desc: 'جمّع 4 أندية من نفس الدولة في شبكة واحدة' },
  ttt: { icon: '⚽', cat: 'puzzle', desc: 'شبكة 3×3 من الأندية — اكتب لاعبًا لعب للفريقين رسميًا' },
  memory: { icon: '🧠', cat: 'fun', desc: 'طابق صور اللاعبين بأسمائهم وشعارات الأندية بأسمائها' },
  bingo: { icon: '🎟️', cat: 'fun', desc: 'بطاقة أندية ولاعب مُستدعى — أكمل خطًا واصرخ BINGO' },
  year: { icon: '📅', cat: 'history', desc: 'في أي سنة كسب البطولة؟' },
  final: { icon: '🏆', cat: 'history', desc: 'مين كسب أو خسر النهائي؟' },
  host: { icon: '🌍', cat: 'history', desc: 'أي دولة استضافت كأس العالم؟' },
  champ: { icon: '🏅', cat: 'history', desc: 'مين بطل أمم أفريقيا في النسخة دي؟' }
};

function gameInfo(id) {
  return GAME_INFO[id] || { icon: '🎮', cat: 'fun', desc: 'لعبة من SNACES FOOTBALL' };
}
function gameName(g) {
  return String(g[1] || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();
}

screen('games', {
  title: 'الألعاب والتحديات', tab: 'games',
  async render(q, el) {
    /* أسئلة اليوم المولّدة لازم تتضاف قبل عرض الإحصائيات والتصنيفات */
    if (typeof ensureDailyQuestions === 'function') await ensureDailyQuestions();
    const cs = qbChallengeState();
    const cats = [
      ['all', 'الكل', '🎮'],
      ['daily', 'التحديات', '🏆'],
      ['quiz', 'أسئلة', '🧠'],
      ['fun', 'ألعاب', '🎯'],
      ['strategy', 'استراتيجية', '♟️'],
      ['action', 'أكشن', '⚡'],
      ['puzzle', 'ألغاز', '🧩'],
      ['history', 'تاريخ', '📜']
    ];
    let cat = q.cat && cats.some(c => c[0] === q.cat) ? q.cat : 'all';
    const list = () => G.filter(g => cat === 'all' || gameInfo(g[0]).cat === cat);

    const challengeCard = (href, ic, title, st, sub, accent) => `<a class="challengeCard ${accent || ''}" href="${href}">
      <span class="ccIc">${ic}</span>
      <span class="ccBody"><b>${title}</b><small>${sub}</small></span>
      <span class="ccState ${st.label === 'مكتمل' ? 'done' : st.label === 'بدأ' ? 'started' : ''}">${st.label}</span>
      <span class="ccLeft">${qbTimeLeft(st.left)}</span>
    </a>`;

    const draw = () => {
      const grid = $('#ghGrid', el);
      if (!grid) return;
      grid.innerHTML = list().map(g => {
        const id = g[0], info = gameInfo(id);
        return `<a class="gCard" href="#/game?g=${encodeURIComponent(id)}">
          <span class="gCardIc">${info.icon}</span>
          <span class="gCardBody">
            <b>${esc(gameName(g))}</b>
            <small>${esc(info.desc)}</small>
            <span class="gCardTag">${g[2] ? '3 مستويات' : 'لعبة سريعة'}</span>
          </span>
          <span class="gPlay">▶ العب</span>
        </a>`;
      }).join('') || '<p class="muted small">مفيش ألعاب في التصنيف ده.</p>';
    };

    el.innerHTML = `
      <div class="ghHero">
        <div class="ghHeroTop">
          <span class="ghBall">⚽</span>
          <div><h2>Games &amp; Challenges</h2><p>ألعاب كرة قدم وتحديات يومية وأسبوعية — اختار والعب</p></div>
        </div>
        <div class="ghStats">
          <span><b>${G.length}</b> لعبة</span>
          <span><b>${QB.length}</b> سؤال</span>
          <span><b>3</b> مستويات</span>
        </div>
        <div class="ghActions">
          <a class="btn primary" href="#/challenges">🏆 التحديات</a>
          <a class="btn secondary" href="#/game?g=blitz">⚡ تحدي السرعة</a>
        </div>
      </div>

      <div class="ghSecHead"><b>التحديات</b><a href="#/challenges" class="muted tiny">كل التحديات ›</a></div>
      ${challengeCard('#/game?g=daily', '📅', 'تحدي اليوم', cs.daily, `${cs.daily.state.score}/5 صح`, 'day')}
      ${challengeCard('#/game?g=weekly', '🏆', 'تحدي الأسبوع', cs.weekly, `${cs.weekly.state.score}/10 صح • مكافأة نقاط`, 'week')}

      <div class="ghSecHead" style="margin-top:16px"><b>كل الألعاب</b><span class="muted tiny" id="ghCount"></span></div>
      <div class="ghCats">${cats.map(([k, n, ic]) => `<button class="btn ${k === cat ? 'primary' : 'secondary'}" type="button" data-gc="${k}">${ic} ${n}</button>`).join('')}</div>
      <div class="ghGrid" id="ghGrid"></div>
      <div class="disclaimer" style="margin-top:14px">كل الأسئلة من بنك SNACES — نتايجك بتتحفظ على جهازك وبتتزامن مع حسابك. الألعاب اللي محتاجة بيانات حية بتستخدم مصدر المباريات الحالي.</div>`;

    $$('[data-gc]', el).forEach(b => b.onclick = () => {
      cat = b.dataset.gc;
      $$('[data-gc]', el).forEach(x => x.className = 'btn ' + (x.dataset.gc === cat ? 'primary' : 'secondary'));
      draw();
      const c = $('#ghCount', el); if (c) c.textContent = list().length + ' لعبة';
    });
    draw();
    const c = $('#ghCount', el); if (c) c.textContent = list().length + ' لعبة';
  }
});

/* صفحة مستقلة لكل لعبة */
screen('game', {
  title: 'لعبة', tab: 'games', back: true,
  render(q, el) {
    const id = G.some(g => g[0] === q.g) ? q.g : 'daily';
    return SCREENS.challenges.render({ single: id }, el);
  }
});
