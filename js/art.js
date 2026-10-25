/* 線稿庫 + 故事場景
 * 每張線稿都是 800x600 的 SVG 內容，帶著"示範顏色"。
 *   - 塗色時：lineArt() 把顏色去掉，只留黑線（#222 和 #fff 是眼睛等固定顏色，會保留）
 *   - 講故事時：colorArt() 直接用示範顏色
 * 想加新線稿：往 DRAWINGS 里加一項即可。
 */
(function () {
  const S = 'stroke="#222" stroke-linejoin="round" stroke-linecap="round" fill="none"';

  // 線條有粗有細：先用粗線畫一層外輪廓，再用細線畫整張圖蓋上去，
  // 結果就是外面一圈粗、裡面的細節細（沒有填色的線條不參與外輪廓）
  function outlined(inner) {
    const solid = inner.replace(/<path d="[^"]*"\s*\/>/g, '');
    return `<g ${S} stroke-width="17">${solid}</g><g ${S} stroke-width="6">${inner}</g>`;
  }

  // 一圈波浪邊（獅子鬃毛、三角龍頸盾）
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

  /* ---------------- 車車 ---------------- */
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

  /* ---------------- 動物 ---------------- */
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

  /* ---------------- 恐龍 ---------------- */
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


  /* ---------------- 第二批線稿 ---------------- */
  const train = `
    <circle cx="600" cy="160" r="24" fill="#eeeeee"/><circle cx="645" cy="115" r="30" fill="#eeeeee"/><circle cx="700" cy="70" r="22" fill="#eeeeee"/>
    <rect x="50" y="245" width="250" height="155" rx="16" fill="#4dabf7"/>
    <rect x="75" y="270" width="90" height="70" rx="10" fill="#fff59d"/>
    <rect x="185" y="270" width="90" height="70" rx="10" fill="#fff59d"/>
    <rect x="300" y="362" width="55" height="18" rx="6" fill="#888"/>
    <path fill="#e8493e" d="M580 262 L568 195 L622 195 L610 262 Z"/>
    <rect x="345" y="175" width="150" height="225" rx="12" fill="#ff5a5a"/>
    <rect x="330" y="150" width="180" height="32" rx="12" fill="#5c3d99"/>
    <rect x="372" y="200" width="96" height="70" rx="10" fill="#a8e0ff"/>
    <rect x="490" y="258" width="185" height="142" rx="18" fill="#ff5a5a"/>
    <rect x="490" y="300" width="185" height="26" fill="#ffd23f"/>
    <circle cx="672" cy="290" r="15" fill="#fff59d"/>
    <path fill="#999" d="M672 360 L735 412 L672 412 Z"/>
    ${wheel(120, 412, 40)} ${wheel(230, 412, 40)} ${wheel(405, 410, 46)} ${wheel(525, 410, 46)} ${wheel(630, 418, 34)}
    <path d="M30 462 L770 462"/>
    ${[70, 170, 270, 370, 470, 570, 670].map(x => `<path d="M${x} 462 L${x - 10} 485"/>`).join('')}`;

  const plane = `
    <path fill="#fff" d="M60 470 a28 28 0 0 1 40 -30 a34 34 0 0 1 62 10 a22 22 0 0 1 -6 40 h-86 a20 20 0 0 1 -10 -20 z"/>
    <path fill="#fff" d="M560 120 a22 22 0 0 1 32 -24 a28 28 0 0 1 50 8 a18 18 0 0 1 -5 32 h-68 a16 16 0 0 1 -9 -16 z"/>
    <path fill="#74c0fc" d="M340 290 L265 175 L320 175 L440 285 Z"/>
    <path fill="#ff6b6b" d="M135 290 L95 150 L160 150 L225 280 Z"/>
    <path fill="#f1f8ff" d="M95 330 Q95 270 180 270 L555 270 Q690 270 725 320 Q690 372 555 372 L180 372 Q95 372 95 330 Z"/>
    <path fill="#74c0fc" d="M625 285 Q685 292 705 318 L630 318 Z"/>
    ${[250, 310, 370, 430, 490].map(x => `<circle cx="${x}" cy="312" r="15" fill="#a8e0ff"/>`).join('')}
    <path fill="#ff6b6b" d="M95 335 L700 335 Q690 352 650 360 L120 360 Q100 352 95 335 Z"/>
    <path fill="#4dabf7" d="M335 345 L235 480 L298 480 L450 352 Z"/>
    <path fill="#ff6b6b" d="M115 318 L45 352 L135 352 Z"/>`;

  const police = car
    .replace('fill="#ff5a5a"', 'fill="#f4f6fb"')
    .replace(ground(462), `
      <rect x="400" y="168" width="44" height="30" rx="8" fill="#ff4b4b"/>
      <rect x="444" y="168" width="44" height="30" rx="8" fill="#4d8ff0"/>
      <rect x="112" y="350" width="596" height="26" fill="#2b3a67"/>
      <path fill="#ffd23f" d="M505 245 L513 262 L532 264 L518 277 L522 296 L505 287 L488 296 L492 277 L478 264 L497 262 Z" stroke-width="5"/>
      ${ground(462)}`);

  const heli = `
    <ellipse cx="110" cy="262" rx="12" ry="50" fill="#bbb"/>
    <path fill="#ffc533" d="M110 252 L390 285 L390 335 L110 278 Z"/>
    <rect x="465" y="170" width="24" height="50" rx="6" fill="#888"/>
    <rect x="215" y="152" width="520" height="22" rx="11" fill="#777"/>
    <ellipse cx="480" cy="320" rx="165" ry="112" fill="#ffc533"/>
    <path fill="#a8e0ff" d="M520 222 Q632 235 642 322 L520 322 Z"/>
    <rect x="400" y="250" width="80" height="80" rx="12" fill="#a8e0ff"/>
    <path fill="#ff8c42" d="M318 340 Q480 380 642 340 Q630 400 560 425 L400 425 Q330 400 318 340 Z"/>
    <path d="M410 428 L385 478 M560 428 L585 478"/>
    <rect x="320" y="472" width="330" height="18" rx="9" fill="#888"/>`;

  const pig = `
    <path d="M540 450 Q600 430 590 400 Q580 380 600 375 Q625 380 610 405"/>
    <ellipse cx="400" cy="450" rx="145" ry="100" fill="#ffb3c6"/>
    <path fill="#ff8fab" d="M300 200 L285 115 L370 160 Z"/>
    <path fill="#ff8fab" d="M500 200 L515 115 L430 160 Z"/>
    <circle cx="400" cy="265" r="120" fill="#ffc2d1"/>
    ${eye(352, 240, 14)} ${eye(448, 240, 14)}
    <ellipse cx="400" cy="300" rx="55" ry="40" fill="#ff8fab"/>
    <ellipse cx="382" cy="300" rx="9" ry="14" fill="#222"/><ellipse cx="418" cy="300" rx="9" ry="14" fill="#222"/>
    <circle cx="315" cy="300" r="20" fill="#ff8fab"/><circle cx="485" cy="300" r="20" fill="#ff8fab"/>
    <path d="M380 350 Q400 365 420 350"/>
    <ellipse cx="335" cy="540" rx="42" ry="24" fill="#ff8fab"/>
    <ellipse cx="465" cy="540" rx="42" ry="24" fill="#ff8fab"/>`;

  const elephant = `
    <ellipse cx="400" cy="440" rx="150" ry="110" fill="#a5b4c8"/>
    <rect x="285" y="470" width="70" height="80" rx="20" fill="#a5b4c8"/>
    <rect x="445" y="470" width="70" height="80" rx="20" fill="#a5b4c8"/>
    <ellipse cx="255" cy="250" rx="95" ry="115" fill="#c3cede"/>
    <ellipse cx="545" cy="250" rx="95" ry="115" fill="#c3cede"/>
    <ellipse cx="255" cy="250" rx="55" ry="75" fill="#ffc2d1"/>
    <ellipse cx="545" cy="250" rx="55" ry="75" fill="#ffc2d1"/>
    <circle cx="400" cy="250" r="115" fill="#a5b4c8"/>
    <path fill="#a5b4c8" d="M370 300 Q350 420 395 475 Q430 510 470 480 Q450 475 438 460 Q410 410 430 300 Z"/>
    <path d="M378 380 L415 378 M384 420 L420 416"/>
    ${eye(355, 235, 14)} ${eye(445, 235, 14)}
    <circle cx="330" cy="285" r="18" fill="#ffc2d1"/><circle cx="470" cy="285" r="18" fill="#ffc2d1"/>
    <path fill="#fff" d="M345 320 Q330 360 355 375 Q360 345 365 325 Z" stroke-width="6"/>
    <path fill="#fff" d="M455 320 Q470 360 445 375 Q440 345 435 325 Z" stroke-width="6"/>`;

  const bear = `
    <ellipse cx="400" cy="450" rx="145" ry="108" fill="#b7835a"/>
    <ellipse cx="400" cy="470" rx="80" ry="68" fill="#f0d2b0"/>
    <circle cx="300" cy="160" r="45" fill="#b7835a"/><circle cx="500" cy="160" r="45" fill="#b7835a"/>
    <circle cx="300" cy="160" r="22" fill="#f0d2b0"/><circle cx="500" cy="160" r="22" fill="#f0d2b0"/>
    <circle cx="400" cy="260" r="120" fill="#b7835a"/>
    ${eye(355, 240, 14)} ${eye(445, 240, 14)}
    <ellipse cx="400" cy="305" rx="55" ry="42" fill="#f0d2b0"/>
    <ellipse cx="400" cy="290" rx="20" ry="14" fill="#222"/>
    <path d="M400 304 L400 318 Q385 335 368 322 M400 318 Q415 335 432 322"/>
    <circle cx="320" cy="300" r="18" fill="#ffb3b3"/><circle cx="480" cy="300" r="18" fill="#ffb3b3"/>
    <path fill="#ffcf3f" d="M545 420 Q545 380 580 380 L650 380 Q685 380 685 420 L680 520 Q680 545 650 545 L580 545 Q550 545 550 520 Z"/>
    <path fill="#e8a33c" d="M540 380 Q615 350 690 380 L690 405 Q615 385 540 405 Z"/>
    <path fill="#ffcf3f" d="M600 405 Q605 440 615 440 Q625 440 625 405"/>
    <ellipse cx="335" cy="545" rx="45" ry="24" fill="#b7835a"/>
    <ellipse cx="465" cy="545" rx="45" ry="24" fill="#b7835a"/>`;

  const chick = `
    <path d="M360 500 L350 545 M350 545 L330 555 M350 545 L365 558 M440 500 L450 545 M450 545 L470 555 M450 545 L435 558"/>
    <circle cx="400" cy="330" r="160" fill="#ffe14d"/>
    <path fill="#ffd000" d="M245 330 Q200 300 215 260 Q260 290 270 330 Z"/>
    <path fill="#ffd000" d="M555 330 Q600 300 585 260 Q540 290 530 330 Z"/>
    <path fill="#ffe14d" d="M380 175 Q370 130 400 120 Q395 150 410 175 Z"/>
    ${eye(350, 290, 16)} ${eye(450, 290, 16)}
    <path fill="#ff9d1f" d="M375 325 L425 325 L400 355 Z"/>
    <circle cx="315" cy="335" r="20" fill="#ffb3b3"/><circle cx="485" cy="335" r="20" fill="#ffb3b3"/>
    <path fill="#fffaf0" d="M230 390 L270 360 L305 395 L340 360 L370 395 L400 360 L430 395 L460 360 L495 395 L530 360 L570 390 Q570 500 400 510 Q230 500 230 390 Z"/>
    <circle cx="320" cy="450" r="14" fill="#ffd6a5"/><circle cx="470" cy="460" r="18" fill="#ffd6a5"/><circle cx="400" cy="480" r="10" fill="#ffd6a5"/>`;

  const giraffe = `
    ${[300, 360, 470, 530].map(x => `<rect x="${x}" y="380" width="40" height="150" rx="16" fill="#ffc94d"/>`).join('')}
    <path fill="#ffc94d" d="M240 360 Q200 380 190 440"/>
    <path d="M240 360 Q200 380 190 440"/><path fill="#8a5a2b" d="M178 430 Q190 470 202 430 Z"/>
    <ellipse cx="420" cy="340" rx="190" ry="80" fill="#ffc94d"/>
    <path fill="#ffc94d" d="M520 320 Q560 230 545 120 L605 110 Q625 230 600 330 Z"/>
    <path d="M555 125 L545 70 M595 120 L600 68"/>
    <circle cx="545" cy="62" r="12" fill="#8a5a2b"/><circle cx="600" cy="60" r="12" fill="#8a5a2b"/>
    <ellipse cx="520" cy="110" rx="28" ry="14" fill="#ffc94d" transform="rotate(-25 520 110)"/>
    <ellipse cx="600" cy="125" rx="72" ry="48" fill="#ffc94d"/>
    <ellipse cx="655" cy="138" rx="28" ry="24" fill="#ffe2a8"/>
    ${eye(600, 112, 11)}
    <circle cx="660" cy="132" r="4" fill="#222"/>
    <path d="M640 155 Q655 162 668 152"/>
    ${[[340, 320, 22], [410, 300, 18], [470, 340, 24], [370, 370, 16], [540, 300, 16], [575, 220, 14], [565, 170, 10], [290, 340, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c77d2e"/>`).join('')}
    ${ground(530)}`;

  const ptero = `
    <path fill="#ff9f68" d="M380 300 Q250 180 50 200 Q160 255 190 335 Q300 320 380 345 Z"/>
    <path fill="#ff9f68" d="M420 300 Q550 180 750 200 Q640 255 610 335 Q500 320 420 345 Z"/>
    <path d="M190 335 L230 270 M610 335 L570 270"/>
    <path d="M380 400 L370 440 M420 400 L430 440"/>
    <ellipse cx="400" cy="335" rx="52" ry="72" fill="#ffb385"/>
    <path fill="#e8613c" d="M392 210 L320 160 L405 196 Z"/>
    <circle cx="420" cy="230" r="42" fill="#ffb385"/>
    <path fill="#ffd166" d="M455 215 L575 245 L458 258 Z"/>
    ${eye(428, 222, 11)}
    <path fill="#fff" d="M80 520 a26 26 0 0 1 36 -26 a32 32 0 0 1 58 8 a20 20 0 0 1 -6 36 h-80 a18 18 0 0 1 -8 -18 z"/>
    <path fill="#fff" d="M600 520 a26 26 0 0 1 36 -26 a32 32 0 0 1 58 8 a20 20 0 0 1 -6 36 h-80 a18 18 0 0 1 -8 -18 z"/>`;

  const dinoEgg = `
    <ellipse cx="410" cy="250" rx="112" ry="98" fill="#7bd389"/>
    <circle cx="360" cy="280" r="10" fill="#4fae5a"/><circle cx="470" cy="215" r="12" fill="#4fae5a"/>
    <ellipse cx="370" cy="245" rx="20" ry="24" fill="#fff"/><ellipse cx="450" cy="245" rx="20" ry="24" fill="#fff"/>
    ${eye(373, 250, 11)} ${eye(447, 250, 11)}
    <circle cx="340" cy="290" r="15" fill="#ffb3b3"/><circle cx="480" cy="290" r="15" fill="#ffb3b3"/>
    <path d="M390 295 Q410 312 430 295"/>
    <path fill="#fffaf0" d="M312 188 Q410 60 508 188 L486 170 L465 192 L444 170 L423 192 L402 170 L381 192 L360 170 L339 192 Z"/>
    <circle cx="425" cy="130" r="9" fill="#a5d8ff"/><circle cx="385" cy="148" r="7" fill="#a5d8ff"/>
    <g transform="translate(0 30)">
    <path fill="#fffaf0" d="M235 330 L265 300 L295 330 L325 300 L355 330 L385 300 L415 330 L445 300 L475 330 L505 300 L535 330 L565 305 Q590 410 520 480 Q400 560 280 480 Q210 410 235 330 Z"/>
    ${[[300, 400, 16], [380, 450, 12], [470, 400, 20], [520, 450, 10], [420, 500, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#a5d8ff"/>`).join('')}
    <ellipse cx="300" cy="320" rx="30" ry="20" fill="#7bd389"/><ellipse cx="520" cy="320" rx="30" ry="20" fill="#7bd389"/>
    </g>
    <path fill="#ffe066" d="M120 500 Q150 470 180 500 Q150 530 120 500 Z"/><path fill="#ffe066" d="M640 510 Q670 480 700 510 Q670 540 640 510 Z"/>
    ${ground(568)}`;

  const anky = `
    <path fill="#c9a26b" d="M205 385 Q130 395 95 375 L100 405 Q160 425 215 425 Z"/>
    <ellipse cx="78" cy="390" rx="42" ry="32" fill="#a07a48"/>
    ${[215, 285, 470, 540].map(x => `<rect x="${x}" y="400" width="60" height="120" rx="22" fill="#b08a55"/>`).join('')}
    ${[[230, 330], [290, 285], [355, 262], [425, 258], [495, 272], [560, 305]].map(([x, y]) => `<path fill="#f4e1b0" d="M${x - 22} ${y + 12} L${x} ${y - 40} L${x + 22} ${y + 12} Z"/>`).join('')}
    <path fill="#c9a26b" d="M185 425 Q200 255 400 250 Q600 255 625 425 Z"/>
    ${[[280, 360], [350, 320], [430, 315], [510, 340], [570, 390], [330, 395], [420, 380], [500, 400], [250, 405]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#e0bf86"/>`).join('')}
    <ellipse cx="655" cy="405" rx="62" ry="40" fill="#c9a26b"/>
    ${eye(668, 392, 11)}
    <path d="M665 425 Q685 432 705 420"/>
    ${ground(522)}`;

  const starfish = (() => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 95 : 230, a = i * Math.PI / 5 - Math.PI / 2;
      return `${(400 + r * Math.cos(a)).toFixed(0)} ${(310 + r * Math.sin(a)).toFixed(0)}`;
    });
    return `
      <path fill="#ff8a65" d="M${pts.join(' L')} Z"/>
      ${eye(365, 300, 15)} ${eye(435, 300, 15)}
      <circle cx="330" cy="340" r="18" fill="#ffb3b3"/><circle cx="470" cy="340" r="18" fill="#ffb3b3"/>
      <path d="M375 345 Q400 368 425 345"/>
      ${[[400, 150], [400, 200], [560, 255], [240, 255], [500, 440], [300, 440], [530, 280], [270, 280]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#ffccbc"/>`).join('')}
      <circle cx="120" cy="150" r="18" fill="#c8eeff"/><circle cx="680" cy="120" r="14" fill="#c8eeff"/>
      <path d="M40 560 Q200 540 400 560 Q600 580 760 560"/>`;
  })();

  const jelly = `
    ${[300, 350, 400, 450, 500].map((x, i) => `<path d="M${x} 330 Q${x + (i % 2 ? 30 : -30)} 400 ${x} 450 Q${x + (i % 2 ? -30 : 30)} 500 ${x} 550"/>`).join('')}
    <path fill="#f3b0ff" d="M230 330 Q230 140 400 140 Q570 140 570 330 Q545 355 515 330 Q485 355 455 330 Q425 355 400 330 Q375 355 345 330 Q315 355 285 330 Q255 355 230 330 Z"/>
    <path fill="#fde2ff" d="M280 230 Q300 180 350 170 Q310 200 300 240 Z"/>
    ${eye(355, 270, 15)} ${eye(445, 270, 15)}
    <circle cx="320" cy="300" r="16" fill="#ff8fab"/><circle cx="480" cy="300" r="16" fill="#ff8fab"/>
    <path d="M380 300 Q400 318 420 300"/>
    <circle cx="140" cy="200" r="20" fill="#c8eeff"/><circle cx="660" cy="250" r="16" fill="#c8eeff"/><circle cx="640" cy="180" r="10" fill="#c8eeff"/>`;

  const seahorse = `
    <path fill="#ffd166" d="M405 300 Q345 315 385 365 Z"/>
    <path fill="#ffb347" d="M400 140 Q470 125 485 185 L565 195 Q578 218 555 230 L482 235 Q505 300 470 355 Q440 420 470 470 Q505 525 455 545 Q405 550 418 505 Q440 520 445 498 Q405 430 408 360 Q378 300 398 240 Q345 200 400 140 Z"/>
    <path fill="#ffd166" d="M430 260 Q470 300 452 350 Q440 400 452 440 Q420 400 425 350 Q428 300 430 260 Z"/>
    <path d="M440 290 L462 290 M436 330 L460 332 M432 370 L452 372 M436 410 L452 412"/>
    <path fill="#ff8c42" d="M410 145 L400 105 L430 132 L440 95 L455 135 Z"/>
    ${eye(445, 185, 13)}
    <circle cx="460" cy="215" r="10" fill="#ffb3b3"/>
    <circle cx="610" cy="140" r="20" fill="#c8eeff"/><circle cx="640" cy="90" r="13" fill="#c8eeff"/>
    <path fill="#55c271" d="M220 560 Q190 470 230 400 Q270 470 245 560 Z"/>
    <path fill="#55c271" d="M600 560 Q585 490 615 450 Q640 500 620 560 Z"/>
    <path d="M40 560 Q200 545 400 560 Q600 575 760 560"/>`;

  const shark = `
    <path fill="#7a93ad" d="M600 300 L725 195 Q705 300 725 405 Z"/>
    <path fill="#7a93ad" d="M330 222 Q385 105 455 215 Z"/>
    <path fill="#9fb4c9" d="M95 320 Q115 218 330 210 Q525 205 640 300 Q525 400 330 402 Q115 402 95 320 Z"/>
    <path fill="#fff" d="M105 342 Q300 402 560 348 Q470 402 330 402 Q150 402 105 342 Z"/>
    <path fill="#7a93ad" d="M300 372 Q332 452 385 452 Q372 400 352 372 Z"/>
    <path d="M440 270 Q430 300 440 330 M470 268 Q460 298 470 328 M500 272 Q490 300 500 326"/>
    ${eye(195, 282, 14)}
    <path fill="#fff" d="M140 335 Q190 365 250 340 Q195 352 140 335 Z" stroke-width="6"/>
    <circle cx="245" cy="320" r="14" fill="#ffb3b3"/>
    <circle cx="640" cy="120" r="18" fill="#c8eeff"/><circle cx="670" cy="70" r="12" fill="#c8eeff"/>
    <path d="M40 555 Q200 535 400 555 Q600 575 760 555"/>`;

  const dolphin = `
    <path fill="#5aa9e6" d="M150 325 L50 255 Q72 325 50 400 Z"/>
    <path fill="#5aa9e6" d="M355 222 Q398 138 452 220 Z"/>
    <path fill="#7cc0f0" d="M120 330 Q170 218 380 214 Q560 212 640 280 L728 292 Q718 320 645 314 Q560 397 380 397 Q170 397 120 330 Z"/>
    <path fill="#e3f2ff" d="M140 352 Q350 402 610 330 Q540 397 380 397 Q200 397 140 352 Z"/>
    <path fill="#5aa9e6" d="M380 372 Q400 452 452 452 Q442 402 420 374 Z"/>
    ${eye(565, 268, 13)}
    <path d="M640 312 Q675 316 708 306"/>
    <circle cx="540" cy="300" r="14" fill="#ffb3b3"/>
    <path fill="#a5d8ff" d="M40 520 Q120 480 200 520 Q280 560 360 520 Q440 480 520 520 Q600 560 680 520 Q720 500 760 510 L760 560 L40 560 Z"/>
    <circle cx="640" cy="150" r="16" fill="#c8eeff"/><circle cx="680" cy="100" r="10" fill="#c8eeff"/>`;

  /* ---------------- 萬聖節 ---------------- */
  const miniBat = (x, y, k = 1) => `<path fill="#5f3dc4" stroke-width="5" d="M${x} ${y} q${15 * k} ${-18 * k} ${32 * k} ${-4 * k} q${8 * k} ${-14 * k} ${18 * k} 0 q${10 * k} ${-14 * k} ${18 * k} 0 q${17 * k} ${-14 * k} ${32 * k} ${4 * k} q${-22 * k} ${2 * k} ${-28 * k} ${20 * k} q${-10 * k} ${-8 * k} ${-22 * k} 0 q${-12 * k} ${-8 * k} ${-22 * k} 0 q${-6 * k} ${-18 * k} ${-28 * k} ${-20 * k} z"/>`;
  const sparkle = (x, y, r = 14, c = '#ffe066') => `<path fill="${c}" stroke-width="5" d="M${x} ${y - r} L${x + r * .3} ${y - r * .3} L${x + r} ${y} L${x + r * .3} ${y + r * .3} L${x} ${y + r} L${x - r * .3} ${y + r * .3} L${x - r} ${y} L${x - r * .3} ${y - r * .3} Z"/>`;

  const pumpkin = `
    <path fill="#8a5a2b" d="M385 150 Q378 108 402 92 L420 104 Q404 120 414 150 Z"/>
    <path fill="#69c24f" d="M414 128 Q470 88 505 118 Q462 142 414 136 Z"/>
    <ellipse cx="285" cy="335" rx="125" ry="170" fill="#ff922b"/>
    <ellipse cx="515" cy="335" rx="125" ry="170" fill="#ff922b"/>
    <ellipse cx="400" cy="335" rx="145" ry="185" fill="#ffa94d"/>
    <path fill="#ffe066" d="M298 292 L343 225 L385 292 Z"/>
    <path fill="#ffe066" d="M415 292 L457 225 L502 292 Z"/>
    <path fill="#ffe066" d="M380 335 L400 305 L420 335 Z"/>
    <path fill="#ffe066" d="M285 372 Q400 465 515 372 L485 388 L462 366 L441 398 L420 374 L400 404 L380 374 L359 398 L338 366 L315 388 Z"/>
    ${miniBat(110, 140)} ${miniBat(620, 110, .8)}
    ${ground(530)}`;

  const ghost = `
    ${sparkle(140, 150)} ${sparkle(660, 200, 18)} ${sparkle(620, 450, 12)} ${sparkle(170, 420, 10)}
    <path fill="#f3f0ff" d="M265 330 Q200 320 182 270 Q225 285 265 296 Z"/>
    <path fill="#f3f0ff" d="M535 330 Q600 320 618 270 Q575 285 535 296 Z"/>
    <path fill="#f3f0ff" d="M260 520 L260 260 Q260 110 400 110 Q540 110 540 260 L540 520 Q510 490 480 520 Q450 550 420 520 Q400 495 380 520 Q350 550 320 520 Q290 490 260 520 Z"/>
    <ellipse cx="350" cy="250" rx="18" ry="26" fill="#222"/><ellipse cx="450" cy="250" rx="18" ry="26" fill="#222"/>
    <circle cx="355" cy="240" r="6" fill="#fff" stroke="none"/><circle cx="455" cy="240" r="6" fill="#fff" stroke="none"/>
    <circle cx="315" cy="300" r="18" fill="#ffc2d1"/><circle cx="485" cy="300" r="18" fill="#ffc2d1"/>
    <ellipse cx="400" cy="320" rx="22" ry="28" fill="#ff8fab"/>`;

  const bat = `
    <circle cx="650" cy="115" r="58" fill="#fff3b0"/>
    ${sparkle(120, 110)} ${sparkle(200, 480, 12)} ${sparkle(640, 470, 16)}
    <path fill="#7048e8" d="M370 300 Q300 195 115 205 Q160 250 148 305 Q200 282 222 325 Q262 300 282 352 Q322 322 370 342 Z"/>
    <path fill="#7048e8" d="M430 300 Q500 195 685 205 Q640 250 652 305 Q600 282 578 325 Q538 300 518 352 Q478 322 430 342 Z"/>
    <path fill="#845ef7" d="M352 262 L345 200 L385 245 Z"/><path fill="#845ef7" d="M448 262 L455 200 L415 245 Z"/>
    <ellipse cx="400" cy="320" rx="62" ry="78" fill="#845ef7"/>
    <ellipse cx="400" cy="345" rx="34" ry="40" fill="#b197fc"/>
    ${eye(378, 290, 11)} ${eye(422, 290, 11)}
    <path d="M385 318 Q400 328 415 318"/>
    <path fill="#fff" stroke-width="5" d="M388 320 L392 334 L397 321 Z"/><path fill="#fff" stroke-width="5" d="M403 321 L408 334 L412 320 Z"/>
    <path d="M385 395 L380 415 M415 395 L420 415"/>`;

  const witchHat = `
    ${sparkle(130, 130, 18)} ${sparkle(660, 160)} ${sparkle(150, 330, 10)}
    <ellipse cx="400" cy="440" rx="260" ry="58" fill="#7048e8"/>
    <path fill="#845ef7" d="M262 430 Q335 300 362 155 Q372 92 445 82 Q505 78 525 122 Q472 112 458 162 Q470 300 538 430 Z"/>
    <path fill="#ff922b" d="M270 392 Q400 425 528 392 L538 430 Q400 462 262 430 Z"/>
    <rect x="368" y="392" width="64" height="52" rx="8" fill="#ffd43b"/>
    <rect x="385" y="406" width="30" height="24" rx="4" fill="#ff922b"/>
    ${sparkle(400, 250, 16)} ${sparkle(440, 175, 10)} ${sparkle(360, 330, 10)}
    <path d="M610 230 L610 330"/>
    <circle cx="610" cy="350" r="22" fill="#555"/>
    <path d="M590 340 L570 330 M590 352 L568 356 M630 340 L650 330 M630 352 L652 356"/>
    ${eye(602, 346, 5)} ${eye(618, 346, 5)}`;

  const monster = `
    <ellipse cx="250" cy="360" rx="40" ry="70" fill="#69db7c" transform="rotate(25 250 360)"/>
    <ellipse cx="550" cy="360" rx="40" ry="70" fill="#69db7c" transform="rotate(-25 550 360)"/>
    <path fill="#ffd43b" d="M302 165 L280 78 L345 140 Z"/><path fill="#ffd43b" d="M498 165 L520 78 L455 140 Z"/>
    <ellipse cx="330" cy="525" rx="55" ry="26" fill="#51cf66"/><ellipse cx="470" cy="525" rx="55" ry="26" fill="#51cf66"/>
    <path fill="#8ce99a" d="M222 505 Q200 300 262 200 Q330 112 400 112 Q470 112 538 200 Q600 300 578 505 Q400 535 222 505 Z"/>
    <circle cx="400" cy="240" r="62" fill="#fff"/>
    ${eye(400, 248, 30)}
    <path fill="#c92a2a" d="M318 340 Q400 430 482 340 Q400 360 318 340 Z"/>
    <path fill="#fff" stroke-width="5" d="M345 346 L358 372 L372 349 Z"/><path fill="#fff" stroke-width="5" d="M428 349 L442 372 L455 346 Z"/>
    ${[[290, 420, 20], [500, 430, 16], [460, 170, 12], [330, 180, 9], [400, 470, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#51cf66"/>`).join('')}`;

  const mummy = `
    ${miniBat(110, 130)} ${miniBat(600, 100, .9)}
    <rect x="320" y="480" width="64" height="62" rx="22" fill="#f1e6cf"/>
    <rect x="416" y="480" width="64" height="62" rx="22" fill="#f1e6cf"/>
    <rect x="215" y="300" width="110" height="46" rx="23" fill="#f1e6cf"/>
    <rect x="475" y="300" width="110" height="46" rx="23" fill="#f1e6cf"/>
    <rect x="300" y="275" width="200" height="225" rx="56" fill="#f1e6cf"/>
    <path d="M308 335 L492 352 M304 400 L496 385 M308 455 L492 468 M250 300 L262 346 M550 300 L538 346"/>
    <circle cx="400" cy="200" r="98" fill="#f1e6cf"/>
    <path d="M325 150 L475 140 M318 265 L482 255"/>
    <rect x="322" y="175" width="156" height="58" rx="26" fill="#6c5b4a"/>
    <circle cx="365" cy="204" r="20" fill="#fff"/>${eye(365, 206, 10)}
    <circle cx="437" cy="204" r="20" fill="#fff"/>${eye(437, 206, 10)}
    <path fill="#f1e6cf" d="M490 160 Q560 150 575 200 Q545 185 492 190 Z"/>
    ${ground(545)}`;

  const hauntedHouse = `
    <circle cx="655" cy="105" r="56" fill="#fff3b0"/>
    ${miniBat(90, 110)} ${miniBat(180, 70, .7)} ${miniBat(560, 190, .7)}
    <rect x="455" y="125" width="44" height="90" fill="#7a6a8a"/>
    <path fill="#5f3dc4" d="M195 265 L400 105 L605 265 Z"/>
    <rect x="230" y="255" width="340" height="270" fill="#9c88b5"/>
    <path fill="#ff922b" d="M355 525 L355 420 Q355 370 400 370 Q445 370 445 420 L445 525 Z"/>
    <circle cx="430" cy="455" r="7" fill="#ffd43b"/>
    <rect x="262" y="295" width="74" height="74" rx="6" fill="#ffe066"/>
    <rect x="464" y="295" width="74" height="74" rx="6" fill="#ffe066"/>
    <path d="M299 295 L299 369 M262 332 L336 332 M501 295 L501 369 M464 332 L538 332"/>
    <circle cx="400" cy="205" r="30" fill="#ffe066"/>
    <path fill="#f3f0ff" d="M480 420 Q480 380 510 380 Q540 380 540 420 L540 470 L530 460 L520 470 L510 460 L500 470 L490 460 L480 470 Z"/>
    <circle cx="502" cy="410" r="5" fill="#222"/><circle cx="520" cy="410" r="5" fill="#222"/>
    <path fill="#ffa94d" d="M150 525 Q115 525 115 495 Q115 465 150 465 Q185 465 185 495 Q185 525 150 525 Z"/>
    <path d="M150 465 L155 445"/>
    <path d="M60 525 L60 440 M90 525 L90 440 M45 470 L105 470 M640 525 L640 440 M670 525 L670 440 M700 525 L700 440 M625 470 L715 470"/>
    ${ground(527)}`;

  /* ---------------- 故事角色 ---------------- */
  const wolf = `
    <path fill="#8d99ae" d="M530 470 Q640 470 660 380 Q665 340 700 330 Q720 360 700 400 Q690 500 530 515 Z"/>
    <path fill="#dfe4ec" d="M688 340 Q705 335 712 350 Q705 375 692 372 Z"/>
    <ellipse cx="400" cy="445" rx="140" ry="105" fill="#8d99ae"/>
    <ellipse cx="400" cy="470" rx="75" ry="65" fill="#dfe4ec"/>
    <path fill="#8d99ae" d="M290 230 L300 95 L375 170 Z"/>
    <path fill="#8d99ae" d="M510 230 L500 95 L425 170 Z"/>
    <path fill="#ffc2d1" d="M308 190 L312 135 L350 172 Z"/>
    <path fill="#ffc2d1" d="M492 190 L488 135 L450 172 Z"/>
    <path fill="#8d99ae" d="M285 240 Q290 145 400 140 Q510 145 515 240 Q520 330 400 365 Q280 330 285 240 Z"/>
    <path fill="#dfe4ec" d="M335 290 Q345 255 400 255 Q455 255 465 290 Q460 352 400 365 Q340 352 335 290 Z"/>
    ${eye(352, 225, 13)} ${eye(448, 225, 13)}
    <path d="M330 200 L372 212 M470 200 L428 212"/>
    <ellipse cx="400" cy="282" rx="22" ry="15" fill="#222"/>
    <path d="M400 297 L400 315 Q382 335 362 322 M400 315 Q418 335 438 322"/>
    <path fill="#fff" stroke-width="5" d="M372 322 L378 336 L384 326 Z"/><path fill="#fff" stroke-width="5" d="M416 326 L422 336 L428 322 Z"/>
    <ellipse cx="335" cy="540" rx="45" ry="24" fill="#8d99ae"/>
    <ellipse cx="465" cy="540" rx="45" ry="24" fill="#8d99ae"/>`;

  const sheep = `
    ${[300, 360, 440, 500].map(x => `<rect x="${x - 16}" y="420" width="32" height="105" rx="14" fill="#5c4b4b"/>`).join('')}
    <path fill="#fbfbfb" d="${scallop(400, 360, 150, 14, 14)}"/>
    <ellipse cx="270" cy="260" rx="38" ry="18" fill="#7a6262" transform="rotate(-25 270 260)"/>
    <ellipse cx="530" cy="260" rx="38" ry="18" fill="#7a6262" transform="rotate(25 530 260)"/>
    <path fill="#fbfbfb" d="${scallop(400, 205, 70, 9, 10)}"/>
    <ellipse cx="400" cy="275" rx="78" ry="88" fill="#7a6262"/>
    <path fill="#fbfbfb" d="${scallop(400, 205, 55, 8, 9)}"/>
    <circle cx="370" cy="270" r="17" fill="#fff"/>${eye(370, 272, 9)}
    <circle cx="430" cy="270" r="17" fill="#fff"/>${eye(430, 272, 9)}
    <circle cx="345" cy="310" r="13" fill="#ffb3b3"/><circle cx="455" cy="310" r="13" fill="#ffb3b3"/>
    <path d="M385 322 Q400 336 415 322"/>
    ${ground(527)}`;

  // 小朋友：hood 是帽子顏色，有帽子就是小紅帽
  const kid = (cape, hood, shirt, hair) => `
    <rect x="345" y="455" width="40" height="80" rx="16" fill="#ffd8b8"/>
    <rect x="415" y="455" width="40" height="80" rx="16" fill="#ffd8b8"/>
    <ellipse cx="362" cy="537" rx="34" ry="18" fill="#6b4226"/>
    <ellipse cx="438" cy="537" rx="34" ry="18" fill="#6b4226"/>
    ${cape ? `<path fill="${cape}" d="M300 300 Q250 420 255 480 L545 480 Q550 420 500 300 Z"/>` : ''}
    <path fill="${shirt}" d="M325 310 Q300 400 300 470 L500 470 Q500 400 475 310 Q400 290 325 310 Z"/>
    <path fill="#fff" d="M300 445 L500 445 L500 470 L300 470 Z"/>
    <ellipse cx="300" cy="380" rx="28" ry="50" fill="${cape || shirt}" transform="rotate(15 300 380)"/>
    <ellipse cx="500" cy="380" rx="28" ry="50" fill="${cape || shirt}" transform="rotate(-15 500 380)"/>
    <circle cx="292" cy="425" r="18" fill="#ffd8b8"/><circle cx="508" cy="425" r="18" fill="#ffd8b8"/>
    ${hood ? `<path fill="${hood}" d="M275 240 Q275 95 400 92 Q525 95 525 240 Q530 330 470 330 L330 330 Q270 330 275 240 Z"/>` : ''}
    ${!hood ? `<path fill="${hair}" d="M298 215 Q300 105 400 102 Q500 105 502 215 Q505 260 490 280 L310 280 Q295 260 298 215 Z"/>` : ''}
    <circle cx="400" cy="230" r="92" fill="#ffd8b8"/>
    <path fill="${hair}" d="M310 210 Q320 140 400 135 Q480 140 490 210 Q450 175 420 185 Q400 160 375 185 Q345 170 310 210 Z"/>
    ${eye(365, 235, 12)} ${eye(435, 235, 12)}
    <circle cx="340" cy="268" r="15" fill="#ffb3b3"/><circle cx="460" cy="268" r="15" fill="#ffb3b3"/>
    <path d="M385 275 Q400 290 415 275"/>`;
  const redHood = kid('#e03131', '#e03131', '#ffd43b', '#8a5a2b') + `
    <path fill="#c98a4b" d="M520 440 L610 440 L598 500 L532 500 Z"/>
    <path d="M532 440 Q565 395 598 440" fill="none"/>
    <circle cx="555" cy="438" r="10" fill="#e03131"/><circle cx="578" cy="436" r="10" fill="#e03131"/>`;
  const shepherd = kid('', '', '#4dabf7', '#3d2f1f') + `
    <path d="M560 540 L560 300 Q560 260 595 262 Q625 265 620 300" fill="none" stroke-width="10"/>`;

  const grandma = kid('#9775fa', '', '#fff3bf', '#dee2e6') + `
    <circle cx="400" cy="112" r="34" fill="#dee2e6"/>
    <path d="M341 238 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 M411 238 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 M389 236 L411 236"/>
    <path fill="#c98a4b" d="M560 545 L560 330"/><path d="M560 545 L560 330 Q560 300 585 300"/>`;

  // 房子線稿：稻草、木頭、磚頭、外婆家
  const houseArt = type => {
    const col = { straw: ['#f6d365', '#e0b23f'], wood: ['#c98a4b', '#9c6332'], brick: ['#e8664f', '#b5442f'], grandma: ['#ffe8cc', '#e8590c'] }[type];
    const deco = type === 'straw'
      ? [190, 240, 290, 520, 570, 610].map(x => `<path d="M${x} 300 L${x + 10} 500"/>`).join('')
      : type === 'wood'
        ? [350, 400, 450].map(y => `<path d="M175 ${y} L625 ${y}"/>`).join('')
        : type === 'brick'
          ? [340, 380, 420, 460].map((y, i) => `<path d="M175 ${y} L625 ${y}"/>${[230, 300, 520, 590].map(x => `<path d="M${x + (i % 2) * 35} ${y - 40} L${x + (i % 2) * 35} ${y}"/>`).join('')}`).join('')
          : '<path fill="#ff8fab" d="M200 330 Q215 300 230 330 Q215 345 200 330 Z"/><path fill="#ff8fab" d="M570 330 Q585 300 600 330 Q585 345 570 330 Z"/>';
    return `
      <rect x="470" y="110" width="60" height="110" fill="#adb5bd"/>
      <rect x="175" y="290" width="450" height="240" fill="${col[0]}"/>
      ${deco}
      <path fill="${col[1]}" d="M130 305 L400 95 L670 305 Z"/>
      <circle cx="400" cy="220" r="34" fill="#fff3a0"/>
      <path fill="#7a4a22" d="M345 530 L345 420 Q345 370 400 370 Q455 370 455 420 L455 530 Z"/>
      <circle cx="435" cy="455" r="8" fill="#ffd43b"/>
      <rect x="205" y="350" width="100" height="90" rx="8" fill="#fff3a0"/>
      <rect x="495" y="350" width="100" height="90" rx="8" fill="#fff3a0"/>
      <path d="M255 350 L255 440 M205 395 L305 395 M545 350 L545 440 M495 395 L595 395"/>
      ${ground(530)}`;
  };

  const trophy = `
    ${sparkle(170, 150, 20)} ${sparkle(630, 130, 16)} ${sparkle(600, 330, 12)}
    <path fill="#ffd43b" d="M290 130 Q220 130 225 200 Q232 270 320 280 L330 255 Q258 245 255 200 Q255 160 290 160 Z"/>
    <path fill="#ffd43b" d="M510 130 Q580 130 575 200 Q568 270 480 280 L470 255 Q542 245 545 200 Q545 160 510 160 Z"/>
    <path fill="#ffe066" d="M280 110 L520 110 L510 220 Q490 330 400 335 Q310 330 290 220 Z"/>
    <path fill="#fff" d="M320 135 L345 135 L340 230 Q330 250 325 230 Z"/>
    <rect x="375" y="330" width="50" height="70" fill="#fab005"/>
    <rect x="300" y="400" width="200" height="40" rx="8" fill="#fab005"/>
    <rect x="270" y="440" width="260" height="70" rx="10" fill="#8a5a2b"/>
    <path fill="#ffe066" d="M400 160 L413 190 L445 193 L421 214 L428 246 L400 229 L372 246 L379 214 L355 193 L387 190 Z"/>
    ${ground(512)}`;

  const basket = `
    <path d="M230 300 Q400 60 570 300" fill="none" stroke-width="16"/>
    <path fill="#e8590c" d="M300 260 Q290 210 340 205 Q380 205 375 255 Z"/>
    <path fill="#e03131" d="M370 250 Q365 200 410 200 Q455 205 445 255 Z"/>
    <path fill="#ffd43b" d="M440 255 Q440 205 490 210 Q525 220 505 262 Z"/>
    <path fill="#c98a4b" d="M200 280 L600 280 L560 500 Q555 520 535 520 L265 520 Q245 520 240 500 Z"/>
    <path d="M215 350 L585 350 M228 420 L572 420 M300 280 L320 520 M400 280 L400 520 M500 280 L480 520"/>
    <path fill="#ff8fab" d="M200 270 L600 270 L600 300 L200 300 Z"/>
    ${[250, 330, 410, 490, 560].map(x => `<circle cx="${x}" cy="285" r="7" fill="#fff"/>`).join('')}
    ${ground(522)}`;

  const mouse = `
    <path d="M520 480 Q640 500 650 420 Q655 380 690 380"/>
    <ellipse cx="400" cy="450" rx="125" ry="100" fill="#ced4da"/>
    <ellipse cx="400" cy="470" rx="70" ry="60" fill="#f1f3f5"/>
    <circle cx="275" cy="190" r="80" fill="#ced4da"/><circle cx="525" cy="190" r="80" fill="#ced4da"/>
    <circle cx="275" cy="190" r="50" fill="#ffc2d1"/><circle cx="525" cy="190" r="50" fill="#ffc2d1"/>
    <path fill="#ced4da" d="M290 270 Q290 170 400 165 Q510 170 510 270 Q505 350 400 370 Q295 350 290 270 Z"/>
    ${eye(360, 260, 14)} ${eye(440, 260, 14)}
    <circle cx="400" cy="315" r="14" fill="#ff8fab"/>
    <path d="M400 329 L400 340 Q388 352 375 344 M400 340 Q412 352 425 344 M330 310 L270 300 M330 325 L268 332 M470 310 L530 300 M470 325 L532 332"/>
    <circle cx="335" cy="300" r="14" fill="#ffc2d1"/><circle cx="465" cy="300" r="14" fill="#ffc2d1"/>
    <ellipse cx="345" cy="545" rx="38" ry="20" fill="#ffc2d1"/>
    <ellipse cx="455" cy="545" rx="38" ry="20" fill="#ffc2d1"/>`;

  const crow = `
    <path d="M340 440 L330 520 M330 520 L305 535 M330 520 L345 540 M420 445 L425 520 M425 520 L400 535 M425 520 L445 540"/>
    <path fill="#495057" d="M200 330 L90 300 L120 350 L80 380 L210 380 Z"/>
    <ellipse cx="370" cy="360" rx="175" ry="110" fill="#495057"/>
    <path fill="#343a40" d="M250 330 Q350 290 450 340 Q380 430 260 400 Z"/>
    <circle cx="530" cy="250" r="90" fill="#495057"/>
    <path fill="#ffa94d" d="M605 230 L720 260 L605 290 Z"/>
    <path d="M605 260 L700 260"/>
    <circle cx="555" cy="225" r="24" fill="#fff"/>${eye(560, 228, 12)}
    <circle cx="530" cy="285" r="14" fill="#ffb3b3"/>
    ${ground(540)}`;

  const duckling = `
    <path fill="#ff922b" d="M330 470 L310 530 L350 530 Z M430 470 L420 530 L460 530 Z"/>
    <path fill="#adb5bd" d="M180 360 Q170 250 260 270 Q360 300 470 300 Q600 300 600 400 Q590 490 420 490 L300 490 Q190 480 180 360 Z"/>
    <path fill="#868e96" d="M300 360 Q390 330 470 380 Q420 440 320 420 Z"/>
    <circle cx="530" cy="230" r="95" fill="#adb5bd"/>
    <path fill="#ff922b" d="M610 240 Q700 230 705 260 Q690 285 610 280 Z"/>
    <path fill="#adb5bd" d="M520 140 Q530 110 555 120 Q540 130 545 145 Z"/>
    ${eye(560, 215, 13)}
    <circle cx="545" cy="265" r="15" fill="#ffb3b3"/>
    <path fill="#a5d8ff" d="M40 530 Q200 505 400 530 Q600 555 760 530 L760 570 L40 570 Z"/>`;

  const swan = `
    <path fill="#f8f9fa" d="M150 400 Q130 300 260 320 Q330 330 420 330 Q560 330 560 420 Q540 500 380 505 L260 505 Q160 495 150 400 Z"/>
    <path fill="#e9ecef" d="M240 380 Q340 330 460 380 Q380 460 260 440 Z"/>
    <path fill="#f8f9fa" d="M500 350 Q590 300 560 200 Q530 110 600 90 Q660 80 670 130 Q640 120 625 140 Q590 180 620 250 Q650 350 540 400 Z"/>
    <path fill="#ff922b" d="M660 115 L730 140 L668 150 Z"/>
    <path fill="#343a40" d="M640 105 Q660 100 670 115 Q660 128 645 125 Z"/>
    ${eye(625, 112, 9)}
    <path fill="#ffd43b" d="M590 70 L600 45 L612 68 L625 45 L632 72 Z"/>
    <path fill="#a5d8ff" d="M40 520 Q200 495 400 520 Q600 545 760 520 L760 570 L40 570 Z"/>`;

  const jarArt = `
    <path fill="#e7f5ff" d="M300 140 L500 140 L530 480 Q530 520 490 520 L310 520 Q270 520 270 480 Z"/>
    <path fill="#74c0fc" d="M282 330 L518 330 L528 470 Q528 512 490 512 L310 512 Q272 512 272 470 Z"/>
    ${[[320, 480], [380, 488], [440, 482], [495, 476], [345, 440], [410, 446], [470, 438], [380, 400], [440, 404]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="28" ry="20" fill="#ced4da"/>`).join('')}
    <rect x="290" y="110" width="220" height="40" rx="12" fill="#e7f5ff"/>
    ${[[620, 500], [680, 510], [650, 470], [130, 505], [180, 498]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="18" fill="#ced4da"/>`).join('')}
    ${ground(527)}`;

  const giantCarrot = `
    <path fill="#69db7c" d="M400 210 Q330 120 350 50 Q395 110 405 200 Q420 90 470 40 Q480 130 420 215 Q500 150 560 150 Q520 210 425 230 Z"/>
    <path fill="#ff922b" d="M260 250 Q400 190 540 250 Q560 330 470 480 Q420 560 400 560 Q380 560 330 480 Q240 330 260 250 Z"/>
    <path d="M300 300 L340 305 M470 330 L505 322 M340 400 L370 404 M440 430 L470 425"/>
    ${[[150, 520], [650, 500]].map(([x, y]) => `<path fill="#69db7c" d="M${x} ${y} Q${x - 30} ${y - 50} ${x - 10} ${y - 80} Q${x + 5} ${y - 40} ${x} ${y} Q${x + 20} ${y - 60} ${x + 45} ${y - 70} Q${x + 30} ${y - 30} ${x} ${y} Z"/>`).join('')}`;

  /* ---------------- 建築 ---------------- */
  const win = (x, y, w = 70, h = 60, c = '#a8e0ff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c}"/><path d="M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}"/>`;
  const tree2 = x => `<rect x="${x - 10}" y="440" width="20" height="90" fill="#9c6b3c"/><circle cx="${x}" cy="420" r="45" fill="#69db7c"/>`;

  const hospital = `
    ${tree2(85)} ${tree2(715)}
    <rect x="150" y="220" width="500" height="310" fill="#f8f9fa"/>
    <rect x="130" y="200" width="540" height="34" rx="6" fill="#74c0fc"/>
    <rect x="300" y="90" width="200" height="130" fill="#f8f9fa"/>
    <circle cx="400" cy="150" r="46" fill="#fff"/>
    <path fill="#ff6b6b" d="M386 118 L414 118 L414 136 L432 136 L432 164 L414 164 L414 182 L386 182 L386 164 L368 164 L368 136 L386 136 Z"/>
    ${win(185, 260)} ${win(275, 260)} ${win(455, 260)} ${win(545, 260)}
    ${win(185, 360)} ${win(545, 360)}
    <path fill="#a8e0ff" d="M330 530 L330 380 Q330 360 350 360 L450 360 Q470 360 470 380 L470 530 Z"/>
    <path d="M400 360 L400 530"/>
    <rect x="300" y="345" width="200" height="20" rx="6" fill="#ff6b6b"/>
    ${ground(530)}`;

  const policeStation = `
    ${tree2(80)}
    <rect x="610" y="120" width="10" height="190" fill="#adb5bd"/>
    <path fill="#4dabf7" d="M620 125 L700 145 L620 165 Z"/>
    <rect x="160" y="250" width="440" height="280" fill="#d0ebff"/>
    <path fill="#1c7ed6" d="M130 260 L380 140 L630 260 Z"/>
    <path fill="#ffd43b" d="M380 170 L392 196 L420 199 L399 218 L405 246 L380 232 L355 246 L361 218 L340 199 L368 196 Z"/>
    <rect x="130" y="255" width="500" height="26" fill="#1c7ed6"/>
    ${[195, 265, 495, 565].map(x => `<rect x="${x - 14}" y="281" width="28" height="249" fill="#f8f9fa"/>`).join('')}
    ${win(310, 300, 140, 60)}
    <path fill="#1864ab" d="M325 530 L325 400 Q325 380 345 380 L415 380 Q435 380 435 400 L435 530 Z"/>
    <circle cx="420" cy="460" r="6" fill="#ffd43b"/>
    <rect x="450" y="395" width="40" height="70" rx="6" fill="#ff6b6b"/><rect x="450" y="395" width="20" height="70" rx="6" fill="#4dabf7"/>
    ${ground(530)}`;

  const fireStation = `
    <rect x="365" y="70" width="70" height="40" rx="12" fill="#ffd43b"/>
    <path d="M345 80 L325 70 M455 80 L475 70 M400 60 L400 45"/>
    <rect x="140" y="110" width="520" height="420" fill="#ff8787"/>
    <rect x="120" y="100" width="560" height="34" rx="6" fill="#c92a2a"/>
    <circle cx="400" cy="185" r="40" fill="#fff"/>
    <path fill="#ff922b" d="M400 155 Q430 185 418 205 Q412 215 400 215 Q386 215 382 205 Q372 185 392 172 Q392 188 402 190 Q398 172 400 155 Z"/>
    ${win(180, 160)} ${win(550, 160)}
    ${[175, 415].map(x => `<path fill="#f1f3f5" d="M${x} 530 L${x} 300 Q${x} 260 ${x + 105} 260 Q${x + 210} 260 ${x + 210} 300 L${x + 210} 530 Z"/>${[330, 380, 430, 480].map(y => `<path d="M${x} ${y} L${x + 210} ${y}"/>`).join('')}`).join('')}
    ${ground(530)}`;

  const postOffice = `
    ${tree2(710)}
    <rect x="150" y="220" width="440" height="310" fill="#b2f2bb"/>
    <path fill="#2f9e44" d="M120 230 L370 120 L620 230 Z"/>
    <rect x="300" y="235" width="140" height="90" rx="8" fill="#fff"/>
    <path fill="#fff9db" d="M318 255 L422 255 L422 307 L318 307 Z"/>
    <path d="M318 255 L370 290 L422 255"/>
    ${win(180, 250)} ${win(490, 250)}
    <path fill="#a8e0ff" d="M320 530 L320 395 Q320 375 340 375 L400 375 Q420 375 420 395 L420 530 Z"/>
    ${win(180, 380, 90, 80)}
    <rect x="610" y="390" width="56" height="110" rx="20" fill="#e03131"/>
    <rect x="672" y="390" width="56" height="110" rx="20" fill="#2f9e44"/>
    <rect x="620" y="420" width="36" height="8" rx="4" fill="#222"/><rect x="682" y="420" width="36" height="8" rx="4" fill="#222"/>
    <rect x="628" y="500" width="20" height="30" fill="#868e96"/><rect x="690" y="500" width="20" height="30" fill="#868e96"/>
    ${ground(530)}`;

  const school = `
    <rect x="600" y="140" width="10" height="390" fill="#adb5bd"/>
    <path fill="#ff6b6b" d="M610 145 L690 165 L610 185 Z"/>
    <rect x="80" y="260" width="500" height="270" fill="#ffe8a1"/>
    <rect x="70" y="250" width="520" height="26" rx="6" fill="#e8590c"/>
    <rect x="260" y="130" width="140" height="130" fill="#ffd43b"/>
    <path fill="#e8590c" d="M245 140 L330 70 L415 140 Z"/>
    <circle cx="330" cy="195" r="40" fill="#fff"/>
    <path d="M330 195 L330 170 M330 195 L350 205"/>
    ${win(110, 300)} ${win(200, 300)} ${win(400, 300)} ${win(490, 300)}
    ${win(110, 410)} ${win(490, 410)}
    <path fill="#c98a4b" d="M270 530 L270 410 Q270 385 295 385 L365 385 Q390 385 390 410 L390 530 Z"/>
    <path d="M330 385 L330 530"/>
    ${ground(530)}`;

  const supermarket = `
    <rect x="110" y="200" width="580" height="330" fill="#fff4e6"/>
    <rect x="200" y="110" width="400" height="80" rx="20" fill="#ffd43b"/>
    <path fill="#ff6b6b" d="M300 150 Q300 125 322 128 Q340 130 340 150 Q340 175 320 178 Q300 175 300 150 Z"/>
    <path d="M320 128 Q322 112 334 108"/>
    <path fill="#69db7c" d="M360 135 L480 135 L470 168 L370 168 Z"/>
    <circle cx="380" cy="178" r="7" fill="#fff"/><circle cx="460" cy="178" r="7" fill="#fff"/>
    <path d="M345 128 L360 135"/>
    <path fill="#fff" d="M90 200 L710 200 L700 250 L100 250 Z"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<path fill="#ff8787" d="M${100 + i * 100} 200 L${150 + i * 100} 200 L${148 + i * 100} 250 L${100 + i * 100} 250 Z"/>`).join('')}
    ${[[150, 290], [520, 290]].map(([x, y]) => `<rect x="${x}" y="${y}" width="130" height="150" rx="8" fill="#a8e0ff"/><path d="M${x} ${y + 50} L${x + 130} ${y + 50} M${x} ${y + 100} L${x + 130} ${y + 100}"/>${[0, 1, 2].map(r => `<circle cx="${x + 30}" cy="${y + 35 + r * 50}" r="10" fill="#ffa94d"/><rect x="${x + 60}" y="${y + 22 + r * 50}" width="22" height="26" rx="4" fill="#ff8787"/><circle cx="${x + 105}" cy="${y + 35 + r * 50}" r="10" fill="#69db7c"/>`).join('')}`).join('')}
    <path fill="#a8e0ff" d="M320 530 L320 300 L480 300 L480 530 Z"/>
    <path d="M400 300 L400 530"/>
    ${ground(530)}`;

  const tiger = `
    <path fill="#ff922b" d="M520 470 Q640 480 640 360 Q640 320 670 305 Q700 320 685 360 Q690 510 510 505 Z"/>
    <path fill="#222" d="M630 345 L668 338 L664 352 Z M622 400 L660 398 L652 412 Z"/>
    <ellipse cx="400" cy="440" rx="150" ry="105" fill="#ff922b"/>
    <ellipse cx="400" cy="460" rx="80" ry="65" fill="#fff4e6"/>
    <path fill="#222" d="M262 420 L310 430 L262 446 Z M538 420 L490 430 L538 446 Z M270 480 L312 482 L280 498 Z M530 480 L488 482 L520 498 Z"/>
    <circle cx="300" cy="160" r="40" fill="#ff922b"/><circle cx="500" cy="160" r="40" fill="#ff922b"/>
    <circle cx="300" cy="160" r="20" fill="#fff4e6"/><circle cx="500" cy="160" r="20" fill="#fff4e6"/>
    <circle cx="400" cy="260" r="122" fill="#ff922b"/>
    <ellipse cx="400" cy="305" rx="70" ry="52" fill="#fff4e6"/>
    <path fill="#222" d="M278 235 L322 245 L278 258 Z M522 235 L478 245 L522 258 Z M285 285 L320 290 L290 302 Z M515 285 L480 290 L510 302 Z"/>
    <path d="M375 158 L425 158 M372 176 L428 176 M368 196 L432 196 M400 158 L400 196" stroke-width="7"/>
    ${eye(355, 245, 14)} ${eye(445, 245, 14)}
    <path fill="#ff8fab" d="M386 287 L414 287 L400 302 Z"/>
    <path d="M400 302 Q388 325 368 310 M400 302 Q412 325 432 310"/>
    <ellipse cx="335" cy="535" rx="45" ry="24" fill="#ff922b"/>
    <ellipse cx="465" cy="535" rx="45" ry="24" fill="#ff922b"/>`;

  const DRAWINGS = [
    { id: 'car', cat: 'car', name: '小汽車', svg: car },
    { id: 'firetruck', cat: 'car', name: '消防車', svg: fireTruck },
    { id: 'bus', cat: 'car', name: '公車', svg: bus },
    { id: 'digger', cat: 'car', name: '挖土機', svg: digger },
    { id: 'train', cat: 'car', name: '小火車', svg: train },
    { id: 'plane', cat: 'car', name: '飛機', svg: plane },
    { id: 'police', cat: 'car', name: '警車', svg: police },
    { id: 'heli', cat: 'car', name: '直升機', svg: heli },
    { id: 'cat', cat: 'animal', name: '小貓咪', svg: cat, also: ['story-carrot'] },
    { id: 'dog', cat: 'animal', name: '小狗狗', svg: dog, also: ['story-carrot'] },
    { id: 'bunny', cat: 'animal', name: '小兔子', svg: bunny, also: ['story-race', 'story-carrot'] },
    { id: 'lion', cat: 'animal', name: '小獅子', svg: lion, also: ['story-lion'] },
    { id: 'pig', cat: 'animal', name: '小豬', svg: pig, also: ['story-pigs'] },
    { id: 'elephant', cat: 'animal', name: '大象', svg: elephant },
    { id: 'bear', cat: 'animal', name: '小熊', svg: bear },
    { id: 'chick', cat: 'animal', name: '小雞', svg: chick },
    { id: 'wolf', cat: 'animal', name: '大野狼', svg: wolf, also: ['story-redhood', 'story-pigs', 'story-wolf'] },
    { id: 'sheep', cat: 'animal', name: '小綿羊', svg: sheep, also: ['story-wolf'] },
    { id: 'redhood', cat: 'animal', name: '小紅帽', svg: redHood, also: ['story-redhood'] },
    { id: 'shepherd', cat: 'animal', name: '放羊的孩子', svg: shepherd, also: ['story-wolf'] },
    { id: 'tiger', cat: 'animal', name: '小老虎', svg: tiger },
    { id: 'giraffe', cat: 'animal', name: '長頸鹿', svg: giraffe },
    { id: 'trex', cat: 'dino', name: '霸王龍', svg: trex },
    { id: 'trike', cat: 'dino', name: '三角龍', svg: trike },
    { id: 'longneck', cat: 'dino', name: '長頸龍', svg: longneck },
    { id: 'stego', cat: 'dino', name: '劍龍', svg: stego },
    { id: 'ptero', cat: 'dino', name: '翼龍', svg: ptero },
    { id: 'dinoegg', cat: 'dino', name: '恐龍寶寶', svg: dinoEgg },
    { id: 'anky', cat: 'dino', name: '甲龍', svg: anky },
    { id: 'fish', cat: 'sea', name: '小丑魚', svg: fish },
    { id: 'octopus', cat: 'sea', name: '章魚', svg: octopus },
    { id: 'whale', cat: 'sea', name: '大鯨魚', svg: whale },
    { id: 'turtle', cat: 'sea', name: '海龜', svg: turtle, also: ['story-race'] },
    { id: 'crab', cat: 'sea', name: '小螃蟹', svg: crab },
    { id: 'starfish', cat: 'sea', name: '海星', svg: starfish },
    { id: 'jelly', cat: 'sea', name: '水母', svg: jelly },
    { id: 'seahorse', cat: 'sea', name: '海馬', svg: seahorse },
    { id: 'shark', cat: 'sea', name: '小鯊魚', svg: shark },
    { id: 'dolphin', cat: 'sea', name: '海豚', svg: dolphin },
    // 故事主題（有些角色同時出現在別的分類，用 also 標記）
    { id: 'grandma', cat: 'story-redhood', name: '外婆', svg: grandma },
    { id: 'grandma-house', cat: 'story-redhood', name: '外婆家', svg: houseArt('grandma') },
    { id: 'basket', cat: 'story-redhood', name: '點心籃', svg: basket },
    { id: 'straw-house', cat: 'story-pigs', name: '稻草屋', svg: houseArt('straw') },
    { id: 'wood-house', cat: 'story-pigs', name: '木頭屋', svg: houseArt('wood') },
    { id: 'brick-house', cat: 'story-pigs', name: '磚頭屋', svg: houseArt('brick') },
    { id: 'trophy', cat: 'story-race', name: '獎盃', svg: trophy },
    { id: 'mouse', cat: 'animal', name: '小老鼠', svg: mouse, also: ['story-lion', 'story-carrot'] },
    { id: 'crow', cat: 'animal', name: '烏鴉', svg: crow, also: ['story-crow'] },
    { id: 'duckling', cat: 'animal', name: '小鴨子', svg: duckling, also: ['story-duck'] },
    { id: 'swan', cat: 'animal', name: '天鵝', svg: swan, also: ['story-duck'] },
    { id: 'jar', cat: 'story-crow', name: '水瓶和石頭', svg: jarArt },
    { id: 'giant-carrot', cat: 'story-carrot', name: '大蘿蔔', svg: giantCarrot },
    { id: 'hospital', cat: 'building', name: '醫院', svg: hospital },
    { id: 'police-station', cat: 'building', name: '警察局', svg: policeStation },
    { id: 'fire-station', cat: 'building', name: '消防局', svg: fireStation },
    { id: 'post-office', cat: 'building', name: '郵局', svg: postOffice },
    { id: 'school', cat: 'building', name: '學校', svg: school },
    { id: 'supermarket', cat: 'building', name: '超級市場', svg: supermarket },
    { id: 'pumpkin', cat: 'halloween', name: '南瓜燈', svg: pumpkin },
    { id: 'ghost', cat: 'halloween', name: '小幽靈', svg: ghost },
    { id: 'bat', cat: 'halloween', name: '蝙蝠', svg: bat },
    { id: 'witchhat', cat: 'halloween', name: '女巫帽', svg: witchHat },
    { id: 'monster', cat: 'halloween', name: '小怪獸', svg: monster },
    { id: 'mummy', cat: 'halloween', name: '木乃伊', svg: mummy },
    { id: 'haunted', cat: 'halloween', name: '鬼屋', svg: hauntedHouse },
  ];

  const CATEGORIES = [
    { id: 'car', name: '車車', icon: '🚗', color: '#ff6b6b', dark: '#d94848' },
    { id: 'animal', name: '動物', icon: '🐶', color: '#ffa94d', dark: '#e0812a' },
    { id: 'dino', name: '恐龍', icon: '🦖', color: '#69c24f', dark: '#4a9a35' },
    { id: 'sea', name: '海洋', icon: '🐠', color: '#4dabf7', dark: '#2b86d1' },
    { id: 'building', name: '建築', icon: '🏥', color: '#20c997', dark: '#099268' },
    { id: 'halloween', name: '萬聖節', icon: '🎃', color: '#7950f2', dark: '#5f3dc4' },
    { id: 'story-redhood', group: 'story', name: '小紅帽', icon: '👧', color: '#f03e3e', dark: '#c92a2a' },
    { id: 'story-pigs', group: 'story', name: '三隻小豬', icon: '🐷', color: '#f783ac', dark: '#d6336c' },
    { id: 'story-race', group: 'story', name: '龜兔賽跑', icon: '🐢', color: '#20c997', dark: '#0ca678' },
    { id: 'story-wolf', group: 'story', name: '狼來了', icon: '🐑', color: '#748ffc', dark: '#4c6ef5' },
    { id: 'story-carrot', group: 'story', name: '拔蘿蔔', icon: '🥕', color: '#ff922b', dark: '#e8590c' },
    { id: 'story-lion', group: 'story', name: '獅子與老鼠', icon: '🦁', color: '#fab005', dark: '#e67700' },
    { id: 'story-crow', group: 'story', name: '烏鴉喝水', icon: '🐦', color: '#868e96', dark: '#495057' },
    { id: 'story-duck', group: 'story', name: '醜小鴨', icon: '🦢', color: '#3bc9db', dark: '#1098ad' },
    { id: 'free', name: '自由畫', icon: '🖼️', color: '#b197fc', dark: '#8b6fe0' },
  ];

  // 塗色用：示範顏色全部換成白色（擋住被遮住的線），之後再把白色摳成透明
  function lineArt(inner) {
    return inner.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (m, c) =>
      c === '#222' ? m : 'fill="#fff"');
  }

  function svgDoc(inner, w, h) {
    const size = w ? ` width="${w}" height="${h}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"${size}>${outlined(inner)}</svg>`;
  }

  /* ---------------- 故事場景 ---------------- */
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
    // ---- 故事道具 ----
    house: (type, x, y, w = 220) => {
      const k = w / 220, L = 'stroke="#222" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
      const col = { straw: ['#f6d365', '#e0b23f'], wood: ['#c98a4b', '#9c6332'], brick: ['#e8664f', '#b5442f'], grandma: ['#ffe8cc', '#e8590c'] }[type];
      const deco = type === 'straw'
        ? [30, 60, 90, 130, 160, 190].map(t => `<path d="M${t} 110 L${t + 6} 230" stroke="#b8902a" stroke-width="3"/>`).join('')
        : type === 'wood'
          ? [140, 170, 200].map(t => `<path d="M12 ${t} L208 ${t}" stroke="#7a4a22" stroke-width="3"/>`).join('')
          : type === 'brick'
            ? [130, 160, 190, 220].map((t, i) => `<path d="M12 ${t} L208 ${t}" stroke="#8c2f20" stroke-width="3"/>${[40, 100, 160].map(u => `<path d="M${u + (i % 2) * 30} ${t - 30} L${u + (i % 2) * 30} ${t}" stroke="#8c2f20" stroke-width="3"/>`).join('')}`).join('')
            : '';
      return `<g class="tap" data-anim="boing" data-sound="pop"><g transform="translate(${x} ${y}) scale(${k})">
        <rect x="12" y="100" width="196" height="140" fill="${col[0]}" ${L}/>${deco}
        <path d="M-10 110 L110 20 L230 110 Z" fill="${col[1]}" ${L}/>
        <path d="M85 240 L85 175 Q85 150 110 150 Q135 150 135 175 L135 240 Z" fill="#7a4a22" ${L}/>
        <rect x="150" y="135" width="44" height="40" rx="5" fill="#fff3a0" ${L}/>
        <rect x="26" y="135" width="44" height="40" rx="5" fill="#fff3a0" ${L}/></g></g>`;
    },
    blocks: (x, y, fallen) => {
      const L = 'stroke="#222" stroke-width="5" stroke-linejoin="round"';
      const c = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc'];
      return `<g class="tap" data-anim="wiggle" data-sound="pop">${fallen
        ? c.map((k, i) => `<rect x="${x + i * 55 - 20}" y="${y + 70 + (i % 2) * 18}" width="48" height="48" rx="6" fill="${k}" ${L} transform="rotate(${i * 23 - 30} ${x + i * 55} ${y + 95})"/>`).join('')
        : c.map((k, i) => `<rect x="${x + (i % 2) * 14}" y="${y + 120 - i * 50}" width="56" height="50" rx="6" fill="${k}" ${L}/>`).join('')}</g>`;
    },
    cookies: (x, y, n = 6) => {
      const L = 'stroke="#222" stroke-width="5"';
      return `<g class="tap" data-anim="jump" data-sound="pop"><ellipse cx="${x}" cy="${y + 20}" rx="110" ry="26" fill="#fff" ${L}/>
        ${Array.from({ length: n }, (_, i) => { const cx = x - 70 + (i % 3) * 70, cy = y - Math.floor(i / 3) * 34; return `<circle cx="${cx}" cy="${cy}" r="30" fill="#e0a96d" ${L}/><circle cx="${cx - 10}" cy="${cy - 6}" r="5" fill="#6b3e1f"/><circle cx="${cx + 9}" cy="${cy + 6}" r="5" fill="#6b3e1f"/>`; }).join('')}</g>`;
    },
    flag: (x, y) => `<g class="tap" data-anim="wiggle" data-sound="twinkle"><path d="M${x} ${y} L${x} ${y - 170}" stroke="#222" stroke-width="7" stroke-linecap="round"/>
      <path d="M${x} ${y - 170} L${x + 90} ${y - 140} L${x} ${y - 110} Z" fill="#ff6b6b" stroke="#222" stroke-width="5" stroke-linejoin="round"/></g>`,
    heart: (x, y, r = 30, c = '#ff6b8b') => `<path class="float tap" data-anim="boing" data-sound="twinkle" d="M${x} ${y + r} Q${x - r * 1.6} ${y - r * .2} ${x - r * .8} ${y - r * .9} Q${x} ${y - r * 1.2} ${x} ${y - r * .4} Q${x} ${y - r * 1.2} ${x + r * .8} ${y - r * .9} Q${x + r * 1.6} ${y - r * .2} ${x} ${y + r} Z" fill="${c}" stroke="#222" stroke-width="4"/>`,
    bubble: (x, y, text, w = 220) => `<g><rect x="${x}" y="${y}" width="${w}" height="70" rx="35" fill="#fff" stroke="#222" stroke-width="4"/>
      <path d="M${x + 40} ${y + 68} L${x + 30} ${y + 100} L${x + 70} ${y + 68}" fill="#fff" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
      <rect x="${x + 34}" y="${y + 60}" width="40" height="12" fill="#fff"/>
      <text x="${x + w / 2}" y="${y + 47}" text-anchor="middle" font-size="34" font-weight="700" fill="#e8590c" font-family="Chiron GoRound TC, PingFang TC, sans-serif">${text}</text></g>`,
    carrot: (x, y, rot = 0) => `<g class="tap" data-anim="jump" data-sound="pop"><g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 12} ${y} Q${x} ${y - 6} ${x + 12} ${y} L${x} ${y + 60} Z" fill="#ff8c1a" stroke="#222" stroke-width="4" stroke-linejoin="round"/><path d="M${x} ${y - 2} Q${x - 14} ${y - 26} ${x - 4} ${y - 34} Q${x} ${y - 18} ${x + 2} ${y - 4} Q${x + 10} ${y - 28} ${x + 22} ${y - 30} Q${x + 14} ${y - 12} ${x + 4} ${y}" fill="#6cc551" stroke="#222" stroke-width="4" stroke-linejoin="round"/></g></g>`,
    zzz: (x, y) => `<text class="float" x="${x}" y="${y}" font-size="46" font-weight="900" fill="#4dabf7" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Chiron GoRound TC, sans-serif">Z z z</text>`,
    stars: () => [[120, 90], [680, 120], [400, 60], [220, 200], [600, 230]].map(([x, y], i) => `<path class="twinkle" style="animation-delay:${i * .3}s" d="M${x} ${y - 16} L${x + 5} ${y - 5} L${x + 16} ${y} L${x + 5} ${y + 5} L${x} ${y + 16} L${x - 5} ${y + 5} L${x - 16} ${y} L${x - 5} ${y - 5} Z" fill="#ffd43b" stroke="#222" stroke-width="3"/>`).join(''),
    toothbrush: (x, y, rot = -30) => `<g class="tap" data-anim="wiggle" data-sound="pop"><g transform="rotate(${rot} ${x} ${y})" stroke="#222" stroke-width="4" stroke-linejoin="round">
      <rect x="${x - 90}" y="${y - 9}" width="130" height="18" rx="9" fill="#4dabf7"/><rect x="${x + 36}" y="${y - 14}" width="54" height="16" rx="4" fill="#fff"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${x + 42 + i * 10} ${y - 14} L${x + 42 + i * 10} ${y - 30}" stroke="#74c0fc" stroke-width="5"/>`).join('')}
      <circle cx="${x + 70}" cy="${y - 36}" r="12" fill="#fff"/><circle cx="${x + 52}" cy="${y - 40}" r="9" fill="#fff"/></g></g>`,
    tooth: (x, y, happy = true, r = 60) => `<g class="tap" data-anim="${happy ? 'jump' : 'wiggle'}" data-sound="${happy ? 'twinkle' : 'boing'}" stroke="#222" stroke-width="4" stroke-linejoin="round">
      <path d="M${x - r} ${y - r * .4} Q${x - r} ${y - r * 1.1} ${x - r * .4} ${y - r * 1.05} Q${x} ${y - r * .9} ${x + r * .4} ${y - r * 1.05} Q${x + r} ${y - r * 1.1} ${x + r} ${y - r * .4} Q${x + r} ${y + r * .4} ${x + r * .6} ${y + r * 1.1} Q${x + r * .4} ${y + r * 1.3} ${x + r * .25} ${y + r * .8} Q${x} ${y + r * .45} ${x - r * .25} ${y + r * .8} Q${x - r * .4} ${y + r * 1.3} ${x - r * .6} ${y + r * 1.1} Q${x - r} ${y + r * .4} ${x - r} ${y - r * .4} Z" fill="${happy ? '#fff' : '#f1e3b0'}"/>
      ${happy ? '' : `<circle cx="${x + r * .35}" cy="${y - r * .55}" r="${r * .14}" fill="#8a5a2b" stroke="none"/><circle cx="${x - r * .45}" cy="${y + r * .2}" r="${r * .1}" fill="#8a5a2b" stroke="none"/>`}
      <circle cx="${x - r * .32}" cy="${y - r * .3}" r="${r * .11}" fill="#222"/><circle cx="${x + r * .32}" cy="${y - r * .3}" r="${r * .11}" fill="#222"/>
      <path d="${happy ? `M${x - r * .25} ${y} Q${x} ${y + r * .3} ${x + r * .25} ${y}` : `M${x - r * .25} ${y + r * .15} Q${x} ${y - r * .1} ${x + r * .25} ${y + r * .15}`}" fill="none"/>
      ${happy ? `<circle cx="${x - r * .55}" cy="${y - r * .05}" r="${r * .12}" fill="#ffb3b3" stroke="none"/><circle cx="${x + r * .55}" cy="${y - r * .05}" r="${r * .12}" fill="#ffb3b3" stroke="none"/>` : ''}</g>`,
    germ: (x, y, r = 34) => `<g class="tap float" data-anim="spin" data-sound="pop" stroke="#222" stroke-width="4">
      ${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<path d="M${x + r * Math.cos(a)} ${y + r * Math.sin(a)} L${x + (r + 14) * Math.cos(a)} ${y + (r + 14) * Math.sin(a)}"/><circle cx="${x + (r + 16) * Math.cos(a)}" cy="${y + (r + 16) * Math.sin(a)}" r="5" fill="#69db7c"/>`; }).join('')}
      <circle cx="${x}" cy="${y}" r="${r}" fill="#8ce99a"/><circle cx="${x - r * .3}" cy="${y - r * .15}" r="${r * .15}" fill="#222"/><circle cx="${x + r * .3}" cy="${y - r * .15}" r="${r * .15}" fill="#222"/>
      <path d="M${x - r * .3} ${y + r * .35} Q${x} ${y + r * .15} ${x + r * .3} ${y + r * .35}" fill="none"/></g>`,
    soap: (x, y) => `<g class="tap" data-anim="boing" data-sound="splash" stroke="#222" stroke-width="4" stroke-linejoin="round">
      <rect x="${x - 60}" y="${y - 30}" width="120" height="60" rx="26" fill="#ffc9de"/><rect x="${x - 40}" y="${y - 20}" width="50" height="10" rx="5" fill="#fff" stroke="none" opacity=".7"/>
      ${[[-50, -50, 16], [-10, -62, 22], [35, -52, 14], [60, -78, 10]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="rgba(255,255,255,.7)" stroke="#74c0fc" stroke-width="3"/>`).join('')}</g>`,
    faucet: (x, y) => `<g stroke="#222" stroke-width="4" stroke-linejoin="round"><rect x="${x - 160}" y="${y + 40}" width="320" height="70" rx="16" fill="#e7f5ff"/>
      <path d="M${x - 10} ${y + 40} L${x - 10} ${y - 40} Q${x - 10} ${y - 70} ${x + 30} ${y - 70} L${x + 60} ${y - 70} L${x + 60} ${y - 40}" fill="none" stroke="#adb5bd" stroke-width="18" stroke-linecap="round"/>
      <g class="fall"><path d="M${x + 60} ${y - 20} Q${x + 50} ${y} ${x + 60} ${y + 10} Q${x + 70} ${y} ${x + 60} ${y - 20} Z" fill="#74c0fc"/></g></g>`,
    toybox: (x, y, full = true) => `<g class="tap" data-anim="boing" data-sound="pop" stroke="#222" stroke-width="5" stroke-linejoin="round">
      ${full ? `<circle cx="${x - 40}" cy="${y - 20}" r="34" fill="#ff6b6b"/><path d="M${x - 74} ${y - 20} L${x - 6} ${y - 20}" stroke-width="4"/><rect x="${x + 10}" y="${y - 60}" width="50" height="50" rx="6" fill="#ffd43b"/><path d="M${x + 60} ${y - 30} L${x + 80} ${y - 90} L${x + 100} ${y - 30} Z" fill="#69db7c"/>` : ''}
      <rect x="${x - 110}" y="${y - 10}" width="220" height="120" rx="12" fill="#4dabf7"/><rect x="${x - 120}" y="${y - 20}" width="240" height="30" rx="10" fill="#228be6"/>
      <path fill="#ffd43b" d="M${x} ${y + 30} L${x + 9} ${y + 50} L${x + 30} ${y + 52} L${x + 14} ${y + 66} L${x + 19} ${y + 88} L${x} ${y + 76} L${x - 19} ${y + 88} L${x - 14} ${y + 66} L${x - 30} ${y + 52} L${x - 9} ${y + 50} Z"/></g>`,
    ball: (x, y, r = 34) => `<g class="tap" data-anim="jump" data-sound="boing" stroke="#222" stroke-width="4"><circle cx="${x}" cy="${y}" r="${r}" fill="#ff6b6b"/><path d="M${x - r} ${y} L${x + r} ${y}" /><path d="M${x} ${y - r} Q${x + r * .6} ${y} ${x} ${y + r}" fill="#fff"/></g>`,
    veggies: (x, y) => `<g class="tap" data-anim="jump" data-sound="pop" stroke="#222" stroke-width="4" stroke-linejoin="round">
      <ellipse cx="${x}" cy="${y + 30}" rx="130" ry="34" fill="#fff"/>
      <rect x="${x - 72}" y="${y - 10}" width="16" height="40" fill="#8ce99a"/><circle cx="${x - 78}" cy="${y - 20}" r="18" fill="#2f9e44"/><circle cx="${x - 52}" cy="${y - 22}" r="20" fill="#2f9e44"/><circle cx="${x - 64}" cy="${y - 38}" r="18" fill="#37b24d"/>
      <path d="M${x - 10} ${y + 25} L${x + 30} ${y - 40} Q${x + 40} ${y - 45} ${x + 42} ${y - 30} Z" fill="#ff8c1a"/>
      <circle cx="${x + 75}" cy="${y + 5}" r="22" fill="#ffd43b"/><circle cx="${x + 92}" cy="${y + 18}" r="16" fill="#e03131"/></g>`,
    bed: (x, y) => `<g stroke="#222" stroke-width="5" stroke-linejoin="round"><rect x="${x - 200}" y="${y - 120}" width="30" height="200" rx="10" fill="#c98a4b"/><rect x="${x + 170}" y="${y - 60}" width="30" height="140" rx="10" fill="#c98a4b"/>
      <rect x="${x - 175}" y="${y - 20}" width="350" height="70" rx="14" fill="#a5d8ff"/><ellipse cx="${x - 120}" cy="${y - 30}" rx="50" ry="26" fill="#fff"/></g>`,
    jar: (x, y, level = .2, stones = 0) => `<g stroke="#222" stroke-width="5" stroke-linejoin="round">
      <path d="M${x - 70} ${y - 120} L${x + 70} ${y - 120} L${x + 90} ${y + 100} Q${x + 90} ${y + 120} ${x + 70} ${y + 120} L${x - 70} ${y + 120} Q${x - 90} ${y + 120} ${x - 90} ${y + 100} Z" fill="#e7f5ff"/>
      <rect x="${x - 85}" y="${y + 120 - 240 * level}" width="170" height="${240 * level - 4}" fill="#74c0fc" stroke="none"/>
      ${Array.from({ length: stones }, (_, i) => `<ellipse cx="${x - 55 + (i % 4) * 36}" cy="${y + 100 - Math.floor(i / 4) * 28}" rx="18" ry="13" fill="#adb5bd"/>`).join('')}
      <path d="M${x - 70} ${y - 120} L${x + 70} ${y - 120} L${x + 90} ${y + 100} Q${x + 90} ${y + 120} ${x + 70} ${y + 120} L${x - 70} ${y + 120} Q${x - 90} ${y + 120} ${x - 90} ${y + 100} Z" fill="none"/>
      <rect x="${x - 50}" y="${y - 90}" width="14" height="150" rx="7" fill="#fff" stroke="none" opacity=".6"/></g>`,
    pebbles: (x, y) => `<g class="tap" data-anim="jump" data-sound="pop" stroke="#222" stroke-width="4">${[[0, 0], [40, 6], [20, -24], [-36, 8], [70, -10]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="20" ry="14" fill="#adb5bd"/>`).join('')}</g>`,
    net: (x, y, w = 300, h = 220) => `<g stroke="#8a5a2b" stroke-width="5" fill="none" stroke-linecap="round">
      ${Array.from({ length: 7 }, (_, i) => `<path d="M${x + i * w / 6} ${y} Q${x + i * w / 6 + 15} ${y + h / 2} ${x + i * w / 6} ${y + h}"/>`).join('')}
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${x} ${y + i * h / 4} Q${x + w / 2} ${y + i * h / 4 + 20} ${x + w} ${y + i * h / 4}"/>`).join('')}</g>`,
    pond: () => `<rect width="800" height="500" fill="#c5f6fa"/><rect y="330" width="800" height="170" fill="#66d9e8"/>
      <path d="M0 340 Q100 320 200 340 T400 340 T600 340 T800 340" fill="none" stroke="#fff" stroke-width="6"/>
      ${[[90, 420], [700, 450]].map(([x, y]) => `<ellipse class="tap" data-anim="wiggle" data-sound="splash" cx="${x}" cy="${y}" rx="55" ry="18" fill="#51cf66" stroke="#222" stroke-width="4"/>`).join('')}`,
    mountains: (c1 = '#8ce99a', c2 = '#69db7c') => `<path d="M-20 400 L170 170 L320 330 L470 140 L660 360 L820 220 L820 500 L-20 500 Z" fill="${c1}" stroke="#222" stroke-width="5" stroke-linejoin="round"/>
      <path d="M-20 440 L200 300 L420 420 L620 320 L820 420 L820 500 L-20 500 Z" fill="${c2}" stroke="#222" stroke-width="5" stroke-linejoin="round"/>`,
    river: () => `<path d="M330 500 Q380 430 360 380 Q340 340 420 300 L470 300 Q400 350 430 390 Q460 440 430 500 Z" fill="#74c0fc" stroke="#222" stroke-width="5" stroke-linejoin="round"/>`,
    sunset: () => `<rect width="800" height="500" fill="#ffd8a8"/><circle class="tap" data-anim="boing" data-sound="twinkle" cx="400" cy="250" r="70" fill="#ff8787" stroke="#222" stroke-width="5"/>`,
    birds: (n = 3) => [[150, 110], [230, 80], [620, 130], [540, 90]].slice(0, n).map(([x, y], i) => `<path class="float tap" data-anim="jump" data-sound="twinkle" style="animation-delay:${i * .5}s" d="M${x - 24} ${y} Q${x - 12} ${y - 16} ${x} ${y} Q${x + 12} ${y - 16} ${x + 24} ${y}" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>`).join(''),
    flowers: (y = 440) => [90, 200, 600, 720].map((x, i) => `<g class="tap" data-anim="wiggle" data-sound="pop"><path d="M${x} ${y + 50} L${x} ${y}" stroke="#2f9e44" stroke-width="6"/>${[0, 1, 2, 3, 4].map(k => { const a = k * Math.PI * 2 / 5; return `<circle cx="${x + 16 * Math.cos(a)}" cy="${y + 16 * Math.sin(a)}" r="12" fill="${['#ff8fab', '#ffd43b', '#b197fc', '#ff922b'][i]}" stroke="#222" stroke-width="3"/>`; }).join('')}<circle cx="${x}" cy="${y}" r="9" fill="#fff3bf" stroke="#222" stroke-width="3"/></g>`).join(''),
    rice: () => `<rect y="360" width="800" height="140" fill="#d8f5a2"/>${Array.from({ length: 12 }, (_, i) => { const x = 40 + i * 66; return `<g class="tap" data-anim="wiggle" data-sound="pop"><path d="M${x} 470 L${x} 380 M${x} 400 Q${x - 26} 380 ${x - 30} 350 M${x} 400 Q${x + 26} 380 ${x + 30} 350" fill="none" stroke="#5c940d" stroke-width="5" stroke-linecap="round"/><ellipse cx="${x}" cy="370" rx="8" ry="16" fill="#ffd43b" stroke="#222" stroke-width="3"/></g>`; }).join('')}`,
    snow: () => `<rect width="800" height="500" fill="#d0ebff"/>${Array.from({ length: 40 }, (_, i) => `<circle class="fall" style="animation-delay:${(i * .13) % 1.2}s" cx="${(i * 97) % 800}" cy="${(i * 53) % 460}" r="${3 + (i % 3) * 2}" fill="#fff"/>`).join('')}`,
    boat: (x, y) => `<g class="tap" data-anim="wiggle" data-sound="splash" stroke="#222" stroke-width="5" stroke-linejoin="round"><path d="M${x - 110} ${y} L${x + 110} ${y} L${x + 80} ${y + 40} L${x - 80} ${y + 40} Z" fill="#c98a4b"/>
      <circle cx="${x - 20}" cy="${y - 50}" r="18" fill="#ffd8b8"/><path d="M${x - 50} ${y - 60} L${x - 20} ${y - 90} L${x + 10} ${y - 60} Z" fill="#e9ecef"/><path d="M${x - 40} ${y} L${x - 30} ${y - 32} L${x - 10} ${y - 32} L${x} ${y} Z" fill="#748ffc"/>
      <path d="M${x} ${y - 40} L${x + 120} ${y - 120} M${x + 120} ${y - 120} L${x + 120} ${y + 30}" fill="none" stroke-width="3"/></g>`,
    cake: (x, y) => `<g class="tap" data-anim="boing" data-sound="yay" stroke="#222" stroke-width="5" stroke-linejoin="round">
      <rect x="${x - 120}" y="${y - 30}" width="240" height="110" rx="14" fill="#ffc9de"/><rect x="${x - 90}" y="${y - 100}" width="180" height="76" rx="12" fill="#fff0f6"/>
      <path d="M${x - 120} ${y - 5} Q${x - 90} ${y + 20} ${x - 60} ${y - 5} Q${x - 30} ${y + 20} ${x} ${y - 5} Q${x + 30} ${y + 20} ${x + 60} ${y - 5} Q${x + 90} ${y + 20} ${x + 120} ${y - 5}" fill="none" stroke="#f06595"/>
      ${[-50, 0, 50].map(dx => `<rect x="${x + dx - 7}" y="${y - 150}" width="14" height="50" rx="4" fill="#74c0fc"/><path class="twinkle" d="M${x + dx} ${y - 182} Q${x + dx + 12} ${y - 165} ${x + dx} ${y - 152} Q${x + dx - 12} ${y - 165} ${x + dx} ${y - 182} Z" fill="#ffd43b"/>`).join('')}
      <ellipse cx="${x}" cy="${y + 84}" rx="150" ry="16" fill="#e9ecef"/></g>`,
    window: () => `<rect width="800" height="500" fill="#3b3f73"/><rect x="250" y="60" width="300" height="260" rx="10" fill="#2b2d6e" stroke="#8a5a2b" stroke-width="16"/>
      <circle class="tap" data-anim="boing" data-sound="twinkle" cx="430" cy="160" r="48" fill="#fff3b0" stroke="#222" stroke-width="5"/><path d="M400 60 L400 320 M250 190 L550 190" stroke="#8a5a2b" stroke-width="10"/>
      <rect y="360" width="800" height="140" fill="#5f3dc4"/><path d="M80 470 L80 380 L720 380 L720 470" fill="#e5dbff" stroke="#222" stroke-width="5"/>
      <path d="M300 380 Q400 330 500 380" fill="#fff" stroke="#222" stroke-width="5"/>`,
    forest: () => `<rect width="800" height="500" fill="#d3f9d8"/><rect y="380" width="800" height="120" fill="#8ce99a"/>`,
    bubbles: () => [[100, 300], [700, 250], [400, 120], [600, 380]].map(([x, y], i) =>
      `<circle class="float tap" data-anim="boing" data-sound="pop" style="animation-delay:${i * .7}s" cx="${x}" cy="${y}" r="${10 + i * 3}" fill="rgba(255,255,255,.6)" stroke="#fff" stroke-width="3"/>`).join(''),
  };

  // 把一張上色線稿放進場景裡，可以點
  function put(id, x, y, w, anim = 'jump', sound = 'boing') {
    const d = DRAWINGS.find(d => d.id === id);
    const h = w * 0.75;
    return `<g class="tap" data-anim="${anim}" data-sound="${sound}"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 800 600" overflow="visible">${outlined(d.svg)}</svg></g>`;
  }

  window.ART = { DRAWINGS, CATEGORIES, lineArt, svgDoc, scene, put };
})();
