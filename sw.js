const CACHE = 'atf-v54-runtime-2';
const CORE = [
  '/', '/index.html', '/styles.css', '/styles-v50.css', '/sprite-gallery.css', '/hub-level.css', '/runtime-level.css',
  '/manifest.webmanifest', '/src/app.js', '/src/content.js', '/src/content-core-v50.js', '/src/visuals.js', '/src/v50-visuals.js',
  '/src/save.js', '/src/advanced-systems.js', '/src/advanced-systems-core.js', '/src/world-crisis.js',
  '/src/world-crisis-core.js', '/src/campaign-consequences.js', '/src/game-production-runtime.js', '/src/game-production-core.js',
  '/src/game-production-resume.js', '/src/game-production-base.js', '/src/game-final-runtime.js',
  '/src/game-complete.js', '/src/game-complete-core.js', '/src/game-runtime.js', '/src/game-v51-runtime.js',
  '/src/game-v52-runtime.js', '/src/game-v52-level-runtime.js', '/src/sprite-animation-runtime.js', '/src/enemy-visual-runtime-v53.js', '/src/mission-levels-v52.js',
  '/src/hub-v51-runtime.js', '/src/hub-v52-runtime.js', '/src/hub-game.js', '/src/hub-profiles-v53.js', '/src/editor.js', '/src/audio.js',
  '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png',
  '/assets/openai/sprites/normalized/enemies/xenomorph-drone-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/enemies/xenomorph-drone-combat-sheet.png',
  '/assets/openai/sprites/normalized/enemies/xenomorph-warrior-combat-sheet.png',
  '/assets/openai/sprites/normalized/enemies/xenomorph-queen-combat-sheet.png',
  '/assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png',
  '/assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png',
  '/assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png',
  '/assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png',
  '/assets/openai/sprites/normalized/enemies/facehugger-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/enemies/neomorph-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/enemies/working-joe-combat-sheet.png',
  '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png',
  '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png',
  '/assets/openai/sprites/normalized/npcs/mara-vega-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/tamsin-velez-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/idris-kwan-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/bishop-9-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/rook-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/sanaa-doyle-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/maksim-orlov-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/inez-harlow-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/david-8r-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/jun-park-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/asha-mbaye-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/pablo-reyes-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/echo-a-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/leila-s-rensen-locomotion-sheet.png',
  '/assets/openai/sprites/normalized/npcs/cal-mercer-locomotion-sheet.png',
  '/assets/openai/metroidvania/tantalus-mission-far.png',
  '/assets/openai/metroidvania/tantalus-mission-mid.png',
  '/assets/openai/metroidvania/tantalus-mission-foreground.png',
  '/assets/openai/metroidvania/props/maintenance-pipe.png',
  '/assets/openai/metroidvania/props/ceiling-cables.png',
  '/assets/openai/metroidvania/props/foreground-pipes.png',
  '/assets/openai/human-factions-animation-sheet.png',
  '/assets/openai/synthetic-android-animation-sheet.png',
  '/assets/openai/pathogen-fauna-animation-sheet.png',
  '/assets/openai/neuro-xeno-animation-sheet.png',
  '/assets/openai/combat-vfx-animation-sheet.png',
  '/assets/openai/metroidvania/colony-multiroute-far.png',
  '/assets/openai/metroidvania/colony-multiroute-mid.png',
  '/assets/openai/metroidvania/colony-multiroute-foreground.png',
  '/assets/openai/metroidvania/planet-exterior-far.png',
  '/assets/openai/metroidvania/planet-exterior-mid.png',
  '/assets/openai/metroidvania/planet-exterior-foreground.png'
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
