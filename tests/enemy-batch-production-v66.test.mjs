import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../src/content-core-v50.js';
import { ANIMATION_CONTRACTS, FIRST_BATCH_IDS, normalizeEnemyIdentity, reviewedReference } from '../scripts/enemy-batch-contracts.mjs';
import { REVIEW_CHECKS, buildEnemyBatchQueue, appendProductionEvent, emptyState, getJobStatus, scopedPath, summarizeQueue } from '../scripts/enemy-batch-production.mjs';

const reference = { status: 'reviewed', urls: ['https://example.com/canonical-reference'], localPaths: [], designLock: 'Test-only reference lock, not production art.', reviewer: 'test', reviewedAt: '2026-08-31', canonExact: false };
const refs = { profiles: Object.fromEntries(FIRST_BATCH_IDS.map((id) => [id, reference])) };
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'atf-v66-batch-test-'));
  const queue = buildEnemyBatchQueue({ references: refs });
  const job = queue.jobs[0];
  for (const clip of job.clips) {
    const target = scopedPath(root, clip.sourcePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `synthetic provenance fixture ${clip.id}`);
  }
  return { root, queue, job };
}
async function generated(fix, state = emptyState()) {
  for (const clip of fix.job.clips) state = await appendProductionEvent(fix.queue, state, { kind: 'generated', profileId: fix.job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: `test-only-${clip.id}`, actualPromptText: `Synthetic test prompt for ${clip.id}`, actor: 'test', note: 'Synthetic fixture, never production art.' }, fix.root);
  return state;
}
async function normalized(fix) {
  const atlas = scopedPath(fix.root, fix.job.normalizedPath);
  await mkdir(dirname(atlas), { recursive: true });
  await writeFile(atlas, 'test atlas bytes, not an image');
  const metadata = { profileId: fix.job.profileId, normalizationStatus: 'validated', normalizedSha256: hash(await readFile(atlas)), validation: { findings: [] }, sources: await Promise.all(fix.job.clips.map(async (clip) => ({ clip: clip.id, path: clip.sourcePath, sha256: hash(await readFile(scopedPath(fix.root, clip.sourcePath))) }))) };
  const target = scopedPath(fix.root, fix.job.metadataPath);
  const anchorPath = 'synthetic-anchor-review.json';
  await writeFile(scopedPath(fix.root, anchorPath), 'synthetic test roots; never production measurements');
  metadata.physicalAnchorReview = { path: anchorPath, sha256: hash(await readFile(scopedPath(fix.root, anchorPath))), status: 'reviewed', reviewedPoseCount: fix.job.clips.length * 8 };
  metadata.placements = Array.from({ length: fix.job.clips.length * 8 }, () => ({ anchorStatus: 'reviewed-physical-root' }));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(metadata));
}
const acceptance = (job) => ({ kind: 'accepted', profileId: job.profileId, actor: 'visual-reviewer', note: 'Synthetic test fixture.', review: Object.fromEntries(REVIEW_CHECKS.map((key) => [key, true])) });

test('physical root review cannot be missing, partial or changed at acceptance', async () => {
  const fix = await fixture();
  const state = await generated(fix);
  await normalized(fix);
  const path = scopedPath(fix.root, fix.job.metadataPath);
  const original = JSON.parse(await readFile(path, 'utf8'));
  for (const transform of [
    (metadata) => { delete metadata.physicalAnchorReview; },
    (metadata) => { metadata.physicalAnchorReview.reviewedPoseCount = 31; },
    (metadata) => { metadata.placements[0].anchorStatus = 'pending-body-root-review'; },
    (metadata) => { metadata.physicalAnchorReview.sha256 = '0'.repeat(64); }
  ]) {
    const changed = structuredClone(original);
    transform(changed);
    await writeFile(path, JSON.stringify(changed));
    await assert.rejects(appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root), /physical|body-root/i);
  }
});

