import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../src/content-core-v50.js';
import { ANIMATION_CONTRACTS, BATCH_SIZE, FIRST_BATCH_IDS, animationContractFor, normalizeEnemyIdentity, reviewedReference } from '../scripts/enemy-batch-contracts.mjs';
import { QUEUE_PATH, STATE_PATH, REFERENCES_PATH, REVIEW_CHECKS, buildEnemyBatchQueue, initializeEnemyBatchQueue, appendProductionEvent, emptyState, getJobStatus, scopedPath, summarizeQueue } from '../scripts/enemy-batch-production.mjs';

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
async function repairedReceipt(fix, clip = fix.job.clips[0]) {
  const actualPromptPath = `synthetic-${clip.id}-actual-prompt.txt`;
  const repairPromptPath = `synthetic-${clip.id}-repair-prompt.txt`;
  const actualPromptText = `Synthetic ImageGen instructions for repaired ${clip.id}.\n`;
  const repairPromptText = `Synthetic ImageGen canvas repair instructions for ${clip.id}.\n`;
  await writeFile(scopedPath(fix.root, actualPromptPath), actualPromptText);
  await writeFile(scopedPath(fix.root, repairPromptPath), repairPromptText);
  return {
    actualPromptText,
    receipt: {
      schema: 1, kind: 'generated-and-source-repaired', profileId: fix.job.profileId, clipId: clip.id,
      provider: 'OpenAI ImageGen', generationId: `synthetic-repaired-${clip.id}`, actor: 'test',
      note: 'Synthetic repaired source candidate only; never accepted or integrated.',
      referenceLockSha256: fix.job.referenceLockSha256, queuePromptSha256: clip.promptSha256,
      actualPromptPath, actualPromptFileSha256: hash(actualPromptText), repairPromptPath, repairPromptFileSha256: hash(repairPromptText),
      sourceSha256: hash(await readFile(scopedPath(fix.root, clip.sourcePath))), savedSourcePath: clip.sourcePath,
      candidateSelected: true, accepted: false, runtimeIntegrated: false,
      sourceRepairs: [{ kind: 'imagegen-canvas-repair', inputRetained: 'synthetic-rejected-input.png', outputRetained: 'synthetic-repaired-output.png', result: 'Synthetic exact canvas repair.', pixelPreserving: false }]
    }
  };
}
async function recoveredRepairedReceipt(fix, clip = fix.job.clips[0]) {
  const queuePromptSnapshotPath = `synthetic-${clip.id}-queue-current.txt`;
  const rawCapturePath = `synthetic-${clip.id}-raw-capture.bin`;
  const rawCaptureBytes = Buffer.from(`Immutable recovered ImageGen payload for ${clip.id}.`);
  await writeFile(scopedPath(fix.root, queuePromptSnapshotPath), clip.prompt);
  await writeFile(scopedPath(fix.root, rawCapturePath), rawCaptureBytes);
  const rawCaptureSha256 = hash(rawCaptureBytes);
  return {
    schema: 1, kind: 'generated-recovered-and-source-repaired', profileId: fix.job.profileId, clipId: clip.id,
    provider: 'OpenAI ImageGen', generationId: `sha256:${rawCaptureSha256}`,
    providerGenerationIdReturned: false,
    generationIdProvenance: 'Synthetic test fixture: provider ID was not retained; immutable raw SHA-256 is the local identifier.',
    actor: 'test', note: 'Synthetic recovered candidate only; prompt gap remains and acceptance is forbidden.',
    actualGenerationPromptAvailable: false, actualPromptPath: null, actualPromptSha256: null, promptSha256: null,
    actualPromptUnavailableReason: 'Synthetic historical fixture has no retained provider prompt or embedded prompt metadata.',
    promptProvenanceNote: 'Current queue prompt is retained only as contract evidence and is not asserted to be the historical provider prompt.',
    currentQueuePromptSnapshotPath: queuePromptSnapshotPath,
    currentQueuePromptFileBytesSha256: hash(clip.prompt),
    computedJsonStringifyPromptSha256: hash(JSON.stringify(clip.prompt)),
    contractPromptSha256: clip.promptSha256, queuePromptSha256: clip.promptSha256,
    referenceLockSha256: fix.job.referenceLockSha256,
    sourcePath: clip.sourcePath, savedSourcePath: clip.sourcePath,
    sourceSha256: hash(await readFile(scopedPath(fix.root, clip.sourcePath))),
    rawCapture: { path: rawCapturePath, sha256: rawCaptureSha256, bytes: rawCaptureBytes.byteLength, pixelEdits: 0, embeddedPromptMetadata: false },
    sourceRepairs: [{ kind: 'synthetic-deterministic-recomposition', result: 'Synthetic source repaired without rewriting the immutable raw capture.', inputPath: rawCapturePath, inputSha256: rawCaptureSha256 }],
    accepted: false, runtimeIntegrated: false, canonExact: false
  };
}
async function selectedCandidateReceipt(fix, clip = fix.job.clips[0]) {
  const promptDocumentPath = `synthetic-${clip.id}-selected-candidate-prompt.txt`;
  const actualPromptText = `Synthetic selected candidate ImageGen prompt for ${clip.id}.\n`;
  await writeFile(scopedPath(fix.root, promptDocumentPath), actualPromptText);
  const source = await readFile(scopedPath(fix.root, clip.sourcePath));
  const input = fix.job.clips.find((candidate) => candidate.id !== clip.id);
  return {
    actualPromptText,
    receipt: {
      schema: 1, kind: 'generated-candidate-selected', profileId: fix.job.profileId, clipId: clip.id,
      iteration: 2, provider: 'OpenAI ImageGen', generationId: `synthetic-selected-${clip.id}`,
      providerGenerationIdReturned: false, generationIdProvenance: 'Synthetic local receipt because no stable provider ID was returned.',
      actor: 'test', recordedAt: '2026-09-01T00:00:00.000Z', promptDocumentPath,
      promptDocumentSha256: hash(actualPromptText), promptSha256: hash(actualPromptText),
      contractPromptSha256: clip.promptSha256, referenceLockSha256: fix.job.referenceLockSha256,
      selectionStatus: 'selected-synthetic-candidate-not-accepted', sourcePath: clip.sourcePath,
      sourceSha256: hash(source), sourceBytes: source.byteLength, sourceSize: [1774, 887],
      persistence: 'Synthetic exact payload persisted without re-encoding.',
      inputImages: [{ role: 'synthetic identity anchor', path: input.sourcePath, sha256: hash(await readFile(scopedPath(fix.root, input.sourcePath))), delivery: 'Synthetic test attachment.' }],
      technicalAudit: { defaultExtraction: 'pass', findings: [] }, accepted: false, runtimeIntegrated: false, canonExact: false
    }
  };
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

// Historical layout fixture, not a rewrite of the production snapshot or state.
function legacyFiveProfileQueue(source) {
  const queue = structuredClone(source);
  queue.batchSize = 5;
  queue.batches = [];
  for (const [index, job] of queue.jobs.entries()) {
    const oldBatch = `batch-${String(Math.floor(index / 5) + 1).padStart(3, '0')}`;
    for (const clip of job.clips) clip.sourcePath = clip.sourcePath.replace(`/v66/${job.batchId}/`, `/v66/${oldBatch}/`);
    job.batchId = oldBatch;
    if (queue.batches.at(-1)?.id !== oldBatch) queue.batches.push({ id: oldBatch, profileIds: [], requiredBoards: 0 });
    queue.batches.at(-1).profileIds.push(job.profileId);
    queue.batches.at(-1).requiredBoards += job.clips.length;
  }
  queue.batchCount = queue.batches.length;
  return queue;
}

async function persistQueueFixture(root, queue, state, references = refs) {
  for (const [path, data] of [[QUEUE_PATH, queue], [STATE_PATH, state], [REFERENCES_PATH, references]]) {
    const target = scopedPath(root, path);
    await mkdir(dirname(target), { recursive: true });
    // Non-default whitespace proves that init preserves existing state bytes.
    await writeFile(target, `${JSON.stringify(data, null, 1).replace(/\n/g, '\r\n')}\r\n`);
  }
}

async function integrateFixtureProfile(fix, state) {
  for (const clip of fix.job.clips) {
    const target = scopedPath(fix.root, clip.sourcePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `synthetic provenance fixture ${fix.job.profileId} ${clip.id}`);
  }
  state = await generated(fix, state);
  await normalized(fix);
  state = await appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root);
  const runtimeEvidence = { result: 'pass', command: 'synthetic migration test only' };
  for (const key of ['registry', 'test', 'log']) {
    const path = `migration-${key}.txt`;
    await writeFile(scopedPath(fix.root, path), `synthetic ${key}`);
    runtimeEvidence[key] = { path };
  }
  return appendProductionEvent(fix.queue, state, { kind: 'integrated', profileId: fix.job.profileId, actor: 'test', note: 'Synthetic migration proof, never production art.', runtimeEvidence }, fix.root);
}

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

