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
import { COLONY_CREW_SLOTS_V188, COLONY_CREW_FILES_PRESENT_V188 } from '../src/colony-crew-slots-v188.js';
import { buildCampaignsWithSpecialOperationsV67 } from '../src/special-operations-v67.js';
import { BLACK_COCOON_CAMPAIGN_V121 } from '../src/black-cocoon-state-v121.js';
import { APC_CONVOY_CAMPAIGN_V121 } from '../src/apc-convoy-state-v121.js';
import { C12_HORDE_CAMPAIGN_V121 } from '../src/c12-horde-state-v121.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 } from '../src/archive-relay-state-v122.js';
import { NEW_SPECIAL_CAMPAIGNS_V131 } from '../src/special-operations-v131.js';
import { STATION_CAMPAIGNS_V188 } from '../src/station-asphodele-v188.js';
import { ASPHODELE_CAMPAIGNS_V188 } from '../src/asphodele-missions-v188.js';
import { ACT5_CAMPAIGNS_V188 } from '../src/story-act5-v188.js';
import { COLONY_CAMPAIGNS_V188 } from '../src/colony-missions-v188.js';
import { QUEENS_CAMPAIGNS_V188 } from '../src/side-campaign-queens-v188.js';
import { FIORINA_CAMPAIGN_V114 } from '../src/fiorina-campaign-v114.js';

const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const ASPHODELE_CARDS_V188 = ['asphodele-exterior', 'cassius-core', 'echo8-recording', 'order-documents', 'seal-fragment', 'david-memory']
  .map(id => `/assets/content/v188/${id}.png`);
const ASPHODELE_MISSION_ART_V188 = ['panel', 'crt', 'sign', 'conduit', 'blackbox', 'resin', 'salvage', 'gauge', 'camera']
  .map(id => `/assets/asphodele/v188/asph-msn-${id}.png`);
const ASPHODELE_HUB_WALL_ART_V188 = ['docks', 'ring', 'spoke', 'control', 'relay', 'lab', 'memorial', 'greenhouse', 'market', 'quarters', 'medbay', 'lower', 'repair']
  .map(id => `/assets/asphodele/v188/asph-wall-${id}.png`);
const ASPHODELE_HUB_DETAIL_ART_V188 = ['door', 'ud4l-docked', 'crucible-shuttle', 'cassius-core', 'qz-map', 'relay-bays', 'cradles', 'memorial-plaques',
  'hydro-bays', 'crucible-stall', 'grue', 'bunks', 'medbay-beds', 'medbay-scanner', 'echo8-barricade', 'night-board', 'repair-cradle', 'npc-docker', 'npc-merchant', 'npc-technician']
  .map(id => `/assets/asphodele/v188/asph-${id}.png`);
const ASPHODELE_CINEMATIC_ART_V188 = ['ring', 'hub', 'rook-quarters', 'helmet-corridor', 'ceiling-drone', 'bent-door']
  .map(id => `/assets/asphodele/v188/cinematics/asph-cin-${id}.png`);
const ASPHODELE_RUNTIME_ART_V188 = [...ASPHODELE_CARDS_V188, ...ASPHODELE_MISSION_ART_V188, ...ASPHODELE_HUB_WALL_ART_V188, ...ASPHODELE_HUB_DETAIL_ART_V188, ...ASPHODELE_CINEMATIC_ART_V188];
const ACT5_RUNTIME_ART_V188 = ['m577-side-corrected', 'm577-rain-departure', 'bridge-collapse', 'quay-standoff', 'port-gates-rollcall',
  'port-meridien-epilogue', 'freight-trailer', 'colonist-trailer', 'echo8-locker-epilogue'].map(id => `/assets/act5/v188/${id}.png`);
const BIOLOGICAL_RUNTIME_ART_V188 = ['qz17-cradle-breached', 'depot-resin-helmet-corridor', 'human-resin-support']
  .map(id => `/assets/biological/v188/${id}.png`);
const PROLOGUE_RUNTIME_ART_V188 = ['tomas-wren-standing', 'lucia-ferro-standing', 'adele-sarrazin-standing',
  'resident-child-standing', 'north-quay-patient', 'medical-stretcher', 'port-meridien-night-approach',
  'relay-access-badge', 'relay-reaching-hand', 'cryo-supply-shelf', 'cryo-service-trolley'].map(id => `/assets/prologue/v188/${id}.png`);
