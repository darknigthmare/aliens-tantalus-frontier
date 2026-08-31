import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, unlink, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { buildEnemyBatchQueue, emptyState, appendProductionEvent, getJobStatus, REVIEW_CHECKS, scopedPath } from '../scripts/enemy-batch-production.mjs';
import { FIRST_BATCH_IDS } from '../scripts/enemy-batch-contracts.mjs';
import { resolvePostGenerationScaleReview, validatePostGenerationScaleReview } from '../scripts/enemy-batch-scale-review.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const reference = { status: 'reviewed', urls: ['https://example.com/test'], localPaths: [], designLock: 'Synthetic test only.', reviewer: 'test', reviewedAt: '2026-08-31', canonExact: false };
function syntheticPng(width = 400, height = 200, shade = 30) {
  const chunk = (type, data) => {
    const payload = Buffer.concat([Buffer.from(type), data]);
    let crc = 0xffffffff;
    for (const value of payload) {
      crc ^= value;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    const length = Buffer.alloc(4), checksum = Buffer.alloc(4);
    length.writeUInt32BE(data.length); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, payload, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const stride = width * 4 + 1, pixels = Buffer.alloc(stride * height, shade);
  for (let row = 0; row < height; row++) pixels[row * stride] = 0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
async function writeJson(path, data) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(data)); }
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'atf-v66-scale-test-'));
  const references = { profiles: Object.fromEntries(FIRST_BATCH_IDS.map((id) => [id, reference])) };
  const queue = buildEnemyBatchQueue({ references });
  const job = queue.jobs.find((entry) => entry.reference && entry.clips.some((clip) => clip.id === 'idle'));
  const sources = [];
  let state = emptyState();
  for (const [index, clip] of job.clips.entries()) {
    const bytes = syntheticPng(400, 200, index + 20);
    const path = scopedPath(root, clip.sourcePath);
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, bytes);
    sources.push({ clip: clip.id, path: clip.sourcePath, sha256: hash(bytes), size: [400, 200] });
    state = await appendProductionEvent(queue, state, { kind: 'generated', profileId: job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: 'test-' + clip.id, actualPromptText: 'Synthetic source only.', actor: 'test', note: 'Synthetic provenance, never production art.' }, root);
  }
  const sourceScaleByClip = Object.fromEntries(job.clips.map((clip) => [clip.id, clip.id === 'move' ? 2 : 1]));
  const measurement = (clip, frame, lengthPx) => ({ clip, frame, endpoints: [[0, 40], [lengthPx, 40]], lengthPx, landmark: 'rigid-cranial-length', note: 'Synthetic coordinate sample.' });
  const entry = {
    status: 'reviewed', reviewer: 'test', reviewedAt: '2026-08-31', note: 'Synthetic measured calibration.',
    baselineClip: 'idle', sourceScaleByClip, sourceSha256ByClip: Object.fromEntries(sources.map((source) => [source.clip, source.sha256])),
    measurements: [measurement('idle', 0, 100), measurement('idle', 1, 100), measurement('move', 0, 50), measurement('move', 1, 50)],
    evidencePaths: ['synthetic-scale-evidence.txt']
  };
  const document = { schema: 1, batchId: job.batchId, coordinates: 'nominal-source-cell', profiles: { [job.profileId]: entry } };
  const reviewPath = scopedPath(root, `docs/references/V66_BATCH_${job.batchId.slice(-3)}_SCALE_REVIEW.json`);
  await writeJson(reviewPath, document);
  await writeFile(scopedPath(root, entry.evidencePaths[0]), 'Synthetic measured evidence, not an art approval.');
  const atlasBytes = 'Synthetic atlas fixture, never a production image.';
  const atlasPath = scopedPath(root, job.normalizedPath);
  await mkdir(dirname(atlasPath), { recursive: true }); await writeFile(atlasPath, atlasBytes);
  await writeFile(scopedPath(root, 'synthetic-anchors.txt'), 'Synthetic physical root evidence.');
  const metadata = {
    profileId: job.profileId, normalizationStatus: 'validated', normalizedSha256: hash(atlasBytes), validation: { findings: [] }, sources,
    scale: 0.4, sourceScaleByClip: { ...sourceScaleByClip }, scaleCalibrationReview: null, scaleCalibrationEvidence: [],
    physicalAnchorReview: { status: 'reviewed', path: 'synthetic-anchors.txt', sha256: hash('Synthetic physical root evidence.'), reviewedPoseCount: job.clips.length * 8 },
    placements: job.clips.flatMap((clip, clipIndex) => Array.from({ length: 8 }, (_, frame) => ({
      index: clipIndex * 8 + frame, clip: clip.id, clipFrame: frame, anchorStatus: 'reviewed-physical-root',
      sourceScale: sourceScaleByClip[clip.id], scale: 0.4, appliedScale: 0.4 * sourceScaleByClip[clip.id]
    })))
  };
  metadata.postGenerationScaleReview = await resolvePostGenerationScaleReview(job, sources, root, scopedPath);
  const fix = { root, queue, job, state, sources, entry, document, reviewPath, metadata };
  fix.saveReview = () => writeJson(reviewPath, document);
  fix.saveMetadata = () => writeJson(scopedPath(root, job.metadataPath), metadata);
  await fix.saveMetadata();
  return fix;
}
const validate = (fix) => validatePostGenerationScaleReview(fix.job, fix.metadata, fix.root, scopedPath);
const accept = (fix, state = fix.state) => appendProductionEvent(fix.queue, state, { kind: 'accepted', profileId: fix.job.profileId, actor: 'test', note: 'Synthetic acceptance test only.', review: Object.fromEntries(REVIEW_CHECKS.map((key) => [key, true])) }, fix.root);

