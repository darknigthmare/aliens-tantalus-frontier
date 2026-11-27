import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_TRIALS_RESEARCH_MEDIA_V210 } from '../src/xeno-trials-research-media-v210.js';

const root = 'assets/openai/xeno-trials-v210';
const directory = root + '/research';
export const PUBLIC_XENO_RESEARCH_DIRECTORIES_V210 = Object.freeze([root, directory]);
const files = new Set(['guard-plates.png', 'specimen-plates.png'].map(name => `${directory}/${name}`));

export function publicXenoResearchPathAdmissionV210(path, { directory = false } = {}) {
  if (path !== root && !path.startsWith(root + '/')) return null;
  return directory ? PUBLIC_XENO_RESEARCH_DIRECTORIES_V210.includes(path) : files.has(path);
}

export async function verifyXenoResearchAdmissionsV210(projectRoot) {
  const media = XENO_TRIALS_RESEARCH_MEDIA_V210;
  assert.equal(media.length, files.size, 'V210 research media must declare both approved atlases.');
  assert.deepEqual(new Set(media.map(row => row.path)), new Set([...files].map(path => '/' + path)));
  for (const { path, sha256 } of media) {
    assert.match(sha256, /^[a-f0-9]{64}$/);
    const file = join(projectRoot, path.slice(1));
    assert.ok((await lstat(file)).isFile(), 'V210 research atlas must be a regular file: ' + path);
    const bytes = await readFile(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, 'Changed V210 research atlas: ' + path);
    assert.ok(bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      && bytes.readUInt32BE(8) === 13 && bytes.toString('ascii', 12, 16) === 'IHDR', 'Invalid V210 PNG atlas: ' + path);
  }
}