const CARGO_ABYSS_RUNTIME_ART_V188 = [
  ...['idle', 'advance', 'claw-tail', 'roar-hurt'].map(clip => `/assets/cargo/v188/matriarch-${clip}.png`),
  '/assets/abyss/v188/manta-6-hull.png'
];
const HADAL_RUNTIME_ART_V188 = ['upper-parts', 'leg-parts', 'helmet'].map(part => `/assets/abyss/v188/hadal-${part}.png`);
const BROODSTORM_QUEEN_RUNTIME_ART_V188 = ['idle', 'chase', 'death'].map(clip => `/assets/broodstorm/v188/flying-queen-${clip}.png`);
const QUEEN_MOTHER_RUNTIME_ART_V188 = ['rest-anticipation', 'action-death', 'arms'].map(part => `/assets/queen-mother/v188/adult-${part}.png`);
const QUEEN_MOTHER_GUARD_RUNTIME_ART_V188 = ['/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png'];
const QUEEN_MOTHER_CHOIR_RUNTIME_ART_V188 = ['/assets/queen-mother/v188/choirs-original.png'];
const REVIEWED_RUNTIME_ART_V188 = [...ASPHODELE_RUNTIME_ART_V188, ...ACT5_RUNTIME_ART_V188, ...BIOLOGICAL_RUNTIME_ART_V188, ...PROLOGUE_RUNTIME_ART_V188, ...CARGO_ABYSS_RUNTIME_ART_V188, ...HADAL_RUNTIME_ART_V188, ...BROODSTORM_QUEEN_RUNTIME_ART_V188, ...QUEEN_MOTHER_RUNTIME_ART_V188, ...QUEEN_MOTHER_GUARD_RUNTIME_ART_V188, ...QUEEN_MOTHER_CHOIR_RUNTIME_ART_V188];
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
  const historical = [...buildCampaignsWithSpecialOperationsV67(mapped), BLACK_COCOON_CAMPAIGN_V121,
    APC_CONVOY_CAMPAIGN_V121, C12_HORDE_CAMPAIGN_V121, ARCHIVE_RELAY_CAMPAIGN_V122, ...NEW_SPECIAL_CAMPAIGNS_V131];
  assert.equal(historical.length, 455);
  assert.deepEqual(CAMPAIGNS.slice(0, 455), historical);
  // V188 Tantalus lot (specs 005/006/007 + orig-asphodele-2 + colony lot: C1-C4, 7 side missions, 8 contracts)
  const tantalus = [...STATION_CAMPAIGNS_V188, ...ASPHODELE_CAMPAIGNS_V188, ...ACT5_CAMPAIGNS_V188, ...COLONY_CAMPAIGNS_V188];
  assert.equal(tantalus.length, 41);
  assert.deepEqual(CAMPAIGNS.slice(455, 496), tantalus);
  // V190 Xeno Arbiter special operations follow the Tantalus lot in the merged campaign order.
  assert.deepEqual(CAMPAIGNS.slice(496, 502).map(c => c.id), ['special-arbiter-01-freight', 'special-arbiter-02-gallery',
    'special-arbiter-03-custody', 'special-arbiter-04-arbitration', 'special-arbiter-05-isolation', 'special-arbiter-06-local']);
  // The 24 Queen campaigns retain their historical order before the sole Fiorina addition.
  assert.deepEqual(CAMPAIGNS.slice(502, 526), QUEENS_CAMPAIGNS_V188);
  assert.deepEqual(CAMPAIGNS.slice(526), [FIORINA_CAMPAIGN_V114]);
  assert.equal(CAMPAIGNS.filter(c => c.id !== FIORINA_CAMPAIGN_V114.id).length, 526);
  assert.equal(CAMPAIGNS.length, 527);
  assert.equal(new Set(CAMPAIGNS.map(c => c.id)).size, 527);
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
test('colony cards: all eighteen admitted PNGs stay lazy and survive a later network interruption', async () => {
  const h = host(), paths = COLONY_CREW_SLOTS_V188.filter(slot => COLONY_CREW_FILES_PRESENT_V188.includes(slot.id)).map(slot => slot.path);
  assert.equal(paths.length, 18);
  assert.equal(h.calls.length, 0);
  assert.equal((await (await h.caches.open(h.api.CACHE)).keys()).length, 0);
  for (const path of paths) {
    assert.equal(h.api.SHELL.includes(path), false, 'scene art must not increase the mandatory precache');
    assert.equal(h.api.cacheableRequestV143(req(path)), true, path);
  }
  h.network(async request => new Response(`card:${new URL(request.url).pathname}`, { headers: { 'content-type': 'image/png' } }));
  for (const path of paths) {
    const fetched = await h.dispatch('fetch', { request: req(path) });
    assert.equal(fetched.intercepted, true);
    assert.equal(await fetched.value.text(), `card:${path}`);
  }
  assert.equal((await (await h.caches.open(h.api.CACHE)).keys()).length, 18);
  h.network(async () => { throw new Error('offline'); });
  for (const path of paths) assert.equal(await (await h.dispatch('fetch', { request: req(path) })).value.text(), `card:${path}`);
});
test('colony cards: exact paths preserve origin, method and private-request exclusions', async () => {
  const h = host(), path = '/assets/content/v188/colony/quest-apc.png';
  for (const [candidate, options] of [
    ['/assets/content/v188/colony/unreviewed.png', {}], ['/assets/content/v189/colony/quest-apc.png', {}],
    ['/assets/content/v188/colony/quest-apc.webp', {}], ['/assets/content/v188/colony/QUEST-APC.png', {}],
    ['/assets/content/v188/private.png', {}], [`https://foreign.test${path}`, {}], [`${path}?version=1`, {}],
    [path, { method: 'HEAD' }], [path, { method: 'POST', body: 'private' }],
    [path, { cache: 'no-store' }], [path, { headers: { 'cache-control': 'private' } }],
    [path, { headers: { authorization: 'Bearer account-A' } }], [path, { headers: { apikey: 'account-A' } }],
    [path, { headers: { range: 'bytes=0-20' } }]
  ]) {
    const request = req(candidate, options);
    assert.equal(h.api.cacheableRequestV143(request), false, candidate);
    assert.equal((await h.dispatch('fetch', { request })).intercepted, false, candidate);
  }
  assert.equal(h.calls.length, 0);
});
test('colony cards: invalid and newly private responses cannot leave a usable cached copy', async () => {
  const path = '/assets/content/v188/colony/wren-notebooks.png';
  for (const config of [{ private: true }, { mime: 'text/html' }, { status: 206 }, { status: 404 }, { vary: 'Authorization' }, { vary: 'Cookie' }, { vary: '*' }]) {
    const h = host(), request = req(path);
    await h.dispatch('fetch', { request });
    assert.ok(await (await h.caches.open(h.api.CACHE)).match(request));
    h.network(async () => response(path, config));
    await h.dispatch('fetch', { request });
    assert.equal(await (await h.caches.open(h.api.CACHE)).match(request), undefined);
    h.network(async () => { throw new Error('offline'); });
    assert.equal((await h.dispatch('fetch', { request })).value.type, 'error');
  }
});
test('Reviewed scene art: Asphodele, Act V, biological evidence, prologue, Matriarch, MANTA, HADAL, Broodstorm, Queen Mother and adapted guards stay lazy through installation and survive a later network interruption', async () => {
  const h = host();
  assert.equal(h.api.CACHE, 'atf-v143-tantalus-decisions-arsenal-franchise-collier-s1-debat-bioforge-reines-arcs-20261123');
  await h.dispatch('install');
  const cache = await h.caches.open(h.api.CACHE);
  assert.equal(h.api.SHELL.filter(path => path === '/src/biological-art-v188.js').length, 1,
    'the shared presentation module is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/biological-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/prologue-art-v188.js').length, 1,
    'the prologue presentation module is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/prologue-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/port-quay-art-v188.js').length, 1,
    'the playable quay adapter is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/port-quay-art-v188.js')));
  for (const path of ['/src/cargo-matriarch-art-v188.js', '/src/manta-art-v188.js']) {
    assert.equal(h.api.SHELL.filter(entry => entry === path).length, 1,
      'the dedicated creature and vehicle renderers are explicit offline-shell dependencies');
    assert.ok(await cache.match(req(path)));
  }
  assert.equal(h.api.SHELL.filter(path => path === '/src/hadal-player-art-v188.js').length, 1,
    'the contextual HADAL renderer is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/hadal-player-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/broodstorm-queen-art-v188.js').length, 1,
    'the dedicated Broodstorm Queen renderer is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/broodstorm-queen-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/queen-mother-art-v188.js').length, 1,
    'the contextual Queen Mother renderer is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/queen-mother-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/queen-mother-guard-art-v188.js').length, 1,
    'the adapted guard renderer is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/queen-mother-guard-art-v188.js')));
  assert.equal(h.api.SHELL.filter(path => path === '/src/queen-mother-choir-art-v188.js').length, 1,
    'the original local Choir renderer is an explicit offline-shell dependency');
  assert.ok(await cache.match(req('/src/queen-mother-choir-art-v188.js')));
  for (const path of REVIEWED_RUNTIME_ART_V188) {
    assert.equal(h.api.SHELL.includes(path), false, 'scene, mission, hub and cinematic art must not increase the mandatory precache');
    assert.equal(h.calls.some(request => new URL(request.url).pathname === path), false, 'installation must not fetch the image');
    assert.equal(await cache.match(req(path)), undefined);
    assert.equal(h.api.cacheableRequestV143(req(path)), true, path);
  }
  for (const id of ['tomas-wren', 'lucia-ferro', 'adele-sarrazin']) {
    const path = `/assets/colony/v188/${id}.png`;
    assert.equal(h.api.SHELL.includes(path), true, 'existing portrait precache stays intact');
    assert.ok(await cache.match(req(path)));
  }
  h.network(async () => { throw new Error('offline before first view'); });
  for (const path of REVIEWED_RUNTIME_ART_V188) assert.equal((await h.dispatch('fetch', { request: req(path) })).value.type, 'error');
  assert.equal((await cache.keys()).length, h.api.SHELL.length);
  h.network(async request => new Response(`art:${new URL(request.url).pathname}`, { headers: { 'content-type': 'image/png' } }));
  for (const path of REVIEWED_RUNTIME_ART_V188) {
    const fetched = await h.dispatch('fetch', { request: req(path) });
    assert.equal(fetched.intercepted, true);
    assert.equal(await fetched.value.text(), `art:${path}`);
  }
  assert.equal((await cache.keys()).length, h.api.SHELL.length + REVIEWED_RUNTIME_ART_V188.length);
  h.network(async () => { throw new Error('offline after first view'); });
  for (const path of REVIEWED_RUNTIME_ART_V188) assert.equal(await (await h.dispatch('fetch', { request: req(path) })).value.text(), `art:${path}`);
});
test('Reviewed scene art: exact paths reject unreviewed neighbors, out-of-scope hub art and private requests', async () => {
  const h = host(), path = '/assets/content/v188/cassius-core.png';
  for (const [candidate, options] of [
    ['/assets/content/v188/unreviewed.png', {}], ['/assets/content/v188/asphodele-exterior-extra.png', {}],
    ['/assets/content/v188/nested/cassius-core.png', {}], [`${path}/extra.png`, {}],
    ['/assets/content/v189/cassius-core.png', {}], ['/assets/content/v188/cassius-core.webp', {}],
    ['/assets/content/v188/CASSIUS-CORE.png', {}], ['/assets/content/v188/%63assius-core.png', {}],
    ['/assets/asphodele/v188/asph-unreviewed.png', {}], ['/assets/asphodele/v188/asph-npc-unreviewed.png', {}],
    ['/assets/asphodele/v188/asph-unreviewed-shuttle.png', {}],
    ...[...ASPHODELE_HUB_DETAIL_ART_V188, ...ASPHODELE_CINEMATIC_ART_V188].flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/asph-', '/ASPH-'), {}], [artPath.replace('/asph-', '/%61sph-'), {}]
    ]),
    ['/assets/act5/v188/relay-room.png', {}], ['/assets/act5/v188/unreviewed.png', {}],
    ...ACT5_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/act5/', '/ACT5/'), {}], [artPath.replace('/act5/', '/%61ct5/'), {}]
    ]),
    ['/assets/biological/v188/unreviewed.png', {}], ['/assets/biological/v188/human-resin-body.png', {}],
    ...BIOLOGICAL_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/biological/', '/BIOLOGICAL/'), {}], [artPath.replace('/biological/', '/%62iological/'), {}]
    ]),
    ['/assets/prologue/v188/unreviewed.png', {}], ['/assets/prologue/v188/north-quay-diagnosis.png', {}],
    ...PROLOGUE_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/prologue/', '/PROLOGUE/'), {}], [artPath.replace('/prologue/', '/%70rologue/'), {}]
    ]),
    ['/assets/cargo/v188/unreviewed.png', {}], ['/assets/abyss/v188/unreviewed.png', {}],
    ...CARGO_ABYSS_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/cargo/', '/CARGO/').replace('/abyss/', '/ABYSS/'), {}],
      [artPath.replace('/cargo/', '/%63argo/').replace('/abyss/', '/%61byss/'), {}]
    ]),
    ...HADAL_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/hadal-', '/HADAL-'), {}], [artPath.replace('/hadal-', '/%68adal-'), {}]
    ]),
    ['/assets/broodstorm/v188/unreviewed.png', {}],
    ...BROODSTORM_QUEEN_RUNTIME_ART_V188.flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/broodstorm/', '/BROODSTORM/'), {}], [artPath.replace('/broodstorm/', '/%62roodstorm/'), {}]
    ]),
    ['/assets/queen-mother/v188/unreviewed.png', {}],
    ...[...QUEEN_MOTHER_RUNTIME_ART_V188, ...QUEEN_MOTHER_CHOIR_RUNTIME_ART_V188].flatMap(artPath => [
      [artPath.replace(/\.png$/, '-extra.png'), {}], [artPath.replace('/v188/', '/v188/nested/'), {}],
      [artPath.replace('/v188/', '/v189/'), {}], [artPath.replace(/\.png$/, '.webp'), {}],
      [artPath.replace('/queen-mother/', '/QUEEN-MOTHER/'), {}], [artPath.replace('/queen-mother/', '/%71ueen-mother/'), {}]
    ]),
    ['/assets/asphodele/v188/asph-wall-unreviewed.png', {}], ['/assets/asphodele/v188/asph-msn-unreviewed.png', {}],
    ['/assets/asphodele/v188/asph-wall-docks-extra.png', {}], ['/assets/asphodele/v188/nested/asph-wall-docks.png', {}],
    ['/assets/asphodele/v189/asph-wall-docks.png', {}], ['/assets/asphodele/v188/asph-wall-docks.webp', {}],
    ['/assets/asphodele/v188/ASPH-WALL-DOCKS.png', {}], ['/assets/asphodele/v188/%61sph-wall-docks.png', {}],
    ['/assets/asphodele/v188/asph-msn-panel-extra.png', {}], ['/assets/asphodele/v188/nested/asph-msn-panel.png', {}],
    ['/assets/asphodele/v189/asph-msn-panel.png', {}], ['/assets/asphodele/v188/asph-msn-panel.webp', {}],
    ['/assets/asphodele/v188/ASPH-MSN-PANEL.png', {}], ['/assets/asphodele/v188/%61sph-msn-panel.png', {}],
    ...REVIEWED_RUNTIME_ART_V188.flatMap(artPath => [
      [`https://foreign.test${artPath}`, {}], [`${artPath}?version=1`, {}],
      [artPath, { method: 'HEAD' }], [artPath, { method: 'POST', body: 'private' }],
      [artPath, { cache: 'no-store' }], [artPath, { headers: { 'cache-control': 'private' } }],
      [artPath, { headers: { authorization: 'Bearer account-A' } }], [artPath, { headers: { apikey: 'account-A' } }],
      [artPath, { headers: { range: 'bytes=0-20' } }]
    ])
  ]) {
    const request = req(candidate, options);
    assert.equal(h.api.cacheableRequestV143(request), false, candidate);
    assert.equal((await h.dispatch('fetch', { request })).intercepted, false, candidate);
  }
  assert.equal(h.calls.length, 0);
  assert.equal((await (await h.caches.open(h.api.CACHE)).keys()).length, 0);
});
test('Reviewed scene art: invalid and newly private responses remove the older public cached copy', async () => {
  for (const path of REVIEWED_RUNTIME_ART_V188) {
    for (const config of [{ private: true }, { mime: 'text/html' }, { status: 206 }, { status: 404 }, { vary: 'Authorization' }, { vary: 'Cookie' }, { vary: '*' }]) {
      const h = host(), request = req(path);
      await h.dispatch('fetch', { request });
      assert.ok(await (await h.caches.open(h.api.CACHE)).match(request));
      h.network(async () => response(path, config));
      await h.dispatch('fetch', { request });
      assert.equal(await (await h.caches.open(h.api.CACHE)).match(request), undefined);
      h.network(async () => { throw new Error('offline'); });
      assert.equal((await h.dispatch('fetch', { request })).value.type, 'error');
    }
  }
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
test('release workflow, reports and gamedev guidance are source tooling only', () => {
  for (const path of ['.github/workflows/full-release-v143.yml', 'docs/forge/V143-AUDIT-FIXES.md',
    'AGENTS.md', 'docs/development/GAMEDEV_GUIDANCE.md',
    'docs/development/ASPHODELE_HUB_WALL_ART_PROVENANCE_20261117.json',
    'docs/development/ASPHODELE_HUB_WALL_ART_QA_20261117.md',
    'docs/development/ASPHODELE_HUB_WALL_ART_OVERVIEW_20261117.png',
    'docs/development/ASPHODELE_HUB_WALL_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/ASPHODELE_HUB_DETAIL_ART_PROVENANCE_20261117.json',
    'docs/development/ASPHODELE_HUB_DETAIL_ART_QA_20261117.md',
    'docs/development/ASPHODELE_HUB_DETAIL_ART_OVERVIEW_20261117.png',
    'docs/development/ASPHODELE_HUB_DETAIL_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/ASPHODELE_CINEMATIC_ART_PROVENANCE_20261117.json',
    'docs/development/ASPHODELE_CINEMATIC_ART_QA_20261117.md',
    'docs/development/ASPHODELE_CINEMATIC_ART_OVERVIEW_20261117.png',
    'docs/development/ASPHODELE_CINEMATIC_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/ACT5_ART_PROVENANCE_20261117.json',
    'docs/development/ACT5_ART_QA_20261117.md',
    'docs/development/ACT5_ART_OVERVIEW_20261117.png',
    'docs/development/ACT5_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/BIOLOGICAL_ART_PROVENANCE_20261117.json',
    'docs/development/BIOLOGICAL_ART_QA_20261117.md',
    'docs/development/BIOLOGICAL_ART_OVERVIEW_20261117.png',
    'docs/development/BIOLOGICAL_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/PROLOGUE_ART_PROVENANCE_20261117.json',
    'docs/development/PROLOGUE_ART_QA_20261117.md',
    'docs/development/PROLOGUE_ART_OVERVIEW_20261117.png',
    'docs/development/PROLOGUE_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/PORT_QUAY_ART_PROVENANCE_20261117.json',
    'docs/development/PORT_QUAY_ART_QA_20261117.md',
    'docs/development/PORT_QUAY_ART_OVERVIEW_20261117.png',
    'docs/development/PORT_QUAY_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/CARGO_ABYSS_ART_PROVENANCE_20261117.json',
    'docs/development/CARGO_ABYSS_ART_QA_20261117.md',
    'docs/development/CARGO_ABYSS_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/CARGO_ABYSS_ART_OVERVIEW_20261117.png',
    'docs/development/HADAL_ART_PROVENANCE_20261117.json',
    'docs/development/HADAL_ART_QA_20261117.md',
    'docs/development/HADAL_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/HADAL_ART_OVERVIEW_20261117.png',
    'docs/development/BROODSTORM_QUEEN_ART_PROVENANCE_20261117.json',
    'docs/development/BROODSTORM_QUEEN_ART_QA_20261117.md',
    'docs/development/BROODSTORM_QUEEN_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/BROODSTORM_QUEEN_ART_OVERVIEW_20261117.png',
    'docs/development/QUEEN_MOTHER_ART_PROVENANCE_20261117.json',
    'docs/development/QUEEN_MOTHER_ART_QA_20261117.md',
    'docs/development/QUEEN_MOTHER_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/QUEEN_MOTHER_ART_OVERVIEW_20261117.png',
    'docs/development/QUEEN_MOTHER_GUARD_ART_PROVENANCE_20261117.json',
    'docs/development/QUEEN_MOTHER_GUARD_ART_QA_20261117.md',
    'docs/development/QUEEN_MOTHER_GUARD_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/QUEEN_MOTHER_GUARD_ART_OVERVIEW_20261117.png',
    'docs/development/QUEEN_MOTHER_CHOIR_ART_PROVENANCE_20261117.json',
    'docs/development/QUEEN_MOTHER_CHOIR_ART_QA_20261117.md',
    'docs/development/QUEEN_MOTHER_CHOIR_ART_RENDER_RECEIPT_20261117.json',
    'docs/development/QUEEN_MOTHER_CHOIR_ART_OVERVIEW_20261117.png',
    'scripts/verify-cargo-matriarch-art-v188.mjs', 'scripts/verify-manta-art-v188.mjs', 'scripts/verify-hadal-player-art-v188.mjs', 'scripts/verify-broodstorm-queen-art-v188.mjs', 'scripts/verify-queen-mother-art-v188.mjs', 'scripts/verify-queen-mother-guard-art-v188.mjs', 'scripts/verify-queen-mother-choir-art-v188.mjs']) {
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

test('gamedev guidance admission stays exact and rejects unrelated documents', () => {
  assert.equal(isPublicDistributionPathV86('docs/development', { directory: true }), true);
  assert.equal(isPublicDistributionPathV86('docs/development', { directory: true, built: true }), false);
  for (const path of ['docs/development/unreviewed.md', 'docs/development/GAMEDEV_GUIDANCE.md.bak',
    'docs/development/ASPHODELE_HUB_WALL_ART_QA_20261117.md.bak', 'docs/development/ASPHODELE_HUB_WALL_ART_UNREVIEWED_20261117.png',
    'docs/development/ASPHODELE_HUB_DETAIL_ART_QA_20261117.md.bak', 'docs/development/ASPHODELE_HUB_DETAIL_ART_UNREVIEWED_20261117.png',
    'docs/development/ASPHODELE_CINEMATIC_ART_QA_20261117.md.bak', 'docs/development/ASPHODELE_CINEMATIC_ART_UNREVIEWED_20261117.png',
    'docs/development/ACT5_ART_QA_20261117.md.bak', 'docs/development/ACT5_ART_UNREVIEWED_20261117.png',
    'docs/development/BIOLOGICAL_ART_QA_20261117.md.bak', 'docs/development/BIOLOGICAL_ART_UNREVIEWED_20261117.png',
    'docs/development/PROLOGUE_ART_QA_20261117.md.bak', 'docs/development/PROLOGUE_ART_UNREVIEWED_20261117.png',
    'docs/development/PORT_QUAY_ART_QA_20261117.md.bak', 'docs/development/PORT_QUAY_ART_UNREVIEWED_20261117.png',
    'docs/development/CARGO_ABYSS_ART_QA_20261117.md.bak', 'docs/development/CARGO_ABYSS_ART_UNREVIEWED_20261117.png',
    'docs/development/HADAL_ART_QA_20261117.md.bak', 'docs/development/HADAL_ART_UNREVIEWED_20261117.png',
    'docs/development/BROODSTORM_QUEEN_ART_QA_20261117.md.bak', 'docs/development/BROODSTORM_QUEEN_ART_UNREVIEWED_20261117.png',
    'docs/development/QUEEN_MOTHER_ART_QA_20261117.md.bak', 'docs/development/QUEEN_MOTHER_ART_UNREVIEWED_20261117.png',
    'docs/development/QUEEN_MOTHER_GUARD_ART_QA_20261117.md.bak', 'docs/development/QUEEN_MOTHER_GUARD_ART_UNREVIEWED_20261117.png',
    'docs/development/QUEEN_MOTHER_CHOIR_ART_QA_20261117.md.bak', 'docs/development/QUEEN_MOTHER_CHOIR_ART_UNREVIEWED_20261117.png',
    'AGENTS.md.bak', 'src/AGENTS.md', 'docs/development/../private.md']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
});
