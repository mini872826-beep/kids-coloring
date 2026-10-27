/* 幼稚園英文課本（大班）：照課本一課一課打進來，每課有「問句、回答的句型、單字、念謠（chant）」。
 * 英文句子用英文的聲音念，中文用老師（MiniMax 台灣腔大姊姊）的聲音念：每一句都會被 tools/phrases.js 收進錄音清單。
 * 英文只能用 ASCII（' 不要用 ’），錄音程式才認得是英文。
 *
 * 單字：en 英文、zh 中文、pic 圖（emoji，或 'svg:名字' 用下面畫好的圖）
 *   words：課本上半頁的單字（可以套進句型）；extra：念謠裡的單字（只拿來考聽力）
 * 句型：ask／ans 裡的 ___ 換成單字（farm 的回答沒有空格：Yes, I do.）；askZh／ansZh 是中文
 * 念謠：title、lines（[英文, 中文意思]）
 */
(function () {
  const SVG = {
    crosswalk: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#868e96"/><g fill="#fff">${[8, 30, 52, 74, 96].map(x => `<rect x="${x}" y="10" width="14" height="70" rx="3"/>`).join('')}</g></svg>`,
    sky: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#74c0fc"/><g fill="#fff"><ellipse cx="38" cy="38" rx="22" ry="11"/><ellipse cx="52" cy="31" rx="16" ry="12"/><ellipse cx="86" cy="62" rx="20" ry="9"/><ellipse cx="96" cy="56" rx="12" ry="9"/></g></svg>`,
    sea: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d0ebff"/><path d="M0 40 H120 V80 Q120 90 110 90 H10 Q0 90 0 80 Z" fill="#1c7ed6"/><path d="M8 56 Q20 52 32 56 M54 66 Q66 62 78 66 M86 50 Q98 46 110 50" stroke="#a5d8ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M70 38 L70 18 L84 34 Z" fill="#fff" stroke="#495057" stroke-width="2"/><path d="M60 38 H90 L84 44 H66 Z" fill="#e8590c"/></svg>`,
    sandcastle: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><g fill="#fcc777" stroke="#b8741a" stroke-width="2.5" stroke-linejoin="round"><path d="M22 80 V48 H34 V40 H42 V48 H78 V40 H86 V48 H98 V80 Z"/><path d="M44 48 V26 H52 V20 H58 V26 H62 V20 H68 V26 H76 V48 Z"/></g><path d="M54 80 V66 Q60 58 66 66 V80 Z" fill="#b8741a"/><path d="M60 20 V8 L72 12 L60 16" fill="#ff6b6b" stroke="#b8741a" stroke-width="2"/></svg>`,
    barbecue: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><path d="M50 22 Q44 14 50 6 M62 22 Q56 14 62 6 M74 22 Q68 14 74 6" stroke="#adb5bd" stroke-width="3" fill="none" stroke-linecap="round"/><g stroke-linecap="round"><path d="M34 32 H86" stroke="#c92a2a" stroke-width="7"/><path d="M38 40 H82" stroke="#e8590c" stroke-width="7"/></g><path d="M24 44 H96 Q92 66 60 66 Q28 66 24 44 Z" fill="#343a40"/><path d="M44 64 L34 86 M76 64 L86 86 M60 66 V86" stroke="#343a40" stroke-width="4" stroke-linecap="round"/></svg>`,
    ricecake: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff9db"/><ellipse cx="60" cy="66" rx="48" ry="16" fill="#fff" stroke="#adb5bd" stroke-width="2"/><g stroke="#7a4a1c" stroke-width="2.5" stroke-linejoin="round"><path d="M30 60 L36 34 L66 34 L60 60 Z" fill="#a8652c"/><path d="M58 64 L64 38 L92 40 L86 66 Z" fill="#c07a3a"/></g><path d="M40 40 L60 40 M68 44 L86 46" stroke="#e8b27a" stroke-width="3" stroke-linecap="round"/></svg>`,
    starfish: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff4e6"/><path d="M60 8 L71 34 L100 36 L78 54 L86 82 L60 66 L34 82 L42 54 L20 36 L49 34 Z" fill="#ff922b" stroke="#d9480f" stroke-width="3" stroke-linejoin="round"/><g fill="#ffd8a8"><circle cx="60" cy="30" r="3"/><circle cx="76" cy="44" r="3"/><circle cx="44" cy="44" r="3"/><circle cx="52" cy="62" r="3"/><circle cx="68" cy="62" r="3"/></g><circle cx="54" cy="46" r="3" fill="#222"/><circle cx="66" cy="46" r="3" fill="#222"/></svg>`,
    one: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#fff3bf"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#e8590c" font-family="Nunito, sans-serif">1</text></svg>`,
    two: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d3f9d8"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#2b8a3e" font-family="Nunito, sans-serif">2</text></svg>`,
    three: `<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#d0ebff"/><text x="60" y="70" text-anchor="middle" font-size="68" font-weight="900" fill="#1971c2" font-family="Nunito, sans-serif">3</text></svg>`,
  };

  const UNITS = [
    {
      id: 'street', no: 1, name: '馬路上', icon: '🚦', color: '#4dabf7', dark: '#1971c2',
      q: ['What do you see on the street?', '你在馬路上看到什麼？'],
      ans: 'I see the ___.', ansZh: '我看見___。',
      words: [
        { id: 'police', en: 'traffic police', zh: '交警', pic: '👮' },
        { id: 'crosswalk', en: 'crosswalk', zh: '斑馬線', pic: 'svg:crosswalk' },
        { id: 'stop', en: 'stop sign', zh: '停止標誌', pic: '🛑' },
        { id: 'light', en: 'traffic light', zh: '交通燈號', pic: '🚦' },
      ],
      extra: [
        { id: 'feet', en: 'feet', zh: '腳', pic: '🦶' },
        { id: 'car', en: 'car', zh: '車子', pic: '🚗' },
      ],
      chant: {
        title: 'Cross the Street', zh: '過馬路',
        lines: [
          ['Go, go, cross the street.', '走、走，過馬路。'],
          ['Shuffle, shuffle, move your feet.', '小碎步，動動你的腳。'],
          ['Watch your steps.', '注意你的腳步。'],
          ['See the traffic light.', '看看紅綠燈。'],
          ['Safety first every time.', '每一次都要安全第一。'],
        ],
      },
    },
    {
      id: 'moon', no: 2, name: '中秋節', icon: '🥮', color: '#ffa94d', dark: '#d9480f',
      q: ['What do you do with your family during the Moon Festival?', '中秋節時，你和家人會做什麼？'],
      ans: 'We ___.', ansZh: '我們___。',
      words: [
        { id: 'mooncake', en: 'eat mooncakes', zh: '吃月餅', pic: '🥮' },
        { id: 'bbq', en: 'have a barbecue', zh: '烤肉', pic: 'svg:barbecue' },
        { id: 'watch', en: 'watch the moon', zh: '賞月', pic: '🎑' },
      ],
      extra: [
        { id: 'moon', en: 'moon', zh: '月亮', pic: '🌕' },
        { id: 'family', en: 'Mom and Dad', zh: '媽媽和爸爸', pic: '👨‍👩‍👦' },
      ],
      chant: {
        title: 'The Moon Festival', zh: '中秋節',
        lines: [
          ['The Moon Festival.', '中秋節。'],
          ['The moon is round, big and bright.', '月亮又圓、又大、又亮。'],
          ['Barbecue smells in the night.', '晚上烤肉香噴噴。'],
          ['We eat food, we are glad.', '我們吃東西，好開心。'],
          ['Happy time with Mom and Dad.', '和爸爸媽媽一起，快樂的時光。'],
        ],
      },
    },
    {
      id: 'teacher', no: 3, name: '我的老師', icon: '👩‍🏫', color: '#f783ac', dark: '#c2255c',
      q: ['Who is your teacher?', '你的老師是誰？'],
      ans: 'My teacher is ___.', ansZh: '我的老師是___。',
      noSentence: true,   // 句型要填老師的名字：單字不套進句子
      words: [
        { id: 'teacher', en: 'teacher', zh: '老師', pic: '👩‍🏫' },
        { id: 'school', en: 'school', zh: '學校', pic: '🏫' },
        { id: 'one', en: 'one', zh: '一', pic: 'svg:one' },
        { id: 'two', en: 'two', zh: '二', pic: 'svg:two' },
        { id: 'three', en: 'three', zh: '三', pic: 'svg:three' },
      ],
      extra: [
        { id: 'play', en: 'play', zh: '玩', pic: '🧸' },
        { id: 'happy', en: 'happy', zh: '開心', pic: '😄' },
      ],
      chant: {
        title: 'Teacher', zh: '老師',
        lines: [
          ['Teacher, teacher, look at me.', '老師、老師，看看我。'],
          ['I can count one, two, three.', '我會數一、二、三。'],
          ['Teacher, teacher, help me play.', '老師、老師，陪我玩。'],
          ['Make my school a happy day.', '讓我在學校快樂一整天。'],
        ],
      },
    },
    {
      id: 'beach', no: 4, name: '海邊', icon: '🏖️', color: '#3bc9db', dark: '#0c8599',
      q: ['What can you see at the beach?', '你在海邊看到什麼？'],
      ans: 'I see ___.', ansZh: '我看見___。',
      words: [
        { id: 'sky', en: 'the blue sky', zh: '藍天', pic: 'svg:sky' },
        { id: 'sea', en: 'the sea', zh: '海洋', pic: 'svg:sea' },
        { id: 'castle', en: 'a sandcastle', zh: '沙堡', pic: 'svg:sandcastle' },
        { id: 'waves', en: 'the waves', zh: '海浪', pic: '🌊' },
      ],
      extra: [
        { id: 'crab', en: 'a crab', zh: '螃蟹', pic: '🦀' },
        { id: 'starfish', en: 'a starfish', zh: '海星', pic: 'svg:starfish' },
      ],
      chant: {
        title: 'Sea', zh: '大海',
        lines: [
          ['Sea, sea, what do you see?', '大海、大海，你看到什麼？'],
          ['I see a crab looking at me.', '我看到一隻螃蟹在看我。'],
          ['Sea, sea, what do you see?', '大海、大海，你看到什麼？'],
          ['I see a starfish looking at me.', '我看到一隻海星在看我。'],
        ],
      },
    },
    {
      id: 'halloween', no: 5, name: '萬聖節', icon: '🎃', color: '#ff922b', dark: '#d9480f',
      q: ['What do you do on Halloween?', '你萬聖節都做什麼事？'],
      ans: '___.', ansZh: '___。',
      words: [
        { id: 'costume', en: 'I wear fun costumes', zh: '我穿有趣的戲服', pic: '🧙' },
        { id: 'trick', en: 'I say, Trick or Treat', zh: '我說不給糖果就搗蛋', pic: '🚪' },
        { id: 'candy', en: 'I eat yummy candy', zh: '我吃好吃的糖果', pic: '🍬' },
        { id: 'pumpkin', en: 'I carve orange pumpkins', zh: '我刻南瓜', pic: '🎃' },
      ],
      extra: [
        { id: 'ghost', en: 'ghost', zh: '鬼', pic: '👻' },
        { id: 'bat', en: 'bat', zh: '蝙蝠', pic: '🦇' },
        { id: 'cat', en: 'black cat', zh: '黑貓', pic: '🐈‍⬛' },
      ],
      chant: {
        title: 'Halloween', zh: '萬聖節',
        lines: [
          ['Pumpkins are orange, cats are black.', '南瓜是橘色的，貓咪是黑色的。'],
          ['Candy in my little sack.', '糖果裝在我的小袋子裡。'],
          ['Ghosts say BOO and bats fly by.', '鬼說「嚇！」，蝙蝠飛過去。'],
          ['Happy Halloween!', '萬聖節快樂！'],
          ['Look at the sky!', '看看天空！'],
        ],
      },
    },
    {
      id: 'farm', no: 6, name: '農場', icon: '🐄', color: '#69db7c', dark: '#2b8a3e',
      q: ['Do you see ___ on a farm?', '你在農場看得到___嗎？'],
      ask: 'Do you see ___ on a farm?', askZh: '你在農場看得到___嗎？',
      ans: 'Yes, I do.', ansZh: '是的，我有。',
      nope: ["No, I don't.", '沒有，我沒有。'],
      words: [
        { id: 'sheep', en: 'a sheep', zh: '綿羊', pic: '🐑' },
        { id: 'cow', en: 'a cow', zh: '牛', pic: '🐄' },
        { id: 'farmer', en: 'a farmer', zh: '農夫', pic: '🧑‍🌾' },
        { id: 'chick', en: 'a chick', zh: '小雞', pic: '🐤' },
      ],
      extra: [
        { id: 'duck', en: 'a duck', zh: '鴨子', pic: '🦆' },
        { id: 'tractor', en: 'a tractor', zh: '拖拉機', pic: '🚜' },
        { id: 'pig', en: 'a pig', zh: '豬', pic: '🐷' },
      ],
      chant: {
        title: 'The Farm', zh: '農場',
        lines: [
          ['The sun is up.', '太陽出來了。'],
          ['The farm is awake.', '農場醒來了。'],
          ['The duck swims in the little blue lake.', '鴨子在藍色的小湖裡游泳。'],
          ['The tractor goes chug, chug, chug.', '拖拉機噗、噗、噗。'],
          ['The happy pig gives the mud a hug.', '開心的小豬抱抱泥巴。'],
        ],
      },
    },
    {
      id: 'pets', no: 7, name: '寵物', icon: '🐶', color: '#e599f7', dark: '#9c36b5',
      q: ['Do you have a pet?', '你有養寵物嗎？'],
      ans: 'Yes, I have a ___.', ansZh: '有，我有一隻___。',
      words: [
        { id: 'dog', en: 'dog', zh: '狗', pic: '🐶' },
        { id: 'mouse', en: 'mouse', zh: '老鼠', pic: '🐭' },
        { id: 'cat', en: 'cat', zh: '貓', pic: '🐱' },
        { id: 'rabbit', en: 'rabbit', zh: '兔子', pic: '🐰' },
      ],
      extra: [
        { id: 'bird', en: 'bird', zh: '小鳥', pic: '🐦' },
        { id: 'butterfly', en: 'butterfly', zh: '蝴蝶', pic: '🦋' },
      ],
      chant: {
        title: 'Pets', zh: '寵物',
        lines: [
          ['My little dog says', '我的小狗說'],
          ['Woof, woof, woof.', '汪、汪、汪。'],
          ['Running on the roof, roof, roof.', '在屋頂上跑呀跑。'],
          ['My little cat says', '我的小貓說'],
          ['Meow, meow, meow.', '喵、喵、喵。'],
          ['Chasing a butterfly right here, right now.', '就在這裡追著蝴蝶。'],
          ['My little bird says', '我的小鳥說'],
          ['Tweet, tweet, tweet.', '啾、啾、啾。'],
          ['Flying high above the street.', '在街道上高高地飛。'],
        ],
      },
    },
    {
      id: 'fruit', no: 8, name: '水果', icon: '🍎', color: '#ff8787', dark: '#c92a2a',
      q: ['What fruit do you like?', '你喜歡什麼水果？'],
      ans: 'I like ___.', ansZh: '我喜歡___。',
      words: [
        { id: 'apple', en: 'apples', zh: '蘋果', pic: '🍎' },
        { id: 'banana', en: 'bananas', zh: '香蕉', pic: '🍌' },
        { id: 'orange', en: 'oranges', zh: '柳丁', pic: '🍊' },
        { id: 'grape', en: 'grapes', zh: '葡萄', pic: '🍇' },
      ],
      extra: [],
      chant: {
        title: 'Fruit', zh: '水果',
        lines: [
          ['Apples, apples, red and sweet.', '蘋果、蘋果，紅紅又甜甜。'],
          ['Bananas, bananas, good to eat.', '香蕉、香蕉，真好吃。'],
          ['Grapes, grapes, small and round.', '葡萄、葡萄，小小圓圓的。'],
          ['Oranges, oranges, rolling on the ground.', '柳丁、柳丁，在地上滾呀滾。'],
        ],
      },
    },
    {
      id: 'xmas', no: 9, name: '聖誕節', icon: '🎄', color: '#51cf66', dark: '#c92a2a',
      q: ['What do you want for Christmas?', '聖誕節你想要什麼禮物？'],
      ans: 'I want a ___.', ansZh: '我想要一個___。',
      words: [
        { id: 'robot', en: 'robot', zh: '機器人', pic: '🤖' },
        { id: 'car', en: 'toy car', zh: '玩具車', pic: '🚗' },
        { id: 'bear', en: 'teddy bear', zh: '泰迪熊', pic: '🧸' },
        { id: 'doll', en: 'doll', zh: '洋娃娃', pic: '🪆' },
      ],
      extra: [
        { id: 'star', en: 'star', zh: '星星', pic: '🌟' },
        { id: 'tree', en: 'Christmas tree', zh: '聖誕樹', pic: '🎄' },
      ],
      chant: {
        title: 'Christmas Star', zh: '聖誕星星',
        lines: [
          ['Christmas star shining bright.', '聖誕星星亮晶晶。'],
          ['Twinkling in the night.', '在晚上一閃一閃。'],
          ['Christmas tree green and tall.', '聖誕樹又綠又高。'],
          ['Merry Christmas to us all!', '祝大家聖誕快樂！'],
        ],
      },
    },
    {
      id: 'newyear', no: 10, name: '過新年', icon: '🧧', color: '#fa5252', dark: '#c92a2a',
      q: ['What would you like?', '你想要吃什麼？'],
      ans: "I'd like some ___.", ansZh: '我想要一些___。',
      words: [
        { id: 'chicken', en: 'chicken', zh: '雞肉', pic: '🍗' },
        { id: 'dumpling', en: 'dumplings', zh: '水餃', pic: '🥟' },
        { id: 'fish', en: 'fish', zh: '魚', pic: '🐟' },
        { id: 'ricecake', en: 'rice cakes', zh: '年糕', pic: 'svg:ricecake' },
      ],
      extra: [
        { id: 'mommy', en: 'Mommy', zh: '媽媽', pic: '👩' },
        { id: 'daddy', en: 'Daddy', zh: '爸爸', pic: '👨' },
      ],
      chant: {
        title: "On New Year's Day", zh: '新年這一天',
        lines: [
          ["On New Year's Day,", '新年這一天，'],
          ["on New Year's Day,", '新年這一天，'],
          ['This is what I always say:', '我總是會說：'],
          ['Happy New Year, Mommy!', '媽媽，新年快樂！'],
          ['Happy New Year, Daddy!', '爸爸，新年快樂！'],
          ["Have a happy New Year's Day!", '祝你新年快樂！'],
        ],
      },
    },
  ];

  const fill = (t, w) => t.replace('___', w);
  // 課本上半頁的單字套進句型：[英文問句?, 英文回答, 中文問句?, 中文回答]；沒有句型的回傳 null
  function sentence(u, w) {
    if (u.noSentence || (!u.ask && !u.words.includes(w))) return null;   // 念謠裡的單字不套句型（農場的問句都可以問）
    if (u.ask) return { en: [fill(u.ask, w.en), u.ans], zh: [fill(u.askZh, w.zh), u.ansZh] };
    return { en: [fill(u.ans, w.en).replace(/\.\.$/, '.')], zh: [fill(u.ansZh, w.zh)] };
  }
  // 圖：emoji 或畫好的 svg
  const picHTML = pic => pic.startsWith('svg:') ? SVG[pic.slice(4)] : `<span class="em">${pic}</span>`;

  // 念出來的固定用語（中文用老師的聲音）
  const T = {
    title: '幼稚園課本', titleEn: 'My School Book',
    listen: '聽一聽，哪一個是', listenSent: '聽聽看，說的是哪一個？', answer: '聽英文回答問題',
    yesNo: '看一看，有沒有？', look: '看看圖，答答看',
    tap: '點點看', tapHint: '點圖片，聽聽看怎麼念', chant: '念謠', readAll: '全部念一遍',
    review: '跟老師複習', words: '學單字', pattern: '說說看', meaning: '意思是',
    youPicked: '你選的是', right: '正確答案是', tryIt: '換你選選看', answerIs: '答案是',
    all: '總複習', allNote: '十課的單字一起考',
    yourTeacher: '說說看你的老師是誰', myTeacher: 'My teacher is', quiz: '小小考試',
  };

  // 給 tools/phrases.js：這些都要錄音
  function phrases() {
    const out = [...Object.values(T)];
    for (const u of UNITS) {
      out.push(u.name, ...u.q, u.ans, u.ansZh, u.chant.title, u.chant.zh, ...u.chant.lines.flat());
      if (u.nope) out.push(...u.nope);
      for (const w of [...u.words, ...u.extra]) {
        out.push(w.en, w.zh);
        const s = sentence(u, w);
        if (s) out.push(...s.en, ...s.zh);
      }
      out.push(`第${'一二三四五六七八九十'[u.no - 1]}課`);
    }
    return [...new Set(out.filter(t => !t.includes('___')))];
  }

  window.LESSONS = { UNITS, SVG, T, sentence, picHTML, phrases };
})();
