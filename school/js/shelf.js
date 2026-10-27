/* 書架：科目 → 學期 → 一本書 → 一課一課。
 *   科目（SUBJECTS）：英文、注音、數學……要加新的科目在這裡加一行
 *   書：放在 js/books/，一本一個檔案，用 window.SHELF.addBook({...}) 登記（要記得加到 index.html、sw.js）
 *     id（不能重複，存星星用）、subject（哪個科目）、grade＋term（例如「大班」「上學期」，首頁照這個分區）、title、icon、color/dark、
 *     type（這本書用哪一種題目；目前有 'english'：聽英文選圖、點點看、念謠，見 school.js）、tiers（首頁分段）、units
 * 英文句子用英文的聲音念，中文用老師（MiniMax 台灣腔大姊姊）的聲音念：每一句都會被 tools/phrases.js 收進錄音清單。
 *
 * 英文課本的一課：
 *   單字：en 英文、zh 中文、pic 圖（emoji，或 'svg:名字' 用下面畫好的圖）
 *     words：課本上半頁的單字（可以套進句型）；extra：念謠裡的單字（只拿來考聽力）
 *   句型：ans／ansZh 裡的 ___ 換成單字；有 ask／askZh 的（農場）是問句，回答是 ans（Yes, I do.）和 nope（No, I don't.）
 *   念謠：chant.title、chant.lines（[英文, 中文意思]）
 */
