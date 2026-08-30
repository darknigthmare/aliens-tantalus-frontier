import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { CREW } from '../src/content-core-v50.js';
import { HUB_NPC_ROSTER } from '../src/hub-v52-runtime.js';
import {
  NPC_DIALOGUE_COVERAGE_V62,
  NPC_DIALOGUE_SCHEMA_V62,
  NPC_IDENTITIES_V62,
  NPC_ROUTINE_PHASES_V62,
  applyNpcDialogueChoiceV62,
  beginNpcConversationV62,
  buildNpcPhysicalRouteV62,
  getNpcDialogueMemoryV62,
  migrateNpcDialogueHubStateV62,
  normalizeDialogueMemoryV62,
  normalizeNpcRoutineStateV62,
  persistNpcRoutineResolutionV62,
  resolveNpcRoutineV62,
  sampleNpcPhysicalRouteV62
} from '../src/npc-dialogue-v62.js';

const crewState = (crewId, patch = {}) => {
  const source = CREW.find((member) => member.id === crewId);
  return { ...source, injuries: [], ...patch };
};

test('V62 dialogue identities cover every existing crew and physical hub NPC exactly once', () => {
  assert.equal(NPC_DIALOGUE_COVERAGE_V62.complete, true);
  assert.equal(NPC_IDENTITIES_V62.length, 16);
  assert.deepEqual(new Set(NPC_IDENTITIES_V62.map((entry) => entry.crewId)), new Set(CREW.map((entry) => entry.id)));
  assert.deepEqual(new Set(NPC_IDENTITIES_V62.map((entry) => entry.crewId)), new Set(HUB_NPC_ROSTER.map((entry) => entry.crewId)));
  for (const identity of NPC_IDENTITIES_V62) {
    const hubNpc = HUB_NPC_ROSTER.find((entry) => entry.crewId === identity.crewId);
    assert.equal(identity.stationRoomId, hubNpc.roomId);
    assert.ok(identity.duty.length > 12);
    assert.ok(identity.lines.first.length > 30);
    assert.ok(identity.lines.repeat.length > 30);
    assert.equal(identity.canonStatus, 'project-fiction-not-franchise-canon');
  }
});

test('every NPC has a deterministic physical daily station, route, work, break and alert resolution', () => {
  const hours = [2, 6.5, 9, 12.5, 13.5, 17, 21.5, 23];
  for (const identity of NPC_IDENTITIES_V62) {
    const resolved = hours.map((hour) => resolveNpcRoutineV62(identity.crewId, { clock: { day: 7, hour } }));
    const phases = new Set(resolved.map((entry) => entry.phase));
    for (const phase of ['station', 'route', 'work', 'break']) assert.ok(phases.has(phase), `${identity.name}: ${phase}`);
    for (const entry of resolved) {
      assert.ok(entry.roomId);
      assert.ok(Number.isInteger(entry.deck));
      assert.ok(entry.route.waypoints.length >= 1);
      assert.doesNotThrow(() => JSON.stringify(entry));
      assert.deepEqual(resolveNpcRoutineV62(identity.crewId, { clock: { day: 7, hour: entry.hour } }), entry);
    }
    const alert = resolveNpcRoutineV62(identity.crewId, { clock: { day: 7, hour: 9 }, hub: { activeCrisis: { id: 'breach', kind: 'security' } } });
    assert.equal(alert.phase, 'alert');
    assert.equal(alert.roomId, identity.alertRoomId);
    assert.ok(NPC_ROUTINE_PHASES_V62.includes(alert.phase));
  }
});

test('routine resolution accounts for medical recovery, mission assignment and confirmed infestation', () => {
  const id = 'crew-03-idris-kwan';
  const recovering = resolveNpcRoutineV62(id, { clock: { day: 2, hour: 9 }, crewState: crewState(id, { status: 'recovering', health: 38, injuries: ['burn'] }) });
  assert.equal(recovering.reason, 'medical-recovery');
  assert.equal(recovering.roomId, 'medical');
  assert.equal(recovering.needsCare, true);

  const assigned = resolveNpcRoutineV62(id, { clock: { day: 2, hour: 9 }, operation: { crewIds: [id] } });
  assert.equal(assigned.reason, 'mission-assignment');
  assert.equal(assigned.roomId, 'dropship-hangar');
  assert.equal(assigned.missionAssigned, true);

  const infestation = resolveNpcRoutineV62(id, { clock: { day: 2, hour: 9 }, hub: { infestationChain: { stage: 'confirmation', certainty: 72, resolved: false } } });
  assert.equal(infestation.phase, 'alert');
  assert.equal(infestation.reason, 'infestation-confirmation');
});

