/* 小書包學習本：首頁書架（照學期分區，一本書一張卡）、一本書的課、誰在學習、換畫面、安裝、更新檢查 */
(function () {
  const $ = id => document.getElementById(id);
  const { SUBJECTS, BOOKS, T } = window.SHELF;
  const subjectOf = b => SUBJECTS.find(x => x.id === b.subject) || { name: '', icon: '📘' };

  /* ---------------- 誰在學習：每個小朋友的星星、老師名字分開存 ---------------- */
  const KID_ICONS = ['👦', '👧', '🧒', '👶'];
  const kids = () => { try { return JSON.parse(localStorage.getItem('kids')) || []; } catch (e) { return []; } };
  const saveKids = l => localStorage.setItem('kids', JSON.stringify(l));
  function renderKids() {
    const list = kids(), cur = localStorage.getItem('kid');
    $('kids').innerHTML = (list.length ? `<span class="kids-q">${T.whoLearns}</span>` : '') +
      list.map(k => `<button class="kid${k.id === cur ? ' on' : ''}" data-kid="${k.id}">${k.icon} ${k.name}</button>`).join('') +
      `<button class="kid add" data-addkid>＋ ${list.length ? '' : T.addKid}</button>`;
  }
  $('kids').addEventListener('click', e => {
    const k = e.target.closest('[data-kid]');
    if (e.target.closest('[data-addkid]')) {
      const name = (prompt('小朋友的名字（例如：哥哥、妹妹、小明）') || '').trim().slice(0, 10);
      if (!name) return;
      const list = kids(), kid = { id: 'k' + Date.now().toString(36), name, icon: KID_ICONS[list.length % KID_ICONS.length] };
      list.push(kid);
      saveKids(list);
      localStorage.setItem('kid', kid.id);
    } else if (k) {
      const list = kids(), kid = list.find(x => x.id === k.dataset.kid);
      if (k.dataset.kid === localStorage.getItem('kid')) {
        // 再點一次已經選的：改名字（清空就刪掉）
        const name = prompt('改名字（清空就刪掉這個小朋友）', kid.name);
        if (name === null) return;
        if (name.trim()) kid.name = name.trim().slice(0, 10);
        else if (confirm(`要刪掉「${kid.name}」嗎？（星星紀錄還留著）`)) { list.splice(list.indexOf(kid), 1); localStorage.removeItem('kid'); }
        saveKids(list);
      } else {
        localStorage.setItem('kid', kid.id);
        Voice.say(kid.name);
      }
    } else return;
    Sound.play('pop');
    route();
  });

  /* ---------------- 路由：#/ 書架　#/b/書　#/b/書/課[/tap|learn|quiz|race|feed|tower|frog] ---------------- */
  let current = '';
  function route() {
    const [, view, book, id, page] = location.hash.split('/');
    if (current === 'game') window.MathGame.stop();
    const b = BOOKS.find(x => x.id === book);
    current = view === 'b' && b && id ? 'game' : view === 'b' && b ? 'book' : '';
    $('math').hidden = current !== 'game';
    $('home').hidden = current === 'game';
    if (current === 'game') return window.MathGame.open(id, page, b.id);
    renderKids();
    if (view === 'stickers') {
      // 貼紙本
      current = 'stickers';
      $('crumb').hidden = false;
      $('bookTitle').textContent = '📒 ' + T.stickerBook;
      $('grid').style.cssText = '';
      $('grid').innerHTML = window.Stickers.bookHTML();
      return;
    }
    $('crumb').hidden = current !== 'book';
    if (current === 'book') {
      // 一本書：一課一張卡
      $('bookTitle').textContent = `${b.icon} ${b.grade}${b.term}・${b.title}`;
      $('grid').style.cssText = `--c:${b.color};--cd:${b.dark}`;
      $('grid').innerHTML = window.MathGame.cards('', b.id);
      return;
    }
    // 書架：照學期分區（書檔案加進來的順序），每本書一張卡
    const terms = [...new Set(BOOKS.map(x => x.grade + x.term))];
    let i = 0;
    $('grid').style.cssText = '';
    $('grid').innerHTML = terms.map(t => `<h3 class="tier-title">🎒 ${t}</h3>` + BOOKS.filter(x => x.grade + x.term === t).map(x => {
      const s = subjectOf(x);
      return `<div class="card story shelf-card" role="button" data-go="#/b/${x.id}" data-say="${x.title}" style="--i:${i++};--c:${x.color};--cd:${x.dark}">
        <span class="thumb"><span class="subj" style="--sc:${s.color}">${s.icon} ${s.name}</span><span class="sb-show"><span class="em">${x.icon}</span><b>${x.units.length} 課</b></span></span>
        <div class="name">${x.title}</div></div>`;
    }).join('')).join('');
  }
  window.addEventListener('hashchange', route);

  $('home').addEventListener('click', e => {
    const card = e.target.closest('[data-go]');
    if (card) {
      Sound.play('click');
      if (card.dataset.say) Voice.say(card.dataset.say);
      location.hash = card.dataset.go;
    }
  });

  /* ---------------- 英文速度：🐇 1 倍 → 🐢 0.75 倍 → 🐌 0.5 倍（聽不清楚時放慢，跟著學說） ---------------- */
  const SPEED = { 1: ['🐇', '1 倍', T.speed1], .75: ['🐢', '0.75 倍', T.speed75], .5: ['🐌', '0.5 倍', T.speed50] };
  function showSpeed() {
    const [ic, txt] = SPEED[Voice.speed()];
    document.querySelectorAll('[data-speed]').forEach(b => {
      b.innerHTML = `<span>${ic}</span><b>${txt}</b>`;
      b.classList.toggle('slow', Voice.speed() !== 1);
    });
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-speed]')) return;
    e.stopPropagation();
    const list = Voice.speeds, next = list[(list.indexOf(Voice.speed()) + 1) % list.length];
    Voice.setSpeed(next);
    showSpeed();
    Sound.play('pop');
    // 說一下現在的速度，再用新的速度把題目／教學念一次
    Voice.speak([SPEED[next][2]], () => { if (!$('math').hidden && !$('mathPage').classList.contains('is-view')) $('mathSay').click(); });
  }, true);
  showSpeed();

  /* ---------------- 安裝 & 離線 ---------------- */
  let installEvt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvt = e;
    $('installBtn').hidden = false;
  });
  $('installBtn').addEventListener('click', async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    installEvt = null;
    $('installBtn').hidden = true;
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ---------------- 版本（和小朋友愛畫畫在同一個網站，存的名字要分開） ---------------- */
  $('version').textContent = '版本：' + window.APP_VERSION;
  const last = localStorage.getItem('enVersion');
  if (last && last !== window.APP_VERSION) {
    const t = $('toast');
    t.textContent = '🎉 已更新到最新版（' + window.APP_VERSION + '）';
    t.hidden = false;
    setTimeout(() => { t.hidden = true; }, 5000);
  }
  localStorage.setItem('enVersion', window.APP_VERSION);

  // 加到主畫面的 App 不會自己重新載入：定期問一下有沒有新版，在首頁時才換
  let updateReady = false;
  async function checkUpdate() {
    try {
      const r = await fetch('js/version.js?t=' + Date.now(), { cache: 'no-store' });
      const m = (await r.text()).match(/APP_VERSION = '([^']+)'/);
      if (m && m[1] !== window.APP_VERSION && sessionStorage.getItem('enReloadFor') !== m[1]) {
        sessionStorage.setItem('enReloadFor', m[1]);
        updateReady = true;
        applyUpdate();
      }
    } catch (e) { /* 沒網路就下次再問 */ }
  }
  function applyUpdate() { if (updateReady && current !== 'game') location.reload(); }
  window.addEventListener('hashchange', applyUpdate);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });
  setInterval(checkUpdate, 3 * 60 * 1000);
  setTimeout(checkUpdate, 5000);

  // 開著的時候螢幕不要睡著（念謠念到一半螢幕關掉會停）
  async function awake() {
    if (document.hidden || !('wakeLock' in navigator)) return;
    try { await navigator.wakeLock.request('screen'); } catch (e) { }
  }
  document.addEventListener('pointerdown', awake, { once: true });
  document.addEventListener('visibilitychange', awake);

  route();
})();
