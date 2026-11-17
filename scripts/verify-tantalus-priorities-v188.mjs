import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  TANTALUS_PRIORITIES_BASELINE_V188, TANTALUS_PRIORITIES_SUCCESSORS_V188, TANTALUS_PRIORITIES_CONTINUATION_V188,
  TANTALUS_PRIORITIES_PROLOGUE_V188, TANTALUS_PRIORITIES_SOURCE_ONLY_PATHS_V188, reviewedTantalusPrioritiesDigestV188,
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
  assert.equal(sha(JSON.stringify(TANTALUS_PRIORITIES_SUCCESSORS_V188)), 'c3e771a8bfbc7cabcc78b82747158fb91329da2262b9a6c80262add8562b23da',
    'Every original V188 receipt, including its published endpoint, remains immutable.');
  assert.equal(sha(JSON.stringify(continuation)), '95987803d3d2ecd6292b6764f82b274627e08388e576e4c1b7a7a2e9dca9d005',
    'The complete da8b29fa continuation remains historical.');
  const prologue = TANTALUS_PRIORITIES_PROLOGUE_V188;
  assert.equal(prologue.baseline, 'd54f13cc55983ddb5f55851071c9144198fe1155');
  assert.deepEqual(Object.fromEntries(Object.entries(prologue.successors).map(([path, receipt]) => [path, receipt.previousSha256])), {
    "scripts/qa-black-cocoon-browser-v158.mjs": "ebb81a7deeab1c1a2d8ce47d1f14759889638b9af2f42859ef26119e2f459b0b",
    "scripts/qa-campaign-story-v160.py": "0a6cd23cdcc3bf32e8209258e4920e7897264883e10877401f787f010cde5a4e",
    "scripts/qa-forge-npcs-v158.py": "5c0b24aed9faf3e0921cfdb698735329063f5d93e1bb2a6b49c5c74e9afc677b",
    "scripts/qa-title-compositions-v163.py": "9444fe218aa06dfdef566bf996ebc43c6cd91a6b33a203ec2d3471f2af7b0b1a",
    "scripts/qa-trials-continuity-v163.py": "173f2e35f826970cee84ac967a44715f991efd7665f1dbf46f8c0db384b95e31",
    "scripts/verify-audit-v143.mjs": "9939371033f1654e51a73366a4d129c63f85d0871a40ca7014afe1f228a4fce0",
    "scripts/verify-black-cocoon-presentation-v158.mjs": "635ee8e4463e32676dbd7be409a5f92cb9ed4d40b0ee59097251e90819645b99",
    "scripts/verify-campaign-story-v160.mjs": "55b6b5ac7e045df047ccb6d867905e7cfec44a0f29e9dbda9a74778df9d39cad",
    "scripts/verify-cinematic-coherence-v188.mjs": "5f5bd9495aa0d7e7de6de16ee2f20b0064e4a9fc2ddb54f7f3f0c8ad7d6d72de",
    "scripts/verify-legacy-operations-v131.mjs": "950fbaa2c7b92d1b062ac7b933862c52c7787ca00671e1922213686100ec3e28",
    "scripts/verify-public-release-v86.mjs": "db03102b96ba14c20a265f83e39f1223657a6b2fc38b31f00983eb5fb80a16d5",
    "scripts/verify-story-cinematics-v188.mjs": "66dd489ef35c8ffcb53eee350e1234f34669cfd1f0abb75949a83a47651a295d",
    "src/story-cinematics-v188.js": "921e3a8ae80b0000e1ee4eed5af38bc84312d7458109db879a33ebad1b1221cc",
    "sw.js": "20f87df7565d64fc36ebef8a24ef94695cf41fabcc80a1ee9706fa854615f842"
  });
  assert.deepEqual(Object.keys(prologue.addedSources), ['src/prologue-art-v188.js']);
  assert.equal(Object.isFrozen(prologue.successors), true); assert.equal(Object.isFrozen(prologue.addedSources), true);
  const unique = new Set([...Object.keys(TANTALUS_PRIORITIES_SUCCESSORS_V188), ...Object.keys(continuation.successors), ...Object.keys(prologue.successors)]);
  assert.equal(result.successors, unique.size); assert.equal(result.successors, 122);
  assert.equal(result.addedSources, 2);
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
  for (const [path, receipt] of Object.entries(TANTALUS_PRIORITIES_PROLOGUE_V188.successors)) {
    const anchor = TANTALUS_PRIORITIES_SUCCESSORS_V188[path] || TANTALUS_PRIORITIES_CONTINUATION_V188.successors[path] || receipt;
    assert.equal(reviewedTantalusPrioritiesDigestV188(path, anchor.previousSha256), receipt.currentSha256,
      'The original anchor must resolve through its exact published d54f13cc endpoint: ' + path);
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, '0'.repeat(64)), /Broken .* source chain/);
    assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256), /Broken .* source chain/);
  }
  for (const path of [...Object.keys(TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources), ...Object.keys(TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources)]) {
    assert.throws(() => verifyTantalusPrioritiesV188(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate)), /Unreviewed V188 source bytes/);
  }
  for (const map of [TANTALUS_PRIORITIES_CONTINUATION_V188.successors, TANTALUS_PRIORITIES_CONTINUATION_V188.addedSources,
    TANTALUS_PRIORITIES_PROLOGUE_V188.successors, TANTALUS_PRIORITIES_PROLOGUE_V188.addedSources]) {
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
