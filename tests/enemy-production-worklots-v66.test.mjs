import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { FIRST_BATCH_IDS } from '../scripts/enemy-batch-contracts.mjs';
import { QUEUE_PATH, STATE_PATH, REFERENCES_PATH, REVIEW_CHECKS, buildEnemyBatchQueue, emptyState, appendProductionEvent } from '../scripts/enemy-batch-production.mjs';
import { WORKLOT_SIZE, PREVIOUS_WORKLOTS_PATH, WORKLOTS_PATH, loadValidatedProduction, buildWorklotManifest, validateWorklotManifest, summarizeWorklots, initializeWorklots, worklotStatus, main } from '../scripts/enemy-production-worklots-v66.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const reference = { status: 'reviewed', urls: ['https://example.com/synthetic-reference'], localPaths: [], designLock: 'Synthetic test identity; never production art.', reviewer: 'test', reviewedAt: '2026-08-31', canonExact: false };
async function put(root, path, value) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), value);
}
async function persist(fix) {
  for (const [path, value] of [[QUEUE_PATH, fix.queue], [STATE_PATH, fix.state], [REFERENCES_PATH, fix.references]]) {
    await put(fix.root, path, JSON.stringify(value, null, 1).replace(/\n/g, '\r\n') + '\r\n');
  }
}
async function generated(fix, job) {
  for (const clip of job.clips) {
    await put(fix.root, clip.sourcePath, `Synthetic provenance bytes, not art: ${job.profileId}/${clip.id}`);
    fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'generated', profileId: job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: `synthetic-${fix.state.events.length}`, actualPromptText: `Synthetic fixture prompt ${clip.id}`, actor: 'test', note: 'Test-only source evidence; never production imagery.' }, fix.root);
  }
}
async function integrated(fix, job) {
  await generated(fix, job);
  const anchorPath = `proofs/${job.profileId}-anchors.txt`;
  await put(fix.root, anchorPath, 'Synthetic individually reviewed roots.');
  await put(fix.root, job.normalizedPath, 'Synthetic test atlas bytes.');
  const metadata = { profileId: job.profileId, normalizationStatus: 'validated', normalizedSha256: hash(await readFile(join(fix.root, job.normalizedPath))), validation: { findings: [] },
    sources: await Promise.all(job.clips.map(async (clip) => ({ clip: clip.id, path: clip.sourcePath, sha256: hash(await readFile(join(fix.root, clip.sourcePath))) }))),
    physicalAnchorReview: { path: anchorPath, sha256: hash(await readFile(join(fix.root, anchorPath))), status: 'reviewed', reviewedPoseCount: job.clips.length * 8 },
    placements: Array.from({ length: job.clips.length * 8 }, () => ({ anchorStatus: 'reviewed-physical-root' })) };
  await put(fix.root, job.metadataPath, JSON.stringify(metadata));
  fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'accepted', profileId: job.profileId, actor: 'test', note: 'Synthetic acceptance fixture.', review: Object.fromEntries(REVIEW_CHECKS.map((key) => [key, true])) }, fix.root);
  const runtimeEvidence = { result: 'pass', command: 'synthetic-test' };
  for (const key of ['registry', 'test', 'log']) {
    const path = `proofs/${job.profileId}-${key}.txt`;
    await put(fix.root, path, 'Synthetic runtime proof.');
    runtimeEvidence[key] = { path };
  }
  fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'integrated', profileId: job.profileId, actor: 'test', note: 'Synthetic integration fixture.', runtimeEvidence }, fix.root);
}
async function fixture(t, { pilot = false, secondBatch = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'atf-v66-worklots-test-'));
  t.after(async () => {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert.ok(root.includes('atf-v66-worklots-test-'));
    await rm(root, { recursive: true, force: true });
  });
  const firstQueue = buildEnemyBatchQueue();
  const references = { schema: 1, profiles: Object.fromEntries([...FIRST_BATCH_IDS, ...firstQueue.batches[1].profileIds].map((id) => [id, reference])) };
  const fix = { root, references, queue: buildEnemyBatchQueue({ references }), state: emptyState() };
  if (pilot) for (const job of fix.queue.jobs.slice(0, 5)) await integrated(fix, job);
  if (secondBatch) for (const job of fix.queue.jobs.filter((job) => job.batchId === 'batch-002')) await generated(fix, job);
  await persist(fix);
  return fix;
}
async function inputHashes(root) {
  return Promise.all([QUEUE_PATH, STATE_PATH, REFERENCES_PATH].map(async (path) => hash(await readFile(join(root, path)))));
}

