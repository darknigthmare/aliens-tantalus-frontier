// Frozen coordination lots only. Never generates art, migrates batches or records events.
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, relative, isAbsolute, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ENEMIES } from '../src/content-core-v50.js';
import { ROOT, QUEUE_PATH, STATE_PATH, REFERENCES_PATH, GENERATION_EVENT_KINDS, scopedPath, buildEnemyBatchQueue, summarizeQueue } from './enemy-batch-production.mjs';

export const WORKLOT_SIZE = 202;
export const PREVIOUS_WORKLOTS_PATH = 'docs/references/V66_ENEMY_WORKLOTS_202.json';
export const WORKLOTS_PATH = 'docs/references/V66_ENEMY_WORKLOTS_202_R2.json';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const statuses = ['pending-reference', 'ready-generation', 'generated', 'review-rejected', 'accepted', 'integrated'];
const isGenerationEvent = (event) => GENERATION_EVENT_KINDS.includes(event.kind);
const fail = (message) => { throw new Error('V66 worklots: ' + message); };

function requireSize(size) {
  if (size !== WORKLOT_SIZE) fail('worklot size must be exactly 202 profiles; production batch IDs are unchanged');
}
function portablePath(root, path) {
  if (!text(path) || path.includes(':') || path.includes('\\') || path.split('/').includes('..')) fail('a safe repository-relative path is required');
  return scopedPath(root, path);
}
async function containedRealPath(root, path) {
  const actualRoot = await realpath(root), target = await realpath(path);
  const local = relative(actualRoot, target);
  if (local === '..' || local.startsWith('..' + sep) || isAbsolute(local)) fail('resolved path escapes the repository');
  return target;
}
async function readDocument(root, path) {
  const target = await containedRealPath(root, portablePath(root, path));
  const bytes = await readFile(target);
  let data;
  try { data = JSON.parse(bytes.toString('utf8')); } catch { fail('invalid JSON input: ' + path); }
  return { data, proof: { path, sha256: hash(bytes) } };
}

/** Read and validate the same roster, locks, events and latest source proofs as production check. */
export async function loadValidatedProduction({ root = ROOT, queuePath = QUEUE_PATH, statePath = STATE_PATH, referencesPath = REFERENCES_PATH, catalog = ENEMIES } = {}) {
  const [queueInput, stateInput, referencesInput] = await Promise.all([queuePath, statePath, referencesPath].map((path) => readDocument(root, path)));
  const queue = queueInput.data, state = stateInput.data, references = referencesInput.data;
  if (!record(queue) || queue.schema !== 1 || queue.release !== 'v66' || !Array.isArray(queue.jobs)) fail('invalid production queue');
  if (!record(references) || references.schema !== 1 || !record(references.profiles)) fail('invalid reference manifest');
  const catalogIds = new Set(catalog.map((profile) => profile.id));
  for (const id of Object.keys(references.profiles)) if (!catalogIds.has(id)) fail('unknown reference profile: ' + id);
  const ids = queue.jobs.map((job) => job?.profileId);
  if (ids.some((id) => !text(id)) || new Set(ids).size !== ids.length) fail('duplicate or invalid profile in queue');
  const expected = buildEnemyBatchQueue({ catalog, references });
  if (!isDeepStrictEqual(queue, expected)) fail('queue differs from the validated roster/reference contracts; no migration was performed');
  if (!record(state) || state.schema !== 1 || state.release !== 'v66' || !Array.isArray(state.events)) fail('invalid production state');
  const jobs = new Map(queue.jobs.map((job) => [job.profileId, job]));
  for (const event of state.events) {
    if (!record(event) || !jobs.has(event.profileId)) fail('unknown profile in production state: ' + event?.profileId);
    if (![...GENERATION_EVENT_KINDS, 'accepted', 'review-rejected', 'integrated'].includes(event.kind)) fail('invalid production event kind');
    const decisionNote = event.kind === 'generated-candidate-selected' ? event.selectionStatus : event.note;
    if (!text(event.actor) || !text(decisionNote)) fail('production decisions need an actor and note or selection status');
    const job = jobs.get(event.profileId);
    if (isGenerationEvent(event) && (!job.reference || !job.clips.some((clip) => clip.id === event.clipId))) fail('generated event has no reviewed reference or known clip: ' + event.profileId);
  }
  const summary = await summarizeQueue(queue, state, root);
  const issues = summary.jobs.filter((job) => job.issues?.length);
  if (issues.length) fail('input production evidence has issues: ' + JSON.stringify(issues));
  return { root, queue, state, references, summary, inputs: { queue: queueInput.proof, state: stateInput.proof, references: referencesInput.proof } };
}

