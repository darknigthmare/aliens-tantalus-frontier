import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// These are production pose atlases, not QA screenshots. Admit only these
// exact original PNG bytes; filenames containing "capture" remain private
// everywhere else, including other files in this directory.
export const PUBLIC_CAPTURE_ASSETS_V163 = Object.freeze([
  ['wy-commando', 'da2072736df8042d6caa78ffe27bf46e710ba4f560fd228cd626fadf7e2fb759', 2102273],
  ['guardian', '7fabe100a127b49700da39a9f6cce532c59a14952ea11caa847c85b51c4242e0', 2145877],
  ['cultist', 'fb5e228a589df436f674e97bfc56fb7d8c178a8073419112b1a99b3a3d5b17d4', 2085682]
].map(([id, sha256, bytes]) => Object.freeze({ path: `assets/openai/sprites/trials-v163/${id}-capture-v163.png`, sha256, bytes })));
const directoryPath = 'assets/openai/sprites/trials-v163';
export function publicReleasePathAdmissionV163(path, { directory = false } = {}) {
  if (path === directoryPath) return directory;
  if (!path.startsWith(directoryPath + '/')) return null;
  return !directory && PUBLIC_CAPTURE_ASSETS_V163.some(asset => asset.path === path);
}
export async function verifyPublicAdmissionsV163(root) {
  for (const asset of PUBLIC_CAPTURE_ASSETS_V163) {
    const bytes = await readFile(join(root, asset.path));
    if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
      throw new Error('V163 native capture bytes differ: ' + asset.path);
  }
  return { originalAtlases: 3, canonicalApproval: false };
}
