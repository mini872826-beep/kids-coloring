/* 會被念出來的字：顏色、筆刷名字、固定用語。
 * 這個檔案不碰畫面，所以 GitHub 自動配音（tools/phrases.js）也讀得到。
 */
(function () {
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }

  // 顏色名字：照色相、深淺算出來，例如「淺藍色」「深綠色」
  function colorName(hex) {
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (sat < .18 || d < .08) return l > .93 ? '白色' : l < .12 ? '黑色' : l > .7 ? '淺灰色' : l < .4 ? '深灰色' : '灰色';
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    let name;
    if (h < 12 || h >= 345) name = '紅色';
    else if (h < 42) name = l < .45 ? '咖啡色' : '橘色';
    else if (h < 68) name = l < .4 ? '橄欖綠' : '黃色';
    else if (h < 160) name = '綠色';
    else if (h < 195) name = '青色';
    else if (h < 250) name = '藍色';
    else if (h < 290) name = '紫色';
    else name = '粉紅色';
    if (name === '咖啡色' || name === '橄欖綠') return name;
    if (l > .74) return (name === '紅色' ? '粉紅色' : '淺' + name);
    if (l < .32) return '深' + name;
    return name;
  }

  /* ---------------- 顏色：8 列 x 7 行，和參考圖一樣 ---------------- */
  const COLORS = [
    '#ff1f1f', '#ff9d1f', '#ffee00', '#2e8b1f', '#29b6f6', '#0019ff', '#7b1fd6', '#5a5a5a',
    '#c41414', '#ff6d00', '#ffc400', '#145214', '#1976d2', '#0a0f8c', '#3b0f8c', '#111111',
    '#f0625a', '#ff9f73', '#ffd633', '#33c41f', '#4dd0e1', '#2962ff', '#6a5cf0', '#a8a8a8',
    '#f8b8c0', '#ffd9a8', '#fff09a', '#c8ff7a', '#b2f0f0', '#b3d4ff', '#c5b5f5', '#ffffff',
    '#f06ad8', '#f7c060', '#99cc0f', '#7ddba0', '#36cfc0', '#2f8de0', '#b073f0', '#c9c5bf',
    '#e0249c', '#cc8a2e', '#b0b010', '#2fae8a', '#2aa2b8', '#2148c4', '#8e3fe0', '#9c9890',
    '#b5157a', '#6b2e10', '#5b7a10', '#1d8a72', '#1b7a8a', '#1e3f8a', '#5a2a80', '#5f5d58',
  ];

  // 分兩組：真正的「筆」放上面，好玩的特別工具放下面
  const BRUSHES = [
    { id: 'crayon', group: 'pen', name: '蠟筆' },
    { id: 'marker', group: 'pen', name: '馬克筆' },
    { id: 'pencil', group: 'pen', name: '鉛筆' },
    { id: 'water', group: 'pen', name: '水彩筆' },
    { id: 'bucket', group: 'magic', name: '油漆桶' },
    { id: 'spray', group: 'magic', name: '噴漆' },
    { id: 'rainbow', group: 'magic', name: '彩虹筆' },
    { id: 'glitter', group: 'magic', name: '閃粉筆' },
    { id: 'pattern', group: 'magic', name: '花紋滾筒' },
  ];
  const BRUSH_GROUPS = [
    { id: 'pen', name: '畫筆', icon: '✏️' },
    { id: 'magic', name: '特別工具', icon: '✨' },
  ];

  // 花紋滾筒可以選的花紋
  const PATTERNS = [
    { id: 'waves', name: '波浪' },
    { id: 'dots', name: '圓點點' },
    { id: 'stripes', name: '斜條紋' },
    { id: 'checks', name: '格子' },
    { id: 'hearts', name: '愛心' },
    { id: 'stars', name: '星星' },
    { id: 'zigzag', name: '鋸齒' },
    { id: 'rainbow', name: '彩虹' },
  ];

  // 閃粉筆可以選的造型
  const SHAPES = [
    { id: 'star', name: '星星' },
    { id: 'heart', name: '愛心' },
    { id: 'bubble', name: '泡泡' },
    { id: 'flower', name: '小花' },
    { id: 'diamond', name: '亮片' },
    { id: 'snow', name: '雪花' },
  ];

  // 程式裡固定會念的句子
  const FIXED = [
    '塗顏色', '聽故事', '學英文', '的英文是', '跟我念', '去畫畫', '兒歌唐詩', '兒歌', '唐詩', '畫筆', '特別工具', '故事主題', '全部', '品德', '好習慣', '經典故事', '冒險', '節日', '全部塗好了，好棒！', '先存起來囉，還有地方沒塗完，下次再畫！', '新的白紙', '畫好了，好棒！', '太棒啦，讀完啦！', '橡皮擦', '全部擦掉嗎？',
    '細細的', '中等的', '粗粗的', '不畫出線外，打開', '不畫出線外，關掉', '音樂開', '音樂關',
  ];
  // 所有可能的顏色名字（自選顏色也會落在這些裡面）
  const base = ['紅色', '橘色', '黃色', '綠色', '青色', '藍色', '紫色', '粉紅色'];
  const COLOR_NAMES = ['白色', '黑色', '灰色', '淺灰色', '深灰色', '咖啡色', '橄欖綠',
    ...base, ...base.map(n => '淺' + n), ...base.map(n => '深' + n)];

  /* ---------- 數字念法（學數學用） ----------
   * 念一個數字時拆成幾段，例如 325 =「三百」+「二十五」，
   * 這樣只要錄 0~99、幾百、零幾、一十幾這些片段，就能念 0~1000 的任何數字。
   */
  const DIG = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function zh(n) {   // 0 ~ 99
    if (n < 10) return DIG[n];
    if (n === 10) return '十';
    if (n < 20) return '十' + DIG[n % 10];
    return DIG[Math.floor(n / 10)] + '十' + (n % 10 ? DIG[n % 10] : '');
  }
  function numberWords(n) {
    if (n === 1000) return ['一千'];
    if (n < 100) return [zh(n)];
    const h = Math.floor(n / 100), r = n % 100, H = (h === 2 ? '兩' : DIG[h]) + '百';
    if (r === 0) return [H];
    if (r < 10) return [H, '零' + DIG[r]];
    if (r < 20) return [H, '一十' + (r % 10 ? DIG[r % 10] : '')];
    return [H, zh(r)];
  }
  // 九九乘法口訣：二三得六、三四十二、二五一十
  function timesLine(a, b) {
    const p = a * b;
    return zh(a) + zh(b) + (p < 10 ? '得' + zh(p) : p === 10 ? '一十' : zh(p));
  }
  const MATH_WORDS = ['學數學', '數一數', '個位數加減', '十位數加減', '百位數加減', '九九乘法', '九九乘法歌',
    '加', '減', '乘', '等於', '等於多少？', '用直式來算', '個位', '十位', '百位', '進一', '再加進位的一', '不夠減', '跟', '借一', '變成', '寫',
    '總共有', '個', '這裡有', '再來', '全部一起數一數', '拿走', '還剩', '排', '每排', '看教學', '數一數，有幾個？', '答對了，好棒！', '再想想看', '答案是', '全部答完了！', '答對了', '題',
    // 數學小遊戲（賽車、餵小熊、蓋高塔、青蛙跳荷葉）
    '選一個遊戲', '練習題', '賽車', '餵小熊', '蓋高塔', '青蛙跳荷葉',
    '往前走三格！', '退一格，沒關係！', '到終點了，你好棒！', '好好吃！', '小熊吃飽了，好開心！',
    '再蓋高一點！', '高塔蓋好了，好棒！', '跳到', '青蛙好開心，你好棒！',
    // 答錯直接下一題，最後「訂正時間」
    '沒關係，下一題', '我們來訂正', '你選了', '正確答案是', '換你選選看', '訂正完成，你好棒！', '全部答對，好厲害！', '你贏了！', '差一點點！再試一次！'];

  /* ---------- 學注音（台灣的注音符號，讀音照教育部國語辭典） ----------
   * 注音符號本身 AI 聲音念不準，所以每個符號用一個「同音的字」來念（ㄅ 念「玻」、ㄈ 念「佛」……），
   * 一個音節也用一個常見的字來念（ㄅㄚ 念「八」、ㄇㄚˇ 念「馬」）。多音字在 tools/voice/minimax.json 的 pronounce 指定讀音。
   * 例詞：w 詞、z 每個字的注音（空白分開；輕聲的點寫在最前面）、k 這個符號在第幾個字、pic 畫好的圖 id 或 emoji。
   */
  const ZY_SYMBOLS = [
    { z: 'ㄅ', say: '玻', g: 'sm1', w: '棒棒糖', z2: 'ㄅㄤˋ ㄅㄤˋ ㄊㄤˊ', pic: 'd-lollipop' },
    { z: 'ㄆ', say: '坡', g: 'sm1', w: '蘋果', z2: 'ㄆㄧㄥˊ ㄍㄨㄛˇ', pic: 'f-apple' },
    { z: 'ㄇ', say: '摸', g: 'sm1', w: '貓咪', z2: 'ㄇㄠ ㄇㄧ', pic: 'cat' },
    { z: 'ㄈ', say: '佛', g: 'sm1', w: '飛機', z2: 'ㄈㄟ ㄐㄧ', pic: 'plane' },
    { z: 'ㄉ', say: '德', g: 'sm1', w: '大象', z2: 'ㄉㄚˋ ㄒㄧㄤˋ', pic: 'elephant' },
    { z: 'ㄊ', say: '特', g: 'sm1', w: '太陽', z2: 'ㄊㄞˋ ㄧㄤˊ', pic: 's-sun' },
    { z: 'ㄋ', say: '訥', g: 'sm1', w: '牛奶', z2: 'ㄋㄧㄡˊ ㄋㄞˇ', pic: 'd-milk' },
    { z: 'ㄌ', say: '勒', g: 'sm1', w: '老虎', z2: 'ㄌㄠˇ ㄏㄨˇ', pic: 'tiger' },
    { z: 'ㄍ', say: '哥', g: 'sm2', w: '公車', z2: 'ㄍㄨㄥ ㄔㄜ', pic: 'bus' },
    { z: 'ㄎ', say: '科', g: 'sm2', w: '卡車', z2: 'ㄎㄚˇ ㄔㄜ', pic: 'truck' },
    { z: 'ㄏ', say: '呵', g: 'sm2', w: '蝴蝶', z2: 'ㄏㄨˊ ㄉㄧㄝˊ', pic: 'i-butterfly' },
    { z: 'ㄐ', say: '基', g: 'sm2', w: '鯨魚', z2: 'ㄐㄧㄥ ㄩˊ', pic: 'whale' },
    { z: 'ㄑ', say: '欺', g: 'sm2', w: '企鵝', z2: 'ㄑㄧˋ ㄜˊ', pic: 'penguin' },
    { z: 'ㄒ', say: '希', g: 'sm2', w: '西瓜', z2: 'ㄒㄧ ㄍㄨㄚ', pic: 'f-watermelon' },
    { z: 'ㄓ', say: '知', g: 'sm3', w: '蜘蛛', z2: 'ㄓ ㄓㄨ', pic: 'i-spider' },
    { z: 'ㄔ', say: '吃', g: 'sm3', w: '長頸鹿', z2: 'ㄔㄤˊ ㄐㄧㄥˇ ㄌㄨˋ', pic: 'giraffe' },
    { z: 'ㄕ', say: '詩', g: 'sm3', w: '獅子', z2: 'ㄕ ˙ㄗ', pic: 'lion' },
    { z: 'ㄖ', say: '日', g: 'sm3', w: '熱狗', z2: 'ㄖㄜˋ ㄍㄡˇ', pic: 'd-hotdog' },
    { z: 'ㄗ', say: '資', g: 'sm3', w: '足球', z2: 'ㄗㄨˊ ㄑㄧㄡˊ', pic: '⚽' },
    { z: 'ㄘ', say: '疵', g: 'sm3', w: '草莓', z2: 'ㄘㄠˇ ㄇㄟˊ', pic: 'f-strawberry' },
    { z: 'ㄙ', say: '思', g: 'sm3', w: '松鼠', z2: 'ㄙㄨㄥ ㄕㄨˇ', pic: 'squirrel' },
    { z: 'ㄧ', say: '衣', g: 'ym1', w: '鴨子', z2: 'ㄧㄚ ˙ㄗ', pic: 'duckling' },
    { z: 'ㄨ', say: '烏', g: 'ym1', w: '烏鴉', z2: 'ㄨ ㄧㄚ', pic: 'crow' },
    { z: 'ㄩ', say: '迂', g: 'ym1', w: '魚', z2: 'ㄩˊ', pic: 'fish' },
    { z: 'ㄚ', say: '啊', g: 'ym1', w: '阿公', z2: 'ㄚ ㄍㄨㄥ', pic: '👴' },
    { z: 'ㄛ', say: '喔', g: 'ym1', w: '外婆', z2: 'ㄨㄞˋ ㄆㄛˊ', k: 1, pic: 'grandma' },
    { z: 'ㄜ', say: '鵝', g: 'ym1', w: '鵝', z2: 'ㄜˊ', pic: 'swan' },
    { z: 'ㄝ', say: '欸', g: 'ym1', w: '葉子', z2: 'ㄧㄝˋ ˙ㄗ', pic: '🍃' },
    { z: 'ㄞ', say: '哀', g: 'ym2', w: '愛心', z2: 'ㄞˋ ㄒㄧㄣ', pic: '❤️' },
    { z: 'ㄟ', say: '誒', g: 'ym2', w: '杯子', z2: 'ㄅㄟ ˙ㄗ', pic: '🥤' },
    { z: 'ㄠ', say: '凹', g: 'ym2', w: '包子', z2: 'ㄅㄠ ˙ㄗ', pic: '🥟' },
    { z: 'ㄡ', say: '歐', g: 'ym2', w: '猴子', z2: 'ㄏㄡˊ ˙ㄗ', pic: 'monkey' },
    { z: 'ㄢ', say: '安', g: 'ym2', w: '安全帽', z2: 'ㄢ ㄑㄩㄢˊ ㄇㄠˋ', pic: '⛑️' },
    { z: 'ㄣ', say: '恩', g: 'ym2', w: '門', z2: 'ㄇㄣˊ', pic: '🚪' },
    { z: 'ㄤ', say: '骯', g: 'ym2', w: '糖果', z2: 'ㄊㄤˊ ㄍㄨㄛˇ', pic: '🍬' },
    { z: 'ㄥ', say: '鞥', g: 'ym2', w: '蜜蜂', z2: 'ㄇㄧˋ ㄈㄥ', k: 1, pic: 'i-bee' },
    { z: 'ㄦ', say: '兒', g: 'ym2', w: '耳朵', z2: 'ㄦˇ ˙ㄉㄨㄛ', pic: '👂' },
  ];
  // 中階：聲母＋韻母（都是一聲）、三拼音（中間有介音）、四個聲調
  const ZY_PIN = [['ㄅㄚ', '八'], ['ㄆㄚ', '趴'], ['ㄇㄚ', '媽'], ['ㄈㄚ', '發'], ['ㄊㄚ', '他'], ['ㄌㄚ', '拉'], ['ㄍㄜ', '哥'], ['ㄔㄜ', '車'],
    ['ㄅㄠ', '包'], ['ㄇㄠ', '貓'], ['ㄉㄠ', '刀'], ['ㄍㄠ', '高'], ['ㄈㄟ', '飛'], ['ㄅㄟ', '杯'], ['ㄏㄟ', '黑'], ['ㄎㄞ', '開'], ['ㄆㄞ', '拍'],
    ['ㄊㄡ', '偷'], ['ㄕㄢ', '山'], ['ㄙㄢ', '三'], ['ㄕㄣ', '身'], ['ㄍㄣ', '根'], ['ㄈㄤ', '方'], ['ㄊㄤ', '湯'], ['ㄉㄥ', '燈'], ['ㄈㄥ', '風'],
    ['ㄓㄨ', '豬'], ['ㄕㄨ', '書'], ['ㄎㄨ', '哭']];
  const ZY_JIE = [['ㄐㄧㄚ', '家'], ['ㄒㄧㄚ', '蝦'], ['ㄧㄚ', '鴨'], ['ㄏㄨㄚ', '花'], ['ㄍㄨㄚ', '瓜'], ['ㄨㄚ', '蛙'], ['ㄊㄧㄢ', '天'], ['ㄅㄧㄢ', '邊'],
    ['ㄒㄧㄥ', '星'], ['ㄅㄧㄥ', '冰'], ['ㄒㄧㄣ', '心'], ['ㄑㄧㄡ', '秋'], ['ㄔㄨㄤ', '窗'], ['ㄍㄨㄤ', '光'], ['ㄉㄨㄥ', '東'], ['ㄍㄨㄛ', '鍋'],
    ['ㄉㄨㄛ', '多'], ['ㄒㄩㄝ', '靴'], ['ㄑㄩㄝ', '缺'], ['ㄒㄩㄢ', '宣'], ['ㄐㄩㄣ', '軍'], ['ㄔㄨㄣ', '春']];
  const ZY_TONES = [
    [['ㄇㄚ', '媽'], ['ㄇㄚˊ', '麻'], ['ㄇㄚˇ', '馬'], ['ㄇㄚˋ', '罵']],
    [['ㄅㄚ', '八'], ['ㄅㄚˊ', '拔'], ['ㄅㄚˇ', '把'], ['ㄅㄚˋ', '爸']],
    [['ㄊㄤ', '湯'], ['ㄊㄤˊ', '糖'], ['ㄊㄤˇ', '躺'], ['ㄊㄤˋ', '燙']],
    [['ㄨ', '烏'], ['ㄨˊ', '無'], ['ㄨˇ', '五'], ['ㄨˋ', '霧']],
    [['ㄏㄨ', '呼'], ['ㄏㄨˊ', '湖'], ['ㄏㄨˇ', '虎'], ['ㄏㄨˋ', '戶']],
    [['ㄧㄡ', '優'], ['ㄧㄡˊ', '油'], ['ㄧㄡˇ', '有'], ['ㄧㄡˋ', '右']],
    [['ㄧ', '衣'], ['ㄧˊ', '姨'], ['ㄧˇ', '椅'], ['ㄧˋ', '意']],
  ];
  // 輕聲：用詞來念（單獨一個字念不出輕聲）
  const ZY_LIGHT = [{ w: '媽媽', z2: 'ㄇㄚ ˙ㄇㄚ', pic: '👩' }, { w: '爸爸', z2: 'ㄅㄚˋ ˙ㄅㄚ', pic: '👨' }];
  // 高階：圖＋詞語
  const ZY_VOCAB = {
    wa: [
      { w: '老虎', z2: 'ㄌㄠˇ ㄏㄨˇ', pic: 'tiger' }, { w: '小狗', z2: 'ㄒㄧㄠˇ ㄍㄡˇ', pic: 'dog' }, { w: '小貓', z2: 'ㄒㄧㄠˇ ㄇㄠ', pic: 'cat' },
      { w: '兔子', z2: 'ㄊㄨˋ ˙ㄗ', pic: 'bunny' }, { w: '大象', z2: 'ㄉㄚˋ ㄒㄧㄤˋ', pic: 'elephant' }, { w: '獅子', z2: 'ㄕ ˙ㄗ', pic: 'lion' },
      { w: '小豬', z2: 'ㄒㄧㄠˇ ㄓㄨ', pic: 'pig' }, { w: '熊貓', z2: 'ㄒㄩㄥˊ ㄇㄠ', pic: 'panda' }, { w: '猴子', z2: 'ㄏㄡˊ ˙ㄗ', pic: 'monkey' },
      { w: '斑馬', z2: 'ㄅㄢ ㄇㄚˇ', pic: 'zebra' }, { w: '青蛙', z2: 'ㄑㄧㄥ ㄨㄚ', pic: 'frog' }, { w: '企鵝', z2: 'ㄑㄧˋ ㄜˊ', pic: 'penguin' },
      { w: '蝴蝶', z2: 'ㄏㄨˊ ㄉㄧㄝˊ', pic: 'i-butterfly' }, { w: '螞蟻', z2: 'ㄇㄚˇ ㄧˇ', pic: 'i-ant' }, { w: '小雞', z2: 'ㄒㄧㄠˇ ㄐㄧ', pic: 'chick' },
      { w: '海豚', z2: 'ㄏㄞˇ ㄊㄨㄣˊ', pic: 'dolphin' }, { w: '長頸鹿', z2: 'ㄔㄤˊ ㄐㄧㄥˇ ㄌㄨˋ', pic: 'giraffe' },
    ],
    wf: [
      { w: '蘋果', z2: 'ㄆㄧㄥˊ ㄍㄨㄛˇ', pic: 'f-apple' }, { w: '香蕉', z2: 'ㄒㄧㄤ ㄐㄧㄠ', pic: 'f-banana' }, { w: '西瓜', z2: 'ㄒㄧ ㄍㄨㄚ', pic: 'f-watermelon' },
      { w: '草莓', z2: 'ㄘㄠˇ ㄇㄟˊ', pic: 'f-strawberry' }, { w: '蛋糕', z2: 'ㄉㄢˋ ㄍㄠ', pic: 'd-cake' }, { w: '牛奶', z2: 'ㄋㄧㄡˊ ㄋㄞˇ', pic: 'd-milk' },
      { w: '玉米', z2: 'ㄩˋ ㄇㄧˇ', pic: 'f-corn' }, { w: '紅蘿蔔', z2: 'ㄏㄨㄥˊ ㄌㄨㄛˊ ˙ㄅㄛ', pic: 'f-carrot' }, { w: '橘子', z2: 'ㄐㄩˊ ˙ㄗ', pic: 'f-orange' },
      { w: '餅乾', z2: 'ㄅㄧㄥˇ ㄍㄢ', pic: 'd-cookies' }, { w: '漢堡', z2: 'ㄏㄢˋ ㄅㄠˇ', pic: 'd-burger' }, { w: '薯條', z2: 'ㄕㄨˇ ㄊㄧㄠˊ', pic: 'd-fries' },
      { w: '茄子', z2: 'ㄑㄧㄝˊ ˙ㄗ', pic: 'f-eggplant' }, { w: '番茄', z2: 'ㄈㄢ ㄑㄧㄝˊ', pic: 'f-tomato' }, { w: '南瓜', z2: 'ㄋㄢˊ ㄍㄨㄚ', pic: 'f-pumpkin' },
    ],
    wg: [
      { w: '飛機', z2: 'ㄈㄟ ㄐㄧ', pic: 'plane' }, { w: '公車', z2: 'ㄍㄨㄥ ㄔㄜ', pic: 'bus' }, { w: '火車', z2: 'ㄏㄨㄛˇ ㄔㄜ', pic: 'train' },
      { w: '汽車', z2: 'ㄑㄧˋ ㄔㄜ', pic: 'car' }, { w: '卡車', z2: 'ㄎㄚˇ ㄔㄜ', pic: 'truck' }, { w: '輪船', z2: 'ㄌㄨㄣˊ ㄔㄨㄢˊ', pic: 'ship' },
      { w: '帆船', z2: 'ㄈㄢ ㄔㄨㄢˊ', pic: 'sailboat' }, { w: '火箭', z2: 'ㄏㄨㄛˇ ㄐㄧㄢˋ', pic: 's-rocket' }, { w: '太陽', z2: 'ㄊㄞˋ ㄧㄤˊ', pic: 's-sun' },
      { w: '星星', z2: 'ㄒㄧㄥ ㄒㄧㄥ', pic: 's-stars' }, { w: '地球', z2: 'ㄉㄧˋ ㄑㄧㄡˊ', pic: 's-earth' }, { w: '腳踏車', z2: 'ㄐㄧㄠˇ ㄊㄚˋ ㄔㄜ', pic: 'bicycle' },
      { w: '熱氣球', z2: 'ㄖㄜˋ ㄑㄧˋ ㄑㄧㄡˊ', pic: 'balloon' }, { w: '救護車', z2: 'ㄐㄧㄡˋ ㄏㄨˋ ㄔㄜ', pic: 'ambulance' }, { w: '摩托車', z2: 'ㄇㄛˊ ㄊㄨㄛ ㄔㄜ', pic: 'motorcycle' },
    ],
  };
  // 單獨念一個字會念錯（多音字）的音節：換一個同音、不會念錯的字來念
  const ZY_REP = { 'ㄔㄤˊ': '常', 'ㄐㄧㄥˇ': '井', 'ㄐㄧㄠˇ': '餃', 'ㄉㄧˋ': '弟', 'ㄑㄧˋ': '氣', 'ㄇㄚˇ': '馬', 'ㄍㄢ': '甘', 'ㄇㄛˊ': '魔', 'ㄈㄢ': '翻', 'ㄕㄨˇ': '鼠', 'ㄅㄠˇ': '飽' };
  const ZY_TONE_NAMES = ['', '一聲', '二聲', '三聲', '四聲', '輕聲'];
  // 關卡（首頁卡片）：name 顯示、say 念出來
  const ZY_TIERS = [
    { id: 'easy', name: '🌱 初階', note: '認識 37 個注音符號' },
    { id: 'mid', name: '🌿 中階', note: '拼音和四個聲調' },
    { id: 'hard', name: '🌳 高階', note: '看圖念詞語' },
  ];
  const ZY_LEVELS = [
    { id: 'sm1', tier: 'easy', name: '聲母 1', say: '聲母第一組', show: 'ㄅㄆㄇㄈ', color: '#ff6b6b', dark: '#e03131' },
    { id: 'sm2', tier: 'easy', name: '聲母 2', say: '聲母第二組', show: 'ㄍㄎㄏㄐ', color: '#ff922b', dark: '#e8590c' },
    { id: 'sm3', tier: 'easy', name: '聲母 3', say: '聲母第三組', show: 'ㄓㄔㄕㄖ', color: '#fab005', dark: '#e67700' },
    { id: 'ym1', tier: 'easy', name: '介音和韻母', show: 'ㄧㄨㄩㄚ', color: '#94d82d', dark: '#5c940d' },
    { id: 'ym2', tier: 'easy', name: '更多韻母', show: 'ㄞㄟㄠㄡ', color: '#51cf66', dark: '#2f9e44' },
    { id: 'pin', tier: 'mid', name: '拼一拼', show: 'ㄅ＋ㄚ', color: '#20c997', dark: '#099268' },
    { id: 'jie', tier: 'mid', name: '三拼音', show: 'ㄐㄧㄚ', color: '#22b8cf', dark: '#0c8599' },
    { id: 'tone', tier: 'mid', name: '四個聲調', show: 'ˉˊˇˋ', color: '#4dabf7', dark: '#1c7ed6' },
    { id: 'wa', tier: 'hard', name: '動物詞語', show: '老虎', color: '#845ef7', dark: '#6741d9' },
    { id: 'wf', tier: 'hard', name: '好吃的詞語', show: '蘋果', color: '#f06595', dark: '#c2255c' },
    { id: 'wg', tier: 'hard', name: '交通和天空', show: '飛機', color: '#5c7cfa', dark: '#3b5bdb' },
  ];
  // 學注音裡會念的固定句子（程式用 key 拿，保證念的字都在錄音清單裡）
  const ZY_TEXT = {
    tab: '學注音',
    hearSym: '聽一聽，是哪一個注音？',
    firstSym: '紅色的字，第一個注音是哪一個？',
    hasSym: '紅色的字裡面，有哪一個注音？',
    blend: '拼起來是哪一個？',
    hearSyl: '聽一聽，怎麼拼？',
    hearTone: '聽一聽，是第幾聲？',
    seeTone: '看一看，這是第幾聲？',
    charZy: '紅色的字，注音是哪一個？',
    charTone: '紅色的字，是第幾聲？',
    charPart: '紅色的字，少了哪一個注音？',
    meet: '我們來認識注音符號',
    readAll: '跟著念一次',
    learned: '你學會了', learnedN: '個注音符號',
    pinIntro: '聲母和韻母拼在一起，就變成一個音',
    jieIntro: '中間加上介音，三個一起拼',
    jieMid: '衣、烏、迂，叫做介音',
    toneIntro: '注音有四個聲調，還有輕聲',
    t1: '一聲，平平的，不用寫符號', t2: '二聲，往上揚', t3: '三聲，往下再往上', t4: '四聲，往下降', t5: '輕聲，輕輕短短的，點點寫在上面',
    toneAll: '一二三四，一起念念看',
    wordIntro: '每個字都有自己的注音',
    wordEach: '一個字一個字拼拼看',
    spell: '我們一起拼拼看',
    wrongPick: '你選的不對喔',
    youPicked: '你選了', right: '正確答案是', tryIt: '換你選選看', answer: '答案是', fix: '我們來訂正',
    initial: '聲母', medial: '介音', final: '韻母',
  };

  // 一個音節要念哪個字：符號念法 > 中階的字 > 高階詞語裡的字（多音字換成 ZY_REP）；輕聲沒有（用整個詞念）
  const ZY_SAY = {};
  ZY_SYMBOLS.forEach(s => { ZY_SAY[s.z] = s.say; });
  [...ZY_PIN, ...ZY_JIE, ...ZY_TONES.flat()].forEach(([z, c]) => { if (!ZY_SAY[z]) ZY_SAY[z] = c; });
  Object.entries(ZY_REP).forEach(([z, c]) => { if (!ZY_SAY[z]) ZY_SAY[z] = c; });
  Object.values(ZY_VOCAB).flat().forEach(v => v.z2.split(' ').forEach((z, i) => {
    if (!z.startsWith('˙') && !ZY_SAY[z]) ZY_SAY[z] = v.w[i];
  }));

  const ZHUYIN_WORDS = [...new Set([
    ...Object.values(ZY_TEXT), ...ZY_TONE_NAMES.filter(Boolean),
    ...ZY_LEVELS.map(l => l.say || l.name), ...Object.keys(ZY_SAY),
    ...ZY_SYMBOLS.map(s => s.w), ...ZY_LIGHT.map(v => v.w), ...Object.values(ZY_VOCAB).flat().map(v => v.w),
  ])];
  const ZHUYIN = { SYMBOLS: ZY_SYMBOLS, PIN: ZY_PIN, JIE: ZY_JIE, TONES: ZY_TONES, LIGHT: ZY_LIGHT, VOCAB: ZY_VOCAB, SAY: ZY_SAY, TONE_NAMES: ZY_TONE_NAMES, TIERS: ZY_TIERS, LEVELS: ZY_LEVELS, T: ZY_TEXT };

  window.WORDS = { COLORS, colorName, BRUSHES, BRUSH_GROUPS, PATTERNS, SHAPES, FIXED, COLOR_NAMES, zh, numberWords, timesLine, MATH_WORDS, ZHUYIN, ZHUYIN_WORDS };
})();
