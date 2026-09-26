import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { auditPngBufferV95 } from '../docs/references/v95-user-creatures/audit-pngs-v95.mjs';
import { ENEMY_STATIC_POSES_V94 } from '../src/enemy-static-poses-v94.js';
import { ENEMY_USER_CREATIONS_V95 } from '../src/enemy-user-creations-v95.js';
import { USER_REFERENCE_ART_V95 } from '../src/user-reference-art-v95.js';
import { USER_EQUIPMENT_ART_V95 } from '../src/user-equipment-art-v95.js';
import { USER_REFERENCE_GALLERY_V95 } from '../src/user-reference-effects-v95.js';
import { ENEMY_STATIC_POSES_V95, ENEMY_STATIC_POSE_IDS_V95, ENEMY_STATIC_POSE_PATHS_V95,
  getEnemyStaticPoseV95, sanitizeEnemyStaticPoseStateV95 } from '../src/enemy-static-poses-v95.js';
import { ENEMIES } from '../src/content.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const inventory = JSON.parse(await readFile(join(root, 'docs/references/v95-user-creatures/INVENTORY.json'), 'utf8'));
const references = new Map(inventory.entries.map(entry => [entry.file, entry]));
const admittedVisuals = ENEMY_USER_CREATIONS_V95.flatMap(definition => [
  { parent: definition, visual: definition },
  ...(definition.states || []).map(visual => ({ parent: definition, visual }))
]);

test('V95 appends real identities while preserving all 43 V94 definitions and all 571 historical profiles', async () => {
  assert.equal(ENEMY_STATIC_POSES_V94.length, 43);
  assert.equal(ENEMIES.length, 571);
  assert.equal(hash(JSON.stringify(ENEMY_STATIC_POSES_V94)), '4cd4d97071cd64081a2b73c623f091fd258c3403f6fe3d87aefa340f33080f1a');
  assert.equal(hash(JSON.stringify(ENEMIES)), 'f609466e674e160bed8a3bdc15f6f8c41e6d788564dc4128a49dcdd0ad6e9072');
  assert.equal(ENEMY_STATIC_POSES_V95.length, 43 + ENEMY_USER_CREATIONS_V95.length);
  for (let i = 0; i < 43; i++) assert.equal(ENEMY_STATIC_POSES_V95[i], ENEMY_STATIC_POSES_V94[i], 'Keep the same historical objects');
  assert.equal(inventory.existing43Snapshot.count, 43);
  for (const snapshot of inventory.existing43Snapshot.entries) {
    const definition = ENEMY_STATIC_POSES_V94.find(entry => entry.id === snapshot.id);
    assert.ok(definition, snapshot.id); assert.equal(definition.path, snapshot.path);
    const bytes = await readFile(join(root, snapshot.path.slice(1)));
    assert.equal(bytes.length, snapshot.bytes); assert.equal(hash(bytes), snapshot.sha256);
  }
  for (const key of ['id', 'path', 'imageKey']) assert.equal(new Set(ENEMY_STATIC_POSES_V95.map(entry => entry[key])).size, ENEMY_STATIC_POSES_V95.length, key);
  assert.deepEqual(ENEMY_STATIC_POSE_IDS_V95, ENEMY_STATIC_POSES_V95.map(entry => entry.id));
  assert.equal(new Set(ENEMY_STATIC_POSE_PATHS_V95).size, ENEMY_STATIC_POSE_PATHS_V95.length);
  assert.ok(Object.isFrozen(ENEMY_USER_CREATIONS_V95) && Object.isFrozen(ENEMY_STATIC_POSES_V95));
});

