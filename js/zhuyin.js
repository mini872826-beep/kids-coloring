/* 學注音：初階（認識 37 個注音符號）、中階（拼音、三拼音、四個聲調）、高階（看圖念詞語）。
 * 練習題和四個小遊戲（賽車、餵小熊、蓋高塔、青蛙跳荷葉）、訂正時間都用學數學的那一套（js/math.js），
 * 這裡只負責出題、教學、訂正的講解，和把注音排成直的。
 * 念出來的字都在 words.js 的 WORDS.ZHUYIN 裡（tools/phrases.js 會收進錄音清單）。
 */
(function () {
  const W = window.WORDS, Z = W.ZHUYIN, T = Z.T, SAY = Z.SAY;
  const N = n => W.numberWords(n);
  const INITIALS = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ', MEDIALS = 'ㄧㄨㄩ', FINALS = 'ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ';
  const MARK = ['', '', 'ˊ', 'ˇ', 'ˋ', '˙'];

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[rnd(0, a.length - 1)];
  const syls = v => v.z2.split(' ');

  /* ---------- 音節：拆成符號和聲調 ---------- */
  // 'ㄌㄠˇ' → { tone: 3, parts: ['ㄌ', 'ㄠ'] }；輕聲的點寫在最前面：'˙ㄗ' → { tone: 5, parts: ['ㄗ'] }
  function parse(syl) {
    let tone = 1, s = syl;
    if (s[0] === '˙') { tone = 5; s = s.slice(1); } else {
      const k = 'ˊˇˋ'.indexOf(s[s.length - 1]);
      if (k >= 0) { tone = k + 2; s = s.slice(0, -1); }
    }
    return { tone, parts: [...s] };
  }
  const compose = (parts, tone) => (tone === 5 ? '˙' : '') + parts.join('') + (tone >= 2 && tone <= 4 ? MARK[tone] : '');
  const roleOf = (parts, i) => INITIALS.includes(parts[i]) ? 'initial' : MEDIALS.includes(parts[i]) && i < parts.length - 1 ? 'medial' : 'final';

  /* ---------- 畫面：直的注音（聲調在右邊，輕聲的點在上面） ---------- */
  function zy(syl, opt = {}) {
    const { tone, parts } = parse(syl);
    const t = opt.toneQ ? '<span class="zy-t q">?</span>' : tone >= 2 && tone <= 4 ? `<span class="zy-t">${MARK[tone]}</span>` : '';
    return `<span class="zy n${parts.length}${opt.cls ? ' ' + opt.cls : ''}"><span class="zy-c">${tone === 5 && !opt.toneQ ? '<i class="zy-dot">˙</i>' : ''}${parts.map(p => `<i>${p}</i>`).join('')}</span>${t}</span>`;
  }
  const QZY = '<span class="zy n1 zy-q"><span class="zy-c"><i>?</i></span></span>';
  // 一個詞：每個字右邊有注音。hi＝紅色的字；hide＝紅字的注音變問號；plain＝都不寫注音；noTone＝紅字的聲調變問號
  function wordHTML(v, o = {}) {
    const z = syls(v);
    return `<span class="zw">${[...v.w].map((ch, i) => {
      const hi = i === o.hi;
      const note = o.plain ? '' : hi && o.hide ? QZY : hi && o.noTone ? zy(compose(parse(z[i]).parts, 1), { toneQ: true }) : zy(z[i]);
      return `<span class="zr${hi ? ' hi' : ''}"><span class="zh">${ch}</span>${note}</span>`;
    }).join('')}</span>`;
  }
  function pic(id) {
    const d = window.ART && ART.DRAWINGS.find(x => x.id === id);
    return d ? `<span class="zp">${ART.svgDoc(d.svg)}</span>` : `<span class="zp emoji">${id}</span>`;
  }
  const card = (v, o) => `<div class="zcard">${pic(v.pic)}${wordHTML(v, o)}</div>`;
  const ear = () => '<button class="z-ear" data-replay aria-label="再聽一次">🔊</button>';
  const bigSym = (z, cls = '') => `<span class="zbig${cls ? ' ' + cls : ''}">${z}</span>`;
  // 拼音算式：ㄌ ＋ ㄠ ＋ ˇ → ㄌㄠˇ；upto＝念到第幾個（後面的淡淡的）；miss＝哪一個變問號；result＝要不要寫出拼好的
  function spellRow(syl, o = {}) {
    const { tone, parts } = parse(syl);
    const upto = o.upto === undefined ? 99 : o.upto;
    const tile = (p, i) => `<span class="zt ${roleOf(parts, i)}${i > upto ? ' dim' : ''}${i === upto && o.upto !== undefined ? ' on' : ''}${i === o.miss ? ' miss' : ''}">${i === o.miss ? '?' : p}</span>`;
    let html = parts.map(tile).join('<span class="zplus">＋</span>');
    if (tone !== 1) html += `<span class="zplus">＋</span><span class="zt tone${upto < parts.length ? ' dim' : ''}">${MARK[tone]}</span>`;
    if (o.result) html += `<span class="zplus">→</span>${zy(syl, { cls: 'zres' })}`;
    else if (o.ask) html += `<span class="zplus">→</span>${QZY}`;
    return `<div class="zspell">${html}</div>`;
  }
  // 聲調的高低線（一聲平、二聲上揚、三聲先下後上、四聲往下、輕聲一點）
  const CONTOUR = ['', 'M15 18 L105 18', 'M15 50 L105 14', 'M15 40 L55 66 L105 22', 'M15 14 L105 66', ''];
  function contour(t, big) {
    const path = t === 5 ? '<circle cx="60" cy="48" r="9" fill="currentColor"/>' : `<path d="${CONTOUR[t]}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<span class="zcontour t${t}${big ? ' big' : ''}"><svg viewBox="0 0 120 80"><path d="M10 74 H110" stroke="#dee2e6" stroke-width="3"/>${path}</svg><b>${Z.TONE_NAMES[t]}</b></span>`;
  }
  const toneLabel = n => `<span class="zy-tn"><b>${n === 1 ? 'ˉ' : MARK[n]}</b><small>${Z.TONE_NAMES[n]}</small></span>`;

  /* ---------- 念法 ---------- */
  // 一個音節怎麼念：「勒、凹、老，三聲」；輕聲的字單獨念不出來，改念整個詞
  function sayParts(syl) { return parse(syl).parts.map(p => SAY[p]); }
  function saySpell(syl, word) {
    const { tone } = parse(syl), rep = SAY[syl];
    return [...sayParts(syl), ...(rep ? [rep] : []), Z.TONE_NAMES[tone], ...(!rep && word ? [word] : [])];
  }
  const sayOf = (c, q) => q.kind === 'tone' ? Z.TONE_NAMES[+String(c).slice(1)] : SAY[c] || null;

  /* ---------- 出題 ---------- */
  let last = '';
  // 不要連續兩題一樣
  function fresh(gen) {
    let q;
    for (let k = 0; k < 6; k++) { q = gen(); if (q.key !== last) break; }
    last = q.key;
    return q;
  }
  const qText = (s, more = '') => `<span class="zq-txt">${s}</span>${more}`;

  // 初階：聽音選符號、看圖選符號
  function symQ(level) {
    const group = Z.SYMBOLS.filter(s => s.g === level);
    const s = pick(group), k = s.k || 0, inChar = parse(syls(s)[k]).parts;
    const ok = x => x.z !== s.z && !inChar.includes(x.z);
    let others = shuffle(group.filter(ok));
    if (others.length < 3) others = others.concat(shuffle(Z.SYMBOLS.filter(x => ok(x) && !others.includes(x) && INITIALS.includes(x.z) === INITIALS.includes(s.z))));
    const choices = shuffle([s.z, ...others.slice(0, 3).map(x => x.z)]);
    const base = { kind: 'sym', qt: 'sym', sym: s, ans: s.z, choices, cls: 'zy-choices k-sym', key: s.z + Math.random() };
    if (Math.random() < .5) return { ...base, key: s.z + 'h', text: T.hearSym, say: [T.hearSym, s.say], visual: ear() };
    const ask = inChar[0] === s.z ? T.firstSym : T.hasSym;
    return { ...base, key: s.z + 'p', text: ask, say: [s.w, ask], visual: card(s, { hi: k, plain: true }) };
  }

  // 相像的符號（拿來當錯的選項）
  const PAIRS = ['ㄅㄆ', 'ㄉㄊ', 'ㄍㄎ', 'ㄐㄑ', 'ㄓㄗ', 'ㄔㄘ', 'ㄕㄙ', 'ㄋㄌ', 'ㄈㄏ', 'ㄇㄋ', 'ㄖㄌ', 'ㄒㄙ',
    'ㄢㄤ', 'ㄣㄥ', 'ㄠㄡ', 'ㄞㄟ', 'ㄛㄜ', 'ㄚㄛ', 'ㄝㄟ', 'ㄧㄩ', 'ㄨㄩ', 'ㄢㄣ', 'ㄤㄥ'];
  const partners = p => PAIRS.filter(pr => pr.includes(p)).map(pr => pr.replace(p, ''));
  // 長得像的音節：換一個聲調、或換一個相像的符號
  function similar(syl) {
    const { tone, parts } = parse(syl);
    const tones = shuffle([1, 2, 3, 4].filter(t => t !== tone)).map(t => compose(parts, t));
    const swaps = [];
    parts.forEach((p, i) => partners(p).forEach(q => { const np = parts.slice(); np[i] = q; swaps.push(compose(np, tone)); }));
    const out = [];
    for (const c of [tones[0], ...shuffle(swaps), ...tones.slice(1)]) if (c && c !== syl && !out.includes(c)) out.push(c);
    return out;
  }
  // 中階：聲母＋韻母、三拼音
  function sylQ(list, level) {
    const [syl, ch] = pick(list), parts = parse(syl).parts;
    const near = list.map(x => x[0]).filter(x => x !== syl);
    const share = shuffle(near.filter(x => parse(x).parts.some((p, i) => parts[i] === p)));
    const rest = shuffle(near.filter(x => !share.includes(x)));
    const choices = shuffle([syl, ...[...share, ...rest].slice(0, 3)]);
    const base = { kind: 'syl', qt: 'spell', syl, ans: syl, choices, cls: 'zy-choices k-syl' };
    if (Math.random() < .5) return { ...base, key: syl + 'h', text: T.hearSyl, say: [T.hearSyl, ch], visual: ear() };
    return { ...base, key: syl + 'b', text: T.blend, say: [...parts.map(p => SAY[p]), T.blend], visual: spellRow(syl, { ask: true }) };
  }
  // 中階：四個聲調
  function toneQ() {
    const set = pick(Z.TONES), t = rnd(0, 3), [syl, ch] = set[t];
    if (Math.random() < .5) {
      return { kind: 'syl', qt: 'tone', syl, ans: syl, choices: shuffle(set.map(x => x[0])), cls: 'zy-choices k-syl', key: syl + 'h',
        text: T.hearTone, say: [T.hearTone, ch], visual: ear() };
    }
    return { kind: 'tone', qt: 'tone', syl, ans: 't' + (t + 1), choices: ['t1', 't2', 't3', 't4'], cls: 'zy-choices k-tone', key: syl + 's',
      text: T.seeTone, say: [T.seeTone], visual: `<div class="zsee">${zy(syl, { cls: 'zbigzy' })}</div>` };
  }
  // 高階：紅色的字選注音、選聲調、補上少掉的符號
  function wordQ(level) {
    const v = pick(Z.VOCAB[level]), z = syls(v), k = rnd(0, z.length - 1), syl = z[k];
    const { tone, parts } = parse(syl);
    const base = { qt: 'word', word: v, k, syl, key: v.w + k };
    const type = pick(parts.length > 1 ? ['char', 'tone', 'part'] : ['char', 'tone']);
    if (type === 'char') {
      return { ...base, kind: 'syl', ans: syl, choices: shuffle([syl, ...similar(syl).slice(0, 3)]), cls: 'zy-choices k-syl',
        text: T.charZy, say: [v.w, T.charZy], visual: card(v, { hi: k, hide: true }) };
    }
    if (type === 'tone') {
      const choices = tone === 5 ? ['t1', 't2', 't3', 't4', 't5'].filter(t => t !== 't' + rnd(1, 4)) : ['t1', 't2', 't3', 't4'];
      return { ...base, kind: 'tone', ans: 't' + tone, choices, cls: 'zy-choices k-tone',
        text: T.charTone, say: [v.w, T.charTone], visual: card(v, { hi: k, noTone: true }) };
    }
    const m = rnd(0, parts.length - 1), p = parts[m], role = roleOf(parts, m);
    const same = role === 'initial' ? INITIALS : role === 'medial' ? MEDIALS : FINALS + (parts.length === 1 ? MEDIALS : '');
    const near = partners(p).filter(x => same.includes(x) && !parts.includes(x));
    // 介音只有三個：不夠四個選項就拿韻母來湊
    const others = shuffle([...same].filter(x => x !== p && !near.includes(x) && !parts.includes(x)))
      .concat(shuffle([...FINALS].filter(x => !same.includes(x) && !parts.includes(x))));
    const choices = shuffle([p, ...[...shuffle(near), ...others].slice(0, 3)]);
    return { ...base, kind: 'sym', ans: p, choices, cls: 'zy-choices k-sym', miss: m,
      text: T.charPart, say: [v.w, T.charPart], visual: card(v, { hi: k, hide: true }) + spellRow(syl, { miss: m }) };
  }

  function makeQuestion(level) {
    return fresh(() => {
      if (level === 'pin') return sylQ(Z.PIN, level);
      if (level === 'jie') return sylQ(Z.JIE, level);
      if (level === 'tone') return toneQ();
      if (Z.VOCAB[level]) return wordQ(level);
      return symQ(level);
    });
  }

  /* ---------- 一步一步講：拼一個音（教學和訂正都用） ---------- */
  function spellSteps(syl, word, k) {
    const { tone, parts } = parse(syl), rep = SAY[syl];
    const head = word ? card(word, { hi: k }) : '';
    const steps = parts.map((p, i) => ({ html: head + spellRow(syl, { upto: i }), qhtml: qText(p, ''), say: [SAY[p]], fast: true }));
    steps.push({
      html: head + spellRow(syl, { result: true }) + contour(tone),
      qhtml: `<span class="zq-big">${zy(syl)}</span>${rep && word ? '' : ''}<span class="zq-txt">${Z.TONE_NAMES[tone]}</span>`,
      say: [...(rep ? [rep] : []), Z.TONE_NAMES[tone], ...(!rep && word ? [word.w] : [])],
    });
    return steps;
  }
  function symCard(s, o = {}) {
    return `<div class="zsym">${bigSym(s.z, o.cls)}${card(s, { hi: s.k || 0 })}</div>`;
  }
  const symGrid = (list, lit = -1) => `<div class="zgrid">${list.map((s, i) => `<span class="${i === lit ? 'on' : i < lit ? 'done' : ''}">${s.z}</span>`).join('')}</div>`;

  /* ---------- 看教學 ---------- */
  const EX = { pin: [['ㄅㄚ', '八'], ['ㄇㄠ', '貓'], ['ㄈㄟ', '飛'], ['ㄊㄤ', '湯']], jie: [['ㄐㄧㄚ', '家'], ['ㄏㄨㄚ', '花'], ['ㄒㄩㄝ', '靴'], ['ㄊㄧㄢ', '天']] };
  const LESSON_WORDS = { wa: ['老虎', '熊貓', '兔子'], wf: ['蘋果', '西瓜', '紅蘿蔔'], wg: ['飛機', '火車', '星星'] };

  function lessonSteps(level) {
    if (EX[level]) {
      const steps = [{ html: spellRow(EX[level][0][0], { ask: true }), text: level === 'pin' ? T.pinIntro : T.jieIntro, say: [level === 'pin' ? T.pinIntro : T.jieIntro] }];
      if (level === 'jie') steps.push({ html: `<div class="zgrid">${[...MEDIALS].map(m => `<span class="on">${m}</span>`).join('')}</div>`, text: T.jieMid, say: [T.jieMid] });
      for (const [syl, ch] of EX[level]) {
        const parts = parse(syl).parts;
        parts.forEach((p, i) => steps.push({ html: spellRow(syl, { upto: i }), qhtml: qText(p), say: [SAY[p]] }));
        steps.push({ html: spellRow(syl, { result: true }), qhtml: `<span class="zq-big">${zy(syl)}</span><span class="zq-txt">${ch}</span>`, say: [...parts.map(p => SAY[p]), ch] });
      }
      steps[steps.length - 1].done = true;
      return steps;
    }
    if (level === 'tone') {
      const ma = Z.TONES[0];
      const row = lit => `<div class="ztones">${ma.map(([s, c], i) => `<span class="${i === lit ? 'on' : ''}">${zy(s)}<b>${c}</b></span>`).join('')}</div>`;
      const steps = [{ html: `<div class="zcontours">${[1, 2, 3, 4].map(t => contour(t)).join('')}</div>`, text: T.toneIntro, say: [T.toneIntro] }];
      ma.forEach(([s, c], i) => steps.push({ html: `<div class="zsee">${contour(i + 1, true)}${zy(s, { cls: 'zbigzy' })}</div>`, qhtml: qText(T['t' + (i + 1)]), say: [T['t' + (i + 1)], c, c] }));
      const light = Z.LIGHT[0];
      steps.push({ html: card(light, { hi: 1 }) + contour(5), qhtml: qText(T.t5), say: [T.t5, light.w] });
      steps.push({ html: row(-1), text: T.toneAll, say: [T.toneAll] });
      ma.forEach(([, c], i) => steps.push({ html: row(i), text: c, say: [c], fast: true }));
      steps[steps.length - 1].done = true;
      return steps;
    }
    if (Z.VOCAB[level]) {
      const steps = [{ html: `<div class="zcards">${LESSON_WORDS[level].map(w => pic(Z.VOCAB[level].find(v => v.w === w).pic)).join('')}</div>`, text: T.wordIntro, say: [T.wordIntro, T.wordEach] }];
      for (const w of LESSON_WORDS[level]) {
        const v = Z.VOCAB[level].find(x => x.w === w);
        steps.push({ html: card(v), text: w, say: [w] });
        syls(v).forEach((syl, k) => {
          const parts = parse(syl).parts;
          parts.forEach((p, i) => steps.push({ html: card(v, { hi: k }) + spellRow(syl, { upto: i }), qhtml: qText(p), say: [SAY[p]], fast: true }));
          const rep = SAY[syl], tone = parse(syl).tone;
          steps.push({ html: card(v, { hi: k }) + spellRow(syl, { result: true }), qhtml: `<span class="zq-big">${zy(syl)}</span><span class="zq-txt">${v.w[k]}　${Z.TONE_NAMES[tone]}</span>`,
            say: rep ? [rep, Z.TONE_NAMES[tone], rep] : [Z.TONE_NAMES[tone], w] });
        });
        steps.push({ html: card(v), text: w, say: [w] });
      }
      steps[steps.length - 1].done = true;
      return steps;
    }
    // 初階：一個一個認識，最後一起念一次
    const group = Z.SYMBOLS.filter(s => s.g === level);
    const steps = [{ html: symGrid(group), text: T.meet, say: [T.meet] }];
    group.forEach(s => steps.push({ html: symCard(s), qhtml: qText(`${s.z}　${s.w}`), say: [s.say, s.w, s.say] }));
    steps.push({ html: symGrid(group), text: T.readAll, say: [T.readAll] });
    group.forEach((s, i) => steps.push({ html: symGrid(group, i), qhtml: qText(s.z), say: [s.say], fast: true }));
    steps.push({ html: symGrid(group, group.length), text: `${T.learned} ${group.length} ${T.learnedN}`, say: [T.learned, ...N(group.length), T.learnedN], done: true });
    return steps;
  }

  /* ---------- 訂正：選錯的和正確的放在一起，再一個符號一個符號拼給他聽 ---------- */
  function explainSteps(q, level, chosen) {
    if (q.qt === 'sym') {
      const s = q.sym, c = Z.SYMBOLS.find(x => x.z === chosen);
      const steps = [];
      if (c) steps.push({ html: `<div class="zvs">${bigSym(c.z, 'bad')}<span class="zplus">≠</span>${bigSym(s.z, 'good')}</div>`, qhtml: qText(`${c.z} 是「${c.say}」`), say: [T.youPicked, c.say] });
      steps.push({ html: symCard(s, { cls: 'good' }), qhtml: qText(`${s.z} 是「${s.say}」，${s.w}`), say: [T.answer, s.say, s.w, s.say], done: true });
      return steps;
    }
    const word = q.word, steps = [];
    if (word) steps.push({ html: card(word, { hi: q.k }), text: word.w, say: [word.w] });
    if (q.qt === 'word' && q.kind === 'sym') steps.push({ html: card(word, { hi: q.k }) + spellRow(q.syl, { miss: q.miss }), text: T.spell, say: [T.spell] });
    if (q.qt === 'tone' && q.kind === 'tone') {
      const t = parse(q.syl).tone;
      steps.push({ html: `<div class="zsee">${contour(t, true)}${zy(q.syl, { cls: 'zbigzy' })}</div>`, qhtml: qText(T['t' + t]), say: [T['t' + t]] });
    }
    const sp = spellSteps(q.syl, word, q.k);
    sp[sp.length - 1].done = true;
    return [...steps, ...sp];
  }

  window.MathGame.register({
    id: 'zhuyin', route: 'zhuyin', store: ['zhuyin', 'zhuyingame'], cardClass: 'zy-card',
    tiers: Z.TIERS,
    levels: Z.LEVELS.map(l => ({
      ...l,
      showHTML: Z.VOCAB[l.id] ? `<span class="zy-show word">${wordHTML(Z.VOCAB[l.id].find(v => v.w === l.show))}</span>`
        : `<span class="zy-show">${l.show}</span>`,
    })),
    pace: { easy: 3400, mid: 4000, hard: 4800 },
    makeQuestion, lessonSteps, explainSteps,
    label: (c, q) => q.kind === 'tone' ? toneLabel(+String(c).slice(1)) : q.kind === 'sym' ? `<span class="zy-sym">${c}</span>` : zy(c),
    fixSay(m, q) {
      const a = sayOf(m.chosen, q), b = sayOf(q.ans, q) || (q.word && q.word.w);
      return [...(a ? [T.youPicked, a] : [T.wrongPick]), T.right, ...(b ? [b] : []), T.tryIt];
    },
    answerSay(q) {
      const b = sayOf(q.ans, q) || (q.word && q.word.w);
      return [T.answer, ...(b ? [b] : [])];
    },
  });

  // 題目上的 🔊：再聽一次
  document.getElementById('mathVisual').addEventListener('click', e => {
    if (e.target.closest('[data-replay]')) document.getElementById('mathSay').click();
  });

  window.Zhuyin = { parse, zy, wordHTML, saySpell };
})();