const bindingFor = (job) => ({ profileId: job.profileId, batchId: job.batchId, clipIds: job.clips.map((clip) => clip.id), sourcePaths: job.clips.map((clip) => clip.sourcePath) });
function assertProductionSummary(production) {
  if (!record(production) || !Array.isArray(production.queue?.jobs) || !Array.isArray(production.summary?.jobs)) fail('validated production inputs are required');
  const jobs = production.queue.jobs, summary = production.summary.jobs;
  if (summary.length !== jobs.length || summary.some((status, index) => status.profileId !== jobs[index].profileId || !statuses.includes(status.status)
    || status.issues?.length || !Number.isInteger(status.generatedClips) || status.generatedClips < 0 || status.generatedClips > jobs[index].clips.length
    || status.requiredClips !== jobs[index].clips.length)) fail('production summary contains unknown IDs, input issues or invalid clip counts');
}
const membershipPayload = (manifest) => ({ worklotSize: manifest.worklotSize, rosterSha256: manifest.rosterSha256,
  excludedIntegratedProfileIds: manifest.excludedIntegratedProfileIds, excludedBaselineProfileIds: manifest.excludedBaselineProfileIds,
  worklots: manifest.worklots });

/** Freeze membership once, in existing queue order, excluding only currently verified integrated jobs. */
export function buildWorklotManifest(production, { size = WORKLOT_SIZE } = {}) {
  requireSize(size);
  assertProductionSummary(production);
  const current = new Map(production.summary.jobs.map((job) => [job.profileId, job]));
  const excluded = production.queue.jobs.filter((job) => current.get(job.profileId)?.status === 'integrated');
  const pending = production.queue.jobs.filter((job) => current.get(job.profileId)?.status !== 'integrated');
  const worklots = [];
  for (let offset = 0; offset < pending.length; offset += size) {
    const jobs = pending.slice(offset, offset + size);
    worklots.push({ id: `worklot-${String(worklots.length + 1).padStart(3, '0')}`, profiles: jobs.map(bindingFor), requiredBoards: jobs.reduce((sum, job) => sum + job.clips.length, 0) });
  }
  const manifest = { schema: 1, release: 'v66', kind: 'frozen-enemy-production-worklots', generatedBy: 'scripts/enemy-production-worklots-v66.mjs',
    worklotSize: size, membershipPolicy: 'frozen-at-explicit-initialization; never repartition after integration', automaticProduction: false,
    productionBatchIdsChanged: false, rosterSha256: production.queue.rosterSha256, initializationInputs: structuredClone(production.inputs),
    excludedIntegratedProfileIds: excluded.map((job) => job.profileId), excludedBaselineProfileIds: production.queue.baseline.map((job) => job.profileId), worklots };
  manifest.membershipSha256 = hash(JSON.stringify(membershipPayload(manifest)));
  return manifest;
}

