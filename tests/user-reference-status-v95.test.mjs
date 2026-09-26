import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { USER_REFERENCE_ART_V95 } from '../src/user-reference-art-v95.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const doc = name => new URL(`../docs/references/v95-user-creatures/${name}`, import.meta.url);
const status = JSON.parse(await readFile(doc('STATUS-20260926.json'), 'utf8'));

test('V95 published progress receipt exactly matches the real registries and latest private generation receipts', () => {
  const derived = JSON.parse(execFileSync(process.execPath, ['docs/references/v95-user-creatures/inspect-status-v95.mjs'],
    { cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 }));
  assert.deepEqual(status, derived);
  assert.equal(status.entries.length, 79);
  assert.equal(new Set(status.entries.map(entry => entry.sourceNumber)).size, 79);
  assert.equal(status.counts.admittedSourceFiles + status.counts.held + status.counts.pending, 79);
  assert.equal(status.counts.nativePngs, USER_REFERENCE_ART_V95.length);
});

test('V95 source 25 admission supersedes a provisional RGB preview rejection with real alpha composite evidence', async () => {
  const attempts = JSON.parse(await readFile(doc('generation-quality-25-20260926.json'), 'utf8'));
  const admission = JSON.parse(await readFile(doc('ADMISSION-25-20260926.json'), 'utf8'));
  const entry = status.entries.find(row => row.sourceNumber === 25);
  const art = USER_REFERENCE_ART_V95.find(art => art.sourceNumber === 25);
  assert.equal(attempts.at(-1).runtimeAdmission, false, 'Preserve the earlier mistaken preview receipt as history');
  assert.equal(admission.sourceNumber, 25);
  assert.equal(admission.runtimeAdmission, true);
  assert.equal(admission.supersedes, 'generation-quality-25-20260926.json');
  assert.deepEqual(admission.review.backgrounds, ['white', 'checker', 'black']);
  assert.equal(entry.status, 'admitted-enemy');
  assert.equal(entry.asset, art.path);
  assert.equal(entry.assetSha256, admission.sha256);
  assert.equal(art.sha256, attempts.at(-1).audit.sha256, 'Admitted native output was not repainted');
  const bytes = await readFile(new URL(`..${art.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), admission.sha256);
  assert.equal(bytes.length, admission.bytes);
  assert.equal(art.identityStatus, 'provisional-unidentified');
  assert.equal(art.canonExact, false);
});

test('V95 source 56 has a distinct Defender identity and no pending identity-review destination', () => {
  const defender = status.entries.find(entry => entry.sourceNumber === 56);
  assert.equal(defender.status, 'admitted-enemy');
  assert.equal(defender.parentId, 'pose-v95-user-xeno-defender');
  assert.equal(defender.legacyCandidateIds, undefined);
  assert.equal(status.counts.galleryIdentityReviews, 0);
  assert.equal(status.counts.galleryEffects, 1);
});

test('Arachnoid colour art is counted separately without adding an archive source or another enemy identity', () => {
  const family = status.historicalColourVariants.find(row => row.profileId === 'castes-game_avp_capcom_arachnoid');
  assert.deepEqual(family.states.map(state => state.stateId), ['grey', 'purple']);
  assert.equal(family.defaultStateId, 'grey');
  assert.equal(new Set(family.states.map(state => state.path)).size, 2);
  assert.equal(status.counts.sources, 79);
  assert.equal(status.counts.additionalHistoricalVariantPngs, 1);
  assert.equal(status.counts.totalNewNativePngs, status.counts.nativePngs + 1);
  assert.equal(status.entries.some(entry => entry.parentId === family.profileId), false);
});
