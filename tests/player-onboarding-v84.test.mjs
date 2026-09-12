import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_NPC_ROSTER } from '../src/hub-v52-runtime.js';
import {
  PLAYER_ONBOARDING_SCHEMA_V84,
  ONBOARDING_DIALOGUES_V84,
  validatePlayerIdentityV84,
  createPlayerOnboardingV84,
  normalizePlayerOnboardingV84,
  advancePlayerOnboardingV84,
  getPlayerOnboardingObjectiveV84
} from '../src/player-onboarding-v84.js';

const candidate = (patch = {}) => ({ name: 'Alex Moreau', callsign: 'Echo-9', ...patch });
const fresh = () => createPlayerOnboardingV84(candidate());
const sequence = [
  'wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 },
  'medical-complete', { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete'
];
const toStep = (step) => sequence.slice(0, step).reduce((state, event) => advancePlayerOnboardingV84(state, event).state, fresh());
const deepFreeze = (value) => {
  Object.values(value).filter((entry) => entry && typeof entry === 'object').forEach(deepFreeze);
  return Object.freeze(value);
};

test('identity is fixed to the player, with no invented attributes, equipment or NPC overwrite', () => {
  const input = candidate({ id: 'crew-01-mara-vega', schema: 1, canonStatus: 'official', role: 'Commander', health: 900, inventory: ['free-rifle'] });
  const result = validatePlayerIdentityV84(input);
  assert.deepEqual(result, { ok: true, identity: {
    id: 'player-echo9', schema: 84, name: 'Alex Moreau', callsign: 'ECHO-9', canonStatus: 'project-fiction-not-franchise-canon'
  }, errors: {} });
  assert.equal(input.id, 'crew-01-mara-vega');
  assert.deepEqual(validatePlayerIdentityV84(result.identity), result);
});

test('Unicode names are normalized without losing accents or counting astral letters twice', () => {
  for (const name of ['Élodie Ng', '李 明', 'नवीन', '𐐀𐐁', "D'Arcy 2", 'Anne-Marie']) {
    assert.equal(validatePlayerIdentityV84(candidate({ name })).ok, true, name);
  }
  const normalized = validatePlayerIdentityV84(candidate({ name: '  E\u0301lodie   D’Arcy  ', callsign: '  fox-12  ' }));
  assert.equal(normalized.identity.name, "Élodie D'Arcy");
  assert.equal(normalized.identity.callsign, 'FOX-12');
  assert.equal(validatePlayerIdentityV84(candidate({ name: '𐐀'.repeat(40) })).ok, true);
  assert.equal(validatePlayerIdentityV84(candidate({ name: '𐐀'.repeat(41) })).ok, false);
});

test('name and callsign length boundaries are inclusive and errors are field-specific', () => {
  for (const name of ['Ab', 'A'.repeat(40)]) assert.equal(validatePlayerIdentityV84(candidate({ name })).ok, true);
  for (const name of ['', 'A', 'A'.repeat(41)]) {
    const result = validatePlayerIdentityV84(candidate({ name }));
    assert.equal(result.ok, false);
    assert.equal(result.identity, null);
    assert.deepEqual(Object.keys(result.errors), ['name']);
  }
  for (const callsign of ['A1', 'B'.repeat(16)]) assert.equal(validatePlayerIdentityV84(candidate({ callsign })).ok, true);
  for (const callsign of ['', 'A', 'B'.repeat(17), '--']) {
    const result = validatePlayerIdentityV84(candidate({ callsign }));
    assert.equal(result.ok, false);
    assert.deepEqual(Object.keys(result.errors), ['callsign']);
  }
});

for (const name of ['Mara Vega', ' mara   VEGA ', 'Mára Véga', 'Mara-Vega', "Mara'Vega", 'Ｍａｒａ Ｖｅｇａ']) {
  test(`NPC identity is reserved: ${name}`, () => {
    const result = validatePlayerIdentityV84(candidate({ name }));
    assert.equal(result.ok, false);
    assert.match(result.errors.name, /PNJ/);
  });
}

for (const name of ['<script>alert(1)</script>', '<img src=x>', 'Alex;rm', 'Alex && cmd', 'Alex\nNode', 'Alex\tNg', 'rm -rf', 'Remove-Item', 'powershell', 'curl example', '$(whoami)', '../admin', 'Alex\u202eNg', 'Alex😀', '---']) {
  test(`unsafe or non-name content is rejected: ${JSON.stringify(name)}`, () => {
    assert.equal(validatePlayerIdentityV84(candidate({ name })).ok, false);
  });
}

test('callsigns accept only their source ASCII alphabet, never Unicode uppercase substitutions or HTML', () => {
  for (const callsign of ['écho', 'ＦＯＸ', 'ßß', 'FOX_1', 'FOX 1', 'FOX\n1', '<b>', 'A/B', '😀9', 'CMD']) {
    assert.equal(validatePlayerIdentityV84(candidate({ callsign })).ok, false, callsign);
  }
});

test('malformed identity input is rejected without throwing or invoking coercion', () => {
  for (const input of [undefined, null, 84, [], new Date(), {}, { name: 42, callsign: {} }, { name: 'A'.repeat(10000), callsign: 'FOX' }]) {
    const result = validatePlayerIdentityV84(input);
    assert.equal(result.ok, false);
    assert.equal(result.identity, null);
  }
});

test('create starts exactly at wake with independent identity and empty progression arrays', () => {
  const identity = validatePlayerIdentityV84(candidate()).identity;
  const state = createPlayerOnboardingV84(identity);
  assert.equal(PLAYER_ONBOARDING_SCHEMA_V84, 84);
  assert.deepEqual(state, { schema: 84, identity, phase: 'wake', dialogueNode: 0, choices: [], completedEvents: [] });
  assert.notEqual(state.identity, identity);
  assert.notEqual(state.choices, state.completedEvents);
  assert.equal(createPlayerOnboardingV84(candidate({ name: 'Mara Vega' })), null);
});

test('old saves, missing markers, future schemas and malformed phases never create a retroactive wake-up', () => {
  const state = fresh();
  for (const raw of [null, {}, [], { player: { name: 'Mara Vega' } }, { ...state, schema: 83 }, { ...state, schema: 85 },
    { ...state, schema: '84' }, { ...state, phase: 'unknown' }, { ...state, phase: undefined }, { ...state, identity: {} },
    { ...state, identity: { ...state.identity, id: 'crew-01-mara-vega' } },
    { ...state, identity: { ...state.identity, schema: 83 } },
    { ...state, identity: { ...state.identity, canonStatus: 'official' } },
    { ...state, identity: { ...state.identity, name: 'Mara Vega' } }]) {
    assert.equal(normalizePlayerOnboardingV84(raw), null);
  }
});

test('normalization bounds node, arrays and allowed properties without importing future ledger entries', () => {
  for (const [rawNode, expected] of [[-10, 0], [100, 2], [1.9, 1], [NaN, 0], [Infinity, 0], ['2', 0]]) {
    const raw = { ...fresh(), phase: 'medical', dialogueNode: rawNode, health: 999, rewards: ['rifle'],
      choices: ['wake-confirmed', 'wake-confirmed', '<script>', {}, 'briefing-complete'],
      completedEvents: Array(1000).fill('briefing-complete') };
    const normalized = normalizePlayerOnboardingV84(raw);
    assert.equal(normalized.dialogueNode, expected);
    assert.deepEqual(normalized.choices, ['wake-confirmed']);
    assert.equal(normalized.completedEvents.length, 1 + expected);
    assert.equal(normalized.completedEvents.includes('briefing-complete'), false);
    assert.deepEqual(Object.keys(normalized), ['schema', 'identity', 'phase', 'dialogueNode', 'choices', 'completedEvents']);
    assert.deepEqual(normalizePlayerOnboardingV84(normalized), normalized);
  }
  assert.deepEqual(normalizePlayerOnboardingV84({ ...fresh(), choices: 'invalid', completedEvents: 'invalid', dialogueNode: 2 }), fresh());
  const complete = normalizePlayerOnboardingV84({ ...fresh(), phase: 'complete', dialogueNode: 200, choices: Array(1000).fill('briefing-complete') });
  assert.equal(complete.dialogueNode, 0);
  assert.equal(complete.completedEvents.length, 7);
  assert.deepEqual(complete.choices, ['briefing-complete']);
});

test('onboarding advances in the prescribed order and reload preserves every exact step', () => {
  let state = fresh();
  const expected = [['medical', 0], ['medical', 1], ['medical', 2], ['briefing', 0], ['briefing', 1], ['briefing', 2], ['complete', 0]];
  for (const [index, event] of sequence.entries()) {
    const before = structuredClone(state);
    const result = advancePlayerOnboardingV84(state, event);
    assert.equal(result.ok, true);
    assert.equal(result.reason, 'advanced');
    assert.deepEqual(state, before);
    state = result.state;
    assert.deepEqual([state.phase, state.dialogueNode], expected[index]);
    assert.equal(state.completedEvents.length, index + 1);
    assert.equal(state.choices.length, index + 1);
    assert.deepEqual(normalizePlayerOnboardingV84(JSON.parse(JSON.stringify(state))), state);
    assert.equal(state.identity.name, 'Alex Moreau');
  }
});

test('each event is idempotent, including node-stamped Next after reload and after completion', () => {
  let state = fresh();
  for (const event of sequence) {
    const first = advancePlayerOnboardingV84(state, event);
    const duplicate = advancePlayerOnboardingV84(JSON.parse(JSON.stringify(first.state)), event);
    assert.equal(duplicate.ok, true);
    assert.equal(duplicate.reason, 'already-completed');
    assert.deepEqual(duplicate.state, first.state);
    state = first.state;
  }
  for (const event of sequence) assert.deepEqual(advancePlayerOnboardingV84(state, event).state, state);
});

test('neither medical nor briefing can finish before the final dialogue node', () => {
  for (const [step, event] of [[1, 'medical-complete'], [2, 'medical-complete'], [4, 'briefing-complete'], [5, 'briefing-complete']]) {
    const state = toStep(step);
    const result = advancePlayerOnboardingV84(state, event);
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'dialogue-incomplete');
    assert.deepEqual(result.state, state);
  }
});