test('V66 queues571profiles as570jobs/114lots and never recounts V65Facehugger', () => {
  const queue = buildEnemyBatchQueue();
  assert.equal(queue.totalProfiles, 571);
  assert.equal(queue.archetypeCount, 55);
  assert.equal(queue.productionJobCount, 570);
  assert.equal(queue.batchCount, 114);
  assert.deepEqual(queue.batches[0].profileIds, FIRST_BATCH_IDS);
  assert.ok(queue.batches.every((batch) => batch.profileIds.length === 5));
  assert.equal(new Set(queue.jobs.map((job) => job.profileId)).size, 570);
  assert.ok(!queue.jobs.some((job) => job.profileId === 'enemy-002-facehugger'));
  assert.equal(queue.baseline[0].countedAsNewV66, false);
  assert.deepEqual(buildEnemyBatchQueue(), queue);
});

test('explicit family contracts ignore cyclic behavior and preserve creature-specific actions', () => {
  assert.equal(normalizeEnemyIdentity({ ...ENEMIES[0], behavior: 'rush' }).animationFamily, 'egg');
  assert.equal(normalizeEnemyIdentity({ ...ENEMIES[1], behavior: 'siege' }).animationFamily, 'parasite');
  assert.equal(normalizeEnemyIdentity({ ...ENEMIES[52], behavior: 'constructor' }).animationFamily, 'egg');
  assert.deepEqual(ANIMATION_CONTRACTS.egg.map((clip) => clip.id), ['sealed', 'opening', 'hatch', 'destroyed']);
  assert.ok(ANIMATION_CONTRACTS.armed.some((clip) => clip.id === 'reload'));
  assert.ok(ANIMATION_CONTRACTS.royal.some((clip) => clip.id === 'tail-strike'));
  assert.ok(ANIMATION_CONTRACTS.synthetic.some((clip) => clip.id === 'hurt'));
  assert.throws(() => normalizeEnemyIdentity({ id: 'enemy-999-unknown', name: 'Unknown' }), /explicit review/);
});

test('reviewed references gate generation and are never a1:1certification', () => {
  const queue = buildEnemyBatchQueue({ references: refs });
  assert.equal(queue.jobs.filter((job) => job.initialStatus === 'ready-generation').length, 5);
  assert.ok(queue.jobs.slice(0, 5).every((job) => job.clips.length === 4 && job.grid.rows === 8));
  assert.match(queue.jobs[0].clips[0].sourcePath, /frames\/v66\/batch-001\/enemy-001-ovomorph\/sealed\.png$/);
  assert.equal(reviewedReference({ ...reference, reviewer: '' }), null);
  assert.equal(reviewedReference({ ...reference, urls: [] }), null);
  assert.throws(() => reviewedReference({ ...reference, canonExact: true }), /not a certification/);
  assert.ok(queue.jobs[0].clips.every((clip) => clip.prompt.includes(reference.designLock)));
});

test('PNG and normalized metadata presence never automatically accepts a profile', async () => {
  const fix = await fixture();
  await normalized(fix);
  const status = await getJobStatus(fix.job, emptyState(), fix.root);
  assert.equal(status.status, 'ready-generation');
  assert.equal(status.generatedClips, 0);
  await assert.rejects(appendProductionEvent(fix.queue, emptyState(), acceptance(fix.job), fix.root), /without generation provenance/);
});

test('clip provenance is resumable and invalidated by changed source pixels', async () => {
  const fix = await fixture();
  const state = await generated(fix);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 4);
  await writeFile(scopedPath(fix.root, fix.job.clips[0].sourcePath), 'changed source');
  const stale = await getJobStatus(fix.job, state, fix.root);
  assert.equal(stale.generatedClips, 3);
  assert.match(stale.issues[0], /missing or changed/);
  const refreshed = await appendProductionEvent(fix.queue, state, { ...state.events[0], generationId: 'second-test-generation' }, fix.root);
  assert.equal((await getJobStatus(fix.job, refreshed, fix.root)).generatedClips, 4);
  assert.deepEqual((await getJobStatus(fix.job, refreshed, fix.root)).issues, []);
});

test('rejection is explicit and regeneration returns the profile to generated review state', async () => {
  const fix = await fixture();
  let state = await generated(fix);
  state = await appendProductionEvent(fix.queue, state, { kind: 'review-rejected', profileId: fix.job.profileId, actor: 'reviewer', note: 'Wrong anatomy.' }, fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'review-rejected');
  state = await appendProductionEvent(fix.queue, state, { ...state.events[0], generationId: 'review-correction-test' }, fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'generated');
});

