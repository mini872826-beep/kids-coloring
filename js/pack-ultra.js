/* 線稿包：超人力霸王（Q 版）
 * 大頭（約 45% 身高）、短身體；每位超人力霸王的招牌特徵（頭冠、角、頭鏢、胸前護甲、
 * 彩色計時器）都刻意誇大，讓小朋友一眼認出是誰。 */
(function () {
  const { sparkle, ground } = window.ART.helpers;
  const f1 = v => String(Math.round(v * 10) / 10);

  const starD = (cx, cy, R, r = R * .48, n = 5, a0 = -Math.PI / 2) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = a0 + i * Math.PI / n, rr = i % 2 ? r : R;
      d += (i ? ' L' : 'M') + f1(cx + rr * Math.cos(a)) + ' ' + f1(cy + rr * Math.sin(a));
    }
    return d + ' Z';
  };
  const star = (cx, cy, R, c, r, n) => `<path fill="${c}" d="${starD(cx, cy, R, r, n)}"/>`;
  const capD = (x1, y1, x2, y2, w) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, h = w / 2, nx = -(y2 - y1) / L * h, ny = (x2 - x1) / L * h;
    const p = (x, y) => `${f1(x)} ${f1(y)}`;
    return `M${p(x1 + nx, y1 + ny)} L${p(x2 + nx, y2 + ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x2 - nx, y2 - ny)} L${p(x1 - nx, y1 - ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x1 + nx, y1 + ny)} Z`;
  };
  const cap = (x1, y1, x2, y2, w, c) => `<path fill="${c}" d="${capD(x1, y1, x2, y2, w)}"/>`;
  // 圓形（用四段曲線，方便座標換算）
  const circD = (x, y, r) => {
    const c = r * .5523;
    return `M ${x - r} ${y} C ${x - r} ${y - c} ${x - c} ${y - r} ${x} ${y - r} C ${x + c} ${y - r} ${x + r} ${y - c} ${x + r} ${y} ` +
      `C ${x + r} ${y + c} ${x + c} ${y + r} ${x} ${y + r} C ${x - c} ${y + r} ${x - r} ${y + c} ${x - r} ${y} Z`;
  };
  const PAIR = /(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g;
  const flipD = d => d.replace(PAIR, (m, x, y) => f1(-x) + ' ' + y);

  // 「身體座標」：頭的中心 = (0,0)
  function K(ox, oy, s) {
    const X = x => ox + x * s, Y = y => oy + y * s;
    const mp = d => d.replace(PAIR, (m, x, y) => f1(X(+x)) + ' ' + f1(Y(+y)));
    const k = {
      s, X, Y,
      path: (c, d) => `<path fill="${c}" d="${mp(d)}"/>`,
      sym: (c, d) => k.path(c, d) + k.path(c, flipD(d)),
      line: d => `<path d="${mp(d)}"/>`,
      symLine: d => k.line(d) + k.line(flipD(d)),
      circ: (x, y, r, c) => `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="${f1(r * s)}" fill="${c}"/>`,
      ell: (x, y, rx, ry, c, rot = 0) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="${c}"${rot ? ` transform="rotate(${f1(rot)} ${f1(X(x))} ${f1(Y(y))})"` : ''}/>`,
      rect: (x, y, w, h, r, c) => `<rect x="${f1(X(x))}" y="${f1(Y(y))}" width="${f1(w * s)}" height="${f1(h * s)}" rx="${f1(r * s)}" fill="${c}"/>`,
      star: (x, y, R, c, r, n) => star(X(x), Y(y), R * s, c, (r || R * .48) * s, n),
      cap: (a, b, w, c) => cap(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), w * s, c),
      dot: (x, y, r = 5) => k.line(circD(x, y, r)),
      dots: (pts, r) => pts.map(([x, y]) => k.dot(x, y, r) + k.dot(-x, y, r)).join(''),
    };
    return k;
  }

  // ---- 顏色 ----
  const RED = '#ff6b6b', SIL = '#e9ecef', SIL2 = '#ced4da', EYE = '#fff3bf', TIMER = '#74c0fc',
    GOLD = '#ffd43b', PUR = '#9775fa', BLUE = '#4dabf7', DARK = '#495057', GREEN = '#69db7c';

  // ---- 共用部位 ----
  const HEAD = 'M 0 -104 C 62 -104 100 -62 100 0 C 100 58 62 100 0 100 C -62 100 -100 58 -100 0 C -100 -62 -62 -104 0 -104 Z';
  // 臉部面罩（頭兩側是別的顏色時用）
  const MASK = 'M 0 -60 C 52 -60 84 -30 86 6 C 88 52 54 96 0 98 C -54 96 -88 52 -86 6 C -84 -30 -52 -60 0 -60 Z';
  const ears = (k, c, y = 0) => k.sym(c, `M -92 ${y - 24} Q -114 ${y - 22} -114 ${y} Q -114 ${y + 22} -92 ${y + 24} Z`);
  // 蛋形大眼睛：外側圓、內側尖、往外上方斜
  const EYE_D = {
    classic: 'M -14 14 Q -22 -22 -58 -26 Q -82 -26 -80 -4 Q -76 24 -44 28 Q -20 30 -14 14 Z',
    sharp: 'M -12 12 Q -26 -16 -64 -32 Q -84 -34 -82 -10 Q -76 20 -42 26 Q -18 28 -12 12 Z',
    round: 'M -16 10 Q -18 -22 -50 -24 Q -80 -22 -78 4 Q -74 28 -44 28 Q -18 28 -16 10 Z',
    big: 'M -10 14 Q -18 -26 -58 -32 Q -88 -32 -84 -4 Q -80 30 -42 32 Q -14 32 -10 14 Z',
  };
  const eyes = (k, type = 'classic', c = EYE) => k.sym(c, EYE_D[type]);
  const mouth = k => k.line('M -16 62 Q 0 70 16 62');
  const timer = (k, y = 140, r = 22) => k.circ(0, y, r, TIMER) + k.line(`M ${-r * .5} ${y - r * .35} Q ${-r * .2} ${y - r * .7} ${r * .25} ${y - r * .62}`);

  const TORSO = 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 66 262 L -66 262 Z';
  // 手臂：a 肩膀, b 手肘, c 拳頭
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function arm(k, A, [a, b, c]) {
    let s = k.cap(a, b, 46, A.up || A.c) + k.cap(b, c, 42, A.c);
    if (A.band) s += k.cap(lerp(b, c, .45), lerp(b, c, .8), 48, A.band);
    if (A.pad) s += k.circ(a[0], a[1], 32, A.pad);
    if (A.open) {
      const ang = Math.atan2(c[1] - b[1], c[0] - b[0]);
      s += k.ell(c[0] + Math.cos(ang) * 10, c[1] + Math.sin(ang) * 10, 32, 25, A.hand, ang * 180 / Math.PI);
    } else s += k.circ(c[0], c[1], 26, A.hand);
    return s;
  }
  function leg(k, L, [a, b, c]) {
    return k.cap(a, b, 58, L.c) + k.cap(b, c, 54, L.c) + k.cap(lerp(b, c, .45), c, 60, L.boot);
  }
  // 一位超人：o = { x, y, s, legs, arms, back, L, A, torso(k), head(k), extra(k) }
  function ultra(o) {
    const k = K(o.x, o.y, o.s || .9);
    const hs = o.hs || .9, hk = K(o.x, o.y + (o.hy || -4) * (o.s || .9), (o.s || .9) * hs);
    return (o.behind ? o.behind(k) : '') +
      (o.back || []).map(a => arm(k, a.A || o.A, a.j || a)).join('') +
      o.legs.map(l => leg(k, o.L, l)).join('') +
      o.torso(k) + o.head(hk) +
      o.arms.map(a => arm(k, a.A || o.A, a.j || a)).join('') +
      (o.extra ? o.extra(k) : '');
  }

  const STAND = [[[-34, 250], [-42, 320], [-50, 392]], [[34, 250], [42, 320], [50, 392]]];
  const WIDE = [[[-34, 250], [-80, 315], [-110, 388]], [[34, 250], [80, 315], [110, 388]]];
  const HIP_L = [[-78, 120], [-132, 180], [-74, 228]];
  const HIP_R = [[78, 120], [132, 180], [74, 228]];
  const P = (x, y, s = .9) => ({ x, y, s });

  // 背景：小城市、星星
  const minihouse = (x, w, h, c) => `<rect x="${x}" y="${560 - h}" width="${w}" height="${h}" rx="6" fill="${c}"/>` +
    `<rect x="${x + w / 2 - 16}" y="${560 - h + 22}" width="32" height="30" rx="4" fill="#a8e0ff"/>`;
  const town = (a = '#ffe8cc', b = '#d0ebff') => minihouse(40, 100, 120, a) + minihouse(660, 100, 150, b);

  // ================= 1. 初代超人力霸王 =================
  // 銀色頭、中央一道頭鰭、蛋形大眼、小方耳；身體銀底紅色花紋，胸口藍色計時器
  const headUltraman = (k, eyeT = 'classic') =>
    ears(k, SIL2) + k.path(SIL, HEAD) +
    k.path(SIL2, 'M -14 -36 Q -16 -96 -10 -118 Q 0 -128 10 -118 Q 16 -96 14 -36 Q 0 -26 -14 -36 Z') +
    eyes(k, eyeT) + mouth(k);
  const SHIELD = 'M -46 92 L 46 92 Q 62 150 36 202 Q 18 236 0 250 Q -18 236 -36 202 Q -62 150 -46 92 Z';
  const torsoUltraman = k =>
    k.path(RED, TORSO) + k.path(SIL, SHIELD) + k.rect(-66, 236, 132, 26, 6, RED) +
    k.path(SIL, 'M -20 262 L 0 248 L 20 262 Z') + timer(k);
  const UM = { A: { c: RED, up: RED, band: SIL, hand: SIL }, L: { c: RED, boot: SIL } };
  const ultraman = `
    ${town()}
    ${ultra({ ...P(400, 178), ...UM, legs: STAND, arms: [HIP_L, HIP_R], torso: torsoUltraman, head: k => headUltraman(k) })}
    ${ground(560)}
    ${sparkle(110, 90, 22)} ${sparkle(690, 90, 22)} ${sparkle(170, 330, 14, '#74c0fc')} ${sparkle(640, 330, 14, '#ff8fab')}`;

  // ================= 2. 賽文 =================
  // 紅色頭 + 銀色臉，頭頂回力鏢形「頭鏢」，額頭綠色光束燈；銀色護甲有直條和一排排小圓釘；沒有計時器
  const slugger = k =>
    k.path(SIL, 'M -16 -92 Q -22 -128 -46 -164 Q 0 -184 46 -164 Q 22 -128 16 -92 Z') +
    k.line('M 0 -96 L 0 -170');
  const headSeven = k =>
    ears(k, RED, -4) + k.path(RED, HEAD) + k.path(SIL, MASK) + slugger(k) +
    k.rect(-15, -86, 30, 28, 10, GREEN) +
    eyes(k, 'big') + k.symLine('M -74 -12 L -26 -12 M -78 8 L -18 8') + mouth(k);
  const torsoSeven = k =>
    k.path(RED, TORSO) +
    k.path(SIL, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 80 168 Q 40 190 0 194 Q -40 190 -80 168 Z') +
    k.symLine('M -24 98 L -24 192 M -50 96 L -52 186') +
    k.dots([[-12, 150], [-12, 172], [-37, 146], [-37, 168], [-66, 140]], 5);
  const seven = `
    ${minihouse(40, 100, 120, '#ffe8cc')}
    <path d="M610 130 Q650 90 700 100 M600 165 Q660 140 720 150"/>
    ${ultra({ ...P(400, 186), A: { c: RED, hand: SIL }, L: { c: RED, boot: SIL }, legs: STAND,
      arms: [HIP_L, [[78, 120], [172, 10], [76, -138]]], torso: torsoSeven, head: headSeven })}
    ${ground(560)}
    ${sparkle(120, 90, 20)} ${sparkle(700, 330, 16, '#69db7c')} ${sparkle(150, 330, 14, '#74c0fc')}`;

  // ================= 3. 傑克 =================
  // 長得像初代，但紅色花紋旁邊多一條細紅線（雙線），手上戴著超人手鐲
  const torsoJack = k =>
    k.path(RED, TORSO) + k.path(SIL, SHIELD) +
    k.path(RED, 'M -34 92 L 34 92 Q 46 148 26 194 Q 12 222 0 234 Q -12 222 -26 194 Q -46 148 -34 92 Z') +
    k.path(SIL, 'M -24 92 L 24 92 Q 34 146 18 188 Q 8 208 0 218 Q -8 208 -18 188 Q -34 146 -24 92 Z') +
    k.rect(-66, 236, 132, 26, 6, RED) + timer(k, 136, 20);
  const jack = `
    ${town('#d3f9d8', '#fff3bf')}
    ${ultra({ ...P(390, 180), ...UM, legs: STAND, arms: [HIP_L, [[78, 120], [150, 60], [150, -40]]], torso: torsoJack,
      head: k => headUltraman(k),
      extra: k => k.cap([150, 6], [150, -14], 50, GOLD) + k.ell(150, -4, 12, 9, '#ff8787') })}
    ${ground(560)}
    <path d="M598 70 L580 40 M630 60 L640 26 M660 92 L694 80"/>
    ${sparkle(110, 90, 20)} ${sparkle(690, 220, 18)} ${sparkle(170, 330, 14, '#74c0fc')}`;

  // ================= 4. 艾斯 =================
  // 頭頂高高的薄片頭冠，中間有一個洞，前面有光束燈；胸前銀色花紋外圍一圈金邊
  const headAce = k =>
    ears(k, SIL2) + k.path(SIL, HEAD) +
    k.path(SIL2, 'M -16 -36 Q -22 -110 -34 -150 Q -30 -186 0 -192 Q 30 -186 34 -150 Q 22 -110 16 -36 Q 0 -26 -16 -36 Z') +
    k.ell(0, -152, 15, 22, '#fff') + k.rect(-12, -64, 24, 24, 8, GREEN) +
    eyes(k, 'sharp') + mouth(k);
  const torsoAce = k =>
    k.path(RED, TORSO) +
    k.path(GOLD, 'M -58 92 L 58 92 Q 74 150 44 206 Q 22 240 0 256 Q -22 240 -44 206 Q -74 150 -58 92 Z') +
    k.path(SIL, 'M -42 92 L 42 92 Q 56 148 32 194 Q 16 222 0 234 Q -16 222 -32 194 Q -56 148 -42 92 Z') +
    timer(k, 138, 20);
  const ace = `
    ${town('#e5dbff', '#ffe8cc')}
    ${ultra({ ...P(400, 196), A: { c: RED, band: SIL, hand: SIL }, L: { c: RED, boot: SIL },
      legs: STAND, arms: [[[-78, 120], [-150, 70], [-170, -10]], HIP_R], torso: torsoAce, head: headAce })}
    ${ground(560)}
    ${sparkle(110, 80, 20)} ${sparkle(690, 90, 22)} ${sparkle(660, 300, 14, '#74c0fc')}`;

  // ================= 5. 泰羅 =================
  // 頭上一對大大的「超人角」，中間一道頭冠；銀色護甲上有一排排小圓釘
  const headTaro = k =>
    k.sym(SIL2, 'M -46 -88 Q -96 -100 -112 -150 Q -116 -186 -92 -202 Q -96 -168 -80 -142 Q -60 -118 -24 -102 Z') +
    ears(k, RED, -4) + k.path(RED, HEAD) + k.path(SIL, MASK) +
    k.path(SIL2, 'M -12 -60 Q -14 -100 -8 -116 Q 0 -124 8 -116 Q 14 -100 12 -60 Z') +
    eyes(k, 'big') + mouth(k);
  const torsoTaro = k =>
    k.path(RED, TORSO) +
    k.path(SIL, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 78 160 Q 50 178 22 176 Q 0 200 -22 176 Q -50 178 -78 160 Z') +
    k.dots([[-34, 112], [-48, 124], [-62, 136], [-74, 148], [-58, 108], [-72, 120]], 6.5) +
    timer(k, 140, 20) + k.rect(-66, 236, 132, 26, 6, SIL);
  const taro = `
    ${town('#fff3bf', '#ffc9c9')}
    ${ultra({ ...P(400, 210, .86), A: { c: RED, hand: SIL, band: SIL }, L: { c: RED, boot: SIL },
      legs: STAND, arms: [HIP_L, [[78, 120], [140, 40], [150, -50]]], torso: torsoTaro, head: headTaro })}
    ${ground(560)}
    ${sparkle(110, 90, 20)} ${sparkle(690, 330, 16, '#74c0fc')} ${sparkle(140, 330, 14, '#ff8fab')}`;

  // ================= 6. 雷歐 =================
  // 紅色身體，頭頂像獅子鬃毛一樣的鋸齒頭冠，額頭綠色光束燈，肚子上有雷歐標誌；空手道架勢
  const headLeo = k =>
    k.path(RED, 'M -26 -86 Q -40 -118 -58 -126 Q -42 -134 -40 -144 Q -54 -156 -46 -166 Q -28 -160 -20 -172 Q -10 -186 0 -186 Q 10 -186 20 -172 Q 28 -160 46 -166 Q 54 -156 40 -144 Q 42 -134 58 -126 Q 40 -118 26 -86 Z') +
    ears(k, SIL2) + k.path(SIL, HEAD) +
    k.path(RED, 'M -18 -48 Q -24 -96 -26 -104 Q 0 -112 26 -104 Q 24 -96 18 -48 Q 0 -40 -18 -48 Z') +
    k.rect(-12, -50, 24, 22, 8, GREEN) +
    eyes(k, 'sharp') + mouth(k);
  const torsoLeo = k =>
    k.path(RED, TORSO) +
    k.path(SIL, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 78 158 Q 40 176 0 172 Q -40 176 -78 158 Z') +
    k.symLine('M -30 98 L -32 172 M -56 96 L -58 166') +
    timer(k, 136, 20) +
    k.path(SIL, 'M -30 206 L 30 206 L 22 238 L 0 250 L -22 238 Z') + k.line('M -12 216 L -12 236 L 12 236');
  const leo = `
    <path d="M560 210 L640 200 M570 250 L660 250 M560 290 L640 300"/>
    ${ultra({ ...P(370, 190, .88), A: { c: RED, hand: SIL, band: SIL2 }, L: { c: RED, boot: SIL },
      legs: WIDE,
      back: [[[-78, 120], [-140, 170], [-96, 214]]],
      arms: [[[78, 120], [150, 130], [205, 116]]], torso: torsoLeo, head: headLeo })}
    ${ground(560)}
    ${sparkle(100, 90, 20)} ${sparkle(700, 100, 20, '#ffa94d')} ${sparkle(700, 420, 14, '#74c0fc')}`;

  // ================= 7. 迪卡（複合型） =================
  // 銀色頭、中央有溝紋的頭冠、額頭水晶；紅 + 紫 + 銀的身體，金銀條紋的護甲；哉佩利敖光線 L 字姿勢
  const headTiga = k =>
    k.sym(SIL2, 'M -96 -16 Q -112 -10 -110 14 Q -104 30 -92 26 Z') + k.path(SIL, HEAD) +
    k.path(SIL2, 'M -24 -40 Q -32 -96 -18 -114 Q 0 -122 18 -114 Q 32 -96 24 -40 Q 0 -30 -24 -40 Z') +
    k.symLine('M -10 -44 Q -14 -90 -8 -112') +
    k.path('#99e9f2', 'M 0 -64 L 12 -50 L 0 -36 L -12 -50 Z') +
    eyes(k, 'round') + mouth(k);
  const torsoTiga = k =>
    k.path(SIL, TORSO) +
    k.sym(RED, 'M -84 118 Q -86 94 -56 92 L -30 92 Q -48 150 -40 200 L -72 200 Z') +
    k.sym(PUR, 'M -72 200 L -40 200 Q -30 236 -10 262 L -66 262 Z') +
    k.path(GOLD, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 74 150 Q 40 162 22 186 L 0 200 L -22 186 Q -40 162 -74 150 Z') +
    k.symLine('M -40 96 Q -46 130 -62 150 M -22 96 Q -26 140 -40 166') +
    timer(k, 140, 20);
  const TA = { c: RED, band: PUR, hand: SIL };
  const tiga = `
    <path fill="#fff3bf" d="M500 280 L790 200 L790 440 L500 380 Z"/><path fill="#a5d8ff" d="M500 312 L790 285 L790 360 L500 350 Z"/>
    ${ultra({ ...P(340, 196, .86), A: TA, L: { c: PUR, boot: SIL }, legs: STAND,
      arms: [{ j: [[78, 120], [160, 246], [160, 96]], A: TA }, { j: [[-78, 120], [-96, 226], [170, 236]], A: TA }],
      torso: torsoTiga, head: headTiga })}
    ${ground(560)}
    ${sparkle(100, 90, 20)} ${sparkle(700, 300, 18, '#b197fc')} ${sparkle(620, 440, 14, '#74c0fc')}`;

  // ================= 8. 帝納（閃亮型） =================
  // 頭冠兩旁有凹溝、額頭上星星形的帝納水晶；紅 + 藍 + 銀，胸前大護甲有金色線條
  const headDyna = k =>
    ears(k, SIL2) + k.path(SIL, HEAD) +
    k.path(SIL2, 'M -22 -40 Q -30 -92 -22 -112 Q 0 -126 22 -112 Q 30 -92 22 -40 Q 0 -30 -22 -40 Z') +
    k.symLine('M -40 -54 Q -52 -80 -46 -100 M -54 -48 Q -68 -70 -66 -88') +
    k.star(0, -54, 20, GOLD, 9, 4) +
    eyes(k, 'classic') + mouth(k);
  const torsoDyna = k =>
    k.path(SIL, TORSO) +
    k.sym(BLUE, 'M -72 160 L -36 190 Q -30 230 -12 262 L -66 262 Z') +
    k.sym(RED, 'M -84 118 L -80 150 L -72 160 L -36 190 Q -44 220 -40 236 L -14 262 L -66 262 L -84 118 Z') +
    k.path(SIL2, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 76 150 Q 40 172 0 178 Q -40 172 -76 150 Z') +
    k.symLine('M -36 96 L -32 170 M -60 96 L -58 160') +
    k.path(GOLD, 'M -18 120 L 18 120 L 22 160 L -22 160 Z') + timer(k, 140, 18);
  const dyna = `
    ${town('#d0ebff', '#ffc9c9')}
    ${ultra({ ...P(400, 186), A: { c: RED, up: BLUE, hand: SIL }, L: { c: RED, boot: BLUE }, legs: STAND,
      arms: [[[-78, 120], [-150, 70], [-140, -30]], HIP_R], torso: torsoDyna, head: headDyna,
      extra: k => k.circ(-140, -30, 28, SIL) })}
    ${ground(560)}
    ${star(690, 100, 30, '#ffe066', 14)} ${sparkle(110, 330, 16, '#74c0fc')} ${sparkle(690, 330, 14, '#ff8fab')}`;

  // ================= 9. 蓋亞 =================
  // 頭頂高高的鰭狀頭冠（有溝紋）；紅 + 銀 + 黑；胸口橫長形的「生命計量」發著光，周圍金色護甲
  const headGaia = k =>
    ears(k, SIL2) + k.path(SIL, HEAD) +
    k.path(SIL2, 'M -26 -36 Q -38 -100 -24 -138 Q 0 -150 24 -138 Q 38 -100 26 -36 Q 0 -24 -26 -36 Z') +
    k.symLine('M -12 -40 Q -18 -100 -10 -136') +
    k.symLine('M -36 -70 Q -60 -60 -74 -36') +
    eyes(k, 'sharp') + mouth(k);
  const torsoGaia = k =>
    k.path(RED, TORSO) +
    k.path(SIL, 'M -40 180 L 40 180 Q 34 230 0 252 Q -34 230 -40 180 Z') +
    k.sym(DARK, 'M -84 118 Q -86 94 -56 92 L -40 92 L -66 196 L -76 186 Z') +
    k.path(GOLD, 'M -60 92 L 60 92 Q 76 130 60 166 Q 30 182 0 184 Q -30 182 -60 166 Q -76 130 -60 92 Z') +
    k.symLine('M -40 96 Q -54 130 -44 170') +
    k.path(TIMER, 'M -34 136 Q 0 118 34 136 Q 0 154 -34 136 Z');
  const gaia = `
    <path d="M400 222 L400 246 M346 248 L330 262 M454 248 L470 262"/>
    ${minihouse(40, 110, 140, '#ffe8cc')}
    ${ultra({ ...P(400, 188), A: { c: RED, band: SIL, hand: SIL }, L: { c: RED, boot: SIL }, legs: WIDE,
      arms: [{ j: [[-78, 120], [-150, 150], [-178, 230]], A: { c: RED, band: DARK, hand: SIL } },
        { j: [[78, 120], [150, 150], [178, 230]], A: { c: RED, band: DARK, hand: SIL } }],
      torso: torsoGaia, head: headGaia })}
    ${ground(560)}
    ${sparkle(690, 110, 22)} ${sparkle(110, 70, 16, '#ff8fab')} ${sparkle(690, 360, 14, '#74c0fc')}`;

  // ================= 10. 雷傑多 =================
  // 傳說中的巨人：銀白身體 + 金色與藍色花紋，大大的頭冠和肩甲，身後一圈宇宙光芒
  const headLegend = k =>
    k.sym(GOLD, 'M -30 -80 Q -70 -112 -78 -158 Q -46 -140 -20 -102 Z') +
    ears(k, GOLD) + k.path(SIL, HEAD) +
    k.path(BLUE, 'M -28 -36 Q -40 -110 -26 -150 Q 0 -168 26 -150 Q 40 -110 28 -36 Q 0 -24 -28 -36 Z') +
    k.path(GOLD, 'M -10 -40 Q -14 -110 -8 -150 Q 0 -158 8 -150 Q 14 -110 10 -40 Z') +
    k.path('#fff', 'M 0 -62 L 9 -52 L 0 -42 L -9 -52 Z') +
    eyes(k, 'big', '#a5d8ff') + mouth(k);
  const torsoLegend = k =>
    k.path(SIL, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 66 280 L -66 280 Z') +
    k.sym(BLUE, 'M -80 150 Q -40 190 -26 280 L -66 280 Z') +
    k.path(GOLD, 'M -84 118 Q -86 94 -56 92 L 56 92 Q 86 94 84 118 L 74 156 Q 40 180 0 200 Q -40 180 -74 156 Z') +
    k.symLine('M -30 98 Q -36 150 -50 172 M -56 96 Q -62 130 -72 152') +
    k.path(BLUE, 'M 0 116 L 26 142 L 0 168 L -26 142 Z') +
    k.path(GOLD, 'M -40 218 L 40 218 L 0 262 Z');
  const LA = { c: SIL, up: SIL, band: BLUE, hand: SIL, pad: GOLD };
  const legend = `
    <circle cx="400" cy="300" r="250" fill="#fff9db"/><circle cx="400" cy="300" r="175" fill="#e7f5ff"/>
    ${ultra({ ...P(400, 196, .8), hs: .9, hy: 10, A: LA, L: { c: SIL, boot: BLUE },
      legs: [[[-36, 268], [-48, 360], [-58, 440]], [[36, 268], [48, 360], [58, 440]]],
      arms: [{ j: [[-80, 122], [-170, 90], [-230, 20]], A: { ...LA, open: true } }, { j: [[80, 122], [170, 90], [230, 20]], A: { ...LA, open: true } }],
      torso: torsoLegend, head: headLegend })}
    ${sparkle(90, 100, 18)} ${sparkle(710, 100, 18)} ${sparkle(80, 430, 16, '#74c0fc')} ${sparkle(720, 430, 16, '#74c0fc')}
    <circle cx="120" cy="250" r="30" fill="#b197fc"/><circle cx="690" cy="250" r="24" fill="#ffa94d"/>`;

  // ================= 11. 光線發射（斯派修姆光線） =================
  const pose = `
    <path fill="#fff3bf" d="M420 190 L790 120 L790 330 L420 250 Z"/>
    <path fill="#a5d8ff" d="M420 208 L790 190 L790 262 L420 232 Z"/>
    ${ultra({ ...P(300, 186), ...UM, legs: [[[-34, 250], [-60, 320], [-80, 392]], [[34, 250], [54, 320], [70, 392]]],
      arms: [[[78, 120], [126, 236], [126, 84]], [[-78, 120], [10, 196], [170, 184]]],
      torso: torsoUltraman, head: k => headUltraman(k) })}
    ${ground(560)}
    <path d="M560 120 L590 90 M560 360 L590 390 M640 120 L655 92 M640 370 L660 396"/>
    ${sparkle(90, 100, 20)} ${sparkle(700, 450, 18)} ${sparkle(560, 80, 14, '#74c0fc')}`;

  // ================= 12. 彩色計時器 =================
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
    return `<path d="M${f1(400 + 210 * c)} ${f1(300 + 210 * s)} L${f1(400 + 250 * c)} ${f1(300 + 250 * s)}"/>`;
  }).join('');
  const colortimer = `
    <path fill="${RED}" d="M40 600 L40 470 Q140 380 230 330 L570 330 Q660 380 760 470 L760 600 Z"/>
    ${rays}
    <circle cx="400" cy="300" r="190" fill="${SIL2}"/>
    <circle cx="400" cy="300" r="150" fill="${SIL}"/>
    <circle cx="400" cy="300" r="112" fill="${TIMER}"/>
    <circle cx="400" cy="300" r="62" fill="#a5d8ff"/>
    <path fill="#fff" d="M330 240 Q360 205 410 202 Q380 222 352 262 Z"/>
    <path d="M400 110 L400 150 M400 450 L400 490 M210 300 L250 300 M550 300 L590 300"/>
    ${sparkle(110, 100, 24)} ${sparkle(690, 100, 24, '#74c0fc')} ${sparkle(130, 330, 14, '#ff8fab')} ${sparkle(670, 330, 14)}`;

  window.ART.addPack({
    categories: [
      { id: 'ultra', name: '超人力霸王', icon: '🌟', color: '#e03131', dark: '#a51111', en: 'Ultraman' },
    ],
    drawings: [
      { id: 'ul-ultraman', cat: 'ultra', name: '初代超人力霸王', en: 'Ultraman', svg: ultraman },
      { id: 'ul-seven', cat: 'ultra', name: '賽文', en: 'Ultraseven', svg: seven },
      { id: 'ul-jack', cat: 'ultra', name: '傑克', en: 'Ultraman Jack', svg: jack },
      { id: 'ul-ace', cat: 'ultra', name: '艾斯', en: 'Ultraman Ace', svg: ace },
      { id: 'ul-taro', cat: 'ultra', name: '泰羅', en: 'Ultraman Taro', svg: taro },
      { id: 'ul-leo', cat: 'ultra', name: '雷歐', en: 'Ultraman Leo', svg: leo },
      { id: 'ul-tiga', cat: 'ultra', name: '迪卡', en: 'Ultraman Tiga', svg: tiga },
      { id: 'ul-dyna', cat: 'ultra', name: '帝納', en: 'Ultraman Dyna', svg: dyna },
      { id: 'ul-gaia', cat: 'ultra', name: '蓋亞', en: 'Ultraman Gaia', svg: gaia },
      { id: 'ul-legend', cat: 'ultra', name: '雷傑多', en: 'Ultraman Legend', svg: legend },
      { id: 'ul-pose', cat: 'ultra', name: '光線發射', en: 'Specium Ray', svg: pose },
      { id: 'ul-timer', cat: 'ultra', name: '彩色計時器', en: 'Color Timer', svg: colortimer },
    ],
  });
})();
