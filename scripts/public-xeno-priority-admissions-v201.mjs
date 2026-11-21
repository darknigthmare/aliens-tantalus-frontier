import { XENO_TRIALS_PRIORITY_ATLASES_V201 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_PRIORITY_DIRECTORY_V201 = 'assets/openai/sprites/xeno-trials-v201';
const files = new Set([
  'import-game-afe2-warden-air-combat-sheet.png', 'queen-air-combat-sheet.png',
  'mantis-ground-special-sheet.png', 'synth-sniper-ground-special-sheet.png'
].map(name => `${PUBLIC_XENO_PRIORITY_DIRECTORY_V201}/${name}`));

export function publicXenoPriorityPathAdmissionV201(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_PRIORITY_DIRECTORY_V201) return directory;
  if (!path.startsWith(PUBLIC_XENO_PRIORITY_DIRECTORY_V201 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoPriorityAdmissionsV201(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
