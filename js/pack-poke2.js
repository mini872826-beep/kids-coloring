/* 線稿包：寶可夢（Q 版，第 2 包）
 * 共用小工具（身體座標、尖耳朵、閃電、音符⋯⋯）在 pack-poke.js 裡，放在 ART.helpers.poke。 */
(function () {
  const { sparkle, ground } = window.ART.helpers;
  const { K, ear, ears, zz, f1, shrinkD, quad } = window.ART.helpers.poke;

  // ---- 顏色 ----
  const YEL = '#ffd43b', RED = '#ff6b6b', BRN = '#a9713c', PINK = '#ffa8c5', MOUTH = '#ff8787',
    ORG = '#ff922b', CRM = '#fff3bf', BLU = '#74c0fc', WHITE = '#f8f9fa', TEAL = '#8ce0c8', TEAL2 = '#38b39a',
    LEAF = '#69db7c', PUR = '#b197fc', GRAY = '#ced4da', SHELL = '#c98a4b', WATER = '#a5d8ff';

  // 水面（畫面下方一整條波浪）
  const water = (y, c = WATER) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 800; x += 100) d += ` Q${x + 25} ${y - 22} ${x + 50} ${y} Q${x + 75} ${y + 22} ${x + 100} ${y}`;
    return `<path fill="${c}" d="${d} L800 600 L0 600 Z"/>`;
  };
  // 彎彎的月亮
  const moon = (x, y, r = 50) =>
    `<path fill="#ffe066" d="M${x} ${y - r} Q${x - r * 1.6} ${y} ${x} ${y + r} Q${x - r * .7} ${y} ${x} ${y - r} Z"/>`;
  // 大肚子上一條一條的橫紋（橢圓 cx, cy, rx, ry 內，在 ys 這些高度畫線，線頭剛好碰到邊）
  const stripes = (k, cx, cy, rx, ry, ys) => ys.map(y => {
    const w = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2));
    return k.l(`M ${f1(cx - w)} ${y} Q ${cx} ${y + 10} ${f1(cx + w)} ${y}`);
  }).join('');

  // ================= 13. 快龍 =================
  // 橘色胖龍、奶油色肚子一條一條、背後綠色小翅膀、頭上兩根觸角
  const dragoniteFig = k =>
    k.p(ORG, 'M 60 230 Q 200 262 238 176 Q 262 214 238 246 Q 196 296 70 272 Z') +
    k.sym('#63e6be', 'M -60 120 Q -150 30 -205 74 Q -180 96 -190 124 Q -156 114 -152 146 Q -112 130 -76 160 Z') +
    k.ell(0, 200, 98, 96, ORG) +
    k.ell(0, 216, 64, 74, CRM) + stripes(k, 0, 216, 64, 74, [176, 206, 236, 264]) +
    k.ell2(-50, 292, 44, 20, ORG) +
    k.ell2(-96, 158, 22, 36, ORG, 35) +
    k.l('M -30 -92 Q -42 -150 -92 -176') + k.l('M 30 -92 Q 42 -150 92 -176') +
    k.p(ORG, 'M -14 -92 Q 0 -128 14 -92 Z') +
    k.ell(0, 0, 112, 98, ORG) +
    k.eyes(40, -12, 16, 23) +
    k.ell2(-74, 26, 15, 9, PINK) +
    k.ell2(-8, 14, 4, 3, '#222') +
    k.p(MOUTH, 'M -32 34 Q 0 74 32 34 Q 0 46 -32 34 Z');
  const dragonite = `
    <path fill="#e7f5ff" d="M60 150 Q55 110 95 112 Q110 80 150 92 Q185 85 190 120 Q215 130 205 150 Z"/>
    <path fill="#e7f5ff" d="M580 110 Q575 75 610 78 Q625 50 660 62 Q690 58 693 88 Q715 98 706 110 Z"/>
    ${dragoniteFig(K(390, 255, 1.02))}
    ${ground(560)}
    ${sparkle(120, 400, 16)} ${sparkle(700, 470, 14, '#63e6be')}`;

  // ================= 14. 夢幻 =================
  // 粉紅小貓樣子、飄在空中、大大的藍眼睛、細長尾巴尖端圓圓的
  const mewFig = k =>
    k.p(PINK, 'M 40 186 Q 200 262 228 122 Q 240 46 196 -14 L 214 -26 Q 266 44 250 128 Q 220 290 40 214 Z') +
    k.ell(206, -42, 24, 36, PINK, -30) +
    k.ell2(-40, 232, 26, 36, PINK, 15) +
    k.ell(0, 168, 64, 72, PINK) +
    k.ell2(-66, 140, 16, 27, PINK, 40) +
    ears(k, [-98, -46], [-46, -88], [-150, -150], [-140, -86], [-90, -140], PINK) +
    k.ell(0, 0, 112, 98, PINK) +
    k.ell2(-42, -6, 27, 33, '#4dabf7') + k.ell2(-42, 0, 14, 18, '#222') + k.shine(-50, -18, 10) + k.shine(34, -18, 10) +
    k.ell2(-80, 30, 14, 8, '#ff8fab') +
    k.l('M -14 36 Q 0 46 14 36');
  const mew = `
    ${mewFig(K(380, 250, 1.12))}
    <circle cx="120" cy="140" r="34" fill="#e5dbff"/><circle cx="175" cy="90" r="16" fill="#e5dbff"/>
    <circle cx="690" cy="300" r="30" fill="#e5dbff"/><circle cx="120" cy="470" r="22" fill="#e5dbff"/>
    ${sparkle(700, 120, 18, '#ff8fab')} ${sparkle(170, 330, 14)} ${sparkle(600, 560, 14, '#74c0fc')}`;

  // ================= 15. 波克比 =================
  // 鋸齒邊的蛋殼身體（上面有紅色、藍色的花紋）、頭上一圈尖尖的小刺
  const zig = Array.from({ length: 11 }, (_, i) => `L ${-120 + i * 24} ${i % 2 ? -12 : 18}`).join(' ');
  const togepiFig = k =>
    k.ell2(-52, 206, 34, 20, CRM) +
    k.p(CRM, 'M -62 -118 L -56 -180 L -24 -140 L 0 -198 L 24 -140 L 56 -180 L 62 -118 Z') +
    k.ell(0, -62, 98, 88, CRM) +
    k.eyes(36, -72, 15, 21) +
    k.ell2(-68, -40, 14, 8, PINK) +
    k.p(MOUTH, 'M -16 -40 Q 0 -16 16 -40 Q 0 -34 -16 -40 Z') +
    k.p(WHITE, `M -126 18 ${zig} L 126 18 Q 132 196 0 196 Q -132 196 -126 18 Z`) +
    k.p(RED, 'M -90 66 L -42 52 L -62 112 Z') + k.p(BLU, 'M 34 118 L 84 98 L 74 156 Z') +
    k.p(BLU, 'M -10 150 L 18 168 L -16 180 Z') + k.ell(50, 52, 20, 15, RED) +
    k.ell2(-134, 40, 18, 28, CRM, 30);
  const togepi = `
    ${togepiFig(K(400, 316, 1.2))}
    ${ground(568)}
    ${sparkle(110, 110, 18)} ${sparkle(690, 110, 18, '#ff8fab')} ${sparkle(120, 420, 14, '#74c0fc')} ${sparkle(690, 420, 14)}`;

  // ================= 16. 鯉魚王 =================
  // 紅色大魚跳出水面、皇冠一樣的背鰭、長長的鬍鬚、奶油色厚嘴唇、呆呆的大眼睛
  const FIN = '#ffe8a3', KARP = '#ff8058';
  const magikarpFig = k =>
    k.p(FIN, 'M 120 0 Q 180 -60 240 -100 Q 214 0 240 100 Q 180 60 120 0 Z') +
    k.p(FIN, 'M -70 -88 L -52 -150 L -20 -106 L 14 -158 L 40 -106 L 76 -142 L 86 -80 Z') +
    k.p(FIN, 'M -112 -50 Q -150 -112 -196 -134 L -190 -118 Q -150 -96 -126 -40 Z') +
    k.p(FIN, 'M -112 54 Q -140 96 -178 106 L -172 92 Q -140 82 -126 44 Z') +
    k.ell(0, 0, 155, 108, KARP) +
    k.l('M -40 -40 Q -20 -20 0 -40 Q 20 -20 40 -40 Q 60 -20 80 -40 M -20 10 Q 0 30 20 10 Q 40 30 60 10 Q 80 30 100 10 M -40 60 Q -20 80 0 60 Q 20 80 40 60 Q 60 80 80 60') +
    k.p(CRM, 'M -148 -26 Q -196 -40 -196 4 Q -196 46 -148 32 Q -160 2 -148 -26 Z') +
    k.circ(-92, -28, 30, '#fff') + k.circ(-92, -28, 7, '#222') +
    k.p(FIN, 'M -30 46 Q -6 112 44 104 Q 24 70 26 40 Z');
  const magikarp = `
    ${water(470)}
    ${magikarpFig(K(410, 250, 1.25))}
    <path fill="${WATER}" d="M110 450 Q90 410 120 400 Q130 425 110 450 Z"/><path fill="${WATER}" d="M650 450 Q670 410 640 400 Q630 425 650 450 Z"/>
    <circle cx="160" cy="400" r="12" fill="${WATER}"/><circle cx="690" cy="390" r="14" fill="${WATER}"/>
    ${sparkle(110, 100, 18)} ${sparkle(700, 100, 16, '#74c0fc')}`;

  // ================= 17. 百變怪 =================
  // 紫色軟軟的一團、小小的點點眼睛和簡單的笑臉；旁邊還有一隻小百變怪
  const DIT = '#d0bfff';
  const DITTO = 'M -170 120 Q -205 120 -192 82 Q -170 40 -152 -8 Q -140 -110 -60 -118 Q -22 -150 22 -124 Q 122 -132 150 -40 Q 168 30 196 80 Q 206 120 170 120 Z';
  const dittoFig = k =>
    k.p(DIT, DITTO) +
    k.circ(-38, -38, 9, '#222') + k.circ(38, -38, 9, '#222') +
    k.l('M -46 -2 Q 0 24 46 -2');
  const ditto = `
    <ellipse cx="370" cy="502" rx="270" ry="22" fill="#e9ecef"/>
    ${dittoFig(K(360, 330, 1.35))}
    ${dittoFig(K(672, 450, .45))}
    ${sparkle(110, 100, 18, '#b197fc')} ${sparkle(690, 110, 18)} ${sparkle(700, 300, 14, '#ff8fab')}`;

  // ================= 18. 呆呆獸 =================
  // 粉紅色、奶油色大嘴巴（嘴巴微微張開）、呆呆的大眼睛，坐在池塘邊把尾巴放進水裡釣魚
  const slowFig = k =>
    k.p(PINK, 'M 70 196 Q 214 198 240 256 L 204 272 Q 180 234 70 236 Z') +
    k.ell(0, 192, 100, 84, PINK) +
    k.cap([-52, 200], [-60, 262], 52, PINK) + k.cap([52, 200], [60, 262], 52, PINK) +
    k.symL('M -74 286 L -74 274 M -60 288 L -60 276 M -46 286 L -46 274') +
    k.sym(PINK, 'M -112 -58 Q -136 -100 -100 -112 Q -80 -100 -74 -80 Z') +
    k.ell(0, 0, 128, 100, PINK) +
    k.p(CRM, 'M -88 30 Q -86 -6 0 -2 Q 86 -6 88 30 Q 86 86 0 90 Q -86 86 -88 30 Z') +
    k.l('M -62 46 Q 0 70 62 46') + k.ell2(-14, 16, 4, 3, '#222') +
    k.p(MOUTH, 'M -30 57 Q 0 86 30 57 Q 0 66 -30 57 Z') +
    k.ell2(-50, -36, 27, 26, '#fff') + k.circ(-50, -30, 7, '#222') + k.circ(50, -30, 7, '#222');
  const slowpoke = `
    ${slowFig(K(300, 270, 1.05))}
    <ellipse cx="590" cy="530" rx="180" ry="48" fill="${WATER}"/>
    <path d="M610 540 Q650 525 690 540 M650 515 Q680 505 710 515"/>
    <path fill="#69db7c" d="M740 500 Q730 440 760 400 Q770 450 760 500 Z"/>
    ${sparkle(110, 100, 18)} ${sparkle(620, 120, 16, '#ff8fab')} ${sparkle(720, 260, 14, '#74c0fc')}`;

  // ================= 19. 噴火龍 =================
  // 橘色大龍、張開藍綠色翅膀、頭上兩隻角、尾巴尖端的火焰
  const flame = k =>
    k.p('#ff6b6b', 'M 230 105 C 188 102 178 52 203 16 C 208 36 220 42 226 32 C 220 2 236 -25 254 -42 C 252 -10 280 15 285 50 C 290 86 264 106 230 105 Z') +
    k.p(YEL, 'M 232 96 C 210 93 204 66 217 48 C 223 60 231 60 235 52 C 235 40 241 30 251 22 C 254 45 270 60 266 78 C 262 92 250 97 232 96 Z');
  const WING = 'M -60 100 Q -130 -40 -250 -96 Q -226 -30 -242 34 Q -200 14 -196 64 Q -158 46 -150 96 Q -110 86 -80 136 Z';
  const charizardFig = k =>
    // 翅膀：外面一圈橘色骨架，裡面藍綠色的膜
    k.sym(ORG, WING) + k.sym('#3bc9db', shrinkD(WING, -160, 40, .7)) +
    k.p(ORG, 'M 60 210 Q 200 240 214 96 L 246 100 Q 244 274 68 254 Z') + flame(k) +
    k.ell(0, 200, 96, 96, ORG) + k.ell(0, 216, 60, 72, CRM) +
    k.ell2(-50, 290, 44, 20, ORG) +
    k.ell2(-94, 160, 22, 36, ORG, 35) +
    k.sym(ORG, 'M -66 -60 Q -100 -120 -112 -158 Q -72 -126 -32 -88 Z') +
    k.ell(0, 0, 110, 94, ORG) +
    k.eyes(42, -10, 15, 21) + k.symL('M -66 -42 L -28 -34') +
    k.ell2(-8, 14, 4, 3, '#222') +
    k.p(MOUTH, 'M -40 32 Q 0 82 40 32 Q 0 46 -40 32 Z') +
    k.sym('#fff', 'M -30 37 L -24 52 L -18 39 Z');
  const charizard = `
    ${charizardFig(K(390, 252, 1.02))}
    ${ground(560)}
    ${sparkle(110, 420, 16)} ${sparkle(700, 470, 14, '#ff8787')}`;

  // ================= 20. 水箭龜 =================
  // 藍色大烏龜、咖啡色大殼、肩膀上兩支水砲、黃色肚子分格
  const BLUE2 = '#74c0fc';
  const blastFig = k =>
    k.ell(0, 196, 134, 114, SHELL) +
    // 水砲：從殼裡（肩膀後面）伸出來的兩支粗管子，管口深色
    k.cap([-108, 112], [-138, -14], 56, GRAY) + k.cap([108, 112], [138, -14], 56, GRAY) +
    k.ell(-140, -22, 36, 16, '#adb5bd', -12) + k.ell(140, -22, 36, 16, '#adb5bd', 12) +
    k.ell(-140, -22, 22, 8, '#495057', -12) + k.ell(140, -22, 22, 8, '#495057', 12) +
    k.circ(-104, 112, 36, SHELL) + k.circ(104, 112, 36, SHELL) +
    k.ell2(-56, 294, 48, 22, BLUE2) +
    k.ell(0, 204, 100, 98, WHITE) + k.ell(0, 210, 80, 82, '#ffe066') +
    stripes(k, 0, 210, 80, 82, [180, 236]) + k.l('M 0 128 L 0 292') +
    k.ell2(-122, 204, 30, 48, BLUE2, -12) +
    k.sym(BLUE2, 'M -96 -36 L -122 -96 L -62 -80 Z') +
    k.ell(0, 0, 110, 94, BLUE2) +
    k.eyes(42, -10, 16, 22) + k.symL('M -64 -44 L -26 -36') +
    k.ell2(-8, 14, 4, 3, '#222') +
    k.p(MOUTH, 'M -30 34 Q 0 70 30 34 Q 0 46 -30 34 Z');
  const blastoise = `
    ${blastFig(K(400, 250, 1.03))}
    ${ground(560)}
    <path fill="${WATER}" d="M240 190 Q200 150 230 110 Q250 160 240 190 Z"/><path fill="${WATER}" d="M560 190 Q600 150 570 110 Q550 160 560 190 Z"/>
    <circle cx="200" cy="200" r="12" fill="${WATER}"/><circle cx="600" cy="200" r="12" fill="${WATER}"/>
    ${sparkle(110, 420, 16, '#74c0fc')} ${sparkle(700, 420, 16)}`;

  // ================= 21. 妙蛙花 =================
  // 跟妙蛙種子一樣的四腳身體（大一號），背上咖啡色樹幹撐著大葉子和一朵大花（粉紅花瓣 + 白點點）
  const PETAL = '#ff8fab';
  const petals = k => [-165, -125, -90, -55, -15].map(a => {
    const r = a * Math.PI / 180, x = 100 + Math.cos(r) * 78, y = -118 + Math.sin(r) * 58;
    return k.ell(x, y, 56, 36, PETAL, a) + k.ell(x + Math.cos(r) * 20, y + Math.sin(r) * 14, 9, 6, WHITE, a);
  }).join('');
  const venuFig = k => quad(k, { body: TEAL, spot: TEAL2 }, {
    big: true, brow: true,
    back: k => k.p(BRN, 'M 60 70 L 72 -50 L 128 -50 L 140 70 Z') +
      ear(k, [80, -40], [100, -64], [-150, -70], [-30, 10], [-40, -120], LEAF) +
      ear(k, [120, -40], [100, -64], [350, -60], [240, 20], [240, -110], LEAF) +
      k.l('M 90 -52 Q -20 -60 -150 -70 M 110 -52 Q 230 -56 350 -60') +
      petals(k) + k.ell(100, -100, 46, 28, '#ffe066'),
  });
  const venusaur = `
    ${venuFig(K(410, 330, .98))}
    ${ground(568)}
    ${sparkle(90, 120, 16)} ${sparkle(710, 470, 16, '#ff8fab')}`;

  // ================= 22. 拉普拉斯 =================
  // 藍色長脖子、背上灰色的殼（有圓圓的突起）、頭上一隻小角、捲捲的耳朵，在海上游泳
  const laprasFig = k =>
    k.p(GRAY, 'M -40 50 Q -30 -116 120 -112 Q 236 -96 250 50 Z') +
    [[30, -70], [110, -84], [186, -54], [80, -14], [160, 4]].map(([x, y]) => k.circ(x, y, 16, '#adb5bd')).join('') +
    k.p(BLU, 'M -120 60 Q -40 30 50 40 L 260 40 Q 296 60 270 100 L -110 100 Z') +
    k.p(BLU, 'M -96 50 Q -142 -60 -112 -170 L -52 -170 Q -78 -70 -24 40 Z') +
    k.p(CRM, 'M -96 50 Q -142 -60 -112 -170 L -94 -170 Q -120 -60 -70 46 Z') +
    k.p(BLU, 'M -48 -232 Q -10 -262 4 -226 Q 6 -198 -26 -200 Z') +
    k.p(BLU, 'M -96 -260 Q -88 -310 -70 -258 Z') +
    k.ell(-96, -206, 74, 60, BLU) +
    k.eye(-118, -214, 11, 15) +
    k.ell(-148, -186, 12, 7, PINK) +
    k.l('M -150 -168 Q -130 -156 -112 -168') +
    k.p(BLU, 'M -40 66 Q -130 50 -170 96 Q -100 112 -20 92 Z');
  const lapras = `
    ${laprasFig(K(430, 362, 1.05))}
    ${water(470)}
    <path d="M120 520 Q160 505 200 520 M560 540 Q600 525 640 540"/>
    <circle cx="120" cy="120" r="44" fill="#ffe066"/>
    ${sparkle(700, 110, 18)} ${sparkle(640, 200, 12, '#74c0fc')}`;

  // ================= 23. 皮皮 =================
  // 粉紅色、額頭一撮捲毛、尖耳朵咖啡色耳尖、背上小翅膀、捲捲尾巴；晚上在月亮下跳舞
  const clefFig = k =>
    k.circ(112, 236, 26, PINK) + k.l('M 112 236 Q 100 226 112 218 Q 128 220 126 238 Q 120 254 102 250') +
    k.sym('#fcc2d7', 'M -66 120 Q -150 86 -164 140 Q -134 140 -128 166 Q -102 150 -80 166 Z') +
    k.ell2(-46, 288, 40, 20, PINK) +
    k.ell(0, 204, 86, 88, PINK) +
    k.ell2(-92, 158, 20, 33, PINK, 35) +
    ears(k, [-96, -46], [-40, -84], [-150, -176], [-140, -100], [-88, -160], PINK, .7, BRN) +
    k.ell(0, 0, 112, 98, PINK) +
    k.p(PINK, 'M -26 -90 Q -44 -142 4 -152 Q 46 -152 36 -110 Q 28 -86 0 -86 Z') +
    k.l('M 2 -98 Q -20 -104 -14 -126 Q -4 -142 14 -134 Q 24 -124 16 -114') +
    k.eyes(42, -8, 18, 25) +
    k.ell2(-78, 28, 15, 9, '#ff8fab') +
    k.p(MOUTH, 'M -16 30 Q 0 52 16 30 Q 0 36 -16 30 Z');
  const clefairy = `
    ${moon(660, 110, 64)}
    ${clefFig(K(390, 262))}
    ${ground(560)}
    ${sparkle(110, 110, 18)} ${sparkle(180, 230, 12)} ${sparkle(560, 70, 12)} ${sparkle(700, 420, 16, '#ff8fab')} ${sparkle(110, 440, 14, '#74c0fc')}`;

  // ================= 24. 迷你龍 =================
  // 藍色長長的小蛇龍彎成 S 形、白色嘴巴、頭兩邊白色小翅膀、額頭一個白色小角
  // 彎彎的長條身體：沿著幾個點畫一條平滑的線，再往兩邊撐開成一條管子（從 w0 慢慢變細到 w1）
  function tubeD(pts, w0, w1, n = 60) {
    const at = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
    const cr = t => {
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))), u = t * (pts.length - 1) - seg;
      const p0 = at(seg - 1), p1 = at(seg), p2 = at(seg + 1), p3 = at(seg + 2);
      return [0, 1].map(j => .5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u * u * u));
    };
    const c = Array.from({ length: n + 1 }, (_, i) => cr(i / n)), L = [], R = [];
    c.forEach((p, i) => {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const w = (w0 + (w1 - w0) * i / n) / 2;
      L.push([p[0] - dy / len * w, p[1] + dx / len * w]); R.push([p[0] + dy / len * w, p[1] - dx / len * w]);
    });
    return 'M ' + [...L, ...R.reverse()].map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L ') + ' Z';
  }
  const DRA = '#748ffc';
  const DRA_BODY = tubeD([[0, 30], [-30, 150], [-140, 215], [-100, 285], [60, 290], [200, 250], [262, 160]], 96, 12);
  const dratiniFig = k =>
    k.p(DRA, DRA_BODY) +
    k.sym(WHITE, 'M -78 -30 Q -150 -70 -166 -38 Q -140 -30 -160 -8 Q -130 -4 -150 22 Q -110 18 -82 4 Z') +
    k.ell(0, -102, 12, 18, WHITE) +
    k.ell(0, -20, 96, 84, DRA) +
    k.ell(0, 28, 50, 30, WHITE) +
    k.eyes(38, -28, 16, 22) +
    k.ell2(-8, 20, 4, 3, '#222') +
    k.l('M -20 36 Q 0 50 20 36');
  const dratini = `
    ${water(548)}
    ${dratiniFig(K(400, 185, 1.05))}
    ${sparkle(110, 110, 18, '#748ffc')} ${sparkle(690, 110, 18)} ${sparkle(120, 400, 14)}`;

  // ================= 25. 精靈球 =================
  const pokeball = `
    <ellipse cx="400" cy="540" rx="190" ry="26" fill="#e9ecef"/>
    <path fill="${RED}" d="M200 300 A200 200 0 0 1 600 300 Z"/>
    <path fill="#fff" d="M200 300 A200 200 0 0 0 600 300 Z"/>
    <path fill="#343a40" d="M200.8 282 L599.2 282 L599.2 318 L200.8 318 Z"/>
    <circle cx="400" cy="300" r="64" fill="#343a40"/>
    <circle cx="400" cy="300" r="44" fill="#fff"/>
    <circle cx="400" cy="300" r="24" fill="#f1f3f5"/>
    <path fill="#ffc9c9" d="M270 220 Q290 160 350 140 Q310 180 296 230 Z"/>
    ${sparkle(130, 110, 22)} ${sparkle(680, 110, 22, '#74c0fc')} ${sparkle(110, 420, 16, '#ff8fab')} ${sparkle(700, 430, 16)}`;

  window.ART.addPack({
    categories: [],
    drawings: [
      { id: 'pk-dragonite', cat: 'poke', name: '快龍', en: 'Dragonite', svg: dragonite },
      { id: 'pk-mew', cat: 'poke', name: '夢幻', en: 'Mew', svg: mew },
      { id: 'pk-togepi', cat: 'poke', name: '波克比', en: 'Togepi', svg: togepi },
      { id: 'pk-magikarp', cat: 'poke', name: '鯉魚王', en: 'Magikarp', svg: magikarp },
      { id: 'pk-ditto', cat: 'poke', name: '百變怪', en: 'Ditto', svg: ditto },
      { id: 'pk-slowpoke', cat: 'poke', name: '呆呆獸', en: 'Slowpoke', svg: slowpoke },
      { id: 'pk-charizard', cat: 'poke', name: '噴火龍', en: 'Charizard', svg: charizard },
      { id: 'pk-blastoise', cat: 'poke', name: '水箭龜', en: 'Blastoise', svg: blastoise },
      { id: 'pk-venusaur', cat: 'poke', name: '妙蛙花', en: 'Venusaur', svg: venusaur },
      { id: 'pk-lapras', cat: 'poke', name: '拉普拉斯', en: 'Lapras', svg: lapras },
      { id: 'pk-clefairy', cat: 'poke', name: '皮皮', en: 'Clefairy', svg: clefairy },
      { id: 'pk-dratini', cat: 'poke', name: '迷你龍', en: 'Dratini', svg: dratini },
      { id: 'pk-pokeball', cat: 'poke', name: '精靈球', en: 'Poké Ball', svg: pokeball },
    ],
  });
})();
