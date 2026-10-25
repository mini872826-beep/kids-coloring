/* 頁面切換、首頁、講故事 */
(function () {
  const $ = id => document.getElementById(id);
  const { DRAWINGS, CATEGORIES, svgDoc, lineArt } = window.ART;
  const BOOKS = window.BOOKS;
  const screens = ['home', 'paint', 'reader', 'done'];

  function show(name) {
    for (const s of screens) $(s).hidden = s !== name;
  }

  /* ---------------- 自由畫：可以一直新增白紙 ---------------- */
  const Blanks = {
    list() {
      try {
        const l = JSON.parse(localStorage.getItem('blanks'));
        if (Array.isArray(l)) return l;
      } catch (e) { }
      return [{ id: 'blank', n: 1 }];   // 第一張沿用以前的白紙
    },
    save(l) { localStorage.setItem('blanks', JSON.stringify(l)); },
    add() {
      const l = Blanks.list();
      const n = l.reduce((m, b) => Math.max(m, b.n), 0) + 1;
      const b = { id: 'blank-' + Date.now().toString(36), n };
      l.push(b);
      Blanks.save(l);
      return b;
    },
    remove(id) {
      Blanks.save(Blanks.list().filter(b => b.id !== id));
      Store.del('paint:' + id);
    },
    drawing: b => ({ id: b.id, cat: 'free', name: `白紙 ${b.n}`, svg: '' }),
  };

  function findDrawing(id) {
    const b = Blanks.list().find(b => b.id === id);
    return b ? Blanks.drawing(b) : DRAWINGS.find(d => d.id === id);
  }

  /* ---------------- 路由：#/  #/paint/car  #/read/car-trip/0  #/done/car-trip ---------------- */
  let current = '';
  function route() {
    const [, view, id, page] = location.hash.split('/');
    if (current === 'read') stopSpeaking();
    current = view;
    if (view === 'paint') {
      const d = findDrawing(id);
      if (!d) return go('#/');
      show('paint');
      window.Painter.open(d);
    } else if (view === 'read') {
      const b = BOOKS.find(b => b.id === id);
      if (!b) return go('#/');
      show('reader');
      setAuto(true);   // 一打開就自動朗讀、自動翻頁
      sayTitle = !+page;
      openPage(b, Math.min(+page || 0, b.pages.length - 1));
    } else if (view === 'done') {
      show('done');
      Sound.play('yay');
      Voice.say('太棒啦，讀完啦！');
      confetti();
    } else {
      show('home');
      renderHome();
    }
  }
  const go = h => { location.hash = h; };
  window.addEventListener('hashchange', route);

  /* ---------------- 首頁 ---------------- */
  const pref = {
    tab: localStorage.getItem('tab') || 'paint',
    cat: localStorage.getItem('cat') || 'car',
  };
  if (!CATEGORIES.some(c => c.id === pref.cat)) pref.cat = 'car';
  let thumbURLs = [];

  function card(d, i) {
    const del = d.cat === 'free' ? `<span class="del" data-del="${d.id}" role="button" aria-label="丟掉這張">✕</span>` : '';
    return `<div class="card" role="button" data-go="#/paint/${d.id}" data-say="${d.name}" style="--i:${i}">
      <span class="thumb" id="th-${d.id}">${d.svg ? svgDoc(lineArt(d.svg)) : '<span class="blank">✏️</span>'}</span>
      <div class="name">${d.name}</div>${del}</div>`;
  }

  function renderHome() {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === pref.tab));
    thumbURLs.forEach(URL.revokeObjectURL);
    thumbURLs = [];

    if (pref.tab === 'paint') {
      $('cats').hidden = false;
      $('cats').innerHTML = CATEGORIES.map(c =>
        `<button class="cat${c.id === pref.cat ? ' on' : ''}" data-cat="${c.id}" style="--c:${c.color};--cd:${c.dark}"><span class="cat-icon">${c.icon}</span>${c.name}</button>`).join('');
      const cat = CATEGORIES.find(c => c.id === pref.cat);
      const list = pref.cat === 'free'
        ? Blanks.list().slice().reverse().map(Blanks.drawing)
        : DRAWINGS.filter(d => d.cat === pref.cat);
      $('grid').style.cssText = `--c:${cat.color};--cd:${cat.dark}`;
      const add = pref.cat === 'free'
        ? `<div class="card add" role="button" data-add="1" style="--i:0"><span class="thumb"><span class="blank">➕</span></span><div class="name">新增白紙</div></div>`
        : '';
      $('grid').innerHTML = add + list.map((d, i) => card(d, i + (add ? 1 : 0))).join('');
      // 畫過的顯示自己的作品，加一顆星星
      list.forEach(async d => {
        const saved = await Store.get('paint:' + d.id);
        const el = document.getElementById('th-' + d.id);
        if (saved && saved.thumb && el) {
          const url = URL.createObjectURL(saved.thumb);
          thumbURLs.push(url);
          el.innerHTML = `<img src="${url}" alt=""><span class="badge">⭐</span>`;
        }
      });
    } else {
      $('cats').hidden = true;
      $('grid').style.cssText = '--c:#9775fa;--cd:#7048e8';
      $('grid').innerHTML = BOOKS.map((b, i) =>
        `<div class="card story" role="button" data-go="#/read/${b.id}/0" style="--i:${i}"><span class="thumb">${b.cover}${b.tag ? `<span class="tag">${b.tag}</span>` : ''}</span><div class="name">📖 ${b.title}</div></div>`).join('');
    }
  }

  $('home').addEventListener('click', e => {
    const tab = e.target.closest('.tab'), cat = e.target.closest('.cat');
    const del = e.target.closest('[data-del]'), add = e.target.closest('[data-add]'), card = e.target.closest('[data-go]');
    if (tab) {
      pref.tab = tab.dataset.tab;
      localStorage.setItem('tab', pref.tab);
      Sound.play('pop');
      Voice.say(tab.textContent.replace(/[^\u4e00-\u9fff]/g, ''));
      renderHome();
    } else if (cat) {
      pref.cat = cat.dataset.cat;
      localStorage.setItem('cat', pref.cat);
      Sound.play('pop');
      Voice.say(CATEGORIES.find(c => c.id === pref.cat).name);
      renderHome();
    } else if (del) {
      const d = findDrawing(del.dataset.del);
      if (d && confirm(`要把「${d.name}」丟掉嗎？`)) { Blanks.remove(d.id); renderHome(); }
    } else if (add) {
      const b = Blanks.add();
      Sound.play('twinkle');
      Voice.say('新的白紙');
      go(`#/paint/${b.id}`);
    } else if (card) {
      Sound.play('click');
      if (card.classList.contains('story')) unlockSpeech();
      else Voice.say(card.dataset.say);
      go(card.dataset.go);
    }
  });

  $('doneBtn').addEventListener('click', async () => {
    await window.Painter.save();
    Sound.play('yay');
    Voice.say('畫好了，好棒！');
    confetti();
    go('#/');
  });

  /* ---------------- 講故事 ---------------- */
  let book = null, pageIdx = 0, auto = false, sayTitle = false;

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
    if (n >= book.pages.length) { setAuto(false); go(`#/done/${book.id}`); return; }
    Sound.play('click');
    history.replaceState(null, '', `#/read/${book.id}/${n}`);
    stopSpeaking();
    openPage(book, n, d);
  }

  $('prevBtn').addEventListener('click', () => turn(-1));
  $('nextBtn').addEventListener('click', () => turn(1));
  $('homeBtn').addEventListener('click', () => { setAuto(false); go('#/'); });
  $('speakBtn').addEventListener('click', () => speak());
  $('autoBtn').addEventListener('click', () => {
    setAuto(!auto);
    if (auto) speak(); else stopSpeaking();
  });
  $('againBtn').addEventListener('click', () => { unlockSpeech(); book && go(`#/read/${book.id}/0`); });
  $('backBtn').addEventListener('click', () => go('#/'));

  function setAuto(on) {
    auto = on;
    $('autoBtn').classList.toggle('on', on);
    $('autoBtn').textContent = on ? '⏸️' : '▶️';
  }

  // 左右滑動翻頁
  let sx = null;
  $('page').addEventListener('pointerdown', e => { sx = e.clientX; });
  $('page').addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 60) turn(dx < 0 ? 1 : -1);
  });

  // 點畫面裡的東西
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

  /* 朗讀：用系統自帶的中文語音 */
  if (!Voice.ok) $('speakBtn').hidden = true;

  // iPad 規定第一次發聲必須在手指點擊時，所以點書本那一下先"解鎖"語音
  function unlockSpeech() {
    if (!Voice.ok) return;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }

  let autoTimer, safetyTimer, speakId = 0;
  function speak() {
    if (!book) return;
    stopSpeaking();
    const id = ++speakId;
    // 第一頁先念書名
    const text = (sayTitle && pageIdx === 0 ? book.title + '。' : '') + book.pages[pageIdx].text;
    sayTitle = false;
    const txt = $('text');
    let finished = false;
    const done = () => {
      if (finished || id !== speakId) return;
      finished = true;
      clearTimeout(safetyTimer);
      txt.classList.remove('reading');
      if (auto) autoTimer = setTimeout(() => turn(1), 1500);
    };
    txt.classList.add('reading');
    // 保險：就算語音沒反應（沒聲音、被系統擋住），時間到也會自動翻頁
    safetyTimer = setTimeout(done, text.length * 380 + 2500);
    if (!Voice.ok) return;
    const u = Voice.utter(text);
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
  }
  function stopSpeaking() {
    speakId++;
    clearTimeout(autoTimer);
    clearTimeout(safetyTimer);
    $('text').classList.remove('reading');
    Voice.cancel();
  }

  /* ---------------- 彩紙 ---------------- */
  function confetti() {
    const box = $('confetti');
    const colors = ['#ff5a5a', '#ffd23f', '#6cc534', '#29b6f6', '#b073f0', '#ff9d1f'];
    box.innerHTML = Array.from({ length: 60 }, () =>
      `<i style="left:${Math.random() * 100}%;background:${colors[Math.random() * colors.length | 0]};animation-delay:${Math.random() * .8}s;animation-duration:${2 + Math.random() * 1.5}s"></i>`).join('');
    setTimeout(() => { box.innerHTML = ''; }, 4000);
  }

  /* ---------------- 背景音樂開關 ---------------- */
  function showMusic() {
    const on = Music.enabled();
    $('musicBtn').textContent = on ? '🎵' : '🔇';
    $('musicBtn').classList.toggle('on', on);
  }
  $('musicBtn').addEventListener('click', () => {
    const on = Music.toggle();
    showMusic();
    Voice.say(on ? '音樂開' : '音樂關');
  });
  showMusic();

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

  route();
})();
