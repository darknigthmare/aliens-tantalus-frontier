// Read-only validator for the two merge-compatible Working Joe fragments.
// This imports the production scale resolver but never invokes either merge CLI.
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleScaleReviewDocument } from '../../../../scripts/merge-v66-scale-reviews.mjs';
import { resolvePostGenerationScaleReviewCandidate } from '../../../../scripts/enemy-batch-scale-review.mjs';
import { ROOT, scopedPath } from '../../../../scripts/enemy-batch-production.mjs';

const here = resolve(fileURLToPath(new URL('.', import.meta.url)));
const profileId = 'enemy-041-working-joe';
const batchId = 'batch-003';
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const hashFile = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const fail = (message) => { throw new Error(message); };

const queue = await readJson(scopedPath(ROOT, 'docs/references/V66_ENEMY_BATCH_QUEUE.json'));
const job = queue.jobs.find((value) => value.profileId === profileId);
if (!job || job.batchId !== batchId) fail('Working Joe queue job missing or moved.');
const metadata = await readJson(scopedPath(ROOT, job.metadataPath));
const scaleFragment = await readJson(resolve(here, 'scale-review.fragment.json'));
const anchorFragment = await readJson(resolve(here, 'anchor-review.fragment.json'));
const ownership = await readJson(resolve(here, 'source-ownership.review.json'));
const provenance = await readJson(resolve(here, 'provenance.json'));
const currentScale = await readJson(scopedPath(ROOT, 'docs/references/V66_BATCH_003_SCALE_REVIEW.json'));

const jobs = new Map([[profileId, job]]);
const { document, incoming } = assembleScaleReviewDocument(batchId, currentScale, [scaleFragment], jobs);
if (incoming.length !== 1 || incoming[0] !== profileId) fail('Scale fragment incoming identity mismatch.');
const currentSources = await Promise.all(job.clips.map(async (clip) => ({
  clip: clip.id,
  path: clip.sourcePath,
  sha256: await hashFile(scopedPath(ROOT, clip.sourcePath)),
  size: [1774, 887],
})));
const scaleProof = await resolvePostGenerationScaleReviewCandidate(job, currentSources, document, ROOT, scopedPath);
if (!scaleProof || scaleProof.measurementCount !== 15) fail('Scale fragment did not resolve with fifteen measurements.');

if (anchorFragment.schema !== 1 || anchorFragment.batchId !== batchId || anchorFragment.coordinates !== 'nominal-source-cell') fail('Anchor fragment scope mismatch.');
const anchorEntry = anchorFragment.profiles?.[profileId];
if (!anchorEntry || anchorEntry.status !== 'reviewed' || anchorEntry.reviewedPoseCount !== 40 || !anchorEntry.reviewer || !anchorEntry.reviewedAt || !anchorEntry.method) fail('Anchor reviewer or count incomplete.');
if (Object.keys(anchorEntry.clips).length !== job.clips.length) fail('Anchor clip coverage mismatch.');
let anchorCount = 0;
for (const clip of job.clips) {
  const record = anchorEntry.clips[clip.id];
  if (!record || record.sourceSha256 !== await hashFile(scopedPath(ROOT, clip.sourcePath))) fail('Stale anchor source: ' + clip.id);
  if (JSON.stringify(record.sourceSize) !== JSON.stringify([1774, 887])) fail('Anchor source size mismatch: ' + clip.id);
  const indices = record.frames.map((frame) => frame.frame);
  if (indices.length !== 8 || new Set(indices).size !== 8 || indices.some((index) => !Number.isInteger(index) || index < 0 || index > 7)) fail('Anchor frame coverage mismatch: ' + clip.id);
  for (const frame of record.frames) {
    if (frame.reviewed !== true || !Array.isArray(frame.anchor) || !Array.isArray(frame.landmark) || !Array.isArray(frame.sourceBounds)) fail('Incomplete anchor record: ' + clip.id + '/' + frame.frame);
    if (frame.sourceBounds[3] - frame.anchor[1] > 0) fail('Anchor clips extraction lower guard: ' + clip.id + '/' + frame.frame);
    anchorCount += 1;
  }
}
if (anchorCount !== 40) fail('Anchor count is not 40.');
const expectedDeathBounds = [
  [120, 46, 363, 421], [126, 103, 318, 420], [94, 168, 288, 421], [63, 198, 276, 421],
  [67, 170, 371, 354], [0, 241, 408, 367], [7, 281, 381, 369], [4, 291, 376, 362],
];
if (JSON.stringify(anchorEntry.clips.death.frames.map((frame) => frame.sourceBounds)) !== JSON.stringify(expectedDeathBounds)) {
  fail('Death-r3 source bounds differ from production-splitter evidence.');
}
for (const evidencePath of [...scaleFragment.profiles[profileId].evidencePaths, ...anchorEntry.evidencePaths]) await access(scopedPath(ROOT, evidencePath));

if (ownership.deathFrame6Signal?.signalPixelCount !== 0 || ownership.deathFrame6Signal?.authoredPoseOneBased !== 7
  || ownership.deathFrame6Signal?.crossCellSpill !== false || ownership.deathFrame6Signal?.safeReassignmentRequired !== false) {
  fail('Death ownership disposition mismatch.');
}

let provenanceInputs = 0;
for (const input of provenance.inputDocuments) {
  if (await hashFile(scopedPath(ROOT, input.path)) !== input.sha256) fail('Stale provenance input: ' + input.path);
  provenanceInputs += 1;
}
for (const master of provenance.activeMasters) {
  if (await hashFile(scopedPath(ROOT, master.path)) !== master.sha256) fail('Stale master: ' + master.clip);
  if (await hashFile(scopedPath(ROOT, master.eventPath)) !== master.eventSha256) fail('Stale event: ' + master.clip);
}

console.log(JSON.stringify({
  profileId,
  batchId,
  scale: {
    status: scaleProof.status,
    measurementCount: scaleProof.measurementCount,
    baselineClip: scaleProof.baselineClip,
    sourceScaleByClip: scaleProof.sourceScaleByClip,
    evidenceCount: scaleProof.evidence.length,
    mergePerformed: false,
  },
  anchors: {
    status: anchorEntry.status,
    reviewedPoseCount: anchorCount,
    clips: Object.keys(anchorEntry.clips),
    guardViolations: 0,
    mergePerformed: false,
  },
  ownership: {
    signalPixelCount: ownership.deathFrame6Signal.signalPixelCount,
    owner: ownership.deathFrame6Signal.owner,
    totalForegroundSeparationColumns: ownership.deathFrame6Signal.totalForegroundSeparationColumns,
    crossCellSpill: ownership.deathFrame6Signal.crossCellSpill,
    safeReassignmentRequired: ownership.deathFrame6Signal.safeReassignmentRequired,
  },
  provenanceInputsVerified: provenanceInputs,
  acceptedAutomatically: 0,
  normalizedAssetsWritten: 0,
  runtimeAssetsWritten: 0,
}, null, 2));
