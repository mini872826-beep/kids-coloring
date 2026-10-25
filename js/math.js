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
      return { ans: n, text: '數一數，有幾個？', say: ['數一數，有幾個？'], visual: objs([n]), choices: choices(n, 1, 10) };
    }
    if (level === 'times25' || level === 'times') {
      const a = level === 'times25' ? [2, 5][rnd(0, 1)] : rnd(2, 9), b = level === 'times25' ? rnd(1, 9) : rnd(2, 9);
      return {
        ans: a * b, text: `${a} × ${b} = ?`, say: [...N(a), '乘', ...N(b), '等於多少？'],
        visual: level === 'times25' ? groups(a, b) : '', choices: choices(a * b, 1, 81),
      };
    }
    const [a, b, plus] = pickAddSub(level);
    const ans = plus ? a + b : a - b;
    const max = { add10: 10, sub10: 10, add20: 20, add2a: 99, add2b: 99 }[level] || 1000;
    const pictured = level === 'add10' || level === 'sub10' || level === 'add20';
    return {
      ans, text: `${a} ${plus ? '+' : '−'} ${b} = ?`,
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

  function lessonSteps(level) {
    if (level === 'count') {
      const n = 6;
      return [
        { html: objs([n]), text: '數一數，有幾個？', say: ['數一數，有幾個？'] },
        ...Array.from({ length: n }, (_, k) => ({ html: objs([n], { lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
        { html: objs([n], { lit: n }), text: `總共有 ${n} 個`, say: ['總共有', ...N(n), '個'], done: true },
      ];
    }
    if (level === 'add10' || level === 'add20') {
      const [a, b] = level === 'add10' ? [3, 4] : [8, 5], c = a + b;
      return [
        { html: objs([a]), text: `這裡有 ${a} 個`, say: ['這裡有', ...N(a), '個'] },
        { html: objs([a, b]), text: `再來 ${b} 個`, say: ['再來', ...N(b), '個'] },
        { html: objs([a, b]), text: '全部一起數一數', say: ['全部一起數一數'] },
        ...Array.from({ length: c }, (_, k) => ({ html: objs([a, b], { lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
        { html: objs([a, b], { lit: c }), text: `${a} + ${b} = ${c}`, say: [...N(a), '加', ...N(b), '等於', ...N(c)], done: true },
      ];
    }
    if (level === 'sub10') {
      const a = 7, b = 3, c = a - b;
      return [
        { html: objs([a]), text: `有 ${a} 個`, say: ['這裡有', ...N(a), '個'] },
        { html: objs([a], { gone: b }), text: `拿走 ${b} 個`, say: ['拿走', ...N(b), '個'] },
        ...Array.from({ length: c }, (_, k) => ({ html: objs([a], { gone: b, lit: k + 1 }), text: String(k + 1), say: N(k + 1), fast: true })),
        { html: objs([a], { gone: b, lit: c }), text: `還剩 ${c} 個，${a} − ${b} = ${c}`, say: ['還剩', ...N(c), '個', ...N(a), '減', ...N(b), '等於', ...N(c)], done: true },
      ];
    }
    if (level === 'times25' || level === 'times') {
      const [a, b] = level === 'times25' ? [2, 4] : [3, 4];
      return [
        { html: groups(a, b, 0), text: `${a} 排，每排 ${b} 個`, say: [...N(a), '排', '每排', ...N(b), '個'] },
        ...Array.from({ length: a }, (_, r) => ({ html: groups(a, b, r + 1), text: String(b * (r + 1)), say: N(b * (r + 1)) })),
        { html: groups(a, b), text: `${a} × ${b} = ${a * b}（${W.timesLine(a, b)}）`, say: [...N(a), '乘', ...N(b), '等於', ...N(a * b), W.timesLine(a, b)], done: true },
      ];
    }
    if (level === 'add2a') return [...columnLesson(23, 45, true), ...columnLesson(68, 25, false)];
    if (level === 'add2b') return [...columnLesson(27, 15, true), ...columnLesson(42, 17, false)];
    return columnLesson(325, 418, true);
  }

  /* ---------- 練習 ---------- */
  const st = { level: null, i: 0, q: null, correct: 0, tries: 0, busy: false, mode: 'quiz', token: 0 };

  function open(levelId, learn) {
    const lv = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    st.level = lv;
    st.token++;
    $('mathTitle').textContent = lv.name + (learn ? '・看教學' : '');
    $('mathResult').hidden = true;
    $('math').style.setProperty('--c', lv.color);
    $('math').style.setProperty('--cd', lv.dark);
    if (learn) return lesson();
    st.mode = 'quiz';
    st.i = 0;
    st.correct = 0;
    next();
  }

  function slide() {
    const page = $('mathPage');
    page.classList.remove('slide');
    void page.offsetWidth;
    page.classList.add('slide');
  }

  function next() {
    if (st.i >= ROUND) return finish();
    st.q = makeQuestion(st.level.id);
    st.tries = 0;
    st.busy = false;
    $('mathDots').innerHTML = Array.from({ length: ROUND }, (_, k) => `<span class="${k < st.i ? 'done' : k === st.i ? 'on' : ''}"></span>`).join('');
    $('mathVisual').innerHTML = st.q.visual;
    $('mathVisual').hidden = !st.q.visual;
    $('mathVisual').classList.toggle('big', st.level.id === 'count');
    $('mathQ').textContent = st.q.text;
    $('mathChoices').className = 'math-choices';
    $('mathChoices').innerHTML = st.q.choices.map(c => `<button class="choice" data-v="${c}">${c}</button>`).join('');
    slide();
    setTimeout(say, 350);
  }

  const say = () => {
    if (st.mode === 'lesson') return lessonStep(st.step);
    if (st.q) Voice.speak(st.q.say);
  };

  function choose(btn) {
    if (st.busy || btn.disabled) return;
    const v = +btn.dataset.v;
    if (v === st.q.ans) {
      st.busy = true;
      if (st.tries === 0) st.correct++;
      btn.classList.add('right');
      Sound.play('twinkle');
      Voice.speak(['答對了，好棒！']);
      st.i++;
      setTimeout(next, 1500);
    } else {
      st.tries++;
      btn.disabled = true;
      btn.classList.add('wrong');
      Sound.play('boing');
      if (st.tries >= 2) {
        // 錯兩次就提示答案
        $('mathChoices').querySelector(`[data-v="${st.q.ans}"]`).classList.add('hint');
        Voice.speak(['答案是', ...N(st.q.ans)]);
      } else {
        Voice.speak(['再想想看']);
      }
    }
  }

  function finish() {
    const n = st.correct;
    $('mathStars').textContent = n >= 9 ? '⭐⭐⭐' : n >= 6 ? '⭐⭐' : '⭐';
    $('mathScore').textContent = `答對了 ${n} 題`;
    $('mathResult').hidden = false;
    try {
      const key = 'math:' + st.level.id;
      if (n > +(localStorage.getItem(key) || 0)) localStorage.setItem(key, n);
    } catch (e) { }
    Sound.play('yay');
    Voice.speak(['全部答完了！', '答對了', ...N(n), '題']);
  }

  /* ---------- 教學播放：每一步念完自動到下一步 ---------- */
  function lesson() {
    st.mode = 'lesson';
    st.steps = lessonSteps(st.level.id);
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
    $('mathQ').textContent = s.text;
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
      else { location.hash = `#/math/${st.level.id}`; }
      return;
    }
    const b = e.target.closest('.choice');
    if (b) choose(b);
  });
  $('mathSay').addEventListener('click', say);
  $('mathAgain').addEventListener('click', () => open(st.level.id));
  $('mathBack').addEventListener('click', () => { location.hash = '#/'; });
  $('mathHome').addEventListener('click', () => { location.hash = '#/'; });

  function best(id) {
    try { return +(localStorage.getItem('math:' + id) || 0); } catch (e) { return 0; }
  }

  // 首頁：三個階段，每關一張卡；左上角「看教學」，點卡片開始練習
  function cards(timesCards) {
    let i = 0;
    return TIERS.map(t => `<h3 class="tier-title">${t.name}<small>${t.note}</small></h3>` +
      LEVELS.filter(l => l.tier === t.id).map(l => {
        const b = best(l.id);
        return `<div class="card story math-card" role="button" data-go="#/math/${l.id}" data-say="${l.name}" style="--i:${i++};--c:${l.color};--cd:${l.dark}">
          <span class="thumb"><span class="math-show">${l.show}</span>
            <span class="learn" data-go="#/math/${l.id}/learn" data-say="看教學" role="button">📘 看教學</span>
            ${b ? `<span class="best">${b >= 9 ? '⭐⭐⭐' : b >= 6 ? '⭐⭐' : '⭐'}</span>` : ''}</span>
          <div class="name">✏️ ${l.name}</div></div>`;
      }).join('')).join('') + `<h3 class="tier-title">🎵 九九乘法歌<small>跟著念口訣</small></h3>` + timesCards;
  }

  window.MathGame = { open, cards, stop: () => { st.q = null; st.token++; Voice.cancel(); } };
})();
