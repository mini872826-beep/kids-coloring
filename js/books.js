/* 故事书。每页 = 一张场景图 + 一句话。
 * 场景里带 class="tap" 的东西都可以点：会动、会响。
 */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  const BOOKS = [
    {
      id: 'car-trip',
      title: '小汽车去旅行',
      cover: svg(scene.day() + scene.sun() + scene.road() + put('car', 230, 220, 340)),
      pages: [
        { text: '嘀嘀嘀！小红车要出门去旅行啦。', art: svg(scene.day() + scene.sun() + scene.road() + scene.tree(110) + put('car', 260, 230, 330)) },
        { text: '路上遇到小狗狗，汪汪汪，你好呀！', art: svg(scene.day() + scene.road() + scene.tree(700) + put('dog', 60, 150, 300, 'jump', 'woof') + put('car', 400, 250, 300)) },
        { text: '公交车也来了，大家一起走吧。', art: svg(scene.day() + scene.sun(90) + scene.road() + put('bus', 60, 220, 330) + put('car', 440, 250, 300)) },
        { text: '哇！恐龙公园里有一只大大的霸王龙。', art: svg(scene.day() + scene.grass() + scene.tree(90) + put('trex', 160, 70, 480, 'boing', 'roar')) },
        { text: '来到海边，大鲸鱼喷出了水花。', art: svg(scene.beach() + put('whale', 200, 120, 420, 'boing', 'splash') + put('car', 540, 330, 220)) },
        { text: '天黑了，小红车回家睡觉。晚安！', art: svg(scene.night() + put('car', 230, 250, 340, 'boing', 'pop')) },
      ],
    },
    {
      id: 'sea-party',
      title: '海底生日会',
      cover: svg(scene.sea() + scene.bubbles() + put('octopus', 220, 90, 380)),
      pages: [
        { text: '今天是章鱼妈妈的生日。', art: svg(scene.sea() + scene.bubbles() + put('octopus', 210, 80, 400, 'boing', 'pop')) },
        { text: '小丑鱼游过来说：生日快乐！', art: svg(scene.sea() + scene.bubbles() + put('fish', 120, 110, 380, 'jump', 'splash') + put('octopus', 480, 200, 260)) },
        { text: '老海龟慢慢爬，带来了一个大贝壳。', art: svg(scene.sea() + put('turtle', 170, 140, 440, 'wiggle', 'pop')) },
        { text: '小螃蟹横着走，咔嚓咔嚓跳起舞。', art: svg(scene.sea() + scene.bubbles() + put('crab', 200, 130, 400, 'wiggle', 'boing')) },
        { text: '大鲸鱼唱起歌，大家一起吹泡泡。', art: svg(scene.sea() + scene.bubbles() + put('whale', 150, 90, 480, 'boing', 'twinkle')) },
      ],
    },
  ];

  window.BOOKS = BOOKS;
})();
