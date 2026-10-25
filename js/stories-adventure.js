/* 故事包：adventure（由 stories-*.js 加進 window.BOOKS） */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  /* ---- 這個故事包自己用的小道具（同樣的卡通風：#222 粗線、平塗色） ---- */
  const L = 'stroke="#222" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  const prop = {
    // 帳篷：x 是中心，y 是地面
    tent: (x, y, w = 260, c = '#ff922b') => {
      const h = w * 0.75, hw = w / 2;
      return `<g class="tap" data-anim="boing" data-sound="pop">
        <path d="M${x - hw} ${y} L${x} ${y - h} L${x + hw} ${y} Z" fill="${c}" ${L}/>
        <path d="M${x} ${y - h} L${x - hw * .3} ${y} L${x + hw * .3} ${y} Z" fill="#7a3a12" ${L}/>
        <path d="M${x} ${y - h} L${x} ${y - h - 30}" ${L}/><path d="M${x} ${y - h - 30} L${x + 34} ${y - h - 20} L${x} ${y - h - 10} Z" fill="#ffd43b" ${L}/>
        <path d="M${x - hw - 20} ${y} L${x + hw + 20} ${y}" ${L}/></g>`;
    },
    // 營火：x 中心，y 地面
    campfire: (x, y, s = 1) => `<g class="tap" data-anim="wiggle" data-sound="pop" transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="-30" rx="110" ry="80" fill="#ffe066" opacity=".35"/>
      <path class="twinkle" d="M-45 -20 Q-55 -80 -15 -120 Q-10 -85 5 -95 Q15 -140 0 -165 Q60 -120 45 -60 Q60 -70 58 -95 Q85 -50 45 -20 Z" fill="#ff922b" ${L}/>
      <path d="M-20 -22 Q-25 -60 0 -80 Q5 -55 18 -62 Q35 -40 20 -22 Z" fill="#ffd43b" stroke="#222" stroke-width="4" stroke-linejoin="round"/>
      <rect x="-80" y="-24" width="160" height="22" rx="11" fill="#9c6b3c" ${L} transform="rotate(12)"/>
      <rect x="-80" y="-24" width="160" height="22" rx="11" fill="#b5803f" ${L} transform="rotate(-12)"/></g>`,
    // 寶箱：x 中心，y 底部
    chest: (x, y, open = false) => `<g class="tap" data-anim="boing" data-sound="twinkle">
      ${open ? `<ellipse cx="${x}" cy="${y - 120}" rx="150" ry="90" fill="#fff3bf" opacity=".6"/>
        <path d="M${x - 110} ${y - 110} L${x - 120} ${y - 200} Q${x} ${y - 230} ${x + 120} ${y - 200} L${x + 110} ${y - 110} Z" fill="#a0612a" ${L}/>
        ${[-60, -20, 20, 60, -40, 0, 40].map((dx, i) => `<circle cx="${x + dx}" cy="${y - 112 - (i > 3 ? 22 : 0)}" r="20" fill="#ffd43b" stroke="#222" stroke-width="4"/>`).join('')}
        <path d="M${x + 15} ${y - 160} l7 14 l15 2 l-11 10 l3 15 l-14 -7 l-14 7 l3 -15 l-11 -10 l15 -2 z" fill="#ff8fab" stroke="#222" stroke-width="4" stroke-linejoin="round"/>`
        : `<path d="M${x - 110} ${y - 110} Q${x} ${y - 190} ${x + 110} ${y - 110} Z" fill="#a0612a" ${L}/>`}
      <rect x="${x - 110}" y="${y - 110}" width="220" height="110" rx="10" fill="#c98a4b" ${L}/>
      <rect x="${x - 70}" y="${y - 110}" width="24" height="110" fill="#ffd43b" ${L}/><rect x="${x + 46}" y="${y - 110}" width="24" height="110" fill="#ffd43b" ${L}/>
      <rect x="${x - 18}" y="${y - 92}" width="36" height="40" rx="6" fill="#ffd43b" ${L}/><circle cx="${x}" cy="${y - 74}" r="5" fill="#222"/></g>`,
    // 鐵軌：y 是軌道上緣
    rails: (y = 430) => `<rect y="${y - 30}" width="800" height="${530 - y}" fill="#9be07a"/>
      ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 50 - 10}" y="${y - 6}" width="22" height="40" rx="4" fill="#9c6b3c" stroke="#222" stroke-width="4"/>`).join('')}
      <path d="M0 ${y + 4} L800 ${y + 4} M0 ${y + 24} L800 ${y + 24}" stroke="#868e96" stroke-width="8"/>
      <path d="M0 ${y} L800 ${y} M0 ${y + 28} L800 ${y + 28}" stroke="#222" stroke-width="3"/>`,
    // 城市：高高的大樓（像 101）＋小房子
    city: () => `<g stroke="#222" stroke-width="5" stroke-linejoin="round">
      <rect x="60" y="250" width="110" height="160" fill="#a5d8ff"/><rect x="190" y="290" width="90" height="120" fill="#ffc9de"/>
      <rect x="560" y="270" width="100" height="140" fill="#d0bfff"/><rect x="670" y="230" width="100" height="180" fill="#ffe066"/>
      ${[80, 120, 210, 245, 580, 620, 690, 730].map((x, i) => [0, 1, 2].map(r => `<rect x="${x}" y="${(i < 2 ? 275 : i < 4 ? 310 : i < 6 ? 295 : 255) + r * 40}" width="22" height="22" fill="#fff" stroke-width="3"/>`).join('')).join('')}
      <g class="tap" data-anim="wiggle" data-sound="twinkle">
        <path d="M398 20 L398 60" stroke-width="6"/>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${360} ${60 + i * 42} L${436} ${60 + i * 42} L${448} ${102 + i * 42} L${348} ${102 + i * 42} Z" fill="#74c0fc"/>`).join('')}
        <rect x="340" y="354" width="116" height="56" fill="#4dabf7"/></g></g>`,
    // 湖：天空＋遠山＋大大的湖
    lake: () => `<rect width="800" height="500" fill="#bfe8ff"/>
      <path d="M-20 330 L150 170 L280 280 L420 150 L580 290 L700 200 L820 290 L820 340 L-20 340 Z" fill="#69db7c" ${L}/>
      <path d="M-20 330 Q400 310 820 330 L820 500 L-20 500 Z" fill="#4dabf7" ${L}/>
      <path d="M80 390 Q120 380 160 390 M520 420 Q570 408 620 420 M300 460 Q340 450 380 460" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" class="wave"/>`,
    // 海邊的高山（花蓮）：畫在 beach() 後面，只蓋住天空下緣
    coastHills: () => `<path d="M-20 236 L120 110 L230 190 L380 80 L540 200 L660 120 L820 220 L820 236 Z" fill="#69db7c" ${L}/>`,
    // 竹子
    bamboo: x => `<g class="tap sway" data-anim="wiggle" data-sound="pop">${[0, 1, 2, 3].map(i => `<rect x="${x - 14}" y="${390 - (i + 1) * 70}" width="28" height="70" rx="6" fill="#69db7c" stroke="#222" stroke-width="5"/>`).join('')}
      <path d="M${x} ${180} Q${x + 50} ${160} ${x + 70} ${180} Q${x + 40} ${190} ${x} ${180} Z M${x} ${250} Q${x - 50} ${230} ${x - 70} ${250} Q${x - 40} ${260} ${x} ${250} Z" fill="#40c057" stroke="#222" stroke-width="4"/></g>`,
    // 椰子樹
    palm: (x, y = 400) => `<g class="tap sway" data-anim="wiggle" data-sound="pop"><path d="M${x} ${y} Q${x - 20} ${y - 100} ${x + 10} ${y - 200}" fill="none" stroke="#9c6b3c" stroke-width="22" stroke-linecap="round"/>
      ${[-150, -100, -40, 20, 80].map(a => `<path d="M${x + 10} ${y - 200} q${70 * Math.cos(a * Math.PI / 180)} ${70 * Math.sin(a * Math.PI / 180) - 20} ${110 * Math.cos(a * Math.PI / 180)} ${110 * Math.sin(a * Math.PI / 180) + 30}" fill="none" stroke="#2f9e44" stroke-width="18" stroke-linecap="round"/>`).join('')}
      <circle cx="${x}" cy="${y - 190}" r="12" fill="#8a5a2b" stroke="#222" stroke-width="3"/><circle cx="${x + 20}" cy="${y - 188}" r="12" fill="#8a5a2b" stroke="#222" stroke-width="3"/></g>`,
    // 大石頭（海底）
    rock: (x, y, w = 240) => `<g class="tap" data-anim="wiggle" data-sound="pop"><path d="M${x - w / 2} ${y} Q${x - w / 2} ${y - w * .5} ${x - w * .1} ${y - w * .55} Q${x + w * .3} ${y - w * .6} ${x + w / 2} ${y - w * .2} L${x + w / 2} ${y} Z" fill="#868e96" ${L}/>
      <path d="M${x - w * .25} ${y - w * .3} Q${x - w * .1} ${y - w * .4} ${x + w * .05} ${y - w * .35}" fill="none" stroke="#adb5bd" stroke-width="8" stroke-linecap="round"/></g>`,
    // 螢火蟲的小光點
    glows: pts => pts.map(([x, y], i) => `<g class="twinkle tap" data-anim="boing" data-sound="twinkle" style="animation-delay:${i * .25}s"><circle cx="${x}" cy="${y}" r="18" fill="#ffe066" opacity=".45"/><circle cx="${x}" cy="${y}" r="7" fill="#fff9db"/></g>`).join(''),
    // 動物園大門
    zooGate: () => `<g ${L}><rect x="150" y="150" width="50" height="260" fill="#c98a4b"/><rect x="600" y="150" width="50" height="260" fill="#c98a4b"/>
      <path d="M130 170 Q400 40 670 170 L670 220 Q400 100 130 220 Z" fill="#69db7c"/></g>
      <text x="400" y="178" text-anchor="middle" font-size="52" font-weight="900" fill="#fff" stroke="#222" stroke-width="5" paint-order="stroke" font-family="Chiron GoRound TC, PingFang TC, sans-serif">動物園</text>`,
    // 樹枝（給無尾熊、猴子用）
    bigTree: (x) => `<g class="tap" data-anim="wiggle" data-sound="pop"><rect x="${x - 26}" y="140" width="52" height="260" fill="#9c6b3c" ${L}/>
      <circle cx="${x}" cy="110" r="90" fill="#55b85a" ${L}/><circle cx="${x - 80}" cy="150" r="55" fill="#55b85a" ${L}/><circle cx="${x + 80}" cy="150" r="55" fill="#55b85a" ${L}/></g>`,
  };

  window.BOOKS.push(
    /* ======== 1. 恐龍島 ======== */
    {
      id: 'dino-island', tag: '冒險',
      title: '恐龍島大冒險',
      cover: svg(scene.day() + scene.grass() + put('volcano', 470, 60, 320) + put('trex', 60, 110, 420)),
      pages: [
        { text: '坐著小船出發囉！前面就是恐龍島。', art: svg(scene.beach() + put('volcano', 430, 40, 300, 'boing', 'boing') + prop.palm(150, 400) + scene.boat(380, 330)) },
        { text: '咚咚咚！霸王龍來了，牙齒好大喔。', art: svg(scene.day() + scene.grass() + scene.tree(690) + put('trex', 140, 60, 500, 'boing', 'roar')) },
        { text: '三角龍有三根角，長頸龍脖子好長好長。', art: svg(scene.day() + scene.sun(90) + scene.grass() + put('trike', 20, 190, 360, 'jump', 'roar') + put('longneck', 370, 60, 440, 'boing', 'roar')) },
        { text: '劍龍背上有尖尖的板子，翼龍在天上飛！', art: svg(scene.day() + scene.grass() + put('stego', 40, 170, 420, 'wiggle', 'roar') + put('ptero', 450, 20, 320, 'jump', 'twinkle')) },
        { text: '棘龍在河邊抓魚，迅猛龍跑得好快。', art: svg(scene.day() + scene.mountains() + scene.river() + put('spino', 0, 160, 380, 'boing', 'splash') + put('raptor', 470, 200, 320, 'jump', 'roar')) },
        { text: '草叢裡有恐龍蛋，喀啦！寶寶出生了！', art: svg(scene.day() + scene.grass() + scene.flowers() + put('dino-nest', 60, 170, 340, 'wiggle', 'pop') + put('dinoegg', 420, 150, 340, 'jump', 'yay')) },
        { text: '恐龍們揮揮手：「再見，下次再來玩！」', art: svg(scene.sunset() + put('volcano', 260, 40, 280) + put('longneck', 20, 140, 330, 'boing', 'roar') + put('trex', 470, 150, 320, 'jump', 'roar') + scene.boat(400, 440)) },
      ],
    },

    /* ======== 2. 小火車環島 ======== */
    {
      id: 'train-trip', tag: '冒險',
      title: '小火車環島去',
      cover: svg(scene.day() + scene.sun() + prop.rails(430) + put('train', 180, 150, 440)),
      pages: [
        { text: '嘟嘟！小火車出發，要繞台灣一圈囉。', art: svg(scene.day() + scene.sun() + prop.rails(430) + put('train-station', 30, 140, 330, 'boing', 'pop') + put('train', 380, 200, 380, 'jump', 'boing')) },
        { text: '第一站台北，大樓好高好高喔！', art: svg(scene.day() + prop.city() + prop.rails(430) + put('train', 420, 250, 260, 'jump', 'boing')) },
        { text: '來到日月潭，湖水藍藍的，小船划呀划。', art: svg(prop.lake() + scene.sun(680, 70) + scene.boat(420, 390) + scene.birds(2)) },
        { text: '嘿咻嘿咻，爬上阿里山，好多大樹！', art: svg(scene.day() + scene.mountains() + scene.tree(110, 400) + scene.tree(690, 420) + put('train', 230, 230, 340, 'jump', 'boing')) },
        { text: '到了墾丁，沙灘上有寄居蟹和貝殼。', art: svg(scene.beach() + scene.sun() + prop.palm(90, 420) + put('hermit', 220, 270, 260, 'wiggle', 'pop') + put('shell', 500, 320, 200, 'jump', 'splash')) },
        { text: '花蓮的大海好藍，海豚跳出來打招呼！', art: svg(scene.beach() + prop.coastHills() + put('dolphin', 230, 120, 360, 'jump', 'splash')) },
        { text: '繞完一圈回家囉！台灣真美，晚安。', art: svg(scene.night() + prop.rails(430) + put('train', 200, 200, 400, 'boing', 'twinkle')) },
      ],
    },

    /* ======== 3. 海底尋寶 ======== */
    {
      id: 'sea-treasure', tag: '冒險',
      title: '潛水艇去尋寶',
      cover: svg(scene.sea() + scene.bubbles() + prop.chest(560, 450, true) + put('submarine', 60, 70, 380)),
      pages: [
        { text: '噗通！潛水艇潛到海底去尋寶囉。', art: svg(scene.sea() + scene.bubbles() + put('submarine', 180, 90, 440, 'boing', 'splash')) },
        { text: '小丑魚和海馬游過來：「跟我來！」', art: svg(scene.sea() + scene.bubbles() + put('fish', 40, 180, 330, 'jump', 'splash') + put('seahorse', 450, 150, 300, 'boing', 'pop') + scene.bubble(70, 50, '跟我來！')) },
        { text: '水母亮晶晶，河豚鼓起來像顆球。', art: svg(scene.sea() + scene.bubbles() + put('jelly', 40, 90, 340, 'boing', 'twinkle') + put('puffer', 420, 170, 320, 'boing', 'pop')) },
        { text: '珊瑚礁好漂亮，龍蝦和螃蟹在散步。', art: svg(scene.sea() + put('coral', 230, 40, 340, 'wiggle', 'pop') + put('lobster', 10, 250, 280, 'wiggle', 'pop') + put('crab', 520, 270, 250, 'wiggle', 'boing')) },
        { text: '海龜爺爺說：「寶藏在大石頭後面。」', art: svg(scene.sea() + scene.bubbles() + prop.rock(610, 460, 300) + put('turtle', 30, 170, 380, 'wiggle', 'pop') + scene.bubble(90, 40, '在石頭後面', 260)) },
        { text: '找到了！打開寶箱，閃閃發亮！', art: svg(scene.sea() + scene.bubbles() + prop.chest(470, 450, true) + put('submarine', 20, 60, 300, 'boing', 'yay') + put('starfish', 640, 340, 140, 'jump', 'twinkle')) },
        { text: '大家一起分享寶藏，海底朋友笑呵呵！', art: svg(scene.sea() + scene.bubbles() + prop.chest(400, 460, true) + put('fish', 20, 120, 260, 'jump', 'yay') + put('turtle', 540, 130, 260, 'wiggle', 'yay') + put('crab', 80, 330, 180, 'wiggle', 'pop') + put('seahorse', 590, 330, 160, 'boing', 'pop')) },
      ],
    },

    /* ======== 4. 森林露營 ======== */
    {
      id: 'camping', tag: '冒險',
      title: '森林露營夜',
      cover: svg(scene.night() + prop.tent(260, 420, 300) + prop.campfire(560, 430, .9)),
      pages: [
        { text: '週末到了，小熊和小兔子去森林露營。', art: svg(scene.forest() + scene.sun() + scene.tree(90) + scene.tree(720) + put('bear', 170, 160, 300, 'jump', 'boing') + put('bunny', 420, 170, 280, 'jump', 'pop')) },
        { text: '嘿咻嘿咻，一起把帳篷搭起來。', art: svg(scene.forest() + scene.tree(730) + prop.tent(400, 420, 300) + put('bear', 0, 200, 260, 'wiggle', 'boing') + put('bunny', 560, 220, 220, 'jump', 'pop')) },
        { text: '天黑了，生起營火，暖呼呼的。', art: svg(scene.sunset() + scene.grass(390) + prop.campfire(400, 440) + put('bear', 30, 220, 260, 'boing', 'pop') + put('bunny', 540, 230, 240, 'boing', 'pop')) },
        { text: '貓頭鷹在樹上說：「咕咕，晚安！」', art: svg(scene.night() + prop.bigTree(560) + put('owl', 440, 20, 240, 'wiggle', 'twinkle') + scene.bubble(100, 120, '咕咕～', 200)) },
        { text: '螢火蟲飛出來，一閃一閃像小燈泡。', art: svg(scene.night() + put('i-firefly', 230, 110, 340, 'jump', 'twinkle') + prop.glows([[100, 300], [180, 360], [620, 300], [700, 380], [560, 420], [260, 440]])) },
        { text: '躺在草地上看星星，好多好多星星呀！', art: svg(scene.night() + scene.stars() + put('bear', 120, 250, 260, 'boing', 'twinkle') + put('bunny', 440, 260, 240, 'boing', 'twinkle')) },
        { text: '鑽進帳篷睡覺囉，森林晚安！', art: svg(scene.night() + prop.tent(400, 440, 340, '#4dabf7') + prop.campfire(110, 450, .6) + scene.zzz(520, 160)) },
      ],
    },

    /* ======== 5. 動物園 ======== */
    {
      id: 'zoo-day', tag: '冒險',
      title: '動物園的一天',
      cover: svg(scene.day() + scene.grass() + put('panda', 60, 150, 320) + put('giraffe', 400, 60, 380)),
      pages: [
        { text: '今天天氣真好，我們去動物園玩！', art: svg(scene.day() + scene.sun() + scene.grass() + prop.zooGate() + put('bus', 230, 230, 340, 'jump', 'yay')) },
        { text: '熊貓坐著吃竹子，好可愛喔。', art: svg(scene.day() + scene.grass() + prop.bamboo(110) + prop.bamboo(690) + put('panda', 190, 110, 420, 'boing', 'pop')) },
        { text: '猴子盪來盪去，吱吱吱！好調皮。', art: svg(scene.day() + scene.grass() + scene.tree(100) + scene.tree(700) + put('monkey', 200, 70, 400, 'jump', 'boing') + put('f-banana', 560, 300, 160, 'jump', 'pop')) },
        { text: '斑馬有黑白條紋，長頸鹿脖子好長。', art: svg(scene.day() + scene.sun(90) + scene.grass() + put('zebra', 20, 170, 360, 'jump', 'boing') + put('giraffe', 380, 40, 420, 'boing', 'pop')) },
        { text: '河馬張開大嘴巴，啊～好大的嘴！', art: svg(scene.pond() + put('hippo', 170, 110, 460, 'boing', 'splash')) },
        { text: '袋鼠跳跳跳，無尾熊抱著樹睡覺。', art: svg(scene.day() + scene.grass() + prop.bigTree(610) + put('kangaroo', 20, 120, 370, 'jump', 'boing') + put('koala', 470, 120, 270, 'boing', 'pop')) },
        { text: '動物們再見！下次再來看你們喔。', art: svg(scene.sunset() + scene.grass() + put('panda', 0, 240, 250, 'jump', 'yay') + put('monkey', 270, 220, 260, 'jump', 'yay') + put('giraffe', 520, 120, 300, 'jump', 'yay')) },
      ],
    },
  );
})();
