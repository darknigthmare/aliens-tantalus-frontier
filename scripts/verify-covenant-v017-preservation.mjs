import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';

// Active V017 successor. V016's exact historical verifier remains unchanged.
// This verifies source preservation/admission; browser motion QA runs separately.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { compileManifest } = require('../modules/covenant/dlc/covenant/sprite-registry-v011.js');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitBlobSha = bytes => createHash('sha1')
  .update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
const readJson = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const newBase = 'assets/openai/sprites/alien-covenant-v017';
const previousBase = 'assets/openai/sprites/alien-covenant-v016';
const sourceOnlyBase = 'assets/openai/sprites/alien-covenant-v015';
const historicalPins = new Map([
  ['assets/openai/sprites/alien-covenant-v011/manifest.json', '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923'],
  ['assets/openai/sprites/alien-covenant-v012/manifest.json', 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3'],
  ['assets/openai/sprites/alien-covenant-v013/manifest.json', '5154d1c63b0f70c49bf45aa3ac4d26f00e3962214f58e999fa290fe580843788'],
  ['assets/openai/sprites/alien-covenant-v014/manifest.json', '1fd31f3a6473e95fddb9e3e4dfc41a4938e7bde0454f072472b1f0a7f699e482'],
  [sourceOnlyBase + '/manifest.json', '0b6679217b73a5c07c43e7384ada3a31f080bbb33d618f61c74331a46c9ddb62'],
  [previousBase + '/manifest.json', '6e166985008494e08f2b528368d0ffa53ae299f59634f91a7b0e9941df607c6a']
]);
const historicalDocumentPins = new Map([
  ['docs/covenant/BIBLE_COVENANT_V015.html', '6733e8a929bb7fc513bcc4690118592aa275eb59a86f03efeab7f8a983ee4f1e'],
  ['docs/covenant/BIBLE_COVENANT_V015.json', '1fa0e0a235148347252eb6d94f80086705bf614f75de6cfc7d3f6ecd3a2a47a1'],
  ['docs/covenant/BIBLE_COVENANT_V015.md', '15dedfd844560f2084a95ecdcd2293ee4cfa6cb17ca87450e61e8cb17732e938'],
  ['docs/covenant/BIBLE_COVENANT_V016.html', 'b21ee9f7a3f39565907475e92e990985db48d9578bcdd162e1f5fdd5b0c2e001'],
  ['docs/covenant/BIBLE_COVENANT_V016.json', 'c7160711a97a15c495db71d64d326ab7d7173395d83f136015a2aab4b2a8e5ad'],
  ['docs/covenant/BIBLE_COVENANT_V016.md', '6438ff038ee3be7a37a080274bc88838cbe96b56f40583399695a3bb1ed3a036'],
  ['docs/covenant/BIBLE_COVENANT_V016.xlsx', 'c40a25f5e0404e3fa591d27f0c481d27657cf6b689f88e4f34b46f9b9ac9d85f'],
  ['docs/covenant/CONTINUATION_V016.md', '33929eb22ca78e43430d1baefc93c7ed764760f43684c07b60ee4ac3b852cb45'],
  // Upstream convergence receipt from commit 6c2d610b7faf9ed88fc6c6977a98411ad1880940.
  ['docs/covenant/PROVENANCE_V015.json', '9bbdf1780800a156eb567f89a3d1b6d86bb4697a49d720ad1eaf4a80a21e9965'],
  ['docs/covenant/PROVENANCE_V016.json', '904b6d313e93f06fa5d50b5ed6e7f6bd377923ba2035fb8828edbe33f70cd98a'],
  ['docs/covenant/SPRITES_V015_STATUS.md', '70eebd76a068d9b9aea76092db2a7bdfbe816ef723362ce802567ebb6d92fe95'],
  ['docs/covenant/SPRITES_V016_STATUS.md', 'fd941b03742a53794c24ed9aa541370f9df59553311f7fb3d25ea4ea93bf4382']
]);
const nativePins = new Map([
  ['modules/covenant/dlc/covenant/content.js', 'bb75178f8beaa504e393251c44a2aceec851318175642082cf4b5b6d90c4e680'],
  ['modules/covenant/dlc/covenant/core.js', '6052d2b6ce8c31308f55512126f72613133e206dc937afcfd196e2699d92fadf'],
  ['modules/covenant/dlc/covenant/fidelity.js', '6daaa693b3be6d86c1fc9c167b6f631d209961990beca82c8eba4e5afde16fce']
]);
const frozenToolPins = new Map([
  ['scripts/verify-covenant-v016-recovery.mjs', 'b6f25d85e005668127267ad50299f7f33d61ccad26214fe8e1fcdde0ceb12366'],
  ['scripts/build-covenant-bible-v016.py', '63d1ac2e9ffaba7047759402cdd39f5bca2f8804d49c5bc804c5b6d80bf1d544'],
  ['scripts/build-covenant-bible-v016.mjs', '148e0f2f1b8e7bba8b4d85d2aa46d8338c0eb1f41222cba944f2e8b5751eb076']
]);
const upworthIds = Array.from({ length: 8 }, (_, i) => 'upworth-walk-' + String(i + 1).padStart(2, '0'));
const worldIds = [
  'prop-juggernaut-pilot-chair-production', 'prop-juggernaut-bay-iris-closed',
  'prop-juggernaut-bay-iris-open', 'prop-colonist-cryopod-vertical',
  'prop-cryopod-hanging-yoke-production'
];
const expectedNewIds = [...upworthIds, ...worldIds].sort();

function pngDimensions(bytes, path) {
  assert.ok(bytes.length >= 33, 'Truncated PNG: ' + path);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'PNG signature: ' + path);
  assert.equal(bytes.readUInt32BE(8), 13, 'PNG IHDR length: ' + path);
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'PNG IHDR chunk: ' + path);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0, 'PNG dimensions: ' + path);
  return { width, height };
}
function noCertification(value, where) {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (key === 'verified1to1') assert.equal(item, false, 'Unjustified 1:1 certification: ' + where);
    if (item && typeof item === 'object') noCertification(item, where + '/' + key);
  }
}

