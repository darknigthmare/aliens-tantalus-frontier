// Validate enemy-042 production-event documents against the real V66 record
// implementation entirely in memory. This script never calls main("record"),
// never serializes state, and never edits queue/reference/state manifests.

import { readFile } from 'node:fs/promises';
import {
  ROOT,
  appendProductionEvent,
  buildEnemyBatchQueue,
  emptyState,
  getJobStatus,
} from '../../../../scripts/enemy-batch-production.mjs';

const profileId = 'enemy-042-combat-synthetic';
const referenceDocument = JSON.parse(await readFile(
  new URL('../../V66_WORKLOT_001_COMBAT_SYNTHETIC_REFERENCE.json', import.meta.url),
  'utf8',
));
const queue = buildEnemyBatchQueue({
  references: {
    schema: 1,
    profiles: {
      [profileId]: referenceDocument.profiles[profileId],
    },
  },
});
const job = queue.jobs.find((entry) => entry.profileId === profileId);
if (!job?.reference) throw new Error('Standalone reviewed reference did not resolve to a production job.');

let state = emptyState();
const results = [];
for (const clipId of ['idle', 'move', 'attack', 'death', 'reload']) {
  const path = `docs/references/v66-worklot-001-prompts/${profileId}/${clipId}.production-event.json`;
  const event = JSON.parse(await readFile(new URL(`../../v66-worklot-001-prompts/${profileId}/${clipId}.production-event.json`, import.meta.url), 'utf8'));
  state = await appendProductionEvent(queue, state, event, ROOT);
  const recorded = state.events.at(-1);
  results.push({
    clipId,
    inputPath: path,
    kind: recorded.kind,
    sourceSha256: recorded.sourceSha256,
    promptSha256: recorded.promptSha256,
    contractPromptSha256: recorded.contractPromptSha256,
    referenceLockSha256: recorded.referenceLockSha256,
    accepted: recorded.accepted,
    runtimeIntegrated: recorded.runtimeIntegrated,
    canonExact: recorded.canonExact,
  });
}

const status = await getJobStatus(job, state, ROOT);
if (status.status !== 'generated' || status.generatedClips !== 5 || status.issues.length !== 0) {
  throw new Error(`Standalone in-memory record validation failed: ${JSON.stringify(status)}`);
}
if (results.some((result) => result.accepted !== false || result.runtimeIntegrated !== false || result.canonExact !== false)) {
  throw new Error('A candidate event changed acceptance, runtime or canon-exact flags.');
}

console.log(JSON.stringify({
  schema: 1,
  validation: 'appendProductionEvent-in-memory-only',
  wroteGlobalState: false,
  jobStatus: status.status,
  generatedClips: status.generatedClips,
  requiredClips: status.requiredClips,
  issues: status.issues,
  events: results,
}, null, 2));
