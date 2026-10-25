/* 線稿包：動物 */
(function () {
  const { eye, ground, scallop } = window.ART.helpers;
  const r1 = n => n.toFixed(1);

  // 橢圓上方 / 下方在 x 處的 y（讓條紋、斑點剛好貼著外框）
  const ellY = (cx, cy, rx, ry, x, top) => cy + (top ? -1 : 1) * ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  // 從橢圓上緣（或下緣）長出來的楔形條紋
  function ellStripe(cx, cy, rx, ry, x, w, len, lean, top, fill) {
    const xa = x - w / 2, xb = x + w / 2;
    const ya = ellY(cx, cy, rx, ry, xa, top), yb = ellY(cx, cy, rx, ry, xb, top);
    const ty = (ya + yb) / 2 + (top ? len : -len);
    return top
      ? `<path fill="${fill}" d="M${r1(xa)} ${r1(ya)} A${rx} ${ry} 0 0 1 ${r1(xb)} ${r1(yb)} L${r1(x + lean)} ${r1(ty)} Z"/>`
      : `<path fill="${fill}" d="M${r1(xb)} ${r1(yb)} A${rx} ${ry} 0 0 1 ${r1(xa)} ${r1(ya)} L${r1(x + lean)} ${r1(ty)} Z"/>`;
  }

  /* ---------- 熊貓 ---------- */
  const panda = `
    <ellipse cx="400" cy="450" rx="145" ry="108" fill="#f1f3f5"/>
    <ellipse cx="292" cy="440" rx="42" ry="72" fill="#495057" transform="rotate(20 292 440)"/>
    <ellipse cx="508" cy="440" rx="42" ry="72" fill="#495057" transform="rotate(-20 508 440)"/>
    <circle cx="298" cy="162" r="46" fill="#495057"/><circle cx="502" cy="162" r="46" fill="#495057"/>
    <circle cx="400" cy="260" r="122" fill="#f1f3f5"/>
    <ellipse cx="352" cy="250" rx="34" ry="44" fill="#495057" transform="rotate(30 352 250)"/>
    <ellipse cx="448" cy="250" rx="34" ry="44" fill="#495057" transform="rotate(-30 448 250)"/>
    <circle cx="356" cy="246" r="16" fill="#f1f3f5"/><circle cx="444" cy="246" r="16" fill="#f1f3f5"/>
    ${eye(357, 246, 10)} ${eye(445, 246, 10)}
    <ellipse cx="400" cy="300" rx="20" ry="13" fill="#222"/>
    <path d="M400 312 L400 322 Q386 338 370 326 M400 322 Q414 338 430 326"/>
    <circle cx="318" cy="310" r="17" fill="#ffc2c2"/><circle cx="482" cy="310" r="17" fill="#ffc2c2"/>
    <path fill="#8fd14f" d="M545 470 Q540 400 590 360 L605 372 Q565 410 568 470 Z"/>
    <path fill="#8fd14f" d="M590 360 Q620 330 650 340 Q625 365 597 367 Z"/>
    <path fill="#8fd14f" d="M578 395 Q560 360 530 360 Q545 390 572 400 Z"/>
    <ellipse cx="335" cy="545" rx="47" ry="25" fill="#495057"/>
    <ellipse cx="465" cy="545" rx="47" ry="25" fill="#495057"/>`;

  /* ---------- 猴子 ---------- */
  const monkey = `
    <path fill="#b0703c" d="M520 500 Q650 520 655 410 Q660 330 600 325 Q550 325 555 375 Q560 405 590 400 Q615 395 608 372 L590 375 Q580 350 605 352 Q630 360 628 405 Q620 485 525 465 Z"/>
    <ellipse cx="400" cy="450" rx="135" ry="105" fill="#b0703c"/>
    <ellipse cx="400" cy="465" rx="80" ry="68" fill="#f5d0a9"/>
    <circle cx="275" cy="250" r="45" fill="#b0703c"/><circle cx="525" cy="250" r="45" fill="#b0703c"/>
    <circle cx="275" cy="250" r="25" fill="#f5d0a9"/><circle cx="525" cy="250" r="25" fill="#f5d0a9"/>
    <circle cx="400" cy="250" r="118" fill="#b0703c"/>
    <path fill="#f5d0a9" d="M400 215 Q440 168 478 200 Q512 240 478 292 Q505 345 400 358 Q295 345 322 292 Q288 240 322 200 Q360 168 400 215 Z"/>
    ${eye(362, 250, 14)} ${eye(438, 250, 14)}
    <circle cx="390" cy="295" r="5" fill="#222"/><circle cx="410" cy="295" r="5" fill="#222"/>
    <path d="M358 315 Q400 345 442 315"/>
    <circle cx="330" cy="300" r="13" fill="#ffb3b3"/><circle cx="470" cy="300" r="13" fill="#ffb3b3"/>
    <path fill="#ffe14d" d="M250 430 Q245 365 290 330 Q300 345 290 360 Q275 400 285 440 Z"/>
    <ellipse cx="300" cy="440" rx="30" ry="24" fill="#b0703c"/>
    <ellipse cx="335" cy="545" rx="45" ry="24" fill="#b0703c"/>
    <ellipse cx="465" cy="545" rx="45" ry="24" fill="#b0703c"/>`;

  /* ---------- 側面四腳動物共用：腿 ---------- */
  const legs = (xs, y, h, w, fill, hoof) => xs.map(x =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}"/>` +
    (hoof ? `<rect x="${x}" y="${y + h - 26}" width="${w}" height="30" rx="9" fill="${hoof}"/>` : '')).join('');

  /* ---------- 斑馬 ---------- */
  const zebraNeck = (() => {
    const A = t => [500 + 60 * t, 310 - 140 * t], B = t => [585 + 45 * t, 335 - 145 * t];
    return [0.2, 0.45, 0.7].map(t => {
      const a1 = A(t), a2 = A(t + 0.09), b1 = B(t - 0.04), b2 = B(t + 0.02);
      return `<path fill="#495057" d="M${r1(a1[0])} ${r1(a1[1])} L${r1(a2[0])} ${r1(a2[1])} L${r1(b2[0])} ${r1(b2[1])} L${r1(b1[0])} ${r1(b1[1])} Z"/>`;
    }).join('');
  })();
  const zebra = `
    <path fill="#f1f3f5" d="M232 318 Q190 345 188 400 L202 400 Q206 355 240 334 Z"/>
    <ellipse cx="195" cy="415" rx="16" ry="24" fill="#495057"/>
    ${legs([268, 330, 450, 512], 380, 145, 42, '#f1f3f5', '#495057')}
    ${[268, 330, 450, 512].map(x => [415, 450].map(y => `<rect x="${x}" y="${y}" width="42" height="13" fill="#495057"/>`).join('')).join('')}
    <ellipse cx="400" cy="340" rx="175" ry="80" fill="#f1f3f5"/>
    ${[275, 335, 395, 455].map(x => ellStripe(400, 340, 175, 80, x, 24, 62, 6, true, '#495057')).join('')}
    ${[305, 365, 425, 485].map(x => ellStripe(400, 340, 175, 80, x, 22, 48, -4, false, '#495057')).join('')}
    <path fill="#495057" d="M492 296 L476 282 L502 262 L486 242 L515 225 L500 204 L530 190 L520 166 L548 160 L545 140 L580 150 L600 180 L560 175 L505 305 Z"/>
    <path fill="#f1f3f5" d="M500 310 L560 170 L630 190 L585 335 Z"/>
    ${zebraNeck}
    <path fill="#f1f3f5" d="M592 165 L575 105 L622 146 Z"/>
    <path fill="#f1f3f5" d="M618 160 L632 100 L652 152 Z"/>
    <ellipse cx="650" cy="215" rx="82" ry="47" fill="#f1f3f5" transform="rotate(40 650 215)"/>
    <ellipse cx="700" cy="256" rx="40" ry="33" fill="#495057" transform="rotate(40 700 256)"/>
    <path fill="#495057" d="M595 150 Q610 125 625 150 Q612 160 595 150 Z"/>
    ${eye(638, 200, 12)}
    <circle cx="712" cy="258" r="6" fill="#222"/>
    <path d="M675 285 Q690 292 702 285"/>
    ${ground(528)}`;

  /* ---------- 小馬 ---------- */
  const pony = `
    <path fill="#ff8fc7" d="M236 312 Q170 320 165 390 Q160 440 195 460 Q185 420 205 395 Q195 430 225 445 Q215 400 245 340 Z"/>
    ${legs([275, 335, 450, 510], 380, 140, 44, '#ffcf8f', '#9c6b3c')}
    <ellipse cx="400" cy="340" rx="170" ry="85" fill="#ffcf8f"/>
    <path fill="#ffcf8f" d="M495 315 L548 175 L628 190 L585 340 Z"/>
    <path fill="#ff8fc7" d="M500 310 Q470 290 490 265 Q465 240 495 220 Q480 190 515 178 Q510 145 550 145 Q575 120 610 140 L560 190 Z"/>
    <path fill="#ffcf8f" d="M600 158 L590 100 L635 145 Z"/>
    <ellipse cx="648" cy="205" rx="76" ry="52" fill="#ffcf8f" transform="rotate(35 648 205)"/>
    <ellipse cx="695" cy="245" rx="44" ry="36" fill="#ffe7c4" transform="rotate(35 695 245)"/>
    <path fill="#ff8fc7" d="M600 145 Q640 120 665 150 Q635 150 620 175 Q605 165 600 145 Z"/>
    ${eye(640, 200, 14)}
    <circle cx="712" cy="245" r="6" fill="#222"/>
    <path d="M675 270 Q690 280 705 272"/>
    <circle cx="660" cy="232" r="12" fill="#ffb3c6"/>
    ${ground(522)}`;

  /* ---------- 乳牛 ---------- */
  const cowBody = [400, 345, 175, 85];
  const cow = `
    <path fill="#f1f3f5" d="M232 320 Q195 350 195 410 L208 410 Q212 362 242 338 Z"/>
    <ellipse cx="201" cy="425" rx="15" ry="22" fill="#495057"/>
    ${legs([270, 330, 450, 510], 385, 140, 44, '#f1f3f5', '#495057')}
    <path fill="#ffb3c6" d="M330 410 Q330 455 365 455 Q400 455 400 410 Z"/>
    <ellipse cx="${cowBody[0]}" cy="${cowBody[1]}" rx="${cowBody[2]}" ry="${cowBody[3]}" fill="#f1f3f5"/>
    <ellipse cx="320" cy="320" rx="50" ry="35" fill="#495057"/>
    <ellipse cx="455" cy="360" rx="42" ry="32" fill="#495057"/>
    <circle cx="400" cy="300" r="20" fill="#495057"/>
    <path fill="#ffe14d" d="M535 165 Q520 120 550 110 Q545 140 560 160 Z"/>
    <path fill="#ffe14d" d="M665 165 Q680 120 650 110 Q655 140 640 160 Z"/>
    <ellipse cx="520" cy="195" rx="42" ry="20" fill="#f1f3f5" transform="rotate(20 520 195)"/>
    <ellipse cx="680" cy="195" rx="42" ry="20" fill="#f1f3f5" transform="rotate(-20 680 195)"/>
    <ellipse cx="600" cy="230" rx="80" ry="80" fill="#f1f3f5"/>
    <path fill="#495057" d="M555 165 Q580 150 610 160 Q600 195 565 200 Q548 185 555 165 Z"/>
    <ellipse cx="600" cy="290" rx="68" ry="42" fill="#ffb3c6"/>
    <ellipse cx="578" cy="288" rx="8" ry="11" fill="#222"/><ellipse cx="622" cy="288" rx="8" ry="11" fill="#222"/>
    ${eye(570, 228, 13)} ${eye(630, 228, 13)}
    <path d="M580 312 Q600 322 620 312"/>
    <path fill="#ffd23f" d="M560 340 L640 340 L630 365 L570 365 Z"/>
    <path fill="#ffd23f" d="M585 365 Q585 395 600 395 Q615 395 615 365 Z"/>
    ${ground(528)}`;

  /* ---------- 河馬 ---------- */
  const hippo = `
    <ellipse cx="400" cy="450" rx="170" ry="108" fill="#b8a9d9"/>
    <ellipse cx="400" cy="470" rx="95" ry="68" fill="#d9cff0"/>
    <ellipse cx="300" cy="150" rx="26" ry="20" fill="#b8a9d9"/><ellipse cx="500" cy="150" rx="26" ry="20" fill="#b8a9d9"/>
    <ellipse cx="400" cy="230" rx="125" ry="88" fill="#b8a9d9"/>
    <circle cx="345" cy="175" r="36" fill="#b8a9d9"/><circle cx="455" cy="175" r="36" fill="#b8a9d9"/>
    ${eye(345, 175, 15)} ${eye(455, 175, 15)}
    <ellipse cx="400" cy="320" rx="165" ry="92" fill="#b8a9d9"/>
    <ellipse cx="345" cy="285" rx="14" ry="10" fill="#222"/><ellipse cx="455" cy="285" rx="14" ry="10" fill="#222"/>
    <path d="M290 330 Q400 390 510 330"/>
    <rect x="345" y="347" width="22" height="24" rx="5" fill="#f8f9fa"/>
    <rect x="433" y="347" width="22" height="24" rx="5" fill="#f8f9fa"/>
    <circle cx="275" cy="320" r="20" fill="#ffb3c6"/><circle cx="525" cy="320" r="20" fill="#ffb3c6"/>
    <ellipse cx="320" cy="545" rx="50" ry="25" fill="#b8a9d9"/>
    <ellipse cx="480" cy="545" rx="50" ry="25" fill="#b8a9d9"/>`;

  /* ---------- 無尾熊 ---------- */
  const koala = `
    <rect x="130" y="40" width="70" height="520" rx="20" fill="#c08a5a"/>
    <path d="M150 120 Q165 140 150 160 M178 300 Q165 320 180 340 M150 450 Q165 470 150 490"/>
    <ellipse cx="410" cy="450" rx="140" ry="105" fill="#a9b4bf"/>
    <ellipse cx="410" cy="470" rx="75" ry="62" fill="#e9ecef"/>
    <path fill="${'#a9b4bf'}" d="${scallop(290, 190, 55, 9, 8)}"/>
    <path fill="#a9b4bf" d="${scallop(530, 190, 55, 9, 8)}"/>
    <circle cx="290" cy="190" r="32" fill="#ffd6e0"/><circle cx="530" cy="190" r="32" fill="#ffd6e0"/>
    <ellipse cx="410" cy="265" rx="130" ry="115" fill="#a9b4bf"/>
    ${eye(355, 245, 13)} ${eye(465, 245, 13)}
    <ellipse cx="410" cy="285" rx="30" ry="40" fill="#495057"/>
    <path d="M385 335 Q410 352 435 335"/>
    <circle cx="335" cy="300" r="17" fill="#ffc2c2"/><circle cx="485" cy="300" r="17" fill="#ffc2c2"/>
    <ellipse cx="225" cy="420" rx="60" ry="30" fill="#a9b4bf" transform="rotate(-15 225 420)"/>
    <ellipse cx="350" cy="545" rx="45" ry="24" fill="#a9b4bf"/>
    <ellipse cx="475" cy="545" rx="45" ry="24" fill="#a9b4bf"/>`;

  /* ---------- 袋鼠 ---------- */
  const kangaroo = `
    <path fill="#d9925a" d="M345 430 Q250 505 110 520 Q95 535 115 545 Q270 545 385 480 Z"/>
    <ellipse cx="440" cy="535" rx="95" ry="20" fill="#d9925a"/>
    <ellipse cx="440" cy="340" rx="92" ry="140" fill="#d9925a" transform="rotate(12 440 340)"/>
    <ellipse cx="395" cy="445" rx="70" ry="85" fill="#d9925a"/>
    <circle cx="482" cy="375" r="28" fill="#f2c08f"/>
    <path fill="#f2c08f" d="M462 357 L456 330 L477 350 Z"/>
    ${eye(488, 370, 7)}
    <circle cx="507" cy="378" r="4" fill="#222"/>
    <path fill="#f2c08f" d="M445 385 Q490 400 525 382 Q530 440 490 455 Q450 455 445 385 Z"/>
    <path fill="#d9925a" d="M520 290 Q560 300 560 330 Q545 340 530 320 Q515 315 505 300 Z"/>
    <path fill="#d9925a" d="M480 140 L462 60 Q462 45 478 50 L505 130 Z"/>
    <path fill="#d9925a" d="M505 135 L510 55 Q515 42 528 52 L530 140 Z"/>
    <path fill="#f2c08f" d="M478 125 L468 70 L490 120 Z"/>
    <ellipse cx="535" cy="185" rx="92" ry="60" fill="#d9925a" transform="rotate(18 535 185)"/>
    ${eye(530, 168, 14)}
    <ellipse cx="615" cy="218" rx="13" ry="10" fill="#222"/>
    <path d="M575 240 Q592 248 607 237"/>
    <circle cx="540" cy="210" r="13" fill="#ffb3b3"/>
    ${ground(555)}`;

  /* ---------- 狐狸 ---------- */
  const fox = `
    <path fill="#ff8a3d" d="M500 500 Q690 520 690 380 Q690 290 640 270 Q600 330 580 400 Q560 460 500 460 Z"/>
    <path fill="#f8f9fa" d="M640 270 Q690 290 690 380 Q660 360 645 330 Q625 320 620 300 Q630 280 640 270 Z"/>
    <ellipse cx="400" cy="445" rx="135" ry="105" fill="#ff8a3d"/>
    <path fill="#f8f9fa" d="M340 360 Q400 340 460 360 Q480 450 400 520 Q320 450 340 360 Z"/>
    <path fill="#ff8a3d" d="M290 210 L300 85 L385 160 Z"/>
    <path fill="#ff8a3d" d="M510 210 L500 85 L415 160 Z"/>
    <path fill="#5c3d2e" d="M308 175 L312 115 L355 155 Z"/>
    <path fill="#5c3d2e" d="M492 175 L488 115 L445 155 Z"/>
    <path fill="#ff8a3d" d="M268 240 Q275 140 400 138 Q525 140 532 240 L400 372 Z"/>
    <path fill="#f8f9fa" d="M304 276 Q360 266 400 305 Q440 266 496 276 L400 372 Z"/>
    ${eye(355, 245, 14)} ${eye(445, 245, 14)}
    <ellipse cx="400" cy="352" rx="17" ry="12" fill="#222"/>
    <path d="M400 330 Q392 320 380 325 M400 330 Q408 320 420 325"/>
    <circle cx="315" cy="268" r="14" fill="#ffc2c2"/><circle cx="485" cy="268" r="14" fill="#ffc2c2"/>
    <ellipse cx="335" cy="540" rx="45" ry="24" fill="#5c3d2e"/>
    <ellipse cx="465" cy="540" rx="45" ry="24" fill="#5c3d2e"/>`;

  /* ---------- 松鼠 ---------- */
  const squirrel = `
    <path fill="#c46a2e" d="M370 520 Q180 530 165 380 Q155 250 240 170 Q300 120 350 150 Q390 180 360 215 Q330 200 300 225 Q260 270 270 350 Q285 440 370 450 Z"/>
    <path d="M200 300 Q215 290 225 300 M215 400 Q230 390 240 400 M265 200 Q280 190 290 205"/>
    <ellipse cx="430" cy="430" rx="95" ry="110" fill="#d9844a"/>
    <ellipse cx="455" cy="445" rx="55" ry="75" fill="#f7d9b5"/>
    <path fill="#d9844a" d="M420 205 L410 140 L455 185 Z"/>
    <path fill="#f7d9b5" d="M424 192 L419 158 L442 183 Z"/>
    <ellipse cx="465" cy="265" rx="88" ry="78" fill="#d9844a"/>
    <ellipse cx="510" cy="290" rx="45" ry="35" fill="#f7d9b5"/>
    ${eye(480, 255, 14)}
    <circle cx="548" cy="282" r="9" fill="#222"/>
    <path d="M525 305 Q538 315 550 305"/>
    <circle cx="455" cy="300" r="14" fill="#ffb3b3"/>
    <ellipse cx="520" cy="410" rx="30" ry="34" fill="#a0602e"/>
    <path fill="#7a4a24" d="M488 398 Q520 365 552 398 Z"/>
    <path d="M520 382 L522 368" stroke-width="5"/>
    <ellipse cx="490" cy="400" rx="22" ry="16" fill="#d9844a"/>
    <ellipse cx="400" cy="540" rx="50" ry="20" fill="#d9844a"/>
    <ellipse cx="495" cy="540" rx="45" ry="20" fill="#d9844a"/>`;

  /* ---------- 貓頭鷹 ---------- */
  const owl = `
    <rect x="80" y="505" width="640" height="34" rx="17" fill="#a0703c"/>
    <path fill="#a0603a" d="M265 175 L275 95 L345 150 Z"/>
    <path fill="#a0603a" d="M535 175 L525 95 L455 150 Z"/>
    <ellipse cx="400" cy="330" rx="160" ry="195" fill="#a0603a"/>
    <ellipse cx="400" cy="395" rx="100" ry="115" fill="#f2d1a8"/>
    <path d="M350 360 Q365 375 380 360 M420 360 Q435 375 450 360 M385 400 Q400 415 415 400 M350 440 Q365 455 380 440 M420 440 Q435 455 450 440"/>
    <path fill="#8a4f2e" d="M248 290 Q215 380 250 460 Q290 440 300 360 Z"/>
    <path fill="#8a4f2e" d="M552 290 Q585 380 550 460 Q510 440 500 360 Z"/>
    <circle cx="338" cy="250" r="65" fill="#f2d1a8"/><circle cx="462" cy="250" r="65" fill="#f2d1a8"/>
    <circle cx="338" cy="250" r="38" fill="#ffe14d"/><circle cx="462" cy="250" r="38" fill="#ffe14d"/>
    ${eye(338, 250, 22)} ${eye(462, 250, 22)}
    <path fill="#ff9d1f" d="M382 290 L418 290 L400 330 Z"/>
    <path fill="#ff9d1f" d="M335 500 L345 525 L355 500 L365 525 L375 500 Q355 488 335 500 Z"/>
    <path fill="#ff9d1f" d="M425 500 L435 525 L445 500 L455 525 L465 500 Q445 488 425 500 Z"/>`;

  /* ---------- 青蛙 ---------- */
  // 頭（橢圓）+ 兩個眼睛凸起，合成一個外框，裡面不會多出線
  const frogHead = (() => {
    const cx = 400, cy = 300, rx = 200, ry = 105, r = 62;
    const P = x => [x, ellY(cx, cy, rx, ry, x, true)];
    const bump = (xa, xb) => {
      const a = P(xa), b = P(xb), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy), h = Math.sqrt(r * r - d * d / 4);
      return { a, b, c: [mx + dy / d * h, my - dx / d * h] };
    };
    const L = bump(245, 352), R = bump(448, 555);
    const pt = q => `${r1(q[0])} ${r1(q[1])}`;
    const d = `M200 300 A${rx} ${ry} 0 0 1 ${pt(L.a)} A${r} ${r} 0 1 1 ${pt(L.b)} A${rx} ${ry} 0 0 1 ${pt(R.a)} A${r} ${r} 0 1 1 ${pt(R.b)} A${rx} ${ry} 0 0 1 600 300 A${rx} ${ry} 0 0 1 200 300 Z`;
    return { d, L: L.c, R: R.c };
  })();
  const frog = `
    <ellipse cx="240" cy="470" rx="80" ry="60" fill="#5cc45a"/>
    <ellipse cx="560" cy="470" rx="80" ry="60" fill="#5cc45a"/>
    <path fill="#5cc45a" d="M160 520 Q150 545 175 548 Q190 555 205 545 Q222 555 235 540 Q250 535 245 520 Z"/>
    <path fill="#5cc45a" d="M640 520 Q650 545 625 548 Q610 555 595 545 Q578 555 565 540 Q550 535 555 520 Z"/>
    <ellipse cx="400" cy="430" rx="160" ry="115" fill="#5cc45a"/>
    <ellipse cx="400" cy="460" rx="95" ry="75" fill="#d6f5b0"/>
    <path fill="#5cc45a" d="${frogHead.d}"/>
    <circle cx="${r1(frogHead.L[0])}" cy="${r1(frogHead.L[1])}" r="40" fill="#f8f9fa"/>
    <circle cx="${r1(frogHead.R[0])}" cy="${r1(frogHead.R[1])}" r="40" fill="#f8f9fa"/>
    ${eye(Math.round(frogHead.L[0]), Math.round(frogHead.L[1]) + 5, 18)} ${eye(Math.round(frogHead.R[0]), Math.round(frogHead.R[1]) + 5, 18)}
    <path d="M270 310 Q400 400 530 310"/>
    <circle cx="385" cy="285" r="5" fill="#222"/><circle cx="415" cy="285" r="5" fill="#222"/>
    <circle cx="245" cy="315" r="22" fill="#ffb3b3"/><circle cx="555" cy="315" r="22" fill="#ffb3b3"/>
    <path fill="#5cc45a" d="M320 540 Q305 555 325 558 Q340 565 350 552 Q365 560 372 545 L365 525 L330 522 Z"/>
    <path fill="#5cc45a" d="M480 540 Q495 555 475 558 Q460 565 450 552 Q435 560 428 545 L435 525 L470 522 Z"/>`;

  /* ---------- 鱷魚 ---------- */
  const croc = (() => {
    const bez = (p0, p1, p2, t) => [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
    const tail = [[40, 400], [180, 360], [290, 310]], back = [[290, 310], [420, 255], [575, 291]];
    const scute = (curve, t, s) => {
      const [x, y] = bez(...curve, t);
      return `<path fill="#3f9e4a" d="M${r1(x - s)} ${r1(y + s * .8)} L${r1(x)} ${r1(y - s * 1.1)} L${r1(x + s)} ${r1(y + s * .8)} Z"/>`;
    };
    const my = x => 358 + (x - 600) * (343 - 358) / 152;
    return `
    ${[0.45, 0.75].map(t => scute(tail, t, 22)).join('')}
    ${[0.1, 0.3, 0.5, 0.7].map(t => scute(back, t, 30)).join('')}
    <rect x="335" y="400" width="44" height="75" rx="18" fill="#3f9e4a"/>
    <rect x="515" y="390" width="44" height="80" rx="18" fill="#3f9e4a"/>
    <path fill="#55b85a" d="M40 400 Q180 360 290 310 Q420 255 575 291 A36 36 0 1 1 640 303 L730 320 Q770 340 740 370 L590 385 Q500 440 320 435 Q180 430 40 400 Z"/>
    <path fill="#b8e07a" d="M300 433 Q420 410 520 418 Q480 438 320 435 Z"/>
    ${eye(612, 283, 14)}
    <circle cx="738" cy="332" r="5" fill="#222"/>
    <path d="M752 343 L600 358"/>
    ${[625, 660, 695].map(x => `<path fill="#f8f9fa" d="M${x} ${r1(my(x))} L${x + 10} ${r1(my(x + 10) + 14)} L${x + 20} ${r1(my(x + 20))} Z"/>`).join('')}
    <circle cx="590" cy="332" r="13" fill="#ffb3b3"/>
    <rect x="280" y="405" width="46" height="80" rx="18" fill="#55b85a"/>
    <rect x="460" y="400" width="46" height="85" rx="18" fill="#55b85a"/>
    ${ground(487)}`;
  })();

  /* ---------- 刺蝟 ---------- */
  const spikes = (() => {
    const cx = 370, cy = 410;
    let d = '';
    const n = 18, a0 = Math.PI * 0.95, a1 = Math.PI * 1.85;
    for (let i = 0; i <= n * 2; i++) {
      const a = a0 + (a1 - a0) * i / (n * 2), r = i % 2 ? 225 : 180;
      d += (i ? ' L' : 'M') + r1(cx + r * Math.cos(a)) + ' ' + r1(cy + r * Math.sin(a));
    }
    const ex = cx + 180 * Math.cos(a1), ey = cy + 180 * Math.sin(a1);
    return d + ` Q${r1(ex - 10)} ${r1(ey + 90)} 450 485 L190 485 Z`;
  })();
  const hedgehog = `
    <ellipse cx="300" cy="515" rx="40" ry="20" fill="#c99a6b"/>
    <ellipse cx="470" cy="515" rx="40" ry="20" fill="#c99a6b"/>
    <path fill="#f5deb8" d="M200 450 Q200 320 400 300 Q560 290 640 430 Q660 470 620 485 Q450 510 260 495 Q200 490 200 450 Z"/>
    <path fill="#8a5a3c" d="${spikes}"/>
    <circle cx="340" cy="210" r="34" fill="#ff5a5a"/>
    <path fill="#55b85a" d="M342 178 Q360 150 385 160 Q365 180 342 178 Z"/>
    <path d="M340 178 L336 165" stroke-width="5"/>
    <ellipse cx="520" cy="345" rx="20" ry="16" fill="#f5deb8"/>
    ${eye(560, 395, 12)}
    <circle cx="642" cy="440" r="13" fill="#222"/>
    <path d="M590 455 Q605 465 620 458"/>
    <circle cx="555" cy="435" r="13" fill="#ffb3b3"/>
    ${ground(535)}`;

  window.ART.addPack({ drawings: [
    { id: 'panda', cat: 'animal', name: '熊貓', en: 'panda', svg: panda },
    { id: 'monkey', cat: 'animal', name: '猴子', en: 'monkey', svg: monkey },
    { id: 'zebra', cat: 'animal', name: '斑馬', en: 'zebra', svg: zebra },
    { id: 'pony', cat: 'animal', name: '小馬', en: 'pony', svg: pony },
    { id: 'cow', cat: 'animal', name: '乳牛', en: 'cow', svg: cow },
    { id: 'hippo', cat: 'animal', name: '河馬', en: 'hippo', svg: hippo },
    { id: 'koala', cat: 'animal', name: '無尾熊', en: 'koala', svg: koala },
    { id: 'kangaroo', cat: 'animal', name: '袋鼠', en: 'kangaroo', svg: kangaroo },
    { id: 'fox', cat: 'animal', name: '狐狸', en: 'fox', svg: fox },
    { id: 'squirrel', cat: 'animal', name: '松鼠', en: 'squirrel', svg: squirrel },
    { id: 'owl', cat: 'animal', name: '貓頭鷹', en: 'owl', svg: owl },
    { id: 'frog', cat: 'animal', name: '青蛙', en: 'frog', svg: frog },
    { id: 'crocodile', cat: 'animal', name: '鱷魚', en: 'crocodile', svg: croc },
    { id: 'hedgehog', cat: 'animal', name: '刺蝟', en: 'hedgehog', svg: hedgehog },
  ] });
})();