test('initial and repeat conversations expose conditional choices and explicit trust context', () => {
  const id = 'crew-01-mara-vega';
  const hub = {};
  const first = beginNpcConversationV62(id, { hub, clock: { day: 1, hour: 8 }, crewState: crewState(id) });
  assert.equal(first.contextKind, 'initial');
  assert.equal(first.context.firstContact, true);
  assert.equal(first.context.trust.source, 'crew-loyalty-plus-dialogue-rapport');
  assert.ok(first.choices.length >= 1);
  assert.ok(first.choices.every((choice) => choice.conditions.length >= 1 && typeof choice.available === 'boolean'));
  assert.ok(first.choices.some((choice) => choice.available));
  assert.deepEqual(beginNpcConversationV62(id, { hub, clock: { day: 1, hour: 8 }, crewState: crewState(id) }), first);

  const applied = applyNpcDialogueChoiceV62(hub, first, 'request-status');
  const repeat = beginNpcConversationV62(id, { hub: applied.hub, clock: { day: 1, hour: 8.5 }, crewState: crewState(id) });
  assert.equal(repeat.contextKind, 'repeat');
  assert.equal(repeat.context.firstContact, false);
  assert.notEqual(repeat.id, first.id);
  assert.match(repeat.lines.at(-1).text, /dernier|précédent|précédentes/i);
});

test('the current legacy interaction still opens first contact once without decrementing additive history', () => {
  const id = 'crew-01-mara-vega';
  const firstRecord = { count: 1, sequence: 1, interactionKind: 'intel', lastAction: 'navigate:command', lastRoomId: 'bridge' };
  const hub = { npcInteractions: { [id]: firstRecord } };
  const interaction = {
    type: 'hub:npc-interaction',
    crewId: id,
    persistence: { target: 'hub.npcInteractions', value: firstRecord }
  };
  const before = structuredClone(hub);
  const first = beginNpcConversationV62(id, { hub, interaction, clock: { day: 1, hour: 8 }, crewState: crewState(id) });
  assert.equal(first.context.firstContact, true);
  assert.equal(first.contextKind, 'initial');
  assert.deepEqual(hub, before, 'le reçu courant ne décrémente jamais le ledger V52 source');

  const applied = applyNpcDialogueChoiceV62(hub, first, 'request-status');
  assert.equal(applied.applied, true);
  assert.deepEqual(applied.hub.npcInteractions, hub.npcInteractions);
  assert.equal(applied.hub.dialogueMemory.entries[id].conversations, 1);

  const secondRecord = { ...firstRecord, count: 2, sequence: 2 };
  const secondHub = { ...applied.hub, npcInteractions: { [id]: secondRecord } };
  const second = beginNpcConversationV62(id, {
    hub: secondHub,
    interaction: { ...interaction, persistence: { ...interaction.persistence, value: secondRecord } },
    clock: { day: 1, hour: 8.25 },
    crewState: crewState(id)
  });
  assert.equal(second.context.firstContact, false);
  assert.equal(second.contextKind, 'repeat');

  const importedLegacy = beginNpcConversationV62(id, { hub, clock: { day: 1, hour: 8 }, crewState: crewState(id) });
  assert.equal(importedLegacy.context.firstContact, false, 'un ancien clic importé reste un historique réel sans reçu courant');
});

