import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// This continuation has one selected catalogue sprite and one unselected
// documentary candidate. Both remain source-only, including their directories.
export const COVENANT_ARCHITECTURE_ROOT_V018 = 'assets/openai/sprites/alien-covenant-v018';
export const COVENANT_ARCHITECTURE_MANIFEST_V018 = COVENANT_ARCHITECTURE_ROOT_V018 + '/manifest.json';
export const COVENANT_ARCHITECTURE_CANDIDATE_ROOT_V018 = 'docs/covenant/v018-candidates';
const QA_ROOT = 'docs/covenant/qa/v018';
const EXPECTED_MANIFEST_SHA256 = '071eed8d03b782e5cb5a379cf17229fd9869b2334b865c43a18c9925889962d4';
const reviewedBytes = new Map([
  [COVENANT_ARCHITECTURE_MANIFEST_V018, EXPECTED_MANIFEST_SHA256],
  [COVENANT_ARCHITECTURE_ROOT_V018 + '/prop-covenant-terraforming-side-airlock.png', 'cc292e5458b1f0f91a0559c232773f736e1a88c49041450fb16641441e787f59'],
  [COVENANT_ARCHITECTURE_CANDIDATE_ROOT_V018 + '/prop-covenant-terraforming-main-doors-closed.png', 'd5b0b101e6a22bd95c6ab4a4722cf250ce6bed3a6e715fc969446e6388e6a9db']
]);
export const COVENANT_ARCHITECTURE_SOURCE_FILES_V018 = Object.freeze([
  ...reviewedBytes.keys(),
  'docs/covenant/BIBLE_COVENANT_V018.json',
  'docs/covenant/BIBLE_COVENANT_V018.md',
  'docs/covenant/BIBLE_COVENANT_V018.html',
  'docs/covenant/PROVENANCE_V018.json',
  'docs/covenant/SPRITES_V018_STATUS.md',
  QA_ROOT + '/alpha.json', QA_ROOT + '/browser.json', QA_ROOT + '/catalogue-desktop.png',
  'scripts/build-covenant-bible-v018.py',
  'scripts/public-covenant-architecture-v018.mjs',
  'scripts/verify-covenant-v018.mjs',
  'scripts/verify-covenant-v018-alpha.py',
  'scripts/qa-covenant-catalogue-v018.py',
  '.github/workflows/covenant-v018-architecture.yml'
]);
const files = new Set(COVENANT_ARCHITECTURE_SOURCE_FILES_V018);
const roots = [COVENANT_ARCHITECTURE_ROOT_V018, COVENANT_ARCHITECTURE_CANDIDATE_ROOT_V018, QA_ROOT];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function reviewedCovenantArchitectureBytesV018(path, bytes, { built = false } = {}) {
  return !built && reviewedBytes.has(path) && bytes instanceof Uint8Array
    && sha256(bytes) === reviewedBytes.get(path);
}

export function compileCovenantArchitectureV018(bytes) {
  assert.equal(reviewedCovenantArchitectureBytesV018(COVENANT_ARCHITECTURE_MANIFEST_V018, bytes), true,
    'Unreviewed Covenant V018 manifest bytes');
  const value = JSON.parse(Buffer.from(bytes).toString('utf8'));
  assert.equal(value.assets.length, 1);
  assert.equal(value.assets[0].productionSelected, true);
  assert.equal(value.assets[0].runtimeAdmission, 'catalogue-only');
  assert.equal(value.documentaryCandidates.length, 1);
  assert.equal(value.documentaryCandidates[0].productionSelected, false);
  assert.equal(value.documentaryCandidates[0].runtimeAdmission, 'documentary-candidate-only');
  assert.equal(value.documentaryCandidates[0].visualReview.status, 'revision-required');
  assert.equal(value.verified1to1, false);
  return value;
}

export function covenantArchitecturePathAdmissionV018(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')
    || path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (files.has(path)) return !built && !directory;
  if (roots.includes(path) || path === 'docs/covenant/qa') return !built && directory;
  if (roots.some(root => path.startsWith(root + '/'))) return false;
  return null;
}