test('202-profile overlay counts actual latest sources and preserves all input bytes/batch IDs', async (t) => {
  const fix = await fixture(t, { pilot: true, secondBatch: true });
  const job = fix.queue.jobs.find((job) => job.batchId === 'batch-002'), clip = job.clips[0];
  for (let index = 0; index < 30; index++) fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'generated', profileId: job.profileId, clipId: clip.id, provider: 'OpenAI ImageGen', generationId: `synthetic-revision-${index}`, actualPromptText: 'Synthetic replacement event, same currently selected source.', actor: 'test', note: 'Revisions are not additional boards.' }, fix.root);
  await persist(fix);
  const before = await inputHashes(fix.root);
  const production = await loadValidatedProduction({ root: fix.root });
  const manifest = buildWorklotManifest(production);
  const report = summarizeWorklots(manifest, production);
  assert.equal(WORKLOT_SIZE, 202);
  assert.deepEqual(report.worklots.map((lot) => lot.profileCount), [202, 202, 161]);
  assert.deepEqual(report.worklots.map((lot) => lot.requiredBoards), [872, 871, 694]);
  assert.deepEqual(report.worklots.map((lot) => lot.verifiedGeneratedBoards), [87, 0, 0]);
  assert.deepEqual(report.worklots.map((lot) => lot.remainingBoards), [785, 871, 694]);
  assert.deepEqual(report.worklots.map((lot) => lot.firstProfileId.slice(6, 9)), ['007', '209', '411']);
  assert.deepEqual(report.worklots.map((lot) => lot.lastProfileId.slice(6, 9)), ['208', '410', '571']);
  assert.equal(report.worklots[0].stages.references.reviewedProfiles, 20);
  assert.equal(report.worklots[0].stages.references.missingProfileIds.length, 182);
  assert.equal(fix.state.events.filter((event) => event.kind === 'generated').length, 137);
  assert.equal(production.summary.verifiedGeneratedBoards, 107);
  assert.equal(report.counts.verifiedGeneratedBoards, 87);
  assert.equal(report.counts.notFinishedProfiles, 565);
  assert.equal(report.counts.excludedBaselineProfiles, 1);
  assert.equal(report.counts.excludedInitiallyIntegratedProfiles, 5);
  assert.equal(report.automaticProduction, false);
  assert.equal(report.apiCallsMade, 0);
  assert.equal(report.worklots[0].stages.normalization.automaticallyInferredFromSources, false);
  assert.deepEqual(report.worklots[0].stages.visualAcceptance.acceptedProfileIds, []);
  assert.equal(report.worklots[0].stages.runtimeIntegration.notFinishedProfileIds.length, 202);
  for (const lot of manifest.worklots) for (const binding of lot.profiles) {
    const original = fix.queue.jobs.find((item) => item.profileId === binding.profileId);
    assert.equal(binding.batchId, original.batchId);
    assert.deepEqual(binding.sourcePaths, original.clips.map((source) => source.sourcePath));
  }
  assert.deepEqual(await inputHashes(fix.root), before);
  await assert.rejects(access(join(fix.root, WORKLOTS_PATH)));
});

