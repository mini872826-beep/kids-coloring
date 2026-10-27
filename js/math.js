/* 學數學：初階、中階、高階，每一關都有「看教學」（一步一步示範）和「練習」（10 題選擇題）。
 * 題目和教學都用 AI 聲音念：數字拆成片段念（見 words.js 的 numberWords）。
 */
(function () {
  const $ = id => document.getElementById(id);
  const W = window.WORDS;
  const ROUND = 10;
  const N = n => W.numberWords(n);

  const TIERS = [
    { id: 'easy', name: '🌱 初階', note: '數數、10 以內加減' },
    { id: 'mid', name: '🌿 中階', note: '20 以內、十位數、乘法入門' },
    { id: 'hard', name: '🌳 高階', note: '進位借位、百位數、九九乘法' },
  ];
  const LEVELS = [
    { id: 'count', tier: 'easy', name: '數一數', show: '1 2 3', color: '#ff6b6b', dark: '#e03131' },
    { id: 'add10', tier: 'easy', name: '10 以內加法', show: '3 + 4', color: '#ff922b', dark: '#e8590c' },
    { id: 'sub10', tier: 'easy', name: '10 以內減法', show: '7 − 3', color: '#fab005', dark: '#e67700' },
    { id: 'add20', tier: 'mid', name: '20 以內加減', show: '8 + 5', color: '#51cf66', dark: '#2f9e44' },
    { id: 'add2a', tier: 'mid', name: '十位數加減', show: '23 + 45', color: '#20c997', dark: '#099268' },
    { id: 'times25', tier: 'mid', name: '乘法入門', show: '2 × 4', color: '#22b8cf', dark: '#0c8599' },
    { id: 'add2b', tier: 'hard', name: '進位和借位', show: '27 + 15', color: '#4dabf7', dark: '#1c7ed6' },
    { id: 'add3', tier: 'hard', name: '百位數加減', show: '325 + 418', color: '#845ef7', dark: '#6741d9' },
    { id: 'times', tier: 'hard', name: '九九乘法練習', show: '7 × 8', color: '#f06595', dark: '#c2255c' },
  ];

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // 四個選項：正確答案＋附近容易搞混的數字
  function choices(ans, min, max) {
    const set = new Set([ans]);
    for (const d of shuffle([1, -1, 2, -2, 3, -3, 10, -10, 5, -5])) {
      if (set.size >= 4) break;
      if (ans + d >= min && ans + d <= max) set.add(ans + d);
    }
    while (set.size < 4) set.add(rnd(min, max));
    return shuffle([...set]);
  }

  /* ---------- 出題 ---------- */
  function pickAddSub(level) {
    const plus = Math.random() < .5;
    let a, b;
    switch (level) {
      case 'add10': a = rnd(0, 9); b = rnd(0, 10 - a); return [a, b, true];
      case 'sub10': a = rnd(1, 10); b = rnd(0, a); return [a, b, false];
      case 'add20':
        if (plus) { a = rnd(2, 18); b = rnd(1, 20 - a); } else { a = rnd(11, 20); b = rnd(1, a); }
        return [a, b, plus];
      case 'add2a': {   // 不進位、不借位
        const t1 = rnd(1, 8), o1 = rnd(0, 9);
        if (plus) { const t2 = rnd(1, 9 - t1), o2 = rnd(0, 9 - o1); return [t1 * 10 + o1, t2 * 10 + o2, true]; }
        const t2 = rnd(1, t1), o2 = rnd(0, o1); return [t1 * 10 + o1, t2 * 10 + o2, false];
      }
      case 'add2b': {   // 一定要進位或借位
        if (plus) { const o1 = rnd(2, 9), o2 = rnd(10 - o1, 9), t1 = rnd(1, 7), t2 = rnd(1, 8 - t1); return [t1 * 10 + o1, t2 * 10 + o2, true]; }
        const o1 = rnd(0, 8), o2 = rnd(o1 + 1, 9), t1 = rnd(2, 9), t2 = rnd(1, t1 - 1); return [t1 * 10 + o1, t2 * 10 + o2, false];
      }
      default:   // add3
        if (plus) { a = rnd(100, 899); b = rnd(10, 999 - a); } else { a = rnd(200, 999); b = rnd(10, a - 1); }
        return [a, b, plus];
    }
  }

  function makeQuestion(level) {
    if (level === 'count') {
      const n = rnd(1, 10);
      return { big: true, ans: n, a: 0, b: n, op: 'count', text: '數一數，有幾個？', say: ['數一數，有幾個？'], visual: objs([n]), choices: choices(n, 1, 10) };
    }
    if (level === 'times25' || level === 'times') {
      const a = level === 'times25' ? [2, 5][rnd(0, 1)] : rnd(2, 9), b = level === 'times25' ? rnd(1, 9) : rnd(2, 9);
      return {
        ans: a * b, a, b, op: '×', text: `${a} × ${b} = ?`, say: [...N(a), '乘', ...N(b), '等於多少？'],
        visual: level === 'times25' ? groups(a, b) : '', choices: choices(a * b, 1, 81),
      };
    }
    const [a, b, plus] = pickAddSub(level);
    const ans = plus ? a + b : a - b;
    const max = { add10: 10, sub10: 10, add20: 20, add2a: 99, add2b: 99 }[level] || 1000;
    const pictured = level === 'add10' || level === 'sub10' || level === 'add20';
    return {
      ans, a, b, op: plus ? '+' : '−', text: `${a} ${plus ? '+' : '−'} ${b} = ?`,
      say: [...N(a), plus ? '加' : '減', ...N(b), '等於多少？'],
      visual: pictured ? (plus ? objs([a, b]) : objs([a], { gone: b })) : '',
      choices: choices(ans, 0, max),
    };
  }

  /* ---------- 畫面：蘋果、點點、直式 ---------- */
  const APPLE = '<svg viewBox="0 0 60 60"><path d="M30 15 Q33 6 40 4" stroke="#8a5a2b" stroke-width="3" fill="none"/><path d="M31 13 Q43 4 48 13 Q39 19 31 13Z" fill="#69db7c" stroke="#222" stroke-width="2"/><circle cx="30" cy="35" r="20" fill="#ff6b6b" stroke="#222" stroke-width="3"/><ellipse cx="23" cy="29" rx="5" ry="7" fill="#fff" opacity=".5"/></svg>';
  // groups：[3, 4] 代表「3 個＋4 個」；opt.gone 把最後幾個打叉；opt.lit 前幾個亮起來
  function objs(groups, opt = {}) {
    let k = 0;
    const total = groups.reduce((s, n) => s + n, 0);
    const row = n => `<div class="objs">${Array.from({ length: n }, () => {
      const i = k++;
      const cls = (opt.gone && i >= total - opt.gone ? ' gone' : '') + (opt.lit && i < opt.lit ? ' lit' : '');
      return `<span class="obj${cls}">${APPLE}${opt.lit && i < opt.lit ? `<b>${i + 1}</b>` : ''}</span>`;
    }).join('')}</div>`;
    return `<div class="math-visual-in${total > 10 ? ' many' : ''}">${groups.map(row).join('<span class="op">+</span>')}</div>`;
  }
  // a 排、每排 b 個點；lit 前幾排亮起來
  function groups(a, b, lit = a) {
    return `<div class="dot-groups">${Array.from({ length: a }, (_, r) =>
      `<div class="dot-row${r < lit ? ' lit' : ''}">${'<i></i>'.repeat(b)}${r < lit ? `<b>${b * (r + 1)}</b>` : ''}</div>`).join('')}</div>`;
  }
  // 直式：top 是上面那個數的每一位（可以被借位改掉），show 是答案從右邊算起顯示幾位，hl 是正在算的那一位
  function column({ a, b, plus, top, carry = {}, crossed = {}, res, show = 0, hl = -1 }) {
    const width = Math.max(String(a).length, String(b).length, String(res).length);
    const cell = (i, txt, cls = '') => `<span class="cell${i === hl ? ' hl' : ''} ${cls}">${txt}</span>`;
    const digits = (n, i) => { const s = String(n); return i < s.length ? s[s.length - 1 - i] : ''; };
    let html = `<div class="column" style="--w:${width + 1}">`;
    html += `<span class="cell op"></span>` + Array.from({ length: width }, (_, j) => { const i = width - 1 - j; return cell(i, carry[i] || '', 'carry'); }).join('');
    html += `<span class="cell op"></span>` + Array.from({ length: width }, (_, j) => {
      const i = width - 1 - j, orig = digits(a, i);
      return cell(i, crossed[i] !== undefined ? `<s>${orig}</s><em>${top[i]}</em>` : orig);
    }).join('');
    html += `<span class="cell op">${plus ? '+' : '−'}</span>` + Array.from({ length: width }, (_, j) => cell(width - 1 - j, digits(b, width - 1 - j))).join('');
    html += `<span class="line" style="grid-column: 1 / span ${width + 1}"></span>`;
    html += `<span class="cell op"></span>` + Array.from({ length: width }, (_, j) => { const i = width - 1 - j; return cell(i, i < show ? digits(res, i) : '', 'ans'); }).join('');
    return html + '</div>';
  }

  /* ---------- 教學：一步一步示範 ---------- */
  const PLACE = ['個位', '十位', '百位'];

  function columnLesson(a, b, plus) {
    const res = plus ? a + b : a - b;
    const width = Math.max(String(a).length, String(b).length);
    const topDigits = Array.from({ length: width }, (_, i) => Math.floor(a / 10 ** i) % 10);
    const bd = i => Math.floor(b / 10 ** i) % 10;
    const top = [...topDigits], carry = {}, crossed = {};
    const st = extra => ({ a, b, plus, top: [...top], carry: { ...carry }, crossed: { ...crossed }, res, ...extra });
    const steps = [{ html: column(st({})), text: `${a} ${plus ? '+' : '−'} ${b}，用直式來算`, say: [...N(a), plus ? '加' : '減', ...N(b), '用直式來算'] }];
    let c = 0;
    for (let i = 0; i < width; i++) {
      const p = PLACE[i];
      if (plus) {
        const s = top[i] + bd(i) + c;
        steps.push({
          html: column(st({ show: i, hl: i })),
          text: `${p}：${top[i]} + ${bd(i)}${c ? ' + 進位的 1' : ''} = ${s}`,
          say: [p, ...N(top[i]), '加', ...N(bd(i)), ...(c ? ['再加進位的一'] : []), '等於', ...N(s)],
        });
        c = s >= 10 && i < width - 1 ? 1 : 0;
        if (c) {
          carry[i + 1] = '1';
          steps.push({ html: column(st({ show: i + 1, hl: i })), text: `寫 ${s % 10}，進 1 到${PLACE[i + 1]}`, say: ['寫', ...N(s % 10), '進一'] });
        }
      } else {
        if (top[i] < bd(i)) {
          steps.push({ html: column(st({ show: i, hl: i })), text: `${p}：${top[i]} 不夠減 ${bd(i)}`, say: [p, ...N(top[i]), '不夠減', ...N(bd(i))] });
          top[i + 1] -= 1;
          crossed[i + 1] = true;
          const was = top[i];
          top[i] += 10;
          crossed[i] = true;
          steps.push({
            html: column(st({ show: i, hl: i })),
            text: `跟${PLACE[i + 1]}借 1，${was} 變成 ${top[i]}`,
            say: ['跟', PLACE[i + 1], '借一', ...N(was), '變成', ...N(top[i])],
          });
        }
        const d = top[i] - bd(i);
        steps.push({
          html: column(st({ show: i, hl: i })),
          text: `${p}：${top[i]} − ${bd(i)} = ${d}`,
          say: [p, ...N(top[i]), '減', ...N(bd(i)), '等於', ...N(d)],
        });
      }
    }
    steps.push({ html: column(st({ show: 9 })), text: `答案是 ${res}`, say: ['答案是', ...N(res)], done: true });
    return steps;
  }

  // 一步一步的圖解（教學和訂正都用）：數一數、加法、減法、乘法
  function countSteps(n) {
    return [
      { html: objs([n]), text: '數一數，有幾個？', say: ['數一數，有幾個？'] },
      ...Array.from({ length: n }, (_, k) => ({ html: objs([n], { lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
      { html: objs([n], { lit: n }), text: `總共有 ${n} 個`, say: ['總共有', ...N(n), '個'], done: true },
    ];
  }
  function addSteps(a, b) {
    const c = a + b;
    return [
      { html: objs([a]), text: `這裡有 ${a} 個`, say: ['這裡有', ...N(a), '個'] },
      { html: objs([a, b]), text: `再來 ${b} 個`, say: ['再來', ...N(b), '個'] },
      { html: objs([a, b]), text: '全部一起數一數', say: ['全部一起數一數'] },
      ...Array.from({ length: c }, (_, k) => ({ html: objs([a, b], { lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
      { html: objs([a, b], { lit: c }), text: `${a} + ${b} = ${c}`, say: [...N(a), '加', ...N(b), '等於', ...N(c)], done: true },
    ];
  }
  function subSteps(a, b) {
    const c = a - b;
    return [
      { html: objs([a]), text: `有 ${a} 個`, say: ['這裡有', ...N(a), '個'] },
      { html: objs([a], { gone: b }), text: `拿走 ${b} 個`, say: ['拿走', ...N(b), '個'] },
      ...Array.from({ length: c }, (_, k) => ({ html: objs([a], { gone: b, lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
      { html: objs([a], { gone: b, lit: c }), text: `還剩 ${c} 個，${a} − ${b} = ${c}`, say: ['還剩', ...N(c), '個', ...N(a), '減', ...N(b), '等於', ...N(c)], done: true },
    ];
  }
  function timesSteps(a, b) {
    return [
      { html: groups(a, b, 0), text: `${a} 排，每排 ${b} 個`, say: [...N(a), '排', '每排', ...N(b), '個'] },
      ...Array.from({ length: a }, (_, r) => ({ html: groups(a, b, r + 1), text: String(b * (r + 1)), say: N(b * (r + 1)) })),
      { html: groups(a, b), text: `${a} × ${b} = ${a * b}（${W.timesLine(a, b)}）`, say: [...N(a), '乘', ...N(b), '等於', ...N(a * b), W.timesLine(a, b)], done: true },
    ];
  }

  function lessonSteps(level) {
    if (level === 'count') return countSteps(6);
    if (level === 'add10') return addSteps(3, 4);
    if (level === 'add20') return addSteps(8, 5);
    if (level === 'sub10') return subSteps(7, 3);
    if (level === 'times25') return timesSteps(2, 4);
    if (level === 'times') return timesSteps(3, 4);
    if (level === 'add2a') return [...columnLesson(23, 45, true), ...columnLesson(68, 25, false)];
    if (level === 'add2b') return [...columnLesson(27, 15, true), ...columnLesson(42, 17, false)];
    return columnLesson(325, 418, true);
  }

  // 訂正：用這一題自己的數字，一步一步講為什麼
  function explainSteps(q, level) {
    if (q.op === 'count') return countSteps(q.ans);
    if (q.op === '×') return timesSteps(q.a, q.b);
    const small = level === 'add10' || level === 'sub10' || level === 'add20';
    if (!small) return columnLesson(q.a, q.b, q.op === '+');
    return q.op === '+' ? addSteps(q.a, q.b) : subSteps(q.a, q.b);
  }

  /* ---------- 練習 ---------- */
  const st = { level: null, i: 0, q: null, correct: 0, tries: 0, busy: false, mode: 'quiz', token: 0, view: 'menu', game: null, g: null, intro: null, mistakes: [], fix: null };
  // 遊戲最多出幾題：答錯很多次也一定會走到終點，不會一直玩不完
  const GAME_MAX = 10;
  // 題目／教學的字：有 qhtml 用 qhtml（注音要排直的），不然用純文字
  function setQ(x) {
    if (x.qhtml) $('mathQ').innerHTML = x.qhtml; else $('mathQ').textContent = x.text;
  }
  // 按鈕上的 data-v 是字串：換回選項本來的值（數字或注音）
  const valueOf = (q, btn) => q.choices.find(c => String(c) === btn.dataset.v);
  const choiceBtn = v => [...$('mathChoices').querySelectorAll('.choice')].find(b => b.dataset.v === String(v));

  // view：menu（選遊戲）、learn（看教學）、quiz（練習題）、或遊戲 id（race、feed、tower、frog）
  function open(levelId, view, subject) {
    const P = SUBJECTS[subject] || MATH;
    const lv = P.levels.find(l => l.id === levelId) || P.levels[0];
    if (view === true) view = 'learn';
    st.P = P;
    st.level = lv;
    st.token++;
    st.view = view === 'learn' || view === 'quiz' || GAMES[view] ? view : 'menu';
    st.game = GAMES[st.view] ? st.view : null;
    const info = GAME_LIST.find(x => x.id === st.game);
    $('mathTitle').textContent = info ? `${info.icon} ${lv.name}` : lv.name + (st.view === 'learn' ? '・看教學' : '');
    $('mathResult').hidden = true;
    $('math').style.setProperty('--c', lv.color);
    $('math').style.setProperty('--cd', lv.dark);
    $('math').dataset.subject = P.id;
    $('mathPage').classList.toggle('is-menu', st.view === 'menu');
    $('mathPage').classList.toggle('is-game', !!st.game);
    $('mathMenu').hidden = st.view !== 'menu';
    $('mathBoard').hidden = !st.game;
    $('mathBoard').className = 'math-board' + (st.game ? ' g-' + st.game : '');
    $('mathQ').classList.remove('done-step');
    $('mathPage').classList.remove('is-fix');
    $('mathFix').hidden = true;
    st.fix = null;
    if (st.view === 'menu') return menu();
    if (st.view === 'learn') return lesson();
    st.mode = 'quiz';
    st.i = 0;
    st.correct = 0;
    st.mistakes = [];
    st.intro = [info ? info.name : '練習題'];
    st.g = null;
    if (st.game) { st.g = {}; GAMES[st.game].setup(st.g); }
    next();
  }

  function slide() {
    // 遊戲時只讓題目滑進來，上面的跑道／小熊不動
    const els = st.game ? [$('mathVisual'), $('mathQ'), $('mathChoices')] : [$('mathPage')];
    els.forEach(el => {
      el.classList.remove('slide');
      void el.offsetWidth;
      el.classList.add('slide');
    });
  }

  function next() {
    if (!st.game && st.i >= ROUND) return quizEnd();
    st.q = st.P.makeQuestion(st.level.id);
    st.tries = 0;
    st.busy = false;
    $('mathDots').innerHTML = st.game ? '' : Array.from({ length: ROUND }, (_, k) => `<span class="${k < st.i ? 'done' : k === st.i ? 'on' : ''}"></span>`).join('');
    $('mathVisual').innerHTML = st.q.visual;
    $('mathVisual').hidden = !st.q.visual;
    $('mathVisual').classList.toggle('big', !!st.q.big);
    setQ(st.q);
    $('mathChoices').className = 'math-choices' + (st.q.cls ? ' ' + st.q.cls : '');
    $('mathChoices').innerHTML = st.q.choices.map(c => `<button class="choice" data-v="${c}">${st.P.label(c, st.q)}</button>`).join('');
    if (st.game && GAMES[st.game].question) GAMES[st.game].question(st.g, st.q);
    slide();
    setTimeout(say, 350);
  }

  const say = () => {
    if (st.mode === 'fix') return st.fix && st.fix.say && Voice.speak(st.fix.say);
    if (st.mode === 'lesson') return lessonStep(st.step);
    if (st.mode === 'menu') return Voice.speak(['選一個遊戲']);
    if (st.q && !st.busy) {
      const intro = st.intro || [];
      st.intro = null;
      const q = st.q, G = st.game && GAMES[st.game];
      Voice.speak([...intro, ...q.say], () => { if (G && G.heard && st.q === q) G.heard(st.g); });
    }
  };

  function choose(btn) {
    if (st.mode === 'fix') return fixChoose(btn);
    if (st.busy || btn.disabled) return;
    const v = valueOf(st.q, btn);
    st.busy = true;
    st.i++;
    if (v === st.q.ans) {
      st.correct++;
      btn.classList.add('right');
      Sound.play('twinkle');
      if (st.game) {
        const G = GAMES[st.game];
        return G.right(st.g, btn, () => (G.won(st.g) || (G.finishUp && st.i >= GAME_MAX) ? win() : next()));
      }
      // 等「答對了」念完才換下一題（念的長短不一定，不能用固定秒數，不然會被切掉）
      return talk(['答對了，好棒！'], next, 400);
    }
    // 答錯：不用一直猜，小小提醒一下、亮一下正確答案就換下一題；最後再一起訂正
    st.mistakes.push({ q: st.q, chosen: v });
    btn.classList.add('wrong');
    $('mathChoices').querySelectorAll('.choice').forEach(b => { b.disabled = true; });
    const right = choiceBtn(st.q.ans);
    if (right) right.classList.add('show');
    Sound.play('boing');
    const G = st.game && GAMES[st.game];
    const said = G ? G.wrong(st.g) : null;
    talk(said || ['沒關係，下一題'], () => {
      if (!G) return next();
      G.won(st.g) || (G.finishUp && st.i >= GAME_MAX) ? win() : next();
    }, 1600);
  }

  function stars(n, of) { return n >= of * .9 ? 3 : n >= of * .6 ? 2 : 1; }

  // 練習題做完：有錯的先訂正，再看結果
  function quizEnd() {
    if (st.mistakes.length) return review(finish);
    finish();
  }

  function finish() {
    st.mode = 'quiz';
    const n = st.correct;
    $('mathStars').textContent = n >= 9 ? '⭐⭐⭐' : n >= 6 ? '⭐⭐' : '⭐';
    $('mathScore').textContent = `答對了 ${n} 題`;
    $('mathResult').hidden = false;
    try {
      const key = `${st.P.store[0]}:${st.level.id}`;
      if (n > +(localStorage.getItem(key) || 0)) localStorage.setItem(key, n);
    } catch (e) { }
    Sound.play('yay');
    Voice.speak(['全部答完了！', '答對了', ...N(n), '題']);
  }

  /* ---------- 選遊戲 ---------- */
  function menu() {
    st.mode = 'menu';
    st.q = null;
    $('mathDots').innerHTML = '';
    const id = st.level.id;
    const card = (go, pic, name, star, c, d, cls = '') =>
      `<button class="game-card${cls}" data-go="${go}" style="--gc:${c};--gd:${d}"><span class="gpic">${pic}</span><span class="gname">${name}</span>${star ? `<span class="gbest">${'⭐'.repeat(star)}</span>` : ''}</button>`;
    const p = best(id);
    const base = `#/${st.P.route}/${id}`;
    $('mathMenu').innerHTML = GAME_LIST.map(g => card(`${base}/${g.id}`, g.pic(), g.name, best(id, g.id), g.color, g.dark)).join('') +
      card(`${base}/quiz`, '<span class="gemoji">✏️</span>', '練習題', p ? (p >= 9 ? 3 : p >= 6 ? 2 : 1) : 0, '#ffe066', '#f08c00', ' plain') +
      card(`${base}/learn`, '<span class="gemoji">📘</span>', '看教學', 0, '#a5d8ff', '#1c7ed6', ' plain');
    slide();
    const my = st.token;
    setTimeout(() => my === st.token && Voice.speak(['選一個遊戲']), 300);
  }

  $('mathMenu').addEventListener('click', e => {
    const c = e.target.closest('[data-go]');
    if (!c) return;
    Sound.play('click');
    location.hash = c.dataset.go;
  });

  /* ---------- 數學小遊戲：每一關的題目都能拿來玩 ----------
   * 每個遊戲有 setup（畫遊戲板）、question（出新題目時）、right（答對：動畫＋念一句，念完才呼叫 done）、
   * wrong（答錯：小小的退步或搖搖頭，回傳要念的句子；答錯不重答，直接下一題）、won（贏了沒）、
   * finishUp（題目出完了還沒到終點：直接幫他完成，一定會贏）、winSay（贏了念的話）。
   */
  // 把線稿畫成彩色小圖，vb 把空白裁掉
  function DRAW(id, vb) {
    const d = window.ART && ART.DRAWINGS.find(x => x.id === id);
    if (!d) return '';
    const svg = ART.svgDoc(d.svg);
    return vb ? svg.replace('viewBox="0 0 800 600"', `viewBox="${vb}" preserveAspectRatio="xMidYMax meet"`) : svg;
  }
  const VB = { car: '88 186 646 292', bear: '243 103 459 478', frog: '145 117 510 455', bunny: '263 15 409 558' };
  const TOWER_PIC = `<svg viewBox="0 0 120 120"><g stroke="#222" stroke-width="4" stroke-linejoin="round">
    <rect x="20" y="92" width="80" height="20" rx="5" fill="#ff6b6b"/><rect x="26" y="70" width="68" height="20" rx="5" fill="#ffd43b"/>
    <rect x="32" y="48" width="56" height="20" rx="5" fill="#69db7c"/><rect x="38" y="26" width="44" height="20" rx="5" fill="#4dabf7"/></g>
    <path d="M60 4 L64 14 L75 14 L66 20 L70 30 L60 24 L50 30 L54 20 L45 14 L56 14 Z" fill="#ffd43b" stroke="#222" stroke-width="3" stroke-linejoin="round"/></svg>`;
  const GAME_LIST = [
    { id: 'race', icon: '🚗', name: '賽車', color: '#ffa8a8', dark: '#e03131', pic: () => DRAW('car', VB.car) },
    { id: 'feed', icon: '🐻', name: '餵小熊', color: '#ffd8a8', dark: '#e8590c', pic: () => DRAW('bear', VB.bear) },
    { id: 'tower', icon: '🧱', name: '蓋高塔', color: '#bac8ff', dark: '#4263eb', pic: () => TOWER_PIC },
    { id: 'frog', icon: '🐸', name: '青蛙跳荷葉', color: '#b2f2bb', dark: '#2f9e44', pic: () => DRAW('frog', VB.frog) },
  ];

  // 只在還在同一個畫面時才做（換畫面、重玩後舊的計時器就不動）
  function later(fn, ms) {
    const my = st.token;
    setTimeout(() => my === st.token && fn(), ms);
  }
  // 念一串話，念完（而且至少過了 minMs）才做 cb；聲音放不出來時 6 秒後也會繼續
  function talk(list, cb, minMs = 0) {
    const my = st.token, t0 = Date.now();
    let fired = false;
    const go = () => {
      if (fired || my !== st.token) return;
      fired = true;
      setTimeout(() => my === st.token && cb(), Math.max(250, minMs - (Date.now() - t0)));
    };
    Voice.speak(list, go);
    setTimeout(go, 6000 + minMs);
  }
  // 重新播一次動畫 class
  function bump(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
  }
  const at = (id, p) => { const el = $(id); if (el) { el.style.setProperty('--p', p); bump(el, 'hop'); } };
  // 水果從按鈕飛到小熊嘴巴
  function toss(from, to, emoji, cb) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'flyer';
    el.textContent = emoji;
    document.body.appendChild(el);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width * .38, y1 = b.top + b.height * .32;   // 小熊的嘴巴
    const pos = (x, y, s, r) => `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${s}) rotate(${r}deg)`;
    let done = false;
    const end = () => { if (done) return; done = true; el.remove(); cb(); };
    if (el.animate) {
      el.animate([
        { transform: pos(x0, y0, 1, 0) },
        { transform: pos((x0 + x1) / 2, Math.min(y0, y1) - 70, 1.5, 180), offset: .5 },
        { transform: pos(x1, y1, .5, 360) },
      ], { duration: 700, easing: 'ease-in-out', fill: 'forwards' }).onfinish = end;
    }
    setTimeout(end, 900);
  }

  const TRACK = 15, FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍑', '🍉'], BLOCKS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc'];
  const PADS = 10, LOTUS = 6;

  const GAMES = {
    // 🚗 賽車：真的比賽！小藍車在你想題目的時候自己慢慢往前開（念題目、動畫的時候會停下來等）。
    //   答對往前三格，答錯退一格（不會退到起點後面），誰先到終點誰贏。
    //   小藍車的速度跟關卡難度有關：正常速度答對的小朋友通常會贏，太慢或錯很多會輸一點點。
    race: {
      setup(g) {
        g.pos = 0;
        g.rival = 0;
        g.go = false;      // 題目念完才開始算時間
        g.over = false;
        g.pace = (st.P.pace || { easy: 2800, mid: 3600, hard: 4500 })[st.level.tier] || 3200;   // 想題目時小藍車每幾毫秒走一格
        g.wait = g.pace;
        const cells = Array.from({ length: TRACK + 1 }, (_, k) =>
          `<i class="${k === 0 ? 'start' : k === TRACK ? 'goal' : ''}">${k > 0 && k < TRACK ? k : ''}</i>`).join('');
        const car = DRAW('car', VB.car);
        const tag = { rival: '🔵 小藍車', me: '⭐ 你' };
        $('mathBoard').innerHTML = `<div class="race"><span class="flag">🏁</span>${['rival', 'me'].map(w =>
          `<div class="lane ${w}"><span class="lane-tag">${tag[w]}</span><div class="track">${cells}<div class="racer" id="race-${w}" style="--p:0">${car}</div></div></div>`).join('')}</div>`;
        const my = st.token, TICK = 200;
        const timer = setInterval(() => {
          if (my !== st.token || g.over) return clearInterval(timer);
          if (st.mode !== 'quiz' || st.busy || !g.go) return;
          g.wait -= TICK;
          if (g.wait > 0) return;
          g.wait = g.pace * (.8 + Math.random() * .4);
          g.rival++;
          at('race-rival', g.rival);
          if (g.rival >= TRACK) { clearInterval(timer); lose(); }
        }, TICK);
      },
      question(g, q) {
        g.go = false;
        later(() => { if (st.q === q) g.go = true; }, 6000);   // 萬一聲音沒放出來
      },
      heard(g) { g.go = true; },
      right(g, btn, done) {
        const end = g.pos + 3 >= TRACK;
        let k = 0;
        const step = () => {
          if (k++ >= 3 || g.pos >= TRACK) return;
          g.pos++;
          at('race-me', g.pos);
          Sound.play('pop');
          later(step, 330);
        };
        step();
        talk(end ? [] : ['往前走三格！'], done, 1300);
      },
      wrong(g) {
        if (g.pos <= 0) return null;
        g.pos--;
        at('race-me', g.pos);
        return ['退一格，沒關係！'];
      },
      won: g => g.pos >= TRACK,
      winSay: '你贏了！',
    },

    // 🐻 餵小熊：答對就把水果丟進小熊嘴巴，六個水果吃飽了小熊就跳舞
    feed: {
      setup(g) {
        g.n = 0;
        $('mathBoard').innerHTML = `<div class="feed"><div class="belly"><div class="slots">${FRUITS.map(f => `<span class="slot">${f}</span>`).join('')}</div>
          <div class="full"><span id="feedBar"></span></div></div><div class="eater" id="eater">${DRAW('bear', VB.bear)}</div></div>`;
      },
      right(g, btn, done) {
        const k = g.n++;
        toss(btn, $('eater'), FRUITS[k % FRUITS.length], () => {
          const s = $('mathBoard').querySelectorAll('.slot')[k];
          if (s) s.classList.add('on');
          if ($('feedBar')) $('feedBar').style.width = `${Math.min(100, g.n / FRUITS.length * 100)}%`;
          bump($('eater'), 'chomp');
          Sound.play('pop');
        });
        later(() => talk(g.n >= FRUITS.length ? [] : ['好好吃！'], done, 500), 750);
      },
      wrong() { bump($('eater'), 'nope'); return null; },
      won: g => g.n >= FRUITS.length,
      finishUp(g) {
        g.n = FRUITS.length;
        $('mathBoard').querySelectorAll('.slot').forEach(x => x.classList.add('on'));
        if ($('feedBar')) $('feedBar').style.width = '100%';
        bump($('eater'), 'chomp');
      },
      winSay: '小熊吃飽了，好開心！',
    },

    // 🧱 蓋高塔：答對就疊一塊積木，疊到六塊放上星星；答錯塔只是晃一晃
    tower: {
      setup(g) {
        g.n = 0;
        $('mathBoard').innerHTML = `<div class="tower-board"><div class="tower" id="tower"><b class="top">⭐</b>${BLOCKS.map((c, k) =>
          `<i style="--k:${k};--bc:${c}"></i>`).join('')}</div><div class="helper" id="helper">${DRAW('bunny', VB.bunny)}</div></div>`;
      },
      right(g, btn, done) {
        const b = $('tower') && $('tower').querySelectorAll('i')[g.n];
        if (b) b.classList.add('on');
        g.n++;
        Sound.play('pop');
        bump($('helper'), 'cheer');
        talk(g.n >= BLOCKS.length ? [] : ['再蓋高一點！'], done, 800);
      },
      wrong() { bump($('tower'), 'wobble'); return null; },
      won: g => g.n >= BLOCKS.length,
      finishUp(g) { g.n = BLOCKS.length; if ($('tower')) $('tower').querySelectorAll('i').forEach(x => x.classList.add('on')); },
      winSay: '高塔蓋好了，好棒！',
    },

    // 🐸 青蛙跳荷葉：
    //   10 以內的關卡＝數線：青蛙站在第一個數，答對後一格一格跳（加往右、減往左），邊跳邊數，收集六朵花
    //   其他關卡＝過河：答對往前跳兩片荷葉，跳到第十片就過河了
    frog: {
      setup(g) {
        g.line = !!(st.P.frogLine && st.P.frogLine(st.level.id));
        g.pos = 0;
        g.got = 0;
        const pads = Array.from({ length: PADS + 1 }, (_, k) => `<i><b>${!g.line && k === PADS ? '🌸' : k}</b></i>`).join('');
        $('mathBoard').innerHTML = `<div class="pond${g.line ? ' line' : ''}">${g.line ? `<div class="lotus">${'<span>🌸</span>'.repeat(LOTUS)}</div>` : ''}
          <div class="pads">${pads}<div class="frog" id="frog" style="--p:0">${DRAW('frog', VB.frog)}</div></div></div>`;
      },
      question(g, q) {
        if (!g.line) return;
        g.pos = q.op === 'count' ? 0 : q.a;
        $('frog').style.setProperty('--p', g.pos);
      },
      right(g, btn, done) {
        if (!g.line) {
          const to = Math.min(PADS, g.pos + 2);
          const hop = () => {
            if (g.pos >= to) return;
            at('frog', ++g.pos);
            Sound.play('pop');
            later(hop, 380);
          };
          hop();
          later(() => talk(to >= PADS ? [] : ['跳到', ...N(to)], done, 300), 760);
          return;
        }
        const q = st.q, dir = q.op === '−' ? -1 : 1, steps = q.op === 'count' ? q.ans : q.b;
        let k = 0;
        const land = () => {
          const s = $('mathBoard').querySelectorAll('.lotus span')[g.got++];
          if (s) s.classList.add('on');
          Sound.play('twinkle');
          later(done, 600);
        };
        // 跳一格念一個數字，念完再跳下一格
        const hop = () => {
          if (k >= steps) return land();
          k++;
          g.pos += dir;
          at('frog', g.pos);
          Sound.play('pop');
          talk(N(g.pos), hop, 420);
        };
        if (steps === 0) { at('frog', g.pos); talk(N(g.pos), land, 400); } else later(hop, 300);
      },
      wrong() { bump($('frog'), 'nope'); return null; },
      won: g => (g.line ? g.got >= LOTUS : g.pos >= PADS),
      finishUp(g) {
        if (g.line) { g.got = LOTUS; $('mathBoard').querySelectorAll('.lotus span').forEach(x => x.classList.add('on')); } else { g.pos = PADS; at('frog', PADS); }
      },
      winSay: '青蛙好開心，你好棒！',
    },
  };

  function win() {
    const G = GAMES[st.game];
    if (!G.won(st.g)) G.finishUp(st.g);   // 題目出完了：直接幫他走到終點（一定會贏）
    $('mathBoard').classList.add('win');
    Sound.play('yay');
    talk([G.winSay], () => {
      if (st.mistakes.length) return review(showResult);
      talk(['全部答對，好厲害！'], showResult, 600);
    }, 1500);
  }

  // 賽車輸了：溫柔地鼓勵，一樣接著訂正
  function lose() {
    st.g.over = true;
    st.g.lost = true;
    st.busy = true;
    Voice.cancel();
    $('mathChoices').querySelectorAll('.choice').forEach(b => { b.disabled = true; });
    $('mathBoard').classList.add('lost');
    Sound.play('pop');
    talk(['差一點點！再試一次！'], () => (st.mistakes.length ? review(showResult) : showResult()), 1500);
  }

  /* ---------- 訂正時間：最後把答錯的題目一題一題拿出來，講為什麼，再答一次 ---------- */
  function review(done) {
    st.mode = 'fix';
    st.q = null;
    st.fix = { list: st.mistakes.slice(), k: 0, done, say: null };
    $('mathPage').classList.add('is-fix');
    $('mathBoard').hidden = true;
    fixShow(true);
  }

  function fixShow(first) {
    const f = st.fix, m = f.list[f.k], q = m.q;
    f.busy = true;
    f.tries = 0;
    $('mathTitle').textContent = `✏️ 訂正時間 ${f.k + 1}/${f.list.length}`;
    $('mathDots').innerHTML = f.list.map((_, k) => `<span class="${k < f.k ? 'done' : k === f.k ? 'on' : ''}"></span>`).join('');
    $('mathVisual').innerHTML = q.visual;
    $('mathVisual').hidden = !q.visual;
    $('mathVisual').classList.toggle('big', !!q.big);
    setQ(q);
    $('mathQ').classList.remove('done-step');
    $('mathFix').hidden = false;
    $('mathFix').innerHTML = `<div class="fix-card bad"><span class="fix-mark">✗</span><span class="fix-lbl">你選了</span><b>${st.P.label(m.chosen, q)}</b></div>
      <div class="fix-card good" hidden><span class="fix-mark">✓</span><span class="fix-lbl">正確答案是</span><b>${st.P.label(q.ans, q)}</b></div>`;
    $('mathChoices').className = 'math-choices' + (q.cls ? ' ' + q.cls : '');
    $('mathChoices').innerHTML = q.choices.map(c => `<button class="choice${c === m.chosen ? ' was' : ''}" data-v="${c}" disabled>${st.P.label(c, q)}</button>`).join('');
    slide();
    // 先念題目，再一步一步講為什麼，最後告訴他選了什麼、正確答案是什麼
    f.say = [...(first ? ['我們來訂正'] : []), ...q.say];
    later(() => talk(f.say, () => fixSteps(st.P.explainSteps(q, st.level.id, m.chosen), 0), 500), 350);
  }

  function fixSteps(steps, k) {
    if (k >= steps.length) return fixAsk();
    const s = steps[k];
    $('mathVisual').hidden = false;
    $('mathVisual').innerHTML = s.html;
    setQ(s);
    $('mathQ').classList.toggle('done-step', !!s.done);
    st.fix.say = s.say;
    talk(s.say, () => fixSteps(steps, k + 1), s.fast ? 0 : 700);
  }

  function fixAsk() {
    const f = st.fix, m = f.list[f.k], q = m.q;
    setQ(q);
    // 講解完：把題目的圖放回來，再讓他選一次
    if (st.P.id !== 'math') { $('mathVisual').innerHTML = q.visual; $('mathVisual').hidden = !q.visual; $('mathVisual').classList.toggle('big', !!q.big); }
    $('mathQ').classList.remove('done-step');
    const good = $('mathFix').querySelector('.good');
    if (good) good.hidden = false;
    $('mathChoices').querySelectorAll('.choice').forEach(b => { b.disabled = false; });
    f.busy = false;
    f.say = st.P.fixSay(m, q);
    Voice.speak(f.say);
  }

  function fixChoose(btn) {
    const f = st.fix;
    if (!f || f.busy || btn.disabled) return;
    const q = f.list[f.k].q;
    if (valueOf(q, btn) === q.ans) {
      f.busy = true;
      btn.classList.remove('hint');
      btn.classList.add('right');
      Sound.play('twinkle');
      return talk(['答對了，好棒！'], () => {
        if (++f.k < f.list.length) return fixShow(false);
        $('mathDots').innerHTML = f.list.map(() => '<span class="done"></span>').join('');
        Sound.play('yay');
        talk(['訂正完成，你好棒！'], f.done, 600);
      }, 400);
    }
    // 又選錯：再告訴他一次答案，讓他點正確的那一個
    btn.disabled = true;
    btn.classList.add('wrong');
    Sound.play('boing');
    const right = choiceBtn(q.ans);
    if (right) right.classList.add('hint');
    Voice.speak(st.P.answerSay(q));
  }

  function showResult() {
    st.mode = 'quiz';
    const info = GAME_LIST.find(x => x.id === st.game);
    const s = stars(st.correct, st.i);
    $('mathStars').textContent = '⭐'.repeat(s);
    $('mathScore').textContent = `${info.icon} ${st.g && st.g.lost ? '差一點點！' : ''}答對了 ${st.correct} 題`;
    $('mathResult').hidden = false;
    try {
      const key = `${st.P.store[1]}:${st.level.id}:${st.game}`;
      if (s > +(localStorage.getItem(key) || 0)) localStorage.setItem(key, s);
    } catch (e) { }
    Sound.play('twinkle');
  }

  /* ---------- 教學播放：每一步念完自動到下一步 ---------- */
  function lesson() {
    st.mode = 'lesson';
    st.steps = st.P.lessonSteps(st.level.id);
    st.step = 0;
    $('mathDots').innerHTML = '';
    $('mathChoices').className = 'math-choices lesson-bar';
    $('mathChoices').innerHTML = '<button class="pill big" data-act="replay">🔁 再看一次</button><button class="pill big go" data-act="practice">✏️ 開始練習</button>';
    slide();
    setTimeout(() => lessonStep(0), 300);
  }

  function lessonStep(k) {
    const my = ++st.token;
    st.step = k;
    const s = st.steps[k];
    $('mathVisual').hidden = false;
    $('mathVisual').classList.remove('big');
    $('mathVisual').innerHTML = s.html;
    setQ(s);
    $('mathQ').classList.toggle('done-step', !!s.done);
    $('mathChoices').classList.toggle('ready', k === st.steps.length - 1);
    Voice.speak(s.say, () => {
      if (my !== st.token || st.mode !== 'lesson') return;
      if (k + 1 < st.steps.length) setTimeout(() => my === st.token && lessonStep(k + 1), s.fast ? 150 : 700);
      else Sound.play('twinkle');
    });
  }

  $('mathChoices').addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    if (act) {
      Sound.play('click');
      if (act.dataset.act === 'replay') lessonStep(0);
      else { location.hash = `#/${st.P.route}/${st.level.id}/quiz`; }
      return;
    }
    const b = e.target.closest('.choice');
    if (b) choose(b);
  });
  $('mathSay').addEventListener('click', say);
  $('mathAgain').addEventListener('click', () => open(st.level.id, st.view, st.P.id));
  $('mathPick').addEventListener('click', () => { location.hash = `#/${st.P.route}/${st.level.id}`; });
  $('mathBack').addEventListener('click', () => { location.hash = '#/'; });
  // 在遊戲／練習裡按小房子先回到「選遊戲」，在選遊戲畫面再按才回首頁
  $('mathHome').addEventListener('click', () => { location.hash = st.view === 'menu' ? '#/' : `#/${st.P.route}/${st.level.id}`; });

  // 練習題：最多答對幾題；遊戲：最多拿過幾顆星
  function best(id, game, P = st.P || MATH) {
    try { return +(localStorage.getItem(game ? `${P.store[1]}:${id}:${game}` : `${P.store[0]}:${id}`) || 0); } catch (e) { return 0; }
  }

  // 首頁：三個階段，每關一張卡；左上角「看教學」，點卡片選遊戲（賽車、餵小熊、蓋高塔、青蛙跳、練習題）
  // subject：'math'（預設）或其他登記過的科目（例如 'zhuyin'）；extra 是接在最後面的卡片（數學：九九乘法歌）
  function cards(extra, subject) {
    const P = SUBJECTS[subject] || MATH;
    let i = 0;
    return P.tiers.map(t => `<h3 class="tier-title">${t.name}<small>${t.note}</small></h3>` +
      P.levels.filter(l => l.tier === t.id).map(l => {
        const b = best(l.id, null, P);
        return `<div class="card story math-card${P.cardClass ? ' ' + P.cardClass : ''}" role="button" data-go="#/${P.route}/${l.id}" data-say="${l.say || l.name}" style="--i:${i++};--c:${l.color};--cd:${l.dark}">
          <span class="thumb">${l.showHTML || `<span class="math-show">${l.show}</span>`}
            <span class="learn" data-go="#/${P.route}/${l.id}/learn" data-say="看教學" role="button">📘 看教學</span>
            ${b ? `<span class="best">${b >= 9 ? '⭐⭐⭐' : b >= 6 ? '⭐⭐' : '⭐'}</span>` : ''}</span>
          <div class="name">✏️ ${l.name}</div></div>`;
      }).join('')).join('') + (extra ? `<h3 class="tier-title">🎵 九九乘法歌<small>跟著念口訣</small></h3>` + extra : '');
  }

  /* ---------- 科目：題目、教學、訂正由科目提供；練習題和四個遊戲（賽車、餵小熊、蓋高塔、青蛙）大家共用 ----------
   * 科目要有：id、route（網址 #/route/關卡）、store（存星星用的兩個前綴）、tiers、levels、
   *   makeQuestion(關卡) → { ans, choices, say, text 或 qhtml, visual, cls?, big? }、lessonSteps(關卡)、explainSteps(題目, 關卡, 選的)
   * 可以有：label(選項, 題目) → 按鈕裡的 HTML、fixSay(錯題) / answerSay(題目) → 訂正時念的話、frogLine(關卡)、pace。
   */
  const MATH = {
    id: 'math', route: 'math', store: ['math', 'mathgame'], tiers: TIERS, levels: LEVELS,
    makeQuestion, lessonSteps, explainSteps: (q, level) => explainSteps(q, level),
    frogLine: id => ['count', 'add10', 'sub10'].includes(id),
  };
  const SUBJECTS = {};
  function register(P) {
    SUBJECTS[P.id] = Object.assign(P, Object.assign({
      label: c => String(c),
      fixSay: (m, q) => ['你選了', ...N(m.chosen), '正確答案是', ...N(q.ans), '換你選選看'],
      answerSay: q => ['答案是', ...N(q.ans)],
    }, P));
  }
  register(MATH);

  window.MathGame = { open, cards, register, stop: () => { st.q = null; st.token++; Voice.cancel(); } };
})();
