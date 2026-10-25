/* 故事包：manners（由 stories-*.js 加進 window.BOOKS） */
(function () {
  const { scene, put } = window.ART;
  const svg = inner => `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

  /* ---- 這個故事包自己用的小道具（同樣的卡通風格：粗黑線、平塗色） ---- */
  const L = 'stroke="#222" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  const local = {
    // 室內：牆壁 + 木頭地板 + 小窗戶
    room: () => `<rect width="800" height="500" fill="#ffe8cc"/>
      <rect x="560" y="70" width="170" height="140" rx="10" fill="#bfe8ff" ${L}/><path d="M645 70 L645 210 M560 140 L730 140" ${L}/>
      <rect y="380" width="800" height="120" fill="#e0a96d"/><path d="M0 380 L800 380" ${L}/>
      ${[120, 300, 480, 660].map(x => `<path d="M${x} 385 L${x - 30} 500" stroke="#c98a4b" stroke-width="4"/>`).join('')}`,
    // 花瓶（broken = 破掉的碎片）
    vase: (x, y, broken) => broken
      ? `<g class="tap" data-anim="wiggle" data-sound="pop">
        ${[[-70, 10, -20], [-10, 25, 15], [50, 5, 40], [100, 30, -10]].map(([dx, dy, r]) => `<path transform="rotate(${r} ${x + dx} ${y + dy})" d="M${x + dx - 26} ${y + dy} L${x + dx} ${y + dy - 30} L${x + dx + 28} ${y + dy - 6} L${x + dx + 10} ${y + dy + 18} Z" fill="#74c0fc" ${L}/>`).join('')}
        <path d="M${x - 130} ${y + 20} Q${x - 110} ${y - 10} ${x - 90} ${y + 10}" fill="none" stroke="#2f9e44" stroke-width="6"/><circle cx="${x - 132}" cy="${y + 16}" r="14" fill="#ff8787" ${L}/>
        <path d="M${x + 150} ${y + 30} Q${x + 170} ${y} ${x + 190} ${y + 20}" fill="none" stroke="#2f9e44" stroke-width="6"/><circle cx="${x + 194}" cy="${y + 18}" r="14" fill="#ffd43b" ${L}/></g>`
      : `<g class="tap" data-anim="wiggle" data-sound="pop">
        <path d="M${x - 30} ${y - 120} Q${x - 50} ${y - 170} ${x - 60} ${y - 190} M${x} ${y - 120} L${x} ${y - 200} M${x + 30} ${y - 120} Q${x + 50} ${y - 170} ${x + 60} ${y - 190}" fill="none" stroke="#2f9e44" stroke-width="7"/>
        <circle cx="${x - 60}" cy="${y - 196}" r="20" fill="#ff8787" ${L}/><circle cx="${x}" cy="${y - 208}" r="20" fill="#ffd43b" ${L}/><circle cx="${x + 60}" cy="${y - 196}" r="20" fill="#da77f2" ${L}/>
        <path d="M${x - 28} ${y - 130} L${x + 28} ${y - 130} L${x + 22} ${y - 100} Q${x + 70} ${y - 60} ${x + 45} ${y - 5} L${x - 45} ${y - 5} Q${x - 70} ${y - 60} ${x - 22} ${y - 100} Z" fill="#74c0fc" ${L}/>
        <path d="M${x - 40} ${y - 50} Q${x} ${y - 30} ${x + 40} ${y - 50}" fill="none" stroke="#fff" stroke-width="6"/></g>`,
    // 小桌子
    table: (x, y, w = 260) => `<g ${L}><rect x="${x - w / 2}" y="${y}" width="${w}" height="24" rx="8" fill="#c98a4b"/>
      <path d="M${x - w / 2 + 25} ${y + 24} L${x - w / 2 + 25} ${y + 110} M${x + w / 2 - 25} ${y + 24} L${x + w / 2 - 25} ${y + 110}" stroke-width="14" stroke="#9c6332"/></g>`,
    // 眼淚
    tear: (x, y, s = 1) => `<path class="fall" d="M${x} ${y - 18 * s} Q${x + 14 * s} ${y + 2 * s} ${x} ${y + 12 * s} Q${x - 14 * s} ${y + 2 * s} ${x} ${y - 18 * s} Z" fill="#74c0fc" stroke="#222" stroke-width="4"/>`,
    // 生氣的符號
    angry: (x, y) => `<g class="tap" data-anim="boing" data-sound="boing" stroke="#e03131" stroke-width="9" fill="none" stroke-linecap="round">
      <path d="M${x - 30} ${y - 10} Q${x - 10} ${y - 10} ${x - 10} ${y - 30}"/><path d="M${x + 10} ${y - 30} Q${x + 10} ${y - 10} ${x + 30} ${y - 10}"/>
      <path d="M${x - 30} ${y + 10} Q${x - 10} ${y + 10} ${x - 10} ${y + 30}"/><path d="M${x + 10} ${y + 30} Q${x + 10} ${y + 10} ${x + 30} ${y + 10}"/></g>`,
    // 深呼吸的風
    breath: (x, y) => `<g class="drift" fill="none" stroke="#4dabf7" stroke-width="8" stroke-linecap="round">
      <path d="M${x} ${y} Q${x + 60} ${y - 30} ${x + 120} ${y} T${x + 220} ${y}"/><path d="M${x + 20} ${y + 40} Q${x + 80} ${y + 10} ${x + 140} ${y + 40} T${x + 230} ${y + 40}"/>
      <circle cx="${x + 240}" cy="${y - 10}" r="12" fill="#d0ebff" stroke-width="5"/><circle cx="${x + 255}" cy="${y + 50}" r="9" fill="#d0ebff" stroke-width="5"/></g>`,
    // 掃把
    broom: (x, y, rot = 15) => `<g class="tap" data-anim="wiggle" data-sound="pop"><g transform="rotate(${rot} ${x} ${y})" ${L}>
      <path d="M${x} ${y - 230} L${x} ${y - 70}" stroke="#9c6332" stroke-width="14"/>
      <path d="M${x - 20} ${y - 80} L${x + 20} ${y - 80} L${x + 55} ${y} L${x - 55} ${y} Z" fill="#ffd43b"/>
      <path d="M${x - 25} ${y - 40} L${x + 25} ${y - 40}" stroke-width="5"/></g></g>`,
    // 一疊碗盤
    dishes: (x, y) => `<g class="tap" data-anim="jump" data-sound="pop" ${L}>
      ${[0, 1, 2].map(i => `<ellipse cx="${x}" cy="${y - i * 22}" rx="80" ry="18" fill="${['#fff', '#e7f5ff', '#fff'][i]}"/>`).join('')}
      <path d="M${x - 55} ${y - 90} Q${x} ${y - 30} ${x + 55} ${y - 90} Z" fill="#ffc9de"/>
      <path d="M${x + 70} ${y - 120} L${x + 20} ${y - 60} M${x + 85} ${y - 115} L${x + 35} ${y - 55}" stroke="#9c6332" stroke-width="7"/></g>`,
    // 摺好的衣服
    clothes: (x, y) => `<g class="tap" data-anim="jump" data-sound="pop" ${L}>
      ${['#ff8787', '#4dabf7', '#ffd43b', '#69db7c'].map((c, i) => `<rect x="${x - 70}" y="${y - (i + 1) * 34}" width="140" height="34" rx="8" fill="${c}"/>`).join('')}</g>`,
    // OK 繃
    bandage: (x, y, rot = -25) => `<g transform="rotate(${rot} ${x} ${y})" class="tap" data-anim="boing" data-sound="twinkle">
      <rect x="${x - 55}" y="${y - 18}" width="110" height="36" rx="18" fill="#ffd8a8" ${L}/><rect x="${x - 18}" y="${y - 14}" width="36" height="28" rx="6" fill="#ffc078"/>
      ${[-38, 30].map(dx => `<circle cx="${x + dx}" cy="${y - 4}" r="3" fill="#c98a4b"/><circle cx="${x + dx + 8}" cy="${y + 6}" r="3" fill="#c98a4b"/>`).join('')}</g>`,
    // 故事書（open = 打開的）
    book: (x, y, open) => open
      ? `<g class="tap" data-anim="boing" data-sound="pop" ${L}>
        <path d="M${x} ${y} Q${x - 50} ${y - 20} ${x - 100} ${y} L${x - 100} ${y - 110} Q${x - 50} ${y - 130} ${x} ${y - 110} Z" fill="#fff"/>
        <path d="M${x} ${y} Q${x + 50} ${y - 20} ${x + 100} ${y} L${x + 100} ${y - 110} Q${x + 50} ${y - 130} ${x} ${y - 110} Z" fill="#fff"/>
        <path d="M${x - 80} ${y - 40} Q${x - 70} ${y - 80} ${x - 40} ${y - 70} L${x - 25} ${y - 95} L${x - 22} ${y - 40} Z" fill="#69db7c" stroke-width="4"/>
        ${[0, 1, 2].map(i => `<path d="M${x + 20} ${y - 85 + i * 22} L${x + 80} ${y - 85 + i * 22}" stroke="#adb5bd" stroke-width="5"/>`).join('')}</g>`
      : `<g class="tap" data-anim="boing" data-sound="pop" ${L}>
        <rect x="${x - 60}" y="${y - 150}" width="120" height="150" rx="8" fill="#4dabf7"/><path d="M${x - 44} ${y - 150} L${x - 44} ${y}" stroke-width="4"/>
        <path d="M${x - 25} ${y - 40} Q${x - 20} ${y - 95} ${x + 10} ${y - 85} L${x + 25} ${y - 120} Q${x + 45} ${y - 115} ${x + 35} ${y - 95} L${x + 30} ${y - 40} Z" fill="#69db7c" stroke-width="4"/>
        <circle cx="${x + 28}" cy="${y - 110}" r="3" fill="#222" stroke="none"/></g>`,
  };

  window.BOOKS.push(
    {
      id: 'take-turns', tag: '品德', title: '小兔排隊溜滑梯',
      cover: svg(scene.day() + scene.grass() + put('playground', 280, 70, 500) + put('bunny', 20, 170, 280)),
      pages: [
        { text: '公園裡有一座好高好高的溜滑梯。', art: svg(scene.day() + scene.grass() + scene.tree(110) + put('playground', 240, 60, 520, 'boing', 'pop')) },
        { text: '小兔子好想溜，一下子就衝到最前面。', art: svg(scene.day() + scene.grass() + put('playground', 420, 100, 400) + put('bunny', 230, 170, 260, 'jump', 'boing') + put('pig', 0, 220, 200) + put('chick', 110, 250, 170)) },
        { text: '小豬和小雞說：「要排隊喔！」', art: svg(scene.day() + scene.grass() + put('bunny', 470, 150, 290) + put('pig', 30, 170, 270, 'boing', 'boing') + put('chick', 260, 200, 230, 'jump', 'pop') + scene.bubble(60, 40, '要排隊喔！', 240)) },
        { text: '小兔子乖乖走到後面，一個一個排好。', art: svg(scene.day() + scene.grass() + put('playground', 450, 90, 420) + put('chick', 280, 230, 200) + put('pig', 120, 220, 210) + put('bunny', -40, 200, 230, 'jump', 'boing')) },
        { text: '輪到小兔子了，咻！溜下來好好玩！', art: svg(scene.day() + scene.grass() + put('playground', 60, 60, 520) + put('bunny', 470, 210, 240, 'jump', 'yay') + scene.stars()) },
        { text: '你溜完、我再溜，大家都玩得好開心。', art: svg(scene.day() + scene.sun() + scene.grass() + put('pig', 10, 180, 250, 'jump', 'boing') + put('bunny', 270, 170, 260, 'jump', 'boing') + put('chick', 540, 200, 230, 'jump', 'pop') + scene.heart(400, 110)) },
        { text: '排隊輪流，每個人都能玩到喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('playground', 300, 80, 440) + put('bunny', 30, 160, 290) + scene.heart(150, 110, 26) + scene.stars()) },
      ],
    },
    {
      id: 'honest', tag: '品德', title: '小熊說實話',
      cover: svg(local.room() + put('bear', 60, 130, 320) + local.vase(560, 450, true) + scene.heart(560, 290)),
      pages: [
        { text: '小熊在家裡丟球，玩得好開心。', art: svg(local.room() + local.table(600, 330, 220) + local.vase(600, 330) + put('bear', 60, 130, 330, 'jump', 'boing') + scene.ball(420, 250)) },
        { text: '碰！球打到花瓶，花瓶破掉了。', art: svg(local.room() + local.table(600, 330, 220) + local.vase(560, 450, true) + scene.ball(700, 300) + put('bear', 30, 140, 310, 'wiggle', 'boing')) },
        { text: '小熊好害怕，想把碎片偷偷藏起來。', art: svg(local.room() + put('bear', 120, 130, 320, 'wiggle', 'pop') + local.vase(560, 450, true) + local.tear(330, 260)) },
        { text: '熊媽媽回來了，問：「發生什麼事了？」', art: svg(local.room() + put('bear', 10, 170, 280) + put('bear', 400, 50, 420, 'boing', 'boing') + scene.bubble(380, 20, '怎麼了？', 220)) },
        { text: '小熊說：「是我打破的，對不起。」', art: svg(local.room() + put('bear', 30, 150, 300, 'wiggle', 'pop') + put('bear', 400, 50, 420) + scene.bubble(30, 30, '是我打破的', 280)) },
        { text: '媽媽抱抱小熊：「謝謝你說實話。」', art: svg(local.room() + put('bear', 300, 160, 270, 'jump', 'twinkle') + put('bear', 60, 50, 420) + scene.heart(560, 140) + scene.heart(660, 230, 22)) },
        { text: '做錯事不要怕，說實話才是好孩子！', art: svg(scene.day() + scene.sun() + scene.grass() + put('bear', 220, 100, 360, 'jump', 'yay') + scene.heart(130, 140, 26) + scene.heart(660, 150) + scene.stars()) },
      ],
    },
    {
      id: 'chores', tag: '品德', title: '小豬是好幫手',
      cover: svg(local.room() + put('pig', 60, 140, 320) + local.broom(560, 460) + local.dishes(660, 450)),
      pages: [
        { text: '豬媽媽好忙，要掃地，還要洗碗。', art: svg(local.room() + put('pig', 30, 70, 420, 'wiggle', 'pop') + local.broom(520, 460) + local.dishes(670, 450)) },
        { text: '小豬說：「媽媽，我來幫忙！」', art: svg(local.room() + put('pig', 440, 60, 400) + put('pig', 50, 190, 250, 'jump', 'yay') + scene.bubble(40, 50, '我來幫忙！', 250)) },
        { text: '小豬拿起掃把，沙沙沙，地掃乾淨了。', art: svg(local.room() + put('pig', 80, 130, 320, 'wiggle', 'pop') + local.broom(520, 470, 20) + scene.stars()) },
        { text: '吃完飯，小豬幫忙把碗盤收好。', art: svg(local.room() + local.table(560, 330, 300) + local.dishes(560, 320) + put('pig', 30, 140, 310, 'jump', 'pop')) },
        { text: '小豬還把衣服摺得整整齊齊。', art: svg(local.room() + put('pig', 50, 130, 320, 'boing', 'pop') + local.clothes(590, 460)) },
        { text: '媽媽笑著說：「謝謝你，好幫手！」', art: svg(local.room() + put('pig', 380, 60, 420, 'boing', 'twinkle') + put('pig', 40, 190, 250) + scene.bubble(360, 20, '好幫手！', 220) + scene.heart(330, 190)) },
        { text: '家是大家的，我也是家裡的小幫手！', art: svg(scene.day() + scene.sun() + scene.grass() + put('my-house', 380, 60, 420) + put('pig', 20, 150, 320, 'jump', 'yay') + scene.heart(380, 110)) },
      ],
    },
    {
      id: 'calm-down', tag: '品德', title: '小老虎深呼吸',
      cover: svg(scene.day() + scene.grass() + put('tiger', 90, 120, 340) + local.breath(470, 220)),
      pages: [
        { text: '小老虎在堆積木，想蓋一座高高的塔。', art: svg(scene.day() + scene.sun() + scene.grass() + put('tiger', 60, 130, 330, 'jump', 'pop') + scene.blocks(520, 130)) },
        { text: '積木一直倒下來，小老虎好生氣！', art: svg(scene.day() + scene.grass() + put('tiger', 40, 120, 340, 'wiggle', 'roar') + local.angry(330, 150) + scene.blocks(500, 210, true)) },
        { text: '牠好想大吼大叫，把積木丟出去。', art: svg(scene.day() + scene.grass() + put('tiger', 180, 110, 380, 'boing', 'roar') + scene.bubble(480, 40, '吼——！', 220) + local.angry(190, 140)) },
        { text: '等一下！先深深吸一口氣，再慢慢吐出來。', art: svg(scene.day() + scene.grass() + put('tiger', 60, 120, 340, 'boing', 'twinkle') + local.breath(420, 230)) },
        { text: '心情好多了，小老虎說：「請幫幫我。」', art: svg(scene.day() + scene.grass() + put('tiger', 30, 150, 310, 'jump', 'pop') + put('monkey', 450, 150, 310) + scene.bubble(40, 40, '請幫幫我！', 250)) },
        { text: '小猴子幫忙扶著，高高的塔蓋好了！', art: svg(scene.day() + scene.sun() + scene.grass() + put('tiger', 0, 170, 270) + scene.blocks(370, 130) + put('monkey', 500, 170, 270, 'jump', 'pop') + scene.stars()) },
        { text: '生氣的時候，先深呼吸，再用說的喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('tiger', 60, 130, 320) + put('monkey', 430, 140, 310) + scene.heart(400, 90)) },
      ],
    },
    {
      id: 'comfort-friend', tag: '品德', title: '小貓的抱抱',
      cover: svg(scene.day() + scene.grass() + put('cat', 80, 140, 310) + put('duckling', 400, 160, 290) + scene.heart(400, 110)),
      pages: [
        { text: '小貓和小鴨在草地上跑來跑去。', art: svg(scene.day() + scene.sun() + scene.grass() + scene.flowers() + put('cat', 60, 130, 320, 'jump', 'pop') + put('duckling', 430, 150, 300, 'jump', 'pop')) },
        { text: '哎呀！小鴨跌倒了，膝蓋好痛。', art: svg(scene.day() + scene.grass() + put('cat', 10, 160, 260) + put('duckling', 330, 180, 330, 'wiggle', 'boing') + local.angry(720, 260)) },
        { text: '小鴨哭了，眼淚一直掉下來。', art: svg(scene.day() + scene.grass() + put('duckling', 220, 110, 380, 'wiggle', 'pop') + local.tear(350, 270) + local.tear(460, 290, .8)) },
        { text: '小貓跑過來問：「你還好嗎？」', art: svg(scene.day() + scene.grass() + put('cat', 30, 160, 290, 'jump', 'pop') + put('duckling', 450, 180, 280) + local.tear(625, 320, .7) + scene.bubble(30, 40, '你還好嗎？', 250)) },
        { text: '小貓幫小鴨貼上OK繃，陪在牠旁邊。', art: svg(scene.day() + scene.grass() + put('cat', 70, 150, 300, 'boing', 'pop') + put('duckling', 370, 170, 290) + local.bandage(520, 420)) },
        { text: '小貓給小鴨一個大大的抱抱。', art: svg(scene.day() + scene.grass() + put('cat', 130, 150, 300, 'boing', 'twinkle') + put('duckling', 340, 170, 290) + scene.heart(400, 110) + scene.heart(200, 160, 22) + scene.heart(620, 150, 22)) },
        { text: '小鴨笑了：「謝謝你陪我！」', art: svg(scene.day() + scene.sun() + scene.grass() + put('cat', 30, 160, 280) + put('duckling', 440, 160, 300, 'jump', 'yay') + scene.bubble(440, 40, '謝謝你！', 220)) },
        { text: '朋友難過的時候，陪陪他、抱抱他。', art: svg(scene.day() + scene.sun() + scene.grass() + scene.flowers() + put('cat', 60, 140, 310) + put('duckling', 420, 160, 300) + scene.heart(400, 90) + scene.stars()) },
      ],
    },
    {
      id: 'give-back', tag: '品德', title: '借來的恐龍書',
      cover: svg(scene.day() + scene.grass() + put('dog', 40, 150, 300) + local.book(400, 440) + put('panda', 480, 140, 300)),
      pages: [
        { text: '熊貓有一本好好看的恐龍故事書。', art: svg(scene.day() + scene.sun() + scene.grass() + put('panda', 60, 120, 340, 'jump', 'pop') + local.book(600, 430, true)) },
        { text: '小狗問：「可以借我看嗎？」', art: svg(scene.day() + scene.grass() + put('dog', 30, 160, 290, 'jump', 'woof') + put('panda', 460, 160, 290) + local.book(400, 450) + scene.bubble(30, 40, '可以借我嗎？', 290)) },
        { text: '熊貓說：「好啊，看完要還我喔！」', art: svg(scene.day() + scene.grass() + put('dog', 30, 160, 290) + put('panda', 460, 160, 290, 'boing', 'pop') + local.book(400, 450) + scene.bubble(470, 40, '好啊！', 200)) },
        { text: '小狗回到家，一頁一頁小心地看。', art: svg(local.room() + put('dog', 60, 140, 310, 'wiggle', 'woof') + local.book(560, 440, true)) },
        { text: '看完了，小狗想：「要記得還書。」', art: svg(scene.day() + scene.grass() + put('my-house', 400, 70, 400) + put('dog', 40, 150, 300, 'jump', 'woof') + local.book(440, 460)) },
        { text: '小狗說：「謝謝你借我，還給你！」', art: svg(scene.day() + scene.grass() + put('dog', 30, 160, 290, 'jump', 'woof') + put('panda', 460, 160, 290) + local.book(400, 440) + scene.bubble(30, 40, '還給你！', 220)) },
        { text: '熊貓好開心，還要再借小狗別的書。', art: svg(scene.day() + scene.sun() + scene.grass() + put('dog', 30, 160, 290) + put('panda', 460, 160, 290, 'jump', 'pop') + local.book(400, 440) + scene.heart(400, 110)) },
        { text: '借東西要愛惜，用完記得還喔！', art: svg(scene.day() + scene.sun() + scene.grass() + put('dog', 60, 140, 310) + put('panda', 430, 140, 310) + scene.heart(400, 90) + scene.stars()) },
      ],
    },
  );
})();
