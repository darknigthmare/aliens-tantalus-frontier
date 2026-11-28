function offlineDuelCacheNameV223() { return `${CACHE}-duels`; }

function offlineDuelIndexV224() {
  return new Request(new URL('/__atf-offline-duels-v224.json', self.location.origin));
}

async function readOfflineDuelIndexV225(cacheName) {
  const response = await caches.match(offlineDuelIndexV224(), { cacheName });
  if (!response) return null;
  const records = await response.json();
  if (!Array.isArray(records)) throw new Error('Invalid offline duel index');
  return records;
}

async function loadOfflineDuelIndexV224() { return await readOfflineDuelIndexV225(offlineDuelCacheNameV223()) ?? []; }

async function saveOfflineDuelIndexV224(cache, entries) {
  await cache.put(offlineDuelIndexV224(), new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } }));
}

function offlineDuelRecipeV225(selection) {
  if (!Array.isArray(selection) || selection.length !== 5) return null;
  const player = DUEL_FIGHTERS_V225.get(JSON.stringify(selection.slice(0, 2)));
  const opponent = DUEL_FIGHTERS_V225.get(JSON.stringify(selection.slice(2, 4)));
  const stage = DUEL_ARENAS_V225.get(selection[4]);
  if (!player || !opponent || !stage) return null;
  return { key: JSON.stringify(selection), selection, assets: [...new Set([...player, ...opponent, ...stage, ...DUEL_EFFECTS_V225])].sort() };
}

async function hasOfflineMediaFingerprintV225(request, response) {
  const expected = DUEL_MEDIA_V223.get(new URL(request.url).pathname);
  if (!expected || !cacheableResponseV143(request, response)) return false;
  const checksum = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  const hash = Array.from(new Uint8Array(checksum), byte => byte.toString(16).padStart(2, '0')).join('');
  return hash === expected;
}

async function migrateOfflineDuelsV225(previous) {
  const preserved = new Set();
  if (!previous.length) return preserved;
  const recipes = new Map();
  const sources = [];
  let latestIndex = null;
  for (const name of previous.toReversed()) {
    try {
      const entries = await readOfflineDuelIndexV225(name);
      if (!entries) continue;
      // The latest catalog owns deletions. Older caches left after a storage
      // failure can supply intact bytes but must never bring a removed row back.
      latestIndex ??= entries;
      sources.push(name);
    } catch {
      if (!latestIndex) return new Set(previous);
      preserved.add(name);
    }
  }
  if (!latestIndex) return preserved;
  for (const row of latestIndex) {
    const current = offlineDuelRecipeV225(row?.selection);
    if (current && row.key === current.key) recipes.set(current.key, current);
  }
  if (!recipes.size) return preserved;
  let output;
  try {
    const current = await loadOfflineDuelIndexV224();
    for (const entry of current) recipes.set(entry.key, entry);
    output = await caches.open(offlineDuelCacheNameV223());
    await saveOfflineDuelIndexV224(output, [...recipes.values()]);
  } catch { return new Set(previous); }
  const needed = [...new Set([...recipes.values()].flatMap(entry => entry.assets))].filter(path => !SHELL_PATHS.has(path));
  let cursor = 0;
  // Bound memory while hashing large action atlases and move each shared path once.
  await Promise.all(Array.from({ length: Math.min(4, needed.length) }, async () => {
    while (cursor < needed.length) {
      const request = new Request(new URL(needed[cursor++], self.location.origin), { credentials: 'omit' });
      if (await output.match(request)) continue;
      for (const name of sources) {
        try {
          const response = await caches.match(request, { cacheName: name });
          if (!await hasOfflineMediaFingerprintV225(request, response)) continue;
          await output.put(request, response);
          break;
        } catch { preserved.add(name); }
      }
    }
  }));
  return preserved;
}

async function activateOfflineDuelsV225() {
  const names = await caches.keys();
  const current = offlineDuelCacheNameV223();
  const obsolete = names.filter(key => key.startsWith('atf-trials-') && key !== CACHE && key !== current);
  const previous = obsolete.filter(name => /^atf-trials-v\d+-[a-f0-9]{24}-duels$/.test(name));
  // A storage exception leaves the old download cache available to the next update.
  const preserved = await migrateOfflineDuelsV225(previous).catch(() => new Set(previous));
  await Promise.all(obsolete.filter(name => !preserved.has(name)).map(name => caches.delete(name)));
}

async function listOfflineDuelsV224(entries) {
  if (!entries.length) return [];
  const [shell, downloads] = await Promise.all([CACHE, offlineDuelCacheNameV223()].map(async name => {
    const cache = await caches.open(name);
    return new Set((await cache.keys()).map(request => new URL(request.url).pathname));
  }));
  return entries.map(({ key, selection, assets }) => ({ key, selection,
    ready: assets.every(path => (SHELL_PATHS.has(path) && shell.has(path)) || downloads.has(path)),
  }));
}

