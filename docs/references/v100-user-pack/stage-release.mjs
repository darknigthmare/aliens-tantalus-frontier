import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { USER_REFERENCE_LIBRARY_V100 } from '../../../src/user-reference-library-v100.js';
const root = process.cwd();
const git = (...args) => execFileSync('git', ['-c', 'safe.directory=' + root.replaceAll('\\', '/'), ...args], {cwd: root, encoding: 'utf8'});
const paths = [
  "src/user-pack-v100.js",
  "src/user-reference-library-v100.js",
  "src/user-reference-recovery-v100.js",
  "src/enemy-physical-size-v100.js",
  "user-reference-library-v100.css",
  "tests/user-reference-library-v100.test.mjs",
  "tests/user-reference-recovery-v100.test.mjs",
  "tests/enemy-physical-size-v100.test.mjs",
  "scripts/import-user-pack-v100.mjs",
  "src/app.js",
  "src/catalog-runtime-v62.js",
  "src/catalog-ui-v62.js",
  "scripts/build-asset-filter.mjs",
  "scripts/build.mjs",
  "scripts/dev.mjs",
  "index.html",
  "sw.js",
  "docs/V100_IMPORTS_20260930.md",
  "docs/references/v100-user-pack/CLASSIFICATION.json",
  "docs/references/v100-user-pack/CLASSIFICATION.md",
  "docs/references/v100-user-pack/verify-release.mjs",
  "tests/bioforge-app-v80.test.mjs",
  "scripts/verify-production-v86.mjs",
  "tests/enemy-dedicated-poses-v99.test.mjs",
  "tests/enemy-dedicated-poses-v98.test.mjs",
  "tests/pwa-icons-v68.test.mjs",
  "tests/pwa-offline-contract.test.mjs",
  "tests/title-scene-v79.test.mjs",
  "tests/user-offline-v95.test.mjs",
  "tests/v84-production-gate.test.mjs",
  "tests/v85-production-gate.test.mjs",
  "tests/v88-offline-art-gate.test.mjs",
  "tests/v89-offline-art-gate.test.mjs",
  "tests/v90-offline-art-gate.test.mjs"
];
paths.push('docs/references/v100-user-pack/stage-release.mjs');
paths.push('docs/references/v100-user-pack/serve-build.mjs');
paths.push('docs/references/v100-user-pack/VALIDATION-20260930.json');
if (existsSync('docs/references/v100-user-pack/browser-reference-library-v100.mjs')) paths.push('docs/references/v100-user-pack/browser-reference-library-v100.mjs');
paths.push(...USER_REFERENCE_LIBRARY_V100.filter(entry => /\/(pack|recovery)-v100\//.test(entry.path)).map(entry => entry.path.slice(1)));
for (const path of paths) assert.ok(existsSync(path), path);
if (process.argv.includes('--stage')) {
  assert.equal(git('diff', '--cached', '--name-only').trim(), '', 'Preserve any existing index');
  for (let index = 0; index < paths.length; index += 30) git('add', '--', ...paths.slice(index, index + 30));
  const actual = git('diff', '--cached', '--name-only').trim().split('\n');
  assert.ok(actual.every(path => paths.includes(path)), 'Unexpected staged path');
  assert.ok(!actual.includes('src/game-v51-runtime.js') && !actual.includes('src/mission-interactive-art-v56.js'));
}
console.log(JSON.stringify({ staged: process.argv.includes('--stage'), count: paths.length, paths }, null, 2));