const runtime = await readJson('dlc/covenant/sprites-v011.json');
assert.equal(runtime.release, '0.17.0');
assert.equal(runtime.assets.length, 81);
assert.equal(runtime.cycles.length, 6);
assert.equal(runtime.cycles.reduce((sum, c) => sum + c.frames.length, 0), 48);
const runtimeIds = new Set(runtime.assets.map(row => row.id));
const historicalRuntime = runtime.assets.filter(row => !row.path.startsWith('/' + previousBase + '/')
  && !row.path.startsWith('/' + newBase + '/'));
assert.equal(historicalRuntime.length, 72);
assert.equal(sha256(Buffer.from(JSON.stringify(historicalRuntime))),
  'caeb302977542137508ec28728ae78f34096a0c9074008f2fe1123ef47f053c9', 'The 72 historical bindings changed');
const historicalCycles = runtime.cycles.filter(c => c.id !== 'upworth-walk');
assert.equal(historicalCycles.length, 5);
assert.equal(sha256(Buffer.from(JSON.stringify(historicalCycles))),
  '3a8b96d053d38e84dc8dd60aa211706769deba4364dde57106f75e58d3266226', 'The five historical cycles changed');
assert.equal(runtime.assets.some(row => row.path.startsWith('/' + sourceOnlyBase + '/')), false);
const rockBindings = runtime.assets.filter(row => row.path.startsWith('/' + previousBase + '/'));
assert.equal(rockBindings.length, 1);
const rock = rockBindings[0];
assert.deepEqual({ id: rock.id, kind: rock.kind, key: rock.key, state: rock.state, rooms: rock.rooms },
  { id: 'world-planet4-shore-rock', kind: 'prop', key: 'landing-light2', state: 'idle', rooms: ['landing'] });
