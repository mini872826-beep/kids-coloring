/* 線稿包：超人力霸王（Q 版）— 新世代英雄、貝利亞、經典怪獸、光之國
 * 角色都用「大頭 Q 版」：頭約佔全身 45%，每個角色保留最好認的特徵
 * （頭鏢、頭冠、眼睛形狀、胸前護甲、彩色計時器）。
 * 座標：每個角色用自己的「身體座標」畫（頭的中心 = 0,0），K() 負責縮放擺位。 */
(function () {
  const { eye, ground, sparkle } = window.ART.helpers;
  const f1 = v => String(Math.round(v * 10) / 10);

  /* ---------------- 小工具 ---------------- */
  const starD = (cx, cy, R, r = R * .48, n = 5, a0 = -Math.PI / 2) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = a0 + i * Math.PI / n, rr = i % 2 ? r : R;
      d += (i ? ' L' : 'M') + f1(cx + rr * Math.cos(a)) + ' ' + f1(cy + rr * Math.sin(a));
    }
    return d + ' Z';
  };
  const star = (cx, cy, R, c, r, n) => `<path fill="${c}" d="${starD(cx, cy, R, r, n)}"/>`;
  // 圓頭膠囊（手腳）
  const cap = (x1, y1, x2, y2, w, c) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, h = w / 2, nx = -(y2 - y1) / L * h, ny = (x2 - x1) / L * h;
    const p = (x, y) => `${f1(x)} ${f1(y)}`;
    return `<path fill="${c}" d="M${p(x1 + nx, y1 + ny)} L${p(x2 + nx, y2 + ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x2 - nx, y2 - ny)} L${p(x1 - nx, y1 - ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x1 + nx, y1 + ny)} Z"/>`;
  };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // 左右翻轉（身體座標 x → -x）；路徑只用 M/L/Q/C/Z 和「x y」數對
  const mirD = d => d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${-x} ${y}`);
  const rot = (a, x, y, s) => `<g transform="rotate(${a} ${x} ${y})">${s}</g>`;

  function K(ox, oy, s) {
    const X = x => ox + x * s, Y = y => oy + y * s;
    const mp = d => d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (m, x, y) => f1(X(+x)) + ' ' + f1(Y(+y)));
    const k = {
      X, Y, s,
      p: (c, d) => `<path fill="${c}" d="${mp(d)}"/>`,
      sym: (c, d) => k.p(c, d) + k.p(c, mirD(d)),
      l: d => `<path d="${mp(d)}"/>`,
      symL: d => k.l(d) + k.l(mirD(d)),
      circ: (x, y, r, c) => `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="${f1(r * s)}" fill="${c}"/>`,
      ell: (x, y, rx, ry, c, r = 0) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="${c}"${r ? ` transform="rotate(${f1(r)} ${f1(X(x))} ${f1(Y(y))})"` : ''}/>`,
      star: (x, y, R, c, r, n) => star(X(x), Y(y), R * s, c, (r || R * .48) * s, n),
      cap: (a, b, w, c) => cap(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), w * s, c),
      eye: (x, y, r) => eye(X(x), Y(y), r * s),
      shine: (x, y, r) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(r * s)}" ry="${f1(r * .6 * s)}" fill="#fff" stroke="none" transform="rotate(-30 ${f1(X(x))} ${f1(Y(y))})"/>`,
    };
    return k;
  }

  /* ---------------- 顏色 ---------------- */
  const SIL = '#dee2e6', RED = '#ff6b6b', BLUE = '#4dabf7', DBLUE = '#4263eb', YEL = '#ffe066',
    TIM = '#74c0fc', GOLD = '#fcc419', PUR = '#9775fa', GRN = '#69db7c', DARK = '#495057', BLK = '#343a40';

  /* ---------------- Q 版超人的共用身體 ---------------- */
  const HEAD = 'M 0 -92 C 52 -92 84 -50 82 -4 C 80 48 46 90 0 92 C -46 90 -80 48 -82 -4 C -84 -50 -52 -92 0 -92 Z';
  const FACE = 'M 0 -62 C 36 -62 64 -38 66 0 C 66 44 38 80 0 82 C -38 80 -66 44 -66 0 C -64 -38 -36 -62 0 -62 Z';
  // 頭盔上半部（有顏色的部分），下面露出銀色的臉
  const HTOP = 'M -82 -4 C -84 -50 -52 -92 0 -92 C 52 -92 84 -50 82 -4 Q 74 -10 68 -24 Q 58 -58 0 -64 Q -58 -58 -68 -24 Q -74 -10 -82 -4 Z';
  const TORSO = 'M -62 100 Q -64 82 -44 82 L 44 82 Q 64 82 62 100 L 50 205 Q 0 222 -50 205 Z';
  // 胸前護甲（賽文、傑洛那種有直條紋的）
  const PROT = 'M -62 100 Q -64 82 -44 82 L 44 82 Q 64 82 62 100 L 60 118 Q 34 150 0 152 Q -34 150 -60 118 Z';
  const mouth = k => k.l('M -14 56 Q 0 66 14 56');

  // 手：a 肩 → b 肘 → c 手；o.hand = 'fist' | 'point' | 'chop' | 'none'
  function arm(k, C, [a, b, c], o = {}) {
    let s = k.cap(a, b, 38, C.arm) + k.cap(b, c, 36, C.arm2 || C.arm);
    if (o.cuff) s += k.cap(lerp(b, c, .55), lerp(b, c, .92), 42, o.cuff);
    const ang = Math.atan2(c[1] - b[1], c[0] - b[0]), ux = Math.cos(ang), uy = Math.sin(ang);
    if (o.hand === 'point') s += k.cap(c, [c[0] + ux * 44, c[1] + uy * 44], 20, C.hand);
    if (o.hand === 'chop') return s + k.ell(c[0] + ux * 16, c[1] + uy * 16, 34, 20, C.hand, ang * 180 / Math.PI);
    if (o.hand !== 'none') s += k.circ(c[0], c[1], 23, C.hand);
    return s;
  }
  // 腳：a 胯 → b 膝 → c 腳踝
  function leg(k, C, [a, b, c]) {
    const dir = c[0] >= 0 ? 1 : -1;
    return k.cap(a, b, 46, C.leg) + k.cap(b, c, 44, C.leg) +
      k.cap(lerp(b, c, .45), c, 48, C.boot || C.leg) + k.ell(c[0] + dir * 10, c[1] + 12, 32, 18, C.boot || C.leg);
  }
  const STAND = [[[-26, 200], [-34, 250], [-40, 296]], [[26, 200], [34, 250], [40, 296]]];
  const WIDE = [[[-26, 200], [-58, 248], [-78, 294]], [[26, 200], [56, 248], [74, 294]]];

  /* ---------------- 各角色的頭 ---------------- */
  // 傑洛頭鏢（左邊那把，身體座標）
  const SLUG_L = 'M -2 -86 L -24 -130 L -80 -160 L -68 -116 L -58 -70 Z';
  // 傑洛：兩把頭鏢、藍頭、銀臉、尖尖的黃眼睛、額頭光束燈
  function zeroHead(k, o = {}) {
    const sl = o.noSlug ? '' : k.p(SIL, SLUG_L) + k.p(SIL, mirD(SLUG_L)) +
      k.l('M -22 -104 L -34 -128 L -60 -144') + k.l('M 22 -104 L 34 -128 L 60 -144');
    return sl + k.p(SIL, HEAD) + k.p(BLUE, HTOP) +
      k.p(RED, 'M -26 -88 Q 0 -96 26 -88 L 20 -62 Q 0 -66 -20 -62 Z') +
      (o.noSlug ? k.p(DARK, 'M -46 -76 L -14 -84 L -16 -72 L -42 -66 Z') + k.p(DARK, mirD('M -46 -76 L -14 -84 L -16 -72 L -42 -66 Z')) : '') +
      
      k.sym(YEL, 'M -8 4 C -10 -16 -30 -34 -64 -42 C -70 -22 -66 -4 -54 8 C -40 16 -20 14 -8 4 Z') +
      k.shine(-46, -14, 7) + k.shine(46, -14, 7) +
      k.ell(0, -40, 13, 10, GRN) + mouth(k);
  }
  // 初代超人力霸王：全銀頭、中間一條頭冠、雞蛋形眼睛、耳朵
  function ultramanHead(k) {
    return k.ell(-80, 6, 13, 24, SIL) + k.ell(80, 6, 13, 24, SIL) + k.p(SIL, HEAD) +
      k.p(SIL, 'M -15 -50 Q -18 -92 0 -106 Q 18 -92 15 -50 Q 0 -44 -15 -50 Z') +
      k.ell(-34, -4, 26, 19, YEL, 18) + k.ell(34, -4, 26, 19, YEL, -18) +
      k.shine(-40, -10, 6) + k.shine(28, -10, 6) + mouth(k);
  }
  // 超人力霸王七號：紅頭、銀臉、頭上一把頭鏢、綠色光束燈
  function sevenHead(k) {
    return k.p(SIL, 'M -40 -80 Q -24 -126 0 -138 Q 24 -126 40 -80 Q 0 -96 -40 -80 Z') +
      k.l('M -16 -98 Q 0 -122 16 -98') +
      k.p(SIL, HEAD) + k.p(RED, HTOP) +
      k.sym(YEL, 'M -8 2 C -12 -18 -30 -30 -58 -32 C -66 -14 -60 4 -46 10 C -32 14 -16 12 -8 2 Z') +
      k.shine(-42, -12, 6) + k.shine(42, -12, 6) +
      k.ell(0, -42, 14, 11, GRN) + mouth(k);
  }

  /* ================= 1. 傑洛 ================= */
  function zeroFig(k, o = {}) {
    const C = { arm: RED, arm2: BLUE, hand: SIL, leg: BLUE, boot: RED };
    const armL = o.armL || [[-56, 100], [-104, 66], [-128, 14]];
    const armR = o.armR || [[56, 100], [100, 140], [76, 178]];
    return (o.legs || WIDE).map(l => leg(k, C, l)).join('') +
      k.p(BLUE, TORSO) +
      k.sym(RED, 'M -61 108 Q -22 140 -30 216 Q -42 212 -50 205 Z') +
      k.p(SIL, PROT) +
      [-44, -28, 28, 44].map(x => k.l(`M ${x} 92 L ${x} ${x < 0 ? 118 + (x + 44) * .4 : 118 + (44 - x) * .4}`)).join('') +
      k.circ(0, 122, 17, TIM) + k.shine(-6, 116, 5) +
      k.p(SIL, 'M -40 176 L 40 176 L 38 194 L -38 194 Z') +
      zeroHead(k, o) +
      arm(k, C, armL, { hand: o.handL || 'point' }) +
      arm(k, C, armR, { hand: o.handR || 'fist', cuff: SIL }) +
      // 傑洛手環（在左手手腕）
      (() => { const [b, c] = [armR[1], armR[2]], m = lerp(b, c, .74); return k.circ(m[0], m[1], 10, TIM); })();
  }
  const zero = `
    ${star(130, 120, 46, '#ffe066', 22)} ${star(680, 140, 34, '#ffd8a8', 16)}
    <path d="M610 300 L700 280 M620 350 L720 350 M610 400 L700 420"/>
    ${zeroFig(K(410, 212, 1.12))}
    ${ground(560)}
    ${sparkle(120, 420, 18, '#74c0fc')} ${sparkle(700, 500, 16)} ${sparkle(240, 60, 14, '#ff8fab')}`;

  /* ================= 2. 傑洛頭鏢 ================= */
  // 一把飛出去的頭鏢（中心在 0,0）
  const blade = (x, y, s, a) => {
    const k = K(x, y, s);
    return rot(a, x, y, k.p(SIL, 'M 26 56 C 24 6 4 -28 -30 -54 C -26 -20 -22 20 -16 66 Q 4 72 26 56 Z') +
      k.l('M 10 40 Q 6 6 -12 -22'));
  };
  const zslug = `
    <path d="M470 110 Q600 40 740 120 M490 130 Q600 70 720 140"/>
    <path d="M500 260 Q600 330 720 270 M520 300 Q600 350 690 320"/>
    ${blade(610, 140, 1.3, 35)} ${blade(705, 285, 1.3, 110)}
    ${zeroFig(K(270, 222, 1.08), { noSlug: true, legs: WIDE,
      armL: [[-56, 100], [-100, 140], [-80, 180]], handL: 'fist',
      armR: [[56, 100], [110, 70], [160, 30]], handR: 'chop' })}
    ${ground(560)}
    ${sparkle(470, 450, 18, '#74c0fc')} ${sparkle(700, 470, 16)} ${sparkle(110, 80, 16)}`;

  /* ================= 3. 歐布（歐布原生型態） ================= */
  function orbFig(k) {
    const C = { arm: RED, arm2: SIL, hand: SIL, leg: RED, boot: SIL };
    // 劍：歐布聖劍（劍身 + 有四元素輪的劍柄）
    const sword = k.p(SIL, 'M 118 92 L 150 -120 Q 160 -150 172 -118 L 150 98 Z') +
      k.l('M 158 -100 L 142 70') +
      k.circ(132, 128, 36, GOLD) + k.circ(132, 128, 17, '#ff8787') +
      k.cap([132, 160], [128, 214], 26, '#a9e34b');
    return STAND.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      k.sym(BLK, 'M -60 112 Q -40 150 -44 206 L -50 205 Q -56 160 -60 112 Z') +
      k.sym(SIL, 'M -44 82 L -6 82 L -14 96 Q -30 120 -60 116 L -62 100 Q -64 82 -44 82 Z') +
      // 歐布的圓形護甲 + 圓形計時器
      k.circ(0, 132, 38, SIL) + k.circ(0, 132, 20, TIM) + k.shine(-7, 126, 5) +
      k.symL('M -36 108 L -28 114') +
      k.p(SIL, 'M -42 184 L 42 184 L 40 202 L -40 202 Z') +
      sword +
      // 頭：環形頭冠（歐布的 O）
      k.circ(0, -104, 54, SIL) + k.circ(0, -108, 30, '#fff') + k.symL('M -40 -140 L -48 -148') +
      k.p(SIL, HEAD) + k.p(RED, HTOP) +
      k.p(SIL, 'M -12 -60 Q -14 -84 0 -94 Q 14 -84 12 -60 Q 0 -54 -12 -60 Z') +
      k.p(BLK, 'M -8 -38 Q 0 -42 8 -38 L 5 -22 Q 0 -19 -5 -22 Z') +
      k.sym(YEL, 'M -12 0 C -14 -20 -30 -30 -54 -28 C -64 -12 -58 8 -44 14 C -30 18 -16 14 -12 0 Z') +
      k.shine(-40, -10, 6) + k.shine(40, -10, 6) + mouth(k) +
      arm(k, C, [[-56, 100], [-98, 140], [-84, 182]]) +
      arm(k, C, [[56, 100], [104, 150], [130, 184]]);
  }
  const orb = `
    <circle cx="140" cy="130" r="60" fill="#ffe066"/>
    ${orbFig(K(385, 222, 1.12))}
    ${ground(560)}
    ${sparkle(660, 470, 18, '#74c0fc')} ${sparkle(110, 440, 16)} ${sparkle(700, 80, 14, '#ff8fab')}`;

  /* ================= 4. 捷德（原始型態） ================= */
  function geedFig(k) {
    const C = { arm: RED, arm2: BLK, hand: SIL, leg: BLK, boot: RED };
    return WIDE.map(l => leg(k, C, l)).join('') +
      k.p(BLK, TORSO) +
      k.sym(RED, 'M -62 100 Q -64 82 -44 82 L -8 82 Q -14 120 -40 150 Q -54 150 -59 132 Z') +
      k.sym(SIL, 'M -40 160 Q -14 150 -6 120 L 6 120 Q 14 150 40 160 L 36 196 Q 0 206 -36 196 Z') +
      // 藍色光紋 + 尖尖的藍色計時器
      k.symL('M -50 112 Q -40 128 -26 126') + k.symL('M -28 176 L -12 168') +
      k.p(TIM, 'M 0 92 L 24 112 L 14 140 L -14 140 L -24 112 Z') + k.shine(-6, 108, 5) +
      // 頭：紅頭、黑條紋、中間銀色頭冠、捷德招牌的尖眼睛
      k.p(SIL, 'M -16 -70 Q -16 -106 0 -112 Q 16 -106 16 -70 Z') +
      k.p(SIL, HEAD) + k.p(RED, HTOP) +
      k.sym(BLK, 'M -24 -86 Q -56 -80 -74 -46 Q -60 -48 -46 -60 Q -36 -74 -24 -86 Z') +
      k.p(SIL, 'M -14 -86 Q 0 -92 14 -86 L 10 -60 L -10 -60 Z') +
      k.sym('#a5d8ff', 'M -8 6 L -14 -18 L -36 -36 L -68 -44 L -64 -16 L -48 6 L -26 16 Z') +
      k.shine(-46, -18, 6) + k.shine(46, -18, 6) +
      k.l('M -14 54 Q 0 64 14 54') +
      arm(k, C, [[-56, 100], [-104, 136], [-128, 176]], { hand: 'fist' }) +
      arm(k, C, [[56, 100], [108, 136], [130, 178]], { hand: 'fist' });
  }
  const geed = `
    <path fill="#d0ebff" d="M90 140 L130 60 L170 140 L130 120 Z"/><path fill="#d0ebff" d="M630 140 L670 60 L710 140 L670 120 Z"/>
    ${geedFig(K(400, 222, 1.12))}
    ${ground(560)}
    ${sparkle(120, 440, 18, '#74c0fc')} ${sparkle(690, 440, 18)}`;

  /* ================= 5. 捷特（阿爾法利刃） ================= */
  function zFig(k) {
    const C = { arm: BLUE, arm2: RED, hand: SIL, leg: RED, boot: BLUE };
    return WIDE.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      k.sym(BLUE, 'M -61 108 Q -24 136 -28 216 Q -42 212 -50 205 Z') +
      k.p(SIL, PROT) +
      [-44, 44].map(x => k.l(`M ${x} 94 L ${x} 116`)).join('') +
      // Z 字形的彩色計時器
      k.p(TIM, 'M -26 104 L 26 104 L 26 116 L -4 134 L 26 134 L 26 146 L -26 146 L -26 134 L 4 116 L -26 116 Z') +
      k.p(SIL, 'M -40 180 L 40 180 L 38 198 L -38 198 Z') +
      // 頭：艾斯那種高頭冠 + 4 個洞（奧特之孔），傑洛弟子的尖眼睛
      k.p(SIL, 'M -24 -72 Q -30 -140 0 -170 Q 30 -140 24 -72 Z') +
      [-150, -128, -106].map(y => k.ell(0, y, 7, 7, '#fff')).join('') +
      k.p(SIL, HEAD) + k.p(BLUE, HTOP) +
      k.sym(RED, 'M -30 -84 Q -60 -74 -76 -44 Q -60 -46 -50 -58 Q -40 -72 -30 -84 Z') +
      
      k.p(SIL, 'M -18 -86 Q 0 -92 18 -86 L 12 -60 L -12 -60 Z') + k.ell(0, -76, 6, 6, '#fff') +
      k.sym(YEL, 'M -8 4 C -10 -16 -30 -32 -62 -40 C -68 -20 -64 -2 -52 8 C -38 16 -20 14 -8 4 Z') +
      k.shine(-46, -14, 6) + k.shine(46, -14, 6) +
      k.ell(0, -40, 12, 9, TIM) + mouth(k) +
      // 「Z」的姿勢：一隻手舉高橫過、一隻手斜下
      arm(k, C, [[-56, 100], [-110, 70], [-150, 30]], { hand: 'fist' }) +
      arm(k, C, [[56, 100], [112, 110], [150, 150]], { hand: 'fist' });
  }
  const zz = `
    <path fill="#fff3bf" d="M90 470 L250 470 L130 540 L250 540 L250 560 L80 560 L200 490 L90 490 Z"/>
    ${zFig(K(400, 222, 1.12))}
    ${ground(560)}
    ${sparkle(110, 120, 20)} ${sparkle(700, 110, 18, '#74c0fc')} ${sparkle(680, 440, 16, '#ff8fab')}`;

  /* ================= 6. 特利卡（複合型） ================= */
  function triggerFig(k) {
    const C = { arm: RED, arm2: PUR, hand: SIL, leg: PUR, boot: RED };
    // 圓環武器（圓圈臂 Circle Arms）
    const arms = k.circ(-150, 80, 56, GOLD) + k.circ(-150, 80, 30, '#fff') +
      k.p(SIL, 'M -196 46 Q -230 6 -214 -40 Q -186 2 -168 30 Z');
    return arms + STAND.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      k.p(PUR, 'M 4 82 L 44 82 Q 64 82 62 100 L 50 205 Q 26 214 4 216 Z') +
      // 迪迦風格的護甲：金銀 V 字
      k.p(SIL, 'M -62 100 Q -64 82 -44 82 L 44 82 Q 64 82 62 100 L 60 112 Q 30 150 0 154 Q -30 150 -60 112 Z') +
      k.p(GOLD, 'M -40 86 L 40 86 Q 22 112 0 116 Q -22 112 -40 86 Z') +
      k.circ(0, 132, 16, TIM) + k.shine(-6, 126, 5) +
      k.p(SIL, 'M -40 182 L 40 182 L 38 200 L -38 200 Z') +
      // 頭：迪迦式頭冠 + 兩側小鰭 + 額頭水晶
      k.sym(SIL, 'M -78 -26 Q -100 -40 -104 -66 Q -86 -62 -68 -56 Z') +
      k.p(SIL, 'M -16 -70 Q -20 -108 0 -122 Q 20 -108 16 -70 Z') +
      k.p(SIL, HEAD) +
      k.p(RED, 'M -82 -4 C -84 -50 -52 -92 0 -92 L 0 -64 Q -58 -58 -68 -24 Q -74 -10 -82 -4 Z') +
      k.p(PUR, 'M 82 -4 C 84 -50 52 -92 0 -92 L 0 -64 Q 58 -58 68 -24 Q 74 -10 82 -4 Z') +
      k.p(SIL, 'M -14 -88 Q 0 -94 14 -88 L 10 -60 L -10 -60 Z') +
      k.p(TIM, 'M 0 -54 L 12 -42 L 0 -30 L -12 -42 Z') +
      k.ell(-33, -2, 26, 19, YEL, 16) + k.ell(33, -2, 26, 19, YEL, -16) +
      k.shine(-40, -8, 6) + k.shine(26, -8, 6) + mouth(k) +
      arm(k, C, [[-56, 100], [-104, 104], [-150, 80]], { cuff: GOLD }) +
      arm(k, C, [[56, 100], [100, 140], [80, 182]], { cuff: GOLD });
  }
  const trigger = `
    ${star(650, 120, 50, '#ffe066', 24)}
    ${triggerFig(K(440, 222, 1.1))}
    ${ground(560)}
    ${sparkle(700, 420, 18, '#b197fc')} ${sparkle(110, 470, 16)} ${sparkle(560, 60, 14, '#74c0fc')}`;

  /* ================= 7. 德卡（閃亮型） ================= */
  function deckerFig(k) {
    const C = { arm: RED, arm2: BLUE, hand: SIL, leg: BLUE, boot: RED };
    return WIDE.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      k.sym(BLUE, 'M -61 108 Q -26 140 -30 216 Q -42 212 -50 205 Z') +
      // 不對稱的金色護甲（從右胸一路到左肩），計時器在左胸
      k.p(SIL, 'M -44 82 L 44 82 Q 64 82 62 100 L 58 132 Q 30 150 4 148 Q -24 126 -50 92 Z') +
      k.p(GOLD, 'M -30 86 L 8 86 Q 0 110 -14 118 Q -26 104 -30 86 Z') +
      k.circ(32, 116, 17, TIM) + k.shine(26, 110, 5) +
      k.star(-24, 160, 20, YEL, 9) +
      k.p(SIL, 'M -40 182 L 40 182 L 38 200 L -38 200 Z') +
      // 頭：大大的扇形頭冠 + 額頭德卡水晶（星雲圖案）
      k.p(SIL, 'M -30 -72 Q -40 -130 0 -150 Q 40 -130 30 -72 Z') +
      k.l('M 0 -140 L 0 -96') +
      k.p(SIL, HEAD) + k.p(BLUE, HTOP) +
      k.sym(RED, 'M -30 -84 Q -62 -74 -78 -40 Q -62 -42 -50 -56 Q -42 -72 -30 -84 Z') +
      
      k.p(TIM, 'M 0 -78 L 16 -60 L 10 -40 L -10 -40 L -16 -60 Z') + k.star(0, -58, 9, YEL, 4) +
      k.sym(YEL, 'M -10 2 C -12 -18 -30 -28 -56 -28 C -66 -10 -60 8 -46 14 C -32 18 -16 14 -10 2 Z') +
      k.shine(-42, -10, 6) + k.shine(42, -10, 6) + mouth(k) +
      // 左手有護甲（卡片），比 YA！
      arm(k, C, [[-56, 100], [-104, 136], [-90, 180]], { hand: 'fist' }) +
      arm(k, C, [[56, 100], [104, 64], [130, 14]], { hand: 'point', cuff: GOLD }) +
      k.p(SIL, 'M 66 84 L 96 72 L 104 102 L 74 114 Z');
  }
  const decker = `
    <rect x="80" y="70" width="90" height="120" rx="12" fill="#fff3bf"/>${star(125, 130, 30, '#ff8787', 14)}
    <rect x="640" y="250" width="90" height="120" rx="12" fill="#d0ebff"/>${star(685, 310, 30, '#ffe066', 14)}
    ${deckerFig(K(400, 222, 1.12))}
    ${ground(560)}
    ${sparkle(110, 440, 18, '#74c0fc')} ${sparkle(690, 470, 16)} ${sparkle(640, 80, 18, '#ff8fab')}`;

  /* ================= 8. 布雷薩 ================= */
  function blazarFig(k) {
    const C = { arm: SIL, arm2: BLUE, hand: SIL, leg: SIL, boot: BLUE };
    // 布雷薩長槍（鋸齒槍頭）
    const lance = k.cap([150, 250], [150, -110], 22, GOLD) +
      k.p(TIM, 'M 150 -200 L 176 -130 L 164 -126 L 172 -100 L 150 -88 L 128 -100 L 136 -126 L 124 -130 Z');
    return lance + STAND.map(l => leg(k, C, l)).join('') +
      k.p(SIL, TORSO) +
      // 不對稱：只有左半邊（畫面右邊）有紅藍血管紋
      k.p(RED, 'M 2 82 L 44 82 Q 64 82 62 100 L 56 150 Q 30 140 20 120 Q 8 100 2 82 Z') +
      k.p(BLUE, 'M 56 150 Q 30 140 20 120 Q 14 150 24 180 Q 40 200 50 205 Z') +
      k.p(BLUE, 'M -62 100 Q -64 82 -44 82 L -30 82 Q -40 110 -60 118 Z') +
      k.circ(-14, 130, 17, TIM) + k.shine(-20, 124, 5) +
      k.p(DARK, 'M -40 182 L 40 182 L 38 200 L -38 200 Z') +
      // 頭：只有一邊的大頭冠（布雷薩最好認！）
      k.p(RED, 'M 10 -70 Q 30 -150 90 -186 Q 70 -130 80 -60 Z') +
      k.p(BLUE, 'M 36 -88 Q 50 -134 78 -156 Q 66 -120 70 -80 Z') +
      k.p(SIL, HEAD) +
      k.p(RED, 'M 4 -92 C 52 -92 84 -50 82 -4 Q 66 -28 40 -40 Q 16 -50 4 -92 Z') +
      k.p(BLUE, 'M -20 -88 Q -50 -78 -66 -48 Q -44 -54 -20 -88 Z') +
      // 眼睛有藍色火焰框
      k.p(TIM, 'M -6 8 C -12 -22 -34 -40 -72 -42 C -74 -16 -64 10 -44 20 C -26 24 -10 20 -6 8 Z') +
      k.p(TIM, 'M 6 8 C 12 -22 34 -40 72 -42 C 74 -16 64 10 44 20 C 26 24 10 20 6 8 Z') +
      k.p(YEL, 'M -12 4 C -16 -16 -32 -28 -58 -30 C -60 -12 -52 6 -38 12 C -26 14 -14 12 -12 4 Z') +
      k.p(YEL, 'M 12 4 C 16 -16 32 -28 58 -30 C 60 -12 52 6 38 12 C 26 14 14 12 12 4 Z') +
      k.shine(-40, -12, 6) + k.shine(40, -12, 6) + mouth(k) +
      arm(k, C, [[-56, 100], [-104, 120], [-122, 168]], { hand: 'fist' }) +
      arm(k, C, [[56, 100], [108, 130], [150, 110]], { hand: 'fist' });
  }
  const blazar = `
    <path fill="#e7f5ff" d="M60 560 L60 420 L120 380 L180 420 L180 560 Z"/>
    ${blazarFig(K(370, 230, 1.08))}
    ${ground(560)}
    ${sparkle(120, 120, 20)} ${sparkle(700, 460, 18, '#74c0fc')} ${sparkle(250, 60, 14, '#ff8fab')}`;

  /* ================= 9. 雅克 ================= */
  function arcFig(k) {
    const C = { arm: RED, arm2: SIL, hand: SIL, leg: RED, boot: SIL };
    return WIDE.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      // 胸口和肩膀一大片黑色
      k.p(BLK, 'M -62 100 Q -64 82 -44 82 L 44 82 Q 64 82 62 100 L 60 120 Q 30 150 0 150 Q -30 150 -60 120 Z') +
      k.sym(SIL, 'M -54 126 Q -30 148 -6 152 L -10 186 Q -36 180 -51 176 Z') +
      k.circ(0, 120, 18, TIM) + k.shine(-6, 114, 5) +
      k.p(SIL, 'M -40 184 L 40 184 L 38 200 L -38 200 Z') +
      // 頭：像迴力鏢一樣的弧形頭冠，中間藍色菱形
      k.p(SIL, 'M -104 -6 L -94 -44 Q -96 -126 0 -130 Q 96 -126 94 -44 L 104 -6 L 78 -26 Q 0 -60 -78 -26 Z') +
      k.p(SIL, 'M -16 -100 Q -18 -136 0 -150 Q 18 -136 16 -100 Z') +
      k.p(SIL, HEAD) + k.p(RED, HTOP) +
      k.p(SIL, 'M -14 -88 Q 0 -94 14 -88 L 10 -60 L -10 -60 Z') +
      k.p(TIM, 'M 0 -60 L 14 -44 L 0 -28 L -14 -44 Z') +
      k.symL('M -20 -44 Q -40 -52 -54 -44') +
      k.ell(-34, -2, 27, 19, YEL, 14) + k.ell(34, -2, 27, 19, YEL, -14) +
      k.shine(-42, -8, 6) + k.shine(26, -8, 6) + mouth(k) +
      arm(k, C, [[-56, 100], [-112, 82], [-150, 40]], { hand: 'fist' }) +
      arm(k, C, [[56, 100], [100, 140], [78, 180]], { hand: 'fist' });
  }
  const arc = `
    <path fill="#ffc9c9" d="M60 560 Q60 160 400 140 Q740 160 740 560 L690 560 Q690 210 400 192 Q110 210 110 560 Z"/>
    <path fill="#fff3bf" d="M110 560 Q110 210 400 192 Q690 210 690 560 L640 560 Q640 260 400 244 Q160 260 160 560 Z"/>
    ${arcFig(K(400, 236, 1.08))}
    ${ground(560)}
    ${sparkle(60, 90, 20)} ${sparkle(740, 90, 20, '#74c0fc')}`;

  /* ================= 10. 貝利亞 ================= */
  function belialFig(k) {
    const C = { arm: BLK, arm2: BLK, hand: BLK, leg: BLK, boot: RED };
    // 大爪子：3 根尖尖的爪
    const claw = (x, y, a) => rot(a, k.X(x), k.Y(y),
      k.circ(x, y, 26, BLK) +
      [-26, 0, 26].map(dx => k.p(SIL, `M ${x + dx - 10} ${y - 18} Q ${x + dx * 1.6} ${y - 80} ${x + dx * 1.3 + 4} ${y - 70} Q ${x + dx + 12} ${y - 40} ${x + dx + 10} ${y - 18} Z`)).join(''));
    return WIDE.map(l => leg(k, C, l)).join('') +
      k.p(BLK, TORSO) +
      // 紅色條紋
      k.sym(RED, 'M -60 112 Q -30 130 -20 170 Q -24 196 -36 210 Q -44 160 -60 112 Z') +
      k.p(RED, 'M -30 86 L 30 86 Q 20 104 0 110 Q -20 104 -30 86 Z') +
      k.circ(0, 136, 17, '#ff8787') +
      // 頭：往後翹的尖角
      k.sym(BLK, 'M -40 -72 Q -80 -110 -120 -128 Q -96 -90 -70 -50 Z') +
      k.sym(RED, 'M -60 -84 Q -84 -104 -100 -112 Q -88 -92 -74 -74 Z') +
      k.p(BLK, HEAD) +
      k.p(RED, 'M -8 -90 Q 0 -94 8 -90 L 8 -40 L -8 -40 Z') +
      k.sym(RED, 'M -30 -80 Q -60 -60 -74 -20 Q -58 -36 -40 -48 Z') +
      // 斜斜往上的紅眼睛（壞壞但可愛）
      k.sym('#ff8787', 'M -8 6 L -12 -12 L -40 -30 L -70 -42 L -66 -14 L -46 8 L -24 16 Z') +
      k.shine(-46, -14, 6) + k.shine(46, -14, 6) +
      k.p(SIL, 'M -26 44 Q 0 66 26 44 Q 0 56 -26 44 Z') +
      k.l('M -24 44 Q 0 70 24 44') + k.p('#fff', 'M -12 50 L -6 60 L 0 52 Z') +
      arm(k, C, [[-56, 100], [-104, 80], [-130, 30]], { hand: 'none' }) + claw(-130, 30, -20) +
      arm(k, C, [[56, 100], [104, 80], [130, 30]], { hand: 'none' }) + claw(130, 30, 20);
  }
  const belial = `
    <path fill="#e5dbff" d="M80 120 Q110 60 160 100 Q200 60 220 130 Q170 160 80 120 Z"/>
    <path fill="#e5dbff" d="M580 130 Q610 70 660 110 Q700 70 720 140 Q670 170 580 130 Z"/>
    ${belialFig(K(400, 232, 1.08))}
    ${ground(560)}
    ${sparkle(110, 440, 18, '#ff8787')} ${sparkle(690, 440, 18, '#b197fc')}`;

  /* ================= 11. 巴爾坦星人 ================= */
  const pincer = (x, y, a, s = 1) => {
    const k = K(x, y, s);
    return rot(a, x, y, k.p('#ced4da', 'M -6 10 Q -70 -40 -50 -130 Q -26 -70 12 -24 Z') +
      k.p('#ced4da', 'M 6 10 Q 70 -40 50 -130 Q 26 -70 -12 -24 Z') + k.circ(0, 4, 32, '#ced4da'));
  };
  const baltan = `
    ${star(400, 70, 30, '#ffe066', 14)}
    ${cap(350, 450, 340, 540, 52, '#748ffc')} ${cap(450, 450, 460, 540, 52, '#748ffc')}
    <ellipse cx="330" cy="548" rx="44" ry="20" fill="#5c7cfa"/><ellipse cx="470" cy="548" rx="44" ry="20" fill="#5c7cfa"/>
    <ellipse cx="400" cy="400" rx="100" ry="100" fill="#748ffc"/>
    <path d="M360 340 L440 340 M350 380 L450 380 M352 420 L448 420"/>
    ${cap(320, 350, 200, 300, 44, '#748ffc')} ${cap(480, 350, 600, 300, 44, '#748ffc')}
    ${pincer(180, 270, -25, 1)} ${pincer(620, 270, 25, 1)}
    <path fill="#91a7ff" d="M372 160 Q330 70 290 60 Q296 130 330 182 Z"/>
    <path fill="#91a7ff" d="M428 160 Q470 70 510 60 Q504 130 470 182 Z"/>
    <ellipse cx="400" cy="230" rx="104" ry="96" fill="#748ffc"/>
    <path fill="#bac8ff" d="M384 140 Q400 132 416 140 L414 300 Q400 306 386 300 Z"/>
    <path fill="#91a7ff" d="M386 300 Q350 300 330 280 L356 262 Q372 286 386 284 Z"/><path fill="#91a7ff" d="M414 300 Q450 300 470 280 L444 262 Q428 286 414 284 Z"/>
    <circle cx="330" cy="210" r="42" fill="#ffe066"/><circle cx="470" cy="210" r="42" fill="#ffe066"/>
    ${eye(336, 214, 16)} ${eye(464, 214, 16)}
    <ellipse cx="350" cy="262" rx="12" ry="7" fill="#ffc9c9"/><ellipse cx="450" cy="262" rx="12" ry="7" fill="#ffc9c9"/>
    ${ground(568)}
    ${sparkle(110, 470, 18)} ${sparkle(690, 470, 18, '#74c0fc')}`;

  /* ================= 12. 哥莫拉 ================= */
  const BR = '#c0814f', BL = '#ffe8cc';
  const gomora = `
    <path fill="${BR}" d="M470 470 Q620 500 700 420 Q740 380 720 340 Q700 420 600 430 Q520 436 470 420 Z"/>
    ${cap(340, 470, 330, 535, 70, BR)} ${cap(460, 470, 470, 535, 70, BR)}
    <ellipse cx="322" cy="545" rx="52" ry="22" fill="${BR}"/><ellipse cx="478" cy="545" rx="52" ry="22" fill="${BR}"/>
    <ellipse cx="400" cy="400" rx="120" ry="115" fill="${BR}"/>
    <ellipse cx="400" cy="420" rx="70" ry="82" fill="${BL}"/>
    <path d="M354 380 L446 380 M342 420 L458 420 M350 460 L450 460"/>
    ${cap(300, 360, 250, 410, 42, BR)} ${cap(500, 360, 550, 410, 42, BR)}
    <circle cx="246" cy="414" r="24" fill="${BR}"/><circle cx="554" cy="414" r="24" fill="${BR}"/>
    <path fill="#fff3bf" d="M312 214 Q200 120 344 46 Q286 110 354 170 Z"/>
    <path fill="#fff3bf" d="M488 214 Q600 120 456 46 Q514 110 446 170 Z"/>
    <ellipse cx="400" cy="230" rx="104" ry="86" fill="${BR}"/>
    <path fill="#fff3bf" d="M376 160 Q388 90 430 70 Q414 110 424 160 Z"/>
    <ellipse cx="400" cy="262" rx="60" ry="36" fill="${BL}"/>
    ${eye(352, 214, 15)} ${eye(448, 214, 15)}
    <path d="M378 270 Q400 290 422 270"/><path fill="#fff" d="M384 274 L390 286 L396 276 Z"/>
    <ellipse cx="324" cy="250" rx="13" ry="8" fill="#ffc9c9"/><ellipse cx="476" cy="250" rx="13" ry="8" fill="#ffc9c9"/>
    <path fill="#fff3bf" d="M330 314 L350 290 L370 314 Z"/><path fill="#fff3bf" d="M430 314 L450 290 L470 314 Z"/>
    ${ground(568)}
    ${sparkle(110, 120, 18)} ${sparkle(110, 460, 16, '#74c0fc')} ${sparkle(700, 120, 18, '#ff8fab')}`;

  /* ================= 13. 傑頓 ================= */
  const ZB = '#495057', ZY = '#ffe066';
  const zetton = `
    ${cap(360, 450, 350, 535, 62, ZB)} ${cap(440, 450, 450, 535, 62, ZB)}
    <ellipse cx="340" cy="546" rx="46" ry="20" fill="${ZB}"/><ellipse cx="460" cy="546" rx="46" ry="20" fill="${ZB}"/>
    <path fill="${ZB}" d="M300 300 Q400 270 500 300 L520 470 Q400 500 280 470 Z"/>
    <path d="M330 410 Q400 425 470 410 M326 450 Q400 466 474 450"/>
    <ellipse cx="350" cy="350" rx="34" ry="28" fill="${ZY}"/><ellipse cx="450" cy="350" rx="34" ry="28" fill="${ZY}"/>
    <path fill="#ced4da" d="M384 330 L416 330 L412 400 L388 400 Z"/>
    ${cap(310, 320, 220, 380, 46, ZB)} ${cap(490, 320, 580, 380, 46, ZB)}
    <path fill="#ced4da" d="M196 352 L228 352 L228 410 L196 410 Z"/><path fill="#ced4da" d="M572 352 L604 352 L604 410 L572 410 Z"/>
    <path fill="${ZB}" d="M330 150 Q300 90 250 60 Q262 130 300 190 Z"/>
    <path fill="${ZB}" d="M470 150 Q500 90 550 60 Q538 130 500 190 Z"/>
    <ellipse cx="400" cy="210" rx="110" ry="90" fill="${ZB}"/>
    <path fill="${ZY}" d="M378 130 Q400 120 422 130 L420 290 Q400 298 380 290 Z"/>
    <path fill="${ZY}" d="M300 196 L356 186 L356 214 L300 222 Z"/><path fill="${ZY}" d="M500 196 L444 186 L444 214 L500 222 Z"/>
    <path fill="${ZY}" d="M318 248 L356 240 L356 266 L326 272 Z"/><path fill="${ZY}" d="M482 248 L444 240 L444 266 L474 272 Z"/>
    <path d="M384 260 Q400 272 416 260"/>
    ${sparkle(110, 120, 20)} ${sparkle(690, 120, 20)} ${sparkle(120, 450, 16, '#74c0fc')} ${sparkle(680, 450, 16, '#ff8fab')}
    ${ground(566)}`;

  /* ================= 14. 雷德王 ================= */
  const RK1 = '#ffd43b', RK2 = '#e8a35a';
  function hband(cx, cy, rx, ry, y1, y2, fill) {
    const xr = y => rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2));
    let d = '';
    for (let y = y1; y <= y2; y += 4) d += `${d ? ' L' : 'M'}${f1(cx + xr(y))} ${y}`;
    for (let y = y2; y >= y1; y -= 4) d += ` L${f1(cx - xr(y))} ${y}`;
    return `<path fill="${fill}" d="${d} Z"/>`;
  }
  let rkBands = '';
  for (let i = 0, y = 250; y < 530; i++, y += 56) rkBands += hband(400, 380, 140, 150, y, Math.min(y + 56, 528), i % 2 ? RK1 : RK2);
  const redking = `
    <path fill="${RK2}" d="M500 470 Q640 520 730 450 Q760 420 740 390 Q700 460 600 450 Q540 444 510 420 Z"/>
    ${cap(340, 480, 330, 540, 80, RK2)} ${cap(460, 480, 470, 540, 80, RK2)}
    <ellipse cx="318" cy="550" rx="58" ry="22" fill="${RK2}"/><ellipse cx="482" cy="550" rx="58" ry="22" fill="${RK2}"/>
    ${cap(400, 260, 400, 140, 58, RK1)}
    <path d="M380 220 L420 220 M380 180 L420 180"/>
    <ellipse cx="400" cy="380" rx="140" ry="150" fill="${RK2}"/>
    ${rkBands}
    ${cap(275, 340, 205, 300, 44, RK2)} ${cap(525, 340, 595, 300, 44, RK2)}
    <path fill="#fff" d="M182 290 L196 270 L204 292 Z"/><path fill="#fff" d="M618 290 L604 270 L596 292 Z"/>
    <circle cx="200" cy="298" r="24" fill="${RK2}"/><circle cx="600" cy="298" r="24" fill="${RK2}"/>
    <path fill="${RK1}" d="M368 112 L378 80 L392 100 L400 72 L408 100 L422 80 L432 112 Z"/>
    <ellipse cx="400" cy="128" rx="40" ry="32" fill="${RK2}"/>
    ${eye(386, 122, 7)} ${eye(414, 122, 7)}
    <path d="M388 142 Q400 150 412 142"/>
    ${ground(572)}
    ${sparkle(120, 120, 20)} ${sparkle(680, 120, 20, '#74c0fc')} ${sparkle(110, 450, 16, '#ff8fab')}`;

  /* ================= 15. 光之國 ================= */
  function ultramanFig(k) {
    const C = { arm: SIL, arm2: RED, hand: SIL, leg: RED, boot: SIL };
    return STAND.map(l => leg(k, C, l)).join('') +
      k.p(SIL, TORSO) +
      k.p(RED, 'M -44 82 L -12 82 Q -16 120 -40 150 Q -50 180 -50 205 L -60 112 Q -62 90 -44 82 Z') +
      k.p(RED, mirD('M -44 82 L -12 82 Q -16 120 -40 150 Q -50 180 -50 205 L -60 112 Q -62 90 -44 82 Z')) +
      k.p(RED, 'M -30 170 Q 0 150 30 170 L 40 203 Q 0 220 -40 203 Z') +
      k.circ(0, 122, 17, TIM) + k.shine(-6, 116, 5) +
      ultramanHead(k) +
      arm(k, C, [[-56, 100], [-90, 140], [-74, 182]]) +
      arm(k, C, [[56, 100], [96, 66], [118, 10]], { hand: 'chop' });
  }
  function sevenFig(k) {
    const C = { arm: RED, arm2: RED, hand: SIL, leg: RED, boot: SIL };
    return STAND.map(l => leg(k, C, l)).join('') +
      k.p(RED, TORSO) +
      k.p(SIL, PROT) +
      [-44, -28, 28, 44].map(x => k.l(`M ${x} 92 L ${x} ${x < 0 ? 118 + (x + 44) * .4 : 118 + (44 - x) * .4}`)).join('') +
      k.circ(0, 122, 17, TIM) + k.shine(-6, 116, 5) +
      k.p(SIL, 'M -40 180 L 40 180 L 38 198 L -38 198 Z') +
      sevenHead(k) +
      arm(k, C, [[-56, 100], [-98, 66], [-118, 10]], { hand: 'chop' }) +
      arm(k, C, [[56, 100], [92, 140], [76, 182]]);
  }
  const tower = (x, w, h, c) => `<path fill="${c}" d="M${x} 330 L${x} ${330 - h} L${x + w / 2} ${330 - h - w * .8} L${x + w} ${330 - h} L${x + w} 330 Z"/>`;
  const team = `
    ${tower(40, 70, 110, '#d0ebff')} ${tower(120, 60, 170, '#e5dbff')} ${tower(200, 80, 90, '#c5f6fa')}
    ${tower(520, 80, 90, '#c5f6fa')} ${tower(620, 60, 170, '#e5dbff')} ${tower(690, 70, 110, '#d0ebff')}
    <path fill="#a5d8ff" d="M340 330 L360 120 L440 120 L460 330 Z"/>
    ${star(400, 82, 72, '#ffe066', 34, 8)}
    <circle cx="400" cy="82" r="26" fill="#fff9db"/>
    <path d="M300 70 L250 50 M300 110 L240 120 M500 70 L550 50 M500 110 L560 120"/>
    <path fill="#e7f5ff" d="M20 330 L780 330 L780 350 L20 350 Z"/>
    ${ultramanFig(K(150, 362, .64))}
    ${sevenFig(K(650, 362, .64))}
    ${zeroFig(K(400, 362, .66), { legs: STAND, armL: [[-56, 100], [-98, 140], [-82, 182]], handL: 'fist', armR: [[56, 100], [100, 140], [80, 182]] })}
    ${ground(560)}`;

  window.ART.addPack({
    categories: [],
    drawings: [
      { id: 'ul-zero', cat: 'ultra', name: '傑洛', en: 'Ultraman Zero', svg: zero },
      { id: 'ul-zero-slugger', cat: 'ultra', name: '傑洛頭鏢', en: 'Zero Sluggers', svg: zslug },
      { id: 'ul-orb', cat: 'ultra', name: '歐布', en: 'Ultraman Orb', svg: orb },
      { id: 'ul-geed', cat: 'ultra', name: '捷德', en: 'Ultraman Geed', svg: geed },
      { id: 'ul-z', cat: 'ultra', name: '捷特', en: 'Ultraman Z', svg: zz },
      { id: 'ul-trigger', cat: 'ultra', name: '特利卡', en: 'Ultraman Trigger', svg: trigger },
      { id: 'ul-decker', cat: 'ultra', name: '德卡', en: 'Ultraman Decker', svg: decker },
      { id: 'ul-blazar', cat: 'ultra', name: '布雷薩', en: 'Ultraman Blazar', svg: blazar },
      { id: 'ul-arc', cat: 'ultra', name: '雅克', en: 'Ultraman Arc', svg: arc },
      { id: 'ul-belial', cat: 'ultra', name: '貝利亞', en: 'Ultraman Belial', svg: belial },
      { id: 'ul-baltan', cat: 'ultra', name: '巴爾坦星人', en: 'Alien Baltan', svg: baltan },
      { id: 'ul-gomora', cat: 'ultra', name: '哥莫拉', en: 'Gomora', svg: gomora },
      { id: 'ul-zetton', cat: 'ultra', name: '傑頓', en: 'Zetton', svg: zetton },
      { id: 'ul-redking', cat: 'ultra', name: '雷德王', en: 'Red King', svg: redking },
      { id: 'ul-team', cat: 'ultra', name: '光之國', en: 'Land of Light', svg: team },
    ],
  });
})();