test('worklots validate and count repaired and selected-candidate events as latest generation only', async (t) => {
  const fix = await fixture(t);
  const job = fix.queue.jobs[0];
  for (const clip of job.clips) await put(fix.root, clip.sourcePath, `Synthetic mixed generation source: ${clip.id}`);
  const [plain, repaired, selected, finalPlain] = job.clips;
  fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'generated', profileId: job.profileId, clipId: plain.id, provider: 'OpenAI ImageGen', generationId: 'synthetic-mixed-plain', actualPromptText: 'Synthetic plain candidate prompt.', actor: 'test', note: 'Synthetic plain candidate only.' }, fix.root);
  fix.state = await appendProductionEvent(fix.queue, fix.state, {
    kind: 'generated-and-source-repaired', profileId: job.profileId, clipId: repaired.id, provider: 'OpenAI ImageGen', generationId: 'synthetic-mixed-repaired',
    actualPromptText: 'Synthetic repaired candidate prompt.', sourcePath: repaired.sourcePath,
    sourceSha256: hash(await readFile(join(fix.root, repaired.sourcePath))), sourceRepairs: [{ kind: 'synthetic-repair', result: 'Synthetic repair evidence only.' }],
    actor: 'test', note: 'Synthetic repaired candidate only; not accepted.'
  }, fix.root);
  fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'generated', profileId: job.profileId, clipId: finalPlain.id, provider: 'OpenAI ImageGen', generationId: 'synthetic-mixed-final', actualPromptText: 'Synthetic final plain prompt.', actor: 'test', note: 'Synthetic plain candidate only.' }, fix.root);
  fix.state = await appendProductionEvent(fix.queue, fix.state, { kind: 'review-rejected', profileId: job.profileId, actor: 'reviewer', note: 'Synthetic selection rejected; all source receipts retained.' }, fix.root);

  const promptDocumentPath = `proofs/${job.profileId}-${selected.id}-selected.txt`;
  const promptText = 'Synthetic selected-candidate prompt document.\n';
  await put(fix.root, promptDocumentPath, promptText);
  const selectedSource = await readFile(join(fix.root, selected.sourcePath));
  fix.state = await appendProductionEvent(fix.queue, fix.state, {
    kind: 'generated-candidate-selected', profileId: job.profileId, clipId: selected.id, iteration: 2,
    provider: 'OpenAI ImageGen', generationId: 'synthetic-mixed-selected', providerGenerationIdReturned: false,
    generationIdProvenance: 'Synthetic local receipt; provider returned no stable ID.', actor: 'test',
    promptDocumentPath, promptDocumentSha256: hash(promptText), promptSha256: hash(promptText),
    contractPromptSha256: selected.promptSha256, referenceLockSha256: job.referenceLockSha256,
    selectionStatus: 'selected-synthetic-candidate-not-accepted', sourcePath: selected.sourcePath,
    sourceSha256: hash(selectedSource), sourceBytes: selectedSource.byteLength,
    persistence: 'Synthetic exact payload persistence evidence.', accepted: false, runtimeIntegrated: false, canonExact: false
  }, fix.root);
  await persist(fix);

  const production = await loadValidatedProduction({ root: fix.root });
  const report = summarizeWorklots(buildWorklotManifest(production), production);
  const profile = report.worklots.flatMap((lot) => lot.profiles).find((entry) => entry.profileId === job.profileId);
  assert.equal(production.summary.jobs.find((entry) => entry.profileId === job.profileId).status, 'generated');
  assert.equal(production.summary.jobs.find((entry) => entry.profileId === job.profileId).generatedClips, job.clips.length);
  assert.deepEqual(profile.verifiedGeneratedClipIds, job.clips.map((clip) => clip.id));
  assert.deepEqual(profile.missingClipIds, []);
  assert.equal(report.counts.verifiedGeneratedBoards, job.clips.length);
  assert.deepEqual(fix.state.events.slice(-2).map((event) => event.kind), ['review-rejected', 'generated-candidate-selected']);
});

