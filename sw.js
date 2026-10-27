// 離線緩存：有網絡時先抓最新版（順便更新緩存），沒網絡或太慢才用緩存。
// 所以改完推上 GitHub，下次打開 App 就是新版，不用手動改版本號。
const CACHE = 'kids-coloring';
const FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/version.js',
  'js/words.js',
  'js/art.js',
  'js/pack-vehicles.js',
  'js/pack-animals.js',
  'js/pack-dino-sea.js',
  'js/pack-places.js',
  'js/pack-food.js',
  'js/pack-nature.js',
  'js/pack-heroes.js',
  'js/pack-tops.js',
  'js/pack-ultra.js',
  'js/pack-ultra2.js',
  'js/books.js',
  'js/stories-manners.js',
  'js/stories-habits.js',
  'js/stories-classics.js',
  'js/stories-adventure.js',
  'js/stories-festivals.js',
  'js/songs.js',
  'js/paint.js',
  'js/math.js',
  'js/zhuyin.js',
  'js/app.js',
  'manifest.webmanifest',
  'media/awake.mp4',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable.png',
];
const TIMEOUT = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const host = new URL(req.url).hostname;
  // 可愛字體：第一次下載後存起來，離線也能用
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  // 語音和唱歌的 mp3 檔名就是內容的指紋，內容不會變：有存就直接用，不用等網路。
  // 播放器跳到歌曲中間時會要「其中一段」（Range）：從存好的整個檔案切那一段給它，不然跳不過去
  if (/\/audio\/.+\.mp3$/.test(new URL(req.url).pathname)) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const key = new Request(req.url);
      let hit = await c.match(key);
      if (!hit) {
        const res = await fetch(key);
        if (res.status !== 200) return res;
        await c.put(key, res.clone());
        hit = res;
      }
      const range = req.headers.get('range');
      if (!range) return hit;
      const buf = await hit.arrayBuffer();
      const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
      const size = buf.byteLength;
      let start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
      if (!m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }   // bytes=-500：最後 500 個 byte
      return new Response(buf.slice(start, end + 1), {
        status: 206,
        headers: { 'Content-Type': 'audio/mpeg', 'Content-Range': `bytes ${start}-${end}/${size}`,
                   'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
      });
    })());
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fresh = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.status === 200) cache.put(req, res.clone());   // 206（只有一段）不能存
      return res;
    });
    const slow = new Promise(r => setTimeout(r, TIMEOUT));
    try {
      const res = await Promise.race([fresh, slow]);
      if (res) return res;
    } catch (err) { /* 沒網絡 */ }
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || fresh;
  })());
});
