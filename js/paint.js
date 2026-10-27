/* 塗色引擎
 * 三層畫布：cPaint（顏色）→ cStroke（馬克筆正在畫的那一筆）→ cLines（黑色線稿，永遠在最上面）
 * 所以塗色永遠不會蓋住線條。
 */
(function () {
  const W = 1200, H = 900;           // 畫布實際像素（4:3）
  const UNDO_MAX = 12;
  const SIZES = [10, 22, 42];        // 小 / 中 / 大

  /* ---------------- 聲音（用 WebAudio 現場合成，不用音頻文件） ---------------- */
  const Sound = (() => {
    let ac;
    const ctx = () => (ac ||= new (window.AudioContext || window.webkitAudioContext)());
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

  /* ---------------- 背景音樂：八音盒風格的原創小曲，現場合成，不用音樂檔 ---------------- */
  const Music = (() => {
    const BEAT = .42;
    const n = m => 440 * 2 ** ((m - 69) / 12);
    // 每小節 4 拍的琶音：C G Am F C F G C
    const MELODY = [
      76, 79, 84, 79, 74, 79, 83, 79, 72, 76, 81, 76, 72, 77, 81, 79,
      76, 79, 88, 86, 84, 81, 77, 81, 79, 83, 86, 83, 84, 79, 76, 72,
    ];
    const BASS = [48, 43, 45, 41, 48, 41, 43, 48];
    let ac, master, timer, step = 0, next = 0, on = false, duckTimer;

    function note(freq, t, vol, dur, dest = master) {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + .01);
      g.gain.exponentialRampToValueAtTime(.0005, t + dur);
      g.connect(dest);
      // 八音盒音色：基音 + 一點點泛音
      [[1, 1], [2, .25], [3.01, .08]].forEach(([k, a]) => {
        const o = ac.createOscillator(), og = ac.createGain();
        o.type = 'sine';
        o.frequency.value = freq * k;
        og.gain.value = a;
        o.connect(og).connect(g);
        o.start(t);
        o.stop(t + dur + .05);
      });
    }

    function schedule() {
      while (next < ac.currentTime + .4) {
        note(n(MELODY[step % MELODY.length]), next, .5, 1.4);
        if (step % 4 === 0) note(n(BASS[(step / 4) % BASS.length]), next, .35, 2.2);
        if (step % 4 === 2) note(n(BASS[Math.floor(step / 4) % BASS.length] + 7), next, .15, 1.2);
        next += BEAT;
        step++;
      }
    }

    function start() {
      if (on) return;
      try {
        ac ||= new (window.AudioContext || window.webkitAudioContext)();
        if (!master) {
          master = ac.createGain();
          const lp = ac.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 2600;
          master.connect(lp).connect(ac.destination);
        }
        ac.resume();
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.setValueAtTime(0, ac.currentTime);
        master.gain.linearRampToValueAtTime(.07, ac.currentTime + 1.5);
        next = ac.currentTime + .1;
        on = true;
        timer = setInterval(schedule, 100);
        // 念字、講故事的時候把音樂調小聲
        duckTimer = setInterval(() => {
          const talking = Voice.busy();
          master.gain.setTargetAtTime(talking ? .02 : .07, ac.currentTime, .25);
        }, 250);
      } catch (e) { /* 沒有聲音也不影響 */ }
    }

    function stop() {
      if (!on) return;
      on = false;
      clearInterval(timer);
      clearInterval(duckTimer);
      master.gain.setTargetAtTime(0, ac.currentTime, .2);
    }

    // 唱兒歌：用同一個八音盒音色彈旋律，每一句開始時呼叫 onLine，彈完呼叫 onEnd。
    // 彈的時候背景音樂先停，彈完再接回來。
    let song = null;
    function playMelody(lines, bpm, onLine, onEnd) {
      stopMelody();
      try {
        ac ||= new (window.AudioContext || window.webkitAudioContext)();
        ac.resume();
      } catch (e) { return onEnd && onEnd(); }
      const resumeBg = on;
      stop();
      const out = ac.createGain();
      out.gain.value = .18;
      out.connect(ac.destination);
      const beat = 60 / bpm, t0 = ac.currentTime + .3, timers = [];
      let t = t0;
      lines.forEach((notes, li) => {
        timers.push(setTimeout(() => onLine && onLine(li), (t - ac.currentTime) * 1000));
        notes.forEach(([m, b], k) => {
          note(n(m), t, .55, Math.max(.5, b * beat * 1.8), out);
          if (k === 0) note(n(m - 24), t, .25, beat * 3, out);   // 每句開頭加一個低音
          t += b * beat;
        });
        t += beat * .5;   // 句子之間喘口氣
      });
      timers.push(setTimeout(() => { stopMelody(); onEnd && onEnd(); }, (t - ac.currentTime) * 1000 + 300));
      song = { out, timers, resumeBg };
    }
    function stopMelody() {
      if (!song) return;
      song.timers.forEach(clearTimeout);
      song.out.gain.setTargetAtTime(0, ac.currentTime, .05);
      const resume = song.resumeBg;
      song = null;
      if (resume && enabled()) start();
    }

    const enabled = () => localStorage.getItem('music') !== 'off';
    // iPad 規定要手指點過才能出聲，所以第一次點畫面時開始播
    document.addEventListener('pointerdown', () => { if (enabled()) start(); }, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { stopMelody(); stop(); }
      else if (enabled() && ac) start();
    });

    // 唱歌的錄音在播時，背景音樂先停；唱完再接回來
    let held = false;
    return {
      enabled,
      playMelody,
      stopMelody,
      hold() { held = true; stop(); },
      release() { if (held) { held = false; if (enabled() && !song) start(); } },
      playing: () => !!song || held,
      toggle() {
        const want = !enabled();
        localStorage.setItem('music', want ? 'on' : 'off');
        want ? start() : stop();
        return want;
      },
    };
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
    function utter(text) {
      const u = new SpeechSynthesisUtterance(text);
      if (/^[\x00-\x7F]+$/.test(text)) {
        // 英文：用英文聲音
        const en = speechSynthesis.getVoices().find(v => /^en[-_]US/i.test(v.lang));
        u.lang = 'en-US';
        if (en) u.voice = en;
        u.rate = .8;
        return u;
      }
      u.lang = voice ? voice.lang : 'zh-TW';
      if (voice) u.voice = voice;
      u.rate = .85;
      u.pitch = 1.15;
      return u;
    }

    let index = {};
    fetch('audio/index.json').then(r => r.ok ? r.json() : {}).then(j => { index = j; setTimeout(precache, 4000); }).catch(() => {});
    // 背景慢慢把音檔存起來，沒網路也能念
    async function precache() {
      if (!('caches' in window)) return;
      const c = await caches.open('kids-coloring');
      for (const f of new Set(Object.values(index))) {
        const url = 'audio/' + f;
        try { if (!(await c.match(url))) await c.add(url); } catch (e) { return; }
      }
    }

    const au = new Audio();
    au.preload = 'auto';
    let playing = false, token = 0;
    // iPad 規定第一次播放要手指點擊，先播一段無聲的把它解鎖
    document.addEventListener('pointerdown', () => {
      au.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      au.play().catch(() => {});
    }, { once: true });

    function fallback(text, done) {
      if (!tts) return done();
      const u = utter(text);
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
    }
    // 音檔先抓成 blob 放在記憶體：播的時候不用再等網路，一句接一句不會卡
    const blobs = new Map();
    function load(text) {
      const f = index[text];
      if (!f) return null;
      if (!blobs.has(f)) {
        const p = fetch('audio/' + f).then(r => r.ok ? r.blob() : null)
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
    function one(text, done, my) {
      const p = load(text);
      if (!p) return fallback(text, done);
      playing = true;
      p.then(url => {
        if (my !== token) return;
        if (!url) { playing = false; return fallback(text, done); }
        au.onended = () => { playing = false; done(); };
        au.onerror = () => { playing = false; fallback(text, done); };
        au.src = url;
        au.play().catch(() => { playing = false; au.onended = au.onerror = null; fallback(text, done); });
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
      const f = index[text];
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
      if (ps.some(x => !x)) return Promise.resolve(false);
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
      ok: true,
      // 依序念一串句子，全部念完呼叫 onend
      speak(list, onend) {
        api.cancel();
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

  const { COLORS, colorName, BRUSHES, BRUSH_GROUPS, PATTERNS, SHAPES } = window.WORDS;
  // 一直擺在畫旁邊的常用顏色（像一盒蠟筆），點一下就換，不用打開大調色盤
  const QUICK = ['#ff1f1f', '#ff9d1f', '#ffee00', '#33c41f', '#29b6f6', '#2962ff', '#7b1fd6', '#f06ad8', '#6b2e10', '#111111'];

  /* ---------------- 本地保存（IndexedDB，作品不會上傳到任何地方） ---------------- */
  const Store = (() => {
    let dbp;
    const db = () => (dbp ||= new Promise((res, rej) => {
      const r = indexedDB.open('kids-coloring', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('art');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = (mode, fn) => db().then(d => new Promise((res, rej) => {
      const t = d.transaction('art', mode), req = fn(t.objectStore('art'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    }));
    return {
      get: k => tx('readonly', s => s.get(k)).catch(() => null),
      put: (k, v) => tx('readwrite', s => s.put(v, k)).catch(() => null),
      del: k => tx('readwrite', s => s.delete(k)).catch(() => null),
    };
  })();


  /* ---------------- 筆刷圖標（會跟著當前顏色變色） ---------------- */
  // 每支笔都有描边、亮面、暗面，看起来立体一点
  const O = 'stroke="#3d2f1f" stroke-width="2.2" stroke-linejoin="round"';
  const HI = 'fill="#fff" fill-opacity=".45" stroke="none"';
  const SH = 'fill="#000" fill-opacity=".14" stroke="none"';
  const ICON = {
    bucket: c => `<g ${O}>
      <path d="M38 13 L82 13 L77 42 L43 42 Z" fill="#dfe5ec"/>
      <path d="M40 22 L80 22 L78.5 30 L41.5 30 Z" fill="${c}"/>
      <path d="M38 13 Q60 -10 82 13" fill="none" stroke-width="3"/>
      <ellipse cx="60" cy="13" rx="22" ry="5.5" fill="${c}"/>
      <path d="M43 15 Q41 30 46 32 Q51 30 49 16 Z" fill="${c}"/>
      <rect x="66" y="16" width="5" height="22" rx="2.5" ${HI}/>
      <path d="M88 30 Q92 22 96 30 Q96 35 92 35 Q88 35 88 30 Z" fill="${c}"/></g>`,
    marker: c => `<g ${O}>
      <path d="M4 23 L20 13 L20 33 Z" fill="${shade(c, -.25)}"/>
      <rect x="20" y="12" width="14" height="22" rx="2" fill="#c7cdd6"/>
      <path d="M25 12 L25 34 M29 12 L29 34" stroke="#8b94a1" stroke-width="1.5"/>
      <rect x="34" y="7" width="62" height="32" rx="7" fill="${c}"/>
      <rect x="94" y="9" width="22" height="28" rx="7" fill="${shade(c, -.25)}"/>
      <rect x="39" y="11" width="52" height="7" rx="3.5" ${HI}/>
      <rect x="39" y="31" width="52" height="4" rx="2" ${SH}/></g>`,
    crayon: c => `<g ${O}>
      <path d="M4 23 Q7 14 23 12.5 L23 33.5 Q7 32 4 23 Z" fill="${c}"/>
      <rect x="22" y="11" width="94" height="24" rx="7" fill="${c}"/>
      <path d="M36 11 L104 11 L100 15 L104 19 L100 23 L104 27 L100 31 L104 35 L36 35 L40 31 L36 27 L40 23 L36 19 L40 15 Z" fill="#fff8e6"/>
      <rect x="48" y="16" width="44" height="4" rx="2" fill="${c}" stroke="none"/>
      <rect x="48" y="26" width="44" height="4" rx="2" fill="${c}" stroke="none"/>
      <path d="M9 19 Q13 15 20 15" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5"/></g>`,
    pencil: c => `<g ${O}>
      <path d="M14 19 L34 10 L34 36 L14 27 Z" fill="#f6d5a3"/>
      <path d="M4 23 L14 19 L14 27 Z" fill="${shade(c, -.2)}"/>
      <rect x="34" y="10" width="68" height="26" fill="${c}"/>
      <rect x="34" y="10" width="68" height="8" ${HI}/>
      <rect x="34" y="28" width="68" height="8" ${SH}/>
      <rect x="102" y="10" width="8" height="26" fill="#cdd3db"/>
      <rect x="110" y="11" width="9" height="24" rx="4" fill="#ff9fb6"/></g>`,
    water: c => `<g ${O}>
      <path d="M52 15 L110 18 Q118 23 110 28 L52 31 Z" fill="#d68d4e"/>
      <path d="M56 18 L106 20" stroke="#fff" stroke-opacity=".45" stroke-width="2.5"/>
      <rect x="34" y="13" width="18" height="20" rx="2" fill="#d9dee6"/>
      <path d="M40 13 L40 33 M46 13 L46 33" stroke="#9aa3b0" stroke-width="1.5"/>
      <path d="M2 23 Q10 9 34 14 L34 32 Q10 37 2 23 Z" fill="${c}"/>
      <path d="M10 19 Q18 14 28 16" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5"/>
      <path d="M12 31 Q11 39 15 40 Q19 39 17 31 Z" fill="${c}"/></g>`,
    spray: c => `<g ${O}>
      ${[[8, 14, 2.4], [4, 22, 2.8], [9, 31, 2.2], [14, 22, 1.8], [2, 30, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="none"/>`).join('')}
      <rect x="18" y="18" width="10" height="10" rx="2" fill="#9aa3ad"/>
      <path d="M28 12 Q35 8 42 10 L42 36 Q35 38 28 34 Z" fill="#e3e7ec"/>
      <rect x="42" y="7" width="74" height="32" rx="9" fill="${c}"/>
      <rect x="60" y="7" width="34" height="32" fill="${shade(c, .5)}"/>
      <rect x="47" y="11" width="64" height="6" rx="3" ${HI}/></g>`,
    glitter: c => `<g ${O}>
      <path d="M4 23 L22 15 L22 31 Z" fill="${shade(c, -.25)}"/>
      <rect x="22" y="14" width="12" height="18" rx="2" fill="#e3e7ec"/>
      <path d="M34 9 L108 7 Q117 7 117 16 L117 30 Q117 39 108 39 L34 37 Z" fill="${c}"/>
      <rect x="38" y="12" width="70" height="6" rx="3" ${HI}/>
      ${[[50, 26, 5], [70, 22, 4], [88, 28, 5.5], [104, 20, 3.5], [60, 32, 3]].map(([x, y, r]) => `<path d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3} L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3} Z" fill="#fff" stroke="none"/>`).join('')}</g>`,
    rainbow: () => `<g ${O}>
      <path d="M14 19 L34 10 L34 36 L14 27 Z" fill="#f6d5a3"/>
      <path d="M4 23 L14 19 L14 27 Z" fill="#ff3b3b"/>
      ${['#ff3b3b', '#ff9d1f', '#ffe14d', '#3fc24f', '#2aa8f2', '#8a4fe0'].map((k, i) => `<rect x="34" y="${10 + i * 26 / 6}" width="76" height="${26 / 6 + .3}" fill="${k}" stroke="none"/>`).join('')}
      <rect x="34" y="10" width="76" height="26" fill="none"/>
      <rect x="34" y="10" width="76" height="6" ${HI}/>
      <rect x="110" y="11" width="9" height="24" rx="4" fill="#ff9fb6"/></g>`,
    pattern: c => `<g ${O}>
      <image href="${patternTile(state.pattern, c).toDataURL()}" x="4" y="6" width="50" height="34" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 9px)"/>
      <rect x="4" y="6" width="50" height="34" rx="9" fill="none"/>
      <path d="M54 23 L68 23" stroke-width="4"/>
      <rect x="66" y="15" width="50" height="16" rx="8" fill="#6c7a89"/>
      <rect x="70" y="18" width="42" height="4" rx="2" ${HI}/></g>`,
  };
  const ERASER_ICON = `<svg viewBox="0 0 100 100"><g transform="rotate(-32 50 50)" stroke="#3d2f1f" stroke-width="3" stroke-linejoin="round">
    <path d="M14 46 L86 46 L86 70 Q86 76 80 76 L20 76 Q14 76 14 70 Z" fill="#c2577a"/>
    <path d="M50 46 L86 46 L86 70 Q86 76 80 76 L50 76 Z" fill="#3f5bc4"/>
    <rect x="14" y="30" width="72" height="34" rx="8" fill="#ff8fb1"/>
    <path d="M50 30 L80 30 Q86 30 86 36 L86 58 Q86 64 80 64 L50 64 Z" fill="#6b8cff"/>
    <rect x="20" y="35" width="24" height="7" rx="3.5" fill="#fff" fill-opacity=".55" stroke="none"/>
    <rect x="55" y="35" width="25" height="7" rx="3.5" fill="#fff" fill-opacity=".4" stroke="none"/></g></svg>`;

  const iconSVG = (id, c) => `<svg viewBox="0 0 120 46">${ICON[id](c)}</svg>`;

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function shade(h, amt) { // amt>0 變淺，amt<0 變深
    const [r, g, b] = hexToRgb(h).map(v => Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)));
    return `rgb(${r},${g},${b})`;
  }

  /* ---------------- 主體 ---------------- */
  const $ = id => document.getElementById(id);
  const stage = $('stage'), board = $('board');
  const cPaint = $('cPaint'), cStroke = $('cStroke'), cLines = $('cLines');
  for (const c of [cPaint, cStroke, cLines]) { c.width = W; c.height = H; }
  const pctx = cPaint.getContext('2d', { willReadFrequently: true });
  const sctx = cStroke.getContext('2d');
  const lctx = cLines.getContext('2d', { willReadFrequently: true });

  const state = {
    drawing: null,
    tool: localStorage.getItem('tool') || 'crayon',
    color: localStorage.getItem('color') || '#ff1f1f',
    size: +(localStorage.getItem('size') || 1),
    barrier: new Uint8Array(W * H),
    undo: [],
    dirty: false,
    inside: localStorage.getItem('inside') !== 'off',
    pattern: localStorage.getItem('pattern') || 'waves',
    shape: localStorage.getItem('shape') || 'star',   // 不出界，預設打開
    recent: (() => { try { return JSON.parse(localStorage.getItem('recent')) || []; } catch (e) { return []; } })(),
  };
  let lastTool = state.tool !== 'eraser' ? state.tool : 'crayon';

  /* 畫布大小：在可用空間裡保持 4:3 */
  function fit() {
    const cs = getComputedStyle(board);
    const aw = board.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = board.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const w = Math.max(100, Math.min(aw, ah * W / H));
    stage.style.width = w + 'px';
    stage.style.height = (w * H / W) + 'px';
  }
  new ResizeObserver(fit).observe(board);

  /* ---------- 線稿：渲染成黑線 + 透明背景 ---------- */
  function loadLines(drawing) {
    lctx.clearRect(0, 0, W, H);
    state.barrier.fill(0);
    state.samples = null;
    if (!drawing.svg) return Promise.resolve();
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        lctx.drawImage(img, 0, 0, W, H);
        const id = lctx.getImageData(0, 0, W, H), d = id.data;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          // 越黑越不透明，白色（被遮住線條用的白底）變透明
          const dark = 255 - (d[i] + d[i + 1] + d[i + 2]) / 3;
          const a = Math.min(255, d[i + 3] * dark / 200);
          d[i] = d[i + 1] = d[i + 2] = 34;
          d[i + 3] = a;
          if (a > 90) state.barrier[p] = 1;
        }
        lctx.putImageData(id, 0, 0);
        computeInterior();
        res();
      };
      img.onerror = res;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART.svgDoc(ART.lineArt(drawing.svg), W, H));
    });
  }

  /* ---------- 完成度：線稿被分成一塊一塊，算有幾塊塗了顏色 ---------- */
  // 按「塊」算而不是按面積算：車身很大、車燈很小，但都要塗才算完成
  const MIN_REGION = 900;   // 太小的地方（眼睛反光點、門把手這種細縫）不算
  function computeInterior() {
    const bar = state.barrier, label = new Int32Array(W * H);   // 0 = 還沒看過，-1 = 外面
    const fill = (start, id) => {
      const stack = [start], pts = [];
      label[start] = id;
      while (stack.length) {
        const i = stack.pop(), x = i % W;
        pts.push(i);
        if (x > 0 && !bar[i - 1] && !label[i - 1]) { label[i - 1] = id; stack.push(i - 1); }
        if (x < W - 1 && !bar[i + 1] && !label[i + 1]) { label[i + 1] = id; stack.push(i + 1); }
        if (i >= W && !bar[i - W] && !label[i - W]) { label[i - W] = id; stack.push(i - W); }
        if (i < W * (H - 1) && !bar[i + W] && !label[i + W]) { label[i + W] = id; stack.push(i + W); }
      }
      return pts;
    };
    // 先把碰到畫布邊的「外面」標起來
    for (let x = 0; x < W; x++) for (const i of [x, (H - 1) * W + x]) if (!bar[i] && !label[i]) fill(i, -1);
    for (let y = 0; y < H; y++) for (const i of [y * W, y * W + W - 1]) if (!bar[i] && !label[i]) fill(i, -1);
    // 剩下的每一塊各取最多 60 個點來檢查
    const regions = [];
    for (let i = 0; i < W * H; i++) {
      if (bar[i] || label[i]) continue;
      const pts = fill(i, regions.length + 1);
      if (pts.length < MIN_REGION) continue;
      const step = Math.max(1, Math.floor(pts.length / 60));
      const sample = [];
      for (let k = 0; k < pts.length; k += step) sample.push(pts[k]);
      regions.push(Int32Array.from(sample));
    }
    state.samples = regions.length ? regions : null;
  }

  // 回傳 { done, total, pct }；自由畫的白紙沒有線稿，回傳 null
  function coverage() {
    if (!state.samples) return null;
    const d = pctx.getImageData(0, 0, W, H).data;
    let colored = 0;
    for (const pts of state.samples) {
      let n = 0;
      for (const i of pts) if (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2] < 735) n++;
      if (n >= pts.length * .5) colored++;
    }
    const total = state.samples.length;
    const allowMiss = Math.floor(total * .1);   // 可以漏塗一成（很多塊的圖才有用）
    const done = total - colored <= allowMiss;
    return { done, total, colored, pct: done ? 100 : Math.round(colored / total * 100) };
  }

  function showProgress() {
    const c = coverage(), el = $('progress');
    el.hidden = c === null;
    if (c === null) return;
    el.querySelector('i').style.width = c.pct + '%';
    el.querySelector('b').textContent = c.done ? '⭐ 完成！' : c.pct + '%';
    el.classList.toggle('full', c.done);
  }

  async function open(drawing) {
    // 每次進來都從「畫筆」開始（上次用的筆，預設蠟筆），油漆桶這些特別工具要自己選
    const pen = localStorage.getItem('pen');
    state.tool = BRUSHES.some(b => b.id === pen && b.group === 'pen') ? pen : 'crayon';
    lastTool = state.tool;
    state.drawing = drawing;
    state.undo = [];
    const cat = ART.CATEGORIES.find(c => c.id === drawing.cat) || ART.CATEGORIES[0];
    const chip = $('nameChip');
    chip.innerHTML = `<span class="ic">${cat.icon}</span>${drawing.name}${drawing.en ? `<span class="en">${drawing.en}</span>` : ''}`;
    chip.style.cssText = `--c:${cat.color};--cd:${cat.dark}`;
    pctx.globalAlpha = 1;
    pctx.globalCompositeOperation = 'source-over';
    pctx.fillStyle = '#fff';
    pctx.fillRect(0, 0, W, H);
    sctx.clearRect(0, 0, W, H);
    fit();
    const [saved] = await Promise.all([Store.get('paint:' + drawing.id), loadLines(drawing)]);
    if (saved && saved.paint) {
      const bmp = await blobToImage(saved.paint);
      if (bmp) pctx.drawImage(bmp, 0, 0, W, H);
    }
    showProgress();
    updateUI();
  }

  function blobToImage(blob) {
    return new Promise(res => {
      const url = URL.createObjectURL(blob), img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); res(null); };
      img.src = url;
    });
  }

  /* ---------- 撤銷 ---------- */
  function snapshot() {
    state.undo.push(pctx.getImageData(0, 0, W, H));
    if (state.undo.length > UNDO_MAX) state.undo.shift();
    $('undoBtn').disabled = false;
  }
  function undo() {
    const s = state.undo.pop();
    if (!s) return;
    pctx.putImageData(s, 0, 0);
    Sound.play('click');
    $('undoBtn').disabled = !state.undo.length;
    scheduleSave();
  }
  function clearAll() {
    snapshot();
    pctx.fillStyle = '#fff';
    pctx.fillRect(0, 0, W, H);
    Sound.play('splash');
    scheduleSave();
  }

  /* ---------- 自動保存 ---------- */
  let saveTimer;
  function scheduleSave() {
    state.dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 700);
    clearTimeout(progressTimer);
    progressTimer = setTimeout(showProgress, 150);
  }
  let progressTimer;
  async function save() {
    clearTimeout(saveTimer);
    if (!state.dirty || !state.drawing) return;
    state.dirty = false;
    const id = state.drawing.id;
    const paint = await new Promise(r => cPaint.toBlob(r, 'image/png'));
    const t = document.createElement('canvas');
    t.width = 400; t.height = 300;
    const tc = t.getContext('2d');
    tc.drawImage(cPaint, 0, 0, 400, 300);
    tc.drawImage(cLines, 0, 0, 400, 300);
    const thumb = await new Promise(r => t.toBlob(r, 'image/png'));
    await Store.put('paint:' + id, { paint, thumb, t: Date.now(), cover: coverage() });
  }

  // 按 ✔ 的時候：存起來，並告訴首頁到底畫完了沒
  async function finish() {
    state.dirty = true;
    const c = coverage();
    await save();
    return { cover: c, done: c === null ? true : c.done };
  }

  function composite() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.drawImage(cPaint, 0, 0);
    x.drawImage(cLines, 0, 0);
    return c;
  }

  /* ---------- 油漆桶：按線稿邊界填滿一塊 ---------- */
  // 從 (sx, sy) 開始，找出被線稿圍起來的那一塊。回傳 mask 和外框
  function region(sx, sy) {
    sx = Math.floor(sx); sy = Math.floor(sy);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null;
    const bar = state.barrier;
    if (bar[sy * W + sx]) return null;   // 點到線上了
    const mask = new Uint8Array(W * H);
    let x0 = sx, x1 = sx, y0 = sy, y1 = sy;
    const open = i => !mask[i] && !bar[i];
    const stack = [sx, sy];
    while (stack.length) {
      const y = stack.pop();
      let x = stack.pop();
      let i = y * W + x;
      while (x >= 0 && open(i)) { x--; i--; }
      x++; i++;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      let up = false, down = false;
      while (x < W && open(i)) {
        mask[i] = 1;
        if (y > 0) {
          const o = open(i - W);
          if (o && !up) { stack.push(x, y - 1); up = true; } else if (!o) up = false;
        }
        if (y < H - 1) {
          const o = open(i + W);
          if (o && !down) { stack.push(x, y + 1); down = true; } else if (!o) down = false;
        }
        x++; i++;
      }
      if (x - 1 > x1) x1 = x - 1;
    }
    // 往線條下面多塗 3 像素，避免邊緣留白
    const D = 3;
    x0 = Math.max(1, x0 - D); y0 = Math.max(1, y0 - D);
    x1 = Math.min(W - 2, x1 + D); y1 = Math.min(H - 2, y1 + D);
    for (let pass = 0; pass < D; pass++) {
      const add = [];
      for (let y = y0; y <= y1; y++) {
        for (let i = y * W + x0, e = y * W + x1; i <= e; i++) {
          if (mask[i] || !bar[i]) continue;
          if (mask[i - 1] === 1 || mask[i + 1] === 1 || mask[i - W] === 1 || mask[i + W] === 1) add.push(i);
        }
      }
      for (const i of add) mask[i] = 2;
      for (const i of add) mask[i] = 1;
    }
    return { mask, x0, y0, x1, y1 };
  }

  function bucket(sx, sy) {
    const r = region(sx, sy);
    if (!r) return;
    snapshot();
    const { mask } = r;
    const img = pctx.getImageData(0, 0, W, H), d = img.data;
    const [cr, cg, cb] = hexToRgb(state.color);
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;
      const k = i * 4;
      d[k] = cr; d[k + 1] = cg; d[k + 2] = cb; d[k + 3] = 255;
    }
    pctx.putImageData(img, 0, 0);
    Sound.play('fill');
    scheduleSave();
  }

  /* ---------- 不出界：筆畫只留在開始的那一格裡 ---------- */
  let clip = null;   // { canvas, x0, y0, w, h }
  function makeClip(p) {
    clip = null;
    if (!state.inside || !state.drawing || !state.drawing.svg) return;
    // 點在線上的話，找附近最近的一格
    let r = null;
    for (let d = 0; d <= 15 && !r; d += 3) {
      for (const [dx, dy] of [[0, 0], [d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, -d], [d, -d], [-d, d]]) {
        r = region(p.x + dx, p.y + dy);
        if (r) break;
      }
    }
    if (!r) return;
    const w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d'), img = cx.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0, i = (y + r.y0) * W + r.x0; x < w; x++, i++) {
        if (r.mask[i]) d[(y * w + x) * 4 + 3] = 255;
      }
    }
    cx.putImageData(img, 0, 0);
    clip = { canvas: c, x0: r.x0, y0: r.y0, w, h };
  }
  function applyClip() {
    if (!clip) return;
    sctx.save();
    sctx.globalCompositeOperation = 'destination-in';
    sctx.drawImage(clip.canvas, clip.x0, clip.y0);
    sctx.restore();
    // 外框以外的也清掉
    sctx.clearRect(0, 0, W, clip.y0);
    sctx.clearRect(0, clip.y0 + clip.h, W, H);
    sctx.clearRect(0, clip.y0, clip.x0, clip.h);
    sctx.clearRect(clip.x0 + clip.w, clip.y0, W, clip.h);
  }

  /* ---------- 各種筆 ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  let pat = { key: '', crayon: null, pattern: null };
  // 花紋滾筒的各種花紋：淺色底 + 目前顏色畫的圖案（彩虹例外）
  function patternTile(id, color) {
    const c = document.createElement('canvas');
    const S = 48;
    c.width = c.height = S;
    const x = c.getContext('2d');
    x.fillStyle = id === 'rainbow' ? '#fff' : shade(color, .62);
    x.fillRect(0, 0, S, S);
    x.fillStyle = x.strokeStyle = color;
    x.lineWidth = 6;
    x.lineCap = x.lineJoin = 'round';
    const star = (cx, cy, r) => {
      x.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * .45 : r, a = i * Math.PI / 5 - Math.PI / 2;
        x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      x.fill();
    };
    const heart = (cx, cy, r) => {
      x.beginPath();
      x.moveTo(cx, cy + r);
      x.bezierCurveTo(cx - r * 1.6, cy - r * .2, cx - r * .6, cy - r * 1.3, cx, cy - r * .35);
      x.bezierCurveTo(cx + r * .6, cy - r * 1.3, cx + r * 1.6, cy - r * .2, cx, cy + r);
      x.fill();
    };
    if (id === 'waves') {
      for (const y of [8, 32]) {
        x.beginPath(); x.moveTo(0, y);
        x.quadraticCurveTo(12, y - 10, 24, y); x.quadraticCurveTo(36, y + 10, 48, y); x.stroke();
      }
    } else if (id === 'dots') {
      for (const [cx, cy] of [[12, 12], [36, 36], [36, 12], [12, 36]]) { x.beginPath(); x.arc(cx, cy, 7, 0, Math.PI * 2); x.fill(); }
    } else if (id === 'stripes') {
      for (let k = -S; k < S * 2; k += 16) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + S, S); x.stroke(); }
    } else if (id === 'checks') {
      x.fillRect(0, 0, 24, 24); x.fillRect(24, 24, 24, 24);
    } else if (id === 'hearts') {
      heart(12, 13, 9); heart(36, 37, 9);
    } else if (id === 'stars') {
      star(12, 13, 10); star(36, 37, 10);
    } else if (id === 'zigzag') {
      for (const y of [12, 36]) { x.beginPath(); x.moveTo(0, y); for (let k = 0; k <= 4; k++) x.lineTo(k * 12, y + (k % 2 ? -8 : 8)); x.stroke(); }
    } else if (id === 'rainbow') {
      ['#ff3b3b', '#ff9d1f', '#ffe14d', '#3fc24f', '#2aa8f2', '#8a4fe0'].forEach((k, i) => { x.fillStyle = k; x.fillRect(0, i * 8, S, 8); });
    }
    return c;
  }

  function patterns() {
    const key = state.color + state.pattern;
    if (pat.key === key) return pat;
    // 蠟筆：帶小洞的紋理
    const c1 = document.createElement('canvas');
    c1.width = c1.height = 64;
    const x1 = c1.getContext('2d');
    x1.fillStyle = state.color;
    x1.fillRect(0, 0, 64, 64);
    x1.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 420; i++) x1.fillRect(Math.random() * 64, Math.random() * 64, rnd(1, 2.5), rnd(1, 2.5));
    const c2 = patternTile(state.pattern, state.color);
    pat = { key, crayon: pctx.createPattern(c1, 'repeat'), pattern: pctx.createPattern(c2, 'repeat') };
    return pat;
  }

  let dab = { key: '', img: null };
  function waterDab(r) {
    const key = state.color + r;
    if (dab.key === key) return dab.img;
    const c = document.createElement('canvas');
    c.width = c.height = r * 2;
    const x = c.getContext('2d');
    const [R, G, B] = hexToRgb(state.color);
    const g = x.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, `rgba(${R},${G},${B},.22)`);
    g.addColorStop(.7, `rgba(${R},${G},${B},.12)`);
    g.addColorStop(1, `rgba(${R},${G},${B},0)`);
    x.fillStyle = g;
    x.fillRect(0, 0, r * 2, r * 2);
    dab = { key, img: c };
    return c;
  }

  // 閃粉筆的造型：星星、愛心、泡泡、小花、亮片、雪花
  function stamp(ctx, shape, x, y, r, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (shape === 'star') {
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * .45 : r, a = i * Math.PI / 5 - Math.PI / 2;
        ctx.lineTo(rr * Math.cos(a), rr * Math.sin(a));
      }
      ctx.fill();
    } else if (shape === 'heart') {
      ctx.moveTo(0, r);
      ctx.bezierCurveTo(-r * 1.6, -r * .2, -r * .6, -r * 1.3, 0, -r * .35);
      ctx.bezierCurveTo(r * .6, -r * 1.3, r * 1.6, -r * .2, 0, r);
      ctx.fill();
    } else if (shape === 'bubble') {
      ctx.globalAlpha = .35;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(2, r * .15);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-r * .35, -r * .35, r * .22, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'flower') {
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * .55, Math.sin(a) * r * .55, r * .45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.arc(0, 0, r * .35, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'diamond') {
      ctx.moveTo(0, -r); ctx.lineTo(r * .6, 0); ctx.lineTo(0, r); ctx.lineTo(-r * .6, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath();
      ctx.moveTo(0, -r * .6); ctx.lineTo(r * .25, 0); ctx.lineTo(0, -r * .1); ctx.lineTo(-r * .25, 0);
      ctx.fill();
    } else if (shape === 'snow') {
      ctx.lineWidth = Math.max(2, r * .16);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.moveTo(0, 0); ctx.lineTo(0, -r);
        ctx.moveTo(0, -r * .55); ctx.lineTo(r * .25, -r * .8);
        ctx.moveTo(0, -r * .55); ctx.lineTo(-r * .25, -r * .8);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function shapePreview(shape, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, 64, 64);
    stamp(x, shape, 32, 30, 20, 0, color);
    return c.toDataURL();
  }

  function line(ctx, a, b, width, style) {
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // 沿著線段每隔 step 做一件事
  function along(a, b, step, fn) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    stroke.carry += len;
    while (stroke.carry >= step) {
      stroke.carry -= step;
      const t = len ? 1 - stroke.carry / len : 1;
      fn(a.x + dx * t, a.y + dy * t);
    }
  }

  const stroke = { last: null, carry: 0, hue: 0, sprayTimer: 0, pos: null };

  const TOOLS = {
    pencil: { move: (a, b, s) => line(sctx, a, b, s * .45, state.color) },
    crayon: { move: (a, b, s) => line(sctx, a, b, s * 1.1, patterns().crayon) },
    marker: { alpha: .65, move: (a, b, s) => line(sctx, a, b, s * 1.6, state.color) },
    water: {
      move: (a, b, s) => {
        const r = Math.round(s * 1.5), img = waterDab(r);
        along(a, b, Math.max(2, r * .25), (x, y) => sctx.drawImage(img, x - r, y - r));
      },
    },
    spray: {
      start: () => { stroke.sprayTimer = setInterval(() => { if (stroke.pos) { spray(stroke.pos); applyClip(); } }, 30); },
      move: (a, b) => spray(b),
      end: () => clearInterval(stroke.sprayTimer),
    },
    glitter: {
      move: (a, b, s) => along(a, b, s * 1.1, (x, y) => {
        const hue = Math.random() * 360;
        const sh = state.shape;
        stamp(sctx, sh, x + rnd(-s, s), y + rnd(-s, s), rnd(s * .45, s * .95), sh === 'heart' || sh === 'bubble' ? rnd(-.4, .4) : Math.random() * 6, Math.random() < .5 ? state.color : `hsl(${hue},90%,65%)`);
        sctx.fillStyle = '#fff';
        sctx.fillRect(x + rnd(-s, s), y + rnd(-s, s), 3, 3);
      }),
    },
    rainbow: {
      move: (a, b, s) => {
        stroke.hue = (stroke.hue + 3) % 360;
        line(sctx, a, b, s * 1.2, `hsl(${stroke.hue},95%,55%)`);
      },
    },
    pattern: { move: (a, b, s) => line(sctx, a, b, s * 1.8, patterns().pattern) },
    eraser: { move: (a, b, s) => line(sctx, a, b, s * 2, '#fff') },
  };

  function spray(p) {
    const s = SIZES[state.size] * 1.8;
    sctx.fillStyle = state.color;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * s;
      sctx.fillRect(p.x + r * Math.cos(a), p.y + r * Math.sin(a), 2.2, 2.2);
    }
  }

  /* ---------- 觸摸/鼠標 ---------- */
  let active = null;
  const toCanvas = e => {
    const r = stage.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  };

  stage.addEventListener('pointerdown', e => {
    if (active !== null) return;      // 只認一根手指，手掌碰到也沒關係
    e.preventDefault();
    const p = toCanvas(e);
    if (state.tool === 'bucket') { bucket(p.x, p.y); return; }
    active = e.pointerId;
    stage.setPointerCapture(e.pointerId);
    snapshot();
    const t = TOOLS[state.tool];
    makeClip(p);
    cStroke.style.opacity = t.alpha || 1;
    stroke.last = p; stroke.pos = p; stroke.carry = 0;
    t.start && t.start(p);
    t.move(p, { x: p.x + .1, y: p.y + .1 }, SIZES[state.size]);   // 點一下也有一個點
    applyClip();
  });

  stage.addEventListener('pointermove', e => {
    if (e.pointerId !== active) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    const t = TOOLS[state.tool], s = SIZES[state.size];
    for (const ev of evs.length ? evs : [e]) {
      const p = toCanvas(ev);
      t.move(stroke.last, p, s);
      stroke.last = stroke.pos = p;
    }
    applyClip();
  });

  function endStroke(e) {
    if (e.pointerId !== active) return;
    active = null;
    const t = TOOLS[state.tool];
    t.end && t.end();
    applyClip();
    pctx.globalAlpha = t.alpha || 1;
    pctx.drawImage(cStroke, 0, 0);
    pctx.globalAlpha = 1;
    sctx.clearRect(0, 0, W, H);
    clip = null;
    stroke.pos = null;
    scheduleSave();
  }
  stage.addEventListener('pointerup', endStroke);
  stage.addEventListener('pointercancel', endStroke);

  /* ---------- 工具欄和彈出面板 ---------- */
  const brushPop = $('brushPop'), colorPop = $('colorPop'), scrim = $('scrim');
  // 打開面板，並把小箭頭指向按下的按鈕（和參考圖一樣）
  function showPop(pop, anchor) {
    const opening = pop && pop.hidden;
    const arrow = $('popArrow');
    brushPop.hidden = colorPop.hidden = true;
    scrim.hidden = arrow.hidden = !opening;
    if (!opening) return;
    pop.hidden = false;
    const box = $('paint').getBoundingClientRect(), a = anchor.getBoundingClientRect();
    const portrait = innerHeight > innerWidth;
    pop.style.animation = 'none';
    const p = pop.getBoundingClientRect();
    pop.style.animation = '';
    if (portrait) {
      arrow.style.left = (a.left + a.width / 2 - 19 - box.left) + 'px';
      arrow.style.top = (p.bottom - 26 - box.top) + 'px';
    } else {
      arrow.style.left = (p.right - 26 - box.left) + 'px';
      arrow.style.top = (a.top + a.height / 2 - 19 - box.top) + 'px';
    }
  }
  scrim.addEventListener('pointerdown', () => showPop(null));

  function setTool(id) {
    state.tool = id;
    if (BRUSHES.some(b => b.id === id && b.group === 'pen')) localStorage.setItem('pen', id);
    if (id !== 'eraser') lastTool = id;
    localStorage.setItem('tool', id);
    updateUI();
  }
  function setColor(c) {
    if (c === state.color) { if (state.tool === 'eraser') state.tool = lastTool; updateUI(); return; }
    // 記住最近用過的 4 個顏色
    state.recent = [state.color, ...state.recent.filter(x => x !== state.color && x !== c)].slice(0, 4);
    localStorage.setItem('recent', JSON.stringify(state.recent));
    state.color = c;
    localStorage.setItem('color', c);
    if (state.tool === 'eraser') state.tool = lastTool;
    updateUI();
  }

  function updateUI() {
    const toolForIcon = state.tool === 'eraser' ? lastTool : state.tool;
    $('brushBtn').innerHTML = `<svg viewBox="18 18 84 84"><g transform="translate(60 60) rotate(${toolForIcon === 'bucket' ? 0 : -40}) translate(-62 -23)">${ICON[toolForIcon](state.color)}</g></svg>`;
    $('brushBtn').classList.toggle('on', state.tool !== 'eraser');
    $('eraserBtn').classList.toggle('on', state.tool === 'eraser');
    $('colorDot').style.background = state.color;
    $('undoBtn').disabled = !state.undo.length;
    $('insideBtn').classList.toggle('on', state.inside);
    $('insideBtn').innerHTML = `<span class="sw"><i></i></span>不畫出線外`;
    $('quick').innerHTML = QUICK.map(c =>
      `<button class="qc${c === state.color && state.tool !== 'eraser' ? ' on' : ''}" data-c="${c}" style="--qc:${c}" aria-label="${colorName(c)}"></button>`).join('');
    $('recent').innerHTML = state.recent.map(c =>
      `<button data-c="${c}" style="background:${c}" aria-label="${colorName(c)}"></button>`).join('');

    $('brushList').innerHTML = BRUSH_GROUPS.map(g => `
      <div class="brush-group ${g.id}"><div class="group-title">${g.icon} ${g.name}</div><div class="group-items">${BRUSHES.filter(b => b.group === g.id).map(b =>
        `<button class="brush${b.id === state.tool ? ' on' : ''}" data-id="${b.id}">${iconSVG(b.id, state.color)}<span>${b.name}</span></button>`).join('')}</div></div>`).join('');
    $('sizes').innerHTML = SIZES.map((s, i) =>
      `<button class="size${i === state.size ? ' on' : ''}" data-i="${i}" aria-label="粗細${i + 1}"><i style="width:${10 + i * 14}px;height:${10 + i * 14}px"></i></button>`).join('');
    $('patternRow').hidden = state.tool !== 'pattern' && state.tool !== 'glitter';
    if (state.tool === 'glitter') {
      $('patternRow').innerHTML = `<div class="group-title">✨ 選造型</div><div class="pattern-items">${SHAPES.map(p =>
        `<button class="pat shape${p.id === state.shape ? ' on' : ''}" data-s="${p.id}" style="background-image:url(${shapePreview(p.id, state.color)})" aria-label="${p.name}"><span>${p.name}</span></button>`).join('')}</div>`;
    } else if (state.tool === 'pattern') {
      $('patternRow').innerHTML = `<div class="group-title">🎨 選花紋</div><div class="pattern-items">${PATTERNS.map(p =>
        `<button class="pat${p.id === state.pattern ? ' on' : ''}" data-p="${p.id}" style="background-image:url(${patternTile(p.id, state.color).toDataURL()})" aria-label="${p.name}"><span>${p.name}</span></button>`).join('')}</div>`;
    }
    $('colorGrid').innerHTML = COLORS.map(c =>
      `<button class="swatch${c === state.color ? ' on' : ''}${c === '#ffffff' ? ' light' : ''}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
  }

  $('brushList').addEventListener('click', e => {
    const b = e.target.closest('.brush');
    if (!b) return;
    Sound.play('pop');
    Voice.say(BRUSHES.find(x => x.id === b.dataset.id).name);
    setTool(b.dataset.id);
    setTimeout(() => showPop(null), 150);
  });
  $('sizes').addEventListener('click', e => {
    const b = e.target.closest('.size');
    if (!b) return;
    Sound.play('click');
    Voice.say(['細細的', '中等的', '粗粗的'][+b.dataset.i]);
    state.size = +b.dataset.i;
    localStorage.setItem('size', state.size);
    if (state.tool === 'eraser' || state.tool === 'bucket') state.tool = state.tool === 'bucket' ? 'marker' : 'eraser';
    updateUI();
  });
  $('colorGrid').addEventListener('click', e => {
    const b = e.target.closest('.swatch');
    if (!b) return;
    Sound.play('pop');
    Voice.say(colorName(b.dataset.c));
    setColor(b.dataset.c);
    setTimeout(() => showPop(null), 150);
  });
  $('recent').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    Sound.play('pop');
    Voice.say(colorName(b.dataset.c));
    setColor(b.dataset.c);
  });
  $('quick').addEventListener('click', e => {
    const b = e.target.closest('.qc');
    if (!b) return;
    Sound.play('pop');
    Voice.say(colorName(b.dataset.c));
    showPop(null);
    setColor(b.dataset.c);
  });
  $('insideBtn').addEventListener('click', () => {
    state.inside = !state.inside;
    localStorage.setItem('inside', state.inside ? 'on' : 'off');
    Sound.play('click');
    Voice.say(state.inside ? '不畫出線外，打開' : '不畫出線外，關掉');
    updateUI();
  });
  $('nameChip').addEventListener('click', () => {
    Sound.play('click');
    Voice.speak([state.drawing.name, state.drawing.en].filter(Boolean));
  });
  $('patternRow').addEventListener('click', e => {
    const b = e.target.closest('.pat');
    if (!b) return;
    Sound.play('pop');
    if (b.dataset.s) {
      state.shape = b.dataset.s;
      localStorage.setItem('shape', state.shape);
      Voice.say(SHAPES.find(p => p.id === state.shape).name);
      return updateUI();
    }
    state.pattern = b.dataset.p;
    localStorage.setItem('pattern', state.pattern);
    Voice.say(PATTERNS.find(p => p.id === state.pattern).name);
    updateUI();
  });
  $('customColor').addEventListener('input', e => setColor(e.target.value));

  $('brushBtn').addEventListener('click', () => {
    Sound.play('click');
    if (state.tool === 'eraser') setTool(lastTool);
    showPop(brushPop, $('brushBtn'));
  });
  $('colorBtn').addEventListener('click', () => { Sound.play('click'); showPop(colorPop, $('colorBtn')); });
  $('eraserBtn').innerHTML = ERASER_ICON;
  $('eraserBtn').addEventListener('click', () => { Sound.play('click'); Voice.say('橡皮擦'); showPop(null); setTool('eraser'); });
  $('undoBtn').addEventListener('click', undo);
  $('clearBtn').addEventListener('click', () => { showPop(null); Voice.say('全部擦掉嗎？'); $('confirm').hidden = false; });
  $('confirmYes').addEventListener('click', () => { $('confirm').hidden = true; clearAll(); });
  $('confirmNo').addEventListener('click', () => { $('confirm').hidden = true; });

  $('photoBtn').addEventListener('click', async () => {
    showPop(null);
    Sound.play('twinkle');
    const c = composite();
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const file = new File([blob], `${state.drawing.name}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: state.drawing.name }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    $('photoImg').src = c.toDataURL('image/png');
    $('photo').hidden = false;
  });
  $('photoClose').addEventListener('click', () => { $('photo').hidden = true; });

  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => document.hidden && save());

  window.Sound = Sound;
  window.Voice = Voice;
  window.Music = Music;
  window.Store = Store;
  window.Painter = { open, save, finish, current: () => state.drawing };
})();
