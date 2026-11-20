import { XENO_TRIALS_PRIORITY_ATLASES_V203 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_PRIORITY_DIRECTORY_V203 = 'assets/openai/sprites/xeno-trials-v203';
const files = new Set([
  'chrysalis-air-combat-sheet.png', 'razor-claws-air-combat-sheet.png',
  'armored-joe-ground-special-sheet.png', 'synth-good-boy-ground-special-sheet.png'
].map(name => `${PUBLIC_XENO_PRIORITY_DIRECTORY_V203}/${name}`));

export function publicXenoPriorityPathAdmissionV203(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_PRIORITY_DIRECTORY_V203) return directory;
  if (!path.startsWith(PUBLIC_XENO_PRIORITY_DIRECTORY_V203 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoPriorityAdmissionsV203(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
