# V66 Worklot 001 — Combat Synthetic production-event audit

Five standalone `generated-candidate-selected` documents now translate the combined 042 generation receipt into one valid V66 production event input per clip:

- `docs/references/v66-worklot-001-prompts/enemy-042-combat-synthetic/idle.production-event.json`
- `docs/references/v66-worklot-001-prompts/enemy-042-combat-synthetic/move.production-event.json`
- `docs/references/v66-worklot-001-prompts/enemy-042-combat-synthetic/attack.production-event.json`
- `docs/references/v66-worklot-001-prompts/enemy-042-combat-synthetic/death.production-event.json`
- `docs/references/v66-worklot-001-prompts/enemy-042-combat-synthetic/reload.production-event.json`

Each document preserves the selected prompt file/hash, active source path/hash/byte count, C2PA instance, clip-local iteration, persistence method, source QA and the combined receipt path/hash. Every event explicitly sets `accepted=false`, `runtimeIntegrated=false` and `canonExact=false`. Because ImageGen returned no durable provider generation ID, `generationId` uses the immutable active PNG SHA-256 and `generationIdProvenance` states that limitation.

The documents were validated with the repository's real `appendProductionEvent` implementation from `scripts/enemy-batch-production.mjs`. `validate-production-events-standalone.mjs` builds an in-memory queue from the standalone reviewed 042 reference, appends all five events to an in-memory empty state, and calls `getJobStatus`. Result: `generated`, 5/5 clips, zero issues. The validator does not invoke CLI `record`, does not call its JSON serializer and does not write any global queue, state or reference file.

The input events intentionally omit `contractPromptSha256`, `referenceLockSha256`, `actualPromptText` and `at`: the real record path resolves those from the active reviewed queue/reference and prompt document at append time. In the standalone validation, the resolved reference lock was `43a833414ebc5724a4c0343a8ed43c0ccd8aaa90bbe6b1ae934ee3a567b03324`. The per-clip resolved contract prompt hashes are retained in `production-event-validation.json`.

These files are valid record inputs only once the standalone reviewed reference is available to the queue supplied to `record`. This audit does not claim that the global queue already contains that reference, does not register the events into global state and does not infer art acceptance or runtime integration from the generated status.
