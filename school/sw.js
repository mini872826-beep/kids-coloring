// 大班學英文的離線緩存：有網路時先抓最新版，沒網路才用緩存。
// 錄音檔放在上一層的 audio/（和小朋友愛畫畫共用），檔名就是內容的指紋，存過就直接用。
const CACHE = 'school-english';
const FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/version.js',
  'js/voice.js',
  'js/pics.js',
  'js/game.js',
  'js/lessons.js',
  'js/school.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  '../audio/index.json',
];
const TIMEOUT = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // 同一個網站上還有小朋友愛畫畫的緩存，不能刪別人的
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if (/\/audio\/.+\.mp3$/.test(url.pathname)) {
    e.respondWith((async () => {
      const key = new Request(req.url);
      // 小朋友愛畫畫存過的也可以拿來用（caches.match 會找所有的緩存）
      let hit = await caches.match(key);
      if (!hit) {
        const res = await fetch(key);
        if (res.status !== 200) return res;
        await (await caches.open(CACHE)).put(key, res.clone());
        hit = res;
      }
      return hit;
    })());
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fresh = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.status === 200) cache.put(req, res.clone());
      return res;
    });
    const slow = new Promise(r => setTimeout(r, TIMEOUT));
    try {
      const res = await Promise.race([fresh, slow]);
      if (res) return res;
    } catch (err) { /* 沒網路 */ }
    const hit = await cache.match(req, { ignoreSearch: true });
    return hit || fresh;
  })());
});
