// Deterministic assembly of independently reviewed post-generation scale fragments.
// Every incoming profile is validated against its current PNGs, ordered normalized
// source contract, measurements and evidence before the shared review is written.
// A same-path/same-size active replacement leaves old metadata untouched and is
// reported as requiring renormalization. This merge never accepts art.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ROOT, scopedPath } from './enemy-batch-production.mjs';
import { resolvePostGenerationScaleReviewMergeCandidate } from './enemy-batch-scale-review.mjs';

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonicalBytes = (document) => Buffer.from(JSON.stringify(document, null, 2) + '\n', 'utf8');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readJsonOr(path, fallback) {
  try { return await readJson(path); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

export function assembleScaleReviewDocument(batch, baseDocument, fragments, jobs) {
  if (!/^batch-[0-9]{3}$/.test(batch || '') || batch === 'batch-000') throw new Error('Invalid scale-review batch.');
  if (!record(baseDocument) || baseDocument.schema !== 1 || baseDocument.batchId !== batch
    || baseDocument.coordinates !== 'nominal-source-cell' || !record(baseDocument.profiles)) {
    throw new Error('Existing scale-review document has the wrong schema or scope.');
  }
  if (!Array.isArray(fragments) || !fragments.length) throw new Error('At least one scale-review fragment is required.');
  const incoming = new Set();
  const profiles = { ...baseDocument.profiles };
  for (const fragment of fragments) {
    if (!record(fragment) || fragment.schema !== 1 || fragment.batchId !== batch
      || fragment.coordinates !== 'nominal-source-cell' || !record(fragment.profiles)) {
      throw new Error('Wrong scale-review fragment scope.');
    }
    const entries = Object.entries(fragment.profiles);
    if (!entries.length) throw new Error('Scale-review fragment has no profiles.');
    for (const [profileId, entry] of entries) {
      if (incoming.has(profileId)) throw new Error('Duplicate profile in incoming scale-review fragments: ' + profileId);
      if (!jobs.has(profileId)) throw new Error('Unknown profile in scale-review fragment: ' + profileId);
      incoming.add(profileId);
      profiles[profileId] = entry;
    }
  }
  const sortedProfiles = Object.fromEntries(Object.entries(profiles).sort(([left], [right]) => (
    left < right ? -1 : left > right ? 1 : 0
  )));
  return { document: { ...baseDocument, profiles: sortedProfiles }, incoming: [...incoming].sort() };
}

export async function mergeScaleReviewFragments({
  batch,
  fragmentPaths,
  root = ROOT,
  queuePath = 'docs/references/V66_ENEMY_BATCH_QUEUE.json',
} = {}) {
  if (!Array.isArray(fragmentPaths) || !fragmentPaths.length) throw new Error('Usage: merge-v66-scale-reviews.mjs batch-NNN fragment.json ...');
  const queue = await readJson(scopedPath(root, queuePath));
  const jobs = new Map((queue.jobs || []).filter((job) => job.batchId === batch).map((job) => [job.profileId, job]));
  if (!jobs.size) throw new Error('Unknown scale-review batch: ' + batch);
  const targetPath = `docs/references/V66_BATCH_${batch.slice(-3)}_SCALE_REVIEW.json`;
  const target = scopedPath(root, targetPath);
  const base = await readJsonOr(target, { schema: 1, batchId: batch, coordinates: 'nominal-source-cell', profiles: {} });
  const fragments = await Promise.all(fragmentPaths.map((path) => readJson(scopedPath(root, path))));
  const beforeProfiles = { ...base.profiles };
  const { document, incoming } = assembleScaleReviewDocument(batch, base, fragments, jobs);
  const proofs = [];
  for (const profileId of incoming) {
    const job = jobs.get(profileId);
    const metadata = await readJson(scopedPath(root, job.metadataPath));
    const proof = await resolvePostGenerationScaleReviewMergeCandidate(job, metadata.sources, document, root, scopedPath);
    if (!proof || proof.profileId !== profileId) throw new Error('Scale-review candidate did not resolve for ' + profileId);
    proofs.push(proof);
  }
  for (const [profileId, entry] of Object.entries(beforeProfiles)) {
    if (!incoming.includes(profileId) && !isDeepStrictEqual(document.profiles[profileId], entry)) {
      throw new Error('Scale-review merge changed an unrelated profile: ' + profileId);
    }
  }
  const bytes = canonicalBytes(document);
  await writeFile(target, bytes);
  const staleNormalizationSources = proofs
    .filter((proof) => proof.staleNormalizedSourceClips?.length)
    .map((proof) => ({ profileId: proof.profileId, clips: proof.staleNormalizedSourceClips }));
  return {
    path: targetPath,
    sha256: hash(bytes),
    mergedProfiles: incoming,
    preservedProfiles: Object.keys(beforeProfiles).filter((profileId) => !incoming.includes(profileId)).sort(),
    measurementCount: proofs.reduce((count, proof) => count + proof.measurementCount, 0),
    staleNormalizationSources,
    renormalizationRequiredProfiles: staleNormalizationSources.map(({ profileId }) => profileId),
    acceptedAutomatically: 0,
  };
}

export async function main(args = process.argv.slice(2)) {
  const [batch, ...fragmentPaths] = args;
  if (!/^batch-[0-9]{3}$/.test(batch || '') || !fragmentPaths.length) {
    throw new Error('Usage: merge-v66-scale-reviews.mjs batch-NNN fragment.json ...');
  }
  console.log(JSON.stringify(await mergeScaleReviewFragments({ batch, fragmentPaths }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
