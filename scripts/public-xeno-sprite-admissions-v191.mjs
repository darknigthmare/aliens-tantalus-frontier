import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_TRIALS_SPRITE_ATLASES_V191 } from '../src/xeno-trials-sprite-atlas-v191.js';

const prefix = 'assets/openai/sprites/xeno-trials-v191';
export const PUBLIC_XENO_SPRITE_PATHS_V191 = Object.freeze([
  ...['defender', 'chrysalis', 'smasher', 'user-brute'].map(id => `${prefix}/${id}-combat-sheet.png`),
  ...['warrior', 'runner', 'prowler', 'spitter'].map(id => `${prefix}/${id}-special-sheet.png`)
]);
const files = new Set(PUBLIC_XENO_SPRITE_PATHS_V191);
export function publicXenoSpritePathAdmissionV191(path, { directory = false } = {}) {
  if (path === prefix) return directory;
  if (!path.startsWith(prefix + '/')) return null;
  return !directory && files.has(path);
}

export async function verifyXenoSpriteAdmissionsV191(root) {
  assert.deepEqual(new Set(XENO_TRIALS_SPRITE_ATLASES_V191.map(atlas => atlas.texture.path.slice(1))), files);
  let totalBytes = 0;
  for (const atlas of XENO_TRIALS_SPRITE_ATLASES_V191) {
    const texture = atlas.texture, bytes = await readFile(join(root, texture.path.slice(1)));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', texture.path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', texture.path);
    assert.equal(bytes.readUInt32BE(16), texture.width, texture.path);
    assert.equal(bytes.readUInt32BE(20), texture.height, texture.path);
    assert.equal(bytes[24], 8, texture.path); assert.equal(bytes[25], 6, texture.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), texture.sha256, texture.path);
    totalBytes += bytes.length;
  }
  return { images: files.size, poses: XENO_TRIALS_SPRITE_ATLASES_V191.reduce((n, atlas) => n + atlas.frames.length, 0), bytes: totalBytes };
}
