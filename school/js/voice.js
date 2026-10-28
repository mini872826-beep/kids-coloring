/* 聲音：音效（現場合成）和念字（用 AI 錄好的 mp3；找不到才用平板內建的語音）。
 * 從「小朋友愛畫畫」搬過來。錄音檔和小朋友愛畫畫共用同一個資料夾（../audio/）：中文是老師（MiniMax 台灣腔大姊姊）的聲音、英文是英文的聲音。
 */
(function () {
  const AUDIO = '../audio/';
  /* ---------------- 聲音（用 WebAudio 現場合成，不用音頻文件） ---------------- */
  const Sound = (() => {
    let ac;
    const ctx = () => {
      ac ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state !== 'running') ac.resume().catch(() => {});   // iPad：被鎖住的話，趁這次點擊解開
      return ac;
    };
    function tone(freq, dur, type = 'sine', vol = .25, slide = 0, delay = 0) {
      try {
        const a = ctx(), t = a.currentTime + delay;
        const o = a.createOscillator(), g = a.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(.001, t + dur);
        o.connect(g).connect(a.destination);
        o.start(t); o.stop(t + dur);
      } catch (e) { /* 沒聲音也不影響玩 */ }
    }
    function noise(dur, vol = .2, freq = 1200) {
      try {
        const a = ctx(), n = a.sampleRate * dur, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
        s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start();
      } catch (e) { }
    }
    const sounds = {
      pop: () => tone(600, .12, 'sine', .3, 500),
      click: () => tone(900, .05, 'triangle', .15),
      boing: () => tone(220, .35, 'triangle', .3, 400),
      twinkle: () => [880, 1100, 1320, 1760].forEach((f, i) => tone(f, .18, 'sine', .15, 0, i * .08)),
      splash: () => noise(.4, .35, 900),
      fill: () => { tone(300, .15, 'sine', .25, 600); noise(.15, .1, 2500); },
      woof: () => { tone(320, .12, 'sawtooth', .15, -150); tone(300, .14, 'sawtooth', .15, -150, .18); },
      roar: () => { tone(120, .6, 'sawtooth', .2, -60); noise(.5, .2, 400); },
      yay: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'triangle', .2, 0, i * .1)),
    };
    return { play: name => sounds[name] && sounds[name]() };
  })();

  /* ---------------- 念出文字（幫小朋友認字） ----------------
   * 先找 audio/ 裡用 AI 聲音錄好的 mp3（GitHub 自動產生，見 tools/gen_voice.py），
   * 找不到才用 iPad 內建的語音。
   */
  const Voice = (() => {
    const tts = 'speechSynthesis' in window;
    let voice = null;
    function pick() {
      const vs = speechSynthesis.getVoices();
      voice = vs.find(v => /zh[-_]TW/i.test(v.lang)) || vs.find(v => /zh[-_]HK/i.test(v.lang))
        || vs.find(v => /^zh/i.test(v.lang)) || null;
    }
    if (tts) {
      pick();
      speechSynthesis.addEventListener?.('voiceschanged', pick);
    }
    /* 英文的速度：1 倍、0.75 倍、0.5 倍（中文是老師的聲音，一直用正常速度）。
     * 慢速的英文是另外錄好的（tools/gen_voice.py 的 slow75:／slow50:，AI 真的慢慢念，聲音不會糊）；
     * 還沒錄好的，先把正常的錄音放慢播（音調不變）。 */
    const SPEEDS = [1, .75, .5];
    let speed = 1;
    try { speed = SPEEDS.includes(+localStorage.getItem('enSpeed')) ? +localStorage.getItem('enSpeed') : 1; } catch (e) { }
    const isEn = text => /^[\x00-\x7F]+$/.test(text);
    // 這一句要播哪個錄音（慢速有錄好就用慢速的）
    function key(text) {
      if (speed === 1 || !isEn(text)) return text;
      const k = (speed === .75 ? 'slow75:' : 'slow50:') + text;
      return index[k] ? k : text;
    }
    // 慢速還沒錄好：播正常的錄音，但放慢
    const stretch = text => speed !== 1 && isEn(text) && key(text) === text;

    function utter(text) {
      const u = new SpeechSynthesisUtterance(text);
      if (/^[\x00-\x7F]+$/.test(text)) {
        // 英文：用英文聲音
        const en = speechSynthesis.getVoices().find(v => /^en[-_]US/i.test(v.lang));
        u.lang = 'en-US';
        if (en) u.voice = en;
        u.rate = .8 * speed;
        return u;
      }
      u.lang = voice ? voice.lang : 'zh-TW';
      if (voice) u.voice = voice;
      u.rate = .85;
      u.pitch = 1.15;
      return u;
    }

    let index = {};
    fetch(AUDIO + 'index.json').then(r => r.ok ? r.json() : {}).then(j => { index = j; setTimeout(precache, 4000); }).catch(() => {});
    // 背景慢慢把音檔存起來，沒網路也能念
    async function precache() {
      if (!('caches' in window)) return;
      const c = await caches.open('school-english');
      for (const f of new Set(Object.values(index))) {
        const url = AUDIO + f;
        try { if (!(await c.match(url))) await c.add(url); } catch (e) { return; }
      }
    }

    const au = new Audio();
    au.preload = 'auto';
    let playing = false, token = 0;
    // iPad／iPhone 規定要手指「點完」（放開）才能出聲；按下去（pointerdown）有些 iPad 不算。
    // 所以按下、放開、click 都試著解鎖，直到真的解開為止
    const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    let unlocked = false;
    function unlock() {
      if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
      if (unlocked || playing) return;
      au.src = SILENT;
      au.play().then(() => { unlocked = true; hideHint(); }).catch(() => {});
    }
    ['pointerdown', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));
    // 還是被擋住：跳出大大的「點一下開聲音」，不要讓小朋友以為壞掉了
    let hint = null;
    function showHint() {
      if (hint) return;
      hint = document.createElement('button');
      hint.className = 'sound-hint';
      hint.innerHTML = '🔇<b>點一下畫面，打開聲音</b><small>如果還是沒有聲音：把音量調大，打開控制中心確認沒有靜音</small>';
      hint.addEventListener('click', () => { unlock(); hideHint(); });
      document.body.appendChild(hint);
    }
    function hideHint() { if (hint) { hint.remove(); hint = null; } }

    function fallback(text, done) {
      if (!tts) return done();
      const u = utter(text);
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
    }
    // 音檔先抓成 blob 放在記憶體：播的時候不用再等網路，一句接一句不會卡
    const blobs = new Map();
    function load(text) {
      const f = index[key(text)];
      if (!f) return null;
      if (!blobs.has(f)) {
        const p = fetch(AUDIO + f).then(r => r.ok ? r.blob() : null)
          .then(b => b && URL.createObjectURL(b)).catch(() => null);
        blobs.set(f, p);
        p.then(u => { if (!u) blobs.delete(f); });
        // 最多留 80 句，舊的放掉
        if (blobs.size > 80) {
          const [old, op] = blobs.entries().next().value;
          blobs.delete(old);
          op.then(u => u && URL.revokeObjectURL(u));
        }
      }
      return blobs.get(f);
    }
    function one(text, end, my) {
      // 保險：iPhone 開著麥克風時，播放有時會停住、播不完也不報錯；最多等 15 秒就當作念完，不會整個卡住
      let over = false;
      const done = () => { if (over) return; over = true; clearTimeout(dog); end(); };
      const dog = setTimeout(() => { if (my !== token) return; au.pause(); playing = false; done(); }, 15000);
      const p = load(text);
      if (!p) return fallback(text, done);
      playing = true;
      p.then(url => {
        if (my !== token) return;
        if (!url) { playing = false; return fallback(text, done); }
        au.onended = () => { playing = false; done(); };
        au.onerror = () => { playing = false; fallback(text, done); };
        au.src = url;
        // 放慢但音調不變
        au.preservesPitch = au.mozPreservesPitch = au.webkitPreservesPitch = true;
        au.defaultPlaybackRate = au.playbackRate = stretch(text) ? speed : 1;
        au.play().then(() => { unlocked = true; hideHint(); }).catch(err => {
          playing = false;
          au.onended = au.onerror = null;
          if (err && err.name === 'NotAllowedError') { unlocked = false; showHint(); }   // iPad 擋住了聲音
          fallback(text, done);
        });
      });
    }

    // 一句話常常是好幾段拼起來的（「三」「加」「三」「等於多少？」）。iPad／手機每換一個音檔要多等一下，
    // 聽起來會一頓一頓的：所以先把整句解碼好，用 Web Audio 一段接一段無縫排好一起播
    let ctx = null, srcs = [], timer = 0;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
      if (navigator.audioSession) navigator.audioSession.type = 'playback';   // 跟原本的播放器一樣，靜音鍵開著也念
    } catch (e) { ctx = null; }
    if (ctx) document.addEventListener('pointerdown', () => { if (ctx.state !== 'running') ctx.resume().catch(() => {}); });
    const bufs = new Map();
    function decode(text) {
      const p = load(text);
      if (!p || !ctx) return null;
      const f = index[key(text)];
      if (!bufs.has(f)) {
        const b = p.then(u => u && fetch(u)).then(r => r && r.arrayBuffer())
          .then(a => a && new Promise((ok, no) => ctx.decodeAudioData(a, ok, no))).catch(() => null);
        bufs.set(f, b);
        b.then(x => { if (!x) bufs.delete(f); });
        if (bufs.size > 80) bufs.delete(bufs.keys().next().value);
      }
      return bufs.get(f);
    }
    function stopBufs() {
      srcs.forEach(s => { s.onended = null; try { s.stop(); } catch (e) { } });
      srcs = [];
      clearTimeout(timer);
    }
    // 全部都解碼好才用無縫播放；有一段沒錄好或解不開，就照舊一段一段放
    function gapless(list, onend, my) {
      if (!ctx || ctx.state !== 'running' || !list.length) return Promise.resolve(false);
      const ps = list.map(decode);
      if (ps.some(x => !x) || list.some(stretch)) return Promise.resolve(false);   // 要放慢播的句子用一般播放器（Web Audio 放慢會變低音）
      const wait = new Promise(ok => setTimeout(() => ok(null), 2500));
      return Promise.race([Promise.all(ps), wait]).then(bs => {
        if (my !== token) return true;
        if (!bs || bs.some(b => !b)) return false;
        playing = true;
        let t = ctx.currentTime + .03;
        bs.forEach((b, i) => {
          const s = ctx.createBufferSource();
          s.buffer = b;
          s.connect(ctx.destination);
          s.start(t);
          t += b.duration;
          srcs.push(s);
          if (i === bs.length - 1) s.onended = () => { if (my !== token || !playing) return; playing = false; srcs = []; clearTimeout(timer); onend && onend(); };
        });
        // 保險：萬一 onended 沒來
        timer = setTimeout(() => { if (my === token && playing) { playing = false; srcs = []; onend && onend(); } }, (t - ctx.currentTime) * 1000 + 600);
        return true;
      });
    }

    const api = {
      speeds: SPEEDS,
      speed: () => speed,
      setSpeed(v) {
        speed = SPEEDS.includes(v) ? v : 1;
        try { localStorage.setItem('enSpeed', speed); } catch (e) { }
      },
      ok: true,
      // 依序念一串句子，全部念完呼叫 onend
      speak(list, onend) {
        api.cancel();
        if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});   // 通常是在點擊裡呼叫的：順便解鎖
        const my = ++token;
        let i = 0;
        list.forEach(load);
        const next = () => {
          if (my !== token) return;
          if (i >= list.length) return onend && onend();
          one(list[i++], next, my);
        };
        gapless(list, onend, my).then(ok => { if (!ok && my === token) next(); });
      },
      // 先把等一下要念的句子抓好
      warm(list) { list.forEach(t => decode(t) || load(t)); },
      say(text) { api.speak([text]); },
      // 播一段錄音（小朋友自己的聲音）：iPhone 每個播放器都要各自點過才能出聲，所以用已經解鎖的這兩個播放，
      // 優先用 Web Audio（可以放大聲一點，小朋友的錄音通常很小聲），不行再用一般播放器
      playClip(url, onend) {
        api.cancel();
        const my = ++token;
        let over = false;
        const end = () => { if (over || my !== token) return; over = true; playing = false; onend && onend(); };
        const viaElement = () => {
          if (my !== token) return;
          playing = true;
          au.onended = end;
          au.onerror = end;
          au.src = url;
          au.defaultPlaybackRate = au.playbackRate = 1;
          au.play().catch(end);
        };
        if (!ctx || ctx.state !== 'running') return viaElement();
        fetch(url).then(r => r.arrayBuffer()).then(a => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no))).then(buf => {
          if (my !== token) return;
          playing = true;
          const src = ctx.createBufferSource(), gain = ctx.createGain();
          gain.gain.value = 2.5;
          src.buffer = buf;
          src.connect(gain).connect(ctx.destination);
          src.onended = end;
          src.start();
          srcs.push(src);
        }).catch(viaElement);
      },
      cancel() {
        token++;
        au.onended = au.onerror = null;
        au.pause();
        stopBufs();
        playing = false;
        if (tts) speechSynthesis.cancel();
      },
      busy() { return playing || (tts && speechSynthesis.speaking); },
    };
    return api;
  })();

  window.Sound = Sound;
  window.Voice = Voice;
})();