assert.deepEqual(rock.alphaBounds, [51, 176, 1723, 801]);
assert.deepEqual(rock.anchor, [887, 801]);
const upworthBindings = runtime.assets.filter(row => row.path.startsWith('/' + newBase + '/'));
assert.deepEqual(upworthBindings.map(row => row.id).sort(), upworthIds);
for (const row of upworthBindings) {
  assert.equal(row.kind, 'human'); assert.equal(row.key, 'upworth'); assert.equal(row.state, 'walk');
  assert.deepEqual(row.rooms, ['comms']); assert.deepEqual(row.actors, ['upworth-comms']);
}
const upworthCycle = runtime.cycles.find(c => c.id === 'upworth-walk');
assert.equal(upworthCycle.kind, 'human'); assert.equal(upworthCycle.key, 'upworth');
assert.equal(upworthCycle.state, 'walk'); assert.equal(upworthCycle.consumer, 'npc');
assert.deepEqual(upworthCycle.frames, upworthIds);
assert.deepEqual(upworthCycle.actors, ['upworth-comms']);
assert.ok(Number.isFinite(upworthCycle.angularFrequency) && upworthCycle.angularFrequency > 0
  && upworthCycle.angularFrequency <= 11);
assert.equal(compileManifest(runtime).entries.length, 81);
noCertification(runtime, 'runtime');

const allPaths = new Set(), originals = new Map(), historicalCounts = [];
async function verifyAsset(row, base, expectedPublic) {
  assert.match(row.id, /^[a-z][a-zA-Z0-9-]{0,79}$/);
  assert.equal(row.path, base + '/' + row.id + '.png');
  assert.equal(allPaths.has(row.path), false, 'Duplicate original path: ' + row.path);
  assert.equal(originals.has(row.id), false, 'Duplicate original identity: ' + row.id);
  allPaths.add(row.path); originals.set(row.id, row);
  assert.equal(row.verified1to1, false);
  assert.match(row.sha256 || row.alphaQA?.sha256 || '', /^[a-f0-9]{64}$/);
  assert.match(row.gitBlobSha || '', /^[a-f0-9]{40}$/);
  const image = await readFile(join(root, row.path));
  assert.equal(image.length, row.bytes, 'Original PNG byte size: ' + row.id);
  assert.equal(sha256(image), row.sha256 || row.alphaQA?.sha256, 'Original PNG SHA-256: ' + row.id);
  assert.equal(gitBlobSha(image), row.gitBlobSha, 'Original PNG Git blob SHA: ' + row.id);
  assert.deepEqual(pngDimensions(image, row.path), { width: row.width, height: row.height });
  assert.equal(admit(row.path, { built: false }), true, 'Source admission: ' + row.id);
  assert.equal(admit(row.path, { built: true }), expectedPublic, 'Distribution admission: ' + row.id);
  return image.length;
}
for (const [path, pin] of historicalPins) {
  const bytes = await readFile(join(root, path));
  assert.equal(sha256(bytes), pin, 'Historical production manifest changed: ' + path);
  const source = JSON.parse(bytes.toString('utf8')), base = dirname(path);
  assert.equal(source.schemaVersion, 1); noCertification(source, path);
  assert.deepEqual((await readdir(join(root, base))).filter(name => name.endsWith('.png')).sort(),
    source.assets.map(row => row.id + '.png').sort(), 'Historical PNG set changed: ' + base);
  for (const row of source.assets) {
    if ([sourceOnlyBase, previousBase].includes(base)) assert.equal(row.runtimeAdmission, 'catalogue-only');
    await verifyAsset(row, base, runtimeIds.has(row.id));
  }
  historicalCounts.push(source.assets.length);
  assert.equal(admit(path, { built: false }), true);
  assert.equal(admit(path, { built: true }), false);
}
assert.deepEqual(historicalCounts, [49, 12, 24, 18, 22, 16]);
assert.equal(allPaths.size, 141);
assert.equal(admit(sourceOnlyBase, { directory: true, built: false }), true);
assert.equal(admit(sourceOnlyBase, { directory: true, built: true }), false);

