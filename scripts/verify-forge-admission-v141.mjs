import test from 'node:test';
import assert from 'node:assert/strict';
import { createForgeSessionV141, blockedForgeObjectivesV141 } from '../src/forge-journey-v141.js';
import { openForgeNarrativeV156, chooseForgeNarrativeV156 } from '../src/forge-narrative-v156.js';
import { inspectForgeJourneyV141, admittedForgeJourneyV141 } from '../src/forge-journey-admission-v141.js';

function room(id, { spawn = false, goal = false, door = 6 } = {}) {
  const cell = (suffix, x, y, type, layer = 'gameplay') => ({ id: `${id}-${suffix}`, x, y, type, layer });
  return { id, name: `Salle ${id}`, size: [32, 18], cells: [
    ...Array.from({ length: 32 }, (_, x) => cell(`floor-${x}`, x, 16, 'floor', 'structure')),
    cell('door', door, 15, 'door'),
    ...(spawn ? [cell('spawn', 1, 15, 'spawn')] : []),
    ...(goal ? [cell('goal', 20, 15, 'objective')] : [])
  ] };
}
const project = kind => ({ schema: 3, kind, name: 'Parcours admissible', activeRoomId: 'a',
  rooms: [room('a', { spawn: true }), room('b', { goal: true })],
  links: [{ id: 'ab', from: { roomId: 'a', cellId: 'a-door' }, to: { roomId: 'b', cellId: 'b-door' }, bidirectional: true }] });
const has = (audit, code) => audit.issues.some(issue => issue.code === code && issue.severity === 'error');

for (const kind of ['mission', 'ship']) {
  test(`${kind}: a transit room needs no local objective or unused insertion`, () => {
    const input = project(kind), before = structuredClone(input), audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.scope, 'reachable-rooms'); assert.equal(audit.totalObjectiveCount, 1);
    assert.deepEqual(audit.reachableRoomIds, ['a', 'b']); assert.equal(audit.arrivals.length, 2);
    assert.ok(audit.arrivals.every(arrival => arrival.ok)); assert.deepEqual(input, before);
    assert.ok(audit.issues.every(issue => !['native-active-room-only', 'native-decoration-omitted'].includes(issue.code)));
  });
  test(`${kind}: an objective in a disconnected room cannot complete the journey`, () => {
    const input = project(kind); input.links = [];
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-missing-objective'));
    assert.equal(audit.totalObjectiveCount, 0);
    assert.ok(audit.issues.some(issue => issue.code === 'journey-unreachable-room' && issue.roomId === 'b'));
    assert.throws(() => admittedForgeJourneyV141(input));
  });
  test(`${kind}: a linked door without a fixed landing is refused before launch`, () => {
    const input = project(kind); input.rooms[1].cells = input.rooms[1].cells.filter(cell => cell.type !== 'floor');
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-blocked-arrival'));
  });
  test(`${kind}: a one-way route is warned about and retains its destination objective`, () => {
    const input = project(kind); input.links[0].bidirectional = false;
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.arrivals.length, 1); assert.equal(audit.totalObjectiveCount, 1);
    assert.ok(audit.issues.some(issue => issue.code === 'journey-one-way' && issue.severity === 'warning'));
  });
}

test('admission recompiles canonical rooms rather than trusting legacy size/tiles/validation fields', () => {
  const input = { ...project('mission'), size: [128, 72], tiles: [{ position: '0:0', type: 'hazard' }], validation: { ok: true } };
  const admitted = admittedForgeJourneyV141(input);
  assert.deepEqual(admitted.size, [32, 18]); assert.ok(admitted.tiles.every(tile => tile.type !== 'hazard'));
  assert.equal(admitted.rooms.length, 2); assert.equal(admitted.links.length, 1);
  admitted.rooms[0].name = 'Changed'; assert.equal(input.rooms[0].name, 'Salle a');
  input.rooms[0].cells = input.rooms[0].cells.filter(cell => cell.type !== 'spawn');
  assert.throws(() => admittedForgeJourneyV141(input));
});

test('capacity failures in a later reachable room are no longer hidden by an admissible entry', () => {
  const input = project('mission');
  input.rooms[1].cells.push({ id: 'b-extra-goal', x: 25, y: 15, type: 'objective', layer: 'gameplay' });
  const audit = inspectForgeJourneyV141(input);
  assert.equal(audit.ok, false); assert.ok(has(audit, 'native-objective-capacity'));
  assert.ok(audit.issues.some(issue => issue.code === 'native-objective-capacity' && issue.roomId === 'b'));
});

