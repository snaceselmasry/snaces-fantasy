'use strict';
/* ============ العب مع صحابك — غرف لعب بين جهازين ============ */
(function () {
  const ERR = {
    'sign-in-required': 'محتاج تسجّل دخول بحسابك الأول',
    'not-found': 'مفيش غرفة بالكود ده — اتأكد منه',
    full: 'الغرفة مليانة (لاعبين بس)',
    'not-member': 'انت مش في الغرفة دي',
    'bad-code': 'اكتب كود صحيح',
    busy: 'السيرفر مشغول — جرّب تاني',
    waiting: 'مستنيين صاحبك يدخل الأول',
    'not-your-turn': 'استنى دور صاحبك',
    'column-full': 'العمود ده مليان',
    finished: 'الجولة خلصت',
    stale: 'حد لعب قبلك — بنحدّث اللوحة',
    'bad-move': 'حركة مش صح',
    'actor-only': 'اللي بيمثّل بس اللي يقدر يعمل كده',
    'actor-cannot-guess': 'انت اللي بتمثّل — سيب التخمين لصاحبك',
    'not-finished': 'لسه الجولة مخلصتش',
    empty: 'اكتب تخمين الأول',
    offline: 'النت فصل — جرّب تاني'
  };

  let timer = null, R = null, draft = '', busy = false;

  function stopPoll() { if (timer) clearInterval(timer); timer = null; R = null; draft = ''; }

  async function post(path, body) {
    try {
      const r = await fetch(path, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {})
      });
      const j = await r.json().catch(() => null);
      return { ok: r.ok && j && j.ok, status: r.status, j: j || {} };
    } catch (e) {
      return { ok: false, status: 0, j: { error: 'offline' } };
    }
  }

  const signed = () => typeof ACC !== 'undefined' && ACC.cloud && ACC.cloud.user;

  const seatName = (players, seat) => {
    const p = (players || []).find(x => x.seat === seat);
    return p ? esc(p.name) : (seat === 1 ? 'اللاعب الأول' : 'اللاعب التاني');
  };

  const avatar = p => p.picture
    ? `<img src="${esc(p.picture)}" alt="" width="36" height="36" loading="lazy" referrerpolicy="no-referrer">`
    : `<span class="rAv">${esc((p.name || '؟').trim().charAt(0))}</span>`;

  /* ---------- لوبي الغرف ---------- */
  screen('rooms', {
    title: 'العب مع صحابك', tab: 'challenges',
    async render(q, el) {
      stopPoll();
      const user = signed();
      const gameCard = (id, icon, name, desc) => `
        <button class="rPick" type="button" data-new="${id}">
          <span class="rPickIcon">${icon}</span>
          <span class="rPickTxt"><b>${name}</b><small>${desc}</small></span>
          <span class="rPickGo">‹</span>
        </button>`;

      el.innerHTML = `
        <div class="heroCard" style="margin-bottom:14px">
          <div class="eyebrow">غرف اللعب</div>
          <h2>اتحدى <span>صحابك</span></h2>
          <p>افتح غرفة، ابعت الكود لصاحبك، والعبوا كل واحد من جهازه — حضوركم ظاهر جوه الغرفة.</p>
          <span class="ball" aria-hidden="true">🎮</span>
        </div>

        ${user ? '' : `<div class="dataPanel" style="padding:14px;margin-bottom:12px">
          <b style="font-size:15px">🔐 محتاج تسجّل دخول</b>
          <p class="small muted" style="margin:8px 0 10px">الغرف بتشتغل بحسابك عشان نعرف مين صاحبك ومين متصل. سجّل دخول بحسابك وارجع هنا.</p>
          <a class="btn primary" href="#/account">تسجيل الدخول</a>
        </div>`}

        <div class="section">
          <div class="head"><h2>🎲 اختار اللعبة</h2></div>
          <div class="dataPanel" style="padding:8px">
            ${gameCard('c4', '🔴', 'كونكت فور', '7×6 — اللي يجمع 4 على خط واحد الأول يكسب')}
            ${gameCard('act', '🎭', 'التمثيل', 'كلمة سرية للي بيمثّل، والباقي يخمّن')}
          </div>
        </div>

        <div class="section">
          <div class="head"><h2>🔑 عندك كود؟</h2></div>
          <div class="dataPanel" style="padding:14px">
            <div class="rJoin">
              <input id="rCode" class="rInput" type="text" inputmode="latin" autocomplete="off" spellcheck="false" maxlength="5" placeholder="كود الغرفة (5 حروف)" aria-label="كود الغرفة">
              <button class="btn primary" type="button" id="rJoinBtn">دخول</button>
            </div>
            <p class="small muted" style="margin:10px 0 0">الكود بيبعتلك على واتساب/تليجرام عادي — صاحبك يكتبه هنا ويدخل معاك.</p>
          </div>
        </div>

        <div class="dataPanel" style="padding:14px">
          <b style="font-size:15px">ℹ️ إزاي بتشتغل</b>
          <p class="small muted" style="margin:8px 0 0;line-height:1.9">الغرفة بتفضل شغالة 6 ساعات. لو حد قفل التطبيق بيظهر «أوفلاين» لحد ما يرجع. صاحب الغرفة لو خرج، الغرفة بتتقفل.</p>
        </div>`;

      el.querySelectorAll('[data-new]').forEach(b => b.onclick = async () => {
        if (!signed()) return toast('سجّل دخول الأول عشان تعمل غرفة');
        b.disabled = true;
        const r = await post('/api/room/create', { game: b.dataset.new });
        b.disabled = false;
        if (!r.ok) return toast(ERR[r.j.error] || 'مقدرناش نفتح الغرفة');
        go('room', { c: r.j.code });
      });

      const join = async () => {
        const code = (el.querySelector('#rCode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (code.length < 4) return toast('اكتب الكود كامل');
        if (!signed()) return toast('سجّل دخول الأول عشان تدخل غرفة');
        const r = await post('/api/room/join', { code });
        if (!r.ok) {
          toast(ERR[r.j.error] || 'مقدرناش ندخل الغرفة');
          return;
        }
        go('room', { c: r.j.code });
      };
      el.querySelector('#rJoinBtn').onclick = join;
      el.querySelector('#rCode').addEventListener('keydown', e => { if (e.key === 'Enter') join(); });
    }
  });

  /* ---------- شاشة الغرفة ---------- */
  screen('room', {
    title: 'غرفة اللعب', tab: 'challenges', back: true,
    async render(q, el) {
      stopPoll();
      const code = String(q.c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!code) { el.innerHTML = emptyBox('مفيش كود غرفة.', '<br><a class="btn primary" href="#/rooms">الغرف</a>'); return; }
      if (!signed()) {
        el.innerHTML = emptyBox('محتاج تسجّل دخول عشان تدخل الغرفة.', '<br><a class="btn primary" href="#/account">تسجيل الدخول</a>');
        return;
      }

      el.innerHTML = `
        <div class="rTop">
          <div class="rCodeBox"><small>كود الغرفة</small><b id="rCodeTxt">${code}</b></div>
          <div class="rTopBtns">
            <button class="btn secondary" type="button" id="rShare">📤 ابعت الكود</button>
            <button class="btn secondary" type="button" id="rLeave">🚪 خروج</button>
          </div>
        </div>
        <div class="rPlayers" id="rPlayers"></div>
        <div id="rGame"></div>
        <div class="rFoot" id="rFoot"></div>`;

      el.querySelector('#rShare').onclick = () => shareLink(
        'SNACES FOOTBALL — غرفة لعب',
        `تعالى نلعب سوا! كود الغرفة: ${code}`,
        location.origin + '/#/room?c=' + code
      );
      el.querySelector('#rLeave').onclick = async () => {
        await post('/api/room/leave', { code });
        stopPoll();
        go('rooms');
      };

      const load = async () => {
        let j = null;
        try {
          const r = await fetch('/api/room?code=' + encodeURIComponent(code), { credentials: 'same-origin', cache: 'no-store' });
          j = await r.json().catch(() => null);
          if (!r.ok || !j || !j.ok) {
            if (j && j.error === 'not-found') {
              stopPoll();
              el.querySelector('#rGame').innerHTML = emptyBox('الغرفة اتقفلت أو الكود غلط.', '<br><a class="btn primary" href="#/rooms">الغرف</a>');
              el.querySelector('#rPlayers').innerHTML = '';
            } else if (j && j.error === 'not-member') {
              stopPoll();
              el.querySelector('#rGame').innerHTML = emptyBox('انت مش عضو في الغرفة دي.', '<br><a class="btn primary" href="#/rooms">الغرف</a>');
            }
            return;
          }
        } catch (e) { return; }

        const prevV = R && R.version;
        R = j;
        paintPlayers();
        if (prevV !== R.version || !el.querySelector('#rGame').dataset.painted) paintGame();
        paintFoot();
      };

      const paintPlayers = () => {
        const box = el.querySelector('#rPlayers');
        if (!box) return;
        const list = R.players || [];
        const need = 2 - list.length;
        box.innerHTML = `
          ${list.map(p => `<div class="rPlayer${p.me ? ' me' : ''}">
            ${avatar(p)}
            <div class="rPInfo"><b>${esc(p.name)}${p.me ? ' (انت)' : ''}</b>
              <small class="${p.online ? 'on' : 'off'}">${p.online ? '🟢 متصل' : '⚪ أوفلاين'}</small></div>
            <span class="rSeat" data-s="${p.seat}">${p.seat === 1 ? 'الأول' : 'التاني'}</span>
          </div>`).join('')}
          ${need > 0 ? `<div class="rPlayer wait">
            <span class="rAv">?</span>
            <div class="rPInfo"><b>مستني صاحبك</b><small>ابعتله الكود</small></div>
          </div>` : ''}`;
      };

      const paintFoot = () => {
        const box = el.querySelector('#rFoot');
        if (!box || !R) return;
        const others = (R.players || []).filter(p => !p.me);
        box.innerHTML = others.length
          ? `<span class="small muted">${others.map(p => esc(p.name) + (p.online ? ' متصل' : ' أوفلاين')).join(' · ')}</span>`
          : `<span class="small muted">لسه محدش دخل — ابعت الكود لصاحبك.</span>`;
      };

      const send = async action => {
        if (!R || busy) return;
        busy = true;
        const r = await post('/api/room/act', { code, v: R.version, action });
        busy = false;
        if (r.ok) {
          R.version = r.j.version;
          R.state = r.j.state;
          paintGame();
        } else {
          toast(ERR[r.j.error] || 'مش وقتها');
          await load();
        }
      };

      const paintGame = () => {
        const box = el.querySelector('#rGame');
        if (!box || !R) return;
        box.dataset.painted = '1';
        const st = R.state || {};
        if (R.game === 'c4') box.innerHTML = c4Html(st);
        else box.innerHTML = actHtml(st);
        wire();
      };

      /* ---- كونكت فور ---- */
      const c4Html = st => {
        const me = R.seat, turn = st.t;
        const other = (R.players || []).find(p => p.seat !== me);
        const heading = st.w
          ? (st.w === me ? '🎉 كسبت! 4 على خط واحد' : `😅 ${seatName(R.players, st.w)} كسب`)
          : st.d ? '🤝 تعادل — اللوحة اتملت'
            : (turn === me ? '✨ دورك — دوس على عمود' : `⏳ دور ${other ? esc(other.name) : 'صاحبك'}`);
        /* بنرص عمود ورا عمود: dir=ltr فالأعمدة من الشمال لليمين لنفس الترتيب عند الاتنين */
        let grid = '';
        for (let c = 0; c < 7; c++) {
          grid += '<div class="c4col">';
          for (let r = 0; r < 6; r++) {
            const v = (st.b || [])[r * 7 + c] || 0;
            grid += `<button class="c4cell${v ? ' p' + v : ''}" type="button" data-c="${c}" aria-label="عمود ${c + 1}"></button>`;
          }
          grid += '</div>';
        }
        return `
          <div class="rCard">
            <div class="c4head"><b>${heading}</b>
              <span class="c4who"><i class="dot p1"></i>${seatName(R.players, 1)} <i class="dot p2"></i>${seatName(R.players, 2)}</span>
            </div>
            <div class="c4board" dir="ltr">${grid}</div>
            ${st.w || st.d ? `<button class="btn secondary" type="button" id="c4new">🔄 لعبة جديدة</button>` : ''}
            <p class="small muted" style="margin:10px 0 0">كونكت فور: صفّ 4 قطع بالعرض أو الطول أو بالقطر. الضغط على العمود بينزّل قطعتك لأول مكان فاضي.</p>
          </div>`;
      };

      /* ---- التمثيل ---- */
      const actHtml = st => {
        const me = R.seat, iAmActor = me === st.actor;
        const actorName = seatName(R.players, st.actor);
        const s1 = (st.score || [0, 0])[0] || 0, s2 = (st.score || [0, 0])[1] || 0;
        const score = `
          <div class="actScore">
            <span class="${st.actor === 1 ? 'act' : ''}">${seatName(R.players, 1)} <b>${s1}</b></span>
            <span class="${st.actor === 2 ? 'act' : ''}">${seatName(R.players, 2)} <b>${s2}</b></span>
          </div>`;
        const guesses = (st.guesses || []).slice().reverse().map(g => `
          <div class="actGuess ${g.ok ? 'ok' : ''}">
            <span>${esc(seatName(R.players, g.seat))}</span>
            <b>${esc(g.text)}</b>
            <i>${g.ok ? '✓' : ''}</i>
          </div>`).join('');

        let body;
        if (iAmActor) {
          body = `
            <div class="actWordBox">
              <small>الكلمة اللي هتمثلها${st.cat ? ' — ' + esc(st.cat) : ''}</small>
              <b>${esc(st.word || '')}</b>
              <span class="small muted">ممنوع تتكلم أو تكتب الكلمة — مثّل بس 😄</span>
            </div>
            ${st.phase === 'done'
              ? `<button class="btn primary" type="button" id="actNext">▶️ الجولة اللي بعدها</button>`
              : `<button class="btn secondary" type="button" id="actSkip">🔀 كلمة تانية</button>`}`;
        } else {
          body = `
            <div class="actAsk">
              <b>${esc(actorName)} بيمثّل دلوقتي 🎭</b>
              <p class="small muted" style="margin:6px 0 0">شوف حركته واكتب اللي فهمته.</p>
            </div>
            ${st.phase === 'done'
              ? `<div class="actDone">✅ الكلمة كانت: <b>${esc(st.word || '')}</b></div>
                 <button class="btn primary" type="button" id="actNext">▶️ الجولة اللي بعدها</button>`
              : `<div class="rJoin">
                  <input id="actGuess" class="rInput" type="text" maxlength="40" autocomplete="off" placeholder="تخمينك..." value="${esc(draft)}">
                  <button class="btn primary" type="button" id="actSend">خمّن</button>
                </div>`}`;
        }

        return `
          <div class="rCard">
            <div class="actHead"><b>🎭 التمثيل — جولة ${st.round || 1}</b>${score}</div>
            ${body}
            ${guesses ? `<div class="actGuesses">${guesses}</div>` : ''}
            ${st.skips ? `<p class="small muted" style="margin:8px 0 0">كلمات اتخطت: ${st.skips}</p>` : ''}
          </div>`;
      };

      function wire() {
        const box = el.querySelector('#rGame');
        box.querySelectorAll('.c4cell').forEach(c => c.onclick = () => send({ a: 'drop', c: Number(c.dataset.c) }));
        const nb = box.querySelector('#c4new');
        if (nb) nb.onclick = () => send({ a: 'reset' });
        const sk = box.querySelector('#actSkip');
        if (sk) sk.onclick = () => send({ a: 'skip' });
        const nx = box.querySelector('#actNext');
        if (nx) nx.onclick = () => send({ a: 'next' });
        const inp = box.querySelector('#actGuess');
        const goGuess = () => {
          const t = (inp.value || '').trim();
          if (!t) return toast('اكتب تخمينك الأول');
          draft = '';
          send({ a: 'guess', text: t });
        };
        if (inp) {
          inp.oninput = () => { draft = inp.value; };
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') goGuess(); });
          const sb = box.querySelector('#actSend');
          if (sb) sb.onclick = () => { inp.value = (inp.value || '').trim(); goGuess(); };
        }
      }

      await load();
      if (!R) return;
      timer = setInterval(() => {
        const cur = parseHash();
        if (cur.path !== 'room' || String(cur.q.c || '').toUpperCase() !== code) return stopPoll();
        load();
      }, 2600);
    }
  });

  window.addEventListener('hashchange', () => {
    const { path } = parseHash();
    if (path !== 'room') stopPoll();
  });
})();
