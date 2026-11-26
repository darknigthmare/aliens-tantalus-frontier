import { existsSync, readFileSync } from 'node:fs';
import { COVENANT_SOURCE_V011, COVENANT_PUBLIC_V011, COVENANT_ASSETS_V011,
  COVENANT_ASSET_ROOTS, COVENANT_MANIFEST_V011, COVENANT_RUNTIME_FILES_V011,
  COVENANT_SOURCE_ONLY_ASSETS_V015, COVENANT_SOURCE_ONLY_PROVENANCE_V015 } from './build-covenant-v011.mjs';

const SOURCE_FILES = new Set([
  'scripts/package-covenant-sprites-v017.py',
  'scripts/qa-covenant-catalogue-v017.py',
  'scripts/build-covenant-bible-v017.py',
  'scripts/build-covenant-bible-v017.mjs',
  'scripts/verify-covenant-v017-preservation.mjs',
  'docs/covenant/PROVENANCE_V017.json',
  'docs/covenant/SPRITES_V017_STATUS.md',
  'docs/covenant/CONTINUATION_V017.md',
  'docs/covenant/BIBLE_COVENANT_V017.json',
  'docs/covenant/BIBLE_COVENANT_V017.md',
  'docs/covenant/BIBLE_COVENANT_V017.html',
  'docs/covenant/BIBLE_COVENANT_V017.xlsx',
  '.github/workflows/covenant-v017-bible.yml',
  'scripts/package-covenant-sprites-v016.py',
  'scripts/qa-covenant-catalogue-v016.py',
  'docs/covenant/PROVENANCE_V016.json',
  'docs/covenant/SPRITES_V016_STATUS.md',
  'docs/covenant/BIBLE_COVENANT_V016.xlsx',

  'scripts/build-covenant-bible-v016.py',
  'scripts/build-covenant-bible-v016.mjs',
  'scripts/verify-covenant-v016-recovery.mjs',
  'docs/covenant/CONTINUATION_V016.md',
  'docs/covenant/BIBLE_COVENANT_V016.json',
  'docs/covenant/BIBLE_COVENANT_V016.md',
  'docs/covenant/BIBLE_COVENANT_V016.html',
  ...COVENANT_RUNTIME_FILES_V011.map(name => COVENANT_SOURCE_V011 + '/' + name),
  COVENANT_SOURCE_V011 + '/bridge.js',
  'modules/covenant/AGENTS.md', 'modules/covenant/package.json', 'modules/covenant/.gitignore',
  'modules/covenant/qa/playthrough.cjs', 'modules/covenant/qa/release-playthrough-v10.cjs',
  'modules/covenant/qa/sprite-v011.test.cjs',
  'scripts/build-covenant-v011.mjs', 'scripts/public-covenant-admissions-v011.mjs',
  'scripts/sync-covenant-sprites-v011.py', 'scripts/verify-covenant-integration-v011.mjs',
  'scripts/package-covenant-sprites-v011.py', 'scripts/package-covenant-sprites-v012.py',
  'scripts/package-covenant-sprites-v013.py',
  'scripts/package-covenant-sprites-v014.py',
  'scripts/build-covenant-bible-v014.py',
  'scripts/build-covenant-bible-v014.mjs',
  'scripts/verify-covenant-sprites-v011.mjs',
  'scripts/qa-covenant-v011.py', 'scripts/qa-covenant-catalogue-v012.py',
  'scripts/qa-covenant-catalogue-v013.py',
  'scripts/qa-covenant-catalogue-v014.py',
  'docs/covenant/INVENTORY_V011.json', 'docs/covenant/PROVENANCE_V011.json',
  'docs/covenant/SPRITE_PROVENANCE_V011.json', 'docs/covenant/README.md',
  'docs/covenant/SPRITES_V011_STATUS.md', 'docs/covenant/RUNTIME_SOURCE_V011.json',
  'docs/covenant/PROVENANCE_V012.json', 'docs/covenant/SPRITES_V012_STATUS.md',
  'docs/covenant/PROVENANCE_V013.json', 'docs/covenant/SPRITES_V013_STATUS.md',
  'docs/covenant/PROVENANCE_V014.json', 'docs/covenant/SPRITES_V014_STATUS.md',
  'docs/covenant/BIBLE_COVENANT_V014.md', 'docs/covenant/BIBLE_COVENANT_V014.json',
  'docs/covenant/BIBLE_COVENANT_V014.html', 'docs/covenant/BIBLE_COVENANT_V014.xlsx',
  'docs/covenant/PROVENANCE_V015.json', 'docs/covenant/SPRITES_V015_STATUS.md',
  'docs/covenant/BIBLE_COVENANT_V015.md', 'docs/covenant/BIBLE_COVENANT_V015.json',
  'docs/covenant/BIBLE_COVENANT_V015.html',
  '.github/workflows/covenant-v011.yml'
]);
const SOURCE_DIRS = new Set([...SOURCE_FILES].flatMap(file => {
  const parts = file.split('/');
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
}));
// Only these 22 recovered originals are part of the V015 preservation release.
const SOURCE_ONLY_PNG_PATHS_V015 = new Set([
  'ricks-walk-01',
  'ricks-walk-02',
  'ricks-walk-03',
  'ricks-walk-04',
  'ricks-walk-05',
  'ricks-walk-06',
  'ricks-walk-07',
  'ricks-walk-08',
  'oram-walk-01',
  'oram-walk-02',
  'oram-walk-03',
  'oram-walk-04',
  'oram-walk-05',
  'oram-walk-06',
  'oram-walk-07',
  'oram-walk-08',
  'prop-seat-covenant-bridge',
  'prop-seat-lander',
  'prop-holotable-covenant-bridge',
  'prop-medbay-table',
  'prop-console-covenant-bridge',
  'prop-console-lander-main'
].map(id => COVENANT_SOURCE_ONLY_ASSETS_V015 + '/' + id + '.png'));
const cache = new Map();

