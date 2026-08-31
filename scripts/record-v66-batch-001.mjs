import { readFile, writeFile } from 'node:fs/promises';
import { appendProductionEvent, QUEUE_PATH, STATE_PATH } from './enemy-batch-production.mjs';

// Import the twenty selected, already-completed built-in ImageGen calls.
// This command never generates art, spends credits, or accepts a visual review.
const rootDoc = 'docs/references/V66_OVOMORPH_CHESTBURSTER_IMAGEGEN.md';
const bipedDoc = 'docs/references/V66_DRONE_WARRIOR_IMAGEGEN.md';
const runnerDoc = 'docs/references/V66_RUNNER_IMAGEGEN.md';
const records = [
  ['enemy-001-ovomorph', 'sealed', rootDoc, 'Ovomorph — sealed', 'exec-84b7708f-93bc-4cc9-86c6-d9e53f670798'],
  ['enemy-001-ovomorph', 'opening', rootDoc, 'Ovomorph — opening', 'exec-00674e08-81e8-4a34-8f76-203031b5d273'],
  ['enemy-001-ovomorph', 'hatch', rootDoc, 'Ovomorph — hatch', 'exec-9b150fef-14f5-4576-96b5-d6b7a62f5884'],
  ['enemy-001-ovomorph', 'destroyed', rootDoc, 'Ovomorph — destroyed', 'exec-5d658161-dda5-4e8f-8d84-e7cb7cf68423'],
  ['enemy-003-chestburster', 'idle', rootDoc, 'Chestburster — idle', 'exec-89188495-f262-467c-9931-09702a1d6bc4'],
  ['enemy-003-chestburster', 'move', rootDoc, 'Chestburster — move', 'exec-460cc43f-47da-445f-be59-a65e645a3125'],
  ['enemy-003-chestburster', 'attack', rootDoc, 'Chestburster — attack', 'exec-d7986dd4-a14e-476f-ab00-47e6d99e210b'],
  ['enemy-003-chestburster', 'death', rootDoc, 'Chestburster — death', 'exec-823b4855-4cf3-42bd-a352-c47ba3903da5'],
  ['enemy-004-drone-big-chap', 'idle', bipedDoc, 'enemy-004-drone-big-chap — idle', 'exec-599cffe4-89c4-4731-910f-466ca878d8ae'],
  ['enemy-004-drone-big-chap', 'move', bipedDoc, 'enemy-004-drone-big-chap — move', 'exec-1ea1ff66-9d07-4d6d-a145-2d47a3a4e40f'],
  ['enemy-004-drone-big-chap', 'attack', bipedDoc, 'enemy-004-drone-big-chap — attack', 'exec-46c8659f-e8e2-46d6-a07d-779ae595e13e'],
  ['enemy-004-drone-big-chap', 'death', bipedDoc, 'enemy-004-drone-big-chap — death', 'exec-6dac5a62-f6a7-4578-bda8-208ede302df1'],
  ['enemy-005-warrior', 'idle', bipedDoc, 'enemy-005-warrior — idle', 'exec-0c85d913-97e8-4e9e-97cf-a45f825ae11a'],
  ['enemy-005-warrior', 'move', bipedDoc, 'enemy-005-warrior — move', 'exec-85ce674b-e668-4e4b-8cbc-68f65e22968e'],
  ['enemy-005-warrior', 'attack', bipedDoc, 'enemy-005-warrior — attack', 'exec-e080f21c-7047-487e-ac1c-658034e9d09d'],
  ['enemy-005-warrior', 'death', bipedDoc, 'enemy-005-warrior — death', 'exec-89587a61-428f-464e-91bb-9d003088c548'],
  ['enemy-006-runner', 'idle', runnerDoc, 'idle.png', 'exec-58f07dce-1bc2-48ae-b737-ca2bbe619c3c'],
  ['enemy-006-runner', 'move', runnerDoc, 'move.png', 'exec-47ed8a71-1972-4d89-9c06-b7c894b0035e'],
  ['enemy-006-runner', 'attack', runnerDoc, 'attack.png', 'exec-0b8b6a8a-845e-4679-9259-796426d63276'],
  ['enemy-006-runner', 'death', runnerDoc, 'death.png', 'exec-e6197a20-07e9-4357-8e3b-a2e9ca70df59'],
];
const queue = JSON.parse(await readFile(QUEUE_PATH, 'utf8'));
let state = JSON.parse(await readFile(STATE_PATH, 'utf8'));
let added = 0;
for (const [profileId, clipId, docPath, heading, generationId] of records) {
  const document = (await readFile(docPath, 'utf8')).replace(/\r\n/g, '\n');
  const sections = document.split(/^#{2,3} /m);
  const section = sections.find((value) => value.split('\n')[0] === heading);
  const prompt = section?.match(/```text\n([\s\S]*?)\n```/)?.[1];
  if (!prompt?.trim() || !document.includes(generationId)) throw new Error('Missing actual generation evidence: ' + profileId + '/' + clipId);
  const event = { kind: 'generated', profileId, clipId, provider: 'OpenAI ImageGen', generationId,
    actualPromptText: prompt, actor: 'Codex batch-001 source import',
    note: 'Actual completed built-in ImageGen call; selected source and prompt documented in ' + docPath };
  const candidate = await appendProductionEvent(queue, state, event);
  const next = candidate.events.at(-1);
  const previous = state.events.filter((entry) => entry.kind === 'generated' && entry.profileId === profileId && entry.clipId === clipId).at(-1);
  if (previous) {
    for (const key of ['generationId', 'sourceSha256', 'promptSha256', 'referenceLockSha256', 'contractPromptSha256']) {
      if (previous[key] !== next[key]) throw new Error('Existing generation evidence changed: ' + profileId + '/' + clipId + '/' + key);
    }
    continue;
  }
  state = candidate;
  added += 1;
}
await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
console.log(JSON.stringify({ importedGeneratedBoards: added, knownCompletedCalls: records.length, acceptedByThisCommand: 0, apiCallsMade: 0 }));