export function validateWorklotManifest(manifest, production) {
  assertProductionSummary(production);
  if (!record(manifest) || manifest.schema !== 1 || manifest.release !== 'v66' || manifest.kind !== 'frozen-enemy-production-worklots') fail('invalid frozen worklot manifest');
  requireSize(manifest.worklotSize);
  if (manifest.automaticProduction !== false || manifest.productionBatchIdsChanged !== false) fail('worklots cannot claim automatic production or batch migration');
  if (manifest.rosterSha256 !== production.queue.rosterSha256) fail('roster changed; an explicit separately reviewed worklot plan is required');
  if (!record(manifest.initializationInputs) || ['queue', 'state', 'references'].some((key) => !record(manifest.initializationInputs[key]) || !text(manifest.initializationInputs[key].path) || !/^[a-f0-9]{64}$/.test(manifest.initializationInputs[key].sha256))) fail('initialization input hashes are missing');
  if (!Array.isArray(manifest.excludedIntegratedProfileIds) || !Array.isArray(manifest.excludedBaselineProfileIds) || !Array.isArray(manifest.worklots)) fail('frozen membership is incomplete');
  if (!isDeepStrictEqual(manifest.excludedBaselineProfileIds, production.queue.baseline.map((job) => job.profileId))) fail('legacy baseline membership changed');
  const jobs = new Map(production.queue.jobs.map((job) => [job.profileId, job]));
  const seen = new Set();
  for (const id of manifest.excludedIntegratedProfileIds) {
    if (!jobs.has(id) || seen.has(id)) fail('unknown or duplicate excluded profile: ' + id);
    seen.add(id);
  }
  const expectedOrder = production.queue.jobs.filter((job) => !seen.has(job.profileId)).map((job) => job.profileId);
  const flattened = [];
  for (const [index, lot] of manifest.worklots.entries()) {
    if (!record(lot) || lot.id !== `worklot-${String(index + 1).padStart(3, '0')}` || !Array.isArray(lot.profiles) || !lot.profiles.length || lot.profiles.length > WORKLOT_SIZE || (index < manifest.worklots.length - 1 && lot.profiles.length !== WORKLOT_SIZE)) fail('invalid frozen lot identity or 202-profile boundary');
    let boards = 0;
    for (const binding of lot.profiles) {
      if (!record(binding) || !jobs.has(binding.profileId) || seen.has(binding.profileId)) fail('unknown or duplicate worklot profile: ' + binding?.profileId);
      const job = jobs.get(binding.profileId);
      if (!isDeepStrictEqual(binding, bindingFor(job))) fail('original production batch, clips or source paths changed for ' + job.profileId);
      seen.add(job.profileId);
      flattened.push(job.profileId);
      boards += job.clips.length;
    }
    if (lot.requiredBoards !== boards) fail('frozen board contract changed for ' + lot.id);
  }
  if (!isDeepStrictEqual(flattened, expectedOrder) || seen.size !== jobs.size) fail('frozen membership omits or reorders known profiles');
  if (manifest.membershipSha256 !== hash(JSON.stringify(membershipPayload(manifest)))) fail('frozen membership checksum changed');
  return manifest;
}

function describeLot(lot, production) {
  const jobs = new Map(production.queue.jobs.map((job) => [job.profileId, job]));
  const current = new Map(production.summary.jobs.map((job) => [job.profileId, job]));
  const profiles = lot.profiles.map(({ profileId }) => {
    const job = jobs.get(profileId), status = current.get(profileId);
    const latest = new Map(production.state.events.filter((event) => event.profileId === profileId && isGenerationEvent(event)).map((event) => [event.clipId, event]));
    const generatedClipIds = job.clips.filter((clip) => latest.has(clip.id)).map((clip) => clip.id);
    if (generatedClipIds.length !== status.generatedClips) fail('verified clip count disagrees with latest events for ' + profileId);
    return { profileId, name: job.name, productionBatchId: job.batchId, status: status.status, referenceReviewed: job.reference?.status === 'reviewed',
      requiredClipIds: job.clips.map((clip) => clip.id), verifiedGeneratedClipIds: generatedClipIds,
      missingClipIds: job.clips.filter((clip) => !latest.has(clip.id)).map((clip) => clip.id) };
  });
  const idsWhere = (predicate) => profiles.filter(predicate).map((profile) => profile.profileId);
  const generatedBoards = profiles.reduce((sum, profile) => sum + profile.verifiedGeneratedClipIds.length, 0);
  return { id: lot.id, profileCount: profiles.length, productionBatchIds: [...new Set(profiles.map((profile) => profile.productionBatchId))],
    firstProfileId: profiles[0]?.profileId ?? null, lastProfileId: profiles.at(-1)?.profileId ?? null,
    requiredBoards: lot.requiredBoards, verifiedGeneratedBoards: generatedBoards, remainingBoards: lot.requiredBoards - generatedBoards,
    statusCounts: Object.fromEntries(statuses.map((status) => [status, profiles.filter((profile) => profile.status === status).length])),
    stages: {
      references: { reviewedProfiles: profiles.filter((profile) => profile.referenceReviewed).length, missingProfileIds: idsWhere((profile) => !profile.referenceReviewed) },
      sourceGeneration: { completeProfileIds: idsWhere((profile) => !profile.missingClipIds.length), incompleteProfileIds: idsWhere((profile) => profile.missingClipIds.length > 0) },
      normalization: { status: 'not-audited-by-worklot-summary', automaticallyInferredFromSources: false },
      visualAcceptance: { acceptedProfileIds: idsWhere((profile) => ['accepted', 'integrated'].includes(profile.status)), pendingProfileIds: idsWhere((profile) => !['accepted', 'integrated'].includes(profile.status)) },
      runtimeIntegration: { integratedProfileIds: idsWhere((profile) => profile.status === 'integrated'), notFinishedProfileIds: idsWhere((profile) => profile.status !== 'integrated') }
    }, profiles };
}

