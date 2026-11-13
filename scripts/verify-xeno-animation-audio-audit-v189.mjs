import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ANIMATION_AUDIO_BASELINE_V189 as baseline, ANIMATION_AUDIO_SUCCESSORS_V189 as successors,
  ANIMATION_AUDIO_NEW_INPUTS_V189 as inputs, ANIMATION_AUDIO_PRESERVED_PLATES_V189 as plates,
  reviewedAnimationAudioDigestV189 as advance, animationAudioRuntimeSourcesV189 as runtime,
  verifyAnimationAudioV189 as verify } from './audit-xeno-animation-audio-v189.mjs';
import { STAGE_OPERATIONS_SUCCESSORS_V188 as oldSuccessors, STAGE_OPERATIONS_NEW_INPUTS_V188 as oldInputs,
  STAGE_OPERATIONS_PRESERVED_PLATES_V188 as oldPlates, verifyStageOperationsV188 } from './audit-xeno-stage-operations-v188.mjs';
import { COMPLETION_SOURCES_V186, verifyCompletionV186 } from './audit-xeno-trials-completion-v186.mjs';
import { loadAuditSuccessionV163, resolveAuditSourcesV163 } from './audit-succession-v163.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { reviewedArbiterCampaignDigestV190 as later } from './audit-xeno-arbiter-campaign-v190.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const historic = Object.assign(Object.fromEntries(Object.entries(COMPLETION_SOURCES_V186).map(([p, r]) => [p, r.currentSha256])),
  Object.fromEntries(Object.entries(oldSuccessors).map(([p, r]) => [p, r.currentSha256])),
  Object.fromEntries(Object.entries(oldInputs).map(([p, r]) => [p, r.sha256])), oldPlates);
const changed = path => candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\nUNREVIEWED-V189')]) : read(candidate);

test('V189 exactly succeeds e1d5358 without rewriting any of the 48 V188 or 71 V186 source receipts', () => {
  assert.equal(baseline, 'e1d53588f3b56d89ab593f36c3b9cc337c5eadc1');
  assert.equal(Object.keys(oldSuccessors).length, 22); assert.equal(Object.keys(oldInputs).length, 22); assert.equal(Object.keys(oldPlates).length, 4);
  assert.equal(Object.keys(COMPLETION_SOURCES_V186).length, 71);
  assert.equal(verify().historicalResultsTransferred, false); assert.equal(verifyStageOperationsV188().successors, 22); assert.equal(verifyCompletionV186().sources, 71);
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt)); if (historic[path]) assert.equal(receipt.previousSha256, historic[path], path);
    assert.equal(advance(path, receipt.previousSha256), later(path, receipt.currentSha256), path); assert.equal(sha(read(path)), later(path, receipt.currentSha256), path);
  }
  const stage = read('scripts/audit-xeno-stage-operations-v188.mjs').toString();
  assert.equal(sha(stage.slice(stage.indexOf('export const STAGE_OPERATIONS_BASELINE_V188'), stage.indexOf('\nexport function reviewedStageOperationsDigestV188'))),
    '877b259c841594d4a0cddca47c8977d389bf6c68816951dcbe95389bd49708e4');
});

test('V189 refuses invented, missing and already advanced predecessors while unknown paths gain no admission', () => {
  for (const [path, receipt] of Object.entries(successors)) for (const bad of ['0'.repeat(64), null, undefined, receipt.currentSha256])
    assert.throws(() => advance(path, bad), /Incorrect V188 endpoint for V189/, path);
  assert.equal(advance('src/unreviewed-v189.js', 'old'), 'old'); assert.equal(Object.hasOwn(inputs, 'src/unreviewed-v189.js'), false);
});

test('every V189 changed or added byte and preserved source plate rejects corruption at its actual path through the full join', () => {
  verify(); verifyCompletionV186();
  for (const path of [...Object.keys(successors), ...Object.keys(inputs), ...Object.keys(plates)]) {
    const modified = changed(path);
    for (const guard of [verify, verifyCompletionV186]) assert.throws(() => guard(modified), error => error.message.includes(path) && /Unreviewed|Historical/.test(error.message), path);
    if (successors[path]) assert.throws(() => advance(path, sha(modified(path))), /Incorrect V188 endpoint for V189/, path);
  }
});

test('the complete legacy chain retains its archival default and exposes four exact new runtime modules only after validation', () => {
  const { previous, current } = loadAuditSuccessionV163(read);
  assert.deepEqual(resolveAuditSourcesV163(previous, read), current.runtimeSourceSha256);
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  for (const [path, receipt] of Object.entries(successors).filter(([, r]) => r.kind === 'runtime')) assert.equal(effective[path], later(path, receipt.currentSha256), path);
  const added = Object.entries(inputs).filter(([, r]) => r.kind === 'runtime'); assert.equal(added.length, 4);
  for (const [path, receipt] of added) assert.equal(effective[path], later(path, receipt.sha256), path);
  const frozen = Object.freeze({ original: 'historic' }), view = runtime(frozen); assert.deepEqual(frozen, { original: 'historic' }); assert.deepEqual(runtime(view), view);
  const first = Object.entries(successors).find(([, r]) => r.kind === 'runtime');
  assert.throws(() => runtime({ [first[0]]: '0'.repeat(64) }), /Incorrect V189 runtime view predecessor/);
});

test('V189 relays to V190 while pinning its changed V188 relay and keeps new tools and review inputs source-only with exact neighbours refused', () => {
  const terminal = 'scripts/audit-xeno-arbiter-protocols-v191.mjs', relay = 'scripts/audit-xeno-stage-operations-v188.mjs';
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(read(terminal).toString()), false);
  assert.equal(Object.hasOwn(successors, terminal) || Object.hasOwn(inputs, terminal), false);
  assert.ok(successors[relay]); assert.match(read(relay).toString(), /from '\.\/audit-xeno-animation-audio-v189\.mjs'/);
  assert.match(read('scripts/audit-xeno-animation-audio-v189.mjs').toString(), /from '\.\/audit-xeno-arbiter-campaign-v190\.mjs'/);
  for (const path of [terminal, ...Object.keys(inputs)]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    if (path.startsWith('scripts/') || path.startsWith('docs/')) assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['scripts/audit-xeno-unreviewed-v189.mjs', 'docs/forge/xeno-trials/sprite-unreviewed-v189.json',
    'assets/openai/sprites/xeno-trials-v189/unreviewed-combat-sheet.png']) assert.equal(isPublicDistributionPathV86(path), false, path);
  for (const path of ['docs/forge/xeno-trials/animation-audio-completion-v189.json', 'docs/forge/xeno-trials/V189-ANIMATION-AUDIO.md']) assert.equal(Object.hasOwn(inputs, path), false);
});
