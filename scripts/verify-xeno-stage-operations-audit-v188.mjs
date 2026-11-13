import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { STAGE_OPERATIONS_BASELINE_V188 as baseline, STAGE_OPERATIONS_SUCCESSORS_V188 as successors,
  STAGE_OPERATIONS_NEW_INPUTS_V188 as inputs, STAGE_OPERATIONS_PRESERVED_PLATES_V188 as plates,
  STAGE_OPERATIONS_COMPLETION_RECEIPTS_SHA256_V188 as receiptHash,
  reviewedStageOperationsDigestV188 as advance, stageOperationsRuntimeSourcesV188 as runtime,
  verifyStageOperationsV188 as verify } from './audit-xeno-stage-operations-v188.mjs';
import { COMPLETION_SOURCES_V186, reviewedCompletionDigestV186, verifyCompletionV186 } from './audit-xeno-trials-completion-v186.mjs';
import { loadAuditSuccessionV163, resolveAuditSourcesV163 } from './audit-succession-v163.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { reviewedAnimationAudioDigestV189 as later } from './audit-xeno-animation-audio-v189.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const changedRead = path => candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\nUNREVIEWED-V188')]) : read(candidate);
const rejectsPath = (callback, path) => assert.throws(callback, error => error.message.includes(path) && /(?:Unreviewed|Historical)/.test(error.message), path);

test('V188 explicitly continues the last V186 completion commit and preserves its 71 exact receipt declarations', () => {
  assert.equal(baseline, 'bf42bc7aa5a674b4d204145670181a940d16a5aa');
  assert.equal(Object.keys(COMPLETION_SOURCES_V186).length, 71);
  assert.equal(receiptHash, '9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495');
  assert.equal(verify().historicalResultsTransferred, false); assert.equal(verifyCompletionV186().sources, 71);
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt)); assert.notEqual(receipt.previousSha256, receipt.currentSha256);
    if (COMPLETION_SOURCES_V186[path]) assert.equal(receipt.previousSha256, COMPLETION_SOURCES_V186[path].currentSha256, path);
    assert.equal(advance(path, receipt.previousSha256), later(path, receipt.currentSha256), path);
    assert.equal(sha(read(path)), later(path, receipt.currentSha256), path);
  }
});

test('every V188 predecessor transition rejects a fake, missing or already advanced endpoint', () => {
  for (const [path, receipt] of Object.entries(successors)) {
    for (const bad of ['0'.repeat(64), null, undefined, receipt.currentSha256])
      assert.throws(() => advance(path, bad), /Incorrect completion endpoint for V188/, path);
  }
  assert.equal(advance('src/unreviewed-v188.js', 'old-endpoint'), 'old-endpoint');
  assert.equal(Object.hasOwn(inputs, 'src/unreviewed-v188.js'), false);
});

test('all changed and added inputs reject byte corruption at the affected path through the terminal and historical entry point', () => {
  verify(); verifyCompletionV186();
  for (const path of [...Object.keys(successors), ...Object.keys(inputs), ...Object.keys(plates)]) {
    const changed = changedRead(path); rejectsPath(() => verify(changed), path); rejectsPath(() => verifyCompletionV186(changed), path);
    if (successors[path]) assert.throws(() => advance(path, sha(changed(path))), /Incorrect completion endpoint for V188/, path);
  }
});

test('full V163/Main/Trials/language/QA chain resolves the exact current runtime including all six new V188 modules', () => {
  const { previous, current } = loadAuditSuccessionV163(read);
  assert.deepEqual(resolveAuditSourcesV163(previous, read), current.runtimeSourceSha256);
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  for (const [path, receipt] of Object.entries(successors).filter(([, r]) => r.kind === 'runtime')) assert.equal(effective[path], later(path, receipt.currentSha256), path);
  const newRuntime = Object.entries(inputs).filter(([, r]) => r.kind === 'runtime'); assert.equal(newRuntime.length, 6);
  for (const [path, receipt] of newRuntime) assert.equal(effective[path], later(path, receipt.sha256), path);
  const frozen = Object.freeze({ untouched: 'historic' }), first = runtime(frozen);
  assert.deepEqual(frozen, { untouched: 'historic' }); assert.deepEqual(runtime(first), first);
  const one = Object.entries(successors).find(([, r]) => r.kind === 'runtime');
  assert.throws(() => runtime({ [one[0]]: '0'.repeat(64) }), /Incorrect V188 runtime view predecessor/);
  for (const [path, receipt] of Object.entries(COMPLETION_SOURCES_V186)) for (const old of Object.values(receipt.predecessors).filter(Boolean))
    assert.equal(reviewedCompletionDigestV186(path, old), advance(path, receipt.currentSha256), path);
});

test('V188 relays to terminal V191, preserves its V186 admissions and keeps tooling and review inputs out of the build', () => {
  const terminal = 'scripts/audit-xeno-arbiter-protocols-v191.mjs', relay = 'scripts/audit-xeno-trials-completion-v186.mjs';
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(read(terminal).toString()), false);
  assert.equal(Object.hasOwn(successors, terminal) || Object.hasOwn(inputs, terminal), false);
  assert.match(read(relay).toString(), /from '\.\/audit-xeno-stage-operations-v188\.mjs'/);
  assert.match(read('scripts/audit-xeno-stage-operations-v188.mjs').toString(), /from '\.\/audit-xeno-animation-audio-v189\.mjs'/);
  for (const path of [relay, 'scripts/verify-xeno-trials-completion-audit-v186.mjs', 'scripts/verify-i18n-audit-v186.mjs', 'scripts/verify-native-qa-resources-v187.mjs']) assert.ok(successors[path]);
  for (const path of [terminal, ...Object.keys(inputs)]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    if (path.startsWith('scripts/') || path.startsWith('docs/')) assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-stage-unreviewed-v188.mjs'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/sprite-unreviewed-v188.json'), false);
  assert.equal(Object.hasOwn(inputs, 'docs/forge/xeno-trials/operations-completion-v188.json'), false, 'Mutable results are not evidence inputs');
});
