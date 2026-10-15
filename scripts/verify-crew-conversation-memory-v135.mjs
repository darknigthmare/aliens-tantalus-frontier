import test from 'node:test';
import assert from 'node:assert/strict';
import { CREW, CAMPAIGNS, WEAPONS, EQUIPMENT } from '../src/content.js';
import { createDefaultSave, migrateSave, SaveSystem } from '../src/save.js';
import { createRecruitmentV85, resolveCrewDefinitionV85 } from '../src/crew-recruitment-v85.js';
import { buildCrewConversationV120 } from '../src/crew-conversations-v120.js';
import { buildCrewUiModelV85, CrewUiV85 } from '../src/crew-ui-v85.js';
import { commitCrewTransactionV85 } from '../src/crew-transactions-v85.js';
import { MAX_CREW_CONVERSATION_MEMORIES_V135, normalizeCrewConversationMemoryV135,
  rememberCrewConversationTopicV135, getCrewConversationRecallV135, renderCrewConversationWithMemoryV135 } from '../src/crew-conversation-memory-v135.js';

const options = { catalog: CREW, campaignCatalog: CAMPAIGNS, equipmentCatalog: [...WEAPONS, ...EQUIPMENT] };
function saveFixture() {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.onboardingV84 = null; save.strategy.currentOperation = null;
  return save;
}
const memoryOptions = save => ({ ...options, crew: save.crew, clock: save.clock });
function conversation(save, id = save.crew[0].id) {
  const roster = save.crew.map(member => resolveCrewDefinitionV85(member, CREW)).filter(Boolean);
  const member = roster.find(entry => entry.id === id);
  const dialogue = buildCrewConversationV120(member, { roster, ...options });
  return { member, roster, dialogue };
}
function recall(save, id, topicId) {
  const { member, roster, dialogue } = conversation(save, id);
  return getCrewConversationRecallV135(save.crewConversationMemoryV135, member, dialogue.topics.find(topic => topic.id === topicId), { roster, clock: save.clock });
}
function storageFixture() {
  const records = new Map(); let fail = false;
  const storage = { getItem: key => records.get(key) ?? null, setItem(key, value) { if (fail) throw new Error('disk-full'); records.set(key, value); } };
  const system = new SaveSystem(storage); system.commit(saveFixture());
  return { system, records, fail: value => { fail = value; } };
}

test('opening/rendering every dossier remains read-only; only a deliberate topic action creates one reading entry', () => {
  const save = saveFixture(), before = JSON.stringify(save), id = save.crew[0].id;
  const model = buildCrewUiModelV85(save, CREW), { dialogue } = conversation(save, id);
  for (const topic of dialogue.topics) renderCrewConversationWithMemoryV135(dialogue, topic.id, recall(save, id, topic.id));
  assert.equal(JSON.stringify(save), before); assert.deepEqual(model.conversationMemoryV135, { schema: 135, entries: [] });
  const first = rememberCrewConversationTopicV135(save, id, 'readiness', options);
  assert.equal(first.ok, true); assert.equal(first.kind, 'first'); assert.equal(first.hours, 0);
  assert.equal(save.crewConversationMemoryV135.entries.length, 1); assert.equal(recall(save, id, 'readiness').state, 'reviewed');
  const after = { ...save }; delete after.crewConversationMemoryV135;
  const original = JSON.parse(before); delete original.crewConversationMemoryV135;
  assert.deepEqual(after, original, 'Conversation metadata must not change health, rapport, service history, clock or resources.');
});

test('repeated identical context is an exact no-op even on another game day; a changed readiness has a new explicit visit', () => {
  const save = saveFixture(), id = save.crew[0].id;
  rememberCrewConversationTopicV135(save, id, 'readiness', options);
  const old = structuredClone(save.crewConversationMemoryV135); save.clock.day += 3;
  for (let repeat = 0; repeat < 20; repeat += 1) assert.equal(rememberCrewConversationTopicV135(save, id, 'readiness', options).changed, false);
  assert.deepEqual(save.crewConversationMemoryV135, old);
  save.crew[0].health = 25; save.crew[0].status = 'injured';
  assert.equal(recall(save, id, 'readiness').state, 'changed');
  assert.deepEqual(save.crewConversationMemoryV135, old, 'A changed view cannot mark itself read.');
  const result = rememberCrewConversationTopicV135(save, id, 'readiness', options);
  assert.equal(result.kind, 'changed'); assert.equal(save.crewConversationMemoryV135.entries.length, 1);
  const updated = save.crewConversationMemoryV135.entries[0];
  assert.equal(updated.firstDay, old.entries[0].firstDay); assert.equal(updated.lastDay, save.clock.day);
  assert.notEqual(updated.contextKey, old.entries[0].contextKey);
});

