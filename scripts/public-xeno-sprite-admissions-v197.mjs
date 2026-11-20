import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_TRIALS_SPRITE_ATLASES_V197 as atlases } from '../src/xeno-trials-sprite-atlas-v191.js';

export const PUBLIC_XENO_SPRITE_DIRECTORY_V197 = 'assets/openai/sprites/xeno-trials-v197';
const files = new Set(['synth-trooper', 'synth-guard', 'import-game-afe2-warden']
  .map(id => `${PUBLIC_XENO_SPRITE_DIRECTORY_V197}/${id}-combat-sheet.png`));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export function publicXenoSpritePathAdmissionV197(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_SPRITE_DIRECTORY_V197) return directory;
  if (!path.startsWith(PUBLIC_XENO_SPRITE_DIRECTORY_V197 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoSpriteAdmissionsV197(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}

export async function verifyXenoAtlasFiles(root, atlases, files) {
  assert.equal(atlases.length, files.size);
  assert.deepEqual(new Set(atlases.map(atlas => atlas.texture.path.slice(1))), files);
  assert.equal(new Set(atlases.map(atlas => atlas.texture.sha256)).size, files.size);
  let bytes = 0;
  for (const atlas of atlases) {
    const { texture, sourcePose } = atlas;
    const data = await readFile(join(root, texture.path.slice(1)));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', texture.path);
    assert.equal(data.subarray(12, 16).toString(), 'IHDR', texture.path);
    assert.equal(data.readUInt32BE(16), texture.width, texture.path);
    assert.equal(data.readUInt32BE(20), texture.height, texture.path);
    assert.deepEqual([...data.subarray(24, 26)], [8, 6], texture.path);
    assert.equal(hash(data), texture.sha256, texture.path);
    assert.equal(hash(await readFile(join(root, sourcePose.path.slice(1)))), sourcePose.sha256, sourcePose.path);
    bytes += data.length;
  }
  return { images: files.size, poses: atlases.reduce((sum, atlas) => sum + atlas.frames.length, 0), bytes };
}
