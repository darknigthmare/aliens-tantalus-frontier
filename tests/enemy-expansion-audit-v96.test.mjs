import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content.js';
import { ENEMY_STATIC_POSES_V95 } from '../src/enemy-static-poses-v95.js';
import { ENEMY_EXPANSION_CANDIDATES_V96, ENEMY_EXPANSION_SOURCES_V96, getEnemyExpansionCandidateV96 } from '../src/enemy-expansion-candidates-v96.js';
import { auditEnemyRosterV96, classifyEnemyVisualV96, holdScopeReviewV96 } from '../docs/references/v96-xeno-trials/audit-roster-v96.mjs';

test('V96 candidates are immutable research metadata, never runtime enemies without admitted PNGs', () => {
  assert.equal(ENEMY_EXPANSION_CANDIDATES_V96.length, 6);
  assert.equal(new Set(ENEMY_EXPANSION_CANDIDATES_V96.map(c => c.id)).size, 6);
  const activeIds = new Set([...ENEMIES, ...ENEMY_STATIC_POSES_V95].map(e => e.id));
  for (const c of ENEMY_EXPANSION_CANDIDATES_V96) {
    assert.equal(activeIds.has(c.id), false);
    for (const key of ['runtimeActive', 'automaticEncounter', 'eligible', 'canonExact']) assert.equal(c[key], false);
    assert.equal(c.blocked, true);
    assert.equal(c.assetStatus, 'not-admitted');
    assert.equal(c.animationStatus, 'missing');
    assert.equal(c.path, undefined);
    assert.equal(Object.isFrozen(c), true);
    for (const id of c.sourceIds) assert.ok(ENEMY_EXPANSION_SOURCES_V96[id]);
    assert.equal(getEnemyExpansionCandidateV96(c.id), c);
  }
  assert.equal(getEnemyExpansionCandidateV96('__proto__'), null);
  assert.equal(getEnemyExpansionCandidateV96({}), null);
});

test('licensed toy/comic designs and secondary references are explicitly qualified', () => {
  assert.equal(getEnemyExpansionCandidateV96('pose-v96-kenner-mantis').sourceKind, 'licensed-toy-comic-line');
  assert.equal(getEnemyExpansionCandidateV96('pose-v96-kenner-queen-facehugger').prioritized, false);
  assert.equal(getEnemyExpansionCandidateV96('pose-v96-afe-synth-warden').sourceStatus, 'secondary-identity-reference-visual-lock-pending');
  assert.equal(ENEMY_EXPANSION_SOURCES_V96.afeGameSpot.authority, 'secondary-gameplay-guide');
  assert.match(ENEMY_EXPANSION_SOURCES_V96.afeOfficial.limitation, /Not used as proof/);
});

test('unknown/fallback profiles cannot be promoted by filenames and legacy rows stay separate', () => {
  assert.equal(classifyEnemyVisualV96(null), 'shared-family-fallback');
  assert.equal(classifyEnemyVisualV96({ path: '/existing.png', approximate: true }), 'shared-family-fallback');
  assert.equal(classifyEnemyVisualV96({ approximate: false, legacy: true, row: 2 }), 'identity-specific-legacy-row');
  assert.equal(classifyEnemyVisualV96({ approximate: false, legacy: false }), 'identity-specific-atlas');
});

test('V95 baseline reconciles catalog IDs, separate static identities, production gaps and holds', () => {
  const report = auditEnemyRosterV96({ hashFiles: false });
  assert.equal(report.totals.catalogProfiles, 571);
  assert.equal(report.totals.standardProfiles, 55);
  assert.equal(report.totals.systemicVariants, 516);
  assert.deepEqual(report.totals.coverage, { 'identity-specific-atlas': 54, 'identity-specific-legacy-row': 2, 'shared-family-fallback': 515 });
  assert.equal(report.totals.staticIdentities, 100);
  assert.equal(report.totals.staticProfilesWithCounterparts, 16);
  assert.equal(report.totals.heldSourceFiles, 17);
  assert.equal(report.totals.expansionDuplicateIdentities, 0);
  assert.equal(report.totals.queuedDedicatedProfiles, 515);
  assert.equal(report.totals.eligibleProductionJobs + report.totals.blockedProductionJobs, 515);
  assert.equal(report.totals.missingCurrentAssets, 0);
  assert.equal(report.totals.staticMissingAssets, 0);
  assert.ok(report.holds.every(h => h.retry === false));
  assert.deepEqual(report.totals.queuedProvenance, { 'systemic-variant': 415, 'licensed-concept-adaptation': 100 });
  assert.ok(report.productionQueue.every(j => j.modifier !== 'Standard' && j.canonExact === false));
  assert.ok(report.profiles.every(p => p.fidelityCertified === false));
  const armored = report.productionQueue.find(j => j.profileId === 'enemy-145-armored-working-joe');
  assert.equal(armored.prioritized, true);
  assert.equal(armored.blocked, true);
  assert.equal(armored.sourceStatus, 'variant-design-lock-pending');
  assert.equal(armored.requiredClips.length, 5);
  assert.deepEqual(armored.staticCounterpartIds, []);
});

test('held scopes require review without suggesting retries', () => {
  const holds = [{ file: 'Xeno-Prowler.jpg' }, { file: 'Xeno-Drone-Variante.jpg' }];
  assert.deepEqual(holdScopeReviewV96('Prowler', holds), ['Xeno-Prowler.jpg']);
  assert.deepEqual(holdScopeReviewV96('Working Joe', holds), []);
  const overlap = auditEnemyRosterV96({ hashFiles: false }).productionQueue.filter(j => j.priorHoldSourceNames.length);
  assert.ok(overlap.length > 0);
  assert.ok(overlap.every(j => j.blocked && !j.eligible && j.sourceStatus === 'held-scope-review'));
});

test('manifest deterministic; Arachnoid grey/purple remain states of one identity', () => {
  const first = auditEnemyRosterV96({ hashFiles: false });
  assert.deepEqual(first, auditEnemyRosterV96({ hashFiles: false }));
  const arachnoid = first.staticProfiles.find(p => p.profileId === 'castes-game_avp_capcom_arachnoid');
  assert.deepEqual(arachnoid.states.map(s => s.stateId), ['grey', 'purple']);
  assert.ok(arachnoid.states.every(s => s.changesIdentity === false));
});
