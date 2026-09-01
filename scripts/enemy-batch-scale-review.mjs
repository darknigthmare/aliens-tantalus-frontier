// Independent post-generation calibration proofs. Never mutates sources or review files.
import { readFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, isAbsolute, sep } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const fail = (message) => { throw new Error('Post-generation scale review: ' + message); };
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const exactKeys = (value, keys) => record(value) && isDeepStrictEqual(Object.keys(value).sort(), [...keys].sort());
const has = (value, key) => Object.hasOwn(value, key);
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
// Match Python round() for the odd PNG sizes used by the production normalizer.
function roundEven(value) {
  const lower = Math.floor(value), fraction = value - lower;
  return fraction === 0.5 ? lower + (lower % 2) : Math.round(value);
}
function localPath(root, value, scopedPath) {
  if (!text(value) || value.includes(':') || value.includes('\\') || value.split('/').includes('..')) fail('evidence must use a repository-relative path');
  return scopedPath(root, value);
}
async function existingPath(root, value, scopedPath) {
  const target = await realpath(localPath(root, value, scopedPath));
  const actualRoot = await realpath(root);
  const local = relative(actualRoot, target);
  if (local === '..' || local.startsWith('..' + sep) || isAbsolute(local)) fail('resolved evidence path escapes repository');
  return target;
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function pngSize(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature) || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') fail('source PNG dimensions cannot be verified');
  const size = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  if (size[0] < 256 || size[0] !== size[1] * 2) fail('source PNG must be a 2:1 board at least256pixels wide');
  return size;
}

async function resolvePostGenerationScaleReviewBytes(job, sources, root, scopedPath, bytes, path) {
  if (!/^batch-[0-9]{3}$/.test(job.batchId || '') || job.batchId === 'batch-000') fail('invalid batch identifier');
  let document;
  try { document = JSON.parse(bytes.toString('utf8')); } catch { fail('invalid review JSON'); }
  if (!record(document) || document.schema !== 1 || document.batchId !== job.batchId || document.coordinates !== 'nominal-source-cell' || !record(document.profiles)) fail('wrong review schema or scope');
  if (!has(document.profiles, job.profileId)) return null;
  const entry = document.profiles[job.profileId];
  if (!record(entry) || entry.status !== 'reviewed' || !text(entry.reviewer) || !validDate(entry.reviewedAt) || !text(entry.note)) fail('complete reviewed identity, date and note are required');
  if (has(entry, 'profileId') && entry.profileId !== job.profileId) fail('profile identity disagrees');
  if (Object.keys(job.reference?.sourceScaleByClip || {}).length || job.reference?.scaleCalibrationReview != null) fail('conflicts with legacy reference calibration');
  const clips = job.clips.map((clip) => clip.id);
  if (!clips.length || clips.some((clip) => !text(clip)) || new Set(clips).size !== clips.length) fail('authored clips must have unique nonempty identities');
  if (entry.baselineClip !== 'idle' || !clips.includes('idle')) fail('baseline must be the idle clip');
  if (!exactKeys(entry.sourceScaleByClip, clips) || !exactKeys(entry.sourceSha256ByClip, clips)) fail('source and scale maps must cover every clip exactly');
  for (const clip of clips) {
    const factor = entry.sourceScaleByClip[clip];
    if (!finite(factor) || factor < 0.25 || factor > 4) fail('scale factors must be finite numbers in [0.25,4]');
    if (typeof entry.sourceSha256ByClip[clip] !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sourceSha256ByClip[clip])) fail('invalid source SHA-256');
  }
  if (entry.sourceScaleByClip.idle !== 1) fail('idle baseline factor must equal one');
  if (!Array.isArray(sources) || sources.length !== clips.length || sources.some((source, index) => !record(source) || source.clip !== clips[index])) fail('metadata source coverage or ordered clips are incomplete');
  if (!isDeepStrictEqual(job.sourceGrid, { columns: 4, rows: 2, frameCount: 8 })) fail('source grid must be exactly eight poses in4x2');
  const sizes = new Map();
  for (const clip of job.clips) {
    const source = sources.find((value) => value?.clip === clip.id);
    if (!source || source.path !== clip.sourcePath) fail('metadata source path disagrees for ' + clip.id);
    const sourceBytes = await readFile(await existingPath(root, clip.sourcePath, scopedPath));
    const currentSha = hash(sourceBytes);
    if (currentSha !== entry.sourceSha256ByClip[clip.id] || currentSha !== source.sha256) fail('stale source SHA-256 for ' + clip.id);
    const size = pngSize(sourceBytes);
    if (!isDeepStrictEqual(source.size, size)) fail('metadata source dimensions changed for ' + clip.id);
    sizes.set(clip.id, size);
  }
  if (new Set([...sizes.values()].map((size) => size.join('x'))).size !== 1) fail('source boards must share one resolution');
  if (!Array.isArray(entry.measurements) || !entry.measurements.length) fail('manual measurements are missing');
  const seen = new Set(), groups = new Map(), landmarks = new Set();
  for (const measurement of entry.measurements) {
    if (!record(measurement) || !clips.includes(measurement.clip) || !Number.isInteger(measurement.frame) || measurement.frame < 0 || measurement.frame > 7) fail('invalid measurement clip/frame');
    const key = measurement.clip + '/' + measurement.frame;
    if (seen.has(key)) fail('duplicate measurement pose');
    seen.add(key);
    if (!text(measurement.landmark) || !text(measurement.note)) fail('measurement landmark and note are required');
    landmarks.add(measurement.landmark);
    const points = measurement.endpoints;
    if (!Array.isArray(points) || points.length !== 2 || points.some((point) => !Array.isArray(point) || point.length !== 2 || point.some((value) => !finite(value)))) fail('measurement endpoints must be two finite pairs');
    if (!finite(measurement.lengthPx) || measurement.lengthPx <= 1) fail('measurement length must exceed one pixel');
    const [width, height] = sizes.get(measurement.clip);
    const column = measurement.frame % 4, row = Math.floor(measurement.frame / 4);
    const cellWidth = roundEven((column + 1) * width / 4) - roundEven(column * width / 4);
    const cellHeight = roundEven((row + 1) * height / 2) - roundEven(row * height / 2);
    if (points.some(([x, y]) => x < -0.15 * cellWidth || x > 1.15 * cellWidth || y < -0.15 * cellHeight || y > 1.15 * cellHeight)) fail('measurement endpoint outside nominal source-cell envelope');
    const distance = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
    if (distance <= 0 || Math.abs(distance - measurement.lengthPx) > 1) fail('measurement length disagrees with Euclidean endpoints');
    if (!groups.has(measurement.clip)) groups.set(measurement.clip, []);
    groups.get(measurement.clip).push(measurement.lengthPx);
  }
  if (landmarks.size !== 1) fail('measurements must use the same rigid landmark');
  if (!groups.has('idle') || [...groups.values()].some((values) => values.length < 2)) fail('at least two distinct poses per measured clip and idle are required');
  for (const clip of clips) if (entry.sourceScaleByClip[clip] !== 1 && !groups.has(clip)) fail('a corrected clip has no measurements: ' + clip);
  const baseline = median(groups.get('idle'));
  for (const [clip, values] of groups) {
    const ratio = baseline / median(values);
    if (Math.abs(entry.sourceScaleByClip[clip] / ratio - 1) > 0.03) fail('factor disagrees with measured median ratio for ' + clip);
  }
  if (!Array.isArray(entry.evidencePaths) || !entry.evidencePaths.length || new Set(entry.evidencePaths).size !== entry.evidencePaths.length) fail('unique nonempty evidence paths are required');
  const evidence = [];
  for (const evidencePath of entry.evidencePaths) {
    const evidenceBytes = await readFile(await existingPath(root, evidencePath, scopedPath));
    if (!evidenceBytes.length) fail('empty calibration evidence');
    evidence.push({ path: evidencePath, sha256: hash(evidenceBytes) });
  }
  return {
    path, sha256: hash(bytes), status: 'reviewed', profileId: job.profileId,
    reviewer: entry.reviewer, reviewedAt: entry.reviewedAt, coordinates: 'nominal-source-cell',
    baselineClip: entry.baselineClip, sourceScaleByClip: entry.sourceScaleByClip,
    sourceSha256ByClip: entry.sourceSha256ByClip, measurementCount: entry.measurements.length, evidence
  };
}

