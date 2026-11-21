import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_TRIALS_CORPORATE_STAGES_V190 } from '../src/xeno-trials-stage-scenes-v190.js';
import { CAMPAIGN_ART_ASSETS_V190 } from '../src/campaign-art-v190.js';

// Only these five reviewed PNGs are admitted, never neighboring candidates.
export const PUBLIC_ARBITER_IMAGES_V190 = Object.freeze([
  {
    "path": "assets/openai/stages/xeno-trials-v190/arbitration-gallery-atlas.png",
    "width": 1254,
    "height": 1254,
    "bytes": 1642463,
    "colorType": 6,
    "sha256": "675a800f85be1829d9b7f0dcd5616d249a04df224339322064017e7d51112dc5"
  },
  {
    "path": "assets/openai/stages/xeno-trials-v190/containment-rail-atlas.png",
    "width": 1254,
    "height": 1254,
    "bytes": 1381394,
    "colorType": 6,
    "sha256": "c582de5de305c399d0aa50ab3a62efd8b265487542bee634fdcf947ea52e222d"
  },
  {
    "path": "assets/openai/stages/xeno-trials-v190/secured-cargo-atlas.png",
    "width": 1254,
    "height": 1254,
    "bytes": 1529137,
    "colorType": 6,
    "sha256": "45a35d8614bbeb52a9890bf2513cc5a0e3b28da4fc5317309d722b9616755f22"
  },
  {
    "path": "assets/openai/stages/xeno-trials-v190/council-server-atlas.png",
    "width": 1254,
    "height": 1254,
    "bytes": 1752771,
    "colorType": 6,
    "sha256": "9d2938344b1bd67d10e39710cefb0da5e97ddf26900917ee1251a565218bf04f"
  },
  {
    "path": "assets/openai/campaign/xeno-arbiter-v190/arbiter-recovery.png",
    "width": 1672,
    "height": 941,
    "bytes": 2266447,
    "colorType": 2,
    "sha256": "7a166494b72948ea997fc0fb20e951b4ab2154046e4656e277e794c3ce9ec431"
  }
].map(row => Object.freeze(row)));
const prefixes = ['assets/openai/stages/xeno-trials-v190', 'assets/openai/campaign/xeno-arbiter-v190'];
const files = new Set(PUBLIC_ARBITER_IMAGES_V190.map(row => row.path));
export function publicArbiterPathAdmissionV190(path, { directory = false } = {}) {
  for (const prefix of prefixes) {
    if (path === prefix) return directory;
    if (path.startsWith(prefix + '/')) return !directory && files.has(path);
  }
  return null;
}
export async function verifyArbiterImageAdmissionsV190(root) {
  assert.deepEqual(new Set([...XENO_TRIALS_CORPORATE_STAGES_V190.map(stage => stage.backdrop.slice(1)),
    ...CAMPAIGN_ART_ASSETS_V190.map(art => art.path.slice(1))]), files);
  for (const row of PUBLIC_ARBITER_IMAGES_V190) {
    const bytes = await readFile(join(root, row.path));
    assert.equal(bytes.length, row.bytes, row.path);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', row.path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', row.path);
    assert.equal(bytes.readUInt32BE(16), row.width, row.path);
    assert.equal(bytes.readUInt32BE(20), row.height, row.path);
    assert.equal(bytes[24], 8, row.path);
    assert.equal(bytes[25], row.colorType, row.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
  }
  return { images: files.size, bytes: PUBLIC_ARBITER_IMAGES_V190.reduce((sum, row) => sum + row.bytes, 0) };
}
