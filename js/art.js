/* 线稿库 + 故事场景
 * 每张线稿都是 800x600 的 SVG 内容，带着"示范颜色"。
 *   - 涂色时：lineArt() 把颜色去掉，只留黑线（#222 和 #fff 是眼睛等固定颜色，会保留）
 *   - 讲故事时：colorArt() 直接用示范颜色
 * 想加新线稿：往 DRAWINGS 里加一项即可。
 */
(function () {
  const S = 'stroke="#222" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none"';

  // 一圈波浪边（狮子鬃毛、三角龙颈盾）
  function scallop(cx, cy, r, n, bump) {
    const pt = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    let d = `M${pt(0, r)}`;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      d += ` Q${pt((a0 + a1) / 2, r + bump * 2)} ${pt(a1, r)}`;
    }
    return d + ' Z';
  }

  const eye = (x, y, r = 12) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#222"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff" stroke="none"/>`;
  const ground = (y = 525) => `<path d="M40 ${y} L760 ${y}"/>`;
  const wheel = (x, y, r = 52) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#555"/><circle cx="${x}" cy="${y}" r="${r * .42}" fill="#ccc"/>`;

  /* ---------------- 车车 ---------------- */
  const car = `
    <path fill="#ff5a5a" d="M110 390 Q110 300 200 300 L255 300 L325 215 Q340 198 365 198 L525 198 Q550 198 565 218 L625 300 L665 300 Q710 300 710 345 L710 390 Q710 410 690 410 L130 410 Q110 410 110 390 Z"/>
    <path fill="#a8e0ff" d="M352 225 L297 295 L428 295 L428 225 Z"/>
    <path fill="#a8e0ff" d="M456 225 L456 295 L592 295 L548 235 Q541 225 528 225 Z"/>
    <path d="M442 300 L442 405"/>
    <rect x="395" y="320" width="34" height="12" rx="6" fill="#ccc"/>
    <rect x="460" y="320" width="34" height="12" rx="6" fill="#ccc"/>
    <circle cx="686" cy="335" r="15" fill="#ffe14d"/>
    <rect x="110" y="325" width="22" height="30" rx="6" fill="#ff9a3c"/>
    ${wheel(240, 410)} ${wheel(580, 410)}
    ${ground(462)}`;

  const fireTruck = `
    <rect x="140" y="218" width="350" height="38" rx="8" fill="#ddd"/>
    ${[185, 230, 275, 320, 365, 410, 455].map(x => `<path d="M${x} 218 L${x} 256"/>`).join('')}
    <rect x="575" y="198" width="44" height="26" rx="10" fill="#4da3ff"/>
    <rect x="100" y="265" width="420" height="140" rx="14" fill="#ff4b3e"/>
    <rect x="100" y="335" width="420" height="26" fill="#fff3b0"/>
    <circle cx="200" cy="300" r="20" fill="#ffd34d"/>
    <path fill="#ff4b3e" d="M520 222 L640 222 Q668 222 678 248 L712 330 L712 395 Q712 405 702 405 L520 405 Z"/>
    <path fill="#a8e0ff" d="M545 247 L630 247 Q646 247 653 262 L680 322 L545 322 Z"/>
    <circle cx="700" cy="355" r="12" fill="#ffe14d"/>
    ${wheel(200, 408, 48)} ${wheel(400, 408, 48)} ${wheel(620, 408, 48)}
    ${ground(458)}`;

  const bus = `
    <rect x="90" y="160" width="620" height="240" rx="34" fill="#ffd23f"/>
    ${[120, 240, 360].map(x => `<rect x="${x}" y="195" width="100" height="85" rx="12" fill="#a8e0ff"/>`).join('')}
    <rect x="482" y="195" width="74" height="195" rx="10" fill="#7ccfff"/>
    <path d="M519 195 L519 390"/>
    <rect x="590" y="195" width="92" height="115" rx="12" fill="#a8e0ff"/>
    <rect x="90" y="305" width="392" height="28" fill="#ff8c42"/>
    <circle cx="685" cy="355" r="13" fill="#fff6a0"/>
    <rect x="300" y="128" width="180" height="32" rx="10" fill="#8fd16a"/>
    ${wheel(215, 405, 50)} ${wheel(625, 405, 50)}
    ${ground(457)}`;

  const digger = `
    <rect x="575" y="105" width="32" height="20" rx="4" fill="#ccc"/>
    <path fill="#ffc533" d="M430 300 L585 120 L630 150 L470 330 Z"/>
    <path fill="#ffc533" d="M585 120 L695 250 L660 278 L560 165 Z"/>
    <path fill="#9a9a9a" d="M655 250 L735 290 Q735 370 665 372 L615 335 Z"/>
    <path d="M675 300 L700 340 M700 295 L720 335"/>
    <rect x="175" y="240" width="18" height="40" rx="4" fill="#777"/>
    <path fill="#ffc533" d="M300 285 L300 168 Q300 155 313 155 L398 155 Q410 155 415 166 L462 285 Z"/>
    <path fill="#a8e0ff" d="M322 178 L390 178 L428 268 L322 268 Z"/>
    <rect x="140" y="280" width="330" height="100" rx="16" fill="#ffc533"/>
    <rect x="160" y="305" width="110" height="20" rx="8" fill="#333"/>
    <rect x="110" y="380" width="390" height="84" rx="42" fill="#555"/>
    ${[160, 230, 305, 380, 450].map(x => `<circle cx="${x}" cy="422" r="22" fill="#aaa"/>`).join('')}
    ${ground(464)}`;

  /* ---------------- 动物 ---------------- */
  const cat = `
    <path fill="#ffa94d" d="M520 470 Q640 480 640 360 Q640 320 670 305 Q700 320 685 360 Q690 510 510 505 Z"/>
    <ellipse cx="400" cy="440" rx="150" ry="105" fill="#ffa94d"/>
    <ellipse cx="400" cy="460" rx="80" ry="65" fill="#ffe0b8"/>
    <path fill="#ffa94d" d="M292 210 L305 92 L390 150 Z"/>
    <path fill="#ffa94d" d="M508 210 L495 92 L410 150 Z"/>
    <path fill="#ffb3c6" d="M312 170 L318 125 L355 152 Z"/>
    <path fill="#ffb3c6" d="M488 170 L482 125 L445 152 Z"/>
    <circle cx="400" cy="260" r="122" fill="#ffa94d"/>
    <path fill="#f08c2b" d="M370 140 L380 185 L400 145 L420 185 L430 140"/>
    <ellipse cx="352" cy="250" rx="14" ry="20" fill="#222"/><circle cx="357" cy="243" r="5" fill="#fff" stroke="none"/>
    <ellipse cx="448" cy="250" rx="14" ry="20" fill="#222"/><circle cx="453" cy="243" r="5" fill="#fff" stroke="none"/>
    <path fill="#ff7aa2" d="M386 287 L414 287 L400 302 Z"/>
    <path d="M400 302 Q388 325 368 310 M400 302 Q412 325 432 310"/>
    <path d="M300 285 L230 270 M300 300 L228 305 M500 285 L570 270 M500 300 L572 305"/>
    <circle cx="320" cy="305" r="18" fill="#ffc2c2"/><circle cx="480" cy="305" r="18" fill="#ffc2c2"/>
    <ellipse cx="335" cy="535" rx="45" ry="24" fill="#ffa94d"/>
    <ellipse cx="465" cy="535" rx="45" ry="24" fill="#ffa94d"/>`;

  const dog = `
    <path fill="#e0a96d" d="M520 420 Q600 380 610 300 Q640 290 640 320 Q640 420 530 470 Z"/>
    <ellipse cx="400" cy="445" rx="140" ry="100" fill="#e0a96d"/>
    <ellipse cx="400" cy="465" rx="70" ry="60" fill="#f7deb9"/>
    <circle cx="400" cy="255" r="118" fill="#e0a96d"/>
    <ellipse cx="452" cy="210" rx="38" ry="32" fill="#a8703d"/>
    <ellipse cx="288" cy="262" rx="42" ry="88" fill="#8a5a2b" transform="rotate(22 288 262)"/>
    <ellipse cx="512" cy="262" rx="42" ry="88" fill="#8a5a2b" transform="rotate(-22 512 262)"/>
    ${eye(358, 245, 14)} ${eye(442, 245, 14)}
    <path fill="#ff7aa2" d="M383 330 Q400 378 417 330 Z"/>
    <ellipse cx="400" cy="305" rx="58" ry="40" fill="#f7deb9"/>
    <ellipse cx="400" cy="290" rx="20" ry="14" fill="#222"/>
    <path d="M400 304 L400 318 Q385 335 368 322 M400 318 Q415 335 432 322"/>
    <path fill="#ff4d6d" d="M310 355 Q400 395 490 355 L495 375 Q400 418 305 375 Z"/>
    <circle cx="400" cy="398" r="16" fill="#ffd34d"/>
    <ellipse cx="335" cy="535" rx="45" ry="24" fill="#e0a96d"/>
    <ellipse cx="465" cy="535" rx="45" ry="24" fill="#e0a96d"/>`;

  const bunny = `
    <ellipse cx="350" cy="125" rx="38" ry="98" fill="#f6f6f6"/>
    <ellipse cx="450" cy="125" rx="38" ry="98" fill="#f6f6f6"/>
    <ellipse cx="350" cy="130" rx="17" ry="70" fill="#ffb3c6"/>
    <ellipse cx="450" cy="130" rx="17" ry="70" fill="#ffb3c6"/>
    <circle cx="520" cy="470" r="32" fill="#f6f6f6"/>
    <ellipse cx="400" cy="450" rx="125" ry="105" fill="#f6f6f6"/>
    <ellipse cx="400" cy="470" rx="65" ry="58" fill="#ffe3ec"/>
    <circle cx="400" cy="270" r="108" fill="#f6f6f6"/>
    ${eye(360, 255, 13)} ${eye(440, 255, 13)}
    <circle cx="330" cy="300" r="18" fill="#ffc2c2"/><circle cx="470" cy="300" r="18" fill="#ffc2c2"/>
    <ellipse cx="400" cy="290" rx="13" ry="9" fill="#ff7aa2"/>
    <path d="M400 299 L400 312 Q388 326 375 316 M400 312 Q412 326 425 316"/>
    <rect x="390" y="318" width="20" height="18" rx="3" fill="#fff"/>
    <path fill="#ff8c1a" d="M560 420 Q600 405 615 425 L660 545 Q650 555 640 548 Z"/>
    <path fill="#6cc551" d="M590 412 Q565 370 580 350 Q600 380 600 408 Q615 370 640 365 Q630 395 605 415 Z"/>
    <path d="M590 455 L605 450 M600 485 L620 478"/>
    <ellipse cx="335" cy="537" rx="45" ry="24" fill="#f6f6f6"/>
    <ellipse cx="465" cy="537" rx="45" ry="24" fill="#f6f6f6"/>`;

  const lion = `
    <path fill="#f4b942" d="M520 480 Q640 470 650 400 Q660 380 680 390 Q700 400 680 420 Q660 500 520 515 Z"/>
    <path fill="#a8562b" d="M650 400 Q640 370 670 365 Q700 365 695 395 Q680 380 650 400 Z"/>
    <ellipse cx="400" cy="480" rx="140" ry="88" fill="#f4b942"/>
    <path fill="#d9792b" d="${scallop(400, 255, 142, 12, 16)}"/>
    <circle cx="315" cy="170" r="28" fill="#f4b942"/><circle cx="485" cy="170" r="28" fill="#f4b942"/>
    <circle cx="400" cy="260" r="110" fill="#f4b942"/>
    ${eye(360, 240, 13)} ${eye(440, 240, 13)}
    <ellipse cx="375" cy="305" rx="34" ry="26" fill="#ffe7b0"/>
    <ellipse cx="425" cy="305" rx="34" ry="26" fill="#ffe7b0"/>
    <path fill="#8a4a2b" d="M383 275 L417 275 L400 295 Z"/>
    <path d="M400 295 L400 312 M380 335 Q400 350 420 335"/>
    <ellipse cx="330" cy="550" rx="48" ry="25" fill="#f4b942"/>
    <ellipse cx="470" cy="550" rx="48" ry="25" fill="#f4b942"/>`;

  /* ---------------- 恐龙 ---------------- */
  const trex = `
    <path fill="#4fae5a" d="M290 400 L300 500 Q265 505 268 522 L350 522 Q355 505 335 500 L345 400 Z"/>
    <path fill="#6cc551" d="M60 330 Q200 300 300 290 Q400 270 450 220 L470 150 Q480 105 540 105 L650 110 Q700 115 700 160 L700 185 Q700 200 685 200 L590 200 L590 215 L670 215 Q680 245 650 250 L580 255 Q540 270 530 320 Q515 400 430 420 Q330 440 250 400 Q160 360 60 330 Z"/>
    ${[610, 632, 654].map(x => `<path fill="#fff" d="M${x} 200 L${x + 8} 213 L${x + 16} 200 Z" stroke-width="5"/>`).join('')}
    <path fill="#6cc551" d="M395 420 L405 505 Q370 510 373 522 L455 522 Q460 505 440 500 L450 420 Z"/>
    <ellipse cx="400" cy="380" rx="78" ry="66" fill="#6cc551"/>
    <path fill="#6cc551" d="M535 300 Q585 305 592 335 Q578 330 572 345 Q562 325 538 325 Z"/>
    <path fill="#d5f0a8" d="M500 370 Q530 320 545 275 Q570 262 580 255 L530 320 Q515 400 470 410 Z"/>
    ${eye(600, 145, 13)}
    <circle cx="684" cy="140" r="4" fill="#222"/>
    <circle cx="290" cy="320" r="18" fill="#3e8e47"/><circle cx="350" cy="305" r="14" fill="#3e8e47"/><circle cx="230" cy="335" r="12" fill="#3e8e47"/>
    ${ground(522)}`;

  const trike = `
    <path fill="#5aa9e6" d="M150 380 Q80 400 40 430 Q100 440 170 425 Z"/>
    ${[180, 250, 380, 450].map(x => `<rect x="${x}" y="405" width="62" height="115" rx="22" fill="#5aa9e6"/>`).join('')}
    <ellipse cx="320" cy="365" rx="205" ry="120" fill="#7cc0f0"/>
    <path fill="#ffd166" d="${scallop(545, 265, 105, 10, 18)}"/>
    ${[[545, 175], [625, 210], [465, 210], [480, 310]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#ff8fab"/>`).join('')}
    <path fill="#fff4dc" d="M585 262 L650 150 L620 272 Z"/>
    <path fill="#fff4dc" d="M640 275 L730 180 L675 292 Z"/>
    <ellipse cx="615" cy="330" rx="105" ry="72" fill="#7cc0f0" transform="rotate(12 615 330)"/>
    <path fill="#ffb84d" d="M695 305 Q760 330 728 382 L688 370 Z"/>
    <path fill="#fff4dc" d="M700 310 L738 262 L718 318 Z"/>
    ${eye(625, 305, 12)}
    <path d="M600 370 Q640 385 680 368"/>
    ${ground(520)}`;

  const longneck = `
    <path fill="#b08ae0" d="M230 360 Q120 370 30 320 Q100 410 240 425 Z"/>
    ${[225, 290, 420, 485].map(x => `<rect x="${x}" y="400" width="58" height="122" rx="24" fill="#9a70d6"/>`).join('')}
    <ellipse cx="360" cy="370" rx="175" ry="102" fill="#b08ae0"/>
    <path fill="#b08ae0" d="M470 330 Q560 300 580 180 L598 112 L652 122 L640 192 Q612 342 512 412 Z"/>
    <ellipse cx="640" cy="100" rx="62" ry="40" fill="#b08ae0"/>
    ${eye(650, 88, 11)}
    <path d="M660 115 Q680 125 698 112"/>
    <path fill="#e4d4ff" d="M260 440 Q360 475 480 440 Q470 465 360 470 Q270 465 260 440 Z"/>
    ${[[300, 320, 22], [370, 300, 17], [430, 330, 14], [250, 360, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#7a52b8"/>`).join('')}
    ${ground(522)}`;

  const stego = (() => {
    const plate = cx => {
      const by = 380 - 100 * Math.sqrt(1 - ((cx - 380) / 215) ** 2) + 28;
      const h = 70 + 30 * Math.sin(((cx - 220) / 340) * Math.PI);
      return `<path fill="#ff8c69" d="M${cx - 36} ${by} L${cx - 30} ${by - h * .6} L${cx} ${by - h} L${cx + 30} ${by - h * .6} L${cx + 36} ${by} Z"/>`;
    };
    return `
      ${[235, 305, 380, 455, 525].map(plate).join('')}
      <path fill="#ffd166" d="M78 348 L40 290 L102 352 Z"/>
      <path fill="#ffd166" d="M112 368 L95 300 L138 372 Z"/>
      <path fill="#f4a261" d="M200 375 Q110 380 55 335 Q90 420 215 432 Z"/>
      ${[200, 265, 450, 515].map(x => `<rect x="${x}" y="405" width="60" height="117" rx="22" fill="#e07a3f"/>`).join('')}
      <ellipse cx="380" cy="380" rx="215" ry="100" fill="#f4a261"/>
      <ellipse cx="630" cy="415" rx="62" ry="38" fill="#f4a261"/>
      ${eye(642, 402, 11)}
      <path d="M648 432 Q668 440 685 428"/>
      <path fill="#ffe8cc" d="M230 445 Q380 490 540 445 Q520 475 380 478 Q250 475 230 445 Z"/>
      ${ground(522)}`;
  })();

  /* ---------------- 海洋 ---------------- */
  const fish = `
    <path fill="#ff9f43" d="M560 300 L700 195 Q675 300 700 405 Z"/>
    <path fill="#ff9f43" d="M290 180 Q380 85 480 185 Z"/>
    <path fill="#ff9f43" d="M350 430 Q400 510 460 420 Z"/>
    <ellipse cx="380" cy="300" rx="210" ry="140" fill="#ffc46b"/>
    <path fill="#fff" d="M440 166 Q410 300 440 434 Q478 420 500 415 Q475 300 500 185 Q470 170 440 166 Z"/>
    <path fill="#ff9f43" d="M330 320 Q385 325 405 295 Q375 362 330 320 Z"/>
    <circle cx="255" cy="265" r="30" fill="#fff"/>
    ${eye(250, 268, 15)}
    <path d="M180 320 Q198 335 215 320"/>
    <circle cx="125" cy="200" r="20" fill="#c8eeff"/><circle cx="95" cy="140" r="14" fill="#c8eeff"/><circle cx="130" cy="90" r="10" fill="#c8eeff"/>
    <path fill="#55c271" d="M640 560 Q610 485 650 425 Q690 485 662 560 Z"/>
    <path fill="#55c271" d="M700 560 Q690 500 720 465 Q745 510 722 560 Z"/>
    <path d="M40 560 Q200 545 400 560 Q600 575 760 560"/>`;

  const octopus = (() => {
    const t = (x, flip) => {
      const s = flip ? -1 : 1;
      return `<path fill="#c77dff" d="M${x - 28} 360 Q${x - 42 * s} 450 ${x - 8 * s} 500 Q${x + 12 * s} 545 ${x + 55 * s} 522 Q${x + 22 * s} 520 ${x + 16 * s} 495 Q${x - 2 * s} 450 ${x + 28} 360 Z"/>`;
    };
    return `
      ${t(250, true)} ${t(320, true)} ${t(400, false)} ${t(480, false)} ${t(550, false)}
      <path fill="#c77dff" d="M215 385 Q215 115 400 115 Q585 115 585 385 Q500 405 400 395 Q300 405 215 385 Z"/>
      <ellipse cx="345" cy="275" rx="34" ry="42" fill="#fff"/>
      <ellipse cx="455" cy="275" rx="34" ry="42" fill="#fff"/>
      ${eye(350, 285, 16)} ${eye(450, 285, 16)}
      <circle cx="300" cy="335" r="18" fill="#ffb3c6"/><circle cx="500" cy="335" r="18" fill="#ffb3c6"/>
      <path d="M375 345 Q400 368 425 345"/>
      <circle cx="320" cy="180" r="18" fill="#9d4edd"/><circle cx="470" cy="170" r="22" fill="#9d4edd"/><circle cx="400" cy="150" r="12" fill="#9d4edd"/>
      <circle cx="650" cy="180" r="22" fill="#c8eeff"/><circle cx="680" cy="120" r="14" fill="#c8eeff"/>`;
  })();

  const whale = `
    <path fill="#3a86ff" d="M580 330 Q640 300 665 235 Q690 205 725 225 Q712 268 690 290 Q735 290 765 325 Q735 352 690 342 Q640 340 600 385 Z"/>
    <path fill="#c8eeff" d="M252 192 Q215 125 170 125 Q225 98 262 140 Q295 98 352 122 Q305 125 272 192 Z"/>
    <path fill="#5fa8ff" d="M110 330 Q110 195 310 192 Q510 192 625 330 Q600 430 450 442 L260 442 Q110 442 110 330 Z"/>
    <path fill="#e0f1ff" d="M124 370 Q300 405 570 395 Q510 438 450 442 L260 442 Q150 440 124 370 Z"/>
    <path d="M220 410 L420 412 M200 430 L460 428"/>
    ${eye(215, 318, 13)}
    <path d="M150 360 Q190 382 245 368"/>
    <path fill="#3a86ff" d="M310 395 Q335 478 392 478 Q380 425 350 398 Z"/>
    <circle cx="270" cy="250" r="16" fill="#3a86ff"/><circle cx="330" cy="235" r="12" fill="#3a86ff"/>
    <path d="M40 555 Q200 535 400 555 Q600 575 760 555"/>`;

  const turtle = `
    <ellipse cx="530" cy="430" rx="62" ry="28" fill="#7fd17f" transform="rotate(25 530 430)"/>
    <ellipse cx="260" cy="430" rx="58" ry="26" fill="#7fd17f" transform="rotate(-25 260 430)"/>
    <path fill="#7fd17f" d="M195 395 L140 410 L195 418 Z"/>
    <path fill="#7fd17f" d="M560 340 Q600 300 640 300 Q690 300 690 345 Q690 390 640 392 Q600 392 575 380 Z"/>
    ${eye(650, 335, 11)}
    <path d="M655 365 Q672 372 684 360"/>
    <path fill="#2e9e5b" d="M190 400 Q205 195 395 195 Q585 195 600 400 Z"/>
    <path fill="#9be08f" d="M355 245 L435 245 L470 305 L435 362 L355 362 L320 305 Z"/>
    <path fill="#9be08f" d="M245 330 Q255 260 300 235 L320 305 L290 375 Q250 370 245 330 Z"/>
    <path fill="#9be08f" d="M545 330 Q535 260 490 235 L470 305 L500 375 Q540 370 545 330 Z"/>
    <path fill="#c3f0b5" d="M180 400 L610 400 Q615 432 585 432 L205 432 Q175 432 180 400 Z"/>
    <circle cx="110" cy="170" r="18" fill="#c8eeff"/><circle cx="80" cy="115" r="12" fill="#c8eeff"/>
    <path d="M40 545 Q200 525 400 545 Q600 565 760 545"/>`;

  const crab = `
    <path fill="#ff6b6b" d="M110 160 Q160 120 200 175 L165 195 L205 215 Q170 280 110 240 Q75 200 110 160 Z"/>
    <path fill="#ff6b6b" d="M690 160 Q640 120 600 175 L635 195 L595 215 Q630 280 690 240 Q725 200 690 160 Z"/>
    <path d="M260 330 Q190 300 160 240 M540 330 Q610 300 640 240"/>
    ${[0, 1, 2].map(i => `<path d="M${270 - i * 10} ${400 + i * 25} Q${200 - i * 15} ${420 + i * 30} ${180 - i * 20} ${480 + i * 25}"/><path d="M${530 + i * 10} ${400 + i * 25} Q${600 + i * 15} ${420 + i * 30} ${620 + i * 20} ${480 + i * 25}"/>`).join('')}
    <path d="M350 300 L340 220 M450 300 L460 220"/>
    <circle cx="340" cy="210" r="26" fill="#fff"/>${eye(340, 212, 13)}
    <circle cx="460" cy="210" r="26" fill="#fff"/>${eye(460, 212, 13)}
    <ellipse cx="400" cy="390" rx="160" ry="105" fill="#ff8787"/>
    <path d="M350 420 Q400 455 450 420"/>
    <circle cx="320" cy="400" r="16" fill="#ffc2c2"/><circle cx="480" cy="400" r="16" fill="#ffc2c2"/>
    <circle cx="400" cy="335" r="14" fill="#ff6b6b"/><circle cx="340" cy="345" r="10" fill="#ff6b6b"/><circle cx="460" cy="345" r="10" fill="#ff6b6b"/>
    <path d="M40 555 Q200 535 400 555 Q600 575 760 555"/>`;

  const DRAWINGS = [
    { id: 'car', cat: 'car', name: '小汽车', svg: car },
    { id: 'firetruck', cat: 'car', name: '消防车', svg: fireTruck },
    { id: 'bus', cat: 'car', name: '公交车', svg: bus },
    { id: 'digger', cat: 'car', name: '挖掘机', svg: digger },
    { id: 'cat', cat: 'animal', name: '小猫咪', svg: cat },
    { id: 'dog', cat: 'animal', name: '小狗狗', svg: dog },
    { id: 'bunny', cat: 'animal', name: '小兔子', svg: bunny },
    { id: 'lion', cat: 'animal', name: '小狮子', svg: lion },
    { id: 'trex', cat: 'dino', name: '霸王龙', svg: trex },
    { id: 'trike', cat: 'dino', name: '三角龙', svg: trike },
    { id: 'longneck', cat: 'dino', name: '长颈龙', svg: longneck },
    { id: 'stego', cat: 'dino', name: '剑龙', svg: stego },
    { id: 'fish', cat: 'sea', name: '小丑鱼', svg: fish },
    { id: 'octopus', cat: 'sea', name: '章鱼', svg: octopus },
    { id: 'whale', cat: 'sea', name: '大鲸鱼', svg: whale },
    { id: 'turtle', cat: 'sea', name: '海龟', svg: turtle },
    { id: 'crab', cat: 'sea', name: '小螃蟹', svg: crab },
    { id: 'blank', cat: 'free', name: '白纸', svg: '' },
  ];

  const CATEGORIES = [
    { id: 'car', name: '车车', icon: '🚗' },
    { id: 'animal', name: '动物', icon: '🐶' },
    { id: 'dino', name: '恐龙', icon: '🦖' },
    { id: 'sea', name: '海洋', icon: '🐠' },
    { id: 'free', name: '自由画', icon: '🖼️' },
  ];

  // 涂色用：示范颜色全部换成白色（挡住被遮住的线），之后再把白色抠成透明
  function lineArt(inner) {
    return inner.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (m, c) =>
      c === '#222' ? m : 'fill="#fff"');
  }

  function svgDoc(inner, w, h) {
    const size = w ? ` width="${w}" height="${h}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"${size}><g ${S}>${inner}</g></svg>`;
  }

  /* ---------------- 故事场景 ---------------- */
  const scene = {
    day: () => `<rect width="800" height="500" fill="#bfe8ff"/>
      <g class="drift"><path d="M120 90 a30 30 0 0 1 55 -15 a35 35 0 0 1 60 15 a25 25 0 0 1 -5 45 h-105 a25 25 0 0 1 -5 -45z" fill="#fff"/></g>
      <g class="drift" style="animation-delay:-9s"><path d="M520 70 a25 25 0 0 1 45 -12 a30 30 0 0 1 50 12 a20 20 0 0 1 -4 38 h-88 a20 20 0 0 1 -3 -38z" fill="#fff"/></g>`,
    sun: (x = 690, y = 80) => `<g class="tap" data-anim="spin" data-sound="twinkle"><circle cx="${x}" cy="${y}" r="42" fill="#ffd93d"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${x + 55 * Math.cos(a)} ${y + 55 * Math.sin(a)} L${x + 72 * Math.cos(a)} ${y + 72 * Math.sin(a)}" stroke="#ffd93d" stroke-width="8" stroke-linecap="round"/>`; }).join('')}</g>`,
    grass: (y = 380) => `<rect y="${y}" width="800" height="${500 - y}" fill="#9be07a"/>`,
    road: () => `<rect y="380" width="800" height="120" fill="#9be07a"/><rect y="410" width="800" height="70" fill="#8d8d8d"/>
      ${[40, 200, 360, 520, 680].map(x => `<rect x="${x}" y="440" width="80" height="10" rx="5" fill="#fff"/>`).join('')}`,
    tree: (x, y = 385) => `<g class="tap" data-anim="wiggle" data-sound="pop"><rect x="${x - 12}" y="${y - 90}" width="24" height="90" fill="#9c6b3c"/><circle cx="${x}" cy="${y - 120}" r="55" fill="#55b85a"/><circle cx="${x - 35}" cy="${y - 95}" r="35" fill="#55b85a"/><circle cx="${x + 35}" cy="${y - 95}" r="35" fill="#55b85a"/></g>`,
    sea: () => `<rect width="800" height="500" fill="#4fc3f7"/><rect y="0" width="800" height="70" fill="#81d4fa"/>
      <rect y="440" width="800" height="60" fill="#ffe0a3"/>
      ${[80, 260, 560, 720].map((x, i) => `<path d="M${x} 445 Q${x - 20} 390 ${x} 340 Q${x + 20} 390 ${x} 445" fill="#43a047" class="tap" data-anim="wiggle" data-sound="splash"/>`).join('')}`,
    beach: () => `<rect width="800" height="250" fill="#bfe8ff"/><rect y="230" width="800" height="150" fill="#4fc3f7"/>
      <path d="M0 240 Q50 225 100 240 T200 240 T300 240 T400 240 T500 240 T600 240 T700 240 T800 240" fill="none" stroke="#fff" stroke-width="6"/>
      <rect y="370" width="800" height="130" fill="#ffe0a3"/>`,
    night: () => `<rect width="800" height="500" fill="#2b2d6e"/>
      <circle cx="640" cy="90" r="45" fill="#fff3b0" class="tap" data-anim="boing" data-sound="twinkle"/>
      ${[[90, 60], [220, 120], [380, 50], [500, 140], [740, 200], [300, 200], [130, 220]].map(([x, y], i) => `<path class="twinkle tap" data-anim="spin" data-sound="twinkle" style="animation-delay:${i * .3}s" d="M${x} ${y - 12} L${x + 4} ${y - 4} L${x + 12} ${y} L${x + 4} ${y + 4} L${x} ${y + 12} L${x - 4} ${y + 4} L${x - 12} ${y} L${x - 4} ${y - 4} Z" fill="#ffe14d"/>`).join('')}
      <rect y="400" width="800" height="100" fill="#3c6e47"/>`,
    bubbles: () => [[100, 300], [700, 250], [400, 120], [600, 380]].map(([x, y], i) =>
      `<circle class="float tap" data-anim="boing" data-sound="pop" style="animation-delay:${i * .7}s" cx="${x}" cy="${y}" r="${10 + i * 3}" fill="rgba(255,255,255,.6)" stroke="#fff" stroke-width="3"/>`).join(''),
  };

  // 把一张上色线稿放进场景里，可以点
  function put(id, x, y, w, anim = 'jump', sound = 'boing') {
    const d = DRAWINGS.find(d => d.id === id);
    const h = w * 0.75;
    return `<g class="tap" data-anim="${anim}" data-sound="${sound}"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 800 600" overflow="visible"><g ${S}>${d.svg}</g></svg></g>`;
  }

  window.ART = { DRAWINGS, CATEGORIES, lineArt, svgDoc, scene, put };
})();
