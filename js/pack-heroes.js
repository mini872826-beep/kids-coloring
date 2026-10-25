/* 線稿包：光之英雄（原創巨人英雄與怪獸）
 * 全部是原創設計：英雄戴「護目鏡頭盔 + 星星頭冠」，胸口是星星 + V 字條紋，
 * 不是任何現有角色。 */
(function () {
  const { eye, ground, sparkle, win, scallop } = window.ART.helpers;
  const f1 = v => String(Math.round(v * 10) / 10);

  // 星星（n 個角）
  const starD = (cx, cy, R, r = R * .48, n = 5, a0 = -Math.PI / 2) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = a0 + i * Math.PI / n, rr = i % 2 ? r : R;
      d += (i ? ' L' : 'M') + f1(cx + rr * Math.cos(a)) + ' ' + f1(cy + rr * Math.sin(a));
    }
    return d + ' Z';
  };
  const star = (cx, cy, R, c, r, n) => `<path fill="${c}" d="${starD(cx, cy, R, r, n)}"/>`;
  // 圓頭膠囊（手腳）：兩端點 + 粗細 → 封閉形狀
  const cap = (x1, y1, x2, y2, w, c) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, h = w / 2, nx = -(y2 - y1) / L * h, ny = (x2 - x1) / L * h;
    const p = (x, y) => `${f1(x)} ${f1(y)}`;
    return `<path fill="${c}" d="M${p(x1 + nx, y1 + ny)} L${p(x2 + nx, y2 + ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x2 - nx, y2 - ny)} L${p(x1 - nx, y1 - ny)} A${f1(h)} ${f1(h)} 0 0 0 ${p(x1 + nx, y1 + ny)} Z"/>`;
  };
  const mirror = s => `<g transform="translate(800 0) scale(-1 1)">${s}</g>`;
  const heart = (x, y, k = 1, c = '#ff8787') =>
    `<path fill="${c}" d="M${x} ${y + 40 * k} C${x - 60 * k} ${y} ${x - 55 * k} ${y - 60 * k} ${x} ${y - 30 * k} C${x + 55 * k} ${y - 60 * k} ${x + 60 * k} ${y} ${x} ${y + 40 * k} Z"/>`;
  const smile = (x, y, w = 20) => `<path d="M${x - w} ${y} Q${x} ${y + w * .9} ${x + w} ${y}"/>`;
  const cloud = (x, y, s = 1, c = '#e7f5ff') =>
    `<path fill="${c}" d="M${x} ${y} Q${x - 5 * s} ${y - 40 * s} ${x + 35 * s} ${y - 38 * s} Q${x + 50 * s} ${y - 75 * s} ${x + 92 * s} ${y - 58 * s} Q${x + 130 * s} ${y - 70 * s} ${x + 140 * s} ${y - 32 * s} Q${x + 175 * s} ${y - 25 * s} ${x + 165 * s} ${y} Z"/>`;

  // 座標換算：英雄用自己的「身體座標」（頭的中心 = 0,0），再放大縮小擺到畫面上
  function K(ox, oy, s) {
    const X = x => ox + x * s, Y = y => oy + y * s;
    const mp = d => d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (m, x, y) => f1(X(+x)) + ' ' + f1(Y(+y)));
    return {
      path: (c, d) => `<path fill="${c}" d="${mp(d)}"/>`,
      line: d => `<path d="${mp(d)}"/>`,
      circ: (x, y, r, c) => `<circle cx="${f1(X(x))}" cy="${f1(Y(y))}" r="${f1(r * s)}" fill="${c}"/>`,
      ell: (x, y, rx, ry, c, rot = 0) => `<ellipse cx="${f1(X(x))}" cy="${f1(Y(y))}" rx="${f1(rx * s)}" ry="${f1(ry * s)}" fill="${c}"${rot ? ` transform="rotate(${f1(rot)} ${f1(X(x))} ${f1(Y(y))})"` : ''}/>`,
      rect: (x, y, w, h, r, c) => `<rect x="${f1(X(x))}" y="${f1(Y(y))}" width="${f1(w * s)}" height="${f1(h * s)}" rx="${f1(r * s)}" fill="${c}"/>`,
      star: (x, y, R, c, r) => star(X(x), Y(y), R * s, c, (r || R * .48) * s),
      cap: (a, b, w, c) => cap(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), w * s, c),
      eye: (x, y, r) => eye(X(x), Y(y), r * s),
    };
  }

  // ---- 英雄的各個部位 ----
  // 頭：圓方形頭盔 + 一條護目鏡 + 星星頭冠 + 兩個耳機
  function head(k, C, o = {}) {
    return k.circ(-74, 5, 18, C.acc) + k.circ(74, 5, 18, C.acc) +
      k.star(0, -80, 34, C.star, 17) +
      k.rect(-72, -75, 144, 150, 62, C.main) +
      k.path(C.face, 'M -52 -6 L 52 -6 Q 58 52 0 70 Q -58 52 -52 -6 Z') +
      k.rect(-60, -42, 120, 48, 24, C.visor) +
      (o.mask
        ? k.path('#fff', 'M -48 -18 Q -30 -36 -10 -20 Q -28 -2 -48 -18 Z') + k.path('#fff', 'M 48 -18 Q 30 -36 10 -20 Q 28 -2 48 -18 Z')
        : k.eye(-26, -18, 12) + k.eye(26, -18, 12)) +
      (o.cheeks ? k.ell(-36, 24, 11, 7, '#ffc9c9') + k.ell(36, 24, 11, 7, '#ffc9c9') : '') +
      k.line('M -18 30 Q 0 46 18 30');
  }
  // 身體：V 字條紋 + 胸口星星 + 腰帶
  const torso = (k, C) =>
    k.path(C.main, 'M -84 92 Q -84 70 -60 70 L 60 70 Q 84 70 84 92 L 62 240 L -62 240 Z') +
    k.path(C.acc, 'M -83.7 94 L 0 178 L 83.7 94 L 78.9 126 L 0 210 L -78.9 126 Z') +
    k.star(0, 120, 30, C.star, 15) +
    k.rect(-64, 222, 128, 26, 8, C.acc) +
    k.path(C.star, 'M 0 220 L 18 235 L 0 250 L -18 235 Z');
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function arm(k, C, [a, b, c], open) {
    let s = k.cap(a, b, 46, C.main) + k.cap(b, c, 42, C.main) + k.cap(lerp(b, c, .5), c, 50, C.acc);
    if (!open) return s + k.circ(c[0], c[1], 27, C.acc);
    // 張開的手掌：沿著手臂方向的橢圓 + 兩條手指線
    const ang = Math.atan2(c[1] - b[1], c[0] - b[0]), ux = Math.cos(ang), uy = Math.sin(ang);
    const px = c[0] + ux * 14, py = c[1] + uy * 14;
    s += k.ell(px, py, 36, 28, C.acc, ang * 180 / Math.PI);
    for (const t of [-9, 9]) s += k.line(`M ${f1(px + ux * 8 - uy * t)} ${f1(py + uy * 8 + ux * t)} L ${f1(px + ux * 34 - uy * t)} ${f1(py + uy * 34 + ux * t)}`);
    return s;
  }
  const leg = (k, C, [a, b, c]) => k.cap(a, b, 58, C.main) + k.cap(b, c, 54, C.main) + k.cap(lerp(b, c, .3), c, 62, C.acc);

  // 一個英雄：o = { x, y, s, legs, arms, back, open, rot, hs, hy, cheeks }
  function fig(C, o) {
    const s = o.s || 1, k = K(o.x, o.y, s);
    const hk = o.hs ? K(o.x, o.y + (o.hy || 0) * s, s * o.hs) : k;
    const out = (o.back || []).map(a => arm(k, C, a)).join('') +
      o.legs.map(l => leg(k, C, l)).join('') + torso(k, C) + head(hk, C, o) +
      o.arms.map((a, i) => arm(k, C, a, (o.open || []).includes(i))).join('');
    return o.rot ? `<g transform="rotate(${o.rot} ${o.cx} ${o.cy})">${out}</g>` : out;
  }

  const RED = { main: '#ff6b6b', acc: '#ced4da', star: '#ffd43b', visor: '#a5d8ff', face: '#e9ecef' };
  const BLUE = { main: '#4dabf7', acc: '#dee2e6', star: '#ffd43b', visor: '#c5f6fa', face: '#f1f3f5' };
  const GOLD = { main: '#ffd43b', acc: '#ff922b', star: '#ff6b6b', visor: '#a5d8ff', face: '#fff9db' };
  const PURPLE = { main: '#9775fa', acc: '#dee2e6', star: '#ffe066', visor: '#99e9f2', face: '#f3f0ff' };
  const GREEN = { main: '#51cf66', acc: '#ffe066', star: '#ff922b', visor: '#a5d8ff', face: '#ebfbee' };
  const BABY = { main: '#ff8787', acc: '#74c0fc', star: '#ffe066', visor: '#c5f6fa', face: '#fff0f6' };

  const STAND_LEGS = [[[-32, 240], [-40, 320], [-48, 400]], [[32, 240], [40, 320], [48, 400]]];
  const HIP_L = [[-62, 100], [-120, 170], [-66, 215]];
  const HIP_R = [[62, 100], [120, 170], [66, 215]];

  // 小房子（顯得英雄很巨大）
  const minihouse = (x, w, h, c) => `<rect x="${x}" y="${560 - h}" width="${w}" height="${h}" rx="6" fill="${c}"/>` +
    `<rect x="${x + w / 2 - 16}" y="${560 - h + 22}" width="32" height="30" rx="4" fill="#a8e0ff"/>`;

  // ================= 英雄 =================
  const red = `
    ${minihouse(70, 100, 120, '#ffe8cc')} ${minihouse(630, 100, 150, '#d0ebff')}
    ${fig(RED, { x: 400, y: 125, legs: STAND_LEGS, arms: [HIP_L, HIP_R] })}
    ${ground(560)}
    ${sparkle(120, 110, 22)} ${sparkle(680, 110, 22)} ${sparkle(160, 300, 14, '#ff8fab')} ${sparkle(650, 300, 14, '#74c0fc')}`;

  const blue = `
    <path d="M40 210 L170 270 M60 300 L180 330 M50 390 L160 390"/>
    ${cloud(40, 560, 1.1)} ${cloud(580, 540, .8)}
    ${fig(BLUE, { x: 400, y: 140, s: .9, rot: 65, cx: 400, cy: 300,
      legs: [[[-24, 240], [-26, 330], [-28, 415]], [[24, 240], [30, 330], [36, 410]]],
      back: [[[-62, 100], [-82, 180], [-74, 250]]],
      arms: [[[62, 100], [98, -5], [82, -125]]] })}
    ${sparkle(720, 120, 20)} ${sparkle(740, 400, 14, '#74c0fc')}`;

  const gold = `
    <path fill="#fff3bf" d="M480 185 L770 110 Q800 215 770 320 L480 245 Z"/>
    <path fill="#ffe066" d="M490 200 L760 165 Q775 215 760 265 L490 230 Z"/>
    ${fig(GOLD, { x: 260, y: 130, s: .95, open: [1],
      legs: [[[-32, 240], [-85, 320], [-110, 400]], [[32, 240], [75, 320], [95, 400]]],
      arms: [HIP_L, [[62, 100], [140, 95], [215, 90]]] })}
    ${ground(560)}
    ${sparkle(560, 80, 18)} ${sparkle(600, 370, 16, '#ffa94d')} ${sparkle(90, 120, 16, '#74c0fc')}`;

  const purple = `
    ${star(615, 415, 62, '#ffe066', 32, 8)}
    <path d="M120 120 L200 160 M90 200 L180 225 M110 280 L190 290"/>
    ${fig(PURPLE, { x: 330, y: 115, s: .9, rot: -18, cx: 400, cy: 300,
      legs: [[[-32, 240], [-95, 300], [-45, 375]], [[32, 240], [110, 300], [195, 350]]],
      arms: [[[-62, 100], [-125, 45], [-120, -40]], [[62, 100], [120, 150], [160, 200]]] })}
    <ellipse cx="400" cy="560" rx="120" ry="16" fill="#dee2e6"/>
    ${sparkle(700, 120, 20)} ${sparkle(110, 470, 16, '#b197fc')}`;

  const green = `
    <path d="M590 40 Q625 70 610 110 M620 25 Q670 70 650 130"/>
    ${minihouse(80, 110, 140, '#d3f9d8')}
    ${fig(GREEN, { x: 400, y: 125, open: [1], legs: STAND_LEGS,
      arms: [[[-62, 100], [-95, 180], [-92, 255]], [[62, 100], [135, 50], [145, -40]]] })}
    ${ground(560)}
    ${sparkle(680, 250, 20)} ${sparkle(130, 120, 18, '#ff8fab')} ${sparkle(690, 440, 14, '#74c0fc')}`;

  const baby = `
    ${fig(BABY, { x: 400, y: 230, s: .9, hs: 1.6, hy: -55, cheeks: true,
      legs: [[[-30, 240], [-36, 290], [-40, 330]], [[30, 240], [36, 290], [40, 330]]],
      arms: [[[-62, 100], [-145, 95], [-195, 30]], [[62, 100], [145, 95], [195, 30]]] })}
    ${ground(556)}
    ${heart(130, 140, .8)} ${heart(670, 140, .8, '#ffd43b')}
    ${sparkle(110, 330, 18, '#74c0fc')} ${sparkle(690, 330, 18)}`;

  // ================= 怪獸 =================
  const horn = `
    <path fill="#69db7c" d="M500 420 Q640 450 710 350 Q700 480 520 490 Z"/>
    <rect x="290" y="430" width="80" height="100" rx="30" fill="#69db7c"/>
    <rect x="430" y="430" width="80" height="100" rx="30" fill="#69db7c"/>
    <ellipse cx="320" cy="530" rx="62" ry="26" fill="#40c057"/>
    <ellipse cx="480" cy="530" rx="62" ry="26" fill="#40c057"/>
    <ellipse cx="400" cy="380" rx="140" ry="140" fill="#69db7c"/>
    <ellipse cx="400" cy="405" rx="82" ry="98" fill="#d8f5a2"/>
    <path d="M326 370 Q400 392 474 370 M322 430 Q400 452 478 430"/>
    <circle cx="300" cy="320" r="17" fill="#40c057"/><circle cx="505" cy="300" r="14" fill="#40c057"/>
    <ellipse cx="268" cy="380" rx="28" ry="50" fill="#69db7c" transform="rotate(35 268 380)"/>
    <ellipse cx="532" cy="380" rx="28" ry="50" fill="#69db7c" transform="rotate(-35 532 380)"/>
    <path fill="#fff3bf" d="M370 130 Q400 -10 430 130 Z"/>
    <path fill="#fff3bf" d="M300 165 Q255 85 335 125 Z"/>
    <path fill="#fff3bf" d="M500 165 Q545 85 465 125 Z"/>
    <ellipse cx="400" cy="200" rx="128" ry="96" fill="#8ce99a"/>
    <ellipse cx="400" cy="240" rx="62" ry="38" fill="#d8f5a2"/>
    <circle cx="385" cy="230" r="5" fill="#222"/><circle cx="415" cy="230" r="5" fill="#222"/>
    ${eye(342, 178, 17)} ${eye(458, 178, 17)}
    ${smile(400, 256, 24)}
    ${ground(556)}
    ${sparkle(110, 120, 18)} ${sparkle(690, 150, 16, '#ff8fab')}`;

  const pincer = (x, y, rot, c) => `<path fill="${c}" transform="rotate(${rot} ${x} ${y})" d="M${x + 66} ${y - 24} L${x + 6} ${y + 2} L${x + 66} ${y + 28} A70 70 0 1 1 ${x + 66} ${y - 24} Z"/>`;
  const crab = `
    ${[[300, 420, 200, 510], [320, 440, 250, 535], [500, 420, 600, 510], [480, 440, 550, 535]].map(([a, b, c, d]) => cap(a, b, c, d, 34, '#ff8787')).join('')}
    ${cap(290, 330, 205, 245, 42, '#ff8787')} ${cap(510, 330, 595, 245, 42, '#ff8787')}
    ${pincer(175, 195, -50, '#ff6b6b')} ${pincer(625, 195, -130, '#ff6b6b')}
    ${cap(355, 300, 335, 200, 26, '#ff8787')} ${cap(445, 300, 465, 200, 26, '#ff8787')}
    <ellipse cx="400" cy="380" rx="170" ry="112" fill="#ff6b6b"/>
    <circle cx="300" cy="345" r="16" fill="#ffa8a8"/><circle cx="500" cy="345" r="16" fill="#ffa8a8"/>
    <circle cx="335" cy="185" r="36" fill="#fff"/><circle cx="465" cy="185" r="36" fill="#fff"/>
    ${eye(340, 188, 16)} ${eye(470, 188, 16)}
    <path fill="#c92a2a" d="M360 400 Q400 450 440 400 Z"/>
    <ellipse cx="335" cy="395" rx="16" ry="10" fill="#ffc9c9"/><ellipse cx="465" cy="395" rx="16" ry="10" fill="#ffc9c9"/>
    ${ground(556)}
    ${sparkle(400, 70, 18)} ${sparkle(110, 420, 14, '#74c0fc')} ${sparkle(690, 420, 14, '#74c0fc')}`;

  const drop = (x, y, c = '#74c0fc') => `<path fill="${c}" d="M${x} ${y - 30} Q${x + 22} ${y} ${x + 18} ${y + 10} Q${x} ${y + 30} ${x - 18} ${y + 10} Q${x - 22} ${y} ${x} ${y - 30} Z"/>`;
  const cloudy = `
    <path fill="#ffd43b" d="M415 25 L360 115 L398 112 L376 175 L448 85 L410 88 L438 25 Z"/>
    <ellipse cx="340" cy="505" rx="44" ry="26" fill="#a5d8ff"/>
    <ellipse cx="460" cy="505" rx="44" ry="26" fill="#a5d8ff"/>
    <circle cx="200" cy="330" r="36" fill="#e7f5ff"/><circle cx="600" cy="330" r="36" fill="#e7f5ff"/>
    <path fill="#e7f5ff" d="${scallop(400, 305, 155, 12, 22)}"/>
    ${eye(345, 280, 17)} ${eye(455, 280, 17)}
    <path fill="#ff8787" d="M362 325 Q400 385 438 325 Z"/>
    <ellipse cx="310" cy="325" rx="20" ry="12" fill="#ffc9c9"/><ellipse cx="490" cy="325" rx="20" ry="12" fill="#ffc9c9"/>
    ${drop(110, 470)} ${drop(690, 470)} ${drop(150, 560 - 20)} ${drop(650, 540)}
    ${sparkle(120, 120, 18)} ${sparkle(680, 120, 18, '#ff8fab')}`;

  const robot = `
    <path d="M400 112 L400 68"/><circle cx="400" cy="56" r="17" fill="#ff6b6b"/>
    ${cap(285, 305, 190, 385, 42, '#adb5bd')} ${cap(515, 305, 605, 235, 42, '#adb5bd')}
    <circle cx="180" cy="395" r="40" fill="#ffa94d"/>
    <path fill="#ffd43b" d="M642 252 L712 150 L598 194 Z"/>
    <path d="M633 225 L620 208 M660 205 L648 190 M684 180 L674 168"/>
    <rect x="245" y="452" width="310" height="82" rx="41" fill="#868e96"/>
    <circle cx="300" cy="493" r="22" fill="#ced4da"/><circle cx="400" cy="493" r="22" fill="#ced4da"/><circle cx="500" cy="493" r="22" fill="#ced4da"/>
    <rect x="370" y="228" width="60" height="44" fill="#adb5bd"/>
    <rect x="270" y="260" width="260" height="200" rx="26" fill="#74c0fc"/>
    <rect x="320" y="300" width="160" height="96" rx="14" fill="#e7f5ff"/>
    <circle cx="355" cy="348" r="16" fill="#ff6b6b"/><circle cx="400" cy="348" r="16" fill="#ffd43b"/><circle cx="445" cy="348" r="16" fill="#69db7c"/>
    <rect x="278" y="148" width="30" height="56" rx="10" fill="#ffd43b"/><rect x="492" y="148" width="30" height="56" rx="10" fill="#ffd43b"/>
    <rect x="300" y="108" width="200" height="132" rx="30" fill="#4dabf7"/>
    <circle cx="355" cy="165" r="31" fill="#fff"/><circle cx="445" cy="165" r="31" fill="#fff"/>
    ${eye(358, 168, 15)} ${eye(448, 168, 15)}
    <rect x="360" y="204" width="80" height="22" rx="10" fill="#fff"/>
    ${ground(556)}
    ${sparkle(110, 110, 18)} ${sparkle(700, 330, 16, '#74c0fc')}`;

  const lizard = `
    <path fill="#ff922b" d="M520 395 Q650 410 690 300 Q700 262 672 252 Q660 335 600 350 Q555 358 520 340 Z"/>
    <path fill="#ffd43b" d="M664 268 Q626 225 655 172 Q662 204 682 208 Q682 160 714 140 Q704 192 730 212 Q745 256 702 272 Z"/>
    <path fill="#ff6b6b" d="M300 310 L330 245 L360 300 Z M370 295 L400 232 L430 293 Z M440 300 L470 245 L500 310 Z"/>
    <rect x="290" y="410" width="58" height="105" rx="26" fill="#f76707"/>
    <rect x="455" y="410" width="58" height="105" rx="26" fill="#f76707"/>
    <ellipse cx="400" cy="372" rx="162" ry="88" fill="#ffa94d"/>
    <path fill="#ffe8cc" d="M270 400 Q400 470 530 400 Q500 452 400 455 Q300 452 270 400 Z"/>
    <rect x="245" y="420" width="62" height="105" rx="28" fill="#ffa94d"/>
    <rect x="490" y="420" width="62" height="105" rx="28" fill="#ffa94d"/>
    <path fill="#ff6b6b" d="M180 240 Q185 180 220 198 Q232 152 262 186 Q282 210 270 244 Z"/>
    <ellipse cx="205" cy="305" rx="100" ry="76" fill="#ffa94d"/>
    ${eye(200, 278, 16)}
    <circle cx="125" cy="300" r="5" fill="#222"/>
    <path d="M128 340 Q170 362 215 338"/>
    <ellipse cx="250" cy="325" rx="18" ry="11" fill="#ffc9c9"/>
    <path fill="#ffd43b" d="M108 330 Q80 300 40 306 Q66 322 46 336 Q78 342 40 362 Q86 368 110 345 Z"/>
    ${ground(556)}
    ${sparkle(140, 120, 18)} ${sparkle(560, 150, 16, '#ff8fab')}`;

  const batWing = `<path fill="#9775fa" d="M320 300 Q220 160 80 180 Q115 225 100 260 Q150 248 165 292 Q200 270 222 320 Q265 300 320 365 Z"/>`;
  const bat = `
    <path fill="#ffe066" d="M690 40 A60 60 0 1 0 750 130 A48 48 0 0 1 690 40 Z"/>
    ${batWing} ${mirror(batWing)}
    <path fill="#7950f2" d="M318 210 L300 100 L380 175 Z"/>
    <path fill="#7950f2" d="M482 210 L500 100 L420 175 Z"/>
    <ellipse cx="360" cy="515" rx="42" ry="22" fill="#ffa94d"/><ellipse cx="440" cy="515" rx="42" ry="22" fill="#ffa94d"/>
    <ellipse cx="400" cy="335" rx="132" ry="155" fill="#b197fc"/>
    <ellipse cx="400" cy="405" rx="78" ry="72" fill="#e5dbff"/>
    ${eye(350, 275, 18)} ${eye(450, 275, 18)}
    <path fill="#fff" d="M376 320 L384 342 L393 322 Z"/><path fill="#fff" d="M424 320 L416 342 L407 322 Z"/>
    <path d="M362 314 Q400 336 438 314"/>
    <ellipse cx="318" cy="315" rx="18" ry="11" fill="#ffc9c9"/><ellipse cx="482" cy="315" rx="18" ry="11" fill="#ffc9c9"/>
    ${sparkle(110, 80, 16)} ${sparkle(250, 60, 12)} ${sparkle(120, 440, 14, '#74c0fc')} ${sparkle(680, 440, 14, '#74c0fc')}`;

  const spiky = `
    ${star(400, 290, 205, '#4dabf7', 152, 14)}
    <ellipse cx="335" cy="500" rx="50" ry="28" fill="#ff922b"/><ellipse cx="465" cy="500" rx="50" ry="28" fill="#ff922b"/>
    <ellipse cx="210" cy="345" rx="34" ry="24" fill="#ffd43b" transform="rotate(-25 210 345)"/>
    <ellipse cx="590" cy="345" rx="34" ry="24" fill="#ffd43b" transform="rotate(25 590 345)"/>
    <circle cx="400" cy="290" r="155" fill="#ffd43b"/>
    ${eye(345, 260, 20)} ${eye(455, 260, 20)}
    <path fill="#ff8787" d="M345 315 Q400 395 455 315 Z"/>
    <ellipse cx="300" cy="320" rx="20" ry="12" fill="#ffc9c9"/><ellipse cx="500" cy="320" rx="20" ry="12" fill="#ffc9c9"/>
    ${ground(540)}
    ${sparkle(100, 100, 18)} ${sparkle(700, 100, 18, '#ff8fab')}`;

  // ================= 英雄世界 =================
  const jet = `
    ${cloud(40, 560, 1)} ${cloud(540, 150, .8)}
    <path fill="#ffd43b" d="M155 295 Q70 280 40 312 Q70 345 155 330 Z"/>
    <path fill="#ff6b6b" d="M175 292 L130 170 L205 170 L285 288 Z"/>
    <path fill="#e9ecef" d="M150 285 L560 270 Q700 280 745 320 Q700 352 560 356 L150 345 Z"/>
    <path fill="#a5d8ff" d="M495 274 Q560 222 642 286 Z"/>
    <path fill="#ff6b6b" d="M152 310 L700 314 L700 330 L152 330 Z"/>
    <path fill="#ff6b6b" d="M300 330 L470 330 L330 455 L255 455 Z"/>
    ${star(335, 400, 28, '#ffd43b', 14)}
    ${sparkle(700, 160, 18)} ${sparkle(110, 110, 16, '#74c0fc')}`;

  const base = `
    <path d="M400 62 L400 30"/>${star(400, 26, 22, '#ffd43b', 11)}
    <rect x="360" y="130" width="80" height="220" fill="#adb5bd"/>
    <path fill="#a5d8ff" d="M302 142 Q302 62 400 62 Q498 62 498 142 Z"/>
    <rect x="290" y="132" width="220" height="32" rx="16" fill="#ff6b6b"/>
    <rect x="170" y="262" width="80" height="90" rx="12" fill="#ced4da"/>
    <rect x="550" y="262" width="80" height="90" rx="12" fill="#ced4da"/>
    <circle cx="210" cy="292" r="16" fill="#ffd43b"/><circle cx="590" cy="292" r="16" fill="#ffd43b"/>
    <rect x="140" y="335" width="520" height="200" rx="18" fill="#dee2e6"/>
    <path fill="#868e96" d="M335 535 L335 455 Q400 400 465 455 L465 535 Z"/>
    ${star(400, 375, 32, '#ff6b6b', 16)}
    ${win(185, 380, 90, 70)} ${win(525, 380, 90, 70)}
    <rect x="140" y="335" width="520" height="22" rx="10" fill="#ff6b6b"/>
    ${ground(535)}
    ${sparkle(110, 110, 18)} ${sparkle(690, 110, 18, '#74c0fc')} ${sparkle(640, 220, 12)}`;

  const wand = `
    <path d="M400 30 L400 0 M260 70 L235 45 M540 70 L565 45 M215 185 L180 185 M585 185 L620 185 M265 290 L240 315 M535 290 L560 315"/>
    <rect x="365" y="330" width="70" height="230" rx="30" fill="#4dabf7"/>
    <rect x="358" y="420" width="84" height="26" rx="12" fill="#ffd43b"/>
    <rect x="358" y="480" width="84" height="26" rx="12" fill="#ffd43b"/>
    <circle cx="400" cy="378" r="17" fill="#ff6b6b"/>
    <rect x="335" y="292" width="130" height="48" rx="20" fill="#ced4da"/>
    ${star(400, 180, 140, '#ffe066', 66)}
    ${star(400, 186, 70, '#fff3bf', 33)}
    ${sparkle(150, 300, 18, '#74c0fc')} ${sparkle(650, 300, 18, '#ff8fab')} ${sparkle(170, 500, 14)} ${sparkle(630, 500, 14)}`;

  const mk = K(400, 335, 2.55);
  const mask = `
    ${head(mk, RED, { mask: true })}
    ${mk.circ(-80, 5, 6, '#fff')} ${mk.circ(80, 5, 6, '#fff')}
    ${sparkle(90, 90, 18)} ${sparkle(710, 90, 18, '#74c0fc')}`;

  const bld = (x, w, h, c, rows) => {
    const top = 560 - h;
    let s = `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="6" fill="${c}"/>`;
    for (let r = 0; r < rows; r++) s += `<rect x="${x + w / 2 - 20}" y="${top + 24 + r * 62}" width="40" height="36" rx="5" fill="#a8e0ff"/>`;
    return s;
  };
  const city = `
    <circle cx="110" cy="100" r="50" fill="#ffd43b"/>
    ${cloud(600, 240, .6)}
    ${bld(40, 120, 200, '#ffc9c9', 3)} ${bld(170, 110, 280, '#d0ebff', 4)} ${bld(290, 130, 170, '#fff3bf', 2)}
    ${bld(430, 110, 250, '#d3f9d8', 3)} ${bld(550, 100, 190, '#e5dbff', 3)} ${bld(660, 100, 230, '#ffe8cc', 3)}
    ${fig(RED, { x: 420, y: 140 - 160 * .65, s: .65, rot: 70, cx: 420, cy: 140,
      legs: [[[-24, 240], [-26, 330], [-28, 415]], [[24, 240], [30, 330], [36, 410]]],
      back: [[[-62, 100], [-82, 180], [-74, 250]]],
      arms: [[[62, 100], [98, -5], [82, -125]]] })}
    <path d="M70 180 L170 215 M90 250 L180 252"/>
    ${ground(560)}`;

  const friends = `
    ${heart(400, 175, 1)}
    ${fig(RED, { x: 250, y: 175, s: .8, legs: STAND_LEGS,
      arms: [HIP_L, [[62, 100], [120, 150], [185, 150]]] })}
    <path fill="#fff3bf" d="M520 330 Q505 265 545 310 Z"/><path fill="#fff3bf" d="M610 330 Q625 265 585 310 Z"/>
    <ellipse cx="530" cy="525" rx="40" ry="20" fill="#ff922b"/><ellipse cx="610" cy="525" rx="40" ry="20" fill="#ff922b"/>
    <path fill="#ffa94d" d="M670 450 Q740 460 735 395 Q760 470 680 490 Z"/>
    <ellipse cx="570" cy="425" rx="110" ry="102" fill="#ffa94d"/>
    <ellipse cx="570" cy="460" rx="58" ry="52" fill="#ffe8cc"/>
    ${eye(535, 395, 14)} ${eye(605, 395, 14)}
    ${smile(570, 425, 18)}
    <ellipse cx="510" cy="425" rx="14" ry="9" fill="#ffc9c9"/><ellipse cx="630" cy="425" rx="14" ry="9" fill="#ffc9c9"/>
    ${cap(490, 420, 425, 305, 36, '#ffa94d')}
    <circle cx="418" cy="298" r="24" fill="#ffa94d"/>
    ${ground(548)}
    ${sparkle(110, 110, 18)} ${sparkle(690, 110, 18, '#74c0fc')}`;

  window.ART.addPack({
    categories: [
      { id: 'hero', name: '光之英雄', icon: '🦸', color: '#f03e3e', dark: '#c92a2a', en: 'Light Heroes' },
    ],
    drawings: [
      { id: 'hr-red', cat: 'hero', name: '紅光英雄', en: 'Red Light Hero', svg: red },
      { id: 'hr-blue', cat: 'hero', name: '藍光英雄', en: 'Blue Light Hero', svg: blue },
      { id: 'hr-gold', cat: 'hero', name: '金光英雄', en: 'Gold Light Hero', svg: gold },
      { id: 'hr-purple', cat: 'hero', name: '紫光英雄', en: 'Purple Light Hero', svg: purple },
      { id: 'hr-green', cat: 'hero', name: '綠光英雄', en: 'Green Light Hero', svg: green },
      { id: 'hr-baby', cat: 'hero', name: '英雄寶寶', en: 'Baby Hero', svg: baby },
      { id: 'hr-horn', cat: 'hero', name: '角角怪獸', en: 'Horn Monster', svg: horn },
      { id: 'hr-crab', cat: 'hero', name: '大鉗怪獸', en: 'Claw Monster', svg: crab },
      { id: 'hr-cloud', cat: 'hero', name: '雲朵怪獸', en: 'Cloud Monster', svg: cloudy },
      { id: 'hr-robot', cat: 'hero', name: '機器怪獸', en: 'Robot Monster', svg: robot },
      { id: 'hr-lizard', cat: 'hero', name: '火焰蜥蜴', en: 'Fire Lizard', svg: lizard },
      { id: 'hr-bat', cat: 'hero', name: '蝙蝠怪獸', en: 'Bat Monster', svg: bat },
      { id: 'hr-spiky', cat: 'hero', name: '刺刺怪獸', en: 'Spiky Monster', svg: spiky },
      { id: 'hr-jet', cat: 'hero', name: '英雄戰機', en: 'Hero Jet', svg: jet },
      { id: 'hr-base', cat: 'hero', name: '英雄基地', en: 'Hero Base', svg: base },
      { id: 'hr-wand', cat: 'hero', name: '變身光棒', en: 'Light Wand', svg: wand },
      { id: 'hr-mask', cat: 'hero', name: '英雄面具', en: 'Hero Mask', svg: mask },
      { id: 'hr-city', cat: 'hero', name: '守護城市', en: 'Guarding the City', svg: city },
      { id: 'hr-friends', cat: 'hero', name: '握手好朋友', en: 'Best Friends', svg: friends },
    ],
  });
})();
