/* 線稿包：車車 */
(function () {
  const { eye, ground, wheel } = window.ART.helpers;

  // 粗管子（腳踏車、摩托車的車架）：兩端點 + 寬度 → 封閉四邊形
  const tube = (x1, y1, x2, y2, w, c) => {
    const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L * w / 2, ny = (x2 - x1) / L * w / 2;
    const p = (x, y) => `${(x).toFixed(1)} ${(y).toFixed(1)}`;
    return `<path fill="${c}" d="M${p(x1 + nx, y1 + ny)} L${p(x2 + nx, y2 + ny)} L${p(x2 - nx, y2 - ny)} L${p(x1 - nx, y1 - ny)} Z"/>`;
  };
  // 一排波浪海水（上緣波浪、下面封閉）
  const sea = (y, c = '#74c0fc') => {
    let d = `M30 ${y}`;
    for (let x = 30; x < 770; x += 92.5) d += ` Q${x + 46} ${y - 24} ${x + 92.5} ${y}`;
    return `<path fill="${c}" d="${d} L770 560 L30 560 Z"/>`;
  };
  // 腳踏車輪：外胎 + 輪框 + 輻條
  const bwheel = (x, y, r) => {
    const sp = [0, 1, 2, 3, 4, 5].map(i => {
      const a = i * Math.PI / 6;
      return `M${(x + r * .82 * Math.cos(a)).toFixed(1)} ${(y + r * .82 * Math.sin(a)).toFixed(1)} L${(x - r * .82 * Math.cos(a)).toFixed(1)} ${(y - r * .82 * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#555"/><circle cx="${x}" cy="${y}" r="${r * .82}" fill="#e7f5ff"/><path d="${sp}"/>`;
  };
  const hub = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ccc"/>`;
  const cloud = (x, y, s = 1, c = '#e7f5ff') =>
    `<path fill="${c}" d="M${x} ${y} Q${x - 5 * s} ${y - 40 * s} ${x + 35 * s} ${y - 38 * s} Q${x + 50 * s} ${y - 75 * s} ${x + 92 * s} ${y - 58 * s} Q${x + 130 * s} ${y - 70 * s} ${x + 140 * s} ${y - 32 * s} Q${x + 175 * s} ${y - 25 * s} ${x + 165 * s} ${y} Z"/>`;

  const taxi = `
    <rect x="395" y="160" width="100" height="44" rx="10" fill="#ff922b"/>
    <path fill="#ffd43b" d="M110 390 Q110 300 200 300 L255 300 L325 215 Q340 198 365 198 L525 198 Q550 198 565 218 L625 300 L665 300 Q710 300 710 345 L710 390 Q710 410 690 410 L130 410 Q110 410 110 390 Z"/>
    <path fill="#a8e0ff" d="M352 225 L297 295 L428 295 L428 225 Z"/>
    <path fill="#a8e0ff" d="M456 225 L456 295 L592 295 L548 235 Q541 225 528 225 Z"/>
    <rect x="160" y="345" width="520" height="28" fill="#fff3bf"/>
    <path d="M225 345 L225 373 M290 345 L290 373 M355 345 L355 373 M420 345 L420 373 M485 345 L485 373 M550 345 L550 373 M615 345 L615 373"/>
    <path d="M442 300 L442 345"/>
    <rect x="395" y="315" width="34" height="12" rx="6" fill="#ccc"/>
    <rect x="460" y="315" width="34" height="12" rx="6" fill="#ccc"/>
    <circle cx="688" cy="330" r="14" fill="#fff6a0"/>
    ${wheel(240, 410)} ${wheel(580, 410)}
    ${ground(462)}`;

  const ambulance = `
    <rect x="240" y="135" width="80" height="34" rx="10" fill="#ff6b6b"/>
    <rect x="90" y="165" width="425" height="235" rx="18" fill="#f1f3f5"/>
    <path fill="#f1f3f5" d="M500 215 L620 215 Q645 215 660 240 L705 320 L705 390 Q705 400 695 400 L500 400 Z"/>
    <path fill="#a8e0ff" d="M522 238 L612 238 Q626 238 634 252 L670 315 L522 315 Z"/>
    <rect x="90" y="330" width="615" height="24" fill="#ff6b6b"/>
    <path fill="#ff6b6b" d="M268 190 L312 190 L312 228 L350 228 L350 272 L312 272 L312 310 L268 310 L268 272 L230 272 L230 228 L268 228 Z"/>
    <path d="M430 175 L430 395"/>
    <circle cx="690" cy="378" r="11" fill="#fff6a0"/>
    ${wheel(210, 400, 50)} ${wheel(600, 400, 50)}
    ${ground(452)}`;

  const truck = `
    <rect x="495" y="345" width="40" height="45" fill="#868e96"/>
    <rect x="70" y="150" width="440" height="240" rx="14" fill="#74c0fc"/>
    <path d="M180 165 L180 375 M290 165 L290 375 M400 165 L400 375"/>
    <path fill="#ff922b" d="M520 200 L630 200 Q660 200 672 228 L712 320 L712 390 Q712 400 702 400 L520 400 Z"/>
    <path fill="#a8e0ff" d="M545 225 L625 225 Q640 225 646 240 L678 315 L545 315 Z"/>
    <rect x="550" y="335" width="34" height="12" rx="6" fill="#ccc"/>
    <circle cx="698" cy="360" r="12" fill="#fff6a0"/>
    <rect x="60" y="388" width="660" height="22" rx="8" fill="#868e96"/>
    ${wheel(170, 410, 48)} ${wheel(375, 410, 48)} ${wheel(620, 410, 48)}
    ${ground(458)}`;

  const motorcycle = `
    ${tube(520, 240, 600, 420, 24, '#adb5bd')}
    <rect x="235" y="400" width="200" height="24" rx="12" fill="#ced4da"/>
    ${wheel(200, 420, 78)} ${wheel(600, 420, 78)}
    <rect x="330" y="360" width="120" height="70" rx="14" fill="#adb5bd"/>
    <path fill="#ff6b6b" d="M180 335 Q195 300 260 300 L350 300 Q380 255 450 262 Q500 268 515 290 L545 345 Q470 385 380 385 L290 385 Q220 385 180 335 Z"/>
    <path fill="#495057" d="M230 302 Q240 268 290 268 L360 272 Q372 290 355 302 Z"/>
    ${tube(480, 232, 545, 225, 18, '#868e96')}
    <rect x="455" y="220" width="40" height="22" rx="10" fill="#495057"/>
    <circle cx="560" cy="290" r="24" fill="#ffe066"/>
    ${ground(498)}`;

  const bicycle = `
    ${bwheel(220, 400, 100)} ${bwheel(580, 400, 100)}
    ${tube(220, 400, 340, 255, 20, '#ff6b6b')}
    ${tube(220, 400, 385, 405, 20, '#ff6b6b')}
    ${tube(340, 245, 385, 405, 22, '#ff6b6b')}
    ${tube(340, 262, 545, 258, 22, '#ff6b6b')}
    ${tube(385, 405, 552, 300, 22, '#ff6b6b')}
    ${tube(538, 215, 580, 400, 20, '#ff6b6b')}
    ${tube(525, 205, 545, 175, 16, '#868e96')}
    <rect x="510" y="160" width="80" height="24" rx="12" fill="#495057"/>
    ${tube(340, 255, 330, 225, 14, '#868e96')}
    <path fill="#495057" d="M285 225 Q290 205 330 205 L380 210 Q392 222 380 232 L300 238 Q285 238 285 225 Z"/>
    <circle cx="385" cy="405" r="34" fill="#adb5bd"/>
    <rect x="395" y="440" width="44" height="16" rx="6" fill="#495057"/>
    ${hub(220, 400, 14)} ${hub(580, 400, 14)}
    ${ground(500)}`;

  const sailboat = `
    <circle cx="660" cy="125" r="50" fill="#ffd43b"/>
    <path fill="#ff922b" d="M170 395 L630 395 Q605 485 520 485 L275 485 Q200 485 170 395 Z"/>
    <rect x="392" y="85" width="16" height="312" fill="#a0522d"/>
    <path fill="#ff6b6b" d="M408 85 L475 102 L408 120 Z"/>
    <path fill="#fff3bf" d="M384 110 L384 375 Q280 380 190 375 Q290 260 384 110 Z"/>
    <path fill="#ffa8a8" d="M416 135 L416 375 L590 375 Q520 250 416 135 Z"/>
    <circle cx="290" cy="430" r="15" fill="#a5d8ff"/><circle cx="400" cy="430" r="15" fill="#a5d8ff"/><circle cx="510" cy="430" r="15" fill="#a5d8ff"/>
    ${sea(465)}`;

  const ship = `
    <circle cx="368" cy="102" r="22" fill="#e9ecef"/><circle cx="400" cy="78" r="26" fill="#e9ecef"/>
    <rect x="335" y="125" width="56" height="80" rx="6" fill="#4dabf7"/>
    <rect x="440" y="125" width="56" height="80" rx="6" fill="#4dabf7"/>
    <rect x="335" y="125" width="56" height="20" rx="6" fill="#ff6b6b"/>
    <rect x="440" y="125" width="56" height="20" rx="6" fill="#ff6b6b"/>
    <rect x="270" y="200" width="290" height="75" rx="12" fill="#fff3bf"/>
    <rect x="200" y="270" width="420" height="95" rx="12" fill="#f8f9fa"/>
    <rect x="300" y="218" width="50" height="38" rx="8" fill="#a5d8ff"/><rect x="390" y="218" width="50" height="38" rx="8" fill="#a5d8ff"/><rect x="480" y="218" width="50" height="38" rx="8" fill="#a5d8ff"/>
    <rect x="235" y="295" width="60" height="45" rx="8" fill="#a5d8ff"/><rect x="335" y="295" width="60" height="45" rx="8" fill="#a5d8ff"/><rect x="435" y="295" width="60" height="45" rx="8" fill="#a5d8ff"/><rect x="535" y="295" width="60" height="45" rx="8" fill="#a5d8ff"/>
    <path fill="#ff6b6b" d="M80 360 L720 360 L655 485 L150 485 Z"/>
    <path fill="#f8f9fa" d="M80 360 L720 360 L707 385 L93 385 Z"/>
    <circle cx="220" cy="425" r="17" fill="#a5d8ff"/><circle cx="330" cy="425" r="17" fill="#a5d8ff"/><circle cx="440" cy="425" r="17" fill="#a5d8ff"/><circle cx="550" cy="425" r="17" fill="#a5d8ff"/>
    ${sea(470)}`;

  const submarine = `
    <path fill="#adb5bd" d="M400 175 L400 85 L470 85 L470 108 L423 108 L423 175 Z"/>
    <rect x="290" y="160" width="170" height="110" rx="24" fill="#ffd43b"/>
    <rect x="55" y="315" width="50" height="50" rx="8" fill="#adb5bd"/>
    <ellipse cx="62" cy="282" rx="18" ry="40" fill="#ff922b"/>
    <ellipse cx="62" cy="398" rx="18" ry="40" fill="#ff922b"/>
    <ellipse cx="400" cy="340" rx="305" ry="130" fill="#ffd43b"/>
    <path fill="#ff922b" d="M150 290 L120 230 Q160 230 200 268 Z"/>
    <circle cx="290" cy="335" r="36" fill="#a5d8ff"/><circle cx="410" cy="335" r="36" fill="#a5d8ff"/><circle cx="530" cy="335" r="36" fill="#a5d8ff"/>
    <path d="M140 420 Q400 455 660 420"/>
    <circle cx="700" cy="190" r="20" fill="#d0ebff"/><circle cx="735" cy="135" r="14" fill="#d0ebff"/><circle cx="700" cy="90" r="10" fill="#d0ebff"/>`;

  const balloon = `
    ${cloud(60, 300, 1)} ${cloud(570, 210, 1.05)}
    <path d="M355 430 L340 470 M445 430 L460 470 M385 430 L385 465 M415 430 L415 465"/>
    <path fill="#ff6b6b" d="M400 55 C565 55 625 170 600 270 Q585 340 470 400 L330 400 Q215 340 200 270 C175 170 235 55 400 55 Z"/>
    <path fill="#ffd43b" d="M400 55 C470 55 502 170 492 270 Q482 340 440 400 L360 400 Q318 340 308 270 C298 170 330 55 400 55 Z"/>
    <path fill="#ff922b" d="M335 400 L465 400 L448 432 L352 432 Z"/>
    <rect x="330" y="470" width="140" height="78" rx="10" fill="#c08552"/>
    <rect x="318" y="460" width="164" height="20" rx="9" fill="#a0522d"/>
    <path d="M330 512 L470 512 M376 480 L376 548 M424 480 L424 548"/>`;

  const garbageTruck = `
    <path fill="#40c057" d="M75 255 L40 295 L40 380 L75 395 Z"/>
    <rect x="70" y="170" width="395" height="225" rx="24" fill="#69db7c"/>
    <path d="M150 185 L150 320 M380 185 L380 320"/>
    <circle cx="265" cy="255" r="48" fill="#ffe066"/>
    <rect x="70" y="330" width="395" height="24" fill="#fcc419"/>
    <path fill="#69db7c" d="M455 215 L610 215 Q640 215 655 240 L705 320 L705 390 Q705 400 695 400 L455 400 Z"/>
    <path fill="#a8e0ff" d="M478 238 L605 238 Q620 238 628 252 L668 318 L478 318 Z"/>
    <path d="M560 238 L560 318"/>
    <circle cx="690" cy="360" r="12" fill="#fff6a0"/>
    <rect x="55" y="385" width="660" height="22" rx="8" fill="#868e96"/>
    ${wheel(170, 407, 48)} ${wheel(360, 407, 48)} ${wheel(610, 407, 48)}
    ${ground(455)}`;

  const tractor = `
    <rect x="560" y="210" width="22" height="70" fill="#868e96"/>
    <rect x="552" y="198" width="38" height="18" rx="5" fill="#495057"/>
    <rect x="145" y="125" width="210" height="28" rx="10" fill="#ff6b6b"/>
    <path fill="#ff6b6b" d="M165 150 L335 150 L335 400 L165 400 Z"/>
    <rect x="188" y="172" width="125" height="105" rx="10" fill="#a8e0ff"/>
    <path fill="#ff6b6b" d="M330 270 L650 270 Q680 270 680 300 L680 400 L330 400 Z"/>
    <rect x="650" y="290" width="26" height="70" rx="6" fill="#ced4da"/>
    <path d="M400 290 L400 380 M440 290 L440 380 M480 290 L480 380"/>
    <circle cx="610" cy="300" r="14" fill="#fff6a0"/>
    ${wheel(230, 400, 115)}
    <path fill="#ffd43b" d="M95 385 Q95 245 230 245 Q365 245 365 385 L340 385 Q340 280 230 280 Q120 280 120 385 Z"/>
    ${wheel(590, 445, 70)}
    ${ground(515)}`;

  const racecar = `
    <rect x="115" y="245" width="22" height="80" fill="#868e96"/>
    <rect x="65" y="225" width="130" height="30" rx="10" fill="#ff6b6b"/>
    <path fill="#ff6b6b" d="M90 360 Q90 322 140 315 L300 300 Q340 252 420 252 Q482 252 502 300 L660 328 Q725 340 725 382 L725 395 Q725 410 705 410 L110 410 Q90 410 90 395 Z"/>
    <ellipse cx="410" cy="300" rx="75" ry="18" fill="#495057"/>
    <circle cx="405" cy="262" r="40" fill="#4dabf7"/>
    <path fill="#ffe066" d="M405 248 L445 248 Q450 270 432 278 L405 278 Z"/>
    <path d="M140 352 L690 352"/>
    <circle cx="470" cy="380" r="22" fill="#fff3bf"/>
    ${wheel(215, 410, 54)} ${wheel(600, 410, 54)}
    ${ground(464)}`;

  window.ART.addPack({ drawings: [
    { id: 'taxi', cat: 'car', name: '計程車', en: 'taxi', svg: taxi },
    { id: 'ambulance', cat: 'car', name: '救護車', en: 'ambulance', svg: ambulance },
    { id: 'truck', cat: 'car', name: '卡車', en: 'truck', svg: truck },
    { id: 'motorcycle', cat: 'car', name: '摩托車', en: 'motorcycle', svg: motorcycle },
    { id: 'bicycle', cat: 'car', name: '腳踏車', en: 'bicycle', svg: bicycle },
    { id: 'sailboat', cat: 'car', name: '帆船', en: 'sailboat', svg: sailboat },
    { id: 'ship', cat: 'car', name: '輪船', en: 'ship', svg: ship },
    { id: 'submarine', cat: 'car', name: '潛水艇', en: 'submarine', svg: submarine },
    { id: 'balloon', cat: 'car', name: '熱氣球', en: 'hot air balloon', svg: balloon },
    { id: 'garbage-truck', cat: 'car', name: '垃圾車', en: 'garbage truck', svg: garbageTruck },
    { id: 'tractor', cat: 'car', name: '拖拉機', en: 'tractor', svg: tractor },
    { id: 'racecar', cat: 'car', name: '跑車', en: 'race car', svg: racecar },
  ] });
})();
