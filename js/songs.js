/* 兒歌和唐詩
 * 兒歌：lines 是歌詞，notes 是每一句的旋律（[音高, 拍數]，音高用 MIDI 數字，72 = 中央 Do 高八度）
 * 傳統民謠（小星星、兩隻老虎、生日快樂、王老先生）用的是很老的公版旋律；
 * 現代創作的兒歌有版權，所以標「原創」的歌（歌詞和旋律）都是這個 App 自己寫的，每首有自己的旋律。
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
      id: 'birthday', kind: 'song', title: '生日快樂', bpm: 110, meter: 3,
      art: svg(scene.day() + scene.grass() + scene.cake(400, 320) + scene.stars()),
      lines: ['祝你生日快樂', '祝你生日快樂', '祝你生日快樂', '祝你生日快樂'],
      // 唱的時候：~ = 前一個字拉長（第三句的「樂」唱兩個音）
      sing: ['祝你生日快樂', '祝你生日快樂', '祝你生日快樂~', '祝你生日快樂'],
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
      lines: ['王老先生有塊地', '咿呀咿呀喲', '他在田邊養了小雞', '咿呀咿呀喲', '這裡唧唧，那裡也唧唧', '這裡唧，那裡唧，到處都唧唧', '王老先生有塊地', '咿呀咿呀喲'],
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
      id: 'pull-carrot', kind: 'song', title: '拔蘿蔔', original: true, bpm: 116,
      art: svg(scene.day() + scene.grass() + put('giant-carrot', 330, 200, 480) + put('bunny', 60, 210, 260, 'jump', 'boing')),
      lines: ['嘿呦嘿呦拔蘿蔔', '蘿蔔長在小山坡', '公公拉，婆婆拖', '小狗小貓來幫我', '大家一起用力拖', '小小老鼠跑來說', '我也幫忙拔蘿蔔', '蘿蔔拔起笑呵呵'],
      notes: [
        [[G, .5], [G, .5], [A, .5], [A, .5], [G, 1], [E, 1], [C, 2]],
        [[E, 1], [D, .5], [E, .5], [G, 1], [E, .5], [D, .5], [C, 2]],
        [[C2, .5], [C2, .5], [A, 1], [G, .5], [G, .5], [E, 1]],
        [[E, .5], [E, .5], [G, .5], [G, .5], [A, 1], [G, 1], [E, 2]],
        [[A, .5], [A, .5], [A, .5], [G, .5], [C2, 1], [A, 1], [G, 2]],
        [[E, .5], [E, .5], [D, .5], [E, .5], [G, 1], [E, 1], [D, 2]],
        [[E, .5], [D, .5], [C, .5], [D, .5], [E, 1], [G, 1], [A, 2]],
        [[C2, 1], [A, .5], [G, .5], [E, 1], [G, .5], [D, .5], [C, 2]],
      ],
    },
    {
      id: 'mom-dad', kind: 'song', title: '好爸爸好媽媽', original: true, bpm: 96, meter: 3,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.house('grandma', 470, 150, 260) + put('shepherd', 60, 110, 330, 'jump', 'twinkle') + scene.heart(400, 120)),
      lines: ['我有一個好爸爸', '早出晚歸照顧家', '我有一個好媽媽', '陪我唱歌說笑話', '我要快快長大', '幫忙掃地又澆花', '我愛爸爸和媽媽'],
      notes: [
        [[G, 1], [E, .5], [G, .5], [A, 1], [C2, 1], [A, .5], [G, 1.5]],
        [[E, 1], [G, .5], [E, .5], [D, 1], [C, 1], [D, .5], [E, 1.5]],
        [[G, 1], [E, .5], [G, .5], [A, 1], [C2, 1], [D2, .5], [C2, 1.5]],
        [[A, 1], [G, .5], [E, .5], [G, 1], [E, 1], [D, .5], [C, 1.5]],
        [[E, .5], [G, .5], [C2, 1], [C2, 1], [D2, 1], [C2, 2]],
        [[A, 1], [A, .5], [G, .5], [E, 1], [G, 1], [A, .5], [G, 1.5]],
        [[E, 1], [G, .5], [A, .5], [G, 1], [E, 1], [D, .5], [C, 1.5]],
      ],
    },
    {
      id: 'sheep-home', kind: 'song', title: '小羊回家', original: true, bpm: 104,
      art: svg(scene.sunset() + scene.grass() + put('sheep', 60, 200, 260, 'jump', 'pop') + put('sheep', 300, 230, 220, 'jump', 'pop') + put('shepherd', 520, 120, 280)),
      lines: ['小羊小羊咩咩咩', '吃飽青草曬太陽', '媽媽在叫小綿羊', '快回媽媽的身旁', '一隻兩隻三隻羊', '排好隊伍晃呀晃', '回到家裡暖洋洋', '大家一起進夢鄉'],
      notes: [
        [[E, .75], [G, .25], [E, .75], [G, .25], [C2, .5], [C2, .5], [C2, 1]],
        [[A, .75], [G, .25], [A, .75], [G, .25], [E, .5], [D, .5], [E, 1]],
        [[D, .75], [E, .25], [F, .75], [E, .25], [D, .5], [C, .5], [D, 1]],
        [[E, .75], [D, .25], [C, .75], [D, .25], [E, .5], [D, .5], [C, 1]],
        [[G, .5], [G, .5], [A, .5], [A, .5], [B, .5], [B, .5], [C2, 1]],
        [[C2, .75], [A, .25], [G, .75], [E, .25], [G, .5], [A, .5], [G, 1]],
        [[E, .75], [G, .25], [A, .75], [G, .25], [E, .5], [D, .5], [E, 1]],
        [[D, .75], [E, .25], [G, .75], [E, .25], [D, .5], [D, .5], [C, 2]],
      ],
    },

    {
      id: 'tricycle', kind: 'song', title: '三輪車', bpm: 132,
      art: svg(scene.day() + scene.sun() + scene.road() + scene.tree(680) + put('grandma', 230, 120, 320, 'jump', 'pop')),
      lines: ['三輪車，跑得快', '上面坐個老太太', '要五毛，給一塊', '你說奇怪不奇怪'],
      notes: [
        [[G, 1], [G, 1], [E, 2], [G, 1], [G, 1], [E, 2]],
        [[A, 1], [A, 1], [G, 1], [G, 1], [E, 1], [E, 1], [D, 2]],
        [[C, 1], [C, 1], [D, 2], [E, 1], [E, 1], [D, 2]],
        [[D, 1], [E, 1], [G, 1], [E, 1], [D, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'london-bridge', kind: 'song', title: '倫敦鐵橋垮下來', bpm: 120,
      art: svg(scene.day() + scene.sun() + `<rect y="330" width="800" height="170" fill="#74c0fc"/>` + `<g stroke="#222" stroke-width="6" stroke-linejoin="round"><path d="M60 300 L740 300 L740 330 L60 330 Z" fill="#c98a4b"/><path d="M180 330 Q260 230 340 330 M460 330 Q540 230 620 330" fill="none"/>${[100, 400, 700].map(x => `<rect x="${x - 20}" y="230" width="40" height="190" fill="#adb5bd"/>`).join('')}</g>`),
      lines: ['倫敦鐵橋垮下來', '垮下來，垮下來', '倫敦鐵橋垮下來', '就要垮下來'],
      notes: [
        [[G, 1.5], [A, .5], [G, 1], [F, 1], [E, 1], [F, 1], [G, 2]],
        [[D, 1], [E, 1], [F, 2], [E, 1], [F, 1], [G, 2]],
        [[G, 1.5], [A, .5], [G, 1], [F, 1], [E, 1], [F, 1], [G, 2]],
        [[D, 1], [D, 1], [G, 2], [E, 1], [C, 3]],
      ],
    },

    /* ======== 原創兒歌（歌詞和旋律都是這個 App 自己寫的） ======== */
    {
      id: 'brush-song', kind: 'song', title: '刷牙歌', original: true, bpm: 126,
      art: svg(scene.day() + scene.grass() + put('bear', 60, 130, 300, 'wiggle', 'pop') + scene.toothbrush(520, 230) + scene.tooth(620, 330, true, 60)),
      lines: ['小牙刷，手中拿', '每天早晚刷刷牙', '上面刷，下面刷', '裡面外面都刷刷', '漱漱口，嘩啦啦', '牙齒白白笑哈哈'],
      notes: [
        [[E, .5], [G, 1], [G, .5], [A, .5], [C2, 1], [A, .5]],
        [[G, .5], [A, .5], [G, .5], [E, .5], [G, .5], [G, .5], [C2, 1]],
        [[C2, .5], [A, 1], [C2, .5], [A, .5], [F, 1], [A, .5]],
        [[G, .5], [E, .5], [G, .5], [E, .5], [D, .5], [E, .5], [C, 1]],
        [[E, .5], [E, .5], [D, 1], [G, .5], [G, .5], [G, 1]],
        [[C, .5], [E, .5], [G, .5], [G, .5], [A, .5], [C2, .5], [C2, 1]],
      ],
    },
    {
      id: 'wash-song', kind: 'song', title: '洗手歌', original: true, bpm: 112,
      art: svg(scene.day() + scene.grass() + put('bunny', 40, 120, 320, 'wiggle', 'splash') + scene.faucet(560, 260) + scene.soap(560, 430) + scene.bubbles()),
      lines: ['吃飯以前先洗手', '抹上肥皂起泡泡', '手心手背搓一搓', '指縫指尖也搓到', '清水沖沖嘩啦啦', '細菌細菌都跑掉', '擦乾小手香噴噴', '乾乾淨淨真是好'],
      notes: [
        [[G, .5], [A, .5], [G, .5], [E, .5], [G, .5], [E, .5], [D, 1]],
        [[E, .5], [D, .5], [C, .5], [D, .5], [E, .5], [G, .5], [C, 1]],
        [[C, .5], [E, .5], [C, .5], [E, .5], [G, 1], [E, .5], [G, .5]],
        [[A, .5], [G, .5], [A, .5], [G, .5], [E, .5], [D, .5], [E, 1]],
        [[C2, .5], [C2, .5], [A, .5], [A, .5], [G, .5], [E, .5], [G, 1]],
        [[E, .5], [D, .5], [E, .5], [D, .5], [C, .5], [D, .5], [D, 1]],
        [[C, .5], [E, .5], [G, .5], [A, .5], [G, .5], [E, .5], [G, 1]],
        [[A, .5], [A, .5], [G, .5], [G, .5], [E, .5], [D, .5], [C, 1]],
      ],
    },
    {
      id: 'number-song', kind: 'song', title: '數字歌', original: true, bpm: 104,
      art: svg(`<rect width="800" height="500" fill="#fff9db"/>` + '12345'.split('').map((n, i) => `<text class="tap float" data-anim="jump" data-sound="pop" style="animation-delay:${i * .3}s" x="${100 + i * 150}" y="${260 + (i % 2) * 90}" text-anchor="middle" font-size="150" font-weight="900" fill="${['#ff6b6b', '#ff922b', '#51cf66', '#4dabf7', '#845ef7'][i]}" stroke="#222" stroke-width="6" paint-order="stroke" font-family="Nunito, sans-serif">${n}</text>`).join('')),
      lines: ['一二三，爬上山', '四五六，翻跟斗', '七八九，拍拍手', '十個好朋友', '一二三四五六七', '八九十，手拉手'],
      notes: [
        [[C, .5], [D, .5], [E, 1], [G, .5], [A, .5], [C2, 1]],
        [[C2, .5], [A, .5], [G, 1], [E, .5], [D, .5], [E, 1]],
        [[G, .5], [G, .5], [E, 1], [C, .5], [C, .5], [C, 1]],
        [[E, .5], [G, .5], [A, .5], [G, .5], [C, 2]],
        [[C, .5], [D, .5], [E, .5], [F, .5], [G, .5], [A, .5], [B, 1]],
        [[C2, .5], [B, .5], [C2, 1], [G, .5], [E, .5], [C, 1]],
      ],
    },
    {
      id: 'color-song', kind: 'song', title: '顏色歌', original: true, bpm: 108,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.flowers() + `<path d="M120 380 A280 280 0 0 1 680 380" fill="none" stroke="#ff6b6b" stroke-width="22"/><path d="M150 380 A250 250 0 0 1 650 380" fill="none" stroke="#ffd43b" stroke-width="22"/><path d="M180 380 A220 220 0 0 1 620 380" fill="none" stroke="#51cf66" stroke-width="22"/><path d="M210 380 A190 190 0 0 1 590 380" fill="none" stroke="#4dabf7" stroke-width="22"/>`),
      lines: ['紅紅的蘋果圓又圓', '黃黃的香蕉彎又彎', '綠綠的西瓜甜又甜', '藍藍的天空寬又寬', '好多顏色真好看'],
      notes: [
        [[E, .5], [E, .5], [D, .5], [E, .5], [G, .5], [A, 1], [G, .5], [E, 2]],
        [[G, .5], [G, .5], [E, .5], [G, .5], [A, .5], [C2, 1], [A, .5], [G, 2]],
        [[A, .5], [A, .5], [G, .5], [A, .5], [C2, .5], [D2, 1], [C2, .5], [A, 2]],
        [[G, .5], [G, .5], [E, .5], [G, .5], [A, .5], [G, 1], [E, .5], [D, 2]],
        [[E, 1], [G, .5], [A, .5], [G, .5], [E, .5], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'goodnight-song', kind: 'song', title: '晚安歌', original: true, bpm: 78, meter: 3,
      art: svg(scene.night() + scene.bed(400, 380) + put('bear', 200, 230, 170, 'wiggle', 'twinkle') + scene.zzz(470, 240)),
      lines: ['月亮彎彎掛天上', '星星眨眼閃閃亮', '小熊抱著小枕頭', '輕輕躺在小床上', '閉上眼睛數綿羊', '一隻兩隻好夢香', '晚安晚安', '明天見太陽'],
      notes: [
        [[G, 1.5], [E, .5], [G, 1], [A, .5], [G, .5], [E, 1], [C, 1]],
        [[E, 1.5], [D, .5], [E, 1], [G, .5], [A, .5], [G, 1], [E, 1]],
        [[C, 1.5], [D, .5], [E, 1], [G, .5], [E, .5], [D, 1], [C, 1]],
        [[C, 1.5], [D, .5], [E, 1], [G, .5], [E, .5], [E, 1], [D, 1]],
        [[E, 1.5], [G, .5], [A, 1], [C2, .5], [A, .5], [G, 1], [E, 1]],
        [[G, 1.5], [E, .5], [D, 1], [E, .5], [G, .5], [E, 1], [D, 1]],
        [[C2, 1.5], [A, 1.5], [G, 1.5], [E, 1.5]],
        [[E, 1], [D, 1], [C, 1], [D, 1.5], [C, 1.5]],
      ],
    },
    {
      id: 'animal-sounds', kind: 'song', title: '動物叫聲歌', original: true, bpm: 132,
      art: svg(scene.day() + scene.sun() + scene.grass() + put('dog', 0, 200, 220, 'jump', 'woof') + put('cat', 200, 200, 220, 'jump', 'pop') + put('duckling', 400, 230, 200, 'jump', 'pop') + put('chick', 580, 220, 200, 'jump', 'pop')),
      lines: ['小狗小狗怎麼叫', '汪汪汪汪汪', '小貓小貓怎麼叫', '喵喵喵喵喵', '小鴨小鴨怎麼叫', '呱呱呱呱呱', '大家一起哈哈笑'],
      notes: [
        [[C, .5], [E, .5], [C, .5], [E, .5], [G, .5], [A, .5], [G, 1]],
        [[C2, .5], [C2, .5], [G, .5], [G, .5], [C2, 2]],
        [[D, .5], [F, .5], [D, .5], [F, .5], [A, .5], [B, .5], [A, 1]],
        [[D2, .5], [C2, .5], [A, .5], [F, .5], [D, 2]],
        [[E, .5], [G, .5], [E, .5], [G, .5], [C2, .5], [D2, .5], [C2, 1]],
        [[G, .5], [G, .5], [E, .5], [E, .5], [C, 2]],
        [[G, .5], [A, .5], [C2, .5], [A, .5], [G, .5], [E, .5], [C, 2]],
      ],
    },
    {
      id: 'vehicle-song', kind: 'song', title: '交通工具歌', original: true, bpm: 120,
      art: svg(scene.day() + scene.sun() + scene.road() + put('car', 40, 260, 260, 'jump', 'pop') + put('train', 300, 240, 280, 'jump', 'pop') + put('plane', 420, 40, 300, 'jump', 'pop')),
      lines: ['汽車汽車叭叭叭', '載著爸爸去上班', '火車火車嘟嘟嘟', '載著大家去遊玩', '飛機飛機飛呀飛', '飛上藍天看一看', '我們一起去冒險'],
      notes: [
        [[G, .5], [E, .5], [G, .5], [E, .5], [C2, .5], [C2, .5], [C2, 1]],
        [[A, .5], [G, .5], [A, .5], [G, .5], [E, .5], [D, .5], [C, 1]],
        [[D, .5], [F, .5], [D, .5], [F, .5], [A, .5], [A, .5], [A, 1]],
        [[G, .5], [A, .5], [G, .5], [E, .5], [D, .5], [E, .5], [C, 1]],
        [[C, .5], [G, .5], [C2, .5], [G, .5], [C2, .5], [D2, .5], [E2, 1]],
        [[D2, .5], [C2, .5], [A, .5], [C2, .5], [A, .5], [G, .5], [E, 1]],
        [[G, .5], [A, .5], [G, .5], [E, .5], [D, .5], [E, .5], [C, 2]],
      ],
    },
    {
      id: 'rain-song', kind: 'song', title: '下雨歌', original: true, bpm: 112,
      art: svg(scene.rain() + `<rect y="400" width="800" height="100" fill="#8ce99a"/>` + scene.flowers(440) + put('duckling', 300, 230, 220, 'jump', 'splash')),
      lines: ['滴答滴答下雨啦', '小花張開小嘴巴', '咕嚕咕嚕喝水啦', '撐起雨傘回到家', '雨停了，彩虹掛', '天空變成大圖畫'],
      notes: [
        [[C2, .5], [G, .5], [C2, .5], [G, .5], [A, .5], [F, .5], [E, 1]],
        [[E, .5], [G, .5], [A, .5], [A, .5], [G, .5], [E, .5], [D, 1]],
        [[C, .5], [C, .5], [D, .5], [D, .5], [E, .5], [G, .5], [E, 1]],
        [[A, .5], [G, .5], [E, .5], [G, .5], [E, .5], [D, .5], [C, 1]],
        [[G, .5], [A, .5], [G, 1], [C2, .5], [D2, .5], [C2, 1]],
        [[A, .5], [C2, .5], [A, .5], [G, .5], [E, .5], [D, .5], [C, 2]],
      ],
    },

    /* ======== 英文兒歌（傳統童謠，公版） ======== */
    {
      id: 'en-twinkle', kind: 'en-song', title: 'Twinkle Twinkle Little Star', bpm: 100,
      art: svg(scene.night() + scene.stars()),
      lines: ['Twinkle, twinkle, little star', 'How I wonder what you are', 'Up above the world so high', 'Like a diamond in the sky', 'Twinkle, twinkle, little star', 'How I wonder what you are'],
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
      id: 'en-abc', kind: 'en-song', title: 'The ABC Song', bpm: 100,
      art: svg(scene.letters()),
      lines: ['A B C D E F G', 'H I J K L M N O P', 'Q R S, T U V', 'W X, Y and Z', 'Now I know my A B Cs', 'Next time will you sing with me?'],
      notes: [
        [[C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2]],
        [[F, 1], [F, 1], [E, 1], [E, 1], [D, .5], [D, .5], [D, .5], [D, .5], [C, 2]],
        [[G, 1], [G, 1], [F, 2], [E, 1], [E, 1], [D, 2]],
        [[G, 1], [G, 1], [F, 2], [E, 1], [E, 1], [D, 2]],
        [[C, 1], [C, 1], [G, 1], [G, 1], [A, 1], [A, 1], [G, 2]],
        [[F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'en-baa', kind: 'en-song', title: 'Baa, Baa, Black Sheep', bpm: 100,
      art: svg(scene.day() + scene.grass() + put('sheep', 120, 140, 300, 'jump', 'pop') + put('sheep', 420, 160, 280, 'jump', 'pop')),
      lines: ['Baa, baa, black sheep, have you any wool?', 'Yes sir, yes sir, three bags full', 'One for the master, one for the dame', 'And one for the little boy who lives down the lane'],
      notes: [
        [[C, 1], [C, 1], [G, 1], [G, 1], [A, .5], [A, .5], [A, .5], [A, .5], [G, 2]],
        [[F, 1], [F, 1], [E, 1], [E, 1], [D, 1], [D, 1], [C, 2]],
        [[G, 1], [G, .5], [G, .5], [F, 1], [F, 1], [E, 1], [E, .5], [E, .5], [D, 2]],
        [[G, .5], [G, .5], [G, .5], [G, .5], [G, .5], [F, .5], [F, .5], [F, 1], [E, .5], [E, .5], [E, 1], [D, 2]],
      ],
    },
    {
      id: 'en-row', kind: 'en-song', title: 'Row, Row, Row Your Boat', bpm: 110,
      art: svg(scene.day() + scene.sun() + `<rect y="300" width="800" height="200" fill="#74c0fc"/>` + scene.boat(400, 330)),
      lines: ['Row, row, row your boat', 'Gently down the stream', 'Merrily, merrily, merrily, merrily', 'Life is but a dream'],
      notes: [
        [[C, 1.5], [C, 1.5], [C, 1], [D, .5], [E, 1.5]],
        [[E, 1], [D, .5], [E, 1], [F, .5], [G, 3]],
        [[C2, .5], [C2, .5], [C2, .5], [G, .5], [G, .5], [G, .5], [E, .5], [E, .5], [E, .5], [C, .5], [C, .5], [C, .5]],
        [[G, 1], [F, .5], [E, 1], [D, .5], [C, 3]],
      ],
    },
    {
      id: 'en-mary', kind: 'en-song', title: 'Mary Had a Little Lamb', bpm: 120,
      art: svg(scene.day() + scene.grass() + scene.flowers() + put('redhood', 100, 100, 320) + put('sheep', 420, 180, 280, 'jump', 'pop')),
      lines: ['Mary had a little lamb', 'Little lamb, little lamb', 'Mary had a little lamb', 'Its fleece was white as snow'],
      notes: [
        [[E, 1.5], [D, .5], [C, 1], [D, 1], [E, 1], [E, 1], [E, 2]],
        [[D, 1], [D, 1], [D, 2], [E, 1], [G, 1], [G, 2]],
        [[E, 1.5], [D, .5], [C, 1], [D, 1], [E, 1], [E, 1], [E, 1]],
        [[E, 1], [D, 1], [D, 1], [E, 1], [D, 1], [C, 4]],
      ],
    },
    {
      id: 'en-london', kind: 'en-song', title: 'London Bridge Is Falling Down', bpm: 120,
      art: svg(scene.day() + scene.sun() + scene.bridge()),
      lines: ['London Bridge is falling down', 'Falling down, falling down', 'London Bridge is falling down', 'My fair lady'],
      notes: [
        [[G, 1.5], [A, .5], [G, 1], [F, 1], [E, 1], [F, 1], [G, 2]],
        [[D, 1], [E, 1], [F, 2], [E, 1], [F, 1], [G, 2]],
        [[G, 1.5], [A, .5], [G, 1], [F, 1], [E, 1], [F, 1], [G, 2]],
        [[D, 2], [G, 2], [E, 1], [C, 3]],
      ],
    },
    {
      id: 'en-farm', kind: 'en-song', title: 'Old MacDonald Had a Farm', bpm: 140,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.house('wood', 540, 170, 220) + put('pig', 0, 220, 220, 'jump', 'boing') + put('sheep', 200, 230, 200, 'jump', 'pop') + put('chick', 360, 240, 180, 'jump', 'pop')),
      lines: ['Old MacDonald had a farm', 'E-I-E-I-O', 'And on his farm he had a pig', 'E-I-E-I-O', 'With an oink oink here and an oink oink there', 'Here an oink, there an oink, everywhere an oink oink', 'Old MacDonald had a farm', 'E-I-E-I-O'],
      notes: [
        [[G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
        [[D, 1], [G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
        [[D, .5], [D, .5], [G, 1], [G, 1], [G, 2], [D, .5], [D, .5], [G, 1], [G, 1], [G, 2]],
        [[G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, .5], [G, .5], [G, 1], [G, 2]],
        [[G, 1], [G, 1], [G, 1], [D, 1], [E, 1], [E, 1], [D, 2]],
        [[B, 1], [B, 1], [A, 1], [A, 1], [G, 3]],
      ],
    },
    {
      id: 'en-john', kind: 'en-song', title: 'Are You Sleeping?', bpm: 120,
      art: svg(scene.night() + scene.bed(400, 380) + put('shepherd', 230, 240, 160, 'wiggle', 'pop') + scene.zzz(480, 250)),
      lines: ['Are you sleeping, are you sleeping', 'Brother John, Brother John?', 'Morning bells are ringing', 'Morning bells are ringing', 'Ding, dang, dong. Ding, dang, dong.'],
      notes: [
        [[C, 1], [D, 1], [E, 1], [C, 1], [C, 1], [D, 1], [E, 1], [C, 1]],
        [[E, 1], [F, 1], [G, 2], [E, 1], [F, 1], [G, 2]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, 1], [C, 1]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, 1], [C, 1]],
        [[C, 1], [G0, 1], [C, 2], [C, 1], [G0, 1], [C, 2]],
      ],
    },
    {
      id: 'en-humpty', kind: 'en-song', title: 'Humpty Dumpty', bpm: 110,
      art: svg(scene.day() + scene.grass() + scene.humpty(400, 300)),
      lines: ['Humpty Dumpty sat on a wall', 'Humpty Dumpty had a great fall', "All the king's horses and all the king's men", "Couldn't put Humpty together again"],
      notes: [
        [[E, 1], [G, .5], [F, 1], [A, .5], [G, .5], [A, .5], [B, .5], [C2, 2]],
        [[E, 1], [G, .5], [F, 1], [A, .5], [G, .5], [F, .5], [E, .5], [D, 2]],
        [[E, .5], [E, .5], [D, .5], [D, .5], [C, 1], [C, .5], [E, .5], [E, .5], [D, .5], [C, 1.5]],
        [[G, .5], [G, .5], [F, .5], [F, .5], [E, .5], [E, .5], [D, .5], [E, .5], [D, .5], [C, 2]],
      ],
    },
    {
      id: 'en-hickory', kind: 'en-song', title: 'Hickory Dickory Dock', bpm: 120,
      art: svg(scene.day() + scene.grass() + scene.clock(500, 260) + put('mouse', 80, 180, 260, 'jump', 'pop')),
      lines: ['Hickory dickory dock', 'The mouse ran up the clock', 'The clock struck one', 'The mouse ran down', 'Hickory dickory dock'],
      notes: [
        [[C, 1], [D, .5], [E, 1], [F, .5], [G, 2]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, .5], [D, 2]],
        [[E, .5], [E, .5], [E, 1], [C2, 2]],
        [[D, .5], [D, .5], [D, 1], [G0, 2]],
        [[C, 1], [D, .5], [E, 1], [D, .5], [C, 2]],
      ],
    },
    {
      id: 'en-rain', kind: 'en-song', title: 'Rain, Rain, Go Away', bpm: 110,
      art: svg(scene.rain() + `<rect y="400" width="800" height="100" fill="#8ce99a"/>` + put('bunny', 270, 200, 260, 'wiggle', 'splash')),
      lines: ['Rain, rain, go away', 'Come again another day', 'Little children want to play', 'Rain, rain, go away'],
      notes: [
        [[G, 1], [E, 1], [G, .5], [G, .5], [E, 2]],
        [[G, .5], [G, .5], [E, .5], [E, .5], [G, .5], [G, .5], [E, 2]],
        [[G, .5], [G, .5], [E, .5], [E, .5], [G, .5], [G, .5], [E, 2]],
        [[G, 1], [E, 1], [G, .5], [G, .5], [E, 2]],
      ],
    },
    {
      id: 'en-spider', kind: 'en-song', title: 'The Itsy Bitsy Spider', bpm: 120,
      art: svg(scene.day() + scene.sun() + scene.grass() + scene.spout() + scene.spider(470, 250)),
      lines: ['The itsy bitsy spider climbed up the water spout', 'Down came the rain and washed the spider out', 'Out came the sun and dried up all the rain', 'And the itsy bitsy spider climbed up the spout again'],
      notes: [
        [[G0, .5], [C, 1], [C, .5], [C, 1], [D, .5], [E, 1.5], [E, 1], [E, .5], [D, 1], [C, .5], [D, 1], [E, .5], [C, 1.5]],
        [[E, 1.5], [E, 1], [F, .5], [G, 1.5], [G, 1.5], [F, 1], [E, .5], [F, 1], [G, .5], [E, 1.5]],
        [[C, 1.5], [C, 1], [D, .5], [E, 1.5], [E, 1.5], [D, 1], [C, .5], [D, 1], [E, .5], [C, 1.5]],
        [[G0, .5], [G0, .5], [C, 1], [C, .5], [C, 1], [D, .5], [E, 1.5], [E, 1], [E, .5], [D, 1], [C, .5], [D, 1], [E, .5], [C, 1.5]],
      ],
    },
    {
      id: 'en-ducks', kind: 'en-song', title: 'Five Little Ducks', bpm: 120,
      art: svg(scene.pond() + [60, 200, 340, 480, 620].map((x, i) => put('duckling', x, 230 + (i % 2) * 20, 150, 'jump', 'pop')).join('')),
      lines: ['Five little ducks went out one day', 'Over the hill and far away', 'Mother duck said, quack, quack, quack, quack', 'But only four little ducks came back'],
      notes: [
        [[C, 1], [C, .5], [C, .5], [E, 1], [G, 1], [G, .5], [G, .5], [G, 2]],
        [[A, .5], [A, .5], [A, 1], [G, 1], [E, 1], [E, .5], [E, .5], [C, 2]],
        [[D, 1], [D, 1], [D, 1], [E, 1], [F, .5], [F, .5], [F, 1], [E, 2]],
        [[D, .5], [D, .5], [D, 1], [E, 1], [D, .5], [D, .5], [C, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'en-happy', kind: 'en-song', title: "If You're Happy and You Know It", bpm: 130,
      art: svg(scene.day() + scene.sun() + scene.grass() + put('shepherd', 60, 120, 300, 'jump', 'yay') + put('redhood', 420, 120, 300, 'jump', 'yay') + scene.heart(400, 110)),
      lines: ["If you're happy and you know it, clap your hands", "If you're happy and you know it, clap your hands", "If you're happy and you know it, then your face will surely show it", "If you're happy and you know it, clap your hands"],
      notes: [
        [[G0, .5], [G0, .5], [C, 1], [C, 1], [C, 1], [C, .5], [C, .5], [B0, .5], [C, .5], [D, 1], [D, 2]],
        [[G0, .5], [G0, .5], [D, 1], [D, 1], [D, 1], [D, .5], [D, .5], [C, .5], [D, .5], [E, 1], [E, 2]],
        [[E, .5], [E, .5], [F, 1], [F, 1], [F, 1], [A, .5], [A, .5], [F, 1], [F, .5], [F, .5], [E, 1], [E, .5], [E, .5], [D, .5], [D, .5], [C, 1]],
        [[E, .5], [E, .5], [D, 1], [D, 1], [D, 1], [C, .5], [C, .5], [B0, 1], [A0, .5], [B0, .5], [C, 2]],
      ],
    },
    {
      id: 'en-birthday', kind: 'en-song', title: 'Happy Birthday', bpm: 110, meter: 3,
      art: svg(scene.day() + scene.grass() + scene.cake(400, 320) + scene.stars()),
      lines: ['Happy birthday to you', 'Happy birthday to you', 'Happy birthday, dear friend', 'Happy birthday to you'],
      sing: ['Happy birthday to you', 'Happy birthday to you', 'Happy birthday, dear friend ~', 'Happy birthday to you'],
      notes: [
        [[G0, .75], [G0, .25], [A0, 1], [G0, 1], [C, 1], [B0, 2]],
        [[G0, .75], [G0, .25], [A0, 1], [G0, 1], [D, 1], [C, 2]],
        [[G0, .75], [G0, .25], [G, 1], [E, 1], [C, 1], [B0, 1], [A0, 2]],
        [[F, .75], [F, .25], [E, 1], [C, 1], [D, 1], [C, 3]],
      ],
    },
    {
      id: 'en-jack', kind: 'en-song', title: 'Jack and Jill', bpm: 110,
      art: svg(scene.hill() + put('shepherd', 180, 150, 200, 'jump', 'pop') + put('redhood', 420, 150, 200, 'jump', 'pop')),
      lines: ['Jack and Jill went up the hill', 'To fetch a pail of water', 'Jack fell down and broke his crown', 'And Jill came tumbling after'],
      notes: [
        [[C, 1], [C, .5], [D, 1], [D, .5], [E, 1], [E, .5], [F, 1.5]],
        [[G, 1], [G, .5], [A, 1], [G, .5], [F, 1], [E, .5], [D, 1.5]],
        [[C, 1], [C, .5], [D, 1], [D, .5], [E, 1], [E, .5], [F, 1.5]],
        [[G, .5], [G, 1], [E, .5], [D, 1], [B0, .5], [C, 1], [C, 2]],
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

  /* ======== 更多唐詩 ======== */
  const P = (id, title, author, art, lines) => SONGS.push({ id, kind: 'poem', title, author, art: svg(art), lines });
  P('deer-park', '鹿柴', '王維', scene.forest() + scene.tree(150) + scene.tree(400) + scene.tree(650) + scene.sun(700, 80), ['空山不見人', '但聞人語響', '返景入深林', '復照青苔上']);
  P('mountain-walk', '山行', '杜牧', scene.sunset() + scene.mountains('#ffa94d', '#ff8787') + scene.tree(650), ['遠上寒山石徑斜', '白雲生處有人家', '停車坐愛楓林晚', '霜葉紅於二月花']);
  P('temple-night', '夜宿山寺', '李白', scene.night() + scene.mountains('#5f3dc4', '#7048e8'), ['危樓高百尺', '手可摘星辰', '不敢高聲語', '恐驚天上人']);
  P('waterfall', '望廬山瀑布', '李白', scene.day() + scene.mountains() + `<path d="M380 120 L420 120 L440 500 L360 500 Z" fill="#a5d8ff" stroke="#222" stroke-width="5"/>`, ['日照香爐生紫煙', '遙看瀑布掛前川', '飛流直下三千尺', '疑是銀河落九天']);
  P('baidi', '早發白帝城', '李白', scene.day() + scene.sun() + scene.mountains() + scene.river() + scene.boat(400, 430), ['朝辭白帝彩雲間', '千里江陵一日還', '兩岸猿聲啼不住', '輕舟已過萬重山']);
  P('wang-lun', '贈汪倫', '李白', scene.day() + `<rect y="320" width="800" height="180" fill="#74c0fc"/>` + scene.boat(300, 340) + put('shepherd', 520, 140, 220), ['李白乘舟將欲行', '忽聞岸上踏歌聲', '桃花潭水深千尺', '不及汪倫送我情']);
  P('two-orioles', '絕句', '杜甫', scene.day() + scene.tree(200) + scene.birds(4) + `<rect y="380" width="800" height="120" fill="#74c0fc"/>` + scene.boat(560, 400), ['兩個黃鸝鳴翠柳', '一行白鷺上青天', '窗含西嶺千秋雪', '門泊東吳萬里船']);
  P('wind', '風', '李嶠', scene.day() + scene.grass() + scene.tree(200) + scene.tree(600) + `<g class="drift"><path d="M300 150 Q360 120 420 150 M280 200 Q360 170 440 200 M320 250 Q380 220 440 250" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></g>`, ['解落三秋葉', '能開二月花', '過江千尺浪', '入竹萬竿斜']);
  P('pond', '池上', '白居易', scene.pond() + scene.boat(400, 360) + scene.flowers(470), ['小娃撐小艇', '偷採白蓮回', '不解藏蹤跡', '浮萍一道開']);
  P('spring-rain', '春夜喜雨', '杜甫', scene.rain() + `<rect y="400" width="800" height="100" fill="#8ce99a"/>` + scene.flowers(440), ['好雨知時節', '當春乃發生', '隨風潛入夜', '潤物細無聲', '野徑雲俱黑', '江船火獨明', '曉看紅濕處', '花重錦官城']);
  P('maple-bridge', '楓橋夜泊', '張繼', scene.night() + `<rect y="380" width="800" height="120" fill="#364fc7"/>` + scene.boat(400, 390), ['月落烏啼霜滿天', '江楓漁火對愁眠', '姑蘇城外寒山寺', '夜半鐘聲到客船']);
  P('homecoming', '回鄉偶書', '賀知章', scene.day() + scene.grass() + scene.house('grandma', 500, 150, 240) + put('grandma', 40, 120, 300) + put('shepherd', 300, 180, 220), ['少小離家老大回', '鄉音無改鬢毛衰', '兒童相見不相識', '笑問客從何處來']);

  /* ======== 三字經、弟子規（幾百年前的經典，全文可用）：每段四句 ======== */
  const scroll = (bg, who) => svg(`<rect width="800" height="500" fill="${bg}"/>` + scene.grass(400) +
    `<g stroke="#222" stroke-width="6" stroke-linejoin="round"><rect x="440" y="90" width="300" height="250" rx="12" fill="#fff8e6"/><rect x="425" y="80" width="330" height="26" rx="13" fill="#c98a4b"/><rect x="425" y="326" width="330" height="26" rx="13" fill="#c98a4b"/>${[140, 180, 220, 260, 300].map(y => `<path d="M480 ${y} L700 ${y}" stroke-width="4" stroke="#d9c7a3"/>`).join('')}</g>` +
    put(who, 20, 120, 360, 'jump', 'pop'));
  const classics = [
    ['sanzi', '三字經', '王應麟', '#fff3bf', 'shepherd', [
      ['人之初，性本善', '性相近，習相遠', '苟不教，性乃遷', '教之道，貴以專'],
      ['昔孟母，擇鄰處', '子不學，斷機杼', '竇燕山，有義方', '教五子，名俱揚'],
      ['養不教，父之過', '教不嚴，師之惰', '子不學，非所宜', '幼不學，老何為'],
      ['玉不琢，不成器', '人不學，不知義', '為人子，方少時', '親師友，習禮儀'],
      ['香九齡，能溫席', '孝於親，所當執', '融四歲，能讓梨', '弟於長，宜先知'],
      ['首孝弟，次見聞', '知某數，識某文', '一而十，十而百', '百而千，千而萬'],
      ['三才者，天地人', '三光者，日月星', '三綱者，君臣義', '父子親，夫婦順'],
      ['曰春夏，曰秋冬', '此四時，運不窮', '曰南北，曰西東', '此四方，應乎中'],
      ['稻粱菽，麥黍稷', '此六穀，人所食', '馬牛羊，雞犬豕', '此六畜，人所飼'],
      ['勤有功，戲無益', '戒之哉，宜勉力', '人遺子，金滿籯', '我教子，惟一經'],
    ]],
    ['dizi', '弟子規', '李毓秀', '#e7f5ff', 'redhood', [
      ['弟子規，聖人訓', '首孝悌，次謹信', '泛愛眾，而親仁', '有餘力，則學文'],
      ['父母呼，應勿緩', '父母命，行勿懶', '父母教，須敬聽', '父母責，須順承'],
      ['兄道友，弟道恭', '兄弟睦，孝在中', '財物輕，怨何生', '言語忍，忿自泯'],
      ['朝起早，夜眠遲', '老易至，惜此時', '晨必盥，兼漱口', '便溺回，輒淨手'],
      ['凡出言，信為先', '詐與妄，奚可焉', '話說多，不如少', '惟其是，勿佞巧'],
      ['冠必正，紐必結', '襪與履，俱緊切', '置冠服，有定位', '勿亂頓，致污穢'],
      ['對飲食，勿揀擇', '食適可，勿過則', '年方少，勿飲酒', '飲酒醉，最為醜'],
      ['用人物，須明求', '倘不問，即為偷', '借人物，及時還', '後有急，借不難'],
      ['凡是人，皆須愛', '天同覆，地同載', '見人善，即思齊', '縱去遠，以漸躋'],
      ['不力行，但學文', '長浮華，成何人', '但力行，不學文', '任己見，昧理真'],
    ]],
  ];
  const nth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  for (const [kind, name, author, bg, who, parts] of classics) {
    parts.forEach((lines, i) => SONGS.push({
      id: `${kind}-${i + 1}`, kind, title: `${name}（${nth[i]}）`, author, art: scroll(bg, who), lines,
    }));
  }

  // 九九乘法歌：一到九，每一段念「二一得二、二二得四……」
  const { zh, timesLine } = window.WORDS;
  for (let n = 1; n <= 9; n++) {
    const dots = Array.from({ length: n }, (_, r) => Array.from({ length: Math.min(n, 9) }, (_, c) =>
      `<circle cx="${470 + c * 30}" cy="${130 + r * 30}" r="10" fill="#fff" opacity=".9"/>`).join('')).join('');
    SONGS.push({
      id: 'times-' + n, kind: 'times', title: zh(n) + '的乘法',
      art: svg(`<rect width="800" height="500" fill="${['#ff8787', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#b197fc', '#f783ac'][n - 1]}"/>
        <text x="230" y="330" text-anchor="middle" font-size="260" font-weight="900" fill="#fff" stroke="#222" stroke-width="8" paint-order="stroke" font-family="Chiron GoRound TC, sans-serif">${n}×</text>${dots}`),
      lines: Array.from({ length: 9 }, (_, i) => timesLine(n, i + 1)),
      sub: Array.from({ length: 9 }, (_, i) => `${n} × ${i + 1} = ${n * (i + 1)}`),
    });
  }

  window.SONGS = SONGS;
})();
