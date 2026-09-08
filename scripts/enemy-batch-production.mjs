import { readFile, writeFile, mkdir, access, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENEMIES } from '../src/content-core-v50.js';
import { validatePostGenerationScaleReview } from './enemy-batch-scale-review.mjs';
import { BASELINE_PROFILE_ID, BATCH_SIZE, FIRST_BATCH_IDS, SOURCE_GRID, animationContractFor, contentHash, makeGenerationPrompt, normalizeEnemyIdentity, reviewedReference } from './enemy-batch-contracts.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const QUEUE_PATH = 'docs/references/V66_ENEMY_BATCH_QUEUE.json';
export const STATE_PATH = 'docs/references/V66_ENEMY_BATCH_STATE.json';
export const REFERENCES_PATH = 'docs/references/V66_ENEMY_BATCH_REFERENCES.json';
export const REVIEW_CHECKS = Object.freeze(['identity', 'anatomy', 'direction', 'scale', 'clipSemantics', 'continuity', 'alpha', 'cellBounds']);
export const RECOVERED_GENERATION_EVENT_KIND = 'generated-recovered-and-source-repaired';
export const GENERATION_EVENT_KINDS = Object.freeze(['generated', 'generated-and-source-repaired', RECOVERED_GENERATION_EVENT_KIND, 'generated-candidate-selected']);
const pad = (value) => String(value).padStart(3, '0');
const fileHash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const fileExists = async (path) => { try { await access(path); return true; } catch { return false; } };
const isGenerationEvent = (event) => GENERATION_EVENT_KINDS.includes(event.kind);
export function scopedPath(root, path) {
  if (typeof path !== 'string' || !path.trim() || isAbsolute(path) || path.includes('\\')) throw new Error(`Expected a repository-relative path: ${path}`);
  const target = resolve(root, path.replace(/^\//, ''));
  const local = relative(root, target);
  if (local.startsWith('..') || isAbsolute(local)) throw new Error(`Path escapes repository: ${path}`);
  return target;
}
async function loadJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code === 'ENOENT' && fallback !== undefined) return fallback; throw error; }
}
async function saveJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.pending-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  await rename(temporaryPath, path);
}

export function buildEnemyBatchQueue({ catalog = ENEMIES, references = { profiles: {} } } = {}) {
  const profiles = catalog.map(normalizeEnemyIdentity);
  if (new Set(profiles.map((profile) => profile.profileId)).size !== profiles.length) throw new Error('Duplicate enemy profile in production queue.');
  const ids = new Set(profiles.map((profile) => profile.profileId));
  if ([BASELINE_PROFILE_ID, ...FIRST_BATCH_IDS].some((id) => !ids.has(id))) throw new Error('Initial production roster is incomplete.');
  const priority = new Map(FIRST_BATCH_IDS.map((id, index) => [id, index]));
  const pending = profiles.filter((profile) => profile.profileId !== BASELINE_PROFILE_ID).sort((a, b) => (priority.get(a.profileId) ?? 999) - (priority.get(b.profileId) ?? 999) || a.profileId.localeCompare(b.profileId, 'en'));
  const jobs = pending.map((profile, index) => {
    // The accepted five-profile pilot is never repartitioned or renumbered.
    const batchId = `batch-${pad(index < FIRST_BATCH_IDS.length ? 1 : 2 + Math.floor((index - FIRST_BATCH_IDS.length) / BATCH_SIZE))}`;
    const reference = reviewedReference(references.profiles?.[profile.profileId]);
    const contract = animationContractFor(profile);
    if (reference && Object.keys(reference.sourceScaleByClip).some((id) => !contract.some((clip) => clip.id === id))) throw new Error(`Unknown calibrated clip for ${profile.profileId}.`);
    const base = `assets/openai/sprites/frames/v66/${batchId}/${profile.profileId}`;
    const clips = contract.map((spec, ordinal) => ({
      ...spec, frames: Array.from({ length: 8 }, (_, offset) => ordinal * 8 + offset),
      sourcePath: `${base}/${spec.id}.png`,
      normalizedPath: `assets/openai/sprites/normalized/enemy-clips-v66/${profile.profileId}/${spec.id}.webp`,
      previewPath: `assets/openai/sprites/previews/v66/${profile.profileId}/${spec.id}.gif`,
      prompt: makeGenerationPrompt(profile, spec, reference),
      promptSha256: contentHash(makeGenerationPrompt(profile, spec, reference)),
    }));
    return { ...profile, batchId, ordinal: index + 1, initialStatus: reference ? 'ready-generation' : 'pending-reference', reference,
      referenceLockSha256: reference ? contentHash(reference) : null, generationProvider: 'OpenAI ImageGen', canonExact: false,
      sourceGrid: SOURCE_GRID, grid: { columns: 4, rows: clips.length * 2, cellWidth: 256, cellHeight: 256, guard: 16 },
      // The aquatic051 root needs guarded space below its ventral datum.
      // All historical jobs retain their original feet pivot unchanged.
      pivot: { x: 128, y: profile.profileId === 'enemy-051-ceto-reef-predator' ? 192 : 240 }, sourceFacing: 'right', clips,
      normalizedPath: `assets/openai/sprites/normalized/enemy-profiles-v66/${profile.profileId}.webp`,
      metadataPath: `assets/openai/sprites/metadata/v66/${profile.profileId}.json`,
      previewPath: `assets/openai/sprites/previews/v66/${profile.profileId}/all.gif`,
    };
  });
  const batches = [];
  for (const job of jobs) {
    if (batches.at(-1)?.id !== job.batchId) batches.push({ id: job.batchId, profileIds: [], requiredBoards: 0 });
    const batch = batches.at(-1);
    batch.profileIds.push(job.profileId);
    batch.requiredBoards += job.clips.length;
  }
  return { schema: 1, release: 'v66', generatedBy: 'scripts/enemy-batch-production.mjs', rosterSha256: contentHash(profiles),
    totalProfiles: profiles.length, archetypeCount: new Set(profiles.map((profile) => profile.archetype)).size,
    batchSize: BATCH_SIZE, productionJobCount: jobs.length, batchCount: batches.length,
    requiredBoards: jobs.reduce((total, job) => total + job.clips.length, 0),
    baseline: [{ profileId: BASELINE_PROFILE_ID, status: 'integrated-baseline-v65', release: 'v65', countedAsNewV66: false,
      path: 'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp' }],
    fidelityPolicy: 'Reference-locked adaptation; never infer 1:1 fidelity or acceptance from file existence or distinct hashes.',
    batches, jobs };
}

