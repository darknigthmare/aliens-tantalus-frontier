import { XENO_TRIALS_ACTION_ATLASES_V199 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_ACTION_DIRECTORY_V199 = 'assets/openai/sprites/xeno-trials-v199';
const files = new Set([
  'warrior-air-combat-sheet.png', 'runner-air-combat-sheet.png',
  'drive-v123-fte-pathogen-brute-profile-v13-super-sheet.png',
  'drive-v123-fte-pathogen-queen-right-v13-super-sheet.png'
].map(name => `${PUBLIC_XENO_ACTION_DIRECTORY_V199}/${name}`));

export function publicXenoActionPathAdmissionV199(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_ACTION_DIRECTORY_V199) return directory;
  if (!path.startsWith(PUBLIC_XENO_ACTION_DIRECTORY_V199 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoActionAdmissionsV199(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
