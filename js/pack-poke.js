/* 線稿包：寶可夢（Q 版，第 1 包）
 * 全部是我們自己畫的簡化線稿：大頭、短身體、粗粗的外框、大大的塗色格子。
 * 每隻寶可夢的招牌特徵都刻意誇大（皮卡丘的黑耳尖和閃電尾巴、傑尼龜的殼、
 * 妙蛙種子的種子、小火龍的尾巴火焰⋯⋯），讓小朋友一眼認出是誰。
 * 名字用台灣官方中文譯名。共用的小工具放在 ART.helpers.poke，第 2 包（pack-poke2.js）也會用。 */
(function () {
  const { sparkle, ground } = window.ART.helpers;
  const f1 = v => String(Math.round(v * 10) / 10);
  const PAIR = /(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g;
  // 左右鏡射（x 變 -x），左半邊畫好，右半邊直接照鏡子
  const flipD = d => d.replace(PAIR, (m, x, y) => f1(-x) + ' ' + y);
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // 二次曲線上的一點
  const qpt = (a, c, b, t) => lerp(lerp(a, c, t), lerp(c, b, t), t);
  const P = p => f1(p[0]) + ' ' + f1(p[1]);

  // 「身體座標」：頭的中心 = (0,0)，再放大縮小擺到畫面上（只用 M L Q C Z，座標才換算得到）
  function K(ox, oy, s = 1) {
    const X = x => ox + x * s, Y = y => oy + y * s;
    const mp = d => d.replace(PAIR, (m, x, y) => f1(X(+x)) + ' ' + f1(Y(+y)));
    const k = {
      s, X, Y,
      p: (c, d) => `<path fill="${c}" d="${mp(d)}"/>`,
      sym: (c, d) => k.p(c, d) + k.p(c, flipD(d)),
      l: d => `<path d="${mp(d)}"/>`,
      symL: d => k.l(d) + k.l(flipD(d)),
      circ: (x, y, r, c) => `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="${f1(r * s)}" fill="${c}"/>`,
      ell: (x, y, rx, ry, c, rot = 0) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="${c}"${rot ? ` transform="rotate(${f1(rot)} ${f1(X(x))} ${f1(Y(y))})"` : ''}/>`,
      // 左右一對橢圓（右邊那個角度相反）
      ell2: (x, y, rx, ry, c, rot = 0) => k.ell(x, y, rx, ry, c, rot) + k.ell(-x, y, rx, ry, c, -rot),
      // 黑眼珠 + 白色反光
      eye: (x, y, rx, ry = rx) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="#222"/>` +
        `<circle cx="${f1(X(x + rx * .3))}" cy="${f1(Y(y - ry * .38))}" r="${f1(rx * .38 * s)}" fill="#fff" stroke="none"/>`,
      eyes: (x, y, rx, ry) => k.eye(-x, y, rx, ry) + k.eye(x, y, rx, ry),
      // 小反光（畫在彩色眼珠上）
      shine: (x, y, r) => `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="${f1(r * s)}" fill="#fff" stroke="none"/>`,
      // 圓頭膠囊（手腳、尾巴）：兩端點 + 粗細
      cap: (a, b, w, c) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, h = w / 2, nx = -(b[1] - a[1]) / L * h, ny = (b[0] - a[0]) / L * h;
        const q = (x, y) => f1(X(x)) + ' ' + f1(Y(y)), H = f1(h * s);
        return `<path fill="${c}" d="M${q(a[0] + nx, a[1] + ny)} L${q(b[0] + nx, b[1] + ny)} A${H} ${H} 0 0 0 ${q(b[0] - nx, b[1] - ny)} L${q(a[0] - nx, a[1] - ny)} A${H} ${H} 0 0 0 ${q(a[0] + nx, a[1] + ny)} Z"/>`;
      },
    };
    return k;
  }

  // 尖耳朵（也可以當葉子、尾巴）：A、B 是根部兩點，T 是尖端，ca / cb 是兩邊的弧度；
  // tip > 0 的話，從 tip 的位置到尖端另外圍成一格（皮卡丘的黑耳尖）
  function ear(k, A, B, T, ca, cb, c, tip = 0, ct = '#495057') {
    let s = k.p(c, `M ${P(A)} Q ${P(ca)} ${P(T)} Q ${P(cb)} ${P(B)} Z`);
    if (tip) {
      const m1 = qpt(A, ca, T, tip), m2 = qpt(T, cb, B, 1 - tip);
      s += k.p(ct, `M ${P(m1)} Q ${P(lerp(ca, T, tip))} ${P(T)} Q ${P(lerp(T, cb, 1 - tip))} ${P(m2)} Z`);
    }
    return s;
  }
  const mir = p => [-p[0], p[1]];
  const ears = (k, A, B, T, ca, cb, c, tip, ct) =>
    ear(k, A, B, T, ca, cb, c, tip, ct) + ear(k, mir(A), mir(B), mir(T), mir(ca), mir(cb), c, tip, ct);

  // 一圈波浪（伊布的毛領子、雲朵）：橢圓上 n 個小圓弧
  function fluffD(cx, cy, rx, ry, n, bump) {
    const pt = (a, g) => P([cx + (rx + g) * Math.cos(a), cy + (ry + g) * Math.sin(a)]);
    let d = `M ${pt(0, 0)}`;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      d += ` Q ${pt((a0 + a1) / 2, bump * 2)} ${pt(a1, 0)}`;
    }
    return d + ' Z';
  }
  // 閃電（畫面上的絕對座標）
  const bolt = (x, y, r = 1, c = '#ffd43b') =>
    `<path fill="${c}" stroke-width="5" d="M${f1(x + 6 * r)} ${f1(y - 30 * r)} L${f1(x - 16 * r)} ${f1(y + 4 * r)} L${f1(x - 2 * r)} ${f1(y + 4 * r)} L${f1(x - 8 * r)} ${f1(y + 30 * r)} L${f1(x + 16 * r)} ${f1(y - 6 * r)} L${f1(x + 2 * r)} ${f1(y - 6 * r)} Z"/>`;
  // 音符
  const note = (x, y, r = 1, c = '#b197fc') =>
    `<path fill="${c}" stroke-width="5" d="M${f1(x + 10 * r)} ${f1(y + 18 * r)} L${f1(x + 10 * r)} ${f1(y - 30 * r)} L${f1(x + 34 * r)} ${f1(y - 20 * r)} L${f1(x + 34 * r)} ${f1(y - 8 * r)} L${f1(x + 18 * r)} ${f1(y - 14 * r)} L${f1(x + 18 * r)} ${f1(y + 18 * r)} Z"/>` +
    `<ellipse cx="${f1(x)}" cy="${f1(y + 20 * r)}" rx="${f1(16 * r)}" ry="${f1(12 * r)}" fill="${c}" stroke-width="5" transform="rotate(-20 ${f1(x)} ${f1(y + 20 * r)})"/>`;
  // 大大的「Z」（睡覺）
  const zz = (x, y, r = 1, c = '#a5d8ff') => {
    const q = (a, b) => f1(x + a * r) + ' ' + f1(y + b * r);
    return `<path fill="${c}" stroke-width="5" d="M${q(0, 0)} L${q(40, 0)} L${q(40, 10)} L${q(15, 38)} L${q(40, 38)} L${q(40, 48)} L${q(0, 48)} L${q(0, 38)} L${q(25, 10)} L${q(0, 10)} Z"/>`;
  };

  // ---- 顏色 ----
  const YEL = '#ffd43b', RED = '#ff6b6b', BRN = '#a9713c', DARK = '#495057', PINK = '#ffa8c5', MOUTH = '#ff8787',
    ORG = '#ff922b', CRM = '#fff3bf', BLU = '#74c0fc', WHITE = '#f8f9fa';

  window.ART.helpers.poke = { K, ear, ears, fluffD, bolt, note, zz, mir, f1 };

  // ================= 1. 皮卡丘 =================
  // 長長的耳朵 + 黑耳尖、紅臉頰、閃電形狀的尾巴（根部咖啡色）
  const pikachuFig = k =>
    // 閃電尾巴
    k.p(YEL, 'M 60 200 L 130 150 L 110 125 L 196 74 L 172 46 L 262 -48 L 330 4 L 214 84 L 230 106 L 137 159 L 157 184 L 87 234 Z') +
    k.p(BRN, 'M 60 200 L 95 175 L 122 209 L 87 234 Z') +
    k.ell(0, 195, 98, 90, YEL) +
    k.ell2(-52, 280, 42, 20, YEL) +
    k.ell2(-92, 150, 22, 36, YEL, 35) +
    ears(k, [-95, -55], [-35, -90], [-170, -240], [-160, -130], [-80, -190], YEL, .68, '#343a40') +
    k.ell(0, 0, 125, 100, YEL) +
    k.eyes(52, -12, 22) +
    k.circ(-90, 32, 25, RED) + k.circ(90, 32, 25, RED) +
    k.ell(0, 10, 6, 4, '#222') +
    k.p(MOUTH, 'M -12 40 Q 0 68 12 40 Q 6 35 0 30 Q -6 35 -12 40 Z') +
    k.l('M -26 30 Q -13 44 0 30 Q 13 44 26 30');
  const pikachu = `
    ${pikachuFig(K(390, 270))}
    ${ground(560)}
    ${bolt(110, 120, 1.4)} ${bolt(170, 330, 1)} ${sparkle(640, 470, 18)} ${sparkle(120, 470, 14, '#74c0fc')}`;

  // ================= 2. 皮丘 =================
  // 大大的三角耳（黑邊）、粉紅臉頰、脖子上一圈黑色鋸齒、短短的黑尾巴
  const pichuFig = k =>
    k.p(DARK, 'M 60 225 Q 140 225 150 160 Q 172 178 162 205 Q 145 245 70 250 Z') +
    k.ell(0, 212, 80, 80, YEL) +
    k.ell2(-45, 288, 36, 18, YEL) +
    k.ell2(-45, 195, 18, 28, YEL, -20) +
    ears(k, [-115, -35], [-30, -105], [-225, -165], [-205, -60], [-120, -195], YEL, .55, '#343a40') +
    k.ell(0, 0, 130, 115, YEL) +
    k.p(DARK, 'M -52 108 Q 0 122 52 108 L 40 136 L 20 124 L 0 142 L -20 124 L -40 136 Z') +
    k.eyes(50, -5, 25) +
    k.circ(-90, 42, 22, PINK) + k.circ(90, 42, 22, PINK) +
    k.ell(0, 18, 6, 4, '#222') +
    k.p(MOUTH, 'M -18 36 Q 0 66 18 36 Q 0 44 -18 36 Z');
  const pichu = `
    ${pichuFig(K(400, 260))}
    ${ground(560)}
    ${bolt(110, 400, 1)} ${bolt(690, 400, 1)} ${sparkle(110, 120, 18)} ${sparkle(690, 120, 18, '#ff8fab')}`;

  // ================= 3. 雷丘 =================
  // 橘色身體、奶油色肚子、黃色臉頰；耳朵外咖啡色、尖端捲起來；細長黑尾巴，尾巴尖是閃電
  const raichuFig = k =>
    k.p(DARK, 'M 60 215 Q 230 255 250 115 L 270 118 Q 255 280 65 245 Z') +
    k.p(YEL, 'M 262 130 L 214 66 L 246 66 L 222 0 L 300 82 L 268 82 L 286 128 Z') +
    k.ell(0, 200, 95, 90, ORG) + k.ell(0, 215, 60, 62, CRM) +
    k.ell2(-50, 282, 42, 20, '#e8590c') +
    k.ell2(-94, 150, 21, 35, ORG, 35) +
    ears(k, [-100, -50], [-40, -90], [-190, -215], [-170, -100], [-95, -185], BRN) +
    ears(k, [-90, -62], [-52, -86], [-170, -190], [-150, -105], [-100, -170], YEL) +
    k.ell(0, 0, 122, 100, ORG) +
    k.eyes(50, -12, 22) +
    k.circ(-88, 32, 24, YEL) + k.circ(88, 32, 24, YEL) +
    k.ell(0, 10, 6, 4, '#222') +
    k.p(MOUTH, 'M -22 34 Q 0 66 22 34 Q 0 42 -22 34 Z') +
    k.p('#fff', 'M 10 38 L 14 50 L 18 37 Z');
  const raichu = `
    ${raichuFig(K(385, 268, .98))}
    ${ground(560)}
    ${bolt(110, 130, 1.3)} ${sparkle(120, 400, 16)} ${sparkle(700, 470, 16, '#74c0fc')}`;

  // ================= 4. 妙蛙種子 =================
  // 背上大大的種子（分三瓣）、三角小耳朵、紅眼睛、身上深色斑點
  const TEAL = '#8ce0c8', TEAL2 = '#38b39a', LEAF = '#69db7c';
  const bulbaFig = k =>
    k.p(LEAF, 'M -126 -60 Q -190 -150 -90 -196 Q -30 -220 10 -270 Q 10 -232 60 -212 Q 190 -160 126 -60 Z') +
    k.l('M 10 -270 Q -60 -190 -66 -96') + k.l('M 10 -270 Q 70 -190 66 -96') +
    k.ell(0, 135, 170, 82, TEAL) +
    k.ell2(-175, 175, 48, 40, TEAL) +
    k.cap([-85, 150], [-92, 215], 64, TEAL) + k.cap([85, 150], [92, 215], 64, TEAL) +
    k.symL('M -110 238 L -110 222 M -94 240 L -94 222 M -78 238 L -78 222') +
    k.sym(TEAL, 'M -130 -40 L -128 -142 L -66 -88 Z') +
    k.ell(0, 0, 150, 105, TEAL) +
    k.ell(0, -72, 24, 14, TEAL2) + k.ell2(-122, 10, 12, 20, TEAL2, 10) + k.ell2(-40, 175, 20, 13, TEAL2) +
    k.ell2(-56, -10, 28, 30, '#e03131') + k.eyes(52, -6, 15, 17) +
    k.ell2(-10, 14, 4, 3, '#222') +
    k.p(MOUTH, 'M -48 34 Q 0 90 48 34 Q 0 50 -48 34 Z');
  const bulbasaur = `
    ${bulbaFig(K(400, 292, .92))}
    ${ground(524)}
    ${sparkle(110, 110, 18)} ${sparkle(690, 110, 18, '#69db7c')} ${sparkle(110, 420, 14, '#74c0fc')} ${sparkle(700, 420, 14)}`;

  // ================= 5. 小火龍 =================
  // 橘色身體、奶油色肚子；尾巴尖端一團火焰（外紅內黃）
  const charmFig = k =>
    k.p(ORG, 'M 60 200 Q 200 230 212 90 L 245 95 Q 242 265 68 248 Z') +
    k.p('#ff6b6b', 'M 230 105 C 188 102 178 52 203 16 C 208 36 220 42 226 32 C 220 2 236 -25 254 -42 C 252 -10 280 15 285 50 C 290 86 264 106 230 105 Z') +
    k.p(YEL, 'M 232 96 C 210 93 204 66 217 48 C 223 60 231 60 235 52 C 235 40 241 30 251 22 C 254 45 270 60 266 78 C 262 92 250 97 232 96 Z') +
    k.ell(0, 205, 86, 90, ORG) + k.ell(0, 218, 56, 64, CRM) +
    k.ell2(-46, 286, 40, 20, ORG) +
    k.ell2(-76, 170, 20, 32, ORG, -28) +
    k.ell(0, 0, 112, 104, ORG) +
    k.eyes(44, -14, 18, 27) +
    k.ell2(-80, 30, 14, 9, PINK) +
    k.ell2(-8, 14, 4, 3, '#222') +
    k.p(MOUTH, 'M -38 38 Q 0 86 38 38 Q 0 52 -38 38 Z');
  const charmander = `
    ${charmFig(K(350, 172, 1.25))}
    ${ground(560)}
    ${sparkle(110, 110, 18)} ${sparkle(110, 400, 14, '#ff8787')} ${sparkle(700, 480, 16)}`;

  // ================= 6. 傑尼龜 =================
  // 淺藍身體、背後咖啡色龜殼（從兩邊露出來）、黃色肚子分格、捲捲的尾巴
  const BLUE2 = '#74c0fc', SHELL = '#c98a4b';
  const squirtFig = k =>
    k.circ(118, 238, 38, BLUE2) + k.l('M 118 238 Q 104 224 120 214 Q 142 216 138 240 Q 130 262 104 256') +
    k.ell(0, 196, 112, 100, SHELL) +
    k.ell2(-50, 290, 40, 20, BLUE2) +
    k.ell(0, 200, 90, 94, WHITE) +
    k.ell(0, 206, 72, 78, '#ffe066') +
    k.l('M -68 180 Q 0 194 68 180') + k.l('M -67 232 Q 0 246 67 232') + k.l('M 0 128 L 0 140 M 0 270 L 0 284') +
    k.ell2(-98, 170, 22, 36, BLUE2, -25) +
    k.ell(0, 0, 115, 102, BLUE2) +
    k.eyes(44, -10, 21, 29) +
    k.ell2(-9, 18, 4, 3, '#222') +
    k.p(MOUTH, 'M -34 38 Q 0 76 34 38 Q 0 50 -34 38 Z');
  const squirtle = `
    ${squirtFig(K(390, 175, 1.2))}
    ${ground(560)}
    <circle cx="110" cy="120" r="22" fill="#d0ebff"/><circle cx="150" cy="80" r="14" fill="#d0ebff"/><circle cx="680" cy="110" r="26" fill="#d0ebff"/>
    ${sparkle(700, 420, 16, '#74c0fc')} ${sparkle(110, 420, 16)}`;

  // ================= 7. 伊布 =================
  // 咖啡色身體、奶油色毛領子、大耳朵、蓬鬆尾巴（尾巴尖奶油色）
  const EEV = '#c08a52', EEV2 = '#7a4a24';
  const eeveeFig = k =>
    ear(k, [55, 260], [70, 195], [255, 30], [270, 250], [130, 100], EEV, .62, CRM) +
    k.ell(0, 215, 88, 80, EEV) +
    k.cap([-36, 215], [-40, 278], 42, EEV) + k.cap([36, 215], [40, 278], 42, EEV) +
    k.ell2(-42, 288, 30, 16, EEV) +
    k.p(CRM, fluffD(0, 122, 98, 52, 14, 9)) +
    ears(k, [-90, -50], [-35, -85], [-200, -195], [-180, -80], [-90, -180], EEV, .66, EEV2) +
    k.ell(0, 0, 108, 92, EEV) +
    k.p(EEV, 'M -26 -86 Q -18 -112 0 -116 Q 6 -100 2 -90 Q 16 -108 30 -104 Q 26 -88 20 -84 Z') +
    k.eyes(42, -6, 20, 26) +
    k.p('#222', 'M -7 14 L 7 14 L 0 21 Z') +
    k.l('M 0 21 Q -9 34 -18 28 M 0 21 Q 9 34 18 28');
  const eevee = `
    ${eeveeFig(K(380, 270, 1.05))}
    ${ground(568)}
    ${sparkle(110, 110, 18, '#ff8fab')} ${sparkle(110, 420, 16)} ${sparkle(680, 480, 14, '#74c0fc')}`;

  // ================= 8. 胖丁 =================
  // 圓滾滾的粉紅球、額頭一撮捲毛、藍色大眼睛，手拿麥克風唱歌
  const jigglyFig = k =>
    k.ell2(-52, 140, 42, 22, PINK) +
    k.sym(PINK, 'M -122 -82 L -112 -178 L -50 -128 Z') +
    k.sym(DARK, 'M -108 -110 L -103 -156 L -74 -130 Z') +
    k.ell(-140, 40, 28, 38, PINK, 30) +
    k.circ(0, 0, 142, PINK) +
    k.p(PINK, 'M -45 -126 Q -58 -192 8 -196 Q 64 -190 52 -128 Q 44 -92 5 -92 Q -32 -94 -45 -126 Z') +
    k.l('M 6 -108 Q -22 -114 -16 -142 Q -6 -166 18 -156 Q 32 -146 22 -132') +
    k.ell2(-54, -12, 34, 38, '#4dabf7') + k.ell2(-54, -6, 16, 19, '#222') +
    k.shine(-66, -30, 11) + k.shine(42, -30, 11) +
    k.ell2(-96, 42, 18, 10, '#ff8fab') +
    k.p(MOUTH, 'M -16 40 Q 0 62 16 40 Q 0 46 -16 40 Z') +
    // 麥克風
    k.cap([150, 40], [190, -40], 22, '#ced4da') + k.circ(200, -62, 30, '#868e96') +
    k.l('M 178 -70 Q 200 -58 222 -70 M 185 -48 Q 200 -40 215 -48') +
    k.ell(140, 26, 28, 38, PINK, -30);
  const jigglypuff = `
    ${jigglyFig(K(390, 300, 1.4))}
    ${note(110, 120, 1.3)} ${note(670, 470, 1.1, '#ff8fab')} ${note(120, 440, 1, '#74c0fc')} ${sparkle(700, 330, 16)}`;

  // ================= 9. 卡比獸 =================
  // 大大的深綠藍身體、奶油色臉和肚子、閉著眼睛睡覺，旁邊一串 Z
  const SNOR = '#3f8f9c';
  const snorlaxFig = k =>
    k.ell2(-200, 70, 48, 72, SNOR, 25) +
    k.p(SNOR, 'M -140 -40 Q -170 -20 -190 20 Q -230 90 -205 190 Q -175 268 0 268 Q 175 268 205 190 Q 230 90 190 20 Q 170 -20 140 -40 Z') +
    k.ell(0, 130, 155, 122, CRM) +
    k.sym(SNOR, 'M -102 -150 L -96 -222 L -44 -178 Z') +
    k.ell(0, -100, 130, 98, SNOR) +
    k.p(CRM, 'M -112 -78 Q -110 -10 0 -6 Q 110 -10 112 -78 Q 96 -136 56 -112 L 0 -150 L -56 -112 Q -96 -136 -112 -78 Z') +
    k.symL('M -66 -88 Q -48 -78 -30 -88') +
    k.l('M -44 -50 Q 0 -30 44 -50') +
    k.sym(WHITE, 'M -30 -45 L -24 -32 L -18 -42 Z') +
    // 大腳丫：奶油色腳底 + 咖啡色肉墊 + 小爪子
    k.ell2(-140, 240, 72, 52, CRM) + k.ell2(-140, 252, 34, 26, '#d9a066') +
    k.sym(WHITE, 'M -170 196 L -164 180 L -156 196 Z M -146 192 L -140 176 L -134 192 Z M -122 196 L -116 180 L -110 196 Z');
  const snorlax = `
    ${snorlaxFig(K(400, 300, .95))}
    ${zz(560, 60, 1.1)} ${zz(620, 20, .7)} ${zz(680, 110, .55)}
    ${sparkle(110, 100, 16, '#ffe066')}`;

  // ================= 10. 可達鴨 =================
  // 黃色鴨子、兩手抱著頭（頭痛）、頭上三根毛、呆呆的白眼睛、奶油色大嘴巴
  const DUCK = '#ffd43b';
  const psyduckFig = k =>
    k.ell2(-48, 286, 46, 18, CRM) +
    k.ell(0, 200, 88, 88, DUCK) +
    k.ell(0, 0, 120, 106, DUCK) +
    k.l('M -14 -104 Q -24 -150 -6 -168') + k.l('M 0 -106 Q 4 -150 22 -164') + k.l('M 14 -103 Q 30 -136 48 -140') +
    k.ell2(-46, -20, 27, 27, '#fff') + k.ell2(-46, -20, 5, 5, '#222') +
    k.p(CRM, 'M -78 34 Q -40 4 0 6 Q 40 4 78 34 Q 92 64 50 76 Q 0 88 -50 76 Q -92 64 -78 34 Z') +
    k.l('M -80 50 Q 0 62 80 50') + k.ell2(-14, 26, 4, 3, '#222') +
    k.cap([-68, 150], [-128, 62], 42, DUCK) + k.cap([68, 150], [128, 62], 42, DUCK) +
    k.ell2(-122, 44, 26, 32, DUCK, 10);
  const psyduck = `
    ${psyduckFig(K(400, 220, 1.12))}
    ${ground(560)}
    <path d="M190 90 Q205 70 222 88 M590 90 Q605 70 622 88 M170 130 L200 140 M630 140 L600 130"/>
    ${sparkle(110, 300, 16, '#74c0fc')} ${sparkle(700, 300, 16)}`;

  // ================= 11. 喵喵 =================
  // 奶油色貓、額頭上的金幣、黑色大耳朵、長長的鬍鬚、捲捲的尾巴
  const MEOW = '#fff0d6', COIN = '#fcc419';
  const meowthFig = k =>
    k.p(MEOW, 'M 60 225 Q 210 262 212 160 Q 210 128 180 136 L 186 156 Q 190 236 62 250 Z') +
    k.circ(184, 140, 22, BRN) +
    k.ell(0, 196, 82, 94, MEOW) +
    k.ell2(-44, 286, 38, 18, BRN) +
    k.ell2(-88, 160, 19, 32, MEOW, 30) +
    k.sym('#343a40', 'M -95 -42 L -158 -165 L -28 -88 Z') +
    k.sym(BRN, 'M -90 -62 L -134 -142 L -50 -92 Z') +
    k.ell(0, 0, 116, 95, MEOW) +
    k.ell(0, -86, 26, 32, COIN) + k.ell(0, -86, 12, 17, COIN) +
    k.symL('M -82 18 L -182 -4 M -82 32 L -188 34 M -82 46 L -176 72') +
    k.ell2(-42, -8, 22, 26, '#fff') + k.ell2(-42, -6, 5, 18, '#222') +
    k.ell(0, 16, 7, 5, '#ff8fab') +
    k.l('M -22 34 Q -11 46 0 34 Q 11 46 22 34') +
    k.sym('#fff', 'M -16 39 L -12 52 L -7 42 Z');
  const meowth = `
    ${meowthFig(K(390, 262, 1))}
    ${ground(560)}
    <circle cx="110" cy="470" r="28" fill="${COIN}"/><circle cx="110" cy="470" r="14" fill="${COIN}"/>
    <circle cx="680" cy="480" r="22" fill="${COIN}"/>
    ${sparkle(110, 110, 18)} ${sparkle(690, 400, 14, '#ff8fab')}`;

  // ================= 12. 耿鬼 =================
  // 紫色圓滾滾的幽靈、背上一排刺、尖耳朵、紅眼睛、咧嘴大笑
  const GEN = '#9775fa';
  const gengarFig = k =>
    k.ell2(-72, 160, 42, 34, GEN) +
    k.sym(GEN, 'M -130 30 Q -170 10 -200 26 Q -222 44 -204 62 Q -180 76 -134 84 Z') +
    k.p(GEN, 'M -150 20 Q -160 -60 -122 -108 L -158 -186 L -86 -142 L -62 -196 L -28 -150 L 0 -186 L 28 -150 L 62 -196 L 86 -142 L 158 -186 L 122 -108 Q 160 -60 150 20 Q 150 150 0 150 Q -150 150 -150 20 Z') +
    k.sym(RED, 'M -18 -52 Q -66 -96 -98 -66 Q -86 -26 -24 -36 Z') + k.eyes(58, -58, 9) +
    k.p('#fff', 'M -104 14 Q 0 44 104 14 Q 64 64 0 64 Q -64 64 -104 14 Z') +
    k.p('#fff', 'M -104 14 Q -64 64 0 64 Q 64 64 104 14 Q 74 112 0 112 Q -74 112 -104 14 Z');
  const gengar = `
    ${gengarFig(K(400, 330, 1.2))}
    <path fill="#ffe066" d="M630 60 Q590 90 600 140 Q620 180 670 170 Q625 150 625 110 Q625 80 650 60 Z"/>
    ${sparkle(110, 100, 16, '#b197fc')} ${sparkle(150, 220, 12)} ${sparkle(690, 470, 16, '#b197fc')}`;

  window.ART.addPack({
    categories: [
      { id: 'poke', name: '寶可夢', icon: '⚡', color: '#fab005', dark: '#e67700', en: 'Pokémon' },
    ],
    drawings: [
      { id: 'pk-pikachu', cat: 'poke', name: '皮卡丘', en: 'Pikachu', svg: pikachu },
      { id: 'pk-pichu', cat: 'poke', name: '皮丘', en: 'Pichu', svg: pichu },
      { id: 'pk-raichu', cat: 'poke', name: '雷丘', en: 'Raichu', svg: raichu },
      { id: 'pk-bulbasaur', cat: 'poke', name: '妙蛙種子', en: 'Bulbasaur', svg: bulbasaur },
      { id: 'pk-charmander', cat: 'poke', name: '小火龍', en: 'Charmander', svg: charmander },
      { id: 'pk-squirtle', cat: 'poke', name: '傑尼龜', en: 'Squirtle', svg: squirtle },
      { id: 'pk-eevee', cat: 'poke', name: '伊布', en: 'Eevee', svg: eevee },
      { id: 'pk-jigglypuff', cat: 'poke', name: '胖丁', en: 'Jigglypuff', svg: jigglypuff },
      { id: 'pk-snorlax', cat: 'poke', name: '卡比獸', en: 'Snorlax', svg: snorlax },
      { id: 'pk-psyduck', cat: 'poke', name: '可達鴨', en: 'Psyduck', svg: psyduck },
      { id: 'pk-meowth', cat: 'poke', name: '喵喵', en: 'Meowth', svg: meowth },
      { id: 'pk-gengar', cat: 'poke', name: '耿鬼', en: 'Gengar', svg: gengar },
    ],
  });
})();
