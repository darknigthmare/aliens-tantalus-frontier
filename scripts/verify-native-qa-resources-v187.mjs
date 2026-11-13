import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  NATIVE_QA_RESOURCES_BASELINE_V187, NATIVE_QA_RESOURCES_SUCCESSORS_V187,
  NATIVE_QA_RESOURCES_SOURCE_ONLY_PATHS_V187, NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187,
  NATIVE_QA_PRESERVED_SHA256_V187, reviewedNativeQaResourcesDigestV187,
  reviewedNativeQaDependencyGuardDigestV187, verifyNativeQaDependencyBodyV187,
  verifyNativeQaResourcesV187
} from './audit-native-qa-resources-v187.mjs';
import { verifyI18nMaintenanceV186 } from './audit-i18n-maintenance-v186.mjs';
import { verifyI18nV185 } from './audit-i18n-v185.mjs';
import { verifyAudioSlotsV184 } from './audit-audio-slots-v184.mjs';
import { verifyOriginalNamesV183 } from './audit-original-names-v183.mjs';
import { verifyQaBranchV181, QA_BRANCH_CONSTANTS_V181 } from './audit-pr-integration-v182.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V187 verifies its exact QA sources, preserved scenario engine and historical V163 bytes', () => {
  assert.equal(NATIVE_QA_RESOURCES_BASELINE_V187, '8219837892fc8c5ede58f2c500a934192fea1ae0');
  assert.deepEqual(verifyNativeQaResourcesV187(), { successors: 8, preserved: 7 });
  assert.deepEqual(verifyI18nMaintenanceV186(), { successors: 5 });
  assert.deepEqual(verifyI18nV185(), { successors: 9 });
  assert.deepEqual(verifyAudioSlotsV184(), { successors: 6 });
  assert.deepEqual(verifyOriginalNamesV183(), { successors: 12 });
  const current = JSON.parse(read('docs/forge/xeno-trials/progress-v163.json'));
  assert.equal(verifyQaBranchV181(current).workbookChanged, false);
});

test('V187 rejects mutated QA sources, changed historical bytes and unreviewed predecessor endpoints', () => {
  for (const [path, receipt] of Object.entries(NATIVE_QA_RESOURCES_SUCCESSORS_V187)) {
    assert.throws(() => verifyNativeQaResourcesV187(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n# unreviewed')]) : read(candidate)), /Unreviewed V187 source bytes/);
    assert.throws(() => reviewedNativeQaResourcesDigestV187(path, '0'.repeat(64)), /Broken V186-to-V187 source chain/);
    assert.throws(() => reviewedNativeQaResourcesDigestV187(path, receipt.currentSha256), /Broken V186-to-V187 source chain/);
  }
  for (const path of Object.keys(NATIVE_QA_PRESERVED_SHA256_V187)) {
    assert.throws(() => verifyNativeQaResourcesV187(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\n# unreviewed')]) : read(candidate)), /V187 must preserve these source bytes/);
  }
});

test('V187 continues the exact V180 dependency guard instead of removing its immutable witness', () => {
  const old = QA_BRANCH_CONSTANTS_V181.V180_BASELINE_WITNESS.dependencyGuardSha256;
  assert.equal(old, '9af73552e83c35e292762e1d3ad2c00f491290d76c8669856b5937d903ce470a');
  assert.equal(NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187.previousSha256, old);
  const guard = [...read('scripts/qa-npc-annex-service-routes-v163.py').toString()
    .matchAll(/^NATIVE_ASHA_DEPENDENCY_V163 = '''[\s\S]*?'''/gm)];
  assert.equal(guard.length, 1);
  assert.equal(reviewedNativeQaDependencyGuardDigestV187(old), sha(guard[0][0]));
  verifyNativeQaDependencyBodyV187(guard[0][0]);
  assert.throws(() => verifyNativeQaDependencyBodyV187(guard[0][0].replace('simSeconds<0', 'simSeconds<-1')),
    /Native prerequisite physical guard body changed/);
  for (const forged of ['0'.repeat(64), sha(guard[0][0]), sha(guard[0][0] + '\n// arbitrary')]) {
    assert.throws(() => reviewedNativeQaDependencyGuardDigestV187(forged), /Incorrect V180 prerequisite guard predecessor/);
  }
  assert.ok(Object.isFrozen(NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187));
});

test('V187 workflow changes only the explicit crew-lifts resource selection and keeps the 55 minute job', () => {
  const path = '.github/workflows/non-forge-regression-v163.yml';
  const workflow = read(path).toString();
  const option = ' --dependency-resource-profile ci-slow4';
  assert.equal(workflow.split(option).length - 1, 1);
  assert.equal(sha(workflow.replace(option, '')), NATIVE_QA_RESOURCES_SUCCESSORS_V187[path].previousSha256,
    'This receipt covers precisely one CLI selection, with no other workflow changes.');
  assert.match(workflow.match(/crew-lifts\)[\s\S]*?;;/)[0], /--dependency-resource-profile ci-slow4/);
  assert.match(workflow, /^    timeout-minutes: 55$/m);
});

test('V187 audit and documentation stay source-only and the new audit test enters the release runner', () => {
  for (const path of NATIVE_QA_RESOURCES_SOURCE_ONLY_PATHS_V187) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    read(path);
  }
  for (const path of ['scripts/audit-native-qa-unreviewed-v187.mjs',
    'docs/development/NATIVE_QA_UNREVIEWED_V187.md']) assert.equal(isPublicDistributionPathV86(path), false);
  const files = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  assert.equal(files.filter(path => path === 'scripts/verify-native-qa-resources-v187.mjs').length, 1);
  const relay = read('scripts/audit-native-qa-resources-v187.mjs').toString();
  assert.match(relay, /from '\.\/audit-xeno-trials-completion-v186\.mjs'/);
  assert.match(read('scripts/audit-xeno-trials-completion-v186.mjs').toString(), /from '\.\/audit-xeno-stage-operations-v188\.mjs'/);
  const terminal = read('scripts/audit-xeno-animation-audio-v189.mjs').toString();
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(terminal), false);
  assert.equal(Object.hasOwn(NATIVE_QA_RESOURCES_SUCCESSORS_V187, 'scripts/audit-native-qa-resources-v187.mjs'), false);
  assert.equal(Object.keys(NATIVE_QA_RESOURCES_SUCCESSORS_V187).some(path => path.startsWith('src/')), false);
});
