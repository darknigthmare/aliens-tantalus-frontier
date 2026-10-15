import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDefaultSave, SaveSystem, migrateSave, advanceStrategicClock } from '../src/save.js';
import { beginNpcConversationV62, applyNpcDialogueChoiceV62, NPC_RAPPORT_RULES_V135 } from '../src/npc-dialogue-v62.js';

const MARA = 'crew-01-mara-vega', TAMSIN = 'crew-02-tamsin-velez';
const WELFARE = 'acknowledge-welfare';
const clone = value => structuredClone(value);
function fixture() {
  const save = createDefaultSave(1);
  save.crew.find(member => member.id === MARA).stress = 70;
  return save;
}
function speak(save, choice = WELFARE, id = MARA, publish = true) {
  const conversation = beginNpcConversationV62(id, { save });
  const result = applyNpcDialogueChoiceV62(save.hub, conversation, choice);
  if (publish && result.applied) save.hub = clone(result.hub);
  return { result, conversation, delta: result.effectSummary?.rapportDelta };
}
const rapport = (save, id = MARA) => save.hub.dialogueMemory.entries[id]?.rapport ?? 0;
class MemoryStorage {
  values = new Map(); fail = false;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.fail) throw new Error('quota'); this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
function persisted() {
  const storage = new MemoryStorage(), system = new SaveSystem(storage);
  system.newGame(1); system.data.crew.find(member => member.id === MARA).stress = 70; system.commit();
  return { storage, system };
}

test('six fresh conversations about the same welfare fact award once and remain freely readable', () => {
  const save = fixture(), before = clone({ clock: save.clock, crew: save.crew, galaxy: save.galaxy });
  const deltas = [];
  for (let n = 0; n < 6; n++) {
    const { result, delta } = speak(save); assert.equal(result.applied, true); deltas.push(delta);
  }
  assert.deepEqual(deltas, [2, 0, 0, 0, 0, 0]); assert.equal(rapport(save), 2);
  assert.equal(save.hub.dialogueMemory.entries[MARA].conversations, 6);
  assert.deepEqual({ clock: save.clock, crew: save.crew, galaxy: save.galaxy }, before);
});

test('reading beyond the bounded conversation-id history cannot rearm the same benefit', () => {
  const save = fixture(); speak(save);
  for (let n = 0; n < 140; n++) assert.equal(speak(save).delta, 0);
  assert.equal(rapport(save), 2);
});

test('small health and stress fluctuations are the same situation; distinct injuries and severe stress are new facts', () => {
  const save = fixture(), member = save.crew.find(entry => entry.id === MARA); speak(save);
  member.health = 99; member.stress = 71; assert.equal(speak(save).delta, 0);
  member.stress = 79; assert.equal(speak(save).delta, 0);
  member.stress = 85; assert.equal(speak(save).delta, 2);
  member.stress = 70; assert.equal(speak(save).delta, 0, 'Returning to a previously considered fact is not new.');
  member.injuries.push({ id: 'field-injury-1', type: 'impact', operationId: 'operation-1-mission', severity: 20 });
  assert.equal(speak(save).delta, 2); assert.equal(speak(save).delta, 0);
});

test('a newly recorded mission permits fresh consideration without relying on a conversation counter', () => {
  const save = fixture(), member = save.crew.find(entry => entry.id === MARA); speak(save);
  member.missions = 1;
  const record = { schema: 85, type: 'mission', operationId: 'operation-1-field', outcome: 'retreat', day: 1, hour: 6 };
  member.serviceHistoryV85 = [record]; assert.equal(speak(save).delta, 2);
  member.serviceHistoryV85.push(clone(record)); assert.equal(speak(save).delta, 0);
  member.missions = 2; member.serviceHistoryV85.push({ ...record, operationId: 'operation-2-field', outcome: 'success' });
  assert.equal(speak(save).delta, 2);
});

test('the same welfare situation can be discussed beneficially again after a strategic eight-hour shift', () => {
  const save = fixture(); speak(save);
  advanceStrategicClock(save, NPC_RAPPORT_RULES_V135.renewAfterHours - .01);
  assert.equal(speak(save).delta, 0);
  advanceStrategicClock(save, .01); assert.equal(speak(save).delta, 2);
  assert.equal(speak(save).delta, 0); assert.equal(rapport(save), 4);
});

