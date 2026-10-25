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

  /* ---------------- 念出文字（幫小朋友認字） ---------------- */
  const Voice = (() => {
    const ok = 'speechSynthesis' in window;
    let voice = null;
    function pick() {
      const vs = speechSynthesis.getVoices();
      voice = vs.find(v => /zh[-_]TW/i.test(v.lang)) || vs.find(v => /zh[-_]HK/i.test(v.lang))
        || vs.find(v => /^zh/i.test(v.lang)) || null;
    }
    if (ok) {
      pick();
      speechSynthesis.addEventListener?.('voiceschanged', pick);
    }
    function utter(text) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? voice.lang : 'zh-TW';
      if (voice) u.voice = voice;
      u.rate = .85;
      u.pitch = 1.15;
      return u;
    }
    return {
      ok,
      utter,
      say(text) {
        if (!ok) return;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter(text));
      },
      cancel() { if (ok) speechSynthesis.cancel(); },
    };
  })();

  // 顏色名字：照色相、深淺算出來，例如「淺藍色」「深綠色」
  function colorName(hex) {
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (sat < .18 || d < .08) return l > .93 ? '白色' : l < .12 ? '黑色' : l > .7 ? '淺灰色' : l < .4 ? '深灰色' : '灰色';
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    let name;
    if (h < 12 || h >= 345) name = '紅色';
    else if (h < 42) name = l < .45 ? '咖啡色' : '橘色';
    else if (h < 68) name = l < .4 ? '橄欖綠' : '黃色';
    else if (h < 160) name = '綠色';
    else if (h < 195) name = '青色';
    else if (h < 250) name = '藍色';
    else if (h < 290) name = '紫色';
    else name = '粉紅色';
    if (name === '咖啡色' || name === '橄欖綠') return name;
    if (l > .74) return (name === '紅色' ? '粉紅色' : '淺' + name);
    if (l < .32) return '深' + name;
    return name;
  }

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

  /* ---------------- 顏色：8 列 x 7 行，和參考圖一樣 ---------------- */
  const COLORS = [
    '#ff1f1f', '#ff9d1f', '#ffee00', '#2e8b1f', '#29b6f6', '#0019ff', '#7b1fd6', '#5a5a5a',
    '#c41414', '#ff6d00', '#ffc400', '#145214', '#1976d2', '#0a0f8c', '#3b0f8c', '#111111',
    '#f0625a', '#ff9f73', '#ffd633', '#33c41f', '#4dd0e1', '#2962ff', '#6a5cf0', '#a8a8a8',
    '#f8b8c0', '#ffd9a8', '#fff09a', '#c8ff7a', '#b2f0f0', '#b3d4ff', '#c5b5f5', '#ffffff',
    '#f06ad8', '#f7c060', '#99cc0f', '#7ddba0', '#36cfc0', '#2f8de0', '#b073f0', '#c9c5bf',
    '#e0249c', '#cc8a2e', '#b0b010', '#2fae8a', '#2aa2b8', '#2148c4', '#8e3fe0', '#9c9890',
    '#b5157a', '#6b2e10', '#5b7a10', '#1d8a72', '#1b7a8a', '#1e3f8a', '#5a2a80', '#5f5d58',
  ];

  /* ---------------- 筆刷圖標（會跟著當前顏色變色） ---------------- */
  const ICON = {
    bucket: c => `<path d="M30 8 L60 8 L56 36 L34 36 Z" fill="${c}" stroke="#555" stroke-width="2.5"/><ellipse cx="45" cy="8" rx="15" ry="4" fill="${shade(c, -.25)}" stroke="#555" stroke-width="2.5"/><path d="M30 10 Q20 10 22 24" fill="none" stroke="#777" stroke-width="3"/><path d="M60 14 Q72 18 70 30 Q66 38 64 30 Q64 22 58 22" fill="${c}" stroke="#555" stroke-width="2"/><rect x="78" y="14" width="40" height="18" rx="5" fill="#d9d9d9" stroke="#999" stroke-width="2"/>`,
    marker: c => `<path d="M6 23 L22 14 L22 32 Z" fill="${c}" stroke="#555" stroke-width="2"/><rect x="22" y="11" width="22" height="24" rx="3" fill="#9e9e9e"/><rect x="44" y="8" width="72" height="30" rx="5" fill="${c}"/><rect x="48" y="12" width="64" height="6" rx="3" fill="#fff" opacity=".35"/>`,
    crayon: c => `<path d="M6 23 Q10 15 24 14 L24 32 Q10 31 6 23 Z" fill="${c}"/><rect x="24" y="12" width="92" height="22" rx="6" fill="${c}"/><rect x="40" y="12" width="60" height="22" fill="#fff" opacity=".85"/><path d="M48 18 L92 18 M48 28 L92 28" stroke="${c}" stroke-width="3"/>`,
    pencil: c => `<path d="M6 23 L16 19 L16 27 Z" fill="#444"/><path d="M16 19 L38 11 L38 35 L16 27 Z" fill="#f2d3a0"/><rect x="38" y="11" width="78" height="24" fill="${c}"/><rect x="38" y="11" width="78" height="8" fill="#fff" opacity=".3"/>`,
    water: c => `<path d="M4 23 Q18 8 36 16 L36 30 Q18 38 4 23 Z" fill="${c}"/><rect x="36" y="15" width="18" height="16" fill="#cfcfcf"/><path d="M54 17 L114 20 Q118 23 114 26 L54 29 Z" fill="#c98a4b"/>`,
    spray: c => `<rect x="10" y="17" width="10" height="12" rx="2" fill="#777"/><path d="M20 13 Q28 9 34 11 L34 35 Q28 37 20 33 Z" fill="#bbb"/><rect x="34" y="9" width="82" height="28" rx="6" fill="${c}"/><circle cx="6" cy="16" r="2" fill="${c}"/><circle cx="3" cy="24" r="2" fill="${c}"/><circle cx="7" cy="31" r="2" fill="${c}"/>`,
    glitter: c => `<path d="M6 23 L30 12 L30 34 Z" fill="${shade(c, -.2)}"/><rect x="30" y="9" width="86" height="28" rx="6" fill="${c}"/>${[[44, 17], [58, 28], [72, 15], [86, 26], [100, 18], [64, 21], [94, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/>`).join('')}`,
    rainbow: () => `<path d="M6 23 L24 13 L24 33 Z" fill="#ff1f1f"/>${['#ff1f1f', '#ff9d1f', '#ffee00', '#33c41f', '#29b6f6', '#7b1fd6'].map((k, i) => `<rect x="24" y="${10 + i * 4.4}" width="92" height="4.6" fill="${k}"/>`).join('')}`,
    pattern: c => `<rect x="10" y="7" width="106" height="32" rx="6" fill="${shade(c, .55)}"/><path d="M12 15 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0 M12 26 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0 M12 37 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t8 0" fill="none" stroke="${c}" stroke-width="4"/>`,
  };
  const BRUSHES = [
    { id: 'bucket', name: '油漆桶' },
    { id: 'marker', name: '馬克筆' },
    { id: 'crayon', name: '蠟筆' },
    { id: 'pencil', name: '鉛筆' },
    { id: 'water', name: '水彩筆' },
    { id: 'spray', name: '噴漆' },
    { id: 'glitter', name: '閃粉筆' },
    { id: 'rainbow', name: '彩虹筆' },
    { id: 'pattern', name: '花紋筆' },
  ];
  const ERASER_ICON = `<svg viewBox="0 0 100 100"><g transform="rotate(-35 50 50)"><rect x="14" y="32" width="72" height="36" rx="8" fill="#fff" stroke="#8a8fd6" stroke-width="4"/><rect x="50" y="32" width="36" height="36" rx="6" fill="#6b6fd6"/></g></svg>`;

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
    tool: localStorage.getItem('tool') || 'bucket',
    color: localStorage.getItem('color') || '#ff1f1f',
    size: +(localStorage.getItem('size') || 1),
    barrier: new Uint8Array(W * H),
    undo: [],
    dirty: false,
  };
  let lastTool = state.tool !== 'eraser' ? state.tool : 'bucket';

  /* 畫布大小：在可用空間裡保持 4:3 */
  function fit() {
    const r = board.getBoundingClientRect();
    const pad = 20;
    const w = Math.min(r.width - pad, (r.height - pad) * W / H);
    stage.style.width = w + 'px';
    stage.style.height = (w * H / W) + 'px';
  }
  new ResizeObserver(fit).observe(board);

  /* ---------- 線稿：渲染成黑線 + 透明背景 ---------- */
  function loadLines(drawing) {
    lctx.clearRect(0, 0, W, H);
    state.barrier.fill(0);
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
        res();
      };
      img.onerror = res;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART.svgDoc(ART.lineArt(drawing.svg), W, H));
    });
  }

  async function open(drawing) {
    state.drawing = drawing;
    state.undo = [];
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
  }
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
    await Store.put('paint:' + id, { paint, thumb, t: Date.now() });
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
  function bucket(sx, sy) {
    sx = Math.floor(sx); sy = Math.floor(sy);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
    const bar = state.barrier;
    if (bar[sy * W + sx]) return;   // 點到線上了
    snapshot();
    const mask = new Uint8Array(W * H);
    const open = i => !mask[i] && !bar[i];
    const stack = [sx, sy];
    while (stack.length) {
      const y = stack.pop();
      let x = stack.pop();
      let i = y * W + x;
      while (x >= 0 && open(i)) { x--; i--; }
      x++; i++;
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
    }
    // 往線條下面多塗 3 像素，避免邊緣留白
    for (let pass = 0; pass < 3; pass++) {
      const add = [];
      for (let i = W; i < W * H - W; i++) {
        if (mask[i] || !bar[i]) continue;
        if (mask[i - 1] === 1 || mask[i + 1] === 1 || mask[i - W] === 1 || mask[i + W] === 1) add.push(i);
      }
      for (const i of add) mask[i] = 2;
      for (const i of add) mask[i] = 1;
    }
    const img = pctx.getImageData(0, 0, W, H), d = img.data;
    const [r, g, b] = hexToRgb(state.color);
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;
      const k = i * 4;
      d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
    }
    pctx.putImageData(img, 0, 0);
    Sound.play('fill');
    scheduleSave();
  }

  /* ---------- 各種筆 ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  let pat = { key: '', crayon: null, pattern: null };
  function patterns() {
    const key = state.color;
    if (pat.key === key) return pat;
    // 蠟筆：帶小洞的紋理
    const c1 = document.createElement('canvas');
    c1.width = c1.height = 64;
    const x1 = c1.getContext('2d');
    x1.fillStyle = state.color;
    x1.fillRect(0, 0, 64, 64);
    x1.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 420; i++) x1.fillRect(Math.random() * 64, Math.random() * 64, rnd(1, 2.5), rnd(1, 2.5));
    // 花紋：淺底 + 波浪線
    const c2 = document.createElement('canvas');
    c2.width = c2.height = 48;
    const x2 = c2.getContext('2d');
    x2.fillStyle = shade(state.color, .6);
    x2.fillRect(0, 0, 48, 48);
    x2.strokeStyle = state.color;
    x2.lineWidth = 6;
    for (const y of [8, 32]) {
      x2.beginPath();
      x2.moveTo(0, y);
      x2.quadraticCurveTo(12, y - 10, 24, y);
      x2.quadraticCurveTo(36, y + 10, 48, y);
      x2.stroke();
    }
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

  function star(ctx, x, y, r, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * .45 : r, a = i * Math.PI / 5 - Math.PI / 2;
      ctx.lineTo(rr * Math.cos(a), rr * Math.sin(a));
    }
    ctx.fill();
    ctx.restore();
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
    pencil: { move: (a, b, s) => line(pctx, a, b, s * .45, state.color) },
    crayon: { move: (a, b, s) => line(pctx, a, b, s * 1.1, patterns().crayon) },
    marker: {
      start: () => { cStroke.style.opacity = .65; },
      move: (a, b, s) => line(sctx, a, b, s * 1.6, state.color),
      end: () => {
        pctx.globalAlpha = .65;
        pctx.drawImage(cStroke, 0, 0);
        pctx.globalAlpha = 1;
        sctx.clearRect(0, 0, W, H);
      },
    },
    water: {
      move: (a, b, s) => {
        const r = Math.round(s * 1.5), img = waterDab(r);
        along(a, b, Math.max(2, r * .25), (x, y) => pctx.drawImage(img, x - r, y - r));
      },
    },
    spray: {
      start: () => { stroke.sprayTimer = setInterval(() => stroke.pos && spray(stroke.pos), 30); },
      move: (a, b) => spray(b),
      end: () => clearInterval(stroke.sprayTimer),
    },
    glitter: {
      move: (a, b, s) => along(a, b, s * 1.1, (x, y) => {
        const hue = Math.random() * 360;
        star(pctx, x + rnd(-s, s), y + rnd(-s, s), rnd(s * .4, s * .9), Math.random() * 6, Math.random() < .5 ? state.color : `hsl(${hue},90%,65%)`);
        pctx.fillStyle = '#fff';
        pctx.fillRect(x + rnd(-s, s), y + rnd(-s, s), 3, 3);
      }),
    },
    rainbow: {
      move: (a, b, s) => {
        stroke.hue = (stroke.hue + 3) % 360;
        line(pctx, a, b, s * 1.2, `hsl(${stroke.hue},95%,55%)`);
      },
    },
    pattern: { move: (a, b, s) => line(pctx, a, b, s * 1.8, patterns().pattern) },
    eraser: { move: (a, b, s) => line(pctx, a, b, s * 2, '#fff') },
  };

  function spray(p) {
    const s = SIZES[state.size] * 1.8;
    pctx.fillStyle = state.color;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * s;
      pctx.fillRect(p.x + r * Math.cos(a), p.y + r * Math.sin(a), 2.2, 2.2);
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
    stroke.last = p; stroke.pos = p; stroke.carry = 0;
    t.start && t.start(p);
    t.move(p, { x: p.x + .1, y: p.y + .1 }, SIZES[state.size]);   // 點一下也有一個點
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
  });

  function endStroke(e) {
    if (e.pointerId !== active) return;
    active = null;
    const t = TOOLS[state.tool];
    t.end && t.end();
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
    if (id !== 'eraser') lastTool = id;
    localStorage.setItem('tool', id);
    updateUI();
  }
  function setColor(c) {
    state.color = c;
    localStorage.setItem('color', c);
    if (state.tool === 'eraser') state.tool = lastTool;
    updateUI();
  }

  function updateUI() {
    const toolForIcon = state.tool === 'eraser' ? lastTool : state.tool;
    $('brushBtn').innerHTML = `<svg viewBox="18 18 84 84"><g transform="translate(60 60) rotate(-40) translate(-62 -23)">${ICON[toolForIcon](state.color)}</g></svg>`;
    $('brushBtn').classList.toggle('on', state.tool !== 'eraser');
    $('eraserBtn').classList.toggle('on', state.tool === 'eraser');
    $('colorDot').style.background = state.color;
    $('undoBtn').disabled = !state.undo.length;

    $('brushList').innerHTML = BRUSHES.map(b =>
      `<button class="brush${b.id === state.tool ? ' on' : ''}" data-id="${b.id}">${iconSVG(b.id, state.color)}<span>${b.name}</span></button>`).join('');
    $('sizes').innerHTML = SIZES.map((s, i) =>
      `<button class="size${i === state.size ? ' on' : ''}" data-i="${i}" aria-label="粗細${i + 1}"><i style="width:${10 + i * 14}px;height:${10 + i * 14}px"></i></button>`).join('');
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
  window.Store = Store;
  window.Painter = { open, save };
})();
