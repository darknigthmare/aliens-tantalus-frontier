import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { buildEnemyProfileRegistryV66, buildEnemyProfileSpriteSheetsV66, resolveEnemyProfileVisualFromRegistryV66, getReadyEnemyAtlasPathsForWorldV66, V66_ENEMY_ANIMATION_LAYOUTS } from '../src/enemy-profile-registry-v66.js';

const drone = ENEMIES.find((profile) => profile.id === 'enemy-004-drone-big-chap');
const ready = (profileId = drone.id) => ({ profileId, path: `/assets/openai/sprites/normalized/enemy-profiles-v66/${profileId}.webp`,
  spriteKey: 'drone', clipSet: 'enemy-action-v66', pivot: 'creature-ground', hitbox: 'xeno-tall', renderWidth: 128, renderHeight: 128,
  sourceFacing: 1, identityStatus: 'source-locked-adaptation', referenceStatus: 'CANON_REFERENCE_ADAPTATION',
  identityVerified: true, reviewStatus: 'accepted', provider: 'openai-imagegen', promptId: 'synthetic-test-reference',
  referenceUrls: ['https://example.com/test-only-reference'], canonExact: false });

test('V66 ready state is opt-in and has no filesystem or variant inference', () => {
  const registry = buildEnemyProfileRegistryV66(ENEMIES, []);
  assert.equal(registry.length, 571);
  assert.equal(registry.filter((profile) => profile.ready).length, 0);
  assert.deepEqual(buildEnemyProfileSpriteSheetsV66(registry), {});
  assert.equal(resolveEnemyProfileVisualFromRegistryV66(drone, registry), null);
});

test('V66 accepted registry uses exact profile IDs and one32pose4x8atlas', () => {
  const registry = buildEnemyProfileRegistryV66(ENEMIES, [ready()]);
  const visual = resolveEnemyProfileVisualFromRegistryV66(drone, registry);
  assert.equal(visual.sheetId, `enemy.profile.${drone.id}.v66`);
  assert.equal(visual.canonExact, false);
  assert.equal(visual.provenance.provider, 'openai-imagegen');
  assert.deepEqual(resolveEnemyProfileVisualFromRegistryV66({ name: drone.name }, registry), visual);
  assert.deepEqual(resolveEnemyProfileVisualFromRegistryV66(drone.id, registry), visual);
  const sheet = buildEnemyProfileSpriteSheetsV66(registry)[visual.sheetId];
  assert.equal(sheet.imageKey, `enemy-profile-v66:${drone.id}`);
  assert.equal(sheet.rows, 8);
  assert.equal(sheet.columns, 4);
  assert.equal(sheet.cellHeight, 256);
  assert.equal(resolveEnemyProfileVisualFromRegistryV66({ id: 'enemy-056-albino-drone-big-chap', name: drone.name }, registry), null);
  assert.equal(resolveEnemyProfileVisualFromRegistryV66({ id: 'enemy-999-unknown', name: drone.name }, registry), null);
  assert.deepEqual(getReadyEnemyAtlasPathsForWorldV66(drone.encounterWorldIds[0], registry), [ready().path]);
});

test('V66 rejects unreviewed, wrong-provider, missing-reference and canonExact claims', () => {
  for (const override of [{ identityVerified: false }, { reviewStatus: 'generated' }, { provider: 'not-openai' }, { referenceUrls: [] }, { referenceUrls: ['http://example.com'] }, { promptId: '' }, { canonExact: true }, { sourceFacing: 0 }, { normalizedSha256: 'bad' }, { renderWidth: -1 }]) {
    assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...ready(), ...override }]));
  }
});

test('V66 rejects prototype clip IDs, cross-profile paths and duplicate entries', () => {
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...ready(), renderHeight: 160 }]), /isotropic/);
  for (const clipSet of ['constructor', '__proto__', 'toString', 'enemy-action-v56']) assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...ready(), clipSet }]), /unknown animation/);
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...ready(), path: '/assets/openai/sprites/normalized/enemy-profiles-v66/another.webp' }]), /exact profile/);
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [ready(), ready()]), /Duplicate/);
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [ready('enemy-999-unknown')]), /unknown ENEMIES/);
});

test('Ovomorph lifecycle and future40pose layouts keep family-specific grids', () => {
  const egg = ready('enemy-001-ovomorph');
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [egg]), /own lifecycle/);
  const registry = buildEnemyProfileRegistryV66(ENEMIES, [{ ...egg, spriteKey: 'ovomorph', clipSet: 'ovomorph-cycle-v66' }]);
  assert.equal(Object.values(buildEnemyProfileSpriteSheetsV66(registry))[0].rows, 8);
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...ready(), clipSet: 'ovomorph-cycle-v66' }]), /another creature/);
  const queen = { ...ready('enemy-008-queen'), spriteKey: 'queen', clipSet: 'royal-action-v66' };
  const extended = buildEnemyProfileRegistryV66(ENEMIES, [queen]);
  assert.equal(Object.values(buildEnemyProfileSpriteSheetsV66(extended))[0].rows, 10);
  assert.equal(V66_ENEMY_ANIMATION_LAYOUTS['armed-action-v66'].rows, 10);
  assert.throws(() => buildEnemyProfileRegistryV66(ENEMIES, [{ ...queen, grid: { columns: 4, rows: 8, cellWidth: 256, cellHeight: 256 } }]), /grid mismatch/);
});
