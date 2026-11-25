import { TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188, TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188 } from './audit-tantalus-priorities-v188.mjs';
import { reviewedHorsDesOmbresDigestV010 } from './audit-hors-des-ombres-continuation-v010.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  NATIVE_QA_RESOURCES_BASELINE_V187, NATIVE_QA_RESOURCES_SUCCESSORS_V187,
  NATIVE_QA_RESOURCES_SOURCE_ONLY_PATHS_V187, NATIVE_QA_DEPENDENCY_GUARD_SUCCESSOR_V187,
  NATIVE_QA_PRESERVED_SHA256_V187, reviewedNativeQaResourcesDigestV187,
  reviewedNativeQaDependencyGuardDigestV187, verifyNativeQaDependencyBodyV187,
  verifyNativeQaResourcesV187, OBSCURA_SOURCE_SHA256_20261115,
  OBSCURA_SOURCE_ONLY_PATHS_20261115, OBSCURA_VERIFIER_SUCCESSOR_20261115,
  reviewedObscuraDigest20261115, verifyObscuraSources20261115
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

test('V187 resource selection and 55 minute job survive the exact V190 complete-history checkout addition', () => {
  const path = '.github/workflows/non-forge-regression-v163.yml';
  const workflow = read(path).toString();
  const option = ' --dependency-resource-profile ci-slow4';
  assert.equal(workflow.split(option).length - 1, 1);
  const sourceHistoryOption = '          fetch-depth: 0\n';
  assert.equal(workflow.split(sourceHistoryOption).length - 1, 1, 'V190 admits exactly one complete-history checkout option.');
  const historicalWorkflow = workflow.replace(sourceHistoryOption, '');
  assert.equal(sha(historicalWorkflow.replace(option, '')), NATIVE_QA_RESOURCES_SUCCESSORS_V187[path].previousSha256,
    'The V187 historical receipt still covers precisely one CLI selection; V190 separately admits only the complete-history checkout option.');
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
  assert.match(relay, /from '\.\/audit-tantalus-priorities-v188\.mjs'/);
  assert.match(read('scripts/audit-xeno-trials-completion-v186.mjs').toString(), /from '\.\/audit-xeno-stage-operations-v188\.mjs'/);
  // The two merged chains now share one exact continuation; its leaf imports no audit.
  for (const terminalPath of ['scripts/audit-tantalus-priorities-v188.mjs', 'scripts/audit-xeno-production-assets-v206.mjs']) {
    const terminal = read(terminalPath).toString();
    assert.deepEqual([...terminal.matchAll(/from ['"](\.\/[^'"]+)['"]/g)].map(match => match[1]),
      ['./audit-hors-des-ombres-continuation-v010.mjs'], terminalPath);
  }
  assert.doesNotMatch(read('scripts/audit-hors-des-ombres-continuation-v010.mjs').toString(),
    /(?:from\s*|import\s*\(?\s*)['"]\.\//, 'The common terminal cannot depend on another audit.');
  assert.equal(Object.hasOwn(NATIVE_QA_RESOURCES_SUCCESSORS_V187, 'scripts/audit-native-qa-resources-v187.mjs'), false);
  assert.equal(Object.keys(NATIVE_QA_RESOURCES_SUCCESSORS_V187).some(path => path.startsWith('src/')), false);
});


test('Obscura admits only its exact source directories and files, never a public build', () => {
  const files = new Set(Object.keys(OBSCURA_SOURCE_SHA256_20261115));
  assert.equal(files.size, 6);
  for (const path of OBSCURA_SOURCE_ONLY_PATHS_20261115) {
    const directory = !files.has(path);
    assert.equal(isPublicDistributionPathV86(path, { directory }), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory, built: true }), false, path);
  }
  for (const path of ['.agents/skills/unreviewed/SKILL.md', '.claude/skills/unreviewed/SKILL.md',
    '.agents/skills/obscura/hook.js', '.claude/skills/obscura/settings.json',
    '.ai-tools/obscura/private.json', '.ai-tools/obscura/../private.json']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
});

test('Obscura binds every skill, licence and guide byte without transferring old test receipts', () => {
  assert.deepEqual(verifyObscuraSources20261115(),
    { sources: 6, runtimeChanged: false, historicalEvidenceTransferred: false });
  for (const path of Object.keys(OBSCURA_SOURCE_SHA256_20261115)) {
    assert.throws(() => verifyObscuraSources20261115(candidate => candidate === path
      ? Buffer.concat([read(candidate), Buffer.from('\nchanged')]) : read(candidate)), /Unreviewed Obscura source bytes/);
  }
});

test('Obscura continues the exact V187 verifier endpoint and refuses arbitrary predecessors', () => {
  const receipt = OBSCURA_VERIFIER_SUCCESSOR_20261115;
  assert.equal(receipt.previousSha256, NATIVE_QA_RESOURCES_SUCCESSORS_V187[receipt.path].currentSha256);
  assert.equal(reviewedObscuraDigest20261115(receipt.path, receipt.previousSha256), receipt.currentSha256);
  // On the Tantalus branch the verifier also carries the V188 work: the lead continuation (after b6e01ef1)
  // reviews the main-merge bytes, then the Xeno Trials join (after 0d1d9950) reviews the merged bytes;
  // on main the Obscura endpoint is the file itself.
  const lead = TANTALUS_PRIORITIES_LEAD_CONTINUATION_V188.successors[receipt.path];
  const join = Object.hasOwn(TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors, receipt.path)
    ? TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors[receipt.path] : null;
  if (join) assert.equal(join.previousSha256, lead ? lead.currentSha256 : receipt.currentSha256);
  assert.equal(sha(read(receipt.path)), reviewedHorsDesOmbresDigestV010(receipt.path, join ? join.currentSha256 : lead ? lead.currentSha256 : receipt.currentSha256));
  for (const forged of ['0'.repeat(64), receipt.currentSha256])
    assert.throws(() => reviewedObscuraDigest20261115(receipt.path, forged), /Broken V187-to-Obscura source chain/);
  assert.equal(reviewedObscuraDigest20261115('src/unreviewed.js', 'unchanged'), 'unchanged');
});

test('The Xeno Trials join resolves both V187 successor chains to the same merged bytes and refuses forged links', async () => {
  const { reviewedAfterNativeQaResourcesV187 } = await import('./audit-native-qa-resources-v187.mjs');
  const { reviewedCompletionDigestV186 } = await import('./audit-xeno-trials-completion-v186.mjs');
  const { reviewedTantalusPrioritiesDigestV188, verifyTantalusPrioritiesV188 } = await import('./audit-tantalus-priorities-v188.mjs');
  const { XENO_TRIALS_TANTALUS_JOIN_V206, reviewedXenoTrialsTantalusJoinV206, verifyXenoTrialsTantalusJoinV206 } =
    await import('./audit-xeno-production-assets-v206.mjs');
  const tantalusJoin = TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188.successors, xenoJoin = XENO_TRIALS_TANTALUS_JOIN_V206.successors;
  let shared = 0;
  for (const [path, receipt] of Object.entries(NATIVE_QA_RESOURCES_SUCCESSORS_V187)) {
    const xeno = reviewedCompletionDigestV186(path, receipt.currentSha256);
    const tantalus = reviewedTantalusPrioritiesDigestV188(path, receipt.currentSha256);
    if (xeno !== receipt.currentSha256 && tantalus !== receipt.currentSha256) { shared++; assert.equal(xeno, tantalus, path); }
    assert.equal(reviewedAfterNativeQaResourcesV187(path, receipt.currentSha256), sha(read(path)), path);
  }
  assert.ok(shared > 0, 'at least one V187 successor is pinned by both chains');
  assert.equal(reviewedAfterNativeQaResourcesV187('src/unreviewed.js', 'unchanged'), 'unchanged');
  assert.deepEqual(Object.keys(verifyXenoTrialsTantalusJoinV206()).sort(), ['baselineCommit', 'successors']);
  for (const [path, receipt] of Object.entries(xenoJoin)) {
    assert.equal(sha(read(path)), reviewedHorsDesOmbresDigestV010(path, receipt.currentSha256), path);
    for (const forged of ['0'.repeat(64), receipt.currentSha256])
      assert.throws(() => reviewedXenoTrialsTantalusJoinV206(path, forged), /Broken fa2d62fe-to-tantalus-join source chain/);
  }
  for (const [path, receipt] of Object.entries(tantalusJoin))
    assert.equal(sha(read(path)), reviewedHorsDesOmbresDigestV010(path, receipt.currentSha256), path);
  const path = 'scripts/audit-native-qa-resources-v187.mjs';
  assert.ok(Object.hasOwn(tantalusJoin, path) && Object.hasOwn(xenoJoin, path), 'the relay itself is reviewed on both chains');
  const mutated = candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed')]) : read(candidate);
  assert.throws(() => verifyXenoTrialsTantalusJoinV206(mutated), /Unreviewed tantalus-join source bytes/);
  assert.throws(() => verifyTantalusPrioritiesV188(mutated), /Unreviewed (?:V188|lead-continuation|xeno-trials-join) source bytes/);
  assert.throws(() => reviewedTantalusPrioritiesDigestV188(path, tantalusJoin[path].currentSha256), /Broken .* source chain/);
});
