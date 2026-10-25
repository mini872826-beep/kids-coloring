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
    '加', '減', '等於多少？', '數一數，有幾個？', '答對了，好棒！', '再想想看', '答案是', '全部答完了！', '答對了', '題'];

  window.WORDS = { COLORS, colorName, BRUSHES, BRUSH_GROUPS, PATTERNS, SHAPES, FIXED, COLOR_NAMES, zh, numberWords, timesLine, MATH_WORDS };
})();