test('validated service events change the debrief context; unknown/duplicate events do not manufacture a new mission', () => {
  const save = saveFixture(), id = save.crew[0].id;
  rememberCrewConversationTopicV135(save, id, 'debrief', options);
  save.crew[0].serviceHistoryV85 = [{ schema: 85, type: 'mission', operationId: 'forged-operation', outcome: 'success', day: 1, hour: 6 }];
  assert.equal(recall(save, id, 'debrief').state, 'reviewed');
  const event = { schema: 85, type: 'mission', operationId: 'operation-1-test', campaignId: CAMPAIGNS[0].id, outcome: 'retreat', day: 1, hour: 6 };
  save.crew[0].serviceHistoryV85 = [event, structuredClone(event)];
  assert.equal(recall(save, id, 'debrief').state, 'changed');
  rememberCrewConversationTopicV135(save, id, 'debrief', options);
  assert.equal(conversation(save).dialogue.recordedMissions, 1);
  assert.deepEqual(save.crew[0].serviceHistoryV85, [event, event], 'Reading cannot rewrite a service record.');
});

test('dead peers remain a real memorial relationship in the live speaker context, without opening their own liaison', () => {
  const save = saveFixture(), [speaker, peer] = save.crew;
  peer.status = 'deceased'; speaker.relationsV85 = [{ crewId: peer.id, sharedMissions: 2 }];
  const topic = conversation(save, speaker.id).dialogue.topics.find(entry => entry.id === 'team');
  assert.match(topic.answer, /mémoire de service/);
  rememberCrewConversationTopicV135(save, speaker.id, 'team', options);
  assert.equal(recall(save, speaker.id, 'team').state, 'reviewed');
  assert.throws(() => rememberCrewConversationTopicV135(save, peer.id, 'readiness', options), /canal/);
});

test('candidates, archives, deceased and malformed generated dossiers cannot gain live reading memory; a recruited dossier can', () => {
  for (const kind of ['candidate', 'archive', 'deceased', 'malformed']) {
    const save = saveFixture(), id = save.crew[0].id;
    if (kind === 'candidate') save.crew[0].candidate = true;
    if (kind === 'archive') save.crew[0].archive = true;
    if (kind === 'deceased') save.crew[0].status = 'deceased';
    if (kind === 'malformed') Object.assign(save.crew[0], { recruitV85: { schema: 85, id }, identityV119: {} });
    assert.throws(() => rememberCrewConversationTopicV135(save, id, 'readiness', options));
    assert.equal(save.crewConversationMemoryV135?.entries.length || 0, 0);
  }
  const save = saveFixture(), profile = createRecruitmentV85().candidates[0];
  assert.throws(() => rememberCrewConversationTopicV135(save, profile.id, 'background', options));
  save.crew.push({ id: profile.id, recruitV85: profile, status: 'active', health: 100, stress: 0, fatigue: 0 });
  assert.equal(rememberCrewConversationTopicV135(save, profile.id, 'background', options).kind, 'first');
});

test('normalization drops forged shapes, future/reversed dates, duplicate owners and arbitrary payloads; keeps only one latest valid topic', () => {
  const save = saveFixture(), id = save.crew[0].id;
  rememberCrewConversationTopicV135(save, id, 'readiness', options);
  const entry = save.crewConversationMemoryV135.entries[0];
  const hostile = [null, [], { ...entry, contextKey: 'not-a-context' }, { ...entry, topicId: '__proto__' },
    { ...entry, crewId: 'absent' }, { ...entry, lastDay: 2 }, { ...entry, firstHour: 7 }, { ...entry, lastHour: NaN },
    { ...entry, firstDay: 1.1 }, { ...entry, firstHour: -1 }, { ...entry, answer: '<script>', rapport: 999 }];
  const normalized = normalizeCrewConversationMemoryV135({ schema: 135, entries: [entry, ...hostile, entry] }, memoryOptions(save));
  assert.deepEqual(normalized, { schema: 135, entries: [entry] }); assert.equal('answer' in normalized.entries[0], false);
  assert.deepEqual(normalizeCrewConversationMemoryV135({ ...normalized, schema: '135' }, memoryOptions(save)).entries, []);
  assert.deepEqual(normalizeCrewConversationMemoryV135(normalized, { ...memoryOptions(save), crew: [save.crew[0], save.crew[0]] }).entries, []);
  assert.deepEqual(normalizeCrewConversationMemoryV135(normalized, { ...memoryOptions(save), clock: { day: Infinity, hour: 0 } }).entries, []);
});