function admittedAssets(built) {
  const manifests = built ? [COVENANT_MANIFEST_V011]
    : [...COVENANT_ASSET_ROOTS.map(base => base + '/manifest.json'), COVENANT_SOURCE_ONLY_PROVENANCE_V015];
  const assets = new Set();
  for (const manifestPath of manifests) {
    const url = new URL('../' + manifestPath, import.meta.url);
    if (!built && manifestPath !== COVENANT_ASSETS_V011 + '/manifest.json' && !existsSync(url)) continue;
    const raw = readFileSync(url, 'utf8');
    const previous = cache.get(manifestPath);
    let current = previous?.raw === raw ? previous.assets : null;
    if (!current) {
      const value = JSON.parse(raw);
      if (value.schemaVersion !== 1 || !Array.isArray(value.assets)) {
        throw new Error('Invalid Covenant admissions manifest');
      }
      const paths = value.assets.map(row => {
        if (typeof row.path !== 'string') throw new Error('Missing Covenant image path');
        return row.path.startsWith('/') ? row.path.slice(1) : row.path;
      });
      const roots = built ? COVENANT_ASSET_ROOTS : [manifestPath.slice(0, -'/manifest.json'.length)];
      const patterns = roots.map(base => new RegExp('^' + base + '/[a-z][a-zA-Z0-9-]{0,79}\\.png$'));
      if (paths.some(path => !patterns.some(pattern => pattern.test(path)))) throw new Error('Unsafe Covenant image path');
      if (new Set(paths).size !== paths.length) throw new Error('Duplicate Covenant image admission');
      current = new Set(paths);
      cache.set(manifestPath, { raw, assets: current });
    }
    for (const path of current) {
      if (assets.has(path)) throw new Error('Duplicate Covenant image admission');
      assets.add(path);
    }
  }
  return assets;
}

export function publicCovenantPathAdmissionV011(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')
    || path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  // Intercept the entire V015 tree before the host's general image policy.
  // Its reviewed originals are archived in source; none may enter a built release.
  if (path === COVENANT_SOURCE_ONLY_ASSETS_V015) return !built && directory;
  if (path.startsWith(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/')) {
    return !built && !directory && (path === COVENANT_SOURCE_ONLY_PROVENANCE_V015
      || SOURCE_ONLY_PNG_PATHS_V015.has(path) && admittedAssets(false).has(path));
  }
  if (path === COVENANT_PUBLIC_V011 || COVENANT_ASSET_ROOTS.includes(path)) return directory;
  if (path.startsWith(COVENANT_PUBLIC_V011 + '/')) {
    return !directory && [COVENANT_PUBLIC_V011 + '/index.html', COVENANT_MANIFEST_V011].includes(path);
  }
  if (COVENANT_ASSET_ROOTS.some(base => path === base + '/manifest.json')) return !directory && !built;
  if (COVENANT_ASSET_ROOTS.some(base => path.startsWith(base + '/'))) return !directory && admittedAssets(built).has(path);
  if (SOURCE_FILES.has(path)) return !directory && !built;
  if (path === 'modules/covenant' || path.startsWith('modules/covenant/')
    || path === 'docs/covenant' || path.startsWith('docs/covenant/')) {
    return !built && directory && SOURCE_DIRS.has(path);
  }
  return null;
}