test('future phases cannot be skipped and stale/out-of-order Next does not consume another line', () => {
  const state = toStep(1);
  for (const event of ['briefing-complete', { type: 'briefing-next', dialogueNode: 0 }]) {
    const result = advancePlayerOnboardingV84(state, event);
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'phase-order');
  }
  assert.equal(advancePlayerOnboardingV84(state, { type: 'medical-next', dialogueNode: 1 }).reason, 'stale-dialogue-node');
  assert.equal(advancePlayerOnboardingV84(state, 'medical-next').reason, 'dialogue-node-required');
  assert.equal(advancePlayerOnboardingV84(toStep(3), { type: 'medical-next', dialogueNode: 2 }).reason, 'dialogue-complete');
});

test('malformed events fail closed and return detached unchanged state', () => {
  for (const event of [null, undefined, [], 7, {}, 'heal', { type: '<script>' }, { type: 'medical-next', dialogueNode: Infinity },
    { type: 'medical-next', dialogueNode: '0' }, { type: 'medical-next', dialogueNode: -1 }, { type: 'medical-next', dialogueNode: 3 }]) {
    const state = deepFreeze(toStep(1));
    const result = advancePlayerOnboardingV84(state, event);
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state);
    assert.notEqual(result.state, state);
    assert.notEqual(result.state.identity, state.identity);
  }
  assert.deepEqual(advancePlayerOnboardingV84(null, 'wake-confirmed'), { ok: false, state: null, reason: 'invalid-state' });
});

