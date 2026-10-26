import { withPlayerWeaponRigV125 } from '../src/player-weapon-runtime-v125.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { CAMPAIGNS, WORLDS, validateContent, RELEASE } from '../src/content.js';
import { CAMPAIGNS as BEFORE } from '../src/content-core-v50.js';
import { MIRE_SETTINGS_V143, MIRE_PENDING_SOURCES_V143, buildMireCampaignsV143, validateMireCampaignsV143 } from '../src/mire-settings-v143.js';
import { APP_RELEASE_V143 } from '../src/release-info-v143.js';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { resolveSourceCommitV143, stampReleaseHtmlV143 } from './build-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://tantalus.test';
const req = (path, options) => new Request(new URL(path, ORIGIN), options);
function response(path, { private: secret = false, status = 200, mime, vary } = {}) {
  const ext = new URL(path, ORIGIN).pathname.split('.').pop();
  const contentType = mime || ({ js: 'text/javascript', css: 'text/css', json: 'application/json', webmanifest: 'application/manifest+json', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', mp3: 'audio/mpeg', wav: 'audio/wav' }[ext] || 'text/html');
  return new Response(secret ? 'private account A' : 'public static bytes', { status, headers: { 'content-type': contentType,
    ...(secret ? { 'cache-control': 'no-store, private' } : {}), ...(vary ? { vary } : {}) } });
}
function host() {
  const stores = new Map(), listeners = {}, calls = [];
  const requestOf = value => typeof value === 'string' ? req(value) : value;
  class Cache {
    data = new Map();
    async put(input, value) { const request = requestOf(input); this.data.set(request.url, { request: request.clone(), value: value.clone() }); }
    async match(input) {
      const request = requestOf(input), entry = this.data.get(request.url);
      if (!entry) return undefined;
      const vary = (entry.value.headers.get('vary') || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      if (vary.some(name => name === '*' || request.headers.get(name) !== entry.request.headers.get(name))) return undefined;
      return entry.value.clone();
    }
    async delete(input) { return this.data.delete(requestOf(input).url); }
    async keys() { return [...this.data.values()].map(entry => entry.request.clone()); }
  }
  const caches = {
    async open(key) { if (!stores.has(key)) stores.set(key, new Cache()); return stores.get(key); },
    async keys() { return [...stores.keys()]; }, async delete(key) { return stores.delete(key); }
  };
  let network = async request => response(request.url);
  const self = { location: { origin: ORIGIN }, addEventListener(name, fn) { listeners[name] = fn; },
    skipWaiting() { throw new Error('Must not replace an active game worker.'); }, clients: { claim() { throw new Error('Must not claim open game tabs.'); } } };
  const context = vm.createContext({ self, URL, Request, Response, caches,
    fetch: async value => { const request = requestOf(value); calls.push(request); return network(request); } });
  vm.runInContext(worker + ';globalThis.api={CACHE,SHELL,cacheableRequestV143,cacheableResponseV143,cacheEnemyAtlasesV65};', context);
  async function dispatch(name, properties = {}) {
    const waits = [];
    let result, intercepted = false;
    listeners[name]({ ...properties, waitUntil(value) { waits.push(value); }, respondWith(value) { intercepted = true; result = value; } });
    const value = await result;
    await Promise.all(waits);
    return { intercepted, value };
  }
  return { api: context.api, caches, calls, dispatch, network(value) { network = value; } };
}

test('MIRE keeps every stable ID and leaves original Frontier operations untouched', () => {
  const mapped = buildMireCampaignsV143(BEFORE, WORLDS);
  assert.deepEqual(mapped.map(c => c.id), BEFORE.map(c => c.id));
  for (let i = 0; i < BEFORE.length; i++) if (BEFORE[i].mode !== 'MIRE') assert.equal(mapped[i], BEFORE[i]);
  assert.equal(validateContent().ok, true);
  assert.equal(CAMPAIGNS.length, 455);
  assert.equal(new Set(CAMPAIGNS.map(c => c.id)).size, 455);
});
for (const source of MIRE_SETTINGS_V143) test(`MIRE setting: ${source.source}`, () => {
  const entries = CAMPAIGNS.filter(c => c.mode === 'MIRE' && c.source === source.source);
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.equal(entry.worldId, source.worldId);
    assert.equal(entry.canon, 'source-setting-adaptation');
    assert.equal(entry.canonExact, false);
    assert.equal(entry.contentStatusV143.story, 'not-authored');
    assert.equal(entry.contentStatusV143.geometry, 'procedural');
    assert.equal(entry.contentStatusV143.cast, 'player-loadout');
    assert.equal(entry.year, null, 'A setting correction must not invent historical dates.');
  }
});
for (const source of MIRE_PENDING_SOURCES_V143) test(`No false historical destination: ${source}`, () => {
  const entries = CAMPAIGNS.filter(c => c.mode === 'MIRE' && c.source === source);
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.equal(entry.worldId, BEFORE.find(c => c.id === entry.id).worldId, 'Keep the playable sandbox, not a guessed canonical setting.');
    assert.equal(entry.canon, 'project-simulation');
    assert.equal(entry.historicalSettingV143, null);
    assert.match(entry.name, /Simulation originale/);
  }
});
test('MIRE settings do not depend on either array order', () => {
  const expected = new Map(buildMireCampaignsV143(BEFORE, WORLDS).map(c => [c.id, c.worldId]));
  for (const entry of buildMireCampaignsV143([...BEFORE].reverse(), [...WORLDS].reverse())) assert.equal(entry.worldId, expected.get(entry.id));
});
test('MIRE rejects an unreviewed new source or missing reviewed world', () => {
  assert.throws(() => buildMireCampaignsV143([{ ...BEFORE[0], source: 'Unreviewed new film' }], WORLDS));
  assert.throws(() => buildMireCampaignsV143(BEFORE, WORLDS.filter(w => w.id !== 'world-14-usm-auriga')));
});
test('MIRE validation catches the four incorrect audit associations', () => {
  for (const [source, worldId] of [['Aliens 1986', 'world-02-lv-223'], ['Alien Resurrection', 'world-04-sevastopol'],
    ['Prometheus', 'world-05-lethe'], ['Alien Isolation', 'world-09-purdan']]) {
    const changed = CAMPAIGNS.map(c => c.mode === 'MIRE' && c.source === source ? { ...c, worldId } : c);
    assert.equal(validateMireCampaignsV143(changed, WORLDS).ok, false);
  }
});
test('catalogue scope counts are explicit rather than a completion percentage', () => {
  const mire = CAMPAIGNS.filter(c => c.mode === 'MIRE');
  assert.equal(mire.length, 206);
  assert.equal(mire.filter(c => c.historicalSettingV143).length, 92);
  assert.equal(mire.filter(c => c.canon === 'project-simulation').length, 114);
  assert.ok(mire.every(c => c.canonExact === false));
});

for (const [label, path, options] of [
  ['remote REST', 'https://remote.test/rest/v1/saves', {}],
  ['same-origin REST', '/rest/v1/saves', {}], ['auth', '/auth/v1/user', {}],
  ['same-origin API', '/api/profile.png', {}], ['private document', '/docs/private.html', {}],
  ['query token', '/assets/openai/test.png?token=secret', {}], ['unknown navigation', '/account', { mode: 'same-origin' }],
  ['authorization', '/assets/openai/test.png', { headers: { Authorization: 'Bearer account-A' } }],
  ['API key', '/assets/openai/test.png', { headers: { apikey: 'account-A' } }],
  ['range', '/assets/audio/music/title.mp3', { headers: { Range: 'bytes=0-20' } }],
  ['request no-store', '/assets/openai/test.png', { cache: 'no-store' }],
  ['request private', '/assets/openai/test.png', { headers: { 'cache-control': 'private' } }],
  ['POST', '/assets/openai/test.png', { method: 'POST', body: 'private' }]
]) test(`worker never intercepts ${label}`, async () => {
  const h = host(), request = req(path, options);
  const old = await h.caches.open('atf-old'); await old.put(request, response(path, { private: true }));
  const active = await h.caches.open(h.api.CACHE); await active.put(request, response(path, { private: true }));
  h.network(async () => { throw new Error('offline'); });
  assert.equal((await h.dispatch('fetch', { request })).intercepted, false);
  assert.equal(h.calls.length, 0, 'The browser handles this network request; no worker fallback.');
});
for (const [label, config] of [['no-store', { private: true }], ['HTML fallback', { mime: 'text/html' }],
  ['partial response', { status: 206 }], ['Vary Authorization', { vary: 'Authorization' }],
  ['Vary cookie', { vary: 'Cookie' }], ['Vary star', { vary: '*' }], ['404', { status: 404 }]]) {
  test(`worker refuses cached ${label}`, async () => {
    const h = host(), request = req('/assets/openai/audit-image.png');
    h.network(async () => response(request.url, config));
    await h.dispatch('fetch', { request });
    assert.equal((await (await h.caches.open(h.api.CACHE)).keys()).length, 0);
    h.network(async () => { throw new Error('offline'); });
    assert.equal((await h.dispatch('fetch', { request })).value.type, 'error');
  });
}
test('a newly private optional resource removes its older public cached copy', async () => {
  const h = host(), request = req('/assets/openai/changing.png');
  await h.dispatch('fetch', { request });
  assert.ok(await (await h.caches.open(h.api.CACHE)).match(request));
  h.network(async () => response(request.url, { private: true }));
  await h.dispatch('fetch', { request });
  assert.equal(await (await h.caches.open(h.api.CACHE)).match(request), undefined);
});
test('offline fallback uses only the active cache, never an old account cache', async () => {
  const h = host(), request = req('/assets/openai/old.png');
  await (await h.caches.open('atf-old')).put(request, response(request.url));
  h.network(async () => { throw new Error('offline'); });
  assert.equal((await h.dispatch('fetch', { request })).value.type, 'error');
});
test('public image caches normally and survives a network interruption', async () => {
  const h = host(), request = req('/assets/openai/public.png');
  assert.equal((await h.dispatch('fetch', { request })).value.status, 200);
  h.network(async () => { throw new Error('offline'); });
  assert.equal(await (await h.dispatch('fetch', { request })).value.text(), 'public static bytes');
});
test('installed executable shell is pinned instead of mixing deployments', async () => {
  const h = host(), request = req('/src/app.js');
  await (await h.caches.open(h.api.CACHE)).put(request, new Response('old stable module', { headers: { 'content-type': 'text/javascript' } }));
  h.network(async () => new Response('different deployment', { headers: { 'content-type': 'text/javascript' } }));
  assert.equal(await (await h.dispatch('fetch', { request })).value.text(), 'old stable module');
  assert.equal(h.calls.length, 0);
});
test('activation purges only obsolete ATF caches and never forces takeover', async () => {
  const h = host();
  for (const key of ['atf-old', 'another-app', h.api.CACHE]) await h.caches.open(key);
  await h.dispatch('activate');
  assert.deepEqual((await h.caches.keys()).sort(), ['another-app', h.api.CACHE].sort());
});
test('a complete install warms the shell with omitted credentials and does not skip waiting', async () => {
  const h = host(); await h.dispatch('install');
  assert.equal((await (await h.caches.open(h.api.CACHE)).keys()).length, h.api.SHELL.length);
  assert.ok(h.calls.every(request => request.credentials === 'omit'));
});
test('a failed install rolls back the entire new cache, not the previous release', async () => {
  const h = host(), previousName = 'atf-v143-continuation-v163';
  assert.notEqual(h.api.CACHE, previousName, 'The source worker must not overwrite the active V163 cache.');
  const previous = await h.caches.open(previousName), stableRequest = req('/src/app.js');
  await previous.put(stableRequest, new Response('stable V163 source module'));
  h.network(async request => { if (request.url.endsWith('/src/app.js')) throw new Error('missing module'); return response(request.url); });
  await assert.rejects(h.dispatch('install'), /missing module/);
  assert.deepEqual(await h.caches.keys(), [previousName]);
  assert.equal(await (await previous.match(stableRequest)).text(), 'stable V163 source module');
});
test('a failed V165 precache retains the active V164 masked-sprite deployment intact', async () => {
  const h = host(), previousName = 'atf-v143-npc-matte-v164';
  assert.notEqual(h.api.CACHE, previousName, 'A new source deployment needs its own cache namespace.');
  const previous = await h.caches.open(previousName);
  const stableRequest = req('/src/npc-matte-apertures-v164.js');
  await previous.put(stableRequest, new Response('stable V164 sprite policy'));
  h.network(async request => {
    if (request.url.endsWith('/src/app.js')) throw new Error('incomplete V165 deployment');
    return response(request.url);
  });
  await assert.rejects(h.dispatch('install'), /incomplete V165 deployment/);
  assert.deepEqual(await h.caches.keys(), [previousName]);
  assert.equal(await (await previous.match(stableRequest)).text(), 'stable V164 sprite policy');
});
test('optional atlas warming is same-origin, bounded and tolerant of unavailable files', async () => {
  const h = host();
  const paths = Array.from({ length: 40 }, (_, i) => `/assets/openai/sprites/normalized/enemies/enemy-${i}.png`);
  h.network(async request => { if (request.url.endsWith('-1.png')) throw new Error('missing'); return response(request.url); });
  const count = await h.api.cacheEnemyAtlasesV65(['https://remote.test/steal.png', '/api/user', ...paths]);
  assert.equal(h.calls.length, 12); assert.equal(count, 11);
  await h.dispatch('message', { data: { type: 'CACHE_ENEMY_ATLASES_V65', paths }, source: { url: 'https://foreign.test/' } });
  assert.equal(h.calls.length, 12);
});
test('runtime cache remains bounded without evicting the executable shell', async () => {
  const h = host(), cache = await h.caches.open(h.api.CACHE);
  await cache.put(req('/src/app.js'), response('/src/app.js'));
  for (let i = 0; i < 270; i++) await h.dispatch('fetch', { request: req(`/assets/openai/optional-${i}.png`) });
  assert.equal((await cache.keys()).length, 257); assert.ok(await cache.match(req('/src/app.js')));
});

test('release runner deduplicates aliases and refuses an empty or executable shell test entry', () => {
  assert.deepEqual(collectReleaseTestsV143({ 'test:one': 'node --test scripts/one.mjs scripts/two.mjs',
    'test:alias': 'node --test scripts/one.mjs', 'test:all': 'node scripts/test-release-v143.mjs' }), ['scripts/one.mjs', 'scripts/two.mjs']);
  assert.throws(() => collectReleaseTestsV143({}));
  assert.throws(() => collectReleaseTestsV143({ 'test:bad': 'node --test scripts/ok.mjs;evil' }));
});
test('release and save format are distinct; package and runtime agree', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.version, APP_RELEASE_V143.version); assert.equal(RELEASE.releaseVersion, pkg.version);
  assert.equal(APP_RELEASE_V143.saveSchema, 52);
});
test('release commit identity uses the actual checkout, with a strict archive fallback', () => {
  const sha = 'a'.repeat(40), other = 'b'.repeat(40);
  assert.equal(resolveSourceCommitV143('.', { GITHUB_SHA: other }, () => sha), sha);
  assert.equal(resolveSourceCommitV143('.', { VERCEL_GIT_COMMIT_SHA: other }, () => { throw new Error(); }), other);
  assert.throws(() => resolveSourceCommitV143('.', { CI: 'true' }, () => { throw new Error(); }));
  assert.throws(() => resolveSourceCommitV143('.', { VERCEL_GIT_COMMIT_SHA: 'not-a-sha' }, () => { throw new Error(); }));
});
test('new release workflow and report are source tooling only', () => {
  for (const path of ['.github/workflows/full-release-v143.yml', 'docs/forge/V143-AUDIT-FIXES.md']) {
    assert.equal(isPublicDistributionPathV86(path), true); assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  }
});