test('V95 identifies provided references honestly without claiming canon, original authorship or animation', () => {
  assert.ok(ENEMY_USER_CREATIONS_V95.length > 0, 'No empty delivery registry');
  for (const definition of ENEMY_USER_CREATIONS_V95) {
    assert.match(definition.id, /^pose-v95-user-[a-z0-9-]+$/);
    assert.equal(definition.profileId, definition.id);
    assert.equal(definition.provenance, 'user-provided-reference-openai-integrated');
    assert.equal(definition.sourceProvenance, 'user-provided');
    assert.equal(definition.canonExact, false); assert.equal(definition.identityVerified, false);
    assert.equal(definition.visualMode, 'static-pose'); assert.equal(definition.animationStatus, 'missing');
    assert.equal(definition.reviewStatus, 'accepted-static-adaptation');
    assert.equal(definition.assetVerificationStatus, 'sha256-dimensions-alpha-verified');
    assert.equal(definition.geometryStatus, 'project-adaptation');
    assert.ok(Object.isFrozen(definition) && Object.isFrozen(definition.pivot));
    assert.ok(definition.referenceFiles?.length, 'Every derived PNG has a local source receipt');
    for (const reference of definition.referenceFiles) {
      const source = references.get(reference.file || reference.filename);
      assert.ok(source, JSON.stringify(reference)); assert.equal(reference.sha256, source.sha256);
      assert.equal(/[A-Z]:[\\/]|Downloads/i.test(JSON.stringify(reference)), false, 'Do not publish private absolute paths');
    }
    assert.equal(ENEMIES.some(entry => entry.id === definition.id), false);
    assert.equal(getEnemyStaticPoseV95(definition.id), definition);
    for (const invalid of [definition.name, ` ${definition.id}`, `${definition.id}:0`, null, {}, '__proto__']) assert.equal(getEnemyStaticPoseV95(invalid), null);
    if (definition.id.includes('human-xeno-armor')) assert.equal(definition.biology, 'human');
  }
});

for (const { parent, visual } of admittedVisuals) {
  test(`V95 ${parent.id} ${visual.stateId || visual.id}: real dedicated native PNG, source geometry, alpha and SHA match`, async () => {
    assert.match(visual.path, /^\/assets\/openai\/sprites\/static-enemy-v95\/[a-z0-9-]+\.png$/);
    assert.match(visual.sha256, /^[a-f0-9]{64}$/);
    const bytes = await readFile(join(root, visual.path.slice(1))), audit = auditPngBufferV95(bytes);
    assert.equal(audit.sha256, visual.sha256);
    assert.deepEqual([audit.width, audit.height], [visual.sourceWidth, visual.sourceHeight]);
    assert.deepEqual(audit.bboxAlphaAtLeast16, visual.alphaBounds);
    assert.equal(audit.alphaMin, 0); assert.ok(audit.alphaMax >= 250 && audit.alphaAtLeast16 > 0);
    assert.ok(audit.alpha0 > 0 && audit.alpha0 < audit.totalPixels, 'Neither opaque background nor empty PNG');
    for (const margin of Object.values(audit.marginsAlphaAtLeast16)) assert.ok(margin > 0, 'Visible anatomy must not touch a canvas edge');
    assert.ok(audit.meanBodyAlphaAtLeast128 >= 240, 'Body must not be a low-alpha hologram');
    assert.ok(Math.abs(visual.renderWidth / visual.renderHeight - audit.width / audit.height) < 1e-12);
    assert.ok([1, -1].includes(visual.sourceFacing));
    assert.ok(visual.pivot.x >= 0 && visual.pivot.x <= 1 && visual.pivot.y >= 0 && visual.pivot.y <= 1);
  });
}

