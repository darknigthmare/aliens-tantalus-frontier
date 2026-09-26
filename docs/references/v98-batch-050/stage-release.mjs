// Explicit V98 scope. Preserve the independent Ceto edit and private candidates.
// Read-only by default; --stage updates the index but never commits or publishes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { ENEMY_DEDICATED_BATCH_V98 } from '../../../src/enemy-dedicated-batch-v98.js';
const root = process.cwd();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const allowed = [
  'src/enemy-dedicated-batch-v98.js', 'src/enemy-dedicated-poses-v98.js',
  'src/bioforge-level-v80.js', 'src/bioforge-runtime-v80.js', 'src/bioforge-session-v80.js',
  'src/bioforge-ui-v80.js',
  'src/catalog-runtime-v62.js', 'src/game-v51-runtime.js', 'src/game-v52-runtime.js',
  'src/xeno-trials-data-v96.js',
  'scripts/build-asset-filter.mjs', 'scripts/verify-production-v86.mjs', 'sw.js',
  'tests/enemy-dedicated-poses-v98.test.mjs', 'tests/xeno-trials-roster-v98.test.mjs',
  'tests/xeno-trials-engine-v96.test.mjs', 'tests/xeno-trials-selection-v97.test.mjs', 'tests/xeno-trials-ui-v96.test.mjs',
  'tests/bioforge-composition-ui-v87.test.mjs', 'tests/bioforge-mix-v87.test.mjs',
  'tests/bioforge-runtime-v87.test.mjs', 'tests/bioforge-session-v80.test.mjs',
  'tests/enemy-additional-poses-v94.test.mjs', 'tests/enemy-sprite-revisions-v92.test.mjs',
  'tests/enemy-sprite-revisions-v93.test.mjs', 'tests/v50-art.test.mjs',
  'tests/bioforge-app-v80.test.mjs', 'tests/pwa-icons-v68.test.mjs', 'tests/pwa-offline-contract.test.mjs',
  'tests/title-scene-v79.test.mjs', 'tests/user-offline-v95.test.mjs',
  'tests/v84-production-gate.test.mjs', 'tests/v85-production-gate.test.mjs',
  'tests/v88-offline-art-gate.test.mjs', 'tests/v89-offline-art-gate.test.mjs', 'tests/v90-offline-art-gate.test.mjs',
  'docs/V98_RELEASE_20260927.md',
  ...ENEMY_DEDICATED_BATCH_V98.map(p => p.path.slice(1)),
  ...readdirSync('docs/references/v98-batch-050').filter(p =>
    /^(?:generation-[a-z0-9-]+\.json|shard-[abc]\.json|batch-050\.json|ADMISSION\.json|(?:prepare-batch|admit-batch|browser-assets-v98|browser-trials-v98|verify-release|stage-release)\.mjs)$/.test(p))
    .map(p => `docs/references/v98-batch-050/${p}`)
];
const paths = [...new Set(allowed)].sort();
for (const path of paths) assert.ok(existsSync(path), path);
const excluded = new Set(['src/mission-interactive-art-v56.js', 'tests/mission-interactive-art-v56.test.mjs']);
const unexpected = git('diff', '--name-only', '-z').split('\0').filter(p => p && !excluded.has(p) && !paths.includes(p));
assert.deepEqual(unexpected, [], 'Review any new tracked edits before staging');
if (process.argv.includes('--stage')) {
  assert.equal(git('diff', '--cached', '--name-only').trim(), '', 'Refuse to overwrite an existing index');
  const diff = git('diff', '--', 'src/game-v51-runtime.js');
  const header = diff.slice(0, diff.indexOf('@@'));
  const hunks = diff.slice(diff.indexOf('@@')).split(/(?=^@@ )/m);
  const ceto = hunks.filter(h => h.includes('profile.cetoVisibleBands'));
  assert.equal(ceto.length, 1, 'Keep the known independent Ceto hunk out of this commit');
  for (let i = 0; i < paths.length; i += 35) git('add', '--', ...paths.slice(i, i + 35));
  execFileSync('git', ['apply', '--cached', '--reverse', '-'], { cwd: root, input: header + ceto[0], encoding: 'utf8' });
  assert.ok(!git('diff', '--cached', '--', 'src/game-v51-runtime.js').includes('profile.cetoVisibleBands'));
  assert.ok(git('diff', '--', 'src/game-v51-runtime.js').includes('profile.cetoVisibleBands'));
  assert.ok(!git('diff', '--cached', '--name-only').split('\n').some(p => excluded.has(p)));
}
console.log(JSON.stringify({ staged: process.argv.includes('--stage'), files: paths.length,
  bitmaps: ENEMY_DEDICATED_BATCH_V98.length, paths }, null, 2));