test('explicit init writes once; later integration refreshes counts without shifting frozen membership', async (t) => {
  const fix = await fixture(t, { pilot: true });
  const before = await inputHashes(fix.root);
  const initial = await initializeWorklots({ root: fix.root, output: WORKLOTS_PATH });
  assert.deepEqual(await inputHashes(fix.root), before);
  const frozenBytes = await readFile(join(fix.root, WORKLOTS_PATH));
  assert.ok(!frozenBytes.includes(13));
  await assert.rejects(initializeWorklots({ root: fix.root, output: WORKLOTS_PATH }), { code: 'EEXIST' });
  const selected = fix.queue.jobs.find((job) => job.profileId === initial.manifest.worklots[0].profiles[0].profileId);
  await integrated(fix, selected);
  await persist(fix);
  const report = await worklotStatus({ root: fix.root });
  assert.equal(report.worklots[0].profileCount, 202);
  assert.equal(report.worklots[1].firstProfileId.slice(6, 9), '209');
  assert.deepEqual(report.worklots[0].stages.runtimeIntegration.integratedProfileIds, [selected.profileId]);
  assert.equal(report.worklots[0].stages.runtimeIntegration.notFinishedProfileIds.length, 201);
  assert.equal(report.counts.notFinishedProfiles, 564);
  assert.deepEqual(report.worklots.flatMap((lot) => lot.profiles.map((job) => job.profileId)), initial.manifest.worklots.flatMap((lot) => lot.profiles.map((job) => job.profileId)));
  assert.deepEqual(await readFile(join(fix.root, WORKLOTS_PATH)), frozenBytes);
  assert.deepEqual(report.initializationInputs, initial.manifest.initializationInputs);
  assert.notEqual(report.currentInputs.state.sha256, report.initializationInputs.state.sha256);
});

test('repository R2 manifest preserves the immutable previous membership and documented bindings', async () => {
  const comparisonPath = 'docs/references/V66_ENEMY_WORKLOTS_202_R2_COMPARISON.json';
  const fromRepository = (path) => new URL('../' + path, import.meta.url);
  const [previousBytes, currentBytes, comparisonBytes] = await Promise.all([
    readFile(fromRepository(PREVIOUS_WORKLOTS_PATH)),
    readFile(fromRepository(WORKLOTS_PATH)),
    readFile(fromRepository(comparisonPath))
  ]);
  const previous = JSON.parse(previousBytes), current = JSON.parse(currentBytes), comparison = JSON.parse(comparisonBytes);
  const boundaries = (manifest) => manifest.worklots.map((lot) => ({
    id: lot.id,
    profileCount: lot.profiles.length,
    firstProfileId: lot.profiles[0].profileId,
    lastProfileId: lot.profiles.at(-1).profileId,
    requiredBoards: lot.requiredBoards
  }));

  assert.equal(PREVIOUS_WORKLOTS_PATH, comparison.previousManifest.path);
  assert.equal(WORKLOTS_PATH, comparison.currentManifest.path);
  assert.equal(WORKLOTS_PATH, comparison.decision.defaultManifestPath);
  assert.equal(hash(previousBytes), 'b6d1281a24f044c0a2bd2c09b730fba5b39cd780300cf71e4b4ee49997962542');
  assert.equal(hash(currentBytes), 'ad5e1381b80e659f4e01013756622e3d4ca3ec77cfe1d29f1122ab9446a055fc');
  assert.equal(hash(previousBytes), comparison.previousManifest.fileSha256);
  assert.equal(hash(currentBytes), comparison.currentManifest.fileSha256);
  assert.notEqual(previous.rosterSha256, current.rosterSha256);
  assert.equal(previous.rosterSha256, comparison.previousManifest.rosterSha256);
  assert.equal(current.rosterSha256, comparison.currentManifest.rosterSha256);
  assert.deepEqual(current.worklots.map((lot) => lot.profiles), previous.worklots.map((lot) => lot.profiles));
  assert.deepEqual(boundaries(current), boundaries(previous));
  assert.deepEqual(boundaries(current), comparison.comparison.worklotBoundaries.lots);
  assert.deepEqual(current.excludedIntegratedProfileIds, previous.excludedIntegratedProfileIds);
  assert.deepEqual(current.excludedBaselineProfileIds, previous.excludedBaselineProfileIds);
  assert.deepEqual(current.excludedIntegratedProfileIds, comparison.comparison.excludedMembership.integratedProfileIds);
  assert.deepEqual(current.excludedBaselineProfileIds, comparison.comparison.excludedMembership.baselineProfileIds);
  assert.equal(comparison.comparison.profileMembership.comparedProfiles, 565);
  assert.equal(comparison.comparison.productionBindings.comparedProfiles, 565);
  assert.equal(comparison.comparison.productionBindings.differenceCount, 0);
  assert.deepEqual(comparison.comparison.productionBindings.comparedFields, ['profileId', 'batchId', 'clipIds', 'sourcePaths']);
  for (const key of ['queue', 'state', 'references']) {
    assert.equal(previous.initializationInputs[key].sha256, comparison.initializationInputChanges[key].previousSha256);
    assert.equal(current.initializationInputs[key].sha256, comparison.initializationInputChanges[key].currentSha256);
  }
  assert.equal(comparison.decision.previousManifestModified, false);
  assert.equal(comparison.decision.automaticRepartitionPerformed, false);
  assert.equal(comparison.decision.automaticAcceptancePerformed, false);
  assert.equal(comparison.decision.productionBatchIdsChanged, false);
});

