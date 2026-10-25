/* 頁面切換、首頁、講故事 */
(function () {
  const $ = id => document.getElementById(id);
  const { DRAWINGS, CATEGORIES, svgDoc, lineArt } = window.ART;
  const BOOKS = window.BOOKS;
  const SONGS = window.SONGS;
  const screens = ['home', 'paint', 'reader', 'song', 'math', 'done'];

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
    if (current === 'song') stopSong();
    if (current === 'math') window.MathGame.stop();
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
    } else if (view === 'song') {
      const sg = SONGS.find(x => x.id === id);
      if (!sg) return go('#/');
      show('song');
      openSong(sg);
    } else if (view === 'math') {
      show('math');
      window.MathGame.open(id, page === 'learn');
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
    tag: localStorage.getItem('tag') || 'all',
    songKind: localStorage.getItem('songKind') || 'song',
    enCat: localStorage.getItem('enCat') || 'animal',
  };
  if (!CATEGORIES.some(c => c.id === pref.cat)) pref.cat = 'car';
  let thumbURLs = [];

  function card(d, i) {
    const del = d.cat === 'free' ? `<span class="del" data-del="${d.id}" role="button" aria-label="丟掉這張">✕</span>` : '';
    return `<div class="card" role="button" data-go="#/paint/${d.id}" data-say="${d.name}" style="--i:${i}">
      <span class="thumb" id="th-${d.id}">${d.svg ? svgDoc(lineArt(d.svg)) : '<span class="blank">✏️</span>'}</span>
      <div class="name">${d.name}</div>${del}</div>`;
  }

  const STORY_THEMES = { id: 'story-themes', name: '故事主題', icon: '📚', color: '#845ef7', dark: '#6741d9' };
  const BOOK_TAGS = [
    { id: 'all', name: '全部', icon: '📚', color: '#9775fa', dark: '#7048e8' },
    { id: '品德', name: '品德', icon: '💖', color: '#f06595', dark: '#c2255c' },
    { id: '習慣', name: '好習慣', icon: '🪥', color: '#20c997', dark: '#099268' },
    { id: '經典', name: '經典故事', icon: '🏰', color: '#ff922b', dark: '#e8590c' },
    { id: '冒險', name: '冒險', icon: '🚗', color: '#4dabf7', dark: '#1c7ed6' },
    { id: '節日', name: '節日', icon: '🎃', color: '#7950f2', dark: '#5f3dc4' },
  ];

  const SONG_KINDS = [
    { id: 'song', name: '兒歌', icon: '🎵', color: '#ff8787', dark: '#e03131' },
    { id: 'en-song', name: '英文兒歌', icon: '🔤', color: '#4dabf7', dark: '#1c7ed6' },
    { id: 'poem', name: '唐詩', icon: '📜', color: '#c0a37a', dark: '#8c6d46', sep: true },
    { id: 'sanzi', name: '三字經', icon: '📖', color: '#e8a33c', dark: '#b8741a' },
    { id: 'dizi', name: '弟子規', icon: '🎎', color: '#74c0fc', dark: '#1c7ed6' },
  ];

  function renderHome() {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === pref.tab));
    thumbURLs.forEach(URL.revokeObjectURL);
    thumbURLs = [];

    if (pref.tab === 'paint') {
      $('cats').hidden = false;
      // 一排主分類；「故事主題」打開時才多一排小按鈕，平常不佔位置
      const inStory = pref.cat.startsWith('story-');
      const chip = (c, on) => `<button class="cat${on ? ' on' : ''}" data-cat="${c.id}" style="--c:${c.color};--cd:${c.dark}"><span class="cat-icon">${c.icon}</span>${c.name}</button>`;
      const themes = CATEGORIES.filter(c => c.group === 'story');
      $('cats').innerHTML = `<div class="cat-row main-row">${CATEGORIES.filter(c => !c.group).map(c => chip(c, c.id === pref.cat)).join('')}${chip(STORY_THEMES, inStory)}</div>
        ${inStory ? `<div class="cat-row sub-row">${themes.map(c => chip(c, c.id === pref.cat)).join('')}</div>` : ''}`;
      const cat = CATEGORIES.find(c => c.id === pref.cat);
      const list = pref.cat === 'free'
        ? Blanks.list().slice().reverse().map(Blanks.drawing)
        : DRAWINGS.filter(d => d.cat === pref.cat || (d.also || []).includes(pref.cat));
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
          // 畫完的有星星；畫到一半的顯示鉛筆和進度條
          const pct = saved.cover && typeof saved.cover === 'object' ? saved.cover.pct : 100;
          el.innerHTML = `<img src="${url}" alt="">` + (pct >= 100
            ? '<span class="badge">⭐</span>'
            : `<span class="badge half">✏️ 畫到一半</span><span class="mini-bar"><i style="width:${pct}%"></i></span>`);
        }
      });
    } else if (pref.tab === 'song') {
      if (!SONG_KINDS.some(k => k.id === pref.songKind)) pref.songKind = 'song';
      $('cats').hidden = false;
      $('cats').innerHTML = `<div class="cat-row main-row">${SONG_KINDS.map(k =>
        `${k.sep ? '<span class="chip-sep"></span>' : ''}<button class="cat${k.id === pref.songKind ? ' on' : ''}" data-kind="${k.id}" style="--c:${k.color};--cd:${k.dark}"><span class="cat-icon">${k.icon}</span>${k.name}</button>`).join('')}</div>`;
      const kind = SONG_KINDS.find(k => k.id === pref.songKind) || SONG_KINDS[0];
      $('grid').style.cssText = `--c:${kind.color};--cd:${kind.dark}`;
      $('grid').innerHTML = SONGS.filter(x => x.kind === kind.id).map((x, i) =>
        `<div class="card story" role="button" data-go="#/song/${x.id}" data-say="${x.title}" style="--i:${i}"><span class="thumb">${x.art}${x.author ? `<span class="tag">${x.author}</span>` : ''}</span><div class="name">${kind.icon} ${x.title}</div></div>`).join('');
    } else if (pref.tab === 'english') {
      const cats = CATEGORIES.filter(c => c.en && c.id !== 'free');
      if (!cats.some(c => c.id === pref.enCat)) pref.enCat = cats[0].id;
      $('cats').hidden = false;
      $('cats').innerHTML = `<div class="cat-row main-row">${cats.map(c =>
        `<button class="cat${c.id === pref.enCat ? ' on' : ''}" data-encat="${c.id}" style="--c:${c.color};--cd:${c.dark}"><span class="cat-icon">${c.icon}</span>${c.en}</button>`).join('')}</div>`;
      const cat = cats.find(c => c.id === pref.enCat);
      $('grid').style.cssText = `--c:${cat.color};--cd:${cat.dark}`;
      $('grid').innerHTML = DRAWINGS.filter(d => d.en && (d.cat === cat.id || (d.also || []).includes(cat.id))).map((d, i) =>
        `<div class="card word" role="button" data-word="${d.id}" style="--i:${i}"><span class="thumb">${svgDoc(d.svg)}
          <span class="go-paint" data-go="#/paint/${d.id}" role="button" aria-label="去畫畫">🖍️</span></span>
          <div class="name"><b>${d.en}</b><small>${d.name}</small></div></div>`).join('');
    } else if (pref.tab === 'math') {
      $('cats').hidden = true;
      $('grid').style.cssText = '--c:#ff922b;--cd:#e8590c';
      // 練習題關卡＋九九乘法歌（一到九）
      $('grid').innerHTML = window.MathGame.cards(SONGS.filter(x => x.kind === 'times').map((x, i) =>
        `<div class="card story" role="button" data-go="#/song/${x.id}" data-say="${x.title}" style="--i:${i + 4};--c:#ff922b;--cd:#e8590c"><span class="thumb">${x.art}</span><div class="name">✖️ ${x.title}</div></div>`).join(''));
    } else {
      $('cats').hidden = false;
      $('cats').innerHTML = `<div class="cat-row main-row">${BOOK_TAGS.map(t =>
        `<button class="cat${t.id === pref.tag ? ' on' : ''}" data-tag="${t.id}" style="--c:${t.color};--cd:${t.dark}"><span class="cat-icon">${t.icon}</span>${t.name}</button>`).join('')}</div>`;
      const tag = BOOK_TAGS.find(t => t.id === pref.tag) || BOOK_TAGS[0];
      $('grid').style.cssText = `--c:${tag.color};--cd:${tag.dark}`;
      $('grid').innerHTML = BOOKS.filter(b => tag.id === 'all' || b.tag === tag.id).map((b, i) =>
        `<div class="card story" role="button" data-go="#/read/${b.id}/0" style="--i:${i}"><span class="thumb">${b.cover}${tag.id === 'all' && b.tag ? `<span class="tag">${(BOOK_TAGS.find(t => t.id === b.tag) || {}).name || b.tag}</span>` : ''}</span><div class="name">📖 ${b.title}</div></div>`).join('');
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
    } else if (cat && cat.dataset.encat) {
      pref.enCat = cat.dataset.encat;
      localStorage.setItem('enCat', pref.enCat);
      Sound.play('pop');
      const c = CATEGORIES.find(x => x.id === pref.enCat);
      Voice.speak([c.en, c.name]);
      renderHome();
    } else if (e.target.closest('[data-word]') && !e.target.closest('.go-paint')) {
      // 單字卡：念英文、中文，再念一次英文
      const w = e.target.closest('[data-word]'), d = DRAWINGS.find(x => x.id === w.dataset.word);
      Sound.play('pop');
      w.classList.remove('said');
      void w.offsetWidth;
      w.classList.add('said');
      Voice.speak([d.en, d.name, d.en]);
    } else if (cat && cat.dataset.kind) {
      pref.songKind = cat.dataset.kind;
      localStorage.setItem('songKind', pref.songKind);
      Sound.play('pop');
      Voice.say(SONG_KINDS.find(k => k.id === pref.songKind).name);
      renderHome();
    } else if (cat && cat.dataset.tag) {
      pref.tag = cat.dataset.tag;
      localStorage.setItem('tag', pref.tag);
      Sound.play('pop');
      Voice.say(BOOK_TAGS.find(t => t.id === pref.tag).name);
      renderHome();
    } else if (cat) {
      let id = cat.dataset.cat;
      if (id === STORY_THEMES.id) {
        // 打開故事主題：回到上次看的那個故事
        const last = localStorage.getItem('storyCat');
        id = CATEGORIES.some(c => c.id === last) ? last : CATEGORIES.find(c => c.group === 'story').id;
        Voice.say(STORY_THEMES.name);
      } else {
        Voice.say(CATEGORIES.find(c => c.id === id).name);
      }
      if (id.startsWith('story-')) localStorage.setItem('storyCat', id);
      pref.cat = id;
      localStorage.setItem('cat', pref.cat);
      Sound.play('pop');
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
      if (card.dataset.go.startsWith('#/read')) unlockSpeech();
      else Voice.say(card.dataset.say);
      go(card.dataset.go);
    }
  });

  // ✔：自動判斷畫完了沒，畫完才放彩紙；沒畫完就先存起來，下次接著畫
  $('doneBtn').addEventListener('click', async () => {
    const { cover, done } = await window.Painter.finish();
    if (done) {
      Sound.play('yay');
      // 畫完順便教英文：「小汽車的英文是 car，跟我念，car」
      const d = window.Painter.current();
      Voice.speak([cover === null ? '畫好了，好棒！' : '全部塗好了，好棒！',
        ...(d && d.en ? [d.name, '的英文是', d.en, '跟我念', d.en] : [])]);
      confetti();
    } else {
      Sound.play('pop');
      Voice.say('先存起來囉，還有地方沒塗完，下次再畫！');
    }
    go('#/');
  });

  /* ---------------- 講故事 ---------------- */
  let book = null, pageIdx = 0, auto = false, sayTitle = false;

  // 換頁時角色一個一個彈出來；彈完拿掉 enter，點角色的動畫才不會被蓋掉
  function enter(el) {
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
    clearTimeout(el._enterT);
    el._enterT = setTimeout(() => el.classList.remove('enter'), 1300);
  }

  function openPage(b, i, dir) {
    book = b; pageIdx = i;
    const p = b.pages[i];
    $('art').innerHTML = p.art;
    enter($('art'));
    $('text').textContent = p.text;
    $('bookTitle').textContent = b.title;
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
    $('autoBtn').innerHTML = on
      ? '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="9" height="28" rx="3" fill="currentColor"/><rect x="27" y="10" width="9" height="28" rx="3" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 48 48"><path d="M15 10 L38 24 L15 38 Z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>';
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
    if (!('speechSynthesis' in window)) return;
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
    const list = (sayTitle && pageIdx === 0 ? [book.title] : []).concat(book.pages[pageIdx].text);
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
    // 保險：就算聲音沒反應（沒聲音、被系統擋住），時間到也會自動翻頁
    safetyTimer = setTimeout(done, list.join('').length * 400 + 3000);
    Voice.speak(list, done);
  }
  function stopSpeaking() {
    speakId++;
    clearTimeout(autoTimer);
    clearTimeout(safetyTimer);
    $('text').classList.remove('reading');
    Voice.cancel();
  }

  /* ---------------- 兒歌唐詩 ---------------- */
  let song = null, songToken = 0;
  const PLAY_ICON = '<svg viewBox="0 0 48 48"><path d="M15 10 L38 24 L15 38 Z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>';
  const STOP_ICON = '<svg viewBox="0 0 48 48"><rect x="13" y="13" width="22" height="22" rx="4" fill="currentColor"/></svg>';
  function setPlaying(on) {
    $('songPlay').innerHTML = on ? STOP_ICON : PLAY_ICON;
    $('songPlay').classList.toggle('on', on);
  }
  function highlight(i) {
    [...$('lyrics').children].forEach((li, k) => li.classList.toggle('on', k === i));
    // 唱到新的一句，畫面裡的角色跟著跳一下
    if (i >= 0) {
      const art = $('songArt');
      art.classList.remove('beat', 'enter');
      void art.offsetWidth;
      art.classList.add('beat');
      setTimeout(() => art.classList.remove('beat'), 450);
    }
  }
  function openSong(sg) {
    song = sg;
    $('songTitle').textContent = sg.title;
    $('songSub').textContent = { poem: `唐・${sg.author}`, sanzi: `宋・${sg.author}`, dizi: `清・${sg.author}`, times: '九九乘法歌', 'en-song': 'English nursery rhyme・英文兒歌' }[sg.kind]
      || (sg.original ? '原創兒歌' : '傳統兒歌');
    $('songArt').innerHTML = sg.art;
    enter($('songArt'));
    $('lyrics').className = 'lyrics ' + sg.kind;
    $('lyrics').innerHTML = sg.lines.map((l, i) => `<li>${l}${sg.sub ? `<small>${sg.sub[i]}</small>` : ''}</li>`).join('');
    setPlaying(false);
    // 點進來就開始：兒歌彈旋律，唐詩念出來
    const my = songToken;
    setTimeout(() => { if (my === songToken && current === 'song' && song === sg) playSong(); }, 600);
  }
  function stopSong() {
    songToken++;
    Music.stopMelody();
    Voice.cancel();
    highlight(-1);
    setPlaying(false);
  }
  function playSong() {
    stopSong();
    setPlaying(true);
    const my = songToken;
    if (song.notes) {
      Music.playMelody(song.notes, song.bpm, i => my === songToken && highlight(i), () => {
        if (my === songToken) { highlight(-1); setPlaying(false); }
      });
    } else {
      readLines(my, sg_title(song));
    }
  }
  const sg_title = sg => !sg.notes;
  // 一句一句念，念到哪句就亮哪句；唐詩先念題目和作者
  function readLines(my, withTitle) {
    let i = -1;
    const next = () => {
      if (my !== songToken) return;
      i++;
      if (i >= song.lines.length) { highlight(-1); setPlaying(false); return; }
      highlight(i);
      Voice.speak([song.lines[i]], () => setTimeout(next, 400));
    };
    Voice.speak(withTitle ? [song.title, song.author].filter(Boolean) : [], () => setTimeout(next, 300));
  }
  function songStep(d) {
    const list = SONGS.filter(x => x.kind === song.kind);
    const k = (list.indexOf(song) + d + list.length) % list.length;
    Sound.play('click');
    go(`#/song/${list[k].id}`);
  }
  $('songPlay').addEventListener('click', () => {
    if ($('songPlay').classList.contains('on')) stopSong(); else playSong();
  });
  $('songRead').addEventListener('click', () => {
    stopSong();
    setPlaying(true);
    readLines(songToken, !song.notes);
  });
  $('songPrev').addEventListener('click', () => songStep(-1));
  $('songNext').addEventListener('click', () => songStep(1));
  $('songHome').addEventListener('click', () => go('#/'));
  $('songArt').addEventListener('click', e => {
    const t = e.target.closest('.tap');
    if (!t) return;
    const anim = t.dataset.anim || 'boing';
    t.classList.remove(anim);
    requestAnimationFrame(() => t.classList.add(anim));
    t.addEventListener('animationend', () => t.classList.remove(anim), { once: true });
    Sound.play(t.dataset.sound || 'pop');
  });

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

  /* ---------------- 版本：讓爸媽知道有沒有更新 ---------------- */
  $('version').textContent = '版本：' + window.APP_VERSION;
  const lastVersion = localStorage.getItem('version');
  if (lastVersion && lastVersion !== window.APP_VERSION) {
    const t = $('toast');
    t.textContent = '🎉 已更新到最新版（' + window.APP_VERSION + '）';
    t.hidden = false;
    setTimeout(() => { t.hidden = true; }, 5000);
  }
  localStorage.setItem('version', window.APP_VERSION);

  // 主畫面上的 App 切到背景再回來不會重新載入，所以自己定期問一下有沒有新版
  let updateReady = false;
  async function checkUpdate() {
    try {
      const r = await fetch('js/version.js?t=' + Date.now(), { cache: 'no-store' });
      const m = (await r.text()).match(/APP_VERSION = '([^']+)'/);
      if (m && m[1] !== window.APP_VERSION && sessionStorage.getItem('reloadFor') !== m[1]) {
        sessionStorage.setItem('reloadFor', m[1]);   // 同一個新版只重新載入一次，避免一直重整
        updateReady = true;
        applyUpdate();
      }
    } catch (e) { /* 沒網路就下次再問 */ }
  }
  // 只在首頁換新版，不打斷畫畫和聽故事（畫的作品都已經自動存好了）
  function applyUpdate() {
    if (updateReady && (current === '' || current === undefined || current === 'done')) location.reload();
  }
  window.addEventListener('hashchange', applyUpdate);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });
  setInterval(checkUpdate, 3 * 60 * 1000);
  setTimeout(checkUpdate, 5000);

  route();
})();