export function emptyState() { return { schema: 1, release: 'v66', events: [] }; }

function productionLocations(job) {
  return { batchId: job.batchId, ordinal: job.ordinal, normalizedPath: job.normalizedPath,
    metadataPath: job.metadataPath, previewPath: job.previewPath,
    clips: job.clips.map(({ id, sourcePath, normalizedPath, previewPath }) => ({ id, sourcePath, normalizedPath, previewPath })) };
}

async function assertSafeBatchMigration(previous, queue, state, root) {
  if (state.schema !== 1 || !Array.isArray(state.events)) throw new Error('Invalid production state; queue migration refused.');
  if (!previous && state.events.length) throw new Error('Existing production state has no previous queue; restore its manifest before migration.');
  const nextById = new Map(queue.jobs.map((job) => [job.profileId, job]));
  const previousById = new Map((previous?.jobs || []).map((job) => [job.profileId, job]));
  const recorded = new Set(state.events.map((event) => event.profileId));
  for (const profileId of recorded) {
    if (!nextById.has(profileId) || !previousById.has(profileId)) throw new Error(`Unknown profile in existing production state: ${profileId}`);
  }
  for (const job of previousById.values()) {
    const next = nextById.get(job.profileId);
    if (next && JSON.stringify(productionLocations(job)) === JSON.stringify(productionLocations(next))) continue;
    if (recorded.has(job.profileId)) throw new Error(`Refusing to relocate existing production evidence for ${job.profileId}; preserve its original batch and source paths.`);
    // Even an as-yet unrecorded source must not become orphaned by a regrouping.
    for (const path of [job.normalizedPath, job.metadataPath, ...job.clips.map((clip) => clip.sourcePath)]) {
      if (await fileExists(scopedPath(root, path))) throw new Error(`Refusing to relocate existing production files for ${job.profileId}: ${path}`);
    }
  }
}

export async function initializeEnemyBatchQueue({ root = ROOT, catalog = ENEMIES, manifestPath = QUEUE_PATH, statePath = STATE_PATH, referencesPath = REFERENCES_PATH } = {}) {
  const manifest = scopedPath(root, manifestPath);
  const stateFile = scopedPath(root, statePath);
  const references = await loadJson(scopedPath(root, referencesPath), { schema: 1, profiles: {} });
  const previous = await loadJson(manifest, null);
  const stateExisted = await fileExists(stateFile);
  const state = await loadJson(stateFile, emptyState());
  const queue = buildEnemyBatchQueue({ catalog, references });
  await assertSafeBatchMigration(previous, queue, state, root);
  await saveJson(manifest, queue);
  // Existing history is not serialized again: preserve its bytes and every proof.
  if (!stateExisted) await saveJson(stateFile, state);
  return queue;
}

