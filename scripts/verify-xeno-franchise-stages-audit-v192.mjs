import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { FRANCHISE_STAGES_BASELINE_V192 as baseline, FRANCHISE_STAGES_SUCCESSORS_V192 as successors,
  FRANCHISE_STAGES_NEW_INPUTS_V192 as inputs, FRANCHISE_STAGES_PRESERVED_PLATES_V192 as plates,
  FRANCHISE_STAGES_HISTORICAL_DECLARATIONS_V192 as declarations, FRANCHISE_STAGES_LEGACY_CATALOG_V192 as legacy,
  reviewedFranchiseStagesDigestV192 as advance, franchiseStagesRuntimeSourcesV192 as runtime,
  verifyFranchiseStagesV192 as verify } from './audit-xeno-franchise-stages-v192.mjs';
import { ARBITER_PROTOCOLS_SUCCESSORS_V191 as protocolSuccessors, ARBITER_PROTOCOLS_NEW_INPUTS_V191 as protocolInputs,
  ARBITER_PROTOCOLS_PRESERVED_PLATES_V191 as protocolPlates, verifyArbiterProtocolsV191 } from './audit-xeno-arbiter-protocols-v191.mjs';
import { ARBITER_CAMPAIGN_SUCCESSORS_V190 as priorSuccessors, ARBITER_CAMPAIGN_NEW_INPUTS_V190 as priorInputs,
  ARBITER_CAMPAIGN_PRESERVED_PLATES_V190 as priorPlates, verifyArbiterCampaignV190 } from './audit-xeno-arbiter-campaign-v190.mjs';
import { ANIMATION_AUDIO_SUCCESSORS_V189 as oldSuccessors, ANIMATION_AUDIO_NEW_INPUTS_V189 as oldInputs,
  ANIMATION_AUDIO_PRESERVED_PLATES_V189 as oldPlates, verifyAnimationAudioV189 } from './audit-xeno-animation-audio-v189.mjs';
import { STAGE_OPERATIONS_SUCCESSORS_V188, STAGE_OPERATIONS_NEW_INPUTS_V188,
  STAGE_OPERATIONS_PRESERVED_PLATES_V188, verifyStageOperationsV188 } from './audit-xeno-stage-operations-v188.mjs';
import { COMPLETION_SOURCES_V186, verifyCompletionV186 } from './audit-xeno-trials-completion-v186.mjs';
import { loadAuditSuccessionV163, resolveAuditSourcesV163 } from './audit-succession-v163.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => execFileSync('git', ['show', baseline + ':' + path], { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const changed = path => candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\nUNREVIEWED-V192')]) : read(candidate);
const mutableReports = ['docs/forge/xeno-trials/V192-FRANCHISE-STAGES-50.md', 'docs/forge/xeno-trials/franchise-stage-completion-v192.json'];
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);

// Git-sourced data fixture only: no engine, images, simulation or gameplay is
// executed in these VMs. The three historical sources construct the old array.
function baselineStageCatalog() {
  const stripExports = code => code.replace(/^import[^\n]+\n/gm, '').replace(/\bexport\s+/g, '');
  const bosses = JSON.parse(vm.runInNewContext(stripExports(readBaseline('src/xeno-trials-boss-stages-v179.js').toString())
    + ';JSON.stringify(XENO_TRIALS_BOSS_STAGES_V179)'));
  const corporate = JSON.parse(vm.runInNewContext(stripExports(readBaseline('src/xeno-trials-stage-scenes-v190.js').toString())
    + ';JSON.stringify(XENO_TRIALS_CORPORATE_STAGES_V190)', { XENO_TRIALS_BOSS_STAGES_V179: bosses }));
  const match = readBaseline('src/xeno-trials-data-v96.js').toString()
    .match(/export const XENO_TRIALS_STAGES_V96 = (Object\.freeze\(\[[\s\S]*?\]\));/);
  assert.ok(match, 'The physical baseline must retain its exact stage-array declaration.');
  return JSON.parse(vm.runInNewContext('JSON.stringify(' + match[1] + ')', {
    XENO_TRIALS_BOSS_STAGES_V179: bosses, XENO_TRIALS_CORPORATE_STAGES_V190: corporate }));
}

