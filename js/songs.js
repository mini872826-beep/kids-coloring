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
        [[D, 2], [G, 2], [E, 1], [C, 3]],
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
        [[G, .5], [G, .5], [G, .5], [G, .5], [F, .5], [F, .5], [F, 1], [E, .5], [E, .5], [E, 1], [D, 2]],
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
        [[E, 1.5], [D, .5], [C, 1], [D, 1], [E, 1], [E, 1], [E, 1], [E, 1]],
        [[D, 1], [D, 1], [E, 1], [D, 1], [C, 4]],
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
        [[D, .5], [D, .5], [G, 1], [G, 1], [G, 1], [D, .5], [D, .5], [G, 1], [G, 2]],
        [[G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, 1], [G, .5], [G, .5], [G, .5], [G, .5], [G, 2]],
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
        [[E, .5], [E, .5], [D, .5], [D, .5], [C, 1], [C, .5], [E, .5], [E, .5], [D, .5], [D, .5], [C, 1]],
        [[G, 1], [F, .5], [E, .5], [D, .5], [E, .5], [D, .5], [C, 2]],
      ],
    },
    {
      id: 'en-hickory', kind: 'en-song', title: 'Hickory Dickory Dock', bpm: 120,
      art: svg(scene.day() + scene.grass() + scene.clock(500, 260) + put('mouse', 80, 180, 260, 'jump', 'pop')),
      lines: ['Hickory dickory dock', 'The mouse ran up the clock', 'The clock struck one', 'The mouse ran down', 'Hickory dickory dock'],
      notes: [
        [[C, 1], [D, .5], [E, 1], [F, .5], [G, 2]],
        [[G, .5], [A, .5], [G, .5], [F, .5], [E, .5], [D, .5], [C, 2]],
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
        [[C, 1], [C, 1], [C, 1], [E, 1], [G, 1], [G, 1], [G, 2]],
        [[A, 1], [A, 1], [A, 1], [G, 1], [E, 1], [E, 1], [C, 2]],
        [[D, 1], [D, 1], [D, 1], [E, 1], [F, .5], [F, .5], [F, .5], [F, .5], [E, 2]],
        [[D, 1], [D, 1], [E, 1], [D, 1], [C, 1], [D, 1], [C, 2]],
      ],
    },
    {
      id: 'en-happy', kind: 'en-song', title: "If You're Happy and You Know It", bpm: 130,
      art: svg(scene.day() + scene.sun() + scene.grass() + put('shepherd', 60, 120, 300, 'jump', 'yay') + put('redhood', 420, 120, 300, 'jump', 'yay') + scene.heart(400, 110)),
      lines: ["If you're happy and you know it, clap your hands", "If you're happy and you know it, clap your hands", "If you're happy and you know it, then your face will surely show it", "If you're happy and you know it, clap your hands"],
      notes: [
        [[G0, .5], [G0, .5], [C, 1], [C, 1], [C, 1], [C, .5], [C, .5], [B0, .5], [C, .5], [D, 1], [D, 2]],
        [[G0, .5], [G0, .5], [D, 1], [D, 1], [D, 1], [D, .5], [D, .5], [C, .5], [D, .5], [E, 1], [E, 2]],
        [[E, .5], [E, .5], [F, 1], [F, 1], [F, 1], [A, .5], [A, .5], [F, 1], [F, .5], [E, .5], [E, 1], [E, .5], [D, .5], [C, 1], [C, 1]],
        [[E, .5], [E, .5], [D, 1], [D, 1], [D, 1], [C, .5], [B0, .5], [A0, .5], [B0, .5], [C, 2]],
      ],
    },
    {
      id: 'en-birthday', kind: 'en-song', title: 'Happy Birthday', bpm: 110,
      art: svg(scene.day() + scene.grass() + scene.cake(400, 320) + scene.stars()),
      lines: ['Happy birthday to you', 'Happy birthday to you', 'Happy birthday, dear friend', 'Happy birthday to you'],
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
        [[G, 1], [E, .5], [D, 1], [B0, .5], [C, 3]],
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
    ]],
    ['dizi', '弟子規', '李毓秀', '#e7f5ff', 'redhood', [
      ['弟子規，聖人訓', '首孝悌，次謹信', '泛愛眾，而親仁', '有餘力，則學文'],
      ['父母呼，應勿緩', '父母命，行勿懶', '父母教，須敬聽', '父母責，須順承'],
      ['兄道友，弟道恭', '兄弟睦，孝在中', '財物輕，怨何生', '言語忍，忿自泯'],
      ['朝起早，夜眠遲', '老易至，惜此時', '晨必盥，兼漱口', '便溺回，輒淨手'],
      ['凡出言，信為先', '詐與妄，奚可焉', '話說多，不如少', '惟其是，勿佞巧'],
    ]],
  ];
  const nth = ['一', '二', '三', '四', '五', '六'];
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