/** Refresh evidence/counts for fixed IDs; integrated members never move another lot's boundary. */
export function summarizeWorklots(manifest, production) {
  validateWorklotManifest(manifest, production);
  const worklots = manifest.worklots.map((lot) => describeLot(lot, production));
  const included = new Set(worklots.flatMap((lot) => lot.profiles.map((profile) => profile.profileId)));
  return { schema: 1, release: 'v66', readOnly: true, automaticProduction: false, apiCallsMade: 0, membershipFrozen: true, worklotSize: WORKLOT_SIZE,
    membershipSha256: manifest.membershipSha256, initializationInputs: manifest.initializationInputs, currentInputs: production.inputs,
    counts: { worklots: worklots.length, frozenProfiles: included.size, requiredBoards: worklots.reduce((sum, lot) => sum + lot.requiredBoards, 0),
      verifiedGeneratedBoards: worklots.reduce((sum, lot) => sum + lot.verifiedGeneratedBoards, 0), remainingBoards: worklots.reduce((sum, lot) => sum + lot.remainingBoards, 0),
      notFinishedProfiles: worklots.reduce((sum, lot) => sum + lot.stages.runtimeIntegration.notFinishedProfileIds.length, 0),
      excludedBaselineProfiles: manifest.excludedBaselineProfileIds.length, excludedInitiallyIntegratedProfiles: manifest.excludedIntegratedProfileIds.length },
    outsideFrozenScopeNotFinishedProfileIds: production.summary.jobs.filter((job) => !included.has(job.profileId) && job.status !== 'integrated').map((job) => job.profileId),
    note: 'Source counts use latest verified production events, not revisions, directory scans, V65 art or automatic visual acceptance.', worklots };
}

export async function initializeWorklots({ output, size = WORKLOT_SIZE, ...options } = {}) {
  requireSize(size);
  const root = options.root ?? ROOT;
  if (!text(output) || !output.startsWith('docs/references/') || !output.endsWith('.json')) fail('init requires explicit --output docs/references/<name>.json');
  const target = portablePath(root, output);
  const production = await loadValidatedProduction(options);
  const manifest = buildWorklotManifest(production, { size });
  let parent = dirname(target);
  while (true) {
    try { await containedRealPath(root, parent); break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; parent = dirname(parent); }
  }
  await mkdir(dirname(target), { recursive: true });
  await containedRealPath(root, dirname(target));
  // Exclusive creation: existing manifests and all existing evidence are immutable here.
  await writeFile(target, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return { output, manifest, summary: summarizeWorklots(manifest, production) };
}

export async function worklotStatus({ manifestPath = WORKLOTS_PATH, ...options } = {}) {
  const production = await loadValidatedProduction(options);
  let input;
  try { input = await readDocument(options.root ?? ROOT, manifestPath); }
  catch (error) { if (error.code === 'ENOENT') fail('no frozen manifest; use explicit init --output ' + WORKLOTS_PATH + ', or preview without writing'); throw error; }
  return { manifest: input.proof, ...summarizeWorklots(input.data, production) };
}

export async function main(args = process.argv.slice(2), { root = ROOT, catalog = ENEMIES, log = console.log } = {}) {
  args = [...args];
  const command = args[0] && !args[0].startsWith('--') ? args.shift() : 'status';
  if (!['status', 'preview', 'init'].includes(command)) fail('unknown command: ' + command);
  const names = { '--queue': 'queuePath', '--state': 'statePath', '--references': 'referencesPath', '--manifest': 'manifestPath', '--output': 'output', '--size': 'size' };
  const options = { root, catalog }, seen = new Set();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1];
    if (!names[flag] || seen.has(flag) || !value || value.startsWith('--')) fail('invalid, duplicate or missing option: ' + flag);
    seen.add(flag);
    options[names[flag]] = flag === '--size' ? Number(value) : value;
  }
  requireSize(options.size ?? WORKLOT_SIZE);
  if (command !== 'init' && options.output !== undefined) fail('--output is only allowed with explicit init');
  if (command !== 'status' && options.manifestPath !== undefined) fail('--manifest is only a frozen status input');
  let result;
  if (command === 'init') {
    const initialized = await initializeWorklots(options);
    result = { ...initialized.summary, readOnly: false, writtenManifest: initialized.output, existingInputsModified: false };
  } else if (command === 'preview') {
    const production = await loadValidatedProduction(options);
    result = { ...summarizeWorklots(buildWorklotManifest(production, options), production), membershipFrozen: false, persisted: false, note: 'Read-only initial proposal, not a frozen plan; only explicit init persists membership.' };
  } else result = await worklotStatus(options);
  log(JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