// Validate the exact canonical bytes a merge CLI is about to persist. This keeps
// fragment application on the same source/evidence/measurement contract as the
// production resolver, without writing an unvalidated review first.
export async function resolvePostGenerationScaleReviewCandidate(job, sources, document, root, scopedPath) {
  const path = `docs/references/V66_BATCH_${job.batchId.slice(-3)}_SCALE_REVIEW.json`;
  const bytes = Buffer.from(JSON.stringify(document, null, 2) + '\n', 'utf8');
  return resolvePostGenerationScaleReviewBytes(job, sources, root, scopedPath, bytes, path);
}

export async function resolvePostGenerationScaleReview(job, sources, root, scopedPath) {
  const path = `docs/references/V66_BATCH_${job.batchId.slice(-3)}_SCALE_REVIEW.json`;
  let bytes;
  try { bytes = await readFile(await existingPath(root, path, scopedPath)); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  return resolvePostGenerationScaleReviewBytes(job, sources, root, scopedPath, bytes, path);
}

export async function validatePostGenerationScaleReview(job, metadata, root, scopedPath) {
  const expected = await resolvePostGenerationScaleReview(job, metadata.sources, root, scopedPath);
  if (expected === null) {
    if (has(metadata, 'postGenerationScaleReview')) fail('recorded calibration is missing from the active review');
    return;
  }
  if (!isDeepStrictEqual(metadata.postGenerationScaleReview, expected)) fail('normalization proof is missing or stale');
  if (!isDeepStrictEqual(metadata.sourceScaleByClip, expected.sourceScaleByClip)) fail('effective metadata scale factors disagree with the reviewed calibration');
  if (metadata.scaleCalibrationReview !== null || !isDeepStrictEqual(metadata.scaleCalibrationEvidence, [])) fail('post-generation metadata conflicts with legacy calibration evidence');
  if (!finite(metadata.scale) || metadata.scale <= 0 || metadata.scale > 1 || !Array.isArray(metadata.placements) || metadata.placements.length !== job.clips.length * 8) fail('calibrated placements or common pack scale are missing');
  for (const [index, pose] of metadata.placements.entries()) {
    const clip = job.clips[Math.floor(index / 8)].id;
    const factor = expected.sourceScaleByClip[clip];
    if (!record(pose) || pose.clip !== clip || pose.index !== index || pose.clipFrame !== index % 8
      || pose.sourceScale !== factor || pose.scale !== metadata.scale || !finite(pose.appliedScale)
      || Math.abs(pose.appliedScale - metadata.scale * factor) > 1e-8) fail('calibrated placement factors disagree for ' + clip);
  }
}