test('the renewal interval uses absolute game hours across midnight', () => {
  const save = fixture(); save.clock = { day: 1, hour: 23 }; speak(save);
  advanceStrategicClock(save, 7); assert.equal(speak(save).delta, 0);
  advanceStrategicClock(save, 1); assert.deepEqual(save.clock, { day: 2, hour: 7 });
  assert.equal(speak(save).delta, 2);
});

test('real profile commit, reload and JSON import retain benefit receipts', () => {
  const { storage, system } = persisted();
  let next = speak(system.data, WELFARE, MARA, false); system.commit({ hub: next.result.hub });
  const reopened = new SaveSystem(storage); reopened.load(1);
  assert.equal(speak(reopened.data).delta, 0); reopened.commit();
  const imported = new SaveSystem(new MemoryStorage()); imported.import(reopened.export(), 1);
  assert.equal(speak(imported.data).delta, 0); assert.equal(rapport(imported.data), 2);
});

test('an imported clock rewind cannot rearm an old receipt or invent a new benefit before its high-water time', () => {
  const { system } = persisted(); speak(system.data); advanceStrategicClock(system.data, 8); speak(system.data);
  const raw = JSON.parse(system.export()); raw.clock = { day: 1, hour: 6 };
  const imported = new SaveSystem(new MemoryStorage()); imported.import(JSON.stringify(raw), 1);
  assert.equal(speak(imported.data).delta, 0);
  imported.data.crew.find(entry => entry.id === MARA).injuries.push({ id: 'rewound-injury', severity: 30 });
  assert.equal(speak(imported.data).delta, 0);
  imported.data.clock = { day: 1, hour: 14 }; assert.equal(speak(imported.data).delta, 2);
});

test('same-conversation replay remains idempotent and the helper never mutates its source hub', () => {
  const save = fixture(), before = clone(save), first = speak(save, WELFARE, MARA, false);
  assert.deepEqual(save, before); save.hub = clone(first.result.hub);
  const again = applyNpcDialogueChoiceV62(save.hub, first.conversation, WELFARE);
  assert.equal(again.applied, false); assert.equal(again.reason, 'already-applied'); assert.equal(rapport(save), 2);
});

test('legacy memory preserves rapport and establishes a conservative baseline without blocking future facts forever', () => {
  const save = fixture();
  save.hub.dialogueMemory = { schema: 62, sequence: 6, entries: { [MARA]: {
    conversations: 6, rapport: 12, topics: { welfare: 6 }, flags: ['welfare-acknowledged'],
    lastChoiceId: WELFARE, lastTopic: 'welfare', lastDay: 1, lastHour: 6, handledConversationIds: []
  } } };
  const migrated = migrateSave(save, 1); assert.equal(rapport(migrated), 12); assert.equal(speak(migrated).delta, 0);
  migrated.crew.find(entry => entry.id === MARA).injuries.push({ id: 'later-injury', severity: 40 });
  assert.equal(speak(migrated).delta, 2); assert.equal(rapport(migrated), 14);
});

test('benefits are independent per NPC and per relevant fact, and candid-assessment trust cannot feed itself', () => {
  const save = fixture(); save.crew.find(entry => entry.id === TAMSIN).stress = 70;
  assert.equal(speak(save).delta, 2); assert.equal(speak(save, WELFARE, TAMSIN).delta, 2);
  save.crew.find(entry => entry.id === MARA).loyalty = 90;
  assert.equal(speak(save, 'request-candid-assessment').delta, 1);
  for (let n = 0; n < 6; n++) assert.equal(speak(save, 'request-candid-assessment').delta, 0);
  save.hub.activeCrisis = { id: 'crisis-1', active: true, kind: 'security', roomId: 'bridge' };
  assert.equal(speak(save, 'confirm-alert-role').delta, 1); assert.equal(speak(save, 'confirm-alert-role').delta, 0);
  save.hub.activeCrisis.id = 'crisis-2'; assert.equal(speak(save, 'confirm-alert-role').delta, 1);
});

test('a failed atomic SaveSystem candidate commit consumes neither a benefit nor the active/profile state', () => {
  const { storage, system } = persisted(), original = clone(system.data), stored = storage.getItem(system.key());
  const { result } = speak(system.data, WELFARE, MARA, false); storage.fail = true;
  assert.throws(() => system.commit({ hub: result.hub }), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, original); assert.equal(storage.getItem(system.key()), stored);
  storage.fail = false;
  const retry = speak(system.data, WELFARE, MARA, false); assert.equal(retry.delta, 2);
  system.commit({ hub: retry.result.hub }); assert.equal(speak(system.data).delta, 0);
});