function eventsFor(state, profileId) { return state.events.filter((event) => event.profileId === profileId); }
function requireActor(event) {
  const decisionNote = event.kind === 'generated-candidate-selected' ? event.selectionStatus : event.note;
  if (!String(event.actor || '').trim() || !String(decisionNote || '').trim()) throw new Error('Every production decision requires an actor and a meaningful note or selection status.');
}
async function validateOptionalFileHash(event, pathKey, hashKey, root, label) {
  if (event[hashKey] === undefined) return;
  if (!String(event[pathKey] || '').trim()) throw new Error(`${label} SHA-256 requires its repository-relative path.`);
  if (!/^[a-f0-9]{64}$/.test(event[hashKey]) || event[hashKey] !== await fileHash(scopedPath(root, event[pathKey]))) throw new Error(`${label} file changed or its SHA-256 is invalid.`);
}
async function validateRepairedGenerationEvent(event, root) {
  if (!Array.isArray(event.sourceRepairs) || !event.sourceRepairs.length) throw new Error('A repaired generated clip needs non-empty sourceRepairs provenance.');
  if (event.sourceRepairs.some((repair) => !repair || typeof repair !== 'object' || Array.isArray(repair) || !String(repair.kind || '').trim() || !String(repair.result || '').trim())) throw new Error('Every source repair needs a documented kind and result.');
  const hasRepairPromptPath = event.repairPromptPath !== undefined;
  const hasRepairPromptHash = event.repairPromptFileSha256 !== undefined;
  if (hasRepairPromptPath !== hasRepairPromptHash) throw new Error('Repair prompt provenance requires both path and SHA-256 when documented.');
  await validateOptionalFileHash(event, 'repairPromptPath', 'repairPromptFileSha256', root, 'Repair prompt');
  const repairFilePairs = [
    ['inputPath', 'inputSha256', 'Repair input'],
    ['outputPath', 'outputSha256', 'Repair output'],
    ['receiptPath', 'receiptSha256', 'Repair receipt'],
    ['path', 'sha256', 'Repair file']
  ];
  for (const [index, repair] of event.sourceRepairs.entries()) {
    for (const [pathKey, hashKey, label] of repairFilePairs) {
      const hasPath = repair[pathKey] !== undefined;
      const hasHash = repair[hashKey] !== undefined;
      if (hasPath !== hasHash) throw new Error(`Source repair ${index + 1} requires both ${pathKey} and ${hashKey} when either is documented.`);
      if (hasPath) await validateOptionalFileHash(repair, pathKey, hashKey, root, `${label} for source repair ${index + 1}`);
    }
  }
}
async function validateRecoveredGenerationEvent(event, spec, root) {
  if (event.actualGenerationPromptAvailable !== false) throw new Error('Recovered generation must explicitly declare the actual ImageGen prompt unavailable.');
  if (event.actualPromptText != null || event.actualPromptPath != null || event.actualPromptSha256 != null || event.promptSha256 != null || event.usedQueuePrompt === true) {
    throw new Error('Recovered generation cannot substitute queue text or a guessed hash for the unavailable actual ImageGen prompt.');
  }
  if (!String(event.actualPromptUnavailableReason || '').trim() || !String(event.promptProvenanceNote || '').trim()) {
    throw new Error('Recovered generation needs an explicit prompt-unavailability reason and provenance note.');
  }
  if (!String(event.currentQueuePromptSnapshotPath || '').trim() || event.currentQueuePromptFileBytesSha256 === undefined) {
    throw new Error('Recovered generation needs a byte-hashed current queue prompt snapshot kept separate from the unavailable actual prompt.');
  }
  await validateOptionalFileHash(event, 'currentQueuePromptSnapshotPath', 'currentQueuePromptFileBytesSha256', root, 'Current queue prompt snapshot');
  const queuePromptText = await readFile(scopedPath(root, event.currentQueuePromptSnapshotPath), 'utf8');
  if (queuePromptText !== spec.prompt || event.computedJsonStringifyPromptSha256 !== contentHash(queuePromptText)) {
    throw new Error('Recovered generation queue snapshot differs from the current clip contract.');
  }
  if (!event.rawCapture || typeof event.rawCapture !== 'object' || Array.isArray(event.rawCapture)) throw new Error('Recovered generation needs immutable raw-capture provenance.');
  await validateOptionalFileHash(event.rawCapture, 'path', 'sha256', root, 'Recovered raw capture');
  const raw = await readFile(scopedPath(root, event.rawCapture.path));
  if (!Number.isInteger(event.rawCapture.bytes) || event.rawCapture.bytes !== raw.byteLength || event.rawCapture.pixelEdits !== 0) {
    throw new Error('Recovered raw capture byte count or zero-edit declaration is invalid.');
  }
  if (event.rawCapture.embeddedPromptMetadata !== false) throw new Error('Recovered raw capture must explicitly declare that no embedded prompt metadata was found.');
  if (event.providerGenerationIdReturned !== false || !String(event.generationIdProvenance || '').trim() || event.generationId !== `sha256:${event.rawCapture.sha256}`) {
    throw new Error('Recovered generation without a provider ID must use its immutable raw SHA-256 as the local generation identifier.');
  }
  if (!Array.isArray(event.sourceRepairs) || !event.sourceRepairs.some((repair) => repair.inputPath === event.rawCapture.path && repair.inputSha256 === event.rawCapture.sha256)) {
    throw new Error('Recovered generation repairs must bind the immutable raw capture as an input.');
  }
  if (event.referenceEvidencePath !== undefined || event.referenceEvidenceSha256 !== undefined) {
    if (event.referenceEvidencePath === undefined || event.referenceEvidenceSha256 === undefined) throw new Error('Recovered reference evidence requires both path and SHA-256.');
    await validateOptionalFileHash(event, 'referenceEvidencePath', 'referenceEvidenceSha256', root, 'Recovered reference evidence');
  }
  if (event.accepted !== false || event.runtimeIntegrated !== false || event.canonExact !== false) {
    throw new Error('Recovered generation must explicitly remain unaccepted, unintegrated and non-canon-exact.');
  }
}
async function validateSelectedCandidateEvent(event, root) {
  if (!Number.isInteger(event.iteration) || event.iteration < 1) throw new Error('A selected generated candidate needs a positive iteration number.');
  if (!String(event.selectionStatus || '').startsWith('selected-')) throw new Error('A selected generated candidate needs explicit selectionStatus provenance.');
  if (!String(event.promptDocumentPath || '').trim() || event.promptDocumentSha256 === undefined) throw new Error('Selected candidate prompt provenance requires both document path and SHA-256.');
  await validateOptionalFileHash(event, 'promptDocumentPath', 'promptDocumentSha256', root, 'Selected candidate prompt document');
  if (event.promptSha256 !== event.promptDocumentSha256) throw new Error('Selected candidate prompt SHA-256 differs from its documented prompt file.');
  if (event.actualPromptText !== await readFile(scopedPath(root, event.promptDocumentPath), 'utf8')) throw new Error('Selected candidate prompt text changed since generation.');
  if (event.providerGenerationIdReturned === false && !String(event.generationIdProvenance || '').trim()) throw new Error('Selected candidate needs generation ID provenance when the provider returned no ID.');
  if (!String(event.persistence || '').trim()) throw new Error('Selected candidate needs source persistence provenance.');
  if (event.accepted !== false || event.runtimeIntegrated !== false || event.canonExact !== false) throw new Error('Candidate selection must explicitly remain unaccepted, unintegrated and non-canon-exact.');
  const source = await readFile(scopedPath(root, event.sourcePath));
  if (!Number.isInteger(event.sourceBytes) || event.sourceBytes !== source.byteLength) throw new Error('Selected candidate source byte count does not match the active source.');
  if (event.inputImages !== undefined) {
    if (!Array.isArray(event.inputImages) || !event.inputImages.length) throw new Error('Selected candidate inputImages provenance must be a non-empty array when documented.');
    for (const input of event.inputImages) {
      if (!String(input?.role || '').trim() || !String(input?.path || '').trim() || input.sha256 === undefined) throw new Error('Every selected candidate input image needs role, path and SHA-256 provenance.');
      await validateOptionalFileHash(input, 'path', 'sha256', root, 'Selected candidate input image');
    }
  }
}
async function validateGeneratedEvent(job, event, root) {
  const spec = job.clips.find((clip) => clip.id === event.clipId);
  if (!spec || event.provider !== 'OpenAI ImageGen' || !String(event.generationId || '').trim()) throw new Error('A generated clip needs a known clip, actual OpenAI provider and generation ID.');
  if (event.contractPromptSha256 !== spec.promptSha256 || event.referenceLockSha256 !== job.referenceLockSha256) throw new Error('Generated clip uses a stale contract or reference lock.');
  if (event.queuePromptSha256 !== undefined && event.queuePromptSha256 !== spec.promptSha256) throw new Error('Documented queue prompt SHA-256 does not match the current clip contract.');
  if (event.kind === RECOVERED_GENERATION_EVENT_KIND) {
    await validateRecoveredGenerationEvent(event, spec, root);
  } else {
    let promptSha256Matches = event.kind === 'generated-candidate-selected'
      ? event.promptSha256 === event.promptDocumentSha256
      : event.promptSha256 === contentHash(event.actualPromptText);
    if (!promptSha256Matches && event.actualPromptPath) promptSha256Matches = event.promptSha256 === await fileHash(scopedPath(root, event.actualPromptPath));
    if (!String(event.actualPromptText || '').trim() || !promptSha256Matches) throw new Error('Actual ImageGen prompt provenance is missing or changed.');
    if (event.actualPromptPath && event.actualPromptText !== await readFile(scopedPath(root, event.actualPromptPath), 'utf8')) throw new Error('Actual prompt file changed since generation.');
    await validateOptionalFileHash(event, 'actualPromptPath', 'actualPromptFileSha256', root, 'Actual prompt');
  }
  if (event.savedSourcePath !== undefined && event.savedSourcePath !== spec.sourcePath) throw new Error('Documented saved source path is not the active clip source.');
  if (event.sourcePath !== spec.sourcePath || event.sourceSha256 !== await fileHash(scopedPath(root, spec.sourcePath))) throw new Error(`Generated source missing or changed: ${spec.sourcePath}`);
  if (['generated-and-source-repaired', RECOVERED_GENERATION_EVENT_KIND].includes(event.kind)) await validateRepairedGenerationEvent(event, root);
  if (event.kind === 'generated-candidate-selected') await validateSelectedCandidateEvent(event, root);
}
async function acceptedEvidence(job, event, root) {
  if (REVIEW_CHECKS.some((key) => event.review?.[key] !== true)) throw new Error('Acceptance requires explicit visual review of every identity and animation criterion.');
  if (event.canonExact === true) throw new Error('A visual review cannot certify generated pixels 1:1.');
  const metadataPath = scopedPath(root, job.metadataPath);
  const metadata = await loadJson(metadataPath);
  if (event.metadataSha256 !== await fileHash(metadataPath) || event.atlasSha256 !== await fileHash(scopedPath(root, job.normalizedPath))) throw new Error('Accepted atlas or normalization metadata changed.');
  if (metadata.profileId !== job.profileId || metadata.normalizationStatus !== 'validated' || metadata.normalizedSha256 !== event.atlasSha256 || metadata.validation?.findings?.length || !Array.isArray(metadata.sources) || metadata.sources.length !== job.clips.length) throw new Error('Atlas provenance or normalization is incomplete.');
  await validatePostGenerationScaleReview(job, metadata, root, scopedPath);
  const anchors = metadata.physicalAnchorReview;
  const frameCount = job.clips.length * 8;
  if (anchors?.status !== 'reviewed' || anchors.reviewedPoseCount !== frameCount
    || metadata.placements?.length !== frameCount
    || metadata.placements.some((pose) => pose.anchorStatus !== 'reviewed-physical-root')) {
    throw new Error('Acceptance requires every physical body root to be reviewed; bbox-centered candidates are not ready.');
  }
  if (!anchors.path || anchors.sha256 !== await fileHash(scopedPath(root, anchors.path))) throw new Error('Physical body-root evidence changed since normalization.');
  for (const spec of job.clips) {
    const source = metadata.sources.find((entry) => entry.clip === spec.id);
    if (source?.path?.replace(/^\//, '') !== spec.sourcePath || source.sha256 !== await fileHash(scopedPath(root, spec.sourcePath))) throw new Error(`Normalization provenance missing or stale for ${spec.id}.`);
  }
}

export async function getJobStatus(job, state, root = ROOT) {
  if (!job.reference) return { profileId: job.profileId, status: 'pending-reference', generatedClips: 0, requiredClips: job.clips.length };
  const events = eventsFor(state, job.profileId);
  const generated = new Map();
  const issues = [];
  const latestGeneration = new Map(events.filter(isGenerationEvent).map((event) => [event.clipId, event]));
  for (const event of latestGeneration.values()) {
    try { await validateGeneratedEvent(job, event, root); generated.set(event.clipId, event); } catch (error) { issues.push(error.message); }
  }
  const recoveredPromptGaps = [...generated.values()].filter((event) => event.kind === RECOVERED_GENERATION_EVENT_KIND).length;
  const base = { profileId: job.profileId, status: generated.size ? 'generated' : 'ready-generation', generatedClips: generated.size, recoveredPromptGaps, requiredClips: job.clips.length, issues };
  const lastDecision = events.filter((event) => ['review-rejected', 'accepted', 'integrated'].includes(event.kind)).at(-1);
  if (!lastDecision) return base;
  if (events.lastIndexOf(lastDecision) < Math.max(...[...latestGeneration.values()].map((event) => events.lastIndexOf(event)))) return base;
  if (lastDecision.kind === 'review-rejected') return { ...base, status: 'review-rejected', note: lastDecision.note };
  if (generated.size !== job.clips.length) return { ...base, issues: [...issues, 'Accepted decision invalidated: authored clip provenance is incomplete.'] };
  const accepted = lastDecision.kind === 'accepted' ? lastDecision : events.filter((event) => event.kind === 'accepted').at(-1);
  try {
    if (!accepted) throw new Error('Integration has no preceding acceptance.');
    if (recoveredPromptGaps) throw new Error('Acceptance requires exact actual ImageGen prompt provenance; recovered prompt gaps must be regenerated first.');
    await acceptedEvidence(job, accepted, root);
    if (lastDecision.kind === 'integrated') {
      for (const key of ['registry', 'test', 'log']) {
        const evidence = lastDecision.runtimeEvidence?.[key];
        if (!evidence?.path || evidence.sha256 !== await fileHash(scopedPath(root, evidence.path))) throw new Error(`Integration ${key} evidence changed or is missing.`);
      }
      if (lastDecision.runtimeEvidence?.result !== 'pass') throw new Error('Runtime verification has not passed.');
    }
    return { ...base, status: lastDecision.kind };
  } catch (error) { return { ...base, issues: [...issues, error.message] }; }
}

export async function appendProductionEvent(queue, state, source, root = ROOT) {
  if (state.schema !== 1 || !Array.isArray(state.events)) throw new Error('Unknown state schema.');
  const job = queue.jobs.find((entry) => entry.profileId === source.profileId);
  if (!job || !job.reference) throw new Error('A reviewed reference and a known production job are required.');
  requireActor(source);
  const event = { ...source, at: source.at || new Date().toISOString() };
  if (isGenerationEvent(event)) {
    const spec = job.clips.find((clip) => clip.id === event.clipId);
    if (!spec) throw new Error('Unknown animation clip.');
    if (event.kind === 'generated-and-source-repaired') {
      if (!String(event.actualPromptText || '').trim() && !String(event.actualPromptPath || '').trim()) throw new Error('A repaired generated clip requires actualPromptText or actualPromptPath provenance.');
      if (event.sourcePath === undefined && event.savedSourcePath === undefined) throw new Error('A repaired generated clip must document the active source path.');
      if (event.sourceSha256 === undefined) throw new Error('A repaired generated clip must document the active source SHA-256.');
    }
    if (event.kind === RECOVERED_GENERATION_EVENT_KIND) {
      if (event.actualGenerationPromptAvailable !== false) throw new Error('A recovered generated clip must explicitly declare its actual prompt unavailable.');
      if (event.sourcePath === undefined && event.savedSourcePath === undefined) throw new Error('A recovered generated clip must document the active source path.');
      if (event.sourceSha256 === undefined) throw new Error('A recovered generated clip must document the active source SHA-256.');
    }
    if (event.kind === RECOVERED_GENERATION_EVENT_KIND) {
      if (event.promptSha256 !== null && event.promptSha256 !== undefined) throw new Error('Recovered generation must keep promptSha256 null because the actual prompt is unavailable.');
    } else if (event.kind === 'generated-candidate-selected') {
      if (!String(event.promptDocumentPath || '').trim()) throw new Error('A selected generated candidate requires promptDocumentPath provenance.');
      if (event.sourcePath === undefined && event.savedSourcePath === undefined) throw new Error('A selected generated candidate must document the active source path.');
      if (event.sourceSha256 === undefined) throw new Error('A selected generated candidate must document the active source SHA-256.');
    }
    const sourceSha256 = await fileHash(scopedPath(root, spec.sourcePath));
    // A saved generation receipt must not be rebound to replacement pixels.
    // Older receipts without an explicit hash retain the original import path.
    if (event.sourcePath !== undefined && event.sourcePath !== spec.sourcePath) throw new Error('Supplied source path does not match the active clip source.');
    if (event.savedSourcePath !== undefined && event.savedSourcePath !== spec.sourcePath) throw new Error('Supplied saved source path does not match the active clip source.');
    if (event.sourceSha256 !== undefined && event.sourceSha256 !== sourceSha256) throw new Error('Supplied source SHA-256 does not match the current clip source.');
    if (event.contractPromptSha256 !== undefined && event.contractPromptSha256 !== spec.promptSha256) throw new Error('Supplied contract prompt SHA-256 is stale.');
    if (event.queuePromptSha256 !== undefined && event.queuePromptSha256 !== spec.promptSha256) throw new Error('Supplied queue prompt SHA-256 is stale.');
    if (event.referenceLockSha256 !== undefined && event.referenceLockSha256 !== job.referenceLockSha256) throw new Error('Supplied reference lock SHA-256 is stale.');
    event.sourcePath = spec.sourcePath;
    event.sourceSha256 = sourceSha256;
    event.contractPromptSha256 = spec.promptSha256;
    if (event.kind === 'generated-candidate-selected') {
      if (event.actualPromptPath !== undefined && event.actualPromptPath !== event.promptDocumentPath) throw new Error('Selected candidate actualPromptPath differs from promptDocumentPath.');
      const promptText = await readFile(scopedPath(root, event.promptDocumentPath), 'utf8');
      if (event.actualPromptText !== undefined && event.actualPromptText !== promptText) throw new Error('Supplied actual prompt text does not match the selected candidate prompt document.');
      event.actualPromptText = promptText;
    } else if (event.actualPromptPath) {
      const promptText = await readFile(scopedPath(root, event.actualPromptPath), 'utf8');
      if (event.actualPromptText !== undefined && event.actualPromptText !== promptText) throw new Error('Supplied actual prompt text does not match the prompt file.');
      event.actualPromptText = promptText;
    }
    if (event.kind !== RECOVERED_GENERATION_EVENT_KIND) {
      if (!event.actualPromptText && event.usedQueuePrompt === true) event.actualPromptText = spec.prompt;
      if (!String(event.actualPromptText || '').trim()) throw new Error('Record the actual ImageGen prompt, or explicitly attest usedQueuePrompt: true.');
      const promptSha256 = contentHash(event.actualPromptText);
      if (event.kind === 'generated-candidate-selected') {
        if (event.promptSha256 === undefined || event.promptSha256 !== event.promptDocumentSha256) throw new Error('Selected candidate prompt SHA-256 must retain its documented file hash.');
      } else {
        const suppliedPromptSha256 = event.promptSha256;
        const suppliedHashMatchesFile = event.actualPromptPath && suppliedPromptSha256 === await fileHash(scopedPath(root, event.actualPromptPath));
        if (suppliedPromptSha256 !== undefined && suppliedPromptSha256 !== promptSha256 && !suppliedHashMatchesFile) throw new Error('Supplied actual prompt SHA-256 does not match the recorded prompt or prompt file.');
        if (suppliedPromptSha256 === undefined) event.promptSha256 = promptSha256;
      }
    }
    event.referenceLockSha256 = job.referenceLockSha256;
    await validateGeneratedEvent(job, event, root);
  } else if (event.kind === 'accepted') {
    const status = await getJobStatus(job, state, root);
    if (status.generatedClips !== job.clips.length) throw new Error('Cannot accept a partial profile or files without generation provenance.');
    if (status.recoveredPromptGaps) throw new Error('Cannot accept recovered generation while exact actual ImageGen prompt provenance is unavailable.');
    event.metadataSha256 = await fileHash(scopedPath(root, job.metadataPath));
    event.atlasSha256 = await fileHash(scopedPath(root, job.normalizedPath));
    event.canonExact = false;
    await acceptedEvidence(job, event, root);
  } else if (event.kind === 'integrated') {
    const status = await getJobStatus(job, state, root);
    if (status.status !== 'accepted') throw new Error('Integration requires a currently accepted atlas.');
    if (event.runtimeEvidence?.result !== 'pass' || !String(event.runtimeEvidence?.command || '').trim()) throw new Error('Integration requires a passing runtime command and evidence.');
    for (const key of ['registry', 'test', 'log']) {
      const path = event.runtimeEvidence[key]?.path;
      event.runtimeEvidence[key] = { path, sha256: await fileHash(scopedPath(root, path)) };
    }
  } else if (event.kind !== 'review-rejected') throw new Error(`Unknown production transition: ${event.kind}`);
  return { ...state, events: [...state.events, event] };
}

export async function summarizeQueue(queue, state, root = ROOT) {
  const jobs = await Promise.all(queue.jobs.map((job) => getJobStatus(job, state, root)));
  const counts = Object.fromEntries(['pending-reference', 'ready-generation', 'generated', 'review-rejected', 'accepted', 'integrated'].map((status) => [status, jobs.filter((job) => job.status === status).length]));
  return { totalProfiles: queue.totalProfiles, baselineAlreadyIntegrated: queue.baseline.length, productionJobs: jobs.length, batchCount: queue.batchCount, requiredBoards: queue.requiredBoards, verifiedGeneratedBoards: jobs.reduce((sum, job) => sum + job.generatedClips, 0), recoveredPromptGapBoards: jobs.reduce((sum, job) => sum + (job.recoveredPromptGaps || 0), 0), counts, jobs };
}

function argument(args, name, fallback) { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; }
export async function main(args = process.argv.slice(2)) {
  const command = args[0] || 'status';
  const manifestPath = scopedPath(ROOT, argument(args, '--manifest', QUEUE_PATH));
  const statePath = scopedPath(ROOT, argument(args, '--state', STATE_PATH));
  const referencesPath = scopedPath(ROOT, argument(args, '--references', REFERENCES_PATH));
  if (command === 'init') {
    const queue = await initializeEnemyBatchQueue({ manifestPath: argument(args, '--manifest', QUEUE_PATH), statePath: argument(args, '--state', STATE_PATH), referencesPath: argument(args, '--references', REFERENCES_PATH) });
    console.log(JSON.stringify({ jobs: queue.productionJobCount, batches: queue.batchCount, requiredBoards: queue.requiredBoards, preservedExistingState: true }));
    return;
  }
  const queue = await loadJson(manifestPath);
  const state = await loadJson(statePath, emptyState());
  if (command === 'record') {
    const eventPath = scopedPath(ROOT, argument(args, '--event', ''));
    await saveJson(statePath, await appendProductionEvent(queue, state, await loadJson(eventPath)));
    console.log('Production event recorded; no status inferred from file existence.');
    return;
  }
  if (command === 'check') {
    const expected = buildEnemyBatchQueue({ references: await loadJson(referencesPath, { schema: 1, profiles: {} }) });
    if (JSON.stringify(queue) !== JSON.stringify(expected)) throw new Error('Queue differs from the current roster/reference locks. Run init; existing events are preserved.');
    if (state.schema !== 1 || !Array.isArray(state.events)) throw new Error('Invalid production state.');
    const reconstructed = emptyState();
    for (const event of state.events) {
      const known = queue.jobs.find((job) => job.profileId === event.profileId);
      if (!known) throw new Error(`Unknown profile in state: ${event.profileId}`);
      if (![...GENERATION_EVENT_KINDS, 'accepted', 'review-rejected', 'integrated'].includes(event.kind)) throw new Error(`Invalid event kind: ${event.kind}`);
      requireActor(event);
      reconstructed.events.push(event);
    }
    const summary = await summarizeQueue(queue, state);
    const stale = summary.jobs.filter((job) => job.issues?.length);
    if (stale.length) throw new Error(`Stale production evidence: ${JSON.stringify(stale)}`);
    console.log(JSON.stringify({ ...summary, jobs: undefined }, null, 2));
    return;
  }
  const summary = await summarizeQueue(queue, state);
  const batch = argument(args, '--batch', null);
  if (batch && !queue.batches.some((entry) => entry.id === batch)) throw new Error(`Unknown batch: ${batch}`);
  if (command === 'dry-run') {
    const selected = queue.jobs.filter((job) => !batch || job.batchId === batch);
    const statuses = new Map(summary.jobs.map((job) => [job.profileId, job]));
    console.log(JSON.stringify({ apiCallsMade: 0, mode: 'manual-openai-imagegen-only', jobs: selected.map((job) => ({ ...job, currentStatus: statuses.get(job.profileId).status })) }, null, 2));
    return;
  }
  if (command !== 'status') throw new Error(`Unknown command: ${command}`);
  console.log(JSON.stringify(batch ? { ...summary, jobs: summary.jobs.filter((status) => queue.jobs.find((job) => job.profileId === status.profileId).batchId === batch) } : { ...summary, jobs: args.includes('--all') ? summary.jobs : undefined }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
