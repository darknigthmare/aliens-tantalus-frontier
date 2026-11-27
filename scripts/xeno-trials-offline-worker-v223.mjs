function offlineDuelCacheNameV223() { return `${CACHE}-duels`; }

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
  if (data.cacheName !== CACHE || !['status', 'prepare'].includes(data.mode) || !Array.isArray(data.assets)
    || data.assets.length === 0 || data.assets.length > DUEL_MEDIA_V223.size
    || !data.assets.every(path => DUEL_MEDIA_V223.has(path))) return 'error';
  const assets = [...new Set(data.assets)];
  const missing = await missingOfflineDuelAssetsV223(assets);
  if (!missing.length) return 'ready';
  if (data.mode === 'status') return 'missing';
  const output = await caches.open(offlineDuelCacheNameV223());
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
  return (await missingOfflineDuelAssetsV223(assets)).length ? 'error' : 'ready';
}

function registerOfflineDuelWorkerV223() {
  self.addEventListener('message', event => {
    if (event.data?.type !== 'XENO_TRIALS_OFFLINE_DUEL_V223' || !event.ports?.[0]) return;
    try { if (new URL(event.source?.url).origin !== self.location.origin) return; } catch { return; }
    const port = event.ports[0];
    event.waitUntil(handleOfflineDuelV223(event.data).catch(() => 'error').then(state => port.postMessage({ state })));
  });
}

export function xenoTrialsOfflineWorkerV223(media) {
  return `\nconst DUEL_MEDIA_V223 = new Map(${JSON.stringify(media)});\n${[
    offlineDuelCacheNameV223, readOfflineDuelAssetV223, missingOfflineDuelAssetsV223,
    handleOfflineDuelV223, registerOfflineDuelWorkerV223,
  ].map(fn => fn.toString()).join('\n')}\nregisterOfflineDuelWorkerV223();\n`;
}
