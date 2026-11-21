import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_TRIALS_ORIGINAL_ARENAS_V193 as arenas } from '../src/xeno-trials-original-arenas-v193.js';

const rootPath = 'assets/openai/stages/xeno-trials-v193';
export const PUBLIC_XENO_ORIGINAL_ARENA_DIRECTORIES_V193 = Object.freeze([
  rootPath, ...['industrial', 'colony', 'frontier'].map(group => rootPath + '/' + group)
]);
const directories = new Set(PUBLIC_XENO_ORIGINAL_ARENA_DIRECTORIES_V193);
const files = new Map(arenas.map(arena => [arena.backdrop.slice(1), arena]));

export function publicXenoOriginalArenaPathAdmissionV193(path, { directory = false } = {}) {
  if (path !== rootPath && !path.startsWith(rootPath + '/')) return null;
  return directory ? directories.has(path) : files.has(path);
}

export async function verifyXenoOriginalArenaAdmissionsV193(root) {
  assert.equal(arenas.length, 12);
  assert.equal(new Set(arenas.map(arena => arena.id)).size, 12);
  assert.equal(files.size, 12);
  assert.equal(new Set(arenas.map(arena => arena.atlasV192.sha256)).size, 12);
  let totalBytes = 0;
  for (const [path, arena] of files) {
    assert.ok(arena.id.startsWith('xt193-'), arena.id);
    assert.equal(arena.stageRevision, 193, arena.id);
    assert.equal(path.split('/').at(-1), arena.id.slice('xt193-'.length) + '.png');
    assert.ok(directories.has(path.slice(0, path.lastIndexOf('/'))), path);
    const { width, height, sha256, sourceRects } = arena.atlasV192;
    const bytes = await readFile(join(root, path));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', path);
    assert.equal(bytes.readUInt32BE(16), width, path);
    assert.equal(bytes.readUInt32BE(20), height, path);
    assert.equal(bytes[24], 8, path);
    assert.ok([2, 6].includes(bytes[25]), path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, path);
    assert.equal(sourceRects.length, 3, path);
    let bottom = 0;
    for (const rect of sourceRects) {
      assert.ok(rect.length === 4 && rect.every(Number.isSafeInteger), path);
      const [x, y, cropWidth, cropHeight] = rect;
      assert.ok(x === 0 && cropWidth === width && y >= bottom && cropHeight > 0 && y + cropHeight <= height, path);
      bottom = y + cropHeight;
    }
    totalBytes += bytes.length;
  }
  return { images: files.size, imagePlanes: files.size * 3, bytes: totalBytes };
}