(function () {
  const SVG = {
    crosswalk: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#868e96"/><g fill="#fff">${[8, 30, 52, 74, 96].map(x => `<rect x="${x}" y="10" width="14" height="70" rx="3"/>`).join('')}</g></svg>`,
    sky: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#74c0fc"/><g fill="#fff"><ellipse cx="38" cy="38" rx="22" ry="11"/><ellipse cx="52" cy="31" rx="16" ry="12"/><ellipse cx="86" cy="62" rx="20" ry="9"/><ellipse cx="96" cy="56" rx="12" ry="9"/></g></svg>`,
    sea: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d0ebff"/><path d="M0 40 H120 V80 Q120 90 110 90 H10 Q0 90 0 80 Z" fill="#1c7ed6"/><path d="M8 56 Q20 52 32 56 M54 66 Q66 62 78 66 M86 50 Q98 46 110 50" stroke="#a5d8ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M70 38 L70 18 L84 34 Z" fill="#fff" stroke="#495057" stroke-width="2"/><path d="M60 38 H90 L84 44 H66 Z" fill="#e8590c"/></svg>`,
    sandcastle: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><g fill="#fcc777" stroke="#b8741a" stroke-width="2.5" stroke-linejoin="round"><path d="M22 80 V48 H34 V40 H42 V48 H78 V40 H86 V48 H98 V80 Z"/><path d="M44 48 V26 H52 V20 H58 V26 H62 V20 H68 V26 H76 V48 Z"/></g><path d="M54 80 V66 Q60 58 66 66 V80 Z" fill="#b8741a"/><path d="M60 20 V8 L72 12 L60 16" fill="#ff6b6b" stroke="#b8741a" stroke-width="2"/></svg>`,
    barbecue: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><path d="M50 22 Q44 14 50 6 M62 22 Q56 14 62 6 M74 22 Q68 14 74 6" stroke="#adb5bd" stroke-width="3" fill="none" stroke-linecap="round"/><g stroke-linecap="round"><path d="M34 32 H86" stroke="#c92a2a" stroke-width="7"/><path d="M38 40 H82" stroke="#e8590c" stroke-width="7"/></g><path d="M24 44 H96 Q92 66 60 66 Q28 66 24 44 Z" fill="#343a40"/><path d="M44 64 L34 86 M76 64 L86 86 M60 66 V86" stroke="#343a40" stroke-width="4" stroke-linecap="round"/></svg>`,
    ricecake: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff9db"/><ellipse cx="60" cy="66" rx="48" ry="16" fill="#fff" stroke="#adb5bd" stroke-width="2"/><g stroke="#7a4a1c" stroke-width="2.5" stroke-linejoin="round"><path d="M30 60 L36 34 L66 34 L60 60 Z" fill="#a8652c"/><path d="M58 64 L64 38 L92 40 L86 66 Z" fill="#c07a3a"/></g><path d="M40 40 L60 40 M68 44 L86 46" stroke="#e8b27a" stroke-width="3" stroke-linecap="round"/></svg>`,
    starfish: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><path d="M60 8 L71 34 L100 36 L78 54 L86 82 L60 66 L34 82 L42 54 L20 36 L49 34 Z" fill="#ff922b" stroke="#d9480f" stroke-width="3" stroke-linejoin="round"/><g fill="#ffd8a8"><circle cx="60" cy="30" r="3"/><circle cx="76" cy="44" r="3"/><circle cx="44" cy="44" r="3"/><circle cx="52" cy="62" r="3"/><circle cx="68" cy="62" r="3"/></g><circle cx="54" cy="46" r="3" fill="#222"/><circle cx="66" cy="46" r="3" fill="#222"/></svg>`,
    one: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff3bf"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#e8590c" font-family="Nunito, sans-serif">1</text></svg>`,
    two: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d3f9d8"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#2b8a3e" font-family="Nunito, sans-serif">2</text></svg>`,
    three: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d0ebff"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#1971c2" font-family="Nunito, sans-serif">3</text></svg>`,
  };


  const fill = (t, w) => t.replace('___', w);
  // 課本上半頁的單字套進句型：[英文問句?, 英文回答, 中文問句?, 中文回答]；沒有句型的回傳 null
  function sentence(u, w) {
    if (u.noSentence || (!u.ask && !u.words.includes(w))) return null;   // 念謠裡的單字不套句型（農場的問句都可以問）
    if (u.ask) return { en: [fill(u.ask, w.en), u.ans], zh: [fill(u.askZh, w.zh), u.ansZh] };
    return { en: [fill(u.ans, w.en).replace(/\.\.$/, '.')], zh: [fill(u.ansZh, w.zh)] };
  }
  // 圖：emoji 或畫好的 svg
  const picHTML = pic => pic.startsWith('svg:') ? SVG[pic.slice(4)] : `<span class="em">${pic}</span>`;

  // 念出來的固定用語（中文用老師的聲音）
  const T = {
    title: '幼稚園課本', titleEn: 'My School Book',
    listen: '聽一聽，哪一個是', listenSent: '聽聽看，說的是哪一個？', answer: '聽英文回答問題',
    yesNo: '看一看，有沒有？', look: '看看圖，答答看',
    tap: '點點看', tapHint: '點圖片，聽聽看怎麼念', chant: '念謠', readAll: '全部念一遍',
    review: '跟老師複習', words: '學單字', pattern: '說說看', meaning: '意思是',
    youPicked: '你選的是', right: '正確答案是', tryIt: '換你選選看', answerIs: '答案是',
    all: '總複習', allNote: '整本書的單字一起考', shelf: '書架', whoLearns: '誰要學習？', addKid: '新增小朋友',
    sayName: '跟我說', sayIntro: '老師說一句，你跟著說一句', yourTurn: '換你說', great: '說得好棒！', sayDone: '全部說完了，你好棒！',
    speed1: '英文正常速度', speed75: '英文慢一點', speed50: '英文再慢一點',
    yourTeacher: '說說看你的老師是誰', myTeacher: 'My teacher is', quiz: '小小考試',
  };

  const SUBJECTS = [
    { id: 'english', name: '英文', icon: '🔤', color: '#4dabf7', dark: '#1971c2' },
    { id: 'zhuyin', name: '注音', icon: 'ㄅ', color: '#f783ac', dark: '#c2255c' },
    { id: 'math', name: '數學', icon: '🔢', color: '#69db7c', dark: '#2b8a3e' },
  ];
  const BOOKS = [];
  function addBook(b) { BOOKS.push(b); }

  // 給 tools/phrases.js：這些都要錄音
  function phrases() {
    const out = [...Object.values(T), ...SUBJECTS.map(x => x.name)];
    for (const b of BOOKS) out.push(b.grade + b.term, b.title);
    for (const u of BOOKS.filter(b => b.type === 'english').flatMap(b => b.units)) {
      out.push(u.name, ...u.q, u.ans, u.ansZh, u.chant.title, u.chant.zh, ...u.chant.lines.flat());
      if (u.nope) out.push(...u.nope);
      for (const w of [...u.words, ...u.extra]) {
        out.push(w.en, w.zh);
        const s = sentence(u, w);
        if (s) out.push(...s.en, ...s.zh);
      }
      out.push(`第${'一二三四五六七八九十'[u.no - 1]}課`);
    }
    return [...new Set(out.filter(t => !t.includes('___')))];
  }

  window.SHELF = { SUBJECTS, BOOKS, addBook, SVG, T, sentence, picHTML, phrases };
})();
