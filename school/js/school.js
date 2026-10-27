/* 英文課本這一種書（type: 'english'）：每一課有「點點看」（點圖聽單字、點念謠一句一句聽）、「跟老師複習」（自動一步一步念）、
 * 「小小考試」（聽英文選圖，10 題）和四個小遊戲（賽車、餵小熊、蓋高塔、青蛙跳荷葉），最後一樣有訂正時間。
 * 練習題、遊戲、訂正都用 game.js 那一套，這裡只負責出題、教學、講解。書的內容在 js/books/，書架在 shelf.js。
 * 每一本書登記成 game.js 的一個「科目」（id＝書的 id，網址 #/b/書/課/…）。
 */
(function () {
  const $ = id => document.getElementById(id);
  const { BOOKS, T, sentence, picHTML } = window.SHELF;
  const CN = '一二三四五六七八九十';
  const lessonNo = u => `第${CN[u.no - 1]}課`;

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[rnd(0, a.length - 1)];


  /* ---------- 畫面 ---------- */
  const pic = (w, cls = '') => `<span class="sb-pic${cls ? ' ' + cls : ''}">${picHTML(w.pic)}</span>`;
  const bigCard = w => `<div class="sb-big">${pic(w)}<div class="sb-word"><b>${w.en}</b><small>${w.zh}</small></div></div>`;
  const ear = () => '<button class="z-ear sb-ear" data-replay aria-label="再聽一次">🔊</button>';
  const lines = (en, zh) => `<div class="sb-lines">${en.map((e, i) => `<div><b>${e}</b><small>${zh[i] || ''}</small></div>`).join('')}</div>`;
  const chantBoard = (u, hl) => `<div class="sb-chant" style="--c:${u.color};--cd:${u.dark}"><h4>${u.chant.title}</h4>${u.chant.lines.map(([en], k) =>
    `<p class="${k === hl ? 'on' : ''}">${en}</p>`).join('')}</div>`;
  const lit = (box, k) => box.querySelectorAll('[data-line]').forEach(p => p.classList.toggle('on', +p.dataset.line === k));
  function flash(el) {
    if (!el) return;
    el.classList.remove('said');
    void el.offsetWidth;
    el.classList.add('said');
  }
  // 老師的名字：每個小朋友分開存（哥哥、妹妹的老師不一樣）
  const teacherKey = () => 'teacherName' + (localStorage.getItem('kid') ? '|' + localStorage.getItem('kid') : '');
  let teacherName = '';
  let tapToken = 0, tapBook = null;

  // 題目上的 🔊：再聽一次
  $('mathVisual').addEventListener('click', e => {
    if (e.target.closest('[data-replay]')) $('mathSay').click();
  });

  /* ---------- 一本英文課本 → 一個科目 ---------- */
  function englishBook(book) {
    // 每個單字一個 key：「書/課/單字」
    const UNITS = book.units;
    const ITEMS = UNITS.flatMap(u => [...u.words, ...u.extra].map(w => ({ key: `${book.id}/${u.id}/${w.id}`, u, w })));
    const item = key => ITEMS.find(x => x.key === key);
    const unitsOf = id => (id === 'all' ? UNITS : UNITS.filter(u => u.id === id));
    const pool = id => ITEMS.filter(x => id === 'all' || x.u.id === id);

    // 農場：畫面上有哪幾個
    const farm = (keys, glow) => `<div class="sb-farm">${keys.map(k => pic(item(k).w, k === glow ? 'glow' : '')).join('')}</div>`;

    /* ---------- 出題：聽英文選圖、聽句子選圖、農場 Do you see…? ---------- */
    let last = null;
    // 干擾選項：先找同一課的，不夠再找別課的；圖一樣或名字很像的（car／toy car）不能放在一起
    function others(x, n) {
      const ok = y => y.key !== x.key && y.w.pic !== x.w.pic && !y.w.en.includes(x.w.en) && !x.w.en.includes(y.w.en);
      const same = shuffle(ITEMS.filter(y => y.u === x.u && ok(y)));
      const rest = shuffle(ITEMS.filter(y => y.u !== x.u && ok(y)));
      const out = [];
      for (const y of [...same, ...rest]) {
        if (out.length >= n) break;
        if (out.every(o => o.w.pic !== y.w.pic && !o.w.en.includes(y.w.en) && !y.w.en.includes(o.w.en))) out.push(y);
      }
      return out;
    }

    function makeQuestion(id) {
      const u = pick(unitsOf(id));
      if (u.ask && Math.random() < .45) return yesNo(u);
      const list = pool(u.id).filter(x => x.key !== last);
      const x = pick(list);
      last = x.key;
      const s = sentence(u, x.w);
      const choices = shuffle([x, ...others(x, 3)].map(y => y.key));
      if (s && !u.ask && Math.random() < .4) {
        return { kind: 'sent', ans: x.key, x, choices, cls: 'sb-choices', text: T.listenSent, visual: ear(), say: [T.listenSent, ...s.en] };
      }
      return { kind: 'word', ans: x.key, x, choices, cls: 'sb-choices', text: T.listen + '？', visual: ear(), say: [T.listen, x.w.en] };
    }

    // 農場：畫三樣東西，問其中一樣（Yes, I do.）或沒畫的一樣（No, I don't.）
    function yesNo(u) {
      const all = shuffle(pool(u.id).slice());
      const shown = all.slice(0, 3).map(x => x.key);
      const yes = Math.random() < .5;
      const x = yes ? item(pick(shown)) : all[3];
      last = x.key;
      const s = sentence(u, x.w);
      return {
        kind: 'yn', ans: yes ? 'yes' : 'no', x, u, shown, choices: ['yes', 'no'], cls: 'sb-yn',
        qhtml: `<div class="sb-ask">${s.en[0]}</div>`, text: s.en[0], visual: farm(shown) + ear(), say: [T.yesNo, s.en[0]],
      };
    }

    const ynText = (u, v) => (v === 'yes' ? u.ans : u.nope[0]);
    function label(c, q) {
      if (q.kind === 'yn') return `<span class="sb-yn-l">${c === 'yes' ? '👍' : '👎'} ${ynText(q.u, c)}</span>`;
      return pic(item(c).w);
    }

    /* ---------- 訂正：一步一步講 ---------- */
    function explainSteps(q, level, chosen) {
      const { u, w } = q.x;
      if (q.kind === 'yn') {
        const there = q.ans === 'yes';
        const s = sentence(u, w);
        return [
          { html: farm(q.shown, there ? q.x.key : null) + bigCard(w), qhtml: lines([w.en], [w.zh]), say: [w.en, T.meaning, w.zh] },
          { html: farm(q.shown, there ? q.x.key : null), qhtml: lines([s.en[0], ynText(u, q.ans)], [s.zh[0], there ? u.ansZh : u.nope[1]]),
            say: [s.en[0], ynText(u, q.ans), there ? u.ansZh : u.nope[1]], done: true },
        ];
      }
      const steps = [];
      if (chosen && item(chosen)) {
        const c = item(chosen).w;
        steps.push({ html: bigCard(c), qhtml: lines([c.en], [c.zh]), say: [T.youPicked, c.en, c.zh] });
      }
      steps.push({ html: bigCard(w), qhtml: lines([w.en], [w.zh]), say: [T.right, w.en, T.meaning, w.zh] });
      const s = sentence(u, w);
      if (s) steps.push({ html: bigCard(w), qhtml: lines(s.en, s.zh), say: [...s.en, ...s.zh] });
      steps[steps.length - 1].done = true;
      return steps;
    }

    /* ---------- 跟老師複習：照課本的順序念 ---------- */
    function unitSteps(u, withChant) {
      const hasQ = !u.q[0].includes('___');
      const steps = [{
        html: `<div class="sb-banner" style="--c:${u.color};--cd:${u.dark}"><span class="em">${u.icon}</span><b>${lessonNo(u)}</b><span>${u.name}</span></div>`,
        qhtml: hasQ ? lines([u.q[0]], [u.q[1]]) : `<div class="sb-lines"><div><b>${u.name}</b></div></div>`,
        say: [lessonNo(u), u.name, ...(hasQ ? u.q : []), ...(u.noSentence ? [T.yourTeacher] : [])],
      }];
      for (const w of u.words) {
        const s = sentence(u, w);
        steps.push({ html: bigCard(w), qhtml: s ? lines(s.en, s.zh) : lines([w.en], [w.zh]), say: [w.en, w.zh, ...(s ? [...s.en, ...s.zh] : [])] });
      }
      if (!withChant) return steps;
      for (const w of u.extra) steps.push({ html: bigCard(w), qhtml: lines([w.en], [w.zh]), say: [w.en, w.zh] });
      steps.push({ html: chantBoard(u, -1), qhtml: lines([u.chant.title], [u.chant.zh]), say: [T.chant, u.chant.title] });
      u.chant.lines.forEach(([en, zh], k) => steps.push({ html: chantBoard(u, k), qhtml: lines([en], [zh]), say: [en, zh] }));
      steps[steps.length - 1].done = true;
      return steps;
    }
    const lessonSteps = id => (id === 'all' ? UNITS.flatMap(u => unitSteps(u, false)) : unitSteps(unitsOf(id)[0], true));

    /* ---------- 點點看：點圖片聽單字和句子，點念謠一句一句聽 ---------- */
    function tapShow(lv, box) {
      tapToken++;
      tapBook = book;
      try { teacherName = localStorage.getItem(teacherKey()) || ''; } catch (e) { }
      const units = unitsOf(lv.id);
      box.innerHTML = units.map(u => {
        const hasQ = !u.q[0].includes('___');
        const card = (x, cls) => `<button class="sb-tap${cls}" data-key="${book.id}/${u.id}/${x.id}">${pic(x)}<b>${x.en}</b><small>${x.zh}</small></button>`;
        const teacher = u.noSentence ? `<button class="sb-q sb-name" data-teacher><span>✏️ My teacher is <u>${teacherName || '_____'}</u>.</span><small>我的老師是${teacherName || '＿＿'}。（點這裡寫老師的名字）</small></button>` : '';
        const one = units.length === 1;
        return `<section class="sb-unit" style="--c:${u.color};--cd:${u.dark}">
          ${one ? '' : `<h3 class="sb-unit-h" data-unit="${u.id}"><span>${u.icon}</span>${lessonNo(u)} ${u.name}</h3>`}
          <button class="sb-q" data-unit="${u.id}"><span>🔊 ${hasQ ? u.q[0] : u.ask.replace('___', '_____')}</span><small>${hasQ ? u.q[1] : u.askZh.replace('___', '＿＿')}</small></button>
          ${teacher}
          <div class="sb-taps">${u.words.map(w => card(w, '')).join('')}</div>
          ${one && u.extra.length ? `<h4 class="sb-sub">🎵 念謠裡的單字</h4><div class="sb-taps small">${u.extra.map(w => card(w, ' small')).join('')}</div>` : ''}
          ${one ? `<div class="sb-chant tap" data-chant="${u.id}"><h4>${u.chant.title}<small>${u.chant.zh}</small>
              <button class="pill sb-all" data-readall="${u.id}">▶️ ${T.readAll}</button></h4>
            ${u.chant.lines.map(([en, zh], k) => `<p data-line="${k}">${en}<small>${zh}</small></p>`).join('')}</div>` : ''}
        </section>`;
      }).join('');
      const my = tapToken;
      setTimeout(() => my === tapToken && Voice.speak([T.tapHint]), 300);
    }

    $('mathMenu').addEventListener('click', e => {
      if (!$('mathMenu').className.includes('view-tap') || tapBook !== book) return;
      const t = e.target;
      const tap = t.closest('[data-key]'), q = t.closest('.sb-q[data-unit]'), line = t.closest('[data-line]'), all = t.closest('[data-readall]');
      const head = t.closest('.sb-unit-h');
      tapToken++;
      if (t.closest('[data-teacher]')) {
        const n = prompt('老師的名字（例如：王老師、Miss Lin）', teacherName);
        if (n === null) return;
        teacherName = n.trim().slice(0, 20);
        try { localStorage.setItem(teacherKey(), teacherName); } catch (err) { }
        const btn = t.closest('[data-teacher]');
        btn.querySelector('u').textContent = teacherName || '_____';
        Sound.play('pop');
        if (teacherName) Voice.speak([T.myTeacher, teacherName]);
        return;
      }
      Sound.play('pop');
      if (tap) {
        const x = item(tap.dataset.key), s = sentence(x.u, x.w);
        flash(tap);
        return Voice.speak([x.w.en, x.w.zh, ...(s ? s.en : [])]);
      }
      if (head || q) {
        const u = UNITS.find(v => v.id === (head || q).dataset.unit);
        flash(head || q);
        return Voice.speak(u.q[0].includes('___') ? [u.name] : u.q);
      }
      if (line) {
        const u = UNITS.find(v => v.id === line.closest('[data-chant]').dataset.chant), k = +line.dataset.line;
        const box = line.closest('[data-chant]');
        lit(box, k);
        return Voice.speak(u.chant.lines[k], () => lit(box, -1));
      }
      if (all) {
        // 全部念一遍：只念英文，念到哪句亮哪句
        const u = UNITS.find(v => v.id === all.dataset.readall), box = all.closest('[data-chant]'), my = tapToken;
        const step = k => {
          if (my !== tapToken) return;
          if (k >= u.chant.lines.length) { lit(box, -1); return Sound.play('twinkle'); }
          lit(box, k);
          Voice.speak([u.chant.lines[k][0]], () => setTimeout(() => step(k + 1), 250));
        };
        step(0);
      }
    });

    /* ---------- 登記成一個科目 ---------- */
    window.MathGame.register({
      id: book.id, route: 'b/' + book.id, home: '#/b/' + book.id, store: [book.id, book.id + '-game'], cardClass: 'sb-card',
      learnName: T.review, quizName: T.quiz,
      tiers: [...book.tiers.map((t, k) => ({ id: 't' + k, name: t.name, note: t.note })), { id: 'all', name: '🏆 ' + T.all, note: T.allNote }],
      levels: [
        ...UNITS.map(u => ({
          id: u.id, tier: 't' + Math.max(0, book.tiers.findIndex(t => u.no >= t.from && u.no <= t.to)), name: `${u.no}・${u.name}`, say: u.name, color: u.color, dark: u.dark,
          showHTML: `<span class="sb-show"><span class="em">${u.icon}</span><b>${u.chant.title}</b></span>`,
        })),
        { id: 'all', tier: 'all', name: T.all, say: T.all, color: book.color, dark: book.dark,
          showHTML: `<span class="sb-show"><span class="em">${UNITS.slice(0, 5).map(u => u.icon).join('')}<br>${UNITS.slice(5).map(u => u.icon).join('')}</span></span>` },
      ],
      pace: Object.fromEntries(['all', ...book.tiers.map((t, k) => 't' + k)].map(k => [k, 4200])),
      views: { tap: { name: T.tap, icon: '👆', color: '#ffd8a8', dark: '#e8590c', show: tapShow, say: () => Voice.speak([T.tapHint]) } },
      makeQuestion, lessonSteps, explainSteps, label,
      fixSay(m, q) {
        if (q.kind === 'yn') return [T.youPicked, ynText(q.u, m.chosen), T.right, ynText(q.u, q.ans), T.tryIt];
        return [T.youPicked, item(m.chosen).w.en, T.right, q.x.w.en, T.tryIt];
      },
      answerSay: q => [T.answerIs, q.kind === 'yn' ? ynText(q.u, q.ans) : q.x.w.en],
    });
  }

  BOOKS.filter(b => b.type === 'english').forEach(englishBook);
})();
