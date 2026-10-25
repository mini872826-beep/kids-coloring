/* 線稿包：建築、萬聖節 */
(function () {
  const { eye, ground, win, tree2, sparkle, miniBat } = window.ART.helpers;
  const f = n => n.toFixed(1);

  /* ---------------- 建築 ---------------- */
  const library = `
    ${tree2(80)} ${tree2(720)}
    <rect x="160" y="240" width="480" height="270" fill="#ffe8cc"/>
    <path fill="#e8590c" d="M130 252 L400 115 L670 252 Z"/>
    <path fill="#fff9db" d="M400 182 Q370 166 336 176 L336 228 Q370 218 400 234 Z"/>
    <path fill="#fff9db" d="M400 182 Q430 166 464 176 L464 228 Q430 218 400 234 Z"/>
    <path d="M400 182 L400 234"/>
    <rect x="130" y="245" width="540" height="26" rx="6" fill="#d9480f"/>
    ${[200, 280, 520, 600].map(x => `<rect x="${x - 17}" y="271" width="34" height="229" fill="#f8f9fa"/>`).join('')}
    <path fill="#9c6b3c" d="M340 500 L340 380 Q340 330 400 330 Q460 330 460 380 L460 500 Z"/>
    <path d="M400 335 L400 500"/>
    <rect x="150" y="500" width="500" height="15" fill="#ced4da"/>
    <rect x="130" y="515" width="540" height="15" fill="#adb5bd"/>
    ${ground(530)}`;

  const bakery = `
    <ellipse cx="400" cy="135" rx="120" ry="55" fill="#f4a259"/>
    <path d="M345 110 Q360 135 345 160 M400 100 Q415 135 400 170 M455 110 Q470 135 455 160"/>
    <rect x="170" y="200" width="460" height="330" fill="#fff0f6"/>
    <rect x="150" y="180" width="500" height="34" rx="8" fill="#a9e34b"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const x = 160 + i * 80; return `<path fill="${i % 2 ? '#fff5f5' : '#ff6b6b'}" d="M${x} 230 L${x + 80} 230 L${x + 80} 285 Q${x + 40} 320 ${x} 285 Z"/>`; }).join('')}
    <rect x="200" y="335" width="180" height="135" rx="8" fill="#a8e0ff"/>
    <path fill="#ffa8a8" d="M250 455 L330 455 L320 410 L260 410 Z"/>
    <path fill="#fcc2d7" d="M252 412 Q245 372 290 368 Q335 372 328 412 Z"/>
    <circle cx="290" cy="362" r="11" fill="#fa5252"/>
    <path fill="#c08457" d="M440 530 L440 360 Q440 335 465 335 L545 335 Q570 335 570 360 L570 530 Z"/>
    <rect x="460" y="360" width="90" height="70" rx="8" fill="#a8e0ff"/>
    <circle cx="550" cy="465" r="8" fill="#ffd43b"/>
    ${ground(530)}`;

  const castle = `
    ${sparkle(90, 110)} ${sparkle(720, 330, 12)} ${sparkle(400, 90, 16)}
    <path d="M200 82 L200 45 M600 82 L600 45"/>
    <path fill="#ff6b6b" d="M200 45 L245 58 L200 71 Z"/>
    <path fill="#ffd43b" d="M600 45 L645 58 L600 71 Z"/>
    <path fill="#e5dbff" d="M260 530 L260 260 L292 260 L292 228 L334 228 L334 260 L379 260 L379 228 L421 228 L421 260 L466 260 L466 228 L508 228 L508 260 L540 260 L540 530 Z"/>
    <rect x="140" y="200" width="120" height="330" fill="#d0bfff"/>
    <rect x="540" y="200" width="120" height="330" fill="#d0bfff"/>
    <path fill="#7950f2" d="M120 210 L200 80 L280 210 Z"/>
    <path fill="#7950f2" d="M520 210 L600 80 L680 210 Z"/>
    ${[200, 600].map(x => `<path fill="#ffe066" d="M${x - 20} 330 L${x - 20} 295 Q${x - 20} 270 ${x} 270 Q${x + 20} 270 ${x + 20} 295 L${x + 20} 330 Z"/><path fill="#ffe066" d="M${x - 20} 450 L${x - 20} 415 Q${x - 20} 390 ${x} 390 Q${x + 20} 390 ${x + 20} 415 L${x + 20} 450 Z"/>`).join('')}
    <circle cx="400" cy="310" r="26" fill="#ffe066"/>
    <path fill="#9c6b3c" d="M340 530 L340 420 Q340 360 400 360 Q460 360 460 420 L460 530 Z"/>
    <path d="M370 368 L370 530 M400 360 L400 530 M430 368 L430 530 M340 440 L460 440 M340 485 L460 485"/>
    ${ground(530)}`;

  const lighthouse = `
    <circle cx="660" cy="90" r="40" fill="#ffe066"/>
    <path d="M560 240 q15 -15 30 0 q15 -15 30 0 M110 270 q12 -12 24 0 q12 -12 24 0"/>
    <path fill="#fff3bf" d="M360 150 L170 95 L170 205 Z"/>
    <path fill="#fff3bf" d="M440 150 L630 95 L630 205 Z"/>
    <path fill="#adb5bd" d="M220 515 Q232 450 315 432 L485 432 Q568 450 580 515 Z"/>
    <path fill="#fff5f5" d="M330 445 L350 200 L450 200 L470 445 Z"/>
    <path fill="#ff6b6b" d="M345.8 250 L454.2 250 L458.3 300 L341.7 300 Z"/>
    <path fill="#ff6b6b" d="M337.5 350 L462.5 350 L466.7 400 L333.3 400 Z"/>
    <circle cx="400" cy="325" r="14" fill="#a8e0ff"/>
    <path fill="#4dabf7" d="M378 445 L378 420 Q378 400 400 400 Q422 400 422 420 L422 445 Z"/>
    <rect x="355" y="120" width="90" height="68" fill="#ffe066"/>
    <path d="M385 120 L385 188 M415 120 L415 188"/>
    <rect x="318" y="185" width="164" height="20" rx="6" fill="#868e96"/>
    <path fill="#ff6b6b" d="M338 125 L400 70 L462 125 Z"/>
    <circle cx="400" cy="62" r="10" fill="#ffd43b"/>
    <path fill="#74c0fc" d="M40 490 Q80 465 120 490 Q160 515 200 490 Q240 465 280 490 Q320 515 360 490 Q400 465 440 490 Q480 515 520 490 Q560 465 600 490 Q640 515 680 490 Q720 465 760 490 L760 545 L40 545 Z"/>`;

  const barn = `
    ${tree2(80)}
    <path fill="#868e96" d="M560 200 Q610 125 660 200 Z"/>
    <rect x="560" y="200" width="100" height="330" fill="#ced4da"/>
    <path d="M560 280 L660 280 M560 360 L660 360 M560 440 L660 440"/>
    <path fill="#868e96" d="M130 305 L190 190 L340 118 L490 190 L550 305 Z"/>
    <path fill="#ff6b6b" d="M162 530 L162 300 L212 214 L340 158 L468 214 L518 300 L518 530 Z"/>
    ${win(300, 205, 80, 60, '#ffe066')}
    <rect x="250" y="360" width="180" height="170" fill="#f8f9fa"/>
    <rect x="262" y="372" width="74" height="158" fill="#fa5252"/>
    <rect x="344" y="372" width="74" height="158" fill="#fa5252"/>
    <path d="M262 372 L336 530 M336 372 L262 530 M344 372 L418 530 M418 372 L344 530"/>
    ${ground(530)}`;

  const cabinColors = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc', '#ff922b', '#f783ac', '#38d9a9'];
  const ferrisWheel = `
    <path fill="#adb5bd" d="M390 285 L275 515 L318 515 L408 315 Z"/>
    <path fill="#adb5bd" d="M410 285 L525 515 L482 515 L392 315 Z"/>
    <rect x="235" y="510" width="330" height="20" rx="6" fill="#868e96"/>
    <circle cx="400" cy="280" r="190" fill="#ffd8a8"/>
    <circle cx="400" cy="280" r="165" fill="#fff9db"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4; return `<path d="M400 280 L${f(400 + 165 * Math.cos(a))} ${f(280 + 165 * Math.sin(a))}"/>`; }).join('')}
    <circle cx="400" cy="280" r="30" fill="#ff6b6b"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4 - Math.PI / 2; const x = 400 + 190 * Math.cos(a), y = 280 + 190 * Math.sin(a); return `<rect x="${f(x - 30)}" y="${f(y - 22)}" width="60" height="46" rx="16" fill="${cabinColors[k]}"/><rect x="${f(x - 16)}" y="${f(y - 12)}" width="32" height="18" rx="6" fill="#a8e0ff"/>`; }).join('')}
    ${ground(530)}`;

  const playground = `
    <circle cx="650" cy="120" r="48" fill="#ffd43b"/>
    <rect x="180" y="130" width="22" height="400" fill="#4dabf7"/>
    <rect x="300" y="130" width="22" height="400" fill="#4dabf7"/>
    ${[340, 390, 440, 490].map(y => `<rect x="202" y="${y}" width="98" height="14" rx="5" fill="#ffd43b"/>`).join('')}
    <path fill="#ff6b6b" d="M145 145 L251 62 L357 145 Z"/>
    <path fill="#ffd43b" d="M322 282 L362 282 Q455 300 525 430 Q565 495 705 497 L705 530 Q545 530 495 452 Q430 335 322 318 Z"/>
    <rect x="165" y="275" width="170" height="26" rx="6" fill="#ff922b"/>
    <circle cx="110" cy="505" r="24" fill="#69db7c"/>
    ${ground(530)}`;

  const trainStation = `
    <rect x="255" y="120" width="90" height="120" fill="#ffe8cc"/>
    <path fill="#c92a2a" d="M238 125 L300 65 L362 125 Z"/>
    <circle cx="300" cy="178" r="30" fill="#fff9db"/>
    <path d="M300 178 L300 158 M300 178 L315 186"/>
    <rect x="130" y="280" width="340" height="250" fill="#ffe8cc"/>
    <path fill="#c92a2a" d="M100 292 L170 235 L430 235 L500 292 Z"/>
    <path fill="#a8e0ff" d="M155 450 L155 395 Q155 360 190 360 Q225 360 225 395 L225 450 Z"/>
    <path fill="#a8e0ff" d="M375 450 L375 395 Q375 360 410 360 Q445 360 445 395 L445 450 Z"/>
    <path fill="#4dabf7" d="M262 530 L262 395 Q262 355 300 355 Q338 355 338 395 L338 530 Z"/>
    <path d="M300 355 L300 530"/>
    <circle cx="590" cy="315" r="20" fill="#e9ecef"/>
    <circle cx="620" cy="280" r="26" fill="#e9ecef"/>
    <rect x="565" y="370" width="30" height="45" fill="#495057"/>
    <rect x="555" y="358" width="50" height="16" rx="5" fill="#495057"/>
    <rect x="640" y="340" width="85" height="150" rx="8" fill="#1c7ed6"/>
    <rect x="657" y="360" width="50" height="42" rx="6" fill="#a8e0ff"/>
    <rect x="535" y="410" width="160" height="80" rx="12" fill="#4dabf7"/>
    <circle cx="548" cy="440" r="10" fill="#ffe066"/>
    <path fill="#ff6b6b" d="M537 470 L512 500 L540 500 Z"/>
    ${[575, 640, 700].map(x => `<circle cx="${x}" cy="502" r="27" fill="#555"/><circle cx="${x}" cy="502" r="10" fill="#ccc"/>`).join('')}
    ${ground(530)}`;

  const convenienceStore = `
    <rect x="130" y="190" width="540" height="340" fill="#f1f3f5"/>
    <rect x="110" y="165" width="580" height="85" rx="10" fill="#e6fcf5"/>
    <rect x="110" y="250" width="580" height="16" fill="#40c057"/>
    <rect x="110" y="266" width="580" height="16" fill="#ff922b"/>
    <path d="M320 225 L320 244"/>
    <circle cx="320" cy="205" r="20" fill="#f783ac"/>
    <path fill="#fff9db" d="M400 180 Q412 180 432 216 Q442 238 420 238 L380 238 Q358 238 368 216 Q388 180 400 180 Z"/>
    <rect x="386" y="214" width="28" height="24" fill="#2b8a3e"/>
    <path d="M497 192 L508 174"/>
    <path fill="#74c0fc" d="M468 192 L512 192 L504 240 L476 240 Z"/>
    <rect x="160" y="305" width="185" height="150" rx="6" fill="#a8e0ff"/>
    <path d="M160 355 L345 355 M160 405 L345 405"/>
    <rect x="180" y="320" width="26" height="35" rx="5" fill="#ff6b6b"/>
    <rect x="220" y="325" width="34" height="30" rx="5" fill="#ffd43b"/>
    <rect x="280" y="370" width="40" height="35" rx="5" fill="#69db7c"/>
    <rect x="370" y="305" width="150" height="225" fill="#d0ebff"/>
    <path d="M445 305 L445 530"/>
    <rect x="545" y="305" width="105" height="150" rx="6" fill="#a8e0ff"/>
    ${ground(530)}`;

  const myHouse = `
    <circle cx="105" cy="100" r="45" fill="#ffd43b"/>
    ${tree2(690)}
    <rect x="450" y="135" width="46" height="100" fill="#c92a2a"/>
    <rect x="180" y="280" width="360" height="250" fill="#fff3bf"/>
    <path fill="#ff6b6b" d="M150 292 L360 120 L570 292 Z"/>
    <path fill="#f783ac" d="M360 248 Q322 222 330 200 Q340 182 360 198 Q380 182 390 200 Q398 222 360 248 Z"/>
    ${win(210, 330, 80, 70)} ${win(430, 330, 80, 70)}
    <rect x="320" y="390" width="80" height="140" rx="8" fill="#4dabf7"/>
    <circle cx="386" cy="465" r="7" fill="#ffd43b"/>
    ${[110, 590].map(x => `<path d="M${x} 530 L${x} 485"/>${[0, 1, 2, 3, 4].map(k => { const a = k * Math.PI * 2 / 5 - Math.PI / 2; return `<circle cx="${f(x + 15 * Math.cos(a))}" cy="${f(470 + 15 * Math.sin(a))}" r="11" fill="#f783ac"/>`; }).join('')}<circle cx="${x}" cy="470" r="9" fill="#ffd43b"/>`).join('')}
    ${ground(530)}`;

  /* ---------------- 萬聖節 ---------------- */
  const blackCat = `
    <circle cx="650" cy="110" r="60" fill="#fff3b0"/>
    ${sparkle(120, 110)} ${sparkle(170, 400, 12)} ${miniBat(560, 220, .8)}
    <path fill="#5c5f66" d="M520 470 Q640 480 640 360 Q640 320 670 305 Q700 320 685 360 Q690 510 510 505 Z"/>
    <ellipse cx="400" cy="440" rx="150" ry="105" fill="#5c5f66"/>
    <ellipse cx="400" cy="465" rx="75" ry="60" fill="#868e96"/>
    <path fill="#5c5f66" d="M292 210 L305 92 L390 150 Z"/>
    <path fill="#5c5f66" d="M508 210 L495 92 L410 150 Z"/>
    <path fill="#ffb3c6" d="M312 170 L318 125 L355 152 Z"/>
    <path fill="#ffb3c6" d="M488 170 L482 125 L445 152 Z"/>
    <circle cx="400" cy="260" r="122" fill="#5c5f66"/>
    <ellipse cx="352" cy="250" rx="24" ry="28" fill="#ffe066"/><ellipse cx="448" cy="250" rx="24" ry="28" fill="#ffe066"/>
    <ellipse cx="352" cy="252" rx="10" ry="19" fill="#222"/><circle cx="356" cy="243" r="5" fill="#fff" stroke="none"/>
    <ellipse cx="448" cy="252" rx="10" ry="19" fill="#222"/><circle cx="452" cy="243" r="5" fill="#fff" stroke="none"/>
    <path fill="#ff7aa2" d="M386 290 L414 290 L400 305 Z"/>
    <path d="M400 305 Q388 328 368 313 M400 305 Q412 328 432 313"/>
    <path d="M300 285 L230 270 M300 300 L228 305 M500 285 L570 270 M500 300 L572 305"/>
    <circle cx="320" cy="310" r="18" fill="#ffc2c2"/><circle cx="480" cy="310" r="18" fill="#ffc2c2"/>
    <path fill="#ff6b6b" d="M335 365 Q400 395 465 365 L462 385 Q400 412 338 385 Z"/>
    <circle cx="400" cy="400" r="15" fill="#ffd43b"/>
    <ellipse cx="335" cy="535" rx="45" ry="22" fill="#5c5f66"/>
    <ellipse cx="465" cy="535" rx="45" ry="22" fill="#5c5f66"/>`;

  const candy = (x, y, c) => `<path fill="${c}" d="M${x - 20} ${y} L${x - 46} ${y - 18} L${x - 46} ${y + 18} Z"/><path fill="${c}" d="M${x + 20} ${y} L${x + 46} ${y - 18} L${x + 46} ${y + 18} Z"/><circle cx="${x}" cy="${y}" r="24" fill="${c}"/>`;
  const candyBucket = `
    ${sparkle(110, 120)} ${sparkle(690, 160, 16)} ${miniBat(600, 90, .8)}
    <path fill="#868e96" d="M255 270 Q400 70 545 270 L518 275 Q400 105 282 275 Z"/>
    <rect x="453" y="150" width="12" height="110" fill="#f8f9fa"/>
    <circle cx="459" cy="150" r="32" fill="#f783ac"/>
    <path d="M459 132 Q478 150 459 168 Q442 150 459 140"/>
    ${candy(330, 222, '#69db7c')} ${candy(400, 200, '#4dabf7')}
    <path fill="#ff922b" d="M240 270 L560 270 Q615 400 540 500 Q400 545 260 500 Q185 400 240 270 Z"/>
    <path d="M300 285 Q268 400 300 512 M500 285 Q532 400 500 512"/>
    <ellipse cx="400" cy="272" rx="165" ry="22" fill="#fd7e14"/>
    ${eye(345, 365, 18)} ${eye(455, 365, 18)}
    <circle cx="322" cy="410" r="16" fill="#ffc2c2"/><circle cx="478" cy="410" r="16" fill="#ffc2c2"/>
    <path fill="#ffe066" d="M345 420 Q400 485 455 420 Q400 445 345 420 Z"/>
    ${candy(150, 505, '#b197fc')} ${candy(660, 505, '#ffd43b')}
    ${ground(530)}`;

  const bone = (x1, y1, x2, y2, w = 18) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy * w / 2, py = ux * w / 2;
    const r = w * 0.55, k = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#f8f9fa"/>`;
    return k(x1 + px, y1 + py) + k(x1 - px, y1 - py) + k(x2 + px, y2 + py) + k(x2 - px, y2 - py) +
      `<path fill="#f8f9fa" d="M${f(x1 + px)} ${f(y1 + py)} L${f(x2 + px)} ${f(y2 + py)} L${f(x2 - px)} ${f(y2 - py)} L${f(x1 - px)} ${f(y1 - py)} Z"/>`;
  };
  const skeleton = `
    <circle cx="660" cy="110" r="55" fill="#fff3b0"/>
    ${sparkle(110, 100)} ${sparkle(150, 300, 12)} ${miniBat(560, 80, .8)}
    <path d="M640 400 Q636 380 650 370"/>
    <ellipse cx="640" cy="470" rx="70" ry="55" fill="#ff922b"/>
    <path d="M610 420 Q595 470 610 520 M670 420 Q685 470 670 520"/>
    ${bone(340, 330, 255, 255)} ${bone(460, 330, 520, 430)}
    <circle cx="245" cy="245" r="24" fill="#f8f9fa"/>
    <circle cx="525" cy="440" r="22" fill="#f8f9fa"/>
    ${bone(375, 455, 360, 505)} ${bone(425, 455, 440, 505)}
    <ellipse cx="345" cy="515" rx="32" ry="15" fill="#f8f9fa"/>
    <ellipse cx="455" cy="515" rx="32" ry="15" fill="#f8f9fa"/>
    <rect x="390" y="285" width="20" height="140" rx="6" fill="#f8f9fa"/>
    <rect x="330" y="315" width="140" height="18" rx="9" fill="#f8f9fa"/>
    <rect x="337" y="347" width="126" height="18" rx="9" fill="#f8f9fa"/>
    <rect x="346" y="379" width="108" height="18" rx="9" fill="#f8f9fa"/>
    <path fill="#f8f9fa" d="M345 420 Q400 405 455 420 L445 455 Q400 470 355 455 Z"/>
    <circle cx="400" cy="185" r="110" fill="#f8f9fa"/>
    <ellipse cx="358" cy="180" rx="30" ry="34" fill="#ced4da"/><ellipse cx="442" cy="180" rx="30" ry="34" fill="#ced4da"/>
    ${eye(360, 182, 15)} ${eye(444, 182, 15)}
    <path fill="#868e96" d="M390 218 L410 218 L400 234 Z"/>
    <circle cx="318" cy="228" r="16" fill="#ffc2d1"/><circle cx="482" cy="228" r="16" fill="#ffc2d1"/>
    <path d="M350 250 Q400 280 450 250 M375 260 L373 276 M400 265 L400 281 M425 260 L427 276"/>
    <path fill="#b197fc" d="M400 80 L362 62 L362 98 Z"/><path fill="#b197fc" d="M400 80 L438 62 L438 98 Z"/><circle cx="400" cy="80" r="11" fill="#9775fa"/>
    ${ground(530)}`;

  const vampire = `
    <circle cx="660" cy="105" r="55" fill="#fff3b0"/>
    ${miniBat(110, 140)} ${miniBat(600, 230, .8)} ${sparkle(140, 330, 12)} ${sparkle(680, 380, 14)}
    <path fill="#5f3dc4" d="M220 515 L300 300 L500 300 L580 515 Q400 485 220 515 Z"/>
    <path fill="#e03131" d="M300 300 L225 205 L345 268 Z"/>
    <path fill="#e03131" d="M500 300 L575 205 L455 268 Z"/>
    <path fill="#f1f3f5" d="M325 515 L345 320 L455 320 L475 515 Z"/>
    <path d="M400 360 L400 515"/>
    <circle cx="400" cy="395" r="6" fill="#ffd43b"/><circle cx="400" cy="440" r="6" fill="#ffd43b"/>
    <path fill="#e03131" d="M400 340 L370 322 L370 358 Z"/><path fill="#e03131" d="M400 340 L430 322 L430 358 Z"/><circle cx="400" cy="340" r="9" fill="#c92a2a"/>
    <circle cx="318" cy="440" r="24" fill="#ffe3e3"/><circle cx="482" cy="440" r="24" fill="#ffe3e3"/>
    <circle cx="400" cy="215" r="105" fill="#ffe3e3"/>
    <path fill="#495057" d="M296 205 Q290 105 400 105 Q510 105 504 205 Q460 160 400 185 Q340 160 296 205 Z"/>
    ${eye(360, 225, 14)} ${eye(440, 225, 14)}
    <circle cx="335" cy="262" r="16" fill="#ffc2d1"/><circle cx="465" cy="262" r="16" fill="#ffc2d1"/>
    <path fill="#f8f9fa" stroke-width="5" d="M380 279 L386 295 L393 283 Z"/>
    <path fill="#f8f9fa" stroke-width="5" d="M407 283 L414 295 L420 279 Z"/>
    <path d="M368 270 Q400 298 432 270"/>
    <ellipse cx="365" cy="522" rx="34" ry="14" fill="#495057"/>
    <ellipse cx="435" cy="522" rx="34" ry="14" fill="#495057"/>
    ${ground(530)}`;

  const broom = `
    <circle cx="650" cy="130" r="60" fill="#fff3b0"/>
    ${sparkle(90, 250, 12)} ${sparkle(250, 230, 18)} ${sparkle(250, 110, 14)} ${sparkle(420, 160)} ${sparkle(640, 300, 12)}
    ${miniBat(110, 470)} ${miniBat(400, 500, .8)}
    <path d="M60 330 Q120 300 190 320 M80 380 Q160 350 230 375"/>
    <path fill="#c08457" d="M136.6 157.7 L526.6 367.7 L513.4 392.3 L123.4 182.3 Z"/>
    <circle cx="128" cy="168" r="18" fill="#c08457"/>
    <path fill="#ffd43b" d="M529 340 L729 391 Q745 500 643 549 L491 410 Z"/>
    <path d="M520 375 L705 455 M535 352 L725 420 M505 395 L670 505"/>
    <path fill="#e03131" d="M469.5 403.9 L512.1 324.7 L538.5 339 L495.9 418.2 Z"/>
    <path fill="#b197fc" d="M500 420 L470 450 L505 460 Z"/><path fill="#b197fc" d="M500 420 L530 450 L495 465 Z"/>`;

  const wc = [330, 270], wr = [55, 105, 155, 200];
  const wp = (r, k) => { const a = k * Math.PI / 4; return [wc[0] + r * Math.cos(a), wc[1] + r * Math.sin(a)]; };
  const ring = (r, close) => {
    let d = `M${wp(r, 0).map(f).join(' ')}`;
    for (let k = 0; k < 8; k++) {
      const a = (k + .5) * Math.PI / 4, cr = r * .82;
      d += ` Q${f(wc[0] + cr * Math.cos(a))} ${f(wc[1] + cr * Math.sin(a))} ${wp(r, k + 1).map(f).join(' ')}`;
    }
    return d + (close ? ' Z' : '');
  };
  const spiderweb = `
    ${sparkle(640, 90, 14)} ${sparkle(110, 520, 12)} ${miniBat(560, 520, .8)}
    <path fill="#f3f0ff" d="${ring(wr[3], true)}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M${wc[0]} ${wc[1]} L${wp(wr[3], k).map(f).join(' ')}"/>`).join('')}
    ${wr.slice(0, 3).map(r => `<path d="${ring(r, false)}"/>`).join('')}
    <path d="M640 40 L640 325"/>
    <path d="M592 365 Q560 335 545 355 M588 385 Q555 375 540 395 M590 405 Q560 420 548 445 M600 425 Q580 455 575 480 M688 365 Q720 335 735 355 M692 385 Q725 375 740 395 M690 405 Q720 420 732 445 M680 425 Q700 455 705 480"/>
    <circle cx="640" cy="385" r="58" fill="#845ef7"/>
    ${eye(620, 375, 14)} ${eye(660, 375, 14)}
    <circle cx="605" cy="405" r="11" fill="#ffc2d1"/><circle cx="675" cy="405" r="11" fill="#ffc2d1"/>
    <path d="M622 405 Q640 422 658 405"/>`;

  const littleWitch = `
    ${sparkle(110, 110)} ${sparkle(690, 100, 16)} ${miniBat(600, 210, .8)}
    <path d="M140 435 Q136 418 150 410"/>
    <ellipse cx="150" cy="480" rx="62" ry="50" fill="#ff922b"/>
    <path d="M125 435 Q112 480 125 525 M175 435 Q188 480 175 525"/>
    <path fill="#ff922b" d="M288 200 Q265 340 325 345 L475 345 Q535 340 512 200 Z"/>
    <path fill="#9775fa" d="M290 520 Q325 410 355 320 L445 320 Q475 410 510 520 Z"/>
    <path fill="#69db7c" d="M355 320 L400 350 L445 320 L430 310 L370 310 Z"/>
    <circle cx="315" cy="430" r="22" fill="#ffe8cc"/>
    <path d="M500 420 L580 300"/>
    ${sparkle(585, 292, 30, '#ffd43b')}
    <circle cx="492" cy="425" r="22" fill="#ffe8cc"/>
    <circle cx="400" cy="235" r="88" fill="#ffe8cc"/>
    <path fill="#ff922b" d="M315 220 Q325 165 400 168 Q475 165 485 220 Q445 195 400 205 Q355 195 315 220 Z"/>
    ${eye(368, 245, 13)} ${eye(432, 245, 13)}
    <circle cx="345" cy="275" r="14" fill="#ffc2d1"/><circle cx="455" cy="275" r="14" fill="#ffc2d1"/>
    <path d="M378 280 Q400 298 422 280"/>
    <path fill="#7048e8" d="M325 172 Q370 115 405 45 Q440 62 485 52 Q448 90 475 172 Z"/>
    <path fill="#e64980" d="M338 142 L462 142 L468 168 L332 168 Z"/>
    <ellipse cx="400" cy="178" rx="150" ry="26" fill="#7048e8"/>
    ${sparkle(410, 115, 16)}
    <ellipse cx="365" cy="522" rx="34" ry="14" fill="#495057"/>
    <ellipse cx="435" cy="522" rx="34" ry="14" fill="#495057"/>
    ${ground(530)}`;

  window.ART.addPack({ drawings: [
    { id: 'library', cat: 'building', name: '圖書館', en: 'library', svg: library },
    { id: 'bakery', cat: 'building', name: '麵包店', en: 'bakery', svg: bakery },
    { id: 'castle', cat: 'building', name: '城堡', en: 'castle', svg: castle },
    { id: 'lighthouse', cat: 'building', name: '燈塔', en: 'lighthouse', svg: lighthouse },
    { id: 'barn', cat: 'building', name: '農場穀倉', en: 'barn', svg: barn },
    { id: 'ferris-wheel', cat: 'building', name: '摩天輪', en: 'Ferris wheel', svg: ferrisWheel },
    { id: 'playground', cat: 'building', name: '遊樂場溜滑梯', en: 'playground slide', svg: playground },
    { id: 'train-station', cat: 'building', name: '火車站', en: 'train station', svg: trainStation },
    { id: 'convenience-store', cat: 'building', name: '便利商店', en: 'convenience store', svg: convenienceStore },
    { id: 'my-house', cat: 'building', name: '我的家', en: 'my house', svg: myHouse },
    { id: 'black-cat', cat: 'halloween', name: '小黑貓', en: 'black cat', svg: blackCat },
    { id: 'candy-bucket', cat: 'halloween', name: '糖果桶', en: 'candy bucket', svg: candyBucket },
    { id: 'skeleton', cat: 'halloween', name: '小骷髏', en: 'skeleton', svg: skeleton },
    { id: 'vampire', cat: 'halloween', name: '小吸血鬼', en: 'little vampire', svg: vampire },
    { id: 'broom', cat: 'halloween', name: '魔法掃帚', en: 'broomstick', svg: broom },
    { id: 'spiderweb', cat: 'halloween', name: '蜘蛛網', en: 'spider web', svg: spiderweb },
    { id: 'little-witch', cat: 'halloween', name: '小女巫', en: 'little witch', svg: littleWitch },
  ] });
})();
