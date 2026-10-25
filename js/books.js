/* 故事書。每頁 = 一張場景圖 + 一句話。
 * 場景裡帶 class="tap" 的東西都可以點：會動、會響。
 */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  const BOOKS = [
    {
      id: 'car-trip', tag: '冒險',
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
      id: 'sea-party', tag: '冒險',
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
      id: 'halloween-night', tag: '節日',
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

    /* ======== 品德小故事 ======== */
    {
      id: 'thank-you', tag: '品德', title: '謝謝你，小熊',
      cover: svg(scene.day() + scene.grass() + put('bunny', 90, 130, 300) + put('bear', 400, 130, 300) + scene.heart(400, 110)),
      pages: [
        { text: '小兔子抱著好多紅蘿蔔，蹦蹦跳跳要回家。', art: svg(scene.day() + scene.sun() + scene.grass() + scene.tree(680) + put('bunny', 220, 110, 360, 'jump', 'boing')) },
        { text: '哎呀！一不小心，紅蘿蔔掉了一地。', art: svg(scene.day() + scene.grass() + put('bunny', 60, 110, 330, 'wiggle', 'boing') + scene.carrot(470, 400, -60) + scene.carrot(560, 420, 30) + scene.carrot(650, 395, 80) + scene.carrot(520, 330, 10)) },
        { text: '小熊看到了，趕快跑過來幫忙撿。', art: svg(scene.day() + scene.grass() + put('bunny', 40, 120, 300) + put('bear', 400, 110, 330, 'jump', 'boing') + scene.carrot(360, 420, 40) + scene.carrot(300, 430, -20)) },
        { text: '小兔子說：「謝謝你，小熊！」', art: svg(scene.day() + scene.grass() + put('bunny', 60, 140, 320, 'jump', 'twinkle') + put('bear', 420, 140, 320) + scene.bubble(70, 40, '謝謝你！')) },
        { text: '小熊笑著說：「不客氣！」心裡暖暖的。', art: svg(scene.day() + scene.grass() + put('bunny', 60, 140, 320) + put('bear', 420, 140, 320, 'boing', 'twinkle') + scene.bubble(460, 40, '不客氣！') + scene.heart(400, 160)) },
        { text: '別人幫助我們的時候，要記得說「謝謝」喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('bunny', 90, 130, 300) + put('bear', 400, 130, 300) + scene.heart(130, 90, 26) + scene.heart(400, 80) + scene.heart(660, 100, 24)) },
      ],
    },
    {
      id: 'sorry', tag: '品德', title: '對不起，沒關係',
      cover: svg(scene.day() + scene.grass() + put('cat', 70, 130, 300) + put('dog', 430, 130, 300) + scene.blocks(360, 210)),
      pages: [
        { text: '小貓用積木，蓋了一座高高的塔。', art: svg(scene.day() + scene.grass() + put('cat', 90, 130, 330, 'boing', 'pop') + scene.blocks(500, 130)) },
        { text: '小狗跑得太快，砰！積木塔倒了。', art: svg(scene.day() + scene.grass() + put('cat', 40, 150, 290) + scene.blocks(330, 210, true) + put('dog', 480, 120, 300, 'wiggle', 'woof')) },
        { text: '小貓好難過，眼淚都快要掉下來了。', art: svg(scene.day() + scene.grass() + put('cat', 200, 110, 360, 'wiggle', 'pop') + scene.blocks(560, 190, true)) },
        { text: '小狗走過去說：「對不起，是我不小心。」', art: svg(scene.day() + scene.grass() + put('cat', 40, 150, 290) + put('dog', 420, 140, 310, 'boing', 'woof') + scene.bubble(450, 40, '對不起！')) },
        { text: '小貓說：「沒關係，我們一起再蓋一次吧！」', art: svg(scene.day() + scene.grass() + put('cat', 40, 140, 310, 'jump', 'twinkle') + put('dog', 440, 150, 290) + scene.bubble(60, 40, '沒關係！')) },
        { text: '做錯事要說「對不起」，大家又變成好朋友了。', art: svg(scene.day() + scene.sun() + scene.grass() + put('cat', 30, 150, 280) + scene.blocks(355, 130) + put('dog', 480, 150, 280) + scene.heart(400, 70)) },
      ],
    },
    {
      id: 'polite-pig', tag: '品德', title: '有禮貌的小豬',
      cover: svg(scene.day() + scene.sun() + scene.grass() + put('pig', 230, 110, 340) + scene.heart(620, 160)),
      pages: [
        { text: '早上起床，小豬對媽媽說：「早安！」', art: svg(scene.day() + scene.sun(120, 90) + scene.grass() + put('pig', 260, 130, 330, 'jump', 'twinkle') + scene.bubble(470, 60, '早安！', 200)) },
        { text: '到了學校，小豬對大象老師說：「老師好！」', art: svg(scene.day() + scene.grass() + put('pig', 30, 170, 280) + put('elephant', 380, 90, 380, 'boing', 'boing') + scene.bubble(60, 50, '老師好！')) },
        { text: '想用小雞的蠟筆，小豬說：「請借我，好嗎？」', art: svg(scene.day() + scene.grass() + put('pig', 40, 150, 300) + put('chick', 450, 160, 280, 'jump', 'pop') + scene.bubble(50, 40, '請借我好嗎？', 280)) },
        { text: '拿到蠟筆了，小豬說：「謝謝你！」', art: svg(scene.day() + scene.grass() + put('pig', 40, 150, 300, 'jump', 'twinkle') + put('chick', 450, 160, 280) + scene.bubble(60, 40, '謝謝你！')) },
        { text: '放學了，小豬揮揮手說：「再見！」', art: svg(scene.day() + scene.sun(680, 140) + scene.grass() + scene.tree(120) + put('pig', 290, 140, 320, 'wiggle', 'pop') + scene.bubble(470, 60, '再見！', 200)) },
        { text: '早安、請、謝謝、再見，小豬是有禮貌的好孩子！', art: svg(scene.day() + scene.sun() + scene.grass() + put('pig', 230, 110, 340) + scene.heart(140, 140) + scene.heart(660, 150, 26) + scene.stars()) },
      ],
    },
    {
      id: 'sharing', tag: '品德', title: '一起分享',
      cover: svg(scene.day() + scene.grass() + put('chick', 240, 90, 320) + scene.cookies(400, 410)),
      pages: [
        { text: '小雞烤了好多香香的餅乾。', art: svg(scene.day() + scene.sun() + scene.grass() + put('chick', 140, 110, 330, 'jump', 'pop') + scene.cookies(560, 400)) },
        { text: '好朋友們聞到香味，都跑過來了。', art: svg(scene.day() + scene.grass() + put('bunny', 0, 150, 260, 'jump', 'boing') + put('chick', 270, 130, 270) + put('pig', 540, 150, 260, 'jump', 'boing')) },
        { text: '小雞想了想，把餅乾分給每一個好朋友。', art: svg(scene.day() + scene.grass() + put('bunny', 0, 150, 250) + put('chick', 280, 110, 250, 'boing', 'pop') + put('pig', 550, 150, 250) + scene.cookies(400, 430, 3)) },
        { text: '大家一起吃，比一個人吃還要好吃！', art: svg(scene.day() + scene.sun() + scene.grass() + put('bunny', 0, 150, 250) + put('chick', 280, 130, 250) + put('pig', 550, 150, 250) + scene.heart(400, 90)) },
        { text: '有好東西和朋友分享，大家都好開心。', art: svg(scene.day() + scene.sun() + scene.grass() + put('bunny', 0, 150, 250) + put('chick', 280, 130, 250) + put('pig', 550, 150, 250) + scene.heart(150, 100, 24) + scene.heart(400, 80) + scene.heart(650, 100, 24) + scene.stars()) },
      ],
    },

    /* ======== 經典故事（兒童版） ======== */
    {
      id: 'three-pigs', tag: '經典', title: '三隻小豬',
      cover: svg(scene.day() + scene.grass() + scene.house('brick', 470, 170, 240) + put('pig', 30, 200, 200) + put('pig', 180, 220, 180) + put('pig', 310, 240, 160)),
      pages: [
        { text: '豬媽媽說：「孩子們長大了，去蓋自己的房子吧！」', art: svg(scene.day() + scene.sun() + scene.grass() + put('pig', 30, 170, 260, 'jump', 'pop') + put('pig', 270, 170, 260, 'jump', 'pop') + put('pig', 510, 170, 260, 'jump', 'pop')) },
        { text: '豬大哥用稻草蓋房子，一下子就蓋好了。', art: svg(scene.day() + scene.grass() + scene.house('straw', 420, 160, 260) + put('pig', 60, 150, 300, 'jump', 'pop')) },
        { text: '豬二哥用木頭蓋房子，也很快就蓋好了。', art: svg(scene.day() + scene.grass() + scene.house('wood', 420, 160, 260) + put('pig', 60, 150, 300, 'jump', 'pop')) },
        { text: '豬小弟用磚頭蓋房子，雖然很累，但是很認真。', art: svg(scene.day() + scene.sun(110) + scene.grass() + scene.house('brick', 420, 160, 260) + put('pig', 60, 150, 300, 'wiggle', 'pop')) },
        { text: '大野狼來了！呼——稻草屋和木頭屋都被吹倒了！', art: svg(scene.day() + scene.grass() + put('wolf', 20, 120, 330, 'boing', 'roar') + `<g class="drift"><path d="M420 200 L520 180 M440 260 L560 250 M430 320 L540 330" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>` + [[600, 300, 20], [650, 360, -30], [700, 280, 60], [620, 420, 10], [720, 400, -50]].map(([x, y, r]) => `<rect x="${x}" y="${y}" width="50" height="12" rx="4" fill="${r > 0 ? '#f6d365' : '#c98a4b'}" stroke="#222" stroke-width="3" transform="rotate(${r} ${x} ${y})"/>`).join('')) },
        { text: '大野狼用力吹，磚頭房子卻一動也不動！', art: svg(scene.day() + scene.grass() + put('wolf', 20, 120, 330, 'wiggle', 'roar') + scene.house('brick', 440, 150, 270)) },
        { text: '三隻小豬在磚頭房子裡好安全。做事認真，才會成功喔！', art: svg(scene.day() + scene.sun() + scene.grass() + scene.house('brick', 270, 100, 260) + put('pig', 0, 230, 200) + put('pig', 600, 230, 200) + scene.heart(400, 70)) },
      ],
    },
    {
      id: 'red-hood', tag: '經典', title: '小紅帽',
      cover: svg(scene.forest() + scene.tree(100) + scene.tree(700) + put('redhood', 220, 80, 380)),
      pages: [
        { text: '小紅帽要帶點心，去看生病的外婆。', art: svg(scene.day() + scene.grass() + scene.house('wood', 60, 160, 240) + put('redhood', 360, 90, 380, 'jump', 'pop')) },
        { text: '媽媽說：「路上不要跟陌生人說話喔！」', art: svg(scene.day() + scene.grass() + put('redhood', 230, 90, 380, 'boing', 'pop') + scene.bubble(60, 40, '知道了！')) },
        { text: '森林裡，大野狼笑咪咪地問：「妳要去哪裡呀？」', art: svg(scene.forest() + scene.tree(90) + scene.tree(720) + put('wolf', 60, 140, 320, 'boing', 'roar') + put('redhood', 430, 140, 300)) },
        { text: '小紅帽想起媽媽的話，不跟大野狼說話，趕快走開。', art: svg(scene.forest() + scene.tree(380) + put('wolf', 0, 180, 260) + put('redhood', 460, 110, 340, 'jump', 'pop')) },
        { text: '小紅帽到了外婆家，大野狼還想偷偷跟過來。', art: svg(scene.day() + scene.grass() + scene.house('grandma', 420, 150, 260) + put('redhood', 220, 180, 260) + put('wolf', -20, 210, 230, 'wiggle', 'roar')) },
        { text: '獵人叔叔來了，把大野狼趕得遠遠的！', art: svg(scene.forest() + scene.tree(150) + scene.tree(650) + put('wolf', 520, 230, 200, 'jump', 'roar') + `<path d="M380 330 L460 330 M390 360 L480 360 M380 390 L450 390" stroke="#868e96" stroke-width="8" stroke-linecap="round"/>`) },
        { text: '小紅帽和外婆一起吃點心。記得，不要跟陌生人走喔！', art: svg(scene.day() + scene.grass() + scene.house('grandma', 480, 150, 260) + put('redhood', 60, 110, 330) + scene.cookies(370, 420, 3) + scene.heart(400, 110)) },
      ],
    },
    {
      id: 'tortoise-hare', tag: '經典', title: '龜兔賽跑',
      cover: svg(scene.day() + scene.grass() + put('turtle', 20, 210, 320) + put('bunny', 380, 110, 300) + scene.flag(720, 420)),
      pages: [
        { text: '小兔子和小烏龜，要來比賽跑步。', art: svg(scene.day() + scene.sun() + scene.grass() + put('bunny', 40, 110, 320, 'jump', 'boing') + put('turtle', 380, 190, 340, 'wiggle', 'pop')) },
        { text: '預備，開始！小兔子一下子就跑得好遠好遠。', art: svg(scene.day() + scene.grass() + put('turtle', 0, 260, 220) + put('bunny', 470, 110, 300, 'jump', 'boing')) },
        { text: '小兔子心想：「烏龜好慢，我先睡一下吧！」', art: svg(scene.day() + scene.grass() + scene.tree(640) + put('bunny', 200, 130, 320, 'wiggle', 'pop') + scene.zzz(470, 140)) },
        { text: '小烏龜一步一步，慢慢往前爬，從來不停下來。', art: svg(scene.day() + scene.sun() + scene.grass() + put('turtle', 180, 140, 440, 'jump', 'pop')) },
        { text: '小烏龜先到終點，贏了比賽！', art: svg(scene.day() + scene.grass() + put('turtle', 220, 160, 380, 'boing', 'yay') + scene.flag(680, 440) + scene.stars()) },
        { text: '小兔子說：「我不該驕傲。」堅持不放棄，慢慢走也能成功！', art: svg(scene.day() + scene.sun() + scene.grass() + put('bunny', 40, 130, 300) + put('turtle', 400, 200, 320) + scene.heart(400, 100)) },
      ],
    },
    {
      id: 'wolf-coming', tag: '經典', title: '狼來了',
      cover: svg(scene.day() + scene.grass() + put('shepherd', 60, 90, 360) + put('sheep', 420, 170, 300)),
      pages: [
        { text: '山上有個放羊的孩子，每天看著小綿羊。', art: svg(scene.day() + scene.sun() + scene.grass() + put('shepherd', 40, 90, 360) + put('sheep', 420, 170, 300, 'jump', 'pop')) },
        { text: '他覺得好無聊，就大叫：「狼來了！狼來了！」', art: svg(scene.day() + scene.grass() + put('shepherd', 220, 110, 360, 'wiggle', 'pop') + scene.bubble(480, 50, '狼來了！', 240)) },
        { text: '大家趕快跑上山，卻發現根本沒有狼。', art: svg(scene.day() + scene.grass() + put('dog', 0, 150, 270, 'jump', 'woof') + put('pig', 260, 160, 260, 'jump', 'boing') + put('shepherd', 520, 120, 280)) },
        { text: '他又說了一次謊，大家又被騙了，好生氣。', art: svg(scene.day() + scene.grass() + put('dog', 40, 140, 290, 'wiggle', 'woof') + put('pig', 420, 140, 290, 'wiggle', 'boing')) },
        { text: '有一天，大野狼真的來了！可是沒有人相信他。', art: svg(scene.day() + scene.grass() + put('wolf', 20, 120, 320, 'boing', 'roar') + put('sheep', 420, 200, 260, 'jump', 'pop') + scene.bubble(480, 50, '救命啊！', 240)) },
        { text: '孩子難過地說：「我以後再也不說謊了。」', art: svg(scene.day() + scene.grass() + put('shepherd', 230, 100, 360, 'wiggle', 'pop')) },
        { text: '要做誠實的好孩子，大家才會相信你喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('shepherd', 60, 100, 340) + put('sheep', 430, 180, 280) + scene.heart(400, 90) + scene.stars()) },
      ],
    },
  ];

  window.BOOKS = BOOKS;
})();
