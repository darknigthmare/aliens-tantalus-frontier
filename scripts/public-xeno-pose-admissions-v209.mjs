import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 } from './audit-xeno-production-assets-v206.mjs';
import { getXenoTrialsPoseAssetsV209 } from '../src/xeno-trials-poses-v209.js';

const rootDirectory = 'assets/openai/xeno-trials-v209';
export const PUBLIC_XENO_POSE_DIRECTORIES_V209 = Object.freeze([rootDirectory, rootDirectory + '/characters']);
const approved = new Map([
  'arachnoid-heavy-windup.png', 'arachnoid-heavy-impact.png', 'arachnoid-heavy-recovery.png', 'arachnoid-special-active-grounded.png',
  'panther-special-windup.png', 'panther-special-active.png', 'panther-special-recovery.png'
].map(name => {
  const origin = XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206[`assets/openai/xeno-trials-v206/characters/${name}`];
  assert.equal(origin?.kind, 'production-asset', 'V209 pose must have a production receipt: ' + name);
  return [`${rootDirectory}/characters/${name}`, origin.sha256];
}));

export function publicXenoPosePathAdmissionV209(path, { directory = false } = {}) {
  if (path !== rootDirectory && !path.startsWith(rootDirectory + '/')) return null;
  return directory ? PUBLIC_XENO_POSE_DIRECTORIES_V209.includes(path) : approved.has(path);
}

export async function verifyXenoPoseAdmissionsV209(root) {
  assert.deepEqual(new Set(getXenoTrialsPoseAssetsV209()), new Set([...approved.keys()].map(path => '/' + path)),
    'The V209 pose registry must use exactly the admitted files.');
  for (const [path, sha256] of approved) {
    const file = join(root, path);
    assert.ok((await lstat(file)).isFile(), 'V209 pose must be a regular file: ' + path);
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), sha256,
      'V209 pose bytes differ from the approved production image: ' + path);
  }
}
