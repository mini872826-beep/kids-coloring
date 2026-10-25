/* 線稿包：戰鬥陀螺 X（Beyblade X 風格的對戰陀螺）
 * 每顆都是寬寬扁扁的三層構造：上蓋（刀刃 + 金屬環 + 徽章）/ 固鎖輪盤（方形齒 + 數字）/ 軸心（齒輪 + 短尖端）。
 * 名字用台灣代理版的中文名。
 */
(function () {
  const { eye, sparkle } = window.ART.helpers;

  const f = n => n.toFixed(1);
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const TAU = Math.PI * 2;
  const K = 0.42; // 3/4 側面看時，圓盤壓扁的比例

  // n 角星（爆炸火花、星星）
  function star(cx, cy, R, r, n, fill, rot = -Math.PI / 2) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = rot + i * Math.PI / n, rr = i % 2 ? r : R;
      d += `${i ? ' L' : 'M'}${P(cx + rr * Math.cos(a), cy + rr * Math.sin(a))}`;
    }
    return `<path fill="${fill}" d="${d} Z"/>`;
  }
  // 橢圓上的一段弧線（速度線，只有線、不填色）
  function arc(cx, cy, rx, ry, a1, a2) {
    const p1 = P(cx + rx * Math.cos(a1), cy + ry * Math.sin(a1));
    const p2 = P(cx + rx * Math.cos(a2), cy + ry * Math.sin(a2));
    return `<path d="M${p1} A${f(rx)} ${f(ry)} 0 0 ${a2 > a1 ? 1 : 0} ${p2}"/>`;
  }

  /* ---------------- 陀螺中間的大徽章圖案 (x, y, s) ---------------- */
  // 龍頭（很多陀螺共用，換顏色和表情）
  function dragonHead(x, y, s, c) {
    const horn = c.horn || '#ffd43b';
    let o = `
      <path fill="${horn}" d="M${P(x - .32 * s, y - .5 * s)} L${P(x - .78 * s, y - 1.0 * s)} L${P(x - .08 * s, y - .62 * s)} Z"/>
      <path fill="${horn}" d="M${P(x + .32 * s, y - .5 * s)} L${P(x + .78 * s, y - 1.0 * s)} L${P(x + .08 * s, y - .62 * s)} Z"/>
      <path fill="${horn}" d="M${P(x - .5 * s, y - .2 * s)} L${P(x - .98 * s, y - .32 * s)} L${P(x - .78 * s, y - .08 * s)} L${P(x - 1.0 * s, y + .06 * s)} L${P(x - .52 * s, y + .1 * s)} Z"/>
      <path fill="${horn}" d="M${P(x + .5 * s, y - .2 * s)} L${P(x + .98 * s, y - .32 * s)} L${P(x + .78 * s, y - .08 * s)} L${P(x + 1.0 * s, y + .06 * s)} L${P(x + .52 * s, y + .1 * s)} Z"/>
      <path fill="${c.face}" d="M${P(x - .6 * s, y - .1 * s)} Q${P(x - .62 * s, y - .68 * s)} ${P(x, y - .7 * s)} Q${P(x + .62 * s, y - .68 * s)} ${P(x + .6 * s, y - .1 * s)} L${P(x + .52 * s, y + .3 * s)} L${P(x - .52 * s, y + .3 * s)} Z"/>
      <path fill="${c.snout}" d="M${P(x - .56 * s, y + .12 * s)} Q${P(x, y + .02 * s)} ${P(x + .56 * s, y + .12 * s)} Q${P(x + .5 * s, y + .58 * s)} ${P(x, y + .6 * s)} Q${P(x - .5 * s, y + .58 * s)} ${P(x - .56 * s, y + .12 * s)} Z"/>
      <path fill="#fff" d="M${P(x - .3 * s, y + .48 * s)} L${P(x - .2 * s, y + .48 * s)} L${P(x - .25 * s, y + .64 * s)} Z"/>
      <path fill="#fff" d="M${P(x + .3 * s, y + .48 * s)} L${P(x + .2 * s, y + .48 * s)} L${P(x + .25 * s, y + .64 * s)} Z"/>
      <path d="M${P(x - .26 * s, y + .2 * s)} L${P(x - .14 * s, y + .26 * s)} M${P(x + .26 * s, y + .2 * s)} L${P(x + .14 * s, y + .26 * s)}"/>
      ${eye(x - .27 * s, y - .26 * s, .13 * s)} ${eye(x + .27 * s, y - .26 * s, .13 * s)}`;
    if (c.mood === 'angry') o += `<path d="M${P(x - .47 * s, y - .44 * s)} L${P(x - .13 * s, y - .33 * s)} M${P(x + .47 * s, y - .44 * s)} L${P(x + .13 * s, y - .33 * s)}"/>`;
    if (c.mood === 'smile') o += `<path d="M${P(x - .24 * s, y + .4 * s)} Q${P(x, y + .58 * s)} ${P(x + .24 * s, y + .4 * s)}"/>`;
    if (c.helmet) o += `
      <path fill="${c.helmet}" d="M${P(x - .66 * s, y - .22 * s)} Q${P(x - .66 * s, y - .78 * s)} ${P(x, y - .8 * s)} Q${P(x + .66 * s, y - .78 * s)} ${P(x + .66 * s, y - .22 * s)} L${P(x + .5 * s, y - .34 * s)} Q${P(x, y - .48 * s)} ${P(x - .5 * s, y - .34 * s)} Z"/>
      <path fill="${c.plume || '#ff922b'}" d="M${P(x - .1 * s, y - .78 * s)} Q${P(x - .05 * s, y - 1.12 * s)} ${P(x + .45 * s, y - 1.1 * s)} Q${P(x + .2 * s, y - .95 * s)} ${P(x + .12 * s, y - .78 * s)} Z"/>`;
    return o;
  }
  const motif = {
    phoenix: (x, y, s) => `
      <path fill="#ff922b" d="M${P(x - .3 * s, y)} Q${P(x - .9 * s, y - .7 * s)} ${P(x - 1.25 * s, y - .25 * s)} Q${P(x - 1.0 * s, y - .1 * s)} ${P(x - 1.1 * s, y + .2 * s)} Q${P(x - .7 * s, y + .3 * s)} ${P(x - .3 * s, y + .3 * s)} Z"/>
      <path fill="#ff922b" d="M${P(x + .3 * s, y)} Q${P(x + .9 * s, y - .7 * s)} ${P(x + 1.25 * s, y - .25 * s)} Q${P(x + 1.0 * s, y - .1 * s)} ${P(x + 1.1 * s, y + .2 * s)} Q${P(x + .7 * s, y + .3 * s)} ${P(x + .3 * s, y + .3 * s)} Z"/>
      <path fill="#ffd43b" d="M${P(x - .1 * s, y - .45 * s)} Q${P(x - .35 * s, y - .85 * s)} ${P(x - .12 * s, y - 1.02 * s)} Q${P(x, y - .8 * s)} ${P(x + .12 * s, y - 1.0 * s)} Q${P(x + .36 * s, y - .82 * s)} ${P(x + .12 * s, y - .44 * s)} Z"/>
      <circle cx="${f(x)}" cy="${f(y - .1 * s)}" r="${f(.45 * s)}" fill="#ff6b6b"/>
      <path fill="#ffd43b" d="M${P(x - .14 * s, y + .02 * s)} L${P(x + .14 * s, y + .02 * s)} L${P(x, y + .3 * s)} Z"/>
      ${eye(x - .18 * s, y - .18 * s, .1 * s)} ${eye(x + .18 * s, y - .18 * s, .1 * s)}`,
    clock: (x, y, s) => {
      let o = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.88 * s)}" fill="#f8f0fc"/><path d="`;
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, r1 = i % 3 ? .72 * s : .6 * s;
        o += `M${P(x + r1 * Math.cos(a), y + r1 * Math.sin(a))} L${P(x + .82 * s * Math.cos(a), y + .82 * s * Math.sin(a))} `;
      }
      return o + `M${P(x, y)} L${P(x, y - .5 * s)} M${P(x, y)} L${P(x + .36 * s, y + .14 * s)}"/>
        <circle cx="${f(x)}" cy="${f(y)}" r="${f(.09 * s)}" fill="#222"/>`;
    },
    helmet: (x, y, s) => `
      <path fill="#4dabf7" d="M${P(x - .1 * s, y - .72 * s)} Q${P(x - .05 * s, y - 1.12 * s)} ${P(x + .55 * s, y - 1.05 * s)} Q${P(x + .25 * s, y - .9 * s)} ${P(x + .14 * s, y - .72 * s)} Z"/>
      <path fill="#dee2e6" d="M${P(x - .6 * s, y + .6 * s)} L${P(x - .62 * s, y - .1 * s)} Q${P(x - .6 * s, y - .78 * s)} ${P(x, y - .8 * s)} Q${P(x + .6 * s, y - .78 * s)} ${P(x + .62 * s, y - .1 * s)} L${P(x + .6 * s, y + .6 * s)} Z"/>
      <rect x="${f(x - .48 * s)}" y="${f(y - .22 * s)}" width="${f(.96 * s)}" height="${f(.2 * s)}" rx="${f(.1 * s)}" fill="#222"/>
      <path fill="#a5d8ff" d="M${P(x - .1 * s, y + .06 * s)} L${P(x + .1 * s, y + .06 * s)} L${P(x + .1 * s, y + .6 * s)} L${P(x - .1 * s, y + .6 * s)} Z"/>`,
    whip: (x, y, s) => dragonHead(x, y, s, { face: '#4dabf7', snout: '#e7f5ff', horn: '#ffd43b', mood: 'angry' }),
    charge: (x, y, s) => dragonHead(x, y, s, { face: '#4c6ef5', snout: '#bac8ff', horn: '#ffd43b', mood: 'angry' }),
    brave: (x, y, s) => dragonHead(x, y, s, { face: '#74c0fc', snout: '#f1f3f5', horn: '#ffd43b', mood: 'smile' }),
    meteor: (x, y, s) => dragonHead(x, y, s, { face: '#748ffc', snout: '#dbe4ff', horn: '#ff922b', helmet: '#ced4da', plume: '#ff922b' }),
    panther: (x, y, s) => `
      <path fill="#7950f2" d="M${P(x - .62 * s, y - .2 * s)} L${P(x - .55 * s, y - .85 * s)} L${P(x - .18 * s, y - .5 * s)} Z"/>
      <path fill="#7950f2" d="M${P(x + .62 * s, y - .2 * s)} L${P(x + .55 * s, y - .85 * s)} L${P(x + .18 * s, y - .5 * s)} Z"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.66 * s)}" ry="${f(.6 * s)}" fill="#9775fa"/>
      <ellipse cx="${f(x)}" cy="${f(y + .3 * s)}" rx="${f(.34 * s)}" ry="${f(.24 * s)}" fill="#e5dbff"/>
      <path fill="#222" d="M${P(x - .1 * s, y + .14 * s)} L${P(x + .1 * s, y + .14 * s)} L${P(x, y + .26 * s)} Z"/>
      <ellipse cx="${f(x - .26 * s)}" cy="${f(y - .14 * s)}" rx="${f(.15 * s)}" ry="${f(.11 * s)}" fill="#d8f5a2"/>
      <ellipse cx="${f(x + .26 * s)}" cy="${f(y - .14 * s)}" rx="${f(.15 * s)}" ry="${f(.11 * s)}" fill="#d8f5a2"/>
      <ellipse cx="${f(x - .26 * s)}" cy="${f(y - .14 * s)}" rx="${f(.04 * s)}" ry="${f(.1 * s)}" fill="#222"/>
      <ellipse cx="${f(x + .26 * s)}" cy="${f(y - .14 * s)}" rx="${f(.04 * s)}" ry="${f(.1 * s)}" fill="#222"/>`,
    // 犀牛：側面的頭，鼻子上一支大角
    rhino: (x, y, s) => {
      const Q = (a, b) => P(x + a * s, y + b * s);
      return `
      <path fill="#adb5bd" d="M${Q(-.42, -.42)} L${Q(-.62, -.86)} L${Q(-.2, -.5)} Z"/>
      <path fill="#ced4da" d="M${Q(-.82, -.15)} Q${Q(-.62, -.56)} ${Q(-.18, -.5)} L${Q(.25, -.3)} Q${Q(.6, -.12)} ${Q(.82, .2)} Q${Q(.84, .52)} ${Q(.5, .54)} L${Q(-.5, .5)} Q${Q(-.88, .32)} ${Q(-.82, -.15)} Z"/>
      <path fill="#fff3bf" d="M${Q(.38, -.2)} Q${Q(.62, -.5)} ${Q(.86, -.9)} Q${Q(.88, -.36)} ${Q(.8, .1)} Q${Q(.6, -.08)} ${Q(.38, -.2)} Z"/>
      <path fill="#fff3bf" d="M${Q(.06, -.38)} Q${Q(.16, -.6)} ${Q(.3, -.74)} Q${Q(.34, -.48)} ${Q(.3, -.28)} Z"/>
      ${eye(x + .02 * s, y - .12 * s, .1 * s)}
      <circle cx="${f(x + .64 * s)}" cy="${f(y + .26 * s)}" r="${f(.05 * s)}" fill="#222"/>
      <path d="M${Q(.28, .4)} Q${Q(.5, .44)} ${Q(.72, .38)} M${Q(-.5, .02)} Q${Q(-.4, .2)} ${Q(-.3, .02)}"/>`;
    },
    shark: (x, y, s) => `
      <path fill="#4dabf7" d="M${P(x - .25 * s, y - .45 * s)} L${P(x + .15 * s, y - 1.05 * s)} L${P(x + .3 * s, y - .45 * s)} Z"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.8 * s)}" ry="${f(.58 * s)}" fill="#74c0fc"/>
      <path fill="#f1f3f5" d="M${P(x - .5 * s, y + .1 * s)} Q${P(x, y + .7 * s)} ${P(x + .5 * s, y + .1 * s)} Z"/>
      <path d="M${P(x - .42 * s, y + .14 * s)} L${P(x - .28 * s, y + .34 * s)} L${P(x - .14 * s, y + .16 * s)} L${P(x, y + .38 * s)} L${P(x + .14 * s, y + .16 * s)} L${P(x + .28 * s, y + .34 * s)} L${P(x + .42 * s, y + .14 * s)}"/>
      ${eye(x - .32 * s, y - .18 * s, .11 * s)} ${eye(x + .32 * s, y - .18 * s, .11 * s)}`,
    turtle: (x, y, s) => `
      <circle cx="${f(x)}" cy="${f(y - .62 * s)}" r="${f(.24 * s)}" fill="#b2f2bb"/>
      ${eye(x - .1 * s, y - .66 * s, .07 * s)} ${eye(x + .1 * s, y - .66 * s, .07 * s)}
      <ellipse cx="${f(x - .62 * s)}" cy="${f(y + .38 * s)}" rx="${f(.2 * s)}" ry="${f(.15 * s)}" fill="#b2f2bb"/>
      <ellipse cx="${f(x + .62 * s)}" cy="${f(y + .38 * s)}" rx="${f(.2 * s)}" ry="${f(.15 * s)}" fill="#b2f2bb"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.72 * s)}" ry="${f(.52 * s)}" fill="#c0874a"/>
      <path fill="#e8b16f" d="M${P(x - .3 * s, y)} L${P(x - .15 * s, y - .26 * s)} L${P(x + .15 * s, y - .26 * s)} L${P(x + .3 * s, y)} L${P(x + .15 * s, y + .26 * s)} L${P(x - .15 * s, y + .26 * s)} Z"/>`,
    unicorn: (x, y, s) => `
      <path fill="#ffe066" d="M${P(x - .14 * s, y - .5 * s)} L${P(x, y - 1.1 * s)} L${P(x + .14 * s, y - .5 * s)} Z"/>
      <path fill="#f3d9fa" d="M${P(x - .5 * s, y - .3 * s)} L${P(x - .42 * s, y - .78 * s)} L${P(x - .18 * s, y - .45 * s)} Z"/>
      <path fill="#f3d9fa" d="M${P(x + .5 * s, y - .3 * s)} L${P(x + .42 * s, y - .78 * s)} L${P(x + .18 * s, y - .45 * s)} Z"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.5 * s)}" ry="${f(.58 * s)}" fill="#f8f0fc"/>
      <ellipse cx="${f(x)}" cy="${f(y + .38 * s)}" rx="${f(.34 * s)}" ry="${f(.22 * s)}" fill="#fcc2d7"/>
      ${eye(x - .2 * s, y - .08 * s, .1 * s)} ${eye(x + .2 * s, y - .08 * s, .1 * s)}`,
    // 雄獅：一圈鬃毛 + 獅子臉
    lion: (x, y, s) => {
      let d = '';
      for (let i = 0; i < 20; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 10, rr = i % 2 ? .78 * s : 1.0 * s;
        d += `${i ? ' L' : 'M'}${P(x + rr * 1.15 * Math.cos(a), y + rr * Math.sin(a))}`;
      }
      return `<path fill="#ff922b" d="${d} Z"/>
      <circle cx="${f(x - .44 * s)}" cy="${f(y - .46 * s)}" r="${f(.16 * s)}" fill="#ffd43b"/>
      <circle cx="${f(x + .44 * s)}" cy="${f(y - .46 * s)}" r="${f(.16 * s)}" fill="#ffd43b"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.6 * s)}" ry="${f(.58 * s)}" fill="#ffd43b"/>
      <ellipse cx="${f(x)}" cy="${f(y + .3 * s)}" rx="${f(.32 * s)}" ry="${f(.22 * s)}" fill="#fff3bf"/>
      <path fill="#222" d="M${P(x - .12 * s, y + .12 * s)} L${P(x + .12 * s, y + .12 * s)} L${P(x, y + .25 * s)} Z"/>
      <path d="M${P(x - .2 * s, y + .4 * s)} Q${P(x, y + .5 * s)} ${P(x + .2 * s, y + .4 * s)}"/>
      <path d="M${P(x - .44 * s, y - .32 * s)} L${P(x - .14 * s, y - .2 * s)} M${P(x + .44 * s, y - .32 * s)} L${P(x + .14 * s, y - .2 * s)}"/>
      ${eye(x - .26 * s, y - .08 * s, .1 * s)} ${eye(x + .26 * s, y - .08 * s, .1 * s)}`;
    },
    // 魔導師：尖帽子 + 星星 + 白鬍子
    wizard: (x, y, s) => `
      <path fill="#7950f2" d="M${P(x - .62 * s, y - .3 * s)} Q${P(x - .2 * s, y - .62 * s)} ${P(x + .18 * s, y - 1.12 * s)} Q${P(x + .1 * s, y - .8 * s)} ${P(x + .5 * s, y - .32 * s)} Z"/>
      <path fill="#ffe066" d="M${P(x - .78 * s, y - .32 * s)} Q${P(x, y - .48 * s)} ${P(x + .78 * s, y - .32 * s)} Q${P(x, y - .1 * s)} ${P(x - .78 * s, y - .32 * s)} Z"/>
      <path fill="#f8f9fa" d="M${P(x - .46 * s, y + .02 * s)} Q${P(x - .5 * s, y + .6 * s)} ${P(x, y + .9 * s)} Q${P(x + .5 * s, y + .6 * s)} ${P(x + .46 * s, y + .02 * s)} Q${P(x, y + .36 * s)} ${P(x - .46 * s, y + .02 * s)} Z"/>
      <path fill="#ffd8a8" d="M${P(x - .46 * s, y + .02 * s)} Q${P(x - .46 * s, y - .26 * s)} ${P(x, y - .24 * s)} Q${P(x + .46 * s, y - .26 * s)} ${P(x + .46 * s, y + .02 * s)} Q${P(x, y + .36 * s)} ${P(x - .46 * s, y + .02 * s)} Z"/>
      ${eye(x - .18 * s, y - .04 * s, .09 * s)} ${eye(x + .18 * s, y - .04 * s, .09 * s)}
      ${star(x + .02 * s, y - .62 * s, .16 * s, .07 * s, 5, '#ffe066')}`,
    // 惡魔死神：大兜帽 + 發光的眼睛
    reaper: (x, y, s) => `
      <path fill="#495057" d="M${P(x - .7 * s, y + .7 * s)} Q${P(x - .8 * s, y - .5 * s)} ${P(x, y - .95 * s)} Q${P(x + .8 * s, y - .5 * s)} ${P(x + .7 * s, y + .7 * s)} Q${P(x, y + .5 * s)} ${P(x - .7 * s, y + .7 * s)} Z"/>
      <path fill="#343a40" d="M${P(x - .44 * s, y + .4 * s)} Q${P(x - .5 * s, y - .5 * s)} ${P(x, y - .56 * s)} Q${P(x + .5 * s, y - .5 * s)} ${P(x + .44 * s, y + .4 * s)} Q${P(x, y + .28 * s)} ${P(x - .44 * s, y + .4 * s)} Z"/>
      <path fill="#ff6b6b" d="M${P(x - .34 * s, y - .16 * s)} L${P(x - .06 * s, y - .02 * s)} L${P(x - .3 * s, y + .08 * s)} Z"/>
      <path fill="#ff6b6b" d="M${P(x + .34 * s, y - .16 * s)} L${P(x + .06 * s, y - .02 * s)} L${P(x + .3 * s, y + .08 * s)} Z"/>`,
    star: (x, y, s) => star(x, y, .75 * s, .34 * s, 5, '#ffe066'),
  };

  /* ---------------- 每顆陀螺：上蓋形狀 + 顏色 + 固鎖輪盤 + 軸心 ----------------
   * lobe：一片上蓋刀刃的外緣 [位置(0~1), 半徑比例]，刀刃和刀刃之間的空隙會露出銀色金屬環
   * light / mid：刀刃上斜面的亮面、暗面；side：上蓋側面
   * rat：固鎖輪盤上的數字（第一個數字＝齒的數目）；bit：軸心尖端的樣子
   */
  const THEME = {
    // 鳳凰飛翼 PhoenixWing 9-60GF：紅色，三片往後掃的大翅膀
    phoenix: { n: 3, rot: -1.9, lobe: [[0, .72], [.06, .86], [.14, .84], [.22, .95], [.3, .9], [.4, 1.0], [.48, .94], [.62, 1.1], [.68, .9], [.78, .72]],
      blade: '#ff6b6b', light: '#ffa8a8', mid: '#f03e3e', side: '#c92a2a', core: '#ffd43b', emb: '#fff4e6', m: 'phoenix',
      rat: '9-60', ratC: '#868e96', bit: 'flat', bitC: '#ff8787', gearC: '#ffd43b' },
    // 時鐘幻象 ClockMirage：紫色，六塊方方的時鐘刻度
    clock: { n: 6, rot: -1.57 - .3, lobe: [[0, .78], [.06, .92], [.14, .99], [.62, .99], [.7, .92], [.76, .78]],
      blade: '#da77f2', light: '#f3d9fa', mid: '#be4bdb', side: '#9c36b5', core: '#ced4da', emb: '#f8f0fc', m: 'clock',
      rat: '5-70', ratC: '#868e96', bit: 'ball', bitC: '#e599f7', gearC: '#ced4da' },
    // 騎士重盾 KnightShield 3-80N：圓圓的，四面大盾牌
    knight: { n: 4, rot: -1.57 - .4, lobe: [[0, .78], [.05, .9], [.14, .97], [.3, 1.0], [.5, 1.01], [.7, 1.0], [.86, .97], [.93, .9], [.96, .78]], split: 4,
      blade: '#e9ecef', light: '#f8f9fa', mid: '#ced4da', side: '#868e96', core: '#74c0fc', emb: '#e7f5ff', m: 'helmet',
      rat: '3-80', ratC: '#495057', bit: 'needle', bitC: '#74c0fc', gearC: '#ced4da' },
    // 蒼龍神劍 DranSword 3-60F：藍色，三把往前砍的大劍
    whip: { n: 3, rot: -2.2, lobe: [[0, .78], [.1, .84], [.25, .9], [.42, .96], [.6, 1.1], [.64, .94], [.72, .78]],
      blade: '#4dabf7', light: '#d0ebff', mid: '#1c7ed6', side: '#1864ab', core: '#e9ecef', emb: '#e7f5ff', m: 'whip',
      rat: '3-60', ratC: '#868e96', bit: 'flat', bitC: '#f1f3f5', gearC: '#4dabf7' },
    // 蒼龍突擊 DranStrike 4-50FF：深藍色，四支往前刺的長槍
    charge: { n: 4, rot: -1.57 - 1.0, lobe: [[0, .8], [.3, .84], [.4, .92], [.48, 1.1], [.54, .92], [.64, .84], [.72, .8]],
      blade: '#4c6ef5', light: '#bac8ff', mid: '#3b5bdb', side: '#364fc7', core: '#ffd43b', emb: '#edf2ff', m: 'charge',
      rat: '4-50', ratC: '#868e96', bit: 'flat', bitC: '#ffd43b', gearC: '#4c6ef5' },
    // 蒼龍勇氣 DranBrave 6-60V：兩片大大的龍翅膀
    brave: { n: 2, rot: -2.0, lobe: [[0, .78], [.06, .9], [.14, 1.02], [.22, .9], [.32, 1.06], [.42, .9], [.54, 1.02], [.64, .9], [.76, .96], [.84, .86], [.88, .78]],
      blade: '#74c0fc', light: '#e7f5ff', mid: '#339af0', side: '#1971c2', core: '#ff6b6b', emb: '#f8f9fa', m: 'brave',
      rat: '6-60', ratC: '#868e96', bit: 'taper', bitC: '#ff8787', gearC: '#74c0fc' },
    // 隕星龍騎士 MeteorDragoon 3-70J：左迴旋，三道流星火焰
    meteor: { n: 3, rot: -1.2, left: true, lobe: [[0, .8], [.2, .86], [.28, .82], [.44, .97], [.52, .86], [.68, 1.08], [.74, .78]],
      blade: '#3b5bdb', light: '#91a7ff', mid: '#364fc7', side: '#1c2f8a', core: '#ff922b', emb: '#dbe4ff', m: 'meteor',
      rat: '3-70', ratC: '#868e96', bit: 'point', bitC: '#ffc078', gearC: '#ff922b' },
    // 獨角刺心 UnicornSting 5-60GP：五根尖尖的螫刺
    unicorn: { n: 5, rot: -1.57 - .7, lobe: [[0, .82], [.2, .86], [.45, 1.08], [.52, .9], [.7, .82]],
      blade: '#e599f7', light: '#f8f0fc', mid: '#cc5de8', side: '#ae3ec9', core: '#ffe066', emb: '#f8f0fc', m: 'unicorn',
      rat: '5-60', ratC: '#868e96', bit: 'point', bitC: '#ffe066', gearC: '#e599f7' },
    // 鮫鯊狂鱗 SharkScale：九片鋸齒鯊魚鱗
    shark: { n: 9, rot: -1.57, lobe: [[0, .8], [.68, 1.02], [.76, .8]], split: 1,
      blade: '#4dabf7', light: '#d0ebff', mid: '#228be6', side: '#1864ab', core: '#e9ecef', emb: '#e7f5ff', m: 'shark',
      rat: '4-50', ratC: '#868e96', bit: 'flat', bitC: '#a5d8ff', gearC: '#e9ecef' },
    // 雄獅獵爪 LeonClaw 5-60P：金色，五隻勾勾獅爪
    panther: { n: 5, rot: -1.57 - .5, lobe: [[0, .8], [.14, .9], [.22, .84], [.4, .96], [.48, .86], [.62, 1.06], [.68, .78]],
      blade: '#ffd43b', light: '#fff3bf', mid: '#fab005', side: '#e67700', core: '#ff922b', emb: '#fff9db', m: 'lion',
      rat: '5-60', ratC: '#868e96', bit: 'point', bitC: '#ffa94d', gearC: '#ffd43b' },
    // 魔導幻箭 WizardArrow 4-80B：綠色，四支魔法箭頭
    turtle: { n: 4, rot: -1.57 - .6, lobe: [[0, .8], [.16, .86], [.28, .82], [.42, 1.08], [.5, .82], [.58, .92], [.7, .84], [.76, .8]], split: 3,
      blade: '#69db7c', light: '#d3f9d8', mid: '#40c057', side: '#2b8a3e', core: '#ffd43b', emb: '#ebfbee', m: 'wizard',
      rat: '4-80', ratC: '#868e96', bit: 'ball', bitC: '#b2f2bb', gearC: '#ffd43b' },
    // 戰犀號角 RhinoHorn 3-80S：三支大犀牛角
    rhino: { n: 3, rot: -2.2, lobe: [[0, .8], [.2, .84], [.34, .9], [.44, 1.12], [.5, .9], [.62, .86], [.76, .8]],
      blade: '#d9a066', light: '#f1cfa3', mid: '#b8763a', side: '#8a5a2b', core: '#ff922b', emb: '#f1f3f5', m: 'rhino',
      rat: '3-80', ratC: '#868e96', bit: 'spike', bitC: '#ffa94d', gearC: '#d9a066' },
    // 惡魔紅鐮 HellsScythe 4-60T：四把彎彎的紅色鐮刀
    hells: { n: 4, rot: -1.9, lobe: [[0, .78], [.12, .88], [.3, .95], [.48, 1.0], [.64, 1.1], [.6, .9], [.7, .78]],
      blade: '#fa5252', light: '#ffc9c9', mid: '#e03131', side: '#862e2e', core: '#495057', emb: '#f1f3f5', m: 'reaper',
      rat: '4-60', ratC: '#868e96', bit: 'taper', bitC: '#ff8787', gearC: '#495057' },
    // 獎盃上的金色陀螺
    gold: { n: 6, rot: -1.57, lobe: [[0, .8], [.1, .9], [.45, 1.04], [.62, .9], [.76, .8]],
      blade: '#ffd43b', light: '#fff3bf', mid: '#fab005', side: '#f59f00', core: '#ffec99', emb: '#fff9db', m: 'star',
      rat: '6-60', ratC: '#fab005', bit: 'point', bitC: '#ffe066', gearC: '#fab005' },
  };

  const poly = pts => 'M' + pts.map(p => P(p[0], p[1])).join(' L') + ' Z';
  const ell = (x, y, rx, ry, c) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}"/>`;
  // 圓柱的前半面（上平面 y1 → 下平面 y2）
  const band = (cx, y1, y2, rx, k, c) =>
    `<path fill="${c}" d="M${P(cx - rx, y1)} A${f(rx)} ${f(rx * k)} 0 0 0 ${P(cx + rx, y1)} L${P(cx + rx, y2)} A${f(rx)} ${f(rx * k)} 0 0 1 ${P(cx - rx, y2)} Z"/>`;

  // 上蓋的每一片刀刃（極座標 [角度, 半徑比例]），左迴旋的陀螺左右相反
  function pieces(th) {
    const out = [];
    const w = th.lobe[th.lobe.length - 1][0];
    for (let i = 0; i < th.n; i++) {
      const ang = ph => th.left ? th.rot - (i + ph) / th.n * TAU : th.rot + (i + ph) / th.n * TAU;
      const outer = th.lobe.map(([ph, rf]) => [ang(ph), rf]);
      const inner = [];
      for (let j = 6; j >= 0; j--) inner.push([ang(w * j / 6), .4]);
      let pc = outer.concat(inner);
      // 不論左右迴旋，點的順序都要是「畫面上順時針」
      if (th.left) pc = pc.reverse();
      out.push({ outer: th.left ? outer.slice().reverse() : outer, poly: pc, ang });
    }
    return out;
  }
  // 斜面：沿著刀刃外緣的一圈，在最尖的地方分成亮面、暗面
  function facets(pc, th) {
    const O = pc.outer, n = O.length;
    let im = th.split != null ? th.split : O.reduce((b, p, i) => p[1] > O[b][1] ? i : b, 0);
    if (th.left) im = n - 1 - im;
    const I = O.map(([a, r]) => [a, Math.max(.52, r - .19)]);
    const res = [];
    if (im > 0) res.push([O.slice(0, im + 1).concat(I.slice(0, im + 1).reverse()), th.left ? th.mid : th.light]);
    if (im < n - 1) res.push([O.slice(im).concat(I.slice(im).reverse()), th.left ? th.light : th.mid]);
    return res;
  }
  // 銀色金屬環（一圈方方的小凹口）
  function ringPolar(m = 16, plain = false) {
    const pts = [], w = TAU / m;
    if (plain) { for (let j = 0; j < 40; j++) pts.push([j / 40 * TAU, .84]); return pts; }
    for (let j = 0; j < m; j++) {
      const a0 = j * w;
      pts.push([a0, .85], [a0 + .55 * w, .85], [a0 + .55 * w, .8], [a0 + w, .8]);
    }
    return pts;
  }
  const METAL = '#ced4da', METAL2 = '#adb5bd';

  // 側牆：畫面上「x 往左走」的邊是朝向我們的，往下長出厚度
  // 同一片刀刃上連續朝前的邊合成一條，少一點小碎塊
  function walls(list, h) {
    const q = [];
    for (const [pts, c] of list) {
      const n = pts.length, fr = i => pts[(i + 1) % n][0] < pts[i][0] - .5;
      let st = 0;
      while (st < n && fr((st + n - 1) % n)) st++;
      for (let t = 0; t < n; t++) {
        const i0 = (st + t) % n;
        if (!fr(i0) || (t > 0 && fr((i0 + n - 1) % n))) continue;
        const run = [pts[i0]];
        let j = i0;
        while (fr(j) && run.length <= n) { j = (j + 1) % n; run.push(pts[j]); }
        const strip = run.concat(run.slice().reverse().map(p => [p[0], p[1] + h]));
        q.push([Math.max(...run.map(p => p[1])), `<path fill="${c}" d="${poly(strip)}"/>`]);
      }
    }
    return q.sort((a, b) => a[0] - b[0]).map(x => x[1]).join('');
  }

  // 小數字（固鎖輪盤上的 3-60），只用線條
  const SEG = { a: [[0, 0], [1, 0]], b: [[1, 0], [1, .5]], c: [[1, .5], [1, 1]], d: [[0, 1], [1, 1]], e: [[0, .5], [0, 1]], f: [[0, 0], [0, .5]], g: [[0, .5], [1, .5]], h: [[1, 0], [.3, 1]] };
  const DIG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'ah', 8: 'abcdefg', 9: 'abcdfg', '-': 'g' };
  function digits(str, cx, cy, hgt) {
    const w = hgt * .5, gap = hgt * .38;
    const ws = [...str].map(ch => ch === '-' ? w * .7 : w);
    const total = ws.reduce((a, b) => a + b, 0) + gap * (str.length - 1);
    let x = cx - total / 2, d = '';
    [...str].forEach((ch, i) => {
      const cw = ws[i];
      for (const sg of DIG[ch] || '') {
        const [[x1, y1], [x2, y2]] = SEG[sg];
        d += `M${P(x + x1 * cw, cy - hgt / 2 + y1 * hgt)} L${P(x + x2 * cw, cy - hgt / 2 + y2 * hgt)} `;
      }
      x += cw + gap;
    });
    return `<path d="${d.trim()}"/>`;
  }

  // 圓柱外面一圈方形齒（固鎖輪盤的齒、軸心的齒輪）
  // back=true 只畫後面的齒（要先畫，被身體蓋住），否則畫前面的齒
  function teeth(cx, y1, y2, r0, r1, angles, d, k, face, sideC, back) {
    const pt = (r, a, y) => [cx + r * Math.cos(a), y + r * Math.sin(a) * k];
    let s = '';
    for (const a of angles) {
      const isBack = Math.sin(a) < 0;
      if (isBack !== !!back) continue;
      const b1 = a + d, b0 = a - d;
      if (Math.cos(b1) > 0) s += `<path fill="${sideC}" d="${poly([pt(r0, b1, y1), pt(r1, b1, y1), pt(r1, b1, y2), pt(r0, b1, y2)])}"/>`;
      if (-Math.cos(b0) > 0) s += `<path fill="${sideC}" d="${poly([pt(r0, b0, y1), pt(r1, b0, y1), pt(r1, b0, y2), pt(r0, b0, y2)])}"/>`;
      if (Math.sin(a) > -.15) {
        const n = 4, top = [], bot = [];
        for (let j = 0; j <= n; j++) { const t = b0 + (b1 - b0) * j / n; top.push(pt(r1, t, y1)); bot.unshift(pt(r1, t, y2)); }
        s += `<path fill="${face}" d="${poly(top.concat(bot))}"/>`;
      }
    }
    return s;
  }
  const teethTops = (cx, y, r0, r1, angles, d, k, c) => angles.map(a => {
    const pt = (r, t) => [cx + r * Math.cos(t), y + r * Math.sin(t) * k];
    const pts = [];
    for (let j = 0; j <= 4; j++) pts.push(pt(r1, a - d + 2 * d * j / 4));
    pts.push(pt(r0, a + d), pt(r0, a - d));
    return `<path fill="${c}" d="${poly(pts)}"/>`;
  }).join('');

  /* ---- 軸心：齒輪圈 + 短短的尖端 ---- */
  function bitSVG(cx, gT, R, th, det, k, showTop) {
    const Rg = .34 * R, hg = .09 * R, gB = gT + hg, Rt = .2 * R;
    const y0 = gB + Rt * k; // 尖端從齒輪下面露出來的地方
    let tip;
    const L = cx - Rt, Rr = cx + Rt;
    switch (th.bit) {
      case 'flat': { // 平平的大底
        const e = .62 * Rt, yE = y0 + .1 * R;
        tip = `M${P(L, gB)} L${P(L, y0)} L${P(cx - e, yE)} A${f(e)} ${f(e * k)} 0 0 0 ${P(cx + e, yE)} L${P(Rr, y0)} L${P(Rr, gB)} Z`;
        break;
      }
      case 'ball': { // 圓圓的球
        const yE = y0 + .15 * R;
        tip = `M${P(L, gB)} L${P(L, y0)} C${P(L, yE - .02 * R)} ${P(cx - .4 * Rt, yE)} ${P(cx, yE)} C${P(cx + .4 * Rt, yE)} ${P(Rr, yE - .02 * R)} ${P(Rr, y0)} L${P(Rr, gB)} Z`;
        break;
      }
      case 'needle': { // 細細的針
        const yN = y0 + .06 * R, yE = y0 + .18 * R;
        tip = `M${P(L, gB)} L${P(L, y0)} L${P(cx - .32 * Rt, yN)} L${P(cx - .06 * Rt, yE - .01 * R)} Q${P(cx, yE + .01 * R)} ${P(cx + .06 * Rt, yE - .01 * R)} L${P(cx + .32 * Rt, yN)} L${P(Rr, y0)} L${P(Rr, gB)} Z`;
        break;
      }
      case 'taper': { // 斜斜收進去的小平底
        const yE = y0 + .14 * R, e = .3 * Rt;
        tip = `M${P(L, gB)} L${P(L, y0)} L${P(cx - e, yE)} A${f(e)} ${f(e * k)} 0 0 0 ${P(cx + e, yE)} L${P(Rr, y0)} L${P(Rr, gB)} Z`;
        break;
      }
      case 'spike': { // 尖刺（但是很短）
        const yE = y0 + .17 * R;
        tip = `M${P(L, gB)} L${P(L, y0)} L${P(cx - .08 * Rt, yE - .01 * R)} Q${P(cx, yE + .015 * R)} ${P(cx + .08 * Rt, yE - .01 * R)} L${P(Rr, y0)} L${P(Rr, gB)} Z`;
        break;
      }
      default: { // point：圓圓的小尖
        const yE = y0 + .14 * R;
        tip = `M${P(L, gB)} L${P(L, y0)} Q${P(L + .1 * Rt, y0 + .08 * R)} ${P(cx - .22 * Rt, yE - .02 * R)} Q${P(cx, yE + .02 * R)} ${P(cx + .22 * Rt, yE - .02 * R)} Q${P(Rr - .1 * Rt, y0 + .08 * R)} ${P(Rr, y0)} L${P(Rr, gB)} Z`;
      }
    }
    let s = `<path fill="${th.bitC}" d="${tip}"/>`;
    const nt = det ? 8 : 6, ang = [];
    for (let j = 0; j < nt; j++) ang.push(Math.PI / 2 + (j + .5) / nt * TAU);
    const d = det ? .2 : .24, r1 = Rg * 1.16;
    s += teeth(cx, gT, gB, Rg, r1, ang, d, k, th.gearC, th.gearC, true);
    if (showTop) s += ell(cx, gT, Rg, Rg * k, th.gearC);
    s += band(cx, gT, gB, Rg, k, th.gearC);
    s += teeth(cx, gT, gB, Rg, r1, ang, d, k, th.gearC, th.gearC, false);
    if (showTop) {
      s += teethTops(cx, gT, Rg * .9, r1, ang.filter(a => Math.sin(a) <= 0), d, k, th.gearC);
      // 上面的軸（插進固鎖輪盤的地方）
      const ra = .14 * R, ya = gT - .2 * R;
      s += band(cx, ya, gT, ra, k, th.bitC) + ell(cx, ya, ra, ra * k, th.bitC);
      s += teethTops(cx, gT, Rg * .9, r1, ang.filter(a => Math.sin(a) > 0), d, k, th.gearC);
    }
    return { s, bottom: y0 + .18 * R };
  }

  /* ---- 固鎖輪盤：方形齒 + 數字 ---- */
  function ratchetSVG(cx, rT, R, th, det, k, showTop) {
    const Rr = .7 * R, hr = .3 * R, rB = rT + hr;
    const nt = +th.rat[0], ang = [];
    for (let j = 0; j < nt; j++) ang.push(Math.PI / 2 + (j + .5) / nt * TAU);
    const d = Math.min(.2, .42 * Math.PI / nt), r1 = Rr * 1.045;
    const toothC = '#adb5bd';
    let s = teeth(cx, rT, rB, Rr * .9, r1, ang, d, k, toothC, '#868e96', true);
    if (showTop) {
      s += ell(cx, rT, Rr, Rr * k, '#dee2e6');
      s += ell(cx, rT, .32 * R, .32 * R * k, '#868e96');
      s += ell(cx, rT + .02 * R, .2 * R, .2 * R * k, '#222');
      s += teethTops(cx, rT, Rr * .9, r1, ang.filter(a => Math.sin(a) <= 0), d, k, '#e9ecef');
    }
    s += band(cx, rT, rB, Rr, k, th.ratC);
    s += teeth(cx, rT, rB, Rr * .9, r1, ang, d, k, toothC, '#868e96', false);
    if (showTop) s += teethTops(cx, rT, Rr * .9, r1, ang.filter(a => Math.sin(a) > 0), d, k, '#e9ecef');
    if (det) {
      // 數字貼紙
      const dh = det > 1 ? Math.max(.085 * R, 24) : .085 * R, lw = Math.max(.4 * R, 4.7 * dh), lh = Math.max(.135 * R, 1.55 * dh), ly = rB + Rr * k - lh / 2 - .025 * R;
      s += `<rect x="${f(cx - lw / 2)}" y="${f(ly - lh / 2)}" width="${f(lw)}" height="${f(lh)}" rx="${f(.02 * R)}" fill="#f8f9fa"/>`;
      if (det > 1) s += digits(th.rat, cx, ly, dh);
    }
    return s;
  }

  /* ---- 上蓋：側牆 → 金屬環 → 刀刃 → 斜面 → 中心徽章 ---- */
  function bladeSVG(cx, cy, R, th, det, k) {
    const h = .11 * R;
    const pr = ([a, r]) => [cx + R * r * Math.cos(a), cy + R * r * Math.sin(a) * k];
    const ps = pieces(th);
    const ring = ringPolar(16, true).map(pr);
    const pp = ps.map(p => p.poly.map(pr));
    let s = walls([[ring, METAL2]].concat(pp.map(p => [p, th.side])), h);
    s += `<path fill="${METAL}" d="${poly(ring)}"/>`;
    pp.forEach(p => { s += `<path fill="${th.blade}" d="${poly(p)}"/>`; });
    if (det) ps.forEach(p => facets(p, th).forEach(([pts, c]) => { s += `<path fill="${c}" d="${poly(pts.map(pr))}"/>`; }));
    // 中心：金屬圈 + 螺絲 + 凸起來的徽章
    s += ell(cx, cy, .47 * R, .47 * R * k, th.core);
    if (det) for (const sx of [-1, 1]) s += `<circle cx="${f(cx + sx * .405 * R)}" cy="${f(cy + .02 * R)}" r="${f(.028 * R)}" fill="${METAL2}"/>`;
    const ey = cy - .05 * R, erx = .34 * R, ery = .22 * R;
    s += ell(cx, ey + .05 * R, erx, ery, th.side);
    s += ell(cx, ey, erx, ery, th.emb);
    s += motif[th.m](cx, ey, ery * .95);
    return s;
  }

  /* 3/4 側面看的整顆陀螺：軸心 → 固鎖輪盤 → 上蓋（寬寬扁扁的，像真的陀螺） */
  function top3(cx, cy, R, name, opt = {}) {
    const th = THEME[name], k = K;
    const det = opt.det != null ? opt.det : R >= 220 ? 2 : R >= 80 ? 1 : 0;
    const rT = cy + .11 * R, rB = rT + .3 * R;
    const gT = rB + (.7 * R - .34 * R) * k + .07 * R;
    const bit = bitSVG(cx, gT, R, th, det, k, false);
    let s = '';
    if (opt.shadow !== false) s += ell(cx, bit.bottom - .02 * R, .5 * R, .09 * R, '#e9ecef');
    s += bit.s;
    s += ratchetSVG(cx, rT, R, th, det, k, false);
    s += bladeSVG(cx, cy, R, th, det, k);
    return s;
  }

  /* 從上面往下看的陀螺：刀刃空隙露出金屬環和固鎖輪盤的齒 */
  function topDown(cx, cy, R, name) {
    const th = THEME[name];
    const pr = ([a, r]) => [cx + R * r * Math.cos(a), cy + R * r * Math.sin(a)];
    const ps = pieces(th);
    let s = '';
    // 固鎖輪盤的齒，從刀刃之間的空隙探出頭
    const w = th.lobe[th.lobe.length - 1][0];
    const nt = +th.rat[0];
    for (let i = 0; i < Math.min(nt, th.n); i++) {
      const a = ps[i].ang((w + 1) / 2), d = .1;
      s += `<path fill="#adb5bd" d="${poly([[a - d, .7], [a - d, .95], [a + d, .95], [a + d, .7]].map(pr))}"/>`;
    }
    s += `<path fill="${METAL}" d="${poly(ringPolar().map(pr))}"/>`;
    ps.forEach(p => { s += `<path fill="${th.blade}" d="${poly(p.poly.map(pr))}"/>`; });
    ps.forEach(p => facets(p, th).forEach(([pts, c]) => { s += `<path fill="${c}" d="${poly(pts.map(pr))}"/>`; }));
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(.47 * R)}" fill="${th.core}"/>`;
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      s += `<circle cx="${f(cx + .41 * R * Math.cos(a))}" cy="${f(cy + .41 * R * Math.sin(a))}" r="${f(.035 * R)}" fill="${METAL2}"/>`;
    }
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(.34 * R)}" fill="${th.emb}"/>`;
    s += motif[th.m](cx, cy + .03 * R, .27 * R);
    return s;
  }

  // 陀螺周圍的旋轉速度線（只有線）
  function spinLines(cx, cy, R) {
    const rx = 1.12 * R, ry = rx * .36;
    return arc(cx, cy, rx, ry, Math.PI + .3, Math.PI + 1.0) + arc(cx, cy, rx, ry, TAU - 1.0, TAU - .3) +
      arc(cx, cy + .12 * R, 1.08 * R, .4 * R, Math.PI - .35, Math.PI + .05) + arc(cx, cy + .12 * R, 1.08 * R, .4 * R, -.05, .35);
  }
  const floorSpin = (cx, y, rx) => arc(cx, y, rx, rx * .2, .35, Math.PI - .35) + arc(cx, y, rx * 1.3, rx * .28, .55, Math.PI - .55);

  /* ---------------- 單顆陀螺 ---------------- */
  const hero = (name, extra = '') => `
    ${spinLines(400, 228, 280)}
    ${floorSpin(400, 462, 180)}
    ${top3(400, 228, 280, name)}
    ${extra}`;

  const bolt = (x, y, s = 1, c = '#ffe066') =>
    `<path fill="${c}" d="M${P(x, y)} L${P(x + 35 * s, y - 60 * s)} L${P(x + 25 * s, y - 20 * s)} L${P(x + 55 * s, y - 25 * s)} L${P(x + 10 * s, y + 45 * s)} L${P(x + 23 * s, y + 5 * s)} Z"/>`;
  const flame = (x, y, s = 1, c = '#ff922b') =>
    `<path fill="${c}" d="M${P(x, y)} Q${P(x - 30 * s, y - 30 * s)} ${P(x - 5 * s, y - 70 * s)} Q${P(x, y - 40 * s)} ${P(x + 15 * s, y - 45 * s)} Q${P(x + 12 * s, y - 75 * s)} ${P(x + 30 * s, y - 85 * s)} Q${P(x + 50 * s, y - 30 * s)} ${P(x + 20 * s, y)} Z"/>`;

  const phoenix = hero('phoenix', `${flame(70, 120, .9)} ${flame(705, 120, .8, '#ffd43b')} ${sparkle(90, 520, 16)} ${sparkle(710, 525, 18, '#ff922b')}`);
  const clock = hero('clock', `${sparkle(80, 80, 20, '#e599f7')} ${sparkle(720, 80, 16)}
    <circle cx="90" cy="520" r="34" fill="#f3d9fa"/><path d="M90 520 L90 498 M90 520 L106 528"/>
    <circle cx="712" cy="520" r="28" fill="#f3d9fa"/><path d="M712 520 L712 502 M712 520 L696 527"/>`);
  const knight = hero('knight', `${sparkle(80, 80, 20)} ${sparkle(720, 80, 16, '#a5d8ff')} ${sparkle(712, 525, 14)} ${sparkle(88, 525, 16, '#a5d8ff')}`);
  const whip = hero('whip', `<path fill="#e7f5ff" d="M40 140 L120 60 L132 72 L52 152 Z"/><path fill="#ffd43b" d="M44 160 L32 148 L60 132 L68 140 Z"/>
    ${sparkle(720, 80, 18, '#a5d8ff')} ${sparkle(90, 525, 18, '#ffd43b')} ${sparkle(712, 525, 16, '#74c0fc')}`);
  const charge = hero('charge', `<path d="M30 520 L120 520 M50 548 L140 548 M680 520 L770 520 M660 548 L750 548"/>
    ${sparkle(720, 80, 20, '#bac8ff')} ${sparkle(80, 80, 16)}`);
  const brave = hero('brave', `${star(80, 85, 26, 11, 5, '#ffe066')} ${sparkle(720, 80, 18, '#a5d8ff')} ${sparkle(90, 525, 14)} ${star(712, 520, 22, 10, 5, '#ffe066')}`);
  const meteor = hero('meteor', `
    <path fill="#ffd43b" d="M40 110 Q80 65 135 40 Q100 85 95 110 Q80 135 55 135 Q35 130 40 110 Z"/>
    <path fill="#ff922b" d="M650 535 Q700 495 755 475 Q722 515 718 540 Q705 563 678 560 Q650 555 650 535 Z"/>
    ${sparkle(720, 80, 18, '#ffd43b')} ${sparkle(90, 525, 16, '#ff922b')}`);
  const unicorn = hero('unicorn', `${bolt(50, 100, .9)} ${bolt(690, 100, .8)} ${star(90, 520, 22, 10, 5, '#e599f7')} ${star(712, 520, 26, 11, 5, '#ffe066')}`);
  const shark = hero('shark', `
    <path fill="#a5d8ff" d="M40 550 Q100 515 160 550 Q220 515 280 550 L280 580 L40 580 Z"/>
    <path fill="#a5d8ff" d="M520 550 Q580 515 640 550 Q700 515 760 550 L760 580 L520 580 Z"/>
    ${sparkle(80, 80, 16, '#d0ebff')} ${sparkle(720, 80, 18)}`);
  const panther = hero('panther', `<path d="M40 60 L80 130 M70 50 L110 120 M100 45 L135 105 M670 490 L710 555 M700 480 L740 545 M730 475 L765 530"/>
    ${sparkle(720, 80, 18, '#ffd43b')} ${sparkle(90, 525, 16)}`);
  const turtle = hero('turtle', `
    <path fill="#ffe066" d="M50 140 L120 70 L112 100 L140 92 L70 160 L78 130 Z"/>
    ${star(720, 85, 24, 10, 5, '#d0bfff')} ${sparkle(90, 525, 16, '#8ce99a')} ${sparkle(712, 525, 18)}`);
  const rhino = hero('rhino', `
    <path fill="#868e96" d="M30 580 L100 470 L140 525 L165 500 L215 580 Z"/>
    ${flame(88, 468, .5, '#ff922b')}
    ${sparkle(720, 80, 18, '#ff922b')} ${sparkle(80, 80, 16)} ${sparkle(712, 525, 16, '#ffd43b')}`);

  /* ---------------- 從上面看 ---------------- */
  const phoenixTop = `
    <path d="M140 300 A260 260 0 0 1 215 118 M660 300 A260 260 0 0 1 585 482"/>
    <path d="M105 330 A295 295 0 0 1 132 205 M695 270 A295 295 0 0 1 668 395"/>
    ${topDown(400, 300, 255, 'phoenix')}
    ${sparkle(100, 90, 20, '#ffd43b')} ${sparkle(700, 90, 16, '#ff922b')} ${sparkle(705, 520, 18)} ${sparkle(95, 520, 14)}`;

  /* ---------------- 發射器 ---------------- */
  // 捲繩發射器（拉繩）：陀螺吊在發射器下面
  const winder = `
    ${top3(470, 395, 150, 'whip')}
    <path d="M232 228 Q190 215 175 245 Q160 270 135 255"/>
    <rect x="70" y="205" width="70" height="105" rx="24" fill="#ffd43b"/>
    <rect x="92" y="230" width="26" height="55" rx="13" fill="#fff9db"/>
    <path fill="#ff922b" d="M290 280 L370 280 L350 470 Q346 490 326 490 L290 490 Q272 490 274 470 Z"/>
    <path d="M282 340 L360 340 M280 390 L356 390 M278 440 L352 440"/>
    <path fill="#868e96" d="M410 280 L530 280 L530 330 L505 330 L505 312 L435 312 L435 330 L410 330 Z"/>
    <rect x="225" y="170" width="380" height="125" rx="48" fill="#4dabf7"/>
    <circle cx="370" cy="232" r="46" fill="#ffd43b"/>
    <circle cx="370" cy="232" r="18" fill="#adb5bd"/>
    <rect x="470" y="200" width="100" height="26" rx="13" fill="#d0ebff"/>
    ${sparkle(700, 140, 20)} ${sparkle(150, 430, 18, '#a5d8ff')} ${sparkle(720, 540, 14)}`;

  // 拉條發射器：長長的齒條拉條
  const rack = (() => {
    let teeth = 'M90 236';
    for (let x = 110; x <= 330; x += 22) teeth += ` L${x - 11} 222 L${x} 236`;
    return `
    ${top3(470, 400, 150, 'knight')}
    <path fill="#ff6b6b" d="${teeth} L330 262 L90 262 Z"/>
    <path fill="#ffd43b" d="M40 190 L100 190 Q115 190 115 205 L115 295 Q115 310 100 310 L40 310 Q25 310 25 295 L25 205 Q25 190 40 190 Z"/>
    <rect x="48" y="220" width="40" height="60" rx="14" fill="#fff9db"/>
    <path fill="#868e96" d="M410 285 L530 285 L530 335 L505 335 L505 317 L435 317 L435 335 L410 335 Z"/>
    <path fill="#69db7c" d="M300 175 L560 175 Q610 175 610 225 L610 255 Q610 300 565 300 L300 300 Q270 300 270 270 L270 205 Q270 175 300 175 Z"/>
    ${star(440, 237, 40, 18, 5, '#ffe066')}
    <path fill="#2f9e44" d="M580 290 L615 280 L660 420 Q665 440 645 444 L625 448 Q610 450 604 435 Z"/>
    <path d="M600 330 L628 322 M612 370 L640 362 M624 410 L652 402"/>
    ${sparkle(720, 140, 20)} ${sparkle(170, 420, 20, '#ffd43b')} ${sparkle(110, 520, 14)}`;
  })();

  /* ---------------- 零件：上蓋 / 固鎖輪盤 / 軸心，上下分開 ---------------- */
  const parts = (() => {
    const cx = 250, R = 190, th = THEME.phoenix, k = K;
    const blade = bladeSVG(cx, 85, R, th, 2, k);
    const ratchet = ratchetSVG(cx, 270, R, th, 2, k, true);
    const bit = bitSVG(cx, 455, 250, th, 2, k, true);
    // 右邊：組合好的陀螺
    return `
      <path d="M${cx} 210 L${cx} 222 M${cx} 234 L${cx} 246"/>
      ${bit.s}
      ${ratchet}
      ${blade}
      <path fill="#ffe066" d="M470 270 L515 270 L515 238 L565 300 L515 362 L515 330 L470 330 Z"/>
      ${top3(685, 270, 98, 'phoenix')}
      ${sparkle(560, 110, 16)} ${sparkle(760, 470, 16, '#ff922b')} ${sparkle(470, 520, 14)}`;
  })();

  /* ---------------- 對戰盤（有 X 軌道） ---------------- */
  const stadium = (() => {
    const cx = 400, cy = 315;
    let rail = '';
    // 軌道上的齒（只畫在前面的軌道上）
    for (let i = 0; i <= 26; i++) {
      const a = Math.PI * (.08 + .84 * i / 26);
      rail += `<path d="M${P(cx + 318 * Math.cos(a), cy + 122 * Math.sin(a))} L${P(cx + 340 * Math.cos(a), cy + 132 * Math.sin(a))}"/>`;
    }
    return `
      <path fill="#4dabf7" d="M40 315 L64 410 A336 130 0 0 0 736 410 L760 315 Z"/>
      ${ell(cx, cy, 360, 142, '#a5d8ff')}
      ${ell(cx, cy, 340, 132, '#ffd43b')}
      ${ell(cx, cy, 312, 118, '#e7f5ff')}
      ${rail}
      ${ell(cx, cy - 6, 130, 48, '#d0ebff')}
      <path d="M150 380 Q230 425 330 440 M190 345 Q260 392 350 405"/>
      ${top3(290, 275, 95, 'whip', { shadow: false })}
      ${top3(545, 315, 95, 'hells', { shadow: false })}
      ${sparkle(660, 410, 16, '#ff922b')} ${sparkle(700, 380, 12)}
      ${sparkle(80, 90, 22)} ${sparkle(720, 90, 18, '#ffd43b')}`;
  })();

  /* ---------------- 碰！兩顆陀螺對撞 ---------------- */
  const clash = `
    ${ell(400, 500, 380, 70, '#e7f5ff')}
    <path d="M30 300 Q60 280 90 300 M25 360 Q55 340 85 360 M710 300 Q740 280 770 300 M715 360 Q745 340 775 360"/>
    <g transform="rotate(10 205 310)">${top3(205, 310, 160, 'phoenix', { shadow: false })}</g>
    <g transform="rotate(-10 595 310)">${top3(595, 310, 160, 'whip', { shadow: false })}</g>
    ${star(400, 205, 100, 56, 12, '#ffe066', -Math.PI / 2 + .13)}
    ${star(400, 205, 56, 32, 8, '#ff922b')}
    <rect x="388" y="164" width="24" height="48" rx="12" fill="#ff4b3e"/>
    <circle cx="400" cy="230" r="11" fill="#ff4b3e"/>
    ${sparkle(300, 60, 18)} ${sparkle(510, 55, 16, '#ff922b')} ${sparkle(400, 520, 14)}
    ${sparkle(90, 120, 16, '#ffd43b')} ${sparkle(710, 120, 18, '#a5d8ff')}`;

  /* ---------------- 小朋友發射陀螺 ---------------- */
  const kid = `
    ${ell(560, 515, 215, 50, '#e7f5ff')}
    <rect x="175" y="400" width="44" height="110" rx="16" fill="#4c6ef5"/>
    <rect x="235" y="400" width="44" height="110" rx="16" fill="#4c6ef5"/>
    <ellipse cx="190" cy="518" rx="38" ry="18" fill="#ff6b6b"/>
    <ellipse cx="266" cy="518" rx="38" ry="18" fill="#ff6b6b"/>
    <path fill="#ffd8a8" d="M175 300 Q125 330 110 280 Q100 255 120 240 Q140 260 160 268 L190 260 Z"/>
    <circle cx="110" cy="245" r="22" fill="#ffd8a8"/>
    <rect x="160" y="245" width="135" height="175" rx="40" fill="#ffd43b"/>
    ${star(228, 330, 38, 17, 5, '#ff922b')}
    <path fill="#ffd8a8" d="M280 270 L390 220 L402 248 L292 300 Z"/>
    <rect x="370" y="180" width="150" height="62" rx="26" fill="#4dabf7"/>
    <circle cx="420" cy="211" r="18" fill="#ffd43b"/>
    <circle cx="395" cy="250" r="22" fill="#ffd8a8"/>
    <path d="M370 205 Q300 175 230 205 Q170 230 125 232"/>
    <circle cx="228" cy="165" r="84" fill="#ffd8a8"/>
    <path fill="#5c3c1e" d="M144 160 Q140 82 228 80 Q318 82 312 160 Q290 120 250 125 Q235 102 220 125 Q170 118 144 160 Z"/>
    <circle cx="145" cy="170" r="16" fill="#ffd8a8"/><circle cx="311" cy="170" r="16" fill="#ffd8a8"/>
    ${eye(200, 168, 11)} ${eye(256, 168, 11)}
    <path fill="#ff8787" d="M200 198 Q228 232 256 198 Z"/>
    <circle cx="178" cy="200" r="12" fill="#ffc2c2"/><circle cx="278" cy="200" r="12" fill="#ffc2c2"/>
    ${spinLines(590, 380, 150)}
    ${floorSpin(590, 510, 100)}
    ${top3(590, 380, 150, 'brave', { shadow: false })}
    <path d="M470 270 Q500 300 520 300 M500 250 Q540 275 560 270"/>
    ${sparkle(700, 120, 22)} ${sparkle(580, 110, 16, '#ff922b')} ${sparkle(760, 250, 14)}`;

  /* ---------------- 冠軍獎盃 ---------------- */
  const trophy = `
    ${sparkle(140, 130, 24)} ${sparkle(660, 120, 20)} ${sparkle(650, 380, 14, '#ffd43b')} ${sparkle(150, 400, 16, '#a5d8ff')}
    <path fill="#ffd43b" d="M265 120 Q170 120 178 210 Q188 300 300 312 L312 280 Q222 268 215 210 Q212 160 265 160 Z"/>
    <path fill="#ffd43b" d="M535 120 Q630 120 622 210 Q612 300 500 312 L488 280 Q578 268 585 210 Q588 160 535 160 Z"/>
    <path fill="#ffe066" d="M250 80 L550 80 L535 230 Q510 360 400 365 Q290 360 265 230 Z"/>
    ${topDown(400, 200, 100, 'gold')}
    <rect x="368" y="360" width="64" height="60" fill="#fab005"/>
    <rect x="290" y="415" width="220" height="40" rx="10" fill="#fab005"/>
    <rect x="250" y="452" width="300" height="80" rx="12" fill="#c0874a"/>
    <rect x="320" y="472" width="160" height="40" rx="8" fill="#ffe8cc"/>`;


  window.ART.addPack({
    categories: [
      { id: 'tops', name: '對戰陀螺', icon: '🌀', color: '#228be6', dark: '#1864ab', en: 'Battle Tops' },
    ],
    drawings: [
      { id: 'tp-phoenix', cat: 'tops', name: '鳳凰飛翼', en: 'PhoenixWing 9-60GF', svg: phoenix },
      { id: 'tp-clock', cat: 'tops', name: '時鐘幻象', en: 'ClockMirage', svg: clock },
      { id: 'tp-knight', cat: 'tops', name: '騎士重盾', en: 'KnightShield 3-80N', svg: knight },
      { id: 'tp-whip', cat: 'tops', name: '蒼龍神劍', en: 'DranSword 3-60F', svg: whip },
      { id: 'tp-charge', cat: 'tops', name: '蒼龍突擊', en: 'DranStrike 4-50FF', svg: charge },
      { id: 'tp-brave', cat: 'tops', name: '蒼龍勇氣', en: 'DranBrave 6-60V', svg: brave },
      { id: 'tp-meteor', cat: 'tops', name: '隕星龍騎士', en: 'MeteorDragoon 3-70J', svg: meteor },
      { id: 'tp-unicorn', cat: 'tops', name: '獨角刺心', en: 'UnicornSting 5-60GP', svg: unicorn },
      { id: 'tp-shark', cat: 'tops', name: '鮫鯊狂鱗', en: 'SharkScale', svg: shark },
      { id: 'tp-panther', cat: 'tops', name: '雄獅獵爪', en: 'LeonClaw 5-60P', svg: panther },
      { id: 'tp-turtle', cat: 'tops', name: '魔導幻箭', en: 'WizardArrow 4-80B', svg: turtle },
      { id: 'tp-rhino', cat: 'tops', name: '戰犀號角', en: 'RhinoHorn 3-80S', svg: rhino },
      { id: 'tp-phoenix-above', cat: 'tops', name: '從上面看鳳凰飛翼', en: 'PhoenixWing from above', svg: phoenixTop },
      { id: 'tp-parts', cat: 'tops', name: '陀螺三零件', en: 'blade, ratchet and bit', svg: parts },
      { id: 'tp-winder', cat: 'tops', name: '捲繩發射器', en: 'string launcher', svg: winder },
      { id: 'tp-rack', cat: 'tops', name: '拉條發射器', en: 'ripcord launcher', svg: rack },
      { id: 'tp-stadium', cat: 'tops', name: '極限衝刺對戰盤', en: 'rail stadium dash', svg: stadium },
      { id: 'tp-clash', cat: 'tops', name: '碰！陀螺對撞', en: 'tops clashing', svg: clash },
      { id: 'tp-kid', cat: 'tops', name: '發射陀螺囉', en: 'launching a top', svg: kid },
      { id: 'tp-trophy', cat: 'tops', name: '冠軍獎盃', en: 'champion trophy', svg: trophy },
    ],
  });
})();
