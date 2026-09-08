import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { AUDIO_MIME_V77, isAudioResponseV77, resolveViewAudioSceneV77 } from '../src/audio-assets-v77.js';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
test('quitter le monde pour un écran de navigation change explicitement de contexte audio', async () => {
  assert.equal(resolveViewAudioSceneV77('play'), 'mission');
  assert.equal(resolveViewAudioSceneV77('hub'), 'hub');
  for (const view of ['operations', 'settings', 'archives', 'equipment', 'title', 'unknown']) assert.equal(resolveViewAudioSceneV77(view), 'menu');
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /audio\.setScene\(resolveViewAudioSceneV77\(name\)\)/);
});
const origin = 'https://alien.example';
const audioUrl = `${origin}/assets/audio/sfx/shot.wav?v=abcd`;
const sound = (mime = 'audio/wav', status = 200) => new Response(new Uint8Array([1, 2, 3]), { status, headers: { 'content-type': mime } });

function workerHarness(network = async () => sound()) {
  const listeners = new Map();
  const stored = new Map();
  const puts = [];
  let precached = [];
  const key = value => typeof value === 'string' ? value : value.url;
  const context = vm.createContext({ URL, Response, fetch: network,
    self: { location: { origin }, skipWaiting() {}, addEventListener: (name, callback) => listeners.set(name, callback) },
    caches: { open: async () => ({
      addAll: async paths => { precached = [...paths]; },
      put: async (request, response) => { puts.push(key(request)); stored.set(key(request), response.clone()); }
    }), match: async request => stored.get(key(request))?.clone() }
  });
  vm.runInContext(source, context);
  return { context, stored, puts, listeners, get precached() { return precached; },
    async fetch(request = new Request(audioUrl)) {
      let response;
      const pending = [];
      listeners.get('fetch')({ request, respondWith(promise) { response = promise; }, waitUntil(promise) { pending.push(promise); } });
      const result = await response;
      await Promise.all(pending);
      return result;
    }
  };
}

test('audio SW et lecteur partagent les MIME permis et rejettent HTML, 206 et opaque', () => {
  const harness = workerHarness();
  const guard = vm.runInContext('isAudioResponseV77', harness.context);
  for (const mime of [...Object.values(AUDIO_MIME_V77), 'audio/x-wav', 'application/ogg', 'video/webm', 'AUDIO/WAV; charset=binary', 'text/html', 'application/json', 'application/octet-stream', '']) {
    for (const status of [200, 206, 404]) {
      const response = sound(mime, status);
      assert.equal(guard(response), isAudioResponseV77(response), `${mime}/${status}`);
    }
  }
  assert.equal(guard({ ok: true, status: 200, type: 'opaque', headers: new Headers({ 'content-type': 'audio/wav' }) }), false);
});

test('le SW conserve un son entier puis le rend hors ligne sans fallback HTML', async () => {
  let online = true;
  const harness = workerHarness(async () => { if (!online) throw new Error('offline'); return sound(); });
  const first = await harness.fetch();
  assert.equal(first.status, 200);
  assert.deepEqual(harness.puts, [audioUrl]);
  online = false;
  const cached = await harness.fetch();
  assert.equal(cached.headers.get('content-type'), 'audio/wav');
  assert.deepEqual([...new Uint8Array(await cached.arrayBuffer())], [1, 2, 3]);
  harness.stored.set(audioUrl, sound('text/html'));
  assert.equal((await harness.fetch()).type, 'error');
  harness.stored.set(audioUrl, sound('audio/wav', 206));
  assert.equal((await harness.fetch()).type, 'error');
  harness.stored.clear();
  assert.equal((await harness.fetch()).type, 'error');
});

test('404, HTML 200 et réponse partielle ne polluent jamais le cache audio', async () => {
  for (const [mime, status] of [['audio/wav', 404], ['text/html', 200], ['audio/wav', 206]]) {
    const harness = workerHarness(async () => sound(mime, status));
    assert.equal((await harness.fetch()).status, status);
    assert.deepEqual(harness.puts, []);
  }
});

test('les requêtes Range et non GET passent au navigateur sans interception audio', async () => {
  let fetches = 0;
  const harness = workerHarness(async () => { fetches++; return sound(); });
  assert.equal(await harness.fetch(new Request(audioUrl, { headers: { range: 'bytes=0-15' } })), undefined);
  assert.equal(await harness.fetch(new Request(audioUrl, { method: 'POST' })), undefined);
  assert.equal(fetches, 0);
});

test('installation légère : seul le manifeste audio est précaché, le serveur réutilise les MIME déclarés', async () => {
  const harness = workerHarness();
  let installation;
  harness.listeners.get('install')({ waitUntil(promise) { installation = promise; } });
  await installation;
  assert.deepEqual(harness.precached.filter(path => path.startsWith('/assets/audio/')), ['/assets/audio/manifest.json']);
  const dev = await readFile(new URL('../scripts/dev.mjs', import.meta.url), 'utf8');
  const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(dev, /import\s*\{\s*AUDIO_MIME_V77\s*\}/);
  assert.match(dev, /\.\.\.AUDIO_MIME_V77/);
  for (const text of [dev, build]) assert.match(text, /await writeAudioManifestV77\(root\)/);
});