test('post-generation proof matches the complete contract and permits current acceptance', async () => {
  const fix = await fixture();
  const proof = fix.metadata.postGenerationScaleReview;
  assert.deepEqual(Object.keys(proof).sort(), ['path','sha256','status','profileId','reviewer','reviewedAt','coordinates','baselineClip','sourceScaleByClip','sourceSha256ByClip','measurementCount','evidence'].sort());
  assert.equal(proof.measurementCount, 4);
  assert.equal(proof.sha256, hash(await readFile(fix.reviewPath)));
  await validate(fix);
  const state = await accept(fix);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'accepted');
});

test('changed review or evidence invalidates an already accepted calibrated atlas', async (t) => {
  for (const mode of ['review-bytes', 'evidence-bytes', 'missing-evidence', 'empty-evidence']) await t.test(mode, async () => {
    const fix = await fixture();
    const state = await accept(fix);
    if (mode === 'review-bytes') await writeFile(fix.reviewPath, JSON.stringify(fix.document, null, 2));
    if (mode === 'evidence-bytes') await writeFile(scopedPath(fix.root, fix.entry.evidencePaths[0]), 'Changed proof');
    if (mode === 'missing-evidence') await unlink(scopedPath(fix.root, fix.entry.evidencePaths[0]));
    if (mode === 'empty-evidence') await writeFile(scopedPath(fix.root, fix.entry.evidencePaths[0]), '');
    await assert.rejects(accept(fix), /scale review|ENOENT/);
    assert.notEqual((await getJobStatus(fix.job, state, fix.root)).status, 'accepted');
  });
});

test('active review and metadata proof must be present together; absent profile preserves legacy', async () => {
  const fix = await fixture();
  const proof = fix.metadata.postGenerationScaleReview;
  delete fix.metadata.postGenerationScaleReview;
  await assert.rejects(validate(fix), /proof is missing/);
  fix.metadata.postGenerationScaleReview = proof;
  await unlink(fix.reviewPath);
  await assert.rejects(validate(fix), /missing from the active review/);
  delete fix.metadata.postGenerationScaleReview;
  await validate(fix);
  fix.document.profiles = {};
  await fix.saveReview();
  await validate(fix);
  fix.metadata.postGenerationScaleReview = proof;
  await assert.rejects(validate(fix), /missing from the active review/);
});

test('stale PNG, wrong source size and conflicting legacy calibration are rejected', async (t) => {
  for (const mode of ['source', 'size', 'legacy', 'legacy-review-only', 'legacy-empty-review', 'legacy-false-review', 'legacy-empty-string-review']) await t.test(mode, async () => {
    const fix = await fixture();
    if (mode === 'source') await writeFile(scopedPath(fix.root, fix.job.clips[0].sourcePath), syntheticPng(400, 200, 99));
    if (mode === 'size') fix.sources[0].size = [401, 200];
    if (mode === 'legacy') fix.job.reference.sourceScaleByClip = { idle: 1 };
    if (mode === 'legacy-review-only') {
      fix.job.reference.sourceScaleByClip = {};
      fix.job.reference.scaleCalibrationReview = { status: 'reviewed' };
    }
    if (mode === 'legacy-empty-review') fix.job.reference.scaleCalibrationReview = {};
    if (mode === 'legacy-false-review') fix.job.reference.scaleCalibrationReview = false;
    if (mode === 'legacy-empty-string-review') fix.job.reference.scaleCalibrationReview = '';
    await assert.rejects(validate(fix), /stale source|dimensions changed|conflicts with legacy/);
  });
});