test('acceptance needs all explicit visual checks and is not runtime integration', async () => {
  const fix = await fixture();
  let state = await generated(fix);
  await normalized(fix);
  await assert.rejects(appendProductionEvent(fix.queue, state, { ...acceptance(fix.job), review: { anatomy: true } }, fix.root), /every identity/);
  state = await appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'accepted');
  await assert.rejects(appendProductionEvent(fix.queue, state, { kind: 'integrated', profileId: fix.job.profileId, actor: 'test', note: 'No runtime test yet.' }, fix.root), /passing runtime command/);
});

test('runtime integration requires registry/test/log evidence and is invalidated when they change', async () => {
  const fix = await fixture();
  let state = await generated(fix);
  await normalized(fix);
  state = await appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root);
  const runtimeEvidence = { result: 'pass', command: 'test-only-runtime-fixture' };
  for (const key of ['registry', 'test', 'log']) {
    const path = `fixture-${key}.txt`;
    await writeFile(scopedPath(fix.root, path), key);
    runtimeEvidence[key] = { path };
  }
  state = await appendProductionEvent(fix.queue, state, { kind: 'integrated', profileId: fix.job.profileId, actor: 'test', note: 'Synthetic fixture.', runtimeEvidence }, fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'integrated');
  await writeFile(scopedPath(fix.root, runtimeEvidence.registry.path), 'changed');
  assert.notEqual((await getJobStatus(fix.job, state, fix.root)).status, 'integrated');
});

test('summary does not promote queued work and paths cannot escape repository', async () => {
  const summary = await summarizeQueue(buildEnemyBatchQueue(), emptyState());
  assert.equal(summary.counts['pending-reference'], 570);
  assert.equal(summary.counts.integrated, 0);
  assert.equal(summary.verifiedGeneratedBoards, 0);
  assert.throws(() => scopedPath(process.cwd(), '../outside.png'), /escapes/);
  assert.throws(() => scopedPath(process.cwd(), 'C:\\absolute.png'), /relative/);
});

test('actual generation prompt is preserved separately from the queue contract', async () => {
  const fix = await fixture();
  const base = { kind: 'generated', profileId: fix.job.profileId, clipId: fix.job.clips[0].id, provider: 'OpenAI ImageGen', generationId: 'synthetic-prompt-proof', actor: 'test', note: 'Actual prompt fixture.' };
  await assert.rejects(appendProductionEvent(fix.queue, emptyState(), base, fix.root), /actual ImageGen prompt/);
  const state = await appendProductionEvent(fix.queue, emptyState(), { ...base, actualPromptText: 'Different actual image-generation instructions.' }, fix.root);
  assert.notEqual(state.events[0].promptSha256, state.events[0].contractPromptSha256);
  assert.equal(state.events[0].contractPromptSha256, fix.job.clips[0].promptSha256);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 1);
});

test('inter-clip scale calibration requires measured review and only known clips', () => {
  assert.throws(() => reviewedReference({ ...reference, sourceScaleByClip: { sealed: 0 } }), /positive/);
  assert.throws(() => reviewedReference({ ...reference, sourceScaleByClip: { sealed: Number.NaN } }), /positive/);
  assert.throws(() => reviewedReference({ ...reference, sourceScaleByClip: { sealed: 1.2 } }), /measurement note/);
  const scaleCalibrationReview = { note: 'Synthetic width measurement.', reviewer: 'test', reviewedAt: '2026-08-31', evidencePaths: ['test-only-measurement.md'] };
  const reviewed = reviewedReference({ ...reference, sourceScaleByClip: { sealed: 1.2 }, scaleCalibrationReview });
  assert.equal(reviewed.sourceScaleByClip.sealed, 1.2);
  assert.throws(() => buildEnemyBatchQueue({ references: { profiles: { [FIRST_BATCH_IDS[0]]: { ...reviewed, sourceScaleByClip: { nonexistent: 2 } } } } }), /Unknown calibrated clip/);
});