test('V66 keeps its five-profile pilot, then queues twenty enemies per batch without recounting V65', () => {
  const queue = buildEnemyBatchQueue();
  assert.equal(queue.totalProfiles, 571);
  assert.equal(queue.archetypeCount, 55);
  assert.equal(queue.productionJobCount, 570);
  assert.equal(BATCH_SIZE, 20);
  assert.equal(queue.batchSize, 20);
  assert.equal(queue.batchCount, 30);
  assert.equal(queue.requiredBoards, 2457);
  assert.deepEqual(queue.batches[0].profileIds, FIRST_BATCH_IDS);
  assert.equal(queue.batches[0].requiredBoards, 20);
  assert.ok(queue.batches.slice(1, -1).every((batch) => batch.profileIds.length === 20));
  assert.equal(queue.batches[1].id, 'batch-002');
  assert.deepEqual(queue.batches[1].profileIds, ENEMIES.filter((enemy) => Number(enemy.id.slice(6, 9)) >= 7 && Number(enemy.id.slice(6, 9)) <= 26).map((enemy) => enemy.id));
  assert.equal(queue.batches[1].requiredBoards, 87);
  assert.equal(queue.batches[1].requiredBoards * 8, 696);
  assert.equal(queue.batches.at(-1).id, 'batch-030');
  assert.equal(queue.batches.at(-1).profileIds.length, 5);
  assert.deepEqual(queue.batches.at(-1).profileIds, ENEMIES.filter((enemy) => Number(enemy.id.slice(6, 9)) >= 567).map((enemy) => enemy.id));
  assert.equal(queue.batches.reduce((total, batch) => total + batch.requiredBoards, 0), 2457);
  assert.deepEqual(queue.batches.flatMap((batch) => batch.profileIds), queue.jobs.map((job) => job.profileId));
  for (const job of queue.jobs) {
    assert.equal(queue.batches.find((batch) => batch.id === job.batchId).profileIds.includes(job.profileId), true);
    assert.ok(job.clips.every((clip) => clip.sourcePath.includes(`/v66/${job.batchId}/${job.profileId}/`)));
  }
  assert.equal(new Set(queue.jobs.map((job) => job.profileId)).size, 570);
  assert.ok(!queue.jobs.some((job) => job.profileId === 'enemy-002-facehugger'));
  assert.equal(queue.baseline[0].countedAsNewV66, false);
  assert.deepEqual(buildEnemyBatchQueue(), queue);
  assert.deepEqual(buildEnemyBatchQueue({ catalog: [...ENEMIES].reverse() }).jobs, queue.jobs);
});