test('daily routes expose and sample corridor, door and inter-deck lift waypoints instead of switching rooms at 50 percent', () => {
  const sameDeck = buildNpcPhysicalRouteV62('bridge', 'briefing');
  assert.deepEqual(new Set(sameDeck.waypoints.map((entry) => entry.kind)), new Set(['room', 'corridor', 'door']));
  assert.equal(sameDeck.waypoints.filter((entry) => entry.kind === 'door').length, 2, 'chaque sas possède une approche et une sortie');

  const crossDeck = buildNpcPhysicalRouteV62('briefing', 'armory');
  const kinds = crossDeck.waypoints.map((entry) => entry.kind);
  for (const kind of ['lift-entry', 'lift-transit', 'lift-exit']) assert.ok(kinds.includes(kind), kind);
  assert.equal(sampleNpcPhysicalRouteV62(crossDeck, 0).roomId, 'briefing');
  assert.equal(sampleNpcPhysicalRouteV62(crossDeck, 1).roomId, 'armory');
  const beforeMidpoint = sampleNpcPhysicalRouteV62(crossDeck, 0.49);
  const afterMidpoint = sampleNpcPhysicalRouteV62(crossDeck, 0.51);
  assert.equal(beforeMidpoint.kind, 'lift-transit');
  assert.equal(afterMidpoint.kind, 'lift-transit');
  assert.equal(beforeMidpoint.waypointId, afterMidpoint.waypointId, 'le milieu global reste dans la cabine, sans téléportation salle à salle');
});

test('every strategic elapsed-time path refreshes the initialized hub routine context', () => {
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const refreshStart = source.indexOf('function refreshActiveHubNpcRoutinesV62()');
  const simulateStart = source.indexOf('function simulateElapsed(');
  const commitStart = source.indexOf('function commit(', simulateStart);
  const serviceStart = source.indexOf('function applyHubService(');
  const serviceEnd = source.indexOf('function handleHubAction(', serviceStart);
  assert.ok(refreshStart >= 0 && simulateStart > refreshStart);
  assert.match(source.slice(refreshStart, simulateStart), /setNpcRoutineContextV62\(getHubRoutineContextV62\(\), \{ persist: false, rebuild: true \}\)/);
  assert.match(source.slice(refreshStart, simulateStart), /saveSystem\.data\.hub\.npcRoutineState = clone\(hubEngine\.npcRoutineStateV62\)/);
  assert.match(source.slice(simulateStart, commitStart), /refreshActiveHubNpcRoutinesV62\(\)/);
  assert.match(source.slice(serviceStart, serviceEnd), /clock\.hour \+= 1[\s\S]*simulateElapsed\(before\)/);
});

test('contextual conversation references injuries, stress, mission, crisis and infestation without promises', () => {
  const id = 'crew-04-noor-okafor';
  const base = { hub: {}, clock: { day: 4, hour: 10 } };
  const injury = beginNpcConversationV62(id, { ...base, crewState: crewState(id, { health: 54, injuries: ['acid-burn'] }) });
  assert.equal(injury.contextKind, 'injury');
  assert.equal(injury.choices.find((choice) => choice.id === 'acknowledge-welfare').available, true);

  const stress = beginNpcConversationV62(id, { ...base, crewState: crewState(id, { stress: 78 }) });
  assert.equal(stress.contextKind, 'stress');

  const mission = beginNpcConversationV62(id, { ...base, crewState: crewState(id, { missions: 3 }) });
  assert.equal(mission.contextKind, 'mission');
  assert.equal(mission.choices.find((choice) => choice.id === 'review-mission').available, true);

  const crisis = beginNpcConversationV62(id, { ...base, hub: { activeCrisis: { id: 'c1', kind: 'breach' } }, crewState: crewState(id) });
  assert.equal(crisis.contextKind, 'crisis');
  assert.equal(crisis.choices.find((choice) => choice.id === 'confirm-alert-role').available, true);

  const infestation = beginNpcConversationV62(id, { ...base, hub: { infestationChain: { stage: 'clues', certainty: 43, resolved: false } }, crewState: crewState(id) });
  assert.equal(infestation.contextKind, 'infestation');
  assert.equal(infestation.context.infestation.certainty, 43);
  assert.equal(infestation.choices.find((choice) => choice.id === 'request-infestation-evidence').available, true);
  assert.doesNotMatch(JSON.stringify([injury, stress, mission, crisis, infestation]), /je garantis|résultat garanti|issue certaine/i);
});

