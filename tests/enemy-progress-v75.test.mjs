import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  auditEnemyProgressV75,
  V75_EXPECTED_COUNTS,
  V75_EXPECTED_INTEGRATED_PROFILES,
  V75_EXPECTED_REJECTED_PROFILES
} from '../scripts/enemy-progress-v75.mjs';

test('V75 verrouille le snapshot central sans réécrire le checkpoint historique V74', async () => {
  const report = await auditEnemyProgressV75();
  const recorded = JSON.parse(await readFile(
    new URL('../docs/references/V75_ENEMY_PROGRESS.json', import.meta.url),
    'utf8'
  ));

  assert.deepEqual(recorded, report);
  assert.equal(report.release, '75.0.0');
  assert.equal(report.totalProfiles, 571);
  assert.equal(report.profileCount, 570);
  assert.equal(report.requiredSheets, 2457);
  assert.deepEqual(report.counts, V75_EXPECTED_COUNTS);
  assert.deepEqual(report.integratedProfiles, V75_EXPECTED_INTEGRATED_PROFILES);
  assert.deepEqual(report.reviewRejectedProfiles, V75_EXPECTED_REJECTED_PROFILES);
  assert.equal(report.integratedProfileCount, 11);
  assert.equal(report.reviewRejectedProfileCount, 5);
  assert.equal(report.unfinishedProfileCount, 559);
  assert.equal(report.previousReleaseCheckpoint.release, '74.0.0');
  assert.equal(report.previousReleaseCheckpoint.integratedProfiles.length, 3);
});

test('V75 sépare explicitement les promotions Prowler/Ceto des rejets Lurker/Atarax', async () => {
  const report = await auditEnemyProgressV75();
  const corrections = new Map(report.currentCorrections.map((entry) => [entry.profileId, entry]));

  for (const id of ['enemy-015-prowler', 'enemy-051-ceto-reef-predator']) {
    assert.equal(corrections.get(id)?.status, 'integrated');
    assert.equal(corrections.get(id)?.accepted, true);
    assert.equal(corrections.get(id)?.runtimeIntegrated, true);
    assert.equal(corrections.get(id)?.canonExact, false);
  }
  for (const id of ['enemy-011-lurker', 'enemy-023-atarax-ripper']) {
    assert.equal(corrections.get(id)?.status, 'review-rejected');
    assert.equal(corrections.get(id)?.accepted, false);
    assert.equal(corrections.get(id)?.runtimeIntegrated, false);
    assert.equal(corrections.get(id)?.canonExact, false);
    assert.match(corrections.get(id)?.note || '', /reject/i);
  }
});
