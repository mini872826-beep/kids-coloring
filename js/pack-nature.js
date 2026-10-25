/* 線稿包：昆蟲、太空 */
(function () {
  const { eye, ground, scallop, sparkle, wheel } = window.ART.helpers;

  // 左右對稱：把 path 的 x 座標以 x=400 翻轉（只用於 M/L/Q/C 絕對座標）
  const flip = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${800 - +x} ${y}`);
  const sym = (fill, d) => `<path fill="${fill}" d="${d}"/><path fill="${fill}" d="${flip(d)}"/>`;
  const symLine = d => `<path d="${d} ${flip(d)}"/>`;
  // 白眼球 + 眼珠
  const bigEye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f1f3f5"/>${eye(x, y + r * .15, r * .55)}`;
  const smile = (x, y, w) => `<path d="M${x - w} ${y} Q${x} ${y + w * .8} ${x + w} ${y}"/>`;
  const cheeks = (x1, x2, y, r = 14) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#ffc2c2"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#ffc2c2"/>`;
  // 橢圓上的一條直條紋（上下邊貼著橢圓）
  function band(cx, cy, rx, ry, x1, x2, fill, bend = 18) {
    const yt = x => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    const yb = x => 2 * cy - yt(x);
    let d = `M${x1} ${yt(x1).toFixed(1)}`;
    for (let x = x1 + 4; x < x2; x += 4) d += ` L${x} ${yt(x).toFixed(1)}`;
    d += ` L${x2} ${yt(x2).toFixed(1)} Q${x2 + bend} ${cy} ${x2} ${yb(x2).toFixed(1)}`;
    for (let x = x2 - 4; x > x1; x -= 4) d += ` L${x} ${yb(x).toFixed(1)}`;
    d += ` L${x1} ${yb(x1).toFixed(1)} Q${x1 + bend} ${cy} ${x1} ${yt(x1).toFixed(1)} Z`;
    return `<path fill="${fill}" d="${d}"/>`;
  }
  function star(cx, cy, R, r, fill) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      d += `${i ? ' L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }
    return `<path fill="${fill}" stroke-linejoin="round" d="${d} Z"/>`;
  }

  /* ---------------- 昆蟲 ---------------- */
  const butterfly = `
    ${sym('#ff8fab', 'M395 270 Q320 110 190 125 Q100 140 125 240 Q150 320 395 305 Z')}
    ${sym('#ffb3c6', 'M395 310 Q260 300 200 380 Q165 465 250 480 Q340 485 395 345 Z')}
    <circle cx="225" cy="215" r="38" fill="#ffd43b"/><circle cx="575" cy="215" r="38" fill="#ffd43b"/>
    <circle cx="300" cy="245" r="18" fill="#74c0fc"/><circle cx="500" cy="245" r="18" fill="#74c0fc"/>
    <circle cx="265" cy="420" r="28" fill="#b2f2bb"/><circle cx="535" cy="420" r="28" fill="#b2f2bb"/>
    <ellipse cx="400" cy="345" rx="28" ry="120" fill="#9775fa"/>
    ${symLine('M385 165 Q365 100 330 80')}
    <circle cx="330" cy="80" r="13" fill="#9775fa"/><circle cx="470" cy="80" r="13" fill="#9775fa"/>
    <circle cx="400" cy="205" r="52" fill="#b197fc"/>
    ${eye(381, 198, 10)} ${eye(419, 198, 10)}
    ${smile(400, 222, 16)}
    ${cheeks(365, 435, 225, 9)}
    ${sparkle(110, 470, 16)} ${sparkle(690, 470, 16, '#74c0fc')} ${sparkle(660, 90, 14)}`;

  const ladybug = `
    ${symLine('M290 300 L215 270 L190 300')}
    ${symLine('M275 390 L195 400 L175 440')}
    ${symLine('M300 470 L230 510 L230 545')}
    ${symLine('M365 90 Q340 50 305 52')}
    <circle cx="305" cy="52" r="12" fill="#495057"/><circle cx="495" cy="52" r="12" fill="#495057"/>
    <circle cx="400" cy="155" r="82" fill="#5c5f66"/>
    <circle cx="400" cy="365" r="168" fill="#ff4b3e"/>
    <path d="M400 200 L400 532"/>
    <circle cx="325" cy="290" r="30" fill="#222"/><circle cx="475" cy="290" r="30" fill="#222"/>
    <circle cx="300" cy="395" r="26" fill="#222"/><circle cx="500" cy="395" r="26" fill="#222"/>
    <circle cx="352" cy="470" r="22" fill="#222"/><circle cx="448" cy="470" r="22" fill="#222"/>
    ${bigEye(368, 125, 20)} ${bigEye(432, 125, 20)}
    ${smile(400, 168, 18)}
    ${sparkle(110, 140, 16)} ${sparkle(690, 140, 16, '#69db7c')}`;

  const bee = `
    <path fill="#868e96" d="M590 320 L655 345 L590 370 Z"/>
    <ellipse cx="370" cy="200" rx="55" ry="85" fill="#d0ebff" transform="rotate(-20 370 200)"/>
    <ellipse cx="465" cy="205" rx="55" ry="85" fill="#d0ebff" transform="rotate(20 465 205)"/>
    ${symLine('M330 450 L320 490')} <path d="M420 455 L425 495 M500 445 L510 485"/>
    <ellipse cx="430" cy="345" rx="170" ry="115" fill="#ffd43b"/>
    ${band(430, 345, 170, 115, 385, 425, '#495057')}
    ${band(430, 345, 170, 115, 485, 525, '#495057')}
    <path d="M215 250 Q190 180 160 160 M260 245 Q265 195 280 168"/>
    <circle cx="160" cy="160" r="12" fill="#495057"/><circle cx="280" cy="166" r="12" fill="#495057"/>
    <circle cx="240" cy="330" r="92" fill="#ffe066"/>
    ${eye(210, 310, 12)} ${eye(270, 310, 12)}
    ${smile(240, 350, 22)}
    ${cheeks(190, 290, 350, 12)}
    ${sparkle(640, 120, 16)} ${sparkle(120, 470, 14, '#ff8fab')}
    <circle cx="660" cy="470" r="22" fill="#ff8fab"/><circle cx="660" cy="470" r="9" fill="#ffd43b"/>`;

  const ant = `
    <path d="M370 345 L320 400 L295 470 M400 355 L400 470 M430 345 L480 400 L510 470"/>
    <path d="M200 225 Q170 150 130 140 M260 220 Q275 150 320 130"/>
    <circle cx="130" cy="140" r="12" fill="#c92a2a"/><circle cx="320" cy="130" r="12" fill="#c92a2a"/>
    <ellipse cx="590" cy="320" rx="130" ry="95" fill="#e8590c"/>
    <ellipse cx="410" cy="315" rx="65" ry="48" fill="#fd7e14"/>
    <circle cx="240" cy="290" r="80" fill="#ff922b"/>
    ${eye(210, 275, 12)} ${eye(268, 275, 12)}
    ${smile(240, 315, 22)}
    ${cheeks(192, 290, 318, 11)}
    ${ground(472)}
    ${sparkle(640, 120, 16)} ${sparkle(120, 400, 14, '#69db7c')}`;

  const dragonfly = `
    <ellipse cx="300" cy="180" rx="40" ry="120" fill="#d0ebff" transform="rotate(-20 300 180)"/>
    <ellipse cx="392" cy="185" rx="40" ry="115" fill="#d0ebff" transform="rotate(20 392 185)"/>
    <ellipse cx="300" cy="420" rx="40" ry="120" fill="#d0ebff" transform="rotate(20 300 420)"/>
    <ellipse cx="392" cy="415" rx="40" ry="115" fill="#d0ebff" transform="rotate(-20 392 415)"/>
    <path fill="#339af0" d="M360 283 L700 288 Q735 300 700 312 L360 317 Z"/>
    <path d="M430 285 L430 315 M490 286 L490 314 M550 287 L550 313 M610 288 L610 312 M665 289 L665 311"/>
    <ellipse cx="335" cy="300" rx="50" ry="42" fill="#4dabf7"/>
    <circle cx="235" cy="300" r="66" fill="#74c0fc"/>
    ${bigEye(212, 280, 20)} ${bigEye(262, 280, 20)}
    ${smile(237, 320, 18)}
    ${sparkle(600, 120, 16)} ${sparkle(640, 480, 14, '#69db7c')} ${sparkle(120, 140, 14)}`;

  const caterpillar = `
    ${[140, 230, 320, 410, 500].map(x => `<ellipse cx="${x}" cy="452" rx="16" ry="11" fill="#2f9e44"/>`).join('')}
    <circle cx="140" cy="385" r="62" fill="#8ce99a"/>
    <circle cx="230" cy="365" r="62" fill="#69db7c"/>
    <circle cx="320" cy="385" r="62" fill="#8ce99a"/>
    <circle cx="410" cy="365" r="62" fill="#69db7c"/>
    <circle cx="500" cy="385" r="62" fill="#8ce99a"/>
    ${[140, 320, 500].map(x => `<circle cx="${x}" cy="370" r="14" fill="#ffd43b"/>`).join('')}
    ${[230, 410].map(x => `<circle cx="${x}" cy="350" r="14" fill="#ffd43b"/>`).join('')}
    <path d="M570 230 Q550 170 520 150 M630 230 Q650 165 690 150"/>
    <circle cx="520" cy="150" r="13" fill="#ff8fab"/><circle cx="690" cy="150" r="13" fill="#ff8fab"/>
    <circle cx="600" cy="320" r="95" fill="#51cf66"/>
    ${eye(568, 300, 13)} ${eye(632, 300, 13)}
    ${smile(600, 345, 26)}
    ${cheeks(545, 655, 345, 13)}
    ${ground(465)}
    ${sparkle(130, 150, 16)} ${sparkle(330, 120, 14, '#ff8fab')}`;

  const snail = `
    <path fill="#ffd8a8" d="M110 470 Q110 425 180 425 L555 425 Q560 320 595 270 Q630 225 675 245 Q715 270 700 340 Q690 400 685 470 Z"/>
    <path d="M615 255 Q600 200 585 170 M665 250 Q685 200 705 175"/>
    ${bigEye(585, 165, 20)} ${bigEye(705, 170, 20)}
    <circle cx="370" cy="295" r="140" fill="#ff922b"/>
    <path d="M380 300 Q395 275 370 272 Q340 275 345 310 Q355 345 395 340 Q440 330 435 285 Q425 228 365 228 Q295 238 295 310 Q300 380 375 392 Q460 400 492 330"/>
    <circle cx="300" cy="210" r="14" fill="#ffd43b"/><circle cx="455" cy="395" r="12" fill="#ffd43b"/>
    ${smile(650, 330, 20)}
    <circle cx="690" cy="305" r="11" fill="#ffc2c2"/>
    ${ground(470)}
    ${sparkle(130, 140, 16)} ${sparkle(640, 90, 14, '#74c0fc')}`;

  const grasshopper = `
    <path d="M250 360 L215 420 L230 470 M330 375 L320 425 L300 470"/>
    <path d="M160 245 Q170 140 300 90 M195 235 Q230 150 360 120"/>
    <ellipse cx="400" cy="320" rx="200" ry="62" fill="#69db7c"/>
    <path fill="#94d82d" d="M290 290 Q450 245 620 300 Q470 330 290 302 Z"/>
    <path fill="#40c057" d="M440 345 Q500 175 585 180 Q620 190 600 225 Q540 300 495 365 Z"/>
    <path fill="#40c057" d="M578 198 L668 455 L645 462 L560 215 Z"/>
    <ellipse cx="660" cy="465" rx="26" ry="10" fill="#2f9e44"/>
    <ellipse cx="190" cy="295" rx="78" ry="72" fill="#8ce99a"/>
    ${eye(165, 280, 12)} ${eye(212, 280, 12)}
    ${smile(188, 318, 20)}
    ${cheeks(145, 232, 315, 11)}
    ${ground(472)}
    ${sparkle(630, 100, 16)} ${sparkle(110, 470, 14, '#ff8fab')}`;

  const firefly = `
    <ellipse cx="300" cy="250" rx="60" ry="120" fill="#e3fafc" transform="rotate(-45 300 250)"/>
    <ellipse cx="500" cy="250" rx="60" ry="120" fill="#e3fafc" transform="rotate(45 500 250)"/>
    <path d="M400 528 L400 552 M315 495 L295 515 M485 495 L505 515 M300 435 L272 435 M500 435 L528 435"/>
    <ellipse cx="400" cy="440" rx="82" ry="72" fill="#ffe066"/>
    ${symLine('M310 300 L255 330')}
    <ellipse cx="400" cy="325" rx="92" ry="115" fill="#5c7cfa"/>
    <path d="M400 230 L400 400"/>
    ${symLine('M375 130 Q355 75 325 62')}
    <circle cx="325" cy="62" r="12" fill="#5c7cfa"/><circle cx="475" cy="62" r="12" fill="#5c7cfa"/>
    <circle cx="400" cy="190" r="70" fill="#748ffc"/>
    ${eye(375, 180, 12)} ${eye(425, 180, 12)}
    ${smile(400, 215, 20)}
    ${cheeks(355, 445, 215, 11)}
    ${sparkle(120, 470, 18)} ${sparkle(680, 470, 18)} ${sparkle(130, 100, 14)} ${sparkle(670, 100, 14)}`;

  const beetle = `
    <path d="M300 420 L270 490 M420 450 L410 495 M540 440 L570 495"/>
    <ellipse cx="450" cy="335" rx="200" ry="118" fill="#a9652d"/>
    <path d="M300 255 Q470 305 645 330"/>
    <path d="M250 320 Q250 230 340 225"/>
    <path fill="#8d5524" d="M195 290 Q140 170 195 110 Q222 92 225 125 Q215 190 260 270 Z"/>
    <path fill="#8d5524" d="M300 245 Q300 190 335 170 Q350 165 345 185 Q335 215 340 250 Z"/>
    <circle cx="235" cy="340" r="78" fill="#c0803f"/>
    ${eye(208, 325, 12)} ${eye(260, 325, 12)}
    ${smile(234, 362, 20)}
    ${cheeks(190, 280, 362, 11)}
    ${ground(497)}
    ${sparkle(640, 120, 16)} ${sparkle(110, 470, 14, '#69db7c')}`;

  const spider = `
    <path d="M400 42 L400 245"/>
    ${symLine('M310 300 Q230 190 150 255')}
    ${symLine('M298 340 Q200 260 115 335')}
    ${symLine('M300 385 Q200 345 130 440')}
    ${symLine('M318 425 Q250 430 200 510')}
    <circle cx="400" cy="360" r="112" fill="#b197fc"/>
    ${bigEye(360, 335, 26)} ${bigEye(440, 335, 26)}
    ${smile(400, 395, 28)}
    ${cheeks(330, 470, 395, 14)}
    <circle cx="400" cy="250" r="16" fill="#ffd43b"/>
    ${sparkle(120, 120, 16)} ${sparkle(680, 120, 16, '#74c0fc')}`;

  const cicada = `
    <ellipse cx="400" cy="310" rx="82" ry="145" fill="#5c940d"/>
    ${sym('#e3fafc', 'M388 195 Q255 225 262 420 Q275 525 355 515 Q392 420 393 200 Z')}
    ${symLine('M380 230 Q320 330 330 490 M350 240 Q290 300 285 420')}
    <ellipse cx="400" cy="155" rx="100" ry="58" fill="#94d82d"/>
    <circle cx="312" cy="145" r="32" fill="#74b816"/><circle cx="488" cy="145" r="32" fill="#74b816"/>
    ${eye(312, 148, 14)} ${eye(488, 148, 14)}
    ${smile(400, 170, 24)}
    ${cheeks(355, 445, 175, 11)}
    ${sparkle(130, 130, 16)} ${sparkle(670, 130, 16)} ${sparkle(150, 470, 14, '#74c0fc')} ${sparkle(650, 470, 14, '#74c0fc')}`;

  const mantis = `
    <path d="M410 395 L360 440 L345 500 M470 420 L480 460 L450 500 M560 430 L600 465 L615 500"/>
    <path d="M300 125 Q270 70 220 55 M355 125 Q380 70 430 52"/>
    <ellipse cx="530" cy="395" rx="170" ry="55" fill="#69db7c" transform="rotate(15 530 395)"/>
    <path fill="#94d82d" d="M430 360 Q560 340 680 430 Q560 425 430 385 Z"/>
    <path fill="#40c057" d="M352 232 L262 310 Q238 322 228 298 L212 228 Q210 205 232 205 Q248 206 252 225 L265 280 L340 212 Z"/>
    <path fill="#51cf66" d="M395 395 Q345 300 312 215 Q328 198 348 210 Q385 300 435 380 Z"/>
    <path fill="#8ce99a" d="M262 165 Q328 95 395 165 Q365 232 328 238 Q292 232 262 165 Z"/>
    <circle cx="282" cy="155" r="24" fill="#b2f2bb"/><circle cx="375" cy="155" r="24" fill="#b2f2bb"/>
    ${eye(285, 158, 11)} ${eye(372, 158, 11)}
    ${smile(328, 200, 16)}
    ${ground(502)}
    ${sparkle(650, 120, 16)} ${sparkle(120, 440, 14, '#ff8fab')}`;

  /* ---------------- 太空 ---------------- */
  const rocket = `
    <path fill="#ff922b" d="M325 450 Q335 525 400 562 Q465 525 475 450 Z"/>
    <path fill="#ffe066" d="M362 450 Q372 500 400 528 Q428 500 438 450 Z"/>
    ${sym('#ff6b6b', 'M305 330 L225 440 L225 480 L305 430 Z')}
    <path fill="#e9ecef" d="M310 210 L490 210 Q500 270 500 330 L500 435 L300 435 L300 330 Q300 270 310 210 Z"/>
    <path fill="#ff6b6b" d="M400 62 Q470 115 490 210 L310 210 Q330 115 400 62 Z"/>
    <rect x="330" y="430" width="140" height="24" rx="8" fill="#868e96"/>
    <circle cx="400" cy="300" r="56" fill="#ffa8a8"/>
    <circle cx="400" cy="300" r="38" fill="#74c0fc"/>
    <rect x="385" y="375" width="30" height="40" rx="8" fill="#ff6b6b"/>
    ${sparkle(140, 120, 20)} ${sparkle(660, 150, 16)} ${sparkle(130, 380, 14, '#74c0fc')} ${sparkle(670, 400, 18, '#ffa8a8')}
    <circle cx="620" cy="80" r="10" fill="#ffe066"/><circle cx="190" cy="250" r="9" fill="#ffe066"/>`;

  const astronaut = `
    <rect x="245" y="285" width="310" height="180" rx="34" fill="#adb5bd"/>
    <rect x="315" y="440" width="70" height="80" rx="18" fill="#e9ecef"/>
    <rect x="415" y="440" width="70" height="80" rx="18" fill="#e9ecef"/>
    <ellipse cx="345" cy="530" rx="50" ry="22" fill="#748ffc"/>
    <ellipse cx="455" cy="530" rx="50" ry="22" fill="#748ffc"/>
    <ellipse cx="248" cy="385" rx="36" ry="72" fill="#e9ecef" transform="rotate(30 248 385)"/>
    <ellipse cx="552" cy="385" rx="36" ry="72" fill="#e9ecef" transform="rotate(-30 552 385)"/>
    <circle cx="200" cy="440" r="28" fill="#748ffc"/><circle cx="600" cy="440" r="28" fill="#748ffc"/>
    <rect x="290" y="295" width="220" height="175" rx="50" fill="#e9ecef"/>
    <rect x="352" y="345" width="96" height="62" rx="10" fill="#91a7ff"/>
    <circle cx="378" cy="376" r="11" fill="#ff6b6b"/><circle cx="422" cy="376" r="11" fill="#ffe066"/>
    <path d="M400 92 L400 62"/><circle cx="400" cy="55" r="12" fill="#ff6b6b"/>
    <circle cx="400" cy="205" r="115" fill="#e9ecef"/>
    <ellipse cx="400" cy="210" rx="88" ry="74" fill="#74c0fc"/>
    <circle cx="400" cy="218" r="58" fill="#ffe0bd"/>
    ${eye(378, 210, 10)} ${eye(422, 210, 10)}
    ${smile(400, 238, 16)}
    ${cheeks(365, 435, 240, 9)}
    ${sparkle(110, 120, 18)} ${sparkle(690, 120, 18)} ${sparkle(100, 300, 12, '#74c0fc')} ${sparkle(700, 300, 12, '#74c0fc')}`;

  const ufo = `
    <path fill="#fff3bf" d="M345 345 L240 545 L560 545 L455 345 Z"/>
    <ellipse cx="400" cy="335" rx="125" ry="32" fill="#868e96"/>
    <ellipse cx="400" cy="290" rx="255" ry="62" fill="#adb5bd"/>
    <path d="M160 300 Q400 345 640 300"/>
    ${[200, 290, 400, 510, 600].map((x, i) => `<circle cx="${x}" cy="${i % 4 ? 322 : 312}" r="15" fill="${['#ffe066', '#ff8fab', '#69db7c'][i % 3]}"/>`).join('')}
    <path fill="#a5d8ff" d="M295 265 Q295 145 400 145 Q505 145 505 265 Z"/>
    <path d="M380 185 Q370 165 360 162 M420 185 Q430 165 440 162"/>
    <circle cx="360" cy="162" r="8" fill="#ffe066"/><circle cx="440" cy="162" r="8" fill="#ffe066"/>
    <ellipse cx="400" cy="225" rx="45" ry="40" fill="#8ce99a"/>
    ${eye(383, 220, 9)} ${eye(417, 220, 9)}
    ${smile(400, 240, 12)}
    ${sparkle(120, 110, 18)} ${sparkle(680, 120, 16)} ${sparkle(110, 440, 14, '#74c0fc')} ${sparkle(690, 450, 14, '#ff8fab')}`;

  const alien = `
    <path d="M330 125 Q300 80 280 62 M470 125 Q500 80 520 62"/>
    <circle cx="280" cy="60" r="16" fill="#ffe066"/><circle cx="520" cy="60" r="16" fill="#ffe066"/>
    <path fill="#69db7c" d="M335 380 Q265 395 235 445 Q245 465 262 455 Q290 420 340 415 Z"/>
    <path fill="#69db7c" d="M465 380 Q535 395 565 445 Q555 465 538 455 Q510 420 460 415 Z"/>
    <ellipse cx="355" cy="515" rx="45" ry="22" fill="#40c057"/>
    <ellipse cx="445" cy="515" rx="45" ry="22" fill="#40c057"/>
    <ellipse cx="400" cy="420" rx="82" ry="95" fill="#8ce99a"/>
    <ellipse cx="400" cy="440" rx="42" ry="50" fill="#d3f9d8"/>
    <ellipse cx="400" cy="215" rx="135" ry="112" fill="#8ce99a"/>
    <ellipse cx="350" cy="205" rx="24" ry="32" fill="#222"/><circle cx="358" cy="193" r="9" fill="#fff" stroke="none"/>
    <ellipse cx="450" cy="205" rx="24" ry="32" fill="#222"/><circle cx="458" cy="193" r="9" fill="#fff" stroke="none"/>
    ${smile(400, 268, 26)}
    ${cheeks(305, 495, 260, 14)}
    ${ground(540)}
    ${sparkle(110, 130, 18)} ${sparkle(690, 160, 16)} ${sparkle(130, 400, 14, '#74c0fc')} ${sparkle(670, 420, 14, '#ff8fab')}`;

  const moon = `
    <path fill="#ffe066" d="M490 144 A180 180 0 1 0 490 456 A170 170 0 0 1 490 144 Z"/>
    ${eye(290, 265, 14)}
    <path d="M285 330 Q305 355 335 335"/>
    <circle cx="270" cy="305" r="13" fill="#ffc2c2"/>
    <circle cx="300" cy="420" r="16" fill="#fcc419"/><circle cx="350" cy="180" r="12" fill="#fcc419"/>
    ${sparkle(560, 260, 24)} ${sparkle(640, 140, 18)} ${sparkle(620, 400, 16, '#74c0fc')} ${sparkle(120, 110, 14, '#74c0fc')}
    <circle cx="700" cy="270" r="10" fill="#ffe066"/><circle cx="120" cy="480" r="9" fill="#ffe066"/>`;

  const sun = `
    <path fill="#ffa94d" d="${scallop(400, 300, 190, 14, 22)}"/>
    <circle cx="400" cy="300" r="145" fill="#ffd43b"/>
    ${eye(352, 278, 16)} ${eye(448, 278, 16)}
    ${smile(400, 330, 45)}
    ${cheeks(325, 475, 335, 20)}`;

  const earth = `
    <circle cx="400" cy="300" r="195" fill="#4dabf7"/>
    <path fill="#69db7c" d="M285 160 Q340 130 372 170 Q385 220 330 238 Q300 268 268 240 Q245 200 285 160 Z"/>
    <path fill="#69db7c" d="M475 360 Q535 330 562 382 Q562 445 500 455 Q450 445 475 360 Z"/>
    <path fill="#69db7c" d="M470 160 Q515 140 540 185 Q520 212 485 200 Z"/>
    <path fill="#69db7c" d="M260 380 Q295 365 310 400 Q290 430 262 412 Z"/>
    ${eye(352, 300, 15)} ${eye(440, 300, 15)}
    ${smile(396, 345, 30)}
    ${cheeks(325, 468, 345, 15)}
    ${sparkle(110, 110, 18)} ${sparkle(690, 120, 16)} ${sparkle(110, 480, 14, '#74c0fc')} ${sparkle(690, 470, 16)}`;

  const ringBack = 'M100 300 A300 78 0 0 1 700 300 A300 78 0 0 1 100 300 Z M180 300 A220 46 0 0 0 620 300 A220 46 0 0 0 180 300 Z';
  const saturn = `
    <path fill="#ffa94d" fill-rule="evenodd" d="${ringBack}"/>
    <circle cx="400" cy="290" r="135" fill="#ffd8a8"/>
    <path fill="#ffa94d" d="M100 300 A300 78 0 0 0 700 300 L620 300 A220 46 0 0 1 180 300 Z"/>
    ${eye(355, 250, 14)} ${eye(445, 250, 14)}
    ${smile(400, 285, 26)}
    ${cheeks(330, 470, 285, 14)}
    ${sparkle(120, 120, 18)} ${sparkle(680, 110, 16)} ${sparkle(130, 480, 16, '#74c0fc')} ${sparkle(670, 490, 16)}`;

  const stars = `
    ${star(400, 315, 185, 85, '#ffd43b')}
    ${eye(365, 300, 14)} ${eye(435, 300, 14)}
    ${smile(400, 340, 24)}
    ${cheeks(340, 460, 345, 13)}
    ${star(130, 130, 55, 25, '#ffe066')} ${star(670, 130, 55, 25, '#ffa8a8')}
    ${star(130, 470, 50, 22, '#74c0fc')} ${star(670, 470, 50, 22, '#8ce99a')}
    ${sparkle(250, 520, 14)} ${sparkle(550, 520, 14)} ${sparkle(400, 62, 14, '#74c0fc')}`;

  const panel = x => `<rect x="${x}" y="255" width="180" height="90" rx="6" fill="#4dabf7"/>
    <path d="M${x + 60} 255 L${x + 60} 345 M${x + 120} 255 L${x + 120} 345 M${x} 300 L${x + 180} 300"/>`;
  const satellite = `
    <rect x="290" y="292" width="220" height="16" fill="#868e96"/>
    ${panel(110)} ${panel(510)}
    <rect x="393" y="180" width="14" height="60" fill="#868e96"/>
    <path fill="#e9ecef" d="M330 170 Q400 250 470 170 Z"/>
    <path d="M400 168 L400 130"/><circle cx="400" cy="125" r="11" fill="#ff6b6b"/>
    <rect x="335" y="235" width="130" height="130" rx="14" fill="#ffd43b"/>
    ${eye(375, 290, 12)} ${eye(425, 290, 12)}
    ${smile(400, 322, 18)}
    <path d="M520 150 Q545 125 540 95 M545 170 Q590 130 575 80"/>
    ${sparkle(120, 120, 18)} ${sparkle(150, 470, 16)} ${sparkle(650, 470, 16, '#74c0fc')} ${sparkle(400, 480, 12)}`;

  const rover = `
    <circle cx="150" cy="130" r="55" fill="#4dabf7"/>
    <path fill="#69db7c" d="M120 110 Q150 95 165 120 Q150 145 125 135 Z"/>
    <rect x="480" y="190" width="16" height="75" fill="#868e96"/>
    <rect x="455" y="155" width="66" height="44" rx="10" fill="#adb5bd"/>
    <circle cx="488" cy="177" r="13" fill="#74c0fc"/>
    <rect x="250" y="232" width="190" height="24" rx="4" fill="#4dabf7"/>
    <path d="M313 232 L313 256 M376 232 L376 256"/>
    <rect x="220" y="255" width="360" height="110" rx="22" fill="#ffe066"/>
    <rect x="260" y="285" width="90" height="45" rx="10" fill="#ffa94d"/>
    ${wheel(275, 400, 50)} ${wheel(400, 400, 50)} ${wheel(525, 400, 50)}
    ${ground(452)}
    <ellipse cx="140" cy="505" rx="55" ry="16" fill="#ced4da"/>
    <ellipse cx="640" cy="512" rx="65" ry="18" fill="#ced4da"/>
    <ellipse cx="400" cy="525" rx="30" ry="10" fill="#ced4da"/>
    ${sparkle(650, 110, 18)} ${sparkle(330, 120, 14, '#74c0fc')} ${sparkle(720, 260, 12)}`;

  const spanel = (x, y) => `<rect x="${x}" y="${y}" width="100" height="135" rx="6" fill="#4dabf7"/>
    <path d="M${x + 50} ${y} L${x + 50} ${y + 135} M${x} ${y + 45} L${x + 100} ${y + 45} M${x} ${y + 90} L${x + 100} ${y + 90}"/>`;
  const station = `
    <rect x="135" y="292" width="530" height="16" fill="#868e96"/>
    ${spanel(85, 145)} ${spanel(85, 320)} ${spanel(615, 145)} ${spanel(615, 320)}
    <rect x="215" y="272" width="95" height="56" rx="12" fill="#e9ecef"/>
    <rect x="490" y="272" width="95" height="56" rx="12" fill="#e9ecef"/>
    <rect x="375" y="335" width="50" height="70" rx="10" fill="#e9ecef"/>
    <circle cx="400" cy="230" r="42" fill="#ffd43b"/>
    <rect x="300" y="250" width="200" height="100" rx="26" fill="#dee2e6"/>
    <circle cx="350" cy="300" r="18" fill="#74c0fc"/><circle cx="400" cy="300" r="18" fill="#74c0fc"/><circle cx="450" cy="300" r="18" fill="#74c0fc"/>
    ${sparkle(400, 110, 18)} ${sparkle(130, 80, 14)} ${sparkle(670, 80, 14, '#74c0fc')} ${sparkle(250, 500, 16)} ${sparkle(550, 500, 16, '#ff8fab')}
    <circle cx="400" cy="500" r="10" fill="#ffe066"/>`;

  window.ART.addPack({
    categories: [
      { id: 'insect', name: '昆蟲', icon: '🐞', color: '#94d82d', dark: '#5c940d', en: 'Bugs' },
      { id: 'space', name: '太空', icon: '🚀', color: '#5c7cfa', dark: '#364fc7', en: 'Space' },
    ],
    drawings: [
      { id: 'i-butterfly', cat: 'insect', name: '蝴蝶', en: 'butterfly', svg: butterfly },
      { id: 'i-ladybug', cat: 'insect', name: '瓢蟲', en: 'ladybug', svg: ladybug },
      { id: 'i-bee', cat: 'insect', name: '蜜蜂', en: 'bee', svg: bee },
      { id: 'i-ant', cat: 'insect', name: '螞蟻', en: 'ant', svg: ant },
      { id: 'i-dragonfly', cat: 'insect', name: '蜻蜓', en: 'dragonfly', svg: dragonfly },
      { id: 'i-caterpillar', cat: 'insect', name: '毛毛蟲', en: 'caterpillar', svg: caterpillar },
      { id: 'i-snail', cat: 'insect', name: '蝸牛', en: 'snail', svg: snail },
      { id: 'i-grasshopper', cat: 'insect', name: '蚱蜢', en: 'grasshopper', svg: grasshopper },
      { id: 'i-firefly', cat: 'insect', name: '螢火蟲', en: 'firefly', svg: firefly },
      { id: 'i-beetle', cat: 'insect', name: '獨角仙', en: 'rhinoceros beetle', svg: beetle },
      { id: 'i-spider', cat: 'insect', name: '小蜘蛛', en: 'spider', svg: spider },
      { id: 'i-cicada', cat: 'insect', name: '蟬', en: 'cicada', svg: cicada },
      { id: 'i-mantis', cat: 'insect', name: '螳螂', en: 'praying mantis', svg: mantis },
      { id: 's-rocket', cat: 'space', name: '火箭', en: 'rocket', svg: rocket },
      { id: 's-astronaut', cat: 'space', name: '太空人', en: 'astronaut', svg: astronaut },
      { id: 's-ufo', cat: 'space', name: '飛碟', en: 'UFO', svg: ufo },
      { id: 's-alien', cat: 'space', name: '外星人', en: 'alien', svg: alien },
      { id: 's-moon', cat: 'space', name: '月亮', en: 'moon', svg: moon },
      { id: 's-sun', cat: 'space', name: '太陽', en: 'sun', svg: sun },
      { id: 's-earth', cat: 'space', name: '地球', en: 'Earth', svg: earth },
      { id: 's-saturn', cat: 'space', name: '土星', en: 'Saturn', svg: saturn },
      { id: 's-stars', cat: 'space', name: '星星', en: 'stars', svg: stars },
      { id: 's-satellite', cat: 'space', name: '人造衛星', en: 'satellite', svg: satellite },
      { id: 's-rover', cat: 'space', name: '月球車', en: 'moon rover', svg: rover },
      { id: 's-station', cat: 'space', name: '太空站', en: 'space station', svg: station },
    ],
  });
})();