test('choice effects are JSON-safe, ledger-only and idempotent', () => {
  const id = 'crew-14-echo-a';
  const hub = { deck: 0, systems: { power: 73 }, activeCrisis: { id: 'c2', kind: 'intrusion' } };
  const conversation = beginNpcConversationV62(id, { hub, clock: { day: 9, hour: 11 }, crewState: crewState(id) });
  const result = applyNpcDialogueChoiceV62(hub, conversation, 'confirm-alert-role');
  assert.equal(result.applied, true);
  assert.deepEqual(result.effectSummary.targets, ['hub.dialogueMemory', 'hub.npcRoutineState']);
  assert.equal(result.hub.deck, hub.deck);
  assert.deepEqual(result.hub.systems, hub.systems);
  assert.deepEqual(result.hub.activeCrisis, hub.activeCrisis);
  assert.equal(result.hub.npcRoutineState.entries[id].alertAcknowledged, true);
  assert.equal(result.hub.dialogueMemory.entries[id].conversations, 1);
  assert.doesNotThrow(() => JSON.stringify(result));

  const second = applyNpcDialogueChoiceV62(result.hub, conversation, 'confirm-alert-role');
  assert.equal(second.applied, false);
  assert.equal(second.reason, 'already-applied');
  assert.deepEqual(second.hub.dialogueMemory, result.hub.dialogueMemory);
  assert.deepEqual(second.hub.npcRoutineState, result.hub.npcRoutineState);

  const blocked = beginNpcConversationV62('crew-03-idris-kwan', { hub: {}, clock: { day: 1, hour: 8 }, crewState: crewState('crew-03-idris-kwan', { loyalty: 10 }) });
  assert.equal(blocked.choices.find((choice) => choice.id === 'request-candid-assessment').available, false);
  assert.equal(applyNpcDialogueChoiceV62({}, blocked, 'request-candid-assessment').reason, 'condition-not-met');
});

test('legacy interaction migration and normalizers are additive, bounded and idempotent', () => {
  const id = 'crew-06-rook';
  const legacyHub = {
    roomId: 'sensor-array',
    npcInteractions: { [id]: { count: 4, lastAction: 'navigate:galaxy' } },
    dialogueMemory: { entries: { unknown: { conversations: 999 }, [id]: { conversations: 2, rapport: 999, flags: ['a', 'a'] } } },
    npcRoutineState: { entries: { [id]: { phase: 'invalid', roomId: 'nowhere', sequence: 2 } } }
  };
  const migrated = migrateNpcDialogueHubStateV62(legacyHub);
  assert.equal(migrated.roomId, legacyHub.roomId);
  assert.deepEqual(migrated.npcInteractions, legacyHub.npcInteractions);
  assert.equal(migrated.dialogueMemory.schema, NPC_DIALOGUE_SCHEMA_V62);
  assert.equal(migrated.dialogueMemory.entries[id].conversations, 4);
  assert.equal(migrated.dialogueMemory.entries[id].rapport, 50);
  assert.equal(migrated.dialogueMemory.entries.unknown, undefined);
  assert.equal(migrated.npcRoutineState.entries[id].phase, 'station');
  assert.equal(migrated.npcRoutineState.entries[id].roomId, '');
  assert.deepEqual(migrateNpcDialogueHubStateV62(migrated), migrated);
  assert.deepEqual(normalizeDialogueMemoryV62(migrated.dialogueMemory, legacyHub.npcInteractions), migrated.dialogueMemory);
  assert.deepEqual(normalizeNpcRoutineStateV62(migrated.npcRoutineState), migrated.npcRoutineState);
  assert.equal(getNpcDialogueMemoryV62(migrated, id).conversations, 4);
});

test('routine persistence changes only npcRoutineState and does not inflate repeated snapshots', () => {
  const id = 'crew-16-cal-mercer';
  const hub = { deck: 2, systems: { power: 61 }, dialogueMemory: { schema: 62, sequence: 0, entries: {} } };
  const resolution = resolveNpcRoutineV62(id, { hub, clock: { day: 3, hour: 12.25 } });
  const first = persistNpcRoutineResolutionV62(hub, resolution);
  assert.equal(first.applied, true);
  assert.equal(first.hub.deck, 2);
  assert.deepEqual(first.hub.systems, hub.systems);
  assert.deepEqual(first.hub.dialogueMemory, migrateNpcDialogueHubStateV62(hub).dialogueMemory);
  const second = persistNpcRoutineResolutionV62(first.hub, resolution);
  assert.equal(second.applied, false);
  assert.equal(second.reason, 'already-current');
  assert.deepEqual(second.hub.npcRoutineState, first.hub.npcRoutineState);
});
