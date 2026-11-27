import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { xenoTrialsWorkerV207 } from './build-xeno-trials-v207.mjs';
import { getXenoTrialsOfflineDuelV223, XENO_TRIALS_FIGHT_EFFECTS_V223 } from '../src/xeno-trials-offline-v223.js';

const origin = 'https://trials.example';
const cacheName = 'atf-trials-v223-0123456789abcdef01234567';
const playerPath = '/assets/openai/sprites/static-enemy-v95/arachnoid-purple-v95.png';
const enemyPath = '/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png';
const actionPath = '/assets/openai/sprites/xeno-trials-v202/synth-heavy-ground-special-sheet.png';
const arenaPath = '/assets/openai/stages/xeno-trials-v193/industrial/freight-flight-deck.png';

test('the offline duel plan admits the exact fighter variant, stage layers, animation and impact effects', () => {
  const config = { playerId: 'arachnoid', playerVariant: 'purple', opponentId: 'synth-heavy', stageId: 'xt193-freight-flight-deck' };
  const duel = getXenoTrialsOfflineDuelV223(config);
  for (const path of [playerPath, enemyPath, actionPath, arenaPath, ...XENO_TRIALS_FIGHT_EFFECTS_V223]) assert.ok(duel.assets.includes(path), path);
  assert.equal(duel.assets.length, new Set(duel.assets).size);
  assert.equal(duel.key, getXenoTrialsOfflineDuelV223({ ...config, difficulty: 'easy' }).key);
  assert.notEqual(duel.key, getXenoTrialsOfflineDuelV223({ ...config, playerVariant: 'grey' }).key);
});

function workerFixture() {
  const media = [playerPath, enemyPath, actionPath, arenaPath].map(path => [path, createHash('sha256').update(path).digest('hex')]);
  const listeners = new Map(), storage = new Map(), unavailable = new Set(), altered = new Set(), fetched = [];
  const request = path => new Request(new URL(path, origin));
  const texture = body => new Response(body, { headers: { 'content-type': 'image/png' } });
  const caches = {
    async open(name) {
      if (!storage.has(name)) storage.set(name, new Map());
      const entries = storage.get(name);
      return { match: async key => entries.get(key.url)?.clone(), put: async (key, value) => entries.set(key.url, value.clone()) };
    },
    async match(key, { cacheName: name }) { return storage.get(name)?.get(key.url)?.clone(); },
    async keys() { return [...storage.keys()]; },
    async delete(name) { return storage.delete(name); },
  };
  const context = vm.createContext({ URL, Request, Response, Map, Uint8Array, crypto: webcrypto, caches,
    self: { addEventListener: (name, fn) => listeners.set(name, [...(listeners.get(name) ?? []), fn]), location: { origin } },
    fetch: async key => {
      const path = new URL(key.url).pathname;
      fetched.push(path);
      if (unavailable.has(path)) throw new Error('Network fixture');
      return texture(altered.has(path) ? 'wrong binary' : path);
    },
  });
  vm.runInContext(xenoTrialsWorkerV207(readFileSync('sw.js', 'utf8'), cacheName, ['/', playerPath], media)
    + '\n;globalThis.readOffline = cachedResponseV143;', context);
  async function send(mode, assets, override = {}, source = origin) {
    let reply, completion;
    const event = { data: { type: 'XENO_TRIALS_OFFLINE_DUEL_V223', mode, cacheName, assets, ...override }, source: { url: source },
      ports: [{ postMessage: value => { reply = value.state; } }], waitUntil: promise => { completion = promise; } };
    for (const listener of listeners.get('message')) listener(event);
    await completion;
    return reply;
  }
  return { send, read: path => context.readOffline(request(path)), unavailable, altered, fetched, storage,
    async seed(path) { await (await caches.open(cacheName)).put(request(path), texture(path)); },
    async activate() { for (const listener of listeners.get('activate')) await new Promise(resolve => listener({ waitUntil: promise => promise.then(resolve) })); },
  };
}

test('the dedicated worker checks readiness, verifies bytes and resumes a partial download without a ticket', async () => {
  const worker = workerFixture(), assets = [playerPath, enemyPath, actionPath, arenaPath];
  await worker.seed(playerPath);
  assert.equal(await worker.send('status', assets), 'missing');
  assert.deepEqual(worker.fetched, []);
  worker.unavailable.add(arenaPath);
  worker.altered.add(actionPath);
  assert.equal(await worker.send('prepare', assets), 'error');
  assert.equal(await worker.send('status', assets), 'missing');
  assert.equal(await worker.read(actionPath), null);
  assert.equal(await worker.read(arenaPath), null);
  assert.equal(await (await worker.read(enemyPath)).text(), enemyPath);
  worker.unavailable.clear(); worker.altered.clear(); worker.fetched.length = 0;
  assert.equal(await worker.send('prepare', assets), 'ready');
  assert.deepEqual(worker.fetched.sort(), [actionPath, arenaPath].sort());
  worker.storage.set('atf-trials-v222-obsolete', new Map());
  await worker.activate();
  assert.ok(!worker.storage.has('atf-trials-v222-obsolete'));
  assert.ok(worker.storage.has(`${cacheName}-duels`));
  assert.equal(await worker.send('status', assets), 'ready');
  for (const asset of assets) assert.equal(await (await worker.read(asset)).text(), asset);
});

test('the worker ignores foreign sites and refuses stale builds and unadmitted requests', async () => {
  const worker = workerFixture();
  assert.equal(await worker.send('prepare', [enemyPath], {}, 'https://elsewhere.example'), undefined);
  assert.equal(await worker.send('prepare', [enemyPath], { cacheName: 'older-build' }), 'error');
  for (const path of ['/save.json', enemyPath + '?q=1', 'https://others.example' + enemyPath]) {
    assert.equal(await worker.send('prepare', [enemyPath, path]), 'error');
  }
  assert.deepEqual(worker.fetched, []);
});
