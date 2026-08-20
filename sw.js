const CACHE = 'atf-v50-shell-1';
const CORE = ['/', '/index.html', '/styles.css', '/sprite-gallery.css', '/hub-level.css', '/runtime-level.css', '/manifest.webmanifest', '/src/app.js', '/src/content.js', '/src/visuals.js', '/src/save.js', '/src/game.js', '/src/hub-game.js', '/src/editor.js', '/src/audio.js'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then((response) => { const clone = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, clone)); return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html'))));
});