test('init migrates114old batches to30 while preserving all five integrated profiles and exact state bytes', async () => {
  const fix = await fixture();
  const legacy = legacyFiveProfileQueue(fix.queue);
  assert.equal(legacy.batchCount, 114);
  let state = emptyState();
  for (const job of legacy.jobs.slice(0, 5)) state = await integrateFixtureProfile({ ...fix, queue: legacy, job }, state);
  assert.equal(state.events.length, 30);
  await persistQueueFixture(fix.root, legacy, state);
  const beforeState = await readFile(scopedPath(fix.root, STATE_PATH));
  const beforeReferences = await readFile(scopedPath(fix.root, REFERENCES_PATH));
  const migrated = await initializeEnemyBatchQueue({ root: fix.root });
  assert.deepEqual(migrated.jobs.slice(0, 5), legacy.jobs.slice(0, 5));
  assert.deepEqual(migrated.batches[0], legacy.batches[0]);
  assert.deepEqual(migrated.baseline, legacy.baseline);
  assert.deepEqual(await readFile(scopedPath(fix.root, STATE_PATH)), beforeState);
  assert.deepEqual(await readFile(scopedPath(fix.root, REFERENCES_PATH)), beforeReferences);
  for (const job of migrated.jobs.slice(0, 5)) {
    const status = await getJobStatus(job, JSON.parse(beforeState), fix.root);
    assert.equal(status.status, 'integrated', job.profileId);
    assert.equal(status.generatedClips, 4);
    assert.deepEqual(status.issues, []);
  }
  const firstInitBytes = await readFile(scopedPath(fix.root, QUEUE_PATH));
  await initializeEnemyBatchQueue({ root: fix.root });
  assert.deepEqual(await readFile(scopedPath(fix.root, QUEUE_PATH)), firstInitBytes);
  assert.deepEqual(await readFile(scopedPath(fix.root, STATE_PATH)), beforeState);
});

test('migration refuses to orphan recorded work outside the pilot before writing either file', async () => {
  const fix = await fixture();
  const legacy = legacyFiveProfileQueue(fix.queue);
  const moved = legacy.jobs.find((job) => job.profileId === 'enemy-012-carrier');
  assert.equal(moved.batchId, 'batch-003');
  for (const kind of ['generated', 'generated-and-source-repaired', 'generated-recovered-and-source-repaired', 'generated-candidate-selected', 'review-rejected', 'accepted', 'integrated']) {
    const state = { ...emptyState(), events: [{ profileId: moved.profileId, kind, actor: 'test', note: 'Existing recorded work must not be relocated.' }] };
    await persistQueueFixture(fix.root, legacy, state);
    const beforeQueue = await readFile(scopedPath(fix.root, QUEUE_PATH));
    const beforeState = await readFile(scopedPath(fix.root, STATE_PATH));
    await assert.rejects(initializeEnemyBatchQueue({ root: fix.root }), /Refusing to relocate existing production evidence.*enemy-012-carrier/);
    assert.deepEqual(await readFile(scopedPath(fix.root, QUEUE_PATH)), beforeQueue);
    assert.deepEqual(await readFile(scopedPath(fix.root, STATE_PATH)), beforeState);
  }
});

test('migration refuses to orphan an unrecorded source and preserves its pixels', async () => {
  const fix = await fixture();
  const legacy = legacyFiveProfileQueue(fix.queue);
  const moved = legacy.jobs.find((job) => job.profileId === 'enemy-012-carrier');
  const source = scopedPath(fix.root, moved.clips[0].sourcePath);
  await mkdir(dirname(source), { recursive: true });
  await writeFile(source, 'synthetic source bytes requiring preservation');
  await persistQueueFixture(fix.root, legacy, emptyState());
  const beforeQueue = await readFile(scopedPath(fix.root, QUEUE_PATH));
  await assert.rejects(initializeEnemyBatchQueue({ root: fix.root }), /Refusing to relocate existing production files.*enemy-012-carrier/);
  assert.deepEqual(await readFile(scopedPath(fix.root, QUEUE_PATH)), beforeQueue);
  assert.equal(await readFile(source, 'utf8'), 'synthetic source bytes requiring preservation');
});