test('the ledger bounds many recruited members deterministically and migration preserves only bounded metadata', () => {
  const save = saveFixture(), id = save.crew[0].id;
  rememberCrewConversationTopicV135(save, id, 'readiness', options);
  const template = save.crewConversationMemoryV135.entries[0], entries = [];
  const topics = ['readiness', 'background', 'anchor', 'approach', 'debrief', 'team', 'training', 'equipment'];
  for (let index = 0; index < 35; index += 1) {
    const profile = createRecruitmentV85(135000 + index).candidates[0];
    save.crew.push({ id: profile.id, recruitV85: profile, status: 'active', health: 100, stress: 0, fatigue: 0 });
    for (const topicId of topics) entries.push({ ...template, crewId: profile.id, topicId });
  }
  save.crewConversationMemoryV135 = { schema: 135, entries };
  const normalized = normalizeCrewConversationMemoryV135(save.crewConversationMemoryV135, memoryOptions(save));
  assert.equal(normalized.entries.length, MAX_CREW_CONVERSATION_MEMORIES_V135);
  assert.deepEqual(normalizeCrewConversationMemoryV135(normalized, memoryOptions(save)), normalized);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save))).crewConversationMemoryV135, normalized);
});

test('a deceased member loses live memory in migration; an imported revival does not restore erased exchanges', () => {
  const save = saveFixture(), id = save.crew[0].id;
  rememberCrewConversationTopicV135(save, id, 'readiness', options); save.crew[0].status = 'deceased';
  const memorial = migrateSave(save); assert.equal(memorial.crewConversationMemoryV135.entries.length, 0);
  memorial.crew[0].status = 'active'; assert.equal(migrateSave(memorial).crewConversationMemoryV135.entries.length, 0);
});

test('ongoing operations and incomplete onboarding allow no persistent liaison transaction', () => {
  for (const lock of ['operation', 'creation', 'onboarding']) {
    const save = saveFixture(), before = structuredClone(save.crewConversationMemoryV135);
    if (lock === 'operation') save.strategy.currentOperation = { id: 'operation-1-test' };
    if (lock === 'creation') save.needsPlayerCreationV84 = true;
    if (lock === 'onboarding') save.onboardingV84 = { phase: 'tour' };
    assert.throws(() => rememberCrewConversationTopicV135(save, save.crew[0].id, 'readiness', options), /échanges/);
    assert.deepEqual(save.crewConversationMemoryV135, before);
  }
});

test('real SaveSystem storage failure and stale ownership leave active, durable and other profile memory untouched', () => {
  const { system, records, fail } = storageFixture(), owner = { profile: 1, epoch: 1, timeline: system.data.createdAt };
  const ownsOwner = value => value.profile === system.profile && value.epoch === 1 && value.timeline === system.data.createdAt;
  const action = (save, ...args) => rememberCrewConversationTopicV135(save, ...args, options);
  const id = system.data.crew[0].id, before = JSON.stringify(system.data), disk = records.get(system.key());
  fail(true);
  assert.throws(() => commitCrewTransactionV85({ saveSystem: system, owner, ownsOwner, action, args: [id, 'readiness'] }), /Sauvegarde impossible/);
  assert.equal(JSON.stringify(system.data), before); assert.equal(records.get(system.key()), disk);
  fail(false);
  assert.throws(() => commitCrewTransactionV85({ saveSystem: system, owner: { ...owner, epoch: 0 }, ownsOwner, action, args: [id, 'readiness'] }), /chronologie/);
  assert.equal(JSON.stringify(system.data), before);
  const result = commitCrewTransactionV85({ saveSystem: system, owner, ownsOwner, action, args: [id, 'readiness'] });
  assert.equal(result.kind, 'first'); assert.equal(JSON.parse(records.get(system.key())).crewConversationMemoryV135.entries.length, 1);
  system.newGame(2); assert.equal(system.data.crewConversationMemoryV135.entries.length, 0);
  system.load(1); assert.equal(system.data.crewConversationMemoryV135.entries.length, 1);
});