test('V192 succeeds the physical 0e98438 tree: each predecessor exists there and every named new input is absent', () => {
  assert.equal(baseline, '0e9843808823a9ce9da73e5b2effeefa1ee51f26');
  const previousPaths = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', baseline], { cwd: root, encoding: 'utf8' }).trim().split('\n'));
  assert.ok(Object.keys(successors).length > 0); assert.ok(Object.keys(inputs).length > 0);
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(previousPaths.has(path), 'A successor must exist in the real baseline: ' + path);
    assert.equal(sha(readBaseline(path)), receipt.previousSha256, path);
    assert.equal(sha(read(path)), receipt.currentSha256, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.equal(previousPaths.has(path), false, 'An added input must not exist in the real baseline: ' + path);
    assert.equal(sha(read(path)), receipt.sha256, path);
  }
  for (const [path, digest] of Object.entries(plates)) {
    assert.equal(sha(readBaseline(path)), digest, path);
    assert.equal(sha(read(path)), digest, path);
  }
});

test('all six historical declaration blocks remain exact, including the 27/26/12 V191 receipts, without transferring results', () => {
  assert.equal(Object.keys(protocolSuccessors).length, 27); assert.equal(Object.keys(protocolInputs).length, 26); assert.equal(Object.keys(protocolPlates).length, 12);
  assert.equal(Object.keys(priorSuccessors).length, 35); assert.equal(Object.keys(priorInputs).length, 26); assert.equal(Object.keys(priorPlates).length, 4);
  assert.equal(Object.keys(oldSuccessors).length, 17); assert.equal(Object.keys(oldInputs).length, 25); assert.equal(Object.keys(oldPlates).length, 4);
  assert.equal(Object.keys(STAGE_OPERATIONS_SUCCESSORS_V188).length, 22);
  assert.equal(Object.keys(STAGE_OPERATIONS_NEW_INPUTS_V188).length, 22); assert.equal(Object.keys(STAGE_OPERATIONS_PRESERVED_PLATES_V188).length, 4);
  assert.equal(Object.keys(COMPLETION_SOURCES_V186).length, 71);
  for (const [path, receipt] of Object.entries(declarations)) {
    const text = read(path).toString(), old = readBaseline(path).toString();
    const extract = value => value.slice(value.indexOf(receipt.start), value.indexOf(receipt.end));
    assert.equal(extract(text), extract(old), path); assert.equal(sha(extract(text)), receipt.sha256, path);
  }
  // A later renderer is an explicit successor of the published V191 ledger;
  // copying its current hash into the historical ledger cannot supply proof.
  const ledgerPath = 'docs/forge/xeno-trials/animation-coverage-v191.json';
  assert.equal(sha(read(ledgerPath)), sha(readBaseline(ledgerPath)));
  const ledger = JSON.parse(read(ledgerPath)), runtimePath = 'src/xeno-trials-runtime-v96.js';
  const historicalRuntime = ledger.sourceSha256[runtimePath];
  assert.equal(historicalRuntime, sha(readBaseline(runtimePath)));
  assert.equal(successors[runtimePath].previousSha256, historicalRuntime);
  assert.equal(advance(runtimePath, historicalRuntime), sha(read(runtimePath)));
  for (const forged of ['0'.repeat(64), sha(read(runtimePath))])
    assert.throws(() => advance(runtimePath, forged), /Incorrect V191 endpoint for V192/);
  for (const guard of [verify, verifyArbiterProtocolsV191, verifyArbiterCampaignV190, verifyAnimationAudioV189, verifyStageOperationsV188, verifyCompletionV186])
    assert.equal(guard().historicalResultsTransferred, false);
});

test('complete-history CI and credential isolation remain byte-identical to the public V191 baseline', () => {
  const option = '          fetch-depth: 0\n';
  for (const path of ['.github/workflows/full-release-v143.yml', '.github/workflows/non-forge-regression-v163.yml']) {
    const text = read(path).toString(); assert.equal(text.split(option).length - 1, 1, path);
    assert.equal(text, readBaseline(path).toString(), path);
    assert.match(text, /          persist-credentials: false\n          fetch-depth: 0\n/);
  }
});

