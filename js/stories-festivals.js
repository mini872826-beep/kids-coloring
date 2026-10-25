/* 故事包：festivals（由 stories-*.js 加進 window.BOOKS） */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  /* ---------- 小工具：本包自己用的節日道具（#222 粗線、平塗） ---------- */
  const L = 'stroke="#222" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  const FONT = 'font-family="Chiron GoRound TC, sans-serif" font-weight="900"';
  const rnd = () => `--d:${(Math.random() * -3).toFixed(2)}s;--e:${(Math.random() * .45).toFixed(2)}s`;
  // 可點、會輕輕晃的一組
  const tapG = (inner, anim = 'jump', sound = 'pop', idle = true) =>
    `<g class="tap${idle ? ' idle' : ''}" style="${rnd()}" data-anim="${anim}" data-sound="${sound}">${inner}</g>`;
  // 以 (x, y) 為原點、放大 s 倍來畫（線條粗細維持 sw）
  const at = (x, y, s, inner, sw = 6) =>
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="#222" stroke-width="${(sw / s).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
  const T = (x, y, ch, size, fill = '#222') =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" fill="${fill}" stroke="none" ${FONT}>${ch}</text>`;
  const star = (cx, cy, R, r = R * .45) => 'M' + Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' L') + ' Z';

  // 角色：腳底踩在 ground、水平置中在 cx；extra 是畫在角色身上的東西（用原圖 800×600 的座標）
  const stand = (id, cx, ground, w, anim, sound, extra = '') => {
    const s = put(id, cx - w / 2, ground - w * .7, w, anim, sound);
    return extra ? s.replace(/<\/svg><\/g>$/, `${extra}</svg></g>`) : s;
  };

  /* ---- 戴在角色身上的小東西（原圖座標，線條粗 12） ---- */
  const W = 'stroke="#222" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"';
  const wear = {
    // 派對帽
    partyHat: (hx = 400, hy = 150, rot = 0, c = '#4dabf7') => `<g transform="rotate(${rot} ${hx} ${hy})" ${W}>
      <path d="M${hx - 72} ${hy} L${hx} ${hy - 175} L${hx + 72} ${hy} Q${hx} ${hy + 18} ${hx - 72} ${hy} Z" fill="${c}"/>
      ${[[-30, -30], [22, -60], [-8, -105], [30, -20]].map(([dx, dy]) => `<circle cx="${hx + dx}" cy="${hy + dy}" r="11" fill="#ffd43b" stroke-width="5"/>`).join('')}
      <circle cx="${hx}" cy="${hy - 178}" r="24" fill="#ff6b6b"/></g>`,
    // 聖誕帽
    santaHat: (hx = 400, hy = 150, rot = 0) => `<g transform="rotate(${rot} ${hx} ${hy})" ${W}>
      <path d="M${hx - 100} ${hy} Q${hx - 70} ${hy - 150} ${hx + 30} ${hy - 150} Q${hx + 130} ${hy - 145} ${hx + 160} ${hy - 50} L${hx + 100} ${hy} Z" fill="#e03131"/>
      <rect x="${hx - 115}" y="${hy - 22}" width="230" height="48" rx="24" fill="#fff"/>
      <circle cx="${hx + 160}" cy="${hy - 50}" r="30" fill="#fff"/></g>`,
    // 柚子皮帽子（兔子的耳朵從洞裡伸出來）
    pomeloHat: (hx = 400, hy = 232) => `<defs><clipPath id="fx-ear-clip"><rect x="0" y="0" width="800" height="${hy - 128}"/></clipPath></defs>
      <g ${W}><path d="M${hx - 140} ${hy + 8} Q${hx - 145} ${hy - 150} ${hx} ${hy - 152} Q${hx + 145} ${hy - 150} ${hx + 140} ${hy + 8} Z" fill="#c0eb75"/>
      <path d="M${hx - 140} ${hy + 8} L${hx - 105} ${hy - 12} L${hx - 70} ${hy + 12} L${hx - 35} ${hy - 12} L${hx} ${hy + 12} L${hx + 35} ${hy - 12} L${hx + 70} ${hy + 12} L${hx + 105} ${hy - 12} L${hx + 140} ${hy + 8}" fill="#fff9db"/>
      <path d="M${hx - 100} ${hy - 90} Q${hx - 110} ${hy - 50} ${hx - 100} ${hy - 20}" fill="none" stroke="#fff" stroke-width="12"/></g>
      <g clip-path="url(#fx-ear-clip)" ${W}><ellipse cx="350" cy="125" rx="38" ry="98" fill="#f6f6f6"/><ellipse cx="450" cy="125" rx="38" ry="98" fill="#f6f6f6"/>
      <ellipse cx="350" cy="130" rx="17" ry="70" fill="#ffb3c6" stroke="none"/><ellipse cx="450" cy="130" rx="17" ry="70" fill="#ffb3c6" stroke="none"/></g>`,
    // 眼鏡（爺爺、奶奶）
    glasses: (ex1, ex2, ey, r = 34) => `<g ${W} fill="none" stroke-width="9"><circle cx="${ex1}" cy="${ey}" r="${r}"/><circle cx="${ex2}" cy="${ey}" r="${r}"/><path d="M${ex1 + r} ${ey} L${ex2 - r} ${ey}"/></g>`,
    // 小花（媽媽、奶奶）
    flower: (x, y, c = '#ff6b6b') => `<g ${W} stroke-width="8">${[0, 1, 2, 3, 4].map(k => { const a = k * Math.PI * 2 / 5; return `<circle cx="${x + 26 * Math.cos(a)}" cy="${y + 26 * Math.sin(a)}" r="20" fill="${c}"/>`; }).join('')}<circle cx="${x}" cy="${y}" r="15" fill="#ffd43b"/></g>`,
    // 閉上眼睛（小貓許願）
    catEyesShut: () => `<ellipse cx="352" cy="250" rx="22" ry="28" fill="#ffa94d"/><ellipse cx="448" cy="250" rx="22" ry="28" fill="#ffa94d"/>
      <path d="M332 252 Q352 270 372 252 M428 252 Q448 270 468 252" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round"/>`,
    // 掛在脖子上的香包
    sachet: (cx = 400, cy = 330) => `<path d="M${cx - 62} ${cy - 10} Q${cx} ${cy + 80} ${cx + 62} ${cy - 10}" fill="none" stroke="#e03131" stroke-width="10"/>${at(cx, cy + 120, 1.8, sachetInner(), 12)}`,
  };

  /* ---- 背景 ---- */
  const nightStars = [[90, 60], [220, 120], [380, 50], [500, 140], [740, 200], [300, 200], [130, 220], [620, 40]];
  const local = {
    // 室內（win: 'day' | 'night'）
    room: (wall = '#ffe8cc', win = 'day', wx = 560) => `<rect width="800" height="500" fill="${wall}"/>
      <rect x="${wx}" y="60" width="170" height="140" rx="10" fill="${win === 'night' ? '#2b2d6e' : '#bfe8ff'}" ${L}/>
      ${win === 'night' ? `<path d="${star(wx + 50, 100, 10)} ${star(wx + 130, 160, 8)}" fill="#ffe14d"/>` : ''}
      <path d="M${wx + 85} 60 L${wx + 85} 200 M${wx} 130 L${wx + 170} 130" ${L}/>
      <rect y="390" width="800" height="110" fill="#e0a96d"/><path d="M0 390 L800 390" ${L}/>
      ${[120, 300, 480, 660].map(x => `<path d="M${x} 395 L${x - 30} 500" stroke="#c98a4b" stroke-width="4"/>`).join('')}`,
    // 沒有月亮的夜空
    night: (ground = '#3c6e47', gy = 400) => `<rect width="800" height="500" fill="#2b2d6e"/>
      ${nightStars.map(([x, y], i) => `<path class="twinkle" style="animation-delay:${i * .3}s" d="${star(x, y, 12, 5)}" fill="#ffe14d"/>`).join('')}
      <rect y="${gy}" width="800" height="${500 - gy}" fill="${ground}"/>`,
    // 門外的牆
    wall: () => `<rect width="800" height="500" fill="#f3d9b1"/>
      ${[80, 160, 240, 320].map((y, i) => [0, 1, 2, 3, 4, 5].map(k => `<rect x="${k * 160 + (i % 2) * 80 - 60}" y="${y - 50}" width="150" height="72" rx="6" fill="#efcf9f"/>`).join('')).join('')}
      <rect y="430" width="800" height="70" fill="#ced4da"/><path d="M0 430 L800 430" ${L}/>`,
    // 河（near：前面有一片草地）
    river: (near = false) => `${scene.day()}<rect y="190" width="800" height="45" fill="#9be07a"/><path d="M0 190 L800 190" stroke="#222" stroke-width="4"/>
      ${[60, 170, 640, 750].map(x => `<circle cx="${x}" cy="180" r="26" fill="#55b85a" stroke="#222" stroke-width="4"/>`).join('')}
      <rect y="232" width="800" height="268" fill="#4dabf7"/><path d="M0 232 L800 232" stroke="#222" stroke-width="4"/>
      ${[[90, 290], [330, 270], [600, 300], [180, 420], [480, 450], [700, 400]].map(([x, y], i) => `<path class="float" style="animation-delay:${i * .5}s" d="M${x - 30} ${y} q15 -12 30 0 t30 0" fill="none" stroke="#d0ebff" stroke-width="6" stroke-linecap="round"/>`).join('')}
      ${near ? `<path d="M0 420 Q400 395 800 420 L800 500 L0 500 Z" fill="#9be07a" ${L}/>` : ''}`,
    // 下雪的白天
    snowDay: () => `${scene.snow()}<path d="M0 395 Q200 375 400 392 T800 388 L800 500 L0 500 Z" fill="#fff" ${L}/>`,
    // 下雪的晚上
    snowNight: () => `${local.night('#f1f3f5', 405)}${Array.from({ length: 30 }, (_, i) => `<circle class="fall" style="animation-delay:${(i * .13) % 1.2}s" cx="${(i * 97) % 800}" cy="${(i * 53) % 380}" r="${3 + (i % 3) * 2}" fill="#fff"/>`).join('')}
      <path d="M0 405 L800 405" ${L}/>`,
    // 一排彩旗
    bunting: (y = 40, sag = 50) => {
      const cols = ['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c', '#da77f2'];
      let flags = '';
      for (let i = 0; i < 11; i++) {
        const t = (i + .5) / 11, x = 800 * t, yy = y + 2 * sag * t * (1 - t) * 2;
        flags += `<path d="M${x - 26} ${yy} L${x + 26} ${yy} L${x} ${yy + 50} Z" fill="${cols[i % 5]}"/>`;
      }
      return `<g ${L} stroke-width="4"><path d="M0 ${y} Q400 ${y + sag * 2} 800 ${y}" fill="none"/>${flags}</g>`;
    },
  };

  /* ---- 過新年 ---- */
  // 紅燈籠（從 (x, y) 吊下來）
  const lantern = (x, y, s = 1, sw = 6) => tapG(at(x, y, s, `<path d="M0 0 L0 28" fill="none"/>
    <rect x="-24" y="26" width="48" height="16" rx="5" fill="#ffd43b"/>
    <ellipse cx="0" cy="86" rx="62" ry="48" fill="#e03131"/>
    <path d="M0 40 Q-36 86 0 132 M0 40 Q36 86 0 132" fill="none" stroke-width="${3 / s}" stroke="#a61e1e"/>
    ${T(0, 88, '福', 44, '#ffd43b')}
    <rect x="-24" y="128" width="48" height="16" rx="5" fill="#ffd43b"/>
    <path d="M-10 144 L-14 196 L14 196 L10 144 Z" fill="#ffd43b"/>`, sw), 'wiggle', 'pop');
  // 紅包
  const hongbao = (x, y, s = 1, rot = 0) => tapG(at(x, y, s, `<g transform="rotate(${rot})">
    <rect x="-42" y="-58" width="84" height="116" rx="8" fill="#e03131"/>
    <path d="M-42 -38 Q0 -6 42 -38" fill="none"/>
    <circle cx="0" cy="14" r="23" fill="#ffd43b"/>${T(0, 15, '福', 28, '#e03131')}</g>`), 'boing', 'twinkle');
  // 貼了春聯的大門（pasting：右邊那張還在貼）
  const door = (x, y, pasting = false) => {
    const strip = (cx, words) => `<rect x="${cx - 24}" y="${y - 300}" width="48" height="262" rx="4" fill="#e03131"/>${[...words].map((ch, i) => T(cx, y - 266 + i * 62, ch, 34)).join('')}`;
    const spring = cx => `<rect x="${cx - 30}" y="${y - 210}" width="60" height="60" fill="#e03131" transform="rotate(45 ${cx} ${y - 180})"/>${T(cx, y - 178, '春', 36, '#ffd43b')}`;
    return `<g ${L}>
      <rect x="${x - 122}" y="${y - 312}" width="244" height="312" fill="#9c6332"/>
      <rect x="${x - 108}" y="${y - 298}" width="106" height="298" fill="#c0392b"/><rect x="${x + 2}" y="${y - 298}" width="106" height="298" fill="#c0392b"/>
      <circle cx="${x - 22}" cy="${y - 120}" r="9" fill="#ffd43b"/><circle cx="${x + 22}" cy="${y - 120}" r="9" fill="#ffd43b"/>
      ${spring(x - 55)}${spring(x + 55)}
      <rect x="${x - 124}" y="${y - 372}" width="248" height="50" rx="4" fill="#e03131"/>${[...'新春快樂'].map((ch, i) => T(x - 81 + i * 54, y - 346, ch, 34)).join('')}
      ${strip(x - 162, '歲歲平安')}
      ${pasting ? `<g transform="translate(40 -14) rotate(-9 ${x + 162} ${y - 170})">${strip(x + 162, '年年有餘')}</g>` : strip(x + 162, '年年有餘')}</g>`;
  };
  // 年夜飯的圓桌（桌面中心在 (x, y)）
  const fishShape = `<path d="M-60 0 Q-5 -42 52 0 Q-5 36 -60 0 Z" fill="#ff922b"/><path d="M50 0 L82 -26 L82 26 Z" fill="#ff922b"/>
    <path d="M-12 -24 Q4 -42 22 -20" fill="#ffa94d"/><circle cx="-38" cy="-6" r="5" fill="#222"/><path d="M-6 -12 Q2 0 -6 12 M10 -14 Q18 0 10 14" fill="none" stroke-width="3"/>`;
  const feast = (x, y, s = 1) => at(x, y, s, `
    <path d="M-250 0 L-250 92 Q0 130 250 92 L250 0 Z" fill="#c92a2a"/>
    <ellipse cx="0" cy="0" rx="250" ry="55" fill="#ff6b6b"/>
    <ellipse cx="-145" cy="4" rx="82" ry="22" fill="#fff"/><g transform="translate(-150 -12) scale(.9)">${fishShape}</g>
    <path d="M-58 -62 L58 -62 L48 2 Q0 14 -48 2 Z" fill="#868e96"/><path d="M-58 -50 L-76 -50 M58 -50 L76 -50" fill="none"/>
    <ellipse cx="0" cy="-62" rx="58" ry="15" fill="#ffa94d"/><circle cx="-20" cy="-64" r="8" fill="#69db7c" stroke-width="3"/><circle cx="18" cy="-60" r="8" fill="#fff" stroke-width="3"/>
    <g class="float" fill="none" stroke="#adb5bd" stroke-width="5"><path d="M-22 -86 q-12 -18 0 -36 q12 -18 0 -36"/><path d="M22 -86 q-12 -18 0 -36 q12 -18 0 -36"/></g>
    <ellipse cx="145" cy="4" rx="82" ry="22" fill="#fff"/>
    ${[[112, -10], [150, -14], [186, -8], [132, 4], [168, 4]].map(([dx, dy]) => `<path d="M${dx - 24} ${dy + 8} Q${dx} ${dy - 28} ${dx + 24} ${dy + 8} Z" fill="#fff9db" stroke-width="4"/>`).join('')}`);
  // 一大盤魚
  const fishDish = (x, y, s = 1) => tapG(at(x, y, s, `<ellipse cx="0" cy="18" rx="130" ry="36" fill="#fff"/><ellipse cx="0" cy="14" rx="100" ry="24" fill="#e7f5ff" stroke-width="3"/>
    <g transform="scale(1.35)">${fishShape}</g><path d="M-30 -48 L-20 -40 M0 -52 L4 -44" stroke="#69db7c" stroke-width="5"/>`), 'boing', 'pop');
  // 煙火
  const firework = (x, y, r, c, i = 0) => `<g class="twinkle" style="animation-delay:${i * .4}s">
    ${Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6, cs = Math.cos(a), sn = Math.sin(a); return `<path d="M${x + r * .35 * cs} ${y + r * .35 * sn} L${x + r * cs} ${y + r * sn}" stroke="${c}" stroke-width="8" stroke-linecap="round"/><circle cx="${x + r * 1.15 * cs}" cy="${y + r * 1.15 * sn}" r="6" fill="${c}"/>`; }).join('')}
    <circle cx="${x}" cy="${y}" r="10" fill="#fff"/></g>`;
  // 掛燈籠的繩子
  const lanternRow = (xs, s = .7, y = 0) => `<path d="M-10 ${y + 18} Q400 ${y + 70} 810 ${y + 18}" fill="none" stroke="#222" stroke-width="5"/>${xs.map(x => lantern(x, y + 18 + 52 * (1 - ((x - 400) / 410) ** 2), s)).join('')}`;

  /* ---- 端午節 ---- */
  function sachetInner() {
    return `<path d="M-14 -30 Q0 -66 14 -30" fill="none"/>
      <path d="M0 -30 Q42 -44 42 2 Q40 36 0 46 Q-40 36 -42 2 Q-42 -44 0 -30 Z" fill="#f06595"/>
      <circle cx="0" cy="6" r="13" fill="#ffd43b"/>${[0, 1, 2, 3, 4].map(k => { const a = k * Math.PI * 2 / 5 - Math.PI / 2; return `<circle cx="${20 * Math.cos(a)}" cy="${6 + 20 * Math.sin(a)}" r="7" fill="#fff"/>`; }).join('')}
      <path d="M-7 46 L-11 86 L11 86 L7 46 Z" fill="#ffd43b"/>`;
  }
  const sachet = (x, y, s = 1) => tapG(at(x, y, s, sachetInner()), 'wiggle', 'twinkle');
  // 香香的味道
  const smell = (x, y) => `<g class="float" fill="none" stroke="#da77f2" stroke-width="6" stroke-linecap="round">
    <path d="M${x} ${y} q-14 -20 0 -40 q14 -20 0 -40"/><path d="M${x + 34} ${y + 10} q-14 -20 0 -40 q14 -20 0 -40"/><path d="M${x - 34} ${y + 10} q-14 -20 0 -40 q14 -20 0 -40"/></g>`;
  // 龍舟（水面在 y；crew 是坐在船上的角色 id）
  const dragonBoat = (x, y, s = 1, crew = [], flag = true) => {
    const seats = [-200, -95, 10, 115];
    const people = crew.map((id, i) => stand(id, x + seats[i] * s, y + 15 * s, 170 * s, 'jump', 'pop')).join('');
    const paddles = crew.map((_, i) => { const px = x + (seats[i] + 30) * s; return `<g class="tap" data-anim="wiggle" data-sound="splash"><path d="M${px} ${y - 70 * s} L${px - 50 * s} ${y + 50 * s}" stroke="#9c6332" stroke-width="${10 * s}" stroke-linecap="round"/>
      <ellipse cx="${px - 54 * s}" cy="${y + 58 * s}" rx="${12 * s}" ry="${24 * s}" transform="rotate(25 ${px - 54 * s} ${y + 58 * s})" fill="#c98a4b" stroke="#222" stroke-width="5"/></g>`; }).join('');
    const back = at(x, y, s, `
      ${flag ? `<path d="M-262 -30 L-262 -200" fill="none" stroke-width="${8 / s}"/><path class="float" d="M-262 -200 L-170 -175 L-262 -148 Z" fill="#e03131"/>` : ''}
      <path d="M-300 -36 Q-352 -70 -332 -116 Q-312 -146 -288 -118 Q-300 -88 -262 -44 Z" fill="#40c057"/>
      <path d="M280 -40 Q330 -60 326 -130 L366 -130 Q366 -40 300 10 Z" fill="#40c057"/>
      <path d="M326 -100 L306 -88 L328 -78 L308 -64 L326 -52" fill="#ff922b"/>`);
    const front = at(x, y, s, `
      <path d="M-316 -40 Q0 -8 316 -40 L292 22 Q0 52 -292 22 Z" fill="#fab005"/>
      <path d="M-306 -22 Q0 10 306 -22 L300 -6 Q0 26 -300 -6 Z" fill="#e03131" stroke-width="${4 / s}"/>
      ${[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => `<path d="M${i * 60 - 22} 14 Q${i * 60} 34 ${i * 60 + 22} 14" fill="none" stroke-width="${4 / s}"/>`).join('')}
      <g transform="translate(220 -40)"><rect x="-30" y="-56" width="60" height="56" rx="6" fill="#e03131"/><ellipse cx="0" cy="-56" rx="30" ry="10" fill="#fff3bf"/><path d="M-6 -60 L-36 -96 M8 -60 L36 -94" stroke="#9c6332" stroke-width="${7 / s}"/></g>
      <path d="M312 -170 Q372 -196 432 -150 L436 -118 Q390 -104 346 -100 Q306 -112 312 -170 Z" fill="#40c057"/>
      <path d="M392 -122 Q414 -118 436 -120" fill="none" stroke-width="${4 / s}"/>
      <path d="M330 -172 L312 -214 L346 -178 Z M352 -178 L346 -222 L372 -180 Z" fill="#ffd43b"/>
      <circle cx="360" cy="-150" r="14" fill="#fff"/><circle cx="364" cy="-150" r="7" fill="#222"/>
      <circle cx="420" cy="-148" r="4" fill="#222"/>
      <path d="M432 -128 Q470 -140 470 -170 M428 -118 Q466 -100 480 -112" fill="none" stroke-width="${4 / s}"/>`);
    return `<g class="tap" data-anim="wiggle" data-sound="splash">${back}</g>${people}<g class="tap" data-anim="wiggle" data-sound="splash">${front}</g>${paddles}`;
  };
  // 粽子（open：剝開的）
  const zongzi = (x, y, s = 1, open = false) => tapG(at(x, y, s, open ? `
    <path d="M-20 0 Q-110 -20 -120 -80 Q-60 -60 -10 -10 Z" fill="#69db7c"/><path d="M20 0 Q110 -20 120 -80 Q60 -60 10 -10 Z" fill="#69db7c"/>
    <path d="M0 -112 Q10 -104 70 0 Q0 12 -70 0 Q-10 -104 0 -112 Z" fill="#fff3d6"/>
    <rect x="-38" y="-48" width="32" height="26" rx="6" fill="#a0522d"/><circle cx="20" cy="-34" r="17" fill="#ff922b"/>
    <ellipse cx="-4" cy="-76" rx="13" ry="9" fill="#5c3d2e"/>${[[-30, -14], [36, -10], [8, -10]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="6" ry="4" fill="#e8c39e" stroke-width="3"/>`).join('')}` : `
    <path d="M0 -150 L0 -110" fill="none" stroke="#c98a4b" stroke-width="${5 / s}"/>
    <path d="M0 -112 Q10 -104 72 0 Q0 12 -72 0 Q-10 -104 0 -112 Z" fill="#69db7c"/>
    <path d="M0 -100 L-22 -4 M0 -100 L28 -4" fill="none" stroke="#2f9e44" stroke-width="${4 / s}"/>
    <path d="M-44 -46 Q0 -36 46 -46" fill="none" stroke="#c98a4b" stroke-width="${8 / s}"/>`), 'jump', 'pop');

  /* ---- 中秋節 ---- */
  // 大月亮（figures：嫦娥和玉兔的影子）
  const bigMoon = (x, y, r, figures = false) => `<circle cx="${x}" cy="${y}" r="${r + 26}" fill="#fff3b0" opacity=".12"/>
    <g class="tap" data-anim="boing" data-sound="twinkle"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff3b0" stroke="#222" stroke-width="5"/>
    ${figures ? `<g fill="#f2cf63">
      <ellipse cx="${x + r * .3}" cy="${y + r * .38}" rx="${r * .22}" ry="${r * .17}"/><circle cx="${x + r * .4}" cy="${y + r * .12}" r="${r * .13}"/>
      <ellipse cx="${x + r * .35}" cy="${y - r * .1}" rx="${r * .045}" ry="${r * .14}" transform="rotate(-12 ${x + r * .35} ${y - r * .1})"/><ellipse cx="${x + r * .46}" cy="${y - r * .1}" rx="${r * .045}" ry="${r * .14}" transform="rotate(12 ${x + r * .46} ${y - r * .1})"/>
      <circle cx="${x - r * .35}" cy="${y - r * .42}" r="${r * .09}"/>
      <path d="M${x - r * .42} ${y - r * .32} L${x - r * .28} ${y - r * .32} Q${x - r * .2} ${y} ${x - r * .12} ${y + r * .3} L${x - r * .6} ${y + r * .3} Q${x - r * .5} ${y} ${x - r * .42} ${y - r * .32} Z"/>
      </g><path d="M${x - r * .45} ${y - r * .25} Q${x - r * .75} ${y - r * .1} ${x - r * .62} ${y + r * .15} M${x - r * .25} ${y - r * .25} Q${x + r * .02} ${y - r * .45} ${x + r * .05} ${y - r * .65}" fill="none" stroke="#f2cf63" stroke-width="${Math.max(4, r * .04)}" stroke-linecap="round"/>`
    : [[-.4, -.3, .16], [.3, .35, .12], [.35, -.35, .1], [-.2, .45, .09]].map(([a, b, c]) => `<circle cx="${x + r * a}" cy="${y + r * b}" r="${r * c}" fill="#ffe8a3"/>`).join('')}</g>`;
  // 月餅
  const mooncake = (cx, cy, r) => `${Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6; return `<circle cx="${cx + r * .9 * Math.cos(a)}" cy="${cy + r * .9 * Math.sin(a)}" r="${r * .24}" fill="#e8890c"/>`; }).join('')}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e8890c" stroke="none"/><circle cx="${cx}" cy="${cy}" r="${r * .62}" fill="#f59f00"/>
    ${T(cx, cy + 1, '福', r * .7, '#b35c00')}`;
  // 蛋黃酥
  const yolkPastry = (cx, cy, r) => `<path d="M${cx - r} ${cy} Q${cx - r} ${cy - r * 1.1} ${cx} ${cy - r * 1.1} Q${cx + r} ${cy - r * 1.1} ${cx + r} ${cy} Z" fill="#d9822b"/>
    ${[[-.3, -.75], [.1, -.85], [.35, -.6], [-.05, -.55]].map(([a, b]) => `<ellipse cx="${cx + r * a}" cy="${cy + r * b}" rx="3" ry="2" fill="#222" stroke="none"/>`).join('')}`;
  const mooncakePlate = (x, y, s = 1) => tapG(at(x, y, s, `<ellipse cx="0" cy="0" rx="150" ry="34" fill="#fff"/>
    ${mooncake(-62, -26, 46)}${mooncake(52, -32, 46)}${yolkPastry(-4, 4, 34)}${yolkPastry(100, 6, 30)}`), 'boing', 'yay');
  // 柚子（peeled：剝開的）
  const pomelo = (x, y, s = 1, peeled = false) => tapG(at(x, y, s, peeled ? `
    <path d="M-100 0 Q-120 -30 -80 -40 Q-60 -10 -100 0 Z M100 0 Q120 -34 82 -42 Q62 -12 100 0 Z" fill="#c0eb75"/>
    <circle cx="0" cy="-58" r="58" fill="#ffe3e3"/>${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<path d="M0 -58 L${58 * Math.cos(a)} ${-58 + 58 * Math.sin(a)}" fill="none" stroke-width="3"/>`; }).join('')}` : `
    <circle cx="0" cy="-72" r="72" fill="#c0eb75"/><path d="M-22 -138 Q0 -160 22 -138" fill="#a9e34b"/>
    <path d="M0 -152 L4 -170" fill="none"/><path d="M4 -166 Q30 -196 58 -176 Q34 -150 4 -166 Z" fill="#40c057"/>
    <path d="M-40 -110 Q-50 -90 -46 -70" fill="none" stroke="#fff" stroke-width="${8 / s}"/>`), 'jump', 'pop');
  // 烤肉架
  const grill = (x, y, s = 1) => tapG(at(x, y, s, `
    <g class="drift" fill="none" stroke="#adb5bd" stroke-width="${8 / s}"><path d="M-60 -150 q-16 -24 0 -48 q16 -24 0 -48"/><path d="M10 -150 q-16 -24 0 -48 q16 -24 0 -48"/><path d="M70 -150 q-16 -24 0 -48 q16 -24 0 -48"/></g>
    <path d="M-70 -60 L-96 0 M70 -60 L96 0" fill="none" stroke-width="${10 / s}"/>
    <path d="M-120 -126 L120 -126 L96 -58 L-96 -58 Z" fill="#495057"/>
    ${[-80, -40, 0, 40, 80].map((dx, i) => `<circle cx="${dx}" cy="-118" r="12" fill="${i % 2 ? '#ff6b6b' : '#ff922b'}" stroke="none"/>`).join('')}
    <path d="M-128 -132 L128 -132" stroke="#adb5bd" stroke-width="${10 / s}"/>
    <rect x="-100" y="-166" width="64" height="26" rx="13" fill="#c92a2a"/><rect x="-24" y="-166" width="64" height="26" rx="13" fill="#c92a2a"/>
    <rect x="52" y="-168" width="70" height="30" rx="15" fill="#ffd43b"/><path d="M66 -168 L66 -138 M82 -168 L82 -138 M98 -168 L98 -138" fill="none" stroke-width="${3 / s}"/>`), 'wiggle', 'pop');

  /* ---- 聖誕節 ---- */
  const xmasTree = (x, y, s = 1) => tapG(at(x, y, s, `
    <rect x="-22" y="-56" width="44" height="56" fill="#9c6332"/>
    <path d="M-160 -50 L0 -190 L160 -50 Z" fill="#2f9e44"/>
    <path d="M-128 -142 L0 -270 L128 -142 Z" fill="#2f9e44"/>
    <path d="M-96 -232 L0 -340 L96 -232 Z" fill="#2f9e44"/>
    <path d="M-120 -78 Q0 -40 118 -92 M-90 -170 Q0 -138 90 -180 M-58 -256 Q0 -236 56 -264" fill="none" stroke="#ffd43b" stroke-width="${6 / s}"/>
    ${[[-80, -70, '#ff6b6b'], [40, -64, '#4dabf7'], [100, -100, '#ffd43b'], [-40, -128, '#da77f2'], [-70, -170, '#ffd43b'], [50, -168, '#ff6b6b'], [10, -220, '#4dabf7'], [-30, -284, '#ff6b6b'], [36, -270, '#ffd43b']].map(([a, b, c]) => `<circle cx="${a}" cy="${b}" r="13" fill="${c}"/>`).join('')}
    <path class="twinkle" d="${star(0, -352, 36)}" fill="#ffd43b"/>`), 'wiggle', 'twinkle');
  const gift = (x, y, s = 1, c = '#ff6b6b', rc = '#ffd43b') => tapG(at(x, y, s, `
    <rect x="-46" y="-80" width="92" height="80" rx="6" fill="${c}"/><rect x="-54" y="-98" width="108" height="24" rx="6" fill="${c}"/>
    <rect x="-10" y="-98" width="20" height="98" fill="${rc}"/>
    <path d="M0 -98 Q-46 -140 -36 -98 Z M0 -98 Q46 -140 36 -98 Z" fill="${rc}"/>`), 'boing', 'yay');
  const snowman = (x, y, s = 1) => tapG(at(x, y, s, `
    <path d="M-62 -110 L-140 -170 M-110 -146 L-124 -178 M62 -110 L140 -170 M110 -146 L134 -172" fill="none" stroke="#9c6332" stroke-width="${8 / s}"/>
    <circle cx="0" cy="-78" r="78" fill="#fff"/><circle cx="0" cy="-196" r="54" fill="#fff"/>
    <circle cx="-20" cy="-206" r="7" fill="#222"/><circle cx="20" cy="-206" r="7" fill="#222"/>
    <path d="M0 -192 L48 -184 L0 -176 Z" fill="#ff922b"/>
    <path d="M-20 -168 Q0 -158 20 -168" fill="none"/>
    <path d="M-52 -150 Q0 -128 52 -150 L54 -128 Q0 -106 -54 -128 Z" fill="#e03131"/><path d="M22 -128 L30 -80 L50 -84 L44 -132 Z" fill="#e03131"/>
    ${[-100, -70, -40].map(b => `<circle cx="0" cy="${b}" r="7" fill="#222"/>`).join('')}
    <rect x="-38" y="-294" width="76" height="52" rx="6" fill="#343a40"/><rect x="-58" y="-250" width="116" height="14" rx="7" fill="#343a40"/>
    <rect x="-38" y="-262" width="76" height="12" fill="#e03131" stroke="none"/>`), 'boing', 'pop');
  // 聖誕老公公（sack：揹著一大袋禮物）
  const santa = (x, y, s = 1, sack = false) => tapG(at(x, y, s, `
    ${sack ? `<path d="M50 -250 Q150 -320 196 -200 Q214 -100 120 -96 Q70 -120 50 -250 Z" fill="#c98a4b"/>
      <rect x="110" y="-300" width="44" height="40" rx="4" fill="#4dabf7" transform="rotate(14 132 -280)"/><path d="M60 -258 Q100 -280 140 -262" fill="none"/>` : ''}
    <rect x="-56" y="-40" width="48" height="40" rx="12" fill="#343a40"/><rect x="8" y="-40" width="48" height="40" rx="12" fill="#343a40"/>
    <rect x="-50" y="-110" width="38" height="76" fill="#e03131"/><rect x="12" y="-110" width="38" height="76" fill="#e03131"/>
    <rect x="-128" y="-226" width="42" height="100" rx="20" fill="#e03131" transform="rotate(22 -107 -226)"/><circle cx="-148" cy="-128" r="22" fill="#343a40"/>
    <rect x="86" y="-226" width="42" height="100" rx="20" fill="#e03131" transform="rotate(-22 107 -226)"/><circle cx="148" cy="-128" r="22" fill="#343a40"/>
    <path d="M-88 -100 Q-112 -210 -60 -232 L60 -232 Q112 -210 88 -100 Q0 -84 -88 -100 Z" fill="#e03131"/>
    <rect x="-12" y="-226" width="24" height="130" fill="#fff"/>
    <path d="M-92 -106 Q0 -86 92 -106 L90 -82 Q0 -62 -90 -82 Z" fill="#fff"/>
    <rect x="-98" y="-160" width="196" height="26" rx="6" fill="#343a40"/><rect x="-20" y="-164" width="40" height="34" rx="4" fill="#ffd43b"/>
    <circle cx="0" cy="-278" r="50" fill="#ffd8b8"/>
    <path d="M-58 -282 Q-74 -220 -32 -202 Q0 -186 32 -202 Q74 -220 58 -282 Q0 -246 -58 -282 Z" fill="#fff"/>
    <ellipse cx="-17" cy="-262" rx="20" ry="10" fill="#fff"/><ellipse cx="17" cy="-262" rx="20" ry="10" fill="#fff"/>
    <circle cx="0" cy="-274" r="10" fill="#ffa8a8"/><circle cx="-20" cy="-294" r="6" fill="#222"/><circle cx="20" cy="-294" r="6" fill="#222"/>
    <circle cx="-36" cy="-280" r="8" fill="#ffc2c2" stroke="none"/><circle cx="36" cy="-280" r="8" fill="#ffc2c2" stroke="none"/>
    <path d="M-52 -312 Q-30 -384 32 -378 Q82 -368 98 -322 L52 -312 Z" fill="#e03131"/>
    <rect x="-62" y="-330" width="124" height="30" rx="15" fill="#fff"/><circle cx="98" cy="-322" r="19" fill="#fff"/>`), 'boing', 'yay');

  // 雪地裡的小房子（窗戶亮著燈）
  const cottage = (x, y) => tapG(`<g ${L}>
    <rect x="${x + 50}" y="${y - 250}" width="40" height="80" fill="#c92a2a"/><rect x="${x + 44}" y="${y - 262}" width="52" height="18" rx="6" fill="#fff"/>
    <rect x="${x - 140}" y="${y - 170}" width="280" height="170" fill="#c98a4b"/>
    <path d="M${x - 175} ${y - 160} L${x} ${y - 285} L${x + 175} ${y - 160} Z" fill="#e03131"/>
    <path d="M${x - 175} ${y - 160} L${x} ${y - 285} L${x + 175} ${y - 160} Q${x + 120} ${y - 186} ${x + 70} ${y - 166} Q${x} ${y - 196} ${x - 70} ${y - 166} Q${x - 120} ${y - 186} ${x - 175} ${y - 160} Z" fill="#fff"/>
    <rect x="${x - 110}" y="${y - 130}" width="70" height="60" rx="6" fill="#ffd43b"/><path d="M${x - 75} ${y - 130} L${x - 75} ${y - 70}"/>
    <rect x="${x + 20}" y="${y - 110}" width="70" height="110" rx="8" fill="#2f9e44"/><circle cx="${x + 75}" cy="${y - 52}" r="6" fill="#ffd43b"/></g>`, 'boing', 'pop', false);

  /* ---- 生日派對 ---- */
  const balloons = (x, y, list) => list.map(([dx, dy, c], i) => `<g class="tap float" style="animation-delay:${i * .6}s" data-anim="boing" data-sound="pop">
    <path d="M${x} ${y} Q${x + dx * .5 + 10} ${y + (dy - y) * .5} ${x + dx} ${dy + 54}" fill="none" stroke="#222" stroke-width="3"/>
    <path d="M${x + dx - 9} ${dy + 60} L${x + dx} ${dy + 48} L${x + dx + 9} ${dy + 60} Z" fill="${c}" ${L} stroke-width="4"/>
    <ellipse cx="${x + dx}" cy="${dy}" rx="40" ry="50" fill="${c}" ${L}/><path d="M${x + dx - 18} ${dy - 26} Q${x + dx - 24} ${dy - 10} ${x + dx - 20} ${dy + 4}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>`).join('');
  // 生日蛋糕（n 根蠟燭；lit=false 是吹熄了）
  const cake = (x, y, s = 1, n = 4, lit = true) => tapG(at(x, y, s, `
    <ellipse cx="0" cy="0" rx="150" ry="18" fill="#e9ecef"/>
    <rect x="-120" y="-100" width="240" height="100" rx="14" fill="#ffc9de"/><rect x="-90" y="-166" width="180" height="72" rx="12" fill="#fff0f6"/>
    <path d="M-120 -76 Q-90 -52 -60 -76 Q-30 -52 0 -76 Q30 -52 60 -76 Q90 -52 120 -76" fill="none" stroke="#f06595"/>
    ${[[-70, -36, '#ff6b6b'], [-20, -30, '#ffd43b'], [30, -36, '#4dabf7'], [80, -30, '#69db7c']].map(([a, b, c]) => `<circle cx="${a}" cy="${b}" r="9" fill="${c}" stroke-width="3"/>`).join('')}
    ${Array.from({ length: n }, (_, i) => { const cx = -60 + i * (120 / Math.max(1, n - 1)); return `<rect x="${cx - 7}" y="-214" width="14" height="50" rx="4" fill="${['#74c0fc', '#ff8fab', '#ffd43b', '#8ce99a'][i % 4]}"/>` +
      (lit ? `<path class="twinkle" style="animation-delay:${i * .2}s" d="M${cx} -248 Q${cx + 12} -230 ${cx} -218 Q${cx - 12} -230 ${cx} -248 Z" fill="#ffd43b"/>`
        : `<path class="float" d="M${cx} -220 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#adb5bd" stroke-width="${5 / s}"/>`); }).join('')}`), 'boing', 'yay');
  // 音符
  const notes = (pts) => pts.map(([x, y, c], i) => `<g class="float" style="animation-delay:${i * .5}s" ${L} stroke-width="5">
    <ellipse cx="${x}" cy="${y}" rx="17" ry="13" fill="${c}" transform="rotate(-20 ${x} ${y})"/><path d="M${x + 14} ${y - 4} L${x + 14} ${y - 64} Q${x + 34} ${y - 50} ${x + 40} ${y - 30}" fill="none"/></g>`).join('');
  // 心裡想的雲朵泡泡
  const thought = (x, y, inner) => `<g ${L} stroke-width="5">
    <circle cx="${x - 80}" cy="${y + 120}" r="10" fill="#fff"/><circle cx="${x - 55}" cy="${y + 92}" r="16" fill="#fff"/>
    <path d="M${x - 70} ${y + 40} a40 40 0 0 1 20 -70 a50 50 0 0 1 90 -14 a45 45 0 0 1 70 30 a40 40 0 0 1 -10 70 a50 50 0 0 1 -80 20 a45 45 0 0 1 -90 -36 z" fill="#fff"/></g>${inner}`;
  // 吹氣
  const blow = (x, y) => `<g class="drift" fill="none" stroke="#4dabf7" stroke-width="7" stroke-linecap="round">
    <path d="M${x} ${y} Q${x + 40} ${y - 20} ${x + 80} ${y}"/><path d="M${x + 10} ${y + 30} Q${x + 50} ${y + 10} ${x + 90} ${y + 30}"/></g>`;
  const confetti = () => Array.from({ length: 22 }, (_, i) => `<rect class="fall" style="animation-delay:${(i * .17) % 1.4}s" x="${(i * 89 + 30) % 780}" y="${(i * 61) % 300 + 20}" width="12" height="18" rx="3" fill="${['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c', '#da77f2'][i % 5]}" transform="rotate(${i * 37} ${(i * 89 + 30) % 780} ${(i * 61) % 300 + 20})"/>`).join('');

  // 家人的打扮
  const grandpaPig = wear.glasses(352, 448, 240);
  const grandmaPig = wear.glasses(352, 448, 240) + wear.flower(495, 160, '#da77f2');
  const mamaPig = wear.flower(495, 160);
  const mamaBear = wear.flower(510, 150);
  const grandmaBunny = wear.glasses(360, 440, 255, 32) + wear.flower(470, 190, '#da77f2');
  const mamaBunny = wear.flower(470, 190);

  window.BOOKS.push(
    {
      id: 'new-year', tag: '節日', title: '小豬過新年',
      cover: svg(local.wall() + door(400, 430) + stand('pig', 120, 470, 260) + stand('pig', 680, 470, 250, 'jump', 'boing', mamaPig) + hongbao(250, 330, .9, -12)),
      pages: [
        { text: '過年囉！小豬家門口掛起紅燈籠。', art: svg(scene.day() + scene.grass(400) + stand('my-house', 515, 405, 580, 'boing', 'pop', lantern(215, 292, .55, 10) + lantern(505, 292, .55, 10) + `<rect x="334" y="404" width="52" height="52" fill="#e03131" transform="rotate(45 360 430)" ${W}/>${T(360, 432, '春', 34, '#ffd43b')}`) + stand('pig', 150, 470, 280, 'jump', 'boing')) },
        { text: '小豬和爸爸一起在門上貼春聯。', art: svg(local.wall() + door(380, 430, true) + stand('pig', 660, 470, 330, 'boing', 'pop') + stand('pig', 110, 470, 230, 'jump', 'boing')) },
        { text: '晚上，全家圍在桌子旁吃年夜飯。', art: svg(local.room('#ffe3e3', 'night') + lanternRow([200, 600], .55, -20) + stand('pig', 175, 400, 270, 'jump', 'boing') + stand('pig', 625, 400, 270, 'boing', 'pop', mamaPig) + stand('pig', 475, 325, 190, 'jump', 'boing') + feast(400, 370, .85)) },
        { text: '桌上有一條大魚，代表年年有餘喔！', art: svg(local.room('#ffe3e3', 'night') + `<ellipse cx="400" cy="420" rx="380" ry="70" fill="#ff6b6b" ${L}/>` + fishDish(400, 360, 2.1) + stand('pig', 110, 470, 200, 'jump', 'boing') + scene.stars()) },
        { text: '小豬說：「新年快樂，恭喜發財！」', art: svg(local.room('#ffe3e3') + stand('pig', 130, 470, 250, 'jump', 'yay') + stand('pig', 450, 450, 260, 'boing', 'pop', grandpaPig) + stand('pig', 680, 450, 250, 'boing', 'pop', grandmaPig) + scene.bubble(30, 40, '恭喜發財！', 250)) },
        { text: '爺爺奶奶給小豬一個大紅包。', art: svg(local.room('#ffe3e3') + stand('pig', 600, 450, 290, 'boing', 'pop', grandpaPig) + hongbao(420, 300, 1.1, -10) + stand('pig', 210, 470, 260, 'jump', 'yay') + scene.heart(420, 150, 26) + scene.heart(130, 140, 22)) },
        { text: '放煙火囉！新的一年，大家都平安快樂！', art: svg(local.night('#3c6e47', 410) + firework(170, 120, 70, '#ff6b6b', 0) + firework(420, 80, 60, '#ffd43b', 1) + firework(650, 130, 75, '#69db7c', 2) + stand('pig', 160, 480, 230, 'jump', 'yay', grandpaPig) + stand('pig', 330, 480, 230, 'jump', 'yay', mamaPig) + stand('pig', 480, 480, 170, 'jump', 'yay') + stand('pig', 640, 480, 230, 'jump', 'yay', grandmaPig)) },
      ],
    },
    {
      id: 'dragon-boat', tag: '節日', title: '小熊划龍舟',
      cover: svg(local.river() + dragonBoat(350, 360, .9, ['panda', 'monkey', 'tiger', 'bear'])),
      pages: [
        { text: '端午節到了，河邊好熱鬧！', art: svg(local.river(true) + local.bunting(0, 30) + dragonBoat(560, 290, .45, ['panda', 'monkey', 'tiger', 'dog']) + stand('bear', 160, 490, 250, 'jump', 'boing') + stand('panda', 380, 490, 200, 'jump', 'pop')) },
        { text: '媽媽幫小熊掛上香包，香香的。', art: svg(local.room('#e6fcf5') + stand('bear', 570, 450, 380, 'boing', 'pop', mamaBear) + stand('bear', 220, 470, 280, 'jump', 'twinkle', wear.sachet(400, 330)) + smell(300, 430)) },
        { text: '河上有一條好長好長的龍舟。', art: svg(local.river() + dragonBoat(370, 360, 1)) },
        { text: '咚咚咚！大家一起用力划！', art: svg(local.river() + dragonBoat(370, 360, 1, ['panda', 'monkey', 'tiger', 'bear'])) },
        { text: '加油！加油！小熊的龍舟衝第一！', art: svg(local.river() + `<path d="M760 420 L760 120" ${L} stroke-width="10"/><path class="float" d="M760 120 L690 140 L760 170 Z" fill="#ffd43b" ${L}/>` + dragonBoat(330, 380, .85, ['panda', 'monkey', 'tiger', 'bear']) + scene.bubble(40, 30, '加油！', 180) + scene.stars()) },
        { text: '回家吃粽子，裡面有肉和蛋黃，好香！', art: svg(local.room('#e6fcf5') + local.bunting(0, 20) + stand('bear', 170, 470, 290, 'jump', 'pop', wear.sachet(400, 330)) + zongzi(470, 440, 1.6, true) + zongzi(660, 440, 1.1) + zongzi(740, 450, .8)) },
        { text: '端午節快樂！小熊吃得飽飽的。', art: svg(scene.day() + scene.sun() + scene.grass() + stand('bear', 260, 460, 330, 'jump', 'yay', wear.sachet(400, 330)) + stand('bear', 560, 450, 330, 'boing', 'pop', mamaBear) + zongzi(720, 470, .8) + scene.heart(400, 110)) },
      ],
    },
    {
      id: 'mid-autumn', tag: '節日', title: '小兔子的中秋節',
      cover: svg(local.night() + bigMoon(560, 150, 100, true) + stand('bunny', 220, 480, 300, 'jump', 'boing', wear.pomeloHat()) + mooncakePlate(560, 450, .8)),
      pages: [
        { text: '中秋節的晚上，月亮又大又圓。', art: svg(local.night() + bigMoon(560, 150, 100) + stand('bunny', 220, 470, 320, 'jump', 'boing')) },
        { text: '全家在院子裡烤肉，好香喔！', art: svg(local.night() + bigMoon(680, 90, 55) + grill(400, 460, 1) + stand('bunny', 150, 470, 300, 'boing', 'pop', mamaBunny) + stand('bunny', 650, 470, 250, 'jump', 'boing')) },
        { text: '大家一起吃月餅，甜甜的好好吃。', art: svg(local.night() + bigMoon(680, 90, 55) + stand('bunny', 160, 440, 280, 'jump', 'pop') + stand('bunny', 640, 440, 280, 'boing', 'pop', mamaBunny) + mooncakePlate(400, 440, 1.2)) },
        { text: '剝開大柚子，柚子皮變成帽子！', art: svg(local.night() + bigMoon(680, 90, 55) + stand('bunny', 260, 480, 400, 'jump', 'yay', wear.pomeloHat()) + pomelo(560, 460, 1, true) + pomelo(700, 470, .8)) },
        { text: '奶奶說：月亮上住著嫦娥和玉兔。', art: svg(local.night() + bigMoon(560, 170, 135, true) + stand('bunny', 150, 470, 280, 'boing', 'pop', grandmaBunny) + stand('bunny', 340, 480, 200, 'jump', 'boing')) },
        { text: '小兔子對月亮揮揮手：「玉兔你好！」', art: svg(local.night() + bigMoon(600, 150, 110, true) + stand('bunny', 210, 470, 300, 'jump', 'yay', wear.pomeloHat()) + scene.bubble(40, 30, '玉兔你好！', 250)) },
        { text: '月圓人團圓，中秋節快樂！', art: svg(local.night() + bigMoon(400, 110, 80) + stand('bunny', 130, 480, 250, 'boing', 'pop', grandmaBunny) + stand('bunny', 310, 480, 250, 'jump', 'boing', mamaBunny) + stand('bunny', 470, 480, 190, 'jump', 'yay', wear.pomeloHat()) + stand('bunny', 650, 480, 260, 'boing', 'pop') + scene.heart(250, 170, 22) + scene.heart(560, 170, 22)) },
      ],
    },
    {
      id: 'christmas', tag: '節日', title: '小企鵝的聖誕節',
      cover: svg(local.snowNight() + xmasTree(560, 470, 1.15) + stand('penguin', 220, 480, 340, 'jump', 'twinkle', wear.santaHat(400, 150, 8))),
      pages: [
        { text: '下雪了！聖誕節快要到囉。', art: svg(local.snowDay() + scene.tree(660) + stand('penguin', 300, 470, 360, 'jump', 'twinkle', wear.santaHat(400, 150, 8))) },
        { text: '小企鵝和小熊一起裝飾聖誕樹。', art: svg(local.room('#e7f5ff') + xmasTree(400, 450, 1.1) + stand('penguin', 150, 470, 270, 'jump', 'twinkle', wear.santaHat(400, 150, 8)) + stand('bear', 650, 470, 270, 'boing', 'pop')) },
        { text: '他們在外面堆了一個胖胖的雪人。', art: svg(local.snowDay() + snowman(420, 460, 1.15) + stand('penguin', 150, 480, 250, 'jump', 'twinkle', wear.santaHat(400, 150, 8)) + stand('bear', 660, 480, 260, 'jump', 'pop')) },
        { text: '晚上，聖誕老公公揹著禮物來了！', art: svg(local.snowNight() + cottage(610, 410) + santa(260, 470, 1.05, true)) },
        { text: '他把禮物輕輕放在聖誕樹下。', art: svg(local.room('#d0ebff', 'night', 600) + xmasTree(470, 450, 1.1) + gift(380, 475, .8, '#ff6b6b') + gift(570, 475, .7, '#4dabf7', '#fff') + santa(180, 470, .95)) },
        { text: '早上醒來，哇！樹下好多禮物！', art: svg(local.room('#e7f5ff') + xmasTree(420, 420, 1.05) + gift(310, 470, .8, '#ff6b6b') + gift(440, 480, .9, '#4dabf7', '#fff') + gift(560, 470, .7, '#69db7c', '#ff6b6b') + stand('penguin', 120, 480, 230, 'jump', 'yay', wear.santaHat(400, 150, 8)) + stand('bear', 700, 480, 220, 'jump', 'yay')) },
        { text: '小企鵝送朋友禮物：「聖誕快樂！」', art: svg(local.snowDay() + snowman(715, 440, .6) + stand('penguin', 190, 480, 300, 'boing', 'twinkle', wear.santaHat(400, 150, 8)) + gift(390, 460, .9, '#da77f2') + stand('bear', 560, 480, 270, 'jump', 'yay') + scene.bubble(40, 30, '聖誕快樂！', 250) + scene.heart(400, 270, 24)) },
      ],
    },
    {
      id: 'birthday-party', tag: '節日', title: '小貓的生日派對',
      cover: svg(local.room('#fff0f6') + local.bunting(0, 30) + balloons(640, 380, [[-60, 150, '#ff6b6b'], [20, 120, '#4dabf7'], [90, 160, '#ffd43b']]) + stand('cat', 250, 470, 320, 'jump', 'yay', wear.partyHat(400, 150, -8)) + cake(560, 470, .8)),
      pages: [
        { text: '今天是小貓的生日，家裡掛滿了氣球。', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + balloons(560, 400, [[-80, 170, '#ff6b6b'], [0, 140, '#4dabf7'], [80, 180, '#ffd43b'], [150, 130, '#69db7c']]) + stand('cat', 250, 470, 320, 'jump', 'yay', wear.partyHat(400, 150, -8))) },
        { text: '好朋友都來了，還帶了禮物。', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + stand('cat', 120, 470, 230, 'boing', 'pop', wear.partyHat(400, 150, -8)) + stand('dog', 340, 470, 220, 'jump', 'woof') + stand('bunny', 530, 470, 200, 'jump', 'boing') + stand('chick', 700, 470, 170, 'jump', 'pop') + gift(420, 480, .55, '#4dabf7', '#fff') + gift(610, 480, .5, '#69db7c', '#ff6b6b')) },
        { text: '小貓四歲了，蛋糕上有四根蠟燭。', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + cake(530, 470, 1) + stand('cat', 150, 470, 290, 'jump', 'yay', wear.partyHat(400, 150, -8))) },
        { text: '大家一起唱：「祝你生日快樂～」', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + stand('dog', 120, 470, 220, 'boing', 'woof', wear.partyHat(400, 160, -6, '#69db7c')) + stand('cat', 300, 470, 240, 'jump', 'yay', wear.partyHat(400, 150, -8)) + stand('bunny', 690, 470, 220, 'boing', 'boing', wear.partyHat(400, 190, 8, '#ff8fab')) + cake(505, 480, .6) + notes([[200, 200, '#845ef7'], [430, 150, '#ff6b6b'], [600, 260, '#4dabf7'], [470, 300, '#ffd43b']])) },
        { text: '小貓閉上眼睛，許了一個願望。', art: svg(local.room('#fff0f6', 'night', 30) + stand('cat', 260, 470, 330, 'boing', 'twinkle', wear.catEyesShut() + wear.partyHat(400, 150, -8)) + cake(560, 480, .75) + thought(560, 70, `<path class="twinkle" d="${star(565, 95, 40)}" fill="#ffd43b" ${L} stroke-width="5"/>`)) },
        { text: '呼～一口氣把蠟燭吹熄了！', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + stand('cat', 200, 470, 320, 'boing', 'pop', wear.partyHat(400, 150, -8)) + blow(330, 280) + cake(560, 480, .8, 4, false) + confetti()) },
        { text: '大家一起吃蛋糕，生日真快樂！', art: svg(local.room('#fff0f6') + local.bunting(0, 30) + balloons(160, 300, [[-60, 120, '#ff6b6b'], [10, 100, '#4dabf7'], [70, 130, '#ffd43b']]) + stand('dog', 90, 470, 200, 'jump', 'woof', wear.partyHat(400, 160, -6, '#69db7c')) + stand('cat', 260, 470, 230, 'jump', 'yay', wear.partyHat(400, 150, -8)) + cake(440, 480, .6) + stand('bunny', 610, 470, 200, 'jump', 'boing', wear.partyHat(400, 190, 8, '#ff8fab')) + stand('chick', 740, 470, 160, 'jump', 'pop') + scene.heart(440, 150, 24)) },
      ],
    },
  );
})();
