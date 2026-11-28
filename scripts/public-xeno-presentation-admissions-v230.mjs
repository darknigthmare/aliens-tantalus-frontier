import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XENO_TRIALS_PRESENTATION_PLATES_V230 } from '../src/xeno-trials-presentation-art-v230.js';

const directory = 'assets/openai/xeno-trials-v230';
const admitted = new Map([
  [directory + '/warrior-select.png', '469b8c02f9b21df04aca935f65852f365b0ea51abcbe94735ac2965ffe116471'],
  [directory + '/warrior-intro.png', '9efcd828be3067c83a73f4b3214ddeaf7bea057bbfec0f85d26b276342647d7e'],
]);

export function publicXenoPresentationAdmissionV230(path, { directory: isDirectory = false } = {}) {
  if (path !== directory && !path.startsWith(directory + '/')) return null;
  return isDirectory ? path === directory : admitted.has(path);
}

export async function verifyXenoPresentationAdmissionsV230(root) {
  assert.deepEqual(new Set(XENO_TRIALS_PRESENTATION_PLATES_V230.map(plate => plate.path.slice(1))), new Set(admitted.keys()));
  for (const [path, digest] of admitted) {
    assert.equal((await lstat(join(root, path))).isFile(), true, path);
    assert.equal(createHash('sha256').update(await readFile(join(root, path))).digest('hex'), digest, path);
  }
}