test('normalization, reducer and objectives never share writable identity or history objects', () => {
  const state = deepFreeze(toStep(1));
  const normalized = normalizePlayerOnboardingV84(state);
  const advanced = advancePlayerOnboardingV84(state, { type: 'medical-next', dialogueNode: 0 }).state;
  normalized.identity.name = 'Changed Name';
  normalized.choices.push('forged');
  advanced.identity.callsign = 'NEW';
  advanced.completedEvents.push('forged');
  assert.equal(state.identity.name, 'Alex Moreau');
  assert.equal(state.identity.callsign, 'ECHO-9');
  assert.equal(state.choices.includes('forged'), false);
  assert.equal(state.completedEvents.includes('forged'), false);
  const objective = getPlayerOnboardingObjectiveV84(state);
  objective.text = 'Changed';
  assert.notEqual(getPlayerOnboardingObjectiveV84(state).text, 'Changed');
});

test('dialogue is original project writing, limited to three lines and physically consistent with the NPC roster', () => {
  for (const [phase, dialogue] of Object.entries(ONBOARDING_DIALOGUES_V84)) {
    assert.equal(dialogue.canonStatus, 'project-fiction-not-franchise-canon');
    assert.equal(dialogue.provenance, 'tantalus-frontier-project-authored-v84');
    assert.equal(dialogue.isTranscript, false);
    assert.ok(dialogue.lines.length >= 1 && dialogue.lines.length <= 3);
    assert.ok(dialogue.lines.every((line) => typeof line === 'string' && line.length > 20));
    assert.equal(Object.isFrozen(dialogue.lines), true);
    assert.equal(Object.isFrozen(dialogue.speaker), true);
    if (phase !== 'wake') {
      const npc = HUB_NPC_ROSTER.find((entry) => entry.crewId === dialogue.speaker.crewId);
      assert.ok(npc);
      assert.equal(npc.name, dialogue.speaker.name);
      assert.equal(npc.roomId, dialogue.roomId);
    }
  }
  assert.equal(ONBOARDING_DIALOGUES_V84.briefing.speaker.name, 'Tamsin Velez');
  assert.equal(ONBOARDING_DIALOGUES_V84.medical.speaker.crewId, 'crew-10-david-8r');
  assert.match(ONBOARDING_DIALOGUES_V84.medical.lines[1], /pas établir votre état médical/);
  assert.match(ONBOARDING_DIALOGUES_V84.medical.lines[1], /Noor Okafor/);
  const allText = Object.values(ONBOARDING_DIALOGUES_V84).flatMap((entry) => entry.lines).join(' ');
  assert.match(allText, /Tantalus/);
  assert.match(allText, /Echo-9/);
  assert.match(allText, /Marines coloniaux/);
  assert.doesNotMatch(allText, /vous êtes guéri|santé restaurée|ressources offertes|vous recevez une arme/i);
});

test('objectives follow physical rooms and completion has no leftover NPC gate', () => {
  assert.equal(getPlayerOnboardingObjectiveV84(null), null);
  for (const [step, phase, roomId, crewId] of [
    [0, 'wake', 'cryo-bay', null], [1, 'medical', 'cryo-bay', 'crew-10-david-8r'],
    [4, 'briefing', 'briefing', 'crew-02-tamsin-velez'], [7, 'complete', null, null]
  ]) {
    const objective = getPlayerOnboardingObjectiveV84(toStep(step));
    assert.deepEqual([objective.phase, objective.roomId, objective.crewId], [phase, roomId, crewId]);
    assert.equal(objective.completed, phase === 'complete');
    assert.ok(objective.text.length > 20);
  }
});
