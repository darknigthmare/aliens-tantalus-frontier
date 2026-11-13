import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';

const prefix = 'assets/openai/sprites/xeno-trials-v189';
const files = new Set([
  ...['queen', 'crusher-acm', 'ravager', 'burster'].map(id => `${prefix}/${id}-combat-sheet.png`),
  ...['warrior', 'runner', 'prowler', 'spitter'].map(id => `${prefix}/${id}-motion-sheet.png`)
]);
export function publicXenoSpritePathAdmissionV189(path, { directory = false } = {}) {
  if (path === prefix) return directory;
  if (!path.startsWith(prefix + '/')) return null;
  return !directory && files.has(path);
}

export async function verifyXenoSpriteAdmissionsV189(root) {
  assert.deepEqual(new Set(XENO_TRIALS_SPRITE_ATLASES_V189.map(atlas => atlas.texture.path.slice(1))), files);
  for (const atlas of XENO_TRIALS_SPRITE_ATLASES_V189) {
    const texture = atlas.texture, bytes = await readFile(join(root, texture.path.slice(1)));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', texture.path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', texture.path);
    assert.equal(bytes.readUInt32BE(16), texture.width, texture.path);
    assert.equal(bytes.readUInt32BE(20), texture.height, texture.path);
    assert.equal(bytes[24], 8, 'The reviewed sheet retains eight-bit RGBA pixels');
    assert.equal(bytes[25], 6, texture.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), texture.sha256, texture.path);
  }
  return files.size;
}
