/* 兒歌和唐詩
 * 兒歌：lines 是歌詞，notes 是每一句的旋律（[音高, 拍數]，音高用 MIDI 數字，72 = 中央 Do 高八度）
 * 傳統民謠（小星星、兩隻老虎、生日快樂、王老先生）用的是很老的公版旋律；
 * 現代創作的兒歌有版權，所以「拔蘿蔔」「好爸爸好媽媽」「小羊回家」是這個 App 自己寫的原創歌。
 * 唐詩：只有 lines，會用 AI 聲音一句一句念。
 */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  const C = 72, D = 74, E = 76, F = 77, G = 79, A = 81, B = 83, C2 = 84, D2 = 86, E2 = 88, F2 = 89;
  const G0 = 67, A0 = 69, B0 = 71;

  const SONGS = [
    /* ======== 兒歌 ======== */
    {
      id: 'little-star', kind: 'song', title: '小星星', bpm: 100,
      art: svg(scene.night() + scene.stars()),
      lines: ['一閃一閃亮晶晶', '滿天都是小星星', '掛在天上放光明', '好像許多小眼睛', '一閃一閃亮晶晶', '滿天都是小星星'],
      notes: [
        [[C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2]],
        [[F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2]],
        [[G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2]],
        [[G, 1], [G, 1], [F, 1], [F, 1], [E, 1], [E, 1], [D, 2]],
        [[C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2]],
        [[F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'two-tigers', kind: 'song', title: '兩隻老虎', bpm: 130,
      art: svg(scene.day() + scene.grass() + put('tiger', 40, 120, 320, 'jump', 'roar') + put('tiger', 420, 120, 320, 'jump', 'roar')),
      lines: ['兩隻老虎，兩隻老虎', '跑得快，跑得快', '一隻沒有耳朵', '一隻沒有尾巴', '真奇怪，真奇怪'],
      notes: [
        [[C, 1], [D, 1], [E, 1], [C, 1], [C, 1], [D, 1], [E, 1], [C, 1]],
        [[E, 1], [F, 1], [G, 2], [E, 1], [F, 1], [G, 2]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, 1], [C, 1]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, 1], [C, 1]],
        [[C, 1], [G0, 1], [C, 2], [C, 1], [G0, 1], [C, 2]],
      ],
    },
    {
      id: 'birthday', kind: 'song', title: '生日快樂', bpm: 110,
      art: svg(scene.day() + scene.grass() + scene.cake(400, 320) + scene.stars()),
      lines: ['祝你生日快樂', '祝你生日快樂', '祝你生日快樂', '祝你生日快樂'],
      notes: [
        [[G0, .75], [G0, .25], [A0, 1], [G0, 1], [C, 1], [B0, 2]],
        [[G0, .75], [G0, .25], [A0, 1], [G0, 1], [D, 1], [C, 2]],
        [[G0, .75], [G0, .25], [G, 1], [E, 1], [C, 1], [B0, 1], [A0, 2]],
        [[F, .75], [F, .25], [E, 1], [C, 1], [D, 1], [C, 3]],
      ],
    },
    {
      id: 'old-farm', kind: 'song', title: '王老先生有塊地', bpm: 140,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.house('wood', 540, 170, 220) + put('chick', 0, 220, 220, 'jump', 'pop') + put('pig', 200, 220, 220, 'jump', 'boing') + put('sheep', 360, 230, 200, 'jump', 'pop')),
      lines: ['王老先生有塊地', '咿呀咿呀喲', '他在田邊養小雞', '咿呀咿呀喲', '這裡唧唧，那裡唧唧', '到處都在唧唧唧', '王老先生有塊地', '咿呀咿呀喲'],
      notes: [
        [[G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
        [[D, 1], [G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
        [[D, .5], [D, .5], [G, 1], [G, 1], [G, 1], [D, .5], [D, .5], [G, 1], [G, 2]],
        [[G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, .5], [G, .5], [G, 2]],
        [[G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
      ],
    },
    {
      id: 'pull-carrot', kind: 'song', title: '拔蘿蔔', original: true, bpm: 120,
      art: svg(scene.day() + scene.grass() + put('giant-carrot', 330, 200, 480) + put('bunny', 60, 210, 260, 'jump', 'boing')),
      lines: ['拔呀拔呀拔蘿蔔', '蘿蔔太大拔不動', '小狗小貓快來幫', '大家一起拔起來'],
      notes: [
        [[C, 1], [C, 1], [E, 1], [E, 1], [G, 1], [G, 1], [E, 2]],
        [[F, 1], [F, 1], [D, 1], [D, 1], [G, 1], [F, 1], [E, 2]],
        [[E, 1], [E, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2]],
        [[F, 1], [E, 1], [D, 1], [G, 1], [E, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'mom-dad', kind: 'song', title: '好爸爸好媽媽', original: true, bpm: 100,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.house('grandma', 470, 150, 260) + put('shepherd', 60, 110, 330, 'jump', 'twinkle') + scene.heart(400, 120)),
      lines: ['爸爸上班好辛苦', '媽媽煮飯香噴噴', '我會幫忙說謝謝', '我愛爸爸和媽媽'],
      notes: [
        [[E, 1], [E, 1], [G, 1], [E, 1], [D, 1], [C, 1], [D, 2]],
        [[E, 1], [E, 1], [G, 1], [A, 1], [G, 1], [E, 1], [G, 2]],
        [[A, 1], [A, 1], [G, 1], [E, 1], [D, 1], [E, 1], [G, 2]],
        [[E, 1], [D, 1], [C, 1], [D, 1], [E, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'sheep-home', kind: 'song', title: '小羊回家', original: true, bpm: 110,
      art: svg(scene.sunset() + scene.grass() + put('sheep', 60, 200, 260, 'jump', 'pop') + put('sheep', 300, 230, 220, 'jump', 'pop') + put('shepherd', 520, 120, 280)),
      lines: ['小羊小羊咩咩叫', '太陽公公下山了', '一隻兩隻三隻羊', '大家一起回家囉'],
      notes: [
        [[G, 1], [E, 1], [G, 1], [E, 1], [C, 1], [D, 1], [E, 2]],
        [[F, 1], [D, 1], [F, 1], [D, 1], [B0, 1], [C, 1], [D, 2]],
        [[E, 1], [G, 1], [A, 1], [G, 1], [E, 1], [G, 1], [A, 2]],
        [[G, 1], [E, 1], [D, 1], [E, 1], [D, 1], [B0, 1], [C, 2]],
      ],
    },

    /* ======== 唐詩 ======== */
    {
      id: 'quiet-night', kind: 'poem', title: '靜夜思', author: '李白',
      art: svg(scene.window()),
      lines: ['床前明月光', '疑是地上霜', '舉頭望明月', '低頭思故鄉'],
    },
    {
      id: 'spring-dawn', kind: 'poem', title: '春曉', author: '孟浩然',
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.tree(650) + scene.birds(4) + scene.flowers()),
      lines: ['春眠不覺曉', '處處聞啼鳥', '夜來風雨聲', '花落知多少'],
    },
    {
      id: 'stork-tower', kind: 'poem', title: '登鸛雀樓', author: '王之渙',
      art: svg(scene.sunset() + scene.mountains('#b2f2bb', '#8ce99a') + scene.river()),
      lines: ['白日依山盡', '黃河入海流', '欲窮千里目', '更上一層樓'],
    },
    {
      id: 'goose', kind: 'poem', title: '詠鵝', author: '駱賓王',
      art: svg(scene.pond() + put('swan', 200, 110, 420, 'boing', 'splash')),
      lines: ['鵝鵝鵝', '曲項向天歌', '白毛浮綠水', '紅掌撥清波'],
    },
    {
      id: 'farmers', kind: 'poem', title: '憫農', author: '李紳',
      art: svg(scene.day() + scene.sun(650, 90) + scene.rice()),
      lines: ['鋤禾日當午', '汗滴禾下土', '誰知盤中飧', '粒粒皆辛苦'],
    },
    {
      id: 'painting', kind: 'poem', title: '畫', author: '王維',
      art: svg(scene.day() + scene.mountains() + scene.flowers(440) + scene.birds(2)),
      lines: ['遠看山有色', '近聽水無聲', '春去花還在', '人來鳥不驚'],
    },
    {
      id: 'river-snow', kind: 'poem', title: '江雪', author: '柳宗元',
      art: svg(scene.snow() + scene.mountains('#f8f9fa', '#e9ecef') + `<rect y="380" width="800" height="120" fill="#a5d8ff"/>` + scene.boat(400, 390)),
      lines: ['千山鳥飛絕', '萬徑人蹤滅', '孤舟蓑笠翁', '獨釣寒江雪'],
    },
    {
      id: 'mother-thread', kind: 'poem', title: '遊子吟', author: '孟郊',
      art: svg(scene.day() + scene.grass() + scene.house('grandma', 500, 150, 240) + put('grandma', 60, 110, 330) + put('shepherd', 280, 160, 260) + scene.heart(400, 90)),
      lines: ['慈母手中線', '遊子身上衣', '臨行密密縫', '意恐遲遲歸', '誰言寸草心', '報得三春暉'],
    },
  ];

  window.SONGS = SONGS;
})();
