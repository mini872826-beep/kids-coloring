/* 故事包：classics（由 stories-*.js 加進 window.BOOKS） */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  /* ---------- 小工具：本包自己用的角色和道具（#222 粗線、平塗、笑臉） ---------- */
  const rnd = () => `--d:${(Math.random() * -3).toFixed(2)}s;--e:${(Math.random() * .45).toFixed(2)}s`;
  // 可點、會輕輕晃的一組；裡面再包一層 transform，才不會被 CSS 動畫蓋掉
  const tapG = (inner, anim = 'jump', sound = 'pop', idle = true) =>
    `<g class="tap${idle ? ' idle' : ''}" style="${rnd()}" data-anim="${anim}" data-sound="${sound}">${inner}</g>`;
  const at = (x, y, s, inner, flip = false) =>
    `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" stroke="#222" stroke-width="${(6 / s).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
  const eye = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#222"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff" stroke="none"/>`;
  const shut = (x, y) => `<path d="M${x - 8} ${y} Q${x} ${y + 7} ${x + 8} ${y}" fill="none"/>`;

  // 人：腳底在 (x, y)，s=1 時大約 300 高
  // o: shirt, pants, hair, style('short'|'long'|'topknot'), hat('douli'), dress, coat, flap, arms('down'|'up'|'give'|'hug'|'hoe'|'pull'|'carry'),
  //    mouth('smile'|'sad'|'o'|'grin'), beard, sleepy, sweat, sit, hold(在手上的小東西 svg，畫在右手)
  function person(x, y, s, o = {}, anim = 'jump', sound = 'pop') {
    const skin = '#ffd8b8';
    const shirt = o.shirt || '#4dabf7', pants = o.pants || '#495057', hair = o.hair || '#3d2f1f';
    const sleeve = o.coat || shirt;
    let g = '';
    // 長頭髮在後面
    if (o.style === 'long') g += `<path d="M-54 -208 Q-58 -268 0 -268 Q58 -268 54 -208 L62 -132 Q0 -120 -62 -132 Z" fill="${hair}"/>`;
    // 腳
    if (o.sit) {
      g += `<rect x="-24" y="-92" width="70" height="24" rx="11" fill="${pants}"/><rect x="28" y="-80" width="22" height="66" rx="10" fill="${pants}"/>
        <ellipse cx="48" cy="-10" rx="20" ry="10" fill="#6b4226"/>`;
    } else if (!o.dress) {
      g += `<rect x="-28" y="-80" width="22" height="70" rx="9" fill="${pants}"/><rect x="6" y="-80" width="22" height="70" rx="9" fill="${pants}"/>`;
      g += `<ellipse cx="-19" cy="-9" rx="20" ry="10" fill="#6b4226"/><ellipse cx="19" cy="-9" rx="20" ry="10" fill="#6b4226"/>`;
    } else {
      g += `<rect x="-24" y="-70" width="16" height="60" rx="7" fill="${skin}"/><rect x="8" y="-70" width="16" height="60" rx="7" fill="${skin}"/>`;
      g += `<ellipse cx="-17" cy="-9" rx="18" ry="10" fill="#e64980"/><ellipse cx="17" cy="-9" rx="18" ry="10" fill="#e64980"/>`;
    }
    // 衣服
    if (o.dress) g += `<path d="M-36 -158 Q-48 -110 -66 -62 Q0 -50 66 -62 Q48 -110 36 -158 Q0 -168 -36 -158 Z" fill="${shirt}"/>`;
    else if (o.coat) {
      g += `<path d="M-46 -158 Q-58 -100 -56 -${o.sit ? 72 : 46} L56 -${o.sit ? 72 : 46} Q58 -100 46 -158 Q0 -170 -46 -158 Z" fill="${o.coat}"/>
        <path d="M0 -162 L0 -${o.sit ? 72 : 46}" fill="none"/><circle cx="-10" cy="-128" r="4" fill="#222"/><circle cx="-10" cy="-100" r="4" fill="#222"/><circle cx="-10" cy="-72" r="4" fill="#222"/>`;
      if (o.flap) g += `<path d="M48 -130 Q100 -128 128 -92 Q100 -96 92 -78 Q74 -92 54 -70 Z" fill="${o.coat}"/>`;
    } else g += `<path d="M-42 -158 Q-50 -110 -46 -74 L46 -74 Q50 -110 42 -158 Q0 -170 -42 -158 Z" fill="${shirt}"/>`;
    // 手
    const arm = (cx, cy, rot, hx, hy) => `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="34" fill="${sleeve}" transform="rotate(${rot} ${cx} ${cy})"/><circle cx="${hx}" cy="${hy}" r="11" fill="${skin}"/>`;
    const a = o.arms || 'down';
    if (a === 'up') g += arm(-62, -172, 35, -78, -204) + arm(62, -172, -35, 78, -204);
    else if (a === 'give') g += arm(-52, -118, 15, -60, -86) + arm(72, -138, -75, 104, -134);
    else if (a === 'carry') g += arm(-34, -122, -60, -10, -110) + arm(34, -122, 60, 10, -110);
    else if (a === 'hug') g += arm(-22, -126, -70, 12, -116) + arm(22, -112, 70, -12, -102);
    else if (a === 'pull') g += arm(46, -110, -40, 68, -84) + arm(60, -118, -50, 84, -94);
    else if (a === 'hoe') {
      g += arm(-52, -118, 15, -60, -86);
      g += `<path d="M58 -200 L96 -4" fill="none" stroke-width="10"/><path d="M58 -200 L96 -4" fill="none" stroke="#c98a4b" stroke-width="5"/>
        <path d="M84 -14 L124 -24 L128 -4 L92 4 Z" fill="#adb5bd"/>` + arm(54, -124, -25, 70, -104);
    } else g += arm(-52, -118, 15, -60, -86) + arm(52, -118, -15, 60, -86);
    if (o.hold) g += o.hold;
    // 頭
    g += `<circle cx="0" cy="-212" r="50" fill="${skin}"/>`;
    if (o.style !== 'bald') g += `<path d="M-50 -220 Q-48 -270 0 -270 Q48 -270 50 -220 Q30 -244 4 -236 Q-24 -250 -50 -220 Z" fill="${hair}"/>`;
    if (o.style === 'topknot') g += `<circle cx="0" cy="-276" r="17" fill="${hair}"/>`;
    if (o.style === 'long') g += `<circle cx="-46" cy="-246" r="9" fill="#ff6b8b"/>`;
    if (o.hat === 'douli') g += `<path d="M-92 -236 L0 -300 L92 -236 Q0 -220 -92 -236 Z" fill="#f6d365"/><path d="M-46 -232 L0 -296 M46 -232 L0 -296" fill="none" stroke="#b8902a" stroke-width="3"/>`;
    // 臉
    if (o.sleepy) g += shut(-18, -208) + shut(18, -208);
    else g += eye(-18, -210) + eye(18, -210);
    g += `<circle cx="-32" cy="-190" r="9" fill="#ffb3b3" stroke="none"/><circle cx="32" cy="-190" r="9" fill="#ffb3b3" stroke="none"/>`;
    if (o.beard) g += `<path d="M-26 -186 Q-20 -140 0 -134 Q20 -140 26 -186 Q0 -172 -26 -186 Z" fill="${hair}"/>`;
    const m = o.mouth || 'smile';
    if (m === 'sad') g += `<path d="M-10 -180 Q0 -190 10 -180" fill="none"/>`;
    else if (m === 'o') g += `<ellipse cx="0" cy="-184" rx="7" ry="8" fill="#c92a2a"/>`;
    else if (m === 'grin') g += `<path d="M-14 -190 Q0 -170 14 -190 Z" fill="#c92a2a"/>`;
    else g += `<path d="M-10 -188 Q0 -178 10 -188" fill="none"/>`;
    if (o.sweat) g += `<path d="M62 -246 Q72 -228 66 -220 Q56 -222 62 -246 Z M-64 -232 Q-54 -214 -60 -206 Q-70 -208 -64 -232 Z" fill="#74c0fc"/>`;
    return tapG(at(x, y, s, g, o.flip), anim, sound);
  }

  // 樹樁：底在 (x, y)
  const stump = (x, y, s = 1) => tapG(at(x, y, s, `<path d="M-60 0 Q-70 4 -84 2 L-52 -20 L-46 -90 L46 -90 L52 -20 L84 2 Q70 4 60 0 Z" fill="#9c6b3c"/>
    <ellipse cx="0" cy="-90" rx="46" ry="15" fill="#e0b07a"/><ellipse cx="0" cy="-90" rx="28" ry="8" fill="none" stroke-width="3"/><ellipse cx="0" cy="-90" rx="10" ry="3" fill="none" stroke-width="3"/>
    <path d="M-30 -60 L-26 -30 M20 -70 L24 -36" fill="none" stroke-width="3"/>`), 'wiggle', 'pop', false);

  // 頭暈的星星
  const dizzy = (x, y) => `<g class="twinkle">${[[-40, 0], [0, -22], [40, 0]].map(([dx, dy]) => {
    const cx = x + dx, cy = y + dy;
    return `<path d="M${cx} ${cy - 14} L${cx + 4} ${cy - 4} L${cx + 14} ${cy} L${cx + 4} ${cy + 4} L${cx} ${cy + 14} L${cx - 4} ${cy + 4} L${cx - 14} ${cy} L${cx - 4} ${cy - 4} Z" fill="#ffd43b" stroke="#222" stroke-width="3"/>`;
  }).join('')}</g>`;

  // 田地（咖啡色泥土）
  const field = (y = 380) => `<rect y="${y}" width="800" height="${500 - y}" fill="#9be07a"/><rect y="${y + 30}" width="800" height="${470 - y}" fill="#c98a4b"/>
    ${[y + 50, y + 80].map(yy => `<path d="M0 ${yy} L800 ${yy}" stroke="#a9733d" stroke-width="4"/>`).join('')}`;
  // 一棵秧苗：根在 (x, y)，h 高度；wilt 枯掉
  const sprout = (x, y, h = 50, wilt = false) => {
    const c = wilt ? '#c9a227' : '#40c057';
    const stem = wilt ? `M${x} ${y} Q${x + 4} ${y - h} ${x + h * .5} ${y - h * .6}` : `M${x} ${y} L${x} ${y - h}`;
    const tx = wilt ? x + h * .5 : x, ty = wilt ? y - h * .6 : y - h;
    const leaves = wilt
      ? `<path d="M${tx} ${ty} Q${tx + 22} ${ty - 2} ${tx + 26} ${ty + 22} Q${tx + 4} ${ty + 16} ${tx} ${ty} Z" fill="${c}"/>`
      : `<path d="M${tx} ${ty + 8} Q${tx - 30} ${ty - 4} ${tx - 30} ${ty - 22} Q${tx - 6} ${ty - 16} ${tx} ${ty + 8} Z M${tx} ${ty + 8} Q${tx + 30} ${ty - 4} ${tx + 30} ${ty - 22} Q${tx + 6} ${ty - 16} ${tx} ${ty + 8} Z" fill="${c}"/>`;
    return `<g class="tap" data-anim="wiggle" data-sound="pop" stroke="#222" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="${stem}" fill="none" stroke="#222" stroke-width="10"/><path d="${stem}" fill="none" stroke="${c}" stroke-width="5"/>${leaves}</g>`;
  };
  const sprouts = (xs, h, wilt, y = 440) => xs.map((x, i) => sprout(x, y + (i % 2) * 22, typeof h === 'function' ? h(i) : h, wilt)).join('');

  // 梨子、盤子、桌子
  const pear = (x, y, r = 30) => `<g class="tap" data-anim="jump" data-sound="pop" stroke="#222" stroke-width="4" stroke-linejoin="round">
    <path d="M${x} ${y - r * 1.5} Q${x + r * .55} ${y - r * 1.45} ${x + r * .5} ${y - r * .6} Q${x + r * 1.1} ${y - r * .1} ${x + r * .95} ${y + r * .45} Q${x + r * .7} ${y + r} ${x} ${y + r} Q${x - r * .7} ${y + r} ${x - r * .95} ${y + r * .45} Q${x - r * 1.1} ${y - r * .1} ${x - r * .5} ${y - r * .6} Q${x - r * .55} ${y - r * 1.45} ${x} ${y - r * 1.5} Z" fill="#d8f56a"/>
    <path d="M${x} ${y - r * 1.5} L${x + 4} ${y - r * 1.9}" fill="none" stroke-width="5"/><path d="M${x + 4} ${y - r * 1.8} Q${x + r * .8} ${y - r * 2.1} ${x + r * .9} ${y - r * 1.7} Q${x + r * .4} ${y - r * 1.5} ${x + 4} ${y - r * 1.8} Z" fill="#51cf66"/></g>`;
  const table = (x, y, w = 360) => `<g stroke="#222" stroke-width="5" stroke-linejoin="round"><rect x="${x - w / 2 + 20}" y="${y}" width="22" height="${480 - y}" fill="#9c6332"/><rect x="${x + w / 2 - 42}" y="${y}" width="22" height="${480 - y}" fill="#9c6332"/>
    <rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="28" rx="8" fill="#c98a4b"/></g>`;
  const plate = (x, y, w = 200) => `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w / 9}" fill="#fff" stroke="#222" stroke-width="5"/>`;

  // 北風：會吹氣的雲（臉朝右）
  const wind = (x, y, s = 1, blowing = true) => tapG(at(x, y, s, `
    <path d="M-110 30 Q-150 30 -150 -5 Q-150 -40 -112 -40 Q-110 -90 -55 -90 Q-30 -125 15 -110 Q60 -128 85 -85 Q130 -80 128 -35 Q150 -10 125 25 Q110 45 80 40 Q40 60 0 45 Q-40 60 -70 40 Q-90 50 -110 30 Z" fill="#d0ebff"/>
    ${eye(-10, -40, 9)}${eye(40, -44, 9)}<path d="M-26 -64 L0 -58 M28 -66 L54 -64" fill="none"/>
    <circle cx="-30" cy="-6" r="16" fill="#a5d8ff" stroke="none"/><circle cx="72" cy="-10" r="16" fill="#a5d8ff" stroke="none"/>
    ${blowing ? `<ellipse cx="102" cy="-6" rx="13" ry="11" fill="#c92a2a"/>` : `<path d="M10 0 Q24 14 38 0" fill="none"/>`}`), 'wiggle', 'splash', false);
  const gust = (x, y) => `<g class="drift" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"><path d="M${x} ${y} Q${x + 80} ${y - 20} ${x + 160} ${y}"/><path d="M${x + 20} ${y + 50} Q${x + 110} ${y + 30} ${x + 200} ${y + 55}"/><path d="M${x} ${y + 100} Q${x + 70} ${y + 85} ${x + 140} ${y + 100}"/></g>
    <g fill="none" stroke="#74c0fc" stroke-width="4" stroke-linecap="round"><path d="M${x} ${y} Q${x + 80} ${y - 20} ${x + 160} ${y}"/><path d="M${x + 20} ${y + 50} Q${x + 110} ${y + 30} ${x + 200} ${y + 55}"/><path d="M${x} ${y + 100} Q${x + 70} ${y + 85} ${x + 140} ${y + 100}"/></g>`;
  const rays = (x, y) => `<g class="twinkle" stroke="#ffd43b" stroke-width="8" stroke-linecap="round">${[[0, 0], [60, 30], [-50, 40]].map(([dx, dy]) => `<path d="M${x + dx} ${y + dy} L${x + dx + 30} ${y + dy + 70}"/>`).join('')}</g>`;

  // 小紅母雞：腳底在 (x, y)，臉朝右
  const hen = (x, y, s = 1, flip = false, anim = 'jump', sound = 'pop') => tapG(at(x, y, s, `
    <path d="M-20 -14 L-20 0 M-30 0 L-10 0 M18 -14 L18 0 M8 0 L28 0" fill="none" stroke="#f08c00" stroke-width="7"/>
    <path d="M-50 -82 Q-96 -150 -96 -84 Q-104 -112 -74 -50 Z" fill="#c92a2a"/>
    <ellipse cx="0" cy="-60" rx="62" ry="46" fill="#e8590c"/>
    <path d="M-30 -66 Q-4 -88 22 -66 Q8 -36 -30 -66 Z" fill="#c2410c"/>
    <circle cx="44" cy="-112" r="30" fill="#e8590c"/>
    <path d="M30 -138 Q30 -160 42 -146 Q46 -164 56 -146 Q66 -158 66 -136 Z" fill="#fa5252"/>
    <path d="M70 -118 L94 -108 L70 -98 Z" fill="#ffa94d"/><path d="M68 -98 Q74 -82 64 -84 Q60 -94 68 -98 Z" fill="#fa5252"/>
    ${eye(52, -118, 6)}`, flip), anim, sound);
  // 小雞（用自己的小圓雞，比較好排）
  const chickling = (x, y, s = 1) => tapG(at(x, y, s, `<path d="M-10 -8 L-10 0 M10 -8 L10 0" fill="none" stroke="#f08c00" stroke-width="6"/>
    <circle cx="0" cy="-40" r="34" fill="#ffe066"/><path d="M30 -46 L46 -40 L30 -34 Z" fill="#ffa94d"/>${eye(14, -50, 5)}<path d="M-16 -36 Q-2 -48 6 -30" fill="none"/>`), 'jump', 'pop');
  // 麥子：根在 (x, y)
  const wheat = (x, y, h = 120) => `<g class="tap sway" style="--d:-${(x % 4)}s" data-anim="wiggle" data-sound="pop" stroke="#222" stroke-width="3"><path d="M${x} ${y} L${x} ${y - h}" stroke="#222" stroke-width="9"/><path d="M${x} ${y} L${x} ${y - h}" stroke="#e0a800" stroke-width="4"/>
    ${[0, 1, 2, 3].map(i => `<ellipse cx="${x - 9}" cy="${y - h + 8 + i * 16}" rx="7" ry="12" fill="#fcc419" transform="rotate(-25 ${x - 9} ${y - h + 8 + i * 16})"/><ellipse cx="${x + 9}" cy="${y - h + 8 + i * 16}" rx="7" ry="12" fill="#fcc419" transform="rotate(25 ${x + 9} ${y - h + 8 + i * 16})"/>`).join('')}
    <ellipse cx="${x}" cy="${y - h - 6}" rx="7" ry="12" fill="#fcc419"/></g>`;
  const seeds = (x, y) => [[0, 0], [22, 8], [44, -4], [12, -16], [34, -20]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="7" ry="11" fill="#fcc419" stroke="#222" stroke-width="3" transform="rotate(30 ${x + dx} ${y + dy})"/>`).join('');
  const bread = (x, y, s = 1) => tapG(at(x, y, s, `<path d="M-100 0 Q-110 -70 -40 -80 Q0 -100 40 -80 Q110 -70 100 0 Z" fill="#e8a33d"/>
    <path d="M-50 -64 Q-40 -40 -50 -20 M0 -76 Q10 -50 0 -26 M50 -64 Q60 -40 50 -20" fill="none" stroke="#a5651f" stroke-width="5"/>`), 'boing', 'yay', false);
  const steam = (x, y) => `<g class="float" fill="none" stroke="#adb5bd" stroke-width="5" stroke-linecap="round">${[-20, 0, 20].map(d => `<path d="M${x + d} ${y} Q${x + d - 10} ${y - 15} ${x + d} ${y - 30} Q${x + d + 10} ${y - 45} ${x + d} ${y - 60}"/>`).join('')}</g>`;

  // 熊家：房間、碗、椅子、床、蝴蝶結
  const room = () => `<rect width="800" height="500" fill="#ffe8cc"/><rect y="390" width="800" height="110" fill="#c98a4b"/><path d="M0 390 L800 390" stroke="#222" stroke-width="5"/>
    <g stroke="#222" stroke-width="5"><rect x="330" y="50" width="140" height="110" rx="10" fill="#a5d8ff"/><path d="M400 50 L400 160 M330 105 L470 105" fill="none"/></g>`;
  const bowl = (x, y, r, color, hot) => `<g class="tap" data-anim="jump" data-sound="pop" stroke="#222" stroke-width="5" stroke-linejoin="round">
    <ellipse cx="${x}" cy="${y - r * .55}" rx="${r}" ry="${r * .22}" fill="#fff3bf"/><path d="M${x - r} ${y - r * .55} Q${x - r} ${y + r * .3} ${x} ${y + r * .3} Q${x + r} ${y + r * .3} ${x + r} ${y - r * .55} Q${x} ${y - r * .3} ${x - r} ${y - r * .55} Z" fill="${color}"/></g>${hot ? steam(x, y - r * .8) : ''}`;
  const chair = (x, y, s = 1, color = '#74c0fc', broken = false) => tapG(at(x, y, s, broken
    ? `<rect x="-70" y="-26" width="140" height="22" rx="6" fill="${color}" transform="rotate(12)"/><rect x="-60" y="-60" width="18" height="60" rx="5" fill="#9c6332" transform="rotate(-60 -50 -30)"/><rect x="30" y="-40" width="18" height="44" rx="5" fill="#9c6332" transform="rotate(70 40 -20)"/><rect x="-74" y="-150" width="22" height="110" rx="6" fill="${color}" transform="rotate(-70 -64 -40)"/>`
    : `<rect x="-60" y="-200" width="22" height="200" rx="6" fill="${color}"/><rect x="40" y="-90" width="18" height="90" rx="5" fill="#9c6332"/><rect x="-42" y="-90" width="18" height="90" rx="5" fill="#9c6332"/>
       <rect x="-66" y="-108" width="134" height="26" rx="8" fill="${color}"/>`), broken ? 'wiggle' : 'jump', 'boing', false);
  // 床：腳在 y，中心 x，寬 w；sleeper 有人睡
  const smallBed = (x, y, w, color, sleeper) => {
    const k = w / 200;
    return tapG(at(x, y, k, `<rect x="-100" y="-150" width="22" height="150" rx="8" fill="#c98a4b"/><rect x="78" y="-100" width="22" height="100" rx="8" fill="#c98a4b"/>
      <rect x="-86" y="-70" width="172" height="40" rx="10" fill="#fff"/><ellipse cx="-54" cy="-74" rx="28" ry="16" fill="#fff"/>
      ${sleeper ? `<path d="M-68 -110 Q-90 -110 -88 -70 L-30 -66 Q-28 -110 -68 -110 Z" fill="#ffd43b"/><circle cx="-60" cy="-86" r="24" fill="#ffd8b8"/><path d="M-84 -94 Q-60 -122 -36 -94 Q-58 -102 -84 -94 Z" fill="#ffd43b"/>${shut(-68, -86)}${shut(-50, -86)}` : ''}
      <path d="M-40 -${sleeper ? 74 : 62} Q20 -${sleeper ? 92 : 70} 86 -${sleeper ? 74 : 62} L86 -30 L-40 -30 Z" fill="${color}"/>`), 'boing', 'pop', false);
  };
  const bow = (x, y, r = 16) => `<g stroke="#222" stroke-width="4" stroke-linejoin="round"><path d="M${x} ${y} L${x - r * 1.6} ${y - r} L${x - r * 1.6} ${y + r} Z M${x} ${y} L${x + r * 1.6} ${y - r} L${x + r * 1.6} ${y + r} Z" fill="#ff6b8b"/><circle cx="${x}" cy="${y}" r="${r * .5}" fill="#ff6b8b"/></g>`;
  // 三隻熊：放在 (x, y)，w 寬；熊媽媽戴蝴蝶結
  const papa = (x, y, w = 330, a = 'boing', snd = 'roar') => put('bear', x, y, w, a, snd);
  const mama = (x, y, w = 270, a = 'jump', snd = 'pop') => `<g>${put('bear', x, y, w, a, snd)}${bow(x + w * .49, y + w * .14, w / 18)}</g>`;
  const baby = (x, y, w = 200, a = 'jump', snd = 'boing') => put('bear', x, y, w, a, snd);

  // 角色設定
  const FARMER = { shirt: '#4dabf7', pants: '#495057', hat: 'douli' };
  const KONG = { shirt: '#ffa94d', pants: '#5c7cfa', style: 'topknot', hair: '#222' };
  const BRO1 = { shirt: '#69db7c', pants: '#5c7cfa', style: 'topknot', hair: '#222' };
  const BRO2 = { shirt: '#b197fc', pants: '#5c7cfa', style: 'topknot', hair: '#222' };
  const DAD = { shirt: '#4c6ef5', pants: '#364fc7', style: 'topknot', hair: '#222', beard: true, coat: '#4c6ef5' };
  const GIRL = { shirt: '#f783ac', hair: '#ffd43b', style: 'long', dress: true };
  const WALKER = { coat: '#a9733d', pants: '#495057', shirt: '#fff' };

  window.BOOKS.push(
    /* ---------- 守株待兔 ---------- */
    {
      id: 'wait-rabbit', tag: '經典', title: '守株待兔',
      cover: svg(scene.day() + scene.sun() + field() + stump(560, 440) + person(240, 450, 1, { ...FARMER, sit: true }) + put('bunny', 560, 170, 200)),
      pages: [
        { text: '從前有一個農夫，每天在田裡工作。', art: svg(scene.day() + scene.sun() + field() + scene.tree(690) + stump(560, 440) + person(260, 460, 1.1, { ...FARMER, arms: 'hoe' })) },
        { text: '有一天，一隻兔子跑得好快好快。', art: svg(scene.day() + scene.sun(110) + field() + stump(600, 440) + put('bunny', 140, 140, 330, 'jump', 'boing') + `<path d="M120 300 L60 300 M130 340 L50 340 M120 380 L70 380" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`) },
        { text: '碰！兔子撞到樹樁，暈倒了。', art: svg(scene.day() + field() + stump(360, 440) + put('bunny', 360, 230, 260, 'wiggle', 'boing') + dizzy(480, 230) + scene.bubble(70, 60, '碰！', 150)) },
        { text: '農夫撿到兔子，開心得不得了。', art: svg(scene.day() + scene.sun() + field() + stump(620, 440) + person(330, 460, 1.1, { ...FARMER, arms: 'up', mouth: 'grin' }, 'jump', 'yay') + put('bunny', 70, 200, 220)) },
        { text: '他想：「我每天坐在這裡等兔子就好！」', art: svg(scene.day() + field() + stump(380, 440) + person(380, 370, 1, { ...FARMER, sit: true }) + scene.bubble(470, 60, '等兔子！', 230)) },
        { text: '等了好多天，兔子都沒有再來，田裡長滿了野草。', art: svg(scene.sunset() + `<rect y="380" width="800" height="120" fill="#74b816"/>` + sprouts([40, 110, 180, 560, 630, 700, 770], 70) + stump(380, 440) + person(380, 370, 1, { ...FARMER, sit: true, sleepy: true, mouth: 'sad' }, 'wiggle', 'pop') + scene.zzz(470, 150)) },
        { text: '不能只等好運氣，要認真努力才有收穫喔！', art: svg(scene.day() + scene.sun() + scene.rice() + person(400, 460, 1.1, { ...FARMER, arms: 'hoe' }, 'jump', 'yay') + scene.heart(170, 130) + scene.heart(630, 150, 24)) },
      ],
    },

    /* ---------- 揠苗助長 ---------- */
    {
      id: 'pull-sprouts', tag: '經典', title: '揠苗助長',
      cover: svg(scene.day() + scene.sun() + field() + sprouts([60, 140, 520, 600, 680, 760], i => 90 + (i % 2) * 30) + person(330, 460, 1.1, { ...FARMER, arms: 'pull' })),
      pages: [
        { text: '農夫在田裡，種了好多小秧苗。', art: svg(scene.day() + scene.sun() + field() + sprouts([60, 130, 200, 540, 610, 680, 750], 36) + person(370, 460, 1.1, { ...FARMER, arms: 'down' })) },
        { text: '他每天看，覺得秧苗長得好慢喔。', art: svg(scene.day() + field() + sprouts([60, 130, 200, 540, 610, 680, 750], 40) + person(370, 460, 1.1, { ...FARMER, mouth: 'sad' }, 'wiggle', 'pop') + scene.bubble(460, 50, '好慢喔！', 220)) },
        { text: '他想到一個辦法：把秧苗拉高一點！', art: svg(scene.day() + field() + sprouts([60, 130, 520, 600, 680, 760], 40) + person(250, 460, 1.1, { ...FARMER, arms: 'pull' }) + sprout(360, 440, 100) + `<path d="M330 330 L330 290 M360 300 L360 260 M390 330 L390 290" stroke="#fa5252" stroke-width="7" stroke-linecap="round"/>`) },
        { text: '一棵一棵拔高，累得滿頭大汗。', art: svg(scene.day() + scene.sun() + field() + sprouts([40, 110, 180, 560, 630, 700, 770], 120) + person(380, 460, 1.1, { ...FARMER, arms: 'up', sweat: true, mouth: 'grin' }, 'jump', 'yay')) },
        { text: '第二天一看，秧苗全都垂下來，枯掉了。', art: svg(scene.day() + field() + sprouts([40, 110, 180, 560, 630, 700, 770], 110, true) + person(380, 460, 1.1, { ...FARMER, mouth: 'o' }, 'wiggle', 'boing')) },
        { text: '長大要慢慢來，太心急反而會壞事喔！', art: svg(scene.day() + scene.sun() + field() + sprouts([40, 110, 180, 250, 550, 620, 690, 760], i => 50 + i * 8) + person(400, 460, 1.1, { ...FARMER }, 'jump', 'yay') + scene.heart(400, 100)) },
      ],
    },

    /* ---------- 孔融讓梨 ---------- */
    {
      id: 'kong-rong', tag: '經典', title: '孔融讓梨',
      cover: svg(scene.day() + scene.grass() + person(400, 460, 1.1, { ...KONG, arms: 'give', hold: pear(104, -160, 22) }) + pear(160, 400, 40) + pear(640, 400, 40)),
      pages: [
        { text: '孔融四歲了，他有好幾個哥哥。', art: svg(scene.day() + scene.sun() + scene.grass() + person(170, 460, 1.15, BRO1) + person(620, 460, 1.15, BRO2) + person(400, 460, .85, KONG, 'jump', 'yay')) },
        { text: '有一天，家裡來了一盤香甜的梨子。', art: svg(room() + table(400, 360, 420) + plate(400, 340, 300) + pear(300, 300, 34) + pear(400, 296, 44) + pear(500, 304, 30) + pear(350, 320, 22) + pear(452, 322, 26)) },
        { text: '爸爸說：「孔融，你先挑吧！」', art: svg(room() + table(560, 380, 300) + plate(560, 360, 220) + pear(510, 330, 34) + pear(600, 326, 40) + pear(560, 344, 20) + person(160, 470, 1.2, DAD) + person(390, 470, .85, KONG) + scene.bubble(30, 30, '你先挑吧！', 240)) },
        { text: '孔融拿了一顆最小的梨子。', art: svg(room() + table(560, 380, 300) + plate(560, 360, 220) + pear(510, 330, 34) + pear(600, 326, 40) + person(330, 470, 1, { ...KONG, arms: 'give', hold: pear(104, -160, 20) }, 'jump', 'pop')) },
        { text: '爸爸問：「為什麼拿小的呢？」', art: svg(room() + person(200, 470, 1.2, DAD, 'wiggle', 'pop') + person(560, 470, .95, { ...KONG, arms: 'give', hold: pear(104, -160, 20) }) + scene.bubble(250, 30, '為什麼呢？', 240)) },
        { text: '「我比較小，大的給哥哥吃。」', art: svg(room() + person(130, 470, 1.1, { ...BRO1, arms: 'give', hold: pear(104, -160, 30) }) + person(660, 470, 1.1, { ...BRO2, arms: 'up', mouth: 'grin' }) + person(400, 470, .85, { ...KONG, arms: 'give', hold: pear(104, -160, 20) }, 'jump', 'twinkle') + scene.bubble(260, 40, '大的給哥哥！', 280)) },
        { text: '好東西一起分享，懂得禮讓真棒！', art: svg(scene.day() + scene.sun() + scene.grass() + person(160, 460, 1.1, { ...BRO1, arms: 'up', mouth: 'grin' }) + person(640, 460, 1.1, { ...BRO2, arms: 'up', mouth: 'grin' }) + person(400, 460, .9, { ...KONG, arms: 'up', mouth: 'grin' }, 'jump', 'yay') + scene.heart(280, 110) + scene.heart(520, 110)) },
      ],
    },

    /* ---------- 北風與太陽 ---------- */
    {
      id: 'wind-sun', tag: '經典', title: '北風與太陽',
      cover: svg(scene.day() + scene.grass() + wind(210, 170, 1) + put('s-sun', 400, 30, 340)),
      pages: [
        { text: '北風和太陽比賽，看誰的力氣大。', art: svg(scene.day() + scene.grass() + wind(210, 200, 1.05) + put('s-sun', 380, 40, 360, 'boing', 'twinkle') + scene.flowers()) },
        { text: '路上有一個人，穿著厚厚的外套。', art: svg(scene.day() + scene.grass() + scene.road() + scene.tree(140) + scene.tree(680) + person(410, 450, 1.15, WALKER)) },
        { text: '北風用力吹，呼——呼——好大的風！', art: svg(scene.day() + scene.road() + wind(170, 160, .95) + gust(330, 140) + person(620, 450, 1.1, { ...WALKER, flap: true, mouth: 'o' }, 'wiggle', 'boing')) },
        { text: '可是風越大，他把外套拉得越緊。', art: svg(scene.day() + scene.road() + wind(150, 160, .85) + gust(300, 160) + person(590, 450, 1.15, { ...WALKER, arms: 'hug', mouth: 'sad' }, 'wiggle', 'boing')) },
        { text: '換太陽了，太陽暖暖地照著大地。', art: svg(scene.day() + scene.road() + put('s-sun', 0, 0, 340, 'boing', 'twinkle') + rays(300, 220) + person(580, 450, 1.15, { ...WALKER, mouth: 'smile' })) },
        { text: '好熱喔！他自己把外套脫下來了。', art: svg(scene.day() + scene.road() + put('s-sun', 0, 0, 300, 'boing', 'twinkle') + rays(280, 200) + person(560, 450, 1.15, { ...WALKER, coat: '', shirt: '#fff', arms: 'give', sweat: true, mouth: 'grin', hold: `<path d="M90 -148 Q118 -150 120 -120 L126 -40 L92 -50 Q88 -100 90 -148 Z" fill="#a9733d"/>` }, 'jump', 'yay')) },
        { text: '溫柔對待別人，比兇兇的更有用喔！', art: svg(scene.day() + scene.grass() + wind(200, 200, .9, false) + put('s-sun', 380, 40, 340, 'boing', 'twinkle') + scene.heart(400, 400) + scene.flowers()) },
      ],
    },

    /* ---------- 小紅母雞 ---------- */
    {
      id: 'red-hen', tag: '經典', title: '小紅母雞',
      cover: svg(scene.day() + scene.sun() + scene.grass() + wheat(560, 420, 170) + wheat(620, 430, 150) + wheat(680, 420, 170) + hen(320, 440, 1.6) + bread(160, 450, .7)),
      pages: [
        { text: '小紅母雞在地上，撿到一些麥子。', art: svg(scene.day() + scene.sun() + scene.grass() + hen(330, 440, 1.8, false, 'jump', 'pop') + seeds(560, 430)) },
        { text: '「誰幫我種麥子？」大家都說：「不要！」', art: svg(scene.day() + scene.grass() + hen(140, 450, 1.3) + put('cat', 250, 200, 250, 'wiggle', 'pop') + put('dog', 400, 200, 250, 'wiggle', 'woof') + put('pig', 550, 200, 250, 'wiggle', 'boing') + scene.bubble(440, 40, '不要！', 180)) },
        { text: '母雞只好自己種，麥子慢慢長高了。', art: svg(scene.day() + scene.sun() + field() + hen(220, 450, 1.5) + [460, 530, 600, 670, 740].map((x, i) => wheat(x, 440 + (i % 2) * 20, 110 + i * 10)).join('')) },
        { text: '要割麥子了，大家還是說：「不要！」', art: svg(scene.day() + scene.grass() + [480, 540, 600, 660, 720].map(x => wheat(x, 430, 160)).join('') + hen(160, 450, 1.3, false, 'wiggle', 'pop') + put('cat', 220, 230, 200) + put('dog', 330, 230, 200, 'wiggle', 'woof') + scene.bubble(160, 40, '不要！', 180)) },
        { text: '母雞自己做，烤出香香的麵包。', art: svg(room() + table(500, 380, 360) + bread(500, 360, 1) + steam(500, 270) + hen(190, 460, 1.6, false, 'jump', 'yay')) },
        { text: '「誰要吃麵包？」大家都說：「我要！」', art: svg(room() + table(160, 380, 260) + bread(160, 360, .8) + hen(160, 250, .9) + put('cat', 290, 200, 230, 'jump', 'pop') + put('dog', 430, 200, 230, 'jump', 'woof') + put('pig', 570, 200, 230, 'jump', 'boing') + scene.bubble(440, 40, '我要！', 180)) },
        { text: '一起幫忙做事，才能一起分享喔！', art: svg(scene.day() + scene.sun() + scene.grass() + bread(400, 440, .9) + hen(230, 450, 1.3, false, 'jump', 'yay') + chickling(520, 450, 1) + chickling(610, 455, .9) + chickling(690, 450, 1) + scene.heart(400, 140)) },
      ],
    },

    /* ---------- 金髮女孩與三隻熊 ---------- */
    {
      id: 'goldilocks', tag: '經典', title: '金髮女孩與三隻熊',
      cover: svg(scene.forest() + scene.tree(90) + scene.tree(710) + papa(130, 160, 330) + mama(330, 200, 260) + baby(520, 270, 180) + person(640, 460, .9, GIRL)),
      pages: [
        { text: '森林裡住著熊爸爸、熊媽媽和熊寶寶。', art: svg(scene.forest() + scene.tree(80) + scene.house('wood', 590, 170, 200) + papa(60, 150, 340) + mama(280, 190, 280) + baby(450, 260, 200)) },
        { text: '金髮女孩走進熊的家，看到三碗粥。', art: svg(room() + table(520, 360, 440) + bowl(390, 340, 60, '#4dabf7', true) + bowl(530, 340, 46, '#ff922b', false) + bowl(650, 340, 34, '#ff6b8b', false) + person(150, 470, 1.1, { ...GIRL, mouth: 'o' })) },
        { text: '大碗太燙，中碗太冷，小碗剛剛好！', art: svg(room() + table(520, 360, 440) + bowl(390, 340, 60, '#4dabf7', true) + bowl(530, 340, 46, '#ff922b', false) + bowl(650, 340, 34, '#ff6b8b', false) + person(150, 470, 1.1, { ...GIRL, arms: 'up', mouth: 'grin' }, 'jump', 'yay') + scene.bubble(250, 40, '剛剛好！', 220)) },
        { text: '她坐上小椅子，碰！椅子壞掉了。', art: svg(room() + chair(120, 450, 1.1, '#4dabf7') + chair(270, 450, .9, '#ff922b') + chair(560, 450, .8, '#ff6b8b', true) + person(560, 470, .9, { ...GIRL, mouth: 'o', arms: 'up' }, 'wiggle', 'boing') + scene.bubble(80, 40, '碰！', 150)) },
        { text: '她好累，在小床上睡著了。', art: svg(room() + smallBed(140, 470, 220, '#4dabf7') + smallBed(390, 470, 190, '#ff922b') + smallBed(630, 470, 170, '#ff6b8b', true) + scene.zzz(600, 300)) },
        { text: '熊回家了，熊寶寶說：「有人睡我的床！」', art: svg(room() + smallBed(620, 470, 220, '#ff6b8b', true) + papa(-20, 170, 300, 'boing', 'roar') + mama(150, 200, 250) + baby(320, 260, 190, 'jump', 'boing') + scene.bubble(380, 40, '有人睡我的床！', 330)) },
        { text: '女孩說：「對不起！」別人的東西，要先問過才能用喔！', art: svg(scene.forest() + scene.tree(720) + papa(10, 160, 300) + baby(230, 260, 190, 'jump', 'twinkle') + person(560, 460, 1, { ...GIRL }, 'jump', 'twinkle') + scene.bubble(470, 40, '對不起！', 220) + scene.heart(420, 200)) },
      ],
    },
  );
})();
