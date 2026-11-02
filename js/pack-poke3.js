/* 線稿包：寶可夢（Q 版，第 3 包）
 * 再多 25 隻小朋友熟悉的寶可夢：超夢、伊布家族、城都和最新幾代的御三家⋯⋯
 * 共用小工具（身體座標、尖耳朵、毛領子⋯⋯）在 pack-poke.js 裡，放在 ART.helpers.poke。 */
(function () {
  const { sparkle, ground } = window.ART.helpers;
  const { K, ear, ears, fluffD, f1 } = window.ART.helpers.poke;

  // ---- 顏色 ----
  const YEL = '#ffd43b', RED = '#ff6b6b', BRN = '#a9713c', DARK = '#495057', PINK = '#ffa8c5', MOUTH = '#ff8787',
    ORG = '#ff922b', CRM = '#fff3bf', BLU = '#74c0fc', WHITE = '#f8f9fa', GRAY = '#ced4da', LEAF = '#69db7c',
    PUR = '#b197fc', WATER = '#a5d8ff';

  // 坐著的四腳獸（伊布家族、卡蒂狗、六尾、火斑喵⋯⋯）：正面坐著，頭大、兩隻前腳併攏
  // o.tail / o.collar / o.ears / o.top / o.face 都是 k => 字串，沒給就用預設
  function sit(k, C, o = {}) {
    return (o.tail ? o.tail(k) : '') +
      k.ell(0, 215, 88, 80, C.body) +
      (o.belly ? k.ell(0, 225, 50, 56, o.belly) : '') +
      k.cap([-36, 215], [-40, 278], 42, C.leg || C.body) + k.cap([36, 215], [40, 278], 42, C.leg || C.body) +
      k.ell2(-42, 288, 30, 16, C.feet || C.leg || C.body) +
      (o.collar ? o.collar(k) : '') +
      (o.ears ? o.ears(k) : '') +
      (o.back ? o.back(k) : '') +
      k.ell(0, 0, o.hw || 108, o.hh || 92, C.head || C.body) +
      (o.top ? o.top(k) : '') +
      (o.face ? o.face(k) : k.eyes(42, -6, 20, 26) + k.p('#222', 'M -7 14 L 7 14 L 0 21 Z') + k.l('M 0 21 Q -9 34 -18 28 M 0 21 Q 9 34 18 28'));
  }
  // 蓬蓬尾巴（從右下往右上翹），tip 給顏色的話尾巴尖另外一格
  const bushTail = (k, c, tip, ct) => ear(k, [55, 260], [70, 195], [255, 30], [270, 250], [130, 100], c, tip, ct);
  // 一圈尖尖的鋸齒（雷伊布的領子、菊草葉脖子上的芽）
  function spikyD(cx, cy, rx, ry, n, out) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = i * Math.PI / n, g = i % 2 ? out : 0;
      d += (i ? ' L ' : 'M ') + f1(cx + (rx + g) * Math.cos(a)) + ' ' + f1(cy + (ry + g) * Math.sin(a));
    }
    return d + ' Z';
  }
  const nose = k => k.p('#222', 'M -7 14 L 7 14 L 0 21 Z');
  const catMouth = k => k.l('M 0 21 Q -9 34 -18 28 M 0 21 Q 9 34 18 28');
  const scene = (fig, g = 568, extra = '') => `${fig}${g ? ground(g) : ''}${extra}`;

  // ================= 1. 超夢 =================
  // 淡紫色的身體、頭上兩隻短短的鈍角、後腦一條管子連到背上、紫色肚子和粗粗的紫色尾巴、手指尖是圓球
  const MEW2 = '#eee6ff', MEW2P = '#9775fa';
  const mewtwoFig = k =>
    k.p(MEW2P, 'M 40 236 Q 230 268 256 150 Q 268 92 232 64 Q 288 62 296 136 Q 300 296 50 276 Z') +
    k.cap([84, -30], [100, 120], 34, MEW2) +
    k.cap([-40, 220], [-52, 290], 62, MEW2) + k.cap([40, 220], [52, 290], 62, MEW2) +
    k.ell2(-58, 304, 38, 16, MEW2) +
    k.ell(0, 186, 80, 82, MEW2) + k.ell(0, 232, 64, 48, MEW2P) +
    k.cap([-70, 140], [-122, 214], 34, MEW2) + k.cap([70, 140], [122, 214], 34, MEW2) +
    [-1, 1].map(sx => [[-14, 18], [0, 24], [14, 18]].map(([dx, dy]) => k.circ(sx * 122 + dx, 214 + dy, 11, MEW2)).join('')).join('') +
    k.sym(MEW2, 'M -76 -40 L -104 -100 Q -96 -116 -80 -108 L -36 -70 Z') +
    k.ell(0, 0, 98, 88, MEW2) +
    k.sym(MEW2P, 'M -14 -6 Q -40 -34 -74 -22 Q -58 8 -20 4 Z') + k.eyes(42, -10, 9, 11) +
    k.symL('M -80 -36 Q -48 -50 -14 -24') +
    k.l('M -18 44 Q 0 50 18 44');
  const mewtwo = scene(`${mewtwoFig(K(380, 222, 1.02))}`, 560,
    `${sparkle(110, 110, 18, '#b197fc')} ${sparkle(690, 470, 16)} <circle cx="120" cy="420" r="30" fill="#e5dbff"/><circle cx="170" cy="370" r="14" fill="#e5dbff"/>`);

  // ================= 2. 卡蒂狗 =================
  // 橘色小狗、身上和頭上黑色條紋、奶油色的頭頂毛、嘴巴、胸毛和蓬蓬尾巴
  const GROW = '#ff922b';
  const growlitheFig = k => sit(k, { body: GROW }, {
    tail: k => bushTail(k, CRM),
    collar: k => k.p(CRM, fluffD(0, 118, 80, 50, 12, 8)) +
      k.sym(DARK, 'M -86 190 L -56 204 L -82 216 Z') + k.sym(DARK, 'M -60 250 L -26 252 L -58 262 Z'),
    ears: k => ears(k, [-96, -36], [-56, -76], [-150, -120], [-140, -64], [-108, -116], GROW),
    back: k => k.p(CRM, fluffD(0, -82, 50, 28, 8, 9)),
    top: k => k.sym(DARK, 'M -108 -6 L -74 0 L -106 12 Z') + k.sym(DARK, 'M -98 -46 L -66 -34 L -92 -24 Z') +
      k.ell(0, 30, 50, 32, CRM),
    face: k => k.eyes(44, -14, 18, 24) + k.ell(0, 16, 12, 8, '#222') + k.l('M 0 24 L 0 36 Q -14 50 -26 40 M 0 36 Q 14 50 26 40'),
  });
  const growlithe = scene(growlitheFig(K(380, 270, 1.05)), 568, `${sparkle(110, 110, 18)} ${sparkle(110, 420, 16, '#ff922b')} ${sparkle(690, 100, 14, '#74c0fc')}`);

  // ================= 3. 六尾 =================
  // 紅咖啡色小狐狸、頭上一撮橘色捲毛、大耳朵、身後六條橘色捲捲的尾巴
  const VUL = '#e8590c', VUL2 = '#ff922b';
  const vulTail = (k, tx, ty) => {
    const dx = tx, dy = ty - 230, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, mx = tx / 2, my = (230 + ty) / 2;
    const c = tx < 0 ? 1 : -1;
    return ear(k, [nx * 26, 230 + ny * 26], [-nx * 26, 230 - ny * 26], [tx, ty], [mx + nx * 80, my + ny * 80], [mx - nx * 56, my - ny * 56], VUL2) +
      k.l(`M ${f1(tx - dx / L * 40 + nx * 6)} ${f1(ty - dy / L * 40 + ny * 6)} Q ${f1(tx + c * 14)} ${f1(ty - 26)} ${f1(tx - dx / L * 18 - nx * 14)} ${f1(ty - dy / L * 18 - ny * 14)}`);
  };
  const vulpixFig = k => sit(k, { body: VUL }, {
    belly: '#ffd8a8',
    tail: k => [[-222, 150], [-190, 60], [-120, 10], [222, 150], [190, 60], [120, 10]].map(([x, y]) => vulTail(k, x, y)).join(''),
    ears: k => ears(k, [-96, -36], [-40, -80], [-170, -150], [-160, -70], [-100, -150], VUL) +
      ears(k, [-86, -50], [-52, -76], [-152, -128], [-140, -76], [-104, -130], '#7a2e0b'),
    top: k => k.p(VUL2, 'M -56 -82 Q -76 -112 -50 -126 Q -42 -150 -14 -140 Q 0 -164 22 -142 Q 50 -150 54 -122 Q 78 -110 56 -82 Q 0 -66 -56 -82 Z') +
      k.l('M -30 -100 Q -40 -116 -24 -122 M 10 -104 Q 4 -124 22 -126'),
  });
  const vulpix = scene(vulpixFig(K(400, 262, 1.02)), 568, `${sparkle(100, 110, 16)} ${sparkle(700, 110, 16, '#ff922b')}`);

  // ================= 4. 綠毛蟲 =================
  // 綠色毛毛蟲（側面）、頭上紅色 Y 字觸角、大眼睛、肚子奶油色、每一節身體有黃色圓點
  const CAT = '#8ce99a';
  const caterpieFig = k =>
    [[250, 150, 46], [170, 136, 56], [80, 122, 64]].map(([x, y, r]) =>
      k.ell(x, y + r * .7, 16, 12, CRM) + k.circ(x, y, r, CAT) + k.ell(x, y + r * .5, r * .78, r * .38, CRM) + k.circ(x + 6, y - r * .3, r * .26, YEL)).join('') +
    k.p(RED, 'M -62 -40 L -60 -96 L -96 -132 L -78 -142 L -48 -112 L -30 -150 L -10 -142 L -38 -96 L -38 -42 Z') +
    k.circ(-60, 40, 96, CAT) +
    k.ell(-62, 98, 66, 30, CRM) +
    k.circ(-104, 18, 34, YEL) + k.eye(-104, 18, 24, 26) +
    k.circ(-6, 6, 24, YEL) + k.eye(-6, 6, 16, 18) +
    k.l('M -128 80 Q -110 92 -92 82');
  const caterpie = scene(caterpieFig(K(380, 290, 1.2)), 0,
    `<path fill="#69db7c" d="M60 560 Q200 500 420 515 Q640 500 760 560 Z"/><path d="M120 548 Q400 520 700 548"/>
    ${sparkle(110, 110, 18)} ${sparkle(690, 110, 16, '#69db7c')}`);

  // ================= 5. 巴大蝶 =================
  // 藍紫色小身體、大大的紅色複眼、捲捲觸角、四片白色翅膀（黑色邊和翅脈）
  const BFLY = '#748ffc';
  const wingUp = 'M -40 -10 Q -120 -170 -250 -150 Q -300 -60 -220 10 Q -140 40 -40 30 Z';
  const wingDn = 'M -40 40 Q -150 60 -190 140 Q -150 210 -70 160 Q -40 120 -30 70 Z';
  const butterfreeFig = k =>
    k.sym('#f8f9fa', wingUp) + k.sym('#343a40', 'M -230 -144 Q -296 -60 -224 4 Q -250 -60 -230 -144 Z') +
    k.symL('M -60 0 Q -140 -60 -200 -110 M -60 14 Q -150 -10 -236 -40') +
    k.sym('#f8f9fa', wingDn) + k.symL('M -50 70 Q -100 110 -150 150') +
    k.ell(0, 110, 50, 70, BFLY) +
    k.ell2(-30, 180, 16, 26, CRM) + k.ell2(-50, 90, 14, 24, BFLY, 30) +
    k.symL('M -30 -82 Q -50 -150 -96 -160 Q -118 -150 -100 -132') +
    k.ell(0, -10, 90, 80, BFLY) +
    k.ell2(-44, -18, 34, 40, '#ff6b6b', -10) + k.shine(-54, -38, 9) + k.shine(34, -38, 9) +
    k.l('M -16 40 Q 0 50 16 40') + k.sym('#fff', 'M -12 42 L -8 54 L -4 45 Z');
  const butterfree = scene(butterfreeFig(K(400, 280, 1.15)), 0,
    `${sparkle(110, 110, 18, '#b197fc')} ${sparkle(690, 500, 16)} ${sparkle(110, 500, 14, '#74c0fc')}`);

  // ================= 6. 瑪力露 =================
  // 藍色圓滾滾的小老鼠、圓耳朵、奶油色肚子、細細的黑色閃電尾巴，尾巴尖是一顆藍色水球
  const MAR = '#4dabf7';
  const marillFig = k =>
    k.p('#343a40', 'M 120 120 L 180 70 L 166 52 L 214 20 L 222 32 L 184 58 L 198 76 L 132 132 Z') +
    k.circ(236, 6, 40, MAR) + k.shine(222, -8, 9) +
    k.ell2(-60, 150, 48, 22, MAR) +
    k.circ(-118, -118, 46, MAR) + k.circ(118, -118, 46, MAR) + k.circ(-118, -118, 26, '#1c7ed6') + k.circ(118, -118, 26, '#1c7ed6') +
    k.circ(0, 0, 150, MAR) +
    k.ell(0, 60, 96, 82, WHITE) +
    k.ell2(-140, 30, 26, 36, MAR, 30) +
    k.eyes(50, -40, 20, 24) +
    k.ell(0, -16, 9, 6, '#ff6b6b') + k.l('M -18 -2 Q -9 8 0 -2 Q 9 8 18 -2');
  const marill = scene(marillFig(K(380, 320, 1.15)), 0,
    `${sparkle(110, 110, 16)} ${sparkle(110, 470, 16, '#74c0fc')} <circle cx="690" cy="470" r="24" fill="${WATER}"/><circle cx="640" cy="520" r="12" fill="${WATER}"/>`);

  // ================= 7. 小拳石 =================
  // 灰色圓石頭、兩隻壯壯的手臂握拳、生氣的眉毛
  const ROCK = '#adb5bd';
  const geodudeFig = k =>
    k.cap([-110, 20], [-200, 0], 60, ROCK) + k.cap([-200, 0], [-230, -80], 56, ROCK) + k.circ(-232, -110, 40, ROCK) +
    k.l('M -250 -128 L -214 -128 M -252 -110 L -214 -110') +
    k.cap([110, 20], [200, 40], 60, ROCK) + k.cap([200, 40], [240, 110], 56, ROCK) + k.circ(246, 136, 40, ROCK) +
    k.p(ROCK, 'M -130 -40 Q -140 -110 -80 -128 Q -40 -150 0 -136 Q 50 -152 90 -124 Q 146 -100 136 -36 Q 156 20 128 70 Q 100 128 30 126 Q -20 140 -70 122 Q -140 100 -140 40 Q -150 0 -130 -40 Z') +
    k.l('M -90 -96 L -70 -80 M 70 90 L 90 76 M 90 -80 L 104 -70') +
    k.symL('M -76 -54 L -24 -30') + k.eyes(46, -18, 12, 15) +
    k.p('#fff', 'M -40 40 Q 0 62 40 40 Q 30 70 0 72 Q -30 70 -40 40 Z');
  const geodude = scene(geodudeFig(K(400, 300, 1.15)), 0,
    `<path d="M150 520 L250 520 M560 540 L650 540 M190 560 L280 560"/>${sparkle(110, 110, 18)} ${sparkle(690, 110, 16, '#74c0fc')}`);

  // ================= 8. 吉利蛋 =================
  // 粉紅色蛋形身體、頭兩邊各三撮捲毛、肚子的口袋裡裝著一顆白色的蛋
  const CHAN = '#ffc9de';
  const chanseyFig = k =>
    k.sym(CHAN, 'M -128 -60 Q -176 -66 -186 -40 Q -160 -40 -150 -30 Q -184 -12 -180 14 Q -156 0 -138 4 Q -160 30 -150 50 Q -130 34 -120 30 Z') +
    k.ell2(-64, 214, 44, 22, CHAN) +
    k.p(CHAN, 'M 0 -170 Q 140 -170 140 40 Q 140 210 0 210 Q -140 210 -140 40 Q -140 -170 0 -170 Z') +
    k.l('M -86 76 Q 0 112 86 76') +
    k.ell(0, 104, 48, 56, '#fff') +
    k.ell2(-52, 96, 22, 32, CHAN, -40) +
    k.eyes(42, -40, 10, 13) +
    k.ell2(-80, -6, 16, 10, '#ff8fab') +
    k.p(MOUTH, 'M -18 4 Q 0 26 18 4 Q 0 10 -18 4 Z');
  const chansey = scene(chanseyFig(K(400, 300, 1.2)), 0,
    `<ellipse cx="400" cy="560" rx="200" ry="20" fill="#e9ecef"/>${sparkle(110, 110, 18, '#ff8fab')} ${sparkle(690, 110, 18)} ${sparkle(120, 420, 14, '#74c0fc')}`);

  // ================= 9. 卡拉卡拉 =================
  // 咖啡色小恐龍、頭上戴著白色骨頭頭盔（後面兩根尖角）、手拿骨頭棒、奶油色肚子
  const CUB = '#c98a4b';
  const cuboneFig = k =>
    k.p(CUB, 'M 50 230 Q 170 250 210 200 Q 214 236 180 258 Q 130 284 60 270 Z') +
    k.cap([-40, 230], [-46, 280], 54, CUB) + k.cap([40, 230], [46, 280], 54, CUB) +
    k.ell2(-50, 290, 38, 16, CRM) +
    k.ell(0, 196, 82, 86, CUB) + k.ell(0, 212, 54, 62, CRM) +
    k.sym(WHITE, 'M -60 -80 L -128 -150 L -30 -104 Z') +
    k.ell(0, 10, 104, 92, CUB) +
    k.p(WHITE, 'M -112 20 Q -122 -112 0 -116 Q 122 -112 112 20 Q 84 -6 56 14 Q 28 -6 0 6 Q -28 -6 -56 14 Q -84 -6 -112 20 Z') +
    k.ell2(-50, -24, 26, 24, '#343a40') + k.eyes(48, -20, 10, 12) +
    k.l('M -6 -64 L 0 -54 L 6 -64') +
    k.ell2(-8, 46, 4, 3, '#222') + k.l('M -26 66 Q 0 78 26 66') +
    // 骨頭棒
    k.cap([96, 280], [150, 80], 24, WHITE) + k.circ(140, 64, 16, WHITE) + k.circ(164, 74, 16, WHITE) +
    k.ell(82, 196, 22, 30, CUB, 20);
  const cubone = scene(cuboneFig(K(380, 262, 1.02)), 568, `${sparkle(110, 110, 18)} ${sparkle(110, 420, 14, '#ff922b')} ${sparkle(690, 470, 16, '#74c0fc')}`);

  // ================= 10. 水伊布 =================
  // 淺藍色身體、像魚鰭的耳朵、脖子一圈白色的鰭、額頭深藍色小鰭、美人魚一樣的尾巴
  const VAP = '#74c0fc', VAP2 = '#1c7ed6';
  const vaporeonFig = k => sit(k, { body: VAP }, {
    tail: k => k.p(VAP, 'M 60 250 Q 200 260 230 160 L 250 168 Q 236 280 66 274 Z') +
      k.p(VAP2, 'M 240 166 Q 190 90 216 40 Q 240 90 258 120 Q 270 80 310 60 Q 312 120 262 172 Z'),
    collar: k => k.p('#e7f5ff', spikyD(0, 116, 70, 34, 9, 24)),
    ears: k => k.sym('#e7f5ff', 'M -84 -48 Q -150 -90 -196 -60 Q -170 -50 -176 -30 Q -150 -40 -150 -16 Q -126 -30 -96 -6 Z'),
    back: k => k.p(VAP2, 'M -26 -86 Q 0 -150 26 -86 Z'),
  });
  const vaporeon = scene(vaporeonFig(K(380, 262, 1.02)), 0, `${sparkle(110, 110, 16, '#74c0fc')} ${sparkle(690, 470, 14)}
    <path fill="${WATER}" d="M0 560 Q100 540 200 560 Q300 580 400 560 Q500 540 600 560 Q700 580 800 560 L800 600 L0 600 Z"/>`);

  // ================= 11. 雷伊布 =================
  // 黃色刺刺的毛、脖子一圈白色尖尖的領子、長長的尖耳朵、頭頂也是刺刺的
  const JOL = '#ffe066';
  const jolteonFig = k => sit(k, { body: JOL }, {
    tail: k => k.p(JOL, 'M 60 250 L 150 230 L 130 210 L 220 190 L 190 170 L 260 120 L 210 120 L 230 80 L 150 140 L 170 160 L 90 200 Z'),
    collar: k => k.p(WHITE, spikyD(0, 118, 76, 40, 12, 26)),
    ears: k => ears(k, [-90, -40], [-40, -80], [-196, -196], [-176, -90], [-90, -170], JOL) +
      ears(k, [-82, -52], [-52, -78], [-178, -172], [-158, -98], [-100, -158], '#fab005'),
    top: k => k.p(JOL, 'M -40 -84 L -30 -120 L -10 -92 L 0 -128 L 12 -92 L 32 -120 L 40 -84 Z'),
  });
  const jolteon = scene(jolteonFig(K(380, 270, 1.05)), 568, `${sparkle(110, 110, 16)} ${sparkle(120, 400, 14, '#74c0fc')}`);

  // ================= 12. 火伊布 =================
  // 橘紅色身體、好大一圈奶油色毛領子、頭頂一撮毛、大大的奶油色蓬蓬尾巴
  const FLA = '#ff8a3d';
  const flareonFig = k => sit(k, { body: FLA }, {
    tail: k => k.p(CRM, fluffD(170, 140, 90, 110, 12, 12)),
    collar: k => k.p(CRM, fluffD(0, 120, 112, 62, 14, 12)),
    ears: k => ears(k, [-94, -44], [-40, -84], [-178, -170], [-166, -80], [-96, -160], FLA) +
      ears(k, [-84, -56], [-52, -80], [-162, -150], [-148, -90], [-104, -146], '#ffd43b'),
    top: k => k.p(CRM, 'M -40 -82 Q -60 -120 -30 -126 Q -16 -150 4 -130 Q 30 -150 40 -118 Q 62 -110 40 -80 Q 0 -70 -40 -82 Z'),
  });
  const flareon = scene(flareonFig(K(380, 270, 1.05)), 568, `${sparkle(110, 110, 16, '#ff922b')} ${sparkle(110, 420, 14)}`);

  // ================= 13. 仙子伊布 =================
  // 白色身體、粉紅色耳朵和尾巴、耳朵旁邊一個蝴蝶結，飄著兩條緞帶、藍眼睛
  const SYL = '#ff8fab', SYL2 = '#74c0fc';
  const sylveonFig = k => sit(k, { body: WHITE, leg: WHITE, feet: SYL }, {
    tail: k => ear(k, [55, 260], [70, 210], [220, 60], [230, 230], [110, 120], SYL),
    collar: k => '',
    ears: k => ears(k, [-90, -46], [-36, -84], [-176, -170], [-166, -80], [-96, -160], SYL) +
      ears(k, [-82, -58], [-50, -80], [-160, -150], [-148, -90], [-102, -146], SYL2),
    back: k => k.p(SYL, 'M 70 -50 Q -60 -10 -110 50 Q -150 100 -160 160 L -182 156 Q -170 84 -126 34 Q -70 -30 64 -74 Z') +
      k.p(SYL2, 'M -160 160 L -182 156 Q -180 140 -176 126 Q -162 130 -158 142 Z'),
    top: k => k.p(SYL, 'M 96 -40 Q 200 0 190 120 Q 186 180 214 226 L 194 238 Q 162 186 166 120 Q 170 20 86 -20 Z') +
      k.p(SYL2, 'M 214 226 L 194 238 Q 186 222 182 206 Q 196 200 206 210 Z') +
      k.ell(78, -76, 26, 18, SYL, -30) + k.ell(110, -40, 26, 18, SYL, 40) + k.circ(92, -56, 13, SYL2),
    face: k => k.ell2(-42, -6, 20, 26, '#4dabf7') + k.ell2(-42, -2, 10, 14, '#222') + k.shine(-48, -18, 7) + k.shine(36, -18, 7) +
      nose(k) + catMouth(k),
  });
  const sylveon = scene(sylveonFig(K(370, 262, 1.02)), 568, `${sparkle(110, 110, 18, '#ff8fab')} ${sparkle(110, 420, 14, '#74c0fc')} ${sparkle(690, 110, 14)}`);

  // ================= 14. 菊草葉 =================
  // 淡綠色小恐龍、頭上一片大葉子、脖子一圈深綠色的小芽、紅眼睛
  const CHIK = '#c0eb75', CHIK2 = '#5c940d';
  const chikoritaFig = k =>
    k.p(CHIK, 'M 60 230 Q 150 250 180 210 Q 186 246 150 266 Q 110 284 64 270 Z') +
    k.cap([-40, 220], [-46, 280], 52, CHIK) + k.cap([40, 220], [46, 280], 52, CHIK) +
    k.ell2(-50, 290, 36, 16, CHIK) +
    k.ell(0, 200, 84, 84, CHIK) +
    k.p(CHIK2, spikyD(0, 112, 72, 30, 10, 18)) +
    k.p(LEAF, 'M 10 -90 Q -40 -190 40 -280 Q 140 -240 60 -110 Q 40 -90 10 -90 Z') + k.l('M 20 -92 Q 40 -180 40 -280') +
    k.ell(0, 0, 106, 96, CHIK) +
    k.ell2(-44, -6, 20, 26, '#e03131') + k.eyes(40, -2, 9, 12) +
    k.ell2(-74, 30, 14, 9, '#ffa8a8') +
    k.p(MOUTH, 'M -22 34 Q 0 58 22 34 Q 0 42 -22 34 Z');
  const chikorita = scene(chikoritaFig(K(390, 290, .92)), 568, `${sparkle(110, 110, 18, '#69db7c')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14)}`);

  // ================= 15. 火球鼠 =================
  // 側面四腳趴著、背上深藍色、肚子奶油色、背上冒出紅色火焰、眼睛瞇瞇的、尖尖的鼻子
  const NAVY = '#3b5bdb', CYN = '#ffe8a3';
  const cyndaquilFig = k =>
    k.p(RED, 'M -40 30 Q -70 -40 -30 -90 Q -26 -50 0 -40 Q -6 -100 40 -130 Q 40 -80 70 -64 Q 80 -110 126 -126 Q 110 -76 136 -50 Q 166 -80 204 -76 Q 176 -36 190 30 Z') +
    k.p(YEL, 'M -10 30 Q -24 -14 0 -30 Q 10 -6 34 -6 Q 40 -50 74 -60 Q 70 -24 96 -16 Q 116 -34 140 -30 Q 120 0 136 30 Z') +
    k.cap([150, 120], [156, 186], 46, CYN) + k.cap([-30, 120], [-34, 186], 46, CYN) +
    k.ell(80, 100, 150, 80, NAVY) +
    k.p(CYN, 'M -40 120 Q 80 70 210 110 Q 190 172 80 176 Q -20 172 -40 120 Z') +
    k.cap([110, 130], [114, 190], 50, CYN) + k.cap([10, 130], [6, 190], 50, CYN) +
    k.p(CYN, 'M -206 70 Q -290 56 -304 88 Q -290 114 -214 108 Z') + k.ell(-302, 88, 8, 7, '#222') +
    k.ell(-150, 70, 96, 76, NAVY) +
    k.p(CYN, 'M -236 80 Q -150 46 -64 80 Q -84 140 -150 144 Q -216 140 -236 80 Z') +
    k.l('M -200 52 Q -180 40 -160 52') +
    k.p(MOUTH, 'M -240 100 Q -220 116 -196 106 Q -218 98 -240 100 Z');
  const cyndaquil = scene(cyndaquilFig(K(440, 330, 1.1)), 560, `${sparkle(110, 110, 18, '#ff922b')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14)}`);

  // ================= 16. 小鋸鱷 =================
  // 藍色小鱷魚、大嘴巴張開（白牙齒）、頭上和背上紅色的尖刺、胸口黃色 V 字花紋、紅眼睛
  const TOTO = '#4dabf7';
  const totodileFig = k =>
    k.p(TOTO, 'M 50 230 Q 180 250 230 190 Q 240 236 200 262 Q 130 290 60 272 Z') +
    k.p(RED, 'M 150 252 L 176 280 L 186 248 Z M 190 236 L 222 256 L 220 222 Z') +
    k.p(RED, 'M 60 100 L 120 80 L 90 130 Z M 70 150 L 130 140 L 92 180 Z') +
    k.cap([-40, 230], [-46, 280], 54, TOTO) + k.cap([40, 230], [46, 280], 54, TOTO) +
    k.ell2(-50, 290, 38, 16, TOTO) +
    k.ell(0, 196, 82, 86, TOTO) +
    k.p(YEL, 'M -70 150 L 0 220 L 70 150 L 70 176 L 0 246 L -70 176 Z') +
    k.ell2(-84, 176, 18, 30, TOTO, 30) +
    k.p(RED, 'M -30 -86 L -20 -136 L 0 -100 L 16 -140 L 30 -88 Z') +
    k.p(TOTO, 'M -110 -10 Q -110 -96 0 -98 Q 110 -96 110 -10 Q 112 96 0 96 Q -112 96 -110 -10 Z') +
    k.p(MOUTH, 'M -84 14 Q 0 44 84 14 Q 70 70 0 74 Q -70 70 -84 14 Z') +
    k.p('#fff', 'M -70 22 L -60 42 L -48 27 Z') + k.p('#fff', 'M 70 22 L 60 42 L 48 27 Z') +
    k.ell2(-40, -38, 18, 22, '#e03131') + k.eyes(40, -36, 10, 13) +
    k.ell2(-14, -6, 4, 3, '#222');
  const totodile = scene(totodileFig(K(380, 250, 1.05)), 568, `${sparkle(110, 110, 18, '#74c0fc')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14, '#ff6b6b')}`);

  // ================= 17. 謎擬Q =================
  // 披著皮卡丘樣子的黃色布：一隻耳朵垂下來、畫上去的眼睛和嘴巴、紅臉頰；布底下黑黑的地方露出兩隻小眼睛
  const MIMI = '#ffe066';
  const mimikyuFig = k =>
    k.p(BRN, 'M 80 140 L 150 100 L 136 80 L 200 40 L 210 54 L 160 88 L 172 106 L 96 156 Z') +
    k.p(MIMI, 'M -40 -100 L -60 -230 L 0 -110 Z') + k.p('#343a40', 'M -54 -190 L -60 -230 L -40 -184 Z') +
    k.p(MIMI, 'M 50 -96 Q 120 -170 190 -130 L 176 -112 Q 120 -140 70 -80 Z') + k.p('#343a40', 'M 166 -140 Q 180 -136 190 -130 L 176 -112 Q 168 -118 158 -122 Z') +
    k.p(MIMI, 'M -150 210 Q -170 120 -130 20 Q -110 -110 0 -112 Q 110 -110 130 20 Q 170 120 150 210 Q 120 190 90 214 Q 60 190 30 214 Q 0 190 -30 214 Q -60 190 -90 214 Q -120 190 -150 210 Z') +
    k.p('#343a40', 'M -100 196 Q -40 150 40 160 Q 90 166 110 198 Q 90 190 70 210 Q 50 190 30 214 Q 0 190 -30 214 Q -60 190 -90 214 Z') +
    k.circ(-30, 184, 8, '#fff') + k.circ(10, 184, 8, '#fff') +
    k.l('M -64 -30 Q -50 -50 -40 -28 Q -54 -10 -64 -30 M 40 -30 Q 54 -50 64 -28 Q 50 -10 40 -30') +
    k.circ(-90, 20, 20, RED) + k.circ(90, 20, 20, RED) +
    k.l('M -36 30 Q -18 50 0 30 Q 18 50 36 30') +
    k.l('M -120 120 L -90 136 M 100 110 L 130 126');
  const mimikyu = scene(mimikyuFig(K(390, 300, 1.12)), 0,
    `<ellipse cx="390" cy="545" rx="200" ry="22" fill="#e9ecef"/>${sparkle(110, 110, 16, '#b197fc')} ${sparkle(690, 110, 16)} ${sparkle(110, 440, 14)}`);

  // ================= 18. 木木梟 =================
  // 圓滾滾的貓頭鷹寶寶：咖啡色身體、白色臉、脖子上綠色葉子領結、橘色嘴巴和腳
  const ROW = '#d9b38c';
  const rowletFig = k =>
    k.ell2(-56, 170, 34, 16, ORG) +
    k.p(ROW, 'M 0 -150 Q 170 -150 170 30 Q 170 180 0 180 Q -170 180 -170 30 Q -170 -150 0 -150 Z') +
    k.p(WHITE, 'M -60 140 Q -40 110 -20 140 Q 0 110 20 140 Q 40 110 60 140 Q 40 175 0 176 Q -40 175 -60 140 Z') +
    k.ell2(-160, 50, 32, 60, ROW, 10) +
    k.p(WHITE, 'M 0 -60 Q 40 -110 100 -90 Q 150 -60 130 0 Q 100 60 0 60 Q -100 60 -130 0 Q -150 -60 -100 -90 Q -40 -110 0 -60 Z') +
    k.eyes(60, -16, 22, 26) +
    k.p(ORG, 'M -14 6 L 14 6 L 0 26 Z') +
    k.p(LEAF, 'M 0 76 Q -60 40 -80 90 Q -50 120 0 90 Z') + k.p(LEAF, 'M 0 76 Q 60 40 80 90 Q 50 120 0 90 Z') +
    k.circ(0, 84, 12, '#40c057') +
    k.p(ROW, 'M -30 -146 Q -40 -180 -10 -184 Q 0 -160 0 -150 Z');
  const rowlet = scene(rowletFig(K(400, 320, 1.25)), 548, `${sparkle(110, 110, 18, '#69db7c')} ${sparkle(690, 110, 16)} ${sparkle(110, 430, 14)}`);

  // ================= 19. 火斑喵 =================
  // 黑色小貓、頭上和臉頰紅色條紋、脖子一圈紅色、大大的尖耳朵、黃眼睛
  const LIT = '#495057', LITR = '#fa5252';
  const littenFig = k => sit(k, { body: LIT }, {
    tail: k => k.p(LIT, 'M 60 250 Q 200 260 220 160 L 240 164 Q 230 280 66 274 Z'),
    collar: k => k.p(LITR, 'M -66 106 Q 0 132 66 106 L 70 128 Q 0 156 -70 128 Z'),
    ears: k => ears(k, [-98, -36], [-36, -84], [-160, -170], [-150, -70], [-90, -160], LIT) +
      ears(k, [-88, -50], [-50, -80], [-146, -146], [-136, -80], [-96, -142], '#adb5bd'),
    top: k => k.p(LITR, 'M -30 -88 Q 0 -100 30 -88 L 20 -60 Q 0 -68 -20 -60 Z') +
      k.sym(LITR, 'M -106 10 L -72 18 L -104 28 Z') + k.ell(0, 30, 40, 26, '#adb5bd'),
    face: k => k.ell2(-42, -10, 22, 24, '#ffd43b') + k.ell2(-42, -8, 6, 16, '#222') + k.shine(-46, -20, 5) + k.shine(38, -20, 5) +
      k.p(MOUTH, 'M -7 18 L 7 18 L 0 25 Z') + k.l('M 0 25 Q -9 38 -18 32 M 0 25 Q 9 38 18 32'),
  });
  const litten = scene(littenFig(K(380, 270, 1.05)), 568, `${sparkle(110, 110, 18, '#ff6b6b')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14)}`);

  // ================= 20. 球球海獅 =================
  // 藍色小海獅、淺藍色頭、脖子一圈白色衣領、粉紅色圓鼻子、藍色大眼睛、鰭狀的手
  const POP = '#4dabf7', POP2 = '#a5d8ff';
  const popplioFig = k =>
    k.p(POP, 'M 60 230 Q 150 240 200 200 Q 240 220 230 260 Q 260 270 250 300 Q 200 300 170 270 Q 120 290 60 270 Z') +
    k.ell(0, 200, 90, 90, POP) +
    k.p(POP, 'M -70 170 Q -150 200 -180 270 Q -110 280 -60 220 Z') + k.p(POP, 'M 70 170 Q 150 200 180 270 Q 110 280 60 220 Z') +
    k.p(WHITE, 'M -96 96 Q -110 140 -70 140 Q -50 160 -30 140 Q 0 164 30 140 Q 50 160 70 140 Q 110 140 96 96 Z') +
    k.ell(0, 0, 110, 100, POP2) +
    k.p(POP2, 'M -20 -96 Q -30 -140 10 -150 Q 40 -150 34 -126 Q 20 -136 12 -124 Q 20 -110 20 -96 Z') +
    k.ell(0, 40, 72, 46, WHITE) +
    k.ell2(-46, -14, 22, 28, '#1c7ed6') + k.ell2(-46, -10, 11, 15, '#222') + k.shine(-52, -26, 8) + k.shine(40, -26, 8) +
    k.circ(0, 26, 22, '#ff8fab') + k.shine(-6, 18, 6) +
    k.l('M -20 62 Q 0 72 20 62') +
    k.symL('M -50 40 L -84 34 M -50 52 L -84 56');
  const popplio = scene(popplioFig(K(380, 250, 1.05)), 0,
    `<path fill="${WATER}" d="M0 540 Q100 520 200 540 Q300 560 400 540 Q500 520 600 540 Q700 560 800 540 L800 600 L0 600 Z"/>
    <circle cx="660" cy="130" r="40" fill="#d0ebff"/><circle cx="600" cy="80" r="18" fill="#d0ebff"/>${sparkle(110, 110, 16, '#74c0fc')}`);

  // ================= 21. 敲音猴 =================
  // 綠色小猴子、奶油色心形的臉、大耳朵、頭上插著一根小樹枝（有一片葉子）、捲捲尾巴
  const GRK = '#51cf66', GRKF = '#ffe8cc';
  const grookeyFig = k =>
    k.p(GRK, 'M 60 230 Q 200 260 210 160 Q 210 120 170 130 L 176 150 Q 190 236 66 254 Z') +
    k.cap([-40, 230], [-46, 280], 52, GRK) + k.cap([40, 230], [46, 280], 52, GRK) +
    k.ell2(-50, 290, 38, 16, GRKF) +
    k.ell(0, 196, 80, 84, GRK) + k.ell(0, 212, 50, 56, GRKF) +
    k.ell2(-82, 170, 18, 30, GRK, 30) +
    k.cap([20, -60], [80, -190], 18, BRN) + k.p(LEAF, 'M 70 -170 Q 120 -210 150 -170 Q 110 -140 70 -170 Z') +
    k.circ(-116, -10, 40, GRK) + k.circ(116, -10, 40, GRK) + k.circ(-116, -10, 22, '#ffa94d') + k.circ(116, -10, 22, '#ffa94d') +
    k.ell(0, 0, 104, 94, GRK) +
    k.p(GRKF, 'M 0 -40 Q 30 -80 70 -50 Q 96 -10 70 40 Q 40 80 0 80 Q -40 80 -70 40 Q -96 -10 -70 -50 Q -30 -80 0 -40 Z') +
    k.p(GRK, 'M -50 -76 Q -30 -110 0 -90 Q 30 -110 50 -76 Q 0 -56 -50 -76 Z') +
    k.eyes(36, -8, 15, 20) + k.ell(0, 20, 9, 6, '#d9480f') +
    k.p(MOUTH, 'M -22 40 Q 0 64 22 40 Q 0 48 -22 40 Z');
  const grookey = scene(grookeyFig(K(380, 270, 1.02)), 568, `${sparkle(110, 110, 18, '#69db7c')} ${sparkle(110, 420, 14)} ${sparkle(690, 470, 14, '#ffa94d')}`);

  // ================= 22. 炎兔兒 =================
  // 白色小兔子、長耳朵、鼻子上一條橘色的帶子 + 黃色鼻頭、紅色的腳
  const SCOR = WHITE;
  const scorbunnyFig = k =>
    k.cap([-36, 230], [-46, 280], 46, SCOR) + k.cap([36, 230], [46, 280], 46, SCOR) +
    k.ell2(-54, 292, 44, 20, '#fa5252') + k.ell2(-54, 296, 20, 10, '#ffd43b') +
    k.ell(0, 178, 74, 90, SCOR) +
    k.ell2(-78, 150, 16, 30, SCOR, 30) +
    ears(k, [-60, -70], [-20, -86], [-96, -260], [-110, -160], [-40, -250], SCOR) +
    ears(k, [-54, -86], [-30, -92], [-86, -230], [-96, -160], [-50, -224], '#ffc9c9') +
    k.ell(0, 0, 100, 90, SCOR) +
    k.p('#ff922b', 'M -50 4 Q 0 -10 50 4 L 50 22 Q 0 8 -50 22 Z') +
    k.ell(0, 22, 18, 14, '#ffd43b') +
    k.eyes(40, -24, 15, 20) +
    k.ell2(-70, 20, 12, 8, '#ffa8a8') +
    k.p(MOUTH, 'M -14 44 Q 0 64 14 44 Q 0 50 -14 44 Z');
  const scorbunny = scene(scorbunnyFig(K(390, 290, 1.0)), 568, `${sparkle(110, 110, 18, '#ff922b')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14, '#ff6b6b')}`);

  // ================= 23. 淚眼蜥 =================
  // 藍色小蜥蜴、頭後面黃色的鰭、水汪汪的大眼睛（有一滴眼淚）、尾巴一圈一圈的花紋
  const SOB = '#74c0fc', SOB2 = '#1c7ed6';
  const sobbleFig = k =>
    k.p(SOB, 'M 50 230 Q 180 250 230 170 L 252 180 Q 220 276 60 272 Z') +
    k.l('M 120 254 L 130 238 M 170 240 L 184 222 M 210 214 L 226 200') +
    k.cap([-36, 230], [-42, 280], 44, SOB) + k.cap([36, 230], [42, 280], 44, SOB) +
    k.ell2(-46, 290, 34, 14, SOB) +
    k.ell(0, 180, 70, 92, SOB) + k.ell(0, 196, 44, 62, '#d0ebff') +
    k.ell2(-74, 150, 14, 28, SOB, 30) +
    k.p(YEL, 'M -60 -70 Q -110 -170 -30 -150 Q 0 -200 30 -150 Q 110 -170 60 -70 Z') +
    k.l('M 0 -150 L 0 -100 M -30 -150 L -18 -98 M 30 -150 L 18 -98') +
    k.ell(0, 0, 104, 92, SOB) +
    k.ell2(-44, 0, 26, 30, SOB2) + k.ell2(-44, 4, 14, 18, '#222') + k.shine(-52, -10, 8) + k.shine(36, -10, 8) +
    k.p(WATER, 'M -74 34 Q -84 50 -74 58 Q -64 50 -74 34 Z') +
    k.l('M -14 46 Q 0 38 14 46');
  const sobble = scene(sobbleFig(K(380, 280, 1.02)), 568, `${sparkle(110, 110, 18, '#74c0fc')} ${sparkle(690, 110, 16)} <circle cx="120" cy="420" r="18" fill="${WATER}"/>`);

  // ================= 24. 呆火鱷 =================
  // 紅色小鱷魚、好大的圓頭、白色肚子、頭頂一撮白色像火焰的毛、小小的手腳
  const FUE = '#ff6b6b';
  const fuecocoFig = k =>
    k.p(FUE, 'M 50 210 Q 140 230 170 190 Q 180 226 140 246 Q 100 262 56 250 Z') +
    k.cap([-34, 210], [-40, 252], 44, FUE) + k.cap([34, 210], [40, 252], 44, FUE) +
    k.ell2(-44, 262, 32, 14, FUE) +
    k.ell(0, 184, 70, 70, FUE) + k.ell(0, 196, 46, 50, WHITE) +
    k.ell2(-70, 160, 14, 24, FUE, 30) +
    k.p(CRM, 'M -50 -110 L -40 -160 L -20 -124 L 0 -176 L 20 -124 L 40 -160 L 50 -110 Z') +
    k.ell(0, 0, 140, 116, FUE) +
    k.ell(0, 60, 90, 40, '#ffc9c9') +
    k.l('M -100 40 Q 0 76 100 40') +
    k.p('#fff', 'M 40 52 L 48 30 L 56 54 Z') +
    k.eyes(56, -24, 14, 18) +
    k.ell2(-12, 0, 4, 3, '#222');
  const fuecoco = scene(fuecocoFig(K(400, 300, 1.1)), 584, `${sparkle(110, 110, 18, '#ff6b6b')} ${sparkle(690, 110, 16)} ${sparkle(110, 420, 14)}`);

  // ================= 25. 潤水鴨 =================
  // 白色小鴨子、頭上一撮梳得高高的藍色頭髮、黃色嘴巴和腳、藍眼睛
  const QUAX = WHITE, QBLU = '#4dabf7';
  const quaxlyFig = k =>
    k.p(YEL, 'M -60 270 L -20 270 L -40 236 Z') + k.p(YEL, 'M 20 270 L 60 270 L 40 236 Z') +
    k.ell(0, 190, 84, 84, QUAX) +
    k.p(QUAX, 'M -80 170 Q -140 190 -130 240 Q -100 230 -76 210 Z') + k.p(QUAX, 'M 80 170 Q 140 190 130 240 Q 100 230 76 210 Z') +
    k.ell(0, 0, 100, 94, QUAX) +
    k.p(QBLU, 'M -90 -40 Q -110 -120 -20 -130 Q 60 -160 120 -110 Q 70 -110 70 -80 Q 40 -100 10 -70 Q -40 -80 -90 -40 Z') +
    k.ell2(-40, -4, 20, 24, QBLU) + k.ell2(-40, 0, 10, 14, '#222') + k.shine(-46, -10, 6) + k.shine(34, -10, 6) +
    k.p(YEL, 'M -44 34 Q 0 18 44 34 Q 50 60 0 66 Q -50 60 -44 34 Z') + k.l('M -40 44 Q 0 52 40 44');
  const quaxly = scene(quaxlyFig(K(390, 280, 1.08)), 572, `${sparkle(110, 110, 18, '#74c0fc')} ${sparkle(690, 110, 16)} <circle cx="680" cy="440" r="26" fill="${WATER}"/>`);

  window.ART.addPack({
    categories: [],
    drawings: [
      { id: 'pk-mewtwo', cat: 'poke', name: '超夢', en: 'Mewtwo', svg: mewtwo },
      { id: 'pk-growlithe', cat: 'poke', name: '卡蒂狗', en: 'Growlithe', svg: growlithe },
      { id: 'pk-vulpix', cat: 'poke', name: '六尾', en: 'Vulpix', svg: vulpix },
      { id: 'pk-caterpie', cat: 'poke', name: '綠毛蟲', en: 'Caterpie', svg: caterpie },
      { id: 'pk-butterfree', cat: 'poke', name: '巴大蝶', en: 'Butterfree', svg: butterfree },
      { id: 'pk-marill', cat: 'poke', name: '瑪力露', en: 'Marill', svg: marill },
      { id: 'pk-geodude', cat: 'poke', name: '小拳石', en: 'Geodude', svg: geodude },
      { id: 'pk-chansey', cat: 'poke', name: '吉利蛋', en: 'Chansey', svg: chansey },
      { id: 'pk-cubone', cat: 'poke', name: '卡拉卡拉', en: 'Cubone', svg: cubone },
      { id: 'pk-vaporeon', cat: 'poke', name: '水伊布', en: 'Vaporeon', svg: vaporeon },
      { id: 'pk-jolteon', cat: 'poke', name: '雷伊布', en: 'Jolteon', svg: jolteon },
      { id: 'pk-flareon', cat: 'poke', name: '火伊布', en: 'Flareon', svg: flareon },
      { id: 'pk-sylveon', cat: 'poke', name: '仙子伊布', en: 'Sylveon', svg: sylveon },
      { id: 'pk-chikorita', cat: 'poke', name: '菊草葉', en: 'Chikorita', svg: chikorita },
      { id: 'pk-cyndaquil', cat: 'poke', name: '火球鼠', en: 'Cyndaquil', svg: cyndaquil },
      { id: 'pk-totodile', cat: 'poke', name: '小鋸鱷', en: 'Totodile', svg: totodile },
      { id: 'pk-mimikyu', cat: 'poke', name: '謎擬Q', en: 'Mimikyu', svg: mimikyu },
      { id: 'pk-rowlet', cat: 'poke', name: '木木梟', en: 'Rowlet', svg: rowlet },
      { id: 'pk-litten', cat: 'poke', name: '火斑喵', en: 'Litten', svg: litten },
      { id: 'pk-popplio', cat: 'poke', name: '球球海獅', en: 'Popplio', svg: popplio },
      { id: 'pk-grookey', cat: 'poke', name: '敲音猴', en: 'Grookey', svg: grookey },
      { id: 'pk-scorbunny', cat: 'poke', name: '炎兔兒', en: 'Scorbunny', svg: scorbunny },
      { id: 'pk-sobble', cat: 'poke', name: '淚眼蜥', en: 'Sobble', svg: sobble },
      { id: 'pk-fuecoco', cat: 'poke', name: '呆火鱷', en: 'Fuecoco', svg: fuecoco },
      { id: 'pk-quaxly', cat: 'poke', name: '潤水鴨', en: 'Quaxly', svg: quaxly },
    ],
  });
  // 精靈球放回寶可夢的最後面
  const D = window.ART.DRAWINGS, i = D.findIndex(d => d.id === 'pk-pokeball');
  if (i >= 0) {
    const [ball] = D.splice(i, 1);
    let last = -1;
    D.forEach((d, j) => { if (d.cat === 'poke') last = j; });
    D.splice(last + 1, 0, ball);
  }
})();
