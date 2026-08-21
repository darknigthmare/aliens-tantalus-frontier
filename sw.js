const CACHE = 'atf-v51-shell-4';
const CORE = [
  '/', '/index.html', '/styles.css', '/styles-v50.css', '/sprite-gallery.css', '/hub-level.css', '/runtime-level.css',
  '/manifest.webmanifest', '/src/app.js', '/src/content.js', '/src/content-core-v50.js', '/src/visuals.js', '/src/v50-visuals.js',
  '/src/save.js', '/src/advanced-systems.js', '/src/advanced-systems-core.js', '/src/world-crisis.js',
  '/src/world-crisis-core.js', '/src/campaign-consequences.js', '/src/game-production-runtime.js', '/src/game-production-core.js',
  '/src/game-production-resume.js', '/src/game-production-base.js', '/src/game-final-runtime.js',
  '/src/game-complete.js', '/src/game-complete-core.js', '/src/game-runtime.js', '/src/game-v51-runtime.js',
  '/src/hub-v51-runtime.js', '/src/hub-game.js', '/src/editor.js', '/src/audio.js'
];

self.addEventListener('install', (event) => event.waitUntil(
  caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
));

self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, clone));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => {
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('/index.html');
      return Response.error();
    }))
  );
});
