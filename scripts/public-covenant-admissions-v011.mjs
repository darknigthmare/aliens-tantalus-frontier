import { readFileSync } from 'node:fs';
import { COVENANT_SOURCE_V011, COVENANT_PUBLIC_V011, COVENANT_ASSETS_V011,
  COVENANT_MANIFEST_V011, COVENANT_RUNTIME_FILES_V011 } from './build-covenant-v011.mjs';

const SOURCE_FILES = new Set([
  ...COVENANT_RUNTIME_FILES_V011.map(name => COVENANT_SOURCE_V011 + '/' + name),
  COVENANT_SOURCE_V011 + '/bridge.js',
  'modules/covenant/AGENTS.md', 'modules/covenant/package.json', 'modules/covenant/.gitignore',
  'modules/covenant/qa/playthrough.cjs', 'modules/covenant/qa/release-playthrough-v10.cjs',
  'modules/covenant/qa/sprite-v011.test.cjs',
  'scripts/build-covenant-v011.mjs', 'scripts/public-covenant-admissions-v011.mjs',
  'scripts/sync-covenant-sprites-v011.py', 'scripts/verify-covenant-integration-v011.mjs',
  'scripts/qa-covenant-v011.py',
  'docs/covenant/INVENTORY_V011.json', 'docs/covenant/PROVENANCE_V011.json',
  'docs/covenant/SPRITE_PROVENANCE_V011.json', 'docs/covenant/README.md',
  'docs/covenant/SPRITES_V011_STATUS.md', 'docs/covenant/RUNTIME_SOURCE_V011.json',
  '.github/workflows/covenant-v011.yml'
]);
const SOURCE_DIRS = new Set([...SOURCE_FILES].flatMap(file => {
  const parts = file.split('/'); return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'));
}));
let cachedManifest = null, cachedAssets = null;
function admittedAssets() {
  const raw = readFileSync(new URL('../' + COVENANT_MANIFEST_V011, import.meta.url), 'utf8');
  if (raw !== cachedManifest) {
    const value = JSON.parse(raw);
    if (value.schemaVersion !== 1 || !Array.isArray(value.assets)) throw new Error('Invalid Covenant admissions manifest');
    const paths = value.assets.map(row => row.path);
    if (paths.some(p => typeof p !== 'string' || !new RegExp('^/' + COVENANT_ASSETS_V011 + '/[a-z][a-zA-Z0-9-]{0,79}\\.png$').test(p))) {
      throw new Error('Unsafe Covenant image path');
    }
    cachedAssets = new Set(paths.map(p => p.slice(1))); cachedManifest = raw;
  }
  return cachedAssets;
}

export function publicCovenantPathAdmissionV011(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')
    || path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (path === COVENANT_PUBLIC_V011 || path === COVENANT_ASSETS_V011) return directory;
  if (path.startsWith(COVENANT_PUBLIC_V011 + '/')) {
    return !directory && [COVENANT_PUBLIC_V011 + '/index.html', COVENANT_MANIFEST_V011].includes(path);
  }
  if (path === COVENANT_ASSETS_V011 + '/manifest.json') return !directory && !built;
  if (path.startsWith(COVENANT_ASSETS_V011 + '/')) return !directory && admittedAssets().has(path);
  if (SOURCE_FILES.has(path)) return !directory && !built;
  if (path === 'modules/covenant' || path.startsWith('modules/covenant/')
    || path === 'docs/covenant' || path.startsWith('docs/covenant/')) {
    return !built && directory && SOURCE_DIRS.has(path);
  }
  return null;
}
