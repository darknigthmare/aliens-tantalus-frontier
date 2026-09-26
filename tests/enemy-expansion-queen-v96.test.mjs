import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { ENEMY_EXPANSION_QUEEN_V96 } from '../src/enemy-expansion-queen-v96.js';
import { auditPngFileV95 } from '../docs/references/v95-user-creatures/audit-pngs-v95.mjs';

const profile = ENEMY_EXPANSION_QUEEN_V96[0];
test('Queen Facehugger is a separate immutable licensed-toy adaptation', () => {
  assert.equal(ENEMY_EXPANSION_QUEEN_V96.length, 1);
  assert.ok(Object.isFrozen(ENEMY_EXPANSION_QUEEN_V96));
  assert.ok(Object.isFrozen(profile)); assert.ok(Object.isFrozen(profile.pivot));
  assert.equal(profile.id, 'pose-v96-kenner-queen-facehugger');
  assert.equal(profile.legacyCounterpartId, null);
  assert.equal(profile.visualMode, 'static-pose'); assert.equal(profile.animationStatus, 'missing');
  assert.equal(profile.automaticEncounter, false); assert.equal(profile.canonExact, false);
  assert.equal(profile.locomotion, 'ground'); assert.deepEqual(profile.states, []);
  assert.ok(profile.referenceUrls.some(url => url.includes('51621-Facehuggers1')));
});
test('Queen native PNG hash, dimensions, alpha and full visible margins are measured', async () => {
  const report = await auditPngFileV95(resolve(profile.path.slice(1)));
  assert.equal(report.sha256, profile.sha256);
  assert.equal(report.width, profile.sourceWidth); assert.equal(report.height, profile.sourceHeight);
  assert.deepEqual(report.alphaBounds, profile.alphaBounds);
  assert.equal(report.alphaMin, 0); assert.equal(report.alphaMax, 254);
  assert.ok(report.transparentFraction > .7);
  assert.ok(report.meanBodyAlphaAtLeast128 > 245);
  assert.ok(Object.values(report.marginsAlphaAtLeast16).every(value => value > 0));
  assert.equal(profile.pivot.y, report.alphaBounds[3] / profile.sourceHeight);
});
test('Queen scale preserves the source aspect and a bounded ground collision body', () => {
  assert.equal(profile.renderHeight / profile.renderWidth, profile.sourceHeight / profile.sourceWidth);
  assert.ok(profile.pivot.x > .4 && profile.pivot.x < .65);
  assert.ok(profile.bodyWidth > 0 && profile.bodyWidth < profile.renderWidth);
  assert.ok(profile.bodyHeight > 0 && profile.bodyHeight < profile.renderHeight);
});
