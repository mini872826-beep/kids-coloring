/* 故事包：habits（由 stories-*.js 加進 window.BOOKS） */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  /* ---- 這個故事包自己用的小道具（同樣的卡通風格：#222 粗線、平塗） ---- */
  const L = 'stroke="#222" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  const prop = {
    // 行人紅綠燈：x 是燈桿中心，y 是地面；on = 'red' | 'green'
    light: (x, y, on) => `<g class="tap" data-anim="wiggle" data-sound="pop" ${L}>
      <rect x="${x - 8}" y="${y - 210}" width="16" height="210" fill="#868e96"/>
      <rect x="${x - 45}" y="${y - 340}" width="90" height="160" rx="18" fill="#343a40"/>
      <circle cx="${x}" cy="${y - 300}" r="28" fill="${on === 'red' ? '#ff4d4f' : '#5c3b3b'}"/>
      <circle cx="${x}" cy="${y - 222}" r="28" fill="${on === 'green' ? '#40c057' : '#2f4a35'}"/>
      ${on === 'red' ? `<circle cx="${x}" cy="${y - 300}" r="40" fill="none" stroke="#ff8787" stroke-width="4" class="twinkle"/>` : ''}
      ${on === 'green' ? `<circle cx="${x}" cy="${y - 222}" r="40" fill="none" stroke="#8ce99a" stroke-width="4" class="twinkle"/>` : ''}</g>`,
    // 斑馬線（畫在 scene.road() 的馬路上）
    crosswalk: (x = 300, w = 220) => `<rect x="${x - 10}" y="410" width="${w + 10}" height="70" fill="#8d8d8d"/>` + Array.from({ length: 6 }, (_, i) =>
      `<rect x="${x + i * w / 6}" y="412" width="${w / 12}" height="66" fill="#fff"/>`).join(''),
    // 一杯水
    cup: (x, y, s = 1, full = true) => `<g class="tap" data-anim="jump" data-sound="splash" ${L}>
      <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-50 -80 L50 -80 L40 60 Q38 70 28 70 L-28 70 Q-38 70 -40 60 Z" fill="#e7f5ff"/>
      ${full ? '<path d="M-46 -40 L46 -40 L40 60 Q38 70 28 70 L-28 70 Q-38 70 -40 60 Z" fill="#74c0fc" stroke="none"/><path d="M-46 -40 Q-23 -50 0 -40 Q23 -30 46 -40" fill="none" stroke="#fff" stroke-width="5"/>' : ''}
      <path d="M-50 -80 L50 -80 L40 60 Q38 70 28 70 L-28 70 Q-38 70 -40 60 Z" fill="none"/>
      <rect x="-32" y="-65" width="10" height="100" rx="5" fill="#fff" stroke="none" opacity=".7"/></g></g>`,
    // 汗珠／水滴
    drop: (x, y, r = 14, c = '#74c0fc') => `<path class="float" d="M${x} ${y - r * 1.8} Q${x + r} ${y - r * .3} ${x + r} ${y + r * .2} A${r} ${r} 0 0 1 ${x - r} ${y + r * .2} Q${x - r} ${y - r * .3} ${x} ${y - r * 1.8} Z" fill="${c}" stroke="#222" stroke-width="4"/>`,
    // 衣服：上衣、褲子、襪子、鞋子
    shirt: (x, y, c = '#ffa94d') => `<g class="tap" data-anim="wiggle" data-sound="pop" ${L}>
      <path d="M${x - 40} ${y - 70} L${x - 100} ${y - 40} L${x - 80} ${y} L${x - 55} ${y - 15} L${x - 55} ${y + 70} L${x + 55} ${y + 70} L${x + 55} ${y - 15} L${x + 80} ${y} L${x + 100} ${y - 40} L${x + 40} ${y - 70} Q${x} ${y - 40} ${x - 40} ${y - 70} Z" fill="${c}"/>
      <circle cx="${x}" cy="${y + 5}" r="16" fill="#fff3bf" stroke-width="4"/></g>`,
    pants: (x, y, c = '#4dabf7') => `<g class="tap" data-anim="wiggle" data-sound="pop" ${L}>
      <path d="M${x - 60} ${y - 70} L${x + 60} ${y - 70} L${x + 70} ${y + 70} L${x + 15} ${y + 70} L${x} ${y - 10} L${x - 15} ${y + 70} L${x - 70} ${y + 70} Z" fill="${c}"/>
      <path d="M${x - 60} ${y - 50} L${x + 60} ${y - 50}" stroke-width="4"/></g>`,
    socks: (x, y) => `<g class="tap" data-anim="jump" data-sound="pop" ${L}>${[0, 60].map(dx =>
      `<path d="M${x + dx - 20} ${y - 50} L${x + dx + 10} ${y - 50} L${x + dx + 10} ${y + 10} L${x + dx + 35} ${y + 10} Q${x + dx + 45} ${y + 30} ${x + dx + 30} ${y + 35} L${x + dx - 20} ${y + 35} Z" fill="#fff"/><path d="M${x + dx - 20} ${y - 35} L${x + dx + 10} ${y - 35}" stroke="#ff6b6b" stroke-width="6"/>`).join('')}</g>`,
    shoes: (x, y) => `<g class="tap" data-anim="jump" data-sound="boing" ${L}>${[0, 90].map(dx =>
      `<path d="M${x + dx - 40} ${y + 20} L${x + dx - 40} ${y - 20} Q${x + dx - 15} ${y - 30} ${x + dx} ${y - 10} Q${x + dx + 30} ${y - 5} ${x + dx + 40} ${y + 10} L${x + dx + 40} ${y + 20} Z" fill="#ff6b6b"/><path d="M${x + dx - 40} ${y + 20} L${x + dx + 40} ${y + 20}" stroke-width="8"/>`).join('')}</g>`,
    // 平板、電視
    tablet: (x, y, s = 1) => `<g class="tap" data-anim="wiggle" data-sound="pop" ${L}><g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-70" y="-95" width="140" height="190" rx="18" fill="#495057"/><rect x="-55" y="-78" width="110" height="150" rx="6" fill="#a5d8ff"/>
      <circle cx="-15" cy="-20" r="16" fill="#ffd43b" stroke-width="4"/><path d="M-50 60 L-15 15 L10 40 L30 20 L55 60 Z" fill="#69db7c" stroke-width="4"/>
      <circle cx="0" cy="84" r="5" fill="#adb5bd" stroke="none"/></g></g>`,
    tv: (x, y, s = 1) => `<g class="tap" data-anim="boing" data-sound="pop" ${L}><g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-30 -110 L0 -80 L30 -110" fill="none"/>
      <rect x="-120" y="-80" width="240" height="160" rx="18" fill="#868e96"/><rect x="-100" y="-62" width="200" height="124" rx="8" fill="#fff3bf"/>
      <circle cx="-30" cy="0" r="22" fill="#ff8787" stroke-width="4"/><circle cx="35" cy="5" r="18" fill="#74c0fc" stroke-width="4"/>
      <path d="M-60 80 L-75 105 M60 80 L75 105"/></g></g>`,
    // 累累的眼睛（螺旋）
    dizzy: (x, y) => `<g class="float" fill="none" stroke="#e8590c" stroke-width="7" stroke-linecap="round"><path d="M${x} ${y} m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0 a24 24 0 1 1 -48 0 a30 30 0 1 1 60 0"/></g>`,
    // 遠遠的小樹
    farTree: (x, y, s = .45) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="tap sway" data-anim="wiggle" data-sound="pop" stroke="#222" stroke-width="8">
      <rect x="-12" y="-90" width="24" height="90" fill="#9c6b3c"/><circle cx="0" cy="-120" r="55" fill="#55b85a"/><circle cx="-35" cy="-95" r="35" fill="#55b85a"/><circle cx="35" cy="-95" r="35" fill="#55b85a"/></g></g>`,
    // 醫生用的聽診器、OK 繃、溫度計
    stethoscope: (x, y) => `<g class="tap" data-anim="wiggle" data-sound="pop" fill="none" ${L}>
      <path d="M${x - 40} ${y - 80} Q${x - 50} ${y} ${x} ${y + 10} Q${x + 50} ${y} ${x + 40} ${y - 80}" stroke="#495057" stroke-width="8"/>
      <path d="M${x} ${y + 10} Q${x + 10} ${y + 60} ${x + 60} ${y + 60}" stroke="#495057" stroke-width="8"/>
      <circle cx="${x + 75}" cy="${y + 60}" r="20" fill="#adb5bd"/></g>`,
    bandage: (x, y, rot = -20) => `<g class="tap" data-anim="boing" data-sound="twinkle" ${L}><g transform="rotate(${rot} ${x} ${y})">
      <rect x="${x - 70}" y="${y - 22}" width="140" height="44" rx="22" fill="#ffd8a8"/><rect x="${x - 24}" y="${y - 22}" width="48" height="44" fill="#ffe8cc" stroke-width="4"/>
      ${[-12, 0, 12].map(dx => `<circle cx="${x + dx}" cy="${y}" r="3" fill="#e8a87c" stroke="none"/>`).join('')}</g></g>`,
    thermo: (x, y) => `<g class="tap" data-anim="wiggle" data-sound="pop" ${L}><g transform="rotate(25 ${x} ${y})">
      <rect x="${x - 12}" y="${y - 100}" width="24" height="110" rx="12" fill="#fff"/><circle cx="${x}" cy="${y + 20}" r="20" fill="#ff6b6b"/>
      <rect x="${x - 5}" y="${y - 70}" width="10" height="80" fill="#ff6b6b" stroke="none"/></g></g>`,
    // 貼紙（星星）
    sticker: (x, y, r = 50) => `<g class="tap" data-anim="spin" data-sound="twinkle"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#222" stroke-width="5"/>
      <path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .38 : r * .8; return `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`; }).join(' ')} Z" fill="#ffd43b" stroke="#222" stroke-width="4" stroke-linejoin="round"/></g>`,
    // 室內（牆＋地板）
    room: (wall = '#fff4e6', floor = '#e9c89b') => `<rect width="800" height="500" fill="${wall}"/><rect y="390" width="800" height="110" fill="${floor}"/><path d="M0 390 L800 390" stroke="#222" stroke-width="5"/>`,
    // 醫院診間
    clinic: () => `<rect width="800" height="500" fill="#e3fafc"/><rect y="390" width="800" height="110" fill="#c5f6fa"/><path d="M0 390 L800 390" stroke="#222" stroke-width="5"/>
      <g stroke="#222" stroke-width="5"><rect x="640" y="60" width="110" height="110" rx="12" fill="#fff"/><path d="M695 85 L695 145 M665 115 L725 115" stroke="#ff6b6b" stroke-width="16" stroke-linecap="round"/></g>`,
  };

  window.BOOKS.push(
    /* 1. 勇敢看醫生 */
    {
      id: 'brave-doctor', tag: '習慣', title: '熊貓寶寶勇敢看醫生',
      cover: svg(scene.day() + scene.sun() + scene.grass() + put('hospital', 300, 20, 520) + put('panda', -10, 170, 360) + prop.sticker(330, 110, 44)),
      pages: [
        { text: '熊貓寶寶咳咳咳，身體熱熱的，好不舒服。', art: svg(prop.room() + put('panda', 120, 100, 400, 'wiggle', 'boing') + prop.thermo(600, 260) + prop.drop(250, 150, 12)) },
        { text: '媽媽說：「我們去醫院，給醫生看一看。」', art: svg(scene.day() + scene.sun(90) + scene.grass() + put('hospital', 280, 10, 560) + put('panda', -40, 200, 320, 'jump', 'pop')) },
        { text: '熊貓寶寶有一點害怕，緊緊抱住媽媽。', art: svg(prop.clinic() + put('panda', 20, 40, 480) + put('panda', 300, 200, 300, 'wiggle', 'boing') + scene.heart(380, 230, 26)) },
        { text: '大象醫生笑咪咪，用聽診器聽一聽。', art: svg(prop.clinic() + put('elephant', -40, 60, 460, 'boing', 'boing') + put('panda', 330, 150, 380) + prop.stethoscope(390, 290)) },
        { text: '要打針了，深呼吸，一、二、三，不哭不哭！', art: svg(prop.clinic() + put('panda', 300, 100, 400, 'jump', 'twinkle') + prop.bandage(170, 330) + scene.bubble(40, 40, '一、二、三！', 260)) },
        { text: '醫生說：「你好勇敢！」還送給你一張貼紙。', art: svg(prop.clinic() + put('elephant', -40, 70, 440) + put('panda', 350, 160, 360, 'jump', 'yay') + prop.sticker(720, 320, 46) + scene.bubble(60, 30, '你好勇敢！', 240)) },
        { text: '生病不要怕，勇敢看醫生，身體很快就會好喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('panda', 150, 90, 420, 'jump', 'yay') + scene.heart(130, 140) + scene.heart(660, 200, 24) + scene.stars()) },
      ],
    },

    /* 2. 過馬路要小心 */
    {
      id: 'cross-road', tag: '習慣', title: '小猴子過馬路',
      cover: svg(scene.day() + scene.sun() + scene.road() + prop.crosswalk(320, 200) + prop.light(130, 420, 'green') + put('monkey', 240, 140, 360)),
      pages: [
        { text: '小猴子和媽媽，要一起去公園玩。', art: svg(scene.day() + scene.sun() + scene.grass() + scene.tree(700) + put('monkey', -20, 30, 500) + put('monkey', 330, 180, 330, 'jump', 'boing')) },
        { text: '來到馬路邊，車子咻咻咻地開過去。', art: svg(scene.day() + scene.road() + put('car', 400, 260, 300, 'wiggle', 'pop') + put('bus', -40, 210, 360, 'wiggle', 'pop') + put('monkey', 540, 215, 260)) },
        { text: '先停下來！紅燈亮了，要等一等。', art: svg(scene.day() + scene.road() + prop.light(560, 420, 'red') + put('monkey', 0, 70, 460, 'wiggle', 'boing') + scene.bubble(470, 20, '等一等', 200)) },
        { text: '綠燈亮了！再左看看、右看看，有沒有車子。', art: svg(scene.day() + scene.road() + prop.light(660, 420, 'green') + put('monkey', 120, 80, 440, 'boing', 'pop') + scene.bubble(30, 20, '左看看', 180) + scene.bubble(410, 20, '右看看', 180)) },
        { text: '牽好媽媽的手，走在白白的斑馬線上。', art: svg(scene.day() + scene.road() + prop.crosswalk(250, 300) + prop.light(700, 420, 'green') + put('monkey', 60, 20, 420) + put('monkey', 310, 130, 300, 'jump', 'boing') + scene.heart(370, 150, 22)) },
        { text: '平平安安到公園，可以開心玩溜滑梯囉！', art: svg(scene.day() + scene.sun(110) + scene.grass() + put('playground', 260, 0, 600) + put('monkey', -50, 150, 380, 'jump', 'yay')) },
        { text: '過馬路，要看紅綠燈、看左右，還要牽好手！', art: svg(scene.day() + scene.sun() + scene.road() + prop.crosswalk(330, 200) + prop.light(120, 420, 'green') + put('monkey', 230, 90, 420, 'jump', 'yay') + scene.stars()) },
      ],
    },

    /* 3. 自己穿衣服 */
    {
      id: 'dress-self', tag: '習慣', title: '無尾熊自己穿衣服',
      cover: svg(prop.room('#e7f5ff') + put('koala', 0, 70, 440) + prop.shirt(530, 200) + prop.pants(680, 300) + prop.shoes(500, 440)),
      pages: [
        { text: '早上起床囉！無尾熊說：「我要自己穿衣服。」', art: svg(prop.room('#e7f5ff') + scene.sun(690, 90) + put('koala', 40, 90, 420, 'jump', 'boing') + scene.bubble(440, 170, '我自己來！', 260)) },
        { text: '先穿上衣，頭鑽出來，小手伸出來。', art: svg(prop.room('#e7f5ff') + put('koala', -20, 90, 420, 'wiggle', 'pop') + prop.shirt(580, 250)) },
        { text: '再穿褲褲，一隻腳、兩隻腳，拉上來。', art: svg(prop.room('#e7f5ff') + put('koala', -20, 90, 420, 'jump', 'boing') + prop.pants(580, 260)) },
        { text: '穿上襪子，再把小鞋子穿好。', art: svg(prop.room('#e7f5ff') + put('koala', -20, 90, 420, 'boing', 'boing') + prop.socks(520, 270) + prop.shoes(540, 440)) },
        { text: '哎呀，穿反了！沒關係，慢慢再試一次。', art: svg(prop.room('#e7f5ff') + put('koala', 30, 90, 420, 'wiggle', 'boing') + `<g transform="rotate(180 600 250)">${prop.shirt(600, 250)}</g>` + scene.bubble(470, 30, '再試一次', 240)) },
        { text: '媽媽拍拍手說：「你自己穿好了，好棒喔！」', art: svg(prop.room('#e7f5ff') + put('koala', 140, 90, 420, 'jump', 'yay') + scene.heart(120, 150) + scene.heart(680, 170, 26) + scene.bubble(470, 30, '好棒喔！', 220)) },
        { text: '自己的事情自己做，我長大了！', art: svg(scene.day() + scene.sun() + scene.grass() + put('koala', 150, 90, 420, 'jump', 'yay') + scene.stars()) },
      ],
    },

    /* 4. 多喝水 */
    {
      id: 'drink-water', tag: '習慣', title: '小河馬愛喝水',
      cover: svg(scene.day() + scene.sun() + scene.grass() + put('hippo', 20, 100, 420) + prop.cup(590, 330, 1.3)),
      pages: [
        { text: '太陽好大，小河馬跑來跑去，流了好多汗。', art: svg(scene.day() + scene.sun() + scene.grass() + scene.tree(690) + put('hippo', 120, 100, 420, 'jump', 'boing') + prop.drop(260, 170) + prop.drop(560, 200, 12)) },
        { text: '小河馬口好渴，想喝甜甜的飲料。', art: svg(scene.day() + scene.sun() + scene.grass() + put('hippo', -20, 100, 420, 'wiggle', 'boing') + put('d-bubbletea', 420, 160, 340)) },
        { text: '媽媽說：「口渴的時候，喝白開水最好喔。」', art: svg(scene.day() + scene.grass() + put('hippo', -20, 100, 420) + prop.cup(580, 320, 1.3) + scene.heart(580, 120, 28)) },
        { text: '咕嚕咕嚕，一杯水喝下去，好舒服！', art: svg(scene.day() + scene.grass() + put('hippo', -20, 100, 420, 'boing', 'splash') + prop.cup(570, 320, 1.3, false) + scene.bubble(460, 30, '咕嚕咕嚕', 240)) },
        { text: '喝飽了水，小河馬又有力氣，繼續玩囉！', art: svg(scene.day() + scene.sun(110) + scene.grass() + put('playground', 260, 0, 600) + put('hippo', -50, 140, 380, 'jump', 'yay')) },
        { text: '每天多喝水，身體健康又有精神！', art: svg(scene.day() + scene.sun() + scene.grass() + put('hippo', 50, 100, 420, 'jump', 'yay') + prop.cup(600, 330, 1.2) + scene.stars()) },
      ],
    },

    /* 5. 眼睛要休息 */
    {
      id: 'rest-eyes', tag: '習慣', title: '貓頭鷹的眼睛要休息',
      cover: svg(scene.day() + scene.grass() + prop.farTree(560, 385) + prop.farTree(660, 385, .35) + prop.farTree(740, 385, .5) + put('owl', 0, 80, 440)),
      pages: [
        { text: '小貓頭鷹最喜歡看平板，看了好久好久。', art: svg(prop.room('#fff4e6') + put('owl', 0, 80, 440, 'boing', 'pop') + prop.tablet(590, 260)) },
        { text: '看完平板又看電視，眼睛一直盯著螢幕。', art: svg(prop.room('#fff4e6') + put('owl', -30, 80, 440) + prop.tv(590, 230) + prop.tablet(470, 420, .5)) },
        { text: '揉一揉眼睛，哎呀，眼睛好累、好痠喔。', art: svg(prop.room('#fff4e6') + put('owl', 140, 70, 440, 'wiggle', 'boing') + prop.dizzy(250, 140) + prop.dizzy(560, 140) + prop.drop(600, 260, 14)) },
        { text: '貓頭鷹奶奶說：「眼睛也要休息一下喔。」', art: svg(prop.room('#fff4e6') + put('owl', -40, 30, 480) + put('owl', 380, 170, 300, 'boing', 'pop') + scene.heart(620, 150, 24)) },
        { text: '小貓頭鷹走到外面，看看遠遠的綠色大樹。', art: svg(scene.day() + scene.sun() + scene.grass() + prop.farTree(420, 385) + prop.farTree(520, 385, .35) + prop.farTree(610, 385, .5) + prop.farTree(720, 385, .4) + put('owl', -30, 80, 440, 'jump', 'twinkle')) },
        { text: '再閉上眼睛，慢慢數到十，眼睛舒服多了。', art: svg(scene.day() + scene.grass() + scene.tree(680) + put('owl', 120, 80, 440, 'boing', 'twinkle') + scene.bubble(30, 30, '1、2、3…10', 250)) },
        { text: '看螢幕不要太久，常常看看遠方，眼睛亮晶晶！', art: svg(scene.day() + scene.sun() + scene.grass() + prop.farTree(600, 385) + prop.farTree(720, 385, .35) + put('owl', 80, 80, 440, 'jump', 'yay') + scene.stars()) },
      ],
    },
  );
})();
