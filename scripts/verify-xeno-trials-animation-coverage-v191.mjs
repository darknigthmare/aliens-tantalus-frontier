import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsAnimationCoverageV189 as oldCoverage, getXenoTrialsAnimationCoverageSummaryV189 as oldSummary } from '../src/xeno-trials-animation-coverage-v189.js';
import { XENO_TRIALS_ANIMATION_ACTIONS_V191 as actions, getXenoTrialsAnimationCoverageV191 as coverage,
  getXenoTrialsAnimationCoverageListV191 as list, getXenoTrialsAnimationCoverageSummaryV191 as summary } from '../src/xeno-trials-animation-coverage-v191.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191 as atlases, getXenoTrialsSpriteAtlasV191 as atlasFor } from '../src/xeno-trials-sprite-atlas-v191.js';
import { FRANCHISE_STAGES_BASELINE_V192 as publicationBaseline, FRANCHISE_STAGES_SUCCESSORS_V192 as successors,
  reviewedFranchiseStagesDigestV192 } from './audit-xeno-franchise-stages-v192.mjs';

const reportPath = 'docs/forge/xeno-trials/animation-coverage-v191.json';
const reportBytes = readFileSync(new URL('../' + reportPath, import.meta.url));
const report = JSON.parse(reportBytes);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readPublicationBaseline = path => execFileSync('git', ['show', publicationBaseline + ':' + path], {
  cwd: new URL('../', import.meta.url), maxBuffer: 32 * 1024 * 1024 });
const combat = ['defender', 'chrysalis', 'smasher', 'user-brute'], special = ['warrior', 'runner', 'prowler', 'spitter'];
const combatStates = ['idle', 'walk', 'light', 'heavy', 'guard', 'hurt', 'ko'];

test('the new ledger is source-bound, reproducible and keeps its V189 predecessor report byte-identical', () => {
  assert.equal(report.schema, 191); assert.equal(report.baseCommit, '07f9525c18c9b55cf21ae93fe758209f64ed8ff4');
  assert.equal(publicationBaseline, '0e9843808823a9ce9da73e5b2effeefa1ee51f26');
  assert.equal(sha(reportBytes), sha(readPublicationBaseline(reportPath)), 'The published V191 ledger remains historical exact bytes.');
  assert.deepEqual(report.summary, summary()); assert.deepEqual(report.entries, list());
  const reviewedPaths = [];
  for (const [path, expected] of Object.entries(report.sourceSha256)) {
    const current = sha(readFileSync(new URL('../' + path, import.meta.url)));
    if (path === 'src/xeno-trials-runtime-v96.js') {
      // The fifty-stage continuation changes this renderer, not the V191
      // animation ledger. Bind its old digest to the physical published tree
      // before advancing that one source through the reviewed V192 receipt.
      assert.equal(sha(readPublicationBaseline(path)), expected, 'The V191 runtime digest must match its real publication baseline.');
      assert.equal(successors[path]?.previousSha256, expected, path);
      assert.equal(current, reviewedFranchiseStagesDigestV192(path, expected), path);
      reviewedPaths.push(path);
    } else assert.equal(current, expected, path);
  }
  assert.deepEqual(reviewedPaths, ['src/xeno-trials-runtime-v96.js']);
  assert.ok(report.scope.includes('capture drawings remain outside'));
  const historical = oldSummary(); assert.equal(historical.schema, 189); assert.equal(historical.uniqueAdmittedDrawnFrames, 160);
  assert.equal(historical.trialsDrawnFrames, 120); assert.equal(historical.byAction.special.drawn, 0);
});

test('all189 exact identities retain the same ten action capabilities while only their newly drawn states gain V191 sources', () => {
  assert.equal(list().length, 189); assert.deepEqual(list().map(entry => entry.id), fighters.map(fighter => fighter.id));
  assert.equal(new Set(list().map(entry => entry.profileId)).size, 189);
  assert.deepEqual(actions, ['idle', 'walk', 'air', 'light', 'heavy', 'guard', 'hurt', 'ko', 'special', 'presentation']);
  assert.equal(coverage('unknown'), null); assert.equal(coverage({ id: 'warrior', profileId: 'another-caste' }), null);
});

