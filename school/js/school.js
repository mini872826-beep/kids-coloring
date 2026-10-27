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

  /* ---------- 🎤 麥克風（口說練習用）：只在口說練習畫面開著，離開就關掉 ---------- */
  const Mic = {
    stream: null,
    async start() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) throw Object.assign(new Error('unsupported'), { name: 'Unsupported' });
        // voice.js 把 iPhone 的聲音設成「只播放」（靜音鍵開著也念）；這個模式下 Safari 會直接拒絕麥克風，
        // 所以要錄音時先換成「播放＋錄音」（一定要在按下去的當下、還沒 await 之前換）
        if (navigator.audioSession) navigator.audioSession.type = 'play-and-record';
        if (!Mic.stream) Mic.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!sayOn()) Mic.stop();
        return true;
      } catch (e) {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';
        Voice.speak([T.noMic]);
        alert(Mic.why(e) + `\n\n（錯誤代碼：${e.name || e}）`);
        return false;
      }
    },
    // 告訴爸媽為什麼不能錄、要怎麼打開（iPhone／iPad 最常見的是之前按了「不允許」）
    why(e) {
      const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const standalone = navigator.standalone || matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
      if (e.name === 'Unsupported') {
        return '這個瀏覽器不能錄音。\n\n請用 Safari（iPhone／iPad）或 Chrome（安卓）打開網址再試試看；在 LINE、Facebook 裡面打開的網頁沒辦法錄音。';
      }
      if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') return '找不到麥克風。請確認裝置的麥克風可以用，再按一次「錄我的聲音」。';
      if (e.name === 'NotReadableError') return '麥克風正在被別的 App 使用（例如通話、錄音）。先把那個 App 關掉，再按一次「錄我的聲音」。';
      if (ios) {
        return '麥克風被擋住了。\n\n'
          + (standalone ? '' : '如果 Safari 上面出現「減少進階隱私權保護措施」，先按「減少保護措施」，再按一次「錄我的聲音」。\n\n還是不行的話：\n')
          + '1. 打開 iPhone／iPad 的「設定」→「App」→「Safari」→「麥克風」，選「詢問」或「允許」\n'
          + '（舊版 iOS：「設定」→「Safari」→ 往下滑到「麥克風」）\n'
          + (standalone ? '2. 把「小書包學習本」完全關掉（從下往上滑、把它滑掉），再重新打開\n' : '2. 重新整理這個網頁\n')
          + '3. 再按一次「錄我的聲音」，跳出詢問時按「允許」';
      }
      return '麥克風被擋住了（可能之前按了「不允許」）。\n\n請點網址列旁邊的鎖頭 🔒 →「網站設定」→ 麥克風選「允許」，重新整理後再按一次「錄我的聲音」。';
    },
    stop() {
      if (Mic.stream) Mic.stream.getTracks().forEach(t => t.stop());
      Mic.stream = null;
      if (navigator.audioSession) navigator.audioSession.type = 'playback';   // 換回只播放（靜音鍵開著也念）
    },
    // 錄 ms 毫秒，回傳錄音的網址（錄不到回傳 null）
    record(ms) {
      return new Promise(ok => {
        if (!Mic.stream || !window.MediaRecorder) return ok(null);
        let r;
        try { r = new MediaRecorder(Mic.stream); } catch (e) { return ok(null); }
        const chunks = [];
        r.ondataavailable = e => e.data.size && chunks.push(e.data);
        r.onstop = () => ok(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: r.mimeType || 'audio/mp4' })) : null);
        r.start();
        setTimeout(() => { try { r.stop(); } catch (e) { ok(null); } }, ms);
        setTimeout(() => ok(null), ms + 2500);   // 保險：iPhone 偶爾不會通知錄好了，就跳過這句的回放
      });
    },
  };
  // 離開口說練習就把麥克風關掉
  window.addEventListener('hashchange', () => setTimeout(() => { if (!sayOn()) Mic.stop(); }, 0));

  /* ---------- ✅ 檢查發音：用手機內建的語音辨識聽小朋友說的英文，和老師的句子一個字一個字比 ----------
   * 只看「字有沒有說出來、說得像不像」，不做音素分析；小朋友的聲音辨識沒那麼準，所以比對放寬（sea／see、two／to 都算對） */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const NUM = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
  const SAME = [['two', 'to', 'too'], ['one', 'won'], ['four', 'for'], ['sea', 'see'], ['i', 'eye'], ['eight', 'ate'], ['right', 'write'], ['by', 'bye', 'buy'], ['moo', 'mew'], ['meow', 'mew', 'miaow'], ['woof', 'wolf', 'woo'], ['boo', 'blue'], ['dad', 'dead'], ['mom', 'mum', 'mam'], ['tweet', 'treat']];
  const canon = w => { const g = SAME.find(x => x.includes(w)); return g ? g[0] : w; };
  const stem = w => w.replace(/(es|s)$/, '');
  const normWord = t => { const w = t.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, ''); return NUM[w] || w; };
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const same = (a, b) => a === b || canon(a) === canon(b) || stem(a) === stem(b) || (a.length >= 4 && b.length >= 3 && lev(a, b) <= 1);
  // 比對一句：老師的每個字 → 有沒有說到（用最長共同子序列對齊）
  function compare(text, alts) {
    const tokens = text.split(/\s+/), E = tokens.map(normWord);
    let best = null;
    for (const alt of alts.length ? alts : ['']) {
      const H = alt.split(/\s+/).map(normWord).filter(Boolean);
      const L = Array.from({ length: E.length + 1 }, () => Array(H.length + 1).fill(0));
      for (let i = E.length - 1; i >= 0; i--) for (let j = H.length - 1; j >= 0; j--) {
        L[i][j] = E[i] && same(E[i], H[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      }
      const ok = E.map(w => !w);   // 標點之類的不算
      for (let i = 0, j = 0; i < E.length && j < H.length;) {
        if (E[i] && same(E[i], H[j])) { ok[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
      }
      const need = E.filter(Boolean).length, got = ok.filter((x, i) => x && E[i]).length;
      const r = { heard: alt, score: need ? got / need : 1, marks: tokens.map((t, i) => ({ t, ok: ok[i] })) };
      if (!best || r.score > best.score) best = r;
    }
    return best;
  }
  const Check = {
    ok: !!SR,
    // 聽 ms 毫秒，回傳 { alts: 辨識出來的幾種可能, err }
    listen(ms) {
      return new Promise(ok => {
        let r, alts = [], err = null, done = false;
        const fin = () => { if (!done) { done = true; ok({ alts, err }); } };
        try {
          r = new SR();
          r.lang = 'en-US';
          r.continuous = true;
          r.interimResults = true;
          r.maxAlternatives = 5;
          r.onresult = e => {
            const res = [...e.results], base = res.slice(0, -1).map(x => x[0].transcript).join(' '), last = res[res.length - 1];
            alts = [...last].map(a => `${base} ${a.transcript}`.trim());
          };
          r.onerror = e => { err = e.error; };
          r.onend = fin;
          r.start();
        } catch (e) { return ok({ alts, err: 'start' }); }
        setTimeout(() => { try { r.stop(); } catch (e) { fin(); } }, ms);
        setTimeout(fin, ms + 2500);   // 保險
      });
    },
  };
  const GOOD = .8;   // 說到八成的字就算說得好
  const marksHTML = c => `<div class="sb-check">${c.marks.map(m => `<span class="${m.ok ? 'ok' : 'bad'}">${m.t}</span>`).join(' ')}</div>
    <div class="sb-heard">${c.heard ? `👂 聽到：${c.heard}` : '👂 沒有聽清楚'}</div>`;

  /* ---------- 跟我說的播放（每本書共用） ---------- */
  // 念完再做 cb；iPhone 開著麥克風時聲音偶爾會停住、不會念完，所以最多等 ms 就繼續（不會卡在同一句）
  function talk(list, cb, ms) {
    let fired = false;
    const go = () => { if (!fired) { fired = true; cb(); } };
    Voice.speak(list, go);
    setTimeout(go, ms);
  }
  // 放一段錄音，放完（或最多 ms）做 cb
  function playURL(url, cb, ms) {
    const a = new Audio(url);
    let done = false;
    const next = () => { if (!done) { done = true; cb(); } };
    a.onended = a.onerror = next;
    a.play().catch(next);
    setTimeout(next, ms);
  }
  // 說不好的句子記起來，下次可以「只練上次說不好的」（每個小朋友、每一課分開）
  const weakKey = S => { const kid = localStorage.getItem('kid'); return `${kid ? kid + '|' : ''}sayweak:${S.book.id}:${S.lv.id}`; };
  const getWeak = S => { try { return JSON.parse(localStorage.getItem(weakKey(S))) || []; } catch (e) { return []; } };
  const setWeak = (S, list) => { try { list.length ? localStorage.setItem(weakKey(S), JSON.stringify(list)) : localStorage.removeItem(weakKey(S)); } catch (e) { } };

  let sayState = null;
  const sayOn = () => sayState && /view-(say|speak)/.test($('mathMenu').className);
  // 念第 k 句：先聽老師說，（訂正時：再聽你剛剛說的）→「換你說」錄音＋檢查 → 標出紅字 → 下一句
  function sayGo(intro) {
    const S = sayState;
    if (!S || !sayOn()) return;
    const my = ++S.token, it = S.items[S.k], prev = S.fixing ? S.prev[S.k] : null;
    $('sayCard').innerHTML = (it.chant ? `<div class="sb-say-chant" style="--c:${it.chant.color};--cd:${it.chant.dark}">🎵 ${it.chant.chant.title}</div>` : pic(it.pic)) +
      `<div class="sb-lines"><div><b>${it.en}</b><small>${it.zh}</small></div></div><div id="sayMarks">${prev && prev.marks ? marksHTML(prev) : ''}</div>
      <div class="sb-say-n">${S.fixing ? '✏️ 訂正時間 ' : ''}${S.k + 1} / ${S.items.length}</div>`;
    $('sayTurn').textContent = '👂 聽老師說';
    $('sayTurn').className = 'sb-say-turn';
    $('sayBar').style.transition = 'none';
    $('sayBar').style.width = '0';
    $('sayPause').textContent = '⏸ 暫停';
    S.paused = false;
    const alive = () => my === S.token && sayOn() && sayState === S;
    const turn = (txt, cls) => { $('sayTurn').textContent = txt; $('sayTurn').className = 'sb-say-turn ' + (cls || ''); };

    const advance = () => {
      if (!alive() || S.paused) return;
      if (S.k + 1 < S.items.length) {
        S.k++;
        // 每說完五句誇一下
        if (S.k % 5 === 0 && !S.fixing) { Sound.play('twinkle'); talk([T.great], () => alive() && sayGo(false), 4000); } else sayGo(false);
        return;
      }
      finish();
    };
    // 一輪說完：有檢查發音的話，把說不好的抓出來「訂正時間」再練一次
    const finish = () => {
      const checked = S.results.filter(Boolean);
      // 訂正時間最多 8 句、只跑一輪，跑完就結束，不會卡在這一課
      const weak = S.items.map((x, i) => i).filter(i => S.results[i] && S.results[i].score < GOOD).slice(0, 8);
      if (!S.fixing && checked.length && weak.length) {
        setWeak(S, weak.map(i => S.items[i].en));
        S.fixing = true;
        S.prev = weak.map(i => S.results[i]);
        S.items = weak.map(i => S.items[i]);
        S.results = [];
        S.k = 0;
        turn('✏️ ' + T.fixTime, 'you');
        return talk([T.fixTime], () => alive() && sayGo(false), 6000);
      }
      let say = [T.sayDone];
      if (S.fixing) {
        const still = S.items.filter((x, i) => !S.results[i] || S.results[i].score < GOOD);
        const better = S.items.length - still.length;
        setWeak(S, still.map(x => x.en));
        turn(`🎉 ${T.fixDone}（進步了 ${better} 句）`);
        say = [T.fixDone];
      } else {
        if (checked.length) { setWeak(S, []); say = [T.allGood]; }
        turn('🎉 ' + T.sayDone);
      }
      Sound.play('yay');
      // 說完了：換成「再練一次／回到這一課」，不會停在最後一句不知道要按什麼
      $('sayBar').style.transition = 'none';
      $('sayBar').style.width = '100%';
      document.querySelector('.sb-say .sb-say-ctl').innerHTML = `<button class="pill big" data-say-act="restart">🔁 再練一次</button>
        <button class="pill big sb-go" data-say-act="menu">📋 回到這一課</button>`;
      // 說完一課送一張貼紙
      const st = window.Stickers && Stickers.give(`${S.label}・${T.sayName}`);
      if (st) Stickers.pop(st);
      Voice.speak([...say, ...(st ? [T.sticker] : [])]);
    };

    const yourTurn = heard => talk([T.yourTurn], () => {
      if (!alive()) return;
      // 換你說：停的時間＝老師念的時間的 2 倍＋2 秒（慢速時自然就停久一點），最少 3.5 秒、最多 10 秒
      const wait = Math.min(10000, Math.max(3500, heard * 2 + 2000));
      turn('🗣️ 換你說！', 'you');
      void $('sayBar').offsetWidth;
      $('sayBar').style.transition = `width ${wait}ms linear`;
      $('sayBar').style.width = '100%';
      // 口說練習才錄音、檢查發音；跟我說只是停下來讓他說
      // 不錄音（跟我說）也要停 wait 這麼久，讓他把這句說完
      const rec = S.speak && Mic.stream ? Mic.record(wait) : new Promise(ok => setTimeout(() => ok(null), wait));
      const chk = S.speak && Check.ok ? Check.listen(wait) : Promise.resolve(null);
      Promise.all([rec, chk]).then(([url, heardIt]) => {
        if (!alive() || S.paused) return;
        let c = null;
        // 辨識器自己出錯（麥克風被占用、沒網路…）就不算說錯；只有「真的沒聽到聲音」或「說的不像」才要訂正
        const broken = heardIt && heardIt.err && heardIt.err !== 'no-speech' && !heardIt.alts.length;
        if (heardIt && !broken) {
          c = compare(it.en, heardIt.alts);
          c.url = url;
          S.results[S.k] = c;
          $('sayMarks').innerHTML = marksHTML(c);
        } else if (url) URL.revokeObjectURL(url);
        // 說得好：叮一聲；說不好：提醒紅色的字（訂正時再說不好就先往下，最後還會記起來）
        const feedback = () => {
          if (!alive()) return;
          if (!c) return setTimeout(advance, 300);
          if (c.score >= GOOD) {
            Sound.play('twinkle');
            return prev ? talk([T.better], () => alive() && advance(), 3500) : setTimeout(advance, 700);
          }
          Sound.play('boing');
          talk([c.heard ? T.checkTry : T.checkNone], () => alive() && advance(), 4000);
        };
        // 錄到聲音（不是訂正時）：先放給他聽
        if (url && !S.fixing) {
          turn('🎧 ' + T.listenYou, 'hear');
          return talk([T.listenYou], () => alive() && playURL(url, () => { if (!c) URL.revokeObjectURL(url); feedback(); }, wait + 1500), 3500);
        }
        feedback();
      });
    }, 3500);

    // 先說中文（小朋友還看不懂中文字，先知道意思）→ 再說英文 → 換你說
    const listen = () => talk([it.zh], () => alive() && listenEn(), 8000);
    const listenEn = () => {
      const t0 = Date.now();
      talk([it.en], () => {
        if (!alive()) return;
        const heard = Math.min(6000, Date.now() - t0);
        // 訂正時：再聽一次自己剛剛怎麼說的，和老師比一比
        if (prev && prev.url) {
          turn('🎧 ' + T.youSaid, 'hear');
          return talk([T.youSaid], () => alive() && playURL(prev.url, () => alive() && yourTurn(heard), 10000), 3500);
        }
        yourTurn(heard);
      }, 12000);
    };
    if (intro) talk([T.sayIntro], () => alive() && listen(), 6000); else listen();
  }
  // 換速度：停在這一句（舊的計時器不會再往下走），等一下用新的速度重念這一句
  document.addEventListener('speedchange', () => { if (sayState) sayState.token++; });
  $('mathMenu').addEventListener('click', e => {
    const b = e.target.closest('[data-say-act]');
    if (!b || !sayOn()) return;
    const S = sayState, act = b.dataset.sayAct;
    Sound.play('click');
    if (act === 'start') return Mic.start().then(ok => ok && S.reshow(S.onlyWeak));   // 口說練習：允許麥克風後開始
    if (act === 'restart') { S.token++; Voice.cancel(); return S.reshow(false); }
    if (act === 'menu') { S.token++; Voice.cancel(); location.hash = `#/b/${S.book.id}/${S.lv.id}`; return; }
    if (act === 'weak') { S.token++; Voice.cancel(); Mic.stop(); return S.reshow(true); }
    if (act === 'pause') {
      if (!S.paused) {
        S.paused = true;
        S.token++;
        Voice.cancel();
        $('sayBar').style.transition = 'none';
        $('sayPause').textContent = '▶️ 繼續';
        return;
      }
      return sayGo(false);
    }
    if (act === 'prev') S.k = Math.max(0, S.k - 1);
    if (act === 'next') S.k = Math.min(S.items.length - 1, S.k + 1);
    Voice.cancel();
    sayGo(false);
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

    /* ---------- 跟我說：老師念一句 → 停下來讓小朋友跟著說（停的時間照句子長短）→ 下一句 ----------
     * 英文照右上角的速度念（🐢 慢速時跟著說比較容易）。單字 → 句型 → 念謠，一句一句來 */
    function sayItems(id) {
      const out = [];
      for (const u of unitsOf(id)) {
        for (const w of [...u.words, ...(id === 'all' ? [] : u.extra)]) out.push({ pic: w, en: w.en, zh: w.zh });
        for (const w of u.words) {
          const s = sentence(u, w);
          if (s) s.en.forEach((en, k) => out.push({ pic: w, en, zh: s.zh[k] }));
        }
        if (id !== 'all') u.chant.lines.forEach(([en, zh]) => out.push({ chant: u, en, zh }));
      }
      return out;
    }
    // 跟我說（speak＝false）：老師念一句、停下來讓他跟著說，不用麥克風
    // 口說練習（speak＝true）：先允許麥克風，老師念一句、他說一句（錄音＋檢查發音），最後訂正說不好的
    // onlyWeak：只練上次說不好的句子
    function sayShow(lv, box, onlyWeak, speak) {
      if (sayState) (sayState.prev || []).concat(sayState.results || []).forEach(r => r && r.url && URL.revokeObjectURL(r.url));
      const S = sayState = { book, lv, speak, onlyWeak, label: lv.name, items: sayItems(lv.id), k: 0, paused: false, token: 0, results: [], fixing: false };
      S.reshow = only => sayShow(lv, box, only, speak);
      const weak = speak ? getWeak(S) : [];
      if (onlyWeak && weak.length) S.items = S.items.filter(x => weak.includes(x.en));
      if (speak && !Mic.stream) {
        // 先按「開始」：iPhone 規定要手指按下去才能問麥克風
        box.innerHTML = `<div class="sb-say sb-start">
          <div class="sb-start-ic">🎤</div>
          <h3>${T.speakName}</h3>
          <p>老師說一句，你說一句。<br>${SR ? '會幫你聽聽看說得清不清楚，最後一起訂正說不好的句子。' : '會錄下你說的，馬上放給你聽。<br><small>（這個瀏覽器不能檢查發音，所以沒有訂正時間）</small>'}</p>
          <button class="pill big sb-go" data-say-act="start">▶️ 開始（允許麥克風）</button>
          ${!onlyWeak && weak.length ? `<button class="pill sb-weak" data-say-act="weak">🔁 ${T.onlyWeak}（${weak.length} 句）</button>` : ''}
        </div>`;
        setTimeout(() => sayState === S && sayOn() && Voice.speak([T.speakName, T.speakIntro]), 300);
        return;
      }
      box.innerHTML = `<div class="sb-say">
        <div class="sb-say-card" id="sayCard"></div>
        <div class="sb-say-turn" id="sayTurn"></div>
        <div class="sb-say-bar"><i id="sayBar"></i></div>
        <div class="sb-say-ctl">
          <button class="pill" data-say-act="prev">⏮ 上一句</button>
          <button class="pill" data-say-act="again">🔁 再聽一次</button>
          <button class="pill" data-say-act="pause" id="sayPause">⏸ 暫停</button>
          <button class="pill" data-say-act="next">⏭ 下一句</button>
        </div></div>`;
      sayGo(!speak);   // 口說練習的開始畫面已經說明過了，不用再說一次
    }

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
      menuSay: T.pick, afterLearn: ['tap', '📚 下一步：課本'],
      // 一課的選單照學習的順序分段：先上課 → 看課本 → 開口說 → 玩遊戲練習 → 最後小考
      menu: [
        { title: '① 📖 上課', note: '老師一步一步教', items: ['learn'] },
        { title: '② 📚 課本', note: '點圖片聽單字、念謠', items: ['tap'] },
        { title: '③ 🗣️ 口語練習', note: '跟著老師說英文', items: ['say', 'speak'] },
        { title: '④ 🎮 練習小遊戲', note: '聽英文選圖', items: ['race', 'feed', 'tower', 'frog'] },
        { title: '⑤ ✏️ 小小考試', note: '考完有訂正', items: ['quiz'] },
      ],
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
      views: {
        tap: { name: T.tap, icon: '👆', color: '#ffd8a8', dark: '#e8590c', show: tapShow, say: () => Voice.speak([T.tapHint]) },
        say: { name: T.sayName, icon: '🗣️', color: '#d0bfff', dark: '#7048e8', show: (lv, box) => sayShow(lv, box, false, false), say: () => sayGo(false) },
        speak: { name: T.speakName, icon: '🎤', color: '#ffc9c9', dark: '#e03131', show: (lv, box) => sayShow(lv, box, false, true), say: () => (Mic.stream ? sayGo(false) : Voice.speak([T.speakIntro])) },
      },
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
