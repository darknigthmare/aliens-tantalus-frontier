import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';

// V016 recovery is source/catalogue only. Historical integration and rendering
// tests continue to run separately; this file does not replace any V014 check.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitBlobSha = bytes => createHash('sha1')
  .update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
const readJson = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const newBase = 'assets/openai/sprites/alien-covenant-v016';
const historicalPins = new Map([
  ['assets/openai/sprites/alien-covenant-v011/manifest.json', '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923'],
  ['assets/openai/sprites/alien-covenant-v012/manifest.json', 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3'],
  ['assets/openai/sprites/alien-covenant-v013/manifest.json', '5154d1c63b0f70c49bf45aa3ac4d26f00e3962214f58e999fa290fe580843788'],
  ['assets/openai/sprites/alien-covenant-v014/manifest.json', '1fd31f3a6473e95fddb9e3e4dfc41a4938e7bde0454f072472b1f0a7f699e482']
]);
const expectedNewIds = [
  'david-walk-01', 'david-walk-02', 'david-walk-05', 'david-walk-06', 'david-walk-07',
  'prop-covenant-exterior-mast', 'prop-engineer-cryopod-reference',
  'prop-generator-cover-left-concept', 'prop-generator-cover-right-concept',
  'prop-terraforming-capstan-final',
  'vehicle-audi-lunar-quattro-front', 'vehicle-audi-lunar-quattro-patrol',
  'world-juggernaut-broken-stump', 'world-juggernaut-rock-ledge',
  'world-planet4-scorched-grass', 'world-planet4-shore-rock'
].sort();

function pngDimensions(bytes, path) {
  assert.ok(bytes.length >= 33, 'Truncated PNG: ' + path);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'PNG signature: ' + path);
  assert.equal(bytes.readUInt32BE(8), 13, 'PNG IHDR length: ' + path);
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'PNG IHDR chunk: ' + path);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0, 'PNG dimensions: ' + path);
  return { width, height };
}

const allPaths = new Set();
for (const [path, pin] of historicalPins) {
  const bytes = await readFile(join(root, path));
  assert.equal(sha256(bytes), pin, 'Historical production manifest changed: ' + path);
  const source = JSON.parse(bytes.toString('utf8'));
  const base = dirname(path);
  assert.deepEqual((await readdir(join(root, base))).filter(name => name.endsWith('.png')).sort(),
    source.assets.map(row => row.id + '.png').sort(), 'Historical PNG set changed: ' + base);
  for (const row of source.assets) {
    assert.equal(row.path, base + '/' + row.id + '.png');
    assert.equal(allPaths.has(row.path), false, 'Duplicate original: ' + row.path);
    allPaths.add(row.path);
    const image = await readFile(join(root, row.path));
    assert.equal(sha256(image), row.sha256 || row.alphaQA?.sha256, 'Historical PNG changed: ' + row.id);
    assert.equal(image.length, row.bytes, 'Historical PNG size changed: ' + row.id);
  }
}
assert.equal(allPaths.size, 103, 'All 103 reviewed original PNGs must survive');

const runtimePath = 'dlc/covenant/sprites-v011.json';
const runtimeBytes = await readFile(join(root, runtimePath));
assert.equal(sha256(runtimeBytes), 'a557783867c4a15c7fc758a241c0b983778cdaabd3f940c83951d407ed7b3538',
  'Catalogue recovery must not modify the V014 runtime manifest');
const runtime = JSON.parse(runtimeBytes.toString('utf8'));
assert.equal(runtime.release, '0.14.0');
assert.equal(runtime.assets.length, 72);
assert.equal(sha256(Buffer.from(JSON.stringify(runtime.assets))), 'caeb302977542137508ec28728ae78f34096a0c9074008f2fe1123ef47f053c9');
assert.equal(runtime.cycles.length, 5);
assert.equal(runtime.cycles.reduce((sum, cycle) => sum + cycle.frames.length, 0), 40);
assert.equal(sha256(Buffer.from(JSON.stringify(runtime.cycles))), '3a8b96d053d38e84dc8dd60aa211706769deba4364dde57106f75e58d3266226');
assert.ok(runtime.assets.every(row => !row.path.includes('/alien-covenant-v016/')));

const newManifestPath = newBase + '/manifest.json';
const source = await readJson(newManifestPath);
assert.equal(source.schemaVersion, 1);
assert.equal(source.assets.length, 16);
assert.deepEqual(source.assets.map(row => row.id).sort(), expectedNewIds);
assert.deepEqual(source.cycles, [], 'No complete new animation cycle was delivered');
assert.deepEqual((await readdir(join(root, newBase))).filter(name => name.endsWith('.png')).sort(),
  expectedNewIds.map(id => id + '.png'));
let newBytes = 0;
for (const row of source.assets) {
  assert.equal(row.path, newBase + '/' + row.id + '.png');
  assert.equal(allPaths.has(row.path), false, 'Duplicate cumulative path: ' + row.path);
  allPaths.add(row.path);
  assert.equal(row.runtimeAdmission, 'catalogue-only', 'Unreviewed runtime admission: ' + row.id);
  assert.equal(row.verified1to1, false, 'No generated image is certified 1:1: ' + row.id);
  assert.match(row.sha256, /^[a-f0-9]{64}$/, 'Missing source SHA-256: ' + row.id);
  assert.match(row.gitBlobSha, /^[a-f0-9]{40}$/, 'Missing source Git blob SHA: ' + row.id);
  const image = await readFile(join(root, row.path));
  newBytes += image.length;
  assert.equal(image.length, row.bytes, 'Recovered PNG byte size: ' + row.id);
  assert.equal(sha256(image), row.sha256, 'Recovered PNG SHA-256: ' + row.id);
  assert.equal(gitBlobSha(image), row.gitBlobSha, 'Recovered PNG Git blob SHA: ' + row.id);
  assert.deepEqual(pngDimensions(image, row.path), { width: row.width, height: row.height });
  assert.equal(admit(row.path, { built: false }), true, 'Catalogue source admission: ' + row.id);
  assert.equal(admit(row.path, { built: true }), false, 'Catalogue PNG leaked to distribution: ' + row.id);
}
assert.equal(allPaths.size, 119);
assert.equal(allPaths.size - runtime.assets.length, 47);
assert.equal(admit(newManifestPath, { built: false }), true);
assert.equal(admit(newManifestPath, { built: true }), false);
assert.equal(admit(newBase + '/unknown.png', { built: false }), false);
assert.equal(admit(newBase + '/unknown.png', { built: true }), false);
assert.equal(admit(newBase + '/../outside.png', { built: false }), false);
assert.equal(source.assets.filter(row => row.id.startsWith('david-walk-')).length, 5);

const expectedSummary = {
  newPngs: 16, newRuntimePngs: 0, newCataloguePngs: 16, cumulativePngs: 119,
  runtimePngs: 72, cataloguePngs: 47, completeCycles: 5, completeCyclePhases: 40
};
for (const [key, value] of Object.entries(expectedSummary)) {
  if (source.summary && Object.hasOwn(source.summary, key)) {
    assert.equal(source.summary[key], value, 'Stale production summary: ' + key);
  }
}
console.log(JSON.stringify({
  passed: true, historicalOriginalPngs: 103, recoveredCataloguePngs: 16,
  cumulativePngs: 119, runtimePngs: 72, cataloguePngs: 47,
  completeCycles: 5, completeCyclePhases: 40, newBytes,
  runtimeUnchanged: true, generatedAnimationPhasesAddedToRuntime: 0
}, null, 2));
