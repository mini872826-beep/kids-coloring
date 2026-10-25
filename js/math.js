/* 學數學：數一數、個位數／十位數／百位數加減，每一關 10 題選擇題。
 * 題目用 AI 聲音念：數字拆成片段念（見 words.js 的 numberWords）。
 */
(function () {
  const $ = id => document.getElementById(id);
  const W = window.WORDS;
  const ROUND = 10;

  const LEVELS = [
    { id: 'count', name: '數一數', show: '1 2 3', color: '#ff6b6b', dark: '#e03131' },
    { id: 'add1', name: '個位數加減', show: '3 + 4', color: '#4dabf7', dark: '#1c7ed6' },
    { id: 'add2', name: '十位數加減', show: '23 + 45', color: '#20c997', dark: '#099268' },
    { id: 'add3', name: '百位數加減', show: '325 + 418', color: '#845ef7', dark: '#6741d9' },
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

  function makeQuestion(level) {
    if (level === 'count') {
      const n = rnd(1, 10);
      return { ans: n, text: '數一數，有幾個？', say: ['數一數，有幾個？'], visual: { a: n }, choices: choices(n, 1, 10) };
    }
    const plus = Math.random() < .5;
    let a, b;
    if (level === 'add1') {
      if (plus) { a = rnd(0, 9); b = rnd(0, Math.min(9, 10 - a)); } else { a = rnd(1, 10); b = rnd(0, a); }
    } else if (level === 'add2') {
      if (plus) { a = rnd(10, 89); b = rnd(1, 99 - a); } else { a = rnd(20, 99); b = rnd(1, a - 1); }
    } else {
      if (plus) { a = rnd(100, 899); b = rnd(10, 999 - a); } else { a = rnd(200, 999); b = rnd(10, a - 1); }
    }
    const ans = plus ? a + b : a - b;
    const max = level === 'add1' ? 10 : level === 'add2' ? 99 : 1000;
    return {
      ans,
      text: `${a} ${plus ? '+' : '−'} ${b} = ?`,
      say: [...W.numberWords(a), plus ? '加' : '減', ...W.numberWords(b), '等於多少？'],
      visual: level === 'add1' ? { a, b, plus } : null,
      choices: choices(ans, 0, max),
    };
  }

  // 蘋果和星星輪流出現，減法要拿掉的會變淡、打叉
  const APPLE = '<svg viewBox="0 0 60 60"><path d="M30 15 Q33 6 40 4" stroke="#8a5a2b" stroke-width="3" fill="none"/><path d="M31 13 Q43 4 48 13 Q39 19 31 13Z" fill="#69db7c" stroke="#222" stroke-width="2"/><circle cx="30" cy="35" r="20" fill="#ff6b6b" stroke="#222" stroke-width="3"/><ellipse cx="23" cy="29" rx="5" ry="7" fill="#fff" opacity=".5"/></svg>';
  const STAR = '<svg viewBox="0 0 60 60"><path d="M30 5 L37 22 L55 23 L41 35 L46 53 L30 43 L14 53 L19 35 L5 23 L23 22 Z" fill="#ffd43b" stroke="#222" stroke-width="3" stroke-linejoin="round"/></svg>';
  function visual(v, icon) {
    if (!v) return '';
    const row = (n, cross = 0) => `<div class="objs">${Array.from({ length: n }, (_, i) => `<span class="obj${i >= n - cross ? ' gone' : ''}">${icon}</span>`).join('')}</div>`;
    if (v.b === undefined) return row(v.a);
    if (v.plus) return `${row(v.a)}<span class="op">+</span>${row(v.b)}`;
    return row(v.a, v.b);
  }

  const st = { level: null, i: 0, q: null, correct: 0, tries: 0, busy: false };

  function open(levelId) {
    const lv = LEVELS.find(l => l.id === levelId);
    st.level = lv;
    st.i = 0;
    st.correct = 0;
    $('mathTitle').textContent = lv.name;
    $('mathResult').hidden = true;
    $('math').style.setProperty('--c', lv.color);
    $('math').style.setProperty('--cd', lv.dark);
    next();
  }

  function next() {
    if (st.i >= ROUND) return finish();
    st.q = makeQuestion(st.level.id);
    st.tries = 0;
    st.busy = false;
    $('mathDots').innerHTML = Array.from({ length: ROUND }, (_, k) => `<span class="${k < st.i ? 'done' : k === st.i ? 'on' : ''}"></span>`).join('');
    $('mathVisual').innerHTML = visual(st.q.visual, st.i % 2 ? STAR : APPLE);
    $('mathVisual').hidden = !st.q.visual;
    $('mathVisual').classList.toggle('big', st.level.id === 'count');
    $('mathQ').textContent = st.q.text;
    $('mathChoices').innerHTML = st.q.choices.map(c => `<button class="choice" data-v="${c}">${c}</button>`).join('');
    const page = $('mathPage');
    page.classList.remove('slide');
    void page.offsetWidth;
    page.classList.add('slide');
    setTimeout(say, 350);
  }

  const say = () => st.q && Voice.speak(st.q.say);

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
        Voice.speak(['答案是', ...W.numberWords(st.q.ans)]);
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
    Voice.speak(['全部答完了！', '答對了', ...W.numberWords(n), '題']);
  }

  $('mathChoices').addEventListener('click', e => { const b = e.target.closest('.choice'); if (b) choose(b); });
  $('mathSay').addEventListener('click', say);
  $('mathAgain').addEventListener('click', () => open(st.level.id));
  $('mathBack').addEventListener('click', () => { location.hash = '#/'; });
  $('mathHome').addEventListener('click', () => { location.hash = '#/'; });

  function best(id) {
    try { return +(localStorage.getItem('math:' + id) || 0); } catch (e) { return 0; }
  }

  // 首頁的關卡卡片
  function cards() {
    return LEVELS.map((l, i) => {
      const b = best(l.id);
      const stars = l.go ? '' : b ? `<span class="tag">最好 ${b}/${ROUND}</span>` : '';
      return `<div class="card story math-card" role="button" data-go="${l.go || '#/math/' + l.id}" data-say="${l.name}" style="--i:${i};--c:${l.color};--cd:${l.dark}">
        <span class="thumb"><span class="math-show">${l.show}</span>${stars}</span><div class="name">${l.name}</div></div>`;
    }).join('');
  }

  window.MathGame = { open, cards, stop: () => { st.q = null; Voice.cancel(); } };
})();
