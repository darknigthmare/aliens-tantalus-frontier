import { XENO_TRIALS_SUPER_ATLASES_V200 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { verifyXenoAtlasFiles } from './public-xeno-sprite-admissions-v197.mjs';

export const PUBLIC_XENO_SUPER_DIRECTORY_V200 = 'assets/openai/sprites/xeno-trials-v200';
const files = new Set(['warden', 'exploder', 'harbinger'].map(id => `${PUBLIC_XENO_SUPER_DIRECTORY_V200}/import-game-afe2-${id}-super-sheet.png`));

export function publicXenoSuperPathAdmissionV200(path, { directory = false } = {}) {
  if (path === PUBLIC_XENO_SUPER_DIRECTORY_V200) return directory;
  if (!path.startsWith(PUBLIC_XENO_SUPER_DIRECTORY_V200 + '/')) return null;
  return !directory && files.has(path);
}

export function verifyXenoSuperAdmissionsV200(root) {
  return verifyXenoAtlasFiles(root, atlases, files);
}
