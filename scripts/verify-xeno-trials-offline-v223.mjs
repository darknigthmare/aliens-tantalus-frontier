import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { xenoTrialsWorkerV207 } from './build-xeno-trials-v207.mjs';
import { getXenoTrialsOfflineDuelKeyV224, getXenoTrialsOfflineDuelV223, XENO_TRIALS_FIGHT_EFFECTS_V223 } from '../src/xeno-trials-offline-v223.js';

const origin = 'https://trials.example';
const cacheName = 'atf-trials-v223-0123456789abcdef01234567';
const playerPath = '/assets/openai/sprites/static-enemy-v95/arachnoid-purple-v95.png';
const enemyPath = '/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png';
const actionPath = '/assets/openai/sprites/xeno-trials-v202/synth-heavy-ground-special-sheet.png';
const arenaPath = '/assets/openai/stages/xeno-trials-v193/industrial/freight-flight-deck.png';
const secondArena = '/assets/openai/stages/xeno-trials-v193/industrial/hibernation-ring.png';
const selection = ['arachnoid', 'purple', 'synth-heavy', null, 'xt193-freight-flight-deck'];
const alternate = [...selection.slice(0, 4), 'xt193-hibernation-ring'];
const indexPath = '/__atf-offline-duels-v224.json';

test('the offline duel plan admits the exact fighter variant, stage layers, animation and impact effects', () => {
  const config = { playerId: 'arachnoid', playerVariant: 'purple', opponentId: 'synth-heavy', stageId: 'xt193-freight-flight-deck' };
  const duel = getXenoTrialsOfflineDuelV223(config);
  for (const path of [playerPath, enemyPath, actionPath, arenaPath, ...XENO_TRIALS_FIGHT_EFFECTS_V223]) assert.ok(duel.assets.includes(path), path);
  assert.equal(duel.assets.length, new Set(duel.assets).size);
  assert.deepEqual(duel.selection, selection);
  assert.equal(duel.key, getXenoTrialsOfflineDuelKeyV224(config));
  assert.equal(duel.key, getXenoTrialsOfflineDuelV223({ ...config, difficulty: 'easy' }).key);
  assert.notEqual(duel.key, getXenoTrialsOfflineDuelV223({ ...config, playerVariant: 'grey' }).key);
});

function workerFixture() {
  const media = [playerPath, enemyPath, actionPath, arenaPath, secondArena].map(path => [path, createHash('sha256').update(path).digest('hex')]);
  const listeners = new Map(), storage = new Map(), unavailable = new Set(), altered = new Set(), fetched = [];
  const request = path => new Request(new URL(path, origin));
  const texture = body => new Response(body, { headers: { 'content-type': 'image/png' } });
  const caches = {
    async open(name) {
      if (!storage.has(name)) storage.set(name, new Map());
      const entries = storage.get(name);
      return { match: async key => entries.get(key.url)?.clone(), put: async (key, value) => entries.set(key.url, value.clone()),
        keys: async () => [...entries.keys()].map(url => new Request(url)), delete: async key => entries.delete(key.url) };
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
    + '\n;globalThis.readOffline = cachedResponseV143;globalThis.cacheable = cacheableRequestV143;', context);
  async function reply(mode, assets, override = {}, source = origin) {
    let reply, completion;
    const event = { data: { type: 'XENO_TRIALS_OFFLINE_DUEL_V223', mode, cacheName, assets, selection,
      expiresAt: Date.now() + 120000, ...override }, source: { url: source },
      ports: [{ postMessage: value => { reply = structuredClone(value); } }], waitUntil: promise => { completion = promise; } };
    for (const listener of listeners.get('message')) listener(event);
    await completion;
    return reply;
  }
  return { send: async (...args) => (await reply(...args))?.state, reply,
    read: path => context.readOffline(request(path)), cacheable: path => context.cacheable(request(path)), unavailable, altered, fetched, storage,
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
  assert.equal(await worker.send('prepare', [enemyPath], { selection: ['warrior'] }), 'error');
  for (const path of ['/save.json', enemyPath + '?q=1', 'https://others.example' + enemyPath]) {
    assert.equal(await worker.send('prepare', [enemyPath, path]), 'error');
  }
  assert.deepEqual(worker.fetched, []);
});

test('a concurrent pair of preparations records both variants of the fixture and shares download bytes', async () => {
  const worker = workerFixture(), assets = [playerPath, enemyPath, actionPath];
  await worker.seed(playerPath);
  assert.deepEqual(await worker.reply('list'), { state: 'listed', entries: [] });
  assert.deepEqual(await Promise.all([
    worker.send('prepare', [...assets, arenaPath]),
    worker.send('prepare', [...assets, secondArena], { selection: alternate }),
  ]), ['ready', 'ready']);
  assert.deepEqual(worker.fetched.sort(), [enemyPath, actionPath, arenaPath, secondArena].sort());
  assert.deepEqual((await worker.reply('list')).entries, [selection, alternate].map(item =>
    ({ key: JSON.stringify(item), selection: item, ready: true })));
  assert.equal(worker.cacheable(indexPath), false);
  assert.equal(await worker.read(indexPath), null);
  assert.equal(await worker.send('remove', null, { key: JSON.stringify(selection), expiresAt: Date.now() - 1 }), 'error');
  assert.equal((await worker.reply('list')).entries.length, 2);
  assert.ok(await worker.read(arenaPath));
  assert.equal(await worker.send('remove', null, { key: JSON.stringify(selection) }), 'removed');
  assert.equal(await worker.send('status', [...assets, arenaPath]), 'missing');
  assert.equal(await worker.read(arenaPath), null);
  for (const path of [...assets, secondArena]) assert.equal(await (await worker.read(path)).text(), path);
  assert.equal(await worker.send('status', [...assets, secondArena], { selection: alternate }), 'ready');
  assert.equal(await worker.send('remove', null, { key: JSON.stringify(alternate) }), 'removed');
  assert.equal(await worker.read(secondArena), null);
  assert.equal(await worker.read(actionPath), null);
  assert.ok(await worker.read(playerPath));
});

test('an interrupted plan is visible and removable, and an exact sharing match can still be registered', async () => {
  const worker = workerFixture();
  worker.unavailable.add(arenaPath);
  assert.equal(await worker.send('prepare', [enemyPath, arenaPath]), 'error');
  assert.deepEqual((await worker.reply('list')).entries, [{ key: JSON.stringify(selection), selection, ready: false }]);
  assert.equal(await worker.send('remove', null, { key: JSON.stringify(selection) }), 'removed');
  assert.equal(await worker.read(enemyPath), null);
  worker.unavailable.clear();
  assert.equal(await worker.send('prepare', [enemyPath, arenaPath]), 'ready');
  worker.fetched.length = 0;
  assert.equal(await worker.send('status', [enemyPath, arenaPath], { selection: alternate }), 'missing');
  assert.equal(await worker.send('prepare', [enemyPath, arenaPath], { selection: alternate }), 'ready');
  assert.equal(await worker.send('prepare', [enemyPath], { selection: alternate }), 'error');
  assert.deepEqual(worker.fetched, []);
  assert.deepEqual((await worker.reply('list')).entries.map(entry => entry.ready), [true, true]);
});