for (const fighter of fighters) test(`${fighter.id}: exact admitted sources distinguish supported actions, drawn keys, partial meshes and static fallback`, () => {
  const current = coverage(fighter.id), previous = oldCoverage(fighter.id), atlas = atlasFor(fighter, getXenoTrialsArtV96(fighter.id));
  assert.equal(current.profileId, fighter.profileId); assert.equal(current.artPath, getXenoTrialsArtV96(fighter.id).path);
  assert.equal(current.canonExact, false); assert.equal(current.fullAnimation, false);
  for (const action of actions) {
    const changed = atlas && (atlas.kind === 'special' ? action === 'special' : combatStates.includes(action));
    assert.equal(current.states[action].supported, previous.states[action].supported, action);
    if (!changed) { assert.deepEqual(current.states[action], previous.states[action]); continue; }
    const state = current.states[action]; assert.equal(state.renderKind, 'drawn'); assert.equal(state.motionSupported, true);
    assert.equal(state.sources[0].path, atlas.texture.path); assert.equal(state.sources[0].revision, 191);
    assert.deepEqual(state.sources.slice(1), previous.states[action].sources);
    assert.deepEqual(state.frameIds, state.sources[0].frameIds);
    assert.ok(state.frameIds.every(id => atlas.frames.some(frame => frame.id === id)));
    assert.ok(state.limitations.includes('capture-and-sequence-keep-priority') || state.limitations.includes('capture-and-sequence-and-reaction-keep-priority'));
  }
  assert.equal(current.fullProne, previous.fullProne || combat.includes(fighter.id));
});

test('counts include eighty new drawings once, twenty-one gesturing profiles, twelve full prone sets and four partial specials', () => {
  const result = summary();
  assert.equal(result.schema, 191); assert.equal(result.roster, 189); assert.equal(result.drawnProfiles, 21);
  assert.equal(result.fullProneProfiles, 12); assert.equal(result.uniqueAdmittedDrawnFrames, 240);
  assert.equal(result.trialsDrawnFrames, 200); assert.equal(result.newDrawnFrames, 80);
  assert.equal(result.byAction.special.drawn, 4); assert.equal(result.byAction.air.drawn, 4);
  assert.equal(result.canonExact, 0); assert.equal(result.fullyAnimated, 0);
  assert.equal(atlases.length, 8); assert.equal(atlases.flatMap(atlas => atlas.frames).length, 80);
  for (const action of actions) {
    const row = result.byAction[action]; assert.equal(row.drawn + row.mesh + row.static, 189);
  }
});

test('special coverage is grounded for Runner and explicit about Prowler free active keys and native fallback rather than promising supers', () => {
  for (const id of special) {
    const entry = coverage(id), state = entry.states.special;
    assert.equal(state.frameIds.length, 10); assert.equal(state.effectsSupported, true);
    assert.ok(state.limitations.includes('no-super-coverage'));
    assert.equal(entry.fullAnimation, false);
    if (id === 'prowler') assert.ok(state.limitations.includes('native-airborne-active-keys-grounded-startup-and-recovery-with-honest-fallback'));
    else assert.ok(state.limitations.includes('grounded-only-no-invented-air-impulse'));
  }
  for (const id of combat) assert.deepEqual(coverage(id).states.special, oldCoverage(id).states.special);
});

test('readonly cached entries cannot mutate runtime registries, the historical ledger or another fighter', () => {
  const before = JSON.stringify(oldSummary()), first = coverage('prowler');
  assert.equal(first, coverage({ id: 'prowler', profileId: first.profileId }));
  assert.ok(Object.isFrozen(first)); assert.ok(Object.isFrozen(first.states.special.frameIds));
  assert.throws(() => first.states.special.frameIds.push('fabricated'), TypeError);
  assert.throws(() => { first.states.special.sources[0].path = '/substitute.png'; }, TypeError);
  assert.equal(JSON.stringify(oldSummary()), before);
  assert.notEqual(coverage('runner'), first);
  const existingLabels = new Set(['Gestes dessinés', 'Gestes articulés', 'Posture de référence']);
  assert.ok(list().every(entry => existingLabels.has(entry.playerLabel)));
});
