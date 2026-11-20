import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_TRIALS_ICONIC_STAGES_V194 as stages } from '../src/xeno-trials-iconic-stages-v194.js';

export const PUBLIC_ICONIC_STAGE_DIRECTORY_V194 = 'assets/openai/stages/xeno-trials-v194';
const assets = new Set(stages.flatMap(stage => [stage.backdrop.slice(1), stage.propsV194.path.slice(1)]));

export function publicXenoIconicStagePathAdmissionV194(path, { directory = false } = {}) {
  if (path === PUBLIC_ICONIC_STAGE_DIRECTORY_V194) return directory;
  if (!path.startsWith(PUBLIC_ICONIC_STAGE_DIRECTORY_V194 + '/')) return null;
  return !directory && assets.has(path);
}

async function verifyTexture(root, path, metadata, requireAlpha) {
  const bytes = await readFile(join(root, path));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', path);
  assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', path);
  assert.equal(bytes.readUInt32BE(16), metadata.width, path);
  assert.equal(bytes.readUInt32BE(20), metadata.height, path);
  assert.equal(bytes[24], 8, path);
  assert.ok((requireAlpha ? [6] : [2, 6]).includes(bytes[25]), path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), metadata.sha256, path);
  return bytes.length;
}

export async function verifyXenoIconicStageAdmissionsV194(root) {
  assert.equal(stages.length, 8);
  assert.equal(assets.size, 16);
  assert.equal(new Set(stages.map(stage => stage.id)).size, 8);
  const digests = new Set();
  let bytes = 0;
  for (const stage of stages) {
    assert.match(stage.id, /^xt194-[a-z0-9-]+$/);
    const stem = PUBLIC_ICONIC_STAGE_DIRECTORY_V194 + '/' + stage.id.slice('xt194-'.length);
    const base = stage.atlasV192, props = stage.propsV194;
    assert.equal(stage.backdrop, '/' + stem + '-base.png');
    assert.equal(props.path, '/' + stem + '-props.png');
    bytes += await verifyTexture(root, stem + '-base.png', base, false);
    bytes += await verifyTexture(root, stem + '-props.png', props, true);
    digests.add(base.sha256).add(props.sha256);
    assert.equal(base.sourceRects.length, 2);
    let bottom = 0;
    for (const rect of base.sourceRects) {
      assert.ok(rect.length === 4 && rect.every(Number.isSafeInteger), stage.id);
      const [x, y, w, h] = rect;
      assert.ok(x === 0 && w === base.width && y >= bottom && h > 0 && y + h <= base.height, stage.id);
      bottom = y + h;
    }
    assert.deepEqual(props.rect, [0, 0, props.width, props.height]);
  }
  assert.equal(digests.size, 16);
  return { stages: stages.length, textures: assets.size, imagePlanes: stages.length * 3, bytes };
}
