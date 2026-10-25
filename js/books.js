/* 故事書。每頁 = 一張場景圖 + 一句話。
 * 場景裡帶 class="tap" 的東西都可以點：會動、會響。
 */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  const BOOKS = [
    {
      id: 'car-trip',
      title: '小汽車去旅行',
      cover: svg(scene.day() + scene.sun() + scene.road() + put('car', 230, 220, 340)),
      pages: [
        { text: '嘀嘀嘀！小紅車要出門去旅行啦。', art: svg(scene.day() + scene.sun() + scene.road() + scene.tree(110) + put('car', 260, 230, 330)) },
        { text: '路上遇到小狗狗，汪汪汪，你好呀！', art: svg(scene.day() + scene.road() + scene.tree(700) + put('dog', 60, 150, 300, 'jump', 'woof') + put('car', 400, 250, 300)) },
        { text: '公車也來了，大家一起走吧。', art: svg(scene.day() + scene.sun(90) + scene.road() + put('bus', 60, 220, 330) + put('car', 440, 250, 300)) },
        { text: '哇！恐龍公園裡有一隻大大的霸王龍。', art: svg(scene.day() + scene.grass() + scene.tree(90) + put('trex', 160, 70, 480, 'boing', 'roar')) },
        { text: '來到海邊，大鯨魚噴出了水花。', art: svg(scene.beach() + put('whale', 200, 120, 420, 'boing', 'splash') + put('car', 540, 330, 220)) },
        { text: '天黑了，小紅車回家睡覺。晚安！', art: svg(scene.night() + put('car', 230, 250, 340, 'boing', 'pop')) },
      ],
    },
    {
      id: 'sea-party',
      title: '海底生日會',
      cover: svg(scene.sea() + scene.bubbles() + put('octopus', 220, 90, 380)),
      pages: [
        { text: '今天是章魚媽媽的生日。', art: svg(scene.sea() + scene.bubbles() + put('octopus', 210, 80, 400, 'boing', 'pop')) },
        { text: '小丑魚游過來說：生日快樂！', art: svg(scene.sea() + scene.bubbles() + put('fish', 120, 110, 380, 'jump', 'splash') + put('octopus', 480, 200, 260)) },
        { text: '老海龜慢慢爬，帶來了一個大貝殼。', art: svg(scene.sea() + put('turtle', 170, 140, 440, 'wiggle', 'pop')) },
        { text: '小螃蟹橫著走，咔嚓咔嚓跳起舞。', art: svg(scene.sea() + scene.bubbles() + put('crab', 200, 130, 400, 'wiggle', 'boing')) },
        { text: '大鯨魚唱起歌，大家一起吹泡泡。', art: svg(scene.sea() + scene.bubbles() + put('whale', 150, 90, 480, 'boing', 'twinkle')) },
      ],
    },
    {
      id: 'halloween-night',
      title: '萬聖節的晚上',
      cover: svg(scene.night() + put('pumpkin', 230, 130, 340)),
      pages: [
        { text: '萬聖節到了，南瓜燈亮起來囉！', art: svg(scene.night() + put('pumpkin', 220, 110, 360, 'boing', 'pop')) },
        { text: '小幽靈飄呀飄，說：不給糖就搗蛋！', art: svg(scene.night() + put('ghost', 230, 90, 360, 'jump', 'twinkle')) },
        { text: '蝙蝠拍拍翅膀，在月亮下面飛來飛去。', art: svg(scene.night() + put('bat', 160, 110, 460, 'wiggle', 'pop')) },
        { text: '小怪獸一點也不可怕，牠想要交朋友。', art: svg(scene.night() + put('monster', 230, 100, 360, 'boing', 'boing')) },
        { text: '大家一起到鬼屋開派對，萬聖節快樂！', art: svg(scene.night() + put('haunted', 180, 70, 440, 'jump', 'roar')) },
      ],
    },
  ];

  window.BOOKS = BOOKS;
})();