test('init preserves unchanged recorded work in batch002 and never promotes it during migration', async () => {
  const fix = await fixture();
  const referenceSet = { profiles: { ...refs.profiles, 'enemy-007-praetorian': reference } };
  const legacy = legacyFiveProfileQueue(buildEnemyBatchQueue({ references: referenceSet }));
  const job = legacy.jobs.find((entry) => entry.profileId === 'enemy-007-praetorian');
  const source = scopedPath(fix.root, job.clips[0].sourcePath);
  await mkdir(dirname(source), { recursive: true });
  await writeFile(source, 'synthetic first Praetorian clip');
  const state = await appendProductionEvent(legacy, emptyState(), { kind: 'generated', profileId: job.profileId, clipId: job.clips[0].id, provider: 'OpenAI ImageGen', generationId: 'synthetic-praetorian', actualPromptText: 'test only', actor: 'test', note: 'Partial production fixture.' }, fix.root);
  await persistQueueFixture(fix.root, legacy, state, referenceSet);
  const migrated = await initializeEnemyBatchQueue({ root: fix.root });
  assert.deepEqual(migrated.jobs.find((entry) => entry.profileId === job.profileId), job);
  const status = await getJobStatus(job, state, fix.root);
  assert.equal(status.status, 'generated');
  assert.equal(status.generatedClips, 1);
  assert.equal(status.requiredClips, 5);
  assert.deepEqual(status.issues, []);
});