test('invalid calibration maps, measurements, dates and evidence paths cannot be accepted', async (t) => {
  const cases = [
    ['pending review', (f) => { f.entry.status = 'pending'; }],
    ['wrong scope', (f) => { f.document.batchId = 'batch-099'; }],
    ['invalid calendar date', (f) => { f.entry.reviewedAt = '2026-02-30'; }],
    ['missing source', (f) => { delete f.entry.sourceSha256ByClip.death; }],
    ['extra scale', (f) => { f.entry.sourceScaleByClip.unknown = 1; }],
    ['factor out of range', (f) => { f.entry.sourceScaleByClip.move = 4.1; }],
    ['non-numeric factor', (f) => { f.entry.sourceScaleByClip.move = true; }],
    ['baseline changed', (f) => { f.entry.sourceScaleByClip.idle = 2; }],
    ['wrong median ratio', (f) => { f.entry.sourceScaleByClip.move = 2.1; }],
    ['changed clip unmeasured', (f) => { f.entry.sourceScaleByClip.death = 2; }],
    ['one baseline pose', (f) => { f.entry.measurements.splice(1, 1); }],
    ['duplicate pose', (f) => { f.entry.measurements[1].frame = 0; }],
    ['float frame', (f) => { f.entry.measurements[1].frame = 1.5; }],
    ['frame outside0..7', (f) => { f.entry.measurements[1].frame = 8; }],
    ['inconsistent landmark', (f) => { f.entry.measurements[1].landmark = 'different-landmark'; }],
    ['inconsistent length', (f) => { f.entry.measurements[0].lengthPx = 90; }],
    ['one-pixel length', (f) => { f.entry.measurements[0].lengthPx = 1; f.entry.measurements[0].endpoints = [[0,40],[1,40]]; }],
    ['outside nominal cell', (f) => { f.entry.measurements[0].endpoints = [[20,40],[120,40]]; }],
    ['traversal evidence', (f) => { f.entry.evidencePaths = ['sub/../synthetic-scale-evidence.txt']; }],
    ['duplicate evidence', (f) => { f.entry.evidencePaths.push(f.entry.evidencePaths[0]); }]
  ];
  for (const [name, mutate] of cases) await t.test(name, async () => {
    const fix = await fixture();
    mutate(fix); await fix.saveReview();
    await assert.rejects(validate(fix), /Post-generation scale review/);
  });
});

test('source ordering, exact grid and actual PNG geometry are enforced', async (t) => {
  const cases = ['source-order', 'grid-frame-count', 'grid-extra-field', 'undersized-PNG', 'wrong-aspect', 'different-resolutions'];
  for (const mode of cases) await t.test(mode, async () => {
    const fix = await fixture();
    if (mode === 'source-order') fix.sources.reverse();
    if (mode === 'grid-frame-count') fix.job.sourceGrid = { columns: 4, rows: 2, frameCount: 7 };
    if (mode === 'grid-extra-field') fix.job.sourceGrid = { ...fix.job.sourceGrid, extra: true };
    if (['undersized-PNG', 'wrong-aspect', 'different-resolutions'].includes(mode)) {
      const size = mode === 'undersized-PNG' ? [200, 100] : mode === 'wrong-aspect' ? [400, 201] : [600, 300];
      const bytes = syntheticPng(...size);
      await writeFile(scopedPath(fix.root, fix.job.clips[0].sourcePath), bytes);
      fix.sources[0].sha256 = hash(bytes);
      fix.sources[0].size = size;
      fix.entry.sourceSha256ByClip[fix.sources[0].clip] = hash(bytes);
      await fix.saveReview();
    }
    await assert.rejects(validate(fix), /ordered clips|source grid|2:1 board|one resolution/);
  });
});

test('evidence symlinks may not escape the repository', async (t) => {
  const fix = await fixture();
  const external = await mkdtemp(join(tmpdir(), 'atf-v66-outside-proof-'));
  const target = join(external, 'external-evidence.txt');
  await writeFile(target, 'Evidence outside the workspace must not be trusted.');
  const evidence = scopedPath(fix.root, fix.entry.evidencePaths[0]);
  await unlink(evidence);
  try { await symlink(target, evidence, 'file'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) { t.skip('Host does not allow creating file symlinks'); return; }
    throw error;
  }
  await assert.rejects(validate(fix), /resolved evidence path escapes repository/);
});

test('metadata effective factors and every placement must match the measured calibration', async (t) => {
  for (const mode of ['map', 'sourceScale', 'commonScale', 'appliedScale', 'clip', 'missing-proof-field', 'legacy-proof', 'legacy-evidence']) await t.test(mode, async () => {
    const fix = await fixture();
    if (mode === 'map') fix.metadata.sourceScaleByClip.move = 1;
    if (mode === 'sourceScale') fix.metadata.placements[8].sourceScale = 1;
    if (mode === 'commonScale') fix.metadata.placements[8].scale = 0.3;
    if (mode === 'appliedScale') fix.metadata.placements[8].appliedScale = 0.4;
    if (mode === 'clip') fix.metadata.placements[8].clip = 'idle';
    if (mode === 'missing-proof-field') delete fix.metadata.postGenerationScaleReview.measurementCount;
    if (mode === 'legacy-proof') fix.metadata.scaleCalibrationReview = {};
    if (mode === 'legacy-evidence') fix.metadata.scaleCalibrationEvidence = [{ path: 'wrong-legacy-proof' }];
    await fix.saveMetadata();
    await assert.rejects(accept(fix), /Post-generation scale review/);
  });
});