test('V95 states retain parent identity and unknown or foreign states cannot add roster entries', () => {
  const baseIds = new Set(ENEMY_STATIC_POSES_V95.map(entry => entry.id));
  for (const definition of ENEMY_USER_CREATIONS_V95) {
    assert.equal(sanitizeEnemyStaticPoseStateV95(definition.id, 'unknown-v95-state'), null);
    assert.equal(getEnemyStaticPoseV95(definition.id, 'unknown-v95-state'), definition);
    for (const state of definition.states || []) {
      const stateId = state.stateId || state.id;
      assert.equal(baseIds.has(stateId), false);
      assert.equal(sanitizeEnemyStaticPoseStateV95(definition.id, stateId), stateId);
      const resolved = getEnemyStaticPoseV95(definition.id, stateId);
      assert.equal(resolved.id, definition.id); assert.equal(resolved.profileId, definition.id);
      assert.equal(resolved.path, state.path); assert.equal(resolved.sha256, state.sha256);
      assert.equal(resolved.health, definition.health); assert.equal(resolved.biology, definition.biology);
      assert.ok(ENEMY_STATIC_POSE_PATHS_V95.includes(state.path));
    }
  }
});

test('V95 reviewed source groups do not silently become duplicate creatures or extra armor items', () => {
  const bySource = n => ENEMY_USER_CREATIONS_V95.find(entry => entry.sourceNumber === n);
  const sharedBackground = USER_REFERENCE_ART_V95.find(entry => entry.sourceNumber === 11);
  assert.equal(sharedBackground.referenceFiles.length, 2, '11 and 20 are one composition');
  assert.equal(bySource(20), undefined);
  assert.equal(bySource(41), undefined, 'Big Xeno alternate is never a new biological identity');
  assert.equal(bySource(51), undefined, 'Carrier empty cannot add another parent');
  assert.equal(bySource(52).id, 'pose-v95-user-xeno-carrier');
  assert.equal(bySource(52).defaultStateId, 'full');
  assert.equal(bySource(52).states.length, 0, 'No invented empty image after provider refusal');
  assert.equal(bySource(16).biology, 'human');
  assert.equal(USER_EQUIPMENT_ART_V95.some(entry => entry.sourceNumber === 16), false, 'Anonymous human is not a fifth requested armor');
  assert.equal(bySource(56).id, 'pose-v95-user-xeno-defender', 'The user-confirmed Defender has its own identity');
  const defender = USER_REFERENCE_ART_V95.find(entry => entry.sourceNumber === 56);
  assert.equal(defender.kind, 'creature');
  assert.equal(defender.identityStatus, 'user-confirmed-defender-capcom-1994');
  assert.equal(defender.legacyCandidateIds, undefined);
  assert.equal(bySource(56).legacyCounterpartId, null, 'Never aliases or replaces Arachnoid');
  assert.deepEqual(defender.referenceUrls, ['https://avp.fandom.com/wiki/Defender']);
  assert.match(defender.referenceNote, /non certifiée conforme au sprite Capcom/);
  for (const n of [1, 5, 19, 27, 32, 38]) assert.equal(bySource(n).biology, 'fauna');
  for (const n of [43, 44, 64]) assert.equal(bySource(n).biology, 'synthetic');
  for (const n of [2, 3, 4, 34]) assert.equal(bySource(n), undefined);
  assert.deepEqual(USER_EQUIPMENT_ART_V95.filter(entry => entry.kind === 'armor').map(entry => entry.sourceNumber).sort((a,b)=>a-b), [28,29,30,31]);
});

test('V95 hand-reviewed display and small-body bounds remain grounded without stretching native art', () => {
  const bySource = n => ENEMY_USER_CREATIONS_V95.find(entry => entry.sourceNumber === n);
  for (const n of [13, 24, 33, 54, 55, 63]) {
    const entry = bySource(n);
    const visibleHeight = entry.renderHeight * (entry.alphaBounds[3] - entry.alphaBounds[1]) / entry.sourceHeight;
    assert.ok(entry.bodyHeight <= visibleHeight, `Source ${n}: collision cannot exceed the entire visible figure`);
  }
  for (const n of [16, 32, 49, 50, 52, 53, 59, 60, 61, 64]) {
    const entry = bySource(n);
    assert.ok(entry.renderHeight * (entry.alphaBounds[3] - entry.alphaBounds[1]) / entry.sourceHeight < 210, `Source ${n}: tall portrait reviewed`);
  }
  assert.equal(bySource(11).pivot.x, .57);
  assert.equal(bySource(14).groundContact, false);
  assert.equal(bySource(48).groundContact, false);
  assert.equal(bySource(48).pivot.y, .52, 'Swimmer body is centered in the water collider, not suspended from a foot pivot');
});