test('the complete fifty-stage historical prefix and its admitted backdrop bytes survive the exact fifty new IDs', () => {
  const old = baselineStageCatalog();
  assert.equal(old.length, legacy.count); assert.equal(legacy.count, 50);
  assert.deepEqual(old.map(stage => stage.id), legacy.stageIds);
  assert.equal(sha(canonical(old)), legacy.canonicalSha256, 'The baseline data receipt cannot be replaced by current source bytes.');
  assert.equal(catalog.length, 100); assert.equal(new Set(catalog.map(stage => stage.id)).size, 100);
  const currentPrefix = JSON.parse(JSON.stringify(catalog.slice(0, legacy.count)));
  assert.deepEqual(currentPrefix, old, 'All fifty historical stage objects and their order remain exact.');
  assert.equal(sha(canonical(currentPrefix)), legacy.canonicalSha256);
  const newIds = catalog.slice(legacy.count).map(stage => stage.id);
  assert.equal(newIds.length, 50); assert.ok(newIds.every(id => id.startsWith('xt192-') && !legacy.stageIds.includes(id)));
  // The three procedural base arenas have no backdrop. This comparison covers
  // the actual files named by the other old stage objects, not fifty journeys.
  const backdropPaths = new Set(old.map(stage => stage.backdrop).filter(Boolean).map(path => path.replace(/^\//, '')));
  assert.equal(backdropPaths.size, 47);
  for (const path of backdropPaths) assert.equal(sha(read(path)), sha(readBaseline(path)), 'Historical backdrop changed: ' + path);
});

test('strict V192 transitions refuse invented, missing and already advanced predecessors; unknown paths gain no admission', () => {
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt)); assert.equal(advance(path, receipt.previousSha256), receipt.currentSha256, path);
    for (const bad of ['0'.repeat(64), null, undefined, receipt.currentSha256])
      assert.throws(() => advance(path, bad), /Incorrect V191 endpoint for V192/, path);
  }
  assert.equal(advance('src/unreviewed-v192.js', 'historic'), 'historic');
  assert.equal(Object.hasOwn(inputs, 'src/unreviewed-v192.js'), false);
});

test('every current V192 byte, added input and preserved plate rejects corruption through the entire historical chain', () => {
  verify(); verifyCompletionV186();
  for (const path of [...Object.keys(successors), ...Object.keys(inputs), ...Object.keys(plates)]) {
    const modified = changed(path);
    for (const guard of [verify, verifyArbiterProtocolsV191, verifyCompletionV186])
      assert.throws(() => guard(modified), error => error.message.includes(path) && /Unreviewed|Historical/.test(error.message), path);
    if (successors[path]) assert.throws(() => advance(path, sha(modified(path))), /Incorrect V191 endpoint for V192/, path);
  }
});

test('the complete source chain keeps archival defaults and admits only the exact reviewed V192 runtime extension', () => {
  const { previous, current } = loadAuditSuccessionV163(read);
  assert.deepEqual(resolveAuditSourcesV163(previous, read), current.runtimeSourceSha256);
  const effective = resolveAuditSourcesV163(previous, read, { effective: true });
  for (const [path, receipt] of Object.entries(successors).filter(([, r]) => r.kind === 'runtime')) assert.equal(effective[path], receipt.currentSha256, path);
  const addedRuntime = Object.entries(inputs).filter(([, r]) => r.kind === 'runtime');
  assert.ok(addedRuntime.length >= 3, 'Catalog, scene and renderer runtime modules must be explicit inputs.');
  for (const [path, receipt] of addedRuntime) assert.equal(effective[path], receipt.sha256, path);
  const frozen = Object.freeze({ original: 'historic' }), view = runtime(frozen);
  assert.deepEqual(frozen, { original: 'historic' }); assert.ok(Object.isFrozen(view)); assert.deepEqual(runtime(view), view);
  const first = Object.entries(successors).find(([, r]) => r.kind === 'runtime'); assert.ok(first);
  assert.throws(() => runtime({ [first[0]]: '0'.repeat(64) }), /Incorrect V192 runtime view predecessor/);
});

test('V192 is the exact terminal, pins its V191 relay and keeps tools, production records and mutable outcomes out of the game build', () => {
  const terminal = 'scripts/audit-xeno-franchise-stages-v192.mjs', relay = 'scripts/audit-xeno-arbiter-protocols-v191.mjs';
  assert.equal(/(?:from\s*|import\s*\(?\s*)['"]\.\//.test(read(terminal).toString()), false);
  assert.equal(Object.hasOwn(successors, terminal) || Object.hasOwn(inputs, terminal), false);
  assert.ok(successors[relay]); assert.match(read(relay).toString(), /from '\.\/audit-xeno-franchise-stages-v192\.mjs'/);
  for (const path of [terminal, ...Object.keys(inputs)]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    if (path.startsWith('scripts/') || path.startsWith('docs/')) assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of mutableReports) {
    assert.equal(Object.hasOwn(inputs, path) || Object.hasOwn(successors, path), false, 'Outcomes remain independent of source admission.');
    assert.equal(isPublicDistributionPathV86(path), true, path); assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['scripts/audit-xeno-franchise-unreviewed-v192.mjs', 'docs/forge/xeno-trials/franchise-unreviewed-v192.json',
    'assets/openai/stages/xeno-trials-v192/screen/unreviewed-stage.png']) assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === 'scripts/verify-xeno-franchise-stages-audit-v192.mjs').length, 1);
});
