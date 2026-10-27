/* 大班學英文：首頁（一課一張卡）、換畫面、安裝、更新檢查 */
(function () {
  const $ = id => document.getElementById(id);

  /* ---------------- 路由：#/  #/school/street  #/school/street/tap|learn|quiz|race|feed|tower|frog ---------------- */
  let current = '';
  function route() {
    const [, view, id, page] = location.hash.split('/');
    if (current === 'school') window.MathGame.stop();
    current = view || '';
    if (view === 'school') {
      $('home').hidden = true;
      $('math').hidden = false;
      window.MathGame.open(id, page, 'school');
    } else {
      $('math').hidden = true;
      $('home').hidden = false;
      $('grid').style.cssText = '--c:#fcc419;--cd:#e67700';
      $('grid').innerHTML = window.MathGame.cards('', 'school');
    }
  }
  window.addEventListener('hashchange', route);

  $('home').addEventListener('click', e => {
    const card = e.target.closest('[data-go]');
    if (card) {
      Sound.play('click');
      if (card.dataset.say) Voice.say(card.dataset.say);
      location.hash = card.dataset.go;
      return;
    }
    if (e.target.closest('#logo')) {
      Sound.play('pop');
      Voice.speak(['My School Book', '幼稚園課本']);
    }
  });

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
  function applyUpdate() { if (updateReady && !current) location.reload(); }
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