const newManifestPath = newBase + '/manifest.json';
const source = await readJson(newManifestPath);
assert.equal(source.schemaVersion, 1);
assert.equal(source.assets.length, 13);
assert.deepEqual(source.assets.map(row => row.id).sort(), expectedNewIds);
assert.deepEqual((await readdir(join(root, newBase))).filter(name => name.endsWith('.png')).sort(),
  expectedNewIds.map(id => id + '.png'));
assert.equal(source.cycles.length, 1);
assert.deepEqual(source.cycles[0], upworthCycle, 'The declared V017 cycle differs from the actual admitted cycle');
assert.equal(source.runtimePromotions.length, 1);
const promotion = source.runtimePromotions[0];
assert.equal(promotion.assetId, 'world-planet4-shore-rock');
assert.equal(promotion.sourceManifest, previousBase + '/manifest.json');
assert.equal(promotion.instance, 'landing-light2');
assert.deepEqual(promotion.rooms, ['landing']);
assert.equal(promotion.runtimeAdmission, 'instance-scoped');
let newBytes = 0;
for (const row of source.assets) {
  const active = upworthIds.includes(row.id);
  assert.equal(row.runtimeAdmission, active ? 'npc-cycle-frame' : 'catalogue-only');
  if (active) {
    assert.equal(row.kind, 'human'); assert.equal(row.rendererKey, 'upworth'); assert.equal(row.state, 'walk');
    assert.deepEqual(row.rooms, ['comms']); assert.deepEqual(row.actors, ['upworth-comms']);
  }
  newBytes += await verifyAsset(row, newBase, active);
}
assert.equal(allPaths.size, 154);
assert.equal(allPaths.size - runtime.assets.length, 73);
assert.equal(admit(newManifestPath, { built: false }), true);
assert.equal(admit(newManifestPath, { built: true }), false);
for (const base of [sourceOnlyBase, previousBase, newBase]) {
  for (const built of [false, true]) {
    assert.equal(admit(base + '/unknown.png', { built }), false);
    assert.equal(admit(base + '/unknown.txt', { built }), false);
    assert.equal(admit(base + '/../outside.png', { built }), false);
  }
}
for (const row of runtime.assets) {
  const original = originals.get(row.id);
  assert.ok(original, 'Runtime image lacks original provenance: ' + row.id);
  assert.equal(row.path, '/' + original.path);
  for (const key of ['bytes', 'width', 'height']) assert.equal(row[key], original[key]);
  assert.equal(row.sha256, original.sha256 || original.alphaQA?.sha256);
}
for (const [path, pin] of [...historicalDocumentPins, ...nativePins, ...frozenToolPins]) {
  assert.equal(sha256(await readFile(join(root, path))), pin, 'Protected historical source changed: ' + path);
  assert.equal(admit(path, { built: false }), true, 'Protected source admission: ' + path);
  assert.equal(admit(path, { built: true }), false, 'Protected source leaked to distribution: ' + path);
}
const finalPaths = [
  'scripts/build-covenant-bible-v017.py', 'scripts/build-covenant-bible-v017.mjs',
  'scripts/verify-covenant-v017-preservation.mjs',
  ...['json', 'md', 'html', 'xlsx'].map(ext => 'docs/covenant/BIBLE_COVENANT_V017.' + ext)
];
for (const path of finalPaths) {
  assert.ok((await readFile(join(root, path))).length > 0, 'Missing final source: ' + path);
  assert.equal(admit(path, { built: false }), true, 'Final source not admitted: ' + path);
  assert.equal(admit(path, { built: true }), false, 'Final source leaked to distribution: ' + path);
}
const bible = await readJson('docs/covenant/BIBLE_COVENANT_V017.json');
noCertification(bible, 'V017 bible');
const expectedSummary = {
  referenceEntries: 315, pngs: 154, newPngs: 13, runtimePngs: 81, catalogueOnlyPngs: 73,
  playerWalkCycles: 4, npcWalkCycles: 2, servedCycles: 6, animationPhases: 48,
  publishedWalkCycles: 8, publishedAnimationPhases: 64,
  availableUnintegratedNpcCycles: 2, availableUnintegratedNpcPhases: 16,
  incompleteCharacterSequencePngs: 5, animationImagesIncludingIncomplete: 69,
  movingNpcProfilesWithoutIntegratedWalkPng: 14, movingNpcProfilesWithoutPublishedWalkPng: 12,
  humanIdentitiesInProfiles: 17, certified1to1Images: 0
};
for (const [key, value] of Object.entries(expectedSummary)) assert.equal(bible.summary[key], value, 'Bible summary: ' + key);
for (const [key, value] of Object.entries({ newPngs: 13, cumulativePngs: 154, runtimePngs: 81, cataloguePngs: 73 })) {
  if (Object.hasOwn(source.summary || {}, key)) assert.equal(source.summary[key], value, 'Manifest summary: ' + key);
}
for (const version of ['V015', 'V016']) {
  const old = await readJson('docs/covenant/BIBLE_COVENANT_' + version + '.json');
  for (const domain of ['referenceRegister', 'characterProfiles', 'rooms', 'weaponFamilies', 'propFamilies',
    'supplementalCandidates', 'vehicles', 'ships', 'worldComponents', 'terrains', 'planets',
    'connections', 'thresholds', 'propInstances']) {
    const byId = new Map(bible[domain].map(row => [row.id, row]));
    for (const row of old[domain]) {
      assert.ok(byId.has(row.id), 'Historical bible ID lost: ' + domain + '/' + row.id);
      if (row.productionBriefV016) assert.deepEqual(byId.get(row.id).productionBriefV016, row.productionBriefV016);
      if (row.currentV015Update) assert.deepEqual(byId.get(row.id).currentV015Update, row.currentV015Update);
      if (domain === 'propInstances') assert.deepEqual(byId.get(row.id).sourceDefinition, row.sourceDefinition);
      if (domain === 'connections' || domain === 'thresholds') assert.deepEqual(byId.get(row.id), row);
    }
  }
}
assert.ok(bible.continuationV017.productionBriefCount >= 257);
for (const key of ['ricks', 'oram']) {
  const profile = bible.characterProfiles.find(p => p.id === key);
  assert.equal(profile.walkCycles.length, 0);
  assert.equal(profile.catalogueWalkCyclesV017.length, 1);
  assert.equal(profile.catalogueWalkCyclesV017[0].runtimeEnabled, false);
  assert.equal(runtime.assets.some(a => a.id.startsWith(key + '-walk-')), false);
}
assert.equal(bible.characterProfiles.find(p => p.id === 'david').walkCycles.length, 0);
assert.deepEqual([...originals.keys()].filter(id => id.startsWith('david-walk-')).sort(),
  ['david-walk-01', 'david-walk-02', 'david-walk-05', 'david-walk-06', 'david-walk-07']);