test('visible HTML badges, title and metadata use the release identity and leave the rest of the shell intact', async () => {
  const original = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const release = { version: '143.0.0', buildId: '143.0.0+abcdef123456' };
  const html = stampReleaseHtmlV143(original, release);
  assert.ok(html.includes('<meta name="atf-release" content="143.0.0+abcdef123456">'));
  assert.ok(html.includes('VERSION 143.0.0+abcdef123456 · BUILD FRONTIER'));
  assert.ok(html.includes('<b id="runtime-version-v143" title="143.0.0+abcdef123456">v143.0.0</b>RUNTIME'));
  assert.ok(!html.includes('86.0.0'));
  assert.equal(stampReleaseHtmlV143(html, release), html, 'Stamping is idempotent.');
  for (const token of ['id="save-session-export-v144"', 'id="game-canvas"', 'id="hub-canvas"', '/src/app.js'])
    assert.ok(html.includes(token), token);
  assert.ok(stampReleaseHtmlV143(original, { version: '143.0.0' }).includes('>v143.0.0</b>'));
});
test('release HTML refuses broken/duplicate anchors and unsafe identities instead of silently mislabelling a build', async () => {
  const original = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const release = { version: '143.0.0', buildId: '143.0.0+abcdef123456' };
  assert.throws(() => stampReleaseHtmlV143(original.replace('atf-release', 'missing'), release), /anchor/);
  assert.throws(() => stampReleaseHtmlV143(original + '<meta name="atf-release" content="wrong">', release), /anchor/);
  assert.throws(() => stampReleaseHtmlV143(original, { version: '143.0.0', buildId: '144.0.0+different' }), /identity/);
  assert.throws(() => stampReleaseHtmlV143(original, { version: '143.0.0', buildId: '143.0.0+<script>' }), /identity/);
});