test('default/status is read-only and never initializes; preview is explicitly unfrozen', async (t) => {
  const fix = await fixture(t);
  const before = await inputHashes(fix.root), logs = [];
  await assert.rejects(main([], { root: fix.root, log: (value) => logs.push(value) }), /no frozen manifest/);
  const args = ['preview', '--size', '202'];
  const report = await main(args, { root: fix.root, log: (value) => logs.push(value) });
  assert.deepEqual(args, ['preview', '--size', '202']);
  assert.equal(report.persisted, false);
  assert.equal(report.membershipFrozen, false);
  assert.equal(report.readOnly, true);
  await assert.rejects(access(join(fix.root, WORKLOTS_PATH)));
  assert.deepEqual(await inputHashes(fix.root), before);
});

test('worklot size202 is exact and CLI rejects ambiguity, missing values and writes during status', async (t) => {
  const fix = await fixture(t);
  const production = await loadValidatedProduction({ root: fix.root });
  for (const size of [20, 201, 203, 0, -1, 202.5, '202', NaN, Infinity, true]) assert.throws(() => buildWorklotManifest(production, { size }), /exactly 202/);
  for (const args of [['status', '--output', WORKLOTS_PATH], ['init'], ['init', '--size', '20', '--output', WORKLOTS_PATH], ['preview', '--size'], ['status', '--unknown', 'x'], ['status', '--size', '202', '--size', '202'], ['generate'], ['preview', '--manifest', WORKLOTS_PATH]]) {
    await assert.rejects(main(args, { root: fix.root, log: () => {} }));
  }
});

test('unknown IDs, duplicate membership, omissions and altered production paths are rejected', async (t) => {
  const fix = await fixture(t);
  const production = await loadValidatedProduction({ root: fix.root }), valid = buildWorklotManifest(production);
  const mutations = [
    (m) => { m.worklots[0].profiles[0].profileId = 'enemy-999-unknown'; },
    (m) => { m.worklots[0].profiles[1] = structuredClone(m.worklots[0].profiles[0]); },
    (m) => { m.worklots[0].profiles.pop(); },
    (m) => { m.worklots[0].profiles[0].batchId = 'batch-999'; },
    (m) => { m.worklots[0].profiles[0].sourcePaths[0] = 'fake.png'; },
    (m) => { m.worklots[0].profiles.reverse(); },
    (m) => { m.membershipSha256 = '0'.repeat(64); },
    (m) => { m.worklots[0].requiredBoards++; },
    (m) => { m.excludedIntegratedProfileIds.push(m.worklots[0].profiles[0].profileId); }
  ];
  for (const mutate of mutations) {
    const damaged = structuredClone(valid);
    mutate(damaged);
    assert.throws(() => validateWorklotManifest(damaged, production));
  }
  const damaged = structuredClone(production);
  damaged.summary.jobs[0].issues = ['stale proof'];
  assert.throws(() => buildWorklotManifest(damaged), /input issues/);
});

