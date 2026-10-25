/* 線稿包：恐龍、海洋 */
(function () {
  const { eye, ground, scallop } = window.ART.helpers;
  const f = n => n.toFixed(1);
  const seaFloor = `<path d="M40 555 Q200 540 400 555 Q600 570 760 555"/>`;
  const bubbles = (list) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c8eeff"/>`).join('');

  /* ---------------- 恐龍 ---------------- */
  const spino = `
    <path fill="#ff8c69" d="M250 340 Q270 150 390 140 Q510 140 530 320 Z"/>
    <path d="M300 330 L300 222 M345 320 L345 178 M390 315 L390 160 M435 315 L435 168 M480 320 L480 202"/>
    <rect x="300" y="405" width="56" height="117" rx="22" fill="#3a8f86"/>
    <path fill="#4fb3a9" d="M40 350 Q150 330 250 320 Q330 280 420 285 Q520 290 560 330 Q600 370 580 410 Q555 450 460 452 Q360 455 290 425 Q170 385 40 370 Z"/>
    <rect x="432" y="420" width="62" height="102" rx="22" fill="#4fb3a9"/>
    <ellipse cx="460" cy="405" rx="68" ry="52" fill="#4fb3a9"/>
    <path fill="#4fb3a9" d="M545 335 Q560 255 615 245 Q660 240 685 262 L745 272 Q765 280 760 297 Q755 312 735 310 L665 312 Q630 338 585 362 Z"/>
    <path d="M672 300 L738 298"/>
    ${eye(625, 275, 13)}
    <circle cx="742" cy="282" r="4" fill="#222"/>
    <path fill="#4fb3a9" d="M565 380 Q605 385 610 410 Q595 405 590 420 Q580 400 560 400 Z"/>
    <circle cx="250" cy="360" r="14" fill="#2f7f77"/><circle cx="320" cy="335" r="18" fill="#2f7f77"/><circle cx="380" cy="360" r="12" fill="#2f7f77"/>
    ${ground(522)}`;

  const raptor = `
    <path fill="#d9822b" d="M385 390 L395 470 Q360 500 358 520 L420 520 Q418 500 422 470 L428 390 Z"/>
    <path fill="#f7a440" d="M488 335 Q505 262 545 218 L588 242 Q556 288 538 372 Z"/>
    <path fill="#f7a440" d="M40 255 Q180 272 320 292 Q380 282 450 292 Q520 305 535 350 Q535 400 470 410 Q400 418 350 392 Q200 330 40 275 Z"/>
    <path fill="#f7a440" d="M530 218 Q545 170 600 168 Q640 168 690 190 Q712 200 705 216 Q700 230 680 229 L615 232 Q580 246 548 242 Z"/>
    <path d="M625 220 L695 218"/>
    ${eye(595, 195, 12)}
    <circle cx="690" cy="199" r="4" fill="#222"/>
    <path fill="#f7a440" d="M440 395 L468 480 Q440 500 438 520 L535 520 Q530 500 500 478 L488 395 Z"/>
    <path fill="#fff4dc" d="M508 508 Q505 478 528 465 Q522 490 530 508 Z"/>
    <ellipse cx="455" cy="370" rx="58" ry="45" fill="#f7a440"/>
    <path fill="#f7a440" d="M532 330 Q575 335 585 362 Q570 358 565 374 Q555 352 534 352 Z"/>
    <path d="M180 270 L192 292 M255 285 L268 310 M330 298 L340 322 M400 290 L408 314"/>
    ${ground(522)}`;

  const parasaur = `
    <path fill="#ff8c42" d="M590 205 Q520 150 430 138 Q405 150 422 170 Q520 182 565 242 Z"/>
    <path d="M440 152 Q520 162 568 210"/>
    <path fill="#8fd16a" d="M200 370 Q110 370 30 320 Q90 420 215 432 Z"/>
    ${[215, 280, 410, 475].map(x => `<rect x="${x}" y="400" width="58" height="122" rx="24" fill="#6fb34c"/>`).join('')}
    <ellipse cx="350" cy="370" rx="175" ry="100" fill="#8fd16a"/>
    <path fill="#8fd16a" d="M455 330 Q520 300 545 232 L600 250 Q582 342 500 410 Z"/>
    <path fill="#8fd16a" d="M538 248 Q543 196 600 190 Q640 190 655 215 L705 235 Q725 245 715 262 Q705 275 685 270 L640 268 Q600 286 565 278 Z"/>
    <path d="M650 258 Q680 263 708 256"/>
    ${eye(600, 222, 12)}
    <path fill="#e2f5c8" d="M240 440 Q350 475 470 440 Q460 465 350 470 Q260 465 240 440 Z"/>
    ${[[290, 320, 22], [360, 300, 16], [420, 330, 13], [240, 360, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5e9e3e"/>`).join('')}
    ${ground(522)}`;

  const pachy = `
    <rect x="300" y="405" width="58" height="117" rx="22" fill="#d97a9a"/>
    <path fill="#ff9eb5" d="M40 380 Q180 360 270 330 Q360 290 450 310 Q540 340 535 410 Q520 460 420 462 Q330 460 280 420 Q170 400 40 400 Z"/>
    <path fill="#ff9eb5" d="M480 300 Q470 200 570 190 Q665 190 665 270 Q692 280 690 302 Q685 332 650 332 L545 336 Q500 340 480 300 Z"/>
    <path fill="#ffd6e0" d="M478 278 Q474 160 572 158 Q672 160 664 262 Q570 222 478 278 Z"/>
    ${[[488, 280], [515, 258], [550, 245], [590, 242], [628, 248], [660, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#c96a8a"/>`).join('')}
    ${eye(600, 285, 12)}
    <path d="M638 315 Q662 322 684 310"/>
    <rect x="420" y="420" width="62" height="102" rx="22" fill="#ff9eb5"/>
    <ellipse cx="445" cy="405" rx="66" ry="52" fill="#ff9eb5"/>
    <path fill="#ff9eb5" d="M528 370 Q568 372 575 398 Q560 394 555 408 Q545 390 526 392 Z"/>
    <circle cx="200" cy="375" r="12" fill="#c96a8a"/><circle cx="270" cy="360" r="15" fill="#c96a8a"/><circle cx="350" cy="330" r="18" fill="#c96a8a"/>
    ${ground(522)}`;

  const plesio = `
    <path fill="#3e9e9e" d="M260 390 Q235 455 200 480 Q250 488 295 405 Z"/>
    <path fill="#3e9e9e" d="M420 395 Q455 455 500 470 Q505 440 455 385 Z"/>
    <path fill="#5ec4c4" d="M185 330 Q110 330 45 290 Q90 385 195 385 Z"/>
    <ellipse cx="320" cy="350" rx="160" ry="85" fill="#5ec4c4"/>
    <path fill="#5ec4c4" d="M430 315 Q520 290 556 205 Q570 162 600 165 Q622 176 606 216 Q562 330 462 392 Z"/>
    <ellipse cx="632" cy="160" rx="58" ry="36" fill="#5ec4c4"/>
    ${eye(642, 148, 11)}
    <path d="M655 175 Q672 182 686 170"/>
    <path fill="#c9f0ee" d="M200 390 Q320 445 460 380 Q430 430 320 435 Q235 430 200 390 Z"/>
    <path fill="#5ec4c4" d="M390 405 Q420 475 470 500 Q490 470 440 395 Z"/>
    <path fill="#5ec4c4" d="M230 410 Q205 475 165 500 Q225 505 275 420 Z"/>
    <circle cx="300" cy="310" r="16" fill="#3e9e9e"/><circle cx="360" cy="295" r="12" fill="#3e9e9e"/><circle cx="250" cy="330" r="10" fill="#3e9e9e"/>
    ${bubbles([[700, 110, 16], [730, 60, 10], [120, 180, 14], [90, 130, 9]])}
    <path fill="#55c271" d="M620 555 Q595 490 630 440 Q665 490 642 555 Z"/>
    <path fill="#55c271" d="M680 555 Q670 505 700 470 Q725 515 702 555 Z"/>
    ${seaFloor}`;

  const dilopho = `
    <path fill="#ff6b6b" d="M545 185 Q548 60 630 150 Z"/>
    <path fill="#ff6b6b" d="M598 170 Q628 55 690 170 Z"/>
    <path d="M568 170 L572 112 M625 165 L630 100"/>
    <rect x="300" y="400" width="56" height="122" rx="22" fill="#d9a520"/>
    <path fill="#f2c94c" d="M40 330 Q200 320 300 300 Q380 280 430 270 Q480 240 520 200 L578 228 Q548 262 540 320 Q530 400 440 420 Q340 440 270 400 Q170 360 40 352 Z"/>
    <path fill="#f2c94c" d="M528 222 Q538 162 600 158 Q650 158 680 180 L722 190 Q742 200 734 218 Q724 233 700 231 L640 233 Q600 251 560 246 Z"/>
    <path d="M645 222 L725 218"/>
    ${eye(600, 192, 12)}
    <circle cx="724" cy="200" r="4" fill="#222"/>
    <rect x="410" y="410" width="62" height="112" rx="22" fill="#f2c94c"/>
    <ellipse cx="435" cy="385" rx="66" ry="52" fill="#f2c94c"/>
    <path fill="#f2c94c" d="M532 320 Q572 322 580 348 Q565 344 560 358 Q550 340 530 342 Z"/>
    <path d="M200 322 L208 342 M260 312 L270 334 M320 298 L330 320 M380 284 L390 306"/>
    ${ground(522)}`;

  const dinoNest = `
    <ellipse cx="400" cy="395" rx="265" ry="60" fill="#a0703c"/>
    <ellipse cx="290" cy="345" rx="72" ry="95" fill="#bfe3ff"/>
    <ellipse cx="510" cy="345" rx="72" ry="95" fill="#ffe08a"/>
    <ellipse cx="400" cy="320" rx="80" ry="115" fill="#c8f0b4"/>
    <path d="M330 290 L352 270 L372 296 L394 268 L414 296 L436 270 L462 292"/>
    ${[[260, 320, 12], [310, 360, 9], [285, 280, 8], [530, 300, 11], [495, 360, 13], [545, 380, 8], [380, 360, 14], [430, 390, 10], [400, 240, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9eb5"/>`).join('')}
    <path fill="#c48a4a" d="M135 395 Q400 475 665 395 Q650 528 400 530 Q150 528 135 395 Z"/>
    <path d="M190 440 L290 470 M330 480 L450 470 M500 470 L610 440 M220 490 L330 505 M460 505 L580 485 M380 500 L420 515"/>
    <path fill="#55c271" d="M140 520 Q110 470 135 440 Q160 480 160 520 Z"/>
    <path fill="#55c271" d="M660 520 Q690 470 668 440 Q640 480 640 520 Z"/>
    ${ground(530)}`;

  const volcano = `
    <path fill="#dddddd" d="${scallop(230, 100, 32, 7, 9)}"/>
    <path fill="#dddddd" d="${scallop(565, 85, 28, 7, 8)}"/>
    <path fill="#ff6b35" d="M335 235 Q318 150 368 160 Q378 98 420 128 Q465 118 452 172 Q492 182 465 235 Z"/>
    <path fill="#b07d62" d="M120 525 L320 230 Q400 212 480 230 L680 525 Z"/>
    <path fill="#ff9f1c" d="M323 236 Q400 256 477 236 L487 300 Q478 322 467 300 L455 278 L446 338 Q435 360 422 338 L412 284 L396 318 Q385 335 374 314 L360 280 L350 298 Q340 314 332 292 Z"/>
    <circle cx="290" cy="150" r="15" fill="#8a5a44"/><circle cx="520" cy="130" r="12" fill="#8a5a44"/><circle cx="555" cy="190" r="10" fill="#8a5a44"/>
    <path d="M220 470 L250 450 M520 440 L555 460 M300 380 L330 395"/>
    <path fill="#7cc0f0" d="M735 470 Q775 460 772 425 Q790 485 730 500 Z"/>
    <rect x="645" y="470" width="30" height="55" rx="12" fill="#5aa9e6"/>
    <rect x="705" y="470" width="30" height="55" rx="12" fill="#5aa9e6"/>
    ${[[655, 432], [690, 425], [722, 432]].map(([x, y]) => `<path fill="#ffd166" d="M${x - 14} ${y + 8} L${x} ${y - 16} L${x + 14} ${y + 8} Z"/>`).join('')}
    <ellipse cx="690" cy="470" rx="58" ry="42" fill="#7cc0f0"/>
    <circle cx="632" cy="415" r="40" fill="#7cc0f0"/>
    ${eye(620, 405, 10)}
    <path d="M598 430 Q612 440 625 432"/>
    <circle cx="645" cy="428" r="8" fill="#ffb3c6"/>
    ${ground(525)}`;

  /* ---------------- 海洋 ---------------- */
  const lobsterClaw = flip => {
    const X = x => (flip ? 800 - x : x);
    return `<path fill="#ff5a4e" d="M${X(352)} 215 Q${X(290)} 200 ${X(268)} 158 L${X(298)} 146 Q${X(318)} 180 ${X(362)} 190 Z"/>
      <path fill="#ff5a4e" d="M${X(250)} 175 Q${X(180)} 150 ${X(188)} 78 Q${X(200)} 55 ${X(228)} 68 L${X(246)} 112 L${X(262)} 74 Q${X(292)} 70 ${X(296)} 110 Q${X(296)} 165 ${X(250)} 175 Z"/>`;
  };
  const lobster = `
    <path d="M385 175 Q330 110 250 50 M415 175 Q470 110 550 50"/>
    <path d="M350 250 L290 268 L275 292 M350 275 L295 300 L285 325 M355 300 L305 330 L298 355 M450 250 L510 268 L525 292 M450 275 L505 300 L515 325 M445 300 L495 330 L502 355"/>
    ${lobsterClaw(false)} ${lobsterClaw(true)}
    <path fill="#ff7a6b" d="M400 462 Q338 500 328 540 Q365 556 400 536 Q435 556 472 540 Q462 500 400 462 Z"/>
    <path d="M400 478 L400 534"/>
    <ellipse cx="400" cy="455" rx="34" ry="20" fill="#ff5a4e"/>
    <ellipse cx="400" cy="424" rx="40" ry="22" fill="#ff5a4e"/>
    <ellipse cx="400" cy="390" rx="46" ry="24" fill="#ff5a4e"/>
    <ellipse cx="400" cy="352" rx="52" ry="26" fill="#ff5a4e"/>
    <ellipse cx="400" cy="260" rx="62" ry="90" fill="#ff7a6b"/>
    ${eye(374, 205, 11)} ${eye(426, 205, 11)}
    <path d="M382 245 Q400 260 418 245"/>
    <circle cx="358" cy="235" r="10" fill="#ffb3c6"/><circle cx="442" cy="235" r="10" fill="#ffb3c6"/>
    ${bubbles([[620, 200, 16], [660, 150, 10], [150, 300, 12]])}
    ${seaFloor}`;

  const shrimp = (() => {
    const cx = 370, cy = 320, R = 150;
    const rad = d => d * Math.PI / 180;
    const pt = (deg, r = R) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
    const segs = [[145, 36], [172, 44], [200, 50], [228, 55], [256, 59], [284, 62], [310, 62]];
    const [tx, ty] = pt(138);
    const tail = `<path fill="#ff7a5c" transform="translate(${f(tx)} ${f(ty)}) rotate(48)" d="M0 -18 Q45 -70 85 -48 Q62 -18 72 0 Q62 18 85 48 Q45 70 0 18 Z"/>`;
    const legs = [175, 205, 235, 265, 295].map(a => {
      const [x0, y0] = pt(a, R - 40), [x1, y1] = pt(a, R - 85);
      return `<path d="M${f(x0)} ${f(y0)} Q${f(x1 + 12)} ${f(y1 - 5)} ${f(x1)} ${f(y1 + 14)}"/>`;
    }).join('');
    const body = segs.map(([a, r]) => { const [x, y] = pt(a); return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#ff9e7d"/>`; }).join('');
    return `
      ${tail}
      ${legs}
      ${body}
      <path d="M570 285 Q650 190 750 150 M560 300 Q660 260 760 255"/>
      <path fill="#ff9e7d" d="M572 253 L628 235 L590 275 Z"/>
      <ellipse cx="510" cy="255" rx="82" ry="60" fill="#ffb59a" transform="rotate(40 510 255)"/>
      <path d="M495 310 L470 352 M525 315 L510 358 M553 310 L550 352"/>
      ${eye(525, 225, 15)}
      <circle cx="545" cy="272" r="10" fill="#ffb3c6"/>
      ${bubbles([[130, 130, 16], [100, 80, 10], [690, 450, 14]])}
      ${seaFloor}`;
  })();

  const stingray = `
    <path fill="#5f8fae" d="M392 380 Q420 480 560 545 Q575 535 560 525 Q440 470 412 380 Z"/>
    <path fill="#7aa6c2" d="M340 380 Q320 430 350 440 Q370 420 370 385 Z"/>
    <path fill="#7aa6c2" d="M460 380 Q480 430 450 440 Q430 420 430 385 Z"/>
    <path fill="#7aa6c2" d="M400 115 Q500 160 560 220 Q650 250 730 290 Q600 330 520 360 Q460 400 400 405 Q340 400 280 360 Q200 330 70 290 Q150 250 240 220 Q300 160 400 115 Z"/>
    <path fill="#b8d6e8" d="M400 160 Q460 190 480 250 Q470 320 400 345 Q330 320 320 250 Q340 190 400 160 Z"/>
    ${eye(368, 225, 13)} ${eye(432, 225, 13)}
    <path d="M378 275 Q400 295 422 275"/>
    <circle cx="345" cy="265" r="10" fill="#ffb3c6"/><circle cx="455" cy="265" r="10" fill="#ffb3c6"/>
    ${[[230, 270, 12], [190, 295, 8], [570, 270, 12], [610, 295, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4f7d99"/>`).join('')}
    ${bubbles([[650, 150, 16], [690, 100, 10], [140, 170, 13]])}
    ${seaFloor}`;

  const puffer = (() => {
    const cx = 400, cy = 300, r = 145;
    const spikes = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2 + 0.1, w = 0.13;
      const p = (aa, rr) => `${f(cx + rr * Math.cos(aa))} ${f(cy + rr * Math.sin(aa))}`;
      if (Math.abs(Math.cos(a) + 1) < 0.15) return '';
      return `<path fill="#f4a261" d="M${p(a - w, r - 10)} L${p(a, r + 32)} L${p(a + w, r - 10)} Z"/>`;
    }).join('');
    return `
      <path fill="#f4a261" d="M275 300 Q200 225 165 245 Q190 300 165 355 Q200 375 275 300 Z"/>
      ${spikes}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffd166"/>
      <path fill="#fff4cc" d="M265 340 Q400 420 535 340 Q510 440 400 445 Q290 440 265 340 Z"/>
      <path fill="#f4a261" d="M405 310 Q450 280 470 320 Q450 350 410 330 Z"/>
      <circle cx="455" cy="240" r="40" fill="#fff8e0"/>
      ${eye(462, 244, 20)}
      <ellipse cx="545" cy="305" rx="14" ry="18" fill="#ff8fab"/>
      <circle cx="495" cy="305" r="13" fill="#ffb3c6"/>
      ${[[330, 220, 14], [380, 190, 10], [300, 280, 10], [360, 260, 8]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#f4a261"/>`).join('')}
      ${bubbles([[640, 160, 16], [670, 105, 10], [120, 150, 12]])}
      ${seaFloor}`;
  })();

  const hermit = `
    <path fill="#e0524a" d="M455 470 Q440 505 410 520 L422 530 Q462 512 475 475 Z"/>
    <path fill="#e0524a" d="M500 480 Q495 515 470 528 L482 536 Q518 520 520 485 Z"/>
    <path fill="#e0524a" d="M545 470 Q565 505 590 520 L580 530 Q545 512 528 478 Z"/>
    <rect x="515" y="320" width="12" height="60" rx="6" fill="#ff6b6b"/>
    <rect x="560" y="330" width="12" height="55" rx="6" fill="#ff6b6b"/>
    <ellipse cx="530" cy="430" rx="72" ry="58" fill="#ff6b6b"/>
    ${eye(521, 318, 15)} ${eye(566, 328, 15)}
    <path d="M540 440 Q560 455 580 440"/>
    <circle cx="590" cy="420" r="9" fill="#ffb3c6"/>
    <path fill="#ff6b6b" d="M575 470 Q620 455 640 470 Q620 485 590 490 Z"/>
    <path fill="#ff6b6b" d="M620 470 Q630 420 680 418 Q720 425 715 465 Q705 500 660 500 Q625 495 620 470 Z"/>
    <path d="M714 452 L670 458"/>
    <path fill="#f7b267" d="M150 495 Q130 330 280 250 Q420 195 480 300 Q520 400 470 470 Q400 520 300 515 Q190 515 150 495 Z"/>
    <path d="M340 410 Q290 400 295 350 Q305 300 360 300 Q420 305 420 365 Q415 440 330 455 Q240 460 225 380"/>
    ${[[230, 300, 12], [400, 250, 10], [450, 420, 11], [200, 450, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8913a"/>`).join('')}
    <path d="M40 545 Q200 530 400 545 Q600 560 760 545"/>
    ${bubbles([[650, 220, 15], [690, 170, 10], [120, 180, 12]])}`;

  const shell = (() => {
    const cx = 400, cy = 470, R = 225, n = 9;
    const a0 = Math.PI * 1.12, a1 = Math.PI * 1.88;
    const p = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    let d = `M${cx} ${cy}`;
    const ends = [];
    for (let i = 0; i <= n; i++) ends.push(p(a0 + (a1 - a0) * i / n, R));
    d += ` L${f(ends[0][0])} ${f(ends[0][1])}`;
    for (let i = 0; i < n; i++) {
      const [qx, qy] = p(a0 + (a1 - a0) * (i + .5) / n, R + 32);
      d += ` Q${f(qx)} ${f(qy)} ${f(ends[i + 1][0])} ${f(ends[i + 1][1])}`;
    }
    d += ' Z';
    const ridges = ends.slice(1, -1).map(([x, y]) => `<path d="M${cx} ${cy - 10} L${f(x)} ${f(y)}"/>`).join('');
    return `
      <path fill="#ffb3c6" d="${d}"/>
      ${ridges}
      <path fill="#ff8fab" d="M345 462 L455 462 L438 520 L362 520 Z"/>
      ${eye(365, 400, 12)} ${eye(435, 400, 12)}
      <path d="M380 432 Q400 448 420 432"/>
      <path fill="#ffd166" d="M600 525 Q590 440 650 420 Q720 410 730 470 Q735 525 680 528 Z"/>
      <path d="M690 500 Q650 505 650 470 Q655 445 685 448 Q705 455 700 475"/>
      <path fill="#a8e0ff" d="M70 530 Q70 470 130 470 Q190 470 190 530 Z"/>
      <path d="M130 475 L130 528 M100 482 L95 528 M160 482 L165 528"/>
      <circle cx="560" cy="110" r="12" fill="#c8eeff"/><circle cx="600" cy="80" r="8" fill="#c8eeff"/>
      <path d="M40 530 Q200 515 400 530 Q600 545 760 530"/>`;
  })();

  const seal = `
    <path fill="#b8c4cc" d="M90 530 Q100 420 250 412 L560 412 Q700 420 715 530 Z"/>
    <path d="M200 470 L260 455 M520 470 L590 490 M380 490 L430 480"/>
    <path fill="#8a9aa8" d="M195 405 Q140 370 105 385 Q125 410 112 440 Q160 440 210 420 Z"/>
    <path fill="#9fb0bf" d="M180 420 Q200 330 360 310 Q460 300 520 230 L640 280 Q600 330 540 380 Q470 420 400 425 Z"/>
    <ellipse cx="590" cy="235" rx="68" ry="58" fill="#9fb0bf"/>
    <path fill="#dde6ec" d="M260 415 Q380 400 460 380 Q510 370 535 345 Q520 400 420 422 Z"/>
    <ellipse cx="640" cy="258" rx="32" ry="24" fill="#dde6ec"/>
    <circle cx="660" cy="245" r="9" fill="#222"/>
    ${eye(595, 222, 12)}
    <path d="M640 268 Q650 278 662 268 M670 258 L715 250 M670 268 L712 274"/>
    <path fill="#8a9aa8" d="M440 385 Q470 440 520 448 Q535 425 490 375 Z"/>
    <circle cx="675" cy="190" r="44" fill="#ff6b6b"/>
    <circle cx="675" cy="190" r="20" fill="#ffd166"/>
    <circle cx="200" cy="200" r="14" fill="#c8eeff"/><circle cx="160" cy="150" r="9" fill="#c8eeff"/>`;

  const penguin = `
    ${ground(540)}
    <path fill="#3d5a80" d="M262 300 Q190 380 205 445 Q260 410 285 350 Z"/>
    <path fill="#3d5a80" d="M538 300 Q610 380 595 445 Q540 410 515 350 Z"/>
    <path fill="#3d5a80" d="M400 105 Q520 108 540 260 Q568 420 520 500 Q400 540 280 500 Q232 420 260 260 Q280 108 400 105 Z"/>
    <path fill="#f4f4f4" d="M400 200 Q478 158 492 250 Q510 400 470 482 Q400 508 330 482 Q290 400 308 250 Q322 158 400 200 Z"/>
    ${eye(365, 235, 14)} ${eye(435, 235, 14)}
    <path fill="#ff9f43" d="M378 262 L422 262 L400 290 Z"/>
    <circle cx="335" cy="285" r="14" fill="#ffb3c6"/><circle cx="465" cy="285" r="14" fill="#ffb3c6"/>
    <ellipse cx="350" cy="528" rx="45" ry="18" fill="#ff9f43"/>
    <ellipse cx="450" cy="528" rx="45" ry="18" fill="#ff9f43"/>
    ${[[110, 130], [690, 100], [660, 220], [140, 280]].map(([x, y]) => `<path d="M${x - 14} ${y} L${x + 14} ${y} M${x - 7} ${y - 12} L${x + 7} ${y + 12} M${x + 7} ${y - 12} L${x - 7} ${y + 12}"/>`).join('')}`;

  const coral = `
    <path fill="#55c271" d="M70 555 Q40 470 80 400 Q50 330 90 260 Q120 330 100 400 Q130 470 105 555 Z"/>
    <path fill="#55c271" d="M705 555 Q680 480 715 420 Q690 360 725 300 Q755 360 735 420 Q760 480 740 555 Z"/>
    <path fill="#ff6b6b" d="M225 555 L230 440 Q180 420 170 340 Q168 320 188 320 Q205 322 205 345 Q210 395 235 405 L240 290 Q240 270 260 270 Q280 270 280 290 L282 400 Q305 380 310 330 Q312 310 332 312 Q350 316 348 338 Q340 420 285 450 L290 555 Z"/>
    <rect x="568" y="420" width="24" height="135" rx="10" fill="#9d4edd"/>
    <path fill="#c77dff" d="${scallop(580, 360, 90, 10, 9)}"/>
    <path d="M580 440 L580 280 M580 420 L520 310 M580 420 L640 310 M580 430 L505 370 M580 430 L655 370"/>
    <path fill="#ffd166" d="M330 555 Q330 460 420 460 Q510 460 510 555 Z"/>
    <path d="M360 540 Q370 500 400 510 Q420 480 450 500 Q480 490 485 540 M380 530 Q400 520 420 535"/>
    <ellipse cx="160" cy="545" rx="45" ry="20" fill="#bbbbbb"/>
    <path fill="#ff9f43" d="M355 190 L310 155 L310 225 Z"/>
    <ellipse cx="420" cy="190" rx="72" ry="46" fill="#ffc46b"/>
    <path fill="#fff4dc" d="M410 146 Q395 190 410 234 Q430 232 440 228 Q425 190 438 148 Q425 145 410 146 Z"/>
    ${eye(462, 180, 10)}
    <path d="M472 208 Q482 214 490 206"/>
    ${bubbles([[520, 120, 14], [550, 80, 9], [180, 120, 12]])}
    ${seaFloor}`;

  window.ART.addPack({ drawings: [
    { id: 'spino', cat: 'dino', name: '棘龍', en: 'spinosaurus', svg: spino },
    { id: 'raptor', cat: 'dino', name: '迅猛龍', en: 'velociraptor', svg: raptor },
    { id: 'parasaur', cat: 'dino', name: '副櫛龍', en: 'parasaurolophus', svg: parasaur },
    { id: 'pachy', cat: 'dino', name: '厚頭龍', en: 'pachycephalosaurus', svg: pachy },
    { id: 'plesio', cat: 'dino', name: '蛇頸龍', en: 'plesiosaur', svg: plesio },
    { id: 'dilopho', cat: 'dino', name: '雙冠龍', en: 'dilophosaurus', svg: dilopho },
    { id: 'dino-nest', cat: 'dino', name: '恐龍蛋', en: 'dinosaur eggs', svg: dinoNest },
    { id: 'volcano', cat: 'dino', name: '火山', en: 'volcano', svg: volcano },
    { id: 'lobster', cat: 'sea', name: '龍蝦', en: 'lobster', svg: lobster },
    { id: 'shrimp', cat: 'sea', name: '蝦子', en: 'shrimp', svg: shrimp },
    { id: 'stingray', cat: 'sea', name: '魟魚', en: 'stingray', svg: stingray },
    { id: 'puffer', cat: 'sea', name: '河豚', en: 'pufferfish', svg: puffer },
    { id: 'hermit', cat: 'sea', name: '寄居蟹', en: 'hermit crab', svg: hermit },
    { id: 'shell', cat: 'sea', name: '貝殼', en: 'seashell', svg: shell },
    { id: 'seal', cat: 'sea', name: '海豹', en: 'seal', svg: seal },
    { id: 'penguin', cat: 'sea', name: '企鵝', en: 'penguin', svg: penguin },
    { id: 'coral', cat: 'sea', name: '珊瑚礁', en: 'coral reef', svg: coral },
  ] });
})();
