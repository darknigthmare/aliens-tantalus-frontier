import test from 'node:test';
import assert from 'node:assert/strict';
import { auditEnemyProgressV74 } from '../scripts/enemy-progress-v74.mjs';

test('V74 keeps the frozen fifty and never turns normalization or candidate generation into completion', async () => {
  const report = await auditEnemyProgressV74();
  assert.equal(report.profileCount, 50);
  assert.equal(report.profiles[0].profileId, 'enemy-007-praetorian');
  assert.equal(report.profiles.at(-1).profileId, 'enemy-057-albino-warrior');
  assert.ok(!report.profiles.some(p => p.profileId === 'enemy-020-k-series-yellow-xenomorph'));
  assert.equal(report.requiredSheets, 216);
  assert.equal(report.unfinishedProfileCount, 50 - report.integratedProfiles.length);
  assert.equal(report.visualReviewRequired, true);
  for (const id of ['enemy-049-wild-boar-host', 'enemy-054-albino-facehugger']) {
    assert.ok(!report.integratedProfiles.includes(id));
    assert.ok(report.currentCorrections.find(entry => entry.profileId === id)?.blocked);
  }
  assert.match(report.warning, /never certify visual fidelity/);
});
