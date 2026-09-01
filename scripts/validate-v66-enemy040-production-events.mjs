import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { appendProductionEvent, emptyState, ROOT, scopedPath } from './enemy-batch-production.mjs';

const profileId = 'enemy-040-pathogen-mimic';
const base = 'docs/references/v66-worklot-001-prompts/enemy-040-pathogen-mimic';
const qa = 'docs/references/v66-worklot-001-pathogen-mimic-qa';
const queue = JSON.parse(await readFile(scopedPath(ROOT, 'docs/references/V66_ENEMY_BATCH_QUEUE.json'), 'utf8'));
const job = queue.jobs.find((entry) => entry.profileId === profileId);
if (!job) throw new Error('Profile 040 missing from queue.');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
let shadow = emptyState();
for (const clip of job.clips) {
  const promptPath = `${base}/${clip.id}.txt`;
  const prompt = await readFile(scopedPath(ROOT, promptPath), 'utf8');
  const source = await readFile(scopedPath(ROOT, clip.sourcePath));
  const proofPath = `${qa}/recompose-proof-${clip.id}.json`;
  const proof = await readFile(scopedPath(ROOT, proofPath));
  const event = {
    schema: 1, kind: 'generated', profileId, clipId: clip.id,
    provider: 'OpenAI ImageGen', generationId: `sha256:${hash(source)}`,
    providerGenerationIdReturned: false,
    generationIdProvenance: 'The provider exposed no durable generation ID; the immutable active OpenAI ImageGen PNG SHA-256 identifies the persisted capture.',
    actor: 'Codex /root/generate_profile_040',
    actualPromptPath: promptPath, actualPromptFileSha256: hash(prompt), promptSha256: hash(prompt),
    sourcePath: clip.sourcePath, savedSourcePath: clip.sourcePath, sourceSha256: hash(source), sourceBytes: source.byteLength,
    contractPromptSha256: clip.promptSha256, queuePromptSha256: clip.promptSha256, referenceLockSha256: job.referenceLockSha256,
    rawCapture: { path: clip.sourcePath, sha256: hash(source), bytes: source.byteLength, pixelEdits: 0 },
    safeRecomposeProof: { path: proofPath, sha256: hash(proof), bytes: proof.byteLength, activeMasterChanged: false },
    accepted: false, runtimeIntegrated: false, canonExact: false,
    note: 'Profile-local generated candidate with raw capture and lossless safe-ownership proof; no state write, acceptance or runtime integration.'
  };
  shadow = await appendProductionEvent(queue, shadow, event, ROOT);
  const recorded = shadow.events.at(-1);
  await writeFile(scopedPath(ROOT, `${base}/${clip.id}.production-event.json`), `${JSON.stringify(recorded, null, 2)}\n`);
}
console.log(JSON.stringify({ profileId, validatedEvents: shadow.events.length, stateWrites: 0, accepted: false, runtimeIntegrated: false, canonExact: false }, null, 2));
