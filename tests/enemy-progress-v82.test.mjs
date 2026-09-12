import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { auditEnemyProgressV82, reconcileEnemyCoverageV82, V82_PROGRESS_PATH } from '../scripts/enemy-progress-v82.mjs';

const read = path => readFile(new URL('../' + path.replace(/^\//, ''), import.meta.url));

test('V82 reconciles current production with the historical V75 checkpoint and separate Facehugger baseline', async () => {
  const before = await read('docs/references/V75_ENEMY_PROGRESS.json');
  const report = await auditEnemyProgressV82();
  assert.equal(report.totalProfiles, 571);
  assert.equal(report.productionJobs, 570);
  assert.equal(report.integratedProductionProfiles, 13);
  assert.equal(report.integratedBaselineProfiles, 1);
  assert.equal(report.integratedTotalProfiles, 14);
  assert.equal(report.notIntegratedProfiles, 557);
  assert.deepEqual(report.integratedBaselineIds, ['enemy-002-facehugger']);
  assert.deepEqual(report.integratedSinceV75, ['enemy-009-crusher', 'enemy-010-spitter']);
  assert.equal(report.historicalCheckpoint.notIntegratedProfiles, 559);
  assert.deepEqual(await read('docs/references/V75_ENEMY_PROGRESS.json'), before);
  assert.deepEqual(JSON.parse(await read(V82_PROGRESS_PATH)), report);
  assert.ok(report.profiles.every(profile => profile.sourceHashesVerified >= 4
    && profile.commercialCompletionCertified === false && profile.canonExact === false));
  assert.ok(report.historicalRejectedStillNotIntegrated.includes('enemy-011-lurker'));
  assert.ok(report.historicalRejectedStillNotIntegrated.includes('enemy-023-atarax-ripper'));
});

test('V82 refuses a changed atlas even when metadata and acceptance claim success', async () => {
  await assert.rejects(auditEnemyProgressV82({
    readBytes: path => path.endsWith('enemy-009-crusher.webp') ? Promise.resolve(Buffer.from('changed')) : read(path)
  }), /Hash mismatch.*enemy-009-crusher/);
});

test('V82 refuses changed authored sources independently of the normalized atlas', async () => {
  await assert.rejects(auditEnemyProgressV82({
    readBytes: path => path.endsWith('enemy-010-spitter/idle.png') ? Promise.resolve(Buffer.from('changed')) : read(path)
  }), /Hash mismatch.*enemy-010-spitter\/idle/);
});

test('V82 refuses an accepted profile that resolves to a fallback in the production actor', async () => {
  await assert.rejects(auditEnemyProgressV82({ createRuntimeActor: () => ({ visualSheetId: 'enemy.pathogen.fallback' }) }),
    /Production runtime mismatch/);
});

test('V82 never promotes an unaccepted existing candidate and never counts the baseline twice', () => {
  const scope = { catalogIds: ['base', 'accepted', 'candidate'], productionIds: ['accepted', 'candidate'],
    baselineIds: ['base'], verifiedIds: ['base', 'accepted'] };
  const report = reconcileEnemyCoverageV82(scope);
  assert.equal(report.integratedProductionProfiles, 1);
  assert.equal(report.notIntegratedProfiles, 1);
  assert.throws(() => reconcileEnemyCoverageV82({ ...scope, verifiedIds: ['base', 'base'] }), /Duplicate/);
  assert.throws(() => reconcileEnemyCoverageV82({ ...scope, productionIds: ['base', 'accepted', 'candidate'] }), /Baseline counted/);
  assert.throws(() => reconcileEnemyCoverageV82({ ...scope, verifiedIds: ['missing'] }), /Unknown accepted/);
});