test('fresh init creates an empty history but refuses malformed or unknown existing state', async () => {
  const fix = await fixture();
  const first = await initializeEnemyBatchQueue({ root: fix.root });
  assert.equal(first.batchCount, 30);
  assert.deepEqual(JSON.parse(await readFile(scopedPath(fix.root, STATE_PATH))), emptyState());
  for (const state of [{ schema: 0, events: [] }, { schema: 1, events: null }, { schema: 1, events: [{ profileId: 'enemy-999-unknown' }] }]) {
    await persistQueueFixture(fix.root, first, state);
    const before = await readFile(scopedPath(fix.root, QUEUE_PATH));
    await assert.rejects(initializeEnemyBatchQueue({ root: fix.root }), /Invalid production state|Unknown profile/);
    assert.deepEqual(await readFile(scopedPath(fix.root, QUEUE_PATH)), before);
  }
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

test('Caravan Stalker keeps quadruped locomotion and only rears during its dedicated strike', () => {
  const job = buildEnemyBatchQueue().jobs.find((entry) => entry.profileId === 'enemy-034-caravan-stalker');
  assert.equal(job.animationFamily, 'quadruped');
  assert.match(job.clips.find((clip) => clip.id === 'move').motion, /Low four-legged running cycle/);
  assert.match(job.clips.find((clip) => clip.id === 'attack').motion, /briefly rears on its hind legs/);
  assert.match(job.clips.find((clip) => clip.id === 'attack').motion, /returns to four-foot recovery/);
  assert.doesNotMatch(job.clips.find((clip) => clip.id === 'attack').motion, /Bipedal claw/);
});

test('Praetorian and Xenoborg overrides preserve their own anatomy, armament and clip identities', () => {
  const queue = buildEnemyBatchQueue();
  for (const job of queue.jobs.filter((entry) => entry.archetype === 'Praetorian')) {
    assert.equal(job.clips.length, 5);
    const attack = job.clips.find((clip) => clip.id === 'attack');
    assert.match(attack.motion, /exactly two main arms/);
    assert.match(attack.motion, /locked crown silhouette/);
    assert.doesNotMatch(attack.motion, /with the locked crown, small inner arms/);
    assert.match(attack.prompt, /Do not add small inner arms/);
  }
  for (const job of queue.jobs.filter((entry) => entry.archetype === 'Xenoborg')) {
    assert.deepEqual(job.clips.map((clip) => clip.id), ['idle', 'move', 'attack', 'death', 'reload']);
    assert.match(job.clips[2].motion, /permanently grafted forearm laser cannons/);
    assert.match(job.clips[4].motion, /capacitor recharge and heat-venting/);
    assert.doesNotMatch(job.clips[2].motion, /Shoulder and aim/);
    assert.doesNotMatch(job.clips[4].motion, /remove magazine, insert replacement/);
    assert.deepEqual(job.clips[4].frames, [32, 33, 34, 35, 36, 37, 38, 39]);
    assert.equal(job.clips[4].fps, 10);
  }
  const commando = queue.jobs.find((job) => job.archetype === 'Weyland-Yutani Commando');
  assert.match(commando.clips.find((clip) => clip.id === 'reload').motion, /remove magazine, insert replacement/);
  for (const id of FIRST_BATCH_IDS) {
    const job = queue.jobs.find((entry) => entry.profileId === id);
    assert.equal(animationContractFor(job), ANIMATION_CONTRACTS[job.animationFamily]);
  }
});

test('reviewed references gate generation and are never a1:1certification', () => {
  const queue = buildEnemyBatchQueue({ references: refs });
  assert.equal(queue.jobs.filter((job) => job.initialStatus === 'ready-generation').length, 5);
  assert.ok(queue.jobs.slice(0, 5).every((job) => job.clips.length === 4 && job.grid.rows === 8));
  assert.match(queue.jobs[0].clips[0].sourcePath, /frames\/v66\/batch-001\/enemy-001-ovomorph\/sealed\.png$/);
  assert.equal(reviewedReference({ ...reference, reviewer: '' }), null);
  const localOnly = reviewedReference({ ...reference, urls: [], localPaths: ['assets/project-original/reference.png'] });
  assert.deepEqual(localOnly.urls, []);
  assert.deepEqual(localOnly.localPaths, ['assets/project-original/reference.png']);
  assert.equal(reviewedReference({ ...reference, urls: [], localPaths: [] }), null);
  assert.equal(reviewedReference({ ...reference, urls: [], localPaths: ['../outside.png'] }), null);
  const localOnlyRefs = { profiles: { ...refs.profiles, [FIRST_BATCH_IDS[0]]: { ...reference, urls: [], localPaths: ['assets/project-original/reference.png'] } } };
  const localOnlyJob = buildEnemyBatchQueue({ references: localOnlyRefs }).jobs.find((job) => job.profileId === FIRST_BATCH_IDS[0]);
  assert.equal(localOnlyJob.initialStatus, 'ready-generation');
  assert.ok(localOnlyJob.referenceLockSha256);
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

test('generated receipts accept exact source hashes and preserve legacy receipts without hashes', async () => {
  const fix = await fixture();
  const clip = fix.job.clips[0];
  const sourceSha256 = hash(await readFile(scopedPath(fix.root, clip.sourcePath)));
  const receipt = { kind: 'generated', profileId: fix.job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: 'test-only-receipt', actualPromptText: 'Synthetic receipt fixture.', actor: 'test', note: 'Synthetic fixture, never production art.' };
  for (const source of [receipt, { ...receipt, sourceSha256 }]) {
    const state = await appendProductionEvent(fix.queue, emptyState(), source, fix.root);
    assert.equal(state.events[0].sourceSha256, sourceSha256);
    assert.equal(state.events[0].sourcePath, clip.sourcePath);
    assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 1);
  }
  assert.equal(Object.hasOwn(receipt, 'sourceSha256'), false);
});

test('repaired generation preserves every receipt proof and remains a generated candidate only', async () => {
  const fix = await fixture();
  const { receipt, actualPromptText } = await repairedReceipt(fix);
  const originalReceipt = structuredClone(receipt);
  let state = await appendProductionEvent(fix.queue, emptyState(), receipt, fix.root);
  const recorded = state.events[0];
  assert.deepEqual(receipt, originalReceipt);
  assert.equal(recorded.kind, 'generated-and-source-repaired');
  assert.equal(recorded.sourcePath, fix.job.clips[0].sourcePath);
  assert.equal(recorded.savedSourcePath, receipt.savedSourcePath);
  assert.equal(recorded.sourceSha256, receipt.sourceSha256);
  assert.equal(recorded.actualPromptText, actualPromptText);
  assert.equal(recorded.actualPromptFileSha256, receipt.actualPromptFileSha256);
  assert.equal(recorded.repairPromptPath, receipt.repairPromptPath);
  assert.equal(recorded.repairPromptFileSha256, receipt.repairPromptFileSha256);
  assert.deepEqual(recorded.sourceRepairs, receipt.sourceRepairs);
  assert.equal(recorded.accepted, false);
  assert.equal(recorded.runtimeIntegrated, false);
  let status = await getJobStatus(fix.job, state, fix.root);
  assert.equal(status.status, 'generated');
  assert.equal(status.generatedClips, 1);

  for (const clip of fix.job.clips.slice(1)) state = await appendProductionEvent(fix.queue, state, { kind: 'generated', profileId: fix.job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: `synthetic-${clip.id}`, actualPromptText: `Synthetic ${clip.id} prompt.`, actor: 'test', note: 'Synthetic candidate only.' }, fix.root);
  await normalized(fix);
  state = await appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'accepted');
  const acceptedEvent = structuredClone(state.events.at(-1));

  state = await appendProductionEvent(fix.queue, state, { ...receipt, generationId: 'synthetic-repaired-after-review' }, fix.root);
  status = await getJobStatus(fix.job, state, fix.root);
  assert.equal(status.status, 'generated');
  assert.equal(status.generatedClips, fix.job.clips.length);
  assert.deepEqual(status.issues, []);
  assert.deepEqual(state.events.at(-2), acceptedEvent);
  const summary = await summarizeQueue(fix.queue, state, fix.root);
  assert.equal(summary.counts.generated, 1);
  assert.equal(summary.counts.accepted, 0);
  assert.equal(summary.verifiedGeneratedBoards, fix.job.clips.length);
});

test('repaired generation rejects incomplete, stale or rewritten repair provenance', async () => {
  const fix = await fixture();
  const { receipt } = await repairedReceipt(fix);
  const invalid = [
    [{ ...receipt, provider: 'Other provider' }, /actual OpenAI provider/],
    [{ ...receipt, actualPromptPath: undefined, actualPromptFileSha256: undefined }, /actualPromptText or actualPromptPath/],
    [{ ...receipt, savedSourcePath: 'assets/openai/sprites/frames/v66/wrong.png' }, /saved source path/],
    [{ ...receipt, sourceSha256: '0'.repeat(64) }, /source SHA-256/],
    [{ ...receipt, sourceRepairs: [] }, /non-empty sourceRepairs/],
    [{ ...receipt, sourceRepairs: [{}] }, /documented kind and result/],
    [{ ...receipt, actualPromptFileSha256: '0'.repeat(64) }, /Actual prompt file changed/],
    [{ ...receipt, repairPromptFileSha256: '0'.repeat(64) }, /Repair prompt file changed/],
    [{ ...receipt, repairPromptFileSha256: undefined }, /both path and SHA-256/],
    [{ ...receipt, queuePromptSha256: '0'.repeat(64) }, /queue prompt SHA-256 is stale/],
    [{ ...receipt, referenceLockSha256: '0'.repeat(64) }, /reference lock SHA-256 is stale/]
  ];
  for (const [candidate, message] of invalid) {
    const before = structuredClone(candidate);
    await assert.rejects(appendProductionEvent(fix.queue, emptyState(), candidate, fix.root), message);
    assert.deepEqual(candidate, before);
  }
});

test('recovered repaired generation preserves the prompt gap without substituting queue text', async () => {
  const fix = await fixture();
  const receipt = await recoveredRepairedReceipt(fix);
  const originalReceipt = structuredClone(receipt);
  const state = await appendProductionEvent(fix.queue, emptyState(), receipt, fix.root);
  assert.deepEqual(receipt, originalReceipt);
  const recorded = state.events[0];
  assert.equal(recorded.kind, 'generated-recovered-and-source-repaired');
  assert.equal(recorded.actualGenerationPromptAvailable, false);
  assert.equal(recorded.actualPromptText, undefined);
  assert.equal(recorded.actualPromptPath, null);
  assert.equal(recorded.actualPromptSha256, null);
  assert.equal(recorded.promptSha256, null);
  assert.equal(recorded.queuePromptSha256, fix.job.clips[0].promptSha256);
  assert.equal(recorded.rawCapture.sha256, receipt.rawCapture.sha256);
  const status = await getJobStatus(fix.job, state, fix.root);
  assert.equal(status.status, 'generated');
  assert.equal(status.generatedClips, 1);
  assert.equal(status.recoveredPromptGaps, 1);
  assert.deepEqual(status.issues, []);
  const summary = await summarizeQueue(fix.queue, state, fix.root);
  assert.equal(summary.verifiedGeneratedBoards, 1);
  assert.equal(summary.recoveredPromptGapBoards, 1);
});

test('recovered repaired generation rejects guessed prompts and stale recovery evidence', async () => {
  const fix = await fixture();
  const receipt = await recoveredRepairedReceipt(fix);
  const invalid = [
    [{ ...receipt, actualGenerationPromptAvailable: true }, /explicitly declare.*unavailable/],
    [{ ...receipt, actualPromptText: fix.job.clips[0].prompt }, /cannot substitute queue text/],
    [{ ...receipt, actualPromptPath: receipt.currentQueuePromptSnapshotPath }, /cannot substitute queue text/],
    [{ ...receipt, promptSha256: receipt.queuePromptSha256 }, /keep promptSha256 null|cannot substitute/],
    [{ ...receipt, usedQueuePrompt: true }, /cannot substitute queue text/],
    [{ ...receipt, actualPromptUnavailableReason: '' }, /prompt-unavailability reason/],
    [{ ...receipt, currentQueuePromptFileBytesSha256: '0'.repeat(64) }, /Current queue prompt snapshot file changed/],
    [{ ...receipt, computedJsonStringifyPromptSha256: '0'.repeat(64) }, /queue snapshot differs/],
    [{ ...receipt, generationId: 'synthetic-guessed-id' }, /immutable raw SHA-256/],
    [{ ...receipt, rawCapture: { ...receipt.rawCapture, sha256: '0'.repeat(64) } }, /Recovered raw capture file changed/],
    [{ ...receipt, rawCapture: { ...receipt.rawCapture, bytes: receipt.rawCapture.bytes + 1 } }, /byte count/],
    [{ ...receipt, rawCapture: { ...receipt.rawCapture, pixelEdits: 1 } }, /zero-edit/],
    [{ ...receipt, sourceRepairs: undefined }, /bind the immutable raw capture/],
    [{ ...receipt, sourceRepairs: [{ ...receipt.sourceRepairs[0], inputSha256: '0'.repeat(64) }] }, /bind the immutable raw capture/],
    [{ ...receipt, accepted: true }, /remain unaccepted/]
  ];
  for (const [candidate, message] of invalid) {
    const before = structuredClone(candidate);
    await assert.rejects(appendProductionEvent(fix.queue, emptyState(), candidate, fix.root), message);
    assert.deepEqual(candidate, before);
  }
});

test('recovered prompt gaps can be counted as generated evidence but cannot be accepted', async () => {
  const fix = await fixture();
  let state = emptyState();
  for (const clip of fix.job.clips) state = await appendProductionEvent(fix.queue, state, await recoveredRepairedReceipt(fix, clip), fix.root);
  const status = await getJobStatus(fix.job, state, fix.root);
  assert.equal(status.generatedClips, fix.job.clips.length);
  assert.equal(status.recoveredPromptGaps, fix.job.clips.length);
  await normalized(fix);
  await assert.rejects(appendProductionEvent(fix.queue, state, acceptance(fix.job), fix.root), /Cannot accept recovered generation/);
  const summary = await summarizeQueue(fix.queue, state, fix.root);
  assert.equal(summary.verifiedGeneratedBoards, fix.job.clips.length);
  assert.equal(summary.recoveredPromptGapBoards, fix.job.clips.length);
});

test('repaired generation verifies every documented sourceRepair path and SHA-256 pair', async () => {
  const fix = await fixture();
  const { receipt } = await repairedReceipt(fix);
  const evidence = {
    inputPath: 'synthetic-repair-input.bin', outputPath: 'synthetic-repair-output.bin',
    receiptPath: 'synthetic-repair-receipt.json', path: 'synthetic-repair-generic-proof.txt'
  };
  for (const [key, path] of Object.entries(evidence)) await writeFile(scopedPath(fix.root, path), `Synthetic ${key} evidence.`);
  const repair = {
    kind: 'documented-file-repair', result: 'Synthetic repaired source with every recognized evidence pair.',
    inputPath: evidence.inputPath, inputSha256: hash(await readFile(scopedPath(fix.root, evidence.inputPath))),
    outputPath: evidence.outputPath, outputSha256: hash(await readFile(scopedPath(fix.root, evidence.outputPath))),
    receiptPath: evidence.receiptPath, receiptSha256: hash(await readFile(scopedPath(fix.root, evidence.receiptPath))),
    path: evidence.path, sha256: hash(await readFile(scopedPath(fix.root, evidence.path)))
  };
  const complete = { ...receipt, sourceRepairs: [repair] };
  const original = structuredClone(complete);
  const state = await appendProductionEvent(fix.queue, emptyState(), complete, fix.root);
  assert.deepEqual(complete, original);
  assert.deepEqual(state.events[0].sourceRepairs, [repair]);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 1);

  const invalidRepairs = [
    [{ ...repair, inputSha256: undefined }, /both inputPath and inputSha256/],
    [{ ...repair, outputPath: undefined }, /both outputPath and outputSha256/],
    [{ ...repair, receiptSha256: '0'.repeat(64) }, /Repair receipt.*file changed/],
    [{ ...repair, sha256: undefined }, /both path and sha256/],
    [{ ...repair, path: '../outside-proof.txt' }, /escapes repository/],
    [{ ...repair, path: 'missing-proof.txt' }, /ENOENT/],
    [{ ...repair, sha256: '0'.repeat(64) }, /Repair file.*file changed/]
  ];
  for (const [sourceRepair, message] of invalidRepairs) {
    const candidate = { ...receipt, sourceRepairs: [sourceRepair] };
    const before = structuredClone(candidate);
    await assert.rejects(appendProductionEvent(fix.queue, emptyState(), candidate, fix.root), message);
    assert.deepEqual(candidate, before);
  }
});

test('selected candidate is the latest generation while preserving prior rejection and raw receipt provenance', async () => {
  const fix = await fixture();
  const clip = fix.job.clips[0];
  let state = await appendProductionEvent(fix.queue, emptyState(), { kind: 'generated', profileId: fix.job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: 'synthetic-rejected-generation', actualPromptText: 'Synthetic rejected candidate prompt.', actor: 'test', note: 'Synthetic candidate before explicit rejection.' }, fix.root);
  state = await appendProductionEvent(fix.queue, state, { kind: 'review-rejected', profileId: fix.job.profileId, actor: 'reviewer', note: 'Synthetic first candidate rejected and retained.' }, fix.root);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).status, 'review-rejected');

  const { receipt, actualPromptText } = await selectedCandidateReceipt(fix, clip);
  const originalReceipt = structuredClone(receipt);
  state = await appendProductionEvent(fix.queue, state, receipt, fix.root);
  assert.deepEqual(receipt, originalReceipt);
  assert.deepEqual(state.events.slice(0, 2).map((event) => event.kind), ['generated', 'review-rejected']);
  const recorded = state.events.at(-1);
  assert.equal(recorded.kind, 'generated-candidate-selected');
  assert.equal(recorded.actualPromptText, actualPromptText);
  assert.equal(recorded.promptSha256, receipt.promptDocumentSha256, 'the receipt raw file hash is retained, not rewritten as a content hash');
  assert.equal(recorded.selectionStatus, receipt.selectionStatus);
  assert.deepEqual(recorded.inputImages, receipt.inputImages);
  assert.deepEqual(recorded.technicalAudit, receipt.technicalAudit);
  assert.equal(recorded.accepted, false);
  assert.equal(recorded.runtimeIntegrated, false);
  const status = await getJobStatus(fix.job, state, fix.root);
  assert.equal(status.status, 'generated');
  assert.equal(status.generatedClips, 1);
  assert.deepEqual(status.issues, []);
});

