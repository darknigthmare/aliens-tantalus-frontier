function offlineDuelCacheNameV223() { return `${CACHE}-duels`; }

function offlineDuelIndexV224() {
  return new Request(new URL('/__atf-offline-duels-v224.json', self.location.origin));
}

async function loadOfflineDuelIndexV224() {
  const response = await caches.match(offlineDuelIndexV224(), { cacheName: offlineDuelCacheNameV223() });
  return response ? response.json() : [];
}

async function saveOfflineDuelIndexV224(cache, entries) {
  await cache.put(offlineDuelIndexV224(), new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } }));
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
  const selection = data.selection;
  if (!Array.isArray(selection) || selection.length !== 5 || !selection.every((value, index) =>
    ((index === 1 || index === 3) && value === null) || (typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,119}$/u.test(value)))) return error;
  const key = JSON.stringify(selection);
  const assets = [...new Set(data.assets)].sort();
  const entries = await loadOfflineDuelIndexV224();
  const existing = entries.find(entry => entry.key === key);
  if (existing && JSON.stringify(existing.assets) !== JSON.stringify(assets)) return error;
  const missing = await missingOfflineDuelAssetsV223(assets);
  if (!missing.length && (existing || assets.every(path => SHELL_PATHS.has(path)))) return { state: 'ready' };
  if (data.mode === 'status') return { state: 'missing' };
  const output = await caches.open(offlineDuelCacheNameV223());
  if (!existing) await saveOfflineDuelIndexV224(output, [...entries, { key, selection, assets }]);
  // Keep work already completed on an interrupted connection. Readiness is
  // derived from the complete set each time, including after a reload.
  let cursor = 0, failed = false;
  await Promise.all(Array.from({ length: Math.min(4, missing.length) }, async () => {
    while (cursor < missing.length && !failed) {
      const request = missing[cursor++];
      try {
        const response = await fetch(request, { cache: 'reload' });
        if (!cacheableResponseV143(request, response)) throw new Error('Invalid duel asset');
        const checksum = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
        const hash = Array.from(new Uint8Array(checksum), byte => byte.toString(16).padStart(2, '0')).join('');
        if (hash !== DUEL_MEDIA_V223.get(new URL(request.url).pathname)) throw new Error('Unexpected duel asset');
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

export function xenoTrialsOfflineWorkerV223(media) {
  return `\nconst DUEL_MEDIA_V223 = new Map(${JSON.stringify(media)});\n${[
    offlineDuelCacheNameV223, offlineDuelIndexV224, loadOfflineDuelIndexV224, saveOfflineDuelIndexV224,
    listOfflineDuelsV224, removeOfflineDuelV224, readOfflineDuelAssetV223, missingOfflineDuelAssetsV223,
    handleOfflineDuelV223, registerOfflineDuelWorkerV223,
  ].map(fn => fn.toString()).join('\n')}\nregisterOfflineDuelWorkerV223();\n`;
}
