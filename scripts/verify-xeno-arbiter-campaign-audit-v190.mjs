import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ARBITER_CAMPAIGN_BASELINE_V190 as baseline, ARBITER_CAMPAIGN_SUCCESSORS_V190 as successors,
  ARBITER_CAMPAIGN_NEW_INPUTS_V190 as inputs, ARBITER_CAMPAIGN_PRESERVED_PLATES_V190 as plates,
  ARBITER_CAMPAIGN_HISTORICAL_DECLARATIONS_V190 as declarations,
  reviewedArbiterCampaignDigestV190 as advance, arbiterCampaignRuntimeSourcesV190 as runtime,
  verifyArbiterCampaignV190 as verify } from './audit-xeno-arbiter-campaign-v190.mjs';
import { ANIMATION_AUDIO_SUCCESSORS_V189 as oldSuccessors, ANIMATION_AUDIO_NEW_INPUTS_V189 as oldInputs,
  ANIMATION_AUDIO_PRESERVED_PLATES_V189 as oldPlates, verifyAnimationAudioV189 } from './audit-xeno-animation-audio-v189.mjs';
import { STAGE_OPERATIONS_SUCCESSORS_V188, STAGE_OPERATIONS_NEW_INPUTS_V188,
  STAGE_OPERATIONS_PRESERVED_PLATES_V188, verifyStageOperationsV188 } from './audit-xeno-stage-operations-v188.mjs';
import { COMPLETION_SOURCES_V186, verifyCompletionV186 } from './audit-xeno-trials-completion-v186.mjs';
import { loadAuditSuccessionV163, resolveAuditSourcesV163 } from './audit-succession-v163.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { reviewedArbiterProtocolsDigestV191 as later } from './audit-xeno-arbiter-protocols-v191.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => execFileSync('git', ['show', baseline + ':' + path], { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const changed = path => candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\nUNREVIEWED-V190')]) : read(candidate);
const mutableReports = ['docs/forge/xeno-trials/V190-ARBITER-CAMPAIGN.md', 'docs/forge/xeno-trials/arbiter-campaign-completion-v190.json'];

test('V190 succeeds the physical 3a6c141 tree: each predecessor exists there and every named new input is absent', () => {
  assert.equal(baseline, '3a6c1410f606b83a7be881f93b6e87f8d0008a98');
  const previousPaths = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', baseline], { cwd: root, encoding: 'utf8' }).trim().split('\n'));
  assert.ok(Object.keys(successors).length > 0); assert.ok(Object.keys(inputs).length > 0);
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(previousPaths.has(path), 'A successor must exist in the real baseline: ' + path);
    assert.equal(sha(readBaseline(path)), receipt.previousSha256, path);
    assert.equal(sha(read(path)), later(path, receipt.currentSha256), path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.equal(previousPaths.has(path), false, 'An added input must not exist in the real baseline: ' + path);
    assert.equal(sha(read(path)), later(path, receipt.sha256), path);
  }
  for (const [path, digest] of Object.entries(plates)) {
    assert.equal(sha(readBaseline(path)), digest, path);
    assert.equal(sha(read(path)), digest, path);
  }
});

test('the immutable 46 V189, 48 V188 and 71 V186 declarations remain exact without transferring their results', () => {
  assert.equal(Object.keys(oldSuccessors).length, 17); assert.equal(Object.keys(oldInputs).length, 25); assert.equal(Object.keys(oldPlates).length, 4);
  assert.equal(Object.keys(STAGE_OPERATIONS_SUCCESSORS_V188).length, 22);
  assert.equal(Object.keys(STAGE_OPERATIONS_NEW_INPUTS_V188).length, 22); assert.equal(Object.keys(STAGE_OPERATIONS_PRESERVED_PLATES_V188).length, 4);
  assert.equal(Object.keys(COMPLETION_SOURCES_V186).length, 71);
  for (const [path, receipt] of Object.entries(declarations)) {
    const text = read(path).toString(), old = readBaseline(path).toString();
    const extract = value => value.slice(value.indexOf(receipt.start), value.indexOf(receipt.end));
    assert.equal(extract(text), extract(old), path); assert.equal(sha(extract(text)), receipt.sha256, path);
  }
  for (const guard of [verify, verifyAnimationAudioV189, verifyStageOperationsV188, verifyCompletionV186])
    assert.equal(guard().historicalResultsTransferred, false);
});

test('both existing CI workflows add only complete history while retaining their exact jobs and credential isolation', () => {
  const option = '          fetch-depth: 0\n';
  for (const path of ['.github/workflows/full-release-v143.yml', '.github/workflows/non-forge-regression-v163.yml']) {
    const text = read(path).toString(); assert.equal(text.split(option).length - 1, 1, path);
    assert.equal(text.replace(option, ''), readBaseline(path).toString(), path);
    assert.match(text, /          persist-credentials: false\n          fetch-depth: 0\n/);
    assert.equal(successors[path]?.kind, 'configuration', path);
  }
});

test('strict V190 transitions refuse invented, missing and already advanced predecessors; unknown paths gain no admission', () => {
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt)); assert.equal(advance(path, receipt.previousSha256), later(path, receipt.currentSha256), path);
    for (const bad of ['0'.repeat(64), null, undefined, receipt.currentSha256])
      assert.throws(() => advance(path, bad), /Incorrect V189 endpoint for V190/, path);
  }
  assert.equal(advance('src/unreviewed-v190.js', 'historic'), 'historic');
  assert.equal(Object.hasOwn(inputs, 'src/unreviewed-v190.js'), false);
});

