import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getXenoTrialsReferencedAssetsV231 } from '../src/xeno-trials-research-art-v231.js';
const directory = 'assets/openai/xeno-trials-v231';
const files = new Map(Object.entries({
  "assets/openai/xeno-trials-v231/predalien-avpr-neutral.png": "dc9dec47f5dccd1c1a42f4390b9cf050ee8b80043f43bed89d77c43f28bab792",
  "assets/openai/xeno-trials-v231/predalien-avpr-select.png": "8a317bc91b466e5ea0f24da4f1d5deb229ee9ec703e84b0ec2a9151b8ce4db17",
  "assets/openai/xeno-trials-v231/predalien-avpr-intro.png": "8b118b863dbe80c3dbcb76b34b9424c1a1d7456646eb3cbcde73d3f90f88f348",
  "assets/openai/xeno-trials-v231/predalien-avpr-victory.png": "7a804377b94601d8530fcbd4f83bae31c02a159363d00b74d68bfd863bcdc04a",
  "assets/openai/xeno-trials-v231/striker-neutral.png": "b44db527d7d533434ecf492a7d2e971a335913ba103fc9a03a85d10fa3cfed90"
}));
export function publicXenoReferencedArtAdmissionV231(path, { directory: isDirectory = false } = {}) {
  if (path !== directory && !path.startsWith(directory + '/')) return null;
  return isDirectory ? path === directory : files.has(path);
}
export async function verifyXenoReferencedArtAdmissionsV231(root) {
  assert.deepEqual(new Set(getXenoTrialsReferencedAssetsV231()), new Set([...files.keys()].map(path => '/' + path)));
  for (const [path, digest] of files) {
    assert.equal((await lstat(join(root, path))).isFile(), true, path);
    assert.equal(createHash('sha256').update(await readFile(join(root, path))).digest('hex'), digest, path);
  }
}