test('selected candidate validates prompt, active source, input anchors and non-acceptance selection provenance', async () => {
  const fix = await fixture();
  const { receipt } = await selectedCandidateReceipt(fix);
  const invalid = [
    [{ ...receipt, provider: 'Other provider' }, /actual OpenAI provider/],
    [{ ...receipt, promptDocumentPath: undefined }, /promptDocumentPath/],
    [{ ...receipt, promptDocumentSha256: '0'.repeat(64), promptSha256: '0'.repeat(64) }, /prompt document file changed/],
    [{ ...receipt, promptSha256: '0'.repeat(64) }, /must retain its documented file hash/],
    [{ ...receipt, sourcePath: 'assets/openai/sprites/frames/v66/wrong.png' }, /source path/],
    [{ ...receipt, sourceSha256: '0'.repeat(64) }, /source SHA-256/],
    [{ ...receipt, sourceBytes: receipt.sourceBytes + 1 }, /byte count/],
    [{ ...receipt, iteration: 0 }, /positive iteration/],
    [{ ...receipt, selectionStatus: 'candidate-only' }, /selectionStatus provenance/],
    [{ ...receipt, generationIdProvenance: '' }, /generation ID provenance/],
    [{ ...receipt, persistence: '' }, /persistence provenance/],
    [{ ...receipt, accepted: true }, /explicitly remain unaccepted/],
    [{ ...receipt, runtimeIntegrated: true }, /explicitly remain unaccepted/],
    [{ ...receipt, canonExact: true }, /explicitly remain unaccepted/],
    [{ ...receipt, inputImages: [] }, /non-empty array/],
    [{ ...receipt, inputImages: [{ ...receipt.inputImages[0], sha256: '0'.repeat(64) }] }, /input image file changed/]
  ];
  for (const [candidate, message] of invalid) {
    const before = structuredClone(candidate);
    await assert.rejects(appendProductionEvent(fix.queue, emptyState(), candidate, fix.root), message);
    assert.deepEqual(candidate, before);
  }
});

