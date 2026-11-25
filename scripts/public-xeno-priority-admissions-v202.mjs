import { XENO_TRIALS_PRIORITY_ATLASES_V202 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_PRIORITY_DIRECTORY_V202 = 'assets/openai/sprites/xeno-trials-v202';
const files = new Set([
  'prowler-air-combat-sheet.png', 'ravager-air-combat-sheet.png',
  'rhino-ground-special-sheet.png', 'synth-heavy-ground-special-sheet.png'
].map(name => `${PUBLIC_XENO_PRIORITY_DIRECTORY_V202}/${name}`));

export function publicXenoPriorityPathAdmissionV202(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_PRIORITY_DIRECTORY_V202) return directory;
  if (!path.startsWith(PUBLIC_XENO_PRIORITY_DIRECTORY_V202 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoPriorityAdmissionsV202(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