test('a ship insertion overlapping a standing vent is refused by its compiled body geometry', () => {
  const input = project('ship');
  input.rooms[0].cells.push({ id: 'a-spawn-vent', x: 1, y: 14, type: 'vent', layer: 'gameplay' });
  const audit = inspectForgeJourneyV141(input);
  assert.equal(audit.ok, false); assert.ok(has(audit, 'journey-spawn-vent'));
});

test('invalid link endpoints cannot be admitted through forged successful validation', () => {
  const input = project('ship'); input.links[0].to.cellId = 'b-goal'; input.validation = { ok: true };
  assert.throws(() => inspectForgeJourneyV141(input)); assert.throws(() => admittedForgeJourneyV141(input));
});
for (const kind of ['mission', 'ship']) {
  for (const scenario of ['unsupported', 'unsafe-spawn', 'sealed-objective']) {
    test(`${kind}: an unused secondary insertion reports ${scenario} without vetoing a valid door arrival`, () => {
      const input = project(kind), destination = input.rooms[1];
      destination.cells.push({ id: 'b-unused-spawn', x: 1,
        y: scenario === 'unsupported' ? 8 : 15, type: 'spawn', layer: 'gameplay' });
      if (scenario === 'unsafe-spawn') destination.cells.push({
        id: 'b-unused-spawn-ceiling', x: 1, y: 14, type: 'wall', layer: 'structure'
      });
      if (scenario === 'sealed-objective') {
        destination.cells.find(cell => cell.type === 'door').x = 16;
        destination.cells.push(...Array.from({ length: 16 }, (_, y) => ({
          id: `b-divider-${y}`, x: 10, y, type: 'wall', layer: 'structure'
        })));
      }
      const before = structuredClone(input), audit = inspectForgeJourneyV141(input);
      assert.ok(audit.arrivals.every(arrival => arrival.ok));
      assert.equal(audit.ok, true, audit.errors.join('\n'));
      assert.ok(audit.issues.some(issue => issue.code === scenario
        && issue.roomId === 'b' && issue.severity === 'warning'));
      assert.deepEqual(input, before);
      // That same insertion becomes authoritative when it is the starting room.
      input.activeRoomId = 'b';
      const startingHere = inspectForgeJourneyV141(input);
      assert.equal(startingHere.ok, false);
      assert.ok(has(startingHere, scenario));
    });
  }
  test(`${kind}: a secondary objective sealed from every usable arrival still blocks admission`, () => {
    const input = project(kind), destination = input.rooms[1];
    destination.cells.push({ id: 'b-unused-spawn', x: 1, y: 15, type: 'spawn', layer: 'gameplay' },
      ...Array.from({ length: 16 }, (_, y) => ({
        id: `b-divider-${y}`, x: 10, y, type: 'wall', layer: 'structure'
      })));
    const audit = inspectForgeJourneyV141(input);
    assert.ok(audit.arrivals.every(arrival => arrival.ok));
    assert.equal(audit.ok, false);
    assert.ok(has(audit, 'sealed-objective'));
    assert.throws(() => admittedForgeJourneyV141(input));
    // A second usable incoming door reaches the objective's side of the wall.
    input.rooms[0].cells.push({ id: 'a-second-door', x: 12, y: 15, type: 'door', layer: 'gameplay' });
    destination.cells.push({ id: 'b-second-door', x: 16, y: 15, type: 'door', layer: 'gameplay' });
    input.links.push({ id: 'ab-second', from: { roomId: 'a', cellId: 'a-second-door' },
      to: { roomId: 'b', cellId: 'b-second-door' }, bidirectional: true });
    const accessible = inspectForgeJourneyV141(input);
    assert.equal(accessible.ok, true, accessible.errors.join('\n'));
    assert.ok(!has(accessible, 'sealed-objective'));
  });
}

function objectiveFork(kind) {
  const input = project(kind);
  input.rooms.push(room('c', { goal: true }));
  input.rooms[0].cells.push({ id: 'a-branch-c', x: 12, y: 15, type: 'door', layer: 'gameplay' });
  input.links[0].bidirectional = false;
  input.links.push({ id: 'ac', from: { roomId: 'a', cellId: 'a-branch-c' },
    to: { roomId: 'c', cellId: 'c-door' }, bidirectional: false });
  return input;
}