test('clip provenance is resumable but rejects replaying an old hash after source replacement', async () => {
  const fix = await fixture();
  const state = await generated(fix);
  assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 4);
  await writeFile(scopedPath(fix.root, fix.job.clips[0].sourcePath), 'changed source');
  const stale = await getJobStatus(fix.job, state, fix.root);
  assert.equal(stale.generatedClips, 3);
  assert.match(stale.issues[0], /missing or changed/);
  const beforeReplay = structuredClone(state);
  await assert.rejects(appendProductionEvent(fix.queue, state, { ...state.events[0], generationId: 'second-test-generation' }, fix.root), /Supplied source SHA-256 does not match/);
  assert.deepEqual(state, beforeReplay);
  const refreshed = await appendProductionEvent(fix.queue, state, { ...state.events[0], generationId: 'second-test-generation', sourceSha256: hash('changed source') }, fix.root);
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

test('supplied actual prompt text cannot be silently replaced by a different prompt file', async () => {
  const fix = await fixture();
  const path = 'synthetic-actual-prompt.txt', savedText = 'Exact synthetic instructions.\n';
  await writeFile(scopedPath(fix.root, path), savedText);
  const state = emptyState(), before = structuredClone(state);
  const base = { kind: 'generated', profileId: fix.job.profileId, clipId: fix.job.clips[0].id, provider: 'OpenAI ImageGen', generationId: 'synthetic-prompt-mismatch', actor: 'test', note: 'Synthetic prompt integrity fixture.', actualPromptPath: path };
  for (const actualPromptText of ['Different synthetic instructions.\n', savedText.trimEnd(), '', null]) {
    const receipt = { ...base, actualPromptText }, originalReceipt = structuredClone(receipt);
    await assert.rejects(appendProductionEvent(fix.queue, state, receipt, fix.root), /Supplied actual prompt text does not match/);
    assert.deepEqual(receipt, originalReceipt);
    assert.deepEqual(state, before);
    assert.equal(await readFile(scopedPath(fix.root, path), 'utf8'), savedText);
  }
});

test('path-only legacy prompts and exactly matching dual prompt inputs retain their exact text', async () => {
  const fix = await fixture();
  const path = 'synthetic-exact-prompt.txt', text = 'Exact synthetic instructions, accents pr\u00e9serv\u00e9s.\n';
  await writeFile(scopedPath(fix.root, path), text);
  const base = { kind: 'generated', profileId: fix.job.profileId, clipId: fix.job.clips[0].id, provider: 'OpenAI ImageGen', generationId: 'synthetic-prompt-exact', actor: 'test', note: 'Synthetic exact prompt fixture.', actualPromptPath: path };
  for (const receipt of [base, { ...base, actualPromptText: text }, { ...base, promptSha256: hash(text) }]) {
    const originalReceipt = structuredClone(receipt);
    const state = await appendProductionEvent(fix.queue, emptyState(), receipt, fix.root);
    assert.equal(state.events[0].actualPromptText, text);
    assert.equal(state.events[0].actualPromptPath, path);
    assert.equal(state.events[0].promptSha256, receipt.promptSha256 ?? hash(JSON.stringify(text)));
    assert.equal((await getJobStatus(fix.job, state, fix.root)).generatedClips, 1);
    assert.deepEqual(receipt, originalReceipt);
  }
});
