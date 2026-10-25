/* 页面切换、首页、讲故事 */
(function () {
  const $ = id => document.getElementById(id);
  const { DRAWINGS, CATEGORIES, svgDoc, lineArt } = window.ART;
  const BOOKS = window.BOOKS;
  const screens = ['home', 'paint', 'reader', 'done'];

  function show(name) {
    for (const s of screens) $(s).hidden = s !== name;
  }

  /* ---------------- 路由：#/  #/paint/car  #/read/car-trip/0  #/done/car-trip ---------------- */
  function route() {
    stopSpeaking();
    const [, view, id, page] = location.hash.split('/');
    if (view === 'paint') {
      const d = DRAWINGS.find(d => d.id === id);
      if (!d) return go('#/');
      show('paint');
      window.Painter.open(d);
    } else if (view === 'read') {
      const b = BOOKS.find(b => b.id === id);
      if (!b) return go('#/');
      show('reader');
      openPage(b, Math.min(+page || 0, b.pages.length - 1));
    } else if (view === 'done') {
      show('done');
      Sound.play('yay');
      confetti();
    } else {
      show('home');
      renderHome();
    }
  }
  const go = h => { location.hash = h; };
  window.addEventListener('hashchange', route);

  /* ---------------- 首页 ---------------- */
  const pref = {
    tab: localStorage.getItem('tab') || 'paint',
    cat: localStorage.getItem('cat') || 'car',
  };
  let thumbURLs = [];

  function renderHome() {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === pref.tab));
    thumbURLs.forEach(URL.revokeObjectURL);
    thumbURLs = [];

    if (pref.tab === 'paint') {
      $('cats').hidden = false;
      $('cats').innerHTML = CATEGORIES.map(c =>
        `<button class="cat${c.id === pref.cat ? ' on' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('');
      const list = DRAWINGS.filter(d => d.cat === pref.cat);
      $('grid').innerHTML = list.map(d =>
        `<button class="card" data-go="#/paint/${d.id}"><span class="thumb" id="th-${d.id}">${d.svg ? svgDoc(lineArt(d.svg)) : ''}</span><div class="name">${d.name}</div></button>`).join('');
      // 画过的显示自己的作品
      list.forEach(async d => {
        const saved = await Store.get('paint:' + d.id);
        const el = document.getElementById('th-' + d.id);
        if (saved && saved.thumb && el) {
          const url = URL.createObjectURL(saved.thumb);
          thumbURLs.push(url);
          el.innerHTML = `<img src="${url}" alt="">`;
        }
      });
    } else {
      $('cats').hidden = true;
      $('grid').innerHTML = BOOKS.map(b =>
        `<button class="card" data-go="#/read/${b.id}/0"><span class="thumb story">${b.cover}</span><div class="name">${b.title}</div></button>`).join('');
    }
  }

  $('home').addEventListener('click', e => {
    const tab = e.target.closest('.tab'), cat = e.target.closest('.cat'), card = e.target.closest('[data-go]');
    if (tab) { pref.tab = tab.dataset.tab; localStorage.setItem('tab', pref.tab); Sound.play('pop'); renderHome(); }
    else if (cat) { pref.cat = cat.dataset.cat; localStorage.setItem('cat', pref.cat); Sound.play('pop'); renderHome(); }
    else if (card) { Sound.play('click'); go(card.dataset.go); }
  });

  $('doneBtn').addEventListener('click', async () => {
    await window.Painter.save();
    Sound.play('yay');
    confetti();
    go('#/');
  });

  /* ---------------- 讲故事 ---------------- */
  let book = null, pageIdx = 0, auto = false;

  function openPage(b, i, dir) {
    book = b; pageIdx = i;
    const p = b.pages[i];
    $('art').innerHTML = p.art;
    $('text').textContent = p.text;
    $('dots').innerHTML = b.pages.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('');
    $('prevBtn').disabled = i === 0;
    const pg = $('page');
    pg.classList.remove('turn-next', 'turn-prev');
    if (dir) { void pg.offsetWidth; pg.classList.add(dir > 0 ? 'turn-next' : 'turn-prev'); }
    if (auto) speak();
  }

  function turn(d) {
    if (!book) return;
    const n = pageIdx + d;
    if (n < 0) return;
    if (n >= book.pages.length) { auto = false; $('autoBtn').classList.remove('on'); go(`#/done/${book.id}`); return; }
    Sound.play('click');
    history.replaceState(null, '', `#/read/${book.id}/${n}`);
    stopSpeaking();
    openPage(book, n, d);
  }

  $('prevBtn').addEventListener('click', () => turn(-1));
  $('nextBtn').addEventListener('click', () => turn(1));
  $('homeBtn').addEventListener('click', () => { auto = false; $('autoBtn').classList.remove('on'); go('#/'); });
  $('speakBtn').addEventListener('click', () => speak());
  $('autoBtn').addEventListener('click', () => {
    auto = !auto;
    $('autoBtn').classList.toggle('on', auto);
    $('autoBtn').textContent = auto ? '⏸️' : '▶️';
    if (auto) speak(); else stopSpeaking();
  });
  $('againBtn').addEventListener('click', () => book && go(`#/read/${book.id}/0`));
  $('backBtn').addEventListener('click', () => go('#/'));

  // 左右滑动翻页
  let sx = null;
  $('page').addEventListener('pointerdown', e => { sx = e.clientX; });
  $('page').addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 60) turn(dx < 0 ? 1 : -1);
  });

  // 点画面里的东西
  $('art').addEventListener('click', e => {
    const t = e.target.closest('.tap');
    if (!t) return;
    const anim = t.dataset.anim || 'boing';
    t.classList.remove(anim);
    void t.getBBox?.();
    requestAnimationFrame(() => t.classList.add(anim));
    t.addEventListener('animationend', () => t.classList.remove(anim), { once: true });
    Sound.play(t.dataset.sound || 'pop');
  });

  /* 朗读：用系统自带的中文语音 */
  let voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  } else {
    $('speakBtn').hidden = true;
    $('autoBtn').hidden = true;
  }

  let autoTimer;
  function speak() {
    if (!('speechSynthesis' in window) || !book) return;
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(book.pages[pageIdx].text);
    u.lang = 'zh-CN';
    if (voice) u.voice = voice;
    u.rate = .85;
    u.pitch = 1.15;
    const txt = $('text');
    txt.classList.add('reading');
    u.onend = () => {
      txt.classList.remove('reading');
      if (auto) autoTimer = setTimeout(() => turn(1), 1200);
    };
    speechSynthesis.speak(u);
  }
  function stopSpeaking() {
    clearTimeout(autoTimer);
    $('text').classList.remove('reading');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  /* ---------------- 彩纸 ---------------- */
  function confetti() {
    const box = $('confetti');
    const colors = ['#ff5a5a', '#ffd23f', '#6cc534', '#29b6f6', '#b073f0', '#ff9d1f'];
    box.innerHTML = Array.from({ length: 60 }, () =>
      `<i style="left:${Math.random() * 100}%;background:${colors[Math.random() * colors.length | 0]};animation-delay:${Math.random() * .8}s;animation-duration:${2 + Math.random() * 1.5}s"></i>`).join('');
    setTimeout(() => { box.innerHTML = ''; }, 4000);
  }

  /* ---------------- 安装 & 离线 ---------------- */
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

  route();
})();
