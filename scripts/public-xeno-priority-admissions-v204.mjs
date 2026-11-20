import { XENO_TRIALS_PRIORITY_ATLASES_V204 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_PRIORITY_DIRECTORY_V204 = 'assets/openai/sprites/xeno-trials-v204';
const files = new Set([
  'synth-containment-air-combat-sheet.png', 'smasher-air-combat-sheet.png',
  'synth-tecsek-ground-special-sheet.png', 'import-xeno-kingrogue-ground-special-sheet.png'
].map(name => `${PUBLIC_XENO_PRIORITY_DIRECTORY_V204}/${name}`));

export function publicXenoPriorityPathAdmissionV204(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_PRIORITY_DIRECTORY_V204) return directory;
  if (!path.startsWith(PUBLIC_XENO_PRIORITY_DIRECTORY_V204 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoPriorityAdmissionsV204(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