test('V95 every admitted image has the exact consumer required by its kind, without dangling gallery or item art', () => {
  for (const art of USER_REFERENCE_ART_V95) {
    assert.ok(['creature', 'armor', 'weapon', 'effect', 'reference'].includes(art.kind));
    const matches = entries => entries.filter(entry => entry.path === art.path).length;
    assert.equal(matches(ENEMY_USER_CREATIONS_V95), ['creature', 'armor'].includes(art.kind) ? 1 : 0, `${art.sourceNumber}: enemy ownership`);
    assert.equal(matches(USER_EQUIPMENT_ART_V95), ['armor', 'weapon'].includes(art.kind) ? 1 : 0, `${art.sourceNumber}: equipment ownership`);
    assert.equal(matches(USER_REFERENCE_GALLERY_V95), ['effect', 'reference'].includes(art.kind) ? 1 : 0, `${art.sourceNumber}: gallery ownership`);
  }
  for (const key of ['path', 'sha256', 'imageKey'])
    assert.equal(new Set(USER_REFERENCE_ART_V95.map(art => art[key])).size, USER_REFERENCE_ART_V95.length, `No duplicated ${key}`);
});

test('V95 production allowlist includes only admitted native poses and states; private sources stay excluded', async () => {
  const filter = createBuildAssetFilter(root);
  for (const { visual } of admittedVisuals) {
    assert.equal(filter(join(root, visual.path.slice(1))), true, visual.path);
    for (const changed of [visual.path.replace('.png', '.jpg'), visual.path.replace('.png', '-unreviewed.png'), visual.path.replace('/static-enemy-v95/', '/static-enemy-v95/candidates/')])
      assert.equal(filter(join(root, changed.slice(1))), false, changed);
  }
  for (const path of ['assets/openai/sprites/static-enemy-v95/unreviewed.png', 'docs/references/v95-user-creatures',
    'docs/references/v95-user-creatures/INVENTORY.json', 'docs/references/v95-user-creatures/candidates/xeno-antilope-01.png',
    'docs/references/v95-user-creatures/audit-pngs-v95.mjs']) assert.equal(filter(join(root, path)), false, path);
  const worker = await readFile(join(root, 'sw.js'), 'utf8');
  for (const name of ['enemy-user-creations-v95', 'enemy-static-poses-v95']) assert.ok(worker.includes(`'/src/${name}.js'`));
  assert.equal(worker.includes('/docs/references/v95-user-creatures/'), false, 'No private proof in shell');
});

test('V95 audit is strict, read-only and preserves the existing Antilope receipt', async () => {
  // The admitted runtime copy has the same immutable provider hash, without a private fixture dependency.
  const path = join(root, 'assets/openai/sprites/static-enemy-v95/xeno-antilope.png');
  const before = await readFile(path), audit = auditPngBufferV95(before);
  assert.equal(audit.sha256, 'af9fa4b0fd04d2216907e10d2340fefae8b1ac6f1b0b2d45dc9971823c07f336');
  assert.deepEqual(audit.alphaBounds, [145, 202, 1131, 1100]);
  assert.equal(audit.visiblePadding8Percent, true);
  assert.deepEqual(audit.outer8PercentBand, { fraction: 0.08, nonzeroPixels: 126, visiblePixels: 0, maxAlpha: 1 });
  assert.deepEqual(await readFile(path), before);
  for (const invalid of [Buffer.alloc(0), Buffer.from('JPEG'), before.subarray(0, before.length - 12)]) assert.throws(() => auditPngBufferV95(invalid));
  const opaqueFormat = Buffer.from(before); opaqueFormat[25] = 2;
  assert.throws(() => auditPngBufferV95(opaqueFormat), /Requires native RGBA8/);
});
