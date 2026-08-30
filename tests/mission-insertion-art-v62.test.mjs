import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const ASSETS = [
  'assets/openai/hub/vents/tantalus-duct-interior-v62.png',
  'assets/openai/mission/insertion/tantalus-dropship-approach-v62.png',
  'assets/openai/mission/insertion/tantalus-apc-approach-v62.png',
  'assets/openai/mission/insertion/tantalus-foot-approach-v62.png'
];

function pngSize(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(buffer.subarray(12, 16).toString('ascii'), 'IHDR');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('les quatre décors V62 sont de vrais bitmaps PNG 16:9 exploitables', async () => {
  for (const asset of ASSETS) {
    const [buffer, metadata] = await Promise.all([readFile(asset), stat(asset)]);
    const { width, height } = pngSize(buffer);
    assert.ok(metadata.size > 1_000_000, `${asset} doit contenir un vrai rendu haute définition`);
    assert.ok(width >= 1600 && height >= 900, `${asset} est trop petit: ${width}×${height}`);
    assert.ok(Math.abs((width / height) - (16 / 9)) < 0.02, `${asset} doit rester proche du 16:9`);
  }
});

test('le runtime consomme chaque approche dédiée et le conduit V62', async () => {
  const [app, hub, provenance] = await Promise.all([
    readFile('src/app.js', 'utf8'),
    readFile('src/hub-v62-runtime.js', 'utf8'),
    readFile('docs/ART_PROVENANCE_V62.md', 'utf8')
  ]);
  for (const asset of ASSETS.slice(1)) assert.match(app, new RegExp(asset.split('/').at(-1).replaceAll('.', '\\.')));
  assert.match(hub, /tantalus-duct-interior-v62\.png/);
  for (const asset of ASSETS) assert.match(provenance, new RegExp(asset.replaceAll('/', '\\/').replaceAll('.', '\\.')));
});
