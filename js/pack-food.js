/* 線稿包：水果蔬菜、美食甜點 */
(function () {
  const { eye, ground, scallop } = window.ART.helpers;
  const f1 = n => Math.round(n * 10) / 10;

  /* 可愛小臉：兩個眼睛＋微笑＋腮紅 */
  const face = (x, y, s = 1) => `
    ${eye(f1(x - 30 * s), y, f1(11 * s))}${eye(f1(x + 30 * s), y, f1(11 * s))}
    <path d="M${f1(x - 17 * s)} ${f1(y + 22 * s)} Q${x} ${f1(y + 40 * s)} ${f1(x + 17 * s)} ${f1(y + 22 * s)}"/>
    <circle cx="${f1(x - 54 * s)}" cy="${f1(y + 22 * s)}" r="${f1(12 * s)}" fill="#ffc2c2"/>
    <circle cx="${f1(x + 54 * s)}" cy="${f1(y + 22 * s)}" r="${f1(12 * s)}" fill="#ffc2c2"/>`;

  /* 橢圓內的弦線（鳳梨、玉米紋路），端點剛好落在外框上 */
  function chords(cx, cy, rx, ry, deg, offsets) {
    const a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
    return offsets.map(c => {
      const ux = -dy * c, uy = dx * c;
      const A = dx * dx / (rx * rx) + dy * dy / (ry * ry);
      const B = 2 * (ux * dx / (rx * rx) + uy * dy / (ry * ry));
      const C = ux * ux / (rx * rx) + uy * uy / (ry * ry) - 1;
      const disc = B * B - 4 * A * C;
      if (disc <= 0) return '';
      const t1 = (-B - Math.sqrt(disc)) / (2 * A), t2 = (-B + Math.sqrt(disc)) / (2 * A);
      return `<path d="M${f1(cx + ux + dx * t1)} ${f1(cy + uy + dy * t1)} L${f1(cx + ux + dx * t2)} ${f1(cy + uy + dy * t2)}"/>`;
    }).join('');
  }
  const range = (a, b, step) => { const r = []; for (let v = a; v <= b + 1e-6; v += step) r.push(v); return r; };

  function star(cx, cy, R, r, n, rot = -90) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
      d += `${i ? 'L' : 'M'}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))} `;
    }
    return d + 'Z';
  }
  const leaf = (d) => `<path fill="#69db7c" d="${d}"/>`;

  /* ================= 水果蔬菜 ================= */
  const apple = `
    <path fill="#8b5a2b" d="M390 210 Q382 150 398 108 L418 114 Q404 155 412 210 Z"/>
    <path fill="#ff4d4d" d="M400 200 Q470 150 540 175 Q625 215 615 340 Q605 470 505 510 Q450 528 400 502 Q350 528 295 510 Q195 470 185 340 Q175 215 260 175 Q330 150 400 200 Z"/>
    ${leaf('M414 145 Q470 88 535 112 Q485 170 414 145 Z')}
    <path d="M420 142 Q475 125 525 115"/>
    <path fill="#ffa8a8" d="M250 260 Q262 220 295 205 Q302 222 285 240 Q268 258 250 260 Z"/>
    ${face(400, 330)}`;

  const banana = `
    <path fill="#ffe14d" d="M170 250 Q185 505 450 508 Q655 505 702 322 L680 304 Q610 412 450 412 Q262 408 215 240 Z"/>
    <path fill="#8b5a2b" d="M680 304 L702 322 L730 286 L708 270 Z"/>
    <path fill="#6b4a2b" d="M170 250 L215 240 L208 220 L176 226 Z"/>
    <path d="M232 300 Q270 380 330 418"/>
    ${face(455, 446, 0.62)}`;

  const strawberry = `
    <rect x="392" y="92" width="16" height="50" rx="7" fill="#2f9e44"/>
    <path fill="#ff4d6d" d="M400 525 Q245 455 228 300 Q228 205 320 198 Q362 195 400 212 Q438 195 480 198 Q572 205 572 300 Q555 455 400 525 Z"/>
    <path fill="#51cf66" d="M295 212 Q335 158 370 188 Q378 140 400 128 Q422 140 430 188 Q465 158 505 212 Q452 240 400 222 Q348 240 295 212 Z"/>
    ${[[300, 280], [500, 280], [275, 350], [525, 350], [320, 420], [480, 420], [400, 455], [355, 480], [445, 480]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="8" fill="#222"/>`).join('')}
    ${face(400, 330)}`;

  const watermelon = `
    <path fill="#40c057" d="M110 250 L690 250 A290 290 0 0 1 110 250 Z"/>
    <path fill="#e9fac8" d="M142 250 L658 250 A258 258 0 0 1 142 250 Z"/>
    <path fill="#ff6b6b" d="M168 250 L632 250 A232 232 0 0 1 168 250 Z"/>
    ${[[245, 290], [555, 290], [285, 380], [515, 380], [350, 440], [450, 440], [400, 465]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="10" fill="#222"/>`).join('')}
    ${face(400, 320)}`;

  const grapeXY = [[250, 215], [350, 215], [450, 215], [550, 215], [300, 300], [400, 300], [500, 300], [350, 385], [450, 385], [400, 470]];
  const grapes = `
    <path fill="#8b5a2b" d="M390 165 Q385 120 405 80 L422 88 Q405 125 412 165 Z"/>
    ${leaf('M418 110 Q480 50 570 75 Q520 150 418 110 Z')}
    <path d="M425 108 Q490 90 560 80"/>
    ${grapeXY.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="56" fill="#9775fa"/><path d="M${x - 30} ${y - 18} Q${x - 26} ${y - 34} ${x - 10} ${y - 38}"/>`).join('')}`;

  const pineapple = `
    <path fill="#51cf66" d="M325 235 L285 120 L355 180 L340 62 L400 158 L460 62 L445 180 L515 120 L475 235 Z"/>
    <ellipse cx="400" cy="375" rx="135" ry="160" fill="#ffd43b"/>
    ${chords(400, 375, 135, 160, 50, range(-200, 200, 55))}
    ${chords(400, 375, 135, 160, -50, range(-200, 200, 55))}`;

  const orange = `
    <rect x="392" y="108" width="16" height="45" rx="6" fill="#8b5a2b"/>
    <circle cx="400" cy="335" r="185" fill="#ffa94d"/>
    ${leaf('M404 148 Q445 85 520 98 Q490 165 404 148 Z')}
    <path d="M410 146 Q455 120 512 102"/>
    <circle cx="400" cy="160" r="12" fill="#e8590c"/>
    ${face(400, 340)}`;

  const cherry = `
    <path fill="#8b5a2b" d="M282 345 Q318 205 420 108 L432 120 Q340 212 298 345 Z"/>
    <path fill="#8b5a2b" d="M502 325 Q482 205 422 116 L436 106 Q500 200 518 325 Z"/>
    ${leaf('M432 110 Q500 45 595 75 Q525 150 432 110 Z')}
    <path d="M440 108 Q510 88 585 78"/>
    <circle cx="290" cy="425" r="95" fill="#ff4d4d"/>
    <circle cx="510" cy="405" r="95" fill="#ff4d4d"/>
    ${face(290, 425, 0.65)}${face(510, 405, 0.65)}`;

  const pear = `
    <path fill="#8b5a2b" d="M392 128 Q388 92 408 68 L422 76 Q405 100 410 128 Z"/>
    <path fill="#c0eb75" d="M400 120 Q452 120 462 200 Q472 262 542 320 Q605 382 582 452 Q552 532 400 532 Q248 532 218 452 Q195 382 258 320 Q328 262 338 200 Q348 120 400 120 Z"/>
    ${leaf('M414 98 Q470 55 535 72 Q495 128 414 98 Z')}
    ${face(400, 410)}`;

  const lemon = `
    <path fill="#ffe066" d="M165 320 Q178 298 202 290 Q262 168 400 168 Q538 168 598 290 Q622 298 635 320 Q622 342 598 350 Q538 472 400 472 Q262 472 202 350 Q178 342 165 320 Z"/>
    ${leaf('M405 172 Q455 105 535 118 Q500 185 405 172 Z')}
    <path d="M412 170 Q465 140 525 122"/>
    ${face(400, 320)}`;

  const carrot = `
    <path fill="#51cf66" d="M352 205 Q295 125 325 68 Q382 108 392 200 Z"/>
    <path fill="#51cf66" d="M388 200 Q382 95 410 48 Q442 100 416 200 Z"/>
    <path fill="#51cf66" d="M412 205 Q440 112 492 82 Q505 152 450 210 Z"/>
    <path fill="#ff922b" d="M298 205 Q400 172 502 205 Q505 262 442 420 Q412 515 400 532 Q388 515 358 420 Q295 262 298 205 Z"/>
    <path d="M318 300 L350 304 M484 330 L452 334 M352 420 L378 420 M440 455 L418 455"/>
    ${face(400, 265, 0.85)}`;

  const corn = `
    <ellipse cx="400" cy="290" rx="100" ry="195" fill="#ffd43b"/>
    ${chords(400, 290, 100, 195, 90, [-66, -33, 0, 33, 66])}
    ${chords(400, 290, 100, 195, 0, range(-160, 160, 36))}
    <path fill="#69db7c" d="M400 548 Q235 505 222 255 Q292 385 400 445 Z"/>
    <path fill="#51cf66" d="M400 548 Q565 505 578 255 Q508 385 400 445 Z"/>
    <path d="M300 420 Q340 470 395 500 M500 420 Q460 470 405 500"/>`;

  const eggplant = `
    <path fill="#2f9e44" d="M238 182 L196 128 L212 116 L256 170 Z"/>
    <path fill="#9775fa" d="M240 172 Q330 140 385 222 Q428 292 525 302 Q655 322 642 435 Q622 535 480 525 Q328 510 268 382 Q232 302 212 245 Q200 190 240 172 Z"/>
    <path fill="#51cf66" d="M195 222 Q205 160 262 158 Q312 165 322 212 Q295 225 278 205 Q268 245 245 220 Q222 250 195 222 Z"/>
    <path fill="#b197fc" d="M300 330 Q290 290 300 262 Q318 270 318 300 Q316 322 300 330 Z"/>
    ${face(505, 410)}`;

  const tomato = `
    <rect x="391" y="140" width="18" height="50" rx="7" fill="#2f9e44"/>
    <path fill="#ff6b6b" d="M400 192 Q565 170 612 305 Q642 435 522 502 Q400 548 278 502 Q158 435 188 305 Q235 170 400 192 Z"/>
    <path fill="#51cf66" d="${star(400, 200, 78, 26, 5)}"/>
    ${face(400, 345)}`;

  const pumpkin = `
    <path fill="#8b5a2b" d="M378 215 Q372 150 392 112 L425 120 Q412 160 422 215 Z"/>
    <path d="M425 125 Q470 90 500 120 Q520 150 490 160"/>
    ${leaf('M430 170 Q490 110 560 140 Q510 200 430 170 Z')}
    <ellipse cx="290" cy="365" rx="125" ry="150" fill="#ff922b"/>
    <ellipse cx="510" cy="365" rx="125" ry="150" fill="#ff922b"/>
    <ellipse cx="400" cy="365" rx="120" ry="165" fill="#ff922b"/>
    ${face(400, 360)}`;

  const broccoli = `
    <path fill="#8ce99a" d="M345 320 L318 520 Q400 548 482 520 L455 320 Z"/>
    <path d="M400 520 L400 430 M400 430 L360 360 M400 430 L440 360"/>
    <path fill="#40c057" d="${scallop(400, 240, 165, 14, 12)}"/>
    <path d="M300 170 Q320 150 345 160 M455 160 Q480 150 500 170 M290 300 Q305 320 330 315 M470 315 Q495 320 510 300"/>
    ${face(400, 245)}`;

  /* ================= 美食甜點 ================= */
  let drip = 'M195 300 Q195 255 245 255 L555 255 Q605 255 605 300 L605 320';
  for (let i = 0; i < 6; i++) {
    const w = 410 / 6, x0 = 605 - i * w, x1 = x0 - w;
    drip += ` Q${f1(x0 - w / 2)} ${i % 2 ? 352 : 392} ${f1(x1)} 320`;
  }
  drip += ' Z';
  const cake = `
    <ellipse cx="400" cy="500" rx="275" ry="38" fill="#e9ecef"/>
    ${[300, 400, 500].map(x => `
      <path fill="#ffd43b" d="M${x} 112 Q${x + 24} 150 ${x} 165 Q${x - 24} 150 ${x} 112 Z"/>
      <rect x="${x - 13}" y="170" width="26" height="92" rx="6" fill="#74c0fc"/>`).join('')}
    <rect x="200" y="290" width="400" height="200" rx="12" fill="#ffd8a8"/>
    <rect x="200" y="405" width="400" height="32" fill="#ffc9de"/>
    <path fill="#f783ac" d="${drip}"/>
    ${[260, 340, 460, 540].map(x => `<circle cx="${x}" cy="470" r="9" fill="#ff6b6b"/>`).join('')}`;

  const coneLines = [345, 400, 455].map(x0 => {
    const s1 = (510 - x0) / 220, s2 = (x0 - 290) / 220;
    return `<path d="M${x0} 300 L${f1(x0 + 110 * s1)} ${f1(300 + 240 * s1)}"/><path d="M${x0} 300 L${f1(x0 - 110 * s2)} ${f1(300 + 240 * s2)}"/>`;
  }).join('');
  const icecream = `
    <path fill="#f0b86e" d="M285 295 L400 545 L515 295 Z"/>
    ${coneLines}
    <path d="M400 108 Q410 72 438 58"/>
    <circle cx="400" cy="118" r="30" fill="#ff4d4d"/>
    <path fill="#ffa8d0" d="M270 305 Q262 140 400 140 Q538 140 530 305 Q508 338 482 310 Q458 345 428 312 Q400 342 372 312 Q342 345 318 310 Q292 338 270 305 Z"/>
    ${face(400, 235)}`;

  const donut = `
    <circle cx="400" cy="310" r="205" fill="#f0b86e"/>
    <path fill="#f783ac" d="${scallop(400, 310, 160, 12, 9)}"/>
    <circle cx="400" cy="310" r="58" fill="#ffe8cc"/>
    ${[[300, 210, 20], [480, 200, -30], [540, 300, 60], [510, 410, 10], [400, 440, -40], [290, 410, 45], [260, 310, -70], [395, 180, 80], [350, 260, 0], [455, 265, 30]]
      .map(([x, y, a]) => {
        const dx = f1(14 * Math.cos(a * Math.PI / 180)), dy = f1(14 * Math.sin(a * Math.PI / 180));
        return `<path stroke-width="5" d="M${f1(x - dx)} ${f1(y - dy)} L${f1(x + dx)} ${f1(y + dy)}"/>`;
      }).join('')}`;

  const cupcake = `
    <path fill="#74c0fc" d="M255 340 L545 340 L502 525 L298 525 Z"/>
    <path d="M300 342 L322 523 M500 342 L478 523"/>
    <path fill="#ffc9de" d="M232 352 Q212 278 290 272 L510 272 Q588 278 568 352 Z"/>
    <path fill="#ffc9de" d="M278 280 Q266 205 340 200 L460 200 Q534 205 522 280 Z"/>
    <path fill="#ffc9de" d="M330 208 Q328 125 400 105 Q472 125 470 208 Z"/>
    <circle cx="400" cy="100" r="30" fill="#ff4d4d"/>
    <path d="M400 70 Q408 45 430 35"/>
    ${face(400, 415, 0.9)}`;

  const burger = `
    <path fill="#f0b86e" d="M200 420 L600 420 Q602 505 535 505 L265 505 Q198 505 200 420 Z"/>
    <rect x="182" y="368" width="436" height="64" rx="30" fill="#8b5a2b"/>
    <path fill="#ffd43b" d="M190 358 L610 358 L604 386 L545 386 L522 425 L500 386 L305 386 L282 428 L262 386 L196 386 Z"/>
    <path fill="#69db7c" d="M175 330 L625 330 L625 350 Q595 378 568 352 Q540 380 512 352 Q484 380 456 352 Q428 380 400 352 Q372 380 344 352 Q316 380 288 352 Q260 380 232 352 Q204 378 175 350 Z"/>
    <path fill="#f0b86e" d="M188 340 Q188 158 400 158 Q612 158 612 340 Z"/>
    ${[[310, 230, -20], [400, 205, 0], [490, 230, 20], [355, 280, -10], [450, 280, 10], [260, 290, -30], [540, 290, 30]]
      .map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="7" fill="#fff3bf" transform="rotate(${a} ${x} ${y})"/>`).join('')}
    ${ground(520)}`;

  const pizza = `
    <path fill="#ffd43b" d="M180 170 Q400 100 620 170 L400 545 Z"/>
    <path d="M300 372 Q290 400 305 420 M500 372 Q512 395 497 418"/>
    <path fill="#e8a25a" d="M172 162 Q400 82 628 162 L605 210 Q400 142 195 210 Z"/>
    <circle cx="325" cy="275" r="34" fill="#ff6b6b"/>
    <circle cx="475" cy="275" r="34" fill="#ff6b6b"/>
    <circle cx="400" cy="370" r="32" fill="#ff6b6b"/>
    <circle cx="400" cy="470" r="22" fill="#ff6b6b"/>
    <path fill="#69db7c" d="M390 245 Q405 220 425 238 Q410 262 390 245 Z"/>
    <path fill="#69db7c" d="M330 330 Q348 310 362 332 Q345 352 330 330 Z"/>`;

  let spiral = 'M400 240';
  const turns = 3.2, R = 150, steps = 160;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, a = t * turns * Math.PI * 2;
    spiral += ` L${f1(400 + R * t * Math.cos(a))} ${f1(240 + R * t * Math.sin(a))}`;
  }
  const lollipop = `
    <rect x="388" y="330" width="24" height="210" rx="10" fill="#e9ecef"/>
    <circle cx="400" cy="240" r="150" fill="#ff8cc6"/>
    <path d="${spiral}"/>
    <path fill="#74c0fc" d="M400 405 L338 375 L338 435 Z"/>
    <path fill="#74c0fc" d="M400 405 L462 375 L462 435 Z"/>
    <circle cx="400" cy="405" r="14" fill="#4dabf7"/>`;

  const pearls = [[328, 480], [368, 492], [410, 494], [452, 487], [352, 450], [394, 456], [436, 452], [474, 462]];
  const bubbletea = `
    <path fill="#ff6b6b" d="M418 38 L448 44 L428 185 L398 180 Z"/>
    <path fill="#ffe3ee" d="M262 178 Q400 82 538 178 Z"/>
    <path fill="#e8c39e" d="M272 205 L528 205 L494 518 Q400 540 306 518 Z"/>
    <rect x="248" y="170" width="304" height="42" rx="15" fill="#ffc9de"/>
    <path d="M281 255 Q400 268 519 255"/>
    ${pearls.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="19" fill="#222"/><circle cx="${x + 6}" cy="${y - 7}" r="5" fill="#fff" stroke="none"/>`).join('')}
    ${face(400, 330, 0.9)}`;

  const cookie = (x, y, r, chips) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0a96d"/>` +
    chips.map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="11" ry="8" fill="#222"/>`).join('');
  const cookies = `
    ${cookie(275, 270, 125, [[-60, -40], [10, -75], [-70, 40], [-20, 70], [40, -10]])}
    ${cookie(525, 270, 125, [[60, -40], [-10, -75], [70, 40], [20, 70], [-40, -10]])}
    ${cookie(400, 395, 145, [[-90, -50], [85, -60], [-100, 50], [95, 55], [0, -100], [-40, 100], [45, 100]])}
    ${face(400, 390)}`;

  let mustard = 'M170 292';
  for (let x = 170; x < 630; x += 46) mustard += ` Q${x + 23} ${((x - 170) / 46) % 2 ? 308 : 276} ${x + 46} 292`;
  mustard += ' L630 305';
  for (let x = 630; x > 170; x -= 46) mustard += ` Q${x - 23} ${((x - 216) / 46) % 2 ? 289 : 321} ${x - 46} 305`;
  mustard += ' Z';
  const hotdog = `
    <path fill="#f0b86e" d="M160 320 Q160 238 240 238 L560 238 Q640 238 640 320 Z"/>
    <rect x="115" y="268" width="570" height="80" rx="40" fill="#ff6b6b"/>
    <path fill="#ffd43b" d="${mustard}"/>
    <path fill="#f0b86e" d="M150 320 L650 320 Q662 428 560 432 L240 432 Q138 428 150 320 Z"/>
    ${ground(470)}`;

  const dumpling = (x, y) => `
    <path fill="#f8f9fa" d="M${x - 92} ${y} Q${x - 98} ${y - 82} ${x} ${y - 112} Q${x + 98} ${y - 82} ${x + 92} ${y} Q${x} ${y + 26} ${x - 92} ${y} Z"/>
    <path d="M${x} ${y - 108} L${x - 38} ${y - 78} M${x} ${y - 108} L${x - 12} ${y - 76} M${x} ${y - 108} L${x + 14} ${y - 76} M${x} ${y - 108} L${x + 40} ${y - 78}"/>
    <circle cx="${x}" cy="${y - 112}" r="10" fill="#f8f9fa"/>
    ${face(x, y - 42, 0.55)}`;
  const xiaolongbao = `
    <path d="M330 170 Q315 145 330 120 Q345 95 330 70 M400 150 Q385 125 400 100 Q415 75 400 50 M470 170 Q455 145 470 120 Q485 95 470 70"/>
    <ellipse cx="400" cy="345" rx="255" ry="48" fill="#c08552"/>
    ${dumpling(400, 345)}
    ${dumpling(285, 395)}${dumpling(515, 395)}
    <path fill="#e0a96d" d="M145 345 A255 48 0 0 0 655 345 L655 485 Q655 510 630 510 L170 510 Q145 510 145 485 Z"/>
    <path d="M150 455 L650 455"/>
    ${[230, 320, 400, 480, 570].map(x => `<path d="M${x} 400 L${x} 450 M${x + 40} 460 L${x + 40} 505"/>`).join('')}`;

  const riceball = `
    <path fill="#f8f9fa" d="M400 128 Q442 128 472 180 L612 420 Q642 505 558 505 L242 505 Q158 505 188 420 L328 180 Q358 128 400 128 Z"/>
    <path fill="#495057" d="M318 505 L318 392 L482 392 L482 505 Z"/>
    ${face(400, 300)}`;

  const milk = `
    <path fill="#e7f5ff" d="M352 152 L452 122 L452 98 L352 128 Z"/>
    <path fill="#4dabf7" d="M360 150 L460 120 L560 200 L460 230 Z"/>
    <path fill="#74c0fc" d="M260 230 L360 150 L460 230 Z"/>
    <path fill="#a5d8ff" d="M460 230 L560 200 L560 492 L460 522 Z"/>
    <path fill="#e7f5ff" d="M260 230 L460 230 L460 522 L260 522 Z"/>
    <rect x="260" y="420" width="200" height="54" fill="#74c0fc"/>
    <path fill="#74c0fc" d="M510 300 Q535 340 510 355 Q485 340 510 300 Z"/>
    ${face(360, 320, 0.95)}`;

  const fry = (x, t, tilt) => `<path fill="#ffd43b" d="M${x} ${t} L${x + 38} ${t + 4} L${x + 38 + tilt} 345 L${x + tilt} 345 Z"/>`;
  const fries = `
    ${fry(285, 150, 10)}${fry(345, 110, 5)}${fry(420, 120, -5)}${fry(485, 160, -12)}
    ${fry(255, 200, 18)}${fry(315, 165, 8)}${fry(380, 150, 0)}${fry(445, 175, -8)}${fry(505, 210, -18)}
    <path fill="#ff6b6b" d="M248 288 Q400 345 552 288 L505 522 L295 522 Z"/>
    ${face(400, 410)}`;

  window.ART.addPack({
    categories: [
      { id: 'fruit', name: '水果蔬菜', icon: '🍎', color: '#fa5252', dark: '#c92a2a', en: 'Fruits & Vegetables' },
      { id: 'food', name: '美食甜點', icon: '🍰', color: '#f783ac', dark: '#d6336c', en: 'Food & Sweets' },
    ],
    drawings: [
      { id: 'f-apple', cat: 'fruit', name: '蘋果', en: 'apple', svg: apple },
      { id: 'f-banana', cat: 'fruit', name: '香蕉', en: 'banana', svg: banana },
      { id: 'f-strawberry', cat: 'fruit', name: '草莓', en: 'strawberry', svg: strawberry },
      { id: 'f-watermelon', cat: 'fruit', name: '西瓜', en: 'watermelon', svg: watermelon },
      { id: 'f-grapes', cat: 'fruit', name: '葡萄', en: 'grapes', svg: grapes },
      { id: 'f-pineapple', cat: 'fruit', name: '鳳梨', en: 'pineapple', svg: pineapple },
      { id: 'f-orange', cat: 'fruit', name: '橘子', en: 'orange', svg: orange },
      { id: 'f-cherry', cat: 'fruit', name: '櫻桃', en: 'cherries', svg: cherry },
      { id: 'f-pear', cat: 'fruit', name: '水梨', en: 'pear', svg: pear },
      { id: 'f-lemon', cat: 'fruit', name: '檸檬', en: 'lemon', svg: lemon },
      { id: 'f-carrot', cat: 'fruit', name: '紅蘿蔔', en: 'carrot', svg: carrot },
      { id: 'f-corn', cat: 'fruit', name: '玉米', en: 'corn', svg: corn },
      { id: 'f-eggplant', cat: 'fruit', name: '茄子', en: 'eggplant', svg: eggplant },
      { id: 'f-tomato', cat: 'fruit', name: '番茄', en: 'tomato', svg: tomato },
      { id: 'f-pumpkin', cat: 'fruit', name: '南瓜', en: 'pumpkin', svg: pumpkin },
      { id: 'f-broccoli', cat: 'fruit', name: '花椰菜', en: 'broccoli', svg: broccoli },
      { id: 'd-cake', cat: 'food', name: '蛋糕', en: 'cake', svg: cake },
      { id: 'd-icecream', cat: 'food', name: '冰淇淋', en: 'ice cream', svg: icecream },
      { id: 'd-donut', cat: 'food', name: '甜甜圈', en: 'donut', svg: donut },
      { id: 'd-cupcake', cat: 'food', name: '杯子蛋糕', en: 'cupcake', svg: cupcake },
      { id: 'd-burger', cat: 'food', name: '漢堡', en: 'hamburger', svg: burger },
      { id: 'd-pizza', cat: 'food', name: '披薩', en: 'pizza', svg: pizza },
      { id: 'd-lollipop', cat: 'food', name: '棒棒糖', en: 'lollipop', svg: lollipop },
      { id: 'd-bubbletea', cat: 'food', name: '珍珠奶茶', en: 'bubble tea', svg: bubbletea },
      { id: 'd-cookies', cat: 'food', name: '餅乾', en: 'cookies', svg: cookies },
      { id: 'd-hotdog', cat: 'food', name: '熱狗', en: 'hot dog', svg: hotdog },
      { id: 'd-xiaolongbao', cat: 'food', name: '小籠包', en: 'soup dumplings', svg: xiaolongbao },
      { id: 'd-riceball', cat: 'food', name: '飯糰', en: 'rice ball', svg: riceball },
      { id: 'd-milk', cat: 'food', name: '牛奶', en: 'milk', svg: milk },
      { id: 'd-fries', cat: 'food', name: '薯條', en: 'french fries', svg: fries },
    ],
  });
})();
