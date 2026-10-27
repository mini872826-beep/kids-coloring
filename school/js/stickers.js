/* 貼紙本：做完小小考試、玩完小遊戲、跟我說說完一課，就得到一張貼紙（每個小朋友分開存）。
 * 首頁的「📒 貼紙本」可以看收集到的貼紙。 */
(function () {
  const POOL = ['🦄', '🐶', '🐱', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐧', '🐥', '🦊', '🐰', '🐻', '🐳', '🐬', '🦋', '🐞', '🌈', '⭐', '🌟', '🚀', '🚒', '🚂', '🚁', '⛵', '🎈', '🎁', '🍓', '🍉', '🍦', '🍩', '🧁', '🍭', '🌻', '🌸', '🍀', '🦖', '🦕', '🐙', '🦀', '🐠', '🏆', '👑', '💎', '🎨', '⚽', '🎵'];
  const key = () => { const kid = localStorage.getItem('kid'); return kid ? `${kid}|stickers` : 'stickers'; };
  const list = () => { try { return JSON.parse(localStorage.getItem(key())) || []; } catch (e) { return []; } };

  // 給一張貼紙：先給還沒收集到的，全部都有了再重複
  function give(from) {
    const have = new Set(list().map(s => s.e));
    const fresh = POOL.filter(e => !have.has(e));
    const pool = fresh.length ? fresh : POOL;
    const s = { e: pool[Math.floor(Math.random() * pool.length)], from, t: Date.now() };
    try { localStorage.setItem(key(), JSON.stringify([...list(), s])); } catch (e) { }
    return s;
  }

  // 跳出來的大貼紙（跟我說說完時用）
  function pop(s) {
    const el = document.createElement('div');
    el.className = 'sticker-pop';
    el.innerHTML = `<div><span>${s.e}</span><b>${window.SHELF.T.sticker}</b></div>`;
    document.body.appendChild(el);
    el.addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 3500);
  }

  // 貼紙本：最新的在前面
  function bookHTML() {
    const l = list();
    if (!l.length) return `<p class="sticker-empty">還沒有貼紙喔！<br>做完「小小考試」、玩完小遊戲、「跟我說」說完一課，都可以得到貼紙 🎁</p>`;
    return `<div class="sticker-count">已經收集 ${l.length} 張貼紙</div><div class="sticker-book">${l.slice().reverse().map(s =>
      `<div class="sticker" title="${s.from}"><span>${s.e}</span><small>${s.from}</small></div>`).join('')}</div>`;
  }

  window.Stickers = { give, pop, bookHTML, count: () => list().length };
})();