test('every current V190 byte, added input and preserved plate rejects corruption through the entire historical chain', () => {
  verify(); verifyCompletionV186();
  for (const path of [...Object.keys(successors), ...Object.keys(inputs), ...Object.keys(plates)]) {
    const modified = changed(path);
    for (const guard of [verify, verifyAnimationAudioV189, verifyCompletionV186])
      assert.throws(() => guard(modified), error => error.message.includes(path) && /Unreviewed|Historical/.test(error.message), path);
    if (successors[path]) assert.throws(() => advance(path, sha(modified(path))), /Incorrect V189 endpoint for V190/, path);
  }
});

test('the complete source chain keeps archival defaults and admits only the exact reviewed V190 runtime extension', () => {
  const { previous, current } = loadAuditSuccessionV163(read);
  assert.deepEqual(resolveAuditSourcesV163(previous, read), current.runtimeSourceSha256);
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  for (const [path, receipt] of Object.entries(successors).filter(([, r]) => r.kind === 'runtime')) assert.equal(effective[path], later(path, receipt.currentSha256), path);
  const addedRuntime = Object.entries(inputs).filter(([, r]) => r.kind === 'runtime');
  assert.ok(addedRuntime.length >= 4, 'Campaign, gameplay and scene runtime modules must be explicit inputs.');
  for (const [path, receipt] of addedRuntime) assert.equal(effective[path], later(path, receipt.sha256), path);
  const frozen = Object.freeze({ original: 'historic' }), view = runtime(frozen);
  assert.deepEqual(frozen, { original: 'historic' }); assert.ok(Object.isFrozen(view)); assert.deepEqual(runtime(view), view);
  const first = Object.entries(successors).find(([, r]) => r.kind === 'runtime'); assert.ok(first);
  assert.throws(() => runtime({ [first[0]]: '0'.repeat(64) }), /Incorrect V190 runtime view predecessor/);
});

test('V190 relays to terminal V192, pins its V189 relay and keeps tools, production records and mutable outcomes out of the game build', () => {
  const terminal = 'scripts/audit-xeno-franchise-stages-v192.mjs', relay = 'scripts/audit-xeno-animation-audio-v189.mjs';
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(read(terminal).toString()), false);
  assert.equal(Object.hasOwn(successors, terminal) || Object.hasOwn(inputs, terminal), false);
  assert.ok(successors[relay]); assert.match(read(relay).toString(), /from '\.\/audit-xeno-arbiter-campaign-v190\.mjs'/);
  assert.match(read('scripts/audit-xeno-arbiter-campaign-v190.mjs').toString(), /from '\.\/audit-xeno-arbiter-protocols-v191\.mjs'/);
  for (const path of [terminal, ...Object.keys(inputs)]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    if (path.startsWith('scripts/') || path.startsWith('docs/')) assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of mutableReports) {
    assert.equal(Object.hasOwn(inputs, path) || Object.hasOwn(successors, path), false, 'Outcomes remain independent of source admission.');
    assert.equal(isPublicDistributionPathV86(path), true, path); assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['scripts/audit-xeno-arbiter-unreviewed-v190.mjs', 'docs/forge/xeno-trials/arbiter-unreviewed-v190.json',
    'assets/openai/stages/xeno-trials-v190/unreviewed-stage.png']) assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === 'scripts/verify-xeno-arbiter-campaign-audit-v190.mjs').length, 1);
});