async function removeOfflineDuelV224(entries, key, expiresAt) {
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return { state: 'error' };
  const entry = entries.find(duel => duel.key === key);
  if (!entry) return { state: 'removed' };
  const keep = entries.filter(duel => duel !== entry);
  const retained = new Set(keep.flatMap(duel => duel.assets));
  const cache = await caches.open(offlineDuelCacheNameV223());
  await Promise.all(entry.assets.filter(path => !retained.has(path)).map(path =>
    cache.delete(new Request(new URL(path, self.location.origin)), { ignoreVary: true })));
  await saveOfflineDuelIndexV224(cache, keep);
  return { state: 'removed' };
}

async function readOfflineDuelAssetV223(request) {
  const url = new URL(request.url);
  if (url.search || !DUEL_MEDIA_V223.has(url.pathname)) return null;
  const response = await caches.match(request, { cacheName: offlineDuelCacheNameV223() });
  return cacheableResponseV143(request, response) ? response : null;
}

async function missingOfflineDuelAssetsV223(assets) {
  const states = await Promise.all(assets.map(async path => {
    const request = new Request(new URL(path, self.location.origin), { credentials: 'omit' });
    const inShell = SHELL_PATHS.has(path)
      && cacheableResponseV143(request, await caches.match(request, { cacheName: CACHE }));
    const isReady = inShell || await readOfflineDuelAssetV223(request);
    return isReady ? null : request;
  }));
  return states.filter(Boolean);
}

async function handleOfflineDuelV223(data) {
  const error = { state: 'error' };
  if (data.cacheName !== CACHE) return error;
  if (data.mode === 'list') return { state: 'listed', entries: await listOfflineDuelsV224(await loadOfflineDuelIndexV224()) };
  if (data.mode === 'remove') return removeOfflineDuelV224(await loadOfflineDuelIndexV224(), data.key, data.expiresAt);
  if (!['status', 'prepare'].includes(data.mode) || !Array.isArray(data.assets)
    || data.assets.length === 0 || data.assets.length > DUEL_MEDIA_V223.size
    || !data.assets.every(path => DUEL_MEDIA_V223.has(path))) return error;
  const recipe = offlineDuelRecipeV225(data.selection);
  if (!recipe || JSON.stringify(recipe.assets) !== JSON.stringify([...new Set(data.assets)].sort())) return error;
  const { key, assets } = recipe;
  const entries = await loadOfflineDuelIndexV224();
  const existing = entries.find(entry => entry.key === key);
  const missing = await missingOfflineDuelAssetsV223(assets);
  if (!missing.length && (existing || assets.every(path => SHELL_PATHS.has(path)))) return { state: 'ready' };
  if (data.mode === 'status') return { state: 'missing' };
  const output = await caches.open(offlineDuelCacheNameV223());
  if (!existing) await saveOfflineDuelIndexV224(output, [...entries, recipe]);
  // Keep work already completed on an interrupted connection. Readiness is
  // derived from the complete set each time, including after a reload.
  let cursor = 0, failed = false;
  await Promise.all(Array.from({ length: Math.min(4, missing.length) }, async () => {
    while (cursor < missing.length && !failed) {
      const request = missing[cursor++];
      try {
        const response = await fetch(request, { cache: 'reload' });
        if (!await hasOfflineMediaFingerprintV225(request, response)) throw new Error('Unexpected duel asset');
        await output.put(request, response);
      } catch { failed = true; }
    }
  }));
  return { state: (await missingOfflineDuelAssetsV223(assets)).length ? 'error' : 'ready' };
}

function registerOfflineDuelWorkerV223() {
  // A prepare and a removal from different tabs may share files and one index.
  // Keep the writes ordered while allowing observers to read partial progress.
  let writes = Promise.resolve();
  self.addEventListener('message', event => {
    if (event.data?.type !== 'XENO_TRIALS_OFFLINE_DUEL_V223' || !event.ports?.[0]) return;
    try { if (new URL(event.source?.url).origin !== self.location.origin) return; } catch { return; }
    const port = event.ports[0];
    const { data } = event;
    const handle = () => handleOfflineDuelV223(data).catch(() => ({ state: 'error' }));
    const response = ['prepare', 'remove'].includes(data.mode) ? (writes = writes.then(handle)) : handle();
    event.waitUntil(response.then(reply => port.postMessage(reply)));
  });
}

export function xenoTrialsOfflineWorkerV223(media, { effects, fighters, arenas }) {
  return `\nconst DUEL_MEDIA_V223 = new Map(${JSON.stringify(media)});\nconst DUEL_EFFECTS_V225 = ${JSON.stringify(effects)};\n`
    + `const DUEL_FIGHTERS_V225 = new Map(${JSON.stringify(fighters)});\nconst DUEL_ARENAS_V225 = new Map(${JSON.stringify(arenas)});\n${[
    offlineDuelCacheNameV223, offlineDuelIndexV224, readOfflineDuelIndexV225, loadOfflineDuelIndexV224, saveOfflineDuelIndexV224,
    offlineDuelRecipeV225, hasOfflineMediaFingerprintV225, migrateOfflineDuelsV225, activateOfflineDuelsV225,
    listOfflineDuelsV224, removeOfflineDuelV224, readOfflineDuelAssetV223, missingOfflineDuelAssetsV223,
    handleOfflineDuelV223, registerOfflineDuelWorkerV223,
  ].map(fn => fn.toString()).join('\n')}\nregisterOfflineDuelWorkerV223();\n`;
}