const occurrence = bible.propInstances.find(p => p.id === 'landing-light2');
assert.equal(occurrence.selectedPngId, 'world-planet4-shore-rock');
assert.equal(occurrence.runtimeEligibleWhenVisibleAndLoaded, true);
assert.deepEqual(occurrence.sourceDefinition,
  { id: 'landing-light2', kind: 'rock', x: 1750, z: 0.02, w: 110, h: 65, solid: false });
console.log(JSON.stringify({
  passed: true, historicalOriginalPngs: 141, historicalManifestPins: historicalPins.size,
  historicalDocumentPins: historicalDocumentPins.size, newOriginalPngs: 13,
  frozenBuilderAndVerifierPins: frozenToolPins.size,
  cumulativePngs: 154, runtimePngs: 81, cataloguePngs: 73,
  historicalBindingsPreserved: 72, historicalCyclesPreserved: 5,
  runtimeCycles: 6, runtimePhases: 48, publishedCycles: 8, publishedPhases: 64,
  unintegratedV015Cycles: 2, unintegratedV015Phases: 16, incompleteDavidPoses: 5,
  generatedAnimationPhasesAddedToRuntime: 8, previousCataloguePromotions: 1,
  sourceOnlyV015: true, nativeSimulationUnchanged: true, newBytes
}, null, 2));

