import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  TANTALUS_PRIORITIES_BASELINE_V188, TANTALUS_PRIORITIES_SUCCESSORS_V188, TANTALUS_PRIORITIES_CONTINUATION_V188,
  TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188, reviewedTantalusPrioritiesDigestV188,
  verifyTantalusPrioritiesV188
} from './audit-tantalus-priorities-v188.mjs';
import { verifyNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V188 verifies every reviewed successor and keeps the V187 chain intact', () => {
  assert.equal(TANTALUS_PRIORITIES_BASELINE_V188, '803db26dbd7ed453d9534eee237806053438f300');
  const result = verifyTantalusPrioritiesV188();
  const continuation = TANTALUS_PRIORITIES_CONTINUATION_V188;
  assert.equal(continuation.baseline, 'da8b29fa4b7688d18686b1e28be4065c3a821d3b');
  assert.equal(Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188).length, 106);
  assert.equal(sha(JSON.stringify(Object.fromEntries(Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)
    .map(([path, receipt]) => [path, receipt.previousSha256])))),
    '6ce2d3c74d91671fc8bc505faca829297e43b2ce6e19e038e97680af7a0d897c', 'Every original historical predecessor remains immutable.');
  assert.deepEqual(Object.fromEntries(Object.entries(continuation.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    "scripts/verify-audit-continuation-v158.mjs": "87ca45b2c3c48d96e9ae02f4a57241b723372e3e12cd172ef4f978f34ba3eb98",
    "scripts/verify-black-cocoon-presentation-v158.mjs": "96029dc66cb8781bd30bd91482dbfbc7466679020fd22420784e7baaac43bfa5",
    "scripts/verify-cinematic-coherence-v188.mjs": "fd1f943ea6b50c339073a936eaed60dafa0618b472988353b93edd31d106d07f",
    "scripts/verify-dropship-handover-v188.mjs": "3f644dcaf173647081d3f1dab2c8fd642fc82d6839a7d1b26de129e567a3ca05",
    "scripts/verify-qz17-coherence-v188.mjs": "c06ba96c8b6e400f71da707ba18beed8c9f47afffb867d432c704bc8f2f92fcd",
    "scripts/verify-story-cinematics-v188.mjs": "4047f1f7607812751ea8314f81e0cfa5171fc5cf43abd3f3e6afd62f478aeaa6",
    "src/black-cocoon-presentation-v158.js": "69169757f789461886aed3788b79e5ba9adcbd8bfa41b5cab81af85ff0be0767",
    "src/mission-dropship-handover-v188.js": "ea7aba8f264a931fe71de296b444f2c7810c214f7b825f6f7e56c11865f17b95",
    "src/qz17-level-dressing-v188.js": "2a5ad6d33e9ecabd0d26a7510b19d1ab396927516491d8a636ffc2aacd33806b",
    "src/story-cinematics-v188.js": "1b0783003a58b4dca02193b6c9048750b068ac99c3023534479786f6009c6465"
  });
  assert.deepEqual(Object.keys(continuation.addedSources), ['src/biological-art-v188.js']);
  assert.equal(Object.isFrozen(continuation.successors), true);
  assert.equal(Object.isFrozen(continuation.addedSources), true);
  assert.equal(result.successors, Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188).length + Object.keys(continuation.successors).length);
  assert.equal(result.addedSources, 1);
  assert.deepEqual(verifyNativeQaResourcesV187(), { successors: 8, preserved: 7 });
});

test('V188 rejects mutated bytes and arbitrary predecessor endpoints', () => {
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_SUCCESSORS_V188)) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken V187-to-V188 source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken V187-to-V188 source chain/);
  }
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_CONTINUATION_V188.successors)) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken published-V188 source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken published-V188 source chain/);
  }
  for (const path of Object.keys(TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources)) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
  }
  for (const map of [TANTALUS_PRIORITIES_CONTINUATION_V188.successors, TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources]) {
    assert.equal(Object.hasOwn(map, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  }
  assert.equal(reviewedTantalusPrioritiesDigestV188('src/unreviewed.js', 'unchanged'), 'unchanged');
  assert.equal(Object.hasOwn(TANTALUS_PRIORITIES_SUCCESSORS_V188, 'scripts/audit-tantalus-priorities-v188.mjs'), false);
  const terminal = read('scripts/audit-tantalus-priorities-v188.mjs').toString();
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(terminal), false, 'The terminal audit must not import another audit.');
});

test('V188 audit and adopted AI tooling stay source-only with exact upstream bytes', () => {
  for (const path of TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    read(path);
  }
  const manifest = JSON.parse(read('.ai-tools/adopted-v188.json'));
  assert.deepEqual(manifest.tools.map(tool => tool.tool), ['spec_kit', 'claude_game_studios']);
  const sources = JSON.parse(read('.ai-tools/sources.json')).tools;
  assert.equal(manifest.tools[0].commit, sources.spec_kit.commit);
  assert.equal(manifest.tools[1].commit, sources.claude_game_studios.commit);
  for (const tool of manifest.tools) for (const { path, sha256 } of tool.files) {
    assert.equal(sha(read(path)), sha256, 'Adopted tooling differs from its staged bytes: ' + path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['.claude/unreviewed.md', '.specify/unreviewed.sh', 'studio-tests/unreviewed.md',
    'docs/engine-reference/unreviewed.md', 'scripts/audit-tantalus-unreviewed-v188.mjs']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
  }
  const files = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  assert.equal(files.filter(path => path === 'scripts/verify-tantalus-priorities-v188.mjs').length, 1);
});
