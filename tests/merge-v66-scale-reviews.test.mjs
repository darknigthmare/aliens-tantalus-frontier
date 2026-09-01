import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { scopedPath } from '../scripts/enemy-batch-production.mjs';
import { mergeScaleReviewFragments } from '../scripts/merge-v66-scale-reviews.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2) + '\n');
}
function syntheticPng(width = 400, height = 200, shade = 30) {
  const chunk = (type, data) => {
    const payload = Buffer.concat([Buffer.from(type), data]);
    let crc = 0xffffffff;
    for (const value of payload) {
      crc ^= value;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    const length = Buffer.alloc(4), checksum = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, payload, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = width * 4 + 1, pixels = Buffer.alloc(stride * height, shade);
  for (let row = 0; row < height; row++) pixels[row * stride] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'atf-v66-scale-merge-'));
  const profileId = 'enemy-test-scale';
  const batchId = 'batch-003';
  const clips = ['idle', 'move'].map((id) => ({
    id,
    sourcePath: `assets/openai/sprites/frames/v66/batch-003/${profileId}/${id}.png`,
  }));
  const job = {
    profileId,
    batchId,
    metadataPath: `assets/openai/sprites/metadata/v66/${profileId}.json`,
    sourceGrid: { columns: 4, rows: 2, frameCount: 8 },
    reference: { sourceScaleByClip: {}, scaleCalibrationReview: null },
    clips,
  };
  await writeJson(scopedPath(root, 'docs/references/V66_ENEMY_BATCH_QUEUE.json'), { schema: 1, jobs: [job] });
  const sources = [];
  for (const [index, clip] of clips.entries()) {
    const bytes = syntheticPng(400, 200, 30 + index);
    const path = scopedPath(root, clip.sourcePath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
    sources.push({ clip: clip.id, path: clip.sourcePath, sha256: hash(bytes), size: [400, 200] });
  }
  await writeJson(scopedPath(root, job.metadataPath), { schema: 1, profileId, sources });
  const evidencePath = 'docs/references/test-scale-evidence.txt';
  await writeFile(scopedPath(root, evidencePath), 'Reviewed synthetic scale evidence.');
  const measurement = (clip, frame, lengthPx) => ({
    clip,
    frame,
    endpoints: [[10, 40], [10 + lengthPx, 40]],
    lengthPx,
    landmark: 'rigid-cranial-dome-chord',
    note: 'Synthetic reviewed chord for merge validation.',
  });
  const entry = {
    profileId,
    status: 'reviewed',
    reviewer: 'test',
    reviewedAt: '2026-09-01',
    note: 'Synthetic reviewed calibration.',
    baselineClip: 'idle',
    sourceScaleByClip: { idle: 1, move: 1.2 },
    sourceSha256ByClip: Object.fromEntries(sources.map((source) => [source.clip, source.sha256])),
    measurements: [
      measurement('idle', 0, 60),
      measurement('idle', 1, 60),
      measurement('move', 0, 50),
      measurement('move', 1, 50),
    ],
    evidencePaths: [evidencePath],
  };
  const fragmentPath = 'docs/references/test-scale-fragment.json';
  const fragment = { schema: 1, batchId, coordinates: 'nominal-source-cell', profiles: { [profileId]: entry } };
  await writeJson(scopedPath(root, fragmentPath), fragment);
  const preserved = { status: 'reviewed', sentinel: { keep: ['exact', 42] } };
  const targetPath = 'docs/references/V66_BATCH_003_SCALE_REVIEW.json';
  await writeJson(scopedPath(root, targetPath), {
    schema: 1,
    batchId,
    coordinates: 'nominal-source-cell',
    profiles: { 'enemy-preserved': preserved },
  });
  return { root, profileId, batchId, fragmentPath, fragment, targetPath, preserved };
}

test('scale merge preserves unrelated profiles and emits deterministic canonical output', async () => {
  const fix = await fixture();
  const first = await mergeScaleReviewFragments({
    batch: fix.batchId,
    fragmentPaths: [fix.fragmentPath],
    root: fix.root,
  });
  const firstBytes = await readFile(scopedPath(fix.root, fix.targetPath));
  const document = JSON.parse(firstBytes);
  assert.deepEqual(document.profiles['enemy-preserved'], fix.preserved);
  assert.deepEqual(document.profiles[fix.profileId], fix.fragment.profiles[fix.profileId]);
  assert.deepEqual(Object.keys(document.profiles), ['enemy-preserved', fix.profileId]);
  assert.deepEqual(first.mergedProfiles, [fix.profileId]);
  assert.deepEqual(first.preservedProfiles, ['enemy-preserved']);
  assert.equal(first.measurementCount, 4);
  assert.equal(first.acceptedAutomatically, 0);
  assert.equal(first.sha256, hash(firstBytes));

  const second = await mergeScaleReviewFragments({
    batch: fix.batchId,
    fragmentPaths: [fix.fragmentPath],
    root: fix.root,
  });
  const secondBytes = await readFile(scopedPath(fix.root, fix.targetPath));
  assert.deepEqual(secondBytes, firstBytes);
  assert.equal(second.sha256, first.sha256);
});

test('scale merge rejects invalid batch, profile, SHA, clip coverage and factor without writing', async (t) => {
  const cases = [
    ['batch', (fix) => { fix.fragment.batchId = 'batch-004'; }],
    ['profile', (fix) => {
      fix.fragment.profiles.unknown = fix.fragment.profiles[fix.profileId];
      delete fix.fragment.profiles[fix.profileId];
    }],
    ['SHA', (fix) => { fix.fragment.profiles[fix.profileId].sourceSha256ByClip.move = '0'.repeat(64); }],
    ['clips', (fix) => { delete fix.fragment.profiles[fix.profileId].sourceScaleByClip.move; }],
    ['factor', (fix) => { fix.fragment.profiles[fix.profileId].sourceScaleByClip.move = 4.1; }],
  ];
  for (const [name, mutate] of cases) await t.test(name, async () => {
    const fix = await fixture();
    const before = await readFile(scopedPath(fix.root, fix.targetPath));
    mutate(fix);
    await writeJson(scopedPath(fix.root, fix.fragmentPath), fix.fragment);
    await assert.rejects(
      mergeScaleReviewFragments({ batch: fix.batchId, fragmentPaths: [fix.fragmentPath], root: fix.root }),
      /scale-review|Post-generation scale review|Unknown profile/,
    );
    assert.deepEqual(await readFile(scopedPath(fix.root, fix.targetPath)), before);
  });
});