test('rendered weapon observations identify the drawn shot, never an input accepted before the next frame', () => {
  const Engine = withPlayerWeaponRigV125(class {}), engine = new Engine();
  const actor = { shots: 0, ammo: 10 }; engine.player = actor; engine.animationTime = 5;
  const pose = { profile: { weaponId: 'test-weapon' }, path: '/test.png', surface: 'mission',
    muzzle: { x: 10, y: 20 }, matrix: {}, bodyRig: { facing: 1,
      matrix: { a: 1, b: 0, c: 0, d: 1 },
      armLengths: { near: { upper: 2, fore: 1 }, far: { upper: 2, fore: 1 } } },
    armBendsV160: { near: 1, far: 1 }, armReachV160: { feasible: true, error: 0 },
    weaponImage: {}, grip: { x: 1, y: 2 } };
  const render = { drawn: true, sheetId: 'test-body', frame: 0,
    arms: { near: { shoulder: { x: 0, y: 0 }, elbow: { x: 0, y: 2 }, hand: pose.grip },
      far: { shoulder: { x: 0, y: 0 }, elbow: { x: 0, y: 2 }, hand: pose.grip } } };
  // Only this observation wrapper is under test, not the rig or raster art.
  engine.resolvePlayerWeaponPoseV125 = () => pose;
  engine.drawPlayerBodyCompositionV125 = () => render;
  engine.drawPlayerWeaponRigV125({}, actor);
  assert.equal(actor.heldWeaponVisualV125.shotSerial, 0);
  assert.equal(actor.heldWeaponVisualV125.timeSeconds, 5);
  assert.deepEqual(actor.heldWeaponVisualV125.nearShoulder, render.arms.near.shoulder);
  assert.deepEqual(actor.heldWeaponVisualV125.nearElbow, render.arms.near.elbow);
  assert.ok(Math.abs(actor.heldWeaponVisualV125.armJointAnglesV160.near.flexionDegrees - 90) < 1e-8);
  actor.shots = 1; actor.ammo = 9;
  assert.equal(actor.heldWeaponVisualV125.shotSerial, 0, 'An accepted input does not certify a newly drawn frame.');
  engine.animationTime = 5.016;
  engine.drawPlayerWeaponRigV125({}, actor);
  assert.equal(actor.heldWeaponVisualV125.shotSerial, 1);
  assert.equal(actor.heldWeaponVisualV125.timeSeconds, 5.016);
  assert.equal(actor.ammo, 9); assert.equal(actor.shots, 1, 'Drawing never produces another accepted shot.');
  render.drawn = false;
  engine.drawPlayerWeaponRigV125({}, actor);
  assert.equal(actor.heldWeaponVisualV125, null, 'A failed draw cannot certify a stale composition.');
});
