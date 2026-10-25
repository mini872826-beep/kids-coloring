/* 線稿包：陀螺對戰（原創對戰陀螺）
 * 全部是原創造型：三層構造（刀刃環 + 齒輪棘輪 + 帶小齒輪的尖底），
 * 四大主角陀螺：烈焰龍劍、雷霆虎爪、冰晶鳳凰、鋼鐵騎士盾。
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
    whip: (x, y, s) => dragonHead(x, y, s, { face: '#69db7c', snout: '#d8f5a2', horn: '#ffd43b', mood: 'angry' }),
    charge: (x, y, s) => dragonHead(x, y, s, { face: '#4c6ef5', snout: '#bac8ff', horn: '#e9ecef', mood: 'angry' }),
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
    rhino: (x, y, s) => `
      <ellipse cx="${f(x - .55 * s)}" cy="${f(y - .52 * s)}" rx="${f(.14 * s)}" ry="${f(.22 * s)}" fill="#adb5bd"/>
      <ellipse cx="${f(x + .55 * s)}" cy="${f(y - .52 * s)}" rx="${f(.14 * s)}" ry="${f(.22 * s)}" fill="#adb5bd"/>
      <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(.62 * s)}" ry="${f(.62 * s)}" fill="#ced4da"/>
      <ellipse cx="${f(x)}" cy="${f(y + .32 * s)}" rx="${f(.42 * s)}" ry="${f(.26 * s)}" fill="#e9ecef"/>
      <path fill="#ff922b" d="M${P(x - .18 * s, y + .12 * s)} Q${P(x - .05 * s, y - .5 * s)} ${P(x + .1 * s, y - 1.0 * s)} Q${P(x + .2 * s, y - .4 * s)} ${P(x + .18 * s, y + .12 * s)} Z"/>
      ${eye(x - .34 * s, y - .16 * s, .1 * s)} ${eye(x + .34 * s, y - .16 * s, .1 * s)}
      <circle cx="${f(x - .14 * s)}" cy="${f(y + .38 * s)}" r="${f(.05 * s)}" fill="#222"/>
      <circle cx="${f(x + .14 * s)}" cy="${f(y + .38 * s)}" r="${f(.05 * s)}" fill="#222"/>`,
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
    star: (x, y, s) => star(x, y, .75 * s, .34 * s, 5, '#ffe066'),
  };

  /* ---------------- 主題：刀刃形狀 + 顏色 ---------------- */
  // lobe：每一片刀刃的頂點 [位置(0~1), 半徑比例]；acc：刀刃上的色塊
  const THEME = {
    // 1 鳳凰：三片張開的翅膀，每片三根羽毛尖
    phoenix: { n: 3, rot: -1.9, lobe: [[0, .62], [.1, .8], [.18, .74], [.3, .92], [.38, .82], [.52, 1], [.62, .84], [.74, .64]],
      acc: [[.3, .7], [.42, .78], [.52, .9], [.56, .7]],
      blade: '#ff6b6b', side: '#c92a2a', acc2: '#ffd43b', core: '#ffa94d', emb: '#fff4e6', m: 'phoenix' },
    // 2 時鐘：12 個方方的刻度齒，像時鐘也像齒輪
    clock: { n: 12, rot: -1.57 - .13, lobe: [[0, .86], [.12, 1], [.5, 1], [.62, .86]],
      acc: null,
      blade: '#da77f2', side: '#9c36b5', acc2: '#e9ecef', core: '#ced4da', emb: '#f3d9fa', m: 'clock' },
    // 3 騎士盾：五面圓圓的盾牌
    knight: { n: 5, rot: -1.57, lobe: [[0, .72], [.06, .86], [.18, .96], [.34, 1], [.5, 1], [.66, 1], [.82, .96], [.94, .86]],
      acc: [[.22, .74], [.34, .88], [.66, .88], [.78, .74]],
      blade: '#ced4da', side: '#868e96', acc2: '#74c0fc', core: '#a5d8ff', emb: '#e7f5ff', m: 'helmet' },
    // 4 飛龍鞭：兩條長長彎彎的鞭子
    whip: { n: 2, rot: -2.4, lobe: [[0, .56], [.15, .62], [.3, .7], [.45, .8], [.58, .9], [.68, 1], [.73, .94], [.76, .74], [.8, .6]],
      acc: [[.3, .64], [.45, .73], [.58, .82], [.6, .66]],
      blade: '#51cf66', side: '#2b8a3e', acc2: '#ffd43b', core: '#ffe066', emb: '#ebfbee', m: 'whip' },
    // 5 藍龍衝鋒：三支往前刺的長槍
    charge: { n: 3, rot: -1.57 - 1.4, lobe: [[0, .62], [.3, .66], [.38, .8], [.46, 1], [.52, .8], [.6, .66]],
      acc: [[.38, .68], [.46, .9], [.5, .68]],
      blade: '#4c6ef5', side: '#364fc7', acc2: '#e9ecef', core: '#bac8ff', emb: '#edf2ff', m: 'charge' },
    // 6 勇氣藍龍：兩片寬寬的龍翅膀
    brave: { n: 2, rot: -2.0, lobe: [[0, .6], [.08, .84], [.16, .96], [.24, .84], [.32, 1], [.4, .86], [.48, .96], [.56, .8], [.64, .6]],
      acc: [[.14, .7], [.24, .8], [.34, .82], [.44, .78], [.5, .68]],
      blade: '#74c0fc', side: '#1971c2', acc2: '#f8f9fa', core: '#e7f5ff', emb: '#f8f9fa', m: 'brave' },
    // 7 流星龍騎士：四道流星火焰
    meteor: { n: 4, rot: -1.2, lobe: [[0, .64], [.2, .78], [.28, .72], [.44, .92], [.52, .8], [.68, 1], [.74, .66]],
      acc: [[.4, .7], [.52, .8], [.64, .88], [.62, .7]],
      blade: '#3b5bdb', side: '#1c2f8a', acc2: '#ff922b', core: '#ffc078', emb: '#dbe4ff', m: 'meteor' },
    // 8 閃電獨角獸：五角星尖角
    unicorn: { n: 5, rot: -1.57, lobe: [[0, 1], [.12, .76], [.5, .62], [.88, .76]],
      acc: [[-.07, .7], [0, .9], [.07, .7]],
      blade: '#e599f7', side: '#ae3ec9', acc2: '#ffe066', core: '#fff3bf', emb: '#f8f0fc', m: 'unicorn' },
    // 9 鯊魚利齒：九顆尖尖的鋸齒
    shark: { n: 9, rot: -1.57, lobe: [[0, .72], [.72, 1], [.8, .72]],
      acc: null,
      blade: '#4dabf7', side: '#1864ab', acc2: '#e7f5ff', core: '#d0ebff', emb: '#e7f5ff', m: 'shark' },
    // 10 黑豹爪：三隻爪子，每隻三根勾勾爪
    panther: { n: 3, rot: -1.3, lobe: [[0, .66], [.14, .86], [.2, .7], [.36, .9], [.42, .72], [.6, 1], [.66, .66]],
      acc: null,
      blade: '#7950f2', side: '#5f3dc4', acc2: '#d0bfff', core: '#d0bfff', emb: '#f3f0ff', m: 'panther' },
    // 11 巨石烏龜：六塊圓圓的大石頭
    turtle: { n: 6, rot: -1.57, lobe: [[0, .8], [.12, .94], [.3, 1], [.5, 1], [.7, 1], [.88, .94]],
      acc: [[.25, .8], [.5, .9], [.75, .8], [.5, .74]],
      blade: '#c0874a', side: '#8a5a2b', acc2: '#e8b16f', core: '#8ce99a', emb: '#ebfbee', m: 'turtle' },
    // 12 火山犀牛：兩支大犀牛角
    rhino: { n: 2, rot: -2.3, lobe: [[0, .72], [.2, .76], [.32, .86], [.4, 1], [.46, .82], [.6, .78], [.8, .74]],
      acc: [[.3, .76], [.38, .9], [.42, .76]],
      blade: '#ff6b6b', side: '#a61e4d', acc2: '#ffd43b', core: '#adb5bd', emb: '#f1f3f5', m: 'rhino' },
    gold: { n: 6, rot: -1.57, lobe: [[0, 1], [.25, .78], [.5, .7], [.75, .78]],
      acc: null,
      blade: '#ffd43b', side: '#f59f00', acc2: '#fff3bf', core: '#ffec99', emb: '#fff9db', m: 'star' },
  };

  function bladePts(cx, cy, R, th, k) {
    const pts = [];
    for (let i = 0; i < th.n; i++) for (const [ph, rf] of th.lobe) {
      const a = th.rot + (i + ph) / th.n * TAU;
      pts.push([cx + R * rf * Math.cos(a), cy + R * rf * Math.sin(a) * k, a]);
    }
    return pts;
  }
  const poly = pts => 'M' + pts.map(p => P(p[0], p[1])).join(' L') + ' Z';
  function accents(cx, cy, R, th, k) {
    if (!th.acc) return '';
    let s = '';
    for (let i = 0; i < th.n; i++) {
      const pts = th.acc.map(([ph, rf]) => {
        const a = th.rot + (i + ph) / th.n * TAU;
        return [cx + R * rf * Math.cos(a), cy + R * rf * Math.sin(a) * k];
      });
      s += `<path fill="${th.acc2}" d="${poly(pts)}"/>`;
    }
    return s;
  }

  /* 3/4 側面的陀螺：尖底(含小齒輪) → 棘輪 → 刀刃環 → 徽章 */
  function top3(cx, cy, R, name, opt = {}) {
    const th = THEME[name];
    const h = .18 * R;
    // 尖底
    const gx = .3 * R, g1 = cy + .7 * R, g2 = cy + .88 * R, gy = gx * K;
    const tipY = cy + 1.32 * R, cw = .22 * R;
    let s = `<path fill="${opt.tip || '#868e96'}" d="M${P(cx - cw, g2)} L${P(cx - .05 * R, tipY - .06 * R)} Q${P(cx, tipY + .02 * R)} ${P(cx + .05 * R, tipY - .06 * R)} L${P(cx + cw, g2)} Z"/>`;
    s += `<path fill="${opt.gear || '#ffd43b'}" d="M${P(cx - gx, g1)} L${P(cx + gx, g1)} L${P(cx + gx, g2)} A${f(gx)} ${f(gy)} 0 0 1 ${P(cx - gx, g2)} Z"/>`;
    for (const a of [Math.PI / 2 - 1.05, Math.PI / 2 - .5, Math.PI / 2, Math.PI / 2 + .5, Math.PI / 2 + 1.05]) {
      const x = cx + gx * Math.cos(a);
      s += `<path d="M${P(x, g1)} L${P(x, g2 + gy * Math.sin(a))}"/>`;
    }
    // 棘輪（中間那層，有方形齒）
    const rx = .5 * R, r1 = cy + .2 * R, r2 = cy + .58 * R, ry = rx * K;
    s += `<path fill="${opt.ratchet || '#adb5bd'}" d="M${P(cx - rx, r1)} L${P(cx + rx, r1)} L${P(cx + rx, r2)} A${f(rx)} ${f(ry)} 0 0 1 ${P(cx - rx, r2)} Z"/>`;
    for (const a of [Math.PI / 2 - .85, Math.PI / 2, Math.PI / 2 + .85]) {
      const x = cx + rx * .97 * Math.cos(a), yb = r2 + ry * Math.sin(a) - .05 * R;
      const w = .17 * R * (.45 + .55 * Math.sin(a));
      s += `<rect x="${f(x - w / 2)}" y="${f(yb - .12 * R)}" width="${f(w)}" height="${f(.12 * R)}" rx="${f(.02 * R)}" fill="${opt.tooth || '#e9ecef'}"/>`;
    }
    // 刀刃環：側面
    const pts = bladePts(cx, cy, R, th, K);
    const front = pts.map(p => {
      let a = ((p[2] % TAU) + TAU) % TAU;
      if (a > TAU - .2) a -= TAU;
      return [p[0], p[1], a];
    }).filter(p => p[2] >= -.2 && p[2] <= Math.PI + .2).sort((a, b) => a[2] - b[2]);
    const band = front.concat(front.slice().reverse().map(p => [p[0], p[1] + h]));
    s += `<path fill="${th.side}" d="${poly(band)}"/>`;
    // 刀刃環：上面
    s += `<path fill="${th.blade}" d="${poly(pts)}"/>`;
    s += accents(cx, cy, R, th, K);
    s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(.58 * R)}" ry="${f(.58 * R * K)}" fill="${th.core}"/>`;
    // 徽章（凸起來的圓）
    const ey = cy - .04 * R, erx = .38 * R, ery = .27 * R;
    s += `<ellipse cx="${f(cx)}" cy="${f(ey + .06 * R)}" rx="${f(erx)}" ry="${f(ery)}" fill="${th.side}"/>`;
    s += `<ellipse cx="${f(cx)}" cy="${f(ey)}" rx="${f(erx)}" ry="${f(ery)}" fill="${th.emb}"/>`;
    s += motif[th.m](cx, ey, ery * .95);
    return s;
  }

  /* 從上面往下看的陀螺 */
  function topDown(cx, cy, R, name) {
    const th = THEME[name];
    let s = `<path fill="${th.blade}" d="${poly(bladePts(cx, cy, R, th, 1))}"/>`;
    s += accents(cx, cy, R, th, 1);
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(.58 * R)}" fill="${th.core}"/>`;
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      s += `<circle cx="${f(cx + .49 * R * Math.cos(a))}" cy="${f(cy + .49 * R * Math.sin(a))}" r="${f(.05 * R)}" fill="#adb5bd"/>`;
    }
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(.4 * R)}" fill="${th.emb}"/>`;
    s += motif[th.m](cx, cy + .04 * R, .3 * R);
    return s;
  }

  // 陀螺周圍的旋轉速度線（畫在陀螺前面之前，會被陀螺蓋住）
  function spinLines(cx, cy, R) {
    const rx = 1.14 * R, ry = rx * K;
    return arc(cx, cy, rx, ry, Math.PI + .35, Math.PI + 1.15) + arc(cx, cy, rx, ry, TAU - 1.15, TAU - .35) +
      arc(cx, cy + .2 * R, 1.2 * R, 1.2 * R * K, Math.PI - .25, Math.PI + .25) + arc(cx, cy + .2 * R, 1.2 * R, 1.2 * R * K, -.25, .25);
  }
  const floorSpin = (cx, y, rx) => arc(cx, y, rx, rx * .28, .3, Math.PI - .3) + arc(cx, y, rx * 1.35, rx * .38, .5, Math.PI - .5);

  /* ---------------- 單顆陀螺 ---------------- */
  const hero = (name, extra = '') => `
    ${spinLines(400, 205, 235)}
    ${floorSpin(400, 515, 70)}
    ${top3(400, 205, 235, name)}
    ${extra}`;

  const bolt = (x, y, s = 1, c = '#ffe066') =>
    `<path fill="${c}" d="M${P(x, y)} L${P(x + 35 * s, y - 60 * s)} L${P(x + 25 * s, y - 20 * s)} L${P(x + 55 * s, y - 25 * s)} L${P(x + 10 * s, y + 45 * s)} L${P(x + 23 * s, y + 5 * s)} Z"/>`;
  const flame = (x, y, s = 1, c = '#ff922b') =>
    `<path fill="${c}" d="M${P(x, y)} Q${P(x - 30 * s, y - 30 * s)} ${P(x - 5 * s, y - 70 * s)} Q${P(x, y - 40 * s)} ${P(x + 15 * s, y - 45 * s)} Q${P(x + 12 * s, y - 75 * s)} ${P(x + 30 * s, y - 85 * s)} Q${P(x + 50 * s, y - 30 * s)} ${P(x + 20 * s, y)} Z"/>`;

  const phoenix = hero('phoenix', `${flame(70, 160, 1)} ${flame(700, 170, .8, '#ffd43b')} ${sparkle(100, 470, 16)} ${sparkle(705, 470, 18, '#ff922b')}`);
  const clock = hero('clock', `${sparkle(95, 110, 20, '#e599f7')} ${sparkle(705, 115, 16)}
    <circle cx="100" cy="460" r="32" fill="#f3d9fa"/><path d="M100 460 L100 440 M100 460 L114 468"/>
    <circle cx="705" cy="455" r="26" fill="#f3d9fa"/><path d="M705 455 L705 438 M705 455 L690 462"/>`);
  const knight = hero('knight', `${sparkle(100, 120, 20)} ${sparkle(700, 115, 16, '#a5d8ff')} ${sparkle(705, 480, 14)} ${sparkle(95, 470, 16, '#a5d8ff')}`);
  const whip = hero('whip', `<path d="M60 170 Q110 120 90 80 M700 210 Q750 160 735 110"/>
    ${sparkle(100, 470, 18, '#ffd43b')} ${sparkle(705, 470, 16, '#8ce99a')}`);
  const charge = hero('charge', `<path d="M40 250 L120 250 M30 300 L105 300 M50 350 L115 350"/>
    ${sparkle(700, 120, 20, '#bac8ff')} ${sparkle(100, 470, 16)} ${sparkle(705, 470, 14)}`);
  const brave = hero('brave', `${star(95, 115, 26, 11, 5, '#ffe066')} ${sparkle(705, 120, 18, '#a5d8ff')} ${sparkle(100, 470, 14)} ${star(705, 470, 22, 10, 5, '#ffe066')}`);
  const meteor = hero('meteor', `
    <path fill="#ffd43b" d="M80 150 Q120 105 175 80 Q140 125 135 150 Q120 175 95 175 Q75 170 80 150 Z"/>
    <path fill="#ff922b" d="M640 520 Q690 480 745 460 Q712 500 708 525 Q695 548 668 545 Q640 540 640 520 Z"/>
    ${sparkle(700, 120, 18, '#ffd43b')} ${sparkle(95, 470, 16, '#ff922b')}`);
  const unicorn = hero('unicorn', `${bolt(70, 150)} ${bolt(690, 160, .9)} ${star(100, 470, 22, 10, 5, '#e599f7')} ${star(705, 470, 26, 11, 5, '#ffe066')}`);
  const shark = hero('shark', `
    <path fill="#a5d8ff" d="M50 535 Q110 500 170 535 Q230 500 290 535 L290 565 L50 565 Z"/>
    <path fill="#a5d8ff" d="M510 535 Q570 500 630 535 Q690 500 750 535 L750 565 L510 565 Z"/>
    ${sparkle(95, 120, 16, '#d0ebff')} ${sparkle(705, 120, 18)}`);
  const panther = hero('panther', `<path d="M70 120 L120 200 M100 105 L150 185 M130 95 L175 165 M640 400 L690 470 M670 385 L720 455 M700 375 L745 435"/>
    ${sparkle(705, 120, 18, '#d0bfff')} ${sparkle(100, 470, 16)}`);
  const turtle = hero('turtle', `
    <path fill="#adb5bd" d="M60 540 Q60 470 115 465 Q170 470 175 540 Z"/>
    <path fill="#adb5bd" d="M640 540 Q645 490 690 485 Q740 492 745 540 Z"/>
    ${sparkle(95, 120, 18, '#d8f5a2')} ${sparkle(705, 125, 16)}`);
  const rhino = hero('rhino', `
    <path fill="#868e96" d="M40 560 L120 430 L170 500 L200 470 L260 560 Z"/>
    ${flame(108, 425, .55, '#ff922b')}
    ${sparkle(705, 120, 18, '#ff922b')} ${sparkle(100, 120, 16)} ${sparkle(705, 470, 16, '#ffd43b')}`);

  /* ---------------- 上面看 ---------------- */
  const phoenixTop = `
    <path d="M150 300 A250 250 0 0 1 220 125 M650 300 A250 250 0 0 1 580 475"/>
    <path d="M115 330 A285 285 0 0 1 140 210 M685 270 A285 285 0 0 1 660 390"/>
    ${topDown(400, 300, 255, 'phoenix')}
    ${sparkle(110, 110, 20, '#ffd43b')} ${sparkle(690, 110, 16, '#ff922b')} ${sparkle(700, 500, 18)}`;

  /* ---------------- 發射器 ---------------- */
  // 捲繩發射器：轉轉捲繩器 + 拉繩手把，下面掛著一顆陀螺
  const winder = `
    <path d="M232 228 Q190 215 175 245 Q160 270 135 255"/>
    <rect x="70" y="205" width="70" height="105" rx="24" fill="#ffd43b"/>
    <rect x="92" y="230" width="26" height="55" rx="13" fill="#fff9db"/>
    <path fill="#ff922b" d="M300 280 L380 280 L360 470 Q356 490 336 490 L300 490 Q282 490 284 470 Z"/>
    <path d="M292 340 L370 340 M290 390 L366 390 M288 440 L362 440"/>
    <rect x="225" y="170" width="380" height="125" rx="48" fill="#4dabf7"/>
    <circle cx="370" cy="232" r="46" fill="#ffd43b"/>
    <circle cx="370" cy="232" r="18" fill="#adb5bd"/>
    <rect x="470" y="200" width="100" height="26" rx="13" fill="#d0ebff"/>
    <rect x="490" y="290" width="80" height="34" rx="8" fill="#868e96"/>
    ${spinLines(530, 395, 115).replace(/<path d="M[^"]*"\/><path d="M[^"]*"\/>/, '')}
    ${top3(530, 395, 115, 'meteor')}
    ${sparkle(700, 160, 20)} ${sparkle(150, 430, 18, '#a5d8ff')} ${sparkle(720, 470, 14)}`;

  // 拉條發射器：長長的齒條拉條
  const rack = (() => {
    let teeth = 'M90 236';
    for (let x = 110; x <= 330; x += 22) teeth += ` L${x - 11} 222 L${x} 236`;
    return `
    <path fill="#ff6b6b" d="${teeth} L330 262 L90 262 Z"/>
    <path fill="#ffd43b" d="M40 190 L100 190 Q115 190 115 205 L115 295 Q115 310 100 310 L40 310 Q25 310 25 295 L25 205 Q25 190 40 190 Z"/>
    <rect x="48" y="220" width="40" height="60" rx="14" fill="#fff9db"/>
    <path fill="#69db7c" d="M300 175 L560 175 Q610 175 610 225 L610 255 Q610 300 565 300 L300 300 Q270 300 270 270 L270 205 Q270 175 300 175 Z"/>
    ${star(440, 237, 40, 18, 5, '#ffe066')}
    <path fill="#2f9e44" d="M560 300 L600 300 L640 440 Q645 460 625 462 L600 464 Q585 464 580 450 Z"/>
    <path d="M590 340 L615 340 M600 380 L625 380 M610 420 L634 420"/>
    <rect x="370" y="295" width="80" height="34" rx="8" fill="#868e96"/>
    ${top3(410, 400, 110, 'knight')}
    ${sparkle(700, 140, 20)} ${sparkle(170, 420, 20, '#ffd43b')} ${sparkle(110, 520, 14)}`;
  })();

  /* ---------------- 零件：三層分開 ---------------- */
  const parts = (() => {
    const cx = 260, R = 165;
    const th = THEME.phoenix;
    // 第 1 層：刀刃環
    const by = 115;
    const pts = bladePts(cx, by, R, th, K);
    const front = pts.map(p => { let a = ((p[2] % TAU) + TAU) % TAU; if (a > TAU - .2) a -= TAU; return [p[0], p[1], a]; })
      .filter(p => p[2] >= -.2 && p[2] <= Math.PI + .2).sort((a, b) => a[2] - b[2]);
    const band = front.concat(front.slice().reverse().map(p => [p[0], p[1] + .18 * R]));
    let blade = `<path fill="${th.side}" d="${poly(band)}"/><path fill="${th.blade}" d="${poly(pts)}"/>${accents(cx, by, R, th, K)}
      <ellipse cx="${cx}" cy="${by}" rx="${f(.58 * R)}" ry="${f(.58 * R * K)}" fill="${th.core}"/>
      <ellipse cx="${cx}" cy="${f(by - .04 * R + .06 * R)}" rx="${f(.38 * R)}" ry="${f(.27 * R)}" fill="${th.side}"/>
      <ellipse cx="${cx}" cy="${f(by - .04 * R)}" rx="${f(.38 * R)}" ry="${f(.27 * R)}" fill="${th.emb}"/>
      ${motif[th.m](cx, by - .04 * R, .27 * R * .95)}`;
    // 第 2 層：棘輪（看得到上面的方形齒）
    const ry0 = 300, rx = 92, ry = rx * K, hh = 42;
    let ratchet = `<path fill="#adb5bd" d="M${cx - rx} ${ry0} L${cx - rx} ${ry0 + hh} A${rx} ${f(ry)} 0 0 0 ${cx + rx} ${ry0 + hh} L${cx + rx} ${ry0} Z"/>
      <ellipse cx="${cx}" cy="${ry0}" rx="${rx}" ry="${f(ry)}" fill="#dee2e6"/>
      <ellipse cx="${cx}" cy="${ry0}" rx="38" ry="${f(38 * K)}" fill="#868e96"/>`;
    const tooth = a => {
      const x = cx + rx * .8 * Math.cos(a), y = ry0 + ry * .8 * Math.sin(a);
      return `<rect x="${f(x - 17)}" y="${f(y - 26)}" width="34" height="26" rx="4" fill="#f1f3f5"/>`;
    };
    ratchet += [-.6, Math.PI + .6].map(tooth).join('') + [.6, Math.PI - .6].map(tooth).join('');
    // 第 3 層：尖底 + 小齒輪
    const gy0 = 435, gx = 58, gh = 32, gry = gx * K;
    let bit = `<path fill="#868e96" d="M${cx - 42} ${gy0 + gh} L${cx - 9} 566 Q${cx} 578 ${cx + 9} 566 L${cx + 42} ${gy0 + gh} Z"/>
      <path fill="#ffd43b" d="M${cx - gx} ${gy0} L${cx - gx} ${gy0 + gh} A${gx} ${f(gry)} 0 0 0 ${cx + gx} ${gy0 + gh} L${cx + gx} ${gy0} Z"/>
      <ellipse cx="${cx}" cy="${gy0}" rx="${gx}" ry="${f(gry)}" fill="#ffe066"/>`;
    for (const a of [Math.PI / 2 - 1, Math.PI / 2 - .45, Math.PI / 2, Math.PI / 2 + .45, Math.PI / 2 + 1]) {
      const x = cx + gx * Math.cos(a);
      bit += `<path d="M${f(x)} ${f(gy0 + gry * Math.sin(a))} L${f(x)} ${f(gy0 + gh + gry * Math.sin(a))}"/>`;
    }
    bit += `<path fill="#dee2e6" d="M${cx - 22} ${gy0} L${cx - 22} ${gy0 - 30} A22 9 0 0 1 ${cx + 22} ${gy0 - 30} L${cx + 22} ${gy0} Z"/>
      <ellipse cx="${cx}" cy="${gy0 - 30}" rx="22" ry="9" fill="#f1f3f5"/>`;
    return `
      <path d="M${cx} 228 L${cx} 240 M${cx} 252 L${cx} 262"/>
      ${blade}
      ${ratchet}
      ${bit}
      <path fill="#ffe066" d="M450 270 L520 270 L520 240 L575 300 L520 360 L520 330 L450 330 Z"/>
      ${top3(670, 215, 108, 'phoenix')}
      ${sparkle(560, 140, 16)} ${sparkle(760, 420, 16, '#ff922b')}`;
  })();

  /* ---------------- 軌道對戰盤：極限衝刺 ---------------- */
  const stadium = (() => {
    const cx = 400, cy = 300;
    let ticks = '';
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * TAU + .08;
      if (Math.sin(a) > .35 && Math.cos(a) > -.1 && Math.cos(a) < .75) continue; // 陀螺擋住的地方不用畫
      ticks += `<path d="M${P(cx + 312 * Math.cos(a), cy + 118 * Math.sin(a))} L${P(cx + 340 * Math.cos(a), cy + 130 * Math.sin(a))}"/>`;
    }
    const a = .95, tx = cx + 326 * Math.cos(a), ty = cy + 124 * Math.sin(a);
    return `
      <path fill="#4dabf7" d="M40 300 L64 395 A336 130 0 0 0 736 395 L760 300 Z"/>
      <ellipse cx="${cx}" cy="${cy}" rx="360" ry="142" fill="#a5d8ff"/>
      <ellipse cx="${cx}" cy="${cy}" rx="340" ry="130" fill="#ffd43b"/>
      <ellipse cx="${cx}" cy="${cy}" rx="312" ry="118" fill="#e7f5ff"/>
      ${ticks}
      <ellipse cx="${cx}" cy="${cy - 8}" rx="120" ry="44" fill="#d0ebff"/>
      ${top3(330, 205, 62, 'clock')}
      <path d="M190 370 Q260 412 340 425 M220 330 Q280 372 360 388 M170 405 Q240 445 330 458"/>
      ${top3(tx + 20, ty - 85, 66, 'charge')}
      ${sparkle(tx + 30, ty + 6, 16, '#ff922b')} ${sparkle(tx + 82, ty - 10, 12)} ${sparkle(tx - 20, ty + 22, 10)}
      ${sparkle(90, 120, 22)} ${sparkle(710, 110, 18, '#ffd43b')}`;
  })();

  /* ---------------- 碰！兩顆陀螺對撞 ---------------- */
  const clash = `
    <ellipse cx="400" cy="500" rx="370" ry="70" fill="#e7f5ff"/>
    <path d="M60 300 Q90 280 120 300 M50 360 Q80 340 110 360 M690 300 Q720 280 750 300 M700 360 Q730 340 760 360"/>
    <g transform="rotate(10 235 290)">${top3(235, 290, 140, 'whip')}</g>
    <g transform="rotate(-10 565 290)">${top3(565, 290, 140, 'knight')}</g>
    ${star(400, 225, 112, 62, 12, '#ffe066', -Math.PI / 2 + .13)}
    ${star(400, 225, 62, 36, 8, '#ff922b')}
    <rect x="388" y="180" width="24" height="52" rx="12" fill="#ff4b3e"/>
    <circle cx="400" cy="252" r="12" fill="#ff4b3e"/>
    ${sparkle(300, 90, 18)} ${sparkle(510, 80, 16, '#ff922b')} ${sparkle(400, 380, 14)}
    ${sparkle(110, 130, 16, '#ffd43b')} ${sparkle(700, 140, 18, '#a5d8ff')}`;

  /* ---------------- 小朋友發射陀螺 ---------------- */
  const kid = `
    <ellipse cx="560" cy="520" rx="210" ry="48" fill="#e7f5ff"/>
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
    ${spinLines(590, 345, 105)}
    ${floorSpin(590, 520, 60)}
    ${top3(590, 345, 105, 'brave')}
    <path d="M470 270 Q500 300 520 300 M500 250 Q540 275 560 270"/>
    ${sparkle(700, 120, 22)} ${sparkle(560, 120, 16, '#ff922b')} ${sparkle(745, 300, 14)}`;

  /* ---------------- 冠軍獎盃 ---------------- */
  const trophy = `
    ${sparkle(140, 130, 24)} ${sparkle(660, 120, 20)} ${sparkle(650, 380, 14, '#ffd43b')} ${sparkle(150, 400, 16, '#a5d8ff')}
    <path fill="#ffd43b" d="M265 120 Q170 120 178 210 Q188 300 300 312 L312 280 Q222 268 215 210 Q212 160 265 160 Z"/>
    <path fill="#ffd43b" d="M535 120 Q630 120 622 210 Q612 300 500 312 L488 280 Q578 268 585 210 Q588 160 535 160 Z"/>
    <path fill="#ffe066" d="M250 80 L550 80 L535 230 Q510 360 400 365 Q290 360 265 230 Z"/>
    ${topDown(400, 200, 92, 'gold')}
    <rect x="368" y="360" width="64" height="60" fill="#fab005"/>
    <rect x="290" y="415" width="220" height="40" rx="10" fill="#fab005"/>
    <rect x="250" y="452" width="300" height="80" rx="12" fill="#c0874a"/>
    <rect x="320" y="472" width="160" height="40" rx="8" fill="#ffe8cc"/>`;

  window.ART.addPack({
    categories: [
      { id: 'tops', name: '對戰陀螺', icon: '🌀', color: '#228be6', dark: '#1864ab', en: 'Battle Tops' },
    ],
    drawings: [
      { id: 'tp-phoenix', cat: 'tops', name: '鳳凰陀螺', en: 'Phoenix Top', svg: phoenix },
      { id: 'tp-clock', cat: 'tops', name: '時鐘陀螺', en: 'Clock Top', svg: clock },
      { id: 'tp-knight', cat: 'tops', name: '騎士盾陀螺', en: 'Knight Shield Top', svg: knight },
      { id: 'tp-whip', cat: 'tops', name: '飛龍鞭陀螺', en: 'Dragon Whip Top', svg: whip },
      { id: 'tp-charge', cat: 'tops', name: '藍龍衝鋒陀螺', en: 'Blue Dragon Charge Top', svg: charge },
      { id: 'tp-brave', cat: 'tops', name: '勇氣藍龍陀螺', en: 'Brave Blue Dragon Top', svg: brave },
      { id: 'tp-meteor', cat: 'tops', name: '流星龍騎士陀螺', en: 'Meteor Dragon Knight Top', svg: meteor },
      { id: 'tp-unicorn', cat: 'tops', name: '閃電獨角獸陀螺', en: 'Lightning Unicorn Top', svg: unicorn },
      { id: 'tp-shark', cat: 'tops', name: '鯊魚利齒陀螺', en: 'Shark Teeth Top', svg: shark },
      { id: 'tp-panther', cat: 'tops', name: '黑豹爪陀螺', en: 'Panther Claw Top', svg: panther },
      { id: 'tp-turtle', cat: 'tops', name: '巨石烏龜陀螺', en: 'Rock Turtle Top', svg: turtle },
      { id: 'tp-rhino', cat: 'tops', name: '火山犀牛陀螺', en: 'Volcano Rhino Top', svg: rhino },
      { id: 'tp-phoenix-above', cat: 'tops', name: '從上面看鳳凰陀螺', en: 'Phoenix Top from above', svg: phoenixTop },
      { id: 'tp-parts', cat: 'tops', name: '陀螺三零件', en: 'top parts', svg: parts },
      { id: 'tp-winder', cat: 'tops', name: '捲繩發射器', en: 'string launcher', svg: winder },
      { id: 'tp-rack', cat: 'tops', name: '拉條發射器', en: 'ripcord launcher', svg: rack },
      { id: 'tp-stadium', cat: 'tops', name: '極限衝刺對戰盤', en: 'rail stadium dash', svg: stadium },
      { id: 'tp-clash', cat: 'tops', name: '碰！陀螺對撞', en: 'tops clashing', svg: clash },
      { id: 'tp-kid', cat: 'tops', name: '發射陀螺囉', en: 'launching a top', svg: kid },
      { id: 'tp-trophy', cat: 'tops', name: '冠軍獎盃', en: 'champion trophy', svg: trophy },
    ],
  });
})();