function narrativeReward(input, roomId, objectiveId) {
  const terminal = { id: `${roomId}-story`, x: 25, y: 15, type: 'terminal', layer: 'gameplay',
    narrative: { schema: 1, title: 'Rapport de secteur', start: 'briefing', nodes: [
      { id: 'briefing', text: 'Valider le rapport du secteur.', choices: [
        { id: 'grant', label: 'Transmettre', next: null, rewardObjectiveId: objectiveId }
      ] }
    ] } };
  input.rooms.find(room => room.id === roomId).cells.push(terminal);
  return terminal;
}

for (const kind of ['mission', 'ship']) {
  test(`${kind}: mutually exclusive one-way objectives are rejected before launching a deadlocked journey`, () => {
    const input = objectiveFork(kind), before = structuredClone(input);
    const session = createForgeSessionV141(input);
    // Both exits are already refused by the production transition contract:
    // neither remaining objective can be visited after taking the other branch.
    assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), ['c-goal']);
    assert.deepEqual(blockedForgeObjectivesV141(session, 'c'), ['b-goal']);
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, false);
    assert.ok(has(audit, 'journey-objective-route-conflict'));
    assert.throws(() => admittedForgeJourneyV141(input), /objectifs/i);
    assert.deepEqual(input, before);
  });

  test(`${kind}: a return passage lets both objective branches be completed`, () => {
    const input = objectiveFork(kind);
    input.links[0].bidirectional = true;
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.ok(!has(audit, 'journey-objective-route-conflict'));
    assert.deepEqual(blockedForgeObjectivesV141(createForgeSessionV141(input), 'b'), []);
  });

  test(`${kind}: a directed path between objective branches is valid independently of room order`, () => {
    const input = objectiveFork(kind);
    for (const id of ['b', 'c']) input.rooms.find(room => room.id === id).cells.push({
      id: `${id}-bridge`, x: 12, y: 15, type: 'door', layer: 'gameplay'
    });
    input.links.push({ id: 'bc', from: { roomId: 'b', cellId: 'b-bridge' },
      to: { roomId: 'c', cellId: 'c-bridge' }, bidirectional: false });
    input.rooms.reverse();
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    const session = createForgeSessionV141(input);
    assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), []);
    assert.deepEqual(blockedForgeObjectivesV141(session, 'c'), ['b-goal']);
  });

  test(`${kind}: an unreachable side objective does not veto the playable main route`, () => {
    const input = objectiveFork(kind);
    input.links = [input.links[0]];
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.totalObjectiveCount, 1);
    assert.ok(audit.issues.some(issue => issue.code === 'journey-unreachable-room' && issue.roomId === 'c'));
  });

  test(`${kind}: a reachable narrative reward can resolve an otherwise exclusive objective branch`, () => {
    const input = objectiveFork(kind), terminal = narrativeReward(input, 'a', 'c-goal');
    const audit = inspectForgeJourneyV141(input);
    assert.equal(audit.ok, true, audit.errors.join('\n'));
    assert.equal(audit.totalObjectiveCount, 2);
    const session = createForgeSessionV141(input);
    assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), ['c-goal']);
    assert.ok(openForgeNarrativeV156(session, terminal.id));
    assert.equal(chooseForgeNarrativeV156(session, terminal.id, 'grant').ok, true);
    assert.deepEqual(session.completedObjectives, ['c-goal']);
    assert.deepEqual(blockedForgeObjectivesV141(session, 'b'), []);
  });

  test(`${kind}: rewards in a local branch or an unlinked draft page do not conceal an impossible fork`, () => {
    const local = objectiveFork(kind);
    narrativeReward(local, 'c', 'c-goal');
    assert.ok(has(inspectForgeJourneyV141(local), 'journey-objective-route-conflict'));
    const draft = objectiveFork(kind), terminal = narrativeReward(draft, 'a', 'c-goal');
    terminal.narrative.nodes.push({ id: 'draft', text: 'Rapport en préparation.',
      choices: terminal.narrative.nodes[0].choices });
    terminal.narrative.nodes[0].choices = [];
    assert.ok(has(inspectForgeJourneyV141(draft), 'journey-objective-route-conflict'));
  });
}