test('reviewed answers collapse into an explicit reread action; changed/new text and status escape imported markup', () => {
  const save = saveFixture(), id = save.crew[0].id, { dialogue } = conversation(save);
  const fresh = renderCrewConversationWithMemoryV135(dialogue, 'readiness', recall(save, id, 'readiness'));
  assert.match(fresh, /data-v135-recall-state="new"/); assert.doesNotMatch(fresh, /<details/);
  rememberCrewConversationTopicV135(save, id, 'readiness', options);
  const reviewed = renderCrewConversationWithMemoryV135(dialogue, 'readiness', recall(save, id, 'readiness'), { status: '<script>alert(1)</script>' });
  assert.match(reviewed, /<details data-v135-recall-answer>/); assert.match(reviewed, /jour 1, 06:00/);
  assert.doesNotMatch(reviewed, /<script>/); assert.match(reviewed, /&lt;script&gt;/);
  assert.doesNotMatch(renderCrewConversationWithMemoryV135(dialogue, 'readiness', recall(save, id, 'readiness'), { showAnswer: true }), /<details/);
});

function uiFixture(onAction) {
  const ui = Object.create(CrewUiV85.prototype), save = saveFixture(), owner = { profile: 1, epoch: 1, timeline: save.createdAt };
  Object.assign(ui, { save, catalog: CREW, model: buildCrewUiModelV85(save, CREW), selectedId: save.crew[0].id,
    detailOwner: { ...owner }, getOwner: () => ({ ...owner }), dialog: { open: true }, onAction,
    renderDetail() { this.renders = (this.renders || 0) + 1; }, focusConversationTopicV135(topic) { this.focusedTopic = topic; } });
  return { ui, owner };
}

test('UI sync and async accepted transactions confirm from committed data and keep the selected topic focused', async () => {
  for (const asynchronous of [false, true]) {
    const { ui } = uiFixture();
    ui.onAction = (action, [id, topicId]) => {
      assert.equal(action, 'conversation');
      const candidate = structuredClone(ui.save), result = rememberCrewConversationTopicV135(candidate, id, topicId, options);
      ui.save = migrateSave(candidate);
      return asynchronous ? Promise.resolve(result) : result;
    };
    await ui.visitConversationTopicV135('readiness');
    assert.match(ui.conversationStatusV135, /Échange mémorisé/); assert.equal(ui.conversationVisitV135.kind, 'first');
    assert.equal(ui.focusedTopic, 'readiness'); assert.equal(ui.conversationPendingV135, null);
    await ui.visitConversationTopicV135('readiness'); assert.equal(ui.conversationVisitV135.kind, 'unchanged');
    assert.match(ui.conversationStatusV135, /déjà mémorisé/);
  }
});

test('UI rejected storage, false success, and delayed stale-owner results never claim an accepted exchange', async () => {
  for (const reject of [() => { throw new Error('Stockage plein.'); }, () => Promise.reject(new Error('Stockage plein.')), () => ({ ok: true })]) {
    const { ui } = uiFixture(reject); await ui.visitConversationTopicV135('readiness');
    assert.equal(ui.conversationVisitV135, null); assert.doesNotMatch(ui.conversationStatusV135, /Échange mémorisé/);
    assert.equal(ui.model.conversationMemoryV135.entries.length, 0); assert.equal(ui.focusedTopic, 'readiness');
  }
  let complete; const { ui, owner } = uiFixture(() => new Promise(resolve => { complete = resolve; }));
  const pending = ui.visitConversationTopicV135('readiness'); owner.epoch += 1;
  complete({ ok: true, changed: true, kind: 'first' }); await pending;
  assert.equal(ui.conversationVisitV135, null); assert.equal(ui.model.conversationMemoryV135.entries.length, 0);
  assert.doesNotMatch(ui.conversationStatusV135, /Échange mémorisé/);
});