test('queue/state/reference inconsistencies and latest stale source proofs fail before grouping', async (t) => {
  const fix = await fixture(t);
  const original = { queue: structuredClone(fix.queue), state: structuredClone(fix.state), references: structuredClone(fix.references) };
  const mutations = [
    () => { fix.queue.jobs[1] = structuredClone(fix.queue.jobs[0]); },
    () => { fix.queue.jobs[0].profileId = 'enemy-999-unknown'; },
    () => { fix.queue.jobs[0].batchId = 'batch-999'; },
    () => { fix.references.profiles['enemy-999-unknown'] = reference; },
    () => { fix.state.events.push({ kind: 'generated', profileId: 'enemy-999-unknown', actor: 'test', note: 'Unknown test.' }); },
    () => { fix.state.events.push({ kind: 'bad-event', profileId: fix.queue.jobs[0].profileId, actor: 'test', note: 'Bad event.' }); },
    () => { fix.state.events.push({ kind: 'review-rejected', profileId: fix.queue.jobs[0].profileId, actor: '', note: 'Missing actor.' }); },
    () => { fix.state.schema = 2; }
  ];
  for (const mutate of mutations) {
    Object.assign(fix, structuredClone(original));
    mutate();
    await persist(fix);
    await assert.rejects(loadValidatedProduction({ root: fix.root }));
  }
  Object.assign(fix, structuredClone(original));
  await generated(fix, fix.queue.jobs[0]);
  await persist(fix);
  await put(fix.root, fix.queue.jobs[0].clips[0].sourcePath, 'Changed bytes after the selected generation event.');
  await assert.rejects(loadValidatedProduction({ root: fix.root }), /input production evidence has issues/);
});

test('files alone and V65 baseline assets are never scanned or counted as new generation', async (t) => {
  const fix = await fixture(t);
  const before = summarizeWorklots(buildWorklotManifest(await loadValidatedProduction({ root: fix.root })), await loadValidatedProduction({ root: fix.root }));
  await put(fix.root, fix.queue.baseline[0].path, 'Existing V65 bytes are not V66 work.');
  await put(fix.root, fix.queue.jobs[0].clips[0].sourcePath, 'Unrecorded source file is not generated evidence.');
  await put(fix.root, 'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-999-unrelated.webp', 'Do not scan.');
  const production = await loadValidatedProduction({ root: fix.root });
  const after = summarizeWorklots(buildWorklotManifest(production), production);
  assert.deepEqual(after.counts, before.counts);
  assert.equal(after.counts.verifiedGeneratedBoards, 0);
  assert.ok(after.worklots.every((lot) => lot.profiles.every((profile) => profile.profileId !== 'enemy-002-facehugger')));
});

test('explicit output is confined to new JSON files under docs/references', async (t) => {
  const fix = await fixture(t);
  for (const output of ['../outside.json', 'docs/references/../../outside.json', '/tmp/out.json', 'C:/outside.json', 'docs\\references\\out.json', 'out.json', 'docs/references/output.txt']) {
    await assert.rejects(initializeWorklots({ root: fix.root, output }));
  }
  const original = await readFile(join(fix.root, QUEUE_PATH));
  await assert.rejects(initializeWorklots({ root: fix.root, output: QUEUE_PATH }), { code: 'EEXIST' });
  assert.deepEqual(await readFile(join(fix.root, QUEUE_PATH)), original);
  await initializeWorklots({ root: fix.root, output: 'docs/references/nested/frozen.json' });
  const report = await worklotStatus({ root: fix.root, manifestPath: 'docs/references/nested/frozen.json' });
  assert.equal(report.membershipFrozen, true);
});

test('output cannot escape through a directory symlink when the platform supports it', async (t) => {
  const fix = await fixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'atf-v66-worklots-test-outside-'));
  t.after(async () => { assert.equal(dirname(resolve(outside)), resolve(tmpdir())); await rm(outside, { recursive: true, force: true }); });
  try { await symlink(outside, join(fix.root, 'docs/references/escape'), 'junction'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) return t.skip('Windows does not grant junction/symlink creation here.'); throw error; }
  await assert.rejects(initializeWorklots({ root: fix.root, output: 'docs/references/escape/output.json' }), /escapes/);
  await assert.rejects(access(join(outside, 'output.json')));
});
